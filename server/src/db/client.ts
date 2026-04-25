// ── DB client (Neon serverless) ───────────────────────────────────────────────
// Uses @neondatabase/serverless for HTTP-based connections that work
// in serverless/edge environments AND traditional Node.js long-running servers.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import "dotenv/config";

// Lazily initialised so a missing DATABASE_URL doesn't crash the process at
// import time (which would prevent the port from ever binding).
let _sql: NeonQueryFunction<false, false> | undefined;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

// sql is a tagged template literal query function — safe, parameterised.
// Delegates to the lazily-created neon client on first use.
export const sql = function (
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return getSql()(strings, ...values);
} as NeonQueryFunction<false, false>;

// Helper: run a query and return rows, typed
export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const result = await sql(strings, ...values);
  return result as T[];
}
