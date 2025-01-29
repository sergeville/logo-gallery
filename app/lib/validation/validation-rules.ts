import { ValidationFieldType, ValidationRule } from '.';
import type { UserProfile } from '@/app/lib/types';

export const profileValidationRules: Record<keyof UserProfile, ValidationRule> = {
  bio: {
    type: ValidationFieldType.String,
    field: 'bio',
    name: 'Bio',
    code: 'profile_bio',
    required: false,
    maxLength: 500
  },
  website: {
    type: ValidationFieldType.String,
    field: 'website',
    name: 'Website',
    code: 'profile_website',
    required: false
  },
  avatar: {
    type: ValidationFieldType.String,
    field: 'avatar',
    name: 'Avatar',
    code: 'profile_avatar',
    required: false
  },
  location: {
    type: ValidationFieldType.String,
    field: 'location',
    name: 'Location',
    code: 'profile_location',
    required: false
  },
  skills: {
    type: ValidationFieldType.Array,
    field: 'skills',
    name: 'Skills',
    code: 'profile_skills',
    required: false
  }
}; 