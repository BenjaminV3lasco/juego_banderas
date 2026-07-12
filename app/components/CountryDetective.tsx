"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Country } from "@/lib/game";
import { getCapitalDisplayName, getCountryDisplayName, normalize } from "@/lib/game";
import type { Language } from "@/lib/i18n";
import { getGeographyName } from "@/lib/geography-names";

type Category = "region" | "subregion" | "capitalInitial";
type Clue = { question: string; answer: boolean };
type SelectOption = { value: string; label: string };

const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"];
const REGION_NAMES: Record<Language, Record<string, string>> = {
  es: { Africa: "África", Americas: "América", Asia: "Asia", Europe: "Europa", Oceania: "Oceanía", Antarctic: "Antártida" },
  en: { Africa: "Africa", Americas: "Americas", Asia: "Asia", Europe: "Europe", Oceania: "Oceania", Antarctic: "Antarctica" },
};

export function CountryDetective({ target, countries, language, onResolved, onContinue }: { target: Country; countries: Country[]; language: Language; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const [questionsLeft, setQuestionsLeft] = useState(10);
  const [lives, setLives] = useState(3);
  const [category, setCategory] = useState<Category>("region");
  const [value, setValue] = useState("");
  const [clues, setClues] = useState<Clue[]>([]);
  const [guess, setGuess] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState("");
  const [finished, setFinished] = useState<boolean | null>(null);

  const subregions = useMemo(() => [...new Set(countries.map((country) => country.subregion).filter((item) => item && item !== "Other"))].sort(), [countries]);
  const matchingCountries = useMemo(() => {
    const query = normalize(guess);
    if (query.length < 2) return [];
    return countries
      .filter((country) => country.acceptedNames.some((name) => normalize(name).includes(query)))
      .sort((a, b) => {
        const aName = getCountryDisplayName(a, language);
        const bName = getCountryDisplayName(b, language);
        const aStarts = normalize(aName).startsWith(query) ? 0 : 1;
        const bStarts = normalize(bName).startsWith(query) ? 0 : 1;
        return aStarts - bStarts || aName.localeCompare(bName, language);
      })
      .slice(0, 7);
  }, [countries, guess, language]);
  const options = category === "region" ? REGIONS : category === "subregion" ? subregions : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const copy = language === "es" ? {
    title: "País misterioso", askHint: "Elige una categoría y haz una pregunta:", continent: "Continente", subregion: "Subregión", capitalInitial: "Inicial de la capital", select: "Elige una opción", ask: "Hacer pregunta", questions: "preguntas disponibles", guess: "Escribe el país...", tryGuess: "Adivinar", win: "¡Descubriste el país!", lose: "Has perdido todas las vidas", missed: "Respuesta incorrecta", livesLeft: "intentos restantes", answer: "El país era", continue: "Ver resultado",
  } : {
    title: "Mystery country", askHint: "Choose a category and ask a question:", continent: "Continent", subregion: "Subregion", capitalInitial: "Capital's first letter", select: "Choose an option", ask: "Ask question", questions: "questions left", guess: "Type the country...", tryGuess: "Guess", win: "You found the country!", lose: "You lost all your lives", missed: "Wrong guess", livesLeft: "lives left", answer: "The country was", continue: "View result",
  };

  function questionText(selectedCategory: Category, selectedValue: string) {
    if (selectedCategory === "region") return language === "es" ? `¿Está en ${REGION_NAMES.es[selectedValue]}?` : `Is it in ${REGION_NAMES.en[selectedValue]}?`;
    if (selectedCategory === "subregion") return language === "es" ? `¿Pertenece a ${getGeographyName(selectedValue, language)}?` : `Is it in ${selectedValue}?`;
    return language === "es" ? `¿Su capital empieza con ${selectedValue}?` : `Does its capital start with ${selectedValue}?`;
  }

  function askQuestion() {
    if (!value || !questionsLeft || finished !== null) return;
    const answer = category === "region"
      ? target.region === value
      : category === "subregion"
        ? target.subregion === value
        : normalize(getCapitalDisplayName(target, language)).startsWith(normalize(value));
    setClues((current) => [...current, { question: questionText(category, value), answer }]);
    setQuestionsLeft((current) => current - 1);
    setValue("");
  }

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (!guess.trim() || finished !== null) return;
    const correct = target.acceptedNames.some((name) => normalize(name) === normalize(guess));
    if (correct) {
      setSuggestionsVisible(false);
      setFinished(true);
      onResolved(true);
      return;
    }
    const nextLives = lives - 1;
    setLives(nextLives);
    setGuessFeedback(`${copy.missed}. ${nextLives} ${copy.livesLeft}.`);
    setGuess("");
    setSuggestionsVisible(false);
    if (!nextLives) {
      setFinished(false);
      onResolved(false);
    }
  }

  const targetName = getCountryDisplayName(target, language);
  const categoryOptions: SelectOption[] = [{ value: "region", label: copy.continent }, { value: "subregion", label: copy.subregion }, { value: "capitalInitial", label: copy.capitalInitial }];
  const questionOptions = options.map((option) => ({ value: option, label: category === "region" ? REGION_NAMES[language][option] : category === "subregion" ? getGeographyName(option, language) : option }));

  return <section className="detective-shell">
    <div className="detective-heading"><div className="mystery-icon">?</div><h1>{copy.title}</h1><div className="lives" aria-label={language === "es" ? `${lives} vidas` : `${lives} lives`}>{Array.from({ length: 3 }, (_, index) => <span className={index >= lives ? "lost" : ""} key={index}>♥</span>)}</div></div>
    {finished === null ? <>
      <div className="question-builder">
        <p>{copy.askHint}</p>
        <div className="question-controls">
          <DetectiveSelect value={category} options={categoryOptions} placeholder={copy.select} onChange={(nextValue) => { setCategory(nextValue as Category); setValue(""); }} />
          <DetectiveSelect value={value} options={questionOptions} placeholder={copy.select} onChange={setValue} />
          <button onClick={askQuestion} disabled={!value || !questionsLeft}>{copy.ask}</button>
        </div>
      </div>
      <p className="questions-left"><b>{questionsLeft}</b> {copy.questions}</p>
      <div className="clue-board">{clues.length ? clues.map((clue, clueIndex) => <div className="clue-row" key={`${clue.question}-${clueIndex}`}><span>{clue.question}</span><strong className={clue.answer ? "yes" : "no"}>{clue.answer ? (language === "es" ? "Sí" : "Yes") : "No"}</strong></div>) : <span className="empty-clues">?</span>}</div>
      <form className="guess-form" onSubmit={submitGuess}>
        <div className="country-autocomplete">
          <input value={guess} onChange={(event) => { setGuess(event.target.value); setSuggestionsVisible(true); }} onFocus={() => setSuggestionsVisible(true)} placeholder={copy.guess} autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls="country-suggestions" aria-expanded={suggestionsVisible && Boolean(matchingCountries.length)} />
          {suggestionsVisible && matchingCountries.length > 0 && <div className="country-suggestions" id="country-suggestions" role="listbox">{matchingCountries.map((country) => {
            const name = getCountryDisplayName(country, language);
            return <button type="button" role="option" aria-selected="false" key={country.englishName} onClick={() => { setGuess(name); setSuggestionsVisible(false); }}>{name}</button>;
          })}</div>}
        </div>
        <button>{copy.tryGuess}</button>
      </form>
      {guessFeedback && <p className="guess-feedback" role="status">{guessFeedback}</p>}
    </> : <div className="detective-reveal">
      <span className={finished ? "win" : "lose"}>{finished ? copy.win : copy.lose}</span>
      <h2>{copy.answer}: {targetName}</h2>
      <div className="standard-flag-frame">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={target.flag} alt={targetName} /></div>
      <button onClick={onContinue}>{copy.continue}</button>
    </div>}
  </section>;
}

function DetectiveSelect({ value, options, placeholder, onChange }: { value: string; options: SelectOption[]; placeholder: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return <div className={`detective-select ${open ? "open" : ""}`}>
    <button type="button" className="detective-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}><span>{selected?.label || placeholder}</span><i>⌄</i></button>
    {open && <div className="detective-select-menu" role="listbox">{options.map((option) => <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? "selected" : ""} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}><span>{option.label}</span>{option.value === value && <b>✓</b>}</button>)}</div>}
  </div>;
}
