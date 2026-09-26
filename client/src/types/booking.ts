export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  service: string;
  date: string;   // "2026-09-27" formatında
  time: string;   // "14:00" formatında
  status: BookingStatus;
}