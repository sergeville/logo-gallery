# Test Data System Documentation

## Overview

The test data system provides a robust way to generate, validate, and manage test data for the application. It includes type-safe interfaces, validation, and database helpers.

## Test Data Types

### User Test Data
```typescript
interface TestUser extends Omit<ClientUser, 'role' | 'createdAt' | 'updatedAt'> {
  role: 'USER' | 'ADMIN' | 'DESIGNER';
  createdAt: string;
  updatedAt: string;
}
```

### Logo Test Data
```typescript
interface TestLogo extends Omit<ClientLogo, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}
```

## Database Helper

The `TestDbHelper` class provides a type-safe interface for managing test data:

```typescript
class TestDbHelper {
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

## MongoDB Mock

The MongoDB mock system provides a type-safe way to test database operations:

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

## Test Data Generation

### Example Usage
```typescript
const users: TestUser[] = [
  {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const logos: TestLogo[] = [
  {
    id: 'test-logo-1',
    name: 'Test Logo',
    description: 'A test logo',
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/logo-thumb.png',
    category: 'test',
    tags: ['test'],
    dimensions: { width: 100, height: 100 },
    fileSize: 1024,
    fileType: 'image/png',
    averageRating: 0,
    totalVotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
```

## Validation Integration

Test data is validated before insertion:
```typescript
const validationResult = validateUser(user);
if (validationResult.errors.length > 0) {
  console.error('Invalid user data:', validationResult.errors);
  // Handle validation failure
}
```

## Recent Updates

- Added type-safe interfaces for test data
- Improved MongoDB mock system with proper typing
- Enhanced validation integration
- Added proper error handling
- Updated date handling to use ISO strings
- Added required ID fields to test data
- Improved test coverage 