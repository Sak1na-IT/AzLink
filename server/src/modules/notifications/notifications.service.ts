import { prisma } from "../../config/prisma";

/* Siyahıda göstərilən ən son bildiriş sayı */
const LIST_LIMIT = 30;

const MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avq", "sen", "okt", "noy", "dek",
];

/*
 * Rezerv tarixi bazada "Bakı divar saatı" UTC kimi saxlanır,
 * ona görə UTC getter-ləri ilə oxunur: "21 okt, 14:00"
 */
export const formatBookingDate = (date: Date) => {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}, ${hours}:${minutes}`;
};

/*
 * Bildiriş yaradır. Bildiriş əsas əməliyyatın (rezerv, rəy) bir
 * hissəsi deyil: yazıla bilməsə belə rezerv uğurlu sayılır.
 */
export const notify = async (
  userId: string,
  message: string,
  link?: string
) => {
  try {
    await prisma.notification.create({
      data: { userId, message, link: link ?? null },
    });
  } catch (error) {
    console.error("Bildiriş yaradıla bilmədi:", error);
  }
};

export const listNotifications = async (userId: string) => {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    unreadCount,
    items: items.map((item) => ({
      id: item.id,
      message: item.message,
      link: item.link,
      isRead: item.isRead,
      createdAt: item.createdAt,
    })),
  };
};

export const countUnread = (userId: string) =>
  prisma.notification.count({ where: { userId, isRead: false } });

export const markRead = async (userId: string, id: string) => {
  /* updateMany: başqasının bildirişi sadəcə tapılmır */
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

  if (result.count === 0) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }
};

export const markAllRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
