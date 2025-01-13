import { MongoClient, Collection, Db, Document, CollectionOptions } from 'mongodb';
import chalk from 'chalk';

interface OperationMetrics {
  operation: string;
  collection: string;
  duration: number;
  documentsAffected: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface CollectionMetrics {
  name: string;
  totalOperations: number;
  averageDuration: number;
  successRate: number;
  operationCounts: { [key: string]: number };
  errors: { message: string; count: number }[];
}

interface PerformanceReport {
  timestamp: Date;
  collections: { [key: string]: CollectionMetrics };
  slowestOperations: OperationMetrics[];
  overallSuccessRate: number;
  totalOperations: number;
  averageResponseTime: number;
}

class DatabasePerformanceMonitor {
  private metrics: OperationMetrics[] = [];
  private readonly slowOperationThreshold: number;

  constructor(slowOperationThresholdMs: number = 100) {
    this.slowOperationThreshold = slowOperationThresholdMs;
  }

  async trackOperation<T>(
    operation: string,
    collection: string,
    callback: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let error: string | undefined;
    let result: T;
    let documentsAffected = 0;

    try {
      result = await callback();
      if (Array.isArray(result)) {
        documentsAffected = result.length;
      } else if (typeof result === 'object' && result !== null) {
        documentsAffected = 'modifiedCount' in result ? (result as any).modifiedCount :
                           'insertedCount' in result ? (result as any).insertedCount :
                           'deletedCount' in result ? (result as any).deletedCount : 1;
      }
      return result;
    } catch (e) {
      success = false;
      error = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.metrics.push({
        operation,
        collection,
        duration,
        documentsAffected,
        timestamp: new Date(),
        success,
        error
      });

      if (duration > this.slowOperationThreshold) {
        console.warn(chalk.yellow(
          `⚠️  Slow operation detected: ${operation} on ${collection} took ${duration}ms`
        ));
      }
    }
  }

  generateReport(timeWindowMs?: number): PerformanceReport {
    const now = new Date();
    const metrics = timeWindowMs
      ? this.metrics.filter(m => now.getTime() - m.timestamp.getTime() <= timeWindowMs)
      : this.metrics;

    const collections: { [key: string]: CollectionMetrics } = {};
    let totalDuration = 0;
    let totalSuccessful = 0;

    // Process metrics by collection
    metrics.forEach(metric => {
      if (!collections[metric.collection]) {
        collections[metric.collection] = {
          name: metric.collection,
          totalOperations: 0,
          averageDuration: 0,
          successRate: 0,
          operationCounts: {},
          errors: []
        };
      }

      const col = collections[metric.collection];
      col.totalOperations++;
      col.averageDuration = (col.averageDuration * (col.totalOperations - 1) + metric.duration) / col.totalOperations;
      col.operationCounts[metric.operation] = (col.operationCounts[metric.operation] || 0) + 1;

      if (metric.success) {
        totalSuccessful++;
      } else if (metric.error) {
        const existingError = col.errors.find(e => e.message === metric.error);
        if (existingError) {
          existingError.count++;
        } else {
          col.errors.push({ message: metric.error, count: 1 });
        }
      }

      totalDuration += metric.duration;
    });

    // Calculate success rates
    Object.values(collections).forEach(col => {
      const successful = metrics.filter(m => 
        m.collection === col.name && m.success
      ).length;
      col.successRate = successful / col.totalOperations;
    });

    // Find slowest operations
    const slowestOperations = [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      timestamp: now,
      collections,
      slowestOperations,
      overallSuccessRate: totalSuccessful / metrics.length,
      totalOperations: metrics.length,
      averageResponseTime: totalDuration / metrics.length
    };
  }

  formatReport(report: PerformanceReport): string {
    let output = '\n📊 Database Performance Report\n';
    output += `${chalk.gray('Generated at:')} ${report.timestamp.toISOString()}\n\n`;

    // Overall statistics
    output += `${chalk.bold('Overall Statistics')}\n`;
    output += `${chalk.gray('Total Operations:')} ${report.totalOperations}\n`;
    output += `${chalk.gray('Success Rate:')} ${(report.overallSuccessRate * 100).toFixed(1)}%\n`;
    output += `${chalk.gray('Average Response Time:')} ${report.averageResponseTime.toFixed(2)}ms\n\n`;

    // Collection statistics
    output += `${chalk.bold('Collection Statistics')}\n`;
    Object.entries(report.collections).forEach(([collection, metrics]) => {
      output += `\n${chalk.cyan(collection)}\n`;
      output += `  Operations: ${metrics.totalOperations}\n`;
      output += `  Avg Duration: ${metrics.averageDuration.toFixed(2)}ms\n`;
      output += `  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%\n`;
      
      // Operation breakdown
      output += '  Operation Counts:\n';
      Object.entries(metrics.operationCounts).forEach(([op, count]) => {
        output += `    ${op}: ${count}\n`;
      });

      // Errors if any
      if (metrics.errors.length > 0) {
        output += '  Errors:\n';
        metrics.errors.forEach(error => {
          output += `    - ${error.message} (${error.count} times)\n`;
        });
      }
    });

    // Slowest operations
    output += `\n${chalk.bold('Slowest Operations')}\n`;
    report.slowestOperations.forEach((op, index) => {
      output += `${index + 1}. ${op.operation} on ${op.collection}\n`;
      output += `   Duration: ${op.duration}ms\n`;
      output += `   Documents Affected: ${op.documentsAffected}\n`;
      output += `   Success: ${op.success ? '✅' : '❌'}\n`;
      if (op.error) {
        output += `   Error: ${op.error}\n`;
      }
    });

    return output;
  }

  generateRecommendations(report: PerformanceReport): string {
    let output = '\n📋 Performance Recommendations\n\n';

    // Analyze slow operations
    if (report.averageResponseTime > this.slowOperationThreshold) {
      output += `${chalk.yellow('⚠️')} High average response time detected\n`;
      output += '   - Consider adding indexes for frequently queried fields\n';
      output += '   - Review query patterns for optimization\n';
      output += '   - Monitor server resources\n\n';
    }

    // Analyze collection-specific issues
    Object.entries(report.collections).forEach(([collection, metrics]) => {
      if (metrics.successRate < 0.95) {
        output += `${chalk.red('❌')} Low success rate in ${collection}\n`;
        output += '   - Review error patterns\n';
        output += '   - Check validation rules\n';
        output += '   - Verify data consistency\n\n';
      }

      if (metrics.averageDuration > this.slowOperationThreshold) {
        output += `${chalk.yellow('⚠️')} Slow operations in ${collection}\n`;
        output += '   - Review indexes\n';
        output += '   - Check for large document sizes\n';
        output += '   - Consider data denormalization\n\n';
      }

      // Operation-specific recommendations
      const ops = metrics.operationCounts;
      if (ops.find > 100 && metrics.averageDuration > 50) {
        output += `${chalk.yellow('⚠️')} High number of slow finds in ${collection}\n`;
        output += '   - Add indexes for common query patterns\n';
        output += '   - Consider implementing caching\n\n';
      }

      if (ops.update > 100 && metrics.averageDuration > 50) {
        output += `${chalk.yellow('⚠️')} High number of slow updates in ${collection}\n`;
        output += '   - Review update patterns\n';
        output += '   - Consider batch updates\n';
        output += '   - Check index coverage\n\n';
      }
    });

    return output;
  }

  reset(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new DatabasePerformanceMonitor();

// Utility function to wrap a MongoDB collection with performance monitoring
export function wrapCollectionWithMonitoring<TSchema extends Document = Document>(collection: Collection<TSchema>): Collection<TSchema> {
  const wrapper = new Proxy(collection, {
    get(target: Collection<TSchema>, prop: string | symbol) {
      const original = target[prop as keyof Collection<TSchema>];
      if (typeof original === 'function' && [
        'find', 'findOne', 'insertOne', 'insertMany',
        'updateOne', 'updateMany', 'deleteOne', 'deleteMany'
      ].includes(prop.toString())) {
        return async function(...args: any[]) {
          return performanceMonitor.trackOperation(
            prop.toString(),
            collection.collectionName,
            () => (original as Function).apply(target, args)
          );
        };
      }
      return original;
    }
  });

  return wrapper;
}

// Utility function to wrap a MongoDB database with performance monitoring
export function wrapDatabaseWithMonitoring(db: Db): Db {
  const originalCollection = db.collection;
  db.collection = function<TSchema extends Document = Document>(name: string, options?: CollectionOptions): Collection<TSchema> {
    const collection = originalCollection.call(db, name, options);
    return wrapCollectionWithMonitoring(collection as unknown as Collection<TSchema>) as Collection<TSchema>;
  };
  return db;
} 