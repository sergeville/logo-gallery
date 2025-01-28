import { MongoClient } from 'mongodb';
import TestDbHelper from '../../test-data/utils/test-db-helper';

describe('Test Database Helper', () => {
  let testDbHelper: TestDbHelper;

  beforeAll(async () => {
    testDbHelper = new TestDbHelper();
  });

  beforeEach(async () => {
    await testDbHelper.connect();
    await testDbHelper.clearCollections(['users', 'logos']);
  });

  afterEach(async () => {
    await testDbHelper.disconnect();
  });

  it('connects to database', async () => {
    expect(await testDbHelper.isConnected()).toBe(true);
  });

  it('disconnects from database', async () => {
    await testDbHelper.disconnect();
    expect(await testDbHelper.isConnected()).toBe(false);
  });

  it('gets collection', async () => {
    const collection = testDbHelper.getCollection('test');
    expect(collection).toBeDefined();
  });

  it('clears collection', async () => {
    const collection = testDbHelper.getCollection('test');
    await collection.insertOne({ test: 'data' });
    await testDbHelper.clearCollection('test');
    const count = await collection.countDocuments();
    expect(count).toBe(0);
  });

  it('clears multiple collections', async () => {
    const collections = ['test1', 'test2'];
    for (const name of collections) {
      const collection = testDbHelper.getCollection(name);
      await collection.insertOne({ test: 'data' });
    }
    await testDbHelper.clearCollections(collections);
    for (const name of collections) {
      const collection = testDbHelper.getCollection(name);
      const count = await collection.countDocuments();
      expect(count).toBe(0);
    }
  });

  it('inserts user', async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    const id = await testDbHelper.insertUser(user);
    expect(id).toBeDefined();
    const collection = testDbHelper.getCollection('users');
    const insertedUser = await collection.findOne({ _id: id });
    expect(insertedUser).toBeDefined();
  });

  it('inserts logo', async () => {
    const logo = {
      name: 'Test Logo',
      url: 'https://example.com/logo.png',
      description: 'A test logo',
      userId: 'test-user-id'
    };
    const id = await testDbHelper.insertLogo(logo);
    expect(id).toBeDefined();
    const collection = testDbHelper.getCollection('logos');
    const insertedLogo = await collection.findOne({ _id: id });
    expect(insertedLogo).toBeDefined();
  });

  it('throws error when accessing collection without connection', async () => {
    await testDbHelper.disconnect();
    expect(() => testDbHelper.getCollection('test')).toThrow('Database not connected');
  });

  it('validates collections array in clearCollections', async () => {
    await expect(testDbHelper.clearCollections([])).resolves.not.toThrow();
  });
}); 