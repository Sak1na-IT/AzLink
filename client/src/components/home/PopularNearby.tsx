import {
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";

import type { Provider } from "../../types/provider";
import { getCategoryVisual } from "../../utils/categoryVisual";

interface PopularNearbyProps {
  providers: Provider[];
  onProviderClick: (providerId: string) => void;
  onSeeAllClick?: () => void;
}

function PopularNearby({
  providers,
  onProviderClick,
  onSeeAllClick,
}: PopularNearbyProps) {
  return (
    <section className="home-section">
      {/* =========================
          SECTION HEADER
         ========================= */}

      <div className="home-section__header">
        <h2>Yaxınlıqda populyar</h2>

        <button
          type="button"
          className="home-section__link"
          onClick={onSeeAllClick}
        >
          Daha çox
          <ChevronRight
            size={15}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* =========================
          PROVIDER LIST
         ========================= */}

      {providers.length > 0 ? (
        <>
          <div className="popular-list">
            {providers.map((provider) => {
              const visual = getCategoryVisual(provider.service);
              const Icon = visual.icon;

              return (
                <button
                  key={provider.id}
                  type="button"
                  className="popular-card"
                  onClick={() =>
                    onProviderClick(provider.id)
                  }
                >
                  {/* ---------- IMAGE / PLACEHOLDER ---------- */}

                  <div
                    className={`popular-card__image popular-card__image--${visual.gradient}`}
                  >
                    {provider.image ? (
                      <img
                        src={provider.image}
                        alt={provider.name}
                      />
                    ) : (
                      <>
                        <Icon
                          size={28}
                          strokeWidth={1.6}
                        />
                        <span className="popular-card__image-label">
                          Nümunə şəkil
                        </span>
                      </>
                    )}
                  </div>

                  {/* ---------- BODY ---------- */}

                  <div className="popular-card__body">
                    <div className="popular-card__title-row">
                      <strong>{provider.name}</strong>

                      <span className="popular-card__rating">
                        <Star
                          size={13}
                          strokeWidth={1.8}
                          fill="currentColor"
                        />
                        {provider.rating}
                        <em>({provider.reviewCount})</em>
                      </span>
                    </div>

                    <p className="popular-card__meta">
                      {provider.service}
                      {" · "}
                      {provider.area}
                      {provider.distance != null &&
                        ` · ${provider.distance} km`}
                    </p>

                    <p className="popular-card__status">
                      {provider.verified
                        ? "Təsdiqlənib"
                        : "Təsdiqlənməyib"}
                      {" · "}
                      <strong>
                        {provider.priceFrom} ₼-dən
                      </strong>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="popular-caption">
            Populyar profillər seçdiyiniz əraziyə və
            platformadakı reytinqə əsasən göstərilir.
          </p>
        </>
      ) : (
        /* =========================
           EMPTY STATE
           ========================= */

        <div className="popular-empty">
          <MapPin
            size={22}
            strokeWidth={1.6}
          />

          <strong>
            Bu ərazidə profil tapılmadı
          </strong>

          <p>
            Ərazi seçiminizi genişləndirərək
            daha çox nəticəyə baxa bilərsiniz.
          </p>
        </div>
      )}
    </section>
  );
}

export default PopularNearby;