import { WithId, ObjectId } from 'mongodb';

// Server-side types (using MongoDB ObjectId)
export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password?: string;
  favorites?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
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
  totalVotes: number;
  votes: {
    userId: ObjectId;
    rating: number;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
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
  totalVotes: number;
  votes: {
    userId: string;
    rating: number;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
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

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'url' | 'objectId' | 'array' | 'dateRange';
  message: string;
  minLength?: number;
}
