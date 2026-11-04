const db = require('../db');

// Create a notification for a user.
// Accepts an optional transaction connection.
async function createNotification({
  userId,
  type,
  message,
  referenceType = null,
  referenceId = null
}, connection = null) {

  const executor = connection || db;

  const [result] = await executor.execute(
    `INSERT INTO notifications
      (user_id, type, message, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, type, message, referenceType, referenceId]
  );

  return {
    id: result.insertId,
    user_id: userId,
    type,
    message,
    reference_type: referenceType,
    reference_id: referenceId,
    is_read: false
  };
}

// Get notifications belonging to one user.
async function getNotifications(userId, limit = 50, offset = 0) {
  const [rows] = await db.execute(
    `SELECT
       id,
       user_id,
       type,
       message,
       reference_type,
       reference_id,
       is_read,
       created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return rows;
}

// Get unread notification count.
async function getUnreadCount(userId) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS unread_count
     FROM notifications
     WHERE user_id = ?
       AND is_read = FALSE`,
    [userId]
  );

  return Number(rows[0].unread_count);
}

// Mark one notification as read.
async function markAsRead(notificationId, userId) {
  const [result] = await db.execute(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = ?
       AND user_id = ?`,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
}

// Mark all notifications as read.
async function markAllAsRead(userId) {
  const [result] = await db.execute(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE user_id = ?
       AND is_read = FALSE`,
    [userId]
  );

  return result.affectedRows;
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};