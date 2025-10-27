# Backend Service

Fastify API that stores bookmarks in PostgreSQL via Prisma.

## Requirements
- Node.js 20+
- Access to the shared `database` workspace (Prisma client).
- `DATABASE_URL` pointing at the same database used by other services.

## Scripts
- `pnpm --filter backend dev` – start the API with logging.
- `pnpm --filter backend start` – production start (same entry point without auto reload).

## Environment
- `PORT` (default `3000`).
- `DATABASE_URL` (required).
- `EXTENSION_ORIGIN` – comma separated list of allowed CORS origins for the browser extension (optional).

The server automatically registers Prisma and bookmark routes and exposes a liveness endpoint at `/`.
