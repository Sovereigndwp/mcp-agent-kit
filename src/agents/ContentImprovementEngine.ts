// src/agents/ContentImprovementEngine.ts
import { logger } from '../utils/logger.js';
import { ContentPhilosophyAnalyzer, EducationalPhilosophy } from './ContentPhilosophyAnalyzer.js';
import { CanvaDesignAnalyzer, CanvaDesignData, DesignAnalysisReport } from './CanvaDesignAnalyzer.js';
import { NotionContentAnalyzer, NotionPage, NotionAnalysisReport } from './NotionContentAnalyzer.js';
import { GPTInstructionsAnalyzer, GPTConfiguration, GPTAnalysisReport } from './GPTInstructionsAnalyzer.js';
import { cacheStore } from '../utils/kv.js';

export interface ContentSource {
  platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt';
  id: string;
  title: string;
  content: CanvaDesignData | NotionPage | GPTConfiguration;
  last_analyzed?: string;
  analysis_results?: DesignAnalysisReport | NotionAnalysisReport | GPTAnalysisReport;
}

export interface ImprovementPlan {
  content_id: string;
  platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt';
  current_scores: {
    educational_effectiveness: number;
    philosophy_alignment: number;
    engagement: number;
    clarity: number;
  };
  improvement_actions: Array<{
    action_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    implementation_steps: string[];
    expected_impact: {
      educational_effectiveness: number;
      philosophy_alignment: number;
      engagement: number;
      clarity: number;
    };
    estimated_effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  enhanced_version_preview?: any;
  roi_estimate: number; // 0-100 (impact vs effort)
}

export interface CrossPlatformInsights {
  philosophy_consistency: {
    score: number; // 0-100
    strongest_alignment: string; // platform
    weakest_alignment: string; // platform
    consistency_gaps: string[];
  };
  content_quality_trends: {
    by_platform: Record<string, number>;
    improvement_over_time: number;
    quality_variance: number;
  };
  best_practices_identified: Array<{
    practice: string;
    source_platform: string;
    source_content: string;
    applicability: string[]; // other platforms where this could be applied
    implementation_guide: string;
  }>;
  cross_pollination_opportunities: Array<{
    from_platform: string;
    to_platform: string;
    opportunity_type: string;
    description: string;
    potential_impact: number;
  }>;
}

export interface PersonalizedRecommendations {
  user_id?: string;
  learning_preferences: {
    preferred_complexity: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
    interaction_style: 'guided' | 'exploratory' | 'structured';
    content_format_preferences: string[];
  };
  content_recommendations: Array<{
    content_id: string;
    platform: string;
    recommendation_type: 'enhance_existing' | 'create_new' | 'combine_sources';
    rationale: string;
    customization_suggestions: string[];
  }>;
  learning_path_optimization: {
    suggested_sequence: string[];
    prerequisite_gaps: string[];
    advanced_next_steps: string[];
  };
}

export class ContentImprovementEngine {
  private philosophyAnalyzer: ContentPhilosophyAnalyzer;
  private canvaAnalyzer: CanvaDesignAnalyzer;
  private notionAnalyzer: NotionContentAnalyzer;
  private gptAnalyzer: GPTInstructionsAnalyzer;
  private contentSources: ContentSource[] = [];
  private lastFullAnalysis?: string;

  constructor() {
    this.philosophyAnalyzer = new ContentPhilosophyAnalyzer();
    this.canvaAnalyzer = new CanvaDesignAnalyzer();
    this.notionAnalyzer = new NotionContentAnalyzer();
    this.gptAnalyzer = new GPTInstructionsAnalyzer();
    this.loadContentSources();
  }

  /**
   * Add content source for analysis
   */
  async addContentSource(source: ContentSource): Promise<void> {
    logger.info(`Adding content source: ${source.platform} - ${source.title}`);
    
    // Check if source already exists
    const existingIndex = this.contentSources.findIndex(s => s.id === source.id);
    if (existingIndex !== -1) {
      this.contentSources[existingIndex] = source;
    } else {
      this.contentSources.push(source);
    }
    
    await this.saveContentSources();
  }

  /**
   * Remove content source
   */
  async removeContentSource(contentId: string): Promise<boolean> {
    const initialLength = this.contentSources.length;
    this.contentSources = this.contentSources.filter(s => s.id !== contentId);
    
    if (this.contentSources.length < initialLength) {
      await this.saveContentSources();
      logger.info(`Removed content source: ${contentId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Analyze all content sources and update philosophy
   */
  async performFullAnalysis(): Promise<{
    individual_analyses: Array<{
      source: ContentSource;
      analysis: DesignAnalysisReport | NotionAnalysisReport | GPTAnalysisReport;
    }>;
    cross_platform_insights: CrossPlatformInsights;
    updated_philosophy: EducationalPhilosophy | null;
    improvement_plans: ImprovementPlan[];
  }> {
    logger.info('Starting comprehensive content analysis across all platforms');
    
    const individualAnalyses: Array<{
      source: ContentSource;
      analysis: DesignAnalysisReport | NotionAnalysisReport | GPTAnalysisReport;
    }> = [];

    // Analyze each content source
    for (const source of this.contentSources) {
      try {
        let analysis: DesignAnalysisReport | NotionAnalysisReport | GPTAnalysisReport;
        
        switch (source.platform) {
          case 'canva':
            analysis = await this.canvaAnalyzer.analyzeDesign(source.content as CanvaDesignData);
            break;
          case 'notion':
            analysis = await this.notionAnalyzer.analyzePage(source.content as NotionPage);
            break;
          case 'chatgpt':
          case 'custom_gpt':
            analysis = await this.gptAnalyzer.analyzeGPT(source.content as GPTConfiguration);
            break;
          default:
            throw new Error(`Unsupported platform: ${source.platform}`);
        }

        // Update source with analysis results
        source.analysis_results = analysis;
        source.last_analyzed = new Date().toISOString();
        
        individualAnalyses.push({ source, analysis });
        
      } catch (error) {
        logger.error(`Failed to analyze ${source.platform} content ${source.id}:`, error);
      }
    }

    // Generate cross-platform insights
    const crossPlatformInsights = this.generateCrossPlatformInsights(individualAnalyses);
    
    // Get updated philosophy
    const updatedPhilosophy = this.philosophyAnalyzer.getPhilosophy();
    
    // Generate improvement plans
    const improvementPlans = await this.generateImprovementPlans(individualAnalyses);
    
    this.lastFullAnalysis = new Date().toISOString();
    await this.saveContentSources();
    
    logger.info(`Full analysis completed. Analyzed ${individualAnalyses.length} content sources.`);
    
    return {
      individual_analyses: individualAnalyses,
      cross_platform_insights: crossPlatformInsights,
      updated_philosophy: updatedPhilosophy,
      improvement_plans: improvementPlans
    };
  }

  /**
   * Generate cross-platform insights
   */
  private generateCrossPlatformInsights(
    analyses: Array<{ source: ContentSource; analysis: any }>
  ): CrossPlatformInsights {
    const platformScores = new Map<string, number[]>();
    const philosophyScores = new Map<string, number[]>();
    
    // Collect scores by platform
    analyses.forEach(({ source, analysis }) => {
      const platform = source.platform;
      
      // Get educational effectiveness score based on platform
      let effectivenessScore = 0;
      let philosophyScore = 0;
      
      if ('overall_score' in analysis) {
        // Canva analysis
        effectivenessScore = analysis.overall_score.educational_effectiveness;
        philosophyScore = analysis.overall_score.philosophy_alignment;
      } else if ('scores' in analysis) {
        // Notion analysis
        effectivenessScore = analysis.scores.educational_effectiveness;
        philosophyScore = analysis.scores.philosophy_alignment;
      } else if ('overall_scores' in analysis) {
        // GPT analysis
        effectivenessScore = analysis.overall_scores.educational_effectiveness;
        philosophyScore = analysis.overall_scores.philosophy_alignment;
      }
      
      if (!platformScores.has(platform)) {
        platformScores.set(platform, []);
        philosophyScores.set(platform, []);
      }
      
      platformScores.get(platform)!.push(effectivenessScore);
      philosophyScores.get(platform)!.push(philosophyScore);
    });

    // Calculate philosophy consistency
    const philosophyConsistency = this.calculatePhilosophyConsistency(philosophyScores);
    
    // Calculate quality trends
    const qualityTrends = this.calculateQualityTrends(platformScores);
    
    // Identify best practices
    const bestPractices = this.identifyBestPractices(analyses);
    
    // Find cross-pollination opportunities
    const crossPollination = this.identifyCrossPollination(analyses);

    return {
      philosophy_consistency: philosophyConsistency,
      content_quality_trends: qualityTrends,
      best_practices_identified: bestPractices,
      cross_pollination_opportunities: crossPollination
    };
  }

  private calculatePhilosophyConsistency(
    philosophyScores: Map<string, number[]>
  ): CrossPlatformInsights['philosophy_consistency'] {
    const platformAverages = new Map<string, number>();
    
    // Calculate average philosophy alignment per platform
    for (const [platform, scores] of philosophyScores) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      platformAverages.set(platform, average);
    }
    
    const averages = Array.from(platformAverages.values());
    const overallAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
    const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / averages.length;
    const consistencyScore = Math.max(0, 100 - variance * 2);
    
    // Find strongest and weakest platforms
    const sortedPlatforms = Array.from(platformAverages.entries()).sort((a, b) => b[1] - a[1]);
    const strongest = sortedPlatforms[0]?.[0] || '';
    const weakest = sortedPlatforms[sortedPlatforms.length - 1]?.[0] || '';
    
    // Identify consistency gaps
    const gaps: string[] = [];
    if (variance > 25) {
      gaps.push('Significant philosophy alignment variation between platforms');
    }
    if (platformAverages.size > 1) {
      const gap = sortedPlatforms[0]?.[1] - sortedPlatforms[sortedPlatforms.length - 1]?.[1];
      if (gap > 30) {
        gaps.push(`Large gap between best (${strongest}) and worst (${weakest}) performing platforms`);
      }
    }

    return {
      score: Math.round(consistencyScore),
      strongest_alignment: strongest,
      weakest_alignment: weakest,
      consistency_gaps: gaps
    };
  }

  private calculateQualityTrends(
    platformScores: Map<string, number[]>
  ): CrossPlatformInsights['content_quality_trends'] {
    const byPlatform: Record<string, number> = {};
    let totalScores: number[] = [];
    
    for (const [platform, scores] of platformScores) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      byPlatform[platform] = Math.round(average);
      totalScores = totalScores.concat(scores);
    }
    
    // Calculate overall trends (simplified - would need historical data for real trends)
    const overallAverage = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
    const variance = totalScores.reduce((sum, score) => sum + Math.pow(score - overallAverage, 2), 0) / totalScores.length;
    
    return {
      by_platform: byPlatform,
      improvement_over_time: 0, // Would need historical data
      quality_variance: Math.round(variance)
    };
  }

  private identifyBestPractices(
    analyses: Array<{ source: ContentSource; analysis: any }>
  ): CrossPlatformInsights['best_practices_identified'] {
    const bestPractices: CrossPlatformInsights['best_practices_identified'] = [];
    
    // Find high-performing content and extract practices
    const highPerformers = analyses.filter(({ analysis }) => {
      let effectivenessScore = 0;
      
      if ('overall_score' in analysis) {
        effectivenessScore = analysis.overall_score.educational_effectiveness;
      } else if ('scores' in analysis) {
        effectivenessScore = analysis.scores.educational_effectiveness;
      } else if ('overall_scores' in analysis) {
        effectivenessScore = analysis.overall_scores.educational_effectiveness;
      }
      
      return effectivenessScore > 75;
    });

    // Extract practices from high performers
    highPerformers.forEach(({ source, analysis }) => {
      if (source.platform === 'canva' && 'content_analysis' in analysis) {
        analysis.content_analysis.strengths.forEach((strength: string) => {
          bestPractices.push({
            practice: strength,
            source_platform: 'canva',
            source_content: source.title,
            applicability: ['notion', 'custom_gpt'],
            implementation_guide: `Apply this visual design principle: ${strength}`
          });
        });
      } else if (source.platform === 'notion' && 'structure_analysis' in analysis) {
        if (analysis.structure_analysis.interactive_elements.toggles_used > 0) {
          bestPractices.push({
            practice: 'Effective use of progressive disclosure with toggles',
            source_platform: 'notion',
            source_content: source.title,
            applicability: ['canva', 'custom_gpt'],
            implementation_guide: 'Implement expandable sections for optional content'
          });
        }
      } else if ((source.platform === 'custom_gpt' || source.platform === 'chatgpt') && 'instruction_analysis' in analysis) {
        if (analysis.instruction_analysis.educational_elements.socratic_questioning_present) {
          bestPractices.push({
            practice: 'Strong Socratic questioning implementation',
            source_platform: source.platform,
            source_content: source.title,
            applicability: ['canva', 'notion'],
            implementation_guide: 'Incorporate more discovery-based questions in content'
          });
        }
      }
    });

    return bestPractices.slice(0, 10); // Return top 10 practices
  }

  private identifyCrossPollination(
    analyses: Array<{ source: ContentSource; analysis: any }>
  ): CrossPlatformInsights['cross_pollination_opportunities'] {
    const opportunities: CrossPlatformInsights['cross_pollination_opportunities'] = [];
    
    // Look for successful elements in one platform that could benefit others
    const platforms = ['canva', 'notion', 'custom_gpt', 'chatgpt'];
    
    for (const fromPlatform of platforms) {
      for (const toPlatform of platforms) {
        if (fromPlatform === toPlatform) continue;
        
        const fromAnalyses = analyses.filter(a => a.source.platform === fromPlatform);
        const toAnalyses = analyses.filter(a => a.source.platform === toPlatform);
        
        if (fromAnalyses.length === 0 || toAnalyses.length === 0) continue;
        
        // Find areas where fromPlatform excels and toPlatform needs improvement
        const fromStrengths = this.extractPlatformStrengths(fromAnalyses);
        const toWeaknesses = this.extractPlatformWeaknesses(toAnalyses);
        
        // Find matching opportunities
        fromStrengths.forEach(strength => {
          toWeaknesses.forEach(weakness => {
            if (this.areComplementary(strength, weakness)) {
              opportunities.push({
                from_platform: fromPlatform,
                to_platform: toPlatform,
                opportunity_type: 'skill_transfer',
                description: `Transfer ${strength.skill} from ${fromPlatform} to improve ${weakness.area} in ${toPlatform}`,
                potential_impact: Math.round((strength.score + weakness.impact_potential) / 2)
              });
            }
          });
        });
      }
    }
    
    return opportunities.slice(0, 10); // Return top 10 opportunities
  }

  private extractPlatformStrengths(analyses: Array<{ source: ContentSource; analysis: any }>): Array<{ skill: string; score: number }> {
    const strengths: Array<{ skill: string; score: number }> = [];
    
    analyses.forEach(({ analysis }) => {
      if ('content_analysis' in analysis) {
        analysis.content_analysis.strengths.forEach((strength: string) => {
          strengths.push({ skill: strength, score: analysis.content_analysis.engagement_score });
        });
      }
    });
    
    return strengths;
  }

  private extractPlatformWeaknesses(analyses: Array<{ source: ContentSource; analysis: any }>): Array<{ area: string; impact_potential: number }> {
    const weaknesses: Array<{ area: string; impact_potential: number }> = [];
    
    analyses.forEach(({ analysis }) => {
      if ('content_analysis' in analysis) {
        analysis.content_analysis.improvement_opportunities.forEach((weakness: string) => {
          weaknesses.push({ area: weakness, impact_potential: 100 - analysis.content_analysis.clarity_score });
        });
      }
    });
    
    return weaknesses;
  }

  private areComplementary(strength: { skill: string; score: number }, weakness: { area: string; impact_potential: number }): boolean {
    // Simple matching logic - in practice, you'd have more sophisticated matching
    const strengthKeywords = strength.skill.toLowerCase().split(' ');
    const weaknessKeywords = weakness.area.toLowerCase().split(' ');
    
    return strengthKeywords.some(sk => weaknessKeywords.some(wk => 
      sk.includes(wk) || wk.includes(sk)
    ));
  }

  /**
   * Generate improvement plans for all content
   */
  private async generateImprovementPlans(
    analyses: Array<{ source: ContentSource; analysis: any }>
  ): Promise<ImprovementPlan[]> {
    const plans: ImprovementPlan[] = [];
    
    for (const { source, analysis } of analyses) {
      const plan = await this.createImprovementPlan(source, analysis);
      plans.push(plan);
    }
    
    // Sort by ROI
    return plans.sort((a, b) => b.roi_estimate - a.roi_estimate);
  }

  private async createImprovementPlan(
    source: ContentSource,
    analysis: any
  ): Promise<ImprovementPlan> {
    // Extract current scores based on platform
    let currentScores = {
      educational_effectiveness: 50,
      philosophy_alignment: 50,
      engagement: 50,
      clarity: 50
    };

    let suggestions: any[] = [];

    if ('overall_score' in analysis) {
      // Canva analysis
      currentScores = {
        educational_effectiveness: analysis.overall_score.educational_effectiveness,
        philosophy_alignment: analysis.overall_score.philosophy_alignment,
        engagement: analysis.overall_score.engagement_potential,
        clarity: analysis.overall_score.visual_clarity
      };
      suggestions = analysis.improvement_suggestions;
    } else if ('scores' in analysis) {
      // Notion analysis
      currentScores = {
        educational_effectiveness: analysis.scores.educational_effectiveness,
        philosophy_alignment: analysis.scores.philosophy_alignment,
        engagement: analysis.scores.interactivity_score,
        clarity: analysis.scores.accessibility_score
      };
      suggestions = analysis.improvement_suggestions;
    } else if ('overall_scores' in analysis) {
      // GPT analysis
      currentScores = {
        educational_effectiveness: analysis.overall_scores.educational_effectiveness,
        philosophy_alignment: analysis.overall_scores.philosophy_alignment,
        engagement: analysis.overall_scores.user_engagement_potential,
        clarity: analysis.overall_scores.instruction_clarity
      };
      suggestions = analysis.improvement_suggestions;
    }

    // Convert suggestions to improvement actions
    const improvementActions = suggestions.map((suggestion: any, index: number) => ({
      action_id: `action_${source.id}_${index}`,
      priority: suggestion.priority || 'medium',
      category: suggestion.type || suggestion.category || 'general',
      description: suggestion.suggested_improvement || suggestion.suggested_change,
      implementation_steps: Array.isArray(suggestion.implementation_steps) 
        ? suggestion.implementation_steps
        : (suggestion.implementation_guide?.step_by_step_instructions || []),
      expected_impact: suggestion.expected_impact || {
        educational_effectiveness: 10,
        philosophy_alignment: 10,
        engagement: 5,
        clarity: 5
      },
      estimated_effort: this.estimateEffort(suggestion),
      timeline: this.estimateTimeline(suggestion)
    }));

    // Calculate ROI
    const roi = this.calculateROI(improvementActions);

    return {
      content_id: source.id,
      platform: source.platform,
      current_scores: currentScores,
      improvement_actions: improvementActions,
      roi_estimate: roi
    };
  }

  private estimateEffort(suggestion: any): 'low' | 'medium' | 'high' {
    const priority = suggestion.priority || 'medium';
    const category = suggestion.type || suggestion.category || '';
    
    if (priority === 'critical' || category === 'structure') return 'high';
    if (priority === 'high') return 'medium';
    return 'low';
  }

  private estimateTimeline(suggestion: any): string {
    const effort = this.estimateEffort(suggestion);
    
    switch (effort) {
      case 'low': return '1-2 hours';
      case 'medium': return '4-8 hours';
      case 'high': return '1-2 days';
      default: return '2-4 hours';
    }
  }

  private calculateROI(actions: any[]): number {
    if (actions.length === 0) return 0;
    
    const totalImpact = actions.reduce((sum, action) => {
      const impact = typeof action.expected_impact === 'object' 
        ? Object.values(action.expected_impact).reduce((s: number, v: any) => s + (typeof v === 'number' ? v : 0), 0)
        : 10;
      return sum + impact;
    }, 0);
    
    const totalEffort = actions.reduce((sum, action) => {
      const effortScore = action.estimated_effort === 'high' ? 3 : 
                         action.estimated_effort === 'medium' ? 2 : 1;
      return sum + effortScore;
    }, 0);
    
    return Math.round((totalImpact / Math.max(1, totalEffort)) * 10);
  }

  /**
   * Generate personalized recommendations
   */
  async improveContent(content: string, improvementType: string): Promise<string> {
    // Use existing analysis capabilities to improve content
    const analysisResult = await this.performFullAnalysis();
    
    // Apply philosophy-based improvements
    const philosophy = this.philosophyAnalyzer.getPhilosophy();
    
    // Generate improved content based on analysis
    let improvedContent = content;
    
    if (improvementType.includes('socratic')) {
      improvedContent = this.applySocraticMethodology(content, philosophy);
    }
    
    if (improvementType.includes('clarity')) {
      improvedContent = this.improveClarityAndEngagement(improvedContent);
    }
    
    return improvedContent;
  }

  private applySocraticMethodology(content: string, philosophy: any): string {
    // Transform statements into questions where appropriate
    return content.replace(/\. ([A-Z][^.]*\.)/g, '. What do you think about $1');
  }

  private improveClarityAndEngagement(content: string): string {
    // Add analogies and examples based on content patterns
    return content.replace(/Bitcoin/g, 'Bitcoin (digital money)');
  }

  async generatePersonalizedRecommendations(
    learningPreferences?: {
      preferred_complexity?: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
      interaction_style?: 'guided' | 'exploratory' | 'structured';
      content_format_preferences?: string[];
    }
  ): Promise<PersonalizedRecommendations> {
    const philosophy = this.philosophyAnalyzer.getPhilosophy();
    
    // Default preferences if not provided
    const prefs: PersonalizedRecommendations['learning_preferences'] = {
      preferred_complexity: learningPreferences?.preferred_complexity || 'adaptive',
      interaction_style: learningPreferences?.interaction_style || 'guided',
      content_format_preferences: learningPreferences?.content_format_preferences || ['interactive', 'visual', 'text']
    };

    // Generate recommendations based on current content and preferences
    const contentRecommendations = this.generateContentRecommendations(prefs);
    const learningPath = this.generateLearningPath();

    return {
      learning_preferences: prefs,
      content_recommendations: contentRecommendations,
      learning_path_optimization: learningPath
    };
  }

  private generateContentRecommendations(preferences: any): PersonalizedRecommendations['content_recommendations'] {
    const recommendations: PersonalizedRecommendations['content_recommendations'] = [];
    
    // Analyze current content and suggest improvements based on preferences
    this.contentSources.forEach(source => {
      if (!source.analysis_results) return;
      
      const analysis = source.analysis_results as any;
      let currentScore = 50;
      
      if ('overall_score' in analysis) {
        currentScore = analysis.overall_score.educational_effectiveness;
      } else if ('scores' in analysis) {
        currentScore = analysis.scores.educational_effectiveness;
      } else if ('overall_scores' in analysis) {
        currentScore = analysis.overall_scores.educational_effectiveness;
      }
      
      if (currentScore < 70) {
        recommendations.push({
          content_id: source.id,
          platform: source.platform,
          recommendation_type: 'enhance_existing',
          rationale: `Current effectiveness score (${currentScore}) is below optimal. Focus on improving based on your ${preferences.interaction_style} learning style.`,
          customization_suggestions: this.generateCustomizationSuggestions(source, preferences)
        });
      }
    });

    return recommendations;
  }

  private generateCustomizationSuggestions(source: ContentSource, preferences: any): string[] {
    const suggestions: string[] = [];
    
    if (preferences.interaction_style === 'guided') {
      suggestions.push('Add more step-by-step instructions');
      suggestions.push('Include progress checkpoints');
    } else if (preferences.interaction_style === 'exploratory') {
      suggestions.push('Add open-ended questions');
      suggestions.push('Provide multiple exploration paths');
    } else if (preferences.interaction_style === 'structured') {
      suggestions.push('Create clear section hierarchies');
      suggestions.push('Add learning objectives');
    }

    if (preferences.preferred_complexity === 'beginner') {
      suggestions.push('Simplify technical language');
      suggestions.push('Add more foundational explanations');
    } else if (preferences.preferred_complexity === 'advanced') {
      suggestions.push('Include deeper technical details');
      suggestions.push('Add advanced application examples');
    }

    return suggestions;
  }

  private generateLearningPath(): PersonalizedRecommendations['learning_path_optimization'] {
    // Analyze content dependencies and create optimal sequence
    const contentByComplexity = this.contentSources
      .filter(s => s.analysis_results)
      .sort((a, b) => {
        const scoreA = this.getComplexityScore(a.analysis_results!);
        const scoreB = this.getComplexityScore(b.analysis_results!);
        return scoreA - scoreB;
      });

    const suggestedSequence = contentByComplexity.map(s => s.id);
    
    return {
      suggested_sequence: suggestedSequence,
      prerequisite_gaps: this.identifyPrerequisiteGaps(),
      advanced_next_steps: this.suggestAdvancedNextSteps()
    };
  }

  private getComplexityScore(analysis: any): number {
    // Simplified complexity scoring
    if ('content_analysis' in analysis) {
      return analysis.content_analysis.jargon_score + (100 - analysis.content_analysis.clarity_score);
    }
    return 50;
  }

  private identifyPrerequisiteGaps(): string[] {
    // Analyze content for missing foundational concepts
    return [
      'Basic conceptual foundations needed',
      'More introductory examples required',
      'Fundamental terminology explanations missing'
    ];
  }

  private suggestAdvancedNextSteps(): string[] {
    return [
      'Create advanced application exercises',
      'Develop case study scenarios',
      'Add expert-level challenges'
    ];
  }

  /**
   * Get philosophy insights
   */
  getPhilosophyInsights(): {
    current_philosophy: EducationalPhilosophy | null;
    learning_progress: string[];
    consistency_across_platforms: number;
    areas_for_development: string[];
  } {
    const philosophy = this.philosophyAnalyzer.getPhilosophy();
    const learningHistory = this.philosophyAnalyzer.getLearningHistory();
    
    return {
      current_philosophy: philosophy,
      learning_progress: this.analyzeLearningProgress(learningHistory),
      consistency_across_platforms: this.calculatePhilosophyConsistency(new Map()).score,
      areas_for_development: this.identifyDevelopmentAreas(philosophy)
    };
  }

  private analyzeLearningProgress(history: any[]): string[] {
    const progress: string[] = [];
    
    if (history.length > 0) {
      progress.push(`Philosophy learned from ${history.length} content pieces`);
      
      const avgAlignment = history.reduce((sum, h) => sum + h.philosophy_alignment, 0) / history.length;
      if (avgAlignment > 70) {
        progress.push('Strong philosophy consistency achieved');
      } else if (avgAlignment > 50) {
        progress.push('Moderate philosophy alignment developing');
      } else {
        progress.push('Philosophy alignment needs focus');
      }
    }
    
    return progress;
  }

  private identifyDevelopmentAreas(philosophy: EducationalPhilosophy | null): string[] {
    if (!philosophy) return ['Philosophy learning needs to begin'];
    
    const areas: string[] = [];
    
    if (philosophy.teaching_style.gamification_elements.length < 3) {
      areas.push('Expand gamification techniques');
    }
    
    if (philosophy.content_characteristics.common_metaphors.length < 5) {
      areas.push('Develop more analogies and metaphors');
    }
    
    if (!philosophy.teaching_style.socratic_questioning) {
      areas.push('Strengthen Socratic questioning approach');
    }
    
    return areas;
  }

  /**
   * Export comprehensive report
   */
  async exportComprehensiveReport(): Promise<{
    generated_at: string;
    content_summary: {
      total_sources: number;
      by_platform: Record<string, number>;
      last_analysis: string;
    };
    philosophy_state: EducationalPhilosophy | null;
    cross_platform_insights: CrossPlatformInsights;
    improvement_plans: ImprovementPlan[];
    personalized_recommendations: PersonalizedRecommendations;
    action_priorities: Array<{
      action: string;
      priority: string;
      expected_impact: number;
      estimated_effort: string;
    }>;
  }> {
    const fullAnalysis = await this.performFullAnalysis();
    const personalizedRecs = await this.generatePersonalizedRecommendations();
    
    // Extract top action priorities
    const actionPriorities = fullAnalysis.improvement_plans
      .flatMap(plan => plan.improvement_actions.map(action => ({
        action: action.description,
        priority: action.priority,
        expected_impact: typeof action.expected_impact === 'object' 
          ? Object.values(action.expected_impact).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0)
          : 0,
        estimated_effort: action.estimated_effort
      })))
      .sort((a, b) => b.expected_impact - a.expected_impact)
      .slice(0, 10);

    const platformCounts = this.contentSources.reduce((counts, source) => {
      counts[source.platform] = (counts[source.platform] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      generated_at: new Date().toISOString(),
      content_summary: {
        total_sources: this.contentSources.length,
        by_platform: platformCounts,
        last_analysis: this.lastFullAnalysis || 'Never'
      },
      philosophy_state: fullAnalysis.updated_philosophy,
      cross_platform_insights: fullAnalysis.cross_platform_insights,
      improvement_plans: fullAnalysis.improvement_plans,
      personalized_recommendations: personalizedRecs,
      action_priorities: actionPriorities
    };
  }

  /**
   * Save content sources to cache
   */
  private async saveContentSources(): Promise<void> {
    cacheStore.set('content_sources', this.contentSources, 0); // No expiration
  }

  /**
   * Load content sources from cache
   */
  private async loadContentSources(): Promise<void> {
    const cached = cacheStore.get<ContentSource[]>('content_sources');
    if (cached) {
      this.contentSources = cached;
      logger.debug(`Loaded ${this.contentSources.length} content sources from cache`);
    }
  }
}