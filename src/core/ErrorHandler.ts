export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  VALIDATION_ERROR = 422,
  RATE_LIMITED = 429,

  // Server errors (5xx)
  INTERNAL_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
  TIMEOUT = 504,

  // Agent-specific errors (6xx)
  AGENT_NOT_FOUND = 600,
  AGENT_UNAVAILABLE = 601,
  AGENT_TIMEOUT = 602,
  AGENT_CONFIG_ERROR = 603,

  // External API errors (7xx)
  EXTERNAL_API_ERROR = 700,
  EXTERNAL_API_TIMEOUT = 701,
  EXTERNAL_API_RATE_LIMITED = 702,
  EXTERNAL_API_INVALID_RESPONSE = 703,

  // Bitcoin-specific errors (8xx)
  BITCOIN_NODE_UNAVAILABLE = 800,
  BITCOIN_MEMPOOL_ERROR = 801,
  BITCOIN_TRANSACTION_ERROR = 802,
  BITCOIN_BLOCK_ERROR = 803
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  source?: string;
  retryable: boolean;
  retry_count?: number;
  max_retries?: number;
}

export class MCPError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly source?: string;
  public readonly retryable: boolean;
  public retry_count: number;
  public readonly max_retries: number;

  constructor(
    code: ErrorCode,
    message: string,
    details?: any,
    source?: string,
    retryable = false,
    max_retries = 3
  ) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.source = source;
    this.retryable = retryable;
    this.retry_count = 0;
    this.max_retries = max_retries;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, MCPError);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      source: this.source,
      retryable: this.retryable,
      retry_count: this.retry_count,
      max_retries: this.max_retries
    };
  }

  canRetry(): boolean {
    return this.retryable && this.retry_count < this.max_retries;
  }

  incrementRetry(): void {
    this.retry_count++;
  }

  static fromError(error: Error, source?: string): MCPError {
    if (error instanceof MCPError) {
      return error;
    }

    // Map common Node.js errors
    if (error.message.includes('ECONNREFUSED')) {
      return new MCPError(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Service unavailable - connection refused',
        { original_error: error.message },
        source,
        true
      );
    }

    if (error.message.includes('ETIMEDOUT')) {
      return new MCPError(
        ErrorCode.TIMEOUT,
        'Request timeout',
        { original_error: error.message },
        source,
        true
      );
    }

    if (error.message.includes('Rate limit')) {
      return new MCPError(
        ErrorCode.RATE_LIMITED,
        'Rate limit exceeded',
        { original_error: error.message },
        source,
        true
      );
    }

    // Default to internal error
    return new MCPError(
      ErrorCode.INTERNAL_ERROR,
      error.message || 'Unknown error',
      { original_error: error.message, stack: error.stack },
      source,
      false
    );
  }
}

export class RetryHandler {
  private static readonly DEFAULT_DELAYS = [1000, 2000, 4000, 8000]; // Exponential backoff

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delays?: number[]
  ): Promise<T> {
    const retryDelays = delays || this.DEFAULT_DELAYS.slice(0, maxRetries);
    let lastError: MCPError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const mcpError = MCPError.fromError(error as Error);
        lastError = mcpError;

        // Don't retry if error is not retryable
        if (!mcpError.retryable || attempt === maxRetries) {
          throw mcpError;
        }

        // Wait before retry
        if (retryDelays[attempt]) {
          await this.delay(retryDelays[attempt]);
        }

        mcpError.incrementRetry();
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, details, 'validation', false);
  }
}

export class AgentError extends MCPError {
  constructor(agentId: string, message: string, details?: any, retryable = false) {
    super(
      ErrorCode.AGENT_UNAVAILABLE,
      `Agent ${agentId}: ${message}`,
      details,
      `agent:${agentId}`,
      retryable
    );
  }
}

export class ExternalAPIError extends MCPError {
  constructor(apiName: string, message: string, details?: any, retryable = true) {
    super(
      ErrorCode.EXTERNAL_API_ERROR,
      `${apiName} API: ${message}`,
      details,
      `external:${apiName}`,
      retryable
    );
  }
}

export class BitcoinAPIError extends MCPError {
  constructor(message: string, details?: any, retryable = true) {
    super(
      ErrorCode.BITCOIN_NODE_UNAVAILABLE,
      `Bitcoin API: ${message}`,
      details,
      'bitcoin-api',
      retryable
    );
  }
}

export class ErrorLogger {
  private static errorCounts: Map<string, number> = new Map();
  private static lastErrorTime: Map<string, Date> = new Map();

  static logError(error: MCPError, context?: string): void {
    const errorKey = `${error.source}:${error.code}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    this.lastErrorTime.set(errorKey, new Date());

    console.error(`❌ [${error.timestamp.toISOString()}] ${error.source || 'Unknown'}: ${error.message}`);
    
    if (context) {
      console.error(`   Context: ${context}`);
    }

    if (error.details) {
      console.error(`   Details:`, error.details);
    }

    if (error.retryable) {
      console.error(`   Retryable: Yes (${error.retry_count}/${error.max_retries})`);
    }

    // Alert on high error rates
    if (count > 10 && count % 10 === 0) {
      console.warn(`⚠️  High error rate detected for ${errorKey}: ${count} errors`);
    }
  }

  static getErrorStats(): Record<string, { count: number; lastError: Date }> {
    const stats: Record<string, { count: number; lastError: Date }> = {};
    
    for (const [key, count] of this.errorCounts.entries()) {
      const lastError = this.lastErrorTime.get(key);
      if (lastError) {
        stats[key] = { count, lastError };
      }
    }

    return stats;
  }

  static clearStats(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Input validation helpers
export class Validator {
  static isValidString(value: any, minLength = 1, maxLength = 10000): boolean {
    return typeof value === 'string' && 
           value.length >= minLength && 
           value.length <= maxLength;
  }

  static isValidNumber(value: any, min?: number, max?: number): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
    if (min !== undefined && value < min) {
      return false;
    }
    if (max !== undefined && value > max) {
      return false;
    }
    return true;
  }

  static isValidArray(value: any, minLength = 0, maxLength = 1000): boolean {
    return Array.isArray(value) && 
           value.length >= minLength && 
           value.length <= maxLength;
  }

  static isValidBitcoinAddress(address: string): boolean {
    // Basic Bitcoin address validation (simplified)
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy
      /^bc1[a-z0-9]{39,59}$/,              // Bech32
      /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/     // P2SH
    ];
    
    return patterns.some(pattern => pattern.test(address));
  }

  static validateContentForAnalysis(content: any): void {
    if (!this.isValidString(content, 1, 50000)) {
      throw new ValidationError(
        'Content must be a string between 1 and 50,000 characters',
        { provided_type: typeof content, length: content?.length }
      );
    }
  }

  static validatePlatformName(platform: any): void {
    const validPlatforms = ['twitter', 'substack', 'nostr', 'linkedin', 'youtube'];
    
    if (!this.isValidString(platform) || !validPlatforms.includes(platform.toLowerCase())) {
      throw new ValidationError(
        'Platform must be one of: ' + validPlatforms.join(', '),
        { provided: platform, valid_options: validPlatforms }
      );
    }
  }

  static validateMarketData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Market data must be an object');
    }

    const required = ['price', 'volume_24h', 'network_hash_rate'];
    for (const field of required) {
      if (!this.isValidNumber(data[field], 0)) {
        throw new ValidationError(
          `Market data missing or invalid field: ${field}`,
          { provided: data[field], required: required }
        );
      }
    }
  }
}

// Circuit breaker pattern for external APIs
export class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttempt = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new MCPError(
          ErrorCode.SERVICE_UNAVAILABLE,
          'Circuit breaker is open - service temporarily unavailable',
          { next_attempt: new Date(this.nextAttempt) }
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }

  getState(): { state: string; failures: number; nextAttempt?: Date } {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt > 0 ? new Date(this.nextAttempt) : undefined
    };
  }
}