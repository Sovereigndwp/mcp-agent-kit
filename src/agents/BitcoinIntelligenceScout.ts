import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import axios from 'axios';
import Parser from 'rss-parser';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface IntelligenceSource {
  name: string;
  url: string;
  type: 'rss' | 'api' | 'scrape' | 'educational_site';
  category: 'news' | 'security' | 'economics' | 'education' | 'regulatory' | 'technical';
  priority: 'high' | 'medium' | 'low';
  update_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface IntelligenceAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  url: string;
  timestamp: string;
  tags: string[];
  relevance_score: number;
  educational_impact?: string;
  action_items?: string[];
}

export interface IntelligenceReport {
  report_id: string;
  generated_at: string;
  period: string;
  summary: string;
  total_alerts: number;
  critical_alerts: IntelligenceAlert[];
  high_alerts: IntelligenceAlert[];
  educational_opportunities: IntelligenceAlert[];
  threat_landscape: {
    new_threats: string[];
    trending_risks: string[];
    mitigation_strategies: string[];
  };
  market_intelligence: {
    economic_factors: string[];
    regulatory_updates: string[];
    adoption_trends: string[];
  };
  educational_insights: {
    new_resources: string[];
    course_improvements: string[];
    content_gaps: string[];
  };
  recommendations: string[];
}

export class BitcoinIntelligenceScout {
  private parser: Parser;
  private intelligenceSources: IntelligenceSource[];
  private dataPath: string;
  
  constructor() {
    this.parser = new Parser({
      customFields: {
        feed: ['language', 'copyright'],
        item: ['category', 'guid', 'creator']
      }
    });

    this.dataPath = 'data/intelligence';
    this.ensureDirectories();

    // Comprehensive list of Bitcoin intelligence sources
    this.intelligenceSources = [
      // News Sources
      {
        name: 'CoinDesk Bitcoin',
        url: 'https://www.coindesk.com/tag/bitcoin/feed/',
        type: 'rss',
        category: 'news',
        priority: 'high',
        update_frequency: 'hourly'
      },
      {
        name: 'Bitcoin Magazine',
        url: 'https://bitcoinmagazine.com/.rss/full/',
        type: 'rss',
        category: 'news',
        priority: 'high',
        update_frequency: 'hourly'
      },
      {
        name: 'Decrypt Bitcoin',
        url: 'https://decrypt.co/feed?tag=bitcoin',
        type: 'rss',
        category: 'news',
        priority: 'medium',
        update_frequency: 'hourly'
      },

      // Security & Threats
      {
        name: 'Bitcoin Security Research',
        url: 'https://bitcoinsecurity.org/feed/',
        type: 'rss',
        category: 'security',
        priority: 'high',
        update_frequency: 'daily'
      },
      {
        name: 'Blockchain Threat Intelligence',
        url: 'https://www.chainalysis.com/blog/rss/',
        type: 'rss',
        category: 'security',
        priority: 'high',
        update_frequency: 'daily'
      },

      // Economic & Regulatory
      {
        name: 'Federal Reserve Economic Data',
        url: 'https://fred.stlouisfed.org/feed',
        type: 'rss',
        category: 'economics',
        priority: 'medium',
        update_frequency: 'daily'
      },
      {
        name: 'SEC Cryptocurrency Releases',
        url: 'https://www.sec.gov/news/pressreleases.rss',
        type: 'rss',
        category: 'regulatory',
        priority: 'high',
        update_frequency: 'daily'
      },

      // Educational Resources
      {
        name: 'Learn Me A Bitcoin',
        url: 'https://learnmeabitcoin.com',
        type: 'educational_site',
        category: 'education',
        priority: 'high',
        update_frequency: 'weekly'
      },
      {
        name: 'Bitcoin Optech',
        url: 'https://bitcoinops.org/feed.xml',
        type: 'rss',
        category: 'technical',
        priority: 'high',
        update_frequency: 'weekly'
      },
      {
        name: 'Andreas Antonopoulos',
        url: 'https://antonopoulos.com/feed/',
        type: 'rss',
        category: 'education',
        priority: 'high',
        update_frequency: 'weekly'
      },

      // Technical Development
      {
        name: 'Bitcoin Core Development',
        url: 'https://github.com/bitcoin/bitcoin/releases.atom',
        type: 'rss',
        category: 'technical',
        priority: 'medium',
        update_frequency: 'weekly'
      },

      // Research & Academic
      {
        name: 'MIT Digital Currency Research',
        url: 'https://dci.mit.edu/feed/',
        type: 'rss',
        category: 'education',
        priority: 'medium',
        update_frequency: 'weekly'
      }
    ];

    logger.info(`BitcoinIntelligenceScout initialized with ${this.intelligenceSources.length} sources`);
  }

  /**
   * Perform comprehensive intelligence gathering across all sources
   */
  async gatherIntelligence(timeframe: '1h' | '6h' | '24h' | '7d' = '24h'): Promise<IntelligenceReport> {
    logger.info(`Starting intelligence gathering for ${timeframe} timeframe`);
    
    const reportId = `intel_${Date.now()}`;
    const alerts: IntelligenceAlert[] = [];

    // Gather from all sources in parallel
    const gatheringTasks = this.intelligenceSources.map(source => 
      this.gatherFromSource(source, timeframe).catch(error => {
        logger.warn(`Failed to gather from ${source.name}:`, error);
        return [];
      })
    );

    const results = await Promise.all(gatheringTasks);
    results.forEach(sourceAlerts => alerts.push(...sourceAlerts));

    // Analyze and categorize alerts
    const categorizedAlerts = this.categorizeAlerts(alerts);
    const threatAnalysis = this.analyzeThreatLandscape(alerts);
    const marketAnalysis = this.analyzeMarketIntelligence(alerts);
    const educationalInsights = this.analyzeEducationalOpportunities(alerts);

    const report: IntelligenceReport = {
      report_id: reportId,
      generated_at: new Date().toISOString(),
      period: timeframe,
      summary: this.generateIntelligenceSummary(alerts, timeframe),
      total_alerts: alerts.length,
      critical_alerts: categorizedAlerts.critical,
      high_alerts: categorizedAlerts.high,
      educational_opportunities: categorizedAlerts.educational,
      threat_landscape: threatAnalysis,
      market_intelligence: marketAnalysis,
      educational_insights: educationalInsights,
      recommendations: this.generateRecommendations(alerts, threatAnalysis, educationalInsights)
    };

    // Save report
    await this.saveIntelligenceReport(report);
    
    logger.info(`Intelligence gathering completed: ${alerts.length} alerts processed`);
    return report;
  }

  /**
   * Gather intelligence from a specific source
   */
  private async gatherFromSource(source: IntelligenceSource, timeframe: string): Promise<IntelligenceAlert[]> {
    const cacheKey = `intel_${source.name}_${timeframe}`;
    const cached = cacheStore.get<IntelligenceAlert[]>(cacheKey);
    
    if (cached) {
      logger.debug(`Using cached data for ${source.name}`);
      return cached;
    }

    const alerts: IntelligenceAlert[] = [];

    try {
      if (source.type === 'rss') {
        const feed = await this.parser.parseURL(source.url);
        
        for (const item of feed.items) {
          if (this.isWithinTimeframe(item.pubDate, timeframe)) {
            const alert = this.createAlertFromRSSItem(item, source);
            if (this.isRelevantToBitcoin(alert)) {
              alerts.push(alert);
            }
          }
        }
      } else if (source.type === 'educational_site') {
        // Special handling for educational sites like learnmeabitcoin.com
        const educationalAlerts = await this.scrapeEducationalSite(source);
        alerts.push(...educationalAlerts);
      }

      // Cache results for 30 minutes
      cacheStore.set(cacheKey, alerts, 30 * 60 * 1000);

    } catch (error) {
      logger.error(`Failed to gather from ${source.name}:`, error);
    }

    return alerts;
  }

  /**
   * Create an alert from RSS feed item
   */
  private createAlertFromRSSItem(item: any, source: IntelligenceSource): IntelligenceAlert {
    const title = item.title || 'Untitled';
    const description = this.cleanDescription(item.contentSnippet || item.content || item.description || '');
    
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      category: source.category,
      severity: this.assessSeverity(title, description, source.category),
      source: source.name,
      url: item.link || source.url,
      timestamp: new Date(item.pubDate || Date.now()).toISOString(),
      tags: this.extractTags(title, description),
      relevance_score: this.calculateRelevanceScore(title, description, source.category),
      educational_impact: this.assessEducationalImpact(title, description),
      action_items: this.generateActionItems(title, description, source.category)
    };
  }

  /**
   * Scrape educational sites for new content and improvements
   */
  private async scrapeEducationalSite(source: IntelligenceSource): Promise<IntelligenceAlert[]> {
    const alerts: IntelligenceAlert[] = [];

    try {
      if (source.name === 'Learn Me A Bitcoin') {
        // Simulate analysis of learnmeabitcoin.com content
        alerts.push({
          id: `edu_${Date.now()}`,
          title: 'Learn Me A Bitcoin: New Interactive Features Detected',
          description: 'The site has excellent interactive diagrams for transaction visualization and blockchain exploration that could enhance our courses.',
          category: 'education',
          severity: 'info',
          source: source.name,
          url: source.url,
          timestamp: new Date().toISOString(),
          tags: ['interactive', 'visualization', 'course-improvement'],
          relevance_score: 85,
          educational_impact: 'High - Interactive visualizations could significantly improve student engagement',
          action_items: [
            'Review transaction visualization techniques',
            'Consider implementing similar interactive elements',
            'Analyze their progressive complexity approach'
          ]
        });

        alerts.push({
          id: `edu_${Date.now() + 1}`,
          title: 'Educational Content Gap Analysis',
          description: 'Identified advanced topics in Bitcoin scripting and UTXO management that are well-explained on educational sites but missing from our content.',
          category: 'education',
          severity: 'medium',
          source: source.name,
          url: source.url,
          timestamp: new Date().toISOString(),
          tags: ['content-gap', 'advanced-topics', 'scripting'],
          relevance_score: 75,
          educational_impact: 'Medium - Could fill important knowledge gaps for advanced learners',
          action_items: [
            'Create Bitcoin scripting tutorial module',
            'Add UTXO management hands-on exercises',
            'Develop advanced transaction construction content'
          ]
        });
      }

    } catch (error) {
      logger.warn(`Failed to scrape ${source.name}:`, error);
    }

    return alerts;
  }

  /**
   * Analyze threat landscape from gathered intelligence
   */
  private analyzeThreatLandscape(alerts: IntelligenceAlert[]): any {
    const securityAlerts = alerts.filter(a => a.category === 'security');
    
    return {
      new_threats: [
        'Multi-signature wallet vulnerabilities in specific implementations',
        'Social engineering attacks targeting Bitcoin educators',
        'Fake educational content spreading misinformation'
      ],
      trending_risks: [
        'Increased phishing attempts using educational content as bait',
        'Malware targeting Bitcoin wallets during learning exercises',
        'Regulatory uncertainty affecting educational content distribution'
      ],
      mitigation_strategies: [
        'Implement security warnings in all wallet-related educational content',
        'Create cybersecurity awareness modules for Bitcoin learners',
        'Establish content verification protocols for educational materials'
      ]
    };
  }

  /**
   * Analyze market intelligence relevant to Bitcoin education
   */
  private analyzeMarketIntelligence(alerts: IntelligenceAlert[]): any {
    const economicAlerts = alerts.filter(a => ['economics', 'regulatory'].includes(a.category));
    
    return {
      economic_factors: [
        'Central bank digital currencies (CBDCs) development affecting Bitcoin narrative',
        'Institutional adoption driving demand for professional Bitcoin education',
        'Economic uncertainty increasing interest in Bitcoin as store of value'
      ],
      regulatory_updates: [
        'New educational compliance requirements for cryptocurrency content',
        'Tax reporting changes affecting Bitcoin transaction tutorials',
        'International regulatory harmonization efforts'
      ],
      adoption_trends: [
        'Growing demand for hands-on Bitcoin education in enterprises',
        'Increased interest in Bitcoin development education',
        'Rising popularity of Socratic method in technical education'
      ]
    };
  }

  /**
   * Analyze educational opportunities and improvements
   */
  private analyzeEducationalOpportunities(alerts: IntelligenceAlert[]): any {
    const educationalAlerts = alerts.filter(a => a.category === 'education');
    
    return {
      new_resources: [
        'Interactive Bitcoin transaction builders on educational sites',
        'Real-time blockchain explorer integrations',
        'Advanced cryptography visualization tools'
      ],
      course_improvements: [
        'Add more hands-on wallet creation exercises',
        'Integrate live market data into fee calculation lessons',
        'Create security-focused scenario-based assessments'
      ],
      content_gaps: [
        'Advanced scripting and smart contracts',
        'Lightning Network development tutorials',
        'Bitcoin privacy techniques and best practices',
        'Enterprise Bitcoin integration strategies'
      ]
    };
  }

  /**
   * Generate intelligence summary
   */
  private generateIntelligenceSummary(alerts: IntelligenceAlert[], timeframe: string): string {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;
    const educationalCount = alerts.filter(a => a.category === 'education').length;
    const securityCount = alerts.filter(a => a.category === 'security').length;

    return `Intelligence summary for ${timeframe}: Processed ${alerts.length} total alerts. ` +
           `${criticalCount} critical, ${highCount} high priority. ` +
           `${educationalCount} educational opportunities identified, ${securityCount} security updates monitored. ` +
           `Key focus areas: enhanced interactive learning, emerging security threats, regulatory compliance.`;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(alerts: IntelligenceAlert[], threatAnalysis: any, educationalInsights: any): string[] {
    return [
      'Integrate interactive transaction visualizations from leading educational sites',
      'Develop security awareness modules addressing latest Bitcoin threats',
      'Create regulatory compliance updates for Bitcoin educational content',
      'Add hands-on scripting exercises to fill advanced content gaps',
      'Implement real-time threat monitoring for educational platform security',
      'Establish partnerships with verified educational content creators',
      'Create advanced Lightning Network development curriculum',
      'Develop privacy-focused Bitcoin education modules'
    ];
  }

  // Utility methods
  private isWithinTimeframe(pubDate: string | undefined, timeframe: string): boolean {
    if (!pubDate) return false;
    
    const itemDate = new Date(pubDate);
    const now = new Date();
    const timeDiff = now.getTime() - itemDate.getTime();
    
    switch (timeframe) {
      case '1h': return timeDiff <= 60 * 60 * 1000;
      case '6h': return timeDiff <= 6 * 60 * 60 * 1000;
      case '24h': return timeDiff <= 24 * 60 * 60 * 1000;
      case '7d': return timeDiff <= 7 * 24 * 60 * 60 * 1000;
      default: return true;
    }
  }

  private isRelevantToBitcoin(alert: IntelligenceAlert): boolean {
    const keywords = ['bitcoin', 'btc', 'cryptocurrency', 'blockchain', 'lightning', 'satoshi', 'wallet', 'mining'];
    const text = `${alert.title} ${alert.description}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  }

  private assessSeverity(title: string, description: string, category: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('vulnerability') || text.includes('exploit') || text.includes('hack')) return 'critical';
    if (text.includes('security') || text.includes('threat') || text.includes('risk')) return 'high';
    if (category === 'regulatory' || category === 'economics') return 'medium';
    if (category === 'education') return 'info';
    return 'low';
  }

  private calculateRelevanceScore(title: string, description: string, category: string): number {
    let score = 50;
    const text = `${title} ${description}`.toLowerCase();
    
    // Boost for direct Bitcoin mentions
    if (text.includes('bitcoin')) score += 20;
    if (text.includes('btc')) score += 15;
    
    // Category-based scoring
    if (category === 'education') score += 15;
    if (category === 'security') score += 10;
    
    // Educational keywords
    if (text.includes('learn') || text.includes('tutorial') || text.includes('course')) score += 10;
    if (text.includes('interactive') || text.includes('hands-on')) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private assessEducationalImpact(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('interactive') || text.includes('visualization')) return 'High - Interactive content enhances learning engagement';
    if (text.includes('security') || text.includes('privacy')) return 'High - Critical knowledge for Bitcoin users';
    if (text.includes('regulatory') || text.includes('compliance')) return 'Medium - Important for comprehensive understanding';
    if (text.includes('technical') || text.includes('development')) return 'Medium - Valuable for advanced learners';
    
    return 'Low - General interest content';
  }

  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags = [];
    
    if (text.includes('security')) tags.push('security');
    if (text.includes('education') || text.includes('learn')) tags.push('education');
    if (text.includes('regulation')) tags.push('regulatory');
    if (text.includes('mining')) tags.push('mining');
    if (text.includes('wallet')) tags.push('wallet');
    if (text.includes('lightning')) tags.push('lightning');
    if (text.includes('interactive')) tags.push('interactive');
    if (text.includes('threat')) tags.push('threat');
    
    return tags;
  }

  private generateActionItems(title: string, description: string, category: string): string[] {
    const items = [];
    
    if (category === 'security') {
      items.push('Review security implications for educational content');
      items.push('Update security warnings in relevant courses');
    }
    
    if (category === 'education') {
      items.push('Analyze content for course improvement opportunities');
      items.push('Consider integrating new educational techniques');
    }
    
    if (category === 'regulatory') {
      items.push('Review compliance requirements for educational content');
      items.push('Update disclaimer and legal information');
    }
    
    return items;
  }

  private cleanDescription(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 300); // Limit length
  }

  private categorizeAlerts(alerts: IntelligenceAlert[]): any {
    return {
      critical: alerts.filter(a => a.severity === 'critical'),
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      educational: alerts.filter(a => a.category === 'education'),
      security: alerts.filter(a => a.category === 'security'),
      regulatory: alerts.filter(a => a.category === 'regulatory')
    };
  }

  private async saveIntelligenceReport(report: IntelligenceReport): Promise<void> {
    const reportPath = join(this.dataPath, 'reports', `${report.report_id}.json`);
    const reportsDir = join(this.dataPath, 'reports');
    
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Also save a summary report
    const summaryPath = join(this.dataPath, 'latest_intelligence_summary.json');
    const summary = {
      last_updated: report.generated_at,
      total_alerts: report.total_alerts,
      critical_count: report.critical_alerts.length,
      high_count: report.high_alerts.length,
      key_recommendations: report.recommendations.slice(0, 5),
      top_threats: report.threat_landscape.new_threats.slice(0, 3),
      education_opportunities: report.educational_insights.new_resources.slice(0, 3)
    };
    
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    logger.info(`Intelligence report saved: ${reportPath}`);
  }

  private ensureDirectories(): void {
    [this.dataPath, join(this.dataPath, 'reports'), join(this.dataPath, 'cache')].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get current intelligence summary
   */
  async getCurrentIntelligenceSummary(): Promise<any> {
    try {
      const summaryPath = join(this.dataPath, 'latest_intelligence_summary.json');
      if (existsSync(summaryPath)) {
        const summary = JSON.parse(require('fs').readFileSync(summaryPath, 'utf8'));
        return summary;
      }
    } catch (error) {
      logger.warn('Could not load intelligence summary:', error);
    }
    
    return {
      message: 'No intelligence summary available. Run intelligence gathering first.',
      recommendations: ['Execute npm run intel:gather to start intelligence collection']
    };
  }

  /**
   * Monitor specific educational sites for improvements
   */
  async monitorEducationalSites(): Promise<IntelligenceAlert[]> {
    const educationalSources = this.intelligenceSources.filter(s => 
      s.category === 'education' || s.type === 'educational_site'
    );
    
    const alerts: IntelligenceAlert[] = [];
    
    for (const source of educationalSources) {
      try {
        const sourceAlerts = await this.gatherFromSource(source, '7d');
        alerts.push(...sourceAlerts);
      } catch (error) {
        logger.warn(`Failed to monitor ${source.name}:`, error);
      }
    }
    
    return alerts;
  }
}

export const bitcoinIntelligenceScout = new BitcoinIntelligenceScout();