import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, UserRound, X } from "lucide-react";

import "./BusinessBookings.css";
import { getStoredUser } from "../../services/api";
import {
  getBookings,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from "../../services/bookingsService";

type StatusFilter = "all" | BookingStatus;
type PeriodFilter = "week" | "month" | "all";

interface BusinessBookingsProps {
  /* Rezervlər səhifəsinin tabı içində göstəriləndə başlıq gizlədilir */
  embedded?: boolean;
}

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

function BusinessBookings({ embedded = false }: BusinessBookingsProps) {
  const currentUserId = getStoredUser()?.id;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const reload = useCallback(async () => {
    try {
      setError("");
      const result = await getBookings();

      /* yalnız sizin biznesinizə gələnlər (özünüzün müştəri kimi etdikləriniz yox) */
      setBookings(
        result.filter((booking) => booking.customerId !== currentUserId)
      );
    } catch {
      setError("Rezervləri yükləmək mümkün olmadı.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    reload();
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

  const changeStatus = async (id: string, status: BookingStatus) => {
    try {
      setBusyId(id);
      await updateBookingStatus(id, status);
      await reload();
    } catch {
      alert("Statusu dəyişmək mümkün olmadı.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = (id: string) => {
    if (!window.confirm("Bu rezervi ləğv etmək istəyirsiniz?")) {
      return;
    }

    changeStatus(id, "CANCELLED");
  };

  const summary = (
    <div className="business-bookings__summary">
      <CalendarDays size={19} strokeWidth={1.8} />

      <span>
        {activeCount} rezerv
        {pendingCount > 0 ? ` · ${pendingCount} gözləyir` : ""}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <main className="business-bookings">
        <p className="business-bookings__message">Yüklənir...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="business-bookings">
        <p className="business-bookings__message">{error}</p>
      </main>
    );
  }

  return (
    <main
      className={
        embedded
          ? "business-bookings business-bookings--embedded"
          : "business-bookings"
      }
    >
      {embedded ? (
        <section className="business-bookings__header business-bookings__header--compact">
          {summary}
        </section>
      ) : (
        <section className="business-bookings__header">
          <div>
            <span className="business-bookings__eyebrow">Rezervlər</span>

            <h1>Rezervləri idarə edin</h1>

            <p>
              Statusa görə seçin: gözləyən rezervi təsdiqləyin, təsdiqlənmiş
              işi tamamlayın.
            </p>
          </div>

          {summary}
        </section>
      )}

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
                      disabled={busyId === booking.id}
                      onClick={() => changeStatus(booking.id, "CONFIRMED")}
                    >
                      <Check size={15} strokeWidth={2} />
                      Təsdiqlə
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <button
                      type="button"
                      className="business-booking-card__action business-booking-card__action--complete"
                      disabled={busyId === booking.id}
                      onClick={() => changeStatus(booking.id, "COMPLETED")}
                    >
                      <Check size={15} strokeWidth={2} />
                      Tamamla
                    </button>
                  )}

                  <button
                    type="button"
                    className="business-booking-card__action business-booking-card__action--cancel"
                    disabled={busyId === booking.id}
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