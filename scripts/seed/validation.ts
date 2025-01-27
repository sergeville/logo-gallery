import { ObjectId } from 'mongodb'
import type { ValidationResult, ValidationError, ValidationFix } from '@/app/lib/validation/validation-utils'

export interface ClientUser {
  _id?: string | ObjectId
  name: string
  email: string
  password?: string
  image?: string
  role?: 'USER' | 'ADMIN'
}

export interface ClientLogo {
  _id?: string | ObjectId
  name: string
  url: string
  description?: string
  imageUrl: string
  thumbnailUrl: string
  userId: string | ObjectId
  ownerId?: string | ObjectId
  category?: string
  tags?: string[]
  votes?: number
  createdAt?: Date
}

export async function validateUser(user: Partial<ClientUser>): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const fixes: ValidationFix[] = []

  // Validate required fields
  if (!user.email) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  if (!user.name) {
    errors.push({ field: 'name', message: 'Name is required' })
  }

  if (user.role && !['USER', 'ADMIN'].includes(user.role)) {
    errors.push({ field: 'role', message: 'Invalid role' })
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
    data: errors.length === 0 ? user : undefined
  }
}

export async function validateLogo(logo: Partial<ClientLogo>): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const fixes: ValidationFix[] = []

  // Validate required fields
  if (!logo.name) {
    errors.push({ field: 'name', message: 'Name is required' })
  }

  if (!logo.description) {
    errors.push({ field: 'description', message: 'Description is required' })
  }

  if (!logo.imageUrl) {
    errors.push({ field: 'imageUrl', message: 'Image URL is required' })
  } else if (!/^https?:\/\/.+/.test(logo.imageUrl)) {
    errors.push({ field: 'imageUrl', message: 'Invalid image URL format' })
  }

  if (!logo.thumbnailUrl) {
    errors.push({ field: 'thumbnailUrl', message: 'Thumbnail URL is required' })
  } else if (!/^https?:\/\/.+/.test(logo.thumbnailUrl)) {
    errors.push({ field: 'thumbnailUrl', message: 'Invalid thumbnail URL format' })
  }

  if (!logo.userId) {
    errors.push({ field: 'userId', message: 'User ID is required' })
  }

  if (!logo.category) {
    warnings.push({ field: 'category', message: 'Category is recommended' })
  }

  if (!logo.tags || !Array.isArray(logo.tags) || logo.tags.length === 0) {
    warnings.push({ field: 'tags', message: 'Tags are recommended' })
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
    data: errors.length === 0 ? logo : undefined
  }
} 