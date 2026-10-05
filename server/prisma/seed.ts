import { BookingStatus, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ========================================================
   ƏRAZİLƏR
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
   Hər parent kateqoriyanın "services" siyahısı uşaq
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
   BİZNESLƏR (demo)
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
  verified?: boolean;
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
    verified: false,
    services: [
      { name: "Qrup dərsi", description: "Qrup şəklində yoga dərsi", price: 15, duration: 60 },
      { name: "Fərdi dərs", description: "Şəxsi yoga məşqi", price: 40, duration: 60 },
    ],
  },
];

/* ========================================================
   DEMO MÜŞTƏRİLƏR
   "musteri@azlink.demo" heç bir rezervi olmayan təmiz hesabdır:
   təqdimatda canlı rezerv yaratmaq üçün.
   ======================================================== */

const DEMO_PASSWORD = "parol123";

const CUSTOMERS = [
  { key: "demo", name: "Demo Müştəri", email: "musteri@azlink.demo" },
  { key: "nigar", name: "Nigar Əliyeva", email: "nigar@azlink.demo" },
  { key: "leyla", name: "Leyla Həsənova", email: "leyla@azlink.demo" },
  { key: "gunel", name: "Günel Rzayeva", email: "gunel@azlink.demo" },
];

/* ========================================================
   DEMO REZERVLƏR VƏ RƏYLƏR
   Hər rəy tamamlanmış (COMPLETED) bir rezerv üzərindədir.
   Tarixlər sabitdir, ona görə seed təkrar işləsə ikiqat yaranmır.
   ======================================================== */

type SeedReview = {
  provider: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  rating: number;
  comment: string;
};

const DEMO_REVIEWS: SeedReview[] = [
  { provider: "Nail by Aysel", customer: "nigar", service: "Manikür", date: "2026-09-10", time: "11:00", rating: 5, comment: "Çox səliqəli və təmiz iş, məmnun qaldım." },
  { provider: "Nail by Aysel", customer: "leyla", service: "Pedikür", date: "2026-09-14", time: "13:00", rating: 5, comment: "Vaxtında başladı, nəticə əla oldu." },
  { provider: "Nail by Aysel", customer: "gunel", service: "Dırnaq dizaynı", date: "2026-09-18", time: "15:00", rating: 4, comment: "Dizayn çox xoşuma gəldi, tövsiyə edirəm." },
  { provider: "Studio Nigar", customer: "leyla", service: "Gündəlik makiyaj", date: "2026-09-12", time: "12:00", rating: 5, comment: "Makiyaj dayanıqlı və təbii görünüşlü oldu." },
  { provider: "Studio Nigar", customer: "gunel", service: "Gecə makiyajı", date: "2026-09-20", time: "17:00", rating: 4, comment: "Tədbir üçün əla idi." },
  { provider: "Vüsalə Hair", customer: "nigar", service: "Saç kəsimi", date: "2026-09-11", time: "10:30", rating: 5, comment: "Dəqiq istədiyim kəsimi etdi." },
  { provider: "Vüsalə Hair", customer: "gunel", service: "Saç boyama", date: "2026-09-16", time: "14:00", rating: 4, comment: "Rəng çox yaxşı alındı." },
  { provider: "CleanPro", customer: "leyla", service: "Ev təmizliyi", date: "2026-09-13", time: "11:00", rating: 5, comment: "Evi tərtəmiz etdilər, vaxta əməl olundu." },
  { provider: "Ali Photography", customer: "nigar", service: "Portret çəkilişi", date: "2026-09-15", time: "16:00", rating: 5, comment: "Şəkillər çox keyfiyyətli çıxdı." },
  { provider: "Turbo Servis", customer: "gunel", service: "Yağ dəyişimi", date: "2026-09-17", time: "10:00", rating: 4, comment: "Sürətli və qiymətə uyğun xidmət." },
  { provider: "Nərgiz müəllimə", customer: "leyla", service: "Fərdi dərs", date: "2026-09-09", time: "18:00", rating: 5, comment: "Dərsi çox aydın izah edir." },
  { provider: "Nərgiz müəllimə", customer: "nigar", service: "İmtahan hazırlığı", date: "2026-09-19", time: "17:30", rating: 5, comment: "İmtahana yaxşı hazırlaşdım." },
  { provider: "Paws Grooming", customer: "gunel", service: "Kiçik cins grooming", date: "2026-09-21", time: "12:00", rating: 5, comment: "İtimiz çox rahat oldu, təşəkkürlər." },
  { provider: "iFix Telefon", customer: "nigar", service: "Ekran dəyişmə", date: "2026-09-22", time: "15:00", rating: 4, comment: "Ekran tez dəyişdirildi." },
];

/* ========================================================
   KÖMƏKÇİLƏR
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

/*
 * Bazada tarix və saat "Bakı divar saatı" UTC kimi yazılır
 * (məs. 14:00 → 14:00Z), backend də belə oxuyur.
 */
const at = (date: string, time: string) =>
  new Date(`${date}T${time}:00.000Z`);

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
  /* xidmət kateqoriyasının adı → onun əsas (parent) kateqoriyasının id-si */
  const parentCategoryByChild = new Map<string, string>();

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
      parentCategoryByChild.set(childName, parentRecord.id);
    }
  }

  console.log(`${childCategoryMap.size} xidmət kateqoriyası yaradıldı/mövcuddur.`);

  /* ---------- BİZNESLƏR (User + Business + Service + iş saatları) ---------- */

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const businessIdByName = new Map<string, string>();

  for (const provider of PROVIDERS) {
    const email = `${slugify(provider.name)}@azlink.demo`;
    const areaId = areaMap.get(provider.area);
    const parentCategoryId = parentCategoryByChild.get(provider.service);

    if (!areaId || !parentCategoryId) {
      console.warn(`Ərazi/kateqoriya tapılmadı: ${provider.name}`);
      continue;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    const user =
      existingUser ??
      (await prisma.user.create({
        data: {
          name: provider.name,
          email,
          password: passwordHash,
          role: Role.BUSINESS,
          phone: provider.phone,
        },
      }));

    const description = `${provider.service} sahəsində peşəkar xidmət. ${provider.area} ərazisində.`;
    const verified = provider.verified ?? true;

    const existingBusiness = await prisma.business.findUnique({
      where: { userId: user.id },
    });

    /* Biznesin kateqoriyası: profil və "Yeni xidmət" bunu istifadə edir */
    const business = existingBusiness
      ? await prisma.business.update({
          where: { id: existingBusiness.id },
          data: {
            description,
            verified,
            categories: { set: [{ id: parentCategoryId }] },
          },
        })
      : await prisma.business.create({
          data: {
            userId: user.id,
            name: provider.name,
            areaId,
            phone: provider.phone,
            description,
            verified,
            categories: { connect: [{ id: parentCategoryId }] },
          },
        });

    businessIdByName.set(provider.name, business.id);

    /* Xidmətlər */
    const serviceCategoryId = childCategoryMap.get(provider.service);

    if (!serviceCategoryId) {
      console.warn(`Kateqoriya tapılmadı: ${provider.service}`);
      continue;
    }

    for (const service of provider.services) {
      const existingService = await prisma.service.findFirst({
        where: { businessId: business.id, name: service.name },
      });

      if (!existingService) {
        await prisma.service.create({
          data: {
            businessId: business.id,
            categoryId: serviceCategoryId,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
          },
        });
      }
    }

    /* İş saatları: Bazar ertəsi–Şənbə 10:00–20:00, Bazar bağlı */
    const hoursCount = await prisma.availability.count({
      where: { businessId: business.id },
    });

    if (hoursCount === 0) {
      for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
        await prisma.availability.create({
          data: {
            businessId: business.id,
            dayOfWeek,
            startTime: "10:00",
            endTime: "20:00",
          },
        });
      }
    }
  }

  console.log(`${PROVIDERS.length} biznes yaradıldı/mövcuddur.`);

  /* ---------- DEMO MÜŞTƏRİLƏR ---------- */

  const customerIdByKey = new Map<string, string>();

  for (const customer of CUSTOMERS) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        name: customer.name,
        email: customer.email,
        password: passwordHash,
        role: Role.USER,
      },
    });

    customerIdByKey.set(customer.key, user.id);
  }

  console.log(`${CUSTOMERS.length} demo müştəri yaradıldı/mövcuddur.`);

  /* ---------- TAMAMLANMIŞ REZERVLƏR + RƏYLƏR ---------- */

  for (const item of DEMO_REVIEWS) {
    const businessId = businessIdByName.get(item.provider);
    const customerId = customerIdByKey.get(item.customer);

    if (!businessId || !customerId) {
      console.warn(`Rəy üçün biznes/müştəri tapılmadı: ${item.provider}`);
      continue;
    }

    const service = await prisma.service.findFirst({
      where: { businessId, name: item.service },
    });

    if (!service) {
      console.warn(`Rəy üçün xidmət tapılmadı: ${item.service}`);
      continue;
    }

    const date = at(item.date, item.time);

    const existingBooking = await prisma.booking.findFirst({
      where: { customerId, businessId, serviceId: service.id, date },
    });

    const booking =
      existingBooking ??
      (await prisma.booking.create({
        data: {
          customerId,
          businessId,
          serviceId: service.id,
          date,
          status: BookingStatus.COMPLETED,
        },
      }));

    await prisma.review.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: {
        bookingId: booking.id,
        userId: customerId,
        businessId,
        rating: item.rating,
        comment: item.comment,
      },
    });
  }

  console.log(`${DEMO_REVIEWS.length} tamamlanmış rezerv və rəy yaradıldı/mövcuddur.`);

  /* ---------- GÖZLƏYƏN REZERV (təqdimatda təsdiqləmək üçün) ---------- */

  const aysel = businessIdByName.get("Nail by Aysel");
  const nigar = customerIdByKey.get("nigar");

  if (aysel && nigar) {
    const manikur = await prisma.service.findFirst({
      where: { businessId: aysel, name: "Manikür" },
    });

    const existingPending = await prisma.booking.findFirst({
      where: {
        businessId: aysel,
        customerId: nigar,
        status: BookingStatus.PENDING,
      },
    });

    if (manikur && !existingPending) {
      const next = new Date();
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(15, 0, 0, 0);

      /* Bazar günü bağlıdır, ona görə Bazar ertəsinə keçirik */
      if (next.getUTCDay() === 0) {
        next.setUTCDate(next.getUTCDate() + 1);
      }

      await prisma.booking.create({
        data: {
          customerId: nigar,
          businessId: aysel,
          serviceId: manikur.id,
          date: next,
          status: BookingStatus.PENDING,
        },
      });

      console.log("Nail by Aysel üçün 1 gözləyən rezerv yaradıldı.");
    }
  }

  console.log("Seed tamamlandı.");
  console.log("");
  console.log("Demo hesablar (parol hamısı üçün: parol123):");
  console.log("  Müştəri: musteri@azlink.demo");
  console.log("  Biznes:  nail-by-aysel@azlink.demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });