import { CanvaAgent } from '../agents/CanvaAgent.js';
import { canvaMCPAgent } from '../agents/CanvaMCPAgent.js';
import { logger } from '../utils/logger.js';

/**
 * Canva API Tools - MCP-compatible tools for Canva operations
 */
class CanvaTools {
  private canvaAgent: CanvaAgent;
  private useMCP: boolean;

  constructor() {
    this.canvaAgent = new CanvaAgent();
    this.useMCP = true; // Prefer MCP when available
  }

  /**
   * List user's Canva designs
   */
  async listDesigns(options: {
    query?: string;
    folder_id?: string;
    limit?: number;
  } = {}): Promise<any> {
    try {
      logger.info('Listing Canva designs', { options });
      
      const result = await this.canvaAgent.listDesigns({
        query: options.query,
        folder_id: options.folder_id,
        limit: options.limit || 20
      });

      return {
        success: true,
        data: {
          designs: result.designs,
          count: result.designs.length,
          has_more: Boolean(result.next_continuation)
        },
        message: `Found ${result.designs.length} designs`
      };
    } catch (error) {
      logger.error('Failed to list designs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Search for designs by query
   */
  async searchDesigns(query: string, limit: number = 20): Promise<any> {
    try {
      logger.info('Searching Canva designs', { query, limit });
      
      const designs = await this.canvaAgent.searchDesigns(query, limit);

      return {
        success: true,
        data: {
          designs,
          query,
          count: designs.length
        },
        message: `Found ${designs.length} designs matching "${query}"`
      };
    } catch (error) {
      logger.error('Failed to search designs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get details of a specific design
   */
  async getDesign(designId: string): Promise<any> {
    try {
      logger.info('Getting Canva design details', { designId });
      
      const design = await this.canvaAgent.getDesign(designId);

      return {
        success: true,
        data: design,
        message: `Retrieved design: ${design.title}`
      };
    } catch (error) {
      logger.error('Failed to get design:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Create a new design (with MCP integration)
   */
  async createDesign(designType: string, title?: string): Promise<any> {
    try {
      logger.info('Creating new Canva design', { designType, title, useMCP: this.useMCP });
      
      let design;
      
      if (this.useMCP) {
        // Try MCP first
        try {
          design = await canvaMCPAgent.createDesignViaMCP(designType, title || 'Untitled Design');
          return {
            success: true,
            data: design,
            message: `Created design via MCP: ${design.title || design.id}`,
            method: 'mcp'
          };
        } catch (mcpError) {
          logger.warn('MCP creation failed, falling back to API:', mcpError);
        }
      }
      
      // Fallback to regular API
      design = await this.canvaAgent.createDesign({
        design_type: designType,
        title: title
      });

      return {
        success: true,
        data: design,
        message: `Created design: ${design.title || design.id}`,
        method: 'api'
      };
    } catch (error) {
      logger.error('Failed to create design:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Export a design
   */
  async exportDesign(designId: string, format: 'jpg' | 'png' | 'pdf' | 'mp4' = 'png'): Promise<any> {
    try {
      logger.info('Exporting Canva design', { designId, format });
      
      const exportJob = await this.canvaAgent.exportDesign(designId, format);

      return {
        success: true,
        data: {
          job_id: exportJob.job_id,
          status: exportJob.status,
          design_id: designId,
          format
        },
        message: `Export started for design ${designId}. Job ID: ${exportJob.job_id}`
      };
    } catch (error) {
      logger.error('Failed to export design:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get export status and download URL
   */
  async getExportStatus(jobId: string): Promise<any> {
    try {
      logger.info('Getting export status', { jobId });
      
      const status = await this.canvaAgent.getExportStatus(jobId);

      return {
        success: true,
        data: {
          job_id: jobId,
          status: status.status,
          download_url: status.url,
          error: status.error
        },
        message: `Export job ${jobId} status: ${status.status}`
      };
    } catch (error) {
      logger.error('Failed to get export status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * List user's folders
   */
  async listFolders(): Promise<any> {
    try {
      logger.info('Listing Canva folders');
      
      const folders = await this.canvaAgent.listFolders();

      return {
        success: true,
        data: {
          folders,
          count: folders.length
        },
        message: `Found ${folders.length} folders`
      };
    } catch (error) {
      logger.error('Failed to list folders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(name: string): Promise<any> {
    try {
      logger.info('Creating Canva folder', { name });
      
      const folder = await this.canvaAgent.createFolder(name);

      return {
        success: true,
        data: folder,
        message: `Created folder: ${folder.name}`
      };
    } catch (error) {
      logger.error('Failed to create folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get Bitcoin-related designs
   */
  async getBitcoinDesigns(): Promise<any> {
    try {
      logger.info('Getting Bitcoin-related Canva designs');
      
      const designs = await this.canvaAgent.getBitcoinDesigns();

      return {
        success: true,
        data: {
          designs,
          count: designs.length,
          search_terms: ['bitcoin', 'btc', 'cryptocurrency', 'crypto']
        },
        message: `Found ${designs.length} Bitcoin-related designs`
      };
    } catch (error) {
      logger.error('Failed to get Bitcoin designs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Batch export multiple designs
   */
  async batchExportDesigns(designIds: string[], format: 'jpg' | 'png' | 'pdf' | 'mp4' = 'png'): Promise<any> {
    try {
      logger.info('Batch exporting Canva designs', { designIds, format });
      
      const exportJobs = await this.canvaAgent.batchExportDesigns(designIds, format);

      return {
        success: true,
        data: {
          export_jobs: exportJobs,
          total_designs: designIds.length,
          successful_exports: exportJobs.filter(job => job.status !== 'failed').length,
          failed_exports: exportJobs.filter(job => job.status === 'failed').length
        },
        message: `Started batch export for ${designIds.length} designs`
      };
    } catch (error) {
      logger.error('Failed to batch export designs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Create Bitcoin educational designs (MCP-optimized)
   */
  async createBitcoinEducationDesigns(bitcoinData: {
    price: number;
    fees: { fast: number; medium: number; slow: number };
    congestion: string;
    prompts: string[];
  }): Promise<any> {
    try {
      logger.info('Creating Bitcoin education designs', bitcoinData);
      
      if (this.useMCP) {
        try {
          const designs = await canvaMCPAgent.createBitcoinEducationDesigns(bitcoinData);
          return {
            success: true,
            data: {
              designs,
              bitcoin_data: bitcoinData,
              method: 'mcp',
              count: designs.length
            },
            message: `Created ${designs.length} Bitcoin education designs via MCP`
          };
        } catch (mcpError) {
          logger.warn('MCP Bitcoin designs failed, using fallback:', mcpError);
        }
      }

      // Fallback: create individual designs
      const designTypes = [
        { type: 'instagram-post', title: `Bitcoin $${Math.round(bitcoinData.price/1000)}K Alert` },
        { type: 'presentation', title: `Bitcoin Fees - ${bitcoinData.congestion} Network` },
        { type: 'infographic', title: `Understanding Bitcoin Transactions` }
      ];

      const createdDesigns = [];
      for (const spec of designTypes) {
        const result = await this.createDesign(spec.type, spec.title);
        if (result.success) {
          createdDesigns.push({
            ...result.data,
            bitcoin_context: bitcoinData,
            design_purpose: spec.type
          });
        }
      }

      return {
        success: true,
        data: {
          designs: createdDesigns,
          bitcoin_data: bitcoinData,
          method: 'api_fallback',
          count: createdDesigns.length
        },
        message: `Created ${createdDesigns.length} Bitcoin education designs`
      };
      
    } catch (error) {
      logger.error('Failed to create Bitcoin education designs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Test Canva API connection (including MCP)
   */
  async testConnection(): Promise<any> {
    try {
      logger.info('Testing Canva connections (API + MCP)');
      
      const apiConnected = await this.canvaAgent.testConnection();
      const mcpConnected = await canvaMCPAgent.testMCPConnection();
      const status = this.canvaAgent.getStatus();
      const mcpStatus = canvaMCPAgent.getMCPStatus();

      return {
        success: apiConnected || mcpConnected,
        data: {
          api: {
            ...status,
            connected: apiConnected
          },
          mcp: {
            ...mcpStatus,
            connected: mcpConnected
          },
          preferred_method: this.useMCP && mcpConnected ? 'mcp' : 'api'
        },
        message: `Connections: API ${apiConnected ? '✓' : '✗'}, MCP ${mcpConnected ? '✓' : '✗'}`
      };
    } catch (error) {
      logger.error('Failed to test connections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    try {
      logger.info('Getting Canva user profile');
      
      const profile = await this.canvaAgent.getUserProfile();

      return {
        success: true,
        data: profile,
        message: 'Retrieved user profile successfully'
      };
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}

// Export singleton instance
export const canvaTools = new CanvaTools();
