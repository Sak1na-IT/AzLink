import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as reviewsService from "./reviews.service";

const MAX_COMMENT_LENGTH = 1000;

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Rezerv tapılmadı" });
    }

    if (error.message === "BOOKING_NOT_COMPLETED") {
      return res.status(400).json({
        message: "Rəy yalnız tamamlanmış rezervə yazıla bilər",
      });
    }

    if (error.message === "REVIEW_EXISTS") {
      return res
        .status(409)
        .json({ message: "Bu rezerv üçün artıq rəy yazılıb" });
    }
  }

  /* P2002: eyni anda iki sorğu gəlib, bookingId unikaldır */
  if ((error as { code?: string }).code === "P2002") {
    return res
      .status(409)
      .json({ message: "Bu rezerv üçün artıq rəy yazılıb" });
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const createReviewHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { bookingId, rating, comment } = req.body ?? {};

    if (typeof bookingId !== "string" || bookingId.length === 0) {
      return res.status(400).json({ message: "bookingId vacibdir" });
    }

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Reytinq 1-dən 5-ə qədər tam ədəd olmalıdır",
      });
    }

    if (
      comment !== undefined &&
      comment !== null &&
      typeof comment !== "string"
    ) {
      return res.status(400).json({ message: "Şərh mətn olmalıdır" });
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        message: `Şərh ${MAX_COMMENT_LENGTH} simvoldan uzun ola bilməz`,
      });
    }

    const review = await reviewsService.createReview(req.user.userId, {
      bookingId,
      rating,
      comment: trimmedComment,
    });

    res.status(201).json(review);
  } catch (error) {
    handleError(error, res);
  }
};

/* Açıqdır: GET /api/reviews?providerId=... */
export const listReviewsHandler = async (req: Request, res: Response) => {
  try {
    const providerId = req.query.providerId;

    if (typeof providerId !== "string" || providerId.length === 0) {
      return res.status(400).json({ message: "providerId vacibdir" });
    }

    const reviews = await reviewsService.listReviewsByProvider(providerId);

    res.json(reviews);
  } catch (error) {
    handleError(error, res);
  }
};

export const listMyReviewsHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const reviews = await reviewsService.listMyReviews(req.user.userId);

    res.json(reviews);
  } catch (error) {
    handleError(error, res);
  }
};