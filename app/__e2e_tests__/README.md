# End-to-End Test Documentation

## Overview
The E2E tests simulate complete user journeys through the Logo Gallery application, testing multiple components and features working together in realistic scenarios.

## Test Scenarios

### 1. New User Journey
Tests the complete flow for a new user from registration to first logo upload.

#### Steps:
1. Registration
   - Click sign in button
   - Switch to registration form
   - Fill in user details
   - Submit registration
   - Verify successful registration

2. First Logo Upload
   - Navigate to upload page
   - Select logo file
   - Fill in logo details
   - Submit upload
   - Verify successful upload

3. Gallery Navigation
   - Navigate to gallery
   - Verify uploaded logo appears
   - Check logo details

### 2. Logo Management Journey
Tests the core functionality of logo management for authenticated users.

#### Steps:
1. Logo Upload
   - Navigate to upload page
   - Complete upload form
   - Verify upload success

2. Voting System
   - Find logo in gallery
   - Cast vote
   - Verify vote count update

3. Tag Filtering
   - Click on logo tag
   - Verify filtered results
   - Check tag-based navigation

### 3. Theme Customization Journey
Tests theme persistence and consistency across the application.

#### Steps:
1. Theme Toggle
   - Switch theme
   - Verify visual changes

2. Navigation
   - Visit different pages
   - Verify theme persistence

3. Authentication
   - Complete sign in
   - Verify theme maintains after auth

### 4. Admin Journey
Tests administrative functions and privileged operations.

#### Steps:
1. Admin Access
   - Sign in as admin
   - Access admin pages
   - Verify admin controls

2. Logo Management
   - Update logo ownership
   - Edit logo details
   - Verify changes

## Test Setup

### Mock Service Worker Configuration
```typescript
const server = setupServer(
  // Auth endpoints
  rest.post('/api/auth/register', ...),
  rest.post('/api/auth/login', ...),

  // Logo endpoints
  rest.post('/api/logos', ...),
  rest.get('/api/logos', ...),
  rest.post('/api/logos/:id/vote', ...)
)
```

### Test Utilities
```typescript
const renderApp = (session = null) => {
  return render(
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

## Error Scenarios Tested

1. **Registration Errors**
   - Invalid email format
   - Password requirements not met
   - Email already registered

2. **Upload Errors**
   - Invalid file type
   - File size too large
   - Missing required fields

3. **Authentication Errors**
   - Invalid credentials
   - Session expiration
   - Unauthorized access

4. **API Errors**
   - Network failures
   - Server errors
   - Validation errors

## Test Data

### Mock User
```typescript
const mockUser = generateTestUser({
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
})
```

### Mock Logo
```typescript
const mockLogo = generateTestLogo({
  name: 'Test Logo',
  tags: ['test', 'design'],
  totalVotes: 0
})
```

## Running E2E Tests

```bash
# Run all E2E tests
npm test __e2e_tests__

# Run specific journey
npm test user-journey.test.tsx

# Run with debugging
npm test user-journey.test.tsx --debug
```

## Best Practices

1. **Test Organization**
   - Group related steps in describe blocks
   - Use clear, descriptive test names
   - Follow user flow in logical order

2. **Assertions**
   - Verify visual elements
   - Check data persistence
   - Validate state changes
   - Test accessibility

3. **Error Handling**
   - Test both success and error paths
   - Verify error messages
   - Check recovery flows

4. **Performance**
   - Use waitFor for async operations
   - Handle loading states
   - Verify transitions

## Maintenance

1. **Adding New Tests**
   - Follow existing patterns
   - Document new scenarios
   - Include error cases
   - Test edge cases

2. **Updating Tests**
   - Update for UI changes
   - Maintain mock data
   - Keep documentation current

3. **Debugging**
   - Use screen.debug()
   - Check console logs
   - Verify MSW handlers
   - Test in isolation 