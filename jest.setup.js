// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
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
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => null),
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock chalk to prevent ESM issues
jest.mock('chalk', () => ({
  red: jest.fn(str => str),
  green: jest.fn(str => str),
  yellow: jest.fn(str => str),
  blue: jest.fn(str => str),
  bold: jest.fn(str => str),
}));

// Set test timeout
jest.setTimeout(10000);

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
