'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface NavigationFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export default function NavigationFallback({ error, onRetry }: NavigationFallbackProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  return (
    <div className="bg-[#0f1524] h-12 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link 
        href="/" 
        className="text-xl font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        aria-label="Home"
      >
        <Home size={20} />
        <span className="hidden sm:inline">Logo Gallery</span>
      </Link>
      
      {showError && (
        <div className="flex items-center gap-4">
          <span className="text-red-400 text-sm">Navigation error</span>
          <button
            onClick={() => {
              setShowError(false);
              onRetry?.();
            }}
            className="px-4 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
} 