import {
  ArrowLeft,
  Check,
  Filter,
  Heart,
  MapPin,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AreaSelector from "../../components/AreaSelector/AreaSelector";
import { getStoredUser } from "../../services/api";
import { getProviders } from "../../services/providersService";
import { areas, type Area } from "../../types/area";
import type { Provider } from "../../types/provider";
import { matchesArea } from "../../utils/areaMatch";

import "./SearchResults.css";
import { categories, type ServiceCategory } from "../../data/categories";
import {
  isProviderSaved,
  toggleSavedProvider,
} from "../../services/favoriteStorage";

type PriceFilter = "all" | "under-20" | "20-30" | "30-50" | "50-plus";

const priceLabels: Record<PriceFilter, string> = {
  all: "Bütün qiymətlər",
  "under-20": "20 ₼-dən aşağı",
  "20-30": "20–30 ₼",
  "30-50": "30–50 ₼",
  "50-plus": "50 ₼+",
};

/*
 * Mətnləri müqayisə etmək üçün standart formaya salırıq.
 */
const normalize = (value: string) => value.toLocaleLowerCase("az").trim();

const isSimilar = (a: string, b: string) =>
  a === b || a.includes(b) || b.includes(a);

/*
 * Xidmət uyğunluğu: service=Dırnaq gəlirsə, kateqoriya adı və ya
 * xidmət adı "Dırnaq"a uyğun olan bizneslər göstərilir.
 */
const matchesService = (provider: Provider, wanted: string) => {
  const wantedService = normalize(wanted);

  const names = [
    provider.service,
    ...(provider.categories ?? []),
    ...(provider.services ?? []).map((service) => service.name),
  ]
    .map(normalize)
    .filter(Boolean);

  return names.some((name) => isSimilar(name, wantedService));
};

/*
 * Kateqoriya uyğunluğu (Explore-dan gələndə):
 * biznesin kateqoriya adlarından biri seçilmiş kateqoriyanın adı
 * və ya onun alt xidmətlərindən biri ilə üst-üstə düşməlidir.
 */
const matchesCategory = (provider: Provider, category: ServiceCategory) => {
  const wanted = [category.name, ...category.services].map(normalize);

  const names = [provider.service, ...(provider.categories ?? [])]
    .map(normalize)
    .filter(Boolean);

  return names.some((name) => wanted.includes(name));
};

function SearchResults() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  const currentUserId = getStoredUser()?.id;

  /*
   * Bizneslər backend-dən bir dəfə yüklənir.
   */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getProviders();

        if (cancelled) {
          return;
        }

        setProviders(result);
        setSavedIds(
          new Set(
            result
              .filter((provider) => isProviderSaved(provider.id))
              .map((provider) => provider.id)
          )
        );
      } catch {
        if (!cancelled) {
          setLoadError("Bizneslər yüklənmədi. Bir az sonra yenidən cəhd edin.");
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

  /*
   * URL-dən məlumatları oxuyuruq.
   */

  const query = searchParams.get("q")?.trim() ?? "";

  const selectedService = searchParams.get("service")?.trim() ?? "";

  const selectedCategory = searchParams.get("category")?.trim() ?? "";

  const selectedAreas = searchParams.getAll("area");

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  const selectedPrice = (searchParams.get("price") as PriceFilter) || "all";

  const minimumRating = Number(searchParams.get("rating") ?? "0");

  /*
   * URL-dəki ərazi adlarını Area obyektlərinə çeviririk.
   * Siyahıda tapılmayan ad istifadəçinin özü yazdığı ərazi sayılır (custom).
   */

  const selectedAreaObjects: Area[] = selectedAreas.map(
    (name) =>
      areas.find((area) => normalize(area.name) === normalize(name)) ?? {
        id: `custom-${name}`,
        name,
        type: "custom",
      }
  );

  const handleToggleSave = (providerId: string) => {
    const nowSaved = toggleSavedProvider(providerId);

    setSavedIds((current) => {
      const next = new Set(current);

      if (nowSaved) {
        next.add(providerId);
      } else {
        next.delete(providerId);
      }

      return next;
    });
  };

  /*
   * PROVIDER-LƏRİ FİLTRLƏ
   */

  const filteredProviders = useMemo(() => {
    const normalizedQuery = normalize(query);

    return providers.filter((provider) => {
      /*
       * Öz biznesim axtarışda görünməsin
       */

      if (currentUserId && provider.ownerId === currentUserId) {
        return false;
      }

      /*
       * SEARCH
       */

      const searchableText = normalize(
        [
          provider.name,
          provider.service,
          provider.area,
          ...(provider.categories ?? []),
          ...(provider.services ?? []).map((service) => service.name),
        ].join(" ")
      );

      const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

      const matchesQuery =
        queryWords.length === 0 ||
        queryWords.every((word) => searchableText.includes(word));

      if (!matchesQuery) {
        return false;
      }

      /*
       * SERVICE
       */

      if (selectedService && !matchesService(provider, selectedService)) {
        return false;
      }

      /*
       * CATEGORY (yalnız konkret xidmət seçilməyibsə tətbiq olunur —
       * Explore-dan gəlir, BookingStart isə birbaşa service göndərir)
       */

      if (selectedCategory && !selectedService) {
        if (!activeCategory) {
          return false;
        }

        if (!matchesCategory(provider, activeCategory)) {
          return false;
        }
      }

      /*
       * AREA
       */

      const concreteAreas = selectedAreas.filter(
        (area) => normalize(area) !== "bütün bakı"
      );

      if (concreteAreas.length > 0) {
        const hasAreaMatch = concreteAreas.some((area) =>
          matchesArea(provider.area, area)
        );

        if (!hasAreaMatch) {
          return false;
        }
      }

      /*
       * PRICE
       */

      const price = provider.priceFrom;

      if (selectedPrice === "under-20" && price >= 20) {
        return false;
      }

      if (selectedPrice === "20-30" && (price < 20 || price > 30)) {
        return false;
      }

      if (selectedPrice === "30-50" && (price < 30 || price > 50)) {
        return false;
      }

      if (selectedPrice === "50-plus" && price < 50) {
        return false;
      }

      /*
       * RATING
       */

      if (minimumRating > 0 && provider.rating < minimumRating) {
        return false;
      }

      return true;
    });
  }, [
    providers,
    currentUserId,
    query,
    selectedService,
    selectedCategory,
    activeCategory,
    selectedAreas,
    selectedPrice,
    minimumRating,
  ]);

  /*
   * PRICE FILTER
   */

  const updatePrice = (value: PriceFilter) => {
    const next = new URLSearchParams(searchParams);

    if (value === "all") {
      next.delete("price");
    } else {
      next.set("price", value);
    }

    setSearchParams(next);
  };

  /*
   * RATING FILTER
   */

  const updateRating = (value: number) => {
    const next = new URLSearchParams(searchParams);

    if (value === 0) {
      next.delete("rating");
    } else {
      next.set("rating", String(value));
    }

    setSearchParams(next);
  };

  /*
   * AREA SİL
   */

  const removeArea = (areaToRemove: string) => {
    const next = new URLSearchParams(searchParams);

    next.delete("area");

    selectedAreas
      .filter((area) => area !== areaToRemove)
      .forEach((area) => {
        next.append("area", area);
      });

    setSearchParams(next);
  };

  /*
   * AREA SEÇ / ƏLAVƏ ET
   *
   * AreaSelector modalında "Tətbiq et" basılanda
   * seçilmiş ərazilər URL-ə yazılır.
   * "Bütün Bakı" seçilibsə URL-də ərazi qalmır.
   */

  const applyAreas = (nextAreas: Area[]) => {
    const next = new URLSearchParams(searchParams);

    next.delete("area");

    nextAreas
      .filter((area) => area.id !== "all-baku")
      .forEach((area) => {
        next.append("area", area.name);
      });

    setSearchParams(next);
  };

  /*
   * FİLTRLƏRİ TƏMİZLƏ
   *
   * service/category qalır, çünki istifadəçi hələ də
   * həmin xidmət üzrə axtarış edir.
   */

  const clearFilters = () => {
    const next = new URLSearchParams();

    if (query) {
      next.set("q", query);
    }

    if (selectedCategory) {
      next.set("category", selectedCategory);
    }

    if (selectedService) {
      next.set("service", selectedService);
    }

    setSearchParams(next);
  };

  /*
   * PROVIDER PROFİLİ
   */

  const openProvider = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  if (isLoading || loadError) {
    return (
      <main className="search-results-page">
        <div className="search-results-container">
          <section className="search-empty">
            <h2>{loadError || "Yüklənir..."}</h2>
          </section>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="search-results-page">
        <div className="search-results-container">
          {/* HEADER */}

          <header className="search-results-header">
            <button
              type="button"
              className="search-results-back"
              onClick={() => navigate(-1)}
              aria-label="Geri"
            >
              <ArrowLeft size={19} strokeWidth={1.8} />
            </button>

            <div className="search-results-title">
              <span className="search-results-eyebrow">Yeni rezerv</span>

              <h1>
                {selectedService
                  ? selectedService
                  : activeCategory
                    ? activeCategory.name
                    : query
                      ? `“${query}”`
                      : "Bütün xidmətlər"}
              </h1>

              <p>
                {selectedService
                  ? `${selectedService} xidməti göstərən bizneslər`
                  : activeCategory
                    ? `${activeCategory.name} sahəsində bütün bizneslər`
                    : "Sizə uyğun xidmətləri tapın"}
              </p>
            </div>
          </header>

          {/* SUMMARY */}

          <section className="search-summary">
            <div className="search-summary__count">
              <strong>{filteredProviders.length}</strong>

              <span> nəticə</span>
            </div>

            {selectedAreas.length > 0 && (
              <div className="search-summary__areas">
                {selectedAreas.map((area) => (
                  <span key={area} className="search-area-tag">
                    <MapPin size={12} />

                    {area}

                    <button
                      type="button"
                      onClick={() => removeArea(area)}
                      aria-label={`${area} sil`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              className="search-area-add"
              onClick={() => setIsAreaSelectorOpen(true)}
            >
              <Plus size={14} strokeWidth={2} />

              {selectedAreas.length > 0 ? "Ərazi əlavə et" : "Ərazi seç"}
            </button>
          </section>

          {/* FILTERS */}

          <section className="search-filters">
            <div className="search-filter-label">
              <Filter size={16} />
              Filtrlər
            </div>

            <div className="search-filter-group">
              <span>Qiymət:</span>

              {(Object.entries(priceLabels) as [PriceFilter, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`search-filter ${
                      selectedPrice === value ? "is-active" : ""
                    }`}
                    onClick={() => updatePrice(value)}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div className="search-filter-group">
              <span>Reytinq:</span>

              {[
                { value: 0, label: "Hamısı" },
                { value: 4, label: "4.0+" },
                { value: 4.5, label: "4.5+" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`search-filter ${
                    minimumRating === item.value ? "is-active" : ""
                  }`}
                  onClick={() => updateRating(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {(selectedPrice !== "all" ||
              minimumRating > 0 ||
              selectedAreas.length > 0) && (
              <button
                type="button"
                className="search-clear"
                onClick={clearFilters}
              >
                Təmizlə
              </button>
            )}
          </section>

          {/* RESULTS */}

          {filteredProviders.length > 0 ? (
            <section className="search-provider-grid">
              {filteredProviders.map((provider) => (
                <article key={provider.id} className="search-provider-card">
                  <button
                    type="button"
                    className="search-provider-card__open"
                    onClick={() => openProvider(provider.id)}
                  >
                    {/* IMAGE */}

                    <div className="search-provider-card__image">
                      {provider.image ? (
                        <img src={provider.image} alt={provider.name} />
                      ) : (
                        <span>{provider.name.charAt(0).toUpperCase()}</span>
                      )}

                      {provider.verified && (
                        <span className="search-provider-card__verified">
                          <Check size={13} />
                          Təsdiqlənib
                        </span>
                      )}
                    </div>

                    {/* BODY */}

                    <div className="search-provider-card__body">
                      <div className="search-provider-card__name">
                        <strong>{provider.name}</strong>
                      </div>

                      <div className="search-provider-card__service">
                        {provider.service}
                      </div>

                      <div className="search-provider-card__location">
                        <MapPin size={13} />

                        <span>{provider.area}</span>

                        {provider.distance != null && (
                          <>
                            <span>·</span>

                            <span>{provider.distance} km</span>
                          </>
                        )}
                      </div>

                      <div className="search-provider-card__rating">
                        <span>
                          <Star size={13} fill="currentColor" />

                          {provider.rating}
                        </span>

                        <span>{provider.reviewCount} rəy</span>
                      </div>

                      <div className="search-provider-card__footer">
                        <span>Başlayan qiymət</span>

                        <strong>{provider.priceFrom} ₼-dən</strong>
                      </div>
                    </div>
                  </button>

                  {/* SAVE */}

                  <button
                    type="button"
                    className="search-provider-card__save"
                    aria-label={
                      savedIds.has(provider.id)
                        ? `${provider.name} seçilmişlərdən çıxar`
                        : `${provider.name} seçilmişlərə əlavə et`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleSave(provider.id);
                    }}
                  >
                    <Heart
                      size={17}
                      strokeWidth={1.8}
                      fill={savedIds.has(provider.id) ? "currentColor" : "none"}
                    />
                  </button>
                </article>
              ))}
            </section>
          ) : (
            <section className="search-empty">
              <div className="search-empty__icon">
                <Search size={22} />
              </div>

              <h2>Uyğun nəticə tapılmadı</h2>

              <p>Bu xidmət üzrə hazırda uyğun biznes tapılmadı.</p>

              <button
                type="button"
                className="search-empty__button"
                onClick={clearFilters}
              >
                Filtrləri təmizlə
              </button>
            </section>
          )}
        </div>
      </main>

      {isAreaSelectorOpen && (
        <AreaSelector
          selectedAreas={selectedAreaObjects}
          onApply={applyAreas}
          onClose={() => setIsAreaSelectorOpen(false)}
        />
      )}
    </>
  );
}

export default SearchResults;