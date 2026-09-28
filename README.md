# AzLink

AzLink müxtəlif xidmət sahələri üzrə istifadəçilərin uyğun mütəxəssisləri və bizneslləri tapmasına, profilləri müqayisə etməsinə və uyğun vaxt üçün rezerv yaratmasına imkan verən xidmət platformasıdır.

Platforma yalnız bir kateqoriyaya fokuslanmır. Gözəllik, ev xidmətləri, təhsil, tədbir, texnologiya və digər sahələr eyni sistem daxilində təqdim olunur. Heç bir kateqoriya digərindən üstün göstərilmir.

**İstifadəçi axını:** Tap → Bax → Müqayisə et → Rezerv et

**Biznes axını:** Qoşul → Profilini qur → Xidmət əlavə et → Rezerv qəbul et

---

## Mündəricat

1. [Texnologiyalar](#texnologiyalar)
2. [İşə salmaq](#işə-salmaq)
3. [Layihə strukturu](#layihə-strukturu)
4. [İstifadəçi tipləri](#istifadəçi-tipləri)
5. [Ekranlar](#ekranlar)
6. [Ərazi seçimi necə işləyir](#ərazi-seçimi-necə-işləyir)
7. [Mock data](#mock-data)
8. [Dizayn sistemi](#dizayn-sistemi)
9. [Backend planı](#backend-planı)
10. [Hazırkı vəziyyət](#hazırkı-vəziyyət)
11. [Yol xəritəsi (addım-addım)](#yol-xəritəsi-addım-addım)
12. [Kod qaydaları](#kod-qaydaları)
13. [Git iş qaydası](#git-iş-qaydası)

---

## Texnologiyalar

### Frontend

- React + TypeScript
- Vite
- React Router (`react-router-dom`)
- Lucide (`lucide-react`) ikonlar üçün
- Sadə CSS (səhifə və komponent CSS faylları)

### Backend

- Node.js + TypeScript
- Express (REST API)
- Prisma ORM
- SQLite (development üçün)
- JWT: access token və refresh token (`jsonwebtoken`) — işləyir
- Şifrə hash-ləmə: `bcryptjs` — işləyir

---

## İşə salmaq

Tələb olunan: **Node.js 20 və ya daha yeni versiya**.

### Frontend

```bash
cd client
npm install
npm run dev
```

Sonra brauzerdə terminalda göstərilən ünvanı aç (adətən `http://localhost:5173`).

Production build üçün:

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm install
npm run dev
```

Server `http://localhost:4000` ünvanında işə düşür.

Yoxlama üçün:

- `http://localhost:4000/api/health` → `{"status":"ok","time":"..."}`
- `http://localhost:4000/api/categories` → kateqoriyalar (seed işlədilibsə)
- `http://localhost:4000/api/areas` → ərazilər siyahısı

Verilənlər bazası dəyişikliyi etdikdən sonra (schema.prisma-nı redaktə edəndə):

```bash
npx prisma migrate dev --name <qısa-təsvir>
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
    │   ├── AreaSelector/     ← ərazi seçimi modalı
    │   ├── auth/
    │   ├── booking/
    │   ├── business/
    │   ├── common/
    │   ├── home/             ← HomeHero, OverviewStrip, PopularNearby, TodayOverview, RecentlyViewed, HowItWorks, HelpfulInfo
    │   ├── layout/           ← AppLayout, TopNav
    │   ├── provider/
    │   └── search/
    │
    ├── data/
    │   └── providers.ts      ← mock provider-lər
    │
    ├── hooks/
    │   └── useTheme.ts       ← light/dark mode
    │
    ├── pages/
    │   ├── AccountType/
    │   ├── Auth/
    │   ├── Booking/
    │   ├── BookingStart/
    │   ├── Bookings/
    │   ├── BusinessBookings/
    │   ├── BusinessDashboard/
    │   ├── BusinessProfile/
    │   ├── BusinessServices/
    │   ├── Dashboard/
    │   ├── Explore/
    │   ├── Home/
    │   ├── Login/
    │   ├── Profile/
    │   ├── Provider/
    │   ├── Register/
    │   ├── Saved/
    │   └── SearchResults/
    │
    ├── services/              ← localStorage-based demo storage (bookingStorage, reviewStorage, favoriteStorage, serviceStorage, portfolioStorage, demoCustomer, demoBusiness, businessProfileStorage)
    ├── store/
    ├── styles/
    │   └── variables.css      ← rənglər və ölçülər
    ├── types/
    │   ├── area.ts            ← Area tipi + ərazilər siyahısı
    │   ├── provider.ts
    │   ├── booking.ts
    │   ├── portfolio.ts
    │   └── schedule.ts
    ├── utils/
    │   ├── areaMatch.ts       ← ərazi uyğunluğu məntiqi (tək yerdə)
    │   ├── categoryVisual.ts  ← kateqoriya üzrə ikon/rəng
    │   ├── formatDuration.ts
    │   └── getBusinessCustomers.ts
    │
    ├── App.tsx
    ├── App.css                ← qlobal reset + shell + nav
    ├── index.css
    └── main.tsx
```

### Server (`server/`) — skelet + auth + areas + providers hazırdır

```text
server/
├── src/
│   ├── config/
│   │   └── prisma.ts             ← Prisma Client singleton
│   ├── middleware/
│   │   └── authenticate.ts       ← JWT yoxlaması (authenticate, requireRole) — işləyir, test edilib
│   ├── modules/
│   │   ├── auth/                 ← signup, signin, refresh, logout, me — işləyir, test edilib
│   │   ├── areas/                ← GET /api/areas, GET /api/areas/:id — işləyir, test edilib
│   │   └── providers/            ← GET /api/providers, GET /api/providers/:id — yazılıb
│   ├── routes/                   ← hələ boş (route-lar hələlik modul daxilində)
│   ├── types/                    ← hələ boş
│   ├── utils/
│   │   └── jwt.ts                ← token sign/verify (access + refresh)
│   ├── app.ts                    ← Express app, middleware, route-lar
│   └── index.ts                  ← dotenv, server-i başladır
├── prisma/
│   ├── schema.prisma              ← tam entity modeli, `Business.verified` sahəsi əlavə olunub
│   └── migrations/
├── .env                          ← DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PORT (Git-ə düşmür)
└── package.json
```

**Hazırda işləyən endpoint-lər:**

```text
GET    /api/health              → server statusu
GET    /api/categories          → Prisma-dan kateqoriyalar
GET    /api/areas               → ərazilər siyahısı                    ✅ test edilib
GET    /api/areas/:id           → tək ərazi                            ✅ test edilib
POST   /api/auth/signup         → qeydiyyat, tokenlər qaytarır         ✅ test edilib
POST   /api/auth/signin         → giriş, tokenlər qaytarır             ✅ test edilib
POST   /api/auth/refresh        → access token yeniləmə                ✅
POST   /api/auth/logout         → stateless, klient tərəfdə silinir    ✅
GET    /api/auth/me             → cari istifadəçi (authenticate ilə)   ✅ test edilib
GET    /api/providers           → provider siyahısı (axtarış/filtr)    ✅ yazılıb
GET    /api/providers/:id       → tək provider (xidmət, rəy, portfolio)✅ yazılıb
```

### Shared (`shared/`) — planlaşdırılır, hələ boşdur

```text
shared/
├── types/
│   ├── user.ts
│   ├── business.ts
│   ├── service.ts
│   ├── booking.ts
│   ├── review.ts
│   └── area.ts
└── constants/
    ├── roles.ts
    └── booking-status.ts
```

---

## İstifadəçi tipləri

### 1. User (adi istifadəçi)

- qeydiyyatdan keçmək və daxil olmaq;
- xidmət axtarmaq, bir və ya bir neçə ərazi seçmək;
- biznes profillərinə baxmaq, qiymətləri müqayisə etmək;
- reytinq və rəyləri görmək;
- profili seçilmişlərə əlavə etmək;
- tarix və saat seçib rezerv yaratmaq;
- gələcək və keçmiş rezervləri görmək;
- öz profilini idarə etmək;
- light/dark mode seçmək.

### 2. Business (biznes sahibi / xidmət göstərən)

- biznes hesabı və profili yaratmaq;
- xidmətlər, qiymət və müddət əlavə etmək;
- iş saatlarını və xidmət zonasını təyin etmək;
- portfolio şəkilləri əlavə etmək;
- rezervləri görmək, təsdiqləmək və ya ləğv etmək;
- müştəri məlumatlarını və rəyləri görmək;
- dashboard statistikalarını izləmək.

### Rol və icazə

Backend hər istifadəçiyə rol təyin edir: `USER` və ya `BUSINESS` (Prisma schema-da `Role` enum-u var, JWT payload-a da yazılır). `authenticate` middleware-i qorunan route-larda tələb olunan girişi yoxlayır, `requireRole` isə rola görə əlavə məhdudiyyət qoyur — hər ikisi yazılıb və test edilib.

---

## Ekranlar

### User ekranları

| Ekran                        | Qovluq                |
| ---------------------------- | --------------------- |
| Ana səhifə                   | `pages/Home`          |
| Kateqoriyalar                | `pages/Explore`       |
| Axtarış nəticələri           | `pages/SearchResults` |
| Provider profili             | `pages/Provider`      |
| Rezerv başlanğıcı            | `pages/BookingStart`  |
| Rezerv (tarix, saat, təsdiq) | `pages/Booking`       |
| Rezervlərim                  | `pages/Bookings`      |
| Seçilmişlər                  | `pages/Saved`         |
| Profil                       | `pages/Profile`       |

### Giriş və qeydiyyat

| Ekran             | Qovluq              |
| ----------------- | ------------------- |
| Hesab tipi seçimi | `pages/AccountType` |
| Qeydiyyat         | `pages/Register`    |
| Giriş             | `pages/Login`       |

### Business ekranları

| Ekran          | Qovluq                    |
| -------------- | ------------------------- |
| Dashboard      | `pages/BusinessDashboard` |
| Biznes profili | `pages/BusinessProfile`   |
| Xidmətlər      | `pages/BusinessServices`  |
| Rezervlər      | `pages/BusinessBookings`  |

### Rezerv statusları

```text
PENDING     → yeni rezerv, biznes təsdiqi gözlənilir
CONFIRMED   → biznes təsdiqləyib
CANCELLED   → ləğv edilib
COMPLETED   → xidmət göstərilib
```

---

## Ərazi seçimi necə işləyir

Bu hissə ən çox qarışdırılan hissədir, ona görə ayrıca yazılıb.

**Fayllar və rolları:**

| Fayl                                       | Nə edir                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `types/area.ts`                            | `Area` tipini və ərazilər siyahısını saxlayır (rayon, məhəllə, metro) |
| `components/AreaSelector/AreaSelector.tsx` | ərazi seçim modalı (ekranda görünən hissə)                            |
| `components/AreaSelector/AreaSelector.css` | modalın dizaynı                                                       |
| `utils/areaMatch.ts`                       | provider-in ərazisi seçilmiş əraziyə uyğundurmu, onu yoxlayır         |

**Qaydalar:**

- İstifadəçi bir neçə ərazi seçə bilər.
- "Bütün Bakı" (`id: "all-baku"`) seçiləndə digər seçimlər silinir.
- Konkret ərazi seçiləndə "Bütün Bakı" avtomatik çıxır.
- İstifadəçi siyahıda olmayan ərazini özü yaza və əlavə edə bilər (`type: "custom"`).
- Seçilmiş ərazilər axtarış zamanı URL-ə `?area=...` kimi yazılır.

**Uyğunluq məntiqi (`areaMatch.ts`):** provider bir rayonda qeydiyyatdadır (məsələn, Nərimanov). İstifadəçi isə "Gənclik" və ya "Gənclik metrosu" seçə bilər. Bu ərazilər `areaToDistrict` cədvəlində rayona bağlanır. Yeni ərazi əlavə edəndə yalnız bu cədvələ bir sətir yazmaq kifayətdir. Məntiq başqa yerdə təkrarlanmamalıdır.

**Diqqət:** `types/area.ts`-dəki id-lər və `areaMatch.ts`-dəki adlar eyni yazılışla uyğun olmalıdır (məsələn `inşaatçılar metrosu`). Backend-dəki `Area` cədvəli (`id`, `name`, `type`) hazırda bu frontend siyahısından ayrıca, `seed.ts` vasitəsilə doldurulur — iki tərəf uyğunlaşdırılmalıdır.

---

## Mock data

Backend tədricən qoşulur. Provider-lər hələlik `client/src/data/providers.ts` faylındadır (backend-dəki `GET /api/providers` yazılıb, amma frontend hələ ona keçməyib). Rezerv, rəy, seçilmiş və portfolio kimi istifadəçi fəaliyyəti isə `client/src/services/` altındakı `localStorage`-based demo modullarda saxlanır (`bookingStorage.ts`, `reviewStorage.ts`, `favoriteStorage.ts`, `serviceStorage.ts`, `portfolioStorage.ts`, `businessProfileStorage.ts`).

Backend tam qoşulanda bu fayllar birbaşa silinməyəcək — hər biri tədricən API çağırışları ilə əvəz olunacaq, komponentlər isə dəyişməyəcək (funksiya imzaları eyni saxlanacaq).

---

## Dizayn sistemi

Əsas istiqamət: **ağ, yumşaq yaşıl, tünd yaşıl, yumşaq boz**. Əsas accent rəng: `#2E7D5B`.

- Ümumi görünüş premium və minimal olmalıdır. Həm gözəllik, həm santexnik, həm repetitor eyni dizaynda düzgün görünməlidir.
- Kartlar ağ, sərhədlər çox zərif, künc radiusu təxminən 14–18px.
- Düymələr yuvarlaq, amma həddindən artıq pill formasında olmamalıdır.
- Light və Dark mode dəstəklənir. Seçim brauzerin yaddaşında saxlanır (`hooks/useTheme.ts`).
- Rənglər və ölçülər `styles/variables.css` faylında toplanıb. Yeni rəng lazım olsa, əvvəlcə orada dəyişən yarat.
- Kateqoriya kartları üçün gradient fonlar `--gradient-teal`, `--gradient-pink`, `--gradient-blue`, `--gradient-purple` dəyişənləri ilə idarə olunur, hansı kateqoriyaya hansı gradient/ikon düşdüyü `utils/categoryVisual.ts`-dədir.

---

## Backend planı

### Əsas məsuliyyətlər

authentication, authorization, users, businesses, services, categories, areas, bookings, reviews, saved providers, portfolio, availability, notifications.

### API (REST) — planlaşdırılan tam siyahı

```text
Auth                                    ✅ işləyir, test edilib
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me                     ← authenticate middleware ilə qorunur

Ümumi
GET    /api/providers                   ✅ yazılıb
GET    /api/providers/:id               ✅ yazılıb
GET    /api/categories                  ✅ işləyir
GET    /api/areas                       ✅ işləyir, test edilib
GET    /api/areas/:id                   ✅ işləyir, test edilib

Rezerv                                  [yazılmayıb]
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id

Seçilmişlər                             [yazılmayıb]
POST   /api/saved/:providerId
DELETE /api/saved/:providerId

Rəylər                                  [yazılmayıb]
GET    /api/reviews
POST   /api/reviews

Business                                [yazılmayıb — indiki addım]
GET    /api/business/dashboard
GET    /api/business/profile
PATCH  /api/business/profile
GET    /api/business/services
POST   /api/business/services
PATCH  /api/business/services/:id
DELETE /api/business/services/:id
GET    /api/business/bookings
PATCH  /api/business/bookings/:id
GET    /api/business/customers
GET    /api/business/reviews
GET    /api/business/portfolio
POST   /api/business/portfolio
DELETE /api/business/portfolio/:id
```

Axtarış nəticələri həm axtarış sözünə, həm də seçilmiş ərazilərə görə qaytarılmalıdır (`providers.service.ts`-də artıq `search`/`area`/`service` filtri var).

### Database entity-ləri — ✅ `schema.prisma`-da tam yazılıb

```text
User, Business, Category, Service, Area, Booking,
Review, Portfolio, SavedProvider, Availability, Notification
```

Qeyd: `Category` cədvəlində `parentId` var (məsələn Gözəllik → Dırnaq). `SavedProvider` istifadəçi ↔ biznes arasında əlaqə cədvəlidir (seçilmişlər), `@@unique([userId, businessId])` ilə təkrar qeyd qarşısı alınır. `Business` cədvəlinə `verified` (boolean) sahəsi əlavə olunub və migration tətbiq edilib.

### Təhlükəsizlik

- Şifrələr plain text saxlanmır, `bcryptjs` ilə hash olunur. ✅
- Access token (15 dəq) və refresh token (7 gün) — stateless JWT, `utils/jwt.ts`. ✅
  - Qeyd: refresh token DB-də saxlanmadığı üçün logout onu server tərəfindən ləğv edə bilmir (yalnız öz-özünə bitir). Real production üçün `RefreshToken` cədvəli əlavə edib logout-da silmək daha təhlükəsiz olardı.
- Rol yoxlaması backend tərəfində: `authenticate` (giriş tələbi) və `requireRole` (rol tələbi) middleware-ləri yazılıb və test edilib. ✅
- `.env` faylı Git-ə düşmür, `.gitignore`-dadır. ✅

---

## Hazırkı vəziyyət

**Frontend:** əsas ekranların hamısı hazırdır (Home, SearchResults, Provider, Booking axını, Profil, Seçilmişlər, Biznes paneli). Backend hələ tam qoşulmadığı üçün data əsasən `localStorage`-based demo servislərdən gəlir.

**Backend:** skelet qurulub, auth və bir neçə ümumi endpoint işləyir.

- ✅ `server/` strukturu (`config`, `middleware`, `modules`, `routes`, `types`, `utils`, `app.ts`, `index.ts`)
- ✅ Prisma qoşulub, SQLite ilə (`dev.db`)
- ✅ `schema.prisma`-da bütün entity-lər yazılıb, migration tətbiq olunub (`Business.verified` daxil)
- ✅ `GET /api/health`, `GET /api/categories` işləyir
- ✅ Auth modulu (`signup`/`signin`/`refresh`/`logout`/`me`) — yazılıb və test edilib
- ✅ `authenticate` / `requireRole` middleware — yazılıb və test edilib
- ✅ Areas API (`GET /api/areas`, `GET /api/areas/:id`) — yazılıb və test edilib
- ✅ Providers API (`GET /api/providers`, `GET /api/providers/:id`) — yazılıb
- ⏳ Business profil API — **növbəti addım** (schedule tipi gözlənilir)
- ⏳ Services, Bookings, Saved, Reviews, Portfolio, Dashboard API-ləri — Business profildən sonra
- ⏳ Frontend-in `services/` qatının API çağırışları ilə əvəzlənməsi (Addım 6) — backend hazır olandan sonra

---

## Yol xəritəsi (addım-addım)

### Addım 1 — Layihənin qurulması ✅

- `client/` (React + TypeScript + Vite)
- `server/` və `shared/` qovluqları
- Git və `.gitignore`
- Mühit dəyişənləri (`.env`, `.env.example`)

### Addım 2 — Frontend ekranları ✅

- Ana səhifə
- Axtarış və nəticələr
- Ərazi seçimi (bir neçə seçim, "Bütün Bakı", öz ərazini əlavə etmək; həm ana səhifədə, həm nəticələr səhifəsində)
- Provider profili
- Rezerv sistemi: xidmət → tarix → saat → xülasə → təsdiq
- Rezervlərin siyahısı
- Seçilmişlər
- Profil
- Giriş / Qeydiyyat və hesab tipi seçimi
- Biznes paneli: dashboard, profil, xidmətlər, rezervlər, müştərilər, portfolio, rəylər, əlçatanlıq

### Addım 3 — Kod səliqəsi ✅

- Kökdə tam `.gitignore` (`node_modules`, `dist`, `.env`, `uploads/`)
- Dublikat və istifadə olunmayan faylların silinməsi
- Eyni adlı, fərqli işli faylların adlarının ayrılması
- `App.css`-in hissələrə bölünməsi: hər səhifənin stili öz `.css` faylında
- `pages/` qovluğunun struktura uyğunlaşdırılması

### Addım 4 — Shared type-lar ⏳ (hələ başlanmayıb)

- `shared/types`: user, business, service, booking, review, area
- `shared/constants`: roles, booking-status
- `client/src/types` faylları (`area.ts`, `provider.ts`) buraya köçürülür

### Addım 5 — Backend ⏳ (davam edir)

- ✅ `server/` qurulması (Express + TypeScript)
- ✅ Prisma schema (+ `Business.verified`)
- ⏳ Seed data (qismən — kateqoriya/ərazi/provider seed-i var, davam edir)
- ✅ Authentication: qeydiyyat, giriş, token yenilənməsi, `me` — test edilib
- ✅ Authorization: `authenticate` / `requireRole` middleware — test edilib
- ✅ Area API
- ✅ Provider API
- ⏳ **Business profil API — indiki addım**
- ⏳ Services API
- ⏳ Booking API
- ⏳ Saved və Review API-ləri
- ⏳ Business API-lərin qalanı: dashboard, portfolio, müştərilər

### Addım 6 — Frontend və backend birləşməsi ⏳

- `services/` qatında API çağırışları
- Mock datanın əvəzinə API datası
- Protected route-lar (rola görə yönləndirmə)
- Giriş vəziyyətinin saxlanması (`store/`)

### Addım 7 — Son işlənmə və test ⏳

- Loading, error və empty state-lər
- Form validasiyası
- Responsive yoxlama (telefon, planşet, kompüter)
- Light/Dark mode yoxlaması
- Bildirişlər
- Təhlükəsizlik yoxlaması
- Bütün axınların əl ilə testi:
  - User: qeydiyyat → axtarış → ərazi → provider → rezerv → təsdiq
  - Business: qeydiyyat → onboarding → xidmət əlavə et → rezervi təsdiqlə

### İlk versiyaya daxil olmayanlar

Real ödəniş, mürəkkəb AI, canlı xəritə, Instagram/WhatsApp inteqrasiyası, abunə sistemi, mürəkkəb analitika. Bunlar ilk işlək versiyadan sonra gələ bilər.

---

## Kod qaydaları

- Kod modul olmalıdır, təkrar istifadə olunan komponentlər yaradılmalıdır.
- Eyni məntiqi iki yerdə yazma. Ortaq məntiq `utils/` və ya `hooks/`-a çıxarılır (nümunə: `areaMatch.ts`).
- Business logic UI komponentlərindən ayrılmalıdır.
- API çağırışları yalnız `services/` qatında olmalıdır.
- Fayl adı komponentin adı ilə eyni olmalıdır (`AreaSelector.tsx` → `AreaSelector.css`).
- Eyni adlı iki fayl fərqli işlər görürsə, adları fərqləndirilməlidir.
- Yeni faylı VS Code-un içindəki `client/src/...` və ya `server/src/...` qovluğunda aç. Faylı `Downloads` kimi kənar qovluqdan açsan, TypeScript minlərlə yalançı xəta göstərəcək.
- Backend-də `app.ts` Express app-ın özüdür (middleware + route-lar), `index.ts` isə yalnız `.env`-i yükləyib serveri başladır — ikisini qarışdırma, route-ları həmişə `app.ts`-ə (və ya ordan çağırılan modullara) yaz.
- Backend modulları `modules/<ad>/` altında üç fayla bölünür: `<ad>.service.ts` (Prisma sorğuları), `<ad>.controller.ts` (request/response, status kodları), `<ad>.routes.ts` (Router, endpoint-lərin qoşulması). Bu nümunə `auth`, `areas`, `providers` modullarında artıq izlənilir.
- `schema.prisma`-da dəyişiklik etdikdən sonra mütləq `npx prisma migrate dev --name <təsvir>` işlət.

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
areaMatch util, remove duplicate area logic
booking flow: date and time steps
business dashboard: today's bookings
server: prisma schema + savedprovider relation fix
server: split app.ts and index.ts
server: areas API, auth/me endpoint, authenticate middleware tested
```

Böyük dəyişiklikdən (fayl silmək, qovluq köçürmək, backend qoşmaq, migration işlətmək) əvvəl mütləq commit et. Beləcə istənilən vaxt geri qayıtmaq olar.
