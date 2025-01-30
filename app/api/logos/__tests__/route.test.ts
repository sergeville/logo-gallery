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

describe('Logos API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbConnect as jest.Mock).mockResolvedValue(undefined);
    (getServerSession as jest.Mock).mockResolvedValue(null);

    // Reset mock implementations for each test
    const mockMethods = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    };
    (Logo.find as jest.Mock).mockImplementation(() => mockMethods);
    (Logo.countDocuments as jest.Mock).mockResolvedValue(0);
  });

  it('should return all logos with pagination', async () => {
    const url = new URL('http://localhost:3000/api/logos?page=1&limit=10');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;
    
    const mockMethods = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockLogo])
    };
    (Logo.find as jest.Mock).mockImplementation(() => mockMethods);
    (Logo.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.logos).toHaveLength(1);
    expect(data.logos[0]).toEqual({
      _id: mockLogo._id,
      name: mockLogo.title,
      description: mockLogo.description,
      imageUrl: mockLogo.imageUrl,
      thumbnailUrl: mockLogo.thumbnailUrl,
      userId: mockLogo.userId,
      ownerName: mockLogo.ownerName,
      totalVotes: mockLogo.totalVotes,
      votes: mockLogo.votes,
      createdAt: mockLogo.createdAt
    });
    expect(data.pagination).toEqual({
      current: 1,
      total: 1,
      hasMore: false
    });
    expect(dbConnect).toHaveBeenCalled();
  });

  it('handles empty logo list', async () => {
    const url = new URL('http://localhost:3000/api/logos?page=1&limit=10');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    (Logo.find as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });
    (Logo.countDocuments as jest.Mock).mockResolvedValueOnce(0);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.logos).toEqual([]);
    expect(data.pagination).toEqual({
      current: 1,
      total: 0,
      hasMore: false
    });
    expect(dbConnect).toHaveBeenCalled();
  });

  it('handles database errors', async () => {
    const url = new URL('http://localhost:3000/api/logos?page=1&limit=10');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    (Logo.find as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockRejectedValue(new Error('Database error'))
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch logos' });
  });

  it('validates pagination parameters', async () => {
    const url = new URL('http://localhost:3000/api/logos?page=1&limit=0');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    const mockLogo = {
      _id: '123',
      title: 'Test Logo',
      description: 'Test Description',
      imageUrl: 'test.jpg',
      thumbnailUrl: 'thumb.jpg',
      userId: '456',
      ownerName: 'Test User',
      totalVotes: 0,
      votes: [],
      createdAt: new Date('2024-01-01'),
      uploadedAt: new Date('2024-01-01')
    };

    Logo.find = jest.fn().mockReturnThis();
    Logo.select = jest.fn().mockReturnThis();
    Logo.sort = jest.fn().mockReturnThis();
    Logo.skip = jest.fn().mockReturnThis();
    Logo.limit = jest.fn().mockReturnThis();
    Logo.lean = jest.fn().mockResolvedValue([mockLogo]);
    Logo.countDocuments = jest.fn().mockResolvedValue(0);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.logos).toEqual([{
      _id: '123',
      name: 'Test Logo',
      description: 'Test Description',
      imageUrl: 'test.jpg',
      thumbnailUrl: 'thumb.jpg',
      userId: '456',
      ownerName: 'Test User',
      totalVotes: 0,
      votes: [],
      createdAt: mockLogo.createdAt
    }]);
    expect(data.pagination).toEqual({
      current: 1,
      total: 0,
      hasMore: false
    });
  });

  it('handles search by title', async () => {
    const url = new URL('http://localhost:3000/api/logos?search=test');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    const mockLogo = {
      _id: '123',
      title: 'Test Logo',
      description: 'Some Description',
      imageUrl: 'test.jpg',
      thumbnailUrl: 'thumb.jpg',
      userId: '456',
      ownerName: 'Test User',
      totalVotes: 0,
      votes: [],
      createdAt: new Date('2024-01-01'),
      uploadedAt: new Date('2024-01-01')
    };

    const mockMethods = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockLogo])
    };

    Logo.find = jest.fn().mockImplementation(() => mockMethods);
    Logo.countDocuments = jest.fn().mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Logo.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: 'test', $options: 'i' } },
        { description: { $regex: 'test', $options: 'i' } },
        { tags: { $regex: 'test', $options: 'i' } },
        { ownerName: { $regex: 'test', $options: 'i' } }
      ]
    });
    expect(data.logos).toHaveLength(1);
    expect(data.logos[0].name).toBe('Test Logo');
  });

  it('handles search by description', async () => {
    const url = new URL('http://localhost:3000/api/logos?search=unique');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    const mockLogo = {
      _id: '123',
      title: 'Logo Title',
      description: 'Unique Description',
      imageUrl: 'test.jpg',
      thumbnailUrl: 'thumb.jpg',
      userId: '456',
      ownerName: 'Test User',
      totalVotes: 0,
      votes: [],
      createdAt: new Date('2024-01-01'),
      uploadedAt: new Date('2024-01-01')
    };

    const mockMethods = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockLogo])
    };

    Logo.find = jest.fn().mockImplementation(() => mockMethods);
    Logo.countDocuments = jest.fn().mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Logo.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: 'unique', $options: 'i' } },
        { description: { $regex: 'unique', $options: 'i' } },
        { tags: { $regex: 'unique', $options: 'i' } },
        { ownerName: { $regex: 'unique', $options: 'i' } }
      ]
    });
    expect(data.logos).toHaveLength(1);
    expect(data.logos[0].description).toBe('Unique Description');
  });

  it('handles combined search with userId filter', async () => {
    const url = new URL('http://localhost:3000/api/logos?search=test&userId=456');
    const request = {
      nextUrl: url,
      url: url.toString()
    } as NextRequest;

    const mockLogo = {
      _id: '123',
      title: 'Test Logo',
      description: 'Some Description',
      imageUrl: 'test.jpg',
      thumbnailUrl: 'thumb.jpg',
      userId: '456',
      ownerName: 'Test User',
      totalVotes: 0,
      votes: [],
      createdAt: new Date('2024-01-01'),
      uploadedAt: new Date('2024-01-01')
    };

    const mockMethods = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockLogo])
    };

    Logo.find = jest.fn().mockImplementation(() => mockMethods);
    Logo.countDocuments = jest.fn().mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Logo.find).toHaveBeenCalledWith({
      $and: [
        { userId: '456' },
        {
          $or: [
            { title: { $regex: 'test', $options: 'i' } },
            { description: { $regex: 'test', $options: 'i' } },
            { tags: { $regex: 'test', $options: 'i' } },
            { ownerName: { $regex: 'test', $options: 'i' } }
          ]
        }
      ]
    });
    expect(data.logos).toHaveLength(1);
    expect(data.logos[0].userId).toBe('456');
  });
}); 