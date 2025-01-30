/* @.cursorignore
<custom_instructions>
1. Focus on reliability:
   - Ensure all tests are deterministic and avoid flaky tests
   - Use proper async/await patterns with waitFor
   - Implement thorough cleanup in beforeEach/afterEach
   - Mock external dependencies consistently

2. Maintain type safety:
   - Ensure all mocked data matches interface definitions
   - Use proper TypeScript type assertions
   - Verify type compatibility in component props
   - Handle null/undefined cases explicitly

3. Response formatting:
   - Use clear, descriptive test names
   - Group related tests logically
   - Add explanatory comments for complex test setup
   - Document test assumptions and edge cases

4. Communication style:
   - Explain changes with clear rationale
   - Highlight type-safety considerations
   - Note potential reliability concerns
   - Provide context for implementation decisions
</custom_instructions>
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { AuthProvider } from '@/app/contexts/AuthContext';
import GalleryPage from '@/app/gallery/page';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('Authentication Flow Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  };

  const mockLogo = {
    _id: '123',
    title: 'Test Logo',
    description: 'A test logo description',
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/logo-thumb.png',
    responsiveUrls: {
      sm: 'https://example.com/logo-sm.png',
      md: 'https://example.com/logo-md.png',
      lg: 'https://example.com/logo-lg.png'
    },
    userId: '456',
    createdAt: new Date('2025-01-14').toISOString(),
    fileSize: 1024,
    optimizedSize: 512,
    compressionRatio: '50%',
    tags: ['test', 'logo']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          logos: [mockLogo], 
          pagination: { 
            hasMore: false,
            current: 1,
            total: 1
          } 
        })
      })
    ) as jest.Mock;
    (signIn as jest.Mock).mockClear();
  });

  it('shows auth modal when unauthenticated user tries to access protected feature', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Wait for the redirect to sign in page
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/api/auth/signin');
    });
  });

  it('allows protected actions after authentication', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '456' },
        expires: '2025-01-14'
      },
      status: 'authenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Wait for the logo card to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('logo-card')).toBeInTheDocument();
    });

    // Verify that the delete button is visible for the logo owner
    const deleteButton = await screen.findByLabelText(/delete logo/i);
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles login errors gracefully', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Wait for the redirect to sign in page
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/api/auth/signin');
    });
  });

  it('shows upload button only when authenticated', async () => {
    // First render without authentication
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    expect(screen.queryByText(/upload logo/i)).not.toBeInTheDocument();

    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: { 
        user: { id: 'user123' },
        expires: '2025-01-14'
      },
      status: 'authenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/upload logo/i)).toBeInTheDocument();
    });
  });

  it('shows delete button only for logo owner', async () => {
    // Mock authenticated session as logo owner
    (useSession as jest.Mock).mockReturnValue({
      data: { 
        user: { id: '456' },
        expires: '2025-01-14'
      },
      status: 'authenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Wait for the logo card to be rendered and verify delete button is present
    await waitFor(() => {
      expect(screen.getByTestId('logo-card')).toBeInTheDocument();
      expect(screen.getByLabelText(/delete logo/i)).toBeInTheDocument();
    });

    // Re-render with different user
    (useSession as jest.Mock).mockReturnValue({
      data: { 
        user: { id: 'different-user' },
        expires: '2025-01-14'
      },
      status: 'authenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Verify delete button is not present for non-owner
    await waitFor(() => {
      expect(screen.queryByLabelText(/delete logo/i)).not.toBeInTheDocument();
    });
  });

  it('redirects to sign in page when session expires', async () => {
    // Start with authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: { 
        user: { id: 'user123' },
        expires: '2025-01-14'
      },
      status: 'authenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('logo-card')).toBeInTheDocument();
    });

    // Simulate session expiration
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    // Verify redirect to sign in page
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/api/auth/signin');
    });
  });
}); 