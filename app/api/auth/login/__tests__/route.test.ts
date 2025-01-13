import { NextRequest } from 'next/server'
import { POST } from '../route'
import { getUsers } from '@/app/lib/store'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock the store functions
jest.mock('@/app/lib/store', () => ({
  getUsers: jest.fn(),
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}))

// Mock Next.js cookies and headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => null),
    set: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

describe('Login API', () => {
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUsers as jest.Mock).mockReturnValue([mockUser])
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(jwt.sign as jest.Mock).mockReturnValue('mock_token')
  })

  it('returns 400 if username/email is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'Password123!' }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.message).toBe('Username or email is required')
  })

  it('returns 400 if password is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.message).toBe('Password is required')
  })

  it('returns 401 if user is not found', async () => {
    ;(getUsers as jest.Mock).mockReturnValue([])

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'nonexistent',
        password: 'Password123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid credentials')
  })

  it('returns 401 if password is incorrect', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'WrongPassword123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid credentials')
  })

  it('successfully logs in with username', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'Password123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user).toEqual({
      username: mockUser.username,
      email: mockUser.email,
    })
    expect(data.token).toBe('mock_token')
  })

  it('successfully logs in with email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user).toEqual({
      username: mockUser.username,
      email: mockUser.email,
    })
    expect(data.token).toBe('mock_token')
  })
}) 