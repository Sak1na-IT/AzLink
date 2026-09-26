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
10. [Yol xəritəsi (addım-addım)](#yol-xəritəsi-addım-addım)
11. [Kod qaydaları](#kod-qaydaları)
12. [Git iş qaydası](#git-iş-qaydası)

---

## Texnologiyalar

### Frontend

- React + TypeScript
- Vite
- React Router (`react-router-dom`)
- Lucide (`lucide-react`) ikonlar üçün
- Sadə CSS (səhifə və komponent CSS faylları)

### Backend (planlaşdırılır)

- Node.js + TypeScript
- Express (REST API)
- Prisma ORM
- Database (Prisma ilə uyğun olan SQL database)
- JWT: access token və refresh token

---

## İşə salmaq

Tələb olunan: **Node.js 20 və ya daha yeni versiya**.

Frontend-i işə salmaq üçün:

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

Backend başlayandan sonra bu bölməyə `server/` üçün əmrlər əlavə olunacaq.

---

## Layihə strukturu

### Hazırkı struktur

```text
AzLink/
│
├── client/                       ← React + Vite
│   ├── public/
│   └── src/
│       ├── assets/
│       │
│       ├── components/
│       │   ├── AreaSelector/     ← ərazi seçimi modalı
│       │   ├── auth/
│       │   ├── booking/
│       │   ├── business/
│       │   ├── common/
│       │   ├── home/             ← HomeHero, OverviewStrip, PopularNearby, TodayOverview
│       │   ├── layout/           ← AppLayout, TopNav
│       │   ├── provider/
│       │   └── search/
│       │
│       ├── data/
│       │   └── providers.ts      ← mock provider-lər
│       │
│       ├── hooks/
│       │   └── useTheme.ts       ← light/dark mode
│       │
│       ├── pages/
│       │   ├── AccountType/
│       │   ├── Auth/
│       │   ├── Booking/
│       │   ├── BookingStart/
│       │   ├── Bookings/
│       │   ├── BusinessBookings/
│       │   ├── BusinessDashboard/
│       │   ├── BusinessProfile/
│       │   ├── BusinessServices/
│       │   ├── Dashboard/
│       │   ├── Explore/
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Profile/
│       │   ├── Provider/
│       │   ├── Register/
│       │   ├── Saved/
│       │   └── SearchResults/
│       │
│       ├── services/
│       ├── store/
│       ├── styles/
│       │   └── variables.css     ← rənglər və ölçülər
│       ├── types/
│       │   ├── area.ts           ← Area tipi + ərazilər siyahısı
│       │   └── provider.ts
│       ├── utils/
│       │   └── areaMatch.ts      ← ərazi uyğunluğu məntiqi (tək yerdə)
│       │
│       ├── App.tsx
│       ├── App.css
│       ├── index.css
│       └── main.tsx
│
├── server/                       ← backend (planlaşdırılır)
├── shared/                       ← ortaq type-lar (planlaşdırılır)
├── .gitignore
└── README.md
```

### Planlaşdırılan struktur (backend gəldikdən sonra)

```text
server/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── businesses/
│   │   ├── categories/
│   │   ├── services/
│   │   ├── areas/
│   │   ├── providers/
│   │   ├── bookings/
│   │   ├── reviews/
│   │   ├── portfolio/
│   │   ├── availability/
│   │   └── notifications/
│   ├── database/
│   ├── routes/
│   ├── utils/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json

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

Backend hər istifadəçiyə rol təyin edəcək: `USER` və ya `BUSINESS`. User biznes dashboard-a daxil ola bilməməlidir. Bu yoxlama yalnız frontend-də yox, **backend-də də məcburidir**.

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

**Diqqət:** `types/area.ts`-dəki id-lər və `areaMatch.ts`-dəki adlar eyni yazılışla uyğun olmalıdır (məsələn `inşaatçılar metrosu`).

---

## Mock data

Backend olmadığı üçün provider-lər `client/src/data/providers.ts` faylındadır.

Backend gələndə bu fayl birbaşa silinməyəcək. Əvvəlcə `services/` qovluğunda API çağırışları yazılacaq, komponentlər mock datanın əvəzinə həmin service-lərdən istifadə edəcək. Bu şəkildə UI kodu dəyişmir.

---

## Dizayn sistemi

Əsas istiqamət: **ağ, yumşaq yaşıl, tünd yaşıl, yumşaq boz**. Əsas accent rəng: `#2E7D5B`.

- Ümumi görünüş premium və minimal olmalıdır. Həm gözəllik, həm santexnik, həm repetitor eyni dizaynda düzgün görünməlidir.
- Kartlar ağ, sərhədlər çox zərif, künc radiusu təxminən 14–18px.
- Düymələr yuvarlaq, amma həddindən artıq pill formasında olmamalıdır.
- Light və Dark mode dəstəklənir. Seçim brauzerin yaddaşında saxlanır (`hooks/useTheme.ts`).
- Rənglər və ölçülər `styles/variables.css` faylında toplanıb. Yeni rəng lazım olsa, əvvəlcə orada dəyişən yarat.

---

## Backend planı

### Əsas məsuliyyətlər

authentication, authorization, users, businesses, services, categories, areas, bookings, reviews, saved providers, portfolio, availability, notifications.

### API (REST)

```text
Auth
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/refresh
POST   /api/auth/logout

Ümumi
GET    /api/providers
GET    /api/providers/:id
GET    /api/categories
GET    /api/areas

Rezerv
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id

Seçilmişlər
POST   /api/saved/:providerId
DELETE /api/saved/:providerId

Rəylər
GET    /api/reviews
POST   /api/reviews

Business
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

Axtarış nəticələri həm axtarış sözünə, həm də seçilmiş ərazilərə görə qaytarılmalıdır.

### Database entity-ləri

```text
User, Business, Category, Service, Area, Booking,
Review, Portfolio, SavedProvider, Availability, Notification
```

Qeyd: `Category` cədvəlində `parentId` olmalıdır (məsələn Gözəllik → Dırnaq).

### Təhlükəsizlik

- Şifrələr plain text saxlanmır, hash olunur.
- Access token və refresh token mexanizmi.
- Rol yoxlaması backend tərəfində məcburidir.
- `.env` faylı Git-ə düşmür. Yalnız dəyərsiz `.env.example` commit olunur.

---

## Yol xəritəsi (addım-addım)

### Addım 1 — Layihənin qurulması

- `client/` (React + TypeScript + Vite)
- `server/` və `shared/` qovluqları
- Git və `.gitignore`
- Mühit dəyişənləri (`.env`, `.env.example`)

### Addım 2 — Frontend ekranları

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

### Addım 3 — Kod səliqəsi

Frontend bitəndən sonra, backend-dən əvvəl edilir. Backend qoşulanda `services/` və `types/` dəyişəcək, ona görə qarışıq struktur üzərinə backend qoşmaq sonra iki dəfə iş çıxarar.

- Kökdə tam `.gitignore` (`node_modules`, `dist`, `.env`, `uploads/`)
- Dublikat və istifadə olunmayan faylların silinməsi
- Eyni adlı, fərqli işli faylların adlarının ayrılması
- `App.css`-in hissələrə bölünməsi: hər səhifənin stili öz `.css` faylında
- `pages/` qovluğunun struktura uyğunlaşdırılması

Qayda: hər dəfə bir şey dəyiş, Problems panelinə bax, xəta varsa geri qaytar.

### Addım 4 — Shared type-lar

- `shared/types`: user, business, service, booking, review, area
- `shared/constants`: roles, booking-status
- `client/src/types` faylları (`area.ts`, `provider.ts`) buraya köçürülür

### Addım 5 — Backend

- `server/` qurulması (Express + TypeScript)
- Prisma schema və seed data
- Authentication: qeydiyyat, giriş, token yenilənməsi
- Authorization: `USER` və `BUSINESS` rolları, middleware
- Provider, category, area API-ləri
- Booking API
- Saved və Review API-ləri
- Business API-ləri: dashboard, profil, xidmətlər, rezervlər, müştərilər, portfolio

### Addım 6 — Frontend və backend birləşməsi

- `services/` qatında API çağırışları
- Mock datanın əvəzinə API datası
- Protected route-lar (rola görə yönləndirmə)
- Giriş vəziyyətinin saxlanması (`store/`)

### Addım 7 — Son işlənmə və test

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
- Yeni faylı VS Code-un içindəki `client/src/...` qovluğunda aç. Faylı `Downloads` kimi kənar qovluqdan açsan, TypeScript minlərlə yalançı xəta göstərəcək.

---

## Git iş qaydası

Hər tamamlanmış işdən sonra commit et:

```bash
git add .
git commit -m "qısa təsvir"
```

Nümunə mesajlar:

```text
areaMatch util, remove duplicate area logic
booking flow: date and time steps
business dashboard: today's bookings
```

Böyük dəyişiklikdən (fayl silmək, qovluq köçürmək, backend qoşmaq) əvvəl mütləq commit et. Beləcə istənilən vaxt geri qayıtmaq olar.
