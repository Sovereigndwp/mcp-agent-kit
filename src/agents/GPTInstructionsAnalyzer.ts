// src/agents/GPTInstructionsAnalyzer.ts
import { logger } from '../utils/logger.js';
import { ContentPhilosophyAnalyzer, ContentAnalysis } from './ContentPhilosophyAnalyzer.js';

export interface GPTConfiguration {
  id: string;
  name: string;
  description: string;
  instructions: string;
  conversation_starters?: string[];
  knowledge_files?: Array<{
    name: string;
    type: string;
    content_summary?: string;
  }>;
  capabilities: {
    web_browsing: boolean;
    dalle_image_generation: boolean;
    code_interpreter: boolean;
  };
  created_at: string;
  updated_at: string;
  usage_stats?: {
    total_conversations: number;
    avg_conversation_length: number;
    user_satisfaction_score?: number;
  };
}

export interface InstructionAnalysis {
  structure: {
    has_clear_role_definition: boolean;
    has_specific_guidelines: boolean;
    has_example_interactions: boolean;
    has_boundary_conditions: boolean;
    instruction_length: number; // character count
    complexity_score: number; // 0-100
  };
  educational_elements: {
    socratic_questioning_present: boolean;
    scaffolding_instructions: boolean;
    adaptive_difficulty_guidance: boolean;
    feedback_mechanisms: boolean;
    learning_progression_logic: boolean;
    assessment_integration: boolean;
  };
  communication_style: {
    tone_indicators: string[];
    personalization_level: 'generic' | 'moderate' | 'highly_personalized';
    interaction_patterns: string[];
    response_structure_guidance: boolean;
  };
  philosophy_alignment: {
    ground_up_building: boolean;
    jargon_minimization: boolean;
    gamification_elements: boolean;
    real_world_connections: boolean;
    interactive_engagement: boolean;
  };
  effectiveness_indicators: {
    clear_success_criteria: boolean;
    error_handling_guidance: boolean;
    user_guidance_quality: number; // 0-100
    adaptability_score: number; // 0-100
  };
}

export interface GPTImprovementSuggestion {
  category: 'structure' | 'education' | 'interaction' | 'philosophy' | 'effectiveness';
  priority: 'low' | 'medium' | 'high' | 'critical';
  current_issue: string;
  suggested_improvement: string;
  implementation_example: string;
  expected_benefits: string[];
  philosophy_rationale: string;
}

export interface GPTAnalysisReport {
  gpt_id: string;
  gpt_name: string;
  content_analysis: ContentAnalysis;
  instruction_analysis: InstructionAnalysis;
  conversation_starter_analysis?: {
    effectiveness_scores: number[];
    socratic_question_count: number;
    engagement_potential: number;
    philosophy_alignment: number;
  };
  overall_scores: {
    educational_effectiveness: number; // 0-100
    instruction_clarity: number; // 0-100
    philosophy_alignment: number; // 0-100
    user_engagement_potential: number; // 0-100
    adaptability: number; // 0-100
  };
  improvement_suggestions: GPTImprovementSuggestion[];
  enhanced_instructions: {
    optimized_system_prompt: string;
    improved_conversation_starters: string[];
    additional_guidelines: string[];
  };
}

export class GPTInstructionsAnalyzer {
  private philosophyAnalyzer: ContentPhilosophyAnalyzer;
  
  constructor() {
    this.philosophyAnalyzer = new ContentPhilosophyAnalyzer();
  }

  /**
   * Analyze ChatGPT/Custom GPT configuration for educational effectiveness
   */
  async analyzeGPT(gptConfig: GPTConfiguration): Promise<GPTAnalysisReport> {
    logger.info(`Analyzing GPT configuration: ${gptConfig.name} (${gptConfig.id})`);

    // Get content analysis from philosophy analyzer
    const contentAnalysis = await this.philosophyAnalyzer.learnFromContent(
      'custom_gpt',
      gptConfig,
      'instructions'
    );

    // Perform instruction analysis
    const instructionAnalysis = this.analyzeInstructions(gptConfig.instructions);

    // Analyze conversation starters if present
    const conversationStarterAnalysis = gptConfig.conversation_starters
      ? this.analyzeConversationStarters(gptConfig.conversation_starters)
      : undefined;

    // Calculate overall scores
    const overallScores = this.calculateOverallScores(
      contentAnalysis,
      instructionAnalysis,
      conversationStarterAnalysis
    );

    // Generate improvement suggestions
    const improvementSuggestions = await this.generateImprovementSuggestions(
      gptConfig,
      contentAnalysis,
      instructionAnalysis
    );

    // Create enhanced instructions
    const enhancedInstructions = await this.createEnhancedInstructions(
      gptConfig,
      improvementSuggestions
    );

    return {
      gpt_id: gptConfig.id,
      gpt_name: gptConfig.name,
      content_analysis: contentAnalysis,
      instruction_analysis: instructionAnalysis,
      conversation_starter_analysis: conversationStarterAnalysis,
      overall_scores: overallScores,
      improvement_suggestions: improvementSuggestions,
      enhanced_instructions: enhancedInstructions
    };
  }

  /**
   * Analyze multiple GPTs and identify patterns
   */
  async analyzeGPTCollection(gpts: GPTConfiguration[]): Promise<{
    individual_reports: GPTAnalysisReport[];
    collection_insights: {
      consistency_across_gpts: number; // 0-100
      common_strengths: string[];
      recurring_weaknesses: string[];
      philosophy_evolution: string[];
      best_performing_gpts: string[];
      optimization_priorities: string[];
    };
  }> {
    const reports = await Promise.all(
      gpts.map(gpt => this.analyzeGPT(gpt))
    );

    const collectionInsights = this.analyzeCollectionPatterns(reports);

    return {
      individual_reports: reports,
      collection_insights: collectionInsights
    };
  }

  /**
   * Analyze instruction structure and content
   */
  private analyzeInstructions(instructions: string): InstructionAnalysis {
    const lowerInstructions = instructions.toLowerCase();
    
    return {
      structure: this.analyzeInstructionStructure(instructions),
      educational_elements: this.analyzeEducationalElements(instructions),
      communication_style: this.analyzeCommunicationStyle(instructions),
      philosophy_alignment: this.analyzePhilosophyAlignment(instructions),
      effectiveness_indicators: this.analyzeEffectivenessIndicators(instructions)
    };
  }

  private analyzeInstructionStructure(instructions: string): InstructionAnalysis['structure'] {
    const lowerInstructions = instructions.toLowerCase();
    
    // Check for clear role definition
    const roleIndicators = ['you are', 'your role', 'act as', 'you will be', 'your purpose'];
    const hasRoleDefinition = roleIndicators.some(indicator => 
      lowerInstructions.includes(indicator)
    );

    // Check for specific guidelines
    const guidelineIndicators = ['always', 'never', 'when', 'if', 'should', 'must', 'guidelines'];
    const hasGuidelines = guidelineIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Check for examples
    const exampleIndicators = ['example', 'for instance', 'like this', 'such as'];
    const hasExamples = exampleIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Check for boundary conditions
    const boundaryIndicators = ['do not', 'avoid', 'never', 'refuse', 'cannot', 'limitations'];
    const hasBoundaries = boundaryIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Calculate complexity score
    const sentences = instructions.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    const complexityScore = Math.min(100, Math.max(0, 100 - (avgSentenceLength - 15) * 2));

    return {
      has_clear_role_definition: hasRoleDefinition,
      has_specific_guidelines: hasGuidelines,
      has_example_interactions: hasExamples,
      has_boundary_conditions: hasBoundaries,
      instruction_length: instructions.length,
      complexity_score: Math.round(complexityScore)
    };
  }

  private analyzeEducationalElements(instructions: string): InstructionAnalysis['educational_elements'] {
    const lowerInstructions = instructions.toLowerCase();

    // Socratic questioning
    const socraticIndicators = ['ask questions', 'guide discovery', 'lead them to', 'help them think', 'questioning'];
    const socraticPresent = socraticIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Scaffolding
    const scaffoldingIndicators = ['step by step', 'gradually', 'build upon', 'scaffold', 'progressive'];
    const scaffoldingPresent = scaffoldingIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Adaptive difficulty
    const adaptiveIndicators = ['adjust', 'adapt', 'difficulty', 'level', 'based on user'];
    const adaptivePresent = adaptiveIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Feedback mechanisms
    const feedbackIndicators = ['feedback', 'correct', 'praise', 'encourage', 'acknowledge'];
    const feedbackPresent = feedbackIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Learning progression
    const progressionIndicators = ['progress', 'advance', 'next level', 'build on', 'foundation'];
    const progressionPresent = progressionIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Assessment integration
    const assessmentIndicators = ['check understanding', 'assess', 'quiz', 'test', 'evaluate'];
    const assessmentPresent = assessmentIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    return {
      socratic_questioning_present: socraticPresent,
      scaffolding_instructions: scaffoldingPresent,
      adaptive_difficulty_guidance: adaptivePresent,
      feedback_mechanisms: feedbackPresent,
      learning_progression_logic: progressionPresent,
      assessment_integration: assessmentPresent
    };
  }

  private analyzeCommunicationStyle(instructions: string): InstructionAnalysis['communication_style'] {
    const lowerInstructions = instructions.toLowerCase();

    // Identify tone indicators
    const toneIndicators: string[] = [];
    if (lowerInstructions.includes('friendly')) toneIndicators.push('friendly');
    if (lowerInstructions.includes('encouraging')) toneIndicators.push('encouraging');
    if (lowerInstructions.includes('professional')) toneIndicators.push('professional');
    if (lowerInstructions.includes('casual')) toneIndicators.push('casual');
    if (lowerInstructions.includes('enthusiastic')) toneIndicators.push('enthusiastic');
    if (lowerInstructions.includes('supportive')) toneIndicators.push('supportive');

    // Determine personalization level
    const personalizationIndicators = ['user\'s name', 'their interests', 'personal', 'individual', 'customize'];
    const personalizationCount = personalizationIndicators.filter(indicator =>
      lowerInstructions.includes(indicator)
    ).length;

    let personalizationLevel: 'generic' | 'moderate' | 'highly_personalized' = 'generic';
    if (personalizationCount >= 3) personalizationLevel = 'highly_personalized';
    else if (personalizationCount >= 1) personalizationLevel = 'moderate';

    // Identify interaction patterns
    const interactionPatterns: string[] = [];
    if (lowerInstructions.includes('conversation')) interactionPatterns.push('conversational');
    if (lowerInstructions.includes('questions')) interactionPatterns.push('inquiry-based');
    if (lowerInstructions.includes('examples')) interactionPatterns.push('example-driven');
    if (lowerInstructions.includes('interactive')) interactionPatterns.push('interactive');

    // Check for response structure guidance
    const structureIndicators = ['format', 'structure', 'organize', 'present', 'layout'];
    const hasStructureGuidance = structureIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    return {
      tone_indicators: toneIndicators,
      personalization_level: personalizationLevel,
      interaction_patterns: interactionPatterns,
      response_structure_guidance: hasStructureGuidance
    };
  }

  private analyzePhilosophyAlignment(instructions: string): InstructionAnalysis['philosophy_alignment'] {
    const lowerInstructions = instructions.toLowerCase();

    // Ground-up building
    const groundUpIndicators = ['basics', 'fundamentals', 'foundation', 'start simple', 'build from'];
    const groundUpPresent = groundUpIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Jargon minimization
    const jargonIndicators = ['simple', 'plain language', 'avoid jargon', 'explain', 'clarify'];
    const jargonMinimization = jargonIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Gamification
    const gamificationIndicators = ['game', 'challenge', 'achievement', 'progress', 'reward', 'level'];
    const gamificationPresent = gamificationIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Real-world connections
    const realWorldIndicators = ['real world', 'practical', 'everyday', 'real life', 'example', 'application'];
    const realWorldPresent = realWorldIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Interactive engagement
    const interactiveIndicators = ['interactive', 'engage', 'participate', 'involve', 'activity'];
    const interactivePresent = interactiveIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    return {
      ground_up_building: groundUpPresent,
      jargon_minimization: jargonMinimization,
      gamification_elements: gamificationPresent,
      real_world_connections: realWorldPresent,
      interactive_engagement: interactivePresent
    };
  }

  private analyzeEffectivenessIndicators(instructions: string): InstructionAnalysis['effectiveness_indicators'] {
    const lowerInstructions = instructions.toLowerCase();

    // Success criteria
    const successIndicators = ['success', 'goal', 'objective', 'outcome', 'result'];
    const hasSuccessCriteria = successIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Error handling
    const errorIndicators = ['error', 'mistake', 'wrong', 'confusion', 'misunderstanding'];
    const hasErrorHandling = errorIndicators.some(indicator =>
      lowerInstructions.includes(indicator)
    );

    // Calculate user guidance quality
    let guidanceQuality = 50; // Base score
    if (lowerInstructions.includes('step by step')) guidanceQuality += 15;
    if (lowerInstructions.includes('examples')) guidanceQuality += 10;
    if (lowerInstructions.includes('clarify')) guidanceQuality += 10;
    if (lowerInstructions.includes('explain')) guidanceQuality += 10;
    if (lowerInstructions.includes('help')) guidanceQuality += 5;

    // Calculate adaptability score
    let adaptabilityScore = 50; // Base score
    if (lowerInstructions.includes('adapt')) adaptabilityScore += 20;
    if (lowerInstructions.includes('adjust')) adaptabilityScore += 15;
    if (lowerInstructions.includes('based on')) adaptabilityScore += 10;
    if (lowerInstructions.includes('depending')) adaptabilityScore += 5;

    return {
      clear_success_criteria: hasSuccessCriteria,
      error_handling_guidance: hasErrorHandling,
      user_guidance_quality: Math.min(100, guidanceQuality),
      adaptability_score: Math.min(100, adaptabilityScore)
    };
  }

  /**
   * Analyze conversation starters
   */
  private analyzeConversationStarters(starters: string[]): NonNullable<GPTAnalysisReport['conversation_starter_analysis']> {
    const effectivenessScores = starters.map(starter => this.scoreConversationStarter(starter));
    
    let socraticQuestionCount = 0;
    starters.forEach(starter => {
      if (starter.includes('?') && 
          (starter.toLowerCase().includes('what') || 
           starter.toLowerCase().includes('how') || 
           starter.toLowerCase().includes('why'))) {
        socraticQuestionCount++;
      }
    });

    const engagementPotential = Math.round(
      effectivenessScores.reduce((sum, score) => sum + score, 0) / starters.length
    );

    // Calculate philosophy alignment for starters
    let philosophyAlignment = 0;
    starters.forEach(starter => {
      const lowerStarter = starter.toLowerCase();
      if (lowerStarter.includes('example') || lowerStarter.includes('real')) philosophyAlignment += 15;
      if (lowerStarter.includes('simple') || lowerStarter.includes('basic')) philosophyAlignment += 10;
      if (lowerStarter.includes('help') || lowerStarter.includes('learn')) philosophyAlignment += 10;
      if (lowerStarter.includes('?')) philosophyAlignment += 15; // Questions are good
    });
    philosophyAlignment = Math.min(100, Math.round(philosophyAlignment / starters.length));

    return {
      effectiveness_scores: effectivenessScores,
      socratic_question_count: socraticQuestionCount,
      engagement_potential: engagementPotential,
      philosophy_alignment: philosophyAlignment
    };
  }

  private scoreConversationStarter(starter: string): number {
    let score = 50; // Base score
    
    // Questions are more engaging
    if (starter.includes('?')) score += 20;
    
    // Specific scenarios are better than vague prompts
    if (starter.toLowerCase().includes('example') || 
        starter.toLowerCase().includes('imagine') || 
        starter.toLowerCase().includes('suppose')) {
      score += 15;
    }
    
    // Action-oriented starters
    if (starter.toLowerCase().includes('help') || 
        starter.toLowerCase().includes('show') || 
        starter.toLowerCase().includes('explain')) {
      score += 10;
    }
    
    // Too generic
    if (starter.toLowerCase().includes('hello') || 
        starter.toLowerCase().includes('hi') ||
        starter.length < 10) {
      score -= 20;
    }
    
    // Good length (not too short, not too long)
    if (starter.length >= 20 && starter.length <= 100) {
      score += 10;
    } else if (starter.length > 150) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall scores
   */
  private calculateOverallScores(
    contentAnalysis: ContentAnalysis,
    instructionAnalysis: InstructionAnalysis,
    conversationStarterAnalysis?: NonNullable<GPTAnalysisReport['conversation_starter_analysis']>
  ): GPTAnalysisReport['overall_scores'] {
    // Educational effectiveness
    const educationalEffectiveness = Math.round(
      (contentAnalysis.engagement_score * 0.3 +
       contentAnalysis.clarity_score * 0.2 +
       (instructionAnalysis.educational_elements.socratic_questioning_present ? 15 : 0) +
       (instructionAnalysis.educational_elements.scaffolding_instructions ? 15 : 0) +
       (instructionAnalysis.educational_elements.feedback_mechanisms ? 10 : 0) +
       (instructionAnalysis.educational_elements.adaptive_difficulty_guidance ? 10 : 0)) * 0.5
    );

    // Instruction clarity
    const instructionClarity = Math.round(
      (instructionAnalysis.structure.complexity_score * 0.3 +
       instructionAnalysis.effectiveness_indicators.user_guidance_quality * 0.4 +
       (instructionAnalysis.structure.has_clear_role_definition ? 15 : 0) +
       (instructionAnalysis.structure.has_specific_guidelines ? 15 : 0)) * 0.3
    );

    // Philosophy alignment
    const philosophyAlignment = Math.round(contentAnalysis.philosophy_alignment);

    // User engagement potential
    let engagementPotential = Math.round(
      (contentAnalysis.engagement_score * 0.4 +
       instructionAnalysis.effectiveness_indicators.adaptability_score * 0.3 +
       (instructionAnalysis.communication_style.personalization_level === 'highly_personalized' ? 20 :
        instructionAnalysis.communication_style.personalization_level === 'moderate' ? 10 : 0) +
       instructionAnalysis.communication_style.interaction_patterns.length * 5) * 0.3
    );

    if (conversationStarterAnalysis) {
      engagementPotential += conversationStarterAnalysis.engagement_potential * 0.2;
      engagementPotential = Math.min(100, engagementPotential);
    }

    // Adaptability
    const adaptability = Math.round(
      instructionAnalysis.effectiveness_indicators.adaptability_score * 0.6 +
      (instructionAnalysis.educational_elements.adaptive_difficulty_guidance ? 20 : 0) +
      (instructionAnalysis.educational_elements.feedback_mechanisms ? 20 : 0)
    );

    return {
      educational_effectiveness: Math.min(100, Math.max(0, educationalEffectiveness)),
      instruction_clarity: Math.min(100, Math.max(0, instructionClarity)),
      philosophy_alignment: philosophyAlignment,
      user_engagement_potential: Math.min(100, Math.max(0, Math.round(engagementPotential))),
      adaptability: Math.min(100, Math.max(0, adaptability))
    };
  }

  /**
   * Generate improvement suggestions
   */
  private async generateImprovementSuggestions(
    gptConfig: GPTConfiguration,
    contentAnalysis: ContentAnalysis,
    instructionAnalysis: InstructionAnalysis
  ): Promise<GPTImprovementSuggestion[]> {
    const suggestions: GPTImprovementSuggestion[] = [];

    // Structure improvements
    if (!instructionAnalysis.structure.has_clear_role_definition) {
      suggestions.push({
        category: 'structure',
        priority: 'high',
        current_issue: 'Instructions lack clear role definition',
        suggested_improvement: 'Add explicit role definition at the beginning',
        implementation_example: 'You are an expert educational tutor specializing in [subject]. Your role is to guide learners through complex concepts using Socratic questioning and building knowledge from the ground up.',
        expected_benefits: ['Clearer AI behavior', 'More consistent responses', 'Better user expectations'],
        philosophy_rationale: 'Clear roles support structured, predictable learning experiences'
      });
    }

    if (!instructionAnalysis.structure.has_example_interactions) {
      suggestions.push({
        category: 'structure',
        priority: 'medium',
        current_issue: 'No example interactions provided',
        suggested_improvement: 'Include example question-answer patterns',
        implementation_example: 'Example interaction: User: "I don\'t understand X" → You: "What do you think might happen if we tried Y? Let\'s explore this step by step..."',
        expected_benefits: ['More consistent interaction patterns', 'Better response quality', 'Clearer expectations'],
        philosophy_rationale: 'Examples demonstrate the Socratic approach in action'
      });
    }

    // Educational improvements
    if (!instructionAnalysis.educational_elements.socratic_questioning_present) {
      suggestions.push({
        category: 'education',
        priority: 'critical',
        current_issue: 'No Socratic questioning guidance',
        suggested_improvement: 'Add explicit instructions for discovery-based questioning',
        implementation_example: 'Instead of directly answering, guide users to discover answers through questions like: "What do you think would happen if...?", "How might this relate to...?", "What patterns do you notice...?"',
        expected_benefits: ['Enhanced critical thinking', 'Deeper learning', 'Better engagement'],
        philosophy_rationale: 'Core to the Socratic teaching methodology - helps users discover knowledge rather than passively receive it'
      });
    }

    if (!instructionAnalysis.educational_elements.scaffolding_instructions) {
      suggestions.push({
        category: 'education',
        priority: 'high',
        current_issue: 'No scaffolding or progressive difficulty guidance',
        suggested_improvement: 'Add instructions for building complexity progressively',
        implementation_example: 'Start with basic concepts and gradually increase complexity. Check understanding before moving to the next level. Use phrases like: "Now that you understand X, let\'s build on that with Y..."',
        expected_benefits: ['Better knowledge retention', 'Reduced cognitive overload', 'More successful learning outcomes'],
        philosophy_rationale: 'Supports ground-up building methodology for solid understanding'
      });
    }

    // Interaction improvements
    if (instructionAnalysis.communication_style.personalization_level === 'generic') {
      suggestions.push({
        category: 'interaction',
        priority: 'medium',
        current_issue: 'Limited personalization guidance',
        suggested_improvement: 'Add instructions for personalizing responses',
        implementation_example: 'Ask about the user\'s background, interests, and learning goals. Adapt examples and explanations to their context. Use phrases like: "Given your interest in [topic], you might find this connection interesting..."',
        expected_benefits: ['Increased engagement', 'Better relevance', 'Improved learning outcomes'],
        philosophy_rationale: 'Personalized learning increases motivation and retention'
      });
    }

    // Philosophy alignment improvements
    if (!instructionAnalysis.philosophy_alignment.jargon_minimization) {
      suggestions.push({
        category: 'philosophy',
        priority: 'high',
        current_issue: 'No explicit jargon minimization guidance',
        suggested_improvement: 'Add clear instructions to avoid jargon and explain technical terms',
        implementation_example: 'Always use simple, clear language. When technical terms are necessary, explain them immediately: "This is called X, which simply means..." Avoid jargon unless essential, and always provide simple explanations.',
        expected_benefits: ['Better comprehension', 'Increased accessibility', 'Reduced intimidation'],
        philosophy_rationale: 'Minimal jargon approach makes learning accessible to all levels'
      });
    }

    if (!instructionAnalysis.philosophy_alignment.real_world_connections) {
      suggestions.push({
        category: 'philosophy',
        priority: 'medium',
        current_issue: 'No guidance for real-world applications',
        suggested_improvement: 'Add instructions to connect concepts to real-world examples',
        implementation_example: 'Always relate abstract concepts to everyday experiences. Use analogies and real-world examples: "This is like when you...", "You can see this in action when...", "Imagine you\'re..."',
        expected_benefits: ['Better understanding', 'Increased relevance', 'Improved retention'],
        philosophy_rationale: 'Real-world connections make learning meaningful and memorable'
      });
    }

    // Effectiveness improvements
    if (!instructionAnalysis.effectiveness_indicators.error_handling_guidance) {
      suggestions.push({
        category: 'effectiveness',
        priority: 'medium',
        current_issue: 'No error handling or misconception guidance',
        suggested_improvement: 'Add instructions for handling mistakes and misconceptions',
        implementation_example: 'When users make mistakes, don\'t just correct them. Ask questions to help them discover the error: "That\'s an interesting idea. What do you think might happen if we test that assumption?" Be encouraging and frame mistakes as learning opportunities.',
        expected_benefits: ['Better error recovery', 'Maintained user confidence', 'Deeper understanding'],
        philosophy_rationale: 'Mistakes are valuable learning opportunities when handled constructively'
      });
    }

    return suggestions;
  }

  /**
   * Create enhanced instructions
   */
  private async createEnhancedInstructions(
    gptConfig: GPTConfiguration,
    suggestions: GPTImprovementSuggestion[]
  ): Promise<GPTAnalysisReport['enhanced_instructions']> {
    const philosophy = this.philosophyAnalyzer.getPhilosophy();
    
    // Create optimized system prompt
    let optimizedPrompt = gptConfig.instructions;
    
    // Apply critical and high-priority suggestions
    const highPrioritySuggestions = suggestions.filter(s => 
      s.priority === 'critical' || s.priority === 'high'
    );

    // Build enhanced prompt based on suggestions
    const enhancements: string[] = [];
    
    highPrioritySuggestions.forEach(suggestion => {
      enhancements.push(`\n# ${suggestion.category.toUpperCase()} ENHANCEMENT:`);
      enhancements.push(suggestion.implementation_example);
    });

    if (enhancements.length > 0) {
      optimizedPrompt += '\n\n' + enhancements.join('\n');
    }

    // Generate improved conversation starters
    const improvedStarters = this.generateImprovedConversationStarters(
      gptConfig.name,
      philosophy
    );

    // Create additional guidelines
    const additionalGuidelines = [
      'Always ask clarifying questions to understand the user\'s level and needs',
      'Use the Socratic method: guide discovery rather than providing direct answers',
      'Build complexity progressively from basic concepts',
      'Provide real-world examples and analogies',
      'Encourage reflection with questions like "What do you think?" and "Why might this be?"',
      'Celebrate insights and learning progress',
      'When correcting mistakes, help users discover the error through questioning'
    ];

    return {
      optimized_system_prompt: optimizedPrompt,
      improved_conversation_starters: improvedStarters,
      additional_guidelines: additionalGuidelines
    };
  }

  private generateImprovedConversationStarters(
    gptName: string,
    philosophy: any
  ): string[] {
    const baseStarters = [
      'What specific challenge or question brought you here today?',
      'Tell me about your current understanding of [topic] - what makes sense and what feels unclear?',
      'What would you like to be able to do or understand by the end of our conversation?',
      'Have you encountered [topic] before? What was your experience like?'
    ];

    // Add philosophy-aligned starters
    if (philosophy?.teaching_style.socratic_questioning) {
      baseStarters.push(
        'What do you think is the most important question we should explore about [topic]?',
        'If you had to explain [topic] to a friend, what would you say? What questions might they ask?'
      );
    }

    if (philosophy?.teaching_style.building_methodology === 'ground_up') {
      baseStarters.push(
        'Let\'s start with the fundamentals - what do you already know about the basics of [topic]?',
        'What foundation concepts do you feel confident about, and where would you like to build from there?'
      );
    }

    return baseStarters;
  }

  /**
   * Analyze patterns across multiple GPTs
   */
  private analyzeCollectionPatterns(reports: GPTAnalysisReport[]) {
    const consistency = this.calculateConsistency(reports);
    const commonStrengths = this.findCommonStrengths(reports);
    const recurringWeaknesses = this.findRecurringWeaknesses(reports);
    const philosophyEvolution = this.trackPhilosophyEvolution(reports);
    const bestPerforming = this.identifyBestPerformingGPTs(reports);
    const optimizationPriorities = this.calculateOptimizationPriorities(reports);

    return {
      consistency_across_gpts: consistency,
      common_strengths: commonStrengths,
      recurring_weaknesses: recurringWeaknesses,
      philosophy_evolution: philosophyEvolution,
      best_performing_gpts: bestPerforming,
      optimization_priorities: optimizationPriorities
    };
  }

  private calculateConsistency(reports: GPTAnalysisReport[]): number {
    if (reports.length < 2) return 100;

    // Calculate variance in philosophy alignment scores
    const alignmentScores = reports.map(r => r.overall_scores.philosophy_alignment);
    const avgAlignment = alignmentScores.reduce((sum, score) => sum + score, 0) / alignmentScores.length;
    
    const variance = alignmentScores.reduce((sum, score) => 
      sum + Math.pow(score - avgAlignment, 2), 0) / alignmentScores.length;
    
    return Math.max(0, 100 - variance);
  }

  private findCommonStrengths(reports: GPTAnalysisReport[]): string[] {
    const strengthCounts = new Map<string, number>();
    
    reports.forEach(report => {
      report.content_analysis.strengths.forEach(strength => {
        strengthCounts.set(strength, (strengthCounts.get(strength) || 0) + 1);
      });
    });

    return Array.from(strengthCounts.entries())
      .filter(([_, count]) => count >= reports.length * 0.5)
      .map(([strength, _]) => strength);
  }

  private findRecurringWeaknesses(reports: GPTAnalysisReport[]): string[] {
    const weaknessCounts = new Map<string, number>();
    
    reports.forEach(report => {
      report.improvement_suggestions.forEach(suggestion => {
        weaknessCounts.set(suggestion.current_issue, (weaknessCounts.get(suggestion.current_issue) || 0) + 1);
      });
    });

    return Array.from(weaknessCounts.entries())
      .filter(([_, count]) => count >= reports.length * 0.3)
      .sort((a, b) => b[1] - a[1])
      .map(([weakness, _]) => weakness)
      .slice(0, 5);
  }

  private trackPhilosophyEvolution(reports: GPTAnalysisReport[]): string[] {
    // This would track how philosophy alignment changes over time
    // For now, return general observations
    return [
      'Philosophy alignment varies across GPT configurations',
      'Socratic questioning implementation needs improvement',
      'Real-world connection guidance could be strengthened'
    ];
  }

  private identifyBestPerformingGPTs(reports: GPTAnalysisReport[]): string[] {
    return reports
      .sort((a, b) => {
        const scoreA = (a.overall_scores.educational_effectiveness + 
                       a.overall_scores.philosophy_alignment + 
                       a.overall_scores.user_engagement_potential) / 3;
        const scoreB = (b.overall_scores.educational_effectiveness + 
                       b.overall_scores.philosophy_alignment + 
                       b.overall_scores.user_engagement_potential) / 3;
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(report => report.gpt_name);
  }

  private calculateOptimizationPriorities(reports: GPTAnalysisReport[]): string[] {
    const priorityCounts = new Map<string, number>();
    
    reports.forEach(report => {
      report.improvement_suggestions.forEach(suggestion => {
        const priority = `${suggestion.category}_improvements`;
        priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);
      });
    });

    return Array.from(priorityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([priority, _]) => priority)
      .slice(0, 5);
  }

  /**
   * Create optimized GPT configuration
   */
  async createOptimizedGPT(
    originalGPT: GPTConfiguration,
    analysisReport: GPTAnalysisReport
  ): Promise<GPTConfiguration> {
    logger.info(`Creating optimized version of GPT: ${originalGPT.name}`);

    const optimizedGPT: GPTConfiguration = {
      ...originalGPT,
      id: `${originalGPT.id}_optimized`,
      name: `${originalGPT.name} - Enhanced`,
      instructions: analysisReport.enhanced_instructions.optimized_system_prompt,
      conversation_starters: analysisReport.enhanced_instructions.improved_conversation_starters,
      updated_at: new Date().toISOString()
    };

    return optimizedGPT;
  }
}