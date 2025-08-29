import { describe, it, expect, beforeAll } from '@jest/globals';
import { bitcoinPriceTool } from '../src/tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../src/tools/mempool_fee_estimates.js';
import { fxRateTool } from '../src/tools/fx_rate.js';
import { SimulationBuilder } from '../src/agents/SimulationBuilder.js';
import { NewsScout } from '../src/agents/NewsScout.js';

describe('MCP Agent Kit Smoke Tests', () => {
  let simulationBuilder: SimulationBuilder;
  let newsScout: NewsScout;

  beforeAll(() => {
    simulationBuilder = new SimulationBuilder();
    newsScout = new NewsScout();
  });

  describe('Bitcoin Price Tool', () => {
    it('should fetch current Bitcoin price', async () => {
      const price = await bitcoinPriceTool.getBitcoinPrice();
      
      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    }, 10000);

    it('should fetch Bitcoin price details', async () => {
      const details = await bitcoinPriceTool.getBitcoinPriceDetails();
      
      expect(details.price).toBeGreaterThan(0);
      expect(details.currency).toBe('usd');
      expect(details.source).toBe('CoinGecko');
      expect(details.timestamp).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Mempool Fee Estimates Tool', () => {
    it('should fetch fee estimates', async () => {
      const estimates = await mempoolFeeEstimatesTool.getFeeEstimates();
      
      expect(estimates.fastestFee).toBeGreaterThan(0);
      expect(estimates.halfHourFee).toBeGreaterThan(0);
      expect(estimates.hourFee).toBeGreaterThan(0);
      expect(estimates.economyFee).toBeGreaterThan(0);
      expect(estimates.timestamp).toBeGreaterThan(0);
    }, 10000);

    it('should get mempool stats', async () => {
      const stats = await mempoolFeeEstimatesTool.getMempoolStats();
      
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.vsize).toBeGreaterThanOrEqual(0);
      expect(stats.total_fee).toBeGreaterThanOrEqual(0);
      expect(stats.timestamp).toBeGreaterThan(0);
    }, 10000);

    it('should calculate optimal fee', async () => {
      const result = await mempoolFeeEstimatesTool.calculateOptimalFee(
        250, // 250 bytes
        6,   // 6 confirmations
        'medium'
      );
      
      expect(result.feeRate).toBeGreaterThan(0);
      expect(result.totalFee).toBeGreaterThan(0);
      expect(result.estimatedConfirmations).toBeGreaterThan(0);
    }, 10000);
  });

  describe('FX Rate Tool', () => {
    it('should fetch exchange rate', async () => {
      const rate = await fxRateTool.getExchangeRate('bitcoin', 'usd');
      
      expect(rate.rate).toBeGreaterThan(0);
      expect(rate.from).toBe('bitcoin');
      expect(rate.to).toBe('usd');
      expect(rate.timestamp).toBeGreaterThan(0);
    }, 10000);

    it('should convert amounts', async () => {
      const result = await fxRateTool.convertAmount(1, 'bitcoin', 'usd');
      
      expect(result.amount).toBe(1);
      expect(result.convertedAmount).toBeGreaterThan(0);
      expect(result.rate).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Simulation Builder Agent', () => {
    it('should create a simulation scenario', async () => {
      const scenario = await simulationBuilder.createScenario({
        transactionSize: 250,
        targetConfirmations: 6,
        urgency: 'medium',
        btcAmount: 0.001,
        name: 'Test Scenario',
        description: 'Test simulation scenario'
      });
      
      expect(scenario.id).toBeDefined();
      expect(scenario.name).toBe('Test Scenario');
      expect(scenario.parameters.transactionSize).toBe(250);
      expect(scenario.results.feeRate).toBeGreaterThan(0);
      expect(scenario.results.totalFee).toBeGreaterThan(0);
    }, 15000);

    it('should analyze costs', async () => {
      const analysis = await simulationBuilder.analyzeCosts(250, 0.001);
      
      expect(analysis.scenario).toBeDefined();
      expect(analysis.alternatives.lowPriority).toBeDefined();
      expect(analysis.alternatives.mediumPriority).toBeDefined();
      expect(analysis.alternatives.highPriority).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    }, 20000);
  });

  describe('News Scout Agent', () => {
    it('should fetch latest headlines', async () => {
      const headlines = await newsScout.getLatestHeadlines(undefined, 5);
      
      expect(Array.isArray(headlines)).toBe(true);
      expect(headlines.length).toBeLessThanOrEqual(5);
      
      if (headlines.length > 0) {
        const headline = headlines[0];
        expect(headline.title).toBeDefined();
        expect(headline.description).toBeDefined();
        expect(headline.link).toBeDefined();
        expect(headline.source).toBeDefined();
      }
    }, 15000);

    it('should analyze sentiment', async () => {
      const headlines = await newsScout.getLatestHeadlines(undefined, 3);
      
      if (headlines.length > 0) {
        const analysis = await newsScout.analyzeSentiment(headlines);
        
        expect(analysis.items.length).toBe(headlines.length);
        expect(analysis.sentiment.positive).toBeGreaterThanOrEqual(0);
        expect(analysis.sentiment.negative).toBeGreaterThanOrEqual(0);
        expect(analysis.sentiment.neutral).toBeGreaterThanOrEqual(0);
        expect(analysis.summary).toBeDefined();
      }
    }, 20000);
  });

  describe('Integration Tests', () => {
    it('should work with multiple tools together', async () => {
      // Get Bitcoin price
      const btcPrice = await bitcoinPriceTool.getBitcoinPrice();
      
      // Get fee estimates
      const feeEstimates = await mempoolFeeEstimatesTool.getFeeEstimates();
      
      // Create simulation
      const scenario = await simulationBuilder.createScenario({
        transactionSize: 250,
        targetConfirmations: 6,
        urgency: 'medium',
        btcAmount: 0.001
      });
      
      // Verify all data is reasonable
      expect(btcPrice).toBeGreaterThan(1000); // BTC should be > $1000
      expect(feeEstimates.fastestFee).toBeGreaterThan(0);
      expect(scenario.results.totalFeeUSD).toBeGreaterThan(0);
      expect(scenario.results.totalFeeUSD).toBeLessThan(100); // Should be reasonable fee
    }, 25000);
  });
});
