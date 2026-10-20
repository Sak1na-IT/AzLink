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
  Star,
  X,
} from "lucide-react";

import {
  getProviderById,
  type ProviderDetail,
  recordProviderView,
} from "../../services/providersService";
import {
  getReviewsByProvider,
  getMyReviews,
  createReview,
  type Review,
} from "../../services/reviewsService";
import { getSavedProviders, saveProvider, unsaveProvider } from "../../services/savedService";
import { getBookings, type Booking } from "../../services/bookingsService";
import { getStoredUser } from "../../services/api";
import "./Provider.css";
import { t } from "../../i18n";

/* "+994501110001" → "+994 50 111 00 01" */
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  const match = digits.match(/^994(\d{2})(\d{3})(\d{2})(\d{2})$/);

  return match
    ? `+994 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`
    : phone;
};

/* wa.me linki: nömrə yalnız rəqəmlərlə, mətn hazır yazılmış */
const whatsappLink = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

function Provider() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableBooking, setReviewableBooking] = useState<Booking | null>(
    null
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  /* Profil, rəylər, seçilmiş vəziyyəti, rəy yazıla bilən rezerv — hamısı backend-dən */
  useEffect(() => {
    if (!providerId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [providerResult, reviewsResult, savedResult, myReviews, bookings] =
          await Promise.all([
            getProviderById(providerId),
            getReviewsByProvider(providerId),
            getSavedProviders().catch(() => []),
            getMyReviews().catch(() => []),
            getBookings().catch(() => []),
          ]);

        if (cancelled) return;

        /* "Son baxdıqlarınız" üçün baxışı yadda saxla (uğursuz olsa səhifəyə təsir etmir) */
        if (currentUser?.id) {
          recordProviderView(providerId).catch(() => undefined);
        }

        setProvider(providerResult);
        setReviews(reviewsResult);
        setIsSaved(savedResult.some((item) => item.id === providerId));

        const reviewedBookingIds = new Set(
          myReviews.map((review) => review.bookingId)
        );

        const completed = bookings
          .filter(
            (booking) =>
              booking.providerId === providerId &&
              booking.customerId === currentUser?.id &&
              booking.status === "COMPLETED" &&
              !reviewedBookingIds.has(booking.id)
          )
          .sort((a, b) =>
            `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
          );

        setReviewableBooking(completed[0] ?? null);
      } catch {
        if (!cancelled) {
          setLoadError(t("Profil yüklənmədi. Yenidən cəhd edin."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [providerId, currentUser?.id]);

  const initials = useMemo(() => {
    if (!provider) return "";

    return provider.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("");
  }, [provider]);

  if (isLoading) {
    return (
      <div className="provider-page">
        <p className="provider-muted-text" style={{ padding: "60px 20px" }}>
          {t("Yüklənir...")}
        </p>
      </div>
    );
  }

  if (loadError || !provider) {
    return (
      <div className="provider-page">
        <div className="provider-not-found">
          <div className="provider-not-found__icon">
            <MapPin size={26} strokeWidth={1.8} />
          </div>

          <h1>{t("Profil tapılmadı")}</h1>

          <p>
            {t("Axtardığınız xidmət göstərən profil mövcud deyil və ya silinib.")}
          </p>

          <button
            type="button"
            className="provider-primary-button"
            onClick={() => navigate("/search")}
          >
            {t("Axtarışa qayıt")}
          </button>
        </div>
      </div>
    );
  }

  const displayRating = provider.rating;
  const displayReviewCount = provider.reviewCount;

  const reviewLabel =
    displayReviewCount === 1 ? t("1 rəy") : t("{count} rəy", { count: displayReviewCount });

  /* WhatsApp üçün hazır mətn (istifadəçi öz mətnini yazmasa) */
  const defaultMessage = t("Salam, {name}! AzLink-də profilinizi gördüm, xidmətləriniz haqqında məlumat almaq istəyirəm.", { name: provider.name });

  /* Biznes sahibi öz profilinə baxanda ürək düyməsi göstərilmir */
  const isOwnBusiness =
    Boolean(provider.ownerId) && provider.ownerId === currentUser?.id;

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveProvider(provider.id);
        setIsSaved(false);
      } else {
        await saveProvider(provider.id);
        setIsSaved(true);
      }
    } catch {
      alert(t("Əməliyyat mümkün olmadı. Yenidən cəhd edin."));
    }
  };

  const closeContact = () => {
    setIsContactOpen(false);
    setMessage("");
  };

  const openReviewForm = () => {
    if (!reviewableBooking) {
      return;
    }

    setReviewRating(5);
    setReviewComment("");
    setIsReviewOpen(true);
  };

  const closeReviewForm = () => {
    setIsReviewOpen(false);
  };

  const submitReview = async () => {
    if (!reviewableBooking) {
      return;
    }

    try {
      setIsSubmittingReview(true);

      await createReview({
        bookingId: reviewableBooking.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      const [freshReviews, freshProvider] = await Promise.all([
        getReviewsByProvider(provider.id),
        getProviderById(provider.id),
      ]);

      setReviews(freshReviews);
      setProvider(freshProvider);
      setReviewableBooking(null);
      setIsReviewOpen(false);
    } catch {
      alert(t("Rəyi göndərmək mümkün olmadı. Yenidən cəhd edin."));
    } finally {
      setIsSubmittingReview(false);
    }
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
          <span>{t("Geri")}</span>
        </button>
      </div>

      <div className="provider-layout">
        <main className="provider-main">
          <section className="provider-hero-card">
            <div className="provider-avatar-large">
              {/* Profil şəkli (loqo), yoxdursa üz qabığı */}
              {provider.logo || provider.image ? (
                <img src={provider.logo || provider.image} alt={provider.name} />
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
                    {t("Təsdiqlənib")}
                  </span>
                )}
              </div>

              <p className="provider-service">{t(provider.service)}</p>

              <div className="provider-location">
                <MapPin size={16} strokeWidth={1.8} />
                <span>{provider.area}</span>

                {provider.distance != null && (
                  <>
                    <span className="provider-location__dot">•</span>
                    <span>{provider.distance.toFixed(1)}{" "}{t("km")}</span>
                  </>
                )}
              </div>

              <div className="provider-rating-row">
                <div className="provider-rating">
                  <Star size={17} fill="currentColor" strokeWidth={1.8} />
                  <strong>{displayRating.toFixed(1)}</strong>
                </div>

                <span>{reviewLabel}</span>
              </div>
            </div>

            {!isOwnBusiness && (
              <button
                type="button"
                className="provider-save-button"
                aria-label={
                  isSaved ? t("Seçilmişlərdən çıxar") : t("Seçilmişlərə əlavə et")
                }
                title={
                  isSaved ? t("Seçilmişlərdən çıxar") : t("Seçilmişlərə əlavə et")
                }
                onClick={handleToggleSave}
              >
                <Heart
                  size={20}
                  strokeWidth={1.8}
                  fill={isSaved ? "currentColor" : "none"}
                />
              </button>
            )}
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <h2>{t("Haqqında")}</h2>
            </div>

            <p className="provider-description">
              {provider.description?.trim() ||
                t("{name} — {service} xidməti üzrə AzLink platformasında yerləşdirilmiş profildir. Xidmət ərazisi {area} olaraq göstərilir. Başlanğıc qiymət {priceFrom} ₼-dir.", { name: provider.name, service: provider.service, area: provider.area, priceFrom: provider.priceFrom })}
            </p>
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <div>
                <h2>{t("Xidmətlər")}</h2>
                <span className="provider-section__subtitle">
                  {t("Biznesin təqdim etdiyi xidmətlər")}
                </span>
              </div>
            </div>

            {provider.services.length === 0 ? (
              <p className="provider-muted-text">
                {t("Bu profil üçün hələ xidmət əlavə olunmayıb.")}
              </p>
            ) : (
              <div className="provider-services-list">
                {provider.services.map((service) => (
                  <div className="provider-service-item" key={service.id}>
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
              <h2>{t("İş nümunələri")}</h2>
            </div>

            {provider.portfolio.length === 0 ? (
              <p className="provider-muted-text">
                {t("Bu biznes hələ portfolio şəkli əlavə etməyib.")}
              </p>
            ) : (
              <div className="provider-portfolio">
                {provider.portfolio.map((image) => (
                  <figure className="provider-portfolio__item" key={image.id}>
                    <img
                      src={image.imageUrl}
                      alt={image.caption || provider.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                      }}
                    />

                    {image.caption && (
                      <figcaption className="provider-portfolio__caption">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className="provider-section">
            <div className="provider-section__header">
              <div className="provider-reviews-heading">
                <h2>{t("Rəylər")}</h2>

                <div className="provider-reviews-badge">
                  <Star size={14} fill="currentColor" strokeWidth={0} />
                  <strong>{displayRating.toFixed(1)}</strong>
                  <span>· {reviewLabel}</span>
                </div>
              </div>

              {reviewableBooking && (
                <button
                  type="button"
                  className="provider-secondary-button"
                  onClick={openReviewForm}
                >
                  <Star size={16} strokeWidth={1.8} />
                  {t("Rəy yaz")}
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="provider-muted-text">
                {t("Hələ rəy yazılmayıb. İlk rəyi siz yaza bilərsiniz.")}
              </p>
            ) : (
              <div className="provider-review-list">
                {reviews.map((review) => {
                  const reviewInitials = review.customerName
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <div className="provider-review-card" key={review.id}>
                      <div className="provider-review-card__avatar">
                        {reviewInitials}
                      </div>

                      <div className="provider-review-card__body">
                        <div className="provider-review-card__top">
                          <strong>{review.customerName}</strong>

                          <div className="provider-review-card__stars">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                size={13}
                                fill={
                                  value <= review.rating
                                    ? "currentColor"
                                    : "none"
                                }
                                strokeWidth={1.8}
                              />
                            ))}
                          </div>
                        </div>

                        <p>{review.comment || t("Rəy mətni yazılmayıb.")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="provider-sidebar">
          <section className="provider-booking-card">
            <div className="provider-booking-card__price">
              <span>{t("Başlanğıc qiymət")}</span>
              <strong>{provider.priceFrom} ₼</strong>
            </div>

            <div className="provider-booking-card__divider" />

            <div className="provider-info-row">
              <CalendarDays size={18} strokeWidth={1.8} />

              <div>
                <span>{t("Rezerv")}</span>
                <strong>{t("Onlayn rezerv imkanı")}</strong>
              </div>
            </div>

            <div className="provider-info-row">
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>{t("Mövcudluq")}</span>
                <strong>{t("Tarix və saat seçimi")}</strong>
              </div>
            </div>

            <button
              type="button"
              className="provider-primary-button provider-primary-button--full"
              onClick={() => navigate(`/booking/${provider.id}`)}
            >
              <CalendarDays size={18} strokeWidth={1.8} />
              {t("Rezerv et")}
            </button>

            <button
              type="button"
              className="provider-secondary-button provider-secondary-button--full"
              onClick={() => setIsContactOpen(true)}
            >
              <MessageCircle size={18} strokeWidth={1.8} />
              {t("Əlaqə saxla")}
            </button>

            <a
              className="provider-phone-button"
              href={`tel:${provider.phone}`}
            >
              <Phone size={17} strokeWidth={1.8} />
              {formatPhone(provider.phone)}
            </a>
          </section>

          <section className="provider-sidebar-card">
            <h3>{t("Profil məlumatları")}</h3>

            <div className="provider-sidebar-item">
              <MapPin size={17} strokeWidth={1.8} />

              <div>
                <span>{t("Ərazi")}</span>
                <strong>{provider.area}</strong>
              </div>
            </div>

            <div className="provider-sidebar-item">
              <Star size={17} strokeWidth={1.8} />

              <div>
                <span>{t("Reytinq")}</span>
                <strong>
                  {displayRating.toFixed(1)} · {reviewLabel}
                </strong>
              </div>
            </div>

            <div className="provider-sidebar-item">
              <CheckCircle2 size={17} strokeWidth={1.8} />

              <div>
                <span>{t("Status")}</span>
                <strong>
                  {provider.verified
                    ? t("Təsdiqlənmiş profil")
                    : t("Standart profil")}
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
            aria-label={t("Pəncərəni bağla")}
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

                <h2 id="contact-title">{t("{name} ilə əlaqə", { name: provider.name })}</h2>

                <p>
                  {t(provider.service)} · {provider.area}
                </p>
              </div>

              <button
                type="button"
                className="area-modal__close"
                onClick={closeContact}
                aria-label={t("Bağla")}
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="area-results">
              <div className="provider-section">
                <div className="provider-section__header">
                  <div>
                    <h2>{t("WhatsApp-da yazın")}</h2>

                    <span className="provider-section__subtitle">
                      {t("Mesajınız WhatsApp-da hazır açılacaq, sadəcə göndərin")}
                    </span>
                  </div>
                </div>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={defaultMessage}
                  rows={5}
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
            </div>

            <div className="area-modal__footer">
              <a
                className="provider-phone-button"
                href={`tel:${provider.phone}`}
              >
                <Phone size={16} strokeWidth={1.8} />
                {formatPhone(provider.phone)}
              </a>

              <a
                className="area-modal__apply"
                href={whatsappLink(provider.phone, message.trim() || defaultMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={closeContact}
              >
                <MessageCircle size={16} strokeWidth={1.8} />
                {t("WhatsApp-da aç")}
              </a>
            </div>
          </section>
        </div>
      )}

      {isReviewOpen && reviewableBooking && (
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

                <h2 id="review-title">{t("{name} üçün rəy", { name: provider.name })}</h2>

                <p>{reviewableBooking.service}</p>
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
    </div>
  );
}

export default Provider;