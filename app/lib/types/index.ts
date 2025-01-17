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

export interface Vote {
  userId: ObjectId;
  rating: number;
  timestamp: Date;
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
  votes: Vote[];
  createdAt: Date;
  updatedAt: Date;
}