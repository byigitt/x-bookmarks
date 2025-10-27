# Database Package

Provides the Prisma client and migration tooling shared across the workspace.

## Requirements
- Node.js 20+
- PostgreSQL 14+ (running locally or accessible via `DATABASE_URL`).

## Environment
- Copy `.env.example` to `.env` and set `DATABASE_URL`.
- Optional reminder variables (`CRON_SCHEDULE`, `REMINDER_THRESHOLD_HOURS`, etc.) are used by the cron scheduler; keep them aligned with other services.

## Scripts
- `pnpm --filter database prisma:generate` – regenerate Prisma client after schema edits.
- `pnpm --filter database prisma:migrate -- --name <label>` – create and apply a new migration.
- `pnpm --filter database prisma:push` – sync schema without generating migrations.
- `pnpm --filter database seed` – load sample data (requires existing database).

The Prisma schema lives in `prisma/schema.prisma`; migrations are tracked under `prisma/migrations`.
