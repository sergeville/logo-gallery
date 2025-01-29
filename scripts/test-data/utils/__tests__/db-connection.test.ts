import { TestDbHelper } from '@/scripts/test-data/utils/test-db-helper';

describe('Database Connection', () => {
  let testDbHelper: TestDbHelper;
  const validTestUri = 'mongodb://localhost:27017/LogoGalleryTest';
  const invalidTestUri = 'invalid-uri';

  beforeEach(() => {
    process.env.MONGODB_TEST_URI = validTestUri;
    testDbHelper = new TestDbHelper();
  });

  afterEach(async () => {
    await testDbHelper.disconnect();
    delete process.env.MONGODB_TEST_URI;
  });

  it('should connect successfully with valid URI', async () => {
    testDbHelper = new TestDbHelper(validTestUri);
    
    // Attempt to connect
    await expect(testDbHelper.connect()).resolves.not.toThrow();
    
    // Verify we can perform a basic operation
    const usersCollection = testDbHelper.getCollection('users');
    await expect(usersCollection.countDocuments()).resolves.not.toThrow();
  });

  it('should fail to connect with invalid URI', async () => {
    testDbHelper = new TestDbHelper(invalidTestUri);
    
    // Attempt to connect should fail with connection error
    await expect(testDbHelper.connect()).rejects.toThrow();
  }, 7000); // Set timeout slightly higher than the connection timeout

  it('should handle multiple connect calls gracefully', async () => {
    testDbHelper = new TestDbHelper(validTestUri);
    
    // First connection should succeed
    await expect(testDbHelper.connect()).resolves.not.toThrow();
    
    // Second connection should not throw (should be handled gracefully)
    await expect(testDbHelper.connect()).resolves.not.toThrow();
  });

  it('should disconnect successfully', async () => {
    testDbHelper = new TestDbHelper(validTestUri);
    await testDbHelper.connect();
    
    // Attempt to disconnect
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
    
    // Verify connection is closed by attempting an operation
    const usersCollection = testDbHelper.getCollection('users');
    await expect(usersCollection.countDocuments()).rejects.toThrow();
  });

  it('should handle multiple disconnect calls gracefully', async () => {
    testDbHelper = new TestDbHelper(validTestUri);
    await testDbHelper.connect();
    
    // First disconnect should succeed
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
    
    // Second disconnect should not throw
    await expect(testDbHelper.disconnect()).resolves.not.toThrow();
  });

  it('should maintain connection across multiple operations', async () => {
    testDbHelper = new TestDbHelper(validTestUri);
    await testDbHelper.connect();
    
    const usersCollection = testDbHelper.getCollection('users');
    
    // Perform multiple operations
    await expect(usersCollection.insertOne({ test: true })).resolves.not.toThrow();
    await expect(usersCollection.findOne({ test: true })).resolves.not.toBeNull();
    await expect(usersCollection.deleteOne({ test: true })).resolves.not.toThrow();
  });

  it('should handle connection errors gracefully', async () => {
    // Test with invalid URI
    process.env.MONGODB_TEST_URI = invalidTestUri;
    testDbHelper = new TestDbHelper();
    
    // Should throw with invalid URI format
    await expect(testDbHelper.connect()).rejects.toThrow();
    
    // Test with valid URI after failure
    process.env.MONGODB_TEST_URI = validTestUri;
    testDbHelper = new TestDbHelper();
    await expect(testDbHelper.connect()).resolves.not.toThrow();
  });
}); 