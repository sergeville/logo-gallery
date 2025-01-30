import { User } from '@/app/types';
import { ObjectId } from 'mongodb';

export const mockUserBase: Partial<User> = {
  _id: new ObjectId('507f1f77bcf86cd799439012'),
  email: 'test@example.com',
  username: 'testuser',
  profile: {
    bio: 'Test user bio',
    website: 'https://example.com',
    avatar: 'https://example.com/avatar.png',
    location: 'Test Location',
    skills: ['testing', 'development']
  },
  createdAt: new Date('2024-01-01T00:00:00.000Z')
};

export const mockAdminUser: Partial<User> = {
  ...mockUserBase,
  _id: new ObjectId('507f1f77bcf86cd799439013'),
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com',
  username: 'admin',
  role: 'admin'
};

export const mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated'
};

export const mockAuthenticatedSession = {
  data: {
    user: {
      ...mockUserBase,
      id: mockUserBase._id?.toString()
    },
    expires: '2024-12-31T23:59:59.999Z'
  },
  status: 'authenticated'
};

export const mockAdminSession = {
  data: {
    user: {
      ...mockAdminUser,
      id: mockAdminUser._id?.toString()
    },
    expires: '2024-12-31T23:59:59.999Z'
  },
  status: 'authenticated'
};

export const generateMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  ...mockUserBase,
  ...overrides,
  _id: overrides._id || new ObjectId(),
  email: overrides.email || `test${Date.now()}@example.com`,
  username: overrides.username || `testuser${Date.now()}`
}); 