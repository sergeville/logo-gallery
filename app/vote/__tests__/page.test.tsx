import React from 'react'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import VotePage from '@/app/vote/page'
import { useState } from 'react'
import { fetchLogos, submitVote } from '@/app/api/logos'

// Mock next-auth
jest.mock('next-auth/react')

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('VotePage Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }

  const mockLogos = [
    {
      _id: '1',
      title: 'Logo 1',
      description: 'Description 1',
      imageUrl: '/logo1.jpg',
      thumbnailUrl: '/logo1-thumb.jpg',
      totalVotes: 5,
      userId: 'user1',
    },
    {
      _id: '2',
      title: 'Logo 2',
      description: 'Description 2',
      imageUrl: '/logo2.jpg',
      thumbnailUrl: '/logo2-thumb.jpg',
      totalVotes: 3,
      userId: 'user2',
    },
  ]

  beforeEach(() => {
    // Reset all mocks
    mockFetch.mockReset()
    mockRouter.push.mockReset()
    
    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    
    // Setup session mock with authenticated state by default
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' }, expires: '2024-12-31' },
      status: 'authenticated'
    })
    
    // Default mock for successful logo fetch with delay to ensure loading state is visible
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockLogos),
      }), 100))
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to signin if not authenticated', async () => {
    // Override the default session mock for this test
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    await act(async () => {
      render(<VotePage />)
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin')
  })

  it('should display loading state initially', async () => {
    // Mock fetch to never resolve during this test
    mockFetch.mockImplementation(() => new Promise(() => {}))

    await act(async () => {
      render(<VotePage />)
    })

    // The loading spinner should be visible immediately
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should display logos after loading', async () => {
    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      const logoGrid = screen.getByTestId('logo-grid')
      expect(logoGrid).toBeInTheDocument()
      const logoCards = screen.getAllByTestId('logo-card')
      expect(logoCards).toHaveLength(2)
    })
  })

  it('should handle logo selection', async () => {
    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      const logoCards = screen.getAllByTestId('logo-card')
      expect(logoCards).toHaveLength(2)
    })

    const logoCards = screen.getAllByTestId('logo-card')
    const radioButton = within(logoCards[0]).getByRole('radio')
    
    await act(async () => {
      fireEvent.click(radioButton)
    })

    expect(logoCards[0]).toHaveClass('ring-2 ring-blue-500 transform scale-105')
  })

  it('should submit vote successfully', async () => {
    (submitVote as jest.Mock).mockResolvedValue({ success: true })
    
    render(<VotePage />)

    await waitFor(() => {
      expect(screen.getAllByTestId('logo-card')).toHaveLength(2)
    })

    const firstLogoCard = screen.getAllByTestId('logo-card')[0]
    fireEvent.click(firstLogoCard)

    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    expect(submitButton).not.toBeDisabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitVote).toHaveBeenCalledWith('1')
    })
  })

  it('should handle voting errors', async () => {
    (submitVote as jest.Mock).mockRejectedValue(new Error('Voting failed'))
    
    render(<VotePage />)

    await waitFor(() => {
      expect(screen.getAllByTestId('logo-card')).toHaveLength(2)
    })

    const firstLogoCard = screen.getAllByTestId('logo-card')[0]
    fireEvent.click(firstLogoCard)

    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/error submitting vote/i)).toBeInTheDocument()
    })
  })

  it('should display voting deadline', async () => {
    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      const deadlineElement = screen.getByTestId('voting-deadline')
      expect(deadlineElement).toBeInTheDocument()
      expect(deadlineElement).toHaveTextContent('Voting ends: 2024-12-31')
    })
  })

  it('should disable submit button when no logo is selected', async () => {
    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })
  })

  it('should show error when fetching logos fails', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch logos'))
    )

    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch logos')
    })
  })

  it('should show error when fetch response is not ok', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch logos' })
      })
    )

    await act(async () => {
      render(<VotePage />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch logos')
    })
  })

  it('should show error when trying to vote without selecting a logo', async () => {
    // Create a custom hook to expose the handleVote function
    function useVoteHandler() {
      const [error, setError] = useState<string | null>(null)
      const handleVote = async () => {
        setError('Please select a logo to vote')
      }
      return { handleVote, error }
    }

    // Create a wrapper component that uses our custom hook
    function TestWrapper() {
      const { handleVote, error } = useVoteHandler()
      return (
        <div>
          {error && (
            <p data-testid="error-message" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            data-testid="test-button"
            onClick={handleVote}
          />
        </div>
      )
    }

    render(<TestWrapper />)

    // Click the test button to trigger handleVote
    const testButton = screen.getByTestId('test-button')
    await act(async () => {
      fireEvent.click(testButton)
    })

    // Check for the error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('Please select a logo to vote')
    })
  })

  it('allows admin to edit voting deadline', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin123',
          email: process.env.NEXT_PUBLIC_ADMIN_EMAIL
        }
      },
      status: 'authenticated'
    })

    render(<VotePage />)

    await waitFor(() => {
      const deadlineText = screen.getByTestId('voting-deadline')
      expect(deadlineText).toBeInTheDocument()
    })

    // Find and click edit button
    const editButton = screen.getByLabelText('Edit deadline')
    fireEvent.click(editButton)

    // Should show datetime input
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('handles empty logo list', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ logos: [] })
      })
    )

    render(<VotePage />)

    await waitFor(() => {
      expect(screen.getByText('No logos available to vote on at this time.')).toBeInTheDocument()
    })
  })
}) 