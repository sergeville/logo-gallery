import { DatabaseHelper } from '../db-helper';
import { ObjectId } from 'mongodb';
import { TestObserverManager, ConsoleTestObserver } from '../test-observer';
import { User, Logo, Comment, Collection } from '../types';
import { seedUsers, seedLogos, seedComments, seedCollections, seedFavorites, createTestUser, createTestLogo, DEFAULT_PASSWORD, SAMPLE_TAGS, COLLECTION_TAGS } from '../seed-utils';
import * as fs from 'fs';
import * as path from 'path';

const observerManager = TestObserverManager.getInstance();

interface UserWithProfile extends User {
  profile?: {
    bio: string;
    location: string;
    skills: string[];
  };
  role?: 'admin' | 'user';
}

interface LogoWithRating extends Logo {
  rating?: number;
}

interface CommentWithMentions extends Comment {
  mentions?: ObjectId[];
}

interface CollectionWithSharing extends Collection {
  isPublic: boolean;
  sharedWith?: ObjectId[];
}

describe('Edge Cases and Error Conditions', () => {
  let dbHelper: DatabaseHelper;
  const testObserver = new ConsoleTestObserver();
  const observerManager = TestObserverManager.getInstance();

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    observerManager.addObserver(testObserver);
    observerManager.notifyDatabaseOperation('connect', 'database');
  });

  afterAll(async () => {
    await dbHelper.disconnect();
    observerManager.notifyDatabaseOperation('disconnect', 'database');

    // Read and report coverage data
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const total = coverageData.total;
        observerManager.notifyCoverageReport({
          statements: total.statements,
          branches: total.branches,
          functions: total.functions,
          lines: total.lines
        });
      }
    } catch (error) {
      console.error('Failed to read coverage data:', error);
    }

    observerManager.removeObserver(testObserver);
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
    observerManager.notifyDatabaseOperation('clear', 'all collections');
  });

  describe('User Edge Cases', () => {
    it('should handle zero users request', async () => {
      observerManager.notifyTestStart('handle zero users request');
      const users = await dbHelper.seedUsers({ count: 0 });
      expect(users).toHaveLength(0);
      observerManager.notifyTestPass('handle zero users request', 0);
    });

    it('should handle maximum username length', async () => {
      observerManager.notifyTestStart('handle maximum username length');
      const longUsername = 'a'.repeat(100);
      await expect(dbHelper.createUser({
        email: 'test@example.com',
        username: longUsername
      })).rejects.toThrow('Invalid username');
      observerManager.notifyTestPass('handle maximum username length', 0);
    });

    it('should reject invalid email formats', async () => {
      observerManager.notifyTestStart('reject invalid email formats');
      const invalidEmails = ['invalid', 'user@', '@domain.com', 'user@.com'];
      
      for (const email of invalidEmails) {
        observerManager.notifyValidationCheck('User', 'email', email);
        await expect(dbHelper.createUser({
          email,
          username: 'testuser'
        })).rejects.toThrow('Invalid email format');
      }
      observerManager.notifyTestPass('reject invalid email formats', 0);
    });

    it('should handle special characters in usernames', async () => {
      const specialChars = ['@', '#', '$', '%', '&', '*'];
      
      for (const char of specialChars) {
        await expect(dbHelper.createUser({
          email: 'test@example.com',
          username: `test${char}user`
        })).rejects.toThrow('Username contains invalid characters');
      }
    });
  });

  describe('Logo Edge Cases', () => {
    let userId: ObjectId;

    beforeEach(async () => {
      await dbHelper.clearCollections();
      observerManager.notifyDatabaseOperation('clear', 'all collections');
      const user = await dbHelper.createUser({
        email: 'test@example.com',
        username: 'testuser'
      });
      userId = user._id;
    });

    it('should handle empty tag arrays', async () => {
      observerManager.notifyTestStart('handle empty tag arrays');
      await expect(dbHelper.createLogo({
        name: 'Test Logo',
        userId,
        tags: []
      })).rejects.toThrow('At least one tag is required');
      observerManager.notifyTestPass('handle empty tag arrays', 0);
    });

    it('should handle maximum tag count', async () => {
      observerManager.notifyTestStart('handle maximum tag count');
      const maxTags = Array.from({ length: DatabaseHelper.rules.logo.TAGS_MAX_COUNT + 1 }, (_, i) => `tag${i}`);
      await expect(dbHelper.createLogo({
        name: 'Test Logo',
        userId,
        tags: maxTags
      })).rejects.toThrow('Too many tags');
      observerManager.notifyTestPass('handle maximum tag count', 0);
    });

    it('should reject duplicate tags', async () => {
      observerManager.notifyTestStart('reject duplicate tags');
      await expect(dbHelper.createLogo({
        name: 'Test Logo',
        userId,
        tags: ['tag1', 'tag1', 'tag1']
      })).rejects.toThrow('Duplicate tags are not allowed');
      observerManager.notifyTestPass('reject duplicate tags', 0);
    });

    it('should handle special characters in logo names', async () => {
      observerManager.notifyTestStart('handle special characters in logo names');
      await expect(dbHelper.createLogo({
        name: 'Logo with @#$%^&* special chars',
        userId,
        tags: ['test']
      })).rejects.toThrow('Logo name contains invalid characters');
      observerManager.notifyTestPass('handle special characters in logo names', 0);
    });
  });

  describe('Relationship Edge Cases', () => {
    let users: User[];
    let logos: Logo[];

    beforeEach(async () => {
      users = await dbHelper.seedUsers({ count: 3 });
      logos = await dbHelper.seedLogos({
        count: 3,
        userIds: users.map(u => u._id)
      });
    });

    it('should handle circular comment replies', async () => {
      const user = await dbHelper.createUser({ email: 'test@example.com', username: 'testuser' });
      const logo = await dbHelper.createLogo({ 
        userId: user._id,
        name: 'Test Logo 1',
        tags: ['test']
      });
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        commentsPerLogo: 2,
        maxRepliesPerComment: 1000 // Force potential circular references
      })).rejects.toThrow('Cannot create more than 5 levels of replies');
    });

    it('should handle maximum comment depth', async () => {
      const user = await dbHelper.createUser({ email: 'test@example.com', username: 'testuser' });
      const logo = await dbHelper.createLogo({ 
        userId: user._id,
        name: 'Test Logo 2',
        tags: ['test']
      });
      const relationships = await dbHelper.seedRelationships({
        users,
        logos,
        commentsPerLogo: 1,
        maxRepliesPerComment: 5
      });

      // Check maximum comment depth
      const commentDepths = new Map<string, number>();
      relationships.comments.forEach((comment: Comment) => {
        let depth = 0;
        let currentComment = comment;
        while (currentComment.parentId) {
          depth++;
          currentComment = relationships.comments.find(
            (c: Comment) => c._id.toString() === currentComment.parentId?.toString()
          )!;
          expect(depth).toBeLessThan(6); // Maximum depth check
        }
        commentDepths.set(comment._id.toString(), depth);
      });
    });

    it('should handle collection sharing conflicts', async () => {
      const user = await dbHelper.createUser({ email: 'test@example.com', username: 'testuser' });
      const logo = await dbHelper.createLogo({ 
        userId: user._id,
        name: 'Test Logo 3',
        tags: ['test']
      });
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        collectionsPerUser: 1,
        sharedCollections: true,
        sharingStrategy: (collection: Collection) => {
          return [collection.userId]; // Share with owner
        }
      })).rejects.toThrow('Cannot share collection with its owner');
    });

    it('should handle maximum favorites per logo', async () => {
      const user = await dbHelper.createUser({ email: 'test@example.com', username: 'testuser' });
      const logo = await dbHelper.createLogo({ 
        userId: user._id,
        name: 'Test Logo 4',
        tags: ['test']
      });
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        favoritesPerUser: 1000 // Excessive favorites
      })).rejects.toThrow('Cannot create more than 100 favorites per user');
    });
  });

  describe('Database Edge Cases', () => {
    it('should handle concurrent operations', async () => {
      const operations = Array(100).fill(null).map((_, i) => 
        dbHelper.createUser({
          email: `user${i}@test.com`,
          username: `user${i}`
        })
      );

      const results = await Promise.allSettled(operations);
      const failures = results.filter(r => r.status === 'rejected');
      expect(failures.length).toBe(0);
    });

    it('should handle large batch operations', async () => {
      const batchSize = 10000;
      await expect(dbHelper.seedUsers({ 
        count: batchSize 
      })).rejects.toThrow('Cannot create more than 5000 users at once');
    });

    it('should handle invalid ObjectIds', async () => {
      await expect(dbHelper.createLogo({
        userId: new ObjectId('000000000000000000000000'),
        name: 'Test Logo',
        tags: ['test']
      })).rejects.toThrow();
    });

    it('should handle database disconnection', async () => {
      await dbHelper.disconnect();
      await expect(dbHelper.createUser({
        email: 'test@example.com',
        username: 'testuser'
      })).rejects.toThrow();
      await dbHelper.connect(); // Reconnect for cleanup
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should validate required fields', async () => {
      await expect(dbHelper.createUser({
        username: 'testuser'
      })).rejects.toThrow('Email is required');
      
      await expect(dbHelper.createLogo({
        userId: new ObjectId()
      })).rejects.toThrow('Logo name is required');
    });

    it('should validate field types', async () => {
      await expect(dbHelper.createUser({ 
        email: 123 as any,
        username: true as any
      })).rejects.toThrow();
    });

    it('should validate date fields', async () => {
      await expect(dbHelper.createUser({ 
        email: 'test@example.com',
        username: 'testuser',
        createdAt: 'invalid-date' as any 
      })).rejects.toThrow('Invalid date format');
    });

    it('should validate nested objects', async () => {
      await expect(dbHelper.createUser({
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          invalidField: 'test'
        } as any
      })).rejects.toThrow('Invalid profile fields: invalidField');
    });
  });

  describe('Additional Coverage Tests', () => {
    it('should handle user profile updates', async () => {
      observerManager.notifyTestStart('handle user profile updates');
      const user = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date(),
        profile: {
          bio: 'Test bio',
          location: 'Test location',
          skills: ['skill1', 'skill2']
        }
      });
      expect(user.profile).toBeDefined();
      if (user.profile) {
        expect(user.profile.bio).toBe('Test bio');
      }
      observerManager.notifyTestPass('handle user profile updates', 0);
    });

    it('should handle logo rating updates', async () => {
      observerManager.notifyTestStart('handle logo rating updates');
      const user = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date()
      });
      const logo = await dbHelper.createLogo({
        _id: new ObjectId(),
        name: 'Test Logo',
        userId: user._id,
        tags: ['test'],
        createdAt: new Date(),
        rating: 4.5
      });
      expect(logo.rating).toBe(4.5);
      observerManager.notifyTestPass('handle logo rating updates', 0);
    });

    it('should handle comment mentions', async () => {
      observerManager.notifyTestStart('handle comment mentions');
      const user1 = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'user1@example.com',
        username: 'user1',
        createdAt: new Date()
      });
      const user2 = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'user2@example.com',
        username: 'user2',
        createdAt: new Date()
      });
      const logo = await dbHelper.createLogo({
        _id: new ObjectId(),
        name: 'Test Logo',
        userId: user1._id,
        tags: ['test'],
        createdAt: new Date()
      });
      const comments = await dbHelper.seedComments([{
        _id: new ObjectId(),
        logoId: logo._id,
        userId: user1._id,
        content: 'Test comment @user2',
        createdAt: new Date(),
        mentions: [user2._id]
      }]);
      expect(comments[0].mentions).toContainEqual(user2._id);
      observerManager.notifyTestPass('handle comment mentions', 0);
    });

    it('should handle collection sharing', async () => {
      observerManager.notifyTestStart('handle collection sharing');
      const owner = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'owner@example.com',
        username: 'owner',
        createdAt: new Date()
      });
      const sharedUser = await dbHelper.createUser({
        _id: new ObjectId(),
        email: 'shared@example.com',
        username: 'shared',
        createdAt: new Date()
      });
      const logo = await dbHelper.createLogo({
        _id: new ObjectId(),
        name: 'Test Logo',
        userId: owner._id,
        tags: ['test'],
        createdAt: new Date()
      });
      const collections = await dbHelper.seedCollections([{
        _id: new ObjectId(),
        userId: owner._id,
        name: 'Test Collection',
        logos: [logo._id],
        createdAt: new Date(),
        isPublic: false,
        collaborators: [sharedUser._id]
      }]);
      expect(collections[0].collaborators).toContainEqual(sharedUser._id);
      observerManager.notifyTestPass('handle collection sharing', 0);
    });
  });
});

describe('Validation Methods', () => {
  let dbHelper: DatabaseHelper;

  beforeEach(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    await dbHelper.clearCollections();
    observerManager.notifyDatabaseOperation('connect', 'database');
  });

  afterEach(async () => {
    await dbHelper.clearCollections();
    await dbHelper.disconnect();
    observerManager.notifyDatabaseOperation('disconnect', 'database');
  });

  describe('Logo Validation', () => {
    it('should validate logo description length', async () => {
      observerManager.notifyTestStart('validate logo description length');
      const longDescription = 'a'.repeat(DatabaseHelper.rules.logo.DESCRIPTION_MAX_LENGTH + 1);
      
      await expect(dbHelper.createLogo({
        name: 'Test Logo',
        userId: new ObjectId(),
        tags: ['test'],
        description: longDescription
      })).rejects.toThrow('Description cannot exceed');
      
      observerManager.notifyTestPass('validate logo description length', 0);
    });

    it('should validate logo rating type', async () => {
      observerManager.notifyTestStart('validate logo rating type');
      
      await expect(dbHelper.createLogo({
        name: 'Test Logo',
        userId: new ObjectId(),
        tags: ['test'],
        rating: 'invalid' as any
      })).rejects.toThrow('Rating must be a number');
      
      observerManager.notifyTestPass('validate logo rating type', 0);
    });
  });

  describe('Comment Validation', () => {
    it('should validate comment content length', async () => {
      observerManager.notifyTestStart('validate comment content length');
      const user = await dbHelper.createUser({ email: 'test@test.com' });
      const logo = await dbHelper.createLogo({
        name: 'Test Logo',
        userId: user._id,
        tags: ['test']
      });
      
      const longContent = 'a'.repeat(DatabaseHelper.rules.relationships.COMMENT_MAX_LENGTH + 1);
      await expect(dbHelper.seedComments([{
        _id: new ObjectId(),
        logoId: logo._id,
        userId: user._id,
        content: longContent,
        createdAt: new Date()
      }])).rejects.toThrow('Comment cannot exceed');
      
      observerManager.notifyTestPass('validate comment content length', 0);
    });

    it('should validate mentions array', async () => {
      observerManager.notifyTestStart('validate mentions array');
      const user = await dbHelper.createUser({ email: 'test@test.com' });
      const logo = await dbHelper.createLogo({
        name: 'Test Logo',
        userId: user._id,
        tags: ['test']
      });
      
      const tooManyMentions = Array(DatabaseHelper.rules.relationships.MAX_MENTIONS_PER_COMMENT + 1)
        .fill(null)
        .map(() => new ObjectId());
      
      await expect(dbHelper.seedComments([{
        _id: new ObjectId(),
        logoId: logo._id,
        userId: user._id,
        content: 'Test comment',
        mentions: tooManyMentions,
        createdAt: new Date()
      }])).rejects.toThrow('Cannot mention more than');
      
      observerManager.notifyTestPass('validate mentions array', 0);
    });
  });

  describe('Collection Validation', () => {
    it('should validate collection name length', async () => {
      observerManager.notifyTestStart('validate collection name length');
      const user = await dbHelper.createUser({ email: 'test@test.com' });
      
      const longName = 'a'.repeat(DatabaseHelper.rules.relationships.COLLECTION_NAME_MAX_LENGTH + 1);
      await expect(dbHelper.seedCollections([{
        _id: new ObjectId(),
        userId: user._id,
        name: longName,
        logos: [],
        createdAt: new Date(),
        isPublic: true
      }])).rejects.toThrow('Collection name cannot exceed');
      
      observerManager.notifyTestPass('validate collection name length', 0);
    });

    it('should validate shared users array', async () => {
      observerManager.notifyTestStart('validate shared users array');
      const user = await dbHelper.createUser({ email: 'test@test.com' });
      
      const tooManySharedUsers = Array(DatabaseHelper.rules.relationships.MAX_SHARED_USERS + 1)
        .fill(null)
        .map(() => new ObjectId());
      
      await expect(dbHelper.seedCollections([{
        _id: new ObjectId(),
        userId: user._id,
        name: 'Test Collection',
        logos: [],
        collaborators: tooManySharedUsers,
        createdAt: new Date(),
        isPublic: true
      }])).rejects.toThrow('Cannot share with more than');
      
      observerManager.notifyTestPass('validate shared users array', 0);
    });
  });

  describe('Date Validation', () => {
    it('should validate date format', async () => {
      observerManager.notifyTestStart('validate date format');
      
      await expect(dbHelper.createUser({
        email: 'test@test.com',
        createdAt: 'invalid-date' as any
      })).rejects.toThrow('Invalid date format');
      
      observerManager.notifyTestPass('validate date format', 0);
    });
  });

  describe('Profile Validation', () => {
    it('should validate profile fields', async () => {
      observerManager.notifyTestStart('validate profile fields');
      
      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          invalidField: 'test'
        } as any
      })).rejects.toThrow('Invalid profile fields');
      
      observerManager.notifyTestPass('validate profile fields', 0);
    });

    it('should validate skills array', async () => {
      observerManager.notifyTestStart('validate skills array');
      
      const tooManySkills = Array(DatabaseHelper.rules.user.MAX_SKILLS + 1)
        .fill(null)
        .map((_, i) => `skill${i}`);
      
      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          skills: tooManySkills
        }
      })).rejects.toThrow('Cannot have more than');
      
      observerManager.notifyTestPass('validate skills array', 0);
    });
  });
});

describe('User Seeding', () => {
  let dbHelper: DatabaseHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  it('should seed users with profiles', async () => {
    const users = await seedUsers({ count: 3, withProfiles: true });
    expect(users).toHaveLength(3);
    users.forEach(user => {
      expect(user.profile).toBeDefined();
      if (user.profile) {
        expect(user.profile.bio).toBeDefined();
        expect(user.profile.location).toBeDefined();
        expect(user.profile.skills).toBeDefined();
      }
    });
  });

  it('should seed users with specified roles', async () => {
    const users = await seedUsers({ count: 4, roles: ['admin', 'user'] });
    expect(users).toHaveLength(4);
    users.forEach(user => {
      expect(['admin', 'user']).toContain(user.role);
    });
  });
  it('should seed admin users', async () => {
    const admins = await seedUsers({ count: 2, roles: ['admin'] });
    expect(admins).toHaveLength(2);
    admins.forEach((admin: any) => {
      expect(admin.role).toBe('admin');
      expect(admin.profile).toBeDefined();
    });
  });

  it('should create test user with overrides', async () => {
    const customEmail = 'custom@example.com';
    const testUser = await createTestUser({ email: customEmail });
    expect(testUser.email).toBe(customEmail);
    expect(testUser.profile).toBeDefined();
  });

  it('should hash passwords correctly', async () => {
    const users = await seedUsers({ count: 1 });
    expect(users[0].password).not.toBe(DEFAULT_PASSWORD);
    expect(users[0].password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
  });
});

describe('Logo Seeding', () => {
  let dbHelper: DatabaseHelper;
  let testUsers: { _id: ObjectId }[];

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
    testUsers = await seedUsers({ count: 5 });
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  it('should seed logos with ratings', async () => {
    const logos = await seedLogos({
      count: 5,
      userIds: testUsers.map(u => u._id),
      withRatings: true,
      minVotes: 2,
      maxVotes: 4
    });

    expect(logos).toHaveLength(5);
    logos.forEach(logo => {
      expect(logo.votes).toBeDefined();
      if (logo.votes) {
        expect(logo.votes.length).toBeGreaterThanOrEqual(2);
        expect(logo.votes.length).toBeLessThanOrEqual(4);
      }
      expect(logo.averageRating).toBeDefined();
      if (logo.averageRating) {
        expect(logo.averageRating).toBeGreaterThanOrEqual(0);
        expect(logo.averageRating).toBeLessThanOrEqual(5);
      }
    });
  });

  it('should distribute logos evenly among users', async () => {
    const perUser = 2;
    const logos = await seedLogos({
      count: 6,
      userIds: testUsers.map(u => u._id),
      perUser
    });

    expect(logos).toHaveLength(6);
    const userLogoCounts = new Map<string, number>();
    logos.forEach(logo => {
      const count = userLogoCounts.get(logo.userId.toString()) || 0;
      userLogoCounts.set(logo.userId.toString(), count + 1);
    });

    userLogoCounts.forEach(count => {
      expect(count).toBe(perUser);
    });
  });

  it('should create test logo with overrides', async () => {
    const customName = 'Custom Test Logo';
    const testLogo = await createTestLogo(testUsers[0]._id, { name: customName });
    expect(testLogo.name).toBe(customName);
    expect(testLogo.userId).toEqual(testUsers[0]._id);
    expect(testLogo.tags).toBeDefined();
    expect(testLogo.description).toContain(customName);
  });

  it('should generate valid tags', async () => {
    const logos = await seedLogos({
      count: 1,
      userIds: [testUsers[0]._id]
    });

    expect(logos[0].tags).toBeDefined();
    expect(logos[0].tags.length).toBeGreaterThan(0);
    logos[0].tags.forEach(tag => {
      expect(SAMPLE_TAGS).toContain(tag);
    });
  });

  it('should generate valid descriptions', async () => {
    const logos = await seedLogos({
      count: 1,
      userIds: [testUsers[0]._id]
    });

    expect(logos[0].description).toContain(logos[0].name);
    expect(logos[0].description).toContain(logos[0].tags[0]);
  });
});

describe('Relationship Seeding', () => {
  let dbHelper: DatabaseHelper;
  let testUsers: User[];
  let testLogos: Logo[];

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
    testUsers = await seedUsers({ count: 3 });
    testLogos = await seedLogos({
      count: 5,
      userIds: testUsers.map(u => u._id)
    });
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('Comments', () => {
    it('should seed comments with mentions', async () => {
      const comments = await seedComments({
        users: testUsers,
        logos: testLogos,
        commentsPerLogo: 2,
        commentMentions: true
      });

      expect(comments.length).toBe(testLogos.length * 2);
      comments.forEach(comment => {
        expect(comment.content).toContain('@');
        expect(comment.content).toContain(testUsers[0]._id.toString());
      });
    });

    it('should generate replies within depth limit', async () => {
      const maxReplies = 3;
      const comments = await seedComments({
        users: testUsers,
        logos: testLogos,
        commentsPerLogo: 1,
        maxRepliesPerComment: maxReplies
      });

      const repliesCount = comments.filter(c => c.parentId).length;
      expect(repliesCount).toBeLessThanOrEqual(testLogos.length * maxReplies);
    });

    it('should set likes within limit', async () => {
      const maxLikes = 10;
      const comments = await seedComments({
        users: testUsers,
        logos: testLogos,
        commentsPerLogo: 1,
        maxLikesPerComment: maxLikes
      });

      comments.forEach(comment => {
        expect(comment.likes).toBeLessThanOrEqual(maxLikes);
        expect(comment.likes).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Collections', () => {
    it('should seed collections with tags', async () => {
      const collections = await seedCollections({
        users: testUsers,
        logos: testLogos,
        collectionsPerUser: 2,
        logosPerCollection: 3,
        collectionTags: true
      });

      expect(collections.length).toBe(testUsers.length * 2);
      collections.forEach(collection => {
        expect(collection.tags).toBeDefined();
        expect(collection.tags!.length).toBeGreaterThan(0);
        collection.tags!.forEach((tag: string) => {
          expect(COLLECTION_TAGS).toContain(tag);
        });
      });
    });

    it('should handle shared collections', async () => {
      const collections = await seedCollections({
        users: testUsers,
        logos: testLogos,
        collectionsPerUser: 1,
        logosPerCollection: 2,
        sharedCollections: true
      });

      collections.forEach(collection => {
        expect(collection.collaborators).toBeDefined();
        expect(collection.collaborators!.length).toBeGreaterThan(0);
        collection.collaborators!.forEach(collaboratorId => {
          expect(collaboratorId).not.toEqual(collection.userId);
        });
      });
    });

    it('should respect logos per collection limit', async () => {
      const logosPerCollection = 2;
      const collections = await seedCollections({
        users: testUsers,
        logos: testLogos,
        collectionsPerUser: 1,
        logosPerCollection
      });

      collections.forEach(collection => {
        expect(collection.logos.length).toBeLessThanOrEqual(logosPerCollection);
      });
    });
  });

  describe('Favorites', () => {
    it('should seed favorites within limit', async () => {
      const favoritesPerUser = 3;
      const favorites = await seedFavorites({
        users: testUsers,
        logos: testLogos,
        favoritesPerUser
      });

      expect(favorites.length).toBeLessThanOrEqual(testUsers.length * favoritesPerUser);
      
      // Check for unique favorites per user
      const userFavorites = new Map<string, Set<string>>();
      favorites.forEach(favorite => {
        const userId = favorite.userId.toString();
        if (!userFavorites.has(userId)) {
          userFavorites.set(userId, new Set());
        }
        const userSet = userFavorites.get(userId)!;
        const logoId = favorite.logoId.toString();
        expect(userSet.has(logoId)).toBe(false);
        userSet.add(logoId);
      });

      userFavorites.forEach(favorites => {
        expect(favorites.size).toBeLessThanOrEqual(favoritesPerUser);
      });
    });
  });
});

describe('Database Helper Edge Cases', () => {
  let dbHelper: DatabaseHelper;

  beforeEach(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  afterEach(async () => {
    await dbHelper.clearCollections();
    await dbHelper.disconnect();
  });

  describe('Connection Handling', () => {
    it('should handle multiple connect calls gracefully', async () => {
      await dbHelper.connect(); // Second connect
      expect(dbHelper.db).toBeDefined();
    });

    it('should handle disconnect when not connected', async () => {
      await dbHelper.disconnect();
      await dbHelper.disconnect(); // Second disconnect
    });
  });

  describe('User Validation', () => {
    it('should validate email format strictly', async () => {
      const invalidEmails = ['invalid', 'user@', '@domain.com', 'user@.com'];
      for (const email of invalidEmails) {
        await expect(dbHelper.createUser({ 
          email,
          username: 'testuser',
          password: 'password123'
        }))
          .rejects.toThrow('Invalid email format');
      }
    });

    it('should validate username format strictly', async () => {
      const invalidUsernames = [
        'user name',
        'user@name',
        'user#name',
        'user$name',
        'user%name',
        'user&name',
        'user*name',
        'user(name)',
        'user+name',
        'user=name'
      ];

      for (const username of invalidUsernames) {
        await expect(dbHelper.createUser({ 
          email: 'test@test.com',
          username 
        })).rejects.toThrow('Invalid username format');
      }
    });

    it('should validate profile fields strictly', async () => {
      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          bio: 'a'.repeat(DatabaseHelper.rules.user.BIO_MAX_LENGTH + 1)
        }
      })).rejects.toThrow('Bio cannot exceed');

      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          location: 'a'.repeat(DatabaseHelper.rules.user.LOCATION_MAX_LENGTH + 1)
        }
      })).rejects.toThrow('Location cannot exceed');

      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          skills: Array(DatabaseHelper.rules.user.MAX_SKILLS + 1).fill('skill')
        }
      })).rejects.toThrow('Cannot have more than');
    });

    it('should reject invalid profile fields', async () => {
      await expect(dbHelper.createUser({
        email: 'test@test.com',
        profile: {
          invalidField: 'test',
          anotherInvalidField: 123
        } as any
      })).rejects.toThrow('Invalid profile fields');
    });
  });

  describe('Logo Validation', () => {
    let userId: ObjectId;

    beforeEach(async () => {
      const user = await dbHelper.createUser({ email: 'test@test.com' });
      userId = user._id;
    });

    it('should validate logo name format strictly', async () => {
      const invalidNames = [
        '',
        'a'.repeat(DatabaseHelper.rules.logo.NAME_MAX_LENGTH + 1),
        'logo@name',
        'logo#name',
        'logo$name',
        'logo%name',
        'logo&name',
        'logo*name',
        'logo(name)',
        'logo+name'
      ];

      for (const name of invalidNames) {
        await expect(dbHelper.createLogo({
          userId,
          name,
          tags: ['test']
        })).rejects.toThrow(/Logo name/);
      }
    });

    it('should validate tags strictly', async () => {
      // Empty tags
      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: []
      })).rejects.toThrow('At least one tag is required');

      // Too many tags
      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: Array(DatabaseHelper.rules.logo.TAGS_MAX_COUNT + 1).fill('tag')
      })).rejects.toThrow('Too many tags');

      // Invalid tag format
      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: ['invalid@tag']
      })).rejects.toThrow('Invalid tag format');

      // Duplicate tags
      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: ['tag1', 'tag1']
      })).rejects.toThrow('Duplicate tags are not allowed');
    });

    it('should validate rating strictly', async () => {
      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: ['test'],
        rating: 'invalid' as any
      })).rejects.toThrow('Rating must be a number');

      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: ['test'],
        rating: -1
      })).rejects.toThrow('Rating must be between 0 and 5');

      await expect(dbHelper.createLogo({
        userId,
        name: 'Test Logo',
        tags: ['test'],
        rating: 6
      })).rejects.toThrow('Rating must be between 0 and 5');
    });
  });

  describe('Relationship Validation', () => {
    let users: User[];
    let logos: Logo[];

    beforeEach(async () => {
      users = await dbHelper.seedUsers({ count: 3 });
      logos = await dbHelper.seedLogos({
        count: 3,
        userIds: users.map(u => u._id)
      });
    });

    it('should validate comment depth strictly', async () => {
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        commentsPerLogo: DatabaseHelper.rules.relationships.MAX_COMMENTS_PER_LOGO + 1
      })).rejects.toThrow('Cannot create more than');

      await expect(dbHelper.seedRelationships({
        users,
        logos,
        commentsPerLogo: 1,
        maxRepliesPerComment: DatabaseHelper.rules.relationships.MAX_REPLY_DEPTH + 1
      })).rejects.toThrow('Cannot create more than');
    });

    it('should validate collection constraints strictly', async () => {
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        collectionsPerUser: DatabaseHelper.rules.relationships.MAX_COLLECTIONS_PER_USER + 1
      })).rejects.toThrow('Cannot create more than');

      await expect(dbHelper.seedRelationships({
        users,
        logos,
        collectionsPerUser: 1,
        logosPerCollection: DatabaseHelper.rules.relationships.MAX_LOGOS_PER_COLLECTION + 1
      })).rejects.toThrow('Cannot have more than');
    });

    it('should validate favorites constraints strictly', async () => {
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        favoritesPerUser: DatabaseHelper.rules.relationships.MAX_FAVORITES_PER_USER + 1
      })).rejects.toThrow('Cannot create more than');
    });

    it('should handle invalid sharing strategy', async () => {
      await expect(dbHelper.seedRelationships({
        users,
        logos,
        collectionsPerUser: 1,
        sharedCollections: true,
        sharingStrategy: (collection) => [collection.userId] // Invalid: sharing with owner
      })).rejects.toThrow('Cannot share collection with its owner');
    });
  });
}); 