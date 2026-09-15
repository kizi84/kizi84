/**
 * Creates a working .env on first run.
 *
 * .env is deliberately not committed (it holds the admin password and the
 * session secret), so a fresh clone has no DATABASE_URL and every Prisma call
 * fails with "Environment variable not found: DATABASE_URL". This script runs
 * before dev/build/setup and writes .env from .env.example, substituting a
 * freshly generated AUTH_SECRET so no two installs share a signing key.
 *
 * Existing .env files are never touched.
 */

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (existsSync(envPath)) {
  const current = readFileSync(envPath, "utf8");
  if (/^\s*DATABASE_URL\s*=/m.test(current)) process.exit(0);

  // The file exists but lost its database line — append it rather than overwrite.
  writeFileSync(envPath, `${current.trimEnd()}\nDATABASE_URL="file:./dev.db"\n`, "utf8");
  console.log("✔ .env допълнен с DATABASE_URL");
  process.exit(0);
}

const template = existsSync(examplePath)
  ? readFileSync(examplePath, "utf8")
  : 'DATABASE_URL="file:./dev.db"\nAUTH_SECRET=""\n';

const contents = template.replace(
  /^(\s*AUTH_SECRET\s*=).*$/m,
  `$1"${randomBytes(32).toString("hex")}"`,
);

writeFileSync(envPath, contents, "utf8");
console.log("✔ Създаден .env (с нов случаен AUTH_SECRET)");
