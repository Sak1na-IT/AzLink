import { apiRequest } from "./api";
import type { ProviderService } from "../types/provider";

/* id serverdə yaradılır, forma yalnız qalan sahələri verir */
export type ServiceInput = Omit<ProviderService, "id">;

export const listServices = () =>
  apiRequest<ProviderService[]>("/business/services");

export const createService = (input: ServiceInput) =>
  apiRequest<ProviderService>("/business/services", {
    method: "POST",
    body: input,
  });

export const updateService = (id: string, input: ServiceInput) =>
  apiRequest<ProviderService>(`/business/services/${id}`, {
    method: "PATCH",
    body: input,
  });

export const deleteService = (id: string) =>
  apiRequest<unknown>(`/business/services/${id}`, {
    method: "DELETE",
  });