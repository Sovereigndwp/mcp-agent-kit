#!/usr/bin/env node

/**
 * Learner Experience Demo: What students actually see and do
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load timeline data
const timelineData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/bitcoin-stax-timeline.json'), 'utf8')
);

// Simulated learner choices (what a real student might choose)
const learnerChoices = [
  { period: '2005-2007', choice: 1, reasoning: 'Conservative approach - bank savings seem safe' },
  { period: '2008', choice: 2, reasoning: 'Crisis hits - gold seems like a hedge' },
  { period: '2009-2012', choice: 1, reasoning: 'Bitcoin seems too risky and unknown' },
  { period: '2013', choice: 0, reasoning: 'Hearing buzz about Bitcoin, worth a try' },
  { period: '2014-2016', choice: 0, reasoning: 'DCA approach - keep buying during boring times' },
  { period: '2017', choice: 0, reasoning: 'HODL through the volatility!' }
];

let learnerState = {
  name: 'Alex',
  sovereigntyScore: 0,
  resilienceScore: 0,
  knowledgeScore: 0,
  decisions: []
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function displayLearnerPeriod(periodData, choiceIndex, reasoning) {
  console.clear();

  // Header with immersive styling
  console.log('🔥'.repeat(70));
  console.log(`📅 ${periodData.year} - ${periodData.period}`.padStart(45));
  console.log(`🌟 Status: ${periodData.status.replace('_', ' ').toUpperCase()}`.padStart(45));
  console.log('🔥'.repeat(70));

  // Create dramatic pause
  await sleep(1000);

  // Events unfolding
  console.log('\n📰 BREAKING NEWS - Major Events:');
  for (let i = 0; i < periodData.events.length; i++) {
    await sleep(800);
    console.log(`   ⚡ ${periodData.events[i]}`);
  }

  await sleep(1500);

  // Context and Bitcoin relevance
  console.log('\n💭 Economic Context:');
  console.log(`   ${periodData.economicContext}`);

  console.log('\n₿ How This Relates to Bitcoin:');
  console.log(`   ${periodData.bitcoinRelevance}`);

  await sleep(2000);

  // Socratic question - key learning moment
  console.log('\n🤔 CRITICAL THINKING MOMENT:');
  console.log('═'.repeat(60));
  console.log(`"${periodData.socraticQuestion}"`);
  console.log('═'.repeat(60));

  await sleep(2500);

  // Show portfolio choices as learner sees them
  console.log('\n💼 YOUR DECISION POINT:');
  console.log(`💰 Current Situation: You need to decide where to put your money...`);
  console.log('\nYour options:');

  periodData.playerChoices.forEach((choice, index) => {
    const marker = index === choiceIndex ? '👉' : '  ';
    const highlight = index === choiceIndex ? '🎯' : '📋';
    console.log(`${marker} ${index + 1}. ${highlight} ${choice}`);
  });

  await sleep(2000);

  // Show learner's choice and reasoning
  const selectedChoice = periodData.playerChoices[choiceIndex];
  console.log('\n' + '⚡'.repeat(50));
  console.log(`🎯 ALEX'S CHOICE: "${selectedChoice}"`);
  console.log(`💭 Reasoning: ${reasoning}`);
  console.log('⚡'.repeat(50));

  // Update scores based on choice
  updateLearnerScores(selectedChoice, periodData);

  // Show immediate consequences and learning
  await sleep(1000);
  console.log('\n📊 What Alex Learns:');

  if (selectedChoice.toLowerCase().includes('bitcoin')) {
    learnerState.sovereigntyScore += 15;
    learnerState.knowledgeScore += 10;
    console.log('   🟢 +15 Sovereignty: Starting to understand Bitcoin');
    console.log('   🟢 +10 Knowledge: Learning about new technology');
  }

  if (selectedChoice.toLowerCase().includes('gold')) {
    learnerState.resilienceScore += 10;
    console.log('   🟡 +10 Resilience: Understanding safe haven assets');
  }

  if (selectedChoice.toLowerCase().includes('bank')) {
    learnerState.resilienceScore -= 5;
    console.log('   🔴 -5 Resilience: Exposed to inflation and bank risk');
  }

  if (selectedChoice.toLowerCase().includes('dca') || selectedChoice.toLowerCase().includes('continue buying')) {
    learnerState.resilienceScore += 15;
    learnerState.sovereigntyScore += 10;
    console.log('   🟢 +15 Resilience: Learning patience and consistency');
    console.log('   🟢 +10 Sovereignty: Building Bitcoin conviction');
  }

  // Current learning progress
  console.log(`\n📈 Alex's Learning Journey So Far:`);
  console.log(`   🛡️  Sovereignty Understanding: ${learnerState.sovereigntyScore}/100`);
  console.log(`   💎 Crisis Resilience: ${learnerState.resilienceScore}/100`);
  console.log(`   🧠 Bitcoin Knowledge: ${learnerState.knowledgeScore}/100`);

  // Record decision
  learnerState.decisions.push({
    year: periodData.year,
    choice: selectedChoice,
    reasoning: reasoning,
    period: periodData.period
  });

  await sleep(3000);
  console.log('\n⏰ Time moves forward... The consequences of this choice will unfold...');
  await sleep(2000);
}

function updateLearnerScores(choice, period) {
  const choiceLower = choice.toLowerCase();

  // Sovereignty learning
  if (choiceLower.includes('bitcoin') || choiceLower.includes('btc')) {
    learnerState.sovereigntyScore += 10;
    learnerState.knowledgeScore += 8;
  }

  if (choiceLower.includes('self-custody') || choiceLower.includes('hardware')) {
    learnerState.sovereigntyScore += 20;
    learnerState.knowledgeScore += 15;
  }

  // Resilience learning
  if (choiceLower.includes('hodl') || choiceLower.includes('hold')) {
    learnerState.resilienceScore += 15;
  }

  if (choiceLower.includes('panic') || choiceLower.includes('sell')) {
    learnerState.resilienceScore -= 10;
  }
}

async function showLearnerFinalAssessment() {
  console.clear();
  console.log('🏆'.repeat(70));
  console.log('            🎓 ALEX\'S BITCOIN EDUCATION COMPLETE 🎓');
  console.log('🏆'.repeat(70));

  await sleep(1500);

  console.log(`\n🎊 After 20 years of financial history, Alex has learned:`);

  // Calculate final metrics
  const bitcoinDecisions = learnerState.decisions.filter(d =>
    d.choice.toLowerCase().includes('bitcoin')
  ).length;

  const selfCustodyAwareness = learnerState.decisions.some(d =>
    d.choice.toLowerCase().includes('self-custody') ||
    d.choice.toLowerCase().includes('hardware')
  );

  await sleep(1000);

  console.log('\n📊 ALEX\'S COMPLETE LEARNING ASSESSMENT:');
  console.log('═'.repeat(60));
  console.log(`👤 Learner: ${learnerState.name} (Strategic Investor type)`);
  console.log(`📚 Journey: 6 major historical periods`);
  console.log(`₿ Bitcoin-related decisions: ${bitcoinDecisions}/6`);
  console.log(`🔐 Self-custody awareness: ${selfCustodyAwareness ? 'YES' : 'DEVELOPING'}`);

  await sleep(1500);

  console.log('\n📈 FINAL LEARNING SCORES:');
  console.log(`   🛡️  Sovereignty Understanding: ${learnerState.sovereigntyScore}/100`);
  console.log(`   💎 Crisis Resilience: ${learnerState.resilienceScore}/100`);
  console.log(`   🧠 Bitcoin Knowledge: ${learnerState.knowledgeScore}/100`);

  await sleep(2000);

  // Determine Alex's archetype
  let archetype, description;
  if (learnerState.sovereigntyScore >= 60) {
    archetype = "🛡️ THE SOVEREIGNTY SEEKER";
    description = "Alex has developed a strong understanding of Bitcoin's role in financial sovereignty and is building conviction through experience.";
  } else if (bitcoinDecisions >= 3) {
    archetype = "📈 THE STRATEGIC INVESTOR";
    description = "Alex recognizes Bitcoin's potential but is still learning about the deeper sovereignty aspects. On the right track!";
  } else {
    archetype = "🏦 THE CAUTIOUS LEARNER";
    description = "Alex is taking a measured approach, learning gradually while maintaining conservative financial habits.";
  }

  console.log('\n🎭 ALEX\'S BITCOIN ARCHETYPE:');
  console.log('═'.repeat(50));
  console.log(archetype);
  console.log('');
  console.log(description);

  await sleep(2500);

  console.log('\n🔍 KEY LEARNING MOMENTS IN ALEX\'S JOURNEY:');
  console.log('═'.repeat(50));

  learnerState.decisions.forEach((decision, index) => {
    console.log(`📍 ${decision.year}: "${decision.choice}"`);
    console.log(`   💭 ${decision.reasoning}`);
    console.log('');
  });

  await sleep(2000);

  console.log('\n💡 WHAT ALEX DISCOVERED THROUGH EXPERIENCE:');
  console.log('═'.repeat(50));
  console.log('✅ Market cycles repeat, but Bitcoin\'s fundamentals strengthen');
  console.log('✅ Early adoption requires courage and conviction');
  console.log('✅ Crisis reveals the importance of sound money');
  console.log('✅ Time preference and patience are crucial for building wealth');
  console.log('✅ Self-custody is essential for true sovereignty');

  await sleep(2000);

  console.log('\n🚀 ALEX\'S PERSONALIZED NEXT STEPS:');
  console.log('═'.repeat(50));
  console.log('📚 Study "The Bitcoin Standard" for deeper economic understanding');
  console.log('🔐 Learn about hardware wallets and self-custody best practices');
  console.log('⚡ Explore Lightning Network for practical Bitcoin usage');
  console.log('🤝 Join local Bitcoin meetups to continue learning');
  console.log('💡 Start dollar-cost averaging with small, regular purchases');

  await sleep(2000);

  console.log('\n🎯 EDUCATIONAL EFFECTIVENESS:');
  console.log('═'.repeat(50));
  console.log('🧠 Learning through experience vs. passive lectures');
  console.log('🤔 Socratic questions encourage critical thinking');
  console.log('📈 Personal choices create emotional investment in outcomes');
  console.log('🎮 Gamification makes complex topics engaging');
  console.log('🛡️ Focus on sovereignty creates lasting conviction');

  console.log('\n🎉 This is what EVERY learner experiences in your simulation!');
  console.log('   Personal, engaging, and conviction-building Bitcoin education.');
}

async function runLearnerDemo() {
  console.log('🎬 DEMONSTRATING: What a real learner experiences...\n');
  await sleep(2000);

  // Run through the key periods with simulated learner choices
  const keyPeriods = timelineData.timeline.slice(0, 6);

  for (let i = 0; i < keyPeriods.length && i < learnerChoices.length; i++) {
    await displayLearnerPeriod(
      keyPeriods[i],
      learnerChoices[i].choice,
      learnerChoices[i].reasoning
    );
  }

  await showLearnerFinalAssessment();

  console.log('\n👋 Demo complete! This shows exactly what learners experience.');
}

runLearnerDemo().catch(console.error);