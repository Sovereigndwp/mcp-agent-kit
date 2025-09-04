/**
 * Intelligent Caching System
 * Implements smart caching strategies with TTL, LRU eviction, and cache warming
 */

import { logger } from '../utils/logger.js';

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  checkInterval: number;
  enableMetrics: boolean;
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags?: string[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  size: number;
  hitRate: number;
}

export class IntelligentCache {
  private cache = new Map<string, CacheItem>();
  private accessOrder: string[] = []; // For LRU tracking
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 30 * 60 * 1000, // 30 minutes
      checkInterval: 60 * 1000, // 1 minute
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      size: 0,
      hitRate: 0
    };

    this.startCleanupTimer();
    logger.info('Intelligent cache initialized', { config: this.config });
  }

  /**
   * Get value from cache with intelligent access tracking
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      this.metrics.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Check if expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.metrics.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Update access information
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.updateAccessOrder(key);
    
    this.metrics.hits++;
    this.updateHitRate();
    
    return item.value;
  }

  /**
   * Set value in cache with intelligent eviction
   */
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): void {
    // Remove existing item if present
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags
    };

    this.cache.set(key, item);
    this.accessOrder.push(key);
    
    this.metrics.sets++;
    this.metrics.size = this.cache.size;
    
    logger.debug('Cache item set', { key, ttl: item.ttl, tags });
  }

  /**
   * Check if a key exists in cache (without affecting access order)
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.metrics.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear cache by tags
   */
  clearByTag(tag: string): number {
    let cleared = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags && item.tags.includes(tag)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleared++;
      }
    }
    
    this.metrics.size = this.cache.size;
    logger.info('Cache cleared by tag', { tag, cleared });
    
    return cleared;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.metrics.size = 0;
    logger.info('Cache cleared completely');
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    averageAge: number;
    topKeys: Array<{ key: string; accessCount: number; age: number }>;
  } {
    const now = Date.now();
    const items = Array.from(this.cache.values());
    
    const totalAge = items.reduce((sum, item) => sum + (now - item.timestamp), 0);
    const averageAge = items.length > 0 ? totalAge / items.length : 0;
    
    const topKeys = items
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(item => ({
        key: item.key,
        accessCount: item.accessCount,
        age: now - item.timestamp
      }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.metrics.hitRate,
      averageAge,
      topKeys
    };
  }

  /**
   * Warm cache with commonly used data
   */
  async warmCache(warmupFunction: () => Promise<Array<{ key: string; value: any; ttl?: number; tags?: string[] }>>): Promise<void> {
    logger.info('Starting cache warm-up');
    
    try {
      const warmupData = await warmupFunction();
      
      for (const { key, value, ttl, tags } of warmupData) {
        this.set(key, value, ttl, tags);
      }
      
      logger.info('Cache warm-up completed', { items: warmupData.length });
    } catch (error) {
      logger.error('Cache warm-up failed', { error });
    }
  }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number,
    tags?: string[]
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    try {
      const value = await fetchFunction();
      this.set(key, value, ttl, tags);
      return value;
    } catch (error) {
      logger.error('Failed to fetch data for cache', { key, error });
      throw error;
    }
  }

  /**
   * Batch operations for efficiency
   */
  mget<T>(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();
    
    for (const key of keys) {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    
    return result;
  }

  mset<T>(items: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>): void {
    for (const { key, value, ttl, tags } of items) {
      this.set(key, value, ttl, tags);
    }
  }

  /**
   * Cleanup expired items
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item, now)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleaned++;
      }
    }
    
    this.metrics.size = this.cache.size;
    
    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { cleaned });
    }
    
    return cleaned;
  }

  /**
   * Shutdown cache and cleanup
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    this.clear();
    logger.info('Cache shutdown completed');
  }

  // Private methods
  private isExpired(item: CacheItem, now: number = Date.now()): boolean {
    return (now - item.timestamp) > item.ttl;
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length === 0) return;
    
    const keyToEvict = this.accessOrder[0];
    this.cache.delete(keyToEvict);
    this.accessOrder.shift();
    
    this.metrics.evictions++;
    
    logger.debug('LRU eviction performed', { evicted: keyToEvict });
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.checkInterval);
  }
}

// Global cache instance
export const globalCache = new IntelligentCache({
  maxSize: 1000,
  defaultTtl: 30 * 60 * 1000, // 30 minutes
  checkInterval: 60 * 1000, // 1 minute
  enableMetrics: true
});

// Bitcoin-specific cache with shorter TTL for live data
export const bitcoinCache = new IntelligentCache({
  maxSize: 500,
  defaultTtl: 5 * 60 * 1000, // 5 minutes for Bitcoin data
  checkInterval: 30 * 1000, // 30 seconds
  enableMetrics: true
});

// Design assets cache with longer TTL
export const designCache = new IntelligentCache({
  maxSize: 200,
  defaultTtl: 2 * 60 * 60 * 1000, // 2 hours for design assets
  checkInterval: 10 * 60 * 1000, // 10 minutes
  enableMetrics: true
});
