# Logo Gallery Application Standards

## Environment Standards

### 1. Environment Types

The application supports three distinct environments:

| Environment  | Purpose                    | Database Name               | Allowed to Run |
|-------------|----------------------------|----------------------------|----------------|
| Development | Local development work     | LogoGalleryDevelopmentDB  | ✅ Yes         |
| Test        | Testing and QA            | LogoGalleryTestDB         | ✅ Yes         |
| Production  | Production deployment      | LogoGalleryDB            | ❌ No          |

### 2. Environment Configuration

#### 2.1 Development Environment
- **NODE_ENV**: `development`
- **Database**: `LogoGalleryDevelopmentDB`
- **Purpose**: Daily development work
- **Features**: 
  - Full error logging
  - Development tools enabled
  - Detailed error messages

#### 2.2 Test Environment
- **NODE_ENV**: `test`
- **Database**: `LogoGalleryTestDB`
- **Purpose**: Running tests and QA
- **Features**:
  - Isolated test database
  - Test-specific configurations
  - Clean database between test runs

#### 2.3 Production Environment
- **NODE_ENV**: `production`
- **Database**: `LogoGalleryDB`
- **Status**: ⚠️ Not allowed to run
- **Reason**: Development instance only

### 3. Database Naming Convention

```typescript
const DB_NAMES = {
  development: 'LogoGalleryDevelopmentDB',
  test: 'LogoGalleryTestDB',
  production: 'LogoGalleryDB'
};
```

### 4. Environment Variables

Required environment variables per environment:

```bash
# Development (.env.development)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB

# Test (.env.test)
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/LogoGalleryTestDB
```

### 5. Verification Checks

The application performs the following checks on startup:

1. Environment Type Verification
   - Ensures not running in production
   - Validates NODE_ENV setting
   - Confirms development or test environment

2. Database Connection Verification
   - Validates database name matches environment
   - Confirms database connectivity
   - Checks MongoDB URI configuration

3. Environment-Specific Settings
   - Loads appropriate environment variables
   - Configures logging levels
   - Sets security parameters

### 6. Error Messages and Logging

Standard error messages for common issues:

```bash
# Wrong Environment
❌ ERROR: Production environment detected!
This application should not run in production environment.
Please use development or test environment only.

# Database Mismatch
❌ MongoDB URI database name mismatch!
Expected: LogoGalleryDevelopmentDB
Found in URI: wrong_database_name

# Connection Error
❌ Unable to connect to MongoDB!
Please check if MongoDB is running and accessible
```

### 7. Development Workflow

1. Always start in development environment:
   ```bash
   npm run dev
   ```

2. For running tests:
   ```bash
   npm test
   ```

3. Verify environment before starting work:
   ```bash
   # Check environment status
   curl http://localhost:3000/api/health-check
   ```

### 8. Security Standards

1. Environment Variables
   - Never commit `.env` files
   - Use `.env.example` as template
   - Keep sensitive data in `.env.local`

2. Database Access
   - Use separate databases for dev/test
   - Never connect to production database
   - Use appropriate access rights

### 9. Troubleshooting

If you encounter environment-related issues:

1. Check NODE_ENV setting
2. Verify MongoDB URI matches environment
3. Ensure correct database name
4. Check MongoDB connection
5. Review environment-specific logs

### 10. Script Environment Standards

#### Default Environment
- All scripts run in `development` environment by default
- Environment must be explicitly specified if different from default

#### Script Environment Requirements

| Category              | Environment  | Scripts                              |
|----------------------|--------------|--------------------------------------|
| Development Tools    | development  | dev, build, start, lint, format      |
| Database Tools       | development  | db:seed, db:migrate                  |
| Testing Tools        | test         | test, test:unit, test:e2e, test:visual |
| Validation Tools     | development  | validate, type-check                 |

#### Environment Validation Implementation

1. **Script Validation**
   ```typescript
   // Required in all scripts
   function validateScriptEnvironment(
     allowedEnv: 'development' | 'test',
     scriptName: string
   ) {
     const currentEnv = process.env.NODE_ENV || 'development';
     if (currentEnv !== allowedEnv) {
       throw new Error(
         `❌ ${scriptName} must run in ${allowedEnv} environment. ` +
         `Current environment: ${currentEnv}`
       );
     }
     console.log(`✅ Running ${scriptName} in ${currentEnv} environment`);
   }
   ```

2. **Usage in Scripts**
   ```typescript
   // Example usage in a database script
   validateScriptEnvironment('development', 'db:seed');
   
   // Example usage in a test script
   validateScriptEnvironment('test', 'test:e2e');
   ```

3. **Environment Variables**
   ```bash
   # Development scripts
   NODE_ENV=development
   
   # Test scripts
   NODE_ENV=test
   ```

#### Script Categories and Environments

1. **Development Scripts** (development environment)
   - Build tools
   - Development server
   - Code formatting
   - Database management
   - Type checking

2. **Test Scripts** (test environment)
   - Unit tests
   - Integration tests
   - E2E tests
   - Visual regression tests

3. **Validation Scripts** (development environment)
   - Linting
   - Type checking
   - Code formatting
   - Pre-commit hooks

#### Environment Switching

Scripts should include environment switching logic:
```typescript
// Example of environment switching in scripts
const runInEnvironment = async (
  env: 'development' | 'test',
  task: () => Promise<void>
) => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = env;
    await task();
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
};
```

## Maintenance

These standards should be reviewed and updated when:
- Adding new environments
- Changing database structure
- Updating security requirements
- Modifying deployment processes

Last updated: [Current Date] 