import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role");
  const isBusiness = role === "business";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log("Login məlumatları:", {
      email,
      password,
      role,
    });

    /*
     * Demo rejimində auth yoxdur: rola görə sadəcə
     * uyğun panelə yönləndiririk. Backend gələndə
     * (Addım 5) bura real giriş yoxlaması gələcək.
     */
    navigate(isBusiness ? "/business" : "/");
  };

  const handleRegister = () => {
    navigate(
      isBusiness
        ? "/register?role=business"
        : "/register?role=user"
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LockKeyhole
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <span className="login-eyebrow">
            AzLink
          </span>

          <h1>
            {isBusiness
              ? "Biznes hesabınıza daxil olun"
              : "İstifadəçi hesabınıza daxil olun"}
          </h1>

          <p>
            {isBusiness
              ? "Xidmətlərinizi idarə etmək və rezervləri qəbul etmək üçün hesabınıza daxil olun."
              : "Xidmət axtarmaq və rezerv yaratmaq üçün hesabınıza daxil olun."}
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label className="login-field">
            <span>Email</span>

            <div className="login-input-wrapper">
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

          <label className="login-field">
            <span>Şifrə</span>

            <div className="login-input-wrapper">
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
                required
              />

              <button
                type="button"
                className="login-password-button"
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

          <button
            type="submit"
            className="login-submit-button"
          >
            Daxil ol
          </button>
        </form>

        <div className="login-footer">
          <span>
            Hesabınız yoxdur?
          </span>

          <button
            type="button"
            className="login-register-button"
            onClick={handleRegister}
          >
            Qeydiyyatdan keç
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
