import type { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment: string;
}

const reviewInclude = {
  user: { select: { name: true } },
} as const;

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: typeof reviewInclude;
}>;

const toReviewDTO = (review: ReviewWithUser) => ({
  id: review.id,
  bookingId: review.bookingId,
  providerId: review.businessId,
  customerId: review.userId,
  customerName: review.user.name,
  rating: review.rating,
  comment: review.comment ?? "",
  createdAt: review.createdAt,
});

export const createReview = async (
  userId: string,
  input: CreateReviewInput
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
  });

  /* Başqasının rezervi "tapılmadı" kimi görünür, varlığı bildirilmir */
  if (!booking || booking.customerId !== userId) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "COMPLETED") {
    throw new Error("BOOKING_NOT_COMPLETED");
  }

  const existing = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });

  if (existing) {
    throw new Error("REVIEW_EXISTS");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      userId,
      businessId: booking.businessId,
      rating: input.rating,
      comment: input.comment,
    },
    include: reviewInclude,
  });

  return toReviewDTO(review);
};

/* Bir provider-in bütün rəyləri, ən yenisi birinci */
export const listReviewsByProvider = async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { businessId: providerId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(toReviewDTO);
};

/* Müştərinin özünün yazdığı rəylər */
export const listMyReviews = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(toReviewDTO);
};