import { metroStations } from "../data/metroStations";

const normalize = (value: string) => value.toLocaleLowerCase("az").trim();

const ALL_BAKU_NAMES = ["bütün bakı", "bakı", "baki"];

/*
 * "Gənclik metrosu" → ["nərimanov", "nəsimi"].
 * Yalnız "... metrosu" adı qeydə alınır ki, "Nizami" kimi stansiya adı
 * eyni adlı rayonla qarışmasın.
 */
const metroToDistricts = new Map<string, string[]>();

for (const station of metroStations) {
  metroToDistricts.set(
    normalize(`${station.name} metrosu`),
    station.districts.map(normalize)
  );
}

/*
 * Biznes (providerArea: bazadakı rayon) seçilmiş əraziyə uyğundurmu?
 * Metro seçilibsə, onun rayonlarından biri biznesin rayonu ilə eyni olmalıdır.
 */
export function matchesArea(
  providerArea: string,
  selectedAreaName: string
): boolean {
  const provider = normalize(providerArea);
  const area = normalize(selectedAreaName);

  if (ALL_BAKU_NAMES.includes(area)) {
    return true;
  }

  const districts = metroToDistricts.get(area);

  if (districts) {
    return districts.includes(provider);
  }

  return provider === area;
}