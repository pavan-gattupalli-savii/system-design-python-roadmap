// ── DB client (Neon serverless) ───────────────────────────────────────────────
// Uses @neondatabase/serverless for HTTP-based connections that work
// in serverless/edge environments AND traditional Node.js long-running servers.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import "dotenv/config";

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

// Tagged template literal that delegates to the lazily-created neon client.
// Cast to NeonQueryFunction so callers can use sql.unsafe() for ORDER BY fragments.
export const sql = function (strings: TemplateStringsArray, ...values: unknown[]) {
  return getSql()(strings, ...values);
} as NeonQueryFunction<false, false>;

/**
 * Tag a pre-validated raw SQL fragment so it can be spliced into a neon
 * tagged-template query without parameter binding.
 * ONLY use with hard-coded/enum-validated strings — never user input.
 */
export function rawFragment(s: string): TemplateStringsArray {
  const arr = [s] as unknown as TemplateStringsArray;
  Object.defineProperty(arr, "raw", { value: [s] });
  return arr;
}

// Helper: run a query and return rows, typed
export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const result = await sql(strings, ...values);
  return result as T[];
}
