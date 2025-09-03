import { bitcoinNewsAnalyzer } from './BitcoinNewsAnalyzer.js';

export interface MarketData {
  price: number; // USD price
  volume_24h: number; // 24h volume in USD
  market_cap: number; // Market cap in USD
  dominance: number; // Bitcoin dominance as percentage (0-100)
  bitcoin_fear_greed_index: number; // Bitcoin-specific fear/greed (0-100)
  network_hash_rate: number; // Network hash rate in EH/s (exahashes per second)
  mempool_size_mb: number; // Mempool size in megabytes
  mempool_transaction_count: number; // Number of unconfirmed transactions
  lightning_capacity_btc: number; // Lightning Network capacity in BTC
  lightning_channel_count: number; // Number of Lightning channels
  timestamp: Date;
}

export interface DeveloperActivity {
  github_commits: number;
  core_contributors: number;
  pull_requests: number;
  issues_closed: number;
  new_releases: string[];
}

export interface NetworkHealth {
  active_addresses: number; // Daily active addresses
  transaction_count_24h: number; // Transactions in last 24 hours
  average_fee_sats_vb: number; // Average fee in sats/vB
  median_fee_sats_vb: number; // Median fee in sats/vB
  average_fee_usd: number; // Average fee in USD
  median_fee_usd: number; // Median fee in USD
  unconfirmed_txs: number; // Count of unconfirmed transactions
  mempool_size_mb: number; // Mempool size in megabytes
  next_difficulty_adjustment: {
    blocks_remaining: number;
    estimated_time: string;
    estimated_change_percent: number;
  };
  current_difficulty: number; // Current mining difficulty
  block_height: number; // Current block height
}

export interface EducationalOpportunity {
  topic: string;
  relevance_score: number; // 1-100
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  content_angle: string;
  questions_to_explore: string[];
  tools_to_use: string[];
}

export class MarketIntelligenceAgent {
  private dataFeeds: Record<string, {
    url: string;
    type: 'price' | 'network' | 'development' | 'sentiment';
    update_frequency: string;
    educational_value: number;
    data_points: string[];
  }> = {
    'mempool_space': {
      url: 'https://mempool.space/api',
      type: 'network',
      update_frequency: 'real-time',
      educational_value: 95,
      data_points: ['mempool_size_mb', 'fee_estimates', 'transaction_count', 'block_height', 'difficulty']
    },
    'bitcoin_core_github': {
      url: 'https://api.github.com/repos/bitcoin/bitcoin',
      type: 'development',
      update_frequency: 'hourly',
      educational_value: 100,
      data_points: ['commits', 'releases', 'pull_requests', 'issues', 'contributors']
    },
    'coinmetrics': {
      url: 'https://coinmetrics.io/api/v4/timeseries/asset-metrics',
      type: 'network',
      update_frequency: 'daily',
      educational_value: 90,
      data_points: ['price', 'market_cap', 'active_addresses', 'hash_rate', 'difficulty']
    },
    'bitcoin_fear_greed': {
      url: 'https://api.alternative.me/fng/?limit=1&format=json&date_format=us',
      type: 'sentiment',
      update_frequency: 'daily',
      educational_value: 70,
      data_points: ['bitcoin_fear_greed_index', 'classification', 'timestamp']
    },
    'lightning_network': {
      url: 'https://1ml.com/api/v1/stats',
      type: 'network',
      update_frequency: 'hourly',
      educational_value: 85,
      data_points: ['capacity_btc', 'channel_count', 'node_count', 'avg_channel_size']
    },
    'blockchain_info': {
      url: 'https://blockchain.info/q',
      type: 'network',
      update_frequency: 'real-time',
      educational_value: 80,
      data_points: ['difficulty', 'hashrate', 'totalbc', 'unconfirmedcount', 'getblockcount']
    }
  };

  analyzeMarketForEducation(marketData: MarketData, networkHealth: NetworkHealth): EducationalOpportunity[] {
    const opportunities: EducationalOpportunity[] = [];

    // Price movement analysis
    if (Math.abs(marketData.price) > 5) { // Significant price movement
      opportunities.push({
        topic: 'Bitcoin Price Discovery',
        relevance_score: 85,
        difficulty_level: 'intermediate',
        content_angle: 'What drives Bitcoin price? Let\'s discover the mechanics behind market movements',
        questions_to_explore: [
          'What factors influence Bitcoin\'s price discovery?',
          'How do supply and demand dynamics work in Bitcoin?',
          'Why might the market be reacting this way?'
        ],
        tools_to_use: ['LearnMeABitcoin price charts', 'Mempool.space market data']
      });
    }

    // Network congestion analysis (proper mempool size check)
    if (networkHealth.mempool_size_mb > 100) { // Mempool over 100MB indicates congestion
      opportunities.push({
        topic: 'Bitcoin Network Congestion',
        relevance_score: 90,
        difficulty_level: 'beginner',
        content_angle: 'What happens when Bitcoin gets busy? Discovery through mempool analysis',
        questions_to_explore: [
          'Why do Bitcoin transactions sometimes take longer?',
          'How do fees work when the network is busy?',
          'What is the mempool and why does it matter?'
        ],
        tools_to_use: ['Mempool.space visualizer', 'LearnMeABitcoin fee calculator']
      });
    }

    // High fees opportunity (using proper sat/vB measurement)
    if (networkHealth.average_fee_sats_vb > 50 || networkHealth.average_fee_usd > 10) {
      opportunities.push({
        topic: 'Bitcoin Transaction Fees',
        relevance_score: 95,
        difficulty_level: 'intermediate',
        content_angle: 'Why are Bitcoin fees high right now? Let\'s explore fee markets',
        questions_to_explore: [
          'How do Bitcoin transaction fees work?',
          'What determines fee levels?',
          'How can users optimize their fees?'
        ],
        tools_to_use: ['Mempool.space fee estimator', 'LearnMeABitcoin transaction builder']
      });
    }

    // Lightning Network growth (proper BTC capacity measurement)
    if (marketData.lightning_capacity_btc > 4000) { // Growing Lightning capacity over 4000 BTC
      opportunities.push({
        topic: 'Lightning Network Growth',
        relevance_score: 80,
        difficulty_level: 'advanced',
        content_angle: 'Lightning Network is expanding - what does this mean for Bitcoin?',
        questions_to_explore: [
          'How does Lightning Network solve Bitcoin\'s scaling?',
          'What drives Lightning capacity growth?',
          'How do Lightning payments work?'
        ],
        tools_to_use: ['1ML Lightning explorer', 'Lightning Network visualizers']
      });
    }

    // Bitcoin-specific Fear & Greed extremes
    if (marketData.bitcoin_fear_greed_index < 20 || marketData.bitcoin_fear_greed_index > 80) {
      const sentiment = marketData.bitcoin_fear_greed_index < 20 ? 'fear' : 'greed';
      opportunities.push({
        topic: `Bitcoin Market ${sentiment} Psychology`,
        relevance_score: 75,
        difficulty_level: 'beginner',
        content_angle: `Why is there extreme ${sentiment} in Bitcoin markets? Psychology meets economics`,
        questions_to_explore: [
          `What causes extreme ${sentiment} in Bitcoin markets?`,
          'How should long-term thinkers approach market emotions?',
          'What can market psychology teach us about Bitcoin adoption?'
        ],
        tools_to_use: ['Bitcoin Fear & Greed index tracker', 'Historical Bitcoin market data']
      });
    }

    return opportunities.sort((a, b) => b.relevance_score - a.relevance_score);
  }

  generateDailyMarketInsight(): {
    key_metrics: string[];
    educational_angles: string[];
    content_opportunities: string[];
    discovery_questions: string[];
  } {
    return {
      key_metrics: [
        '💰 Bitcoin Price & 24h change',
        '⛏️ Network hash rate & mining difficulty',
        '📊 Mempool size & average fees', 
        '⚡ Lightning Network capacity',
        '📈 Fear & Greed Index',
        '👨‍💻 Developer activity (GitHub commits)',
        '🌍 Bitcoin dominance vs altcoins'
      ],
      educational_angles: [
        'What do today\'s metrics tell us about Bitcoin health?',
        'How do network fundamentals connect to price action?',
        'What questions should beginners ask about these numbers?',
        'How can we use data to discover Bitcoin\'s true value?',
        'What story do the metrics tell about adoption?'
      ],
      content_opportunities: [
        'Daily "Numbers Tell a Story" Twitter thread',
        'Weekly "Network Health Check" Substack article',
        'Interactive "Discover the Data" exercises',
        'Beginner-friendly metric explanations',
        'Advanced "First Principles Data Analysis"'
      ],
      discovery_questions: [
        '🤔 If you saw these numbers without context, what would you conclude?',
        '🔍 What questions do these metrics raise about Bitcoin?',
        '🧠 How might these trends affect new Bitcoin users?',
        '⚡ What do Lightning growth numbers suggest about scaling?',
        '📊 How do we separate signal from noise in market data?'
      ]
    };
  }

  createRealTimeMonitoringSystem(): {
    alert_triggers: Record<string, string>;
    data_dashboard: string[];
    notification_rules: string[];
    content_automation: string[];
  } {
    return {
      alert_triggers: {
        'Price Movement': 'Alert if Bitcoin moves >10% in 24h',
        'Network Congestion': 'Alert if mempool >100k unconfirmed txs',
        'High Fees': 'Alert if average fee >$20',
        'Lightning Growth': 'Alert if capacity increases >5% weekly',
        'Developer Activity': 'Alert for new Bitcoin Core releases',
        'Regulatory News': 'Alert for major regulatory developments'
      },
      data_dashboard: [
        '📊 Real-time price & volume (Mempool.space)',
        '⛏️ Mining metrics & difficulty (Coinmetrics)', 
        '⚡ Lightning Network stats (1ML)',
        '👨‍💻 Developer activity (GitHub API)',
        '📰 News sentiment analysis (aggregated)',
        '🌍 Global adoption metrics (various APIs)',
        '📱 Social media trends (Twitter API)'
      ],
      notification_rules: [
        '🚨 Critical: Major protocol developments → Immediate content',
        '⚠️ High: Significant market moves → Same-day analysis',
        '📢 Medium: Interesting developments → Weekly roundup',
        '💡 Low: Background trends → Monthly deep dive'
      ],
      content_automation: [
        'Auto-generate daily metric summaries',
        'Create educational opportunity alerts', 
        'Schedule content based on market events',
        'Trigger collaboration notifications',
        'Generate discovery question prompts'
      ]
    };
  }

  analyzeCompetitiveEducationLandscape(): {
    content_gaps: string[];
    unique_opportunities: string[];
    collaboration_potential: string[];
    market_positioning: string[];
  } {
    return {
      content_gaps: [
        '📊 Real-time data education (most focus on static concepts)',
        '🤔 Discovery-based market analysis (vs prescriptive advice)',
        '🔧 Interactive tools for understanding metrics',
        '🌎 Bilingual market education (English/Spanish)',
        '🎯 First-principles approach to market psychology',
        '⚡ Lightning Network education for beginners',
        '👨‍💻 Developer activity explanation for non-developers'
      ],
      unique_opportunities: [
        '🧠 "Discover the Data" - Interactive market education',
        '📱 Real-time educational content based on market events',
        '🤝 Cross-platform data storytelling (Twitter/Substack/Nostr)',
        '🔍 Socratic questioning approach to market analysis',
        '🎨 Visual brand identity in data presentation',
        '🌐 Bilingual market education pipeline',
        '🔗 Integration with LearnMeABitcoin tools for practice'
      ],
      collaboration_potential: [
        '📊 Mempool.space: Educational content partnership',
        '⚡ Lightning Labs: L2 education collaboration',
        '👨‍💻 Bitcoin Optech: Developer education for masses',
        '🌎 Mi Primer Bitcoin: Spanish market analysis',
        '🎓 Bitcoin Diploma: Academic market research',
        '💼 Bitcoin Adviser: Professional market insights'
      ],
      market_positioning: [
        '🎯 "The Data Discovery Educator" - unique in market',
        '📚 Bridge between raw data and educational insight',
        '🤔 Question-first approach to market analysis',
        '🌐 Multi-language, multi-platform presence',
        '🔧 Integration with best-in-class Bitcoin tools',
        '🎨 Distinctive visual brand in educational space'
      ]
    };
  }

  generateNewsTriggeredContent(newsItem: any): {
    immediate_response: string;
    educational_angle: string;
    discovery_questions: string[];
    tool_integrations: string[];
  } {
    return {
      immediate_response: `
🚨 BREAKING: ${newsItem.title}

Before we react, let's discover what this really means...

Thread: 👇
`,
      educational_angle: `
Instead of just reporting "${newsItem.title}", let's explore:

What questions should we ask?
What can we discover together?
How does this connect to Bitcoin fundamentals?

🧠 Discovery thread below...
`,
      discovery_questions: [
        `What problem might this ${newsItem.category} development solve?`,
        'How does this align with Bitcoin\'s core properties?',
        'What questions should beginners ask about this?',
        'What would happen if we applied first principles thinking?',
        'How might this affect different types of Bitcoin users?'
      ],
      tool_integrations: [
        `🔗 Explore with LearnMeABitcoin tools`,
        `📊 Check live data on Mempool.space`,
        `⚡ Monitor Lightning Network impact`,
        `👨‍💻 Review related GitHub activity`,
        `🌍 Cross-reference with global adoption data`
      ]
    };
  }
}

export const marketIntelligenceAgent = new MarketIntelligenceAgent();