import { useSession } from 'next-auth/react'

export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
}

export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

export const mockAuthenticatedSession = {
  data: mockSession,
  status: 'authenticated' as const,
}

export const mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated' as const,
}

export const setMockSession = (
  sessionData: typeof mockAuthenticatedSession | typeof mockUnauthenticatedSession = mockUnauthenticatedSession
) => {
  (useSession as jest.Mock).mockReturnValue(sessionData)
}

export const mockLogo = {
  _id: 'test-logo-1',
  title: 'Test Logo',
  description: 'A test logo',
  imageUrl: '/test-logo.png',
  thumbnailUrl: '/test-thumbnail.jpg',
  responsiveUrls: {
    small: '/test-logo-small.jpg',
    medium: '/test-logo-medium.jpg',
    large: '/test-logo-large.jpg',
  },
  userId: mockUser.id,
  fileSize: 1024 * 1024, // 1MB
  optimizedSize: 512 * 1024, // 512KB
  compressionRatio: '50%',
  totalVotes: 0,
  createdAt: new Date().toISOString(),
}

export const createMockLogoProps = (overrides = {}) => ({
  ...mockLogo,
  ...overrides,
}) 