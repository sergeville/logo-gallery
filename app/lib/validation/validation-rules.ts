import type { UserProfile } from '../types'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message: string
}

const userProfileRules: Record<keyof UserProfile, ValidationRule> = {
  bio: {
    maxLength: 500,
    message: 'Bio must be less than 500 characters'
  },
  website: {
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: 'Must be a valid URL'
  },
  avatar: {
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: 'Must be a valid URL'
  },
  location: {
    maxLength: 100,
    message: 'Location must be less than 100 characters'
  },
  skills: {
    message: 'Skills must be an array of strings'
  }
}

export default userProfileRules 