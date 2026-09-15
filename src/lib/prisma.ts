import { PrismaClient } from "@prisma/client";

/**
 * Resolves the SQLite location.
 *
 * `.env` is not committed, so a fresh clone can reach this point with no
 * DATABASE_URL at all — which Prisma reports as a hard validation error on the
 * very first query. `scripts/ensure-env.mjs` writes the file before dev/build;
 * this fallback covers the remaining cases (a stale shell, a custom start
 * command) by pointing at the same database file the Prisma CLI uses.
 */
function databaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;

  // Forward slashes so the URL stays valid on Windows too. Built by hand rather
  // than with node:path, which cannot be bundled for the browser.
  const root = process.cwd().replace(/\\/g, "/").replace(/\/+$/, "");
  return `file:${root}/prisma/dev.db`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
