import { readFileSync } from 'fs';
import path from 'path';
import { ContentGamificationEngine } from '../agents/ContentGamificationEngine.js';
import { EnhancedCanvaDesignCoach } from '../agents/EnhancedCanvaDesignCoach.js';
import { SovereigntyMentor } from '../agents/SovereigntyMentor.js';
import { RealTimeMarketEducator } from '../agents/RealTimeMarketEducator.js';
import { EconomicModelingAgent } from '../agents/EconomicModelingAgent.js';
import { btc_price } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { logger } from '../utils/logger.js';

type Interest = 'history' | 'privacy' | 'building' | 'investing' | 'sovereignty' | 'education';

type StoryNavigatorRequest = {
  learnerName?: string;
  interests?: string[];
  background?: string;
  goal?: string;
};

type VisualSynthRequest = {
  concept: string;
  audience?: 'beginner' | 'intermediate' | 'advanced';
  visualType?: 'process_flow' | 'comparison' | 'timeline' | 'hierarchy' | 'relationship';
  interactivity?: boolean;
};

type DebateArenaRequest = {
  topic: string;
  focus?: 'economic' | 'technical' | 'philosophical';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};

type FutureOracleRequest = {
  horizon?: '2030' | '2040' | '2050';
  scenario?: 'hyperbitcoinization' | 'balanced_adoption' | 'regulatory_pushback';
};

type StrategyAdvisorRequest = {
  currentLevel?: 'aware' | 'learning' | 'practicing' | 'advanced';
  riskTolerance?: 'low' | 'medium' | 'high';
  priorityAreas?: string[];
  timeframe?: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
};

type DataPoetRequest = {
  theme?: 'sovereignty' | 'market' | 'technology';
  emphasis?: 'hopeful' | 'cautious' | 'celebratory';
};

interface TimelinePeriod {
  year: string;
  period: string;
  events: string[];
  bitcoinRelevance: string;
  economicContext: string;
  socraticQuestion: string;
}

const timelineDataPath = path.resolve('data/bitcoin-stax-timeline.json');
let timelineData: { timeline: TimelinePeriod[] } | null = null;

function loadTimeline(): { timeline: TimelinePeriod[] } {
  if (!timelineData) {
    try {
      const raw = readFileSync(timelineDataPath, 'utf-8');
      timelineData = JSON.parse(raw);
    } catch (error) {
      logger.error('Failed to load timeline data for AI tutors', error);
      timelineData = { timeline: [] };
    }
  }
  return timelineData!;
}

function normalizeInterests(interests: string[] = []): Interest[] {
  const mapping: Record<string, Interest> = {
    history: 'history',
    timeline: 'history',
    sovereignty: 'sovereignty',
    privacy: 'privacy',
    build: 'building',
    developer: 'building',
    invest: 'investing',
    education: 'education',
    teaching: 'education',
    security: 'privacy'
  };

  const results = interests
    .map(item => item.toLowerCase().trim())
    .map(item => mapping[item] || null)
    .filter((item): item is Interest => Boolean(item));

  return results.length > 0 ? results : ['history'];
}

export class AITutorService {
  private storyEngine = new ContentGamificationEngine();
  private visualCoach = new EnhancedCanvaDesignCoach();
  private sovereigntyMentor = new SovereigntyMentor();
  private marketEducator = new RealTimeMarketEducator();
  private economicModeler = new EconomicModelingAgent();

  async generateStoryNavigatorSession(request: StoryNavigatorRequest) {
    const { learnerName = 'Explorer', interests = [], background, goal } = request;
    const normalizedInterests = normalizeInterests(interests);
    const timeline = loadTimeline().timeline;

    const storyline = this.buildStoryArc(timeline, normalizedInterests, goal);

    const reflectionPrompts = this.generateReflectionPrompts(normalizedInterests, storyline);

    return {
      profile: {
        name: learnerName,
        background: background || 'Curious learner stepping into Bitcoin history',
        goal: goal || 'Build a resilient understanding of Bitcoin sovereignty'
      },
      storyline,
      reflections: reflectionPrompts,
      recommendedExperiences: this.recommendExperiences(normalizedInterests),
      nextSteps: this.createStoryNextSteps(goal)
    };
  }

  async generateVisualSynthesis(request: VisualSynthRequest) {
    const {
      concept,
      audience = 'beginner',
      visualType = 'process_flow',
      interactivity = false
    } = request;

    const result = await this.visualCoach.handleToolCall('create_bitcoin_concept_infographics', {
      bitcoinConcept: concept,
      targetAudience: audience,
      visualType,
      includeInteractivity: interactivity,
      realWorldExamples: true
    });

    return {
      concept,
      audience,
      visualType,
      ...((result as any)?.data || {}),
      colorPalette: this.derivePalette(audience, concept)
    };
  }

  generateDebateSession(request: DebateArenaRequest) {
    const { topic, focus = 'economic', difficulty = 'intermediate' } = request;
    const participants = this.createDebateParticipants(focus);

    const rounds = participants.map(participant => ({
      participant: participant.name,
      stance: participant.stance(topic),
      supportingPoints: participant.supportingPoints(topic, difficulty),
      rebuttalTargets: participants
        .filter(other => other.name !== participant.name)
        .map(other => ({
          opponent: other.name,
          rebuttal: participant.rebuttal(topic, other.perspective)
        })),
      takeaway: participant.takeaway(topic)
    }));

    return {
      topic,
      focus,
      difficulty,
      participants: participants.map(p => ({ name: p.name, archetype: p.perspective })),
      rounds,
      moderatorNotes: this.generateModeratorNotes(topic, focus, difficulty)
    };
  }

  async generateFutureOracleScenario(request: FutureOracleRequest) {
    const { horizon = '2040', scenario = 'balanced_adoption' } = request;

    const monetaryModel = await this.economicModeler.handleToolCall('create_monetary_policy_model', {
      model_type: 'stock_to_flow',
      time_horizon: horizon === '2030' ? 'projected_10_years' : 'projected_50_years',
      comparison_systems: ['fiat_currencies', 'gold_standard'],
      interactivity_level: 'scenario_simulation'
    });

    const adoptionModel = await this.economicModeler.handleToolCall('analyze_adoption_economics', {
      adoption_model: 's_curve_adoption',
      adoption_drivers: ['financial_inclusion', 'store_of_value', 'technological_infrastructure'],
      regional_focus: ['emerging_markets', 'developed_markets'],
      predictive_elements: true
    });

    return {
      horizon,
      scenario,
      headline: this.createFutureHeadline(horizon, scenario),
      economicSignals: (monetaryModel as any)?.data || {},
      adoptionSignals: (adoptionModel as any)?.data || {},
      milestones: this.generateFutureMilestones(horizon, scenario),
      riskRadar: this.generateRiskRadar(scenario),
      opportunityMap: this.generateOpportunityMap(scenario)
    };
  }

  async generateStrategyAdvisorPlan(request: StrategyAdvisorRequest) {
    const {
      currentLevel = 'learning',
      riskTolerance = 'medium',
      priorityAreas = ['self-custody', 'privacy'],
      timeframe = 'medium-term'
    } = request;

    const profile = {
      currentLevel,
      sovereigntyGoals: priorityAreas,
      riskTolerance,
      technicalAbility: currentLevel === 'aware' ? 'beginner' : currentLevel === 'advanced' ? 'advanced' : 'intermediate',
      privacyNeeds: ['protect_identity', 'transaction_privacy'],
      securityConcerns: ['exchange_risk', 'social_engineering'],
      timeCommitment: timeframe === 'immediate' ? 'daily' : 'weekly',
      practicalConstraints: ['limited_time']
    };

    const roadmap = await this.sovereigntyMentor.handleToolCall('design_sovereignty_roadmap', {
      sovereigntyProfile: profile,
      timeframe,
      priorityAreas,
      riskManagement: riskTolerance === 'high' ? 'aggressive' : riskTolerance === 'low' ? 'conservative' : 'balanced',
      practicalConstraints: ['family_obligations']
    });

    const readiness = await this.sovereigntyMentor.handleToolCall('assess_sovereignty_readiness', {
      studentId: 'strategy-advisor',
      assessmentAreas: ['financial', 'technical', 'security'],
      currentSituation: {
        bankingDependency: 'moderate',
        investmentApproach: 'diversified',
        privacyPractices: 'basic',
        technicalSkills: profile.technicalAbility
      },
      sovereigntyMotivations: priorityAreas
    });

    return {
      profile,
      readiness: (readiness as any)?.data || {},
      roadmap: (roadmap as any)?.data || {},
      focusAreas: priorityAreas,
      quickWins: this.generateQuickWins(priorityAreas, riskTolerance),
      accountability: this.createAccountabilityPlan(timeframe)
    };
  }

  async generateDataPoetPiece(request: DataPoetRequest) {
    const { theme = 'market', emphasis = 'hopeful' } = request;
    const [priceSnapshot, feeSnapshot] = await Promise.all([
      btc_price(),
      mempoolFeeEstimatesTool.getFeeEstimates()
    ]);

    const verse = this.composePoem(theme, emphasis, priceSnapshot, feeSnapshot);

    return {
      theme,
      emphasis,
      metrics: {
        price: priceSnapshot.usd,
        conversions: priceSnapshot.conversions,
        feeEstimates: feeSnapshot
      },
      verses: verse.lines,
      closing: verse.closing,
      performanceNotes: verse.performanceNotes
    };
  }

  private buildStoryArc(timeline: TimelinePeriod[], interests: Interest[], goal?: string) {
    const majorBeats = this.selectTimelineBeats(timeline, interests);

    return majorBeats.map((period, index) => ({
      chapter: index + 1,
      title: this.createChapterTitle(period, interests[index % interests.length]),
      year: period.year,
      setting: period.period,
      keyEvents: period.events.slice(0, 3),
      bitcoinRelevance: period.bitcoinRelevance,
      decisionPoint: period.socraticQuestion,
      sovereigntySignal: this.highlightSovereigntySignal(period, interests),
      reflection: this.buildReflection(period, goal)
    }));
  }

  private selectTimelineBeats(timeline: TimelinePeriod[], interests: Interest[]) {
    if (timeline.length === 0) return [];
    const beats: TimelinePeriod[] = [];

    const segments = [
      timeline.slice(0, Math.max(1, Math.floor(timeline.length / 3))),
      timeline.slice(Math.floor(timeline.length / 3), Math.floor((timeline.length / 3) * 2)),
      timeline.slice(Math.floor((timeline.length / 3) * 2))
    ];

    segments.forEach((segment, index) => {
      if (segment.length === 0) return;
      const interest = interests[index % interests.length];
      const pick = segment.find(period => this.periodMatchesInterest(period, interest));
      beats.push(pick || segment[0]);
    });

    return beats;
  }

  private periodMatchesInterest(period: TimelinePeriod, interest: Interest): boolean {
    const text = `${period.events.join(' ')} ${period.bitcoinRelevance} ${period.economicContext}`.toLowerCase();
    switch (interest) {
      case 'history':
        return /first|whitepaper|early|foundation|2008|2009/.test(text);
      case 'privacy':
        return /self-custody|privacy|keys|mt\. gox|regulation/.test(text);
      case 'building':
        return /infrastructure|development|build|lightning|taproot/.test(text);
      case 'investing':
        return /price|adoption|market|etf|institution/.test(text);
      case 'sovereignty':
        return /self-custody|sovereignty|freedom|survive/.test(text);
      case 'education':
        return /lesson|learn|teach|understand/.test(text);
      default:
        return false;
    }
  }

  private createChapterTitle(period: TimelinePeriod, interest: Interest): string {
    const base = period.period.replace(/&/g, 'and');
    switch (interest) {
      case 'privacy':
        return `${base}: Guarding the Keys`;
      case 'building':
        return `${base}: Builders at Work`;
      case 'investing':
        return `${base}: Markets Wake Up`;
      case 'sovereignty':
        return `${base}: Choosing Independence`;
      case 'education':
        return `${base}: Lessons in Motion`;
      default:
        return `${base}: The Story Unfolds`;
    }
  }

  private highlightSovereigntySignal(period: TimelinePeriod, interests: Interest[]): string {
    if (interests.includes('sovereignty')) {
      return 'Focus on personal custody decisions and resilience building opportunities.';
    }
    if (interests.includes('privacy')) {
      return 'Watch for privacy trade-offs and regulatory reactions.';
    }
    if (interests.includes('building')) {
      return 'Note the developer momentum and new infrastructure capabilities.';
    }
    return 'Track how this period shapes conviction and long-term perspective.';
  }

  private buildReflection(period: TimelinePeriod, goal?: string): string {
    const goalText = goal ? ` as you pursue "${goal}"` : '';
    return `How would you respond to "${period.socraticQuestion}"${goalText}?`;
  }

  private generateReflectionPrompts(interests: Interest[], storyline: ReturnType<typeof this.buildStoryArc>) {
    const basePrompts = [
      'How does this period change your view of Bitcoin\'s purpose?',
      'What decision would you make differently with today\'s knowledge?',
      'Which values (privacy, resilience, openness) mattered most in this era?'
    ];

    if (interests.includes('privacy')) {
      basePrompts.push('Where would you draw the line between compliance and privacy protection?');
    }
    if (interests.includes('building')) {
      basePrompts.push('What tools or infrastructure would you build to solve the pain points in this chapter?');
    }
    if (interests.includes('education')) {
      basePrompts.push('How would you teach this moment to someone new to Bitcoin?');
    }

    return {
      prompts: basePrompts,
      chapterConnections: storyline.map(chapter => ({
        chapter: chapter.title,
        prompt: `What\'s the most important lesson from ${chapter.year} for your journey today?`
      }))
    };
  }

  private recommendExperiences(interests: Interest[]) {
    const catalog: Record<Interest, string[]> = {
      history: ['Walk through the Genesis block in a block explorer', 'Replay the 2013 Mt. Gox timeline to identify warning signs'],
      privacy: ['Set up a fresh hardware wallet with passphrase', 'Try a coinjoin simulation with testnet coins'],
      building: ['Prototype a Lightning invoice flow', 'Draft user stories for onboarding new peers'],
      investing: ['Compare stock-to-flow projections to actual supply data', 'Build a dollar-cost-average tracker in sheets'],
      sovereignty: ['Create an emergency custody plan', 'List every point of custodial dependence in your finances'],
      education: ['Design a micro-lesson explaining the halving', 'Host a guided discussion on Bitcoin\'s monetary policy']
    };

    const unique = new Set<string>();
    interests.forEach(interest => {
      catalog[interest].forEach(item => unique.add(item));
    });

    return Array.from(unique);
  }

  private createStoryNextSteps(goal?: string) {
    const base = ['Log reflections in your sovereignty journal', 'Share one lesson with a peer', 'Select a practice habit for the coming week'];
    if (goal) {
      base.unshift(`Define one measurable milestone toward "${goal}".`);
    }
    return base;
  }

  private derivePalette(audience: string, concept: string) {
    if (audience === 'beginner') {
      return ['#F7931A', '#FFE8C2', '#1F2937'];
    }
    if (concept.toLowerCase().includes('privacy')) {
      return ['#0f172a', '#64748b', '#14b8a6'];
    }
    return ['#F7931A', '#10B981', '#0EA5E9'];
  }

  private createDebateParticipants(focus: DebateArenaRequest['focus']) {
    return [
      {
        name: 'Austrian Economist',
        perspective: 'Sound Money Advocate',
        stance: (topic: string) => `Bitcoin as the antidote to ${topic} through disciplined monetary policy.`,
        supportingPoints: (topic: string, level: string) => [
          `Highlights historic failures of discretionary policy around ${topic}.`,
          'Explains how fixed supply protects savings across generations.',
          level !== 'beginner' ? 'Connects Mises and Hayek principles to current market dynamics.' : 'Uses household budgeting analogies for clarity.'
        ],
        rebuttal: (topic: string, opponentPerspective: string) => `Challenges ${opponentPerspective} by pointing to incentive misalignment in ${topic}.`,
        takeaway: (topic: string) => `Adopt Bitcoin savings discipline to neutralize ${topic} risk.`
      },
      {
        name: 'Lightning Engineer',
        perspective: 'Scalability Pragmatist',
        stance: (topic: string) => `Layered scaling ensures ${topic} remains user-friendly and inexpensive.`,
        supportingPoints: (topic: string, level: string) => [
          'Breaks down base layer settlement versus fast payment layers.',
          'Highlights real-world communities using Lightning for everyday commerce.',
          level === 'advanced' ? 'Discusses liquidity routing algorithms and fee markets.' : 'Shows how QR payments feel instant.'
        ],
        rebuttal: (topic: string, opponentPerspective: string) => `Argues ${opponentPerspective} underestimates user experience constraints in ${topic}.`,
        takeaway: (topic: string) => `Invest time in Lightning tooling to make ${topic} accessible.`
      },
      {
        name: 'Regulatory Strategist',
        perspective: 'Risk Manager',
        stance: (topic: string) => `Strategic engagement with policy keeps ${topic} on a sustainable track.`,
        supportingPoints: (topic: string, level: string) => [
          'Maps current regulatory regimes and grey areas.',
          'Shares playbooks for advocacy and compliance without sacrificing sovereignty.',
          level !== 'advanced' ? 'Provides personal security checklists.' : 'Analyzes cross-border custody implications.'
        ],
        rebuttal: (topic: string, opponentPerspective: string) => `Warns that ignoring ${opponentPerspective} invites avoidable crackdowns in ${topic}.`,
        takeaway: (topic: string) => `Build alliances and legal resilience to future-proof ${topic}.`
      }
    ];
  }

  private generateModeratorNotes(topic: string, focus: string, difficulty: string) {
    return {
      framing: `Today we explore "${topic}" through ${focus}-focused lenses.`,
      learningSignals: [
        'Contrast philosophical convictions with practical trade-offs.',
        'Identify where all perspectives agree on first principles.',
        difficulty === 'advanced' ? 'Trace how on-chain data can validate arguments.' : 'Capture memorable analogies to share with newcomers.'
      ],
      suggestedFollowUps: [
        'Host a peer discussion summarizing each viewpoint.',
        'Document personal stance and unknowns after the debate.',
        'Design an experiment or simulation to test one debated claim.'
      ]
    };
  }

  private createFutureHeadline(horizon: string, scenario: string) {
    const scenarioHeadline: Record<string, string> = {
      hyperbitcoinization: 'Bitcoin becomes default savings technology across the globe',
      balanced_adoption: 'Parallel rails: Bitcoin complements rather than replaces fiat systems',
      regulatory_pushback: 'Jurisdictions diverge, prompting self-custody acceleration'
    };

    return `${horizon} Outlook: ${scenarioHeadline[scenario] || 'Bitcoin adapts to global shifts'}`;
  }

  private generateFutureMilestones(horizon: string, scenario: string) {
    const baseYear = 2025;
    const endYear = Number(horizon);
    const step = Math.max(1, Math.floor((endYear - baseYear) / 3));
    const milestones: { year: number; highlight: string }[] = [];

    for (let year = baseYear + step; year <= endYear; year += step) {
      milestones.push({ year, highlight: this.describeMilestone(year, scenario) });
    }

    return milestones;
  }

  private describeMilestone(year: number, scenario: string): string {
    if (scenario === 'hyperbitcoinization') {
      return year % 2 === 0
        ? 'Nation-state accumulation reaches new highs'
        : 'Grassroots circular economies become default in multiple regions';
    }
    if (scenario === 'regulatory_pushback') {
      return year % 2 === 0
        ? 'Capital controls spark new demand for censorship-resistant rails'
        : 'Self-custody hardware standards mature in response to policy pressure';
    }
    return year % 2 === 0
      ? 'Traditional institutions integrate multisig treasury operations'
      : 'Global remittance corridors re-price around Bitcoin final settlement';
  }

  private generateRiskRadar(scenario: string) {
    if (scenario === 'regulatory_pushback') {
      return ['Sudden KYC tightening', 'Capital flight restrictions', 'Exchange surveillance enhancements'];
    }
    if (scenario === 'hyperbitcoinization') {
      return ['Scalability bottlenecks', 'Miner revenue shifts', 'Custody education gaps'];
    }
    return ['Policy fragmentation', 'Liquidity concentration risks', 'Education adoption gaps'];
  }

  private generateOpportunityMap(scenario: string) {
    return {
      builderOpportunities: scenario === 'hyperbitcoinization'
        ? ['Layer-2 UX platforms', 'Global settlement APIs', 'Education marketplaces']
        : ['Compliance-friendly custody tooling', 'Privacy-preserving analytics', 'Cross-border remittance bridges'],
      learningPriorities: ['Run your own node', 'Practice collaborative custody', 'Model personal cash flows in Bitcoin terms'],
      capitalAllocation: scenario === 'balanced_adoption'
        ? ['Allocate percentage to liquidity provisioning', 'Support open-source maintenance funds']
        : ['Invest in resilient energy-backed miners', 'Fund local circular economy infrastructure']
    };
  }

  private generateQuickWins(priorityAreas: string[], riskTolerance: string) {
    const quickWins: string[] = [];

    if (priorityAreas.includes('self-custody')) {
      quickWins.push('Complete a 15-minute seed backup rehearsal.');
    }
    if (priorityAreas.includes('privacy')) {
      quickWins.push('Rotate on-chain addresses and document your hygiene checklist.');
    }
    if (priorityAreas.includes('earning-bitcoin')) {
      quickWins.push('List one service you can price in sats this week.');
    }
    if (riskTolerance === 'low') {
      quickWins.push('Create a contingency plan for unexpected income volatility.');
    }

    return quickWins;
  }

  private createAccountabilityPlan(timeframe: string) {
    return {
      cadence: timeframe === 'immediate' ? 'daily check-in' : 'weekly review',
      metrics: ['sovereignty_score', 'privacy_practices', 'learning_hours'],
      partners: ['accountability buddy', 'local meetup', 'sovereignty mentor'],
      reviewPrompts: [
        'What strengthened your sovereignty this week?',
        'Where did you remain dependent on custodians?',
        'What will you automate or delegate next?'
      ]
    };
  }

  private composePoem(theme: string, emphasis: string, priceSnapshot: any, feeSnapshot: any) {
    const usd = priceSnapshot.usd;
    const eur = priceSnapshot.conversions?.EUR;
    const fees = feeSnapshot;

    const moodLine = this.moodLine(emphasis);
    const themeLine = this.themeLine(theme, usd);

    const lines = [
      moodLine,
      themeLine,
      `Price whispers: $${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`,
      eur ? `Echo in euros: €${eur.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'Global echoes translate value in every tongue',
      `Mempool pulse: fastest ${fees.fastestFee} sat/vB, gentle ${fees.economyFee} sat/vB`,
      'Blocks breathe every ten-minute heartbeat, etched in glass and math.',
      'Self-custody lanterns paint constellations across the network night.'
    ];

    return {
      lines,
      closing: 'Hold your keys, learn your craft, and let sovereignty rhyme with every confirmation.',
      performanceNotes: {
        tempo: emphasis === 'celebratory' ? 'allegro' : 'andante',
        staging: theme === 'market' ? 'Pair with live price dashboard' : 'Accompany with transaction visualizer'
      }
    };
  }

  private moodLine(emphasis: string) {
    switch (emphasis) {
      case 'cautious':
        return 'A measured cadence walks between uncertainty and resolve;';
      case 'celebratory':
        return 'Trumpets of hash power herald a sovereign sunrise;';
      default:
        return 'Hope hums through encrypted channels, steady and sure;';
    }
  }

  private themeLine(theme: string, usd: number) {
    if (theme === 'sovereignty') {
      return 'Keys in hand, the chorus sings of independence reclaimed;';
    }
    if (theme === 'technology') {
      return `Nodes entwine in lightning arcs, weaving code around $${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`;
    }
    return 'Markets spin their fractal stories, yet the ledger keeps perfect time;';
  }
}

export const aiTutorService = new AITutorService();
