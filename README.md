# MundoQuiz

MundoQuiz es una plataforma web de juegos de geografía con desafíos diarios y modalidades competitivas. Permite aprender y poner a prueba conocimientos sobre países, banderas, capitales, regiones, fronteras y ubicaciones en el mapa.

La aplicación combina partidas breves para jugar una vez al día con recorridos completos que registran resultados, tiempos y posiciones en un ranking histórico. Está disponible en español e inglés y adapta los nombres de países, capitales y regiones al idioma elegido.

## Características principales

- Desafíos diarios con resultado, racha y contador de aciertos y errores.
- Modos competitivos con nickname o acceso como invitado.
- Ranking histórico por modalidad, puntuación y tiempo.
- Dificultades fácil, normal y difícil.
- Autocompletado de países y capitales con nombres alternativos y alias.
- Mapa mundial interactivo con zoom y desplazamiento.
- Interfaz responsive para escritorio y dispositivos móviles.
- Persistencia de partidas y métricas competitivas mediante Supabase.
- Dataset local para que el juego no dependa de una API externa durante las partidas.
- Clasificación inicial de dificultad basada en datos sintéticos reproducibles.

## Modos de juego

### Desafíos diarios

Cada desafío usa el mismo objetivo diario para todos los jugadores y solo puede completarse una vez por día.

| Modo | Objetivo |
| --- | --- |
| Bandera del día | Identificar una bandera diaria. |
| País misterioso | Descubrir un país mediante preguntas de sí o no y hasta tres intentos. |
| País Wordle | Adivinar un país letra por letra. |
| Capital del día | Escribir la capital del país mostrado. |
| Capital Wordle | Resolver una capital con las reglas de Wordle. |
| ¿Cuál es la bandera correcta? | Elegir la bandera correcta entre varias opciones. |
| Conexión geográfica | Relacionar pistas geográficas para descubrir un país. |
| ¿Dónde está el país? | Seleccionar el país solicitado en un mapa interactivo. |
| Países vecinos | Reconocer un país a partir de sus fronteras terrestres. |

Los desafíos permiten seleccionar dificultad. Los modos compatibles también ofrecen partidas con límite de tiempo o sin contador.

### Modos competitivos

Estas partidas recorren conjuntos completos de países. Los resultados terminados se guardan en el ranking histórico y cada respuesta genera métricas anónimas para mejorar la dificultad futura.

- Países de todo el mundo.
- Solo países soberanos.
- País + capital.
- América.
- Europa.
- Asia.
- África.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Next.js | Framework, App Router, compilación y despliegue. |
| React | Componentes, estado e interacción de los juegos. |
| TypeScript | Tipado del dominio, componentes y acceso a datos. |
| CSS | Sistema visual, animaciones y diseño responsive. |
| Supabase | PostgreSQL, Row Level Security, resultados, ranking y eventos analíticos. |
| Python | Generación reproducible de datos sintéticos. |
| Vercel | Hosting y despliegue de producción. |

## Instalación local

### Requisitos

- Node.js 20 o una versión posterior.
- npm.
- Python 3, únicamente si quieres volver a generar los datos sintéticos.
- Un proyecto de Supabase para persistencia y ranking. La interfaz puede ejecutarse sin credenciales, pero esas funciones no guardarán información.

### Descargar el proyecto

```bash
git clone https://github.com/BenjaminV3lasco/juego_banderas.git
cd juego_banderas
npm install
```

También puedes descargar el repositorio como archivo ZIP desde GitHub, extraerlo y ejecutar `npm install` dentro de la carpeta.

### Variables de entorno

Copia `.env.example` como `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu_clave
```

La URL y la clave pública se encuentran en la configuración de API del proyecto de Supabase. No utilices una `service_role` en variables `NEXT_PUBLIC_*` ni la publiques en el repositorio.

### Iniciar el entorno de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Abre el **SQL Editor**.
3. Ejecuta estas migraciones en orden:

```text
supabase/migrations/001_create_game_results.sql
supabase/migrations/002_add_historical_ranking.sql
supabase/migrations/003_add_game_timing_and_difficulty.sql
supabase/migrations/004_classify_daily_results.sql
supabase/migrations/005_create_competitive_answer_events.sql
```

4. Configura las variables de `.env.local`.
5. Reinicia el servidor de desarrollo.

Las migraciones crean dos grupos de información:

- `game_results`: partidas terminadas, ranking, dificultad y duración.
- `answer_events`: respuestas anónimas de los modos competitivos para futuros análisis y modelos de dificultad.

Las tablas utilizan Row Level Security. El cliente público puede enviar únicamente los datos permitidos por las políticas y no recibe acceso administrativo a la base.

## Datos y dificultad

Los países se cargan desde `public/data/countries.json`. El archivo incluye nombres localizados, capitales, códigos, regiones, coordenadas y fronteras. El mapa utiliza `public/data/world-countries.geojson`.

Mientras no exista un volumen suficiente de partidas reales, MundoQuiz utiliza una clasificación sintética para separar países fáciles, normales y difíciles. Puedes regenerarla con:

```bash
npm run ml:generate
```

Este comando produce:

- `ml/data/synthetic_answer_events.csv`, con eventos simulados para análisis.
- `public/data/country-difficulty.json`, consumido por la aplicación.

Los datos sintéticos son un punto de partida y no un modelo entrenado. Las respuestas reales se recolectan exclusivamente en los modos competitivos y se guardan en `answer_events`. Consulta [ml/README.md](ml/README.md) para conocer los criterios, parámetros y limitaciones.

## Scripts disponibles

```bash
npm run dev          # inicia el servidor de desarrollo
npm run build        # crea el build optimizado de producción
npm run start        # ejecuta el build de producción
npm run lint         # analiza el código con ESLint
npm run typecheck    # valida los tipos sin generar archivos
npm run ml:generate  # regenera los datos sintéticos
```

Antes de publicar cambios se recomienda ejecutar:

```bash
npm run typecheck
npm run lint
npm run build
```

## Estructura del proyecto

```text
app/
├── components/                 # juegos y componentes reutilizables
├── globals.css                 # estilos, responsive y animaciones
├── layout.tsx                  # layout y metadatos
└── page.tsx                    # navegación y flujo principal
lib/
├── daily.ts                    # selección y progreso diario
├── difficulty.ts               # clasificación por dificultad
├── game.ts                     # tipos, datos y configuración de modos
├── country-names.ts            # nombres y alias de países
├── capital-names.ts            # traducciones y alias de capitales
└── supabase/                   # cliente y persistencia
ml/
├── generate_synthetic_data.py  # generador de eventos sintéticos
└── README.md                    # documentación del sistema de dificultad
public/data/                    # países, dificultad y geometrías del mapa
supabase/migrations/            # esquema SQL, índices y políticas RLS
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en **Environment Variables**.
3. Habilita las variables para Production y Preview.
4. Despliega nuevamente el último commit.

Cada cambio enviado a la rama configurada como producción generará un nuevo despliegue.

## Próximos pasos

- Crear un proceso de exportación y limpieza de eventos reales.
- Combinar gradualmente dificultad sintética y comportamiento observado.
- Entrenar y evaluar un modelo cuando exista una muestra representativa de jugadores y respuestas.
- Incorporar perfiles opcionales y sincronización de rachas entre dispositivos.
- Ampliar estadísticas personales y comparativas por modalidad.
- Añadir pruebas automáticas para reglas, normalización de nombres y componentes interactivos.
- Mejorar accesibilidad, navegación por teclado y rendimiento del mapa.
- Continuar incorporando desafíos diarios sin perder claridad en el menú.

## Privacidad

Los eventos competitivos utilizan identificadores anónimos y registran el país preguntado, modalidad, dificultad, idioma, resultado, tiempo de respuesta e intentos. No se necesita una cuenta para jugar. Antes de utilizar estos datos fuera del proyecto conviene definir una política de privacidad y un período de retención.

## Estado del proyecto

MundoQuiz se encuentra en desarrollo activo. Las mecánicas principales, el ranking, Supabase, los desafíos diarios, la localización y la recolección de métricas competitivas ya están implementados; la dificultad basada en datos reales continúa siendo una etapa futura.
