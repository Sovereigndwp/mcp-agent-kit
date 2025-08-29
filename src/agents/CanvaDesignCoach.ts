import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';

export interface DesignAdvice {
  category: 'layout' | 'color' | 'typography' | 'imagery' | 'branding' | 'accessibility';
  title: string;
  suggestion: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  examples?: string[];
}

export interface DesignAnalysis {
  overall_score: number;
  strengths: string[];
  improvements: DesignAdvice[];
  bitcoin_specific_tips: string[];
  accessibility_notes: string[];
}

export interface BitcoinDesignGuidelines {
  brand_colors: {
    bitcoin_orange: string;
    neutral_gray: string;
    accent_colors: string[];
  };
  typography: {
    recommended_fonts: string[];
    hierarchy_tips: string[];
  };
  imagery: {
    icon_guidelines: string[];
    chart_best_practices: string[];
  };
}

export class CanvaDesignCoach {
  private bitcoinGuidelines: BitcoinDesignGuidelines;

  constructor() {
    this.bitcoinGuidelines = {
      brand_colors: {
        bitcoin_orange: '#F7931A',
        neutral_gray: '#4A4A4A',
        accent_colors: ['#00D4AA', '#FF6B6B', '#4ECDC4', '#45B7D1']
      },
      typography: {
        recommended_fonts: [
          'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 
          'Inter', 'Poppins', 'Montserrat'
        ],
        hierarchy_tips: [
          'Use bold headings for key metrics (price, fees)',
          'Keep body text readable with sufficient contrast',
          'Limit to 2-3 font weights maximum',
          'Ensure mobile readability at small sizes'
        ]
      },
      imagery: {
        icon_guidelines: [
          'Use consistent Bitcoin symbol (₿)',
          'Maintain icon consistency across designs',
          'Ensure icons are recognizable at small sizes',
          'Consider colorblind accessibility'
        ],
        chart_best_practices: [
          'Use clear, contrasting colors for data visualization',
          'Label axes clearly with units (USD, sats, etc.)',
          'Include legends for multi-data charts',
          'Keep chart types simple and familiar'
        ]
      }
    };
  }

  /**
   * Analyze design elements and provide coaching advice
   */
  async analyzeDesign(designType: string, elements?: any): Promise<DesignAnalysis> {
    const cacheKey = `design_analysis_${designType}`;
    const cached = cacheStore.get<DesignAnalysis>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      logger.info(`Analyzing ${designType} design for Bitcoin education content`);

      const analysis: DesignAnalysis = {
        overall_score: this.calculateOverallScore(designType, elements),
        strengths: this.identifyStrengths(designType),
        improvements: this.generateImprovements(designType),
        bitcoin_specific_tips: this.getBitcoinSpecificTips(designType),
        accessibility_notes: this.getAccessibilityNotes()
      };

      // Cache for 30 minutes
      cacheStore.set(cacheKey, analysis, 30 * 60 * 1000);

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze design:', error);
      throw new Error('Design analysis failed');
    }
  }

  /**
   * Get specific advice for Bitcoin educational content
   */
  async getBitcoinDesignTips(contentType: 'price' | 'fees' | 'education' | 'news' = 'education'): Promise<DesignAdvice[]> {
    const tips: DesignAdvice[] = [];

    switch (contentType) {
      case 'price':
        tips.push({
          category: 'typography',
          title: 'Price Display Hierarchy',
          suggestion: 'Make the current price the largest, most prominent element',
          reasoning: 'Price is the primary information users seek',
          priority: 'high',
          examples: ['Use 48px+ font size for main price', 'Add subtle background highlight']
        });
        break;

      case 'fees':
        tips.push({
          category: 'color',
          title: 'Fee Level Color Coding',
          suggestion: 'Use traffic light colors: green (low), yellow (medium), red (high)',
          reasoning: 'Intuitive color association helps quick understanding',
          priority: 'high',
          examples: ['Low fees: #00D4AA', 'Medium fees: #FFB900', 'High fees: #FF6B6B']
        });
        break;

      case 'education':
        tips.push({
          category: 'layout',
          title: 'Learning Flow Design',
          suggestion: 'Create clear visual progression from simple to complex concepts',
          reasoning: 'Supports educational scaffolding and retention',
          priority: 'medium',
          examples: ['Use numbered steps', 'Progressive disclosure', 'Visual connectors']
        });
        break;

      case 'news':
        tips.push({
          category: 'imagery',
          title: 'News Credibility Indicators',
          suggestion: 'Include source logos and publication dates prominently',
          reasoning: 'Builds trust and helps users evaluate information quality',
          priority: 'medium',
          examples: ['Source attribution blocks', 'Timestamp badges', 'Credibility icons']
        });
        break;
    }

    // Add universal Bitcoin design tips
    tips.push(...this.getUniversalBitcoinTips());

    return tips;
  }

  /**
   * Provide template recommendations for specific use cases
   */
  async recommendTemplates(useCase: string): Promise<{
    template_type: string;
    reasoning: string;
    canva_search_terms: string[];
    customization_tips: string[];
  }[]> {
    const recommendations = [];

    if (useCase.includes('price') || useCase.includes('market')) {
      recommendations.push({
        template_type: 'Dashboard/Infographic',
        reasoning: 'Best for displaying multiple data points clearly',
        canva_search_terms: ['financial dashboard', 'cryptocurrency infographic', 'data visualization'],
        customization_tips: [
          'Replace stock imagery with Bitcoin symbols',
          'Use orange/gold color scheme',
          'Add live data placeholders',
          'Include comparison charts'
        ]
      });
    }

    if (useCase.includes('education') || useCase.includes('learning')) {
      recommendations.push({
        template_type: 'Educational Slide Deck',
        reasoning: 'Structured format supports learning objectives',
        canva_search_terms: ['education presentation', 'learning slides', 'tutorial template'],
        customization_tips: [
          'Break complex topics into digestible chunks',
          'Use consistent icon set throughout',
          'Add interactive elements or QR codes',
          'Include progress indicators'
        ]
      });
    }

    return recommendations;
  }

  private calculateOverallScore(designType: string, elements?: any): number {
    // Simple scoring algorithm - can be enhanced
    let score = 70; // Base score
    
    if (designType === 'infographic') score += 10;
    if (designType === 'social_media') score += 5;
    
    return Math.min(score, 100);
  }

  private identifyStrengths(designType: string): string[] {
    const strengths = [
      'Clear information hierarchy',
      'Appropriate color contrast',
      'Readable typography choices'
    ];

    if (designType === 'infographic') {
      strengths.push('Effective data visualization');
    }

    return strengths;
  }

  private generateImprovements(designType: string): DesignAdvice[] {
    return [
      {
        category: 'accessibility',
        title: 'Improve Color Accessibility',
        suggestion: 'Ensure all text has at least 4.5:1 contrast ratio',
        reasoning: 'Meets WCAG guidelines for readability',
        priority: 'high'
      },
      {
        category: 'layout',
        title: 'Optimize for Mobile',
        suggestion: 'Test design at mobile screen sizes and adjust accordingly',
        reasoning: 'Many users will view on mobile devices',
        priority: 'medium'
      }
    ];
  }

  private getBitcoinSpecificTips(designType: string): string[] {
    return [
      'Use the official Bitcoin orange (#F7931A) for brand consistency',
      'Include the Bitcoin symbol (₿) rather than "BTC" when possible',
      'Ensure technical terms are explained or linked to definitions',
      'Consider including QR codes for wallet addresses or links',
      'Use satoshi units for small amounts to improve precision'
    ];
  }

  private getAccessibilityNotes(): string[] {
    return [
      'Alt text for all images and icons',
      'Keyboard navigation support for interactive elements',
      'Screen reader compatible text hierarchy',
      'Color information supplemented with text/symbols',
      'Sufficient color contrast (4.5:1 minimum)'
    ];
  }

  private getUniversalBitcoinTips(): DesignAdvice[] {
    return [
      {
        category: 'branding',
        title: 'Bitcoin Brand Consistency',
        suggestion: 'Use official Bitcoin orange and maintain consistent symbol usage',
        reasoning: 'Builds recognition and trust with Bitcoin community',
        priority: 'medium',
        examples: ['₿ symbol instead of "BTC"', 'Orange #F7931A accent color']
      },
      {
        category: 'accessibility',
        title: 'Technical Term Clarity',
        suggestion: 'Provide hover definitions or footnotes for technical terms',
        reasoning: 'Makes content accessible to newcomers while maintaining precision',
        priority: 'high',
        examples: ['Satoshi = 0.00000001 BTC', 'Hash rate = network computing power']
      }
    ];
  }

  /**
   * Generate design checklist for specific Bitcoin content types
   */
  async generateChecklist(contentType: string): Promise<{
    category: string;
    items: { task: string; completed: boolean; priority: 'low' | 'medium' | 'high' }[];
  }[]> {
    return [
      {
        category: 'Content',
        items: [
          { task: 'Verify all Bitcoin data is current and accurate', completed: false, priority: 'high' },
          { task: 'Include data sources and timestamps', completed: false, priority: 'medium' },
          { task: 'Use consistent units (BTC, satoshis, USD)', completed: false, priority: 'medium' }
        ]
      },
      {
        category: 'Design',
        items: [
          { task: 'Apply Bitcoin brand colors appropriately', completed: false, priority: 'medium' },
          { task: 'Ensure mobile responsiveness', completed: false, priority: 'high' },
          { task: 'Test color contrast accessibility', completed: false, priority: 'high' }
        ]
      },
      {
        category: 'Functionality',
        items: [
          { task: 'Add QR codes for relevant links/addresses', completed: false, priority: 'low' },
          { task: 'Include share buttons for social media', completed: false, priority: 'medium' },
          { task: 'Optimize file size for web use', completed: false, priority: 'medium' }
        ]
      }
    ];
  }
}

export const canvaDesignCoach = new CanvaDesignCoach();