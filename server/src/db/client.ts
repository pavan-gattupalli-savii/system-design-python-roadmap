// ── DB client (Neon + Drizzle ORM) ───────────────────────────────────────────
// Two layers:
//   • `db`  — Drizzle ORM instance for type-safe CRUD (select/insert/update/delete)
//   • `sql` — raw Neon tagged-template for complex queries (CTEs, json_agg, etc.)
//
// Both are lazily initialised so the module import doesn't throw when
// DATABASE_URL is absent at start-up (Railway fix).

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import "dotenv/config";
import { queryCache } from "../lib/cache.js";

type DrizzleDb = NeonHttpDatabase<typeof schema>;

let _neon: NeonQueryFunction<false, false> | undefined;
let _db:   DrizzleDb | undefined;

function getNeon(): NeonQueryFunction<false, false> {
  if (!_neon) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _neon = neon(connectionString);
  }
  return _neon;
}

function getDb(): DrizzleDb {
  if (!_db) _db = drizzle(getNeon(), { schema });
  return _db;
}

// ── Drizzle ORM instance — type-safe queries ────────────────────────────────
// Uses a Proxy for lazy init so the process doesn't crash on import when
// DATABASE_URL is missing (the error surfaces only when the first query runs).
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_t, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

// ── Raw Neon SQL tag — for complex queries (CTEs, json_agg, etc.) ───────────
export const sql = function (strings: TemplateStringsArray, ...values: unknown[]) {
  return getNeon()(strings, ...values);
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

/**
 * Run `loader()` and memoise its result keyed on `cacheKey`.
 * Backed by TTLCache.load (in-flight dedup + stale-while-revalidate).
 */
export async function cached<T>(cacheKey: string, loader: () => Promise<T>): Promise<T> {
  const { data } = await queryCache.load(cacheKey, loader as () => Promise<unknown>);
  return data as T;
}
