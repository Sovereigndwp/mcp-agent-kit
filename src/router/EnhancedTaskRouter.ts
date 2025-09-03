import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';
import capabilities from '../registry/capabilities.json' with { type: "json" };

// Core systems
import { PluginManager } from '../core/PluginManager.js';
import { EnhancedCache } from '../core/EnhancedCache.js';
import { EventBus, globalEventBus } from '../core/EventBus.js';

// Legacy imports (will be migrated to plugins)
import { bitcoinPriceTool } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { canvaTools } from '../tools/canva_api.js';
import { NewsScout } from '../agents/NewsScout.js';
import { DevRadar } from '../agents/DevRadar.js';
import { CustodyCoach } from '../agents/CustodyCoach.js';
import { SimulationBuilder } from '../agents/SimulationBuilder.js';
import { CanvaAgent } from '../agents/CanvaAgent.js';

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

export interface RouterMetrics {
  totalTools: number;
  totalAgents: number;
  pluginStats: any;
  cacheMetrics: any;
  eventMetrics: any;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  uptime: number;
}

export class EnhancedTaskRouter {
  private server?: Server;
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
        maxSize: 100 * 1024 * 1024, // 100MB
        defaultTTL: 3600, // 1 hour
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
      new EnhancedCache({ defaultTTL: 0 }); // Disabled cache
    this.pluginManager = new PluginManager(this.eventBus);

    this.startTime = Date.now();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize the enhanced task router
   */
  async initialize(): Promise<void> {
    logger.info('Initializing EnhancedTaskRouter...');

    try {
      // Initialize plugin directories
      if (this.config.enablePlugins && this.config.pluginDirectories) {
        for (const dir of this.config.pluginDirectories) {
          this.pluginManager.addPluginDirectory(dir);
        }
      }

      // Load legacy tools and agents first
      await this.registerLegacyTools();
      await this.registerLegacyAgents();

      // Load plugins (will override/extend legacy tools if needed)
      if (this.config.enablePlugins) {
        await this.pluginManager.loadAllPlugins();
        
        // Enable hot reloading for development
        if (process.env.NODE_ENV !== 'production') {
          for (const dir of this.config.pluginDirectories || []) {
            await this.pluginManager.enableHotReload(dir);
          }
        }
      }

      // Merge plugin tools and agents
      await this.mergePluginResources();

      // Emit initialization complete event
      this.eventBus.emit('router:initialized', {
        toolCount: this.tools.size,
        agentCount: this.agents.size,
        pluginsEnabled: this.config.enablePlugins,
        cachingEnabled: this.config.enableCaching
      });

      logger.info(`EnhancedTaskRouter initialized with ${this.tools.size} tools and ${this.agents.size} agents`);
      
    } catch (error) {
      logger.error('Failed to initialize EnhancedTaskRouter:', error);
      throw error;
    }
  }

  /**
   * Register all tools and agents with the MCP server
   */
  async registerAll(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not initialized');
    }

    logger.info('Registering all tools and agents with MCP server...');

    // Register tools
    for (const [name, tool] of this.tools) {
      try {
        // In a real MCP implementation, you would use server.setRequestHandler
        // For now, we'll just log the registration
        logger.debug(`Registered tool: ${name}`);
        
        // Emit tool registration event
        this.eventBus.emitSync('tool:registered', {
          name: tool.name,
          description: tool.description,
          category: tool.metadata?.category,
          tags: tool.metadata?.tags
        });
      } catch (error) {
        logger.error(`Failed to register tool ${name}:`, error);
        this.errorCount++;
      }
    }

    // Register agents
    for (const [name, agent] of this.agents) {
      try {
        // Agent registration logic would go here
        logger.debug(`Registered agent: ${name}`);
        
        // Emit agent registration event
        this.eventBus.emitSync('agent:registered', {
          name: agent.name,
          description: agent.description,
          capabilities: agent.capabilities,
          category: agent.metadata?.category
        });
      } catch (error) {
        logger.error(`Failed to register agent ${name}:`, error);
        this.errorCount++;
      }
    }

    logger.info(`Registration complete: ${this.tools.size} tools, ${this.agents.size} agents`);
  }

  /**
   * Execute a tool with caching and event emission
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      this.requestCount++;
      
      // Emit tool execution start event
      this.eventBus.emit('tool:execution:start', {
        requestId,
        toolName,
        args,
        timestamp: startTime
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
          // Emit cache hit event
          this.eventBus.emitSync('tool:cache:hit', { 
            requestId, 
            toolName, 
            cacheKey 
          });
          
          logger.debug(`Cache hit for tool: ${toolName}`);
        } else {
          // Execute tool and cache result
          result = await tool.handler(args);
          
          const ttl = tool.metadata.cacheTTL || this.config.cacheConfig?.defaultTTL || 3600;
          await this.cache.set(cacheKey, result, {
            ttl,
            tags: [`tool:${toolName}`, ...(tool.metadata?.tags || [])]
          });

          // Emit cache miss event
          this.eventBus.emitSync('tool:cache:miss', { 
            requestId, 
            toolName, 
            cacheKey 
          });
        }
      } else {
        // Execute tool without caching
        result = await tool.handler(args);
      }

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      // Keep only last 100 response times for average calculation
      if (this.responseTimes.length > 100) {
        this.responseTimes = this.responseTimes.slice(-100);
      }

      // Emit successful execution event
      this.eventBus.emit('tool:execution:success', {
        requestId,
        toolName,
        args,
        result,
        responseTime,
        cached: tool.metadata?.cacheable && result !== null
      });

      return result;

    } catch (error) {
      this.errorCount++;
      const responseTime = Date.now() - startTime;

      // Emit error event
      this.eventBus.emit('tool:execution:error', {
        requestId,
        toolName,
        args,
        error: error instanceof Error ? error.message : String(error),
        responseTime
      });

      logger.error(`Tool execution failed: ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Get tool definition
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get agent definition
   */
  getAgent(name: string): AgentDefinition | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all tools
   */
  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all agents
   */
  getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.metadata?.category === category);
  }

  /**
   * Get agents by category
   */
  getAgentsByCategory(category: string): AgentDefinition[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.metadata?.category === category);
  }

  /**
   * Search tools by tags
   */
  searchToolsByTags(tags: string[]): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => {
        const toolTags = tool.metadata?.tags || [];
        return tags.some(tag => toolTags.includes(tag));
      });
  }

  /**
   * Invalidate cache by tool or tags
   */
  async invalidateCache(options: {
    toolName?: string;
    tags?: string[];
    pattern?: string;
  }): Promise<void> {
    if (!this.config.enableCaching) {
      return;
    }

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

    // Emit cache invalidation event
    this.eventBus.emitSync('cache:invalidated', options);
  }

  /**
   * Get router metrics
   */
  getMetrics(): RouterMetrics {
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

  /**
   * Get router health status
   */
  getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  } {
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

  /**
   * Set the MCP server instance
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Get capabilities for MCP server
   */
  getCapabilities(): any {
    return capabilities;
  }

  /**
   * Shutdown the router and cleanup resources
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down EnhancedTaskRouter...');

    try {
      // Emit shutdown event
      this.eventBus.emit('router:shutdown', { timestamp: Date.now() });

      // Cleanup plugin manager
      await this.pluginManager.cleanup();

      // Shutdown cache
      await this.cache.shutdown();

      // Emit system shutdown for event bus cleanup
      this.eventBus.emitSync('system:shutdown', {});

      logger.info('EnhancedTaskRouter shutdown completed');
    } catch (error) {
      logger.error('Error during router shutdown:', error);
      throw error;
    }
  }

  /**
   * Register legacy tools (to be migrated to plugins)
   */
  private async registerLegacyTools(): Promise<void> {
    // Bitcoin Price Tools
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
        const price = await bitcoinPriceTool.getBitcoinPrice();
        return {
          price,
          currency,
          timestamp: Date.now(),
          source: 'CoinGecko'
        };
      },
      metadata: {
        category: 'bitcoin',
        tags: ['price', 'market-data'],
        version: '1.0.0',
        cacheable: true,
        cacheTTL: 60, // 1 minute cache
        cacheKeyGenerator: (args: any) => `btc_price:${args.currency || 'usd'}`
      }
    });

    this.tools.set('get_bitcoin_price_details', {
      name: 'get_bitcoin_price_details',
      description: 'Get detailed Bitcoin price information including 24h change and volume',
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
        return await bitcoinPriceTool.getBitcoinPriceDetails();
      },
      metadata: {
        category: 'bitcoin',
        tags: ['price', 'market-data', 'detailed'],
        version: '1.0.0',
        cacheable: true,
        cacheTTL: 60,
        cacheKeyGenerator: (args: any) => `btc_price_details:${args.currency || 'usd'}`
      }
    });

    // Add more legacy tools here...
    // (Continuing with fee estimates, canva tools, etc.)
    
    logger.debug(`Registered ${this.tools.size} legacy tools`);
  }

  /**
   * Register legacy agents (to be migrated to plugins)
   */
  private async registerLegacyAgents(): Promise<void> {
    this.agents.set('news_scout', {
      name: 'news_scout',
      description: 'Bitcoin news monitoring and analysis agent',
      capabilities: ['news_monitoring', 'sentiment_analysis', 'trend_detection'],
      instance: new NewsScout(),
      metadata: {
        category: 'analysis',
        tags: ['news', 'sentiment', 'bitcoin'],
        version: '1.0.0'
      }
    });

    this.agents.set('simulation_builder', {
      name: 'simulation_builder',
      description: 'Bitcoin fee simulation and scenario building agent',
      capabilities: ['fee_simulation', 'scenario_building', 'cost_analysis'],
      instance: new SimulationBuilder(),
      metadata: {
        category: 'simulation',
        tags: ['fees', 'bitcoin', 'analysis'],
        version: '1.0.0'
      }
    });

    // Add more legacy agents...
    
    logger.debug(`Registered ${this.agents.size} legacy agents`);
  }

  /**
   * Merge tools and agents from plugins
   */
  private async mergePluginResources(): Promise<void> {
    if (!this.config.enablePlugins) {
      return;
    }

    // Get tools from plugins
    const pluginTools = this.pluginManager.getAllTools();
    for (const [name, tool] of pluginTools) {
      if (this.tools.has(name)) {
        logger.warn(`Tool ${name} from plugin overriding existing tool`);
      }
      this.tools.set(name, tool);
    }

    // Get agents from plugins
    const pluginAgents = this.pluginManager.getAllAgents();
    for (const [name, agent] of pluginAgents) {
      if (this.agents.has(name)) {
        logger.warn(`Agent ${name} from plugin overriding existing agent`);
      }
      this.agents.set(name, agent);
    }

    logger.info(`Merged resources: +${pluginTools.size} tools, +${pluginAgents.size} agents from plugins`);
  }

  /**
   * Setup event listeners for system events
   */
  private setupEventListeners(): void {
    // Plugin events
    this.eventBus.subscribe('plugin:loaded', (data) => {
      logger.info(`Plugin loaded: ${data.name} (+${data.tools.length} tools, +${data.agents.length} agents)`);
      // Re-merge plugin resources
      this.mergePluginResources();
    });

    this.eventBus.subscribe('plugin:unloaded', (data) => {
      logger.info(`Plugin unloaded: ${data.name} (-${data.tools.length} tools, -${data.agents.length} agents)`);
      // Would need to remove tools/agents from this plugin
    });

    // Cache events
    if (this.config.enableCaching) {
      this.eventBus.subscribe('cache:evicted', (data) => {
        logger.debug(`Cache evicted ${data.keys.length} entries (${data.freedSpace} bytes)`);
      });
    }

    // Error handling
    this.eventBus.setGlobalErrorHandler((error, eventName, listener) => {
      logger.error(`Event error in ${eventName} listener ${listener.id}:`, error);
    });
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
