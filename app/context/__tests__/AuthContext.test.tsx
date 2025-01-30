import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'

// Mock fetch
global.fetch = jest.fn()

jest.mock('next-auth/react')

// Test component that uses the auth context
const TestComponent = () => {
  const { user, status } = useAuth()
  return (
    <div>
      <div data-testid="status">{status}</div>
      {user && (
        <div data-testid="user">
          {user.name} - {user.email}
        </div>
      )}
    </div>
  )
}

const renderWithAuthProvider = (component: ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>)
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear any mocks and localStorage before each test
    jest.clearAllMocks()
    localStorage.clear()
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testuser' }),
      })
    )
  })

  it('provides authentication status and user data', () => {
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

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('Test User - test@example.com')
  })

  it('handles unauthenticated state', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    expect(screen.queryByTestId('user')).not.toBeInTheDocument()
  })

  it('handles loading state', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('status')).toHaveTextContent('loading')
    expect(screen.queryByTestId('user')).not.toBeInTheDocument()
  })

  it('provides initial auth state', () => {
    renderWithAuthProvider(<TestComponent />)
    
    expect(screen.queryByTestId('username')).not.toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('updates auth state on successful sign in', async () => {
    renderWithAuthProvider(<TestComponent />)
    
    const signInButton = screen.getByText('Sign In')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('username')).toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })
  })

  it('clears auth state on sign out', async () => {
    // Start with a signed-in state
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }))
    
    renderWithAuthProvider(<TestComponent />)
    
    const signOutButton = screen.getByText('Sign Out')
    
    await act(async () => {
      signOutButton.click()
    })

    await waitFor(() => {
      expect(screen.queryByTestId('username')).not.toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  it('persists auth state in localStorage', async () => {
    renderWithAuthProvider(<TestComponent />)
    
    const signInButton = screen.getByText('Sign In')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
      expect(storedUser).toBeTruthy()
      expect(storedUser.username).toBeTruthy()
    })
  })

  it('loads persisted auth state from localStorage', () => {
    const testUser = { username: 'testuser' }
    localStorage.setItem('user', JSON.stringify(testUser))
    
    renderWithAuthProvider(<TestComponent />)
    
    expect(screen.getByTestId('username')).toHaveTextContent(testUser.username)
  })

  it('handles sign in errors', async () => {
    // Mock fetch to simulate an error response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to sign in'))
    )

    renderWithAuthProvider(<TestComponent />)
    
    const signInButton = screen.getByText('Sign In')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.queryByTestId('username')).not.toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })
}) 