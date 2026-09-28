import { prisma } from "../../config/prisma";

export interface ServiceInput {
  name: string;
  description: string;
  price: number;
  duration: number;
}

const toServiceDTO = (service: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}) => ({
  id: service.id,
  name: service.name,
  description: service.description ?? "",
  price: service.price,
  duration: service.duration,
});

const getBusinessByUserId = async (userId: string) => {
  const business = await prisma.business.findUnique({
    where: { userId },
    include: { categories: true },
  });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return business;
};

const getOwnedService = async (businessId: string, serviceId: string) => {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId },
  });

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  return service;
};

export const listServices = async (userId: string) => {
  const business = await getBusinessByUserId(userId);

  const services = await prisma.service.findMany({
    where: { businessId: business.id },
    orderBy: { id: "asc" },
  });

  return services.map(toServiceDTO);
};

export const createService = async (userId: string, input: ServiceInput) => {
  const business = await getBusinessByUserId(userId);

  const category = business.categories[0];

  if (!category) {
    throw new Error("CATEGORY_REQUIRED");
  }

  const service = await prisma.service.create({
    data: {
      businessId: business.id,
      categoryId: category.id,
      name: input.name,
      description: input.description,
      price: input.price,
      duration: input.duration,
    },
  });

  return toServiceDTO(service);
};

export const updateService = async (
  userId: string,
  serviceId: string,
  input: Partial<ServiceInput>
) => {
  const business = await getBusinessByUserId(userId);

  await getOwnedService(business.id, serviceId);

  const service = await prisma.service.update({
    where: { id: serviceId },
    data: input,
  });

  return toServiceDTO(service);
};

export const deleteService = async (userId: string, serviceId: string) => {
  const business = await getBusinessByUserId(userId);

  await getOwnedService(business.id, serviceId);

  await prisma.service.delete({ where: { id: serviceId } });
};