'use client'

import React from 'react'
import { formatDistanceToNow, isValid, parseISO } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import DeleteLogoButton from './DeleteLogoButton'
import LogoImage from './LogoImage'

interface Logo {
  _id: string
  title: string
  description: string
  imageUrl: string
  userId: string
  createdAt: string | Date
  totalVotes?: number
}

interface LogoCardProps {
  logo: Logo
  showDelete?: boolean
}

export default function LogoCard({ logo, showDelete = false }: LogoCardProps) {
  const { data: session } = useSession()
  const isOwner = session?.user?.id === logo.userId

  const getUploadedDate = () => {
    try {
      if (!logo.createdAt) {
        return 'Unknown date'
      }

      let date: Date
      if (typeof logo.createdAt === 'string') {
        date = parseISO(logo.createdAt)
      } else {
        date = logo.createdAt
      }

      if (!isValid(date)) {
        return 'Unknown date'
      }

      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown date'
    }
  }

  const getImageUrl = () => {
    if (logo.imageUrl.startsWith('http')) {
      return logo.imageUrl;
    }
    // Ensure the URL starts with a forward slash
    const normalizedPath = logo.imageUrl.startsWith('/') ? logo.imageUrl : `/${logo.imageUrl}`;
    // Use the base URL from environment or default to empty string (relative path)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    return `${baseUrl}${normalizedPath}`;
  }

  return (
    <div 
      data-testid="logo-card"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <div className="relative" data-testid="logo-card">
        {/* Vote count overlay */}
        <div 
          data-testid="vote-count"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 rounded-full px-4 py-2"
        >
          <span className="text-3xl font-bold text-white">
            {logo.totalVotes || 0}
          </span>
        </div>
        <LogoImage
          src={getImageUrl()}
          alt={`Logo: ${logo.title} - ${logo.description}`}
          data-testid="logo-image"
        />
      </div>

      <div className="p-4">
        <h3 
          data-testid="logo-title"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
        >
          {logo.title}
        </h3>
        <p 
          data-testid="logo-description"
          className="text-gray-600 dark:text-gray-400 text-sm mb-4"
        >
          {logo.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span 
            data-testid="upload-date"
            className="text-gray-500 dark:text-gray-400"
          >
            {getUploadedDate()}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Link
            href={`/logos/${logo._id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
            data-testid="view-details-link"
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