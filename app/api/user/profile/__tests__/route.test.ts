import { jest } from '@jest/globals';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/lib/db';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { GET, PUT } from '../route';

jest.mock('@/app/lib/db');
jest.mock('next/headers');

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
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection>;
  let mockRequest: MockRequest;
  let mockUserId: ObjectId;

  beforeEach(() => {
    mockUserId = new ObjectId();
    
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    } as unknown as jest.Mocked<Collection>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    } as unknown as jest.Mocked<Db>;

    const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;
    mockConnectToDatabase.mockResolvedValue({
      client: {} as MongoClient,
      db: mockDb
    });

    mockRequest = {
      json: jest.fn().mockImplementation(async () => ({})) as unknown as JsonFn
    } as MockRequest;

    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: mockUserId.toString() })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile API', () => {
    it('returns user profile when found', async () => {
      const mockUser: MockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com'
      };

      mockCollection.findOne.mockResolvedValueOnce(mockUser);

      const response = await GET(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data._id).toEqualObjectId(mockUserId);
      expect(data.name).toBe('Test User');
      expect(data.email).toBe('test@example.com');
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      
      // Verify findOne was called
      expect(mockCollection.findOne).toHaveBeenCalled();
      const findOneCall = mockCollection.findOne.mock.calls[0][0];
      if (!findOneCall?._id) {
        throw new Error('findOne was not called with _id');
      }
      expect(findOneCall._id.toString()).toBe(mockUserId.toString());
    });

    it('returns 404 when user not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const response = await GET(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });

    it('updates user profile successfully', async () => {
      const mockUser: MockUser = {
        _id: mockUserId,
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockRequest.json = jest.fn().mockImplementation(async () => ({
        name: 'Updated Name',
        email: 'updated@example.com'
      })) as unknown as JsonFn;

      mockCollection.findOne.mockResolvedValueOnce(mockUser);
      mockCollection.updateOne.mockResolvedValueOnce({
        modifiedCount: 1
      } as any);
      mockCollection.findOne.mockResolvedValueOnce(mockUser);

      const response = await PUT(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data._id).toEqualObjectId(mockUserId);
      expect(data.name).toBe('Updated Name');
      expect(data.email).toBe('updated@example.com');

      const updateOneCall = mockCollection.updateOne.mock.calls[0];
      if (!updateOneCall?.[0]?._id) {
        throw new Error('updateOne was not called with _id');
      }
      expect(updateOneCall[0]._id.toString()).toBe(mockUserId.toString());
      
      const updateFilter = updateOneCall[1] as { $set: Record<string, unknown> };
      expect(updateFilter.$set).toEqual(expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@example.com',
        updatedAt: expect.any(Date)
      }));
    });

    it('returns 404 when user not found for update', async () => {
      mockRequest.json = jest.fn().mockImplementation(async () => ({ name: 'Test' })) as unknown as JsonFn;
      mockCollection.findOne.mockResolvedValueOnce(null);

      const response = await PUT(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });

    it('returns 400 for invalid update data', async () => {
      const invalidUser = {
        name: '', // Invalid - too short
        email: 'invalid-email' // Invalid format
      };

      mockRequest.json = jest.fn().mockImplementation(async () => invalidUser) as unknown as JsonFn;

      const response = await PUT(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
      expect(data.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            code: 'INVALID_NAME_LENGTH'
          }),
          expect.objectContaining({
            field: 'email',
            code: 'INVALID_EMAIL_FORMAT'
          })
        ])
      );
    });
  });
}); 