import { coingeckoClient, httpClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export interface BitcoinPrice {
  price: number;
  currency: string;
  source: string;
  timestamp: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
}

export interface PriceSource {
  name: string;
  url: string;
  enabled: boolean;
}

export class BitcoinPriceTool {
  private sources: PriceSource[] = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,btc&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      enabled: true,
    },
    {
      name: 'Mempool.space',
      url: 'https://mempool.space/api/v1/fees/recommended',
      enabled: true,
    },
  ];

  /**
   * Get current Bitcoin price from primary source
   */
  async getBitcoinPrice(currency: string = 'usd'): Promise<number> {
    const cacheKey = `btc_price_${currency}`;
    const cached = cacheStore.get<BitcoinPrice>(cacheKey);
    
    // Return cached price if it's less than 1 minute old
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.price;
    }

    try {
      const price = await this.fetchFromCoinGecko(currency);
      
      // Cache the result
      cacheStore.set(cacheKey, {
        price,
        currency,
        source: 'CoinGecko',
        timestamp: Date.now(),
      }, 300); // 5 minutes TTL

      return price;
    } catch (error) {
      logger.error('Failed to fetch Bitcoin price from CoinGecko:', error);
      
      // Return cached price if available, even if expired
      if (cached) {
        logger.warn('Using cached Bitcoin price due to API failure');
        return cached.price;
      }
      
      throw new Error('Unable to fetch Bitcoin price');
    }
  }

  /**
   * Get detailed Bitcoin price information
   */
  async getBitcoinPriceDetails(currency: string = 'usd'): Promise<BitcoinPrice> {
    const cacheKey = `btc_price_details_${currency}`;
    const cached = cacheStore.get<BitcoinPrice>(cacheKey);
    
    // Return cached data if it's less than 2 minutes old
    if (cached && Date.now() - cached.timestamp < 120000) {
      return cached;
    }

    try {
      const details = await this.fetchDetailedPrice(currency);
      
      // Cache the result
      cacheStore.set(cacheKey, details, 300); // 5 minutes TTL

      return details;
    } catch (error) {
      logger.error('Failed to fetch detailed Bitcoin price:', error);
      
      // Return cached data if available
      if (cached) {
        logger.warn('Using cached Bitcoin price details due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch Bitcoin price details');
    }
  }

  /**
   * Get Bitcoin price from multiple sources for comparison
   */
  async getBitcoinPriceComparison(currency: string = 'usd'): Promise<BitcoinPrice[]> {
    const prices: BitcoinPrice[] = [];
    
    for (const source of this.sources) {
      if (!source.enabled) continue;
      
      try {
        const price = await this.fetchFromSource(source, currency);
        prices.push(price);
      } catch (error) {
        logger.warn(`Failed to fetch price from ${source.name}:`, error);
      }
    }
    
    return prices;
  }

  /**
   * Get historical Bitcoin price data
   */
  async getBitcoinPriceHistory(
    currency: string = 'usd',
    days: number = 7
  ): Promise<{ date: string; price: number }[]> {
    const cacheKey = `btc_history_${currency}_${days}`;
    const cached = cacheStore.get<{ date: string; price: number }[]>(cacheKey);
    
    // Return cached data if it's less than 1 hour old
    if (cached && Date.now() - (cacheStore.get<number>(`${cacheKey}_timestamp`) || 0) < 3600000) {
      return cached;
    }

    try {
      const response = await coingeckoClient.get(
        `coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}`
      );
      
      const history = response.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price,
      }));
      
      // Cache the result
      cacheStore.set(cacheKey, history, 3600); // 1 hour TTL
      cacheStore.set(`${cacheKey}_timestamp`, Date.now(), 3600);
      
      return history;
    } catch (error) {
      logger.error('Failed to fetch Bitcoin price history:', error);
      
      if (cached) {
        logger.warn('Using cached Bitcoin price history due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch Bitcoin price history');
    }
  }

  /**
   * Fetch price from CoinGecko
   */
  private async fetchFromCoinGecko(currency: string): Promise<number> {
    const response = await coingeckoClient.get(
      `simple/price?ids=bitcoin&vs_currencies=${currency}`
    );
    
    if (!response.bitcoin || !response.bitcoin[currency]) {
      throw new Error(`No price data available for ${currency}`);
    }
    
    return response.bitcoin[currency];
  }

  /**
   * Fetch detailed price information
   */
  private async fetchDetailedPrice(currency: string): Promise<BitcoinPrice> {
    const response = await coingeckoClient.get(
      `simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.bitcoin) {
      throw new Error(`No price data available for ${currency}`);
    }
    
    const data = response.bitcoin;
    
    return {
      price: data[currency],
      currency,
      source: 'CoinGecko',
      timestamp: Date.now(),
      change24h: data[`${currency}_24h_change`],
      volume24h: data[`${currency}_24h_vol`],
      marketCap: data[`${currency}_market_cap`],
    };
  }

  /**
   * Fetch price from a specific source
   */
  private async fetchFromSource(source: PriceSource, currency: string): Promise<BitcoinPrice> {
    switch (source.name) {
      case 'CoinGecko':
        const price = await this.fetchFromCoinGecko(currency);
        return {
          price,
          currency,
          source: source.name,
          timestamp: Date.now(),
        };
      
      case 'Mempool.space':
        // Mempool.space doesn't provide price data, skip
        throw new Error('Mempool.space does not provide price data');
      
      default:
        throw new Error(`Unknown price source: ${source.name}`);
    }
  }
}

// Create and export default instance
export const bitcoinPriceTool = new BitcoinPriceTool();

// Export convenience functions
export const getBitcoinPrice = (currency?: string) => bitcoinPriceTool.getBitcoinPrice(currency);
export const getBitcoinPriceDetails = (currency?: string) => bitcoinPriceTool.getBitcoinPriceDetails(currency);
export const getBitcoinPriceComparison = (currency?: string) => bitcoinPriceTool.getBitcoinPriceComparison(currency);
export const getBitcoinPriceHistory = (currency?: string, days?: number) => bitcoinPriceTool.getBitcoinPriceHistory(currency, days);
