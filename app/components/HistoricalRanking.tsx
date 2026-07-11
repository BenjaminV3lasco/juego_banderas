"use client";

import { useEffect, useMemo, useState } from "react";
import { GameMode, ModeId } from "@/lib/game";
import { Language } from "@/lib/i18n";
import { getHistoricalRanking, RankingEntry } from "@/lib/supabase/results";
import { LoadingState } from "@/app/components/LoadingState";

export function HistoricalRanking({ language, modes }: { language: Language; modes: GameMode[] }) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [selectedMode, setSelectedMode] = useState<ModeId>(modes[0]?.id || "world");
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const copy = language === "es"
    ? { title: "Ranking histórico", loading: "Cargando ranking...", empty: "Todavía no hay partidas completas en este modo.", error: "No se pudo cargar el ranking. Revisá que la migración 002 esté aplicada.", player: "Jugador", score: "Resultado", accuracy: "Precisión", date: "Fecha" }
    : { title: "Historical ranking", loading: "Loading ranking...", empty: "There are no completed games in this mode yet.", error: "The ranking could not be loaded. Check that migration 002 was applied.", player: "Player", score: "Score", accuracy: "Accuracy", date: "Date" };

  useEffect(() => {
    let active = true;
    getHistoricalRanking()
      .then((data) => { if (active) { setEntries(data); setStatus("ready"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);

  const ranking = useMemo(() => entries
    .filter((entry) => entry.mode === selectedMode)
    .sort((a, b) => (b.correct / b.total) - (a.correct / a.total) || b.correct - a.correct || a.duration_seconds - b.duration_seconds || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 50), [entries, selectedMode]);

  const selectedModeLabel = modes.find((mode) => mode.id === selectedMode)?.copy[language].title || "";

  return <section className="ranking-shell">
    <div className="ranking-heading"><h1>{copy.title}</h1><div className={`mode-dropdown ${menuOpen ? "open" : ""}`}><button className="mode-dropdown-trigger" onClick={() => setMenuOpen((open) => !open)} aria-haspopup="listbox" aria-expanded={menuOpen}><span>{selectedModeLabel}</span><i>⌄</i></button>{menuOpen && <div className="mode-dropdown-menu" role="listbox">{modes.map((mode) => <button role="option" aria-selected={mode.id === selectedMode} className={mode.id === selectedMode ? "selected" : ""} onClick={() => { setSelectedMode(mode.id); setMenuOpen(false); }} key={mode.id}><RankingModeIcon mode={mode.id} />{mode.copy[language].title}{mode.id === selectedMode && <b>✓</b>}</button>)}</div>}</div></div>
    {status === "loading" && <LoadingState label={copy.loading} />}
    {status === "error" && <div className="ranking-message error">{copy.error}</div>}
    {status === "ready" && !ranking.length && <div className="ranking-message">{copy.empty}</div>}
    {status === "ready" && ranking.length > 0 && <div className="ranking-table"><div className="ranking-row ranking-labels"><span>#</span><span>{copy.player}</span><span>{copy.score}</span><span>{copy.accuracy}</span><span>{language === "es" ? "Tiempo" : "Time"}</span></div>{ranking.map((entry, index) => <div className="ranking-row" key={entry.id}><strong className={`rank-position rank-${index + 1}`}>{index + 1}</strong><span>{entry.nickname}</span><span>{entry.correct}/{entry.total}</span><span>{Math.round((entry.correct / entry.total) * 100)}%</span><time>{entry.duration_seconds ? `${Math.floor(entry.duration_seconds / 60)}:${String(entry.duration_seconds % 60).padStart(2, "0")}` : "—"}</time></div>)}</div>}
  </section>;
}

function RankingModeIcon({ mode }: { mode: ModeId }) {
  if (["americas", "europe", "asia", "africa"].includes(mode)) return <span className={`ranking-flag-icon flag-${mode}`} aria-hidden="true"><i /></span>;
  const icon = mode === "world" ? "🌎" : mode === "sovereign" ? "◎" : mode === "capitals" ? "⌖" : "◆";
  return <span className="ranking-symbol-icon" aria-hidden="true">{icon}</span>;
}
