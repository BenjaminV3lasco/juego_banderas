"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Country, getCountryDisplayName, normalize } from "@/lib/game";
import { Language } from "@/lib/i18n";

export function QuickMatch({ countries, language, onResolved, onContinue }: { countries: Country[]; language: Language; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [finished, setFinished] = useState<boolean | null>(null);
  const current = countries[index];
  const copy = language === "es"
    ? { title: "Partida rápida", placeholder: "Escribe el país", confirm: "Confirmar", correct: "¡Correcto!", wrong: "Respuesta incorrecta", lives: "vidas", progress: "banderas", win: "¡Completaste las 25 banderas!", lose: "Te quedaste sin vidas", result: "Ver resultado" }
    : { title: "Quick match", placeholder: "Type the country", confirm: "Confirm", correct: "Correct!", wrong: "Wrong answer", lives: "lives", progress: "flags", win: "You completed all 25 flags!", lose: "You ran out of lives", result: "View result" };

  function finish(won: boolean) {
    setFinished(won);
    onResolved(won);
  }

  function advance(nextLives: number) {
    setAnswer("");
    setFeedback(null);
    if (nextLives <= 0) finish(false);
    else if (index + 1 >= countries.length) finish(true);
    else setIndex((value) => value + 1);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!current || feedback) return;
    const correct = current.acceptedNames.some((name) => normalize(name) === normalize(answer));
    const nextLives = correct ? lives : lives - 1;
    if (!correct) setLives(nextLives);
    setFeedback({ ok: correct, text: correct ? copy.correct : `${copy.wrong}: ${getCountryDisplayName(current, language)}` });
    window.setTimeout(() => advance(nextLives), correct ? 550 : 900);
  }

  if (!current) return null;
  if (finished !== null) return <section className="quick-match-shell quick-match-finish"><div className="quick-complete-symbol" aria-hidden="true"><span>🌍</span><b>⚡</b></div><span className={finished ? "win" : "lose"}>{finished ? copy.win : copy.lose}</span><strong>{Math.min(index + 1, countries.length)}/{countries.length} {copy.progress}</strong><button onClick={onContinue}>{copy.result}</button></section>;

  return <section className="quick-match-shell">
    <header><div><small>{copy.title}</small><strong>{index + 1}/{countries.length}</strong></div><div className="quick-lives" aria-label={`${lives} ${copy.lives}`}>{[0, 1, 2].map((life) => <span className={life >= lives ? "lost" : ""} key={life}>♥</span>)}</div></header>
    <div className="quick-progress"><span style={{ width: `${((index + 1) / countries.length) * 100}%` }} /></div>
    <div className="quick-flag"><Image src={current.flag} alt={language === "es" ? "Bandera por identificar" : "Flag to identify"} width={420} height={250} unoptimized /></div>
    <form onSubmit={submit}><input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={copy.placeholder} autoFocus autoComplete="off" aria-label={copy.placeholder} /><button disabled={!answer.trim() || Boolean(feedback)}>{copy.confirm}</button></form>
    {feedback && <p className={feedback.ok ? "ok" : "bad"} role="status">{feedback.text}</p>}
  </section>;
}
