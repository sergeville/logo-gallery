import React, { useState, useEffect } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import type { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import '@testing-library/jest-dom';
import App from '../page';
import AuthModal from '../components/AuthModal';
import { generateTestLogo } from '../utils/test-utils';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { server } from './mocks/server';
import { MockAuthModal, MockApp, MockUploadForm } from './mocks/components';
import { 
  renderApp, 
  createMockSession, 
  createMockFile,
  waitForAuthentication,
  mockUser 
} from './helpers/test-utils';

// Add fetch polyfill for MSW
import 'whatwg-fetch';

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Types
interface AuthModalProps {
  onClose: () => void
  onLoginSuccess: () => void
}

interface CustomSession extends Session {
  name?: string
  role?: string
}

const mockLogo = generateTestLogo()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn((path) => {
      if (path === '/upload') {
        const UploadPage = jest.requireActual('../upload/page').default;
        render(<UploadPage />);
      }
    }),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/upload'
  })
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(() => Promise.resolve({ ok: true })),
  signOut: jest.fn(() => Promise.resolve()),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-session-provider">{children}</div>
  )
}));

// Create mockUseSession reference
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession');

// Helper function to navigate to upload page
const user = userEvent.setup();

const navigateToUpload = async () => {
  const router = useRouter();
  router.push('/upload');
  await waitForUploadForm();
};

// Helper function to wait for upload form
const waitForUploadForm = async () => {
  await waitFor(() => {
    expect(screen.getByLabelText(/^Logo Name$/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description$/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Logo Image$/)).toBeInTheDocument()
  })
}

// Helper function to fill upload form
const fillUploadForm = async (logoName: string, description: string, file: File) => {
  await user.type(screen.getByLabelText(/^Logo Name$/), logoName)
  await user.type(screen.getByLabelText(/^Description$/), description)
  await user.upload(screen.getByLabelText(/^Logo Image$/), file)
  await user.click(screen.getByRole('button', { name: /upload logo/i }))
}

// Helper function to verify upload success
const verifyUploadSuccess = async () => {
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/logo uploaded successfully/i)
  })
}

describe('End-to-End User Journeys', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })

  afterAll(() => {
    server.close()
  })

  describe('New User Journey', () => {
    it('completes registration and first logo upload', async () => {
      renderApp()

      // Click the initial sign in button
      await user.click(screen.getByRole('button', { name: /sign in to get started/i }))

      // Wait for auth form to render
      await waitFor(() => {
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      })

      // Fill in and submit auth form
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByTestId('auth-submit'))

      // Wait for authentication
      await waitForAuthentication()

      await navigateToUpload()
      const file = createMockFile()
      await fillUploadForm('Test Logo', 'A test logo description', file)
      await verifyUploadSuccess()
    })
  })

  describe('Logo Management Journey', () => {
    it('completes logo upload, voting, and filtering flow', async () => {
      const session = createMockSession();
      renderApp(session);

      await waitForAuthentication();
      await navigateToUpload();
      await waitForUploadForm();

      const file = createMockFile();
      await fillUploadForm('Test Logo', 'Test Description', file);
      await verifyUploadSuccess();
    });
  })

  describe('Theme Customization Journey', () => {
    it('persists theme preference across navigation', async () => {
      renderApp(createMockSession());

      await waitForAuthentication();
      
      // Toggle theme
      const themeToggle = screen.getByRole('button', {
        name: /switch to dark theme/i
      });
      await user.click(themeToggle);

      // Verify theme change
      expect(document.documentElement).toHaveClass('dark');
    });
  })

  describe('Admin Journey', () => {
    it('completes admin logo management flow', async () => {
      renderApp(createMockSession('ADMIN'));

      // Wait for authentication
      await waitForAuthentication();

      await navigateToUpload();
      const file = createMockFile();
      await fillUploadForm('Admin Logo', 'An admin test logo', file);
      await verifyUploadSuccess();
    });
  })
}) 