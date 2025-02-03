import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import {
  uploadLogo,
  updateLogoMetadata,
  addLogoVersion,
  getLogoVersions,
  setLogoVisibility,
  addLogoToCollection,
  removeLogoFromCollection,
  getLogoCollections,
} from '../logo-operations';
import { registerUser } from '../auth';

interface TestLogo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  userId: string;
  url: string;
  isPublic: boolean;
  versions?: {
    _id: string;
    url: string;
    createdAt: string;
  }[];
}

let mongoServer: MongoMemoryServer;

describe('[P1] Extended Logo Management', () => {
  let testUserId: string;
  let testLogo: TestLogo;
  let testCollection: { _id: string; name: string };

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test',
      },
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create a test user
    const user = await registerUser({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
    });
    testUserId = user.user!._id;

    // Upload initial test logo
    const result = await uploadLogo(testUserId, {
      title: 'Test Logo',
      description: 'A test logo',
      tags: ['test', 'initial'],
      file: Buffer.from('mock-logo-data'),
    });
    testLogo = result.logo as TestLogo;
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

  describe('Logo Versioning', () => {
    it('should add a new version of a logo', async () => {
      const result = await addLogoVersion(testLogo._id, {
        file: Buffer.from('updated-logo-data'),
        note: 'Updated color scheme',
      });

      expect(result.status).toBe(200);
      expect(result.version).toBeDefined();
      expect(result.version.note).toBe('Updated color scheme');
    });

    it('should retrieve version history', async () => {
      const result = await getLogoVersions(testLogo._id);

      expect(result.status).toBe(200);
      expect(result.versions).toBeDefined();
      expect(result.versions).toHaveLength(2); // Original + new version
      expect(result.versions[0].isOriginal).toBe(true);
    });

    it('should handle non-existent logo for versioning', async () => {
      const result = await addLogoVersion('nonexistent123', {
        file: Buffer.from('new-version'),
        note: 'Should fail',
      });

      expect(result.status).toBe(404);
      expect(result.error).toBe('Logo not found');
    });
  });

  describe('Logo Visibility', () => {
    it('should set logo visibility to private', async () => {
      const result = await setLogoVisibility(testLogo._id, false);

      expect(result.status).toBe(200);
      expect(result.logo.isPublic).toBe(false);
    });

    it('should set logo visibility to public', async () => {
      const result = await setLogoVisibility(testLogo._id, true);

      expect(result.status).toBe(200);
      expect(result.logo.isPublic).toBe(true);
    });

    it('should handle unauthorized visibility changes', async () => {
      // Create another user
      const otherUser = await registerUser({
        email: 'other@example.com',
        password: 'Password123!',
        username: 'otheruser',
      });

      const result = await setLogoVisibility(testLogo._id, false, otherUser.user!._id);

      expect(result.status).toBe(403);
      expect(result.error).toBe('Unauthorized to modify this logo');
    });
  });

  describe('Logo Collections', () => {
    beforeEach(async () => {
      // Create a test collection
      const { db } = await connectToDatabase();
      const collection = await db.collection('collections').insertOne({
        name: 'Test Collection',
        userId: testUserId,
        createdAt: new Date(),
      });
      testCollection = {
        _id: collection.insertedId.toString(),
        name: 'Test Collection',
      };
    });

    it('should add logo to collection', async () => {
      const result = await addLogoToCollection(testLogo._id, testCollection._id);

      expect(result.status).toBe(200);
      expect(result.collection).toBeDefined();
      expect(result.collection.logos).toContain(testLogo._id);
    });

    it('should remove logo from collection', async () => {
      const result = await removeLogoFromCollection(testLogo._id, testCollection._id);

      expect(result.status).toBe(200);
      expect(result.collection).toBeDefined();
      expect(result.collection.logos).not.toContain(testLogo._id);
    });

    it('should get user collections with logos', async () => {
      const result = await getLogoCollections(testUserId);

      expect(result.status).toBe(200);
      expect(result.collections).toBeDefined();
      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].name).toBe('Test Collection');
    });
  });

  describe('Metadata Management', () => {
    it('should update logo metadata', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        tags: ['updated', 'test'],
        license: 'MIT',
      };

      const result = await updateLogoMetadata(testLogo._id, updates);

      expect(result.status).toBe(200);
      expect(result.logo).toBeDefined();
      expect(result.logo.title).toBe(updates.title);
      expect(result.logo.description).toBe(updates.description);
      expect(result.logo.tags).toEqual(expect.arrayContaining(updates.tags));
      expect(result.logo.license).toBe(updates.license);
    });

    it('should handle partial metadata updates', async () => {
      const updates = {
        title: 'New Title',
      };

      const result = await updateLogoMetadata(testLogo._id, updates);

      expect(result.status).toBe(200);
      expect(result.logo.title).toBe(updates.title);
      expect(result.logo.description).toBe('Updated description'); // Unchanged
    });

    it('should validate metadata updates', async () => {
      const updates = {
        title: '', // Empty title should be invalid
        tags: [''], // Empty tags should be invalid
      };

      const result = await updateLogoMetadata(testLogo._id, updates);

      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid metadata');
    });
  });
});
