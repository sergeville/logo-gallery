/** @jsxImportSource react */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import App from '../../page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
};

export const createMockSession = (role: string = 'user'): Session => ({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: role,
    image: null
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

export const createMockFile = (): File => {
  const content = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const blob = new Blob([content], { type: 'image/png' });
  return new File([blob], 'test-logo.png', { 
    type: 'image/png',
    lastModified: new Date().getTime()
  });
};

interface AppWrapperProps {
  session: Session | null;
  children?: React.ReactNode;
}

const AppWrapper = ({ session }: AppWrapperProps): JSX.Element => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div data-testid="app-wrapper">
            <App />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export const renderApp = (session: Session | null = null): ReturnType<typeof render> => {
  return render(<AppWrapper session={session} />);
};

export const waitForAuthentication = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /upload logo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
}; 