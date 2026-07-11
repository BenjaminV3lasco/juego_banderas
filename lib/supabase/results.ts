import type { Difficulty, ModeId } from "@/lib/game";
import { createClient } from "./client";

type GameResult = {
  mode: ModeId;
  correct: number;
  wrong: number;
  nickname?: string;
  isGuest?: boolean;
  durationSeconds?: number;
  difficulty?: Difficulty;
  timerLimitSeconds?: number | null;
};

export type RankingEntry = {
  id: string;
  nickname: string;
  is_guest: boolean;
  mode: ModeId;
  correct: number;
  wrong: number;
  total: number;
  created_at: string;
  duration_seconds: number;
  difficulty: Difficulty;
  timer_limit_seconds: number | null;
};

export async function saveGameResult(result: GameResult) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase.from("game_results").insert({
    mode: result.mode,
    correct: result.correct,
    wrong: result.wrong,
    total: result.correct + result.wrong,
    nickname: result.nickname || "Invitado",
    is_guest: result.isGuest ?? true,
    duration_seconds: Math.max(0, result.durationSeconds || 0),
    difficulty: result.difficulty || "normal",
    timer_limit_seconds: result.timerLimitSeconds ?? null,
  });

  if (error) throw error;
}

export async function getHistoricalRanking() {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("game_results")
    .select("id,nickname,is_guest,mode,correct,wrong,total,created_at,duration_seconds,difficulty,timer_limit_seconds")
    .order("correct", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data || []) as RankingEntry[];
}
