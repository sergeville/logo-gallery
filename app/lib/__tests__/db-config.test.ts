// Set test mode in process.env before any imports
process.env.NODE_ENV = 'test';

import { config } from 'dotenv';
import path from 'path';

// Load test environment variables before importing the database configuration
config({ path: path.resolve(process.cwd(), '.env.test') });

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { connectToDatabase, disconnectFromDatabase, DB_NAMES, DB_OPTIONS, __setTestMode } from '../db-config';

// Enable test mode
__setTestMode(true);

// Mock MongoDB client
vi.mock('mongodb', () => {
  let isConnected = true;

  const mockCollection = {
    find: vi.fn().mockReturnThis(),
    findOne: vi.fn().mockResolvedValue(null),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([]),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 })
  };

  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
    collections: vi.fn().mockResolvedValue([mockCollection])
  };

  const mockClient = {
    db: vi.fn().mockReturnValue(mockDb),
    close: vi.fn().mockImplementation(() => {
      isConnected = false;
      return Promise.resolve(true);
    }),
    connect: vi.fn().mockImplementation(() => {
      isConnected = true;
      return Promise.resolve(true);
    }),
    isConnected: vi.fn().mockImplementation(() => isConnected),
    topology: {
      isConnected: vi.fn().mockImplementation(() => isConnected)
    }
  };

  return {
    MongoClient: {
      connect: vi.fn().mockResolvedValue(mockClient)
    }
  };
});

describe('MongoDB Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    __setTestMode(true);
  });

  afterEach(async () => {
    await disconnectFromDatabase();
    vi.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should use correct database name for each environment', () => {
      expect(DB_NAMES.development).toBe('LogoGalleryDevelopmentDB');
      expect(DB_NAMES.test).toBe('LogoGalleryTestDB');
      expect(DB_NAMES.production).toBe('LogoGalleryDB');
    });

    it('should use correct options for each environment', () => {
      // Development options
      expect(DB_OPTIONS.development).toEqual({
        retryWrites: true,
        w: 'majority',
      });

      // Production options
      expect(DB_OPTIONS.production).toEqual({
        retryWrites: true,
        w: 'majority',
        ssl: true,
        authSource: 'admin',
        maxPoolSize: 50
      });
    });
  });

  describe('Connection Management', () => {
    it('should create a new connection when none exists', async () => {
      const { client, db } = await connectToDatabase();
      expect(client).toBeDefined();
      expect(db).toBeDefined();
    });

    it('should reuse existing connection', async () => {
      const connection1 = await connectToDatabase();
      const connection2 = await connectToDatabase();
      expect(connection1.client).toBe(connection2.client);
    });

    it('should properly disconnect and clear cache', async () => {
      const { client } = await connectToDatabase();
      await disconnectFromDatabase();
      expect(client.topology?.isConnected()).toBeFalsy();
    });
  });

  describe('Query Standards', () => {
    let db: any;

    beforeEach(async () => {
      const connection = await connectToDatabase();
      db = connection.db;
    });

    it('should handle pagination correctly', async () => {
      const ITEMS_PER_PAGE = 20;
      const page = 0;
      
      const items = await db.collection('test')
        .find({})
        .skip(page * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .toArray();
      
      expect(Array.isArray(items)).toBeTruthy();
    });

    it('should handle projections correctly', async () => {
      const result = await db.collection('test').findOne(
        { _id: 'test' },
        { projection: { field1: 1 } } // Only include field1
      );
      
      expect(result).toBeNull();
    });
  });
}); 