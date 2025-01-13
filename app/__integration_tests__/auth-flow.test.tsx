import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import GalleryPage from '../gallery/page'
import { AuthProvider } from '../context/AuthContext'

const mockLogos = [
  {
    _id: '1',
    name: 'Test Logo 1',
    imageUrl: 'https://placehold.co/400',
    averageRating: 4.5,
    totalVotes: 10,
    createdBy: 'testuser',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock fetch for logos
global.fetch = jest.fn((url) => {
  if (url.includes('/api/logos')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ logos: mockLogos }),
    })
  }
  if (url.includes('/api/auth/login')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: { username: 'testuser', email: 'test@example.com' } }),
    })
  }
  if (url.includes('/api/auth/register')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: { username: 'testuser', email: 'test@example.com' } }),
    })
  }
  return Promise.reject(new Error('Not found'))
}) as jest.Mock

// Mock HeadlessUI Dialog
jest.mock('@headlessui/react', () => ({
  Dialog: Object.assign(
    ({ children, open }: any) => open ? children : null,
    {
      Panel: ({ children }: any) => children,
      Title: ({ children }: any) => children,
    }
  ),
}))

describe('Authentication Flow Integration', () => {
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

  it('shows auth modal when unauthenticated user tries to vote', async () => {
    await act(async () => {
      renderWithProviders()
    })

    // Wait for logos to load
    await waitFor(() => {
      expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
    })

    // Try to vote on a logo
    const ratingButton = await screen.findByTestId('rate-1-button')
    await act(async () => {
      fireEvent.click(ratingButton)
    })

    // Verify auth modal appears
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })
  })

  it('completes registration and login flow', async () => {
    await act(async () => {
      renderWithProviders()
    })

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
    })

    // Open auth modal
    const loginButton = screen.getByTestId('login-button')
    await act(async () => {
      fireEvent.click(loginButton)
    })

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    // Switch to registration
    const switchToRegister = screen.getByTestId('switch-to-register')
    await act(async () => {
      fireEvent.click(switchToRegister)
    })

    // Fill out registration form
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByTestId('username-input'), {
        target: { value: 'testuser' },
      })
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'Password123!' },
      })
    })

    // Submit registration
    await act(async () => {
      fireEvent.submit(screen.getByTestId('auth-form'))
    })

    // Verify user is logged in
    await waitFor(() => {
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument()
      expect(screen.getByTestId('user-welcome')).toHaveTextContent('Welcome, testuser')
    })
  })

  it('handles login errors gracefully', async () => {
    // Mock failed login
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid credentials' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ logos: mockLogos }),
      })
    }) as jest.Mock

    await act(async () => {
      renderWithProviders()
    })

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
    })

    // Open auth modal
    const loginButton = screen.getByTestId('login-button')
    await act(async () => {
      fireEvent.click(loginButton)
    })

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    // Fill out login form with invalid credentials
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrongpassword' },
      })
    })

    // Submit login
    await act(async () => {
      fireEvent.submit(screen.getByTestId('auth-form'))
    })

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toBeInTheDocument()
    })
  })

  it('successfully logs out user', async () => {
    await act(async () => {
      renderWithProviders()
    })

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByTestId('logo-grid')).toBeInTheDocument()
    })

    // Mock successful login
    await act(async () => {
      const loginButton = screen.getByTestId('login-button')
      fireEvent.click(loginButton)
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      })
      fireEvent.submit(screen.getByTestId('auth-form'))
    })

    // Wait for user menu to appear
    await waitFor(() => {
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument()
    })

    // Open user menu
    const userMenuButton = screen.getByTestId('user-menu-button')
    await act(async () => {
      fireEvent.click(userMenuButton)
    })

    // Click logout
    const logoutButton = await screen.findByTestId('logout-button')
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    // Verify user is logged out
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument()
    })
  })
}) 