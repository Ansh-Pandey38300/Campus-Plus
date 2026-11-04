import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const NotificationContext = createContext(null);

const notificationStyles = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const removeNotification = useCallback((id) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setNotifications((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }, []);

  const showNotification = useCallback(
    (message, type = 'info', duration) => {
      if (!message) return;

      const id = ++nextId.current;

      const defaultDuration =
        type === 'error' ? 4000 : 1000;

      const notification = {
        id,
        message,
        type,
      };

      setNotifications((previous) => [
        ...previous,
        notification,
      ]);

      const timer = setTimeout(() => {
        removeNotification(id);
      }, duration ?? defaultDuration);

      timers.current.set(id, timer);
    },
    [removeNotification],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const success = useCallback(
    (message, duration) =>
      showNotification(message, 'success', duration),
    [showNotification],
  );

  const error = useCallback(
    (message, duration) =>
      showNotification(message, 'error', duration),
    [showNotification],
  );

  const warning = useCallback(
    (message, duration) =>
      showNotification(message, 'warning', duration),
    [showNotification],
  );

  const info = useCallback(
    (message, duration) =>
      showNotification(message, 'info', duration),
    [showNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      <div
        className="pointer-events-none fixed left-1/2 top-20 z-100 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {notifications.map((notification) => {
          const style =
            notificationStyles[notification.type];

          const Icon = style.icon;

          return (
            <div
              key={notification.id}
              role={
                notification.type === 'error'
                  ? 'alert'
                  : 'status'
              }
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${style.className}`}
            >
              <Icon size={21} className="shrink-0" />

              <p className="flex-1 text-sm font-semibold">
                {notification.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  removeNotification(notification.id)
                }
                aria-label="Dismiss notification"
                className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
              >
                <X size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used inside NotificationProvider.',
    );
  }

  return context;
}