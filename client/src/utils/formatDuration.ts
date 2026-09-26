/*
 * 45  → "45 dəq"
 * 60  → "1 saat"
 * 90  → "1 saat 30 dəq"
 * 600 → "10 saat"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dəq`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) {
    return `${hours} saat`;
  }

  return `${hours} saat ${rest} dəq`;
}
