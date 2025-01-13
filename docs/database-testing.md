# Database Testing Documentation

## Overview
This document describes the database testing infrastructure for the Logo Gallery application. The testing setup uses MongoDB and provides utilities for managing test data, connections, and common database operations.

## Test Database Helper

The test database helper (`test-db-helper.ts`) provides a comprehensive set of utilities for interacting with the test database. It includes:

### Connection Management
- Connection establishment with configurable timeouts
- Automatic index creation on connection
- Connection pooling and reuse
- Graceful disconnection handling
- Error handling and cleanup

### Data Operations
- CRUD operations for users and logos
- Bulk operations support
- Transaction management
- Collection management
- Query utilities

### Configuration
- Environment-based configuration via `MONGODB_TEST_URI`
- Default connection to `mongodb://localhost:27017/LogoGalleryTest`
- Configurable timeouts (default: 5 seconds)
- Automatic index management

## Usage

### Basic Connection
```typescript
import { testDbHelper } from './utils/test-db-helper';

// Connect to the test database
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
// Insert a user
const user = await testDbHelper.insertUser({
  email: 'test@example.com',
  username: 'testuser',
  // ...
});

// Insert a logo
const logo = await testDbHelper.insertLogo({
  name: 'Test Logo',
  ownerId: user._id,
  // ...
});

// Find logos by owner
const userLogos = await testDbHelper.findLogosByOwnerId(user._id);
```

## Test Setup

### Environment Variables
- `MONGODB_TEST_URI`: MongoDB connection string for tests
  - Default: `mongodb://localhost:27017/LogoGalleryTest`
  - Format: `mongodb://[username:password@]host[:port]/database`

### Database Indexes
The following indexes are automatically created:
- Users:
  - `email`: Unique index
  - `username`: Unique index
- Logos:
  - `name, ownerId`: Compound unique index
  - `category`: Index for category queries
  - `tags`: Index for tag queries

## Best Practices

### Connection Management
1. Always use `try/finally` blocks to ensure proper cleanup:
```typescript
try {
  await testDbHelper.connect();
  // Test operations...
} finally {
  await testDbHelper.disconnect();
}
```

2. Clear collections between tests:
```typescript
beforeEach(async () => {
  await testDbHelper.clearCollections();
});
```

### Data Generation
1. Use the provided helper functions:
```typescript
const testUser = generateTestUser({
  role: 'admin' // Override specific fields
});

const testLogo = generateTestLogo(userId, {
  category: 'Technology' // Override specific fields
});
```

2. Use transactions for related operations:
```typescript
await testDbHelper.startTransaction();
try {
  const user = await testDbHelper.insertUser(userData);
  const logo = await testDbHelper.insertLogo({ ...logoData, ownerId: user._id });
  await testDbHelper.commitTransaction();
} catch (error) {
  await testDbHelper.abortTransaction();
  throw error;
}
```

## Error Handling

### Connection Errors
The helper handles various connection scenarios:
- Invalid URI format
- Network connectivity issues
- Authentication failures
- Timeout issues

### Operation Errors
All database operations include:
- Type checking
- Connection state validation
- Error wrapping with context
- Automatic cleanup on failure

## Testing Strategy

### Unit Tests
- Test individual database operations
- Verify error handling
- Check data validation
- Test connection management

### Integration Tests
- Test transaction management
- Verify data relationships
- Test bulk operations
- Check index constraints

## Performance Considerations

### Connection Pooling
- Connections are reused when possible
- Pool size is configurable
- Idle connections are cleaned up

### Timeouts
- Connection timeout: 5 seconds
- Server selection timeout: 5 seconds
- Operation timeout: Configurable per operation

### Batch Operations
- Use bulk operations for multiple inserts/updates
- Use streams for large data sets
- Implement pagination where appropriate

## Troubleshooting

### Common Issues
1. Connection Failures
   - Check MongoDB service is running
   - Verify connection string
   - Check network connectivity
   - Verify authentication credentials

2. Timeout Errors
   - Increase timeout settings
   - Check database load
   - Verify network latency

3. Index Errors
   - Check unique constraint violations
   - Verify index definitions
   - Check data consistency

### Debugging
1. Enable MongoDB logging:
```typescript
const client = new MongoClient(uri, {
  logger: console,
  logLevel: 'debug'
});
```

2. Check connection status:
```typescript
const isConnected = client.isConnected();
console.log('Connection status:', isConnected);
```

## Maintenance

### Regular Tasks
1. Update index definitions as schema changes
2. Review and update timeout settings
3. Update test data generators
4. Review and clean up test data

### Version Updates
1. Check MongoDB driver compatibility
2. Update connection options
3. Test with new MongoDB versions
4. Update documentation 