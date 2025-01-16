import { ObjectId } from 'mongodb';

export interface Logo {
  _id: ObjectId;
  url: string;
  description: string;
  ownerId: ObjectId;
  tags: string[];
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: ObjectId;
  email: string;
  name?: string;
  image?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
} 