import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    transactionSize: number;
    targetConfirmations: number;
    urgency: 'low' | 'medium' | 'high';
    btcAmount: number;
    currency: string;
  };
  results: {
    feeRate: number;
    totalFee: number;
    totalFeeUSD: number;
    estimatedConfirmations: number;
    costPercentage: number;
    recommendations: string[];
  };
  timestamp: number;
}

export interface CostAnalysis {
  scenario: SimulationScenario;
  alternatives: {
    lowPriority: SimulationScenario;
    mediumPriority: SimulationScenario;
    highPriority: SimulationScenario;
  };
  comparison: {
    feeSavings: {
      lowVsMedium: number;
      lowVsHigh: number;
      mediumVsHigh: number;
    };
    timeTradeoffs: {
      lowVsMedium: number;
      lowVsHigh: number;
      mediumVsHigh: number;
    };
  };
  recommendations: string[];
}

export class SimulationBuilder {
  private scenarios: Map<string, SimulationScenario> = new Map();

  /**
   * Create a new fee simulation scenario
   */
  async createScenario(parameters: {
    transactionSize: number;
    targetConfirmations: number;
    urgency?: 'low' | 'medium' | 'high';
    btcAmount?: number;
    currency?: string;
    name?: string;
    description?: string;
  }): Promise<SimulationScenario> {
    try {
      const scenarioId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current fee estimates
      const feeEstimate = await mempoolFeeEstimatesTool.calculateOptimalFee(
        parameters.transactionSize,
        parameters.targetConfirmations,
        parameters.urgency || 'medium'
      );

      // Get current Bitcoin price for USD conversion
      const btcPriceData = await btc_price();
      const btcPrice = btcPriceData.usd; // Use USD price regardless of parameters.currency for now
      
      // Calculate fee in USD
      const totalFeeBTC = feeEstimate.totalFee / 100000000; // Convert satoshis to BTC
      const totalFeeUSD = totalFeeBTC * btcPrice;
      
      // Calculate cost as percentage of transaction
      const btcAmount = parameters.btcAmount || 0;
      const costPercentage = btcAmount > 0 ? (totalFeeBTC / btcAmount) * 100 : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(feeEstimate, costPercentage);

      const scenario: SimulationScenario = {
        id: scenarioId,
        name: parameters.name || `Fee Simulation ${new Date().toLocaleDateString()}`,
        description: parameters.description || `Simulation for ${parameters.transactionSize} byte transaction`,
        parameters: {
          transactionSize: parameters.transactionSize,
          targetConfirmations: parameters.targetConfirmations,
          urgency: parameters.urgency || 'medium',
          btcAmount: btcAmount,
          currency: parameters.currency || 'usd'
        },
        results: {
          feeRate: feeEstimate.feeRate,
          totalFee: feeEstimate.totalFee,
          totalFeeUSD: totalFeeUSD,
          estimatedConfirmations: feeEstimate.estimatedConfirmations,
          costPercentage: costPercentage,
          recommendations: recommendations
        },
        timestamp: Date.now()
      };

      // Store scenario
      this.scenarios.set(scenarioId, scenario);
      
      // Cache scenario
      cacheStore.set(`scenario_${scenarioId}`, scenario, 3600); // 1 hour TTL

      return scenario;
    } catch (error) {
      logger.error('Failed to create simulation scenario:', error);
      throw new Error('Unable to create simulation scenario');
    }
  }

  /**
   * Analyze costs across different priority levels
   */
  async analyzeCosts(transactionSize: number, btcAmount: number = 0): Promise<CostAnalysis> {
    try {
      // Create scenarios for different priority levels
      const lowPriority = await this.createScenario({
        transactionSize,
        targetConfirmations: 144, // ~24 hours
        urgency: 'low',
        btcAmount,
        name: 'Low Priority Scenario'
      });

      const mediumPriority = await this.createScenario({
        transactionSize,
        targetConfirmations: 6, // ~1 hour
        urgency: 'medium',
        btcAmount,
        name: 'Medium Priority Scenario'
      });

      const highPriority = await this.createScenario({
        transactionSize,
        targetConfirmations: 1, // Next block
        urgency: 'high',
        btcAmount,
        name: 'High Priority Scenario'
      });

      // Calculate fee savings
      const feeSavings = {
        lowVsMedium: mediumPriority.results.totalFeeUSD - lowPriority.results.totalFeeUSD,
        lowVsHigh: highPriority.results.totalFeeUSD - lowPriority.results.totalFeeUSD,
        mediumVsHigh: highPriority.results.totalFeeUSD - mediumPriority.results.totalFeeUSD
      };

      // Calculate time tradeoffs (in minutes)
      const timeTradeoffs = {
        lowVsMedium: (144 - 6) * 10, // ~23 hours
        lowVsHigh: (144 - 1) * 10,   // ~24 hours
        mediumVsHigh: (6 - 1) * 10   // ~50 minutes
      };

      // Generate recommendations
      const recommendations = this.generateCostRecommendations(feeSavings, timeTradeoffs, btcAmount);

      const analysis: CostAnalysis = {
        scenario: mediumPriority, // Use medium as baseline
        alternatives: {
          lowPriority,
          mediumPriority,
          highPriority
        },
        comparison: {
          feeSavings,
          timeTradeoffs
        },
        recommendations
      };

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze costs:', error);
      throw new Error('Unable to analyze transaction costs');
    }
  }

  /**
   * Optimize fees based on constraints
   */
  async optimizeFees(constraints: {
    maxFeeUSD?: number;
    maxConfirmations?: number;
    transactionSize: number;
    btcAmount?: number;
  }): Promise<{
    optimalScenario: SimulationScenario;
    alternatives: SimulationScenario[];
    savings: number;
  }> {
    try {
      const scenarios: SimulationScenario[] = [];
      
      // Generate scenarios with different confirmation targets
      const confirmationTargets = [1, 3, 6, 12, 24, 48, 72, 144];
      
      for (const confirmations of confirmationTargets) {
        if (constraints.maxConfirmations && confirmations > constraints.maxConfirmations) {
          continue;
        }

        const scenario = await this.createScenario({
          transactionSize: constraints.transactionSize,
          targetConfirmations: confirmations,
          btcAmount: constraints.btcAmount || 0,
          name: `${confirmations} Confirmation Scenario`
        });

        // Check fee constraint
        if (constraints.maxFeeUSD && scenario.results.totalFeeUSD > constraints.maxFeeUSD) {
          continue;
        }

        scenarios.push(scenario);
      }

      // Sort by fee cost (lowest first)
      scenarios.sort((a, b) => a.results.totalFeeUSD - b.results.totalFeeUSD);

      const optimalScenario = scenarios[0];
      const alternatives = scenarios.slice(1, 4); // Next 3 alternatives
      
      // Calculate potential savings vs highest fee scenario
      const highestFee = scenarios[scenarios.length - 1]?.results.totalFeeUSD || 0;
      const savings = highestFee - optimalScenario.results.totalFeeUSD;

      return {
        optimalScenario,
        alternatives,
        savings
      };
    } catch (error) {
      logger.error('Failed to optimize fees:', error);
      throw new Error('Unable to optimize transaction fees');
    }
  }

  /**
   * Get saved scenario by ID
   */
  async getScenario(scenarioId: string): Promise<SimulationScenario | null> {
    // Check cache first
    const cached = cacheStore.get<SimulationScenario>(`scenario_${scenarioId}`);
    if (cached) {
      return cached;
    }

    // Check local storage
    return this.scenarios.get(scenarioId) || null;
  }

  /**
   * List all saved scenarios
   */
  async listScenarios(): Promise<SimulationScenario[]> {
    return Array.from(this.scenarios.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Process agent requests
   */
  async process(args: any): Promise<any> {
    const { action, parameters } = args;

    switch (action) {
      case 'create_scenario':
        return await this.createScenario(parameters);
      
      case 'analyze_costs':
        return await this.analyzeCosts(
          parameters.transactionSize,
          parameters.btcAmount
        );
      
      case 'optimize_fees':
        return await this.optimizeFees(parameters);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Generate recommendations based on fee estimates
   */
  private generateRecommendations(feeEstimate: any, costPercentage: number): string[] {
    const recommendations: string[] = [];

    if (feeEstimate.feeRate > 100) {
      recommendations.push('High fee rate detected. Consider waiting for lower congestion.');
    }

    if (feeEstimate.estimatedConfirmations > 6) {
      recommendations.push('Long confirmation time expected. Higher fees may be needed for faster confirmation.');
    }

    if (costPercentage > 5) {
      recommendations.push('Fee represents more than 5% of transaction value. Consider batching or waiting.');
    }

    if (feeEstimate.feeRate < 10) {
      recommendations.push('Low fee rate detected. Good time for transactions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Fee estimates look reasonable for current network conditions.');
    }

    return recommendations;
  }

  /**
   * Generate cost analysis recommendations
   */
  private generateCostRecommendations(feeSavings: any, timeTradeoffs: any, btcAmount: number): string[] {
    const recommendations: string[] = [];

    if (feeSavings.lowVsHigh > 10) {
      recommendations.push(`High priority costs $${feeSavings.lowVsHigh.toFixed(2)} more than low priority.`);
    }

    if (timeTradeoffs.lowVsHigh > 1440) { // More than 24 hours
      recommendations.push('Low priority saves significant time but may not be suitable for urgent transactions.');
    }

    if (btcAmount > 0) {
      const percentageSavings = (feeSavings.lowVsHigh / btcAmount) * 100;
      if (percentageSavings > 1) {
        recommendations.push(`Fee savings represent ${percentageSavings.toFixed(2)}% of transaction value.`);
      }
    }

    if (feeSavings.mediumVsHigh < 5) {
      recommendations.push('Medium and high priority fees are similar. Medium priority may be optimal.');
    }

    return recommendations;
  }
}
