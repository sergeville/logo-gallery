import { jest } from '@jest/globals';
import { Db, MongoClient } from 'mongodb';

// Connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

// Mock database instance
const mockDb = {
  collection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    aggregate: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
  }),
} as unknown as Db;

// Mock client instance with connect tracking
const mockClient = {
  connect: jest.fn().mockImplementation(async () => {
    if (connectionError) throw connectionError;
    connectionState = ConnectionState.CONNECTED;
    return mockClient;
  }),
  db: jest.fn().mockReturnValue(mockDb),
  close: jest.fn().mockImplementation(async () => {
    connectionState = ConnectionState.DISCONNECTED;
    cachedClient = null;
    return true;
  }),
  isConnected: jest.fn().mockImplementation(() => connectionState === ConnectionState.CONNECTED),
} as unknown as MongoClient;

// Connection state management
let connectionState = ConnectionState.DISCONNECTED;
let cachedClient: MongoClient | null = null;
let connectionError: Error | null = null;

// Reset the mock state
export function __resetMockState() {
  connectionState = ConnectionState.DISCONNECTED;
  cachedClient = null;
  connectionError = null;
  jest.clearAllMocks();
}

// Set mock connection error
export function __setMockError(error: Error) {
  connectionError = error;
}

// Get current connection state
export function __getConnectionState() {
  return connectionState;
}

// Main connection function
export async function connectToDatabase() {
  try {
    // Simulate connection state changes
    connectionState = ConnectionState.CONNECTING;

    // If there's a forced error, throw it
    if (connectionError) {
      throw connectionError;
    }

    // Return cached client if exists
    if (cachedClient) {
      return { db: mockDb, client: cachedClient };
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create new connection
    await mockClient.connect();
    cachedClient = mockClient;

    return { db: mockDb, client: cachedClient };
  } catch (error) {
    connectionState = ConnectionState.DISCONNECTED;
    throw error;
  }
}

// Disconnect function
export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
  }
}

// Helper to simulate connection timeout
export async function __simulateConnectionTimeout() {
  connectionState = ConnectionState.CONNECTING;
  await new Promise(resolve => setTimeout(resolve, 5000));
  const error = new Error('Connection timeout');
  connectionError = error;
  connectionState = ConnectionState.DISCONNECTED;
  throw error;
}

// Helper to simulate connection drop
export async function __simulateConnectionDrop() {
  if (connectionState === ConnectionState.CONNECTED) {
    connectionState = ConnectionState.DISCONNECTED;
    cachedClient = null;
    const error = new Error('Connection lost');
    connectionError = error;
    throw error;
  }
}

// Export for testing
export const __mock = {
  db: mockDb,
  client: mockClient,
  resetState: __resetMockState,
  setState: (state: ConnectionState) => connectionState = state,
  setError: __setMockError,
  getState: __getConnectionState,
  simulateTimeout: __simulateConnectionTimeout,
  simulateConnectionDrop: __simulateConnectionDrop,
};

// For backward compatibility
export default connectToDatabase; 