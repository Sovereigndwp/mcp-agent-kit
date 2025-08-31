// Enhanced Canva Snippet - Improved version of your existing pattern
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { rssFetchTool } from '../tools/rss_fetch.js';
import { SocraticTutor } from '../agents/SocraticTutor.js';
import { sentimentAnalysisTool } from '../tools/sentiment_analysis.js';
import { writeFileSync, mkdirSync } from 'fs';
import { fxRateTool } from '../tools/fx_rate.js';

function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

// Enhanced with reading ease calculation (like your CanvaDesignCoach)
function calculateReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + Math.max(1, word.toLowerCase().replace(/[^aeiouy]/g, '').length);
  }, 0);
  
  if (words === 0 || sentences === 0) return 0;
  return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
}

async function main() {
  console.log('🎯 Generating Enhanced Bitcoin Canva Snippet...');
  
  try {
    // Pull live data (enhanced with more sources)
    const [fees, price, news, fxRate] = await Promise.all([
      getFeeEstimates(),
      btc_price(),
      rssFetchTool.fetchBitcoinNews(5).catch(() => ({ 
        items: [
          { title: "Bitcoin Network Update", link: "https://example.com/1" },
          { title: "Lightning Network Growth", link: "https://example.com/2" },
          { title: "Mining Difficulty Adjustment", link: "https://example.com/3" }
        ]
      })),
      fxRateTool.getExchangeRate('USD', 'EUR').catch(() => ({ rate: 0.85 }))
    ]);

    // Get network congestion context
    const congestionLevel = fees.fastestFee > 20 ? 'High' : fees.fastestFee > 5 ? 'Medium' : 'Low';
    const congestionEmoji = fees.fastestFee > 20 ? '🔴' : fees.fastestFee > 5 ? '🟡' : '🟢';
    
    // Enhanced fee analysis with context
    const fast = fees.fastestFee;
    const medium = fees.halfHourFee || fees.hourFee;
    const slow = fees.economyFee || fees.minimumFee;
    
    // Calculate transaction costs for common scenarios
    const standardTxSize = 250; // bytes
    const fastCostUSD = ((standardTxSize * fast) / 100000000) * price.usd;
    const mediumCostUSD = ((standardTxSize * medium) / 100000000) * price.usd;
    
    // Get advanced Socratic prompts based on current conditions
    const socraticTutor = new SocraticTutor();
    const socraticQuestions = await socraticTutor.generateQuestions('fees', 'beginner', 5);
    
    // Analyze news sentiment
    const newsTexts = (news.items || []).map(item => item.title || '').filter(title => title.length > 0).join('. ');
    const sentiment = newsTexts ? await sentimentAnalysisTool.analyzeSentiment(newsTexts) : 
      { overall_sentiment: 'neutral', confidence: 50 };
    
    // Enhanced markdown with more context and interactivity
    const md = `# Bitcoin Education Snapshot 📊
**Generated:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

## 💰 Price Data
- **BTC Price:** $${round(price.usd).toLocaleString()} USD | €${round(price.usd * fxRate.rate).toLocaleString()} EUR
- **COP Price:** ${Math.round(price.cop).toLocaleString('es-CO')} COP
- **24h Context:** ${price.usd > 100000 ? '🚀 Above $100K!' : '📈 Building momentum'}

## ⚡ Network Fees & Congestion ${congestionEmoji}
- **Network Status:** ${congestionLevel} Congestion
- **Fast (${fast} sat/vB):** ~$${round(fastCostUSD, 2)} for standard tx
- **Medium (${medium} sat/vB):** ~$${round(mediumCostUSD, 2)} for standard tx  
- **Slow (${slow} sat/vB):** For non-urgent transactions
- **Best Practice:** ${fast > 20 ? 'Consider waiting or batching transactions' : fast > 5 ? 'Normal fee planning recommended' : 'Good time for routine transactions'}

## 📰 Bitcoin News Pulse
**Market Sentiment:** ${sentiment.overall_sentiment} (${sentiment.confidence}% confidence)
${(news.items || []).slice(0, 3).map((item, idx) => `${idx + 1}. ${item.title || 'No title'} — [Read More](${item.link || '#'})`).join('\n')}

## 🤔 Learning Prompts (Socratic Method)
${socraticQuestions.questions.slice(0, 3).map((q, idx) => `**${idx + 1}.** ${q}`).join('\n')}

## 📐 Design Guidelines
- **Reading Ease Score:** Aim for 60-75 (conversational)
- **Colors:** Bitcoin Orange (#F7931A), White (#FFFFFF), Dark Gray (#333333)
- **Key Message:** ${congestionLevel} network activity, $${Math.round(price.usd/1000)}K price level
- **Call-to-Action:** "Learn why fees are ${fast > 10 ? 'higher' : 'lower'} today →"

---
*💡 Pro Tip: Use this data to create educational content that's relevant to current market conditions!*
`;

    // Enhanced CSV with more educational context
    const csvHeaders = [
      'timestamp', 'price_usd', 'price_eur', 'price_cop',
      'fee_fast', 'fee_medium', 'fee_slow', 'congestion_level',
      'fast_cost_usd', 'medium_cost_usd', 'sentiment', 'confidence',
      'news_1', 'news_2', 'news_3',
      'learning_prompt_1', 'learning_prompt_2', 'learning_prompt_3',
      'design_tip', 'context_note'
    ].join(',');

    const csvRow = [
      `"${new Date().toISOString()}"`,
      round(price.usd),
      round(price.usd * fxRate.rate),
      Math.round(price.cop),
      Math.round(fast),
      Math.round(medium),
      Math.round(slow),
      `"${congestionLevel}"`,
      round(fastCostUSD, 3),
      round(mediumCostUSD, 3),
      `"${sentiment.overall_sentiment}"`,
      Math.round(sentiment.confidence),
      ...(news.items || []).slice(0, 3).map(item => `"${(item.title || '').replace(/"/g, '""')}"`),
      ...socraticQuestions.questions.slice(0, 3).map(q => `"${q.replace(/"/g, '""')}"`),
      `"Use ${congestionLevel.toLowerCase()} congestion visuals"`,
      `"$${Math.round(price.usd/1000)}K era, ${congestionLevel.toLowerCase()} fees"`
    ].join(',');

    // Generate design brief (inspired by your CanvaDesignCoach approach)
    const designBrief = `# Design Brief — Bitcoin Snapshot
**Reading Ease Target:** 60–75 (keep content accessible)
**Price Context:** $${Math.round(price.usd).toLocaleString()} | **Network:** ${congestionLevel} activity

## Visual Hierarchy
1. **Hero Number:** $${Math.round(price.usd/1000)}K (large, prominent)
2. **Fee Status:** ${congestionEmoji} ${congestionLevel} Network Activity
3. **Learning Hook:** ${socraticQuestions.questions[0]?.substring(0, 50)}...

## Color Psychology
- **${congestionLevel} Activity:** Use ${congestionLevel === 'High' ? 'urgent reds/oranges' : congestionLevel === 'Medium' ? 'cautious yellows' : 'calm greens'}
- **Bitcoin Brand:** Always include #F7931A accent
- **Sentiment:** ${sentiment.overall_sentiment} news = ${sentiment.overall_sentiment === 'positive' ? 'optimistic blues/greens' : sentiment.overall_sentiment === 'negative' ? 'cautious reds' : 'neutral grays'}

## Content Optimization
- **Fees Explanation:** "${fast > 10 ? 'Network busy - higher fees needed' : 'Good time for Bitcoin transactions'}"
- **Educational Angle:** Focus on why fees are ${congestionLevel.toLowerCase()} today
- **Action Item:** "Learn fee optimization strategies"

---
**Ready-to-use Canva data in CSV format attached!**
`;

    // Write enhanced outputs
    mkdirSync('exports', { recursive: true });
    writeFileSync('exports/enhanced-canva-snippet.md', md);
    writeFileSync('exports/enhanced-canva-snippet.csv', `${csvHeaders}\n${csvRow}\n`);
    writeFileSync('exports/canva-design-brief.md', designBrief);
    
    // Also generate JSON for programmatic use
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      market_data: {
        btc_usd: price.usd,
        btc_eur: price.usd * fxRate.rate,
        btc_cop: price.cop,
        network_congestion: congestionLevel
      },
      fees: {
        fast: { rate: fast, cost_usd: fastCostUSD },
        medium: { rate: medium, cost_usd: mediumCostUSD },
        slow: { rate: slow, cost_usd: ((standardTxSize * slow) / 100000000) * price.usd }
      },
      news: {
        headlines: (news.items || []).slice(0, 3),
        sentiment: sentiment
      },
      education: {
        prompts: socraticQuestions.questions.slice(0, 3),
        reading_ease_target: '60-75',
        key_learning: `Understanding ${congestionLevel.toLowerCase()} network conditions`
      },
      design_context: {
        primary_message: `$${Math.round(price.usd/1000)}K Bitcoin, ${congestionLevel} fees`,
        recommended_colors: congestionLevel === 'High' ? ['#ff4444', '#f7931a'] : ['#44ff44', '#f7931a'],
        urgency_level: congestionLevel.toLowerCase()
      }
    };
    
    writeFileSync('exports/bitcoin-education-data.json', JSON.stringify(jsonOutput, null, 2));

    console.log('✅ Enhanced outputs generated:');
    console.log('   📝 Markdown: exports/enhanced-canva-snippet.md');
    console.log('   📊 CSV: exports/enhanced-canva-snippet.csv');  
    console.log('   🎨 Design Brief: exports/canva-design-brief.md');
    console.log('   📋 JSON Data: exports/bitcoin-education-data.json');
    console.log('');
    console.log('🎯 Key Insights for Design:');
    console.log(`   💰 Bitcoin: $${Math.round(price.usd).toLocaleString()} (${price.usd > 100000 ? '🚀' : '📈'})`);
    console.log(`   ⚡ Network: ${congestionEmoji} ${congestionLevel} congestion`);
    console.log(`   📰 Sentiment: ${sentiment.overall_sentiment} (${sentiment.confidence}%)`);
    console.log(`   🎨 Use ${congestionLevel.toLowerCase()}-activity visual treatment`);
    
  } catch (error) {
    console.error('❌ Failed to generate enhanced snippet:', error);
    process.exit(1);
  }
}

main().catch(console.error);