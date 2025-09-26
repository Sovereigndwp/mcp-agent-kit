#!/usr/bin/env node

/**
 * Comprehensive Test Suite for CanvaDesignCoach Agent
 * Tests visual design capabilities for the "Sovereign Stacker: The Bitcoin Journey" simulation
 */

import { run_CanvaDesignCoach } from './dist/agents/CanvaDesignCoach.js';
import { readFileSync } from 'fs';

// Load timeline data
const timelineData = JSON.parse(readFileSync('./data/bitcoin-stax-timeline.json', 'utf8'));

/**
 * Test 1: Timeline Visualization for 20-year Bitcoin Journey
 */
async function testTimelineVisualization() {
  console.log('\n=== Testing Timeline Visualization ===');

  const timelineContent = `
# Bitcoin Journey Timeline (2005-2025)

## Pre-Bitcoin Era (2005-2007)
Housing bubble expansion creates false sense of wealth.
Easy credit availability masks underlying economic problems.
Traditional finance rules dominate investment decisions.

## Financial Crisis (2008)
Lehman Brothers collapses, triggering global recession.
Bitcoin whitepaper published on October 31, 2008.
Government bailouts begin, raising questions about monetary system.

## Bitcoin's Early Years (2009-2012)
Bitcoin network launches with nearly zero value.
First real-world transaction: 10,000 BTC for two pizzas.
Bitcoin reaches USD parity and experiences first halving.

## First Bubble Cycle (2013)
Bitcoin jumps to $1,000 before Mt. Gox collapse.
Introduction of custody risks and "not your keys" lessons.
First major test of Bitcoin's resilience.

## Quiet Growth Period (2014-2016)
Price stagnates between $200-$500.
Infrastructure development continues behind scenes.
Ethereum launches, expanding blockchain ecosystem.

## ICO Boom & Peak (2017)
Bitcoin reaches ~$20,000 amid mainstream attention.
ICO bubble creates confusion between Bitcoin and "crypto."
Network congestion highlights scaling challenges.

## Crypto Winter (2018-2019)
Bitcoin falls to $3,000, testing conviction.
Infrastructure building continues despite price decline.
Regulatory frameworks begin emerging.

## Pandemic Response (2020)
March crash followed by unprecedented money printing.
PayPal and institutional adoption begins.
Digital gold narrative strengthens.

## Institutional Adoption (2021)
Bitcoin hits $69,000 all-time high.
Tesla invests $1.5 billion, El Salvador adopts as legal tender.
Corporate treasuries begin adding Bitcoin.

## System Stress Testing (2022-2023)
40-year high inflation tests store of value thesis.
Terra/Luna and FTX collapses differentiate Bitcoin from crypto.
Regional bank failures highlight traditional finance fragility.

## New Era (2024-2025)
Bitcoin ETFs approved by major regulators.
Fourth halving reduces new supply to 3.125 BTC per block.
CBDC competition highlights Bitcoin's neutrality advantage.
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Journey Timeline Visualization',
      timelineContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Timeline Visuals'
      }
    );

    console.log('✅ Timeline visualization test passed');
    console.log('Design Brief:', result.briefMd.substring(0, 300) + '...');

    if (result.designs) {
      console.log(`📊 Created ${result.designs.length} timeline designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
        console.log(`    Edit: ${design.edit_url}`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Timeline visualization test failed:', error.message);
    return null;
  }
}

/**
 * Test 2: Achievement Badge Designs for Player Milestones
 */
async function testAchievementBadges() {
  console.log('\n=== Testing Achievement Badge Designs ===');

  const badgeContent = `
# Bitcoin Education Achievement Badges

## Sovereignty Milestones
First Self-Custody: Successfully move Bitcoin to personal wallet.
Hardware Wallet Setup: Configure and test hardware wallet security.
Multi-sig Master: Set up multi-signature wallet configuration.
Cold Storage Expert: Implement air-gapped storage solution.

## Knowledge Achievements
Whitepaper Scholar: Demonstrate understanding of Bitcoin whitepaper.
Technical Analyst: Successfully predict market movements using on-chain data.
Lightning Expert: Set up and use Lightning Network payment channels.
Mining Mechanics: Understand proof-of-work and difficulty adjustment.

## Resilience Badges
Crisis Survivor: Maintain Bitcoin position through major market crash.
HODL Hero: Hold Bitcoin through complete market cycle.
Dollar-Cost Average: Execute consistent buying strategy over 12 months.
Volatility Veteran: Navigate 80%+ price decline without selling.

## Historical Wisdom
2008 Crisis Scholar: Understand connections between financial crisis and Bitcoin creation.
Halving Historian: Experience and explain impact of supply halvings.
Adoption Analyst: Track and predict institutional adoption patterns.
Regulation Navigator: Understand evolving regulatory landscape.

## Social Impact
Orange Pill Ambassador: Successfully introduce 5 people to Bitcoin.
Community Builder: Contribute valuable content to Bitcoin education.
Mentor Master: Help guide newer Bitcoin users through learning journey.
Global Citizen: Understand Bitcoin's impact on financial inclusion.
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Achievement Badge System',
      badgeContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Achievement Badges'
      }
    );

    console.log('✅ Achievement badge test passed');
    console.log('Flesch Reading Ease Score:', result.briefMd.match(/Reading Ease.*?(\d+\.?\d*)/)?.[1]);

    if (result.designs) {
      console.log(`🏆 Created ${result.designs.length} badge designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Achievement badge test failed:', error.message);
    return null;
  }
}

/**
 * Test 3: Progress Indicators for Sovereignty and Resilience Scores
 */
async function testProgressIndicators() {
  console.log('\n=== Testing Progress Indicators ===');

  const progressContent = `
# Bitcoin Sovereignty & Resilience Progress Tracking

## Sovereignty Score Components (0-100 points)
Self-Custody Level (30 points):
- Exchange storage: 0 points
- Software wallet: 10 points
- Hardware wallet: 20 points
- Multi-sig setup: 30 points

Knowledge Depth (25 points):
- Basic understanding: 5 points
- Technical concepts: 15 points
- Advanced implementation: 25 points

Network Participation (20 points):
- Price tracking only: 0 points
- Node operation: 10 points
- Lightning network: 20 points

Economic Understanding (25 points):
- Inflation awareness: 10 points
- Monetary policy impact: 20 points
- Austrian economics: 25 points

## Resilience Score Components (0-100 points)
Portfolio Allocation (40 points):
- 0% Bitcoin: 0 points
- 1-10% Bitcoin: 10 points
- 11-25% Bitcoin: 25 points
- 26%+ Bitcoin: 40 points

Time Horizon (30 points):
- Less than 1 year: 0 points
- 1-4 years: 15 points
- 4+ years: 30 points

Crisis Response (30 points):
- Panic selling: 0 points
- HODL through crashes: 15 points
- Buy during crashes: 30 points

## Visual Progress Elements
Sovereignty thermometer showing current level.
Resilience shield filling up with achievements.
Milestone markers for key educational checkpoints.
Progress comparison with other players (anonymized).
Time-based progress showing improvement velocity.
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Progress Indicators Dashboard',
      progressContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Progress Tracking'
      }
    );

    console.log('✅ Progress indicators test passed');

    if (result.designs) {
      console.log(`📈 Created ${result.designs.length} progress tracking designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Progress indicators test failed:', error.message);
    return null;
  }
}

/**
 * Test 4: Player Archetype Visualizations
 */
async function testPlayerArchetypes() {
  console.log('\n=== Testing Player Archetype Visuals ===');

  const archetypeContent = `
# Bitcoin Player Archetypes Visual Guide

## The Sovereign Stacker
Primary Goal: Maximize self-sovereignty and independence.
Visual Theme: Shield and fortress imagery, orange and gold colors.
Key Characteristics:
- Prioritizes self-custody over convenience
- Values privacy and decentralization
- Long-term time horizon (10+ years)
- Willing to learn technical concepts
- Skeptical of institutions and intermediaries

Progression Path:
1. Exchange trading → Software wallet
2. Software wallet → Hardware wallet
3. Single-sig → Multi-sig setup
4. Basic user → Node operator
5. Consumer → Lightning network participant

## The Strategic Investor
Primary Goal: Optimize risk-adjusted returns over market cycles.
Visual Theme: Charts and graphs, blue and green professional colors.
Key Characteristics:
- Analyzes market cycles and timing
- Balances Bitcoin with traditional assets
- Medium-term time horizon (4-10 years)
- Data-driven decision making
- Comfortable with measured risk

Progression Path:
1. Index funds → Bitcoin allocation
2. Buy and hold → Dollar-cost averaging
3. Price watching → On-chain analysis
4. Reactive → Proactive rebalancing
5. Individual → Institutional strategies

## The Traditional Saver
Primary Goal: Preserve purchasing power and learn gradually.
Visual Theme: Bank vault and safety imagery, conservative colors.
Key Characteristics:
- Risk-averse and cautious approach
- Prefers familiar institutions initially
- Short to medium-term focus (1-4 years)
- Gradual learning and adoption
- Values simplicity and ease of use

Progression Path:
1. Savings account → Bitcoin ETF
2. ETF → Custodial wallet
3. Custodial → Self-custody
4. Basic knowledge → Technical understanding
5. Follower → Independent decision maker

## Cross-Archetype Elements
All paths converge on core Bitcoin principles:
- Sound money understanding
- Inflation hedge recognition
- Network effects appreciation
- Decentralization benefits
- Long-term value storage
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Player Archetype Guide',
      archetypeContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Player Archetypes'
      }
    );

    console.log('✅ Player archetype test passed');

    if (result.designs) {
      console.log(`👥 Created ${result.designs.length} archetype visualization designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Player archetype test failed:', error.message);
    return null;
  }
}

/**
 * Test 5: Infographic Elements for Bitcoin Concepts
 */
async function testBitcoinInfographics() {
  console.log('\n=== Testing Bitcoin Concept Infographics ===');

  const infographicContent = `
# Essential Bitcoin Concepts Infographic

## Self-Custody Explained
Traditional Banking: Your money → Bank vaults → Bank controls access
Bitcoin Self-Custody: Your Bitcoin → Your wallet → You control private keys

Visual Elements:
- Bank building with lock → Personal safe with key
- Flowchart showing custody differences
- Risk comparison matrix

## Network Effects Visualization
Small Network: Few users, limited utility, high volatility
Growing Network: More users, increasing utility, stabilizing value
Mature Network: Global adoption, maximum utility, store of value

Visual Elements:
- Connected nodes growing over time
- Network density increasing
- Value stability improving with size

## Monetary Policy Impact Timeline
2008: Financial crisis → Bank bailouts → Currency debasement
2020: Pandemic response → Massive money printing → Inflation surge
Future: Continued expansion → Bitcoin as alternative → Opt-out mechanism

Visual Elements:
- Money printer going "brrr"
- Currency purchasing power declining
- Bitcoin fixed supply contrast

## Halving Cycle Mechanics
Every 210,000 blocks (≈4 years): Mining reward cuts in half
2009-2012: 50 BTC per block → 2013-2016: 25 BTC per block
2017-2020: 12.5 BTC per block → 2021-2024: 6.25 BTC per block
2025+: 3.125 BTC per block → Eventually approaches 21 million limit

Visual Elements:
- Decreasing block rewards over time
- Supply curve approaching asymptote
- Historical price response patterns

## Lightning Network Simplified
Problem: Bitcoin base layer has limited transaction throughput
Solution: Payment channels allow instant, low-cost transactions
Benefit: Bitcoin scalability without compromising security

Visual Elements:
- Highway analogy (base layer = interstate, Lightning = local roads)
- Payment channel opening/closing
- Route finding through network
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Concepts Infographic Suite',
      infographicContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Concept Infographics'
      }
    );

    console.log('✅ Bitcoin infographics test passed');

    if (result.designs) {
      console.log(`📊 Created ${result.designs.length} infographic designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Bitcoin infographics test failed:', error.message);
    return null;
  }
}

/**
 * Test 6: Dashboard Layout for Player Progress
 */
async function testDashboardLayout() {
  console.log('\n=== Testing Dashboard Layout ===');

  const dashboardContent = `
# Bitcoin Education Dashboard Layout

## Header Section
Player name and current archetype badge
Overall progress percentage (0-100%)
Current sovereignty score and resilience score
Time remaining in simulation

## Timeline Progress Panel
Visual timeline showing 2005-2025 journey
Current year highlighted with pulse effect
Completed periods marked with checkmarks
Upcoming events preview

## Portfolio Overview
Current allocation pie chart (Fiat/Stocks/Gold/Bitcoin)
Net worth progression line graph
Real-time price ticker for Bitcoin
Portfolio performance vs benchmarks

## Achievement Gallery
Recently earned badges prominently displayed
Progress bars for near-completion achievements
Achievement categories with completion counts
Social sharing buttons for major milestones

## Knowledge Tracker
Completed educational modules checklist
Socratic question score and streak
Technical understanding level indicator
Real-world application challenges completed

## Historical Context Panel
Current simulation year economic conditions
Key events from actual history
Decision consequences from previous rounds
Learning opportunities highlighted

## Social Elements
Anonymous leaderboard position
Peer comparison metrics (optional)
Community challenges participation
Mentorship opportunities

## Action Center
Current decision prompt with timer
Available educational resources
Next recommended learning module
Portfolio rebalancing tools

## Performance Analytics
Decision accuracy score
Timing analysis for major choices
Risk management effectiveness
Long-term thinking development

## Settings & Preferences
Archetype selection and switching
Difficulty level adjustment
Notification preferences
Progress sharing controls
  `;

  try {
    const result = await run_CanvaDesignCoach(
      'Bitcoin Education Dashboard Design',
      dashboardContent,
      {
        createDesigns: true,
        folderName: 'Bitcoin Education - Dashboard Layouts'
      }
    );

    console.log('✅ Dashboard layout test passed');

    if (result.designs) {
      console.log(`🖥️ Created ${result.designs.length} dashboard designs:`);
      result.designs.forEach(design => {
        console.log(`  - ${design.title} (${design.type})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Dashboard layout test failed:', error.message);
    return null;
  }
}

/**
 * Test 7: Adaptive Visual Design Based on Player Progress
 */
async function testAdaptiveDesign() {
  console.log('\n=== Testing Adaptive Visual Design ===');

  // Simulate different player states
  const playerStates = [
    {
      archetype: 'Sovereign Stacker',
      progress: 85,
      year: '2024',
      content: 'Advanced self-custody techniques, Lightning Network setup, multi-sig wallet configuration.'
    },
    {
      archetype: 'Strategic Investor',
      progress: 45,
      year: '2017',
      content: 'Market cycle analysis, portfolio rebalancing strategies, institutional adoption patterns.'
    },
    {
      archetype: 'Traditional Saver',
      progress: 15,
      year: '2013',
      content: 'Basic Bitcoin concepts, inflation protection, gradual adoption strategies.'
    }
  ];

  const results = [];

  for (const state of playerStates) {
    console.log(`\n  Testing ${state.archetype} at ${state.progress}% progress (${state.year})`);

    try {
      const result = await run_CanvaDesignCoach(
        `${state.archetype} - Year ${state.year} Progress`,
        `# Adaptive Content for ${state.archetype}\n\n${state.content}\n\nProgress: ${state.progress}%\nSimulation Year: ${state.year}`,
        {
          createDesigns: true,
          folderName: `Bitcoin Education - ${state.archetype} Adaptive`
        }
      );

      console.log(`    ✅ Created designs for ${state.archetype}`);
      results.push(result);

    } catch (error) {
      console.error(`    ❌ Failed for ${state.archetype}:`, error.message);
    }
  }

  return results;
}

/**
 * Main Test Execution
 */
async function runAllTests() {
  console.log('🚀 Starting Comprehensive CanvaDesignCoach Testing');
  console.log('Testing visual design capabilities for "Sovereign Stacker: The Bitcoin Journey"');

  const testResults = {
    timeline: null,
    badges: null,
    progress: null,
    archetypes: null,
    infographics: null,
    dashboard: null,
    adaptive: null
  };

  // Run all tests
  testResults.timeline = await testTimelineVisualization();
  testResults.badges = await testAchievementBadges();
  testResults.progress = await testProgressIndicators();
  testResults.archetypes = await testPlayerArchetypes();
  testResults.infographics = await testBitcoinInfographics();
  testResults.dashboard = await testDashboardLayout();
  testResults.adaptive = await testAdaptiveDesign();

  // Summary Report
  console.log('\n📋 TEST SUMMARY REPORT');
  console.log('====================');

  const passedTests = Object.entries(testResults).filter(([_, result]) => result !== null);
  const failedTests = Object.entries(testResults).filter(([_, result]) => result === null);

  console.log(`✅ Passed: ${passedTests.length}/7 tests`);
  console.log(`❌ Failed: ${failedTests.length}/7 tests`);

  if (passedTests.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    passedTests.forEach(([testName, result]) => {
      console.log(`  ${testName}: Design brief created with ${result.designs?.length || 0} Canva designs`);
    });
  }

  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(([testName, _]) => {
      console.log(`  ${testName}: Test execution failed`);
    });
  }

  // Agent Implementation Analysis
  console.log('\n🔍 CANVA DESIGN COACH ANALYSIS');
  console.log('============================');

  console.log('✅ IMPLEMENTATION STRENGTHS:');
  console.log('  - Integrates real Bitcoin price and fee data');
  console.log('  - Creates educational design briefs with readability analysis');
  console.log('  - Supports multiple Canva design types (posts, presentations, infographics)');
  console.log('  - Includes Socratic questioning for enhanced learning');
  console.log('  - Provides CSV data for Canva bulk creation');
  console.log('  - Has both MCP and API fallback integration');

  console.log('\n⚠️  IMPLEMENTATION GAPS:');
  console.log('  - Does NOT extend BaseAgent class with proper Zod validation');
  console.log('  - Limited to Bitcoin fee/price focused content generation');
  console.log('  - No specialized gamification or timeline visualization features');
  console.log('  - No adaptive design based on player progress or archetype');
  console.log('  - Missing integration with ContentGamificationEngine');
  console.log('  - No direct timeline data integration');

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('  1. Refactor to extend BaseAgent with proper tool definitions');
  console.log('  2. Add specialized tools for timeline, badge, and dashboard design');
  console.log('  3. Integrate with ContentGamificationEngine for achievement visuals');
  console.log('  4. Add player progress and archetype-based design adaptation');
  console.log('  5. Create template system for consistent Bitcoin education visuals');
  console.log('  6. Add support for progress visualization and dashboard layouts');

  return testResults;
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };