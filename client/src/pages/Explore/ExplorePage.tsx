import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

import { categories } from "../../data/categories";
import { providers } from "../../data/providers";
import "./ExplorePage.css";

function ExplorePage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    if (!normalized) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalized)
    );
  }, [search]);

  const getProviderCount = (categoryServices: string[]) =>
    providers.filter((provider) =>
      categoryServices.includes(provider.service)
    ).length;

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
              const providerCount = getProviderCount(category.services);

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
                      {providerCount === 0
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