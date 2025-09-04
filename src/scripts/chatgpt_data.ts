#!/usr/bin/env ts-node

import { Command } from 'commander';
import { ChatGPTDataImporter } from '../agents/ChatGPTDataImporter.js';
import { logger } from '../utils/logger.js';
import { readFileSync } from 'fs';

const program = new Command();

program
  .name('chatgpt-data')
  .description('Import and analyze your ChatGPT data and custom GPTs')
  .version('1.0.0');

program
  .command('import')
  .description('Import ChatGPT data export file')
  .argument('<file>', 'Path to ChatGPT export file (conversations.json)')
  .action(async (filePath) => {
    try {
      logger.info('📥 Importing ChatGPT data export...');
      console.log('🔍 Processing ChatGPT Export File:');
      console.log(`   File: ${filePath}`);
      console.log('');
      console.log('⏳ Analyzing conversations and extracting teaching patterns...');
      
      const importer = new ChatGPTDataImporter();
      const analysis = await importer.importDataExport(filePath);
      
      console.log('✅ ChatGPT data import completed!');
      console.log('');
      console.log('📊 Import Summary:');
      console.log(`   Custom GPTs: ${analysis.total_gpts}`);
      console.log(`   Conversations: ${analysis.total_conversations}`);
      console.log(`   Teaching Patterns: ${analysis.teaching_patterns.length}`);
      console.log('');
      
      if (analysis.teaching_patterns.length > 0) {
        console.log('🎯 Teaching Patterns Identified:');
        analysis.teaching_patterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern}`);
        });
        console.log('');
      }
      
      if (analysis.instruction_themes.length > 0) {
        console.log('📚 Instruction Themes:');
        analysis.instruction_themes.forEach((theme, index) => {
          console.log(`   ${index + 1}. ${theme}`);
        });
        console.log('');
      }
      
      console.log('💡 Integration Recommendations:');
      analysis.integration_recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
      
      console.log('📁 Data saved to: data/chatgpt_data/');
      console.log('📋 Use "npm run gpt:summary" for quick overview');

    } catch (error) {
      logger.error('Failed to import ChatGPT data:', error);
      console.error('❌ Import failed:', error instanceof Error ? error.message : error);
      console.log('');
      console.log('💡 Tips:');
      console.log('   • Make sure the file is a valid JSON export from ChatGPT');
      console.log('   • If you have a ZIP file, extract it first');
      console.log('   • Look for conversations.json in the extracted folder');
      process.exit(1);
    }
  });

program
  .command('add-gpt')
  .description('Manually add a custom GPT configuration')
  .action(async () => {
    console.log('📝 Manual GPT Addition');
    console.log('=====================');
    console.log('');
    console.log('Please provide your custom GPT details:');
    console.log('');
    console.log('1. GPT Name: [Your GPT name]');
    console.log('2. Description: [Brief description]');
    console.log('3. Instructions: [Full instruction set]');
    console.log('4. Conversation Starters: [List of starters]');
    console.log('5. Knowledge Files: [Any uploaded files]');
    console.log('6. Capabilities: [Web browsing, analysis, image gen, file uploads]');
    console.log('');
    console.log('💡 Copy this template and fill it out:');
    console.log('```json');
    console.log(JSON.stringify({
      name: "Your GPT Name",
      description: "Brief description of what your GPT does",
      instructions: "Full instructions here...",
      conversation_starters: [
        "Starter 1",
        "Starter 2"
      ],
      knowledge_files: [
        "file1.pdf",
        "file2.md"
      ],
      capabilities: {
        web_browsing: false,
        data_analysis: false,
        image_generation: false,
        file_uploads: true
      }
    }, null, 2));
    console.log('```');
    console.log('');
    console.log('Then run: npm run gpt:import-json <your-file.json>');
  });

program
  .command('import-json')
  .description('Import a single GPT from JSON file')
  .argument('<file>', 'Path to GPT JSON file')
  .action(async (filePath) => {
    try {
      console.log(`📥 Importing GPT configuration from: ${filePath}`);
      
      const gptData = JSON.parse(readFileSync(filePath, 'utf8'));
      const importer = new ChatGPTDataImporter();
      
      await importer.importCustomGPT(gptData);
      
      console.log('✅ GPT configuration imported successfully!');
      console.log(`   Name: ${gptData.name}`);
      console.log(`   Instructions: ${gptData.instructions?.length || 0} characters`);
      console.log(`   Starters: ${gptData.conversation_starters?.length || 0}`);
      
    } catch (error) {
      console.error('❌ Failed to import GPT:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('paste-gpt')
  .description('Import GPT by pasting configuration directly')
  .action(async () => {
    console.log('📋 Paste GPT Configuration');
    console.log('==========================');
    console.log('');
    console.log('Please paste your GPT details in the following format:');
    console.log('');
    console.log('Name: Your GPT Name');
    console.log('Description: Brief description');
    console.log('Instructions: Full instruction text...');
    console.log('Starters: Starter 1 | Starter 2 | Starter 3');
    console.log('Files: file1.pdf, file2.md (optional)');
    console.log('Capabilities: web_browsing, data_analysis, etc. (optional)');
    console.log('');
    console.log('💡 Tip: You can copy this directly from your ChatGPT settings page!');
    console.log('');
    console.log('After pasting, I\'ll process and import your GPT automatically.');
  });

program
  .command('summary')
  .description('Show summary of imported ChatGPT data')
  .action(async () => {
    try {
      const importer = new ChatGPTDataImporter();
      const summary = await importer.getImportSummary();
      
      if (summary.message) {
        console.log('ℹ️ ', summary.message);
        console.log('');
        console.log('📋 Instructions:');
        summary.instructions.forEach((instruction: string, index: number) => {
          console.log(`   ${index + 1}. ${instruction}`);
        });
        return;
      }
      
      console.log('📊 ChatGPT Data Summary');
      console.log('======================');
      console.log(`Custom GPTs: ${summary.total_gpts}`);
      console.log(`Conversations: ${summary.total_conversations}`);
      console.log(`Teaching Patterns: ${summary.teaching_patterns?.length || 0}`);
      console.log('');
      
      if (summary.teaching_patterns?.length > 0) {
        console.log('🎯 Your Teaching Patterns:');
        summary.teaching_patterns.forEach((pattern: string, index: number) => {
          console.log(`   ${index + 1}. ${pattern}`);
        });
        console.log('');
      }
      
      if (summary.conversation_analysis) {
        console.log('💬 Conversation Analysis:');
        console.log(`   Average Length: ${summary.conversation_analysis.avg_length} messages`);
        console.log(`   Question Ratio: ${Math.round(summary.conversation_analysis.question_ratio * 100)}%`);
        console.log(`   Socratic Elements: ${summary.conversation_analysis.socratic_elements}`);
        console.log('');
      }
      
      if (summary.integration_recommendations?.length > 0) {
        console.log('💡 Integration Recommendations:');
        summary.integration_recommendations.forEach((rec: string, index: number) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }
      
    } catch (error) {
      logger.error('Failed to get ChatGPT summary:', error);
      console.error('❌ Summary failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('help-export')
  .description('Show detailed instructions for exporting ChatGPT data')
  .action(() => {
    console.log('📤 How to Export Your ChatGPT Data');
    console.log('===================================');
    console.log('');
    console.log('🔗 Method 1: Official ChatGPT Export');
    console.log('   1. Go to https://chat.openai.com/');
    console.log('   2. Click your profile picture (bottom left)');
    console.log('   3. Go to Settings → Data Controls');
    console.log('   4. Click "Export" button');
    console.log('   5. Wait for email with download link');
    console.log('   6. Download and extract the ZIP file');
    console.log('   7. Look for "conversations.json"');
    console.log('   8. Run: npm run gpt:import conversations.json');
    console.log('');
    console.log('🤖 Method 2: Custom GPT Export');
    console.log('   1. Go to your custom GPTs');
    console.log('   2. Click "Edit" on each GPT');
    console.log('   3. Copy the Instructions section');
    console.log('   4. Copy Conversation Starters');
    console.log('   5. Note any Knowledge Files');
    console.log('   6. Use: npm run gpt:add-gpt');
    console.log('');
    console.log('💬 Method 3: Key Conversations');
    console.log('   1. Open important Bitcoin education conversations');
    console.log('   2. Copy the conversation text');
    console.log('   3. Paste directly in chat with Claude Code');
    console.log('   4. I\'ll analyze your teaching patterns');
    console.log('');
    console.log('⚡ Quick Start:');
    console.log('   Just paste your GPT instructions directly in chat!');
    console.log('   I can analyze them immediately.');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}