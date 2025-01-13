import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'
import { Logo } from '@/app/models/Logo'

interface LogoCardProps {
  logo: Logo
  onVote: (rating: number) => void
  onAuthRequired: () => void
}

export default function LogoCard({ logo, onVote, onAuthRequired }: LogoCardProps) {
  const [imageError, setImageError] = useState(false)
  const auth = useAuth()

  const handleVote = async (rating: number) => {
    if (!auth?.user) {
      onAuthRequired()
      return
    }

    onVote(rating)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="relative w-full h-48 mb-4">
        <Image
          src={imageError ? '/placeholder.png' : logo.imageUrl}
          alt={logo.name}
          style={{ objectFit: 'contain' }}
          fill
          onError={handleImageError}
          data-testid="logo-image"
          priority={false}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2" data-testid="logo-name">{logo.name}</h3>
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleVote(rating)}
              className="text-2xl focus:outline-none"
              data-testid={`rate-${rating}-button`}
            >
              {rating <= (logo.averageRating || 0) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600" data-testid="vote-count">
          ({logo.votes?.length || 0} votes)
        </span>
      </div>
    </div>
  )
} 