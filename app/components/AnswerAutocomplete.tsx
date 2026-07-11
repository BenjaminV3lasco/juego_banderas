"use client";

import { useId, useMemo, useState } from "react";
import { normalize } from "@/lib/game";

export type AutocompleteOption = { label: string; searchTerms?: string[] };

export function AnswerAutocomplete({ id, value, onChange, options, placeholder, autoFocus = false, maxLength }: { id?: string; value: string; onChange: (value: string) => void; options: AutocompleteOption[]; placeholder: string; autoFocus?: boolean; maxLength?: number }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const suggestions = useMemo(() => {
    const query = normalize(value);
    if (query.length < 2) return [];
    const seen = new Set<string>();
    return options.filter((option) => {
      if (seen.has(option.label)) return false;
      const matches = [option.label, ...(option.searchTerms || [])].some((term) => normalize(term).includes(query));
      if (matches) seen.add(option.label);
      return matches;
    }).slice(0, 6);
  }, [options, value]);

  return <div className="answer-autocomplete">
    <input id={id} value={value} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} placeholder={placeholder} autoFocus={autoFocus} autoComplete="off" maxLength={maxLength} role="combobox" aria-autocomplete="list" aria-controls={listId} aria-expanded={open && suggestions.length > 0} />
    {open && suggestions.length > 0 && <div id={listId} className="answer-suggestions" role="listbox">{suggestions.map((option) => <button type="button" role="option" aria-selected="false" key={option.label} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.label); setOpen(false); }}>{option.label}</button>)}</div>}
  </div>;
}
