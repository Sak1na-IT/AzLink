import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ServiceConstellation from "../../components/brand/ServiceConstellation";
import VelvetStage from "../../components/brand/VelvetStage";
import { categories } from "../../data/categories";
import { isLoggedIn } from "../../services/api";
import { getProviders } from "../../services/providersService";
import "./AccountType.css";

/* Başlıq sətirləri; hər sətir açılışda növbə ilə üzə çıxır */
const HEADLINE = ["Gündəlik", "ehtiyaclarınız,", "bir yerdə"];

/* Bakının 12 rayonu (types/area.ts) */
const DISTRICT_COUNT = 12;

function AccountType() {
  const navigate = useNavigate();

  /* Bazadan real rəqəmlər: neçə biznes var və hansı sahədə neçəsi */
  const [businessCount, setBusinessCount] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then((providers) => {
        if (cancelled) {
          return;
        }

        const byCategory: Record<string, number> = {};

        for (const category of categories) {
          byCategory[category.name] = providers.filter((provider) =>
            provider.categories?.includes(category.name)
          ).length;
        }

        setBusinessCount(providers.length);
        setCounts(byCategory);
      })
      .catch(() => {
        /* Rəqəmlər yüklənməsə də səhifə işləyir, sadəcə göstərilmir */
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
            {/* Açılışda sözlər bir-bir yumşaqca üzə çıxır */}
            <h1 aria-label={HEADLINE.join(" ")}>
              {HEADLINE.map((line, index) => (
                <span
                  key={line}
                  className="account-type__line"
                  style={{ animationDelay: `${150 + index * 140}ms` }}
                  aria-hidden="true"
                >
                  {line}
                </span>
              ))}
            </h1>

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

            <dl className="account-type__facts">
              {businessCount ? (
                <div>
                  <dt>{businessCount}</dt>
                  <dd>biznes</dd>
                </div>
              ) : null}

              <div>
                <dt>{categories.length}</dt>
                <dd>xidmət sahəsi</dd>
              </div>

              <div>
                <dt>{DISTRICT_COUNT}</dt>
                <dd>Bakı rayonu</dd>
              </div>
            </dl>
          </div>

          <div className="account-type__visual">
            <ServiceConstellation onSelect={handleCategory} counts={counts} />
          </div>
        </div>
      </VelvetStage>
    </div>
  );
}

export default AccountType;
