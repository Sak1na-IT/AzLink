const normalize = (value: string) =>
  value.toLocaleLowerCase("az").trim();

/*
 * Bu ərazilər hansı rayona aiddir.
 * Yeni ərazi əlavə etmək üçün bura bir sətir yaz.
 */
const areaToDistrict: Record<string, string> = {
  "gənclik": "nərimanov",
  "gənclik və ətrafı": "nərimanov",
  "gənclik metrosu": "nərimanov",

  "28 may": "nəsimi",
  "28 may metrosu": "nəsimi",

  "elmlər akademiyası": "yasamal",
  "elmlər akademiyası metrosu": "yasamal",

  "inşaatçılar": "yasamal",
  "inşaatçılar metrosu": "yasamal",
};

export function matchesArea(
  providerArea: string,
  selectedAreaName: string
): boolean {
  const provider = normalize(providerArea);
  const area = normalize(selectedAreaName);

  if (area === "bütün bakı" || area === "baki") {
    return true;
  }

  const district = areaToDistrict[area];

  if (district) {
    return provider === district;
  }

  return (
    provider === area ||
    provider.includes(area) ||
    area.includes(provider)
  );
}