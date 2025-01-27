import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../Header'
import { generateTestUser } from '@/app/utils/test-utils'

// Mock next-auth
jest.mock('next-auth/react')
jest.mock('next/navigation')

// Mock child components
jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button>Theme Toggle</button>
  }
})

jest.mock('../AuthModal', () => {
  return function MockAuthModal({ onClose, onLoginSuccess }: any) {
    return (
      <div role="dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={onLoginSuccess}>Login Success</button>
      </div>
    )
  }
})

describe('Header', () => {
  const mockRouter = {
    refresh: jest.fn(),
    push: jest.fn()
  }
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    // Default to unauthenticated state
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
  })

  describe('Rendering', () => {
    it('renders logo and navigation links', () => {
      render(<Header />)
      
      expect(screen.getByText('Logo Gallery')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /gallery/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /vote/i })).toBeInTheDocument()
    })

    it('shows environment information', () => {
      render(<Header />)
      
      expect(screen.getByText(/development/i)).toBeInTheDocument()
      expect(screen.getByText(/LogoGalleryDevelopmentDB/i)).toBeInTheDocument()
    })

    it('shows loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading'
      })

      render(<Header />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Authentication State', () => {
    it('shows sign in button when not authenticated', () => {
      render(<Header />)
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
    })

    it('shows user info and logout when authenticated', () => {
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Header />)
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /upload logo/i })).toBeInTheDocument()
    })

    it('shows user role badge when available', () => {
      const mockUser = generateTestUser({ role: 'ADMIN' })
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Header />)
      
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('opens auth modal on sign in click', async () => {
      render(<Header />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles successful login', async () => {
      render(<Header />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      await user.click(screen.getByRole('button', { name: /login success/i }))
      
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles logout', async () => {
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Header />)
      
      await user.click(screen.getByRole('button', { name: /logout/i }))
      
      expect(signOut).toHaveBeenCalledWith({
        redirect: true,
        callbackUrl: '/'
      })
    })

    it('closes auth modal', async () => {
      render(<Header />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      await user.click(screen.getByRole('button', { name: /close/i }))
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('shows profile text on mobile', () => {
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Header />)
      
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('hides upload button on mobile', () => {
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Header />)
      
      const uploadButton = screen.getByRole('link', { name: /upload logo/i })
      expect(uploadButton).toHaveClass('hidden sm:inline-flex')
    })
  })
}) 