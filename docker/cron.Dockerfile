# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="${PNPM_HOME}:$PATH"

WORKDIR /app

RUN corepack enable pnpm

COPY pnpm-workspace.yaml ./
COPY database/package.json database/package.json
COPY integrations/package.json integrations/package.json
COPY cron/package.json cron/package.json

RUN pnpm install --recursive --ignore-scripts

COPY database database
COPY integrations integrations
COPY cron cron

RUN pnpm install --recursive && pnpm --filter database prisma:generate

FROM base AS runner

ENV NODE_ENV=production \
    DATABASE_URL="postgresql://postgres:postgres@postgres:5432/xbookmarks?schema=public" \
    DISCORD_WEBHOOK_URL="" \
    CRON_SCHEDULE="0 * * * *" \
    REMINDER_THRESHOLD_HOURS="24" \
    REMINDER_BATCH_SIZE="10" \
    RUN_JOB_ON_STARTUP="true"

WORKDIR /app/cron

CMD ["pnpm", "start"]
