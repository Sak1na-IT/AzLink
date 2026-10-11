export interface MetroStation {
  id: string;
  name: string;
  /* Stansiya hansı rayon(lar)dakı bizneslərə uyğun gəlir */
  districts: string[];
}

/*
 * Stansiya adları Bakı Metropoliteninin xəritəsindən götürülüb.
 * Rayon adları bazadakı rayon adları ilə eyni yazılmalıdır.
 *
 * Rayonlar təxminidir. "YOXLA" yazılanları xəritə ilə təsdiqlə.
 * Sərhəddə olan stansiyalara iki rayon yazılıb: səhv olsa belə
 * nəticə gizlənmir, yalnız bir az artıq çıxır.
 */
export const metroStations: MetroStation[] = [
  { id: "20-yanvar", name: "20 Yanvar", districts: ["Yasamal", "Binəqədi"] }, // YOXLA
  { id: "28-may", name: "28 May", districts: ["Nəsimi"] },
  { id: "avtovagzal", name: "Avtovağzal", districts: ["Binəqədi", "Nəsimi"] }, // YOXLA
  { id: "azadliq", name: "Azadlıq prospekti", districts: ["Binəqədi"] },
  { id: "bakmil", name: "Bakmil", districts: ["Nərimanov", "Binəqədi"] }, // YOXLA
  { id: "cefer-cabbarli", name: "Cəfər Cabbarlı", districts: ["Nəsimi", "Xətai"] }, // YOXLA
  { id: "dernegul", name: "Dərnəgül", districts: ["Binəqədi"] },
  { id: "elmler", name: "Elmlər Akademiyası", districts: ["Yasamal"] },
  { id: "ahmadli", name: "Əhmədli", districts: ["Xətai"] }, // YOXLA
  { id: "genclik", name: "Gənclik", districts: ["Nərimanov", "Nəsimi"] }, // YOXLA
  { id: "hazi-aslanov", name: "Həzi Aslanov", districts: ["Xətai"] },
  { id: "xalqlar-dostlugu", name: "Xalqlar Dostluğu", districts: ["Nizami"] }, // YOXLA
  { id: "xetai", name: "Xətai", districts: ["Xətai"] },
  { id: "icherisheher", name: "İçərişəhər", districts: ["Səbail"] },
  { id: "inshaatchilar", name: "İnşaatçılar", districts: ["Yasamal"] },
  { id: "koroglu", name: "Koroğlu", districts: ["Nərimanov", "Binəqədi"] }, // YOXLA
  { id: "qara-qarayev", name: "Qara Qarayev", districts: ["Nizami"] }, // YOXLA
  { id: "memar-ecemi", name: "Memar Əcəmi", districts: ["Nəsimi", "Binəqədi"] }, // YOXLA
  { id: "neftchilar", name: "Neftçilər", districts: ["Nizami"] }, // YOXLA
  { id: "narimanov", name: "Nəriman Nərimanov", districts: ["Nərimanov"] },
  { id: "nesimi", name: "Nəsimi", districts: ["Nəsimi", "Binəqədi"] }, // YOXLA
  { id: "nizami", name: "Nizami", districts: ["Nəsimi", "Səbail"] }, // YOXLA
  { id: "sahil", name: "Sahil", districts: ["Səbail"] },
  { id: "ulduz", name: "Ulduz", districts: ["Nərimanov"] },
];