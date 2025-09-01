#!/usr/bin/env tsx

// Analyze Existing Canva Course - Examine designs and suggest improvements
import { canvaTools } from '../tools/canva_api.js';
import { logger } from '../utils/logger.js';
import { writeFileSync, mkdirSync } from 'fs';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { SocraticTutor } from '../agents/SocraticTutor.js';

interface DesignAnalysis {
  id: string;
  title: string;
  type: string;
  current_content?: any;
  suggested_improvements: string[];
  bitcoin_integration_opportunities: string[];
  educational_enhancements: string[];
  estimated_reading_ease?: number;
}

async function analyzeDesign(design: any): Promise<DesignAnalysis> {
  const analysis: DesignAnalysis = {
    id: design.id,
    title: design.title || 'Untitled Design',
    type: design.design_type || 'unknown',
    suggested_improvements: [],
    bitcoin_integration_opportunities: [],
    educational_enhancements: []
  };

  // Analyze title for improvement opportunities
  const title = analysis.title.toLowerCase();
  
  // General design improvements
  if (!title.includes('bitcoin') && !title.includes('btc')) {
    analysis.bitcoin_integration_opportunities.push('Add Bitcoin branding or terminology to title');
  }
  
  if (title.length > 50) {
    analysis.suggested_improvements.push('Shorten title for better readability (currently >50 chars)');
  }
  
  if (!title.includes('learn') && !title.includes('guide') && !title.includes('tutorial')) {
    analysis.educational_enhancements.push('Add educational keywords (learn, guide, tutorial) to title');
  }

  // Design-type specific suggestions
  switch (analysis.type) {
    case 'presentation':
      analysis.suggested_improvements.push('Consider adding live Bitcoin data for current relevance');
      analysis.educational_enhancements.push('Include Socratic questions for interactive learning');
      break;
    case 'infographic':
      analysis.bitcoin_integration_opportunities.push('Add current Bitcoin price and network status');
      analysis.suggested_improvements.push('Use Bitcoin brand colors (#F7931A)');
      break;
    case 'instagram-post':
      analysis.suggested_improvements.push('Optimize for mobile viewing');
      analysis.bitcoin_integration_opportunities.push('Include current market sentiment');
      break;
  }

  // Always suggest live data integration
  analysis.bitcoin_integration_opportunities.push('Integrate real-time Bitcoin price and fee data');
  analysis.educational_enhancements.push('Add interactive elements or questions');

  return analysis;
}

async function main() {
  console.log('📊 Analyzing Canva Course: Bitcoin Education');
  console.log('═'.repeat(60));

  const folderId = 'FAFxTnM3zZU';
  
  try {
    // Test Canva connection
    console.log('🔌 Testing Canva connection...');
    const connectionTest = await canvaTools.testConnection();
    console.log(`   ${connectionTest.message}`);

    if (!connectionTest.success) {
      console.log('\n⚠️  Limited analysis available without API access');
      console.log('   Proceeding with folder-level analysis and recommendations');
    }

    // Get current Bitcoin context for enhancement suggestions
    const [fees, price] = await Promise.all([
      getFeeEstimates().catch(() => ({ fastestFee: 10, halfHourFee: 5, economyFee: 2 })),
      btc_price().catch(() => ({ usd: 100000, cop: 400000000 }))
    ]);

    const socraticTutor = new SocraticTutor();
    const educationalPrompts = await socraticTutor.generateQuestions('wallets', 'beginner', 5);

    console.log(`\n💰 Current Bitcoin Context for Course Updates:`);
    console.log(`   Price: $${price.usd.toLocaleString()}`);
    console.log(`   Network: ${fees.fastestFee > 20 ? 'High' : fees.fastestFee > 5 ? 'Medium' : 'Low'} congestion`);
    console.log(`   Educational prompts available: ${educationalPrompts.questions.length}`);

    // Attempt to list designs in the folder
    let designs: any[] = [];
    let folderAnalysis = {
      folder_id: folderId,
      folder_url: `https://www.canva.com/folder/${folderId}`,
      accessible_via_api: false,
      analysis_method: 'pattern_based',
      recommendations: []
    };

    try {
      const folderResult = await canvaTools.listDesigns({ folder_id: folderId });
      if (folderResult.success && folderResult.data.designs) {
        designs = folderResult.data.designs;
        folderAnalysis.accessible_via_api = true;
        folderAnalysis.analysis_method = 'api_based';
        console.log(`\n📁 Found ${designs.length} designs in folder`);
      }
    } catch (error) {
      console.log('\n📁 Direct folder access not available, using pattern-based analysis');
    }

    // Analyze each design (or create template analysis)
    const designAnalyses: DesignAnalysis[] = [];

    if (designs.length > 0) {
      // API-based analysis
      for (const design of designs) {
        const analysis = await analyzeDesign(design);
        designAnalyses.push(analysis);
        
        console.log(`\n📋 ${analysis.title}`);
        console.log(`   Type: ${analysis.type}`);
        console.log(`   Improvements: ${analysis.suggested_improvements.length}`);
        console.log(`   Bitcoin Integration: ${analysis.bitcoin_integration_opportunities.length}`);
        console.log(`   Educational Enhancements: ${analysis.educational_enhancements.length}`);
      }
    } else {
      // Pattern-based analysis for typical Bitcoin education course
      const typicalDesigns = [
        { title: 'Bitcoin Basics Introduction', type: 'presentation' },
        { title: 'Understanding Transaction Fees', type: 'infographic' },
        { title: 'Bitcoin Network Overview', type: 'presentation' },
        { title: 'Learning Summary', type: 'instagram-post' },
        { title: 'Quiz and Assessment', type: 'presentation' }
      ];

      for (const design of typicalDesigns) {
        const analysis = await analyzeDesign({ 
          id: `template_${design.title.replace(/\s+/g, '_').toLowerCase()}`,
          title: design.title,
          design_type: design.type
        });
        designAnalyses.push(analysis);
      }

      console.log('\n📋 Pattern-Based Analysis for Typical Bitcoin Course:');
      designAnalyses.forEach((analysis, index) => {
        console.log(`\n${index + 1}. ${analysis.title} (${analysis.type})`);
        console.log(`   • ${analysis.suggested_improvements.length} general improvements`);
        console.log(`   • ${analysis.bitcoin_integration_opportunities.length} Bitcoin integration opportunities`);
        console.log(`   • ${analysis.educational_enhancements.length} educational enhancements`);
      });
    }

    // Generate overall recommendations
    const overallRecommendations = [
      {
        category: 'Live Data Integration',
        priority: 'High',
        description: `Add current Bitcoin price ($${Math.round(price.usd/1000)}K) and network status to all designs`,
        implementation: 'Use automated data fetching tools to update designs daily'
      },
      {
        category: 'Educational Enhancement',
        priority: 'High',
        description: 'Incorporate Socratic questioning methodology',
        implementation: 'Add interactive questions that guide students to discover concepts themselves'
      },
      {
        category: 'Visual Consistency',
        priority: 'Medium',
        description: 'Standardize Bitcoin brand colors and typography',
        implementation: 'Apply consistent color palette (#F7931A, #FFFFFF, #333333) across all designs'
      },
      {
        category: 'Accessibility',
        priority: 'Medium',
        description: 'Optimize reading ease and mobile viewing',
        implementation: 'Target Flesch reading ease score of 60-75, ensure mobile responsiveness'
      },
      {
        category: 'Interactivity',
        priority: 'Low',
        description: 'Add QR codes or links for deeper learning',
        implementation: 'Include QR codes linking to live Bitcoin data or additional resources'
      }
    ];

    // Generate programmatic editing plan
    const programmatiChangePlan = {
      immediate_changes: [
        'Update all designs with current Bitcoin price',
        'Add network congestion status indicators',
        'Standardize color schemes across designs'
      ],
      automated_updates: [
        'Daily price updates via API',
        'Weekly fee analysis integration',
        'Monthly content freshness review'
      ],
      tools_needed: [
        'Canva API authentication',
        'Bitcoin data feeds integration',
        'Automated text replacement system',
        'Design template versioning'
      ]
    };

    // Create comprehensive analysis report
    const analysisReport = {
      timestamp: new Date().toISOString(),
      folder_info: folderAnalysis,
      bitcoin_context: {
        price: price.usd,
        fees: fees,
        market_condition: fees.fastestFee > 20 ? 'high_activity' : 'normal_activity'
      },
      design_analyses: designAnalyses,
      overall_recommendations: overallRecommendations,
      programmatic_editing_plan: programmatiChangePlan,
      educational_prompts: educationalPrompts.questions,
      next_steps: [
        'Set up Canva API authentication',
        'Create automated content update pipeline',
        'Implement design template system',
        'Schedule regular content reviews'
      ]
    };

    // Save analysis
    mkdirSync('exports/course_analysis', { recursive: true });
    writeFileSync('exports/course_analysis/canva_course_analysis.json', JSON.stringify(analysisReport, null, 2));

    // Display summary
    console.log('\n🎯 Course Analysis Summary:');
    console.log(`   Designs analyzed: ${designAnalyses.length}`);
    console.log(`   Recommendations: ${overallRecommendations.length} categories`);
    console.log(`   Priority improvements: ${overallRecommendations.filter(r => r.priority === 'High').length}`);
    
    console.log('\n📊 Top Recommendations:');
    overallRecommendations.filter(r => r.priority === 'High').forEach(rec => {
      console.log(`   • ${rec.category}: ${rec.description}`);
    });

    console.log('\n🔧 Programmatic Editing Capabilities:');
    programmatiChangePlan.immediate_changes.forEach(change => {
      console.log(`   • ${change}`);
    });

    console.log(`\n📄 Full analysis saved: exports/course_analysis/canva_course_analysis.json`);
    console.log('✅ Course analysis completed!');

    logger.info('Canva course analysis completed successfully');

  } catch (error) {
    logger.error('Course analysis failed:', error);
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);