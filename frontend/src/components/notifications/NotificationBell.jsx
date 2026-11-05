import { useCallback, useEffect, useState } from 'react';

import {
  Bell,
  CheckCheck,
  Check,
  LoaderCircle,
  X,
} from 'lucide-react';

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/api';

import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch notification history and unread count.
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const [notificationResponse, countResponse] =
        await Promise.all([
          getNotifications(20, 0),
          getUnreadNotificationCount(),
        ]);

      setNotifications(
        notificationResponse?.data || [],
      );

      setUnreadCount(
        Number(countResponse?.unreadCount) || 0,
      );
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications when the component mounts.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();
  }, [user, loadNotifications]);

  // Automatically check for new notifications every 10 seconds.
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Mark one notification as read.
  async function handleMarkAsRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: 1 }
            : notification,
        ),
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0),
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'Unable to update notification.');
    }
  }

  // Mark all notifications as read.
  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: 1,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError(err.message || 'Unable to update notifications.');
    }
  }

  // Format notification date and time.
  function formatDate(date) {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification bell button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((previous) => !previous);

          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell size={21} />

        {/* Unread notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {isOpen && (
        <>
          {/* Background overlay for mobile */}
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

              <div>
                <h3 className="font-bold text-slate-900">
                  Notifications
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread notifications
                </p>
              </div>

              <div className="flex items-center gap-2">

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto">

              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Loading notifications...
                </div>
              ) : error && notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="mt-3 text-sm font-semibold text-blue-600"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">

                  <Bell
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="font-semibold text-slate-700">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You are all caught up!
                  </p>

                </div>
              ) : (
                notifications.map((notification) => {
                  const isRead =
                    Boolean(Number(notification.is_read));

                  return (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 ${
                        !isRead ? 'bg-blue-50/60' : ''
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        {/* Notification status icon */}
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Bell size={16} />
                        </div>

                        {/* Notification details */}
                        <div className="min-w-0 flex-1">

                          <p className="break-words text-sm text-slate-800">
                            {notification.message}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(notification.created_at)}
                          </p>

                          {!isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkAsRead(notification.id)
                              }
                              className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              <Check size={14} />
                              Mark as read
                            </button>
                          )}

                        </div>

                        {/* Unread indicator */}
                        {!isRead && (
                          <span
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                            aria-label="Unread"
                          />
                        )}

                      </div>
                    </div>
                  );
                })
              )}

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-4 py-3 text-center">
              <p className="text-xs text-slate-500">
                Showing your latest 20 notifications
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  );
}