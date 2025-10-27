# Docker Assets

Container definitions for running the workspace services together via Docker Compose.

## Available Images
- `backend.Dockerfile` – Fastify API with Prisma client.
- `frontend.Dockerfile` – Production Vite build served by Node.
- `cron.Dockerfile` – Scheduler that delivers unread bookmark reminders.

## Compose Usage
From the repo root:
```bash
docker compose up --build
```

Services started:
- `backend` on `http://localhost:3000`
- `frontend` preview on `http://localhost:4173`
- `postgres` exposed internally at `postgres:5432`
- `cron` running the reminder scheduler (requires `DISCORD_WEBHOOK_URL` and other env vars)

Stop containers with `Ctrl+C`; remove them plus the `postgres-data` volume with `docker compose down -v`.
