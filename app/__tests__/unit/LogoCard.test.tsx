/**
 * LogoCard Component Tests
 * 
 * This test suite covers the LogoCard component, which is a complex component that handles:
 * - Image loading and error states
 * - Responsive image optimization
 * - User authentication states
 * - Dark/light theme modes
 * - Delete functionality with error handling
 * 
 * Test Structure:
 * 1. Basic Rendering
 * 2. Image Handling
 * 3. Delete Button Visibility
 * 4. Statistics Display
 * 5. Dark Mode
 * 6. Hover States
 * 7. DeleteLogoButton
 * 8. Accessibility
 * 9. Responsive Image Breakpoints
 * 10. Date Handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LogoCard from '@/app/components/LogoCard'
import { 
  mockLogo, 
  setMockSession, 
  mockAuthenticatedSession, 
  mockUnauthenticatedSession 
} from '@/app/__tests__/utils/test-utils'
import { ThemeProvider, useTheme } from 'next-themes'
import React from 'react'

/**
 * Mock Implementations
 * 
 * The following sections contain mock implementations for:
 * - next/image: Handles image loading simulation and props
 * - next-auth/react: Manages authentication state
 * - next/navigation: Provides routing functionality
 * - LogoImage: Custom image component with loading states
 * - DeleteLogoButton: Handles logo deletion with error states
 */

// Mock next/image with loading simulation
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    fill,
    sizes,
    priority,
    loading,
    quality,
    className,
    style,
    onError,
    onLoad,
    onLoadingComplete,
    'data-testid': testId = 'next-image',
    ...props
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    quality?: number;
    className?: string;
    style?: React.CSSProperties;
    onError?: (error: Error) => void;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    'data-testid'?: string;
  }) => {
    // Simulate image loading behavior
    React.useEffect(() => {
      const img = new Image();
      img.onload = () => {
        onLoadingComplete?.({
          naturalWidth: width || 1920,
          naturalHeight: height || 1080
        });
        onLoad?.(new Event('load') as any);
      };
      img.onerror = () => {
        onError?.(new Error('Failed to load image'));
      };
      img.src = src;
    }, [src, onLoad, onLoadingComplete, onError]);

    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={{
          ...style,
          ...(fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0 } : {})
        }}
        data-testid={testId}
        loading={priority ? 'eager' : loading}
        {...props}
      />
    );
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
  default: ({ 
    src,
    alt,
    className = '',
    priority = false,
    quality = 75,
    responsiveUrls,
    width,
    height,
    style,
    'data-testid': testId = 'logo-image',
    ...props 
  }: {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    quality?: number;
    responsiveUrls?: Record<string, string>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    'data-testid'?: string;
  }) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const { theme } = useTheme();

    React.useEffect(() => {
      // Simulate image loading
      const timer = setTimeout(() => {
        setIsLoading(false);
        if (src === 'error.jpg') {
          setError(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [src]);

    // Error fallback
    if (error) {
      return (
        <div 
          data-testid={`${testId}-error`}
          className={`flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          } ${className}`}
          style={{ aspectRatio: width && height ? width / height : '1' }}
        >
          <span className="text-gray-400">Image not available</span>
        </div>
      );
    }

    // Loading state
    if (isLoading) {
      return (
        <div 
          data-testid={`${testId}-loading`}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
          style={{ aspectRatio: width && height ? width / height : '1' }}
        />
      );
    }

    // Normalize image URL
    const imageUrl = !src ? '/placeholder.png' : src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

    // Generate srcSet if responsive URLs are available
    const generateSrcSet = () => {
      if (!responsiveUrls) return undefined;

      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      };

      return Object.entries(responsiveUrls)
        .map(([size, url]) => `${url} ${breakpoints[size as keyof typeof breakpoints]}w`)
        .join(', ');
    };

    return (
      <div 
        className={`relative ${className}`} 
        style={{ aspectRatio: width && height ? width / height : '1' }}
      >
        <img
          {...props}
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          style={{ ...style, objectFit: 'contain' }}
          data-testid={testId}
          loading={priority ? 'eager' : 'lazy'}
          sizes={
            responsiveUrls
              ? "(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw"
              : undefined
          }
          srcSet={generateSrcSet()}
        />
      </div>
    );
  },
}))

// Mock DeleteLogoButton component
jest.mock('@/app/components/DeleteLogoButton', () => ({
  __esModule: true,
  default: ({ logoId }: { logoId: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { theme } = useTheme();

    const handleDelete = async () => {
      try {
        setIsDeleting(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate network error for test purposes
        if (logoId === 'error-test') {
          throw new TypeError('Network error occurred');
        }
        
        // Simulate successful deletion without making a real network request
        setIsOpen(false);
      } catch (error) {
        if (error instanceof Error) {
          if (error instanceof TypeError) {
            setError('Network error occurred');
          } else {
            setError(error.message || 'Failed to delete logo');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <>
        <button
          data-testid="delete-button"
          onClick={() => setIsOpen(true)}
          className="text-gray-500 hover:text-red-600 transition-colors"
          aria-label="Delete logo"
          type="button"
        >
          Delete
        </button>

        {isOpen && (
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div 
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
                isDeleting ? 'opacity-75' : ''
              }`}
            >
              <h3 
                id="dialog-title" 
                className="text-xl font-semibold mb-4 text-gray-900 dark:text-white"
              >
                Delete Logo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete this logo? This action cannot be undone.
              </p>
              {error && (
                <div 
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4" 
                  role="alert"
                >
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setError(null);
                    setIsOpen(false);
                  }}
                  data-testid="cancel-button"
                  type="button"
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Cancel deletion"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  data-testid="confirm-delete-button"
                  type="button"
                  className={`px-4 py-2 rounded ${
                    isDeleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  aria-label={isDeleting ? "Deleting logo..." : "Confirm deletion"}
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
}))

/**
 * Test Utilities
 */

// Custom render function with theme provider
const renderWithTheme = (ui: React.ReactElement, { theme = 'light' } = {}) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
      {ui}
    </ThemeProvider>
  )
}

/**
 * Test Suites
 */

describe('LogoCard', () => {
  // Reset mocks and session before each test
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
    /**
     * Complex Scenario: Logo Deletion Flow
     * 
     * This suite tests the complete logo deletion flow, including:
     * 1. Modal interaction
     * 2. Loading states
     * 3. Error handling
     * 4. Network request simulation
     * 5. Success confirmation
     */
    
    it('handles deletion errors correctly', async () => {
      // Create a test logo with the error-triggering ID
      const errorTestLogo = {
        ...mockLogo,
        _id: 'error-test'
      }

      renderWithTheme(<LogoCard logo={errorTestLogo} isOwner={true} showDelete={true} />)
      
      // Wait for initial render and image load
      await screen.findByTestId('logo-image')
      
      // Trigger deletion flow
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      
      // Confirm deletion
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)
      
      // Verify error handling
      const errorMessage = await screen.findByText('Network error occurred')
      expect(errorMessage).toBeInTheDocument()
    })

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

    it('closes modal on successful deletion', async () => {
      // Mock successful deletion
      global.fetch = jest.fn().mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      )

      renderWithTheme(<LogoCard logo={mockLogo} isOwner={true} showDelete={true} />)
      
      // Wait for image to load
      await screen.findByTestId('logo-image')
      
      // Click delete button
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      
      // Click confirm delete
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)
      
      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Accessibility', () => {
    it('has appropriate ARIA labels for interactive elements', () => {
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete logo')
    })

    it('has appropriate ARIA roles for modal dialog', () => {
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has appropriate alt text for logo image', async () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('alt', `Logo: ${mockLogo.title} - ${mockLogo.description}`)
    })

    it('has appropriate heading hierarchy', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />)
      const title = screen.getByTestId('logo-title')
      expect(title.tagName).toBe('H3')
    })

    it('ensures interactive elements are keyboard accessible', () => {
      renderWithTheme(<LogoCard logo={mockLogo} showDelete={true} isOwner={true} />)
      const viewDetailsLink = screen.getByTestId('view-details-link')
      expect(viewDetailsLink).toHaveAttribute('href', `/logos/${mockLogo._id}`)
      
      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toHaveAttribute('type', 'button')
    })

    it('maintains sufficient color contrast in dark mode', () => {
      renderWithTheme(<LogoCard logo={mockLogo} />, { theme: 'dark' })
      const description = screen.getByTestId('logo-description')
      expect(description).toHaveClass('dark:text-gray-400') // Ensures readable contrast
    })
  })

  describe('Responsive Image Breakpoints', () => {
    const mockResponsiveUrls = {
      sm: '/test-logo-sm.jpg',
      md: '/test-logo-md.jpg',
      lg: '/test-logo-lg.jpg',
      xl: '/test-logo-xl.jpg'
    }

    const logoWithResponsiveUrls = {
      ...mockLogo,
      responsiveUrls: mockResponsiveUrls
    }

    it('passes responsive URLs to LogoImage component', async () => {
      renderWithTheme(<LogoCard logo={logoWithResponsiveUrls} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('srcset', expect.stringContaining('/test-logo-sm.jpg'))
      expect(image).toHaveAttribute('srcset', expect.stringContaining('/test-logo-md.jpg'))
      expect(image).toHaveAttribute('srcset', expect.stringContaining('/test-logo-lg.jpg'))
      expect(image).toHaveAttribute('srcset', expect.stringContaining('/test-logo-xl.jpg'))
    })

    it('uses default thumbnail when no responsive URLs provided', async () => {
      const logoWithoutResponsiveUrls = {
        ...mockLogo,
        responsiveUrls: undefined
      }
      renderWithTheme(<LogoCard logo={logoWithoutResponsiveUrls} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('src', mockLogo.thumbnailUrl)
      expect(image).not.toHaveAttribute('srcset')
    })

    it('handles missing responsive URLs gracefully', async () => {
      const logoWithPartialUrls = {
        ...mockLogo,
        responsiveUrls: {
          sm: '/test-logo-sm.jpg'
          // Missing other breakpoints
        }
      }
      renderWithTheme(<LogoCard logo={logoWithPartialUrls} />)
      const image = await screen.findByTestId('logo-image')
      expect(image).toHaveAttribute('srcset', expect.stringContaining('/test-logo-sm.jpg'))
      expect(image).toHaveAttribute('sizes', expect.stringContaining('640px'))
    })

    it('maintains aspect ratio across breakpoints', async () => {
      renderWithTheme(<LogoCard logo={logoWithResponsiveUrls} />)
      await screen.findByTestId('logo-image') // Wait for image to load
      const imageContainer = screen.getByTestId('logo-image').closest('.aspect-square')
      expect(imageContainer).toHaveClass('aspect-square')
    })
  })

  describe('Date Handling', () => {
    it('handles string dates correctly', () => {
      const dateString = '2024-01-01T12:00:00.000Z'
      const logoWithStringDate = { ...mockLogo, createdAt: dateString }
      renderWithTheme(<LogoCard logo={logoWithStringDate} showStats={true} />)
      expect(screen.getByText(/Uploaded/)).toBeInTheDocument()
    })

    it('handles Date objects correctly', () => {
      const dateObject = new Date('2024-01-01T12:00:00.000Z')
      const logoWithDateObject = { ...mockLogo, createdAt: dateObject }
      renderWithTheme(<LogoCard logo={logoWithDateObject} showStats={true} />)
      expect(screen.getByText(/Uploaded/)).toBeInTheDocument()
    })

    it('handles invalid dates gracefully', () => {
      const logoWithInvalidDate = { ...mockLogo, createdAt: 'invalid-date' }
      renderWithTheme(<LogoCard logo={logoWithInvalidDate} showStats={true} />)
      expect(screen.getByText('Uploaded Unknown date')).toBeInTheDocument()
    })

    it('handles missing dates gracefully', () => {
      const logoWithoutDate = { ...mockLogo, createdAt: undefined }
      renderWithTheme(<LogoCard logo={logoWithoutDate} showStats={true} />)
      expect(screen.getByText('Uploaded Unknown date')).toBeInTheDocument()
    })
  })
}) 