'use client';

import { Suspense } from 'react';
import LogoGallery from './components/LogoGallery';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { useEffect, useState } from 'react';

// Sample logo data with correct interface structure
const sampleLogos = [
  {
    _id: '1',
    title: 'Next.js',
    description: 'The React Framework for Production',
    imageUrl: '/logos/next.svg',
    thumbnailUrl: '/logos/next.svg',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 42,
    fileSize: 1024,
    optimizedSize: 512,
    compressionRatio: '50%'
  },
  {
    _id: '2',
    title: 'Vercel',
    description: 'Develop. Preview. Ship.',
    imageUrl: '/logos/vercel.svg',
    thumbnailUrl: '/logos/vercel.svg',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 38,
    fileSize: 2048,
    optimizedSize: 1024,
    compressionRatio: '50%'
  },
  {
    _id: '3',
    title: 'Sample Logo 1',
    description: 'A beautiful sample logo',
    imageUrl: '/logos/sample-logo.png',
    thumbnailUrl: '/logos/sample-logo.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 25,
    fileSize: 4096,
    optimizedSize: 2048,
    compressionRatio: '50%'
  },
  {
    _id: '4',
    title: 'Sample Logo 2',
    description: 'Another beautiful sample logo',
    imageUrl: '/logos/sample-logo-2.png',
    thumbnailUrl: '/logos/sample-logo-2.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 19,
    fileSize: 3072,
    optimizedSize: 1536,
    compressionRatio: '50%'
  },
  {
    _id: '5',
    title: 'Test Logo 1',
    description: 'First test logo',
    imageUrl: '/logos/test-logo-1.png',
    thumbnailUrl: '/logos/test-logo-1.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 15,
    fileSize: 5120,
    optimizedSize: 2560,
    compressionRatio: '50%'
  }
];

function HeroSection() {
  return (
    <section className="hero relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Logo Gallery
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl">
            Discover and share beautiful logos from around the world
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/upload"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
            >
              Upload Logo
            </a>
            <a
              href="/gallery"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-500 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Browse Gallery
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedLogos() {
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Reset error state when retrying
  useEffect(() => {
    if (retryCount > 0) {
      setError(null);
    }
  }, [retryCount]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load featured logos</p>
        <button
          onClick={() => setRetryCount(count => count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Featured Logos
        </h2>
      </div>
      <LogoGallery 
        logos={sampleLogos} 
        className="mt-8" 
        onError={(e) => setError(e)}
        key={`gallery-${retryCount}`} // Force remount on retry
      />
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="indigo-500" />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center text-red-600">Something went wrong. Please refresh the page.</div>}>
      {/* Hero Section with its own error boundary and suspense */}
      <ErrorBoundary fallback={<div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20" />}>
        <Suspense fallback={<div className="animate-pulse bg-gradient-to-r from-blue-600 to-indigo-700 py-20" />}>
          <HeroSection />
        </Suspense>
      </ErrorBoundary>

      {/* Main content with its own error boundary and suspense */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="main-content">
        <ErrorBoundary fallback={<div className="text-center py-12">Failed to load content. Please refresh.</div>}>
          <Suspense fallback={<LoadingSpinner />}>
            <FeaturedLogos />
          </Suspense>
        </ErrorBoundary>
      </main>
    </ErrorBoundary>
  );
}