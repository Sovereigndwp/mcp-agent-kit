// src/agents/CanvaDesignCoach.ts
import { z } from 'zod';
import { BaseAgent } from '../core/BaseAgent.js';
import { btc_price } from '../tools/btc_price.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { SocraticTutor } from './SocraticTutor.js';
import { canvaTools } from '../tools/canva_api.js';
import { ContentGamificationEngine } from './ContentGamificationEngine.js';
import fs from 'fs';
import path from 'path';

// Layer D Brand Colors (inspired by your designs)
const LAYER_D_PALETTE = {
  dark: '#1a1a1a',
  deepPurple: '#2d1b3d',
  orange: '#f2a900',
  sovereignGold: '#ffb800',
  trustBlue: '#304254',
  white: '#ffffff',
  grey: '#6c7293'
} as const;

// Player Archetypes (from our simulation)
const PLAYER_ARCHETYPES = {
  'sovereign-stacker': {
    colors: [LAYER_D_PALETTE.sovereignGold, LAYER_D_PALETTE.orange],
    style: 'technical',
    icons: ['🛡️', '🔑', '⚡'],
    theme: 'sovereignty'
  },
  'strategic-investor': {
    colors: [LAYER_D_PALETTE.trustBlue, '#4a90e2'],
    style: 'professional',
    icons: ['📈', '💎', '🎯'],
    theme: 'growth'
  },
  'traditional-saver': {
    colors: [LAYER_D_PALETTE.grey, '#8fb4cb'],
    style: 'conservative',
    icons: ['🏦', '💰', '🛡️'],
    theme: 'safety'
  }
} as const;

// Zod Schemas
const TimelineVisualizationInput = z.object({
  currentYear: z.string(),
  playerProgress: z.object({
    sovereigntyScore: z.number().min(0).max(100),
    resilienceScore: z.number().min(0).max(100),
    completedPeriods: z.array(z.string()),
    currentArchetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver'])
  }),
  timelineData: z.any().optional(),
  visualStyle: z.enum(['dark', 'light', 'auto']).default('dark')
});

const AchievementBadgeInput = z.object({
  badgeType: z.enum(['sovereignty', 'knowledge', 'resilience', 'milestone']),
  achievementName: z.string(),
  description: z.string(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  playerArchetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver']),
  unlocked: z.boolean().default(false)
});

const ProgressIndicatorInput = z.object({
  scoreType: z.enum(['sovereignty', 'resilience', 'knowledge', 'portfolio']),
  currentValue: z.number().min(0).max(100),
  targetValue: z.number().min(0).max(100),
  historical: z.array(z.object({
    period: z.string(),
    value: z.number()
  })).optional(),
  playerArchetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver'])
});

const DashboardLayoutInput = z.object({
  playerArchetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver']),
  currentPeriod: z.string(),
  portfolioData: z.object({
    fiat: z.number(),
    stocks: z.number(),
    gold: z.number(),
    bitcoin: z.number()
  }),
  scores: z.object({
    sovereignty: z.number().min(0).max(100),
    resilience: z.number().min(0).max(100)
  }),
  achievements: z.array(z.string()),
  visualStyle: z.enum(['dark', 'light', 'auto']).default('dark')
});

const InfographicInput = z.object({
  concept: z.enum(['self-custody', 'network-effects', 'monetary-sovereignty', 'halving-cycles', 'lightning-network']),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']),
  playerArchetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver']),
  includeInteractive: z.boolean().default(true)
});

const ArchetypeVisualizationInput = z.object({
  archetype: z.enum(['sovereign-stacker', 'strategic-investor', 'traditional-saver']),
  includeProgress: z.boolean().default(true),
  includeGoals: z.boolean().default(true),
  style: z.enum(['portrait', 'infographic', 'dashboard']).default('infographic')
});

// Utility Functions
function fkEase(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]/g) || []).length);
  const words = Math.max(1, (text.trim().split(/\s+/g) || []).length);
  const syllables = Math.max(
    words,
    (text.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length
  );
  const wps = words / sentences;
  const spw = syllables / words;
  return Math.round((206.835 - 1.015 * wps - 84.6 * spw) * 10) / 10;
}

function chunkSlides(raw: string): string[] {
  const blocks = raw
    .split(/\n{2,}/g)
    .map(s => s.trim())
    .filter(Boolean);
  return blocks;
}

function makeCsv(headers: string[], row: (string | number)[]): string {
  const esc = (s: any) =>
    `"${String(s ?? '').replace(/"/g, '""')}"`;
  return `${headers.join(',')}\n${row.map(esc).join(',')}\n`;
}

export class CanvaDesignCoach extends BaseAgent {
  private socraticTutor: SocraticTutor;
  private gamificationEngine: ContentGamificationEngine;
  private timelineData: any;

  constructor() {
    super({
      name: 'CanvaDesignCoach',
      version: '2.0.0',
      description: 'Enhanced Canva design coach for Bitcoin education with Layer D branding',
      capabilities: [
        'timeline-visualization',
        'achievement-badges',
        'progress-indicators',
        'dashboard-layouts',
        'bitcoin-infographics',
        'archetype-visualization'
      ]
    });

    this.socraticTutor = new SocraticTutor();
    this.gamificationEngine = new ContentGamificationEngine();
    this.loadTimelineData();
  }

  private async loadTimelineData(): Promise<void> {
    try {
      const timelinePath = path.join(process.cwd(), 'data', 'bitcoin-stax-timeline.json');
      if (fs.existsSync(timelinePath)) {
        const rawData = fs.readFileSync(timelinePath, 'utf8');
        this.timelineData = JSON.parse(rawData);
      }
    } catch (error) {
      console.warn('Failed to load timeline data:', error);
      this.timelineData = null;
    }
  }

  protected getTools() {
    return {
      // Tool 1: Timeline Visualization (inspired by "Question Everything" progressive approach)
      create_timeline_visualization: {
        description: 'Create Bitcoin education timeline visualization with Layer D dark theme',
        input_schema: TimelineVisualizationInput,
        handler: async (input: z.infer<typeof TimelineVisualizationInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.playerProgress.currentArchetype];
          const [price, fees] = await Promise.all([btc_price(), getFeeEstimates()]);

          return {
            design_brief: {
              title: `Bitcoin Journey Timeline - ${input.currentYear}`,
              theme: 'Layer D Dark Theme',
              primaryColors: archetype.colors,
              backgroundGradient: `linear-gradient(135deg, ${LAYER_D_PALETTE.dark} 0%, ${LAYER_D_PALETTE.deepPurple} 100%)`,
              typography: 'Arimo, sans-serif',
              layout: 'horizontal-timeline',
              elements: {
                progressBar: {
                  completed: input.playerProgress.completedPeriods.length,
                  total: this.timelineData?.timeline?.length || 11,
                  sovereigntyScore: input.playerProgress.sovereigntyScore,
                  resilienceScore: input.playerProgress.resilienceScore
                },
                currentPeriod: {
                  year: input.currentYear,
                  highlight: archetype.colors[0],
                  icon: archetype.icons[0]
                },
                historicalMarkers: this.timelineData?.timeline?.map((period: any) => ({
                  year: period.year,
                  status: period.status,
                  completed: input.playerProgress.completedPeriods.includes(period.year)
                })) || []
              }
            },
            canva_templates: {
              presentation: 'bitcoin-timeline-dark',
              infographic: 'sovereign-journey',
              social: 'progress-update'
            },
            live_data: {
              btc_price: price.usd,
              current_fees: fees.fastestFee
            }
          };
        }
      },

      // Tool 2: Achievement Badge Design
      create_achievement_badge: {
        description: 'Design achievement badges for Bitcoin education milestones',
        input_schema: AchievementBadgeInput,
        handler: async (input: z.infer<typeof AchievementBadgeInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.playerArchetype];

          // Get related achievements from gamification engine
          const relatedAchievements = await this.gamificationEngine.callTool(
            'analyze_learner_motivation',
            { content: input.description, contentType: 'achievement' }
          );

          const rarityColors = {
            common: '#6c7293',
            rare: '#4a90e2',
            epic: '#f2a900',
            legendary: '#ffb800'
          };

          return {
            badge_design: {
              name: input.achievementName,
              description: input.description,
              rarity: input.rarity,
              colors: {
                primary: rarityColors[input.rarity],
                secondary: archetype.colors[0],
                background: input.unlocked ? LAYER_D_PALETTE.dark : '#2a2a2a'
              },
              shape: input.badgeType === 'sovereignty' ? 'shield' : 'hexagon',
              icon: archetype.icons[Math.floor(Math.random() * archetype.icons.length)],
              effects: {
                unlocked: input.unlocked,
                glow: input.unlocked ? rarityColors[input.rarity] : 'none',
                animation: input.unlocked ? 'pulse' : 'grayscale'
              }
            },
            motivation_analysis: relatedAchievements,
            template_suggestions: [
              `badge-${input.badgeType}-${input.rarity}`,
              `archetype-${input.playerArchetype}`,
              'layer-d-dark-theme'
            ]
          };
        }
      },

      // Tool 3: Progress Indicators
      create_progress_indicator: {
        description: 'Design progress tracking visualizations for sovereignty and resilience scores',
        input_schema: ProgressIndicatorInput,
        handler: async (input: z.infer<typeof ProgressIndicatorInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.playerArchetype];

          const progressMetrics = {
            sovereignty: {
              icon: '🛡️',
              color: LAYER_D_PALETTE.sovereignGold,
              description: 'Your path to financial sovereignty'
            },
            resilience: {
              icon: '💎',
              color: LAYER_D_PALETTE.orange,
              description: 'Your strength through market cycles'
            },
            knowledge: {
              icon: '🧠',
              color: LAYER_D_PALETTE.trustBlue,
              description: 'Your Bitcoin understanding depth'
            },
            portfolio: {
              icon: '💰',
              color: archetype.colors[0],
              description: 'Your financial performance'
            }
          };

          const metric = progressMetrics[input.scoreType];

          return {
            progress_design: {
              type: input.scoreType,
              current: input.currentValue,
              target: input.targetValue,
              completion: Math.round((input.currentValue / input.targetValue) * 100),
              visual: {
                type: 'circular-progress',
                primaryColor: metric.color,
                backgroundColor: LAYER_D_PALETTE.dark,
                strokeWidth: 8,
                icon: metric.icon,
                description: metric.description
              },
              historical_chart: input.historical?.map(point => ({
                period: point.period,
                value: point.value,
                color: point.value >= input.currentValue ? metric.color : LAYER_D_PALETTE.grey
              })),
              archetype_styling: {
                theme: archetype.theme,
                accentColor: archetype.colors[1]
              }
            },
            canva_specs: {
              dimensions: '400x400',
              format: 'PNG',
              background: 'transparent',
              template: `progress-${input.scoreType}-${archetype.style}`
            }
          };
        }
      },

      // Tool 4: Dashboard Layout Design
      create_dashboard_layout: {
        description: 'Design personalized dashboard layouts for different player archetypes',
        input_schema: DashboardLayoutInput,
        handler: async (input: z.infer<typeof DashboardLayoutInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.playerArchetype];
          const [price, fees] = await Promise.all([btc_price(), getFeeEstimates()]);

          const dashboardSections = {
            'sovereign-stacker': [
              'sovereignty-score',
              'self-custody-status',
              'node-operation',
              'privacy-tools',
              'bitcoin-only-portfolio'
            ],
            'strategic-investor': [
              'portfolio-performance',
              'market-analysis',
              'diversification-metrics',
              'growth-tracking',
              'opportunity-alerts'
            ],
            'traditional-saver': [
              'safety-score',
              'gradual-adoption',
              'educational-progress',
              'conservative-allocation',
              'learning-path'
            ]
          };

          return {
            dashboard_layout: {
              archetype: input.playerArchetype,
              theme: archetype.theme,
              primaryColor: archetype.colors[0],
              secondaryColor: archetype.colors[1],
              backgroundGradient: `linear-gradient(135deg, ${LAYER_D_PALETTE.dark} 0%, ${LAYER_D_PALETTE.deepPurple} 100%)`,
              sections: dashboardSections[input.playerArchetype].map(section => ({
                id: section,
                title: section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                position: 'grid-auto',
                data: this.getDashboardSectionData(section, input)
              })),
              widgets: {
                btc_price: {
                  value: price.usd,
                  change_24h: '+2.3%', // This would come from live data
                  color: LAYER_D_PALETTE.sovereignGold
                },
                current_period: input.currentPeriod,
                achievements_count: input.achievements.length,
                sovereignty_level: this.getSovereigntyLevel(input.scores.sovereignty),
                resilience_level: this.getResilienceLevel(input.scores.resilience)
              }
            },
            responsive_breakpoints: {
              mobile: '375px',
              tablet: '768px',
              desktop: '1200px'
            },
            canva_template: `dashboard-${input.playerArchetype}-dark`
          };
        }
      },

      // Tool 5: Bitcoin Concept Infographics
      create_bitcoin_infographic: {
        description: 'Create educational infographics for key Bitcoin concepts',
        input_schema: InfographicInput,
        handler: async (input: z.infer<typeof InfographicInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.playerArchetype];

          // Get Socratic questions for the concept
          const relatedQuestions = await this.socraticTutor.generateQuestions(
            input.concept.replace('-', ''),
            input.complexity,
            3
          );

          const conceptData = {
            'self-custody': {
              title: 'Be Your Own Bank',
              subtitle: 'Why holding your own keys matters',
              keyPoints: ['Not your keys, not your Bitcoin', 'Eliminate counterparty risk', 'True financial sovereignty'],
              visual: 'key-and-lock-metaphor',
              progression: ['Exchange → Web Wallet → Hardware Wallet → Multi-sig']
            },
            'network-effects': {
              title: 'Bitcoin Network Effects',
              subtitle: 'How Bitcoin grows stronger with adoption',
              keyPoints: ['More users = more security', 'Merchants accept = utility', 'Developers build = innovation'],
              visual: 'network-graph',
              progression: ['Individual → Community → Global → Sovereign']
            },
            'monetary-sovereignty': {
              title: 'Monetary Sovereignty',
              subtitle: 'From central banking to self-banking',
              keyPoints: ['Fixed supply vs inflation', 'Permissionless vs gatekeeper', 'Censorship resistant vs controlled'],
              visual: 'sovereignty-pyramid',
              progression: ['Fiat → Gold → Bitcoin → Sovereignty']
            }
          };

          const concept = conceptData[input.concept] || conceptData['self-custody'];

          return {
            infographic_design: {
              title: concept.title,
              subtitle: concept.subtitle,
              complexity: input.complexity,
              theme: 'Layer D Dark Educational',
              colors: {
                primary: archetype.colors[0],
                secondary: archetype.colors[1],
                background: LAYER_D_PALETTE.dark,
                text: LAYER_D_PALETTE.white,
                accent: LAYER_D_PALETTE.orange
              },
              layout: {
                type: 'vertical-flow',
                sections: [
                  {
                    type: 'header',
                    content: concept.title,
                    visual: concept.visual
                  },
                  {
                    type: 'key-points',
                    content: concept.keyPoints,
                    style: 'numbered-list'
                  },
                  {
                    type: 'progression',
                    content: concept.progression,
                    style: 'arrow-flow'
                  },
                  {
                    type: 'socratic-questions',
                    content: relatedQuestions.questions,
                    style: 'question-cards'
                  }
                ]
              },
              interactive: input.includeInteractive ? {
                qr_codes: true,
                clickable_demos: true,
                progress_tracking: true
              } : null
            },
            educational_flow: relatedQuestions,
            template_variants: [
              `infographic-${input.concept}-${input.complexity}`,
              `archetype-${input.playerArchetype}`,
              'layer-d-educational'
            ]
          };
        }
      },

      // Tool 6: Archetype Visualization
      create_archetype_visualization: {
        description: 'Create visual representations of different player archetypes',
        input_schema: ArchetypeVisualizationInput,
        handler: async (input: z.infer<typeof ArchetypeVisualizationInput>) => {
          const archetype = PLAYER_ARCHETYPES[input.archetype];

          const archetypeData = {
            'sovereign-stacker': {
              title: 'The Sovereign Stacker',
              description: 'Masters of self-custody and Bitcoin sovereignty',
              traits: ['Technical expertise', 'Long-term thinking', 'Privacy focused', 'Node operator'],
              goals: ['Achieve complete financial sovereignty', 'Master self-custody', 'Understand Bitcoin deeply'],
              tools: ['Hardware wallets', 'Multi-sig', 'Lightning Network', 'Bitcoin Core'],
              progression: ['Beginner → Hodler → Stacker → Sovereign']
            },
            'strategic-investor': {
              title: 'The Strategic Investor',
              description: 'Optimizes portfolio allocation and market timing',
              traits: ['Analytical mindset', 'Risk management', 'Market awareness', 'Performance focused'],
              goals: ['Maximize returns', 'Diversify wisely', 'Time markets', 'Build wealth'],
              tools: ['Portfolio tracking', 'Market analysis', 'DCA strategies', 'Exchange platforms'],
              progression: ['Saver → Investor → Strategist → Wealth Builder']
            },
            'traditional-saver': {
              title: 'The Traditional Saver',
              description: 'Cautious learners exploring Bitcoin gradually',
              traits: ['Risk averse', 'Education focused', 'Gradual adoption', 'Safety conscious'],
              goals: ['Learn safely', 'Preserve capital', 'Understand Bitcoin', 'Gradual allocation'],
              tools: ['Educational resources', 'Conservative allocation', 'Trusted platforms', 'Learning paths'],
              progression: ['Skeptic → Curious → Learner → Adopter']
            }
          };

          const data = archetypeData[input.archetype];

          return {
            archetype_visualization: {
              archetype: input.archetype,
              title: data.title,
              description: data.description,
              visual_style: {
                primaryColor: archetype.colors[0],
                secondaryColor: archetype.colors[1],
                backgroundColor: LAYER_D_PALETTE.dark,
                style: archetype.style,
                icons: archetype.icons
              },
              content_sections: [
                {
                  type: 'portrait',
                  content: {
                    icon: archetype.icons[0],
                    title: data.title,
                    description: data.description
                  }
                },
                {
                  type: 'traits',
                  content: data.traits,
                  style: 'icon-grid'
                },
                ...(input.includeGoals ? [{
                  type: 'goals',
                  content: data.goals,
                  style: 'checklist'
                }] : []),
                {
                  type: 'tools',
                  content: data.tools,
                  style: 'tool-icons'
                },
                ...(input.includeProgress ? [{
                  type: 'progression',
                  content: data.progression,
                  style: 'progress-path'
                }] : [])
              ],
              layout_style: input.style
            },
            personalization: {
              motivational_messaging: this.getMotivationalMessaging(input.archetype),
              recommended_next_steps: this.getRecommendedNextSteps(input.archetype)
            },
            canva_template: `archetype-${input.archetype}-${input.style}`
          };
        }
      }
    };
  }

  // Helper methods
  private getDashboardSectionData(section: string, input: z.infer<typeof DashboardLayoutInput>) {
    // Implementation would fetch real data based on section type
    return {
      mock_data: `Data for ${section}`,
      values: input.portfolioData,
      scores: input.scores
    };
  }

  private getSovereigntyLevel(score: number): string {
    if (score >= 80) return 'Sovereign Master';
    if (score >= 60) return 'Advanced Stacker';
    if (score >= 40) return 'Learning Stacker';
    return 'Bitcoin Curious';
  }

  private getResilienceLevel(score: number): string {
    if (score >= 80) return 'Diamond Hands';
    if (score >= 60) return 'Strong Hodler';
    if (score >= 40) return 'Growing Resilience';
    return 'Building Conviction';
  }

  private getMotivationalMessaging(archetype: string): string[] {
    const messages = {
      'sovereign-stacker': [
        'Every sat you stack is a vote for sovereignty',
        'Not your keys, not your Bitcoin',
        'Be your own bank'
      ],
      'strategic-investor': [
        'Time in market beats timing the market',
        'Stack sats and stay humble',
        'Think in decades, not days'
      ],
      'traditional-saver': [
        'Education is the best investment',
        'Start small, learn continuously',
        'Safety through understanding'
      ]
    };
    return messages[archetype] || messages['traditional-saver'];
  }

  private getRecommendedNextSteps(archetype: string): string[] {
    const steps = {
      'sovereign-stacker': [
        'Set up multi-signature wallet',
        'Run your own Bitcoin node',
        'Learn Lightning Network'
      ],
      'strategic-investor': [
        'Implement DCA strategy',
        'Analyze market cycles',
        'Diversify with real estate'
      ],
      'traditional-saver': [
        'Read "The Bitcoin Standard"',
        'Start with small allocation',
        'Use educational platforms'
      ]
    };
    return steps[archetype] || steps['traditional-saver'];
  }

  // Legacy compatibility method
  async run_CanvaDesignCoach(
    moduleTitle: string,
    rawText: string,
    options: { createDesigns?: boolean; folderName?: string } = {}
  ) {
    // Maintain backward compatibility while using new architecture
    const [price, fees] = await Promise.all([btc_price(), getFeeEstimates()]);
    const socraticQuestions = await this.socraticTutor.generateQuestions('fees', 'beginner', 5);

    const briefLines: string[] = [];
    briefLines.push(`# Layer D Design Brief — ${moduleTitle}`);
    briefLines.push(`**Layer D Branding**: Dark theme, sovereignty colors, progressive education`);
    briefLines.push(`Reading Ease (Flesch): **${fkEase(rawText)}** (aim 60–75).`);
    briefLines.push(`BTC price ~ **${Math.round(price.usd)} USD**.`);
    briefLines.push(`Fees (sat/vB): Fast **${Math.round(fees.fastestFee ?? 0)}**, Medium **${Math.round(fees.hourFee ?? 0)}**, Slow **${Math.round(fees.economyFee ?? 0)}**.`);

    return {
      briefMd: briefLines.join('\n'),
      bulkCsv: makeCsv(['module', 'price_usd'], [moduleTitle, Math.round(price.usd)]),
      layer_d_branding: true,
      enhanced_tools: Object.keys(this.getTools())
    };
  }
}