import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  CheckCircle2,
  Search,
  Trash2,
} from "lucide-react";

import { providers } from "../../data/providers";
import "./Saved.css";

const STORAGE_KEY = "azlink-saved-providers";

function readSavedIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Saved() {
  const navigate = useNavigate();

  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(readSavedIds());
  }, []);

  const savedProviders = useMemo(
    () =>
      providers.filter((provider) =>
        savedIds.includes(provider.id)
      ),
    [savedIds]
  );

  const removeSaved = (providerId: string) => {
    const updatedIds = savedIds.filter(
      (id) => id !== providerId
    );

    setSavedIds(updatedIds);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedIds)
    );
  };

  return (
    <div className="saved-page">
      <header className="saved-header">
        <div>
          <span className="saved-header__eyebrow">
            AzLink
          </span>

          <h1>Seçilmişlər</h1>

          <p>
            Bəyəndiyiniz xidmət göstərən profilləri burada
            saxlaya bilərsiniz.
          </p>
        </div>

        <div className="saved-header__actions">
          <button
            type="button"
            className="saved-header__add"
            onClick={() => navigate("/search")}
          >
            <Search size={16} strokeWidth={1.8} />
            Profil əlavə et
          </button>

          <div className="saved-header__count">
            <Heart size={17} strokeWidth={1.8} />
            <span>{savedProviders.length}</span>
          </div>
        </div>
      </header>

      {savedProviders.length === 0 ? (
        <section className="saved-empty">
          <div className="saved-empty__icon">
            <Heart size={28} strokeWidth={1.8} />
          </div>

          <h2>Hələ heç bir profil saxlanılmayıb</h2>

          <p>
            Bəyəndiyiniz profilin ürək işarəsinə klikləyin.
            Daha sonra həmin profilləri burada asanlıqla
            tapa bilərsiniz.
          </p>

          <button
            type="button"
            className="saved-primary-button"
            onClick={() => navigate("/search")}
          >
            <Search size={17} strokeWidth={1.8} />
            Xidmət axtar
          </button>
        </section>
      ) : (
        <section className="saved-list">
          {savedProviders.map((provider) => {
            const initials = provider.name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("");

            return (
              <article
                className="saved-card"
                key={provider.id}
              >
                <button
                  type="button"
                  className="saved-card__main"
                  onClick={() =>
                    navigate(
                      `/provider/${provider.id}`
                    )
                  }
                >
                  <div className="saved-card__avatar">
                    {provider.image ? (
                      <img
                        src={provider.image}
                        alt={provider.name}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  <div className="saved-card__content">
                    <div className="saved-card__name">
                      <strong>{provider.name}</strong>

                      {provider.verified && (
                        <CheckCircle2
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    <span className="saved-card__service">
                      {provider.service}
                    </span>

                    <span className="saved-card__location">
                      <MapPin
                        size={14}
                        strokeWidth={1.8}
                      />
                      {provider.area}
                    </span>

                    <div className="saved-card__rating">
                      <Star
                        size={15}
                        fill="currentColor"
                        strokeWidth={1.8}
                      />

                      <strong>
                        {provider.rating.toFixed(1)}
                      </strong>

                      <span>
                        ({provider.reviewCount} rəy)
                      </span>
                    </div>
                  </div>

                  <div className="saved-card__price">
                    <span>Başlanğıc</span>
                    <strong>
                      {provider.priceFrom} ₼
                    </strong>
                  </div>
                </button>

                <button
                  type="button"
                  className="saved-card__remove"
                  title="Seçilmişlərdən çıxar"
                  aria-label="Seçilmişlərdən çıxar"
                  onClick={() =>
                    removeSaved(provider.id)
                  }
                >
                  <Trash2
                    size={17}
                    strokeWidth={1.8}
                  />
                </button>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Saved;