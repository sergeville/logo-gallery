'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface LogoCardProps {
  name: string
  imageUrl: string
  uploadedAt: string | Date
  totalVotes: number
  rating: number
  isVoted?: boolean
  onVote?: () => void
  isRadioStyle?: boolean
}

export default function LogoCard({ 
  name, 
  imageUrl, 
  uploadedAt, 
  totalVotes, 
  rating,
  isVoted = false,
  onVote,
  isRadioStyle = false
}: LogoCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const finalImageUrl = imageError || !imageUrl 
    ? '/images/default-logo.png'
    : imageUrl.startsWith('http') 
      ? imageUrl 
      : imageUrl.startsWith('/') 
        ? imageUrl 
        : `/${imageUrl}`

  const handleVote = () => {
    if (onVote) {
      onVote();
    }
  };

  const getUploadedDate = () => {
    if (!uploadedAt) return new Date();
    return typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={finalImageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-2"
          onError={() => {
            setImageError(true)
            setIsLoading(false)
          }}
          onLoadingComplete={() => setIsLoading(false)}
          priority
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Uploaded {formatDistanceToNow(getUploadedDate())} ago
        </p>
        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type={isRadioStyle ? "radio" : "checkbox"}
              checked={isVoted}
              onChange={handleVote}
              name={isRadioStyle ? "logo-vote" : undefined}
              className={`h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 ${
                isRadioStyle ? 'rounded-full' : 'rounded'
              }`}
            />
            <span className="text-sm text-gray-600">Vote for this logo</span>
          </label>
          <span className="text-sm text-gray-500">{totalVotes} votes</span>
        </div>
      </div>
    </div>
  )
} 