import { Collection, Db } from 'mongodb';
import { jest } from '@jest/globals';
import { GET } from '@/app/api/user/route';
import { connectToDatabase } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { User } from '@/app/lib/types';

jest.mock('@/app/lib/db');
jest.mock('next-auth');

type MockSession = {
  user?: {
    email?: string;
    name?: string;
  } | null;
} | null;

describe('GET /api/user', () => {
  let mockCollection: jest.Mocked<Collection<User>>;
  let mockDb: jest.Mocked<Db>;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Collection<User>>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    (getServerSession as jest.Mock).mockImplementation((): Promise<MockSession> => Promise.resolve(null));
    (connectToDatabase as jest.Mock).mockImplementation(() => Promise.resolve({ db: mockDb }));

    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve(null));

    const request = new Request('http://localhost/api/user');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Not authenticated' });
  });

  it('returns 400 when user email is missing', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: {}
    }));

    const request = new Request('http://localhost/api/user');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'User email is required' });
  });

  it('returns 404 when user is not found', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: { email: 'test@example.com' }
    }));
    mockCollection.findOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/user');
    const response = await GET(request);
    
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'User not found' });
  });

  it('returns user data without password', async () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword'
    };

    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: { email: 'test@example.com' }
    }));
    mockCollection.findOne.mockResolvedValue(mockUser as User);

    const request = new Request('http://localhost/api/user');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toEqual({
      email: 'test@example.com',
      name: 'Test User'
    });
    expect(data.user.password).toBeUndefined();
  });
}); 