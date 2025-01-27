import { MongoClient } from 'mongodb';
import { TestDbHelper } from '../../test-data/utils/test-db-helper';
import { jest } from '@jest/globals';
import type { ClientUser, ClientLogo } from '@/lib/types';

jest.mock('mongodb');

describe('TestDbHelper', () => {
  let testDbHelper: TestDbHelper;

  beforeEach(() => {
    testDbHelper = new TestDbHelper();
  });

  afterEach(async () => {
    await testDbHelper.disconnect();
  });

  describe('constructor', () => {
    it('should create an instance with default values', () => {
      expect(testDbHelper).toBeInstanceOf(TestDbHelper);
      expect(testDbHelper.getClient()).toBeDefined();
    });
  });

  describe('connection management', () => {
    it('should start disconnected', () => {
      expect(testDbHelper.isConnected).toBe(false);
    });

    it('should connect to database', async () => {
      await testDbHelper.connect();
      expect(testDbHelper.isConnected).toBe(true);
      expect(MongoClient.connect).toHaveBeenCalledWith(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test');
    });

    it('should disconnect from database', async () => {
      await testDbHelper.connect();
      expect(testDbHelper.isConnected).toBe(true);
      
      await testDbHelper.disconnect();
      expect(testDbHelper.isConnected).toBe(false);
      expect(testDbHelper.getDb()).toBeNull();
    });
  });

  describe('collection operations', () => {
    beforeEach(async () => {
      await testDbHelper.connect();
    });

    it('should get collection', async () => {
      const collection = testDbHelper.collection('test');
      expect(collection).toBeDefined();
    });

    it('should clear single collection', async () => {
      const collection = testDbHelper.collection('test');
      await collection.insertOne({ test: 'data' });
      await testDbHelper.clearCollection('test');
      const count = await collection.countDocuments();
      expect(count).toBe(0);
    });

    it('should clear specified collections', async () => {
      const collections = ['test1', 'test2'];
      for (const name of collections) {
        const collection = testDbHelper.collection(name);
        await collection.insertOne({ test: true });
      }

      await testDbHelper.clearCollections(collections);

      for (const name of collections) {
        const collection = testDbHelper.collection(name);
        const count = await collection.countDocuments();
        expect(count).toBe(0);
      }
    });

    it('should clear all collections', async () => {
      const collections = ['users', 'logos'];
      for (const name of collections) {
        const collection = testDbHelper.collection(name);
        await collection.insertOne({ test: true });
      }
      await testDbHelper.clearAllCollections();
      for (const name of collections) {
        const collection = testDbHelper.collection(name);
        const count = await collection.countDocuments();
        expect(count).toBe(0);
      }
    });
  });

  describe('data operations', () => {
    beforeEach(async () => {
      await testDbHelper.connect();
    });

    it('should insert and find user', async () => {
      const user: Partial<ClientUser> = {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await testDbHelper.insertUser(user);
      const result = await testDbHelper.findUser({ email: user.email });
      expect(result).toBeDefined();
      expect(result?.name).toBe(user.name);
    });

    it('should insert and find logo', async () => {
      const logo: Partial<ClientLogo> = {
        id: 'test-logo-1',
        name: 'Test Logo',
        description: 'A test logo',
        imageUrl: 'http://example.com/logo.png',
        thumbnailUrl: 'http://example.com/logo-thumb.png',
        ownerId: 'test-user-1',
        ownerName: 'Test User',
        category: 'test',
        tags: ['test'],
        dimensions: { width: 100, height: 100 },
        fileSize: 1000,
        fileType: 'image/png',
        averageRating: 0,
        totalVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await testDbHelper.insertLogo(logo);
      const result = await testDbHelper.findLogo({ name: logo.name });
      expect(result).toBeDefined();
      expect(result?.description).toBe(logo.description);
    });
  });

  describe('error handling', () => {
    it('should throw error when accessing collection without connection', () => {
      expect(() => testDbHelper.collection('test')).toThrow('Database not connected');
    });

    it('should throw error when clearing collection without connection', async () => {
      await expect(testDbHelper.clearCollection('test')).rejects.toThrow('Database not connected');
    });

    it('should throw error when clearing collections with invalid parameter', async () => {
      await expect(testDbHelper.clearCollections(null as any)).rejects.toThrow('Collections parameter must be an array');
    });
  });
}); 