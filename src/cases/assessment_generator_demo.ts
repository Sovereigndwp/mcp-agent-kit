#!/usr/bin/env tsx

import { AssessmentGenerator, AssessmentConfig } from '../agents/AssessmentGenerator.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

async function main() {
  const generator = new AssessmentGenerator();
  
  logger.info('🎯 Testing Assessment Generator...');
  
  try {
    // Create output directory
    mkdirSync('exports/assessments', { recursive: true });
    
    // Test 1: Beginner Fees Quiz (using available topic)
    logger.info('📝 Generating beginner fees quiz...');
    const beginnerConfig: AssessmentConfig = {
      title: 'Bitcoin Transaction Fees Quiz',
      topic: 'fees',
      difficulty: 'beginner',
      question_count: 8,
      question_types: ['multiple_choice', 'true_false', 'scenario'],
      time_limit_minutes: 15,
      include_live_data: true
    };

    const beginnerQuiz = await generator.generateAssessment(beginnerConfig);
    
    const beginnerPath = join('exports/assessments', `${beginnerQuiz.id}.json`);
    writeFileSync(beginnerPath, JSON.stringify(beginnerQuiz, null, 2));
    
    console.log('\n📝 Beginner Quiz Generated:');
    console.log(`Title: ${beginnerQuiz.title}`);
    console.log(`Questions: ${beginnerQuiz.questions.length}`);
    console.log(`Total Points: ${beginnerQuiz.total_points}`);
    console.log(`Time Limit: ${beginnerQuiz.time_limit_minutes} minutes`);
    console.log(`Passing Score: ${beginnerQuiz.passing_score_percentage}%`);
    
    // Show question types breakdown
    const questionTypes = beginnerQuiz.questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Question Types:', questionTypes);
    
    // Test 2: Advanced Mining Assessment  
    logger.info('⚡ Generating advanced mining assessment...');
    const advancedConfig: AssessmentConfig = {
      title: 'Advanced Bitcoin Mining Concepts',
      topic: 'mining',
      difficulty: 'advanced',
      question_count: 12,
      question_types: ['scenario', 'calculation', 'reflection', 'short_answer'],
      time_limit_minutes: 45,
      passing_score: 85,
      include_live_data: true
    };

    const advancedQuiz = await generator.generateAssessment(advancedConfig);
    
    const advancedPath = join('exports/assessments', `${advancedQuiz.id}.json`);
    writeFileSync(advancedPath, JSON.stringify(advancedQuiz, null, 2));
    
    console.log('\n⚡ Advanced Assessment Generated:');
    console.log(`Title: ${advancedQuiz.title}`);
    console.log(`Questions: ${advancedQuiz.questions.length}`);
    console.log(`Total Points: ${advancedQuiz.total_points}`);
    console.log(`Time Limit: ${advancedQuiz.time_limit_minutes} minutes`);
    console.log(`Passing Score: ${advancedQuiz.passing_score_percentage}%`);
    console.log(`Has Rubrics: ${advancedQuiz.rubrics ? 'Yes' : 'No'}`);
    
    // Show sample questions
    console.log('\n📋 Sample Questions:');
    
    // Show a scenario question with live data
    const scenarioQ = beginnerQuiz.questions.find(q => q.type === 'scenario');
    if (scenarioQ) {
      console.log('\n🎭 Scenario Question:');
      console.log(`"${scenarioQ.question}"`);
      console.log(`Points: ${scenarioQ.points}`);
      if (scenarioQ.live_data_context) {
        console.log(`Live Data: BTC Price $${scenarioQ.live_data_context.btc_price_usd}, Fast Fee: ${scenarioQ.live_data_context.fee_estimates?.fast} sat/vB`);
      }
    }
    
    // Show a calculation question
    const calcQ = advancedQuiz.questions.find(q => q.type === 'calculation');
    if (calcQ) {
      console.log('\n🧮 Calculation Question:');
      console.log(`"${calcQ.question}"`);
      console.log(`Answer: ${calcQ.correct_answer}`);
      console.log(`Points: ${calcQ.points}`);
      console.log(`Hints: ${calcQ.hints?.length || 0} available`);
    }
    
    // Test 3: Generate individual question types
    logger.info('🔍 Testing individual question generation...');
    
    const scenarioQuestions = await generator.generateScenarioQuestions('fees', 'intermediate', 3);
    const calculationQuestions = await generator.generateCalculationQuestions('fees', 'beginner', 2);
    
    console.log('\n🎭 Generated Scenarios:', scenarioQuestions.length);
    console.log('🧮 Generated Calculations:', calculationQuestions.length);
    
    // Export sample question bank
    const questionBank = {
      scenarios: scenarioQuestions,
      calculations: calculationQuestions,
      generated_at: new Date().toISOString()
    };
    
    const bankPath = join('exports/assessments', 'sample_question_bank.json');
    writeFileSync(bankPath, JSON.stringify(questionBank, null, 2));
    
    logger.info(`✅ Assessment Generator test completed successfully!`);
    console.log(`\n📁 Files generated:`);
    console.log(`- ${beginnerPath}`);
    console.log(`- ${advancedPath}`);
    console.log(`- ${bankPath}`);
    
  } catch (error) {
    logger.error('❌ Assessment Generator test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}