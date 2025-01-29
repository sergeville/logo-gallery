'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" />
      )}
    </button>
  )
} 