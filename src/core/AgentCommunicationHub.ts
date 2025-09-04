/**
 * Agent Communication Hub
 * Optimizes inter-agent communication with message routing, load balancing, and resource sharing
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { MCPProtocolHandler, MCPMessage, MCPResponse } from './MCPProtocol.js';
import { BaseAgent, AgentResult } from './BaseAgent.js';
import { IntelligentCache } from './IntelligentCache.js';

export interface AgentRegistration {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  status: 'active' | 'busy' | 'inactive' | 'error';
  loadScore: number;
  lastHeartbeat: number;
  instance: BaseAgent;
}

export interface MessageRoute {
  from: string;
  to: string;
  method: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timeout: number;
  retryAttempts: number;
}

export interface CommunicationMetrics {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  averageResponseTime: number;
  activeAgents: number;
  queuedMessages: number;
}

export class AgentCommunicationHub extends EventEmitter {
  private agents = new Map<string, AgentRegistration>();
  private messageQueue: Array<{
    id: string;
    route: MessageRoute;
    message: MCPMessage;
    timestamp: number;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private processingQueue = false;
  private metrics: CommunicationMetrics;
  private cache: IntelligentCache;
  private mcpProtocol: MCPProtocolHandler;

  constructor() {
    super();
    this.metrics = {
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      averageResponseTime: 0,
      activeAgents: 0,
      queuedMessages: 0
    };
    
    this.cache = new IntelligentCache({
      maxSize: 500,
      defaultTtl: 10 * 60 * 1000, // 10 minutes for agent communication
      enableMetrics: true
    });
    
    this.mcpProtocol = new MCPProtocolHandler({
      resources: { subscribe: true, listChanged: true },
      tools: { listChanged: true },
      prompts: { listChanged: true },
      logging: {}
    });

    this.startHeartbeatMonitor();
    this.startQueueProcessor();
    
    logger.info('Agent Communication Hub initialized');
  }

  /**
   * Register an agent with the hub
   */
  registerAgent(agent: BaseAgent): string {
    const id = this.generateAgentId(agent.getInfo().name);
    const info = agent.getInfo();
    
    const registration: AgentRegistration = {
      id,
      name: info.name,
      version: info.version,
      capabilities: agent.getCapabilities(),
      status: 'active',
      loadScore: 0,
      lastHeartbeat: Date.now(),
      instance: agent
    };

    this.agents.set(id, registration);
    this.updateMetrics();
    
    logger.info('Agent registered', { 
      id, 
      name: registration.name, 
      capabilities: registration.capabilities 
    });
    
    this.emit('agentRegistered', registration);
    return id;
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    this.agents.delete(agentId);
    this.updateMetrics();
    
    logger.info('Agent unregistered', { id: agentId, name: agent.name });
    this.emit('agentUnregistered', { id: agentId, name: agent.name });
    
    return true;
  }

  /**
   * Send message between agents with optimization
   */
  async sendMessage(
    from: string,
    to: string,
    message: MCPMessage,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      timeout?: number;
      retryAttempts?: number;
      cacheResult?: boolean;
    } = {}
  ): Promise<any> {
    const route: MessageRoute = {
      from,
      to,
      method: message.method,
      priority: options.priority || 'normal',
      timeout: options.timeout || 30000,
      retryAttempts: options.retryAttempts || 3
    };

    // Check cache first for idempotent operations
    if (options.cacheResult && this.isIdempotentOperation(message.method)) {
      const cacheKey = this.getCacheKey(to, message);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug('Returning cached response', { cacheKey });
        return cached;
      }
    }

    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      
      this.messageQueue.push({
        id: messageId,
        route,
        message,
        timestamp: Date.now(),
        resolve,
        reject
      });
      
      this.metrics.queuedMessages = this.messageQueue.length;
      this.processQueue();
      
      // Set timeout
      setTimeout(() => {
        reject(new Error(`Message timeout: ${route.method} to ${to}`));
      }, route.timeout);
    });
  }

  /**
   * Broadcast message to multiple agents
   */
  async broadcastMessage(
    from: string,
    message: MCPMessage,
    filter?: (agent: AgentRegistration) => boolean
  ): Promise<Map<string, any>> {
    const targetAgents = Array.from(this.agents.values()).filter(agent => {
      if (agent.id === from) return false;
      if (agent.status !== 'active') return false;
      return filter ? filter(agent) : true;
    });

    const results = new Map<string, any>();
    const promises = targetAgents.map(async (agent) => {
      try {
        const result = await this.sendMessage(from, agent.id, message, { priority: 'normal' });
        results.set(agent.id, result);
      } catch (error) {
        results.set(agent.id, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Find optimal agent for a task based on capabilities and load
   */
  findOptimalAgent(requiredCapabilities: string[], excludeAgents: string[] = []): string | null {
    const candidates = Array.from(this.agents.values()).filter(agent => {
      if (excludeAgents.includes(agent.id)) return false;
      if (agent.status !== 'active') return false;
      return requiredCapabilities.every(cap => agent.capabilities.includes(cap));
    });

    if (candidates.length === 0) return null;

    // Sort by load score (lower is better)
    candidates.sort((a, b) => a.loadScore - b.loadScore);
    
    return candidates[0].id;
  }

  /**
   * Get agent status and health
   */
  getAgentStatus(agentId: string): AgentRegistration | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * List all registered agents
   */
  listAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get communication metrics
   */
  getMetrics(): CommunicationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed statistics
   */
  getDetailedStats() {
    const agentStats = Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      loadScore: agent.loadScore,
      capabilities: agent.capabilities,
      lastHeartbeat: agent.lastHeartbeat
    }));

    return {
      agents: agentStats,
      metrics: this.metrics,
      cache: this.cache.getStats(),
      queueSize: this.messageQueue.length,
      uptime: Date.now() - (this.metrics as any).startTime || 0
    };
  }

  /**
   * Shutdown the communication hub
   */
  shutdown(): void {
    this.cache.shutdown();
    this.agents.clear();
    this.messageQueue = [];
    this.removeAllListeners();
    logger.info('Agent Communication Hub shutdown');
  }

  // Private methods
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      // Sort by priority
      this.messageQueue.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.route.priority] - priorityOrder[a.route.priority];
      });

      const message = this.messageQueue.shift();
      if (!message) {
        this.processingQueue = false;
        return;
      }

      this.metrics.queuedMessages = this.messageQueue.length;
      await this.processMessage(message);

    } catch (error) {
      logger.error('Queue processing error', { error });
    } finally {
      this.processingQueue = false;
      
      // Continue processing if there are more messages
      if (this.messageQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  private async processMessage(queuedMessage: any): Promise<void> {
    const { route, message, resolve, reject, timestamp } = queuedMessage;
    const startTime = Date.now();

    try {
      const targetAgent = this.agents.get(route.to);
      if (!targetAgent) {
        throw new Error(`Target agent not found: ${route.to}`);
      }

      // Update agent load
      targetAgent.loadScore++;
      targetAgent.status = 'busy';

      // Process through MCP protocol
      const response = await this.mcpProtocol.processMessage(message);
      
      // Cache result if applicable
      if (this.isIdempotentOperation(message.method)) {
        const cacheKey = this.getCacheKey(route.to, message);
        this.cache.set(cacheKey, response, 5 * 60 * 1000); // 5 minutes
      }

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateResponseTimeMetrics(responseTime);
      this.metrics.successfulMessages++;

      // Update agent status
      targetAgent.loadScore = Math.max(0, targetAgent.loadScore - 1);
      targetAgent.status = 'active';
      targetAgent.lastHeartbeat = Date.now();

      resolve(response);

    } catch (error) {
      this.metrics.failedMessages++;
      
      const targetAgent = this.agents.get(route.to);
      if (targetAgent) {
        targetAgent.loadScore = Math.max(0, targetAgent.loadScore - 1);
        targetAgent.status = 'active';
      }

      logger.error('Message processing failed', {
        from: route.from,
        to: route.to,
        method: route.method,
        error
      });

      reject(error);
    }

    this.metrics.totalMessages++;
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        this.processQueue();
      }
    }, 100); // Process every 100ms
  }

  private startHeartbeatMonitor(): void {
    setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 1 minute timeout

      for (const [id, agent] of this.agents.entries()) {
        if (now - agent.lastHeartbeat > timeout) {
          agent.status = 'inactive';
          logger.warn('Agent heartbeat timeout', { id, name: agent.name });
          this.emit('agentTimeout', { id, name: agent.name });
        }
      }

      this.updateMetrics();
    }, 30000); // Check every 30 seconds
  }

  private updateMetrics(): void {
    this.metrics.activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'active').length;
  }

  private updateResponseTimeMetrics(responseTime: number): void {
    const total = this.metrics.successfulMessages;
    const currentAverage = this.metrics.averageResponseTime;
    
    this.metrics.averageResponseTime = total === 0 
      ? responseTime 
      : ((currentAverage * (total - 1)) + responseTime) / total;
  }

  private generateAgentId(name: string): string {
    return `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(agentId: string, message: MCPMessage): string {
    const params = message.params ? JSON.stringify(message.params) : '';
    return `${agentId}:${message.method}:${params}`;
  }

  private isIdempotentOperation(method: string): boolean {
    // Methods that are safe to cache
    const idempotentMethods = [
      'resources/list',
      'resources/read',
      'tools/list',
      'prompts/list',
      'bitcoin/price',
      'bitcoin/fees',
      'news/list'
    ];
    
    return idempotentMethods.includes(method);
  }
}

// Global communication hub instance
export const communicationHub = new AgentCommunicationHub();
