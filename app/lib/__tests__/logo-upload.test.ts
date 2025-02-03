import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from './test-helper';
import { validateLogoUpload } from '../logo-validation';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db-config';
import fs from 'fs/promises';
import path from 'path';

describe('Logo Upload Tests', () => {
  const testHelper = TestHelper.getInstance();
  
  // Test image files
  const testImageFiles = {
    valid: 'test-logo.png',
    similar: 'similar-logo.png',
    different: 'different-logo.png'
  };

  // Test cases from our catalog
  const uploadTests = [
    {
      name: 'valid PNG file',
      input: {
        file: {
          name: testImageFiles.valid,
          type: 'image/png',
          size: 500 * 1024 // 500KB
        },
        metadata: {
          width: 800,
          height: 600
        }
      },
      expected: { 
        isValid: true,
        status: 201 
      }
    },
    {
      name: 'oversized file',
      input: {
        file: {
          name: 'large.png',
          type: 'image/png',
          size: 5 * 1024 * 1024 // 5MB
        },
        metadata: {
          width: 800,
          height: 600
        }
      },
      expected: { 
        isValid: false,
        status: 400,
        error: 'File size exceeds limit'
      }
    },
    {
      name: 'invalid file type',
      input: {
        file: {
          name: 'document.pdf',
          type: 'application/pdf',
          size: 100 * 1024
        },
        metadata: {
          width: 800,
          height: 600
        }
      },
      expected: { 
        isValid: false,
        status: 400,
        error: 'Invalid file type'
      }
    },
    {
      name: 'missing metadata',
      input: {
        file: {
          name: 'logo.png',
          type: 'image/png',
          size: 500 * 1024
        },
        metadata: {}
      },
      expected: {
        isValid: false,
        status: 400,
        error: 'Invalid image metadata'
      }
    },
    {
      name: 'invalid metadata dimensions',
      input: {
        file: {
          name: 'logo.png',
          type: 'image/png',
          size: 500 * 1024
        },
        metadata: {
          width: -100,
          height: 0
        }
      },
      expected: {
        isValid: false,
        status: 400,
        error: 'Invalid image dimensions'
      }
    }
  ];

  beforeEach(async () => {
    // Setup test environment
    await testHelper.connect();
    await testHelper.clearCollections();
    
    // Create a test user for uploads
    const testUser = await testHelper.createTestUser({
      email: 'test@example.com',
      username: 'testuser'
    });
    
    // Store test user ID for use in tests
    process.env.TEST_USER_ID = testUser._id.toString();
  });

  afterEach(async () => {
    // Cleanup after each test
    await testHelper.clearCollections();
    await testHelper.disconnect();
    delete process.env.TEST_USER_ID;
  });

  // Run all test cases
  uploadTests.forEach(({ name, input, expected }) => {
    it(`handles ${name}`, async () => {
      // Create a mock file upload
      const mockFile = testHelper.mockFileUpload(input.file);
      
      // Validate the upload
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: input.metadata
      });

      // Verify the results
      expect(result.isValid).toBe(expected.isValid);
      expect(result.status).toBe(expected.status);
      
      if (!expected.isValid) {
        expect(result.error).toBe(expected.error);
      }
    });
  });

  // Additional specific test for successful upload
  it('successfully uploads and stores valid logo', async () => {
    const validFile = uploadTests[0].input;
    const mockFile = testHelper.mockFileUpload(validFile.file);
    
    const result = await validateLogoUpload({
      file: mockFile,
      userId: process.env.TEST_USER_ID!,
      metadata: validFile.metadata
    });

    // Verify the upload was successful
    expect(result.isValid).toBe(true);
    expect(result.status).toBe(201);
    expect(result.logoId).toBeDefined();

    console.log('Logo ID from result:', result.logoId);
    console.log('Logo ID as ObjectId:', result.logoId);

    // Wait for a moment to ensure the write operation is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // First try to find all logos to see what's in the collection
    const allLogos = await testHelper.getDb()
      .collection('logos')
      .find({})
      .toArray();
    console.log('All logos in collection:', allLogos.map(logo => ({
      _id: logo._id.toString(),
      name: logo.name,
      file: { ...logo.file, data: '[Buffer]' }
    })));

    // Verify the logo was stored in the database
    const storedLogo = await testHelper.getDb()
      .collection('logos')
      .findOne({ _id: result.logoId });

    console.log('Retrieved logo:', storedLogo);

    expect(storedLogo).toBeDefined();
    expect(storedLogo?.file?.name).toBe(validFile.file.name);
    expect(storedLogo?.metadata).toEqual(validFile.metadata);
  });

  describe('Metadata Validation', () => {
    it('verifies metadata is stored correctly', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result.isValid).toBe(true);
      
      const storedLogo = await testHelper.getDb()
        .collection('logos')
        .findOne({ _id: result.logoId });

      expect(storedLogo?.metadata).toBeDefined();
      expect(storedLogo?.metadata.width).toBe(validFile.metadata.width);
      expect(storedLogo?.metadata.height).toBe(validFile.metadata.height);
    });

    it('rejects missing metadata', async () => {
      const invalidFile = uploadTests[3].input;
      const mockFile = testHelper.mockFileUpload(invalidFile.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: invalidFile.metadata
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid image metadata');
    });

    it('rejects invalid dimensions', async () => {
      const invalidFile = uploadTests[4].input;
      const mockFile = testHelper.mockFileUpload(invalidFile.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: invalidFile.metadata
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid image dimensions');
    });
  });

  describe('User Association', () => {
    it('correctly associates logo with user', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result.isValid).toBe(true);
      
      const storedLogo = await testHelper.getDb()
        .collection('logos')
        .findOne({ _id: result.logoId });

      expect(storedLogo?.userId.toString()).toBe(process.env.TEST_USER_ID);

      // Verify we can find the logo by user ID
      const userLogos = await testHelper.getDb()
        .collection('logos')
        .find({ userId: new ObjectId(process.env.TEST_USER_ID) })
        .toArray();

      expect(userLogos.length).toBe(1);
      expect(userLogos[0]._id.toString()).toBe(result.logoId.toString());
    });

    it('rejects upload with invalid user ID', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: 'invalid-user-id',
        metadata: validFile.metadata
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid user ID');
    });

    it('rejects upload with non-existent user ID', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      const nonExistentUserId = new ObjectId().toString();
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: nonExistentUserId,
        metadata: validFile.metadata
      });

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toBe('User not found');
    });
  });

  describe('Duplicate File Handling', () => {
    it('detects duplicate file upload by hash', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      // First upload
      const result1 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);

      // Second upload of the same file
      const result2 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result2.isValid).toBe(false);
      expect(result2.status).toBe(409); // Conflict status code
      expect(result2.error).toBe('Duplicate file detected');
    });

    it('allows same file to be uploaded by different users', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      // First user upload
      const result1 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);

      // Create second test user
      const testUser2 = await testHelper.createTestUser({
        email: 'test2@example.com',
        username: 'testuser2'
      });

      // Second user upload of the same file
      const result2 = await validateLogoUpload({
        file: mockFile,
        userId: testUser2._id.toString(),
        metadata: validFile.metadata
      });

      expect(result2.isValid).toBe(true);
      expect(result2.status).toBe(201);
    });

    it('detects duplicate by content even with different filenames', async () => {
      const validFile = uploadTests[0].input;
      const mockFile1 = testHelper.mockFileUpload({
        ...validFile.file,
        name: 'logo1.png'
      });
      
      const mockFile2 = testHelper.mockFileUpload({
        ...validFile.file,
        name: 'logo2.png'
      });

      // First upload
      const result1 = await validateLogoUpload({
        file: mockFile1,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);

      // Second upload with different filename but same content
      const result2 = await validateLogoUpload({
        file: mockFile2,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result2.isValid).toBe(false);
      expect(result2.status).toBe(409);
      expect(result2.error).toBe('Duplicate file detected');
    });

    it('detects duplicate when file content is the same but metadata differs', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      // First upload
      const result1 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: { width: 800, height: 600 }
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);

      // Second upload with different metadata
      const result2 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: { width: 400, height: 300 }
      });

      expect(result2.isValid).toBe(false);
      expect(result2.status).toBe(409);
      expect(result2.error).toBe('Duplicate file detected');
    });

    it('allows reuploading after original is deleted', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      // First upload
      const result1 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);

      // Delete the logo
      await testHelper.getDb().collection('logos').deleteOne({ _id: result1.logoId });

      // Try uploading the same file again
      const result2 = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: validFile.metadata
      });

      expect(result2.isValid).toBe(true);
      expect(result2.status).toBe(201);
    });

    it('handles concurrent uploads of the same file', async () => {
      const validFile = uploadTests[0].input;
      const mockFile = testHelper.mockFileUpload(validFile.file);
      
      // Attempt to upload the same file concurrently
      const [result1, result2] = await Promise.all([
        validateLogoUpload({
          file: mockFile,
          userId: process.env.TEST_USER_ID!,
          metadata: validFile.metadata
        }),
        validateLogoUpload({
          file: mockFile,
          userId: process.env.TEST_USER_ID!,
          metadata: validFile.metadata
        })
      ]);

      // One should succeed and one should fail
      const successCount = [result1, result2].filter(r => r.isValid).length;
      const failureCount = [result1, result2].filter(r => !r.isValid).length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
    });
  });

  describe('Duplicate and Similar File Handling', () => {
    it('detects exact duplicate file upload by hash', async () => {
      const userId = new ObjectId();
      const result1 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      const result2 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);
      expect(result2.isValid).toBe(false);
      expect(result2.status).toBe(400);
      expect(result2.error).toContain('duplicate');
    });

    it('detects similar images even with different filenames', async () => {
      const userId = new ObjectId();
      const result1 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      const result2 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.similar,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);
      expect(result2.isValid).toBe(false);
      expect(result2.status).toBe(400);
      expect(result2.error).toContain('similar');
    });

    it('allows different images to be uploaded', async () => {
      const userId = new ObjectId();
      const result1 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.valid,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      const result2 = await validateLogoUpload({
        file: testHelper.mockFileUpload({
          name: testImageFiles.different,
          type: 'image/png',
          size: 500 * 1024
        }),
        metadata: { width: 800, height: 600 },
        userId: userId.toString()
      });

      expect(result1.isValid).toBe(true);
      expect(result1.status).toBe(201);
      expect(result2.isValid).toBe(true);
      expect(result2.status).toBe(201);
    });
  });
}); 