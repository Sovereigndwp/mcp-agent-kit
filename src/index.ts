#!/usr/bin/env node

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EnhancedTaskRouter } from './router/EnhancedTaskRouter.js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

async function main() {
  try {
    logger.info('Starting MCP Agent Kit for Bitcoin Education...');
    
    // Create MCP server
    const server = new Server({
      name: 'mcp-agent-kit',
      version: '1.0.0',
    });

    // Initialize enhanced task router
    const taskRouter = new EnhancedTaskRouter({
      enablePlugins: true,
      enableCaching: true,
      enableEvents: true
    });
    await taskRouter.initialize();
    
    // Set the server on the task router
    taskRouter.setServer(server);

    // Register tools and agents
    await taskRouter.registerAll();

    // Set up server transport
    const transport = new StdioServerTransport();
    
    // Start server
    await server.connect(transport);
    
    logger.info('MCP Agent Kit server started successfully');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down MCP Agent Kit...');
      await taskRouter.shutdown();
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down MCP Agent Kit...');
      await taskRouter.shutdown();
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start MCP Agent Kit:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
