export const TEST_CONFIG = {
  // Database settings
  database: {
    maxBatchSize: 100,
    collections: {
      users: 'users',
      logos: 'logos',
      comments: 'comments',
      collections: 'collections',
      favorites: 'favorites'
    },
    indexes: {
      users: ['email', 'username'],
      logos: ['userId', 'tags'],
      comments: ['logoId', 'userId'],
      collections: ['userId', 'logos'],
      favorites: ['userId', 'logoId']
    }
  },

  // Test data generation settings
  generation: {
    users: {
      minCount: 2,
      maxCount: 50,
      defaultPassword: 'testPassword123'
    },
    logos: {
      minCount: 5,
      maxCount: 100,
      minTags: 1,
      maxTags: 5
    },
    comments: {
      minCount: 0,
      maxCount: 20,
      maxDepth: 3
    },
    collections: {
      minCount: 0,
      maxCount: 10,
      maxLogosPerCollection: 50
    }
  },

  // Test environments
  environments: {
    ci: {
      mongoUri: 'mongodb://localhost:27017/LogoGalleryTestCI',
      logLevel: 'error',
      enableLogging: false
    },
    development: {
      mongoUri: 'mongodb://localhost:27017/LogoGalleryTestDev',
      logLevel: 'debug',
      enableLogging: true
    },
    staging: {
      mongoUri: 'mongodb://localhost:27017/LogoGalleryTestStaging',
      logLevel: 'info',
      enableLogging: true
    }
  },

  // Validation timeouts
  timeouts: {
    connection: 5000,
    operation: 2000,
    cleanup: 3000
  }
};

describe('Test Configuration', () => {
  it('has required environment variables', () => {
    expect(process.env.MONGODB_URI || process.env.MONGODB_TEST_URI).toBeDefined();
  });
}); 