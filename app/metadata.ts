import { Metadata, Viewport } from 'next'

/**
 * Application metadata configuration
 * Defines SEO-related information and favicon settings
 */
export const metadata: Metadata = {
  title: 'Logo Gallery',
  description: 'A curated collection of beautiful logos',
  keywords: ['logos', 'gallery', 'design', 'branding'],
  authors: [{ name: 'Logo Gallery Team' }],
  creator: 'Logo Gallery Team',
  publisher: 'Logo Gallery',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1524' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
} 