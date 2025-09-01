import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';

export interface SocraticQuestions {
  topic: string;
  questions: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_objectives: string[];
}

export class SocraticTutor {
  private questionBank: { [key: string]: { [level: string]: string[] } } = {
    fees: {
      beginner: [
        "What happens when many people want to send Bitcoin at the same time?",
        "Why do you think some transactions cost more than others?",
        "If Bitcoin blocks have limited space, how should we decide which transactions go first?",
        "What would happen if there were no transaction fees at all?",
        "How is a Bitcoin transaction fee similar to postage on a letter?"
      ],
      intermediate: [
        "How does the mempool affect transaction fee pricing?",
        "What factors influence miners' decisions when selecting transactions?",
        "Why do fees fluctuate throughout the day and week?",
        "How do different transaction types (SegWit vs Legacy) affect fee calculation?",
        "What strategies can users employ to reduce their transaction fees?"
      ],
      advanced: [
        "How does Replace-by-Fee (RBF) change fee market dynamics?",
        "What are the economic implications of the fee market for Bitcoin's security model?",
        "How do Child-Pays-for-Parent (CPFP) transactions affect fee estimation?",
        "What role do fee estimation algorithms play in wallet design?",
        "How might Layer 2 solutions impact the base layer fee market?"
      ]
    },
    mining: {
      beginner: [
        "What work are Bitcoin miners actually doing?",
        "Why do we need miners to validate transactions?",
        "How does mining make the Bitcoin network secure?",
        "What happens to miners when all 21 million Bitcoin are mined?",
        "Why does mining use so much energy?"
      ],
      intermediate: [
        "How does mining difficulty adjustment maintain consistent block times?",
        "What is the relationship between hash rate and network security?",
        "How do mining pools affect decentralization?",
        "What economic factors influence a miner's profitability?",
        "How does the block reward halving affect mining incentives?"
      ],
      advanced: [
        "How might mining centralization risks be mitigated?",
        "What are the long-term sustainability implications of Bitcoin mining?",
        "How do stranded energy sources benefit from Bitcoin mining?",
        "What role does mining play in global energy markets?",
        "How do different consensus mechanisms compare to Bitcoin's Proof of Work?"
      ]
    },
    wallets: {
      beginner: [
        "What's the difference between a Bitcoin address and a wallet?",
        "Why is your seed phrase so important to keep safe?",
        "What happens if you lose your private keys?",
        "How is a Bitcoin wallet different from a bank account?",
        "Why might you want multiple Bitcoin addresses?"
      ],
      intermediate: [
        "What are the tradeoffs between hot and cold storage?",
        "How do multi-signature wallets enhance security?",
        "What privacy considerations should users make when choosing addresses?",
        "How do hardware wallets protect against malware?",
        "What is the purpose of HD (Hierarchical Deterministic) wallets?"
      ],
      advanced: [
        "How do different derivation paths affect wallet compatibility?",
        "What are the security implications of various signature schemes?",
        "How do time-locked transactions enhance wallet functionality?",
        "What privacy techniques can advanced users employ?",
        "How do threshold signatures improve multi-party custody solutions?"
      ]
    },
    scaling: {
      beginner: [
        "Why can't Bitcoin just make blocks bigger to handle more transactions?",
        "What problems is the Lightning Network trying to solve?",
        "How is Lightning different from regular Bitcoin transactions?",
        "What tradeoffs do we make when using Layer 2 solutions?",
        "Why is scaling Bitcoin considered a difficult problem?"
      ],
      intermediate: [
        "How do payment channels work in the Lightning Network?",
        "What are the liquidity management challenges in Lightning?",
        "How do different scaling approaches compare (bigger blocks vs Layer 2)?",
        "What role do routing nodes play in the Lightning Network?",
        "How do submarine swaps connect on-chain and off-chain Bitcoin?"
      ],
      advanced: [
        "How might channel factories improve Lightning's efficiency?",
        "What are the economic incentives for Lightning routing nodes?",
        "How do different Layer 2 architectures handle sovereignty tradeoffs?",
        "What privacy enhancements are possible in second-layer solutions?",
        "How might new cryptographic techniques improve Bitcoin scaling?"
      ]
    },
    security: {
      beginner: [
        "What makes Bitcoin transactions irreversible?",
        "How does the blockchain prevent double-spending?",
        "Why is it important that Bitcoin is decentralized?",
        "What would happen if someone controlled 51% of mining power?",
        "How does cryptography protect your Bitcoin?"
      ],
      intermediate: [
        "How do digital signatures prove ownership without revealing private keys?",
        "What security assumptions does Bitcoin's design rely on?",
        "How do nodes validate transactions and blocks?",
        "What are the different types of attacks on Bitcoin networks?",
        "How does proof-of-work prevent historical revision?"
      ],
      advanced: [
        "How do quantum computers threaten current cryptographic security?",
        "What are the implications of different hash function choices?",
        "How do eclipse attacks work and how can they be prevented?",
        "What game theory concepts apply to Bitcoin's security model?",
        "How do soft forks maintain backward compatibility while upgrading security?"
      ]
    }
  };

  constructor() {
    logger.info('Initializing SocraticTutor with question bank');
  }

  /**
   * Generate Socratic questions for a given topic and difficulty level
   */
  async generateQuestions(
    topic: string, 
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    count: number = 5
  ): Promise<SocraticQuestions> {
    const cacheKey = `socratic_${topic}_${difficultyLevel}_${count}`;
    const cached = cacheStore.get<SocraticQuestions>(cacheKey);
    
    if (cached) {
      logger.info(`Returning cached Socratic questions for ${topic}`);
      return cached;
    }

    try {
      logger.info(`Generating Socratic questions for topic: ${topic}, level: ${difficultyLevel}`);

      const topicQuestions = this.questionBank[topic.toLowerCase()];
      if (!topicQuestions) {
        throw new Error(`Topic '${topic}' not found in question bank. Available topics: ${Object.keys(this.questionBank).join(', ')}`);
      }

      const levelQuestions = topicQuestions[difficultyLevel];
      if (!levelQuestions) {
        throw new Error(`Difficulty level '${difficultyLevel}' not available for topic '${topic}'`);
      }

      // Select random questions up to the requested count
      const selectedQuestions = this.selectRandomQuestions(levelQuestions, count);
      
      const result: SocraticQuestions = {
        topic,
        questions: selectedQuestions,
        difficulty_level: difficultyLevel,
        learning_objectives: this.getLearningObjectives(topic, difficultyLevel)
      };

      // Cache for 30 minutes
      cacheStore.set(cacheKey, result, 30 * 60 * 1000);

      return result;
    } catch (error) {
      logger.error('Failed to generate Socratic questions:', error);
      throw error;
    }
  }

  /**
   * Get all available topics
   */
  getAvailableTopics(): string[] {
    return Object.keys(this.questionBank);
  }

  /**
   * Get questions for multiple topics (useful for comprehensive reviews)
   */
  async generateMixedQuestions(
    topics: string[],
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    questionsPerTopic: number = 2
  ): Promise<SocraticQuestions> {
    const allQuestions: string[] = [];
    const allObjectives: string[] = [];

    for (const topic of topics) {
      const topicResult = await this.generateQuestions(topic, difficultyLevel, questionsPerTopic);
      allQuestions.push(...topicResult.questions);
      allObjectives.push(...topicResult.learning_objectives);
    }

    return {
      topic: topics.join(', '),
      questions: this.shuffleArray(allQuestions),
      difficulty_level: difficultyLevel,
      learning_objectives: [...new Set(allObjectives)] // Remove duplicates
    };
  }

  private selectRandomQuestions(questions: string[], count: number): string[] {
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private getLearningObjectives(topic: string, level: 'beginner' | 'intermediate' | 'advanced'): string[] {
    const objectives: { [key: string]: { [level: string]: string[] } } = {
      fees: {
        beginner: [
          'Understand why transaction fees exist',
          'Recognize the relationship between network demand and fees',
          'Learn basic fee selection strategies'
        ],
        intermediate: [
          'Analyze fee market dynamics',
          'Evaluate different fee estimation methods',
          'Optimize transaction timing and structure'
        ],
        advanced: [
          'Understand complex fee mechanisms (RBF, CPFP)',
          'Analyze economic implications of fee markets',
          'Evaluate scaling solutions impact on fees'
        ]
      },
      mining: {
        beginner: [
          'Understand the role of miners in Bitcoin',
          'Recognize the connection between mining and security',
          'Learn about block rewards and incentives'
        ],
        intermediate: [
          'Analyze mining difficulty and hash rate',
          'Understand mining pool economics',
          'Evaluate mining centralization risks'
        ],
        advanced: [
          'Understand advanced mining concepts',
          'Analyze long-term mining sustainability',
          'Evaluate mining\'s role in energy markets'
        ]
      },
      wallets: {
        beginner: [
          'Understand basic wallet concepts',
          'Learn proper private key management',
          'Recognize different wallet types'
        ],
        intermediate: [
          'Understand advanced wallet features',
          'Learn about wallet security best practices',
          'Evaluate different storage methods'
        ],
        advanced: [
          'Master complex wallet technologies',
          'Understand advanced security schemes',
          'Implement privacy-preserving techniques'
        ]
      },
      scaling: {
        beginner: [
          'Understand Bitcoin\'s scaling challenges',
          'Learn about Layer 2 solutions',
          'Recognize scaling tradeoffs'
        ],
        intermediate: [
          'Understand Lightning Network mechanics',
          'Analyze different scaling approaches',
          'Evaluate scaling solution tradeoffs'
        ],
        advanced: [
          'Master advanced scaling concepts',
          'Understand economic incentives in scaling',
          'Evaluate future scaling technologies'
        ]
      },
      security: {
        beginner: [
          'Understand Bitcoin\'s security model',
          'Learn about cryptographic protection',
          'Recognize decentralization importance'
        ],
        intermediate: [
          'Understand advanced security concepts',
          'Learn about attack vectors and defenses',
          'Analyze network security properties'
        ],
        advanced: [
          'Master cryptographic security concepts',
          'Understand advanced attack scenarios',
          'Evaluate future security challenges'
        ]
      }
    };

    return objectives[topic]?.[level] || [`Learn about ${topic} at ${level} level`];
  }

  /**
   * Legacy method to maintain compatibility with existing code
   */
  async process(args: any): Promise<any> {
    const topic = args?.topic || 'fees';
    const level = args?.level || 'beginner';
    const count = args?.count || 5;

    try {
      const result = await this.generateQuestions(topic, level, count);
      return {
        prompts: result.questions, // For backward compatibility
        ...result,
        status: 'success'
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'Failed to generate questions',
        status: 'error'
      };
    }
  }
}

// Export function for backward compatibility
export async function run_SocraticTutor(topic: string): Promise<{ prompts: string[] }> {
  const tutor = new SocraticTutor();
  const result = await tutor.generateQuestions(topic);
  return { prompts: result.questions };
}