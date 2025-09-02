import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { SocraticTutor } from './SocraticTutor.js';
import { btc_price } from '../tools/btc_price.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario' | 'calculation' | 'reflection';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  question: string;
  options?: string[];
  correct_answer?: string | number | boolean;
  explanation: string;
  points: number;
  time_limit_seconds?: number;
  hints?: string[];
  live_data_context?: any;
}

export interface AssessmentRubric {
  criteria: string;
  points_possible: number;
  performance_levels: {
    excellent: { points: number; description: string; };
    good: { points: number; description: string; };
    satisfactory: { points: number; description: string; };
    needs_improvement: { points: number; description: string; };
  };
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: AssessmentQuestion[];
  total_points: number;
  time_limit_minutes: number;
  passing_score_percentage: number;
  rubrics?: AssessmentRubric[];
  feedback_templates: {
    excellent: string;
    good: string;
    satisfactory: string;
    needs_improvement: string;
  };
}

export interface QuizGenerator {
  generateQuestions(topic: string, difficulty: string, count: number, questionTypes?: string[]): Promise<AssessmentQuestion[]>;
  generateAssessment(config: AssessmentConfig): Promise<Assessment>;
  generateScenarioQuestions(topic: string, difficulty: string, count: number): Promise<AssessmentQuestion[]>;
  generateCalculationQuestions(topic: string, difficulty: string, count: number): Promise<AssessmentQuestion[]>;
}

export interface AssessmentConfig {
  title: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question_count: number;
  question_types?: ('multiple_choice' | 'true_false' | 'short_answer' | 'scenario' | 'calculation' | 'reflection')[];
  time_limit_minutes?: number;
  passing_score?: number;
  include_live_data?: boolean;
}

export class AssessmentGenerator implements QuizGenerator {
  private socraticTutor: SocraticTutor;
  
  private scenarioTemplates = {
    'fees': {
      beginner: [
        'You want to buy coffee with Bitcoin. The coffee costs $5 and the current Bitcoin price is {price}. How much Bitcoin would you need?',
        'Your friend says Bitcoin is "just internet money." How would you explain what makes Bitcoin different from regular digital payments?',
        'You see Bitcoin\'s price went down 10% today. Your friend is panicking. What would you tell them?'
      ],
      intermediate: [
        'You need to send Bitcoin to a friend urgently, but the mempool is congested. The fee estimates are: Fast: {fast_fee} sat/vB, Medium: {medium_fee} sat/vB. Your transaction is 250 bytes. Calculate the fees and explain your choice.',
        'A merchant offers a 2% discount for Bitcoin payments due to lower fees. Your purchase is $1000. Current Bitcoin price is {price}. Is this a good deal?',
        'You\'re explaining Bitcoin to your grandmother. She asks "Who controls Bitcoin?" How do you explain decentralization in simple terms?'
      ],
      advanced: [
        'Lightning Network vs on-chain: You need to make 50 small payments of $10 each over the next month. Current on-chain fee is {fast_fee} sat/vB for 250-byte transactions. When would Lightning make sense?',
        'A country announces Bitcoin as legal tender. Analyze the potential impacts on: adoption, price volatility, and local economy.',
        'You\'re setting up a Bitcoin treasury strategy for a company. Bitcoin is at {price}. What factors would you consider for position sizing?'
      ]
    },
    'mining': {
      beginner: [
        'You want to send Bitcoin to your friend. Current fees are {fast_fee} sat/vB for fast confirmation. Your transaction is 250 bytes. How much will you pay in fees?',
        'Bitcoin fees are higher during weekdays. When might be the best time to make a non-urgent transaction?',
        'You accidentally set a very low fee. Your transaction has been pending for 2 hours. What are your options?'
      ],
      intermediate: [
        'Mempool is congested with 100MB of transactions. Current fee rates: Fast: {fast_fee}, Medium: {medium_fee}, Slow: {slow_fee} sat/vB. You need confirmation within 3 blocks. What strategy would you use?',
        'You\'re batching 10 payments. Individual transactions would cost {fast_fee} sat/vB each (250 bytes). A batch transaction is 800 bytes. Calculate the savings.',
        'Replace-by-Fee (RBF): Your 5 sat/vB transaction is stuck. New recommended fee is 15 sat/vB. How much extra will you pay?'
      ],
      advanced: [
        'Child-Pays-for-Parent: Your incoming transaction with 2 sat/vB fee is stuck. You need those funds urgently. Current fast fee is {fast_fee} sat/vB. Design a CPFP strategy.',
        'Fee market analysis: 1-week average fee was 5 sat/vB, yesterday was 50 sat/vB. Current mempool size is trending down. What does this suggest about optimal timing?',
        'You\'re building a Bitcoin service. Design a fee estimation algorithm that balances user experience with cost efficiency.'
      ]
    }
  };

  private calculationTemplates = {
    'fees': {
      beginner: [
        'Calculate the fee for a transaction: Size = {size} bytes, Fee rate = {rate} sat/vB',
        'Convert satoshis to Bitcoin: {satoshis} satoshis = ? BTC',
        'Fee in USD: Transaction fee is {fee_btc} BTC, Bitcoin price is {price} USD'
      ],
      intermediate: [
        'Batch transaction savings: 5 individual transactions (250 bytes each) vs 1 batch (800 bytes), Fee rate = {rate} sat/vB',
        'RBF fee calculation: Original fee {original_fee} sat/vB, new fee {new_fee} sat/vB, transaction size {size} bytes',
        'Percentage of transaction value: Sending {amount} BTC, fee is {fee} BTC, what percentage?'
      ],
      advanced: [
        'CPFP effective fee rate: Parent transaction 200 bytes at 2 sat/vB, child needs 300 bytes to achieve 20 sat/vB overall',
        'Fee optimization: 10 outputs to consolidate, each UTXO costs 148 bytes to spend, current fee {rate} sat/vB vs future fee {future_rate} sat/vB',
        'Lightning vs on-chain cost analysis: 20 payments of 0.001 BTC each, on-chain fee {fee} BTC per tx, Lightning channel costs'
      ]
    },
    'mining': {
      beginner: [
        'Convert Bitcoin to USD: {btc_amount} BTC at current price {price} USD',
        'Bitcoin supply calculation: Current year is 2024, blocks mined = {blocks}, reward per block = 6.25 BTC',
        'Transaction confirmation: Block time is 10 minutes, how long for 6 confirmations?'
      ],
      intermediate: [
        'Market cap calculation: Bitcoin price {price} USD, total supply ~19.5M BTC',
        'Hash rate and security: If hash rate doubles, how does this affect mining difficulty?',
        'Volatility calculation: Bitcoin was {price1} yesterday, {price2} today. Calculate percentage change'
      ]
    }
  };

  constructor() {
    this.socraticTutor = new SocraticTutor();
    logger.info('AssessmentGenerator initialized with question banks for multiple topics');
  }

  /**
   * Generate questions for an assessment
   */
  async generateQuestions(
    topic: string, 
    difficulty: string, 
    count: number, 
    questionTypes: string[] = ['multiple_choice', 'true_false', 'scenario']
  ): Promise<AssessmentQuestion[]> {
    const questions: AssessmentQuestion[] = [];
    const questionsPerType = Math.ceil(count / questionTypes.length);

    for (const type of questionTypes) {
      let typeQuestions: AssessmentQuestion[] = [];

      switch (type) {
        case 'multiple_choice':
        case 'true_false':
        case 'short_answer':
          const socraticQuestionsResult = await this.socraticTutor.generateQuestions(
            topic, 
            difficulty as any, 
            questionsPerType
          );
          typeQuestions = socraticQuestionsResult.questions.map((q, index) => this.convertToAssessmentQuestion(q, type, topic, difficulty, index));
          break;
        
        case 'scenario':
          typeQuestions = await this.generateScenarioQuestions(topic, difficulty, questionsPerType);
          break;
          
        case 'calculation':
          typeQuestions = await this.generateCalculationQuestions(topic, difficulty, questionsPerType);
          break;
          
        case 'reflection':
          typeQuestions = await this.generateReflectionQuestions(topic, difficulty, questionsPerType);
          break;
      }

      questions.push(...typeQuestions.slice(0, questionsPerType));
    }

    return questions.slice(0, count);
  }

  /**
   * Generate a complete assessment
   */
  async generateAssessment(config: AssessmentConfig): Promise<Assessment> {
    const cacheKey = `assessment_${config.topic}_${config.difficulty}_${config.question_count}`;
    const cached = cacheStore.get(cacheKey);
    if (cached) return cached;

    try {
      logger.info(`Generating assessment: ${config.title} (${config.topic}, ${config.difficulty})`);

      const questions = await this.generateQuestions(
        config.topic, 
        config.difficulty, 
        config.question_count,
        config.question_types
      );

      const assessment: Assessment = {
        id: `${config.topic}-${config.difficulty}-${Date.now()}`,
        title: config.title,
        description: this.generateAssessmentDescription(config),
        topic: config.topic,
        difficulty: config.difficulty,
        questions,
        total_points: questions.reduce((sum, q) => sum + q.points, 0),
        time_limit_minutes: config.time_limit_minutes || this.calculateTimeLimit(questions),
        passing_score_percentage: config.passing_score || this.getDefaultPassingScore(config.difficulty),
        feedback_templates: this.generateFeedbackTemplates(config.topic, config.difficulty)
      };

      // Add rubrics for advanced assessments
      if (config.difficulty === 'advanced') {
        assessment.rubrics = this.generateRubrics(config.topic);
      }

      cacheStore.set(cacheKey, assessment, 30 * 60 * 1000); // Cache for 30 minutes
      logger.info(`Assessment generated: ${questions.length} questions, ${assessment.total_points} points`);
      
      return assessment;
    } catch (error) {
      logger.error(`Failed to generate assessment for ${config.topic}:`, error);
      throw error;
    }
  }

  /**
   * Generate scenario-based questions with live data
   */
  async generateScenarioQuestions(topic: string, difficulty: string, count: number): Promise<AssessmentQuestion[]> {
    const templates = this.scenarioTemplates[topic as keyof typeof this.scenarioTemplates];
    if (!templates || !templates[difficulty as keyof typeof templates]) {
      return [];
    }

    // Get live Bitcoin data
    const [priceData, feeData] = await Promise.all([
      btc_price().catch(() => ({ usd: 50000 })),
      getFeeEstimates().catch(() => ({ fastestFee: 10, halfHourFee: 5, economyFee: 2, hourFee: 3, minimumFee: 1, timestamp: Date.now() }))
    ]);

    const scenarioTemplates = templates[difficulty as keyof typeof templates];
    const questions: AssessmentQuestion[] = [];

    for (let i = 0; i < Math.min(count, scenarioTemplates.length); i++) {
      const template = scenarioTemplates[i];
      const scenarioText = template
        .replace('{price}', `$${priceData.usd.toLocaleString()}`)
        .replace('{fast_fee}', feeData.fastestFee?.toString() || '10')
        .replace('{medium_fee}', feeData.halfHourFee?.toString() || '5')
        .replace('{slow_fee}', feeData.economyFee?.toString() || '2');

      questions.push({
        id: `scenario_${topic}_${difficulty}_${i + 1}`,
        type: 'scenario',
        difficulty: difficulty as any,
        topic,
        question: scenarioText,
        correct_answer: 'Open-ended scenario analysis',
        explanation: this.generateScenarioExplanation(topic, difficulty, i),
        points: this.getPointsForDifficulty(difficulty, 'scenario'),
        time_limit_seconds: 300, // 5 minutes for scenarios
        live_data_context: {
          btc_price_usd: priceData.usd,
          fee_estimates: feeData,
          generated_at: new Date().toISOString()
        }
      });
    }

    return questions;
  }

  /**
   * Generate calculation questions with current market data
   */
  async generateCalculationQuestions(topic: string, difficulty: string, count: number): Promise<AssessmentQuestion[]> {
    const templates = this.calculationTemplates[topic as keyof typeof this.calculationTemplates];
    if (!templates || !templates[difficulty as keyof typeof templates]) {
      return [];
    }

    // Get live data
    const [priceData, feeData] = await Promise.all([
      btc_price().catch(() => ({ usd: 50000 })),
      getFeeEstimates().catch(() => ({ fastestFee: 10, halfHourFee: 5, economyFee: 2, hourFee: 3, minimumFee: 1, timestamp: Date.now() }))
    ]);

    const calcTemplates = templates[difficulty as keyof typeof templates];
    const questions: AssessmentQuestion[] = [];

    for (let i = 0; i < Math.min(count, calcTemplates.length); i++) {
      const template = calcTemplates[i];
      const { question, answer, explanation } = this.generateCalculationProblem(
        template, priceData, feeData, difficulty, i
      );

      questions.push({
        id: `calculation_${topic}_${difficulty}_${i + 1}`,
        type: 'calculation',
        difficulty: difficulty as any,
        topic,
        question,
        correct_answer: answer,
        explanation,
        points: this.getPointsForDifficulty(difficulty, 'calculation'),
        time_limit_seconds: difficulty === 'advanced' ? 180 : 120,
        hints: this.generateCalculationHints(template, difficulty),
        live_data_context: {
          btc_price_usd: priceData.usd,
          fee_estimates: feeData,
          generated_at: new Date().toISOString()
        }
      });
    }

    return questions;
  }

  /**
   * Generate reflection questions for deeper learning
   */
  private async generateReflectionQuestions(topic: string, difficulty: string, count: number): Promise<AssessmentQuestion[]> {
    const reflectionPrompts = {
      'fees': [
        'Describe a situation where paying higher fees would be worth it, and one where it wouldn\'t.',
        'How do transaction fees contribute to Bitcoin\'s security model?',
        'What trade-offs exist between transaction cost, speed, and decentralization?',
        'Reflect on how Bitcoin might change the global financial system in the next 10 years.',
        'What are the most important trade-offs someone should consider before using Bitcoin?'
      ],
      'mining': [
        'Analyze the environmental concerns around Bitcoin mining and potential solutions.',
        'How does mining contribute to Bitcoin\'s decentralization and security?',
        'What role should renewable energy play in Bitcoin mining\'s future?'
      ]
    };

    const prompts = reflectionPrompts[topic as keyof typeof reflectionPrompts] || [];
    const questions: AssessmentQuestion[] = [];

    for (let i = 0; i < Math.min(count, prompts.length); i++) {
      questions.push({
        id: `reflection_${topic}_${difficulty}_${i + 1}`,
        type: 'reflection',
        difficulty: difficulty as any,
        topic,
        question: prompts[i],
        explanation: 'Reflection questions are assessed based on depth of analysis, critical thinking, and understanding of key concepts.',
        points: this.getPointsForDifficulty(difficulty, 'reflection'),
        time_limit_seconds: 600 // 10 minutes for reflection
      });
    }

    return questions;
  }

  // Helper methods
  private convertToAssessmentQuestion(
    socraticQuestion: any, 
    type: string, 
    topic: string, 
    difficulty: string, 
    index: number
  ): AssessmentQuestion {
    const baseQuestion: AssessmentQuestion = {
      id: `${type}_${topic}_${difficulty}_${index + 1}`,
      type: type as any,
      difficulty: difficulty as any,
      topic,
      question: socraticQuestion.question || socraticQuestion,
      explanation: socraticQuestion.explanation || `This question tests understanding of ${topic} concepts.`,
      points: this.getPointsForDifficulty(difficulty, type)
    };

    if (type === 'multiple_choice') {
      baseQuestion.options = this.generateMultipleChoiceOptions(socraticQuestion.question || socraticQuestion, topic, difficulty);
      baseQuestion.correct_answer = 0; // First option is correct
    } else if (type === 'true_false') {
      baseQuestion.options = ['True', 'False'];
      baseQuestion.correct_answer = Math.random() > 0.5 ? 0 : 1;
    }

    return baseQuestion;
  }

  private generateMultipleChoiceOptions(question: string, topic: string, difficulty: string): string[] {
    // This is a simplified implementation - in a real system, you'd have more sophisticated option generation
    const genericOptions = [
      'This is the correct answer based on Bitcoin fundamentals',
      'This is a common misconception about Bitcoin',
      'This answer confuses Bitcoin with traditional banking',
      'This answer is technically incorrect about the protocol'
    ];

    return genericOptions;
  }

  private generateCalculationProblem(
    template: string, 
    priceData: any, 
    feeData: any, 
    difficulty: string, 
    index: number
  ): { question: string; answer: string; explanation: string } {
    // Generate actual calculation problems with real numbers
    const size = 250;
    const rate = feeData.fast || 10;
    const satoshis = 100000;
    const btcAmount = 0.001;

    const filledTemplate = template
      .replace('{size}', size.toString())
      .replace('{rate}', rate.toString())
      .replace('{satoshis}', satoshis.toString())
      .replace('{price}', priceData.usd.toString())
      .replace('{fee_btc}', '0.00001')
      .replace('{amount}', '0.01');

    // Calculate the answer based on the template type
    let answer = '';
    let explanation = '';

    if (template.includes('Size = {size} bytes, Fee rate = {rate} sat/vB')) {
      answer = (size * rate).toString() + ' satoshis';
      explanation = `Fee = Size × Fee Rate = ${size} bytes × ${rate} sat/vB = ${size * rate} satoshis`;
    } else if (template.includes('Convert satoshis to Bitcoin')) {
      answer = (satoshis / 100000000).toString() + ' BTC';
      explanation = `${satoshis} satoshis ÷ 100,000,000 = ${satoshis / 100000000} BTC`;
    } else {
      answer = 'See explanation for detailed calculation';
      explanation = 'This calculation requires multiple steps based on current market conditions.';
    }

    return { question: filledTemplate, answer, explanation };
  }

  private generateCalculationHints(template: string, difficulty: string): string[] {
    if (difficulty === 'beginner') {
      return [
        'Remember: 1 Bitcoin = 100,000,000 satoshis',
        'Transaction fee = Size in bytes × Fee rate in sat/vB',
        'Use current market prices for USD conversions'
      ];
    } else if (difficulty === 'intermediate') {
      return [
        'Consider both the mathematical calculation and practical implications',
        'Think about how network congestion affects fee rates',
        'Remember to account for all inputs and outputs'
      ];
    }
    return [
      'Consider the broader economic and technical context',
      'Think about optimization strategies and trade-offs',
      'Analyze both short-term and long-term implications'
    ];
  }

  private getPointsForDifficulty(difficulty: string, type: string): number {
    const basePoints = {
      beginner: 2,
      intermediate: 3,
      advanced: 5
    };

    const typeMultiplier = {
      multiple_choice: 1,
      true_false: 0.5,
      short_answer: 1.5,
      scenario: 2,
      calculation: 2,
      reflection: 3
    };

    return Math.round(
      (basePoints[difficulty as keyof typeof basePoints] || 2) * 
      (typeMultiplier[type as keyof typeof typeMultiplier] || 1)
    );
  }

  private calculateTimeLimit(questions: AssessmentQuestion[]): number {
    return questions.reduce((total, q) => {
      const timePerPoint = 2; // 2 minutes per point
      return total + (q.points * timePerPoint);
    }, 0);
  }

  private getDefaultPassingScore(difficulty: string): number {
    return {
      beginner: 70,
      intermediate: 75,
      advanced: 80
    }[difficulty] || 70;
  }

  private generateAssessmentDescription(config: AssessmentConfig): string {
    return `${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)} level assessment covering ${config.topic} with ${config.question_count} questions. Tests practical understanding and application of Bitcoin concepts.`;
  }

  private generateFeedbackTemplates(topic: string, difficulty: string): Assessment['feedback_templates'] {
    return {
      excellent: `Excellent work! You demonstrate a strong understanding of ${topic} concepts and can apply them effectively in real-world scenarios.`,
      good: `Good job! You have a solid grasp of ${topic} fundamentals with room to deepen your practical application skills.`,
      satisfactory: `Satisfactory performance. You understand basic ${topic} concepts but should focus on improving practical application and analysis.`,
      needs_improvement: `More study needed. Review the ${topic} materials and practice applying concepts to real-world Bitcoin scenarios.`
    };
  }

  private generateRubrics(topic: string): AssessmentRubric[] {
    return [
      {
        criteria: 'Technical Understanding',
        points_possible: 25,
        performance_levels: {
          excellent: { points: 25, description: 'Demonstrates deep technical understanding with accurate use of terminology' },
          good: { points: 20, description: 'Shows solid technical knowledge with minor gaps' },
          satisfactory: { points: 15, description: 'Basic technical understanding with some misconceptions' },
          needs_improvement: { points: 10, description: 'Limited technical understanding, significant gaps' }
        }
      },
      {
        criteria: 'Practical Application',
        points_possible: 25,
        performance_levels: {
          excellent: { points: 25, description: 'Can effectively apply concepts to real-world scenarios' },
          good: { points: 20, description: 'Good practical application with minor issues' },
          satisfactory: { points: 15, description: 'Basic application skills, needs development' },
          needs_improvement: { points: 10, description: 'Difficulty applying concepts practically' }
        }
      }
    ];
  }

  private generateScenarioExplanation(topic: string, difficulty: string, index: number): string {
    const explanations = {
      'fees': {
        beginner: [
          'This scenario tests basic Bitcoin calculation and value understanding.',
          'Focus on explaining Bitcoin\'s unique properties clearly and simply.',
          'Consider both the emotional and rational aspects of Bitcoin volatility.',
          'Calculate: fee = transaction size × fee rate. Consider confirmation time needs.',
          'Lower network usage typically occurs on weekends and late nights.',
          'Options include: wait, use RBF (Replace-by-Fee), or CPFP (Child-Pays-for-Parent).'
        ]
      },
      'mining': {
        beginner: [
          'Calculate: fee = transaction size × fee rate. Consider confirmation time needs.',
          'Lower network usage typically occurs on weekends and late nights.',
          'Options include: wait, use RBF (Replace-by-Fee), or CPFP (Child-Pays-for-Parent).'
        ]
      }
    };

    const topicExplanations = explanations[topic as keyof typeof explanations];
    if (topicExplanations && typeof topicExplanations === 'object') {
      const difficultyExplanations = (topicExplanations as any)[difficulty];
      if (Array.isArray(difficultyExplanations) && difficultyExplanations[index]) {
        return difficultyExplanations[index];
      }
    }
    return 'Analyze this scenario considering technical, economic, and practical factors.';
  }
}