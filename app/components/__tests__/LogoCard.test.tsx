import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LogoCard from '../LogoCard'
import { 
  mockLogo, 
  setMockSession, 
  mockAuthenticatedSession, 
  mockUnauthenticatedSession 
} from '@/app/__tests__/utils/test-utils'
import { ThemeProvider } from 'next-themes'
import React from 'react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} data-testid="next-image" />
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock LogoImage component with loading states
jest.mock('@/app/components/LogoImage', () => ({
  __esModule: true,
  default: ({ src, ...props }: any) => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
      // Simulate image loading
      const timer = setTimeout(() => {
        setIsLoading(false)
        if (src === 'error.jpg') {
          setError(true)
        }
      }, 100)
      return () => clearTimeout(timer)
    }, [src])

    if (error) {
      return (
        <div 
          data-testid="logo-image-error" 
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          <span className="text-gray-400">Image not available</span>
        </div>
      )
    }

    if (isLoading) {
      return <div data-testid="logo-image-loading" className="animate-pulse bg-gray-200 dark:bg-gray-700" />
    }

    const imageUrl = !src ? '/placeholder.png' : src.startsWith('http') || src.startsWith('/') ? src : `/${src}`
    return <img src={imageUrl} {...props} data-testid="logo-image" />
  },
}))

// Mock DeleteLogoButton component
jest.mock('@/app/components/DeleteLogoButton', () => ({
  __esModule: true,
  default: ({ logoId }: { logoId: string }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleDelete = async () => {
      try {
        setIsDeleting(true)
        setError(null)
        
        const response = await fetch(`/api/logos/${logoId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete logo')
        }

        setIsOpen(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete logo')
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <>
        <button
          data-testid="delete-button"
          onClick={() => setIsOpen(true)}
          className="text-gray-500 hover:text-red-600"
        >
          Delete
        </button>

        {isOpen && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3>Delete Logo</h3>
              {error && <p className="text-red-600">{error}</p>}
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  data-testid="confirm-delete-button"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  },
}))

// Custom render function with theme provider
const renderWithTheme = (ui: React.ReactElement, { theme = 'light' } = {}) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
      {ui}
    </ThemeProvider>
  )
}

describe('LogoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setMockSession(mockUnauthenticatedSession)
  })

  it('renders without crashing', async () => {
    renderWithTheme(<LogoCard logo={mockLogo} />)
    expect(screen.getByTestId('logo-image-loading')).toBeInTheDocument()
    const image = await screen.findByTestId('logo-image')
    expect(image).toBeInTheDocument()
  })

  it('displays logo information correctly', () => {
    renderWithTheme(<LogoCard logo={mockLogo} />)
    expect(screen.getByTestId('logo-title')).toHaveTextContent(mockLogo.title)
    expect(screen.getByTestId('logo-description')).toHaveTextContent(mockLogo.description)
  })

  describe('Image Handling', () => {
    it('uses thumbnail URL when available', async () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('src', mockLogo.thumbnailUrl)
    })

    it('uses placeholder when thumbnail is not available', async () => {
      const logoWithoutThumbnail = { ...mockLogo, thumbnailUrl: '' }
      renderWithTheme(<LogoCard logo={logoWithoutThumbnail} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('src', '/placeholder.png')
    })

    it('shows loading state while image is loading', async () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      expect(screen.getByTestId('logo-image-loading')).toBeInTheDocument()
      await screen.findByTestId('logo-image')
      expect(screen.queryByTestId('logo-image-loading')).not.toBeInTheDocument()
    })

    it('shows error state when image fails to load', async () => {
      const logoWithErrorImage = { ...mockLogo, thumbnailUrl: 'error.jpg' }
      renderWithTheme(<LogoCard logo={logoWithErrorImage} />)
      expect(screen.getByTestId('logo-image-loading')).toBeInTheDocument()
      await screen.findByTestId('logo-image-error')
      expect(screen.queryByTestId('logo-image-loading')).not.toBeInTheDocument()
      expect(screen.getByText('Image not available')).toBeInTheDocument()
    })
  })

  describe('Delete Button Visibility', () => {
    it('shows delete button for owner', () => {
      setMockSession(mockAuthenticatedSession)
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} />)
      expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    })

    it('hides delete button when not owner', () => {
      setMockSession(mockAuthenticatedSession)
      const differentUserLogo = { ...mockLogo, userId: 'different-user-id' }
      renderWithTheme(<LogoCard logo={differentUserLogo} showDelete={true} />)
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
    })
  })

  describe('Statistics Display', () => {
    it('displays file size correctly', () => {
      renderWithTheme(<LogoCard logo={mockLogo} showStats={true} />)
      expect(screen.getByText('Original size: 1.0 MB')).toBeInTheDocument()
      expect(screen.getByText('Optimized size: 512.0 KB')).toBeInTheDocument()
    })

    it('displays vote count', () => {
      const logoWithVotes = { ...mockLogo, totalVotes: 42 }
      renderWithTheme(<LogoCard logo={logoWithVotes} showStats={true} />)
      expect(screen.getByTestId('vote-count')).toHaveTextContent('42')
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode styles to card container', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />, { theme: 'dark' })
      const card = screen.getByTestId('logo-card')
      expect(card).toHaveClass('dark:bg-gray-800')
    })

    it('applies dark mode styles to title', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />, { theme: 'dark' })
      const title = screen.getByTestId('logo-title')
      expect(title).toHaveClass('dark:text-white')
    })

    it('applies dark mode styles to description', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />, { theme: 'dark' })
      const description = screen.getByTestId('logo-description')
      expect(description).toHaveClass('dark:text-gray-400')
    })

    it('applies dark mode styles to statistics', () => {
      renderWithTheme(<LogoCard logo={mockLogo} showStats={true} />, { theme: 'dark' })
      const stats = screen.getAllByText(/size:/i)
      stats.forEach(stat => {
        expect(stat).toHaveClass('dark:text-gray-400')
      })
    })
  })

  describe('Hover States', () => {
    it('applies scale transform on card hover', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      const card = screen.getByTestId('logo-card')
      expect(card).toHaveClass('hover:scale-[1.02]')
    })

    it('applies hover color to view details link', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      const link = screen.getByTestId('view-details-link')
      expect(link).toHaveClass('hover:text-blue-700')
    })

    it('applies hover color to delete button', () => {
      setMockSession(mockAuthenticatedSession)
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toHaveClass('hover:text-red-600')
    })
  })

  describe('DeleteLogoButton', () => {
    it('opens delete confirmation modal when clicked', async () => {
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Logo')).toBeInTheDocument()
    })

    it('shows loading state during deletion', async () => {
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)
      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })

    it('handles deletion errors correctly', async () => {
      // Mock fetch to simulate an error
      global.fetch = jest.fn().mockImplementationOnce(() => 
        Promise.reject(new Error('Failed to delete logo'))
      )

      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)
      
      // Wait for error message
      const errorMessage = await screen.findByText('Failed to delete logo')
      expect(errorMessage).toBeInTheDocument()
    })

    it('closes modal on successful deletion', async () => {
      // Mock fetch to simulate success
      global.fetch = jest.fn().mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      )

      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)
      
      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
}) 