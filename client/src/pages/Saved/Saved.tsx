import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  CheckCircle2,
  Search,
  Trash2,
} from "lucide-react";

import {
  getSavedProviders,
  unsaveProvider,
} from "../../services/savedService";
import type { Provider } from "../../types/provider";
import "./Saved.css";

function Saved() {
  const navigate = useNavigate();

  const [savedProviders, setSavedProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getSavedProviders();

        if (!cancelled) {
          setSavedProviders(result);
        }
      } catch {
        if (!cancelled) {
          setError("Seçilmişləri yükləmək mümkün olmadı.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const removeSaved = async (providerId: string) => {
    try {
      setRemovingId(providerId);
      await unsaveProvider(providerId);

      setSavedProviders((current) =>
        current.filter((provider) => provider.id !== providerId)
      );
    } catch {
      alert("Seçilmişlərdən çıxarmaq mümkün olmadı.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="saved-page">
      <header className="saved-header">
        <div>
          <span className="saved-header__eyebrow">AzLink</span>

          <h1>Seçilmişlər</h1>

          <p>
            Bəyəndiyiniz xidmət göstərən profilləri burada saxlaya
            bilərsiniz.
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

      {isLoading || error ? (
        <section className="saved-empty">
          <h2>{error || "Yüklənir..."}</h2>
        </section>
      ) : savedProviders.length === 0 ? (
        <section className="saved-empty">
          <div className="saved-empty__icon">
            <Heart size={28} strokeWidth={1.8} />
          </div>

          <h2>Hələ heç bir profil saxlanılmayıb</h2>

          <p>
            Bəyəndiyiniz profilin ürək işarəsinə klikləyin. Daha sonra
            həmin profilləri burada asanlıqla tapa bilərsiniz.
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
              <article className="saved-card" key={provider.id}>
                <button
                  type="button"
                  className="saved-card__main"
                  onClick={() => navigate(`/provider/${provider.id}`)}
                >
                  <div className="saved-card__avatar">
                    {provider.image ? (
                      <img src={provider.image} alt={provider.name} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  <div className="saved-card__content">
                    <div className="saved-card__name">
                      <strong>{provider.name}</strong>

                      {provider.verified && (
                        <CheckCircle2 size={16} strokeWidth={2} />
                      )}
                    </div>

                    <span className="saved-card__service">
                      {provider.service}
                    </span>

                    <span className="saved-card__location">
                      <MapPin size={14} strokeWidth={1.8} />
                      {provider.area}
                    </span>

                    <div className="saved-card__rating">
                      <Star
                        size={15}
                        fill="currentColor"
                        strokeWidth={1.8}
                      />

                      <strong>{provider.rating.toFixed(1)}</strong>

                      <span>({provider.reviewCount} rəy)</span>
                    </div>
                  </div>

                  <div className="saved-card__price">
                    <span>Başlanğıc</span>
                    <strong>{provider.priceFrom} ₼</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className="saved-card__remove"
                  title="Seçilmişlərdən çıxar"
                  aria-label="Seçilmişlərdən çıxar"
                  disabled={removingId === provider.id}
                  onClick={() => removeSaved(provider.id)}
                >
                  <Trash2 size={17} strokeWidth={1.8} />
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