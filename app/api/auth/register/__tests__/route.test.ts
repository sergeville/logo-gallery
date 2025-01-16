import { Collection, Document, MongoClient, WithId, ObjectId } from 'mongodb';
import { User } from '@/app/lib/types';
import { connectToDatabase } from '@/app/lib/db';
import bcrypt from 'bcrypt';
import { POST } from '../route';

interface MockCollection {
  findOne: jest.MockedFunction<(filter?: any) => Promise<WithId<User> | null>>;
  insertOne: jest.MockedFunction<(doc: any) => Promise<{ insertedId: string; acknowledged: boolean }>>;
}

const mockCollection = {
  findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
  insertOne: jest.fn().mockImplementation(() => Promise.resolve({ insertedId: 'mockId123', acknowledged: true }))
} as MockCollection;

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection)
};

jest.mock('@/app/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ db: mockDb, client: {} as MongoClient })
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123')
}));

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.findOne.mockClear();
    mockCollection.insertOne.mockClear();
  });

  it('successfully registers a new user', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      success: true,
      message: 'User registered successfully',
      userId: 'mockId123'
    });
  });

  it('prevents duplicate email registration', async () => {
    mockCollection.findOne.mockResolvedValueOnce({
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'Existing User',
      createdAt: new Date(),
      updatedAt: new Date()
    } as WithId<User>);

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      message: 'Email already registered'
    });
  });
}); 