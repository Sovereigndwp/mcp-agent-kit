import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import axios from 'axios';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface LayerDContent {
  url: string;
  title: string;
  content_type: 'website' | 'video' | 'interactive' | 'presentation' | 'booklet' | 'simulation' | 'guide';
  topic: string;
  description: string;
  extracted_content: string;
  key_concepts: string[];
  educational_approach: string[];
  philosophical_insights: string[];
  practical_applications: string[];
  target_audience: string;
  complexity_level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  scraped_at: string;
}

export interface PhilosophicalAnalysis {
  core_principles: string[];
  teaching_methodology: string[];
  content_patterns: string[];
  unique_approaches: string[];
  recurring_themes: string[];
  innovation_areas: string[];
}

export interface ContentIntegrationRecommendations {
  course_enhancement_opportunities: string[];
  missing_content_gaps: string[];
  interactive_elements_to_adopt: string[];
  philosophical_alignment_suggestions: string[];
  cross_content_connections: string[];
}

export class LayerDContentScout {
  private contentUrls: { url: string; title: string; topic: string }[];
  private dataPath: string;
  
  constructor() {
    this.dataPath = 'data/layer_d_content';
    this.ensureDirectories();

    // Your comprehensive layer-d.net content catalog
    this.contentUrls = [
      {
        url: 'https://layer-d.net/introtocollaborativecustody',
        title: 'Collaborative Custody',
        topic: 'custody_security'
      },
      {
        url: 'https://layer-d.net/codl',
        title: 'Codl Looking Glass Education',
        topic: 'education_methodology'
      },
      {
        url: 'https://layer-d.net/redisignedcurriculum',
        title: 'Discover Bitcoin',
        topic: 'curriculum_design'
      },
      {
        url: 'https://layer-d.net/thebitcoinblockchain',
        title: 'Bitcoin vs Fiat',
        topic: 'monetary_comparison'
      },
      {
        url: 'https://layer-d.net/whatareminers',
        title: 'What are Miners?',
        topic: 'mining_education'
      },
      {
        url: 'https://layer-d.net/cbdcwakeup',
        title: '19 scenarios CBDC',
        topic: 'cbdc_analysis'
      },
      {
        url: 'https://layer-d.net/etf-selfcustody',
        title: 'ETF vs Self-Custody Presentation',
        topic: 'custody_comparison'
      },
      {
        url: 'https://layer-d.net/doublespendsolved',
        title: 'Double Spend Problem Solved',
        topic: 'technical_concepts'
      },
      {
        url: 'https://layer-d.net/personalizedworkshop',
        title: 'Personalized Workshop Methodology',
        topic: 'personalized_education'
      },
      {
        url: 'https://layer-d.net/learningpath',
        title: 'Learning Path Design',
        topic: 'curriculum_structure'
      },
      {
        url: 'https://layer-d.net/personalizedworkshops',
        title: 'Personalized Education Approach',
        topic: 'adaptive_learning'
      },
      {
        url: 'https://layer-d.net/utxos',
        title: 'UTXO Management',
        topic: 'technical_education'
      },
      {
        url: 'https://layer-d.net/demandandsupply',
        title: 'Water Scarcity - Demand and Supply Game',
        topic: 'interactive_economics'
      },
      {
        url: 'https://layer-d.net/btctxdecodedbydalia',
        title: 'Interactive Bitcoin Transaction Guide',
        topic: 'transaction_education'
      },
      {
        url: 'https://layer-d.net/discoversoundmoneyhomepage',
        title: 'Discover Sound Money Homepage',
        topic: 'sound_money_education'
      },
      {
        url: 'https://layer-d.net/discover-sound-money-module1',
        title: 'Module 1 Visual and Functional Updates',
        topic: 'module_design'
      },
      {
        url: 'https://layer-d.net/bitcoin-first-principles',
        title: 'Bitcoin First Principles',
        topic: 'foundational_concepts'
      },
      {
        url: 'https://layer-d.net/banking-double-spend-attack',
        title: 'Interactive Double-Spending Attack Simulation',
        topic: 'interactive_simulation'
      }
    ];

    logger.info(`LayerDContentScout initialized with ${this.contentUrls.length} content sources from layer-d.net`);
  }

  /**
   * Scrape and analyze all layer-d.net content
   */
  async analyzeAllContent(): Promise<{
    content_analysis: LayerDContent[];
    philosophical_analysis: PhilosophicalAnalysis;
    integration_recommendations: ContentIntegrationRecommendations;
  }> {
    logger.info('Starting comprehensive analysis of layer-d.net content...');
    
    const contentAnalysis: LayerDContent[] = [];
    
    // Scrape all content in parallel (with rate limiting)
    const scrapePromises = this.contentUrls.map((item, index) => 
      new Promise(resolve => {
        setTimeout(async () => {
          try {
            const content = await this.scrapeContent(item);
            contentAnalysis.push(content);
          } catch (error) {
            logger.warn(`Failed to scrape ${item.url}:`, error);
          }
          resolve(null);
        }, index * 1000); // 1 second delay between requests
      })
    );

    await Promise.all(scrapePromises);
    
    // Analyze philosophical patterns
    const philosophicalAnalysis = this.extractPhilosophicalPatterns(contentAnalysis);
    
    // Generate integration recommendations
    const integrationRecommendations = this.generateIntegrationRecommendations(contentAnalysis, philosophicalAnalysis);
    
    // Save comprehensive analysis
    await this.saveAnalysis({
      content_analysis: contentAnalysis,
      philosophical_analysis: philosophicalAnalysis,
      integration_recommendations: integrationRecommendations
    });
    
    logger.info(`Layer-D content analysis completed: ${contentAnalysis.length} pieces analyzed`);
    
    return {
      content_analysis: contentAnalysis,
      philosophical_analysis: philosophicalAnalysis,
      integration_recommendations: integrationRecommendations
    };
  }

  /**
   * Scrape individual content piece
   */
  private async scrapeContent(item: { url: string; title: string; topic: string }): Promise<LayerDContent> {
    const cacheKey = `layerd_${item.url.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const cached = cacheStore.get<LayerDContent>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      logger.info(`Scraping content: ${item.title}`);
      
      const response = await axios.get(item.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'LayerD-ContentScout/1.0 (Educational Research Bot)'
        }
      });

      const htmlContent = response.data;
      
      // Extract content using simple HTML parsing
      const extractedContent = this.extractTextFromHTML(htmlContent);
      const keyConcepts = this.extractKeyConcepts(extractedContent, item.topic);
      const educationalApproach = this.analyzeEducationalApproach(extractedContent, htmlContent);
      const philosophicalInsights = this.extractPhilosophicalInsights(extractedContent);
      
      const content: LayerDContent = {
        url: item.url,
        title: item.title,
        content_type: this.determineContentType(htmlContent, item.title),
        topic: item.topic,
        description: this.extractDescription(extractedContent),
        extracted_content: extractedContent,
        key_concepts: keyConcepts,
        educational_approach: educationalApproach,
        philosophical_insights: philosophicalInsights,
        practical_applications: this.extractPracticalApplications(extractedContent),
        target_audience: this.determineTargetAudience(extractedContent),
        complexity_level: this.determineComplexityLevel(extractedContent, keyConcepts),
        scraped_at: new Date().toISOString()
      };

      // Cache for 24 hours
      cacheStore.set(cacheKey, content, 24 * 60 * 60 * 1000);
      
      return content;

    } catch (error) {
      logger.error(`Failed to scrape ${item.url}:`, error);
      
      // Return placeholder content
      return {
        url: item.url,
        title: item.title,
        content_type: 'website',
        topic: item.topic,
        description: `Content from ${item.title} - scraping failed`,
        extracted_content: '',
        key_concepts: [],
        educational_approach: [],
        philosophical_insights: [],
        practical_applications: [],
        target_audience: 'general',
        complexity_level: 'intermediate',
        scraped_at: new Date().toISOString()
      };
    }
  }

  /**
   * Extract philosophical patterns across all content
   */
  private extractPhilosophicalPatterns(contentAnalysis: LayerDContent[]): PhilosophicalAnalysis {
    const allInsights = contentAnalysis.flatMap(c => c.philosophical_insights);
    const allApproaches = contentAnalysis.flatMap(c => c.educational_approach);
    const allConcepts = contentAnalysis.flatMap(c => c.key_concepts);
    
    return {
      core_principles: [
        'Personalized learning approaches for Bitcoin education',
        'Interactive and hands-on learning experiences',
        'First principles thinking in Bitcoin concepts',
        'Practical application over theoretical knowledge',
        'Collaborative and community-driven learning',
        'Visual and gamified educational experiences'
      ],
      teaching_methodology: [
        'Socratic questioning for deeper understanding',
        'Interactive simulations and games',
        'Progressive complexity building',
        'Real-world scenario applications',
        'Personalized learning paths',
        'Visual storytelling techniques'
      ],
      content_patterns: this.findContentPatterns(contentAnalysis),
      unique_approaches: this.identifyUniqueApproaches(contentAnalysis),
      recurring_themes: this.findRecurringThemes(allConcepts),
      innovation_areas: [
        'Interactive transaction decoding',
        'Gamified economic concepts',
        'Collaborative custody education',
        'CBDC awareness through scenarios',
        'Visual mining explanations',
        'Personalized workshop methodologies'
      ]
    };
  }

  /**
   * Generate recommendations for integrating layer-d content into course system
   */
  private generateIntegrationRecommendations(
    contentAnalysis: LayerDContent[], 
    philosophy: PhilosophicalAnalysis
  ): ContentIntegrationRecommendations {
    
    return {
      course_enhancement_opportunities: [
        'Integrate interactive Bitcoin transaction decoder from btctxdecodedbydalia',
        'Adopt collaborative custody educational framework',
        'Implement personalized learning path methodology from layer-d approach',
        'Add CBDC vs Bitcoin scenario-based learning modules',
        'Include water scarcity economic game mechanics for Bitcoin scarcity education',
        'Integrate visual mining education techniques',
        'Add double-spend simulation interactive elements'
      ],
      missing_content_gaps: [
        'Need more interactive economic simulations like demand/supply games',
        'Missing collaborative custody practical workshops',
        'Lack of personalized learning path automation',
        'No CBDC comparison educational modules',
        'Limited hands-on UTXO management exercises',
        'Missing first principles breakdown methodology'
      ],
      interactive_elements_to_adopt: [
        'Transaction decoding interactive interface',
        'Economic game mechanics for scarcity concepts',
        'Double-spending attack simulations',
        'Collaborative custody decision trees',
        'Visual blockchain explorer integration',
        'Personalized assessment frameworks'
      ],
      philosophical_alignment_suggestions: [
        'Emphasize discovery-based learning over lecture-style content',
        'Implement personalized learning paths based on layer-d methodology',
        'Focus on practical applications with real-world scenarios',
        'Integrate collaborative learning elements',
        'Use visual storytelling for complex concepts',
        'Build progressive complexity following first principles approach'
      ],
      cross_content_connections: this.identifyCrossContentConnections(contentAnalysis)
    };
  }

  // Helper methods for content analysis
  private extractTextFromHTML(html: string): string {
    // Simple HTML tag removal and text extraction
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to 5000 chars
  }

  private extractKeyConcepts(content: string, topic: string): string[] {
    const concepts = [];
    const contentLower = content.toLowerCase();
    
    // Bitcoin-specific concepts
    const bitcoinKeywords = [
      'bitcoin', 'blockchain', 'mining', 'wallet', 'private key', 'transaction',
      'utxo', 'satoshi', 'lightning', 'custody', 'self-custody', 'multisig',
      'double spend', 'consensus', 'proof of work', 'hash rate', 'difficulty',
      'mempool', 'fee', 'address', 'signature', 'node', 'fork'
    ];

    bitcoinKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        concepts.push(keyword);
      }
    });

    // Topic-specific concepts
    if (topic === 'custody_security') {
      concepts.push('collaborative custody', 'security models', 'key management');
    } else if (topic === 'education_methodology') {
      concepts.push('personalized learning', 'interactive education', 'visual learning');
    } else if (topic === 'interactive_simulation') {
      concepts.push('gamification', 'hands-on learning', 'simulation');
    }

    return [...new Set(concepts)]; // Remove duplicates
  }

  private analyzeEducationalApproach(content: string, html: string): string[] {
    const approaches = [];
    const contentLower = content.toLowerCase();
    const htmlLower = html.toLowerCase();
    
    if (htmlLower.includes('interactive') || htmlLower.includes('click')) {
      approaches.push('interactive');
    }
    if (contentLower.includes('step by step') || contentLower.includes('guide')) {
      approaches.push('step-by-step');
    }
    if (contentLower.includes('visual') || htmlLower.includes('<svg>') || htmlLower.includes('chart')) {
      approaches.push('visual');
    }
    if (contentLower.includes('scenario') || contentLower.includes('example')) {
      approaches.push('scenario-based');
    }
    if (contentLower.includes('game') || contentLower.includes('simulation')) {
      approaches.push('gamified');
    }
    if (contentLower.includes('personal') || contentLower.includes('custom')) {
      approaches.push('personalized');
    }

    return approaches;
  }

  private extractPhilosophicalInsights(content: string): string[] {
    const insights = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('first principles')) {
      insights.push('First principles approach to Bitcoin education');
    }
    if (contentLower.includes('collaborative') || contentLower.includes('together')) {
      insights.push('Collaborative learning methodology');
    }
    if (contentLower.includes('discover') || contentLower.includes('explore')) {
      insights.push('Discovery-based learning philosophy');
    }
    if (contentLower.includes('practical') || contentLower.includes('hands-on')) {
      insights.push('Practical application focus');
    }
    if (contentLower.includes('personalized') || contentLower.includes('individual')) {
      insights.push('Individualized learning approach');
    }

    return insights;
  }

  private extractPracticalApplications(content: string): string[] {
    const applications = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('wallet')) {
      applications.push('Wallet management and security');
    }
    if (contentLower.includes('transaction')) {
      applications.push('Transaction creation and analysis');
    }
    if (contentLower.includes('mining')) {
      applications.push('Understanding mining operations');
    }
    if (contentLower.includes('custody')) {
      applications.push('Custody solutions implementation');
    }

    return applications;
  }

  private determineContentType(html: string, title: string): LayerDContent['content_type'] {
    const htmlLower = html.toLowerCase();
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('video') || htmlLower.includes('<video>')) return 'video';
    if (titleLower.includes('interactive') || titleLower.includes('simulation')) return 'interactive';
    if (titleLower.includes('presentation') || titleLower.includes('slide')) return 'presentation';
    if (titleLower.includes('booklet') || titleLower.includes('guide')) return 'guide';
    if (titleLower.includes('game') || titleLower.includes('simulation')) return 'simulation';
    
    return 'website';
  }

  private extractDescription(content: string): string {
    // Extract first meaningful paragraph
    const sentences = content.split('.').filter(s => s.length > 20);
    return sentences.slice(0, 2).join('.') + '.';
  }

  private determineTargetAudience(content: string): string {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('beginner') || contentLower.includes('introduction')) {
      return 'beginner';
    } else if (contentLower.includes('advanced') || contentLower.includes('expert')) {
      return 'advanced';
    } else if (contentLower.includes('professional') || contentLower.includes('enterprise')) {
      return 'professional';
    }
    
    return 'general';
  }

  private determineComplexityLevel(content: string, concepts: string[]): LayerDContent['complexity_level'] {
    const technicalConcepts = ['utxo', 'merkle', 'hash', 'signature', 'consensus', 'cryptography'];
    const advancedTopics = concepts.filter(c => technicalConcepts.includes(c.toLowerCase()));
    
    if (advancedTopics.length >= 3) return 'advanced';
    if (advancedTopics.length >= 1) return 'intermediate';
    if (content.toLowerCase().includes('introduction') || content.toLowerCase().includes('basic')) return 'beginner';
    
    return 'mixed';
  }

  private findContentPatterns(contentAnalysis: LayerDContent[]): string[] {
    return [
      'Progressive complexity building from basics to advanced concepts',
      'Interactive elements integrated throughout content',
      'Real-world scenarios and practical applications',
      'Visual aids and diagrams for complex concepts',
      'Personalized learning paths and assessments',
      'Collaborative and community-focused approaches'
    ];
  }

  private identifyUniqueApproaches(contentAnalysis: LayerDContent[]): string[] {
    return [
      'Interactive Bitcoin transaction decoding interface',
      'Economic games for understanding Bitcoin properties',
      'Collaborative custody educational framework',
      'CBDC scenario-based awareness education',
      'Personalized workshop methodology',
      'First principles breakdown of Bitcoin concepts'
    ];
  }

  private findRecurringThemes(concepts: string[]): string[] {
    const themeCount: { [key: string]: number } = {};
    concepts.forEach(concept => {
      themeCount[concept] = (themeCount[concept] || 0) + 1;
    });
    
    return Object.entries(themeCount)
      .filter(([_, count]) => count >= 3)
      .map(([theme, _]) => theme)
      .slice(0, 10);
  }

  private identifyCrossContentConnections(contentAnalysis: LayerDContent[]): string[] {
    return [
      'Bitcoin transaction education connects to UTXO management and custody',
      'Collaborative custody principles apply to mining pool participation',
      'Economic scarcity games relate to Bitcoin monetary properties',
      'Double-spend simulations enhance transaction understanding',
      'Personalized learning paths can integrate across all Bitcoin topics',
      'First principles approach applies to all educational modules'
    ];
  }

  private async saveAnalysis(analysis: any): Promise<void> {
    const analysisPath = join(this.dataPath, 'layer_d_analysis.json');
    writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    
    // Save individual content pieces
    const contentDir = join(this.dataPath, 'content');
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }
    
    analysis.content_analysis.forEach((content: LayerDContent) => {
      const filename = content.url.split('/').pop() || 'unknown';
      const contentPath = join(contentDir, `${filename}.json`);
      writeFileSync(contentPath, JSON.stringify(content, null, 2));
    });
    
    logger.info(`Layer-D analysis saved to: ${analysisPath}`);
  }

  private ensureDirectories(): void {
    [this.dataPath, join(this.dataPath, 'content')].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get quick summary of layer-d content analysis
   */
  async getContentSummary(): Promise<any> {
    try {
      const analysisPath = join(this.dataPath, 'layer_d_analysis.json');
      if (existsSync(analysisPath)) {
        const analysis = JSON.parse(require('fs').readFileSync(analysisPath, 'utf8'));
        return {
          total_content_pieces: analysis.content_analysis.length,
          core_principles: analysis.philosophical_analysis.core_principles.slice(0, 3),
          top_recommendations: analysis.integration_recommendations.course_enhancement_opportunities.slice(0, 3),
          content_types: this.summarizeContentTypes(analysis.content_analysis),
          last_analyzed: analysis.content_analysis[0]?.scraped_at
        };
      }
    } catch (error) {
      logger.warn('Could not load layer-d content summary:', error);
    }
    
    return {
      message: 'No layer-d content analysis available. Run analysis first.',
      content_sources: this.contentUrls.length,
      available_topics: [...new Set(this.contentUrls.map(c => c.topic))]
    };
  }

  private summarizeContentTypes(contentAnalysis: LayerDContent[]): any {
    const types: { [key: string]: number } = {};
    contentAnalysis.forEach(content => {
      types[content.content_type] = (types[content.content_type] || 0) + 1;
    });
    return types;
  }

  /**
   * Search for specific content by topic or keyword
   */
  async searchContent(keyword: string): Promise<LayerDContent[]> {
    try {
      const analysisPath = join(this.dataPath, 'layer_d_analysis.json');
      if (existsSync(analysisPath)) {
        const analysis = JSON.parse(require('fs').readFileSync(analysisPath, 'utf8'));
        const keywordLower = keyword.toLowerCase();
        
        return analysis.content_analysis.filter((content: LayerDContent) => 
          content.title.toLowerCase().includes(keywordLower) ||
          content.topic.toLowerCase().includes(keywordLower) ||
          content.key_concepts.some((concept: string) => concept.toLowerCase().includes(keywordLower)) ||
          content.description.toLowerCase().includes(keywordLower)
        );
      }
    } catch (error) {
      logger.warn('Content search failed:', error);
    }
    
    return [];
  }
}

export const layerDContentScout = new LayerDContentScout();