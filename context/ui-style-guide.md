# UI Style Guide — Sistema de Gestión de Tarjetas de Crédito

Este documento define las reglas visuales y de interfaz para el sistema.  
Toda pantalla, componente, formulario, tabla o flujo visual debe respetar este estilo.

La referencia visual principal del proyecto es:

https://ui.shadcn.com

El sistema debe tener una estética profesional, clara y moderna, adecuada para una plataforma de gestión de tarjetas de crédito.

---

## 1. Regla principal

Codex debe crear y modificar interfaces usando exclusivamente:

- shadcn/ui
- Tailwind CSS
- tokens semánticos del tema
- componentes reutilizables
- diseño responsive
- soporte para modo claro y oscuro

No se debe inventar un sistema visual propio.

Toda nueva pantalla debe sentirse coherente con el estilo de shadcn/ui: minimalista, limpia, ordenada, accesible y profesional.

---

## 2. Contexto del sistema

Este proyecto es un sistema de gestión de tarjetas de crédito.

La interfaz puede incluir pantallas como:

- Dashboard principal
- Gestión de tarjetas
- Alta de nuevas tarjetas
- Visualización de límites
- Movimientos y consumos
- Pagos
- Resúmenes mensuales
- Clientes o usuarios
- Estados de cuenta
- Alertas
- Configuración
- Reportes
- Detalles de una tarjeta
- Formularios administrativos

El diseño debe transmitir confianza, seguridad, claridad y control.

No debe parecer una app informal, colorida en exceso o recargada visualmente.

---

## 3. Estética esperada

El diseño debe seguir una estética similar a shadcn/ui:

- Minimalista
- Moderna
- Limpia
- Profesional
- Con buen espaciado
- Con jerarquía visual clara
- Con bordes suaves
- Con sombras sutiles o nulas
- Con tarjetas bien separadas
- Con tablas claras y legibles
- Con formularios ordenados
- Con estados hover y focus visibles
- Compatible con modo claro y oscuro
- Responsive para escritorio, tablet y mobile

La interfaz debe priorizar la lectura rápida de información financiera y administrativa.

---

## 4. Componentes obligatorios

Siempre que exista un componente equivalente en shadcn/ui, se debe usar antes de crear uno desde cero.

Componentes preferidos:

- Button
- Card
- Input
- Label
- Select
- Dialog
- Sheet
- Dropdown Menu
- Table
- Tabs
- Badge
- Alert
- Form
- Textarea
- Checkbox
- Separator
- Skeleton
- Avatar
- Calendar
- Command
- Popover
- Tooltip
- Pagination
- Accordion
- Alert Dialog
- Sonner / Toast

Ejemplos:

- Para paneles de información, usar `Card`.
- Para acciones principales, usar `Button`.
- Para tablas de movimientos o tarjetas, usar `Table`.
- Para estados como “Activa”, “Bloqueada” o “Vencida”, usar `Badge`.
- Para confirmaciones importantes, usar `AlertDialog`.
- Para filtros, usar `Select`, `Input`, `Popover` o `Command`.
- Para formularios, usar los componentes `Form` de shadcn/ui.

---

## 5. Tokens visuales

Usar siempre tokens semánticos del tema.

Preferir:

```tsx
bg-background
text-foreground
bg-card
text-card-foreground
border-border
bg-muted
text-muted-foreground
bg-primary
text-primary-foreground
bg-secondary
text-secondary-foreground
bg-destructive
text-destructive-foreground
ring-ring