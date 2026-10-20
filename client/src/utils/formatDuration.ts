import { t } from "../i18n";
/*
 * 45  → "45 dəq"
 * 60  → "1 saat"
 * 90  → "1 saat 30 dəq"
 * 600 → "10 saat"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return t("{minutes} dəq", { minutes });
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) {
    return t("{hours} saat", { hours });
  }

  return t("{hours} saat {rest} dəq", { hours, rest });
}
