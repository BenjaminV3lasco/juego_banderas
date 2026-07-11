import type { Difficulty, ModeId } from "@/lib/game";
import type { Language } from "@/lib/i18n";
import { createClient } from "./client";

const PLAYER_ID_KEY = "mundoquiz_anonymous_player_id";

export type AnswerEvent = {
  sessionId: string;
  countryCode: string;
  gameMode: ModeId;
  difficulty: Difficulty;
  language: Language;
  correct: boolean;
  responseTimeMs: number;
  attemptsUsed?: number;
};

function getAnonymousPlayerId() {
  const stored = localStorage.getItem(PLAYER_ID_KEY);
  if (stored) return stored;
  const playerId = crypto.randomUUID();
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  return playerId;
}

export function createGameSessionId() {
  return crypto.randomUUID();
}

export async function saveCompetitiveAnswerEvent(event: AnswerEvent) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase.from("answer_events").insert({
    anonymous_player_id: getAnonymousPlayerId(),
    session_id: event.sessionId,
    country_code: event.countryCode,
    game_mode: event.gameMode,
    difficulty: event.difficulty,
    language: event.language,
    correct: event.correct,
    response_time_ms: Math.max(0, Math.min(3_600_000, Math.round(event.responseTimeMs))),
    attempts_used: Math.max(1, Math.min(10, event.attemptsUsed || 1)),
    source: "real",
  });

  if (error) throw error;
}
