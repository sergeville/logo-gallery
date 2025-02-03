# Database Testing Documentation

## Overview

This document describes the database testing infrastructure for the Logo Gallery application, including our seeding strategy for test data generation.

## Test Data Generation

### Seeding Strategy

The application uses a structured seeding approach with three main components:

1. **User Seeding** (`scripts/seed/users.ts`)

   - Generates test users with profiles
   - Supports both regular and admin users
   - Includes password hashing and profile generation

2. **Logo Seeding** (`scripts/seed/logos.ts`)
   - Creates test logos with metadata
   - Supports voting system
   - Maintains user relationships
   - Includes tag and style generation

### Usage Example

```typescript
import { seedUsers } from './scripts/seed/users';
import { seedLogos } from './scripts/seed/logos';

async function setupTestDatabase() {
  // Create test users
  const users = await seedUsers({
    count: 10,
    withProfiles: true,
    roles: ['user', 'admin'],
  });

  // Create test logos
  const logos = await seedLogos({
    count: 30,
    userIds: users.map(u => u._id),
    withVotes: true,
    perUser: 3,
  });

  return { users, logos };
}
```

## Test Database Helper

The test database helper provides utilities for managing test data:

### Connection Management

```typescript
import { testDbHelper } from './utils/test-db-helper';

// Connect to test database
await testDbHelper.connect();

// Perform operations...

// Disconnect when done
await testDbHelper.disconnect();
```

### Transaction Management

```typescript
// Start a transaction
await testDbHelper.startTransaction();

try {
  // Perform operations...
  await testDbHelper.commitTransaction();
} catch (error) {
  await testDbHelper.abortTransaction();
  throw error;
}
```

### Data Operations

```typescript
// Insert test data
const user = await testDbHelper.insertUser(userData);
const logo = await testDbHelper.insertLogo(logoData);

// Find data
const userLogos = await testDbHelper.findLogosByUserId(user._id);
```

## Best Practices

### 1. Test Data Generation

- Use seed scripts for consistent data
- Maintain referential integrity
- Include edge cases
- Use realistic data patterns

### 2. Test Isolation

```typescript
describe('Logo Tests', () => {
  let testUser;
  let testLogo;

  beforeEach(async () => {
    await testDbHelper.clearCollections();
    testUser = await createTestUser();
    testLogo = await createTestLogo(testUser._id);
  });

  afterEach(async () => {
    await testDbHelper.clearCollections();
  });
});
```

### 3. Error Handling

```typescript
try {
  await testDbHelper.connect();
  // Test operations...
} catch (error) {
  console.error('Test database error:', error);
  throw error;
} finally {
  await testDbHelper.disconnect();
}
```

## Configuration

### Environment Variables

```env
MONGODB_TEST_URI=mongodb://localhost:27017/LogoGalleryTest
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/scripts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

## Testing Strategy

### 1. Unit Tests

- Test individual database operations
- Verify data validation
- Check error handling
- Test helper functions

### 2. Integration Tests

- Test data relationships
- Verify cascading operations
- Test bulk operations
- Check constraints

### 3. Performance Tests

- Test with large datasets
- Verify bulk operation efficiency
- Check query performance
- Monitor memory usage

## Troubleshooting

### Common Issues

1. Connection Failures

   - Check MongoDB service
   - Verify connection string
   - Check network connectivity
   - Verify credentials

2. Data Generation Issues

   - Check seed script logs
   - Verify data integrity
   - Check for missing references
   - Monitor memory usage

3. Performance Issues
   - Use bulk operations
   - Implement proper indexes
   - Monitor query patterns
   - Clean up test data

## Maintenance

### Regular Tasks

1. Update seed scripts as schema changes
2. Review and update test data patterns
3. Monitor test database size
4. Clean up old test data

### Version Updates

1. Update MongoDB driver
2. Check TypeScript types
3. Update test utilities
4. Review seed scripts
