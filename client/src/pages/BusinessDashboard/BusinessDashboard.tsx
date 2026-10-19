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

const statusText: Record<Booking["status"], string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
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
    try {
      setError("");

      const [statsResult, bookingsResult, servicesResult] =
        await Promise.all([
          getDashboardStats(),
          getBookings(),
          getServicesPreview(),
        ]);

      setStats(statsResult);
      setServices(servicesResult);

      const today = todayKey();

      /* yalnız sizə gələnlər (siz müştəri kimi etdiyiniz rezervlər yox) */
      const incoming = bookingsResult.filter(
        (booking) => booking.customerId !== currentUser?.id
      );

      const todays = incoming
        .filter(
          (booking) =>
            booking.date === today && booking.status !== "CANCELLED"
        )
        .sort((a, b) => a.time.localeCompare(b.time));

      setTodayBookings(todays);
    } catch {
      setError("Panel məlumatlarını yükləmək mümkün olmadı.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, "CONFIRMED");
      reload();
    } catch {
      alert("Rezervi təsdiqləmək mümkün olmadı.");
    }
  };

  if (isLoading) {
    return (
      <main className="business-dashboard">
        <p className="business-dashboard__loading">Yüklənir...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="business-dashboard">
        <p className="business-dashboard__loading">
          {error || "Məlumat tapılmadı."}
        </p>
      </main>
    );
  }

  const businessName = currentUser?.name ?? "";

  /* Günün vaxtına görə salam */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";

  const todayLabel = formatReadable(new Date());

  /* Profil tamamlanma halqası */
  const completion = Math.max(0, Math.min(100, stats.profileCompletion));
  const isProfileComplete = completion >= 100;

  /* Biznes sahibi üçün bir cümləlik xülasə */
  const summary =
    todayBookings.length > 0
      ? `Bu gün ${todayBookings.length} rezerviniz var.`
      : "Bu gün üçün rezerv yoxdur.";

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
                ? ` ${stats.pendingCount} rezerv təsdiqinizi gözləyir.`
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="biz-gold-button"
            onClick={() => navigate("/business/services")}
          >
            <Plus size={18} strokeWidth={2} />
            Yeni xidmət
          </button>
        </div>

        {/* Əsas rəqəmlər */}
        <dl className="biz-hero__stats">
          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt>{todayBookings.length}</dt>
            <dd>Bu günkü rezerv</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt className={stats.pendingCount > 0 ? "is-alert" : ""}>
              {stats.pendingCount}
            </dt>
            <dd>Təsdiq gözləyir</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/customers")}>
            <dt>{stats.uniqueCustomerCount}</dt>
            <dd>Müştəri</dd>
          </button>

          <button type="button" onClick={() => navigate("/business/bookings")}>
            <dt>
              {stats.revenue}
              <small className="manat">₼</small>
            </dt>
            <dd>Təsdiqlənmiş gəlir</dd>
          </button>
        </dl>
      </section>

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
              {stats.pendingCount} yeni rezerv təsdiqinizi gözləyir
            </strong>
            <span>Müştəri cavabınızı gözləyir, təsdiqləyin və ya ləğv edin.</span>
          </span>
          <span className="biz-alert__cta">
            Bax
            <ArrowRight size={15} strokeWidth={1.8} />
          </span>
        </button>
      )}

      {/* ===== BUGÜNKÜ REZERVLƏR + PROFİL ===== */}
      <section className="biz-grid">
        <div className="biz-card">
          <header className="biz-card__header">
            <h2>Bugünkü rezervlər</h2>
            <button
              type="button"
              className="biz-link"
              onClick={() => navigate("/business/bookings")}
            >
              Hamısı
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          </header>

          {todayBookings.length === 0 ? (
            <div className="biz-empty">
              <span className="biz-medal">
                <Clock3 size={20} strokeWidth={1.7} />
              </span>
              <div>
                <strong>Bu gün sakit gündür</strong>
                <p>Yeni rezerv gələndə burada saat sırası ilə görünəcək.</p>
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
                        Təsdiqlə
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="biz-card biz-profile">
          <h2>Profiliniz</h2>

          <div
            className="biz-ring"
            style={{ ["--value" as string]: `${completion}` }}
          >
            <div className="biz-ring__inner">
              <strong>{completion}%</strong>
              <span>hazır</span>
            </div>
          </div>

          <p>
            {isProfileComplete
              ? "Profiliniz tam hazırdır. Müştərilər sizi asanlıqla tapır."
              : "Şəkil, təsvir və iş saatlarını əlavə edin ki, müştərilər sizi daha tez seçsin."}
          </p>

          <button
            type="button"
            className="biz-outline-button"
            onClick={() => navigate("/business/profile")}
          >
            {isProfileComplete ? "Profili redaktə et" : "Profili tamamla"}
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>
        </aside>
      </section>

      {/* ===== XİDMƏTLƏR + SÜRƏTLİ ƏMƏLİYYATLAR ===== */}
      <section className="biz-grid">
        <div className="biz-card">
          <header className="biz-card__header">
            <h2>Xidmətləriniz</h2>
            <button
              type="button"
              className="biz-link"
              onClick={() => navigate("/business/services")}
            >
              İdarə et
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          </header>

          {services.length === 0 ? (
            <p className="biz-muted">Hələ xidmət əlavə etməmisiniz.</p>
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
        </div>

        <div className="biz-card">
          <header className="biz-card__header">
            <h2>Sürətli əməliyyatlar</h2>
          </header>

          <div className="biz-actions">
            {[
              { label: "Yeni xidmət", hint: "Qiymət və müddət", icon: Plus, to: "/business/services" },
              { label: "Şəkil əlavə et", hint: "Portfolio", icon: ImagePlus, to: "/business/portfolio" },
              { label: "Profili redaktə et", hint: "Ad, ərazi, təsvir", icon: Settings, to: "/business/profile" },
              { label: "İş saatları", hint: "Açıq günlər", icon: Clock3, to: "/business/hours" },
            ].map(({ label, hint, icon: Icon, to }) => (
              <button
                key={label}
                type="button"
                className="biz-action"
                onClick={() => navigate(to)}
              >
                <span className="biz-medal">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <strong>{label}</strong>
                <span>{hint}</span>
              </button>
            ))}
          </div>

          <p className="biz-muted biz-actions__note">
            <Store size={14} strokeWidth={1.8} /> {stats.serviceCount} aktiv xidmət
          </p>
        </div>
      </section>
    </main>
  );
}

export default BusinessDashboard;
