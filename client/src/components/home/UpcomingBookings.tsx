import { CalendarDays, ChevronRight, Clock } from "lucide-react";

import type { Booking } from "../../services/bookingsService";
import { formatDuration } from "../../utils/formatDuration";
import { formatRelativeDay, getDayParts } from "../../utils/formatDate";
import { t } from "../../i18n";

interface UpcomingBookingsProps {
  bookings: Booking[];
  onBookingClick: (bookingId: string) => void;
  onSeeAllClick: () => void;
}

const statusLabel: Record<Booking["status"], string> = {
  PENDING: t("Təsdiq gözlənilir"),
  CONFIRMED: t("Təsdiqlənib"),
  CANCELLED: t("Ləğv edilib"),
  COMPLETED: t("Tamamlanıb"),
};

/*
 * Növbəti rezervlər "bilet" kimi göstərilir: solda tarix,
 * qırıq xətt, sağda xidmət, usta, saat və status.
 */
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
        <h2>{t("Növbəti rezervləriniz")}</h2>

        {upcoming.length > 0 && (
          <button
            type="button"
            className="home-section__link"
            onClick={onSeeAllClick}
          >
            {t("Hamısına bax")}
            <ChevronRight size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div className="upcoming-bookings upcoming-bookings--empty">
          <CalendarDays size={20} strokeWidth={1.6} />
          <div>
            <strong>{t("Yaxın vaxtlarda rezerviniz yoxdur")}</strong>
            <p>{t("Bir profil seçib rezerv yaradın, burada görünəcək.")}</p>
          </div>
        </div>
      ) : (
        <div className="upcoming-bookings">
          {upcoming.map((booking) => {
            const { day, monthShort, weekday } = getDayParts(booking.date);

            return (
              <button
                key={booking.id}
                type="button"
                className="upcoming-bookings__item"
                onClick={() => onBookingClick(booking.id)}
              >
                {/* Tarix bloku */}
                <div className="upcoming-bookings__date">
                  <strong>{day}</strong>
                  <span>{monthShort}</span>
                </div>

                <div className="upcoming-bookings__body">
                  <span className="upcoming-bookings__when">
                    {formatRelativeDay(booking.date)} · {weekday}
                    <span className="upcoming-bookings__when-time">
                      {" · "}
                      {booking.time}
                    </span>
                  </span>
                  <strong>{booking.service}</strong>
                  <p>
                    {booking.providerName}
                    {booking.area ? ` · ${booking.area}` : ""}
                  </p>
                </div>

                <div className="upcoming-bookings__meta">
                  <span className="upcoming-bookings__time">
                    <Clock size={14} strokeWidth={1.8} />
                    {booking.time}
                    {booking.duration ? (
                      <small>{formatDuration(booking.duration)}</small>
                    ) : null}
                  </span>
                  <span
                    className={`upcoming-bookings__status upcoming-bookings__status--${booking.status.toLowerCase()}`}
                  >
                    {statusLabel[booking.status]}
                  </span>
                </div>

                <ChevronRight
                  className="upcoming-bookings__chevron"
                  size={18}
                  strokeWidth={1.8}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UpcomingBookings;
