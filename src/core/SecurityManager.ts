import crypto from 'crypto';
import { ValidationError } from './ErrorHandler.js';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator: (identifier: string) => string;
}

export interface SecurityConfig {
  apiKeys: {
    twitter?: string;
    coindesk?: string;
    mempool?: string;
    github?: string;
    coinmetrics?: string;
  };
  rateLimits: {
    global: RateLimitConfig;
    perAgent: RateLimitConfig;
    externalAPI: RateLimitConfig;
  };
  authentication: {
    enabled: boolean;
    secretKey: string;
    tokenExpiry: number;
  };
}

export class SecurityManager {
  private config: SecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, number> = new Map();

  constructor() {
    this.config = this.loadSecurityConfig();
    this.startCleanupInterval();
  }

  private loadSecurityConfig(): SecurityConfig {
    return {
      apiKeys: {
        twitter: this.getEnvVar('TWITTER_API_KEY'),
        coindesk: this.getEnvVar('COINDESK_API_KEY'),
        mempool: this.getEnvVar('MEMPOOL_API_KEY'),
        github: this.getEnvVar('GITHUB_API_TOKEN'),
        coinmetrics: this.getEnvVar('COINMETRICS_API_KEY')
      },
      rateLimits: {
        global: {
          windowMs: 60000, // 1 minute
          maxRequests: 1000,
          keyGenerator: (id) => `global:${id}`
        },
        perAgent: {
          windowMs: 60000, // 1 minute
          maxRequests: 100,
          keyGenerator: (id) => `agent:${id}`
        },
        externalAPI: {
          windowMs: 60000, // 1 minute
          maxRequests: 50,
          keyGenerator: (id) => `external:${id}`
        }
      },
      authentication: {
        enabled: this.getEnvVar('MCP_AUTH_ENABLED', 'false') === 'true',
        secretKey: this.getEnvVar('MCP_SECRET_KEY', this.generateSecretKey()),
        tokenExpiry: parseInt(this.getEnvVar('MCP_TOKEN_EXPIRY', '3600')) // 1 hour
      }
    };
  }

  private getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (!value && !defaultValue) {
      console.warn(`⚠️  Environment variable ${name} not set`);
      return '';
    }
    return value || defaultValue!;
  }

  private generateSecretKey(): string {
    const key = crypto.randomBytes(32).toString('hex');
    console.warn('🔑 Generated new secret key. Set MCP_SECRET_KEY environment variable to persist.');
    return key;
  }

  // Rate limiting
  checkRateLimit(identifier: string, limitType: 'global' | 'perAgent' | 'externalAPI'): boolean {
    const config = this.config.rateLimits[limitType];
    const key = config.keyGenerator(identifier);
    const now = Date.now();
    
    let record = this.rateLimitStore.get(key);
    
    // Reset if window has passed
    if (!record || now >= record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      this.recordSuspiciousActivity(identifier, 'rate_limit_exceeded');
      return false;
    }

    // Increment count and store
    record.count++;
    this.rateLimitStore.set(key, record);
    
    return true;
  }

  // Input sanitization
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    } else if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    } else if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        const cleanKey = this.sanitizeString(key);
        sanitized[cleanKey] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  private sanitizeString(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: urls
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 10000); // Limit length
  }

  // Content validation for Bitcoin education
  validateContentInput(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new ValidationError('Content must be a non-empty string');
    }

    if (content.length < 1 || content.length > 50000) {
      throw new ValidationError('Content must be between 1 and 50,000 characters');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\b(?:delete|drop|truncate|alter)\b/gi, // SQL injection attempts
      /<iframe|<object|<embed/gi, // Embedded content
      /javascript:|data:|vbscript:/gi, // Dangerous URLs
      /\{.*\{.*\}/g // Potential template injection
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        this.recordSuspiciousActivity('content_validation', 'suspicious_pattern');
        throw new ValidationError('Content contains potentially harmful patterns');
      }
    }
  }

  // Bitcoin-specific validation
  validateBitcoinData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Bitcoin data must be an object');
    }

    // Validate Bitcoin amounts (should be reasonable)
    if (data.amount && typeof data.amount === 'number') {
      if (data.amount < 0 || data.amount > 21000000) { // Max Bitcoin supply
        throw new ValidationError('Invalid Bitcoin amount');
      }
    }

    // Validate Bitcoin addresses if present
    if (data.address && !this.isValidBitcoinAddress(data.address)) {
      throw new ValidationError('Invalid Bitcoin address format');
    }

    // Validate block height
    if (data.blockHeight && typeof data.blockHeight === 'number') {
      if (data.blockHeight < 0 || data.blockHeight > 10000000) { // Reasonable future limit
        throw new ValidationError('Invalid block height');
      }
    }

    // Validate hash rate (should be positive and reasonable)
    if (data.hashRate && typeof data.hashRate === 'number') {
      if (data.hashRate < 0 || data.hashRate > 1000) { // 1000 EH/s is very high
        throw new ValidationError('Invalid hash rate');
      }
    }
  }

  private isValidBitcoinAddress(address: string): boolean {
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy
      /^bc1[a-z0-9]{39,59}$/,              // Bech32
      /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/     // P2SH
    ];
    
    return patterns.some(pattern => pattern.test(address));
  }

  // Authentication (JWT-like tokens)
  generateToken(payload: any): string {
    if (!this.config.authentication.enabled) {
      return 'disabled';
    }

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const tokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + this.config.authentication.tokenExpiry,
      iat: Math.floor(Date.now() / 1000)
    };
    const payloadEncoded = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.config.authentication.secretKey)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    return `${header}.${payloadEncoded}.${signature}`;
  }

  validateToken(token: string): any {
    if (!this.config.authentication.enabled || token === 'disabled') {
      return { valid: true, payload: {} };
    }

    try {
      const [header, payload, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.config.authentication.secretKey)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode and validate payload
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload: decodedPayload };
    } catch (error) {
      return { valid: false, error: 'Invalid token format' };
    }
  }

  // Security monitoring
  private recordSuspiciousActivity(identifier: string, activity: string): void {
    const key = `${identifier}:${activity}`;
    const count = this.suspiciousActivity.get(key) || 0;
    this.suspiciousActivity.set(key, count + 1);

    // Block IP after too many suspicious activities
    if (count > 10) {
      this.blockedIPs.add(identifier);
      console.warn(`🚫 Blocked ${identifier} due to suspicious activity: ${activity}`);
    }
  }

  isBlocked(identifier: string): boolean {
    return this.blockedIPs.has(identifier);
  }

  // API key management
  getAPIKey(service: keyof SecurityConfig['apiKeys']): string {
    const key = this.config.apiKeys[service];
    if (!key) {
      console.warn(`⚠️  API key for ${service} not configured`);
    }
    return key || '';
  }

  // Secure headers for external requests
  getSecureHeaders(service?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'MCP-Bitcoin-Education-Agent/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    };

    if (service) {
      const apiKey = this.getAPIKey(service as keyof SecurityConfig['apiKeys']);
      if (apiKey) {
        // Different services use different header names
        switch (service) {
          case 'github':
            headers['Authorization'] = `token ${apiKey}`;
            break;
          case 'twitter':
            headers['Authorization'] = `Bearer ${apiKey}`;
            break;
          default:
            headers['X-API-Key'] = apiKey;
        }
      }
    }

    return headers;
  }

  // Cleanup old rate limit records
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, record] of this.rateLimitStore.entries()) {
        if (now >= record.resetTime) {
          this.rateLimitStore.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired rate limit records`);
      }
    }, 300000); // Clean every 5 minutes
  }

  // Security status report
  getSecurityStatus(): {
    rateLimits: { active: number; total: number };
    blockedIPs: number;
    suspiciousActivities: number;
    authentication: { enabled: boolean };
    apiKeys: { configured: string[]; missing: string[] };
  } {
    const apiKeys = this.config.apiKeys;
    const configured = Object.entries(apiKeys)
      .filter(([, key]) => key && key.length > 0)
      .map(([name]) => name);
    
    const missing = Object.entries(apiKeys)
      .filter(([, key]) => !key || key.length === 0)
      .map(([name]) => name);

    return {
      rateLimits: {
        active: this.rateLimitStore.size,
        total: this.rateLimitStore.size
      },
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities: this.suspiciousActivity.size,
      authentication: {
        enabled: this.config.authentication.enabled
      },
      apiKeys: {
        configured,
        missing
      }
    };
  }

  // Environment variables template
  generateEnvTemplate(): string {
    return `
# MCP Bitcoin Education Agent - Environment Variables Template

# API Keys (optional - some features may be limited without them)
TWITTER_API_KEY=your_twitter_api_key_here
COINDESK_API_KEY=your_coindesk_api_key_here
MEMPOOL_API_KEY=your_mempool_api_key_here
GITHUB_API_TOKEN=your_github_token_here
COINMETRICS_API_KEY=your_coinmetrics_api_key_here

# Authentication (recommended for production)
MCP_AUTH_ENABLED=true
MCP_SECRET_KEY=your_secret_key_here_minimum_32_characters_long
MCP_TOKEN_EXPIRY=3600

# Rate Limiting (optional - defaults provided)
MCP_RATE_LIMIT_GLOBAL=1000
MCP_RATE_LIMIT_AGENT=100
MCP_RATE_LIMIT_EXTERNAL=50

# Logging Level
LOG_LEVEL=info

# Development/Production Mode
NODE_ENV=development
`;
  }
}

export const securityManager = new SecurityManager();