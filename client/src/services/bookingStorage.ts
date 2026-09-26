/*
 * Rezervlərin demo saxlanması (localStorage).
 *
 * Backend gələndə yalnız bu fayl dəyişəcək:
 * funksiyalar API çağırışları ilə əvəz olunacaq,
 * səhifələr isə olduğu kimi qalacaq.
 *
 * Müştəri və biznes tərəfi EYNİ rezerv siyahısını oxuyur.
 * Biznes updateBookingStatus çağıranda müştəri də yeni statusu görür.
 */

import { CURRENT_CUSTOMER } from "./demoCustomer";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type StoredBooking = {
  id: number;
  providerId: string;
  providerName: string;
  /* rezervi edən müştəri (müştəri yalnız öz rezervlərini görür) */
  customerId: string;
  /* müştərinin adı (biznes tərəfində göstərilir) */
  customerName: string;
  service: string;
  serviceId?: string;
  /* xidmətin müddəti (dəqiqə) */
  duration?: number;
  /* 2026-09-25 formatında */
  date: string;
  /* 10:00 formatında */
  time: string;
  /* xidmətin qiyməti */
  priceFrom: number;
  status: BookingStatus;
  createdAt: string;
};

const STORAGE_KEY = "azlink-demo-bookings";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

/*
 * İlk dəfə açılanda göstərilən demo rezervlər.
 * Nail by Aysel (providerId "1") üçün bir neçə rezerv var ki,
 * biznes paneli boş görünməsin.
 */
const demoBookings: StoredBooking[] = [
  {
    id: 1,
    providerId: "1",
    providerName: "Nail by Aysel",
    customerId: CURRENT_CUSTOMER.id,
    customerName: CURRENT_CUSTOMER.name,
    service: "Manikür",
    serviceId: "1-1",
    duration: 45,
    date: "2026-09-25",
    time: "10:00",
    priceFrom: 20,
    status: "CONFIRMED",
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    id: 2,
    providerId: "2",
    providerName: "Studio Nigar",
    customerId: CURRENT_CUSTOMER.id,
    customerName: CURRENT_CUSTOMER.name,
    service: "Gündəlik makiyaj",
    serviceId: "2-1",
    duration: 60,
    date: "2026-09-27",
    time: "14:00",
    priceFrom: 40,
    status: "PENDING",
    createdAt: "2026-09-21T10:00:00.000Z",
  },
  {
    id: 3,
    providerId: "1",
    providerName: "Nail by Aysel",
    customerId: "demo-other-1",
    customerName: "Nigar Əliyeva",
    service: "Manikür",
    serviceId: "1-1",
    duration: 45,
    date: "2026-09-25",
    time: "13:00",
    priceFrom: 20,
    status: "PENDING",
    createdAt: "2026-09-22T09:30:00.000Z",
  },
  {
    id: 4,
    providerId: "1",
    providerName: "Nail by Aysel",
    customerId: "demo-other-2",
    customerName: "Günel Rzayeva",
    service: "Manikür",
    serviceId: "1-1",
    duration: 45,
    date: "2026-09-27",
    time: "15:00",
    priceFrom: 20,
    status: "PENDING",
    createdAt: "2026-09-23T12:00:00.000Z",
  },
];

/*
 * Köhnə yazılışlar da (məsələn "confirmed") düzgün oxunsun.
 */
const normalizeStatus = (value: unknown): BookingStatus => {
  const upper =
    typeof value === "string" ? value.toUpperCase() : "";

  return STATUSES.find((status) => status === upper) ?? "PENDING";
};

const normalizeBooking = (
  item: Partial<StoredBooking>
): StoredBooking => ({
  id: Number(item.id ?? Date.now()),
  providerId: String(item.providerId ?? ""),
  providerName: item.providerName ?? "",
  /* Köhnə yazılışlar demo müştəriyə aid sayılır */
  customerId: item.customerId ?? CURRENT_CUSTOMER.id,
  customerName: item.customerName ?? CURRENT_CUSTOMER.name,
  service: item.service ?? "",
  serviceId: item.serviceId,
  duration: item.duration,
  date: item.date ?? "",
  time: item.time ?? "",
  priceFrom: Number(item.priceFrom ?? 0),
  status: normalizeStatus(item.status),
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const saveBookings = (bookings: StoredBooking[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    /* localStorage bağlı ola bilər, səhifə işləməyə davam edir */
  }
};

/*
 * Bütün rezervlər.
 * Heç nə saxlanmayıbsa, demo rezervlər yazılır.
 */
export const getBookings = (): StoredBooking[] => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }

  if (raw === null) {
    saveBookings(demoBookings);
    return [...demoBookings];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeBooking(item as Partial<StoredBooking>))
      .filter(
        (booking) =>
          booking.providerId && booking.date && booking.time
      );
  } catch {
    return [];
  }
};

/*
 * Yalnız bir biznesin (ustanın) rezervləri.
 * Backend-də bu, serverdə sahiblik yoxlaması ilə olacaq.
 */
export const getBookingsByProvider = (
  providerId: string
): StoredBooking[] =>
  getBookings().filter(
    (booking) => booking.providerId === providerId
  );

/*
 * Yalnız bir müştərinin öz rezervləri.
 * Backend-də bu, giriş edən istifadəçiyə görə serverdə süzüləcək.
 */
export const getBookingsByCustomer = (
  customerId: string
): StoredBooking[] =>
  getBookings().filter(
    (booking) => booking.customerId === customerId
  );

export const addBooking = (booking: StoredBooking) => {
  saveBookings([...getBookings(), booking]);
};

export const updateBookingStatus = (
  id: number,
  status: BookingStatus
) => {
  saveBookings(
    getBookings().map((booking) =>
      booking.id === id ? { ...booking, status } : booking
    )
  );
};

export const deleteBooking = (id: number) => {
  saveBookings(getBookings().filter((booking) => booking.id !== id));
};
