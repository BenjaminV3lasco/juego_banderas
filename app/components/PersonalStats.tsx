"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyRecord, getDailyStreak } from "@/lib/daily";
import { MODES } from "@/lib/game";
import { Language } from "@/lib/i18n";
import { getPlayerResults, RankingEntry } from "@/lib/supabase/results";
import { LoadingState } from "@/app/components/LoadingState";

export function PersonalStats({ language, nickname, isGuest, dailyRecord, onCreatePlayer }: { language: Language; nickname: string; isGuest: boolean; dailyRecord: DailyRecord; onCreatePlayer: () => void }) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(isGuest ? "ready" : "loading");
  const copy = language === "es" ? {
    title: "Estadísticas personales", intro: "Tu recorrido por MundoQuiz, en un solo lugar.", games: "Partidas competitivas", accuracy: "Precisión global", average: "Tiempo promedio", best: "Mejor tiempo", daily: "Desafíos diarios", streak: "Mejor racha actual", favorite: "Modo más jugado", empty: "Completa una partida competitiva para comenzar a construir tus estadísticas.", guest: "Estás jugando como invitado. Elige un nickname para guardar estadísticas competitivas propias.", create: "Elegir nickname", error: "No se pudieron cargar tus estadísticas.", loading: "Cargando tus estadísticas...", days: "días", noTime: "Sin datos", attempts: "partidas",
  } : {
    title: "Personal statistics", intro: "Your MundoQuiz journey, all in one place.", games: "Competitive games", accuracy: "Overall accuracy", average: "Average time", best: "Best time", daily: "Daily challenges", streak: "Best current streak", favorite: "Most played mode", empty: "Complete a competitive game to start building your statistics.", guest: "You are playing as a guest. Choose a nickname to keep your own competitive statistics.", create: "Choose nickname", error: "Your statistics could not be loaded.", loading: "Loading your statistics...", days: "days", noTime: "No data", attempts: "games",
  };

  useEffect(() => {
    if (isGuest) return;
    let active = true;
    getPlayerResults(nickname).then((data) => { if (active) { setEntries(data); setStatus("ready"); } }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [isGuest, nickname]);

  const data = useMemo(() => {
    const totalAnswers = entries.reduce((sum, entry) => sum + entry.total, 0);
    const correct = entries.reduce((sum, entry) => sum + entry.correct, 0);
    const timed = entries.filter((entry) => entry.duration_seconds > 0);
    const modeCounts = entries.reduce<Record<string, number>>((counts, entry) => ({ ...counts, [entry.mode]: (counts[entry.mode] || 0) + 1 }), {});
    const favoriteId = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const favorite = MODES.find((mode) => mode.id === favoriteId)?.copy[language].title;
    const dailyOutcomes = Object.entries(dailyRecord.outcomes).filter(([key]) => key.includes(":"));
    const streak = Math.max(0, ...MODES.filter((mode) => mode.daily).map((mode) => getDailyStreak(dailyRecord, mode.id)));
    return { games: entries.length, accuracy: totalAnswers ? Math.round(correct / totalAnswers * 100) : 0, average: timed.length ? Math.round(timed.reduce((sum, entry) => sum + entry.duration_seconds, 0) / timed.length) : 0, best: timed.length ? Math.min(...timed.map((entry) => entry.duration_seconds)) : 0, favorite, favoriteCount: favoriteId ? modeCounts[favoriteId] : 0, daily: dailyOutcomes.length, streak };
  }, [dailyRecord, entries, language]);

  const time = (seconds: number) => seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : copy.noTime;
  return <section className="personal-stats-shell">
    <header><span>ATLAS PERSONAL</span><h1>{copy.title}</h1><p>{copy.intro}</p>{!isGuest && <strong>{nickname}</strong>}</header>
    {status === "loading" && <LoadingState label={copy.loading} />}
    {status === "error" && <div className="stats-message error">{copy.error}</div>}
    {status === "ready" && <><div className="stats-grid">
      <StatCard icon="◆" label={copy.games} value={String(data.games)} />
      <StatCard icon="◎" label={copy.accuracy} value={`${data.accuracy}%`} />
      <StatCard icon="◷" label={copy.average} value={time(data.average)} />
      <StatCard icon="⚡" label={copy.best} value={time(data.best)} />
      <StatCard icon="◫" label={copy.daily} value={String(data.daily)} />
      <StatCard icon="🔥" label={copy.streak} value={`${data.streak} ${copy.days}`} />
    </div>{data.favorite && <div className="stats-favorite"><span>{copy.favorite}</span><strong>{data.favorite}</strong><small>{data.favoriteCount} {copy.attempts}</small></div>}{!data.games && !isGuest && <div className="stats-message">{copy.empty}</div>}{isGuest && <div className="stats-message guest"><p>{copy.guest}</p><button onClick={onCreatePlayer}>{copy.create}</button></div>}</>}
  </section>;
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <article><i aria-hidden="true">{icon}</i><span>{label}</span><strong>{value}</strong></article>;
}
