#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { LearningPathOptimizer } from '../agents/LearningPathOptimizer';
import { InteractiveSimulationEngine } from '../agents/InteractiveSimulationEngine';

/**
 * Course Building Pipeline
 * Integrates seed content and drafts lessons using Socratic/teen-friendly style
 */

interface BrandProfile {
  quick_reference: {
    voice: string;
    readability_target: number;
    bilingual_support: string[];
    bitcoin_focus: string;
    key_principles: string[];
  };
  style_rules: any;
}

interface AppConfig {
  sources: any;
  outputs: any;
  style_rules: any;
  fact_rules: any;
}

async function loadBrandProfile(): Promise<BrandProfile> {
  const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
  try {
    const brandData = await fs.readFile(brandPath, 'utf-8');
    return JSON.parse(brandData);
  } catch (error) {
    console.log('⚠️  Brand profile not found. Run: npm run brand:learn first');
    throw new Error('Brand profile required. Run brand:learn pipeline first.');
  }
}

async function loadConfig(): Promise<AppConfig> {
  const configPath = path.join(process.cwd(), 'config', 'app.config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function generateLessonSeed(): Promise<string> {
  // Sample Bitcoin topics for lesson generation
  const bitcoinTopics = [
    'What is Bitcoin? Understanding Digital Money',
    'Your First Bitcoin Wallet Setup',
    'How Bitcoin Transactions Work',
    'Bitcoin Security Basics',
    'Understanding Bitcoin Mining',
    'Bitcoin vs Traditional Banking',
    'Bitcoin and Financial Sovereignty',
    'Lightning Network Introduction',
    'Bitcoin Economics and Scarcity',
    'Common Bitcoin Myths Debunked'
  ];

  const randomTopic = bitcoinTopics[Math.floor(Math.random() * bitcoinTopics.length)];
  return randomTopic;
}

async function runCourseBuild() {
  console.log('🏗️  Starting Course Building Pipeline...');

  try {
    // Load brand profile and config
    const brandProfile = await loadBrandProfile();
    const config = await loadConfig();
    console.log('✅ Brand profile and config loaded');

    // Initialize agents
    const pathOptimizer = new LearningPathOptimizer();
    const simulationEngine = new InteractiveSimulationEngine();
    console.log('✅ Learning agents initialized');

    // Generate lesson seed topic
    const lessonTopic = await generateLessonSeed();
    console.log(`🎯 Lesson topic: ${lessonTopic}`);

    // Create personalized learning path
    console.log('🛤️  Creating personalized learning path...');

    const learningPath = await pathOptimizer.executeToolCall('create_personalized_path', {
      learner_profile: {
        experience_level: 'beginner',
        learning_style: ['visual', 'hands_on'],
        goals: ['practical_knowledge', 'security_awareness'],
        time_availability: 'moderate',
        interests: ['sovereignty', 'practical_usage']
      },
      course_objectives: [
        'Understand core Bitcoin concepts',
        'Practice safe Bitcoin usage',
        'Develop security awareness',
        'Build practical skills'
      ],
      content_preferences: {
        complexity_level: 'beginner_friendly',
        interaction_level: 'highly_interactive',
        assessment_frequency: 'regular_checkpoints',
        content_format: ['text', 'interactive', 'visual']
      }
    });

    // Generate interactive simulation for the lesson
    console.log('🎮 Creating interactive simulation...');

    const simulation = await simulationEngine.executeToolCall('create_bitcoin_simulation', {
      simulation_type: 'wallet_basics',
      complexity_level: 'beginner',
      learning_objectives: [
        'Understanding wallet addresses',
        'Practicing transaction creation',
        'Learning security basics'
      ],
      interaction_style: 'guided_exploration',
      safety_features: ['testnet_only', 'guided_tutorials', 'error_prevention'],
      customization_options: {
        difficulty_scaling: true,
        hints_available: true,
        progress_tracking: true
      }
    });

    // Build lesson content following brand guidelines
    const lessonContent = generateLessonContent(lessonTopic, brandProfile, learningPath, simulation);

    // Create lesson metadata
    const lessonMetadata = {
      id: `lesson_${Date.now()}`,
      title: lessonTopic,
      created: new Date().toISOString(),
      status: 'draft',
      readability_score: null, // Will be calculated in revision
      brand_compliance: 'pending_review',
      languages: brandProfile.quick_reference.bilingual_support,
      learning_path: learningPath.path_structure,
      simulation: simulation.simulation_id,
      estimated_duration: '15-20 minutes',
      difficulty_level: 'beginner',
      prerequisites: [],
      learning_outcomes: [
        'Understand basic Bitcoin concepts',
        'Complete hands-on practice',
        'Develop security awareness'
      ]
    };

    // Save lesson draft
    const timestamp = new Date().toISOString().split('T')[0];
    const lessonFileName = `${timestamp}_${lessonTopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    const lessonPath = path.join('workspace', 'drafts', lessonFileName);

    const fullLesson = `---
${JSON.stringify(lessonMetadata, null, 2)}
---

${lessonContent}
`;

    await fs.writeFile(lessonPath, fullLesson);
    console.log(`✅ Lesson draft saved to ${lessonPath}`);

    // Save simulation data
    const simulationPath = path.join('workspace', 'assets', `simulation_${lessonMetadata.id}.json`);
    await fs.writeFile(simulationPath, JSON.stringify(simulation, null, 2));
    console.log(`✅ Simulation saved to ${simulationPath}`);

    console.log('🎉 Course Building Pipeline completed successfully!');
    console.log('\nNext steps:');
    console.log('- Review lesson draft in workspace/drafts/');
    console.log('- Run: npm run course:revise');

    return {
      success: true,
      lessonPath,
      simulationPath,
      metadata: lessonMetadata
    };

  } catch (error) {
    console.error('❌ Course Building Pipeline failed:', error);
    throw error;
  }
}

function generateLessonContent(topic: string, brandProfile: BrandProfile, learningPath: any, simulation: any): string {
  const voice = brandProfile.quick_reference.voice;
  const principles = brandProfile.quick_reference.key_principles;

  return `# ${topic}

## Welcome, Future Bitcoiner! 🚀

${voice === 'clear, simple, witty, no jargon' ?
  "Ready to dive into Bitcoin? Great! We're going to keep this super simple and fun. No confusing tech speak, just clear explanations that actually make sense." :
  "Welcome to your Bitcoin learning journey. We'll explore this topic step by step, making sure everything is clear and practical."
}

## What You'll Learn Today

By the end of this lesson, you'll be able to:
- ✅ Explain the core concept in simple terms
- ✅ Practice with our safe simulation
- ✅ Identify key security considerations
- ✅ Apply your knowledge in real scenarios

## Let's Start Simple

${generateIntroSection(topic)}

## Hands-On Practice 🎮

Time to get your hands dirty! Our safe simulation lets you practice without any risk.

${generateSimulationSection(simulation)}

## Key Security Tips 🔒

${generateSecuritySection()}

## Quick Check ✓

Let's make sure everything clicked:

1. Can you explain the main concept to a friend?
2. What's the most important security tip to remember?
3. When would you use this in real life?

## What's Next?

Great job! You've mastered the basics of ${topic.toLowerCase()}.

Ready for the next challenge? Here's what we recommend:
- Practice more with our simulation
- Review the security checklist
- Move on to [Next Lesson Topic]

## Need Help?

Stuck on something? That's totally normal!
- 💬 Ask questions in our community
- 📖 Check our glossary for definitions
- 🔄 Repeat the simulation as many times as you need

---

*Remember: ${principles[0] || 'Learning Bitcoin is a journey, not a race. Take your time and practice safely!'} *`;
}

function generateIntroSection(topic: string): string {
  const introTemplates = {
    'wallet': "Think of a Bitcoin wallet like a special app on your phone. It's not actually storing Bitcoin (that lives on the blockchain), but it holds the keys that prove you own your Bitcoin. Like having the key to your safety deposit box.",
    'transaction': "A Bitcoin transaction is like sending a digital message that says 'I'm giving some of my Bitcoin to you.' But instead of just trusting the message, the whole Bitcoin network checks that it's real.",
    'mining': "Bitcoin mining is like a global competition where computers race to solve math puzzles. The winner gets to add the next page (block) to Bitcoin's record book (blockchain) and earns some Bitcoin as a reward.",
    'default': "Let's break this down into bite-sized pieces. We'll start with the basics and build up your understanding step by step."
  };

  const key = Object.keys(introTemplates).find(k => topic.toLowerCase().includes(k)) || 'default';
  return introTemplates[key as keyof typeof introTemplates];
}

function generateSimulationSection(simulation: any): string {
  return `Our interactive simulation lets you:
- 🎯 Practice the core concepts safely
- 🛡️ Learn without risking real money
- 📊 Track your progress
- 💡 Get hints when you're stuck

**Simulation Features:**
${simulation.features?.map((f: string) => `- ${f}`).join('\n') || '- Guided step-by-step practice\n- Instant feedback\n- Safe learning environment'}

[Launch Interactive Simulation 🚀]

*Pro tip: Take your time and try different scenarios. The more you practice, the more confident you'll become!*`;
}

function generateSecuritySection(): string {
  return `**🔒 Essential Security Rules:**

1. **Never share your private keys** - They're like your Bitcoin password
2. **Double-check addresses** - Bitcoin transactions can't be undone
3. **Start small** - Practice with tiny amounts first
4. **Verify everything** - When in doubt, ask questions
5. **Keep learning** - Security knowledge is your best protection

**[VERIFY] Remember: In Bitcoin, you are your own bank. With great power comes great responsibility!**`;
}

// Run if called directly
if (require.main === module) {
  runCourseBuild()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runCourseBuild };