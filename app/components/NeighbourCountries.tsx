"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import type { Country, Difficulty } from "@/lib/game";
import { getCountryDisplayName, normalize, shuffle } from "@/lib/game";
import type { Language } from "@/lib/i18n";
import { getGeographyName } from "@/lib/geography-names";

export function NeighbourCountries({ target, countries, language, difficulty, onResolved, onContinue }: { target: Country; countries: Country[]; language: Language; difficulty: Difficulty; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const [guess, setGuess] = useState("");
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const targetName = getCountryDisplayName(target, language);
  const neighbourPool = useMemo(() => target.borders.map((code) => countries.find((country) => country.cca3 === code)).filter((country): country is Country => Boolean(country)), [countries, target.borders]);
  const visibleNeighbours = useMemo(() => { const amount = difficulty === "easy" ? neighbourPool.length : difficulty === "normal" ? Math.min(3, neighbourPool.length) : Math.min(2, neighbourPool.length); return shuffle(neighbourPool).slice(0, amount); }, [difficulty, neighbourPool]);
  const suggestions = useMemo(() => { const query = normalize(guess); if (query.length < 2) return []; return countries.filter((country) => country.acceptedNames.some((name) => normalize(name).includes(query))).slice(0, 6); }, [countries, guess]);
  const copy = language === "es"
    ? { title: "¿Qué país limita con todos ellos?", continent: "Continente", placeholder: "Escribe el país…", send: "Responder", missed: "Respuesta incorrecta", lives: "intentos restantes", win: "¡País descubierto!", lose: "Has perdido todas las vidas", answer: "El país era", next: "Ver resultado" }
    : { title: "Which country borders all of them?", continent: "Continent", placeholder: "Type the country…", send: "Answer", missed: "Wrong guess", lives: "tries left", win: "Country discovered!", lose: "You lost all your lives", answer: "The country was", next: "View result" };

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!guess.trim() || finished !== null) return;
    const correct = target.acceptedNames.some((name) => normalize(name) === normalize(guess));
    if (correct) { setFinished(true); onResolved(true); return; }
    const nextLives = lives - 1; setLives(nextLives); setGuess(""); setFeedback(`${copy.missed}. ${nextLives} ${copy.lives}.`);
    if (!nextLives) { setFinished(false); onResolved(false); }
  }

  if (finished !== null) return <section className="neighbour-shell neighbour-finish"><span className={finished ? "win" : "lose"}>{finished ? copy.win : copy.lose}</span><h1>{copy.answer}: {targetName}</h1><Image src={target.flag} alt={targetName} width={280} height={170} unoptimized /><button onClick={onContinue}>{copy.next}</button></section>;

  return <section className="neighbour-shell"><div className="neighbour-heading"><div><h1>{copy.title}</h1>{difficulty === "easy" && <small>{copy.continent}: {getGeographyName(target.region, language)}</small>}</div><div className="neighbour-lives">{Array.from({ length: 3 }, (_, index) => <span className={index >= lives ? "lost" : ""} key={index}>♥</span>)}</div></div><div className="neighbour-grid">{visibleNeighbours.map((country) => <article key={country.cca3}><Image src={country.flag} alt="" width={110} height={70} unoptimized /><strong>{getCountryDisplayName(country, language)}</strong></article>)}</div><form className="neighbour-form" onSubmit={submit}><div className="country-autocomplete"><input value={guess} onChange={(event) => { setGuess(event.target.value); setFeedback(""); }} placeholder={copy.placeholder} autoComplete="off" />{suggestions.length > 0 && <div className="neighbour-suggestions">{suggestions.map((country) => <button type="button" key={country.cca3} onClick={() => setGuess(getCountryDisplayName(country, language))}>{getCountryDisplayName(country, language)}</button>)}</div>}</div><button>{copy.send}</button></form>{feedback && <p className="guess-feedback">{feedback}</p>}</section>;
}
