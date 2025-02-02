import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import { uploadLogo, getLogo } from '../logo-operations';
import { registerUser } from '../auth';

let mongoServer: MongoMemoryServer;

describe('[P0] Logo Core Operations', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test'
      }
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create a test user
    const user = await registerUser({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser'
    });
    testUserId = user.user!._id;
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection('logos').deleteMany({});
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Logo Upload', () => {
    it('should successfully upload a valid PNG file', async () => {
      const mockFile = {
        name: 'test-logo.png',
        size: 500 * 1024, // 500KB
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const result = await uploadLogo({
        file: mockFile,
        userId: testUserId,
        title: 'Test Logo',
        tags: ['test', 'logo']
      });

      expect(result.status).toBe(201);
      expect(result.logo).toBeDefined();
      expect(result.logo!.title).toBe('Test Logo');
      expect(result.logo!.userId).toBe(testUserId);
      expect(result.logo!.fileUrl).toBeDefined();
      expect(result.logo!.tags).toEqual(['test', 'logo']);
    });

    it('should reject oversized files', async () => {
      const mockFile = {
        name: 'large-logo.png',
        size: 5 * 1024 * 1024, // 5MB
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const result = await uploadLogo({
        file: mockFile,
        userId: testUserId,
        title: 'Large Logo',
        tags: ['test']
      });

      expect(result.status).toBe(400);
      expect(result.error).toBe('File size exceeds the 2MB limit');
    });

    it('should reject invalid file types', async () => {
      const mockFile = {
        name: 'document.pdf',
        size: 100 * 1024,
        type: 'application/pdf',
        buffer: Buffer.from('mock-pdf-data')
      };

      const result = await uploadLogo({
        file: mockFile,
        userId: testUserId,
        title: 'PDF Document',
        tags: ['test']
      });

      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid file type. Only PNG, JPG, and SVG files are allowed');
    });
  });

  describe('Logo Retrieval', () => {
    let uploadedLogoId: string;

    beforeEach(async () => {
      // Upload a test logo
      const mockFile = {
        name: 'test-logo.png',
        size: 500 * 1024,
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const result = await uploadLogo({
        file: mockFile,
        userId: testUserId,
        title: 'Test Logo',
        tags: ['test']
      });

      uploadedLogoId = result.logo!._id;
    });

    it('should successfully retrieve a logo by id', async () => {
      const logo = await getLogo(uploadedLogoId);

      expect(logo).toBeDefined();
      expect(logo!.title).toBe('Test Logo');
      expect(logo!.userId).toBe(testUserId);
      expect(logo!.fileUrl).toBeDefined();
      expect(logo!.tags).toEqual(['test']);
    });

    it('should return null for non-existent logo id', async () => {
      const logo = await getLogo('nonexistentid123');
      expect(logo).toBeNull();
    });
  });
}); 