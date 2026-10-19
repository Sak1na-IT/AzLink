import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Search } from "lucide-react";

import Pearl from "../../components/brand/Pearl";
import "./AccountType.css";

function AccountType() {
  const navigate = useNavigate();

  return (
    <div className="account-type-page">
      <div className="account-type">
        <section className="account-type__content">
          <span className="account-type__brand">AzLink</span>

          <h1>Bakıda lazım olan xidməti tapın, vaxtınızı rezerv edin</h1>

          <p className="account-type__lead">
            Başlamaq üçün sizə uyğun olanı seçin.
          </p>

          <div className="account-type__options">
            <button
              type="button"
              className="account-type__option"
              onClick={() => navigate("/register?role=user")}
            >
              <span className="account-type__icon">
                <Search size={20} strokeWidth={1.8} />
              </span>

              <span className="account-type__text">
                <strong>Xidmət axtarıram</strong>
                <small>Usta tapın, profilləri müqayisə edin, rezerv edin.</small>
              </span>

              <ChevronRight
                className="account-type__chevron"
                size={20}
                strokeWidth={1.8}
              />
            </button>

            <button
              type="button"
              className="account-type__option"
              onClick={() => navigate("/register?role=business")}
            >
              <span className="account-type__icon">
                <Building2 size={20} strokeWidth={1.8} />
              </span>

              <span className="account-type__text">
                <strong>Biznesim var</strong>
                <small>Xidmətlərinizi əlavə edin, rezervləri idarə edin.</small>
              </span>

              <ChevronRight
                className="account-type__chevron"
                size={20}
                strokeWidth={1.8}
              />
            </button>
          </div>

          <p className="account-type__login">
            Hesabınız var? <Link to="/login">Daxil olun</Link>
          </p>
        </section>

        <div className="account-type__visual">
          <Pearl />
        </div>
      </div>
    </div>
  );
}

export default AccountType;
