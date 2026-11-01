/*
 * Biznes hesabında hansı bildirişlərin göstəriləcəyi (Profil → Bildirişlər).
 * Seçim bu brauzerdə saxlanılır; söndürülən növ zəngdə görünmür.
 */
export type NotificationKind = "booking" | "cancel" | "review";

export type NotificationPrefs = Record<NotificationKind, boolean>;

const STORAGE_KEY = "azlink.notificationPrefs";

export const PREFS_CHANGED_EVENT = "azlink:notification-prefs";

const DEFAULT_PREFS: NotificationPrefs = {
  booking: true,
  cancel: true,
  review: true,
};

export const getNotificationPrefs = (): NotificationPrefs => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
};

export const setNotificationPref = (kind: NotificationKind, value: boolean) => {
  const next = { ...getNotificationPrefs(), [kind]: value };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* yadda saxlanmasa da seçim bu səhifədə işləyir */
  }

  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
  return next;
};

/* Serverdəki biznes bildirişlərinin mətni ilə növü tapırıq */
export const getNotificationKind = (message: string): NotificationKind | null => {
  if (message.startsWith("Yeni rezerv:")) return "booking";
  if (message.includes("rezervi ləğv etdi")) return "cancel";
  if (message.includes("ulduzlu rəy yazdı")) return "review";
  return null;
};

export const isNotificationVisible = (message: string, prefs: NotificationPrefs) => {
  const kind = getNotificationKind(message);
  return kind ? prefs[kind] : true;
};
