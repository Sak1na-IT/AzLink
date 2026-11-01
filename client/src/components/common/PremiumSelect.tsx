import { useEffect, useRef, useState } from "react";
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
}

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
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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
      if (!wrapRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen]);

  const choose = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div className={`premium-select${isOpen ? " is-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="premium-select__button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? "" : "premium-select__placeholder"}>
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

      {isOpen && (
        <>
          <button
            type="button"
            className="premium-select__backdrop"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          />

          <div className="premium-select__panel" role="listbox">
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
        </>
      )}
    </div>
  );
}

export default PremiumSelect;
