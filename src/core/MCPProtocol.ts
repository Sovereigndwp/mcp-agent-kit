/**
 * MCP Protocol Compliance System
 * Implements proper Model Context Protocol standards for agent communication
 */

import { EventEmitter } from 'events';
import { MCPError, MCPErrorCode, ToolExecutionError } from './MCPErrors.js';
import { logger } from '../utils/logger.js';

export interface MCPResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
  text?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface MCPCapabilities {
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {};
  experimental?: Record<string, any>;
}

export class MCPProtocolHandler extends EventEmitter {
  private resources: Map<string, MCPResource> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();
  private capabilities: MCPCapabilities;

  constructor(capabilities: MCPCapabilities = {}) {
    super();
    this.capabilities = capabilities;
    logger.info('MCP Protocol Handler initialized', { capabilities });
  }

  // Server Info
  getServerInfo() {
    return {
      name: 'Bitcoin Education MCP Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      capabilities: this.capabilities
    };
  }

  // Resource Management
  addResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource);
    logger.info('Resource added', { uri: resource.uri, name: resource.name });
    
    if (this.capabilities.resources?.listChanged) {
      this.emit('resourcesChanged');
    }
  }

  removeResource(uri: string): boolean {
    const removed = this.resources.delete(uri);
    if (removed && this.capabilities.resources?.listChanged) {
      this.emit('resourcesChanged');
    }
    return removed;
  }

  listResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  getResource(uri: string): MCPResource {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new MCPError(
        MCPErrorCode.RESOURCE_NOT_FOUND,
        `Resource not found: ${uri}`,
        { uri }
      );
    }
    return resource;
  }

  // Tool Management
  addTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    logger.info('Tool added', { name: tool.name, description: tool.description });
    
    if (this.capabilities.tools?.listChanged) {
      this.emit('toolsChanged');
    }
  }

  removeTool(name: string): boolean {
    const removed = this.tools.delete(name);
    if (removed && this.capabilities.tools?.listChanged) {
      this.emit('toolsChanged');
    }
    return removed;
  }

  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new MCPError(
        MCPErrorCode.METHOD_NOT_FOUND,
        `Tool not found: ${name}`,
        { toolName: name }
      );
    }

    try {
      // Validate input against schema
      this.validateToolInput(tool, arguments_);
      
      // Emit tool call event
      this.emit('toolCalled', { name, arguments: arguments_ });
      
      // Tool execution would happen here - delegated to specific implementations
      const result = await this.executeTool(name, arguments_);
      
      logger.info('Tool executed successfully', { name, hasResult: !!result });
      return result;
      
    } catch (error) {
      logger.error('Tool execution failed', { name, error });
      throw new ToolExecutionError(name, error);
    }
  }

  private validateToolInput(tool: MCPTool, input: any): void {
    const schema = tool.inputSchema;
    
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in input)) {
          throw new MCPError(
            MCPErrorCode.INVALID_PARAMS,
            `Missing required parameter: ${requiredField}`,
            { field: requiredField, tool: tool.name }
          );
        }
      }
    }
    
    // Additional validation could be added here
  }

  private async executeTool(name: string, arguments_: any): Promise<any> {
    // This method should be implemented by specific agent implementations
    // For now, we'll emit an event that agents can listen to
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new MCPError(MCPErrorCode.INTERNAL_ERROR, 'Tool execution timeout'));
      }, 30000);

      this.emit('executeToolRequest', {
        name,
        arguments: arguments_,
        resolve: (result: any) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  // Prompt Management
  addPrompt(prompt: MCPPrompt): void {
    this.prompts.set(prompt.name, prompt);
    logger.info('Prompt added', { name: prompt.name, description: prompt.description });
    
    if (this.capabilities.prompts?.listChanged) {
      this.emit('promptsChanged');
    }
  }

  removePrompt(name: string): boolean {
    const removed = this.prompts.delete(name);
    if (removed && this.capabilities.prompts?.listChanged) {
      this.emit('promptsChanged');
    }
    return removed;
  }

  listPrompts(): MCPPrompt[] {
    return Array.from(this.prompts.values());
  }

  async getPrompt(name: string, arguments_?: Record<string, string>): Promise<any> {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new MCPError(
        MCPErrorCode.METHOD_NOT_FOUND,
        `Prompt not found: ${name}`,
        { promptName: name }
      );
    }

    // Validate arguments if required
    if (prompt.arguments) {
      for (const arg of prompt.arguments) {
        if (arg.required && (!arguments_ || !(arg.name in arguments_))) {
          throw new MCPError(
            MCPErrorCode.INVALID_PARAMS,
            `Missing required argument: ${arg.name}`,
            { argument: arg.name, prompt: name }
          );
        }
      }
    }

    // Generate prompt response - this would be implemented by specific agents
    return this.generatePromptResponse(name, arguments_);
  }

  private async generatePromptResponse(name: string, arguments_?: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new MCPError(MCPErrorCode.INTERNAL_ERROR, 'Prompt generation timeout'));
      }, 30000);

      this.emit('generatePromptRequest', {
        name,
        arguments: arguments_,
        resolve: (result: any) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  // Message Processing
  async processMessage(message: MCPMessage): Promise<MCPResponse | MCPNotification | null> {
    try {
      logger.debug('Processing MCP message', { method: message.method, id: message.id });

      switch (message.method) {
        case 'initialize':
          return this.handleInitialize(message);
        
        case 'resources/list':
          return this.handleResourcesList(message);
          
        case 'resources/read':
          return this.handleResourcesRead(message);
          
        case 'tools/list':
          return this.handleToolsList(message);
          
        case 'tools/call':
          return this.handleToolsCall(message);
          
        case 'prompts/list':
          return this.handlePromptsList(message);
          
        case 'prompts/get':
          return this.handlePromptsGet(message);
          
        default:
          throw new MCPError(
            MCPErrorCode.METHOD_NOT_FOUND,
            `Unknown method: ${message.method}`,
            { method: message.method }
          );
      }
    } catch (error) {
      logger.error('Message processing failed', { message, error });
      
      if (message.id !== undefined) {
        return {
          jsonrpc: '2.0',
          id: message.id,
          error: {
            code: error instanceof MCPError ? error.code : MCPErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            data: error instanceof MCPError ? error.data : undefined
          }
        };
      }
      
      return null;
    }
  }

  private async handleInitialize(message: MCPMessage): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: this.getServerInfo()
    };
  }

  private async handleResourcesList(message: MCPMessage): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: {
        resources: this.listResources()
      }
    };
  }

  private async handleResourcesRead(message: MCPMessage): Promise<MCPResponse> {
    const { uri } = message.params;
    const resource = this.getResource(uri);
    
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType || 'text/plain',
            text: resource.text || ''
          }
        ]
      }
    };
  }

  private async handleToolsList(message: MCPMessage): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: {
        tools: this.listTools()
      }
    };
  }

  private async handleToolsCall(message: MCPMessage): Promise<MCPResponse> {
    const { name, arguments: args } = message.params;
    const result = await this.callTool(name, args);
    
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      }
    };
  }

  private async handlePromptsList(message: MCPMessage): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: {
        prompts: this.listPrompts()
      }
    };
  }

  private async handlePromptsGet(message: MCPMessage): Promise<MCPResponse> {
    const { name, arguments: args } = message.params;
    const result = await this.getPrompt(name, args);
    
    return {
      jsonrpc: '2.0',
      id: message.id!,
      result: result
    };
  }
}
