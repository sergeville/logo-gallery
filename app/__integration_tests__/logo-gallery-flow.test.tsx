import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { LogoGallery } from '@/app/components/LogoGallery';
import { LogoUpload } from '@/app/components/LogoUpload';
import { mockLogoBase, mockLogoWithVotes, generateMockLogo } from '@/app/__tests__/fixtures/logo.fixtures';
import { mockAuthenticatedSession, mockAdminSession } from '@/app/__tests__/fixtures/user.fixtures';
import { TEST_TIMEOUTS, TEST_ERROR_MESSAGES } from '@/app/__tests__/constants';
import { cleanupTest, waitForAnimations, waitForImages, waitForNetwork, setupAsyncTest } from '@/app/__tests__/utils/test-reliability';
import { setupPerformanceMonitoring, performanceMonitor, trackNetworkRequest, withPerformanceTracking } from '@/app/__tests__/utils/test-performance';

// Wrap components with performance tracking
const TrackedLogoGallery = withPerformanceTracking(LogoGallery, 'LogoGallery');
const TrackedLogoUpload = withPerformanceTracking(LogoUpload, 'LogoUpload');

const renderWithProviders = (
  ui: React.ReactElement,
  {
    session = mockAuthenticatedSession,
    theme = 'light'
  } = {}
) => {
  const { container, ...rest } = render(
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
        {ui}
      </ThemeProvider>
    </SessionProvider>
  );
  return { container, ...rest };
};

describe('Logo Gallery Flow', () => {
  const { withTimeout } = setupAsyncTest();

  // Set up performance monitoring
  setupPerformanceMonitoring();

  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation((...args) => {
      trackNetworkRequest();
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    // Mock IntersectionObserver for infinite scroll
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
  });

  afterEach(async () => {
    await cleanupTest();
  });

  describe('Logo Upload and Gallery Integration', () => {
    it('successfully uploads a logo and displays it in the gallery', async () => {
      // Mock successful upload
      const uploadedLogo = generateMockLogo();
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => {
          trackNetworkRequest();
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(uploadedLogo)
          });
        })
        // Mock gallery fetch
        .mockImplementationOnce(() => {
          trackNetworkRequest();
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ logos: [uploadedLogo], hasMore: false })
          });
        });

      const { container } = renderWithProviders(
        <>
          <TrackedLogoUpload />
          <TrackedLogoGallery />
        </>
      );

      await withTimeout(async () => {
        // Upload a logo
        const fileInput = screen.getByTestId('logo-upload-input');
        const file = new File(['logo content'], 'test-logo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for upload and gallery refresh
        await waitForNetwork();
        await waitForImages(container);
        await waitForAnimations();

        // Verify logo appears in gallery
        const galleryItem = screen.getByTestId(`logo-card-${uploadedLogo._id}`);
        expect(galleryItem).toBeInTheDocument();
        expect(within(galleryItem).getByText(uploadedLogo.name)).toBeInTheDocument();
      });
    });

    it('handles upload errors and shows appropriate error message', async () => {
      // Mock failed upload
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new TypeError(TEST_ERROR_MESSAGES.NETWORK))
      );

      const { container } = renderWithProviders(
        <>
          <TrackedLogoUpload />
          <TrackedLogoGallery />
        </>
      );

      await withTimeout(async () => {
        // Attempt to upload a logo
        const fileInput = screen.getByTestId('logo-upload-input');
        const file = new File(['logo content'], 'test-logo.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for error handling
        await waitForNetwork().catch(() => {/* Expected error */});
        await waitForAnimations();

        // Verify error message
        expect(screen.getByText(TEST_ERROR_MESSAGES.NETWORK)).toBeInTheDocument();
      });
    });
  });

  describe('Gallery Interaction Flow', () => {
    it('loads more logos when scrolling', async () => {
      const initialLogos = Array.from({ length: 12 }, () => generateMockLogo());
      const nextPageLogos = Array.from({ length: 12 }, () => generateMockLogo());

      // Mock initial load and load more
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ logos: initialLogos, hasMore: true })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ logos: nextPageLogos, hasMore: false })
        }));

      const { container } = renderWithProviders(<TrackedLogoGallery />);

      await withTimeout(async () => {
        // Wait for initial load
        await waitForNetwork();
        await waitForImages(container);
        await waitForAnimations();

        // Verify initial logos
        initialLogos.forEach(logo => {
          expect(screen.getByTestId(`logo-card-${logo._id}`)).toBeInTheDocument();
        });

        // Trigger infinite scroll
        const observer = global.IntersectionObserver as jest.Mock;
        const [observerCallback] = observer.mock.calls[0];
        observerCallback([{ isIntersecting: true }]);

        // Wait for next page load
        await waitForNetwork();
        await waitForImages(container);
        await waitForAnimations();

        // Verify new logos are loaded
        nextPageLogos.forEach(logo => {
          expect(screen.getByTestId(`logo-card-${logo._id}`)).toBeInTheDocument();
        });
      });
    });

    it('filters logos by search term', async () => {
      const searchTerm = 'test';
      const matchingLogos = [
        generateMockLogo({ name: 'test logo 1' }),
        generateMockLogo({ name: 'test logo 2' })
      ];
      const nonMatchingLogo = generateMockLogo({ name: 'other logo' });

      // Mock search results
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          logos: [...matchingLogos, nonMatchingLogo],
          hasMore: false 
        })
      }));

      const { container } = renderWithProviders(<TrackedLogoGallery />);

      await withTimeout(async () => {
        // Wait for initial load
        await waitForNetwork();
        await waitForImages(container);

        // Perform search
        const searchInput = screen.getByTestId('logo-search-input');
        fireEvent.change(searchInput, { target: { value: searchTerm } });

        // Wait for debounce and search
        await new Promise(resolve => setTimeout(resolve, TEST_TIMEOUTS.DEBOUNCE));
        await waitForNetwork();
        await waitForAnimations();

        // Verify filtered results
        matchingLogos.forEach(logo => {
          expect(screen.getByTestId(`logo-card-${logo._id}`)).toBeInTheDocument();
        });
        expect(screen.queryByTestId(`logo-card-${nonMatchingLogo._id}`)).not.toBeInTheDocument();
      });
    });
  });

  describe('Admin Operations', () => {
    it('allows admin to perform bulk operations', async () => {
      const logos = Array.from({ length: 5 }, () => generateMockLogo());
      
      // Mock admin operations
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ logos, hasMore: false })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        }));

      const { container } = renderWithProviders(
        <TrackedLogoGallery />,
        { session: mockAdminSession }
      );

      await withTimeout(async () => {
        // Wait for initial load
        await waitForNetwork();
        await waitForImages(container);
        await waitForAnimations();

        // Select logos for bulk operation
        logos.forEach(logo => {
          const checkbox = screen.getByTestId(`logo-select-${logo._id}`);
          fireEvent.click(checkbox);
        });

        // Perform bulk operation
        const bulkDeleteButton = screen.getByTestId('bulk-delete-button');
        fireEvent.click(bulkDeleteButton);

        // Confirm deletion
        const confirmButton = screen.getByTestId('confirm-bulk-delete');
        fireEvent.click(confirmButton);

        // Wait for operation to complete
        await waitForNetwork();
        await waitForAnimations();

        // Verify logos are removed
        logos.forEach(logo => {
          expect(screen.queryByTestId(`logo-card-${logo._id}`)).not.toBeInTheDocument();
        });
      });
    });
  });
}); 