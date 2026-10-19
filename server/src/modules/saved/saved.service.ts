import { prisma } from "../../config/prisma";
import { toProviderDTO } from "../providers/providers.service";

/* İstifadəçinin seçilmiş provider-ləri, ən son əlavə olunan birinci */
export const listSaved = async (userId: string) => {
  const saved = await prisma.savedProvider.findMany({
    where: { userId },
    include: {
      business: {
        include: {
          area: true,
          services: true,
          reviews: true,
          portfolio: { take: 1 },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return saved.map((item) => ({
    ...toProviderDTO(item.business),
    /* Portfoliodakı ilk şəkil kartın üz qabığıdır */
    image: item.business.portfolio[0]?.imageUrl ?? null,
  }));
};

/*
 * Təkrar çağırılsa xəta vermir (artıq seçilibsə heç nə dəyişmir).
 * Biznes sahibi öz biznesini seçilmişlərə əlavə edə bilməz.
 */
export const addSaved = async (userId: string, providerId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: providerId },
  });

  if (!business) {
    throw new Error("PROVIDER_NOT_FOUND");
  }

  if (business.userId === userId) {
    throw new Error("OWN_BUSINESS");
  }

  await prisma.savedProvider.upsert({
    where: {
      userId_businessId: { userId, businessId: providerId },
    },
    create: { userId, businessId: providerId },
    update: {},
  });
};

/* Seçilməyibsə də xəta vermir */
export const removeSaved = async (userId: string, providerId: string) => {
  await prisma.savedProvider.deleteMany({
    where: { userId, businessId: providerId },
  });
};