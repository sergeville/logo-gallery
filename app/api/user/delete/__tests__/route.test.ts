import { NextRequest } from 'next/server'
import { DELETE } from '../route'
import { deleteUser, getUsers } from '@/app/lib/store'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/app/lib/store', () => ({
  deleteUser: jest.fn(),
  getUsers: jest.fn()
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}))

describe('Account Deletion API', () => {
  const mockUser = {
    _id: '123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123'
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
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(deleteUser as jest.Mock).mockReturnValue(true)
  })

  describe('DELETE /api/user/delete', () => {
    it('successfully deletes user account', async () => {
      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'Password123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Account successfully deleted'
      })
      expect(deleteUser).toHaveBeenCalledWith(mockUser._id)
      expect(mockCookies.set).toHaveBeenCalledWith('user', '', { expires: expect.any(Date) })
    })

    it('returns 401 when not authenticated', async () => {
      mockCookies.get.mockReturnValue(null)

      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'Password123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        message: 'Not authenticated'
      })
    })

    it('validates password requirement', async () => {
      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({})
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: 'Password is required to delete account'
      })
    })

    it('verifies correct password', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'WrongPassword123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        message: 'Invalid password'
      })
    })

    it('handles non-existent user', async () => {
      ;(getUsers as jest.Mock).mockReturnValue([])

      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'Password123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        success: false,
        message: 'User not found'
      })
    })

    it('handles deletion failure', async () => {
      ;(deleteUser as jest.Mock).mockReturnValue(false)

      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'Password123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        message: 'Failed to delete account'
      })
    })

    it('handles unexpected errors', async () => {
      ;(deleteUser as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = new Request('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password: 'Password123!' })
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        message: 'Failed to delete account'
      })
    })
  })
}) 