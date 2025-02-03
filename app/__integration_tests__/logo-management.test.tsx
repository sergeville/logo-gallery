import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogoCard } from '../components/LogoCard'
import { UploadModal } from '../components/UploadModal'
import { generateTestLogo, generateTestUser } from '../utils/test-utils'

// Mock next-auth and navigation
jest.mock('next-auth/react')
jest.mock('next/navigation')

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

describe('Logo Management Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }
  const mockUser = generateTestUser()
  const mockLogo = generateTestLogo()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated'
    })
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  describe('Logo Upload Flow', () => {
    it('completes full upload process successfully', async () => {
      const onClose = jest.fn()
      const onSuccess = jest.fn()
      
      render(
        <UploadModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )

      // Create a mock file
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' })
      const input = screen.getByLabelText(/choose file/i)
      await user.upload(input, file)

      // Fill in logo details
      await user.type(screen.getByLabelText(/name/i), 'Test Logo')
      await user.type(screen.getByLabelText(/description/i), 'A test logo')
      await user.type(screen.getByLabelText(/tags/i), 'design,test')

      // Mock successful upload
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ logo: mockLogo })
      })

      // Submit form
      await user.click(screen.getByRole('button', { name: /upload/i }))

      // Verify success
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockLogo)
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('handles upload errors appropriately', async () => {
      render(
        <UploadModal
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />
      )

      // Submit without required fields
      await user.click(screen.getByRole('button', { name: /upload/i }))

      // Verify validation errors
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/file is required/i)).toBeInTheDocument()

      // Mock API error
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' })
      await user.upload(screen.getByLabelText(/choose file/i), file)
      await user.type(screen.getByLabelText(/name/i), 'Test Logo')

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'))

      await user.click(screen.getByRole('button', { name: /upload/i }))

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/failed to upload logo/i)).toBeInTheDocument()
      })
    })
  })

  describe('Logo Interaction Flow', () => {
    it('handles voting and interaction states', async () => {
      const onVote = jest.fn()
      render(
        <LogoCard
          logo={mockLogo}
          onVote={onVote}
          isVotingEnabled={true}
        />
      )

      // Initial state
      expect(screen.getByText(mockLogo.name)).toBeInTheDocument()
      expect(screen.getByText(`${mockLogo.totalVotes} votes`)).toBeInTheDocument()

      // Mock successful vote
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          logo: { ...mockLogo, totalVotes: mockLogo.totalVotes + 1 }
        })
      })

      // Vote for logo
      await user.click(screen.getByRole('button', { name: /vote/i }))

      // Verify vote registered
      await waitFor(() => {
        expect(onVote).toHaveBeenCalledWith(mockLogo.id)
        expect(screen.getByText(`${mockLogo.totalVotes + 1} votes`)).toBeInTheDocument()
      })
    })

    it('enforces authentication for protected actions', async () => {
      // Mock unauthenticated state
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(
        <LogoCard
          logo={mockLogo}
          onVote={jest.fn()}
          isVotingEnabled={true}
        />
      )

      // Try to vote
      await user.click(screen.getByRole('button', { name: /vote/i }))

      // Verify auth modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/sign in to vote/i)).toBeInTheDocument()
    })
  })

  describe('Logo Management Integration', () => {
    it('updates UI after successful upload', async () => {
      const { rerender } = render(
        <>
          <UploadModal
            isOpen={true}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
          <LogoCard
            logo={mockLogo}
            onVote={jest.fn()}
            isVotingEnabled={true}
          />
        </>
      )

      // Complete upload flow
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' })
      await user.upload(screen.getByLabelText(/choose file/i), file)
      await user.type(screen.getByLabelText(/name/i), 'New Logo')

      const newLogo = {
        ...mockLogo,
        name: 'New Logo',
        id: 'new-logo-id'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ logo: newLogo })
      })

      await user.click(screen.getByRole('button', { name: /upload/i }))

      // Verify new logo appears in list
      rerender(
        <>
          <UploadModal
            isOpen={false}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
          <LogoCard
            logo={newLogo}
            onVote={jest.fn()}
            isVotingEnabled={true}
          />
        </>
      )

      expect(screen.getByText('New Logo')).toBeInTheDocument()
    })
  })
}) 