import { readFileSync } from 'fs';
import path from 'path';
import { CrossRepositoryAnalyzer } from '../analysis/CrossRepositoryAnalyzer.js';
import { RepositoryContentService } from '../services/RepositoryContentService.js';
import { logger } from '../utils/logger.js';

async function run(): Promise<void> {
  try {
    const configPath = path.resolve('content-sources/config.json');
    const raw = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    if (!config.repositories?.enabled) {
      logger.info('Repository cross-learning sync is disabled in configuration.');
      return;
    }

    const repositoryService = new RepositoryContentService(config);
    const analyzer = new CrossRepositoryAnalyzer(repositoryService, config);

    const report = analyzer.runAnalysis();
    const { jsonPath, markdownPath } = analyzer.saveReport(report);

    logger.info('Cross-repository learning analysis completed.', {
      repositories: report.sourcesScanned,
      recommendations: report.recommendations.length,
      jsonPath,
      markdownPath
    });
  } catch (error) {
    logger.error('Failed to execute cross-repository sync pipeline', error);
    process.exitCode = 1;
  }
}

run();
