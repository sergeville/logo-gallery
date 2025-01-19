'use client'

import Image from 'next/image'
import { ClientLogo } from '@/app/lib/types'

interface LogoCardProps {
  logo: ClientLogo
  onVote?: () => void
}

export function LogoCard({ logo, onVote }: LogoCardProps) {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://placehold.co/400x380/666666/FFFFFF?text=Image+Not+Found';
  };

  return (
    <div className="bg-[#0A1A2F] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
      <div className="relative aspect-[4/3] mb-4 bg-gray-800 rounded-lg overflow-hidden">
        <Image
          src={logo.imageUrl || logo.url}
          alt={logo.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-200"
          onError={handleImageError}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
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