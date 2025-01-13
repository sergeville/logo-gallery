import mongoose from 'mongoose';
import { getConfig } from '../../config/environments';

interface GlobalWithMongoose extends Global {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | null;
}

declare const global: GlobalWithMongoose;

class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

const config = getConfig();
const MONGODB_URI = config.mongodb.uri;

if (!MONGODB_URI) {
  throw new DatabaseConnectionError(
    'Please define the MONGODB_URI environment variable inside your environment file'
  );
}

// Validate MongoDB URI format
const MONGODB_URI_REGEX = /^mongodb(\+srv)?:\/\/.+/;
if (!MONGODB_URI_REGEX.test(MONGODB_URI)) {
  throw new DatabaseConnectionError(
    'Invalid MONGODB_URI format. URI must start with mongodb:// or mongodb+srv://'
  );
}

export { MONGODB_URI };

const mongoUri: string = MONGODB_URI;

const cached = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function handleConnectionError(error: unknown): Promise<never> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  throw new DatabaseConnectionError(`Failed to connect to MongoDB: ${errorMessage}`);
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongooseOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose
      .connect(mongoUri, mongooseOptions)
      .catch(handleConnectionError);
  }

  try {
    const conn = await cached.promise;
    
    // Add connection event handlers
    conn.connection.on('error', (error: Error) => {
      console.error('MongoDB connection error:', error);
    });

    conn.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    conn.connection.on('reconnected', () => {
      console.info('MongoDB reconnected successfully');
    });

    cached.conn = conn;
    return conn;
  } catch (error) {
    cached.promise = null;
    return handleConnectionError(error);
  }
}