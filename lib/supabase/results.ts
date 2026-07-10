import type { ModeId } from "@/lib/game";
import { createClient } from "./client";

type GameResult = {
  mode: ModeId;
  correct: number;
  wrong: number;
};

export async function saveGameResult(result: GameResult) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase.from("game_results").insert({
    ...result,
    total: result.correct + result.wrong,
  });

  if (error) throw error;
}
