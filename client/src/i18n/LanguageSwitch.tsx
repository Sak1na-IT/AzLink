import { getLang, setLang, t, type Lang } from "./index";
import "./LanguageSwitch.css";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "az", label: "AZ" },
  { value: "en", label: "EN" },
];

interface LanguageSwitchProps {
  /* Giriş səhifələrində sağ yuxarı küncdə sabit dayanır */
  floating?: boolean;
}

function LanguageSwitch({ floating = false }: LanguageSwitchProps) {
  const lang = getLang();

  return (
    <div
      className={floating ? "language-switch is-floating" : "language-switch"}
      role="group"
      aria-label={t("Dil")}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={lang === option.value ? "is-active" : ""}
          aria-pressed={lang === option.value}
          onClick={() => setLang(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitch;
