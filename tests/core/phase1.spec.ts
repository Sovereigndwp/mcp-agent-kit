import { describe, it, expect, beforeEach, afterEach, beforeAll, jest } from '@jest/globals';
import { EventBus } from '../../src/core/EventBus.js';
import { EnhancedCache } from '../../src/core/EnhancedCache.js';
import { PluginManager } from '../../src/core/PluginManager.js';
import { SimpleTaskRouter } from '../../src/router/SimpleTaskRouter.js';

describe('Phase 1 Core Systems', () => {
  
  describe('EventBus', () => {
    let eventBus: EventBus;

    beforeEach(() => {
      eventBus = new EventBus({
        enableMetrics: true,
        maxHistorySize: 100
      });
    });

    afterEach(() => {
      eventBus.clear();
    });

    it('should emit and receive events', async () => {
      let receivedData: any = null;
      let receivedMetadata: any = null;

      const listenerId = eventBus.subscribe('test:event', (data, metadata) => {
        receivedData = data;
        receivedMetadata = metadata;
      });

      await eventBus.emit('test:event', { message: 'Hello World' });

      expect(receivedData).toEqual({ message: 'Hello World' });
      expect(receivedMetadata.eventName).toBe('test:event');
      expect(typeof receivedMetadata.timestamp).toBe('number');
      expect(typeof receivedMetadata.correlationId).toBe('string');
    });

    it('should support once listeners', async () => {
      let callCount = 0;

      eventBus.once('test:once', () => {
        callCount++;
      });

      await eventBus.emit('test:once', {});
      await eventBus.emit('test:once', {});

      expect(callCount).toBe(1);
    });

    it('should handle listener priority', async () => {
      const results: number[] = [];

      eventBus.subscribe('test:priority', () => { results.push(1); }, { priority: 1 });
      eventBus.subscribe('test:priority', () => { results.push(3); }, { priority: 3 });
      eventBus.subscribe('test:priority', () => { results.push(2); }, { priority: 2 });

      await eventBus.emit('test:priority', {});

      expect(results).toEqual([3, 2, 1]); // Higher priority first
    });

    it('should support event filters', async () => {
      let callCount = 0;

      eventBus.subscribe('test:filter', () => {
        callCount++;
      }, {
        filter: (data) => data.shouldProcess === true
      });

      await eventBus.emit('test:filter', { shouldProcess: false });
      await eventBus.emit('test:filter', { shouldProcess: true });

      expect(callCount).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      const errorHandler = jest.fn();
      eventBus.setGlobalErrorHandler(errorHandler);

      eventBus.subscribe('test:error', () => {
        throw new Error('Test error');
      });

      await eventBus.emit('test:error', {});

      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        'test:error',
        expect.any(Object)
      );
    });

    it('should track metrics', async () => {
      eventBus.subscribe('test:metrics', () => {});

      await eventBus.emit('test:metrics', {});

      const metrics = eventBus.getMetrics();
      expect(metrics.totalEvents).toBe(1);
      expect(metrics.totalListeners).toBe(1);
    });

    it('should support namespaced events', async () => {
      const namespacedBus = eventBus.namespace('test-namespace');
      let received = false;

      namespacedBus.subscribe('event', () => {
        received = true;
      });

      await namespacedBus.emit('event', {});

      expect(received).toBe(true);
    });

    it('should wait for events', async () => {
      const eventPromise = eventBus.waitFor('test:wait', 1000);

      setTimeout(() => {
        eventBus.emit('test:wait', { result: 'success' });
      }, 100);

      const { data } = await eventPromise;
      expect(data).toEqual({ result: 'success' });
    });

    it('should handle wait timeout', async () => {
      await expect(
        eventBus.waitFor('test:timeout', 100)
      ).rejects.toThrow('Timeout waiting for event: test:timeout');
    });
  });

  describe('EnhancedCache', () => {
    let cache: EnhancedCache;

    beforeEach(() => {
      cache = new EnhancedCache({
        maxSize: 1024 * 1024, // 1MB
        defaultTTL: 60,
        enableMetrics: true,
        cleanupInterval: 1000
      });
    });

    afterEach(async () => {
      await cache.shutdown();
    });

    it('should set and get values', async () => {
      await cache.set('test:key', { value: 'test' });
      const result = await cache.get('test:key');

      expect(result).toEqual({ value: 'test' });
    });

    it('should handle TTL expiration', async () => {
      await cache.set('test:ttl', 'value', { ttl: 0.1 }); // 100ms

      // Should exist immediately
      expect(await cache.get('test:ttl')).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should be expired
      expect(await cache.get('test:ttl')).toBeNull();
    });

    it('should support tags', async () => {
      await cache.set('key1', 'value1', { tags: ['group1', 'type1'] });
      await cache.set('key2', 'value2', { tags: ['group1', 'type2'] });
      await cache.set('key3', 'value3', { tags: ['group2', 'type1'] });

      const group1Keys = cache.getKeysByTag('group1');
      expect(group1Keys).toHaveLength(2);
      expect(group1Keys).toContain('key1');
      expect(group1Keys).toContain('key2');
    });

    it('should invalidate by tags', async () => {
      await cache.set('key1', 'value1', { tags: ['group1'] });
      await cache.set('key2', 'value2', { tags: ['group1'] });
      await cache.set('key3', 'value3', { tags: ['group2'] });

      await cache.invalidateByTags(['group1']);

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
      expect(await cache.get('key3')).toBe('value3');
    });

    it('should invalidate by pattern', async () => {
      await cache.set('user:123', 'user123');
      await cache.set('user:456', 'user456');
      await cache.set('post:789', 'post789');

      await cache.invalidatePattern({ pattern: 'user:*', type: 'glob' });

      expect(await cache.get('user:123')).toBeNull();
      expect(await cache.get('user:456')).toBeNull();
      expect(await cache.get('post:789')).toBe('post789');
    });

    it('should update TTL', async () => {
      await cache.set('test:ttl-update', 'value', { ttl: 60 });
      
      const updated = cache.updateTTL('test:ttl-update', 120);
      expect(updated).toBe(true);

      // Verify the key still exists
      expect(await cache.get('test:ttl-update')).toBe('value');
    });

    it('should track metrics', async () => {
      await cache.set('key1', 'value1');
      await cache.get('key1'); // hit
      await cache.get('key2'); // miss

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.sets).toBe(1);
      expect(metrics.hitRate).toBe(50); // 50% hit rate
    });

    it('should evict least recently used entries', async () => {
      // Set small max size to trigger eviction
      const smallCache = new EnhancedCache({ maxSize: 100 });

      await smallCache.set('key1', 'a'.repeat(30)); // 30 bytes
      await smallCache.set('key2', 'b'.repeat(30)); // 30 bytes
      await smallCache.set('key3', 'c'.repeat(50)); // 50 bytes (should trigger eviction)

      // key1 should be evicted (least recently used)
      expect(await smallCache.get('key1')).toBeNull();
      expect(await smallCache.get('key2')).toBe('b'.repeat(30));
      expect(await smallCache.get('key3')).toBe('c'.repeat(50));

      await smallCache.shutdown();
    });
  });

  describe('PluginManager', () => {
    let pluginManager: PluginManager;
    let eventBus: EventBus;

    beforeEach(() => {
      eventBus = new EventBus();
      pluginManager = new PluginManager(eventBus);
    });

    afterEach(async () => {
      await pluginManager.cleanup();
      eventBus.clear();
    });

    it('should initialize without plugins', () => {
      expect(pluginManager.getLoadedPlugins()).toHaveLength(0);
      expect(pluginManager.getAllTools().size).toBe(0);
      expect(pluginManager.getAllAgents().size).toBe(0);
    });

    it('should add plugin directories', () => {
      pluginManager.addPluginDirectory('./test-plugins');
      pluginManager.addPluginDirectory('./more-plugins');
      
      // Verify directories were added (internal state, so we test via behavior)
      expect(() => pluginManager.addPluginDirectory('./test-plugins')).not.toThrow();
    });

    it('should get plugin statistics', () => {
      const stats = pluginManager.getStats();
      
      expect(stats.totalPlugins).toBe(0);
      expect(stats.totalTools).toBe(0);
      expect(stats.totalAgents).toBe(0);
      expect(Array.isArray(stats.plugins)).toBe(true);
    });

    it('should handle plugin not found', () => {
      const plugin = pluginManager.getPlugin('non-existent');
      expect(plugin).toBeUndefined();
    });

    // Note: Testing actual plugin loading would require creating test plugin files
    // This is more complex and would typically be done in integration tests
  });

  describe('SimpleTaskRouter', () => {
    let router: SimpleTaskRouter;

    beforeEach(async () => {
      router = new SimpleTaskRouter({
        enablePlugins: false, // Disable plugins for unit tests
        enableCaching: true,
        enableEvents: true,
        cacheConfig: {
          maxSize: 1024 * 1024,
          defaultTTL: 60
        }
      });
    });

    afterEach(async () => {
      await router.shutdown();
    });

    it('should initialize successfully', async () => {
      await router.initialize();
      
      const tools = router.getTools();
      const agents = router.getAgents();
      
      expect(tools.length).toBeGreaterThan(0);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should get tools by category', async () => {
      await router.initialize();
      
      const bitcoinTools = router.getToolsByCategory('bitcoin');
      expect(bitcoinTools.length).toBeGreaterThan(0);
      
      bitcoinTools.forEach(tool => {
        expect(tool.metadata?.category).toBe('bitcoin');
      });
    });

    it('should search tools by tags', async () => {
      await router.initialize();
      
      const priceTools = router.searchToolsByTags(['price']);
      expect(priceTools.length).toBeGreaterThan(0);
      
      priceTools.forEach(tool => {
        expect(tool.metadata?.tags).toContain('price');
      });
    });

    it('should execute tools with caching', async () => {
      await router.initialize();
      
      const tool = router.getTool('get_bitcoin_price');
      expect(tool).toBeDefined();
      
      if (tool) {
        // Mock the bitcoin price tool to avoid external API calls
        const originalHandler = tool.handler;
        const mockHandler = jest.fn().mockResolvedValue({
          price: 50000,
          currency: 'usd',
          timestamp: Date.now(),
          source: 'Mock'
        });
        (tool as any).handler = mockHandler;

        const result1 = await router.executeTool('get_bitcoin_price', { currency: 'usd' });
        const result2 = await router.executeTool('get_bitcoin_price', { currency: 'usd' });

        expect(result1).toEqual(result2);
        
        // Should only call the handler once due to caching
        if (tool.metadata?.cacheable) {
          expect(tool.handler).toHaveBeenCalledTimes(1);
        }

        // Restore original handler
        tool.handler = originalHandler;
      }
    });

    it('should handle tool not found', async () => {
      await router.initialize();
      
      await expect(
        router.executeTool('non-existent-tool', {})
      ).rejects.toThrow('Tool not found: non-existent-tool');
    });

    it('should get metrics', async () => {
      await router.initialize();
      
      const metrics = router.getMetrics();
      
      expect(typeof metrics.totalTools).toBe('number');
      expect(typeof metrics.totalAgents).toBe('number');
      expect(typeof metrics.requestCount).toBe('number');
      expect(typeof metrics.errorCount).toBe('number');
      expect(typeof metrics.uptime).toBe('number');
    });

    it('should get health status', async () => {
      await router.initialize();
      
      const health = router.getHealth();
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(typeof health.details.errorRate).toBe('number');
      expect(typeof health.details.averageResponseTime).toBe('number');
      expect(typeof health.details.uptime).toBe('number');
    });

    it('should invalidate cache', async () => {
      await router.initialize();
      
      // Should not throw
      await router.invalidateCache({
        toolName: 'get_bitcoin_price'
      });

      await router.invalidateCache({
        tags: ['price', 'market-data']
      });

      await router.invalidateCache({
        pattern: 'btc_price:*'
      });
    });

    it('should handle shutdown gracefully', async () => {
      await router.initialize();
      
      // Should not throw
      await router.shutdown();
    });
  });

  describe('Integration Tests', () => {
    let router: SimpleTaskRouter;
    let eventBus: EventBus;

    beforeEach(async () => {
      eventBus = new EventBus();
      router = new SimpleTaskRouter({
        enablePlugins: false,
        enableCaching: true,
        enableEvents: true
      });
      
      await router.initialize();
    });

    afterEach(async () => {
      await router.shutdown();
      eventBus.clear();
    });

    it('should emit events during tool execution', async () => {
      let executionStartReceived = false;
      let executionEndReceived = false;

      // Subscribe to tool execution events
      eventBus.subscribe('tool:execution:start', () => {
        executionStartReceived = true;
      });

      eventBus.subscribe('tool:execution:success', () => {
        executionEndReceived = true;
      });

      // Mock a tool to avoid external API calls
      const tool = router.getTool('get_bitcoin_price');
      if (tool) {
        const mockHandler = jest.fn().mockResolvedValue({
          price: 50000,
          currency: 'usd'
        });
        (tool as any).handler = mockHandler;

        await router.executeTool('get_bitcoin_price', { currency: 'usd' });
        
        // Wait a bit for async events to propagate
        await new Promise(resolve => setTimeout(resolve, 10));
        
        expect(executionStartReceived).toBe(true);
        expect(executionEndReceived).toBe(true);
      }
    });

    it('should cache tool results and emit cache events', async () => {
      let cacheHit = false;
      let cacheMiss = false;

      eventBus.subscribe('tool:cache:hit', () => {
        cacheHit = true;
      });

      eventBus.subscribe('tool:cache:miss', () => {
        cacheMiss = true;
      });

      const tool = router.getTool('get_bitcoin_price');
      if (tool) {
        const mockHandler = jest.fn().mockResolvedValue({
          price: 50000,
          currency: 'usd'
        });
        (tool as any).handler = mockHandler;

        // First call should be a cache miss
        await router.executeTool('get_bitcoin_price', { currency: 'usd' });
        expect(cacheMiss).toBe(true);

        // Second call should be a cache hit
        await router.executeTool('get_bitcoin_price', { currency: 'usd' });
        expect(cacheHit).toBe(true);
      }
    });
  });
});

// Helper function to create mock plugins for testing
export function createMockPlugin(name: string) {
  return class MockPlugin {
    metadata = {
      name,
      version: '1.0.0',
      description: `Mock plugin ${name}`,
      author: 'test'
    };

    async initialize() {
      // Mock initialization
    }

    getTools() {
      return [{
        name: `${name}_tool`,
        description: `Tool from ${name}`,
        inputSchema: { type: 'object' },
        handler: async () => ({ result: `from ${name}` })
      }];
    }

    getAgents() {
      return [{
        name: `${name}_agent`,
        description: `Agent from ${name}`,
        capabilities: ['mock'],
        instance: {}
      }];
    }
  };
}
