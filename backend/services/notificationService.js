const notificationModel = require('../models/notificationModel');
const AppError = require('../utils/AppError');

function validateUserId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError('Invalid user ID.', 400);
    }

    return id;
}

function validateNotificationId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError('Invalid notification ID.', 400);
    }

    return id;
}

// Create a notification.
// This function will also be used by other backend services.
async function createNotification(data, connection = null) {
    if (!data || typeof data !== 'object') {
        throw new AppError('Invalid notification data.', 400);
    }

    const userId = validateUserId(data.userId);

    const allowedTypes = [
        'offer',
        'complaint',
        'deadline',
        'deal',
        'system'
    ];

    if (!allowedTypes.includes(data.type)) {
        throw new AppError('Invalid notification type.', 400);
    }

    if (
        typeof data.message !== 'string' ||
        !data.message.trim()
    ) {
        throw new AppError('Notification message is required.', 400);
    }

    if (data.message.trim().length > 1000) {
        throw new AppError(
            'Notification message cannot exceed 1000 characters.',
            400
        );
    }

    return notificationModel.createNotification(
        {
            userId,
            type: data.type,
            message: data.message.trim(),
            referenceType: data.referenceType || null,
            referenceId: data.referenceId || null
        },
        connection
    );
}

// Fetch notification history.
async function getNotifications(userIdValue, query = {}) {
    const userId = validateUserId(userIdValue);

    const limit = Math.min(
        Math.max(Number(query.limit) || 20, 1),
        50
    );

    const offset = Math.max(
        Number(query.offset) || 0,
        0
    );

    return notificationModel.getNotifications(
        userId,
        limit,
        offset
    );
}

// Fetch unread count.
async function getUnreadCount(userIdValue) {
    const userId = validateUserId(userIdValue);

    return notificationModel.getUnreadCount(userId);
}

// Mark an individual notification as read.
async function markAsRead(notificationIdValue, userIdValue) {
    const notificationId =
        validateNotificationId(notificationIdValue);

    const userId = validateUserId(userIdValue);

    const updated = await notificationModel.markAsRead(
        notificationId,
        userId
    );

    if (!updated) {
        throw new AppError(
            'Notification not found.',
            404
        );
    }

    return {
        id: notificationId,
        is_read: true
    };
}

// Mark all notifications as read.
async function markAllAsRead(userIdValue) {
    const userId = validateUserId(userIdValue);

    const updatedCount =
        await notificationModel.markAllAsRead(userId);

    return {
        updatedCount
    };
}

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};