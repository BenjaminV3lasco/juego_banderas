"""Generate reproducible synthetic geography quiz events and difficulty scores.

This is a cold-start prior, not evidence about real players. Replace its weight with
observed answer_events as the application accumulates real usage.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COUNTRIES_PATH = ROOT / "public" / "data" / "countries.json"
EVENTS_PATH = ROOT / "ml" / "data" / "synthetic_answer_events.csv"
SUMMARY_PATH = ROOT / "public" / "data" / "country-difficulty.json"

MODES = ("flag", "capital", "map", "neighbour")
PROFILES = {
    "beginner": {"weight": 0.48, "ability": -0.75, "speed": 1.28},
    "intermediate": {"weight": 0.37, "ability": 0.05, "speed": 1.0},
    "expert": {"weight": 0.15, "ability": 0.9, "speed": 0.72},
}

# A small, explicit recognition prior. Countries not listed are inferred from
# geography/name features instead of being assigned a random popularity value.
HIGH_RECOGNITION = set("ARG BRA USA CAN MEX ESP FRA GBR DEU ITA PRT JPN CHN IND KOR AUS RUS ZAF EGY".split())
MEDIUM_RECOGNITION = set("CHL COL PER URY PRY BOL VEN NLD BEL CHE AUT GRC IRL NOR SWE DNK FIN POL UKR TUR ISR SAU ARE MAR NGA KEN NZL IDN THA VNM PAK HRV CZE HUN ROU".split())


def clamp(value: float, low: float = 0.03, high: float = 0.97) -> float:
    return max(low, min(high, value))


def logistic(value: float) -> float:
    return 1 / (1 + math.exp(-value))


def normalized_length(value: str) -> int:
    text = unicodedata.normalize("NFKD", value)
    return sum(character.isalpha() for character in text if not unicodedata.combining(character))


def spanish_name(country: dict) -> str:
    return country.get("translations", {}).get("spa", {}).get("common") or country["name"]["common"]


def recognition_prior(code: str) -> float:
    if code in HIGH_RECOGNITION:
        return 0.88
    if code in MEDIUM_RECOGNITION:
        return 0.67
    return 0.40


def country_features(country: dict) -> dict[str, float]:
    code = country["cca3"]
    name = spanish_name(country)
    capital = (country.get("capital") or [""])[0]
    borders = len(country.get("borders") or [])
    island = borders == 0
    region = country.get("region", "Other")
    recognition = recognition_prior(code)
    region_bonus = {"Europe": 0.09, "Americas": 0.06, "Asia": 0.02, "Africa": -0.03, "Oceania": -0.08}.get(region, -0.04)
    return {
        "recognition": clamp(recognition + region_bonus),
        "name_complexity": clamp((normalized_length(name) - 5) / 15, 0, 1),
        "capital_complexity": clamp((normalized_length(capital) - 4) / 16, 0, 1),
        "border_signal": clamp(borders / 8, 0, 1),
        "island": float(island),
    }


def base_probability(mode: str, features: dict[str, float]) -> float:
    recognition = features["recognition"]
    if mode == "flag":
        value = -0.45 + 2.8 * recognition - 0.38 * features["name_complexity"] - 0.20 * features["island"]
    elif mode == "capital":
        value = -1.05 + 2.45 * recognition - 0.72 * features["capital_complexity"] - 0.12 * features["island"]
    elif mode == "map":
        value = -0.72 + 2.15 * recognition + 0.32 * features["border_signal"] - 0.42 * features["island"]
    else:
        value = -0.92 + 2.0 * recognition + 0.85 * features["border_signal"] - 0.62 * features["island"]
    return logistic(value)


def choose_profile(rng: random.Random) -> tuple[str, dict]:
    draw = rng.random()
    cumulative = 0.0
    for name, profile in PROFILES.items():
        cumulative += profile["weight"]
        if draw <= cumulative:
            return name, profile
    return "expert", PROFILES["expert"]


def difficulty_labels(scores: dict[str, dict[str, float]], country_data: list[dict]) -> dict[str, dict[str, str]]:
    labels: dict[str, dict[str, str]] = {code: {} for code in scores}
    for mode in MODES:
        applicable_codes = {
            country["cca3"] for country in country_data
            if mode != "neighbour" or len(country.get("borders") or []) >= 2
        }
        ordered = sorted((values[mode], code) for code, values in scores.items() if code in applicable_codes)
        easy_cut = ordered[len(ordered) // 3][0]
        hard_cut = ordered[(2 * len(ordered)) // 3][0]
        for code, values in scores.items():
            score = values[mode]
            labels[code][mode] = "easy" if score <= easy_cut else "normal" if score <= hard_cut else "hard"
    return labels


def theoretical_difficulty(mode: str, features: dict[str, float]) -> float:
    """Expected error rate across player profiles, without sampling noise."""
    base = base_probability(mode, features)
    base_logit = math.log(base / (1 - base))
    expected_accuracy = sum(profile["weight"] * logistic(base_logit + profile["ability"]) for profile in PROFILES.values())
    return round(1 - expected_accuracy, 4)


def generate(seed: int, events_per_country_mode: int) -> None:
    rng = random.Random(seed)
    countries = json.loads(COUNTRIES_PATH.read_text(encoding="utf-8-sig"))
    EVENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    outcomes: dict[tuple[str, str], list[int]] = defaultdict(list)

    fields = ["event_id", "source", "player_profile", "country_code", "game_mode", "correct", "response_time_ms", "attempts_used", "language"]
    with EVENTS_PATH.open("w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        event_id = 0
        for country in countries:
            features = country_features(country)
            for mode in MODES:
                base = base_probability(mode, features)
                for _ in range(events_per_country_mode):
                    event_id += 1
                    profile_name, profile = choose_profile(rng)
                    probability = clamp(logistic(math.log(base / (1 - base)) + profile["ability"] + rng.gauss(0, 0.22)))
                    correct = int(rng.random() < probability)
                    base_time = {"flag": 5200, "capital": 7600, "map": 9000, "neighbour": 10500}[mode]
                    response_time = max(900, int(rng.lognormvariate(math.log(base_time * profile["speed"]), 0.32)))
                    attempts = 1 if correct and rng.random() < 0.78 else 2 if correct else rng.choice((1, 2, 3))
                    writer.writerow({"event_id": f"synthetic-{seed}-{event_id}", "source": "synthetic", "player_profile": profile_name, "country_code": country["cca3"], "game_mode": mode, "correct": correct, "response_time_ms": response_time, "attempts_used": attempts, "language": "es" if rng.random() < 0.72 else "en"})
                    outcomes[(country["cca3"], mode)].append(correct)

    observed_scores = {
        country["cca3"]: {
            mode: round(1 - sum(outcomes[(country["cca3"], mode)]) / len(outcomes[(country["cca3"], mode)]), 4)
            for mode in MODES
        }
        for country in countries
    }
    scores = {
        country["cca3"]: {mode: theoretical_difficulty(mode, country_features(country)) for mode in MODES}
        for country in countries
    }
    labels = difficulty_labels(scores, countries)
    result = {
        "metadata": {"source": "synthetic", "seed": seed, "eventsPerCountryMode": events_per_country_mode, "totalEvents": len(countries) * len(MODES) * events_per_country_mode, "warning": "Cold-start synthetic prior; do not interpret as observed player performance."},
        "countries": {
            country["cca3"]: {"name": spanish_name(country), "scores": scores[country["cca3"]], "observedSyntheticScores": observed_scores[country["cca3"]], "levels": labels[country["cca3"]]}
            for country in countries
        },
    }
    SUMMARY_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {result['metadata']['totalEvents']} events in {EVENTS_PATH.relative_to(ROOT)}")
    print(f"Wrote difficulty scores for {len(countries)} countries to {SUMMARY_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate reproducible synthetic MundoQuiz answer data.")
    parser.add_argument("--seed", type=int, default=20260711)
    parser.add_argument("--events-per-country-mode", type=int, default=40)
    arguments = parser.parse_args()
    if arguments.events_per_country_mode < 5:
        parser.error("--events-per-country-mode must be at least 5")
    generate(arguments.seed, arguments.events_per_country_mode)
