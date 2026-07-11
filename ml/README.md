# Datos sintéticos de MundoQuiz

Este generador crea un punto de partida para clasificar la dificultad de cada país antes de disponer de suficientes partidas reales. No es un modelo entrenado ni representa el comportamiento observado de usuarios.

## Ejecución

Desde la raíz del proyecto:

```bash
npm run ml:generate
```

Para cambiar la semilla o la cantidad de simulaciones:

```bash
python ml/generate_synthetic_data.py --seed 42 --events-per-country-mode 100
```

La misma semilla y los mismos parámetros producen exactamente el mismo resultado.

## Archivos generados

- `ml/data/synthetic_answer_events.csv`: eventos individuales para análisis o entrenamiento.
- `public/data/country-difficulty.json`: puntuaciones consumibles por Next.js.

La puntuación va de `0` a `1`: un valor mayor representa mayor dificultad. `scores` contiene la probabilidad teórica estable usada por la app; `observedSyntheticScores` conserva el promedio de los eventos simulados para análisis. Los niveles `easy`, `normal` y `hard` se calculan por terciles de `scores` para mantener grupos equilibrados.

Las modalidades se evalúan por separado: `flag`, `capital`, `map` y `neighbour`.

## Uso en la aplicación

`lib/difficulty.ts` relaciona cada desafío con una modalidad y filtra el conjunto de países según la dificultad elegida. Banderas, Wordle y País misterioso usan `flag`; los juegos de capitales usan `capital`; el mapa usa `map`; y Países vecinos usa `neighbour`.

La selección conserva un fallback: si faltara una clasificación o un nivel tuviera menos de ocho países válidos, se utiliza el conjunto completo compatible con ese juego. La dificultad elegida también se guarda en el registro local diario para reconstruir correctamente la partida al consultar su resultado.

## Limitaciones

- La relevancia internacional inicial utiliza una lista explícita y pequeña de países conocidos.
- No se analiza todavía la similitud visual real entre banderas.
- Los perfiles y probabilidades son supuestos documentados, no mediciones.
- Cuando existan eventos reales, deben conservarse con `source = real` y tener cada vez más peso que estos datos sintéticos.
