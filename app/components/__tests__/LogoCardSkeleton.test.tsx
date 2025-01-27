import { render, screen } from '@testing-library/react'
import LogoCardSkeleton from '../LogoCardSkeleton'

describe('LogoCardSkeleton', () => {
  describe('Rendering', () => {
    it('renders skeleton elements', () => {
      render(<LogoCardSkeleton />)
      
      // Check for skeleton image placeholder
      expect(screen.getByTestId('skeleton-image')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-image')).toHaveClass('animate-pulse')
      
      // Check for skeleton text elements
      const skeletonTexts = screen.getAllByTestId('skeleton-text')
      expect(skeletonTexts).toHaveLength(2) // Title and description placeholders
      skeletonTexts.forEach(element => {
        expect(element).toHaveClass('animate-pulse')
      })
    })

    it('renders with correct dimensions', () => {
      render(<LogoCardSkeleton />)
      
      const skeletonImage = screen.getByTestId('skeleton-image')
      const titleSkeleton = screen.getByTestId('skeleton-title')
      const descriptionSkeleton = screen.getByTestId('skeleton-description')
      
      // Verify dimensions
      expect(skeletonImage).toHaveClass('h-48 w-full')
      expect(titleSkeleton).toHaveClass('h-4 w-3/4')
      expect(descriptionSkeleton).toHaveClass('h-3 w-1/2')
    })

    it('applies correct styling', () => {
      render(<LogoCardSkeleton />)
      
      // Check container styling
      const container = screen.getByTestId('skeleton-container')
      expect(container).toHaveClass(
        'rounded-lg',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'p-4'
      )
      
      // Check background colors
      const skeletonElements = screen.getAllByTestId(/skeleton-/)
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('bg-gray-200', 'dark:bg-gray-700')
      })
    })

    it('renders skeleton elements with correct classes', () => {
      render(<LogoCardSkeleton />)
      
      const skeletonImage = screen.getByTestId('skeleton-image')
      const titleSkeleton = screen.getByTestId('skeleton-title')
      it('renders with correct container styles', () => {
        render(<LogoCardSkeleton />)
        
        const container = screen.getByTestId('skeleton-container')
        expect(container).toHaveClass('border border-gray-200 dark:border-gray-700 p-4')
      })

      it('applies correct background colors to skeleton elements', () => {
        render(<LogoCardSkeleton />)
        
        const skeletonElements = screen.getAllByTestId(/^skeleton-/)
        skeletonElements.forEach(element => {
          expect(element).toHaveClass('bg-gray-200 dark:bg-gray-700')
        })
      })
    })

    it('renders with correct container classes', () => {
      render(<LogoCardSkeleton />)
      const container = screen.getByTestId('skeleton-container')
      expect(container).toHaveClass('border border-gray-200 dark:border-gray-700 p-4')
    })
  })

  describe('Animation', () => {
    it('applies pulse animation to all skeleton elements', () => {
      render(<LogoCardSkeleton />)
      
      const skeletonElements = screen.getAllByTestId(/skeleton-/)
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse')
      })
    })
  })

  describe('Accessibility', () => {
    it('has appropriate ARIA attributes', () => {
      render(<LogoCardSkeleton />)
      
      const container = screen.getByTestId('skeleton-container')
      expect(container).toHaveAttribute('role', 'status')
      expect(container).toHaveAttribute('aria-label', 'Loading logo card')
    })
  })

  it('renders with correct container styles', () => {
    render(<LogoCardSkeleton />)

    const container = screen.getByTestId('skeleton-container')
    expect(container).toHaveClass('border border-gray-200 dark:border-gray-700 p-4')
  })

  it('applies correct background colors to skeleton elements', () => {
    render(<LogoCardSkeleton />)

    const skeletonElements = screen.getAllByTestId(/^skeleton-/)
    skeletonElements.forEach(element => {
      expect(element).toHaveClass('bg-gray-200 dark:bg-gray-700')
    })
  })
}) 