import { useState } from "react";
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

import {
  areaOptions,
  categoryOptions,
  getBusinessProfile,
  saveBusinessProfile,
} from "../../services/businessProfileStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role");
  const isBusiness = role === "business";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* Yalnız biznes qeydiyyatında istifadə olunur */
  const [category, setCategory] = useState("");
  const [areaId, setAreaId] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Şifrələr uyğun gəlmir.");
      return;
    }

    if (isBusiness) {
      if (!category || !areaId || !phone.trim()) {
        alert(
          "Zəhmət olmasa kateqoriya, rayon və telefon nömrəsini doldurun."
        );
        return;
      }

      /*
       * Demo rejimində auth olmadığı üçün bu məlumatlar
       * CURRENT_PROVIDER_ID-ə (Nail by Aysel-in demo profili)
       * yazılır. Backend gələndə burada real hesab yaradılacaq.
       */
      const existingProfile = getBusinessProfile(
        CURRENT_PROVIDER_ID
      );

      saveBusinessProfile(CURRENT_PROVIDER_ID, {
        ...existingProfile,
        businessName: name.trim(),
        category,
        areaId,
        phone: phone.trim(),
      });
    }

    console.log("Qeydiyyat məlumatları:", {
      name,
      email,
      password,
      role,
    });

    navigate(
      isBusiness
        ? "/login?role=business"
        : "/login?role=user"
    );
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
              <Building2
                size={24}
                strokeWidth={1.8}
              />
            ) : (
              <User
                size={24}
                strokeWidth={1.8}
              />
            )}
          </div>

          <span className="register-eyebrow">
            AzLink
          </span>

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

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <label className="register-field">
            <span>
              {isBusiness
                ? "Biznes adı"
                : "Ad və soyad"}
            </span>

            <div className="register-input-wrapper">
              {isBusiness ? (
                <Building2
                  size={18}
                  strokeWidth={1.8}
                />
              ) : (
                <User
                  size={18}
                  strokeWidth={1.8}
                />
              )}

              <input
                type="text"
                placeholder={
                  isBusiness
                    ? "Biznes adını daxil edin"
                    : "Ad və soyadınızı daxil edin"
                }
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </div>
          </label>

          <label className="register-field">
            <span>Email</span>

            <div className="register-input-wrapper">
              <Mail
                size={18}
                strokeWidth={1.8}
              />

              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
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

                  <select
                    className="register-select"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Xidmət kateqoriyasını seçin
                    </option>

                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="register-field">
                <span>Rayon</span>

                <div className="register-input-wrapper">
                  <MapPin size={18} strokeWidth={1.8} />

                  <select
                    className="register-select"
                    value={areaId}
                    onChange={(event) =>
                      setAreaId(event.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Xidmət ərazinizi seçin
                    </option>

                    {areaOptions.map((area) => (
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
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    required
                  />
                </div>
              </label>
            </>
          )}

          <label className="register-field">
            <span>Şifrə</span>

            <div className="register-input-wrapper">
              <LockKeyhole
                size={18}
                strokeWidth={1.8}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Şifrənizi daxil edin"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={6}
                required
              />

              <button
                type="button"
                className="register-password-button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Şifrəni gizlət"
                    : "Şifrəni göstər"
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={18}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </div>
          </label>

          <label className="register-field">
            <span>Şifrəni təkrar edin</span>

            <div className="register-input-wrapper">
              <LockKeyhole
                size={18}
                strokeWidth={1.8}
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Şifrənizi yenidən daxil edin"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                minLength={6}
                required
              />

              <button
                type="button"
                className="register-password-button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Şifrəni gizlət"
                    : "Şifrəni göstər"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={18}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={18}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="register-submit-button"
          >
            Qeydiyyatdan keç
          </button>
        </form>

        <div className="register-footer">
          <span>
            Artıq hesabınız var?
          </span>

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
