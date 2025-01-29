import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/app/contexts/AuthContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

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

export * from '@testing-library/react';
export { customRender as render };

export function renderWithProviders(ui: ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </AuthProvider>
  );
}

describe('renderWithProviders', () => {
  it('renders components with necessary providers', () => {
    const TestComponent = () => <div>Test Content</div>;
    const { getByText } = renderWithProviders(<TestComponent />);
    expect(getByText('Test Content')).toBeInTheDocument();
  });
}); 