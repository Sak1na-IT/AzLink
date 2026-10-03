import { apiRequest } from "./api";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  service: string;
  serviceId: string;
  duration: number;
  /* "2026-10-06" */
  date: string;
  /* "14:00" */
  time: string;
  priceFrom: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingInput {
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
}

/*
 * Giriş edən hesabın BÜTÜN rezervləri: həm özünün müştəri kimi
 * etdikləri, həm (biznesi varsa) ona gələnlər — bir yerdə.
 * Hansının hansı olduğunu ayırmaq üçün çağıran tərəf customerId-ni
 * öz istifadəçi id-si ilə müqayisə etməlidir.
 */
export const getBookings = () => apiRequest<Booking[]>("/bookings");

export const createBooking = (input: CreateBookingInput) =>
  apiRequest<Booking>("/bookings", { method: "POST", body: input });

export const updateBookingStatus = (id: string, status: BookingStatus) =>
  apiRequest<Booking>(`/bookings/${id}`, {
    method: "PATCH",
    body: { status },
  });