"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Country, GameMode, mapCountries, MODES, normalize, RawCountry, shuffle } from "@/lib/game";
import { saveGameResult } from "@/lib/supabase/results";

type Screen = "home" | "game" | "results";
type Score = { correct: number; wrong: number };

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<GameMode | null>(null);
  const [questions, setQuestions] = useState<Country[]>([]);
  const [index, setIndex] = useState(0);
  const [countryAnswer, setCountryAnswer] = useState("");
  const [capitalAnswer, setCapitalAnswer] = useState("");
  const [score, setScore] = useState<Score>({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const savedResult = useRef<string | null>(null);

  useEffect(() => {
    fetch("/data/countries.json")
      .then((response) => response.json())
      .then((data: RawCountry[]) => setCountries(mapCountries(data)))
      .catch(() => setCountries([]));
  }, []);

  const current = questions[index];
  const totalAnswered = score.correct + score.wrong;
  const progress = questions.length ? (index / questions.length) * 100 : 0;

  const resultPercent = useMemo(() => totalAnswered ? Math.round((score.correct / totalAnswered) * 100) : 0, [score, totalAnswered]);

  useEffect(() => {
    if (screen !== "results" || !mode || !totalAnswered) return;
    const resultKey = `${mode.id}:${score.correct}:${score.wrong}`;
    if (savedResult.current === resultKey) return;
    savedResult.current = resultKey;
    void saveGameResult({ mode: mode.id, correct: score.correct, wrong: score.wrong }).catch((error: unknown) => {
      console.warn("No se pudo guardar el resultado en Supabase", error);
    });
  }, [mode, score.correct, score.wrong, screen, totalAnswered]);

  function startGame(selected: GameMode) {
    const pool = selected.region ? countries.filter((country) => country.region === selected.region) : countries;
    setMode(selected);
    setQuestions(shuffle(pool));
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setFeedback(null);
    setCountryAnswer("");
    setCapitalAnswer("");
    savedResult.current = null;
    setScreen("game");
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) setScreen("results");
    else setIndex((value) => value + 1);
    setCountryAnswer("");
    setCapitalAnswer("");
    setFeedback(null);
  }

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!current || feedback) return;
    const countryOk = normalize(countryAnswer) === normalize(current.name);
    const capitalOk = !mode?.asksCapital || normalize(capitalAnswer) === normalize(current.capital);
    const ok = countryOk && capitalOk;
    setScore((value) => ({ ...value, [ok ? "correct" : "wrong"]: value[ok ? "correct" : "wrong"] + 1 }));
    setFeedback({ text: ok ? "¡Correcto!" : `${current.name}${mode?.asksCapital ? ` — ${current.capital}` : ""}`, ok });
    window.setTimeout(nextQuestion, ok ? 850 : 1400);
  }

  if (screen === "game" && mode && current) {
    return <main className="game-page">
      <header className="topbar"><button className="score-pill" onClick={() => setScreen("home")}>← Inicio</button><div className="logo"><span>MUNDO</span>QUIZ</div><div className="score-pill"><b>{score.correct}</b><i>–</i><em>{score.wrong}</em></div></header>
      <section className="game-shell">
        <div className="game-meta"><span>{mode.title}</span><span>{index + 1} / {questions.length}</span></div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        <article className="question-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flag-stage"><img src={current.flag} alt="Bandera a identificar" /></div>
          <form onSubmit={submitAnswer}>
            <label htmlFor="country">¿Qué país es?</label>
            <input id="country" value={countryAnswer} onChange={(event) => setCountryAnswer(event.target.value)} autoFocus autoComplete="off" placeholder="Escribí el país..." />
            {mode.asksCapital && <><label htmlFor="capital">¿Cuál es su capital?</label><input id="capital" value={capitalAnswer} onChange={(event) => setCapitalAnswer(event.target.value)} autoComplete="off" placeholder="Escribí la capital..." /></>}
            {feedback && <div className={`feedback ${feedback.ok ? "ok" : "bad"}`}>{feedback.text}</div>}
            <div className="game-actions"><button type="button" className="skip" onClick={() => { setCountryAnswer(""); submitAnswer({ preventDefault() {} } as FormEvent); }}>NO SÉ</button><button type="submit" className="confirm">CONFIRMAR</button></div>
          </form>
        </article>
      </section>
    </main>;
  }

  if (screen === "results" && mode) {
    return <main className="result-page"><div className="result-card"><span className="eyebrow">PARTIDA COMPLETADA</span><h1>{resultPercent}%</h1><p>{score.correct} respuestas correctas de {totalAnswered}</p><div className="result-actions"><button onClick={() => startGame(mode)}>JUGAR DE NUEVO</button><button className="secondary" onClick={() => setScreen("home")}>VER MODOS</button></div></div></main>;
  }

  return <main className="home-page">
    <header className="topbar"><div className="score-pill"><b>0</b><i>–</i><em>0</em></div><div className="logo"><span>MUNDO</span>QUIZ</div><div className="header-dot">◎</div></header>
    <section className="hub"><h1>Elegí el juego que querés jugar</h1><div className="mode-grid">{MODES.map((item) => <button className="mode-card" key={item.id} onClick={() => startGame(item)} disabled={!countries.length}>
      {item.badge && <span className={`badge ${item.id === "capitals" ? "yellow" : ""}`}>{item.badge}</span>}
      <div className={`mode-preview ${item.flags.length === 4 ? "four" : ""}`}>{item.flags.map((flag, flagIndex) => <span key={`${flag}-${flagIndex}`}>{flag}</span>)}</div>
      <div className="play-band"><strong>JUGAR</strong><small>{item.title}</small></div>
    </button>)}</div></section>
    <section className="about"><h2>Un mundo de desafíos</h2><p>Aprendé geografía jugando. Nuevos modos, estadísticas y desafíos diarios llegarán muy pronto.</p></section>
    <footer><div className="logo footer-logo"><span>MUNDO</span>QUIZ</div><p>Juegos de geografía para aprender todos los días.</p><nav><a href="#top">Juegos</a><a href="#about">Acerca de</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></nav></footer>
  </main>;
}
