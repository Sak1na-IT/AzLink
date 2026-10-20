import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

/* Şifrə pəncərəsi ilə eyni görünüş */
import "./ChangePasswordModal.css";
import { changeEmail, getErrorText } from "../../services/accountService";

interface ChangeEmailModalProps {
  currentEmail: string;
  onClose: () => void;
  /* Uğurlu dəyişiklikdən sonra səhifə yeni emaili göstərsin */
  onChanged: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ChangeEmailModal({
  currentEmail,
  onClose,
  onChanged,
}: ChangeEmailModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError("Düzgün email yazın.");
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase()) {
      setError("Bu, onsuz da cari emailinizdir.");
      return;
    }

    if (!password) {
      setError("Təsdiq üçün cari şifrənizi yazın.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const newEmail = await changeEmail({ email: cleanEmail, password });

      onChanged(newEmail);
      setDone(true);
    } catch (caught) {
      setError(getErrorText(caught, "Emaili dəyişmək mümkün olmadı."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="password-modal">
      <button
        type="button"
        className="password-modal__backdrop"
        aria-label="Bağla"
        onClick={onClose}
      />

      <section
        className="password-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-title"
      >
        <div className="password-modal__header">
          <h2 id="email-modal-title">Emaili dəyiş</h2>

          <button
            type="button"
            className="password-modal__close"
            aria-label="Bağla"
            onClick={onClose}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {done ? (
          <>
            <p className="password-modal__success">
              Emailiniz dəyişdirildi. Növbəti girişdə yeni emaildən istifadə edin.
            </p>

            <div className="password-modal__actions">
              <button
                type="button"
                className="password-modal__primary"
                onClick={onClose}
              >
                Bağla
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label className="password-modal__field">
              <span>Cari email</span>
              <input type="email" value={currentEmail} disabled readOnly />
            </label>

            <label className="password-modal__field">
              <span>Yeni email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="password-modal__field">
              <span>Cari şifrə</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <small>Təhlükəsizlik üçün şifrənizlə təsdiqləyin.</small>
            </label>

            {error && <p className="password-modal__error">{error}</p>}

            <div className="password-modal__actions">
              <button
                type="button"
                className="password-modal__secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Ləğv et
              </button>

              <button
                type="submit"
                className="password-modal__primary"
                disabled={isSaving}
              >
                {isSaving ? "Saxlanılır..." : "Emaili dəyiş"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default ChangeEmailModal;
