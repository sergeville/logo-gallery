import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollection,
  getCollections,
  addLogoToCollection,
  removeLogoFromCollection,
  shareCollection,
  getSharedCollections,
  updateCollectionVisibility,
} from '../collection-operations';
import { registerUser } from '../auth';
import { uploadLogo } from '../logo-operations';

interface TestLogo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  userId: string;
  url: string;
}

describe('[P2] Logo Collections', () => {
  let mongoServer: MongoMemoryServer;
  let testUserId: string;
  let testLogo: TestLogo;
  let otherUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test',
      },
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create test users
    const owner = await registerUser({
      email: 'owner@example.com',
      password: 'Password123!',
      username: 'owner',
    });
    testUserId = owner.user!._id;

    const otherUser = await registerUser({
      email: 'other@example.com',
      password: 'Password123!',
      username: 'other',
    });
    otherUserId = otherUser.user!._id;

    // Upload test logo
    const result = await uploadLogo({
      userId: testUserId,
      title: 'Test Logo',
      description: 'A logo for testing collections',
      tags: ['test'],
      file: {
        name: 'test-logo.png',
        type: 'image/png',
        size: 1024,
        buffer: Buffer.from('mock-logo-data')
      }
    });
    testLogo = result.logo;
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await connectToDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Collection Management', () => {
    it('should create a new collection', async () => {
      const result = await createCollection({
        name: 'Test Collection',
        description: 'A test collection',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      expect(result.status).toBe(200);
      expect(result.collection).toBeDefined();
      expect(result.collection.name).toBe('Test Collection');
      expect(result.collection.userId).toBe(testUserId);
    });

    it('should update a collection', async () => {
      // Create a collection first
      const createResult = await createCollection({
        name: 'Original Name',
        description: 'Original description',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      const result = await updateCollection(createResult.collection._id, testUserId, {
        name: 'Updated Name',
        description: 'Updated description',
        category: 'work',
      });

      expect(result.status).toBe(200);
      expect(result.collection.name).toBe('Updated Name');
      expect(result.collection.description).toBe('Updated description');
      expect(result.collection.category).toBe('work');
    });

    it('should delete a collection', async () => {
      // Create a collection first
      const createResult = await createCollection({
        name: 'To Delete',
        description: 'Will be deleted',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      const result = await deleteCollection(createResult.collection._id, testUserId);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify collection is deleted
      const getResult = await getCollection(createResult.collection._id);
      expect(getResult.status).toBe(404);
    });
  });

  describe('Logo Management in Collections', () => {
    it('should add a logo to a collection', async () => {
      // Create a collection first
      const createResult = await createCollection({
        name: 'Logo Collection',
        description: 'Collection with logos',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      const result = await addLogoToCollection(
        createResult.collection._id,
        testLogo._id,
        testUserId
      );

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify logo is in collection
      const collection = await getCollection(createResult.collection._id);
      expect(collection.collection.logos.map(id => id.toString())).toContain(testLogo._id.toString());
    });

    it('should remove a logo from a collection', async () => {
      // Create a collection with a logo
      const createResult = await createCollection({
        name: 'Logo Collection',
        description: 'Collection with logos',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });
      await addLogoToCollection(createResult.collection._id, testLogo._id, testUserId);

      const result = await removeLogoFromCollection(
        createResult.collection._id,
        testLogo._id,
        testUserId
      );

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify logo is removed
      const collection = await getCollection(createResult.collection._id);
      expect(collection.collection.logos).not.toContain(testLogo._id);
    });
  });

  describe('Collection Sharing', () => {
    it('should share a collection with another user', async () => {
      // Create a collection first
      const createResult = await createCollection({
        name: 'Shared Collection',
        description: 'Collection to share',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      const result = await shareCollection(createResult.collection._id, testUserId, {
        sharedWith: [otherUserId],
        permissions: ['view'],
      });

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify shared collection is accessible
      const sharedCollections = await getSharedCollections(otherUserId);
      expect(sharedCollections.collections.some(c => c._id.toString() === createResult.collection._id.toString())).toBe(
        true
      );
    });

    it('should update collection visibility', async () => {
      // Create a private collection first
      const createResult = await createCollection({
        name: 'Private Collection',
        description: 'Will be public',
        userId: testUserId,
        isPublic: false,
        category: 'personal',
      });

      const result = await updateCollectionVisibility(
        createResult.collection._id,
        testUserId,
        true
      );

      expect(result.status).toBe(200);
      expect(result.collection.isPublic).toBe(true);
    });
  });

  describe('Collection Retrieval', () => {
    it('should get user collections with pagination', async () => {
      // Create multiple collections
      await Promise.all([
        createCollection({
          name: 'Collection 1',
          description: 'First collection',
          userId: testUserId,
          isPublic: false,
          category: 'personal',
        }),
        createCollection({
          name: 'Collection 2',
          description: 'Second collection',
          userId: testUserId,
          isPublic: true,
          category: 'work',
        }),
      ]);

      const result = await getCollections(testUserId, { page: 1, limit: 10 });

      expect(result.status).toBe(200);
      expect(result.collections).toBeDefined();
      expect(result.collections.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter collections by category', async () => {
      const result = await getCollections(testUserId, {
        page: 1,
        limit: 10,
        category: 'work',
      });

      expect(result.status).toBe(200);
      expect(result.collections).toBeDefined();
      expect(result.collections.every(c => c.category === 'work')).toBe(true);
    });
  });
});
