import { ObjectId } from 'mongodb';
import { TestUser, TestLogo, generateTestUser, generateTestLogo } from '../test-data-generator';
import { validateUser, validateLogo, validateUserBatch, validateLogoBatch } from '../validation-utils';
import { TestDbHelper } from '../test-db-helper';

/**
 * Integration tests for the validation utilities.
 * Tests the validation of users and logos, including both individual and batch validation.
 * Uses a test MongoDB instance to verify database interactions.
 */
describe('Validation Integration Tests', () => {
  let testDb: TestDbHelper;
  let testUsers: TestUser[];
  let testLogos: TestLogo[];

  beforeAll(async () => {
    testDb = new TestDbHelper('mongodb://localhost:27017/test-db');
    await testDb.connect();
  });

  /**
   * Before each test:
   * 1. Clears the database
   * 2. Creates test users (one regular, one admin)
   * 3. Generates test logos associated with the users
   */
  beforeEach(async () => {
    await testDb.clearDatabase();
    
    // Generate test users
    testUsers = [
      generateTestUser(),
      generateTestUser({
        role: 'admin',
        profile: {
          bio: 'Admin user bio'
        }
      })
    ];

    // Insert test users
    const insertedUsers = await testDb.bulkInsertUsers(testUsers);
    testUsers = insertedUsers as TestUser[];

    // Generate test logos
    testLogos = [
      generateTestLogo(testUsers[0]._id!),
      generateTestLogo(testUsers[1]._id!, {
        category: 'Business',
        tags: ['corporate', 'professional']
      })
    ];
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  /**
   * User Validation Tests
   * Tests various aspects of user data validation including:
   * - Valid user data
   * - Email format validation
   * - Required field validation
   * - Optional profile field validation
   */
  describe('User Validation', () => {
    it('should validate a valid user', () => {
      const user = generateTestUser();
      const result = validateUser(user);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid email format', () => {
      const user = generateTestUser({ email: 'invalid-email' });
      const result = validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Invalid email format');
    });

    it('should detect missing required fields', () => {
      const user = generateTestUser();
      delete (user as any).username;
      delete (user as any).email;
      
      const result = validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map(e => e.message)).toContain('Username is required');
      expect(result.errors.map(e => e.message)).toContain('Email is required');
    });

    it('should validate optional profile fields', () => {
      const user = generateTestUser({
        profile: {
          website: 'invalid-url',
          bio: 'A'.repeat(501) // Too long
        }
      });
      
      const result = validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map(e => e.message)).toContain('Invalid website format');
      expect(result.errors.map(e => e.message)).toContain('Bio must not exceed 500 characters');
    });
  });

  /**
   * Logo Validation Tests
   * Tests various aspects of logo data validation including:
   * - Valid logo data
   * - URL format validation
   * - Dimension validation
   * - Color format validation
   */
  describe('Logo Validation', () => {
    it('should validate a valid logo', () => {
      const logo = generateTestLogo(testUsers[0]._id!);
      const result = validateLogo(logo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid URLs', () => {
      const logo = generateTestLogo(testUsers[0]._id!, {
        imageUrl: 'invalid-url',
        thumbnailUrl: 'also-invalid'
      });
      
      const result = validateLogo(logo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map(e => e.message)).toContain('Invalid image URL format');
      expect(result.errors.map(e => e.message)).toContain('Invalid thumbnail URL format');
    });

    it('should detect invalid dimensions', () => {
      const logo = generateTestLogo(testUsers[0]._id!, {
        dimensions: {
          width: -1,
          height: 0
        }
      });
      
      const result = validateLogo(logo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map(e => e.message)).toContain('Invalid width');
      expect(result.errors.map(e => e.message)).toContain('Invalid height');
    });

    it('should validate colors format', () => {
      const logo = generateTestLogo(testUsers[0]._id!, {
        colors: ['invalid', '#12345G'] // Invalid hex colors
      });
      
      const result = validateLogo(logo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Colors must be valid hex color codes');
    });
  });

  /**
   * Batch Validation Tests
   * Tests validation of multiple users and logos at once:
   * - Multiple user validation with mixed valid/invalid data
   * - Multiple logo validation with mixed valid/invalid data
   * Verifies that validation results include correct indices and error counts
   */
  describe('Batch Validation', () => {
    it('should validate multiple users', () => {
      const users = [
        generateTestUser(), // Valid
        generateTestUser({ email: 'invalid-email' }), // Invalid email
        generateTestUser({ username: 'a' }) // Invalid username
      ];
      
      const results = validateUserBatch(users);
      expect(results).toHaveLength(2); // Two invalid users
      expect(results[0].index).toBe(1); // Second user
      expect(results[1].index).toBe(2); // Third user
    });

    it('should validate multiple logos', () => {
      const logos = [
        generateTestLogo(testUsers[0]._id!), // Valid
        generateTestLogo(testUsers[0]._id!, { imageUrl: 'invalid' }), // Invalid URL
        generateTestLogo(testUsers[0]._id!, { fileType: 'invalid' }) // Invalid file type
      ];
      
      const results = validateLogoBatch(logos);
      expect(results).toHaveLength(2); // Two invalid logos
      expect(results[0].index).toBe(1); // Second logo
      expect(results[1].index).toBe(2); // Third logo
    });
  });
}); 