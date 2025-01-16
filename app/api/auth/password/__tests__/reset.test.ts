import { POST as requestReset } from '../request-reset/route'
import { POST as resetPassword } from '../reset/route'
import { connectToDatabase } from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'
import { Db } from 'mongodb'

jest.mock('@/app/lib/db')
jest.mock('@/app/lib/email')

interface MockCollection {
  findOne: jest.Mock;
  updateOne: jest.Mock;
}

interface MockDb {
  collection: (name: string) => MockCollection;
}

describe('Password Reset APIs', () => {
  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    password: 'hashedpassword'
  }

  let mockCollection: MockCollection;
  let mockDb: MockDb;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    (connectToDatabase as jest.Mock).mockResolvedValue({
      db: jest.fn().mockReturnValue(mockDb)
    });
    (sendEmail as jest.Mock).mockResolvedValue(true);
  });

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
      const mockCollectionNoUser: MockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn()
      };

      const mockDbNoUser: MockDb = {
        collection: jest.fn().mockReturnValue(mockCollectionNoUser)
      };

      (connectToDatabase as jest.Mock).mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDbNoUser)
      });

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
      const mockCollectionInvalid: MockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn()
      };

      const mockDbInvalid: MockDb = {
        collection: jest.fn().mockReturnValue(mockCollectionInvalid)
      };

      (connectToDatabase as jest.Mock).mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDbInvalid)
      });

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
      const mockCollectionError: MockCollection = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        updateOne: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      const mockDbError: MockDb = {
        collection: jest.fn().mockReturnValue(mockCollectionError)
      };

      (connectToDatabase as jest.Mock).mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDbError)
      });

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