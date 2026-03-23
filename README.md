# Termometro IPF Monorepo

Monorepo com:
- `apps/web`: frontend Next.js
- `apps/api`: backend Fastify + Prisma + PostgreSQL
- `packages/shared`: tipos compartilhados

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Instalação

```bash
npm install
```

## Desenvolvimento

Executar frontend e backend separadamente:

```bash
npm run dev:web
npm run dev:api
```

URLs padrão:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Banco de dados (PostgreSQL)

1. Crie um banco vazio (ex.: `termometro_ipf`).
2. Copie `apps/api/.env.example` para `apps/api/.env` e ajuste `DATABASE_URL`.
3. Rode as migrations:

```bash
npm run db:deploy
```

4. Crie o super administrador inicial:

```bash
npm run db:seed
```

### Tabelas criadas na migration inicial

- `admin_users`
  - `id` (UUID, PK)
  - `name`
  - `email` (UNIQUE)
  - `password_hash` (bcrypt)
  - `role` (`SUPER_ADMIN` | `ADMIN`)
  - `is_active`
  - `created_at`, `updated_at`

- `donations`
  - `id` (UUID, PK)
  - `donor_name`
  - `quota_count` (CHECK > 0)
  - `quota_unit_value` (DECIMAL, default 200.00)
  - `amount_paid` (DECIMAL, CHECK >= 0)
  - `payment_date`
  - `created_by_admin_id` (FK -> `admin_users.id`)
  - `created_at`, `updated_at`

Migration SQL: `apps/api/prisma/migrations/0001_init/migration.sql`.

## Endpoints principais

Autenticação:
- `POST /auth/login`
- `GET /auth/me`

Gestão de administradores (somente `SUPER_ADMIN`):
- `POST /admin-users`
- `GET /admin-users`
- `PATCH /admin-users/:id`
- `PATCH /admin-users/:id/password`
- `DELETE /admin-users/:id`

Doações/cotas (admin autenticado):
- `POST /donations`
- `GET /donations`
- `PATCH /donations/:id`
- `DELETE /donations/:id`

Resumo para termômetro (público):
- `GET /stats/summary`
  - retorno: `totalQuotas`, `totalReceived`, `quotaUnitValue`

## Variáveis de ambiente do backend

Arquivo: `apps/api/.env`

- `DATABASE_URL`
- `PORT`
- `HOST`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SUPER_ADMIN_NAME`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Dokploy (resumo)

1. Suba um serviço PostgreSQL no Dokploy.
2. Suba o backend (`apps/api`) com as variáveis acima.
3. No deploy do backend, execute migrations + seed:
   - `npm run db:deploy`
   - `npm run db:seed`
4. Suba o frontend (`apps/web`) apontando `NEXT_PUBLIC_API_BASE_URL` para a URL do backend.
