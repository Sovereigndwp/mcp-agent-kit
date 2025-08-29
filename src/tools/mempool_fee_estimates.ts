import { mempoolClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export interface FeeEstimate {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
  timestamp: number;
}

export interface MempoolStats {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: Array<{
    fee_rate: number;
    vsize: number;
  }>;
  timestamp: number;
}

export interface BlockInfo {
  height: number;
  fee: number;
  weight: number;
  medianFee: number;
  feeRange: number[];
  nTx: number;
  timestamp: number;
}

export class MempoolFeeEstimatesTool {
  /**
   * Get current fee estimates for different confirmation times
   */
  async getFeeEstimates(): Promise<FeeEstimate> {
    const cacheKey = 'mempool_fee_estimates';
    const cached = cacheStore.get<FeeEstimate>(cacheKey);
    
    // Return cached estimates if they're less than 30 seconds old
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached;
    }

    try {
      const response = await mempoolClient.get('/v1/fees/recommended');
      
      const estimates: FeeEstimate = {
        fastestFee: response.fastestFee,
        halfHourFee: response.halfHourFee,
        hourFee: response.hourFee,
        economyFee: response.economyFee,
        minimumFee: response.minimumFee,
        timestamp: Date.now(),
      };
      
      // Cache the result
      cacheStore.set(cacheKey, estimates, 60); // 1 minute TTL
      
      return estimates;
    } catch (error) {
      logger.error('Failed to fetch fee estimates:', error);
      
      if (cached) {
        logger.warn('Using cached fee estimates due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch fee estimates');
    }
  }

  /**
   * Get current mempool statistics
   */
  async getMempoolStats(): Promise<MempoolStats> {
    const cacheKey = 'mempool_stats';
    const cached = cacheStore.get<MempoolStats>(cacheKey);
    
    // Return cached stats if they're less than 10 seconds old
    if (cached && Date.now() - cached.timestamp < 10000) {
      return cached;
    }

    try {
      const response = await mempoolClient.get('/mempool');
      
      const stats: MempoolStats = {
        count: response.count,
        vsize: response.vsize,
        total_fee: response.total_fee,
        fee_histogram: response.fee_histogram,
        timestamp: Date.now(),
      };
      
      // Cache the result
      cacheStore.set(cacheKey, stats, 30); // 30 seconds TTL
      
      return stats;
    } catch (error) {
      logger.error('Failed to fetch mempool stats:', error);
      
      if (cached) {
        logger.warn('Using cached mempool stats due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch mempool statistics');
    }
  }

  /**
   * Get recent blocks with fee information
   */
  async getRecentBlocks(limit: number = 10): Promise<BlockInfo[]> {
    const cacheKey = `recent_blocks_${limit}`;
    const cached = cacheStore.get<BlockInfo[]>(cacheKey);
    
    // Return cached blocks if they're less than 1 minute old
    if (cached && Date.now() - (cacheStore.get<number>(`${cacheKey}_timestamp`) || 0) < 60000) {
      return cached;
    }

    try {
      const response = await mempoolClient.get(`/blocks/${limit}`);
      
      const blocks: BlockInfo[] = response.map((block: any) => ({
        height: block.height,
        fee: block.fee,
        weight: block.weight,
        medianFee: block.medianFee,
        feeRange: block.feeRange,
        nTx: block.nTx,
        timestamp: block.timestamp,
      }));
      
      // Cache the result
      cacheStore.set(cacheKey, blocks, 300); // 5 minutes TTL
      cacheStore.set(`${cacheKey}_timestamp`, Date.now(), 300);
      
      return blocks;
    } catch (error) {
      logger.error('Failed to fetch recent blocks:', error);
      
      if (cached) {
        logger.warn('Using cached recent blocks due to API failure');
        return cached;
      }
      
      throw new Error('Unable to fetch recent blocks');
    }
  }

  /**
   * Get fee estimate for a specific confirmation time
   */
  async getFeeForConfirmation(confirmations: number): Promise<number> {
    const estimates = await this.getFeeEstimates();
    
    switch (confirmations) {
      case 1:
        return estimates.fastestFee;
      case 3:
        return estimates.halfHourFee;
      case 6:
        return estimates.hourFee;
      case 144: // ~24 hours
        return estimates.economyFee;
      default:
        // Interpolate between known values
        if (confirmations <= 3) {
          return estimates.fastestFee;
        } else if (confirmations <= 6) {
          return estimates.halfHourFee;
        } else if (confirmations <= 144) {
          return estimates.hourFee;
        } else {
          return estimates.economyFee;
        }
    }
  }

  /**
   * Calculate optimal fee for a transaction
   */
  async calculateOptimalFee(
    transactionSize: number,
    targetConfirmations: number,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{
    feeRate: number;
    totalFee: number;
    estimatedConfirmations: number;
  }> {
    const estimates = await this.getFeeEstimates();
    const mempoolStats = await this.getMempoolStats();
    
    let feeRate: number;
    let estimatedConfirmations: number;
    
    switch (urgency) {
      case 'high':
        feeRate = estimates.fastestFee;
        estimatedConfirmations = 1;
        break;
      case 'medium':
        feeRate = estimates.halfHourFee;
        estimatedConfirmations = 3;
        break;
      case 'low':
        feeRate = estimates.economyFee;
        estimatedConfirmations = 144;
        break;
    }
    
    // Adjust based on target confirmations
    if (targetConfirmations < estimatedConfirmations) {
      feeRate = estimates.fastestFee;
      estimatedConfirmations = 1;
    } else if (targetConfirmations > estimatedConfirmations) {
      feeRate = estimates.economyFee;
      estimatedConfirmations = 144;
    }
    
    const totalFee = Math.ceil((transactionSize * feeRate) / 1000); // Convert to satoshis
    
    return {
      feeRate,
      totalFee,
      estimatedConfirmations,
    };
  }

  /**
   * Get mempool congestion level
   */
  async getMempoolCongestion(): Promise<{
    level: 'low' | 'medium' | 'high' | 'extreme';
    description: string;
    transactionCount: number;
    totalSize: number;
  }> {
    const stats = await this.getMempoolStats();
    
    let level: 'low' | 'medium' | 'high' | 'extreme';
    let description: string;
    
    if (stats.count < 1000) {
      level = 'low';
      description = 'Mempool is relatively empty, low fees should work well';
    } else if (stats.count < 5000) {
      level = 'medium';
      description = 'Moderate congestion, standard fees recommended';
    } else if (stats.count < 15000) {
      level = 'high';
      description = 'High congestion, higher fees recommended for faster confirmation';
    } else {
      level = 'extreme';
      description = 'Extreme congestion, use high fees or wait for better conditions';
    }
    
    return {
      level,
      description,
      transactionCount: stats.count,
      totalSize: stats.vsize,
    };
  }
}

// Create and export default instance
export const mempoolFeeEstimatesTool = new MempoolFeeEstimatesTool();

// Export convenience functions
export const getFeeEstimates = () => mempoolFeeEstimatesTool.getFeeEstimates();
export const getMempoolStats = () => mempoolFeeEstimatesTool.getMempoolStats();
export const getRecentBlocks = (limit?: number) => mempoolFeeEstimatesTool.getRecentBlocks(limit);
export const getFeeForConfirmation = (confirmations: number) => mempoolFeeEstimatesTool.getFeeForConfirmation(confirmations);
export const calculateOptimalFee = (transactionSize: number, targetConfirmations: number, urgency?: 'low' | 'medium' | 'high') => 
  mempoolFeeEstimatesTool.calculateOptimalFee(transactionSize, targetConfirmations, urgency);
export const getMempoolCongestion = () => mempoolFeeEstimatesTool.getMempoolCongestion();
