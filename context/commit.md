# Convenciones de commits

Usar Conventional Commits:

```txt
type(scope): description
```

Ejemplos:

```txt
feat(people): add person creation form
fix(cards): prevent duplicate card numbers
docs(context): add product notes
```

## Types

- `feat`: nueva funcionalidad.
- `fix`: correccion de bug.
- `refactor`: mejora interna sin cambio funcional.
- `perf`: mejora de rendimiento.
- `docs`: documentacion.
- `style`: cambios de formato o UI sin logica.
- `test`: pruebas.
- `build`: build, dependencias o tooling.
- `ci`: integracion continua.
- `chore`: mantenimiento.

## Scopes

- `auth`
- `users`
- `roles`
- `people`
- `cards`
- `agreements`
- `payments`
- `commerces`
- `audit`
- `reports`
- `settings`
- `dashboard`
- `api`
- `database`
- `prisma`
- `trpc`
- `ui`
- `docs`
- `deps`

## Reglas

- Descripcion en ingles.
- Minuscula.
- Modo imperativo.
- Sin punto final.
- Maximo 72 caracteres.
- Evitar mensajes genericos como `changes`, `update`, `wip` o `fix stuff`.
- Separar cambios no relacionados en commits distintos.

