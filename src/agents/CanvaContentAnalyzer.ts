import { z } from 'zod';

export interface CanvaDesignAnalysis {
  id: string;
  title: string;
  url: string;
  type: 'presentation' | 'infographic' | 'social_media' | 'document' | 'interactive' | 'unknown';
  topic: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  educational_effectiveness: number; // 0-100
  improvement_suggestions: string[];
  content_summary: string;
  philosophy_alignment: {
    socratic_elements: number; // 0-100
    first_principles: number; // 0-100
    minimal_jargon: number; // 0-100
    interactive_potential: number; // 0-100
  };
  last_analyzed: Date;
}

export interface ContentInventory {
  total_designs: number;
  by_topic: Record<string, number>;
  by_type: Record<string, number>;
  by_difficulty: Record<string, number>;
  learning_path_suggestions: {
    beginner_path: string[];
    intermediate_path: string[];
    advanced_path: string[];
  };
  orphaned_content: string[]; // URLs not linked from anywhere
  high_priority_improvements: CanvaDesignAnalysis[];
}

export class CanvaContentAnalyzer {
  private designs: Map<string, CanvaDesignAnalysis> = new Map();

  async analyzeDesignFromUrl(url: string): Promise<CanvaDesignAnalysis> {
    console.log(`Analyzing Canva design: ${url}`);
    
    // Extract design ID from URL
    const designId = this.extractDesignId(url);
    
    try {
      // Use MCP to get design metadata
      const designData = await this.getCanvaDesignData(designId);
      
      // Analyze educational content  
      const analysis = await this.createAnalysisFromDesignData(designData, url);
      
      this.designs.set(designId, analysis);
      return analysis;
    } catch (error) {
      console.error(`Error analyzing design ${url}:`, error);
      
      // Create basic analysis from URL pattern
      return this.createBasicAnalysisFromUrl(url);
    }
  }

  async getCanvaDesignData(designId: string): Promise<any> {
    // This would use the Canva Connect API through MCP
    // For now, we'll simulate the analysis based on the URL patterns you provided
    
    // Note: In production, this would make actual API calls to:
    // - GET /v1/designs/{id} to get design metadata
    // - GET /v1/designs/{id}/pages to get page content
    // - Analyze text, images, and interactive elements
    
    throw new Error('Canva API integration needed - using URL pattern analysis for now');
  }

  private async createAnalysisFromDesignData(designData: any, url: string): Promise<CanvaDesignAnalysis> {
    // This would analyze actual design data from Canva API
    // For now, fallback to URL pattern analysis
    return this.createBasicAnalysisFromUrl(url);
  }

  private createBasicAnalysisFromUrl(url: string): CanvaDesignAnalysis {
    const urlPath = url.split('/').pop() || '';
    const designId = this.extractDesignId(url);
    
    // Analyze based on URL patterns from your content
    let topic = 'bitcoin';
    let type: CanvaDesignAnalysis['type'] = 'unknown';
    let difficulty: CanvaDesignAnalysis['difficulty_level'] = 'beginner';
    let title = urlPath.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
    
    // Categorize based on URL patterns
    if (urlPath.includes('collaborative') || urlPath.includes('custody')) {
      topic = 'bitcoin-custody';
      difficulty = 'advanced';
      type = 'document';
    } else if (urlPath.includes('double') || urlPath.includes('spend')) {
      topic = 'bitcoin-fundamentals';
      difficulty = 'beginner';
      type = 'interactive';
    } else if (urlPath.includes('mining') || urlPath.includes('miners')) {
      topic = 'bitcoin-mining';
      difficulty = 'intermediate';
      type = 'infographic';
    } else if (urlPath.includes('transaction') || urlPath.includes('utxo')) {
      topic = 'bitcoin-transactions';
      difficulty = 'intermediate';
      type = 'interactive';
    } else if (urlPath.includes('cbdc')) {
      topic = 'monetary-policy';
      difficulty = 'advanced';
      type = 'document';
    } else if (urlPath.includes('workshop') || urlPath.includes('personalized')) {
      topic = 'education-design';
      difficulty = 'advanced';
      type = 'presentation';
    }

    return {
      id: designId,
      title: this.formatTitle(title),
      url,
      type,
      topic,
      difficulty_level: difficulty,
      educational_effectiveness: this.estimateEffectiveness(urlPath, type),
      improvement_suggestions: this.generateImprovementSuggestions(urlPath, type),
      content_summary: `${this.formatTitle(title)} - ${type} covering ${topic}`,
      philosophy_alignment: {
        socratic_elements: this.estimateSocraticElements(urlPath),
        first_principles: this.estimateFirstPrinciples(urlPath),
        minimal_jargon: this.estimateJargonLevel(urlPath),
        interactive_potential: this.estimateInteractivity(type, urlPath)
      },
      last_analyzed: new Date()
    };
  }

  private extractDesignId(url: string): string {
    // Extract design ID from various URL formats
    const match = url.match(/\/([a-zA-Z0-9]+)(?:\/|$)/);
    return match ? match[1] : url.split('/').pop() || 'unknown';
  }

  private formatTitle(title: string): string {
    return title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private estimateEffectiveness(urlPath: string, type: CanvaDesignAnalysis['type']): number {
    let score = 60; // Base score
    
    // Interactive content gets higher scores
    if (type === 'interactive') score += 20;
    if (urlPath.includes('simulation')) score += 15;
    if (urlPath.includes('game')) score += 10;
    
    // Educational structure indicators
    if (urlPath.includes('module')) score += 10;
    if (urlPath.includes('guide')) score += 5;
    if (urlPath.includes('workshop')) score += 15;
    
    return Math.min(score, 100);
  }

  private estimateSocraticElements(urlPath: string): number {
    let score = 30; // Base assumption - most content lacks Socratic elements
    
    if (urlPath.includes('discover')) score += 20;
    if (urlPath.includes('question')) score += 15;
    if (urlPath.includes('think')) score += 10;
    if (urlPath.includes('workshop')) score += 25; // Workshops likely more interactive
    if (urlPath.includes('personalized')) score += 15;
    
    return Math.min(score, 100);
  }

  private estimateFirstPrinciples(urlPath: string): number {
    let score = 40;
    
    if (urlPath.includes('fundamentals')) score += 20;
    if (urlPath.includes('first-principles')) score += 30;
    if (urlPath.includes('basics')) score += 15;
    if (urlPath.includes('intro')) score += 10;
    
    return Math.min(score, 100);
  }

  private estimateJargonLevel(urlPath: string): number {
    let score = 60; // Assume moderate jargon
    
    // Technical terms reduce score (more jargon)
    if (urlPath.includes('utxo')) score -= 20;
    if (urlPath.includes('collaborative-custody')) score -= 15;
    if (urlPath.includes('cbdc')) score -= 10;
    
    // Simple terms increase score (less jargon)
    if (urlPath.includes('simple') || urlPath.includes('easy')) score += 20;
    if (urlPath.includes('basics') || urlPath.includes('intro')) score += 15;
    
    return Math.max(Math.min(score, 100), 0);
  }

  private estimateInteractivity(type: CanvaDesignAnalysis['type'], urlPath: string): number {
    let score = type === 'interactive' ? 80 : 30;
    
    if (urlPath.includes('game')) score += 20;
    if (urlPath.includes('simulation')) score += 25;
    if (urlPath.includes('guide')) score += 10;
    if (urlPath.includes('workshop')) score += 15;
    
    return Math.min(score, 100);
  }

  private generateImprovementSuggestions(urlPath: string, type: CanvaDesignAnalysis['type']): string[] {
    const suggestions: string[] = [];
    
    // Based on estimated weaknesses
    if (!urlPath.includes('discover') && !urlPath.includes('question')) {
      suggestions.push('Add discovery-based questions at the beginning');
      suggestions.push('Transform statements into Socratic inquiries');
    }
    
    if (type !== 'interactive') {
      suggestions.push('Add interactive elements to increase engagement');
      suggestions.push('Include progress tracking or achievement systems');
    }
    
    if (urlPath.includes('utxo') || urlPath.includes('cbdc')) {
      suggestions.push('Simplify technical jargon with analogies');
      suggestions.push('Add "plain English" explanations for complex terms');
    }
    
    suggestions.push('Ensure mobile-friendly design');
    suggestions.push('Add clear navigation to related content');
    
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }

  async generateContentInventory(designUrls: string[]): Promise<ContentInventory> {
    console.log(`Analyzing ${designUrls.length} designs for inventory...`);
    
    // Analyze all designs
    const analyses = await Promise.all(
      designUrls.map(url => this.analyzeDesignFromUrl(url))
    );
    
    // Generate inventory statistics
    const inventory: ContentInventory = {
      total_designs: analyses.length,
      by_topic: {},
      by_type: {},
      by_difficulty: {},
      learning_path_suggestions: {
        beginner_path: [],
        intermediate_path: [],
        advanced_path: []
      },
      orphaned_content: [],
      high_priority_improvements: []
    };
    
    // Categorize content
    analyses.forEach(analysis => {
      // Count by topic
      inventory.by_topic[analysis.topic] = (inventory.by_topic[analysis.topic] || 0) + 1;
      
      // Count by type
      inventory.by_type[analysis.type] = (inventory.by_type[analysis.type] || 0) + 1;
      
      // Count by difficulty
      inventory.by_difficulty[analysis.difficulty_level] = 
        (inventory.by_difficulty[analysis.difficulty_level] || 0) + 1;
      
      // Add to appropriate learning path
      if (analysis.educational_effectiveness > 70) {
        inventory.learning_path_suggestions[`${analysis.difficulty_level}_path`].push(analysis.url);
      }
      
      // Identify high-priority improvements
      if (analysis.educational_effectiveness < 60 || 
          analysis.philosophy_alignment.socratic_elements < 40) {
        inventory.high_priority_improvements.push(analysis);
      }
    });
    
    // Sort learning paths by effectiveness
    Object.keys(inventory.learning_path_suggestions).forEach(pathKey => {
      const path = inventory.learning_path_suggestions[pathKey as keyof typeof inventory.learning_path_suggestions];
      path.sort((a, b) => {
        const analysisA = analyses.find(analysis => analysis.url === a);
        const analysisB = analyses.find(analysis => analysis.url === b);
        return (analysisB?.educational_effectiveness || 0) - (analysisA?.educational_effectiveness || 0);
      });
    });
    
    return inventory;
  }

  async generateImprovementPlan(analysis: CanvaDesignAnalysis): Promise<{
    priority: 'high' | 'medium' | 'low';
    timeEstimate: string;
    actions: {
      action: string;
      description: string;
      impact: number; // Expected improvement in educational effectiveness
    }[];
  }> {
    const actions = [];
    let totalImpact = 0;
    
    // Socratic improvements
    if (analysis.philosophy_alignment.socratic_elements < 50) {
      actions.push({
        action: 'Add discovery questions',
        description: 'Transform direct explanations into guiding questions that help users discover concepts themselves',
        impact: 15
      });
      totalImpact += 15;
    }
    
    // Interactivity improvements
    if (analysis.philosophy_alignment.interactive_potential < 60) {
      actions.push({
        action: 'Increase interactivity',
        description: 'Add clickable elements, progress tracking, or simple quizzes',
        impact: 12
      });
      totalImpact += 12;
    }
    
    // Jargon reduction
    if (analysis.philosophy_alignment.minimal_jargon < 70) {
      actions.push({
        action: 'Simplify language',
        description: 'Replace technical terms with analogies and plain English explanations',
        impact: 10
      });
      totalImpact += 10;
    }
    
    // Visual improvements
    if (analysis.educational_effectiveness < 70) {
      actions.push({
        action: 'Improve visual hierarchy',
        description: 'Better contrast, clearer typography, and logical information flow',
        impact: 8
      });
      totalImpact += 8;
    }
    
    // Determine priority
    let priority: 'high' | 'medium' | 'low' = 'low';
    let timeEstimate = '1-2 hours';
    
    if (analysis.educational_effectiveness < 50 || totalImpact > 30) {
      priority = 'high';
      timeEstimate = '3-4 hours';
    } else if (analysis.educational_effectiveness < 70 || totalImpact > 15) {
      priority = 'medium';
      timeEstimate = '2-3 hours';
    }
    
    return {
      priority,
      timeEstimate,
      actions: actions.slice(0, 4) // Top 4 most impactful actions
    };
  }

  getDesignAnalysis(designId: string): CanvaDesignAnalysis | null {
    return this.designs.get(designId) || null;
  }

  getAllAnalyses(): CanvaDesignAnalysis[] {
    return Array.from(this.designs.values());
  }
}

export const canvaContentAnalyzer = new CanvaContentAnalyzer();