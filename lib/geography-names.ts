import type { Language } from "@/lib/i18n";

const ES: Record<string, string> = {
  Africa: "África", Americas: "América", Asia: "Asia", Europe: "Europa", Oceania: "Oceanía",
  Antarctic: "Antártida", Antarctica: "Antártida", Other: "Otra región",
  "Northern Africa": "África del Norte", "Western Africa": "África Occidental",
  "Middle Africa": "África Central", "Eastern Africa": "África Oriental", "Southern Africa": "África Austral",
  Caribbean: "Caribe", "Central America": "América Central", "North America": "América del Norte", "South America": "América del Sur",
  "Central Asia": "Asia Central", "Eastern Asia": "Asia Oriental", "South-Eastern Asia": "Sudeste Asiático",
  "Southern Asia": "Asia del Sur", "Western Asia": "Asia Occidental",
  "Central Europe": "Europa Central", "Eastern Europe": "Europa Oriental", "Northern Europe": "Europa del Norte",
  "Southeast Europe": "Europa Sudoriental", "Southern Europe": "Europa del Sur", "Western Europe": "Europa Occidental",
  Australia: "Australia", "Australia and New Zealand": "Australia y Nueva Zelanda",
  Melanesia: "Melanesia", Micronesia: "Micronesia", Polynesia: "Polinesia",
};

export function getGeographyName(value: string, language: Language) {
  return language === "es" ? ES[value] || value : value;
}
