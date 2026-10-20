/*
 * Sadə tərcümə sistemi.
 *
 * Kodda mətnlər Azərbaycanca yazılır və t() ilə əhatə olunur:
 *   t("Rezerv et")              → "Rezerv et" və ya "Book now"
 *   t("{count} rəy", { count }) → "3 rəy" və ya "3 reviews"
 *
 * İngilis tərcümələri en.ts faylındadır (açar: Azərbaycanca mətn).
 * Tərcüməsi olmayan mətn Azərbaycanca göstərilir, sayt sınmır.
 *
 * Dil dəyişəndə səhifə yenidən yüklənir: bütün mətnlər, o cümlədən
 * fayl səviyyəsindəki sabit siyahılar (menyular, statuslar) yeni
 * dildə qurulur. Ona görə t() hər yerdə, hook olmadan çağırıla bilir.
 */
import { en } from "./en";

export type Lang = "az" | "en";

const STORAGE_KEY = "azlink-lang";

const readInitialLang = (): Lang => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "az";
  } catch {
    return "az";
  }
};

let current: Lang = readInitialLang();
document.documentElement.lang = current;

export const getLang = () => current;

export const setLang = (lang: Lang) => {
  if (lang === current) return;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* yadda saxlamaq olmasa, dil dəyişmir */
    return;
  }

  window.location.reload();
};

type Vars = Record<string, string | number>;

const interpolate = (text: string, vars?: Vars) =>
  vars
    ? text.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match
      )
    : text;

/*
 * Azərbaycanca mətni seçilmiş dilə çevirir. Ingiliscədə { count: 1 }
 * olanda "#one" formasına baxılır: "1 review", amma "3 reviews".
 */
export const t = (text: string, vars?: Vars) => {
  if (current !== "en") return interpolate(text, vars);

  const single = vars?.count === 1 ? en[`${text}#one`] : undefined;

  return interpolate(single ?? en[text] ?? text, vars);
};

/* Tarix və rəqəm formatı üçün brauzer lokalı */
export const locale = () => (current === "en" ? "en-GB" : "az-AZ");
