#!/usr/bin/env node

/**
 * Sovereign Stacker: The Bitcoin Journey
 * A demonstration of our MCP agent system working together
 * to create an interactive financial education simulation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load our timeline data
const timelineData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/bitcoin-stax-timeline.json'), 'utf8')
);

console.log('🚀 Welcome to ' + timelineData.gameTitle);
console.log('📖 ' + timelineData.gameDescription);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Simulation state
const playerState = {
  year: 2005,
  portfolio: {
    fiat: timelineData.gameplayMechanics.startingAmount,
    stocks: 0,
    gold: 0,
    bitcoin: 0
  },
  decisions: [],
  sovereigntyScore: 0,
  resilienceScore: 0
};

// Simulate market prices for demonstration
const marketData = {
  2005: { stocks: 100, gold: 500, bitcoin: 0 },
  2008: { stocks: 50, gold: 800, bitcoin: 0 }, // Crisis
  2009: { stocks: 60, gold: 900, bitcoin: 0.001 },
  2013: { stocks: 180, gold: 1200, bitcoin: 1000 },
  2017: { stocks: 250, gold: 1300, bitcoin: 20000 },
  2020: { stocks: 300, gold: 2000, bitcoin: 30000 },
  2021: { stocks: 400, gold: 1800, bitcoin: 69000 },
  2025: { stocks: 500, gold: 2200, bitcoin: 150000 } // Projection
};

/**
 * Simulate a year in the timeline
 */
function simulateYear(yearData) {
  console.log(`\n📅 ${yearData.year} - ${yearData.period}`);
  console.log(`🌟 Status: ${yearData.status.replace('_', ' ').toUpperCase()}`);
  console.log('\n📰 Major Events:');
  yearData.events.forEach(event => console.log(`   • ${event}`));

  console.log('\n💭 Economic Context:', yearData.economicContext);
  console.log('₿ Bitcoin Relevance:', yearData.bitcoinRelevance);

  console.log('\n🤔 Socratic Question:');
  console.log(`   "${yearData.socraticQuestion}"`);

  console.log('\n💼 Your Portfolio Choices:');
  yearData.playerChoices.forEach((choice, index) => {
    console.log(`   ${index + 1}. ${choice}`);
  });

  // For demonstration, make a random choice
  const choice = Math.floor(Math.random() * yearData.playerChoices.length);
  const selectedChoice = yearData.playerChoices[choice];

  console.log(`\n🎯 You chose: ${selectedChoice}`);

  // Record the decision
  playerState.decisions.push({
    year: yearData.year,
    choice: selectedChoice,
    context: yearData.period
  });

  // Update sovereignty score based on choice
  if (selectedChoice.includes('self-custody') || selectedChoice.includes('Bitcoin')) {
    playerState.sovereigntyScore += 10;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Generate final assessment
 */
function generateFinalAssessment() {
  console.log('\n🏆 FINAL ASSESSMENT - YEAR 2025');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Calculate net worth based on decisions
  let finalNetWorth = playerState.portfolio.fiat;
  let bitcoinHoldings = 0;

  // Analyze decision patterns
  const bitcoinDecisions = playerState.decisions.filter(d =>
    d.choice.toLowerCase().includes('bitcoin')
  ).length;

  const selfCustodyDecisions = playerState.decisions.filter(d =>
    d.choice.toLowerCase().includes('self-custody') ||
    d.choice.toLowerCase().includes('custody')
  ).length;

  console.log('\n📊 YOUR JOURNEY ANALYSIS:');
  console.log(`   Bitcoin-related decisions: ${bitcoinDecisions}/${playerState.decisions.length}`);
  console.log(`   Self-custody awareness: ${selfCustodyDecisions > 0 ? 'Yes' : 'No'}`);
  console.log(`   Sovereignty Score: ${playerState.sovereigntyScore}/100`);

  // Determine player archetype
  let archetype;
  if (bitcoinDecisions >= 7 && selfCustodyDecisions >= 2) {
    archetype = "🧠 The Sovereign Stacker";
    console.log('\n🎖️ Archetype: THE SOVEREIGN STACKER');
    console.log('   You understood early that Bitcoin represents true financial sovereignty.');
    console.log('   Your focus on self-custody and long-term thinking paid off.');
  } else if (bitcoinDecisions >= 4) {
    archetype = "📈 The Strategic Investor";
    console.log('\n🎖️ Archetype: THE STRATEGIC INVESTOR');
    console.log('   You recognized Bitcoin\'s potential but may have missed some sovereignty aspects.');
  } else {
    archetype = "🏦 The Traditional Saver";
    console.log('\n🎖️ Archetype: THE TRADITIONAL SAVER');
    console.log('   You stuck with traditional finance. Safety first, but did you miss opportunities?');
  }

  console.log('\n🔍 KEY LEARNING MOMENTS:');

  // Highlight key decision points
  const keyYears = ['2008', '2013', '2020', '2021'];
  keyYears.forEach(year => {
    const decision = playerState.decisions.find(d => d.year.includes(year));
    if (decision) {
      console.log(`   ${year}: ${decision.choice} (${decision.context})`);
    }
  });

  console.log('\n💡 REFLECTION QUESTIONS:');
  console.log('   1. What surprised you most about this journey?');
  console.log('   2. Which decisions would you change if you could go back?');
  console.log('   3. How did major crises affect your thinking?');
  console.log('   4. What did you learn about the difference between price and value?');
  console.log('   5. How important is financial sovereignty to you now?');

  console.log('\n🎯 LEARNING OBJECTIVES ACHIEVED:');
  timelineData.learningObjectives.forEach(objective => {
    console.log(`   ✅ ${objective}`);
  });
}

/**
 * Main simulation runner
 */
async function runSimulation() {
  console.log('⏱️  Each year represents major historical events and your response...\n');

  // Simulate key years from our timeline
  const keyYears = timelineData.timeline.slice(0, 6); // First 6 periods for demo

  for (const yearData of keyYears) {
    simulateYear(yearData);

    // Add a small delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate final assessment
  generateFinalAssessment();

  console.log('\n🎮 Simulation Complete!');
  console.log('   This demonstrates how our MCP agents can create engaging');
  console.log('   educational experiences that combine historical data,');
  console.log('   Socratic questioning, and personalized assessment.');

  console.log('\n🔗 Next Steps:');
  console.log('   • Integrate with ContentGamificationEngine for scoring');
  console.log('   • Use AssessmentGenerator for detailed feedback');
  console.log('   • Add CanvaDesignCoach for visual timeline elements');
  console.log('   • Connect SocraticTutor for deeper questioning');
}

// Run the simulation
runSimulation().catch(console.error);