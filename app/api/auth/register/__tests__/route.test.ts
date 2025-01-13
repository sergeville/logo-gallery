import { POST } from '../route'
import { connectToDatabase } from '@/app/lib/db'
import bcrypt from 'bcryptjs'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { Db, Collection, InsertOneResult, WithId, ObjectId } from 'mongodb'

jest.mock('@/app/lib/db')
jest.mock('bcryptjs')

interface User {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

type MockCollection = {
  findOne: jest.MockedFunction<(filter?: any) => Promise<WithId<User> | null>>;
  insertOne: jest.MockedFunction<(doc: any) => Promise<{ insertedId: string; acknowledged: boolean }>>;
}

type MockDb = {
  collection: (name: string) => MockCollection;
  databaseName: string;
}

describe('Registration API', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User'
  }

  const mockDb = {
    collection: () => {
      const collection: MockCollection = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)) as jest.MockedFunction<(filter?: any) => Promise<WithId<User> | null>>,
        insertOne: jest.fn().mockImplementation(() => Promise.resolve({ insertedId: 'mockId123', acknowledged: true })) as jest.MockedFunction<(doc: any) => Promise<{ insertedId: string; acknowledged: boolean }>>
      };
      return collection;
    },
    databaseName: 'testdb'
  } as MockDb;

  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve('hashedPassword'))
    jest.mocked(connectToDatabase).mockResolvedValue(mockDb as unknown as Db)
  })

  it('successfully registers a new user', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUser)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      success: true,
      message: 'User registered successfully'
    })
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10)
  })

  it('validates required fields', async () => {
    const testCases = [
      { body: {}, missing: 'Email' },
      { body: { email: mockUser.email }, missing: 'Password' },
      { body: { email: mockUser.email, password: mockUser.password }, missing: 'Name' }
    ]

    for (const testCase of testCases) {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.body)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: `${testCase.missing} is required`
      })
    }
  })

  it('validates email format', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...mockUser, email: 'invalid-email' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      success: false,
      message: 'Invalid email format'
    })
  })

  it('prevents duplicate email registration', async () => {
    const mockDbWithExistingUser = {
      ...mockDb,
      collection: () => {
        const collection: MockCollection = {
          findOne: jest.fn().mockImplementation((filter?: any) => Promise.resolve({ ...mockUser, _id: new ObjectId('507f1f77bcf86cd799439011'), createdAt: new Date(), updatedAt: new Date() } as WithId<User>)) as jest.MockedFunction<(filter?: any) => Promise<WithId<User> | null>>,
          insertOne: jest.fn()
        };
        return collection;
      }
    } as MockDb;
    jest.mocked(connectToDatabase).mockResolvedValue(mockDbWithExistingUser as unknown as Db)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUser)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data).toEqual({
      success: false,
      message: 'Email already registered'
    })
  })

  it('handles database errors', async () => {
    jest.mocked(connectToDatabase).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUser)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      message: 'Failed to register user'
    })
  })
}) 