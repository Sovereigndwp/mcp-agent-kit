import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

export interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  urls: {
    view_url: string;
    edit_url: string;
  };
}

export interface CanvaFolder {
  id: string;
  name: string;
}

export interface DesignCreateOptions {
  design_type: string;
  title?: string;
}

export interface TextUpdateOptions {
  design_id: string;
  element_id: string;
  text: string;
}

/**
 * CanvaAgent - Integrates with Canva API to manage designs programmatically
 * 
 * Features:
 * - List and search designs
 * - Create new designs from templates
 * - Update text elements in existing designs
 * - Export designs in various formats
 * - Manage folders and organization
 */
export class CanvaAgent {
  private apiClient: AxiosInstance;
  private baseURL = 'https://api.canva.com/rest/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CANVA_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn('CANVA_API_KEY not found in environment variables. Canva functionality will be limited.');
    } else {
      logger.info('Canva API key loaded successfully');
    }

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request/response interceptors for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug(`Canva API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Canva API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        logger.debug(`Canva API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Canva API Response Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<any> {
    try {
      const response = await this.apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw new Error('Failed to retrieve Canva user profile');
    }
  }

  /**
   * List user's designs with optional filtering
   */
  async listDesigns(options: {
    query?: string;
    folder_id?: string;
    limit?: number;
    continuation?: string;
  } = {}): Promise<{designs: CanvaDesign[], next_continuation?: string}> {
    try {
      const params = new URLSearchParams();
      
      if (options.query) params.append('query', options.query);
      if (options.folder_id) params.append('folder_id', options.folder_id);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.continuation) params.append('continuation', options.continuation);

      const response = await this.apiClient.get(`/designs?${params.toString()}`);
      
      return {
        designs: response.data.items || [],
        next_continuation: response.data.continuation
      };
    } catch (error) {
      logger.error('Failed to list designs:', error);
      throw new Error('Failed to retrieve Canva designs');
    }
  }

  /**
   * Get details of a specific design
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    try {
      const response = await this.apiClient.get(`/designs/${designId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get design ${designId}:`, error);
      throw new Error(`Failed to retrieve design: ${designId}`);
    }
  }

  /**
   * Create a new design
   */
  async createDesign(options: DesignCreateOptions): Promise<CanvaDesign> {
    try {
      const payload = {
        design_type: options.design_type,
        ...(options.title && { title: options.title })
      };

      const response = await this.apiClient.post('/designs', payload);
      return response.data;
    } catch (error) {
      logger.error('Failed to create design:', error);
      throw new Error('Failed to create new Canva design');
    }
  }

  /**
   * Export a design in various formats
   */
  async exportDesign(designId: string, format: 'jpg' | 'png' | 'pdf' | 'mp4' = 'png'): Promise<{
    job_id: string;
    status: string;
  }> {
    try {
      const payload = {
        format: {
          type: format
        }
      };

      const response = await this.apiClient.post(`/designs/${designId}/export`, payload);
      return response.data.job;
    } catch (error) {
      logger.error(`Failed to export design ${designId}:`, error);
      throw new Error(`Failed to export design: ${designId}`);
    }
  }

  /**
   * Get export job status and download URL
   */
  async getExportStatus(jobId: string): Promise<{
    status: 'in_progress' | 'success' | 'failed';
    url?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/exports/${jobId}`);
      const job = response.data.job;
      
      return {
        status: job.status,
        url: job.result?.url,
        error: job.error?.message
      };
    } catch (error) {
      logger.error(`Failed to get export status for job ${jobId}:`, error);
      throw new Error(`Failed to get export status: ${jobId}`);
    }
  }

  /**
   * List user's folders
   */
  async listFolders(): Promise<CanvaFolder[]> {
    try {
      const response = await this.apiClient.get('/folders');
      return response.data.items || [];
    } catch (error) {
      logger.error('Failed to list folders:', error);
      throw new Error('Failed to retrieve Canva folders');
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(name: string): Promise<CanvaFolder> {
    try {
      const payload = { name };
      const response = await this.apiClient.post('/folders', payload);
      return response.data;
    } catch (error) {
      logger.error('Failed to create folder:', error);
      throw new Error('Failed to create Canva folder');
    }
  }

  /**
   * Search designs by title or content
   */
  async searchDesigns(query: string, limit: number = 20): Promise<CanvaDesign[]> {
    try {
      const result = await this.listDesigns({ query, limit });
      return result.designs;
    } catch (error) {
      logger.error('Failed to search designs:', error);
      throw new Error('Failed to search Canva designs');
    }
  }

  /**
   * Get designs with Bitcoin-related content
   */
  async getBitcoinDesigns(): Promise<CanvaDesign[]> {
    try {
      const bitcoinTerms = ['bitcoin', 'btc', 'cryptocurrency', 'crypto'];
      let allDesigns: CanvaDesign[] = [];

      for (const term of bitcoinTerms) {
        const designs = await this.searchDesigns(term, 10);
        allDesigns = [...allDesigns, ...designs];
      }

      // Remove duplicates based on design ID
      const uniqueDesigns = allDesigns.filter((design, index, self) => 
        index === self.findIndex(d => d.id === design.id)
      );

      return uniqueDesigns;
    } catch (error) {
      logger.error('Failed to get Bitcoin designs:', error);
      throw new Error('Failed to retrieve Bitcoin-related designs');
    }
  }

  /**
   * Batch export multiple designs
   */
  async batchExportDesigns(designIds: string[], format: 'jpg' | 'png' | 'pdf' | 'mp4' = 'png'): Promise<{
    design_id: string;
    job_id: string;
    status: string;
  }[]> {
    try {
      const exportJobs = [];

      for (const designId of designIds) {
        try {
          const job = await this.exportDesign(designId, format);
          exportJobs.push({
            design_id: designId,
            job_id: job.job_id,
            status: job.status
          });
        } catch (error) {
          logger.warn(`Failed to start export for design ${designId}:`, error);
          exportJobs.push({
            design_id: designId,
            job_id: '',
            status: 'failed'
          });
        }
      }

      return exportJobs;
    } catch (error) {
      logger.error('Failed to batch export designs:', error);
      throw new Error('Failed to batch export designs');
    }
  }

  /**
   * Check API connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getUserProfile();
      logger.info('Canva API connection successful');
      return true;
    } catch (error) {
      logger.error('Canva API connection failed:', error);
      return false;
    }
  }

  /**
   * Get agent status and capabilities
   */
  getStatus(): {
    name: string;
    authenticated: boolean;
    api_key_configured: boolean;
    capabilities: string[];
  } {
    return {
      name: 'CanvaAgent',
      authenticated: Boolean(this.apiKey),
      api_key_configured: Boolean(this.apiKey),
      capabilities: [
        'list_designs',
        'create_designs',
        'export_designs',
        'search_designs',
        'manage_folders',
        'batch_operations'
      ]
    };
  }
}
