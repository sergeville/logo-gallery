# Test Scenarios and Examples

## Common Test Scenarios

### 1. Authentication Flow Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from '../components/AuthModal'
import { generateTestUser, createMockSession } from '../utils/test-utils'

describe('Authentication Scenarios', () => {
  // Success path
  it('completes sign in flow successfully', async () => {
    const onSuccess = jest.fn()
    const mockUser = generateTestUser()
    
    render(<AuthModal isOpen onSuccess={onSuccess} />)
    
    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify success
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // Validation errors
  it('handles form validation errors', async () => {
    render(<AuthModal isOpen />)
    
    // Submit empty form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify validation messages
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  // API errors
  it('handles API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    
    render(<AuthModal isOpen />)
    
    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument()
    })
  })
})
```

### 2. File Upload Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadModal } from '../components/UploadModal'
import { createMockFile } from '../utils/test-utils'

describe('File Upload Scenarios', () => {
  // Success path
  it('handles file upload successfully', async () => {
    const onSuccess = jest.fn()
    const file = createMockFile({
      name: 'logo.png',
      type: 'image/png',
      size: 1024 * 1024 // 1MB
    })
    
    render(<UploadModal isOpen onSuccess={onSuccess} />)
    
    // Upload file
    const input = screen.getByLabelText(/choose file/i)
    await userEvent.upload(input, file)
    
    // Fill details
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Logo')
    await userEvent.type(screen.getByLabelText(/description/i), 'A test logo')
    await userEvent.click(screen.getByRole('button', { name: /upload/i }))
    
    // Verify success
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // File validation
  it('validates file type and size', async () => {
    const invalidFile = createMockFile({
      name: 'doc.pdf',
      type: 'application/pdf',
      size: 10 * 1024 * 1024 // 10MB
    })
    
    render(<UploadModal isOpen />)
    
    // Try uploading invalid file
    const input = screen.getByLabelText(/choose file/i)
    await userEvent.upload(input, invalidFile)
    
    // Verify validation messages
    expect(screen.getByText(/only image files are allowed/i)).toBeInTheDocument()
    expect(screen.getByText(/file size must be less than 5MB/i)).toBeInTheDocument()
  })
})
```

### 3. Theme Testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { Header } from '../components/Header'

describe('Theme Scenarios', () => {
  // Theme switching
  it('switches theme correctly', async () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    )
    
    // Initial theme
    expect(screen.getByTestId('header')).toHaveClass('bg-white')
    
    // Switch theme
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    
    // Verify theme change
    expect(screen.getByTestId('header')).toHaveClass('dark:bg-gray-800')
  })

  // Theme persistence
  it('maintains theme across navigation', async () => {
    const { rerender } = render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    )
    
    // Switch theme
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    
    // Simulate navigation
    rerender(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    )
    
    // Verify theme persisted
    expect(screen.getByTestId('header')).toHaveClass('dark:bg-gray-800')
  })
})
```

## Advanced Testing Patterns

### 1. Testing with Multiple Providers

```typescript
const renderWithAllProviders = (ui: React.ReactElement, options = {}) => {
  const {
    session = null,
    theme = 'light',
    queryClient = new QueryClient(),
    ...rest
  } = options

  return render(
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme={theme}>
          {ui}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>,
    rest
  )
}

// Usage
it('renders with all providers', () => {
  const mockSession = createMockSession({ user: mockUser })
  
  renderWithAllProviders(<Component />, {
    session: mockSession,
    theme: 'dark'
  })
  
  // Test component
})
```

### 2. Testing Async Data Loading

```typescript
describe('Async Data Loading', () => {
  it('handles loading states', async () => {
    // Mock slow API response
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(<Component />)
    
    // Verify loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    
    // Wait for data
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText(/loaded content/i)).toBeInTheDocument()
    })
  })

  it('handles error states', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to load'))
    
    render(<Component />)
    
    // Verify error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })
})
```

### 3. Testing Form Interactions

```typescript
describe('Form Interactions', () => {
  it('handles complex form interactions', async () => {
    render(<Form />)
    
    // Fill form fields
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Name')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'design')
    await userEvent.click(screen.getByLabelText(/terms/i))
    
    // Add dynamic fields
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    await userEvent.type(screen.getByTestId('tag-input-0'), 'tag1')
    await userEvent.click(screen.getByRole('button', { name: /add tag/i }))
    await userEvent.type(screen.getByTestId('tag-input-1'), 'tag2')
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    
    // Verify submission
    await waitFor(() => {
      expect(screen.getByText(/form submitted/i)).toBeInTheDocument()
    })
  })
})
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Test Timeouts**
```typescript
// Problem: Test times out waiting for element
// Solution: Adjust timeout and use correct waiting strategy

// Bad
await screen.findByText('Loading...')

// Good
await screen.findByText('Loading...', {}, { timeout: 5000 })
// or
await waitFor(() => {
  expect(screen.getByText('Loading...')).toBeInTheDocument()
}, { timeout: 5000 })
```

2. **Act Warnings**
```typescript
// Problem: React act() warning
// Solution: Wrap state updates in act

// Bad
fireEvent.click(button)
expect(screen.getByText('Updated')).toBeInTheDocument()

// Good
await act(async () => {
  fireEvent.click(button)
})
expect(screen.getByText('Updated')).toBeInTheDocument()
```

3. **Mock Function Issues**
```typescript
// Problem: Mock function not being called
// Solution: Verify mock setup and timing

// Bad
const mock = jest.fn()
expect(mock).toHaveBeenCalled()

// Good
const mock = jest.fn()
await waitFor(() => {
  expect(mock).toHaveBeenCalled()
})
```

### Debugging Strategies

1. **Component Debugging**
```typescript
// Print component structure
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Log rendered content
console.log(prettyDOM(container))
```

2. **Async Debugging**
```typescript
// Log intermediate states
await waitFor(() => {
  console.log('Current state:', screen.queryByText('Loading'))
  expect(screen.getByText('Done')).toBeInTheDocument()
})
```

3. **Mock Debugging**
```typescript
// Log mock calls
const mock = jest.fn()
// ... test code ...
console.log('Mock calls:', mock.mock.calls)
console.log('Mock results:', mock.mock.results)
```

### Performance Optimization

1. **Reducing Test Time**
```typescript
// Use more specific queries
// Bad
screen.getByText('Submit')
// Good
screen.getByRole('button', { name: /submit/i })

// Avoid unnecessary waits
// Bad
await new Promise(r => setTimeout(r, 1000))
// Good
await waitFor(() => {
  expect(element).toBeInTheDocument()
})
```

2. **Memory Management**
```typescript
// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks()
  cleanup()
})

// Reset handlers
afterEach(() => {
  server.resetHandlers()
})
``` 