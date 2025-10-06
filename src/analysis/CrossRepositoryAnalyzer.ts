import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { RepositoryContentService, RepositoryScanResult, RepositorySourceConfig } from '../services/RepositoryContentService.js';
import { logger } from '../utils/logger.js';

export interface CrossRepoRecommendation {
  targetRepository: string;
  sourceRepository: string;
  concept: string;
  sourceScore: number;
  targetScore: number;
  insight: string;
  actionableNextStep: string;
}

export interface CrossRepoReport {
  generatedAt: string;
  sourcesScanned: number;
  repositories: RepositoryScanResult[];
  recommendations: CrossRepoRecommendation[];
  systemicGaps: string[];
}

const SUGGESTION_THRESHOLD = 1.5;

export class CrossRepositoryAnalyzer {
  constructor(private repositoryService: RepositoryContentService, private config: any) {}

  runAnalysis(): CrossRepoReport {
    const scanResults = this.repositoryService.scanRepositories();
    const recommendations = this.buildRecommendations(scanResults);
    const systemicGaps = this.identifySystemicGaps(scanResults);

    return {
      generatedAt: new Date().toISOString(),
      sourcesScanned: scanResults.length,
      repositories: scanResults,
      recommendations,
      systemicGaps
    };
  }

  saveReport(report: CrossRepoReport): { jsonPath: string; markdownPath: string } {
    const analysisConfig = this.repositoryService.getAnalysisConfig();
    const outputDirectory = analysisConfig.output_directory || './exports/cross-learning-reports';
    mkdirSync(outputDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const jsonPath = path.join(outputDirectory, `cross-learning-report-${timestamp}.json`);
    const mdPath = path.join(outputDirectory, `cross-learning-report-${timestamp}.md`);

    writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    writeFileSync(mdPath, this.generateMarkdown(report), 'utf-8');

    return { jsonPath, markdownPath: mdPath };
  }

  private buildRecommendations(results: RepositoryScanResult[]): CrossRepoRecommendation[] {
    const recommendations: CrossRepoRecommendation[] = [];
    const resultMap = new Map<string, RepositoryScanResult>(results.map((result) => [result.repository.id, result]));

    for (const source of results) {
      if (source.status !== 'ok') continue;

      const shareTargets = this.determineTargets(source.repository, results);
      const sourceConcepts = source.conceptTotals;

      for (const targetId of shareTargets) {
        const target = resultMap.get(targetId);
        if (!target || target.status !== 'ok') continue;

        const targetConcepts = target.conceptTotals;

        for (const [concept, sourceScore] of Object.entries(sourceConcepts)) {
          const targetScore = targetConcepts[concept] || 0;
          if (sourceScore === 0) continue;

          const ratio = sourceScore / (targetScore + 1);
          if (ratio >= SUGGESTION_THRESHOLD) {
            recommendations.push({
              targetRepository: target.repository.id,
              sourceRepository: source.repository.id,
              concept,
              sourceScore,
              targetScore,
              insight: this.buildInsight(concept, source, target, sourceScore, targetScore),
              actionableNextStep: this.buildNextStep(concept, source, target)
            });
          }
        }

        if (this.requiresInteractiveBoost(source, target)) {
          recommendations.push({
            targetRepository: target.repository.id,
            sourceRepository: source.repository.id,
            concept: 'interactive-learning',
            sourceScore: source.totalInteractiveElements,
            targetScore: target.totalInteractiveElements,
            insight: `${source.repository.label || source.repository.id} features ${source.totalInteractiveElements} interactive call-outs versus ${target.totalInteractiveElements} in ${target.repository.label || target.repository.id}.`,
            actionableNextStep: 'Port at least two interactive exercises or scenarios from the source repository and adapt them to the target lesson flow.'
          });
        }
      }
    }

    return recommendations;
  }

  private determineTargets(source: RepositorySourceConfig, results: RepositoryScanResult[]): string[] {
    if (source.share_insights_with && source.share_insights_with.length > 0) {
      return source.share_insights_with;
    }

    return results
      .map((result) => result.repository.id)
      .filter((id) => id !== source.id);
  }

  private requiresInteractiveBoost(source: RepositoryScanResult, target: RepositoryScanResult): boolean {
    const sourceInteractive = source.totalInteractiveElements;
    const targetInteractive = target.totalInteractiveElements;

    if (sourceInteractive === 0) return false;
    return sourceInteractive >= targetInteractive * 2;
  }

  private buildInsight(concept: string, source: RepositoryScanResult, target: RepositoryScanResult, sourceScore: number, targetScore: number): string {
    const sourceLabel = source.repository.label || source.repository.id;
    const targetLabel = target.repository.label || target.repository.id;

    return `${sourceLabel} covers ${concept} with ${sourceScore} strong references vs ${targetScore} in ${targetLabel}.`;
  }

  private buildNextStep(concept: string, source: RepositoryScanResult, target: RepositoryScanResult): string {
    switch (concept) {
      case 'money-history':
        return 'Import the chronological money history modules, maintain the timeline structure, and weave in target-specific reflections or assessments.';
      case 'interactive-learning':
        return 'Adapt at least one hands-on exercise or scenario-based activity per module to raise engagement levels.';
      case 'sovereignty':
        return 'Mirror the sovereignty-focused call-outs (self-custody steps, multisig diagrams) and evaluate gaps in the target content.';
      case 'curriculum-architecture':
        return 'Review the sequencing and section headings in the source repository and align the target curriculum map to match the stronger flow.';
      default:
        return 'Review the source material for reusable frameworks, copy its best patterns, and integrate them into the target repository.';
    }
  }

  private identifySystemicGaps(results: RepositoryScanResult[]): string[] {
    const aggregate: Record<string, number> = {};
    const counts: Record<string, number> = {};

    for (const result of results) {
      if (result.status !== 'ok') continue;
      for (const [concept, score] of Object.entries(result.conceptTotals)) {
        aggregate[concept] = (aggregate[concept] || 0) + score;
        counts[concept] = (counts[concept] || 0) + 1;
      }
    }

    const gaps: string[] = [];

    for (const [concept, totalScore] of Object.entries(aggregate)) {
      const repositoryCoverage = counts[concept] || 1;
      const average = totalScore / repositoryCoverage;
      if (average < 3) {
        gaps.push(`Concept "${concept}" is under-represented across repositories (average score ${average.toFixed(2)}). Consider scheduling a content sprint.`);
      }
    }

    return gaps;
  }

  private generateMarkdown(report: CrossRepoReport): string {
    const lines: string[] = [];
    lines.push('# Cross-Repository Learning Report');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push('');
    lines.push('## Repository Scan Summary');

    for (const repo of report.repositories) {
      lines.push(`### ${repo.repository.label || repo.repository.id}`);
      lines.push(`- Status: ${repo.status}`);
      if (repo.message) {
        lines.push(`- Note: ${repo.message}`);
      }
      lines.push(`- Items scanned: ${repo.items.length}`);
      lines.push(`- Total words: ${repo.totalWordCount}`);
      lines.push(`- Total headings: ${repo.totalHeadings}`);
      lines.push(`- Interactive elements: ${repo.totalInteractiveElements}`);
      if (Object.keys(repo.conceptTotals).length > 0) {
        lines.push('- Concept coverage:');
        for (const [concept, score] of Object.entries(repo.conceptTotals)) {
          lines.push(`  - ${concept}: ${score}`);
        }
      }
      lines.push('');
    }

    lines.push('## Recommendations');
    if (report.recommendations.length === 0) {
      lines.push('No cross-repository improvements identified.');
    } else {
      for (const rec of report.recommendations) {
        lines.push(`- **${rec.targetRepository}** should borrow **${rec.concept}** patterns from **${rec.sourceRepository}**.`);
        lines.push(`  - Insight: ${rec.insight}`);
        lines.push(`  - Next step: ${rec.actionableNextStep}`);
      }
    }

    if (report.systemicGaps.length > 0) {
      lines.push('');
      lines.push('## Systemic Gaps');
      for (const gap of report.systemicGaps) {
        lines.push(`- ${gap}`);
      }
    }

    return lines.join('\n');
  }
}
