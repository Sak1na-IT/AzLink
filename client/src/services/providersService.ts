import { apiRequest } from "./api";
import type { Provider, ProviderService } from "../types/provider";

/*
 * Bütün biznesləri qaytarır (xidməti olanlar).
 * Axtarış, ərazi, qiymət və reytinq filtrləri səhifədə (client-də) tətbiq olunur.
 */
export const getProviders = () => apiRequest<Provider[]>("/providers");

export interface ProviderReview {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
}

export interface ProviderPortfolioImage {
  id: string;
  imageUrl: string;
  /* Şəklin altındakı yazı (məs. "Fransız manikürü") */
  caption?: string | null;
}

export interface ProviderDetail extends Provider {
  description: string | null;
  /* Biznesin telefonu: WhatsApp və zəng üçün */
  phone: string;
  services: ProviderService[];
  reviews: ProviderReview[];
  portfolio: ProviderPortfolioImage[];
}

export const getProviderById = (id: string) =>
  apiRequest<ProviderDetail>(`/providers/${id}`);

/* "Son baxdıqlarınız" (giriş tələb olunur) */
export const getRecentlyViewed = () =>
  apiRequest<Provider[]>("/providers/recent");

/* Biznes səhifəsi açılanda baxışı yadda saxlayır */
export const recordProviderView = (id: string) =>
  apiRequest<{ recorded: boolean }>(`/providers/${id}/view`, {
    method: "POST",
  });