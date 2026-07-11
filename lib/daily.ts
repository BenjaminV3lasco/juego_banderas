import type { Country } from "@/lib/game";

export type DailyOutcome = "correct" | "wrong";

export type DailyRecord = {
  correct: number;
  wrong: number;
  outcomes: Record<string, DailyOutcome>;
};

export const EMPTY_DAILY_RECORD: DailyRecord = {
  correct: 0,
  wrong: 0,
  outcomes: {},
};

export const DAILY_RECORD_KEY = "mundoquiz_daily_record_v2";

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyCountry(countries: Country[], dateKey: string) {
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name, "es"));
  let hash = 2166136261;
  for (const character of dateKey) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return sortedCountries[Math.abs(hash) % sortedCountries.length];
}

export function readDailyRecord(): DailyRecord {
  try {
    const stored = localStorage.getItem(DAILY_RECORD_KEY);
    if (!stored) return EMPTY_DAILY_RECORD;
    const parsed = JSON.parse(stored) as DailyRecord;
    return {
      correct: Number(parsed.correct) || 0,
      wrong: Number(parsed.wrong) || 0,
      outcomes: parsed.outcomes || {},
    };
  } catch {
    return EMPTY_DAILY_RECORD;
  }
}

export function addDailyOutcome(record: DailyRecord, dateKey: string, outcome: DailyOutcome) {
  if (record.outcomes[dateKey]) return record;
  const next = {
    ...record,
    [outcome]: record[outcome] + 1,
    outcomes: { ...record.outcomes, [dateKey]: outcome },
  };
  localStorage.setItem(DAILY_RECORD_KEY, JSON.stringify(next));
  return next;
}

export function getDailyStreak(record: DailyRecord, challenge: string, today = new Date()) {
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayOutcome = record.outcomes[`${getTodayKey(cursor)}:${challenge}`];
  if (!todayOutcome) cursor.setDate(cursor.getDate() - 1);

  while (record.outcomes[`${getTodayKey(cursor)}:${challenge}`] === "correct") {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
