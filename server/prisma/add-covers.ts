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
 * Şəkil biznesin üz qabığı (Business.coverUrl) kimi yazılır və
 * kartlarda, profil səhifəsində görünür. Portfolioya toxunulmur:
 * portfolio yalnız iş nümunələri üçündür. Skriptin köhnə versiyası
 * üz qabığını portfolioya "Üz qabığı" adı ilə yazırdı; belə şəkillər
 * də silinir. Təkrar işlətmək təhlükəsizdir: eyni biznesin artıq üz
 * qabığı varsa, yenisi ilə əvəz olunur.
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join } from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COVERS_DIR = join(__dirname, "covers");
/* Köhnə versiyanın portfolioya yazdığı üz qabıqlarının adı */
const OLD_COVER_CAPTION = "Üz qabığı";
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
  const covered = new Set<string>();

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    /*
     * Windows uzantıları gizlədəndə fayl "cleanpro.jpg.jpg" ola bilir:
     * bütün şəkil uzantılarını silirik.
     */
    const baseName = file.replace(/(\.(jpe?g|png|webp))+$/i, "");
    const slug = slugify(baseName);

    /* Dəqiq ad, ya da fayl adının içində biznesin adı keçirsə */
    const business =
      bySlug.get(slug) ??
      Array.from(bySlug.entries()).find(([key]) => slug.includes(key))?.[1];

    if (!business) {
      console.warn(`✗ ${file}: bu adda biznes tapılmadı (oxunan ad: ${slug})`);
      continue;
    }

    covered.add(business.id);

    const path = join(COVERS_DIR, file);
    const sizeKb = Math.round(statSync(path).size / 1024);

    if (sizeKb > MAX_SIZE_KB) {
      console.warn(
        `! ${file}: ${sizeKb} KB böyükdür. Səhifələr yavaş açılmasın deyə ${MAX_SIZE_KB} KB-dan kiçik şəkil seçin.`
      );
    }

    const dataUrl = `data:${MIME[ext]};base64,${readFileSync(path).toString("base64")}`;

    await prisma.$transaction([
      prisma.business.update({
        where: { id: business.id },
        data: { coverUrl: dataUrl, coverPosition: 50 },
      }),
      prisma.portfolio.deleteMany({
        where: { businessId: business.id, caption: OLD_COVER_CAPTION },
      }),
    ]);

    added += 1;
    console.log(`✓ ${business.name} ← ${file} (${sizeKb} KB)`);
  }

  console.log(`\n${added} biznesə üz qabığı əlavə olundu.`);

  const missing = businesses.filter((business) => !covered.has(business.id));

  if (missing.length > 0) {
    console.log("\nŞəkli olmayan bizneslər və gözlənilən fayl adları:");
    for (const business of missing) {
      console.log(`  ${business.name.padEnd(22)} → ${slugify(business.name)}.jpg`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
