import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { logger } from '../utils/logger.js';

export interface RepositorySourceConfig {
  id: string;
  label?: string;
  path: string;
  globs?: string[];
  primary_topics?: string[];
  share_insights_with?: string[];
}

export interface RepositoryAnalysisConfig {
  output_directory?: string;
  default_topics?: string[];
  missing_path_behavior?: 'warn' | 'skip' | 'error';
}

export interface RepositoryContentItem {
  repositoryId: string;
  repositoryLabel: string;
  absolutePath: string;
  relativePath: string;
  extension: string;
  content: string;
  wordCount: number;
  headingCount: number;
  interactiveElements: number;
  concepts: Record<string, number>;
}

export interface RepositoryScanResult {
  repository: RepositorySourceConfig;
  items: RepositoryContentItem[];
  totalWordCount: number;
  totalInteractiveElements: number;
  totalHeadings: number;
  conceptTotals: Record<string, number>;
  status: 'ok' | 'skipped' | 'error';
  message?: string;
}

const DEFAULT_GLOBS = ['**/*.md', '**/*.mdx'];

const CONCEPT_CATALOG: Record<string, string[]> = {
  'money-history': ['money history', 'barter', 'gold standard', 'fiat', 'bretton woods', 'sound money'],
  'interactive-learning': ['exercise', 'activity', 'scenario', 'challenge', 'hands-on', 'guided project'],
  'sovereignty': ['self-custody', 'multisig', 'private key', 'hardware wallet', 'sovereign'],
  'curriculum-architecture': ['learning path', 'curriculum', 'module', 'lesson plan', 'scope and sequence'],
  'foundations': ['what is bitcoin', 'why bitcoin', 'basics', 'introduction', 'fundamentals'],
  'bitcoin-education': ['bitcoin education', 'bitcoin course', 'bitcoin learning', 'workshop', 'lesson objective']
};

export class RepositoryContentService {
  private sources: RepositorySourceConfig[] = [];
  private analysisConfig: RepositoryAnalysisConfig;

  constructor(private config: any) {
    if (config?.repositories?.sources) {
      this.sources = config.repositories.sources;
    }
    this.analysisConfig = config?.repositories?.analysis || {};
  }

  getSources(): RepositorySourceConfig[] {
    return this.sources;
  }

  getAnalysisConfig(): RepositoryAnalysisConfig {
    return this.analysisConfig;
  }

  scanRepositories(): RepositoryScanResult[] {
    return this.sources.map((source) => this.scanRepository(source));
  }

  scanRepository(source: RepositorySourceConfig): RepositoryScanResult {
    const repoPath = path.resolve(source.path);

    if (!existsSync(repoPath)) {
      const behavior = this.analysisConfig?.missing_path_behavior || 'warn';
      const message = `Repository path not found: ${repoPath}`;
      if (behavior === 'error') {
        throw new Error(message);
      }
      if (behavior === 'warn') {
        logger.warn(message);
      }
      return {
        repository: source,
        items: [],
        totalWordCount: 0,
        totalInteractiveElements: 0,
        totalHeadings: 0,
        conceptTotals: {},
        status: 'skipped',
        message
      };
    }

    const patterns = source.globs?.length ? source.globs : DEFAULT_GLOBS;
    const matches = patterns.flatMap((pattern) => globSync(pattern, {
      cwd: repoPath,
      absolute: false,
      nodir: true
    }));

    const items: RepositoryContentItem[] = [];
    const conceptTotals: Record<string, number> = {};

    for (const relative of matches) {
      const absolutePath = path.join(repoPath, relative);

      try {
        const buffer = readFileSync(absolutePath, 'utf-8');
        const metrics = this.analyzeContent(buffer);
        const itemConcepts = this.evaluateConcepts(buffer, source.primary_topics);

        for (const [concept, score] of Object.entries(itemConcepts)) {
          conceptTotals[concept] = (conceptTotals[concept] || 0) + score;
        }

        items.push({
          repositoryId: source.id,
          repositoryLabel: source.label || source.id,
          absolutePath,
          relativePath: relative,
          extension: path.extname(relative),
          content: buffer,
          wordCount: metrics.wordCount,
          headingCount: metrics.headingCount,
          interactiveElements: metrics.interactiveElements,
          concepts: itemConcepts
        });
      } catch (error) {
        logger.warn(`Failed to read repository file: ${absolutePath}`, error);
      }
    }

    const totals = items.reduce((acc, item) => {
      acc.words += item.wordCount;
      acc.headings += item.headingCount;
      acc.interactive += item.interactiveElements;
      return acc;
    }, { words: 0, headings: 0, interactive: 0 });

    return {
      repository: source,
      items,
      totalWordCount: totals.words,
      totalInteractiveElements: totals.interactive,
      totalHeadings: totals.headings,
      conceptTotals,
      status: 'ok'
    };
  }

  saveScanSnapshot(results: RepositoryScanResult[]): void {
    const outputDir = this.analysisConfig?.output_directory || './exports/cross-learning-reports';
    mkdirSync(outputDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(outputDir, `repository-scan-${timestamp}.json`);

    writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf-8');
  }

  private analyzeContent(content: string) {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const headingCount = (content.match(/^\s*#/gm) || []).length;
    const interactiveElements = (content.match(/exercise|activity|scenario|challenge|hands-on/gi) || []).length;

    return {
      wordCount,
      headingCount,
      interactiveElements
    };
  }

  private evaluateConcepts(content: string, primaryTopics?: string[]): Record<string, number> {
    const concepts: Record<string, number> = {};
    const catalogEntries = Object.entries(CONCEPT_CATALOG);
    const lower = content.toLowerCase();

    for (const [concept, keywords] of catalogEntries) {
      const matches = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
        const found = lower.match(regex);
        return count + (found ? found.length : 0);
      }, 0);

      if (matches > 0) {
        concepts[concept] = matches;
      }
    }

    if (primaryTopics) {
      for (const topic of primaryTopics) {
        if (concepts[topic]) {
          concepts[topic] = concepts[topic] * 1.2;
        }
      }
    }

    return concepts;
  }
}
