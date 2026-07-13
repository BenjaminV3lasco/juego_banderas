"use client";

import { CSSProperties, FormEvent, useMemo, useRef, useState } from "react";
import type { Country, Difficulty } from "@/lib/game";
import { getCapitalDisplayName, getCountryDisplayName, normalize } from "@/lib/game";
import type { Language } from "@/lib/i18n";

type LetterStatus = "correct" | "present" | "absent";
type EvaluatedGuess = { word: string; statuses: LetterStatus[] };

const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const STATUS_PRIORITY: Record<LetterStatus, number> = { absent: 1, present: 2, correct: 3 };

function toWord(value: string) {
  return normalize(value).replace(/\s/g, "").toUpperCase();
}

function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const statuses: LetterStatus[] = Array(guess.length).fill("absent");
  const remaining = new Map<string, number>();

  for (let index = 0; index < answer.length; index += 1) {
    if (guess[index] === answer[index]) statuses[index] = "correct";
    else remaining.set(answer[index], (remaining.get(answer[index]) || 0) + 1);
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (statuses[index] === "correct") continue;
    const available = remaining.get(guess[index]) || 0;
    if (available > 0) {
      statuses[index] = "present";
      remaining.set(guess[index], available - 1);
    }
  }
  return statuses;
}

export function CountryWordle({ target, countries, language, difficulty, variant = "country", onResolved, onContinue }: { target: Country; countries: Country[]; language: Language; difficulty: Difficulty; variant?: "country" | "capital"; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const isCapital = variant === "capital";
  const targetName = isCapital ? getCapitalDisplayName(target, language) : getCountryDisplayName(target, language);
  const answer = toWord(targetName);
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<EvaluatedGuess[]>([]);
  const [finished, setFinished] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = language === "es"
    ? { title: isCapital ? "Capital Wordle" : "País Wordle", invalidLength: `Completa las ${answer.length} casillas antes de confirmar.`, invalidWord: `En difícil debes escribir ${isCapital ? "una capital" : "un país"} real.`, win: isCapital ? "¡Capital descubierta!" : "¡País descubierto!", lose: "No quedan intentos", answer: isCapital ? "La capital era" : "El país era", continue: "Ver resultado", input: "Escribe con el teclado" }
    : { title: isCapital ? "Capital Wordle" : "Country Wordle", invalidLength: `Complete all ${answer.length} cells before confirming.`, invalidWord: `Hard mode requires a real ${isCapital ? "capital" : "country"}.`, win: isCapital ? "Capital discovered!" : "Country discovered!", lose: "No tries left", answer: isCapital ? "The capital was" : "The country was", continue: "View result", input: "Type with your keyboard" };

  const validWords = useMemo(() => new Set(countries.map((country) => toWord(isCapital ? getCapitalDisplayName(country, language) : getCountryDisplayName(country, language))).filter((word) => word.length === answer.length)), [answer.length, countries, isCapital, language]);
  const keyboardStatuses = useMemo(() => {
    const result: Record<string, LetterStatus> = {};
    for (const guess of guesses) guess.word.split("").forEach((letter, index) => {
      const status = guess.statuses[index];
      if (!result[letter] || STATUS_PRIORITY[status] > STATUS_PRIORITY[result[letter]]) result[letter] = status;
    });
    return result;
  }, [guesses]);

  function changeInput(value: string) {
    if (finished !== null) return;
    setInput(value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, answer.length));
    setError("");
  }

  function pressKey(key: string) {
    inputRef.current?.focus();
    if (key === "BACKSPACE") changeInput(input.slice(0, -1));
    else changeInput(`${input}${key}`);
  }

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (finished !== null) return;
    if (input.length !== answer.length) {
      setError(copy.invalidLength);
      inputRef.current?.focus();
      return;
    }
    if (difficulty === "hard" && !validWords.has(input)) {
      setError(copy.invalidWord);
      inputRef.current?.focus();
      return;
    }
    const evaluated = { word: input, statuses: evaluateGuess(input, answer) };
    const nextGuesses = [...guesses, evaluated];
    setGuesses(nextGuesses);
    setInput("");
    if (input === answer) {
      setFinished(true);
      onResolved(true);
    } else if (nextGuesses.length === 6) {
      setFinished(false);
      onResolved(false);
    } else {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  const rows = Array.from({ length: 6 }, (_, rowIndex) => {
    const guess = guesses[rowIndex];
    const currentInput = rowIndex === guesses.length && finished === null ? input : "";
    return Array.from({ length: answer.length }, (_, letterIndex) => ({
      letter: guess?.word[letterIndex] || currentInput[letterIndex] || "",
      status: guess?.statuses[letterIndex],
    }));
  });
  const boardStyle = { "--word-length": answer.length } as CSSProperties;

  return <section className="wordle-shell">
    <h1>{copy.title}</h1>
    <form onSubmit={submitGuess} className="wordle-form">
      <input ref={inputRef} className="wordle-input-capture" value={input} onChange={(event) => changeInput(event.target.value)} aria-label={copy.input} maxLength={answer.length} autoFocus autoComplete="off" />
      <div className="wordle-board" style={boardStyle}>{rows.map((row, rowIndex) => <div className="wordle-row" key={rowIndex}>{row.map((cell, cellIndex) => <div className={`wordle-cell ${cell.status || ""}`} key={cellIndex}>{cell.letter}</div>)}</div>)}</div>
      {error && <p className="wordle-error">{error}</p>}
      {finished === null && <div className="wordle-keyboard">{KEYBOARD.map((row, rowIndex) => <div className="keyboard-row" key={row}>{rowIndex === 2 && <button type="submit" className="wide-key">ENTER</button>}{row.split("").map((letter) => <button type="button" className={keyboardStatuses[letter] || ""} onClick={() => pressKey(letter)} key={letter}>{letter}</button>)}{rowIndex === 2 && <button type="button" className="wide-key" onClick={() => pressKey("BACKSPACE")}>⌫</button>}</div>)}</div>}
    </form>
    {finished !== null && <div className="wordle-reveal">
      <span className={finished ? "win" : "lose"}>{finished ? copy.win : copy.lose}</span>
      <h2>{copy.answer}: {targetName}</h2>
      <div className="standard-flag-frame">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={target.flag} alt={isCapital ? getCountryDisplayName(target, language) : targetName} /></div>
      <button onClick={onContinue}>{copy.continue}</button>
    </div>}
  </section>;
}
