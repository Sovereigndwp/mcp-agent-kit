/**
 * MCP-Compliant Error Handling System
 * Implements proper error types and handling for Model Context Protocol
 */

export enum MCPErrorCode {
  // Protocol errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // Application errors
  RESOURCE_NOT_FOUND = -32001,
  RESOURCE_ACCESS_DENIED = -32002,
  TOOL_EXECUTION_ERROR = -32003,
  AGENT_COMMUNICATION_ERROR = -32004,
  CACHE_ERROR = -32005,
  VALIDATION_ERROR = -32006,
}

export class MCPError extends Error {
  public readonly code: MCPErrorCode;
  public readonly data?: any;

  constructor(code: MCPErrorCode, message: string, data?: any) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

export class ResourceNotFoundError extends MCPError {
  constructor(resourceId: string, resourceType: string = 'resource') {
    super(
      MCPErrorCode.RESOURCE_NOT_FOUND,
      `${resourceType} '${resourceId}' not found`,
      { resourceId, resourceType }
    );
  }
}

export class ToolExecutionError extends MCPError {
  constructor(toolName: string, originalError: unknown) {
    const message = originalError instanceof Error 
      ? originalError.message 
      : String(originalError);
    
    super(
      MCPErrorCode.TOOL_EXECUTION_ERROR,
      `Tool '${toolName}' execution failed: ${message}`,
      { toolName, originalError: message }
    );
  }
}

export class AgentCommunicationError extends MCPError {
  constructor(agentName: string, operation: string, originalError: unknown) {
    const message = originalError instanceof Error 
      ? originalError.message 
      : String(originalError);
    
    super(
      MCPErrorCode.AGENT_COMMUNICATION_ERROR,
      `Agent '${agentName}' failed during '${operation}': ${message}`,
      { agentName, operation, originalError: message }
    );
  }
}

export class ValidationError extends MCPError {
  constructor(field: string, value: any, expectedType: string) {
    super(
      MCPErrorCode.VALIDATION_ERROR,
      `Validation failed for field '${field}': expected ${expectedType}, got ${typeof value}`,
      { field, value, expectedType }
    );
  }
}

// Utility functions for error handling
export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError;
}

export function handleUnknownError(error: unknown, context: string): MCPError {
  if (isMCPError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new MCPError(MCPErrorCode.INTERNAL_ERROR, `${context}: ${error.message}`);
  }
  
  return new MCPError(MCPErrorCode.INTERNAL_ERROR, `${context}: ${String(error)}`);
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Unknown error occurred';
}
