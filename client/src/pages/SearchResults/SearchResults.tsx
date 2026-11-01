import {
  ArrowLeft,
  Check,
  ChevronDown,
  Heart,
  LayoutGrid,
  MapPin,
  Search,
  Star,
  Wallet,
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
  getSavedProviders,
  saveProvider,
  unsaveProvider,
} from "../../services/savedService";
import { t, getLang } from "../../i18n";
type PriceFilter = "all" | "under-20" | "20-30" | "30-50" | "50-plus";
type FilterMenu = "category" | "price" | "rating";

const ratingOptions = [
  { value: 0, label: t("Hamısı") },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
];

const priceLabels: Record<PriceFilter, string> = {
  all: t("Bütün qiymətlər"),
  "under-20": t("20 ₼-dən aşağı"),
  "20-30": "20–30 ₼",
  "30-50": "30–50 ₼",
  "50-plus": "50 ₼+",
};

/*
 * Mətnləri müqayisə etmək üçün standart formaya salırıq.
 */
const normalize = (value: string) =>
  value.toLocaleLowerCase(getLang() === "en" ? "en" : "az").trim();

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

  /* Açıq olan filtr menyusu: kateqoriya, qiymət və ya reytinq */
  const [openMenu, setOpenMenu] = useState<FilterMenu | null>(null);

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

        try {
          const saved = await getSavedProviders();

          if (!cancelled) {
            setSavedIds(new Set(saved.map((provider) => provider.id)));
          }
        } catch {
          /* seçilmişlər yüklənməsə də axtarış işləməyə davam edir */
        }

      } catch {
        if (!cancelled) {
          setLoadError(t("Bizneslər yüklənmədi. Bir az sonra yenidən cəhd edin."));
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
   * Axtarış xanası: yazdıqca nəticələr dərhal süzülür (URL-də q).
   * Boşluqla bitən mətni silməmək üçün yalnız fərq olanda URL-dən götürürük.
   */
  const [searchText, setSearchText] = useState(query);

  useEffect(() => {
    setSearchText((current) => (current.trim() === query ? current : query));
  }, [query]);

  const updateQuery = (value: string) => {
    setSearchText(value);

    const next = new URLSearchParams(searchParams);

    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }

    setSearchParams(next, { replace: true });
  };

  /* Menyu Esc ilə bağlanır */
  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  const toggleMenu = (menu: FilterMenu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

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

  const handleToggleSave = async (providerId: string) => {
    const wasSaved = savedIds.has(providerId);

    try {
      if (wasSaved) {
        await unsaveProvider(providerId);
      } else {
        await saveProvider(providerId);
      }
    } catch {
      return;
    }

    setSavedIds((current) => {
      const next = new Set(current);

      if (wasSaved) {
        next.delete(providerId);
      } else {
        next.add(providerId);
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
        ]
          /* ingilis dilində ingiliscə sözlə də tapılsın: "manicure" → Manikür */
          .flatMap((value) => (value ? [value, t(value)] : []))
          .join(" ")
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
    setOpenMenu(null);
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
    setOpenMenu(null);
  };

  /*
   * KATEQORİYA SEÇ (səhifədən çıxmadan)
   */

  const updateCategory = (categoryId: string | null) => {
    const next = new URLSearchParams(searchParams);

    next.delete("service");

    if (categoryId) {
      next.set("category", categoryId);
    } else {
      next.delete("category");
    }

    setSearchParams(next);
    setOpenMenu(null);
  };

  /* Hər kateqoriyada neçə biznes var (menyuda göstərilir) */
  const categoryCounts = useMemo(() => {
    const visible = providers.filter(
      (provider) => !(currentUserId && provider.ownerId === currentUserId)
    );

    return Object.fromEntries(
      categories.map((category) => [
        category.id,
        visible.filter((provider) => matchesCategory(provider, category)).length,
      ])
    ) as Record<string, number>;
  }, [providers, currentUserId]);

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

    if (selectedService) {
      next.set("service", selectedService);
    }

    setSearchText("");
    setSearchParams(next);
  };

  const hasFilters =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    selectedPrice !== "all" ||
    minimumRating > 0 ||
    selectedAreas.length > 0;

  const areaLabel =
    selectedAreas.length === 0
      ? t("Ərazi")
      : selectedAreas.length === 1
        ? selectedAreas[0]
        : t("{count} ərazi", { count: selectedAreas.length });

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
            <h2>{loadError || t("Yüklənir...")}</h2>
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
              aria-label={t("Geri")}
            >
              <ArrowLeft size={19} strokeWidth={1.8} />
            </button>

            <div className="search-results-title">
              <span className="search-results-eyebrow">{t("Yeni rezerv")}</span>

              <h1>
                {selectedService
                  ? t(selectedService)
                  : activeCategory
                    ? t(activeCategory.name)
                    : query
                      ? `“${t(query)}”`
                      : t("Bütün xidmətlər")}
              </h1>

              <p>
                {selectedService
                  ? t("{selectedService} xidməti göstərən bizneslər", { selectedService: t(selectedService) })
                  : activeCategory
                    ? t("{name} sahəsində bütün bizneslər", { name: t(activeCategory.name) })
                    : t("Sizə uyğun xidmətləri tapın")}
              </p>
            </div>
          </header>

          {/* AXTARIŞ VƏ FİLTRLƏR */}

          <section className="search-toolbar">
            <label className="search-toolbar__search">
              <Search size={19} strokeWidth={1.8} />

              <input
                type="search"
                value={searchText}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder={t("Xidmət və ya biznes axtarın, məs. manikür")}
                aria-label={t("Axtar")}
                enterKeyHint="search"
              />

              {searchText && (
                <button
                  type="button"
                  className="search-toolbar__clear"
                  onClick={() => updateQuery("")}
                  aria-label={t("Axtarışı təmizlə")}
                >
                  <X size={15} strokeWidth={2} />
                </button>
              )}
            </label>

            <div className="search-toolbar__filters">
              {/* Kateqoriya */}
              <div className="search-menu">
                <button
                  type="button"
                  className={`search-chip${activeCategory ? " is-set" : ""}${openMenu === "category" ? " is-open" : ""}`}
                  onClick={() => toggleMenu("category")}
                  aria-expanded={openMenu === "category"}
                >
                  <LayoutGrid size={15} strokeWidth={1.8} />
                  <span>
                    {activeCategory ? t(activeCategory.name) : t("Kateqoriya")}
                  </span>
                  <ChevronDown className="search-chip__caret" size={14} strokeWidth={2} />
                </button>

                {openMenu === "category" && (
                  <div className="search-menu__panel search-menu__panel--grid" role="listbox">
                    <strong className="search-menu__title">{t("Kateqoriya")}</strong>

                    <button
                      type="button"
                      className={`search-menu__option${!activeCategory ? " is-selected" : ""}`}
                      onClick={() => updateCategory(null)}
                    >
                      <span className="search-menu__icon">
                        <LayoutGrid size={15} strokeWidth={1.8} />
                      </span>
                      <span>{t("Bütün kateqoriyalar")}</span>
                      {!activeCategory && <Check className="search-menu__check" size={16} />}
                    </button>

                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = activeCategory?.id === category.id;

                      return (
                        <button
                          type="button"
                          key={category.id}
                          className={`search-menu__option${isSelected ? " is-selected" : ""}`}
                          onClick={() => updateCategory(category.id)}
                        >
                          <span className="search-menu__icon">
                            <Icon size={15} strokeWidth={1.8} />
                          </span>
                          <span>{t(category.name)}</span>
                          <small>{categoryCounts[category.id] ?? 0}</small>
                          {isSelected && <Check className="search-menu__check" size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Qiymət */}
              <div className="search-menu">
                <button
                  type="button"
                  className={`search-chip${selectedPrice !== "all" ? " is-set" : ""}${openMenu === "price" ? " is-open" : ""}`}
                  onClick={() => toggleMenu("price")}
                  aria-expanded={openMenu === "price"}
                >
                  <Wallet size={15} strokeWidth={1.8} />
                  <span>
                    {selectedPrice !== "all" ? priceLabels[selectedPrice] : t("Qiymət")}
                  </span>
                  <ChevronDown className="search-chip__caret" size={14} strokeWidth={2} />
                </button>

                {openMenu === "price" && (
                  <div className="search-menu__panel" role="listbox">
                    <strong className="search-menu__title">{t("Qiymət")}</strong>

                    {(Object.entries(priceLabels) as [PriceFilter, string][]).map(
                      ([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          className={`search-menu__option${selectedPrice === value ? " is-selected" : ""}`}
                          onClick={() => updatePrice(value)}
                        >
                          <span>{label}</span>
                          {selectedPrice === value && (
                            <Check className="search-menu__check" size={16} />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Reytinq */}
              <div className="search-menu">
                <button
                  type="button"
                  className={`search-chip${minimumRating > 0 ? " is-set" : ""}${openMenu === "rating" ? " is-open" : ""}`}
                  onClick={() => toggleMenu("rating")}
                  aria-expanded={openMenu === "rating"}
                >
                  <Star size={15} strokeWidth={1.8} />
                  <span>
                    {minimumRating > 0 ? `${minimumRating.toFixed(1)}+` : t("Reytinq")}
                  </span>
                  <ChevronDown className="search-chip__caret" size={14} strokeWidth={2} />
                </button>

                {openMenu === "rating" && (
                  <div className="search-menu__panel" role="listbox">
                    <strong className="search-menu__title">{t("Reytinq")}</strong>

                    {ratingOptions.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        className={`search-menu__option${minimumRating === item.value ? " is-selected" : ""}`}
                        onClick={() => updateRating(item.value)}
                      >
                        {item.value > 0 && (
                          <Star className="search-menu__star" size={14} fill="currentColor" strokeWidth={0} />
                        )}
                        <span>{item.label}</span>
                        {minimumRating === item.value && (
                          <Check className="search-menu__check" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ərazi */}
              <button
                type="button"
                className={`search-chip${selectedAreas.length > 0 ? " is-set" : ""}`}
                onClick={() => {
                  setOpenMenu(null);
                  setIsAreaSelectorOpen(true);
                }}
              >
                <MapPin size={15} strokeWidth={1.8} />
                <span>{areaLabel}</span>
              </button>

              {hasFilters && (
                <button
                  type="button"
                  className="search-toolbar__reset"
                  onClick={clearFilters}
                >
                  {t("Təmizlə")}
                </button>
              )}
            </div>

            {/* Menyu açıqdır: kənara basanda bağlanır (telefonda arxa fon tündləşir) */}
            {openMenu && (
              <button
                type="button"
                className="search-menu__backdrop"
                aria-label={t("Bağla")}
                onClick={() => setOpenMenu(null)}
              />
            )}
          </section>

          <p className="search-results-count">
            <strong>{filteredProviders.length}</strong> {t("nəticə")}
          </p>

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
                          {t("Təsdiqlənib")}
                        </span>
                      )}
                    </div>

                    {/* BODY */}

                    <div className="search-provider-card__body">
                      <div className="search-provider-card__name">
                        <strong>{provider.name}</strong>
                      </div>

                      <div className="search-provider-card__service">
                        {t(provider.service)}
                      </div>

                      <div className="search-provider-card__location">
                        <MapPin size={13} />

                        <span>{provider.area}</span>

                        {provider.distance != null && (
                          <>
                            <span>·</span>

                            <span>{provider.distance}{" "}{t("km")}</span>
                          </>
                        )}
                      </div>

                      <div className="search-provider-card__rating">
                        <span>
                          <Star size={13} fill="currentColor" />

                          {provider.rating}
                        </span>

                        <span>{t("{count} rəy", { count: provider.reviewCount })}</span>
                      </div>

                      <div className="search-provider-card__footer">
                        <span>{t("Başlayan qiymət")}</span>

                        <strong>{t("{price} ₼-dən", { price: provider.priceFrom })}</strong>
                      </div>
                    </div>
                  </button>

                  {/* SAVE */}

                  <button
                    type="button"
                    className="search-provider-card__save"
                    aria-label={
                      savedIds.has(provider.id)
                        ? t("{name} seçilmişlərdən çıxar", { name: provider.name })
                        : t("{name} seçilmişlərə əlavə et", { name: provider.name })
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

              <h2>{t("Uyğun nəticə tapılmadı")}</h2>

              <p>{t("Bu xidmət üzrə hazırda uyğun biznes tapılmadı.")}</p>

              <button
                type="button"
                className="search-empty__button"
                onClick={clearFilters}
              >
                {t("Filtrləri təmizlə")}
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