import type { BookingStatus, Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";
import type { TokenPayload } from "../../utils/jwt";

export interface CreateBookingInput {
  providerId: string;
  serviceId: string;
  /* "2026-10-06" */
  date: string;
  /* "14:00" */
  time: string;
}

/*
 * Tarix və saat bazada TEK DateTime kimi, "Bakı divar saatı" UTC
 * kimi yazılaraq saxlanır (məs. 14:00 → 14:00Z). Beləliklə heç bir
 * saat qurşağı çevrilməsi olmur: geri oxuyanda UTC getter-ləri ilə
 * eyni tarix və saat alınır.
 */
const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type Slot = { dayOfWeek: number; startTime: string; endTime: string };

/*
 * Biznes iş saatlarını hələ doldurmayıbsa, frontend-dəki standart
 * cədvəl işləyir: Bazar ertəsi–Şənbə 10:00–20:00, Bazar bağlı.
 */
const DEFAULT_SLOTS: Slot[] = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "10:00",
  endTime: "20:00",
}));

const bookingInclude = {
  business: true,
  customer: true,
  service: true,
} as const;

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

const pad = (value: number) => String(value).padStart(2, "0");

const toDateString = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;

const toTimeString = (date: Date) =>
  `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const toBookingDTO = (booking: BookingWithRelations) => ({
  id: booking.id,
  providerId: booking.businessId,
  providerName: booking.business.name,
  customerId: booking.customerId,
  customerName: booking.customer.name,
  service: booking.service.name,
  serviceId: booking.serviceId,
  duration: booking.service.duration,
  date: toDateString(booking.date),
  time: toTimeString(booking.date),
  priceFrom: booking.service.price,
  status: booking.status,
  createdAt: booking.createdAt,
});

export const createBooking = async (
  customerId: string,
  input: CreateBookingInput
) => {
  if (!DATE_PATTERN.test(input.date) || !TIME_PATTERN.test(input.time)) {
    throw new Error("INVALID_DATETIME");
  }

  const start = new Date(`${input.date}T${input.time}:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    throw new Error("INVALID_DATETIME");
  }

  if (start.getTime() <= Date.now() + BAKU_OFFSET_MS) {
    throw new Error("DATE_IN_PAST");
  }

  return prisma.$transaction(async (tx) => {
    const service = await tx.service.findUnique({
      where: { id: input.serviceId },
    });

    if (!service || service.businessId !== input.providerId) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    /* İş saatları yoxlaması */
    const availability = await tx.availability.findMany({
      where: { businessId: service.businessId },
    });

    const slots: Slot[] =
      availability.length > 0 ? availability : DEFAULT_SLOTS;

    const daySlot = slots.find(
      (slot) => slot.dayOfWeek === start.getUTCDay()
    );

    const startMinutes = toMinutes(input.time);
    const endMinutes = startMinutes + service.duration;

    if (
      !daySlot ||
      startMinutes < toMinutes(daySlot.startTime) ||
      endMinutes > toMinutes(daySlot.endTime)
    ) {
      throw new Error("OUTSIDE_WORKING_HOURS");
    }

    /* Üst-üstə düşmə yoxlaması (ləğv edilmiş rezervlər sayılmır) */
    const dayStart = new Date(`${input.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const sameDay = await tx.booking.findMany({
      where: {
        businessId: service.businessId,
        status: { in: ["PENDING", "CONFIRMED"] },
        date: { gte: dayStart, lt: dayEnd },
      },
      include: { service: true },
    });

    const conflict = sameDay.some((existing) => {
      const existingStart =
        existing.date.getUTCHours() * 60 + existing.date.getUTCMinutes();
      const existingEnd = existingStart + existing.service.duration;

      return startMinutes < existingEnd && existingStart < endMinutes;
    });

    if (conflict) {
      throw new Error("SLOT_TAKEN");
    }

    const created = await tx.booking.create({
      data: {
        customerId,
        businessId: service.businessId,
        serviceId: service.id,
        date: start,
      },
      include: bookingInclude,
    });

    return toBookingDTO(created);
  });
};

/*
 * USER → öz rezervləri, BUSINESS → öz biznesinə gələn rezervlər.
 */
export const listBookings = async (user: TokenPayload) => {
  let where: Prisma.BookingWhereInput;

  if (user.role === "BUSINESS") {
    const business = await prisma.business.findUnique({
      where: { userId: user.userId },
    });

    if (!business) {
      return [];
    }

    where = { businessId: business.id };
  } else {
    where = { customerId: user.userId };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: { date: "desc" },
  });

  return bookings.map(toBookingDTO);
};

const findAccessibleBooking = async (user: TokenPayload, id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const isCustomer =
    user.role === "USER" && booking.customerId === user.userId;
  const isBusiness =
    user.role === "BUSINESS" && booking.business.userId === user.userId;

  /* Başqasının rezervi "tapılmadı" kimi görünür, varlığı bildirilmir */
  if (!isCustomer && !isBusiness) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  return { booking, isBusiness };
};

export const getBooking = async (user: TokenPayload, id: string) => {
  const { booking } = await findAccessibleBooking(user, id);

  return toBookingDTO(booking);
};

const customerTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: ["CANCELLED"],
};

const businessTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

export const updateBookingStatus = async (
  user: TokenPayload,
  id: string,
  status: BookingStatus
) => {
  const { booking, isBusiness } = await findAccessibleBooking(user, id);

  const allowed =
    (isBusiness ? businessTransitions : customerTransitions)[
      booking.status
    ] ?? [];

  if (!allowed.includes(status)) {
    throw new Error("INVALID_TRANSITION");
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: bookingInclude,
  });

  return toBookingDTO(updated);
};