import { httpClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  author?: string;
  category?: string[];
  content?: string;
  guid?: string;
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate?: string;
  items: RSSItem[];
}

export interface ParsedRSSResponse {
  feed: RSSFeed;
  items: RSSItem[];
  totalItems: number;
}

export class RSSFetchTool {
  /**
   * Fetch and parse RSS feed from a URL
   */
  async fetchRSSFeed(url: string, limit: number = 10): Promise<RSSItem[]> {
    const cacheKey = `rss_feed_${this.hashUrl(url)}_${limit}`;
    const cached = cacheStore.get<RSSItem[]>(cacheKey);
    
    // Return cached results if less than 15 minutes old
    if (cached) {
      logger.info(`Returning cached RSS feed for ${url}`);
      return cached;
    }

    try {
      logger.info(`Fetching RSS feed from ${url}`);
      
      const response = await httpClient.get<string>(url, {
        headers: {
          'User-Agent': 'MCP-Agent-Kit RSS Reader 1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        timeout: 10000
      });

      const parsedFeed = this.parseRSSXML(response);
      const limitedItems = parsedFeed.items.slice(0, limit);
      
      // Cache for 15 minutes
      cacheStore.set(cacheKey, limitedItems, 15 * 60 * 1000);
      
      logger.info(`Successfully fetched ${limitedItems.length} items from RSS feed`);
      return limitedItems;

    } catch (error) {
      logger.error(`Failed to fetch RSS feed from ${url}:`, error);
      throw new Error(`RSS fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch RSS feed with full metadata
   */
  async fetchFullRSSFeed(url: string, limit: number = 10): Promise<ParsedRSSResponse> {
    const cacheKey = `rss_full_${this.hashUrl(url)}_${limit}`;
    const cached = cacheStore.get<ParsedRSSResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await httpClient.get<string>(url, {
        headers: {
          'User-Agent': 'MCP-Agent-Kit RSS Reader 1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        timeout: 10000
      });

      const parsed = this.parseRSSXML(response);
      const result: ParsedRSSResponse = {
        feed: parsed,
        items: parsed.items.slice(0, limit),
        totalItems: parsed.items.length
      };
      
      cacheStore.set(cacheKey, result, 15 * 60 * 1000);
      return result;

    } catch (error) {
      logger.error(`Failed to fetch full RSS feed from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get Bitcoin-specific news from multiple sources
   */
  async fetchBitcoinNews(limit: number = 20): Promise<RSSItem[]> {
    const bitcoinSources = [
      'https://bitcoinops.org/feed.xml',
      'https://bitcoin.org/en/rss/alerts.xml',
      'https://blog.blockstream.com/rss/',
      'https://medium.com/feed/@bitcoinmagazine'
    ];

    const allItems: RSSItem[] = [];
    const itemsPerSource = Math.ceil(limit / bitcoinSources.length);

    for (const source of bitcoinSources) {
      try {
        const items = await this.fetchRSSFeed(source, itemsPerSource);
        allItems.push(...items.map(item => ({
          ...item,
          source: this.getDomainFromUrl(source)
        })));
      } catch (error) {
        logger.warn(`Failed to fetch from ${source}, continuing with other sources`);
      }
    }

    // Sort by date (newest first) and limit results
    return allItems
      .sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  private parseRSSXML(xmlString: string): RSSFeed {
    // Simple XML parser for RSS - in production, consider using a robust XML parser
    const feed: RSSFeed = {
      title: this.extractXMLValue(xmlString, 'title') || 'Unknown Feed',
      description: this.extractXMLValue(xmlString, 'description') || '',
      link: this.extractXMLValue(xmlString, 'link') || '',
      lastBuildDate: this.extractXMLValue(xmlString, 'lastBuildDate'),
      items: []
    };

    // Extract items
    const itemMatches = xmlString.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
    
    feed.items = itemMatches.map(itemXML => {
      const item: RSSItem = {
        title: this.extractXMLValue(itemXML, 'title') || 'Untitled',
        link: this.extractXMLValue(itemXML, 'link') || '',
        description: this.extractXMLValue(itemXML, 'description'),
        pubDate: this.extractXMLValue(itemXML, 'pubDate'),
        author: this.extractXMLValue(itemXML, 'author') || this.extractXMLValue(itemXML, 'dc:creator'),
        guid: this.extractXMLValue(itemXML, 'guid'),
        content: this.extractXMLValue(itemXML, 'content:encoded')
      };

      // Extract categories
      const categoryMatches = itemXML.match(/<category[^>]*>([^<]*)<\/category>/gi);
      if (categoryMatches) {
        item.category = categoryMatches.map(cat => 
          cat.replace(/<\/?[^>]+(>|$)/g, '').trim()
        );
      }

      return item;
    });

    return feed;
  }

  private extractXMLValue(xml: string, tagName: string): string | undefined {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    if (match && match[1]) {
      return this.decodeHTML(match[1].trim());
    }
    
    // Try self-closing tag
    const selfClosingRegex = new RegExp(`<${tagName}[^>]*/>`, 'i');
    const selfMatch = xml.match(selfClosingRegex);
    if (selfMatch) {
      const contentMatch = selfMatch[0].match(/content=["']([^"']*)["']/i);
      return contentMatch ? this.decodeHTML(contentMatch[1]) : undefined;
    }
    
    return undefined;
  }

  private decodeHTML(str: string): string {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' '
    };
    
    return str.replace(/&[^;]+;/g, entity => entities[entity] || entity);
  }

  private hashUrl(url: string): string {
    // Simple hash function for URL caching
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url.split('/')[2] || url;
    }
  }

  /**
   * Get trending Bitcoin topics from RSS feeds
   */
  async getTrendingTopics(hours: number = 24): Promise<{ topic: string; count: number; sources: string[] }[]> {
    try {
      const items = await this.fetchBitcoinNews(50);
      const cutoffDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
      
      // Filter recent items
      const recentItems = items.filter(item => {
        if (!item.pubDate) return true;
        return new Date(item.pubDate) > cutoffDate;
      });

      // Extract keywords from titles and descriptions
      const topicCounts: { [topic: string]: { count: number; sources: Set<string> } } = {};
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);

      recentItems.forEach(item => {
        const text = `${item.title} ${item.description || ''}`.toLowerCase();
        const words = text.match(/\b[a-z]{3,}\b/g) || [];
        const source = (item as any).source || 'unknown';
        
        words.forEach(word => {
          if (!commonWords.has(word) && word.length > 2) {
            if (!topicCounts[word]) {
              topicCounts[word] = { count: 0, sources: new Set() };
            }
            topicCounts[word].count++;
            topicCounts[word].sources.add(source);
          }
        });
      });

      // Convert to sorted array
      return Object.entries(topicCounts)
        .map(([topic, data]) => ({
          topic,
          count: data.count,
          sources: Array.from(data.sources)
        }))
        .filter(item => item.count >= 2) // Only topics mentioned multiple times
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    } catch (error) {
      logger.error('Failed to get trending topics:', error);
      return [];
    }
  }
}

export const rssFetchTool = new RSSFetchTool();

// Export convenience functions for backward compatibility
export async function rss_fetch(url: string, limit?: number): Promise<RSSItem[]> {
  return rssFetchTool.fetchRSSFeed(url, limit);
}

export async function fetchBitcoinNews(limit?: number): Promise<RSSItem[]> {
  return rssFetchTool.fetchBitcoinNews(limit);
}