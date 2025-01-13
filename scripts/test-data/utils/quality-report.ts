import { ValidationResult, ValidationError } from './validation-utils';
import { MongoClient, Collection } from 'mongodb';
import chalk from 'chalk';

interface ValidationIssue {
  details?: {
    updatedAt?: Date;
    createdAt?: Date;
    [key: string]: any;
  };
}

interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
}

interface CollectionStats {
  totalDocuments: number;
  validDocuments: number;
  errorCount: number;
  warningCount: number;
  metrics: QualityMetrics;
}

interface DataQualityReport {
  timestamp: Date;
  collections: {
    [key: string]: CollectionStats;
  };
  overallScore: number;
  performance: {
    validationDuration: number;
    avgValidationTimePerDoc: number;
  };
}

export async function generateQualityReport(
  client: MongoClient,
  dbName: string,
  validationResults: Map<string, ValidationResult[]>
): Promise<DataQualityReport> {
  const startTime = Date.now();
  const report: DataQualityReport = {
    timestamp: new Date(),
    collections: {},
    overallScore: 0,
    performance: {
      validationDuration: 0,
      avgValidationTimePerDoc: 0,
    },
  };

  // Convert Map entries to array for iteration
  const entries = Array.from(validationResults.entries());
  for (const [collectionName, results] of entries) {
    const collection = client.db(dbName).collection(collectionName);
    const totalDocs = await collection.countDocuments();
    
    const stats = calculateCollectionStats(results, totalDocs);
    report.collections[collectionName] = stats;
  }

  // Calculate overall score
  const collectionScores = Object.values(report.collections).map(stats => 
    calculateOverallScore(stats.metrics)
  );
  report.overallScore = collectionScores.reduce((a, b) => a + b, 0) / collectionScores.length;

  // Add performance metrics
  const endTime = Date.now();
  report.performance = {
    validationDuration: endTime - startTime,
    avgValidationTimePerDoc: (endTime - startTime) / getTotalDocuments(report),
  };

  return report;
}

function calculateCollectionStats(results: ValidationResult[], totalDocs: number): CollectionStats {
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const validDocs = results.filter(r => r.isValid).length;

  const metrics = {
    completeness: validDocs / totalDocs,
    accuracy: 1 - (errorCount / (totalDocs * 10)), // Normalize errors
    consistency: 1 - (warningCount / (totalDocs * 5)), // Normalize warnings
    timeliness: calculateTimelinessScore(results),
  };

  return {
    totalDocuments: totalDocs,
    validDocuments: validDocs,
    errorCount,
    warningCount,
    metrics,
  };
}

function calculateTimelinessScore(results: ValidationResult[]): number {
  const now = new Date();
  let score = 0;
  let count = 0;

  results.forEach(result => {
    const issues = [...result.errors, ...result.warnings] as ValidationError[];
    issues.forEach(issue => {
      if (issue.details?.updatedAt || issue.details?.createdAt) {
        const dateStr = issue.details.updatedAt || issue.details.createdAt;
        const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
        const age = now.getTime() - date.getTime();
        const ageInDays = age / (1000 * 60 * 60 * 24);
        score += Math.max(0, 1 - (ageInDays / 365)); // Score decreases with age
        count++;
      }
    });
  });

  return count > 0 ? score / count : 1;
}

function calculateOverallScore(metrics: QualityMetrics): number {
  const weights = {
    completeness: 0.4,
    accuracy: 0.3,
    consistency: 0.2,
    timeliness: 0.1,
  };

  return (
    metrics.completeness * weights.completeness +
    metrics.accuracy * weights.accuracy +
    metrics.consistency * weights.consistency +
    metrics.timeliness * weights.timeliness
  );
}

function getTotalDocuments(report: DataQualityReport): number {
  return Object.values(report.collections).reduce(
    (sum, stats) => sum + stats.totalDocuments,
    0
  );
}

export function formatQualityReport(report: DataQualityReport): string {
  let output = '\n📊 Data Quality Report\n';
  output += `${chalk.gray('Generated at:')} ${report.timestamp.toISOString()}\n\n`;

  // Overall score
  const scoreColor = report.overallScore >= 0.9 ? 'green' : report.overallScore >= 0.7 ? 'yellow' : 'red';
  output += `${chalk.bold('Overall Quality Score:')} ${chalk[scoreColor]((report.overallScore * 100).toFixed(1))}%\n\n`;

  // Collection details
  for (const [collectionName, stats] of Object.entries(report.collections)) {
    output += `${chalk.bold(collectionName)}\n`;
    output += `${chalk.gray('Documents:')} ${stats.validDocuments}/${stats.totalDocuments} valid\n`;
    output += `${chalk.gray('Issues:')} ${chalk.red(stats.errorCount.toString())} errors, ${chalk.yellow(stats.warningCount.toString())} warnings\n`;
    
    // Metrics
    output += `${chalk.gray('Metrics:')}\n`;
    for (const [metric, value] of Object.entries(stats.metrics)) {
      const metricColor = value >= 0.9 ? 'green' : value >= 0.7 ? 'yellow' : 'red';
      output += `  ${chalk.gray(metric)}: ${chalk[metricColor]((value * 100).toFixed(1))}%\n`;
    }
    output += '\n';
  }

  // Performance metrics
  output += `${chalk.bold('Performance')}\n`;
  output += `${chalk.gray('Total Duration:')} ${report.performance.validationDuration}ms\n`;
  output += `${chalk.gray('Avg Time per Doc:')} ${report.performance.avgValidationTimePerDoc.toFixed(2)}ms\n`;

  return output;
}

export function generateRecommendations(report: DataQualityReport): string {
  let output = '\n📋 Recommendations\n\n';

  for (const [collectionName, stats] of Object.entries(report.collections)) {
    const { metrics } = stats;
    
    if (metrics.completeness < 0.95) {
      output += `${chalk.yellow('⚠️')} ${collectionName}: Improve data completeness\n`;
      output += `   - Review required fields implementation\n`;
      output += `   - Consider data enrichment processes\n`;
    }

    if (metrics.accuracy < 0.9) {
      output += `${chalk.red('❌')} ${collectionName}: Address data accuracy issues\n`;
      output += `   - Implement stricter validation rules\n`;
      output += `   - Review error patterns in validation results\n`;
    }

    if (metrics.consistency < 0.9) {
      output += `${chalk.yellow('⚠️')} ${collectionName}: Improve data consistency\n`;
      output += `   - Review and standardize data formats\n`;
      output += `   - Consider implementing data normalization\n`;
    }

    if (metrics.timeliness < 0.8) {
      output += `${chalk.yellow('⚠️')} ${collectionName}: Address data freshness\n`;
      output += `   - Review update frequency\n`;
      output += `   - Consider implementing auto-update mechanisms\n`;
    }
  }

  return output;
} 