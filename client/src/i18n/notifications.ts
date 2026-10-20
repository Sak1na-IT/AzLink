/*
 * Bildirişlər serverdə Azərbaycanca mətn kimi saxlanır. İngilis
 * dilində onları məlum şablonlara görə çeviririk; tanınmayan mətn
 * olduğu kimi göstərilir.
 */
import { getLang } from "./index";

const MONTHS: Record<string, string> = {
  yan: "Jan", fev: "Feb", mar: "Mar", apr: "Apr", may: "May", iyn: "Jun",
  iyl: "Jul", avq: "Aug", sen: "Sep", okt: "Oct", noy: "Nov", dek: "Dec",
};

/* "21 okt, 14:00" → "21 Oct, 14:00" */
const translateDate = (text: string) =>
  text.replace(/(\d{1,2}) ([a-z]{3}),/g, (match, day: string, month: string) =>
    MONTHS[month] ? `${day} ${MONTHS[month]},` : match
  );

const PATTERNS: [RegExp, string][] = [
  [/^Yeni rezerv: (.+), (.+) · (.+)\. Təsdiqləməyi unutmayın\.$/, "New booking: $1, $2 · $3. Don't forget to confirm it."],
  [/^(.+) rezervi ləğv etdi: (.+) · (.+)\.$/, "$1 cancelled the booking: $2 · $3."],
  [/^(.+) rezervinizi təsdiqlədi: (.+) · (.+)\.$/, "$1 confirmed your booking: $2 · $3."],
  [/^(.+) rezervinizi ləğv etdi: (.+) · (.+)\.$/, "$1 cancelled your booking: $2 · $3."],
  [/^(.+) ilə rezerviniz tamamlandı\. Rəy yazmağı unutmayın!$/, "Your booking with $1 is complete. Don't forget to leave a review!"],
  [/^(.+) sizə (\d) ulduzlu rəy yazdı\.$/, "$1 left you a $2-star review."],
];

export const translateNotification = (message: string) => {
  if (getLang() !== "en") return message;

  for (const [pattern, replacement] of PATTERNS) {
    if (pattern.test(message)) {
      return translateDate(message.replace(pattern, replacement));
    }
  }

  return message;
};
