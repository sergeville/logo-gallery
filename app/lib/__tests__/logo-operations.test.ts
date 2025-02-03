import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import { uploadLogo, getLogo } from '../logo-operations';
import { registerUser } from '../auth';

let mongoServer: MongoMemoryServer;

describe('[P0] Logo Core Operations', () => {
  let testUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectToDatabase();

    // Create a test user
    const user = await registerUser({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser'
    });
    testUserId = user.user!._id;
  });

  afterAll(async () => {
    await closeDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection('logos').deleteMany({});
  });

  describe('Logo Upload', () => {
    it('should successfully upload a valid PNG file', async () => {
      const mockFile = {
        name: 'test-logo.png',
        size: 500 * 1024, // 500KB
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const input = {
        file: mockFile,
        userId: testUserId,
        title: 'Test Logo',
        tags: ['test', 'logo']
      };

      const result = await uploadLogo(input);

      expect(result.status).toBe(201);
      expect(result.logo).toBeDefined();
      expect(result.logo.file.name).toBe(mockFile.name);
      expect(result.logo.title).toBe(input.title);
      expect(result.logo.tags).toEqual(input.tags);
    });

    it('should reject oversized files', async () => {
      const mockFile = {
        name: 'large-logo.png',
        size: 6 * 1024 * 1024, // 6MB
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const input = {
        file: mockFile,
        userId: testUserId,
        title: 'Large Logo',
        tags: ['test']
      };

      const result = await uploadLogo(input);

      expect(result.status).toBe(400);
      expect(result.error).toContain('size exceeds limit');
    });

    it('should reject invalid file types', async () => {
      const mockFile = {
        name: 'document.pdf',
        size: 1024,
        type: 'application/pdf',
        buffer: Buffer.from('mock-pdf-data')
      };

      const input = {
        file: mockFile,
        userId: testUserId,
        title: 'PDF Document',
        tags: ['test']
      };

      const result = await uploadLogo(input);

      expect(result.status).toBe(400);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('Logo Retrieval', () => {
    it('should successfully retrieve a logo by id', async () => {
      // First upload a logo
      const mockFile = {
        name: 'test-logo.png',
        size: 500 * 1024,
        type: 'image/png',
        buffer: Buffer.from('mock-image-data')
      };

      const uploadInput = {
        file: mockFile,
        userId: testUserId,
        title: 'Test Logo',
        tags: ['test', 'logo']
      };

      const uploadResult = await uploadLogo(uploadInput);
      expect(uploadResult.status).toBe(201);

      // Then retrieve it
      const logoId = uploadResult.logo._id;
      const retrievedLogo = await getLogo(logoId);

      expect(retrievedLogo).toBeDefined();
      expect(retrievedLogo!.title).toBe(uploadInput.title);
      expect(retrievedLogo!.file.name).toBe(mockFile.name);
    });

    it('should return null for non-existent logo id', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const result = await getLogo(nonExistentId);
      expect(result).toBeNull();
    });
  });
}); 