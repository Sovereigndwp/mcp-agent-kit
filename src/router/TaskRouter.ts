import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';
import capabilities from '../registry/capabilities.json';

// Import tools
import { bitcoinPriceTool } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';

// Import agents
import { NewsScout } from '../agents/NewsScout.js';
import { DevRadar } from '../agents/DevRadar.js';
import { CustodyCoach } from '../agents/CustodyCoach.js';
import { SimulationBuilder } from '../agents/SimulationBuilder.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (...args: any[]) => Promise<any>;
}

export interface AgentDefinition {
  name: string;
  description: string;
  capabilities: string[];
  instance: any;
}

export class TaskRouter {
  private server?: Server;
  private tools: Map<string, ToolDefinition> = new Map();
  private agents: Map<string, AgentDefinition> = new Map();

  /**
   * Initialize the task router
   */
  async initialize(): Promise<void> {
    logger.info('Initializing TaskRouter...');
    
    // Register tools
    await this.registerTools();
    
    // Register agents
    await this.registerAgents();
    
    logger.info(`TaskRouter initialized with ${this.tools.size} tools and ${this.agents.size} agents`);
  }

  /**
   * Register all tools and agents with the MCP server
   */
  async registerAll(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not initialized');
    }

    // Register tools
    for (const [name, tool] of this.tools) {
      // TODO: Implement proper MCP tool registration
      logger.debug(`Would register tool: ${name}`);
    }

    // Register agents
    for (const [name, agent] of this.agents) {
      // TODO: Implement proper MCP agent registration
      logger.debug(`Would register agent: ${name}`);
    }
  }

  /**
   * Register all available tools
   */
  private async registerTools(): Promise<void> {
    // Bitcoin Price Tools
    this.tools.set('get_bitcoin_price', {
      name: 'get_bitcoin_price',
      description: 'Get current Bitcoin price in specified currency',
      inputSchema: {
        type: 'object',
        properties: {
          currency: {
            type: 'string',
            description: 'Currency code (e.g., usd, eur, btc)',
            default: 'usd'
          }
        }
      },
      handler: async (args: any) => {
        const currency = args.currency || 'usd';
        const price = await bitcoinPriceTool.getBitcoinPrice(currency);
        return {
          price,
          currency,
          timestamp: Date.now(),
          source: 'CoinGecko'
        };
      }
    });

    this.tools.set('get_bitcoin_price_details', {
      name: 'get_bitcoin_price_details',
      description: 'Get detailed Bitcoin price information including 24h change and volume',
      inputSchema: {
        type: 'object',
        properties: {
          currency: {
            type: 'string',
            description: 'Currency code (e.g., usd, eur, btc)',
            default: 'usd'
          }
        }
      },
      handler: async (args: any) => {
        const currency = args.currency || 'usd';
        return await bitcoinPriceTool.getBitcoinPriceDetails(currency);
      }
    });

    // Mempool Tools
    this.tools.set('get_fee_estimates', {
      name: 'get_fee_estimates',
      description: 'Get current Bitcoin fee estimates for different confirmation times',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        return await mempoolFeeEstimatesTool.getFeeEstimates();
      }
    });

    this.tools.set('get_mempool_stats', {
      name: 'get_mempool_stats',
      description: 'Get current mempool statistics and congestion information',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        return await mempoolFeeEstimatesTool.getMempoolStats();
      }
    });

    this.tools.set('calculate_optimal_fee', {
      name: 'calculate_optimal_fee',
      description: 'Calculate optimal fee for a Bitcoin transaction',
      inputSchema: {
        type: 'object',
        properties: {
          transactionSize: {
            type: 'number',
            description: 'Transaction size in bytes'
          },
          targetConfirmations: {
            type: 'number',
            description: 'Target number of confirmations'
          },
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Transaction urgency level',
            default: 'medium'
          }
        },
        required: ['transactionSize', 'targetConfirmations']
      },
      handler: async (args: any) => {
        return await mempoolFeeEstimatesTool.calculateOptimalFee(
          args.transactionSize,
          args.targetConfirmations,
          args.urgency || 'medium'
        );
      }
    });

    this.tools.set('get_mempool_congestion', {
      name: 'get_mempool_congestion',
      description: 'Get current mempool congestion level and recommendations',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        return await mempoolFeeEstimatesTool.getMempoolCongestion();
      }
    });

    logger.info(`Registered ${this.tools.size} tools`);
  }

  /**
   * Register all available agents
   */
  private async registerAgents(): Promise<void> {
    // News Scout Agent
    this.agents.set('news_scout', {
      name: 'news_scout',
      description: 'Bitcoin news monitoring and analysis agent',
      capabilities: ['news_monitoring', 'sentiment_analysis', 'trend_detection'],
      instance: new NewsScout()
    });

    // Dev Radar Agent
    this.agents.set('dev_radar', {
      name: 'dev_radar',
      description: 'Bitcoin development activity tracking agent',
      capabilities: ['github_monitoring', 'release_tracking', 'development_insights'],
      instance: new DevRadar()
    });

    // Custody Coach Agent
    this.agents.set('custody_coach', {
      name: 'custody_coach',
      description: 'Bitcoin custody best practices guidance agent',
      capabilities: ['custody_guidance', 'security_recommendations', 'best_practices'],
      instance: new CustodyCoach()
    });

    // Simulation Builder Agent
    this.agents.set('simulation_builder', {
      name: 'simulation_builder',
      description: 'Bitcoin fee simulation and scenario building agent',
      capabilities: ['fee_simulation', 'scenario_building', 'cost_analysis'],
      instance: new SimulationBuilder()
    });

    logger.info(`Registered ${this.agents.size} agents`);
  }

  /**
   * Get all registered tools
   */
  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all registered agents
   */
  getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): AgentDefinition | undefined {
    return this.agents.get(name);
  }

  /**
   * Set the MCP server instance
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Get capabilities for MCP server
   */
  getCapabilities(): any {
    return capabilities;
  }
}
