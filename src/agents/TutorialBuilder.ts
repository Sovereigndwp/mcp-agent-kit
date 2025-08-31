import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { btc_price } from '../tools/btc_price.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { SocraticTutor } from './SocraticTutor.js';
import { sentimentAnalysisTool } from '../tools/sentiment_analysis.js';
import { run_CanvaDesignCoach } from './CanvaDesignCoach.js';

export interface LessonObjective {
  id: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
}

export interface LessonContent {
  type: 'explanation' | 'example' | 'analogy' | 'exercise' | 'reflection';
  title: string;
  content: string;
  media_suggestions: string[];
  interaction_prompts?: string[];
}

export interface LessonAssessment {
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario' | 'reflection';
  question: string;
  options?: string[];
  correct_answer?: string | number;
  explanation: string;
  points: number;
}

export interface TutorialLesson {
  id: string;
  title: string;
  description: string;
  objectives: LessonObjective[];
  prerequisites: string[];
  content_blocks: LessonContent[];
  assessments: LessonAssessment[];
  live_data_integration: any[];
  estimated_duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface TutorialModule {
  id: string;
  title: string;
  description: string;
  lessons: TutorialLesson[];
  total_duration_minutes: number;
  learning_path: string[];
  completion_criteria: string[];
}

export interface GeneratedTutorial {
  module: TutorialModule;
  design_materials: {
    canva_brief: string;
    canva_csv: string;
  };
  web_content: {
    html: string;
    interactive_elements: any[];
  };
  assessment_bank: LessonAssessment[];
}

export class TutorialBuilder {
  private socraticTutor: SocraticTutor;
  
  private topicTemplates = {
    'bitcoin-basics': {
      lessons: [
        'What is Bitcoin?',
        'Why Bitcoin Matters',
        'How Bitcoin Works',
        'Getting Started with Bitcoin'
      ],
      prerequisites: [],
      difficulty: 'beginner' as const,
      duration_per_lesson: 15
    },
    'transaction-fees': {
      lessons: [
        'Understanding Transaction Fees',
        'Fee Market Dynamics',
        'Optimizing Your Fees',
        'Advanced Fee Strategies'
      ],
      prerequisites: ['bitcoin-basics'],
      difficulty: 'intermediate' as const,
      duration_per_lesson: 20
    },
    'mining': {
      lessons: [
        'What is Bitcoin Mining?',
        'Mining Hardware and Economics',
        'Mining Pools and Decentralization',
        'Environmental Considerations'
      ],
      prerequisites: ['bitcoin-basics'],
      difficulty: 'intermediate' as const,
      duration_per_lesson: 25
    },
    'lightning-network': {
      lessons: [
        'Scaling Bitcoin: The Problem',
        'Introduction to Lightning Network',
        'Setting up Lightning',
        'Advanced Lightning Concepts'
      ],
      prerequisites: ['bitcoin-basics', 'transaction-fees'],
      difficulty: 'advanced' as const,
      duration_per_lesson: 30
    },
    'security-privacy': {
      lessons: [
        'Bitcoin Security Fundamentals',
        'Wallet Security Best Practices',
        'Privacy Considerations',
        'Advanced Security Techniques'
      ],
      prerequisites: ['bitcoin-basics'],
      difficulty: 'intermediate' as const,
      duration_per_lesson: 25
    }
  };

  constructor() {
    this.socraticTutor = new SocraticTutor();
    logger.info('TutorialBuilder initialized with templates for 5 topic areas');
  }

  /**
   * Generate a complete tutorial module from a topic
   */
  async buildTutorial(
    topicId: string, 
    customizations?: {
      target_audience?: 'students' | 'professionals' | 'general';
      format?: 'workshop' | 'self_study' | 'presentation';
      time_constraint?: number; // minutes
      include_live_data?: boolean;
    }
  ): Promise<GeneratedTutorial> {
    const cacheKey = `tutorial_${topicId}_${JSON.stringify(customizations)}`;
    const cached = cacheStore.get<GeneratedTutorial>(cacheKey);
    
    if (cached) {
      logger.info(`Returning cached tutorial for ${topicId}`);
      return cached;
    }

    try {
      logger.info(`Building tutorial for topic: ${topicId}`);
      
      const template = this.topicTemplates[topicId as keyof typeof this.topicTemplates];
      if (!template) {
        throw new Error(`Unknown topic: ${topicId}. Available: ${Object.keys(this.topicTemplates).join(', ')}`);
      }

      // Generate lessons
      const lessons = await Promise.all(
        template.lessons.map((lessonTitle, index) => 
          this.generateLesson(
            lessonTitle,
            template.difficulty,
            template.duration_per_lesson,
            customizations,
            index
          )
        )
      );

      // Create module
      const module: TutorialModule = {
        id: `${topicId}-${Date.now()}`,
        title: this.formatTopicTitle(topicId),
        description: this.generateModuleDescription(topicId, template),
        lessons,
        total_duration_minutes: lessons.reduce((sum, lesson) => sum + lesson.estimated_duration_minutes, 0),
        learning_path: template.lessons,
        completion_criteria: this.generateCompletionCriteria(lessons)
      };

      // Generate design materials
      const moduleContent = this.convertModuleToText(module);
      const designMaterials = await run_CanvaDesignCoach(module.title, moduleContent);

      // Generate web content
      const webContent = await this.generateWebContent(module);

      // Compile all assessments
      const assessmentBank = lessons.flatMap(lesson => lesson.assessments);

      const tutorial: GeneratedTutorial = {
        module,
        design_materials: {
          canva_brief: designMaterials.briefMd,
          canva_csv: designMaterials.bulkCsv
        },
        web_content: webContent,
        assessment_bank: assessmentBank
      };

      // Cache for 2 hours
      cacheStore.set(cacheKey, tutorial, 2 * 60 * 60 * 1000);

      logger.info(`Tutorial built successfully: ${lessons.length} lessons, ${assessmentBank.length} assessments`);
      return tutorial;

    } catch (error) {
      logger.error(`Failed to build tutorial for ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a single lesson with comprehensive content
   */
  private async generateLesson(
    title: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    baseDuration: number,
    customizations?: any,
    lessonIndex: number = 0
  ): Promise<TutorialLesson> {
    
    const lessonId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Generate learning objectives
    const objectives = await this.generateLearningObjectives(title, difficulty);
    
    // Generate content blocks
    const contentBlocks = await this.generateContentBlocks(title, difficulty, customizations);
    
    // Generate assessments
    const assessments = await this.generateAssessments(title, difficulty);
    
    // Add live data integration if requested
    const liveDataIntegration = customizations?.include_live_data 
      ? await this.generateLiveDataIntegration(title)
      : [];

    const lesson: TutorialLesson = {
      id: lessonId,
      title,
      description: `Comprehensive lesson covering ${title.toLowerCase()} with interactive elements and real-world examples.`,
      objectives,
      prerequisites: lessonIndex > 0 ? [this.getPreviousLessonId(lessonIndex)] : [],
      content_blocks: contentBlocks,
      assessments,
      live_data_integration: liveDataIntegration,
      estimated_duration_minutes: this.calculateLessonDuration(contentBlocks, assessments, baseDuration),
      difficulty_level: difficulty
    };

    return lesson;
  }

  private async generateLearningObjectives(
    title: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<LessonObjective[]> {
    const objectives: LessonObjective[] = [];
    
    // Generate topic-specific objectives
    if (title.toLowerCase().includes('fee')) {
      objectives.push({
        id: 'understand-fees',
        description: 'Understand why Bitcoin transactions require fees',
        difficulty,
        estimated_time_minutes: 5
      });
      
      if (difficulty !== 'beginner') {
        objectives.push({
          id: 'optimize-fees',
          description: 'Learn strategies to optimize transaction fees',
          difficulty,
          estimated_time_minutes: 10
        });
      }
    } else if (title.toLowerCase().includes('mining')) {
      objectives.push({
        id: 'understand-mining',
        description: 'Understand the role of mining in Bitcoin',
        difficulty,
        estimated_time_minutes: 8
      });
    } else if (title.toLowerCase().includes('security')) {
      objectives.push({
        id: 'security-practices',
        description: 'Learn essential Bitcoin security practices',
        difficulty,
        estimated_time_minutes: 7
      });
    } else {
      // Generic Bitcoin objectives
      objectives.push({
        id: 'core-concepts',
        description: `Master core concepts of ${title.toLowerCase()}`,
        difficulty,
        estimated_time_minutes: 6
      });
    }

    return objectives;
  }

  private async generateContentBlocks(
    title: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    customizations?: any
  ): Promise<LessonContent[]> {
    const blocks: LessonContent[] = [];

    // Opening explanation
    blocks.push({
      type: 'explanation',
      title: `Introduction to ${title}`,
      content: await this.generateExplanationContent(title, difficulty),
      media_suggestions: ['infographic', 'animated diagram'],
      interaction_prompts: await this.generateInteractionPrompts(title, 'introduction')
    });

    // Real-world analogy
    blocks.push({
      type: 'analogy',
      title: 'Understanding Through Analogy',
      content: await this.generateAnalogyContent(title, difficulty),
      media_suggestions: ['illustration', 'comparison chart'],
      interaction_prompts: ['Can you think of another analogy that explains this concept?']
    });

    // Practical example
    blocks.push({
      type: 'example',
      title: 'Real-World Example',
      content: await this.generateExampleContent(title, difficulty),
      media_suggestions: ['screenshot', 'step-by-step visual'],
      interaction_prompts: await this.generateInteractionPrompts(title, 'example')
    });

    // Interactive exercise
    blocks.push({
      type: 'exercise',
      title: 'Practice Exercise',
      content: await this.generateExerciseContent(title, difficulty),
      media_suggestions: ['interactive simulator', 'guided walkthrough'],
      interaction_prompts: await this.generateInteractionPrompts(title, 'exercise')
    });

    // Reflection
    if (difficulty !== 'beginner') {
      blocks.push({
        type: 'reflection',
        title: 'Critical Thinking',
        content: await this.generateReflectionContent(title, difficulty),
        media_suggestions: ['thought bubble graphic'],
        interaction_prompts: await this.generateInteractionPrompts(title, 'reflection')
      });
    }

    return blocks;
  }

  private async generateAssessments(
    title: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<LessonAssessment[]> {
    const assessments: LessonAssessment[] = [];

    // Multiple choice question
    assessments.push(await this.generateMultipleChoiceAssessment(title, difficulty));
    
    // True/false question
    assessments.push(await this.generateTrueFalseAssessment(title, difficulty));
    
    // Scenario-based question for intermediate/advanced
    if (difficulty !== 'beginner') {
      assessments.push(await this.generateScenarioAssessment(title, difficulty));
    }

    return assessments;
  }

  private async generateLiveDataIntegration(title: string): Promise<any[]> {
    const integrations = [];

    try {
      if (title.toLowerCase().includes('fee') || title.toLowerCase().includes('transaction')) {
        const fees = await getFeeEstimates();
        integrations.push({
          type: 'live_fees',
          data: fees,
          display_text: `Current network fees: Fast ${fees.fastestFee}, Standard ${fees.hourFee} sat/vB`
        });
      }

      if (title.toLowerCase().includes('price') || title.toLowerCase().includes('market')) {
        const price = await btc_price();
        integrations.push({
          type: 'live_price',
          data: price,
          display_text: `Current Bitcoin price: $${price.usd.toLocaleString()} USD`
        });
      }

      return integrations;
    } catch (error) {
      logger.warn('Failed to fetch live data for tutorial integration:', error);
      return [];
    }
  }

  // Content generation helpers
  private async generateExplanationContent(title: string, difficulty: string): Promise<string> {
    const baseContent = {
      'What is Bitcoin?': {
        beginner: 'Bitcoin is digital money that works without banks. Think of it as digital cash that you can send to anyone in the world instantly.',
        intermediate: 'Bitcoin is a decentralized digital currency that operates on a peer-to-peer network, enabling direct value transfer without intermediaries.',
        advanced: 'Bitcoin represents a breakthrough in distributed systems, combining cryptographic proofs with economic incentives to create a trustless monetary system.'
      },
      'Understanding Transaction Fees': {
        beginner: 'Transaction fees are small payments you make to send Bitcoin. Like stamps on letters, they help your transaction get processed.',
        intermediate: 'Transaction fees serve as an incentive mechanism for miners while creating a market for block space in Bitcoin\'s limited throughput system.',
        advanced: 'The fee market represents a critical economic mechanism that balances network security, decentralization, and scalability through dynamic pricing of scarce block space.'
      }
    };

    const content = baseContent[title as keyof typeof baseContent];
    return content?.[difficulty as keyof typeof content] || 
           `This lesson covers ${title.toLowerCase()} with detailed explanations and practical insights tailored for ${difficulty} learners.`;
  }

  private async generateAnalogyContent(title: string, difficulty: string): Promise<string> {
    const analogies = {
      'What is Bitcoin?': 'Bitcoin is like digital gold that you can send through email. Just as gold is valuable because it\'s scarce and useful, Bitcoin is valuable because there will only ever be 21 million coins.',
      'Understanding Transaction Fees': 'Bitcoin fees are like express mail pricing. When the post office is busy, you pay more for faster delivery. When Bitcoin\'s network is busy, you pay higher fees for faster confirmation.',
      'Mining': 'Bitcoin mining is like a global lottery where thousands of computers compete to solve a puzzle. The winner gets to add the next page (block) to Bitcoin\'s record book (blockchain) and receives new Bitcoin as a reward.'
    };

    return analogies[title as keyof typeof analogies] || 
           `Imagine ${title.toLowerCase()} as a familiar concept from everyday life to better understand how it works in Bitcoin.`;
  }

  private async generateExampleContent(title: string, difficulty: string): Promise<string> {
    // Generate practical, real-world examples
    if (title.includes('Fee')) {
      return 'Example: Sarah wants to send $50 worth of Bitcoin to her friend. She can choose: Fast delivery (2 sat/vB, ~$0.34 fee) for urgent payments, or Standard delivery (1 sat/vB, ~$0.17 fee) for regular transfers.';
    }
    return `Practical example demonstrating ${title.toLowerCase()} in real-world scenarios with current market conditions.`;
  }

  private async generateExerciseContent(title: string, difficulty: string): Promise<string> {
    const exercises = {
      beginner: `Interactive exercise: Practice ${title.toLowerCase()} with guided steps and immediate feedback.`,
      intermediate: `Hands-on challenge: Apply ${title.toLowerCase()} concepts to solve realistic scenarios.`,
      advanced: `Advanced simulation: Navigate complex ${title.toLowerCase()} situations with multiple variables.`
    };

    return exercises[difficulty as keyof typeof exercises];
  }

  private async generateReflectionContent(title: string, difficulty: string): Promise<string> {
    return `Reflection: How does ${title.toLowerCase()} impact Bitcoin's broader ecosystem? Consider the tradeoffs and implications for users, miners, and the network as a whole.`;
  }

  private async generateInteractionPrompts(title: string, type: string): Promise<string[]> {
    const prompts: string[] = [];
    
    if (type === 'introduction') {
      prompts.push(`What do you already know about ${title.toLowerCase()}?`);
      prompts.push('What questions do you hope this lesson will answer?');
    } else if (type === 'example') {
      prompts.push('How would you explain this example to a friend?');
      prompts.push('What other scenarios can you think of?');
    } else if (type === 'exercise') {
      prompts.push('What did you learn from this exercise?');
      prompts.push('What was most challenging about this task?');
    } else if (type === 'reflection') {
      prompts.push('How does this concept relate to what you learned earlier?');
      prompts.push('What are the broader implications of this topic?');
    }

    return prompts;
  }

  private async generateMultipleChoiceAssessment(title: string, difficulty: string): Promise<LessonAssessment> {
    // Generate contextual multiple choice questions
    if (title.includes('Fee')) {
      return {
        type: 'multiple_choice',
        question: 'What happens to Bitcoin transaction fees when network demand is high?',
        options: [
          'Fees decrease to encourage more transactions',
          'Fees increase due to competition for block space',
          'Fees stay the same regardless of demand',
          'Fees are eliminated during busy periods'
        ],
        correct_answer: 1,
        explanation: 'When network demand is high, users compete for limited block space by offering higher fees, driving up the overall fee market.',
        points: 10
      };
    }

    return {
      type: 'multiple_choice',
      question: `Which statement best describes ${title.toLowerCase()}?`,
      options: [
        'Option A - Basic explanation',
        'Option B - Correct comprehensive answer',
        'Option C - Common misconception',
        'Option D - Partially correct but incomplete'
      ],
      correct_answer: 1,
      explanation: `The correct answer demonstrates understanding of key ${title.toLowerCase()} concepts.`,
      points: 10
    };
  }

  private async generateTrueFalseAssessment(title: string, difficulty: string): Promise<LessonAssessment> {
    return {
      type: 'true_false',
      question: `Bitcoin ${title.toLowerCase()} operates the same way regardless of network conditions.`,
      correct_answer: 'false',
      explanation: `Bitcoin ${title.toLowerCase()} adapts dynamically to network conditions, making this statement false.`,
      points: 5
    };
  }

  private async generateScenarioAssessment(title: string, difficulty: string): Promise<LessonAssessment> {
    return {
      type: 'scenario',
      question: `You're advising a business on ${title.toLowerCase()}. The network is experiencing high congestion. What's your recommendation?`,
      explanation: `During high congestion, consider timing, fee strategies, and alternative solutions like Lightning Network for smaller transactions.`,
      points: 15
    };
  }

  // Utility methods
  private formatTopicTitle(topicId: string): string {
    return topicId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private generateModuleDescription(topicId: string, template: any): string {
    return `Comprehensive ${template.difficulty} level tutorial covering ${this.formatTopicTitle(topicId)}. ` +
           `Features ${template.lessons.length} progressive lessons with interactive elements, ` +
           `real-world examples, and hands-on exercises.`;
  }

  private generateCompletionCriteria(lessons: TutorialLesson[]): string[] {
    return [
      `Complete all ${lessons.length} lessons`,
      'Achieve 80% score on lesson assessments',
      'Participate in interactive exercises',
      'Submit reflection responses'
    ];
  }

  private convertModuleToText(module: TutorialModule): string {
    let text = `# ${module.title}\n\n${module.description}\n\n`;
    
    module.lessons.forEach(lesson => {
      text += `## ${lesson.title}\n\n`;
      lesson.content_blocks.forEach(block => {
        text += `### ${block.title}\n${block.content}\n\n`;
      });
    });

    return text;
  }

  private async generateWebContent(module: TutorialModule): Promise<{html: string; interactive_elements: any[]}> {
    // Generate basic HTML structure
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${module.title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>${module.title}</h1>
    <p>${module.description}</p>
    <div class="lessons">
        ${module.lessons.map(lesson => `
            <div class="lesson" data-lesson-id="${lesson.id}">
                <h2>${lesson.title}</h2>
                <p>Duration: ${lesson.estimated_duration_minutes} minutes</p>
                <div class="content-blocks">
                    ${lesson.content_blocks.map(block => `
                        <div class="content-block ${block.type}">
                            <h3>${block.title}</h3>
                            <p>${block.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const interactive_elements = [
      { type: 'progress_tracker', lesson_count: module.lessons.length },
      { type: 'assessment_modal', total_questions: module.lessons.reduce((sum, l) => sum + l.assessments.length, 0) },
      { type: 'live_data_widgets', integrations: module.lessons.flatMap(l => l.live_data_integration) }
    ];

    return { html, interactive_elements };
  }

  private calculateLessonDuration(
    contentBlocks: LessonContent[], 
    assessments: LessonAssessment[], 
    baseDuration: number
  ): number {
    const contentTime = contentBlocks.length * 3; // 3 minutes per content block
    const assessmentTime = assessments.length * 2; // 2 minutes per assessment
    return Math.max(baseDuration, contentTime + assessmentTime);
  }

  private getPreviousLessonId(lessonIndex: number): string {
    return `lesson-${lessonIndex - 1}`;
  }

  /**
   * Get available tutorial topics
   */
  getAvailableTopics(): string[] {
    return Object.keys(this.topicTemplates);
  }

  /**
   * Get topic information
   */
  getTopicInfo(topicId: string): any {
    return this.topicTemplates[topicId as keyof typeof this.topicTemplates];
  }
}

export const tutorialBuilder = new TutorialBuilder();