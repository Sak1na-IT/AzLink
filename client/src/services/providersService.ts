import { apiRequest } from "./api";
import type { Provider } from "../types/provider";

/*
 * Bütün biznesləri qaytarır (xidməti olanlar).
 * Axtarış, ərazi, qiymət və reytinq filtrləri səhifədə (client-də) tətbiq olunur.
 */
export const getProviders = () => apiRequest<Provider[]>("/providers");