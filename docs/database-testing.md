# Database Testing Documentation

## Overview

The database testing system provides a comprehensive suite of tools and utilities for testing MongoDB operations in a type-safe manner.

## Components

### TestDbHelper

The `TestDbHelper` class provides a type-safe interface for database operations in tests:

```typescript
class TestDbHelper {
  constructor();
  async connect(): Promise<void>;
  async disconnect(): Promise<void>;
  async insertUser(userData: Partial<ClientUser>): Promise<string>;
  async insertLogo(logoData: Partial<ClientLogo>): Promise<string>;
  async findUser(query: Partial<ClientUser>): Promise<ClientUser | null>;
  async findLogo(query: Partial<ClientLogo>): Promise<ClientLogo | null>;
  async clearCollection(name: string): Promise<void>;
  async clearAllCollections(): Promise<void>;
  isConnected(): boolean;
}
```

### MongoDB Mock

The MongoDB mock system provides in-memory database operations for testing:

```typescript
class MockCollection<T extends Document> {
  async insertOne(doc: T): Promise<{ insertedId: string }>;
  async findOne(query: Partial<T>): Promise<T | null>;
  async find(query?: Partial<T>): Promise<T[]>;
  async updateOne(query: Partial<T>, update: { $set: Partial<T> }): Promise<{ modifiedCount: number }>;
  async deleteOne(query: Partial<T>): Promise<{ deletedCount: number }>;
  async deleteMany(query?: Partial<T>): Promise<{ deletedCount: number }>;
  async countDocuments(query?: Partial<T>): Promise<number>;
}
```

## Test Configuration

### Environment Variables
```typescript
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
```

### Test Database Config
```typescript
const testConfig = {
  mongodb: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017',
    dbName: 'LogoGalleryTestDB',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  }
};
```

## Usage Examples

### Basic Test Setup
```typescript
describe('Database Tests', () => {
  let testDb: TestDbHelper;

  beforeAll(async () => {
    testDb = new TestDbHelper();
    await testDb.connect();
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  beforeEach(async () => {
    await testDb.clearAllCollections();
  });

  it('should insert and retrieve a user', async () => {
    const userData = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User'
    };

    const userId = await testDb.insertUser(userData);
    const user = await testDb.findUser({ id: userId });
    expect(user).toBeTruthy();
    expect(user?.email).toBe(userData.email);
  });
});
```

### Validation Integration
```typescript
it('should validate user data before insertion', async () => {
  const invalidUser = {
    email: 'invalid-email',
    name: ''
  };

  const validationResult = validateUser(invalidUser);
  expect(validationResult.errors.length).toBeGreaterThan(0);
});
```

## Best Practices

1. **Test Isolation**
   - Use a separate test database
   - Clear collections between tests
   - Use unique identifiers for test data

2. **Type Safety**
   - Use proper types for all database operations
   - Validate data before insertion
   - Handle errors appropriately

3. **Performance**
   - Use in-memory MongoDB mock for unit tests
   - Use real MongoDB instance for integration tests
   - Clean up test data after tests

## Recent Updates

- Added type-safe database operations
- Improved MongoDB mock system
- Enhanced error handling
- Added validation integration
- Updated date handling
- Improved test coverage
- Added proper cleanup procedures 