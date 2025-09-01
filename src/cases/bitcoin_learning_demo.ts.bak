import { SimulationBuilder } from '../agents/SimulationBuilder.js';
import { NewsScout } from '../agents/NewsScout.js';
import { bitcoinPriceTool } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { fxRateTool } from '../tools/fx_rate.js';
import { logger } from '../utils/logger.js';

export class BitcoinLearningDemo {
  private simulationBuilder: SimulationBuilder;
  private newsScout: NewsScout;

  constructor() {
    this.simulationBuilder = new SimulationBuilder();
    this.newsScout = new NewsScout();
  }

  /**
   * Interactive fee learning experience
   */
  async learnAboutFees(): Promise<void> {
    console.log('\n🎓 === LEARNING: Bitcoin Transaction Fees ===\n');

    // 1. Understand current network conditions
    console.log('📊 Step 1: Understanding Network Conditions');
    const congestion = await mempoolFeeEstimatesTool.getMempoolCongestion();
    console.log(`Current congestion: ${congestion.level.toUpperCase()}`);
    console.log(`Description: ${congestion.description}`);
    console.log(`Transactions waiting: ${congestion.transactionCount.toLocaleString()}\n`);

    // 2. See fee estimates in real-time
    console.log('💰 Step 2: Real-time Fee Estimates');
    const estimates = await mempoolFeeEstimatesTool.getFeeEstimates();
    console.log('Fee rates (sat/vB):');
    console.log(`  🚀 Fastest (1 confirmation): ${estimates.fastestFee}`);
    console.log(`  ⏱️  Half Hour (3 confirmations): ${estimates.halfHourFee}`);
    console.log(`  🕐 Hour (6 confirmations): ${estimates.hourFee}`);
    console.log(`  🐌 Economy (24+ hours): ${estimates.economyFee}\n`);

    // 3. Interactive fee simulation
    console.log('🎮 Step 3: Interactive Fee Simulation');
    console.log('Let\'s simulate different scenarios...\n');

    // Scenario A: Small transaction
    const smallTx = await this.simulationBuilder.createScenario({
      transactionSize: 250,
      targetConfirmations: 6,
      urgency: 'medium',
      btcAmount: 0.001,
      name: 'Learning: Small Transaction',
      description: 'A typical small Bitcoin transaction'
    });

    console.log('📝 Scenario A: Small Transaction (250 bytes)');
    console.log(`   Fee: ${smallTx.results.totalFee} sats ($${smallTx.results.totalFeeUSD.toFixed(4)})`);
    console.log(`   Cost as % of transaction: ${smallTx.results.costPercentage.toFixed(2)}%\n`);

    // Scenario B: Large transaction
    const largeTx = await this.simulationBuilder.createScenario({
      transactionSize: 1000,
      targetConfirmations: 1,
      urgency: 'high',
      btcAmount: 1.0,
      name: 'Learning: Large Transaction',
      description: 'A large Bitcoin transaction with high priority'
    });

    console.log('📝 Scenario B: Large Transaction (1000 bytes)');
    console.log(`   Fee: ${largeTx.results.totalFee} sats ($${largeTx.results.totalFeeUSD.toFixed(4)})`);
    console.log(`   Cost as % of transaction: ${largeTx.results.costPercentage.toFixed(2)}%\n`);

    // 4. Cost comparison analysis
    console.log('📊 Step 4: Cost Comparison Analysis');
    const costAnalysis = await this.simulationBuilder.analyzeCosts(250, 0.001);
    
    console.log('Fee comparison for 250-byte transaction:');
    console.log(`   🐌 Low priority: $${costAnalysis.alternatives.lowPriority.results.totalFeeUSD.toFixed(4)}`);
    console.log(`   ⚖️  Medium priority: $${costAnalysis.alternatives.mediumPriority.results.totalFeeUSD.toFixed(4)}`);
    console.log(`   🚀 High priority: $${costAnalysis.alternatives.highPriority.results.totalFeeUSD.toFixed(4)}\n`);

    console.log('💡 Key Learning Points:');
    costAnalysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  /**
   * Real-world Bitcoin price and economics learning
   */
  async learnAboutBitcoinEconomics(): Promise<void> {
    console.log('\n🌍 === LEARNING: Bitcoin Economics ===\n');

    // 1. Current Bitcoin price
    console.log('💰 Step 1: Understanding Bitcoin Price');
    const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
    const btcDetails = await bitcoinPriceTool.getBitcoinPriceDetails();
    
    console.log(`Current BTC Price: $${btcPrice.toLocaleString()}`);
    console.log(`24h Change: ${btcDetails.change24h?.toFixed(2)}%`);
    console.log(`24h Volume: $${(btcDetails.volume24h || 0).toLocaleString()}`);
    console.log(`Market Cap: $${(btcDetails.marketCap || 0).toLocaleString()}\n`);

    // 2. Currency conversion learning
    console.log('🔄 Step 2: Currency Conversion');
    const usdToEur = await fxRateTool.getExchangeRate('usd', 'eur');
    const btcToEur = await fxRateTool.convertAmount(1, 'bitcoin', 'eur');
    
    console.log(`USD to EUR: 1 USD = ${usdToEur.rate.toFixed(4)} EUR`);
    console.log(`BTC to EUR: 1 BTC = €${btcToEur.convertedAmount.toLocaleString()}\n`);

    // 3. Fee economics in different currencies
    console.log('💱 Step 3: Fee Economics Across Currencies');
    const feeScenario = await this.simulationBuilder.createScenario({
      transactionSize: 250,
      targetConfirmations: 6,
      urgency: 'medium',
      btcAmount: 0.001
    });

    const feeInEur = await fxRateTool.convertAmount(feeScenario.results.totalFeeUSD, 'usd', 'eur');
    const feeInJpy = await fxRateTool.convertAmount(feeScenario.results.totalFeeUSD, 'usd', 'jpy');

    console.log('Transaction fee in different currencies:');
    console.log(`   USD: $${feeScenario.results.totalFeeUSD.toFixed(4)}`);
    console.log(`   EUR: €${feeInEur.convertedAmount.toFixed(4)}`);
    console.log(`   JPY: ¥${feeInJpy.convertedAmount.toFixed(2)}\n`);
  }

  /**
   * News and market sentiment learning
   */
  async learnAboutMarketSentiment(): Promise<void> {
    console.log('\n📰 === LEARNING: Market Sentiment & News ===\n');

    // 1. Get latest Bitcoin news
    console.log('📰 Step 1: Latest Bitcoin News');
    const headlines = await this.newsScout.getLatestHeadlines('bitcoin', 5);
    
    console.log('Recent Bitcoin headlines:');
    headlines.forEach((headline, index) => {
      console.log(`   ${index + 1}. ${headline.title}`);
      console.log(`      Source: ${headline.source}`);
      console.log(`      Date: ${new Date(headline.pubDate).toLocaleDateString()}\n`);
    });

    // 2. Sentiment analysis
    console.log('📊 Step 2: Market Sentiment Analysis');
    const sentiment = await this.newsScout.analyzeSentiment(headlines);
    
    console.log('Sentiment breakdown:');
    console.log(`   Positive: ${sentiment.sentiment.positive} articles`);
    console.log(`   Negative: ${sentiment.sentiment.negative} articles`);
    console.log(`   Neutral: ${sentiment.sentiment.neutral} articles`);
    console.log(`   Overall sentiment: ${sentiment.sentiment.overall.toUpperCase()}\n`);

    console.log('📈 Trending topics:');
    sentiment.trends.slice(0, 5).forEach((trend, index) => {
      console.log(`   ${index + 1}. ${trend}`);
    });

    console.log(`\n📝 Summary: ${sentiment.summary}\n`);
  }

  /**
   * Practical Bitcoin transaction planning
   */
  async learnTransactionPlanning(): Promise<void> {
    console.log('\n🎯 === LEARNING: Transaction Planning ===\n');

    // 1. Fee optimization
    console.log('🎯 Step 1: Fee Optimization');
    const optimization = await this.simulationBuilder.optimizeFees({
      maxFeeUSD: 10.00,
      maxConfirmations: 24,
      transactionSize: 500,
      btcAmount: 0.01
    });

    console.log('Optimal transaction scenario:');
    console.log(`   Name: ${optimization.optimalScenario.name}`);
    console.log(`   Fee: $${optimization.optimalScenario.results.totalFeeUSD.toFixed(4)}`);
    console.log(`   Confirmations: ${optimization.optimalScenario.results.estimatedConfirmations}`);
    console.log(`   Potential savings: $${optimization.savings.toFixed(4)}\n`);

    // 2. Alternative scenarios
    console.log('🔄 Step 2: Alternative Scenarios');
    optimization.alternatives.forEach((alt, index) => {
      console.log(`   Option ${index + 1}: ${alt.name}`);
      console.log(`     Fee: $${alt.results.totalFeeUSD.toFixed(4)}`);
      console.log(`     Confirmations: ${alt.results.estimatedConfirmations}\n`);
    });

    // 3. Recommendations
    console.log('💡 Step 3: Planning Recommendations');
    optimization.optimalScenario.results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  /**
   * Run complete learning experience
   */
  async runCompleteLearningExperience(): Promise<void> {
    console.log('🚀 Starting Complete Bitcoin Learning Experience...\n');
    
    try {
      await this.learnAboutFees();
      await this.learnAboutBitcoinEconomics();
      await this.learnAboutMarketSentiment();
      await this.learnTransactionPlanning();
      
      console.log('\n🎉 Learning Experience Complete!');
      console.log('\n📚 What you\'ve learned:');
      console.log('   ✅ How Bitcoin fees work in real-time');
      console.log('   ✅ How to optimize transaction costs');
      console.log('   ✅ How to read market sentiment');
      console.log('   ✅ How to plan Bitcoin transactions');
      console.log('   ✅ How Bitcoin economics work globally');
      
    } catch (error) {
      logger.error('Learning experience failed:', error);
      throw error;
    }
  }

  /**
   * Interactive learning session
   */
  async interactiveLearningSession(): Promise<void> {
    console.log('\n🎮 === INTERACTIVE BITCOIN LEARNING SESSION ===\n');
    
    // This would be enhanced with user input and branching scenarios
    console.log('Welcome to your interactive Bitcoin learning session!');
    console.log('This session will help you understand Bitcoin through real-world examples.\n');
    
    // Simulate user choices
    const userChoices = [
      'Learn about fees',
      'Understand Bitcoin economics', 
      'Analyze market sentiment',
      'Plan a transaction'
    ];
    
    console.log('Available learning modules:');
    userChoices.forEach((choice, index) => {
      console.log(`   ${index + 1}. ${choice}`);
    });
    
    console.log('\n💡 Tip: In a real implementation, you would choose your learning path!');
    console.log('   Each choice would lead to different interactive scenarios.');
    console.log('   You could simulate transactions, analyze real data, and more.\n');
  }
}

// Export for use in other modules
export const bitcoinLearningDemo = new BitcoinLearningDemo();

// Run demo if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  bitcoinLearningDemo.runCompleteLearningExperience().catch((error) => {
    console.error('Learning demo failed:', error);
    process.exit(1);
  });
}
