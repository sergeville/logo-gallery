import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Create test server instance
export const server = setupServer(...handlers)

// Export individual handlers for specific test overrides
export { handlers }

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close()) 