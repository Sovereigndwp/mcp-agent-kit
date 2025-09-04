// Complete Bitcoin Canva Workflow - Enhanced data + Design automation
import { CanvaAutoDesigner } from './canva_auto_designer.js';
import { spawn } from 'child_process';
import { promisify } from 'util';

async function runCompleteWorkflow() {
  console.log('🚀 Bitcoin Educational Design Workflow Starting...\n');
  
  try {
    // Step 1: Generate enhanced Bitcoin data
    console.log('📊 Step 1: Generating enhanced Bitcoin data...');
    
    // Use spawn instead of exec for better security
    const enhancedProcess = spawn('npm', ['run', 'canva:enhanced'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false
    });
    
    let enhancedOutput = '';
    enhancedProcess.stdout?.on('data', (data) => {
      enhancedOutput += data.toString();
    });
    
    await new Promise((resolve, reject) => {
      enhancedProcess.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Enhanced data generation failed with code ${code}`));
        }
      });
      enhancedProcess.on('error', reject);
    });
    
    console.log('✅ Enhanced data generated\n');
    
    // Step 2: Create Canva designs from the enhanced data  
    console.log('🎨 Step 2: Creating Canva design specifications...');
    const designer = new CanvaAutoDesigner();
    
    // Generate design instructions and bulk create CSV
    const instructions = await designer.createCanvaInstructions();
    const bulkCSV = designer.generateBulkCreateCSV();
    
    // Write outputs
    const { writeFileSync, mkdirSync } = await import('fs');
    const { join } = await import('path');
    
    const exportsDir = join(process.cwd(), 'exports');
    mkdirSync(exportsDir, { recursive: true });
    
    writeFileSync(join(exportsDir, 'workflow-canva-instructions.md'), instructions);
    writeFileSync(join(exportsDir, 'workflow-bulk-create.csv'), bulkCSV);
    
    console.log('✅ Canva designs created\n');
    
    // Step 3: Show summary
    console.log('🎉 Complete Workflow Summary:');
    console.log('═'.repeat(50));
    console.log('📁 Generated Files:');
    console.log('  • enhanced-canva-snippet.md - Educational content');  
    console.log('  • enhanced-canva-snippet.csv - Raw data');
    console.log('  • workflow-canva-instructions.md - Design specs');
    console.log('  • workflow-bulk-create.csv - Canva bulk import');
    console.log('');
    console.log('🎯 What You Can Do Now:');
    console.log('  1. 📤 Import workflow-bulk-create.csv to Canva');
    console.log('  2. 🎨 Use MCP Canva integration to automate creation');
    console.log('  3. 📋 Share workflow-canva-instructions.md with designers');
    console.log('  4. 🔄 Run this workflow daily for fresh content');
    console.log('');
    
    // Get current Bitcoin context for context
    const specs = designer.generateDesignSpecs();
    console.log('💡 Current Bitcoin Context:');
    console.log(`  • Price: $${Math.round(parseFloat(specs[0].elements.price.replace('$','')))} (Above $100K!)`);
    console.log(`  • Fees: ${specs[0].elements.fees}`);
    console.log(`  • Status: ${specs[0].elements.congestion}`);
    console.log(`  • Designs: ${specs.length} templates ready`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteWorkflow();
}

export { runCompleteWorkflow };
