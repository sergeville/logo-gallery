'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'
import DeleteLogoButton from './DeleteLogoButton'

interface LogoCardProps {
  logo: {
    _id: string
    title: string
    description: string
    imageUrl: string
    userId: string
    createdAt: string
  }
  showDelete?: boolean
}

export default function LogoCard({ logo, showDelete = false }: LogoCardProps) {
  const { data: session } = useSession()
  const isOwner = session?.user?.id === logo.userId
  const [imageError, setImageError] = useState(false)

  const getUploadedDate = () => {
    try {
      const date = typeof logo.createdAt === 'string' ? new Date(logo.createdAt) : new Date(logo.createdAt)
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error parsing date:', error)
      return 'Invalid date'
    }
  }

  // Ensure the image URL is absolute and properly formatted
  const fullImageUrl = logo.imageUrl.startsWith('http') 
    ? logo.imageUrl 
    : logo.imageUrl.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${logo.imageUrl}`
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${logo.imageUrl}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group">
      <div className="aspect-w-16 aspect-h-9 relative">
        {!imageError ? (
          <Image
            src={fullImageUrl}
            alt={logo.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-gray-400 block">Image not available</span>
              <span className="text-gray-500 text-sm block mt-1">ID: {logo.imageUrl.split('/').pop()}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {logo.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {logo.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span className="text-gray-500 dark:text-gray-400">
            {getUploadedDate()}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Link
            href={`/logos/${logo._id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
          >
            View Details
          </Link>
          {showDelete && isOwner && (
            <DeleteLogoButton logoId={logo._id} />
          )}
        </div>
      </div>
    </div>
  )
} 