#!/usr/bin/env node

import { config } from 'dotenv';
import { contentIntegrationAgent } from '../agents/ContentIntegrationAgent.js';
import { uxDesignAgent } from '../agents/UXDesignAgent.js';
import { canvaSnippetGenerator } from '../cases/canva_snippet.js';
import { bitcoinLearningDemo } from '../cases/bitcoin_learning_demo.js';
import { bitcoinCurriculum } from '../cases/bitcoin_curriculum.js';
import { logger } from '../utils/logger.js';

// Load environment variables
config();

export class ContentIntegrationDemo {
  private sampleContent: any[] = [];

  constructor() {
    this.initializeSampleContent();
  }

  /**
   * Initialize sample content from different platforms
   */
  private initializeSampleContent(): void {
    this.sampleContent = [
      // Sample Notion content
      {
        type: 'notion',
        id: 'notion-bitcoin-basics',
        title: 'Bitcoin Basics for Beginners',
        content: `# Bitcoin Basics for Beginners

Bitcoin is a decentralized digital currency that operates on a peer-to-peer network. It was created in 2009 by an anonymous person or group known as Satoshi Nakamoto.

## Key Concepts:
- **Decentralization**: No central authority controls Bitcoin
- **Blockchain**: A public ledger of all transactions
- **Mining**: The process of validating transactions
- **Wallets**: Digital storage for Bitcoin

## Why Bitcoin Matters:
Bitcoin represents a fundamental shift in how we think about money and value transfer. It enables:
- Borderless transactions
- Lower fees than traditional banking
- Financial inclusion for the unbanked
- Protection against inflation

This is a great starting point for anyone new to cryptocurrency!`,
        tags: ['bitcoin', 'beginner', 'education', 'cryptocurrency'],
        category: 'lesson',
        author: 'Educator Kit',
        created: new Date('2024-01-15'),
        updated: new Date('2024-01-15')
      },

      // Sample Canva content
      {
        type: 'canva',
        id: 'canva-bitcoin-infographic',
        title: 'Bitcoin Price Trends Infographic',
        content: `DESIGN BRIEF: Bitcoin Price Analysis Infographic

Create an engaging infographic showing Bitcoin price trends, market cap, and adoption metrics. Use brand colors (black, orange, yellow) and include:

- Current Bitcoin price: $108,704
- 24h change: -3.88%
- Market cap: $2.16 trillion
- Global adoption statistics
- Key milestones in Bitcoin history

Target audience: General public interested in Bitcoin
Style: Modern, data-driven, educational`,
        tags: ['bitcoin', 'infographic', 'design', 'data'],
        category: 'design',
        author: 'Educator Kit',
        created: new Date('2024-01-16'),
        updated: new Date('2024-01-16'),
        assets: {
          images: ['bitcoin-chart.png', 'market-cap-graph.png'],
          videos: [],
          documents: []
        }
      },

      // Sample ChatGPT content
      {
        type: 'chatgpt',
        id: 'chatgpt-fee-explanation',
        title: 'Understanding Bitcoin Transaction Fees',
        content: `USER: Can you explain Bitcoin transaction fees in simple terms?

ASSISTANT: Absolutely! Bitcoin transaction fees are like a small payment you make to the network to process your transaction quickly and securely.

Think of it like paying a small tip to ensure your transaction gets priority treatment. Here's how it works:

1. **What are fees?** Small amounts of Bitcoin paid to miners who validate your transaction
2. **Why do they exist?** To incentivize miners and prevent spam transactions
3. **How much should you pay?** It depends on network congestion and how fast you want confirmation
4. **When are fees high?** During busy periods when many people are transacting
5. **How to save on fees?** Use wallets that let you set custom fee rates

The key is understanding that fees are not arbitrary - they're part of Bitcoin's economic model that keeps the network secure and efficient.

USER: That's really helpful! How do I know what fee to set?

ASSISTANT: Great question! Most modern Bitcoin wallets will suggest appropriate fees based on current network conditions. Here's what to look for:

**Fee Options:**
- **High Priority**: Fastest confirmation (1-2 blocks)
- **Medium Priority**: Standard confirmation (3-6 blocks) 
- **Low Priority**: Economy confirmation (24+ blocks)

**Pro Tips:**
- Use fee estimators like mempool.space
- Consider the urgency of your transaction
- Remember: higher fees = faster confirmation
- For small amounts, lower fees are often fine

The beauty of Bitcoin is that you have control over your fees - unlike traditional banking where fees are fixed!`,
        tags: ['bitcoin', 'fees', 'education', 'conversation'],
        category: 'conversation',
        author: 'Educator Kit',
        created: new Date('2024-01-17'),
        updated: new Date('2024-01-17')
      }
    ];
  }

  /**
   * Run the complete content integration demo
   */
  async runDemo(): Promise<void> {
    console.log('🚀 Starting Content Integration Demo...\n');
    console.log('🎯 This demo shows how your Notion, Canva, ChatGPT, and Agent content work together!\n');

    try {
      // Step 1: Import content from different platforms
      await this.importContentFromAllPlatforms();

      // Step 2: Analyze all content for patterns
      await this.analyzeAllContent();

      // Step 3: Generate improved content for each platform
      await this.generateImprovedContent();

      // Step 4: Execute integration workflows
      await this.executeWorkflows();

      // Step 5: Create learning recommendations
      await this.createLearningRecommendations();

      // Step 6: Generate content templates
      await this.generateContentTemplates();

      // Step 7: Show unified content dashboard
      await this.showUnifiedDashboard();

      console.log('\n✅ Content Integration Demo completed successfully!');
      console.log('🎉 Your content creation ecosystem is now unified and intelligent!');

    } catch (error) {
      logger.error('Demo failed:', error);
      throw error;
    }
  }

  /**
   * Import content from all platforms
   */
  private async importContentFromAllPlatforms(): Promise<void> {
    console.log('📥 Step 1: Importing content from all platforms...\n');

    for (const content of this.sampleContent) {
      switch (content.type) {
        case 'notion':
          await contentIntegrationAgent.importFromNotion(content);
          console.log(`   ✅ Imported Notion: "${content.title}"`);
          break;
        case 'canva':
          await contentIntegrationAgent.importFromCanva(content);
          console.log(`   ✅ Imported Canva: "${content.title}"`);
          break;
        case 'chatgpt':
          await contentIntegrationAgent.importFromChatGPT(content);
          console.log(`   ✅ Imported ChatGPT: "${content.title}"`);
          break;
      }
    }

    console.log(`\n📊 Total content imported: ${contentIntegrationAgent.getContentSources().length} items\n`);
  }

  /**
   * Analyze all content for patterns and insights
   */
  private async analyzeAllContent(): Promise<void> {
    console.log('🔍 Step 2: Analyzing content for patterns and insights...\n');

    const contentSources = contentIntegrationAgent.getContentSources();
    
    for (const content of contentSources) {
      const analysis = await contentIntegrationAgent.analyzeContent(content.id);
      
      console.log(`📊 Analysis for "${content.title}":`);
      console.log(`   🎯 Topics: ${analysis.topics.join(', ')}`);
      console.log(`   🔑 Keywords: ${analysis.keywords.slice(0, 5).join(', ')}...`);
      console.log(`   📈 Engagement: ${analysis.engagement}/100`);
      console.log(`   🎓 Complexity: ${analysis.complexity}`);
      console.log(`   💭 Sentiment: ${analysis.sentiment}`);
      console.log(`   💡 Suggestions: ${analysis.suggestions.length} improvements\n`);
    }
  }

  /**
   * Generate improved content for each platform
   */
  private async generateImprovedContent(): Promise<void> {
    console.log('✨ Step 3: Generating improved content for each platform...\n');

    const contentSources = contentIntegrationAgent.getContentSources();
    
    for (const content of contentSources) {
      // Generate improved versions for different platforms
      const platforms = ['notion', 'canva', 'chatgpt', 'agent'];
      
      for (const platform of platforms) {
        try {
          const improved = await contentIntegrationAgent.generateImprovedContent(content.id, platform);
          console.log(`   🚀 Generated ${platform.toUpperCase()} version: "${improved.title}"`);
        } catch (error) {
          console.log(`   ⚠️  Could not generate ${platform} version for "${content.title}"`);
        }
      }
    }

    console.log(`\n📈 Total improved content generated: ${contentIntegrationAgent.getContentSources().length} items\n`);
  }

  /**
   * Execute integration workflows
   */
  private async executeWorkflows(): Promise<void> {
    console.log('🔄 Step 4: Executing integration workflows...\n');

    const workflows = contentIntegrationAgent.getWorkflows();
    
    for (const workflow of workflows) {
      console.log(`🔄 Executing workflow: ${workflow.name}`);
      console.log(`   📝 Description: ${workflow.description}`);
      console.log(`   ⚡ Triggers: ${workflow.triggers.join(', ')}`);
      console.log(`   📤 Outputs: ${workflow.outputs.join(', ')}`);
      
      try {
        const result = await contentIntegrationAgent.executeWorkflow(workflow.id, {
          sampleData: true,
          workflow: workflow.name
        });
        
        console.log(`   ✅ Workflow completed successfully`);
        console.log(`   📊 Steps executed: ${result.results.length}\n`);
      } catch (error) {
        console.log(`   ❌ Workflow failed: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
  }

  /**
   * Create learning recommendations for agents
   */
  private async createLearningRecommendations(): Promise<void> {
    console.log('🧠 Step 5: Creating learning recommendations for agents...\n');

    const recommendations = await contentIntegrationAgent.createLearningRecommendations();
    
    console.log('📚 Learning Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n🎯 These recommendations will help your agents improve over time!\n');
  }

  /**
   * Generate content templates based on existing content
   */
  private async generateContentTemplates(): Promise<void> {
    console.log('📋 Step 6: Generating content templates...\n');

    const templates = await contentIntegrationAgent.generateContentTemplates();
    
    console.log('📋 Generated Templates:');
    templates.forEach(template => {
      console.log(`   📄 ${template.name}`);
      console.log(`      📝 ${template.description}`);
      console.log(`      🎯 Type: ${template.type}`);
      console.log(`      👥 Audience: ${template.targetAudience.join(', ')}\n`);
    });
  }

  /**
   * Show unified content dashboard
   */
  private async showUnifiedDashboard(): Promise<void> {
    console.log('📊 Step 7: Unified Content Dashboard\n');

    const contentSources = contentIntegrationAgent.getContentSources();
    const workflows = contentIntegrationAgent.getWorkflows();
    const templates = contentIntegrationAgent.getTemplates();

    // Content by platform
    const platformStats = new Map<string, number>();
    contentSources.forEach(content => {
      const count = platformStats.get(content.type) || 0;
      platformStats.set(content.type, count + 1);
    });

    console.log('📈 Content Distribution:');
    platformStats.forEach((count, platform) => {
      console.log(`   ${platform.toUpperCase()}: ${count} items`);
    });

    console.log(`\n🔄 Available Workflows: ${workflows.length}`);
    console.log(`📋 Available Templates: ${templates.length}`);

    // Show brand integration
    const brandColors = uxDesignAgent.getBrandColors();
    console.log('\n🎨 Brand Integration:');
    console.log(`   Primary: ${brandColors.primary}`);
    console.log(`   Secondary: ${brandColors.secondary}`);
    console.log(`   Accent: ${brandColors.accent}`);

    console.log('\n🚀 Integration Features:');
    console.log('   ✅ Cross-platform content analysis');
    console.log('   ✅ Automated content improvement');
    console.log('   ✅ Brand consistency enforcement');
    console.log('   ✅ Agent learning and adaptation');
    console.log('   ✅ Template generation');
    console.log('   ✅ Workflow automation');
  }

  /**
   * Demonstrate specific integration scenarios
   */
  async demonstrateScenarios(): Promise<void> {
    console.log('\n🎭 Demonstrating Integration Scenarios...\n');

    // Scenario 1: Notion → Canva → Social Media
    console.log('📱 Scenario 1: Notion → Canva → Social Media');
    console.log('   You write a Bitcoin lesson in Notion');
    console.log('   → Agent analyzes the content');
    console.log('   → Generates Canva design with brand colors');
    console.log('   → Creates social media posts');
    console.log('   → Schedules distribution\n');

    // Scenario 2: ChatGPT → Agent Learning
    console.log('🤖 Scenario 2: ChatGPT → Agent Learning');
    console.log('   You have a ChatGPT conversation about Bitcoin fees');
    console.log('   → Agent extracts key learning points');
    console.log('   → Updates agent knowledge base');
    console.log('   → Improves future responses');
    console.log('   → Creates new educational content\n');

    // Scenario 3: Multi-Platform Content Creation
    console.log('🌐 Scenario 3: Multi-Platform Content Creation');
    console.log('   You want to create content about Bitcoin security');
    console.log('   → Agent plans content strategy');
    console.log('   → Creates Notion lesson');
    console.log('   → Generates Canva infographic');
    console.log('   → Prepares ChatGPT conversation');
    console.log('   → Updates agent knowledge\n');
  }

  /**
   * Show integration benefits
   */
  showIntegrationBenefits(): void {
    console.log('\n💡 Integration Benefits:\n');

    const benefits = [
      {
        category: 'Efficiency',
        items: [
          'Automated content transformation between platforms',
          'Reduced manual work in content creation',
          'Consistent brand application across all content',
          'Faster content production pipeline'
        ]
      },
      {
        category: 'Quality',
        items: [
          'AI-powered content analysis and improvement',
          'Consistent educational standards',
          'Brand color and design compliance',
          'Engagement optimization based on data'
        ]
      },
      {
        category: 'Learning',
        items: [
          'Agents learn from all your content',
          'Continuous improvement of responses',
          'Pattern recognition across platforms',
          'Automated template generation'
        ]
      },
      {
        category: 'Scalability',
        items: [
          'Reusable content templates',
          'Automated workflow execution',
          'Cross-platform content distribution',
          'Scalable content creation process'
        ]
      }
    ];

    benefits.forEach(benefit => {
      console.log(`🎯 ${benefit.category}:`);
      benefit.items.forEach(item => {
        console.log(`   ✅ ${item}`);
      });
      console.log('');
    });
  }
}

// Create and export instance
export const contentIntegrationDemo = new ContentIntegrationDemo();

// Main execution function
async function main() {
  try {
    const demo = new ContentIntegrationDemo();
    
    // Run the main demo
    await demo.runDemo();
    
    // Show integration scenarios
    await demo.demonstrateScenarios();
    
    // Show benefits
    demo.showIntegrationBenefits();
    
    console.log('🎉 Content Integration Demo Complete!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Connect your actual Notion, Canva, and ChatGPT accounts');
    console.log('2. Set up API integrations for real-time content sync');
    console.log('3. Configure automated workflows for your content pipeline');
    console.log('4. Train your agents with your specific content patterns');
    console.log('5. Deploy the integration system for production use');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

