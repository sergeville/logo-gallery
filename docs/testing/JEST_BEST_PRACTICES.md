# Jest Testing Best Practices

This guide outlines the best practices for testing in our Next.js application using Jest and React Testing Library.

## Table of Contents
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Test Setup](#test-setup)
- [Test Utilities](#test-utilities)
- [Testing Patterns](#testing-patterns)
- [Mocking](#mocking)
- [Common Gotchas](#common-gotchas)
- [Coverage Goals](#coverage-goals)
- [Maintenance](#maintenance)
- [Type Safety](#type-safety)

## Project Structure

```
├── jest.config.js          # Main Jest configuration
├── jest.setup.ts           # Global test setup and mocks
├── jest.environment.js     # Custom test environment
└── __tests__/
    ├── unit/              # Unit tests
    ├── integration/       # Integration tests
    └── utils/             # Test utilities
```

## Configuration

### Jest Configuration Best Practices

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: '<rootDir>/jest.environment.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/$1',
    // Handle static assets
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
  ],
};
```

## Test Setup

### Global Setup Best Practices

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';

// 1. Import and setup globals first
import { jest, expect } from '@jest/globals';
import * as matchers from '@testing-library/jest-dom/matchers';

// 2. Extend Jest matchers
expect.extend(matchers);

// 3. Mock browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 4. Setup cleanup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetModules();
});

// 5. Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));
```

## Test Utilities

### Shared Test Utilities

```typescript
// __tests__/utils/test-utils.tsx
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

// Custom render with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SessionProvider session={null}>
      {ui}
    </SessionProvider>
  );
}

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});
```

## Testing Patterns

### Component Testing Best Practices

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Reset mocks and setup
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { container } = renderWithProviders(<Component />);
    expect(container).toMatchSnapshot();
  });

  it('should handle async operations', async () => {
    const { getByRole } = renderWithProviders(<Component />);
    await waitFor(() => {
      expect(getByRole('button')).toBeInTheDocument();
    });
  });
});
```

## Mocking

### Mocking Best Practices

1. **Scope**: Mock at the closest possible scope to where it's needed
2. **Module Mocking**: Use Jest's automatic mocks for modules
3. **Type Safety**: Provide type-safe mock implementations
4. **Reset**: Reset mocks between tests
5. **Implementation**: Prefer simple, predictable mock implementations

Example:
```typescript
// Mock at module level for widely used dependencies
jest.mock('next-auth/react');

// Mock at test level for specific cases
beforeEach(() => {
  const mockSession = {
    user: createMockUser(),
    expires: '2024-12-31',
  };
  (useSession as jest.Mock).mockReturnValue({
    data: mockSession,
    status: 'authenticated',
  });
});
```

## Common Gotchas

1. **Next.js Module Mocking**
   - Always mock Next.js modules (`next/navigation`, `next/router`, etc.)
   - Ensure mocks match the actual module interface

2. **Async Operations**
   - Use `waitFor` for async operations
   - Handle promises properly
   - Test loading states

3. **Cleanup**
   - Clean up after each test
   - Reset mocks and modules
   - Clear any side effects

4. **Environment**
   - Match the browser environment when needed
   - Mock browser APIs consistently
   - Handle SSR vs CSR differences

## Coverage Goals

Our project aims for the following coverage targets:

- Unit Tests: 80%
- Integration Tests: 60%
- End-to-End Tests: 40%

## Maintenance

1. **Dependencies**
   - Keep dependencies up to date
   - Review and update mocks when upgrading Next.js
   - Monitor test performance

2. **Documentation**
   - Document complex test setups
   - Maintain testing guidelines
   - Update documentation with new patterns

3. **Performance**
   - Monitor test execution time
   - Optimize slow tests
   - Use appropriate test isolation

## Type Safety

1. **TypeScript Usage**
   - Use TypeScript for all test files
   - Ensure mocked data matches interfaces
   - Use proper type assertions
   - Handle null/undefined cases

2. **Type Checking**
   ```typescript
   // Good: Type-safe mock
   const mockUser: User = {
     id: '1',
     name: 'Test',
     email: 'test@example.com',
   };

   // Bad: Untyped mock
   const mockUser = {
     id: '1',
     // Missing required fields
   };
   ```

3. **Mock Types**
   ```typescript
   // Define types for mocks
   type MockResponse = jest.Mocked<typeof Response>;
   
   // Use type assertions properly
   const mockFn = jest.fn() as jest.MockedFunction<typeof originalFn>;
   ```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/) 