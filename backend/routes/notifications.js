const express = require('express');
const router = express.Router();

const authenticateToken =
  require('../middleware/authenticateToken');

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Get notification history.
router.get(
  '/notifications',
  authenticateToken,
  getNotifications
);

// Get unread notification count.
router.get(
  '/notifications/unread-count',
  authenticateToken,
  getUnreadCount
);

// Mark all notifications as read.
// Keep this route before /:id/read for clarity.
router.patch(
  '/notifications/read-all',
  authenticateToken,
  markAllAsRead
);

// Mark an individual notification as read.
router.patch(
  '/notifications/:id/read',
  authenticateToken,
  markAsRead
);

module.exports = router;