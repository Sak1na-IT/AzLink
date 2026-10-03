import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Lock, LogOut, Mail, UserRound } from "lucide-react";

import "./BusinessAccountProfile.css";
import { getStoredUser } from "../../services/api";
import { getMe, logout } from "../../services/authService";

interface AccountInfo {
  name: string;
  email: string;
  phone: string;
}

const readString = (value: unknown) =>
  typeof value === "string" ? value : "";

/*
 * /auth/me cavabı { user: {...} } və ya birbaşa {...} ola bilər.
 * İkisini də qəbul edirik.
 */
const toAccountInfo = (value: unknown): AccountInfo | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const source =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record;

  return {
    name: readString(source.name),
    email: readString(source.email),
    phone: readString(source.phone),
  };
};

const notificationRows = [
  "Rezervasiya bildirişləri",
  "Rezervasiya dəyişiklikləri",
  "Yeni rəylər",
  "Sistem bildirişləri",
];

const SOON = "Tezliklə əlavə olunacaq";

function BusinessAccountProfile() {
  const navigate = useNavigate();

  const [account, setAccount] = useState<AccountInfo>(
    () =>
      toAccountInfo(getStoredUser()) ?? { name: "", email: "", phone: "" }
  );

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((result) => {
        const info = toAccountInfo(result);

        if (cancelled || !info) {
          return;
        }

        setAccount((current) => ({
          name: info.name || current.name,
          email: info.email || current.email,
          phone: info.phone || current.phone,
        }));
      })
      .catch(() => {
        /* serverə çatmasa, yadda saxlanmış məlumat göstərilir */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/account-type", { replace: true });
    }
  };

  return (
    <main className="account-profile">
      <section className="account-profile__header">
        <h1>Profil</h1>
        <p>Hesabınızı və şəxsi parametrlərinizi idarə edin.</p>
      </section>

      {/* ===== HESAB KARTI ===== */}
      <section className="account-profile__card account-profile__identity">
        <div className="account-profile__avatar">
          <UserRound size={30} strokeWidth={1.7} />
        </div>

        <div className="account-profile__identity-info">
          <h2>{account.name || "—"}</h2>
          <span>{account.email}</span>
          <em className="account-profile__role">Biznes sahibi</em>
        </div>

        <button
          type="button"
          className="account-profile__button"
          disabled
          title={SOON}
        >
          Redaktə et
        </button>
      </section>

      {/* ===== ŞƏXSİ MƏLUMATLAR ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>Şəxsi məlumatlar</h2>
          <p>Hesab məlumatlarınızı yeniləyin.</p>
        </div>

        <dl className="account-profile__rows">
          <div className="account-profile__row">
            <dt>Ad və soyad</dt>
            <dd>{account.name || "—"}</dd>
          </div>

          <div className="account-profile__row">
            <dt>Email</dt>
            <dd>{account.email || "—"}</dd>
          </div>

          <div className="account-profile__row">
            <dt>Telefon</dt>
            <dd>{account.phone || "Əlavə edilməyib"}</dd>
          </div>
        </dl>

        <div className="account-profile__actions">
          <button
            type="button"
            className="account-profile__button"
            disabled
            title={SOON}
          >
            Redaktə et
          </button>
        </div>
      </section>

      {/* ===== TƏHLÜKƏSİZLİK ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>Təhlükəsizlik</h2>
        </div>

        <ul className="account-profile__list">
          <li>
            <span className="account-profile__list-label">
              <Lock size={18} strokeWidth={1.8} />
              Şifrə
            </span>

            <button
              type="button"
              className="account-profile__button"
              disabled
              title={SOON}
            >
              Şifrəni dəyiş
            </button>
          </li>

          <li>
            <span className="account-profile__list-label">
              <Mail size={18} strokeWidth={1.8} />
              Email
            </span>

            <button
              type="button"
              className="account-profile__button"
              disabled
              title={SOON}
            >
              Emaili dəyiş
            </button>
          </li>
        </ul>
      </section>

      {/* ===== BİLDİRİŞLƏR ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>Bildirişlər</h2>
        </div>

        <ul className="account-profile__list">
          {notificationRows.map((label) => (
            <li key={label}>
              <span className="account-profile__list-label">
                <Bell size={18} strokeWidth={1.8} />
                {label}
              </span>

              <span className="account-profile__soon">Tezliklə</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== HESAB ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>Hesab</h2>
        </div>

        <dl className="account-profile__rows">
          <div className="account-profile__row">
            <dt>Dil</dt>
            <dd>Azərbaycan dili</dd>
          </div>
        </dl>

        <div className="account-profile__actions">
          <button
            type="button"
            className="account-profile__logout"
            onClick={handleLogout}
          >
            <LogOut size={17} strokeWidth={1.9} />
            Hesabdan çıx
          </button>
        </div>
      </section>
    </main>
  );
}

export default BusinessAccountProfile;