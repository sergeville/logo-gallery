# Test Data Implementation Guide

## Overview

This document details the implementation of test data generation for the Logo Gallery application. The system uses a structured approach to generate realistic test data while maintaining referential integrity across collections.

## Architecture

### Directory Structure
```
scripts/
├── seed/                   # Test data generation scripts
│   ├── users.ts           # User data generation
│   ├── logos.ts           # Logo data generation
│   ├── relationships.ts   # Relationship data generation
│   ├── db-helper.ts       # Database utilities
│   └── __tests__/        # Test files
└── seed-data/             # Static test data files
    └── images/            # Test logo images
```

## Data Models

### 1. Users
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;     // Hashed with bcrypt
  profile: {
    image?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
  };
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}
```

### 2. Logos
```typescript
interface Logo {
  _id: ObjectId;
  name: string;
  url: string;
  description: string;
  userId: ObjectId;
  tags: string[];
  averageRating: number;
  votes: Array<{
    userId: ObjectId;
    rating: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Relationships

#### Comments
```typescript
interface Comment {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies?: Comment[];
  parentId?: ObjectId;
}
```

#### Collections
```typescript
interface Collection {
  _id: ObjectId;
  name: string;
  description: string;
  userId: ObjectId;
  logoIds: ObjectId[];
  isPublic: boolean;
  tags?: string[];
  collaborators?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Favorites
```typescript
interface Favorite {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
  createdAt: Date;
}
```

## Database Indexes

```typescript
// Users
{ email: 1 }            // unique
{ username: 1 }         // unique

// Logos
{ userId: 1 }
{ tags: 1 }

// Comments
{ logoId: 1 }
{ userId: 1 }

// Collections
{ userId: 1 }
{ logoIds: 1 }

// Favorites
{ userId: 1, logoId: 1 } // unique
```

## Test Data Generation

### 1. User Generation
```typescript
// Generate multiple users
const users = await seedUsers({
  count: 10,
  withProfiles: true,
  roles: ['user', 'admin']
});

// Generate admin users
const admins = await seedAdmins(2);

// Create a test user
const testUser = await createTestUser({
  email: 'custom@example.com'
});
```

### 2. Logo Generation
```typescript
// Generate multiple logos
const logos = await seedLogos({
  count: 10,
  userIds: existingUserIds,
  withRatings: true,
  perUser: 2
});

// Create a test logo
const testLogo = await createTestLogo(userId, {
  name: 'Custom Logo'
});
```

### 3. Relationship Generation
```typescript
// Generate all relationships
const relationships = await seedRelationships({
  users,
  logos,
  commentsPerLogo: 3,
  collectionsPerUser: 2,
  favoritesPerUser: 5,
  commentMentions: true,
  collectionTags: true,
  sharedCollections: true
});
```

## Database Helper Usage

```typescript
const dbHelper = new DatabaseHelper();

// Connect to test database
await dbHelper.connect();

// Seed complete test data
await dbHelper.seedTestData({
  userCount: 10,
  logoCount: 30,
  commentsPerLogo: 3,
  collectionsPerUser: 2,
  favoritesPerUser: 5
});

// Clear test data
await dbHelper.clearCollections();

// Create indexes
await dbHelper.createIndexes();

// Disconnect
await dbHelper.disconnect();
```

## Data Generation Features

### User Features
- Random username and email generation
- Password hashing with bcrypt
- Optional profile generation
- Role assignment (user/admin)
- Timestamp management

### Logo Features
- Style-based naming
- Tag system with predefined categories
- Rating and voting system
- Even distribution among users
- Dynamic description generation
- Timestamp management

### Relationship Features
- Nested comment structure with replies
- User mentions in comments
- Public/private collections
- Collection tagging
- Shared collections with collaborators
- Like counts for comments
- Even distribution of favorites

## Best Practices

### 1. Data Generation
- Use realistic data patterns
- Maintain referential integrity
- Generate consistent timestamps
- Include edge cases
- Use predefined constants for sample data

### 2. Database Operations
- Use transactions for related operations
- Implement proper indexes
- Handle bulk operations efficiently
- Maintain data consistency
- Clean up test data properly

### 3. Testing
- Isolate test database
- Clean up before/after tests
- Verify data integrity
- Test edge cases
- Use type-safe operations

## Common Issues and Solutions

1. **Connection Issues**
   - Verify MongoDB service is running
   - Check connection string
   - Ensure proper credentials

2. **Data Integrity**
   - Verify references exist before creation
   - Use transactions for related operations
   - Check index constraints

3. **Performance**
   - Use bulk operations
   - Implement proper indexes
   - Clean up old test data
   - Monitor database size

## Environment Setup

1. **Required Environment Variables**
```env
MONGODB_TEST_URI=mongodb://localhost:27017/LogoGalleryTest
```

2. **MongoDB Configuration**
```typescript
const config = {
  uri: process.env.MONGODB_TEST_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};
```

## Testing

Run test suite:
```bash
npm run test:seed
```

Individual test files:
```bash
jest scripts/seed/__tests__/users.test.ts
jest scripts/seed/__tests__/logos.test.ts
jest scripts/seed/__tests__/relationships.test.ts
jest scripts/seed/__tests__/db-helper.test.ts
```

## Specific Use Cases

### 1. E2E Testing Setup
```typescript
// Set up test environment for E2E tests
async function setupE2ETest() {
  const dbHelper = new DatabaseHelper();
  await dbHelper.connect();
  
  // Create test admin
  const admin = await createTestUser({
    role: 'admin',
    email: 'admin@test.com',
    password: 'Admin123!'
  });

  // Create test users with specific data
  const users = await seedUsers({
    count: 3,
    withProfiles: true,
    roles: ['user'],
    passwordHash: 'User123!' // Same password for easy testing
  });

  // Create logos with specific ratings
  const logos = await seedLogos({
    count: 5,
    userIds: [admin._id, ...users.map(u => u._id)],
    withRatings: true,
    minVotes: 10,  // Ensure sufficient ratings
    maxVotes: 20
  });

  // Create relationships for testing
  const relationships = await seedRelationships({
    users: [admin, ...users],
    logos,
    commentsPerLogo: 5,
    collectionsPerUser: 2,
    favoritesPerUser: 3,
    commentMentions: true
  });

  return { admin, users, logos, relationships };
}
```

### 2. API Testing Fixtures
```typescript
// Create fixtures for API tests
async function createAPITestFixtures() {
  // Create a user with specific data
  const user = await createTestUser({
    username: 'apitest',
    email: 'apitest@example.com',
    profile: {
      bio: 'API Test User',
      location: 'Test City'
    }
  });

  // Create logos owned by the user
  const userLogos = await seedLogos({
    count: 3,
    userIds: [user._id],
    withRatings: true
  });

  // Create a collection with specific logos
  const collection = await seedCollections({
    users: [user],
    logos: userLogos,
    collectionsPerUser: 1,
    logosPerCollection: 3
  });

  return { user, userLogos, collection };
}
```

### 3. Performance Testing
```typescript
describe('Performance Tests', () => {
  let db: Db;
  let benchmark: PerformanceBenchmark;
  let loadTester: LoadTester;

  beforeAll(async () => {
    db = await setupTestDatabase();
    benchmark = new PerformanceBenchmark();
    loadTester = new LoadTester(20, 30);
  });

  describe('Database Operations', () => {
    it('should handle bulk operations efficiently', async () => {
      const result = await benchmark.measure('bulkInsert', async () => {
        const users = await seedUsers({ count: 1000 });
        return users;
      }, 3);

      const metrics = benchmark.getResults('bulkInsert');
      expect(metrics?.averageTime).toBeLessThan(5000); // 5 seconds
      expect(metrics?.averageMemory).toBeLessThan(100); // 100MB
    });

    it('should handle complex queries within performance limits', async () => {
      await benchmark.measure('complexQuery', async () => {
        return db.collection('logos').aggregate([
          { $match: { tags: { $in: ['minimalist'] } } },
          { $lookup: { 
            from: 'users', 
            localField: 'userId', 
            foreignField: '_id', 
            as: 'user' 
          }},
          { $unwind: '$user' },
          { $sort: { createdAt: -1 } }
        ]).toArray();
      }, 5);

      const metrics = benchmark.getResults('complexQuery');
      expect(metrics?.averageTime).toBeLessThan(1000); // 1 second
      expect(metrics?.standardDeviation).toBeLessThan(200); // Low variance
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent logo creation', async () => {
      const metrics = await loadTester.runTest('logoCreation', async () => {
        await createTestLogo(new ObjectId(), {
          name: `Load Test Logo ${Date.now()}`,
          tags: ['test', 'load']
        });
      });

      expect(metrics.avgLatency).toBeLessThan(500); // 500ms
      expect(metrics.p95Latency).toBeLessThan(1000); // 1 second
      expect(metrics.requestsPerSecond).toBeGreaterThan(10);
    });

    it('should handle concurrent search operations', async () => {
      const metrics = await loadTester.runTest('search', async () => {
        await db.collection('logos')
          .find({ tags: { $in: ['minimalist'] } })
          .limit(20)
          .toArray();
      });

      expect(metrics.avgLatency).toBeLessThan(200); // 200ms
      expect(metrics.p99Latency).toBeLessThan(500); // 500ms
      expect(metrics.requestsPerSecond).toBeGreaterThan(50);
    });
  });
});

### 4. Integration Testing
```typescript
describe('Integration Tests', () => {
  let db: Db;
  let monitor: SystemHealthMonitor;
  let metricsCollector: DetailedMetricsCollector;
  let alertHandlers: AlertHandler[];

  beforeAll(async () => {
    db = await setupTestDatabase();
    alertHandlers = [
      new MockEmailAlertHandler(),
      new MockSlackAlertHandler(),
      new MockPagerDutyAlertHandler()
    ];
    monitor = new SystemHealthMonitor(db, {
      maxDatabaseSize: 100 * 1024 * 1024, // 100MB
      maxResponseTime: 200,
      maxErrorRate: 1,
      maxConnectionCount: 50
    }, alertHandlers);
    metricsCollector = new DetailedMetricsCollector(db);
  });

  describe('Monitoring Integration', () => {
    it('should integrate monitoring with alerting system', async () => {
      // Generate load to trigger alerts
      const loadTester = new LoadTester(50, 10);
      await loadTester.runTest('highLoad', async () => {
        await db.collection('logos').aggregate([
          { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' },
          { $sort: { createdAt: -1 } }
        ]).toArray();
      });

      const metrics = await monitor.monitorHealth();
      expect(metrics.avgResponseTime).toBeGreaterThan(0);
      
      const mockHandler = alertHandlers[0] as MockEmailAlertHandler;
      expect(mockHandler.alerts.length).toBeGreaterThan(0);
    });

    it('should collect and visualize metrics', async () => {
      const metrics = await metricsCollector.collectDetailedMetrics();
      const visualizer = new MetricsVisualizer();
      const report = visualizer.generatePerformanceReport([metrics]);
      
      expect(report).toContain('plotly-latest.min.js');
      expect(report).toContain('Response Time Trend');
    });
  });

  describe('Cache Integration', () => {
    it('should integrate caching with database operations', async () => {
      const cacheManager = new CacheManager(5);
      
      // First call - should hit database
      const result1 = await cacheManager.getOrFetch(
        'logos',
        { tags: 'test' },
        () => db.collection('logos').find({ tags: 'test' }).toArray()
      );
      
      // Second call - should hit cache
      const result2 = await cacheManager.getOrFetch(
        'logos',
        { tags: 'test' },
        () => db.collection('logos').find({ tags: 'test' }).toArray()
      );
      
      expect(result1).toEqual(result2);
    });

    it('should handle cache invalidation correctly', async () => {
      const cacheManager = new CacheManager(5);
      const query = { tags: 'test' };
      
      await cacheManager.getOrFetch(
        'logos',
        query,
        () => db.collection('logos').find(query).toArray()
      );
      
      await db.collection('logos').updateOne(
        query,
        { $set: { updatedAt: new Date() } }
      );
      
      cacheManager.invalidate('logos', query);
      
      const result = await cacheManager.getOrFetch(
        'logos',
        query,
        () => db.collection('logos').find(query).toArray()
      );
      
      expect(result[0].updatedAt).toBeDefined();
    });
  });
});

// Mock classes for testing
class MockEmailAlertHandler implements AlertHandler {
  alerts: Alert[] = [];
  async handleAlert(alert: Alert) {
    this.alerts.push(alert);
  }
}

class MockSlackAlertHandler implements AlertHandler {
  alerts: Alert[] = [];
  async handleAlert(alert: Alert) {
    this.alerts.push(alert);
  }
}

class MockPagerDutyAlertHandler implements AlertHandler {
  alerts: Alert[] = [];
  async handleAlert(alert: Alert) {
    if (alert.level === 'critical') {
      this.alerts.push(alert);
    }
  }
}
```

### 1. Unit Tests
```typescript
describe('Data Generation Tests', () => {
  describe('User Generation', () => {
    it('should generate users with valid data', async () => {
      const users = await seedUsers({ count: 5 });
      
      users.forEach(user => {
        expect(user._id).toBeDefined();
        expect(user.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
        expect(user.username).toBeDefined();
        expect(user.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should handle custom user profiles', async () => {
      const users = await seedUsers({
        count: 3,
        withProfiles: true,
        profileGenerator: (i) => ({
          bio: `Test Bio ${i}`,
          location: `City ${i}`,
          skills: [`skill${i}`]
        })
      });

      users.forEach(user => {
        expect(user.profile).toBeDefined();
        expect(user.profile.bio).toMatch(/^Test Bio \d+$/);
        expect(user.profile.location).toMatch(/^City \d+$/);
        expect(user.profile.skills).toHaveLength(1);
      });
    });

    it('should enforce unique email addresses', async () => {
      await expect(seedUsers({
        count: 2,
        emailGenerator: () => 'same@email.com'
      })).rejects.toThrow();
    });
  });

  describe('Logo Generation', () => {
    let users: User[];

    beforeEach(async () => {
      users = await seedUsers({ count: 3 });
    });

    it('should generate logos with valid data', async () => {
      const logos = await seedLogos({
        count: 5,
        userIds: users.map(u => u._id)
      });

      logos.forEach(logo => {
        expect(logo._id).toBeDefined();
        expect(logo.name).toBeDefined();
        expect(logo.userId).toBeDefined();
        expect(users.map(u => u._id.toString())).toContain(logo.userId.toString());
        expect(logo.tags).toBeInstanceOf(Array);
        expect(logo.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should handle custom tag generation', async () => {
      const customTags = ['custom1', 'custom2'];
      const logos = await seedLogos({
        count: 3,
        userIds: users.map(u => u._id),
        tagGenerator: () => customTags
      });

      logos.forEach(logo => {
        expect(logo.tags).toEqual(customTags);
      });
    });

    it('should distribute logos evenly among users', async () => {
      const logoCount = 9; // 3 per user
      const logos = await seedLogos({
        count: logoCount,
        userIds: users.map(u => u._id)
      });

      const distribution = logos.reduce((acc, logo) => {
        acc[logo.userId.toString()] = (acc[logo.userId.toString()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      users.forEach(user => {
        expect(distribution[user._id.toString()]).toBe(logoCount / users.length);
      });
    });
  });

  describe('Relationship Generation', () => {
    let users: User[];
    let logos: Logo[];

    beforeEach(async () => {
      users = await seedUsers({ count: 3 });
      logos = await seedLogos({
        count: 6,
        userIds: users.map(u => u._id)
      });
    });

    it('should generate comments with proper structure', async () => {
      const relationships = await seedRelationships({
        users,
        logos,
        commentsPerLogo: 2,
        maxRepliesPerComment: 2
      });

      relationships.comments.forEach(comment => {
        expect(comment.userId).toBeDefined();
        expect(comment.logoId).toBeDefined();
        expect(comment.content).toBeDefined();
        expect(comment.createdAt).toBeInstanceOf(Date);
        
        if (comment.parentId) {
          expect(relationships.comments
            .map(c => c._id.toString()))
            .toContain(comment.parentId.toString());
        }
      });
    });

    it('should generate collections with proper sharing', async () => {
      const relationships = await seedRelationships({
        users,
        logos,
        collectionsPerUser: 2,
        logosPerCollection: 3,
        sharedCollections: true
      });

      relationships.collections.forEach(collection => {
        expect(collection.userId).toBeDefined();
        expect(collection.name).toBeDefined();
        expect(collection.logos).toHaveLength(3);
        expect(collection.isPublic).toBeDefined();
        
        if (collection.sharedWith?.length) {
          collection.sharedWith.forEach(userId => {
            expect(users.map(u => u._id.toString()))
              .toContain(userId.toString());
          });
        }
      });
    });

    it('should handle user mentions in comments', async () => {
      const relationships = await seedRelationships({
        users,
        logos,
        commentsPerLogo: 2,
        commentMentions: true
      });

      const commentsWithMentions = relationships.comments
        .filter(c => c.mentions?.length);
      
      expect(commentsWithMentions.length).toBeGreaterThan(0);
      commentsWithMentions.forEach(comment => {
        comment.mentions!.forEach(userId => {
          expect(users.map(u => u._id.toString()))
            .toContain(userId.toString());
        });
      });
    });
  });
});

### 2. Integration Tests
```typescript
describe('Database Integration Tests', () => {
  let dbHelper: DatabaseHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
  });

  it('should maintain referential integrity', async () => {
    const { users, logos, relationships } = await dbHelper.seedTestData({
      userCount: 3,
      logoCount: 5,
      commentsPerLogo: 2
    });

    // Verify user references
    const logosFromDb = await dbHelper.db.collection('logos').find().toArray();
    logosFromDb.forEach(logo => {
      expect(users.map(u => u._id.toString()))
        .toContain(logo.userId.toString());
    });

    // Verify logo references
    const commentsFromDb = await dbHelper.db.collection('comments').find().toArray();
    commentsFromDb.forEach(comment => {
      expect(logos.map(l => l._id.toString()))
        .toContain(comment.logoId.toString());
    });
  });

  it('should handle cascading deletes', async () => {
    const { users, logos } = await dbHelper.seedTestData({
      userCount: 1,
      logoCount: 2,
      commentsPerLogo: 2
    });

    // Delete a user
    await dbHelper.db.collection('users').deleteOne({ _id: users[0]._id });

    // Verify related data is removed
    const userLogos = await dbHelper.db.collection('logos')
      .find({ userId: users[0]._id })
      .toArray();
    expect(userLogos).toHaveLength(0);

    const userComments = await dbHelper.db.collection('comments')
      .find({ userId: users[0]._id })
      .toArray();
    expect(userComments).toHaveLength(0);
  });

  it('should enforce unique constraints', async () => {
    await dbHelper.createIndexes();

    // Try to create users with duplicate emails
    await expect(seedUsers({
      count: 2,
      emailGenerator: () => 'duplicate@test.com'
    })).rejects.toThrow();

    // Try to create duplicate collections
    const user = (await seedUsers({ count: 1 }))[0];
    await expect(Promise.all([
      createTestCollection(user._id, { name: 'Same Name' }),
      createTestCollection(user._id, { name: 'Same Name' })
    ])).rejects.toThrow();
  });
});

### 3. Performance Tests
```typescript
describe('Performance Tests', () => {
  let dbHelper: DatabaseHelper;
  let benchmark: PerformanceBenchmark;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    benchmark = new PerformanceBenchmark();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
  });

  it('should handle large data sets efficiently', async () => {
    const result = await benchmark.measure('largeDataSet', async () => {
      return dbHelper.seedTestData({
        userCount: 1000,
        logoCount: 5000,
        commentsPerLogo: 5
      });
    });

    const metrics = benchmark.getResults('largeDataSet');
    expect(metrics?.averageMemory).toBeLessThan(500); // 500MB
    expect(metrics?.averageTime).toBeLessThan(30000); // 30 seconds
  });

  it('should perform complex queries efficiently', async () => {
    // Setup test data
    await dbHelper.seedTestData({
      userCount: 100,
      logoCount: 1000,
      commentsPerLogo: 3
    });

    await benchmark.measure('complexQuery', async () => {
      return dbHelper.db.collection('logos').aggregate([
        { $match: { tags: { $in: ['minimalist'] } } },
        { $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'creator'
        }},
        { $unwind: '$creator' },
        { $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'logoId',
          as: 'comments'
        }},
        { $project: {
          name: 1,
          creator: { username: 1, email: 1 },
          commentCount: { $size: '$comments' }
        }}
      ]).toArray();
    }, 5);

    const metrics = benchmark.getResults('complexQuery');
    expect(metrics?.averageTime).toBeLessThan(1000); // 1 second
    expect(metrics?.p95).toBeLessThan(2000); // 2 seconds
  });

  it('should handle concurrent operations', async () => {
    const loadTester = new LoadTester(50, 10); // 50 concurrent users, 10 seconds
    
    const metrics = await loadTester.runTest('concurrent', async () => {
      await Promise.all([
        createTestUser(),
        createTestLogo(new ObjectId()),
        dbHelper.db.collection('logos').find().limit(10).toArray()
      ]);
    });

    expect(metrics.errorRate).toBeLessThan(0.01); // Less than 1% errors
    expect(metrics.avgLatency).toBeLessThan(500); // 500ms average
    expect(metrics.p99Latency).toBeLessThan(2000); // 2 seconds max
  });
});

### 4. Stress Tests
```typescript
describe('Stress Tests', () => {
  let dbHelper: DatabaseHelper;
  let loadTester: LoadTester;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    loadTester = new LoadTester(100, 60); // 100 concurrent users, 60 seconds
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
  });

  it('should handle sustained high load', async () => {
    // Setup initial data
    await dbHelper.seedTestData({
      userCount: 100,
      logoCount: 1000,
      commentsPerLogo: 5
    });

    const metrics = await loadTester.runTest('highLoad', async () => {
      const operations = [
        () => createTestUser(),
        () => createTestLogo(new ObjectId()),
        () => dbHelper.db.collection('logos').find().limit(20).toArray(),
        () => dbHelper.db.collection('users').find().limit(20).toArray(),
        () => dbHelper.db.collection('comments').find().limit(20).toArray()
      ];

      const randomOp = operations[Math.floor(Math.random() * operations.length)];
      await randomOp();
    });

    expect(metrics.successRate).toBeGreaterThan(0.95); // 95% success rate
    expect(metrics.avgLatency).toBeLessThan(1000); // 1 second average
    expect(metrics.throughput).toBeGreaterThan(50); // 50 ops/second
  });

  it('should handle memory pressure', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const batchSize = 1000;
    const batches = 10;

    for (let i = 0; i < batches; i++) {
      await dbHelper.seedTestData({
        userCount: batchSize,
        logoCount: batchSize * 2,
        commentsPerLogo: 2
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const currentMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (currentMemory - initialMemory) / 1024 / 1024;
      expect(memoryIncrease).toBeLessThan(1000); // Less than 1GB increase
    }
  });

  it('should handle connection pool exhaustion', async () => {
    const maxConnections = 100;
    const operations = Array(maxConnections * 2).fill(null).map(() => 
      dbHelper.db.collection('logos')
        .find()
        .limit(1)
        .toArray()
    );

    const results = await Promise.allSettled(operations);
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    
    expect(succeeded).toBeGreaterThan(maxConnections * 0.8); // 80% success rate
  });
});
``` 