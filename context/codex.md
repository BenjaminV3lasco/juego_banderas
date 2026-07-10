# Reglas para Codex

## Stack

- Next.js
- TypeScript
- tRPC
- Prisma
- PostgreSQL
- TailwindCSS

## Dominio

La app gestiona personas/clientes, tarjetas internas, acuerdos/deudas, pagos/cobros, comercios, usuarios, roles y auditoria.

## Convenciones

- Base de datos: `snake_case`.
- Prisma: modelos en `PascalCase`, campos en `camelCase`.
- React/TypeScript: `camelCase`.
- Componentes: `PascalCase`.
- Tablas fisicas: plural.
- Modelos Prisma: singular.

## Reglas de trabajo

- Mantener cambios chicos y enfocados.
- Reusar patrones existentes.
- No duplicar componentes.
- No agregar comentarios innecesarios.
- Validar entradas con Zod.
- Validar permisos en backend.
- No confiar en controles del frontend para seguridad.
- No subir secretos ni datos reales.
- No tocar archivos no relacionados.
- Preferir TypeScript estricto.

## Commits

Usar Conventional Commits en ingles:

```txt
feat(people): add person list page
fix(auth): validate inactive users
docs(context): update security guide
```

