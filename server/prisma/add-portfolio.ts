/*
 * Bizneslərin portfoliosuna iş nümunələri əlavə edir.
 *
 * İstifadə:
 *   1. prisma/portfolio/ içində hər biznes üçün qovluq aç. Qovluğun adı
 *      biznesin adı ilə eyni olmalıdır, kiçik hərflərlə və boşluq yerinə "-"
 *      (üz qabığı fayllarındakı kimi):
 *        prisma/portfolio/nail-by-aysel/
 *        prisma/portfolio/studio-nigar/
 *   2. Şəkilləri qovluğa qoy. Faylın adı şəklin altındakı yazı olur,
 *      əvvəlindəki rəqəm isə sıranı göstərir və yazıya düşmür:
 *        1-qırmızı gel lak.jpg   → "Qırmızı gel lak"
 *        2-fransız manikürü.jpg  → "Fransız manikürü"
 *      (jpg, jpeg, png və webp olar)
 *   3. server qovluğunda: npm run portfolio
 *
 * Təkrar işlətmək təhlükəsizdir: eyni yazılı şəkil varsa yenisi
 * yaranmır, yalnız şəkli yenilənir.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { extname, join } from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PORTFOLIO_DIR = join(__dirname, "portfolio");
const MAX_SIZE_KB = 700;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/* "Rəşad Auto Wash" → "resad-auto-wash" (add-covers.ts ilə eyni qayda) */
const slugify = (value: string) =>
  value
    .toLocaleLowerCase("az")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* "1-qırmızı gel lak.jpg" → "Qırmızı gel lak" */
const captionFromFile = (file: string) => {
  const text = file
    .replace(/(\.(jpe?g|png|webp))+$/i, "")
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();

  return text ? text.charAt(0).toLocaleUpperCase("az") + text.slice(1) : null;
};

async function main() {
  if (!existsSync(PORTFOLIO_DIR)) {
    console.log("prisma/portfolio/ qovluğu yoxdur.");
    return;
  }

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true },
  });

  const bySlug = new Map(businesses.map((b) => [slugify(b.name), b]));

  const folders = readdirSync(PORTFOLIO_DIR).filter((name) =>
    statSync(join(PORTFOLIO_DIR, name)).isDirectory()
  );

  if (folders.length === 0) {
    console.log("prisma/portfolio/ içində biznes qovluğu yoxdur.");
    return;
  }

  let added = 0;
  let updated = 0;

  for (const folder of folders) {
    const business = bySlug.get(slugify(folder));

    if (!business) {
      console.warn(`✗ ${folder}/: bu adda biznes tapılmadı`);
      continue;
    }

    const files = readdirSync(join(PORTFOLIO_DIR, folder))
      .filter((file) => MIME[extname(file).toLowerCase()])
      .sort((a, b) => a.localeCompare(b, "az", { numeric: true }));

    for (const file of files) {
      const path = join(PORTFOLIO_DIR, folder, file);
      const sizeKb = Math.round(statSync(path).size / 1024);

      if (sizeKb > MAX_SIZE_KB) {
        console.warn(
          `! ${folder}/${file}: ${sizeKb} KB böyükdür. Səhifələr yavaş açılmasın deyə ${MAX_SIZE_KB} KB-dan kiçik şəkil seçin.`
        );
      }

      const caption = captionFromFile(file);
      const mime = MIME[extname(file).toLowerCase()];
      const imageUrl = `data:${mime};base64,${readFileSync(path).toString("base64")}`;

      const existing = caption
        ? await prisma.portfolio.findFirst({
            where: { businessId: business.id, caption },
          })
        : null;

      if (existing) {
        await prisma.portfolio.update({
          where: { id: existing.id },
          data: { imageUrl },
        });
        updated += 1;
      } else {
        await prisma.portfolio.create({
          data: { businessId: business.id, imageUrl, caption },
        });
        added += 1;
      }

      console.log(`✓ ${business.name} ← ${file}${caption ? ` ("${caption}")` : ""}`);
    }
  }

  console.log(`\n${added} şəkil əlavə olundu, ${updated} şəkil yeniləndi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
