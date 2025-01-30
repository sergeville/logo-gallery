import { POST as requestReset } from '@/app/api/auth/password/request-reset/route'
import { POST as resetPassword } from '@/app/api/auth/password/reset/route'
import { connectToDatabase, __mock as dbMock } from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// Mock dependencies
jest.mock('@/app/lib/db')
jest.mock('@/app/lib/email')
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn().mockResolvedValue(true)
}))

// Helper to create mock request
function createRequest(body: any): Request {
  const request = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  // Mock the json method directly on the request instance
  Object.defineProperty(request, 'json', {
    value: async () => body,
    configurable: true
  })

  return request
}

// Helper to create test responses
function createTestResponse(data: any, status: number = 200) {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  return {
    status,
    json: async () => data,
    headers,
    get: (name: string) => headers.get(name)
  } as Response
}

// Helper to extract data from response
async function extractResponseData(response: Response) {
  return {
    status: response.status,
    data: await response.json()
  }
}

// Mock NextResponse.json
const originalNextResponseJson = NextResponse.json
beforeAll(() => {
  // @ts-ignore
  NextResponse.json = (data: any, init?: ResponseInit) => {
    return createTestResponse(data, init?.status || 200)
  }
})

afterAll(() => {
  // @ts-ignore
  NextResponse.json = originalNextResponseJson
})

describe('Response Handling', () => {
  it('should properly handle JSON responses', async () => {
    const testData = { success: true, message: 'Test message' }
    const response = createTestResponse(testData, 200)
    
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    
    const { data } = await extractResponseData(response)
    expect(data).toEqual(testData)
  })

  it('should handle error responses', async () => {
    const errorData = { success: false, message: 'Error message' }
    const response = createTestResponse(errorData, 400)
    
    expect(response).toBeDefined()
    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    
    const { data } = await extractResponseData(response)
    expect(data).toEqual(errorData)
  })
})

describe('Password Reset APIs', () => {
  const mockUserId = new ObjectId()
  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    password: 'hashedpassword'
  }
  const mockToken = 'valid_reset_token_123'
  const mockExpiredToken = 'expired_token_123'
  const mockNewPassword = 'newPassword123'

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    dbMock.resetState()
    
    // Setup default collection responses
    const mockCollection = dbMock.db.collection('users')
    mockCollection.findOne.mockResolvedValue({
      ...mockUser,
      resetToken: {
        token: mockToken,
        expires: new Date(Date.now() + 3600000) // 1 hour from now
      }
    })
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 })
  })

  describe('POST /api/auth/password/reset', () => {
    describe('Input Validation', () => {
      it('should return 400 if token is missing', async () => {
        const response = await resetPassword(createRequest({ 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(400)
        expect(data).toEqual({
          success: false,
          message: 'Reset token is required'
        })
      })

      it('should return 400 if new password is missing', async () => {
        const response = await resetPassword(createRequest({ 
          token: mockToken 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(400)
        expect(data).toEqual({
          success: false,
          message: 'New password is required'
        })
      })
    })

    describe('Token Validation', () => {
      it('should return 401 if token is invalid', async () => {
        dbMock.db.collection('users').findOne.mockResolvedValueOnce(null)

        const response = await resetPassword(createRequest({ 
          token: 'invalid_token', 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(401)
        expect(data).toEqual({
          success: false,
          message: 'Invalid or expired reset token'
        })
      })

      it('should return 401 if token is expired', async () => {
        // Mock findOne to return null to simulate expired token
        dbMock.db.collection('users').findOne.mockResolvedValueOnce(null)

        const response = await resetPassword(createRequest({ 
          token: mockExpiredToken, 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(401)
        expect(data).toEqual({
          success: false,
          message: 'Invalid or expired reset token'
        })
      })
    })

    describe('Password Update', () => {
      it('should successfully update password with valid token', async () => {
        const response = await resetPassword(createRequest({ 
          token: mockToken, 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(200)
        expect(data).toEqual({
          success: true,
          message: 'Password updated successfully'
        })

        // Verify database operations
        expect(dbMock.db.collection).toHaveBeenCalledWith('users')
        expect(dbMock.db.collection('users').updateOne).toHaveBeenCalledWith(
          { _id: mockUserId },
          {
            $set: { password: expect.any(String) },
            $unset: { resetToken: "" }
          }
        )
      })

      it('should return 500 if database update fails', async () => {
        dbMock.db.collection('users').updateOne.mockResolvedValueOnce({ modifiedCount: 0 })

        const response = await resetPassword(createRequest({ 
          token: mockToken, 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(500)
        expect(data).toEqual({
          success: false,
          message: 'Failed to update password'
        })
      })

      it('should handle database errors gracefully', async () => {
        dbMock.db.collection('users').updateOne.mockRejectedValueOnce(new Error('Database error'))

        const response = await resetPassword(createRequest({ 
          token: mockToken, 
          newPassword: mockNewPassword 
        }))

        const { status, data } = await extractResponseData(response)
        expect(status).toBe(500)
        expect(data).toEqual({
          success: false,
          message: 'An error occurred while resetting password'
        })
      })
    })
  })
}) 