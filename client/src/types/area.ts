export type AreaType =
  | "district"
  | "metro"
  | "neighborhood"
  | "custom";

export interface Area {
  id: string;
  name: string;
  type: AreaType;
}

export const areas: Area[] = [
  // =========================
  // ÜMUMİ
  // =========================

  {
    id: "all-baku",
    name: "Bütün Bakı",
    type: "district",
  },

  // =========================
  // RAYONLAR
  // =========================

  {
    id: "narimanov",
    name: "Nərimanov",
    type: "district",
  },
  {
    id: "nesimi",
    name: "Nəsimi",
    type: "district",
  },
  {
    id: "yasamal",
    name: "Yasamal",
    type: "district",
  },
  {
    id: "sabail",
    name: "Səbail",
    type: "district",
  },
  {
    id: "xetai",
    name: "Xətai",
    type: "district",
  },
  {
    id: "nizami",
    name: "Nizami",
    type: "district",
  },
  {
    id: "bineqedi",
    name: "Binəqədi",
    type: "district",
  },
  {
    id: "sabunchu",
    name: "Sabunçu",
    type: "district",
  },
  {
    id: "suraxani",
    name: "Suraxanı",
    type: "district",
  },
  {
    id: "khazar",
    name: "Xəzər",
    type: "district",
  },
  {
    id: "qaradag",
    name: "Qaradağ",
    type: "district",
  },
  {
    id: "pirallah",
    name: "Pirallahı",
    type: "district",
  },

  // =========================
  // MƏHƏLLƏ / ƏRAZİ
  // =========================

  {
    id: "genclik",
    name: "Gənclik",
    type: "neighborhood",
  },
  {
    id: "28-may",
    name: "28 May",
    type: "neighborhood",
  },
  {
    id: "icheri-sheher",
    name: "İçərişəhər",
    type: "neighborhood",
  },
  {
    id: "nizami-street",
    name: "Nizami küçəsi",
    type: "neighborhood",
  },
  {
    id: "white-city",
    name: "Ağ Şəhər",
    type: "neighborhood",
  },
  {
    id: "port-baku",
    name: "Port Baku",
    type: "neighborhood",
  },
  {
    id: "bakmil",
    name: "Bakmil",
    type: "neighborhood",
  },
  {
    id: "inshaatchilar",
    name: "İnşaatçılar",
    type: "neighborhood",
  },
  {
    id: "elmler",
    name: "Elmlər Akademiyası",
    type: "neighborhood",
  },
  {
    id: "ahmadli",
    name: "Əhmədli",
    type: "neighborhood",
  },
  {
    id: "khirdalan",
    name: "Xırdalan",
    type: "neighborhood",
  },
  {
    id: "bilajari",
    name: "Biləcəri",
    type: "neighborhood",
  },

  // =========================
  // METRO
  // =========================

  {
    id: "genclik-metro",
    name: "Gənclik metrosu",
    type: "metro",
  },
  {
    id: "narimanov-metro",
    name: "Nəriman Nərimanov metrosu",
    type: "metro",
  },
  {
    id: "28-may-metro",
    name: "28 May metrosu",
    type: "metro",
  },
  {
    id: "koroglu-metro",
    name: "Koroğlu metrosu",
    type: "metro",
  },
  {
    id: "insaatcilar-metro",
    name: "İnşaatçılar metrosu",
    type: "metro",
  },
  {
    id: "elmler-metro",
    name: "Elmlər Akademiyası metrosu",
    type: "metro",
  },
  {
    id: "ahmadli-metro",
    name: "Əhmədli metrosu",
    type: "metro",
  },
];