import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  UserRound,
} from "lucide-react";

import "./AccountType.css";

function AccountType() {
  const navigate = useNavigate();

  const handleUserSelect = () => {
    navigate("/register?role=user");
  };

  const handleBusinessSelect = () => {
    navigate("/register?role=business");
  };

  return (
    <div className="account-type-page">
      <div className="account-type-card">
        <div className="account-type-header">
          <span className="account-type-eyebrow">
            AzLink
          </span>

          <h1>
            AzLink-dən necə istifadə etmək istəyirsiniz?
          </h1>

          <p>
            Davam etmək üçün sizə uyğun hesab tipini
            seçin.
          </p>
        </div>

        <div className="account-type-options">
          <button
            type="button"
            className="account-type-option"
            onClick={handleUserSelect}
          >
            <div className="account-type-option__icon">
              <UserRound
                size={25}
                strokeWidth={1.8}
              />
            </div>

            <div className="account-type-option__content">
              <h2>İstifadəçiyəm</h2>

              <p>
                Xidmət axtarıram, rezerv yaradıram və
                bəyəndiyim xidmətləri yadda saxlayıram.
              </p>
            </div>

            <ArrowRight
              className="account-type-option__arrow"
              size={20}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            className="account-type-option"
            onClick={handleBusinessSelect}
          >
            <div className="account-type-option__icon">
              <Building2
                size={25}
                strokeWidth={1.8}
              />
            </div>

            <div className="account-type-option__content">
              <h2>Biznes sahibiyəm</h2>

              <p>
                Xidmətlərimi təqdim edirəm, rezervləri
                idarə edirəm və biznes profilimi
                inkişaf etdirirəm.
              </p>
            </div>

            <ArrowRight
              className="account-type-option__arrow"
              size={20}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <p className="account-type-footer">
          Hesab tipinizi sonradan dəyişmək mümkündür.
        </p>
      </div>
    </div>
  );
}

export default AccountType;
