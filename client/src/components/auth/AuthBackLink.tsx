import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "./AuthBackLink.css";
import { t } from "../../i18n";

/* Giriş və qeydiyyat səhifələrindən hesab seçimi ekranına qayıtmaq üçün */
function AuthBackLink() {
  return (
    <Link to="/" className="auth-back-link">
      <ArrowLeft size={16} strokeWidth={1.9} />
      <span>{t("Hesab seçiminə qayıt")}</span>
    </Link>
  );
}

export default AuthBackLink;
