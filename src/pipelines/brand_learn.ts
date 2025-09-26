#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { EnhancedBrandAgent } from '../agents/EnhancedBrandAgent';

/**
 * Brand Learning Pipeline
 * Pulls Canva summaries and writes workspace/brand/brand_profile.json
 */

interface AppConfig {
  sources: {
    canva: {
      enabled: boolean;
      brand_ids: string[];
      folders: string[];
    };
  };
  style_rules: {
    brand_voice: string;
    readability_target_fk: number;
    no_hyphens: boolean;
    bilingual: string[];
  };
}

async function loadConfig(): Promise<AppConfig> {
  const configPath = path.join(process.cwd(), 'config', 'app.config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function ensureWorkspaceDirectories() {
  const workspaceDirs = [
    'workspace',
    'workspace/brand',
    'workspace/drafts',
    'workspace/approved',
    'workspace/assets',
    'workspace/marketing',
    'workspace/eval',
    'workspace/exports'
  ];

  for (const dir of workspaceDirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function runBrandLearning() {
  console.log('🎨 Starting Brand Learning Pipeline...');

  try {
    // Load configuration
    const config = await loadConfig();
    console.log('✅ Configuration loaded');

    // Ensure workspace directories exist
    await ensureWorkspaceDirectories();
    console.log('✅ Workspace directories created');

    // Initialize Enhanced Brand Agent
    const brandAgent = new EnhancedBrandAgent();
    console.log('✅ Brand Agent initialized');

    // Extract brand DNA from Canva and existing content
    console.log('🔍 Extracting brand DNA from sources...');

    const brandAnalysis = await brandAgent.executeToolCall('extract_brand_dna', {
      content_sources: [
        ...config.sources.canva.folders.map(folder => `canva://folder/${folder}`),
        'existing_content://comprehensive-bitcoin-course-system.md',
        'existing_content://agent-integration-strategy.md'
      ],
      brand_elements: [
        'visual_identity',
        'voice_tone',
        'teaching_methodology',
        'content_structure',
        'value_proposition'
      ],
      learning_focus: 'bitcoin_education'
    });

    // Create comprehensive brand guidelines
    console.log('📋 Creating brand guidelines...');

    const brandGuidelines = await brandAgent.executeToolCall('create_brand_guidelines', {
      guideline_type: 'comprehensive',
      audience_level: 'mixed',
      bitcoin_focus_areas: ['sovereignty', 'technical', 'education']
    });

    // Adapt brand for Bitcoin education
    console.log('₿ Adapting brand for Bitcoin context...');

    const bitcoinAdaptation = await brandAgent.executeToolCall('adapt_brand_for_bitcoin', {
      brand_element: 'voice_tone',
      bitcoin_context: 'educational_sovereignty',
      adaptation_goal: 'accessibility'
    });

    // Create comprehensive brand profile
    const brandProfile = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      source_analysis: brandAnalysis,
      guidelines: brandGuidelines,
      bitcoin_adaptation: bitcoinAdaptation,
      style_rules: config.style_rules,
      quick_reference: {
        voice: config.style_rules.brand_voice,
        readability_target: config.style_rules.readability_target_fk,
        bilingual_support: config.style_rules.bilingual,
        bitcoin_focus: 'Sovereignty, education, practical application',
        key_principles: [
          'Accuracy first - no misleading information',
          'Accessibility - complex concepts made simple',
          'Practical application - hands-on learning',
          'Empowerment - building confidence and capability'
        ]
      }
    };

    // Write brand profile to workspace
    const brandProfilePath = path.join('workspace', 'brand', 'brand_profile.json');
    await fs.writeFile(brandProfilePath, JSON.stringify(brandProfile, null, 2));
    console.log(`✅ Brand profile saved to ${brandProfilePath}`);

    // Generate branded templates for immediate use
    console.log('📝 Generating branded templates...');

    const templates = await brandAgent.executeToolCall('generate_branded_templates', {
      template_type: 'lesson_structure',
      bitcoin_topic: 'fundamentals',
      audience_segment: 'complete_beginner',
      brand_emphasis: 'balanced'
    });

    // Save templates
    const templatesPath = path.join('workspace', 'brand', 'templates.json');
    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2));
    console.log(`✅ Branded templates saved to ${templatesPath}`);

    console.log('🎉 Brand Learning Pipeline completed successfully!');
    console.log('\nNext steps:');
    console.log('- Review workspace/brand/brand_profile.json');
    console.log('- Run: npm run course:build');

    return {
      success: true,
      brandProfile,
      templates,
      outputPath: brandProfilePath
    };

  } catch (error) {
    console.error('❌ Brand Learning Pipeline failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runBrandLearning()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runBrandLearning };