"use client";

import { KeyboardEvent, PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Country, Difficulty } from "@/lib/game";
import { getCountryDisplayName } from "@/lib/game";
import { getGeographyName } from "@/lib/geography-names";
import type { Language } from "@/lib/i18n";

type Geometry = { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
type MapFeature = { properties: { ISO_A3?: string; ADM0_A3?: string; CONTINENT?: string; NAME?: string }; geometry: Geometry };
type GeoJson = { features: MapFeature[] };

const WIDTH = 900;
const HEIGHT = 450;
const project = ([longitude, latitude]: number[]) => [((longitude + 180) / 360) * WIDTH, ((90 - latitude) / 180) * HEIGHT];

function ringPath(ring: number[][]) {
  return ring.map((point, index) => { const [x, y] = project(point); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + " Z";
}

function geometryPath(geometry: Geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates as number[][][]] : geometry.coordinates as number[][][][];
  return polygons.flatMap((polygon) => polygon.map(ringPath)).join(" ");
}

function belongsToRegion(continent: string | undefined, region: string) {
  if (region === "Americas") return continent === "North America" || continent === "South America";
  return continent === region;
}

export function CountryMap({ target, language, difficulty, onResolved, onContinue }: { target: Country; language: Language; difficulty: Difficulty; onResolved: (correct: boolean) => void; onContinue: () => void }) {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [attempts, setAttempts] = useState(difficulty === "easy" ? 3 : difficulty === "normal" ? 2 : 1);
  const [wrongCodes, setWrongCodes] = useState<string[]>([]);
  const [finished, setFinished] = useState<boolean | null>(null);
  const [zoom, setZoom] = useState(1);
  const [feedback, setFeedback] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0, left: 0, top: 0 });
  const suppressClickRef = useRef(false);
  const targetName = getCountryDisplayName(target, language);
  const copy = language === "es"
    ? { loading: "Cargando mapa…", prompt: "Selecciona", attempts: "intentos disponibles", win: "¡Ubicación correcta!", wrong: "Respuesta incorrecta", left: "intentos restantes", next: "Ver resultado", continent: "Continente", zoomIn: "Ampliar mapa", zoomOut: "Reducir mapa", reset: "Restablecer zoom" }
    : { loading: "Loading map…", prompt: "Select", attempts: "attempts left", win: "Correct location!", wrong: "Wrong guess", left: "tries left", next: "View result", continent: "Continent", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset zoom" };

  useEffect(() => { fetch("/data/world-countries.geojson").then((response) => response.json()).then((data: GeoJson) => setFeatures(data.features)).catch(() => setFeatures([])); }, []);

  const paths = useMemo(() => features.map((feature) => ({ feature, code: feature.properties.ISO_A3 === "-99" ? feature.properties.ADM0_A3 || "" : feature.properties.ISO_A3 || "", path: geometryPath(feature.geometry) })), [features]);

  function choose(code: string) {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    if (!code || finished !== null || wrongCodes.includes(code)) return;
    if (code === target.cca3) { setFinished(true); onResolved(true); return; }
    const nextAttempts = attempts - 1;
    setAttempts(nextAttempts); setWrongCodes((current) => [...current, code]);
    if (nextAttempts) setFeedback(`${copy.wrong}. ${nextAttempts} ${copy.left}.`);
    if (!nextAttempts) { setFinished(false); onResolved(false); }
  }

  function keyChoose(event: KeyboardEvent<SVGPathElement>, code: string) { if (event.key === "Enter" || event.key === " ") choose(code); }

  function updateZoom(nextZoom: number, clientX?: number, clientY?: number) {
    const viewport = viewportRef.current;
    const next = Math.min(3, Math.max(1, Math.round(nextZoom * 4) / 4));
    if (!viewport || next === zoom) return;
    const rect = viewport.getBoundingClientRect();
    const x = (clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (clientY ?? rect.top + rect.height / 2) - rect.top;
    const contentX = viewport.scrollLeft + x;
    const contentY = viewport.scrollTop + y;
    const ratio = next / zoom;
    setZoom(next);
    requestAnimationFrame(() => {
      viewport.scrollLeft = contentX * ratio - x;
      viewport.scrollTop = contentY * ratio - y;
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    updateZoom(zoom + (event.deltaY < 0 ? .25 : -.25), event.clientX, event.clientY);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const viewport = event.currentTarget;
    dragRef.current = { active: true, moved: false, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    suppressClickRef.current = false;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("dragging");
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) drag.moved = true;
    event.currentTarget.scrollLeft = drag.left - deltaX;
    event.currentTarget.scrollTop = drag.top - deltaY;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    suppressClickRef.current = dragRef.current.moved;
    dragRef.current.active = false;
    event.currentTarget.classList.remove("dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <section className="map-game-shell">
    <div className="map-game-heading"><div><span>{copy.prompt}</span><h1>{targetName}</h1>{difficulty === "easy" && <small>{copy.continent}: {getGeographyName(target.region, language)}</small>}</div><b>{attempts} {copy.attempts}</b></div>
    {!features.length ? <div className="map-loading">{copy.loading}</div> : <><div className="map-toolbar" aria-label={language === "es" ? "Controles del mapa" : "Map controls"}><button onClick={() => updateZoom(zoom - .5)} disabled={zoom === 1} aria-label={copy.zoomOut}>−</button><button onClick={() => updateZoom(1)} aria-label={copy.reset}>{Math.round(zoom * 100)}%</button><button onClick={() => updateZoom(zoom + .5)} disabled={zoom === 3} aria-label={copy.zoomIn}>+</button></div><div ref={viewportRef} className="world-map-wrap" onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}><svg className="world-map" style={{ width: `${zoom * 100}%` }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-label={language === "es" ? "Mapa mundial interactivo" : "Interactive world map"}>{paths.map(({ feature, code, path }, index) => <path key={`${code}-${index}`} d={path} role="button" tabIndex={finished === null ? 0 : -1} aria-label={feature.properties.NAME || code} className={`${wrongCodes.includes(code) ? "wrong" : ""} ${finished !== null && code === target.cca3 ? "target" : ""} ${difficulty === "easy" && !belongsToRegion(feature.properties.CONTINENT, target.region) ? "muted" : ""}`} onClick={() => choose(code)} onKeyDown={(event) => keyChoose(event, code)} />)}</svg></div></>}
    {feedback && finished === null && <p className="guess-feedback" role="status">{feedback}</p>}
    {finished !== null && <div className={`map-result ${finished ? "win" : "lose"}`}>{finished && <strong>{copy.win}</strong>}<button onClick={onContinue}>{copy.next}</button></div>}
  </section>;
}
