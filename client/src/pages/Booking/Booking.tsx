import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Star,
} from "lucide-react";

import { providers } from "../../data/providers";
import {
  addBooking,
  getBookings,
  type StoredBooking,
} from "../../services/bookingStorage";
import { getBusinessProfile } from "../../services/businessProfileStorage";
import { CURRENT_CUSTOMER } from "../../services/demoCustomer";
import { getServicesByProvider } from "../../services/serviceStorage";
import {
  getWeekDayFromDate,
  type DaySchedule,
  type WeeklySchedule,
} from "../../types/schedule";
import type { ProviderService } from "../../types/provider";
import { formatDuration } from "../../utils/formatDuration";
import "./Booking.css";

/* Müddəti bilinməyən xidmət üçün standart müddət (dəqiqə) */
const DEFAULT_DURATION = 60;

/*
 * Təqvimdə bir rezervin tuta biləcəyi maksimum vaxt (dəqiqə).
 * Paket xidmətlər (məsələn 10 məşqlik paket) bütün günü
 * bağlamasın deyə məhdudlaşdırılır.
 */
const MAX_BLOCK_MINUTES = 180;

/* Saatlar arasındakı addım (dəqiqə) */
const SLOT_STEP_MINUTES = 30;

/* =========================================================
   KÖMƏKÇİ FUNKSİYALAR
========================================================= */

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
 * 2026-09-24 → "cümə axşamı, 24 sentyabr"
 */
const formatReadableDate = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);

  return date.toLocaleDateString("az-AZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const getWeekDay = (date: Date) =>
  date.toLocaleDateString("az-AZ", { weekday: "short" });

const getDayNumber = (date: Date) =>
  date.toLocaleDateString("az-AZ", { day: "numeric" });

const getMonthName = (date: Date) =>
  date.toLocaleDateString("az-AZ", { month: "short" });

/* "14:30" → 870 */
const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

/* 870 → "14:30" */
const toTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}`;
};

const getBlockMinutes = (duration?: number) =>
  Math.min(duration ?? DEFAULT_DURATION, MAX_BLOCK_MINUTES);

/*
 * Seçilən tarixin biznesin qrafikindəki günü.
 */
const getScheduleForDate = (
  weeklySchedule: WeeklySchedule,
  dateKey: string
): DaySchedule => {
  const date = new Date(`${dateKey}T00:00:00`);

  return weeklySchedule[getWeekDayFromDate(date)];
};

/*
 * Bir günün iş saatları daxilində 30 dəqiqəlik addımla
 * mümkün başlanğıc vaxtlar. Gün bağlıdırsa, boş massiv.
 */
const generateTimeSlots = (schedule: DaySchedule): string[] => {
  if (!schedule.isOpen) {
    return [];
  }

  const start = toMinutes(schedule.start);
  const end = toMinutes(schedule.end);
  const slots: string[] = [];

  for (let minutes = start; minutes < end; minutes += SLOT_STEP_MINUTES) {
    slots.push(toTimeString(minutes));
  }

  return slots;
};

/*
 * Bu günün saatı artıq keçibmi?
 */
const isTimePassed = (dateKey: string, time: string) => {
  if (dateKey !== formatDateKey(new Date())) {
    return false;
  }

  const now = new Date();

  return toMinutes(time) <= now.getHours() * 60 + now.getMinutes();
};

/*
 * Xidmət iş gününün bitməsindən sonraya qalırmı?
 */
const exceedsWorkday = (
  time: string,
  duration: number,
  schedule: DaySchedule
) => toMinutes(time) + getBlockMinutes(duration) > toMinutes(schedule.end);

/*
 * Seçilən vaxt aralığı başqa bir aktiv rezervlə kəsişirmi?
 *
 * Ləğv edilmiş rezervlər vaxtı tutmur.
 */
const isSlotTaken = (
  bookings: StoredBooking[],
  providerId: string,
  date: string,
  time: string,
  duration: number
) => {
  const start = toMinutes(time);
  const end = start + getBlockMinutes(duration);

  return bookings.some((booking) => {
    if (
      booking.providerId !== providerId ||
      booking.date !== date ||
      booking.status === "CANCELLED"
    ) {
      return false;
    }

    const bookingStart = toMinutes(booking.time);
    const bookingEnd =
      bookingStart + getBlockMinutes(booking.duration);

    return start < bookingEnd && bookingStart < end;
  });
};

/* =========================================================
   BOOKING SƏHİFƏSİ
========================================================= */

function Booking() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const provider = useMemo(
    () => providers.find((item) => item.id === providerId),
    [providerId]
  );

  /*
   * DİQQƏT: bütün hook-lar (useState, useMemo) aşağıdakı
   * "if (!provider) return" sətrindən ƏVVƏL olmalıdır.
   */
  const storedBookings = useMemo<StoredBooking[]>(
    () => getBookings(),
    [confirmed]
  );

  /*
   * Biznesin real iş qrafiki. Profil hələ doldurulmayıbsa,
   * standart qrafik (B.e–Ş 10:00–20:00, Bazar bağlı) gəlir.
   */
  const weeklySchedule = useMemo<WeeklySchedule>(
    () => getBusinessProfile(provider?.id ?? "").schedule,
    [provider?.id]
  );

  /*
   * Növbəti 14 gün üçün tarixlər.
   */
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, []);

  if (!provider) {
    return (
      <div className="booking-page">
        <div className="booking-not-found">
          <div className="booking-not-found__icon">
            <CalendarDays size={26} strokeWidth={1.8} />
          </div>

          <h1>Rezerv ediləcək profil tapılmadı</h1>

          <p>Seçdiyiniz xidmət göstərən profil mövcud deyil.</p>

          <button
            type="button"
            className="booking-confirm"
            onClick={() => navigate("/")}
          >
            Ana səhifəyə qayıt
          </button>
        </div>
      </div>
    );
  }

  const initials = provider.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  /*
   * Provider-in real xidmətləri.
   * Heç biri yoxdursa, əsas xidmət göstərilir.
   */
  const providerServices = getServicesByProvider(provider.id);

  const services: ProviderService[] =
    providerServices.length > 0
      ? providerServices
      : [
          {
            id: `${provider.id}-main`,
            name: provider.service,
            description: "Əsas xidmət",
            price: provider.priceFrom,
            duration: DEFAULT_DURATION,
          },
        ];

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );

  const currentDuration =
    selectedService?.duration ?? DEFAULT_DURATION;

  /*
   * Saat seçilə bilməz: vaxtı keçib, başqa rezervlə kəsişir
   * və ya xidmət iş günündən sonraya qalır.
   */
  const isTimeUnavailable = (
    date: string,
    time: string,
    duration: number,
    schedule: DaySchedule
  ) =>
    isTimePassed(date, time) ||
    exceedsWorkday(time, duration, schedule) ||
    isSlotTaken(storedBookings, provider.id, date, time, duration);

  /*
   * Günün vəziyyəti:
   *
   * full    → bağlıdır və ya heç bir saat seçilə bilmir
   * partial → günün ən azı bir rezervi var
   * empty   → rezerv yoxdur
   */
  const getDateStatus = (date: string, duration: number) => {
    const schedule = getScheduleForDate(weeklySchedule, date);
    const dayTimes = generateTimeSlots(schedule);

    if (dayTimes.length === 0) {
      return "full";
    }

    const allUnavailable = dayTimes.every((time) =>
      isTimeUnavailable(date, time, duration, schedule)
    );

    if (allUnavailable) {
      return "full";
    }

    const hasBookings = storedBookings.some(
      (booking) =>
        booking.providerId === provider.id &&
        booking.date === date &&
        booking.status !== "CANCELLED"
    );

    return hasBookings ? "partial" : "empty";
  };

  const canConfirm =
    Boolean(selectedService) &&
    Boolean(selectedDate) &&
    Boolean(selectedTime);

  const handleServiceSelect = (service: ProviderService) => {
    setSelectedServiceId(service.id);

    /*
     * Xidmət dəyişəndə müddət də dəyişir, ona görə əvvəlki
     * saat artıq uyğun olmaya bilər.
     */
    setSelectedTime("");

    if (
      selectedDate &&
      getDateStatus(selectedDate, service.duration) === "full"
    ) {
      setSelectedDate("");
    }
  };

  const handleDateSelect = (date: string) => {
    if (getDateStatus(date, currentDuration) === "full") {
      return;
    }

    setSelectedDate(date);

    /*
     * Gün dəyişəndə əvvəlki saat seçimini silirik.
     */
    setSelectedTime("");
  };

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }

    if (isTimePassed(selectedDate, selectedTime)) {
      alert("Bu saat artıq keçib. Zəhmət olmasa başqa saat seçin.");
      setSelectedTime("");
      return;
    }

    /*
     * Son anda yaddaşdan təzə məlumatı oxuyub yenidən yoxlayırıq.
     */
    if (
      isSlotTaken(
        getBookings(),
        provider.id,
        selectedDate,
        selectedTime,
        selectedService.duration
      )
    ) {
      alert(
        "Bu vaxt artıq rezerv edilib. Zəhmət olmasa başqa saat seçin."
      );
      setSelectedTime("");
      return;
    }

    addBooking({
      id: Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      customerId: CURRENT_CUSTOMER.id,
      customerName: CURRENT_CUSTOMER.name,
      service: selectedService.name,
      serviceId: selectedService.id,
      duration: selectedService.duration,
      date: selectedDate,
      time: selectedTime,
      priceFrom: selectedService.price,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    setConfirmed(true);
  };

  /*
   * Seçilmiş gün üçün iş qrafiki və mümkün saatlar.
   */
  const selectedSchedule = selectedDate
    ? getScheduleForDate(weeklySchedule, selectedDate)
    : null;

  const selectedDayTimes = selectedSchedule
    ? generateTimeSlots(selectedSchedule)
    : [];

  /* =========================================================
     UĞUR SƏHİFƏSİ
  ========================================================= */

  if (confirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success">
          <div className="booking-success__icon">
            <CheckCircle2 size={28} strokeWidth={1.8} />
          </div>

          <h1>Rezerv uğurla yaradıldı</h1>

          <p>
            <strong>{provider.name}</strong>
            <br />
            {selectedService?.name}
            <br />
            {formatReadableDate(selectedDate)} · {selectedTime}
          </p>

          <div className="booking-success__actions">
            <button
              type="button"
              className="booking-success__button booking-success__button--primary"
              onClick={() => navigate("/bookings")}
            >
              Rezervlərə bax
            </button>

            <button
              type="button"
              className="booking-success__button"
              onClick={() => navigate("/")}
            >
              Ana səhifəyə qayıt
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ƏSAS SƏHİFƏ
  ========================================================= */

  return (
    <div className="booking-page">
      <div className="booking-page__top">
        <button
          type="button"
          className="booking-back-button"
          onClick={() => navigate(`/provider/${provider.id}`)}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          <span>Profilə qayıt</span>
        </button>
      </div>

      <div className="booking-layout">
        <main className="booking-main">
          <section className="booking-section">
            <div className="booking-section__header">
              <h1>Rezerv et</h1>

              <p>
                Xidmət, tarix və uyğun saat seçərək rezervinizi yaradın.
              </p>
            </div>

            <div className="booking-provider">
              <div className="booking-provider__avatar">{initials}</div>

              <div className="booking-provider__content">
                <div className="booking-provider__name">
                  <strong>{provider.name}</strong>

                  {provider.verified && (
                    <span className="booking-provider__verified">
                      <CheckCircle2 size={14} strokeWidth={2} />
                      Təsdiqlənib
                    </span>
                  )}
                </div>

                <div className="booking-provider__service">
                  {provider.service}
                </div>

                <div className="booking-provider__location">
                  <MapPin size={14} strokeWidth={1.8} />
                  <span>{provider.area}</span>
                  <span>•</span>
                  <Star size={13} fill="currentColor" strokeWidth={1.8} />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section__header">
              <h2>1. Xidmət seçin</h2>
            </div>

            <div className="booking-services">
              {services.map((service) => (
                <button
                  type="button"
                  key={service.id}
                  className={`booking-service ${
                    selectedServiceId === service.id ? "is-selected" : ""
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <span className="booking-service__info">
                    <span className="booking-service__name">
                      {service.name}
                    </span>

                    <span className="booking-service__description">
                      {service.description} ·{" "}
                      {formatDuration(service.duration)}
                    </span>
                  </span>

                  <span className="booking-service__price">
                    {service.price} ₼
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section__header">
              <h2>2. Tarix seçin</h2>

              <p>
                Günlərin doluluq vəziyyətini əvvəlcədən görə bilərsiniz.
              </p>
            </div>

            <div className="booking-date-legend">
              <span>
                <i className="booking-date-dot booking-date-dot--empty" />
                Boş
              </span>

              <span>
                <i className="booking-date-dot booking-date-dot--partial" />
                Qismən dolu
              </span>

              <span>
                <i className="booking-date-dot booking-date-dot--full" />
                Dolu / Bağlı
              </span>
            </div>

            <div className="booking-date-grid">
              {availableDates.map((date) => {
                const dateKey = formatDateKey(date);
                const schedule = getScheduleForDate(
                  weeklySchedule,
                  dateKey
                );
                const status = getDateStatus(dateKey, currentDuration);
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    type="button"
                    key={dateKey}
                    disabled={status === "full"}
                    className={`booking-date-card booking-date-card--${status} ${
                      isSelected ? "is-selected" : ""
                    }`}
                    onClick={() => handleDateSelect(dateKey)}
                  >
                    <span className="booking-date-card__weekday">
                      {getWeekDay(date)}
                    </span>

                    <strong className="booking-date-card__day">
                      {getDayNumber(date)}
                    </strong>

                    <span className="booking-date-card__month">
                      {getMonthName(date)}
                    </span>

                    <i className="booking-date-card__dot" />

                    <small>
                      {status === "empty" && "Boş"}
                      {status === "partial" && "Qismən dolu"}
                      {status === "full" &&
                        (schedule.isOpen ? "Dolu" : "Bağlı")}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section__header">
              <h2>3. Saat seçin</h2>

              <p>
                Saatlar seçdiyiniz xidmətin müddətinə və biznesin iş
                qrafikinə görə hesablanır.
              </p>
            </div>

            {!selectedService ? (
              <div className="booking-time-empty">
                Əvvəlcə yuxarıdan xidmət seçin.
              </div>
            ) : !selectedDate ? (
              <div className="booking-time-empty">
                Əvvəlcə yuxarıdan bir gün seçin.
              </div>
            ) : selectedDayTimes.length === 0 ? (
              <div className="booking-time-empty">
                Bu gün biznes üçün bağlıdır.
              </div>
            ) : (
              <div className="booking-times">
                {selectedDayTimes.map((time) => {
                  const passed = isTimePassed(selectedDate, time);

                  const taken = isSlotTaken(
                    storedBookings,
                    provider.id,
                    selectedDate,
                    time,
                    currentDuration
                  );

                  const tooLate = selectedSchedule
                    ? exceedsWorkday(
                        time,
                        currentDuration,
                        selectedSchedule
                      )
                    : false;

                  const unavailable = passed || taken || tooLate;

                  return (
                    <button
                      type="button"
                      key={time}
                      disabled={unavailable}
                      className={`booking-time ${
                        selectedTime === time ? "is-selected" : ""
                      } ${unavailable ? "is-booked" : ""}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock3 size={15} strokeWidth={1.8} />

                      {time}

                      {passed && (
                        <span className="booking-time__booked">Keçib</span>
                      )}

                      {!passed && taken && (
                        <span className="booking-time__booked">
                          Doludur
                        </span>
                      )}

                      {!passed && !taken && tooLate && (
                        <span className="booking-time__booked">Sığmır</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="booking-sidebar">
          <section className="booking-summary">
            <h2 className="booking-summary__title">Rezerv məlumatları</h2>

            <div className="booking-summary__item">
              <CalendarDays size={18} strokeWidth={1.8} />

              <div>
                <span>Xidmət</span>

                <strong>{selectedService?.name ?? "Seçilməyib"}</strong>
              </div>
            </div>

            <div className="booking-summary__item">
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>Müddət</span>

                <strong>
                  {selectedService
                    ? formatDuration(selectedService.duration)
                    : "Seçilməyib"}
                </strong>
              </div>
            </div>

            <div className="booking-summary__item">
              <CalendarDays size={18} strokeWidth={1.8} />

              <div>
                <span>Tarix</span>

                <strong>
                  {selectedDate
                    ? formatReadableDate(selectedDate)
                    : "Seçilməyib"}
                </strong>
              </div>
            </div>

            <div className="booking-summary__item">
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>Saat</span>

                <strong>{selectedTime || "Seçilməyib"}</strong>
              </div>
            </div>

            <div className="booking-summary__divider" />

            <div className="booking-summary__price">
              <span>{selectedService ? "Qiymət" : "Başlanğıc qiymət"}</span>

              <strong>
                {selectedService?.price ?? provider.priceFrom} ₼
              </strong>
            </div>

            <button
              type="button"
              className="booking-confirm"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              <CheckCircle2 size={17} strokeWidth={1.8} />
              Rezervi təsdiqlə
            </button>

            <p className="booking-hint">
              Rezerv demo rejimində bu brauzerdə saxlanılır.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Booking;