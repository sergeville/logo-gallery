# Test Organization

This directory contains all the tests for the Logo Gallery application. The tests are organized into the following categories:

## Directory Structure

```
app/__tests__/
├── unit/           # Unit tests for individual components and functions
├── integration/    # Integration tests for component interactions
├── e2e/           # End-to-end tests (Playwright)
└── utils/         # Shared test utilities and helpers
```

## Test Categories

### Unit Tests
- Located in `unit/`
- Test individual components and functions in isolation
- Fast and focused
- Examples: `LogoCard.test.tsx`, `Header.test.tsx`

### Integration Tests
- Located in `integration/`
- Test interactions between components
- Test component integration with context providers
- Examples: `AuthModal.test.tsx`

### End-to-End Tests
- Located in `e2e/`
- Test complete user flows
- Use Playwright for browser automation
- Examples: `auth-flow.spec.ts`, `logo-management.spec.ts`

### Test Utilities
- Located in `utils/`
- Shared test helpers and mock data
- Common test setup functions
- Examples: `test-utils.ts`

## Running Tests

- Unit & Integration Tests: `npm test`
- E2E Tests: `npm run test:e2e`
- Visual Tests: `npm run test:visual`

## Best Practices

1. Place tests in the appropriate directory based on their scope
2. Use descriptive test names that explain the behavior being tested
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Keep tests focused and maintainable
5. Use shared utilities for common testing patterns
6. Document complex test scenarios 