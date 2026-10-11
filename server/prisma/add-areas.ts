import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* Bakı şəhərinin 12 inzibati rayonu */
const DISTRICTS = [
  "Nərimanov",
  "Nəsimi",
  "Yasamal",
  "Səbail",
  "Xətai",
  "Nizami",
  "Binəqədi",
  "Sabunçu",
  "Suraxanı",
  "Xəzər",
  "Qaradağ",
  "Pirallahı",
];

async function main() {
  for (const name of DISTRICTS) {
    await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name, type: "district" },
    });
  }

  const count = await prisma.area.count();
  console.log(`Hazırdır. Bazada indi ${count} ərazi var.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });