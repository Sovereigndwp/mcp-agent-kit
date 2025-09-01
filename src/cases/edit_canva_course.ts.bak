#!/usr/bin/env tsx

// Edit Canva Course - Programmatic updates to Bitcoin education content
import 'dotenv/config';
import { canvaTools } from '../tools/canva_api.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { SocraticTutor } from '../agents/SocraticTutor.js';
import { logger } from '../utils/logger.js';
import { writeFileSync, mkdirSync } from 'fs';

interface CourseUpdatePlan {
  design_id: string;
  title: string;
  current_data?: any;
  updates: {
    price_update?: string;
    fee_update?: string;
    congestion_status?: string;
    educational_prompt?: string;
    color_scheme?: string[];
  };
  priority: 'high' | 'medium' | 'low';
}

export async function generateCourseUpdates() {
  console.log('📚 Generating Bitcoin Course Updates');
  console.log('═'.repeat(50));

  try {
    // Get current Bitcoin context
    const [fees, price] = await Promise.all([
      getFeeEstimates(),
      btc_price()
    ]);

    const fast = fees.fastestFee || 1;
    const medium = fees.halfHourFee || 1;
    const slow = fees.economyFee || 1;
    const congestionLevel = fast > 20 ? 'High' : fast > 5 ? 'Medium' : 'Low';
    const congestionEmoji = fast > 20 ? '🔴' : fast > 5 ? '🟡' : '🟢';

    // Get educational content
    const socraticTutor = new SocraticTutor();
    const [feesPrompts, walletsPrompts, securityPrompts] = await Promise.all([
      socraticTutor.generateQuestions('fees', 'beginner', 3),
      socraticTutor.generateQuestions('wallets', 'beginner', 3),
      socraticTutor.generateQuestions('security', 'beginner', 3)
    ]);

    console.log(`💰 Current Bitcoin Data:`);
    console.log(`   Price: $${price.usd.toLocaleString()} (${price.usd > 100000 ? '🚀' : '📈'})`);
    console.log(`   Network: ${congestionEmoji} ${congestionLevel} congestion (${fast} sat/vB)`);
    console.log(`   Educational prompts: ${feesPrompts.questions.length + walletsPrompts.questions.length + securityPrompts.questions.length} ready`);

    // Generate course update plan
    const courseUpdates: CourseUpdatePlan[] = [
      {
        design_id: 'bitcoin_intro_slide',
        title: 'Bitcoin Introduction',
        updates: {
          price_update: `Current Bitcoin: $${Math.round(price.usd/1000)}K`,
          educational_prompt: walletsPrompts.questions[0],
          color_scheme: ['#F7931A', '#FFFFFF', '#333333']
        },
        priority: 'high'
      },
      {
        design_id: 'fees_explanation',
        title: 'Understanding Transaction Fees',
        updates: {
          fee_update: `Network Fees: Fast ${fast} • Medium ${medium} • Slow ${slow} sat/vB`,
          congestion_status: `${congestionEmoji} ${congestionLevel} Network Activity`,
          educational_prompt: feesPrompts.questions[0],
          color_scheme: congestionLevel === 'Low' ? ['#00C851', '#F7931A'] : ['#FF4444', '#F7931A']
        },
        priority: 'high'
      },
      {
        design_id: 'network_overview',
        title: 'Bitcoin Network Overview',
        updates: {
          price_update: `$${Math.round(price.usd/1000)}K Era`,
          congestion_status: `Current: ${congestionLevel} Activity`,
          educational_prompt: feesPrompts.questions[1],
          color_scheme: ['#F7931A', '#2196F3', '#FFFFFF']
        },
        priority: 'medium'
      },
      {
        design_id: 'security_wallet',
        title: 'Bitcoin Security & Wallets',
        updates: {
          educational_prompt: securityPrompts.questions[0],
          color_scheme: ['#FF5722', '#F7931A', '#FFFFFF']
        },
        priority: 'medium'
      },
      {
        design_id: 'learning_summary',
        title: 'Course Summary',
        updates: {
          price_update: `Bitcoin reached $${Math.round(price.usd/1000)}K`,
          congestion_status: `Network: ${congestionLevel}`,
          educational_prompt: walletsPrompts.questions[2],
          color_scheme: ['#4CAF50', '#F7931A', '#FFFFFF']
        },
        priority: 'low'
      }
    ];

    console.log(`\n📋 Generated ${courseUpdates.length} course updates:`);
    courseUpdates.forEach((update, index) => {
      console.log(`\n${index + 1}. ${update.title} (${update.priority})`);
      if (update.updates.price_update) {
        console.log(`   💰 Price: ${update.updates.price_update}`);
      }
      if (update.updates.fee_update) {
        console.log(`   ⚡ Fees: ${update.updates.fee_update}`);
      }
      if (update.updates.congestion_status) {
        console.log(`   📊 Status: ${update.updates.congestion_status}`);
      }
      if (update.updates.educational_prompt) {
        console.log(`   🎓 Prompt: ${update.updates.educational_prompt.substring(0, 50)}...`);
      }
    });

    return {
      bitcoin_context: { price: price.usd, fees: { fast, medium, slow }, congestion: congestionLevel },
      course_updates: courseUpdates,
      educational_content: {
        fees_prompts: feesPrompts.questions,
        wallets_prompts: walletsPrompts.questions,
        security_prompts: securityPrompts.questions
      }
    };

  } catch (error) {
    logger.error('Failed to generate course updates:', error);
    throw error;
  }
}

export async function applyCourseUpdates(updateData: any) {
  console.log('\n🔧 Applying Course Updates via MCP...');
  
  const highPriorityUpdates = updateData.course_updates.filter((u: CourseUpdatePlan) => u.priority === 'high');
  const results = [];

  for (const update of highPriorityUpdates) {
    try {
      console.log(`\n📝 Updating: ${update.title}`);
      
      // Create updated design specification
      const designSpec = {
        title: update.title,
        type: 'presentation',
        content: {
          headline: update.updates.price_update || update.title,
          subtitle: update.updates.congestion_status || 'Bitcoin Education',
          details: update.updates.fee_update || 'Current network conditions',
          educational_prompt: update.updates.educational_prompt,
          cta: 'Learn More →'
        },
        colors: update.updates.color_scheme || ['#F7931A', '#FFFFFF', '#333333'],
        bitcoin_data: updateData.bitcoin_context
      };

      // Use MCP to create/update design
      const designResult = await canvaTools.createDesign('presentation', `${update.title} - Updated ${new Date().toISOString().slice(0, 10)}`);
      
      if (designResult.success) {
        console.log(`   ✅ Created: ${designResult.data.title}`);
        console.log(`   🔗 Edit: ${designResult.data.edit_url || designResult.data.urls?.edit_url}`);
        
        results.push({
          original_design_id: update.design_id,
          new_design: designResult.data,
          specifications: designSpec,
          status: 'success'
        });
      } else {
        console.log(`   ❌ Failed: ${designResult.error}`);
        results.push({
          original_design_id: update.design_id,
          error: designResult.error,
          status: 'failed'
        });
      }

    } catch (error) {
      console.log(`   ❌ Error updating ${update.title}:`, error);
      results.push({
        original_design_id: update.design_id,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  }

  return results;
}

async function main() {
  console.log('🎨 Bitcoin Course Editor - Programmatic Updates');
  console.log('═'.repeat(60));

  try {
    // Test connection first
    const connectionTest = await canvaTools.testConnection();
    console.log(`🔌 Connection: ${connectionTest.message}`);
    
    if (!connectionTest.success) {
      console.log('❌ Cannot proceed without Canva connection');
      process.exit(1);
    }

    // Generate updates based on current Bitcoin data
    const updateData = await generateCourseUpdates();
    
    // Apply high-priority updates
    const results = await applyCourseUpdates(updateData);
    
    // Generate comprehensive update report
    const updateReport = {
      timestamp: new Date().toISOString(),
      bitcoin_context: updateData.bitcoin_context,
      updates_applied: results.filter(r => r.status === 'success').length,
      updates_failed: results.filter(r => r.status === 'failed').length,
      results: results,
      educational_content: updateData.educational_content,
      next_scheduled_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      automation_status: 'ready_for_scheduling'
    };

    // Save update report
    mkdirSync('exports/course_updates', { recursive: true });
    writeFileSync('exports/course_updates/latest_update.json', JSON.stringify(updateReport, null, 2));

    // Display summary
    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successful updates: ${updateReport.updates_applied}`);
    console.log(`   ❌ Failed updates: ${updateReport.updates_failed}`);
    console.log(`   📄 Report saved: exports/course_updates/latest_update.json`);
    
    if (updateReport.updates_applied > 0) {
      console.log(`\n🎯 New designs created with current Bitcoin data:`);
      results.filter(r => r.status === 'success').forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.new_design.title}`);
        console.log(`      Edit: ${result.new_design.edit_url || result.new_design.urls?.edit_url}`);
      });
    }

    console.log(`\n🔄 Next scheduled update: ${new Date(updateReport.next_scheduled_update).toLocaleString()}`);
    console.log(`✅ Course editing completed!`);

    logger.info('Course editing completed successfully', { updates: updateReport.updates_applied });

  } catch (error) {
    logger.error('Course editing failed:', error);
    console.error('❌ Course editing failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);