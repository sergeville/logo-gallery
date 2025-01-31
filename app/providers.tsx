'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 