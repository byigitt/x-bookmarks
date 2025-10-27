# X Bookmarks Workspace

This monorepo uses pnpm workspaces to manage the browser extension, Fastify backend, and Prisma database packages backed by PostgreSQL.

## Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (running locally or accessible via connection string)

## Installation
1. Set `DATABASE_URL` in `database/.env` to point at your PostgreSQL instance (defaults to `postgresql://postgres:postgres@localhost:5432/xbookmarks?schema=public`).
2. Install dependencies and generate the Prisma client:
   ```bash
   pnpm install
   pnpm --filter database prisma:generate
   ```
3. Apply the schema to your database (choose one):
   ```bash
   # Recommended for development with migrations
   pnpm --filter database prisma:migrate -- --name init

   # Alternatively push schema without creating migrations
   pnpm --filter database prisma db push
   ```

## Running the Backend
```bash
pnpm --filter backend dev
```
The server listens on `http://localhost:3000` by default. Adjust `PORT`, `DATABASE_URL`, or `EXTENSION_ORIGIN` via environment variables if required.

## Running the Frontend
```bash
pnpm --filter frontend dev
```
The Vite dev server listens on `http://localhost:5173`. Set `VITE_API_BASE_URL` in `frontend/.env` (or via your shell) so the frontend can reach the backend, for example `http://localhost:3000`.

## Reminder Scheduler
The `cron` workspace sends reminders for bookmarks that remain unread beyond a configurable threshold.

### Configuration
- Copy `cron/.env.example` to `cron/.env` (or export the variables) and set:
  - `DATABASE_URL` so the scheduler can reach the same PostgreSQL instance as the backend.
  - `DISCORD_WEBHOOK_URL` pointing to the Discord channel that should receive reminders.
  - Optional knobs such as `CRON_SCHEDULE`, `REMINDER_THRESHOLD_HOURS`, `REMINDER_BATCH_SIZE`, and `RUN_JOB_ON_STARTUP`.
- Run database migrations so the `Bookmark` table includes `lastReminderSentAt`.

### Running the Scheduler
```bash
pnpm --filter cron start
```
The scheduler schedules the job with `node-cron`, executes it immediately on startup (unless `RUN_JOB_ON_STARTUP=false`), and keeps the process alive. Use `pnpm --filter cron start -- --run-once` to execute a single reminder run for testing.

## Integrations
Integration clients live under the `integrations` workspace and are shared by other packages.

- `integrations/src/index.js` exposes a `sendReminder` dispatcher that selects the appropriate client.
- `integrations/src/discord/webhookClient.js` handles Discord webhooks using the same payload shape as the scheduler.
- Future services (email, Slack, etc.) can add additional subfolders and register new channels without touching consumers.

## Seeding the Database
```bash
pnpm --filter database seed
```
Ensure the database exists and `DATABASE_URL` points to it before seeding.

## Loading the Extension
1. Build or run the backend so API calls succeed.
2. In Chrome, open `chrome://extensions` and enable Developer Mode.
3. Choose **Load unpacked** and select the `extension` directory.
4. Bookmark or unbookmark tweets to see logs in the page console and data persisted via the backend.

## Docker Compose

This repository includes a Docker Compose workflow that runs PostgreSQL, the Fastify backend, and the Vite preview server for the frontend.

### Prerequisites
- Docker 24+
- Docker Compose v2

### Usage
```bash
docker compose up --build
```

Services:
- Backend: <http://localhost:3000>
- Frontend: <http://localhost:4173>
- Cron: reminder scheduler (logs to console, requires Discord webhook env)
- PostgreSQL: available internally as `postgres:5432`

Compose uses a named volume `postgres-data` for persistence. Shut down containers with `Ctrl+C`, then remove everything with:
```bash
docker compose down -v
```

If you encounter native binding issues (`@rolldown/binding-*`) when building locally, retry `pnpm install` (or clear `node_modules`); the container builds are isolated from this problem.
