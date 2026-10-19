import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, Star } from "lucide-react";

import {
  getBusinessReviews,
  type Review,
} from "../../services/reviewsService";
import "./BusinessReviews.css";

/* 2026-10-19T... → 19.10.2026 */
const formatDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-");

  return `${day}.${month}.${year}`;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

function Stars({ rating }: { rating: number }) {
  return (
    <span className="business-reviews__stars" aria-label={`${rating} ulduz`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={15}
          strokeWidth={1.8}
          className={value <= rating ? "is-filled" : ""}
        />
      ))}
    </span>
  );
}

function BusinessReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBusinessReviews()
      .then(setReviews)
      .catch(() => setError("Rəyləri yükləmək mümkün olmadı."))
      .finally(() => setIsLoading(false));
  }, []);

  /* Orta reytinq və hər ulduz üçün say (5 → 1) */
  const summary = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map(
      (value) => reviews.filter((review) => review.rating === value).length
    );

    const average =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length) *
              10
          ) / 10;

    return { average, counts };
  }, [reviews]);

  if (isLoading) {
    return (
      <main className="business-reviews">
        <p className="business-reviews__muted">Yüklənir...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="business-reviews">
        <p className="business-reviews__error">{error}</p>
      </main>
    );
  }

  return (
    <main className="business-reviews">
      <header className="business-reviews__header">
        <h1>Rəylər</h1>
        <p>Müştərilərin tamamlanmış rezervlərdən sonra yazdığı rəylər.</p>
      </header>

      {reviews.length === 0 ? (
        <section className="business-reviews__empty">
          <div className="business-reviews__empty-icon">
            <MessageSquareText size={24} strokeWidth={1.8} />
          </div>
          <h2>Hələ rəy yoxdur</h2>
          <p>
            Rezervi "Tamamlandı" etdikdən sonra müştəri rəy yaza biləcək.
          </p>
        </section>
      ) : (
        <>
          <section className="business-reviews__summary">
            <div className="business-reviews__average">
              <strong>{summary.average.toFixed(1)}</strong>
              <Stars rating={Math.round(summary.average)} />
              <span>{reviews.length} rəy</span>
            </div>

            <div className="business-reviews__bars">
              {summary.counts.map((count, index) => {
                const stars = 5 - index;
                const percent = Math.round((count / reviews.length) * 100);

                return (
                  <div key={stars} className="business-reviews__bar-row">
                    <span>{stars}</span>
                    <div className="business-reviews__bar">
                      <div style={{ width: `${percent}%` }} />
                    </div>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="business-reviews__list">
            {reviews.map((review) => (
              <article key={review.id} className="business-review-card">
                <div className="business-review-card__top">
                  <div className="business-review-card__avatar">
                    {getInitials(review.customerName)}
                  </div>

                  <div className="business-review-card__name">
                    <h3>{review.customerName}</h3>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>

                  <Stars rating={review.rating} />
                </div>

                {review.comment ? (
                  <p className="business-review-card__comment">
                    {review.comment}
                  </p>
                ) : (
                  <p className="business-review-card__comment is-empty">
                    Şərh yazılmayıb
                  </p>
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default BusinessReviews;
