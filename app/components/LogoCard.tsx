'use client'

import Link from 'next/link'
import { ClientLogo } from '../../lib/types'
import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface LogoCardProps {
  logo: ClientLogo
  onVote?: (logoId: string) => void
  isVoting?: boolean
}

export default function LogoCard({ logo, onVote, isVoting = false }: LogoCardProps) {
  const { data: session } = useSession()
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Format owner name to handle both email and name consistently
  const displayOwner = () => {
    if (!logo.ownerName) {
      return { name: null, showLink: true };
    }
    
    const ownerNameLower = logo.ownerName.toLowerCase();
    
    // Special cases that need the Update Owner link
    const specialCases = ['unknown user', 'unknown owner', '', 'undefined', 'null'];
    if (specialCases.includes(ownerNameLower) || ownerNameLower.includes('unknown')) {
      return { name: null, showLink: true };
    }
    
    // Handle email addresses and admin
    if (ownerNameLower === 'admin') {
      return { name: 'admin', showLink: true };
    } else if (logo.ownerName.includes('@')) {
      return { name: logo.ownerName.split('@')[0], showLink: false };
    }
    
    return { name: logo.ownerName, showLink: false };
  };

  const ownerInfo = displayOwner();

  const handleVote = () => {
    if (onVote) {
      onVote(logo.id)
    }
  }

  return (
    <div className="bg-[#0A1A2F] rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
      <div className="relative aspect-video w-full bg-gray-800">
        {!imageError ? (
          <Image
            src={logo.imageUrl}
            alt={logo.name || 'Logo'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-contain transition-opacity duration-300 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Failed to load image
          </div>
        )}
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{logo.name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{logo.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>{logo.totalVotes} votes</span>
            <span className="mx-2">•</span>
            <span>Rating: {logo.averageRating.toFixed(1)}</span>
          </div>
          {session && onVote && (
            <button
              onClick={() => onVote(logo.id)}
              disabled={isVoting}
              className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50"
              aria-label="Vote"
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 