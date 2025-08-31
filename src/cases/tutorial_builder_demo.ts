#!/usr/bin/env tsx

import { TutorialBuilder } from '../agents/TutorialBuilder.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

async function main() {
  const builder = new TutorialBuilder();
  
  logger.info('🎯 Testing Tutorial Builder...');
  
  try {
    // Test basic tutorial generation
    logger.info('📚 Generating Bitcoin Basics tutorial...');
    const basicTutorial = await builder.buildTutorial('bitcoin-basics', {
      audience: 'beginner',
      includeCanvaDesigns: true
    });

    // Create output directory
    mkdirSync('exports/tutorials', { recursive: true });
    
    // Export tutorial content
    const outputPath = join('exports/tutorials', `${basicTutorial.module.id}.json`);
    writeFileSync(outputPath, JSON.stringify(basicTutorial, null, 2));
    
    logger.info(`✅ Tutorial exported to: ${outputPath}`);
    
    // Display summary
    console.log('\n🎓 Generated Tutorial Summary:');
    console.log(`Title: ${basicTutorial.module.title}`);
    console.log(`Lessons: ${basicTutorial.module.lessons.length}`);
    console.log(`Assessments: ${basicTutorial.assessment_bank.length}`);
    console.log(`Duration: ${basicTutorial.module.total_duration_minutes} minutes`);
    
    // Show first lesson preview
    if (basicTutorial.module.lessons.length > 0) {
      const firstLesson = basicTutorial.module.lessons[0];
      console.log('\n📖 First Lesson Preview:');
      console.log(`Title: ${firstLesson.title}`);
      console.log(`Objectives: ${firstLesson.objectives.length}`);
      console.log(`Content Blocks: ${firstLesson.content_blocks.length}`);
    }
    
    // Test advanced tutorial
    logger.info('⚡ Generating Lightning Network tutorial...');
    const advancedTutorial = await builder.buildTutorial('lightning-network', {
      audience: 'advanced',
      duration: 90,
      includeCanvaDesigns: false
    });
    
    const advancedPath = join('exports/tutorials', `${advancedTutorial.module.id}.json`);
    writeFileSync(advancedPath, JSON.stringify(advancedTutorial, null, 2));
    
    console.log('\n⚡ Advanced Tutorial Generated:');
    console.log(`Title: ${advancedTutorial.module.title}`);
    console.log(`Duration: ${advancedTutorial.module.total_duration_minutes} minutes`);
    console.log(`Lessons: ${advancedTutorial.module.lessons.length}`);
    
    logger.info('✅ Tutorial Builder test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Tutorial Builder test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}