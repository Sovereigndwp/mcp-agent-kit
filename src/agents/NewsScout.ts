import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { httpClient } from '../utils/http.js';
import Parser from 'rss-parser';

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
}

export interface NewsAnalysis {
  items: NewsItem[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
  };
  trends: string[];
  summary: string;
  timestamp: number;
}

export class NewsScout {
  private parser: Parser;
  private defaultFeeds: string[] = [
    'https://bitcoinmagazine.com/.rss/full/',
    'https://cointelegraph.com/rss',
    'https://decrypt.co/feed',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://www.theblock.co/rss.xml'
  ];

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'MCP-Agent-Kit/1.0.0'
      }
    });
  }

  /**
   * Get latest Bitcoin news headlines
   */
  async getLatestHeadlines(query?: string, limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `news_headlines_${query || 'all'}_${limit}`;
    const cached = cacheStore.get<NewsItem[]>(cacheKey);
    
    // Return cached headlines if they're less than 5 minutes old
    if (cached && Date.now() - (cacheStore.get<number>(`${cacheKey}_timestamp`) || 0) < 300000) {
      return cached;
    }

    try {
      const feeds = this.getFeeds();
      const allItems: NewsItem[] = [];

      for (const feedUrl of feeds) {
        try {
          const feed = await this.parser.parseURL(feedUrl);
          const items = feed.items
            .filter(item => this.isBitcoinRelated(item.title + ' ' + item.content))
            .map(item => ({
              title: item.title || '',
              description: item.contentSnippet || item.content || '',
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              source: feed.title || new URL(feedUrl).hostname,
            }))
            .slice(0, Math.ceil(limit / feeds.length));

          allItems.push(...items);
        } catch (error) {
          logger.warn(`Failed to fetch feed ${feedUrl}:`, error);
        }
      }

      // Sort by publication date and limit results
      const sortedItems = allItems
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, limit);

      // Filter by query if provided
      const filteredItems = query 
        ? sortedItems.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          )
        : sortedItems;

      // Cache the result
      cacheStore.set(cacheKey, filteredItems, 300); // 5 minutes TTL
      cacheStore.set(`${cacheKey}_timestamp`, Date.now(), 300);

      return filteredItems;
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
    const cacheKey = `news_sentiment_${items.length}_${Date.now()}`;
    const cached = cacheStore.get<NewsAnalysis>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Simple sentiment analysis based on keywords
      const positiveKeywords = [
        'bullish', 'surge', 'rally', 'gain', 'up', 'positive', 'growth', 'adoption',
        'institutional', 'investment', 'breakthrough', 'innovation', 'success'
      ];
      
      const negativeKeywords = [
        'bearish', 'crash', 'drop', 'fall', 'down', 'negative', 'decline', 'sell-off',
        'regulation', 'ban', 'hack', 'scam', 'failure', 'risk'
      ];

      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      const trends: string[] = [];

      const analyzedItems = items.map(item => {
        const text = (item.title + ' ' + item.description).toLowerCase();
        const positiveMatches = positiveKeywords.filter(keyword => text.includes(keyword));
        const negativeMatches = negativeKeywords.filter(keyword => text.includes(keyword));

        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        
        if (positiveMatches.length > negativeMatches.length) {
          sentiment = 'positive';
          positiveCount++;
        } else if (negativeMatches.length > positiveMatches.length) {
          sentiment = 'negative';
          negativeCount++;
        } else {
          neutralCount++;
        }

        // Extract potential trends
        const keywords = this.extractKeywords(text);
        trends.push(...keywords);

        return {
          ...item,
          sentiment,
          keywords
        };
      });

      // Calculate overall sentiment
      const total = items.length;
      const overallSentiment = positiveCount > negativeCount ? 'positive' 
        : negativeCount > positiveCount ? 'negative' 
        : 'neutral';

      // Generate summary
      const summary = this.generateSummary(analyzedItems, overallSentiment);

      const analysis: NewsAnalysis = {
        items: analyzedItems,
        sentiment: {
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount,
          overall: overallSentiment
        },
        trends: [...new Set(trends)].slice(0, 10), // Remove duplicates and limit
        summary,
        timestamp: Date.now()
      };

      // Cache the result
      cacheStore.set(cacheKey, analysis, 600); // 10 minutes TTL

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze sentiment:', error);
      throw new Error('Unable to analyze news sentiment');
    }
  }

  /**
   * Detect trends in Bitcoin news
   */
  async detectTrends(timeframe: string = '24h'): Promise<{
    trends: string[];
    topStories: NewsItem[];
    sentiment: string;
  }> {
    const cacheKey = `news_trends_${timeframe}`;
    const cached = cacheStore.get<any>(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 1800000) { // 30 minutes
      return cached;
    }

    try {
      const headlines = await this.getLatestHeadlines(undefined, 50);
      const analysis = await this.analyzeSentiment(headlines);

      const result = {
        trends: analysis.trends,
        topStories: analysis.items.slice(0, 5),
        sentiment: analysis.sentiment.overall,
        timestamp: Date.now()
      };

      // Cache the result
      cacheStore.set(cacheKey, result, 1800); // 30 minutes TTL

      return result;
    } catch (error) {
      logger.error('Failed to detect trends:', error);
      throw new Error('Unable to detect news trends');
    }
  }

  /**
   * Process agent requests
   */
  async process(args: any): Promise<any> {
    const { action, query } = args;

    switch (action) {
      case 'get_latest_headlines':
        return await this.getLatestHeadlines(query, 10);
      
      case 'analyze_sentiment':
        const headlines = await this.getLatestHeadlines(query, 20);
        return await this.analyzeSentiment(headlines);
      
      case 'detect_trends':
        return await this.detectTrends('24h');
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Get configured RSS feeds
   */
  private getFeeds(): string[] {
    const envFeeds = process.env.RSS_FEEDS;
    if (envFeeds) {
      return envFeeds.split(',').map(feed => feed.trim());
    }
    return this.defaultFeeds;
  }

  /**
   * Check if content is Bitcoin-related
   */
  private isBitcoinRelated(text: string): boolean {
    const bitcoinKeywords = [
      'bitcoin', 'btc', 'crypto', 'blockchain', 'satoshi', 'lightning',
      'mempool', 'halving', 'mining', 'wallet', 'exchange'
    ];
    
    const lowerText = text.toLowerCase();
    return bitcoinKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return words.filter(word => !stopWords.has(word)).slice(0, 5);
  }

  /**
   * Generate summary of news analysis
   */
  private generateSummary(items: NewsItem[], overallSentiment: string): string {
    const totalItems = items.length;
    const positiveItems = items.filter(item => item.sentiment === 'positive').length;
    const negativeItems = items.filter(item => item.sentiment === 'negative').length;
    
    const topTopics = this.extractKeywords(
      items.map(item => item.title).join(' ')
    ).slice(0, 3);

    return `Analysis of ${totalItems} Bitcoin news items shows ${overallSentiment} sentiment. ` +
           `${positiveItems} positive, ${negativeItems} negative stories. ` +
           `Top topics: ${topTopics.join(', ')}.`;
  }
}
