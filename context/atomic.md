# Arquitectura de componentes

La app usa Next.js, TypeScript, tRPC, Prisma, PostgreSQL y TailwindCSS. La organizacion visual debe favorecer pantallas administrativas mantenibles, con componentes reutilizables y logica de negocio aislada por modulo.

## Estructura recomendada

```txt
src/
  app/
  components/
    ui/
    layout/
    feedback/
    data-display/
    forms/
  features/
    people/
    cards/
    agreements/
    payments/
    commerces/
    audit/
    auth/
  server/
    api/
    services/
  lib/
  styles/
```

## Regla central

Los componentes genericos van en `src/components`.

Los componentes con lenguaje de negocio van en `src/features/<feature>`.

Ejemplos:

```txt
src/components/ui/Button.tsx
src/components/forms/FormField.tsx
src/features/people/components/PersonForm.tsx
src/features/cards/components/CardStatusBadge.tsx
```

## Componentes genericos

Usar para piezas reutilizables:

- Button
- Input
- Select
- Checkbox
- Badge
- Table
- Pagination
- EmptyState
- ConfirmDialog
- FormField
- AppSidebar
- AppHeader

Reglas:

- Sin Prisma.
- Sin tRPC directo.
- Sin textos especificos del negocio.
- Sin nombres como `PersonButton` o `PaymentInput`.

## Features

Cada modulo de negocio debe tener su carpeta:

```txt
src/features/people/
  components/
  schemas/
  types/
  utils/
```

Usar este patron para:

- `people`
- `cards`
- `agreements`
- `payments`
- `commerces`
- `audit`
- `auth`
- `reports`
- `settings`

## Data fetching

Evitar fetching en componentes genericos.

Preferir carga de datos en:

- rutas de `src/app`
- server components
- routers tRPC
- hooks/containers de feature cuando aplique

## Formularios

Los formularios deben usar:

- React Hook Form cuando se agregue la dependencia.
- Zod para validacion.
- Schemas por feature.
- Validacion de servidor siempre, aunque exista validacion visual.

## Reglas de TypeScript

- No usar `any`.
- Tipar props explicitamente.
- Mantener tipos de dominio dentro de cada feature.
- Exportar solo lo necesario.

## Dependencias entre capas

Permitido:

```txt
app -> features -> components -> lib
server/api -> server/services -> prisma
```

Evitar:

```txt
components -> features
components -> server
ui -> prisma
ui -> tRPC
```

