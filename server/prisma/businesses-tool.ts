import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/*
 * İstifadə:
 *   Siyahı:        businesses-tool.ts
 *   Quru sınaq:    businesses-tool.ts --delete <biznesId>
 *   Həqiqi silmə:  businesses-tool.ts --delete <biznesId> --confirm
 */

const args = process.argv.slice(2);
const deleteIndex = args.indexOf("--delete");
const businessId = deleteIndex >= 0 ? args[deleteIndex + 1] : undefined;
const confirmed = args.includes("--confirm");

async function listBusinesses() {
  const businesses = await prisma.business.findMany({
    include: {
      user: true,
      area: true,
      _count: {
        select: {
          services: true,
          bookings: true,
          reviews: true,
          portfolio: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.table(
    businesses.map((business) => ({
      id: business.id,
      ad: business.name,
      erazi: business.area.name,
      sahibEmail: business.user.email,
      xidmet: business._count.services,
      rezerv: business._count.bookings,
      rey: business._count.reviews,
      sekil: business._count.portfolio,
      yaranib: business.createdAt.toISOString().slice(0, 10),
    }))
  );
}

async function removeBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { user: true, area: true },
  });

  if (!business) {
    console.log(`Biznes tapılmadı: ${id}`);
    return;
  }

  const counts = {
    reviews: await prisma.review.count({ where: { businessId: id } }),
    bookings: await prisma.booking.count({ where: { businessId: id } }),
    saved: await prisma.savedProvider.count({ where: { businessId: id } }),
    portfolio: await prisma.portfolio.count({ where: { businessId: id } }),
    availability: await prisma.availability.count({ where: { businessId: id } }),
    services: await prisma.service.count({ where: { businessId: id } }),
  };

  /* Sahib hesabı yalnız başqa heç bir əlaqəsi yoxdursa silinir */
  const ownerId = business.userId;

  const ownerLinks =
    (await prisma.booking.count({ where: { customerId: ownerId } })) +
    (await prisma.review.count({ where: { userId: ownerId } })) +
    (await prisma.savedProvider.count({ where: { userId: ownerId } })) +
    (await prisma.notification.count({ where: { userId: ownerId } }));

  const deleteOwner = ownerLinks === 0;

  console.log("");
  console.log(`Biznes:  ${business.name} (${business.area.name})`);
  console.log(`Sahib:   ${business.user.email}`);
  console.log("Silinəcək:");
  console.log(`  rəylər: ${counts.reviews}`);
  console.log(`  rezervlər: ${counts.bookings}`);
  console.log(`  seçilmişlərdəki qeydlər: ${counts.saved}`);
  console.log(`  portfolio şəkilləri: ${counts.portfolio}`);
  console.log(`  iş saatları: ${counts.availability}`);
  console.log(`  xidmətlər: ${counts.services}`);
  console.log(
    deleteOwner
      ? `  sahib hesabı (${business.user.email}): SİLİNƏCƏK`
      : `  sahib hesabı (${business.user.email}): QALIR (başqa əlaqələri var: ${ownerLinks})`
  );

  if (!confirmed) {
    console.log("");
    console.log("Bu quru sınaq idi, heç nə silinmədi.");
    console.log("Silmək üçün əmrin sonuna --confirm əlavə et.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { businessId: id } });
    await tx.booking.deleteMany({ where: { businessId: id } });
    await tx.savedProvider.deleteMany({ where: { businessId: id } });
    await tx.portfolio.deleteMany({ where: { businessId: id } });
    await tx.availability.deleteMany({ where: { businessId: id } });
    await tx.service.deleteMany({ where: { businessId: id } });
    await tx.business.delete({ where: { id } });

    if (deleteOwner) {
      await tx.user.delete({ where: { id: ownerId } });
    }
  });

  console.log("");
  console.log("Silindi.");
}

async function main() {
  if (deleteIndex >= 0) {
    if (!businessId) {
      console.log("Biznes id-si verilməyib: --delete <id>");
      return;
    }

    await removeBusiness(businessId);
    return;
  }

  await listBusinesses();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });