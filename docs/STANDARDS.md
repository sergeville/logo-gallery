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

# Project Standards

## Testing Standards

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
        setup: async () => { /* setup code */ }
      },
      {
        name: 'loading',
        setup: async () => { /* setup code */ }
      }
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
   async function preparePageForVisualTest(
     page: Page,
     options?: VisualTestOptions
   ): Promise<void>;

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
     waitForTimeout: 1000
   });
   ```

2. Component Testing
   ```typescript
   await testComponentStates(page, '[data-testid="component"]', [
     { name: 'default', setup: async () => {} },
     { name: 'loading', setup: async () => {} }
   ]);
   ```

3. Responsive Testing
   ```typescript
   await testResponsiveLayouts(page, [
     VIEWPORT_SIZES.mobile,
     VIEWPORT_SIZES.tablet,
     VIEWPORT_SIZES.desktop
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
       body: JSON.stringify(mockData)
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
     timeout: 5000
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