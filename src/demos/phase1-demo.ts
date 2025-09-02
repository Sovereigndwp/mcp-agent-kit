#!/usr/bin/env node

import { SimpleTaskRouter } from '../router/SimpleTaskRouter.js';
import { EnhancedCache } from '../core/EnhancedCache.js';
import { EventBus } from '../core/EventBus.js';
import { logger } from '../utils/logger.js';

/**
 * Phase 1 Demo: Enhanced MCP Agent Kit
 * 
 * This demo showcases the major improvements implemented in Phase 1:
 * - Plugin Architecture
 * - Enhanced Caching System
 * - Event Bus for Agent Communication
 * - Improved TaskRouter Integration
 */

async function runPhase1Demo() {
  console.log('🚀 Welcome to the Enhanced MCP Agent Kit - Phase 1 Demo!\n');
  
  // Initialize the enhanced systems
  console.log('📋 Initializing Phase 1 systems...');
  
  const router = new SimpleTaskRouter({
    enablePlugins: false, // Keep simple for demo
    enableCaching: true,
    enableEvents: true,
    cacheConfig: {
      maxSize: 10 * 1024 * 1024, // 10MB
      defaultTTL: 300, // 5 minutes
      enableMetrics: true
    }
  });

  await router.initialize();
  console.log('✅ Enhanced TaskRouter initialized');

  // Demonstrate Event Bus capabilities
  console.log('\n🎯 Demonstrating Event Bus System:');
  
  const eventBus = new EventBus();
  
  // Subscribe to some events
  let eventCount = 0;
  eventBus.subscribe('demo:event', (data) => {
    eventCount++;
    console.log(`   📨 Event received: ${data.message} (count: ${eventCount})`);
  });

  eventBus.subscribe('demo:priority', () => {
    console.log('   🥇 High priority listener');
  }, { priority: 10 });

  eventBus.subscribe('demo:priority', () => {
    console.log('   🥈 Medium priority listener');
  }, { priority: 5 });

  eventBus.subscribe('demo:priority', () => {
    console.log('   🥉 Low priority listener');
  }, { priority: 1 });

  // Emit some events
  await eventBus.emit('demo:event', { message: 'Hello from Event Bus!' });
  await eventBus.emit('demo:event', { message: 'Events are working!' });
  await eventBus.emit('demo:priority', {});

  // Show event metrics
  const eventMetrics = eventBus.getMetrics();
  console.log(`   📊 Event metrics: ${eventMetrics.totalEvents} events, ${eventMetrics.totalListeners} listeners, ${((eventMetrics as any).hitRate || 0).toFixed(1)}% success rate`);

  // Demonstrate Enhanced Caching
  console.log('\n💾 Demonstrating Enhanced Caching System:');
  
  const cache = new EnhancedCache({
    defaultTTL: 60,
    enableMetrics: true
  });

  // Set some cache entries with tags
  await cache.set('price:btc', { price: 50000, currency: 'usd' }, { 
    tags: ['bitcoin', 'price'], 
    ttl: 30 
  });
  await cache.set('price:eth', { price: 3000, currency: 'usd' }, { 
    tags: ['ethereum', 'price'],
    ttl: 30
  });
  await cache.set('news:bitcoin:1', { title: 'Bitcoin hits new high!' }, { 
    tags: ['bitcoin', 'news'] 
  });

  // Demonstrate cache retrieval
  const btcPrice = await cache.get('price:btc');
  console.log(`   📈 Retrieved BTC price from cache: $${btcPrice?.price}`);

  // Demonstrate tag-based operations
  const bitcoinKeys = cache.getKeysByTag('bitcoin');
  console.log(`   🏷️  Found ${bitcoinKeys.length} bitcoin-tagged items: ${bitcoinKeys.join(', ')}`);

  // Invalidate by tags
  await cache.invalidateByTags(['price']);
  console.log('   🗑️  Invalidated all price data');

  const btcPriceAfter = await cache.get('price:btc');
  console.log(`   ❌ BTC price after invalidation: ${btcPriceAfter || 'not found'}`);

  // Show cache metrics
  const cacheMetrics = cache.getMetrics();
  console.log(`   📊 Cache metrics: ${cacheMetrics.hits} hits, ${cacheMetrics.misses} misses, ${cacheMetrics.hitRate.toFixed(1)}% hit rate`);

  // Demonstrate TaskRouter capabilities
  console.log('\n🔧 Demonstrating Enhanced TaskRouter:');

  const tools = router.getTools();
  const agents = router.getAgents();
  console.log(`   🛠️  Available tools: ${tools.length}`);
  console.log(`   🤖 Available agents: ${agents.length}`);

  // Show tools by category
  const bitcoinTools = router.getToolsByCategory('bitcoin');
  console.log(`   ₿  Bitcoin tools: ${bitcoinTools.map(t => t.name).join(', ')}`);

  // Search tools by tags
  const priceTools = router.searchToolsByTags(['price']);
  console.log(`   💰 Price-related tools: ${priceTools.map(t => t.name).join(', ')}`);

  // Execute a tool with caching
  console.log('\n⚡ Demonstrating Tool Execution with Caching:');
  
  console.log('   🔄 First execution (cache miss):');
  const start1 = Date.now();
  const result1 = await router.executeTool('get_bitcoin_price', { currency: 'usd' });
  const time1 = Date.now() - start1;
  console.log(`   💵 BTC Price: $${result1.price} (took ${time1}ms)`);

  console.log('   🔄 Second execution (cache hit):');
  const start2 = Date.now();
  const result2 = await router.executeTool('get_bitcoin_price', { currency: 'usd' });
  const time2 = Date.now() - start2;
  console.log(`   💵 BTC Price: $${result2.price} (took ${time2}ms)`);

  console.log(`   ⚡ Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}% faster!`);

  // Show router metrics
  const routerMetrics = router.getMetrics();
  console.log(`   📊 Router metrics: ${routerMetrics.requestCount} requests, ${routerMetrics.averageResponseTime.toFixed(1)}ms avg response`);

  // Show router health
  const health = router.getHealth();
  console.log(`   💚 Router health: ${health.status} (${health.details.errorRate.toFixed(1)}% error rate)`);

  // Demonstrate system integration
  console.log('\n🔗 System Integration Example:');
  console.log('   Setting up cross-system event listeners...');

  // Listen for tool executions and log to cache
  eventBus.subscribe('tool:execution:success', async (data) => {
    const logKey = `execution_log:${Date.now()}`;
    await cache.set(logKey, {
      tool: data.toolName,
      timestamp: new Date().toISOString(),
      responseTime: data.responseTime
    }, { tags: ['execution-log'], ttl: 3600 });
    
    console.log(`   📝 Logged execution: ${data.toolName} (${data.responseTime}ms)`);
  });

  // Execute another tool to trigger the integration
  await router.executeTool('get_bitcoin_price', { currency: 'eur' });

  // Show execution logs
  const logKeys = cache.getKeysByTag('execution-log');
  console.log(`   📋 Found ${logKeys.length} execution logs in cache`);

  console.log('\n🎉 Phase 1 Demo Complete!\n');
  
  console.log('✨ What we\'ve accomplished in Phase 1:');
  console.log('   ✅ Plugin Architecture - Dynamic tool/agent loading');
  console.log('   ✅ Enhanced Caching - TTL, tags, pattern invalidation, LRU eviction');
  console.log('   ✅ Event Bus System - Priority-based, filtered, namespaced events');
  console.log('   ✅ Integrated Router - Caching, events, metrics, health monitoring');
  console.log('   ✅ Comprehensive Testing - Unit and integration tests');
  
  console.log('\n🚀 Ready for Phase 2: Advanced Features!');
  console.log('   🔜 Real-time Dashboard');
  console.log('   🔜 Agent Memory System');
  console.log('   🔜 Multi-Agent Workflows');

  // Cleanup
  await router.shutdown();
  await cache.shutdown();
  eventBus.clear();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPhase1Demo().catch(error => {
    logger.error('Demo failed:', error);
    process.exit(1);
  });
}
