/*
 * Demo məlumatları (bizneslər, demo hesablar, şəkillər) yalnız baza boş
 * olanda əlavə olunur. Belə ki, daimi bazada istifadəçilərin rezervləri,
 * rəyləri və dəyişiklikləri hər yenidən başlamada toxunulmaz qalır.
 */
const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const run = (command) => execSync(command, { stdio: "inherit" });

async function main() {
  const prisma = new PrismaClient();

  let users = 0;

  try {
    users = await prisma.user.count();
  } finally {
    await prisma.$disconnect();
  }

  if (users > 0) {
    console.log(`Bazada ${users} istifadəçi var — demo məlumatlar əlavə olunmur.`);
    return;
  }

  console.log("Baza boşdur — demo məlumatlar əlavə olunur.");
  run("npm run seed");

  try {
    run("npm run covers");
  } catch {
    console.warn("Üz qabıqları əlavə olunmadı, davam edirik.");
  }

  try {
    run("npm run portfolio");
  } catch {
    console.warn("Portfolio şəkilləri əlavə olunmadı, davam edirik.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
