const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module name mapper with organized sections
  moduleNameMapper: {
    // Internal path aliases - keep these first for clarity
    // Handle multiple base paths for @/ imports
    '^@/app/api/(.*)$': '<rootDir>/app/api/$1',
    '^@/api/(.*)$': '<rootDir>/app/api/$1',
    '^@/app/(.*)$': [
      '<rootDir>/app/$1',
      '<rootDir>/src/app/$1'
    ],
    '^@/lib/(.*)$': [
      '<rootDir>/app/lib/$1',
      '<rootDir>/src/lib/$1'
    ],
    '^@/components/(.*)$': [
      '<rootDir>/app/components/$1',
      '<rootDir>/src/components/$1'
    ],
    '^@/hooks/(.*)$': [
      '<rootDir>/app/hooks/$1',
      '<rootDir>/src/hooks/$1'
    ],
    '^@/contexts/(.*)$': [
      '<rootDir>/app/contexts/$1',
      '<rootDir>/src/contexts/$1'
    ],
    '^@/config/(.*)$': [
      '<rootDir>/app/config/$1',
      '<rootDir>/src/config/$1'
    ],
    // Generic @/ alias should come last to allow more specific matches first
    '^@/(.*)$': '<rootDir>/$1',

    // Testing library and related packages
    '^@testing-library/react$': require.resolve('@testing-library/react'),
    '^@testing-library/dom$': require.resolve('@testing-library/dom'),

    // ESM packages that need CommonJS transformation
    '^lodash-es$': 'lodash',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lucide-react$': '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js',
    '^lucide-react/(.*)$': '<rootDir>/node_modules/lucide-react/dist/cjs/$1',

    // Asset mocks
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { 
          strict: true,
          allowTopLevelThis: true
        }],
        ['@babel/plugin-transform-runtime', { 
          regenerator: true,
          helpers: true,
          useESModules: false
        }]
      ]
    }]
  },

  // Transform ignore patterns - keep ESM modules that need transformation
  transformIgnorePatterns: [
    'node_modules/(?!(' + [
      'lodash-es',
      'lucide-react',
      '@testing-library/react',
      '@testing-library/dom',
      '@babel/runtime'
    ].join('|') + ')/)'
  ],

  // Test patterns and coverage
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/playwright/',
    '<rootDir>/e2e/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/visual/',
    '<rootDir>/app/__integration_tests__/'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],

  // File extensions and module directories
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Environment and timeout settings
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  testTimeout: 30000,

  // TypeScript and ESM settings
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json', // Use Jest-specific tsconfig
      useESM: true
    }
  },

  // Custom resolver for better ESM support
  resolver: '<rootDir>/jest.resolver.js'
};

module.exports = createJestConfig(customJestConfig); 