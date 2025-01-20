'use client'

import Image from 'next/image'
import { ClientLogo } from '@/app/lib/types'
import { useState } from 'react'

interface LogoCardProps {
  logo: ClientLogo
  onVote?: () => void
}

export function LogoCard({ logo, onVote }: LogoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div className="bg-[#0A1A2F] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
      <div className="relative aspect-[4/3] mb-4 bg-gray-800 rounded-lg overflow-hidden">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-center text-sm mb-3">Image failed to load.</p>
            <button 
              onClick={() => window.location.href = '/upload'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Try Upload Again
            </button>
          </div>
        ) : (
          <Image
            src={logo.imageUrl || logo.url}
            alt={logo.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
            onLoadingComplete={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white truncate">{logo.name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">
              {logo.totalVotes || 0} votes
            </span>
            {onVote && (
              <button 
                onClick={onVote}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Vote
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span className="inline-block w-6 h-6 rounded-full bg-gray-700 flex-shrink-0"></span>
          <span>{logo.ownerName || 'Unknown User'}</span>
        </div>
        
        {logo.tags && logo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {logo.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full font-medium hover:bg-gray-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 