/**
 * MCP Agent Interface Definition
 * Based on the working LearningPathOptimizer agent structure
 */

// Simple Tool interface for now
export interface Tool {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: any;
    required?: string[];
  };
}

export interface MCPAgent {
  name: string;
  description: string;

  initialize(): Promise<void>;
  getTools(): Tool[];
  handleToolCall(name: string, args: any): Promise<any>;
}

// Legacy aliases to unblock older agents quickly
export interface ToolInput { [key: string]: unknown; }
export interface ToolOutput { [key: string]: unknown; }