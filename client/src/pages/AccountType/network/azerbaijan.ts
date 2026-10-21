/*
 * Azərbaycanın sərhəd konturu (uzunluq, enlik).
 *
 * DİQQƏT: bu, rəsmi xəritə məlumatı deyil. Kontur əl ilə, əsas
 * nöqtələr üzrə çəkilib (Samur mənsəbi, Abşeron, Kür deltası, Astara,
 * Araz boyu, Zəngilan, Qazax, Balakən və s.). Dəqiqlik təxminən
 * 10–20 km-dir: arxa fon animasiyası üçün tanınır, amma xəritə kimi
 * istifadə olunmamalıdır.
 */

export type LonLat = [number, number];

/* Əsas ərazi: şimal-qərbdən saat əqrəbi istiqamətində */
export const MAINLAND: LonLat[] = [
  [45.02, 41.29], // Gürcüstan–Ermənistan sərhəd nöqtəsi
  [45.4, 41.45],
  [45.8, 41.22],
  [46.15, 41.12],
  [46.48, 41.05],
  [46.62, 41.3],
  [46.35, 41.55],
  [46.25, 41.78],
  [46.4, 41.9], // Balakən
  [46.7, 41.85],
  [47.05, 41.62],
  [47.4, 41.42],
  [47.75, 41.25],
  [48.05, 41.47],
  [48.4, 41.62],
  [48.58, 41.84], // Samur mənsəbi
  [48.85, 41.58],
  [49.1, 41.33],
  [49.38, 41.02],
  [49.53, 40.8],
  [49.6, 40.62],
  [49.9, 40.6],
  [50.15, 40.57],
  [50.45, 40.42], // Abşeronun ucu
  [50.3, 40.33],
  [50.05, 40.35],
  [49.87, 40.36], // Bakı buxtası
  [49.7, 40.25],
  [49.48, 40.0],
  [49.42, 39.75],
  [49.45, 39.45], // Kür deltası
  [49.1, 39.15],
  [48.95, 38.95],
  [48.88, 38.7],
  [48.87, 38.43], // Astara
  [48.45, 38.55],
  [48.1, 38.85],
  [48.3, 39.05],
  [48.35, 39.38],
  [48.05, 39.65],
  [47.8, 39.62],
  [47.45, 39.45],
  [47.05, 39.25],
  [46.75, 39.15],
  [46.55, 38.88], // Zəngilan
  [46.5, 39.15],
  [46.52, 39.55],
  [46.15, 39.85],
  [45.85, 40.1],
  [45.6, 40.5],
  [45.55, 40.75],
  [45.1, 41.1],
];

/* Naxçıvan */
export const NAKHCHIVAN: LonLat[] = [
  [44.78, 39.7],
  [45.05, 39.78],
  [45.4, 39.62],
  [45.75, 39.48],
  [46.0, 39.3],
  [46.15, 38.88],
  [45.8, 38.95],
  [45.45, 38.98],
  [45.1, 39.2],
  [44.9, 39.45],
];

/* Şəhərlər: şəbəkənin parlaq düyünləri. İlki Bakıdır. */
export const CITIES: LonLat[] = [
  [49.87, 40.38], // Bakı
  [46.36, 40.68], // Gəncə
  [49.67, 40.59], // Sumqayıt
  [48.85, 38.75], // Lənkəran
  [47.17, 41.19], // Şəki
  [45.41, 39.21], // Naxçıvan
  [47.06, 40.76], // Mingəçevir
  [48.51, 41.36], // Quba
];
