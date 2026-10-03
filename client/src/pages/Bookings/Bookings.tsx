import { useMemo, useState } from "react";
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

import { providers } from "../../data/providers";
import {
  deleteBooking,
  getBookingsByCustomer,
  updateBookingStatus,
} from "../../services/bookingStorage";
import type {
  BookingStatus,
  StoredBooking,
} from "../../services/bookingStorage";
import { CURRENT_CUSTOMER } from "../../services/demoCustomer";
import { addReview, hasReviewed } from "../../services/reviewStorage";
import { formatDuration } from "../../utils/formatDuration";
import BusinessBookings from "../BusinessBookings/BusinessBookings";
import { getStoredUser } from "../../services/api";
import "./BookingsSwitch.css";
import "./Bookings.css";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

const statusClasses: Record<BookingStatus, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "confirmed",
};

const loadBookings = () => getBookingsByCustomer(CURRENT_CUSTOMER.id);

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<StoredBooking[]>(() =>
    loadBookings()
  );

  /*
   * "active"    → yalnız Gözləyir / Təsdiqlənib
   * "completed" → yalnız Tamamlanıb (rəy yazmaq üçün bura baxmaq rahatdır)
   * "cancelled" → yalnız Ləğv edilib
   */
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "cancelled"
  >("all");

  /* Rəy yazılan rezervlər UI-də dərhal "yazılıb" görünsün deyə */
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(
    () => new Set()
  );

  const [reviewTarget, setReviewTarget] = useState<StoredBooking | null>(
    null
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

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

  const handleCancel = (id: number) => {
    const confirmed = window.confirm(
      "Rezervi ləğv etmək istəyirsiniz?"
    );

    if (!confirmed) {
      return;
    }

    updateBookingStatus(id, "CANCELLED");
    setBookings(loadBookings());
  };

  const handleDelete = (id: number) => {
    deleteBooking(id);
    setBookings(loadBookings());
  };

  const formatDate = (date: string) => {
    const parts = date.split("-");
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return day + "." + month + "." + year;
  };

  const getArea = (providerId: string) => {
    const found = providers.find(
      (provider) => provider.id === providerId
    );

    return found ? found.area : "—";
  };

  const openReviewForm = (booking: StoredBooking) => {
    setReviewTarget(booking);
    setReviewRating(5);
    setReviewComment("");
  };

  const closeReviewForm = () => {
    setReviewTarget(null);
  };

  const submitReview = () => {
    if (!reviewTarget) {
      return;
    }

    addReview({
      bookingId: reviewTarget.id,
      providerId: reviewTarget.providerId,
      customerId: CURRENT_CUSTOMER.id,
      customerName: CURRENT_CUSTOMER.name,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewedIds((current) => {
      const next = new Set(current);
      next.add(reviewTarget.id);
      return next;
    });

    setReviewTarget(null);
  };

  return (
    <main className="bookings-page">
      <div className="bookings-page__container">
        <section className="bookings-page__header">
          <div>
            <span className="bookings-page__eyebrow">Rezervlər</span>

            <h1>Rezervlərim</h1>

            <p>
              Yaratdığınız rezervləri buradan idarə edə bilərsiniz.
            </p>
          </div>

          <button
            type="button"
            className="bookings-page__new-button"
            onClick={() => navigate("/booking")}
          >
            <Plus size={18} strokeWidth={2} />
            Yeni rezerv yarat
          </button>
        </section>

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
            Hamısı
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
            Aktiv
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
            Tamamlanmış
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
            Ləğv edilənlər
          </button>
        </section>

        {filteredBookings.length === 0 ? (
          <section className="bookings-page__empty">
            <div className="bookings-page__empty-icon">
              <CalendarDays size={28} strokeWidth={1.7} />
            </div>

            <h2>
              {filter === "cancelled"
                ? "Ləğv edilmiş rezerv yoxdur"
                : filter === "completed"
                  ? "Hələ tamamlanmış rezerv yoxdur"
                  : "Hələ rezerviniz yoxdur"}
            </h2>

            <p>Xidmət seçərək ilk rezervinizi yarada bilərsiniz.</p>

            <button
              type="button"
              className="bookings-page__empty-button"
              onClick={() => navigate("/booking")}
            >
              <Plus size={17} strokeWidth={2} />
              Yeni rezerv yarat
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

              const alreadyReviewed =
                reviewedIds.has(booking.id) || hasReviewed(booking.id);

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
                        {initials}
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

                      {isPending && (
                        <Clock3 size={15} strokeWidth={1.9} />
                      )}

                      {isCancelled && (
                        <XCircle size={15} strokeWidth={1.9} />
                      )}

                      {statusLabels[booking.status]}
                    </div>
                  </div>

                  <div className="booking-card__details">
                    <div className="booking-card__detail">
                      <CalendarDays size={17} strokeWidth={1.8} />

                      <div>
                        <span>Tarix</span>
                        <strong>{formatDate(booking.date)}</strong>
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <Clock3 size={17} strokeWidth={1.8} />

                      <div>
                        <span>Saat</span>
                        <strong>{booking.time}</strong>
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <MapPin size={17} strokeWidth={1.8} />

                      <div>
                        <span>Ərazi</span>
                        <strong>{getArea(booking.providerId)}</strong>
                      </div>
                    </div>

                    <div className="booking-card__detail">
                      <div>
                        <span>Qiymət</span>
                        <strong>{booking.priceFrom} ₼</strong>
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
                      Biznes profilinə bax
                    </button>

                    {isPending || booking.status === "CONFIRMED" ? (
                      <button
                        type="button"
                        className="booking-card__cancel-button"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <XCircle size={16} strokeWidth={1.8} />
                        Rezervi ləğv et
                      </button>
                    ) : null}

                    {isCompleted && !alreadyReviewed ? (
                      <button
                        type="button"
                        className="booking-card__cancel-button"
                        onClick={() => openReviewForm(booking)}
                      >
                        <Star size={16} strokeWidth={1.8} />
                        Rəy yaz
                      </button>
                    ) : null}

                    {isCompleted && alreadyReviewed ? (
                      <span className="booking-card__reviewed">
                        <CheckCircle2 size={16} strokeWidth={1.8} />
                        Rəy yazılıb
                      </span>
                    ) : null}

                    {isCancelled ? (
                      <button
                        type="button"
                        className="booking-card__delete-button"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                        Sil
                      </button>
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
            aria-label="Bağla"
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
                  {reviewTarget.providerName} üçün rəy
                </h2>

                <p>
                  {reviewTarget.service} ·{" "}
                  {formatDate(reviewTarget.date)}
                </p>
              </div>

              <button
                type="button"
                className="area-modal__close"
                onClick={closeReviewForm}
                aria-label="Bağla"
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
                    aria-label={`${value} ulduz`}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.8}
                      fill={
                        value <= reviewRating ? "currentColor" : "none"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(event.target.value)
                }
                placeholder="Təcrübənizi qısaca yazın (vacib deyil)..."
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
              >
                <Star size={16} strokeWidth={1.8} />
                Rəyi göndər
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Bookings() {
  const isBusiness = getStoredUser()?.role === "BUSINESS";
  const [tab, setTab] = useState<"mine" | "business">("mine");

  /* User hesabı: əvvəlki kimi, tab yoxdur */
  if (!isBusiness) {
    return <MyBookings />;
  }

  return (
    <>
      <div className="bookings-switch">
        <button
          type="button"
          className={
            tab === "mine"
              ? "bookings-switch__tab is-active"
              : "bookings-switch__tab"
          }
          onClick={() => setTab("mine")}
        >
          Mənim rezervlərim
        </button>

        <button
          type="button"
          className={
            tab === "business"
              ? "bookings-switch__tab is-active"
              : "bookings-switch__tab"
          }
          onClick={() => setTab("business")}
        >
          Biznes rezervlərim
        </button>
      </div>

      {tab === "mine" ? <MyBookings /> : <BusinessBookings embedded />}
    </>
  );
}

export default Bookings;