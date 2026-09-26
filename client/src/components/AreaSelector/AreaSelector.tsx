import { useEffect, useMemo, useState } from "react";
import {
  Check,
  MapPin,
  Search,
  X,
} from "lucide-react";

import {
  areas,
  type Area,
} from "../../types/area";

import "./AreaSelector.css";

interface AreaSelectorProps {
  selectedAreas: Area[];
  onApply: (areas: Area[]) => void;
  onClose: () => void;
}

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("az")
    .trim();

function AreaSelector({
  selectedAreas,
  onApply,
  onClose,
}: AreaSelectorProps) {
  const [selected, setSelected] =
    useState<Area[]>(selectedAreas);

  const [query, setQuery] =
    useState("");

  /*
   * Escape düyməsi ilə modalı bağla
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  /*
   * Modal açıq olanda body scroll-u bağla.
   *
   * Beləliklə modal açıldıqda arxadakı
   * Home səhifəsi aşağı-yuxarı hərəkət etməyəcək.
   */
  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, []);

  /*
   * Bütün Bakı seçilibmi?
   */
  const isAllBakuSelected =
    selected.some(
      (area) => area.id === "all-baku"
    );

  /*
   * Axtarış nəticələri.
   *
   * Həm ərazi adı,
   * həm də ərazi tipi üzrə axtarış edə bilirik.
   */
  const filteredAreas = useMemo(() => {
    const normalizedQuery =
      normalizeText(query);

    if (!normalizedQuery) {
      return areas;
    }

    return areas.filter((area) =>
      normalizeText(
        `${area.name} ${area.type}`
      ).includes(normalizedQuery)
    );
  }, [query]);

  /*
   * İstifadəçinin yazdığı ərazi
   * siyahıda artıq varmı?
   */
  const exactAreaExists = useMemo(() => {
    const normalizedQuery =
      normalizeText(query);

    if (!normalizedQuery) {
      return true;
    }

    return areas.some(
      (area) =>
        normalizeText(area.name) ===
        normalizedQuery
    );
  }, [query]);

  /*
   * Ərazi seç
   */
  const toggleArea = (area: Area) => {
    /*
     * Bütün Bakı seçilirsə,
     * digər seçimləri təmizləyirik.
     */
    if (area.id === "all-baku") {
      if (isAllBakuSelected) {
        setSelected([]);
      } else {
        setSelected([area]);
      }

      return;
    }

    /*
     * Konkret ərazi seçilirsə,
     * Bütün Bakı seçimindən çıxırıq.
     */
    let nextSelected =
      selected.filter(
        (item) =>
          item.id !== "all-baku"
      );

    const alreadySelected =
      nextSelected.some(
        (item) =>
          item.id === area.id
      );

    if (alreadySelected) {
      nextSelected =
        nextSelected.filter(
          (item) =>
            item.id !== area.id
        );
    } else {
      nextSelected.push(area);
    }

    setSelected(nextSelected);
  };

  /*
   * İstifadəçinin özü yazdığı ərazini əlavə et
   */
  const addCustomArea = () => {
    const value = query.trim();

    if (!value || exactAreaExists) {
      return;
    }

    const customArea: Area = {
      id: `custom-${Date.now()}`,
      name: value,
      type: "custom",
    };

    setSelected((current) => {
      const withoutAllBaku =
        current.filter(
          (area) =>
            area.id !== "all-baku"
        );

      return [
        ...withoutAllBaku,
        customArea,
      ];
    });

    setQuery("");
  };

  /*
   * Ərazi seçilibmi?
   */
  const isSelected = (
    areaId: string
  ) =>
    selected.some(
      (area) =>
        area.id === areaId
    );

  /*
   * Seçilmiş ərazini sil
   */
  const removeSelected = (
    areaId: string
  ) => {
    setSelected((current) =>
      current.filter(
        (area) =>
          area.id !== areaId
      )
    );
  };

  /*
   * Bütün seçimləri təmizlə
   */
  const clearAll = () => {
    setSelected([]);
    setQuery("");
  };

  /*
   * Tətbiq et
   */
  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  /*
   * Əraziləri qruplaşdır
   */
  const districtAreas =
    filteredAreas.filter(
      (area) =>
        area.type === "district" &&
        area.id !== "all-baku"
    );

  const neighborhoodAreas =
    filteredAreas.filter(
      (area) =>
        area.type === "neighborhood"
    );

  const metroAreas =
    filteredAreas.filter(
      (area) =>
        area.type === "metro"
    );

  const customAreas =
    filteredAreas.filter(
      (area) =>
        area.type === "custom"
    );

  /*
   * Modal
   */
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
            <span className="area-selector__eyebrow">
              Ərazi seçimi
            </span>

            <h2 id="area-selector-title">
              Harada xidmət axtarırsınız?
            </h2>

            <p>
              Bakı daxilində istədiyiniz ərazini
              seçin və ya axtarışdan istifadə edin.
            </p>
          </div>

          <button
            type="button"
            className="area-selector__close"
            onClick={onClose}
            aria-label="Bağla"
          >
            <X
              size={20}
              strokeWidth={1.8}
            />
          </button>
        </header>

        {/* SEARCH */}

        <div className="area-selector__search">
          <Search
            size={19}
            strokeWidth={1.8}
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
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
              <span>
                Seçilmiş ərazilər
              </span>

              <button
                type="button"
                onClick={clearAll}
              >
                Hamısını təmizlə
              </button>
            </div>

            <div className="area-selector__selected-list">
              {selected.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className="area-selector__tag"
                  onClick={() =>
                    removeSelected(
                      area.id
                    )
                  }
                >
                  <span>
                    {area.name}
                  </span>

                  <X
                    size={13}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* CONTENT */}

        <div className="area-selector__content">
          {/* CUSTOM AREA */}

          {query.trim() &&
            !exactAreaExists && (
              <button
                type="button"
                className="area-selector__custom"
                onClick={addCustomArea}
              >
                <span className="area-selector__custom-icon">
                  <MapPin
                    size={18}
                    strokeWidth={1.8}
                  />
                </span>

                <span className="area-selector__custom-content">
                  <strong>
                    “{query.trim()}”
                  </strong>

                  <small>
                    Bu ərazini seçimə əlavə et
                  </small>
                </span>

                <span className="area-selector__custom-action">
                  Əlavə et
                </span>
              </button>
            )}

          {/* ALL BAKU */}

          {!query.trim() && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Ümumi
              </div>

              {areas
                .filter(
                  (area) =>
                    area.id ===
                    "all-baku"
                )
                .map((area) => (
                  <button
                    type="button"
                    key={area.id}
                    className={`area-selector__option ${
                      isSelected(
                        area.id
                      )
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleArea(area)
                    }
                  >
                    <span className="area-selector__option-icon">
                      <MapPin
                        size={18}
                        strokeWidth={1.8}
                      />
                    </span>

                    <span className="area-selector__option-content">
                      <strong>
                        Bütün Bakı
                      </strong>

                      <small>
                        Bakı üzrə bütün xidmətlər
                      </small>
                    </span>

                    <span className="area-selector__check">
                      {isSelected(
                        area.id
                      ) && (
                        <Check
                          size={17}
                          strokeWidth={2}
                        />
                      )}
                    </span>
                  </button>
                ))}
            </section>
          )}

          {/* DISTRICTS */}

          {districtAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Rayonlar
              </div>

              <div className="area-selector__options">
                {districtAreas.map(
                  (area) => (
                    <button
                      type="button"
                      key={area.id}
                      className={`area-selector__option ${
                        isSelected(
                          area.id
                        )
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleArea(
                          area
                        )
                      }
                    >
                      <span className="area-selector__option-icon">
                        <MapPin
                          size={18}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="area-selector__option-content">
                        <strong>
                          {area.name}
                        </strong>

                        <small>
                          Rayon
                        </small>
                      </span>

                      <span className="area-selector__check">
                        {isSelected(
                          area.id
                        ) && (
                          <Check
                            size={17}
                            strokeWidth={2}
                          />
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* NEIGHBORHOODS */}

          {neighborhoodAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Ərazilər və məhəllələr
              </div>

              <div className="area-selector__options">
                {neighborhoodAreas.map(
                  (area) => (
                    <button
                      type="button"
                      key={area.id}
                      className={`area-selector__option ${
                        isSelected(
                          area.id
                        )
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleArea(
                          area
                        )
                      }
                    >
                      <span className="area-selector__option-icon">
                        <MapPin
                          size={18}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="area-selector__option-content">
                        <strong>
                          {area.name}
                        </strong>

                        <small>
                          Ərazi / məhəllə
                        </small>
                      </span>

                      <span className="area-selector__check">
                        {isSelected(
                          area.id
                        ) && (
                          <Check
                            size={17}
                            strokeWidth={2}
                          />
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* METRO */}

          {metroAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Metro
              </div>

              <div className="area-selector__options">
                {metroAreas.map(
                  (area) => (
                    <button
                      type="button"
                      key={area.id}
                      className={`area-selector__option ${
                        isSelected(
                          area.id
                        )
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleArea(
                          area
                        )
                      }
                    >
                      <span className="area-selector__option-icon">
                        <MapPin
                          size={18}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="area-selector__option-content">
                        <strong>
                          {area.name}
                        </strong>

                        <small>
                          Metro və ətrafı
                        </small>
                      </span>

                      <span className="area-selector__check">
                        {isSelected(
                          area.id
                        ) && (
                          <Check
                            size={17}
                            strokeWidth={2}
                          />
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* CUSTOM AREAS */}

          {customAreas.length > 0 && (
            <section className="area-selector__group">
              <div className="area-selector__group-title">
                Əlavə etdiyiniz ərazilər
              </div>

              <div className="area-selector__options">
                {customAreas.map(
                  (area) => (
                    <button
                      type="button"
                      key={area.id}
                      className={`area-selector__option ${
                        isSelected(
                          area.id
                        )
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleArea(
                          area
                        )
                      }
                    >
                      <span className="area-selector__option-icon">
                        <MapPin
                          size={18}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="area-selector__option-content">
                        <strong>
                          {area.name}
                        </strong>

                        <small>
                          Sizin əlavə etdiyiniz ərazi
                        </small>
                      </span>

                      <span className="area-selector__check">
                        {isSelected(
                          area.id
                        ) && (
                          <Check
                            size={17}
                            strokeWidth={2}
                          />
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* NO RESULTS */}

          {filteredAreas.length === 0 &&
            !(
              query.trim() &&
              !exactAreaExists
            ) && (
              <div className="area-selector__empty">
                <div className="area-selector__empty-icon">
                  <Search
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <strong>
                  Ərazi tapılmadı
                </strong>

                <span>
                  Başqa ad yazın və ya
                  öz ərazinizi əlavə edin.
                </span>
              </div>
            )}
        </div>

        {/* FOOTER */}

        <footer className="area-selector__footer">
          <div className="area-selector__count">
            {selected.length > 0 ? (
              <>
                <strong>
                  {selected.length}
                </strong>

                <span>
                  ərazi seçilib
                </span>
              </>
            ) : (
              <span>
                Ərazi seçilməyib
              </span>
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