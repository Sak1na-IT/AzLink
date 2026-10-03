import { prisma } from "../../config/prisma";
import { getBusinessProfileByUserId } from "./business.service";

const getBusinessByUserId = async (userId: string) => {
  const business = await prisma.business.findUnique({ where: { userId } });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return business;
};

export const getDashboard = async (userId: string) => {
  const business = await getBusinessByUserId(userId);

  const serviceCount = await prisma.service.count({
    where: { businessId: business.id },
  });

  const portfolioCount = await prisma.portfolio.count({
    where: { businessId: business.id },
  });

  const bookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    include: { service: true },
  });

  const activeCount = bookings.filter((b) => b.status !== "CANCELLED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const revenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.service.price, 0);

  const uniqueCustomerCount = new Set(bookings.map((b) => b.customerId)).size;

  const profile = await getBusinessProfileByUserId(userId);

  let profileCompletion = 0;

  if (profile) {
    const textFields = [
      profile.businessName,
      profile.category,
      profile.areaId,
      profile.phone,
    ];

    const hasOpenDay = Object.values(profile.schedule).some(
      (day) => day.isOpen
    );

    /* 7 şərt: ad, kateqoriya, ərazi, telefon, açıq gün, xidmət, portfolio */
    const checks = [
      ...textFields.map((value) => value.trim().length > 0),
      hasOpenDay,
      serviceCount > 0,
      portfolioCount > 0,
    ];

    profileCompletion = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }

  return {
    serviceCount,
    activeCount,
    pendingCount,
    confirmedCount,
    completedCount,
    revenue,
    uniqueCustomerCount,
    profileCompletion,
  };
};

export const getCustomers = async (userId: string) => {
  const business = await getBusinessByUserId(userId);

  const bookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    include: {
      service: true,
      customer: { select: { name: true } },
    },
  });

  const byCustomer = new Map<string, typeof bookings>();

  for (const booking of bookings) {
    const existing = byCustomer.get(booking.customerId) ?? [];
    existing.push(booking);
    byCustomer.set(booking.customerId, existing);
  }

  const summaries = Array.from(byCustomer.entries()).map(
    ([customerId, customerBookings]) => {
      const sorted = [...customerBookings].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      const latest = sorted[0];

      const totalSpent = customerBookings
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.service.price, 0);

      return {
        customerId,
        customerName: latest.customer.name,
        bookingCount: customerBookings.length,
        activeCount: customerBookings.filter(
          (b) => b.status === "PENDING" || b.status === "CONFIRMED"
        ).length,
        completedCount: customerBookings.filter(
          (b) => b.status === "COMPLETED"
        ).length,
        cancelledCount: customerBookings.filter(
          (b) => b.status === "CANCELLED"
        ).length,
        totalSpent,
        lastBookingDate: latest.date.toISOString().slice(0, 10),
        lastStatus: latest.status,
      };
    }
  );

  /* Ən son rezervi olan müştəri yuxarıda */
  summaries.sort((a, b) => b.lastBookingDate.localeCompare(a.lastBookingDate));

  return summaries;
};