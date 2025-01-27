import { render, screen, fireEvent } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import LogoCard from '../LogoCard'
import { generateTestLogo } from '@/app/utils/test-utils'

// Mock next-auth
jest.mock('next-auth/react')

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

describe('LogoCard', () => {
  const mockLogo = {
    id: 'test-logo-id',
    name: 'Test Logo',
    description: 'A test logo',
    imageUrl: '/test-logo.png',
    thumbnailUrl: '/test-logo-thumb.png',
    category: 'test',
    tags: ['test', 'logo'],
    dimensions: { width: 100, height: 100 },
    fileSize: 1024,
    fileType: 'image/png',
    averageRating: 4.5,
    totalVotes: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ownerId: 'test-user-id',
    ownerName: 'Test User'
  }
  const mockOnVote = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
  })

  describe('Rendering', () => {
    it('renders logo information correctly', () => {
      render(<LogoCard logo={mockLogo} />)

      expect(screen.getByText(mockLogo.name)).toBeInTheDocument()
      expect(screen.getByText(mockLogo.description)).toBeInTheDocument()
      expect(screen.getByAltText(mockLogo.name)).toHaveAttribute('src', mockLogo.imageUrl)
    })

    it('displays vote count and rating', () => {
      const logoWithVotes = {
        ...mockLogo,
        totalVotes: 10,
        averageRating: 4.5
      }

      render(<LogoCard logo={logoWithVotes} />)

      expect(screen.getByText('10 votes')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument()
    })

    it('handles owner name display correctly', () => {
      // Test email as owner name
      const logoWithEmailOwner = {
        ...mockLogo,
        ownerName: 'test@example.com'
      }
      const { rerender } = render(<LogoCard logo={logoWithEmailOwner} />)
      expect(screen.getByText('test')).toBeInTheDocument()

      // Test admin owner
      rerender(<LogoCard logo={{ ...mockLogo, ownerName: 'admin' }} />)
      expect(screen.getByText('admin')).toBeInTheDocument()

      // Test unknown user
      rerender(<LogoCard logo={{ ...mockLogo, ownerName: 'Unknown User' }} />)
      expect(screen.queryByText('Unknown User')).not.toBeInTheDocument()
    })
  })

  describe('Image Handling', () => {
    it('handles image loading states', () => {
      render(<LogoCard logo={mockLogo} />)
      
      const image = screen.getByAltText(mockLogo.name)
      fireEvent.load(image)
      
      expect(image).toBeInTheDocument()
    })

    it('handles image error state', () => {
      render(<LogoCard logo={mockLogo} />)
      
      const image = screen.getByAltText(mockLogo.name)
      fireEvent.error(image)
      
      // After error, image should be hidden
      expect(image).not.toBeVisible()
    })
  })

  describe('Voting Functionality', () => {
    beforeEach(() => {
      // Mock authenticated session
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com'
          }
        },
        status: 'authenticated'
      })
    })

    it('shows vote button when user is authenticated', () => {
      render(<LogoCard logo={mockLogo} onVote={mockOnVote} />)
      
      const voteButton = screen.getByRole('button', { name: /vote/i })
      expect(voteButton).toBeInTheDocument()
    })

    it('hides vote button when user is not authenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<LogoCard logo={mockLogo} onVote={mockOnVote} />)
      
      expect(screen.queryByRole('button', { name: /vote/i })).not.toBeInTheDocument()
    })

    it('handles vote click correctly', async () => {
      render(<LogoCard logo={mockLogo} onVote={mockOnVote} />)
      
      const voteButton = screen.getByRole('button', { name: /vote/i })
      fireEvent.click(voteButton)
      
      expect(mockOnVote).toHaveBeenCalledWith(mockLogo.id)
    })

    it('disables vote button while voting', () => {
      render(<LogoCard logo={mockLogo} onVote={mockOnVote} isVoting={true} />)
      
      const voteButton = screen.getByRole('button', { name: /voting/i })
      expect(voteButton).toBeDisabled()
      expect(voteButton).toHaveTextContent('Voting...')
    })
  })
}) 