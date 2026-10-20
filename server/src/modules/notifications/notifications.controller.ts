import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as notificationsService from "./notifications.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "NOTIFICATION_NOT_FOUND") {
    return res.status(404).json({ message: "Bildiriş tapılmadı" });
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const listNotificationsHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    res.json(await notificationsService.listNotifications(req.user.userId));
  } catch (error) {
    handleError(error, res);
  }
};

export const unreadCountHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const unreadCount = await notificationsService.countUnread(
      req.user.userId
    );

    res.json({ unreadCount });
  } catch (error) {
    handleError(error, res);
  }
};

export const markReadHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await notificationsService.markRead(req.user.userId, String(req.params.id));

    res.json({ isRead: true });
  } catch (error) {
    handleError(error, res);
  }
};

export const markAllReadHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await notificationsService.markAllRead(req.user.userId);

    res.json({ unreadCount: 0 });
  } catch (error) {
    handleError(error, res);
  }
};
