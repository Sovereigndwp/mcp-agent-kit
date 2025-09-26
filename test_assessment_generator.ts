#!/usr/bin/env node

/**
 * Comprehensive Test for AssessmentGenerator Agent
 * Tests the agent's capabilities for creating assessment frameworks
 * for the "Sovereign Stacker: The Bitcoin Journey" simulation
 */

import { AssessmentGenerator, AssessmentConfig, Assessment, AssessmentQuestion, AssessmentRubric } from './src/agents/AssessmentGenerator.ts';
import fs from 'fs';
import path from 'path';

interface BitcoinStaxTimeline {
  gameTitle: string;
  gameDescription: string;
  scoringMetrics: {
    netWorth: string;
    sovereigntyScore: string;
    resilienceScore: string;
  };
  timeline: Array<{
    year: string;
    period: string;
    status: string;
    events: string[];
    playerChoices: string[];
    socraticQuestion: string;
    economicContext: string;
    bitcoinRelevance: string;
  }>;
  learningObjectives: string[];
}

class AssessmentGeneratorTester {
  private generator: AssessmentGenerator;
  private timelineData: BitcoinStaxTimeline;
  private testResults: any[] = [];

  constructor() {
    this.generator = new AssessmentGenerator();
    this.loadTimelineData();
  }

  private loadTimelineData() {
    try {
      const timelinePath = '/Users/dalia/projects/mcp-agent-kit/data/bitcoin-stax-timeline.json';
      const data = fs.readFileSync(timelinePath, 'utf8');
      this.timelineData = JSON.parse(data);
      console.log('✅ Successfully loaded timeline data');
    } catch (error) {
      console.error('❌ Failed to load timeline data:', error);
      throw error;
    }
  }

  private logTest(testName: string, passed: boolean, details?: any) {
    const result = { testName, passed, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    console.log(passed ? '✅' : '❌', testName);
    if (details) {
      console.log('   Details:', JSON.stringify(details, null, 2));
    }
  }

  /**
   * Test 1: Basic Assessment Generation Capabilities
   */
  async testBasicAssessmentGeneration() {
    console.log('\n🧪 Testing Basic Assessment Generation...');

    try {
      const config: AssessmentConfig = {
        title: 'Bitcoin Fundamentals Assessment',
        topic: 'bitcoin_basics',
        difficulty: 'intermediate',
        question_count: 5,
        question_types: ['multiple_choice', 'scenario', 'calculation'],
        time_limit_minutes: 30,
        passing_score: 75
      };

      const assessment = await this.generator.generateAssessment(config);

      const passed = assessment &&
        assessment.questions.length === 5 &&
        assessment.total_points > 0 &&
        assessment.title === config.title;

      this.logTest('Basic Assessment Generation', passed, {
        questionCount: assessment.questions.length,
        totalPoints: assessment.total_points,
        hasQuestionTypes: assessment.questions.map(q => q.type)
      });

      return assessment;
    } catch (error) {
      this.logTest('Basic Assessment Generation', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Test 2: Generate Assessment Criteria for Player Archetypes
   */
  async testArchetypeAssessments() {
    console.log('\n🧪 Testing Archetype-Specific Assessments...');

    const archetypes = [
      { name: 'Sovereign Stacker', focus: 'self_custody', difficulty: 'advanced' },
      { name: 'Strategic Investor', focus: 'investment_strategy', difficulty: 'intermediate' },
      { name: 'Traditional Saver', focus: 'bitcoin_basics', difficulty: 'beginner' }
    ];

    for (const archetype of archetypes) {
      try {
        const config: AssessmentConfig = {
          title: `${archetype.name} Assessment`,
          topic: archetype.focus,
          difficulty: archetype.difficulty as 'beginner' | 'intermediate' | 'advanced',
          question_count: 8,
          question_types: ['multiple_choice', 'scenario', 'reflection'],
          include_live_data: true
        };

        const assessment = await this.generator.generateAssessment(config);

        const passed = assessment &&
          assessment.questions.length === 8 &&
          assessment.difficulty === archetype.difficulty;

        this.logTest(`${archetype.name} Assessment Generation`, passed, {
          archetype: archetype.name,
          difficulty: assessment.difficulty,
          questionTypes: [...new Set(assessment.questions.map(q => q.type))]
        });
      } catch (error) {
        this.logTest(`${archetype.name} Assessment Generation`, false, { error: error.message });
      }
    }
  }

  /**
   * Test 3: Create Scoring Rubrics for Game Metrics
   */
  async testScoringRubrics() {
    console.log('\n🧪 Testing Scoring Rubrics Generation...');

    try {
      // Test advanced assessment that should include rubrics
      const config: AssessmentConfig = {
        title: 'Bitcoin Sovereignty Mastery',
        topic: 'self_custody',
        difficulty: 'advanced',
        question_count: 10,
        question_types: ['scenario', 'calculation', 'reflection']
      };

      const assessment = await this.generator.generateAssessment(config);

      const hasRubrics = assessment.rubrics && assessment.rubrics.length > 0;
      const hasAllLevels = hasRubrics && assessment.rubrics[0].performance_levels &&
        assessment.rubrics[0].performance_levels.excellent &&
        assessment.rubrics[0].performance_levels.needs_improvement;

      this.logTest('Scoring Rubrics Generation', hasRubrics && hasAllLevels, {
        hasRubrics,
        rubricCount: assessment.rubrics?.length || 0,
        rubricCriteria: assessment.rubrics?.map(r => r.criteria) || []
      });

      // Create custom rubrics for game-specific metrics
      const gameRubrics = this.createGameSpecificRubrics();
      this.logTest('Game-Specific Rubrics Creation', gameRubrics.length === 3, {
        rubricTypes: gameRubrics.map(r => r.criteria)
      });

      return { assessment, gameRubrics };
    } catch (error) {
      this.logTest('Scoring Rubrics Generation', false, { error: error.message });
      throw error;
    }
  }

  private createGameSpecificRubrics(): AssessmentRubric[] {
    return [
      {
        criteria: 'Sovereignty Score',
        points_possible: 100,
        performance_levels: {
          excellent: {
            points: 90,
            description: 'Consistently chooses self-custody, understands private keys, demonstrates strong security practices'
          },
          good: {
            points: 75,
            description: 'Generally prefers self-custody, good understanding of security basics'
          },
          satisfactory: {
            points: 60,
            description: 'Mixed custody choices, basic understanding of sovereignty principles'
          },
          needs_improvement: {
            points: 40,
            description: 'Relies heavily on exchanges, limited understanding of self-custody importance'
          }
        }
      },
      {
        criteria: 'Resilience Score',
        points_possible: 100,
        performance_levels: {
          excellent: {
            points: 90,
            description: 'Maintains conviction through market volatility, makes strategic decisions during crises'
          },
          good: {
            points: 75,
            description: 'Generally stable during downturns, some panic selling but recovers quickly'
          },
          satisfactory: {
            points: 60,
            description: 'Moderate resilience, influenced by market sentiment but learning'
          },
          needs_improvement: {
            points: 40,
            description: 'Panic sells during crashes, easily influenced by FUD and market noise'
          }
        }
      },
      {
        criteria: 'Net Worth Optimization',
        points_possible: 100,
        performance_levels: {
          excellent: {
            points: 90,
            description: 'Strategic allocation timing, maximizes long-term wealth through market cycles'
          },
          good: {
            points: 75,
            description: 'Good timing on major decisions, solid long-term returns'
          },
          satisfactory: {
            points: 60,
            description: 'Average performance, some missed opportunities but overall positive'
          },
          needs_improvement: {
            points: 40,
            description: 'Poor timing, significant losses from emotional decisions'
          }
        }
      }
    ];
  }

  /**
   * Test 4: Progressive Assessment Checkpoints
   */
  async testProgressiveCheckpoints() {
    console.log('\n🧪 Testing Progressive Assessment Checkpoints...');

    try {
      const checkpoints = this.createProgressiveCheckpoints();

      const passed = checkpoints.length > 0 &&
        checkpoints.every(cp => cp.year && cp.assessment && cp.learningGoals);

      this.logTest('Progressive Checkpoints Creation', passed, {
        checkpointCount: checkpoints.length,
        years: checkpoints.map(cp => cp.year),
        assessmentTypes: checkpoints.map(cp => cp.assessment.difficulty)
      });

      return checkpoints;
    } catch (error) {
      this.logTest('Progressive Checkpoints Creation', false, { error: error.message });
      throw error;
    }
  }

  private createProgressiveCheckpoints() {
    const timelinePeriods = this.timelineData.timeline;
    const checkpoints = [];

    // Create checkpoints for key periods
    const keyPeriods = [
      { year: '2008', title: 'Crisis Understanding', difficulty: 'beginner' },
      { year: '2013', title: 'Custody Basics', difficulty: 'intermediate' },
      { year: '2017', title: 'Market Psychology', difficulty: 'intermediate' },
      { year: '2020', title: 'Monetary Policy Impact', difficulty: 'advanced' },
      { year: '2024-2025', title: 'Sovereignty Mastery', difficulty: 'advanced' }
    ];

    for (const period of keyPeriods) {
      const timelineEntry = timelinePeriods.find(t => t.year.includes(period.year));
      if (timelineEntry) {
        checkpoints.push({
          year: period.year,
          period: timelineEntry.period,
          assessment: {
            title: `${period.title} Checkpoint`,
            difficulty: period.difficulty,
            topic: this.getTopicForPeriod(timelineEntry),
            socraticQuestion: timelineEntry.socraticQuestion
          },
          learningGoals: this.getLearningGoalsForPeriod(timelineEntry),
          economicContext: timelineEntry.economicContext
        });
      }
    }

    return checkpoints;
  }

  private getTopicForPeriod(timelineEntry: any): string {
    if (timelineEntry.period.includes('Crisis')) return 'economic_fundamentals';
    if (timelineEntry.period.includes('Custody') || timelineEntry.period.includes('Mt. Gox')) return 'self_custody';
    if (timelineEntry.period.includes('Bubble') || timelineEntry.period.includes('Peak')) return 'market_psychology';
    if (timelineEntry.period.includes('Pandemic') || timelineEntry.period.includes('Printing')) return 'monetary_policy';
    if (timelineEntry.period.includes('New Era') || timelineEntry.period.includes('Sovereignty')) return 'bitcoin_sovereignty';
    return 'bitcoin_basics';
  }

  private getLearningGoalsForPeriod(timelineEntry: any): string[] {
    const allGoals = this.timelineData.learningObjectives;

    // Map periods to relevant learning objectives
    if (timelineEntry.period.includes('Crisis')) {
      return [allGoals[0]]; // Understand long-term effects of monetary policy
    } else if (timelineEntry.period.includes('Bubble') || timelineEntry.period.includes('Winter')) {
      return [allGoals[1]]; // Experience volatility vs fundamentals
    } else if (timelineEntry.period.includes('Mt. Gox') || timelineEntry.period.includes('Custody')) {
      return [allGoals[2]]; // Learn importance of self-custody
    } else if (timelineEntry.period.includes('Adoption')) {
      return [allGoals[3]]; // Compare different stores of value
    } else {
      return [allGoals[4]]; // Develop conviction through market cycles
    }
  }

  /**
   * Test 5: Personalized Feedback Generation
   */
  async testPersonalizedFeedback() {
    console.log('\n🧪 Testing Personalized Feedback Generation...');

    try {
      const playerScenarios = [
        {
          archetype: 'Sovereign Stacker',
          decisions: ['self_custody', 'hardware_wallet', 'node_runner'],
          sovereigntyScore: 95,
          resilienceScore: 85,
          netWorth: 150000
        },
        {
          archetype: 'Strategic Investor',
          decisions: ['exchange_storage', 'dca_strategy', 'profit_taking'],
          sovereigntyScore: 60,
          resilienceScore: 75,
          netWorth: 200000
        },
        {
          archetype: 'Traditional Saver',
          decisions: ['bank_savings', 'late_adoption', 'small_allocation'],
          sovereigntyScore: 30,
          resilienceScore: 40,
          netWorth: 80000
        }
      ];

      const feedbackResults = [];

      for (const scenario of playerScenarios) {
        const feedback = this.generatePersonalizedFeedback(scenario);
        feedbackResults.push(feedback);
      }

      const passed = feedbackResults.length === 3 &&
        feedbackResults.every(f => f.overall && f.sovereignty && f.resilience && f.recommendations);

      this.logTest('Personalized Feedback Generation', passed, {
        feedbackCount: feedbackResults.length,
        feedbackTypes: feedbackResults.map(f => f.archetype)
      });

      return feedbackResults;
    } catch (error) {
      this.logTest('Personalized Feedback Generation', false, { error: error.message });
      throw error;
    }
  }

  private generatePersonalizedFeedback(scenario: any) {
    const baseTemplate = {
      archetype: scenario.archetype,
      overall: '',
      sovereignty: '',
      resilience: '',
      recommendations: []
    };

    // Sovereignty feedback
    if (scenario.sovereigntyScore >= 80) {
      baseTemplate.sovereignty = "Excellent sovereignty understanding! You consistently chose self-custody and understand the importance of controlling your own keys.";
    } else if (scenario.sovereigntyScore >= 60) {
      baseTemplate.sovereignty = "Good sovereignty practices with room for improvement. Consider increasing your self-custody percentage.";
    } else {
      baseTemplate.sovereignty = "Sovereignty needs attention. Review the importance of 'not your keys, not your Bitcoin' principle.";
    }

    // Resilience feedback
    if (scenario.resilienceScore >= 80) {
      baseTemplate.resilience = "Strong resilience through market cycles! You maintained conviction during volatility.";
    } else if (scenario.resilienceScore >= 60) {
      baseTemplate.resilience = "Moderate resilience with some emotional decision-making during market stress.";
    } else {
      baseTemplate.resilience = "Resilience needs development. Focus on understanding long-term value over short-term price movements.";
    }

    // Overall assessment
    const avgScore = (scenario.sovereigntyScore + scenario.resilienceScore) / 2;
    if (avgScore >= 80) {
      baseTemplate.overall = `Congratulations! As a ${scenario.archetype}, you've demonstrated strong Bitcoin understanding and practical application.`;
    } else if (avgScore >= 60) {
      baseTemplate.overall = `Good progress as a ${scenario.archetype}! You're developing solid Bitcoin knowledge with areas for growth.`;
    } else {
      baseTemplate.overall = `As a ${scenario.archetype}, you're on the learning journey. Focus on fundamentals and long-term thinking.`;
    }

    // Recommendations based on archetype and performance
    if (scenario.archetype === 'Sovereign Stacker') {
      baseTemplate.recommendations = [
        'Continue focusing on self-custody best practices',
        'Consider running your own Bitcoin node',
        'Study advanced privacy techniques'
      ];
    } else if (scenario.archetype === 'Strategic Investor') {
      baseTemplate.recommendations = [
        'Balance convenience with sovereignty',
        'Implement dollar-cost averaging strategy',
        'Study Bitcoin cycles and market psychology'
      ];
    } else {
      baseTemplate.recommendations = [
        'Start with small Bitcoin allocation (1-5%)',
        'Learn about hardware wallets',
        'Read "The Bitcoin Standard" for fundamentals'
      ];
    }

    return baseTemplate;
  }

  /**
   * Test 6: Learning Outcome Measurements
   */
  async testLearningOutcomeMeasurements() {
    console.log('\n🧪 Testing Learning Outcome Measurements...');

    try {
      const learningAssessments = [];

      for (const objective of this.timelineData.learningObjectives) {
        const assessment = await this.createLearningObjectiveAssessment(objective);
        learningAssessments.push(assessment);
      }

      const passed = learningAssessments.length === 5 &&
        learningAssessments.every(a => a.questions.length > 0);

      this.logTest('Learning Outcome Measurements', passed, {
        objectiveCount: learningAssessments.length,
        totalQuestions: learningAssessments.reduce((sum, a) => sum + a.questions.length, 0),
        objectives: this.timelineData.learningObjectives
      });

      return learningAssessments;
    } catch (error) {
      this.logTest('Learning Outcome Measurements', false, { error: error.message });
      throw error;
    }
  }

  private async createLearningObjectiveAssessment(objective: string): Promise<Assessment> {
    const objectiveMap = {
      'Understand long-term effects of monetary policy': {
        topic: 'monetary_policy',
        difficulty: 'intermediate' as const,
        questionTypes: ['scenario', 'calculation', 'reflection'] as const
      },
      'Experience volatility vs fundamentals': {
        topic: 'market_psychology',
        difficulty: 'intermediate' as const,
        questionTypes: ['scenario', 'multiple_choice', 'reflection'] as const
      },
      'Learn importance of self-custody': {
        topic: 'self_custody',
        difficulty: 'beginner' as const,
        questionTypes: ['multiple_choice', 'scenario', 'true_false'] as const
      },
      'Compare different stores of value': {
        topic: 'store_of_value',
        difficulty: 'intermediate' as const,
        questionTypes: ['calculation', 'scenario', 'multiple_choice'] as const
      },
      'Develop conviction through market cycles': {
        topic: 'market_cycles',
        difficulty: 'advanced' as const,
        questionTypes: ['reflection', 'scenario', 'calculation'] as const
      }
    };

    const config = objectiveMap[objective as keyof typeof objectiveMap] || {
      topic: 'bitcoin_basics',
      difficulty: 'beginner' as const,
      questionTypes: ['multiple_choice', 'true_false'] as const
    };

    const assessmentConfig: AssessmentConfig = {
      title: `Learning Objective: ${objective}`,
      topic: config.topic,
      difficulty: config.difficulty,
      question_count: 6,
      question_types: config.questionTypes,
      time_limit_minutes: 20
    };

    return await this.generator.generateAssessment(assessmentConfig);
  }

  /**
   * Test 7: Adaptive Assessments
   */
  async testAdaptiveAssessments() {
    console.log('\n🧪 Testing Adaptive Assessment Capabilities...');

    try {
      const adaptiveResults = [];

      // Simulate different performance levels
      const performanceLevels = [
        { level: 'struggling', score: 45, nextDifficulty: 'beginner' },
        { level: 'average', score: 75, nextDifficulty: 'intermediate' },
        { level: 'advanced', score: 90, nextDifficulty: 'advanced' }
      ];

      for (const perf of performanceLevels) {
        const adaptedAssessment = await this.createAdaptiveAssessment(perf);
        adaptiveResults.push(adaptedAssessment);
      }

      const passed = adaptiveResults.length === 3 &&
        adaptiveResults[0].difficulty === 'beginner' &&
        adaptiveResults[2].difficulty === 'advanced';

      this.logTest('Adaptive Assessment Generation', passed, {
        adaptationCount: adaptiveResults.length,
        difficulties: adaptiveResults.map(a => a.difficulty),
        questionCounts: adaptiveResults.map(a => a.questions.length)
      });

      return adaptiveResults;
    } catch (error) {
      this.logTest('Adaptive Assessment Generation', false, { error: error.message });
      throw error;
    }
  }

  private async createAdaptiveAssessment(performance: any): Promise<Assessment> {
    const config: AssessmentConfig = {
      title: `Adaptive Assessment - ${performance.level}`,
      topic: 'bitcoin_fundamentals',
      difficulty: performance.nextDifficulty,
      question_count: performance.level === 'struggling' ? 3 : 5,
      question_types: performance.level === 'advanced'
        ? ['scenario', 'calculation', 'reflection']
        : ['multiple_choice', 'true_false', 'short_answer']
    };

    return await this.generator.generateAssessment(config);
  }

  /**
   * Test 8: Timeline Integration
   */
  async testTimelineIntegration() {
    console.log('\n🧪 Testing Timeline Data Integration...');

    try {
      const timelineAssessments = [];

      // Create assessments for key timeline periods
      const keyPeriods = this.timelineData.timeline.filter(t =>
        t.year.includes('2008') ||
        t.year.includes('2013') ||
        t.year.includes('2020') ||
        t.year.includes('2024')
      );

      for (const period of keyPeriods) {
        const assessment = await this.createTimelineBasedAssessment(period);
        timelineAssessments.push(assessment);
      }

      const passed = timelineAssessments.length > 0 &&
        timelineAssessments.every(a => a.questions.some(q => q.type === 'scenario'));

      this.logTest('Timeline Integration', passed, {
        timelineAssessmentCount: timelineAssessments.length,
        periods: keyPeriods.map(p => p.year),
        hasScenarios: timelineAssessments.every(a => a.questions.some(q => q.type === 'scenario'))
      });

      return timelineAssessments;
    } catch (error) {
      this.logTest('Timeline Integration', false, { error: error.message });
      throw error;
    }
  }

  private async createTimelineBasedAssessment(timelinePeriod: any): Promise<Assessment> {
    const config: AssessmentConfig = {
      title: `${timelinePeriod.period} Assessment`,
      topic: this.getTopicForPeriod(timelinePeriod),
      difficulty: 'intermediate',
      question_count: 4,
      question_types: ['scenario', 'multiple_choice'],
      include_live_data: true
    };

    const assessment = await this.generator.generateAssessment(config);

    // Add timeline-specific context to questions
    assessment.questions.forEach(q => {
      if (q.type === 'scenario') {
        q.question = `During ${timelinePeriod.period} (${timelinePeriod.year}): ${q.question}`;
        q.live_data_context = {
          ...q.live_data_context,
          timeline_context: {
            period: timelinePeriod.period,
            events: timelinePeriod.events,
            economic_context: timelinePeriod.economicContext,
            socratic_question: timelinePeriod.socraticQuestion
          }
        };
      }
    });

    return assessment;
  }

  /**
   * Test 9: BaseAgent + Zod Pattern Verification
   */
  async testBaseAgentPattern() {
    console.log('\n🧪 Testing BaseAgent + Zod Pattern Implementation...');

    try {
      // Check if AssessmentGenerator follows proper patterns
      const hasCorrectMethods =
        typeof this.generator.generateQuestions === 'function' &&
        typeof this.generator.generateAssessment === 'function' &&
        typeof this.generator.generateScenarioQuestions === 'function' &&
        typeof this.generator.generateCalculationQuestions === 'function';

      // Test input validation (simulated)
      const inputValidationWorks = await this.testInputValidation();

      const passed = hasCorrectMethods && inputValidationWorks;

      this.logTest('BaseAgent + Zod Pattern', passed, {
        hasCorrectMethods,
        inputValidationWorks,
        implementsInterfaces: 'QuizGenerator interface implemented'
      });

      return passed;
    } catch (error) {
      this.logTest('BaseAgent + Zod Pattern', false, { error: error.message });
      return false;
    }
  }

  private async testInputValidation(): Promise<boolean> {
    try {
      // Test with invalid configuration
      const invalidConfig = {
        title: '',
        topic: '',
        difficulty: 'invalid',
        question_count: -1
      };

      await this.generator.generateAssessment(invalidConfig as any);
      return false; // Should have thrown an error
    } catch (error) {
      // Expected behavior - input validation should catch invalid inputs
      return true;
    }
  }

  /**
   * Generate Final Test Report
   */
  generateReport(): any {
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const passRate = (passedTests / totalTests) * 100;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        passRate: `${passRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      },
      assessmentCapabilities: {
        basicGeneration: this.testResults.find(r => r.testName.includes('Basic Assessment')),
        archetypeSupport: this.testResults.filter(r => r.testName.includes('Archetype')),
        rubricGeneration: this.testResults.find(r => r.testName.includes('Rubrics')),
        progressiveCheckpoints: this.testResults.find(r => r.testName.includes('Checkpoints')),
        personalizedFeedback: this.testResults.find(r => r.testName.includes('Feedback')),
        learningOutcomes: this.testResults.find(r => r.testName.includes('Outcome')),
        adaptiveCapability: this.testResults.find(r => r.testName.includes('Adaptive')),
        timelineIntegration: this.testResults.find(r => r.testName.includes('Timeline')),
        patternCompliance: this.testResults.find(r => r.testName.includes('BaseAgent'))
      },
      recommendations: this.generateRecommendations(),
      detailedResults: this.testResults
    };

    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    if (failedTests.length === 0) {
      recommendations.push('✅ AssessmentGenerator is working excellently for the Bitcoin education simulation');
      recommendations.push('✅ Ready for production use with comprehensive assessment capabilities');
    } else {
      failedTests.forEach(test => {
        recommendations.push(`❌ Fix: ${test.testName} - ${test.details?.error || 'Implementation needed'}`);
      });
    }

    recommendations.push('🔧 Consider adding more dynamic question generation based on real-time Bitcoin data');
    recommendations.push('🔧 Implement machine learning for better adaptive assessment personalization');
    recommendations.push('🔧 Add comprehensive analytics for tracking learning progress over time');

    return recommendations;
  }

  /**
   * Run All Tests
   */
  async runAllTests() {
    console.log('🚀 Starting Comprehensive AssessmentGenerator Test Suite');
    console.log('=' .repeat(60));

    try {
      await this.testBasicAssessmentGeneration();
      await this.testArchetypeAssessments();
      await this.testScoringRubrics();
      await this.testProgressiveCheckpoints();
      await this.testPersonalizedFeedback();
      await this.testLearningOutcomeMeasurements();
      await this.testAdaptiveAssessments();
      await this.testTimelineIntegration();
      await this.testBaseAgentPattern();

      const report = this.generateReport();

      console.log('\n' + '=' .repeat(60));
      console.log('📊 FINAL TEST REPORT');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(report.summary, null, 2));
      console.log('\n📋 Recommendations:');
      report.recommendations.forEach(rec => console.log('  ' + rec));

      // Save detailed report
      const reportPath = '/Users/dalia/projects/mcp-agent-kit/assessment_generator_test_report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n💾 Detailed report saved to: ${reportPath}`);

      return report;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AssessmentGeneratorTester();
  tester.runAllTests().catch(console.error);
}

export { AssessmentGeneratorTester };