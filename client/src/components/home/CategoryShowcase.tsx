import { ChevronRight } from "lucide-react";

import { categories } from "../../data/categories";
import type { Provider } from "../../types/provider";

interface CategoryShowcaseProps {
  providers: Provider[];
  onCategoryClick: (categoryId: string) => void;
  onSeeAllClick: () => void;
}

/*
 * 8 xidmət sahəsi qızılı haşiyəli medalyonlar kimi (giriş ekranındakı
 * kimi). Altında real rəqəmlər: neçə biznes və qiymət neçədən başlayır.
 */
function CategoryShowcase({
  providers,
  onCategoryClick,
  onSeeAllClick,
}: CategoryShowcaseProps) {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Sahələr</h2>

        <button
          type="button"
          className="home-section__link"
          onClick={onSeeAllClick}
        >
          Hamısı
          <ChevronRight size={15} strokeWidth={1.8} />
        </button>
      </div>

      <div className="category-showcase">
        {categories.map((category) => {
          const Icon = category.icon;
          const inCategory = providers.filter((provider) =>
            provider.categories?.includes(category.name)
          );
          const prices = inCategory
            .map((provider) => provider.priceFrom)
            .filter((price) => price > 0);

          return (
            <button
              key={category.id}
              type="button"
              className="category-showcase__item"
              onClick={() => onCategoryClick(category.id)}
            >
              <span className="category-showcase__medal">
                <Icon size={24} strokeWidth={1.6} />
              </span>

              <strong>{category.name}</strong>

              <small>
                {inCategory.length > 0
                  ? `${inCategory.length} biznes${
                      prices.length ? ` · ${Math.min(...prices)} ₼-dən` : ""
                    }`
                  : category.services.join(", ")}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryShowcase;
