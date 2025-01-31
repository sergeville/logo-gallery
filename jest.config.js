const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: '<rootDir>/jest.environment.js',
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
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Add missing module name mappers
    '^@testing-library/user-event$': require.resolve('@testing-library/user-event'),
    '^@/app/lib/test/(.*)$': '<rootDir>/app/lib/test/$1',
    '^@/scripts/test-data/utils/(.*)$': '<rootDir>/scripts/test-data/utils/$1'
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

  // Transform ignore patterns
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

  // Environment and timeout settings
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: [''],
  },
  testTimeout: 30000,

  // TypeScript and ESM settings
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      useESM: true
    },
    // Add Jest globals
    jest: true,
    expect: true,
    test: true,
    describe: true,
    beforeEach: true,
    afterEach: true
  },

  // Custom resolver for better ESM support
  resolver: '<rootDir>/jest.resolver.js',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
    '/dist/',
    '/.storybook/',
    '/stories/',
    '/test/',
    '/tests/',
    '/e2e/',
    '/playwright/',
    '/cypress/'
  ],

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
    '/dist/',
    '/.storybook/',
    '/stories/',
    '/test/',
    '/tests/',
    '/e2e/',
    '/playwright/',
    '/cypress/'
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true
};

module.exports = createJestConfig(customJestConfig); 