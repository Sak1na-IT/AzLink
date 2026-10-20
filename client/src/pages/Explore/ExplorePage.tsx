import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

import { categories } from "../../data/categories";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import "./ExplorePage.css";
import { t } from "../../i18n";

const normalize = (value: string) => value.toLocaleLowerCase("az").trim();

function ExplorePage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then((result) => {
        if (!cancelled) {
          setProviders(result);
        }
      })
      .catch(() => {
        /* yüklənməsə, usta sayı 0 göstərilir */
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const normalized = normalize(search);

    if (!normalized) {
      return categories;
    }

    return categories.filter((category) =>
      normalize(category.name).includes(normalized)
    );
  }, [search]);

  const getCategoryProviders = (categoryServices: string[]) => {
    const wanted = categoryServices.map(normalize);

    return providers.filter((provider) => {
      const names = [provider.service, ...(provider.categories ?? [])].map(
        normalize
      );

      return names.some((name) => wanted.includes(name));
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  return (
    <main className="explore-page">
      <div className="explore-page__top">
        <button
          type="button"
          className="explore-page__back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          {t("Geri")}
        </button>
      </div>

      <header className="explore-header">
        <div>
          <span className="explore-header__eyebrow">AzLink</span>

          <h1>Hansı xidmətə ehtiyacınız var?</h1>

          <p>
            {t("Kateqoriya seçin, o sahədəki bütün ustaları dərhal görün.")}
          </p>
        </div>
      </header>

      <div className="explore-search">
        <Search size={19} strokeWidth={1.8} />

        <input
          type="text"
          placeholder={t("Kateqoriya axtar...")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <section className="explore-section">
        <div className="explore-section__header">
          <div>
            <span>{t("Kateqoriyalar")}</span>
            <h2>{t("Xidmət sahəsi seçin")}</h2>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="explore-empty">
            <Search size={24} strokeWidth={1.8} />

            <h3>{t("Kateqoriya tapılmadı")}</h3>

            <p>{t("Başqa bir kateqoriya adı axtarın.")}</p>
          </div>
        ) : (
          <div className="explore-category-grid">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const inCategory = getCategoryProviders(category.services);
              const providerCount = isLoading ? null : inCategory.length;
              /* Kartın fonu: bu sahədəki ilk şəkilli biznesin üz qabığı */
              const cover = inCategory.find((provider) => provider.image)?.image;
              const prices = inCategory
                .map((provider) => provider.priceFrom)
                .filter((price) => price > 0);
              const priceFrom = prices.length ? Math.min(...prices) : null;

              return (
                <button
                  type="button"
                  key={category.id}
                  className="explore-category-card"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {cover ? (
                    <img
                      className="explore-category-card__photo"
                      src={cover}
                      alt=""
                      loading="lazy"
                    />
                  ) : null}
                  <span className="explore-category-card__shade" />

                  <div className="explore-category-card__icon">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <div className="explore-category-card__content">
                    <h3>{t(category.name)}</h3>

                    <span>
                      {providerCount === null
                        ? t("Yüklənir...")
                        : providerCount === 0
                          ? t("Hələ usta yoxdur")
                          : providerCount === 1
                            ? t("1 usta")
                            : t("{count} usta", { count: providerCount })}
                      {priceFrom !== null && providerCount
                        ? ` · ${t("{price} ₼-dən", { price: priceFrom })}`
                        : ""}
                    </span>
                  </div>

                  <ArrowRight
                    className="explore-category-card__arrow"
                    size={19}
                    strokeWidth={1.8}
                  />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default ExplorePage;