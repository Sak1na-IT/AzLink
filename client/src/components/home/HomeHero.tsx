import { MapPin, Search, ChevronRight } from "lucide-react";

import ServiceConstellation from "../brand/ServiceConstellation";
import VelvetStage from "../brand/VelvetStage";

interface HomeHeroProps {
  areaLabel: string;
  onAreaClick: () => void;
  onSearch: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
}

/* Bazada həqiqətən olan, fərqli sahələrdən xidmətlər */
const quickSearches = [
  "Manikür",
  "Ev təmizliyi",
  "Saç kəsimi",
  "Fərdi dərs",
  "Kompleks yuma",
];

function HomeHero({
  areaLabel,
  onAreaClick,
  onSearch,
  onCategorySelect,
}: HomeHeroProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("search") ?? "").trim();

    if (value) {
      onSearch(value);
    }
  };

  return (
    <VelvetStage className="home-hero">
      <div className="home-hero__main">
        <h1 className="home-hero__title">Bu gün nə lazımdır?</h1>

        <p className="home-hero__description">
          Gözəllik, ev, avtomobil, təhsil və daha çox: axtarın,
          ərazinizi seçin, uyğun mütəxəssisə rezerv edin.
        </p>

        <form
          className="home-search"
          onSubmit={handleSubmit}
        >
          <div className="home-search__input">
            <Search size={19} strokeWidth={1.8} />

            <input
              name="search"
              type="text"
              placeholder="Xidmət və ya mütəxəssis yazın"
              autoComplete="off"
            />
          </div>

          <button
            type="button"
            className="home-search__area"
            onClick={onAreaClick}
          >
            <MapPin size={19} strokeWidth={1.8} />

            <span>
              <strong>{areaLabel}</strong>
              <small>Ərazi seçimi</small>
            </span>

            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </form>

        <div className="quick-searches">
          <span className="quick-searches__label">
            Məsələn:
          </span>

          {quickSearches.map((item) => (
            <button
              key={item}
              type="button"
              className="quick-searches__item"
              onClick={() => onSearch(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 8 sahə AzLink-ə bağlıdır; sahəyə klik həmin kateqoriyanı açır */}
      <div className="home-hero__visual">
        <ServiceConstellation onSelect={onCategorySelect} />
      </div>
    </VelvetStage>
  );
}

export default HomeHero;