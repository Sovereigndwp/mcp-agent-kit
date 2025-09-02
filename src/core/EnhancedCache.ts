import { logger } from '../utils/logger.js';
import { EventBus } from './EventBus.js';

export interface CacheEntry<T = any> {
  value: T;
  createdAt: number;
  expiresAt?: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
  tags: Set<string>;
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTTL: number; // Default TTL in seconds (0 = no expiration)
  cleanupInterval: number; // Cleanup interval in seconds
  enableMetrics: boolean; // Track cache metrics
  compressionThreshold: number; // Compress entries larger than this (bytes)
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number; // Current cache size in bytes
  entries: number; // Number of entries
  hitRate: number; // Hit rate percentage
}

export interface CachePattern {
  pattern: string;
  type: 'glob' | 'regex' | 'prefix' | 'suffix' | 'contains';
}

export class EnhancedCache {
  private cache: Map<string, CacheEntry> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer?: NodeJS.Timeout;
  private eventBus?: EventBus;
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> keys
  
  constructor(config: Partial<CacheConfig> = {}, eventBus?: EventBus) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB default
      defaultTTL: 3600, // 1 hour default
      cleanupInterval: 300, // 5 minutes
      enableMetrics: true,
      compressionThreshold: 1024, // 1KB
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      entries: 0,
      hitRate: 0
    };

    this.eventBus = eventBus;
    this.startCleanupTimer();
  }

  /**
   * Set a value in the cache
   */
  async set<T = any>(
    key: string, 
    value: T, 
    options: {
      ttl?: number;
      tags?: string[];
      compress?: boolean;
    } = {}
  ): Promise<void> {
    const { ttl = this.config.defaultTTL, tags = [], compress = false } = options;
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Calculate entry size (rough estimation)
    const serializedValue = JSON.stringify(value);
    const estimatedSize = Buffer.byteLength(serializedValue, 'utf8');

    // Handle compression if needed
    let finalValue = value;
    if (compress || (this.config.compressionThreshold > 0 && estimatedSize > this.config.compressionThreshold)) {
      // In a real implementation, you'd use a compression library like zlib
      // For now, we'll just flag it
      logger.debug(`Would compress entry ${key} (${estimatedSize} bytes)`);
      finalValue = value; // Placeholder - implement actual compression if needed
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      value: finalValue,
      createdAt: now,
      expiresAt: ttl > 0 ? now + (ttl * 1000) : undefined,
      accessCount: 0,
      lastAccessed: now,
      size: estimatedSize,
      tags: new Set(tags)
    };

    // Check if adding this entry would exceed max size
    if (this.metrics.size + estimatedSize > this.config.maxSize) {
      await this.evictLeastRecentlyUsed(estimatedSize);
    }

    // Store the entry
    this.cache.set(key, entry);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });

    // Set expiration timer if needed
    if (entry.expiresAt) {
      const timeout = setTimeout(() => {
        this.delete(key);
        logger.debug(`Cache entry expired: ${key}`);
      }, ttl * 1000);
      
      this.timers.set(key, timeout);
    }

    // Update metrics
    this.metrics.sets++;
    this.metrics.size += estimatedSize;
    this.metrics.entries++;
    this.updateHitRate();

    // Emit event
    this.eventBus?.emit('cache:set', { key, ttl, tags, size: estimatedSize });

    logger.debug(`Cache set: ${key} (${estimatedSize} bytes, TTL: ${ttl}s)`);
  }

  /**
   * Get a value from the cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      this.eventBus?.emit('cache:miss', { key });
      return null;
    }

    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      this.eventBus?.emit('cache:miss', { key, reason: 'expired' });
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.metrics.hits++;
    this.updateHitRate();
    
    this.eventBus?.emit('cache:hit', { key, accessCount: entry.accessCount });
    
    return entry.value;
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Clear expiration timer
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }

    // Remove from tag index
    entry.tags.forEach(tag => {
      const keySet = this.tagIndex.get(tag);
      if (keySet) {
        keySet.delete(key);
        if (keySet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });

    // Remove from cache
    this.cache.delete(key);

    // Update metrics
    this.metrics.deletes++;
    this.metrics.size -= entry.size;
    this.metrics.entries--;

    this.eventBus?.emit('cache:delete', { key, size: entry.size });
    
    logger.debug(`Cache delete: ${key} (${entry.size} bytes)`);
    return true;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Clear caches and indexes
    this.cache.clear();
    this.tagIndex.clear();

    // Reset metrics
    this.metrics.size = 0;
    this.metrics.entries = 0;

    this.eventBus?.emit('cache:clear', { timestamp: Date.now() });
    logger.info('Cache cleared');
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: CachePattern): Promise<string[]> {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToDelete.push(key);
      }
    }

    // Delete matching keys
    keysToDelete.forEach(key => this.delete(key));

    this.eventBus?.emit('cache:pattern_invalidated', { pattern, count: keysToDelete.length });
    logger.info(`Pattern invalidation: ${pattern.pattern} (${keysToDelete.length} entries)`);

    return keysToDelete;
  }

  /**
   * Invalidate cache entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<string[]> {
    const keysToDelete = new Set<string>();

    tags.forEach(tag => {
      const keySet = this.tagIndex.get(tag);
      if (keySet) {
        keySet.forEach(key => keysToDelete.add(key));
      }
    });

    // Delete keys
    const deletedKeys = Array.from(keysToDelete);
    deletedKeys.forEach(key => this.delete(key));

    this.eventBus?.emit('cache:tags_invalidated', { tags, count: deletedKeys.length });
    logger.info(`Tag invalidation: [${tags.join(', ')}] (${deletedKeys.length} entries)`);

    return deletedKeys;
  }

  /**
   * Get cache statistics and metrics
   */
  getMetrics(): CacheMetrics {
    this.updateHitRate();
    return { ...this.metrics };
  }

  /**
   * Get cache entries for debugging
   */
  getEntries(): Array<{ key: string; entry: CacheEntry }> {
    const entries: Array<{ key: string; entry: CacheEntry }> = [];
    
    for (const [key, entry] of this.cache) {
      entries.push({ 
        key, 
        entry: {
          ...entry,
          tags: new Set(entry.tags) // Clone the Set
        }
      });
    }

    return entries;
  }

  /**
   * Get keys by tag
   */
  getKeysByTag(tag: string): string[] {
    const keySet = this.tagIndex.get(tag);
    return keySet ? Array.from(keySet) : [];
  }

  /**
   * Update TTL for an existing entry
   */
  updateTTL(key: string, newTTL: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }

    // Set new expiration
    const now = Date.now();
    entry.expiresAt = newTTL > 0 ? now + (newTTL * 1000) : undefined;

    // Set new timer if needed
    if (entry.expiresAt) {
      const timeout = setTimeout(() => {
        this.delete(key);
        logger.debug(`Cache entry expired: ${key}`);
      }, newTTL * 1000);
      
      this.timers.set(key, timeout);
    }

    logger.debug(`TTL updated for ${key}: ${newTTL}s`);
    return true;
  }

  /**
   * Evict least recently used entries to make room
   */
  private async evictLeastRecentlyUsed(requiredSpace: number): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    let freedSpace = 0;
    const evictedKeys: string[] = [];

    for (const [key, entry] of entries) {
      this.delete(key);
      freedSpace += entry.size;
      evictedKeys.push(key);
      this.metrics.evictions++;

      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    this.eventBus?.emit('cache:evicted', { keys: evictedKeys, freedSpace });
    logger.info(`Evicted ${evictedKeys.length} entries (${freedSpace} bytes)`);
  }

  /**
   * Check if a key matches a pattern
   */
  private matchesPattern(key: string, pattern: CachePattern): boolean {
    switch (pattern.type) {
      case 'glob':
        // Simple glob matching (*, ?)
        const regexPattern = pattern.pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex chars
          .replace(/\*/g, '.*') // * becomes .*
          .replace(/\?/g, '.'); // ? becomes .
        return new RegExp(`^${regexPattern}$`).test(key);
        
      case 'regex':
        return new RegExp(pattern.pattern).test(key);
        
      case 'prefix':
        return key.startsWith(pattern.pattern);
        
      case 'suffix':
        return key.endsWith(pattern.pattern);
        
      case 'contains':
        return key.includes(pattern.pattern);
        
      default:
        return false;
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    let freedSpace = 0;

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        freedSpace += entry.size;
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.eventBus?.emit('cache:cleanup', { cleanedCount, freedSpace });
      logger.debug(`Cache cleanup: removed ${cleanedCount} expired entries (${freedSpace} bytes)`);
    }
  }

  /**
   * Shutdown the cache and cleanup resources
   */
  async shutdown(): Promise<void> {
    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Clear all expiration timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    // Clear all data
    this.clear();

    this.eventBus?.emit('cache:shutdown', { timestamp: Date.now() });
    logger.info('Cache shutdown completed');
  }
}

// Singleton instance for global use
export const enhancedCache = new EnhancedCache();
