import { ObjectId } from 'mongodb';

export interface TestUser {
  _id?: ObjectId;
  email: string;
  username: string;
  name: string;
  password: string;
  profile: {
    website?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
  };
  role: string;
  status: string;
  lastLogin: Date;
}

export interface TestLogo {
  _id?: ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  ownerId: ObjectId;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  metadata: {
    version: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  colors?: string[];
}

export function generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    _id: new ObjectId(),
    email: `test${Math.random().toString(36).substring(7)}@test.com`,
    username: `testuser${Math.random().toString(36).substring(7)}`,
    name: 'Test User',
    password: 'TestPassword123!',
    profile: {
      website: 'https://test.com',
      avatarUrl: 'https://test.com/avatar.jpg',
      bio: 'Test bio',
      location: 'Test City'
    },
    role: 'user',
    status: 'active',
    lastLogin: new Date(),
    ...overrides
  };
}

export function generateTestLogo(ownerId: ObjectId, overrides: Partial<TestLogo> = {}): TestLogo {
  return {
    _id: new ObjectId(),
    name: `Test Logo ${Math.random().toString(36).substring(7)}`,
    description: 'Test logo description',
    imageUrl: 'https://test.com/logo.png',
    thumbnailUrl: 'https://test.com/logo-thumb.png',
    ownerId,
    category: 'Technology',
    tags: ['logo', 'test'],
    dimensions: {
      width: 800,
      height: 600
    },
    fileSize: 250 * 1024,
    fileType: 'png',
    metadata: {
      version: '1.0.0',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    ...overrides
  };
}

export function generateTestUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, () => generateTestUser(overrides));
}

export function generateTestLogos(count: number, ownerId: ObjectId, overrides: Partial<TestLogo> = {}): TestLogo[] {
  return Array.from({ length: count }, () => generateTestLogo(ownerId, overrides));
} 