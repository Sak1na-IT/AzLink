/*
 * Azərbaycan dilində tarix formatı.
 * Brauzerin "az-AZ" lokalı bəzi sistemlərdə ay adlarını bilmir
 * ("M10 10" kimi göstərir), ona görə adları özümüz saxlayırıq.
 */

const MONTHS = [
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

const WEEKDAYS = [
  "Bazar",
  "Bazar ertəsi",
  "Çərşənbə axşamı",
  "Çərşənbə",
  "Cümə axşamı",
  "Cümə",
  "Şənbə",
];

/* "2026-10-10" → yerli tarix (saat qurşağı sürüşməsi olmadan) */
const parse = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getDayParts = (date: string) => {
  const value = parse(date);

  return {
    day: value.getDate(),
    month: MONTHS[value.getMonth()],
    monthShort: MONTHS[value.getMonth()].slice(0, 3),
    weekday: WEEKDAYS[value.getDay()],
  };
};

/* "10 oktyabr" */
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

  if (diff === 0) return "Bu gün";
  if (diff === 1) return "Sabah";
  if (diff > 1) return `${diff} gün sonra`;
  if (diff === -1) return "Dünən";
  return `${Math.abs(diff)} gün əvvəl`;
};

const WEEKDAYS_SHORT = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];

/* Date obyekti üçün: təqvim xanaları (Booking səhifəsi) */
export const weekdayShort = (date: Date) => WEEKDAYS_SHORT[date.getDay()];
export const monthShort = (date: Date) => MONTHS[date.getMonth()].slice(0, 3);

/* "cümə axşamı, 24 sentyabr" */
export const formatReadable = (date: Date) =>
  `${WEEKDAYS[date.getDay()].toLocaleLowerCase("az")}, ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
