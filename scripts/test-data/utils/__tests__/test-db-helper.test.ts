import { TestDbHelper } from '../test-db-helper';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

describe('Test Database Helper', () => {
  let testDbHelper: TestDbHelper;
  const mockClient = {
    db: jest.fn(),
    close: jest.fn(),
    startSession: jest.fn(),
  };
  const mockDb = {
    collection: jest.fn(),
  };
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
    createIndex: jest.fn(),
  };
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MongoClient.connect as jest.Mock).mockResolvedValue(mockClient);
    mockClient.db.mockReturnValue(mockDb);
    mockDb.collection.mockReturnValue(mockCollection);
    mockClient.startSession.mockReturnValue(mockSession);
    testDbHelper = new TestDbHelper('mongodb://localhost:27017/test');
  });

  describe('Connection Management', () => {
    it('connects to database', async () => {
      await testDbHelper.connect();
      expect(MongoClient.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    });

    it('disconnects from database', async () => {
      await testDbHelper.connect();
      await testDbHelper.disconnect();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });

  describe('User Operations', () => {
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    };

    it('inserts a user', async () => {
      const insertedId = 'mockId123';
      mockCollection.insertOne.mockResolvedValue({ insertedId });

      const insertedUser = await testDbHelper.insertUser(testUser);
      expect(insertedUser).toEqual({ ...testUser, _id: insertedId });
    });

    it('updates a user', async () => {
      const update = { name: 'Updated Name' };
      const updatedUser = { ...testUser, ...update };
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser });

      const result = await testDbHelper.updateUser('123', update);
      expect(result).toEqual(updatedUser);
    });

    it('finds a user', async () => {
      mockCollection.findOne.mockResolvedValue(testUser);

      const foundUser = await testDbHelper.findUser({ email: testUser.email });
      expect(foundUser).toEqual(testUser);
    });
  });

  describe('Transaction Operations', () => {
    it('starts transaction', async () => {
      await testDbHelper.startTransaction();
      expect(mockClient.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
    });

    it('commits transaction', async () => {
      await testDbHelper.startTransaction();
      await testDbHelper.commitTransaction();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('rolls back transaction', async () => {
      await testDbHelper.startTransaction();
      await testDbHelper.rollbackTransaction();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('Collection Operations', () => {
    it('clears collection', async () => {
      await testDbHelper.clearCollection('users');
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({}, { session: undefined });
    });

    it('creates indexes', async () => {
      await testDbHelper.createIndexes();
      expect(mockCollection.createIndex).toHaveBeenCalledWith({ email: 1 }, { unique: true });
    });
  });
}); 