import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/logos/[id]/vote/route'
import { Logo } from '@/app/lib/models/logo'
import { Types } from 'mongoose'
import dbConnect from '@/app/lib/db-config'

// Mock next-auth
jest.mock('next-auth')
const mockGetServerSession = getServerSession as jest.Mock

// Mock database connection
jest.mock('@/app/lib/db-config')
const mockDbConnect = dbConnect as jest.Mock

// Mock Logo model
jest.mock('@/app/lib/models/logo')
const MockLogo = Logo as jest.Mocked<typeof Logo>

describe('Vote API Endpoint', () => {
  const mockUserId = 'user123'
  const mockLogoId = new Types.ObjectId().toString()
  const mockDate = new Date('2024-12-31')

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({
      user: { id: mockUserId }
    })
    mockDbConnect.mockResolvedValue(undefined)
  })

  it('should require authentication', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)

    const response = await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Authentication required')
  })

  it('should validate logo ID', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/logos/invalid-id/vote'),
      { params: { id: 'invalid-id' } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid logo ID')
  })

  it('should prevent voting after deadline', async () => {
    MockLogo.findById.mockResolvedValueOnce({
      _id: mockLogoId,
      userId: 'other123',
      votingDeadline: new Date('2023-01-01')
    })

    const response = await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Voting period has ended for this logo')
  })

  it('should prevent voting for own logo', async () => {
    MockLogo.findById.mockResolvedValueOnce({
      _id: mockLogoId,
      userId: mockUserId,
      votingDeadline: mockDate
    })

    const response = await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Cannot vote for your own logo')
  })

  it('should prevent duplicate votes on same logo', async () => {
    MockLogo.findById.mockResolvedValueOnce({
      _id: mockLogoId,
      userId: 'other123',
      votingDeadline: mockDate
    })
    MockLogo.findOne.mockResolvedValueOnce({
      _id: mockLogoId,
      votes: [{ userId: mockUserId }]
    })

    const response = await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('You have already voted for this logo')
  })

  it('should remove previous vote when voting for different logo', async () => {
    const previousLogoId = new Types.ObjectId().toString()
    
    MockLogo.findById.mockResolvedValueOnce({
      _id: mockLogoId,
      userId: 'other123',
      votingDeadline: mockDate
    })
    MockLogo.findOne
      .mockResolvedValueOnce(null) // No vote on current logo
      .mockResolvedValueOnce({ // Previous vote on different logo
        _id: previousLogoId,
        votes: [{ userId: mockUserId }]
      })

    await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(MockLogo.findByIdAndUpdate).toHaveBeenCalledWith(
      previousLogoId,
      {
        $pull: { votes: { userId: mockUserId } },
        $inc: { totalVotes: -1 }
      }
    )
  })

  it('should successfully record a vote', async () => {
    MockLogo.findById.mockResolvedValueOnce({
      _id: mockLogoId,
      userId: 'other123',
      votingDeadline: mockDate
    })
    MockLogo.findOne.mockResolvedValue(null) // No existing votes
    MockLogo.findOneAndUpdate.mockResolvedValueOnce({
      _id: mockLogoId,
      title: 'Test Logo',
      description: 'Test Description',
      imageUrl: '/test.png',
      votes: [{ userId: mockUserId }]
    })

    const response = await POST(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/vote'),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Vote submitted successfully')
    expect(data.logo).toBeDefined()
    expect(data.logo.totalVotes).toBe(1)
  })
}) 