import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import "./PremiumSelect.css";

export interface PremiumSelectOption {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  value: string;
  options: PremiumSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
  /* Xananın solundakı ikon (məs. qeydiyyatda) */
  icon?: ReactNode;
  className?: string;
}

const PHONE_QUERY = "(max-width: 640px)";

/*
 * Brauzerin adi açılan siyahısı (mavi seçimli boz qutu) saytın
 * dizaynına uyğun deyil. Bu seçici eyni işi görür: kompüterdə xananın
 * altında açılır, telefonda ekranın altından vərəq kimi çıxır.
 * Gizli <select> formanın "required" yoxlaması üçün saxlanılır.
 */
function PremiumSelect({
  value,
  options,
  placeholder,
  onChange,
  required = false,
  icon,
  className = "",
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !wrapRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    /* Kompüterdə panel xananın yerinə bağlıdır: səhifə sürüşəndə bağlanır */
    const onScroll = (event: Event) => {
      if (
        !window.matchMedia(PHONE_QUERY).matches &&
        !panelRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [isOpen]);

  /*
   * Panel <body>-yə çıxarılır ki, heç bir kartın içində kəsilməsin.
   * Kompüterdə xananın altında (yer yoxdursa üstündə), telefonda aşağıdan vərəq.
   */
  const openPanel = () => {
    const button = wrapRef.current?.getBoundingClientRect();

    if (button && !window.matchMedia(PHONE_QUERY).matches) {
      const spaceBelow = window.innerHeight - button.bottom;
      const width = Math.max(button.width, 280);
      const style: CSSProperties = {
        position: "fixed",
        left: Math.min(button.left, window.innerWidth - width - 12),
        width,
      };

      if (spaceBelow < 320 && button.top > spaceBelow) {
        style.bottom = window.innerHeight - button.top + 8;
      } else {
        style.top = button.bottom + 8;
      }

      setPanelStyle(style);
    } else {
      setPanelStyle({});
    }

    setIsOpen(true);
  };

  const choose = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div
      className={`premium-select${isOpen ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className="premium-select__button"
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className="premium-select__icon">{icon}</span>}
        <span
          className={`premium-select__value${selected ? "" : " premium-select__placeholder"}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="premium-select__caret" size={17} strokeWidth={1.9} />
      </button>

      <select
        className="premium-select__native"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isOpen &&
        createPortal(
          <div className="premium-select-layer">
            <button
              type="button"
              className="premium-select__backdrop"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setIsOpen(false)}
            />

            <div
              className="premium-select__panel"
              role="listbox"
              ref={panelRef}
              style={panelStyle}
            >
              <strong className="premium-select__title">{placeholder}</strong>

              <div className="premium-select__options">
                {options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`premium-select__option${isSelected ? " is-selected" : ""}`}
                      onClick={() => choose(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={16} strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default PremiumSelect;
