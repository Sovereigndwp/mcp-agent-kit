import { mempoolClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export class MempoolBlocksTool {
  async getRecentBlocks(limit: number = 10): Promise<any[]> {
    // TODO: Implement recent blocks fetching
    return [];
  }
}

export const mempoolBlocksTool = new MempoolBlocksTool();
