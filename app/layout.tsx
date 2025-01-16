/**
 * Root Layout Component
 * Provides the base structure and configuration for the entire application.
 * Includes global providers, metadata, and common layout elements.
 */

import { Providers } from './providers'
import Header from './components/Header'
import './globals.css'
import type { Metadata } from 'next'

/**
 * Application metadata configuration
 * Defines SEO-related information and favicon settings
 */
export const metadata: Metadata = {
  title: 'Logo Gallery',
  description: 'A beautiful gallery of logos with rating and collection features',
  icons: {
    icon: '/favicon.ico',
  },
}

/**
 * Root layout component that wraps all pages
 * Provides:
 * - HTML structure with language setting
 * - Hydration warnings suppression
 * - Global providers for theme, auth, etc.
 * - Common layout elements (header)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div suppressHydrationWarning>
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
