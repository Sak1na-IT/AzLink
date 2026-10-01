import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  LogOut,
  Mail,
  Pencil,
  Shield,
  User,
} from "lucide-react";

import { getBookingsByCustomer } from "../../services/bookingStorage";
import { hasReviewed } from "../../services/reviewStorage";
import { getSavedProviderIds } from "../../services/favoriteStorage";
import { CURRENT_CUSTOMER } from "../../services/demoCustomer";
import { getMe, logout } from "../../services/authService";
import { getStoredUser, type AuthUser } from "../../services/api";
import "./Profile.css";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    getMe()
      .then((freshUser) => {
        setUser(freshUser);
        setName(freshUser.name);
        setEmail(freshUser.email);
      })
      .catch(() => {
        /* saxlanmış istifadəçi ilə davam edirik */
      });
  }, []);

  /* ========================================================
     FƏALİYYƏT
     ======================================================== */

  const bookings = useMemo(
    () => getBookingsByCustomer(CURRENT_CUSTOMER.id),
    []
  );

  const savedCount = useMemo(
    () => getSavedProviderIds().length,
    []
  );

  const reviewsWrittenCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "COMPLETED" && hasReviewed(booking.id)
      ).length,
    [bookings]
  );

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) =>
          `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
        )
        .slice(0, 3),
    [bookings]
  );

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/account-type");
  };

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <div>
          <span className="profile-page__eyebrow">AzLink</span>

          <h1>Profilim</h1>

          <p>Hesabınızı və fəaliyyətinizi idarə edin.</p>
        </div>
      </div>

      <div className="profile-content">
        {/* ========================================================
            PROFİL KARTI
           ======================================================== */}

        <section className="profile-card">
          <div className="profile-avatar">
            <User size={34} strokeWidth={1.8} />
          </div>

          <div className="profile-card__content">
            {isEditing ? (
              <>
                <label>
                  Ad və soyad
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-primary-button"
                    onClick={handleSave}
                  >
                    Yadda saxla
                  </button>

                  <button
                    type="button"
                    className="profile-secondary-button"
                    onClick={() => {
                      setName(user?.name ?? "");
                      setEmail(user?.email ?? "");
                      setIsEditing(false);
                    }}
                  >
                    Ləğv et
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-card__name-row">
                  <h2>{name}</h2>

                  <span className="profile-status">
                    <CheckCircle2 size={15} strokeWidth={1.8} />
                    Aktiv
                  </span>
                </div>

                <div className="profile-card__email">
                  <Mail size={16} strokeWidth={1.8} />
                  <span>{email}</span>
                </div>

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} strokeWidth={1.8} />
                  Profili redaktə et
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="profile-card__logout"
            title="Çıxış"
            aria-label="Çıxış"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </section>

        {/* ========================================================
            FƏALİYYƏTİM
           ======================================================== */}

        <section className="profile-section">
          <div className="profile-section__header">
            <div>
              <h2>Fəaliyyətim</h2>
            </div>
          </div>

          <div className="profile-stats">
            <button
              type="button"
              className="profile-stat"
              onClick={() => navigate("/bookings")}
            >
              <strong>{bookings.length}</strong>
              <span>Rezerv</span>
            </button>

            <button
              type="button"
              className="profile-stat"
              onClick={() => navigate("/saved")}
            >
              <strong>{savedCount}</strong>
              <span>Seçilmiş</span>
            </button>

            <div className="profile-stat profile-stat--static">
              <strong>{reviewsWrittenCount}</strong>
              <span>Rəy</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            SON REZERVLƏRİM
           ======================================================== */}

        <section className="profile-section">
          <div className="profile-section__header">
            <div>
              <h2>Son rezervlərim</h2>
            </div>

            <button
              type="button"
              className="profile-section__link"
              onClick={() => navigate("/bookings")}
            >
              Hamısına bax
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <p className="profile-empty-text">
              Hələ heç bir rezerviniz yoxdur.
            </p>
          ) : (
            <div className="profile-booking-list">
              {recentBookings.map((booking) => (
                <div className="profile-booking-item" key={booking.id}>
                  <div className="profile-booking-item__left">
                    <strong>{booking.providerName}</strong>
                    <span>{booking.service}</span>
                    <span className="profile-booking-item__date">
                      {booking.date} · {booking.time}
                    </span>
                  </div>

                  <div className="profile-booking-item__right">
                    <span
                      className={`profile-booking-status profile-booking-status--${booking.status.toLowerCase()}`}
                    >
                      {STATUS_LABEL[booking.status]}
                    </span>

                    <strong>{booking.priceFrom} ₼</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================
            HESABIM
           ======================================================== */}

        <section className="profile-section">
          <div className="profile-section__header">
            <div>
              <h2>Hesabım</h2>
              <span>AzLink hesabınızla bağlı bölmələr</span>
            </div>
          </div>

          <div className="profile-menu">
            <button type="button" className="profile-menu__item">
              <div className="profile-menu__icon">
                <User size={19} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Hesab məlumatları</strong>
                <span>Ad, email, telefon və şəxsi məlumatlar</span>
              </div>
            </button>

            <button type="button" className="profile-menu__item">
              <div className="profile-menu__icon">
                <Bell size={19} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Bildirişlər</strong>
                <span>Rezerv və digər bildiriş seçimləri</span>
              </div>
            </button>

            <button type="button" className="profile-menu__item">
              <div className="profile-menu__icon">
                <Shield size={19} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Təhlükəsizlik</strong>
                <span>Şifrə və hesab təhlükəsizliyi</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;