import type { Booking } from "../types/booking";

export const bookings: Booking[] = [
  {
    id: "b1",
    providerId: "1",
    providerName: "Nail by Aysel",
    service: "Manikür",
    date: "2026-09-27",
    time: "14:00",
    status: "CONFIRMED",
  },
  {
    id: "b2",
    providerId: "5",
    providerName: "Vüsalə Hair",
    service: "Saç kəsimi",
    date: "2026-09-30",
    time: "11:30",
    status: "PENDING",
  },
];