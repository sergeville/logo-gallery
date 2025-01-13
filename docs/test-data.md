# Test Data Generation Guide

## Overview
This guide describes how to generate and manage test data using MongoDB in the test environment.

## Directory Structure
```
test/
├── seed/                   # Test data generation scripts
│   ├── users.ts           # User data generation
│   ├── logos.ts           # Logo data generation
│   └── relationships.ts   # Relationship data generation
└── seed-data/             # Static test data files
    ├── images/            # Test images
    └── templates/         # Data templates
```

## Required Scripts

### 1. User Data Generation (`test/seed/users.ts`)
```typescript
interface UserSeedOptions {
  count: number;
  withProfiles: boolean;
  roles?: string[];
}

async function seedUsers(options: UserSeedOptions) {
  // Generate user data
}
```

### 2. Logo Data Generation (`test/seed/logos.ts`)
```typescript
interface LogoSeedOptions {
  count: number;
  perUser: number;
  withRatings: boolean;
}

async function seedLogos(options: LogoSeedOptions) {
  // Generate logo data
}
```

### 3. Relationships (`test/seed/relationships.ts`)
```typescript
interface RelationshipSeedOptions {
  votesPerLogo: number;
  commentsPerLogo: number;
}

async function seedRelationships(options: RelationshipSeedOptions) {
  // Generate relationships
}
```

## Usage Example

```typescript
import { setupTestData } from '../test/seed';

describe('Logo Gallery Tests', () => {
  beforeAll(async () => {
    await setupTestData({
      users: {
        count: 10,
        withProfiles: true,
        roles: ['user', 'admin']
      },
      logos: {
        count: 30,
        perUser: 3,
        withRatings: true
      },
      relationships: {
        votesPerLogo: 5,
        commentsPerLogo: 3
      }
    });
  });
});
```

## Data Requirements

### Users Collection
```typescript
interface User {
  username: string;
  email: string;
  password: string; // hashed
  profile: {
    image: string;
    bio: string;
  };
  createdAt: Date;
  lastLogin: Date;
  role: string;
}
```

### Logos Collection
```typescript
interface Logo {
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

## Implementation Guidelines

### 1. Data Generation
- Use realistic data patterns
- Maintain referential integrity
- Generate consistent timestamps
- Include edge cases

### 2. Image Handling
- Store test images in `test/seed-data/images`
- Support multiple formats (PNG, JPEG, SVG)
- Include various dimensions
- Keep file sizes small

### 3. Performance
- Use bulk operations
- Implement cleanup strategies
- Cache common data
- Handle large datasets efficiently

## Best Practices

1. **Data Isolation**
   - Use separate test database
   - Clean up after tests
   - Don't mix with development data
   - Reset database state between tests

2. **Data Quality**
   - Generate realistic test data
   - Include edge cases
   - Maintain data relationships
   - Use consistent patterns

3. **Performance**
   - Use efficient bulk operations
   - Implement proper indexing
   - Clean up old test data
   - Monitor database size

4. **Maintenance**
   - Document data structures
   - Version control test data
   - Update seed scripts
   - Track data dependencies

## Configuration

Test data generation uses the test environment configuration:

```typescript
// config/test/testing.ts
export const testingConfig = {
  seedData: {
    path: 'test/seed-data',
    cleanup: true,
    batchSize: 100
  },
  images: {
    maxSize: 1024 * 1024, // 1MB
    formats: ['png', 'jpg', 'svg']
  }
};
```

## Troubleshooting

1. **Data Generation Issues**
   - Check database connection
   - Verify file permissions
   - Monitor memory usage
   - Check error logs

2. **Image Problems**
   - Verify image paths
   - Check file permissions
   - Validate image formats
   - Monitor storage space

3. **Performance Issues**
   - Use batch operations
   - Implement indexing
   - Monitor query performance
   - Clean up old data 