import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';
import bcrypt from 'bcrypt';

interface UserProfile {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark';
  };
}

interface ProfileUpdateInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark';
  };
}

interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

interface ProfileResult {
  status: number;
  profile?: UserProfile;
  error?: string;
}

interface PasswordUpdateResult {
  status: number;
  error?: string;
}

// Validation constants based on standards
const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  bio: {
    maxLength: 500
  },
  location: {
    maxLength: 100
  }
} as const;

// Validation helper functions
function validateProfileUpdate(updates: ProfileUpdateInput): string | null {
  if (updates.displayName && (
    updates.displayName.length < VALIDATION_RULES.username.minLength ||
    updates.displayName.length > VALIDATION_RULES.username.maxLength ||
    !VALIDATION_RULES.username.pattern.test(updates.displayName)
  )) {
    return 'Display name must be 3-50 characters and contain only letters, numbers, dashes, and underscores';
  }

  if (updates.bio && updates.bio.length > VALIDATION_RULES.bio.maxLength) {
    return `Bio must not exceed ${VALIDATION_RULES.bio.maxLength} characters`;
  }

  return null;
}

function isValidObjectId(id: string): boolean {
  try {
    new ObjectId(id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserProfile(userId: string): Promise<ProfileResult> {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return { status: 500, error: 'Database connection failed' };
    }

    console.log('Getting profile for user ID:', userId);

    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      console.log('Invalid ObjectId format for user ID:', userId);
      return { status: 404, error: 'User not found' };
    }

    const objectId = new ObjectId(userId);
    console.log('Converted to ObjectId:', objectId);

    const user = await db.collection('users').findOne({ _id: objectId });
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found for ID:', userId);
      return { status: 404, error: 'User not found' };
    }

    // Remove sensitive fields and convert _id to string
    const { password, ...profile } = user;
    return { 
      status: 200, 
      profile: { 
        ...profile,
        _id: user._id.toString()
      } as UserProfile 
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { status: 500, error: 'Internal server error' };
  }
}

export async function updateUserProfile(userId: string, updates: ProfileUpdateInput): Promise<ProfileResult> {
  let db;
  try {
    console.log('Updating profile for user:', userId);
    console.log('Updates:', updates);

    const dbConnection = await connectToDatabase();
    if (!dbConnection || !dbConnection.db) {
      console.error('Database connection failed');
      return { status: 500, error: 'Database connection failed' };
    }
    db = dbConnection.db;

    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      console.log('Invalid ObjectId format:', userId);
      return { status: 404, error: 'User not found' };
    }

    // Get current user profile
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    console.log('Current user:', currentUser);

    if (!currentUser) {
      console.log('User not found:', userId);
      return { status: 404, error: 'User not found' };
    }

    // Prepare update object with only defined fields
    const updateObj: any = {};
    if (updates.displayName !== undefined) updateObj.displayName = updates.displayName;
    if (updates.bio !== undefined) updateObj.bio = updates.bio;
    if (updates.avatarUrl !== undefined) updateObj.avatarUrl = updates.avatarUrl;
    if (updates.socialLinks !== undefined) updateObj.socialLinks = updates.socialLinks;
    if (updates.preferences !== undefined) updateObj.preferences = updates.preferences;
    updateObj.updatedAt = new Date().toISOString();

    console.log('Update object:', updateObj);

    // Update user profile
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateObj },
      { returnDocument: 'after' }
    );

    console.log('Update result:', result);

    if (!result) {
      console.error('Failed to update profile - no result');
      return { status: 500, error: 'Failed to update profile' };
    }

    // Remove sensitive fields and convert _id to string
    const { password, ...profile } = result;
    const finalProfile = { 
      ...profile,
      _id: result._id.toString()
    } as UserProfile;

    console.log('Final profile:', finalProfile);

    return { 
      status: 200, 
      profile: finalProfile
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { status: 500, error: 'Database connection failed' };
  }
}

export async function updatePassword(userId: string, input: PasswordUpdateInput): Promise<PasswordUpdateResult> {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return { status: 500, error: 'Database connection failed' };
    }

    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      return { status: 404, error: 'User not found' };
    }

    // Get current user
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { status: 404, error: 'User not found' };
    }

    // Verify current password
    const validPassword = await bcrypt.compare(input.currentPassword, user.password);
    if (!validPassword) {
      return { status: 401, error: 'Current password is incorrect' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.newPassword, salt);

    // Update password
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return { status: 500, error: 'Failed to update password' };
    }

    return { status: 200 };
  } catch (error) {
    console.error('Error in updatePassword:', error);
    return { status: 500, error: 'Internal server error' };
  }
}
