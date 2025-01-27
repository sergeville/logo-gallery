'use client';

import { ThemeProvider } from './components/ThemeProvider';
import { SessionProvider } from './components/SessionProvider';
import { Providers } from './providers';
import Navbar from './components/Navbar';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <Providers>
          <div className="page-container flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </SessionProvider>
    </ThemeProvider>
  );
} 