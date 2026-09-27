import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ========================================================
   ƏRAZİLƏR
   client/src/data/providers.ts-dəki provider.area dəyərləri
   ======================================================== */

const AREA_NAMES = [
  "Nərimanov",
  "Yasamal",
  "Nəsimi",
  "Səbail",
  "Xətai",
  "Nizami",
];

/* ========================================================
   KATEQORİYALAR
   client/src/data/categories.ts ilə eyni struktur:
   hər parent kateqoriyanın "services" siyahısı uşaq
   kateqoriya kimi yaradılır.
   ======================================================== */

const CATEGORIES = [
  { name: "Gözəllik", services: ["Dırnaq", "Saç", "Makiyaj"] },
  { name: "Ev və məişət", services: ["Təmizlik", "Santexnik"] },
  { name: "Avtomobil", services: ["Avtoyuma", "Avtoservis"] },
  { name: "Təhsil", services: ["Repetitor"] },
  { name: "Foto və tədbir", services: ["Fotoqraf"] },
  { name: "Heyvanlar", services: ["Grooming"] },
  { name: "Texnologiya", services: ["Telefon təmiri"] },
  { name: "İdman", services: ["Trainer", "Yoga"] },
];

/* ========================================================
   PROVIDER-LƏR
   client/src/data/providers.ts-dən köçürülüb
   ======================================================== */

type SeedService = {
  name: string;
  description: string;
  price: number;
  duration: number;
};

type SeedProvider = {
  name: string;
  service: string;
  area: string;
  phone: string;
  services: SeedService[];
};

const PROVIDERS: SeedProvider[] = [
  {
    name: "Nail by Aysel",
    service: "Dırnaq",
    area: "Nərimanov",
    phone: "+994501110001",
    services: [
      { name: "Manikür", description: "Klassik manikür xidməti", price: 20, duration: 45 },
      { name: "Pedikür", description: "Tam pedikür xidməti", price: 30, duration: 60 },
      { name: "Dırnaq dizaynı", description: "Dırnaq üçün xüsusi dizayn", price: 25, duration: 60 },
    ],
  },
  {
    name: "Studio Nigar",
    service: "Makiyaj",
    area: "Yasamal",
    phone: "+994501110002",
    services: [
      { name: "Gündəlik makiyaj", description: "Gündəlik istifadə üçün makiyaj", price: 40, duration: 60 },
      { name: "Gecə makiyajı", description: "Xüsusi tədbirlər üçün makiyaj", price: 60, duration: 90 },
      { name: "Gəlin makiyajı", description: "Gəlin üçün xüsusi makiyaj", price: 100, duration: 120 },
    ],
  },
  {
    name: "CleanPro",
    service: "Təmizlik",
    area: "Nəsimi",
    phone: "+994501110003",
    services: [
      { name: "Ev təmizliyi", description: "Standart ev təmizliyi", price: 40, duration: 120 },
      { name: "Dərin təmizlik", description: "Ətraflı və dərin təmizlik", price: 70, duration: 180 },
    ],
  },
  {
    name: "Ali Photography",
    service: "Fotoqraf",
    area: "Səbail",
    phone: "+994501110004",
    services: [
      { name: "Portret çəkilişi", description: "Fərdi portret fotosessiyası", price: 60, duration: 60 },
      { name: "Tədbir çəkilişi", description: "Tədbirlər üçün foto çəkiliş", price: 150, duration: 180 },
    ],
  },
  {
    name: "Vüsalə Hair",
    service: "Saç",
    area: "Nəsimi",
    phone: "+994501110005",
    services: [
      { name: "Saç kəsimi", description: "Qadın saç kəsimi", price: 30, duration: 45 },
      { name: "Saç düzümü", description: "Gündəlik və tədbir üçün saç düzümü", price: 40, duration: 60 },
      { name: "Saç boyama", description: "Peşəkar saç boyama xidməti", price: 70, duration: 120 },
    ],
  },
  {
    name: "Kamran Santexnik",
    service: "Santexnik",
    area: "Xətai",
    phone: "+994501110006",
    services: [
      { name: "Kran təmiri", description: "Kran və su sızması təmiri", price: 15, duration: 45 },
      { name: "Santexnika quraşdırılması", description: "Yeni santexnika avadanlığının quraşdırılması", price: 30, duration: 60 },
    ],
  },
  {
    name: "Rəşad Auto Wash",
    service: "Avtoyuma",
    area: "Yasamal",
    phone: "+994501110007",
    services: [
      { name: "Standart yuma", description: "Avtomobilin xarici yuyulması", price: 10, duration: 30 },
      { name: "Kompleks yuma", description: "Xarici və daxili təmizlik", price: 20, duration: 60 },
    ],
  },
  {
    name: "Turbo Servis",
    service: "Avtoservis",
    area: "Nizami",
    phone: "+994501110008",
    services: [
      { name: "Diaqnostika", description: "Avtomobil kompüter diaqnostikası", price: 20, duration: 30 },
      { name: "Yağ dəyişimi", description: "Mühərrik yağı dəyişimi", price: 30, duration: 45 },
      { name: "Əyləc sistemi", description: "Əyləc sisteminin yoxlanılması", price: 40, duration: 60 },
    ],
  },
  {
    name: "Nərgiz müəllimə",
    service: "Repetitor",
    area: "Nəsimi",
    phone: "+994501110009",
    services: [
      { name: "Fərdi dərs", description: "Bir şagird üçün fərdi dərs", price: 20, duration: 60 },
      { name: "İmtahan hazırlığı", description: "İmtahanlara xüsusi hazırlıq", price: 30, duration: 90 },
    ],
  },
  {
    name: "Paws Grooming",
    service: "Grooming",
    area: "Nərimanov",
    phone: "+994501110010",
    services: [
      { name: "Kiçik cins grooming", description: "Kiçik itlər üçün grooming", price: 30, duration: 60 },
      { name: "Böyük cins grooming", description: "Böyük itlər üçün grooming", price: 50, duration: 90 },
    ],
  },
  {
    name: "iFix Telefon",
    service: "Telefon təmiri",
    area: "Nəsimi",
    phone: "+994501110011",
    services: [
      { name: "Ekran dəyişmə", description: "Telefon ekranının dəyişdirilməsi", price: 60, duration: 45 },
      { name: "Batareya dəyişmə", description: "Telefon batareyasının dəyişdirilməsi", price: 35, duration: 30 },
    ],
  },
  {
    name: "Tural Trainer",
    service: "Trainer",
    area: "Xətai",
    phone: "+994501110012",
    services: [
      { name: "Fərdi məşq", description: "Şəxsi məşqçi ilə fərdi məşq", price: 30, duration: 60 },
      { name: "10 məşqlik paket", description: "10 fərdi məşqdən ibarət paket", price: 250, duration: 600 },
    ],
  },
  {
    name: "Leyla Yoga",
    service: "Yoga",
    area: "Səbail",
    phone: "+994501110013",
    services: [
      { name: "Qrup dərsi", description: "Qrup şəklində yoga dərsi", price: 15, duration: 60 },
      { name: "Fərdi dərs", description: "Şəxsi yoga məşqi", price: 40, duration: 60 },
    ],
  },
];

/* ========================================================
   KÖMƏKÇİ: ad → email slug
   ======================================================== */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ə/g, "e")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  console.log("Seed başladı...");

  /* ---------- ƏRAZİLƏR ---------- */

  const areaMap = new Map<string, string>();

  for (const name of AREA_NAMES) {
    const area = await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name, type: "district" },
    });

    areaMap.set(name, area.id);
  }

  console.log(`${areaMap.size} ərazi yaradıldı/mövcuddur.`);

  /* ---------- KATEQORİYALAR (parent + child) ---------- */

  const childCategoryMap = new Map<string, string>();

  for (const parent of CATEGORIES) {
    const existingParent = await prisma.category.findFirst({
      where: { name: parent.name, parentId: null },
    });

    const parentRecord =
      existingParent ??
      (await prisma.category.create({
        data: { name: parent.name },
      }));

    for (const childName of parent.services) {
      const existingChild = await prisma.category.findFirst({
        where: { name: childName, parentId: parentRecord.id },
      });

      const childRecord =
        existingChild ??
        (await prisma.category.create({
          data: { name: childName, parentId: parentRecord.id },
        }));

      childCategoryMap.set(childName, childRecord.id);
    }
  }

  console.log(`${childCategoryMap.size} xidmət kateqoriyası yaradıldı/mövcuddur.`);

  /* ---------- PROVIDER-LƏR (User + Business + Service) ---------- */

  const defaultPassword = await bcrypt.hash("parol123", 10);

  for (const provider of PROVIDERS) {
    const email = `${slugify(provider.name)}@azlink.demo`;
    const areaId = areaMap.get(provider.area);

    if (!areaId) {
      console.warn(`Ərazi tapılmadı: ${provider.area} (${provider.name})`);
      continue;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    const user =
      existingUser ??
      (await prisma.user.create({
        data: {
          name: provider.name,
          email,
          password: defaultPassword,
          role: Role.BUSINESS,
          phone: provider.phone,
        },
      }));

    const existingBusiness = await prisma.business.findUnique({
      where: { userId: user.id },
    });

    const business =
      existingBusiness ??
      (await prisma.business.create({
        data: {
          userId: user.id,
          name: provider.name,
          areaId,
          phone: provider.phone,
        },
      }));

    for (const service of provider.services) {
      const categoryId = childCategoryMap.get(provider.service);

      if (!categoryId) {
        console.warn(`Kateqoriya tapılmadı: ${provider.service} (${service.name})`);
        continue;
      }

      const existingService = await prisma.service.findFirst({
        where: { businessId: business.id, name: service.name },
      });

      if (!existingService) {
        await prisma.service.create({
          data: {
            businessId: business.id,
            categoryId,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
          },
        });
      }
    }
  }

  console.log(`${PROVIDERS.length} provider (User + Business + Service) yaradıldı/mövcuddur.`);
  console.log("Seed tamamlandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });