# MundoQuiz

Plataforma de juegos de geografía construida con Next.js, React y TypeScript. La aplicación reutiliza un dataset local de 250 países y está preparada para incorporar Supabase cuando se agreguen perfiles, métricas, rankings y dificultad adaptativa.

## Ejecutar localmente

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run typecheck  # validación de TypeScript
npm run lint       # análisis estático
npm run build      # build optimizado de producción
npm run start      # ejecutar el build de producción
```

## Conectar Supabase

El juego funciona sin Supabase, pero puede guardar automáticamente cada resultado completado.

1. Creá un proyecto en [Supabase](https://supabase.com/dashboard).
2. Abrí **SQL Editor**, copiá el contenido de `supabase/migrations/001_create_game_results.sql` y ejecutalo.
3. En **Project Settings → API Keys**, copiá la URL del proyecto y la clave `publishable`. Una clave `anon` de un proyecto anterior también es compatible.
4. Copiá `.env.example` como `.env.local`.
5. Completá las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu-clave
```

6. Reiniciá `npm run dev` después de modificar `.env.local`.

La migración activa Row Level Security: visitantes anónimos pueden insertar resultados, pero no leer toda la tabla. El cliente está centralizado en `lib/supabase/client.ts`; si faltan las credenciales devuelve `null` y el juego continúa sin persistencia.

## Estructura nueva

```text
app/
├── globals.css       # sistema visual global
├── layout.tsx        # layout y metadatos
└── page.tsx          # hub, partida y resultados
lib/
├── game.ts           # tipos, modos y helpers del juego
└── supabase/
    ├── client.ts     # cliente opcional de Supabase
    └── results.ts    # persistencia de partidas terminadas
public/
└── data/
    └── countries.json
supabase/
└── migrations/       # esquema SQL y políticas RLS
```

## Estado de la migración

- Next.js con App Router.
- React y TypeScript estricto.
- Diseño responsive inspirado en un hub de juegos diarios.
- Dataset local, sin dependencia de una API externa.
- Seis modos trasladados como configuración desacoplada.
- Persistencia opcional de resultados en Supabase.
- Build estático de la página principal verificado.

La siguiente etapa será definir los modos definitivos y ampliar las métricas necesarias para dificultad adaptativa.
