import mongoose from 'mongoose';

// Define types for the cached mongoose connection
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; } | undefined;
}

// Define connection states
const CONNECTION_STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
  invalid: 4,
} as const;

type ConnectionState = typeof CONNECTION_STATES[keyof typeof CONNECTION_STATES];

if (!process.env.MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

const MONGODB_URI: string = process.env.MONGODB_URI;

// Configure mongoose to use native promises
mongoose.Promise = global.Promise;

let cached = (global.mongoose as MongooseCache) || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Log connection state for debugging
  const connectionState = mongoose.connection.readyState as ConnectionState;
  const stateName = Object.entries(CONNECTION_STATES).find(([_, value]) => value === connectionState)?.[0] || 'unknown';
  
  console.log('Current MongoDB connection state:', {
    state: connectionState,
    stateName
  });

  if (cached.conn) {
    if (connectionState === CONNECTION_STATES.connected) {
      console.log('Using cached database connection');
      return cached.conn;
    } else {
      console.log('Cached connection exists but not connected, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true
    };

    mongoose.set('strictQuery', true);

    try {
      console.log('Attempting to connect to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        return mongoose;
      });

      // Handle connection events
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established successfully');
      });

      mongoose.connection.on('error', (err: Error) => {
        console.error('MongoDB connection error:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        cached.promise = null;
        cached.conn = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB connection disconnected, clearing cache');
        cached.promise = null;
        cached.conn = null;
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        if (mongoose.connection.readyState === CONNECTION_STATES.connected) {
          console.log('Closing MongoDB connection due to application termination');
          await mongoose.connection.close();
        }
        process.exit(0);
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error during MongoDB connection setup:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      cached.promise = null;
      throw error;
    }
  }

  try {
    console.log('Waiting for MongoDB connection to complete...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection completed successfully');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error while awaiting MongoDB connection:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect; 