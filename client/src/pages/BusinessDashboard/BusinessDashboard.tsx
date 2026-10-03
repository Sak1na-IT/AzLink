import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ImagePlus,
  Plus,
  Settings,
  Store,
  Users,
} from "lucide-react";

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

  const firstName = currentUser?.name?.split(" ")[0] ?? "";

  return (
    <main className="business-dashboard">
      {/* ===== BAŞLIQ ===== */}
      <section className="business-dashboard__hero">
        <div>
          <h1>Salam, {firstName} 👋</h1>
          <p>Bu gün biznesinizdə baş verənlərə ümumi baxış.</p>
        </div>

        <button
          type="button"
          className="business-dashboard__primary-button"
          onClick={() => navigate("/business-services")}
        >
          <Plus size={18} strokeWidth={2} />
          Yeni xidmət
        </button>
      </section>

      {/* ===== KPI ===== */}
      <section className="business-dashboard__stats">
        <div className="business-stat-card">
          <div className="business-stat-card__icon">
            <CalendarDays size={20} strokeWidth={1.8} />
          </div>
          <div>
            <span>Bu gün</span>
            <strong>{todayBookings.length} rezerv</strong>
          </div>
        </div>

        <button
          type="button"
          className="business-stat-card business-stat-card--clickable"
          onClick={() => navigate("/business-bookings")}
        >
          <div className="business-stat-card__icon">
            <Clock3 size={20} strokeWidth={1.8} />
          </div>
          <div>
            <span>Gözləyən</span>
            <strong>{stats.pendingCount} rezerv</strong>
          </div>
        </button>

        <button
          type="button"
          className="business-stat-card business-stat-card--clickable"
          onClick={() => navigate("/business-services")}
        >
          <div className="business-stat-card__icon">
            <Store size={20} strokeWidth={1.8} />
          </div>
          <div>
            <span>Xidmətlər</span>
            <strong>{stats.serviceCount}</strong>
          </div>
        </button>

        <button
          type="button"
          className="business-stat-card business-stat-card--clickable"
          onClick={() => navigate("/business-customers")}
        >
          <div className="business-stat-card__icon">
            <Users size={20} strokeWidth={1.8} />
          </div>
          <div>
            <span>Müştərilər</span>
            <strong>{stats.uniqueCustomerCount}</strong>
          </div>
        </button>
      </section>

      {/* ===== BUGÜNKÜ REZERVLƏR + PROFİL ===== */}
      <section className="business-dashboard__content">
        <div className="business-dashboard__main-card">
          <div className="business-card-header">
            <h2>Bugünkü rezervlər</h2>
          </div>

          {todayBookings.length === 0 ? (
            <p className="business-dashboard__empty-text">
              Bu gün üçün rezerv yoxdur.
            </p>
          ) : (
            <div className="business-today-list">
              {todayBookings.map((booking) => (
                <div className="business-today-item" key={booking.id}>
                  <div className="business-today-item__time">
                    {booking.time}
                  </div>

                  <div className="business-today-item__info">
                    <strong>{booking.customerName}</strong>
                    <span>{booking.service}</span>
                  </div>

                  <div className="business-today-item__price">
                    {booking.priceFrom} ₼
                  </div>

                  <div className="business-today-item__right">
                    <span
                      className={`business-today-item__status business-today-item__status--${booking.status.toLowerCase()}`}
                    >
                      {statusText[booking.status]}
                    </span>

                    {booking.status === "PENDING" ? (
                      <button
                        type="button"
                        className="business-dashboard__chip-button"
                        onClick={() => handleConfirm(booking.id)}
                      >
                        <Check size={14} strokeWidth={2} />
                        Təsdiqlə
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="business-dashboard__chip-button business-dashboard__chip-button--ghost"
                        onClick={() => navigate("/business-bookings")}
                      >
                        Bax
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="business-dashboard__link-button"
            onClick={() => navigate("/business-bookings")}
          >
            Bütün rezervlərə bax
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>
        </div>

        <aside className="business-dashboard__side-card">
          <h2>Profiliniz</h2>

          <div className="business-dashboard__progress-top">
            <strong>{stats.profileCompletion}% tamamlanıb</strong>
          </div>

          <div className="business-dashboard__progress-bar">
            <div style={{ width: `${stats.profileCompletion}%` }} />
          </div>

          <p>
            Müştərilərin sizi daha asan tapması üçün profilinizi
            tamamlayın.
          </p>

          <button
            type="button"
            className="business-dashboard__secondary-button"
            onClick={() => navigate("/business-profile")}
          >
            Profili tamamla
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>
        </aside>
      </section>

      {/* ===== XİDMƏTLƏR + SÜRƏTLİ ƏMƏLİYYATLAR ===== */}
      <section className="business-dashboard__content">
        <div className="business-dashboard__panel">
          <div className="business-card-header">
            <h2>Xidmətləriniz</h2>
          </div>

          {services.length === 0 ? (
            <p className="business-dashboard__empty-text">
              Hələ xidmət əlavə etməmisiniz.
            </p>
          ) : (
            <div className="business-service-list">
              {services.slice(0, 4).map((service) => (
                <div className="business-service-row" key={service.id}>
                  <span>{service.name}</span>
                  <strong>{service.price} ₼</strong>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="business-dashboard__link-button"
            onClick={() => navigate("/business-services")}
          >
            Bütün xidmətlər
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="business-dashboard__panel">
          <div className="business-card-header">
            <h2>Sürətli əməliyyatlar</h2>
          </div>

          <div className="business-dashboard__actions">
            <button
              type="button"
              className="business-dashboard__action"
              onClick={() => navigate("/business-services")}
            >
              <div>
                <Plus size={18} strokeWidth={1.8} />
                <span>Yeni xidmət əlavə et</span>
              </div>
            </button>

            <button
              type="button"
              className="business-dashboard__action"
              onClick={() => navigate("/business-portfolio")}
            >
              <div>
                <ImagePlus size={18} strokeWidth={1.8} />
                <span>Portfolioya şəkil əlavə et</span>
              </div>
            </button>

            <button
              type="button"
              className="business-dashboard__action"
              onClick={() => navigate("/business-profile")}
            >
              <div>
                <Settings size={18} strokeWidth={1.8} />
                <span>Biznes profilini redaktə et</span>
              </div>
            </button>

            <button
              type="button"
              className="business-dashboard__action"
              onClick={() => navigate("/business-profile")}
            >
              <div>
                <Clock3 size={18} strokeWidth={1.8} />
                <span>İş saatlarını dəyiş</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessDashboard;