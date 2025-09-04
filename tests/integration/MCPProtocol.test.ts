/**
 * Integration tests for MCP Protocol compliance
 * Tests proper Model Context Protocol implementation
 */

import { MCPProtocolHandler, MCPTool, MCPResource, MCPPrompt } from '../../src/core/MCPProtocol';
import { MCPError, MCPErrorCode } from '../../src/core/MCPErrors';

describe('MCPProtocolHandler', () => {
  let handler: MCPProtocolHandler;

  beforeEach(() => {
    handler = new MCPProtocolHandler({
      resources: { subscribe: true, listChanged: true },
      tools: { listChanged: true },
      prompts: { listChanged: true },
      logging: {}
    });
  });

  describe('Server Info', () => {
    it('should provide correct server information', () => {
      const info = handler.getServerInfo();
      
      expect(info.name).toBe('Bitcoin Education MCP Server');
      expect(info.version).toBe('1.0.0');
      expect(info.protocolVersion).toBe('2024-11-05');
      expect(info.capabilities).toBeDefined();
      expect(info.capabilities.resources?.listChanged).toBe(true);
    });
  });

  describe('Resource Management', () => {
    const testResource: MCPResource = {
      uri: 'bitcoin://price/current',
      name: 'Bitcoin Price',
      description: 'Current Bitcoin price data',
      mimeType: 'application/json',
      text: JSON.stringify({ price: 108000, currency: 'USD' })
    };

    it('should add and list resources', () => {
      handler.addResource(testResource);
      const resources = handler.listResources();
      
      expect(resources).toHaveLength(1);
      expect(resources[0]).toEqual(testResource);
    });

    it('should get specific resource by URI', () => {
      handler.addResource(testResource);
      const resource = handler.getResource(testResource.uri);
      
      expect(resource).toEqual(testResource);
    });

    it('should throw error for non-existent resource', () => {
      expect(() => {
        handler.getResource('bitcoin://nonexistent');
      }).toThrow(MCPError);
    });

    it('should remove resources', () => {
      handler.addResource(testResource);
      expect(handler.listResources()).toHaveLength(1);
      
      const removed = handler.removeResource(testResource.uri);
      expect(removed).toBe(true);
      expect(handler.listResources()).toHaveLength(0);
    });

    it('should emit resourcesChanged event when capabilities enabled', (done) => {
      handler.on('resourcesChanged', () => {
        done();
      });
      
      handler.addResource(testResource);
    });
  });

  describe('Tool Management', () => {
    const testTool: MCPTool = {
      name: 'bitcoin_price',
      description: 'Get current Bitcoin price',
      inputSchema: {
        type: 'object',
        properties: {
          currency: { type: 'string', description: 'Target currency' }
        },
        required: ['currency']
      }
    };

    it('should add and list tools', () => {
      handler.addTool(testTool);
      const tools = handler.listTools();
      
      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual(testTool);
    });

    it('should validate tool input parameters', async () => {
      handler.addTool(testTool);
      
      // Set up a mock tool execution
      handler.on('executeToolRequest', ({ name, arguments: args, resolve }) => {
        if (name === 'bitcoin_price' && args.currency === 'USD') {
          resolve({ price: 108000, currency: 'USD' });
        }
      });

      const result = await handler.callTool('bitcoin_price', { currency: 'USD' });
      expect(result).toEqual({ price: 108000, currency: 'USD' });
    });

    it('should throw error for missing required parameters', async () => {
      handler.addTool(testTool);
      
      await expect(handler.callTool('bitcoin_price', {})).rejects.toThrow(MCPError);
    });

    it('should throw error for non-existent tool', async () => {
      await expect(handler.callTool('nonexistent_tool', {})).rejects.toThrow(MCPError);
    });

    it('should emit toolsChanged event', (done) => {
      handler.on('toolsChanged', () => {
        done();
      });
      
      handler.addTool(testTool);
    });
  });

  describe('Prompt Management', () => {
    const testPrompt: MCPPrompt = {
      name: 'socratic_question',
      description: 'Generate Socratic learning questions',
      arguments: [
        { name: 'topic', description: 'Bitcoin topic to explore', required: true },
        { name: 'difficulty', description: 'Question difficulty level', required: false }
      ]
    };

    it('should add and list prompts', () => {
      handler.addPrompt(testPrompt);
      const prompts = handler.listPrompts();
      
      expect(prompts).toHaveLength(1);
      expect(prompts[0]).toEqual(testPrompt);
    });

    it('should generate prompt with arguments', async () => {
      handler.addPrompt(testPrompt);
      
      // Mock prompt generation
      handler.on('generatePromptRequest', ({ name, arguments: args, resolve }) => {
        if (name === 'socratic_question' && args?.topic === 'fees') {
          resolve({
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'What happens when many people want to send Bitcoin at the same time?'
                }
              }
            ]
          });
        }
      });

      const result = await handler.getPrompt('socratic_question', { topic: 'fees' });
      expect(result.messages).toBeDefined();
      expect(result.messages[0].content.text).toContain('Bitcoin');
    });

    it('should validate required prompt arguments', async () => {
      handler.addPrompt(testPrompt);
      
      await expect(handler.getPrompt('socratic_question', {})).rejects.toThrow(MCPError);
    });
  });

  describe('Message Processing', () => {
    it('should handle initialize message', async () => {
      const message = {
        jsonrpc: '2.0' as const,
        id: 1,
        method: 'initialize',
        params: {}
      };

      const response = await handler.processMessage(message);
      expect(response).toBeDefined();
      if (response && 'id' in response) {
        expect(response.id).toBe(1);
        expect((response as any)?.result?.name).toBe('Bitcoin Education MCP Server');
      }
    });

    it('should handle resources/list message', async () => {
      const testResource: MCPResource = {
        uri: 'test://resource',
        name: 'Test Resource'
      };
      
      handler.addResource(testResource);

      const message = {
        jsonrpc: '2.0' as const,
        id: 2,
        method: 'resources/list',
        params: {}
      };

      const response = await handler.processMessage(message);
      expect(response).toBeDefined();
      expect((response as any)?.result?.resources).toHaveLength(1);
    });

    it('should handle tools/list message', async () => {
      const testTool: MCPTool = {
        name: 'test_tool',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: {} }
      };
      
      handler.addTool(testTool);

      const message = {
        jsonrpc: '2.0' as const,
        id: 3,
        method: 'tools/list',
        params: {}
      };

      const response = await handler.processMessage(message);
      expect(response).toBeDefined();
      expect((response as any)?.result?.tools).toHaveLength(1);
    });

    it('should return error for unknown method', async () => {
      const message = {
        jsonrpc: '2.0' as const,
        id: 4,
        method: 'unknown/method',
        params: {}
      };

      const response = await handler.processMessage(message);
      expect(response).toBeDefined();
      expect((response as any)?.error?.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
    });

    it('should handle message without id (notification)', async () => {
      const message = {
        jsonrpc: '2.0' as const,
        method: 'unknown/method',
        params: {}
      };

      const response = await handler.processMessage(message);
      expect(response).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle resource not found error', () => {
      expect(() => {
        handler.getResource('bitcoin://nonexistent');
      }).toThrow(MCPError);
      
      try {
        handler.getResource('bitcoin://nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        expect((error as MCPError).code).toBe(MCPErrorCode.RESOURCE_NOT_FOUND);
        expect((error as MCPError).data?.uri).toBe('bitcoin://nonexistent');
      }
    });

    it('should handle tool execution timeout', async () => {
      const testTool: MCPTool = {
        name: 'slow_tool',
        description: 'Tool that takes too long',
        inputSchema: { type: 'object', properties: {} }
      };
      
      handler.addTool(testTool);
      
      // Don't set up any executeToolRequest handler to simulate timeout
      await expect(handler.callTool('slow_tool', {})).rejects.toThrow('Tool execution timeout');
    }, 5000); // 5 second timeout for this test

    it('should create proper error response format', async () => {
      const message = {
        jsonrpc: '2.0' as const,
        id: 5,
        method: 'resources/read',
        params: { uri: 'bitcoin://nonexistent' }
      };

      const response = await handler.processMessage(message);
      expect(response).toBeDefined();
      expect((response as any)?.error).toBeDefined();
      expect((response as any)?.error?.code).toBe(MCPErrorCode.RESOURCE_NOT_FOUND);
      expect((response as any)?.error?.message).toContain('not found');
    });
  });
});
