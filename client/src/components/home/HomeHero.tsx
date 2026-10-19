import { useRef } from "react";
import { MapPin, Search, ChevronRight } from "lucide-react";

import PearlNecklace from "../brand/PearlNecklace";
import VelvetStage from "../brand/VelvetStage";

interface HomeHeroProps {
  areaLabel: string;
  onAreaClick: () => void;
  onSearch: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
}

const quickSearches = [
  "Dırnaq",
  "Təmizlik",
  "Fotoqraf",
  "Saç",
  "Elektrik",
];

function HomeHero({
  areaLabel,
  onAreaClick,
  onSearch,
  onCategorySelect,
}: HomeHeroProps) {
  const zoneRef = useRef<HTMLDivElement>(null);

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
      {/* Boyunbağı: hər mirvari bir sahədir, klikləyəndə axtarış açılır */}
      <div ref={zoneRef} className="home-hero__zone" />

      <div className="home-hero__necklace">
        <PearlNecklace
          onSelect={onCategorySelect}
          zoneRef={zoneRef}
          top={-0.25}
          sag={0.9}
        />
      </div>

      <h1 className="home-hero__title">
        Ehtiyacınız olan xidməti
        <br />
        rahatlıqla tapın
      </h1>

      <p className="home-hero__description">
        Xidmət və ya mütəxəssis axtarın, ərazinizi seçin
        və uyğun profillərə baxın.
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
    </VelvetStage>
  );
}

export default HomeHero;