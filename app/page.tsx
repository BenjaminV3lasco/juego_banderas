"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CountryDetective } from "@/app/components/CountryDetective";
import { CountryWordle } from "@/app/components/CountryWordle";
import { HistoricalRanking } from "@/app/components/HistoricalRanking";
import { addDailyOutcome, DailyRecord, EMPTY_DAILY_RECORD, getDailyCountry, getDailyStreak, getTodayKey, readDailyRecord } from "@/lib/daily";
import { Country, GameMode, getCountryDisplayName, mapCountries, MODES, normalize, RawCountry, shuffle } from "@/lib/game";
import { Language, UI_TEXT } from "@/lib/i18n";
import { saveGameResult } from "@/lib/supabase/results";

type Screen = "menu" | "hub" | "player" | "ranking" | "intro" | "game" | "detective" | "wordle" | "results" | "dailyReview";
type Score = { correct: number; wrong: number };
type Player = { nickname: string; isGuest: boolean };

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [screen, setScreen] = useState<Screen>("menu");
  const [hubCategory, setHubCategory] = useState<"daily" | "geography">("daily");
  const [mode, setMode] = useState<GameMode | null>(null);
  const [language, setLanguage] = useState<Language>("es");
  const [gameLanguage, setGameLanguage] = useState<Language>("es");
  const [questions, setQuestions] = useState<Country[]>([]);
  const [index, setIndex] = useState(0);
  const [countryAnswer, setCountryAnswer] = useState("");
  const [capitalAnswer, setCapitalAnswer] = useState("");
  const [score, setScore] = useState<Score>({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord>(EMPTY_DAILY_RECORD);
  const [player, setPlayer] = useState<Player>({ nickname: "Invitado", isGuest: true });
  const [nicknameInput, setNicknameInput] = useState("");
  const savedResult = useRef<string | null>(null);
  const todayKey = getTodayKey();
  const text = UI_TEXT[language];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDailyRecord(readDailyRecord());
      const storedLanguage = localStorage.getItem("mundoquiz_language");
      if (storedLanguage === "es" || storedLanguage === "en") setLanguage(storedLanguage);
      const storedNickname = localStorage.getItem("mundoquiz_nickname");
      if (storedNickname) setNicknameInput(storedNickname);
    });
    fetch("/data/countries.json")
      .then((response) => response.json())
      .then((data: RawCountry[]) => setCountries(mapCountries(data)))
      .catch(() => setCountries([]));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isDailyCompleted = (modeId: string) => Boolean(dailyRecord.outcomes[`${todayKey}:${modeId}`] || (modeId === "daily" && dailyRecord.outcomes[todayKey]));
  const current = questions[index];
  const totalAnswered = score.correct + score.wrong;
  const progress = questions.length ? (index / questions.length) * 100 : 0;
  const resultPercent = useMemo(() => totalAnswered ? Math.round((score.correct / totalAnswered) * 100) : 0, [score, totalAnswered]);

  useEffect(() => {
    if (screen !== "results" || !mode || !totalAnswered) return;
    const resultKey = `${mode.id}:${score.correct}:${score.wrong}`;
    if (savedResult.current === resultKey) return;
    savedResult.current = resultKey;
    void saveGameResult({ mode: mode.id, correct: score.correct, wrong: score.wrong, nickname: mode.daily ? "Invitado" : player.nickname, isGuest: mode.daily || player.isGuest }).catch((error: unknown) => {
      console.warn("No se pudo guardar el resultado en Supabase", error);
    });
  }, [mode, player, score.correct, score.wrong, screen, totalAnswered]);

  function toggleLanguage() {
    setLanguage((currentLanguage) => {
      const nextLanguage = currentLanguage === "es" ? "en" : "es";
      localStorage.setItem("mundoquiz_language", nextLanguage);
      return nextLanguage;
    });
  }

  function openMode(selected: GameMode) {
    if (selected.daily && isDailyCompleted(selected.id)) {
      const outcome = dailyRecord.outcomes[`${todayKey}:${selected.id}`] || dailyRecord.outcomes[todayKey];
      setMode(selected);
      setGameLanguage(language);
      setQuestions([getDailyCountry(getEligiblePool(selected), `${todayKey}:${selected.id}`)]);
      setScore(outcome === "correct" ? { correct: 1, wrong: 0 } : { correct: 0, wrong: 1 });
      setScreen("dailyReview");
      return;
    }
    setMode(selected);
    setScreen("intro");
  }

  function getEligiblePool(selected: GameMode) {
    const basePool = selected.sovereignOnly ? countries.filter((country) => country.sovereign) : countries;
    const regionalPool = selected.region ? basePool.filter((country) => country.region === selected.region) : basePool;
    if (selected.customGame !== "wordle") return regionalPool;
    return regionalPool.filter((country) => [country.name, country.englishName].every((countryName) => {
      const length = normalize(countryName).replace(/\s/g, "").length;
      return length >= 4 && length <= 12;
    }));
  }

  function startGame(selected: GameMode) {
    if (selected.daily && isDailyCompleted(selected.id)) return;
    const eligiblePool = getEligiblePool(selected);
    const dailySeed = `${todayKey}:${selected.id}`;
    const pool = selected.daily ? [getDailyCountry(eligiblePool, dailySeed)] : shuffle(eligiblePool);
    setMode(selected);
    setGameLanguage(language);
    setQuestions(pool.filter(Boolean));
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setFeedback(null);
    setCountryAnswer("");
    setCapitalAnswer("");
    savedResult.current = null;
    setScreen(selected.customGame || "game");
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
    const normalizedAnswer = normalize(countryAnswer);
    const countryOk = current.acceptedNames.some((name) => normalize(name) === normalizedAnswer);
    const capitalOk = !mode?.asksCapital || normalize(capitalAnswer) === normalize(current.capital);
    const ok = countryOk && capitalOk;
    if (mode?.daily) setDailyRecord((record) => addDailyOutcome(record, `${todayKey}:${mode.id}`, ok ? "correct" : "wrong"));
    setScore((value) => ({ ...value, [ok ? "correct" : "wrong"]: value[ok ? "correct" : "wrong"] + 1 }));
    const countryName = getCountryDisplayName(current, language);
    setFeedback({ text: ok ? text.correct : `${countryName}${mode?.asksCapital ? ` — ${current.capital}` : ""}`, ok });
    window.setTimeout(nextQuestion, ok ? 850 : 1400);
  }

  function resolveCustomDaily(modeId: string, correct: boolean) {
    setDailyRecord((record) => addDailyOutcome(record, `${todayKey}:${modeId}`, correct ? "correct" : "wrong"));
    setScore(correct ? { correct: 1, wrong: 0 } : { correct: 0, wrong: 1 });
  }

  function openDailyHub() {
    setHubCategory("daily");
    setScreen("hub");
  }

  function openGeographySetup() {
    setScreen("player");
  }

  function continueWithNickname() {
    const nickname = nicknameInput.trim().slice(0, 20);
    if (!nickname) return;
    localStorage.setItem("mundoquiz_nickname", nickname);
    setPlayer({ nickname, isGuest: false });
    setHubCategory("geography");
    setScreen("hub");
  }

  function continueAsGuest() {
    setPlayer({ nickname: language === "es" ? "Invitado" : "Guest", isGuest: true });
    setHubCategory("geography");
    setScreen("hub");
  }

  function returnToHub() {
    setHubCategory(mode?.daily ? "daily" : "geography");
    setScreen("hub");
  }

  const geographyModes = MODES.filter((item) => !item.daily);

  if (screen === "player") {
    return <main className="player-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={() => setScreen("menu")} backLabel={text.mainMenu} />
      <section className="player-card"><span className="eyebrow">MUNDOQUIZ</span><h1>{text.identifyYourself}</h1><label htmlFor="nickname">{text.nicknameLabel}</label><input id="nickname" value={nicknameInput} onChange={(event) => setNicknameInput(event.target.value.slice(0, 20))} onKeyDown={(event) => { if (event.key === "Enter") continueWithNickname(); }} placeholder={text.nicknamePlaceholder} maxLength={20} autoFocus /><button className="player-primary" onClick={continueWithNickname} disabled={!nicknameInput.trim()}>{text.continueAsPlayer}</button><div className="player-divider"><span>o</span></div><button className="player-guest" onClick={continueAsGuest}>{text.playAsGuest}</button></section>
    </main>;
  }

  if (screen === "ranking") {
    return <main className="ranking-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={() => setScreen("menu")} backLabel={text.mainMenu} />
      <HistoricalRanking language={language} modes={geographyModes} />
    </main>;
  }

  if (screen === "intro" && mode) {
    const copy = mode.copy[language];
    return <main className="intro-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} />
      <section className="intro-card">
        <div className={`intro-visual ${mode.flags.length === 4 ? "four" : ""}`}>{mode.flags.map((flag, flagIndex) => <span key={`${flag}-${flagIndex}`}>{flag}</span>)}</div>
        <div className="intro-content">
          <span className="intro-kicker">{mode.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <h2>{text.howToPlay}</h2>
          <ul>{copy.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          <button className="start-game" onClick={() => startGame(mode)}>{text.start}</button>
        </div>
      </section>
    </main>;
  }

  if (screen === "game" && mode && current) {
    const copy = mode.copy[language];
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} />
      <section className="game-shell">
        <div className="game-meta"><span>{copy.title}</span><span className="round-score"><b>{score.correct}</b><i>–</i><em>{score.wrong}</em></span><span>{index + 1} / {questions.length}</span></div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        <article className="question-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flag-stage"><img src={current.flag} alt={language === "es" ? "Bandera a identificar" : "Flag to identify"} /></div>
          <form onSubmit={submitAnswer}>
            <label htmlFor="country">{text.countryQuestion}</label>
            <input id="country" value={countryAnswer} onChange={(event) => setCountryAnswer(event.target.value)} autoFocus autoComplete="off" placeholder={text.countryPlaceholder} />
            {mode.asksCapital && <><label htmlFor="capital">{text.capitalQuestion}</label><input id="capital" value={capitalAnswer} onChange={(event) => setCapitalAnswer(event.target.value)} autoComplete="off" placeholder={text.capitalPlaceholder} /></>}
            {feedback && <div className={`feedback ${feedback.ok ? "ok" : "bad"}`}>{feedback.text}</div>}
            <div className="game-actions"><button type="button" className="skip" onClick={() => { setCountryAnswer(""); submitAnswer({ preventDefault() {} } as FormEvent); }}>{text.skip}</button><button type="submit" className="confirm">{text.confirm}</button></div>
          </form>
        </article>
      </section>
    </main>;
  }

  if (screen === "detective" && mode && current) {
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} />
      <CountryDetective target={current} countries={countries} language={language} onResolved={(correct) => resolveCustomDaily("detective", correct)} onContinue={() => setScreen("results")} />
    </main>;
  }

  if (screen === "wordle" && mode && current) {
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} />
      <CountryWordle target={current} countries={countries} language={gameLanguage} onResolved={(correct) => resolveCustomDaily("wordle", correct)} onContinue={() => setScreen("results")} />
    </main>;
  }

  if (screen === "results" && mode) {
    return <main className="result-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} />
      <div className="result-wrap"><div className="result-card"><span className="eyebrow">{mode.daily ? text.dailyCompleted : text.gameCompleted}</span><h1>{resultPercent}%</h1><p>{score.correct} {text.correctAnswers} {totalAnswered}</p><div className="result-actions">{!mode.daily && <button onClick={() => startGame(mode)}>{text.playAgain}</button>}<button className="secondary" onClick={returnToHub}>{text.viewModes}</button></div></div></div>
    </main>;
  }

  if (screen === "dailyReview" && mode && current) {
    const correct = score.correct > 0;
    const countryName = getCountryDisplayName(current, language);
    const streak = getDailyStreak(dailyRecord, mode.id);
    return <main className="daily-review-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} />
      <section className="daily-review-card"><span className={`review-status ${correct ? "correct" : "wrong"}`}>{language === "es" ? (correct ? "DESAFÍO SUPERADO" : "DESAFÍO NO SUPERADO") : (correct ? "CHALLENGE COMPLETED" : "CHALLENGE MISSED")}</span><h1>{mode.copy[language].title}</h1><div className="review-flag">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={current.flag} alt={countryName} /></div><h2>{countryName}</h2>{streak > 0 && <div className="review-streak">🔥 {streak} {language === "es" ? "días de racha" : "day streak"}</div>}<button onClick={returnToHub}>{text.viewModes}</button></section>
    </main>;
  }

  if (screen === "hub") {
    const visibleModes = MODES.filter((item) => hubCategory === "daily" ? item.daily : !item.daily);
    return <main className="home-page">
    <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={() => setScreen("menu")} backLabel={text.mainMenu} />
    <section className="hub"><div className="hub-heading"><span>{hubCategory === "daily" ? text.dailyChallenges : text.geographyLevel}</span>{hubCategory === "geography" && <small>{player.isGuest ? text.playAsGuest : player.nickname}</small>}</div><h1>{text.chooseGame}</h1><div className="mode-grid">{visibleModes.map((item) => {
      const copy = item.copy[language];
      const completed = item.daily && isDailyCompleted(item.id);
      const streak = item.customGame ? getDailyStreak(dailyRecord, item.id) : 0;
      const badge = item.customGame ? (streak ? `${streak} 🔥` : completed ? undefined : item.badge) : item.badge;
      return <button className={`mode-card ${completed ? "completed" : ""}`} key={item.id} onClick={() => openMode(item)} disabled={!countries.length}>
        {badge && <span className={`badge ${item.id === "capitals" ? "yellow" : ""}`}>{badge}</span>}
        <div className={`mode-preview ${item.flags.length === 4 ? "four" : ""}`}>{item.flags.map((flag, flagIndex) => <span key={`${flag}-${flagIndex}`}>{flag}</span>)}</div>
        <div className="play-band"><strong>{completed ? text.completed : text.play}</strong><small>{copy.title}</small></div>
      </button>;
    })}</div></section>
    <section className="about" id="about"><h2>{text.aboutTitle}</h2><p>{text.aboutText}</p></section>
    <footer><div className="logo footer-logo"><span>MUNDO</span>QUIZ</div><p>{text.footerText}</p><nav><a href="#top">{text.games}</a><a href="#about">{text.about}</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></nav></footer>
  </main>;
  }

  return <main className="menu-page">
    <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} />
    <section className="main-menu"><div className="menu-heading"><span className="eyebrow">MUNDOQUIZ</span><h1>{text.menuTitle}</h1></div><div className="menu-options">
      <button className="menu-option daily-option" onClick={openDailyHub}><span className="menu-icon">☀</span><div><h2>{text.dailyChallenges}</h2><p>{text.dailyDescription}</p></div><strong>→</strong></button>
      <button className="menu-option geography-option" onClick={openGeographySetup}><span className="menu-icon">🌍</span><div><h2>{text.geographyLevel}</h2><p>{text.geographyDescription}</p></div><strong>→</strong></button>
      <button className="menu-option ranking-option" onClick={() => setScreen("ranking")}><span className="menu-icon">♛</span><div><h2>{text.historicalRanking}</h2><p>{text.rankingDescription}</p></div><strong>→</strong></button>
    </div></section>
  </main>;
}

function AppHeader({ language, dailyRecord, onLanguage, onBack, backLabel }: { language: Language; dailyRecord: DailyRecord; onLanguage: () => void; onBack?: () => void; backLabel?: string }) {
  return <header className="topbar" id="top">
    {onBack ? <button className="back-button" onClick={onBack}>← {backLabel}</button> : <DailyCounter record={dailyRecord} language={language} />}
    <div className="logo"><span>MUNDO</span>QUIZ</div>
    <div className="top-actions">{onBack && <DailyCounter record={dailyRecord} language={language} />}<button className="language-button" onClick={onLanguage} aria-label="Change language"><Image src={language === "es" ? "/flags/es.svg" : "/flags/gb.svg"} alt="" width={24} height={16} /> <span>{language === "es" ? "ES" : "EN"}</span></button></div>
  </header>;
}

function DailyCounter({ record, language }: { record: DailyRecord; language: Language }) {
  return <div className="score-pill daily-counter" title={UI_TEXT[language].dailyScore}><b>{record.correct}</b><i>–</i><em>{record.wrong}</em></div>;
}
