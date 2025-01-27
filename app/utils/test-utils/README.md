# Test Utilities Documentation

## Overview
This directory contains utility functions and helpers for testing the Logo Gallery application. These utilities are designed to make testing more efficient and maintainable.

## Mock Data Generators

### `generateTestUser()`
Creates a mock user object with customizable properties.

```typescript
import { generateTestUser } from '@/app/utils/test-utils'

// Basic usage
const user = generateTestUser()

// With custom properties
const adminUser = generateTestUser({
  role: 'admin',
  name: 'Admin User'
})

// Properties generated:
interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}
```

### `generateTestLogo()`
Creates a mock logo object with customizable properties.

```typescript
import { generateTestLogo } from '@/app/utils/test-utils'

// Basic usage
const logo = generateTestLogo()

// With custom properties
const customLogo = generateTestLogo({
  name: 'Custom Logo',
  tags: ['custom', 'test']
})

// Properties generated:
interface Logo {
  id: string
  name: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  category: string
  tags: string[]
  dimensions: {
    width: number
    height: number
  }
  fileSize: number
  fileType: string
  ownerId: string
  ownerName: string
  averageRating: number
  totalVotes: number
  createdAt: string
  updatedAt: string
}
```

## Test Providers

### `renderWithProviders()`
Renders a component with all necessary providers for testing.

```typescript
import { renderWithProviders } from '@/app/utils/test-utils'

const { container } = renderWithProviders(<Component />, {
  session: mockSession,
  theme: 'dark'
})
```

### `createQueryWrapper()`
Creates a wrapper with QueryClient provider for testing.

```typescript
import { createQueryWrapper } from '@/app/utils/test-utils'

const wrapper = createQueryWrapper()
render(<Component />, { wrapper })
```

## Mock Helpers

### `createMockSession()`
Creates a mock session object for authentication testing.

```typescript
import { createMockSession } from '@/app/utils/test-utils'

const session = createMockSession({
  user: mockUser,
  expires: '2024-12-31'
})
```

### `createMockRouter()`
Creates a mock Next.js router for testing navigation.

```typescript
import { createMockRouter } from '@/app/utils/test-utils'

const router = createMockRouter({
  pathname: '/gallery',
  query: { page: '1' }
})
```

## File Mocks

### `createMockFile()`
Creates a mock File object for testing uploads.

```typescript
import { createMockFile } from '@/app/utils/test-utils'

const file = createMockFile({
  name: 'test.png',
  type: 'image/png',
  size: 1024
})
```

## API Mocks

### `createMockResponse()`
Creates a mock API response for testing fetch calls.

```typescript
import { createMockResponse } from '@/app/utils/test-utils'

const response = createMockResponse({
  status: 200,
  data: { success: true }
})
```

## Event Helpers

### `createMockEvent()`
Creates mock events for testing event handlers.

```typescript
import { createMockEvent } from '@/app/utils/test-utils'

const event = createMockEvent('click', {
  preventDefault: jest.fn()
})
```

## Usage Examples

### Testing Authentication
```typescript
import { generateTestUser, createMockSession } from '@/app/utils/test-utils'

describe('Authentication', () => {
  it('handles login', () => {
    const user = generateTestUser()
    const session = createMockSession({ user })
    
    renderWithProviders(<Component />, { session })
    // Test authentication logic
  })
})
```

### Testing File Upload
```typescript
import { createMockFile, createMockResponse } from '@/app/utils/test-utils'

describe('File Upload', () => {
  it('handles file upload', async () => {
    const file = createMockFile({ name: 'logo.png' })
    const response = createMockResponse({ success: true })
    
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue(response)
    
    // Test upload logic
  })
})
```

## Best Practices

1. **Mock Data**
   - Use generators for consistent test data
   - Customize only necessary properties
   - Keep mock data realistic

2. **Providers**
   - Use renderWithProviders for component tests
   - Include only required providers
   - Mock provider values appropriately

3. **API Mocking**
   - Use MSW for API mocks
   - Handle success and error cases
   - Match API response structure

4. **File Operations**
   - Use createMockFile for uploads
   - Set appropriate file properties
   - Test file validation

## Contributing

When adding new utilities:
1. Follow existing patterns
2. Add TypeScript types
3. Include usage examples
4. Update documentation
5. Add unit tests for utilities 