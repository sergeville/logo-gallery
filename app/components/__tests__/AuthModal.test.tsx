import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import AuthModal from '../AuthModal';
import { AuthProvider } from '../../context/AuthContext';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

// Mock the auth context
jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(() => ({
      login: mockLogin,
      register: mockRegister,
    })),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('AuthModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockLogin.mockClear();
    mockRegister.mockClear();
    // Reset mock implementations
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
  });

  it('renders login form by default', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign In');
    expect(screen.getByTestId('toggle-auth-mode')).toHaveTextContent('Create an account');
  });

  it('switches between login and registration modes', async () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    const toggleButton = screen.getByTestId('toggle-auth-mode');
    
    // Switch to registration mode
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Create Account');
    expect(toggleButton).toHaveTextContent('Sign in instead');

    // Switch back to login mode
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign In');
    expect(toggleButton).toHaveTextContent('Create an account');
  });

  it('handles form submission for login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByTestId('auth-form'));
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles form submission for registration', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    // Switch to registration mode
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-auth-mode'));
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByTestId('auth-form'));
    });

    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error message on authentication failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByTestId('auth-form'));
    });

    expect(await screen.findByTestId('error-message')).toHaveTextContent('Invalid credentials');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    // Create a promise that never resolves to simulate loading state
    mockLogin.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByTestId('auth-form'));
    });

    expect(screen.getByTestId('submit-button')).toBeDisabled();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Loading...');
  });
}); 