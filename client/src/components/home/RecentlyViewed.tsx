import { Star } from "lucide-react";

import type { Provider } from "../../types/provider";
import { getCategoryVisual } from "../../utils/categoryVisual";

interface RecentlyViewedProps {
  providers: Provider[];
  onProviderClick: (providerId: string) => void;
}

function RecentlyViewed({
  providers,
  onProviderClick,
}: RecentlyViewedProps) {
  if (providers.length === 0) return null;

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Son baxdıqlarınız</h2>
      </div>

      <div className="recent-list">
        {providers.map((provider) => {
          const visual = getCategoryVisual(provider.service);
          const Icon = visual.icon;

          return (
            <button
              key={provider.id}
              type="button"
              className="recent-card"
              onClick={() => onProviderClick(provider.id)}
            >
              <div
                className={`recent-card__icon recent-card__icon--${visual.gradient}`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <div className="recent-card__body">
                <div className="recent-card__title-row">
                  <strong>{provider.name}</strong>

                  <span className="recent-card__rating">
                    <Star size={13} strokeWidth={1.8} fill="currentColor" />
                    {provider.rating}
                    <em>({provider.reviewCount})</em>
                  </span>
                </div>

                <p>
                  {provider.service}
                  {" · "}
                  {provider.area}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RecentlyViewed;