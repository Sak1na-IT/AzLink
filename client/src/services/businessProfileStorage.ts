import { providers } from "../data/providers";
import { areas } from "../types/area";
import {
  defaultWeeklySchedule,
  weekDays,
  type WeeklySchedule,
} from "../types/schedule";

const STORAGE_KEY = "azlink-demo-business-profile";

export interface BusinessProfileData {
  businessName: string;
  category: string;
  areaId: string;
  phone: string;
  description: string;
  schedule: WeeklySchedule;
}

type ProfileMap = Record<string, BusinessProfileData>;

export const categoryOptions = Array.from(
  new Set(providers.map((provider) => provider.service))
).sort((a, b) => a.localeCompare(b, "az"));

export const areaOptions = areas.filter(
  (area) => area.type === "district" && area.id !== "all-baku"
);

const readMap = (): ProfileMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as ProfileMap;
  } catch {
    return {};
  }
};

const findAreaIdByName = (areaName: string) =>
  areas.find((area) => area.name === areaName)?.id ?? "";

const getSeedProfile = (providerId: string): BusinessProfileData => {
  const provider = providers.find((item) => item.id === providerId);

  if (!provider) {
    return {
      businessName: "",
      category: "",
      areaId: "",
      phone: "",
      description: "",
      schedule: defaultWeeklySchedule,
    };
  }

  return {
    businessName: provider.name,
    category: provider.service,
    areaId: findAreaIdByName(provider.area),
    phone: "",
    description: "",
    schedule: defaultWeeklySchedule,
  };
};

export const getBusinessProfile = (
  providerId: string
): BusinessProfileData => {
  const stored = readMap()[providerId];

  return stored ?? getSeedProfile(providerId);
};

export const saveBusinessProfile = (
  providerId: string,
  profile: BusinessProfileData
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readMap(), [providerId]: profile })
    );
  } catch {
    /* localStorage bağlı ola bilər, səhifə işləməyə davam edir */
  }
};

export const getProfileCompletion = (providerId: string): number => {
  const profile = getBusinessProfile(providerId);

  const requiredTextFields = [
    "businessName",
    "category",
    "areaId",
    "phone",
  ] as const;

  const filledTextCount = requiredTextFields.filter(
    (field) => profile[field].trim().length > 0
  ).length;

  const hasOpenDay = weekDays.some(
    (day) => profile.schedule[day].isOpen
  );

  const totalRequired = requiredTextFields.length + 1;
  const filledTotal = filledTextCount + (hasOpenDay ? 1 : 0);

  return Math.round((filledTotal / totalRequired) * 100);
};