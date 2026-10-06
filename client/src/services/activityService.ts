import { apiRequest } from "./api";

/*
 * Giriş edən istifadəçinin yazdığı rəylərin sayı.
 * Cavab massiv və ya { reviews: [...] } ola bilər, ikisini də qəbul edirik.
 */
export const getMyReviewCount = async (): Promise<number> => {
  const result = await apiRequest<unknown>("/reviews/mine");

  if (Array.isArray(result)) {
    return result.length;
  }

  if (result && typeof result === "object") {
    const reviews = (result as { reviews?: unknown }).reviews;

    if (Array.isArray(reviews)) {
      return reviews.length;
    }
  }

  return 0;
};