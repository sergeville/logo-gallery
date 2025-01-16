import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '../AuthModal';
import { signIn } from 'next-auth/react';

jest.mock('next-auth/react');

describe('AuthModal', () => {
  const mockOnClose = jest.fn();
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <AuthModal
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null });

    render(
      <AuthModal
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Sign In'));

    await screen.findByText('Sign In');

    expect(signIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password123'
    });
    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });

  it('handles login error', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

    render(
      <AuthModal
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByText('Sign In'));

    await screen.findByText('Invalid credentials');

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('toggles between login and register forms', () => {
    render(
      <AuthModal
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.click(screen.getByText('Need an account? Sign up'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Already have an account? Sign in'));
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
}); 