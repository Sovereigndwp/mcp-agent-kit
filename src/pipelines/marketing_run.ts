#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { EnhancedBrandAgent } from '../agents/EnhancedBrandAgent';
import { GamificationEngine } from '../agents/GamificationEngine';

/**
 * Marketing Pipeline
 * Makes platform hooks + 2-3 micro-challenges for each approved lesson
 */

interface MarketingAsset {
  platform: string;
  content_type: string;
  content: string;
  hashtags: string[];
  call_to_action: string;
  visual_suggestions: string[];
}

interface MicroChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
  reward_points: number;
  verification_method: string;
  hint: string;
}

interface LessonMetadata {
  id: string;
  title: string;
  difficulty_level: string;
  learning_outcomes: string[];
  estimated_duration: string;
}

async function loadConfig() {
  const configPath = path.join(process.cwd(), 'config', 'app.config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function loadBrandProfile() {
  const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
  const brandData = await fs.readFile(brandPath, 'utf-8');
  return JSON.parse(brandData);
}

async function getApprovedLessons(): Promise<string[]> {
  const approvedDir = path.join('workspace', 'approved');
  try {
    const files = await fs.readdir(approvedDir);
    return files.filter(file => file.endsWith('.md')).map(file => path.join(approvedDir, file));
  } catch (error) {
    console.log('⚠️  No approved lessons found. Run: npm run course:revise first');
    return [];
  }
}

async function parseLessonFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const parts = content.split('---');

  if (parts.length < 3) {
    throw new Error(`Invalid lesson format in ${filePath}`);
  }

  const metadata = JSON.parse(parts[1]);
  const lessonContent = parts.slice(2).join('---').trim();

  return { metadata, lessonContent, filePath };
}

async function generatePlatformHooks(lesson: { metadata: LessonMetadata; lessonContent: string }, brandProfile: any): Promise<MarketingAsset[]> {
  const hooks: MarketingAsset[] = [];

  // Twitter/X Hook
  hooks.push({
    platform: 'twitter',
    content_type: 'post',
    content: `🚀 New lesson alert! "${lesson.metadata.title}"

${extractKeyInsight(lesson.lessonContent)}

Perfect for ${lesson.metadata.difficulty_level} learners. Ready to level up your Bitcoin knowledge?

#Bitcoin #Education #FinancialSovereignty #LearnBitcoin`,
    hashtags: ['Bitcoin', 'Education', 'FinancialSovereignty', 'LearnBitcoin'],
    call_to_action: 'Start learning today!',
    visual_suggestions: ['Bitcoin-themed graphics', 'Course preview screenshot', 'Progress meter visual']
  });

  // LinkedIn Hook
  hooks.push({
    platform: 'linkedin',
    content_type: 'post',
    content: `📚 Professional Development Alert: "${lesson.metadata.title}"

In today's evolving financial landscape, understanding Bitcoin is becoming increasingly important. Our latest lesson covers:

${lesson.metadata.learning_outcomes.map(outcome => `• ${outcome}`).join('\n')}

Estimated time: ${lesson.metadata.estimated_duration}
Difficulty: ${lesson.metadata.difficulty_level}

Whether you're in finance, technology, or just curious about the future of money, this lesson provides clear, jargon-free education.

#ProfessionalDevelopment #Bitcoin #FinTech #DigitalLiteracy`,
    hashtags: ['ProfessionalDevelopment', 'Bitcoin', 'FinTech', 'DigitalLiteracy'],
    call_to_action: 'Advance your knowledge today',
    visual_suggestions: ['Professional infographic', 'Certificate preview', 'Learning pathway diagram']
  });

  // Instagram Hook
  hooks.push({
    platform: 'instagram',
    content_type: 'post',
    content: `✨ New lesson just dropped! ✨

"${lesson.metadata.title}"

Swipe to see what you'll learn 👉

${extractEngagingTeaser(lesson.lessonContent)}

Tag a friend who needs to see this! 👇

#BitcoinEducation #LearnWithUs #FinancialFreedom #CryptoEducation #MoneyMatters`,
    hashtags: ['BitcoinEducation', 'LearnWithUs', 'FinancialFreedom', 'CryptoEducation', 'MoneyMatters'],
    call_to_action: 'Start your journey now!',
    visual_suggestions: ['Carousel with key points', 'Before/after knowledge graphic', 'Interactive story highlight']
  });

  // YouTube/TikTok Hook
  hooks.push({
    platform: 'youtube',
    content_type: 'video_description',
    content: `🎯 "${lesson.metadata.title}" - Complete Beginner's Guide

In this ${lesson.metadata.estimated_duration} lesson, you'll discover:
${lesson.metadata.learning_outcomes.map((outcome, i) => `${i + 1}. ${outcome}`).join('\n')}

Perfect for: ${lesson.metadata.difficulty_level} learners
What you'll need: Just curiosity!

📚 Full course: [Link in bio]
💬 Questions? Drop them below!
🔔 Subscribe for more Bitcoin education

#Bitcoin #Education #Tutorial #Beginner #FinancialLiteracy`,
    hashtags: ['Bitcoin', 'Education', 'Tutorial', 'Beginner', 'FinancialLiteracy'],
    call_to_action: 'Watch now and subscribe!',
    visual_suggestions: ['Animated explainer video', 'Screen recording walkthrough', 'Presenter-style video']
  });

  return hooks;
}

function extractKeyInsight(content: string): string {
  // Extract the first meaningful sentence or key point
  const sentences = content.split('.').filter(s => s.length > 20);
  return sentences[0]?.trim() + '.' || 'Learn the fundamentals of Bitcoin in a clear, simple way.';
}

function extractEngagingTeaser(content: string): string {
  const teasers = [
    "Ready to understand Bitcoin like never before?",
    "This changes everything you thought you knew!",
    "Simple explanations, no tech jargon!",
    "Your Bitcoin journey starts here!",
    "Make complex concepts click!"
  ];
  return teasers[Math.floor(Math.random() * teasers.length)];
}

async function generateMicroChallenges(lesson: { metadata: LessonMetadata; lessonContent: string }): Promise<MicroChallenge[]> {
  const challenges: MicroChallenge[] = [];
  const lessonTopic = lesson.metadata.title.toLowerCase();

  // Challenge 1: Knowledge Check
  challenges.push({
    id: `${lesson.metadata.id}_knowledge`,
    title: `Quick Knowledge Check: ${lesson.metadata.title}`,
    description: `Test your understanding of the key concepts from this lesson. Answer 3 questions correctly to earn points!`,
    difficulty: 'easy',
    estimated_time: '2-3 minutes',
    reward_points: 50,
    verification_method: 'quiz',
    hint: 'Review the main sections if you get stuck!'
  });

  // Challenge 2: Practical Application
  if (lessonTopic.includes('wallet') || lessonTopic.includes('transaction')) {
    challenges.push({
      id: `${lesson.metadata.id}_practice`,
      title: `Hands-On Practice: ${lesson.metadata.title}`,
      description: `Complete a safe simulation exercise to practice what you learned. Use our testnet environment to try real Bitcoin operations without risk.`,
      difficulty: 'medium',
      estimated_time: '10-15 minutes',
      reward_points: 100,
      verification_method: 'simulation_completion',
      hint: 'Take your time and follow each step carefully!'
    });
  } else {
    challenges.push({
      id: `${lesson.metadata.id}_application`,
      title: `Real-World Application: ${lesson.metadata.title}`,
      description: `Identify a real-world scenario where you would apply this knowledge. Share your example for bonus points!`,
      difficulty: 'medium',
      estimated_time: '5-10 minutes',
      reward_points: 75,
      verification_method: 'peer_review',
      hint: 'Think about everyday situations where this knowledge would be useful!'
    });
  }

  // Challenge 3: Community Engagement
  challenges.push({
    id: `${lesson.metadata.id}_community`,
    title: `Teach It Forward: ${lesson.metadata.title}`,
    description: `Explain one key concept from this lesson to help another learner. Post in our community forum or create a simple explanation.`,
    difficulty: 'hard',
    estimated_time: '15-20 minutes',
    reward_points: 150,
    verification_method: 'community_contribution',
    hint: 'The best way to learn is to teach others!'
  });

  return challenges;
}

async function runMarketingPipeline() {
  console.log('📢 Starting Marketing Pipeline...');

  try {
    // Load configuration and brand profile
    const config = await loadConfig();
    const brandProfile = await loadBrandProfile();
    console.log('✅ Configuration and brand profile loaded');

    // Initialize agents
    const brandAgent = new EnhancedBrandAgent();
    const gamificationEngine = new GamificationEngine();
    console.log('✅ Marketing agents initialized');

    // Get approved lessons
    const approvedFiles = await getApprovedLessons();
    if (approvedFiles.length === 0) {
      console.log('ℹ️  No approved lessons found to market');
      return { success: true, processedFiles: 0 };
    }

    console.log(`📋 Found ${approvedFiles.length} approved lessons to market`);

    const marketingAssets = [];

    for (const filePath of approvedFiles) {
      console.log(`\n📢 Creating marketing assets for: ${path.basename(filePath)}`);

      const lesson = await parseLessonFile(filePath);

      // Generate platform hooks
      console.log('  🎯 Generating platform hooks...');
      const platformHooks = await generatePlatformHooks(lesson, brandProfile);

      // Generate micro-challenges
      console.log('  🎮 Creating micro-challenges...');
      const microChallenges = await generateMicroChallenges(lesson);

      // Create comprehensive marketing package
      const marketingPackage = {
        lesson_id: lesson.metadata.id,
        lesson_title: lesson.metadata.title,
        created: new Date().toISOString(),
        platform_hooks: platformHooks,
        micro_challenges: microChallenges,
        engagement_metrics: {
          estimated_reach: 1000,
          engagement_rate: 0.05,
          conversion_rate: 0.02
        },
        campaign_suggestions: [
          'Launch with Twitter thread',
          'Create Instagram story highlights',
          'Share in relevant LinkedIn groups',
          'Post in Bitcoin education communities'
        ]
      };

      // Save marketing assets
      const marketingFileName = `marketing_${lesson.metadata.id}.json`;
      const marketingPath = path.join('workspace', 'marketing', marketingFileName);
      await fs.mkdir(path.dirname(marketingPath), { recursive: true });
      await fs.writeFile(marketingPath, JSON.stringify(marketingPackage, null, 2));

      // Create platform-specific files
      for (const hook of platformHooks) {
        const platformFileName = `${lesson.metadata.id}_${hook.platform}.txt`;
        const platformPath = path.join('workspace', 'marketing', 'platforms', platformFileName);
        await fs.mkdir(path.dirname(platformPath), { recursive: true });

        const platformContent = `Platform: ${hook.platform.toUpperCase()}
Content Type: ${hook.content_type}

${hook.content}

Call to Action: ${hook.call_to_action}

Visual Suggestions:
${hook.visual_suggestions.map(v => `- ${v}`).join('\n')}

Hashtags: ${hook.hashtags.join(' #')}`;

        await fs.writeFile(platformPath, platformContent);
      }

      marketingAssets.push({
        lesson: lesson.metadata.title,
        marketingPath,
        hooks: platformHooks.length,
        challenges: microChallenges.length
      });

      console.log(`  ✅ Marketing package created: ${marketingPath}`);
    }

    // Create master marketing schedule
    const masterSchedule = {
      created: new Date().toISOString(),
      total_lessons: approvedFiles.length,
      total_assets: marketingAssets.length,
      scheduling_suggestions: [
        'Week 1: Launch with social media teasers',
        'Week 2: Release lesson + challenges',
        'Week 3: Community engagement push',
        'Week 4: Results analysis and optimization'
      ],
      automation_hooks: {
        'new_lesson_approved': 'auto_generate_marketing_assets',
        'challenge_completed': 'send_congratulations_message',
        'milestone_reached': 'unlock_bonus_content'
      },
      assets: marketingAssets
    };

    const schedulePath = path.join('workspace', 'marketing', 'master_schedule.json');
    await fs.writeFile(schedulePath, JSON.stringify(masterSchedule, null, 2));

    console.log('\n🎉 Marketing Pipeline completed!');
    console.log(`📊 Results:`);
    console.log(`   📢 Marketing packages: ${marketingAssets.length}`);
    console.log(`   🎯 Platform hooks: ${marketingAssets.reduce((sum, a) => sum + a.hooks, 0)}`);
    console.log(`   🎮 Micro-challenges: ${marketingAssets.reduce((sum, a) => sum + a.challenges, 0)}`);

    console.log('\nNext steps:');
    console.log('- Review marketing assets in workspace/marketing/');
    console.log('- Schedule content using master_schedule.json');
    console.log('- Run: npm run eval:run');

    return {
      success: true,
      processedFiles: marketingAssets.length,
      totalHooks: marketingAssets.reduce((sum, a) => sum + a.hooks, 0),
      totalChallenges: marketingAssets.reduce((sum, a) => sum + a.challenges, 0),
      assets: marketingAssets
    };

  } catch (error) {
    console.error('❌ Marketing Pipeline failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runMarketingPipeline()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMarketingPipeline };