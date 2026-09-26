export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DaySchedule {
  isOpen: boolean;
  start: string; // "10:00"
  end: string; // "20:00"
}

export type WeeklySchedule = Record<WeekDay, DaySchedule>;

export const weekDays: WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const weekDayLabels: Record<WeekDay, string> = {
  monday: "Bazar ertəsi",
  tuesday: "Çərşənbə axşamı",
  wednesday: "Çərşənbə",
  thursday: "Cümə axşamı",
  friday: "Cümə",
  saturday: "Şənbə",
  sunday: "Bazar",
};

/*
 * README-dəki standart: Bazar ertəsi–Şənbə 10:00–20:00,
 * Bazar bağlıdır.
 */
export const defaultWeeklySchedule: WeeklySchedule = {
  monday: { isOpen: true, start: "10:00", end: "20:00" },
  tuesday: { isOpen: true, start: "10:00", end: "20:00" },
  wednesday: { isOpen: true, start: "10:00", end: "20:00" },
  thursday: { isOpen: true, start: "10:00", end: "20:00" },
  friday: { isOpen: true, start: "10:00", end: "20:00" },
  saturday: { isOpen: true, start: "10:00", end: "20:00" },
  sunday: { isOpen: false, start: "10:00", end: "20:00" },
};

/* JS: 0 = Bazar, 1 = Bazar ertəsi ... 6 = Şənbə */
const jsDayToWeekDay: WeekDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const getWeekDayFromDate = (date: Date): WeekDay =>
  jsDayToWeekDay[date.getDay()];