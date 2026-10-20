import { apiRequest } from "./api";

export interface AppNotification {
  id: string;
  message: string;
  /* Bildirişə basanda açılan səhifə */
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  unreadCount: number;
  items: AppNotification[];
}

export const getNotifications = () =>
  apiRequest<NotificationList>("/notifications");

export const getUnreadCount = () =>
  apiRequest<{ unreadCount: number }>("/notifications/unread-count");

export const markNotificationRead = (id: string) =>
  apiRequest<{ isRead: boolean }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  apiRequest<{ unreadCount: number }>("/notifications/read-all", {
    method: "PATCH",
  });
