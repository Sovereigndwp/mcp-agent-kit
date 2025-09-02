import { logger } from '../utils/logger.js';
import { PluginManager } from '../core/PluginManager.js';
import { EnhancedCache } from '../core/EnhancedCache.js';
import { EventBus, globalEventBus } from '../core/EventBus.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (...args: any[]) => Promise<any>;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    cacheable?: boolean;
    cacheKeyGenerator?: (args: any) => string;
    cacheTTL?: number;
  };
}

export interface AgentDefinition {
  name: string;
  description: string;
  capabilities: string[];
  instance: any;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    dependencies?: string[];
  };
}

export interface RouterConfig {
  enablePlugins?: boolean;
  enableCaching?: boolean;
  enableEvents?: boolean;
  pluginDirectories?: string[];
  cacheConfig?: {
    maxSize?: number;
    defaultTTL?: number;
    enableMetrics?: boolean;
  };
  eventConfig?: {
    enableMetrics?: boolean;
    maxHistorySize?: number;
  };
}

export class SimpleTaskRouter {
  private tools: Map<string, ToolDefinition> = new Map();
  private agents: Map<string, AgentDefinition> = new Map();
  
  // Core systems
  private pluginManager: PluginManager;
  private cache: EnhancedCache;
  private eventBus: EventBus;
  
  // Configuration
  private config: RouterConfig;
  
  // Metrics
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  constructor(config: RouterConfig = {}) {
    this.config = {
      enablePlugins: true,
      enableCaching: true,
      enableEvents: true,
      pluginDirectories: ['./plugins', './src/plugins'],
      cacheConfig: {
        maxSize: 100 * 1024 * 1024,
        defaultTTL: 3600,
        enableMetrics: true
      },
      eventConfig: {
        enableMetrics: true,
        maxHistorySize: 1000
      },
      ...config
    };

    // Initialize core systems
    this.eventBus = this.config.enableEvents ? globalEventBus : new EventBus();
    this.cache = this.config.enableCaching ? 
      new EnhancedCache(this.config.cacheConfig, this.eventBus) : 
      new EnhancedCache({ defaultTTL: 0 });
    this.pluginManager = new PluginManager(this.eventBus);

    this.startTime = Date.now();
    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    logger.info('Initializing SimpleTaskRouter...');

    // Register some basic tools for testing
    await this.registerBasicTools();
    await this.registerBasicAgents();

    // Load plugins if enabled
    if (this.config.enablePlugins && this.config.pluginDirectories) {
      for (const dir of this.config.pluginDirectories) {
        this.pluginManager.addPluginDirectory(dir);
      }
      await this.pluginManager.loadAllPlugins();
      await this.mergePluginResources();
    }

    logger.info(`SimpleTaskRouter initialized with ${this.tools.size} tools and ${this.agents.size} agents`);
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      this.requestCount++;
      
      this.eventBus.emit('tool:execution:start', {
        requestId, toolName, args, timestamp: startTime
      });

      const tool = this.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      let result: any;

      // Check cache if tool is cacheable
      if (tool.metadata?.cacheable && this.config.enableCaching) {
        const cacheKey = tool.metadata.cacheKeyGenerator ? 
          tool.metadata.cacheKeyGenerator(args) : 
          `tool:${toolName}:${JSON.stringify(args)}`;

        result = await this.cache.get(cacheKey);
        
        if (result !== null) {
          this.eventBus.emitSync('tool:cache:hit', { 
            requestId, toolName, cacheKey 
          });
        } else {
          result = await tool.handler(args);
          const ttl = tool.metadata.cacheTTL || this.config.cacheConfig?.defaultTTL || 3600;
          await this.cache.set(cacheKey, result, {
            ttl,
            tags: [`tool:${toolName}`, ...(tool.metadata?.tags || [])]
          });
          this.eventBus.emitSync('tool:cache:miss', { 
            requestId, toolName, cacheKey 
          });
        }
      } else {
        result = await tool.handler(args);
      }

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      this.eventBus.emit('tool:execution:success', {
        requestId, toolName, args, result, responseTime,
        cached: tool.metadata?.cacheable && result !== null
      });

      return result;

    } catch (error) {
      this.errorCount++;
      const responseTime = Date.now() - startTime;

      this.eventBus.emit('tool:execution:error', {
        requestId, toolName, args,
        error: error instanceof Error ? error.message : String(error),
        responseTime
      });

      throw error;
    }
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAgent(name: string): AgentDefinition | undefined {
    return this.agents.get(name);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.metadata?.category === category);
  }

  getAgentsByCategory(category: string): AgentDefinition[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.metadata?.category === category);
  }

  searchToolsByTags(tags: string[]): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => {
        const toolTags = tool.metadata?.tags || [];
        return tags.some(tag => toolTags.includes(tag));
      });
  }

  async invalidateCache(options: {
    toolName?: string;
    tags?: string[];
    pattern?: string;
  }): Promise<void> {
    if (!this.config.enableCaching) return;

    if (options.toolName) {
      await this.cache.invalidateByTags([`tool:${options.toolName}`]);
    }
    if (options.tags) {
      await this.cache.invalidateByTags(options.tags);
    }
    if (options.pattern) {
      await this.cache.invalidatePattern({
        pattern: options.pattern,
        type: 'glob'
      });
    }

    this.eventBus.emitSync('cache:invalidated', options);
  }

  getMetrics() {
    const avgResponseTime = this.responseTimes.length > 0 ?
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length : 0;

    return {
      totalTools: this.tools.size,
      totalAgents: this.agents.size,
      pluginStats: this.config.enablePlugins ? this.pluginManager.getStats() : null,
      cacheMetrics: this.config.enableCaching ? this.cache.getMetrics() : null,
      eventMetrics: this.config.enableEvents ? this.eventBus.getMetrics() : null,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: avgResponseTime,
      uptime: Date.now() - this.startTime
    };
  }

  getHealth() {
    const metrics = this.getMetrics();
    const errorRate = metrics.requestCount > 0 ? 
      (metrics.errorCount / metrics.requestCount) * 100 : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 10) {
      status = 'unhealthy';
    } else if (errorRate > 5 || metrics.averageResponseTime > 5000) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        errorRate,
        averageResponseTime: metrics.averageResponseTime,
        uptime: metrics.uptime,
        toolCount: metrics.totalTools,
        agentCount: metrics.totalAgents,
        cacheHitRate: metrics.cacheMetrics?.hitRate || 0
      }
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down SimpleTaskRouter...');

    try {
      this.eventBus.emit('router:shutdown', { timestamp: Date.now() });
      await this.pluginManager.cleanup();
      await this.cache.shutdown();
      this.eventBus.emitSync('system:shutdown', {});
      logger.info('SimpleTaskRouter shutdown completed');
    } catch (error) {
      logger.error('Error during router shutdown:', error);
      throw error;
    }
  }

  private async registerBasicTools(): Promise<void> {
    // Mock Bitcoin price tool
    this.tools.set('get_bitcoin_price', {
      name: 'get_bitcoin_price',
      description: 'Get current Bitcoin price in specified currency',
      inputSchema: {
        type: 'object',
        properties: {
          currency: {
            type: 'string',
            description: 'Currency code (e.g., usd, eur, btc)',
            default: 'usd'
          }
        }
      },
      handler: async (args: any) => {
        const currency = args.currency || 'usd';
        return {
          price: 50000, // Mock price
          currency,
          timestamp: Date.now(),
          source: 'Mock'
        };
      },
      metadata: {
        category: 'bitcoin',
        tags: ['price', 'market-data'],
        version: '1.0.0',
        cacheable: true,
        cacheTTL: 60,
        cacheKeyGenerator: (args: any) => `btc_price:${args.currency || 'usd'}`
      }
    });
  }

  private async registerBasicAgents(): Promise<void> {
    this.agents.set('mock_agent', {
      name: 'mock_agent',
      description: 'Mock agent for testing',
      capabilities: ['testing'],
      instance: {},
      metadata: {
        category: 'test',
        tags: ['mock', 'testing'],
        version: '1.0.0'
      }
    });
  }

  private async mergePluginResources(): Promise<void> {
    if (!this.config.enablePlugins) return;

    const pluginTools = this.pluginManager.getAllTools();
    for (const [name, tool] of pluginTools) {
      if (this.tools.has(name)) {
        logger.warn(`Tool ${name} from plugin overriding existing tool`);
      }
      this.tools.set(name, tool);
    }

    const pluginAgents = this.pluginManager.getAllAgents();
    for (const [name, agent] of pluginAgents) {
      if (this.agents.has(name)) {
        logger.warn(`Agent ${name} from plugin overriding existing agent`);
      }
      this.agents.set(name, agent);
    }

    logger.info(`Merged resources: +${pluginTools.size} tools, +${pluginAgents.size} agents from plugins`);
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('plugin:loaded', (data) => {
      logger.info(`Plugin loaded: ${data.name} (+${data.tools.length} tools, +${data.agents.length} agents)`);
      this.mergePluginResources();
    });

    this.eventBus.subscribe('plugin:unloaded', (data) => {
      logger.info(`Plugin unloaded: ${data.name} (-${data.tools.length} tools, -${data.agents.length} agents)`);
    });

    if (this.config.enableCaching) {
      this.eventBus.subscribe('cache:evicted', (data) => {
        logger.debug(`Cache evicted ${data.keys.length} entries (${data.freedSpace} bytes)`);
      });
    }

    this.eventBus.setGlobalErrorHandler((error, eventName, listener) => {
      logger.error(`Event error in ${eventName} listener ${listener.id}:`, error);
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
