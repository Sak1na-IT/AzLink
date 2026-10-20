import { BookingStatus, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ========================================================
   ƏRAZİLƏR
   ======================================================== */

const AREA_NAMES = [
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
  /* Profil səhifəsindəki "Haqqında" mətni */
  about: string;
  verified?: boolean;
  services: SeedService[];
};

const PROVIDERS: SeedProvider[] = [
  {
    name: "Nail by Aysel",
    service: "Dırnaq",
    area: "Nərimanov",
    phone: "+994501110001",
    about:
      "8 ildir manikür və pedikürlə məşğulam. Nərimanov metrosunun yaxınlığında rahat, steril kabinetdə işləyirəm: bütün alətlər hər müştəridən sonra sterilizasiya olunur. Gel lak, fransız manikürü və fərdi dizaynlar. Rezervi əvvəlcədən etsəniz, gözləmədən qəbul edirəm.",
    services: [
      { name: "Manikür", description: "Klassik manikür xidməti", price: 20, duration: 45 },
      { name: "Pedikür", description: "Tam pedikür xidməti", price: 30, duration: 60 },
      { name: "Dırnaq dizaynı", description: "Dırnaq üçün xüsusi dizayn", price: 25, duration: 60 },
      { name: "Gel lak", description: "Manikür və 3 həftəyə qədər dayanan gel lak", price: 30, duration: 60 },
      { name: "Fransız manikürü", description: "Klassik fransız üslubunda manikür", price: 28, duration: 60 },
      { name: "Dırnaq uzatma", description: "Gel ilə dırnaq uzatma və formalaşdırma", price: 45, duration: 90 },
    ],
  },
  {
    name: "Studio Nigar",
    service: "Makiyaj",
    area: "Yasamal",
    phone: "+994501110002",
    about:
      "Gündəlik, gecə və gəlin makiyajı. Lüks brendlərin dayanıqlı kosmetikası ilə işləyirəm, makiyaj bütün gün təravətini saxlayır. Gəlin makiyajı üçün əvvəlcədən sınaq görüşü təklif edirəm.",
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
    about:
      "Mənzil və ofislərin peşəkar təmizliyi. Komandamız öz avadanlığı və ekoloji təmiz vasitələrlə gəlir. Təmirdən sonrakı təmizlik və dərin təmizlik də edirik.",
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
    about:
      "Portret, ailə və tədbir çəkilişləri. Fotosessiyadan sonra 5 iş günü ərzində işlənmiş şəkilləri onlayn albomda təqdim edirəm. Studiya və açıq havada çəkiliş mümkündür.",
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
    about:
      "Qadın saç kəsimi, boyama və saç düzümü. Saçın tipinə uyğun rəng və forma seçməkdə kömək edirəm. Peşəkar, saça zərər verməyən boyalarla işləyirəm.",
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
    about:
      "15 illik təcrübəli santexnik. Kran, unitaz, su qızdırıcısı və boruların təmiri, yeni avadanlığın quraşdırılması. Xətai və yaxın rayonlara eyni gün gəlirəm.",
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
    about:
      "Əl ilə avtomobil yuması: xarici yuma, salon təmizliyi və kimyəvi təmizlik. Növbə gözləməmək üçün vaxtınızı əvvəlcədən rezerv edin.",
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
    about:
      "Kompüter diaqnostikası, yağ dəyişimi, əyləc və asqı sistemi. Bütün işlərə zəmanət veririk, istifadə olunan hissələr göstərilir.",
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
    about:
      "Riyaziyyat üzrə fərdi dərslər və buraxılış, qəbul imtahanlarına hazırlıq. 12 illik müəllimlik təcrübəsi. Dərslər həm əyani, həm onlayn keçirilə bilər.",
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
    about:
      "İt və pişiklər üçün grooming: yuma, qırxma, dırnaq kəsimi və qulaq təmizliyi. Heyvanlarla səbirli və diqqətli işləyirik, stres yaratmadan.",
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
    about:
      "iPhone və Android telefonların təmiri: ekran, batareya, şarj portu və kamera. Əksər təmirlər eyni gün, 30–60 dəqiqəyə hazır olur. Bütün hissələrə 3 ay zəmanət.",
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
    about:
      "Sertifikatlı fərdi məşqçi. Arıqlama, əzələ yığma və formada qalmaq üçün fərdi proqram və qidalanma tövsiyələri. Məşqlər idman zalında və ya açıq havada.",
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
    about:
      "Başlayanlar və orta səviyyə üçün hatha yoga. Qrup dərsləri kiçik qruplarla (8 nəfərə qədər), fərdi dərslər isə sizə uyğun vaxtda.",
    verified: false,
    services: [
      { name: "Qrup dərsi", description: "Qrup şəklində yoga dərsi", price: 15, duration: 60 },
      { name: "Fərdi dərs", description: "Şəxsi yoga məşqi", price: 40, duration: 60 },
    ],
  },
];

/* ========================================================
   DEMO MÜŞTƏRİLƏR
   "musteri@azlink.demo" təqdimat hesabıdır: keçmiş rezervləri,
   rəyləri, seçilmişləri, bildirişləri var. Bir tamamlanmış rezervinə
   bilərəkdən rəy yazılmayıb ki, təqdimatda canlı rəy yazmaq olsun.
   ======================================================== */

const DEMO_PASSWORD = "parol123";

/* Təqdimat hesabının adı (köhnə seed "Demo Müştəri" yazırdı) */
const DEMO_CUSTOMER_NAME = "Aytən Məmmədova";

const CUSTOMERS = [
  { key: "demo", name: DEMO_CUSTOMER_NAME, email: "musteri@azlink.demo" },
  { key: "nigar", name: "Nigar Əliyeva", email: "nigar@azlink.demo" },
  { key: "leyla", name: "Leyla Həsənova", email: "leyla@azlink.demo" },
  { key: "gunel", name: "Günel Rzayeva", email: "gunel@azlink.demo" },
  { key: "aysu", name: "Aysu Məmmədova", email: "aysu@azlink.demo" },
  { key: "kamala", name: "Kamalə Quliyeva", email: "kamala@azlink.demo" },
  { key: "fidan", name: "Fidan Babayeva", email: "fidan@azlink.demo" },
  { key: "orxan", name: "Orxan İsmayılov", email: "orxan@azlink.demo" },
  { key: "elvin", name: "Elvin Hüseynov", email: "elvin@azlink.demo" },
  { key: "sebine", name: "Səbinə Kərimova", email: "sebine@azlink.demo" },
  { key: "murad", name: "Murad Əhmədov", email: "murad@azlink.demo" },
  { key: "narmin", name: "Nərmin Cəfərova", email: "narmin@azlink.demo" },
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
  /* ---- Əlavə rəylər: hər biznesin real görünən reytinqi olsun ---- */
  { provider: "Nail by Aysel", customer: "aysu", service: "Gel lak", date: "2026-08-25", time: "12:00", rating: 5, comment: "Gel lak 3 həftədir ki, heç qopmayıb. Aysel xanım çox diqqətlidir." },
  { provider: "Nail by Aysel", customer: "kamala", service: "Dırnaq uzatma", date: "2026-08-28", time: "14:00", rating: 5, comment: "Dırnaqlar çox təbii alındı, forma tam istədiyim kimi oldu." },
  { provider: "Nail by Aysel", customer: "sebine", service: "Fransız manikürü", date: "2026-09-02", time: "16:00", rating: 4, comment: "Nəticə gözəl idi, sadəcə 10 dəqiqə gözləməli oldum." },
  { provider: "Nail by Aysel", customer: "narmin", service: "Manikür", date: "2026-09-05", time: "11:00", rating: 5, comment: "Kabinet çox təmizdir, alətləri gözümün qabağında açdı. Rahat oldum." },
  { provider: "Nail by Aysel", customer: "fidan", service: "Gel lak", date: "2026-09-26", time: "13:00", rating: 5, comment: "Rəng seçimində çox kömək etdi, artıq daimi müştərisiyəm." },
  { provider: "Nail by Aysel", customer: "aysu", service: "Dırnaq dizaynı", date: "2026-10-01", time: "15:00", rating: 5, comment: "Toy üçün dizayn etdirdim, hamı soruşurdu harada etdirmisən." },
  { provider: "Nail by Aysel", customer: "leyla", service: "Gel lak", date: "2026-10-06", time: "12:00", rating: 4, comment: "Keyfiyyətli işdir, qiymət də münasibdir." },
  { provider: "Nail by Aysel", customer: "kamala", service: "Pedikür", date: "2026-10-10", time: "17:00", rating: 5, comment: "Pedikürdən sonra ayaqlarım tamam dincəldi, təşəkkürlər!" },

  { provider: "Studio Nigar", customer: "aysu", service: "Gəlin makiyajı", date: "2026-08-22", time: "10:00", rating: 5, comment: "Toy günümdə gecə yarısına qədər makiyaj pozulmadı. Sınaq görüşü də çox faydalı oldu." },
  { provider: "Studio Nigar", customer: "narmin", service: "Gecə makiyajı", date: "2026-09-29", time: "17:00", rating: 4, comment: "Gözəl alındı, amma bir az daha yüngül istəyərdim." },
  { provider: "Studio Nigar", customer: "sebine", service: "Gündəlik makiyaj", date: "2026-10-08", time: "11:00", rating: 5, comment: "Təbii və səliqəli. Hansı məhsulları işlətdiyini də izah etdi." },

  { provider: "CleanPro", customer: "orxan", service: "Dərin təmizlik", date: "2026-08-28", time: "10:00", rating: 5, comment: "Təmirdən sonra evi tanınmaz hala gətirdilər. Pəncərələr belə parıldayır." },
  { provider: "CleanPro", customer: "kamala", service: "Ev təmizliyi", date: "2026-09-24", time: "11:00", rating: 4, comment: "Yaxşı təmizlədilər, sadəcə yarım saat gec gəldilər." },
  { provider: "CleanPro", customer: "elvin", service: "Ev təmizliyi", date: "2026-10-13", time: "14:00", rating: 5, comment: "Ofisimizi təmizlətdik, çox razı qaldıq. Yenə müraciət edəcəyik." },

  { provider: "Ali Photography", customer: "kamala", service: "Tədbir çəkilişi", date: "2026-08-22", time: "15:00", rating: 5, comment: "Ad günü çəkilişi idi, şəkillər 4 gündə hazır oldu. Çox canlı alınıb." },
  { provider: "Ali Photography", customer: "murad", service: "Portret çəkilişi", date: "2026-09-26", time: "12:00", rating: 5, comment: "CV və LinkedIn üçün portret çəkdirdim, peşəkar işdir." },
  { provider: "Ali Photography", customer: "sebine", service: "Portret çəkilişi", date: "2026-10-03", time: "16:00", rating: 4, comment: "Şəkillər gözəldir, işlənməsi bir az uzun çəkdi." },

  { provider: "Vüsalə Hair", customer: "aysu", service: "Saç düzümü", date: "2026-08-22", time: "10:00", rating: 5, comment: "Nişan üçün saç düzümü etdirdim, axşama qədər qaldı." },
  { provider: "Vüsalə Hair", customer: "narmin", service: "Saç kəsimi", date: "2026-09-29", time: "13:00", rating: 5, comment: "Üzümə uyğun forma tövsiyə etdi, çox xoşuma gəldi." },
  { provider: "Vüsalə Hair", customer: "fidan", service: "Saç boyama", date: "2026-10-10", time: "11:00", rating: 3, comment: "Rəng bir az tünd alındı, amma sonradan pulsuz düzəltdi." },

  { provider: "Kamran Santexnik", customer: "orxan", service: "Kran təmiri", date: "2026-08-25", time: "11:00", rating: 5, comment: "Eyni gün gəldi, 20 dəqiqəyə sızmanı düzəltdi." },
  { provider: "Kamran Santexnik", customer: "elvin", service: "Santexnika quraşdırılması", date: "2026-09-05", time: "14:00", rating: 5, comment: "Yeni unitazı və lavabonu səliqə ilə quraşdırdı, arxasınca da təmizlədi." },
  { provider: "Kamran Santexnik", customer: "murad", service: "Kran təmiri", date: "2026-10-01", time: "18:00", rating: 4, comment: "İşini bilir, qiyməti də əvvəlcədən dedi." },
  { provider: "Kamran Santexnik", customer: "gunel", service: "Kran təmiri", date: "2026-10-15", time: "10:00", rating: 5, comment: "Çox nəzakətli usta, tövsiyə edirəm." },

  { provider: "Rəşad Auto Wash", customer: "orxan", service: "Kompleks yuma", date: "2026-09-02", time: "12:00", rating: 5, comment: "Salon da, kuzov da tərtəmiz oldu. Növbəsiz qəbul etdilər." },
  { provider: "Rəşad Auto Wash", customer: "murad", service: "Standart yuma", date: "2026-09-24", time: "17:00", rating: 4, comment: "Sürətli və keyfiyyətli. Qiyməti də sərfəlidir." },
  { provider: "Rəşad Auto Wash", customer: "elvin", service: "Kompleks yuma", date: "2026-10-08", time: "13:00", rating: 4, comment: "Yaxşı yudular, sadəcə arxa oturacaqda bir az ləkə qaldı." },
  { provider: "Rəşad Auto Wash", customer: "sebine", service: "Standart yuma", date: "2026-10-17", time: "11:00", rating: 5, comment: "Rezerv etdiyim üçün heç gözləmədim, çox rahatdır." },

  { provider: "Turbo Servis", customer: "orxan", service: "Diaqnostika", date: "2026-09-29", time: "10:00", rating: 5, comment: "Problemi tez tapdılar və lazımsız iş təklif etmədilər." },
  { provider: "Turbo Servis", customer: "murad", service: "Əyləc sistemi", date: "2026-10-06", time: "15:00", rating: 4, comment: "Əyləc kolodkalarını dəyişdilər, köhnələrini də göstərdilər." },
  { provider: "Turbo Servis", customer: "elvin", service: "Yağ dəyişimi", date: "2026-10-15", time: "12:00", rating: 4, comment: "Normal xidmət, vaxtında bitdi." },

  { provider: "Nərgiz müəllimə", customer: "kamala", service: "Fərdi dərs", date: "2026-09-24", time: "17:00", rating: 5, comment: "Oğlumun riyaziyyatdan qiymətləri bir ayda yaxşılaşdı." },
  { provider: "Nərgiz müəllimə", customer: "fidan", service: "İmtahan hazırlığı", date: "2026-10-13", time: "18:00", rating: 5, comment: "Buraxılış imtahanına hazırlıq üçün ən yaxşı müəllimdir." },

  { provider: "Paws Grooming", customer: "aysu", service: "Kiçik cins grooming", date: "2026-09-02", time: "11:00", rating: 5, comment: "Pişiyimi də qəbul etdilər, çox ehtiyatlı davrandılar." },
  { provider: "Paws Grooming", customer: "orxan", service: "Böyük cins grooming", date: "2026-09-26", time: "14:00", rating: 4, comment: "Labradorumuz çox gözəl görünür, sadəcə bir az gec bitdi." },
  { provider: "Paws Grooming", customer: "narmin", service: "Kiçik cins grooming", date: "2026-10-17", time: "12:00", rating: 5, comment: "Hər dəfə buraya gəlirik, itimiz artıq qorxmur." },

  { provider: "iFix Telefon", customer: "murad", service: "Batareya dəyişmə", date: "2026-08-28", time: "16:00", rating: 5, comment: "Yarım saata dəyişdilər, telefon yenisi kimi işləyir." },
  { provider: "iFix Telefon", customer: "elvin", service: "Ekran dəyişmə", date: "2026-09-29", time: "13:00", rating: 4, comment: "Ekran orijinala çox yaxındır, zəmanət də verdilər." },
  { provider: "iFix Telefon", customer: "leyla", service: "Batareya dəyişmə", date: "2026-10-10", time: "15:00", rating: 5, comment: "Sürətli və etibarlı. Qiyməti əvvəlcədən dəqiq dedilər." },

  { provider: "Tural Trainer", customer: "murad", service: "10 məşqlik paket", date: "2026-08-25", time: "10:00", rating: 5, comment: "Bir ayda 5 kq atdım, proqramı çox düzgün qurur." },
  { provider: "Tural Trainer", customer: "elvin", service: "Fərdi məşq", date: "2026-09-24", time: "19:00", rating: 5, comment: "Hər hərəkəti düzgün göstərir, motivasiya verir." },
  { provider: "Tural Trainer", customer: "sebine", service: "Fərdi məşq", date: "2026-10-06", time: "18:00", rating: 4, comment: "Yaxşı məşqçidir, sadəcə vaxt seçimi bir az çətindir." },
  { provider: "Tural Trainer", customer: "orxan", service: "Fərdi məşq", date: "2026-10-15", time: "19:00", rating: 5, comment: "Qidalanma tövsiyələri də çox faydalı oldu." },

  { provider: "Leyla Yoga", customer: "narmin", service: "Qrup dərsi", date: "2026-09-26", time: "10:00", rating: 5, comment: "Rahat atmosfer, kiçik qrup. Başlayanlar üçün idealdır." },
  { provider: "Leyla Yoga", customer: "fidan", service: "Fərdi dərs", date: "2026-10-03", time: "12:00", rating: 4, comment: "Bel ağrım üçün xüsusi hərəkətlər göstərdi." },
  { provider: "Leyla Yoga", customer: "kamala", service: "Qrup dərsi", date: "2026-10-17", time: "10:00", rating: 5, comment: "Hər şənbə gəlirəm, həftənin ən sevimli saatıdır." },

  /* ---- Təqdimat hesabının (musteri@azlink.demo) keçmiş rəyləri ---- */
  { provider: "Nail by Aysel", customer: "demo", service: "Manikür", date: "2026-09-24", time: "12:00", rating: 5, comment: "Hər şey çox səliqəli idi, növbəti dəfə gel lak üçün gələcəyəm." },
  { provider: "Vüsalə Hair", customer: "demo", service: "Saç kəsimi", date: "2026-10-03", time: "11:00", rating: 5, comment: "Saçımı çox gözəl kəsdi, tam istədiyim kimi." },
  { provider: "CleanPro", customer: "demo", service: "Ev təmizliyi", date: "2026-09-26", time: "10:00", rating: 4, comment: "Ev təmiz oldu, sadəcə mətbəxdə bir az vaxt itirdilər." },
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

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/*
 * Bu gündən "days" gün sonra, göstərilən saatda. Bazar günü bağlı
 * olduğu üçün Bazar ertəsinə keçirilir. Təqdimat günündən asılı
 * olmayaraq gələcək rezervlər həmişə gələcəkdə olur.
 */
const fromToday = (days: number, time: string) => {
  const date = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hours, minutes, 0, 0);

  if (date.getUTCDay() === 0) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
};

const MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avq", "sen", "okt", "noy", "dek",
];

/* Backend-in bildiriş mətnləri ilə eyni format: "21 okt, 14:00" */
const formatDate = (date: Date) =>
  `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}, ${String(
    date.getUTCHours()
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;

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

    const description = provider.about;
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
      /* Köhnə seed-in "Demo Müştəri" adı real adla əvəz olunur */
      update: customer.key === "demo" ? { name: customer.name } : {},
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
          /* Rezerv adətən bir neçə gün əvvəldən edilir */
          createdAt: new Date(date.getTime() - 3 * DAY_MS),
        },
      }));

    /* Rəy xidmətdən bir neçə saat sonra yazılmış kimi görünür */
    const reviewedAt = new Date(date.getTime() + 4 * HOUR_MS);

    await prisma.review.upsert({
      where: { bookingId: booking.id },
      update: { createdAt: reviewedAt },
      create: {
        bookingId: booking.id,
        userId: customerId,
        businessId,
        rating: item.rating,
        comment: item.comment,
        createdAt: reviewedAt,
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

  await seedDemoScenario(businessIdByName, customerIdByKey);

  console.log("Seed tamamlandı.");
  console.log("");
  console.log("Demo hesablar (parol hamısı üçün: parol123):");
  console.log("  Müştəri: musteri@azlink.demo");
  console.log("  Biznes:  nail-by-aysel@azlink.demo");
}

/* ========================================================
   TƏQDİMAT SSENARİSİ
   musteri@azlink.demo və Nail by Aysel üçün canlı görünən məlumat:
   gələcək rezervlər, ləğv edilmiş rezerv, seçilmişlər, son baxılanlar
   və bildirişlər. Təkrar işlədəndə ikiqat yaranmır.
   ======================================================== */

type BookingPlan = {
  provider: string;
  customer: string;
  service: string;
  date: Date;
  status: BookingStatus;
  /*
   * "date": eyni tarixli rezerv varsa yenisi yaranmır (sabit tarixlər).
   * "status": bu müştərinin bu xidmətə həmin statusda rezervi varsa
   * yenisi yaranmır (bu gündən hesablanan tarixlər üçün).
   */
  matchBy: "date" | "status";
};

async function seedDemoScenario(
  businessIdByName: Map<string, string>,
  customerIdByKey: Map<string, string>
) {
  const ensureBooking = async (plan: BookingPlan) => {
    const businessId = businessIdByName.get(plan.provider);
    const customerId = customerIdByKey.get(plan.customer);

    if (!businessId || !customerId) {
      console.warn(`Rezerv üçün biznes/müştəri tapılmadı: ${plan.provider}`);
      return null;
    }

    const service = await prisma.service.findFirst({
      where: { businessId, name: plan.service },
    });

    if (!service) {
      console.warn(`Rezerv üçün xidmət tapılmadı: ${plan.service}`);
      return null;
    }

    const existing = await prisma.booking.findFirst({
      where: {
        customerId,
        businessId,
        serviceId: service.id,
        ...(plan.matchBy === "date"
          ? { date: plan.date }
          : { status: plan.status }),
      },
      include: { service: true, business: true, customer: true },
    });

    if (existing) {
      return existing;
    }

    return prisma.booking.create({
      data: {
        customerId,
        businessId,
        serviceId: service.id,
        date: plan.date,
        status: plan.status,
        createdAt: new Date(
          Math.min(Date.now(), plan.date.getTime()) - 2 * DAY_MS
        ),
      },
      include: { service: true, business: true, customer: true },
    });
  };

  /* Eyni mətnli bildiriş varsa yenisi yaranmır */
  const ensureNotification = async (
    userId: string,
    message: string,
    link: string,
    isRead: boolean,
    createdAt: Date
  ) => {
    const existing = await prisma.notification.findFirst({
      where: { userId, message },
    });

    if (!existing) {
      await prisma.notification.create({
        data: { userId, message, link, isRead, createdAt },
      });
    }
  };

  const demoId = customerIdByKey.get("demo");
  const ayselId = businessIdByName.get("Nail by Aysel");

  if (!demoId || !ayselId) {
    return;
  }

  const ayselBusiness = await prisma.business.findUnique({
    where: { id: ayselId },
  });

  if (!ayselBusiness) {
    return;
  }

  const ayselOwnerId = ayselBusiness.userId;

  /* ---------- Təqdimat hesabının keçmişi ---------- */

  /* Rəy yazılmayıb: təqdimatda canlı rəy yazmaq üçün */
  const unreviewed = await ensureBooking({
    provider: "Nail by Aysel",
    customer: "demo",
    service: "Dırnaq dizaynı",
    date: at("2026-10-15", "14:00"),
    status: BookingStatus.COMPLETED,
    matchBy: "date",
  });

  await ensureBooking({
    provider: "Turbo Servis",
    customer: "demo",
    service: "Diaqnostika",
    date: at("2026-10-08", "10:00"),
    status: BookingStatus.CANCELLED,
    matchBy: "date",
  });

  /* ---------- Gələcək rezervlər (bu gündən hesablanır) ---------- */

  const demoAysel = await ensureBooking({
    provider: "Nail by Aysel",
    customer: "demo",
    service: "Gel lak",
    date: fromToday(5, "16:00"),
    status: BookingStatus.CONFIRMED,
    matchBy: "status",
  });

  const demoNigar = await ensureBooking({
    provider: "Studio Nigar",
    customer: "demo",
    service: "Gündəlik makiyaj",
    date: fromToday(4, "13:00"),
    status: BookingStatus.CONFIRMED,
    matchBy: "status",
  });

  await ensureBooking({
    provider: "Nail by Aysel",
    customer: "leyla",
    service: "Pedikür",
    date: fromToday(1, "11:00"),
    status: BookingStatus.CONFIRMED,
    matchBy: "status",
  });

  await ensureBooking({
    provider: "Nail by Aysel",
    customer: "kamala",
    service: "Dırnaq uzatma",
    date: fromToday(3, "14:00"),
    status: BookingStatus.CONFIRMED,
    matchBy: "status",
  });

  /* İkinci gözləyən rezerv (birincisi Nigarındır, yuxarıda) */
  const aysuPending = await ensureBooking({
    provider: "Nail by Aysel",
    customer: "aysu",
    service: "Gel lak",
    date: fromToday(2, "12:00"),
    status: BookingStatus.PENDING,
    matchBy: "status",
  });

  const fidanCancelled = await ensureBooking({
    provider: "Nail by Aysel",
    customer: "fidan",
    service: "Pedikür",
    date: fromToday(2, "17:00"),
    status: BookingStatus.CANCELLED,
    matchBy: "status",
  });

  console.log("Təqdimat rezervləri yaradıldı/mövcuddur.");

  /* ---------- Seçilmişlər ---------- */

  for (const name of ["Nail by Aysel", "Studio Nigar", "Leyla Yoga", "Paws Grooming"]) {
    const businessId = businessIdByName.get(name);

    if (businessId) {
      await prisma.savedProvider.upsert({
        where: { userId_businessId: { userId: demoId, businessId } },
        update: {},
        create: { userId: demoId, businessId },
      });
    }
  }

  /* ---------- Son baxdıqlarınız ---------- */

  const recent: [string, number][] = [
    ["Nail by Aysel", 1],
    ["Ali Photography", 5],
    ["Studio Nigar", 26],
    ["iFix Telefon", 50],
  ];

  for (const [name, hoursAgo] of recent) {
    const businessId = businessIdByName.get(name);

    if (businessId) {
      const viewedAt = new Date(Date.now() - hoursAgo * HOUR_MS);

      await prisma.recentView.upsert({
        where: { userId_businessId: { userId: demoId, businessId } },
        update: { viewedAt },
        create: { userId: demoId, businessId, viewedAt },
      });
    }
  }

  /* ---------- Bildirişlər ---------- */

  const now = Date.now();

  if (demoAysel) {
    await ensureNotification(
      demoId,
      `Nail by Aysel rezervinizi təsdiqlədi: Gel lak · ${formatDate(demoAysel.date)}.`,
      "/bookings",
      false,
      new Date(now - 2 * HOUR_MS)
    );
  }

  if (demoNigar) {
    await ensureNotification(
      demoId,
      `Studio Nigar rezervinizi təsdiqlədi: Gündəlik makiyaj · ${formatDate(demoNigar.date)}.`,
      "/bookings",
      false,
      new Date(now - 20 * HOUR_MS)
    );
  }

  if (unreviewed) {
    await ensureNotification(
      demoId,
      "Nail by Aysel ilə rezerviniz tamamlandı. Rəy yazmağı unutmayın!",
      "/bookings",
      false,
      new Date(unreviewed.date.getTime() + 2 * HOUR_MS)
    );
  }

  await ensureNotification(
    demoId,
    "Vüsalə Hair ilə rezerviniz tamamlandı. Rəy yazmağı unutmayın!",
    "/bookings",
    true,
    at("2026-10-03", "13:00")
  );

  /* Seed-in köhnə hissəsinin yaratdığı gözləyən rezerv (Nigar, Manikür) */
  const nigarPending = await ensureBooking({
    provider: "Nail by Aysel",
    customer: "nigar",
    service: "Manikür",
    date: fromToday(1, "15:00"),
    status: BookingStatus.PENDING,
    matchBy: "status",
  });

  if (nigarPending) {
    await ensureNotification(
      ayselOwnerId,
      `Yeni rezerv: Nigar Əliyeva, Manikür · ${formatDate(nigarPending.date)}. Təsdiqləməyi unutmayın.`,
      "/business/bookings",
      false,
      new Date(now - 5 * HOUR_MS)
    );
  }

  if (aysuPending) {
    await ensureNotification(
      ayselOwnerId,
      `Yeni rezerv: Aysu Məmmədova, Gel lak · ${formatDate(aysuPending.date)}. Təsdiqləməyi unutmayın.`,
      "/business/bookings",
      false,
      new Date(now - 3 * HOUR_MS)
    );
  }

  if (fidanCancelled) {
    await ensureNotification(
      ayselOwnerId,
      `Fidan Babayeva rezervi ləğv etdi: Pedikür · ${formatDate(fidanCancelled.date)}.`,
      "/business/bookings",
      true,
      new Date(now - 26 * HOUR_MS)
    );
  }

  await ensureNotification(
    ayselOwnerId,
    `${DEMO_CUSTOMER_NAME} sizə 5 ulduzlu rəy yazdı.`,
    "/business/reviews",
    true,
    at("2026-09-24", "16:00")
  );

  console.log("Seçilmişlər, son baxılanlar və bildirişlər yaradıldı/mövcuddur.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });