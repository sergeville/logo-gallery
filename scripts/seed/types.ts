import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  role?: 'admin' | 'user';
  profile?: {
    bio?: string;
    location?: string;
    skills?: string[];
  };
  createdAt: Date;
}

export interface Logo {
  _id: ObjectId;
  name: string;
  userId: ObjectId;
  tags: string[];
  description?: string;
  votes?: { userId: ObjectId; rating: number }[];
  averageRating?: number;
  rating?: number;
  createdAt: Date;
}

export interface Comment {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  content: string;
  parentId?: ObjectId;
  mentions?: ObjectId[];
  likes?: number;
  createdAt: Date;
}

export interface Collection {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  logos: ObjectId[];
  tags?: string[];
  collaborators?: ObjectId[];
  isPublic: boolean;
  sharedWith?: ObjectId[];
  createdAt: Date;
}

export interface Favorite {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
  createdAt: Date;
}

export interface Relationships {
  comments: Comment[];
  collections: Collection[];
  favorites: Favorite[];
} 