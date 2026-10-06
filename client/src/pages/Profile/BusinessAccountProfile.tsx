import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Lock, LogOut, Mail, UserRound } from "lucide-react";

import "./BusinessAccountProfile.css";
import ChangePasswordModal from "../../components/account/ChangePasswordModal";
import { getStoredUser } from "../../services/api";
import {
  getErrorText,
  readAccount,
  updateMyProfile,
  type AccountInfo,
} from "../../services/accountService";
import { getMe, logout } from "../../services/authService";

const notificationRows = [
  "Rezervasiya bildirişləri",
  "Rezervasiya dəyişiklikləri",
  "Yeni rəylər",
  "Sistem bildirişləri",
];

const SOON = "Tezliklə əlavə olunacaq";

const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

function BusinessAccountProfile() {
  const navigate = useNavigate();
  const personalRef = useRef<HTMLElement>(null);

  const [account, setAccount] = useState<AccountInfo>(
    () => readAccount(getStoredUser()) ?? { name: "", email: "", phone: "" }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((result) => {
        const info = readAccount(result);

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

  const openEdit = () => {
    setDraft({ name: account.name, phone: account.phone });
    setFormError("");
    setNotice("");
    setIsEditing(true);

    window.setTimeout(() => {
      personalRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = draft.name.trim();
    const phone = draft.phone.trim();

    if (name.length < 2 || name.length > 60) {
      setFormError("Ad 2-60 simvol arasında olmalıdır.");
      return;
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      setFormError("Telefon nömrəsini düzgün yazın (məs. +994 50 123 45 67).");
      return;
    }

    if (!phone && account.phone) {
      setFormError("Telefon nömrəsini boş qoymaq olmaz.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const updated = await updateMyProfile({
        name,
        ...(phone ? { phone } : {}),
      });

      const info = readAccount(updated);

      setAccount((current) => ({
        name: info?.name || name,
        email: info?.email || current.email,
        phone: info?.phone || phone,
      }));

      setIsEditing(false);
      setNotice("Dəyişikliklər yadda saxlanıldı.");

      /* yadda saxlanmış istifadəçi məlumatını təzələməyə çalışırıq */
      getMe().catch(() => {});
    } catch (caught) {
      setFormError(getErrorText(caught, "Yadda saxlamaq mümkün olmadı."));
    } finally {
      setIsSaving(false);
    }
  };

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
          onClick={openEdit}
        >
          Redaktə et
        </button>
      </section>

      {/* ===== ŞƏXSİ MƏLUMATLAR ===== */}
      <section className="account-profile__card" ref={personalRef}>
        <div className="account-profile__card-header">
          <h2>Şəxsi məlumatlar</h2>
          <p>Hesab məlumatlarınızı yeniləyin.</p>
        </div>

        {notice && <p className="account-profile__notice">{notice}</p>}

        {isEditing ? (
          <form className="account-profile__form" onSubmit={handleSave}>
            <label className="account-profile__field">
              <span>Ad və soyad</span>
              <input
                type="text"
                maxLength={60}
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label className="account-profile__field">
              <span>Email</span>
              <input type="email" value={account.email} disabled readOnly />
              <small className="account-profile__hint">
                Emaili dəyişmək hələ mümkün deyil.
              </small>
            </label>

            <label className="account-profile__field">
              <span>Telefon</span>
              <input
                type="tel"
                placeholder="+994 50 123 45 67"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>

            {formError && <p className="account-profile__error">{formError}</p>}

            <div className="account-profile__form-actions">
              <button
                type="button"
                className="account-profile__button"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Ləğv et
              </button>

              <button
                type="submit"
                className="account-profile__button account-profile__button--primary"
                disabled={isSaving}
              >
                {isSaving ? "Saxlanılır..." : "Yadda saxla"}
              </button>
            </div>
          </form>
        ) : (
          <>
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
                onClick={openEdit}
              >
                Redaktə et
              </button>
            </div>
          </>
        )}
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
              onClick={() => setIsPasswordOpen(true)}
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

      {isPasswordOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />
      )}
    </main>
  );
}

export default BusinessAccountProfile;