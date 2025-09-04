import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { performanceMonitor } from './PerformanceMonitor.js';

export interface AgentEvent {
  id: string;
  type: string;
  source_agent: string;
  target_agent?: string;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requires_response?: boolean;
  correlation_id?: string;
}

export interface AgentCapability {
  agent_id: string;
  capabilities: string[];
  event_types_handled: string[];
  max_concurrent_operations: number;
  current_load: number;
  status: 'active' | 'busy' | 'offline' | 'error';
}

export interface WorkflowStep {
  id: string;
  agent_id: string;
  operation: string;
  input_data: any;
  dependencies: string[];
  timeout_ms: number;
  retry_count: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export class EventDrivenCoordinator extends EventEmitter {
  private agents: Map<string, AgentCapability> = new Map();
  private eventQueue: AgentEvent[] = [];
  private workflows: Map<string, Workflow> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private processingInterval?: NodeJS.Timeout;
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    super();
    this.startEventProcessing();
    logger.info('EventDrivenCoordinator initialized');
  }

  /**
   * Register an agent with its capabilities
   */
  registerAgent(capability: AgentCapability): void {
    this.agents.set(capability.agent_id, capability);
    
    // Setup event handlers for this agent
    capability.event_types_handled.forEach(eventType => {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
    });

    this.emit('agent_registered', capability);
    logger.info(`Registered agent: ${capability.agent_id} with capabilities: ${capability.capabilities.join(', ')}`);
  }

  /**
   * Publish an event to the coordination system
   */
  publishEvent(event: Omit<AgentEvent, 'id' | 'timestamp'>): string {
    const fullEvent: AgentEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Add to queue based on priority
    this.addEventToQueue(fullEvent);
    
    this.emit('event_published', fullEvent);
    logger.debug(`Published event: ${fullEvent.type} from ${fullEvent.source_agent}`);
    
    return fullEvent.id;
  }

  /**
   * Subscribe to specific event types
   */
  subscribeToEvents(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    logger.debug(`Added handler for event type: ${eventType}`);
  }

  /**
   * Create and execute a workflow
   */
  async executeWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'status'>): Promise<string> {
    const fullWorkflow: Workflow = {
      ...workflow,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    this.workflows.set(fullWorkflow.id, fullWorkflow);
    
    // Start workflow execution
    this.processWorkflow(fullWorkflow.id);
    
    this.emit('workflow_started', fullWorkflow);
    logger.info(`Started workflow: ${fullWorkflow.name} (${fullWorkflow.id})`);
    
    return fullWorkflow.id;
  }

  /**
   * Update shared knowledge base
   */
  updateKnowledge(key: string, value: any, source_agent: string): void {
    this.knowledgeBase.set(key, {
      value,
      source: source_agent,
      timestamp: new Date().toISOString()
    });

    // Notify interested agents
    this.publishEvent({
      type: 'knowledge_updated',
      source_agent,
      data: { key, value },
      priority: 'medium'
    });

    logger.debug(`Knowledge updated: ${key} by ${source_agent}`);
  }

  /**
   * Get knowledge from shared base
   */
  getKnowledge(key: string): any {
    const knowledge = this.knowledgeBase.get(key);
    return knowledge?.value;
  }

  /**
   * Get all available knowledge keys
   */
  getKnowledgeKeys(): string[] {
    return Array.from(this.knowledgeBase.keys());
  }

  /**
   * Find best agent for a capability
   */
  findBestAgent(requiredCapability: string): string | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.capabilities.includes(requiredCapability) &&
        agent.status === 'active' &&
        agent.current_load < agent.max_concurrent_operations
      )
      .sort((a, b) => a.current_load - b.current_load); // Sort by load

    return availableAgents.length > 0 ? availableAgents[0].agent_id : null;
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: AgentCapability['status'], currentLoad?: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      if (currentLoad !== undefined) {
        agent.current_load = currentLoad;
      }

      this.emit('agent_status_updated', { agent_id: agentId, status, current_load: agent.current_load });
      logger.debug(`Agent ${agentId} status updated: ${status} (load: ${agent.current_load})`);
    }
  }

  /**
   * Get system health overview
   */
  getSystemHealth(): {
    total_agents: number;
    active_agents: number;
    busy_agents: number;
    offline_agents: number;
    pending_events: number;
    active_workflows: number;
    knowledge_items: number;
    average_load: number;
  } {
    const agents = Array.from(this.agents.values());
    const activeWorkflows = Array.from(this.workflows.values())
      .filter(wf => wf.status === 'running');

    return {
      total_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      busy_agents: agents.filter(a => a.status === 'busy').length,
      offline_agents: agents.filter(a => a.status === 'offline').length,
      pending_events: this.eventQueue.length,
      active_workflows: activeWorkflows.length,
      knowledge_items: this.knowledgeBase.size,
      average_load: agents.length > 0 
        ? agents.reduce((sum, a) => sum + a.current_load, 0) / agents.length 
        : 0
    };
  }

  private addEventToQueue(event: AgentEvent): void {
    // Insert event based on priority
    const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
    const eventPriority = priorities[event.priority];
    
    let insertIndex = 0;
    for (let i = 0; i < this.eventQueue.length; i++) {
      if (priorities[this.eventQueue[i].priority] > eventPriority) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }
    
    this.eventQueue.splice(insertIndex, 0, event);
  }

  private startEventProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processEventQueue();
    }, 1000); // Process events every second
  }

  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }
  }

  private processEvent(event: AgentEvent): void {
    const operationId = performanceMonitor.startOperation(
      'event-coordinator',
      `process_event_${event.type}`,
      { event_id: event.id, source: event.source_agent }
    );

    try {
      // Find handlers for this event type
      const handlers = this.eventHandlers.get(event.type) || [];
      
      if (handlers.length === 0) {
        logger.warn(`No handlers found for event type: ${event.type}`);
        performanceMonitor.completeOperation(operationId, false, 'No handlers found');
        return;
      }

      // Execute handlers
      handlers.forEach(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(`Event handler error for ${event.type}:`, error);
          this.emit('event_processing_error', { event, error });
        }
      });

      // If event requires response and has target agent
      if (event.requires_response && event.target_agent) {
        this.routeEventToAgent(event);
      }

      this.emit('event_processed', event);
      performanceMonitor.completeOperation(operationId, true);
      
    } catch (error) {
      logger.error(`Failed to process event ${event.id}:`, error);
      performanceMonitor.completeOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private routeEventToAgent(event: AgentEvent): void {
    if (!event.target_agent) return;

    const targetAgent = this.agents.get(event.target_agent);
    if (!targetAgent) {
      logger.warn(`Target agent not found: ${event.target_agent}`);
      return;
    }

    if (targetAgent.status !== 'active' || 
        targetAgent.current_load >= targetAgent.max_concurrent_operations) {
      // Find alternative agent or queue for later
      const alternativeAgent = this.findBestAgent(event.type);
      if (alternativeAgent) {
        event.target_agent = alternativeAgent;
        this.addEventToQueue(event);
        logger.info(`Rerouted event ${event.id} to ${alternativeAgent}`);
      } else {
        logger.warn(`No available agent for event ${event.id}`);
      }
    }
  }

  private async processWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.status = 'running';
    
    const operationId = performanceMonitor.startOperation(
      'workflow-coordinator',
      `execute_workflow_${workflow.name}`,
      { workflow_id: workflowId }
    );

    try {
      // Process steps with dependency resolution
      const processedSteps: Set<string> = new Set();
      const pendingSteps = [...workflow.steps];

      while (pendingSteps.length > 0 && workflow.status === 'running') {
        const readySteps = pendingSteps.filter(step => 
          step.dependencies.every(dep => processedSteps.has(dep))
        );

        if (readySteps.length === 0) {
          throw new Error('Circular dependency or missing dependency in workflow');
        }

        // Execute ready steps in parallel
        const stepPromises = readySteps.map(step => this.executeWorkflowStep(step));
        const results = await Promise.allSettled(stepPromises);

        // Process results
        results.forEach((result, index) => {
          const step = readySteps[index];
          if (result.status === 'fulfilled') {
            step.status = 'completed';
            step.result = result.value;
            processedSteps.add(step.id);
          } else {
            step.status = 'failed';
            step.error = result.reason?.message || 'Unknown error';
            workflow.status = 'failed';
          }
        });

        // Remove processed steps
        readySteps.forEach(step => {
          const index = pendingSteps.indexOf(step);
          if (index !== -1) pendingSteps.splice(index, 1);
        });
      }

      if (workflow.status !== 'failed') {
        workflow.status = 'completed';
        workflow.completed_at = new Date().toISOString();
      }

      this.emit('workflow_completed', workflow);
      performanceMonitor.completeOperation(operationId, workflow.status === 'completed');
      
    } catch (error) {
      workflow.status = 'failed';
      logger.error(`Workflow ${workflowId} failed:`, error);
      this.emit('workflow_failed', { workflow, error });
      performanceMonitor.completeOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async executeWorkflowStep(step: WorkflowStep): Promise<any> {
    step.status = 'running';
    
    const agent = this.agents.get(step.agent_id);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agent_id}`);
    }

    // Update agent load
    this.updateAgentStatus(step.agent_id, 'busy', agent.current_load + 1);

    try {
      // Create execution event
      const eventId = this.publishEvent({
        type: 'workflow_step_execution',
        source_agent: 'workflow-coordinator',
        target_agent: step.agent_id,
        data: {
          operation: step.operation,
          input: step.input_data,
          step_id: step.id
        },
        priority: 'high',
        requires_response: true
      });

      // Wait for completion or timeout
      const result = await this.waitForStepCompletion(eventId, step.timeout_ms);
      
      // Update agent load
      this.updateAgentStatus(step.agent_id, 'active', agent.current_load - 1);
      
      return result;
      
    } catch (error) {
      // Update agent load on error
      this.updateAgentStatus(step.agent_id, 'active', agent.current_load - 1);
      throw error;
    }
  }

  private async waitForStepCompletion(eventId: string, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Step execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const handleCompletion = (result: any) => {
        clearTimeout(timeout);
        resolve(result);
      };

      const handleError = (error: any) => {
        clearTimeout(timeout);
        reject(error);
      };

      // Listen for completion
      this.once(`step_completed_${eventId}`, handleCompletion);
      this.once(`step_failed_${eventId}`, handleError);
    });
  }

  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.agents.clear();
    this.eventQueue.length = 0;
    this.workflows.clear();
    this.eventHandlers.clear();
    this.knowledgeBase.clear();
    this.removeAllListeners();
    
    logger.info('EventDrivenCoordinator destroyed');
  }
}

export const eventCoordinator = new EventDrivenCoordinator();

// Register default event handlers
eventCoordinator.subscribeToEvents('system_health_check', (event: AgentEvent) => {
  const health = eventCoordinator.getSystemHealth();
  eventCoordinator.publishEvent({
    type: 'system_health_response',
    source_agent: 'event-coordinator',
    target_agent: event.source_agent,
    data: health,
    priority: 'medium'
  });
});

eventCoordinator.subscribeToEvents('knowledge_request', (event: AgentEvent) => {
  const { key } = event.data;
  const value = eventCoordinator.getKnowledge(key);
  
  eventCoordinator.publishEvent({
    type: 'knowledge_response',
    source_agent: 'event-coordinator',
    target_agent: event.source_agent,
    data: { key, value, found: value !== undefined },
    priority: 'medium',
    correlation_id: event.id
  });
});