import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  GraduationCap,
  Home,
  PawPrint,
  Sparkles,
  UserRound,
  Camera,
  Dumbbell,
} from "lucide-react";

import "./BookingStart.css";
import { categories as catalog } from "../../data/categories";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import { t } from "../../i18n";

type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  subcategories: string[];
};

const categories: Category[] = [
  {
    id: "beauty",
    title: t("Gözəllik"),
    icon: <Sparkles size={25} strokeWidth={1.8} />,
    subcategories: [
      "Dırnaq",
      "Saç",
      "Makiyaj",
      "Qaş və kirpik",
      "Dəriyə qulluq",
      "Masaj",
    ],
  },
  {
    id: "home",
    title: t("Ev və məişət"),
    icon: <Home size={25} strokeWidth={1.8} />,
    subcategories: [
      "Təmizlik",
      "Santexnik",
      "Elektrik",
      "Təmir",
      "Daşıma",
      "Kondisioner",
    ],
  },
  {
    id: "auto",
    title: "Avtomobil",
    icon: <Car size={25} strokeWidth={1.8} />,
    subcategories: [
      "Avtoyuma",
      "Avtoservis",
      "Detaylinq",
      "Təkər xidməti",
      "Açar xidməti",
    ],
  },
  {
    id: "education",
    title: t("Təhsil"),
    icon: <GraduationCap size={25} strokeWidth={1.8} />,
    subcategories: [
      "Repetitor",
      "Dil dərsləri",
      "Proqramlaşdırma",
      "İmtahan hazırlığı",
      "Musiqi",
    ],
  },
  {
    id: "events",
    title: t("Foto və tədbir"),
    icon: <Camera size={25} strokeWidth={1.8} />,
    subcategories: [
      "Fotoqraf",
      "Videoqraf",
      "Dekor",
      "Tort",
      "Gül",
      "DJ",
    ],
  },
  {
    id: "pets",
    title: "Heyvanlar",
    icon: <PawPrint size={25} strokeWidth={1.8} />,
    subcategories: [
      "Grooming",
      "Baytar",
      "Pet sitter",
      "İt gəzdirilməsi",
    ],
  },
  {
    id: "personal",
    title: t("Fərdi xidmətlər"),
    icon: <UserRound size={25} strokeWidth={1.8} />,
    subcategories: [
      "Fərdi məşqçi",
      "Pilates",
      "Yoga",
      "Üzgüçülük",
      "Boks",
    ],
  },
  {
    id: "fitness",
    title: t("İdman"),
    icon: <Dumbbell size={25} strokeWidth={1.8} />,
    subcategories: [
      "Trainer",
      "Fitness",
      "Yoga",
      "Pilates",
      "Boks",
    ],
  },
];

function BookingStart() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  /* Kartların fonu üçün: hər sahədə şəkli olan ilk biznesin üz qabığı */
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then((result) => {
        if (!cancelled) {
          setProviders(result);
        }
      })
      .catch(() => {
        /* şəkil yüklənməsə kart zümrüd fonla qalır */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Sahə üzrə bizneslər: dairəvi şəkil üçün üz qabığı və say */
  const getCategoryInfo = (categoryId: string) => {
    const entry = catalog.find((item) => item.id === categoryId);

    if (!entry) {
      return { cover: undefined, count: 0 };
    }

    const wanted = [entry.name, ...entry.services].map((name) =>
      name.toLocaleLowerCase("az")
    );

    const inCategory = providers.filter((provider) =>
      [provider.service, ...(provider.categories ?? [])].some((name) =>
        wanted.includes((name ?? "").toLocaleLowerCase("az"))
      )
    );

    return {
      cover: inCategory.find((provider) => provider.image)?.image,
      count: inCategory.length,
    };
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    navigate("/bookings");
  };

  const handleSubcategorySelect = (
    subcategory: string
  ) => {
    const params = new URLSearchParams();

    params.set("category", selectedCategory?.id ?? "");
    params.set("service", subcategory);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <main className="booking-start">
      <div className="booking-start__container">
        <button
          type="button"
          className="booking-start__back"
          onClick={handleBack}
        >
          <ArrowLeft size={16} strokeWidth={1.9} />
          {t("Geri")}
        </button>

        <section className="booking-start__hero">
          <span className="booking-start__eyebrow">
            {t("Yeni rezerv")}
          </span>

          <h1>
            {selectedCategory
              ? t("{title} xidmətini seçin", { title: t(selectedCategory.title) })
              : t("Hansı xidmətə ehtiyacınız var?")}
          </h1>
        </section>

        {!selectedCategory ? (
          <section className="booking-start__categories">
            {categories.map((category) => {
              const { cover, count } = getCategoryInfo(category.id);

              return (
                <button
                  type="button"
                  key={category.id}
                  className="booking-start__category"
                  onClick={() => handleCategorySelect(category)}
                >
                  {/* Dairəvi şəkil, küncündə sahənin nişanı */}
                  <span className="booking-start__category-media">
                    {cover ? (
                      <img src={cover} alt="" loading="lazy" />
                    ) : (
                      category.icon
                    )}

                    {cover ? (
                      <span className="booking-start__category-icon">
                        {category.icon}
                      </span>
                    ) : null}
                  </span>

                  <span className="booking-start__category-content">
                    <strong>{t(category.title)}</strong>
                    <small>
                      {count === 0
                        ? t("Hələ usta yoxdur")
                        : count === 1
                          ? t("1 usta")
                          : t("{count} usta", { count })}
                    </small>
                  </span>

                  <ArrowRight
                    className="booking-start__category-arrow"
                    size={18}
                    strokeWidth={1.8}
                  />
                </button>
              );
            })}
          </section>
        ) : (
          <section className="booking-start__subcategories">
            {selectedCategory.subcategories.map(
              (subcategory) => (
                <button
                  type="button"
                  key={subcategory}
                  className="booking-start__subcategory"
                  onClick={() =>
                    handleSubcategorySelect(
                      subcategory
                    )
                  }
                >
                  <span>{t(subcategory)}</span>

                  <ArrowRight
                    size={18}
                    strokeWidth={1.8}
                  />
                </button>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default BookingStart;