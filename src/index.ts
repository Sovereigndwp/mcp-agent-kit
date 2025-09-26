#!/usr/bin/env node

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EnhancedTaskRouter } from './router/EnhancedTaskRouter.js';
import { logger } from './utils/logger.js';
import { mcpAgentServer } from './core/mcpAgentServer.js';
import { agentCommunicationProtocol } from './core/AgentCommunicationProtocol.js';
import { securityManager } from './core/SecurityManager.js';

// Load environment variables
config();

async function main() {
  try {
    logger.info('🚀 Starting MCP Agent Kit for Bitcoin Education...');
    
    // Initialize security system first
    const securityStatus = securityManager.getSecurityStatus();
    logger.info(`🔒 Security system initialized - Auth: ${securityStatus.authentication.enabled ? 'ON' : 'OFF'}`);
    
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

    // Register agents in communication protocol
    await agentCommunicationProtocol.registerAgent({
      id: 'content-mentor-orchestrator',
      name: 'Content Mentor Orchestrator',
      version: '1.0.0',
      status: 'ready',
      capabilities: [
        {
          name: 'analyze-content',
          description: 'Analyze content for authenticity and platform optimization',
          async: true,
          timeout: 30000
        },
        {
          name: 'generate-strategy',
          description: 'Generate publishing strategy for content',
          async: true,
          timeout: 15000
        }
      ],
      dependencies: ['brand-identity-system', 'content-authenticity-mentor', 'platform-strategy-mentor'],
      lastHeartbeat: new Date()
    });

    await agentCommunicationProtocol.registerAgent({
      id: 'bitcoin-news-analyzer',
      name: 'Bitcoin News Analyzer',
      version: '1.0.0',
      status: 'ready',
      capabilities: [
        {
          name: 'analyze-news',
          description: 'Analyze Bitcoin news for educational content opportunities',
          async: true,
          timeout: 20000
        },
        {
          name: 'daily-digest',
          description: 'Generate daily news digest',
          async: true,
          timeout: 10000
        }
      ],
      dependencies: [],
      lastHeartbeat: new Date()
    });

    await agentCommunicationProtocol.registerAgent({
      id: 'market-intelligence-agent',
      name: 'Market Intelligence Agent',
      version: '1.0.0',
      status: 'ready',
      capabilities: [
        {
          name: 'analyze-market',
          description: 'Analyze Bitcoin market data for educational opportunities',
          async: true,
          timeout: 25000
        },
        {
          name: 'daily-insight',
          description: 'Generate daily market insights',
          async: true,
          timeout: 15000
        }
      ],
      dependencies: ['bitcoin-news-analyzer'],
      lastHeartbeat: new Date()
    });

    // Set up server transport
    const transport = new StdioServerTransport();
    
    // Start server
    await server.connect(transport);
    
    const serverStats = mcpAgentServer.getServerStats();
    logger.info(`✅ MCP Agent Kit server started - ${serverStats.agents} agents registered`);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🔄 Shutting down MCP Agent Kit...');
      mcpAgentServer.shutdown();
      await taskRouter.shutdown();
      await server.close();
      logger.info('✅ Shutdown complete');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🔄 Shutting down MCP Agent Kit...');
      mcpAgentServer.shutdown();
      await taskRouter.shutdown();
      await server.close();
      logger.info('✅ Shutdown complete');
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
