import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

export interface CustomGPTData {
  id: string;
  name: string;
  description: string;
  instructions: string;
  conversation_starters: string[];
  knowledge_files: string[];
  capabilities: {
    web_browsing: boolean;
    data_analysis: boolean;
    image_generation: boolean;
    file_uploads: boolean;
  };
  actions?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface ChatGPTConversation {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  messages: ChatGPTMessage[];
  gpt_id?: string;
  model: string;
}

export interface ChatGPTMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
  metadata?: any;
}

export interface GPTAnalysis {
  total_gpts: number;
  total_conversations: number;
  teaching_patterns: string[];
  common_topics: string[];
  instruction_themes: string[];
  conversation_analysis: {
    avg_length: number;
    question_ratio: number;
    explanation_patterns: string[];
    socratic_elements: number;
  };
  integration_recommendations: string[];
}

export class ChatGPTDataImporter {
  private dataPath: string;
  private openaiApiKey?: string;

  constructor() {
    this.dataPath = 'data/chatgpt_data';
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.ensureDirectories();
    logger.info('ChatGPTDataImporter initialized');
  }

  /**
   * Import ChatGPT data export file
   */
  async importDataExport(exportFilePath: string): Promise<GPTAnalysis> {
    logger.info('Importing ChatGPT data export...');

    try {
      // Check if it's a ZIP file or JSON
      if (exportFilePath.endsWith('.zip')) {
        throw new Error('ZIP extraction not implemented. Please extract the ZIP and provide the conversations.json file.');
      }

      // Read the exported data
      const dataContent = readFileSync(exportFilePath, 'utf8');
      const exportData = JSON.parse(dataContent);

      // Process conversations
      const conversations = this.processConversations(exportData);
      
      // Process custom GPTs (if available)
      const customGPTs = this.processCustomGPTs(exportData);
      
      // Analyze teaching patterns
      const analysis = this.analyzeTeachingPatterns(conversations, customGPTs);
      
      // Save processed data
      await this.saveImportedData(conversations, customGPTs, analysis);
      
      logger.info(`ChatGPT data import completed: ${conversations.length} conversations, ${customGPTs.length} GPTs`);
      return analysis;

    } catch (error) {
      logger.error('Failed to import ChatGPT data:', error);
      throw error;
    }
  }

  /**
   * Import individual custom GPT configuration
   */
  async importCustomGPT(gptData: Partial<CustomGPTData>): Promise<void> {
    logger.info(`Importing custom GPT: ${gptData.name}`);

    const fullGPTData: CustomGPTData = {
      id: gptData.id || `gpt_${Date.now()}`,
      name: gptData.name || 'Unnamed GPT',
      description: gptData.description || '',
      instructions: gptData.instructions || '',
      conversation_starters: gptData.conversation_starters || [],
      knowledge_files: gptData.knowledge_files || [],
      capabilities: gptData.capabilities || {
        web_browsing: false,
        data_analysis: false,
        image_generation: false,
        file_uploads: false
      },
      actions: gptData.actions || [],
      created_at: new Date().toISOString()
    };

    // Analyze the GPT's teaching methodology
    const methodologyAnalysis = this.analyzeGPTMethodology(fullGPTData);
    
    // Save GPT data with analysis
    const gptWithAnalysis = {
      ...fullGPTData,
      methodology_analysis: methodologyAnalysis
    };

    const gptPath = join(this.dataPath, 'custom_gpts', `${fullGPTData.id}.json`);
    writeFileSync(gptPath, JSON.stringify(gptWithAnalysis, null, 2));

    logger.info(`Custom GPT saved: ${gptPath}`);
  }

  /**
   * Import conversation data manually
   */
  async importConversations(conversations: Partial<ChatGPTConversation>[]): Promise<void> {
    logger.info(`Importing ${conversations.length} conversations...`);

    const processedConversations = conversations.map(conv => ({
      id: conv.id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: conv.title || 'Untitled Conversation',
      create_time: conv.create_time || Date.now() / 1000,
      update_time: conv.update_time || Date.now() / 1000,
      messages: conv.messages || [],
      model: conv.model || 'gpt-4',
      gpt_id: conv.gpt_id
    }));

    // Analyze conversations for teaching patterns
    const conversationAnalysis = this.analyzeConversations(processedConversations);

    // Save conversations
    const conversationsPath = join(this.dataPath, 'conversations.json');
    writeFileSync(conversationsPath, JSON.stringify({
      conversations: processedConversations,
      analysis: conversationAnalysis,
      imported_at: new Date().toISOString()
    }, null, 2));

    logger.info(`Conversations saved: ${conversationsPath}`);
  }

  /**
   * Analyze teaching patterns from all data
   */
  private analyzeTeachingPatterns(conversations: ChatGPTConversation[], gpts: CustomGPTData[]): GPTAnalysis {
    const teachingPatterns: string[] = [];
    const instructionThemes: string[] = [];
    const commonTopics: string[] = [];

    // Analyze GPT instructions
    gpts.forEach(gpt => {
      const instructions = gpt.instructions.toLowerCase();
      
      if (instructions.includes('socratic')) teachingPatterns.push('Socratic questioning');
      if (instructions.includes('analogy')) teachingPatterns.push('Analogy-based teaching');
      if (instructions.includes('step')) teachingPatterns.push('Step-by-step instruction');
      if (instructions.includes('discover')) teachingPatterns.push('Discovery-based learning');
      if (instructions.includes('practical')) teachingPatterns.push('Practical application focus');
      if (instructions.includes('patient')) teachingPatterns.push('Patient guidance approach');
      
      // Extract common instruction themes
      if (instructions.includes('bitcoin')) commonTopics.push('Bitcoin education');
      if (instructions.includes('simple') || instructions.includes('beginner')) instructionThemes.push('Beginner-friendly approach');
      if (instructions.includes('question')) instructionThemes.push('Question-driven methodology');
    });

    // Analyze conversation patterns
    const conversationAnalysis = this.analyzeConversations(conversations);

    return {
      total_gpts: gpts.length,
      total_conversations: conversations.length,
      teaching_patterns: [...new Set(teachingPatterns)],
      common_topics: [...new Set(commonTopics)],
      instruction_themes: [...new Set(instructionThemes)],
      conversation_analysis: conversationAnalysis,
      integration_recommendations: this.generateIntegrationRecommendations(teachingPatterns, instructionThemes)
    };
  }

  private analyzeConversations(conversations: ChatGPTConversation[]): any {
    if (conversations.length === 0) {
      return {
        avg_length: 0,
        question_ratio: 0,
        explanation_patterns: [],
        socratic_elements: 0
      };
    }

    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const avgLength = totalMessages / conversations.length;

    let questionCount = 0;
    let socraticElements = 0;
    const explanationPatterns: string[] = [];

    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.role === 'assistant') {
          const content = msg.content.toLowerCase();
          
          if (content.includes('?')) questionCount++;
          if (content.includes('what do you think') || content.includes('how would you') || content.includes('can you imagine')) {
            socraticElements++;
          }
          if (content.includes('like') && content.includes('analogy')) {
            explanationPatterns.push('Uses analogies');
          }
          if (content.includes('step by step') || content.includes('first') && content.includes('next')) {
            explanationPatterns.push('Sequential instruction');
          }
        }
      });
    });

    return {
      avg_length: Math.round(avgLength),
      question_ratio: questionCount / Math.max(totalMessages, 1),
      explanation_patterns: [...new Set(explanationPatterns)],
      socratic_elements: socraticElements
    };
  }

  private analyzeGPTMethodology(gpt: CustomGPTData): any {
    const instructions = gpt.instructions.toLowerCase();
    const methodology = {
      primary_approach: 'unknown',
      teaching_techniques: [] as string[],
      engagement_level: 'medium',
      complexity_handling: 'unknown',
      assessment_style: 'unknown'
    };

    // Determine primary approach
    if (instructions.includes('socratic')) methodology.primary_approach = 'socratic';
    else if (instructions.includes('step')) methodology.primary_approach = 'sequential';
    else if (instructions.includes('discover')) methodology.primary_approach = 'discovery';
    else if (instructions.includes('practical')) methodology.primary_approach = 'practical';

    // Identify teaching techniques
    if (instructions.includes('analogy')) methodology.teaching_techniques.push('analogies');
    if (instructions.includes('example')) methodology.teaching_techniques.push('examples');
    if (instructions.includes('question')) methodology.teaching_techniques.push('questioning');
    if (instructions.includes('scenario')) methodology.teaching_techniques.push('scenarios');

    // Assess engagement level
    if (instructions.includes('interactive') || instructions.includes('engage')) {
      methodology.engagement_level = 'high';
    } else if (instructions.includes('patient') || instructions.includes('encourage')) {
      methodology.engagement_level = 'supportive';
    }

    // Complexity handling
    if (instructions.includes('simple') || instructions.includes('jargon')) {
      methodology.complexity_handling = 'simplified';
    } else if (instructions.includes('advanced') || instructions.includes('technical')) {
      methodology.complexity_handling = 'technical';
    }

    return methodology;
  }

  private generateIntegrationRecommendations(patterns: string[], themes: string[]): string[] {
    const recommendations = [];

    if (patterns.includes('Socratic questioning')) {
      recommendations.push('Integrate Socratic questioning framework into all course modules');
    }
    if (patterns.includes('Analogy-based teaching')) {
      recommendations.push('Create comprehensive analogy database for complex Bitcoin concepts');
    }
    if (patterns.includes('Discovery-based learning')) {
      recommendations.push('Design discovery pathways for course content');
    }
    if (themes.includes('Beginner-friendly approach')) {
      recommendations.push('Implement adaptive complexity based on learner level');
    }
    if (themes.includes('Question-driven methodology')) {
      recommendations.push('Replace statements with guiding questions throughout courses');
    }

    return recommendations;
  }

  // Helper methods for processing different export formats
  private processConversations(exportData: any): ChatGPTConversation[] {
    if (Array.isArray(exportData)) {
      return exportData.map(this.normalizeConversation);
    }
    if (exportData.conversations) {
      return exportData.conversations.map(this.normalizeConversation);
    }
    return [];
  }

  private processCustomGPTs(exportData: any): CustomGPTData[] {
    if (exportData.gpts) {
      return exportData.gpts;
    }
    if (exportData.custom_gpts) {
      return exportData.custom_gpts;
    }
    return [];
  }

  private normalizeConversation(conv: any): ChatGPTConversation {
    return {
      id: conv.id || conv.conversation_id || `conv_${Date.now()}`,
      title: conv.title || 'Untitled',
      create_time: conv.create_time || conv.created_at || Date.now() / 1000,
      update_time: conv.update_time || conv.updated_at || Date.now() / 1000,
      messages: conv.messages || conv.mapping ? this.extractMessages(conv.mapping) : [],
      model: conv.model || 'gpt-4',
      gpt_id: conv.gpt_id
    };
  }

  private extractMessages(mapping: any): ChatGPTMessage[] {
    if (!mapping) return [];
    
    return Object.values(mapping)
      .filter((node: any) => node.message && node.message.content)
      .map((node: any) => ({
        id: node.id,
        role: node.message.author.role,
        content: node.message.content.parts.join('\n'),
        create_time: node.message.create_time || Date.now() / 1000
      }));
  }

  private async saveImportedData(conversations: ChatGPTConversation[], gpts: CustomGPTData[], analysis: GPTAnalysis): Promise<void> {
    // Save conversations
    const conversationsPath = join(this.dataPath, 'conversations.json');
    writeFileSync(conversationsPath, JSON.stringify({
      conversations,
      imported_at: new Date().toISOString()
    }, null, 2));

    // Save GPTs
    const gptsDir = join(this.dataPath, 'custom_gpts');
    if (!existsSync(gptsDir)) {
      mkdirSync(gptsDir, { recursive: true });
    }

    gpts.forEach(gpt => {
      const gptPath = join(gptsDir, `${gpt.id}.json`);
      writeFileSync(gptPath, JSON.stringify(gpt, null, 2));
    });

    // Save analysis
    const analysisPath = join(this.dataPath, 'teaching_analysis.json');
    writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

    logger.info('All ChatGPT data saved successfully');
  }

  private ensureDirectories(): void {
    [this.dataPath, join(this.dataPath, 'custom_gpts')].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get summary of imported ChatGPT data
   */
  async getImportSummary(): Promise<any> {
    try {
      const analysisPath = join(this.dataPath, 'teaching_analysis.json');
      if (existsSync(analysisPath)) {
        return JSON.parse(readFileSync(analysisPath, 'utf8'));
      }
    } catch (error) {
      logger.warn('Could not load ChatGPT import summary:', error);
    }
    
    return {
      message: 'No  data imported yet',
      instructions: [
        'Export your ChatGPT data from Settings > Data Controls > Export',
        'Use npm run gpt:import <file> to import your data',
        'Or manually add GPT configurations with npm run gpt:add'
      ]
    };
  }
}

export const chatGPTDataImporter = new ChatGPTDataImporter();