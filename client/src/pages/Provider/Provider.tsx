import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star,
  X,
} from "lucide-react";

import { providers } from "../../data/providers";
import { getServicesByProvider } from "../../services/serviceStorage";
import { getPortfolio } from "../../services/portfolioStorage";
import {
  getProviderRatingSummary,
  getReviewsByProvider,
  hasReviewed,
  addReview,
} from "../../services/reviewStorage";
import {
  getBookingsByCustomer,
  type StoredBooking,
} from "../../services/bookingStorage";
import { CURRENT_CUSTOMER } from "../../services/demoCustomer";
import {
  isProviderSaved,
  toggleSavedProvider,
} from "../../services/favoriteStorage";
import "./Provider.css";

function Provider() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const [reviewTarget, setReviewTarget] = useState<StoredBooking | null>(
    null
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(
    () => new Set()
  );

  const provider = useMemo(
    () => providers.find((item) => item.id === providerId),
    [providerId]
  );

  /* Səhifə açılanda bu profilin seçilmişlərdə olub-olmadığını yoxla */
  useEffect(() => {
    if (provider) {
      setIsSaved(isProviderSaved(provider.id));
    }
  }, [provider]);

  /*
   * Provider-in real xidmətləri (biznesin BusinessServices-də
   * yazdığı, serviceStorage-dan gələn siyahı). Booking.tsx də
   * eyni mənbədən oxuyur, ona görə profil və rezerv səhifəsi
   * həmişə eyni siyahını göstərir.
   */
  const services = useMemo(
    () => (provider ? getServicesByProvider(provider.id) : []),
    [provider]
  );

  const portfolioImages = useMemo(
    () => (provider ? getPortfolio(provider.id) : []),
    [provider]
  );

  const reviews = useMemo(
    () => (provider ? getReviewsByProvider(provider.id) : []),
    [provider]
  );

  const ratingSummary = useMemo(
    () => (provider ? getProviderRatingSummary(provider.id) : null),
    [provider]
  );

  /*
   * Müştərinin bu provider ilə tamamlanmış, hələ rəy yazılmamış
   * ən son rezervi. Varsa, "Rəy yaz" düyməsi göstərilir.
   */
  const reviewableBooking = useMemo(() => {
    if (!provider) {
      return null;
    }

    const completed = getBookingsByCustomer(CURRENT_CUSTOMER.id)
      .filter(
        (booking) =>
          booking.providerId === provider.id &&
          booking.status === "COMPLETED" &&
          !reviewedIds.has(booking.id) &&
          !hasReviewed(booking.id)
      )
      .sort((a, b) =>
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
      );

    return completed[0] ?? null;
  }, [provider, reviewedIds]);

  if (!provider) {
    return (
      <div className="provider-page">
        <div className="provider-not-found">
          <div className="provider-not-found__icon">
            <MapPin size={26} strokeWidth={1.8} />
          </div>

          <h1>Profil tapılmadı</h1>

          <p>
            Axtardığınız xidmət göstərən profil mövcud deyil və ya silinib.
          </p>

          <button
            type="button"
            className="provider-primary-button"
            onClick={() => navigate("/search")}
          >
            Axtarışa qayıt
          </button>
        </div>
      </div>
    );
  }

  const initials = provider.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  const displayRating = ratingSummary?.average ?? provider.rating;
  const displayReviewCount = ratingSummary?.count ?? provider.reviewCount;

  const reviewLabel =
    displayReviewCount === 1
      ? "1 rəy"
      : `${displayReviewCount} rəy`;

  const handleToggleSave = () => {
    const nowSaved = toggleSavedProvider(provider.id);
    setIsSaved(nowSaved);
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const storedMessages = JSON.parse(
      localStorage.getItem("azlink-demo-messages") ?? "[]"
    );

    storedMessages.push({
      id: Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "azlink-demo-messages",
      JSON.stringify(storedMessages)
    );

    setMessage("");
    setMessageSent(true);
  };

  const closeContact = () => {
    setIsContactOpen(false);
    setMessage("");
    setMessageSent(false);
  };

  const openReviewForm = () => {
    if (!reviewableBooking) {
      return;
    }

    setReviewRating(5);
    setReviewComment("");
    setReviewTarget(reviewableBooking);
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
    <div className="provider-page">
      <div className="provider-page__top">
        <button
          type="button"
          className="provider-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          <span>Geri</span>
        </button>
      </div>

      <div className="provider-layout">
        <main className="provider-main">
          <section className="provider-hero-card">
            <div className="provider-avatar-large">
              {provider.image ? (
                <img src={provider.image} alt={provider.name} />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="provider-hero-content">
              <div className="provider-name-row">
                <h1>{provider.name}</h1>

                {provider.verified && (
                  <span className="provider-verified">
                    <CheckCircle2 size={17} strokeWidth={2} />
                    Təsdiqlənib
                  </span>
                )}
              </div>

              <p className="provider-service">{provider.service}</p>

              <div className="provider-location">
                <MapPin size={16} strokeWidth={1.8} />
                <span>{provider.area}</span>
                <span className="provider-location__dot">•</span>
                <span>{provider.distance.toFixed(1)} km</span>
              </div>

              <div className="provider-rating-row">
                <div className="provider-rating">
                  <Star size={17} fill="currentColor" strokeWidth={1.8} />
                  <strong>{displayRating.toFixed(1)}</strong>
                </div>

                <span>{reviewLabel}</span>
              </div>
            </div>

            <button
              type="button"
              className="provider-save-button"
              aria-label={
                isSaved
                  ? "Seçilmişlərdən çıxar"
                  : "Seçilmişlərə əlavə et"
              }
              title={
                isSaved
                  ? "Seçilmişlərdən çıxar"
                  : "Seçilmişlərə əlavə et"
              }
              onClick={handleToggleSave}
            >
              <Heart
                size={20}
                strokeWidth={1.8}
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <h2>Haqqında</h2>
            </div>

            <p className="provider-description">
              {provider.name} — {provider.service} xidməti üzrə AzLink
              platformasında yerləşdirilmiş profildir. Xidmət ərazisi{" "}
              <strong>{provider.area}</strong> olaraq göstərilir. Profil
              üzrə başlanğıc qiymət <strong>{provider.priceFrom} ₼</strong>-dir.
            </p>
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <div>
                <h2>Xidmətlər</h2>
                <span className="provider-section__subtitle">
                  Biznesin təqdim etdiyi xidmətlər
                </span>
              </div>
            </div>

            {services.length === 0 ? (
              <p className="provider-muted-text">
                Bu profil üçün hələ xidmət əlavə olunmayıb.
              </p>
            ) : (
              <div className="provider-services-list">
                {services.map((service) => (
                  <div
                    className="provider-service-item"
                    key={service.id}
                  >
                    <div>
                      <strong>{service.name}</strong>
                      <span>{service.description}</span>
                    </div>

                    <strong className="provider-service-price">
                      {service.price} ₼
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <h2>İş nümunələri</h2>
            </div>

            {portfolioImages.length === 0 ? (
              <p className="provider-muted-text">
                Bu biznes hələ portfolio şəkli əlavə etməyib.
              </p>
            ) : (
              <div className="provider-portfolio">
                {portfolioImages.map((image) => (
                  <div className="provider-portfolio__item" key={image.id}>
                    <img
                      src={image.dataUrl}
                      alt={image.caption || provider.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <div>
                <h2>Rəylər</h2>
                <span className="provider-section__subtitle">
                  {displayRating.toFixed(1)} / 5 · {reviewLabel}
                </span>
              </div>

              {reviewableBooking && (
                <button
                  type="button"
                  className="provider-secondary-button"
                  onClick={openReviewForm}
                >
                  <Star size={16} strokeWidth={1.8} />
                  Rəy yaz
                </button>
              )}
            </div>

            <div className="provider-review-summary">
              <div className="provider-review-summary__score">
                <strong>{displayRating.toFixed(1)}</strong>

                <div className="provider-stars">
                  {[1, 2, 3, 4, 5].map((starNumber) => (
                    <Star
                      key={starNumber}
                      size={17}
                      fill="currentColor"
                      strokeWidth={1.8}
                    />
                  ))}
                </div>

                <span>{reviewLabel}</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="provider-muted-text">
                Hələ rəy yazılmayıb. İlk rəyi siz yaza bilərsiniz.
              </p>
            ) : (
              <div className="provider-services-list">
                {reviews.map((review) => (
                  <div className="provider-service-item" key={review.id}>
                    <div>
                      <strong>{review.customerName}</strong>
                      <span>
                        {review.comment || "Rəy mətni yazılmayıb."}
                      </span>
                    </div>

                    <strong className="provider-service-price">
                      {review.rating} ★
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="provider-sidebar">
          <section className="provider-booking-card">
            <div className="provider-booking-card__price">
              <span>Başlanğıc qiymət</span>
              <strong>{provider.priceFrom} ₼</strong>
            </div>

            <div className="provider-booking-card__divider" />

            <div className="provider-info-row">
              <CalendarDays size={18} strokeWidth={1.8} />

              <div>
                <span>Rezerv</span>
                <strong>Onlayn rezerv imkanı</strong>
              </div>
            </div>

            <div className="provider-info-row">
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>Mövcudluq</span>
                <strong>Tarix və saat seçimi</strong>
              </div>
            </div>

            <button
              type="button"
              className="provider-primary-button provider-primary-button--full"
              onClick={() => navigate(`/booking/${provider.id}`)}
            >
              <CalendarDays size={18} strokeWidth={1.8} />
              Rezerv et
            </button>

            <button
              type="button"
              className="provider-secondary-button provider-secondary-button--full"
              onClick={() => setIsContactOpen(true)}
            >
              <MessageCircle size={18} strokeWidth={1.8} />
              Əlaqə saxla
            </button>

            <button
              type="button"
              className="provider-phone-button"
              onClick={() => setIsContactOpen(true)}
            >
              <Phone size={17} strokeWidth={1.8} />
              Əlaqə məlumatlarını aç
            </button>
          </section>

          <section className="provider-sidebar-card">
            <h3>Profil məlumatları</h3>

            <div className="provider-sidebar-item">
              <MapPin size={17} strokeWidth={1.8} />

              <div>
                <span>Ərazi</span>
                <strong>{provider.area}</strong>
              </div>
            </div>

            <div className="provider-sidebar-item">
              <Star size={17} strokeWidth={1.8} />

              <div>
                <span>Reytinq</span>
                <strong>
                  {displayRating.toFixed(1)} · {reviewLabel}
                </strong>
              </div>
            </div>

            <div className="provider-sidebar-item">
              <CheckCircle2 size={17} strokeWidth={1.8} />

              <div>
                <span>Status</span>
                <strong>
                  {provider.verified
                    ? "Təsdiqlənmiş profil"
                    : "Standart profil"}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {isContactOpen && (
        <div className="area-modal">
          <button
            type="button"
            className="area-modal__backdrop"
            aria-label="Pəncərəni bağla"
            onClick={closeContact}
          />

          <section
            className="area-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
          >
            <div className="area-modal__header">
              <div>
                <span className="area-modal__eyebrow">AzLink</span>

                <h2 id="contact-title">
                  {provider.name} ilə əlaqə
                </h2>

                <p>
                  {provider.service} · {provider.area}
                </p>
              </div>

              <button
                type="button"
                className="area-modal__close"
                onClick={closeContact}
                aria-label="Bağla"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="area-results">
              {messageSent ? (
                <div className="area-empty">
                  <Send size={24} strokeWidth={1.8} />

                  <strong>Mesaj yadda saxlanıldı</strong>

                  <span>
                    Demo rejimində mesajınız bu brauzerdə saxlanıldı.
                  </span>

                  <button
                    type="button"
                    className="area-modal__apply"
                    onClick={closeContact}
                  >
                    Bağla
                  </button>
                </div>
              ) : (
                <>
                  <div className="provider-section">
                    <div className="provider-section__header">
                      <div>
                        <h2>Mesaj göndər</h2>

                        <span className="provider-section__subtitle">
                          Mesajınızı yazın
                        </span>
                      </div>
                    </div>

                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Salam, xidmət haqqında məlumat almaq istəyirəm..."
                      rows={6}
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
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {!messageSent && (
              <div className="area-modal__footer">
                <div className="area-modal__count">
                  <strong>{message.length}</strong>
                  <span>simvol</span>
                </div>

                <button
                  type="button"
                  className="area-modal__apply"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  style={{
                    opacity: message.trim() ? 1 : 0.5,
                  }}
                >
                  <Send size={16} strokeWidth={1.8} />
                  Göndər
                </button>
              </div>
            )}
          </section>
        </div>
      )}

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

                <h2 id="review-title">{provider.name} üçün rəy</h2>

                <p>{reviewTarget.service}</p>
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
    </div>
  );
}

export default Provider;
