import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role, DEFAULT_ROLE } from '../../config/roles.config';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'user', 'guest'],
    default: DEFAULT_ROLE,
    required: true
  },
  profile: {
    avatarUrl: {
      type: String,
      default: '/default-avatar.svg'
    },
    bio: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!candidatePassword) {
    console.error('No password provided for comparison');
    return false;
  }

  if (!this.password) {
    console.error('User has no password set');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison completed for user:', this.email);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed');
  }
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role: Role): boolean {
  return this.role === role;
};

// Only create the model if it doesn't exist
export const User = mongoose.models.User || mongoose.model('User', userSchema); 