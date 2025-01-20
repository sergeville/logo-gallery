'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import Image from 'next/image'
import { AuthModal } from '@/app/components/AuthModal'

export default function UploadPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    imageUrl: '',
    tags: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('File must be an image')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadType === 'file' && !selectedFile) {
      setError('Please select an image file')
      return
    }
    if (uploadType === 'url' && !formData.imageUrl) {
      setError('Please provide an image URL')
      return
    }

    // Wait for auth state to be ready
    if (loading) {
      setError('Please wait while we verify your session...')
      return
    }

    // Check auth after loading is complete
    if (!user?.email) {
      setShowAuthModal(true)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let imageUrl = formData.imageUrl
      let userId = user.id

      if (uploadType === 'file' && selectedFile) {
        // Upload the image file
        const formDataWithFile = new FormData()
        formDataWithFile.append('file', selectedFile)
        formDataWithFile.append('name', formData.name)
        
        const uploadResponse = await fetch('/api/logos/upload', {
          method: 'POST',
          body: formDataWithFile,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          if (uploadResponse.status === 401) {
            setShowAuthModal(true)
            return
          }
          throw new Error(errorData.error || 'Unable to upload the image. Please try again or choose a different file.')
        }

        const uploadData = await uploadResponse.json()
        if (!uploadData.imageUrl) {
          throw new Error('The server did not return the uploaded image URL. Please try again.')
        }
        imageUrl = uploadData.imageUrl
        userId = uploadData.userId
      }

      // Create the logo with the image URL and user ID
      const response = await fetch('/api/logos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          userId,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          setShowAuthModal(true)
          return
        } else if (response.status === 403) {
          throw new Error('You do not have permission to upload logos.')
        } else {
          throw new Error(errorData.error || 'Unable to save the logo information. Please try again.')
        }
      }

      const data = await response.json()
      if (!data.logo) {
        throw new Error('The logo was not saved properly. Please try again.')
      }

      // Redirect to profile page after successful upload
      router.push('/profile')
    } catch (err) {
      console.error('Error uploading logo:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Something went wrong while uploading your logo. Please try again later.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update preview when imageUrl changes
    if (name === 'imageUrl' && value) {
      setPreviewUrl(value)
    }
  }

  const handleUploadTypeChange = (type: 'file' | 'url') => {
    setUploadType(type)
    // Clear the other method's data
    if (type === 'file') {
      setFormData(prev => ({ ...prev, imageUrl: '' }))
    } else {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user?.email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Please log in to upload logos</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Upload Logo</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
            placeholder="Enter logo name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
            placeholder="Enter logo description"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo URL (website or source)
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required={!selectedFile}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleUploadTypeChange('file')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                uploadType === 'file'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleUploadTypeChange('url')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                uploadType === 'url'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Provide URL
            </button>
          </div>

          {uploadType === 'file' ? (
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileSelect}
                required={uploadType === 'file'}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required={uploadType === 'url'}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          )}

          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
              <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="design, minimalist, modern"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting || 
            (uploadType === 'file' && !selectedFile) || 
            (uploadType === 'url' && !formData.imageUrl) ||
            !formData.name ||
            !formData.description
          }
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            'Upload Logo'
          )}
        </button>
      </form>
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => {
            setShowAuthModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
} 