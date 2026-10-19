import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ServiceBoutique, {
  type CategoryStats,
} from "../../components/brand/ServiceBoutique";
import VelvetStage from "../../components/brand/VelvetStage";
import { categories } from "../../data/categories";
import { isLoggedIn } from "../../services/api";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import "./AccountType.css";

/* Başlıq sətirləri; hər sətir açılışda növbə ilə üzə çıxır */
const HEADLINE = ["Özünüzə vaxt ayırın,", "qalanını biz tapaq"];

/*
 * Bazadakı bizneslərdən hər sahə üçün real rəqəmlər:
 * neçə biznes var, qiymət neçədən başlayır, ən sərfəli xidmətlər.
 */
const buildStats = (providers: Provider[]) => {
  const result: Record<string, CategoryStats> = {};

  for (const category of categories) {
    const inCategory = providers.filter((provider) =>
      provider.categories?.includes(category.name)
    );

    /* Eyni adlı xidmətlərdən ən ucuzunu saxlayırıq */
    const cheapest = new Map<string, number>();

    for (const provider of inCategory) {
      for (const service of provider.services ?? []) {
        const known = cheapest.get(service.name);

        if (known === undefined || service.price < known) {
          cheapest.set(service.name, service.price);
        }
      }
    }

    const topServices = Array.from(cheapest, ([name, price]) => ({
      name,
      price,
    }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 4);

    const prices = inCategory
      .map((provider) => provider.priceFrom)
      .filter((price) => price > 0);

    result[category.name] = {
      businessCount: inCategory.length,
      priceFrom: prices.length ? Math.min(...prices) : null,
      topServices,
    };
  }

  return result;
};

function AccountType() {
  const navigate = useNavigate();

  const [businessCount, setBusinessCount] = useState<number | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [stats, setStats] = useState<Record<string, CategoryStats>>({});

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then((providers) => {
        if (cancelled) {
          return;
        }

        const prices = providers
          .map((provider) => provider.priceFrom)
          .filter((price) => price > 0);

        setBusinessCount(providers.length);
        setLowestPrice(prices.length ? Math.min(...prices) : null);
        setStats(buildStats(providers));
      })
      .catch(() => {
        /* Rəqəmlər yüklənməsə də səhifə işləyir, sadəcə göstərilmir */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* "Ustaları gör": girişlidirsə həmin sahənin axtarışı, deyilsə qeydiyyat */
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
            <h1 aria-label={HEADLINE.join(" ")}>
              {HEADLINE.map((line, index) => (
                <span
                  key={line}
                  className="account-type__line"
                  style={{ animationDelay: `${150 + index * 160}ms` }}
                  aria-hidden="true"
                >
                  {line}
                </span>
              ))}
            </h1>

            <p>
              Manikürdən ev təmizliyinə, dərsdən avtomobil yumasına: Bakının
              mütəxəssisləri bir platformada. Qiymətləri müqayisə edin, boş
              vaxtı seçin, bir toxunuşla rezerv edin.
            </p>

            <div className="account-type__actions">
              <button
                type="button"
                className="velvet-button velvet-button--primary"
                onClick={() => navigate("/register?role=user")}
              >
                Xidmət seçin
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

              {lowestPrice ? (
                <div>
                  <dt>{lowestPrice} ₼</dt>
                  <dd>başlanğıc qiymət</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="account-type__visual">
            <ServiceBoutique onSelect={handleCategory} stats={stats} />
          </div>
        </div>
      </VelvetStage>
    </div>
  );
}

export default AccountType;
