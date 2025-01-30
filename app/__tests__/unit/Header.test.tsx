import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useAuth } from '@/app/contexts/AuthContext'
import Header from '../Header'
import { useSession } from 'next-auth/react'

// Mock the AuthContext
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock next/link since we're not testing navigation
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock ThemeToggle since we're not testing theme functionality
jest.mock('../ThemeToggle', () => {
  return () => <div data-testid="theme-toggle">Theme Toggle</div>
})

jest.mock('next-auth/react')

describe('Header', () => {
  const mockSignOut = jest.fn()

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Mock the useAuth hook to return no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      signOut: mockSignOut,
    })

    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg'
        }
      },
      status: 'authenticated'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders logo and navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Logo Gallery')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('Voting')).toBeInTheDocument()
  })

  it('shows user profile when authenticated', () => {
    render(<Header />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByAltText('User avatar')).toHaveAttribute(
      'src',
      'https://example.com/avatar.jpg'
    )
  })

  it('shows sign in button when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    render(<Header />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(<Header />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows sign in link when user is not logged in', () => {
    render(<Header />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Upload')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
  })

  it('shows user menu when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: 'testuser' },
      signOut: mockSignOut,
    })

    render(<Header />)
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: 'testuser' },
      signOut: mockSignOut,
    })

    render(<Header />)
    
    fireEvent.click(screen.getByText('Sign Out'))
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('navigates to correct routes when links are clicked', () => {
    render(<Header />)
    
    const galleryLink = screen.getByText('Gallery').closest('a')
    const votingLink = screen.getByText('Voting').closest('a')
    
    expect(galleryLink).toHaveAttribute('href', '/gallery')
    expect(votingLink).toHaveAttribute('href', '/vote')
  })
}) 