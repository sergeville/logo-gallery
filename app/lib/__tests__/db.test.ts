import { jest } from '@jest/globals';
import {
  connectToDatabase,
  disconnectFromDatabase,
  ConnectionState,
  __mock,
  __resetMockState,
} from '../__mocks__/db';

jest.mock('../db');

describe('Database Connection', () => {
  beforeEach(() => {
    __resetMockState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect to database successfully', async () => {
      const { db, client } = await connectToDatabase();
      
      expect(db).toBeDefined();
      expect(client).toBeDefined();
      expect(__mock.getState()).toBe(ConnectionState.CONNECTED);
    });

    it('should reuse existing connection', async () => {
      const firstConnection = await connectToDatabase();
      const secondConnection = await connectToDatabase();
      
      // Check that both connections reference the same client
      expect(firstConnection.client).toBe(secondConnection.client);
      // Verify the connection was only created once
      expect(__mock.client.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      __mock.setError(mockError);

      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
    });

    it('should disconnect successfully', async () => {
      await connectToDatabase();
      await disconnectFromDatabase();
      
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe('Connection States', () => {
    it('should track connection states correctly', async () => {
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
      
      const connectPromise = connectToDatabase();
      expect(__mock.getState()).toBe(ConnectionState.CONNECTING);
      
      await connectPromise;
      expect(__mock.getState()).toBe(ConnectionState.CONNECTED);
      
      await disconnectFromDatabase();
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle connection timeout', async () => {
      await expect(__mock.simulateTimeout()).rejects.toThrow('Connection timeout');
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
    });

    it('should handle connection drops', async () => {
      await connectToDatabase();
      await expect(__mock.simulateConnectionDrop()).rejects.toThrow('Connection lost');
      expect(__mock.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe('Database Operations', () => {
    it('should mock database operations', async () => {
      const { db } = await connectToDatabase();
      
      // Test collection operations
      const collection = db.collection('test');
      await collection.insertOne({ test: true });
      await collection.findOne({ test: true });
      await collection.updateOne({ test: true }, { $set: { updated: true } });
      await collection.deleteOne({ test: true });
      
      expect(db.collection).toHaveBeenCalledWith('test');
    });
  });
}); 