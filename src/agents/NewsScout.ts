import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { rssFetchTool, RSSItem } from '../tools/rss_fetch.js';
import { sentimentAnalysisTool } from '../tools/sentiment_analysis.js';

export interface NewsItem extends RSSItem {
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  keywords?: string[];
  source: string;
}

export interface NewsAnalysis {
  items: NewsItem[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
    average_score: number;
  };
  trends: string[];
  summary: string;
  timestamp: number;
}

export class NewsScout {
  private defaultFeeds: string[] = [
    'https://bitcoinmagazine.com/.rss/full/',
    'https://bitcoinops.org/feed.xml',
    'https://blog.blockstream.com/rss/',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://decrypt.co/feed'
  ];

  constructor() {
    logger.info('Initializing NewsScout with RSS and sentiment analysis');
  }

  /**
   * Get latest Bitcoin news headlines
   */
  async getLatestHeadlines(query?: string, limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `news_headlines_${query || 'all'}_${limit}`;
    const cached = cacheStore.get<NewsItem[]>(cacheKey);
    
    // Return cached headlines if they're less than 5 minutes old
    if (cached) {
      logger.info(`Returning cached headlines for query: ${query || 'all'}`);
      return cached;
    }

    try {
      logger.info(`Fetching latest Bitcoin headlines, limit: ${limit}`);
      
      // Use our Bitcoin news aggregation
      const items = await rssFetchTool.fetchBitcoinNews(limit * 2); // Fetch more to filter
      
      // Convert to NewsItem format and filter
      const newsItems: NewsItem[] = items.map(item => ({
        ...item,
        source: this.extractSourceName(item.link || ''),
      })).filter(item => 
        this.isBitcoinRelated(item.title + ' ' + (item.description || ''))
      );

      // Filter by query if provided
      const filteredItems = query 
        ? newsItems.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(query.toLowerCase())
          )
        : newsItems;

      const limitedItems = filteredItems.slice(0, limit);

      // Cache the result
      cacheStore.set(cacheKey, limitedItems, 5 * 60 * 1000); // 5 minutes TTL

      logger.info(`Fetched ${limitedItems.length} Bitcoin headlines`);
      return limitedItems;
      
    } catch (error) {
      logger.error('Failed to fetch latest headlines:', error);
      
      if (cached) {
        logger.warn('Using cached headlines due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch latest headlines');
    }
  }

  /**
   * Analyze sentiment of news items
   */
  async analyzeSentiment(items: NewsItem[]): Promise<NewsAnalysis> {
    const cacheKey = `news_sentiment_${this.hashItems(items)}`;
    const cached = cacheStore.get<NewsAnalysis>(cacheKey);
    
    if (cached) {
      logger.info('Returning cached sentiment analysis');
      return cached;
    }

    try {
      logger.info(`Analyzing sentiment for ${items.length} news items`);

      // Prepare texts for sentiment analysis
      const texts = items.map(item => `${item.title} ${item.description || ''}`);
      
      // Perform batch sentiment analysis
      const sentimentResult = await sentimentAnalysisTool.analyzeBatchSentiment(texts);
      
      // Enhance items with sentiment data
      const analyzedItems: NewsItem[] = items.map((item, index) => {
        const sentiment = sentimentResult.individual[index];
        return {
          ...item,
          sentiment: sentiment.label,
          sentiment_score: sentiment.score,
          keywords: [...sentiment.keywords.positive, ...sentiment.keywords.negative]
        };
      });

      // Extract trending topics
      const trends = this.extractTrends(analyzedItems);

      // Generate summary
      const summary = this.generateSummary(analyzedItems, sentimentResult.overall.label);

      const analysis: NewsAnalysis = {
        items: analyzedItems,
        sentiment: {
          positive: sentimentResult.summary.positive_count,
          negative: sentimentResult.summary.negative_count,
          neutral: sentimentResult.summary.neutral_count,
          overall: sentimentResult.overall.label,
          average_score: sentimentResult.summary.average_score
        },
        trends,
        summary,
        timestamp: Date.now()
      };

      // Cache the result for 10 minutes
      cacheStore.set(cacheKey, analysis, 10 * 60 * 1000);

      logger.info(`Sentiment analysis complete. Overall: ${analysis.sentiment.overall}`);
      return analysis;
      
    } catch (error) {
      logger.error('Failed to analyze sentiment:', error);
      throw new Error('Unable to analyze news sentiment');
    }
  }

  /**
   * Get comprehensive news analysis with headlines and sentiment
   */
  async getNewsAnalysis(query?: string, limit: number = 20): Promise<NewsAnalysis> {
    try {
      const headlines = await this.getLatestHeadlines(query, limit);
      return await this.analyzeSentiment(headlines);
    } catch (error) {
      logger.error('Failed to get news analysis:', error);
      throw error;
    }
  }

  /**
   * Get trending Bitcoin topics from recent news
   */
  async getTrendingTopics(hours: number = 24): Promise<{ topic: string; count: number; sentiment: string }[]> {
    try {
      const trends = await rssFetchTool.getTrendingTopics(hours);
      return trends.map(trend => ({
        ...trend,
        sentiment: 'neutral' // Default sentiment, could be enhanced with per-topic sentiment analysis
      }));
    } catch (error) {
      logger.error('Failed to get trending topics:', error);
      return [];
    }
  }

  /**
   * Monitor sentiment changes over time
   */
  async getSentimentTrends(hours: number = 24): Promise<{
    trend: 'improving' | 'declining' | 'stable';
    current_score: number;
    change: number;
    summary: string;
  }> {
    try {
      const items = await this.getLatestHeadlines(undefined, 50);
      const now = Date.now();
      
      // Group items by time period
      const timestampedData = items.map(item => ({
        text: `${item.title} ${item.description || ''}`,
        timestamp: new Date(item.pubDate || now).getTime()
      }));
      
      const trends = await sentimentAnalysisTool.analyzeSentimentTrends(timestampedData, hours * 60 * 60 * 1000);
      
      const summary = `Sentiment is ${trends.trend} with a ${trends.change >= 0 ? 'positive' : 'negative'} change of ${Math.abs(trends.change).toFixed(2)} points over the last ${hours} hours.`;
      
      return {
        trend: trends.trend,
        current_score: trends.current_sentiment.score,
        change: trends.change,
        summary
      };
      
    } catch (error) {
      logger.error('Failed to get sentiment trends:', error);
      return {
        trend: 'stable',
        current_score: 0,
        change: 0,
        summary: 'Unable to determine sentiment trends due to insufficient data.'
      };
    }
  }

  private isBitcoinRelated(text: string): boolean {
    const bitcoinKeywords = [
      'bitcoin', 'btc', 'cryptocurrency', 'crypto', 'blockchain', 
      'satoshi', 'mining', 'miners', 'hash', 'halving',
      'lightning', 'taproot', 'segwit', 'mempool', 'node'
    ];
    
    const lowerText = text.toLowerCase();
    return bitcoinKeywords.some(keyword => lowerText.includes(keyword));
  }

  private extractTrends(items: NewsItem[]): string[] {
    const trendMap: { [key: string]: number } = {};
    
    items.forEach(item => {
      const keywords = item.keywords || [];
      keywords.forEach(keyword => {
        if (keyword.length > 3) { // Filter short words
          trendMap[keyword] = (trendMap[keyword] || 0) + 1;
        }
      });
      
      // Also extract from titles
      const titleWords = item.title.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      titleWords.forEach(word => {
        if (this.isRelevantTrend(word)) {
          trendMap[word] = (trendMap[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(trendMap)
      .filter(([_, count]) => count >= 2) // Must appear at least twice
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([trend]) => trend);
  }

  private isRelevantTrend(word: string): boolean {
    const commonWords = ['bitcoin', 'crypto', 'news', 'market', 'price', 'trading', 'today', 'this', 'that', 'will', 'with', 'from'];
    return !commonWords.includes(word) && word.length > 3;
  }

  private generateSummary(items: NewsItem[], overallSentiment: 'positive' | 'negative' | 'neutral'): string {
    const total = items.length;
    const positive = items.filter(item => item.sentiment === 'positive').length;
    const negative = items.filter(item => item.sentiment === 'negative').length;
    
    let summary = `Analysis of ${total} recent Bitcoin news articles shows `;
    
    if (overallSentiment === 'positive') {
      summary += `predominantly positive sentiment (${positive} positive, ${negative} negative). `;
      summary += 'Bitcoin news coverage is generally optimistic with bullish indicators and positive developments.';
    } else if (overallSentiment === 'negative') {
      summary += `predominantly negative sentiment (${negative} negative, ${positive} positive). `;
      summary += 'Bitcoin news coverage shows concerns with bearish indicators and challenging developments.';
    } else {
      summary += `neutral sentiment (${positive} positive, ${negative} negative). `;
      summary += 'Bitcoin news coverage is balanced with mixed signals and varied perspectives.';
    }
    
    return summary;
  }

  private extractSourceName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      const sourceName = domain.replace('www.', '').split('.')[0];
      return sourceName.charAt(0).toUpperCase() + sourceName.slice(1);
    } catch {
      return 'Unknown';
    }
  }

  private hashItems(items: NewsItem[]): string {
    const itemIds = items.map(item => item.title + item.pubDate).join('');
    let hash = 0;
    for (let i = 0; i < itemIds.length; i++) {
      const char = itemIds.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }


  /**
   * Legacy method for backward compatibility
   */
  async process(args: any): Promise<any> {
    const action = args?.action || 'headlines';
    const query = args?.query;
    const limit = args?.limit || 10;

    try {
      switch (action) {
        case 'headlines':
          const headlines = await this.getLatestHeadlines(query, limit);
          return {
            headlines,
            count: headlines.length,
            status: 'success'
          };
          
        case 'sentiment':
          const analysis = await this.getNewsAnalysis(query, limit);
          return {
            ...analysis,
            status: 'success'
          };
          
        case 'trends':
          const trends = await this.getTrendingTopics(args?.hours || 24);
          return {
            trends,
            status: 'success'
          };
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'News analysis failed',
        status: 'error'
      };
    }
  }
}