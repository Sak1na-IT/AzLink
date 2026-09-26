import { useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Clock3,
  ImagePlus,
  Plus,
  Settings,
  Store,
  Wallet,
  Users,
} from "lucide-react";

import "./BusinessDashboard.css";
import { useNavigate } from "react-router-dom";
import { getBookingsByProvider } from "../../services/bookingStorage";
import { getServicesByProvider } from "../../services/serviceStorage";
import { getProfileCompletion } from "../../services/businessProfileStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";

function BusinessDashboard() {
  const navigate = useNavigate();

  const [bookings] = useState(() =>
    getBookingsByProvider(CURRENT_PROVIDER_ID)
  );

  const [serviceCount] = useState(
    () => getServicesByProvider(CURRENT_PROVIDER_ID).length
  );

  const [profileCompletion] = useState(() =>
    getProfileCompletion(CURRENT_PROVIDER_ID)
  );

  const activeCount = bookings.filter(
    (booking) => booking.status !== "CANCELLED"
  ).length;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  /* Tamamlanmış işlər ayrıca göstərilir, əks halda
     "Təsdiqlənmiş" sayğacından çıxandan sonra heç yerdə görünmür */
  const completedCount = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;

  const revenue = bookings
    .filter(
      (booking) =>
        booking.status === "CONFIRMED" ||
        booking.status === "COMPLETED"
    )
    .reduce((total, booking) => total + booking.priceFrom, 0);

  const uniqueCustomerCount = new Set(
    bookings.map((booking) => booking.customerId)
  ).size;

  return (
    <main className="business-dashboard">
      <section className="business-dashboard__hero">
        <div>
          <span className="business-dashboard__eyebrow">
            Biznes paneli
          </span>

          <h1>Xoş gəlmisiniz</h1>

          <p>
            Biznesinizi, xidmətlərinizi və rezervlərinizi
            buradan idarə edə bilərsiniz.
          </p>
        </div>

        <button
          type="button"
          className="business-dashboard__action"
          onClick={() => navigate("/business-portfolio")}
        >
          <div>
            <ImagePlus size={19} strokeWidth={1.8} />
            <span>Portfolio şəkli əlavə et</span>
          </div>
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="business-dashboard__primary-button"
          onClick={() => navigate("/business-services")}
        >
          <Plus size={18} strokeWidth={2} />
          Yeni xidmət
        </button>
      </section>

      <section className="business-dashboard__stats">
        <div className="business-stat-card">
          <div className="business-stat-card__icon">
            <Store size={20} strokeWidth={1.8} />
          </div>

          <div>
            <span>Xidmətlər</span>
            <strong>{serviceCount}</strong>
          </div>
        </div>

        <button
          type="button"
          className="business-stat-card business-stat-card--clickable"
          onClick={() => navigate("/business-bookings")}
        >
          <div className="business-stat-card__icon">
            <CalendarDays size={20} strokeWidth={1.8} />
          </div>

          <div>
            <span>Rezervlər</span>
            <strong>{activeCount}</strong>
          </div>
        </button>

        <div className="business-stat-card">
          <div className="business-stat-card__icon">
            <CircleCheck size={20} strokeWidth={1.8} />
          </div>

          <div>
            <span>Təsdiqlənmiş</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>

        <button
          type="button"
          className="business-stat-card business-stat-card--clickable"
          onClick={() => navigate("/business-bookings")}
        >
          <div className="business-stat-card__icon">
            <CheckCheck size={20} strokeWidth={1.8} />
          </div>

          <div>
            <span>Tamamlanmış</span>
            <strong>{completedCount}</strong>
          </div>
        </button>

        <div className="business-stat-card">
          <div className="business-stat-card__icon">
            <Wallet size={20} strokeWidth={1.8} />
          </div>

          <div>
            <span>Gəlir</span>
            <strong>{revenue} ₼</strong>
          </div>
        </div>

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
            <strong>{uniqueCustomerCount}</strong>
          </div>
        </button>
      </section>

      <section className="business-dashboard__content">
        {profileCompletion < 100 && (
          <div className="business-dashboard__main-card">
            <div className="business-card-header">
              <div>
                <span className="business-card-header__eyebrow">
                  Başlamaq üçün
                </span>

                <h2>Biznes profilinizi tamamlayın</h2>
              </div>

              <Settings size={21} strokeWidth={1.8} />
            </div>

            <p className="business-dashboard__description">
              Müştərilərin sizi daha asan tapması üçün
              biznes məlumatlarınızı əlavə edin və ilk
              xidmətinizi yaradın.
            </p>

            <div className="business-dashboard__progress">
              <div className="business-dashboard__progress-top">
                <span>Profil tamamlanması</span>
                <strong>{profileCompletion}%</strong>
              </div>

              <div className="business-dashboard__progress-bar">
                <div style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>

            <div className="business-dashboard__actions">
              <button
                type="button"
                className="business-dashboard__action"
                onClick={() => navigate("/business-services")}
              >
                <div>
                  <Plus size={19} strokeWidth={1.8} />

                  <span>İlk xidməti əlavə et</span>
                </div>

                <ChevronRight size={18} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                className="business-dashboard__action"
                onClick={() => navigate("/business-profile")}
              >
                <div>
                  <Settings size={19} strokeWidth={1.8} />

                  <span>Biznes məlumatlarını doldur</span>
                </div>

                <ChevronRight size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}

        <aside className="business-dashboard__side-card">
          <div className="business-side-card__icon">
            <Clock3 size={21} strokeWidth={1.8} />
          </div>

          <span className="business-side-card__eyebrow">
            Son fəaliyyət
          </span>

          {pendingCount > 0 ? (
            <>
              <h2>{pendingCount} gözləyən rezerv</h2>

              <p>
                Müştərilər təsdiqinizi gözləyir. Rezervi
                təsdiqləyəndə müştəri də dərhal görəcək.
              </p>

              <button
                type="button"
                className="business-dashboard__primary-button"
                onClick={() => navigate("/business-bookings")}
              >
                Rezervlərə bax
              </button>
            </>
          ) : (
            <>
              <h2>Gözləyən rezerv yoxdur</h2>

              <p>
                Yeni rezerv gələndə burada görünəcək.
              </p>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}

export default BusinessDashboard;
