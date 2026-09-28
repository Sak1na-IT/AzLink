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
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return saved.map((item) => toProviderDTO(item.business));
};

/* Təkrar çağırılsa xəta vermir (artıq seçilibsə heç nə dəyişmir) */
export const addSaved = async (userId: string, providerId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: providerId },
  });

  if (!business) {
    throw new Error("PROVIDER_NOT_FOUND");
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