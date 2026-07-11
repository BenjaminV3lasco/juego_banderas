"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import type { Country, Difficulty, ModeId } from "@/lib/game";
import { getCapitalDisplayName, getCountryDisplayName, normalize, shuffle } from "@/lib/game";
import type { Language } from "@/lib/i18n";
import { getGeographyName } from "@/lib/geography-names";

type Status = "correct" | "present" | "absent";

function word(value: string) { return normalize(value).replace(/\s/g, "").toUpperCase(); }
function evaluate(guess: string, answer: string): Status[] {
  const result: Status[] = Array(guess.length).fill("absent");
  const remaining = new Map<string, number>();
  answer.split("").forEach((letter, index) => guess[index] === letter ? result[index] = "correct" : remaining.set(letter, (remaining.get(letter) || 0) + 1));
  guess.split("").forEach((letter, index) => { if (result[index] !== "correct" && (remaining.get(letter) || 0) > 0) { result[index] = "present"; remaining.set(letter, (remaining.get(letter) || 0) - 1); } });
  return result;
}

export function DailyChallenge({ kind, target, countries, language, difficulty, onResolved, onContinue }: { kind: Extract<ModeId, "daily-capital" | "capital-wordle" | "flag-choice" | "geo-connection">; target: Country; countries: Country[]; language: Language; difficulty: Difficulty; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState<boolean | null>(null);
  const [guesses, setGuesses] = useState<{ value: string; status: Status[] }[]>([]);
  const [clues, setClues] = useState(difficulty === "easy" ? 2 : 1);
  const copy = language === "es" ? { check: "Confirmar", next: "Ver resultado", capital: "Escribí la capital", country: "Escribí el país", right: "¡Respuesta correcta!", wrong: "Respuesta incorrecta", was: "La respuesta era", clue: "Mostrar otra pista", tries: "intentos" } : { check: "Confirm", next: "View result", capital: "Type the capital", country: "Type the country", right: "Correct answer!", wrong: "Wrong answer", was: "The answer was", clue: "Show another clue", tries: "tries" };
  const countryName = getCountryDisplayName(target, language);
  const capitalName = getCapitalDisplayName(target, language);
  const capitalAnswer = word(capitalName);
  const maxTries = difficulty === "easy" ? 8 : difficulty === "normal" ? 6 : 4;
  const optionCount = difficulty === "easy" ? 3 : difficulty === "normal" ? 4 : 6;
  const flagOptions = useMemo(() => shuffle([target, ...shuffle(countries.filter((country) => country.name !== target.name)).slice(0, optionCount - 1)]), [countries, optionCount, target]);
  const capitalWords = useMemo(() => new Set(countries.map((country) => word(getCapitalDisplayName(country, language))).filter((value) => value.length === capitalAnswer.length)), [capitalAnswer.length, countries, language]);
  const connectionClues = [
    `${language === "es" ? "Continente" : "Continent"}: ${getGeographyName(target.region, language)}`,
    `${language === "es" ? "Subregión" : "Subregion"}: ${getGeographyName(target.subregion, language)}`,
    ...(difficulty === "hard" ? [] : [`Capital: ${capitalName}`]),
    `${language === "es" ? "Nombre" : "Name"}: ${word(countryName).length} ${language === "es" ? "letras" : "letters"}`,
  ];

  function finish(ok: boolean) { if (finished !== null) return; setFinished(ok); onResolved(ok); }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (kind === "capital-wordle") {
      const value = word(answer);
      if (value.length !== capitalAnswer.length || !capitalWords.has(value)) return;
      const next = [...guesses, { value, status: evaluate(value, capitalAnswer) }];
      setGuesses(next); setAnswer("");
      if (value === capitalAnswer) finish(true); else if (next.length === maxTries) finish(false);
      return;
    }
    const capitalOk = target.acceptedCapitals.some((capital) => normalize(capital) === normalize(answer));
    const ok = kind === "daily-capital" ? capitalOk : target.acceptedNames.some((name) => normalize(name) === normalize(answer));
    finish(ok);
  }

  if (finished !== null) return <section className="daily-game-shell daily-finish"><span className={finished ? "win" : "lose"}>{finished ? copy.right : copy.wrong}</span><h1>{copy.was}: {kind.includes("capital") ? capitalName : countryName}</h1><div className="daily-answer-flag"><Image src={target.flag} alt={countryName} width={320} height={180} unoptimized /></div><button onClick={onContinue}>{copy.next}</button></section>;

  if (kind === "flag-choice") return <section className="daily-game-shell"><h1>{countryName}</h1><p className="daily-prompt">{language === "es" ? "¿Cuál es su bandera?" : "Which is its flag?"}</p><div className={`flag-options options-${optionCount}`}>{flagOptions.map((country) => <button key={country.name} onClick={() => finish(country.name === target.name)}><Image src={country.flag} alt={language === "es" ? "Opción de bandera" : "Flag option"} width={180} height={100} unoptimized /></button>)}</div></section>;

  if (kind === "geo-connection") return <section className="daily-game-shell"><h1>{language === "es" ? "País oculto" : "Hidden country"}</h1><div className="connection-clues">{connectionClues.slice(0, clues).map((clue) => <div key={clue}>{clue}</div>)}</div>{clues < connectionClues.length && <button className="clue-button" onClick={() => setClues((value) => value + 1)}>{copy.clue}</button>}<form className="daily-answer-form" onSubmit={submit}><input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={copy.country} autoFocus /><button>{copy.check}</button></form></section>;

  return <section className="daily-game-shell"><h1>{kind === "daily-capital" ? countryName : (language === "es" ? "Capital Wordle" : "Capital Wordle")}</h1>{kind === "daily-capital" && difficulty === "easy" && <p className="daily-prompt">{getGeographyName(target.region, language)} · {getGeographyName(target.subregion, language)}</p>}{kind === "capital-wordle" && <><p className="daily-prompt">{guesses.length}/{maxTries} {copy.tries} · {capitalAnswer.length} {language === "es" ? "letras" : "letters"}</p><div className="capital-wordle-board">{guesses.map((guess, row) => <div className="capital-wordle-row" key={row}>{guess.value.split("").map((letter, index) => <span className={guess.status[index]} key={index}>{letter}</span>)}</div>)}</div></>}<form className="daily-answer-form" onSubmit={submit}><input value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={kind === "capital-wordle" ? capitalAnswer.length : undefined} placeholder={copy.capital} autoFocus /><button>{copy.check}</button></form></section>;
}
