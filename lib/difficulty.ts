import difficultyData from "@/public/data/country-difficulty.json";
import type { Country, Difficulty, GameMode } from "@/lib/game";

export type DifficultyCategory = "flag" | "capital" | "map" | "neighbour";

type CountryDifficulty = {
  scores: Record<DifficultyCategory, number>;
  levels: Record<DifficultyCategory, Difficulty>;
};

const countries = difficultyData.countries as Record<string, CountryDifficulty>;

export function getDifficultyCategory(mode: GameMode): DifficultyCategory {
  if (mode.customGame === "country-map") return "map";
  if (mode.customGame === "neighbour-countries") return "neighbour";
  if (mode.asksCapital || mode.customGame === "daily-capital" || mode.customGame === "capital-wordle") return "capital";
  return "flag";
}

export function filterCountriesByDifficulty(pool: Country[], mode: GameMode, difficulty: Difficulty) {
  const category = getDifficultyCategory(mode);
  const filtered = pool.filter((country) => countries[country.cca3]?.levels[category] === difficulty);
  // A daily challenge needs a sufficiently varied rotation. Unknown or tiny
  // groups safely fall back to the mode's full eligible pool.
  return filtered.length >= 8 ? filtered : pool;
}

export function getCountryDifficulty(code: string, mode: GameMode) {
  const category = getDifficultyCategory(mode);
  return countries[code]?.scores[category] ?? null;
}
