import { POST as requestReset } from '../request-reset/route'
import { POST as resetPassword } from '../reset/route'
import { connectToDatabase } from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'

jest.mock('@/app/lib/db')
jest.mock('@/app/lib/email')

describe('Password Reset APIs', () => {
  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    password: 'hashedpassword'
  }

  beforeEach(() => {
    (connectToDatabase as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      })
    })
    (sendEmail as jest.Mock).mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/password/request-reset', () => {
    it('successfully generates reset token', async () => {
      const request = new Request('http://localhost/api/auth/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      })

      const response = await requestReset(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Password reset instructions sent'
      })
      expect(sendEmail).toHaveBeenCalled()
    })

    it('returns success even when user not found (security)', async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null)
        })
      })

      const request = new Request('http://localhost/api/auth/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com' })
      })

      const response = await requestReset(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Password reset instructions sent'
      })
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/auth/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await requestReset(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: 'Email is required'
      })
    })
  })

  describe('POST /api/auth/password/reset', () => {
    const mockToken = 'valid-reset-token'
    const mockNewPassword = 'newPassword123!'

    it('successfully resets password', async () => {
      const request = new Request('http://localhost/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: mockToken,
          newPassword: mockNewPassword
        })
      })

      const response = await resetPassword(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Password successfully reset'
      })
    })

    it('validates required fields', async () => {
      const testCases = [
        { body: {}, missing: 'Reset token' },
        { body: { token: mockToken }, missing: 'New password' }
      ]

      for (const testCase of testCases) {
        const request = new Request('http://localhost/api/auth/password/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.body)
        })

        const response = await resetPassword(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data).toEqual({
          success: false,
          message: `${testCase.missing} is required`
        })
      }
    })

    it('handles invalid reset token', async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null)
        })
      })

      const request = new Request('http://localhost/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'invalid-token',
          newPassword: mockNewPassword
        })
      })

      const response = await resetPassword(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        message: 'Invalid or expired reset token'
      })
    })

    it('handles database errors', async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockUser),
          updateOne: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      })

      const request = new Request('http://localhost/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: mockToken,
          newPassword: mockNewPassword
        })
      })

      const response = await resetPassword(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        message: 'Failed to reset password'
      })
    })
  })
}) 