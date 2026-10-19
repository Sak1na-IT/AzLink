import { Link, useNavigate } from "react-router-dom";

import ServiceConstellation from "../../components/brand/ServiceConstellation";
import VelvetStage from "../../components/brand/VelvetStage";
import { isLoggedIn } from "../../services/api";
import "./AccountType.css";

function AccountType() {
  const navigate = useNavigate();

  /* Sahə kliklənəndə: girişlidirsə həmin sahənin axtarışı, deyilsə qeydiyyat */
  const handleCategory = (categoryId: string) => {
    navigate(
      isLoggedIn() ? `/search?category=${categoryId}` : "/register?role=user"
    );
  };

  return (
    <div className="account-type-page">
      <VelvetStage className="account-type">
        <header className="account-type__bar">
          <span className="account-type__brand">AzLink</span>

          <Link to="/login" className="account-type__login">
            Daxil olun
          </Link>
        </header>

        <div className="account-type__body">
          <div className="account-type__content">
            <h1>Gündəlik ehtiyaclarınız, bir yerdə</h1>

            <p>
              Gözəllikdən ev işlərinə, dərsdən avtomobilə: Bakının
              mütəxəssislərini bir platformada tapın, müqayisə edin və
              onlayn rezerv edin.
            </p>

            <div className="account-type__actions">
              <button
                type="button"
                className="velvet-button velvet-button--primary"
                onClick={() => navigate("/register?role=user")}
              >
                Xidmət axtarıram
              </button>

              <button
                type="button"
                className="velvet-button velvet-button--ghost"
                onClick={() => navigate("/register?role=business")}
              >
                Biznesimi əlavə edirəm
              </button>
            </div>
          </div>

          <div className="account-type__visual">
            <ServiceConstellation onSelect={handleCategory} />
          </div>
        </div>
      </VelvetStage>
    </div>
  );
}

export default AccountType;
