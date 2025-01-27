# Logo Gallery Test Documentation

## Overview
This document outlines the testing strategy and implementation for the Logo Gallery application. The test suite is organized into three levels:

1. **Unit Tests**: Testing individual components in isolation
2. **Integration Tests**: Testing interactions between components
3. **End-to-End Tests**: Testing complete user journeys

## Test Structure

### Unit Tests (`/components/__tests__/`)
Individual component tests focusing on specific functionality:

- **AdminLogoCard.test.tsx**
  - Rendering states (logo info, owner details, tags)
  - Image handling (loading, errors)
  - Owner update functionality
  - Admin-only access control

- **AuthModal.test.tsx**
  - Sign in/up form rendering
  - Form validation
  - Authentication flow
  - Error handling

- **Header.test.tsx**
  - Navigation rendering
  - Authentication state display
  - Responsive layout

- **LogoCard.test.tsx**
  - Logo information display
  - Voting functionality
  - Tag rendering
  - Image handling

- **LogoCardSkeleton.test.tsx**
  - Loading state rendering
  - Animation classes
  - Accessibility attributes

- **Navbar.test.tsx**
  - Navigation links
  - Authentication state
  - Protected routes
  - Mobile responsiveness

- **ThemeToggle.test.tsx**
  - Theme switching
  - Icon rendering
  - Accessibility
  - Hover states

- **UploadModal.test.tsx**
  - File upload handling
  - Form validation
  - Success/error states
  - Modal interactions

### Integration Tests (`/__integration_tests__/`)
Tests focusing on component interactions:

- **auth-flow.test.tsx**
  - Complete authentication flow
  - Protected navigation
  - Session management
  - Error handling

- **logo-management.test.tsx**
  - Logo upload workflow
  - Voting system
  - Gallery interactions
  - Owner management

- **theme-layout.test.tsx**
  - Theme persistence
  - Layout adaptability
  - Component theme synchronization
  - Responsive design

### End-to-End Tests (`/__e2e_tests__/`)
Complete user journey testing:

- **user-journey.test.tsx**
  - New User Journey
    * Registration
    * First logo upload
    * Gallery navigation
  - Logo Management Journey
    * Upload flow
    * Voting system
    * Tag filtering
  - Theme Customization Journey
    * Theme persistence
    * Cross-page consistency
  - Admin Journey
    * Logo management
    * User management

## Test Utilities

### Mock Data Generation (`/utils/test-utils.ts`)
- `generateTestUser()`: Creates mock user data
- `generateTestLogo()`: Creates mock logo data

### Test Setup
- MSW (Mock Service Worker) for API mocking
- React Testing Library for component testing
- Jest for test running and assertions
- User Event for simulating user interactions

## Testing Best Practices

1. **Component Testing**
   - Test both success and error paths
   - Verify accessibility attributes
   - Check responsive behavior
   - Test all user interactions

2. **Integration Testing**
   - Focus on component communication
   - Verify state management
   - Test data flow
   - Check error boundaries

3. **E2E Testing**
   - Cover critical user paths
   - Test complete workflows
   - Verify business requirements
   - Include error scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- LogoCard.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Coverage Requirements

- Unit Tests: 90% coverage
- Integration Tests: 80% coverage
- E2E Tests: Critical path coverage

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Merges to main branch
- Release deployments

## Debugging Tests

1. Use `screen.debug()` to view rendered output
2. Use `console.log()` for debugging values
3. Use `test.only()` to run specific tests
4. Use `--verbose` flag for detailed output

## Contributing

When adding new tests:
1. Follow existing patterns and naming conventions
2. Include both success and error cases
3. Add documentation for new test cases
4. Ensure proper cleanup in teardown
5. Verify accessibility requirements 