---

## 4. İşləyən funksiyalar

**Giriş axını**

- `/account-type` → rol seçimi (İstifadəçi / Biznes sahibi) → `/register?role=...`
- Qeydiyyat: biznes seçilibsə kateqoriya, rayon və telefon əlavə tələb olunur
- Giriş: `/login?role=...` → uğurlu girişdən sonra rola görə yönləndirmə

**Müştəri tərəfi**

- Ana səhifə: axtarış, ərazi seçimi, yaxın rezervlər, yaxınlıqda populyar profillər
- Usta profili: xidmətlər, iş nümunələri (portfolio), rəylər, orta reytinq
- Rezerv axını: xidmət, tarix, saat seçimi — saatlar xidmətin müddətinə görə hesablanır, dolu/keçmiş saatlar bağlanır
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

**Addım 1–2: Frontend ekranları və biznes paneli — ✅ Tamamlandı**

- [x] Bütün müştəri və biznes ekranları
- [x] Rezerv axını, statuslar, filtrlər
- [x] Xidmətlər, profil, portfolio, rəylər, müştərilər
- [x] Onboarding (qeydiyyat axını)

**Addım 3: Kod səliqəsi — 🟡 Davam edir**

- [x] İstifadə olunmayan komponentlər silindi (`OverviewStrip`)
- [x] Boş/istifadəsiz qovluqlar silindi (`pages/Dashboard`, `pages/Auth`, `components/auth`, `components/business`, `components/common`, `components/provider`, `components/search`)
- [ ] Qalan dublikat/istifadəsiz faylların yoxlanılması
- [ ] `App.css`-in son hala uyğunlaşdırılması

**Sonrakı addımlar**

| Addım | İş                                                                                | Vəziyyət |
| ----- | --------------------------------------------------------------------------------- | -------- |
| 4     | Ortaq tiplər: `User`, `Booking`, `Provider` → `shared/` qovluğuna                 | ⬜       |
| 5     | Backend: Express + Prisma, auth, rollar, bütün API-lər                            | ⬜       |
| 6     | Birləşmə: mock data və `localStorage` əvəzinə real API                            | ⬜       |
| 7     | Son işlənmə: loading/xəta halları, validasiya, responsive, təhlükəsizlik, testlər | ⬜       |

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
