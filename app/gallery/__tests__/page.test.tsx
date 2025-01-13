import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import GalleryPage from '../page'
import { AuthProvider } from '../../context/AuthContext'
import { Logo } from '@/scripts/test-data/types'

// Mock useAuth hook
jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext')
  return {
    ...actual,
    useAuth: jest.fn(() => ({
      user: null,
      loading: false
    }))
  }
})

const mockLogos: Logo[] = [
  {
    _id: '1',
    name: 'Test Logo 1',
    imageUrl: 'https://placehold.co/400',
    thumbnailUrl: 'https://placehold.co/200',
    ownerId: 'testuser',
    tags: ['test', 'logo'],
    category: 'test',
    dimensions: {
      width: 400,
      height: 400
    },
    fileSize: 1000,
    fileType: 'image/png',
    votes: [
      {
        userId: 'user1',
        rating: 4,
        createdAt: new Date()
      },
      {
        userId: 'user2',
        rating: 5,
        createdAt: new Date()
      }
    ],
    averageRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
]

// Mock fetch for logos
global.fetch = jest.fn((url) => {
  if (url === '/api/logos') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ logos: mockLogos }),
    })
  }
  if (url.includes('/api/auth/me')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: null }),
    })
  }
  return Promise.reject(new Error('Not found'))
}) as jest.Mock

describe('GalleryPage', () => {
  const renderWithProviders = () => {
    return render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading state initially', async () => {
      renderWithProviders()

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })
  })

  describe('Logo Display', () => {
    it('displays logos correctly', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
      })

      expect(screen.getByText('Test Logo 1')).toBeInTheDocument()
      expect(screen.getByText('(2 votes)')).toBeInTheDocument()
    })

    it('handles empty logo list', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ logos: [] }),
        })
      )

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('logo-card')).not.toBeInTheDocument()
    })

    it('handles fetch error', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Failed to fetch'))
      )

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      expect(screen.getByText('Failed to load logos')).toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('toggles dark mode when theme button is clicked', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      })

      const themeButton = screen.getByTestId('theme-toggle')
      fireEvent.click(themeButton)

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('updates theme button icon when toggled', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      })

      const themeButton = screen.getByTestId('theme-toggle')
      expect(themeButton).toHaveTextContent('🌙')

      fireEvent.click(themeButton)
      expect(themeButton).toHaveTextContent('🌞')
    })
  })

  describe('Authentication Flow', () => {
    it('shows auth modal when clicking sign in button', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
      })

      const loginButton = screen.getByTestId('login-button')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-form')).toBeInTheDocument()
      })
    })

    it('shows auth modal when unauthenticated user tries to vote', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
      })

      const ratingButton = screen.getByTestId('rate-1-button')
      fireEvent.click(ratingButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-form')).toBeInTheDocument()
      })
    })
  })
}) 