import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET } from '../route'
import { Logo } from '@/app/lib/models/logo'
import { authConfig } from '@/app/lib/auth.config'

// Mock next-auth
jest.mock('next-auth')
const mockGetServerSession = getServerSession as jest.Mock

// Mock database connection
jest.mock('@/app/lib/db-config')
const mockDbConnect = dbConnect as jest.Mock

// Mock Logo model
jest.mock('@/app/lib/models/logo')
const MockLogo = Logo as jest.Mocked<typeof Logo>

describe('GET /api/logos/[id]/deadline', () => {
  const mockLogoId = '123456789012345678901234'
  const mockLogo = {
    _id: mockLogoId,
    createdAt: new Date('2024-01-01'),
    title: 'Test Logo',
    description: 'Test Description',
    imageUrl: 'test.jpg',
    thumbnailUrl: 'test-thumb.jpg',
    userId: 'user123'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123' }
    })
    MockLogo.findById.mockResolvedValue(mockLogo)
  })

  it('returns 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET(
      new NextRequest('http://localhost:3000'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 if logo not found', async () => {
    MockLogo.findById.mockResolvedValue(null)

    const response = await GET(
      new NextRequest('http://localhost:3000'),
      { params: { id: 'invalid-id' } }
    )

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Logo not found')
  })

  it('returns voting deadline for valid logo', async () => {
    const response = await GET(
      new NextRequest('http://localhost:3000'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.deadline).toBeDefined()
    
    const deadline = new Date(data.deadline)
    const expectedDeadline = new Date('2024-01-08') // 7 days after creation
    expect(deadline.toISOString()).toBe(expectedDeadline.toISOString())
  })

  it('handles database errors gracefully', async () => {
    MockLogo.findById.mockRejectedValue(new Error('Database error'))

    const response = await GET(
      new NextRequest('http://localhost:3000'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch voting deadline')
  })
}) 