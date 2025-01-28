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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: UserProfile;
}

export interface Logo {
  _id: string;
  name: string;
  url: string;
  dimensions: LogoDimensions;
} 