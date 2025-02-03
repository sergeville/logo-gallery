import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
  signIn: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('Navbar', () => {
  const mockRouter = {
    refresh: jest.fn(),
    push: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Mock authenticated session by default
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      },
      status: 'authenticated'
    });
  });

  it('renders sign-out button when user is authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders sign-in button when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
    render(<Navbar />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('handles sign-out correctly', async () => {
    // Mock window.location
    const mockLocation = {
      href: 'http://localhost:3000/current-page'
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(<Navbar />);
    
    // Click sign-out button
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    // Verify signOut was called with correct params
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ redirect: false });
    });

    // Verify redirect to home page
    await waitFor(() => {
      expect(mockLocation.href).toBe('/');
    });
  });

  it('shows loading state during sign-out', async () => {
    // Mock signOut to delay
    (signOut as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Navbar />);
    
    // Click sign-out button
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    // Verify button is disabled during sign-out
    expect(signOutButton).toBeDisabled();

    // Wait for sign-out to complete
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  it('handles sign-out errors gracefully', async () => {
    // Mock signOut to throw error
    const error = new Error('Sign out failed');
    (signOut as jest.Mock).mockRejectedValue(error);
    
    // Mock console.error to prevent error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<Navbar />);
    
    // Click sign-out button
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    // Verify error is handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), error);
    });

    // Clean up
    consoleSpy.mockRestore();
  });
}); 