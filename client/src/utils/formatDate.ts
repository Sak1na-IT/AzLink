/*
 * Tarix formatı: seçilmiş dilə görə (Azərbaycanca və ya ingiliscə).
 * Brauzerin "az-AZ" lokalı bəzi sistemlərdə ay adlarını bilmir
 * ("M10 10" kimi göstərir), ona görə adları özümüz saxlayırıq.
 */
import { getLang, t } from "../i18n";

const MONTHS_AZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_AZ = [
  "Bazar",
  "Bazar ertəsi",
  "Çərşənbə axşamı",
  "Çərşənbə",
  "Cümə axşamı",
  "Cümə",
  "Şənbə",
];

const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEKDAYS_SHORT_AZ = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];
const WEEKDAYS_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const months = () => (getLang() === "en" ? MONTHS_EN : MONTHS_AZ);
const weekdays = () => (getLang() === "en" ? WEEKDAYS_EN : WEEKDAYS_AZ);

/* "2026-10-10" → yerli tarix (saat qurşağı sürüşməsi olmadan) */
const parse = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getDayParts = (date: string) => {
  const value = parse(date);

  return {
    day: value.getDate(),
    month: months()[value.getMonth()],
    monthShort: months()[value.getMonth()].slice(0, 3),
    weekday: weekdays()[value.getDay()],
  };
};

/* "10 oktyabr" / "10 October" */
export const formatDayMonth = (date: string) => {
  const { day, month } = getDayParts(date);
  return `${day} ${month}`;
};

/* "Bu gün", "Sabah", "3 gün sonra" */
export const formatRelativeDay = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.round(
    (parse(date).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diff === 0) return t("Bu gün");
  if (diff === 1) return t("Sabah");
  if (diff > 1) return t("{count} gün sonra", { count: diff });
  if (diff === -1) return t("Dünən");
  return t("{count} gün əvvəl", { count: Math.abs(diff) });
};

/* Date obyekti üçün: təqvim xanaları (Booking səhifəsi) */
export const weekdayShort = (date: Date) =>
  (getLang() === "en" ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT_AZ)[date.getDay()];
export const monthShort = (date: Date) =>
  months()[date.getMonth()].slice(0, 3);

/* "cümə axşamı, 24 sentyabr" / "Thursday, 24 September" */
export const formatReadable = (date: Date) =>
  getLang() === "en"
    ? `${WEEKDAYS_EN[date.getDay()]}, ${date.getDate()} ${MONTHS_EN[date.getMonth()]}`
    : `${WEEKDAYS_AZ[date.getDay()].toLocaleLowerCase("az")}, ${date.getDate()} ${
        MONTHS_AZ[date.getMonth()]
      }`;

/* "2026-10-05" və ya ISO vaxt → "5 oktyabr 2026" */
export const formatFullDate = (date: string) => {
  const key = date.slice(0, 10);
  const { day, month } = getDayParts(key);
  return `${day} ${month} ${key.slice(0, 4)}`;
};
