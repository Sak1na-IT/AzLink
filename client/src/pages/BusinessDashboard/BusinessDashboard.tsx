import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock3,
  ImagePlus,
  Plus,
  Settings,
  Store,
} from "lucide-react";

import { formatReadable } from "../../utils/formatDate";
import "./BusinessDashboard.css";
import { getStoredUser } from "../../services/api";
import {
  getDashboardStats,
  getServicesPreview,
  type BusinessDashboardStats,
  type BusinessServicePreview,
} from "../../services/businessDashboardService";
import {
  getBookings,
  updateBookingStatus,
  type Booking,
} from "../../services/bookingsService";
import { t } from "../../i18n";

const statusText: Record<Booking["status"], string> = {
  PENDING: t("Gözləyir"),
  CONFIRMED: t("Təsdiqlənib"),
  CANCELLED: t("Ləğv edilib"),
  COMPLETED: t("Tamamlanıb"),
};

const todayKey = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

function BusinessDashboard() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [stats, setStats] = useState<BusinessDashboardStats | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<BusinessServicePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setError("");

    /*
     * Hər sorğu ayrıca yoxlanılır: biri alınmasa da panel açılır,
     * alınmayan hissə isə konsolda və ekranda adı ilə göstərilir.
     */
    const [statsResult, bookingsResult, servicesResult] =
      await Promise.allSettled([
        getDashboardStats(),
        getBookings(),
        getServicesPreview(),
      ]);

    const failed: string[] = [];

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value);
    } else {
      failed.push("statistika");
      console.error("[Dashboard] /business/dashboard:", statsResult.reason);
    }

    if (servicesResult.status === "fulfilled") {
      setServices(servicesResult.value);
    } else {
      failed.push(t("xidmətlər"));
      console.error("[Dashboard] /business/services:", servicesResult.reason);
    }

    if (bookingsResult.status === "fulfilled") {
      const today = todayKey();

      /* yalnız sizə gələnlər (siz müştəri kimi etdiyiniz rezervlər yox) */
      const todays = bookingsResult.value
        .filter((booking) => booking.customerId !== currentUser?.id)
        .filter(
          (booking) =>
            booking.date === today && booking.status !== "CANCELLED"
        )
        .sort((a, b) => a.time.localeCompare(b.time));

      setTodayBookings(todays);
    } else {
      failed.push(t("rezervlər"));
      console.error("[Dashboard] /bookings:", bookingsResult.reason);
    }

    if (failed.length > 0) {
      const reason =
        statsResult.status === "rejected"
          ? statsResult.reason
          : bookingsResult.status === "rejected"
            ? bookingsResult.reason
            : servicesResult.status === "rejected"
              ? servicesResult.reason
              : null;

      const detail = reason instanceof Error ? reason.message : "";

      setError(
        `${t("Yüklənmədi: {list}", { list: failed.join(", ") })}${detail ? ` (${detail})` : ""}`
      );
    }

    setIsLoading(false);
  }, [currentUser?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, "CONFIRMED");
      reload();
    } catch {
      alert(t("Rezervi təsdiqləmək mümkün olmadı."));
    }
  };

  if (isLoading) {
    return (
      <main className="business-dashboard">
        <p className="business-dashboard__loading">{t("Yüklənir...")}</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="business-dashboard">
        <p className="business-dashboard__loading">
          {error || t("Məlumat tapılmadı.")}
        </p>
      </main>
    );
  }

  const businessName = currentUser?.name ?? "";

  /* Günün vaxtına görə salam */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("Sabahınız xeyir") : hour < 18 ? t("Günortanız xeyir") : t("Axşamınız xeyir");

  const todayLabel = formatReadable(new Date());

  /* Profil tamamlanma halqası */
  const completion = Math.max(0, Math.min(100, stats.profileCompletion));
  const isProfileComplete = completion >= 100;

  /* Biznes sahibi üçün bir cümləlik xülasə */
  const summary =
    todayBookings.length > 0
      ? t("Bu gün {count} rezerviniz var.", { count: todayBookings.length })
      : t("Bu gün üçün rezerv yoxdur.");

  return (
    <main className="business-dashboard">
      {/* ===== BAŞLIQ: zümrüd vitrin ===== */}
      <section className="biz-hero">
        <div className="biz-hero__top">
          <div>
            <span className="biz-hero__eyebrow">
              {greeting} · {todayLabel}
            </span>
            <h1>{businessName}</h1>
            <p>
              {summary}
              {stats.pendingCount > 0
                ? ` ${t("{count} rezerv təsdiqinizi gözləyir.", { count: stats.pendingCount })}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="biz-gold-button"
            onClick={() => navigate("/business/services")}
          >
            <Plus size={18} strokeWidth={2} />
            {t("Yeni xidmət")}
          </button>
        </div>

        {/* Əsas rəqəmlər */}
        <dl className="biz-hero__stats">
          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt>{todayBookings.length}</dt>
            <dd>{t("Bu günkü rezerv")}</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt className={stats.pendingCount > 0 ? "is-alert" : ""}>
              {stats.pendingCount}
            </dt>
            <dd>{t("Təsdiq gözləyir")}</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/customers")}>
            <dt>{stats.uniqueCustomerCount}</dt>
            <dd>{t("Müştəri")}</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt>
              {stats.revenue}
              <small className="manat">₼</small>
            </dt>
            <dd>{t("Təsdiqlənmiş gəlir")}</dd>
          </button>
        </dl>
      </section>

      {error && <p className="biz-error">{error}</p>}

      {/* ===== DİQQƏT: gözləyən rezervlər ===== */}
      {stats.pendingCount > 0 && (
        <button
          type="button"
          className="biz-alert"
          onClick={() => navigate("/business/bookings")}
        >
          <span className="biz-alert__icon">
            <Clock3 size={18} strokeWidth={1.8} />
          </span>
          <span className="biz-alert__text">
            <strong>
              {t("{count} yeni rezerv təsdiqinizi gözləyir", { count: stats.pendingCount })}
            </strong>
            <span>{t("Müştəri cavabınızı gözləyir, təsdiqləyin və ya ləğv edin.")}</span>
          </span>
          <span className="biz-alert__cta">
            {t("Bax")}
            <ArrowRight size={15} strokeWidth={1.8} />
          </span>
        </button>
      )}

      {/* ===== SÜRƏTLİ ƏMƏLİYYATLAR: alət paneli kimi bir sıra ===== */}
      <nav className="biz-quick" aria-label={t("Sürətli əməliyyatlar")}>
        {[
          { label: t("Yeni xidmət"), hint: t("Qiymət və müddət"), icon: Plus, to: "/business/services" },
          { label: t("Şəkil əlavə et"), hint: t("Portfolio"), icon: ImagePlus, to: "/business/portfolio" },
          { label: t("Profili redaktə et"), hint: t("Ad, ərazi, təsvir"), icon: Settings, to: "/business/profile" },
          { label: t("İş saatları"), hint: t("Açıq günlər"), icon: Clock3, to: "/business/hours" },
        ].map(({ label, hint, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            className="biz-quick__item"
            onClick={() => navigate(to)}
          >
            <span className="biz-medal">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span className="biz-quick__text">
              <strong>{label}</strong>
              <span>{hint}</span>
            </span>
          </button>
        ))}
      </nav>

      {/* ===== SOL: BU GÜN · SAĞ: BİZNESİNİZ ===== */}
      <section className="biz-layout">
        <div className="biz-card biz-today">
          <header className="biz-card__header">
            <h2>{t("Bugünkü rezervlər")}</h2>
            <button
              type="button"
              className="biz-link"
              onClick={() => navigate("/business/bookings")}
            >
              {t("Hamısı")}
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          </header>

          {todayBookings.length === 0 ? (
            <div className="biz-empty">
              <span className="biz-medal">
                <Clock3 size={20} strokeWidth={1.7} />
              </span>
              <div>
                <strong>{t("Bu gün sakit gündür")}</strong>
                <p>{t("Yeni rezerv gələndə burada saat sırası ilə görünəcək.")}</p>
              </div>
            </div>
          ) : (
            <ol className="biz-timeline">
              {todayBookings.map((booking) => (
                <li className="biz-timeline__item" key={booking.id}>
                  <span className="biz-timeline__time">{booking.time}</span>

                  <div className="biz-timeline__card">
                    <div className="biz-timeline__info">
                      <strong>{booking.customerName}</strong>
                      <span>
                        {booking.service} · {booking.priceFrom}
                        <small className="manat">₼</small>
                      </span>
                    </div>

                    <span
                      className={`biz-status biz-status--${booking.status.toLowerCase()}`}
                    >
                      {statusText[booking.status]}
                    </span>

                    {booking.status === "PENDING" ? (
                      <button
                        type="button"
                        className="biz-chip biz-chip--gold"
                        onClick={() => handleConfirm(booking.id)}
                      >
                        <Check size={14} strokeWidth={2} />
                        {t("Təsdiqlə")}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="biz-side">
          {/* Profil: yığcam — solda halqa, sağda mətn */}
          <section className="biz-card biz-profile">
            <div
              className="biz-ring"
              style={{ ["--value" as string]: `${completion}` }}
            >
              <div className="biz-ring__inner">
                <strong>{completion}%</strong>
                <span>{t("hazır")}</span>
              </div>
            </div>

            <div className="biz-profile__body">
              <h2>{t("Profiliniz")}</h2>
              <p>
                {isProfileComplete
                  ? t("Profiliniz tam hazırdır. Müştərilər sizi asanlıqla tapır.")
                  : t("Şəkil, təsvir və iş saatlarını əlavə edin ki, müştərilər sizi daha tez seçsin.")}
              </p>

              <button
                type="button"
                className="biz-link"
                onClick={() => navigate("/business/profile")}
              >
                {isProfileComplete ? t("Profili redaktə et") : t("Profili tamamla")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </button>
            </div>
          </section>

          <div className="biz-card">
            <header className="biz-card__header">
              <h2>{t("Xidmətləriniz")}</h2>
              <button
                type="button"
                className="biz-link"
                onClick={() => navigate("/business/services")}
              >
                {t("İdarə et")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </button>
            </header>

            {services.length === 0 ? (
              <p className="biz-muted">{t("Hələ xidmət əlavə etməmisiniz.")}</p>
            ) : (
              /* Menyu kimi: ad ...... qiymət */
              <ul className="biz-menu">
                {services.slice(0, 5).map((service) => (
                  <li key={service.id}>
                    <span>{service.name}</span>
                    <i aria-hidden="true" />
                    <b>
                      {service.price}
                      <small className="manat">₼</small>
                    </b>
                  </li>
                ))}
              </ul>
            )}

            <p className="biz-muted biz-actions__note">
              <Store size={14} strokeWidth={1.8} /> {t("{count} aktiv xidmət", { count: stats.serviceCount })}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessDashboard;
