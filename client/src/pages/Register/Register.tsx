import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
} from "lucide-react";

import { signup } from "../../services/authService";
import { ApiError } from "../../services/api";
import { getAreas, type Area } from "../../services/areasService";
import {
  saveBusinessProfile,
  defaultWeeklySchedule,
} from "../../services/businessService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role");
  const isBusiness = role === "business";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Yalnız biznes qeydiyyatında istifadə olunur */
  const [category, setCategory] = useState("");
  const [areaId, setAreaId] = useState("");
  const [phone, setPhone] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isBusiness) {
      return;
    }

    getAreas()
      .then(setAreas)
      .catch(() => setAreas([]));
  }, [isBusiness]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir.");
      return;
    }

    if (isBusiness && (!category.trim() || !areaId || !phone.trim())) {
      setError(
        "Zəhmət olmasa kateqoriya, rayon və telefon nömrəsini doldurun."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        email,
        password,
        role: isBusiness ? "BUSINESS" : "USER",
      });

      if (isBusiness) {
        await saveBusinessProfile({
          businessName: name.trim(),
          category: category.trim(),
          areaId,
          phone: phone.trim(),
          description: "",
          schedule: defaultWeeklySchedule,
        });
      }

      navigate(
        isBusiness ? "/login?role=business" : "/login?role=user"
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate(
      isBusiness
        ? "/login?role=business"
        : "/login?role=user"
    );
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            {isBusiness ? (
              <Building2 size={24} strokeWidth={1.8} />
            ) : (
              <User size={24} strokeWidth={1.8} />
            )}
          </div>

          <span className="register-eyebrow">AzLink</span>

          <h1>
            {isBusiness
              ? "Biznes hesabı yaradın"
              : "İstifadəçi hesabı yaradın"}
          </h1>

          <p>
            {isBusiness
              ? "Xidmətlərinizi AzLink-də təqdim etmək üçün biznes hesabınızı yaradın."
              : "AzLink-də xidmət axtarmaq və rezerv yaratmaq üçün hesabınızı yaradın."}
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-field">
            <span>{isBusiness ? "Biznes adı" : "Ad və soyad"}</span>

            <div className="register-input-wrapper">
              {isBusiness ? (
                <Building2 size={18} strokeWidth={1.8} />
              ) : (
                <User size={18} strokeWidth={1.8} />
              )}

              <input
                type="text"
                placeholder={
                  isBusiness
                    ? "Biznes adını daxil edin"
                    : "Ad və soyadınızı daxil edin"
                }
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          </label>

          <label className="register-field">
            <span>Email</span>

            <div className="register-input-wrapper">
              <Mail size={18} strokeWidth={1.8} />

              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          {isBusiness && (
            <>
              <label className="register-field">
                <span>Kateqoriya</span>

                <div className="register-input-wrapper">
                  <Tag size={18} strokeWidth={1.8} />

                  <input
                    type="text"
                    placeholder="Məsələn: Dırnaq baxımı"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="register-field">
                <span>Rayon</span>

                <div className="register-input-wrapper">
                  <MapPin size={18} strokeWidth={1.8} />

                  <select
                    className="register-select"
                    value={areaId}
                    onChange={(event) => setAreaId(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Xidmət ərazinizi seçin
                    </option>

                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="register-field">
                <span>Telefon</span>

                <div className="register-input-wrapper">
                  <Phone size={18} strokeWidth={1.8} />

                  <input
                    type="tel"
                    placeholder="+994 50 000 00 00"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </div>
              </label>
            </>
          )}

          <label className="register-field">
            <span>Şifrə</span>

            <div className="register-input-wrapper">
              <LockKeyhole size={18} strokeWidth={1.8} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifrənizi daxil edin"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="register-password-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </label>

          <label className="register-field">
            <span>Şifrəni təkrar edin</span>

            <div className="register-input-wrapper">
              <LockKeyhole size={18} strokeWidth={1.8} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Şifrənizi yenidən daxil edin"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={6}
                required
              />

              <button
                type="button"
                className="register-password-button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                aria-label={
                  showConfirmPassword
                    ? "Şifrəni gizlət"
                    : "Şifrəni göstər"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </label>

          {error && <p className="register-error">{error}</p>}

          <button
            type="submit"
            className="register-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Göndərilir..." : "Qeydiyyatdan keç"}
          </button>
        </form>

        <div className="register-footer">
          <span>Artıq hesabınız var?</span>

          <button
            type="button"
            className="register-login-button"
            onClick={handleLogin}
          >
            Daxil olun
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;