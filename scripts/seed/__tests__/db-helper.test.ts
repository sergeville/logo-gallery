import { MongoClient, ObjectId } from 'mongodb';
import { TestDbHelper } from '../../test-data/utils/test-db-helper';
import { jest } from '@jest/globals';

jest.mock('mongodb');

describe('Test Database Helper', () => {
  let testDbHelper: TestDbHelper;

  beforeEach(() => {
    testDbHelper = new TestDbHelper();
  });

  afterEach(async () => {
    await testDbHelper.disconnect();
    await testDbHelper.clearCollections(['users', 'logos']);
  });

  it('connects to database', async () => {
    await testDbHelper.connect();
    expect(MongoClient.connect).toHaveBeenCalledWith(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test');
  });

  it('disconnects from database', async () => {
    await testDbHelper.connect();
    await testDbHelper.disconnect();
    expect(await testDbHelper.isConnected()).toBe(false);
    expect(await testDbHelper.getDb()).toBeNull();
  });

  it('gets collection', async () => {
    await testDbHelper.connect();
    const collection = testDbHelper.getCollection('test');
    expect(collection).toBeDefined();
  });

  it('clears collection', async () => {
    await testDbHelper.connect();
    await testDbHelper.clearCollection('test');
    const collection = testDbHelper.getCollection('test');
    expect(collection.deleteMany).toHaveBeenCalledWith({});
  });

  it('clears multiple collections', async () => {
    await testDbHelper.connect();
    const collections = ['users', 'logos'];
    await testDbHelper.clearCollections(collections);
    collections.forEach(name => {
      const collection = testDbHelper.getCollection(name);
      expect(collection.deleteMany).toHaveBeenCalledWith({});
    });
  });

  it('inserts user', async () => {
    await testDbHelper.connect();
    const user = {
      _id: new ObjectId(),
      name: 'Test User',
      email: 'test@example.com'
    };
    const result = await testDbHelper.insertUser(user);
    expect(result).toEqual(user._id.toString());
  });

  it('inserts logo', async () => {
    await testDbHelper.connect();
    const logo = {
      _id: new ObjectId(),
      name: 'Test Logo',
      url: 'http://example.com/logo.png',
      userId: new ObjectId()
    };
    const result = await testDbHelper.insertLogo(logo);
    expect(result).toEqual(logo._id.toString());
  });

  it('throws error when accessing collection without connection', () => {
    expect(() => testDbHelper.getCollection('test')).toThrow('Database not connected');
  });

  it('validates collections array in clearCollections', async () => {
    await testDbHelper.connect();
    await expect(testDbHelper.clearCollections(['test'])).resolves.not.toThrow();
  });
}); 