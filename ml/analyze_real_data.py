"""Create an exploratory report from competitive answer events."""

from __future__ import annotations

import argparse
import csv
import json
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "ml" / "data" / "real_answer_events.csv"
SYNTHETIC_PATH = ROOT / "public" / "data" / "country-difficulty.json"
REPORT_JSON = ROOT / "ml" / "data" / "real_data_report.json"
REPORT_CSV = ROOT / "ml" / "data" / "real_country_metrics.csv"
REQUIRED_COLUMNS = {"anonymous_player_id", "session_id", "country_code", "game_mode", "correct", "response_time_ms", "source"}


def percentile_rank(values: list[float], value: float) -> float:
    if len(values) <= 1:
        return 0.5
    below = sum(item < value for item in values)
    equal = sum(item == value for item in values)
    return (below + 0.5 * equal) / len(values)


def confidence(samples: int, players: int) -> str:
    if samples >= 100 and players >= 10:
        return "high"
    if samples >= 30 and players >= 5:
        return "medium"
    if samples >= 10 and players >= 3:
        return "low"
    return "insufficient"


def signal_for_mode(mode: str) -> str:
    return "capital" if mode == "capitals" else "flag"


def load_events(path: Path) -> tuple[list[dict], list[str]]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing CSV columns: {', '.join(sorted(missing))}")
        raw_events = list(reader)

    valid, warnings = [], []
    seen_ids: set[str] = set()
    for number, row in enumerate(raw_events, start=2):
        if row["source"] != "real":
            warnings.append(f"Row {number}: non-real event ignored")
            continue
        if row.get("id") and row["id"] in seen_ids:
            warnings.append(f"Row {number}: duplicate id ignored")
            continue
        if row.get("id"):
            seen_ids.add(row["id"])
        try:
            response_time = int(row["response_time_ms"])
        except ValueError:
            warnings.append(f"Row {number}: invalid response time")
            continue
        correct = row["correct"].strip().lower()
        if correct not in {"true", "false"} or not 0 <= response_time <= 3_600_000:
            warnings.append(f"Row {number}: invalid answer data")
            continue
        valid.append({**row, "country_code": row["country_code"].strip().upper(), "correct": correct == "true", "response_time_ms": response_time})
    return valid, warnings


def analyze(path: Path, prior_strength: int) -> dict:
    events, warnings = load_events(path)
    with SYNTHETIC_PATH.open(encoding="utf-8") as file:
        synthetic = json.load(file)["countries"]

    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for event in events:
        grouped[(event["country_code"], signal_for_mode(event["game_mode"]))].append(event)
    median_times = sorted(statistics.median(row["response_time_ms"] for row in rows) for rows in grouped.values())

    metrics = []
    for (code, signal), rows in sorted(grouped.items()):
        samples = len(rows)
        players = len({row["anonymous_player_id"] for row in rows})
        correct = sum(row["correct"] for row in rows)
        error_rate = 1 - correct / samples
        median_time = statistics.median(row["response_time_ms"] for row in rows)
        prior = synthetic.get(code, {}).get("scores", {}).get(signal, 0.5)
        smoothed_error = (samples * error_rate + prior_strength * prior) / (samples + prior_strength)
        hybrid = 0.8 * smoothed_error + 0.2 * percentile_rank(median_times, median_time)
        metrics.append({
            "country_code": code,
            "country_name": synthetic.get(code, {}).get("name", code),
            "signal": signal,
            "samples": samples,
            "players": players,
            "sessions": len({row["session_id"] for row in rows}),
            "accuracy": round(correct / samples, 4),
            "error_rate": round(error_rate, 4),
            "median_response_time_ms": round(median_time),
            "synthetic_score": round(prior, 4),
            "smoothed_real_error": round(smoothed_error, 4),
            "hybrid_preview_score": round(hybrid, 4),
            "confidence": confidence(samples, players),
        })

    modes = defaultdict(int)
    for event in events:
        modes[event["game_mode"]] += 1
    metadata = {
        "input": str(path.relative_to(ROOT)),
        "events": len(events),
        "players": len({event["anonymous_player_id"] for event in events}),
        "sessions": len({event["session_id"] for event in events}),
        "countries_with_observations": len({item["country_code"] for item in metrics}),
        "country_signals_with_enough_data": sum(item["confidence"] != "insufficient" for item in metrics),
        "prior_strength": prior_strength,
        "status": "exploratory",
        "warning": "Do not replace production difficulty until sample size and player diversity grow.",
    }
    return {"metadata": metadata, "events_by_mode": dict(sorted(modes.items())), "validation_warnings": warnings, "country_metrics": metrics}


def write_report(report: dict) -> None:
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    rows = report["country_metrics"]
    with REPORT_CSV.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]) if rows else ["country_code"])
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze real MundoQuiz competitive events")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--prior-strength", type=int, default=20)
    args = parser.parse_args()
    if args.prior_strength < 1 or not args.input.exists():
        raise SystemExit("Use an existing CSV and a prior strength greater than zero")
    report = analyze(args.input, args.prior_strength)
    write_report(report)
    meta = report["metadata"]
    print(f"Analyzed {meta['events']} events from {meta['players']} players and {meta['sessions']} sessions.")
    print(f"Observed countries: {meta['countries_with_observations']}")
    print(f"Country signals with enough data: {meta['country_signals_with_enough_data']}")
    print(f"Reports: {REPORT_JSON.relative_to(ROOT)} and {REPORT_CSV.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
