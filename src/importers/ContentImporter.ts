import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { ContentImprovementEngine } from '../agents/ContentImprovementEngine.js';
import { ContentPhilosophyAnalyzer } from '../agents/ContentPhilosophyAnalyzer.js';
import { CanvaDesignAnalyzer } from '../agents/CanvaDesignAnalyzer.js';
import { NotionContentAnalyzer } from '../agents/NotionContentAnalyzer.js';
import { GPTInstructionsAnalyzer } from '../agents/GPTInstructionsAnalyzer.js';
import winston from 'winston';

export interface ImportedContent {
  source: 'canva' | 'notion' | 'gpt';
  id: string;
  name: string;
  type: string;
  data: any;
  imported_at: string;
  status: 'imported' | 'analyzed' | 'error';
}

export interface ImportResults {
  total_imported: number;
  successful: number;
  failed: number;
  sources: {
    canva: number;
    notion: number;
    gpt: number;
  };
  imported_content: ImportedContent[];
}

export class ContentImporter {
  private logger: winston.Logger;
  private config: any;
  private contentEngine: ContentImprovementEngine;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: './logs/content-import.log' }),
        new winston.transports.Console()
      ],
    });

    // Load configuration
    try {
      this.config = JSON.parse(readFileSync('./content-sources/config.json', 'utf-8'));
    } catch (error) {
      this.logger.error('Configuration not found. Run npm run setup:content-sources first');
      throw error;
    }

    // Initialize analysis engines
    const philosophyAnalyzer = new ContentPhilosophyAnalyzer();
    const canvaAnalyzer = new CanvaDesignAnalyzer(philosophyAnalyzer);
    const notionAnalyzer = new NotionContentAnalyzer(philosophyAnalyzer);
    const gptAnalyzer = new GPTInstructionsAnalyzer(philosophyAnalyzer);

    this.contentEngine = new ContentImprovementEngine(
      philosophyAnalyzer,
      canvaAnalyzer,
      notionAnalyzer,
      gptAnalyzer
    );
  }

  async importAllContent(): Promise<ImportResults> {
    this.logger.info('Starting comprehensive content import');
    
    const results: ImportResults = {
      total_imported: 0,
      successful: 0,
      failed: 0,
      sources: { canva: 0, notion: 0, gpt: 0 },
      imported_content: []
    };

    try {
      // Import from each enabled source
      if (this.config.canva.enabled) {
        const canvaResults = await this.importCanvaContent();
        results.sources.canva = canvaResults.length;
        results.imported_content.push(...canvaResults);
      }

      if (this.config.notion.enabled) {
        const notionResults = await this.importNotionContent();
        results.sources.notion = notionResults.length;
        results.imported_content.push(...notionResults);
      }

      if (this.config.gpts.enabled) {
        const gptResults = await this.importGPTContent();
        results.sources.gpt = gptResults.length;
        results.imported_content.push(...gptResults);
      }

      // Calculate totals
      results.total_imported = results.imported_content.length;
      results.successful = results.imported_content.filter(c => c.status === 'imported').length;
      results.failed = results.imported_content.filter(c => c.status === 'error').length;

      // Save import results
      this.saveImportResults(results);
      
      this.logger.info('Content import completed', {
        total: results.total_imported,
        successful: results.successful,
        failed: results.failed
      });

      return results;
      
    } catch (error) {
      this.logger.error('Content import failed', error);
      throw error;
    }
  }

  async importCanvaContent(): Promise<ImportedContent[]> {
    this.logger.info('Importing Canva content');
    const imported: ImportedContent[] = [];

    try {
      if (this.config.canva.api_token) {
        // Use Canva API
        imported.push(...await this.importCanvaFromAPI());
      } else {
        // Import from manual exports
        imported.push(...await this.importCanvaFromFiles());
      }
    } catch (error) {
      this.logger.error('Canva import failed', error);
    }

    return imported;
  }

  private async importCanvaFromAPI(): Promise<ImportedContent[]> {
    const imported: ImportedContent[] = [];
    
    try {
      const headers = {
        'Authorization': `Bearer ${this.config.canva.api_token}`,
        'Content-Type': 'application/json'
      };

      // Get user's designs (simplified - actual API calls would be more complex)
      const response = await axios.get('https://api.canva.com/rest/v1/designs', { headers });
      
      for (const design of response.data.data || []) {
        try {
          // Get design details
          const designResponse = await axios.get(
            `https://api.canva.com/rest/v1/designs/${design.id}`, 
            { headers }
          );
          
          const importedContent: ImportedContent = {
            source: 'canva',
            id: design.id,
            name: design.title || 'Untitled Design',
            type: design.design_type || 'design',
            data: {
              ...designResponse.data,
              template_type: 'educational_slide', // Default assumption
              elements: designResponse.data.elements || [],
              text_content: this.extractTextFromDesign(designResponse.data),
              visual_elements: this.extractVisualElements(designResponse.data)
            },
            imported_at: new Date().toISOString(),
            status: 'imported'
          };

          imported.push(importedContent);
          this.logger.info(`Imported Canva design: ${design.title}`);

        } catch (error) {
          this.logger.error(`Failed to import design ${design.id}`, error);
          imported.push({
            source: 'canva',
            id: design.id,
            name: design.title || 'Unknown',
            type: 'design',
            data: null,
            imported_at: new Date().toISOString(),
            status: 'error'
          });
        }
      }
    } catch (error) {
      this.logger.error('Canva API import failed', error);
    }

    return imported;
  }

  private async importCanvaFromFiles(): Promise<ImportedContent[]> {
    const imported: ImportedContent[] = [];
    const canvaDir = './content-sources/canva';
    
    if (!existsSync(canvaDir)) {
      this.logger.warn('Canva content directory not found');
      return imported;
    }

    const files = readdirSync(canvaDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const filePath = join(canvaDir, file);
        const designData = JSON.parse(readFileSync(filePath, 'utf-8'));
        
        const importedContent: ImportedContent = {
          source: 'canva',
          id: designData.id || file.replace('.json', ''),
          name: designData.title || designData.name || file,
          type: designData.template_type || 'design',
          data: designData,
          imported_at: new Date().toISOString(),
          status: 'imported'
        };

        imported.push(importedContent);
        this.logger.info(`Imported Canva file: ${file}`);

      } catch (error) {
        this.logger.error(`Failed to import Canva file ${file}`, error);
      }
    }

    return imported;
  }

  async importNotionContent(): Promise<ImportedContent[]> {
    this.logger.info('Importing Notion content');
    const imported: ImportedContent[] = [];

    if (!this.config.notion.token) {
      this.logger.warn('Notion token not configured');
      return imported;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${this.config.notion.token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      };

      for (const databaseId of this.config.notion.database_ids) {
        try {
          // Query database
          const response = await axios.post(
            `https://api.notion.com/v1/databases/${databaseId}/query`,
            {},
            { headers }
          );

          for (const page of response.data.results || []) {
            try {
              // Get page content
              const pageResponse = await axios.get(
                `https://api.notion.com/v1/blocks/${page.id}/children`,
                { headers }
              );

              const importedContent: ImportedContent = {
                source: 'notion',
                id: page.id,
                name: this.getNotionPageTitle(page),
                type: 'page',
                data: {
                  page_properties: page.properties,
                  blocks: pageResponse.data.results,
                  content_structure: this.analyzeNotionStructure(pageResponse.data.results),
                  text_content: this.extractNotionText(pageResponse.data.results)
                },
                imported_at: new Date().toISOString(),
                status: 'imported'
              };

              imported.push(importedContent);
              this.logger.info(`Imported Notion page: ${importedContent.name}`);

            } catch (error) {
              this.logger.error(`Failed to import Notion page ${page.id}`, error);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to query Notion database ${databaseId}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Notion import failed', error);
    }

    return imported;
  }

  async importGPTContent(): Promise<ImportedContent[]> {
    this.logger.info('Importing GPT content');
    const imported: ImportedContent[] = [];

    try {
      if (this.config.gpts.openai_key) {
        // Import from OpenAI API
        imported.push(...await this.importGPTsFromAPI());
      } else {
        // Import from manual config files
        imported.push(...await this.importGPTsFromFiles());
      }
    } catch (error) {
      this.logger.error('GPT import failed', error);
    }

    return imported;
  }

  private async importGPTsFromAPI(): Promise<ImportedContent[]> {
    const imported: ImportedContent[] = [];
    
    try {
      const headers = {
        'Authorization': `Bearer ${this.config.gpts.openai_key}`,
        'Content-Type': 'application/json'
      };

      // This would use actual OpenAI API to get GPT configurations
      // For now, we'll use manual files as the API might not expose this data
      this.logger.info('OpenAI API import not yet implemented, falling back to file import');
      return await this.importGPTsFromFiles();

    } catch (error) {
      this.logger.error('GPT API import failed', error);
      return [];
    }
  }

  private async importGPTsFromFiles(): Promise<ImportedContent[]> {
    const imported: ImportedContent[] = [];
    const gptsDir = './content-sources/gpts';
    
    if (!existsSync(gptsDir)) {
      this.logger.warn('GPTs content directory not found');
      return imported;
    }

    const files = readdirSync(gptsDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const filePath = join(gptsDir, file);
        const gptConfig = JSON.parse(readFileSync(filePath, 'utf-8'));
        
        const importedContent: ImportedContent = {
          source: 'gpt',
          id: gptConfig.id || file.replace('.json', ''),
          name: gptConfig.name || file,
          type: 'custom_gpt',
          data: {
            ...gptConfig,
            instruction_analysis: this.analyzeGPTInstructions(gptConfig.instructions || ''),
            conversation_flow: this.analyzeConversationFlow(gptConfig.conversation_starters || [])
          },
          imported_at: new Date().toISOString(),
          status: 'imported'
        };

        imported.push(importedContent);
        this.logger.info(`Imported GPT config: ${file}`);

      } catch (error) {
        this.logger.error(`Failed to import GPT file ${file}`, error);
      }
    }

    return imported;
  }

  private extractTextFromDesign(designData: any): string {
    // Extract text content from Canva design data
    const textElements: string[] = [];
    
    if (designData.elements) {
      for (const element of designData.elements) {
        if (element.type === 'text' && element.content) {
          textElements.push(element.content);
        }
      }
    }
    
    return textElements.join(' ');
  }

  private extractVisualElements(designData: any): any[] {
    // Extract visual elements from Canva design data
    const visualElements: any[] = [];
    
    if (designData.elements) {
      for (const element of designData.elements) {
        if (['image', 'shape', 'icon', 'chart'].includes(element.type)) {
          visualElements.push(element);
        }
      }
    }
    
    return visualElements;
  }

  private getNotionPageTitle(page: any): string {
    // Extract title from Notion page properties
    if (page.properties && page.properties.title) {
      const titleProp = page.properties.title.title || page.properties.title.rich_text;
      if (titleProp && titleProp.length > 0) {
        return titleProp[0].plain_text || 'Untitled';
      }
    }
    
    // Try other common title properties
    for (const [key, value] of Object.entries(page.properties || {})) {
      if (key.toLowerCase().includes('title') || key.toLowerCase().includes('name')) {
        if ((value as any).title || (value as any).rich_text) {
          const textArray = (value as any).title || (value as any).rich_text;
          if (textArray.length > 0) {
            return textArray[0].plain_text || 'Untitled';
          }
        }
      }
    }
    
    return 'Untitled Page';
  }

  private analyzeNotionStructure(blocks: any[]): any {
    // Analyze the structure of Notion content
    const structure = {
      headings: [],
      lists: [],
      toggles: [],
      callouts: [],
      interactive_elements: 0,
      text_blocks: 0,
      total_blocks: blocks.length
    };

    for (const block of blocks) {
      switch (block.type) {
        case 'heading_1':
        case 'heading_2':
        case 'heading_3':
          structure.headings.push({
            level: parseInt(block.type.split('_')[1]),
            text: this.extractBlockText(block)
          });
          break;
        case 'bulleted_list_item':
        case 'numbered_list_item':
          structure.lists.push(this.extractBlockText(block));
          break;
        case 'toggle':
          structure.toggles.push(this.extractBlockText(block));
          structure.interactive_elements++;
          break;
        case 'callout':
          structure.callouts.push(this.extractBlockText(block));
          break;
        case 'paragraph':
          structure.text_blocks++;
          break;
      }
    }

    return structure;
  }

  private extractNotionText(blocks: any[]): string {
    const textContent: string[] = [];
    
    for (const block of blocks) {
      const text = this.extractBlockText(block);
      if (text) textContent.push(text);
    }
    
    return textContent.join('\\n');
  }

  private extractBlockText(block: any): string {
    if (block[block.type] && block[block.type].rich_text) {
      return block[block.type].rich_text
        .map((text: any) => text.plain_text)
        .join('');
    }
    return '';
  }

  private analyzeGPTInstructions(instructions: string): any {
    return {
      length: instructions.length,
      sections: instructions.split('\\n\\n').length,
      socratic_keywords: this.countSocraticKeywords(instructions),
      jargon_level: this.assessJargonLevel(instructions),
      teaching_approach: this.identifyTeachingApproach(instructions)
    };
  }

  private analyzeConversationFlow(starters: string[]): any {
    return {
      total_starters: starters.length,
      question_based: starters.filter(s => s.includes('?')).length,
      action_based: starters.filter(s => s.toLowerCase().includes('help') || s.toLowerCase().includes('show')).length,
      beginner_friendly: starters.filter(s => s.toLowerCase().includes('basic') || s.toLowerCase().includes('start')).length
    };
  }

  private countSocraticKeywords(text: string): number {
    const socraticKeywords = ['why', 'how', 'what if', 'consider', 'think about', 'explore', 'discover'];
    return socraticKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
  }

  private assessJargonLevel(text: string): 'low' | 'medium' | 'high' {
    const words = text.split(' ');
    const technicalTerms = words.filter(word => 
      word.length > 8 && word.includes('tion') || word.includes('ment')
    ).length;
    
    const jargonRatio = technicalTerms / words.length;
    
    if (jargonRatio > 0.1) return 'high';
    if (jargonRatio > 0.05) return 'medium';
    return 'low';
  }

  private identifyTeachingApproach(instructions: string): string[] {
    const approaches = [];
    const text = instructions.toLowerCase();
    
    if (text.includes('socratic') || text.includes('question')) approaches.push('socratic');
    if (text.includes('step') || text.includes('gradual')) approaches.push('step_by_step');
    if (text.includes('example') || text.includes('analogy')) approaches.push('example_based');
    if (text.includes('simple') || text.includes('beginner')) approaches.push('simplified');
    if (text.includes('interactive') || text.includes('engage')) approaches.push('interactive');
    
    return approaches;
  }

  private saveImportResults(results: ImportResults): void {
    const outputDir = this.config.analysis_settings.output_directory;
    const resultsFile = join(outputDir, 'import-results.json');
    
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    // Also save individual content files for analysis
    const contentDir = join(outputDir, 'imported-content');
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }
    
    for (const content of results.imported_content) {
      const fileName = `${content.source}-${content.id}.json`;
      writeFileSync(
        join(contentDir, fileName),
        JSON.stringify(content, null, 2)
      );
    }
    
    this.logger.info(`Import results saved to ${resultsFile}`);
  }

  async analyzeImportedContent(): Promise<void> {
    this.logger.info('Analyzing imported content with philosophy system');
    
    try {
      // Load imported content
      const resultsFile = join(this.config.analysis_settings.output_directory, 'import-results.json');
      if (!existsSync(resultsFile)) {
        throw new Error('No import results found. Run import first.');
      }
      
      const importResults: ImportResults = JSON.parse(readFileSync(resultsFile, 'utf-8'));
      
      // Add content to analysis engine
      for (const content of importResults.imported_content) {
        if (content.status === 'imported') {
          // Map source to platform type
          let platform: 'canva' | 'notion' | 'chatgpt' | 'custom_gpt';
          switch (content.source) {
            case 'canva':
              platform = 'canva';
              break;
            case 'notion':
              platform = 'notion';
              break;
            case 'gpt':
              platform = 'custom_gpt';
              break;
            default:
              this.logger.warn(`Unknown content source: ${content.source}, defaulting to custom_gpt`);
              platform = 'custom_gpt';
          }

          await this.contentEngine.addContentSource({
            platform: platform,
            id: content.id,
            title: content.name,
            content: content.data
          });
        }
      }
      
      // Run comprehensive analysis
      const analysisResult = await this.contentEngine.performFullAnalysis();
      
      // Save analysis results
      const analysisFile = join(this.config.analysis_settings.output_directory, 'comprehensive-analysis.json');
      writeFileSync(analysisFile, JSON.stringify(analysisResult, null, 2));
      
      this.logger.info('Content analysis completed', {
        analyzed_sources: importResults.imported_content.filter(c => c.status === 'imported').length,
        philosophy_score: analysisResult.cross_platform_insights.philosophy_consistency_score,
        improvement_plans: analysisResult.improvement_plans.length
      });
      
    } catch (error) {
      this.logger.error('Content analysis failed', error);
      throw error;
    }
  }
}

export default ContentImporter;