import type { ModeId } from "@/lib/game";
import { createClient } from "./client";

type GameResult = {
  mode: ModeId;
  correct: number;
  wrong: number;
  nickname?: string;
  isGuest?: boolean;
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
  });

  if (error) throw error;
}

export async function getHistoricalRanking() {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("game_results")
    .select("id,nickname,is_guest,mode,correct,wrong,total,created_at")
    .order("correct", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data || []) as RankingEntry[];
}
