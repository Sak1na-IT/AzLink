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

import ChangePasswordModal from "../../components/account/ChangePasswordModal";
import {
  getErrorText,
  readAccount,
  updateMyProfile,
} from "../../services/accountService";
import { getBookings, type Booking } from "../../services/bookingsService";
import { getSavedProviders } from "../../services/savedService";
import { getMyReviewCount } from "../../services/activityService";
import { getMe, logout } from "../../services/authService";
import { getStoredUser, type AuthUser } from "../../services/api";
import "./Profile.css";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

function Profile() {
  const navigate = useNavigate();
  const currentUserId = getStoredUser()?.id;

  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(readAccount(user)?.phone ?? "");
  const [savedPhone, setSavedPhone] = useState(readAccount(user)?.phone ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getMe()
      .then((freshUser) => {
        const info = readAccount(freshUser);

        setUser(freshUser);
        setName(freshUser.name);
        setEmail(freshUser.email);

        if (info?.phone) {
          setPhone(info.phone);
          setSavedPhone(info.phone);
        }
      })
      .catch(() => {
        /* saxlanmış istifadəçi ilə davam edirik */
      });
  }, []);

  /* ========================================================
     FƏALİYYƏT (real API)
     ======================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [bookingsResult, savedResult, reviewsResult] =
        await Promise.allSettled([
          getBookings(),
          getSavedProviders(),
          getMyReviewCount(),
        ]);

      if (cancelled) {
        return;
      }

      if (bookingsResult.status === "fulfilled") {
        /* yalnız sizin müştəri kimi etdiyiniz rezervlər */
        setBookings(
          bookingsResult.value.filter(
            (booking) => booking.customerId === currentUserId
          )
        );
      }

      if (savedResult.status === "fulfilled") {
        setSavedCount(savedResult.value.length);
      }

      if (reviewsResult.status === "fulfilled") {
        setReviewCount(reviewsResult.value);
      }

      setIsLoaded(true);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) =>
          `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
        )
        .slice(0, 3),
    [bookings]
  );

  /* ========================================================
     REDAKTƏ
     ======================================================== */

  const openEdit = () => {
    setSaveError("");
    setNotice("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setName(user?.name ?? "");
    setPhone(savedPhone);
    setSaveError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setSaveError("Ad 2-60 simvol arasında olmalıdır.");
      return;
    }

    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      setSaveError("Telefon nömrəsini düzgün yazın (məs. +994 50 123 45 67).");
      return;
    }

    if (!trimmedPhone && savedPhone) {
      setSaveError("Telefon nömrəsini boş qoymaq olmaz.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      const updated = await updateMyProfile({
        name: trimmedName,
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      });

      const info = readAccount(updated);
      const nextName = info?.name || trimmedName;
      const nextPhone = info?.phone || trimmedPhone;

      setName(nextName);
      setPhone(nextPhone);
      setSavedPhone(nextPhone);
      setUser((current) => (current ? { ...current, name: nextName } : current));

      setIsEditing(false);
      setNotice("Dəyişikliklər yadda saxlanıldı.");

      /* yadda saxlanmış istifadəçi məlumatını təzələməyə çalışırıq */
      getMe().catch(() => {});
    } catch (caught) {
      setSaveError(getErrorText(caught, "Yadda saxlamaq mümkün olmadı."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/account-type");
  };

  const showCount = (value: number) => (isLoaded ? value : "–");

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
                    maxLength={60}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <label>
                  Telefon
                  <input
                    type="tel"
                    placeholder="+994 50 123 45 67"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                <label>
                  Email (hələ dəyişdirmək olmur)
                  <input type="email" value={email} disabled readOnly />
                </label>

                {saveError && (
                  <p
                    className="profile-empty-text"
                    style={{ color: "var(--color-danger)" }}
                  >
                    {saveError}
                  </p>
                )}

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-primary-button"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saxlanılır..." : "Yadda saxla"}
                  </button>

                  <button
                    type="button"
                    className="profile-secondary-button"
                    onClick={cancelEdit}
                    disabled={isSaving}
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

                {notice && (
                  <p
                    className="profile-empty-text"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {notice}
                  </p>
                )}

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={openEdit}
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
              <strong>{showCount(bookings.length)}</strong>
              <span>Rezerv</span>
            </button>

            <button
              type="button"
              className="profile-stat"
              onClick={() => navigate("/saved")}
            >
              <strong>{showCount(savedCount)}</strong>
              <span>Seçilmiş</span>
            </button>

            <div className="profile-stat profile-stat--static">
              <strong>{showCount(reviewCount)}</strong>
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
            <button
              type="button"
              className="profile-menu__item"
              onClick={() => {
                openEdit();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
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

            <button
              type="button"
              className="profile-menu__item"
              onClick={() => setIsPasswordOpen(true)}
            >
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

      {isPasswordOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />
      )}
    </div>
  );
}

export default Profile;