import { NextRequest } from 'next/server'
import { PUT } from '../route'
import { updateUser, getUsers } from '@/app/lib/store'
import { cookies } from 'next/headers'

// Mock dependencies
jest.mock('@/app/lib/store', () => ({
  updateUser: jest.fn(),
  getUsers: jest.fn()
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

describe('Profile Update API', () => {
  const mockUser = {
    _id: '123',
    username: 'testuser',
    email: 'test@example.com',
    profileImage: 'https://placehold.co/50x50'
  }

  const mockCookies = {
    get: jest.fn(),
    set: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockReturnValue(mockCookies)
    mockCookies.get.mockReturnValue({ value: JSON.stringify(mockUser) })
    ;(getUsers as jest.Mock).mockReturnValue([mockUser])
    ;(updateUser as jest.Mock).mockImplementation((id, updates) => ({
      ...mockUser,
      ...updates
    }))
  })

  describe('PUT /api/user/profile', () => {
    it('successfully updates user profile', async () => {
      const updates = {
        username: 'newusername',
        email: 'newemail@example.com',
        profileImage: 'https://placehold.co/100x100'
      }

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        user: {
          _id: mockUser._id,
          ...updates
        }
      })
      expect(updateUser).toHaveBeenCalledWith(mockUser._id, updates)
      expect(mockCookies.set).toHaveBeenCalled()
    })

    it('returns 401 when not authenticated', async () => {
      mockCookies.get.mockReturnValue(null)

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ username: 'newname' })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        message: 'Not authenticated'
      })
    })

    it('validates update fields', async () => {
      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({})
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: 'No update fields provided'
      })
    })

    it('prevents duplicate username', async () => {
      ;(getUsers as jest.Mock).mockReturnValue([
        mockUser,
        { _id: '456', username: 'existinguser', email: 'other@example.com' }
      ])

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ username: 'existinguser' })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({
        success: false,
        message: 'Username already exists'
      })
    })

    it('prevents duplicate email', async () => {
      ;(getUsers as jest.Mock).mockReturnValue([
        mockUser,
        { _id: '456', username: 'otheruser', email: 'existing@example.com' }
      ])

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ email: 'existing@example.com' })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({
        success: false,
        message: 'Email already exists'
      })
    })

    it('handles partial updates', async () => {
      const updates = {
        username: 'newusername'
      }

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual({
        ...mockUser,
        username: 'newusername'
      })
      expect(updateUser).toHaveBeenCalledWith(mockUser._id, {
        username: 'newusername',
        email: mockUser.email,
        profileImage: mockUser.profileImage
      })
    })

    it('handles database errors gracefully', async () => {
      ;(updateUser as jest.Mock).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new Request('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ username: 'newname' })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        message: 'Failed to update profile'
      })
    })
  })
}) 