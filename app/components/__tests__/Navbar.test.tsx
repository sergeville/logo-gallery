import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import Navbar from '../Navbar'
import { generateTestUser } from '@/app/utils/test-utils'

// Mock next-auth
jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('@/app/hooks/useAuth')

// Mock AuthModal component
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

describe('Navbar', () => {
  const mockRouter = {
    refresh: jest.fn(),
    push: jest.fn()
  }
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })
  })

  describe('Rendering', () => {
    it('renders basic navigation links', () => {
      render(<Navbar />)
      
      expect(screen.getByText('Logo Gallery')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /gallery/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /vote/i })).toBeInTheDocument()
    })

    it('does not render protected links when not authenticated', () => {
      render(<Navbar />)
      
      expect(screen.queryByRole('link', { name: /my logos/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /upload logo/i })).not.toBeInTheDocument()
    })

    it('renders user-specific links when authenticated', () => {
      const mockUser = generateTestUser()
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Navbar />)
      
      expect(screen.getByRole('link', { name: /my logos/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /upload logo/i })).toBeInTheDocument()
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    })
  })

  describe('Authentication', () => {
    it('shows sign in button when not authenticated', () => {
      render(<Navbar />)
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
    })

    it('shows sign out button when authenticated', () => {
      const mockUser = generateTestUser()
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Navbar />)
      
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    })

    it('handles sign in click', async () => {
      render(<Navbar />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      expect(signIn).toHaveBeenCalledWith(undefined, {
        callbackUrl: '/',
        redirect: false
      })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles sign out click', async () => {
      const mockUser = generateTestUser()
      ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      render(<Navbar />)
      
      await user.click(screen.getByRole('button', { name: /sign out/i }))
      
      expect(signOut).toHaveBeenCalledWith({ redirect: false })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  describe('Auth Modal', () => {
    it('opens auth modal on sign in click', async () => {
      render(<Navbar />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closes auth modal', async () => {
      render(<Navbar />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      await user.click(screen.getByRole('button', { name: /close/i }))
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles successful login', async () => {
      render(<Navbar />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      await user.click(screen.getByRole('button', { name: /login success/i }))
      
      expect(mockRouter.refresh).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
}) 