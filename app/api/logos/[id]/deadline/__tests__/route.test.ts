import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PATCH } from '@/app/api/logos/[id]/deadline/route'
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

describe('Update Voting Deadline API Endpoint', () => {
  const mockAdminId = 'admin123'
  const mockLogoId = new Types.ObjectId().toString()
  const mockNewDeadline = new Date('2024-12-31').toISOString()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({
      user: { id: mockAdminId, isAdmin: true }
    })
    mockDbConnect.mockResolvedValue(undefined)
  })

  it('should require admin authentication', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'user123', isAdmin: false }
    })

    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/deadline', {
        method: 'PATCH',
        body: JSON.stringify({ votingDeadline: mockNewDeadline })
      }),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Admin access required')
  })

  it('should validate logo ID', async () => {
    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/invalid-id/deadline', {
        method: 'PATCH',
        body: JSON.stringify({ votingDeadline: mockNewDeadline })
      }),
      { params: { id: 'invalid-id' } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid logo ID')
  })

  it('should require voting deadline in request', async () => {
    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/deadline', {
        method: 'PATCH',
        body: JSON.stringify({})
      }),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Voting deadline is required')
  })

  it('should validate voting deadline is in future', async () => {
    const pastDate = new Date('2023-01-01').toISOString()

    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/deadline', {
        method: 'PATCH',
        body: JSON.stringify({ votingDeadline: pastDate })
      }),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Voting deadline must be in the future')
  })

  it('should handle non-existent logo', async () => {
    MockLogo.findByIdAndUpdate.mockResolvedValueOnce(null)

    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/deadline', {
        method: 'PATCH',
        body: JSON.stringify({ votingDeadline: mockNewDeadline })
      }),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Logo not found')
  })

  it('should successfully update voting deadline', async () => {
    const updatedLogo = {
      _id: mockLogoId,
      title: 'Test Logo',
      votingDeadline: mockNewDeadline
    }
    MockLogo.findByIdAndUpdate.mockResolvedValueOnce(updatedLogo)

    const response = await PATCH(
      new NextRequest('http://localhost/api/logos/' + mockLogoId + '/deadline', {
        method: 'PATCH',
        body: JSON.stringify({ votingDeadline: mockNewDeadline })
      }),
      { params: { id: mockLogoId } }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Voting deadline updated successfully')
    expect(data.logo).toEqual(updatedLogo)
  })
}) 