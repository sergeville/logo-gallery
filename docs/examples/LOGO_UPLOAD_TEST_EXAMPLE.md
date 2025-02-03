# Logo Upload Test Example

This document demonstrates a practical implementation of test cases using the Logo Upload feature as an example.

## Overview

The example shows how to:
1. Structure test cases
2. Implement validation logic
3. Set up test environment
4. Handle test data
5. Perform assertions

## File Structure

```
app/
├── lib/
│   ├── logo-validation.ts           # Main validation logic
│   └── __tests__/
│       └── logo-upload.test.ts      # Test implementation
```

## Test Cases Definition

```typescript
const uploadTests = [
  {
    name: 'valid PNG file',
    input: {
      file: {
        name: 'logo.png',
        type: 'image/png',
        size: 500 * 1024 // 500KB
      },
      metadata: {
        width: 800,
        height: 600
      }
    },
    expected: { 
      isValid: true,
      status: 201 
    }
  },
  {
    name: 'oversized file',
    input: {
      file: {
        name: 'large.png',
        type: 'image/png',
        size: 5 * 1024 * 1024 // 5MB
      },
      metadata: {
        width: 800,
        height: 600
      }
    },
    expected: { 
      isValid: false,
      status: 400,
      error: 'File size exceeds limit'
    }
  }
  // ... more test cases
];
```

## Implementation Details

### 1. Validation Logic (`logo-validation.ts`)

```typescript
interface LogoValidationResult {
  isValid: boolean;
  status: number;
  error?: string;
}

interface LogoUploadParams {
  file: {
    name: string;
    type: string;
    size: number;
  };
  userId: string;
  metadata: {
    width: number;
    height: number;
  };
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export async function validateLogoUpload(params: LogoUploadParams): Promise<LogoValidationResult> {
  const { file, metadata } = params;

  // Validation checks
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      status: 400,
      error: 'File size exceeds limit'
    };
  }

  // ... more validation checks

  return {
    isValid: true,
    status: 201
  };
}
```

### 2. Test Implementation (`logo-upload.test.ts`)

```typescript
describe('Logo Upload Tests', () => {
  const testHelper = TestHelper.getInstance();

  beforeEach(async () => {
    // Setup test environment
    await testHelper.connect();
    await testHelper.clearCollections();
    
    // Create test user
    const testUser = await testHelper.createTestUser({
      email: 'test@example.com',
      username: 'testuser'
    });
    
    process.env.TEST_USER_ID = testUser._id.toString();
  });

  afterEach(async () => {
    // Cleanup
    await testHelper.clearCollections();
    await testHelper.disconnect();
    delete process.env.TEST_USER_ID;
  });

  // Dynamic test generation
  uploadTests.forEach(({ name, input, expected }) => {
    it(`handles ${name}`, async () => {
      const mockFile = testHelper.mockFileUpload(input.file);
      
      const result = await validateLogoUpload({
        file: mockFile,
        userId: process.env.TEST_USER_ID!,
        metadata: input.metadata
      });

      expect(result.isValid).toBe(expected.isValid);
      expect(result.status).toBe(expected.status);
      
      if (!expected.isValid) {
        expect(result.error).toBe(expected.error);
      }
    });
  });
});
```

## Key Features

### 1. Test Organization
- Clear separation of test cases and implementation
- Modular test structure
- Easy to add new test cases
- Consistent validation patterns

### 2. Test Setup
- Proper environment initialization
- Database connection management
- Test data creation
- Clean teardown after tests

### 3. Validation Checks
- File size limits
- File type restrictions
- Image dimensions validation
- Error handling

### 4. Test Assertions
- Status code verification
- Error message validation
- Database state verification
- Type checking

## Best Practices Demonstrated

1. **Test Data Management**
   - Clear test case structure
   - Isolated test data
   - Proper cleanup

2. **Error Handling**
   - Specific error messages
   - Status code mapping
   - Type safety

3. **Test Organization**
   - Logical grouping
   - Clear naming
   - Reusable test cases

4. **Database Interaction**
   - Connection management
   - Data cleanup
   - State verification

## Usage Example

To run these tests:

```bash
# Run all logo upload tests
npm test app/lib/__tests__/logo-upload.test.ts

# Run specific test case
npm test app/lib/__tests__/logo-upload.test.ts -t "valid PNG file"
```

## Extending the Tests

To add new test cases:

1. Add to `uploadTests` array:
```typescript
{
  name: 'new test case',
  input: {
    file: { /* file data */ },
    metadata: { /* metadata */ }
  },
  expected: { /* expected results */ }
}
```

2. The test runner will automatically include the new case.

## Maintenance

1. **Regular Updates**
   - Update test cases when requirements change
   - Add new validation rules as needed
   - Keep test data current

2. **Performance**
   - Monitor test execution time
   - Optimize database operations
   - Clean up test data properly

3. **Documentation**
   - Keep test cases documented
   - Update examples
   - Document edge cases 