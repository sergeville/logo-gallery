import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/app/contexts/AuthContext';

// Mock session data
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '2024-12-31',
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

// Custom render function
function render(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider session={mockSession}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
    user: userEvent.setup(),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { render, userEvent };

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

// Common test utilities
export const mockFetch = (data: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    })
  ) as jest.Mock;
};

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

export const mockUseSession = (status = 'authenticated', data = mockSession) => {
  const useSession = jest.requireMock('next-auth/react').useSession;
  useSession.mockReturnValue({ data, status });
};

export const mockUseAuth = (user = null, loading = false, error = null) => {
  const useAuth = jest.requireMock('@/app/hooks/useAuth').useAuth;
  useAuth.mockReturnValue({
    user,
    loading,
    error,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  });
}; 