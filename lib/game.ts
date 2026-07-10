export type ModeId = "world" | "capitals" | "americas" | "europe" | "asia" | "africa";

export type RawCountry = {
  name: { common: string };
  translations?: { spa?: { common?: string } };
  capital?: string[];
  flags?: { svg?: string; png?: string };
  region?: string;
  subregion?: string;
};

export type Country = {
  name: string;
  capital: string;
  flag: string;
  region: string;
  subregion: string;
};

export type GameMode = {
  id: ModeId;
  title: string;
  kicker: string;
  description: string;
  flags: string[];
  badge?: string;
  region?: string;
  asksCapital?: boolean;
};

export const MODES: GameMode[] = [
  { id: "world", title: "Adiviná el país", kicker: "MUNDO", description: "Todas las banderas, un solo reto.", flags: ["🌎", "🌍", "🌏"], badge: "POPULAR" },
  { id: "capitals", title: "País + Capital", kicker: "EXPERTO", description: "Reconocé la bandera y su capital.", flags: ["🇦🇷", "📍"], badge: "DOBLE RETO", asksCapital: true },
  { id: "americas", title: "América", kicker: "REGIÓN", description: "Del Ártico a Tierra del Fuego.", flags: ["🇦🇷", "🇧🇷", "🇨🇦", "🇲🇽"], region: "Americas" },
  { id: "europe", title: "Europa", kicker: "REGIÓN", description: "Un clásico para conocedores.", flags: ["🇪🇸", "🇫🇷", "🇮🇹", "🇩🇪"], region: "Europe" },
  { id: "asia", title: "Asia", kicker: "REGIÓN", description: "El continente más desafiante.", flags: ["🇯🇵", "🇮🇳", "🇰🇷", "🇹🇭"], region: "Asia" },
  { id: "africa", title: "África", kicker: "REGIÓN", description: "Colores, historia y 54 países.", flags: ["🇿🇦", "🇪🇬", "🇰🇪", "🇬🇭"], region: "Africa" },
];

export const normalize = (value: string) =>
  value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function mapCountries(data: RawCountry[]): Country[] {
  return data.map((country) => ({
    name: country.translations?.spa?.common || country.name.common,
    capital: country.capital?.[0] || "",
    flag: country.flags?.svg || country.flags?.png || "",
    region: country.region || "Other",
    subregion: country.subregion || "Other",
  })).filter((country) => country.flag);
}

export function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
