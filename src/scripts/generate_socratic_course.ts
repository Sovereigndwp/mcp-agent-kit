#!/usr/bin/env ts-node

import { Command } from 'commander';
import { SocraticCourseOrchestrator, SocraticCourseRequest } from '../agents/SocraticCourseOrchestrator.js';
import { logger } from '../utils/logger.js';

const program = new Command();

program
  .name('generate-socratic-course')
  .description('Generate a unique Socratic course using AI agent orchestration')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new Socratic course')
  .option('-t, --topic <topic>', 'Course topic', 'Bitcoin Fundamentals')
  .option('-a, --audience <audience>', 'Target audience', 'beginner')
  .option('-d, --duration <hours>', 'Course duration in hours', '3')
  .option('-s, --style <style>', 'Learning style preference', 'mixed')
  .option('--notion', 'Include Notion workspace integration', false)
  .option('--canva', 'Include Canva design materials', false)
  .option('-o, --objectives <objectives...>', 'Learning objectives')
  .option('-c, --custom <instructions>', 'Custom instructions')
  .action(async (options) => {
    try {
      logger.info('🚀 Starting Socratic course generation...');
      console.log('📚 Course Configuration:');
      console.log(`   Topic: ${options.topic}`);
      console.log(`   Audience: ${options.audience}`);
      console.log(`   Duration: ${options.duration} hours`);
      console.log(`   Learning Style: ${options.style}`);
      console.log(`   Notion Integration: ${options.notion ? 'Yes' : 'No'}`);
      console.log(`   Canva Materials: ${options.canva ? 'Yes' : 'No'}`);
      console.log('');

      const orchestrator = new SocraticCourseOrchestrator();
      
      const request: SocraticCourseRequest = {
        topic: options.topic,
        target_audience: options.audience as any,
        learning_objectives: options.objectives || [
          `Master core concepts of ${options.topic}`,
          `Apply knowledge through hands-on practice`,
          `Develop critical thinking skills through Socratic questioning`
        ],
        preferred_learning_style: options.style as any,
        duration_hours: parseFloat(options.duration),
        include_notion_content: options.notion,
        include_canva_designs: options.canva,
        custom_instructions: options.custom
      };

      const course = await orchestrator.createSocraticCourse(request);
      
      console.log('✅ Course generated successfully!');
      console.log('');
      console.log('📊 Course Summary:');
      console.log(`   Course ID: ${course.course_id}`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Modules: ${course.modules.length}`);
      console.log(`   Quality Score: ${course.quality_score}/100`);
      console.log(`   Total Duration: ${course.total_duration_hours} hours`);
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('   1. Check the exports/socratic_courses directory for your course files');
      console.log('   2. Open course_website.html in your browser to preview the course');
      console.log('   3. Follow the Notion setup guide if you enabled Notion integration');
      console.log('   4. Import the Canva CSV if you enabled design materials');
      console.log('');
      console.log(`📁 Course Location: exports/socratic_courses/${course.course_id}`);

    } catch (error) {
      logger.error('Failed to generate course:', error);
      console.error('❌ Course generation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('sample')
  .description('Generate a sample Bitcoin Fundamentals course')
  .action(async () => {
    try {
      logger.info('🚀 Generating sample Socratic course...');
      console.log('📚 Creating sample Bitcoin Fundamentals course...');
      
      const orchestrator = new SocraticCourseOrchestrator();
      const course = await orchestrator.generateSampleCourse();
      
      console.log('✅ Sample course generated successfully!');
      console.log('');
      console.log('📊 Course Details:');
      console.log(`   Title: ${course.title}`);
      console.log(`   Modules: ${course.modules.length}`);
      console.log(`   Quality Score: ${course.quality_score}/100`);
      console.log('');
      console.log(`📁 Location: exports/socratic_courses/${course.course_id}`);
      console.log('🌐 Open course_website.html to preview your course!');

    } catch (error) {
      logger.error('Failed to generate sample course:', error);
      console.error('❌ Sample course generation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('list-agents')
  .description('List all available agents in the orchestration system')
  .action(() => {
    console.log('🤖 Available Agents in Socratic Course Orchestrator:');
    console.log('');
    console.log('📊 Content Analysis Agents:');
    console.log('   • NotionContentAnalyzer - Extract insights from Notion workspace');
    console.log('   • CanvaContentAnalyzer - Analyze design patterns from Canva');  
    console.log('   • ContentPhilosophyAnalyzer - Analyze learning philosophy');
    console.log('');
    console.log('🎓 Educational Agents:');
    console.log('   • SocraticTutor - Generate Socratic questioning sequences');
    console.log('   • TutorialBuilder - Create structured learning modules');
    console.log('   • AssessmentGenerator - Generate contextual assessments');
    console.log('');
    console.log('🎨 Design & Visual Agents:');
    console.log('   • CanvaDesignAnalyzer - Analyze visual learning patterns');
    console.log('   • BrandIdentitySystem - Create consistent visual identity');
    console.log('   • CanvaDesignCoach - Generate design materials');
    console.log('');
    console.log('⚡ Enhancement Agents:');
    console.log('   • ContentImprovementEngine - Optimize learning effectiveness');
    console.log('   • ProgressTracker - Track and analyze learning progress');
    console.log('');
    console.log('🎯 How They Work Together:');
    console.log('   1. Content agents extract and analyze existing materials');
    console.log('   2. Educational agents create Socratic frameworks and assessments');
    console.log('   3. Design agents create visual learning materials');
    console.log('   4. Enhancement agents optimize for effectiveness');
    console.log('   5. All coordinated by SocraticCourseOrchestrator');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}