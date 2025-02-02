'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 