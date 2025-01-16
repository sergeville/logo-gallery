import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  role?: 'admin' | 'user';
  profile?: {
    bio?: string;
    website?: string;
    avatar?: string;
    location?: string;
    skills?: string[];
  };
  createdAt: Date;
}

export interface Logo {
  _id: ObjectId;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  description?: string;
  userId: ObjectId;
  tags: string[];
  rating?: number;
  votes?: Array<{
    userId: ObjectId;
    rating: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt?: Date;
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

export interface TestDataOptions {
  logoCount?: number;
  commentsPerLogo?: number;
  maxRepliesPerComment?: number;
  collectionsPerUser?: number;
  logosPerCollection?: number;
  favoritesPerUser?: number;
}

export interface TestData {
  users: User[];
  logos: Logo[];
  comments: Comment[];
  collections: Collection[];
  favorites: Favorite[];
} 