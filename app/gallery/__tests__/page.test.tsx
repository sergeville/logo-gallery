import { render, screen } from '@testing-library/react';
import Page from '@/app/gallery/page';
import { AuthProvider } from '@/app/contexts/AuthContext';

describe('Gallery Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renders logo cards', async () => {
    const mockLogo = {
      _id: '123',
      name: 'Test Logo',
      url: 'https://example.com/logo.png',
      description: 'Test Logo Description',
      ownerId: '456',
      tags: ['test'],
      totalVotes: 0,
      createdAt: new Date().toISOString()
    };

    const mockResponse = {
      logos: [mockLogo],
      pagination: {
        current: 1,
        total: 1,
        hasMore: false
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );

    expect(await screen.findByText('Test Logo')).toBeInTheDocument();
    expect(await screen.findByText('Test Logo Description')).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Failed to fetch logos'
      })
    });

    render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );

    expect(await screen.findByText(/failed to fetch logos/i)).toBeInTheDocument();
  });
}); 