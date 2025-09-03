// src/agents/ContentPhilosophyAnalyzer.ts
import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';

export interface EducationalPhilosophy {
  core_principles: string[];
  teaching_style: {
    socratic_questioning: boolean;
    simplification_approach: 'minimal_jargon' | 'progressive_complexity' | 'analogy_based';
    gamification_elements: string[];
    building_methodology: 'ground_up' | 'scaffolded' | 'spiral';
    interaction_patterns: string[];
  };
  content_characteristics: {
    tone: string;
    complexity_level: 'beginner' | 'intermediate' | 'adaptive';
    engagement_techniques: string[];
    common_metaphors: string[];
    preferred_examples: string[];
  };
  quality_markers: {
    clarity_indicators: string[];
    engagement_signals: string[];
    learning_effectiveness: string[];
  };
}

export interface ContentAnalysis {
  platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt';
  content_type: string;
  philosophy_alignment: number; // 0-100 score
  strengths: string[];
  improvement_opportunities: string[];
  suggested_enhancements: string[];
  jargon_score: number; // 0-100, lower is better
  engagement_score: number; // 0-100
  clarity_score: number; // 0-100
  socratic_elements: string[];
  gamification_present: string[];
}

export class ContentPhilosophyAnalyzer {
  private philosophy: EducationalPhilosophy | null = null;
  private learningHistory: ContentAnalysis[] = [];

  constructor() {
    this.loadPhilosophy();
  }

  /**
   * Learn from existing content to understand educational philosophy
   */
  async learnFromContent(
    platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt',
    content: any,
    contentType: string
  ): Promise<ContentAnalysis> {
    logger.info(`Learning from ${platform} content: ${contentType}`);

    const analysis = await this.analyzeContent(platform, content, contentType);
    this.learningHistory.push(analysis);

    // Update philosophy based on patterns
    await this.updatePhilosophyFromAnalysis(analysis);
    
    return analysis;
  }

  /**
   * Analyze content against learned philosophy
   */
  private async analyzeContent(
    platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt',
    content: any,
    contentType: string
  ): Promise<ContentAnalysis> {
    const text = this.extractTextContent(content);
    
    // Analyze various aspects
    const jargonScore = this.calculateJargonScore(text);
    const engagementScore = this.calculateEngagementScore(text, platform);
    const clarityScore = this.calculateClarityScore(text);
    const socraticElements = this.findSocraticElements(text);
    const gamificationElements = this.findGamificationElements(text, content);
    
    const analysis: ContentAnalysis = {
      platform,
      content_type: contentType,
      philosophy_alignment: this.calculatePhilosophyAlignment(text, content),
      strengths: this.identifyStrengths(text, content, platform),
      improvement_opportunities: this.identifyImprovements(text, content, platform),
      suggested_enhancements: await this.generateEnhancements(text, content, platform),
      jargon_score: jargonScore,
      engagement_score: engagementScore,
      clarity_score: clarityScore,
      socratic_elements: socraticElements,
      gamification_present: gamificationElements
    };

    return analysis;
  }

  /**
   * Extract text content from various formats
   */
  private extractTextContent(content: any): string {
    if (typeof content === 'string') return content;
    
    // Handle Canva design content
    if (content.design_elements) {
      return content.design_elements
        .filter((elem: any) => elem.type === 'text')
        .map((elem: any) => elem.content)
        .join(' ');
    }

    // Handle Notion blocks
    if (content.blocks) {
      return content.blocks
        .map((block: any) => block.text || block.title || '')
        .join(' ');
    }

    // Handle GPT instructions
    if (content.instructions || content.system_message) {
      return content.instructions || content.system_message;
    }

    return JSON.stringify(content);
  }

  /**
   * Calculate jargon score (lower is better)
   */
  private calculateJargonScore(text: string): number {
    const jargonWords = [
      'utilize', 'facilitate', 'implement', 'paradigm', 'synergy',
      'leverage', 'optimize', 'streamline', 'ecosystem', 'framework',
      'methodology', 'comprehensive', 'holistic', 'scalable', 'robust'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const jargonCount = words.filter(word => 
      jargonWords.some(jargon => word.includes(jargon))
    ).length;
    
    return Math.min(100, (jargonCount / words.length) * 1000);
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(text: string, platform: string): number {
    let score = 0;
    
    // Questions boost engagement
    const questionCount = (text.match(/\?/g) || []).length;
    score += Math.min(30, questionCount * 5);
    
    // Action words
    const actionWords = ['try', 'explore', 'discover', 'experiment', 'practice', 'build', 'create'];
    const actionCount = actionWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    score += Math.min(20, actionCount * 3);
    
    // Personal pronouns (you, your, we, us)
    const personalWords = ['you', 'your', 'we', 'us', 'let\'s'];
    const personalCount = personalWords.filter(word =>
      text.toLowerCase().includes(word)
    ).length;
    score += Math.min(25, personalCount * 2);
    
    // Examples and analogies
    const exampleWords = ['like', 'imagine', 'think of', 'for example', 'such as'];
    const exampleCount = exampleWords.filter(phrase =>
      text.toLowerCase().includes(phrase)
    ).length;
    score += Math.min(25, exampleCount * 5);
    
    return Math.min(100, score);
  }

  /**
   * Calculate clarity score
   */
  private calculateClarityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    let score = 100;
    
    // Penalize long sentences
    const avgSentenceLength = sentences.reduce((sum, s) => 
      sum + s.trim().split(/\s+/).length, 0) / sentences.length;
    
    if (avgSentenceLength > 25) score -= 30;
    else if (avgSentenceLength > 20) score -= 15;
    
    // Reward simple structure words
    const clarityWords = ['first', 'then', 'next', 'finally', 'because', 'so', 'when'];
    const clarityCount = clarityWords.filter(word =>
      text.toLowerCase().includes(word)
    ).length;
    score += Math.min(20, clarityCount * 3);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Find Socratic elements in content
   */
  private findSocraticElements(text: string): string[] {
    const socraticPatterns = [
      /what do you think/gi,
      /why might/gi,
      /how would you/gi,
      /what if/gi,
      /can you explain/gi,
      /what happens when/gi,
      /how does this relate/gi,
      /what's the difference/gi
    ];

    const elements: string[] = [];
    socraticPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        elements.push(...matches.map(match => match.toLowerCase()));
      }
    });

    return [...new Set(elements)];
  }

  /**
   * Find gamification elements
   */
  private findGamificationElements(text: string, content: any): string[] {
    const gamificationKeywords = [
      'challenge', 'level', 'achievement', 'progress', 'reward',
      'milestone', 'quest', 'mission', 'unlock', 'badge', 'score',
      'leaderboard', 'competition', 'game', 'play'
    ];

    const elements: string[] = [];
    
    gamificationKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        elements.push(keyword);
      }
    });

    // Check for visual gamification elements in Canva
    if (content.design_elements) {
      const visualGameElements = content.design_elements.filter((elem: any) =>
        elem.type === 'shape' && (elem.name || '').includes('progress') ||
        elem.type === 'icon' && ['star', 'trophy', 'medal', 'badge'].includes(elem.name)
      );
      elements.push(...visualGameElements.map((elem: any) => `visual_${elem.name}`));
    }

    return [...new Set(elements)];
  }

  /**
   * Calculate how well content aligns with learned philosophy
   */
  private calculatePhilosophyAlignment(text: string, content: any): number {
    if (!this.philosophy) return 50; // Default score when no philosophy learned yet

    let alignment = 0;
    
    // Check core principles alignment (40 points)
    const principleAlignment = this.philosophy.core_principles.filter(principle =>
      text.toLowerCase().includes(principle.toLowerCase())
    ).length / this.philosophy.core_principles.length;
    alignment += principleAlignment * 40;

    // Check teaching style alignment (30 points)
    const styleScore = this.calculateStyleAlignment(text, content);
    alignment += styleScore * 30;

    // Check content characteristics (30 points)
    const charScore = this.calculateCharacteristicsAlignment(text);
    alignment += charScore * 30;

    return Math.min(100, alignment);
  }

  private calculateStyleAlignment(text: string, content: any): number {
    if (!this.philosophy) return 0.5;

    let score = 0;
    const style = this.philosophy.teaching_style;
    
    // Socratic questioning
    if (style.socratic_questioning) {
      const questions = (text.match(/\?/g) || []).length;
      score += Math.min(0.3, questions / 10);
    }
    
    // Gamification elements
    if (style.gamification_elements.length > 0) {
      const gameElements = this.findGamificationElements(text, content);
      score += Math.min(0.3, gameElements.length / 5);
    }
    
    // Building methodology
    if (style.building_methodology === 'ground_up') {
      const buildingWords = ['start with', 'begin', 'foundation', 'basics', 'first'];
      const buildingCount = buildingWords.filter(word => text.toLowerCase().includes(word)).length;
      score += Math.min(0.4, buildingCount / 3);
    }
    
    return Math.min(1, score);
  }

  private calculateCharacteristicsAlignment(text: string): number {
    if (!this.philosophy) return 0.5;

    let score = 0;
    const chars = this.philosophy.content_characteristics;
    
    // Tone alignment
    if (chars.tone === 'conversational' && this.isConversationalTone(text)) {
      score += 0.3;
    }
    
    // Engagement techniques
    const engagementCount = chars.engagement_techniques.filter(technique =>
      text.toLowerCase().includes(technique.toLowerCase())
    ).length;
    score += Math.min(0.4, engagementCount / chars.engagement_techniques.length);
    
    // Metaphor usage
    const metaphorCount = chars.common_metaphors.filter(metaphor =>
      text.toLowerCase().includes(metaphor.toLowerCase())
    ).length;
    score += Math.min(0.3, metaphorCount / chars.common_metaphors.length);
    
    return Math.min(1, score);
  }

  private isConversationalTone(text: string): boolean {
    const conversationalWords = ['you', 'your', 'let\'s', 'we', 'us', 'i'];
    const wordCount = text.split(/\s+/).length;
    const conversationalCount = conversationalWords.filter(word =>
      text.toLowerCase().includes(word)
    ).length;
    
    return (conversationalCount / wordCount) > 0.05; // 5% threshold
  }

  /**
   * Identify content strengths
   */
  private identifyStrengths(text: string, content: any, platform: string): string[] {
    const strengths: string[] = [];
    
    if (this.calculateJargonScore(text) < 20) {
      strengths.push('Clear, jargon-free language');
    }
    
    if (this.calculateEngagementScore(text, platform) > 70) {
      strengths.push('High engagement with questions and interactivity');
    }
    
    if (this.findSocraticElements(text).length > 2) {
      strengths.push('Strong Socratic questioning approach');
    }
    
    if (this.findGamificationElements(text, content).length > 0) {
      strengths.push('Incorporates gamification elements');
    }
    
    if (text.match(/\b(example|like|imagine|think of)\b/gi)) {
      strengths.push('Uses concrete examples and analogies');
    }
    
    return strengths;
  }

  /**
   * Identify improvement opportunities
   */
  private identifyImprovements(text: string, content: any, platform: string): string[] {
    const improvements: string[] = [];
    
    if (this.calculateJargonScore(text) > 40) {
      improvements.push('Reduce technical jargon and complex terminology');
    }
    
    if (this.calculateEngagementScore(text, platform) < 50) {
      improvements.push('Add more questions and interactive elements');
    }
    
    if (this.findSocraticElements(text).length < 2) {
      improvements.push('Include more Socratic questioning techniques');
    }
    
    if (this.calculateClarityScore(text) < 60) {
      improvements.push('Simplify sentence structure for better clarity');
    }
    
    if (!(text.match(/\b(example|like|imagine|think of)\b/gi))) {
      improvements.push('Add concrete examples and analogies');
    }
    
    if (this.findGamificationElements(text, content).length === 0) {
      improvements.push('Consider adding gamification elements');
    }
    
    return improvements;
  }

  /**
   * Generate specific enhancement suggestions
   */
  private async generateEnhancements(
    text: string, 
    content: any, 
    platform: string
  ): Promise<string[]> {
    const enhancements: string[] = [];
    
    // Platform-specific suggestions
    switch (platform) {
      case 'canva':
        enhancements.push(...this.generateCanvaEnhancements(content));
        break;
      case 'notion':
        enhancements.push(...this.generateNotionEnhancements(content));
        break;
      case 'chatgpt':
      case 'custom_gpt':
        enhancements.push(...this.generateGPTEnhancements(text));
        break;
    }
    
    // Universal enhancements based on philosophy
    if (this.philosophy) {
      enhancements.push(...this.generatePhilosophyBasedEnhancements(text));
    }
    
    return enhancements;
  }

  private generateCanvaEnhancements(content: any): string[] {
    const enhancements: string[] = [];
    
    // Visual gamification suggestions
    enhancements.push('Add progress bars or visual milestones');
    enhancements.push('Include interactive elements like checkboxes or QR codes');
    enhancements.push('Use color coding to represent difficulty levels');
    enhancements.push('Add visual metaphors and icons to support learning');
    
    return enhancements;
  }

  private generateNotionEnhancements(content: any): string[] {
    const enhancements: string[] = [];
    
    // Notion-specific interactive elements
    enhancements.push('Add toggle blocks for optional deep-dive content');
    enhancements.push('Create databases for tracking progress');
    enhancements.push('Include callout blocks for key insights');
    enhancements.push('Use templates for consistent learning structure');
    
    return enhancements;
  }

  private generateGPTEnhancements(text: string): string[] {
    const enhancements: string[] = [];
    
    // GPT instruction improvements
    enhancements.push('Add more Socratic questioning prompts');
    enhancements.push('Include adaptive difficulty adjustment based on user responses');
    enhancements.push('Incorporate real-world examples and analogies');
    enhancements.push('Add progressive revelation of complexity');
    
    return enhancements;
  }

  private generatePhilosophyBasedEnhancements(text: string): string[] {
    if (!this.philosophy) return [];
    
    const enhancements: string[] = [];
    
    // Based on teaching style preferences
    if (this.philosophy.teaching_style.socratic_questioning) {
      enhancements.push('Convert statements into discovery questions');
      enhancements.push('Add "What do you think?" prompts after key concepts');
    }
    
    if (this.philosophy.teaching_style.building_methodology === 'ground_up') {
      enhancements.push('Start with foundational concepts before advanced topics');
      enhancements.push('Add prerequisite knowledge checks');
    }
    
    return enhancements;
  }

  /**
   * Update philosophy based on content analysis
   */
  private async updatePhilosophyFromAnalysis(analysis: ContentAnalysis): Promise<void> {
    // Initialize philosophy if not exists
    if (!this.philosophy) {
      this.philosophy = this.createBasePhilosophy();
    }
    
    // Update based on analysis patterns
    this.updateTeachingStyle(analysis);
    this.updateContentCharacteristics(analysis);
    this.updateQualityMarkers(analysis);
    
    // Save updated philosophy
    await this.savePhilosophy();
  }

  private createBasePhilosophy(): EducationalPhilosophy {
    return {
      core_principles: ['simplicity', 'interactivity', 'building_from_basics'],
      teaching_style: {
        socratic_questioning: true,
        simplification_approach: 'minimal_jargon',
        gamification_elements: [],
        building_methodology: 'ground_up',
        interaction_patterns: []
      },
      content_characteristics: {
        tone: 'conversational',
        complexity_level: 'adaptive',
        engagement_techniques: [],
        common_metaphors: [],
        preferred_examples: []
      },
      quality_markers: {
        clarity_indicators: [],
        engagement_signals: [],
        learning_effectiveness: []
      }
    };
  }

  private updateTeachingStyle(analysis: ContentAnalysis): void {
    if (!this.philosophy) return;
    
    // Learn gamification elements
    if (analysis.gamification_present.length > 0) {
      this.philosophy.teaching_style.gamification_elements = [
        ...new Set([
          ...this.philosophy.teaching_style.gamification_elements,
          ...analysis.gamification_present
        ])
      ];
    }
    
    // Learn interaction patterns
    if (analysis.socratic_elements.length > 0) {
      this.philosophy.teaching_style.interaction_patterns = [
        ...new Set([
          ...this.philosophy.teaching_style.interaction_patterns,
          ...analysis.socratic_elements
        ])
      ];
    }
  }

  private updateContentCharacteristics(analysis: ContentAnalysis): void {
    if (!this.philosophy) return;
    
    // Update engagement techniques based on high-scoring content
    if (analysis.engagement_score > 70) {
      // Extract successful patterns from this content
      // This is a simplified version - in practice, you'd do more sophisticated pattern extraction
    }
    
    // Learn from successful clarity patterns
    if (analysis.clarity_score > 80) {
      this.philosophy.content_characteristics.clarity_indicators = [
        ...this.philosophy.quality_markers.clarity_indicators,
        `pattern_from_${analysis.platform}_${analysis.content_type}`
      ];
    }
  }

  private updateQualityMarkers(analysis: ContentAnalysis): void {
    if (!this.philosophy) return;
    
    // Track what works well
    if (analysis.philosophy_alignment > 80) {
      this.philosophy.quality_markers.learning_effectiveness.push(
        `effective_${analysis.platform}_${analysis.content_type}`
      );
    }
  }

  /**
   * Get current philosophy
   */
  getPhilosophy(): EducationalPhilosophy | null {
    return this.philosophy;
  }

  /**
   * Get learning history
   */
  getLearningHistory(): ContentAnalysis[] {
    return [...this.learningHistory];
  }

  /**
   * Save philosophy to cache
   */
  private async savePhilosophy(): Promise<void> {
    if (this.philosophy) {
      cacheStore.set('educational_philosophy', this.philosophy, 0); // No expiration
      logger.debug('Educational philosophy updated and saved');
    }
  }

  /**
   * Load philosophy from cache
   */
  private async loadPhilosophy(): Promise<void> {
    const cached = cacheStore.get<EducationalPhilosophy>('educational_philosophy');
    if (cached) {
      this.philosophy = cached;
      logger.debug('Educational philosophy loaded from cache');
    }
  }

  /**
   * Export philosophy for external use
   */
  exportPhilosophy(): string {
    return JSON.stringify(this.philosophy, null, 2);
  }

  /**
   * Import philosophy from external source
   */
  importPhilosophy(philosophyJson: string): void {
    try {
      this.philosophy = JSON.parse(philosophyJson);
      this.savePhilosophy();
      logger.info('Educational philosophy imported successfully');
    } catch (error) {
      logger.error('Failed to import philosophy:', error);
      throw new Error('Invalid philosophy format');
    }
  }
}