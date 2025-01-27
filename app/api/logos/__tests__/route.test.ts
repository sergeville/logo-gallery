import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { GET, POST } from '../route'
import { connectToDatabase } from '@/app/lib/db'
import { generateTestUser, generateTestLogo } from '@/app/utils/test-utils'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/app/lib/db')

describe('Logos API Route', () => {
  const mockUser = generateTestUser()
  const mockLogo = generateTestLogo()
  const mockDb = {
    collection: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    countDocuments: jest.fn(),
    insertOne: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(connectToDatabase as jest.Mock).mockResolvedValue({ db: mockDb })
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: mockUser
    })
  })

  describe('GET /api/logos', () => {
    const createRequest = (params = {}) => {
      const url = new URL('http://localhost/api/logos')
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value as string)
      })
      return new NextRequest(url)
    }

    it('returns paginated logos', async () => {
      const mockLogos = [mockLogo]
      mockDb.toArray.mockResolvedValueOnce(mockLogos)
      mockDb.countDocuments.mockResolvedValueOnce(1)

      const request = createRequest({ page: '1', limit: '12' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        logos: [expect.objectContaining({ id: mockLogo.id })],
        pagination: {
          page: 1,
          totalPages: 1,
          hasMore: false,
          total: 1
        }
      })
    })

    it('filters logos by ownerId', async () => {
      const ownerId = new ObjectId().toString()
      mockDb.toArray.mockResolvedValueOnce([])
      mockDb.countDocuments.mockResolvedValueOnce(0)

      const request = createRequest({ ownerId })
      await GET(request)

      expect(mockDb.find).toHaveBeenCalledWith({
        ownerId: expect.any(ObjectId)
      })
    })

    it('handles invalid page parameters', async () => {
      mockDb.toArray.mockResolvedValueOnce([])
      mockDb.countDocuments.mockResolvedValueOnce(0)

      const request = createRequest({ page: 'invalid', limit: 'invalid' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(1) // Default page
      expect(data.pagination.total).toBe(0)
    })

    it('handles database errors', async () => {
      mockDb.toArray.mockRejectedValueOnce(new Error('Database error'))

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal Server Error')
    })
  })

  describe('POST /api/logos', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost/api/logos', {
        method: 'POST',
        body: JSON.stringify(body)
      })
    }

    it('creates a new logo when authenticated', async () => {
      const logoData = {
        name: 'Test Logo',
        description: 'Test Description',
        imageUrl: '/uploads/test.png'
      }

      mockDb.insertOne.mockResolvedValueOnce({ insertedId: new ObjectId() })

      const request = createRequest(logoData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.logo).toEqual(
        expect.objectContaining({
          name: logoData.name,
          description: logoData.description,
          imageUrl: logoData.imageUrl
        })
      )
      expect(mockDb.insertOne).toHaveBeenCalled()
    })

    it('returns 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const request = createRequest({
        name: 'Test Logo',
        imageUrl: '/test.png'
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 for missing required fields', async () => {
      const request = createRequest({
        name: 'Test Logo'
        // Missing imageUrl
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('normalizes image URLs', async () => {
      const logoData = {
        name: 'Test Logo',
        description: 'Test Description',
        imageUrl: 'test.png' // Not starting with /uploads/
      }

      mockDb.insertOne.mockResolvedValueOnce({ insertedId: new ObjectId() })

      const request = createRequest(logoData)
      const response = await POST(request)
      const data = await response.json()

      expect(data.logo.imageUrl).toBe('/uploads/test.png')
    })

    it('handles database errors during creation', async () => {
      mockDb.insertOne.mockRejectedValueOnce(new Error('Database error'))

      const request = createRequest({
        name: 'Test Logo',
        imageUrl: '/uploads/test.png'
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create logo')
    })
  })
}) 