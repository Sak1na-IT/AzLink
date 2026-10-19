# AzLink

AzLink müxtəlif xidmət sahələri üzrə istifadəçilərin uyğun mütəxəssisləri və bizneslləri tapmasına, profilləri müqayisə etməsinə və uyğun vaxt üçün rezerv yaratmasına imkan verən xidmət platformasıdır. Platforma Bakı şəhəri üçün nəzərdə tutulub.

Platforma yalnız bir kateqoriyaya fokuslanmır. Gözəllik, ev xidmətləri, təhsil, avtomobil, texnologiya, idman və digər sahələr eyni sistem daxilində təqdim olunur. Heç bir kateqoriya digərindən üstün göstərilmir.

**İstifadəçi axını:** Tap → Bax → Müqayisə et → Rezerv et

**Biznes axını:** Qoşul → Profilini qur → Xidmət əlavə et → Rezerv qəbul et

---

## Mündəricat

1. [Texnologiyalar](#texnologiyalar)
2. [İşə salmaq](#işə-salmaq)
3. [Demo məlumat və hesablar](#demo-məlumat-və-hesablar)
4. [Layihə strukturu](#layihə-strukturu)
5. [İstifadəçi tipləri və hesab modeli](#istifadəçi-tipləri-və-hesab-modeli)
6. [Ekranlar və naviqasiya](#ekranlar-və-naviqasiya)
7. [Rezerv qaydaları](#rezerv-qaydaları)
8. [Ərazi seçimi](#ərazi-seçimi)
9. [Dizayn sistemi](#dizayn-sistemi)
10. [Backend API](#backend-api)
11. [Verilənlər bazası](#verilənlər-bazası)
12. [Təhlükəsizlik](#təhlükəsizlik)
13. [Hazırkı vəziyyət](#hazırkı-vəziyyət)
14. [Kod qaydaları](#kod-qaydaları)
15. [Faydalı əmrlər](#faydalı-əmrlər)
16. [Git iş qaydası](#git-iş-qaydası)

---

## Texnologiyalar

### Frontend

- React 19 + TypeScript
- Vite
- React Router (`react-router-dom`)
- Lucide (`lucide-react`) ikonlar üçün
- Sadə CSS (səhifə və komponent CSS faylları), qlobal dəyişənlər `styles/variables.css`-də
- Linter: `oxlint`

### Backend

- Node.js + TypeScript
- Express 5 (REST API)
- Prisma ORM 6
- SQLite (development üçün)
- JWT: access token (15 dəq) və refresh token (7 gün), `jsonwebtoken`
- Şifrə hash-ləmə: `bcryptjs`

---

## İşə salmaq

Tələb olunan: **Node.js 20 və ya daha yeni versiya**.

### 1. Backend

```bash
cd server
npm install
```

`server/.env` faylını yarat (nümunə `server/.env.example`-dadır):

```env
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_ACCESS_SECRET="change-me"
JWT_REFRESH_SECRET="change-me-too"
```

Windows-da kopyalamaq üçün: `copy .env.example .env`. Gizli açarları (`JWT_*`) real dəyərlərlə əvəz et. `.env` faylı Git-ə düşmür.

Bazanı qur və doldur:

```bash
npx prisma migrate dev
npm run seed
npx ts-node --project prisma/tsconfig.json prisma/add-areas.ts
```

- `migrate dev` bazanı yaradır və Prisma Client-i hazırlayır.
- `seed` demo məlumatı yazır (aşağıda [Demo məlumat və hesablar](#demo-məlumat-və-hesablar)).
- `add-areas.ts` Bakının 12 rayonunun hamısının bazada olmasını təmin edir (təkrar işlətmək zərərsizdir).

Serveri işə sal:

```bash
npm run dev
```

Server `http://localhost:4000` ünvanında işə düşür. Yoxlama üçün:

- `http://localhost:4000/api/health` → `{"status":"ok","time":"..."}`
- `http://localhost:4000/api/categories` → kateqoriyalar
- `http://localhost:4000/api/areas` → ərazilər (12 rayon)
- `http://localhost:4000/api/providers` → bizneslər

Backend skriptləri:

| Əmr             | Nə edir                                            |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Serveri izləmə rejimində işə salır (`ts-node-dev`) |
| `npm run build` | TypeScript-i `dist/`-ə kompilyasiya edir           |
| `npm run start` | `dist/index.js`-i işə salır                        |
| `npm run seed`  | Demo məlumatı bazaya yazır                         |

`schema.prisma`-nı redaktə edəndən sonra:

```bash
npx prisma migrate dev --name <qısa-təsvir>
```

### 2. Frontend

Backend ayrı terminalda işləyərkən:

```bash
cd client
npm install
npm run dev
```

Brauzerdə terminalda göstərilən ünvanı aç (adətən `http://localhost:5173`). Frontend `http://localhost:4000/api`-yə bağlanır (`services/api.ts`-dəki `VITE_API_URL`, standart dəyər bu ünvandır). Fərqli port işlədirsinizsə, `client/.env`-də `VITE_API_URL` təyin edin.

Production build və yoxlama:

```bash
cd client
npm run build
```

`tsc -b && vite build` xətasız bitməlidir. Kod keyfiyyəti üçün `npm run lint` də var.

---

## Demo məlumat və hesablar

`server/prisma/seed.ts` bazanı aşağıdakılarla doldurur:

- 8 əsas kateqoriya və onların alt kateqoriyaları (13 xidmət kateqoriyası)
- 13 biznes: hər birinin sahibi (hesabı), kateqoriyası, xidmətləri, iş saatları (B.e–Şənbə 10:00–20:00), təsviri
- 4 müştəri hesabı
- 14 tamamlanmış rezerv və onların rəyləri (reytinq və rəy sayları buradan gəlir)
- `Nail by Aysel` üçün 1 gözləyən rezerv (biznes panelində təsdiqləmək üçün)

Seed təkrar işlədilə bilər: yalnız çatışmayanı əlavə edir, mövcud istifadəçi, xidmət və rezervlərin üzərinə yazmır. Biznesin təsviri, "təsdiqlənib" statusu və kateqoriyası hər dəfə yenilənir.

### Demo hesablar

Bütün demo hesabların parolu: `parol123` (yalnız demo üçündür).

| Rol     | Email                                                                                                                                                                                                                              | Qeyd                                                             |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Müştəri | `musteri@azlink.demo`                                                                                                                                                                                                              | Təmiz hesab, heç bir rezervi yoxdur. Canlı rezerv göstərmək üçün |
| Müştəri | `nigar@azlink.demo`, `leyla@azlink.demo`, `gunel@azlink.demo`                                                                                                                                                                      | Seed-dəki rezerv və rəylərin sahibləri                           |
| Biznes  | `nail-by-aysel@azlink.demo`                                                                                                                                                                                                        | Əsas demo biznes                                                 |
| Biznes  | `studio-nigar@`, `cleanpro@`, `ali-photography@`, `vusale-hair@`, `kamran-santexnik@`, `resad-auto-wash@`, `turbo-servis@`, `nergiz-muellime@`, `paws-grooming@`, `ifix-telefon@`, `tural-trainer@`, `leyla-yoga@` + `azlink.demo` | Digər bizneslər                                                  |

### Köməkçi skriptlər (`server/prisma/`)

| Fayl                 | Təyinatı                                            |
| -------------------- | --------------------------------------------------- |
| `add-areas.ts`       | Bakının 12 rayonunu bazaya əlavə edir               |
| `businesses-tool.ts` | Bizneslərin siyahısını göstərir və təhlükəsiz silir |

Bizneslərin siyahısı (sahib email-i, xidmət, rezerv, rəy sayları ilə):

```bash
npx ts-node --project prisma/tsconfig.json prisma/businesses-tool.ts
```

Biznesi silmək (əvvəl quru sınaq göstərir, `--confirm` olmadan heç nə silinmir):

```bash
npx ts-node --project prisma/tsconfig.json prisma/businesses-tool.ts --delete <biznesId>
npx ts-node --project prisma/tsconfig.json prisma/businesses-tool.ts --delete <biznesId> --confirm
```

Bazanı tamamilə sıfırlamaq (**bütün məlumat, o cümlədən özün açdığın hesablar silinir**):

```bash
npx prisma migrate reset
```

---

## Layihə strukturu

### Client (`client/`)

```text
client/
├── public/
└── src/
    ├── assets/
    │
    ├── components/
    │   ├── AreaSelector/        ← ərazi seçimi modalı (rayonlar və metro)
    │   ├── account/             ← ChangePasswordModal (şifrə dəyişmə pəncərəsi)
    │   ├── business/            ← BusinessLayout ("Biznesim" alt-naviqasiyası)
    │   ├── home/                ← HomeHero, UpcomingBookings, PopularNearby, TodayOverview,
    │   │                          HowItWorks, HelpfulInfo
    │   └── layout/              ← AppLayout, TopNav, BusinessSubNav ("Rezerv et" alt-naviqasiyası)
    │
    ├── data/
    │   ├── categories.ts        ← Kəşf et üçün kateqoriya siyahısı (ikon, ad, xidmətlər)
    │   └── metroStations.ts     ← metro stansiyaları və onların rayonları
    │
    ├── hooks/
    │   └── useTheme.ts          ← light/dark mode
    │
    ├── pages/
    │   ├── AccountType/         ← giriş səhifəsi: hesab növü seçimi ("/")
    │   ├── Login/
    │   ├── Register/
    │   ├── Home/                ← müştərinin ana səhifəsi ("/home")
    │   ├── Explore/             ← kateqoriyalar
    │   ├── SearchResults/       ← axtarış nəticələri və filtrlər
    │   ├── Provider/            ← biznes profili (xidmətlər, rəylər, portfolio)
    │   ├── BookingStart/        ← rezervə başlanğıc ("/booking")
    │   ├── Booking/             ← xidmət, tarix, saat, təsdiq ("/booking/:providerId")
    │   ├── Bookings/            ← müştərinin rezervləri (+ biznes hesabı üçün tablar)
    │   ├── Saved/               ← seçilmişlər
    │   ├── Profile/             ← Profile (user), BusinessAccountProfile (biznes sahibinin
    │   │                          şəxsi profili), ProfileRoute (rola görə seçir)
    │   ├── BusinessDashboard/
    │   ├── BusinessProfile/     ← biznes vitrini (canlı önbaxışla)
    │   ├── BusinessServices/
    │   ├── BusinessBookings/    ← biznesə gələn rezervlər
    │   ├── BusinessPortfolio/
    │   ├── BusinessReviews/     ← biznesin rəyləri
    │   ├── BusinessCustomers/
    │   └── BusinessHours/       ← iş saatları
    │
    ├── routes/
    │   └── ProtectedRoute.tsx   ← giriş və rol yoxlaması, uyğun olmayanı yönləndirir
    │
    ├── services/                ← bütün API çağırışları yalnız burada
    │   ├── api.ts               ← mərkəzi fetch wrapper: token saxlama, auto-refresh, ApiError
    │   ├── authService.ts       ← signup / signin / logout / getMe
    │   ├── accountService.ts    ← ad, telefon, şifrə dəyişmə
    │   ├── areasService.ts
    │   ├── categoriesService.ts
    │   ├── providersService.ts  ← bizneslər, tək biznes, dolu saatlar
    │   ├── bookingsService.ts
    │   ├── savedService.ts
    │   ├── reviewsService.ts
    │   ├── activityService.ts   ← profil sayları
    │   ├── businessDashboardService.ts
    │   └── businessServicesService.ts
    │
    ├── styles/
    │   └── variables.css        ← rənglər və ölçülər (light/dark)
    ├── types/                   ← area.ts, booking.ts, portfolio.ts, provider.ts, schedule.ts
    ├── utils/                   ← areaMatch.ts, categoryVisual.ts, formatDuration.ts
    │
    ├── App.tsx                  ← bütün route-lar
    ├── App.css                  ← qlobal reset, shell və naviqasiya
    ├── index.css
    └── main.tsx
```

Brauzerdə yalnız bunlar `localStorage`-da saxlanır: giriş token-ləri və cari istifadəçi (`api.ts`), seçilmiş tema (`useTheme.ts`). Rezerv, seçilmiş, xidmət və profil məlumatının hamısı bazadadır.

### Server (`server/`)

```text
server/
├── src/
│   ├── config/
│   │   └── prisma.ts             ← Prisma Client singleton
│   ├── middleware/
│   │   └── authenticate.ts       ← JWT yoxlaması (authenticate, requireRole)
│   ├── modules/
│   │   ├── auth/                 ← signup, signin, refresh, logout, me, profil, şifrə
│   │   ├── areas/
│   │   ├── providers/            ← siyahı, tək biznes, dolu saatlar (provider-busy.service.ts)
│   │   ├── bookings/
│   │   ├── saved/
│   │   ├── reviews/
│   │   └── business/             ← profil, dashboard, müştərilər,
│   │                               business-services.*, business-portfolio.*
│   ├── utils/
│   │   └── jwt.ts                ← token sign/verify (access və refresh)
│   ├── app.ts                    ← Express app, middleware, route-ların qoşulması
│   └── index.ts                  ← dotenv, server-i başladır
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   ├── add-areas.ts
│   ├── businesses-tool.ts
│   └── dev.db                    ← SQLite faylı (Git-ə düşmür)
├── .env                          ← gizli açarlar (Git-ə düşmür)
├── .env.example
└── package.json
```

Hər modul üç fayla bölünür: `<ad>.service.ts` (Prisma sorğuları), `<ad>.controller.ts` (request/response, status kodları), `<ad>.routes.ts` (Router).

---

## İstifadəçi tipləri və hesab modeli

### 1. User (adi istifadəçi)

- qeydiyyatdan keçmək və daxil olmaq;
- xidmət axtarmaq, rayon və ya metro üzrə süzmək;
- biznes profillərinə baxmaq, qiymət və reytinqi müqayisə etmək;
- profili seçilmişlərə əlavə etmək;
- tarix və saat seçib rezerv yaratmaq, rezervi ləğv etmək;
- tamamlanmış rezerv üçün rəy yazmaq;
- adını, telefonunu və şifrəsini dəyişmək;
- light/dark mode seçmək.

### 2. Business (biznes sahibi / xidmət göstərən)

- biznes hesabı və profili yaratmaq (ad, kateqoriya, ərazi, telefon, təsvir);
- xidmətlər, qiymət və müddət əlavə etmək;
- iş saatlarını təyin etmək;
- portfolio şəkilləri əlavə etmək;
- rezervləri görmək, təsdiqləmək, tamamlamaq və ya ləğv etmək;
- müştərilərini və rəyləri görmək;
- dashboard statistikalarını izləmək;
- **həm də** başqa ustalara baxıb rezerv edə, seçilmişlərə əlavə edə, rəy yaza bilər.

### Hesab modeli: bir hesab, iki rol imkanı

`User.email` bazada **unikaldır**: eyni email ilə həm `USER`, həm `BUSINESS` kimi iki ayrı hesab açıla bilməz. Əvəzində **bir hesab hər iki işi görə bilir**:

- Qeydiyyat zamanı seçilən rol (`USER` və ya `BUSINESS`) hesabın "əsas kimliyini" təyin edir. Biznes hesabı öz panelini (`/business/*`) idarə edir, adi istifadəçi hesabı isə ora girə bilmir.
- Rezerv etmək, seçilmişlərə əlavə etmək və rəy yazmaq üçün rol məhdudiyyəti **yoxdur**, yalnız giriş edilmiş olmaq kifayətdir. Biznes hesabı ilə girib başqa ustaya rezerv etmək olar.
- Biznes sahibi öz biznesinə rezerv edə bilməz (həm frontend, həm backend yoxlayır), öz biznesi axtarışda görünmür.
- `GET /api/bookings` hər iki növü qaytarır: özünün **müştəri kimi etdiyi** rezervlər və (biznesi varsa) **ona gələn** rezervlər. Frontend bunları `customerId`-yə görə ayırır.
- Eyni email ilə təkrar qeydiyyat cəhdi dəqiq mesaj verir və hansı rolla qeydiyyatdan keçdiyini bildirir.

### Rol və icazə (texniki)

Backend hər istifadəçiyə rol təyin edir (`Role` enum-u: `USER`, `BUSINESS`; JWT payload-a da yazılır). `authenticate` middleware-i qorunan route-larda girişi yoxlayır, `requireRole` isə yalnız **bir rola xas** əməliyyatlarda (məs. `/api/business/*`) əlavə məhdudiyyət qoyur.

Frontend tərəfdə `routes/ProtectedRoute.tsx` eyni məntiqi tətbiq edir: `role` prop-u verilməzsə yalnız giriş tələb olunur, verilsə uyğun olmayan rol öz əsas səhifəsinə yönləndirilir.

---

## Ekranlar və naviqasiya

### Route-lar

| Yol                                | Səhifə                               | Kimlər üçün     |
| ---------------------------------- | ------------------------------------ | --------------- |
| `/`                                | Hesab növü seçimi (`AccountType`)    | Hamı, həmişə    |
| `/login`, `/register`              | Giriş, qeydiyyat                     | Hamı            |
| `/home`                            | Ana səhifə                           | Yalnız USER     |
| `/explore`                         | Kateqoriyalar                        | Giriş edənlər   |
| `/search`                          | Axtarış nəticələri                   | Giriş edənlər   |
| `/provider/:providerId`            | Biznes profili                       | Giriş edənlər   |
| `/booking`, `/booking/:providerId` | Rezerv axını                         | Giriş edənlər   |
| `/bookings`                        | Müştərinin rezervləri                | Giriş edənlər   |
| `/saved`                           | Seçilmişlər                          | Giriş edənlər   |
| `/profile`                         | Profil (rola görə iki fərqli səhifə) | Giriş edənlər   |
| `/business`                        | Dashboard                            | Yalnız BUSINESS |
| `/business/profile`                | Biznes profili                       | Yalnız BUSINESS |
| `/business/services`               | Xidmətlər                            | Yalnız BUSINESS |
| `/business/bookings`               | Gələn rezervlər                      | Yalnız BUSINESS |
| `/business/portfolio`              | Portfolio                            | Yalnız BUSINESS |
| `/business/reviews`                | Rəylər                               | Yalnız BUSINESS |
| `/business/customers`              | Müştərilər                           | Yalnız BUSINESS |
| `/business/hours`                  | İş saatları                          | Yalnız BUSINESS |

Köhnə `/business-profile`, `/business-services` və s. yolları yeni `/business/...` yollarına yönləndirilir.

### Yuxarı naviqasiya

| Hesab    | Menyu                                                   |
| -------- | ------------------------------------------------------- |
| User     | Ana səhifə · Kəşf et · Rezervlər · Seçilmişlər · Profil |
| Business | Biznesim · Rezerv et · Profil                           |

Business hesabında:

- **Biznesim** altında alt-naviqasiya: Dashboard, Profil, Xidmətlər, Rezervlər, Portfolio, Rəylər, Müştərilər, İş saatları.
- **Rezerv et** altında alt-naviqasiya: Kəşf et, Seçilmişlər, Mənim rezervlərim (`BusinessSubNav`). `/bookings` yalnız hesabın özünün başqa bizneslərə etdiyi rezervləri göstərir; biznesə gələn rezervlər "Biznesim → Rezervlər" (`/business/bookings`) bölməsindədir.
- **Profil** biznes sahibinin şəxsi hesabıdır (ad, email, telefon, şifrə), biznes vitrini isə "Biznesim → Profil"dir. Bu ikisi qarışdırılmır.

### Rezerv statusları

```text
PENDING     → yeni rezerv, biznes təsdiqi gözlənilir
CONFIRMED   → biznes təsdiqləyib
CANCELLED   → ləğv edilib
COMPLETED   → xidmət göstərilib
```

Keçidlər:

| Kim     | Keçid                                                                          |
| ------- | ------------------------------------------------------------------------------ |
| Müştəri | `PENDING` → `CANCELLED`, `CONFIRMED` → `CANCELLED`                             |
| Biznes  | `PENDING` → `CONFIRMED` / `CANCELLED`, `CONFIRMED` → `COMPLETED` / `CANCELLED` |

---

## Rezerv qaydaları

Rezerv yaradılanda backend (`POST /api/bookings`) bunları yoxlayır:

- **Tarix və saat formatı** (`YYYY-MM-DD`, `HH:mm`) düzgündür.
- **Keçmiş vaxt** seçilə bilməz.
- **Xidmət** həmin bizneslə bağlıdır.
- **İş saatları:** xidmət biznesin həmin gün iş saatlarına tam sığmalıdır. Biznes iş saatlarını doldurmayıbsa, standart cədvəl işləyir: Bazar ertəsi–Şənbə 10:00–20:00, Bazar bağlıdır.
- **Üst-üstə düşmə:** həmin biznesin gözləyən (`PENDING`) və təsdiqlənmiş (`CONFIRMED`) rezervləri ilə vaxt kəsişməməlidir. Ləğv edilmiş və tamamlanmış rezervlər vaxtı tutmur.

Rezerv səhifəsi (`Booking.tsx`):

- Biznesin real xidmətlərini və iş saatlarını `GET /api/providers/:id`-dən oxuyur.
- Dolu saatları `GET /api/providers/:id/busy` ilə alır. Bu endpoint **yalnız tutulmuş vaxt aralığını** qaytarır, kimin rezerv etdiyi və hansı xidmət olduğu açıqlanmır.
- Eyni anda iki müştəri eyni saatı seçsə, ikincisi backend-in "Bu vaxt artıq rezerv edilib" xətasını alır.

**Vaxtın saxlanması:** tarix və saat bazada tək `DateTime` kimi, "Bakı divar saatı" UTC kimi yazılaraq saxlanır (məs. 14:00 → `14:00Z`). Beləliklə saat qurşağı çevrilməsi olmur, oxuyanda UTC getter-ləri ilə eyni tarix və saat alınır.

**Rəylər:** rəyi yalnız `COMPLETED` rezervin sahibi yaza bilər və bir rezerv üçün bir rəy mümkündür.

---

## Ərazi seçimi

Platforma yalnız **Bakı şəhəri** üçündür. Seçim pəncərəsində iki qrup var:

1. **Rayonlar:** Bakının 12 inzibati rayonu (Nərimanov, Nəsimi, Yasamal, Səbail, Xətai, Nizami, Binəqədi, Sabunçu, Suraxanı, Xəzər, Qaradağ, Pirallahı).
2. **Metro stansiyaları:** Bakı metrosunun stansiyaları (xəritədən götürülüb).

Əlavə olaraq "Bütün Bakı" seçimi var. İstifadəçi bir neçə rayon və ya metro seçə bilər. "Bütün Bakı" seçiləndə digər seçimlər silinir, konkret ərazi seçiləndə "Bütün Bakı" avtomatik çıxır. Seçilmiş ərazilər axtarışda URL-ə `?area=...` kimi yazılır. Siyahıda olmayan ərazini əl ilə yazmaq mümkün deyil.

**Biznes yalnız bir rayon seçir** (qeydiyyatda və Biznesim → Profil-də).

### Fayllar və rolları

| Fayl                                    | Nə edir                                          |
| --------------------------------------- | ------------------------------------------------ |
| `client/src/types/area.ts`              | `Area` tipi və seçim siyahısı (12 rayon + metro) |
| `client/src/data/metroStations.ts`      | Metro stansiyaları və hər birinin rayonu         |
| `client/src/components/AreaSelector/`   | Seçim pəncərəsi                                  |
| `client/src/utils/areaMatch.ts`         | Biznesin rayonu seçilmiş əraziyə uyğundurmu      |
| `server/prisma/add-areas.ts`, `seed.ts` | Rayonları bazaya yazır                           |

### Metro necə işləyir

Hər stansiya bir və ya bir neçə rayona bağlanır. Metro seçiləndə həmin rayonlardakı bizneslər çıxır. Yəni nəticə "metroya yaxın" yox, "metronun rayonunda" olan bizneslərdir. Sərhəddə olan stansiyalara iki rayon verilib ki, səhv olsa belə biznes gizlənməsin.

> **Qeyd:** metro stansiyalarının rayonları təxminidir və `metroStations.ts`-də `YOXLA` şərhi ilə qeyd olunub. Real xəritə ilə təsdiqlənməlidir. Yeni stansiya əlavə etmək üçün bir sətir yazmaq kifayətdir.

### Vacib qayda

Rayon adları **eyni yazılmalıdır** üç yerdə: `types/area.ts`, `metroStations.ts` (rayon siyahısında) və bazada (`add-areas.ts`, `seed.ts`). Fərq olarsa, uyğunluq pozulur və nəticə boş çıxır.

---

## Dizayn sistemi

Əsas fikir: **"Xəzərin incisi"**. Saytın simvolu mirvaridir (`components/brand/Pearl.tsx`). Fon mirvari ağıdır, əsas rəng dərin zümrüd yaşılıdır (`#17614C`, qaranlıq rejimdə `#74D2AD`).

- **Mirvari** yalnız giriş ekranında (böyük) və Ana səhifənin başlığında (kiçik) görünür. Açılışda bir dəfə "əmələ gəlir", siçanın hərəkətinə görə işığı və sədəf çalarları dəyişir. Telefonda və "azaldılmış hərəkət" ayarında sakit qalır. Qalan hər şey bilərəkdən sakit və sadədir.
- **Şrift:** Onest. Azərbaycan hərflərini (Ə ə, Ğ ğ, Ş ş, ı) və manat işarəsini (₼) tam dəstəkləyir. Fayl layihənin içindədir (`assets/fonts/`), ona görə internet olmadan da düzgün görünür.
- **Yuxarı menyu:** şüşə effekti (arxa fon bulanıq görünür), bölmələr bir zolağın içindədir, aktiv bölmə qalxmış düymə kimi görünür.
- Light və Dark mode dəstəklənir. Seçim brauzerin yaddaşında saxlanır (`hooks/useTheme.ts`).
- Rənglər, kölgələr, radiuslar və animasiya sürətləri `styles/variables.css`-də toplanıb. **Səhifələrin CSS-i rəngləri düz kod (`#ffffff`) kimi yox, `var(--color-surface)`, `var(--color-text)`, `var(--color-on-primary)` kimi dəyişənlərlə yazmalıdır.** Əks halda qaranlıq modda səhifə uyğunsuz qalır.
- Kateqoriya kartları üçün gradient fonlar `--gradient-teal`, `--gradient-pink`, `--gradient-blue`, `--gradient-purple` dəyişənləri ilə idarə olunur. Hansı kateqoriyaya hansı gradient və ikon düşdüyü `utils/categoryVisual.ts`-dədir.
- Biznesim və Rezerv et bölmələrində səhifələr eyni enə (1040px) və eyni yan boşluğa malikdir.
- Responsive: desktop və mobile dəstəklənir.

---

## Backend API

Baza ünvanı: `http://localhost:4000/api`. Qorunan marşrutlar `Authorization: Bearer <accessToken>` tələb edir. Xəta cavabları `{ "message": "..." }` formasındadır.

```text
Sistem
GET    /api/health

Auth
POST   /api/auth/signup         → qeydiyyat (email unikal; artıq varsa hansı rolla olduğunu bildirir)
POST   /api/auth/signin
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me             ← giriş tələb olunur
PATCH  /api/auth/me             ← ad, telefon
PATCH  /api/auth/password       ← köhnə şifrəni yoxlayıb yenisini yazır

Ümumi
GET    /api/categories
GET    /api/areas
GET    /api/areas/:id
GET    /api/providers           → biznes kartları (xidməti olanlar): reytinq, rəy sayı, başlanğıc qiymət
GET    /api/providers/:id       → xidmətlər, rəylər, portfolio, iş saatları (availability)
GET    /api/providers/:id/busy  ← giriş tələb olunur: ?from=YYYY-MM-DD&to=YYYY-MM-DD (maks. 62 gün),
                                  yalnız tutulmuş vaxt aralıqları, şəxsi məlumat yoxdur

Rezerv                          ← giriş tələb olunur, rol məhdudiyyəti yoxdur
POST   /api/bookings            → iş saatları, keçmiş vaxt və üst-üstə düşmə yoxlanılır
GET    /api/bookings            → öz etdiklərin + (biznesin varsa) sənə gələnlər, birlikdə
GET    /api/bookings/:id
PATCH  /api/bookings/:id        → status keçid qaydaları (yuxarıda)
DELETE /api/bookings/:id        → ləğv edilmiş rezervi silir

Seçilmişlər                     ← giriş tələb olunur (hər iki rol; öz biznesini əlavə etmək olmur)
GET    /api/saved
POST   /api/saved/:providerId
DELETE /api/saved/:providerId

Rəylər
GET    /api/reviews?providerId=
GET    /api/reviews/mine        ← giriş tələb olunur
POST   /api/reviews             ← giriş tələb olunur: yalnız COMPLETED rezervə, bir rezerv üçün bir rəy

Business                        ← authenticate + requireRole("BUSINESS")
GET    /api/business/profile
PATCH  /api/business/profile    → ad, kateqoriya, ərazi, telefon, təsvir, iş saatları (schedule)
GET    /api/business/dashboard  → xidmət/rezerv/gəlir/müştəri sayları, profil tamamlanma faizi
GET    /api/business/customers  → müştəri siyahısı, qruplaşdırılıb
GET    /api/business/reviews    → biznesə yazılmış rəylər
GET    /api/business/services
POST   /api/business/services
PATCH  /api/business/services/:id
DELETE /api/business/services/:id
GET    /api/business/portfolio
POST   /api/business/portfolio  → şəkil base64 data URL kimi göndərilir
DELETE /api/business/portfolio/:id
```

Qeydlər:

- `/api/providers` cavabında `service` sahəsi biznesin kateqoriya adıdır (məs. "Dırnaq"). `ownerId` biznes sahibinin istifadəçi id-sidir (öz biznesini gizlətmək üçün), `distance` hazırda həmişə `null`-dur.
- Biznes üçün gələn rezervlər ayrıca endpoint-də deyil, ümumi `GET /api/bookings`-dədir (biznes sahibi üçün avtomatik ona gələnləri də qaytarır).
- Dashboard-dakı profil tamamlanma faizi 7 şərtdən hesablanır: ad, kateqoriya, ərazi, telefon, ən azı bir açıq gün, ən azı bir xidmət, ən azı bir portfolio şəkli.

---

## Verilənlər bazası

SQLite, Prisma ilə idarə olunur. Migration-lar `server/prisma/migrations/`-dadır.

```text
User, Business, Category, Service, Area, Booking,
Review, Portfolio, SavedProvider, Availability, Notification
```

| Model           | Əsas məqamlar                                                                          |
| --------------- | -------------------------------------------------------------------------------------- |
| `User`          | `email` unikal, `role` (`USER` / `BUSINESS`), `phone` könüllü                          |
| `Business`      | `User` ilə 1:1, bir `Area`-ya bağlıdır, `verified` bayrağı, `Category` ilə çoxdan-çoxa |
| `Category`      | `parentId` var (məs. Gözəllik → Dırnaq)                                                |
| `Service`       | Biznesə və alt kateqoriyaya bağlıdır, `price`, `duration` (dəqiqə)                     |
| `Area`          | `name` unikal, `type`                                                                  |
| `Booking`       | `date` tək `DateTime` (Bakı divar saatı UTC kimi), `status`                            |
| `Review`        | `bookingId` unikal (bir rezerv, bir rəy), `rating` 1–5                                 |
| `Portfolio`     | `imageUrl` (base64 data URL), `caption`                                                |
| `SavedProvider` | `@@unique([userId, businessId])` təkrar qeydin qarşısını alır                          |
| `Availability`  | `dayOfWeek` (0 = Bazar … 6 = Şənbə), `startTime`, `endTime`                            |
| `Notification`  | Cədvəl var, amma hələ heç yerdə istifadə olunmur                                       |

Köhnə migration-lar: `init`, `add_savedprovider_business_relation`, `add_business_verified`, `add_portfolio_caption`.

---

## Təhlükəsizlik

- Şifrələr plain text saxlanmır, `bcryptjs` ilə hash olunur.
- Access token (15 dəq) və refresh token (7 gün): stateless JWT (`utils/jwt.ts`). Access token bitəndə frontend (`services/api.ts`) avtomatik bir dəfə refresh cəhdi edir, alınmasa girişi təmizləyir.
- Rol yoxlaması backend tərəfindədir (`authenticate` və `requireRole`).
- Başqasının rezervi "tapılmadı" kimi görünür, varlığı bildirilmir.
- `.env` faylı Git-ə düşmür.
- Rezerv və dolu saat endpoint-i şəxsi məlumat açmır.

### Məlum məhdudiyyətlər

- Refresh token bazada saxlanmır, ona görə `logout` onu serverdə ləğv edə bilmir (yalnız müddəti bitəndə qüvvədən düşür). Production üçün `RefreshToken` cədvəli əlavə edib logout-da silmək daha təhlükəsizdir.
- Email dəyişmə və email təsdiqi yoxdur.
- Sorğu limiti (rate limiting) yoxdur, CORS standart (hamıya açıq) konfiqurasiyadadır.
- Portfolio şəkilləri base64 kimi bazada saxlanır (`express.json` limiti 15 MB), çox şəkil olanda cavablar ağırlaşa bilər.
- Demo hesabların parolu hamısı eynidir (`parol123`), real mühitdə istifadə olunmamalıdır.

---

## Hazırkı vəziyyət

**Backend və frontend real API ilə işləyir.** Layihənin bütün əsas axınları bazadan işləyir. Köhnə `localStorage`/demo faylları silinib.

### Hazırdır

- Qeydiyyat, giriş, token yenilənməsi, rola görə yönləndirmə
- Axtarış (söz, kateqoriya, rayon və metro, qiymət, reytinq), Kəşf et, biznes profili
- Rezerv axını: real iş saatları, dolu saatlar, üst-üstə düşmə yoxlaması
- Müştərinin rezervləri (ləğv, silmə), seçilmişlər, rəy yazmaq
- Biznesim: Dashboard, Profil (canlı önbaxışla), İş saatları, Xidmətlər, Rezervlər (təsdiq/tamamla/ləğv), Portfolio, Müştərilər, Rəylər
- Hesab: ad, telefon, şifrə dəyişmə (hər iki profil səhifəsində)
- Ərazi: 12 rayon və metro stansiyaları
- Light/dark mode, responsive görünüş
- Demo məlumat (seed) və köməkçi skriptlər

### Qalıb

| İş                  | Qeyd                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| "Son baxdıqlarınız" | Ana səhifədə real versiya (baxılan bizneslərin yadda saxlanması)                                                                |
| Emaili dəyişmə      | Backend endpoint-i və frontend düyməsi                                                                                          |
| Bildirişlər         | `Notification` cədvəli hazırdır, hadisələrdə yaradılması və göstərilməsi qalıb. Profildə bildiriş sətirləri "Tezliklə" göstərir |
| Məsafə (`distance`) | Backend hesablamır. Ya koordinat əlavə edilməli, ya da sahə çıxarılmalıdır                                                      |
| Portfolio şəkilləri | Fayl kimi saxlamaq (base64 əvəzinə)                                                                                             |
| Təhlükəsizlik       | Refresh token-in bazada saxlanması və logout-da ləğvi                                                                           |
| Son işlənmə         | Yüklənmə/xəta/boş vəziyyətlərin yoxlanması, mobil görünüşün tam yoxlanması                                                      |
| Metro rayonları     | Real xəritə ilə təsdiqləmək                                                                                                     |
| Paylaşılan tiplər   | `shared/` qovluğu planlaşdırılıb, hələ yaradılmayıb                                                                             |
| Avtomatik testlər   | Yoxdur, bütün axınlar əl ilə yoxlanılır                                                                                         |

### İlk versiyaya daxil olmayanlar

Real ödəniş, mürəkkəb AI, canlı xəritə və məsafəyə görə axtarış, Instagram/WhatsApp inteqrasiyası, abunə sistemi, mürəkkəb analitika. Bunlar ilk işlək versiyadan sonra gələ bilər.

---

## Kod qaydaları

- Kod modul olmalıdır, təkrar istifadə olunan komponentlər yaradılmalıdır.
- Eyni məntiqi iki yerdə yazma. Ortaq məntiq `utils/` və ya `hooks/`-a çıxarılır (nümunə: `areaMatch.ts`).
- Business logic UI komponentlərindən ayrılmalıdır.
- **API çağırışları yalnız `services/` qatında olmalıdır.**
- Fayl adı komponentin adı ilə eyni olmalıdır (`AreaSelector.tsx` → `AreaSelector.css`). Eyni adlı iki fayl fərqli işlər görürsə, adları fərqləndirilməlidir. Diqqət: `Booking/` (yeni rezerv) və `Bookings/` (siyahı) fərqli səhifələrdir.
- **CSS yazanda rəngləri `#ffffff` kimi sabit yox, `variables.css`-dəki qlobal dəyişənlərə bağla**, yoxsa qaranlıq modda o səhifə uyğunsuz qalır.
- CSS faylında `{` və `}` mötərizələrinin bağlandığını yoxla: bağlanmamış `@media` bloku sonrakı qaydaları içinə alır və onlar yalnız həmin ekran enində işləyir.
- Yeni faylı VS Code-un içindəki `client/src/...` və ya `server/src/...` qovluğunda aç. Faylı kənar qovluqdan (məs. `Downloads`) açsan, TypeScript minlərlə yalançı xəta göstərəcək.
- Backend-də `app.ts` Express app-ın özüdür (middleware və route-lar), `index.ts` isə yalnız `.env`-i yükləyib serveri başladır. Route-ları həmişə `app.ts`-ə (və ya oradan çağırılan modullara) yaz.
- Backend modulları `modules/<ad>/` altında `service`, `controller`, `routes` fayllarına bölünür.
- `schema.prisma`-da dəyişiklik etdikdən sonra mütləq `npx prisma migrate dev --name <təsvir>` işlət.
- **Demo məlumat yalnız `seed.ts` vasitəsilə əlavə olunur**, bazaya əl ilə eyni adlı təkrar biznes yazma.
- Rayon adları üç yerdə eyni olmalıdır (bax: [Ərazi seçimi](#ərazi-seçimi)).

---

## Faydalı əmrlər

| Nə üçün                                  | Əmr                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| Bazanı brauzerdə görmək və redaktə etmək | `cd server` → `npx prisma studio`                                                      |
| Frontend-in sınmadığını yoxlamaq         | `cd client` → `npm run build`                                                          |
| Backend-in sınmadığını yoxlamaq          | `cd server` → `npm run build`                                                          |
| Bazanın ehtiyat surəti                   | `Copy-Item server\prisma\dev.db server\prisma\dev.db.backup`                           |
| Bazanı surətdən bərpa etmək              | Serveri dayandırıb `Copy-Item server\prisma\dev.db.backup server\prisma\dev.db -Force` |

PowerShell ilə API-ni yoxlayanda Azərbaycan hərfləri düzgün getməsi üçün gövdəni UTF-8 baytlara çevir: `-Body ([System.Text.Encoding]::UTF8.GetBytes($json))` və `-ContentType "application/json; charset=utf-8"`.

Token 15 dəqiqəyə bitir. Test zamanı "Əməliyyat mümkün olmadı" kimi mesaj çıxsa, əvvəl hesabdan çıxıb yenidən daxil ol.

---

## Git iş qaydası

Hər tamamlanmış işdən sonra commit et:

```bash
git add .
git commit -m "qısa təsvir"
git push
```

Nümunə mesajlar:

```text
areas: 12 Baku districts + metro stations, remove custom areas
booking flow wired to API
busy slots shown on booking page
profile editing and change password wired to API
demo seed: businesses, reviews, demo customers
remove old localStorage/demo files
```

Böyük dəyişiklikdən (fayl silmək, qovluq köçürmək, migration işlətmək, bazanı sıfırlamaq) əvvəl mütləq commit et və bazanın ehtiyat surətini al. Beləcə istənilən vaxt geri qayıtmaq olar.
