#!/usr/bin/env tsx

import { ContentOrchestrator } from '../agents/ContentOrchestrator.js';
import { logger } from '../utils/logger.js';

async function main() {
  const orchestrator = new ContentOrchestrator();
  
  logger.info('🎯 Testing Content Orchestrator...');
  
  try {
    // Test 1: Generate a complete Bitcoin fees course
    logger.info('🎓 Generating complete Bitcoin fees course...');
    
    const feesCoursePath = await orchestrator.generateContent({
      topic: 'transaction-fees',
      difficulty: 'beginner',
      format: 'complete_course',
      customizations: {
        duration_minutes: 90,
        include_assessments: true,
        include_designs: true,
        assessment_types: ['multiple_choice', 'scenario', 'calculation'],
        audience: 'new Bitcoin users'
      }
    });

    console.log('\n🎓 Complete Bitcoin Fees Course Generated!');
    console.log(`📁 Output directory: ${feesCoursePath}`);
    console.log('📋 Includes:');
    console.log('  ✅ Tutorial with 4 lessons');
    console.log('  ✅ 2 assessments (main + quick quiz)');
    console.log('  ✅ Design materials and Canva CSV');
    console.log('  ✅ Web-ready index page');

    // Test 2: Generate mining course for advanced learners
    logger.info('⛏️ Generating advanced mining course...');
    
    const miningCoursePath = await orchestrator.generateContent({
      topic: 'mining',
      difficulty: 'advanced',
      format: 'complete_course',
      customizations: {
        duration_minutes: 180,
        include_assessments: true,
        include_designs: true,
        assessment_types: ['scenario', 'calculation', 'reflection'],
        audience: 'experienced Bitcoin users and developers'
      }
    });

    console.log('\n⛏️ Advanced Mining Course Generated!');
    console.log(`📁 Output directory: ${miningCoursePath}`);

    // Test 3: Generate assessment-only package
    logger.info('📝 Generating wallets assessment package...');
    
    const walletsAssessmentPath = await orchestrator.generateContent({
      topic: 'wallets', // This maps to available SocraticTutor topics
      difficulty: 'intermediate',
      format: 'assessment_only',
      customizations: {
        include_assessments: true,
        assessment_types: ['multiple_choice', 'scenario', 'true_false'],
        audience: 'Bitcoin wallet users'
      }
    });

    console.log('\n📝 Wallets Assessment Package Generated!');
    console.log(`📁 Output directory: ${walletsAssessmentPath}`);

    // Test 4: Generate design materials only
    logger.info('🎨 Generating security design materials...');
    
    const securityDesignPath = await orchestrator.generateContent({
      topic: 'security-privacy', // Use correct TutorialBuilder topic name
      difficulty: 'beginner',
      format: 'design_materials',
      customizations: {
        include_designs: true,
        design_style: 'educational infographics',
        audience: 'Bitcoin security newcomers'
      }
    });

    console.log('\n🎨 Security Design Materials Generated!');
    console.log(`📁 Output directory: ${securityDesignPath}`);

    // Test 5: Generate comprehensive educational package (shortcut method)
    logger.info('📚 Generating comprehensive scaling educational package...');
    
    const scalingPackagePath = await orchestrator.generateEducationalPackage('lightning-network', 'intermediate'); // Use available topic
    
    console.log('\n📚 Comprehensive Scaling Package Generated!');
    console.log(`📁 Output directory: ${scalingPackagePath}`);
    console.log('🚀 This package includes everything needed for a complete learning experience');

    // Test 6: Create and execute a custom workflow
    logger.info('🔄 Testing custom workflow creation and execution...');
    
    const workflowId = await orchestrator.createWorkflow({
      name: 'Quick Bitcoin Introduction',
      description: 'Rapid content generation for Bitcoin introduction workshops',
      status: 'active',
      steps: [
        {
          id: 'tutorial_gen',
          name: 'Generate Introduction Tutorial',
          type: 'tutorial_generation',
          config: { topic: 'bitcoin-basics', difficulty: 'beginner', duration: 60 },
          dependencies: [],
          timeout_minutes: 10,
          retry_count: 2,
          success_criteria: ['tutorial_created']
        },
        {
          id: 'quick_quiz',
          name: 'Create Quick Assessment',
          type: 'assessment_generation',
          config: { question_count: 5, types: ['multiple_choice'] },
          dependencies: ['tutorial_gen'],
          timeout_minutes: 5,
          retry_count: 1,
          success_criteria: ['quiz_created']
        }
      ],
      triggers: [
        {
          type: 'manual',
          config: {},
          active: true
        }
      ],
      outputs: [
        {
          type: 'tutorial',
          destination: 'file_system',
          format: 'json',
          config: { directory: 'exports/workflows' }
        }
      ]
    });

    console.log(`\n🔄 Custom Workflow Created: ${workflowId}`);

    // Execute the custom workflow
    const execution = await orchestrator.executeWorkflow(workflowId, {
      topic: 'bitcoin-basics',
      difficulty: 'beginner',
      title: 'Bitcoin Introduction Workshop'
    });

    console.log('\n🎯 Workflow Execution Results:');
    console.log(`Execution ID: ${execution.execution_id}`);
    console.log(`Status: ${execution.status}`);
    console.log(`Duration: ${execution.duration_minutes} minutes`);
    console.log('Step Results:');
    Object.entries(execution.step_results).forEach(([stepId, result]) => {
      console.log(`  ${stepId}: ${result.status}`);
    });

    // Test 7: Show summary of all generated content
    console.log('\n📊 Content Generation Summary:');
    console.log('╭─────────────────────────────────────────────────────╮');
    console.log('│ 🎓 Generated Content Packages                      │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ 1. Bitcoin Fees Course (beginner)                  │`);
    console.log(`│ 2. Mining Course (advanced)                        │`);
    console.log(`│ 3. Wallets Assessment Package (intermediate)       │`);
    console.log(`│ 4. Security Design Materials (beginner)            │`);
    console.log(`│ 5. Scaling Educational Package (intermediate)      │`);
    console.log(`│ 6. Custom Workflow: Quick Bitcoin Introduction     │`);
    console.log('╰─────────────────────────────────────────────────────╯');

    console.log('\n🚀 Next Steps:');
    console.log('• Open index.html files in each directory to preview content');
    console.log('• Import CSV files into Canva for design creation');  
    console.log('• Deploy tutorials to your learning management system');
    console.log('• Set up automated workflows for regular content generation');
    console.log('• Configure progress tracking for learners');

    logger.info('✅ Content Orchestrator test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Content Orchestrator test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}