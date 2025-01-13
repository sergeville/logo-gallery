# Configuration Guide

## Overview
The Logo Gallery application uses a modular configuration system with separate settings for each environment:
- Development (`config/dev/`)
- Testing (`config/test/`)
- Production (`config/prod/`)

## Configuration Structure

```
config/
├── index.ts                # Main configuration entry point
├── dev/                    # Development environment
│   ├── index.ts           # Development config aggregator
│   ├── database.ts        # Database settings
│   ├── storage.ts         # Storage settings
│   └── api.ts             # API settings
├── test/                   # Test environment
│   ├── index.ts           # Test config aggregator
│   ├── database.ts        # Test database settings
│   ├── storage.ts         # Test storage settings
│   └── testing.ts         # Test-specific settings
└── prod/                   # Production environment
    ├── index.ts           # Production config aggregator
    ├── database.ts        # Production database settings
    ├── storage.ts         # Production storage settings
    └── security.ts        # Production security settings
```

## Environment-Specific Configurations

### Development Environment
Located in `config/dev/`:
```typescript
// database.ts
export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryDevelopmentDB',
  dbName: 'LogoGalleryDevelopmentDB',
  options: {
    retryWrites: true,
    w: 'majority',
  }
};

// storage.ts
export const storageConfig = {
  uploadDir: 'uploads/development',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
};
```

### Test Environment
Located in `config/test/`:
```typescript
// database.ts
export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB',
  dbName: 'LogoGalleryTestDB',
  options: {
    retryWrites: true,
    w: 'majority',
  }
};

// testing.ts
export const testingConfig = {
  cleanupAfterEach: true,
  seedDataPath: 'test/seed-data',
  defaultTimeout: 5000
};
```

### Production Environment
Located in `config/prod/`:
```typescript
// database.ts
export const databaseConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'LogoGalleryProductionDB',
  options: {
    ssl: true,
    authSource: 'admin',
    maxPoolSize: 50
  }
};

// security.ts
export const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true
  }
};
```

## Usage

### Accessing Configuration
```typescript
import { getConfig } from '../config';

// Get configuration for current environment
const config = getConfig();

// Access database configuration
const db = await MongoClient.connect(config.mongodb.uri, config.mongodb.options);
```

### Environment Variables
Each environment has its own `.env` file:

1. Development (`.env.development`):
```env
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
NODE_ENV=development
```

2. Testing (`.env.test`):
```env
MONGODB_URI=mongodb://localhost:27017/LogoGalleryTestDB
NODE_ENV=test
```

3. Production (`.env.production`):
```env
MONGODB_URI=mongodb://your-production-uri/LogoGalleryProductionDB
NODE_ENV=production
```

## Best Practices

1. **Configuration Management**
   - Keep sensitive data in environment variables
   - Use type-safe configuration objects
   - Maintain separate configurations per environment
   - Document all configuration options

2. **Environment Isolation**
   - Never mix configurations between environments
   - Use environment-specific settings
   - Keep production credentials secure
   - Test with environment-specific data

3. **Development Workflow**
   - Use development config for local work
   - Use test config for automated testing
   - Never use production config locally
   - Keep environment files in version control

4. **Security**
   - Never commit real credentials
   - Use templates for sensitive files
   - Maintain separate secrets per environment
   - Document security requirements

## Adding New Configuration

1. Create configuration file in appropriate environment directory:
```typescript
// config/dev/newfeature.ts
export const newFeatureConfig = {
  // ... configuration options
};
```

2. Import and add to environment index:
```typescript
// config/dev/index.ts
import { newFeatureConfig } from './newfeature';

export const developmentConfig = {
  // ... existing config
  newFeature: newFeatureConfig
};
```

3. Update types if necessary:
```typescript
// config/types.ts
export interface NewFeatureConfig {
  // ... type definitions
}
```

## Troubleshooting

1. **Configuration Loading**
   - Verify correct environment is set
   - Check .env file exists and is loaded
   - Validate configuration structure

2. **Environment Issues**
   - Confirm NODE_ENV is set correctly
   - Verify environment-specific settings
   - Check file permissions

3. **Type Errors**
   - Ensure all configs match interface
   - Check for missing properties
   - Validate configuration values 