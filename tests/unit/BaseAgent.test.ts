/**
 * Unit tests for BaseAgent
 * Tests the core agent functionality and error handling
 */

import { BaseAgent, AgentConfig, AgentResult } from '../../src/core/BaseAgent';
import { MCPError, MCPErrorCode } from '../../src/core/MCPErrors';

// Mock implementation for testing
class TestAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  getCapabilities(): string[] {
    return ['test-capability'];
  }

  async testOperation(shouldFail: boolean = false): Promise<AgentResult<string>> {
    return this.executeWithCommonHandling(
      'testOperation',
      async () => {
        if (shouldFail) {
          throw new Error('Test operation failed');
        }
        return 'test-success';
      },
      shouldFail ? undefined : 'test-cache-key' // Don't cache errors
    );
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = new TestAgent({
      name: 'TestAgent',
      version: '1.0.0'
    });
  });

  describe('constructor', () => {
    it('should initialize with default config values', () => {
      const info = agent.getInfo();
      expect(info.name).toBe('TestAgent');
      expect(info.version).toBe('1.0.0');
    });

    it('should merge custom config with defaults', () => {
      const customAgent = new TestAgent({
        name: 'CustomAgent',
        version: '2.0.0',
        cacheEnabled: false,
        retryAttempts: 5
      });

      const info = customAgent.getInfo();
      expect(info.name).toBe('CustomAgent');
      expect(info.version).toBe('2.0.0');
    });
  });

  describe('executeWithCommonHandling', () => {
    it('should return success result for successful operation', async () => {
      const result = await agent.testOperation(false);

      expect(result.success).toBe(true);
      expect(result.data).toBe('test-success');
      expect(result.agentName).toBe('TestAgent');
      expect(result.operationName).toBe('testOperation');
      expect(result.error).toBeUndefined();
      expect(typeof result.timestamp).toBe('number');
      expect(typeof result.executionTimeMs).toBe('number');
    });

    it('should return error result for failed operation', async () => {
      const result = await agent.testOperation(true);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(MCPError);
      expect(result.error?.code).toBe(MCPErrorCode.INTERNAL_ERROR);
      expect(result.error?.message).toContain('Test operation failed');
      expect(result.agentName).toBe('TestAgent');
      expect(result.operationName).toBe('testOperation');
    });

    it('should handle unknown error types', async () => {
      const agent = new TestAgent({ name: 'TestAgent' });
      
      // Test through public method that uses executeWithCommonHandling internally
      const result = await (agent as any).executeWithCommonHandling(
        'testUnknownError',
        async () => {
          throw 'string error';
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(MCPError);
      expect(result.error?.message).toContain('string error');
    });
  });

  describe('getCapabilities', () => {
    it('should return agent capabilities', () => {
      const capabilities = agent.getCapabilities();
      expect(capabilities).toEqual(['test-capability']);
    });
  });

  describe('validateRequired', () => {
    it('should return value if not null or undefined', () => {
      const result = agent['validateRequired']('test-value', 'testField');
      expect(result).toBe('test-value');
    });

    it('should throw error for null value', () => {
      expect(() => {
        agent['validateRequired'](null, 'testField');
      }).toThrow("Required field 'testField' is missing");
    });

    it('should throw error for undefined value', () => {
      expect(() => {
        agent['validateRequired'](undefined, 'testField');
      }).toThrow("Required field 'testField' is missing");
    });
  });

  describe('retry logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      
      const agent = new TestAgent({
        name: 'RetryAgent',
        retryAttempts: 3,
        retryDelayMs: 10 // Very short delay for testing
      });

      const result = await (agent as any).executeWithCommonHandling(
        'retryTest',
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Retry test failure');
          }
          return 'success-after-retries';
        }
      );

      expect(attempts).toBe(3);
      expect(result.success).toBe(true);
      expect(result.data).toBe('success-after-retries');
    });

    it('should fail after max retry attempts', async () => {
      let attempts = 0;
      
      const agent = new TestAgent({
        name: 'FailAgent',
        retryAttempts: 2,
        retryDelayMs: 10
      });

      const result = await (agent as any).executeWithCommonHandling(
        'maxRetryTest',
        async () => {
          attempts++;
          throw new Error('Persistent failure');
        }
      );

      expect(attempts).toBe(2);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Persistent failure');
    });
  });
});
