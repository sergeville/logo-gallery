import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile {
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  company?: string;
}

export interface IUser extends Document {
  email: string;
  username: string;
  name: string;
  profile: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  bio: String,
  avatarUrl: String,
  website: String,
  location: String,
  company: String,
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profile: { type: UserProfileSchema, default: {} },
}, {
  timestamps: true,
});

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 