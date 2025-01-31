import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '@/app/components/AuthModal';
import { useAuth } from '@/app/contexts/AuthContext';
import { signIn } from 'next-auth/react';

// Mock the useAuth hook
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('AuthModal', () => {
  const mockSignIn = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    );
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('should render sign in form when isOpen is true', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render sign up form when mode is signup', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} mode="signup" />
    );
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('should call signIn when form is submitted', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message when sign in fails', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Authentication failed'));

    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Authentication failed. Please check your credentials.'
      );
    });
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 