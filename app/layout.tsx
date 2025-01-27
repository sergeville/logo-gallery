/**
 * Root Layout Component
 * Provides the base structure and configuration for the entire application.
 * Includes global providers, metadata, and common layout elements.
 */

import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import RootLayoutClient from './RootLayoutClient'

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
  children: React.ReactNode
  modal?: React.ReactNode
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutClient>
          {children}
          {modal}
        </RootLayoutClient>
      </body>
    </html>
  )
}
