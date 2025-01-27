import { TestDbHelper } from '../test-db-helper';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

describe('TestDbHelper', () => {
  let testDbHelper: TestDbHelper;

  beforeEach(() => {
    testDbHelper = new TestDbHelper();
  });

  afterEach(async () => {
    await testDbHelper.disconnect();
  });

  it('connects to database', async () => {
    await testDbHelper.connect();
    expect(testDbHelper.isConnected).toBe(true);
  });

  it('disconnects from database', async () => {
    await testDbHelper.connect();
    await testDbHelper.disconnect();
    expect(testDbHelper.isConnected).toBe(false);
  });

  it('gets collection', async () => {
    await testDbHelper.connect();
    const collection = testDbHelper.collection('users');
    expect(collection).toBeDefined();
  });

  it('throws error when not connected', async () => {
    await testDbHelper.disconnect();
    expect(testDbHelper.isConnected).toBe(false);
    expect(() => testDbHelper.collection('users')).toThrow('Database not connected');
  });
}); 