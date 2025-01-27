import { rest } from 'msw'
import type { ClientUser, ClientLogo, LoginRequest, RegisterRequest, VoteRequest } from '../../lib/types'

const mockLogos = [
  {
    id: 'test-logo-id',
    name: 'Test Logo',
    description: 'Test Logo Description',
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/logo-thumb.png',
    dimensions: { width: 100, height: 100 },
    totalVotes: 0,
    averageRating: 0,
    ownerName: 'Test User',
    ownerId: 'test-user-id',
    tags: ['test'],
    category: 'test',
    fileSize: 1024,
    fileType: 'image/png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const handlers = [
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json()
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          user: { id: '1', email, name: 'Test User' }
        })
      )
    }
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    )
  }),

  rest.post('/api/auth/register', async (req, res, ctx) => {
    const { email, password, name } = await req.json()
    if (email && password && name) {
      return res(
        ctx.status(200),
        ctx.json({
          user: { id: '1', email, name }
        })
      )
    }
    return res(
      ctx.status(400),
      ctx.json({ error: 'Missing required fields' })
    )
  }),

  rest.get('/api/logos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ logos: mockLogos, pagination: { current: 1, total: 1, hasMore: false } })
    )
  }),

  rest.post('/api/logos/:id/vote', async (req, res, ctx) => {
    const { id } = req.params
    const logo = mockLogos.find(l => l.id === id)
    if (!logo) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Logo not found' })
      )
    }
    return res(
      ctx.status(200),
      ctx.json({ message: 'Vote submitted' })
    )
  })
] 