#!/usr/bin/env tsx
// src/demos/content-philosophy-demo.ts

import { logger } from '../utils/logger.js';
import { ContentImprovementEngine } from '../agents/ContentImprovementEngine.js';
import { CanvaDesignData } from '../agents/CanvaDesignAnalyzer.js';
import { NotionPage } from '../agents/NotionContentAnalyzer.js';
import { GPTConfiguration } from '../agents/GPTInstructionsAnalyzer.js';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('🧠 Content Philosophy Learning & Improvement Demo');
  console.log('═'.repeat(60));
  
  try {
    const engine = new ContentImprovementEngine();
    
    // Demo 1: Add sample content from different platforms
    console.log('\n📚 Step 1: Adding sample content from different platforms');
    
    // Sample Canva design
    const sampleCanvaDesign: CanvaDesignData = {
      id: 'design_bitcoin_basics',
      title: 'Bitcoin Fundamentals - Visual Guide',
      design_elements: [
        {
          id: 'title',
          type: 'text',
          content: 'What is Bitcoin? A Complete Guide',
          style: { font: 'Arial', size: 24, color: '#2196F3' },
          educational_purpose: 'title'
        },
        {
          id: 'intro_text',
          type: 'text',
          content: 'Bitcoin is a decentralized digital currency that operates without a central authority. It uses blockchain technology to maintain a secure and transparent ledger.',
          style: { font: 'Arial', size: 14, color: '#333333' },
          educational_purpose: 'content'
        },
        {
          id: 'question1',
          type: 'text',
          content: 'What do you think makes Bitcoin different from traditional money?',
          style: { font: 'Arial', size: 16, color: '#4CAF50' },
          educational_purpose: 'question'
        }
      ],
      template_type: 'educational_slide',
      dimensions: { width: 1920, height: 1080 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await engine.addContentSource({
      platform: 'canva',
      id: 'design_bitcoin_basics',
      title: 'Bitcoin Fundamentals - Visual Guide',
      content: sampleCanvaDesign
    });

    // Sample Notion page
    const sampleNotionPage: NotionPage = {
      id: 'page_bitcoin_lesson',
      title: 'Understanding Bitcoin: Step by Step',
      blocks: [
        {
          id: 'intro_heading',
          type: 'heading_1',
          content: {
            rich_text: [{ type: 'text', text: { content: '🎯 Welcome to Bitcoin Learning' } }]
          },
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        },
        {
          id: 'objectives',
          type: 'callout',
          content: {
            rich_text: [{ type: 'text', text: { content: 'By the end of this lesson, you will understand what Bitcoin is, how it works, and why it matters.' } }],
            icon: { emoji: '💡' }
          },
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        },
        {
          id: 'question_toggle',
          type: 'toggle',
          content: {
            rich_text: [{ type: 'text', text: { content: '🤔 Think About This: What problems might Bitcoin solve?' } }]
          },
          children: [
            {
              id: 'answer_hint',
              type: 'paragraph',
              content: {
                rich_text: [{ type: 'text', text: { content: 'Consider issues with traditional banking like fees, delays, and accessibility...' } }]
              },
              created_time: new Date().toISOString(),
              last_edited_time: new Date().toISOString()
            }
          ],
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        }
      ],
      properties: {},
      parent: { type: 'workspace' },
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString()
    };
    
    await engine.addContentSource({
      platform: 'notion',
      id: 'page_bitcoin_lesson',
      title: 'Understanding Bitcoin: Step by Step',
      content: sampleNotionPage
    });

    // Sample Custom GPT configuration
    const sampleGPTConfig: GPTConfiguration = {
      id: 'gpt_bitcoin_tutor',
      name: 'Bitcoin Learning Companion',
      description: 'A Socratic tutor for Bitcoin education',
      instructions: `You are a Bitcoin education tutor. Help users learn about Bitcoin and cryptocurrency through discovery-based learning. 

Always start simple and build complexity gradually. Use questions to guide users to insights rather than giving direct answers. 

When explaining concepts, use real-world analogies and examples. Avoid jargon unless necessary, and always explain technical terms simply.

Ask questions like "What do you think would happen if...?" and "How might this relate to...?" to encourage critical thinking.`,
      conversation_starters: [
        'What do you already know about Bitcoin?',
        'What questions about cryptocurrency have you always wondered about?',
        'How do you think digital money could work without banks?'
      ],
      capabilities: {
        web_browsing: false,
        dalle_image_generation: false,
        code_interpreter: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await engine.addContentSource({
      platform: 'custom_gpt',
      id: 'gpt_bitcoin_tutor',
      title: 'Bitcoin Learning Companion',
      content: sampleGPTConfig
    });

    console.log('✅ Added sample content from Canva, Notion, and Custom GPT');

    // Demo 2: Perform comprehensive analysis
    console.log('\n🔍 Step 2: Analyzing all content to learn educational philosophy');
    const analysisResults = await engine.performFullAnalysis();
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`   • Analyzed ${analysisResults.individual_analyses.length} content sources`);
    console.log(`   • Philosophy consistency score: ${analysisResults.cross_platform_insights.philosophy_consistency.score}/100`);
    console.log(`   • Generated ${analysisResults.improvement_plans.length} improvement plans`);

    // Demo 3: Show learned philosophy
    console.log('\n🧭 Step 3: Educational Philosophy Learned');
    const philosophyInsights = engine.getPhilosophyInsights();
    
    if (philosophyInsights.current_philosophy) {
      const phil = philosophyInsights.current_philosophy;
      console.log(`\n   📋 Core Principles:`);
      phil.core_principles.forEach(principle => {
        console.log(`      • ${principle}`);
      });
      
      console.log(`\n   🎯 Teaching Style:`);
      console.log(`      • Socratic Questioning: ${phil.teaching_style.socratic_questioning ? '✅' : '❌'}`);
      console.log(`      • Simplification Approach: ${phil.teaching_style.simplification_approach}`);
      console.log(`      • Building Methodology: ${phil.teaching_style.building_methodology}`);
      
      if (phil.teaching_style.gamification_elements.length > 0) {
        console.log(`      • Gamification Elements: ${phil.teaching_style.gamification_elements.join(', ')}`);
      }
    }

    // Demo 4: Show improvement suggestions
    console.log('\n⚡ Step 4: Top Improvement Opportunities');
    const topPlans = analysisResults.improvement_plans.slice(0, 3);
    
    topPlans.forEach((plan, index) => {
      console.log(`\n   ${index + 1}. ${plan.content_id} (${plan.platform})`);
      console.log(`      Current Scores:`);
      console.log(`        Educational Effectiveness: ${plan.current_scores.educational_effectiveness}/100`);
      console.log(`        Philosophy Alignment: ${plan.current_scores.philosophy_alignment}/100`);
      console.log(`        Engagement: ${plan.current_scores.engagement}/100`);
      
      const topActions = plan.improvement_actions
        .filter(a => a.priority === 'critical' || a.priority === 'high')
        .slice(0, 2);
      
      if (topActions.length > 0) {
        console.log(`      Top Actions:`);
        topActions.forEach(action => {
          console.log(`        • [${action.priority.toUpperCase()}] ${action.description}`);
          console.log(`          Timeline: ${action.timeline}`);
        });
      }
    });

    // Demo 5: Cross-platform insights
    console.log('\n🔄 Step 5: Cross-Platform Insights');
    const insights = analysisResults.cross_platform_insights;
    
    console.log(`\n   🎯 Philosophy Consistency:`);
    console.log(`      Score: ${insights.philosophy_consistency.score}/100`);
    if (insights.philosophy_consistency.strongest_alignment) {
      console.log(`      Strongest: ${insights.philosophy_consistency.strongest_alignment}`);
    }
    if (insights.philosophy_consistency.weakest_alignment) {
      console.log(`      Needs Work: ${insights.philosophy_consistency.weakest_alignment}`);
    }

    console.log(`\n   📈 Quality by Platform:`);
    Object.entries(insights.content_quality_trends.by_platform).forEach(([platform, score]) => {
      console.log(`      ${platform}: ${score}/100`);
    });

    if (insights.best_practices_identified.length > 0) {
      console.log(`\n   🌟 Best Practices Identified:`);
      insights.best_practices_identified.slice(0, 3).forEach(practice => {
        console.log(`      • ${practice.practice} (from ${practice.source_platform})`);
        console.log(`        → Can apply to: ${practice.applicability.join(', ')}`);
      });
    }

    if (insights.cross_pollination_opportunities.length > 0) {
      console.log(`\n   🔄 Cross-Pollination Opportunities:`);
      insights.cross_pollination_opportunities.slice(0, 3).forEach(opp => {
        console.log(`      • ${opp.from_platform} → ${opp.to_platform}: ${opp.description}`);
        console.log(`        Impact Potential: ${opp.potential_impact}/100`);
      });
    }

    // Demo 6: Generate personalized recommendations
    console.log('\n👤 Step 6: Personalized Learning Recommendations');
    const personalizedRecs = await engine.generatePersonalizedRecommendations({
      preferred_complexity: 'adaptive',
      interaction_style: 'guided',
      content_format_preferences: ['interactive', 'visual', 'socratic']
    });

    console.log(`\n   🎯 Learning Path Optimization:`);
    console.log(`      Suggested Sequence: ${personalizedRecs.learning_path_optimization.suggested_sequence.join(' → ')}`);
    
    if (personalizedRecs.learning_path_optimization.prerequisite_gaps.length > 0) {
      console.log(`      Missing Prerequisites:`);
      personalizedRecs.learning_path_optimization.prerequisite_gaps.forEach(gap => {
        console.log(`        • ${gap}`);
      });
    }

    if (personalizedRecs.content_recommendations.length > 0) {
      console.log(`\n   💡 Content Recommendations:`);
      personalizedRecs.content_recommendations.slice(0, 3).forEach(rec => {
        console.log(`      • ${rec.content_id} (${rec.platform}): ${rec.recommendation_type}`);
        console.log(`        Rationale: ${rec.rationale}`);
      });
    }

    // Demo 7: Export comprehensive report
    console.log('\n📄 Step 7: Exporting Comprehensive Report');
    const comprehensiveReport = await engine.exportComprehensiveReport();
    
    // Create output directory
    mkdirSync('exports/content-analysis', { recursive: true });
    
    // Save detailed report
    const reportPath = 'exports/content-analysis/comprehensive-analysis-report.json';
    writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));
    
    // Create summary report
    const summaryReport = {
      generated_at: comprehensiveReport.generated_at,
      summary: {
        total_content_analyzed: comprehensiveReport.content_summary.total_sources,
        platforms_covered: Object.keys(comprehensiveReport.content_summary.by_platform),
        philosophy_strength: comprehensiveReport.philosophy_state ? 'Well-developed' : 'In development',
        top_improvement_opportunities: comprehensiveReport.action_priorities.slice(0, 5).map(action => ({
          action: action.action,
          impact: action.expected_impact,
          effort: action.estimated_effort
        }))
      },
      key_insights: {
        philosophy_consistency: comprehensiveReport.cross_platform_insights.philosophy_consistency.score,
        best_performing_platform: Object.entries(comprehensiveReport.cross_platform_insights.content_quality_trends.by_platform)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
        immediate_actions_needed: comprehensiveReport.action_priorities.filter(a => a.priority === 'critical').length,
        learning_path_gaps: comprehensiveReport.personalized_recommendations.learning_path_optimization.prerequisite_gaps.length
      },
      next_steps: [
        'Review and implement critical priority actions',
        'Apply cross-platform best practices',
        'Enhance content with low philosophy alignment scores',
        'Regular re-analysis to track improvement progress'
      ]
    };
    
    const summaryPath = 'exports/content-analysis/analysis-summary.json';
    writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    
    // Create actionable markdown report
    const markdownReport = `# Content Philosophy Analysis Report

*Generated: ${new Date().toLocaleString()}*

## 🎯 Executive Summary

- **Total Content Analyzed**: ${comprehensiveReport.content_summary.total_sources} pieces across ${Object.keys(comprehensiveReport.content_summary.by_platform).length} platforms
- **Philosophy Consistency**: ${comprehensiveReport.cross_platform_insights.philosophy_consistency.score}/100
- **Critical Actions Needed**: ${comprehensiveReport.action_priorities.filter(a => a.priority === 'critical').length}

## 📊 Platform Performance

${Object.entries(comprehensiveReport.cross_platform_insights.content_quality_trends.by_platform)
  .map(([platform, score]) => `- **${platform}**: ${score}/100`)
  .join('\n')}

## ⚡ Top 5 Improvement Actions

${comprehensiveReport.action_priorities.slice(0, 5).map((action, i) => 
  `${i+1}. **[${action.priority.toUpperCase()}]** ${action.action}\n   - Expected Impact: ${action.expected_impact}/100\n   - Estimated Effort: ${action.estimated_effort}`
).join('\n\n')}

## 🎓 Educational Philosophy State

${comprehensiveReport.philosophy_state ? `
### Core Principles
${comprehensiveReport.philosophy_state.core_principles.map(p => `- ${p}`).join('\n')}

### Teaching Style
- **Socratic Questioning**: ${comprehensiveReport.philosophy_state.teaching_style.socratic_questioning ? '✅ Active' : '❌ Needs Development'}
- **Simplification Approach**: ${comprehensiveReport.philosophy_state.teaching_style.simplification_approach}
- **Building Methodology**: ${comprehensiveReport.philosophy_state.teaching_style.building_methodology}
` : 'Philosophy is still being learned from your content...'}

## 🌟 Best Practices Identified

${comprehensiveReport.cross_platform_insights.best_practices_identified.slice(0, 5).map(practice => 
  `- **${practice.practice}** (from ${practice.source_platform})\n  - Apply to: ${practice.applicability.join(', ')}\n  - How: ${practice.implementation_guide}`
).join('\n\n')}

## 🔄 Cross-Platform Opportunities

${comprehensiveReport.cross_platform_insights.cross_pollination_opportunities.slice(0, 3).map(opp =>
  `- **${opp.from_platform} → ${opp.to_platform}**: ${opp.description} (Impact: ${opp.potential_impact}/100)`
).join('\n')}

## 🎯 Next Steps

1. **Immediate (This Week)**
   - Address critical priority improvements
   - Implement quick wins from best practices

2. **Short Term (This Month)**
   - Apply cross-platform learnings
   - Enhance content with low philosophy alignment

3. **Long Term (Ongoing)**
   - Regular content analysis cycles
   - Continuous philosophy refinement
   - Performance tracking and optimization

---

*This report was generated automatically by your Content Philosophy Learning System. Regular analysis helps maintain consistency and continuous improvement across all your educational content.*
`;

    const markdownPath = 'exports/content-analysis/actionable-report.md';
    writeFileSync(markdownPath, markdownReport);

    console.log('\n✅ Generated comprehensive reports:');
    console.log(`   📊 Detailed Analysis: ${reportPath}`);
    console.log(`   📋 Executive Summary: ${summaryPath}`);
    console.log(`   📄 Actionable Guide: ${markdownPath}`);

    // Demo 8: Show what's next
    console.log('\n🚀 Step 8: What\'s Next?');
    console.log('\n   Your Content Philosophy Learning System is now active! Here\'s what it can do:');
    console.log('\n   🔄 **Continuous Learning**: Add more content and it will keep learning your style');
    console.log('   📈 **Quality Improvement**: Get specific, actionable suggestions for each piece');
    console.log('   🎯 **Philosophy Consistency**: Maintain your educational approach across all platforms');
    console.log('   💡 **Cross-Pollination**: Apply successful techniques from one platform to others');
    console.log('   👤 **Personalization**: Adapt content recommendations to learning preferences');
    
    console.log('\n   📋 **Immediate Next Steps**:');
    const criticalActions = comprehensiveReport.action_priorities.filter(a => a.priority === 'critical');
    if (criticalActions.length > 0) {
      console.log('   🔴 **Critical Actions Needed**:');
      criticalActions.slice(0, 3).forEach((action, i) => {
        console.log(`      ${i+1}. ${action.action}`);
      });
    }
    
    const highActions = comprehensiveReport.action_priorities.filter(a => a.priority === 'high');
    if (highActions.length > 0) {
      console.log('   🟡 **High Priority Improvements**:');
      highActions.slice(0, 3).forEach((action, i) => {
        console.log(`      ${i+1}. ${action.action}`);
      });
    }

    console.log('\n   🔧 **How to Use This System**:');
    console.log('   1. Add your actual Canva designs, Notion pages, and GPT configurations');
    console.log('   2. Run regular analysis to track improvement over time');
    console.log('   3. Apply the suggested improvements systematically');
    console.log('   4. Monitor philosophy consistency across platforms');
    console.log('   5. Use cross-platform insights to level up all your content');

    console.log('\n🎉 **Demo Complete!** Your intelligent content improvement system is ready to transform your educational materials.');
    
    logger.info('Content Philosophy Demo completed successfully');
    
  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : String(error));
    logger.error('Content Philosophy Demo error:', error);
    process.exit(1);
  }
}

main().catch(console.error);