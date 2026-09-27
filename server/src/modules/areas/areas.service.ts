import { prisma } from "../../config/prisma";

export const getAreas = async () => {
  return prisma.area.findMany({
    orderBy: { name: "asc" },
  });
};

export const getAreaById = async (id: string) => {
  return prisma.area.findUnique({ where: { id } });
};
