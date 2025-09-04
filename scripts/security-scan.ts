#!/usr/bin/env tsx

/**
 * Security scan script for MCP Agent Kit
 * Validates codebase for common security vulnerabilities
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface SecurityIssue {
  file: string;
  line: number;
  type: 'high' | 'medium' | 'low' | 'info';
  rule: string;
  description: string;
  content: string;
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];
  
  // Dangerous patterns that should never be used
  private highRiskPatterns = [
    { pattern: /eval\s*\(/g, rule: 'no-eval', description: 'Dangerous eval() usage' },
    { pattern: /Function\s*\(/g, rule: 'no-function-constructor', description: 'Function constructor usage' },
    { pattern: /exec\s*\(/g, rule: 'dangerous-exec', description: 'Potentially unsafe exec() usage' },
    { pattern: /innerHTML\s*=.*\+/g, rule: 'innerHTML-injection', description: 'Potential XSS via innerHTML' },
    { pattern: /document\.write\s*\(/g, rule: 'document-write', description: 'Dangerous document.write usage' },
  ];

  // Medium risk patterns that need review
  private mediumRiskPatterns = [
    { pattern: /process\.env\[.*\+/g, rule: 'dynamic-env-access', description: 'Dynamic environment variable access' },
    { pattern: /require\s*\(.*\+/g, rule: 'dynamic-require', description: 'Dynamic require() call' },
    { pattern: /import\s*\(.*\+/g, rule: 'dynamic-import', description: 'Dynamic import() with variable path' },
    { pattern: /fs\.writeFileSync.*\+/g, rule: 'dynamic-file-write', description: 'Dynamic file write operation' },
  ];

  // Low risk patterns that should be monitored
  private lowRiskPatterns = [
    { pattern: /setTimeout\s*\(.*\+/g, rule: 'dynamic-timeout', description: 'Dynamic setTimeout call' },
    { pattern: /setInterval\s*\(.*\+/g, rule: 'dynamic-interval', description: 'Dynamic setInterval call' },
    { pattern: /console\.log.*password|secret|key/gi, rule: 'secret-logging', description: 'Potential secret in logs' },
  ];

  // Info patterns for awareness
  private infoPatterns = [
    { pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/g, rule: 'http-usage', description: 'Non-secure HTTP URL (consider HTTPS)' },
    { pattern: /\.env/g, rule: 'env-file-reference', description: 'Environment file reference' },
  ];

  async scanDirectory(directory: string): Promise<SecurityIssue[]> {
    console.log(`🔍 Scanning directory: ${directory}`);
    
    const files = await glob('**/*.{ts,js,json}', { 
      cwd: directory,
      ignore: ['node_modules/**', 'dist/**', '*.d.ts', 'coverage/**', '.git/**']
    });

    let scannedFiles = 0;
    
    for (const file of files) {
      const fullPath = path.join(directory, file);
      await this.scanFile(fullPath, file);
      scannedFiles++;
      
      if (scannedFiles % 10 === 0) {
        console.log(`  Scanned ${scannedFiles}/${files.length} files...`);
      }
    }

    console.log(`✅ Scanned ${scannedFiles} files total`);
    return this.issues;
  }

  private async scanFile(filePath: string, relativePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkPatterns(line, index + 1, relativePath, this.highRiskPatterns, 'high');
        this.checkPatterns(line, index + 1, relativePath, this.mediumRiskPatterns, 'medium');
        this.checkPatterns(line, index + 1, relativePath, this.lowRiskPatterns, 'low');
        this.checkPatterns(line, index + 1, relativePath, this.infoPatterns, 'info');
      });
    } catch (error) {
      console.warn(`⚠️  Could not scan file: ${filePath}`);
    }
  }

  private checkPatterns(
    line: string, 
    lineNumber: number, 
    file: string, 
    patterns: Array<{ pattern: RegExp; rule: string; description: string }>,
    type: SecurityIssue['type']
  ): void {
    for (const { pattern, rule, description } of patterns) {
      if (pattern.test(line)) {
        // Skip patterns in comments (basic check)
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) {
          continue;
        }
        
        // Skip security scanner itself (avoid false positives)
        if (file.includes('security-scan.ts')) {
          continue;
        }
        
        // Skip package-lock.json and other metadata files for low-risk patterns
        if (type === 'low' && (file.includes('package-lock.json') || file.includes('.json'))) {
          continue;
        }
        
        // Skip false positives for function parameters
        if (rule === 'no-function-constructor' && (line.includes('Function()') || line.includes('fetchFunction') || line.includes('warmupFunction'))) {
          continue;
        }

        this.issues.push({
          file,
          line: lineNumber,
          type,
          rule,
          description,
          content: line.trim()
        });
      }
    }
  }

  generateReport(): string {
    const grouped = this.groupByType();
    let report = '\n🛡️  SECURITY SCAN REPORT\n';
    report += '═'.repeat(50) + '\n\n';

    const typePriority: Array<SecurityIssue['type']> = ['high', 'medium', 'low', 'info'];

    for (const type of typePriority) {
      const issues = grouped[type];
      if (issues.length === 0) continue;

      const icon = this.getTypeIcon(type);
      const color = this.getTypeColor(type);
      
      report += `${icon} ${color}${type.toUpperCase()} RISK (${issues.length} issues)${this.resetColor()}\n`;
      report += '-'.repeat(30) + '\n';

      for (const issue of issues) {
        report += `📁 ${issue.file}:${issue.line}\n`;
        report += `   Rule: ${issue.rule}\n`;
        report += `   Issue: ${issue.description}\n`;
        report += `   Code: ${issue.content}\n\n`;
      }
    }

    // Summary
    const total = this.issues.length;
    const summary = this.getSummary(grouped);
    
    report += '\n📊 SUMMARY\n';
    report += '═'.repeat(20) + '\n';
    report += `Total Issues: ${total}\n`;
    report += `High Risk: ${summary.high} (❌ Must Fix)\n`;
    report += `Medium Risk: ${summary.medium} (⚠️  Review Required)\n`;
    report += `Low Risk: ${summary.low} (💡 Consider Fixing)\n`;
    report += `Info: ${summary.info} (ℹ️  Informational)\n\n`;

    if (summary.high > 0) {
      report += '🚨 HIGH RISK ISSUES DETECTED - IMMEDIATE ACTION REQUIRED!\n';
    } else if (summary.medium > 0) {
      report += '⚠️  Medium risk issues found - please review and address.\n';
    } else if (summary.low > 0) {
      report += '💡 Low risk issues found - consider addressing when convenient.\n';
    } else {
      report += '✅ No security issues detected!\n';
    }

    return report;
  }

  private groupByType(): Record<SecurityIssue['type'], SecurityIssue[]> {
    return {
      high: this.issues.filter(i => i.type === 'high'),
      medium: this.issues.filter(i => i.type === 'medium'),
      low: this.issues.filter(i => i.type === 'low'),
      info: this.issues.filter(i => i.type === 'info')
    };
  }

  private getSummary(grouped: Record<SecurityIssue['type'], SecurityIssue[]>) {
    return {
      high: grouped.high.length,
      medium: grouped.medium.length,
      low: grouped.low.length,
      info: grouped.info.length
    };
  }

  private getTypeIcon(type: SecurityIssue['type']): string {
    switch (type) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  }

  private getTypeColor(type: SecurityIssue['type']): string {
    // ANSI color codes
    switch (type) {
      case 'high': return '\x1b[31m'; // Red
      case 'medium': return '\x1b[33m'; // Yellow
      case 'low': return '\x1b[34m'; // Blue
      case 'info': return '\x1b[36m'; // Cyan
      default: return '';
    }
  }

  private resetColor(): string {
    return '\x1b[0m';
  }
}

// Main execution
async function main() {
  const scanner = new SecurityScanner();
  const projectRoot = process.cwd();
  
  console.log('🛡️  MCP Agent Kit Security Scanner');
  console.log('═'.repeat(40));
  console.log(`Project: ${projectRoot}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    const issues = await scanner.scanDirectory(projectRoot);
    const report = scanner.generateReport();
    
    console.log(report);

    // Write report to file
    const reportPath = path.join(projectRoot, 'security-report.txt');
    await fs.writeFile(reportPath, report.replace(/\x1b\[[0-9;]*m/g, ''), 'utf-8');
    console.log(`📄 Report saved to: ${reportPath}`);

    // Exit with appropriate code
    const criticalIssues = issues.filter(i => i.type === 'high').length;
    process.exit(criticalIssues > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Scanner failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SecurityScanner, SecurityIssue };
