import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

const round1 = (value: number) => Math.round(value * 10) / 10;

/*
 * Bir business-in xam Prisma nəticəsini frontend-in gözlədiyi
 * "Provider" formasına çevirir. rating/reviewCount reviews
 * əlaqəsindən hesablanır (hələ rəy yoxdursa 0 qayıdır).
 * distance hələlik null-dur — coğrafi hesablama sonra əlavə olunacaq.
 *
 * Bu funksiya export olunur: Saved API da eyni kart formatını qaytarır.
 * (Ona görə toxunmuruq — Saved-in include-ları dəyişməsin.)
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

/* Axtarış kartı üçün lazım olan bütün əlaqələr */
const cardInclude = {
  area: true,
  categories: { include: { parent: true } },
  services: { include: { category: { include: { parent: true } } } },
  reviews: true,
  portfolio: { take: 1 },
} satisfies Prisma.BusinessInclude;

type BusinessCard = Prisma.BusinessGetPayload<{
  include: typeof cardInclude;
}>;

/* Biznesin bütün kateqoriya adları (alt-kateqoriya + onun valideyni) */
const getCategoryNames = (business: BusinessCard) => {
  const names = new Set<string>();

  const add = (category: {
    name: string;
    parent?: { name: string } | null;
  }) => {
    names.add(category.name);

    if (category.parent) {
      names.add(category.parent.name);
    }
  };

  business.categories.forEach(add);
  business.services.forEach((service) => add(service.category));

  return Array.from(names);
};

/*
 * Axtarış/kəşf kartı: frontend-in "Provider" tipinə uyğundur.
 * - service: kartda göstərilən kateqoriya adı (məs. "Dırnaq")
 * - categories: kateqoriya filtri üçün bütün adlar
 * - ownerId: biznes sahibinin user id-si (öz biznesini gizlətmək üçün)
 */
export const toProviderCard = (business: BusinessCard) => ({
  ...toProviderDTO(business),
  service:
    business.services[0]?.category.name ??
    business.categories[0]?.name ??
    "",
  ownerId: business.userId,
  categories: getCategoryNames(business),
  services: business.services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? "",
    price: service.price,
    duration: service.duration,
  })),
});

export const getProviders = async (filters: {
  search?: string;
  area?: string;
  service?: string;
}) => {
  const businesses = await prisma.business.findMany({
    where: {
      AND: [
        /* Xidməti olmayan biznesə rezerv etmək olmur — siyahıda çıxmasın */
        { services: { some: {} } },
        {
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
      ],
    },
    include: cardInclude,
  });

  return businesses.map(toProviderCard);
};

export const getProviderById = async (id: string) => {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      ...cardInclude,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      portfolio: true,
      availability: true,
    },
  });

  if (!business) {
    return null;
  }

  return {
    ...toProviderCard(business),
    description: business.description,
    phone: business.phone,
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
    /* İş saatları: dayOfWeek 0 = Bazar ... 6 = Şənbə (rezerv addımında lazım olacaq) */
    availability: business.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
};