/**
 * Base Agent Class
 * Provides common functionality for all agents to reduce code duplication
 */

import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { MCPError, handleUnknownError, MCPErrorCode } from './MCPErrors.js';

export interface AgentConfig {
  name: string;
  version?: string;
  cacheEnabled?: boolean;
  cacheDurationMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: MCPError;
  timestamp: number;
  executionTimeMs: number;
  agentName: string;
  operationName: string;
}

export abstract class BaseAgent {
  protected readonly config: Required<AgentConfig>;
  private startTime: number = 0;

  constructor(config: AgentConfig) {
    this.config = {
      version: '1.0.0',
      cacheEnabled: true,
      cacheDurationMs: 30 * 60 * 1000, // 30 minutes default
      retryAttempts: 3,
      retryDelayMs: 1000,
      ...config,
    };
    
    logger.info(`Initializing ${this.config.name} v${this.config.version}`);
  }

  /**
   * Execute an operation with common error handling, caching, and retry logic
   */
  protected async executeWithCommonHandling<T>(
    operationName: string,
    operation: () => Promise<T>,
    cacheKey?: string
  ): Promise<AgentResult<T>> {
    this.startTime = Date.now();
    const fullCacheKey = cacheKey ? `${this.config.name}_${cacheKey}` : null;

    try {
      // Check cache first
      if (fullCacheKey && this.config.cacheEnabled) {
        const cached = cacheStore.get<T>(fullCacheKey);
        if (cached) {
          logger.info(`Cache hit for ${this.config.name}:${operationName}`);
          return this.createSuccessResult(cached, operationName);
        }
      }

      // Execute operation with retry logic
      const result = await this.executeWithRetry(operation);
      
      // Cache successful results
      if (fullCacheKey && this.config.cacheEnabled) {
        cacheStore.set(fullCacheKey, result, this.config.cacheDurationMs);
      }

      logger.info(`${this.config.name}:${operationName} completed successfully`);
      return this.createSuccessResult(result, operationName);

    } catch (error) {
      return this.createErrorResult(error, operationName);
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.retryAttempts) {
          throw lastError;
        }
        
        logger.warn(`${this.config.name} attempt ${attempt} failed, retrying in ${this.config.retryDelayMs}ms:`, lastError.message);
        await this.sleep(this.config.retryDelayMs * attempt); // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  /**
   * Create standardized success result
   */
  private createSuccessResult<T>(data: T, operationName: string = 'unknown'): AgentResult<T> {
    return {
      success: true,
      data,
      timestamp: Date.now(),
      executionTimeMs: Date.now() - this.startTime,
      agentName: this.config.name,
      operationName,
    };
  }

  /**
   * Create standardized error result with MCP-compliant error handling
   */
  private createErrorResult<T>(error: unknown, operationName: string): AgentResult<T> {
    const mcpError = handleUnknownError(error, `${this.config.name}:${operationName}`);
    
    logger.error(`${this.config.name}:${operationName} failed:`, mcpError.message);
    
    return {
      success: false,
      error: mcpError,
      timestamp: Date.now(),
      executionTimeMs: Date.now() - this.startTime,
      agentName: this.config.name,
      operationName,
    };
  }

  /**
   * Utility method for async sleep
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate required configuration or inputs
   */
  protected validateRequired<T>(value: T | undefined | null, fieldName: string): T {
    if (value === undefined || value === null) {
      throw new Error(`Required field '${fieldName}' is missing`);
    }
    return value;
  }

  /**
   * Get agent information
   */
  public getInfo(): { name: string; version: string } {
    return {
      name: this.config.name,
      version: this.config.version,
    };
  }

  /**
   * Abstract method that agents must implement
   */
  public abstract getCapabilities(): string[];
}
