import type {
  BookingStatus,
  StoredBooking,
} from "../services/bookingStorage";

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  bookingCount: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalSpent: number;
  lastBookingDate: string;
  lastStatus: BookingStatus;
}

/*
 * Rezerv siyahısından unikal müştəri siyahısı çıxarır.
 * Ayrıca saxlanma yoxdur — bookingStorage artıq mənbədir,
 * bu yalnız qruplaşdırma məntiqidir.
 *
 * totalSpent: yalnız CONFIRMED və COMPLETED rezervlər
 * hesaba qatılır (Dashboard-dakı gəlir məntiqi ilə eynidir).
 */
export const getBusinessCustomers = (
  bookings: StoredBooking[]
): CustomerSummary[] => {
  const byCustomer = new Map<string, StoredBooking[]>();

  bookings.forEach((booking) => {
    const existing = byCustomer.get(booking.customerId) ?? [];
    existing.push(booking);
    byCustomer.set(booking.customerId, existing);
  });

  const summaries: CustomerSummary[] = [];

  byCustomer.forEach((customerBookings, customerId) => {
    const sorted = [...customerBookings].sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
    );

    const latest = sorted[0];

    const totalSpent = customerBookings
      .filter(
        (booking) =>
          booking.status === "CONFIRMED" ||
          booking.status === "COMPLETED"
      )
      .reduce((sum, booking) => sum + booking.priceFrom, 0);

    summaries.push({
      customerId,
      customerName: latest.customerName,
      bookingCount: customerBookings.length,
      activeCount: customerBookings.filter(
        (b) => b.status === "PENDING" || b.status === "CONFIRMED"
      ).length,
      completedCount: customerBookings.filter(
        (b) => b.status === "COMPLETED"
      ).length,
      cancelledCount: customerBookings.filter(
        (b) => b.status === "CANCELLED"
      ).length,
      totalSpent,
      lastBookingDate: latest.date,
      lastStatus: latest.status,
    });
  });

  /* Ən son rezervi olan müştəri yuxarıda */
  summaries.sort((a, b) =>
    b.lastBookingDate.localeCompare(a.lastBookingDate)
  );

  return summaries;
};