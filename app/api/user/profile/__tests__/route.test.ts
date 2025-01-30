import { jest } from '@jest/globals';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GET, PUT } from '@/app/api/user/profile/route';
import { getServerSession } from 'next-auth';
import { User } from '@/app/lib/models/user';
import dbConnect from '@/app/lib/db-config';

jest.mock('@/app/lib/db');
jest.mock('next/headers');
jest.mock('next-auth');
jest.mock('@/app/lib/db-config');
jest.mock('@/app/lib/models/user');

interface MockUser {
  _id: ObjectId;
  name: string;
  email: string;
}

type JsonFn = () => Promise<any>;

interface MockRequest extends Omit<NextRequest, 'json'> {
  json: JsonFn;
}

// Custom matcher for ObjectId
expect.extend({
  toEqualObjectId(received: ObjectId, expected: ObjectId) {
    const pass = received.toString() === expected.toString();
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to equal ${expected}`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualObjectId(expected: ObjectId): R;
    }
  }
}

describe('User Profile API', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user123' }
    });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (dbConnect as jest.Mock).mockResolvedValue({
      db: {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockUser),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
        })
      }
    });
  });

  describe('GET /api/user/profile', () => {
    it('returns 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const response = await GET(new NextRequest('http://localhost:3000'));
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns user profile if authenticated', async () => {
      const response = await GET(new NextRequest('http://localhost:3000'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toEqual(mockUser);
    });

    it('handles database errors', async () => {
      (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await GET(new NextRequest('http://localhost:3000'));
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch user profile');
    });
  });

  describe('PUT /api/user/profile', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      image: 'https://example.com/new-avatar.jpg'
    };

    it('returns 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const response = await PUT(
        new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('updates user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedUser);

      const response = await PUT(
        new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toEqual(updatedUser);
    });

    it('handles validation errors', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const response = await PUT(
        new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify(invalidData)
        })
      );
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid email format');
    });

    it('handles database errors during update', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await PUT(
        new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to update user profile');
    });
  });
}); 