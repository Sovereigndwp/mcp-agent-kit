export interface NewsSource {
  name: string;
  url: string;
  type: 'aggregator' | 'technical' | 'analysis' | 'breaking' | 'regulatory' | 'educational';
  credibility_score: number; // 1-100
  update_frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  focus_areas: string[];
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  category: 'price' | 'technology' | 'regulation' | 'adoption' | 'education' | 'mining' | 'lightning';
  importance: 'critical' | 'high' | 'medium' | 'low';
  educational_opportunity: boolean;
  content_ideas: string[];
  your_perspective?: string;
}

export interface NewsAnalysis {
  trending_topics: string[];
  educational_angles: string[];
  content_opportunities: string[];
  audience_interest_level: number; // 1-100
  your_unique_take: string;
}

export class BitcoinNewsAnalyzer {
  private newsSources: NewsSource[] = [
    {
      name: 'Bitcoin Magazine',
      url: 'https://bitcoinmagazine.com',
      type: 'analysis',
      credibility_score: 95,
      update_frequency: 'daily',
      focus_areas: ['technology', 'culture', 'adoption', 'education']
    },
    {
      name: 'The Block',
      url: 'https://theblock.co',
      type: 'breaking',
      credibility_score: 90,
      update_frequency: 'real-time',
      focus_areas: ['breaking news', 'data', 'regulation', 'institutional']
    },
    {
      name: 'Coindesk',
      url: 'https://coindesk.com',
      type: 'aggregator',
      credibility_score: 85,
      update_frequency: 'hourly',
      focus_areas: ['market news', 'regulation', 'technology', 'analysis']
    },
    {
      name: 'Bitcoin Optech',
      url: 'https://bitcoinops.org',
      type: 'technical',
      credibility_score: 100,
      update_frequency: 'weekly',
      focus_areas: ['protocol development', 'technical improvements', 'developer news']
    },
    {
      name: 'Mempool.space Blog',
      url: 'https://mempool.space/blog',
      type: 'technical',
      credibility_score: 95,
      update_frequency: 'weekly',
      focus_areas: ['mempool analysis', 'transaction data', 'network health']
    },
    {
      name: 'Lightning Network News',
      url: 'https://lightningnetwork.plus/posts',
      type: 'technical',
      credibility_score: 90,
      update_frequency: 'weekly',
      focus_areas: ['Lightning Network', 'L2 solutions', 'payment innovation']
    },
    {
      name: 'Bitcoin Twitter',
      url: 'https://twitter.com',
      type: 'breaking',
      credibility_score: 70,
      update_frequency: 'real-time',
      focus_areas: ['breaking news', 'community sentiment', 'memes', 'hot takes']
    },
    {
      name: 'Nostr Network',
      url: 'https://nostr.com',
      type: 'breaking',
      credibility_score: 80,
      update_frequency: 'real-time',
      focus_areas: ['decentralized discussion', 'uncensored news', 'Bitcoin maximalist takes']
    },
    {
      name: 'Bitcoin Core GitHub',
      url: 'https://github.com/bitcoin/bitcoin',
      type: 'technical',
      credibility_score: 100,
      update_frequency: 'daily',
      focus_areas: ['protocol changes', 'bug fixes', 'development updates']
    },
    {
      name: 'Casa Blog',
      url: 'https://blog.casa.io',
      type: 'educational',
      credibility_score: 85,
      update_frequency: 'weekly',
      focus_areas: ['self-custody', 'security', 'hardware wallets']
    }
  ];

  private keyPeople: Record<string, {twitter: string; focus: string; credibility: number}> = {
    'Jameson Lopp': { twitter: '@lopp', focus: 'Security & Self-custody', credibility: 95 },
    'Andreas Antonopoulos': { twitter: '@aantonop', focus: 'Education & Philosophy', credibility: 100 },
    'Lyn Alden': { twitter: '@LynAldenContact', focus: 'Macro & Technical Analysis', credibility: 95 },
    'Preston Pysh': { twitter: '@PrestonPysh', focus: 'Investment & Education', credibility: 90 },
    'Saifedean Ammous': { twitter: '@saifedean', focus: 'Austrian Economics', credibility: 90 },
    'Matt Odell': { twitter: '@ODELL', focus: 'Privacy & Freedom Tech', credibility: 90 },
    'Jack Mallers': { twitter: '@jackmallers', focus: 'Lightning & Payments', credibility: 85 },
    'Elizabeth Stark': { twitter: '@starkness', focus: 'Lightning Network', credibility: 90 },
    'Adam Back': { twitter: '@adam3us', focus: 'Protocol Development', credibility: 100 },
    'Pieter Wuille': { twitter: '@pwuille', focus: 'Core Development', credibility: 100 }
  };

  analyzeNewsForEducationalContent(newsItems: NewsItem[]): NewsAnalysis {
    // Analyze trending topics
    const topicFrequency: Record<string, number> = {};
    newsItems.forEach(item => {
      if (topicFrequency[item.category]) {
        topicFrequency[item.category]++;
      } else {
        topicFrequency[item.category] = 1;
      }
    });

    const trending_topics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Generate educational angles
    const educational_angles = this.generateEducationalAngles(newsItems, trending_topics);
    
    // Generate content opportunities
    const content_opportunities = this.generateContentOpportunities(newsItems);
    
    // Calculate audience interest
    const audience_interest_level = this.calculateAudienceInterest(newsItems);
    
    // Generate your unique take
    const your_unique_take = this.generateUniqueDiscoveryTake(trending_topics, newsItems);

    return {
      trending_topics,
      educational_angles,
      content_opportunities,
      audience_interest_level,
      your_unique_take
    };
  }

  private generateEducationalAngles(newsItems: NewsItem[], trending: string[]): string[] {
    const angles: string[] = [];
    
    trending.forEach(topic => {
      switch(topic) {
        case 'technology':
          angles.push('What does this new Bitcoin improvement actually solve?');
          angles.push('How would you explain this to someone who just learned about Bitcoin?');
          break;
        case 'regulation':
          angles.push('What questions should we ask about this regulatory change?');
          angles.push('How does this affect Bitcoin\'s core properties?');
          break;
        case 'adoption':
          angles.push('What does this adoption story teach us about Bitcoin\'s value?');
          angles.push('Why might this company have chosen Bitcoin over alternatives?');
          break;
        case 'price':
          angles.push('What underlying factors might explain this price movement?');
          angles.push('How do we separate signal from noise in market reactions?');
          break;
        case 'mining':
          angles.push('What does this mining development tell us about network security?');
          angles.push('How does this connect to Bitcoin\'s energy narrative?');
          break;
      }
    });

    return angles;
  }

  private generateContentOpportunities(newsItems: NewsItem[]): string[] {
    const opportunities: string[] = [];
    
    newsItems.filter(item => item.educational_opportunity).forEach(item => {
      opportunities.push(`Twitter Thread: "${item.title}" - What questions does this raise?`);
      opportunities.push(`Discovery Exercise: Walk through the implications of ${item.category}`);
      opportunities.push(`First Principles Analysis: Break down ${item.title} from basics`);
      
      if (item.category === 'technology') {
        opportunities.push(`Interactive Demo: Use LearnMeABitcoin tools to explore this concept`);
      }
      
      if (item.category === 'regulation') {
        opportunities.push(`Socratic Discussion: What would happen if... (regulatory scenarios)`);
      }
      
      if (item.category === 'adoption') {
        opportunities.push(`Case Study: Why did they choose Bitcoin? (discovery approach)`);
      }
    });

    return [...new Set(opportunities)]; // Remove duplicates
  }

  private calculateAudienceInterest(newsItems: NewsItem[]): number {
    let totalInterest = 0;
    let weightedSum = 0;
    
    newsItems.forEach(item => {
      let interestScore = 50; // Base interest
      
      // High interest topics for Bitcoin educators
      if (item.category === 'education') interestScore += 30;
      if (item.category === 'technology') interestScore += 25;
      if (item.category === 'adoption') interestScore += 20;
      if (item.category === 'regulation') interestScore += 15;
      
      // Importance weighting
      if (item.importance === 'critical') interestScore *= 1.5;
      if (item.importance === 'high') interestScore *= 1.2;
      if (item.importance === 'low') interestScore *= 0.8;
      
      totalInterest += interestScore;
      weightedSum += 1;
    });
    
    return Math.min(100, totalInterest / weightedSum);
  }

  private generateUniqueDiscoveryTake(trending: string[], newsItems: NewsItem[]): string {
    const takes: string[] = [
      'Instead of just reporting what happened, let\'s discover WHY it happened',
      'What questions should we ask about these developments?',
      'How can we help people discover the implications for themselves?',
      'What would first-principles thinking reveal about these trends?',
      'How do these developments connect to Bitcoin\'s core philosophy?'
    ];
    
    // Customize based on trending topics
    if (trending.includes('technology')) {
      takes.push('What problems were these developers trying to solve? Let\'s explore together.');
    }
    if (trending.includes('regulation')) {
      takes.push('Rather than panic or celebrate, what questions should we ask about regulatory changes?');
    }
    if (trending.includes('adoption')) {
      takes.push('What does this adoption story teach us about Bitcoin\'s unique properties?');
    }
    
    return takes[Math.floor(Math.random() * takes.length)];
  }

  generateDailyNewsDigest(): {
    monitoring_checklist: string[];
    daily_routine: string[];
    content_creation_workflow: string[];
    sources_to_check: NewsSource[];
    key_people_to_follow: string[];
  } {
    return {
      monitoring_checklist: [
        '📱 Check Bitcoin Twitter for breaking news (5 min)',
        '📊 Review Bitcoin Optech newsletter (weekly)',
        '📈 Scan The Block for institutional/regulatory news',
        '🔧 Check Bitcoin Core GitHub for development updates',
        '⚡ Monitor Lightning Network developments',
        '🎓 Look for educational opportunities in trending topics',
        '🤔 Identify question-worthy developments for content',
        '🔗 Cross-reference with LearnMeABitcoin tool updates'
      ],
      daily_routine: [
        '🌅 Morning (9 AM): Bitcoin Twitter scan + trending topics',
        '☕ Mid-morning (11 AM): Technical news review (Optech, Mempool)',
        '🍽️ Lunch (1 PM): Regulatory/institutional updates (The Block, Coindesk)',
        '🌆 Evening (6 PM): Educational content planning based on news',
        '🌙 Night (9 PM): Community discussion on Nostr/Twitter'
      ],
      content_creation_workflow: [
        '1. 📰 Identify newsworthy Bitcoin development',
        '2. 🤔 Ask: "What questions does this raise?"',
        '3. 📝 Draft discovery-based content approach',
        '4. 🔍 Run through authenticity mentor analysis',
        '5. 🎨 Apply brand identity (orange-yellow, question-first)',
        '6. 📱 Optimize for Twitter/Substack/Nostr',
        '7. 🤝 Cross-reference collaboration opportunities',
        '8. 🚀 Publish with engagement strategy'
      ],
      sources_to_check: this.newsSources.filter(source => 
        source.credibility_score >= 85 || source.type === 'breaking'
      ),
      key_people_to_follow: Object.entries(this.keyPeople)
        .filter(([, info]) => info.credibility >= 90)
        .map(([name, info]) => `${name} (${info.twitter}) - ${info.focus}`)
    };
  }

  generateNewsBasedContentIdeas(topic: string, newsContext: string): {
    twitter_thread: string;
    substack_article: string;
    discovery_exercise: string;
    collaboration_angle: string;
  } {
    return {
      twitter_thread: `
🧵 ${topic} just made headlines...

But instead of just reacting, let's discover what this really means.

What questions should we ask? 🧠

Thread: 👇
`,
      substack_article: `
# What Does ${topic} Really Mean for Bitcoin?

The news: ${newsContext}

But before I give you my take, let's explore this together.

What questions come to mind when you hear about ${topic}?

[Discovery-based analysis follows...]
`,
      discovery_exercise: `
🔍 DISCOVERY EXERCISE: ${topic}

Instead of telling you what to think about ${topic}, let's figure it out together:

1. What problem might this be solving?
2. Who benefits from this development?
3. What questions does this raise about Bitcoin?
4. How might this connect to first principles?

Share your thoughts below 👇
`,
      collaboration_angle: `
Potential collaboration opportunities:
- Mi Primer Bitcoin: Spanish perspective on ${topic}
- Bitcoin Diploma: Academic analysis angle
- LearnMeABitcoin: Interactive tools to explore implications
- Looking Glass: Discovery exercises around ${topic}
- Bitcoin Adviser: Professional implications discussion
`
    };
  }

  createNewsMonitoringSystem(): {
    rss_feeds: string[];
    twitter_lists: string[];
    telegram_channels: string[];
    notification_setup: string[];
    daily_schedule: string[];
  } {
    return {
      rss_feeds: [
        'https://bitcoinmagazine.com/rss',
        'https://theblock.co/rss',
        'https://coindesk.com/rss',
        'https://bitcoinops.org/feed.xml',
        'https://mempool.space/blog/rss'
      ],
      twitter_lists: [
        'Bitcoin Core Developers',
        'Lightning Network',
        'Bitcoin Educators',
        'Bitcoin Journalists',
        'Regulatory Watch'
      ],
      telegram_channels: [
        'Bitcoin Magazine',
        'The Block',
        'Bitcoin Optech',
        'Lightning Network Updates'
      ],
      notification_setup: [
        '📱 Twitter notifications for key developer accounts',
        '🔔 Google Alerts for "Bitcoin" + "regulation"',
        '📧 Email subscriptions to Bitcoin Optech newsletter',
        '⚡ Lightning Network development notifications',
        '🚨 Breaking news alerts from The Block'
      ],
      daily_schedule: [
        '9:00 AM - Bitcoin Twitter breaking news check',
        '11:00 AM - Technical developments review',
        '1:00 PM - Regulatory/institutional news scan',
        '3:00 PM - Educational content opportunity identification',
        '6:00 PM - Content creation based on day\'s news',
        '9:00 PM - Community engagement on trending topics'
      ]
    };
  }
}

export const bitcoinNewsAnalyzer = new BitcoinNewsAnalyzer();