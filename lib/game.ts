import { getCountryAliases, getSpanishCountryName, isSovereignCountry } from "@/lib/country-names";
import { getCapitalAliases, getSpanishCapitalName } from "@/lib/capital-names";

export type ModeId = "daily" | "quick-match" | "detective" | "wordle" | "daily-capital" | "capital-wordle" | "flag-choice" | "geo-connection" | "country-map" | "neighbour-countries" | "world" | "sovereign" | "capitals" | "americas" | "europe" | "asia" | "africa";
export type Difficulty = "easy" | "normal" | "hard";

export type RawCountry = {
  name: { common: string };
  cca3?: string;
  borders?: string[];
  latlng?: number[];
  translations?: { spa?: { common?: string } };
  capital?: string[];
  flags?: { svg?: string; png?: string };
  region?: string;
  subregion?: string;
};

export type Country = {
  name: string;
  englishName: string;
  cca3: string;
  borders: string[];
  latlng: [number, number] | null;
  acceptedNames: string[];
  capital: string;
  englishCapital: string;
  acceptedCapitals: string[];
  flag: string;
  region: string;
  subregion: string;
  sovereign: boolean;
};

export type GameMode = {
  id: ModeId;
  kicker: string;
  flags: string[];
  badge?: string;
  region?: string;
  asksCapital?: boolean;
  daily?: boolean;
  customGame?: "quick-match" | "detective" | "wordle" | "daily-capital" | "capital-wordle" | "flag-choice" | "geo-connection" | "country-map" | "neighbour-countries";
  sovereignOnly?: boolean;
  copy: {
    es: { title: string; description: string; rules: string[] };
    en: { title: string; description: string; rules: string[] };
  };
};

export const MODES: GameMode[] = [
  { id: "quick-match", kicker: "RÁPIDO", flags: ["🌍", "⚡"], badge: "NEW", daily: true, customGame: "quick-match", sovereignOnly: true, copy: { es: { title: "Partida rápida", description: "Reconoce 25 banderas antes de perder tus tres vidas.", rules: ["Aparecen 25 banderas según la dificultad elegida.", "Cada error resta una vida y avanza a la siguiente bandera.", "Completa el recorrido conservando al menos una vida."] }, en: { title: "Quick match", description: "Identify 25 flags before losing all three lives.", rules: ["You will see 25 flags based on your chosen difficulty.", "Each mistake costs one life and advances to the next flag.", "Complete the journey with at least one life remaining."] } } },
  { id: "country-map", kicker: "MAP", flags: ["🌍", "📍"], badge: "NEW", daily: true, customGame: "country-map", sovereignOnly: true, copy: { es: { title: "¿Dónde está el país?", description: "Encuentra en el mapa la ubicación del país del día.", rules: ["Selecciona el país directamente en el mapa.", "La dificultad determina los intentos y las ayudas.", "Al terminar se revela la ubicación correcta."] }, en: { title: "Where is the country?", description: "Find today's country on the map.", rules: ["Select the country directly on the map.", "Difficulty controls attempts and hints.", "The correct location is revealed at the end."] } } },
  { id: "neighbour-countries", kicker: "BORDERS", flags: ["🔗", "🌐"], badge: "NEW", daily: true, customGame: "neighbour-countries", sovereignOnly: true, copy: { es: { title: "Países vecinos", description: "Descubre el país oculto a partir de sus fronteras terrestres.", rules: ["Observa los países limítrofes mostrados.", "Las dificultades altas ofrecen menos vecinos.", "Escribe el país antes de agotar tus oportunidades."] }, en: { title: "Neighbouring countries", description: "Discover the hidden country from its land borders.", rules: ["Study the displayed neighbouring countries.", "Higher difficulties reveal fewer neighbours.", "Enter the country before running out of attempts."] } } },
  { id: "daily-capital", kicker: "CAPITAL", flags: ["🏛️", "📍"], badge: "NEW", daily: true, customGame: "daily-capital", copy: { es: { title: "Capital del día", description: "Cada día, un país nuevo y una oportunidad para recordar su capital.", rules: ["Adiviná la capital del país mostrado.", "Tenés un intento diario.", "La dificultad modifica las pistas disponibles."] }, en: { title: "Capital of the day", description: "A new country every day and one chance to remember its capital.", rules: ["Guess the capital of the displayed country.", "You have one daily attempt.", "Difficulty changes the available clues."] } } },
  { id: "capital-wordle", kicker: "WORDLE", flags: ["🟩", "🏛️", "🟨"], badge: "NEW", daily: true, customGame: "capital-wordle", copy: { es: { title: "Capital Wordle", description: "Descubre la capital oculta letra por letra en un máximo de seis intentos.", rules: ["Verde indica posición correcta y amarillo, otra posición.", "En fácil y normal puedes probar cualquier combinación de letras.", "En difícil solo se aceptan capitales reales completas."] }, en: { title: "Capital Wordle", description: "Discover the hidden capital letter by letter in up to six attempts.", rules: ["Green means the right position and yellow means another position.", "Easy and normal accept any combination of letters.", "Hard mode only accepts complete real capitals."] } } },
  { id: "flag-choice", kicker: "FLAGS", flags: ["🚩", "✅", "🚩", "🚩"], badge: "NEW", daily: true, customGame: "flag-choice", copy: { es: { title: "¿Cuál es la bandera correcta?", description: "Elegí la bandera que corresponde al país entre varias alternativas.", rules: ["Cada dificultad agrega más opciones.", "Solo podés elegir una vez.", "El resultado suma al contador diario."] }, en: { title: "Which flag is correct?", description: "Choose the flag that belongs to the country from several options.", rules: ["Each difficulty adds more choices.", "You can choose only once.", "The result counts toward your daily score."] } } },
  { id: "geo-connection", kicker: "CONNECTION", flags: ["🌍", "🔗", "❓"], badge: "NEW", daily: true, customGame: "geo-connection", copy: { es: { title: "Conexión geográfica", description: "Conectá pistas geográficas para descubrir el país oculto.", rules: ["Las pistas aparecen de a una.", "Usar más pistas reduce tu ventaja.", "En difícil no se revela la capital."] }, en: { title: "Geographic connection", description: "Connect geographic clues to discover the hidden country.", rules: ["Clues appear one at a time.", "Using more clues reduces your advantage.", "Hard mode never reveals the capital."] } } },
  { id: "daily", kicker: "DAILY", flags: ["📅", "🚩"], badge: "NEW", daily: true, copy: { es: { title: "Bandera del día", description: "Una nueva bandera cada día para poner a prueba tu constancia.", rules: ["Tenés un solo intento por día.", "Un acierto suma al contador verde; un error, al rojo.", "La misma bandera aparece para toda la comunidad."] }, en: { title: "Flag of the day", description: "A new flag every day to test your consistency.", rules: ["You get one attempt per day.", "A correct answer adds to green; a miss adds to red.", "The same flag appears for the whole community."] } } },
  { id: "detective", kicker: "MYSTERY", flags: ["❓", "🕵️"], badge: "NEW", daily: true, customGame: "detective", copy: { es: { title: "Adiviná el país", description: "Descubrí el país misterioso haciendo preguntas antes de arriesgar tu respuesta.", rules: ["Podés hacer hasta 10 preguntas de sí o no.", "Tenés tres intentos para adivinar el país.", "Si acertás, revelás la bandera y sumás al contador diario."] }, en: { title: "Guess the country", description: "Discover the mystery country by asking questions before risking your answer.", rules: ["You can ask up to 10 yes-or-no questions.", "You have three attempts to guess the country.", "A correct answer reveals the flag and adds to your daily score."] } } },
  { id: "wordle", kicker: "WORDLE", flags: ["🟩", "🟨", "⬛"], badge: "NEW", daily: true, customGame: "wordle", copy: { es: { title: "País Wordle", description: "Adivina el país letra por letra en seis intentos o menos.", rules: ["Verde indica posición correcta y amarillo, otra posición.", "En fácil y normal puedes probar cualquier combinación de letras.", "En difícil solo se aceptan países reales completos."] }, en: { title: "Country Wordle", description: "Guess the country letter by letter in six tries or fewer.", rules: ["Green means the right position and yellow means another position.", "Easy and normal accept any combination of letters.", "Hard mode only accepts complete real countries."] } } },
  { id: "world", kicker: "WORLD", flags: ["🌎", "🌍", "🌏"], badge: "POPULAR", copy: { es: { title: "Adiviná el país", description: "Recorré el planeta identificando banderas de todo el mundo.", rules: ["Escribí el país que corresponde a cada bandera.", "Podés saltar una respuesta si no la sabés.", "Tus resultados ayudan a medir la dificultad real."] }, en: { title: "Guess the country", description: "Travel the planet by identifying flags from around the world.", rules: ["Type the country that matches each flag.", "You can skip an answer when you don't know it.", "Your results help us measure real difficulty."] } } },
  { id: "sovereign", kicker: "COUNTRIES", flags: ["🌐", "🏛️"], badge: "NEW", sovereignOnly: true, copy: { es: { title: "Solo países soberanos", description: "Poné a prueba tus conocimientos sin islas dependientes ni territorios de ultramar.", rules: ["Solo aparecen Estados miembros de Naciones Unidas.", "No se incluyen dependencias ni territorios.", "Completá todos los países para entrar al ranking."] }, en: { title: "Sovereign countries only", description: "Test your knowledge without dependent islands or overseas territories.", rules: ["Only United Nations member states appear.", "Dependencies and territories are excluded.", "Complete every country to enter the ranking."] } } },
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

export function getCapitalDisplayName(country: Country, language: "es" | "en") {
  return language === "es" ? country.capital : country.englishCapital;
}

export function mapCountries(data: RawCountry[]): Country[] {
  return data.map((country) => {
    const englishName = country.name.common;
    const name = getSpanishCountryName(englishName, country.translations?.spa?.common || englishName);
    const englishCapital = country.capital?.[0] || "";
    return {
      name,
      englishName,
      cca3: country.cca3 || "",
      borders: country.borders || [],
      latlng: country.latlng?.length === 2 ? [country.latlng[0], country.latlng[1]] as [number, number] : null,
      acceptedNames: [...new Set([name, englishName, ...getCountryAliases(englishName)])],
      capital: getSpanishCapitalName(englishCapital),
      englishCapital,
      acceptedCapitals: getCapitalAliases(englishCapital),
      flag: country.flags?.svg || country.flags?.png || "",
      region: country.region || "Other",
      subregion: country.subregion || "Other",
      sovereign: isSovereignCountry(englishName),
    };
  }).filter((country) => country.flag);
}

export function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
