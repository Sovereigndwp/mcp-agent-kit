import { SimulationBuilder } from '../agents/SimulationBuilder.js';
import { bitcoinPriceTool } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { logger } from '../utils/logger.js';

export class FeesSimulationDemo {
  private simulationBuilder: SimulationBuilder;

  constructor() {
    this.simulationBuilder = new SimulationBuilder();
  }

  /**
   * Run a comprehensive fee simulation demo
   */
  async runDemo(): Promise<void> {
    logger.info('Starting Bitcoin Fee Simulation Demo...');

    try {
      // 1. Get current Bitcoin price
      console.log('\n=== Current Bitcoin Price ===');
      const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
      console.log(`Current BTC Price: $${btcPrice.toLocaleString()}`);

      // 2. Get current fee estimates
      console.log('\n=== Current Fee Estimates ===');
      const feeEstimates = await mempoolFeeEstimatesTool.getFeeEstimates();
      console.log('Fee Estimates (sat/vB):');
      console.log(`  Fastest (1 confirmation): ${feeEstimates.fastestFee}`);
      console.log(`  Half Hour (3 confirmations): ${feeEstimates.halfHourFee}`);
      console.log(`  Hour (6 confirmations): ${feeEstimates.hourFee}`);
      console.log(`  Economy (144 confirmations): ${feeEstimates.economyFee}`);

      // 3. Get mempool congestion
      console.log('\n=== Mempool Congestion ===');
      const congestion = await mempoolFeeEstimatesTool.getMempoolCongestion();
      console.log(`Congestion Level: ${congestion.level.toUpperCase()}`);
      console.log(`Description: ${congestion.description}`);
      console.log(`Transaction Count: ${congestion.transactionCount.toLocaleString()}`);
      console.log(`Total Size: ${(congestion.totalSize / 1024 / 1024).toFixed(2)} MB`);

      // 4. Create fee simulation scenarios
      console.log('\n=== Fee Simulation Scenarios ===');
      
      // Scenario 1: Small transaction (250 bytes)
      console.log('\n--- Scenario 1: Small Transaction (250 bytes) ---');
      const smallTxScenario = await this.simulationBuilder.createScenario({
        transactionSize: 250,
        targetConfirmations: 6,
        urgency: 'medium',
        btcAmount: 0.001,
        name: 'Small Transaction Demo',
        description: 'Simulating a small Bitcoin transaction'
      });
      
      this.displayScenario(smallTxScenario);

      // Scenario 2: Medium transaction (500 bytes)
      console.log('\n--- Scenario 2: Medium Transaction (500 bytes) ---');
      const mediumTxScenario = await this.simulationBuilder.createScenario({
        transactionSize: 500,
        targetConfirmations: 3,
        urgency: 'high',
        btcAmount: 0.01,
        name: 'Medium Transaction Demo',
        description: 'Simulating a medium Bitcoin transaction'
      });
      
      this.displayScenario(mediumTxScenario);

      // 5. Cost analysis comparison
      console.log('\n=== Cost Analysis Comparison ===');
      const costAnalysis = await this.simulationBuilder.analyzeCosts(250, 0.001);
      
      console.log('\nFee Comparison (250 byte transaction):');
      console.log(`Low Priority: $${costAnalysis.alternatives.lowPriority.results.totalFeeUSD.toFixed(4)}`);
      console.log(`Medium Priority: $${costAnalysis.alternatives.mediumPriority.results.totalFeeUSD.toFixed(4)}`);
      console.log(`High Priority: $${costAnalysis.alternatives.highPriority.results.totalFeeUSD.toFixed(4)}`);
      
      console.log('\nTime Tradeoffs:');
      console.log(`Low vs Medium: ${costAnalysis.comparison.timeTradeoffs.lowVsMedium} minutes`);
      console.log(`Low vs High: ${costAnalysis.comparison.timeTradeoffs.lowVsHigh} minutes`);
      console.log(`Medium vs High: ${costAnalysis.comparison.timeTradeoffs.mediumVsHigh} minutes`);

      console.log('\nRecommendations:');
      costAnalysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });

      // 6. Fee optimization
      console.log('\n=== Fee Optimization ===');
      const optimization = await this.simulationBuilder.optimizeFees({
        maxFeeUSD: 5.00,
        maxConfirmations: 24,
        transactionSize: 250,
        btcAmount: 0.001
      });

      console.log(`Optimal Scenario: ${optimization.optimalScenario.name}`);
      console.log(`Optimal Fee: $${optimization.optimalScenario.results.totalFeeUSD.toFixed(4)}`);
      console.log(`Potential Savings: $${optimization.savings.toFixed(4)}`);

      console.log('\nAlternative Scenarios:');
      optimization.alternatives.forEach((alt, index) => {
        console.log(`${index + 1}. ${alt.name}: $${alt.results.totalFeeUSD.toFixed(4)}`);
      });

      logger.info('Bitcoin Fee Simulation Demo completed successfully!');

    } catch (error) {
      logger.error('Demo failed:', error);
      throw error;
    }
  }

  /**
   * Display a simulation scenario
   */
  private displayScenario(scenario: any): void {
    console.log(`Scenario: ${scenario.name}`);
    console.log(`Description: ${scenario.description}`);
    console.log(`Transaction Size: ${scenario.parameters.transactionSize} bytes`);
    console.log(`Target Confirmations: ${scenario.parameters.targetConfirmations}`);
    console.log(`Urgency: ${scenario.parameters.urgency}`);
    console.log(`BTC Amount: ${scenario.parameters.btcAmount} BTC`);
    
    console.log('\nResults:');
    console.log(`Fee Rate: ${scenario.results.feeRate} sat/vB`);
    console.log(`Total Fee: ${scenario.results.totalFee} sats`);
    console.log(`Total Fee (USD): $${scenario.results.totalFeeUSD.toFixed(4)}`);
    console.log(`Estimated Confirmations: ${scenario.results.estimatedConfirmations}`);
    console.log(`Cost Percentage: ${scenario.results.costPercentage.toFixed(2)}%`);
    
    console.log('\nRecommendations:');
    scenario.results.recommendations.forEach((rec: string, index: number) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  /**
   * Run a quick demo for testing
   */
  async runQuickDemo(): Promise<void> {
    logger.info('Running quick fee simulation demo...');

    try {
      const scenario = await this.simulationBuilder.createScenario({
        transactionSize: 250,
        targetConfirmations: 6,
        urgency: 'medium',
        btcAmount: 0.001,
        name: 'Quick Demo',
        description: 'Quick fee simulation demo'
      });

      console.log('\n=== Quick Fee Simulation Demo ===');
      this.displayScenario(scenario);

      logger.info('Quick demo completed successfully!');

    } catch (error) {
      logger.error('Quick demo failed:', error);
      throw error;
    }
  }
}

// Export for use in other modules
export const feesSimulationDemo = new FeesSimulationDemo();

// Run demo if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  feesSimulationDemo.runQuickDemo().catch((error) => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}
