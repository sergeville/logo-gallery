/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          dark: '#1C1C1E',
          white: '#FFFFFF',
        },
        status: {
          success: '#16a34a',
          error: '#dc2626',
          warning: '#eab308',
        },
        gray: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb',
          100: '#f3f4f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'heading-1': '2rem',
        'heading-2': '1.5rem',
        'heading-3': '1.25rem',
        'body': '1rem',
        'small': '0.875rem',
        'tiny': '0.75rem',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}