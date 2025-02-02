import { ObjectId } from 'mongodb';
import { hash, compare } from 'bcryptjs';
import { connectToDatabase } from './db-config';

export interface UserProfile {
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
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface ProfileUpdateInput {
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
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileOperationResult {
  status: number;
  profile?: UserProfile;
  error?: string;
}

export async function getUserProfile(userId: string): Promise<ProfileOperationResult> {
  const { db } = await connectToDatabase();

  try {
    // Validate ObjectId format first
    if (!ObjectId.isValid(userId)) {
      return {
        status: 404,
        error: 'User not found',
      };
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return {
        status: 404,
        error: 'User not found',
      };
    }

    const profile: UserProfile = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks,
      preferences: user.preferences,
    };

    return {
      status: 200,
      profile,
    };
  } catch {
    return {
      status: 500,
      error: 'Error retrieving user profile',
    };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdateInput
): Promise<ProfileOperationResult> {
  const { db } = await connectToDatabase();

  try {
    const updateData: Partial<{
      displayName: string;
      bio: string;
      avatarUrl: string;
      socialLinks: {
        website?: string;
        twitter?: string;
        github?: string;
      };
      preferences: {
        emailNotifications: boolean;
        theme: 'light' | 'dark' | 'system';
      };
    }> = {};

    // Only include defined fields in update
    if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    if (updates.socialLinks) updateData.socialLinks = updates.socialLinks;
    if (updates.preferences) updateData.preferences = updates.preferences;

    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

    if (!result) {
      return {
        status: 404,
        error: 'User not found',
      };
    }

    const profile: UserProfile = {
      _id: result._id.toString(),
      email: result.email,
      username: result.username,
      displayName: result.displayName,
      bio: result.bio,
      avatarUrl: result.avatarUrl,
      socialLinks: result.socialLinks,
      preferences: result.preferences,
    };

    return {
      status: 200,
      profile,
    };
  } catch {
    return {
      status: 500,
      error: 'Error updating user profile',
    };
  }
}

export async function updatePassword(
  userId: string,
  { currentPassword, newPassword }: PasswordUpdateInput
): Promise<ProfileOperationResult> {
  const { db } = await connectToDatabase();

  try {
    // Validate ObjectId format first
    if (!ObjectId.isValid(userId)) {
      return {
        status: 404,
        error: 'User not found',
      };
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return {
        status: 404,
        error: 'User not found',
      };
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return {
        status: 401,
        error: 'Current password is incorrect',
      };
    }

    // Hash and update new password
    const hashedPassword = await hash(newPassword, 10);
    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPassword } });

    return {
      status: 200,
      profile: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
      },
    };
  } catch {
    return {
      status: 500,
      error: 'Error updating password',
    };
  }
}
