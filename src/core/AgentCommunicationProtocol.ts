import { EventEmitter } from 'events';
import { MCPError, ErrorCode, RetryHandler } from './ErrorHandler.js';
import { securityManager } from './SecurityManager.js';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  method: string;
  params?: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number; // milliseconds
  retryable?: boolean;
}

export interface AgentResponse {
  id: string;
  messageId: string;
  from: string;
  to: string;
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
  processingTime: number;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
  async: boolean;
  timeout: number;
}

export interface AgentRegistration {
  id: string;
  name: string;
  version: string;
  status: 'starting' | 'ready' | 'busy' | 'error' | 'stopped';
  capabilities: AgentCapability[];
  dependencies: string[];
  healthEndpoint?: string;
  lastHeartbeat: Date;
}

export class AgentCommunicationProtocol extends EventEmitter {
  private agents: Map<string, AgentRegistration> = new Map();
  private messageQueue: Map<string, AgentMessage[]> = new Map(); // Queue per agent
  private pendingMessages: Map<string, {
    message: AgentMessage;
    resolve: (response: AgentResponse) => void;
    reject: (error: MCPError) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private messageHistory: AgentResponse[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.setupProtocol();
    this.startHealthCheck();
  }

  private setupProtocol(): void {
    this.on('agent:registered', (agent: AgentRegistration) => {
      this.messageQueue.set(agent.id, []);
      console.log(`📡 Agent registered: ${agent.name} (${agent.id})`);
    });

    this.on('agent:unregistered', (agentId: string) => {
      this.messageQueue.delete(agentId);
      console.log(`📡 Agent unregistered: ${agentId}`);
    });

    this.on('message:sent', (message: AgentMessage) => {
      console.log(`📤 Message sent: ${message.from} → ${message.to}: ${message.method}`);
    });

    this.on('message:received', (response: AgentResponse) => {
      console.log(`📥 Response received: ${response.from} → ${response.to} (${response.processingTime}ms)`);
      this.recordResponse(response);
    });
  }

  // Agent registration
  async registerAgent(registration: AgentRegistration): Promise<void> {
    // Validate registration
    this.validateAgentRegistration(registration);

    // Check security
    if (securityManager.isBlocked(registration.id)) {
      throw new MCPError(
        ErrorCode.FORBIDDEN,
        `Agent ${registration.id} is blocked due to security violations`
      );
    }

    // Check dependencies
    for (const depId of registration.dependencies) {
      const dependency = this.agents.get(depId);
      if (!dependency || dependency.status !== 'ready') {
        throw new MCPError(
          ErrorCode.AGENT_CONFIG_ERROR,
          `Agent ${registration.id} depends on unavailable agent: ${depId}`
        );
      }
    }

    registration.lastHeartbeat = new Date();
    this.agents.set(registration.id, registration);
    this.emit('agent:registered', registration);
  }

  private validateAgentRegistration(registration: AgentRegistration): void {
    const required = ['id', 'name', 'version', 'capabilities'];
    for (const field of required) {
      if (!registration[field as keyof AgentRegistration]) {
        throw new MCPError(
          ErrorCode.VALIDATION_ERROR,
          `Agent registration missing required field: ${field}`
        );
      }
    }

    if (this.agents.has(registration.id)) {
      throw new MCPError(
        ErrorCode.VALIDATION_ERROR,
        `Agent with ID ${registration.id} already registered`
      );
    }

    if (!Array.isArray(registration.capabilities) || registration.capabilities.length === 0) {
      throw new MCPError(
        ErrorCode.VALIDATION_ERROR,
        'Agent must have at least one capability'
      );
    }
  }

  unregisterAgent(agentId: string): void {
    if (!this.agents.has(agentId)) {
      console.warn(`⚠️  Attempted to unregister unknown agent: ${agentId}`);
      return;
    }

    this.agents.delete(agentId);
    this.emit('agent:unregistered', agentId);
  }

  // Message sending with proper protocols
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<AgentResponse> {
    // Generate message ID and timestamp
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
      timeout: message.timeout || 30000, // Default 30 seconds
      retryable: message.retryable !== false
    };

    // Validate message
    this.validateMessage(fullMessage);

    // Check rate limits
    if (!securityManager.checkRateLimit(fullMessage.from, 'perAgent')) {
      throw new MCPError(
        ErrorCode.RATE_LIMITED,
        `Rate limit exceeded for agent ${fullMessage.from}`
      );
    }

    // Check target agent availability
    const targetAgent = this.agents.get(fullMessage.to);
    if (!targetAgent) {
      throw new MCPError(
        ErrorCode.AGENT_NOT_FOUND,
        `Target agent not found: ${fullMessage.to}`
      );
    }

    if (targetAgent.status !== 'ready') {
      throw new MCPError(
        ErrorCode.AGENT_UNAVAILABLE,
        `Target agent is not ready: ${fullMessage.to} (status: ${targetAgent.status})`
      );
    }

    // Validate capability
    const capability = targetAgent.capabilities.find(c => c.name === fullMessage.method);
    if (!capability) {
      throw new MCPError(
        ErrorCode.METHOD_NOT_ALLOWED,
        `Agent ${fullMessage.to} does not support method: ${fullMessage.method}`
      );
    }

    // Queue message based on priority
    this.queueMessage(fullMessage);
    
    // Send message and wait for response
    return await this.processMessage(fullMessage, capability);
  }

  private validateMessage(message: AgentMessage): void {
    if (!message.from || !message.to || !message.method) {
      throw new MCPError(
        ErrorCode.VALIDATION_ERROR,
        'Message missing required fields: from, to, method'
      );
    }

    // Sanitize input parameters
    if (message.params) {
      message.params = securityManager.sanitizeInput(message.params);
    }

    // Additional Bitcoin-specific validation
    if (message.method.includes('bitcoin') && message.params) {
      try {
        securityManager.validateBitcoinData(message.params);
      } catch (error) {
        throw new MCPError(
          ErrorCode.VALIDATION_ERROR,
          `Bitcoin data validation failed: ${error.message}`,
          { originalError: error }
        );
      }
    }
  }

  private queueMessage(message: AgentMessage): void {
    const queue = this.messageQueue.get(message.to) || [];
    
    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = queue.findIndex(m => 
      priorityOrder[m.priority] > priorityOrder[message.priority]
    );
    
    if (insertIndex === -1) {
      queue.push(message);
    } else {
      queue.splice(insertIndex, 0, message);
    }
    
    this.messageQueue.set(message.to, queue);
  }

  private async processMessage(message: AgentMessage, capability: AgentCapability): Promise<AgentResponse> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(new MCPError(
          ErrorCode.AGENT_TIMEOUT,
          `Message timeout after ${message.timeout}ms`,
          { messageId: message.id, method: message.method }
        ));
      }, message.timeout);

      // Store pending message
      this.pendingMessages.set(message.id, {
        message,
        resolve,
        reject,
        timeout
      });

      // Route message to appropriate handler
      this.routeMessage(message, capability)
        .then(result => {
          const response: AgentResponse = {
            id: this.generateResponseId(),
            messageId: message.id,
            from: message.to,
            to: message.from,
            success: true,
            result,
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          };
          
          this.handleResponse(response);
        })
        .catch(error => {
          const mcpError = MCPError.fromError(error, message.to);
          const response: AgentResponse = {
            id: this.generateResponseId(),
            messageId: message.id,
            from: message.to,
            to: message.from,
            success: false,
            error: {
              code: mcpError.code.toString(),
              message: mcpError.message,
              details: mcpError.details
            },
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          };
          
          this.handleResponse(response);
        });

      this.emit('message:sent', message);
    });
  }

  private async routeMessage(message: AgentMessage, capability: AgentCapability): Promise<any> {
    // Route to specific agent implementation
    switch (message.to) {
      case 'content-mentor-orchestrator':
        return await this.routeToContentMentor(message);
      case 'bitcoin-news-analyzer':
        return await this.routeToNewsAnalyzer(message);
      case 'market-intelligence-agent':
        return await this.routeToMarketIntelligence(message);
      case 'platform-strategy-mentor':
        return await this.routeToPlatformStrategy(message);
      default:
        throw new MCPError(
          ErrorCode.AGENT_NOT_FOUND,
          `Unknown agent: ${message.to}`
        );
    }
  }

  private async routeToContentMentor(message: AgentMessage): Promise<any> {
    const { contentMentorOrchestrator } = await import('../agents/ContentMentorOrchestrator.js');
    
    switch (message.method) {
      case 'analyze-content':
        return contentMentorOrchestrator.analyzeContentForPublishing(
          message.params.content,
          message.params.contentType || 'tweet'
        );
      case 'generate-strategy':
        return contentMentorOrchestrator.generatePublishingStrategy(
          message.params.content,
          message.params.contentType || 'tweet'
        );
      case 'get-report':
        return contentMentorOrchestrator.getComprehensiveContentReport(message.params.content);
      default:
        throw new MCPError(ErrorCode.METHOD_NOT_ALLOWED, `Unknown method: ${message.method}`);
    }
  }

  private async routeToNewsAnalyzer(message: AgentMessage): Promise<any> {
    const { bitcoinNewsAnalyzer } = await import('../agents/BitcoinNewsAnalyzer.js');
    
    switch (message.method) {
      case 'analyze-news':
        return bitcoinNewsAnalyzer.analyzeNewsForEducationalContent(message.params.newsItems);
      case 'daily-digest':
        return bitcoinNewsAnalyzer.generateDailyNewsDigest();
      case 'content-ideas':
        return bitcoinNewsAnalyzer.generateNewsBasedContentIdeas(
          message.params.topic,
          message.params.context
        );
      default:
        throw new MCPError(ErrorCode.METHOD_NOT_ALLOWED, `Unknown method: ${message.method}`);
    }
  }

  private async routeToMarketIntelligence(message: AgentMessage): Promise<any> {
    const { marketIntelligenceAgent } = await import('../agents/MarketIntelligenceAgent.js');
    
    switch (message.method) {
      case 'analyze-market':
        return marketIntelligenceAgent.analyzeMarketForEducation(
          message.params.marketData,
          message.params.networkHealth
        );
      case 'daily-insight':
        return marketIntelligenceAgent.generateDailyMarketInsight();
      case 'monitor-setup':
        return marketIntelligenceAgent.createRealTimeMonitoringSystem();
      default:
        throw new MCPError(ErrorCode.METHOD_NOT_ALLOWED, `Unknown method: ${message.method}`);
    }
  }

  private async routeToPlatformStrategy(message: AgentMessage): Promise<any> {
    const { platformStrategyMentor } = await import('../agents/PlatformStrategyMentor.js');
    
    switch (message.method) {
      case 'analyze-platform':
        return platformStrategyMentor.analyzePlatform(message.params.platform);
      case 'platform-comparison':
        return platformStrategyMentor.generatePlatformComparison();
      case 'bitcoin-strategy':
        return platformStrategyMentor.getBitcoinEducationRecommendation();
      default:
        throw new MCPError(ErrorCode.METHOD_NOT_ALLOWED, `Unknown method: ${message.method}`);
    }
  }

  private handleResponse(response: AgentResponse): void {
    const pending = this.pendingMessages.get(response.messageId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingMessages.delete(response.messageId);
      
      if (response.success) {
        pending.resolve(response);
      } else {
        const error = new MCPError(
          parseInt(response.error!.code) as ErrorCode,
          response.error!.message,
          response.error!.details,
          response.from
        );
        pending.reject(error);
      }
    }
    
    this.emit('message:received', response);
  }

  private recordResponse(response: AgentResponse): void {
    this.messageHistory.push(response);
    
    // Maintain history size limit
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }

  // Health monitoring
  private startHealthCheck(): void {
    setInterval(() => {
      this.checkAgentHealth();
    }, 30000); // Check every 30 seconds
  }

  private checkAgentHealth(): void {
    const now = new Date();
    
    for (const [agentId, agent] of this.agents.entries()) {
      const timeSinceHeartbeat = now.getTime() - agent.lastHeartbeat.getTime();
      
      // Consider agent unhealthy if no heartbeat for 2 minutes
      if (timeSinceHeartbeat > 120000 && agent.status === 'ready') {
        agent.status = 'error';
        console.warn(`⚠️  Agent ${agentId} appears unhealthy (no heartbeat for ${Math.round(timeSinceHeartbeat / 1000)}s)`);
        this.emit('agent:unhealthy', { agentId, timeSinceHeartbeat });
      }
    }
  }

  // Heartbeat from agents
  heartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      if (agent.status === 'error') {
        agent.status = 'ready';
        console.log(`✅ Agent ${agentId} recovered`);
        this.emit('agent:recovered', agentId);
      }
    }
  }

  // Utility methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Status and monitoring
  getProtocolStatus(): {
    agents: { total: number; ready: number; error: number };
    messages: { pending: number; history: number };
    performance: { avgResponseTime: number };
  } {
    const agentStatuses = Array.from(this.agents.values()).map(a => a.status);
    const ready = agentStatuses.filter(s => s === 'ready').length;
    const error = agentStatuses.filter(s => s === 'error').length;
    
    const recentResponses = this.messageHistory.slice(-100);
    const avgResponseTime = recentResponses.length > 0
      ? recentResponses.reduce((sum, r) => sum + r.processingTime, 0) / recentResponses.length
      : 0;

    return {
      agents: {
        total: this.agents.size,
        ready,
        error
      },
      messages: {
        pending: this.pendingMessages.size,
        history: this.messageHistory.length
      },
      performance: {
        avgResponseTime: Math.round(avgResponseTime)
      }
    };
  }

  listAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): AgentRegistration | undefined {
    return this.agents.get(agentId);
  }

  getMessageHistory(limit = 50): AgentResponse[] {
    return this.messageHistory.slice(-limit);
  }
}

export const agentCommunicationProtocol = new AgentCommunicationProtocol();