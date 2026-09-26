/*
 * Rəylərin demo saxlanması (localStorage).
 *
 * Backend gələndə yalnız bu fayl dəyişəcək: funksiyalar API
 * çağırışları ilə əvəz olunacaq, səhifələr olduğu kimi qalacaq.
 *
 * Qayda: bir rezerv üçün ən çox bir rəy, yalnız COMPLETED
 * statuslu rezervlər üçün yazıla bilər (bu şərt Bookings.tsx-də
 * yoxlanılır, burada isə sadəcə saxlama/oxuma var).
 */

export type StoredReview = {
  id: number;
  bookingId: number;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
};

const STORAGE_KEY = "azlink-demo-reviews";

const readReviews = (): StoredReview[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as StoredReview[]) : [];
  } catch {
    return [];
  }
};

const saveReviews = (reviews: StoredReview[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    /* localStorage bağlı ola bilər, səhifə işləməyə davam edir */
  }
};

export const getReviewsByProvider = (
  providerId: string
): StoredReview[] =>
  readReviews()
    .filter((review) => review.providerId === providerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getReviewByBooking = (
  bookingId: number
): StoredReview | undefined =>
  readReviews().find((review) => review.bookingId === bookingId);

export const hasReviewed = (bookingId: number): boolean =>
  Boolean(getReviewByBooking(bookingId));

export const addReview = (input: {
  bookingId: number;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
}): StoredReview => {
  const review: StoredReview = {
    id: Date.now(),
    ...input,
    createdAt: new Date().toISOString(),
  };

  saveReviews([...readReviews(), review]);

  return review;
};

/* Provider.tsx-də orta reytinqi real rəylərdən hesablamaq üçün */
export const getProviderRatingSummary = (providerId: string) => {
  const reviews = getReviewsByProvider(providerId);

  if (reviews.length === 0) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: total / reviews.length,
    count: reviews.length,
  };
};