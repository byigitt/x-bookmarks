# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="${PNPM_HOME}:$PATH"

WORKDIR /app

RUN corepack enable pnpm

COPY pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY database/package.json database/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm install --recursive --ignore-scripts

COPY backend backend
COPY database database
COPY frontend frontend

RUN pnpm install --recursive && pnpm --filter frontend build

FROM base AS runner

ENV NODE_ENV=production \
    VITE_API_BASE_URL="http://localhost:3000"

WORKDIR /app

EXPOSE 4173

CMD ["pnpm", "--filter", "frontend", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
