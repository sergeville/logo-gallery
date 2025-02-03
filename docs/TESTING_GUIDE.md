# Logo Gallery Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Testing Infrastructure](#testing-infrastructure)
4. [Test Data Management](#test-data-management)
5. [Testing Strategies](#testing-strategies)
6. [Subtest Patterns](#subtest-patterns)
7. [Current Status](#current-status)
8. [Best Practices](#best-practices)
9. [CI/CD Integration](#ci-cd-integration)
10. [Visual Testing](#visual-testing)
11. [Performance Testing](#performance-testing)
12. [Security Testing](#security-testing)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

## Overview

This guide provides comprehensive documentation for the Logo Gallery testing infrastructure, including setup, strategies, and best practices.

### Key Features
- Unit, integration, and E2E testing support
- MongoDB test database configuration
- Automated test data generation
- Cross-browser testing capabilities
- Performance testing tools
- Visual regression testing
- Security testing suite

## Test Environment Setup

### Environment Variables
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/LogoGalleryTestDB
MONGODB_TEST_URI=mongodb://localhost:27017/LogoGalleryTestDB
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=test-secret-key
LOG_LEVEL=debug
ENABLE_TEST_LOGGING=true
MAX_BATCH_SIZE=100
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['app/lib/__tests__/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './app')
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    }
  }
});
```

## Testing Infrastructure

### Directory Structure
```
app/
├── lib/
│   ├── __tests__/           # Unit tests
│   │   ├── setup.ts         # Test setup
│   │   └── test-helper.ts   # Test utilities
├── components/
│   └── __tests__/          # Component tests
├── api/
│   └── __tests__/          # API tests
├── __integration_tests__/   # Integration tests
└── __e2e__/                # End-to-end tests

scripts/
├── seed/                    # Test data generation
│   ├── users.ts
│   ├── logos.ts
│   └── __tests__/
├── test-data/              # Static test data
└── performance/            # Performance test scripts
```

### Test Helper Utilities
```typescript
class TestHelper {
  // Database connection management
  async connect(): Promise<void>;
  async disconnect(): Promise<void>;
  async clearCollections(): Promise<void>;

  // Test data creation
  async createTestUser(data?: any): Promise<any>;
  async createTestLogo(userId: string, data?: any): Promise<any>;
  async createTestCollection(userId: string, data?: any): Promise<any>;

  // Utility methods
  getDb(): Db;
  getClient(): MongoClient;
  
  // Mock utilities
  mockAuthSession(user?: any): void;
  mockApiResponse(): Response;
  mockFileUpload(file?: any): FormData;
}
```

## Test Data Management

### Data Models

#### Users Collection
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
  preferences: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    language: string;
  };
}
```

#### Logos Collection
```typescript
interface Logo {
  _id: ObjectId;
  name: string;
  url: string;
  description: string;
  userId: ObjectId;
  tags: string[];
  totalVotes: number;
  votes: Array<{ userId: ObjectId; timestamp: Date; }>;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    dimensions: { width: number; height: number; };
    format: string;
    size: number;
  };
  status: 'draft' | 'published' | 'archived';
}
```

### Data Generation

#### User Generation
```typescript
const users = await seedUsers({
  count: 10,
  withProfiles: true,
  roles: ['user', 'admin'],
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    language: 'en'
  }
});
```

#### Logo Generation
```typescript
const logos = await seedLogos({
  count: 30,
  userIds: users.map(u => u._id),
  withVotes: true,
  perUser: 3,
  metadata: {
    dimensions: { width: 800, height: 600 },
    format: 'png',
    size: 1024 * 1024 // 1MB
  }
});
```

## Testing Strategies

### Unit Testing
- Component testing with Vitest
- API route testing
- Database operations testing
- Utility function testing
- Error handling
- Edge cases
- Input validation

### Integration Testing
- User authentication flow
- Logo management operations
- Search and filter functionality
- Profile management
- API endpoint integration
- Database transactions
- Cache operations

### End-to-End Testing
- Critical user paths
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing
- User flows
- Error scenarios
- Edge cases

## Subtest Patterns

### Understanding Subtests
Subtests provide a way to group related test cases within a larger test function, offering better organization, isolation, and detailed reporting. They are particularly useful when testing multiple variations of similar functionality.

### Benefits
- **Isolation**: Each subtest runs independently, preventing cascading failures
- **Detailed Reporting**: Precise failure identification and reporting
- **Efficiency**: Ability to run specific subtests during debugging
- **Organization**: Better structure for related test cases
- **Maintainability**: Easier to add or modify test cases

### Implementation Examples

#### Vitest Implementation
```typescript
import { describe, it, expect } from 'vitest';

describe('Logo Operations', () => {
  it('handles various logo dimensions', () => {
    const testCases = [
      { width: 800, height: 600, expected: true },
      { width: 400, height: 300, expected: true },
      { width: 100, height: 50, expected: false }
    ];

    testCases.forEach(({ width, height, expected }) => {
      expect(
        validateLogoDimensions({ width, height })
      ).toBe(expected);
    });
  });

  it('processes different file formats', () => {
    const formats = [
      { type: 'image/png', expected: true },
      { type: 'image/jpeg', expected: true },
      { type: 'image/gif', expected: false }
    ];

    formats.forEach(({ type, expected }) => {
      expect(
        validateLogoFormat(type)
      ).toBe(expected);
    });
  });
});
```

#### API Testing Example
```typescript
describe('Logo API Endpoints', () => {
  const testCases = [
    {
      name: 'valid logo data',
      payload: { name: 'Test Logo', url: 'https://example.com/logo.png' },
      expectedStatus: 201
    },
    {
      name: 'missing name',
      payload: { url: 'https://example.com/logo.png' },
      expectedStatus: 400
    },
    {
      name: 'invalid URL',
      payload: { name: 'Test Logo', url: 'invalid-url' },
      expectedStatus: 400
    }
  ];

  testCases.forEach(({ name, payload, expectedStatus }) => {
    it(`handles ${name}`, async () => {
      const response = await fetch('/api/logos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(expectedStatus);
    });
  });
});
```

#### Database Operations Example
```typescript
describe('Logo Database Operations', () => {
  const operations = [
    {
      name: 'create logo',
      operation: async (db) => await db.collection('logos').insertOne(testLogo),
      validate: (result) => expect(result.insertedId).toBeDefined()
    },
    {
      name: 'update logo',
      operation: async (db) => await db.collection('logos').updateOne(
        { _id: testLogo._id },
        { $set: { name: 'Updated Logo' }}
      ),
      validate: (result) => expect(result.modifiedCount).toBe(1)
    },
    {
      name: 'delete logo',
      operation: async (db) => await db.collection('logos').deleteOne(
        { _id: testLogo._id }
      ),
      validate: (result) => expect(result.deletedCount).toBe(1)
    }
  ];

  operations.forEach(({ name, operation, validate }) => {
    it(`successfully performs ${name}`, async () => {
      const result = await operation(testDb);
      validate(result);
    });
  });
});
```

### Best Practices for Subtests

1. **Organization**
   - Group related test cases logically
   - Use descriptive names for test cases
   - Keep test data separate from test logic

2. **Data Management**
```typescript
const testCases = [
  {
    input: { /* test input */ },
    expected: { /* expected output */ },
    description: 'descriptive test case name'
  }
];
```

3. **Error Handling**
```typescript
testCases.forEach(({ input, expected, description }) => {
  it(description, async () => {
    try {
      const result = await performOperation(input);
      expect(result).toEqual(expected);
    } catch (error) {
      // Handle or assert expected errors
      expect(error).toBeInstanceOf(ExpectedError);
    }
  });
});
```

4. **Async Operations**
```typescript
describe('Async Operations', () => {
  const asyncTestCases = [
    {
      input: 'test1',
      expected: 'result1',
      timeout: 1000
    },
    // More test cases...
  ];

  asyncTestCases.forEach(({ input, expected, timeout }) => {
    it(`handles ${input}`, async () => {
      const result = await performAsyncOperation(input);
      expect(result).toBe(expected);
    }, timeout);
  });
});
```

### Maintenance Considerations
1. Keep test cases data-driven and easily maintainable
2. Update test cases when requirements change
3. Document edge cases and special conditions
4. Review and refactor test patterns regularly

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Visual Testing

### Screenshot Testing
```typescript
describe('Logo Card Component', () => {
  it('matches screenshot in light mode', async () => {
    const { container } = render(<LogoCard logo={mockLogo} />);
    expect(await takeScreenshot(container)).toMatchImageSnapshot();
  });

  it('matches screenshot in dark mode', async () => {
    const { container } = render(
      <ThemeProvider theme="dark">
        <LogoCard logo={mockLogo} />
      </ThemeProvider>
    );
    expect(await takeScreenshot(container)).toMatchImageSnapshot();
  });
});
```

### Visual Regression Testing
- Automated visual comparison
- Cross-browser visual testing
- Responsive design testing
- Component-level visual testing
- Page-level visual testing

## Performance Testing

### Load Testing
```typescript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function() {
  const res = http.get('http://localhost:3000/api/logos');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
}
```

### Metrics Collection
- Response times
- Error rates
- Resource usage
- Database performance
- Cache hit rates
- Network latency

## Security Testing

### Authentication Tests
```typescript
describe('Authentication Security', () => {
  it('prevents password brute force attempts', async () => {
    const attempts = await Promise.all(
      Array(5).fill(0).map(() => 
        loginWithWrongPassword(testUser.email)
      )
    );
    
    const lastAttempt = await loginWithWrongPassword(testUser.email);
    expect(lastAttempt.status).toBe(429); // Too Many Requests
  });
});
```

### Security Checks
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting
- SQL injection
- File upload validation

## Best Practices

### 1. Test Data Management
- Use seed scripts for consistent data
- Maintain referential integrity
- Include edge cases
- Use realistic data patterns
- Clean up test data after use
- Version control test data

### 2. Test Isolation
```typescript
describe('Test Suite', () => {
  beforeEach(async () => {
    await testHelper.clearCollections();
    await testHelper.mockAuthSession();
  });

  afterEach(async () => {
    await testHelper.disconnect();
    vi.clearAllMocks();
  });
});
```

### 3. Error Handling
- Implement proper error boundaries
- Test error scenarios
- Validate error messages
- Check error recovery
- Test timeout scenarios
- Handle edge cases

### 4. Performance Considerations
- Use bulk operations for large datasets
- Implement proper cleanup
- Monitor database size
- Handle large datasets efficiently
- Cache test results when appropriate
- Parallelize tests when possible

## Troubleshooting

### Common Issues
1. Connection Failures
   - Check MongoDB service
   - Verify connection string
   - Check network connectivity
   - Verify environment variables
   - Check firewall settings

2. Test Data Issues
   - Check seed script logs
   - Verify data integrity
   - Check for missing references
   - Validate data constraints
   - Check for race conditions

3. Performance Issues
   - Use bulk operations
   - Implement proper indexes
   - Monitor query patterns
   - Check memory usage
   - Optimize test runs

### Maintenance Tasks
1. Regular cleanup of test data
2. Update seed scripts with schema changes
3. Review and update test patterns
4. Monitor test database size
5. Update test dependencies
6. Review test coverage

## Contributing

### Adding New Tests
1. Follow the existing test structure
2. Include proper documentation
3. Add test cases for edge scenarios
4. Update test coverage reports
5. Follow naming conventions
6. Add proper error handling

### Code Review Guidelines
1. Check test coverage
2. Verify error handling
3. Review performance impact
4. Check for proper isolation
5. Validate documentation
6. Review security implications 