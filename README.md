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
