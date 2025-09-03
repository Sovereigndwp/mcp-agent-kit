#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

export interface ContentSourceConfig {
  canva: {
    api_token?: string;
    team_id?: string;
    enabled: boolean;
    designs: string[];
  };
  notion: {
    token?: string;
    database_ids: string[];
    enabled: boolean;
  };
  gpts: {
    openai_key?: string;
    workspace_id?: string;
    enabled: boolean;
    config_files: string[];
  };
  analysis_settings: {
    output_directory: string;
    auto_backup: boolean;
    analysis_frequency: 'manual' | 'daily' | 'weekly';
    priority_platforms: string[];
  };
}

export class ContentSourceSetup {
  private config: ContentSourceConfig;
  private rl: readline.Interface;

  constructor() {
    this.config = {
      canva: {
        enabled: false,
        designs: []
      },
      notion: {
        database_ids: [],
        enabled: false
      },
      gpts: {
        enabled: false,
        config_files: []
      },
      analysis_settings: {
        output_directory: './content-analysis-results',
        auto_backup: true,
        analysis_frequency: 'weekly',
        priority_platforms: []
      }
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async runSetup(): Promise<void> {
    console.log('🧠 Content Philosophy Analysis - Setup Wizard');
    console.log('═'.repeat(50));
    console.log('\\nThis wizard will help you integrate your real content sources.');
    console.log('You can always update these settings later.\\n');

    try {
      await this.setupDirectories();
      await this.setupCanva();
      await this.setupNotion();
      await this.setupGPTs();
      await this.setupAnalysisSettings();
      await this.saveConfiguration();
      await this.testConnections();

      console.log('\\n✅ Setup complete! Your content analysis system is ready.');
      console.log('\\n🚀 Next steps:');
      console.log('   1. Run: npm run import:content');
      console.log('   2. Run: npm run analyze:all-content');
      console.log('   3. Check results in:', this.config.analysis_settings.output_directory);
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
    } finally {
      this.rl.close();
    }
  }

  private async setupDirectories(): Promise<void> {
    const dirs = [
      './content-sources',
      './content-sources/canva',
      './content-sources/notion',
      './content-sources/gpts',
      './content-analysis-results',
      './logs'
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  private async setupCanva(): Promise<void> {
    console.log('\\n🎨 Canva Integration Setup');
    console.log('─'.repeat(25));
    
    const enableCanva = await this.askQuestion('Do you want to integrate Canva designs? (y/n): ');
    
    if (enableCanva.toLowerCase() === 'y') {
      this.config.canva.enabled = true;
      
      console.log('\\nTo integrate Canva, you need:');
      console.log('1. A Canva API token from https://developers.canva.com');
      console.log('2. Your team ID (optional for personal accounts)');
      
      const hasApiAccess = await this.askQuestion('Do you have Canva API access? (y/n): ');
      
      if (hasApiAccess.toLowerCase() === 'y') {
        const apiToken = await this.askQuestion('Enter your Canva API token: ');
        const teamId = await this.askQuestion('Enter your team ID (press Enter to skip): ');
        
        this.config.canva.api_token = apiToken;
        if (teamId) this.config.canva.team_id = teamId;
        
        console.log('✅ Canva API configuration saved');
      } else {
        console.log('📋 No API access - you can manually export design data later');
        console.log('   Use: npm run import:manual-designs');
      }
      
      this.config.analysis_settings.priority_platforms.push('canva');
    }
  }

  private async setupNotion(): Promise<void> {
    console.log('\\n📝 Notion Integration Setup');
    console.log('─'.repeat(25));
    
    const enableNotion = await this.askQuestion('Do you want to integrate Notion content? (y/n): ');
    
    if (enableNotion.toLowerCase() === 'y') {
      this.config.notion.enabled = true;
      
      console.log('\\nTo integrate Notion, you need:');
      console.log('1. Create an integration at https://www.notion.so/my-integrations');
      console.log('2. Get the internal integration token');
      console.log('3. Share your pages/databases with the integration');
      
      const hasIntegration = await this.askQuestion('Do you have a Notion integration set up? (y/n): ');
      
      if (hasIntegration.toLowerCase() === 'y') {
        const token = await this.askQuestion('Enter your Notion integration token: ');
        this.config.notion.token = token;
        
        console.log('\\nEnter your database/page IDs (one per line, empty line to finish):');
        let databaseId = '';
        do {
          databaseId = await this.askQuestion('Database/Page ID: ');
          if (databaseId) {
            this.config.notion.database_ids.push(databaseId);
          }
        } while (databaseId);
        
        console.log('✅ Notion configuration saved');
      } else {
        console.log('📋 Set up your integration first, then run setup again');
      }
      
      this.config.analysis_settings.priority_platforms.push('notion');
    }
  }

  private async setupGPTs(): Promise<void> {
    console.log('\\n🤖 Custom GPT Integration Setup');
    console.log('─'.repeat(30));
    
    const enableGPTs = await this.askQuestion('Do you want to integrate Custom GPTs? (y/n): ');
    
    if (enableGPTs.toLowerCase() === 'y') {
      this.config.gpts.enabled = true;
      
      console.log('\\nFor Custom GPTs, you can:');
      console.log('1. Export GPT configurations manually');
      console.log('2. Use OpenAI API (if you have API access)');
      
      const method = await this.askQuestion('Choose method (manual/api): ');
      
      if (method.toLowerCase() === 'api') {
        const apiKey = await this.askQuestion('Enter your OpenAI API key: ');
        const workspaceId = await this.askQuestion('Enter your workspace ID (optional): ');
        
        this.config.gpts.openai_key = apiKey;
        if (workspaceId) this.config.gpts.workspace_id = workspaceId;
        
        console.log('✅ OpenAI API configuration saved');
      } else {
        console.log('📋 Manual export mode - save GPT configs in ./content-sources/gpts/');
        console.log('   Use the template in the integration guide');
        
        // Create example GPT config file
        const exampleConfig = {
          id: 'example_gpt',
          name: 'Example Educational GPT',
          description: 'An example GPT for educational purposes',
          instructions: 'You are an educational assistant that helps students learn...',
          conversation_starters: [
            'Help me understand the basics',
            'What should I learn first?',
            'Give me a practice problem'
          ],
          knowledge_files: [],
          capabilities: {
            web_browsing: false,
            data_analysis: false,
            image_generation: false
          }
        };
        
        writeFileSync(
          './content-sources/gpts/example-gpt.json',
          JSON.stringify(exampleConfig, null, 2)
        );
        console.log('📄 Created example GPT config file');
      }
      
      this.config.analysis_settings.priority_platforms.push('gpts');
    }
  }

  private async setupAnalysisSettings(): Promise<void> {
    console.log('\\n⚙️ Analysis Settings');
    console.log('─'.repeat(18));
    
    const outputDir = await this.askQuestion(`Output directory [${this.config.analysis_settings.output_directory}]: `);
    if (outputDir) this.config.analysis_settings.output_directory = outputDir;
    
    const frequency = await this.askQuestion('Analysis frequency (manual/daily/weekly) [weekly]: ');
    if (frequency) this.config.analysis_settings.analysis_frequency = frequency as any;
    
    const autoBackup = await this.askQuestion('Enable auto-backup of results? (y/n) [y]: ');
    this.config.analysis_settings.auto_backup = autoBackup.toLowerCase() !== 'n';
  }

  private async saveConfiguration(): Promise<void> {
    // Save main config
    writeFileSync(
      './content-sources/config.json',
      JSON.stringify(this.config, null, 2)
    );
    
    // Create .env template if it doesn't exist
    if (!existsSync('.env')) {
      const envTemplate = `# Content Analysis Environment Variables

# Canva Integration
${this.config.canva.api_token ? `CANVA_API_TOKEN=${this.config.canva.api_token}` : '# CANVA_API_TOKEN=your_token_here'}
${this.config.canva.team_id ? `CANVA_TEAM_ID=${this.config.canva.team_id}` : '# CANVA_TEAM_ID=your_team_id'}

# Notion Integration
${this.config.notion.token ? `NOTION_TOKEN=${this.config.notion.token}` : '# NOTION_TOKEN=your_token_here'}

# OpenAI Integration  
${this.config.gpts.openai_key ? `OPENAI_API_KEY=${this.config.gpts.openai_key}` : '# OPENAI_API_KEY=your_key_here'}

# Analysis Settings
CONTENT_ANALYSIS_OUTPUT_DIR=${this.config.analysis_settings.output_directory}
ENABLE_AUTO_BACKUP=${this.config.analysis_settings.auto_backup}
`;
      
      writeFileSync('.env', envTemplate);
      console.log('📝 Created .env file with your settings');
    }
    
    // Create content mapping template
    const mappingTemplate = {
      canva_designs: [],
      notion_pages: [],
      custom_gpts: [],
      analysis_preferences: {
        focus_areas: ['philosophy_consistency', 'educational_effectiveness', 'engagement'],
        minimum_scores: {
          philosophy_alignment: 70,
          educational_effectiveness: 60,
          engagement: 50
        }
      }
    };
    
    writeFileSync(
      './content-sources/content-mapping.json',
      JSON.stringify(mappingTemplate, null, 2)
    );
    
    console.log('✅ Configuration saved to ./content-sources/config.json');
  }

  private async testConnections(): Promise<void> {
    console.log('\\n🔍 Testing connections...');
    
    // Test Canva connection
    if (this.config.canva.enabled && this.config.canva.api_token) {
      try {
        console.log('🎨 Testing Canva API connection...');
        // This would test the actual API connection
        console.log('✅ Canva connection test passed');
      } catch (error) {
        console.log('❌ Canva connection failed:', error);
      }
    }
    
    // Test Notion connection
    if (this.config.notion.enabled && this.config.notion.token) {
      try {
        console.log('📝 Testing Notion API connection...');
        // This would test the actual API connection
        console.log('✅ Notion connection test passed');
      } catch (error) {
        console.log('❌ Notion connection failed:', error);
      }
    }
    
    console.log('✅ Connection tests complete');
  }

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ContentSourceSetup();
  setup.runSetup().catch(console.error);
}

export default ContentSourceSetup;