import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import "./ChangePasswordModal.css";
import { changePassword, getErrorText } from "../../services/accountService";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const MIN_LENGTH = 8;

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!currentPassword) {
      setError("Cari şifrəni yazın.");
      return;
    }

    if (newPassword.length < MIN_LENGTH) {
      setError(`Yeni şifrə ən azı ${MIN_LENGTH} simvol olmalıdır.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni şifrələr uyğun gəlmir.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Yeni şifrə cari şifrədən fərqli olmalıdır.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await changePassword({ currentPassword, newPassword });

      setDone(true);
    } catch (caught) {
      setError(
        getErrorText(
          caught,
          "Şifrəni dəyişmək mümkün olmadı. Cari şifrənin düzgün olduğunu yoxlayın."
        )
      );
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
        aria-labelledby="password-modal-title"
      >
        <div className="password-modal__header">
          <h2 id="password-modal-title">Şifrəni dəyiş</h2>

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
              Şifrəniz uğurla dəyişdirildi.
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
              <span>Cari şifrə</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label className="password-modal__field">
              <span>Yeni şifrə</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <small>Ən azı {MIN_LENGTH} simvol.</small>
            </label>

            <label className="password-modal__field">
              <span>Yeni şifrə (təkrar)</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
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
                {isSaving ? "Saxlanılır..." : "Şifrəni dəyiş"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default ChangePasswordModal;