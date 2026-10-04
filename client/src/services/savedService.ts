import { apiRequest } from "./api";
import type { Provider } from "../types/provider";

export const getSavedProviders = () => apiRequest<Provider[]>("/saved");

export const saveProvider = (providerId: string) =>
  apiRequest<{ saved: boolean }>(`/saved/${providerId}`, {
    method: "POST",
  });

export const unsaveProvider = (providerId: string) =>
  apiRequest<{ saved: boolean }>(`/saved/${providerId}`, {
    method: "DELETE",
  });