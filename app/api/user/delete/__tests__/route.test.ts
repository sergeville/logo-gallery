import { Collection, Db, DeleteResult } from 'mongodb'
import { jest } from '@jest/globals'
import { DELETE } from '../route'
import { connectToDatabase } from '@/app/lib/db'
import { getServerSession } from 'next-auth'
import { User } from '@/app/lib/types'

jest.mock('@/app/lib/db')
jest.mock('next-auth')

type MockSession = {
  user?: {
    email?: string;
    name?: string;
  } | null;
} | null;

describe('DELETE /api/user/delete', () => {
  let mockCollection: jest.Mocked<Collection<User>>
  let mockDb: jest.Mocked<Db>

  beforeEach(() => {
    mockCollection = {
      deleteOne: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Collection<User>>

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>

    (getServerSession as jest.Mock).mockImplementation((): Promise<MockSession> => Promise.resolve(null));
    (connectToDatabase as jest.Mock).mockImplementation(() => Promise.resolve({ db: mockDb }));

    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve(null));

    const request = new Request('http://localhost/api/user/delete')
    const response = await DELETE(request)
    
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ message: 'Not authenticated' })
  })

  it('returns 400 when user email is missing', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: {}
    }));

    const request = new Request('http://localhost/api/user/delete')
    const response = await DELETE(request)
    
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'User email is required' })
  })

  it('returns 404 when user is not found', async () => {
    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: { email: 'test@example.com' }
    }));
    mockCollection.findOne.mockResolvedValue(null)

    const request = new Request('http://localhost/api/user/delete')
    const response = await DELETE(request)
    
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: 'User not found' })
  })

  it('deletes user successfully', async () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    };

    (getServerSession as jest.Mock).mockImplementation(() => Promise.resolve({
      user: { email: 'test@example.com' }
    }));
    mockCollection.findOne.mockResolvedValue(mockUser as User);
    mockCollection.deleteOne.mockResolvedValue({
      acknowledged: true,
      deletedCount: 1
    });

    const request = new Request('http://localhost/api/user/delete')
    const response = await DELETE(request)
    
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'User deleted successfully' })
    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
}) 