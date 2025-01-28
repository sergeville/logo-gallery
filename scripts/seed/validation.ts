import { ObjectId } from 'mongodb'

interface User {
  _id?: string | ObjectId
  name: string
  email: string
  password?: string
  image?: string
}

interface Logo {
  _id?: string | ObjectId
  name: string
  url: string
  description?: string
  userId: string | ObjectId
  createdAt?: Date
}

export const validateUser = (user: Partial<User>): { isValid: boolean; error?: string } => {
  if (!user.name) {
    return { isValid: false, error: 'Name is required' }
  }

  if (!user.email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

export const validateLogo = (logo: Partial<Logo>): { isValid: boolean; error?: string } => {
  if (!logo.name) {
    return { isValid: false, error: 'Name is required' }
  }

  if (!logo.url) {
    return { isValid: false, error: 'URL is required' }
  }

  try {
    new URL(logo.url)
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }

  if (!logo.userId) {
    return { isValid: false, error: 'User ID is required' }
  }

  return { isValid: true }
} 