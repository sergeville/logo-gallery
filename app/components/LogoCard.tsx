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
    <div className="bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="relative h-[320px] mb-4 bg-gray-700 rounded-lg">
        <Image
          src={logo.imageUrl || logo.url}
          alt={logo.name}
          fill
          className="object-contain p-4"
          onError={handleImageError}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{logo.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              {logo.totalVotes || 0} votes
            </span>
            {onVote && (
              <button 
                onClick={onVote}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Vote
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          by {logo.ownerName || 'Unknown User'}
        </div>
        
        {logo.tags && logo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {logo.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 