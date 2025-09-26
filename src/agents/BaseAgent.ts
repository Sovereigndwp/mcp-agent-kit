import { z } from 'zod';
import type { MCPAgent, Tool } from '../types/agent.js';

export abstract class BaseAgent implements MCPAgent {
  abstract readonly name: string;
  abstract readonly description: string;

  async initialize(): Promise<void> {
    // Default implementation - agents can override if needed
  }

  abstract getTools(): Tool[];
  abstract handleToolCall(name: string, args: unknown): Promise<unknown>;

  protected validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Invalid input: ${issues}`);
      }
      throw error;
    }
  }
}