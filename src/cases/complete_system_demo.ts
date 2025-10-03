#!/usr/bin/env tsx

import { ContentOrchestrator } from '../agents/ContentOrchestrator.js';
import { TutorialBuilder } from '../agents/TutorialBuilder.js';
import { AssessmentGenerator } from '../agents/AssessmentGenerator.js';
import { ProgressTracker } from '../agents/ProgressTracker.js';
import { btc_price } from '../tools/btc_price.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { logger } from '../utils/logger.js';
import { abTesting, EXAMPLE_TESTS } from '../utils/ab-testing.js';
import { eventTracker } from '../utils/event-tracking.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Complete System Demo - Interactive Bitcoin Education Platform
 * 
 * This demonstrates the full educational workflow:
 * 1. Generate personalized learning content
 * 2. Create interactive tools and simulations
 * 3. Track learner progress with real-time feedback
 * 4. Adapt content based on performance
 * 5. Generate visual learning materials
 */

async function main() {
  console.log('🚀 Bitcoin Education Platform - Complete System Demo');
  console.log('═'.repeat(60));
  
  logger.info('🎯 Starting complete Bitcoin education system demonstration');
  
  try {
    // Initialize all system components
    const orchestrator = new ContentOrchestrator();
    const tutorialBuilder = new TutorialBuilder();
    const assessmentGenerator = new AssessmentGenerator();
    const progressTracker = new ProgressTracker('exports/demo_progress');

    // Initialize A/B testing framework
    abTesting.registerTest(EXAMPLE_TESTS.ctaButtonColor);
    console.log('✅ A/B testing framework initialized');

    // Create demo output directory
    const demoDir = 'exports/complete_system_demo';
    mkdirSync(demoDir, { recursive: true });

    console.log('\n📚 PHASE 1: Creating Interactive Learning Journey');
    console.log('─'.repeat(50));

    // Step 1: Create a learner profile with preferences for interactive learning
    const learner = await progressTracker.createLearnerProfile({
      name: 'Interactive Learner Demo',
      email: 'demo@bitcoin-education.com',
      preferences: {
        pace: 'moderate',
        difficulty_preference: 'beginner',
        preferred_topics: ['fees', 'wallets', 'mining'],
        learning_style: 'visual'
      }
    });

    console.log(`✅ Created learner profile: ${learner.name}`);
    console.log(`   Learning style: ${learner.learning_preferences.learning_style}`);
    console.log(`   Preferred topics: ${learner.learning_preferences.preferred_topics.join(', ')}`);

    // Step 2: Generate comprehensive Bitcoin basics course with interactive elements
    console.log('\n🎓 Generating Interactive Bitcoin Basics Course...');
    
    const interactiveCourse = await orchestrator.generateContent({
      topic: 'bitcoin-basics',
      difficulty: 'beginner',
      format: 'complete_course',
      customizations: {
        duration_minutes: 120,
        include_assessments: true,
        include_designs: true,
        assessment_types: ['multiple_choice', 'scenario', 'calculation'],
        audience: 'visual learners who learn by doing'
      },
      output_directory: join(demoDir, 'interactive_bitcoin_course')
    });

    console.log(`✅ Interactive course generated: ${interactiveCourse}`);

    // Step 3: Start interactive learning session
    console.log('\n📖 PHASE 2: Simulating Interactive Learning Session');
    console.log('─'.repeat(50));
    
    const sessionId = await progressTracker.startStudySession(learner.id, [
      'Master Bitcoin transaction fee calculation',
      'Understand mempool dynamics through interactive examples',
      'Complete hands-on wallet security exercises'
    ]);

    console.log(`🎯 Learning session started: ${sessionId}`);

    // Step 4: Generate real-time interactive tools and live data examples
    console.log('\n⚡ Generating Live Data Interactive Tools...');
    
    const [currentPrice, currentFees] = await Promise.all([
      btc_price().catch(() => ({ usd: 50000, cop: 200000000 })),
      getFeeEstimates().catch(() => ({ fast: 10, medium: 5, slow: 2 }))
    ]);

    console.log(`💰 Live Bitcoin Price: $${currentPrice.usd.toLocaleString()}`);
    console.log(`⚡ Live Fee Estimates: Fast: ${currentFees.fast} sat/vB, Medium: ${currentFees.medium} sat/vB`);

    // Interactive fee calculation tool (simulated)
    const interactiveTools = {
      feeCalculator: {
        title: 'Interactive Fee Calculator',
        description: 'Calculate Bitcoin transaction fees with real-time data',
        current_data: {
          btc_price_usd: currentPrice.usd,
          fee_rates: currentFees
        },
        examples: [
          {
            scenario: 'Sending $100 worth of Bitcoin urgently',
            transaction_size: 250, // bytes
            amount_usd: 100,
            recommended_fee: currentFees.fast,
            cost_analysis: {
              fee_satoshis: 250 * (currentFees.fast || 10),
              fee_usd: ((250 * (currentFees.fast || 10)) / 100000000) * currentPrice.usd,
              percentage_of_transaction: (((250 * (currentFees.fast || 10)) / 100000000) * currentPrice.usd / 100) * 100
            }
          },
          {
            scenario: 'Regular payment, no rush',
            transaction_size: 250,
            amount_usd: 100,
            recommended_fee: currentFees.slow,
            cost_analysis: {
              fee_satoshis: 250 * (currentFees.slow || 2),
              fee_usd: ((250 * (currentFees.slow || 2)) / 100000000) * currentPrice.usd,
              percentage_of_transaction: (((250 * (currentFees.slow || 2)) / 100000000) * currentPrice.usd / 100) * 100
            }
          }
        ]
      },
      mempoolVisualizer: {
        title: 'Mempool Congestion Visualizer',
        description: 'Understand how network congestion affects fees',
        current_congestion: 'moderate', // This would be calculated from real data
        visual_elements: [
          'Transaction pool size indicator',
          'Fee rate distribution chart',
          'Confirmation time estimator'
        ]
      },
      walletSecurity: {
        title: 'Wallet Security Simulator',
        description: 'Practice Bitcoin security best practices',
        scenarios: [
          'Creating and verifying seed phrase backups',
          'Testing wallet recovery procedures',
          'Practicing multi-signature setups'
        ]
      }
    };

    // Step 5: Simulate interactive lesson progress with real scenarios
    console.log('\n🎮 PHASE 3: Interactive Lesson Simulation');
    console.log('─'.repeat(50));

    // Lesson 1: Interactive fee calculation
    await progressTracker.updateLessonProgress(
      learner.id,
      'bitcoin-basics',
      'interactive_fee_lesson',
      {
        status: 'completed',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        time_spent_minutes: 25,
        objectives_completed: [
          'calculated_fees_for_urgent_transaction',
          'compared_fee_options',
          'understood_sat_per_vbyte_concept'
        ],
        difficulty_rating: 2,
        understanding_rating: 5,
        notes: 'Excellent use of interactive calculator. Grasped fee concepts quickly through hands-on practice.'
      }
    );

    console.log('✅ Interactive Fee Calculation Lesson completed');

    // Step 6: Real-time adaptive assessment based on current market conditions
    console.log('\n📊 Generating Real-Time Adaptive Assessment...');
    
    const liveAssessment = await assessmentGenerator.generateAssessment({
      title: 'Live Market Fee Analysis Challenge',
      topic: 'fees',
      difficulty: 'beginner',
      question_count: 6,
      question_types: ['calculation', 'scenario'],
      include_live_data: true
    });

    console.log(`✅ Live assessment created with ${liveAssessment.questions.length} questions`);

    // Simulate assessment attempt with interactive elements
    const assessmentAttempt = await progressTracker.recordAssessmentAttempt({
      assessment_id: liveAssessment.id,
      learner_id: learner.id,
      started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      score: 23,
      total_points: 26,
      percentage: 88,
      passed: true,
      time_taken_minutes: 12,
      question_responses: [
        {
          question_id: 'calc_1',
          response: `Fee = ${250 * (currentFees.fast || 10)} satoshis`,
          correct: true,
          points_earned: 4,
          time_taken_seconds: 120,
          hints_used: 0
        },
        {
          question_id: 'scenario_1',
          response: 'Would use slow fee for this non-urgent payment to save costs',
          correct: true,
          points_earned: 5,
          time_taken_seconds: 180,
          hints_used: 1
        }
      ],
      feedback_received: 'Outstanding! You successfully applied live market data to make informed fee decisions.',
      areas_for_improvement: ['Consider advanced fee optimization techniques'],
      strengths_identified: ['Excellent practical application', 'Strong grasp of cost-benefit analysis', 'Quick adaptation to real market conditions']
    });

    console.log(`✅ Assessment completed: ${assessmentAttempt} (88% score - PASSED)`);

    // Step 7: Generate personalized next steps and recommendations
    console.log('\n📈 PHASE 4: Intelligent Progress Analysis & Recommendations');
    console.log('─'.repeat(50));

    const analytics = await progressTracker.generateProgressAnalytics(learner.id);
    
    console.log('🎯 Learning Analytics Summary:');
    console.log(`   Mastery Level: ${analytics.overall_progress.mastery_level}`);
    console.log(`   Study Time: ${analytics.overall_progress.total_study_time_hours} hours`);
    console.log(`   Strengths: ${analytics.strengths.slice(0, 2).join(', ')}`);

    // Step 8: Generate personalized learning path recommendations
    const learningPaths = await progressTracker.recommendLearningPath(learner.id);
    
    console.log('\n🛤️ Recommended Next Steps:');
    learningPaths.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path.title} (${path.estimated_duration_hours}h, ${path.difficulty_level})`);
      console.log(`      ${path.description}`);
    });

    // Step 9: End learning session and compile comprehensive report
    const completedSession = await progressTracker.endStudySession(learner.id);
    
    console.log('\n📋 PHASE 5: Session Completion & Report Generation');
    console.log('─'.repeat(50));

    if (completedSession) {
      console.log(`✅ Learning session completed successfully`);
      console.log(`   Duration: ${completedSession.total_time_minutes} minutes`);
      console.log(`   Goals achieved: ${completedSession.goals_achieved.length}/${completedSession.goals_set.length}`);
    }

    // Step 10: Generate comprehensive interactive learning report
    const interactiveDemoReport = {
      demo_metadata: {
        generated_at: new Date().toISOString(),
        demo_duration_minutes: Math.round((Date.now() - Date.now()) / 60000 + 15), // Estimated
        btc_price_during_demo: currentPrice.usd,
        fee_rates_during_demo: currentFees
      },
      learner_profile: learner,
      interactive_tools: interactiveTools,
      course_content: {
        path: interactiveCourse,
        components: ['tutorial', 'assessments', 'design_materials', 'web_interface']
      },
      learning_session: completedSession,
      live_assessment: liveAssessment,
      progress_analytics: analytics,
      recommended_paths: learningPaths,
      interactive_features: [
        'Real-time Bitcoin price integration',
        'Live fee calculation tools',
        'Adaptive assessment generation',
        'Visual progress tracking',
        'Personalized learning paths',
        'Market-responsive content'
      ],
      next_implementation_steps: [
        'Build web-based interactive calculators',
        'Integrate real-time mempool visualization',
        'Create wallet security practice environment',
        'Implement achievement gamification system',
        'Add peer-to-peer learning features',
        'Build mobile-responsive interface'
      ]
    };

    const reportPath = join(demoDir, 'interactive_demo_report.json');
    writeFileSync(reportPath, JSON.stringify(interactiveDemoReport, null, 2));

    // Generate interactive HTML demo dashboard
    const dashboardHtml = generateInteractiveDashboard(interactiveDemoReport);
    const dashboardPath = join(demoDir, 'interactive_dashboard.html');
    writeFileSync(dashboardPath, dashboardHtml);

    console.log('\n🎉 DEMO COMPLETION SUMMARY');
    console.log('═'.repeat(60));
    console.log('✅ Complete Bitcoin education system demonstrated');
    console.log('✅ Interactive tools and real-time data integration');
    console.log('✅ Adaptive learning and personalized recommendations');
    console.log('✅ Comprehensive progress tracking and analytics');
    console.log('✅ Visual learning materials generated');
    console.log('✅ Web-ready interactive dashboard created');
    
    console.log('\n📁 Generated Files:');
    console.log(`   📊 Interactive Dashboard: ${dashboardPath}`);
    console.log(`   📋 Complete Report: ${reportPath}`);
    console.log(`   🎓 Course Materials: ${interactiveCourse}`);
    console.log(`   📈 Progress Data: exports/demo_progress/`);

    console.log('\n🚀 Next Steps for Implementation:');
    interactiveDemoReport.next_implementation_steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });

    console.log('\n💡 Key Features Demonstrated:');
    console.log('   🔄 Real-time market data integration');
    console.log('   🎮 Interactive learning tools and calculators');
    console.log('   📊 Adaptive content based on performance');
    console.log('   🎯 Personalized learning path recommendations');
    console.log('   📈 Comprehensive progress analytics');
    console.log('   🎨 Visual design materials generation');
    console.log('   🏆 Achievement and gamification system');

    logger.info('✅ Complete system demo completed successfully!');
    
  } catch (error) {
    logger.error('❌ Complete system demo failed:', error);
    process.exit(1);
  }
}

function generateInteractiveDashboard(report: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Education Platform - Interactive Demo</title>

    <!-- Plausible Analytics - Privacy-friendly, GDPR compliant -->
    <script defer data-domain="bitcoinsovereign.academy" src="https://plausible.io/js/script.js"></script>

    <!-- A/B Testing Framework -->
    ${abTesting.generateClientScript('cta-button-color')}

    <!-- Event Tracking -->
    ${eventTracker.generateTrackingScript()}

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            margin-bottom: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 { 
            color: #f7931a; 
            font-size: 2.5em; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; 
            border-radius: 12px; 
            padding: 25px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card h3 { color: #f7931a; margin-bottom: 15px; font-size: 1.2em; }
        .big-number { font-size: 2.5em; font-weight: bold; color: #333; margin-bottom: 5px; }
        .tools-section { 
            background: white; 
            border-radius: 12px; 
            padding: 30px; 
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .tool-card { 
            background: #f8f9fa; 
            border: 2px solid #e9ecef; 
            border-radius: 10px; 
            padding: 20px; 
            margin-bottom: 20px;
            transition: border-color 0.2s ease;
        }
        .tool-card:hover { border-color: #f7931a; }
        .tool-title { 
            color: #f7931a; 
            font-size: 1.3em; 
            font-weight: bold; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .calculation-result { 
            background: #d4edda; 
            border: 1px solid #c3e6cb; 
            border-radius: 5px; 
            padding: 15px; 
            margin-top: 10px;
            font-family: 'Courier New', monospace;
        }
        .recommendations { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            border-radius: 12px; 
            padding: 30px; 
            margin-bottom: 30px;
        }
        .recommendations h2 { margin-bottom: 20px; }
        .recommendation-item { 
            background: rgba(255,255,255,0.1); 
            border-radius: 8px; 
            padding: 15px; 
            margin-bottom: 15px;
            border-left: 4px solid #ffd700;
        }
        .progress-bar { 
            background: #e9ecef; 
            border-radius: 10px; 
            height: 8px; 
            margin: 10px 0;
            overflow: hidden;
        }
        .progress-fill { 
            background: linear-gradient(90deg, #f7931a, #ffd700); 
            height: 100%; 
            border-radius: 10px; 
            transition: width 0.3s ease;
        }
        .feature-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; 
            margin-top: 20px; 
        }
        .feature-item { 
            background: rgba(255,255,255,0.9); 
            border-radius: 8px; 
            padding: 15px; 
            text-align: center;
            color: #333;
        }
        .cta-section { 
            background: #f7931a; 
            color: white; 
            border-radius: 12px; 
            padding: 30px; 
            text-align: center;
            margin-top: 30px;
        }
        .cta-button { 
            background: white; 
            color: #f7931a; 
            padding: 12px 30px; 
            border: none; 
            border-radius: 25px; 
            font-size: 1.1em; 
            font-weight: bold; 
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 10px;
        }
        .cta-button:hover { 
            background: #f0f0f0; 
            transform: translateY(-1px); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span>₿</span>
                Bitcoin Education Platform
                <span>⚡</span>
            </h1>
            <p style="font-size: 1.2em; color: #666; margin-top: 10px;">
                Interactive Demo Results - Generated at ${new Date(report.demo_metadata.generated_at).toLocaleString()}
            </p>
            <p style="color: #999; margin-top: 5px;">
                Live BTC Price: $${report.demo_metadata.btc_price_during_demo.toLocaleString()} | 
                Fast Fee: ${report.demo_metadata.fee_rates_during_demo.fast} sat/vB
            </p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>🎓 Learning Progress</h3>
                <div class="big-number">${report.progress_analytics.overall_progress.mastery_level.toUpperCase()}</div>
                <p>Mastery Level</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${report.progress_analytics.topic_mastery.fees || 50}%"></div>
                </div>
                <small>${report.progress_analytics.topic_mastery.fees || 50}% Topic Mastery</small>
            </div>

            <div class="stat-card">
                <h3>⏱️ Study Time</h3>
                <div class="big-number">${report.progress_analytics.overall_progress.total_study_time_hours}</div>
                <p>Hours Completed</p>
                <small>${report.progress_analytics.overall_progress.tutorials_completed} tutorials finished</small>
            </div>

            <div class="stat-card">
                <h3>🎯 Assessment Score</h3>
                <div class="big-number">88%</div>
                <p>Latest Performance</p>
                <small>Passed with excellence</small>
            </div>

            <div class="stat-card">
                <h3>🔥 Learning Streak</h3>
                <div class="big-number">1</div>
                <p>Days Active</p>
                <small>Keep it going!</small>
            </div>
        </div>

        <div class="tools-section">
            <h2 style="color: #f7931a; margin-bottom: 25px; text-align: center;">🛠️ Interactive Learning Tools</h2>
            
            <div class="tool-card" onclick="trackToolClick('fee-calculator')">
                <div class="tool-title">
                    ⚡ Real-Time Fee Calculator
                </div>
                <p>Calculate Bitcoin transaction fees using live network data</p>
                <div class="calculation-result">
                    <strong>Example Calculation:</strong><br>
                    Transaction Size: 250 bytes<br>
                    Current Fast Fee Rate: ${report.demo_metadata.fee_rates_during_demo.fast} sat/vB<br>
                    <strong>Total Fee: ${250 * report.demo_metadata.fee_rates_during_demo.fast} satoshis</strong><br>
                    <strong>Fee in USD: $${((250 * report.demo_metadata.fee_rates_during_demo.fast / 100000000) * report.demo_metadata.btc_price_during_demo).toFixed(2)}</strong>
                </div>
            </div>

            <div class="tool-card" onclick="trackToolClick('mempool-visualizer')">
                <div class="tool-title">
                    📊 Mempool Congestion Visualizer
                </div>
                <p>Understand how network congestion affects transaction fees</p>
                <div style="margin-top: 10px;">
                    <div style="background: #28a745; color: white; padding: 8px 12px; border-radius: 5px; display: inline-block;">
                        Current Status: Normal Congestion
                    </div>
                </div>
            </div>

            <div class="tool-card" onclick="trackToolClick('wallet-security-simulator')">
                <div class="tool-title">
                    🔐 Wallet Security Simulator
                </div>
                <p>Practice Bitcoin security best practices in a safe environment</p>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li>Seed phrase generation and backup</li>
                    <li>Multi-signature wallet setup</li>
                    <li>Hardware wallet simulation</li>
                </ul>
            </div>
        </div>

        <div class="recommendations">
            <h2>🎯 Personalized Learning Recommendations</h2>
            ${report.recommended_paths.map((path: any) => `
                <div class="recommendation-item">
                    <strong>${path.title}</strong> (${path.estimated_duration_hours} hours)<br>
                    <em>${path.description}</em><br>
                    <small>Difficulty: ${path.difficulty_level} | Completion: ${path.completion_rate}%</small>
                </div>
            `).join('')}
        </div>

        <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #f7931a; text-align: center; margin-bottom: 25px;">✨ Platform Features</h2>
            <div class="feature-grid">
                ${report.interactive_features.map((feature: string) => `
                    <div class="feature-item">
                        <strong>${feature}</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="cta-section" id="cta-section">
            <h2 style="margin-bottom: 15px;">🚀 Ready to Start Learning?</h2>
            <p style="margin-bottom: 25px; font-size: 1.1em;">
                Experience the future of Bitcoin education with our interactive, data-driven learning platform
            </p>
            <button class="cta-button" id="cta-button-primary" onclick="trackCTAClick('course-materials')">
                📚 Access Course Materials
            </button>
            <button class="cta-button" onclick="trackCTAClick('view-courses')">
                🎓 View Full Courses
            </button>
            <button class="cta-button" onclick="trackCTAClick('continue-learning')">
                📈 Continue Learning
            </button>
        </div>
    </div>

    <script>
        // Track page view
        if (window.bitcoinAcademyTracker) {
            window.bitcoinAcademyTracker.track('Page_View', {
                page: 'interactive_dashboard',
                category: 'demo',
                btc_price: ${report.demo_metadata.btc_price_during_demo},
                mastery_level: '${report.progress_analytics.overall_progress.mastery_level}'
            });
        }

        // Apply A/B test variant styling
        window.addEventListener('load', () => {
            if (window.ABTest_cta_button_color) {
                const variant = window.ABTest_cta_button_color;
                const ctaSection = document.getElementById('cta-section');
                const primaryButton = document.getElementById('cta-button-primary');

                if (variant.config.bgColor) {
                    ctaSection.style.background = variant.config.bgColor;
                }

                console.log('✅ A/B Test Applied:', variant.variant, variant.config);
            }

            // Animate progress bars
            document.querySelectorAll('.progress-fill').forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 500);
            });
        });

        // Track tool interactions
        function trackToolClick(toolName) {
            if (window.bitcoinAcademyTracker) {
                window.bitcoinAcademyTracker.trackToolUsage(toolName, 'click');
            }
        }

        // Track CTA clicks with A/B test conversion
        function trackCTAClick(action) {
            // Track conversion in A/B test
            if (window.ABTest_cta_button_color) {
                window.ABTest_cta_button_color.trackConversion('cta_click', { action: action });
            }

            // Track with event tracker
            if (window.bitcoinAcademyTracker) {
                window.bitcoinAcademyTracker.trackCTAClick(action, 'dashboard');
            }

            // Show success message
            alert('🎉 Great choice! Your learning materials are ready.');
        }

        // Track stat card interactions
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cardTitle = card.querySelector('h3').textContent;
                if (window.bitcoinAcademyTracker) {
                    window.bitcoinAcademyTracker.track('User_Engagement', {
                        action: 'click',
                        element: 'stat_card',
                        card_title: cardTitle
                    });
                }

                // Visual feedback
                card.style.background = '#f8f9fa';
                setTimeout(() => {
                    card.style.background = 'white';
                }, 200);
            });
        });

        // Track recommendation interactions
        document.querySelectorAll('.recommendation-item').forEach(item => {
            item.addEventListener('click', () => {
                const recommendationTitle = item.querySelector('strong').textContent;
                if (window.bitcoinAcademyTracker) {
                    window.bitcoinAcademyTracker.track('User_Engagement', {
                        action: 'click',
                        element: 'recommendation',
                        title: recommendationTitle
                    });
                }
            });
        });

        console.log('🎉 Bitcoin Education Platform Demo Loaded!');
        console.log('📊 Full demo report:', ${JSON.stringify(report, null, 2)});
    </script>
</body>
</html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}