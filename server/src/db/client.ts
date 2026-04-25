// ── DB client (Neon serverless) ───────────────────────────────────────────────
// Uses @neondatabase/serverless for HTTP-based connections that work
// in serverless/edge environments AND traditional Node.js long-running servers.

import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// sql is a tagged template literal query function — safe, parameterised
export const sql = neon(connectionString);

// Helper: run a query and return rows, typed
export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const result = await sql(strings, ...values);
  return result as T[];
}
