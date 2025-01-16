import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';
import GalleryPage from '../gallery/page';

jest.mock('next-auth/react');

describe('Authentication Flow Integration', () => {
  const mockLogo = {
    _id: '123',
    url: 'https://example.com/logo.png',
    description: 'Test Logo',
    ownerId: '456',
    tags: ['test'],
    totalVotes: 0,
    createdAt: new Date('2025-01-14')
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockLogo])
      })
    ) as jest.Mock;
    (signIn as jest.Mock).mockClear();
  });

  it('shows auth modal when unauthenticated user tries to vote', async () => {
    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    const voteButton = await screen.findByRole('button', { name: /set as favorite/i });
    fireEvent.click(voteButton);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('allows voting after authentication', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    const voteButton = await screen.findByRole('button', { name: /set as favorite/i });
    fireEvent.click(voteButton);

    const emailInput = await screen.findByLabelText(/email/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false
      });
    });
  });

  it('handles login errors gracefully', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' });

    render(
      <AuthProvider>
        <GalleryPage />
      </AuthProvider>
    );

    const voteButton = await screen.findByRole('button', { name: /set as favorite/i });
    fireEvent.click(voteButton);

    const emailInput = await screen.findByLabelText(/email/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
}); 