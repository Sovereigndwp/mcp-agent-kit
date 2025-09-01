import { coingeckoClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  source: string;
}

export class FXRateTool {
  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const cacheKey = `fx_rate_${from}_${to}`;
    const cached = cacheStore.get<ExchangeRate>(cacheKey);
    
    // Return cached rate if it's less than 5 minutes old
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached;
    }

    try {
      // Use CoinGecko API for crypto-to-fiat and fiat-to-fiat rates
      const response = await coingeckoClient.get(
        `simple/price?ids=${from}&vs_currencies=${to}`
      );
      
      if (!response[from] || !response[from][to]) {
        throw new Error(`No exchange rate available for ${from} to ${to}`);
      }

      const rate: ExchangeRate = {
        from,
        to,
        rate: response[from][to],
        timestamp: Date.now(),
        source: 'CoinGecko'
      };

      // Cache the result
      cacheStore.set(cacheKey, rate, 300); // 5 minutes TTL

      return rate;
    } catch (error) {
      logger.error('Failed to fetch exchange rate:', error);
      
      if (cached) {
        logger.warn('Using cached exchange rate due to API failure');
        return cached;
      }
      
      throw new Error(`Unable to fetch exchange rate for ${from} to ${to}`);
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertAmount(
    amount: number,
    from: string,
    to: string
  ): Promise<{
    amount: number;
    convertedAmount: number;
    rate: number;
    from: string;
    to: string;
  }> {
    const rate = await this.getExchangeRate(from, to);
    const convertedAmount = amount * rate.rate;

    return {
      amount,
      convertedAmount,
      rate: rate.rate,
      from,
      to
    };
  }

  /**
   * Get multiple exchange rates at once
   */
  async getMultipleRates(
    base: string,
    targets: string[]
  ): Promise<ExchangeRate[]> {
    const rates: ExchangeRate[] = [];
    
    for (const target of targets) {
      try {
        const rate = await this.getExchangeRate(base, target);
        rates.push(rate);
      } catch (error) {
        logger.warn(`Failed to get rate for ${base} to ${target}:`, error);
      }
    }
    
    return rates;
  }
}

// Create and export default instance
export const fxRateTool = new FXRateTool();

// Export convenience functions
export const getExchangeRate = (from: string, to: string) => fxRateTool.getExchangeRate(from, to);
export const convertAmount = (amount: number, from: string, to: string) => fxRateTool.convertAmount(amount, from, to);
export const getMultipleRates = (base: string, targets: string[]) => fxRateTool.getMultipleRates(base, targets);
