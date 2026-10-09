import { prisma } from "../../config/prisma";

export interface BusySlot {
  /* "2026-10-06" */
  date: string;
  /* "14:00" */
  start: string;
  /* "15:00" */
  end: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 62;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

const toMinutesString = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/*
 * Bir biznesin verilmiş tarix aralığındakı tutulmuş vaxtları qaytarır.
 *
 * Yalnız vaxt aralığı göstərilir: kimin rezerv etdiyi, hansı xidmət
 * olduğu və s. qaytarılmır. Gözləyən (PENDING) və təsdiqlənmiş
 * (CONFIRMED) rezervlər vaxtı tutur, ləğv və tamamlanmışlar tutmur.
 * Bu, rezerv yaradılanda edilən üst-üstə düşmə yoxlaması ilə eynidir.
 *
 * Tarix və saat bazada "Bakı divar saatı" UTC kimi saxlanır,
 * ona görə burada da UTC getter-ləri istifadə olunur.
 */
export const getBusySlots = async (
  businessId: string,
  from: string,
  to: string
): Promise<BusySlot[]> => {
  if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
    throw new Error("INVALID_RANGE");
  }

  const rangeStart = new Date(`${from}T00:00:00.000Z`);
  const lastDay = new Date(`${to}T00:00:00.000Z`);

  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(lastDay.getTime())) {
    throw new Error("INVALID_RANGE");
  }

  const rangeEnd = new Date(lastDay.getTime() + DAY_MS);

  if (
    rangeEnd.getTime() <= rangeStart.getTime() ||
    rangeEnd.getTime() - rangeStart.getTime() > MAX_RANGE_DAYS * DAY_MS
  ) {
    throw new Error("INVALID_RANGE");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { gte: rangeStart, lt: rangeEnd },
    },
    include: { service: true },
    orderBy: { date: "asc" },
  });

  return bookings.map((booking) => {
    const startMinutes =
      booking.date.getUTCHours() * 60 + booking.date.getUTCMinutes();
    const endMinutes = Math.min(
      startMinutes + booking.service.duration,
      24 * 60
    );

    return {
      date: `${booking.date.getUTCFullYear()}-${pad(
        booking.date.getUTCMonth() + 1
      )}-${pad(booking.date.getUTCDate())}`,
      start: toMinutesString(startMinutes),
      end: toMinutesString(endMinutes),
    };
  });
};