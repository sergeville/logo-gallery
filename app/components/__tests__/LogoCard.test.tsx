import { render, screen, fireEvent } from '@testing-library/react'
import LogoCard from '../LogoCard'
import { useAuth } from '@/app/context/AuthContext'
import { AuthProvider } from '@/app/context/AuthContext'

// Mock the auth context
jest.mock('@/app/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />
  },
}));

describe('LogoCard', () => {
  const mockLogo = {
    _id: '123',
    name: 'Test Logo',
    description: 'A test logo',
    imageUrl: 'https://placehold.co/400',
    thumbnailUrl: 'https://placehold.co/200',
    ownerId: 'user123',
    tags: ['test', 'logo'],
    category: 'test',
    dimensions: {
      width: 400,
      height: 400
    },
    fileSize: 1024,
    fileType: 'png',
    votes: [
      { userId: 'user1', rating: 4, createdAt: new Date() },
      { userId: 'user2', rating: 4, createdAt: new Date() },
    ],
    averageRating: 4,
    totalVotes: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockOnVote = jest.fn()
  const mockOnAuthRequired = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    })
  })

  describe('Basic Rendering', () => {
    it('renders logo information correctly', () => {
      render(
        <AuthProvider>
          <LogoCard logo={{...mockLogo, totalVotes: 2}} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      expect(screen.getByTestId('logo-name')).toHaveTextContent('Test Logo')
      expect(screen.getByTestId('vote-count')).toHaveTextContent('(2 votes)')
    })

    it('renders logo image correctly', () => {
      render(
        <AuthProvider>
          <LogoCard logo={mockLogo} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      const image = screen.getByTestId('logo-image')
      expect(image).toHaveAttribute('src', mockLogo.imageUrl)
      expect(image).toHaveAttribute('alt', mockLogo.name)
    })

    it('shows fallback when image fails to load', () => {
      render(
        <AuthProvider>
          <LogoCard logo={mockLogo} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      const image = screen.getByTestId('logo-image')
      fireEvent.error(image)

      expect(image).toHaveAttribute('src', '/placeholder.png')
    })
  })

  describe('Rating Interaction', () => {
    it('calls onAuthRequired when unauthenticated user tries to vote', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      })

      render(
        <AuthProvider>
          <LogoCard logo={mockLogo} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      const ratingButton = screen.getByTestId('rate-4-button')
      fireEvent.click(ratingButton)

      expect(mockOnAuthRequired).toHaveBeenCalled()
      expect(mockOnVote).not.toHaveBeenCalled()
    })

    it('calls onVote when authenticated user votes', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'testuser' },
        loading: false,
      })

      render(
        <AuthProvider>
          <LogoCard logo={mockLogo} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      const ratingButton = screen.getByTestId('rate-4-button')
      fireEvent.click(ratingButton)

      expect(mockOnVote).toHaveBeenCalledWith(mockLogo._id, 4)
      expect(mockOnAuthRequired).not.toHaveBeenCalled()
    })

    it('shows filled and empty stars based on average rating', () => {
      render(
        <AuthProvider>
          <LogoCard logo={mockLogo} onVote={mockOnVote} onAuthRequired={mockOnAuthRequired} />
        </AuthProvider>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons[0].textContent).toBe('⭐') // 1st star filled
      expect(buttons[1].textContent).toBe('⭐') // 2nd star filled
      expect(buttons[2].textContent).toBe('⭐') // 3rd star filled
      expect(buttons[3].textContent).toBe('⭐') // 4th star filled
      expect(buttons[4].textContent).toBe('☆') // 5th star empty
    })
  })
}) 