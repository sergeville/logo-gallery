import chalk from 'chalk';
import { ValidationResult, ValidationError } from './validation-utils';
import { AutoFixResult } from './auto-fix';

interface DetailedValidationReport {
  collection: string;
  document: any;
  validationResult: ValidationResult;
  autoFixes?: AutoFixResult[];
  performance?: {
    validationTime: number;
    fixTime?: number;
  };
}

interface ValidationIssue {
  message: string;
  count: number;
  severity: 'error' | 'warning';
  examples: any[];
  fixes?: AutoFixResult[];
}

export function formatDetailedReport(reports: DetailedValidationReport[]): string {
  let output = '\n📋 Detailed Validation Report\n';
  output += `${chalk.gray('Generated at:')} ${new Date().toISOString()}\n\n`;

  // Summary section
  const summary = generateSummary(reports);
  output += formatSummarySection(summary);

  // Collection-specific sections
  const collectionGroups = groupByCollection(reports);
  for (const [collection, collectionReports] of Object.entries(collectionGroups)) {
    output += formatCollectionSection(collection, collectionReports);
  }

  // Performance metrics
  output += formatPerformanceSection(reports);

  return output;
}

function generateSummary(reports: DetailedValidationReport[]) {
  return {
    totalDocuments: reports.length,
    validDocuments: reports.filter(r => r.validationResult.isValid).length,
    totalErrors: reports.reduce((sum, r) => sum + r.validationResult.errors.length, 0),
    totalWarnings: reports.reduce((sum, r) => sum + r.validationResult.warnings.length, 0),
    fixableIssues: reports.reduce((sum, r) => sum + (r.autoFixes?.length || 0), 0),
    collections: new Set(reports.map(r => r.collection)).size,
  };
}

function formatSummarySection(summary: ReturnType<typeof generateSummary>): string {
  let output = chalk.bold('📊 Summary\n');
  
  const validPercentage = (summary.validDocuments / summary.totalDocuments) * 100;
  const validColor = validPercentage >= 90 ? 'green' : validPercentage >= 70 ? 'yellow' : 'red';
  
  output += `${chalk.gray('Collections:')} ${summary.collections}\n`;
  output += `${chalk.gray('Total Documents:')} ${summary.totalDocuments}\n`;
  output += `${chalk.gray('Valid Documents:')} ${chalk[validColor](`${summary.validDocuments} (${validPercentage.toFixed(1)}%)`)}\n`;
  output += `${chalk.gray('Issues:')} ${chalk.red(`${summary.totalErrors} errors`)}, ${chalk.yellow(`${summary.totalWarnings} warnings`)}\n`;
  output += `${chalk.gray('Fixable Issues:')} ${chalk.blue(`${summary.fixableIssues} issues can be auto-fixed`)}\n\n`;
  
  return output;
}

function groupByCollection(reports: DetailedValidationReport[]) {
  const groups: { [key: string]: DetailedValidationReport[] } = {};
  reports.forEach(report => {
    if (!groups[report.collection]) {
      groups[report.collection] = [];
    }
    groups[report.collection].push(report);
  });
  return groups;
}

function formatCollectionSection(collection: string, reports: DetailedValidationReport[]): string {
  let output = chalk.bold(`\n🗂  ${collection}\n`);
  
  // Collection stats
  const validDocs = reports.filter(r => r.validationResult.isValid).length;
  const totalDocs = reports.length;
  const validPercentage = (validDocs / totalDocs) * 100;
  
  output += `${chalk.gray('Documents:')} ${validDocs}/${totalDocs} valid (${validPercentage.toFixed(1)}%)\n`;
  
  // Group issues by type
  const issues = groupIssuesByType(reports);
  if (Object.keys(issues).length > 0) {
    output += '\nCommon Issues:\n';
    Object.entries(issues)
      .sort(([, a], [, b]) => b.count - a.count)
      .forEach(([message, data]) => {
        const icon = data.severity === 'error' ? '❌' : '⚠️';
        const color = data.severity === 'error' ? 'red' : 'yellow';
        output += chalk[color](`${icon} ${message} (${data.count} occurrences)\n`);
        if (data.examples.length > 0) {
          output += chalk.gray(`    Example: ${JSON.stringify(data.examples[0])}\n`);
        }
        if (data.fixes && data.fixes.length > 0) {
          output += chalk.blue(`    Suggested fix: ${data.fixes[0].action}\n`);
        }
      });
  }
  
  return output;
}

function groupIssuesByType(reports: DetailedValidationReport[]) {
  const issues: {
    [key: string]: {
      count: number;
      severity: 'error' | 'warning';
      examples: any[];
      fixes?: AutoFixResult[];
    };
  } = {};

  reports.forEach(report => {
    const addIssue = (error: ValidationError) => {
      if (!issues[error.message]) {
        issues[error.message] = {
          count: 0,
          severity: error.type,
          examples: [],
          fixes: []
        };
      }
      issues[error.message].count++;
      if (issues[error.message].examples.length < 3 && error.details) {
        issues[error.message].examples.push(error.details);
      }
      if (report.autoFixes) {
        issues[error.message].fixes = report.autoFixes;
      }
    };

    report.validationResult.errors.forEach(addIssue);
    report.validationResult.warnings.forEach(addIssue);
  });

  return issues;
}

function formatPerformanceSection(reports: DetailedValidationReport[]): string {
  let output = chalk.bold('\n⚡ Performance Metrics\n');
  
  const totalValidationTime = reports.reduce((sum, r) => sum + (r.performance?.validationTime || 0), 0);
  const totalFixTime = reports.reduce((sum, r) => sum + (r.performance?.fixTime || 0), 0);
  const avgValidationTime = totalValidationTime / reports.length;
  
  output += `${chalk.gray('Total Validation Time:')} ${totalValidationTime.toFixed(2)}ms\n`;
  output += `${chalk.gray('Average per Document:')} ${avgValidationTime.toFixed(2)}ms\n`;
  if (totalFixTime > 0) {
    output += `${chalk.gray('Total Fix Time:')} ${totalFixTime.toFixed(2)}ms\n`;
  }
  
  // Performance recommendations
  if (avgValidationTime > 50) {
    output += chalk.yellow('\n⚠️  Performance Recommendations:\n');
    output += '  - Consider batch processing for large collections\n';
    output += '  - Review validation rules complexity\n';
    output += '  - Consider implementing caching for repeated validations\n';
  }
  
  return output;
}

export function formatProgressBar(current: number, total: number, width: number = 40): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const filledBar = chalk.green('█'.repeat(filled));
  const emptyBar = chalk.gray('░'.repeat(empty));
  
  return `${filledBar}${emptyBar} ${percentage}% (${current}/${total})`;
}

export function formatIssueDetails(error: ValidationError): string {
  let output = '';
  
  const icon = error.type === 'error' ? '❌' : '⚠️';
  const color = error.type === 'error' ? 'red' : 'yellow';
  
  output += chalk[color](`${icon} ${error.message}\n`);
  
  if (error.details) {
    output += chalk.gray('Details:\n');
    Object.entries(error.details).forEach(([key, value]) => {
      output += chalk.gray(`  ${key}: ${JSON.stringify(value)}\n`);
    });
  }
  
  if (error.fixes) {
    output += chalk.blue('Suggested Fixes:\n');
    error.fixes.forEach(fix => {
      output += `  • ${fix.description}\n`;
      output += chalk.gray(`    Action: ${fix.action}\n`);
      if (fix.example) {
        output += chalk.gray(`    Example: ${fix.example}\n`);
      }
    });
  }
  
  return output;
}

export function formatFixResults(fixes: AutoFixResult[]): string {
  let output = chalk.bold('\n🔧 Applied Fixes\n');
  
  fixes.forEach(fix => {
    output += chalk.green(`✓ ${fix.field}: ${fix.fixApplied}\n`);
    output += chalk.gray(`  Before: ${JSON.stringify(fix.oldValue)}\n`);
    output += chalk.gray(`  After:  ${JSON.stringify(fix.newValue)}\n`);
  });
  
  return output;
} 