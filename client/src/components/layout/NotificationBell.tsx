import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";

import "./NotificationBell.css";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../../services/notificationsService";

/* Başqa səhifədən bildirişləri açmaq üçün: window.dispatchEvent(new Event(OPEN_EVENT)) */
export const OPEN_NOTIFICATIONS_EVENT = "azlink:open-notifications";

/* Oxunmamış sayı bu qədər tez-tez yenilənir */
const POLL_MS = 45_000;

/* "indi", "5 dəq əvvəl", "3 saat əvvəl", "2 gün əvvəl" */
const timeAgo = (value: string) => {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);

  if (minutes < 1) return "indi";
  if (minutes < 60) return `${minutes} dəq əvvəl`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün əvvəl`;

  return new Date(value).toLocaleDateString("az-AZ");
};

function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then((result) => setUnreadCount(result.unreadCount))
      .catch(() => {
        /* sayı göstərə bilməsək, zəng sadəcə nişansız qalır */
      });
  }, []);

  /* Səhifə dəyişəndə və müəyyən aralıqla sayı yenilə */
  useEffect(() => {
    refreshCount();
    setIsOpen(false);
  }, [location.pathname, refreshCount]);

  useEffect(() => {
    const timer = window.setInterval(refreshCount, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refreshCount]);

  /* Kənara basanda və ya Esc ilə bağlansın */
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const open = useCallback(async () => {
    setIsOpen(true);
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getNotifications();
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch {
      setLoadError("Bildirişləri yükləmək mümkün olmadı.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      open();
    }
  };

  useEffect(() => {
    const handleOpen = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      open();
    };

    window.addEventListener(OPEN_NOTIFICATIONS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_NOTIFICATIONS_EVENT, handleOpen);
  }, [open]);

  const openItem = async (item: AppNotification) => {
    if (!item.isRead) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isRead: true } : entry
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      markNotificationRead(item.id).catch(() => undefined);
    }

    setIsOpen(false);

    if (item.link) {
      navigate(item.link);
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      setLoadError("Əməliyyat mümkün olmadı. Yenidən cəhd edin.");
    }
  };

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="notification-bell" ref={wrapRef}>
      <button
        type="button"
        className="top-nav__theme notification-bell__button"
        onClick={toggle}
        aria-label={
          unreadCount > 0
            ? `Bildirişlər, ${unreadCount} oxunmamış`
            : "Bildirişlər"
        }
        aria-expanded={isOpen}
        title="Bildirişlər"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{badge}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__panel" role="dialog" aria-label="Bildirişlər">
          <div className="notification-bell__head">
            <strong>Bildirişlər</strong>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-bell__read-all"
                onClick={readAll}
              >
                <CheckCheck size={15} strokeWidth={1.8} />
                Hamısı oxundu
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="notification-bell__empty">Yüklənir...</p>
          ) : loadError ? (
            <p className="notification-bell__empty">{loadError}</p>
          ) : items.length === 0 ? (
            <div className="notification-bell__empty">
              <Bell size={22} strokeWidth={1.6} />
              <span>Hələ bildiriş yoxdur</span>
            </div>
          ) : (
            <ul className="notification-bell__list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      item.isRead
                        ? "notification-bell__item"
                        : "notification-bell__item is-unread"
                    }
                    onClick={() => openItem(item)}
                  >
                    <span className="notification-bell__dot" aria-hidden="true" />
                    <span className="notification-bell__text">
                      <span>{item.message}</span>
                      <small>{timeAgo(item.createdAt)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
