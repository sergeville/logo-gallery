import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { connectToDatabase } from '@/app/lib/db'
import { Db, Collection, Document } from 'mongodb'
import bcrypt from 'bcrypt'
import { LOCALHOST_URL } from '@/config/constants'

jest.mock('@/app/lib/db')
jest.mock('bcrypt')

interface MockCollection extends Partial<Collection<Document>> {
  findOne: jest.Mock;
  insertOne: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
}

const mockCollection: MockCollection = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn()
}

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
  databaseName: 'test',
  options: {},
  readConcern: {},
  writeConcern: {},
  readPreference: {}
} as unknown as Db

beforeEach(() => {
  jest.clearAllMocks()
  ;(connectToDatabase as jest.Mock).mockResolvedValue({ db: mockDb, client: {} })
  ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
})

describe('Login API', () => {
  function createMockRequest(body: any) {
    return new NextRequest(`${LOCALHOST_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns 400 if email is missing', async () => {
    const req = createMockRequest({ password: 'password123' })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Email and password are required')
  })

  it('returns 400 if password is missing', async () => {
    const req = createMockRequest({ email: 'test@example.com' })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Email and password are required')
  })

  it('returns 401 if user is not found', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null)
    const req = createMockRequest({ email: 'test@example.com', password: 'password123' })
    const response = await POST(req)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.message).toBe('Invalid credentials')
  })

  it('returns 200 and user data on successful login', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Mocked hashed password
      name: 'Test User'
    }

    mockCollection.findOne.mockResolvedValueOnce(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)

    const req = createMockRequest({ email: 'test@example.com', password: 'password123' })
    const response = await POST(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(mockUser.email)
  })
}) 