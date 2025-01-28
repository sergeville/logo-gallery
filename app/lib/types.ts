import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  password?: string;
  favorites?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  bio?: string;
  website?: string;
  avatar?: string;
  location?: string;
  skills?: string[];
}

export interface LogoDimensions {
  width: number;
  height: number;
}

export interface Logo {
  _id?: ObjectId;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: ObjectId;
  ownerName: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FixSuggestion {
  field: string;
  action: string;
  example: string;
  autoFixable: boolean;
}

// Client-side types (using string IDs)
export interface ClientUser {
  id: string;
  email: string;
  name: string;
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: string;
  ownerName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
