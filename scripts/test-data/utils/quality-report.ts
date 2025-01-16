import { ValidationResult, ValidationError } from '@/app/lib/validation';
import chalk from 'chalk';

interface QualityMetrics {
  totalDocuments: number;
  validDocuments: number;
  errorCount: number;
  warningCount: number;
  completeness: number;
  validity: number;
}

interface QualityReport {
  metrics: QualityMetrics;
  recommendations: string[];
}

export function generateQualityReport(results: ValidationResult[]): QualityReport {
  const metrics = calculateMetrics(results);
  const recommendations = generateRecommendations(metrics);

  return {
    metrics,
    recommendations
  };
}

function calculateMetrics(results: ValidationResult[]): QualityMetrics {
  const totalDocuments = results.length;
  const validDocuments = results.filter(r => r.errors.length === 0).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    totalDocuments,
    validDocuments,
    errorCount,
    warningCount,
    completeness: validDocuments / totalDocuments,
    validity: 1 - (errorCount / totalDocuments)
  };
}

function generateRecommendations(metrics: QualityMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.completeness < 0.95) {
    recommendations.push('Improve data completeness by ensuring all required fields are present');
  }

  if (metrics.validity < 0.95) {
    recommendations.push('Address validation errors to improve data quality');
  }

  if (metrics.warningCount > 0) {
    recommendations.push('Review and address warnings to enhance data quality');
  }

  return recommendations;
}

export function formatQualityReport(report: QualityReport): string {
  let output = chalk.blue('\nQuality Report\n');

  output += chalk.white('\nMetrics:\n');
  output += chalk.gray(`Total Documents: ${report.metrics.totalDocuments}\n`);
  output += chalk.green(`Valid Documents: ${report.metrics.validDocuments}\n`);
  output += chalk.red(`Error Count: ${report.metrics.errorCount}\n`);
  output += chalk.yellow(`Warning Count: ${report.metrics.warningCount}\n`);
  output += chalk.cyan(`Completeness: ${(report.metrics.completeness * 100).toFixed(2)}%\n`);
  output += chalk.cyan(`Validity: ${(report.metrics.validity * 100).toFixed(2)}%\n`);

  if (report.recommendations.length > 0) {
    output += chalk.white('\nRecommendations:\n');
    report.recommendations.forEach(rec => {
      output += chalk.yellow(`• ${rec}\n`);
    });
  }

  return output;
} 