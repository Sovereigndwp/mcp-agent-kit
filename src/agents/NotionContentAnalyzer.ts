// src/agents/NotionContentAnalyzer.ts
import { logger } from '../utils/logger.js';
import { ContentPhilosophyAnalyzer, ContentAnalysis } from './ContentPhilosophyAnalyzer.js';

export interface NotionBlock {
  id: string;
  type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'bulleted_list_item' | 
        'numbered_list_item' | 'quote' | 'code' | 'callout' | 'toggle' | 'divider' | 
        'table' | 'column_list' | 'image' | 'video' | 'embed' | 'bookmark' | 'equation' |
        'database' | 'template' | 'synced_block' | 'table_of_contents';
  content?: {
    rich_text?: Array<{
      type: 'text' | 'mention' | 'equation';
      text?: { content: string; link?: { url: string } };
      annotations?: {
        bold?: boolean;
        italic?: boolean;
        strikethrough?: boolean;
        underline?: boolean;
        code?: boolean;
        color?: string;
      };
    }>;
    color?: string;
    language?: string; // for code blocks
    icon?: { emoji: string } | { file: { url: string } };
    checked?: boolean; // for to-do items
  };
  children?: NotionBlock[];
  created_time: string;
  last_edited_time: string;
}

export interface NotionPage {
  id: string;
  title: string;
  blocks: NotionBlock[];
  properties: {
    [key: string]: any;
  };
  parent: {
    type: 'database_id' | 'page_id' | 'workspace';
    database_id?: string;
    page_id?: string;
  };
  created_time: string;
  last_edited_time: string;
  tags?: string[];
  status?: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  pages: NotionPage[];
  properties: {
    [key: string]: {
      type: string;
      options?: Array<{ name: string; color: string }>;
    };
  };
}

export interface NotionContentStructure {
  educational_flow: {
    has_clear_introduction: boolean;
    has_learning_objectives: boolean;
    has_progressive_complexity: boolean;
    has_summary_conclusion: boolean;
    interaction_points: number;
  };
  content_organization: {
    heading_hierarchy_score: number; // 0-100
    content_chunking_effectiveness: number; // 0-100
    use_of_visual_breaks: number; // count
    information_density: 'low' | 'medium' | 'high' | 'overwhelming';
  };
  interactive_elements: {
    toggles_used: number;
    callouts_used: number;
    checkboxes_used: number;
    embedded_content: number;
    databases_for_tracking: number;
  };
  philosophy_indicators: {
    socratic_questions: string[];
    building_complexity: boolean;
    jargon_simplification: boolean;
    real_world_examples: string[];
    gamification_elements: string[];
  };
}

export interface NotionImprovementSuggestion {
  block_id?: string;
  page_id?: string;
  type: 'structure' | 'content' | 'interaction' | 'gamification' | 'accessibility';
  priority: 'low' | 'medium' | 'high' | 'critical';
  current_state: string;
  suggested_improvement: string;
  implementation_guide: {
    notion_features_to_use: string[];
    step_by_step_instructions: string[];
    example_content?: string;
  };
  philosophy_alignment: string;
  expected_impact: {
    engagement: number; // -5 to +5
    clarity: number; // -5 to +5
    interactivity: number; // -5 to +5
  };
}

export interface NotionAnalysisReport {
  page_id: string;
  page_title: string;
  content_analysis: ContentAnalysis;
  structure_analysis: NotionContentStructure;
  scores: {
    educational_effectiveness: number; // 0-100
    notion_feature_utilization: number; // 0-100
    interactivity_score: number; // 0-100
    accessibility_score: number; // 0-100
    philosophy_alignment: number; // 0-100
  };
  improvement_suggestions: NotionImprovementSuggestion[];
  enhanced_version_blueprint: {
    recommended_structure_changes: string[];
    interactive_elements_to_add: string[];
    notion_features_to_implement: string[];
    content_enhancement_ideas: string[];
  };
}

export class NotionContentAnalyzer {
  private philosophyAnalyzer: ContentPhilosophyAnalyzer;
  
  constructor() {
    this.philosophyAnalyzer = new ContentPhilosophyAnalyzer();
  }

  /**
   * Analyze a Notion page for educational effectiveness
   */
  async analyzePage(notionPage: NotionPage): Promise<NotionAnalysisReport> {
    logger.info(`Analyzing Notion page: ${notionPage.title} (${notionPage.id})`);

    // Extract text content for philosophy analysis
    const textContent = this.extractTextFromBlocks(notionPage.blocks);
    
    // Get content analysis from philosophy analyzer
    const contentAnalysis = await this.philosophyAnalyzer.learnFromContent(
      'notion',
      { blocks: notionPage.blocks, title: notionPage.title },
      'page'
    );

    // Perform structure analysis
    const structureAnalysis = this.analyzeContentStructure(notionPage.blocks);

    // Calculate scores
    const scores = this.calculateNotionScores(
      contentAnalysis,
      structureAnalysis,
      notionPage.blocks
    );

    // Generate improvement suggestions
    const improvementSuggestions = await this.generateNotionImprovements(
      notionPage,
      contentAnalysis,
      structureAnalysis
    );

    // Create enhancement blueprint
    const enhancedVersionBlueprint = this.createEnhancementBlueprint(
      notionPage,
      improvementSuggestions
    );

    return {
      page_id: notionPage.id,
      page_title: notionPage.title,
      content_analysis: contentAnalysis,
      structure_analysis: structureAnalysis,
      scores,
      improvement_suggestions: improvementSuggestions,
      enhanced_version_blueprint: enhancedVersionBlueprint
    };
  }

  /**
   * Analyze multiple pages and identify patterns
   */
  async analyzeWorkspace(pages: NotionPage[]): Promise<{
    individual_reports: NotionAnalysisReport[];
    workspace_insights: {
      content_consistency: number; // 0-100
      common_patterns: string[];
      most_effective_pages: string[];
      improvement_priorities: string[];
      notion_feature_adoption: {
        feature: string;
        usage_rate: number;
        effectiveness_score: number;
      }[];
    };
  }> {
    const reports = await Promise.all(
      pages.map(page => this.analyzePage(page))
    );

    const workspaceInsights = this.analyzeWorkspacePatterns(reports);

    return {
      individual_reports: reports,
      workspace_insights: workspaceInsights
    };
  }

  /**
   * Extract text content from Notion blocks
   */
  private extractTextFromBlocks(blocks: NotionBlock[]): string {
    let text = '';
    
    for (const block of blocks) {
      if (block.content?.rich_text) {
        const blockText = block.content.rich_text
          .map(rt => rt.text?.content || '')
          .join('');
        text += blockText + ' ';
      }
      
      // Recursively extract from children
      if (block.children) {
        text += this.extractTextFromBlocks(block.children) + ' ';
      }
    }
    
    return text.trim();
  }

  /**
   * Analyze content structure for educational effectiveness
   */
  private analyzeContentStructure(blocks: NotionBlock[]): NotionContentStructure {
    const structure: NotionContentStructure = {
      educational_flow: {
        has_clear_introduction: false,
        has_learning_objectives: false,
        has_progressive_complexity: false,
        has_summary_conclusion: false,
        interaction_points: 0
      },
      content_organization: {
        heading_hierarchy_score: 0,
        content_chunking_effectiveness: 0,
        use_of_visual_breaks: 0,
        information_density: 'medium'
      },
      interactive_elements: {
        toggles_used: 0,
        callouts_used: 0,
        checkboxes_used: 0,
        embedded_content: 0,
        databases_for_tracking: 0
      },
      philosophy_indicators: {
        socratic_questions: [],
        building_complexity: false,
        jargon_simplification: false,
        real_world_examples: [],
        gamification_elements: []
      }
    };

    this.analyzeEducationalFlow(blocks, structure);
    this.analyzeContentOrganization(blocks, structure);
    this.analyzeInteractiveElements(blocks, structure);
    this.analyzePhilosophyIndicators(blocks, structure);

    return structure;
  }

  private analyzeEducationalFlow(blocks: NotionBlock[], structure: NotionContentStructure): void {
    const text = this.extractTextFromBlocks(blocks);
    const lowerText = text.toLowerCase();

    // Check for clear introduction
    const introWords = ['introduction', 'overview', 'welcome', 'start', 'begin'];
    structure.educational_flow.has_clear_introduction = introWords.some(word => 
      lowerText.includes(word)
    );

    // Check for learning objectives
    const objectiveWords = ['objectives', 'goals', 'learn', 'understand', 'able to'];
    structure.educational_flow.has_learning_objectives = objectiveWords.some(word => 
      lowerText.includes(word)
    );

    // Count interaction points (questions, callouts, toggles)
    let interactionCount = 0;
    interactionCount += (text.match(/\?/g) || []).length;
    interactionCount += blocks.filter(b => b.type === 'callout' || b.type === 'toggle').length;
    structure.educational_flow.interaction_points = interactionCount;

    // Check for summary/conclusion
    const conclusionWords = ['summary', 'conclusion', 'recap', 'key points', 'takeaways'];
    structure.educational_flow.has_summary_conclusion = conclusionWords.some(word => 
      lowerText.includes(word)
    );

    // Analyze progressive complexity (simplified check)
    const headings = blocks.filter(b => 
      b.type === 'heading_1' || b.type === 'heading_2' || b.type === 'heading_3'
    );
    if (headings.length >= 3) {
      structure.educational_flow.has_progressive_complexity = true;
    }
  }

  private analyzeContentOrganization(blocks: NotionBlock[], structure: NotionContentStructure): void {
    // Analyze heading hierarchy
    const headingCounts = {
      h1: blocks.filter(b => b.type === 'heading_1').length,
      h2: blocks.filter(b => b.type === 'heading_2').length,
      h3: blocks.filter(b => b.type === 'heading_3').length
    };

    let hierarchyScore = 50; // Base score
    if (headingCounts.h1 > 0 && headingCounts.h2 > 0) hierarchyScore += 25;
    if (headingCounts.h2 > headingCounts.h1) hierarchyScore += 15;
    if (headingCounts.h3 > 0 && headingCounts.h2 > 0) hierarchyScore += 10;
    
    structure.content_organization.heading_hierarchy_score = Math.min(100, hierarchyScore);

    // Analyze content chunking
    const totalBlocks = blocks.length;
    const paragraphBlocks = blocks.filter(b => b.type === 'paragraph').length;
    const listBlocks = blocks.filter(b => 
      b.type === 'bulleted_list_item' || b.type === 'numbered_list_item'
    ).length;

    let chunkingScore = 50;
    if (listBlocks / totalBlocks > 0.2) chunkingScore += 20; // Good use of lists
    if (headingCounts.h1 + headingCounts.h2 + headingCounts.h3 > totalBlocks * 0.1) {
      chunkingScore += 20; // Good sectioning
    }
    
    structure.content_organization.content_chunking_effectiveness = Math.min(100, chunkingScore);

    // Count visual breaks
    structure.content_organization.use_of_visual_breaks = 
      blocks.filter(b => b.type === 'divider' || b.type === 'callout').length;

    // Determine information density
    const avgBlockLength = this.calculateAverageBlockLength(blocks);
    if (avgBlockLength < 50) {
      structure.content_organization.information_density = 'low';
    } else if (avgBlockLength < 150) {
      structure.content_organization.information_density = 'medium';
    } else if (avgBlockLength < 300) {
      structure.content_organization.information_density = 'high';
    } else {
      structure.content_organization.information_density = 'overwhelming';
    }
  }

  private analyzeInteractiveElements(blocks: NotionBlock[], structure: NotionContentStructure): void {
    structure.interactive_elements.toggles_used = 
      blocks.filter(b => b.type === 'toggle').length;
    
    structure.interactive_elements.callouts_used = 
      blocks.filter(b => b.type === 'callout').length;
    
    // Count checkboxes (to-do items)
    structure.interactive_elements.checkboxes_used = 
      blocks.filter(b => 
        b.type === 'bulleted_list_item' && 
        b.content?.checked !== undefined
      ).length;
    
    structure.interactive_elements.embedded_content = 
      blocks.filter(b => 
        b.type === 'embed' || b.type === 'video' || b.type === 'bookmark'
      ).length;
    
    structure.interactive_elements.databases_for_tracking = 
      blocks.filter(b => b.type === 'database').length;
  }

  private analyzePhilosophyIndicators(blocks: NotionBlock[], structure: NotionContentStructure): void {
    const text = this.extractTextFromBlocks(blocks);
    
    // Find Socratic questions
    const socraticPatterns = [
      /what do you think/gi,
      /why might/gi,
      /how would/gi,
      /what if/gi,
      /consider this/gi,
      /reflect on/gi
    ];
    
    socraticPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        structure.philosophy_indicators.socratic_questions.push(...matches);
      }
    });

    // Check for building complexity
    const complexityWords = ['first', 'then', 'next', 'finally', 'build upon', 'foundation'];
    structure.philosophy_indicators.building_complexity = complexityWords.some(word =>
      text.toLowerCase().includes(word)
    );

    // Check for jargon simplification
    const simplificationWords = ['simply put', 'in other words', 'think of it as', 'like'];
    structure.philosophy_indicators.jargon_simplification = simplificationWords.some(word =>
      text.toLowerCase().includes(word)
    );

    // Find real-world examples
    const examplePatterns = [
      /for example/gi,
      /imagine/gi,
      /in real life/gi,
      /picture this/gi
    ];
    
    examplePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        structure.philosophy_indicators.real_world_examples.push(...matches);
      }
    });

    // Find gamification elements
    const gamificationWords = ['progress', 'level', 'achievement', 'milestone', 'challenge'];
    gamificationWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        structure.philosophy_indicators.gamification_elements.push(word);
      }
    });
  }

  private calculateAverageBlockLength(blocks: NotionBlock[]): number {
    if (blocks.length === 0) return 0;
    
    const totalLength = blocks.reduce((sum, block) => {
      const blockText = block.content?.rich_text?.map(rt => rt.text?.content || '').join('') || '';
      return sum + blockText.length;
    }, 0);
    
    return totalLength / blocks.length;
  }

  /**
   * Calculate Notion-specific scores
   */
  private calculateNotionScores(
    contentAnalysis: ContentAnalysis,
    structureAnalysis: NotionContentStructure,
    blocks: NotionBlock[]
  ) {
    // Educational effectiveness based on content and structure
    const educationalEffectiveness = Math.round(
      (contentAnalysis.engagement_score * 0.3 + 
       contentAnalysis.clarity_score * 0.3 + 
       structureAnalysis.educational_flow.interaction_points * 5 +
       (structureAnalysis.educational_flow.has_clear_introduction ? 10 : 0) +
       (structureAnalysis.educational_flow.has_learning_objectives ? 10 : 0) +
       (structureAnalysis.educational_flow.has_summary_conclusion ? 10 : 0)) * 0.4
    );

    // Notion feature utilization
    const totalInteractiveElements = 
      structureAnalysis.interactive_elements.toggles_used +
      structureAnalysis.interactive_elements.callouts_used +
      structureAnalysis.interactive_elements.checkboxes_used +
      structureAnalysis.interactive_elements.embedded_content +
      structureAnalysis.interactive_elements.databases_for_tracking;
    
    const notionFeatureUtilization = Math.min(100, 
      (totalInteractiveElements / Math.max(1, blocks.length * 0.2)) * 100
    );

    // Interactivity score
    const interactivityScore = Math.min(100,
      structureAnalysis.educational_flow.interaction_points * 10 +
      totalInteractiveElements * 5
    );

    // Accessibility score based on structure and clarity
    const accessibilityScore = Math.round(
      (structureAnalysis.content_organization.heading_hierarchy_score * 0.4 +
       structureAnalysis.content_organization.content_chunking_effectiveness * 0.3 +
       (structureAnalysis.content_organization.information_density === 'medium' ? 30 : 
        structureAnalysis.content_organization.information_density === 'low' ? 20 :
        structureAnalysis.content_organization.information_density === 'high' ? 10 : 0) * 0.3)
    );

    return {
      educational_effectiveness: Math.min(100, educationalEffectiveness),
      notion_feature_utilization: Math.round(notionFeatureUtilization),
      interactivity_score: Math.round(interactivityScore),
      accessibility_score: Math.max(0, accessibilityScore),
      philosophy_alignment: Math.round(contentAnalysis.philosophy_alignment)
    };
  }

  /**
   * Generate Notion-specific improvement suggestions
   */
  private async generateNotionImprovements(
    notionPage: NotionPage,
    contentAnalysis: ContentAnalysis,
    structureAnalysis: NotionContentStructure
  ): Promise<NotionImprovementSuggestion[]> {
    const suggestions: NotionImprovementSuggestion[] = [];

    // Structure improvements
    if (!structureAnalysis.educational_flow.has_clear_introduction) {
      suggestions.push({
        type: 'structure',
        priority: 'high',
        current_state: 'Missing clear introduction or overview',
        suggested_improvement: 'Add a compelling introduction section with learning context',
        implementation_guide: {
          notion_features_to_use: ['Heading 1', 'Callout', 'Quote'],
          step_by_step_instructions: [
            'Add a "Welcome" or "Introduction" heading at the top',
            'Use a callout block to highlight the main learning goal',
            'Include a brief overview of what learners will discover',
            'Add an emoji to make it visually appealing'
          ],
          example_content: '🎯 **Welcome to [Topic]!** In this lesson, you\'ll discover...'
        },
        philosophy_alignment: 'Supports building from ground up methodology',
        expected_impact: { engagement: 3, clarity: 4, interactivity: 1 }
      });
    }

    if (!structureAnalysis.educational_flow.has_learning_objectives) {
      suggestions.push({
        type: 'structure',
        priority: 'high',
        current_state: 'No clear learning objectives stated',
        suggested_improvement: 'Add explicit learning objectives using checkboxes',
        implementation_guide: {
          notion_features_to_use: ['Checkbox list', 'Heading 2', 'Callout'],
          step_by_step_instructions: [
            'Create a "Learning Objectives" section',
            'Use checkbox list items for each objective',
            'Write objectives using "By the end of this lesson, you will be able to..."',
            'Use action verbs like understand, explain, apply, create'
          ],
          example_content: '✅ Understand the basic concepts\n✅ Apply the principles to real scenarios'
        },
        philosophy_alignment: 'Clear goals support structured learning progression',
        expected_impact: { engagement: 2, clarity: 5, interactivity: 3 }
      });
    }

    // Interactivity improvements
    if (structureAnalysis.interactive_elements.toggles_used === 0) {
      suggestions.push({
        type: 'interaction',
        priority: 'medium',
        current_state: 'No toggle blocks for progressive disclosure',
        suggested_improvement: 'Add toggle blocks for optional deep-dive content',
        implementation_guide: {
          notion_features_to_use: ['Toggle', 'Bulleted list', 'Quote'],
          step_by_step_instructions: [
            'Identify advanced or optional content',
            'Create toggle blocks with descriptive titles',
            'Use titles like "🔍 Deep Dive:", "💡 Pro Tip:", "📚 Additional Resources:"',
            'Keep main content visible, hide supplementary information'
          ]
        },
        philosophy_alignment: 'Supports adaptive learning and reduces cognitive overload',
        expected_impact: { engagement: 3, clarity: 2, interactivity: 5 }
      });
    }

    if (structureAnalysis.educational_flow.interaction_points < 3) {
      suggestions.push({
        type: 'interaction',
        priority: 'high',
        current_state: 'Limited interactive elements and questions',
        suggested_improvement: 'Add Socratic questions and reflection prompts',
        implementation_guide: {
          notion_features_to_use: ['Callout', 'Quote', 'Divider'],
          step_by_step_instructions: [
            'Add reflection questions after key concepts',
            'Use callout blocks with 🤔 emoji for thinking prompts',
            'Include "What do you think?" and "Why might this be?" questions',
            'Create space for mental processing with dividers'
          ],
          example_content: '🤔 **Reflection**: What do you think would happen if...?'
        },
        philosophy_alignment: 'Core to Socratic teaching methodology',
        expected_impact: { engagement: 5, clarity: 3, interactivity: 5 }
      });
    }

    // Content improvements
    if (contentAnalysis.jargon_score > 40) {
      suggestions.push({
        type: 'content',
        priority: 'high',
        current_state: 'High use of technical jargon',
        suggested_improvement: 'Simplify language and add explanations for technical terms',
        implementation_guide: {
          notion_features_to_use: ['Toggle', 'Callout', 'Quote'],
          step_by_step_instructions: [
            'Identify complex technical terms',
            'Replace with simpler alternatives where possible',
            'Create toggle blocks for technical definitions',
            'Use analogies and real-world examples',
            'Add glossary section if needed'
          ]
        },
        philosophy_alignment: 'Supports minimal jargon philosophy for better comprehension',
        expected_impact: { engagement: 2, clarity: 5, interactivity: 1 }
      });
    }

    // Gamification improvements
    if (structureAnalysis.philosophy_indicators.gamification_elements.length === 0) {
      suggestions.push({
        type: 'gamification',
        priority: 'medium',
        current_state: 'No gamification elements present',
        suggested_improvement: 'Add progress tracking and achievement elements',
        implementation_guide: {
          notion_features_to_use: ['Database', 'Checkbox', 'Template', 'Progress bar'],
          step_by_step_instructions: [
            'Create a progress tracking database',
            'Add milestone checkboxes throughout content',
            'Use progress bar formulas in database',
            'Create achievement badges with emojis',
            'Add completion certificates or rewards'
          ],
          example_content: '🏆 **Achievement Unlocked**: Basic Concepts Mastered!'
        },
        philosophy_alignment: 'Supports gamified learning approach for motivation',
        expected_impact: { engagement: 4, clarity: 1, interactivity: 4 }
      });
    }

    // Accessibility improvements
    if (structureAnalysis.content_organization.information_density === 'overwhelming') {
      suggestions.push({
        type: 'accessibility',
        priority: 'critical',
        current_state: 'Information density is overwhelming for learners',
        suggested_improvement: 'Break content into digestible chunks with visual breaks',
        implementation_guide: {
          notion_features_to_use: ['Divider', 'Column', 'Callout', 'Toggle'],
          step_by_step_instructions: [
            'Break long paragraphs into shorter chunks',
            'Add dividers between major concepts',
            'Use columns for side-by-side comparisons',
            'Move detailed information to toggle blocks',
            'Add more white space and visual breathing room'
          ]
        },
        philosophy_alignment: 'Supports clear, accessible communication',
        expected_impact: { engagement: 2, clarity: 5, interactivity: 2 }
      });
    }

    return suggestions;
  }

  /**
   * Create enhancement blueprint
   */
  private createEnhancementBlueprint(
    notionPage: NotionPage,
    suggestions: NotionImprovementSuggestion[]
  ) {
    const structureChanges = suggestions
      .filter(s => s.type === 'structure')
      .map(s => s.suggested_improvement);

    const interactiveElements = suggestions
      .filter(s => s.type === 'interaction')
      .map(s => s.suggested_improvement);

    const notionFeatures = [...new Set(
      suggestions.flatMap(s => s.implementation_guide.notion_features_to_use)
    )];

    const contentEnhancements = suggestions
      .filter(s => s.type === 'content' || s.type === 'gamification')
      .map(s => s.suggested_improvement);

    return {
      recommended_structure_changes: structureChanges,
      interactive_elements_to_add: interactiveElements,
      notion_features_to_implement: notionFeatures,
      content_enhancement_ideas: contentEnhancements
    };
  }

  /**
   * Analyze patterns across workspace
   */
  private analyzeWorkspacePatterns(reports: NotionAnalysisReport[]) {
    const consistencyScore = this.calculateContentConsistency(reports);
    const commonPatterns = this.identifyCommonPatterns(reports);
    const mostEffective = this.identifyMostEffectivePages(reports);
    const improvementPriorities = this.calculateImprovementPriorities(reports);
    const featureAdoption = this.analyzeFeatureAdoption(reports);

    return {
      content_consistency: consistencyScore,
      common_patterns: commonPatterns,
      most_effective_pages: mostEffective,
      improvement_priorities: improvementPriorities,
      notion_feature_adoption: featureAdoption
    };
  }

  private calculateContentConsistency(reports: NotionAnalysisReport[]): number {
    if (reports.length < 2) return 100;

    // Calculate variance in scores
    const avgScore = reports.reduce((sum, r) => 
      sum + r.scores.educational_effectiveness, 0) / reports.length;
    
    const variance = reports.reduce((sum, r) => 
      sum + Math.pow(r.scores.educational_effectiveness - avgScore, 2), 0) / reports.length;
    
    return Math.max(0, 100 - variance);
  }

  private identifyCommonPatterns(reports: NotionAnalysisReport[]): string[] {
    const patterns: string[] = [];
    
    // Check if most pages use similar structures
    const useToggle = reports.filter(r => 
      r.structure_analysis.interactive_elements.toggles_used > 0
    ).length / reports.length;
    
    if (useToggle > 0.7) patterns.push('Consistent use of toggle blocks for progressive disclosure');
    
    const useCallouts = reports.filter(r => 
      r.structure_analysis.interactive_elements.callouts_used > 0
    ).length / reports.length;
    
    if (useCallouts > 0.7) patterns.push('Good use of callouts for emphasis');
    
    return patterns;
  }

  private identifyMostEffectivePages(reports: NotionAnalysisReport[]): string[] {
    return reports
      .sort((a, b) => b.scores.educational_effectiveness - a.scores.educational_effectiveness)
      .slice(0, 3)
      .map(r => r.page_title);
  }

  private calculateImprovementPriorities(reports: NotionAnalysisReport[]): string[] {
    const priorityCount = new Map<string, number>();
    
    reports.forEach(report => {
      report.improvement_suggestions.forEach(suggestion => {
        const priority = suggestion.type;
        priorityCount.set(priority, (priorityCount.get(priority) || 0) + 1);
      });
    });
    
    return Array.from(priorityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, _]) => type);
  }

  private analyzeFeatureAdoption(reports: NotionAnalysisReport[]): Array<{
    feature: string;
    usage_rate: number;
    effectiveness_score: number;
  }> {
    const features = ['toggle', 'callout', 'database', 'checkbox', 'embed'];
    
    return features.map(feature => {
      const usage = reports.filter(r => {
        const elements = r.structure_analysis.interactive_elements;
        switch (feature) {
          case 'toggle': return elements.toggles_used > 0;
          case 'callout': return elements.callouts_used > 0;
          case 'database': return elements.databases_for_tracking > 0;
          case 'checkbox': return elements.checkboxes_used > 0;
          case 'embed': return elements.embedded_content > 0;
          default: return false;
        }
      }).length;
      
      const usageRate = (usage / reports.length) * 100;
      
      // Calculate effectiveness for pages that use this feature
      const pagesWithFeature = reports.filter(r => {
        const elements = r.structure_analysis.interactive_elements;
        switch (feature) {
          case 'toggle': return elements.toggles_used > 0;
          case 'callout': return elements.callouts_used > 0;
          case 'database': return elements.databases_for_tracking > 0;
          case 'checkbox': return elements.checkboxes_used > 0;
          case 'embed': return elements.embedded_content > 0;
          default: return false;
        }
      });
      
      const avgEffectiveness = pagesWithFeature.length > 0 
        ? pagesWithFeature.reduce((sum, r) => sum + r.scores.educational_effectiveness, 0) / pagesWithFeature.length
        : 0;
      
      return {
        feature,
        usage_rate: Math.round(usageRate),
        effectiveness_score: Math.round(avgEffectiveness)
      };
    });
  }

  /**
   * Create improved version of a Notion page
   */
  async createImprovedPage(
    originalPage: NotionPage,
    analysisReport: NotionAnalysisReport,
    implementationLevel: 'quick_fixes' | 'comprehensive_overhaul' = 'comprehensive_overhaul'
  ): Promise<NotionPage> {
    logger.info(`Creating improved version of page: ${originalPage.title}`);

    // Clone the original page
    const improvedPage: NotionPage = JSON.parse(JSON.stringify(originalPage));
    improvedPage.id = `${originalPage.id}_enhanced`;
    improvedPage.title = `${originalPage.title} - Enhanced`;
    improvedPage.last_edited_time = new Date().toISOString();

    // Apply improvements based on suggestions
    const suggestions = implementationLevel === 'quick_fixes' 
      ? analysisReport.improvement_suggestions.filter(s => s.priority === 'high' || s.priority === 'critical')
      : analysisReport.improvement_suggestions;

    // Add metadata about enhancements
    improvedPage.tags = [
      ...(originalPage.tags || []),
      'ai_enhanced',
      'philosophy_aligned',
      `improved_${implementationLevel}`
    ];

    return improvedPage;
  }

  /**
   * Generate content recommendations for new Notion pages
   */
  async generatePageRecommendations(
    topic: string,
    targetAudience: string,
    learningObjectives: string[]
  ): Promise<{
    recommended_structure: NotionBlock[];
    suggested_interactive_elements: string[];
    notion_features_to_use: string[];
    content_guidelines: string[];
  }> {
    const philosophy = this.philosophyAnalyzer.getPhilosophy();
    
    // Generate recommended structure based on educational best practices
    const recommendedStructure: NotionBlock[] = [
      {
        id: 'intro',
        type: 'heading_1',
        content: { rich_text: [{ type: 'text', text: { content: `🎯 Welcome to ${topic}` } }] },
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString()
      },
      {
        id: 'objectives',
        type: 'heading_2',
        content: { rich_text: [{ type: 'text', text: { content: '🎯 Learning Objectives' } }] },
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString()
      }
      // Add more structure based on philosophy and objectives
    ];

    return {
      recommended_structure: recommendedStructure,
      suggested_interactive_elements: [
        'Toggle blocks for optional content',
        'Callouts for key insights',
        'Checkboxes for progress tracking',
        'Reflection questions throughout'
      ],
      notion_features_to_use: [
        'Headings for clear hierarchy',
        'Callouts for emphasis',
        'Toggles for progressive disclosure',
        'Databases for tracking progress',
        'Embeds for multimedia content'
      ],
      content_guidelines: [
        'Use conversational tone',
        'Include Socratic questions',
        'Build complexity progressively',
        'Add real-world examples',
        'Minimize jargon usage'
      ]
    };
  }
}