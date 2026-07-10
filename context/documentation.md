# Documentacion tecnica

La documentacion debe ayudar a que otro desarrollador entienda el flujo funcional sin leer todo el codigo primero.

No hace falta crear documentacion extensa para cada cambio minimo. Si se crea o modifica un modulo importante, agregar o actualizar un archivo en:

```txt
docs/<feature>.md
```

Ejemplos:

```txt
docs/people.md
docs/cards.md
docs/payments.md
docs/auth.md
```

## Estructura sugerida

```md
# Nombre del modulo

## Resumen

Que hace, para que existe y que usuarios lo usan.

## Flujo principal

Pasos desde la interfaz hasta la base de datos.

## Frontend

Pantallas, componentes, formularios y tablas.

## Backend

Routers tRPC, servicios, validaciones y permisos.

## Base de datos

Modelos Prisma, relaciones e indices relevantes.

## Seguridad

Autenticacion, autorizacion y auditoria.

## Errores esperados

Validaciones, permisos y errores de negocio.

## Mejoras futuras

Ideas de evolucion.
```

## Reglas

- Escribir en espanol simple.
- Explicar decisiones tecnicas y de negocio.
- Incluir diagramas Mermaid solo cuando aclaren el flujo.
- Mantener los docs sincronizados con cambios grandes.
- Evitar documentacion ceremonial que nadie vaya a leer.

