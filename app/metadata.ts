import type { Metadata } from 'next'

/**
 * Application metadata configuration
 * Defines SEO-related information and favicon settings
 */
export const metadata: Metadata = {
  title: 'Logo Gallery',
  description: 'A gallery of logos from around the world',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1524' },
  ],
} 