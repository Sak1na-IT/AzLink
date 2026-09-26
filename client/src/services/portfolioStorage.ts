/*
 * Biznesin portfolio şəkillərinin demo saxlanması (localStorage).
 *
 * Backend gələndə yalnız bu fayl dəyişəcək: base64 saxlamaq
 * yerinə serverə fayl yükləmə (S3, Cloudinary və s.) API
 * çağırışı olacaq, funksiyaların imzası (getPortfolio,
 * addPortfolioImage, deletePortfolioImage) eyni qalacaq.
 *
 * DİQQƏT: localStorage-ın ölçü limiti var (adətən 5-10MB).
 * Bir neçə böyük şəkil limiti dolduracaq — bu, yalnız demo
 * üçündür, real istifadə üçün deyil.
 */

import type { PortfolioImage } from "../types/portfolio";

const STORAGE_KEY = "azlink-demo-portfolio";

/* { providerId: [şəkillər] } */
type PortfolioMap = Record<string, PortfolioImage[]>;

const readMap = (): PortfolioMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as PortfolioMap;
  } catch {
    return {};
  }
};

const saveImages = (providerId: string, images: PortfolioImage[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readMap(), [providerId]: images })
    );

    return true;
  } catch {
    /* localStorage dolu ola bilər (şəkillər böyükdürsə) */
    return false;
  }
};

export const getPortfolio = (providerId: string): PortfolioImage[] => {
  const stored = readMap()[providerId];

  return Array.isArray(stored) ? stored : [];
};

/*
 * Şəkil əlavə edir. localStorage dolu olub yazı uğursuz olarsa,
 * false qaytarır (UI xəbərdarlıq göstərə bilər).
 */
export const addPortfolioImage = (
  providerId: string,
  dataUrl: string,
  caption: string
): boolean => {
  const image: PortfolioImage = {
    id: `${providerId}-${Date.now()}`,
    dataUrl,
    caption,
  };

  return saveImages(providerId, [
    ...getPortfolio(providerId),
    image,
  ]);
};

export const deletePortfolioImage = (
  providerId: string,
  imageId: string
) => {
  saveImages(
    providerId,
    getPortfolio(providerId).filter((image) => image.id !== imageId)
  );
};