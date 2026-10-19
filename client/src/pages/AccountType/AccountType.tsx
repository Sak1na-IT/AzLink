import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import PearlNecklace from "../../components/brand/PearlNecklace";
import VelvetStage from "../../components/brand/VelvetStage";
import { isLoggedIn } from "../../services/api";
import "./AccountType.css";

function AccountType() {
  const navigate = useNavigate();
  const zoneRef = useRef<HTMLDivElement>(null);

  /* Mirvari kliklənəndə: girişlidirsə həmin sahənin axtarışı, deyilsə qeydiyyat */
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

        {/* Boyunbağının asıldığı sahə; boyunbağının özü bütün vitrini tutur */}
        <div ref={zoneRef} className="account-type__zone" />

        <div className="account-type__necklace">
          <PearlNecklace
            onSelect={handleCategory}
            zoneRef={zoneRef}
            top={-0.12}
            sag={0.95}
          />
        </div>

        <div className="account-type__content">
          <h1>Bakının xidmətləri bir sapda</h1>

          <p>
            Usta, salon və mütəxəssisləri tapın, vaxtınızı onlayn rezerv
            edin. Hər mirvari bir sahədir: birinə toxunun.
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
      </VelvetStage>
    </div>
  );
}

export default AccountType;
