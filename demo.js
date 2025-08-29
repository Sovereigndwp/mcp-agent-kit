#!/usr/bin/env node

import { config } from 'dotenv';
import { feesSimulationDemo } from './dist/cases/fees_sim_demo.js';

// Load environment variables
config();

async function runDemo() {
  console.log('🚀 Starting MCP Agent Kit Demo...\n');
  
  try {
    await feesSimulationDemo.runQuickDemo();
    console.log('\n✅ Demo completed successfully!');
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

runDemo();
