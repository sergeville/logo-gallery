import { ObjectId } from 'mongodb';
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateNotificationPreferences,
  getNotificationPreferences,
} from '../notification-operations';
import { connectToDatabase } from '../db-config';

describe('Notification Operations', () => {
  const testUser1Id = new ObjectId().toString();
  const testUser2Id = new ObjectId().toString();
  const testLogoId = new ObjectId().toString();

  beforeEach(async () => {
    const db = await connectToDatabase();
    await db.collection('notifications').deleteMany({});
    await db.collection('notification_preferences').deleteMany({});
  });

  describe('createNotification', () => {
    it('creates a notification successfully', async () => {
      const input = {
        type: 'comment' as const,
        recipientId: testUser1Id,
        senderId: testUser2Id,
        logoId: testLogoId,
        content: 'New comment on your logo',
      };

      const result = await createNotification(input);

      expect(result.status).toBe(200);
      expect(result.notification).toMatchObject({
        ...input,
        isRead: false,
      });
      expect(result.notification._id).toBeDefined();
      expect(result.notification.createdAt).toBeDefined();
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      // Create test notifications
      const notifications = [
        {
          type: 'comment',
          recipientId: testUser1Id,
          senderId: testUser2Id,
          logoId: testLogoId,
          content: 'First comment',
          isRead: false,
          createdAt: new Date(Date.now() - 3000).toISOString(),
        },
        {
          type: 'vote',
          recipientId: testUser1Id,
          senderId: testUser2Id,
          logoId: testLogoId,
          content: 'New vote',
          isRead: false,
          createdAt: new Date(Date.now() - 2000).toISOString(),
        },
        {
          type: 'share',
          recipientId: testUser1Id,
          senderId: testUser2Id,
          logoId: testLogoId,
          content: 'Shared your logo',
          isRead: true,
          createdAt: new Date(Date.now() - 1000).toISOString(),
        },
      ];

      const db = await connectToDatabase();
      await db.collection('notifications').insertMany(notifications);
    });

    it('gets paginated notifications', async () => {
      const result = await getNotifications(testUser1Id, { page: 1, limit: 2 });

      expect(result.status).toBe(200);
      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(3);
      // Should be sorted by createdAt desc
      expect(result.notifications[0].type).toBe('share');
      expect(result.notifications[1].type).toBe('vote');
    });

    it('filters notifications by type', async () => {
      const result = await getNotifications(testUser1Id, { page: 1, limit: 10, type: 'comment' });

      expect(result.status).toBe(200);
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe('comment');
    });
  });

  describe('markAsRead', () => {
    let notificationId: string;

    beforeEach(async () => {
      const db = await connectToDatabase();
      const result = await db.collection('notifications').insertOne({
        type: 'comment',
        recipientId: testUser1Id,
        senderId: testUser2Id,
        logoId: testLogoId,
        content: 'Test notification',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      notificationId = result.insertedId.toString();
    });

    it('marks a notification as read', async () => {
      const result = await markAsRead(notificationId);

      expect(result.status).toBe(200);
      expect(result.notification.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    beforeEach(async () => {
      const notifications = [
        {
          type: 'comment',
          recipientId: testUser1Id,
          senderId: testUser2Id,
          logoId: testLogoId,
          content: 'First notification',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          type: 'vote',
          recipientId: testUser1Id,
          senderId: testUser2Id,
          logoId: testLogoId,
          content: 'Second notification',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];

      const db = await connectToDatabase();
      await db.collection('notifications').insertMany(notifications);
    });

    it('marks all notifications as read for a user', async () => {
      const result = await markAllAsRead(testUser1Id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      const db = await connectToDatabase();
      const unreadCount = await db
        .collection('notifications')
        .countDocuments({ recipientId: testUser1Id, isRead: false });
      expect(unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    let notificationId: string;

    beforeEach(async () => {
      const db = await connectToDatabase();
      const result = await db.collection('notifications').insertOne({
        type: 'comment',
        recipientId: testUser1Id,
        senderId: testUser2Id,
        logoId: testLogoId,
        content: 'Test notification',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      notificationId = result.insertedId.toString();
    });

    it('deletes a notification', async () => {
      const result = await deleteNotification(notificationId, testUser1Id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);

      const db = await connectToDatabase();
      const notification = await db
        .collection('notifications')
        .findOne({ _id: new ObjectId(notificationId) });
      expect(notification).toBeNull();
    });

    it('fails to delete notification for wrong user', async () => {
      const result = await deleteNotification(notificationId, testUser2Id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(false);

      const db = await connectToDatabase();
      const notification = await db
        .collection('notifications')
        .findOne({ _id: new ObjectId(notificationId) });
      expect(notification).not.toBeNull();
    });
  });

  describe('notification preferences', () => {
    const testPreferences = {
      email: { comments: true, votes: false, shares: true },
      push: { comments: false, votes: true, shares: false },
      inApp: { comments: true, votes: true, shares: true },
    };

    it('updates notification preferences', async () => {
      const result = await updateNotificationPreferences(testUser1Id, testPreferences);

      expect(result.status).toBe(200);
      expect(result.preferences).toEqual(testPreferences);
    });

    it('gets default preferences for new user', async () => {
      const result = await getNotificationPreferences(testUser1Id);

      expect(result.status).toBe(200);
      expect(result.preferences).toEqual({
        email: { comments: true, votes: true, shares: true },
        push: { comments: true, votes: true, shares: true },
        inApp: { comments: true, votes: true, shares: true },
      });
    });

    it('gets updated preferences', async () => {
      await updateNotificationPreferences(testUser1Id, testPreferences);
      const result = await getNotificationPreferences(testUser1Id);

      expect(result.status).toBe(200);
      expect(result.preferences).toEqual(testPreferences);
    });
  });
});
