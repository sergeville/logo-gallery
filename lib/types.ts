import { ObjectId } from 'mongodb';

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  resetToken?: {
    token: string;
    expires: Date;
  };
  favorites?: string[];
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  favorites?: string[];
}

export interface Logo {
  _id: ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  url?: string;
  tags: string[];
  userId: ObjectId;
  ownerName: string;
  category: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  votes: Array<{
    userId: string;
    rating: number;
    timestamp: Date;
  }>;
  averageRating: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientLogo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  url?: string;
  tags: string[];
  ownerName: string;
  ownerId: string;
  category: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  votes: number;
  averageRating: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VoteRequest {
  logoId: string;
  rating: number;
} 