import { apiRequest } from "./api";

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const getReviewsByProvider = (providerId: string) =>
  apiRequest<Review[]>(`/reviews?providerId=${providerId}`, {
    auth: false,
  });

export const getMyReviews = () => apiRequest<Review[]>("/reviews/mine");

export const createReview = (input: {
  bookingId: string;
  rating: number;
  comment: string;
}) => apiRequest<Review>("/reviews", { method: "POST", body: input });