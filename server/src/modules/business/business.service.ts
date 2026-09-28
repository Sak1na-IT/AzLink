import { prisma } from "../../config/prisma";

type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
}

type WeeklySchedule = Record<WeekDay, DaySchedule>;

export interface BusinessProfileInput {
  businessName: string;
  category: string;
  areaId: string;
  phone: string;
  description: string;
  schedule: WeeklySchedule;
}

const weekDays: WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/* JS/Prisma: 0 = Bazar, 1 = Bazar ertəsi ... 6 = Şənbə */
const weekDayToDayOfWeek: Record<WeekDay, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const dayOfWeekToWeekDay: WeekDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const emptySchedule = (): WeeklySchedule => {
  const schedule = {} as WeeklySchedule;

  for (const day of weekDays) {
    schedule[day] = { isOpen: false, start: "10:00", end: "20:00" };
  }

  return schedule;
};

export const getBusinessProfileByUserId = async (userId: string) => {
  const business = await prisma.business.findUnique({
    where: { userId },
    include: {
      categories: true,
      availability: true,
    },
  });

  if (!business) {
    return null;
  }

  const schedule = emptySchedule();

  for (const slot of business.availability) {
    const day = dayOfWeekToWeekDay[slot.dayOfWeek];

    schedule[day] = {
      isOpen: true,
      start: slot.startTime,
      end: slot.endTime,
    };
  }

  return {
    businessName: business.name,
    category: business.categories[0]?.name ?? "",
    areaId: business.areaId,
    phone: business.phone,
    description: business.description ?? "",
    schedule,
  };
};

/*
 * Kateqoriya frontend-dən sadə mətn kimi gəlir (məs. "Dırnaq baxımı").
 * Bu adla Category axtarılır, tapılmasa yaradılır, sonra business-ə
 * TƏK kateqoriya kimi bağlanır (many-to-many relation, amma bu layihədə
 * hər biznesin bir aktiv kateqoriyası olur).
 */
const findOrCreateCategoryId = async (name: string) => {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const existing = await prisma.category.findFirst({
    where: { name: trimmed },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.category.create({
    data: { name: trimmed },
  });

  return created.id;
};

export const saveBusinessProfile = async (
  userId: string,
  input: BusinessProfileInput
) => {
  const categoryId = await findOrCreateCategoryId(input.category);

  const existing = await prisma.business.findUnique({ where: { userId } });

  const business = existing
    ? await prisma.business.update({
        where: { userId },
        data: {
          name: input.businessName,
          description: input.description,
          areaId: input.areaId,
          phone: input.phone,
          categories: {
            set: categoryId ? [{ id: categoryId }] : [],
          },
        },
      })
    : await prisma.business.create({
        data: {
          userId,
          name: input.businessName,
          description: input.description,
          areaId: input.areaId,
          phone: input.phone,
          categories: categoryId
            ? { connect: [{ id: categoryId }] }
            : undefined,
        },
      });

  await prisma.availability.deleteMany({
    where: { businessId: business.id },
  });

  const openDays = weekDays.filter((day) => input.schedule[day]?.isOpen);

  if (openDays.length > 0) {
    await prisma.availability.createMany({
      data: openDays.map((day) => ({
        businessId: business.id,
        dayOfWeek: weekDayToDayOfWeek[day],
        startTime: input.schedule[day].start,
        endTime: input.schedule[day].end,
      })),
    });
  }

  const saved = await getBusinessProfileByUserId(userId);

  if (!saved) {
    throw new Error("SAVE_FAILED");
  }

  return saved;
};