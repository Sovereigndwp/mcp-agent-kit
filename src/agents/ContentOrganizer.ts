import { canvaContentAnalyzer, CanvaDesignAnalysis } from './CanvaContentAnalyzer';

export interface ContentDatabase {
  designs: Map<string, CanvaDesignAnalysis>;
  tags: Map<string, string[]>; // tag -> design URLs
  learningPaths: Map<string, string[]>; // path name -> ordered design URLs
  lastUpdated: Date;
}

export interface LearningPath {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  estimatedTime: string;
  designs: {
    url: string;
    title: string;
    type: string;
    duration: string;
  }[];
  prerequisites?: string[];
}

export class ContentOrganizer {
  private database: ContentDatabase;

  constructor() {
    this.database = {
      designs: new Map(),
      tags: new Map(),
      learningPaths: new Map(),
      lastUpdated: new Date()
    };
  }

  async organizeAllContent(): Promise<{
    inventory: any;
    learningPaths: LearningPath[];
    dashboard: any;
    improvements: any[];
  }> {
    console.log('🚀 Starting complete content organization...');

    // Your complete content list from layer-d.net and Canva sites
    const allUrls = [
      // layer-d.net content
      'https://layer-d.net/introtocollaborativecustody',
      'https://layer-d.net/codl',
      'https://layer-d.net/redisignedcurriculum',
      'https://layer-d.net/thebitcoinblockchain',
      'https://layer-d.net/whatareminers',
      'https://layer-d.net/cbdcwakeup',
      'https://layer-d.net/etf-selfcustody',
      'https://layer-d.net/doublespendsolved',
      'https://layer-d.net/personalizedworkshop',
      'https://layer-d.net/learningpath',
      'https://layer-d.net/personalizedworkshops',
      'https://layer-d.net/utxos',
      'https://layer-d.net/demandandsupply',
      'https://layer-d.net/btctxdecodedbydalia',
      'https://layer-d.net/discoversoundmoneyhomepage',
      'https://layer-d.net/discover-sound-money-module1',
      'https://layer-d.net/bitcoin-first-principles',
      'https://layer-d.net/banking-double-spend-attack',

      // Canva hosted sites
      'https://layer-d.my.canva.site/copy-of-original-size-19-scenarios-cbdc-a2-landscape-booklets-booklet',
      'https://layer-d.my.canva.site/living-the-cbdc-life',
      'https://layer-d.my.canva.site/the-cbdc-takeover',
      'https://layer-d.my.canva.site/fiatopoly',
      'https://layer-d.my.canva.site/bitcoin-revolutionizing-finance-and-empowering-users',
      'https://layer-d.my.canva.site/the-dynamic-bitcoin-business-landscape',
      'https://layer-d.my.canva.site/bitcoin-emailing-money-in-the-digital-age',
      'https://layer-d.my.canva.site/bitcoin-empowering-self-sovereignty',
      'https://layer-d.my.canva.site/enhance-your-financial-sovereignty-spanish',
      'https://layer-d.my.canva.site/colombia-s-bitcoin-journey',
      'https://layer-d.my.canva.site/por-qu-bitcoin-es-mucho-m-s-que-dinero',
      'https://layer-d.my.canva.site/copy-of-espanol-2-of-3-multisig-custody-model',
      'https://layer-d.my.canva.site/understanding-ibit-etf-options-andresfinancial',
      'https://layer-d.my.canva.site/interactive-timeline-of-money-evolution-from-barter-to-bitcoin',
      'https://layer-d.my.canva.site/dagrey6xofa',
      'https://layer-d.my.canva.site/creating-modular-cause-effect-infographics',
      'https://layer-d.my.canva.site/0-5-steps-completed',
      'https://layer-d.my.canva.site/bitcoin-transaction-demo-bydalia',
      'https://layer-d.my.canva.site/sports-immortals-a-journey-to-preserve-athletic-legacy'
    ];

    // Analyze all content
    const inventory = await canvaContentAnalyzer.generateContentInventory(allUrls);
    
    // Generate curated learning paths
    const learningPaths = this.generateLearningPaths(inventory);
    
    // Create management dashboard
    const dashboard = this.createDashboard(inventory);
    
    // Generate improvement recommendations
    const improvements = this.prioritizeImprovements(inventory);

    return {
      inventory,
      learningPaths,
      dashboard,
      improvements
    };
  }

  private generateLearningPaths(inventory: any): LearningPath[] {
    const paths: LearningPath[] = [];

    // 1. Complete Beginner Path
    paths.push({
      name: "Bitcoin Discovery Journey",
      description: "Start from zero knowledge and discover Bitcoin through questions and interactive exploration",
      difficulty: "beginner",
      estimatedTime: "3-4 hours",
      designs: [
        {
          url: "https://layer-d.net/doublespendsolved",
          title: "The Double-Spend Problem",
          type: "Interactive Demo",
          duration: "20 min"
        },
        {
          url: "https://layer-d.net/whatareminers",
          title: "What Are Miners?",
          type: "Visual Explanation",
          duration: "15 min"
        },
        {
          url: "https://layer-d.net/thebitcoinblockchain",
          title: "The Bitcoin Blockchain",
          type: "Educational Guide",
          duration: "25 min"
        },
        {
          url: "https://layer-d.my.canva.site/interactive-timeline-of-money-evolution-from-barter-to-bitcoin",
          title: "Evolution of Money to Bitcoin",
          type: "Interactive Timeline",
          duration: "30 min"
        },
        {
          url: "https://layer-d.my.canva.site/bitcoin-revolutionizing-finance-and-empowering-users",
          title: "Bitcoin's Revolutionary Impact",
          type: "Comprehensive Overview",
          duration: "35 min"
        }
      ]
    });

    // 2. Technical Deep Dive Path
    paths.push({
      name: "Bitcoin Technical Mastery",
      description: "Deep technical understanding for developers and advanced users",
      difficulty: "advanced",
      estimatedTime: "5-6 hours",
      prerequisites: ["Bitcoin Discovery Journey"],
      designs: [
        {
          url: "https://layer-d.net/utxos",
          title: "UTXO Management",
          type: "Technical Guide",
          duration: "45 min"
        },
        {
          url: "https://layer-d.net/btctxdecodedbydalia",
          title: "Bitcoin Transaction Decoding",
          type: "Interactive Tutorial",
          duration: "60 min"
        },
        {
          url: "https://layer-d.my.canva.site/bitcoin-transaction-demo-bydalia",
          title: "Transaction Demo Workshop",
          type: "Practical Demo",
          duration: "40 min"
        },
        {
          url: "https://layer-d.net/introtocollaborativecustody",
          title: "Collaborative Custody",
          type: "Advanced Topic",
          duration: "50 min"
        },
        {
          url: "https://layer-d.my.canva.site/copy-of-espanol-2-of-3-multisig-custody-model",
          title: "Multisig Implementation",
          type: "Technical Deep-dive",
          duration: "45 min"
        }
      ]
    });

    // 3. Economic & Monetary Policy Path
    paths.push({
      name: "Money, Economics & Bitcoin",
      description: "Understand Bitcoin's role in monetary systems and economic theory",
      difficulty: "intermediate",
      estimatedTime: "4-5 hours",
      designs: [
        {
          url: "https://layer-d.net/demandandsupply",
          title: "Supply & Demand Economics",
          type: "Interactive Game",
          duration: "30 min"
        },
        {
          url: "https://layer-d.my.canva.site/fiatopoly",
          title: "Fiat System Analysis",
          type: "Educational Game",
          duration: "45 min"
        },
        {
          url: "https://layer-d.my.canva.site/the-cbdc-takeover",
          title: "CBDC vs Bitcoin",
          type: "Comparative Analysis",
          duration: "40 min"
        },
        {
          url: "https://layer-d.my.canva.site/living-the-cbdc-life",
          title: "Life Under CBDCs",
          type: "Scenario Exploration",
          duration: "35 min"
        },
        {
          url: "https://layer-d.my.canva.site/the-dynamic-bitcoin-business-landscape",
          title: "Bitcoin Business Ecosystem",
          type: "Market Analysis",
          duration: "40 min"
        }
      ]
    });

    // 4. Regional/Cultural Path
    paths.push({
      name: "Bitcoin Global Impact (Spanish Content)",
      description: "Bitcoin education and impact in Latin America and Spanish-speaking regions",
      difficulty: "mixed",
      estimatedTime: "3-4 hours",
      designs: [
        {
          url: "https://layer-d.my.canva.site/enhance-your-financial-sovereignty-spanish",
          title: "Soberanía Financiera",
          type: "Educational Guide",
          duration: "35 min"
        },
        {
          url: "https://layer-d.my.canva.site/colombia-s-bitcoin-journey",
          title: "Bitcoin in Colombia",
          type: "Regional Case Study",
          duration: "30 min"
        },
        {
          url: "https://layer-d.my.canva.site/por-qu-bitcoin-es-mucho-m-s-que-dinero",
          title: "Bitcoin: Más Que Dinero",
          type: "Philosophical Exploration",
          duration: "40 min"
        }
      ]
    });

    // 5. Educator's Path
    paths.push({
      name: "Bitcoin Education Design",
      description: "For educators wanting to teach Bitcoin effectively",
      difficulty: "advanced",
      estimatedTime: "2-3 hours",
      designs: [
        {
          url: "https://layer-d.net/personalizedworkshops",
          title: "Personalized Workshop Design",
          type: "Educational Framework",
          duration: "45 min"
        },
        {
          url: "https://layer-d.net/personalizedworkshop",
          title: "Workshop Implementation",
          type: "Practical Guide",
          duration: "40 min"
        },
        {
          url: "https://layer-d.my.canva.site/creating-modular-cause-effect-infographics",
          title: "Creating Modular Content",
          type: "Design Tutorial",
          duration: "35 min"
        },
        {
          url: "https://layer-d.net/learningpath",
          title: "Learning Path Construction",
          type: "Educational Design",
          duration: "30 min"
        }
      ]
    });

    return paths;
  }

  private createDashboard(inventory: any): any {
    return {
      overview: {
        totalContent: inventory.total_designs,
        lastUpdated: new Date().toISOString(),
        contentHealth: this.calculateContentHealth(inventory),
        quickStats: {
          highPerformers: inventory.high_priority_improvements.filter((item: any) => item.educational_effectiveness > 80).length,
          needsImprovement: inventory.high_priority_improvements.length,
          interactiveContent: Object.values(inventory.by_type).reduce((acc: number, curr: any) => acc + (curr === 'interactive' ? 1 : 0), 0)
        }
      },
      contentBreakdown: {
        byTopic: inventory.by_topic,
        byType: inventory.by_type,
        byDifficulty: inventory.by_difficulty,
        philosophyAlignment: this.calculateAveragePhilosophy(inventory)
      },
      actionItems: {
        immediate: [
          "Review and improve 5 lowest-scoring designs",
          "Add Socratic questions to direct instruction content", 
          "Create mobile-optimized versions of complex infographics"
        ],
        thisWeek: [
          "Implement unified navigation across all content",
          "Add progress tracking to learning paths",
          "Create assessment quizzes for each topic area"
        ],
        thisMonth: [
          "Build comprehensive teacher's guide",
          "Develop API for content recommendations",
          "Launch beta testing program for new interactive features"
        ]
      }
    };
  }

  private calculateContentHealth(inventory: any): number {
    const analyses = canvaContentAnalyzer.getAllAnalyses();
    if (analyses.length === 0) return 0;
    
    const avgEffectiveness = analyses.reduce((sum, analysis) => sum + analysis.educational_effectiveness, 0) / analyses.length;
    const avgSocratic = analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.socratic_elements, 0) / analyses.length;
    const avgInteractivity = analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.interactive_potential, 0) / analyses.length;
    
    return Math.round((avgEffectiveness + avgSocratic + avgInteractivity) / 3);
  }

  private calculateAveragePhilosophy(inventory: any): any {
    const analyses = canvaContentAnalyzer.getAllAnalyses();
    if (analyses.length === 0) return {};
    
    return {
      socratic_elements: Math.round(analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.socratic_elements, 0) / analyses.length),
      first_principles: Math.round(analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.first_principles, 0) / analyses.length),
      minimal_jargon: Math.round(analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.minimal_jargon, 0) / analyses.length),
      interactive_potential: Math.round(analyses.reduce((sum, analysis) => sum + analysis.philosophy_alignment.interactive_potential, 0) / analyses.length)
    };
  }

  private prioritizeImprovements(inventory: any): any[] {
    return inventory.high_priority_improvements
      .sort((a: any, b: any) => a.educational_effectiveness - b.educational_effectiveness)
      .slice(0, 10)
      .map((analysis: any) => ({
        url: analysis.url,
        title: analysis.title,
        currentScore: analysis.educational_effectiveness,
        potentialGain: 100 - analysis.educational_effectiveness,
        keyActions: [
          analysis.philosophy_alignment.socratic_elements < 50 ? 'Add discovery questions' : null,
          analysis.philosophy_alignment.interactive_potential < 60 ? 'Increase interactivity' : null,
          analysis.philosophy_alignment.minimal_jargon < 70 ? 'Simplify language' : null,
          analysis.educational_effectiveness < 70 ? 'Improve visual design' : null
        ].filter(Boolean),
        estimatedTime: analysis.educational_effectiveness < 50 ? '3-4 hours' : '2-3 hours',
        priority: analysis.educational_effectiveness < 50 ? 'High' : 'Medium'
      }));
  }

  // Search and filter methods
  findContentByTopic(topic: string): CanvaDesignAnalysis[] {
    return canvaContentAnalyzer.getAllAnalyses()
      .filter(analysis => analysis.topic.includes(topic.toLowerCase()));
  }

  findContentByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): CanvaDesignAnalysis[] {
    return canvaContentAnalyzer.getAllAnalyses()
      .filter(analysis => analysis.difficulty_level === difficulty);
  }

  getContentNeedingImprovement(threshold: number = 70): CanvaDesignAnalysis[] {
    return canvaContentAnalyzer.getAllAnalyses()
      .filter(analysis => analysis.educational_effectiveness < threshold)
      .sort((a, b) => a.educational_effectiveness - b.educational_effectiveness);
  }

  generateContentReport(): string {
    const analyses = canvaContentAnalyzer.getAllAnalyses();
    const avgScore = analyses.reduce((sum, analysis) => sum + analysis.educational_effectiveness, 0) / analyses.length;
    
    return `
# Bitcoin Education Content Report

## Overview
- **Total Content Pieces**: ${analyses.length}
- **Average Educational Effectiveness**: ${avgScore.toFixed(1)}/100
- **Content Distribution**: 
  - Beginner: ${analyses.filter(a => a.difficulty_level === 'beginner').length}
  - Intermediate: ${analyses.filter(a => a.difficulty_level === 'intermediate').length}
  - Advanced: ${analyses.filter(a => a.difficulty_level === 'advanced').length}

## Top Performers
${analyses
  .sort((a, b) => b.educational_effectiveness - a.educational_effectiveness)
  .slice(0, 5)
  .map(analysis => `- **${analysis.title}** (${analysis.educational_effectiveness}/100)`)
  .join('\n')}

## Needs Improvement
${analyses
  .sort((a, b) => a.educational_effectiveness - b.educational_effectiveness)
  .slice(0, 5)
  .map(analysis => `- **${analysis.title}** (${analysis.educational_effectiveness}/100) - ${analysis.improvement_suggestions[0]}`)
  .join('\n')}

## Recommendations
1. Focus on adding Socratic elements to lower-scoring content
2. Increase interactivity across all content types
3. Create better linking between related topics
4. Develop assessment tools for learning validation
    `;
  }
}

export const contentOrganizer = new ContentOrganizer();