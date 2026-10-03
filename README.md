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
4. [İstifadəçi tipləri və hesab modeli](#istifadəçi-tipləri-və-hesab-modeli)
5. [Ekranlar](#ekranlar)
6. [Ərazi seçimi necə işləyir](#ərazi-seçimi-necə-işləyir)
7. [Mock data və localStorage](#mock-data-və-localstorage)
8. [Dizayn sistemi](#dizayn-sistemi)
9. [Backend API](#backend-api)
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
- Sadə CSS (səhifə və komponent CSS faylları), qlobal dəyişənlər `styles/variables.css`-də

### Backend

- Node.js + TypeScript
- Express (REST API)
- Prisma ORM
- SQLite (development üçün)
- JWT: access token (15 dəq) və refresh token (7 gün) — `jsonwebtoken`, işləyir
- Şifrə hash-ləmə: `bcryptjs` — işləyir

---

## İşə salmaq

Tələb olunan: **Node.js 20 və ya daha yeni versiya**.

### Backend

```bash
cd server
npm install
npm run dev
```

Server `http://localhost:4000` ünvanında işə düşür.

Yoxlama üçün:

- `http://localhost:4000/api/health` → `{"status":"ok","time":"..."}`
- `http://localhost:4000/api/categories` → kateqoriyalar
- `http://localhost:4000/api/areas` → ərazilər siyahısı

Verilənlər bazası dəyişikliyi etdikdən sonra (schema.prisma-nı redaktə edəndə):

```bash
npx prisma migrate dev --name <qısa-təsvir>
```

### Frontend

Backend ayrı terminalda işləyərkən:

```bash
cd client
npm install
npm run dev
```

Sonra brauzerdə terminalda göstərilən ünvanı aç (adətən `http://localhost:5173`). Frontend `http://localhost:4000/api`-yə bağlanır (`services/api.ts`-dəki `VITE_API_URL`, standart dəyər bu ünvandır — fərqli port işlədirsinizsə `client/.env`-də `VITE_API_URL` təyin edin).

Production build üçün:

```bash
cd client
npm run build
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
    │   ├── layout/           ← AppLayout, TopNav (rola görə fərqli menyu göstərir)
    │   ├── provider/
    │   └── search/
    │
    ├── data/
    │   └── providers.ts      ← mock provider-lər (Home/Explore/Search/Provider hələ buradan oxuyur)
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
    │   ├── BusinessBookings/   ← real API-yə qoşulub (bookingsService.ts)
    │   ├── BusinessDashboard/
    │   ├── BusinessProfile/
    │   ├── BusinessServices/   ← real API-yə qoşulub (businessService.ts)
    │   ├── Dashboard/
    │   ├── Explore/
    │   ├── Home/
    │   ├── Login/              ← real API-yə qoşulub (authService.ts)
    │   ├── Profile/            ← real API-yə qoşulub (/auth/me, logout)
    │   ├── Provider/
    │   ├── Register/           ← real API-yə qoşulub (authService.ts, areasService.ts)
    │   ├── Saved/
    │   └── SearchResults/
    │
    ├── routes/
    │   └── ProtectedRoute.tsx  ← giriş + rol yoxlaması, uyğun olmayanı yönləndirir
    │
    ├── services/
    │   ├── api.ts               ← mərkəzi fetch wrapper: token saxlama, auto-refresh, Authorization header
    │   ├── authService.ts       ← signup/signin/logout/getMe
    │   ├── areasService.ts      ← GET /api/areas
    │   ├── businessService.ts   ← GET/PATCH /api/business/profile
    │   ├── bookingsService.ts   ← GET/POST /api/bookings, PATCH status
    │   └── (köhnə localStorage faylları, tədricən silinəcək) bookingStorage, reviewStorage, favoriteStorage, serviceStorage, portfolioStorage, demoCustomer, demoBusiness, businessProfileStorage
    ├── store/
    ├── styles/
    │   └── variables.css      ← rənglər və ölçülər (bütün səhifə CSS-ləri buraya bağlanmalıdır — light/dark avtomatik işləsin deyə)
    ├── types/
    │   ├── area.ts             ← Area tipi + ərazilər siyahısı (mock, backend-dəki Area-dan ayrı)
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
    ├── App.tsx                ← bütün route-lar, ProtectedRoute ilə qorunur
    ├── App.css                ← qlobal reset + shell + nav
    ├── index.css
    └── main.tsx
```

### Server (`server/`) — REST API tam yazılıb və test edilib

```text
server/
├── src/
│   ├── config/
│   │   └── prisma.ts             ← Prisma Client singleton
│   ├── middleware/
│   │   └── authenticate.ts       ← JWT yoxlaması (authenticate, requireRole) — test edilib
│   ├── modules/
│   │   ├── auth/                 ← signup, signin, refresh, logout, me
│   │   ├── areas/                ← GET /api/areas, GET /api/areas/:id
│   │   ├── providers/            ← GET /api/providers, GET /api/providers/:id (toProviderDTO export olunur)
│   │   ├── business/             ← profile, business-services.*, business-portfolio.*, business-dashboard.*
│   │   ├── bookings/             ← create/list/get/update-status
│   │   ├── saved/                ← seçilmişlər
│   │   └── reviews/               ← rəylər
│   ├── routes/                   ← hələ boş (route-lar modul daxilində)
│   ├── types/                    ← hələ boş
│   ├── utils/
│   │   └── jwt.ts                ← token sign/verify (access + refresh)
│   ├── app.ts                    ← Express app, middleware, bütün route-lar qoşulub
│   └── index.ts                  ← dotenv, server-i başladır
├── prisma/
│   ├── schema.prisma              ← tam entity modeli (`Business.verified`, `Portfolio.caption` daxil)
│   └── migrations/
├── .env                          ← DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PORT (Git-ə düşmür)
└── package.json
```

Hər modul üç fayla bölünür: `<ad>.service.ts` (Prisma sorğuları), `<ad>.controller.ts` (request/response, status kodları), `<ad>.routes.ts` (Router). Bütün endpoint-lərin siyahısı [Backend API](#backend-api) bölməsindədir.

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

## İstifadəçi tipləri və hesab modeli

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
- rezervləri görmək, təsdiqləmək, tamamlamaq və ya ləğv etmək;
- müştəri məlumatlarını və rəyləri görmək;
- dashboard statistikalarını izləmək;
- **həm də** başqa ustalara baxıb rezerv edə, seçilmişlərə əlavə edə, rəy yaza bilər (aşağıya bax).

### Hesab modeli: bir hesab, iki rol imkanı

`User.email` bazada **unikaldır** — eyni email ilə həm `USER`, həm `BUSINESS` kimi iki ayrı hesab açıla bilməz. Əvəzində **bir hesab hər iki işi görə bilir**:

- Qeydiyyat zamanı seçilən rol (`USER` və ya `BUSINESS`) hesabın "əsas kimliyini" təyin edir — biznes hesabı öz panelini (`/business*`) idarə edir, adi istifadəçi hesabı isə onlara girə bilmir.
- Amma rezerv etmək, seçilmişlərə əlavə etmək və rəy yazmaq üçün backend-də rol məhdudiyyəti **yoxdur** (`requireRole` bu üç modulda işlənmir) — yalnız giriş edilmiş olmaq kifayətdir. Deməli biznes hesabı ilə girib başqa bir ustaya rahatlıqla rezerv edə bilərsiniz.
- `GET /api/bookings` bunu nəzərə alır: nəticədə həm sizin **özünüzün müştəri kimi etdiyi** rezervlər, həm (biznesiniz varsa) **sizə gələn** rezervlər birləşir. Frontend tərəfdə bunlar `customerId`-ə görə ayrılır: `/bookings` (TopNav-da "Rezervlər" linki, USER üçün) yalnız öz etdiklərinizi göstərir, `/business-bookings` (BUSINESS üçün "Rezervlər" linki) isə yalnız sizə gələnləri.
- Eyni email ilə təkrar qeydiyyat cəhdi indi dəqiq mesaj verir: _"Bu email artıq [istifadəçi/biznes] hesabı kimi qeydiyyatdan keçib. Həmin hesabla daxil olun."_

### Rol və icazə (texniki)

Backend hər istifadəçiyə rol təyin edir: `USER` və ya `BUSINESS` (Prisma schema-da `Role` enum-u var, JWT payload-a da yazılır). `authenticate` middleware-i qorunan route-larda girişi yoxlayır, `requireRole` isə yalnız **bir rola xas** əməliyyatlarda (məs. biznes profilini redaktə etmək) əlavə məhdudiyyət qoyur — bookings/saved/reviews-də işlənmir, yuxarıdakı səbəbdən.

Frontend tərəfdə `routes/ProtectedRoute.tsx` eyni məntiqi tətbiq edir: `role` prop-u verilməzsə yalnız giriş tələb olunur, verilsə uyğun olmayan rol öz əsas səhifəsinə (`/` və ya `/business`) yönləndirilir.

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

| Ekran             | Qovluq                    | Naviqasiyada       |
| ----------------- | ------------------------- | ------------------ |
| Panel (dashboard) | `pages/BusinessDashboard` | "Panel"            |
| Biznes profili    | `pages/BusinessProfile`   | Profil menyusundan |
| Xidmətlər         | `pages/BusinessServices`  | Paneldən           |
| Rezervlər (gələn) | `pages/BusinessBookings`  | "Rezervlər"        |
| Müştərilər        | `pages/BusinessCustomers` | Paneldən           |
| Portfolio         | `pages/BusinessPortfolio` | Paneldən           |

TopNav rola görə fərqli linklər göstərir: `BUSINESS` hesabı "Ana səhifə" yerinə "Panel"ə (`/business`), "Rezervlər" linki ilə isə `/bookings` yerinə `/business-bookings`-ə aparılır. "Kəşf et", "Seçilmişlər", "Profil" hər iki rol üçün ortaqdır.

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

| Fayl                                       | Nə edir                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `types/area.ts`                            | `Area` tipini və ərazilər siyahısını saxlayır (rayon, məhəllə, metro)     |
| `components/AreaSelector/AreaSelector.tsx` | ərazi seçim modalı (ekranda görünən hissə)                                |
| `components/AreaSelector/AreaSelector.css` | modalın dizaynı                                                           |
| `utils/areaMatch.ts`                       | provider-in ərazisi seçilmiş əraziyə uyğundurmu, onu yoxlayır             |
| `services/areasService.ts`                 | backend-dəki `GET /api/areas`-i çağırır (Register.tsx-də istifadə olunur) |

**Qaydalar:**

- İstifadəçi bir neçə ərazi seçə bilər.
- "Bütün Bakı" (`id: "all-baku"`) seçiləndə digər seçimlər silinir.
- Konkret ərazi seçiləndə "Bütün Bakı" avtomatik çıxır.
- İstifadəçi siyahıda olmayan ərazini özü yaza və əlavə edə bilər (`type: "custom"`).
- Seçilmiş ərazilər axtarış zamanı URL-ə `?area=...` kimi yazılır.

**Uyğunluq məntiqi (`areaMatch.ts`):** provider bir rayonda qeydiyyatdadır (məsələn, Nərimanov). İstifadəçi isə "Gənclik" və ya "Gənclik metrosu" seçə bilər. Bu ərazilər `areaToDistrict` cədvəlində rayona bağlanır. Yeni ərazi əlavə edəndə yalnız bu cədvələ bir sətir yazmaq kifayətdir. Məntiq başqa yerdə təkrarlanmamalıdır.

**Diqqət:** `types/area.ts`-dəki mock siyahı ilə backend-dəki `Area` cədvəli (`seed.ts` ilə doldurulur) hazırda **iki ayrı mənbədir**. `Register.tsx` artıq backend-dən (`areasService.ts`) oxuyur, amma `AreaSelector` komponenti (Home/SearchResults-da) hələ mock siyahıdan istifadə edir — bunlar Explore/Search backend-ə keçəndə birləşdirilməlidir.

---

## Mock data və localStorage

Backend tam hazırdır, amma frontend-in bəzi hissələri hələ ona keçməyib:

**Artıq real API-yə qoşulub:** Login, Register, Profile, BusinessBookings, BusinessServices.

**Hələ mock/localStorage-dadır:**

- `data/providers.ts` — Home, Explore, SearchResults, Provider profili bu mock siyahıdan oxuyur (`GET /api/providers` artıq yazılıb, qoşulmayıb)
- `services/bookingStorage.ts` — müştərinin öz rezervləri (`Bookings.tsx`) hələ bundan oxuyur (`bookingsService.ts` artıq var, BusinessBookings onsuz istifadə edir, Bookings.tsx hələ köçməyib)
- `services/favoriteStorage.ts` — Seçilmişlər (backend-dəki Saved API hazırdır, qoşulmayıb)
- `services/reviewStorage.ts` — rəy yazma (backend-dəki Reviews API hazırdır, qoşulmayıb)
- `services/portfolioStorage.ts`, `businessProfileStorage.ts` (qismən — `BusinessProfile.tsx` hələ köçməyib, `businessService.ts` yalnız `Register.tsx`-də istifadə olunur)

Hər biri backend-ə köçəndə köhnə fayl silinəcək, komponentin özü (JSX, CSS) demək olar dəyişməyəcək — yalnız data mənbəyi dəyişir.

---

## Dizayn sistemi

Əsas istiqamət: **ağ, yumşaq yaşıl, tünd yaşıl, yumşaq boz**. Əsas accent rəng: `#2E7D5B`.

- Ümumi görünüş premium və minimal olmalıdır. Həm gözəllik, həm santexnik, həm repetitor eyni dizaynda düzgün görünməlidir.
- Kartlar ağ, sərhədlər çox zərif, künc radiusu təxminən 14–18px.
- Düymələr yuvarlaq, amma həddindən artıq pill formasında olmamalıdır.
- Light və Dark mode dəstəklənir. Seçim brauzerin yaddaşında saxlanır (`hooks/useTheme.ts`).
- Rənglər və ölçülər `styles/variables.css` faylında toplanıb. **Hər səhifənin CSS-i öz lokal dəyişənlərini düz rəng kodu (`#ffffff` kimi) yox, mütləq `variables.css`-dəki qlobal dəyişənlərə bağlamalıdır** — əks halda qaranlıq modda həmin səhifə ağ qalır (bu, `BusinessServices.css`-də baş vermişdi, düzəldilib: lokal `--bs-*` dəyişənləri indi `var(--color-*)`-ə bağlıdır).
- Kateqoriya kartları üçün gradient fonlar `--gradient-teal`, `--gradient-pink`, `--gradient-blue`, `--gradient-purple` dəyişənləri ilə idarə olunur, hansı kateqoriyaya hansı gradient/ikon düşdüyü `utils/categoryVisual.ts`-dədir.

---

## Backend API

Bütün endpoint-lər yazılıb və test edilib (əks halda qeyd olunur).

```text
Auth
POST   /api/auth/signup         → qeydiyyat (email unikal; artıq varsa hansı rolla olduğunu bildirir)
POST   /api/auth/signin
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me             ← authenticate ilə qorunur

Ümumi
GET    /api/providers           → axtarış/filtr (search, area, service query parametrləri)
GET    /api/providers/:id       → xidmətlər, rəylər, portfolio daxil
GET    /api/categories
GET    /api/areas
GET    /api/areas/:id

Rezerv                          ← giriş tələb olunur, rol məhdudiyyəti yoxdur
POST   /api/bookings            → iş saatları + üst-üstə düşmə yoxlanılır
GET    /api/bookings            → öz etdiklərin + (biznesin varsa) sənə gələnlər, birlikdə
GET    /api/bookings/:id
PATCH  /api/bookings/:id        → status keçid qaydaları (PENDING→CONFIRMED/CANCELLED, CONFIRMED→COMPLETED/CANCELLED)

Seçilmişlər                     ← giriş tələb olunur
GET    /api/saved
POST   /api/saved/:providerId
DELETE /api/saved/:providerId

Rəylər                          ← giriş tələb olunur (POST/mine), GET açıqdır
GET    /api/reviews?providerId=
GET    /api/reviews/mine
POST   /api/reviews             → yalnız COMPLETED rezervə, bir rezerv üçün bir rəy

Business                        ← authenticate + requireRole("BUSINESS")
GET    /api/business/profile
PATCH  /api/business/profile    → ad, kateqoriya, ərazi, telefon, təsvir, iş saatları (schedule)
GET    /api/business/dashboard  → xidmət/rezerv/gəlir/müştəri sayları, profil tamamlanma faizi
GET    /api/business/customers  → müştəri siyahısı, qruplaşdırılıb
GET    /api/business/services
POST   /api/business/services
PATCH  /api/business/services/:id
DELETE /api/business/services/:id
GET    /api/business/portfolio
POST   /api/business/portfolio  → şəkil base64 data URL kimi göndərilir
DELETE /api/business/portfolio/:id
```

Qeyd: README-dəki ilkin planda olan ayrıca `GET /api/business/bookings` və `GET /api/business/reviews` yazılmayıb — bunların yerinə ümumi `GET /api/bookings` (biznes üçün avtomatik sənə gələnləri də qaytarır) və `GET /api/reviews?providerId=` istifadə olunur.

### Database entity-ləri — ✅ `schema.prisma`-da tam yazılıb

```text
User, Business, Category, Service, Area, Booking,
Review, Portfolio, SavedProvider, Availability, Notification
```

Qeyd: `Category` cədvəlində `parentId` var (məsələn Gözəllik → Dırnaq). `SavedProvider` istifadəçi ↔ biznes arasında əlaqə cədvəlidir (seçilmişlər), `@@unique([userId, businessId])` ilə təkrar qeyd qarşısı alınır. `Business.verified` və `Portfolio.caption` sahələri sonradan əlavə olunub, migration tətbiq edilib.

### Təhlükəsizlik

- Şifrələr plain text saxlanmır, `bcryptjs` ilə hash olunur. ✅
- Access token (15 dəq) və refresh token (7 gün) — stateless JWT, `utils/jwt.ts`. ✅
  - Qeyd: refresh token DB-də saxlanmadığı üçün logout onu server tərəfindən ləğv edə bilmir (yalnız öz-özünə bitir). Real production üçün `RefreshToken` cədvəli əlavə edib logout-da silmək daha təhlükəsiz olardı.
- Rol yoxlaması backend tərəfində: `authenticate` (giriş tələbi) və `requireRole` (yalnız bir rola xas əməliyyatlar üçün) middleware-ləri yazılıb və test edilib. ✅
- `.env` faylı Git-ə düşmür, `.gitignore`-dadır. ✅

---

## Hazırkı vəziyyət

**Backend: tam hazır və test edilib.** Auth, areas, providers, business profile/services/portfolio/dashboard, bookings, saved, reviews — hamısı yazılıb, PowerShell ilə ardıcıl test edilib, bir-birinə bağlı ssenarilər (müştəri rezerv edir → biznes təsdiqləyir/tamamlayır → müştəri rəy yazır) işləyir.

**Frontend: real API-yə keçid davam edir.**

- ✅ Token saxlama, avtomatik refresh, `Authorization` header (`services/api.ts`)
- ✅ Login, Register (kateqoriya/ərazi seçimi daxil) — real `signup`/`signin`
- ✅ Protected route-lar: giriş olmadan `/account-type`-a yönləndirir, rola uyğun olmayan səhifəyə girişi əngəlləyir (`routes/ProtectedRoute.tsx`)
- ✅ TopNav rola görə fərqli menyu göstərir
- ✅ Profile səhifəsi — real istifadəçi (`/auth/me`), işləyən logout
- ✅ BusinessBookings — gələn rezervləri göstərir, təsdiq/tamamla/ləğv real backend-ə yazır
- ✅ BusinessServices — real CRUD, qaranlıq mod rəng xətası düzəldilib
- ⏳ Home, Explore, SearchResults, Provider profili — hələ `data/providers.ts` mock-undan oxuyur
- ⏳ Bookings.tsx (müştərinin öz rezervləri) — hələ `bookingStorage.ts`-dən oxuyur
- ⏳ Saved.tsx — hələ `favoriteStorage.ts`-dən oxuyur
- ⏳ Rəy yazma axını — hələ `reviewStorage.ts`-dən oxuyur
- ⏳ BusinessProfile, BusinessDashboard, BusinessCustomers, BusinessPortfolio — backend hazır, frontend hələ qoşulmayıb

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

### Addım 5 — Backend ✅ (tamamlandı)

- ✅ `server/` qurulması (Express + TypeScript)
- ✅ Prisma schema (+ `Business.verified`, `Portfolio.caption`)
- ✅ Seed data
- ✅ Authentication: qeydiyyat, giriş, token yenilənməsi, `me`
- ✅ Authorization: `authenticate` / `requireRole` middleware
- ✅ Area, Provider API-ləri
- ✅ Business profil, services, portfolio, dashboard/customers API-ləri
- ✅ Booking API (üst-üstə düşmə yoxlaması, status keçidləri)
- ✅ Saved və Review API-ləri

### Addım 6 — Frontend və backend birləşməsi ⏳ (davam edir)

- ✅ `services/api.ts` — token saxlama, avtomatik refresh
- ✅ Login, Register, Profile, BusinessBookings, BusinessServices
- ✅ Protected route-lar (rola görə yönləndirmə)
- ⏳ Home, Explore, SearchResults, Provider → `GET /api/providers`
- ⏳ Bookings.tsx (müştəri) → `bookingsService.ts`
- ⏳ Saved.tsx → yeni `savedService.ts`
- ⏳ Rəy yazma → yeni `reviewsService.ts`
- ⏳ BusinessProfile, BusinessDashboard, BusinessCustomers, BusinessPortfolio
- ⏳ Köhnə localStorage fayllarının silinməsi (hamısı köçəndən sonra)

### Addım 7 — Son işlənmə və test ⏳

- Loading, error və empty state-lər
- Form validasiyası
- Responsive yoxlama (telefon, planşet, kompüter)
- Light/Dark mode yoxlaması (hər səhifənin CSS-i qlobal dəyişənlərə bağlı olmalıdır)
- Bildirişlər
- Təhlükəsizlik yoxlaması
- Bütün axınların əl ilə testi:
  - User: qeydiyyat → axtarış → ərazi → provider → rezerv → təsdiq
  - Business: qeydiyyat → onboarding → xidmət əlavə et → rezervi təsdiqlə
  - Bir hesabla hər iki rol: biznes hesabı ilə başqa ustaya rezerv etmək

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
- Backend modulları `modules/<ad>/` altında fayllara bölünür: `<ad>.service.ts` (Prisma sorğuları), `<ad>.controller.ts` (request/response, status kodları), `<ad>.routes.ts` (Router, endpoint-lərin qoşulması).
- **CSS yazanda lokal dəyişənləri `#ffffff` kimi sabit rəng yox, `variables.css`-dəki qlobal dəyişənlərə (`var(--color-surface)`, `var(--color-text)` və s.) bağla — əks halda qaranlıq modda o səhifə ağ qalır.**
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
server: areas API, auth/me endpoint, authenticate middleware tested
server: business profile, services, bookings, saved, reviews, portfolio, dashboard APIs
frontend: real auth flow, token storage, protected routes by role
frontend: Profile page wired to /auth/me, working logout
frontend: BusinessBookings wired to real API
business services dark-mode CSS fix
```

Böyük dəyişiklikdən (fayl silmək, qovluq köçürmək, backend qoşmaq, migration işlətmək) əvvəl mütləq commit et. Beləcə istənilən vaxt geri qayıtmaq olar.
