'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LogoImage from '../components/LogoImage'

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  userId: string;
  ownerName: string;
}

export default function VotePage() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos?votePage=true')
        if (!response.ok) {
          throw new Error('Failed to fetch logos')
        }
        const data = await response.json()
        setLogos(data.logos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logos')
      } finally {
        setLoading(false)
      }
    }

    fetchLogos()
  }, [session, router])

  const handleVote = async () => {
    if (!selectedLogo) {
      setError('Please select a logo to vote')
      return
    }

    try {
      const response = await fetch(`/api/logos/${selectedLogo}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to submit vote')
      }

      router.push('/gallery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    }
  }

  if (!session) {
    return null // Handled by useEffect redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vote for Your Favorite Logo
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Select one logo to vote. You cannot vote for your own logos.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div
              key={logo._id}
              className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 ${
                selectedLogo === logo._id
                  ? 'ring-2 ring-blue-500 transform scale-105'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="aspect-w-16 aspect-h-9 relative bg-gray-100 dark:bg-gray-700">
                <LogoImage
                  src={logo.thumbnailUrl}
                  alt={`Logo: ${logo.name} by ${logo.ownerName}`}
                  className="p-4"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {logo.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {logo.ownerName}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  {logo.description}
                </p>
                <div className="mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="logo-vote"
                      checked={selectedLogo === logo._id}
                      onChange={() => setSelectedLogo(logo._id)}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Select to vote
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logos.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleVote}
              disabled={!selectedLogo}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Vote
            </button>
          </div>
        )}

        {logos.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              No logos available to vote on at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 