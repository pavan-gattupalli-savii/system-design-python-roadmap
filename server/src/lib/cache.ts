// ── Tiny in-memory TTL cache with SWR + in-flight dedup ───────────────────────
// Used to memoise expensive DB reads (readings, interviews, experiences,
// roadmap, bootstrap). Three properties matter for our perf story:
//
//   1. TTL — entries auto-expire after `ttlMs`. Keeps memory bounded.
//   2. Stale-while-revalidate — once an entry passes `ttlMs` we still return
//      it for up to `staleMs` more, while a single background fetch refreshes
//      it. Users never wait on a fresh DB call after the first one.
//   3. In-flight dedup — concurrent calls for the same key share one Promise.
//      No more thundering herds when a popular cache entry expires.

interface Entry<T> {
  data:        T;
  /** Time at which we should start treating the entry as "stale" (still serve it, but refresh in the background). */
  freshUntil:  number;
  /** Time after which we'll throw the entry away entirely. */
  staleUntil:  number;
}

interface CachedLoad<T> {
  data:    T;
  /** True if the value was returned synchronously from cache (fresh or stale). */
  hit:     boolean;
  /** True if we kicked off a background revalidation along the way. */
  refreshing: boolean;
}

type Loader<T> = () => Promise<T>;

export class TTLCache<T> {
  private store    = new Map<string, Entry<T>>();
  private inflight = new Map<string, Promise<T>>();

  constructor(
    private readonly ttlMs:      number,
    private readonly maxEntries: number = 200,
    /** How long to keep serving stale data while we refresh. Defaults to 4× TTL. */
    private readonly staleMs:    number = ttlMs * 4,
  ) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.staleUntil < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.data;
  }

  set(key: string, data: T): void {
    if (this.store.size >= this.maxEntries) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    const now = Date.now();
    this.store.set(key, {
      data,
      freshUntil: now + this.ttlMs,
      staleUntil: now + this.ttlMs + this.staleMs,
    });
  }

  invalidate(prefix?: string): void {
    if (!prefix) {
      this.store.clear();
      this.inflight.clear();
      return;
    }
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
    for (const k of this.inflight.keys()) {
      if (k.startsWith(prefix)) this.inflight.delete(k);
    }
  }

  /**
   * Read-through `loader`, returning cached data when possible. The first
   * caller after a cold start pays the DB cost; later ones get a cached value
   * back instantly. After the entry passes `ttlMs` we still return it (until
   * `staleMs` later) and refresh in the background — so the user-perceived
   * latency stays flat even on a cache miss.
   */
  async load(key: string, loader: Loader<T>): Promise<CachedLoad<T>> {
    const now = Date.now();
    const entry = this.store.get(key);

    // Fresh hit — the easy case.
    if (entry && entry.freshUntil > now) {
      return { data: entry.data, hit: true, refreshing: false };
    }

    // Stale-but-still-usable: serve immediately, refresh asynchronously.
    if (entry && entry.staleUntil > now) {
      this.refreshInBackground(key, loader);
      return { data: entry.data, hit: true, refreshing: true };
    }

    // No usable entry: in-flight dedup so concurrent callers share one fetch.
    const inflight = this.inflight.get(key);
    if (inflight) {
      const data = await inflight;
      return { data, hit: false, refreshing: false };
    }

    const fetchPromise = (async () => {
      try {
        const fresh = await loader();
        this.set(key, fresh);
        return fresh;
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, fetchPromise);
    const data = await fetchPromise;
    return { data, hit: false, refreshing: false };
  }

  private refreshInBackground(key: string, loader: Loader<T>): void {
    if (this.inflight.has(key)) return;          // already refreshing
    const p = (async () => {
      try {
        const fresh = await loader();
        this.set(key, fresh);
        return fresh;
      } catch (err) {
        // Background refresh failures are non-fatal — we keep serving the stale
        // value for the rest of its life, then the next request will retry.
        console.warn(`Cache refresh failed for "${key}":`, err);
        const existing = this.store.get(key);
        if (existing) return existing.data;
        throw err;
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, p);
    // Swallow errors so unhandled rejections don't crash the process.
    p.catch(() => {});
  }
}

// ── Singletons keyed by intent ────────────────────────────────────────────────
// Hot list endpoints (readings / interviews / experiences) change rarely, so
// we cache them aggressively. The roadmap is built from many joined tables,
// so keep it warm even longer.
export const queryCache    = new TTLCache<unknown>(15 * 60_000, 500);                   // raw DB rows, 15min fresh / 60min stale
export const responseCache = new TTLCache<unknown>(5  * 60_000, 200);                   // shaped HTTP response, 5min fresh
export const roadmapCache  = new TTLCache<unknown>(15 * 60_000, 4, 24 * 60 * 60_000);  // roadmap: 15min fresh / 24hr stale (never changes without re-seed)
export const dailyPoolCache = new TTLCache<unknown>(60 * 60_000, 2);                    // daily topic pool: 1hr fresh / 4hr stale (same pool all day)
