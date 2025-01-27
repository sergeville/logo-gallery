/**
 * Root Layout Component
 * Provides the base structure and configuration for the entire application.
 * Includes global providers, metadata, and common layout elements.
 */

import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Header from './components/Header'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

/**
 * Application metadata configuration
 * Defines SEO-related information and favicon settings
 */
export const metadata: Metadata = {
  title: 'Logo Gallery',
  description: 'A gallery for sharing and discovering logos'
}

interface LayoutProps {
  children: ReactNode
  modal: ReactNode
}

/**
 * Root layout component that wraps all pages
 * Provides:
 * - HTML structure with language setting
 * - Hydration warnings suppression
 * - Global providers for theme, auth, etc.
 * - Common layout elements (header)
 */
export default function RootLayout({ children, modal }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  )
}
