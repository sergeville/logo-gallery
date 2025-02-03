import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from './test-helper';
import { validateLogoUpload } from '../logo-validation';
import { ObjectId } from 'mongodb';

describe('Logo Upload System', () => {
  const testHelper = TestHelper.getInstance();
  
  // Shared test context
  const testContext = {
    imageFiles: {
      valid: 'test-logo.png',
      similar: 'similar-logo.png',
      different: 'different-logo.png'
    },
    userId: new ObjectId(),
    defaultMetadata: {
      width: 800,
      height: 600
    }
  };

  // Setup and teardown
  beforeEach(async () => {
    await testHelper.connect();
    await testHelper.clearCollections();
  });

  afterEach(async () => {
    await testHelper.clearCollections();
  });

  describe('Basic Validation', () => {
    describe('File Format Validation', () => {
      it('accepts valid PNG files', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(true);
        expect(result.status).toBe(201);
      });

      it('rejects oversized files', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: 'large.png',
            type: 'image/png',
            size: 5 * 1024 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(false);
        expect(result.status).toBe(413);
      });

      it('rejects invalid file types', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: 'document.pdf',
            type: 'application/pdf',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(false);
        expect(result.status).toBe(415);
      });
    });

    describe('Metadata Validation', () => {
      it('verifies metadata is stored correctly', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(true);
        const storedLogo = await testHelper.getDb()
          .collection('logos')
          .findOne({ _id: new ObjectId(result.logoId) });
        
        expect(storedLogo.metadata).toEqual(testContext.defaultMetadata);
      });

      it('rejects missing metadata', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: null,
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(false);
        expect(result.status).toBe(400);
      });

      it('rejects invalid dimensions', async () => {
        const result = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: { width: -1, height: 0 },
          userId: testContext.userId.toString()
        });

        expect(result.isValid).toBe(false);
        expect(result.status).toBe(400);
      });
    });
  });

  describe('User Association', () => {
    it('correctly associates logo with user', async () => {
      const user = await testHelper.createTestUser();
      const result = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testContext.imageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: testContext.defaultMetadata,
        userId: user._id.toString()
      });

      expect(result.isValid).toBe(true);
      const storedLogo = await testHelper.getDb()
        .collection('logos')
        .findOne({ _id: new ObjectId(result.logoId) });
      
      expect(storedLogo.userId.toString()).toBe(user._id.toString());
    });

    it('rejects upload with invalid user ID', async () => {
      const result = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testContext.imageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: testContext.defaultMetadata,
        userId: 'invalid-id'
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
    });

    it('rejects upload with non-existent user ID', async () => {
      const result = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testContext.imageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: testContext.defaultMetadata,
        userId: new ObjectId().toString()
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  describe('Duplicate and Similar File Handling', () => {
    describe('Exact Duplicates', () => {
      it('detects duplicate file upload by hash', async () => {
        // First upload
        const result1 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result1.isValid).toBe(true);

        // Second upload with same content
        const result2 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString()
        });

        expect(result2.isValid).toBe(false);
        expect(result2.status).toBe(409);
      });

      it('allows same file to be uploaded by different users', async () => {
        const user1 = await testHelper.createTestUser({ email: 'user1@test.com' });
        const user2 = await testHelper.createTestUser({ email: 'user2@test.com' });

        const result1 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: user1._id.toString()
        });

        const result2 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: user2._id.toString()
        });

        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
      });
    });

    describe('Similar Images', () => {
      it('detects similar images even with different filenames', async () => {
        const result1 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString(),
          allowSimilarImages: false
        });

        const result2 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.similar,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString(),
          allowSimilarImages: false
        });

        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(false);
        expect(result2.status).toBe(409);
      });

      it('allows different images to be uploaded', async () => {
        const result1 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.valid,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString(),
          allowSimilarImages: false
        });

        const result2 = await validateLogoUpload({
          file: testHelper.mockFileUpload({
            name: testContext.imageFiles.different,
            type: 'image/png',
            size: 500 * 1024
          }),
          metadata: testContext.defaultMetadata,
          userId: testContext.userId.toString(),
          allowSimilarImages: false
        });

        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
        expect(result1.status).toBe(201);
        expect(result2.status).toBe(201);
      });
    });
  });
}); 