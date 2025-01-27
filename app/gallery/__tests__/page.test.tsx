import { render, screen, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import GalleryPage from '../page'
import { server } from '@app/mocks/test-server'
import { rest } from 'msw'

const mockLogos = [
  {
    id: 'test-logo-id',
    name: 'Test Logo',
    description: 'Test Logo Description',
    imageUrl: '/test-image.png',
    thumbnailUrl: '/test-thumbnail.png',
    votes: 0,
    ownerName: 'Test User',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

describe('Gallery Page', () => {
  it('renders logo cards', async () => {
    render(
      <SessionProvider session={null}>
        <GalleryPage />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Logo')).toBeInTheDocument()
      expect(screen.getByText('Test Logo Description')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('#test')).toBeInTheDocument()
    })
  })

  it('handles fetch errors gracefully', async () => {
    server.use(
      rest.get('/api/logos', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Failed to load logos' })
        )
      })
    )

    render(
      <SessionProvider session={null}>
        <GalleryPage />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to load logos/i)).toBeInTheDocument()
    })
  })
}) 