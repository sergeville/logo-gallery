import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/app/contexts/$1',
    '^@/types/(.*)$': '<rootDir>/app/types/$1',
    '^mongodb$': '<rootDir>/node_modules/mongodb'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '@swc/jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(next|next-auth|@panva|jose|uuid|openid-client|preact|mongodb)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/playwright/'
  ],
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
}

export default config 