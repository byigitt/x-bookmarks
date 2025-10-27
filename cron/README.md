# Cron Scheduler

This package runs scheduled jobs that remind you about unread bookmarks.

## Setup
- Install workspace dependencies with `pnpm install` if you have not already.
- Copy `.env.example` to `.env` and provide values for
  - `DATABASE_URL`
  - `DISCORD_WEBHOOK_URL`
  - Optional overrides such as `CRON_SCHEDULE`, `REMINDER_THRESHOLD_HOURS`, and `REMINDER_BATCH_SIZE`.
- Ensure Prisma migrations have been applied so `Bookmark.lastReminderSentAt` exists.

## Commands
- `pnpm --filter cron start` – start the scheduler and keep it running.
- `pnpm --filter cron start -- --run-once` – run the reminder job a single time for validation.

The scheduler will log summary output for each run and update `lastReminderSentAt` after sending notifications.
