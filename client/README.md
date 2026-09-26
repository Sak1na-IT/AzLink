# AzLink

## 1. AzLink haqqında

AzLink Bakı üzrə xidmət göstərən mütəxəssisləri (gözəllik, ev xidmətləri, avtomobil, təhsil, tədbir, heyvanlar, texnologiya, fitness) tapmaq və onlara onlayn rezerv etmək üçün veb platformadır.

Platformada iki cür hesab nəzərdə tutulur:

- **İstifadəçi (müştəri):** usta axtarır, profilə baxır, rezerv edir, seçilmişlərə əlavə edir, öz rezervlərini idarə edir, tamamlanmış xidmətə rəy yazır.
- **Biznes sahibi (usta):** öz profilini, xidmətlərini və iş qrafikini idarə edir, gələn rezervləri təsdiqləyir, tamamlayır və ya ləğv edir, müştərilərini və rəylərini görür.

**Qonaq** (giriş etməmiş istifadəçi) sərbəst axtara və profillərə baxa bilər — bu, qəsdən belədir: platforma məzmunu hər kəsə açıqdır, giriş yalnız rezerv, seçilmişlər və şəxsi bölmələr üçün lazımdır.

Rol yalnız **qeydiyyat zamanı** seçilir (bir hesab = bir rol). Biznes qeydiyyatı adi sahələrdən (ad, email, şifrə) əlavə olaraq biznes adı, xidmət kateqoriyası, rayon və telefon tələb edir.

> **Vəziyyət:** layihə hazırda **frontend** mərhələsindədir. Bütün əsas funksionallıq (müştəri və biznes tərəfi) işləkdir, məlumatlar isə mock data və brauzerin `localStorage`-indən gəlir. Backend hələ yazılmayıb.

---

## 2. Texnologiyalar

### Frontend (hazırdır, `client/`)

| Texnologiya                                                                                      | Nə üçün                                 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **React + TypeScript**                                                                           | Komponent əsaslı UI, tip təhlükəsizliyi |
| **Vite**                                                                                         | Sürətli development server və build     |
| **React Router** (`react-router-dom`)                                                            | Səhifələr arası naviqasiya              |
| **lucide-react**                                                                                 | İkonlar                                 |
| **Sadə CSS** (hər səhifə/komponent üçün ayrı `.css`, ortaq dəyişənlər `styles/variables.css`-də) | Açıq/tünd tema və ardıcıl görünüş       |
| **oxlint**                                                                                       | Kod yoxlaması                           |

### Backend (planlaşdırılır, `server/`)

| Texnologiya           | Nə üçün                                              |
| --------------------- | ---------------------------------------------------- |
| **Node.js + Express** | REST API                                             |
| **Prisma**            | Verilənlər bazası sxemi və sorğular                  |
| **Auth və rollar**    | Müştəri və biznes sahibi rolları, sahiblik yoxlaması |

`shared/` qovluğu client və server üçün ortaq tip təyinatlarına ayrılıb (`User`, `Booking`, `Provider`).

---

## 3. Layihə strukturu

```
AzLink/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # AreaSelector, layout, ortaq UI hissələri
│       ├── data/               # categories.ts, providers.ts (mock ustalar)
│       ├── hooks/              # useTheme
│       ├── pages/
│       │   ├── Home, Explore, SearchResults, Provider   # müştəri: kəşf
│       │   ├── Booking, BookingStart, Bookings          # müştəri: rezerv
│       │   ├── Saved, Profile                           # müştəri: şəxsi
│       │   ├── AccountType, Register, Login             # giriş axını
│       │   └── Business*                                # biznes paneli
│       │       (Dashboard, Bookings, Services, Profile,
│       │        Portfolio, Customers)
│       ├── services/           # bookingStorage, serviceStorage,
│       │                       # reviewStorage, portfolioStorage,
│       │                       # businessProfileStorage,
│       │                       # demoCustomer, demoBusiness
│       ├── store/
│       ├── styles/             # variables.css
│       └── types/              # area.ts, provider.ts, portfolio.ts, schedule.ts
├── server/                    # backend (hələ boşdur)
├── shared/                    # ortaq tiplər (hələ boşdur)
└── README.md
```

---

## 4. İşləyən funksiyalar

**Giriş axını**

- `/account-type` → rol seçimi (İstifadəçi / Biznes sahibi) → `/register?role=...`
- Qeydiyyat: biznes seçilibsə kateqoriya, rayon və telefon əlavə tələb olunur
- Giriş: `/login?role=...` → uğurlu girişdən sonra rola görə yönləndirmə

**Müştəri tərəfi**

- Ana səhifə, ərazi seçimi, kəşf et və axtarış nəticələri
- Usta profili: xidmətlər, iş nümunələri (portfolio), rəylər, orta reytinq
- Rezerv axını: xidmət, tarix, saat seçimi — saatlar xidmətin müddətinə görə hesablanır, dolu/keçmiş saatlar bağlanır, eyni vaxta ikinci rezerv serverdə (hazırda frontend-də) əngəllənir
- Rezervlərim: statusa görə filtr (Hamısı / Aktiv / Tamamlanmış / Ləğv edilənlər), aktiv rezervi ləğv etmə
- Tamamlanmış rezervə rəy yazma (ulduz + şərh), bir rezerv üçün bir rəy
- Seçilmişlər, profil səhifələri

**Biznes tərəfi**

- Panel: xidmət, rezerv, təsdiqlənmiş, tamamlanmış, gəlir və müştəri sayları — hamısı real rezervlərdən hesablanır
- Rezervlər: status sekmeleri (Hamısı / Gözləyir / Təsdiqlənmiş / Tamamlanmış / Ləğv edilib), "Tamamlanmış" daxilində dövr filtri (Bu həftə / Bu ay / Ümumi)
- Gələn rezervi **təsdiqləmək**, **tamamlamaq** və ya **ləğv etmək**
- Xidmətlər: əlavə etmə, redaktə, silmə (validasiya ilə) — müştəri profilində və rezerv səhifəsində dərhal görünür
- Biznes profili: ad, kateqoriya, rayon, telefon, təsvir
- İş saatları (həftəlik qrafik)
- Müştərilər siyahısı, portfolio şəkilləri, gələn rəylər
- Profil tamamlanma faizi (dashboard-da göstərilir)

**İki tərəfin bağlantısı**

Müştəri rezerv edəndə status `PENDING` olur. Biznes təsdiqləyəndə `CONFIRMED`, tamamlayanda `COMPLETED` olur — müştəri hər dəfə öz rezervlərində yenilənmiş statusu görür. Yalnız `COMPLETED` statusuna rəy yazıla bilər.

---

## 5. Demo rejimi

Backend olmadığı üçün bütün məlumat brauzerdə `localStorage` açarları ilə saxlanılır:

| Açar                           | Nə saxlanır                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `azlink-demo-bookings`         | Rezervlər                                                    |
| `azlink-demo-services`         | Biznes xidmətləri                                            |
| `azlink-demo-reviews`          | Rəylər                                                       |
| `azlink-demo-business-profile` | Biznes profili (ad, kateqoriya, rayon, telefon, iş saatları) |
| portfolio üçün ayrıca açar     | İş nümunəsi şəkilləri                                        |

Demo məlumatı sıfırlamaq üçün: DevTools → **Application → Local Storage** → müvafiq açarı sil, səhifəni yenilə.

Hazırda daxil olmuş şəxs sabitdir: müştəri `services/demoCustomer.ts`-də, biznes `services/demoBusiness.ts`-də (`CURRENT_PROVIDER_ID`, defolt "Nail by Aysel"). Qeydiyyat formasından yazılan biznes məlumatları da bu tək demo profilə yazılır. Auth yazılanda (Addım 5) bu fayllar silinəcək və hər hesab öz məlumatını görəcək.

Rezerv və xidmət məntiqi ayrıca fayllarda cəmlənib (`services/*.ts`). Backend gələndə funksiyalar API çağırışları ilə əvəz olunacaq, səhifələr dəyişməyəcək.

---

## 6. İşə salmaq

```bash
cd client
npm install
npm run dev
```

Brauzerdə Vite-in göstərdiyi ünvanı açın (adətən `http://localhost:5173`).

---

## 7. Yol xəritəsi

**Addım 2: Biznes paneli — ✅ Tamamlandı**

- [x] Rezervlər (təsdiq, tamamla, ləğv)
- [x] Xidmətlər (əlavə/redaktə/sil)
- [x] Dashboard (bütün sayğaclar real məlumatdan)
- [x] Xidmətlərin müştəri tərəfində görünməsi
- [x] Biznes profili
- [x] İş saatları
- [x] Müştərilər, portfolio, rəylər
- [x] Onboarding (qeydiyyat axını)

**Sonrakı addımlar**

| Addım | İş                                                                                | Vəziyyət                        |
| ----- | --------------------------------------------------------------------------------- | ------------------------------- |
| 3     | Kod səliqəsi: CSS dublikat sinif adları                                           | ✅ Yoxlanıldı, təkrar tapılmadı |
| 3     | Kod səliqəsi: istifadəsiz köhnə fayllar (`components/booking/Booking.tsx` və s.)  | ⬜ Yoxlanılır                   |
| 4     | Ortaq tiplər: `User`, `Booking`, `Provider` `shared/` qovluğuna                   | ⬜                              |
| 5     | Backend: Express + Prisma, auth, rollar, bütün API-lər                            | ⬜                              |
| 6     | Birləşmə: mock data və `localStorage` əvəzinə real API                            | ⬜                              |
| 7     | Son işlənmə: loading/xəta halları, validasiya, responsive, təhlükəsizlik, testlər | ⬜                              |

---

## 8. Backend planı (Addım 5)

Backend yazılanda bu qaydalar tətbiq olunacaq:

- Parollar hash-lənir, düz mətn saxlanılmır. Giriş və qeydiyyat endpoint-lərində sürət limiti olur.
- Qeydiyyatda yalnız `Customer` və `Provider` rolları qəbul olunur, `Admin` rolu heç vaxt qeydiyyatdan verilmir.
- Sahiblik yoxlaması serverdə edilir: usta yalnız öz xidmətlərini və rezervlərini, müştəri yalnız öz rezervlərini görür.
- Eyni saata iki rezervin düşməsi serverdə tranzaksiya ilə əngəllənir (indi bu yoxlama yalnız frontend-dədir).
- Giriş bir dəfə olur, sessiya saxlanılır; rol hesaba bağlıdır, giriş zamanı ayrıca soruşulmur.
- Giriş məlumatları serverdə yoxlanılır, frontend yoxlaması yalnız rahatlıq üçündür.
- Sirlər (parol, JWT secret, DB URL) `.env` faylında saxlanılır və Git-ə yazılmır (`.gitignore`-da artıq var).
