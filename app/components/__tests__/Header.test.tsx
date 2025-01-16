import React from 'react'
import { render, screen } from '@testing-library/react'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../Header'

// Mock the AuthContext
jest.mock('../../contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

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

describe('Header', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('shows Sign In button when user is not authenticated', () => {
    // Mock the useAuth hook to return no user
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    })

    render(<Header />)
    
    // Check if Sign In button is present
    const signInButton = screen.getByText('Sign In')
    expect(signInButton).toBeInTheDocument()
    expect(signInButton.closest('a')).toHaveAttribute('href', '/api/auth/signin')
  })

  it('shows user-specific buttons when user is authenticated', () => {
    // Mock the useAuth hook to return a user
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        image: null
      },
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    })

    render(<Header />)
    
    // Check if user-specific buttons are present
    expect(screen.getByText('My Profile')).toBeInTheDocument()
    expect(screen.getByText('Upload Logo')).toBeInTheDocument()
    
    // Check if Sign In button is not present
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })

  it('shows navigation links regardless of authentication status', () => {
    // Mock the useAuth hook to return no user
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    })

    render(<Header />)
    
    // Check if common navigation links are present
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('Voting')).toBeInTheDocument()
  })
}) 