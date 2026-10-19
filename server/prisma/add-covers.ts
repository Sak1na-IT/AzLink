/*
 * Bizneslərə üz qabığı şəkli əlavə edir.
 *
 * İstifadə:
 *   1. Şəkli prisma/covers/ qovluğuna qoyun. Fayl adı biznesin adı
 *      ilə eyni olmalıdır, kiçik hərflərlə və boşluq yerinə "-":
 *        "Nail by Aysel"   → nail-by-aysel.jpg
 *        "Rəşad Auto Wash" → resad-auto-wash.jpg
 *      (jpg, jpeg, png və webp olar)
 *   2. server qovluğunda: npm run covers
 *
 * Şəkil biznesin portfoliosuna birinci şəkil kimi əlavə olunur və
 * kartlarda, profil səhifəsində görünür. Təkrar işlətmək təhlükəsizdir:
 * eyni biznesin artıq üz qabığı varsa, yenisi ilə əvəz olunur.
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join } from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COVERS_DIR = join(__dirname, "covers");
const COVER_CAPTION = "Üz qabığı";
const MAX_SIZE_KB = 700;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/* "Rəşad Auto Wash" → "resad-auto-wash" */
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

async function main() {
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true },
  });

  const bySlug = new Map(businesses.map((b) => [slugify(b.name), b]));
  const files = readdirSync(COVERS_DIR).filter((file) => MIME[extname(file).toLowerCase()]);

  if (files.length === 0) {
    console.log("prisma/covers/ qovluğunda şəkil yoxdur.");
    return;
  }

  let added = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const slug = slugify(file.slice(0, -ext.length));
    const business = bySlug.get(slug);

    if (!business) {
      console.warn(`✗ ${file}: bu adda biznes tapılmadı (gözlənilən: ${slug})`);
      continue;
    }

    const path = join(COVERS_DIR, file);
    const sizeKb = Math.round(statSync(path).size / 1024);

    if (sizeKb > MAX_SIZE_KB) {
      console.warn(
        `! ${file}: ${sizeKb} KB böyükdür. Səhifələr yavaş açılmasın deyə ${MAX_SIZE_KB} KB-dan kiçik şəkil seçin.`
      );
    }

    const dataUrl = `data:${MIME[ext]};base64,${readFileSync(path).toString("base64")}`;

    /*
     * Kartda portfolionun birinci şəkli göstərilir. Üz qabığının
     * birinci olması üçün köhnə şəkillər silinib yenidən, üz
     * qabığından sonra yazılır.
     */
    const existing = await prisma.portfolio.findMany({
      where: { businessId: business.id, NOT: { caption: COVER_CAPTION } },
      orderBy: { id: "asc" },
    });

    await prisma.$transaction([
      prisma.portfolio.deleteMany({ where: { businessId: business.id } }),
      prisma.portfolio.create({
        data: { businessId: business.id, imageUrl: dataUrl, caption: COVER_CAPTION },
      }),
      ...existing.map((image) =>
        prisma.portfolio.create({
          data: {
            businessId: business.id,
            imageUrl: image.imageUrl,
            caption: image.caption,
          },
        })
      ),
    ]);

    added += 1;
    console.log(`✓ ${business.name} ← ${file} (${sizeKb} KB)`);
  }

  console.log(`\n${added} biznesə üz qabığı əlavə olundu.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
