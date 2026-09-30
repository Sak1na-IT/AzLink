import { prisma } from "../../config/prisma";

export interface PortfolioInput {
  dataUrl: string;
  caption: string;
}

const toPortfolioDTO = (image: {
  id: string;
  imageUrl: string;
  caption: string | null;
}) => ({
  id: image.id,
  dataUrl: image.imageUrl,
  caption: image.caption ?? "",
});

const getBusinessByUserId = async (userId: string) => {
  const business = await prisma.business.findUnique({ where: { userId } });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return business;
};

export const listPortfolio = async (userId: string) => {
  const business = await getBusinessByUserId(userId);

  const images = await prisma.portfolio.findMany({
    where: { businessId: business.id },
    orderBy: { id: "desc" },
  });

  return images.map(toPortfolioDTO);
};

export const addPortfolioImage = async (
  userId: string,
  input: PortfolioInput
) => {
  const business = await getBusinessByUserId(userId);

  const image = await prisma.portfolio.create({
    data: {
      businessId: business.id,
      imageUrl: input.dataUrl,
      caption: input.caption,
    },
  });

  return toPortfolioDTO(image);
};

export const deletePortfolioImage = async (
  userId: string,
  imageId: string
) => {
  const business = await getBusinessByUserId(userId);

  const image = await prisma.portfolio.findFirst({
    where: { id: imageId, businessId: business.id },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  await prisma.portfolio.delete({ where: { id: imageId } });
};