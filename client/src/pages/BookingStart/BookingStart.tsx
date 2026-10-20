import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { t } from "../../i18n";

type Category = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  subcategories: string[];
};

const categories: Category[] = [
  {
    id: "beauty",
    title: t("Gözəllik"),
    description: t("Saç, dırnaq, makiyaj və digər xidmətlər"),
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
    description: t("Təmizlik, təmir və ev xidmətləri"),
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
    description: t("Avtoyuma, servis və avtomobil xidmətləri"),
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
    description: t("Repetitor, dil və digər təhsil xidmətləri"),
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
    description: t("Fotoqraf, video və tədbir xidmətləri"),
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
    description: t("Ev heyvanları üçün xidmətlər"),
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
    description: t("Şəxsi inkişaf və gündəlik xidmətlər"),
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
    description: t("Məşq və idman xidmətləri"),
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
          {t("← Geri")}
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

          <p>
            {selectedCategory
              ? t("Davam etmək üçün sizə lazım olan xidməti seçin.")
              : t("Kateqoriya seçin və sizə uyğun biznesləri tapın.")}
          </p>
        </section>

        {!selectedCategory ? (
          <section className="booking-start__categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className="booking-start__category"
                onClick={() =>
                  handleCategorySelect(category)
                }
              >
                <div className="booking-start__category-icon">
                  {category.icon}
                </div>

                <div className="booking-start__category-content">
                  <h2>{t(category.title)}</h2>
                  <p>{category.description}</p>
                </div>

                <ArrowRight
                  className="booking-start__category-arrow"
                  size={19}
                  strokeWidth={1.8}
                />
              </button>
            ))}
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