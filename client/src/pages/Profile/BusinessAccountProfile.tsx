import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Lock, LogOut, Mail, Pencil, UserRound } from "lucide-react";

import "./BusinessAccountProfile.css";
import "../../components/business/BusinessTheme.css";
import ChangePasswordModal from "../../components/account/ChangePasswordModal";
import ChangeEmailModal from "../../components/account/ChangeEmailModal";
import { getStoredUser } from "../../services/api";
import {
  getErrorText,
  readAccount,
  updateMyProfile,
  type AccountInfo,
} from "../../services/accountService";
import { getMe, logout } from "../../services/authService";
import { t } from "../../i18n";
import {
  getNotificationPrefs,
  setNotificationPref,
  type NotificationKind,
} from "../../utils/notificationPrefs";

/* Yuxarıdakı zəng ikonunda görünən bildirişlər: hər biri açılıb-bağlanır */
const notificationRows: { kind: NotificationKind; label: string }[] = [
  { kind: "booking", label: t("Yeni rezervlər") },
  { kind: "cancel", label: t("Müştərinin ləğv etdiyi rezervlər") },
  { kind: "review", label: t("Yeni rəylər") },
];

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
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(getNotificationPrefs);

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
      setFormError(t("Ad 2-60 simvol arasında olmalıdır."));
      return;
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      setFormError(t("Telefon nömrəsini düzgün yazın (məs. +994 50 123 45 67)."));
      return;
    }

    if (!phone && account.phone) {
      setFormError(t("Telefon nömrəsini boş qoymaq olmaz."));
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
      setNotice(t("Dəyişikliklər yadda saxlanıldı."));

      /* yadda saxlanmış istifadəçi məlumatını təzələməyə çalışırıq */
      getMe().catch(() => {});
    } catch (caught) {
      setFormError(getErrorText(caught, t("Yadda saxlamaq mümkün olmadı.")));
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

  /* "Nail by Aysel" → "NA" */
  const initials = (account.name || "")
    .trim()
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word[0] ?? ""))
    .map((word) => word[0])
    .filter((_, index, all) => index === 0 || index === all.length - 1)
    .join("")
    .toLocaleUpperCase("az");

  return (
    <main className="account-profile">
      <section className="account-profile__header">
        <h1>{t("Profil")}</h1>
      </section>

      {/* ===== HESAB KARTI: müştəri profilindəki kimi; redaktə də burada ===== */}
      <section
        className={`account-profile__card account-profile__identity${isEditing ? " is-editing" : ""}`}
        ref={personalRef}
      >
        <div className="account-profile__avatar">
          {initials || <UserRound size={30} strokeWidth={1.7} />}
        </div>

        {isEditing ? (
          /* Solda profil şəkli, sağda dəyişdiriləcək məlumatlar */
          <form className="account-profile__form" onSubmit={handleSave}>
            <label className="account-profile__field">
              <span>{t("Ad və soyad")}</span>
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
              <span>{t("Telefon")}</span>
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

            <label className="account-profile__field">
              <span>{t("Email")}</span>
              <input type="email" value={account.email} disabled readOnly />
            </label>

            {formError && <p className="account-profile__error">{formError}</p>}

            <div className="account-profile__form-actions">
              <button
                type="button"
                className="account-profile__button"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                {t("Ləğv et")}
              </button>

              <button
                type="submit"
                className="account-profile__button account-profile__button--primary"
                disabled={isSaving}
              >
                {isSaving ? t("Saxlanılır...") : t("Yadda saxla")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="account-profile__identity-info">
              <h2>{account.name || "—"}</h2>
              <span>{account.email}</span>
              {account.phone && <span>{account.phone}</span>}
              <em className="account-profile__role">{t("Biznes sahibi")}</em>

              {notice && <p className="account-profile__notice">{notice}</p>}

              <button
                type="button"
                className="account-profile__edit-button"
                onClick={openEdit}
              >
                <Pencil size={15} strokeWidth={1.8} />
                {t("Profili redaktə et")}
              </button>
            </div>

            <button
              type="button"
              className="account-profile__icon-button account-profile__logout-icon"
              onClick={handleLogout}
              aria-label={t("Hesabdan çıx")}
              title={t("Hesabdan çıx")}
            >
              <LogOut size={18} strokeWidth={1.9} />
            </button>
          </>
        )}
      </section>

      {/* ===== TƏHLÜKƏSİZLİK: menyu sətirləri ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>{t("Təhlükəsizlik")}</h2>
        </div>

        <div className="account-profile__menu">
          <button
            type="button"
            className="account-profile__menu-row"
            onClick={() => setIsPasswordOpen(true)}
          >
            <span className="account-profile__menu-icon">
              <Lock size={17} strokeWidth={1.8} />
            </span>
            <span className="account-profile__menu-text">{t("Şifrəni dəyiş")}</span>
            <ChevronRight className="account-profile__menu-chevron" size={18} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="account-profile__menu-row"
            onClick={() => setIsEmailOpen(true)}
          >
            <span className="account-profile__menu-icon">
              <Mail size={17} strokeWidth={1.8} />
            </span>
            <span className="account-profile__menu-text">{t("Emaili dəyiş")}</span>
            <ChevronRight className="account-profile__menu-chevron" size={18} strokeWidth={1.8} />
          </button>
        </div>
      </section>

      {/* ===== BİLDİRİŞLƏR: açıb-bağlamaq olur ===== */}
      <section className="account-profile__card">
        <div className="account-profile__card-header">
          <h2>{t("Bildirişlər")}</h2>
        </div>

        <div className="account-profile__menu">
          {notificationRows.map(({ kind, label }) => (
            <label className="account-profile__menu-row" key={kind}>
              <span className="account-profile__menu-icon">
                <Bell size={17} strokeWidth={1.8} />
              </span>
              <span className="account-profile__menu-text">{label}</span>
              <input
                type="checkbox"
                role="switch"
                className="account-profile__switch"
                checked={notificationPrefs[kind]}
                onChange={(event) =>
                  setNotificationPrefs(
                    setNotificationPref(kind, event.target.checked)
                  )
                }
              />
            </label>
          ))}
        </div>
      </section>

      {isPasswordOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />
      )}

      {isEmailOpen && (
        <ChangeEmailModal
          currentEmail={account.email}
          onClose={() => setIsEmailOpen(false)}
          onChanged={(email) =>
            setAccount((current) => ({ ...current, email }))
          }
        />
      )}
    </main>
  );
}

export default BusinessAccountProfile;