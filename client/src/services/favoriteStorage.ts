/*
 * Seçilmiş (saved) ustaların demo saxlanması (localStorage).
 *
 * Saved.tsx bu açarı artıq oxuyurdu, amma heç bir yerdə ona
 * yazan kod yox idi — ürək düymələri yalnız öz komponentinin
 * lokal state-ini dəyişirdi. Bu fayl hər yerdən (Provider,
 * SearchResults, BookingStart nəticələri və s.) çağırılaraq
 * eyni siyahını oxuyur/yazır ki, Seçilmişlər səhifəsi düzgün
 * dolsun.
 */

const STORAGE_KEY = "azlink-saved-providers";

export const getSavedProviderIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
};

const saveIds = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage bağlı ola bilər, səhifə işləməyə davam edir */
  }
};

export const isProviderSaved = (providerId: string): boolean =>
  getSavedProviderIds().includes(providerId);

export const addSavedProvider = (providerId: string) => {
  const ids = getSavedProviderIds();

  if (!ids.includes(providerId)) {
    saveIds([...ids, providerId]);
  }
};

export const removeSavedProvider = (providerId: string) => {
  saveIds(
    getSavedProviderIds().filter((id) => id !== providerId)
  );
};

/* Ürək düyməsi üçün: cari vəziyyəti çevirir, yeni vəziyyəti qaytarır */
export const toggleSavedProvider = (providerId: string): boolean => {
  const alreadySaved = isProviderSaved(providerId);

  if (alreadySaved) {
    removeSavedProvider(providerId);
    return false;
  }

  addSavedProvider(providerId);
  return true;
};
