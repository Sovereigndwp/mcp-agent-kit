#!/usr/bin/env node

/**
 * Interactive Learner Experience: Sovereign Stacker
 * Experience the simulation as a real learner would
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load timeline data
const timelineData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/bitcoin-stax-timeline.json'), 'utf8')
);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Player state
const learnerState = {
  name: '',
  year: 2005,
  portfolio: {
    fiat: timelineData.gameplayMechanics.startingAmount,
    stocks: 0,
    gold: 0,
    bitcoin: 0
  },
  decisions: [],
  sovereigntyScore: 0,
  resilienceScore: 0,
  knowledgeScore: 0
};

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to wait for Enter
function waitForEnter(message = '\n📱 Press Enter to continue...') {
  return new Promise((resolve) => {
    rl.question(message, () => {
      resolve();
    });
  });
}

// Display formatted content with delays for immersion
function displayWithDelay(text, delay = 800) {
  return new Promise((resolve) => {
    console.log(text);
    setTimeout(resolve, delay);
  });
}

// Welcome and onboarding
async function welcomeLearner() {
  console.clear();
  console.log('🔥'.repeat(60));
  console.log('🚀           SOVEREIGN STACKER: THE BITCOIN JOURNEY           🚀');
  console.log('🔥'.repeat(60));

  await displayWithDelay('\n🎯 You\'re about to experience 20 years of financial history...');
  await displayWithDelay('💡 Make real choices with real consequences');
  await displayWithDelay('🧠 Discover Bitcoin sovereignty through experience, not lectures');
  await displayWithDelay('⚡ Your decisions will determine your archetype and future');

  console.log('\n' + '═'.repeat(60));

  learnerState.name = await askQuestion('\n👋 What\'s your name, future sovereign? ');

  console.log(`\n🎊 Welcome to the journey, ${learnerState.name}!`);
  await displayWithDelay(`💰 You start with $${learnerState.portfolio.fiat.toLocaleString()} in 2005`);
  await displayWithDelay('📚 You\'ll navigate through major economic events');
  await displayWithDelay('🤔 Each choice reveals your path to sovereignty');

  await waitForEnter();
}

// Interactive period simulation
async function simulatePeriod(periodData, isLastPeriod = false) {
  console.clear();

  // Header
  console.log('━'.repeat(70));
  console.log(`📅 ${periodData.year} - ${periodData.period}`);
  console.log(`🌟 Status: ${periodData.status.replace('_', ' ').toUpperCase()}`);
  console.log('━'.repeat(70));

  // Events with dramatic timing
  console.log('\n📰 BREAKING: Major Events Unfolding...');
  for (const event of periodData.events) {
    await displayWithDelay(`   🔸 ${event}`, 1200);
  }

  await waitForEnter('\n📱 Press Enter to continue reading...');

  // Economic context
  console.log(`\n💭 Economic Context:`);
  await displayWithDelay(`   ${periodData.economicContext}`, 1000);

  console.log(`\n₿ Bitcoin Relevance:`);
  await displayWithDelay(`   ${periodData.bitcoinRelevance}`, 1000);

  await waitForEnter();

  // Socratic question - pause for reflection
  console.log('\n🤔 PAUSE & REFLECT:');
  console.log('━'.repeat(50));
  await displayWithDelay(`"${periodData.socraticQuestion}"`, 1500);
  console.log('━'.repeat(50));

  await askQuestion('\n💭 Take a moment to think... What\'s your initial reaction? (Press Enter when ready) ');

  // Portfolio choices
  console.log('\n💼 YOUR CRITICAL DECISION:');
  console.log(`💰 Current Portfolio: $${learnerState.portfolio.fiat.toLocaleString()} fiat, ${learnerState.portfolio.bitcoin} BTC`);
  console.log('\nChoose wisely - this decision will shape your future...\n');

  periodData.playerChoices.forEach((choice, index) => {
    console.log(`   ${index + 1}. ${choice}`);
  });

  // Get user choice
  let choiceIndex;
  while (true) {
    const choice = await askQuestion(`\n🎯 What do you choose? (1-${periodData.playerChoices.length}): `);
    choiceIndex = parseInt(choice) - 1;

    if (choiceIndex >= 0 && choiceIndex < periodData.playerChoices.length) {
      break;
    }
    console.log(`❌ Please enter a number between 1 and ${periodData.playerChoices.length}`);
  }

  const selectedChoice = periodData.playerChoices[choiceIndex];

  // Dramatic choice confirmation
  console.log('\n' + '⚡'.repeat(50));
  await displayWithDelay(`🎯 You chose: "${selectedChoice}"`, 1000);
  console.log('⚡'.repeat(50));

  // Record decision and update scores
  learnerState.decisions.push({
    year: periodData.year,
    choice: selectedChoice,
    context: periodData.period,
    choiceIndex: choiceIndex
  });

  // Score updates based on choice
  updateScores(selectedChoice, periodData);

  // Show immediate consequences
  await displayWithDelay('\n📊 Immediate Impact:', 800);

  if (selectedChoice.toLowerCase().includes('bitcoin') || selectedChoice.toLowerCase().includes('whitepaper')) {
    learnerState.sovereigntyScore += 15;
    learnerState.knowledgeScore += 10;
    await displayWithDelay('   🟢 Sovereignty +15 (Early Bitcoin awareness)', 600);
    await displayWithDelay('   🟢 Knowledge +10 (Technical curiosity)', 600);
  }

  if (selectedChoice.toLowerCase().includes('self-custody') || selectedChoice.toLowerCase().includes('keys')) {
    learnerState.sovereigntyScore += 20;
    await displayWithDelay('   🟢 Sovereignty +20 (Self-custody mastery!)', 600);
  }

  if (selectedChoice.toLowerCase().includes('gold')) {
    learnerState.resilienceScore += 10;
    await displayWithDelay('   🟡 Resilience +10 (Safe haven asset)', 600);
  }

  if (selectedChoice.toLowerCase().includes('bank') || selectedChoice.toLowerCase().includes('fiat')) {
    learnerState.resilienceScore -= 5;
    await displayWithDelay('   🔴 Resilience -5 (Inflation exposure)', 600);
  }

  // Current scores
  console.log(`\n📈 Your Current Journey:`);
  console.log(`   🛡️  Sovereignty Score: ${learnerState.sovereigntyScore}/100`);
  console.log(`   💎 Resilience Score: ${learnerState.resilienceScore}/100`);
  console.log(`   🧠 Knowledge Score: ${learnerState.knowledgeScore}/100`);

  if (!isLastPeriod) {
    await waitForEnter('\n⏳ Time passes... Press Enter to continue to the next period...');
  }
}

function updateScores(choice, period) {
  const choiceLower = choice.toLowerCase();

  // Sovereignty scoring
  if (choiceLower.includes('bitcoin') || choiceLower.includes('btc')) {
    learnerState.sovereigntyScore += 10;
  }

  if (choiceLower.includes('self-custody') || choiceLower.includes('hardware') || choiceLower.includes('keys')) {
    learnerState.sovereigntyScore += 15;
  }

  if (choiceLower.includes('exchange') && !choiceLower.includes('self-custody')) {
    learnerState.sovereigntyScore -= 5;
  }

  // Resilience scoring
  if (choiceLower.includes('hodl') || choiceLower.includes('hold') || choiceLower.includes('accumulating')) {
    learnerState.resilienceScore += 15;
  }

  if (choiceLower.includes('panic') || choiceLower.includes('sell')) {
    learnerState.resilienceScore -= 10;
  }

  if (choiceLower.includes('dca') || choiceLower.includes('continue buying')) {
    learnerState.resilienceScore += 12;
    learnerState.sovereigntyScore += 8;
  }
}

// Comprehensive final assessment
async function generateFinalAssessment() {
  console.clear();
  console.log('🏆'.repeat(60));
  console.log('           🏆 YOUR SOVEREIGN JOURNEY COMPLETE 🏆');
  console.log('🏆'.repeat(60));

  await displayWithDelay(`\n🎊 Congratulations ${learnerState.name}! You've completed your 20-year Bitcoin journey!`, 1500);

  // Calculate final scores
  const bitcoinDecisions = learnerState.decisions.filter(d =>
    d.choice.toLowerCase().includes('bitcoin') || d.choice.toLowerCase().includes('btc')
  ).length;

  const selfCustodyDecisions = learnerState.decisions.filter(d =>
    d.choice.toLowerCase().includes('self-custody') ||
    d.choice.toLowerCase().includes('hardware') ||
    d.choice.toLowerCase().includes('keys')
  ).length;

  await waitForEnter();
  console.log('\n📊 YOUR COMPLETE JOURNEY ANALYSIS:');
  console.log('═'.repeat(50));

  await displayWithDelay(`👤 Learner: ${learnerState.name}`, 600);
  await displayWithDelay(`📅 Journey: 2005 → 2025 (20 years)`, 600);
  await displayWithDelay(`🎯 Total Decisions: ${learnerState.decisions.length}`, 600);
  await displayWithDelay(`₿ Bitcoin-related Choices: ${bitcoinDecisions}/${learnerState.decisions.length}`, 600);
  await displayWithDelay(`🔐 Self-custody Awareness: ${selfCustodyDecisions > 0 ? 'YES' : 'NO'}`, 600);

  console.log('\n📈 FINAL SCORES:');
  await displayWithDelay(`   🛡️  Sovereignty Score: ${learnerState.sovereigntyScore}/100`, 800);
  await displayWithDelay(`   💎 Resilience Score: ${learnerState.resilienceScore}/100`, 800);
  await displayWithDelay(`   🧠 Knowledge Score: ${learnerState.knowledgeScore}/100`, 800);

  // Determine archetype with more nuanced logic
  let archetype, archetypeEmoji, archetypeDescription;

  if (learnerState.sovereigntyScore >= 70 && selfCustodyDecisions >= 2) {
    archetype = "THE SOVEREIGN STACKER";
    archetypeEmoji = "🛡️";
    archetypeDescription = "You understand that Bitcoin represents true financial sovereignty. Your focus on self-custody and long-term thinking positions you as a Bitcoin maximalist who truly 'gets it'.";
  } else if (bitcoinDecisions >= 4 && learnerState.resilienceScore >= 50) {
    archetype = "THE STRATEGIC INVESTOR";
    archetypeEmoji = "📈";
    archetypeDescription = "You recognized Bitcoin's potential early and showed strategic thinking. You understand the investment thesis but may still be developing sovereignty awareness.";
  } else if (learnerState.knowledgeScore >= 40) {
    archetype = "THE CURIOUS LEARNER";
    archetypeEmoji = "🧠";
    archetypeDescription = "You're on a learning journey and asking the right questions. Your curiosity about Bitcoin is growing, and you're building conviction through education.";
  } else {
    archetype = "THE TRADITIONAL SAVER";
    archetypeEmoji = "🏦";
    archetypeDescription = "You've maintained a cautious approach to new technologies. While you may have missed some opportunities, your focus on safety shows prudent financial thinking.";
  }

  await waitForEnter();
  console.log('\n🎭 YOUR BITCOIN ARCHETYPE:');
  console.log('═'.repeat(50));
  await displayWithDelay(`${archetypeEmoji} ${archetype}`, 1200);
  console.log('');
  await displayWithDelay(archetypeDescription, 1500);

  // Key learning moments
  await waitForEnter();
  console.log('\n🔍 YOUR KEY LEARNING MOMENTS:');
  console.log('═'.repeat(50));

  const keyMoments = learnerState.decisions.filter(d =>
    ['2008', '2013', '2017', '2020', '2021'].some(year => d.year.includes(year))
  );

  for (const moment of keyMoments) {
    await displayWithDelay(`📍 ${moment.year}: "${moment.choice}" (${moment.context})`, 1000);
  }

  // Reflection questions
  await waitForEnter();
  console.log('\n💭 REFLECTION QUESTIONS FOR DEEPER LEARNING:');
  console.log('═'.repeat(50));

  const questions = [
    "What surprised you most about this 20-year journey?",
    "Which decision would you change if you could go back?",
    "How did major crises (2008, 2020) affect your thinking?",
    "What did you learn about the difference between price and value?",
    "How important is financial sovereignty to you now?",
    "What role does self-custody play in true Bitcoin ownership?"
  ];

  for (const question of questions) {
    await displayWithDelay(`🤔 ${question}`, 1200);
  }

  await waitForEnter('\n💭 Take time to reflect on these questions...');

  // Learning objectives achieved
  console.log('\n🎯 LEARNING OBJECTIVES ACHIEVED:');
  console.log('═'.repeat(50));

  const objectives = timelineData.learningObjectives;
  for (const objective of objectives) {
    await displayWithDelay(`✅ ${objective}`, 800);
  }

  // Personal recommendations
  await waitForEnter();
  console.log('\n🚀 YOUR PERSONAL BITCOIN ROADMAP:');
  console.log('═'.repeat(50));

  if (archetype === "THE SOVEREIGN STACKER") {
    await displayWithDelay("🎯 Continue stacking sats and exploring advanced sovereignty tools", 800);
    await displayWithDelay("⚡ Consider Lightning Network and Bitcoin development", 800);
    await displayWithDelay("🤝 Mentor others on their Bitcoin journey", 800);
  } else if (archetype === "THE STRATEGIC INVESTOR") {
    await displayWithDelay("🔐 Focus on learning self-custody best practices", 800);
    await displayWithDelay("📚 Study 'The Bitcoin Standard' for deeper understanding", 800);
    await displayWithDelay("⚡ Explore Bitcoin's technical fundamentals", 800);
  } else if (archetype === "THE CURIOUS LEARNER") {
    await displayWithDelay("📖 Continue your Bitcoin education journey", 800);
    await displayWithDelay("💡 Start with small, regular Bitcoin purchases", 800);
    await displayWithDelay("🔐 Learn about hardware wallets and self-custody", 800);
  } else {
    await displayWithDelay("📚 Consider reading 'Bitcoin: Hard Money You Can't F*ck With'", 800);
    await displayWithDelay("💡 Start with educational resources before investing", 800);
    await displayWithDelay("🤝 Connect with local Bitcoin meetups", 800);
  }

  await waitForEnter();
  console.log('\n🎉 SIMULATION COMPLETE!');
  console.log('═'.repeat(50));
  await displayWithDelay("🧠 You've experienced Bitcoin education through immersion", 1000);
  await displayWithDelay("🎯 Your choices shaped your understanding and conviction", 1000);
  await displayWithDelay("🚀 Your Bitcoin sovereignty journey continues in the real world!", 1000);

  console.log('\n🔗 Continue Your Journey:');
  console.log('   • Join Bitcoin communities and meetups');
  console.log('   • Set up your first hardware wallet');
  console.log('   • Start dollar-cost averaging into Bitcoin');
  console.log('   • Share your learnings with others');

  await waitForEnter('\n👋 Press Enter to complete your journey...');
}

// Main simulation flow
async function runLearnerExperience() {
  try {
    await welcomeLearner();

    // Run through key periods (first 6 for demo)
    const keyPeriods = timelineData.timeline.slice(0, 6);

    for (let i = 0; i < keyPeriods.length; i++) {
      await simulatePeriod(keyPeriods[i], i === keyPeriods.length - 1);
    }

    await generateFinalAssessment();

  } catch (error) {
    console.error('🚨 Simulation error:', error);
  } finally {
    rl.close();
  }
}

// Start the experience
console.log('🚀 Starting your immersive Bitcoin sovereignty journey...\n');
runLearnerExperience();