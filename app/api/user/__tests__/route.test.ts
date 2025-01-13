import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/app/lib/db';
import { Collection, Db, WithId, Document } from 'mongodb';

jest.mock('next-auth');
jest.mock('@/lib/db-config');

interface User {
  _id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

type MockCollection = Partial<Collection<User>>;

type MockDb = {
  collection: jest.MockedFunction<(name: string) => Collection<Document>>;
}

describe('User API', () => {
  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  const mockCollection: MockCollection = {
    findOne: jest.fn().mockResolvedValue(mockUser as WithId<User>)
  };

  const mockDb: MockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectToDatabase as jest.Mock).mockResolvedValue(mockDb as unknown as Db);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns user data when authenticated', async () => {
    const response = await GET();
    const data = await response.json();

    const { password, ...expectedUser } = mockUser;

    expect(response.status).toBe(200);
    expect(data).toEqual(expectedUser);
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ 
      success: false, 
      message: 'Not authenticated' 
    });
  });
  it('returns 404 when user not found', async () => {
    const notFoundDb: MockDb = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null as WithId<User> | null)
      } as MockCollection)
    };
    (connectToDatabase as jest.Mock).mockResolvedValue(notFoundDb as unknown as Db);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ 
      success: false, 
      message: 'User not found' 
    });
  });
  it('handles database errors', async () => {
    (connectToDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ 
      success: false, 
      message: 'Internal server error' 
    });
  });
}); 