// Improve Canva Folder - Connect to your specific folder and enhance designs
import { canvaTools } from '../tools/canva_api.js';
import { CanvaAutoDesigner } from './canva_auto_designer.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface FolderAnalysis {
  folder_id: string;
  designs: any[];
  bitcoin_related: any[];
  improvement_suggestions: string[];
  live_data_opportunities: string[];
}

class CanvaFolderImprover {
  private folderId: string;
  private designer: CanvaAutoDesigner;

  constructor(folderId: string = 'FAFxTnM3zZU') {
    this.folderId = folderId;
    this.designer = new CanvaAutoDesigner();
  }

  /**
   * Extract folder ID from Canva URL
   */
  static extractFolderIdFromUrl(url: string): string {
    const match = url.match(/folder\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : '';
  }

  /**
   * Analyze your current Canva folder
   */
  async analyzeFolder(): Promise<FolderAnalysis> {
    console.log(`🔍 Analyzing your Canva folder: ${this.folderId}`);
    
    try {
      // Get designs from your specific folder
      const result = await canvaTools.listDesigns({
        folder_id: this.folderId,
        limit: 50
      });

      if (!result.success) {
        throw new Error(`Failed to access folder: ${result.error}`);
      }

      const designs = result.data.designs || [];
      console.log(`   Found ${designs.length} designs in your folder`);

      // Identify Bitcoin-related designs
      const bitcoinKeywords = ['bitcoin', 'btc', 'crypto', 'blockchain', 'satoshi', 'fee', 'wallet', 'mining'];
      const bitcoinRelated = designs.filter((design: any) => 
        bitcoinKeywords.some(keyword => 
          design.title?.toLowerCase().includes(keyword) ||
          design.description?.toLowerCase().includes(keyword)
        )
      );

      // Generate improvement suggestions
      const improvements = this.generateImprovementSuggestions(designs, bitcoinRelated);
      const liveDataOpps = this.identifyLiveDataOpportunities(designs);

      return {
        folder_id: this.folderId,
        designs,
        bitcoin_related: bitcoinRelated,
        improvement_suggestions: improvements,
        live_data_opportunities: liveDataOpps
      };

    } catch (error) {
      console.error('❌ Failed to analyze folder:', error);
      throw error;
    }
  }

  /**
   * Generate specific improvement suggestions
   */
  private generateImprovementSuggestions(designs: any[], bitcoinRelated: any[]): string[] {
    const suggestions = [];

    if (bitcoinRelated.length === 0) {
      suggestions.push('Add Bitcoin educational designs to leverage the current $109K market moment');
      suggestions.push('Create fee comparison charts showing current low-cost transaction opportunities');
    }

    if (designs.length < 10) {
      suggestions.push('Expand portfolio with automated Bitcoin price alerts');
      suggestions.push('Add interactive fee calculators for different transaction types');
    }

    suggestions.push('Integrate live Bitcoin data (price: $108K+, fees: 1 sat/vB)');
    suggestions.push('Add dynamic content that updates with market conditions');
    suggestions.push('Create educational series about current market context');
    suggestions.push('Build automated design pipeline for daily Bitcoin insights');

    return suggestions;
  }

  /**
   * Identify opportunities for live data integration
   */
  private identifyLiveDataOpportunities(designs: any[]): string[] {
    return [
      'Price alerts with current $108K+ market data',
      'Fee optimization guides using live 1 sat/vB rates',
      'Market context certificates for $109K era learning',
      'Network status banners with real-time congestion data',
      'Educational infographics with current transaction costs',
      'Automated social media posts for market updates'
    ];
  }

  /**
   * Create enhanced designs based on your folder content
   */
  async createEnhancedDesigns(): Promise<any> {
    console.log('🎨 Creating enhanced designs based on your folder...');
    
    // Get current Bitcoin data
    const specs = this.designer.generateDesignSpecs();
    const analysis = await this.analyzeFolder();

    // Create contextual designs for your folder
    const enhancedSpecs = specs.map((spec, index) => ({
      ...spec,
      title: `${spec.title} - Enhanced`,
      context: `Designed for folder: ${this.folderId}`,
      improvements: analysis.improvement_suggestions[index] || 'General Bitcoin education enhancement',
      existing_designs: analysis.designs.length,
      bitcoin_focus: analysis.bitcoin_related.length > 0
    }));

    return {
      folder_analysis: analysis,
      enhanced_designs: enhancedSpecs,
      recommendations: this.generateRecommendations(analysis),
      next_steps: this.generateNextSteps(analysis)
    };
  }

  /**
   * Generate specific recommendations for your folder
   */
  private generateRecommendations(analysis: FolderAnalysis): string[] {
    const recs = [
      `Your folder has ${analysis.designs.length} designs - ${analysis.bitcoin_related.length} are Bitcoin-related`,
      'Current Bitcoin context: $108K+ price, 1 sat/vB fees - perfect for educational content',
      'Low network congestion = great opportunity for transaction fee education',
    ];

    if (analysis.bitcoin_related.length < 3) {
      recs.push('Consider adding more Bitcoin educational designs to capitalize on current market attention');
    }

    recs.push('Integrate live data feeds to keep your designs current and relevant');
    recs.push('Set up automated design updates for changing market conditions');

    return recs;
  }

  /**
   * Generate actionable next steps
   */
  private generateNextSteps(analysis: FolderAnalysis): string[] {
    return [
      '1. 📊 Import enhanced CSV data into Canva Bulk Create',
      '2. 🎨 Create 4 new Bitcoin education designs using current $109K context',
      '3. 🔄 Set up daily automation to refresh content with live data',
      '4. 📱 Export designs for social media and educational platforms',
      '5. 🎯 Focus on fee education while network congestion is low',
      '6. 📈 Track engagement and iterate based on student feedback'
    ];
  }

  /**
   * Generate a comprehensive improvement report
   */
  async generateImprovementReport(): Promise<void> {
    console.log('📋 Generating improvement report for your Canva folder...\n');

    const enhanced = await this.createEnhancedDesigns();
    const timestamp = new Date().toLocaleString();

    const report = `# Canva Folder Improvement Report 📊

**Folder ID:** ${this.folderId}  
**Analysis Date:** ${timestamp}  
**Bitcoin Context:** $108K+ price, 1 sat/vB fees (Low congestion)

## 📁 Current Folder Status

- **Total Designs:** ${enhanced.folder_analysis.designs.length}
- **Bitcoin-Related:** ${enhanced.folder_analysis.bitcoin_related.length}
- **Improvement Potential:** High (Current market conditions are ideal)

## 🚀 Improvement Suggestions

${enhanced.folder_analysis.improvement_suggestions.map(s => `- ${s}`).join('\n')}

## 💡 Live Data Integration Opportunities  

${enhanced.folder_analysis.live_data_opportunities.map(o => `- ${o}`).join('\n')}

## 🎯 Recommendations

${enhanced.recommendations.map(r => `- ${r}`).join('\n')}

## 📋 Next Steps

${enhanced.next_steps.join('\n')}

## 🎨 Enhanced Design Specifications

${enhanced.enhanced_designs.map((design, idx) => `
### ${idx + 1}. ${design.title}
- **Dimensions:** ${design.width} x ${design.height}px
- **Context:** ${design.context}
- **Improvement Focus:** ${design.improvements}
- **Colors:** ${design.elements.colors.join(', ')}
- **Call-to-Action:** ${design.elements.call_to_action}
`).join('\n')}

## 🔗 Integration with Your MCP Agent

Your existing MCP agent can:
1. **Auto-update designs** when Bitcoin price changes significantly  
2. **Generate fresh content** based on network conditions
3. **Create contextual educational materials** for current market state
4. **Export and distribute** updated designs automatically

## 💰 Current Bitcoin Context for Design

- **Price:** ${enhanced.enhanced_designs[0]?.elements.price || '$108K+'}
- **Fees:** ${enhanced.enhanced_designs[0]?.elements.fees || '1 sat/vB'}  
- **Status:** ${enhanced.enhanced_designs[0]?.elements.congestion || 'Low Activity'}
- **Educational Opportunity:** High (Market attention + low transaction costs)

---
*🤖 Generated by your MCP Bitcoin Education Agent*
`;

    // Save the report
    const exportsDir = join(process.cwd(), 'exports');
    mkdirSync(exportsDir, { recursive: true });
    
    writeFileSync(join(exportsDir, 'canva-folder-improvement-report.md'), report);
    
    // Save enhanced design data as CSV for Canva import
    const bulkCSV = this.designer.generateBulkCreateCSV();
    writeFileSync(join(exportsDir, 'folder-improvement-bulk-create.csv'), bulkCSV);

    console.log('✅ Report generated successfully!');
    console.log('📁 Files created:');
    console.log('  • canva-folder-improvement-report.md');
    console.log('  • folder-improvement-bulk-create.csv');
  }

  /**
   * Test connection to your Canva account
   */
  async testCanvaConnection(): Promise<void> {
    console.log('🔧 Testing connection to your Canva account...\n');
    
    try {
      const connectionTest = await canvaTools.testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Successfully connected to Canva!');
        console.log(`   User: ${connectionTest.data.user_id || 'Connected'}`);
        console.log(`   Capabilities: ${connectionTest.data.capabilities?.join(', ') || 'Full access'}`);
        
        // Test folder access
        console.log(`\n🔍 Testing access to your folder: ${this.folderId}`);
        const folderTest = await canvaTools.listDesigns({ folder_id: this.folderId, limit: 1 });
        
        if (folderTest.success) {
          console.log('✅ Successfully accessed your folder!');
          console.log(`   Found ${folderTest.data.count} design(s)`);
        } else {
          console.log('❌ Could not access specific folder');
          console.log(`   Error: ${folderTest.error}`);
        }
        
      } else {
        console.log('❌ Failed to connect to Canva');
        console.log(`   Error: ${connectionTest.error}`);
        console.log('\n💡 Make sure your CANVA_API_KEY is set in environment variables');
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
    }
  }
}

async function main() {
  console.log('🎨 Canva Folder Improvement Tool\n');
  console.log('Connecting to your folder: https://www.canva.com/folder/FAFxTnM3zZU\n');
  
  const improver = new CanvaFolderImprover('FAFxTnM3zZU');
  
  try {
    // Test connection first
    await improver.testCanvaConnection();
    console.log('\n' + '═'.repeat(50) + '\n');
    
    // Generate comprehensive improvement report
    await improver.generateImprovementReport();
    
    console.log('\n🎉 Your Canva folder analysis is complete!');
    console.log('📋 Check the improvement report in exports/');
    console.log('📊 Import the CSV file into Canva Bulk Create to add enhanced designs');
    
  } catch (error) {
    console.error('❌ Failed to improve folder:', error);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CanvaFolderImprover };
