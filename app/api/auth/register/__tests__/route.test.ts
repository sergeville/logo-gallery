import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { connectToDatabase } from '@/app/lib/db'
import { POST } from '../route'

const mockDb = {
  collection: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    insertOne: jest.fn(),
  }),
}

jest.mock('@/app/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ 
    db: mockDb, 
    client: {} as MongoClient 
  })
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}))

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('registers a new user successfully', async () => {
    const mockRequest = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    mockDb.collection().findOne.mockResolvedValueOnce(null)
    mockDb.collection().insertOne.mockResolvedValueOnce({ insertedId: 'userId' })

    const response = await POST(mockRequest)
    expect(response.status).toBe(201)
  })

  it('returns error if user already exists', async () => {
    const mockRequest = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    mockDb.collection().findOne.mockResolvedValueOnce({ _id: 'existingId' })

    const response = await POST(mockRequest)
    expect(response.status).toBe(400)
  })

  it('validates required fields', async () => {
    const mockRequest = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        password: '',
        name: '',
      }),
    })

    const response = await POST(mockRequest)
    expect(response.status).toBe(400)
  })
}) 