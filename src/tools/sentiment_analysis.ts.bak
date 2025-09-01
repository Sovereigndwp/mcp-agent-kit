import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';

export interface SentimentResult {
  score: number; // -1 to 1, where -1 is very negative, 1 is very positive
  magnitude: number; // 0 to 1, strength of the sentiment
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1, confidence in the classification
  keywords: {
    positive: string[];
    negative: string[];
  };
}

export interface BatchSentimentResult {
  overall: SentimentResult;
  individual: SentimentResult[];
  summary: {
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    average_score: number;
  };
}

export class SentimentAnalysisTool {
  private positiveKeywords = [
    // Market sentiment
    'bullish', 'bull', 'surge', 'rally', 'gain', 'gains', 'up', 'rise', 'rising', 
    'positive', 'growth', 'growing', 'increase', 'pump', 'moon', 'mooning',
    
    // Adoption & Development
    'adoption', 'institutional', 'investment', 'invest', 'breakthrough', 
    'innovation', 'upgrade', 'improvement', 'success', 'successful', 'achieve',
    'milestone', 'progress', 'development', 'partnership', 'collaboration',
    
    // Technology
    'scalability', 'efficiency', 'secure', 'security', 'decentralized',
    'transparent', 'trustless', 'immutable', 'revolutionary', 'disruptive',
    
    // Market indicators
    'accumulation', 'accumulating', 'hodl', 'holding', 'long-term', 'optimistic',
    'confidence', 'opportunity', 'potential', 'promising', 'bright', 'strong'
  ];

  private negativeKeywords = [
    // Market sentiment  
    'bearish', 'bear', 'crash', 'dump', 'drop', 'fall', 'falling', 'down',
    'decline', 'negative', 'loss', 'losses', 'sell-off', 'selling', 'panic',
    'fear', 'uncertainty', 'doubt', 'fud', 'correction', 'dip',
    
    // Regulatory & Legal
    'regulation', 'regulatory', 'ban', 'banned', 'prohibition', 'illegal',
    'lawsuit', 'investigation', 'crackdown', 'enforcement', 'compliance',
    
    // Security & Risk
    'hack', 'hacked', 'breach', 'stolen', 'theft', 'scam', 'fraud',
    'ponzi', 'risk', 'risky', 'dangerous', 'vulnerable', 'attack',
    'exploit', 'bug', 'flaw', 'failure', 'failed',
    
    // Market indicators
    'liquidation', 'margin-call', 'bankruptcy', 'collapse', 'bubble',
    'overvalued', 'speculation', 'manipulation', 'volatile', 'unstable'
  ];

  private neutralKeywords = [
    'analysis', 'report', 'study', 'research', 'data', 'statistics',
    'market', 'price', 'trading', 'volume', 'technical', 'fundamental',
    'bitcoin', 'btc', 'cryptocurrency', 'blockchain', 'technology',
    'network', 'miners', 'mining', 'transaction', 'confirmation'
  ];

  private intensifiers = [
    'very', 'extremely', 'highly', 'significantly', 'dramatically',
    'massively', 'tremendous', 'huge', 'major', 'substantial',
    'slight', 'minor', 'moderate', 'somewhat', 'relatively'
  ];

  /**
   * Analyze sentiment of a single text
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const cacheKey = `sentiment_${this.hashText(text)}`;
    const cached = cacheStore.get<SentimentResult>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const normalizedText = text.toLowerCase().trim();
      const words = normalizedText.match(/\b\w+\b/g) || [];
      
      let positiveScore = 0;
      let negativeScore = 0;
      const foundPositive: string[] = [];
      const foundNegative: string[] = [];
      
      // Count keyword matches with weights
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const prevWord = words[i - 1];
        const nextWord = words[i + 1];
        
        // Check for positive keywords
        if (this.positiveKeywords.includes(word)) {
          let weight = 1;
          
          // Apply intensifier weights
          if (prevWord && this.intensifiers.includes(prevWord)) {
            weight = this.getIntensifierWeight(prevWord);
          }
          
          positiveScore += weight;
          foundPositive.push(word);
        }
        
        // Check for negative keywords
        if (this.negativeKeywords.includes(word)) {
          let weight = 1;
          
          // Apply intensifier weights
          if (prevWord && this.intensifiers.includes(prevWord)) {
            weight = this.getIntensifierWeight(prevWord);
          }
          
          negativeScore += weight;
          foundNegative.push(word);
        }
        
        // Check for negation (reverses sentiment)
        if (['not', 'no', 'never', 'none', 'nobody', 'nothing'].includes(word)) {
          if (nextWord && this.positiveKeywords.includes(nextWord)) {
            negativeScore += 0.5; // Negated positive becomes negative
          } else if (nextWord && this.negativeKeywords.includes(nextWord)) {
            positiveScore += 0.5; // Negated negative becomes positive
          }
        }
      }
      
      // Calculate final score and metrics
      const totalKeywords = positiveScore + negativeScore;
      const rawScore = totalKeywords > 0 ? (positiveScore - negativeScore) / totalKeywords : 0;
      
      // Normalize score to -1 to 1 range
      const normalizedScore = Math.max(-1, Math.min(1, rawScore));
      
      // Calculate magnitude (strength of sentiment)
      const magnitude = totalKeywords / Math.max(words.length, 1);
      
      // Determine label
      const threshold = 0.1;
      let label: 'positive' | 'negative' | 'neutral';
      if (normalizedScore > threshold) {
        label = 'positive';
      } else if (normalizedScore < -threshold) {
        label = 'negative';
      } else {
        label = 'neutral';
      }
      
      // Calculate confidence based on keyword density and score magnitude
      const confidence = Math.min(1, magnitude * 2 + Math.abs(normalizedScore));
      
      const result: SentimentResult = {
        score: Math.round(normalizedScore * 100) / 100,
        magnitude: Math.round(magnitude * 100) / 100,
        label,
        confidence: Math.round(confidence * 100) / 100,
        keywords: {
          positive: [...new Set(foundPositive)],
          negative: [...new Set(foundNegative)]
        }
      };
      
      // Cache for 30 minutes
      cacheStore.set(cacheKey, result, 30 * 60 * 1000);
      
      return result;
      
    } catch (error) {
      logger.error('Failed to analyze sentiment:', error);
      throw new Error('Sentiment analysis failed');
    }
  }

  /**
   * Analyze sentiment of multiple texts
   */
  async analyzeBatchSentiment(texts: string[]): Promise<BatchSentimentResult> {
    try {
      logger.info(`Analyzing sentiment for ${texts.length} texts`);
      
      const individual = await Promise.all(
        texts.map(text => this.analyzeSentiment(text))
      );
      
      // Calculate summary statistics
      const positiveCount = individual.filter(r => r.label === 'positive').length;
      const negativeCount = individual.filter(r => r.label === 'negative').length;
      const neutralCount = individual.filter(r => r.label === 'neutral').length;
      
      const averageScore = individual.reduce((sum, r) => sum + r.score, 0) / individual.length;
      const averageMagnitude = individual.reduce((sum, r) => sum + r.magnitude, 0) / individual.length;
      const averageConfidence = individual.reduce((sum, r) => sum + r.confidence, 0) / individual.length;
      
      // Determine overall sentiment
      let overallLabel: 'positive' | 'negative' | 'neutral';
      if (positiveCount > negativeCount) {
        overallLabel = 'positive';
      } else if (negativeCount > positiveCount) {
        overallLabel = 'negative';
      } else {
        overallLabel = 'neutral';
      }
      
      // Combine all keywords
      const allPositive = individual.flatMap(r => r.keywords.positive);
      const allNegative = individual.flatMap(r => r.keywords.negative);
      
      const overall: SentimentResult = {
        score: Math.round(averageScore * 100) / 100,
        magnitude: Math.round(averageMagnitude * 100) / 100,
        label: overallLabel,
        confidence: Math.round(averageConfidence * 100) / 100,
        keywords: {
          positive: [...new Set(allPositive)],
          negative: [...new Set(allNegative)]
        }
      };
      
      return {
        overall,
        individual,
        summary: {
          positive_count: positiveCount,
          negative_count: negativeCount,
          neutral_count: neutralCount,
          average_score: Math.round(averageScore * 100) / 100
        }
      };
      
    } catch (error) {
      logger.error('Failed to analyze batch sentiment:', error);
      throw new Error('Batch sentiment analysis failed');
    }
  }

  /**
   * Get sentiment trends over time (requires timestamped data)
   */
  async analyzeSentimentTrends(
    data: { text: string; timestamp: number }[],
    timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours in ms
  ): Promise<{
    trend: 'improving' | 'declining' | 'stable';
    current_sentiment: SentimentResult;
    previous_sentiment: SentimentResult;
    change: number;
  }> {
    try {
      const now = Date.now();
      const cutoff = now - timeWindow;
      
      const recentData = data.filter(d => d.timestamp > cutoff);
      const previousData = data.filter(d => d.timestamp <= cutoff && d.timestamp > cutoff - timeWindow);
      
      if (recentData.length === 0 && previousData.length === 0) {
        throw new Error('Insufficient data for trend analysis');
      }
      
      const currentTexts = recentData.map(d => d.text);
      const previousTexts = previousData.map(d => d.text);
      
      const currentResult = currentTexts.length > 0 
        ? await this.analyzeBatchSentiment(currentTexts)
        : null;
      
      const previousResult = previousTexts.length > 0 
        ? await this.analyzeBatchSentiment(previousTexts)
        : null;
      
      if (!currentResult && !previousResult) {
        throw new Error('No valid sentiment data found');
      }
      
      const currentSentiment = currentResult?.overall || { score: 0, magnitude: 0, label: 'neutral' as const, confidence: 0, keywords: { positive: [], negative: [] } };
      const previousSentiment = previousResult?.overall || { score: 0, magnitude: 0, label: 'neutral' as const, confidence: 0, keywords: { positive: [], negative: [] } };
      
      const change = currentSentiment.score - previousSentiment.score;
      const threshold = 0.1;
      
      let trend: 'improving' | 'declining' | 'stable';
      if (change > threshold) {
        trend = 'improving';
      } else if (change < -threshold) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }
      
      return {
        trend,
        current_sentiment: currentSentiment,
        previous_sentiment: previousSentiment,
        change: Math.round(change * 100) / 100
      };
      
    } catch (error) {
      logger.error('Failed to analyze sentiment trends:', error);
      throw error;
    }
  }

  private getIntensifierWeight(intensifier: string): number {
    const strongIntensifiers = ['very', 'extremely', 'highly', 'significantly', 'dramatically', 'massively', 'tremendous', 'huge', 'major', 'substantial'];
    const weakIntensifiers = ['slight', 'minor', 'moderate', 'somewhat', 'relatively'];
    
    if (strongIntensifiers.includes(intensifier)) {
      return 1.5;
    } else if (weakIntensifiers.includes(intensifier)) {
      return 0.5;
    } else {
      return 1.2; // Default intensifier weight
    }
  }

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get available sentiment categories
   */
  getSentimentCategories(): {
    positive: string[];
    negative: string[];
    neutral: string[];
  } {
    return {
      positive: [...this.positiveKeywords],
      negative: [...this.negativeKeywords],  
      neutral: [...this.neutralKeywords]
    };
  }
}

export const sentimentAnalysisTool = new SentimentAnalysisTool();

// Export convenience functions
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  return sentimentAnalysisTool.analyzeSentiment(text);
}

export async function analyzeBatchSentiment(texts: string[]): Promise<BatchSentimentResult> {
  return sentimentAnalysisTool.analyzeBatchSentiment(texts);
}