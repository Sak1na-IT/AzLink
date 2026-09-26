/*
 * Biznesin xidmətlərinin demo saxlanması (localStorage).
 *
 * Backend gələndə yalnız bu fayl dəyişəcək:
 * funksiyalar API çağırışları ilə əvəz olunacaq,
 * səhifələr isə olduğu kimi qalacaq.
 *
 * Heç nə saxlanmayıbsa, xidmətlər data/providers.ts-dən götürülür.
 * Biznes ilk dəfə dəyişiklik edəndən sonra saxlanmış siyahı əsas olur.
 * Müştəri tərəfi (Booking səhifəsi) də xidmətləri buradan oxuyur.
 */

import { providers } from "../data/providers";
import type { ProviderService } from "../types/provider";

const STORAGE_KEY = "azlink-demo-services";

/* { providerId: [xidmətlər] } */
type ServicesMap = Record<string, ProviderService[]>;

/* id serverdə/yaddaşda yaradılır, forma yalnız qalan sahələri verir */
export type ServiceInput = Omit<ProviderService, "id">;

const readMap = (): ServicesMap => {
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

    return parsed as ServicesMap;
  } catch {
    return {};
  }
};

const saveServices = (
  providerId: string,
  services: ProviderService[]
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readMap(), [providerId]: services })
    );
  } catch {
    /* localStorage bağlı ola bilər, səhifə işləməyə davam edir */
  }
};

const getSeedServices = (providerId: string): ProviderService[] =>
  providers.find((provider) => provider.id === providerId)?.services ??
  [];

/*
 * Bir biznesin xidmətləri.
 * Biznes bütün xidmətləri silibsə, boş siyahı qaytarılır.
 */
export const getServicesByProvider = (
  providerId: string
): ProviderService[] => {
  const stored = readMap()[providerId];

  return Array.isArray(stored) ? stored : getSeedServices(providerId);
};

export const addService = (
  providerId: string,
  input: ServiceInput
): ProviderService => {
  const service: ProviderService = {
    id: `${providerId}-${Date.now()}`,
    ...input,
  };

  saveServices(providerId, [
    ...getServicesByProvider(providerId),
    service,
  ]);

  return service;
};

export const updateService = (
  providerId: string,
  serviceId: string,
  input: ServiceInput
) => {
  saveServices(
    providerId,
    getServicesByProvider(providerId).map((service) =>
      service.id === serviceId ? { ...service, ...input } : service
    )
  );
};

/*
 * Keçmiş rezervlər dəyişmir: rezervdə xidmətin adı, müddəti
 * və qiyməti rezerv anında kopyalanıb.
 */
export const deleteService = (providerId: string, serviceId: string) => {
  saveServices(
    providerId,
    getServicesByProvider(providerId).filter(
      (service) => service.id !== serviceId
    )
  );
};
