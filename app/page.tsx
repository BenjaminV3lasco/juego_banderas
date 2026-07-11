"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CountryDetective } from "@/app/components/CountryDetective";
import { CountryWordle } from "@/app/components/CountryWordle";
import { HistoricalRanking } from "@/app/components/HistoricalRanking";
import { DailyChallenge } from "@/app/components/DailyChallenge";
import { CountryMap } from "@/app/components/CountryMap";
import { NeighbourCountries } from "@/app/components/NeighbourCountries";
import { addDailyOutcome, DailyRecord, EMPTY_DAILY_RECORD, getDailyCountry, getDailyStreak, getTodayKey, readDailyRecord } from "@/lib/daily";
import { Country, Difficulty, GameMode, getCapitalDisplayName, getCountryDisplayName, mapCountries, MODES, normalize, RawCountry, shuffle } from "@/lib/game";
import { Language, UI_TEXT } from "@/lib/i18n";
import { saveGameResult } from "@/lib/supabase/results";
import { filterCountriesByDifficulty } from "@/lib/difficulty";
import { createGameSessionId, saveCompetitiveAnswerEvent } from "@/lib/supabase/answer-events";

type Screen = "menu" | "hub" | "player" | "ranking" | "intro" | "game" | "detective" | "wordle" | "dailyGame" | "countryMap" | "neighbours" | "results" | "dailyReview";
type Score = { correct: number; wrong: number };
type Player = { nickname: string; isGuest: boolean };

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [mapCountryCodes, setMapCountryCodes] = useState<Set<string>>(new Set());
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
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [timerLimit, setTimerLimit] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const startedAt = useRef<number | null>(null);
  const timeoutHandled = useRef(false);
  const savedResult = useRef<string | null>(null);
  const gameSessionId = useRef<string | null>(null);
  const questionStartedAt = useRef<number | null>(null);
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
    fetch("/data/world-countries.geojson").then((response) => response.json()).then((data: { features: Array<{ properties: { ISO_A3?: string; ADM0_A3?: string } }> }) => setMapCountryCodes(new Set(data.features.map((feature) => feature.properties.ISO_A3 === "-99" ? feature.properties.ADM0_A3 : feature.properties.ISO_A3).filter((code): code is string => Boolean(code))))).catch(() => setMapCountryCodes(new Set()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isDailyCompleted = (modeId: string) => Boolean(dailyRecord.outcomes[`${todayKey}:${modeId}`] || (modeId === "daily" && dailyRecord.outcomes[todayKey]));
  const current = questions[index];
  const totalAnswered = score.correct + score.wrong;
  const progress = questions.length ? (index / questions.length) * 100 : 0;
  const resultPercent = useMemo(() => totalAnswered ? Math.round((score.correct / totalAnswered) * 100) : 0, [score, totalAnswered]);

  useEffect(() => {
    if (!["game", "detective", "wordle", "dailyGame", "countryMap", "neighbours"].includes(screen)) return;
    if (!startedAt.current) startedAt.current = Date.now();
    const update = () => setElapsedSeconds(Math.floor((Date.now() - (startedAt.current || Date.now())) / 1000));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    if (screen === "game" && mode && !mode.daily && current) questionStartedAt.current = Date.now();
  }, [current, index, mode, screen]);

  useEffect(() => {
    if (!mode?.daily || !timerLimit || elapsedSeconds < timerLimit || timeoutHandled.current || !["game", "detective", "wordle", "dailyGame", "countryMap", "neighbours"].includes(screen)) return;
    timeoutHandled.current = true;
    setDailyRecord((record) => addDailyOutcome(record, `${todayKey}:${mode.id}`, "wrong", difficulty));
    setScore({ correct: 0, wrong: 1 });
    setScreen("results");
  }, [difficulty, elapsedSeconds, mode, screen, timerLimit, todayKey]);

  useEffect(() => {
    if (screen !== "results" || !mode || !totalAnswered) return;
    const resultKey = `${mode.id}:${score.correct}:${score.wrong}`;
    if (savedResult.current === resultKey) return;
    savedResult.current = resultKey;
    void saveGameResult({ mode: mode.id, correct: score.correct, wrong: score.wrong, nickname: mode.daily ? "Invitado" : player.nickname, isGuest: mode.daily || player.isGuest, durationSeconds: elapsedSeconds, difficulty, timerLimitSeconds: timerLimit || null, isDaily: Boolean(mode.daily) }).catch((error: unknown) => {
      console.warn("No se pudo guardar el resultado en Supabase", error);
    });
  }, [difficulty, elapsedSeconds, mode, player, score.correct, score.wrong, screen, timerLimit, totalAnswered]);

  function toggleLanguage() {
    setLanguage((currentLanguage) => {
      const nextLanguage = currentLanguage === "es" ? "en" : "es";
      localStorage.setItem("mundoquiz_language", nextLanguage);
      return nextLanguage;
    });
  }

  function navigateTo(nextScreen: Screen) {
    setIsNavigating(true);
    window.setTimeout(() => {
      setScreen(nextScreen);
      setIsNavigating(false);
    }, 280);
  }

  function openMode(selected: GameMode) {
    if (selected.customGame === "detective") setTimerLimit(0);
    if (selected.daily && isDailyCompleted(selected.id)) {
      const recordKey = `${todayKey}:${selected.id}`;
      const outcome = dailyRecord.outcomes[recordKey] || dailyRecord.outcomes[todayKey];
      const playedDifficulty = dailyRecord.difficulties[recordKey] || difficulty;
      setMode(selected);
      setGameLanguage(language);
      setDifficulty(playedDifficulty);
      setQuestions([getDailyCountry(getEligiblePool(selected, playedDifficulty), recordKey)]);
      setScore(outcome === "correct" ? { correct: 1, wrong: 0 } : { correct: 0, wrong: 1 });
      setScreen("dailyReview");
      return;
    }
    setMode(selected);
    navigateTo("intro");
  }

  function getEligiblePool(selected: GameMode, selectedDifficulty = difficulty) {
    const basePool = selected.sovereignOnly ? countries.filter((country) => country.sovereign) : countries;
    const regionalPool = selected.region ? basePool.filter((country) => country.region === selected.region) : basePool;
    let eligiblePool = regionalPool;
    if (selected.customGame === "country-map") eligiblePool = regionalPool.filter((country) => mapCountryCodes.has(country.cca3));
    else if (selected.customGame === "neighbour-countries") eligiblePool = regionalPool.filter((country) => country.borders.length >= 2);
    else if (selected.customGame === "wordle" || selected.customGame === "capital-wordle") eligiblePool = regionalPool.filter((country) => (selected.customGame === "capital-wordle" ? [getCapitalDisplayName(country, language)] : [country.name, country.englishName]).every((countryName) => {
        const length = normalize(countryName).replace(/\s/g, "").length;
        return length >= 4 && length <= 12;
      }));
    return selected.daily ? filterCountriesByDifficulty(eligiblePool, selected, selectedDifficulty) : eligiblePool;
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
    timeoutHandled.current = false;
    setElapsedSeconds(0);
    startedAt.current = null;
    gameSessionId.current = selected.daily ? null : createGameSessionId();
    questionStartedAt.current = null;
    navigateTo(selected.customGame === "detective" ? "detective" : selected.customGame === "wordle" ? "wordle" : selected.customGame === "country-map" ? "countryMap" : selected.customGame === "neighbour-countries" ? "neighbours" : selected.customGame ? "dailyGame" : "game");
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
    const capitalOk = !mode?.asksCapital || current.acceptedCapitals.some((capital) => normalize(capital) === normalize(capitalAnswer));
    const ok = countryOk && capitalOk;
    if (mode && !mode.daily && gameSessionId.current) {
      void saveCompetitiveAnswerEvent({
        sessionId: gameSessionId.current,
        countryCode: current.cca3,
        gameMode: mode.id,
        difficulty,
        language: gameLanguage,
        correct: ok,
        responseTimeMs: Date.now() - (questionStartedAt.current || Date.now()),
        attemptsUsed: 1,
      }).catch((error: unknown) => console.warn("No se pudo guardar la respuesta competitiva", error));
    }
    if (mode?.daily) setDailyRecord((record) => addDailyOutcome(record, `${todayKey}:${mode.id}`, ok ? "correct" : "wrong", difficulty));
    setScore((value) => ({ ...value, [ok ? "correct" : "wrong"]: value[ok ? "correct" : "wrong"] + 1 }));
    const countryName = getCountryDisplayName(current, language);
    setFeedback({ text: ok ? text.correct : `${countryName}${mode?.asksCapital ? ` — ${getCapitalDisplayName(current, language)}` : ""}`, ok });
    window.setTimeout(nextQuestion, ok ? 850 : 1400);
  }

  function resolveCustomDaily(modeId: string, correct: boolean) {
    setDailyRecord((record) => addDailyOutcome(record, `${todayKey}:${modeId}`, correct ? "correct" : "wrong", difficulty));
    setScore(correct ? { correct: 1, wrong: 0 } : { correct: 0, wrong: 1 });
  }

  function openDailyHub() {
    setHubCategory("daily");
    navigateTo("hub");
  }

  function openGeographySetup() {
    navigateTo("player");
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

  function confirmCompetitiveExit() {
    setShowExitConfirm(false);
    returnToHub();
  }

  const geographyModes = MODES.filter((item) => !item.daily);

  if (isNavigating) return <ScreenLoader language={language} />;

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
    const copy = getModeCopy(mode, language);
    return <main className="intro-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter={mode.daily} />
      <section className="intro-card">
        <div className="intro-visual"><GamePreview mode={mode} /></div>
        <div className="intro-content">
          <span className="intro-kicker">{localizeGameLabel(mode.kicker, language)}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <h2>{text.howToPlay}</h2>
          <ul>{copy.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          {mode.daily && <div className="game-settings"><span>{language === "es" ? "Dificultad" : "Difficulty"}</span><div>{(["easy", "normal", "hard"] as Difficulty[]).map((value) => <button type="button" className={difficulty === value ? "active" : ""} onClick={() => setDifficulty(value)} key={value}>{language === "es" ? ({ easy: "Fácil", normal: "Normal", hard: "Difícil" }[value]) : value}</button>)}</div>{mode.customGame !== "detective" && <><span>{language === "es" ? "Contador" : "Timer"}</span><div>{[0, 90, 60, 40].map((value) => <button type="button" className={timerLimit === value ? "active" : ""} onClick={() => setTimerLimit(value)} key={value}>{value ? `${value}s` : (language === "es" ? "Sin tiempo" : "No timer")}</button>)}</div></>}</div>}
          <button className="start-game" onClick={() => startGame(mode)}>{text.start}</button>
        </div>
      </section>
    </main>;
  }

  if (screen === "game" && mode && current) {
    const copy = getModeCopy(mode, language);
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={() => mode.daily ? returnToHub() : setShowExitConfirm(true)} backLabel={text.back} showCounter={mode.daily} />
      <section className="game-shell">
        {!mode.daily && <div className="competitive-timer">⏱ {formatTime(elapsedSeconds)}</div>}
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
      {!mode.daily && showExitConfirm && <ExitConfirmation language={language} onCancel={() => setShowExitConfirm(false)} onConfirm={confirmCompetitiveExit} />}
    </main>;
  }

  if (screen === "detective" && mode && current) {
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter={mode.daily} />
      <CountryDetective target={current} countries={countries} language={language} onResolved={(correct) => resolveCustomDaily("detective", correct)} onContinue={() => setScreen("results")} />
    </main>;
  }

  if (screen === "wordle" && mode && current) {
    return <main className="game-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter={mode.daily} />
      <CountryWordle target={current} countries={countries} language={gameLanguage} onResolved={(correct) => resolveCustomDaily("wordle", correct)} onContinue={() => setScreen("results")} />
    </main>;
  }

  if (screen === "countryMap" && mode && current) {
    return <main className="game-page"><AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter /><CountryMap target={current} language={gameLanguage} difficulty={difficulty} onResolved={(correct) => resolveCustomDaily(mode.id, correct)} onContinue={() => setScreen("results")} /></main>;
  }

  if (screen === "neighbours" && mode && current) {
    return <main className="game-page"><AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter /><NeighbourCountries target={current} countries={countries} language={gameLanguage} difficulty={difficulty} onResolved={(correct) => resolveCustomDaily(mode.id, correct)} onContinue={() => setScreen("results")} /></main>;
  }

  if (screen === "dailyGame" && mode && current && mode.customGame && !["detective", "wordle"].includes(mode.customGame)) {
    return <main className="game-page"><AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter /><div className="daily-game-meta"><span>{language === "es" ? ({ easy: "FÁCIL", normal: "NORMAL", hard: "DIFÍCIL" }[difficulty]) : difficulty.toUpperCase()}</span>{timerLimit > 0 && <b>⏱ {formatTime(Math.max(0, timerLimit - elapsedSeconds))}</b>}</div><DailyChallenge kind={mode.customGame as "daily-capital" | "capital-wordle" | "flag-choice" | "geo-connection"} target={current} countries={countries} language={gameLanguage} difficulty={difficulty} onResolved={(correct) => resolveCustomDaily(mode.id, correct)} onContinue={() => setScreen("results")} /></main>;
  }

  if (screen === "results" && mode) {
    return <main className="result-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} showCounter={mode.daily} />
      <div className="result-wrap"><div className="result-card"><span className="eyebrow">{mode.daily ? text.dailyCompleted : text.gameCompleted}</span><h1>{resultPercent}%</h1><p>{score.correct} {text.correctAnswers} {totalAnswered}</p>{(!mode.daily || timerLimit > 0) && <p className="result-time">⏱ {formatTime(elapsedSeconds)}</p>}<div className="result-actions">{!mode.daily && <button onClick={() => startGame(mode)}>{text.playAgain}</button>}<button className="secondary" onClick={returnToHub}>{text.viewModes}</button></div></div></div>
    </main>;
  }

  if (screen === "dailyReview" && mode && current) {
    const correct = score.correct > 0;
    const countryName = getCountryDisplayName(current, language);
    const streak = getDailyStreak(dailyRecord, mode.id);
    return <main className="daily-review-page">
      <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={returnToHub} backLabel={text.back} showCounter={mode.daily} />
      <section className="daily-review-card"><span className={`review-status ${correct ? "correct" : "wrong"}`}>{language === "es" ? (correct ? "DESAFÍO SUPERADO" : "DESAFÍO NO SUPERADO") : (correct ? "CHALLENGE COMPLETED" : "CHALLENGE MISSED")}</span><h1>{getModeCopy(mode, language).title}</h1><div className="review-flag">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={current.flag} alt={countryName} /></div><h2>{countryName}</h2>{streak > 0 && <div className="review-streak">🔥 {streak} {language === "es" ? "días de racha" : "day streak"}</div>}<button onClick={returnToHub}>{text.viewModes}</button></section>
    </main>;
  }

  if (screen === "hub") {
    const visibleModes = MODES.filter((item) => hubCategory === "daily" ? item.daily : !item.daily);
    return <main className="home-page">
    <AppHeader language={language} dailyRecord={dailyRecord} onLanguage={toggleLanguage} onBack={() => setScreen("menu")} backLabel={text.mainMenu} showCounter={hubCategory === "daily"} />
    <section className="hub"><div className="hub-heading"><span>{hubCategory === "daily" ? text.dailyChallenges : text.geographyLevel}</span>{hubCategory === "geography" && <small>{player.isGuest ? text.playAsGuest : player.nickname}</small>}</div><h1>{text.chooseGame}</h1><div className="mode-grid">{visibleModes.map((item) => {
      const copy = getModeCopy(item, language);
      const completed = item.daily && isDailyCompleted(item.id);
      const streak = item.customGame ? getDailyStreak(dailyRecord, item.id) : 0;
      const badge = item.customGame ? (streak ? `${streak} 🔥` : completed ? undefined : item.badge) : item.badge;
      return <button className={`mode-card ${completed ? "completed" : ""}`} key={item.id} onClick={() => openMode(item)} disabled={!countries.length || (item.id === "country-map" && !mapCountryCodes.size)}>
        {badge && <span className={`badge ${item.id === "capitals" ? "yellow" : ""}`}>{localizeGameLabel(badge, language)}</span>}
        <GamePreview mode={item} />
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
      <button className="menu-option daily-option" onClick={openDailyHub}><MenuIcon kind="daily" /><div><span className="menu-number">01</span><h2>{text.dailyChallenges}</h2><p>{text.dailyDescription}</p></div><strong>→</strong></button>
      <button className="menu-option geography-option" onClick={openGeographySetup}><MenuIcon kind="geography" /><div><span className="menu-number">02</span><h2>{text.geographyLevel}</h2><p>{text.geographyDescription}</p></div><strong>→</strong></button>
      <button className="menu-option ranking-option" onClick={() => navigateTo("ranking")}><MenuIcon kind="ranking" /><div><span className="menu-number">03</span><h2>{text.historicalRanking}</h2><p>{text.rankingDescription}</p></div><strong>→</strong></button>
    </div></section>
  </main>;
}

function AppHeader({ language, dailyRecord, onLanguage, onBack, backLabel, showCounter = false }: { language: Language; dailyRecord: DailyRecord; onLanguage: () => void; onBack?: () => void; backLabel?: string; showCounter?: boolean }) {
  return <header className="topbar" id="top">
    {onBack ? <button className="back-button" onClick={onBack}>← {backLabel}</button> : showCounter ? <DailyCounter record={dailyRecord} language={language} /> : <span />}
    <div className="logo"><span>MUNDO</span>QUIZ</div>
    <div className="top-actions">{onBack && showCounter && <DailyCounter record={dailyRecord} language={language} />}<button className="language-button" onClick={onLanguage} aria-label="Change language"><Image src={language === "es" ? "/flags/es.svg" : "/flags/gb.svg"} alt="" width={24} height={16} /> <span>{language === "es" ? "ES" : "EN"}</span></button></div>
  </header>;
}

function DailyCounter({ record, language }: { record: DailyRecord; language: Language }) {
  return <div className="score-pill daily-counter" title={UI_TEXT[language].dailyScore}><b>{record.correct}</b><i>–</i><em>{record.wrong}</em></div>;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function localizeGameLabel(label: string, language: Language) {
  if (language === "en") return label;
  return ({ DAILY: "DIARIO", MYSTERY: "MISTERIO", CAPITAL: "CAPITAL", FLAGS: "BANDERAS", CONNECTION: "CONEXIÓN", MAP: "MAPA", BORDERS: "FRONTERAS", WORLD: "MUNDO", COUNTRIES: "PAÍSES", EXPERT: "EXPERTO", REGION: "REGIÓN", NEW: "NUEVO", POPULAR: "POPULAR", DOUBLE: "DOBLE" } as Record<string, string>)[label] || label;
}

function getModeCopy(mode: GameMode, language: Language) {
  const copy = mode.copy[language];
  if (language === "en") return copy;
  const neutralize = (value: string) => value
    .replaceAll("Adiviná", "Adivina").replaceAll("Descubrí", "Descubre")
    .replaceAll("Elegí", "Elige").replaceAll("Tenés", "Tienes")
    .replaceAll("Podés", "Puedes").replaceAll("podés", "puedes")
    .replaceAll("Recorré", "Recorre").replaceAll("Escribí", "Escribe")
    .replaceAll("sabés", "sabes").replaceAll("Poné", "Pon")
    .replaceAll("Completá", "Completa").replaceAll("reconocé", "reconoce")
    .replaceAll("recordá", "recuerda").replaceAll("acertás", "aciertas")
    .replaceAll("revelás", "revelas").replaceAll("sumás", "sumas");
  return { title: neutralize(copy.title), description: neutralize(copy.description), rules: copy.rules.map(neutralize) };
}

function ScreenLoader({ language }: { language: Language }) {
  return <main className="screen-loader" role="status" aria-live="polite"><div className="loader-brand"><div className="loader-orbit"><span /></div><div className="logo"><span>MUNDO</span>QUIZ</div><p>{language === "es" ? "Preparando el desafío…" : "Preparing the challenge…"}</p><div className="loader-bar"><i /></div></div></main>;
}

function ExitConfirmation({ language, onCancel, onConfirm }: { language: Language; onCancel: () => void; onConfirm: () => void }) {
  const copy = language === "es"
    ? { eyebrow: "PARTIDA EN CURSO", title: "¿Quieres abandonar la partida?", body: "Tu progreso actual se perderá y este resultado no aparecerá en el ranking.", cancel: "Continuar jugando", confirm: "Abandonar partida" }
    : { eyebrow: "GAME IN PROGRESS", title: "Do you want to leave the game?", body: "Your current progress will be lost and this result will not appear in the ranking.", cancel: "Keep playing", confirm: "Leave game" };
  return <div className="exit-modal-backdrop" role="presentation" onMouseDown={onCancel}><section className="exit-modal" role="alertdialog" aria-modal="true" aria-labelledby="exit-title" onMouseDown={(event) => event.stopPropagation()}><div className="exit-modal-icon"><span>!</span></div><small>{copy.eyebrow}</small><h2 id="exit-title">{copy.title}</h2><p>{copy.body}</p><div className="exit-modal-actions"><button className="stay" onClick={onCancel}>{copy.cancel}</button><button className="leave" onClick={onConfirm}>{copy.confirm}</button></div></section></div>;
}

function MenuIcon({ kind }: { kind: "daily" | "geography" | "ranking" }) {
  if (kind === "daily") return <span className="menu-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="8"/><path d="M24 4v7M24 37v7M4 24h7M37 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5"/></svg></span>;
  if (kind === "geography") return <span className="menu-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c6 5 9 11 9 18s-3 13-9 18c-6-5-9-11-9-18s3-13 9-18z"/></svg></span>;
  return <span className="menu-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 39h30M13 35h22l2-20-9 7-4-12-4 12-9-7 2 20z"/><circle cx="11" cy="12" r="2"/><circle cx="24" cy="7" r="2"/><circle cx="37" cy="12" r="2"/></svg></span>;
}

function GamePreview({ mode }: { mode: GameMode }) {
  const isWordle = mode.customGame === "wordle" || mode.customGame === "capital-wordle";
  const isConnection = mode.customGame === "detective" || mode.customGame === "geo-connection";
  const isCapital = mode.customGame === "daily-capital" || mode.id === "capitals";
  const continentFlags: Partial<Record<GameMode["id"], [FlagCode, FlagCode]>> = {
    americas: ["AR", "BR"], europe: ["ES", "FR"], asia: ["JP", "KR"], africa: ["ZA", "EG"],
  };
  const featuredFlags = continentFlags[mode.id];
  return <div className={`mode-preview svg-preview preview-${mode.id}`}><svg viewBox="0 0 200 150" aria-hidden="true">
    <defs><linearGradient id={`panel-${mode.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0e4051"/><stop offset="1" stopColor="#061923"/></linearGradient><filter id={`glow-${mode.id}`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="18" y="15" width="164" height="120" rx="14" fill={`url(#panel-${mode.id})`} stroke="#236078"/>
    {isWordle && <g>{[[54,42,"M","#2eaa73"],[82,42,"U","#273b45"],[110,42,"N","#c59610"],[138,42,"D","#273b45"],[54,72,"Q","#273b45"],[82,72,"U","#2eaa73"],[110,72,"I","#2eaa73"],[138,72,"Z","#273b45"]].map(([x,y,l,c]) => <g key={`${x}-${y}`}><rect x={Number(x)} y={Number(y)} width="24" height="24" rx="4" fill={String(c)} stroke="#77909a" strokeOpacity=".5"/><text x={Number(x)+12} y={Number(y)+17} textAnchor="middle" fill="white" fontSize="11" fontWeight="800">{l}</text></g>)}<rect x="65" y="108" width="70" height="6" rx="3" fill="#1f5365"/></g>}
    {mode.customGame === "country-map" && <g><path d="M43 45h114v69H43z" fill="#082b39" stroke="#3a7890" strokeWidth="3"/><path d="M47 63c15-8 23-3 32-12l14 7 10-5 13 10 16-2 18 12-8 12-17 1-10 14-18-8-14 7-12-10-18-4z" fill="#43b879" stroke="#15705a" strokeWidth="2"/><path d="M116 42c0 14-14 29-14 29S88 56 88 42a14 14 0 1 1 28 0Z" fill="#ffbf00" stroke="#ffda63"/><circle cx="102" cy="42" r="4" fill="#132a32"/><path d="M52 105h41M119 105h29" stroke="#50c8e5" strokeWidth="3" strokeLinecap="round"/><circle cx="102" cy="105" r="10" fill="#113f50" stroke="#50c8e5"/><path d="m98 105 3 3 6-7" fill="none" stroke="#42d99a" strokeWidth="2.5"/></g>}
    {mode.customGame === "neighbour-countries" && <g><path d="M100 75 62 48M100 75l39-27M100 75l-33 39M100 75l38 38" stroke="#42b7d3" strokeWidth="3"/><circle cx="100" cy="75" r="25" fill="#ffbf00" stroke="#ffe078" strokeWidth="3"/><path d="m88 76 8 8 17-20" fill="none" stroke="#17313a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>{[[62,48],[139,48],[67,114],[138,113]].map(([x,y],index)=><g key={`${x}-${y}`}><circle cx={x} cy={y} r="15" fill={index%2 ? "#17495b" : "#15523f"} stroke={index%2 ? "#44c4e2" : "#45d69a"} strokeWidth="3"/><path d={`M${x-7} ${y-2}h14M${x-5} ${y+4}h10`} stroke="#d9edf2" strokeWidth="2" strokeLinecap="round"/></g>)}</g>}
    {isConnection && <g stroke="#2e91ae" strokeWidth="2" fill="#092a37"><path d="M100 64L55 43M100 64l45-21M100 64v43" opacity=".75"/><circle cx="100" cy="64" r="24" fill="#0a3544" stroke="#ffbf00"/><text x="100" y="73" textAnchor="middle" fill="#ffcc32" stroke="none" fontSize="26" fontWeight="800">?</text><circle cx="55" cy="43" r="12"/><circle cx="145" cy="43" r="12"/><circle cx="100" cy="107" r="12"/><path d="M49 43h12M139 43h12M94 107h12" stroke="#77d8ec"/></g>}
    {mode.customGame === "flag-choice" && <g>{[[44,38,"#4d9f6c"],[104,38,"#397fa8"],[44,82,"#d4b944"],[104,82,"#a44d58"]].map(([x,y,c], index) => <g key={`${x}-${y}`}><rect x={Number(x)} y={Number(y)} width="52" height="34" rx="5" fill={String(c)} stroke={index === 1 ? "#42d99a" : "#78909a"} strokeWidth={index === 1 ? 3 : 1}/>{index === 1 && <><circle cx="153" cy="36" r="10" fill="#42d99a"/><path d="m148 36 3 3 6-7" fill="none" stroke="#05241a" strokeWidth="2.5"/></>}</g>)}</g>}
    {isCapital && <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M47 111h91M55 101h75M62 58h61l9 13H53l9-13Z" fill="#183d4b" stroke="#a8bdc5" strokeWidth="3"/><path d="M66 74v25M82 74v25M99 74v25M115 74v25" stroke="#7094a1" strokeWidth="7"/><path d="M151 43c0 13-14 27-14 27s-14-14-14-27a14 14 0 1 1 28 0Z" fill="#ffbf00" stroke="#ffda63"/><circle cx="137" cy="43" r="4" fill="#08212c" stroke="none"/>{mode.customGame === "daily-capital" && <g><rect x="35" y="29" width="33" height="30" rx="5" fill="#edf2f3" stroke="#dbe5e8"/><path d="M35 39h33" stroke="#00b9dd" strokeWidth="7"/><text x="51.5" y="54" textAnchor="middle" fill="#0b2934" stroke="none" fontSize="12" fontWeight="900">24</text></g>}{mode.id === "capitals" && <g><rect x="32" y="30" width="38" height="27" rx="4" fill="#f1eee5" stroke="#d9e3e6"/><path d="M32 39h38M32 48h38" stroke="#45a370" strokeWidth="9"/><circle cx="67" cy="57" r="8" fill="#3bd18f" stroke="#06271b" strokeWidth="2"/><path d="m63 57 3 3 5-6" stroke="#06271b" strokeWidth="2"/></g>}</g>}
    {mode.id === "daily" && <g><rect x="43" y="39" width="62" height="70" rx="8" fill="#e6edef"/><path d="M43 55h62" stroke="#ffbf00" strokeWidth="12"/><text x="74" y="91" textAnchor="middle" fill="#102b36" fontSize="25" fontWeight="900">24</text><path d="M118 58h39v38h-39z" fill="#f1eee1" stroke="#dce5e8" strokeWidth="3"/><path d="M118 71h39M118 84h39" stroke="#39a66f" strokeWidth="13"/><circle cx="157" cy="101" r="13" fill="#3bd18f"/><path d="m151 101 4 4 8-10" fill="none" stroke="#05261a" strokeWidth="3"/></g>}
    {featuredFlags && <g><g transform="rotate(-6 78 75)"><rect x="39" y="45" width="78" height="58" rx="9" fill="#123d4d" stroke="#31a879" strokeWidth="3"/><rect x="46" y="52" width="64" height="44" rx="6" fill="#092630"/><FlagSymbol code={featuredFlags[0]} x={49} y={56}/></g><g transform="rotate(6 121 75)"><rect x="82" y="45" width="78" height="58" rx="9" fill="#123d4d" stroke="#2585aa" strokeWidth="3"/><rect x="89" y="52" width="64" height="44" rx="6" fill="#092630"/><FlagSymbol code={featuredFlags[1]} x={92} y={56}/></g><circle cx="151" cy="108" r="14" fill="#3bd18f" filter={`url(#glow-${mode.id})`}/><path d="m144 108 5 5 10-12" fill="none" stroke="#05261a" strokeWidth="3"/></g>}
    {mode.id === "world" && <g><circle cx="100" cy="74" r="43" fill="#13769a" stroke="#65d6ed" strokeWidth="3"/><path d="M62 70c12-4 15-17 27-15l9 9-8 11 5 8-8 12-13-4-9-11M116 36l-5 13 9 7 13-2 8 13-7 13-13 3-4 20" fill="#45b879" stroke="#0d5d4a" strokeWidth="2"/><path d="M58 74h84M100 31c12 12 18 27 18 43s-6 31-18 43M100 31c-12 12-18 27-18 43s6 31 18 43" fill="none" stroke="#9ce7f3" strokeOpacity=".45"/><circle cx="137" cy="108" r="13" fill="#ffbf00"/><path d="m131 108 4 4 8-10" fill="none" stroke="#322300" strokeWidth="3"/></g>}
    {mode.id === "sovereign" && <g><circle cx="100" cy="74" r="43" fill="#0b3544" stroke="#42d99a" strokeWidth="3"/><circle cx="100" cy="74" r="27" fill="none" stroke="#2b7e77" strokeWidth="2"/><path d="M100 47v54M73 74h54M82 54c7 6 11 12 11 20s-4 15-11 21M118 54c-7 6-11 12-11 20s4 15 11 21" fill="none" stroke="#72c6bb" strokeWidth="2"/><path d="M65 42l4 3-2 5-5-3zM135 42l-4 3 2 5 5-3zM61 100l5-1 2 5-6 1zM139 100l-5-1-2 5 6 1z" fill="#ffbf00"/><circle cx="137" cy="108" r="14" fill="#3bd18f"/><path d="m130 108 5 5 10-12" fill="none" stroke="#05261a" strokeWidth="3"/></g>}
    {!featuredFlags && mode.id !== "world" && mode.id !== "sovereign" && !isWordle && !isConnection && !isCapital && mode.customGame !== "flag-choice" && mode.customGame !== "country-map" && mode.customGame !== "neighbour-countries" && mode.id !== "daily" && <g transform="rotate(-5 100 75)"><rect x="45" y="45" width="78" height="51" rx="7" fill="#f1eee5" stroke="#b9c9cf" strokeWidth="4"/><path d="M45 62h78M45 79h78" stroke="#39936a" strokeWidth="17"/><rect x="78" y="55" width="78" height="51" rx="7" fill="#e9edf0" stroke="#d2dce0" strokeWidth="4"/><path d="M78 72h78M78 89h78" stroke="#347da4" strokeWidth="17"/><circle cx="151" cy="104" r="15" fill="#3bd18f" filter={`url(#glow-${mode.id})`}/><path d="m144 104 5 5 10-12" fill="none" stroke="#05261a" strokeWidth="3"/></g>}
  </svg></div>;
}

type FlagCode = "AR" | "BR" | "ES" | "FR" | "JP" | "KR" | "ZA" | "EG";

function FlagSymbol({ code, x, y }: { code: FlagCode; x: number; y: number }) {
  const w = 58, h = 36;
  if (code === "AR") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#74c6e7"/><rect x={x} y={y+12} width={w} height="12" fill="white"/><circle cx={x+29} cy={y+18} r="4" fill="#f6b91c"/></g>;
  if (code === "BR") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#22974b"/><path d={`M${x+29} ${y+4}l23 14-23 14L${x+6} ${y+18}z`} fill="#f4ce2e"/><circle cx={x+29} cy={y+18} r="8" fill="#2454a4"/></g>;
  if (code === "ES") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#bf2638"/><rect x={x} y={y+9} width={w} height="18" fill="#f5c928"/></g>;
  if (code === "FR") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#fff"/><path d={`M${x} ${y}h${w/3}v${h}H${x}z`} fill="#002395"/><path d={`M${x+w*2/3} ${y}h${w/3}v${h}H${x+w*2/3}z`} fill="#ed2939"/><rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke="#cdd8dc" strokeWidth="1"/></g>;
  if (code === "JP") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="white"/><circle cx={x+29} cy={y+18} r="10" fill="#d52d3f"/></g>;
  if (code === "KR") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="white"/><path d={`M${x+20} ${y+18}a9 9 0 0 1 18 0c-4.5-3.5-9 3.5-13.5 0s-4.5-3.5-4.5 0Z`} fill="#d73745"/><path d={`M${x+38} ${y+18}a9 9 0 0 1-18 0c4.5 3.5 9-3.5 13.5 0s4.5 3.5 4.5 0Z`} fill="#2462a4"/><g stroke="#18212a" strokeWidth="1.7"><path d={`M${x+7} ${y+8}l8 4M${x+8} ${y+5}l8 4M${x+43} ${y+27}l8 4M${x+42} ${y+30}l8 4M${x+8} ${y+31}l8-4M${x+7} ${y+34}l8-4M${x+42} ${y+9}l8-4M${x+43} ${y+12}l8-4`}/></g></g>;
  if (code === "EG") return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#ce2738"/><rect x={x} y={y+12} width={w} height="12" fill="#fff"/><rect x={x} y={y+24} width={w} height="12" fill="#111"/><path d={`M${x+24} ${y+16}l5-3 5 3-2 2 3 1-6 4-6-4 3-1z`} fill="#c89b28"/></g>;
  return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="#de3831"/><path d={`M${x} ${y+36}h58V${y+21}H${x+25}z`} fill="#002395"/><path d={`M${x} ${y+2}l28 16L${x} ${y+34}z`} fill="#000" stroke="#ffb81c" strokeWidth="3"/><path d={`M${x} ${y+7}l21 11L${x} ${y+29}M${x+19} ${y+18}h39`} fill="none" stroke="#fff" strokeWidth="10"/><path d={`M${x} ${y+10}l17 8L${x} ${y+26}M${x+17} ${y+18}h41`} fill="none" stroke="#007a4d" strokeWidth="6"/></g>;
}
