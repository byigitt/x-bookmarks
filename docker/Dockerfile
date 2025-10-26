# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="${PNPM_HOME}:$PATH"

WORKDIR /app

RUN corepack enable pnpm

COPY pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY database/package.json database/package.json

RUN pnpm install --recursive --ignore-scripts

COPY backend backend
COPY database database

RUN pnpm install --recursive && pnpm --filter database prisma:generate

FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL="postgresql://postgres:postgres@postgres:5432/xbookmarks?schema=public" \
    EXTENSION_ORIGIN="chrome-extension://*"

WORKDIR /app/backend

EXPOSE 3000

CMD ["pnpm", "start"]
