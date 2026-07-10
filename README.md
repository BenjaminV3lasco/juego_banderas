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

## Supabase

El juego funciona localmente sin configurar Supabase. Para habilitarlo más adelante:

1. Creá un proyecto en Supabase.
2. Copiá `.env.example` como `.env.local`.
3. Completá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

El cliente está centralizado en `lib/supabase/client.ts` y devuelve `null` mientras no existan credenciales.

## Estructura nueva

```text
app/
├── globals.css       # sistema visual global
├── layout.tsx        # layout y metadatos
└── page.tsx          # hub, partida y resultados
lib/
├── game.ts           # tipos, modos y helpers del juego
└── supabase/
    └── client.ts     # cliente opcional de Supabase
public/
└── data/
    └── countries.json
```

Las carpetas `css/` y `js/`, junto con `index.html` y los archivos de Firebase, pertenecen a la versión anterior. Next.js no los utiliza; se conservan temporalmente como referencia hasta confirmar la eliminación definitiva del legado.

## Estado de la migración

- Next.js con App Router.
- React y TypeScript estricto.
- Diseño responsive inspirado en un hub de juegos diarios.
- Dataset local, sin dependencia de una API externa.
- Seis modos trasladados como configuración desacoplada.
- Preparación para Supabase sin obligar a configurar credenciales.
- Build estático de la página principal verificado.

La siguiente etapa será definir los modos definitivos y el modelo de datos de intentos antes de activar Supabase.
