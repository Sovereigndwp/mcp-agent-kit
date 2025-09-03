#!/usr/bin/env node

import { ContentImporter } from '../importers/ContentImporter.js';
import { existsSync, copyFileSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import winston from 'winston';

/**
 * Real Content Integration Demo
 * 
 * This script demonstrates how to:
 * 1. Set up content sources from examples
 * 2. Import real content for analysis
 * 3. Run comprehensive analysis
 * 4. Generate actionable improvement recommendations
 */

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

async function runRealContentDemo(): Promise<void> {
  console.log('🧠 Real Content Integration Demo');
  console.log('═'.repeat(50));
  console.log();
  
  try {
    // Step 1: Check if config exists, if not copy examples
    await setupExampleContent();
    
    // Step 2: Initialize content importer
    console.log('📥 Step 1: Initializing Content Importer');
    const importer = new ContentImporter();
    console.log('✅ Content importer initialized');
    console.log();
    
    // Step 3: Import all available content
    console.log('📂 Step 2: Importing Content from All Sources');
    const importResults = await importer.importAllContent();
    
    console.log('📊 Import Results:');
    console.log(`   Total Content: ${importResults.total_imported}`);
    console.log(`   Successful: ${importResults.successful}`);
    console.log(`   Failed: ${importResults.failed}`);
    console.log(`   Sources: Canva(${importResults.sources.canva}) | Notion(${importResults.sources.notion}) | GPTs(${importResults.sources.gpt})`);
    console.log();
    
    if (importResults.successful === 0) {
      console.log('❌ No content was successfully imported. Please check your configuration.');
      return;
    }
    
    // Step 4: Analyze imported content
    console.log('🔍 Step 3: Running Comprehensive Analysis');
    await importer.analyzeImportedContent();
    console.log('✅ Analysis complete!');
    console.log();
    
    // Step 5: Show results summary
    console.log('📋 Step 4: Results Summary');
    await showResultsSummary();
    
    // Step 6: Next steps
    console.log('🚀 Step 5: What\'s Next?');
    console.log();
    console.log('Your content has been analyzed! Here are your next steps:');
    console.log();
    console.log('📊 **Review Results**:');
    console.log('   • Open: ./content-analysis-results/comprehensive-analysis.json');
    console.log('   • Check: ./content-analysis-results/import-results.json');
    console.log();
    console.log('🎯 **Take Action**:');
    console.log('   • Start with quick wins (1-2 hours)');
    console.log('   • Plan medium effort improvements (4-8 hours)');
    console.log('   • Schedule major improvements (1-2 days)');
    console.log();
    console.log('🔄 **Continuous Improvement**:');
    console.log('   • Add more of your real content to ./content-sources/');
    console.log('   • Run: npm run import:content');
    console.log('   • Run: npm run analyze:all-content');
    console.log('   • Monitor philosophy consistency over time');
    console.log();
    console.log('💡 **Pro Tips**:');
    console.log('   • Set up weekly analysis runs');
    console.log('   • Focus on philosophy consistency score');
    console.log('   • Use cross-platform insights to improve all content');
    console.log('   • Track your progress with before/after analyses');
    
  } catch (error) {
    logger.error('Demo failed:', error);
    console.log();
    console.log('❌ Demo failed. Common issues:');
    console.log('   • Run: npm run setup:content-sources first');
    console.log('   • Check your API tokens in .env');
    console.log('   • Ensure content files are in correct format');
    console.log('   • Check logs in ./logs/content-import.log');
  }
}

async function setupExampleContent(): Promise<void> {
  console.log('🔧 Setting up example content for demonstration...');
  
  // Ensure content-sources directory structure exists
  const dirs = [
    './content-sources',
    './content-sources/canva',
    './content-sources/notion', 
    './content-sources/gpts',
    './content-analysis-results'
  ];
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
  
  // Copy example files if they don't exist in the main directories
  const exampleFiles = [
    {
      src: './content-sources/examples/canva/bitcoin-fundamentals.json',
      dest: './content-sources/canva/bitcoin-fundamentals.json'
    },
    {
      src: './content-sources/examples/gpts/bitcoin-tutor.json',
      dest: './content-sources/gpts/bitcoin-tutor.json'  
    },
    {
      src: './content-sources/examples/notion/lesson-structure.json',
      dest: './content-sources/notion/lesson-structure.json'
    }
  ];
  
  let copiedFiles = 0;
  for (const file of exampleFiles) {
    if (existsSync(file.src) && !existsSync(file.dest)) {
      try {
        copyFileSync(file.src, file.dest);
        copiedFiles++;
        logger.info(`Copied example: ${file.dest}`);
      } catch (error) {
        logger.warn(`Could not copy ${file.src}: ${error}`);
      }
    }
  }
  
  // Create minimal config if it doesn't exist
  if (!existsSync('./content-sources/config.json')) {
    const minimalConfig = {
      canva: {
        enabled: true,
        designs: []
      },
      notion: {
        enabled: true,
        database_ids: []
      },
      gpts: {
        enabled: true,
        config_files: []
      },
      analysis_settings: {
        output_directory: './content-analysis-results',
        auto_backup: true,
        analysis_frequency: 'manual',
        priority_platforms: ['canva', 'notion', 'gpts']
      }
    };
    
    writeFileSync(
      './content-sources/config.json',
      JSON.stringify(minimalConfig, null, 2)
    );
    logger.info('Created minimal config file');
  }
  
  if (copiedFiles > 0) {
    console.log(`✅ Set up ${copiedFiles} example files for analysis`);
  } else {
    console.log('✅ Content sources ready');
  }
  console.log();
}

async function showResultsSummary(): Promise<void> {
  try {
    const resultsPath = './content-analysis-results/comprehensive-analysis.json';
    if (existsSync(resultsPath)) {
      const results = JSON.parse(readFileSync(resultsPath, 'utf-8'));
      
      console.log('🎯 **Analysis Highlights**:');
      console.log(`   Philosophy Consistency: ${results.cross_platform_insights?.philosophy_consistency_score || 'N/A'}/100`);
      console.log(`   Improvement Plans Generated: ${results.improvement_plans?.length || 0}`);
      console.log(`   Content Sources Analyzed: ${results.individual_analyses?.length || 0}`);
      console.log();
      
      if (results.improvement_plans && results.improvement_plans.length > 0) {
        const topPlan = results.improvement_plans[0];
        console.log('🚀 **Top Priority Improvement**:');
        console.log(`   Target: ${topPlan.content_source_id}`);
        console.log(`   Current Score: ${topPlan.current_scores?.educational_effectiveness || 'N/A'}/100`);
        console.log(`   Focus Area: ${topPlan.focus_areas?.[0] || 'General improvement'}`);
        console.log();
      }
      
      if (results.cross_platform_insights?.cross_pollination_opportunities) {
        const opportunities = results.cross_platform_insights.cross_pollination_opportunities;
        if (opportunities.length > 0) {
          console.log('💡 **Cross-Platform Opportunity**:');
          console.log(`   ${opportunities[0].description || 'Transfer successful elements between platforms'}`);
          console.log(`   Potential Impact: ${opportunities[0].impact_potential || 'High'}`);
          console.log();
        }
      }
      
    } else {
      console.log('📄 Analysis results saved but not yet available for summary');
      console.log();
    }
  } catch (error) {
    logger.warn('Could not load results summary:', error);
    console.log();
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  runRealContentDemo().catch(console.error);
}

export default runRealContentDemo;