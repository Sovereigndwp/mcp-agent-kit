#!/usr/bin/env tsx

// Enhanced Canva Auto Designer - Uses your pattern + Canva MCP integration
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { rssFetchTool } from '../tools/rss_fetch.js';
import { SocraticTutor } from '../agents/SocraticTutor.js';
import { sentimentAnalysisTool } from '../tools/sentiment_analysis.js';
import { writeFileSync, mkdirSync } from 'fs';
import { logger } from '../utils/logger.js';
import { canvaTools } from '../tools/canva_api.js';
import { run_CanvaDesignCoach } from '../agents/CanvaDesignCoach.js';

function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

export class CanvaAutoDesigner {
  static async run() {
    return main();
  }

  /**
   * Create Canva design instructions
   */
  async createCanvaInstructions(): Promise<string> {
    const [fees, price] = await Promise.all([
      getFeeEstimates(),
      btc_price()
    ]);

    const fast = fees.fastestFee || 10;
    const congestionLevel = fast > 20 ? 'High' : fast > 5 ? 'Medium' : 'Low';

    return `# Canva Design Instructions

## Current Bitcoin Data
- **Price:** $${Math.round(price.usd).toLocaleString()}
- **Fast Fee:** ${fast} sat/vB
- **Congestion:** ${congestionLevel}

## Design Templates
1. **Price Alert** - Current Bitcoin price with trending indicator
2. **Fee Guide** - Educational fee comparison chart
3. **Achievement** - Learning completion certificate

## Color Schemes
- High congestion: Red/Orange (#FF4444)
- Medium congestion: Yellow/Gold (#FFD700)
- Low congestion: Green/Blue (#44CC44)

## Instructions
1. Import the generated CSV into Canva Bulk Create
2. Select appropriate template based on congestion level
3. Ensure text is readable with high contrast
4. Use consistent spacing and alignment`;
  }

  /**
   * Generate bulk create CSV for Canva
   */
  generateBulkCreateCSV(): string {
    // This will be populated with live data when called
    const csvHeader = [
      'design_type', 'headline', 'price_placeholder', 'fee_placeholder', 
      'congestion_placeholder', 'prompt_placeholder', 'cta', 'color_scheme'
    ].join(',');

    const csvRows = [
      '"price_alert","₿ Price Update","PRICE_HERE","FEE_HERE","CONGESTION_HERE","PROMPT_HERE","Learn More →","dynamic"',
      '"fee_guide","Bitcoin Fee Calculator","PRICE_HERE","FEE_HERE","CONGESTION_HERE","PROMPT_HERE","Calculate Fees →","educational"',
      '"achievement","Bitcoin Learning Complete!","PRICE_HERE","FEE_HERE","CONGESTION_HERE","PROMPT_HERE","Continue Learning →","achievement"'
    ];

    return csvHeader + '\n' + csvRows.join('\n') + '\n';
  }

  /**
   * Generate design specifications
   */
  generateDesignSpecs(): any[] {
    return [
      {
        title: 'Bitcoin Price Alert',
        width: 1080,
        height: 1080,
        type: 'social-media',
        elements: {
          price: '$124000', // Placeholder
          fees: '2 sat/vB',
          congestion: 'Low',
          colors: ['#44CC44', '#FFFFFF', '#333333'],
          call_to_action: 'Learn More →'
        }
      },
      {
        title: 'Fee Education Guide',
        width: 1200,
        height: 800,
        type: 'educational',
        elements: {
          price: '$124000',
          fees: 'Fast: 2, Medium: 1, Slow: 1',
          congestion: 'Medium',
          colors: ['#FFD700', '#FFFFFF', '#333333'],
          call_to_action: 'Calculate Fees →'
        }
      },
      {
        title: 'Achievement Certificate',
        width: 1600,
        height: 900,
        type: 'certificate',
        elements: {
          price: '$124000',
          fees: '2 sat/vB',
          congestion: 'Low',
          colors: ['#4CAF50', '#FFD700', '#FFFFFF'],
          call_to_action: 'Continue Learning →'
        }
      }
    ];
  }
}

async function main() {
  console.log('🎨 Bitcoin Education Auto-Designer with Canva MCP');
  console.log('═'.repeat(60));
  
  try {
    // Get live data (your approach enhanced)
    const [fees, price, news] = await Promise.all([
      getFeeEstimates(),
      btc_price(),
      rssFetchTool.fetchBitcoinNews(3).catch(() => ({
        items: [
          { title: "Bitcoin Network Update", link: "#" },
          { title: "Lightning Growth", link: "#" }
        ]
      }))
    ]);

    const fast = fees.fastestFee || 10;
    const medium = fees.halfHourFee || 5;
    const slow = fees.economyFee || 2;
    
    const congestionLevel = fast > 20 ? 'High' : fast > 5 ? 'Medium' : 'Low';
    const congestionEmoji = fast > 20 ? '🔴' : fast > 5 ? '🟡' : '🟢';
    
    // Get educational prompts
    const socraticTutor = new SocraticTutor();
    const prompts = await socraticTutor.generateQuestions('fees', 'beginner', 3);

    console.log(`💰 Bitcoin: $${price.usd.toLocaleString()}`);
    console.log(`⚡ Fees: ${fast} sat/vB (${congestionLevel})`);

    // Create Canva-ready designs
    const outputDir = 'exports/canva_auto_designs';
    mkdirSync(outputDir, { recursive: true });

    // Enhanced CSV (your format + more data)
    const csvHeader = [
      'design_type', 'headline', 'price', 'fee_fast', 'fee_medium', 'fee_slow',
      'congestion', 'prompt', 'cta', 'color_scheme'
    ].join(',');

    const csvRows = [
      [
        '"price_alert"',
        `"₿ $${Math.round(price.usd/1000)}K"`,
        `"$${Math.round(price.usd).toLocaleString()}"`,
        `"${fast} sat/vB"`,
        `"${medium} sat/vB"`,
        `"${slow} sat/vB"`,
        `"${congestionLevel}"`,
        `"${prompts.questions[0]?.substring(0, 50) || 'Learn Bitcoin'}..."`,
        '"Learn More →"',
        fast > 10 ? '"urgent"' : '"calm"'
      ].join(','),
      [
        '"fee_guide"',
        '"Bitcoin Fee Calculator"',
        `"$${Math.round(price.usd).toLocaleString()}"`,
        `"${fast} sat/vB"`,
        `"${medium} sat/vB"`,
        `"${slow} sat/vB"`,
        `"${congestionLevel}"`,
        `"${prompts.questions[1]?.substring(0, 50) || 'Understanding fees'}..."`,
        '"Calculate Fees →"',
        '"educational"'
      ].join(','),
      [
        '"achievement"',
        '"Bitcoin Learning Complete!"',
        `"$${Math.round(price.usd).toLocaleString()}"`,
        `"${fast} sat/vB"`,
        `"${medium} sat/vB"`,
        `"${slow} sat/vB"`,
        `"${congestionLevel}"`,
        `"${prompts.questions[2]?.substring(0, 50) || 'Bitcoin mastery'}..."`,
        '"Continue Learning →"',
        '"achievement"'
      ].join(',')
    ];

    const csvContent = csvHeader + '\n' + csvRows.join('\n') + '\n';
    writeFileSync(`${outputDir}/bitcoin_designs.csv`, csvContent);

    console.log('\n📊 CSV Generated: bitcoin_designs.csv');
    console.log('🎨 Now creating actual Canva designs...');

    // Create actual Canva designs using enhanced MCP integration
    try {
      console.log('🔌 Testing Canva connections...');
      const connectionTest = await canvaTools.testConnection();
      console.log(`   ${connectionTest.message}`);
      
      if (connectionTest.success) {
        const bitcoinData = {
          price: price.usd,
          fees: { fast, medium, slow },
          congestion: congestionLevel,
          prompts: prompts.questions
        };

        const designResult = await canvaTools.createBitcoinEducationDesigns(bitcoinData);

        if (designResult.success && designResult.data.designs.length > 0) {
          const designs = designResult.data.designs;
          console.log(`\n🎯 Created ${designs.length} actual Canva designs (${designResult.data.method}):`);
          
          designs.forEach((design: any, index: number) => {
            console.log(`   ${index + 1}. ${design.title || 'Untitled'}`);
            if (design.edit_url || design.urls?.edit_url) {
              console.log(`      Edit: ${design.edit_url || design.urls?.edit_url}`);
            }
            if (design.view_url || design.urls?.view_url) {
              console.log(`      View: ${design.view_url || design.urls?.view_url}`);
            }
            if (design.created_via_mcp) {
              console.log(`      Method: MCP (${design.mcp_server})`);
            }
          });

          // Save comprehensive design info
          const designsInfo = {
            created_at: new Date().toISOString(),
            creation_method: designResult.data.method,
            bitcoin_data: bitcoinData,
            designs: designs,
            educational_prompts: prompts.questions.slice(0, 3),
            connection_info: connectionTest.data
          };

          writeFileSync(`${outputDir}/created_designs.json`, JSON.stringify(designsInfo, null, 2));
          console.log(`📄 Design info saved: ${outputDir}/created_designs.json`);
          
        } else {
          console.log('⚠️  No designs were created');
          console.log(`   Reason: ${designResult.error || 'Unknown error'}`);
        }
      } else {
        console.log('❌ Canva connection failed - designs not created');
        console.log(`   Error: ${connectionTest.error}`);
      }

    } catch (error) {
      console.error('❌ Failed to create actual Canva designs:', error);
      console.log('📊 CSV file created successfully for manual import');
    }

    console.log('\n✅ Auto-designer completed!');
    console.log(`💰 Bitcoin: $${price.usd.toLocaleString()}`);
    console.log(`⚡ Fees: ${fast} sat/vB (${congestionLevel})`);

    logger.info('✅ Enhanced auto-designer completed!');
    
  } catch (error) {
    logger.error('❌ Auto-designer failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);