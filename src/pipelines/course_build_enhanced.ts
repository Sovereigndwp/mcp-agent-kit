#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { LearningPathOptimizer } from '../agents/LearningPathOptimizer';
import { InteractiveSimulationEngine } from '../agents/InteractiveSimulationEngine';
import { AcademyDataBridge } from '../agents/AcademyDataBridge';

/**
 * Enhanced Course Building Pipeline
 * 
 * Integrates real-time Bitcoin data into course content
 * Syncs with academy calculators and provides live network context
 */

interface EnhancedLessonOptions {
  includeLiveData: boolean;
  syncToCalculators: boolean;
  academyPaths?: {
    financial?: string;
    bitcoin?: string;
  };
}

async function loadBrandProfile() {
  const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
  try {
    const brandData = await fs.readFile(brandPath, 'utf-8');
    return JSON.parse(brandData);
  } catch (error) {
    console.log('⚠️  Brand profile not found. Run: npm run brand:learn first');
    throw new Error('Brand profile required. Run brand:learn pipeline first.');
  }
}

async function runEnhancedCourseBuild(options: EnhancedLessonOptions = {
  includeLiveData: true,
  syncToCalculators: true
}) {
  console.log('🚀 Starting Enhanced Course Building Pipeline...');
  console.log(`   📊 Live Data: ${options.includeLiveData ? 'Enabled' : 'Disabled'}`);
  console.log(`   🔄 Calculator Sync: ${options.syncToCalculators ? 'Enabled' : 'Disabled'}`);

  try {
    // Load brand profile
    const brandProfile = await loadBrandProfile();
    console.log('✅ Brand profile loaded');

    // Initialize agents
    const pathOptimizer = new LearningPathOptimizer();
    const simulationEngine = new InteractiveSimulationEngine();
    const dataBridge = new AcademyDataBridge();
    console.log('✅ Agents initialized');

    // Get real-time Bitcoin data if enabled
    let bitcoinData = null;
    let educationalContext = '';

    if (options.includeLiveData) {
      console.log('📊 Fetching live Bitcoin data...');
      bitcoinData = await dataBridge.getCurrentSnapshot();
      educationalContext = await dataBridge.generateEducationalContext(bitcoinData);
      console.log(`✅ Live data fetched - BTC: $${bitcoinData.price.usd.toLocaleString()}`);
    }

    // Generate lesson topic (enhanced with Bitcoin context)
    const lessonTopic = await generateBitcoinLessonTopic(bitcoinData);
    console.log(`🎯 Lesson topic: ${lessonTopic}`);

    // Create personalized learning path
    console.log('🛤️  Creating personalized learning path...');
    const learningPath = await pathOptimizer.executeToolCall('create_personalized_path', {
      learner_profile: {
        experience_level: 'beginner',
        learning_style: ['visual', 'hands_on', 'data_driven'],
        goals: ['practical_knowledge', 'security_awareness', 'financial_sovereignty'],
        time_availability: 'moderate',
        interests: ['sovereignty', 'practical_usage', 'real_world_application']
      },
      course_objectives: [
        'Understand Bitcoin fundamentals',
        'Practice with real network conditions',
        'Develop security awareness',
        'Apply knowledge to real scenarios'
      ],
      content_preferences: {
        complexity_level: 'beginner_friendly',
        interaction_level: 'highly_interactive',
        assessment_frequency: 'regular_checkpoints',
        content_format: ['text', 'interactive', 'visual', 'live_data']
      }
    });

    // Generate interactive simulation
    console.log('🎮 Creating interactive simulation...');
    const simulation = await simulationEngine.executeToolCall('create_bitcoin_simulation', {
      simulation_type: 'fee_estimation_practice',
      complexity_level: 'beginner',
      learning_objectives: [
        'Understanding transaction fees',
        'Reading mempool data',
        'Choosing appropriate fee rates'
      ],
      interaction_style: 'guided_exploration',
      safety_features: ['testnet_only', 'guided_tutorials', 'error_prevention'],
      customization_options: {
        difficulty_scaling: true,
        hints_available: true,
        progress_tracking: true,
        live_network_data: options.includeLiveData
      },
      live_data: bitcoinData ? {
        current_fees: bitcoinData.mempool,
        btc_price: bitcoinData.price.usd
      } : null
    });

    // Build enhanced lesson content
    console.log('📝 Generating lesson content...');
    const lessonContent = generateEnhancedLessonContent(
      lessonTopic,
      brandProfile,
      learningPath,
      simulation,
      educationalContext,
      bitcoinData
    );

    // Create enhanced metadata
    const lessonMetadata = {
      id: `lesson_${Date.now()}`,
      title: lessonTopic,
      created: new Date().toISOString(),
      status: 'draft',
      readability_score: null,
      brand_compliance: 'pending_review',
      languages: brandProfile.quick_reference.bilingual_support,
      learning_path: learningPath.path_structure,
      simulation: simulation.simulation_id,
      estimated_duration: '20-25 minutes',
      difficulty_level: 'beginner',
      prerequisites: [],
      learning_outcomes: [
        'Understand Bitcoin fundamentals',
        'Interpret real-time network data',
        'Make informed transaction decisions',
        'Practice with live fee estimation'
      ],
      live_data_integration: options.includeLiveData,
      bitcoin_snapshot: bitcoinData ? {
        timestamp: bitcoinData.timestamp,
        price: bitcoinData.price.usd,
        block_height: bitcoinData.network.blockHeight
      } : null
    };

    // Save lesson draft
    const timestamp = new Date().toISOString().split('T')[0];
    const lessonFileName = `${timestamp}_${lessonTopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    const lessonPath = path.join('workspace', 'drafts', lessonFileName);

    const fullLesson = `---
${JSON.stringify(lessonMetadata, null, 2)}
---

${lessonContent}
`;

    await fs.mkdir(path.dirname(lessonPath), { recursive: true });
    await fs.writeFile(lessonPath, fullLesson);
    console.log(`✅ Lesson draft saved to ${lessonPath}`);

    // Save simulation data
    const simulationPath = path.join('workspace', 'assets', `simulation_${lessonMetadata.id}.json`);
    await fs.mkdir(path.dirname(simulationPath), { recursive: true });
    await fs.writeFile(simulationPath, JSON.stringify(simulation, null, 2));
    console.log(`✅ Simulation saved to ${simulationPath}`);

    // Sync to calculators if enabled
    if (options.syncToCalculators && options.academyPaths) {
      console.log('🔄 Syncing data to academy calculators...');
      const exportResult = await dataBridge.exportToAcademies({
        financialAcademyPath: options.academyPaths.financial,
        bitcoinAcademyPath: options.academyPaths.bitcoin
      });

      if (exportResult.success) {
        console.log(`✅ Data synced to: ${exportResult.exported.join(', ')}`);
      } else {
        console.log('⚠️  Data sync encountered issues');
      }
    }

    console.log('\n🎉 Enhanced Course Building Pipeline completed successfully!');
    console.log('\nNext steps:');
    console.log('- Review lesson draft in workspace/drafts/');
    console.log('- Check live data integration in lesson content');
    console.log('- Run: npm run eval:run to evaluate quality');
    console.log('- Run: npm run academy:sync to update calculators');

    return {
      success: true,
      lessonPath,
      simulationPath,
      metadata: lessonMetadata,
      bitcoinData
    };

  } catch (error) {
    console.error('❌ Enhanced Course Building Pipeline failed:', error);
    throw error;
  }
}

function generateBitcoinLessonTopic(bitcoinData: any): string {
  const topics = [
    'Understanding Bitcoin Transaction Fees in Real-Time',
    'Reading the Mempool: What Network Congestion Means',
    'Bitcoin Price Discovery and Market Dynamics',
    'Choosing the Right Fee for Your Transaction',
    'Bitcoin Network Status: How to Read the Indicators',
    'From Fiat to Sats: Understanding Bitcoin Unit Conversion',
    'The Bitcoin Block Time and Your Transaction',
    'Network Difficulty and Mining Economics',
    'Lightning Network vs On-Chain: When to Use What',
    'Bitcoin Security: Understanding Confirmation Times'
  ];

  // If we have live data, choose a topic that leverages it
  if (bitcoinData) {
    if (bitcoinData.mempool.fastestFee > 50) {
      return 'Managing High Fees: Strategies for Expensive Network Conditions';
    } else if (bitcoinData.mempool.economyFee < 2) {
      return 'Low Fee Opportunities: Maximizing Cheap Bitcoin Transactions';
    }
  }

  return topics[Math.floor(Math.random() * topics.length)];
}

function generateEnhancedLessonContent(
  topic: string,
  brandProfile: any,
  learningPath: any,
  simulation: any,
  educationalContext: string,
  bitcoinData: any
): string {
  const voice = brandProfile.quick_reference.voice;

  let content = `# ${topic}

## Welcome to Real-World Bitcoin Learning! 🚀

${voice === 'clear, simple, witty, no jargon' ?
  "Ready to learn Bitcoin with actual network data? Awesome! We're using LIVE information from the Bitcoin network right now. No theory-only nonsense here." :
  "Welcome to your Bitcoin learning journey with real-time network integration. We'll explore using actual, current data from the Bitcoin network."
}

## What You'll Learn Today

By the end of this lesson, you'll be able to:
- ✅ Understand ${topic.toLowerCase()}
- ✅ Interpret real-time Bitcoin network data
- ✅ Make informed decisions about transactions
- ✅ Practice with our live-data simulation

`;

  // Add live Bitcoin data section if available
  if (bitcoinData && educationalContext) {
    content += `## 📊 Current Bitcoin Network Status\n\n${educationalContext}\n\n`;

    content += `### What This Means for You\n\n`;

    if (bitcoinData.mempool.fastestFee > 50) {
      content += `The network is currently **busy** with high fees. This is a great time to learn about:
- Fee optimization strategies
- Transaction batching
- When to use Lightning Network instead
- How to wait for cheaper periods

`;
    } else {
      content += `The network is currently **calm** with low fees. Perfect for:
- Practicing with real transactions
- Consolidating UTXOs cheaply
- Moving funds cost-effectively
- Learning without fee stress

`;
    }
  }

  content += `## Let's Break It Down Simply\n\n${generateLessonBody(topic, bitcoinData)}\n\n`;

  content += `## 🎮 Hands-On Practice with Live Data\n\n`;

  if (simulation && simulation.features) {
    content += `Our interactive simulation uses **real Bitcoin network data** right now:\n\n`;
    simulation.features.forEach((feature: string) => {
      content += `- ${feature}\n`;
    });

    if (bitcoinData) {
      content += `\n**You'll practice with:**\n`;
      content += `- Current BTC price: $${bitcoinData.price.usd.toLocaleString()}\n`;
      content += `- Real mempool conditions\n`;
      content += `- Actual fee estimates\n`;
      content += `- Live block data\n`;
    }

    content += `\n[🚀 Launch Live Simulation]\n\n`;
    content += `*Pro tip: The simulation updates with real network data, so try it at different times to see how conditions change!*\n\n`;
  }

  content += `## 🔒 Essential Security Rules\n\n`;
  content += generateSecuritySection();
  content += `\n\n`;

  content += `## ✅ Quick Check: Did It Click?\n\n`;
  content += `1. Can you explain what the current fee rates mean?\n`;
  content += `2. Why might fees be ${bitcoinData && bitcoinData.mempool.fastestFee > 50 ? 'high' : 'low'} right now?\n`;
  content += `3. How would you decide which fee rate to use?\n`;
  content += `4. When would you consider using Lightning Network instead?\n\n`;

  content += `## 🎯 What's Next?\n\n`;
  content += `Great job! You've learned ${topic.toLowerCase()} with real network data.\n\n`;
  content += `**Recommended next steps:**\n`;
  content += `- 🔄 Practice more with the simulation\n`;
  content += `- 📊 Check the calculator tools to explore different scenarios\n`;
  content += `- 📚 Continue to the next lesson\n`;
  content += `- 💬 Ask questions in our community\n\n`;

  content += `## 🧮 Try Our Interactive Calculators\n\n`;
  content += `Want to explore more? Check out our calculator tools:\n`;
  content += `- **Bitcoin DCA Calculator**: See how dollar-cost averaging works\n`;
  content += `- **Fee Comparison Tool**: Compare different fee strategies\n`;
  content += `- **Transaction Cost Estimator**: Plan your Bitcoin moves\n\n`;

  content += `---\n\n`;
  content += `*💡 Remember: Bitcoin is a living network. The data you see changes constantly. That's what makes it real and exciting!*`;

  return content;
}

function generateLessonBody(topic: string, bitcoinData: any): string {
  if (topic.toLowerCase().includes('fee')) {
    return `Bitcoin transaction fees work like an auction. When the network is busy, you need to bid higher to get your transaction confirmed quickly.

**Right now:**
${bitcoinData ? `- ⚡ Fast confirmation: ${bitcoinData.mempool.fastestFee} sat/vB (next block)
- 🕐 Normal speed: ${bitcoinData.mempool.halfHourFee} sat/vB (~30 minutes)
- 🐢 Economy rate: ${bitcoinData.mempool.economyFee} sat/vB (~1 hour)

**In Simple Terms:**
- sat/vB = "satoshis per virtual byte" (don't worry about the math)
- Higher number = faster confirmation = more expensive
- Lower number = slower confirmation = cheaper

Your transaction size determines the total cost. A typical transaction is about 250 vBytes.

So right now, a typical transaction would cost:
- Fast: ~${Math.round(bitcoinData.mempool.fastestFee * 250)} sats
- Normal: ~${Math.round(bitcoinData.mempool.halfHourFee * 250)} sats
- Economy: ~${Math.round(bitcoinData.mempool.economyFee * 250)} sats` :
    '- Fast, Normal, and Economy options available\n- Higher fees = faster confirmation\n- Lower fees = slower but cheaper'}`;
  }

  return `Let's break down ${topic.toLowerCase()} in a way that actually makes sense.

Think of it like this: [Simple analogy based on topic]

Here's what you need to know:
- Point 1 with real-world context
- Point 2 with practical examples
- Point 3 with actionable advice

${bitcoinData ? `Based on current network conditions, this is especially relevant because [context].` : ''}`;
}

function generateSecuritySection(): string {
  return `**🔒 Never Compromise on These:**

1. **Verify everything** - Addresses, amounts, fees
2. **Start small** - Practice with tiny amounts first
3. **Double-check destinations** - Bitcoin transactions are irreversible
4. **Keep private keys private** - Never share, never screenshot
5. **Use fee estimation wisely** - Don't overpay, but don't get stuck either

**[SECURITY]** When in doubt, ask questions. The Bitcoin community is helpful!`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const options: EnhancedLessonOptions = {
    includeLiveData: !args.includes('--no-live-data'),
    syncToCalculators: !args.includes('--no-sync'),
    academyPaths: {
      financial: process.env.FINANCIAL_ACADEMY_PATH || '../financially-sovereign-academy',
      bitcoin: process.env.BITCOIN_ACADEMY_PATH
    }
  };

  runEnhancedCourseBuild(options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runEnhancedCourseBuild };
