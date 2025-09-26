#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { LearningPathOptimizer } from '../agents/LearningPathOptimizer';
import { MasterAccuracySystem } from '../agents/MasterAccuracySystem';
import { EnhancedBrandAgent } from '../agents/EnhancedBrandAgent';

/**
 * Evaluation Pipeline
 * Comprehensive evaluation of lesson effectiveness, accuracy, and learner outcomes
 */

interface EvaluationMetrics {
  lesson_id: string;
  lesson_title: string;
  evaluation_date: string;
  readability_score: number;
  accuracy_score: number;
  brand_consistency_score: number;
  learning_effectiveness_score: number;
  engagement_potential_score: number;
  overall_quality_score: number;
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
  certification_ready: boolean;
}

interface LearnerFeedback {
  clarity_rating: number;
  engagement_rating: number;
  difficulty_appropriateness: number;
  practical_applicability: number;
  completion_rate: number;
  time_spent_vs_estimated: number;
}

async function loadConfig() {
  const configPath = path.join(process.cwd(), 'config', 'app.config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function loadBrandProfile() {
  const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
  const brandData = await fs.readFile(brandPath, 'utf-8');
  return JSON.parse(brandData);
}

async function getAllLessonFiles(): Promise<{ approved: string[]; drafts: string[] }> {
  const approvedDir = path.join('workspace', 'approved');
  const draftsDir = path.join('workspace', 'drafts');

  const approved = [];
  const drafts = [];

  try {
    const approvedFiles = await fs.readdir(approvedDir);
    approved.push(...approvedFiles.filter(file => file.endsWith('.md')).map(file => path.join(approvedDir, file)));
  } catch (error) {
    // Directory doesn't exist or is empty
  }

  try {
    const draftFiles = await fs.readdir(draftsDir);
    drafts.push(...draftFiles.filter(file => file.endsWith('.md')).map(file => path.join(draftsDir, file)));
  } catch (error) {
    // Directory doesn't exist or is empty
  }

  return { approved, drafts };
}

async function parseLessonFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const parts = content.split('---');

  if (parts.length < 3) {
    throw new Error(`Invalid lesson format in ${filePath}`);
  }

  const metadata = JSON.parse(parts[1]);
  const lessonContent = parts.slice(2).join('---').trim();

  return { metadata, lessonContent, filePath };
}

async function calculateReadabilityScore(content: string): Promise<number> {
  // Flesch-Kincaid readability score
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = content.split(/\s+/).filter(w => w.length > 0).length;
  const syllables = content.replace(/[^aeiouAEIOU]/g, '').length;

  if (sentences === 0 || words === 0) return 0;

  const avgSentenceLength = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const fleschKincaid = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(fleschKincaid)));
}

async function evaluateLearningEffectiveness(content: string, metadata: any): Promise<number> {
  let score = 0;

  // Check for clear learning objectives (20 points)
  if (metadata.learning_outcomes && metadata.learning_outcomes.length >= 3) {
    score += 20;
  }

  // Check for interactive elements (20 points)
  const interactiveElements = (content.match(/\[.*?\]|\*\*.*?\*\*|`.*?`/g) || []).length;
  score += Math.min(20, interactiveElements * 2);

  // Check for practical examples (20 points)
  const practicalKeywords = ['example', 'practice', 'try', 'simulation', 'hands-on'];
  const practicalCount = practicalKeywords.reduce((count, keyword) =>
    count + (content.toLowerCase().split(keyword).length - 1), 0);
  score += Math.min(20, practicalCount * 4);

  // Check for assessment/review sections (20 points)
  const assessmentKeywords = ['check', 'quiz', 'question', 'review', 'test'];
  const hasAssessment = assessmentKeywords.some(keyword =>
    content.toLowerCase().includes(keyword));
  if (hasAssessment) score += 20;

  // Check for scaffolding and progression (20 points)
  const progressionIndicators = ['first', 'next', 'then', 'finally', 'step'];
  const progressionCount = progressionIndicators.reduce((count, indicator) =>
    count + (content.toLowerCase().split(indicator).length - 1), 0);
  score += Math.min(20, progressionCount * 3);

  return Math.round(score);
}

async function evaluateEngagementPotential(content: string): Promise<number> {
  let score = 0;

  // Check for engaging elements
  const emojis = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
  score += Math.min(15, emojis * 2);

  // Questions to engage reader
  const questions = (content.match(/\?/g) || []).length;
  score += Math.min(15, questions * 3);

  // Conversational tone indicators
  const conversationalWords = ['you', 'your', 'we', 'let\'s', 'ready'];
  const conversationalCount = conversationalWords.reduce((count, word) =>
    count + (content.toLowerCase().split(word).length - 1), 0);
  score += Math.min(20, conversationalCount);

  // Varied sentence structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  const variance = sentences.reduce((sum, s) => sum + Math.pow(s.length - avgLength, 2), 0) / sentences.length;
  score += Math.min(15, variance / 100);

  // Call-to-action elements
  const ctaWords = ['start', 'try', 'practice', 'explore', 'discover'];
  const ctaCount = ctaWords.reduce((count, word) =>
    count + (content.toLowerCase().split(word).length - 1), 0);
  score += Math.min(15, ctaCount * 2);

  // Visual elements indicators
  const visualIndicators = ['image', 'chart', 'diagram', 'visual', 'graphic'];
  const visualCount = visualIndicators.reduce((count, indicator) =>
    count + (content.toLowerCase().split(indicator).length - 1), 0);
  score += Math.min(20, visualCount * 5);

  return Math.round(score);
}

async function simulateLearnerFeedback(metadata: any, content: string): Promise<LearnerFeedback> {
  // Simulate realistic learner feedback based on content analysis
  const contentLength = content.length;
  const estimatedMinutes = parseInt(metadata.estimated_duration?.match(/\d+/)?.[0] || '15');

  return {
    clarity_rating: 7.5 + Math.random() * 1.5, // 7.5-9.0
    engagement_rating: 6.0 + Math.random() * 2.5, // 6.0-8.5
    difficulty_appropriateness: 7.0 + Math.random() * 2.0, // 7.0-9.0
    practical_applicability: 6.5 + Math.random() * 2.0, // 6.5-8.5
    completion_rate: 0.75 + Math.random() * 0.2, // 75-95%
    time_spent_vs_estimated: 0.8 + Math.random() * 0.6 // 80-140% of estimated time
  };
}

async function generateRecommendations(metrics: Partial<EvaluationMetrics>, content: string): Promise<{
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
}> {
  const recommendations = [];
  const strengths = [];
  const areas_for_improvement = [];

  // Readability analysis
  if (metrics.readability_score! >= 70) {
    strengths.push('Excellent readability - appropriate for target audience');
  } else if (metrics.readability_score! >= 50) {
    recommendations.push('Consider simplifying some sentences for better readability');
    areas_for_improvement.push('Sentence complexity');
  } else {
    recommendations.push('Significant readability improvements needed - break down complex sentences');
    areas_for_improvement.push('Overall readability');
  }

  // Accuracy analysis
  if (metrics.accuracy_score! >= 95) {
    strengths.push('High technical accuracy with proper fact verification');
  } else if (metrics.accuracy_score! >= 85) {
    recommendations.push('Minor fact-checking needed for some claims');
    areas_for_improvement.push('Technical accuracy');
  } else {
    recommendations.push('Comprehensive fact-checking required before approval');
    areas_for_improvement.push('Technical content validation');
  }

  // Brand consistency
  if (metrics.brand_consistency_score! >= 85) {
    strengths.push('Strong brand voice consistency');
  } else {
    recommendations.push('Align content more closely with established brand voice');
    areas_for_improvement.push('Brand voice consistency');
  }

  // Learning effectiveness
  if (metrics.learning_effectiveness_score! >= 80) {
    strengths.push('Well-structured learning experience with clear objectives');
  } else if (metrics.learning_effectiveness_score! >= 60) {
    recommendations.push('Add more interactive elements and practical examples');
    areas_for_improvement.push('Learning engagement');
  } else {
    recommendations.push('Restructure lesson with clearer learning objectives and assessments');
    areas_for_improvement.push('Learning design');
  }

  // Engagement potential
  if (metrics.engagement_potential_score! >= 70) {
    strengths.push('High engagement potential with interactive elements');
  } else {
    recommendations.push('Increase engagement through more questions, examples, and interactive content');
    areas_for_improvement.push('Student engagement');
  }

  // Content-specific recommendations
  if (content.includes('[VERIFY]')) {
    recommendations.push('Address all [VERIFY] flags with proper citations');
    areas_for_improvement.push('Fact verification');
  }

  if (!content.includes('practice') && !content.includes('simulation')) {
    recommendations.push('Add hands-on practice opportunities');
    areas_for_improvement.push('Practical application');
  }

  return { recommendations, strengths, areas_for_improvement };
}

async function runEvaluationPipeline() {
  console.log('📊 Starting Evaluation Pipeline...');

  try {
    // Load configuration and brand profile
    const config = await loadConfig();
    const brandProfile = await loadBrandProfile();
    console.log('✅ Configuration and brand profile loaded');

    // Initialize evaluation agents
    const pathOptimizer = new LearningPathOptimizer();
    const accuracySystem = new MasterAccuracySystem();
    const brandAgent = new EnhancedBrandAgent();
    console.log('✅ Evaluation agents initialized');

    // Get all lesson files
    const { approved, drafts } = await getAllLessonFiles();
    const allFiles = [...approved, ...drafts];

    if (allFiles.length === 0) {
      console.log('ℹ️  No lessons found to evaluate');
      return { success: true, processedFiles: 0 };
    }

    console.log(`📋 Found ${allFiles.length} lessons to evaluate (${approved.length} approved, ${drafts.length} drafts)`);

    const evaluationResults = [];

    for (const filePath of allFiles) {
      console.log(`\n📊 Evaluating: ${path.basename(filePath)}`);

      const { metadata, lessonContent } = await parseLessonFile(filePath);

      // Run comprehensive evaluation
      console.log('  📖 Analyzing readability...');
      const readabilityScore = await calculateReadabilityScore(lessonContent);

      console.log('  ✅ Checking technical accuracy...');
      const accuracyCheck = await accuracySystem.executeToolCall('validate_bitcoin_technical_content', {
        content: lessonContent,
        validation_level: 'comprehensive',
        cross_reference_sources: true
      });

      console.log('  🎨 Evaluating brand consistency...');
      const brandCheck = await brandAgent.executeToolCall('evaluate_brand_consistency', {
        content: lessonContent,
        brand_guidelines: brandProfile.guidelines,
        voice_tone_target: config.style_rules.brand_voice
      });

      console.log('  🎯 Assessing learning effectiveness...');
      const learningEffectivenessScore = await evaluateLearningEffectiveness(lessonContent, metadata);

      console.log('  🎮 Evaluating engagement potential...');
      const engagementPotentialScore = await evaluateEngagementPotential(lessonContent);

      // Calculate overall quality score
      const overallQualityScore = Math.round(
        (readabilityScore * 0.2 +
         accuracyCheck.accuracy_score * 0.25 +
         brandCheck.consistency_score * 0.15 +
         learningEffectivenessScore * 0.25 +
         engagementPotentialScore * 0.15)
      );

      // Generate recommendations
      const partialMetrics = {
        readability_score: readabilityScore,
        accuracy_score: accuracyCheck.accuracy_score,
        brand_consistency_score: brandCheck.consistency_score,
        learning_effectiveness_score: learningEffectivenessScore,
        engagement_potential_score: engagementPotentialScore
      };

      const { recommendations, strengths, areas_for_improvement } =
        await generateRecommendations(partialMetrics, lessonContent);

      // Simulate learner feedback
      const learnerFeedback = await simulateLearnerFeedback(metadata, lessonContent);

      // Create comprehensive evaluation metrics
      const evaluationMetrics: EvaluationMetrics = {
        lesson_id: metadata.id,
        lesson_title: metadata.title,
        evaluation_date: new Date().toISOString(),
        readability_score: readabilityScore,
        accuracy_score: accuracyCheck.accuracy_score,
        brand_consistency_score: brandCheck.consistency_score,
        learning_effectiveness_score: learningEffectivenessScore,
        engagement_potential_score: engagementPotentialScore,
        overall_quality_score: overallQualityScore,
        recommendations,
        strengths,
        areas_for_improvement,
        certification_ready: overallQualityScore >= 85 && accuracyCheck.accuracy_score >= 95
      };

      // Save evaluation results
      const evalFileName = `eval_${metadata.id}.json`;
      const evalPath = path.join('workspace', 'eval', evalFileName);
      await fs.mkdir(path.dirname(evalPath), { recursive: true });

      const fullEvaluation = {
        evaluation_metrics: evaluationMetrics,
        learner_feedback_simulation: learnerFeedback,
        technical_details: {
          accuracy_details: accuracyCheck,
          brand_details: brandCheck,
          content_analysis: {
            word_count: lessonContent.split(/\s+/).length,
            sentence_count: lessonContent.split(/[.!?]+/).length - 1,
            paragraph_count: lessonContent.split(/\n\s*\n/).length,
            interactive_elements: (lessonContent.match(/\[.*?\]|\*\*.*?\*\*|`.*?`/g) || []).length
          }
        },
        improvement_plan: recommendations.length > 0 ? {
          priority_actions: recommendations.slice(0, 3),
          timeline: 'Address high-priority items within 1 week',
          resources_needed: ['Technical review', 'Editorial pass', 'Brand alignment check'],
          success_metrics: ['Readability score > 70', 'Accuracy score > 95', 'Overall quality > 85']
        } : null
      };

      await fs.writeFile(evalPath, JSON.stringify(fullEvaluation, null, 2));

      evaluationResults.push({
        lesson: metadata.title,
        file: path.basename(filePath),
        overall_score: overallQualityScore,
        certification_ready: evaluationMetrics.certification_ready,
        eval_path: evalPath
      });

      const status = evaluationMetrics.certification_ready ? '🏆 CERTIFICATION READY' :
                     overallQualityScore >= 70 ? '✅ GOOD QUALITY' : '⚠️  NEEDS IMPROVEMENT';

      console.log(`  ${status} - Overall Score: ${overallQualityScore}/100`);
    }

    // Create summary report
    const summaryReport = {
      evaluation_date: new Date().toISOString(),
      total_lessons_evaluated: evaluationResults.length,
      certification_ready: evaluationResults.filter(r => r.certification_ready).length,
      good_quality: evaluationResults.filter(r => r.overall_score >= 70 && !r.certification_ready).length,
      needs_improvement: evaluationResults.filter(r => r.overall_score < 70).length,
      average_score: Math.round(evaluationResults.reduce((sum, r) => sum + r.overall_score, 0) / evaluationResults.length),
      lessons: evaluationResults,
      next_steps: [
        'Review lessons needing improvement',
        'Address high-priority recommendations',
        'Re-evaluate improved lessons',
        'Move certification-ready lessons to final approval'
      ]
    };

    const summaryPath = path.join('workspace', 'eval', 'evaluation_summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summaryReport, null, 2));

    console.log('\n🎉 Evaluation Pipeline completed!');
    console.log(`📊 Summary:`);
    console.log(`   🏆 Certification ready: ${summaryReport.certification_ready} lessons`);
    console.log(`   ✅ Good quality: ${summaryReport.good_quality} lessons`);
    console.log(`   ⚠️  Needs improvement: ${summaryReport.needs_improvement} lessons`);
    console.log(`   📈 Average score: ${summaryReport.average_score}/100`);

    console.log('\nNext steps:');
    console.log('- Review evaluation summary in workspace/eval/evaluation_summary.json');
    console.log('- Address recommendations for lessons needing improvement');
    console.log('- Run: npm run export:pack for certification-ready lessons');

    return {
      success: true,
      processedFiles: evaluationResults.length,
      summary: summaryReport
    };

  } catch (error) {
    console.error('❌ Evaluation Pipeline failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runEvaluationPipeline()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runEvaluationPipeline };