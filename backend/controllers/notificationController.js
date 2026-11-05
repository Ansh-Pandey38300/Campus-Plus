const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications =
    await notificationService.getNotifications(
      req.user.id,
      req.query
    );

  res.status(200).json({
    status: 'success',
    count: notifications.length,
    data: notifications
  });
});

// GET /api/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount =
    await notificationService.getUnreadCount(
      req.user.id
    );

  res.status(200).json({
    status: 'success',
    unreadCount
  });
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const result =
    await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read.',
    data: result
  });
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  const result =
    await notificationService.markAllAsRead(
      req.user.id
    );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read.',
    data: result
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};