import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

type NotificationType = 'comment' | 'vote' | 'share';

interface NotificationDocument {
  _id: string;
  type: NotificationType;
  recipientId: string;
  senderId: string;
  logoId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPreferences {
  email: {
    comments: boolean;
    votes: boolean;
    shares: boolean;
  };
  push: {
    comments: boolean;
    votes: boolean;
    shares: boolean;
  };
  inApp: {
    comments: boolean;
    votes: boolean;
    shares: boolean;
  };
}

interface CreateNotificationInput {
  type: NotificationType;
  recipientId: string;
  senderId: string;
  logoId: string;
  content: string;
}

interface NotificationResult {
  status: number;
  notification: NotificationDocument;
}

interface NotificationsResult {
  status: number;
  notifications: NotificationDocument[];
  total: number;
}

interface SuccessResult {
  status: number;
  success: boolean;
}

interface PreferencesResult {
  status: number;
  preferences: NotificationPreferences;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationResult> {
  const db = await connectToDatabase();

  const notification = {
    ...input,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const result = await db.collection('notifications').insertOne(notification);
  notification._id = result.insertedId.toString();

  return { status: 200, notification: notification as NotificationDocument };
}

export async function getNotifications(
  userId: string,
  options: { page: number; limit: number; type?: NotificationType }
): Promise<NotificationsResult> {
  const db = await connectToDatabase();
  const { page, limit, type } = options;

  const query = { recipientId: userId, ...(type && { type }) };

  const total = await db.collection('notifications').countDocuments(query);

  const notifications = await db
    .collection('notifications')
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return { status: 200, notifications: notifications as NotificationDocument[], total };
}

export async function markAsRead(notificationId: string): Promise<NotificationResult> {
  const db = await connectToDatabase();

  const result = await db
    .collection('notifications')
    .findOneAndUpdate(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );

  return { status: 200, notification: result.value as NotificationDocument };
}

export async function markAllAsRead(userId: string): Promise<SuccessResult> {
  const db = await connectToDatabase();

  await db
    .collection('notifications')
    .updateMany({ recipientId: userId, isRead: false }, { $set: { isRead: true } });

  return { status: 200, success: true };
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<SuccessResult> {
  const db = await connectToDatabase();

  const result = await db.collection('notifications').deleteOne({
    _id: new ObjectId(notificationId),
    recipientId: userId,
  });

  return {
    status: 200,
    success: result.deletedCount === 1,
  };
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<PreferencesResult> {
  const db = await connectToDatabase();

  await db
    .collection('notification_preferences')
    .updateOne({ userId }, { $set: preferences }, { upsert: true });

  return { status: 200, preferences };
}

export async function getNotificationPreferences(userId: string): Promise<PreferencesResult> {
  const db = await connectToDatabase();

  const defaultPreferences: NotificationPreferences = {
    email: { comments: true, votes: true, shares: true },
    push: { comments: true, votes: true, shares: true },
    inApp: { comments: true, votes: true, shares: true },
  };

  const preferences = await db.collection('notification_preferences').findOne({ userId });

  return {
    status: 200,
    preferences: (preferences as NotificationPreferences) || defaultPreferences,
  };
}
