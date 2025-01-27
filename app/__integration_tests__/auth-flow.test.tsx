import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { generateTestUser } from '../utils/test-utils'
import App from '../page'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import Navbar from '../components/Navbar'

const mockUser = generateTestUser()

const server = setupServer(
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
          message: 'All fields are required'
        })
      )
    }
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'User registered successfully',
        user: mockUser
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderApp = (session = null) => {
  return render(
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SessionProvider>
  )
}

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }
  const user = userEvent.setup()

  beforeEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true, error: null })
  })

  describe('Sign In Flow', () => {
    it('completes full sign in flow successfully', async () => {
      const mockUser = generateTestUser()
      render(<Navbar />)

      // Initial state - Sign in button visible
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()

      // Click sign in
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Auth modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Fill in credentials
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      // Mock successful authentication
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })

      // Verify UI updates
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(mockRouter.refresh).toHaveBeenCalled()
    })

    it('handles sign in error gracefully', async () => {
      ;(signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'Invalid credentials' })
      render(<Navbar />)

      // Start sign in flow
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify error handling
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
    })
  })

  describe('Sign Out Flow', () => {
    it('handles sign out process correctly', async () => {
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })

      render(<Navbar />)

      // Initial authenticated state
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()

      // Sign out
      await user.click(screen.getByRole('button', { name: /sign out/i }))

      // Mock unauthenticated state
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })
      ;(useAuth as jest.Mock).mockReturnValue({ user: null })

      // Verify UI updates
      expect(screen.queryByText(mockUser.name)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(signOut).toHaveBeenCalledWith({ redirect: false })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  describe('Protected Navigation', () => {
    it('shows protected links only when authenticated', async () => {
      render(<Navbar />)

      // Unauthenticated state
      expect(screen.queryByRole('link', { name: /my logos/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /upload logo/i })).not.toBeInTheDocument()

      // Mock authentication
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })

      // Re-render to trigger update
      render(<Navbar />)

      // Verify protected links appear
      expect(screen.getByRole('link', { name: /my logos/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /upload logo/i })).toBeInTheDocument()
    })
  })

  describe('Sign Up Flow', () => {
    it('allows user to create a new account', async () => {
      renderApp()

      // Open auth modal
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Switch to sign up mode
      await user.click(screen.getByText(/create an account/i))

      // Fill in registration details
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.type(screen.getByLabelText(/name/i), 'New User')

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Verify success
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.getByText(/New User/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid registration data', async () => {
      server.use(
        rest.post('/api/auth/register', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              message: 'Email already registered'
            })
          )
        })
      )

      renderApp()

      // Open auth modal
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Switch to sign up mode
      await user.click(screen.getByText(/create an account/i))

      // Fill in registration details
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.type(screen.getByLabelText(/name/i), 'Existing User')

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Authentication State', () => {
    it('shows authenticated UI when user is logged in', () => {
      renderApp({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })

    it('shows unauthenticated UI when user is logged out', () => {
      renderApp(null)

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByText(mockUser.name)).not.toBeInTheDocument()
    })
  })

  it('should handle successful login', async () => {
    renderApp(createMockSession('USER'))
    // ... rest of the test
  })
}) 