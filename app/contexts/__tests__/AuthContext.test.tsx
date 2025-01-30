import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import type { ReactNode } from 'react';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Test component that uses the auth context
function TestComponent() {
  const { user, signIn, signOut } = useAuth();
  return (
    <div>
      {user ? (
        <>
          <div data-testid="username">{user.username}</div>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn({ email: 'test@example.com', password: 'password' })}>
          Sign In
        </button>
      )}
    </div>
  );
}

function renderWithAuthProvider(component: ReactNode) {
  return render(<AuthProvider>{component}</AuthProvider>);
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testuser' }),
      })
    );
  });

  it('provides initial auth state', () => {
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates auth state on successful sign in', async () => {
    renderWithAuthProvider(<TestComponent />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });

  it('clears auth state on sign out', async () => {
    // Start with a signed-in state
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ username: 'testuser' }));
    
    renderWithAuthProvider(<TestComponent />);
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    
    await act(async () => {
      signOutButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  it('persists auth state in localStorage', async () => {
    renderWithAuthProvider(<TestComponent />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ username: 'testuser' })
      );
    });
  });

  it('loads persisted auth state from localStorage', () => {
    const testUser = { username: 'testuser' };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testUser));
    
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('username')).toHaveTextContent(testUser.username);
  });

  it('handles sign in errors', async () => {
    // Mock fetch to simulate an error response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to sign in'))
    );

    renderWithAuthProvider(<TestComponent />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
}); 