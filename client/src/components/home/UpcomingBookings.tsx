import { CalendarDays, ChevronRight, Clock } from "lucide-react";

import type { Booking } from "../../types/booking";

interface UpcomingBookingsProps {
  bookings: Booking[];
  onBookingClick: (bookingId: string) => void;
  onSeeAllClick: () => void;
}

const statusLabel: Record<Booking["status"], string> = {
  PENDING: "Təsdiq gözlənilir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);

  return date.toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
  });
}

function UpcomingBookings({
  bookings,
  onBookingClick,
  onSeeAllClick,
}: UpcomingBookingsProps) {
  const upcoming = bookings
    .filter((b) => b.status !== "CANCELLED" && b.status !== "COMPLETED")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 2);

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Növbəti rezervləriniz</h2>

        {upcoming.length > 0 && (
          <button
            type="button"
            className="home-section__link"
            onClick={onSeeAllClick}
          >
            Hamısına bax
            <ChevronRight size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div className="upcoming-bookings upcoming-bookings--empty">
          <CalendarDays size={20} strokeWidth={1.6} />
          <div>
            <strong>Yaxın vaxtlarda rezerviniz yoxdur</strong>
            <p>Bir profil seçib rezerv yaradın, burada görünəcək.</p>
          </div>
        </div>
      ) : (
        <div className="upcoming-bookings">
          {upcoming.map((booking) => (
            <button
              key={booking.id}
              type="button"
              className="upcoming-bookings__item"
              onClick={() => onBookingClick(booking.id)}
            >
              <div className="upcoming-bookings__icon">
                <CalendarDays size={18} strokeWidth={1.8} />
              </div>

              <div className="upcoming-bookings__body">
                <strong>{booking.providerName}</strong>
                <p>{booking.service}</p>
              </div>

              <div className="upcoming-bookings__meta">
                <span className="upcoming-bookings__time">
                  <Clock size={13} strokeWidth={1.8} />
                  {formatDate(booking.date)} · {booking.time}
                </span>
                <span
                  className={`upcoming-bookings__status upcoming-bookings__status--${booking.status.toLowerCase()}`}
                >
                  {statusLabel[booking.status]}
                </span>
              </div>

              <ChevronRight size={16} strokeWidth={1.8} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default UpcomingBookings;