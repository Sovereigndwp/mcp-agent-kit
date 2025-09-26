#!/usr/bin/env ts-node

import { runBrandLearning } from './brand_learn';
import { runCourseBuild } from './course_build';
import { runCourseRevision } from './course_revise';
import { runMarketingPipeline } from './marketing_run';
import { runEvaluationPipeline } from './eval_run';

/**
 * One-Command Runner Pipeline
 * Calls the four main steps plus quick evaluation:
 * 1. Brand Learning (if needed)
 * 2. Course Building
 * 3. Course Revision
 * 4. Marketing Generation
 * 5. Quick Evaluation
 */

interface PipelineResult {
  step: string;
  success: boolean;
  duration: number;
  output?: any;
  error?: string;
}

interface LessonCreationResults {
  total_duration: number;
  pipeline_results: PipelineResult[];
  final_status: 'success' | 'partial_success' | 'failure';
  lessons_created: number;
  lessons_approved: number;
  marketing_assets_created: number;
  recommendations: string[];
}

async function checkBrandProfileExists(): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
    await fs.access(brandPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function runPipelineStep(
  stepName: string,
  stepFunction: () => Promise<any>,
  required: boolean = true
): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log(`\n🚀 Starting ${stepName}...`);

  try {
    const result = await stepFunction();
    const duration = Date.now() - startTime;

    console.log(`✅ ${stepName} completed in ${Math.round(duration / 1000)}s`);

    return {
      step: stepName,
      success: true,
      duration,
      output: result
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`❌ ${stepName} failed after ${Math.round(duration / 1000)}s:`, errorMessage);

    if (required) {
      throw error;
    }

    return {
      step: stepName,
      success: false,
      duration,
      error: errorMessage
    };
  }
}

async function extractResultsMetrics(results: PipelineResult[]): Promise<{
  lessons_created: number;
  lessons_approved: number;
  marketing_assets_created: number;
}> {
  let lessons_created = 0;
  let lessons_approved = 0;
  let marketing_assets_created = 0;

  for (const result of results) {
    if (result.success && result.output) {
      switch (result.step) {
        case 'Course Building':
          lessons_created += 1; // Each build run creates one lesson
          break;
        case 'Course Revision':
          if (result.output.approved) {
            lessons_approved += result.output.approved;
          }
          break;
        case 'Marketing Generation':
          if (result.output.processedFiles) {
            marketing_assets_created += result.output.processedFiles;
          }
          break;
      }
    }
  }

  return { lessons_created, lessons_approved, marketing_assets_created };
}

function generateRecommendations(results: PipelineResult[]): string[] {
  const recommendations = [];
  const failedSteps = results.filter(r => !r.success);

  if (failedSteps.length === 0) {
    recommendations.push('🎉 Perfect run! All pipelines completed successfully.');
    recommendations.push('📋 Review generated content in workspace directories');
    recommendations.push('🚀 Ready to run npm run export:pack for final deliverables');
  } else {
    recommendations.push(`⚠️  ${failedSteps.length} step(s) had issues - review and retry`);

    for (const failed of failedSteps) {
      switch (failed.step) {
        case 'Brand Learning':
          recommendations.push('🎨 Check Canva API credentials and brand folder access');
          break;
        case 'Course Building':
          recommendations.push('📚 Verify agent configurations and content templates');
          break;
        case 'Course Revision':
          recommendations.push('📝 Review content for readability and accuracy issues');
          break;
        case 'Marketing Generation':
          recommendations.push('📢 Check approved lessons directory and marketing templates');
          break;
        case 'Quick Evaluation':
          recommendations.push('📊 Review evaluation criteria and lesson structure');
          break;
      }
    }
  }

  // General recommendations based on results
  const successfulSteps = results.filter(r => r.success);
  if (successfulSteps.length > 0) {
    recommendations.push('💡 Consider running individual pipelines for fine-tuning');
    recommendations.push('🔄 Use npm run course:revise for iterative improvements');
  }

  return recommendations;
}

async function runLessonCreation(): Promise<LessonCreationResults> {
  const startTime = Date.now();
  const results: PipelineResult[] = [];

  console.log('🎯 Starting Complete Lesson Creation Pipeline...');
  console.log('📋 This will run all steps to create a lesson from scratch\n');

  try {
    // Step 1: Brand Learning (conditional)
    const brandExists = await checkBrandProfileExists();
    if (!brandExists) {
      console.log('🎨 Brand profile not found - running brand learning first...');
      const brandResult = await runPipelineStep(
        'Brand Learning',
        runBrandLearning,
        true
      );
      results.push(brandResult);
    } else {
      console.log('✅ Brand profile exists - skipping brand learning');
      results.push({
        step: 'Brand Learning',
        success: true,
        duration: 0,
        output: { skipped: true, reason: 'Brand profile already exists' }
      });
    }

    // Step 2: Course Building
    const buildResult = await runPipelineStep(
      'Course Building',
      runCourseBuild,
      true
    );
    results.push(buildResult);

    // Step 3: Course Revision
    const reviseResult = await runPipelineStep(
      'Course Revision',
      runCourseRevision,
      true
    );
    results.push(reviseResult);

    // Step 4: Marketing Generation
    const marketingResult = await runPipelineStep(
      'Marketing Generation',
      runMarketingPipeline,
      false // Not required - can proceed without marketing
    );
    results.push(marketingResult);

    // Step 5: Quick Evaluation
    const evalResult = await runPipelineStep(
      'Quick Evaluation',
      runEvaluationPipeline,
      false // Not required - final step
    );
    results.push(evalResult);

    // Calculate final metrics
    const metrics = await extractResultsMetrics(results);
    const totalDuration = Date.now() - startTime;
    const successfulSteps = results.filter(r => r.success).length;
    const totalSteps = results.length;

    // Determine final status
    let finalStatus: 'success' | 'partial_success' | 'failure';
    if (successfulSteps === totalSteps) {
      finalStatus = 'success';
    } else if (successfulSteps >= 3) { // Brand, Build, Revise are core
      finalStatus = 'partial_success';
    } else {
      finalStatus = 'failure';
    }

    const recommendations = generateRecommendations(results);

    const finalResults: LessonCreationResults = {
      total_duration: totalDuration,
      pipeline_results: results,
      final_status: finalStatus,
      lessons_created: metrics.lessons_created,
      lessons_approved: metrics.lessons_approved,
      marketing_assets_created: metrics.marketing_assets_created,
      recommendations
    };

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 LESSON CREATION PIPELINE COMPLETE');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`📊 Status: ${finalStatus.toUpperCase()}`);
    console.log(`✅ Successful Steps: ${successfulSteps}/${totalSteps}`);
    console.log(`📚 Lessons Created: ${metrics.lessons_created}`);
    console.log(`🏆 Lessons Approved: ${metrics.lessons_approved}`);
    console.log(`📢 Marketing Assets: ${metrics.marketing_assets_created}`);
    console.log('\n📋 RECOMMENDATIONS:');
    recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log('\n🗂️  WORKSPACE STRUCTURE:');
    console.log('   workspace/brand/     - Brand profile and templates');
    console.log('   workspace/drafts/    - Draft lessons needing revision');
    console.log('   workspace/approved/  - Approved lessons ready for use');
    console.log('   workspace/marketing/ - Marketing assets and campaigns');
    console.log('   workspace/eval/      - Evaluation reports and metrics');
    console.log('   workspace/assets/    - Simulations and supporting files');
    console.log('='.repeat(60));

    return finalResults;

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('\n❌ LESSON CREATION PIPELINE FAILED');
    console.error(`Error: ${errorMessage}`);
    console.error(`Duration: ${Math.round(totalDuration / 1000)}s`);

    // Still return results for completed steps
    const metrics = await extractResultsMetrics(results);
    const recommendations = generateRecommendations(results);

    return {
      total_duration: totalDuration,
      pipeline_results: results,
      final_status: 'failure',
      lessons_created: metrics.lessons_created,
      lessons_approved: metrics.lessons_approved,
      marketing_assets_created: metrics.marketing_assets_created,
      recommendations: [
        `❌ Pipeline failed: ${errorMessage}`,
        ...recommendations
      ]
    };
  }
}

// Run if called directly
if (require.main === module) {
  runLessonCreation()
    .then((results) => {
      const exitCode = results.final_status === 'failure' ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runLessonCreation };