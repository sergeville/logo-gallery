import { ObjectId } from 'mongodb';
import chalk from 'chalk';

export interface DataQualityMetrics {
  completeness: {
    score: number;
    missingFields: { [key: string]: number };
  };
  consistency: {
    score: number;
    issues: string[];
  };
  validity: {
    score: number;
    invalidFields: { [key: string]: number };
  };
  distribution: {
    userLogosDistribution: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
    categoriesDistribution: {
      [category: string]: number;
    };
    tagsDistribution: {
      [tag: string]: number;
    };
  };
  timeliness: {
    oldestRecord: Date;
    newestRecord: Date;
    averageAge: number;
  };
}

export interface QualityReport {
  metrics: DataQualityMetrics;
  recommendations: string[];
}

function calculateMedian(numbers: number[]): number {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function calculateDistributionMetrics(numbers: number[]) {
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
    median: calculateMedian(numbers),
  };
}

export function calculateDataQualityMetrics(users: any[], logos: any[]): QualityReport {
  const metrics: DataQualityMetrics = {
    completeness: { score: 0, missingFields: {} },
    consistency: { score: 0, issues: [] },
    validity: { score: 0, invalidFields: {} },
    distribution: {
      userLogosDistribution: { min: 0, max: 0, avg: 0, median: 0 },
      categoriesDistribution: {},
      tagsDistribution: {},
    },
    timeliness: {
      oldestRecord: new Date(),
      newestRecord: new Date(0),
      averageAge: 0,
    },
  };

  const recommendations: string[] = [];

  // Completeness Check
  const requiredUserFields = ['email', 'username', 'name', 'profile'];
  const requiredLogoFields = ['name', 'imageUrl', 'thumbnailUrl', 'ownerId', 'category', 'tags'];

  users.forEach(user => {
    requiredUserFields.forEach(field => {
      if (!user[field]) {
        metrics.completeness.missingFields[`user.${field}`] = 
          (metrics.completeness.missingFields[`user.${field}`] || 0) + 1;
      }
    });
  });

  logos.forEach(logo => {
    requiredLogoFields.forEach(field => {
      if (!logo[field]) {
        metrics.completeness.missingFields[`logo.${field}`] = 
          (metrics.completeness.missingFields[`logo.${field}`] || 0) + 1;
      }
    });
  });

  // Calculate completeness score
  const totalFields = (users.length * requiredUserFields.length) + 
                     (logos.length * requiredLogoFields.length);
  const missingFieldsCount = Object.values(metrics.completeness.missingFields)
    .reduce((sum, count) => sum + count, 0);
  metrics.completeness.score = 1 - (missingFieldsCount / totalFields);

  // Consistency Check
  const userIds = new Set(users.map(u => u._id.toString()));
  const inconsistentOwnerIds = logos.filter(l => !userIds.has(l.ownerId.toString())).length;
  
  if (inconsistentOwnerIds > 0) {
    metrics.consistency.issues.push(`Found ${inconsistentOwnerIds} logos with invalid owner references`);
  }

  metrics.consistency.score = 1 - (inconsistentOwnerIds / logos.length);

  // Validity Check
  users.forEach(user => {
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      metrics.validity.invalidFields['user.email'] = 
        (metrics.validity.invalidFields['user.email'] || 0) + 1;
    }
  });

  logos.forEach(logo => {
    if (logo.imageUrl && !/^https?:\/\/.+/.test(logo.imageUrl)) {
      metrics.validity.invalidFields['logo.imageUrl'] = 
        (metrics.validity.invalidFields['logo.imageUrl'] || 0) + 1;
    }
  });

  const totalValidations = users.length + logos.length;
  const invalidFieldsCount = Object.values(metrics.validity.invalidFields)
    .reduce((sum, count) => sum + count, 0);
  metrics.validity.score = 1 - (invalidFieldsCount / totalValidations);

  // Distribution Analysis
  const logosByUser = new Map<string, number>();
  logos.forEach(logo => {
    const ownerId = logo.ownerId.toString();
    logosByUser.set(ownerId, (logosByUser.get(ownerId) || 0) + 1);
    
    // Category distribution
    metrics.distribution.categoriesDistribution[logo.category] = 
      (metrics.distribution.categoriesDistribution[logo.category] || 0) + 1;
    
    // Tags distribution
    logo.tags.forEach((tag: string) => {
      metrics.distribution.tagsDistribution[tag] = 
        (metrics.distribution.tagsDistribution[tag] || 0) + 1;
    });
  });

  metrics.distribution.userLogosDistribution = calculateDistributionMetrics(
    Array.from(logosByUser.values())
  );

  // Timeliness Analysis
  const allDates = [
    ...users.map(u => u.createdAt),
    ...logos.map(l => l.createdAt),
  ].map(d => new Date(d));

  metrics.timeliness.oldestRecord = new Date(Math.min(...allDates.map(d => d.getTime())));
  metrics.timeliness.newestRecord = new Date(Math.max(...allDates.map(d => d.getTime())));
  metrics.timeliness.averageAge = (Date.now() - 
    allDates.reduce((sum, date) => sum + date.getTime(), 0) / allDates.length) / 
    (1000 * 60 * 60 * 24); // Convert to days

  // Generate Recommendations
  if (metrics.completeness.score < 0.95) {
    recommendations.push('Consider adding missing required fields');
  }

  if (metrics.consistency.score < 1) {
    recommendations.push('Fix invalid owner references in logos');
  }

  if (metrics.validity.score < 0.95) {
    recommendations.push('Address invalid email formats and URLs');
  }

  const { avg, max } = metrics.distribution.userLogosDistribution;
  if (max > avg * 3) {
    recommendations.push('Consider redistributing logos more evenly among users');
  }

  if (metrics.timeliness.averageAge > 180) {
    recommendations.push('Consider updating older records');
  }

  return { metrics, recommendations };
}

export function printQualityReport(report: QualityReport) {
  console.log(chalk.blue('\nData Quality Report'));
  console.log(chalk.blue('==================='));

  // Completeness
  console.log(chalk.white('\nCompleteness Score:'), 
    chalk.cyan(`${(report.metrics.completeness.score * 100).toFixed(1)}%`));
  if (Object.keys(report.metrics.completeness.missingFields).length > 0) {
    console.log(chalk.gray('Missing Fields:'));
    Object.entries(report.metrics.completeness.missingFields).forEach(([field, count]) => {
      console.log(chalk.gray(`  - ${field}: ${count} records`));
    });
  }

  // Consistency
  console.log(chalk.white('\nConsistency Score:'), 
    chalk.cyan(`${(report.metrics.consistency.score * 100).toFixed(1)}%`));
  if (report.metrics.consistency.issues.length > 0) {
    console.log(chalk.gray('Issues:'));
    report.metrics.consistency.issues.forEach(issue => {
      console.log(chalk.gray(`  - ${issue}`));
    });
  }

  // Validity
  console.log(chalk.white('\nValidity Score:'), 
    chalk.cyan(`${(report.metrics.validity.score * 100).toFixed(1)}%`));
  if (Object.keys(report.metrics.validity.invalidFields).length > 0) {
    console.log(chalk.gray('Invalid Fields:'));
    Object.entries(report.metrics.validity.invalidFields).forEach(([field, count]) => {
      console.log(chalk.gray(`  - ${field}: ${count} records`));
    });
  }

  // Distribution
  console.log(chalk.white('\nDistribution Metrics:'));
  const dist = report.metrics.distribution.userLogosDistribution;
  console.log(chalk.gray(`  Logos per User: min=${dist.min}, max=${dist.max}, avg=${dist.avg.toFixed(1)}, median=${dist.median}`));
  
  console.log(chalk.gray('\n  Top Categories:'));
  Object.entries(report.metrics.distribution.categoriesDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([category, count]) => {
      console.log(chalk.gray(`    - ${category}: ${count} logos`));
    });

  console.log(chalk.gray('\n  Top Tags:'));
  Object.entries(report.metrics.distribution.tagsDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([tag, count]) => {
      console.log(chalk.gray(`    - ${tag}: ${count} uses`));
    });

  // Timeliness
  console.log(chalk.white('\nTimeliness:'));
  console.log(chalk.gray(`  Oldest Record: ${report.metrics.timeliness.oldestRecord.toLocaleDateString()}`));
  console.log(chalk.gray(`  Newest Record: ${report.metrics.timeliness.newestRecord.toLocaleDateString()}`));
  console.log(chalk.gray(`  Average Age: ${report.metrics.timeliness.averageAge.toFixed(1)} days`));

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(chalk.yellow('\nRecommendations:'));
    report.recommendations.forEach(rec => {
      console.log(chalk.yellow(`  • ${rec}`));
    });
  }
} 