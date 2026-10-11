import { metroStations } from "../data/metroStations";

/*
 * "custom" yalnız köhnə və ya əl ilə dəyişdirilmiş axtarış linklərində
 * siyahıda olmayan ad gələndə istifadə olunur (seçimdə yeni ərazi yazmaq
 * artıq mümkün deyil).
 */
export type AreaType = "district" | "metro" | "custom";

export interface Area {
  id: string;
  name: string;
  type: AreaType;
  /* Metro üçün: stansiyanın uyğun gəldiyi rayonlar */
  districts?: string[];
}

/* Bakının 12 rayonu: adlar bazadakı adlarla eyni olmalıdır */
const districtList = [
  { id: "narimanov", name: "Nərimanov" },
  { id: "nesimi", name: "Nəsimi" },
  { id: "yasamal", name: "Yasamal" },
  { id: "sabail", name: "Səbail" },
  { id: "xetai", name: "Xətai" },
  { id: "nizami", name: "Nizami" },
  { id: "bineqedi", name: "Binəqədi" },
  { id: "sabunchu", name: "Sabunçu" },
  { id: "suraxani", name: "Suraxanı" },
  { id: "khazar", name: "Xəzər" },
  { id: "qaradag", name: "Qaradağ" },
  { id: "pirallah", name: "Pirallahı" },
];

export const areas: Area[] = [
  { id: "all-baku", name: "Bütün Bakı", type: "district" },

  ...districtList.map((district) => ({
    ...district,
    type: "district" as const,
  })),

  ...metroStations.map((station) => ({
    id: `${station.id}-metro`,
    name: `${station.name} metrosu`,
    type: "metro" as const,
    districts: station.districts,
  })),
];