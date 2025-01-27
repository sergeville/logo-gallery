import React from 'react'
import { render } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import type { ClientUser, ClientLogo } from '../../lib/types'

/**
 * Test utilities for the Logo Gallery application.
 * For detailed information about the ownership model and relationships between
 * users and logos, see docs/OWNERSHIP.md
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

/**
 * Generates a test user with a consistent ID.
 * This ID is important as it's used to link users with their logos via the ownerId field.
 * See docs/OWNERSHIP.md for detailed information about the ownership model.
 */
export function generateTestUser(overrides: Partial<ClientUser> = {}): ClientUser {
  return {
    id: 'test-user-id', // This ID is referenced by logo.ownerId to establish ownership
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function generateTestSession(overrides: Partial<Session> = {}): Session {
  return {
    user: generateTestUser(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

/**
 * Generates a test logo with ownership information.
 * By default, the logo's ownerId matches the ID of the test user (test-user-id).
 * This relationship is crucial for testing ownership-based functionality.
 */
export function generateTestLogo(overrides: Partial<ClientLogo> = {}): ClientLogo {
  return {
    id: 'test-logo-id',
    name: 'Test Logo',
    description: 'A test logo',
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/logo-thumb.png',
    url: 'https://example.com/logo',
    tags: ['test'],
    ownerName: 'Test User',
    ownerId: 'test-user-id', // Matches the ID of the test user by default
    category: 'test',
    dimensions: {
      width: 100,
      height: 100,
    },
    fileSize: 1024,
    fileType: 'image/png',
    votes: 0,
    averageRating: 0,
    totalVotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    session = generateTestSession(),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export function createMockFile(name = 'test.png', type = 'image/png', size = 1024): File {
  return new File(['test'], name, { type })
}

export async function waitForPromises() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

export default renderWithProviders 