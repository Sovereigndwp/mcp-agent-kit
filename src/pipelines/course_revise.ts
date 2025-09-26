#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { MasterAccuracySystem } from '../agents/MasterAccuracySystem';
import { EnhancedBrandAgent } from '../agents/EnhancedBrandAgent';

/**
 * Course Revision Pipeline
 * Performs readability pass, fact flags [VERIFY], philosophy consistency
 */

interface LessonMetadata {
  id: string;
  title: string;
  readability_score: number | null;
  brand_compliance: string;
  fact_verification_status: string;
  revision_notes: string[];
  approved: boolean;
}

interface AppConfig {
  style_rules: {
    readability_target_fk: number;
    brand_voice: string;
    bilingual: string[];
  };
  fact_rules: {
    bitcoin_only: boolean;
    must_cite: string[];
  };
}

async function loadConfig(): Promise<AppConfig> {
  const configPath = path.join(process.cwd(), 'config', 'app.config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function loadBrandProfile() {
  const brandPath = path.join('workspace', 'brand', 'brand_profile.json');
  try {
    const brandData = await fs.readFile(brandPath, 'utf-8');
    return JSON.parse(brandData);
  } catch (error) {
    console.log('⚠️  Brand profile not found. Run: npm run brand:learn first');
    throw new Error('Brand profile required. Run brand:learn pipeline first.');
  }
}

async function getDraftFiles(): Promise<string[]> {
  const draftsDir = path.join('workspace', 'drafts');
  try {
    const files = await fs.readdir(draftsDir);
    return files.filter(file => file.endsWith('.md')).map(file => path.join(draftsDir, file));
  } catch (error) {
    console.log('⚠️  No drafts directory found. Run: npm run course:build first');
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

async function calculateReadabilityScore(content: string): Promise<number> {
  // Simplified Flesch-Kincaid calculation
  const sentences = content.split(/[.!?]+/).length - 1;
  const words = content.split(/\s+/).length;
  const syllables = content.split(/[aeiouAEIOU]/).length - 1;

  if (sentences === 0 || words === 0) return 0;

  const avgSentenceLength = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const fleschKincaid = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  return Math.round(fleschKincaid);
}

async function addFactVerificationFlags(content: string): Promise<string> {
  // Add [VERIFY] flags to statements that need fact-checking
  const patterns = [
    /(\d+%|\d+\.\d+%)/g, // Percentages
    /(\$\d+|\d+\s*(bitcoin|BTC|satoshis?))/gi, // Financial amounts
    /(in \d{4}|since \d{4}|by \d{4})/gi, // Years/dates
    /(always|never|all|every|most|majority of)/gi, // Absolute claims
    /(is safe|is secure|guaranteed|ensures|prevents)/gi, // Security claims
  ];

  let flaggedContent = content;

  patterns.forEach(pattern => {
    flaggedContent = flaggedContent.replace(pattern, (match) => {
      // Don't add duplicate flags
      if (flaggedContent.includes(`${match} [VERIFY]`)) return match;
      return `${match} [VERIFY]`;
    });
  });

  return flaggedContent;
}

async function runCourseRevision() {
  console.log('📝 Starting Course Revision Pipeline...');

  try {
    // Load configuration and brand profile
    const config = await loadConfig();
    const brandProfile = await loadBrandProfile();
    console.log('✅ Configuration and brand profile loaded');

    // Initialize agents
    const accuracySystem = new MasterAccuracySystem();
    const brandAgent = new EnhancedBrandAgent();
    console.log('✅ Revision agents initialized');

    // Get draft files
    const draftFiles = await getDraftFiles();
    if (draftFiles.length === 0) {
      console.log('ℹ️  No draft files found to revise');
      return { success: true, processedFiles: 0 };
    }

    console.log(`📋 Found ${draftFiles.length} draft files to revise`);

    const revisedFiles = [];

    for (const filePath of draftFiles) {
      console.log(`\n🔍 Revising: ${path.basename(filePath)}`);

      const { metadata, lessonContent } = await parseLessonFile(filePath);

      // Step 1: Readability Analysis
      console.log('  📖 Analyzing readability...');
      const readabilityScore = await calculateReadabilityScore(lessonContent);
      const readabilityTarget = config.style_rules.readability_target_fk;

      // Step 2: Fact Verification Flagging
      console.log('  🔍 Adding fact verification flags...');
      const flaggedContent = await addFactVerificationFlags(lessonContent);

      // Step 3: Brand Consistency Check
      console.log('  🎨 Checking brand consistency...');
      const brandCheck = await brandAgent.executeToolCall('evaluate_brand_consistency', {
        content: lessonContent,
        brand_guidelines: brandProfile.guidelines,
        voice_tone_target: config.style_rules.brand_voice
      });

      // Step 4: Content Accuracy Validation
      console.log('  ✅ Validating technical accuracy...');
      const accuracyCheck = await accuracySystem.executeToolCall('validate_bitcoin_technical_content', {
        content: lessonContent,
        validation_level: 'comprehensive',
        cross_reference_sources: true
      });

      // Determine if content needs revision
      const needsRevision =
        readabilityScore < readabilityTarget - 10 ||
        brandCheck.consistency_score < 80 ||
        accuracyCheck.accuracy_score < 95;

      // Update metadata
      const updatedMetadata: LessonMetadata = {
        ...metadata,
        readability_score: readabilityScore,
        brand_compliance: brandCheck.consistency_score >= 80 ? 'approved' : 'needs_revision',
        fact_verification_status: accuracyCheck.accuracy_score >= 95 ? 'validated' : 'needs_verification',
        revision_notes: [
          `Readability: ${readabilityScore} (target: ${readabilityTarget})`,
          `Brand consistency: ${brandCheck.consistency_score}%`,
          `Technical accuracy: ${accuracyCheck.accuracy_score}%`,
          ...(brandCheck.improvement_suggestions || []),
          ...(accuracyCheck.flagged_claims || [])
        ],
        approved: !needsRevision
      };

      // Create revised content
      const revisedContent = `---
${JSON.stringify(updatedMetadata, null, 2)}
---

${flaggedContent}`;

      // Save to appropriate directory
      const outputDir = updatedMetadata.approved ?
        path.join('workspace', 'approved') :
        path.join('workspace', 'drafts');

      await fs.mkdir(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, path.basename(filePath));
      await fs.writeFile(outputPath, revisedContent);

      // Remove from drafts if approved
      if (updatedMetadata.approved && outputDir.includes('approved')) {
        await fs.unlink(filePath);
      }

      revisedFiles.push({
        original: filePath,
        revised: outputPath,
        approved: updatedMetadata.approved,
        readabilityScore,
        needsRevision
      });

      console.log(`  ✅ ${updatedMetadata.approved ? 'Approved' : 'Needs revision'}: ${outputPath}`);
    }

    // Summary
    const approvedCount = revisedFiles.filter(f => f.approved).length;
    const needsWorkCount = revisedFiles.length - approvedCount;

    console.log('\n🎉 Course Revision Pipeline completed!');
    console.log(`📊 Results:`);
    console.log(`   ✅ Approved: ${approvedCount} lessons`);
    console.log(`   📝 Needs revision: ${needsWorkCount} lessons`);

    if (needsWorkCount > 0) {
      console.log('\nNext steps:');
      console.log('- Review lessons needing revision in workspace/drafts/');
      console.log('- Address [VERIFY] flags with proper citations');
      console.log('- Run: npm run course:revise again after fixes');
    } else {
      console.log('\nNext steps:');
      console.log('- Review approved lessons in workspace/approved/');
      console.log('- Run: npm run marketing:run');
    }

    return {
      success: true,
      processedFiles: revisedFiles.length,
      approved: approvedCount,
      needsRevision: needsWorkCount,
      files: revisedFiles
    };

  } catch (error) {
    console.error('❌ Course Revision Pipeline failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runCourseRevision()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runCourseRevision };