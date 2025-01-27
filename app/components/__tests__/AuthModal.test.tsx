import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '../AuthModal'
import { signIn } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}))

describe('AuthModal', () => {
  const mockOnClose = jest.fn()
  const mockOnLoginSuccess = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderAuthModal = () => {
    return render(
      <AuthModal 
        onClose={mockOnClose} 
        onLoginSuccess={mockOnLoginSuccess} 
      />
    )
  }

  describe('Rendering', () => {
    it('renders the sign in form by default', () => {
      renderAuthModal()
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('focuses email input on mount', () => {
      renderAuthModal()
      expect(screen.getByLabelText('Email')).toHaveFocus()
    })

    it('toggles between sign in and sign up modes', async () => {
      renderAuthModal()
      
      // Initially in sign in mode
      expect(screen.getByText('Sign in')).toBeInTheDocument()
      
      // Switch to sign up mode
      await user.click(screen.getByText('Create an account'))
      expect(screen.getByText('Sign up')).toBeInTheDocument()
      
      // Switch back to sign in mode
      await user.click(screen.getByText('Already have an account?'))
      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('handles input changes', async () => {
      renderAuthModal()
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('clears form when toggling between modes', async () => {
      renderAuthModal()
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      await user.click(screen.getByText('Create an account'))
      
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })
  })

  describe('Authentication', () => {
    it('handles successful sign in', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ error: null })
      renderAuthModal()
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign in' }))
      
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          redirect: false,
          email: 'test@example.com',
          password: 'password123'
        })
        expect(mockOnLoginSuccess).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('handles failed sign in', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' })
      renderAuthModal()
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'Sign in' }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
        expect(mockOnLoginSuccess).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })

    it('handles sign in error', async () => {
      (signIn as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      renderAuthModal()
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign in' }))
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument()
        expect(mockOnLoginSuccess).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })
  })

  describe('Modal Interaction', () => {
    it('closes on backdrop click', () => {
      renderAuthModal()
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes on close button click', () => {
      renderAuthModal()
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes on escape key press', () => {
      renderAuthModal()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
}) 