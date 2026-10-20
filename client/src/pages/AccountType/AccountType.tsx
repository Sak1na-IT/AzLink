import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, Briefcase, UserRound } from "lucide-react";

import ServiceBoutique, {
  type CategoryStats,
} from "../../components/brand/ServiceBoutique";
import GoldDust from "../../components/brand/GoldDust";
import LanguageSwitch from "../../i18n/LanguageSwitch";
import DayStory from "./DayStory";
import { categories } from "../../data/categories";
import { isLoggedIn } from "../../services/api";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import "./AccountType.css";
import { t } from "../../i18n";

/*
 * Başlıq ilk baxışda saytın nə olduğunu deyir; hər sətir açılışda
 * növbə ilə üzə çıxır.
 */
const HEADLINE = [t("Bakıda ustanı tap,"), t("onlayn rezerv et")];

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
  const [providers, setProviders] = useState<Provider[]>([]);

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
        setProviders(providers);
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
      <section className="account-type">
        <div className="account-type__dust" aria-hidden="true">
          <GoldDust count={26} />
        </div>

        <header className="account-type__bar">
          <span className="account-type__brand">AzLink</span>

          <div className="account-type__bar-actions">
            <LanguageSwitch />

            <Link to="/login" className="account-type__login">
              {t("Daxil olun")}
            </Link>
          </div>
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
              {t("AzLink Bakının yerli xidmətlərini bir yerə toplayır: manikürdən santexnikə, repetitordan avtoyumaya. Ustaların qiymətlərini və rəylərini müqayisə edin, boş saatı seçin, rezervi usta təsdiqləsin.")}
            </p>

            <div className="account-type__actions">
              <button
                type="button"
                className="pearl-button pearl-button--primary"
                onClick={() => navigate("/register?role=user")}
              >
                {t("Xidmət seçin")}
              </button>

              <button
                type="button"
                className="pearl-button pearl-button--ghost"
                onClick={() => navigate("/register?role=business")}
              >
                {t("Biznesimi əlavə edirəm")}
              </button>
            </div>

            <dl className="account-type__facts">
              {businessCount ? (
                <div>
                  <dt>{businessCount}</dt>
                  <dd>{t("biznes")}</dd>
                </div>
              ) : null}

              <div>
                <dt>{categories.length}</dt>
                <dd>{t("xidmət sahəsi")}</dd>
              </div>

              {lowestPrice ? (
                <div>
                  <dt>{lowestPrice} ₼</dt>
                  <dd>{t("başlanğıc qiymət")}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="account-type__visual">
            <ServiceBoutique onSelect={handleCategory} stats={stats} />
          </div>
        </div>

        <a href="#how-it-works" className="account-type__scroll">
          <span>{t("Necə işləyir")}</span>
          <ArrowDown size={16} strokeWidth={1.8} />
        </a>
      </section>

      <div id="how-it-works">
        <DayStory providers={providers} />
      </div>

      {/* ---------- Son: iki yol ---------- */}
      <section className="account-type-final">
        <h2>{t("Hansı tərəfdəsiniz?")}</h2>

        <div className="account-type-final__doors">
          <button
            type="button"
            className="account-type-final__door"
            onClick={() => navigate("/register?role=user")}
          >
            <UserRound size={26} strokeWidth={1.5} />
            <strong>{t("Xidmət axtarıram")}</strong>
            <span>{t("Usta tapın, müqayisə edin və rezerv edin. Qeydiyyat pulsuzdur.")}</span>
            <em>{t("Müştəri kimi başla")}</em>
          </button>

          <button
            type="button"
            className="account-type-final__door"
            onClick={() => navigate("/register?role=business")}
          >
            <Briefcase size={26} strokeWidth={1.5} />
            <strong>{t("Xidmət göstərirəm")}</strong>
            <span>{t("Profilinizi qurun, xidmətlərinizi əlavə edin və onlayn rezerv qəbul edin.")}</span>
            <em>{t("Biznesimi əlavə et")}</em>
          </button>
        </div>

        <p className="account-type-final__login">
          {t("Artıq hesabınız var?")}{" "}
          <Link to="/login">{t("Daxil olun")}</Link>
        </p>
      </section>
    </div>
  );
}

export default AccountType;
