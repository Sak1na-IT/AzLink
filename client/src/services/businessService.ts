import { apiRequest } from "./api";

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
  start: string;
  end: string;
}

export type WeeklySchedule = Record<WeekDay, DaySchedule>;

export interface BusinessProfile {
  businessName: string;
  category: string;
  areaId: string;
  phone: string;
  description: string;
  schedule: WeeklySchedule;
}

export const defaultWeeklySchedule: WeeklySchedule = {
  monday: { isOpen: true, start: "10:00", end: "20:00" },
  tuesday: { isOpen: true, start: "10:00", end: "20:00" },
  wednesday: { isOpen: true, start: "10:00", end: "20:00" },
  thursday: { isOpen: true, start: "10:00", end: "20:00" },
  friday: { isOpen: true, start: "10:00", end: "20:00" },
  saturday: { isOpen: true, start: "10:00", end: "20:00" },
  sunday: { isOpen: false, start: "10:00", end: "20:00" },
};

export const getBusinessProfile = () =>
  apiRequest<BusinessProfile>("/business/profile");

export const saveBusinessProfile = (profile: BusinessProfile) =>
  apiRequest<BusinessProfile>("/business/profile", {
    method: "PATCH",
    body: profile,
  });