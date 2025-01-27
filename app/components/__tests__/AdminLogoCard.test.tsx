import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminLogoCard } from '../AdminLogoCard'
import { generateTestLogo, generateTestUser } from '@/app/utils/test-utils'

// Mock next-auth
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

describe('AdminLogoCard', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }
  const mockOnUpdateOwner = jest.fn()
  const mockUsers = [
    generateTestUser({ name: 'User 1' }),
    generateTestUser({ name: 'User 2' }),
    generateTestUser({ email: 'user3@example.com' })
  ]
  const mockLogo = {
    ...generateTestLogo(),
    ownerId: mockUsers[0].id,
    ownerName: mockUsers[0].name
  }
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          ...generateTestUser(),
          role: 'admin'
        }
      },
      status: 'authenticated'
    })
  })

  describe('Rendering', () => {
    it('renders logo information', () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByText(mockLogo.name)).toBeInTheDocument()
      expect(screen.getByText(`${mockLogo.totalVotes} votes`)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('renders owner information correctly', () => {
      const logoWithEmail = {
        ...mockLogo,
        ownerName: 'test@example.com'
      }

      render(
        <AdminLogoCard
          logo={logoWithEmail}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('renders unknown owner state', () => {
      const logoWithoutOwner = {
        ...mockLogo,
        ownerName: '',
        ownerId: ''
      }

      render(
        <AdminLogoCard
          logo={logoWithoutOwner}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByText('Unknown owner')).toBeInTheDocument()
      expect(screen.getByText('Update Owner')).toBeInTheDocument()
    })

    it('renders tags when available', () => {
      const logoWithTags = {
        ...mockLogo,
        tags: ['design', 'branding']
      }

      render(
        <AdminLogoCard
          logo={logoWithTags}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByText('#design')).toBeInTheDocument()
      expect(screen.getByText('#branding')).toBeInTheDocument()
    })

    it('renders nothing when user is not admin', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            ...generateTestUser(),
            role: 'user'
          }
        },
        status: 'authenticated'
      })

      const { container } = render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('Image Handling', () => {
    it('shows loading state while image loads', () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(screen.getByRole('img')).toHaveAttribute('src', mockLogo.imageUrl)
    })

    it('shows placeholder on image error', () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      const image = screen.getByRole('img')
      fireEvent.error(image)

      expect(image).toHaveAttribute('src', '/placeholder-logo.png')
    })
  })

  describe('Owner Update', () => {
    it('handles owner update', async () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, mockUsers[0].id)
      await user.click(screen.getByRole('button', { name: /update owner/i }))

      expect(mockOnUpdateOwner).toHaveBeenCalledWith(mockLogo.id, mockUsers[0].id)
    })

    it('disables update button when no user selected', () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      expect(screen.getByRole('button', { name: /update owner/i })).toBeDisabled()
    })

    it('shows loading state during update', async () => {
      mockOnUpdateOwner.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, mockUsers[0].id)
      await user.click(screen.getByRole('button', { name: /update owner/i }))

      expect(screen.getByText('Updating...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('navigates to edit page on edit button click', async () => {
      render(
        <AdminLogoCard
          logo={mockLogo}
          onUpdateOwner={mockOnUpdateOwner}
          users={mockUsers}
        />
      )

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(mockRouter.push).toHaveBeenCalledWith(`/gallery/${mockLogo.id}/edit`)
    })
  })
}) 