import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  deleteBooking,
  getBookings,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from "../../services/bookingsService";
import { getMyReviews, createReview } from "../../services/reviewsService";
import { getStoredUser } from "../../services/api";
import { formatDuration } from "../../utils/formatDuration";
import { formatRelativeDay, getDayParts } from "../../utils/formatDate";
import "./Bookings.css";
import { t } from "../../i18n";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: t("Gözləyir"),
  CONFIRMED: t("Təsdiqlənib"),
  CANCELLED: t("Ləğv edilib"),
  COMPLETED: t("Tamamlanıb"),
};

const statusClasses: Record<BookingStatus, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "confirmed",
};

type FilterValue = "all" | "active" | "completed" | "cancelled";

function Bookings() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(() => new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<FilterValue>("all");

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const reload = async () => {
    try {
      setError("");

      const [allBookings, myReviews] = await Promise.all([
        getBookings(),
        getMyReviews().catch(() => []),
      ]);

      /* yalnız özümün müştəri kimi etdiyi rezervlər */
      const mine = allBookings.filter(
        (booking) => booking.customerId === currentUser?.id
      );

      setBookings(mine);

      setReviewedBookingIds(
        new Set(myReviews.map((review) => review.bookingId))
      );
    } catch {
      setError(t("Rezervləri yükləmək mümkün olmadı."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedBookings = useMemo(() => {
    const copy = [...bookings];

    copy.sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

    return copy;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "active") {
      return sortedBookings.filter(
        (booking) =>
          booking.status === "PENDING" || booking.status === "CONFIRMED"
      );
    }

    if (filter === "completed") {
      return sortedBookings.filter(
        (booking) => booking.status === "COMPLETED"
      );
    }

    if (filter === "cancelled") {
      return sortedBookings.filter(
        (booking) => booking.status === "CANCELLED"
      );
    }

    return sortedBookings;
  }, [sortedBookings, filter]);

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(t("Rezervi ləğv etmək istəyirsiniz?"));

    if (!confirmed) {
      return;
    }

    try {
      await updateBookingStatus(id, "CANCELLED");
      reload();
    } catch {
      alert(t("Rezervi ləğv etmək mümkün olmadı."));
    }
  };

  /* Yalnız ləğv edilmiş rezerv silinə bilər (backend də bunu yoxlayır) */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      t("Ləğv edilmiş rezervi siyahıdan silmək istəyirsiniz?")
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBooking(id);
      setBookings((current) =>
        current.filter((booking) => booking.id !== id)
      );
    } catch {
      alert(t("Rezervi silmək mümkün olmadı."));
    }
  };

  /* "24 sentyabr 2026" — brauzer lokalından asılı olmadan */
  const formatDate = (date: string) => {
    const { day, month } = getDayParts(date);
    return `${day} ${month} ${date.slice(0, 4)}`;
  };

  const openReviewForm = (booking: Booking) => {
    setReviewTarget(booking);
    setReviewRating(5);
    setReviewComment("");
  };

  const closeReviewForm = () => {
    setReviewTarget(null);
  };

  const submitReview = async () => {
    if (!reviewTarget) {
      return;
    }

    try {
      setIsSubmittingReview(true);

      await createReview({
        bookingId: reviewTarget.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviewedBookingIds((current) => {
        const next = new Set(current);
        next.add(reviewTarget.id);
        return next;
      });

      setReviewTarget(null);
    } catch {
      alert(t("Rəyi göndərmək mümkün olmadı."));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bookings-page">
        <div className="bookings-page__container">
          <p className="bookings-page__empty-text">{t("Yüklənir...")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <div className="bookings-page__container">
        <section className="bookings-page__header">
          <div>
            <span className="bookings-page__eyebrow">{t("Rezervlər")}</span>

            <h1>{t("Rezervlərim")}</h1>

            <p>{t("Yaratdığınız rezervləri buradan idarə edə bilərsiniz.")}</p>
          </div>

          <button
            type="button"
            className="bookings-page__new-button"
            onClick={() => navigate("/booking")}
          >
            <Plus size={18} strokeWidth={2} />
            {t("Yeni rezerv yarat")}
          </button>
        </section>

        {error && <p className="bookings-page__empty-text">{error}</p>}

        <section className="bookings-page__filters">
          <button
            type="button"
            className={
              filter === "all"
                ? "bookings-page__filter is-active"
                : "bookings-page__filter"
            }
            onClick={() => setFilter("all")}
          >
            {t("Hamısı")}
          </button>

          <button
            type="button"
            className={
              filter === "active"
                ? "bookings-page__filter is-active"
                : "bookings-page__filter"
            }
            onClick={() => setFilter("active")}
          >
            {t("Aktiv")}
          </button>

          <button
            type="button"
            className={
              filter === "completed"
                ? "bookings-page__filter is-active"
                : "bookings-page__filter"
            }
            onClick={() => setFilter("completed")}
          >
            {t("Tamamlanmış")}
          </button>

          <button
            type="button"
            className={
              filter === "cancelled"
                ? "bookings-page__filter is-active"
                : "bookings-page__filter"
            }
            onClick={() => setFilter("cancelled")}
          >
            {t("Ləğv edilənlər")}
          </button>
        </section>

        {filteredBookings.length === 0 ? (
          <section className="bookings-page__empty">
            <div className="bookings-page__empty-icon">
              <CalendarDays size={28} strokeWidth={1.7} />
            </div>

            <h2>
              {filter === "cancelled"
                ? t("Ləğv edilmiş rezerv yoxdur")
                : filter === "completed"
                  ? t("Hələ tamamlanmış rezerv yoxdur")
                  : t("Hələ rezerviniz yoxdur")}
            </h2>

            <p>{t("Xidmət seçərək ilk rezervinizi yarada bilərsiniz.")}</p>

            <button
              type="button"
              className="bookings-page__empty-button"
              onClick={() => navigate("/booking")}
            >
              <Plus size={17} strokeWidth={2} />
              {t("Yeni rezerv yarat")}
            </button>
          </section>
        ) : (
          <section className="bookings-page__list">
            {filteredBookings.map((booking) => {
              const initials = booking.providerName
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("");

              const isCancelled = booking.status === "CANCELLED";
              const isCompleted = booking.status === "COMPLETED";
              const isConfirmedOrDone =
                booking.status === "CONFIRMED" || isCompleted;
              const isPending = booking.status === "PENDING";

              const alreadyReviewed = reviewedBookingIds.has(booking.id);

              const cardClassName = isCancelled
                ? "booking-card booking-card--cancelled"
                : "booking-card";

              const statusClassName =
                "booking-card__status booking-card__status--" +
                statusClasses[booking.status];

              return (
                <article className={cardClassName} key={booking.id}>
                  <div className="booking-card__top">
                    <div className="booking-card__provider">
                      <div className="booking-card__avatar">
                        {booking.providerImage ? (
                          <img
                            src={booking.providerImage}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div>
                        <h2>{booking.providerName}</h2>

                        <span>
                          {booking.service}
                          {booking.duration
                            ? " · " + formatDuration(booking.duration)
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className={statusClassName}>
                      {isConfirmedOrDone && (
                        <CheckCircle2 size={15} strokeWidth={1.9} />
                      )}

                      {isPending && <Clock3 size={15} strokeWidth={1.9} />}

                      {isCancelled && <XCircle size={15} strokeWidth={1.9} />}

                      {statusLabels[booking.status]}
                    </div>
                  </div>

                  <div className="booking-card__details">
                    <div className="booking-card__detail">
                      <CalendarDays size={17} strokeWidth={1.8} />

                      <div>
                        <span>{t("Tarix")}</span>
                        <strong>{formatDate(booking.date)}</strong>
                        {!isCancelled && !isCompleted ? (
                          <small>{formatRelativeDay(booking.date)}</small>
                        ) : null}
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <Clock3 size={17} strokeWidth={1.8} />

                      <div>
                        <span>{t("Saat")}</span>
                        <strong>{booking.time}</strong>
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <MapPin size={17} strokeWidth={1.8} />

                      <div>
                        <span>{t("Ərazi")}</span>
                        <strong>{booking.area || "—"}</strong>
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <div>
                        <span>{t("Qiymət")}</span>
                        <strong className="booking-card__price">
                          {booking.priceFrom}
                          <small className="manat">₼</small>
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="booking-card__bottom">
                    <button
                      type="button"
                      className="booking-card__provider-button"
                      onClick={() =>
                        navigate("/provider/" + booking.providerId)
                      }
                    >
                      {t("Biznes profilinə bax")}
                    </button>

                    {isPending || booking.status === "CONFIRMED" ? (
                      <button
                        type="button"
                        className="booking-card__cancel-button"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <XCircle size={16} strokeWidth={1.8} />
                        {t("Rezervi ləğv et")}
                      </button>
                    ) : null}

                    {isCancelled ? (
                      <button
                        type="button"
                        className="booking-card__cancel-button"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                        {t("Sil")}
                      </button>
                    ) : null}

                    {isCompleted && !alreadyReviewed ? (
                      <button
                        type="button"
                        className="booking-card__cancel-button"
                        onClick={() => openReviewForm(booking)}
                      >
                        <Star size={16} strokeWidth={1.8} />
                        {t("Rəy yaz")}
                      </button>
                    ) : null}

                    {isCompleted && alreadyReviewed ? (
                      <span className="booking-card__reviewed">
                        <CheckCircle2 size={16} strokeWidth={1.8} />
                        {t("Rəy yazılıb")}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {reviewTarget && (
        <div className="area-modal">
          <button
            type="button"
            className="area-modal__backdrop"
            aria-label={t("Bağla")}
            onClick={closeReviewForm}
          />

          <section
            className="area-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <div className="area-modal__header">
              <div>
                <span className="area-modal__eyebrow">AzLink</span>

                <h2 id="review-title">
                  {t("{name} üçün rəy", { name: reviewTarget.providerName })}
                </h2>

                <p>
                  {reviewTarget.service} · {formatDate(reviewTarget.date)}
                </p>
              </div>

              <button
                type="button"
                className="area-modal__close"
                onClick={closeReviewForm}
                aria-label={t("Bağla")}
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="area-results">
              <div className="booking-review-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setReviewRating(value)}
                    aria-label={t("{count} ulduz", { count: value })}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.8}
                      fill={value <= reviewRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder={t("Təcrübənizi qısaca yazın (vacib deyil)...")}
                rows={5}
                maxLength={300}
                style={{
                  width: "100%",
                  resize: "vertical",
                  padding: "12px 14px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  outline: "none",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  font: "inherit",
                  lineHeight: 1.5,
                  marginTop: "16px",
                }}
              />
            </div>

            <div className="area-modal__footer">
              <div className="area-modal__count">
                <strong>{reviewComment.length}</strong>
                <span>/ 300</span>
              </div>

              <button
                type="button"
                className="area-modal__apply"
                onClick={submitReview}
                disabled={isSubmittingReview}
                style={{ opacity: isSubmittingReview ? 0.6 : 1 }}
              >
                <Star size={16} strokeWidth={1.8} />
                {isSubmittingReview ? t("Göndərilir...") : t("Rəyi göndər")}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Bookings;