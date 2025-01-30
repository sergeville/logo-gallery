import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import LogoCard from '../LogoCard';
import { mockLogoBase, mockLogoWithResponsiveUrls, mockLogoWithError } from '@/app/__tests__/fixtures/logo.fixtures';
import { mockUserBase, mockAuthenticatedSession, mockUnauthenticatedSession } from '@/app/__tests__/fixtures/user.fixtures';
import { TEST_TIMEOUTS, TEST_ERROR_MESSAGES } from '@/app/__tests__/constants';
import { cleanupTest, waitForAnimations, waitForImages, waitForNetwork, setupAsyncTest, setupErrorBoundaryTest, trackEventListener } from '@/app/__tests__/utils/test-reliability';
import { TestErrorBoundary } from './TestErrorBoundary';

// Custom render function with theme provider
const renderWithTheme = (ui: React.ReactElement, { theme = 'light' } = {}) => {
  const { container, ...rest } = render(
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
      {ui}
    </ThemeProvider>
  );
  return { container, ...rest };
};

describe('LogoCard', () => {
  // Set up async test utilities
  const { withTimeout } = setupAsyncTest();
  
  // Set up error boundary testing
  const { wrapWithErrorBoundary } = setupErrorBoundaryTest(TestErrorBoundary);

  // Clean up after each test
  afterEach(async () => {
    await cleanupTest();
  });

  it('renders without crashing', async () => {
    const { container } = renderWithTheme(<LogoCard logo={mockLogoBase} />);
    
    expect(screen.getByTestId('logo-image-loading')).toBeInTheDocument();
    
    await withTimeout(async () => {
      await waitForImages(container);
      const image = await screen.findByTestId('logo-image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('shows loading state and handles successful load', async () => {
      const { container } = renderWithTheme(<LogoCard logo={mockLogoBase} />);
      
      // Check loading state
      expect(screen.getByTestId('logo-image-loading')).toBeInTheDocument();
      
      // Wait for image to load
      await withTimeout(async () => {
        await waitForImages(container);
        await waitForAnimations();
        
        const image = await screen.findByTestId('logo-image');
        expect(image).toBeInTheDocument();
        expect(screen.queryByTestId('logo-image-loading')).not.toBeInTheDocument();
      });
    });

    it('handles image load errors gracefully', async () => {
      const { container } = renderWithTheme(<LogoCard logo={mockLogoWithError} />);
      
      await withTimeout(async () => {
        await waitForImages(container).catch(() => {/* Expected error */});
        await waitForAnimations();
        
        expect(screen.getByTestId('logo-image-error')).toBeInTheDocument();
        expect(screen.getByText('Image not available')).toBeInTheDocument();
      });
    });
  });

  describe('DeleteLogoButton', () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      global.fetch = jest.fn();
    });

    it('handles successful deletion', async () => {
      // Mock successful deletion
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const onDelete = jest.fn();
      const { container } = renderWithTheme(
        <LogoCard 
          logo={mockLogoBase} 
          showDelete={true} 
          isOwner={true}
          onDelete={onDelete}
        />
      );

      await withTimeout(async () => {
        // Wait for initial render
        await waitForImages(container);
        
        // Click delete button
        fireEvent.click(screen.getByTestId('delete-button'));
        await waitForAnimations();
        
        // Click confirm delete
        fireEvent.click(screen.getByTestId('confirm-delete-button'));
        
        // Wait for deletion and animation
        await waitForNetwork();
        await waitForAnimations();
        
        // Verify modal is closed and callback is called
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('handles network errors during deletion', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new TypeError(TEST_ERROR_MESSAGES.NETWORK))
      );

      const { container } = renderWithTheme(
        <LogoCard logo={mockLogoBase} showDelete={true} isOwner={true} />
      );

      await withTimeout(async () => {
        // Wait for initial render
        await waitForImages(container);
        
        // Click delete button
        fireEvent.click(screen.getByTestId('delete-button'));
        await waitForAnimations();
        
        // Click confirm delete
        fireEvent.click(screen.getByTestId('confirm-delete-button'));
        
        // Wait for error handling
        await waitForNetwork().catch(() => {/* Expected error */});
        await waitForAnimations();
        
        // Verify error message
        expect(screen.getByText(TEST_ERROR_MESSAGES.NETWORK)).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary', () => {
    it('catches and handles render errors', async () => {
      const errorMessage = 'Test render error';
      const BrokenComponent = () => {
        throw new Error(errorMessage);
        return null;
      };

      const onError = jest.fn();
      
      renderWithTheme(
        wrapWithErrorBoundary(
          () => (
            <LogoCard
              logo={{ ...mockLogoBase, Component: BrokenComponent }}
              showDelete={true}
              isOwner={true}
            />
          ),
          { onError }
        )
      );

      // Verify error boundary caught the error
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(onError).toHaveBeenCalled();
    });
  });
}); 