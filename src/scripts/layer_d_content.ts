#!/usr/bin/env ts-node

import { Command } from 'commander';
import { LayerDContentScout } from '../agents/LayerDContentScout.js';
import { logger } from '../utils/logger.js';

const program = new Command();

program
  .name('layer-d-content')
  .description('Layer-D Content Scout - Analyze and integrate your educational content')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze all content from layer-d.net and extract educational insights')
  .action(async () => {
    try {
      logger.info('🔍 Starting comprehensive layer-d.net content analysis...');
      console.log('📚 Analyzing Your Educational Content:');
      console.log('');
      console.log('🎯 Content Sources:');
      console.log('   • Collaborative Custody (Website)');
      console.log('   • Codl Looking Glass Education (Interactive)');
      console.log('   • Discover Bitcoin Curriculum');
      console.log('   • Bitcoin vs Fiat Comparison');
      console.log('   • What are Miners? Educational Content');
      console.log('   • 19 CBDC Scenarios (Booklets)');
      console.log('   • ETF vs Self-Custody Presentation');
      console.log('   • Double Spend Problem Solutions');
      console.log('   • Personalized Workshop Methodologies');
      console.log('   • UTXO Management Guides');
      console.log('   • Interactive Transaction Decoding');
      console.log('   • Sound Money Educational Modules');
      console.log('   • Bitcoin First Principles');
      console.log('   • Interactive Simulations & Games');
      console.log('');
      console.log('⏳ This will take a few minutes to scrape and analyze all content...');
      console.log('');

      const scout = new LayerDContentScout();
      const analysis = await scout.analyzeAllContent();
      
      console.log('✅ Layer-D content analysis completed!');
      console.log('');
      console.log('📊 Analysis Results:');
      console.log(`   Content Pieces Analyzed: ${analysis.content_analysis.length}`);
      console.log(`   Unique Educational Approaches: ${analysis.philosophical_analysis.unique_approaches.length}`);
      console.log(`   Integration Opportunities: ${analysis.integration_recommendations.course_enhancement_opportunities.length}`);
      console.log('');
      
      console.log('🎯 Core Educational Principles Identified:');
      analysis.philosophical_analysis.core_principles.forEach((principle, index) => {
        console.log(`   ${index + 1}. ${principle}`);
      });
      console.log('');
      
      console.log('💡 Top Integration Recommendations:');
      analysis.integration_recommendations.course_enhancement_opportunities.slice(0, 5).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
      
      console.log('🔄 Unique Approaches to Adopt:');
      analysis.philosophical_analysis.unique_approaches.forEach((approach, index) => {
        console.log(`   • ${approach}`);
      });
      console.log('');
      
      console.log('📁 Analysis saved to: data/layer_d_content/layer_d_analysis.json');
      console.log('🔍 Use "npm run layerd:search <keyword>" to search specific content');
      console.log('📋 Use "npm run layerd:summary" for quick overview');

    } catch (error) {
      logger.error('Failed to analyze layer-d content:', error);
      console.error('❌ Content analysis failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('summary')
  .description('Show quick summary of analyzed layer-d content')
  .action(async () => {
    try {
      const scout = new LayerDContentScout();
      const summary = await scout.getContentSummary();
      
      if (summary.message) {
        console.log('ℹ️ ', summary.message);
        console.log('');
        console.log(`📊 Available Sources: ${summary.content_sources} content pieces`);
        console.log('🏷️ Topics Available:');
        summary.available_topics.forEach((topic: string) => {
          console.log(`   • ${topic.replace('_', ' ')}`);
        });
        console.log('');
        console.log('💡 Run "npm run layerd:analyze" to start content analysis');
        return;
      }
      
      console.log('📚 Layer-D Content Analysis Summary');
      console.log('===================================');
      if (summary.last_analyzed) {
        console.log(`Last Analyzed: ${new Date(summary.last_analyzed).toLocaleString()}`);
      }
      console.log(`Total Content Pieces: ${summary.total_content_pieces}`);
      console.log('');
      
      console.log('📊 Content Types:');
      Object.entries(summary.content_types).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      console.log('');
      
      console.log('🎯 Core Principles:');
      summary.core_principles.forEach((principle: string, index: number) => {
        console.log(`   ${index + 1}. ${principle}`);
      });
      console.log('');
      
      console.log('💡 Top Recommendations:');
      summary.top_recommendations.forEach((rec: string, index: number) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
      
    } catch (error) {
      logger.error('Failed to get layer-d summary:', error);
      console.error('❌ Summary retrieval failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('search')
  .description('Search for specific content by keyword or topic')
  .argument('<keyword>', 'Search keyword or topic')
  .action(async (keyword) => {
    try {
      console.log(`🔍 Searching layer-d content for: "${keyword}"`);
      console.log('');
      
      const scout = new LayerDContentScout();
      const results = await scout.searchContent(keyword);
      
      if (results.length === 0) {
        console.log('❌ No matching content found');
        console.log('💡 Try searching for: custody, bitcoin, interactive, mining, education, utxo');
        return;
      }
      
      console.log(`✅ Found ${results.length} matching content pieces:`);
      console.log('');
      
      results.forEach((content, index) => {
        console.log(`${index + 1}. ${content.title}`);
        console.log(`   URL: ${content.url}`);
        console.log(`   Type: ${content.content_type} | Topic: ${content.topic.replace('_', ' ')}`);
        console.log(`   Audience: ${content.target_audience} | Level: ${content.complexity_level}`);
        console.log(`   Key Concepts: ${content.key_concepts.slice(0, 5).join(', ')}`);
        
        if (content.educational_approach.length > 0) {
          console.log(`   Educational Approach: ${content.educational_approach.join(', ')}`);
        }
        
        if (content.description) {
          console.log(`   Description: ${content.description.substring(0, 100)}...`);
        }
        console.log('');
      });
      
    } catch (error) {
      logger.error('Failed to search layer-d content:', error);
      console.error('❌ Content search failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('integrate')
  .description('Generate integration plan for incorporating layer-d content into courses')
  .action(async () => {
    try {
      console.log('🔄 Generating Layer-D Content Integration Plan...');
      console.log('');
      
      const scout = new LayerDContentScout();
      const summary = await scout.getContentSummary();
      
      if (summary.message) {
        console.log('❌ No analysis available. Run "npm run layerd:analyze" first.');
        return;
      }
      
      console.log('📋 Layer-D Content Integration Strategy');
      console.log('=====================================');
      console.log('');
      
      console.log('🎯 Immediate Integration Opportunities:');
      console.log('   1. Add interactive Bitcoin transaction decoder to all transaction lessons');
      console.log('   2. Integrate collaborative custody framework into security modules');
      console.log('   3. Implement personalized learning path methodology');
      console.log('   4. Add economic game mechanics for Bitcoin scarcity education');
      console.log('   5. Include CBDC vs Bitcoin scenario-based comparisons');
      console.log('');
      
      console.log('🔧 Technical Integration Steps:');
      console.log('   1. Import layer-d visual elements into Canva design templates');
      console.log('   2. Adapt interactive elements for course management system');
      console.log('   3. Create Notion templates based on personalized workshop methodology');
      console.log('   4. Integrate first principles breakdown approach into all modules');
      console.log('   5. Implement collaborative learning features in course platform');
      console.log('');
      
      console.log('📚 Content Enhancement Plan:');
      console.log('   • Transaction Education: Integrate btctxdecodedbydalia interactive interface');
      console.log('   • Custody Education: Adopt collaborative custody educational framework');
      console.log('   • Economic Education: Add water scarcity game mechanics for scarcity concepts');
      console.log('   • Mining Education: Use visual mining explanations from whatareminers');
      console.log('   • Security Education: Include double-spend simulation elements');
      console.log('');
      
      console.log('🎨 Design Integration:');
      console.log('   • Extract visual patterns from layer-d content');
      console.log('   • Create Canva templates matching layer-d design philosophy');
      console.log('   • Implement consistent visual storytelling approach');
      console.log('   • Adopt interactive element design patterns');
      console.log('');
      
      console.log('📊 Success Metrics:');
      console.log('   • Learner engagement increased through interactive elements');
      console.log('   • Personalized learning path completion rates');
      console.log('   • Collaborative learning activity participation');
      console.log('   • Content retention improvement with visual storytelling');
      console.log('');
      
      console.log('🚀 Next Steps:');
      console.log('   1. Run "npm run course:create" with enhanced layer-d integration');
      console.log('   2. Update Canva templates with layer-d visual patterns');
      console.log('   3. Create Notion workspace using personalized methodology');
      console.log('   4. Test interactive elements with target audience');

    } catch (error) {
      logger.error('Failed to generate integration plan:', error);
      console.error('❌ Integration planning failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('philosophy')
  .description('Analyze the educational philosophy behind layer-d content')
  .action(async () => {
    try {
      console.log('🤔 Layer-D Educational Philosophy Analysis');
      console.log('=========================================');
      console.log('');
      
      const scout = new LayerDContentScout();
      const summary = await scout.getContentSummary();
      
      if (summary.message) {
        console.log('❌ No analysis available. Run "npm run layerd:analyze" first.');
        return;
      }
      
      console.log('🎯 Core Educational Philosophy:');
      console.log('   "Learning Bitcoin through discovery, interaction, and personalized paths"');
      console.log('');
      
      console.log('📚 Key Principles Identified:');
      console.log('   1. DISCOVERY OVER INSTRUCTION');
      console.log('      → Let learners discover concepts through guided exploration');
      console.log('      → Use Socratic questioning to lead to insights');
      console.log('   ');
      console.log('   2. PERSONALIZATION AT SCALE');
      console.log('      → Adapt content complexity to individual learner needs');
      console.log('      → Create flexible learning paths based on prior knowledge');
      console.log('   ');
      console.log('   3. INTERACTIVE ENGAGEMENT');
      console.log('      → Replace passive reading with hands-on activities');
      console.log('      → Use simulations and games to teach complex concepts');
      console.log('   ');
      console.log('   4. COLLABORATIVE LEARNING');
      console.log('      → Build community around shared Bitcoin learning goals');
      console.log('      → Use collaborative custody as metaphor for collective knowledge');
      console.log('   ');
      console.log('   5. FIRST PRINCIPLES FOUNDATION');
      console.log('      → Break down complex topics to fundamental building blocks');
      console.log('      → Build understanding from ground up rather than assumptions');
      console.log('   ');
      console.log('   6. PRACTICAL APPLICATION FOCUS');
      console.log('      → Connect every concept to real-world usage');
      console.log('      → Emphasize "why" and "how" over "what"');
      console.log('');
      
      console.log('🎨 Unique Teaching Methodologies:');
      console.log('   • Economic games to understand Bitcoin properties');
      console.log('   • Interactive transaction decoding for technical literacy');
      console.log('   • Scenario-based CBDC comparisons for critical thinking');
      console.log('   • Collaborative custody frameworks for security education');
      console.log('   • Visual storytelling for complex cryptographic concepts');
      console.log('');
      
      console.log('💡 Innovation Areas:');
      console.log('   • Gamification of economic concepts (demand/supply games)');
      console.log('   • Interactive blockchain exploration tools');
      console.log('   • Personalized assessment and feedback systems');
      console.log('   • Collaborative learning space design');
      console.log('   • Visual programming for Bitcoin script education');

    } catch (error) {
      logger.error('Failed to analyze philosophy:', error);
      console.error('❌ Philosophy analysis failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}