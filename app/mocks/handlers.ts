import { rest } from 'msw'
import { ObjectId } from 'mongodb'

// Mock data
export const mockUser = {
  id: new ObjectId().toString(),
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  favorites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockLogo = {
  id: new ObjectId().toString(),
  name: 'Test Logo',
  description: 'Test Logo Description',
  imageUrl: '/uploads/test-logo.png',
  thumbnailUrl: '/uploads/test-logo-thumb.png',
  dimensions: { width: 100, height: 100 },
  totalVotes: 0,
  averageRating: 0,
  ownerName: mockUser.name,
  ownerId: mockUser.id,
  tags: ['test'],
  category: 'test',
  fileSize: 1024,
  fileType: 'image/png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json()
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          user: mockUser
        })
      )
    }
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Invalid credentials'
      })
    )
  }),

  rest.post('/api/auth/register', async (req, res, ctx) => {
    const { email, password, name } = await req.json()
    if (!email || !password || !name) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'Email, password, and name are required'
        })
      )
    }
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'User registered successfully',
        userId: new ObjectId().toString()
      })
    )
  }),

  // Logo endpoints
  rest.get('/api/logos', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1')
    const limit = parseInt(req.url.searchParams.get('limit') || '12')
    const ownerId = req.url.searchParams.get('ownerId')

    let logos = [mockLogo]
    if (ownerId && ownerId !== mockUser.id) {
      logos = []
    }

    return res(
      ctx.status(200),
      ctx.json({
        logos,
        pagination: {
          page,
          totalPages: 1,
          hasMore: false,
          total: logos.length
        }
      })
    )
  }),

  rest.post('/api/logos', async (req, res, ctx) => {
    const body = await req.json()
    if (!body.name || !body.imageUrl) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Missing required fields'
        })
      )
    }
    return res(
      ctx.status(201),
      ctx.json({
        logo: {
          ...mockLogo,
          ...body,
          id: new ObjectId().toString()
        }
      })
    )
  }),

  rest.get('/api/logos/:id', (req, res, ctx) => {
    const { id } = req.params
    if (id === mockLogo.id) {
      return res(
        ctx.status(200),
        ctx.json(mockLogo)
      )
    }
    return res(
      ctx.status(404),
      ctx.json({
        error: 'Logo not found'
      })
    )
  }),

  rest.delete('/api/logos/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Logo deleted successfully'
      })
    )
  }),

  // User endpoints
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUser
      })
    )
  }),

  rest.get('/api/user/logos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        logos: [mockLogo]
      })
    )
  }),

  rest.delete('/api/user/delete', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'User deleted successfully'
      })
    )
  }),

  // Favorites endpoints
  rest.post('/api/users/favorite', async (req, res, ctx) => {
    const { logoId } = await req.json()
    if (!logoId) {
      return res(
        ctx.status(400),
        ctx.json({
          message: 'Logo ID is required'
        })
      )
    }
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Logo added to favorites'
      })
    )
  }),

  rest.get('/api/users/favorite', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        favorites: [mockLogo.id]
      })
    )
  }),

  // Vote endpoints
  rest.post('/api/vote', async (req, res, ctx) => {
    const { logoId } = await req.json()
    if (!logoId) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Logo ID is required'
        })
      )
    }
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Vote added',
        totalVotes: 1,
        isVoted: true
      })
    )
  }),

  rest.get('/api/users/:id/votes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        votes: [{
          _id: mockLogo.id,
          name: mockLogo.name,
          description: mockLogo.description,
          imageUrl: mockLogo.imageUrl,
          thumbnailUrl: mockLogo.thumbnailUrl,
          votes: [{
            userId: mockUser.id,
            createdAt: new Date().toISOString()
          }]
        }]
      })
    )
  })
] 