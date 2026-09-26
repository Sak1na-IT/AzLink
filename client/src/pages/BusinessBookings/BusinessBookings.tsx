import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  UserRound,
  X,
} from "lucide-react";

import "./BusinessBookings.css";
import {
  getBookingsByProvider,
  updateBookingStatus,
  type BookingStatus,
  type StoredBooking,
} from "../../services/bookingStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";

type StatusFilter = "all" | BookingStatus;
type PeriodFilter = "week" | "month" | "all";

const statusText: Record<BookingStatus, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "PENDING", label: "Gözləyir" },
  { value: "CONFIRMED", label: "Təsdiqlənmiş" },
  { value: "COMPLETED", label: "Tamamlanmış" },
  { value: "CANCELLED", label: "Ləğv edilib" },
];

const periodTabs: { value: PeriodFilter; label: string }[] = [
  { value: "week", label: "Bu həftə" },
  { value: "month", label: "Bu ay" },
  { value: "all", label: "Ümumi" },
];

/* 2026-09-25 → 25.09.2026 */
const formatDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}.${year}`;
};

/* Bazar ertəsi 00:00 - Bazar 23:59 aralığı */
const getWeekRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(today);
  start.setDate(today.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthRange = () => {
  const today = new Date();

  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const isDateInRange = (dateKey: string, start: Date, end: Date) => {
  const date = new Date(`${dateKey}T12:00:00`);
  return date >= start && date <= end;
};

function BusinessBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<StoredBooking[]>(() =>
    getBookingsByProvider(CURRENT_PROVIDER_ID)
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const reload = useCallback(() => {
    setBookings(getBookingsByProvider(CURRENT_PROVIDER_ID));
  }, []);

  /* Başqa tabda dəyişiklik olarsa (məs. müştəri yeni rezerv edib) yenilə */
  useEffect(() => {
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, [reload]);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const activeCount = bookings.filter(
    (booking) => booking.status !== "CANCELLED"
  ).length;

  const filteredBookings = useMemo(() => {
    let result =
      statusFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === statusFilter);

    /* Dövr filtri yalnız "Tamamlanmış" sekmesində işləyir */
    if (statusFilter === "COMPLETED" && periodFilter !== "all") {
      const { start, end } =
        periodFilter === "week" ? getWeekRange() : getMonthRange();

      result = result.filter((booking) =>
        isDateInRange(booking.date, start, end)
      );
    }

    return [...result].sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
    );
  }, [bookings, statusFilter, periodFilter]);

  const handleConfirm = (id: number) => {
    updateBookingStatus(id, "CONFIRMED");
    reload();
  };

  const handleComplete = (id: number) => {
    updateBookingStatus(id, "COMPLETED");
    reload();
  };

  const handleCancel = (id: number) => {
    if (!window.confirm("Bu rezervi ləğv etmək istəyirsiniz?")) {
      return;
    }

    updateBookingStatus(id, "CANCELLED");
    reload();
  };

  return (
    <main className="business-bookings">
      <div className="business-bookings__top">
        <button
          type="button"
          className="business-bookings__back"
          onClick={() => navigate("/business")}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Biznes panelinə qayıt
        </button>
      </div>

      <section className="business-bookings__header">
        <div>
          <span className="business-bookings__eyebrow">Rezervlər</span>

          <h1>Rezervləri idarə edin</h1>

          <p>
            Statusa görə seçin: gözləyən rezervi təsdiqləyin, təsdiqlənmiş
            işi tamamlayın.
          </p>
        </div>

        <div className="business-bookings__summary">
          <CalendarDays size={19} strokeWidth={1.8} />

          <span>
            {activeCount} rezerv
            {pendingCount > 0 ? ` · ${pendingCount} gözləyir` : ""}
          </span>
        </div>
      </section>

      <section className="business-bookings__tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={
              statusFilter === tab.value
                ? "business-bookings__tab is-active"
                : "business-bookings__tab"
            }
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {statusFilter === "COMPLETED" && (
        <section className="business-bookings__subtabs">
          {periodTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={
                periodFilter === tab.value
                  ? "business-bookings__subtab is-active"
                  : "business-bookings__subtab"
              }
              onClick={() => setPeriodFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </section>
      )}

      {filteredBookings.length === 0 ? (
        <div className="business-bookings__empty">
          <div className="business-bookings__empty-icon">
            <Clock3 size={22} strokeWidth={1.8} />
          </div>

          <h3>Bu bölmədə rezerv yoxdur</h3>

          <p>Seçilmiş filtrə uyğun heç bir rezerv tapılmadı.</p>
        </div>
      ) : (
        <div className="business-bookings__list">
          {filteredBookings.map((booking) => (
            <article key={booking.id} className="business-booking-card">
              <div className="business-booking-card__main">
                <div className="business-booking-card__date">
                  <CalendarDays size={15} strokeWidth={1.8} />
                  <span>{formatDate(booking.date)}</span>

                  <Clock3 size={15} strokeWidth={1.8} />
                  <span>{booking.time}</span>
                </div>

                <div className="business-booking-card__content">
                  <h3>{booking.service}</h3>

                  <span>
                    <UserRound size={14} strokeWidth={1.8} />
                    {booking.customerName}
                  </span>
                </div>
              </div>

              <span
                className={`business-booking-card__status business-booking-card__status--${booking.status.toLowerCase()}`}
              >
                {statusText[booking.status]}
              </span>

              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <div className="business-booking-card__actions">
                  {booking.status === "PENDING" && (
                    <button
                      type="button"
                      className="business-booking-card__action business-booking-card__action--confirm"
                      onClick={() => handleConfirm(booking.id)}
                    >
                      <Check size={15} strokeWidth={2} />
                      Təsdiqlə
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <button
                      type="button"
                      className="business-booking-card__action business-booking-card__action--complete"
                      onClick={() => handleComplete(booking.id)}
                    >
                      <Check size={15} strokeWidth={2} />
                      Tamamla
                    </button>
                  )}

                  <button
                    type="button"
                    className="business-booking-card__action business-booking-card__action--cancel"
                    onClick={() => handleCancel(booking.id)}
                  >
                    <X size={15} strokeWidth={2} />
                    Ləğv et
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default BusinessBookings;
