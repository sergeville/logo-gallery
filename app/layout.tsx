/**
 * Root Layout Component
 * Provides the base structure and configuration for the entire application.
 * Includes global providers and common layout elements.
 */

'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import { SessionProvider } from '@/app/components/SessionProvider'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { usePerformanceMonitoring } from '@/app/hooks/usePerformanceMonitoring'

const inter = Inter({ subsets: ['latin'] })

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
  usePerformanceMonitoring();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-[#0f1524] dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow" data-testid="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
