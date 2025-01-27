import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  )
}

const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Helper to create test requests
export const createTestRequest = (url: string, options: RequestInit = {}) => {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
};

// Helper to create test responses
export const createTestResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('renderWithProviders', () => {
  it('renders components with necessary providers', () => {
    const TestComponent = () => <div>Test Content</div>;
    const { getByText } = renderWithProviders(<TestComponent />);
    expect(getByText('Test Content')).toBeInTheDocument();
  });
});

export { renderWithProviders as render } 