const Notification = require('./notification.model');
const User = require('../users/user.model');
const socket = require('../../socket/io');

async function createSystemNotification(recipientId, content) {
  if (!recipientId || !content) throw new Error('Recipient ID and content are required.');

  const notification = await Notification.createSystem(recipientId, content);

  try {
    await User.findByIdAndUpdate(recipientId, { $push: { notifications: notification._id } }, { new: true });
  } catch (error) {
    console.warn('Failed to add notification reference to user:', error.message || error);
  }

  try {
    const io = socket.getIO();
    io.to(String(recipientId)).emit('notification', notification.toObject ? notification.toObject() : notification);
  } catch (error) {
    console.error('Socket emit failed for system notification:', error.message || error);
  }

  return notification;
}

async function createNotification(recipientId, content, type, category = 'system', link = null) {
  if (!recipientId || !content) throw new Error('Recipient ID and content are required.');

  const notification = new Notification({
    recipient: recipientId,
    content,
    type,
    category,
    read: false,
    ...(link ? { link } : {}),
  });
  await notification.save();

  try {
    await User.findByIdAndUpdate(recipientId, { $push: { notifications: notification._id } }, { new: true });
  } catch (error) {
    console.warn('Failed to add notification reference to user:', error.message || error);
  }

  try {
    const io = socket.getIO();
    io.to(String(recipientId)).emit('notification', notification.toObject ? notification.toObject() : notification);
  } catch (error) {
    console.error('Socket emit failed for notification:', error.message || error);
  }

  return notification;
}

async function getUserNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).exec();
}

async function getNotificationById(notificationId, userId, userRole = null) {
  if (!notificationId) throw new Error('Notification ID is required.');
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found.');
  const isOwner = notification.recipient.toString() === String(userId);
  const isAdmin = userRole === 'admin';
  if (!isOwner && !isAdmin) throw new Error('Access denied.');
  return notification;
}

async function markNotificationAsRead(notificationId, userId) {
  const notification = await getNotificationById(notificationId, userId);
  notification.read = true;
  await notification.save();
  try {
    const io = socket.getIO();
    io.to(String(notification.recipient)).emit('notificationRead', { id: notification._id, notification });
    const unread = await getUnreadCount(notification.recipient);
    io.to(String(notification.recipient)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on markNotificationAsRead:', err.message || err);
  }
  return notification;
}

async function markAllAsRead(userId) {
  if (!userId) throw new Error('User ID is required.');
  const result = await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  try {
    const io = socket.getIO();
    io.to(String(userId)).emit('notificationsMarkedRead', { modifiedCount: result.modifiedCount });
    const unread = await getUnreadCount(userId);
    io.to(String(userId)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on markAllAsRead:', err.message || err);
  }
  return { modifiedCount: result.modifiedCount };
}

async function deleteNotification(notificationId, userId, userRole = null) {
  const notification = await getNotificationById(notificationId, userId, userRole);
  try {
    await User.findByIdAndUpdate(notification.recipient, { $pull: { notifications: notification._id } }, { new: true });
  } catch (error) {
    console.warn('Failed to remove notification reference from user:', error.message || error);
  }
  await notification.deleteOne();
  try {
    const io = socket.getIO();
    io.to(String(notification.recipient)).emit('notificationDeleted', { id: notification._id });
    const unread = await getUnreadCount(notification.recipient);
    io.to(String(notification.recipient)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on deleteNotification:', err.message || err);
  }
  return notification;
}

async function getUnreadCount(userId) {
  if (!userId) throw new Error('User ID is required.');
  return Notification.countDocuments({ recipient: userId, read: false, archived: { $ne: true } });
}

async function getArchivedNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  return Notification.find({ recipient: userId, archived: true }).sort({ createdAt: -1 }).exec();
}

async function getNonArchivedNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  return Notification.find({ recipient: userId, archived: { $ne: true } }).sort({ createdAt: -1 }).exec();
}

async function broadcastSystemNotification(content, recipientIds) {
  if (!content) throw new Error('Notification content is required.');
  const users = recipientIds?.length
    ? await User.find({ _id: { $in: recipientIds } })
    : await User.find({});

  const notifications = [];
  for (const user of users) {
    try {
      const notif = new Notification({ recipient: user._id, content, type: 'info', read: false });
      await notif.save();
      notifications.push(notif);
      try {
        await User.findByIdAndUpdate(user._id, { $push: { notifications: notif._id } }, { new: true });
      } catch (error) {
        console.warn(`Failed to add notification reference for user ${user._id}:`, error.message || error);
      }
      try {
        const io = socket.getIO();
        io.to(String(user._id)).emit('notification', notif.toObject ? notif.toObject() : notif);
      } catch (error) {
        console.error(`Socket emit failed for user ${user._id}:`, error.message || error);
      }
    } catch (error) {
      console.error(`Failed to create notification for user ${user._id}:`, error.message);
    }
  }

  return {
    count: notifications.length,
    notifications,
    message: recipientIds ? `Notification sent to ${notifications.length} users.` : `Notification broadcasted to ${notifications.length} users.`,
  };
}

async function archiveNotification(notificationId, userId, userRole = null) {
  const updated = await Notification.findByIdAndUpdate(notificationId, { archived: true }, { new: true });
  if (!updated) throw new Error('Notification not found.');
  try {
    const io = socket.getIO();
    io.to(String(updated.recipient)).emit('notificationArchived', { id: updated._id, notification: updated });
  } catch (err) {
    console.warn('Socket emit failed on archiveNotification:', err.message || err);
  }
  return updated;
}

async function deleteOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const result = await Notification.deleteMany({ type: 'system', createdAt: { $lt: cutoffDate } });
  return { deletedCount: result.deletedCount };
}

async function archiveAllNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  const result = await Notification.updateMany({ recipient: userId, archived: { $ne: true } }, { archived: true });
  try {
    if (result.modifiedCount > 0) {
      const io = socket.getIO();
      io.to(String(userId)).emit('notificationsArchived', { archivedCount: result.modifiedCount });
    }
  } catch (err) {
    console.warn('Socket emit failed on archiveAllNotifications:', err.message || err);
  }
  return { archivedCount: result.modifiedCount };
}

async function deleteAllNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  const result = await Notification.deleteMany({ recipient: userId, archived: { $ne: true } });
  try {
    const io = socket.getIO();
    io.to(String(userId)).emit('allNotificationsDeleted', { deletedCount: result.deletedCount });
  } catch (err) {
    console.warn('Socket emit failed on deleteAllNotifications:', err.message || err);
  }
  return { deletedCount: result.deletedCount };
}

async function deleteAllArchivedNotifications(userId) {
  if (!userId) throw new Error('User ID is required.');
  const result = await Notification.deleteMany({ recipient: userId, archived: true });
  try {
    const io = socket.getIO();
    io.to(String(userId)).emit('allArchivedNotificationsDeleted', { deletedCount: result.deletedCount });
  } catch (err) {
    console.warn('Socket emit failed on deleteAllArchivedNotifications:', err.message || err);
  }
  return { deletedCount: result.deletedCount };
}

async function autoArchiveOldNotifications(userId, daysOld = 15) {
  if (!userId) throw new Error('User ID is required.');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const result = await Notification.updateMany(
    { recipient: userId, archived: { $ne: true }, createdAt: { $lt: cutoffDate } },
    { archived: true }
  );
  if (result.modifiedCount > 0) {
    console.log(`Auto-archived ${result.modifiedCount} notifications older than ${daysOld} days for user ${userId}`);
  }
  return { archivedCount: result.modifiedCount };
}

module.exports = {
  createSystemNotification,
  createNotification,
  getUserNotifications,
  getNotificationById,
  getNonArchivedNotifications,
  getArchivedNotifications,
  markNotificationAsRead,
  markAllAsRead,
  archiveAllNotifications,
  deleteNotification,
  deleteAllNotifications,
  deleteAllArchivedNotifications,
  getUnreadCount,
  broadcastSystemNotification,
  archiveNotification,
  deleteOldNotifications,
  autoArchiveOldNotifications,
};
