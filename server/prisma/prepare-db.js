/*
 * Server başlamazdan əvvəl verilənlər bazasını hazırlayır.
 *
 * - DATABASE_URL "postgres..." ilə başlayırsa (məs. Neon): schema.prisma-nın
 *   Postgres nüsxəsi yaradılır, Prisma client ona görə yenidən qurulur və
 *   cədvəllər bazaya tətbiq olunur (db push). Məlumatlar silinmir.
 * - Əks halda (lokal SQLite fayl): köhnə qayda ilə miqrasiyalar işləyir.
 *
 * Belə ki, lokalda heç nə dəyişmir, Render-də isə daimi baza istifadə olunur.
 */
const { execSync } = require("child_process");
const { mkdirSync, readFileSync, writeFileSync } = require("fs");
const path = require("path");

const run = (command) => execSync(command, { stdio: "inherit" });

const url = process.env.DATABASE_URL || "";
const isPostgres = /^postgres(ql)?:\/\//i.test(url);

if (!isPostgres) {
  console.log("Baza: SQLite fayl (lokal rejim)");
  run("npx prisma migrate deploy");
  process.exit(0);
}

console.log("Baza: Postgres (daimi)");

const source = readFileSync(path.join(__dirname, "schema.prisma"), "utf8");
const postgresSchema = source.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"'
);

const dir = path.join(__dirname, "postgres");
const target = path.join(dir, "schema.prisma");

mkdirSync(dir, { recursive: true });
writeFileSync(target, postgresSchema);

run(`npx prisma generate --schema "${target}"`);
run(`npx prisma db push --schema "${target}" --skip-generate`);
