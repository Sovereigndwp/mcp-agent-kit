import { EventEmitter } from 'events';

export interface MCPAgentConfig {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  dependencies: string[];
  resources: MCPResource[];
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPMessage {
  id: string;
  method: string;
  params?: any;
  timestamp: Date;
  source: string;
  target?: string;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  timestamp: Date;
}

export class MCPAgentServer extends EventEmitter {
  private agents: Map<string, MCPAgentConfig> = new Map();
  private messageQueue: MCPMessage[] = [];
  private connectionPool: Map<string, any> = new Map();
  private cache: Map<string, { data: any; expiry: Date }> = new Map();
  
  constructor() {
    super();
    this.setupErrorHandling();
    this.startMessageProcessor();
  }

  registerAgent(config: MCPAgentConfig): void {
    if (this.agents.has(config.id)) {
      throw new Error(`Agent ${config.id} already registered`);
    }

    // Validate agent configuration
    this.validateAgentConfig(config);
    
    this.agents.set(config.id, config);
    this.emit('agent:registered', config);
    
    console.log(`✅ Agent registered: ${config.name} (${config.id})`);
  }

  private validateAgentConfig(config: MCPAgentConfig): void {
    const required = ['id', 'name', 'version', 'capabilities'];
    for (const field of required) {
      if (!config[field as keyof MCPAgentConfig]) {
        throw new Error(`Agent config missing required field: ${field}`);
      }
    }

    if (typeof config.id !== 'string' || config.id.length === 0) {
      throw new Error('Agent ID must be a non-empty string');
    }

    if (!Array.isArray(config.capabilities) || config.capabilities.length === 0) {
      throw new Error('Agent must have at least one capability');
    }
  }

  async sendMessage(message: MCPMessage): Promise<MCPResponse> {
    try {
      // Add to message queue
      this.messageQueue.push({
        ...message,
        id: message.id || this.generateMessageId(),
        timestamp: new Date()
      });

      // Process message
      return await this.processMessage(message);
    } catch (error) {
      return this.createErrorResponse(message.id, error);
    }
  }

  private async processMessage(message: MCPMessage): Promise<MCPResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `${message.method}:${JSON.stringify(message.params)}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          id: message.id,
          result: cached,
          timestamp: new Date()
        };
      }

      // Route message to appropriate agent
      const result = await this.routeMessage(message);
      
      // Cache result if appropriate
      if (this.shouldCache(message.method)) {
        this.setCacheResult(cacheKey, result, 300); // 5 minutes
      }

      const processingTime = Date.now() - startTime;
      this.emit('message:processed', { message, processingTime });

      return {
        id: message.id,
        result,
        timestamp: new Date()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.emit('message:error', { message, error, processingTime });
      
      return this.createErrorResponse(message.id, error);
    }
  }

  private async routeMessage(message: MCPMessage): Promise<any> {
    // Route based on method and target
    switch (message.method) {
      case 'agent:analyze-content':
        return await this.routeToContentAnalysis(message);
      case 'agent:get-platform-strategy':
        return await this.routeToPlatformStrategy(message);
      case 'agent:monitor-news':
        return await this.routeToNewsMonitoring(message);
      case 'agent:get-market-data':
        return await this.routeToMarketIntelligence(message);
      default:
        throw new Error(`Unknown method: ${message.method}`);
    }
  }

  private async routeToContentAnalysis(message: MCPMessage): Promise<any> {
    // Import from trusted agent directory only
    const agentPath = '../agents/ContentMentorOrchestrator.js';
    if (!agentPath.startsWith('../agents/') || agentPath.includes('..', 10)) {
      throw new Error('Invalid agent path');
    }
    const { contentMentorOrchestrator } = await import(agentPath);
    
    if (!message.params?.content) {
      throw new Error('Content parameter required for analysis');
    }

    return contentMentorOrchestrator.analyzeContentForPublishing(
      message.params.content,
      message.params.contentType || 'tweet'
    );
  }

  private async routeToPlatformStrategy(message: MCPMessage): Promise<any> {
    // Import from trusted agent directory only
    const agentPath = '../agents/PlatformStrategyMentor.js';
    if (!agentPath.startsWith('../agents/') || agentPath.includes('..', 10)) {
      throw new Error('Invalid agent path');
    }
    const { platformStrategyMentor } = await import(agentPath);
    
    if (message.params?.platform) {
      return platformStrategyMentor.analyzePlatform(message.params.platform);
    } else {
      return platformStrategyMentor.generatePlatformComparison();
    }
  }

  private async routeToNewsMonitoring(message: MCPMessage): Promise<any> {
    // Import from trusted agent directory only
    const agentPath = '../agents/BitcoinNewsAnalyzer.js';
    if (!agentPath.startsWith('../agents/') || agentPath.includes('..', 10)) {
      throw new Error('Invalid agent path');
    }
    const { bitcoinNewsAnalyzer } = await import(agentPath);
    
    return bitcoinNewsAnalyzer.generateDailyNewsDigest();
  }

  private async routeToMarketIntelligence(message: MCPMessage): Promise<any> {
    // Import from trusted agent directory only
    const agentPath = '../agents/MarketIntelligenceAgent.js';
    if (!agentPath.startsWith('../agents/') || agentPath.includes('..', 10)) {
      throw new Error('Invalid agent path');
    }
    const { marketIntelligenceAgent } = await import(agentPath);
    
    return marketIntelligenceAgent.generateDailyMarketInsight();
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Cleanup expired cache
    }
    return null;
  }

  private setCacheResult(key: string, data: any, ttlSeconds: number): void {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + ttlSeconds);
    
    this.cache.set(key, { data, expiry });
  }

  private shouldCache(method: string): boolean {
    const cachableMethods = [
      'agent:get-platform-strategy',
      'agent:get-market-data'
    ];
    return cachableMethods.includes(method);
  }

  private createErrorResponse(messageId: string, error: any): MCPResponse {
    let code = 500;
    let message = 'Internal server error';
    
    if (error.message?.includes('required')) {
      code = 400;
      message = 'Bad request';
    } else if (error.message?.includes('not found')) {
      code = 404;
      message = 'Not found';
    }

    return {
      id: messageId,
      error: {
        code,
        message,
        data: error.message
      },
      timestamp: new Date()
    };
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandling(): void {
    this.on('error', (error) => {
      console.error('❌ MCP Agent Server Error:', error);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.emit('error', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      this.emit('error', new Error(`Unhandled rejection: ${reason}`));
    });
  }

  private startMessageProcessor(): void {
    // Process message queue every 100ms
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const processed = this.messageQueue.splice(0, 10); // Process 10 at a time
        this.emit('queue:processed', { count: processed.length });
      }
    }, 100);

    // Cleanup cache every 5 minutes
    setInterval(() => {
      const now = new Date();
      let cleaned = 0;
      
      for (const [key, value] of this.cache.entries()) {
        if (value.expiry <= now) {
          this.cache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.emit('cache:cleaned', { count: cleaned });
      }
    }, 300000);
  }

  getServerStats(): {
    agents: number;
    messageQueue: number;
    cacheSize: number;
    uptime: number;
  } {
    return {
      agents: this.agents.size,
      messageQueue: this.messageQueue.length,
      cacheSize: this.cache.size,
      uptime: process.uptime()
    };
  }

  listAgents(): MCPAgentConfig[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): MCPAgentConfig | undefined {
    return this.agents.get(id);
  }

  shutdown(): void {
    console.log('🔄 Shutting down MCP Agent Server...');
    this.messageQueue.length = 0;
    this.cache.clear();
    this.agents.clear();
    this.emit('server:shutdown');
    console.log('✅ MCP Agent Server shutdown complete');
  }
}

// Global server instance
export const mcpAgentServer = new MCPAgentServer();

// Register all available agents
mcpAgentServer.registerAgent({
  id: 'content-mentor-orchestrator',
  name: 'Content Mentor Orchestrator',
  version: '1.0.0',
  capabilities: ['content-analysis', 'platform-optimization', 'brand-alignment'],
  dependencies: ['content-authenticity-mentor', 'platform-strategy-mentor', 'brand-identity-system'],
  resources: []
});

mcpAgentServer.registerAgent({
  id: 'bitcoin-news-analyzer',
  name: 'Bitcoin News Analyzer',
  version: '1.0.0',
  capabilities: ['news-monitoring', 'educational-content-generation', 'trend-analysis'],
  dependencies: [],
  resources: []
});

mcpAgentServer.registerAgent({
  id: 'market-intelligence-agent',
  name: 'Market Intelligence Agent',
  version: '1.0.0',
  capabilities: ['market-analysis', 'data-monitoring', 'educational-opportunities'],
  dependencies: ['bitcoin-news-analyzer'],
  resources: []
});

mcpAgentServer.registerAgent({
  id: 'external-content-integrator',
  name: 'External Content Integrator',
  version: '1.0.0',
  capabilities: ['partner-integration', 'content-mapping', 'collaboration-analysis'],
  dependencies: [],
  resources: []
});