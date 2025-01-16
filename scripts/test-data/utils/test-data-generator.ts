import { ObjectId } from 'mongodb';

export interface TestUser {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestLogo {
  _id?: ObjectId;
  name: string;
  url: string;
  description: string;
  ownerId: ObjectId;
  tags?: string[];
  rating?: number;
  votes?: number;
  colors?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  fileType?: string;
  metadata?: {
    version: string;
    status: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export function generateTestUser(overrides = {}): TestUser {
  return {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    bio: 'Test user bio',
    avatarUrl: 'https://example.com/avatar.png',
    website: 'https://example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function generateTestLogo(ownerId?: ObjectId, overrides = {}): TestLogo {
  return {
    name: 'Test Logo',
    url: 'https://example.com/logo.png',
    description: 'A test logo',
    ownerId: ownerId || new ObjectId(),
    tags: ['minimal', 'modern'],
    rating: 4,
    votes: 10,
    colors: ['#000000', '#FFFFFF'],
    dimensions: {
      width: 100,
      height: 100
    },
    fileType: 'png',
    metadata: {
      version: '1.0',
      status: 'active'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
} 