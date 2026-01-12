import { BaseAgent } from './BaseAgent.js';
import { btc_price } from '../tools/btc_price.js';
import { MempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import type { Tool } from '../types/agent.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Academy Data Bridge Agent
 * 
 * Bridges real-time Bitcoin data between MCP agent kit and academy sites.
 * Provides live data for calculators, courses, and educational content.
 */

interface BitcoinDataSnapshot {
  timestamp: string;
  price: {
    usd: number;
    source: string;
  };
  mempool: {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
  };
  network: {
    blockHeight: number;
    difficulty: number;
  };
}

interface CalculatorData {
  btcPrice: number;
  feeEstimates: {
    fast: number;
    normal: number;
    slow: number;
  };
  updatedAt: string;
}

export class AcademyDataBridge extends BaseAgent {
  readonly name = 'AcademyDataBridge';
  readonly description = 'Bridges real-time Bitcoin data between agent kit and academy sites';
  
  private feeEstimator = new MempoolFeeEstimatesTool();

  /**
   * Get current Bitcoin data snapshot
   */
  async getCurrentSnapshot(): Promise<BitcoinDataSnapshot> {
    try {
      // Fetch real-time data from tools
      const priceData = await btc_price();
      const feeData = await this.feeEstimator.getFeeEstimates();

      return {
        timestamp: new Date().toISOString(),
        price: {
          usd: priceData.usd,
          source: priceData.source || 'mempool.space'
        },
        mempool: {
          fastestFee: feeData.fastestFee,
          halfHourFee: feeData.halfHourFee,
          hourFee: feeData.hourFee,
          economyFee: feeData.economyFee || feeData.hourFee
        },
        network: {
          blockHeight: 0, // Can be enhanced with additional API calls
          difficulty: 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate calculator-ready data export
   */
  async generateCalculatorData(): Promise<CalculatorData> {
    const snapshot = await this.getCurrentSnapshot();

    return {
      btcPrice: snapshot.price.usd,
      feeEstimates: {
        fast: snapshot.mempool.fastestFee,
        normal: snapshot.mempool.halfHourFee,
        slow: snapshot.mempool.economyFee
      },
      updatedAt: snapshot.timestamp
    };
  }

  /**
   * Export data to academy repositories
   */
  async exportToAcademies(options: {
    financialAcademyPath?: string;
    bitcoinAcademyPath?: string;
  }): Promise<{ success: boolean; exported: string[] }> {
    const exported: string[] = [];

    try {
      const data = await this.getCurrentSnapshot();
      const calculatorData = await this.generateCalculatorData();

      // Export to financially-sovereign-academy
      if (options.financialAcademyPath) {
        const financialDataPath = path.join(
          options.financialAcademyPath,
          'data',
          'bitcoin-live-data.json'
        );
        
        await fs.mkdir(path.dirname(financialDataPath), { recursive: true });
        await fs.writeFile(financialDataPath, JSON.stringify(calculatorData, null, 2));
        exported.push('financially-sovereign-academy');
      }

      // Export to bitcoin-sovereign-academy (if different structure needed)
      if (options.bitcoinAcademyPath) {
        const bitcoinDataPath = path.join(
          options.bitcoinAcademyPath,
          'data',
          'live-network-data.json'
        );
        
        await fs.mkdir(path.dirname(bitcoinDataPath), { recursive: true });
        await fs.writeFile(bitcoinDataPath, JSON.stringify(data, null, 2));
        exported.push('bitcoin-sovereign-academy');
      }

      return {
        success: true,
        exported
      };

    } catch (error) {
      return {
        success: false,
        exported
      };
    }
  }

  /**
   * Generate educational context for Bitcoin data
   */
  async generateEducationalContext(snapshot: BitcoinDataSnapshot): Promise<string> {
    const priceFormatted = snapshot.price.usd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return `
## Live Bitcoin Network Status

**Current Price:** ${priceFormatted}
- Data source: ${snapshot.price.source}
- Last updated: ${new Date(snapshot.timestamp).toLocaleString()}

**Transaction Fees:**
- ⚡ Fast (Next block): ${snapshot.mempool.fastestFee} sat/vB
- 🕐 Normal (30 mins): ${snapshot.mempool.halfHourFee} sat/vB
- 🐢 Economy (1 hour): ${snapshot.mempool.economyFee} sat/vB

**Network Information:**
- Current block height: ${snapshot.network.blockHeight.toLocaleString()}

> **Educational Note:** Transaction fees fluctuate based on network demand. During busy periods, 
> fees increase as users compete for block space. Use our fee calculator to estimate costs 
> for your transactions.
`.trim();
  }

  /**
   * Handle tool calls (MCP interface)
   */
  async handleToolCall(toolName: string, args: unknown): Promise<unknown> {
    switch (toolName) {
      case 'get_bitcoin_snapshot':
        return await this.getCurrentSnapshot();

      case 'get_calculator_data':
        return await this.generateCalculatorData();

      case 'export_to_academies':
        return await this.exportToAcademies(args as { financialAcademyPath?: string; bitcoinAcademyPath?: string });

      case 'generate_educational_context':
        const argsObj = args as { snapshot?: BitcoinDataSnapshot };
        const snapshot = argsObj.snapshot || await this.getCurrentSnapshot();
        return await this.generateEducationalContext(snapshot);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Get available tools for MCP registration
   */
  getTools(): Tool[] {
    return [
      {
        name: 'get_bitcoin_snapshot',
        description: 'Get current Bitcoin network data snapshot including price, fees, and network stats',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_calculator_data',
        description: 'Get Bitcoin data formatted for calculator integration',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'export_to_academies',
        description: 'Export current Bitcoin data to academy repository data files',
        inputSchema: {
          type: 'object',
          properties: {
            financialAcademyPath: {
              type: 'string',
              description: 'Path to financially-sovereign-academy repository'
            },
            bitcoinAcademyPath: {
              type: 'string',
              description: 'Path to bitcoin-sovereign-academy repository'
            }
          },
          required: []
        }
      },
      {
        name: 'generate_educational_context',
        description: 'Generate educational content explaining current Bitcoin network conditions',
        inputSchema: {
          type: 'object',
          properties: {
            snapshot: {
              type: 'object',
              description: 'Optional Bitcoin data snapshot, will fetch current if not provided'
            }
          },
          required: []
        }
      }
    ];
  }
}
