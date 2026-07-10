import { getCountryAliases, getSpanishCountryName } from "@/lib/country-names";

export type ModeId = "daily" | "detective" | "world" | "capitals" | "americas" | "europe" | "asia" | "africa";

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
  englishName: string;
  acceptedNames: string[];
  capital: string;
  flag: string;
  region: string;
  subregion: string;
};

export type GameMode = {
  id: ModeId;
  kicker: string;
  flags: string[];
  badge?: string;
  region?: string;
  asksCapital?: boolean;
  daily?: boolean;
  customGame?: "detective";
  copy: {
    es: { title: string; description: string; rules: string[] };
    en: { title: string; description: string; rules: string[] };
  };
};

export const MODES: GameMode[] = [
  { id: "daily", kicker: "DAILY", flags: ["📅", "🚩"], badge: "NEW", daily: true, copy: { es: { title: "Bandera del día", description: "Una nueva bandera cada día para poner a prueba tu constancia.", rules: ["Tenés un solo intento por día.", "Un acierto suma al contador verde; un error, al rojo.", "La misma bandera aparece para toda la comunidad."] }, en: { title: "Flag of the day", description: "A new flag every day to test your consistency.", rules: ["You get one attempt per day.", "A correct answer adds to green; a miss adds to red.", "The same flag appears for the whole community."] } } },
  { id: "detective", kicker: "MYSTERY", flags: ["❓", "🕵️"], badge: "NEW", daily: true, customGame: "detective", copy: { es: { title: "Adiviná el país", description: "Descubrí el país misterioso haciendo preguntas antes de arriesgar tu respuesta.", rules: ["Podés hacer hasta 10 preguntas de sí o no.", "Tenés tres intentos para adivinar el país.", "Si acertás, revelás la bandera y sumás al contador diario."] }, en: { title: "Guess the country", description: "Discover the mystery country by asking questions before risking your answer.", rules: ["You can ask up to 10 yes-or-no questions.", "You have three attempts to guess the country.", "A correct answer reveals the flag and adds to your daily score."] } } },
  { id: "world", kicker: "WORLD", flags: ["🌎", "🌍", "🌏"], badge: "POPULAR", copy: { es: { title: "Adiviná el país", description: "Recorré el planeta identificando banderas de todo el mundo.", rules: ["Escribí el país que corresponde a cada bandera.", "Podés saltar una respuesta si no la sabés.", "Tus resultados ayudan a medir la dificultad real."] }, en: { title: "Guess the country", description: "Travel the planet by identifying flags from around the world.", rules: ["Type the country that matches each flag.", "You can skip an answer when you don't know it.", "Your results help us measure real difficulty."] } } },
  { id: "capitals", kicker: "EXPERT", flags: ["🇦🇷", "📍"], badge: "DOUBLE", asksCapital: true, copy: { es: { title: "País + Capital", description: "El desafío completo: reconocé la bandera y recordá su capital.", rules: ["Ambas respuestas deben ser correctas.", "Los errores muestran el país y la capital.", "Este modo aporta datos para futuros niveles."] }, en: { title: "Country + Capital", description: "The complete challenge: identify the flag and remember its capital.", rules: ["Both answers must be correct.", "Wrong answers reveal the country and capital.", "This mode provides data for future levels."] } } },
  { id: "americas", kicker: "REGION", flags: ["🇦🇷", "🇧🇷", "🇨🇦", "🇲🇽"], region: "Americas", copy: { es: { title: "América", description: "Banderas desde el Ártico hasta Tierra del Fuego.", rules: ["Solo aparecen países y territorios de América.", "Escribí el nombre del país.", "Completá la región para ver tu porcentaje final."] }, en: { title: "Americas", description: "Flags from the Arctic all the way to Tierra del Fuego.", rules: ["Only countries and territories from the Americas appear.", "Type the country name.", "Complete the region to see your final score."] } } },
  { id: "europe", kicker: "REGION", flags: ["🇪🇸", "🇫🇷", "🇮🇹", "🇩🇪"], region: "Europe", copy: { es: { title: "Europa", description: "Un clásico con algunas de las banderas más reconocibles del mundo.", rules: ["Solo aparecen países y territorios de Europa.", "Escribí el nombre del país.", "Podés saltar las banderas que no reconozcas."] }, en: { title: "Europe", description: "A classic featuring some of the world's most recognizable flags.", rules: ["Only European countries and territories appear.", "Type the country name.", "You can skip flags you don't recognize."] } } },
  { id: "asia", kicker: "REGION", flags: ["🇯🇵", "🇮🇳", "🇰🇷", "🇹🇭"], region: "Asia", copy: { es: { title: "Asia", description: "El continente más grande y uno de los desafíos más variados.", rules: ["Solo aparecen países y territorios de Asia.", "Escribí el nombre del país.", "Tus respuestas ayudan a clasificar la dificultad."] }, en: { title: "Asia", description: "The largest continent and one of the most varied challenges.", rules: ["Only Asian countries and territories appear.", "Type the country name.", "Your answers help classify flag difficulty."] } } },
  { id: "africa", kicker: "REGION", flags: ["🇿🇦", "🇪🇬", "🇰🇪", "🇬🇭"], region: "Africa", copy: { es: { title: "África", description: "Colores, símbolos e historias de todo el continente africano.", rules: ["Solo aparecen países y territorios de África.", "Escribí el nombre del país.", "Completá todas las banderas para terminar."] }, en: { title: "Africa", description: "Colors, symbols and stories from across the African continent.", rules: ["Only African countries and territories appear.", "Type the country name.", "Complete every flag to finish the game."] } } },
];

export const normalize = (value: string) =>
  value.toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’()\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function getCountryDisplayName(country: Country, language: "es" | "en") {
  return language === "es" ? country.name : country.englishName;
}

export function mapCountries(data: RawCountry[]): Country[] {
  return data.map((country) => {
    const englishName = country.name.common;
    const name = getSpanishCountryName(englishName, country.translations?.spa?.common || englishName);
    return {
      name,
      englishName,
      acceptedNames: [...new Set([name, englishName, ...getCountryAliases(englishName)])],
      capital: country.capital?.[0] || "",
      flag: country.flags?.svg || country.flags?.png || "",
      region: country.region || "Other",
      subregion: country.subregion || "Other",
    };
  }).filter((country) => country.flag);
}

export function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
