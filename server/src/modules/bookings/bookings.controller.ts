import type { BookingStatus } from "@prisma/client";
import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as bookingsService from "./bookings.service";

const STATUSES: readonly string[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

const isBookingStatus = (value: unknown): value is BookingStatus =>
  typeof value === "string" && STATUSES.includes(value);

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_DATETIME":
        return res.status(400).json({
          message: "Tarix və ya saat formatı yanlışdır",
        });
      case "DATE_IN_PAST":
        return res
          .status(400)
          .json({ message: "Keçmiş vaxta rezerv etmək olmaz" });
      case "SERVICE_NOT_FOUND":
        return res.status(404).json({ message: "Xidmət tapılmadı" });
      case "OUTSIDE_WORKING_HOURS":
        return res.status(400).json({
          message: "Seçilən vaxt biznesin iş saatlarına uyğun deyil",
        });
      case "SLOT_TAKEN":
        return res.status(409).json({ message: "Bu vaxt artıq doludur" });
      case "BOOKING_NOT_FOUND":
        return res.status(404).json({ message: "Rezerv tapılmadı" });
      case "INVALID_TRANSITION":
        return res.status(400).json({
          message: "Bu status dəyişikliyinə icazə yoxdur",
        });
    }
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const createBookingHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { providerId, serviceId, date, time } = req.body ?? {};

    if (
      typeof providerId !== "string" ||
      typeof serviceId !== "string" ||
      typeof date !== "string" ||
      typeof time !== "string"
    ) {
      return res.status(400).json({
        message: "providerId, serviceId, date və time vacibdir",
      });
    }

    const booking = await bookingsService.createBooking(req.user.userId, {
      providerId,
      serviceId,
      date,
      time,
    });

    res.status(201).json(booking);
  } catch (error) {
    handleError(error, res);
  }
};

export const listBookingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const bookings = await bookingsService.listBookings(req.user);

    res.json(bookings);
  } catch (error) {
    handleError(error, res);
  }
};

export const getBookingHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const booking = await bookingsService.getBooking(
      req.user,
      String(req.params.id)
    );

    res.json(booking);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateBookingStatusHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const status: unknown = req.body?.status;

    if (!isBookingStatus(status)) {
      return res.status(400).json({
        message:
          "status PENDING, CONFIRMED, CANCELLED və ya COMPLETED olmalıdır",
      });
    }

    const booking = await bookingsService.updateBookingStatus(
      req.user,
      String(req.params.id),
      status
    );

    res.json(booking);
  } catch (error) {
    handleError(error, res);
  }
};