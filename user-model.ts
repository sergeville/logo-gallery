// src/models/User.ts
import mongoose from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
