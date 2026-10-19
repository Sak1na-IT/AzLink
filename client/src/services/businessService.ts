import { ApiError, apiRequest } from "./api";

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
  logoUrl?: string | null;
  coverUrl?: string | null;
  coverPosition?: number;
}

export interface BrandingInput {
  logoUrl?: string | null;
  coverUrl?: string | null;
  coverPosition?: number;
}

/* Profil şəkli, üz qabığı və onun mövqeyi (null = sil) */
export const saveBranding = (input: BrandingInput) =>
  apiRequest<BusinessProfile>("/business/profile/branding", {
    method: "PATCH",
    body: input,
  });

export const defaultWeeklySchedule: WeeklySchedule = {
  monday: { isOpen: true, start: "10:00", end: "20:00" },
  tuesday: { isOpen: true, start: "10:00", end: "20:00" },
  wednesday: { isOpen: true, start: "10:00", end: "20:00" },
  thursday: { isOpen: true, start: "10:00", end: "20:00" },
  friday: { isOpen: true, start: "10:00", end: "20:00" },
  saturday: { isOpen: true, start: "10:00", end: "20:00" },
  sunday: { isOpen: false, start: "10:00", end: "20:00" },
};

/*
 * Profil hələ yaradılmayıbsa (backend 404 qaytarır), boş forma qaytarılır:
 * beləcə biznes sahibi profil və ya iş saatları səhifəsində onu doldurub
 * yadda saxlaya bilir, səhifə xətada ilişib qalmır.
 */
export const getBusinessProfile = async (): Promise<BusinessProfile> => {
  try {
    return await apiRequest<BusinessProfile>("/business/profile");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        businessName: "",
        category: "",
        areaId: "",
        phone: "",
        description: "",
        schedule: defaultWeeklySchedule,
        logoUrl: null,
        coverUrl: null,
        coverPosition: 50,
      };
    }

    throw error;
  }
};

export const saveBusinessProfile = (profile: BusinessProfile) =>
  apiRequest<BusinessProfile>("/business/profile", {
    method: "PATCH",
    body: profile,
  });