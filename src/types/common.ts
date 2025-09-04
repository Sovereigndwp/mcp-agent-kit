/**
 * Common type definitions for the MCP Agent Kit
 * Consolidates and standardizes interfaces across agents
 */

// Bitcoin data types
export interface BitcoinPriceData {
  price: number;
  currency: string;
  cop_price?: number;
  timestamp: number;
  source: string;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
}

export interface FeeEstimate {
  fast: number;
  medium: number;
  slow: number;
  timestamp: number;
  source: string;
}

// Content analysis types
export interface SentimentResult {
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  breakdown?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface RSSItem {
  title?: string;
  link?: string;
  content?: string;
  pubDate?: string;
  author?: string;
}

export interface NewsAnalysisResult {
  items: RSSItem[];
  sentiment: SentimentResult;
  summary?: string;
}

// Canva integration types
export interface CanvaDesignData {
  design_elements?: any[];
  elements?: any[]; // Fallback property
  title?: string;
  description?: string;
  tags?: string[];
}

// Assessment types
export interface AssessmentConfig {
  title: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question_count: number;
  question_types: string[];
  include_live_data?: boolean;
  socratic_method?: boolean; // Add back this property
}

// Content workflow types
export interface ContentWorkflow {
  id: string;
  name: string;
  description: string;
  outputs: string[];
  status: 'active' | 'inactive' | 'running' | 'completed' | 'failed' | 'draft' | 'paused';
  created_at: string;
  last_run: string;
  steps: WorkflowStep[];
  triggers?: WorkflowTrigger[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config?: Record<string, any>; // Add missing config property
  dependencies: string[];
  timeout_minutes: number;
  retry_count: number;
  success_criteria: string[];
}

export interface WorkflowTrigger {
  type: string;
  config: Record<string, any>;
  active: boolean;
}

export interface StepResult {
  step_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  output: any; // This was missing
  retry_attempts: number;
}

// Content improvement types
export interface CrossPlatformInsights {
  philosophy_consistency: {
    score: number;
    details: string[];
  };
  // Removed philosophy_consistency_score as it doesn't exist
}

export interface ContentImprovementRequest {
  content: any;
  improvement_type: string;
  target_audience?: string;
  learning_objectives?: string[];
  focus_areas?: string[];
}

// Philosophy analysis types
export interface ContentCharacteristics {
  tone: string;
  complexity_level: 'beginner' | 'intermediate' | 'adaptive';
  engagement_techniques: string[];
  common_metaphors: string[];
  preferred_examples: string[];
  clarity_indicators?: string[]; // Add back this optional property
}

// Error handling utility
export type SafeError = Error | { message: string };

export function isError(error: unknown): error is SafeError {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Unknown error occurred';
}
