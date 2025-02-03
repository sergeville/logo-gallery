# Logo Gallery Application Standards

## Environment Standards

### 1. Environment Types

The application supports three distinct environments:

| Environment | Purpose                | Database Name            | Allowed to Run |
| ----------- | ---------------------- | ------------------------ | -------------- |
| Development | Local development work | LogoGalleryDevelopmentDB | ✅ Yes         |
| Test        | Testing and QA         | LogoGalleryTestDB        | ✅ Yes         |
| Production  | Production deployment  | LogoGalleryDB            | ❌ No          |

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
  production: 'LogoGalleryDB',
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

| Category          | Environment | Scripts                                |
| ----------------- | ----------- | -------------------------------------- |
| Development Tools | development | dev, build, start, lint, format        |
| Database Tools    | development | db:seed, db:migrate                    |
| Testing Tools     | test        | test, test:unit, test:e2e, test:visual |
| Validation Tools  | development | validate, type-check                   |

#### Environment Validation Implementation

1. **Script Validation**

   ```typescript
   // Required in all scripts
   function validateScriptEnvironment(allowedEnv: 'development' | 'test', scriptName: string) {
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
const runInEnvironment = async (env: 'development' | 'test', task: () => Promise<void>) => {
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

# Project Standards

## Testing Standards

### Test Organization

1. **Subtest Structure**

```typescript
describe('Feature Category', () => {
  describe('Specific Feature', () => {
    // Subtests for different aspects
    it.each([
      ['case1', input1, expected1],
      ['case2', input2, expected2],
    ])('should handle %s correctly', (name, input, expected) => {
      // Test implementation
    });
  });
});
```

2. **Test Categories**

- Unit Tests: Test individual functions/components
- Integration Tests: Test feature interactions
- Visual Tests: Test UI appearance
- E2E Tests: Test complete user flows

### Error Tracking Standards

1. **Error Categories**

- Critical: Blocks core functionality
- High: Affects major features
- Medium: Affects minor features
- Low: Cosmetic issues

2. **Error Documentation**

````markdown
## Error Report

- **ID**: ERR\_[TIMESTAMP]
- **Type**: [CRITICAL|HIGH|MEDIUM|LOW]
- **Location**: [File:Line]
- **Description**: Brief description
- **Stack Trace**: `[trace]`
- **Visual Evidence**: [Screenshot/Link]
- **Status**: [OPEN|IN_PROGRESS|RESOLVED]
````

3. **Error Tracking Process**
   a. Capture
   - Log error details
   - Take screenshots if visual
   - Save error context
     b. Analyze
   - Determine severity
   - Identify root cause
   - Document dependencies
     c. Track
   - Create task in CURRENT_TEST_FAILURES.md
   - Assign priority
   - Update status

### Documentation Standards

1. **Test Documentation**

- Document test purpose and coverage
- Maintain test status in dedicated files
- Track test dependencies

2. **Error Documentation**

- Use standardized error report format
- Include visual evidence when applicable
- Track resolution progress

3. **Status Tracking**

```markdown
## Test Status

- Total Tests: [Number]
- Passing: [Number]
- Failing: [Number]
- Blocked: [Number]

## Error Status

- Critical: [Number]
- High: [Number]
- Medium: [Number]
- Low: [Number]
```

### 1. Visual Testing

#### File Organization

```typescript
e2e/visual-tests/
├── components/          # Component-specific tests
│   ├── button/
│   ├── input/
│   └── theme/
├── middleware/         # Middleware tests
├── utils/             # Test utilities
└── *.visual.spec.ts   # Feature tests
```

#### Naming Conventions

- Test files: `*.visual.spec.ts`
- Percy tests: `*.percy.spec.ts`
- Utility files: `*-utils.ts`
- Screenshot names: `{component}-{state}-{viewport}.png`

#### Component Test Structure

```typescript
test.describe('Component Name', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('should render correctly in all states', async ({ page }) => {
    const states = [
      {
        name: 'default',
        setup: async () => {
          /* setup code */
        },
      },
      {
        name: 'loading',
        setup: async () => {
          /* setup code */
        },
      },
    ];

    await testComponentStates(page, selector, states);
    await expect(page).toHaveScreenshot('component-states.png');
  });
});
```

#### Required Test Cases

1. Visual States

   - Initial render
   - Loading state
   - Error state
   - Empty state
   - Interactive states (hover, focus, active)

2. Responsive Testing

   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1280x800)

3. Theme Testing

   - Light mode
   - Dark mode
   - Custom themes (if applicable)

4. Accessibility Testing
   - Color contrast
   - Focus indicators
   - ARIA attributes
   - Screen reader compatibility

### 2. Code Quality

#### TypeScript Standards

1. Types and Interfaces

   ```typescript
   interface TestState {
     name: string;
     setup: () => Promise<void>;
     cleanup?: () => Promise<void>;
   }

   type ViewportSize = {
     width: number;
     height: number;
   };
   ```

2. Function Signatures

   ```typescript
   async function preparePageForVisualTest(page: Page, options?: VisualTestOptions): Promise<void>;

   async function testComponentStates(
     page: Page,
     selector: string,
     states: TestState[]
   ): Promise<void>;
   ```

#### ESLint Rules

```json
{
  "rules": {
    "playwright/expect-expect": "error",
    "playwright/no-conditional-in-test": "warn",
    "playwright/no-force-option": "error",
    "@typescript-eslint/explicit-function-return-type": "error"
  }
}
```

### 3. Test Utilities

#### Required Utilities

1. Page Preparation

   ```typescript
   await preparePageForVisualTest(page, {
     waitForSelectors: ['[data-testid="component"]'],
     customStyles: '* { animation: none !important; }',
     maskSelectors: ['.dynamic-content'],
     removeSelectors: ['.ads'],
     waitForTimeout: 1000,
   });
   ```

2. Component Testing

   ```typescript
   await testComponentStates(page, '[data-testid="component"]', [
     { name: 'default', setup: async () => {} },
     { name: 'loading', setup: async () => {} },
   ]);
   ```

3. Responsive Testing
   ```typescript
   await testResponsiveLayouts(page, [
     VIEWPORT_SIZES.mobile,
     VIEWPORT_SIZES.tablet,
     VIEWPORT_SIZES.desktop,
   ]);
   ```

### 4. Best Practices

#### Test Organization

1. Group Related Tests

   ```typescript
   test.describe('Feature Group', () => {
     test.describe('Subfeature', () => {
       test('specific behavior', async () => {});
     });
   });
   ```

2. Use Meaningful Names

   ```typescript
   // Good
   test('should display error message when API fails');

   // Bad
   test('test error');
   ```

#### Test Isolation

1. Reset State

   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await clearTestData();
   });
   ```

2. Mock External Dependencies
   ```typescript
   await page.route('**/api/data', route => {
     route.fulfill({
       status: 200,
       body: JSON.stringify(mockData),
     });
   });
   ```

#### Error Handling

1. Meaningful Assertions

   ```typescript
   await expect(page.locator('error-message')).toBeVisible();
   await expect(page.locator('error-message')).toHaveText('Invalid input');
   ```

2. Proper Timeouts
   ```typescript
   await page.waitForSelector('[data-testid="content"]', {
     state: 'visible',
     timeout: 5000,
   });
   ```

### 5. Documentation

#### Required Documentation

1. Test Description

   ```typescript
   /**
    * Tests the logo gallery component in various states:
    * - Empty state
    * - Loading state
    * - Error state
    * - Populated state with different grid layouts
    */
   test.describe('Logo Gallery', () => {});
   ```

2. Complex Setup
   ```typescript
   /**
    * Prepares the test environment with:
    * - Mocked API responses
    * - Authentication state
    * - Required test data
    */
   async function setupTestEnvironment(): Promise<void> {}
   ```

#### Maintenance

1. Regular Updates

   - Review and update baselines monthly
   - Document known issues
   - Track flaky tests
   - Update test data

2. Performance
   - Optimize test setup
   - Minimize redundant checks
   - Use appropriate timeouts
   - Group related tests

### 6. CI/CD Integration

#### Pipeline Configuration

```yaml
visual-tests:
  script:
    - npm run test:visual
  artifacts:
    paths:
      - test-results/
    expire_in: 1 week
```

#### Required Checks

1. Visual Regression

   - Compare against baselines
   - Check responsive layouts
   - Verify theme variations

2. Accessibility

   - Run axe-core checks
   - Verify ARIA attributes
   - Check color contrast

3. Performance
   - Test load times
   - Check image optimization
   - Verify caching behavior

Last updated: [Current Date]

## Image Handling Standards

### 1. Image File Format Standards

#### 1.1 PNG Format Requirements

- Must include all required chunks (IHDR, IDAT, IEND)
- Must use proper zlib compression for IDAT chunks
- Must include valid CRC32 checksums
- Must specify correct color type and bit depth
- Must handle alpha channel appropriately

#### 1.2 Image Validation

```typescript
// Example of proper PNG validation
function validatePngStructure(buffer: Buffer): boolean {
  // Check PNG signature
  if (!buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return false;
  }
  // Additional chunk validation...
  return true;
}
```

### 2. Image Similarity Detection

#### 2.1 Similarity Metrics

- Perceptual Hash (30% weight)
- Aspect Ratio (20% weight)
- Color Similarity (50% weight)

#### 2.2 Similarity Thresholds

```typescript
const SIMILARITY_THRESHOLDS = {
  exact: 0.98, // For exact duplicates
  verySimilar: 0.85, // For very similar images
  similar: 0.7, // For similar images
  somewhatSimilar: 0.55, // For somewhat similar images
};
```

### 3. Test Image Generation

#### 3.1 Test Image Requirements

- Must create valid file format structure
- Must include appropriate metadata
- Must use meaningful test patterns
- Must represent real-world scenarios

#### 3.2 Test Image Categories

```typescript
const TEST_IMAGE_TYPES = {
  default: {
    dimensions: [1, 1],
    pattern: 'solid',
    color: 'white',
  },
  similar: {
    dimensions: [1, 1],
    pattern: 'solid',
    color: 'off-white',
  },
  different: {
    dimensions: [2, 2],
    pattern: 'checkerboard',
    colors: ['red', 'green', 'blue', 'yellow'],
  },
};
```

## Testing Standards

### 1. Test Organization

#### 1.1 Test Categories

- Unit Tests: Individual component/function testing
- Integration Tests: Component interaction testing
- Visual Tests: UI appearance testing
- E2E Tests: Full user flow testing

#### 1.2 Test Structure

```typescript
describe('Component/Feature Name', () => {
  describe('Functionality Category', () => {
    // Setup and teardown
    beforeAll(async () => {
      // Environment setup
    });

    afterAll(async () => {
      // Cleanup
    });

    // Individual test cases
    it('should handle specific scenario', async () => {
      // Test implementation
    });
  });
});
```

### 2. Error Tracking Standards

#### 2.1 Error Documentation

- All errors must be logged with:
  - Error message
  - Stack trace
  - Context (environment, user action)
  - Related test case
  - Visual evidence (if applicable)

#### 2.2 Error Priority Levels

```typescript
const ERROR_PRIORITIES = {
  P0: 'Critical - Blocking functionality',
  P1: 'High - Major feature impact',
  P2: 'Medium - Non-blocking issues',
  P3: 'Low - Minor improvements',
};
```

#### 2.3 Error Tracking Format

```typescript
interface ErrorRecord {
  id: string;
  priority: keyof typeof ERROR_PRIORITIES;
  description: string;
  testCase: string;
  visualEvidence?: string;
  resolution?: string;
  status: 'open' | 'in-progress' | 'resolved';
}
```

### 3. Test Data Management

#### 3.1 Test Database Standards

- Use separate test database
- Clean state before each test suite
- Meaningful test data
- Proper data cleanup

#### 3.2 Test Helper Functions

```typescript
class TestHelper {
  // Database operations
  async cleanDatabase(): Promise<void>;
  async seedTestData(): Promise<void>;

  // File operations
  mockFileUpload(config: FileConfig): Buffer;

  // User operations
  async createTestUser(data?: Partial<UserData>): Promise<User>;
}
```

## Best Practices

### 1. Image Processing

- Always validate image format compliance
- Use proper error handling for image operations
- Include appropriate logging
- Consider performance implications

### 2. Testing

- Write comprehensive test cases
- Use meaningful test data
- Include proper error handling
- Document test requirements
- Track and prioritize test failures

### 3. Error Management

- Track all errors systematically
- Prioritize based on impact
- Include visual evidence when relevant
- Document resolution steps

Last updated: 2024-02-03
