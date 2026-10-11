import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";

import { areas, type Area } from "../../types/area";

import "./AreaSelector.css";

interface AreaSelectorProps {
  selectedAreas: Area[];
  onApply: (areas: Area[]) => void;
  onClose: () => void;
}

const ALL_BAKU_ID = "all-baku";

const normalizeText = (value: string) => value.toLocaleLowerCase("az").trim();

function AreaSelector({
  selectedAreas,
  onApply,
  onClose,
}: AreaSelectorProps) {
  const [selected, setSelected] = useState<Area[]>(selectedAreas);
  const [query, setQuery] = useState("");

  /*
   * Escape düyməsi ilə modalı bağla
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  /*
   * Modal açıq olanda arxadakı səhifənin scroll-unu bağla.
   */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const isAllBakuSelected = selected.some((area) => area.id === ALL_BAKU_ID);

  const isSelected = (areaId: string) =>
    selected.some((area) => area.id === areaId);

  /*
   * Axtarış: yalnız ərazinin adına görə.
   */
  const filteredAreas = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return areas.filter(
      (area) =>
        area.id !== ALL_BAKU_ID &&
        (!normalizedQuery ||
          normalizeText(area.name).includes(normalizedQuery))
    );
  }, [query]);

  const allBaku = areas.find((area) => area.id === ALL_BAKU_ID);
  const districtAreas = filteredAreas.filter((area) => area.type === "district");
  const metroAreas = filteredAreas.filter((area) => area.type === "metro");

  /*
   * Ərazi seç / seçimi götür
   */
  const toggleArea = (area: Area) => {
    /* Bütün Bakı seçilirsə, digər seçimləri təmizləyirik */
    if (area.id === ALL_BAKU_ID) {
      setSelected(isAllBakuSelected ? [] : [area]);
      return;
    }

    /* Konkret ərazi seçilirsə, Bütün Bakı seçimindən çıxırıq */
    const withoutAllBaku = selected.filter((item) => item.id !== ALL_BAKU_ID);

    const alreadySelected = withoutAllBaku.some((item) => item.id === area.id);

    setSelected(
      alreadySelected
        ? withoutAllBaku.filter((item) => item.id !== area.id)
        : [...withoutAllBaku, area]
    );
  };

  const removeSelected = (areaId: string) => {
    setSelected((current) => current.filter((area) => area.id !== areaId));
  };

  const clearAll = () => {
    setSelected([]);
    setQuery("");
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  /*
   * Bir seçim sətri (rayon, metro və ya Bütün Bakı)
   */
  const renderOption = (area: Area, hint: string) => (
    <button
      type="button"
      key={area.id}
      className={`area-selector__option ${
        isSelected(area.id) ? "is-selected" : ""
      }`}
      onClick={() => toggleArea(area)}
    >
      <span className="area-selector__option-icon">
        <MapPin size={18} strokeWidth={1.8} />
      </span>

      <span className="area-selector__option-content">
        <strong>{area.name}</strong>

        <small>{hint}</small>
      </span>

      <span className="area-selector__check">
        {isSelected(area.id) && <Check size={17} strokeWidth={2} />}
      </span>
    </button>
  );

  const metroHint = (area: Area) =>
    area.districts && area.districts.length > 0
      ? `Metro · ${area.districts.join(", ")}`
      : "Metro";

  return (
    <div
      className="area-selector"
      role="dialog"
      aria-modal="true"
      aria-labelledby="area-selector-title"
    >
      {/* BACKDROP */}

      <button
        type="button"
        className="area-selector__backdrop"
        onClick={onClose}
        aria-label="Ərazi seçimini bağla"
      />

      {/* MODAL */}

      <div className="area-selector__panel">
        {/* HEADER */}

        <header className="area-selector__header">
          <div>
            <span className="area-selector__eyebrow">Ərazi seçimi</span>

            <h2 id="area-selector-title">Harada xidmət axtarırsınız?</h2>

            <p>
              Bakı şəhəri daxilində rayon və ya metro stansiyası seçin.
            </p>
          </div>

          <button
            type="button"
            className="area-selector__close"
            onClick={onClose}
            aria-label="Bağla"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </header>

        {/* SEARCH */}

        <div className="area-selector__search">
          <Search size={19} strokeWidth={1.8} />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Məsələn: Nərimanov, Gənclik, 28 May..."
            autoFocus
          />

          {query && (
            <button
              type="button"
              className="area-selector__search-clear"
              onClick={() => setQuery("")}
              aria-label="Axtarışı təmizlə"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* SELECTED */}

        {selected.length > 0 && (
          <section className="area-selector__selected">
            <div className="area-selector__selected-header">
              <span>Seçilmiş ərazilər</span>

              <button type="button" onClick={clearAll}>
                Hamısını təmizlə
              </button>
            </div>

            <div className="area-selector__selected-list">
              {selected.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className="area-selector__tag"
                  onClick={() => removeSelected(area.id)}
                >
                  <span>{area.name}</span>

                  <X size={13} strokeWidth={2} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* CONTENT */}

        <div className="area-selector__content">
          {/* ALL BAKU */}

          {!query.trim() && allBaku && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">Ümumi</div>

              {renderOption(allBaku, "Bakı üzrə bütün xidmətlər")}
            </section>
          )}

          {/* DISTRICTS */}

          {districtAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">Rayonlar</div>

              <div className="area-selector__options">
                {districtAreas.map((area) => renderOption(area, "Rayon"))}
              </div>
            </section>
          )}

          {/* METRO */}

          {metroAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Metro stansiyaları
              </div>

              <div className="area-selector__options">
                {metroAreas.map((area) => renderOption(area, metroHint(area)))}
              </div>
            </section>
          )}

          {/* NO RESULTS */}

          {filteredAreas.length === 0 && (
            <div className="area-selector__empty">
              <div className="area-selector__empty-icon">
                <Search size={22} strokeWidth={1.8} />
              </div>

              <strong>Ərazi tapılmadı</strong>

              <span>Rayon və ya metro stansiyasının adını yazın.</span>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <footer className="area-selector__footer">
          <div className="area-selector__count">
            {selected.length > 0 ? (
              <>
                <strong>{selected.length}</strong>

                <span>ərazi seçilib</span>
              </>
            ) : (
              <span>Ərazi seçilməyib</span>
            )}
          </div>

          <div className="area-selector__footer-actions">
            <button
              type="button"
              className="area-selector__cancel"
              onClick={onClose}
            >
              Ləğv et
            </button>

            <button
              type="button"
              className="area-selector__apply"
              onClick={handleApply}
            >
              Tətbiq et
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AreaSelector;