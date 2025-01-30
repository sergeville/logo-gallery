import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/app/contexts/AuthContext';

// Mock session data
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock logo data
export const mockLogo = {
  _id: 'test-logo-id',
  userId: 'test-user-id',
  title: 'Test Logo',
  description: 'A test logo description',
  imageUrl: '/test-image.jpg',
  thumbnailUrl: '/test-thumbnail.jpg',
  originalSize: 1000,
  optimizedSize: 500,
  width: 800,
  height: 600,
  format: 'image/jpeg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  votes: 0,
  votedBy: [],
};

// Custom render function with providers
function render(
  ui: React.ReactElement,
  {
    session = mockSession,
    theme = 'light',
    ...options
  }: {
    session?: any;
    theme?: string;
    [key: string]: any;
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };

// Test data generators
export const createMockLogo = (overrides = {}) => ({
  _id: 'test-logo-id',
  title: 'Test Logo',
  description: 'A test logo description',
  imageUrl: '/test.jpg',
  thumbnailUrl: '/test-thumbnail.jpg',
  originalSize: 1024 * 1024, // 1MB
  optimizedSize: 512 * 1024, // 512KB
  createdAt: new Date().toISOString(),
  totalVotes: 10,
  userId: 'test-user-id',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Test request helpers
export const createMockRequest = (method: string, body?: any) => {
  return new Request('http://localhost:3000', {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
};

// MongoDB test helpers
export const createMockCollection = () => ({
  findOne: jest.fn(),
  find: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
  }),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
}); 