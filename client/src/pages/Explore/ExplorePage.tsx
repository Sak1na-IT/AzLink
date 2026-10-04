import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

import { categories } from "../../data/categories";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import "./ExplorePage.css";

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

  const getProviderCount = (categoryServices: string[]) => {
    const wanted = categoryServices.map(normalize);

    return providers.filter((provider) => {
      const names = [provider.service, ...(provider.categories ?? [])].map(
        normalize
      );

      return names.some((name) => wanted.includes(name));
    }).length;
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
          Geri
        </button>
      </div>

      <header className="explore-header">
        <div>
          <span className="explore-header__eyebrow">AzLink</span>

          <h1>Hansı xidmətə ehtiyacınız var?</h1>

          <p>
            Kateqoriya seçin, o sahədəki bütün ustaları dərhal görün.
          </p>
        </div>
      </header>

      <div className="explore-search">
        <Search size={19} strokeWidth={1.8} />

        <input
          type="text"
          placeholder="Kateqoriya axtar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <section className="explore-section">
        <div className="explore-section__header">
          <div>
            <span>Kateqoriyalar</span>
            <h2>Xidmət sahəsi seçin</h2>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="explore-empty">
            <Search size={24} strokeWidth={1.8} />

            <h3>Kateqoriya tapılmadı</h3>

            <p>Başqa bir kateqoriya adı axtarın.</p>
          </div>
        ) : (
          <div className="explore-category-grid">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const providerCount = isLoading
                ? null
                : getProviderCount(category.services);

              return (
                <button
                  type="button"
                  key={category.id}
                  className="explore-category-card"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="explore-category-card__icon">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <div className="explore-category-card__content">
                    <h3>{category.name}</h3>

                    <span>
                      {providerCount === null
                        ? "Yüklənir..."
                        : providerCount === 0
                          ? "Hələ usta yoxdur"
                          : providerCount === 1
                            ? "1 usta"
                            : `${providerCount} usta`}
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