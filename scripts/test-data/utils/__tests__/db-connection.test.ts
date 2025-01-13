import { MongoClient } from 'mongodb';
import { TestDbHelper } from '../test-db-helper';
import { generateTestUser } from '../test-data-generator';

describe('Database Connection', () => {
  let testDbHelper: TestDbHelper;

  beforeEach(() => {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    testDbHelper = new TestDbHelper(null as any); // We'll connect in each test
  });

  afterEach(async () => {
    // Ensure we disconnect after each test
    await testDbHelper.disconnect();
  });

  it('should connect successfully with valid URI', async () => {
    // Set valid URI
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    
    // Attempt to connect
    await expect(testDbHelper.connect()).resolves.not.toThrow();
    
    // Verify we can perform a basic operation
    const usersCollection = testDbHelper.getCollection<{ [key: string]: any }>('users');
    expect(usersCollection).toBeDefined();
  }, 7000); // Set timeout slightly higher than the connection timeout

  it('should fail to connect with invalid URI', async () => {
    // Set invalid URI
    process.env.MONGODB_TEST_URI = 'mongodb://nonexistent:27017/LogoGalleryTest';
    
    // Attempt to connect should fail with connection error
    await expect(testDbHelper.connect()).rejects.toThrow(/getaddrinfo ENOTFOUND/);
  }, 7000); // Set timeout slightly higher than the connection timeout

  it('should handle multiple connect calls gracefully', async () => {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    
    // First connection should succeed
    await expect(testDbHelper.connect()).resolves.not.toThrow();
    
    // Second connection should not throw (should be handled gracefully)
    await expect(testDbHelper.connect()).resolves.not.toThrow();
  });

  it('should disconnect successfully', async () => {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    
    // Connect first
    await testDbHelper.connect();
    
    // Disconnect should succeed
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
  });

  it('should handle multiple disconnect calls gracefully', async () => {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    
    // Connect first
    await testDbHelper.connect();
    
    // First disconnect
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
    
    // Second disconnect should not throw
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
  });

  it('should maintain connection across multiple operations', async () => {
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    
    await testDbHelper.connect();
    
    // Perform multiple operations
    const usersCollection = testDbHelper.getCollection<{ [key: string]: any }>('users');
    const testUser = generateTestUser();
    
    await usersCollection.insertOne(testUser);
    const foundUser = await usersCollection.findOne({ email: testUser.email });
    
    expect(foundUser).toMatchObject(testUser);
  });

  it('should handle connection errors gracefully', async () => {
    // Test with invalid URI format
    process.env.MONGODB_TEST_URI = 'invalid-uri';
    
    // Should throw with invalid URI format
    await expect(testDbHelper.connect()).rejects.toThrow('Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"');
    
    // Test with valid URI after failure
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/LogoGalleryTest';
    await expect(testDbHelper.connect()).resolves.not.toThrow();
  });
}); 