'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface HeroSectionProps {
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

export default function HeroSection({ onError, onRetry }: HeroSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const initializeHero = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate loading to ensure smooth transitions
      await new Promise(resolve => setTimeout(resolve, 300));

      setMounted(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize hero section');
      console.error('Hero section error:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    initializeHero();

    return () => {
      setMounted(false);
      setIsLoading(false);
      setError(null);
    };
  }, [initializeHero]);

  const handleRetry = useCallback(() => {
    setError(null);
    setMounted(false);
    onRetry?.();
    initializeHero();
  }, [onRetry, initializeHero]);

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" color="white" />
            <p className="text-white/80 text-sm">Loading hero section...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-white/80">{error.message}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              data-testid="hero-retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="hero relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20"
        data-testid="hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            >
              Logo Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-2xl mx-auto text-xl"
            >
              Discover and share beautiful logos from around the world
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex justify-center gap-4"
            >
              {status === 'authenticated' ? (
                <button
                  onClick={() => router.push('/upload')}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors md:py-4 md:text-lg md:px-10"
                >
                  Upload Logo
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </button>
              )}
              <button
                onClick={() => router.push('/gallery')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-500 bg-white hover:bg-gray-50 transition-colors md:py-4 md:text-lg md:px-10"
              >
                Browse Gallery
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
} 