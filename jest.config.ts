import type { Config } from '@jest/types'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
dir: './',
})

const config: Config.InitialOptions = {
preset: 'ts-jest',
testEnvironment: 'jsdom',
roots: ['<rootDir>'],
moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/app/contexts/$1',
    '^@/types/(.*)$': '<rootDir>/app/types/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^mongodb$': '<rootDir>/node_modules/mongodb',
    '^mongoose$': '<rootDir>/node_modules/mongoose'
},
setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
        jsc: {
            parser: {
                syntax: 'typescript',
                tsx: true,
            },
            transform: {
                react: {
                    runtime: 'automatic',
                },
            },
        },
    }],
},
transformIgnorePatterns: [
    '/node_modules/(?!(next|next-auth|@panva|jose|uuid|openid-client|preact|mongodb|mongoose|lodash-es)/)' 
],
moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
],
testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '/e2e/',
    '/playwright/'
],
testEnvironmentOptions: {
    url: 'http://localhost:3000'
},
collectCoverage: true,
collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
]
}

export default createJestConfig(config)
