import { PrismaClient } from "@prisma/client";

/*
 * ts-node-dev hər dəyişiklikdə faylı yenidən yükləyir.
 * Hər dəfə "new PrismaClient()" çağırılsa, çoxlu bağlantı
 * açılıb SQLite-i kilidləyə bilər. Ona görə tək nüsxə
 * (singleton) saxlayırıq.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
