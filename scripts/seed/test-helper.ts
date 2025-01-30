import { MongoClient, Db, Collection as MongoCollection } from 'mongodb';
import { DatabaseHelper } from '@/scripts/seed/db-helper';
import { User, Logo, Comment, Collection } from '@/scripts/seed/types';
import { TEST_CONFIG } from '@/scripts/seed/__tests__/test-config';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  duration: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
  };
  queryCount: number;
  cpuUsage?: {
    user: number;
    system: number;
  };
  eventLoopLag: number;
  gcMetrics?: {
    minorGCs: number;
    majorGCs: number;
    incrementalMarkings: number;
  };
}

interface StressTestMetrics extends PerformanceMetrics {
  concurrentOperations: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  latencyPercentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

interface StressTestOptions {
  operation: () => Promise<any>;
  concurrency: number;
  iterations: number;
  rampUpPeriod?: number;
  coolDownPeriod?: number;
  targetRPS?: number;
  maxDuration?: number;
  stopOnError?: boolean;
}

interface StressTestResult {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalDuration: number;
    averageRPS: number;
    peakRPS: number;
    averageLatency: number;
    errorRate: number;
    successRate: number;
  };
  latencyPercentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  errors: Array<{
    timestamp: number;
    error: string;
    operation: string;
  }>;
  throughputOverTime: Array<{
    timestamp: number;
    rps: number;
    successRate: number;
    averageLatency: number;
  }>;
  resourceUtilization: {
    averageCPU: number;
    peakCPU: number;
    averageMemory: number;
    peakMemory: number;
    averageEventLoopLag: number;
    peakEventLoopLag: number;
  };
}

export class TestHelper {
  private static client: MongoClient;
  private static db: Db;
  private static dbHelper: DatabaseHelper;
  private static performanceMetrics: { [key: string]: PerformanceMetrics[] } = {};
  private static queryCount: number = 0;

  static async setup(): Promise<void> {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTest';
    this.client = await MongoClient.connect(uri);
    this.db = this.client.db();
    this.dbHelper = new DatabaseHelper();
    await this.dbHelper.connect();
    this.resetMetrics();
  }

  private static resetMetrics(): void {
    this.performanceMetrics = {};
    this.queryCount = 0;
  }

  static async cleanup(): Promise<void> {
    if (this.dbHelper) {
      await this.dbHelper.clearCollections();
      await this.dbHelper.disconnect();
    }
    if (this.client) {
      await this.client.close();
    }
    this.resetMetrics();
  }

  // Enhanced performance testing utilities
  static async measureOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startMemory = process.memoryUsage();
    const startCPU = process.cpuUsage();
    const startTime = performance.now();
    const initialQueryCount = this.queryCount;
    const startGCMetrics = await this.getGCMetrics();
    const eventLoopLagStart = await this.measureEventLoopLag();

    try {
      const result = await operation();
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const endCPU = process.cpuUsage(startCPU);
      const eventLoopLagEnd = await this.measureEventLoopLag();
      const endGCMetrics = await this.getGCMetrics();

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memory: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          rss: endMemory.rss - startMemory.rss,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        queryCount: this.queryCount - initialQueryCount,
        cpuUsage: {
          user: endCPU.user,
          system: endCPU.system
        },
        eventLoopLag: eventLoopLagEnd - eventLoopLagStart,
        gcMetrics: {
          minorGCs: endGCMetrics.minorGCs - startGCMetrics.minorGCs,
          majorGCs: endGCMetrics.majorGCs - startGCMetrics.majorGCs,
          incrementalMarkings: endGCMetrics.incrementalMarkings - startGCMetrics.incrementalMarkings
        }
      };

      if (!this.performanceMetrics[operationName]) {
        this.performanceMetrics[operationName] = [];
      }
      this.performanceMetrics[operationName].push(metrics);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static getPerformanceReport(operationName?: string): {
    [key: string]: {
      avgDuration: number;
      avgMemoryUsed: number;
      avgQueryCount: number;
      p95Duration: number;
      p95MemoryUsed: number;
      totalOperations: number;
    };
  } {
    const metrics = operationName 
      ? { [operationName]: this.performanceMetrics[operationName] || [] }
      : this.performanceMetrics;

    return Object.entries(metrics).reduce((report, [name, opMetrics]) => {
      if (opMetrics.length === 0) return report;

      const durations = opMetrics.map(m => m.duration);
      const memoryUsed = opMetrics.map(m => m.memory.heapUsed);
      const queryCounts = opMetrics.map(m => m.queryCount);

      report[name] = {
        avgDuration: this.calculateAverage(durations),
        avgMemoryUsed: this.calculateAverage(memoryUsed),
        avgQueryCount: this.calculateAverage(queryCounts),
        p95Duration: this.calculatePercentile(durations, 95),
        p95MemoryUsed: this.calculatePercentile(memoryUsed, 95),
        totalOperations: opMetrics.length
      };

      return report;
    }, {} as any);
  }

  // Enhanced data validation utilities
  static async validateSchema(collection: string, validator: (doc: any) => boolean): Promise<{
    isValid: boolean;
    invalidDocs: { _id: any; errors: string[] }[];
  }> {
    const docs = await this.db.collection(collection).find().toArray();
    const invalidDocs = docs
      .map(doc => {
        try {
          const isValid = validator(doc);
          return isValid ? null : { _id: doc._id, errors: ['Schema validation failed'] };
        } catch (error) {
          return { _id: doc._id, errors: [(error as Error).message] };
        }
      })
      .filter(Boolean) as { _id: any; errors: string[] }[];

    return {
      isValid: invalidDocs.length === 0,
      invalidDocs
    };
  }

  // Stress testing utilities
  static async runStressTest(options: StressTestOptions): Promise<StressTestResult> {
    const startTime = performance.now();
    const results: Array<{
      timestamp: number;
      duration: number;
      success: boolean;
      error?: string;
      metrics: PerformanceMetrics;
    }> = [];
    
    const timeWindow = 1000; // 1 second window for RPS calculation
    const throughputData: Array<{
      timestamp: number;
      rps: number;
      successRate: number;
      averageLatency: number;
    }> = [];

    let activeRequests = 0;
    let completedRequests = 0;
    let rampUpDelay = 0;

    if (options.rampUpPeriod) {
      rampUpDelay = options.rampUpPeriod / options.iterations;
    }

    const runOperation = async (iteration: number): Promise<void> => {
      if (options.maxDuration && performance.now() - startTime > options.maxDuration) {
        return;
      }

      activeRequests++;
      const operationStart = performance.now();

      try {
        const metrics = await this.measureOperation(
          options.operation,
          `stress_test_${iteration}`
        );
        
        results.push({
          timestamp: operationStart,
          duration: performance.now() - operationStart,
          success: true,
          metrics: metrics as PerformanceMetrics
        });

        if (options.targetRPS) {
          const actualRPS = this.calculateCurrentRPS(results, timeWindow);
          if (actualRPS > options.targetRPS && options.targetRPS > 0) {
            await new Promise(resolve => 
              setTimeout(resolve, Math.floor(1000 / options.targetRPS!))
            );
          }
        }
      } catch (error) {
        results.push({
          timestamp: operationStart,
          duration: performance.now() - operationStart,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metrics: {} as PerformanceMetrics
        });

        if (options.stopOnError) {
          throw error;
        }
      } finally {
        activeRequests--;
        completedRequests++;
        
        // Calculate and store throughput data
        if (completedRequests % 10 === 0) { // Store data every 10 requests
          const windowResults = this.getResultsInWindow(results, timeWindow);
          throughputData.push({
            timestamp: performance.now(),
            rps: windowResults.length,
            successRate: windowResults.filter(r => r.success).length / windowResults.length,
            averageLatency: this.calculateAverage(windowResults.map(r => r.duration))
          });
        }
      }
    };

    // Run the stress test
    try {
      for (let i = 0; i < options.iterations; i += options.concurrency) {
        const batch = Array(Math.min(options.concurrency, options.iterations - i))
          .fill(null)
          .map((_, index) => runOperation(i + index));

        if (rampUpDelay) {
          await new Promise(resolve => setTimeout(resolve, rampUpDelay));
        }

        await Promise.all(batch);
      }

      // Cool down period if specified
      if (options.coolDownPeriod) {
        await new Promise(resolve => 
          setTimeout(resolve, options.coolDownPeriod)
        );
      }
    } catch (error) {
      if (options.stopOnError) {
        throw error;
      }
    }

    const durations = results.map(r => r.duration);
    const successfulResults = results.filter(r => r.success);
    const totalDuration = performance.now() - startTime;

    // Calculate resource utilization
    const resourceMetrics = results.map(r => r.metrics).filter(m => m.cpuUsage);
    const cpuUsage = resourceMetrics.map(m => m.cpuUsage!.user + m.cpuUsage!.system);
    const memoryUsage = resourceMetrics.map(m => m.memory.heapUsed);
    const eventLoopLags = resourceMetrics.map(m => m.eventLoopLag);

    return {
      summary: {
        totalRequests: results.length,
        successfulRequests: successfulResults.length,
        failedRequests: results.length - successfulResults.length,
        totalDuration,
        averageRPS: (results.length / totalDuration) * 1000,
        peakRPS: Math.max(...throughputData.map(d => d.rps)),
        averageLatency: this.calculateAverage(durations),
        errorRate: (results.length - successfulResults.length) / results.length,
        successRate: successfulResults.length / results.length
      },
      latencyPercentiles: {
        p50: this.calculatePercentile(durations, 50),
        p75: this.calculatePercentile(durations, 75),
        p90: this.calculatePercentile(durations, 90),
        p95: this.calculatePercentile(durations, 95),
        p99: this.calculatePercentile(durations, 99)
      },
      errors: results
        .filter(r => !r.success)
        .map(r => ({
          timestamp: r.timestamp,
          error: r.error || 'Unknown error',
          operation: 'stress_test'
        })),
      throughputOverTime: throughputData,
      resourceUtilization: {
        averageCPU: this.calculateAverage(cpuUsage),
        peakCPU: Math.max(...cpuUsage),
        averageMemory: this.calculateAverage(memoryUsage),
        peakMemory: Math.max(...memoryUsage),
        averageEventLoopLag: this.calculateAverage(eventLoopLags),
        peakEventLoopLag: Math.max(...eventLoopLags)
      }
    };
  }

  // Helper methods for performance monitoring
  private static async measureEventLoopLag(): Promise<number> {
    const start = performance.now();
    return new Promise<number>(resolve => {
      setImmediate(() => {
        resolve(performance.now() - start);
      });
    });
  }

  private static async getGCMetrics(): Promise<{
    minorGCs: number;
    majorGCs: number;
    incrementalMarkings: number;
  }> {
    // Note: This is a placeholder. In a real implementation,
    // you would use the v8 profiler or gc-stats module
    return {
      minorGCs: 0,
      majorGCs: 0,
      incrementalMarkings: 0
    };
  }

  private static calculateCurrentRPS(
    results: Array<{ timestamp: number }>,
    timeWindow: number
  ): number {
    const now = performance.now();
    const recentResults = this.getResultsInWindow(results, timeWindow);
    return (recentResults.length / timeWindow) * 1000;
  }

  private static getResultsInWindow<T extends { timestamp: number }>(
    results: T[],
    timeWindow: number
  ): T[] {
    const now = performance.now();
    return results.filter(r => now - r.timestamp <= timeWindow);
  }

  // Helper methods
  private static calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private static calculatePercentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  // Data validation utilities
  static async validateCollectionIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const db = this.getDb();

    // Check user references in logos
    const logos = await db.collection('logos').find().toArray();
    const userIds = new Set((await db.collection('users').find().project({ _id: 1 }).toArray()).map(u => u._id.toString()));
    
    for (const logo of logos) {
      if (!userIds.has(logo.userId.toString())) {
        errors.push(`Logo ${logo._id} references non-existent user ${logo.userId}`);
      }
    }

    // Check logo references in collections
    const collections = await db.collection('collections').find().toArray();
    const logoIds = new Set(logos.map(l => l._id.toString()));
    
    for (const collection of collections) {
      for (const logoId of collection.logos || []) {
        if (!logoIds.has(logoId.toString())) {
          errors.push(`Collection ${collection._id} references non-existent logo ${logoId}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async validateDataConstraints(): Promise<{
    isValid: boolean;
    violations: { collection: string; errors: string[] }[];
  }> {
    const violations: { collection: string; errors: string[] }[] = [];
    const db = this.getDb();

    // Validate users
    const users = await db.collection('users').find().toArray();
    for (const user of users) {
      const { isValid, errors } = this.validateUserSchema(user);
      if (!isValid) {
        violations.push({ collection: 'users', errors });
      }
    }

    // Validate logos
    const logos = await db.collection('logos').find().toArray();
    for (const logo of logos) {
      const { isValid, errors } = this.validateLogoSchema(logo);
      if (!isValid) {
        violations.push({ collection: 'logos', errors });
      }
    }

    // Validate comments
    const comments = await db.collection('comments').find().toArray();
    for (const comment of comments) {
      const { isValid, errors } = this.validateCommentSchema(comment);
      if (!isValid) {
        violations.push({ collection: 'comments', errors });
      }
    }

    // Validate collections
    const collections = await db.collection('collections').find().toArray();
    for (const collection of collections) {
      const { isValid, errors } = this.validateCollectionSchema(collection);
      if (!isValid) {
        violations.push({ collection: 'collections', errors });
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // Utility method to create test fixtures
  static async createFixtures(options: {
    users?: Partial<User>[];
    logos?: Partial<Logo>[];
    comments?: Partial<Comment>[];
    collections?: Partial<Collection>[];
  }): Promise<{
    users: User[];
    logos: Logo[];
    comments: Comment[];
    collections: Collection[];
  }> {
    const dbHelper = this.getDbHelper();
    const result = {
      users: [] as User[],
      logos: [] as Logo[],
      comments: [] as Comment[],
      collections: [] as Collection[]
    };

    if (options.users) {
      result.users = await Promise.all(
        options.users.map(user => dbHelper.createUser(user as User))
      );
    }

    if (options.logos) {
      result.logos = await Promise.all(
        options.logos.map(logo => dbHelper.createLogo(logo as Logo))
      );
    }

    if (options.comments) {
      result.comments = await Promise.all(
        options.comments.map(comment => dbHelper.createComment(comment as Comment))
      );
    }

    if (options.collections) {
      result.collections = await Promise.all(
        options.collections.map(collection => dbHelper.createCollection(collection as Collection))
      );
    }

    return result;
  }

  // Utility method to verify database state
  static async verifyDatabaseState(expected: {
    userCount?: number;
    logoCount?: number;
    commentCount?: number;
    collectionCount?: number;
  }): Promise<void> {
    const db = this.getDb();
    
    if (expected.userCount !== undefined) {
      const userCount = await db.collection('users').countDocuments();
      expect(userCount).toBe(expected.userCount);
    }

    if (expected.logoCount !== undefined) {
      const logoCount = await db.collection('logos').countDocuments();
      expect(logoCount).toBe(expected.logoCount);
    }

    if (expected.commentCount !== undefined) {
      const commentCount = await db.collection('comments').countDocuments();
      expect(commentCount).toBe(expected.commentCount);
    }

    if (expected.collectionCount !== undefined) {
      const collectionCount = await db.collection('collections').countDocuments();
      expect(collectionCount).toBe(expected.collectionCount);
    }
  }

  // Utility method to generate test data
  static generateTestData(type: 'user' | 'logo' | 'comment' | 'collection', overrides: Partial<any> = {}): any {
    const dbHelper = this.getDbHelper();
    return dbHelper.generateTestData(type, overrides);
  }

  static getDbHelper(): DatabaseHelper {
    if (!this.dbHelper) {
      throw new Error('TestHelper not initialized. Call setup() first.');
    }
    return this.dbHelper;
  }

  static getDb(): Db {
    if (!this.db) {
      throw new Error('TestHelper not initialized. Call setup() first.');
    }
    return this.db;
  }

  // Collection-specific schema validators
  static validateUserSchema(user: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DatabaseHelper.validationRules.user;
    
    if (!user.username || typeof user.username !== 'string') {
      errors.push('Username is required and must be a string');
    } else if (user.username.length < rules.MIN_USERNAME_LENGTH || 
               user.username.length > rules.MAX_USERNAME_LENGTH) {
      errors.push(`Username must be between ${rules.MIN_USERNAME_LENGTH} and ${rules.MAX_USERNAME_LENGTH} characters`);
    }

    if (!user.email || typeof user.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!rules.EMAIL_PATTERN.test(user.email)) {
      errors.push('Invalid email format');
    }

    if (user.profile) {
      if (typeof user.profile.bio !== 'string' && user.profile.bio !== undefined) {
        errors.push('Profile bio must be a string if provided');
      }
      if (typeof user.profile.location !== 'string' && user.profile.location !== undefined) {
        errors.push('Profile location must be a string if provided');
      }
      if (!Array.isArray(user.profile.skills) && user.profile.skills !== undefined) {
        errors.push('Profile skills must be an array if provided');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLogoSchema(logo: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DatabaseHelper.validationRules.logo;

    if (!logo.name || typeof logo.name !== 'string') {
      errors.push('Logo name is required and must be a string');
    } else if (logo.name.length < rules.NAME_MIN_LENGTH || 
               logo.name.length > rules.NAME_MAX_LENGTH) {
      errors.push(`Logo name must be between ${rules.NAME_MIN_LENGTH} and ${rules.NAME_MAX_LENGTH} characters`);
    }

    if (!Array.isArray(logo.tags)) {
      errors.push('Tags must be an array');
    } else if (logo.tags.length > rules.TAGS_MAX_COUNT) {
      errors.push(`Cannot exceed ${rules.TAGS_MAX_COUNT} tags`);
    }

    if (logo.totalVotes !== undefined && typeof logo.totalVotes !== 'number') {
      errors.push('Total votes must be a number');
    }

    if (!Array.isArray(logo.votes)) {
      errors.push('Votes must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCommentSchema(comment: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DatabaseHelper.validationRules.relationships;

    if (!comment.content || typeof comment.content !== 'string') {
      errors.push('Comment content is required and must be a string');
    } else if (comment.content.length > rules.COMMENT_MAX_LENGTH) {
      errors.push(`Comment cannot exceed ${rules.COMMENT_MAX_LENGTH} characters`);
    }

    if (!comment.userId) {
      errors.push('Comment must have a userId');
    }

    if (!comment.logoId) {
      errors.push('Comment must have a logoId');
    }

    if (comment.mentions && !Array.isArray(comment.mentions)) {
      errors.push('Mentions must be an array if provided');
    }

    if (typeof comment.likes !== 'number') {
      errors.push('Likes must be a number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCollectionSchema(collection: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = DatabaseHelper.validationRules.relationships;

    if (!collection.name || typeof collection.name !== 'string') {
      errors.push('Collection name is required and must be a string');
    } else if (collection.name.length > rules.COLLECTION_NAME_MAX_LENGTH) {
      errors.push(`Collection name cannot exceed ${rules.COLLECTION_NAME_MAX_LENGTH} characters`);
    }

    if (!collection.userId) {
      errors.push('Collection must have a userId');
    }

    if (!Array.isArray(collection.logos)) {
      errors.push('Logos must be an array');
    }

    if (collection.collaborators && !Array.isArray(collection.collaborators)) {
      errors.push('Collaborators must be an array if provided');
    }

    if (typeof collection.isPublic !== 'boolean') {
      errors.push('isPublic must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 