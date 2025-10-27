# Frontend App

Vite + React UI that surfaces saved bookmarks and interacts with the Fastify backend.

## Requirements
- Node.js 20+
- The backend running locally or reachable via `VITE_API_BASE_URL`.

## Scripts
- `pnpm --filter frontend dev` – start Vite dev server (hot reload).
- `pnpm --filter frontend build` – create production bundle.
- `pnpm --filter frontend preview` – preview the production build.

## Environment
- Copy `.env.example` (if present) or set `VITE_API_BASE_URL` to the backend URL; defaults to `http://localhost:3000`.

Start the backend first, then run the dev server and open `http://localhost:5173` in your browser. The UI allows marking bookmarks as read/unread and viewing metadata fetched from FxTwitter.
