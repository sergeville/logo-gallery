import mongoose from 'mongoose';

// Define types for the cached mongoose connection
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryDevelopmentDB';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Configure mongoose to use native promises
mongoose.Promise = global.Promise;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      console.log('Using existing database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      console.log('Creating new database connection');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    cached.conn = await cached.promise;
    console.log('Database connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 