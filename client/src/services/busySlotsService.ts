import { apiRequest } from "./api";

/* Cavabda ad və xidmət yoxdur, yalnız tarix və saat aralığı */
export interface BusySlot {
  /* "2026-10-10" */
  date: string;
  /* "14:00" */
  start: string;
  /* "14:45" */
  end: string;
}

export const getBusySlots = (providerId: string, from: string, to: string) =>
  apiRequest<BusySlot[]>(
    `/providers/${providerId}/busy?from=${from}&to=${to}`
  );
  