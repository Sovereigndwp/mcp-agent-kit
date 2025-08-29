#!/usr/bin/env node

import { config } from 'dotenv';
import { bitcoinPriceTool } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { fxRateTool } from '../tools/fx_rate.js';
import { NewsScout } from '../agents/NewsScout.js';
import { SimulationBuilder } from '../agents/SimulationBuilder.js';
import { logger } from '../utils/logger.js';

// Load environment variables
config();

export class CanvaSnippetGenerator {
  private newsScout: NewsScout;
  private simulationBuilder: SimulationBuilder;

  constructor() {
    this.newsScout = new NewsScout();
    this.simulationBuilder = new SimulationBuilder();
  }

  /**
   * Generate a Bitcoin price snippet for Canva
   */
  async generatePriceSnippet(): Promise<{
    title: string;
    subtitle: string;
    price: string;
    change: string;
    marketCap: string;
    volume: string;
    timestamp: string;
  }> {
    try {
      const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
      const btcDetails = await bitcoinPriceTool.getBitcoinPriceDetails();
      
      const change = btcDetails.change24h || 0;
      const changeText = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
      const changeEmoji = change >= 0 ? '📈' : '📉';
      
      return {
        title: 'Bitcoin Price Update',
        subtitle: 'Live Market Data',
        price: `$${btcPrice.toLocaleString()}`,
        change: `${changeEmoji} ${changeText}`,
        marketCap: `$${(btcDetails.marketCap || 0).toLocaleString()}`,
        volume: `$${(btcDetails.volume24h || 0).toLocaleString()}`,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      logger.error('Failed to generate price snippet:', error);
      throw error;
    }
  }

  /**
   * Generate a fee analysis snippet for Canva
   */
  async generateFeeSnippet(): Promise<{
    title: string;
    subtitle: string;
    fastestFee: string;
    standardFee: string;
    economyFee: string;
    congestion: string;
    recommendation: string;
    timestamp: string;
  }> {
    try {
      const estimates = await mempoolFeeEstimatesTool.getFeeEstimates();
      const congestion = await mempoolFeeEstimatesTool.getMempoolCongestion();
      
      const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
      
      // Calculate fees in USD
      const fastestUSD = (estimates.fastestFee * 250 / 100000000) * btcPrice;
      const standardUSD = (estimates.hourFee * 250 / 100000000) * btcPrice;
      const economyUSD = (estimates.economyFee * 250 / 100000000) * btcPrice;
      
      return {
        title: 'Bitcoin Fee Analysis',
        subtitle: 'Current Network Conditions',
        fastestFee: `$${fastestUSD.toFixed(2)}`,
        standardFee: `$${standardUSD.toFixed(2)}`,
        economyFee: `$${economyUSD.toFixed(2)}`,
        congestion: congestion.level.toUpperCase(),
        recommendation: congestion.description,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      logger.error('Failed to generate fee snippet:', error);
      throw error;
    }
  }

  /**
   * Generate a news sentiment snippet for Canva
   */
  async generateNewsSnippet(): Promise<{
    title: string;
    subtitle: string;
    sentiment: string;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    topTrends: string[];
    timestamp: string;
  }> {
    try {
      const headlines = await this.newsScout.getLatestHeadlines('bitcoin', 10);
      const sentiment = await this.newsScout.analyzeSentiment(headlines);
      
      return {
        title: 'Bitcoin Market Sentiment',
        subtitle: 'News Analysis',
        sentiment: sentiment.sentiment.overall.toUpperCase(),
        positiveCount: sentiment.sentiment.positive,
        negativeCount: sentiment.sentiment.negative,
        neutralCount: sentiment.sentiment.neutral,
        topTrends: sentiment.trends.slice(0, 3),
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      logger.error('Failed to generate news snippet:', error);
      throw error;
    }
  }

  /**
   * Generate a transaction simulation snippet for Canva
   */
  async generateTransactionSnippet(): Promise<{
    title: string;
    subtitle: string;
    scenario: string;
    fee: string;
    confirmations: string;
    costPercentage: string;
    recommendation: string;
    timestamp: string;
  }> {
    try {
      const scenario = await this.simulationBuilder.createScenario({
        transactionSize: 250,
        targetConfirmations: 6,
        urgency: 'medium',
        btcAmount: 0.001,
        name: 'Canva Demo Transaction',
        description: 'Sample transaction for Canva snippet'
      });
      
      return {
        title: 'Bitcoin Transaction Simulation',
        subtitle: 'Fee Optimization Example',
        scenario: '250 bytes, 6 confirmations',
        fee: `$${scenario.results.totalFeeUSD.toFixed(4)}`,
        confirmations: `${scenario.results.estimatedConfirmations} blocks`,
        costPercentage: `${scenario.results.costPercentage.toFixed(2)}%`,
        recommendation: scenario.results.recommendations[0] || 'Fee looks reasonable',
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      logger.error('Failed to generate transaction snippet:', error);
      throw error;
    }
  }

  /**
   * Generate a global Bitcoin snippet for Canva
   */
  async generateGlobalSnippet(): Promise<{
    title: string;
    subtitle: string;
    usdPrice: string;
    eurPrice: string;
    jpyPrice: string;
    gbpPrice: string;
    cadPrice: string;
    timestamp: string;
  }> {
    try {
      const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
      const eurRate = await fxRateTool.getExchangeRate('bitcoin', 'eur');
      const jpyRate = await fxRateTool.getExchangeRate('bitcoin', 'jpy');
      const gbpRate = await fxRateTool.getExchangeRate('bitcoin', 'gbp');
      const cadRate = await fxRateTool.getExchangeRate('bitcoin', 'cad');
      
      return {
        title: 'Bitcoin Global Prices',
        subtitle: 'Multi-Currency View',
        usdPrice: `$${btcPrice.toLocaleString()}`,
        eurPrice: `€${eurRate.rate.toLocaleString()}`,
        jpyPrice: `¥${jpyRate.rate.toLocaleString()}`,
        gbpPrice: `£${gbpRate.rate.toLocaleString()}`,
        cadPrice: `C$${cadRate.rate.toLocaleString()}`,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      logger.error('Failed to generate global snippet:', error);
      throw error;
    }
  }

  /**
   * Generate all snippets for Canva
   */
  async generateAllSnippets(): Promise<{
    price: any;
    fees: any;
    news: any;
    transaction: any;
    global: any;
  }> {
    console.log('🎨 Generating Canva Snippets...\n');
    
    try {
      const [price, fees, news, transaction, global] = await Promise.all([
        this.generatePriceSnippet(),
        this.generateFeeSnippet(),
        this.generateNewsSnippet(),
        this.generateTransactionSnippet(),
        this.generateGlobalSnippet()
      ]);

      console.log('✅ All snippets generated successfully!\n');
      
      return {
        price,
        fees,
        news,
        transaction,
        global
      };
    } catch (error) {
      logger.error('Failed to generate all snippets:', error);
      throw error;
    }
  }

  /**
   * Display snippets in a formatted way
   */
  displaySnippets(snippets: any): void {
    console.log('🎨 === CANVA SNIPPETS ===\n');
    
    // Price Snippet
    console.log('💰 PRICE SNIPPET:');
    console.log(`   Title: ${snippets.price.title}`);
    console.log(`   Price: ${snippets.price.price}`);
    console.log(`   Change: ${snippets.price.change}`);
    console.log(`   Market Cap: ${snippets.price.marketCap}`);
    console.log(`   Volume: ${snippets.price.volume}\n`);
    
    // Fee Snippet
    console.log('💸 FEE SNIPPET:');
    console.log(`   Title: ${snippets.fees.title}`);
    console.log(`   Fastest: ${snippets.fees.fastestFee}`);
    console.log(`   Standard: ${snippets.fees.standardFee}`);
    console.log(`   Economy: ${snippets.fees.economyFee}`);
    console.log(`   Congestion: ${snippets.fees.congestion}\n`);
    
    // News Snippet
    console.log('📰 NEWS SNIPPET:');
    console.log(`   Title: ${snippets.news.title}`);
    console.log(`   Sentiment: ${snippets.news.sentiment}`);
    console.log(`   Positive: ${snippets.news.positiveCount}`);
    console.log(`   Negative: ${snippets.news.negativeCount}`);
    console.log(`   Neutral: ${snippets.news.neutralCount}\n`);
    
    // Transaction Snippet
    console.log('🔄 TRANSACTION SNIPPET:');
    console.log(`   Title: ${snippets.transaction.title}`);
    console.log(`   Scenario: ${snippets.transaction.scenario}`);
    console.log(`   Fee: ${snippets.transaction.fee}`);
    console.log(`   Confirmations: ${snippets.transaction.confirmations}`);
    console.log(`   Cost %: ${snippets.transaction.costPercentage}\n`);
    
    // Global Snippet
    console.log('🌍 GLOBAL SNIPPET:');
    console.log(`   Title: ${snippets.global.title}`);
    console.log(`   USD: ${snippets.global.usdPrice}`);
    console.log(`   EUR: ${snippets.global.eurPrice}`);
    console.log(`   JPY: ${snippets.global.jpyPrice}`);
    console.log(`   GBP: ${snippets.global.gbpPrice}`);
    console.log(`   CAD: ${snippets.global.cadPrice}\n`);
  }
}

// Create and export instance
export const canvaSnippetGenerator = new CanvaSnippetGenerator();

// Main execution function
async function main() {
  try {
    const generator = new CanvaSnippetGenerator();
    const snippets = await generator.generateAllSnippets();
    generator.displaySnippets(snippets);
    
    console.log('🎉 Canva snippets ready for use!');
    console.log('💡 Copy the data above into your Canva designs');
    
  } catch (error) {
    console.error('❌ Failed to generate Canva snippets:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
