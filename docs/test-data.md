# Test Data Generation Guide

## Overview
This guide describes how to generate and manage test data using MongoDB in the test environment.

## Directory Structure
```
scripts/
├── seed/                   # Test data generation scripts
│   ├── users.ts           # User data generation
│   ├── logos.ts           # Logo data generation
│   └── __tests__/         # Test files for seed scripts
└── seed-data/             # Static test data files
    └── images/            # Test images
```

## Implemented Scripts

### 1. User Data Generation (`scripts/seed/users.ts`)
```typescript
interface UserSeedOptions {
  count: number;
  withProfiles?: boolean;
  roles?: Array<'user' | 'admin'>;
  passwordHash?: string;
}

// Generate multiple users
const users = await seedUsers({
  count: 10,
  withProfiles: true,
  roles: ['user', 'admin']
});

// Generate admin users
const admins = await seedAdmins(2);

// Create a single test user
const testUser = await createTestUser({
  email: 'custom@example.com'
});
```

### 2. Logo Data Generation (`scripts/seed/logos.ts`)
```typescript
interface LogoSeedOptions {
  count: number;
  perUser?: number;
  withRatings?: boolean;
  userIds: ObjectId[];
  minVotes?: number;
  maxVotes?: number;
}

// Generate multiple logos
const logos = await seedLogos({
  count: 10,
  userIds: existingUserIds,
  withRatings: true,
  perUser: 2
});

// Create a single test logo
const testLogo = await createTestLogo(userId, {
  name: 'Custom Logo'
});
```

### 3. Relationship Data Generation (`scripts/seed/relationships.ts`)
```typescript
interface RelationshipSeedOptions {
  users: { _id: ObjectId }[];
  logos: { _id: ObjectId }[];
  commentsPerLogo?: number;
  collectionsPerUser?: number;
  logosPerCollection?: number;
  favoritesPerUser?: number;
  maxRepliesPerComment?: number;
}

// Generate all relationships
const relationships = await seedRelationships({
  users: existingUsers,
  logos: existingLogos,
  commentsPerLogo: 3,
  collectionsPerUser: 2,
  favoritesPerUser: 5
});

// Or generate specific relationships
const comments = await seedComments({ users, logos });
const collections = await seedCollections({ users, logos });
const favorites = await seedFavorites({ users, logos });
```

## Data Models

### Users Collection
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  profile: {
    image?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
  };
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}
```

### Logos Collection
```typescript
interface Logo {
  _id: ObjectId;
  name: string;
  url: string;
  description: string;
  userId: ObjectId;
  tags: string[];
  averageRating: number;
  votes: Array<{
    userId: ObjectId;
    rating: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Comments Collection
```typescript
interface Comment {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies?: Comment[];
}
```

### Collections Collection
```typescript
interface Collection {
  _id: ObjectId;
  name: string;
  description: string;
  userId: ObjectId;
  logoIds: ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Favorites Collection
```typescript
interface Favorite {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
  createdAt: Date;
}
```

## Features

### User Generation
- Random username and email generation
- Password hashing with bcrypt
- Optional profile generation
- Role assignment (user/admin)
- Timestamp management

### Logo Generation
- Style-based naming
- Tag system with predefined categories
- Rating and voting system
- Even distribution among users
- Dynamic description generation
- Timestamp management

### Relationship Generation
- Nested comment structure with replies
- Public and private collections
- Like counts for comments
- Even distribution of favorites
- Realistic content generation
- Timestamp management for all relationships

## Usage Examples

### Complete Test Data Setup
```typescript
import { seedUsers } from '../seed/users';
import { seedLogos } from '../seed/logos';
import { seedRelationships } from '../seed/relationships';

async function setupCompleteTestData() {
  // Create users and logos first
  const users = await seedUsers({
    count: 10,
    withProfiles: true
  });

  const logos = await seedLogos({
    count: 30,
    userIds: users.map(u => u._id),
    withRatings: true
  });

  // Then create all relationships
  const relationships = await seedRelationships({
    users,
    logos,
    commentsPerLogo: 3,
    collectionsPerUser: 2,
    favoritesPerUser: 5,
    maxRepliesPerComment: 2
  });

  return { users, logos, relationships };
}
```

### Testing Usage
```typescript
describe('Logo Gallery Tests', () => {
  let testUser;
  let testLogo;

  beforeEach(async () => {
    testUser = await createTestUser();
    testLogo = await createTestLogo(testUser._id);
  });

  it('should handle logo operations', async () => {
    // Test with generated data
  });
});
```

## Best Practices

1. **Data Generation**
   - Use realistic data patterns
   - Maintain referential integrity
   - Generate consistent timestamps
   - Include edge cases

2. **Testing**
   - Clean up test data after tests
   - Use isolated test databases
   - Maintain data relationships
   - Test edge cases

3. **Performance**
   - Use bulk operations for large datasets
   - Implement proper cleanup
   - Monitor database size
   - Handle large datasets efficiently

## Configuration

The test environment uses Jest with the following configuration:
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/scripts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
``` 