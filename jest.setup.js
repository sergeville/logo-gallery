// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => null),
}))

// Mock MongoDB client
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn(() => Promise.resolve({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
      })),
    })),
  })),
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000' 