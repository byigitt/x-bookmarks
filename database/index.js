import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/xbookmarks?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

const globalKey = Symbol.for("database.prismaClient");
const globalCache = globalThis[globalKey] ?? {};

if (!globalCache.client) {
  globalCache.client = new PrismaClient();
}

if (!globalThis[globalKey]) {
  globalThis[globalKey] = globalCache;
}

const prisma = globalCache.client;

export default prisma;
