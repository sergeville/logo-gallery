# Test Troubleshooting Guide

## Common Test Failures and Solutions

### 1. Element Not Found Errors

#### Problem:
```
TestingLibraryElementError: Unable to find an element with the text: /submit/i
```

#### Solutions:

1. **Check Element Existence**
```typescript
// Bad: Immediate failure
expect(screen.getByText('Submit')).toBeInTheDocument()

// Good: Debug first
console.log(prettyDOM(container))
screen.debug()
expect(screen.getByText('Submit')).toBeInTheDocument()
```

2. **Check Query Method**
```typescript
// More specific queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Submit button')

// For async elements
await screen.findByText('Submit')
```

3. **Check Element Visibility**
```typescript
// Element might be hidden
screen.getByText('Submit', { hidden: true })

// Check visibility explicitly
expect(screen.queryByText('Submit')).not.toBeVisible()
```

### 2. Async Testing Issues

#### Problem:
```
Jest: Timeout - Async operation took longer than 5000ms
```

#### Solutions:

1. **Proper Async Waiting**
```typescript
// Bad
await screen.findByText('Loading...')

// Good
await screen.findByText('Loading...', {}, { timeout: 10000 })

// Better
await waitFor(
  () => expect(screen.getByText('Done')).toBeInTheDocument(),
  { timeout: 10000 }
)
```

2. **Mock Timing Issues**
```typescript
// Bad
const mock = jest.fn()
fireEvent.click(button)
expect(mock).toHaveBeenCalled()

// Good
const mock = jest.fn()
fireEvent.click(button)
await waitFor(() => expect(mock).toHaveBeenCalled())
```

3. **API Call Timing**
```typescript
// Bad
render(<Component />)
expect(screen.getByText('Data')).toBeInTheDocument()

// Good
render(<Component />)
await waitFor(() => {
  expect(screen.getByText('Data')).toBeInTheDocument()
})
```

### 3. State Update Issues

#### Problem:
```
Warning: An update to Component inside a test was not wrapped in act(...)
```

#### Solutions:

1. **Wrap State Updates**
```typescript
// Bad
fireEvent.click(button)
expect(screen.getByText('Updated')).toBeInTheDocument()

// Good
await act(async () => {
  fireEvent.click(button)
})
expect(screen.getByText('Updated')).toBeInTheDocument()
```

2. **Handle Multiple Updates**
```typescript
// Bad
userEvent.type(input, 'test')
fireEvent.click(button)

// Good
await act(async () => {
  await userEvent.type(input, 'test')
  await userEvent.click(button)
})
```

### 4. Mock Function Issues

#### Problem:
```
expect(jest.fn()).toHaveBeenCalled()
Expected number of calls: >= 1
Received number of calls: 0
```

#### Solutions:

1. **Mock Setup Verification**
```typescript
// Bad
const mock = jest.fn()
expect(mock).toHaveBeenCalled()

// Good
const mock = jest.fn()
console.log('Mock setup:', mock.getMockName())
await waitFor(() => {
  expect(mock).toHaveBeenCalled()
})
```

2. **Mock Implementation**
```typescript
// Bad
jest.mock('./service')

// Good
jest.mock('./service', () => ({
  someFunction: jest.fn().mockResolvedValue({ data: 'test' })
}))
```

### 5. Provider Context Issues

#### Problem:
```
Error: Could not find react-query context
```

#### Solutions:

1. **Proper Provider Setup**
```typescript
// Bad
render(<Component />)

// Good
const queryClient = new QueryClient()
render(
  <QueryClientProvider client={queryClient}>
    <Component />
  </QueryClientProvider>
)
```

2. **Multiple Providers**
```typescript
// Create a wrapper utility
const AllTheProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Use in tests
render(<Component />, { wrapper: AllTheProviders })
```

### 6. Event Handling Issues

#### Problem:
```
Error: Unable to fire event - target must be an Element
```

#### Solutions:

1. **Proper Event Target**
```typescript
// Bad
fireEvent.click(screen.queryByRole('button'))

// Good
const button = screen.getByRole('button')
if (button) {
  fireEvent.click(button)
}
```

2. **User Event vs FireEvent**
```typescript
// Bad
fireEvent.change(input, { target: { value: 'test' } })

// Good
await userEvent.type(input, 'test')
```

### 7. Memory Leak Issues

#### Problem:
```
Warning: Can't perform a React state update on an unmounted component
```

#### Solutions:

1. **Proper Cleanup**
```typescript
// In component
useEffect(() => {
  return () => {
    cleanup()
  }
}, [])

// In tests
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})
```

2. **Reset Handlers**
```typescript
afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
```

## Debugging Tools

### 1. Component Structure
```typescript
// Print full component tree
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Log accessible roles
console.log(prettyDOM(container))
```

### 2. Mock Analysis
```typescript
// Inspect mock calls
const mock = jest.fn()
// ... test code ...
console.log({
  calls: mock.mock.calls,
  results: mock.mock.results,
  contexts: mock.mock.contexts
})
```

### 3. Async State
```typescript
// Debug async updates
await waitFor(() => {
  console.log('Current DOM:', screen.queryByText('Loading'))
  console.log('Mock state:', mock.mock.calls.length)
  expect(screen.getByText('Done')).toBeInTheDocument()
})
```

## Performance Tips

### 1. Query Optimization
```typescript
// Bad - Slow
screen.getByText('Submit')

// Good - Fast
screen.getByRole('button', { name: /submit/i })
```

### 2. Mock Response Time
```typescript
// Bad
global.fetch = jest.fn().mockImplementation(() =>
  new Promise(resolve => setTimeout(resolve, 1000))
)

// Good
global.fetch = jest.fn().mockResolvedValue({ ok: true })
```

### 3. Test Isolation
```typescript
// Bad
describe('Component', () => {
  beforeAll(() => {
    // Heavy setup
  })
  
  it('test 1', () => {})
  it('test 2', () => {})
})

// Good
describe('Component', () => {
  beforeEach(() => {
    // Minimal setup
  })
  
  it('test 1', () => {})
  it('test 2', () => {})
})
``` 