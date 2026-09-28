import { prisma } from "../../config/prisma";

const round1 = (value: number) => Math.round(value * 10) / 10;

/*
 * Bir business-in xam Prisma nəticəsini frontend-in gözlədiyi
 * "Provider" formasına çevirir. rating/reviewCount reviews
 * əlaqəsindən hesablanır (hələ rəy yoxdursa 0 qayıdır).
 * distance hələlik null-dur — coğrafi hesablama sonra əlavə olunacaq.
 *
 * Qeyd: sxemdə areaId/area MƏCBURİDİR (qeydiyyat zamanı Register.tsx
 * rayonu artıq tələb edir), ona görə burada null ehtimalı yoxdur.
 *
 * Bu funksiya export olunur: Saved API da eyni kart formatını qaytarır.
 */
export const toProviderDTO = (business: {
  id: string;
  name: string;
  areaId: string;
  area: { name: string };
  services: { name: string; price: number }[];
  reviews: { rating: number }[];
  verified: boolean;
}) => {
  const reviewCount = business.reviews.length;

  const averageRating =
    reviewCount === 0
      ? 0
      : round1(
          business.reviews.reduce((sum, r) => sum + r.rating, 0) /
            reviewCount
        );

  const priceFrom =
    business.services.length === 0
      ? 0
      : Math.min(...business.services.map((s) => s.price));

  return {
    id: business.id,
    name: business.name,
    service: business.services[0]?.name ?? "",
    area: business.area.name,
    distance: null,
    rating: averageRating,
    reviewCount,
    priceFrom,
    verified: business.verified,
  };
};

export const getProviders = async (filters: {
  search?: string;
  area?: string;
  service?: string;
}) => {
  const businesses = await prisma.business.findMany({
    where: {
      ...(filters.area && {
        area: { name: { equals: filters.area } },
      }),
      ...(filters.service && {
        services: {
          some: { name: { contains: filters.service } },
        },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          {
            services: {
              some: { name: { contains: filters.search } },
            },
          },
        ],
      }),
    },
    include: {
      area: true,
      services: true,
      reviews: true,
    },
  });

  return businesses.map(toProviderDTO);
};

export const getProviderById = async (id: string) => {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      area: true,
      services: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      portfolio: true,
    },
  });

  if (!business) {
    return null;
  }

  return {
    ...toProviderDTO(business),
    description: business.description,
    services: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
    })),
    reviews: business.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.user.name,
      createdAt: r.createdAt,
    })),
    portfolio: business.portfolio.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
    })),
  };
};