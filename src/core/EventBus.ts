import { logger } from '../utils/logger.js';

export interface EventListener<T = any> {
  id: string;
  callback: (data: T, metadata: EventMetadata) => Promise<void> | void;
  once?: boolean;
  priority?: number; // Higher priority = called first
  filter?: (data: T, metadata: EventMetadata) => boolean;
}

export interface EventMetadata {
  eventName: string;
  timestamp: number;
  source?: string;
  correlationId?: string;
  retryCount?: number;
}

export interface EventOptions {
  source?: string;
  correlationId?: string;
  delay?: number; // Delay in milliseconds
  retry?: {
    attempts: number;
    backoffMs: number;
  };
}

export interface EventHistory {
  eventName: string;
  data: any;
  metadata: EventMetadata;
  listenersNotified: number;
  errors?: Array<{ listenerId: string; error: Error }>;
}

export interface EventMetrics {
  totalEvents: number;
  totalListeners: number;
  eventCounts: Map<string, number>;
  averageListenersPerEvent: number;
  errorRate: number;
  lastEventTimestamp?: number;
}

export class EventBus {
  private listeners: Map<string, Map<string, EventListener>> = new Map();
  private history: EventHistory[] = [];
  private metrics: EventMetrics;
  private maxHistorySize: number = 1000;
  private enableMetrics: boolean = true;
  private globalErrorHandler?: (error: Error, event: string, listener: EventListener) => void;

  constructor(options: {
    maxHistorySize?: number;
    enableMetrics?: boolean;
    globalErrorHandler?: (error: Error, event: string, listener: EventListener) => void;
  } = {}) {
    this.maxHistorySize = options.maxHistorySize ?? 1000;
    this.enableMetrics = options.enableMetrics ?? true;
    this.globalErrorHandler = options.globalErrorHandler;

    this.metrics = {
      totalEvents: 0,
      totalListeners: 0,
      eventCounts: new Map(),
      averageListenersPerEvent: 0,
      errorRate: 0
    };

    logger.debug('EventBus initialized');
  }

  /**
   * Subscribe to an event
   */
  subscribe<T = any>(
    eventName: string,
    callback: (data: T, metadata: EventMetadata) => Promise<void> | void,
    options: {
      once?: boolean;
      priority?: number;
      filter?: (data: T, metadata: EventMetadata) => boolean;
      listenerId?: string;
    } = {}
  ): string {
    const listenerId = options.listenerId || this.generateId();

    const listener: EventListener<T> = {
      id: listenerId,
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      filter: options.filter
    };

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Map());
    }

    this.listeners.get(eventName)!.set(listenerId, listener);

    if (this.enableMetrics) {
      this.metrics.totalListeners++;
    }

    logger.debug(`Subscribed to event: ${eventName} (listener: ${listenerId})`);
    return listenerId;
  }

  /**
   * Subscribe to an event only once
   */
  once<T = any>(
    eventName: string,
    callback: (data: T, metadata: EventMetadata) => Promise<void> | void,
    options: {
      priority?: number;
      filter?: (data: T, metadata: EventMetadata) => boolean;
      listenerId?: string;
    } = {}
  ): string {
    return this.subscribe(eventName, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventName: string, listenerId: string): boolean {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      return false;
    }

    const removed = eventListeners.delete(listenerId);
    
    if (removed && this.enableMetrics) {
      this.metrics.totalListeners--;
    }

    // Clean up empty event maps
    if (eventListeners.size === 0) {
      this.listeners.delete(eventName);
    }

    if (removed) {
      logger.debug(`Unsubscribed from event: ${eventName} (listener: ${listenerId})`);
    }

    return removed;
  }

  /**
   * Unsubscribe all listeners for an event
   */
  unsubscribeAll(eventName: string): number {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      return 0;
    }

    const count = eventListeners.size;
    this.listeners.delete(eventName);

    if (this.enableMetrics) {
      this.metrics.totalListeners -= count;
    }

    logger.debug(`Unsubscribed all listeners from event: ${eventName} (${count} listeners)`);
    return count;
  }

  /**
   * Emit an event
   */
  async emit<T = any>(
    eventName: string,
    data: T,
    options: EventOptions = {}
  ): Promise<void> {
    const metadata: EventMetadata = {
      eventName,
      timestamp: Date.now(),
      source: options.source,
      correlationId: options.correlationId || this.generateId(),
      retryCount: 0
    };

    // Handle delayed emission
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        this.doEmit(eventName, data, metadata, options.retry);
      }, options.delay);
      return;
    }

    await this.doEmit(eventName, data, metadata, options.retry);
  }

  /**
   * Emit an event synchronously (fire and forget)
   */
  emitSync<T = any>(
    eventName: string,
    data: T,
    options: Omit<EventOptions, 'retry'> = {}
  ): void {
    const metadata: EventMetadata = {
      eventName,
      timestamp: Date.now(),
      source: options.source,
      correlationId: options.correlationId || this.generateId(),
      retryCount: 0
    };

    // Handle delayed emission
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        this.doEmitSync(eventName, data, metadata);
      }, options.delay);
      return;
    }

    this.doEmitSync(eventName, data, metadata);
  }

  /**
   * Get all event names that have listeners
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listeners for a specific event
   */
  getListeners(eventName: string): EventListener[] {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? Array.from(eventListeners.values()) : [];
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName: string): number {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Get total listener count
   */
  getTotalListenerCount(): number {
    let count = 0;
    for (const eventListeners of this.listeners.values()) {
      count += eventListeners.size;
    }
    return count;
  }

  /**
   * Check if an event has any listeners
   */
  hasListeners(eventName: string): boolean {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.size > 0 : false;
  }

  /**
   * Get event history
   */
  getHistory(eventName?: string, limit?: number): EventHistory[] {
    let history = this.history;

    if (eventName) {
      history = history.filter(h => h.eventName === eventName);
    }

    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
    logger.debug('Event history cleared');
  }

  /**
   * Get event metrics
   */
  getMetrics(): EventMetrics {
    if (!this.enableMetrics) {
      return {
        totalEvents: 0,
        totalListeners: 0,
        eventCounts: new Map(),
        averageListenersPerEvent: 0,
        errorRate: 0
      };
    }

    // Calculate average listeners per event
    const totalEvents = this.listeners.size;
    this.metrics.averageListenersPerEvent = totalEvents > 0 
      ? this.metrics.totalListeners / totalEvents 
      : 0;

    // Calculate error rate
    const totalErrorCount = Array.from(this.metrics.eventCounts.values())
      .reduce((sum, count) => sum + count, 0);
    this.metrics.errorRate = this.metrics.totalEvents > 0 
      ? (totalErrorCount / this.metrics.totalEvents) * 100 
      : 0;

    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      totalListeners: this.getTotalListenerCount(),
      eventCounts: new Map(),
      averageListenersPerEvent: 0,
      errorRate: 0
    };
    logger.debug('Event metrics reset');
  }

  /**
   * Set global error handler
   */
  setGlobalErrorHandler(handler: (error: Error, event: string, listener: EventListener) => void): void {
    this.globalErrorHandler = handler;
  }

  /**
   * Clear all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.history = [];
    this.resetMetrics();
    logger.info('EventBus cleared');
  }

  /**
   * Create a namespaced event bus
   */
  namespace(prefix: string): NamespacedEventBus {
    return new NamespacedEventBus(this, prefix);
  }

  /**
   * Wait for a specific event
   */
  waitFor<T = any>(
    eventName: string,
    timeout?: number,
    filter?: (data: T, metadata: EventMetadata) => boolean
  ): Promise<{ data: T; metadata: EventMetadata }> {
    return new Promise((resolve, reject) => {
      let timeoutHandle: NodeJS.Timeout | undefined;

      const listenerId = this.once(eventName, (data: T, metadata: EventMetadata) => {
        if (filter && !filter(data, metadata)) {
          return; // Re-subscribe for next event
        }

        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        resolve({ data, metadata });
      });

      if (timeout && timeout > 0) {
        timeoutHandle = setTimeout(() => {
          this.unsubscribe(eventName, listenerId);
          reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, timeout);
      }
    });
  }

  /**
   * Internal emit implementation with retry support
   */
  private async doEmit<T = any>(
    eventName: string,
    data: T,
    metadata: EventMetadata,
    retryOptions?: { attempts: number; backoffMs: number }
  ): Promise<void> {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners || eventListeners.size === 0) {
      logger.debug(`No listeners for event: ${eventName}`);
      return;
    }

    // Sort listeners by priority (highest first)
    const sortedListeners = Array.from(eventListeners.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const errors: Array<{ listenerId: string; error: Error }> = [];
    let listenersNotified = 0;

    // Track metrics
    if (this.enableMetrics) {
      this.metrics.totalEvents++;
      const currentCount = this.metrics.eventCounts.get(eventName) || 0;
      this.metrics.eventCounts.set(eventName, currentCount + 1);
      this.metrics.lastEventTimestamp = metadata.timestamp;
    }

    // Process listeners
    for (const listener of sortedListeners) {
      try {
        // Apply filter if present
        if (listener.filter && !listener.filter(data, metadata)) {
          continue;
        }

        // Call listener
        await listener.callback(data, metadata);
        listenersNotified++;

        // Remove one-time listeners
        if (listener.once) {
          eventListeners.delete(listener.id);
          if (this.enableMetrics) {
            this.metrics.totalListeners--;
          }
        }

      } catch (error) {
        const err = error as Error;
        errors.push({ listenerId: listener.id, error: err });

        // Call global error handler
        if (this.globalErrorHandler) {
          try {
            this.globalErrorHandler(err, eventName, listener);
          } catch (handlerError) {
            logger.error('Error in global error handler:', handlerError);
          }
        }

        logger.error(`Error in event listener ${listener.id} for event ${eventName}:`, err);
      }
    }

    // Handle retries if there were errors and retry is configured
    if (errors.length > 0 && retryOptions && (metadata.retryCount || 0) < retryOptions.attempts) {
      const newMetadata = { ...metadata, retryCount: (metadata.retryCount || 0) + 1 };
      const delay = retryOptions.backoffMs * Math.pow(2, newMetadata.retryCount - 1);

      logger.warn(`Retrying event ${eventName} in ${delay}ms (attempt ${newMetadata.retryCount}/${retryOptions.attempts})`);

      setTimeout(() => {
        this.doEmit(eventName, data, newMetadata, retryOptions);
      }, delay);
    }

    // Record in history
    const historyEntry: EventHistory = {
      eventName,
      data,
      metadata,
      listenersNotified,
      errors: errors.length > 0 ? errors : undefined
    };

    this.history.push(historyEntry);

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    logger.debug(`Event emitted: ${eventName} (${listenersNotified} listeners notified, ${errors.length} errors)`);
  }

  /**
   * Internal synchronous emit implementation
   */
  private doEmitSync<T = any>(
    eventName: string,
    data: T,
    metadata: EventMetadata
  ): void {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    // Sort listeners by priority (highest first)
    const sortedListeners = Array.from(eventListeners.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const errors: Array<{ listenerId: string; error: Error }> = [];
    let listenersNotified = 0;

    // Track metrics
    if (this.enableMetrics) {
      this.metrics.totalEvents++;
      const currentCount = this.metrics.eventCounts.get(eventName) || 0;
      this.metrics.eventCounts.set(eventName, currentCount + 1);
      this.metrics.lastEventTimestamp = metadata.timestamp;
    }

    // Process listeners synchronously
    for (const listener of sortedListeners) {
      try {
        // Apply filter if present
        if (listener.filter && !listener.filter(data, metadata)) {
          continue;
        }

        // Call listener (ignore async results for sync emit)
        const result = listener.callback(data, metadata);
        if (result instanceof Promise) {
          result.catch(error => {
            logger.error(`Async error in sync event listener ${listener.id} for event ${eventName}:`, error);
          });
        }

        listenersNotified++;

        // Remove one-time listeners
        if (listener.once) {
          eventListeners.delete(listener.id);
          if (this.enableMetrics) {
            this.metrics.totalListeners--;
          }
        }

      } catch (error) {
        const err = error as Error;
        errors.push({ listenerId: listener.id, error: err });

        // Call global error handler
        if (this.globalErrorHandler) {
          try {
            this.globalErrorHandler(err, eventName, listener);
          } catch (handlerError) {
            logger.error('Error in global error handler:', handlerError);
          }
        }

        logger.error(`Error in event listener ${listener.id} for event ${eventName}:`, err);
      }
    }

    // Record in history
    const historyEntry: EventHistory = {
      eventName,
      data,
      metadata,
      listenersNotified,
      errors: errors.length > 0 ? errors : undefined
    };

    this.history.push(historyEntry);

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Namespaced event bus for scoped events
 */
export class NamespacedEventBus {
  constructor(private eventBus: EventBus, private prefix: string) {}

  subscribe<T = any>(
    eventName: string,
    callback: (data: T, metadata: EventMetadata) => Promise<void> | void,
    options?: {
      once?: boolean;
      priority?: number;
      filter?: (data: T, metadata: EventMetadata) => boolean;
      listenerId?: string;
    }
  ): string {
    return this.eventBus.subscribe(`${this.prefix}:${eventName}`, callback, options);
  }

  once<T = any>(
    eventName: string,
    callback: (data: T, metadata: EventMetadata) => Promise<void> | void,
    options?: {
      priority?: number;
      filter?: (data: T, metadata: EventMetadata) => boolean;
      listenerId?: string;
    }
  ): string {
    return this.eventBus.once(`${this.prefix}:${eventName}`, callback, options);
  }

  emit<T = any>(eventName: string, data: T, options?: EventOptions): Promise<void> {
    return this.eventBus.emit(`${this.prefix}:${eventName}`, data, { 
      ...options, 
      source: options?.source || this.prefix 
    });
  }

  emitSync<T = any>(eventName: string, data: T, options?: Omit<EventOptions, 'retry'>): void {
    return this.eventBus.emitSync(`${this.prefix}:${eventName}`, data, { 
      ...options, 
      source: options?.source || this.prefix 
    });
  }

  unsubscribe(eventName: string, listenerId: string): boolean {
    return this.eventBus.unsubscribe(`${this.prefix}:${eventName}`, listenerId);
  }

  hasListeners(eventName: string): boolean {
    return this.eventBus.hasListeners(`${this.prefix}:${eventName}`);
  }

  waitFor<T = any>(
    eventName: string,
    timeout?: number,
    filter?: (data: T, metadata: EventMetadata) => boolean
  ): Promise<{ data: T; metadata: EventMetadata }> {
    return this.eventBus.waitFor(`${this.prefix}:${eventName}`, timeout, filter);
  }
}

// Global event bus instance
export const globalEventBus = new EventBus();
