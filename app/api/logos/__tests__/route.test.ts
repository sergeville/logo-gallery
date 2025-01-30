import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/lib/auth.config';
import dbConnect from '@/app/lib/db-config';
import { Logo } from '@/app/lib/models/logo';
import mongoose from 'mongoose';
import { GET } from '../route';

jest.mock('next-auth');
jest.mock('@/app/lib/db-config');
jest.mock('@/app/lib/auth.config', () => ({
  authConfig: {}
}));

jest.mock('mongoose', () => {
  const mockMongoose = {
    Schema: jest.fn(),
    model: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    Collection: jest.fn().mockImplementation(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn()
    }))
  };
  
  mockMongoose.Collection.prototype = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn()
  };

  return mockMongoose;
});

const mockLogo = {
  _id: '1',
  title: 'Logo 1',
  description: 'Description 1',
  imageUrl: 'http://example.com/1.png',
  thumbnailUrl: 'http://example.com/thumb1.png',
  userId: 'user1',
  ownerName: 'User One',
  totalVotes: 5,
  votes: [],
  createdAt: new Date('2024-01-01'),
  uploadedAt: new Date('2024-01-01')
};

jest.mock('@/app/lib/models/logo', () => {
  const mockMethods = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([])
  };

  return {
    Logo: {
      find: jest.fn().mockImplementation(() => mockMethods),
      countDocuments: jest.fn().mockResolvedValue(0)
    }
  };
});

describe('GET /api/logos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user123' }
    });
    (Logo.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });
  });

  it('returns logos with pagination', async () => {
    const mockLogos = [
      {
        _id: '1',
        title: 'Logo 1',
        description: 'Description 1',
        imageUrl: 'image1.jpg',
        thumbnailUrl: 'thumb1.jpg',
        userId: 'user1',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Logo 2',
        description: 'Description 2',
        imageUrl: 'image2.jpg',
        thumbnailUrl: 'thumb2.jpg',
        userId: 'user2',
        createdAt: new Date().toISOString()
      }
    ];

    (Logo.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockLogos)
    });

    const response = await GET(
      new NextRequest('http://localhost:3000/api/logos?page=1&limit=10')
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.logos).toHaveLength(2);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.hasMore).toBe(false);
  });

  it('handles search query', async () => {
    const searchQuery = 'test';
    await GET(
      new NextRequest(`http://localhost:3000/api/logos?search=${searchQuery}`)
    );

    expect(Logo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { title: expect.any(Object) },
          { description: expect.any(Object) }
        ]
      })
    );
  });

  it('handles sort parameter', async () => {
    await GET(
      new NextRequest('http://localhost:3000/api/logos?sortBy=date&sortOrder=desc')
    );

    const mockFind = Logo.find as jest.Mock;
    const mockSort = mockFind().sort;
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('handles database errors', async () => {
    (Logo.find as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await GET(
      new NextRequest('http://localhost:3000/api/logos')
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch logos');
  });
}); 