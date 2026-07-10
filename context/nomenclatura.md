# Nomenclatura

## Objetivo

Mantener una separacion clara entre la base de datos fisica y el codigo TypeScript.

## Base de datos

Usar `snake_case`:

```sql
people
cards
agreements
payments
audit_logs
created_at
updated_at
person_id
card_id
agreement_id
```

## Prisma

Usar modelos en singular y `PascalCase`:

```prisma
model Person
model Card
model Agreement
model Payment
model AuditLog
```

Usar campos en `camelCase`:

```prisma
createdAt
updatedAt
personId
cardId
agreementId
```

Cuando queramos nombres fisicos en `snake_case`, mapearlos:

```prisma
model Person {
  id        String   @id @default(cuid())
  firstName String   @map("first_name")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("people")
}
```

## Frontend

Usar siempre `camelCase`:

```ts
person.firstName
card.creditLimit
payment.paidAt
```

No usar `snake_case` en React ni TypeScript:

```ts
person.first_name
payment.paid_at
```

## Archivos

Componentes:

```txt
PersonForm.tsx
PersonTable.tsx
CardStatusBadge.tsx
```

Schemas:

```txt
person.schema.ts
card.schema.ts
payment.schema.ts
```

Utils:

```txt
format-currency.ts
date-utils.ts
```

