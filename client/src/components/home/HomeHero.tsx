import { useEffect, useRef } from "react";
import { MapPin, Search, ChevronRight } from "lucide-react";

interface HomeHeroProps {
  areaLabel: string;
  onAreaClick: () => void;
  onSearch: (value: string) => void;
}

/*
 * Axtarış sahəsində nümunələr yazılırmış kimi növbə ilə dəyişir
 * (bazada olan, fərqli sahələrdən xidmətlər). İstifadəçi yazmağa
 * başlayanda və ya sahəyə fokuslananda dayanır.
 */
const placeholderExamples = [
  "Manikür",
  "Ev təmizliyi",
  "Saç kəsimi",
  "Kran təmiri",
  "Fərdi dərs",
  "Portret çəkilişi",
  "Kompleks yuma",
];

const DEFAULT_PLACEHOLDER = "Xidmət və ya mütəxəssis yazın";

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
}: HomeHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;

    if (
      !input ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let example = 0;
    let letters = 0;
    let deleting = false;
    let timer = 0;

    const step = () => {
      /* Fokus və ya yazı varsa standart mətnə qayıdırıq */
      if (document.activeElement === input || input.value) {
        input.placeholder = DEFAULT_PLACEHOLDER;
        timer = window.setTimeout(step, 600);
        return;
      }

      const word = placeholderExamples[example % placeholderExamples.length];

      letters += deleting ? -1 : 1;
      input.placeholder = `Məsələn: ${word.slice(0, letters)}`;

      let delay = deleting ? 35 : 75;

      if (!deleting && letters === word.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && letters === 0) {
        deleting = false;
        example += 1;
        delay = 300;
      }

      timer = window.setTimeout(step, delay);
    };

    timer = window.setTimeout(step, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("search") ?? "").trim();

    if (value) {
      onSearch(value);
    }
  };

  return (
    <section className="home-hero">
      <div className="home-hero__eyebrow">
        Bakı · AzLink
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
            ref={inputRef}
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
    </section>
  );
}

export default HomeHero;