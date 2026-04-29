import type { Concept } from "./index";

export const caching: Concept = {
  slug:     "caching",
  title:    "Caching",
  emoji:    "🗄️",
  category: "Architecture",
  tagline:  "The fastest request is one you never make",
  roadmapKeywords: ["cache", "caching", "redis", "memcached", "cdn", "eviction", "lru", "write-through"],
  related:  ["latency", "cdn", "database-indexes"],

  sections: [
    {
      heading: "What is a Cache?",
      body: `A cache is a fast, temporary storage layer that holds a copy of expensive-to-compute or expensive-to-fetch data so that future requests for the same data can be served faster.

The fundamental insight: most real-world workloads follow the Pareto principle (80/20 rule). About 20% of your data accounts for 80% of all reads. If you can keep that 20% in fast memory, you eliminate 80% of expensive trips to the database or downstream services.

Caches trade memory for speed. RAM is orders of magnitude faster than disk and network — an L1 cache hit takes ~1 ns; a database query over a network takes ~10 ms. That is 7 orders of magnitude difference.`,
      callout: {
        kind: "note",
        text: "A cache only helps if you read the same data more than once. If every request fetches unique data (like a unique report for each user), caching provides no benefit and adds complexity for nothing.",
      },
    },
    {
      heading: "Cache Hit, Miss, and Eviction",
      body: `Every cache interaction results in one of three outcomes: a hit, a miss, or an eviction.

A cache hit occurs when the requested data is already in the cache. The system returns the cached copy immediately — no trip to the database. This is the happy path and the whole point of caching.

A cache miss occurs when the requested data is not in the cache. The system must go to the original data source (database, external API, etc.), retrieve the data, store it in the cache, and then return it. The first request for any new data is always a miss.

Eviction happens when the cache is full and new data needs to be stored. The cache must remove (evict) an existing entry to make room. Which entry gets evicted depends on the eviction policy.

Cache hit rate = hits / (hits + misses). A well-tuned cache for a read-heavy workload should achieve 90%+ hit rate.`,
      diagram: "cache-hit-miss",
    },
    {
      heading: "Eviction Policies",
      body: `When the cache is full, the eviction policy determines which entry to remove. Choosing the right policy for your access pattern is critical.`,
      table: {
        cols: ["Policy", "Full Name", "How it works", "Best for", "Weakness"],
        rows: [
          ["LRU", "Least Recently Used", "Evicts the entry that hasn't been accessed for the longest time", "General purpose — most workloads", "Doesn't account for access frequency; a one-time scan evicts hot entries"],
          ["LFU", "Least Frequently Used", "Evicts the entry with the fewest total accesses", "Workloads where popular items stay popular", "New items start with count=1 and are immediately eviction candidates (startup problem)"],
          ["FIFO", "First In First Out", "Evicts the oldest-added entry regardless of access pattern", "Simplicity, rotating content (news feeds, logs)", "Ignores recency and frequency entirely — poor hit rate in practice"],
          ["TTL", "Time To Live", "Each entry expires after a fixed duration and is evicted", "Data with natural staleness (sessions, tokens, prices)", "Setting TTL too short = cache misses; too long = stale data"],
          ["Random", "Random Replacement", "Evicts a random entry", "Approximate counting, simple caches", "Unpredictable; rarely used in production"],
          ["ARC", "Adaptive Replacement Cache", "Dynamically balances between LRU and LFU lists", "Mixed/unpredictable access patterns", "More complex to implement; used in ZFS, PostgreSQL"],
        ],
      },
      callout: {
        kind: "tip",
        text: "Redis uses LRU (with configurable approximation). Memcached uses LRU. Most application caches default to LRU. Start with LRU — only switch if profiling shows your access pattern is better served by LFU.",
      },
    },
    {
      heading: "Write Strategies",
      body: `When data is written (INSERT/UPDATE), the cache and the database can get out of sync. Write strategy determines how and when the cache is updated.`,
      table: {
        cols: ["Strategy", "How it works", "Consistency", "Write speed", "Risk"],
        rows: [
          ["Write-through", "Write to cache and DB simultaneously. Both always in sync.", "Strong", "Slow (blocked on DB)", "Every write pays full DB cost — no write throughput benefit"],
          ["Write-back (write-behind)", "Write to cache only. Asynchronously flush to DB later.", "Eventual", "Fast (in-memory)", "Data loss if cache crashes before flush; complex retry logic"],
          ["Write-around", "Write directly to DB, skip cache. Cache is populated on next read miss.", "Strong", "Normal DB speed", "Cold cache on write-heavy bursts; first read after write always misses"],
          ["Read-through", "On miss, cache fetches from DB, stores it, returns it. App only talks to cache.", "Strong (on read)", "Normal", "Cold start has miss penalty; cache and DB must stay in sync on writes"],
          ["Cache-aside (Lazy loading)", "App checks cache. On miss, app fetches from DB, populates cache itself.", "Eventual", "Normal", "Race condition: two threads both miss, both fetch, one overwrites the other"],
        ],
      },
      callout: {
        kind: "warning",
        text: "Cache-aside with write-invalidation is the most common pattern in practice. On write: delete the cache key (don't update it). On next read: miss → fetch from DB → repopulate. This avoids the race condition where a slow write puts stale data into the cache.",
      },
    },
    {
      heading: "Where to Cache — The Caching Hierarchy",
      body: `Caching can be applied at multiple layers. Each layer has different trade-offs in speed, capacity, and scope.`,
      bullets: [
        "Client-side (browser cache): HTTP Cache-Control headers instruct the browser to cache responses. Zero network cost on a cache hit. Limited to per-user data and public assets. Great for static files (JS, CSS, images).",
        "CDN cache (edge cache): Geographically distributed caches that serve static and semi-static content from the PoP closest to the user. Eliminates round trips to your origin server. Controlled via Cache-Control and Surrogate-Control headers.",
        "Reverse proxy cache (Nginx, Varnish): Sits in front of your application servers. Caches full HTTP responses. Excellent for public pages that are expensive to render but identical for all users.",
        "Application cache (Redis, Memcached): In-memory cache your application manages directly. Full control over keys, TTLs, and invalidation. Best for: computed results, session data, rate-limit counters, leaderboards, and any data that doesn't map to a full HTTP response.",
        "Database query cache: Some databases (MySQL historically, PostgreSQL via pg_buffercache) cache query results or buffer pool pages internally. Generally not relied upon — application-level caching gives you more control.",
        "CPU / hardware cache (L1/L2/L3): Managed by hardware, not your code. Relevant for high-performance computing but invisible to most application-level engineers.",
      ],
    },
    {
      heading: "Cache Stampede (Thundering Herd)",
      body: `Cache stampede is a failure mode where a popular cache entry expires, and hundreds or thousands of concurrent requests all experience a miss simultaneously. Every request races to the database to repopulate the cache. The database gets hammered with the same expensive query N times — exactly what the cache was supposed to prevent.

This is most dangerous for high-traffic keys with expensive backend computation (e.g., the front page of a popular website, a trending leaderboard, a report that takes 2 seconds to generate).

Solutions:
1. Mutex/lock on miss: Only one request fetches from the DB; others wait and read from cache once populated. Introduces latency for waiting requests.
2. Probabilistic early expiration (PER/XFetch): Before TTL expires, randomly some requests treat the key as expired and refresh it early. Amortises the refresh over time with no coordination.
3. Background refresh: A background job refreshes cache entries before they expire. The cache never actually goes empty for hot keys. Best for keys with predictable TTLs.
4. Stale-while-revalidate: Serve the stale cached value immediately while triggering an async refresh in the background. User sees slightly old data but never a slow response.`,
      callout: {
        kind: "tip",
        text: "The simplest production fix: add a small random jitter to TTLs (e.g., TTL = 300 + random(0, 60) seconds). This spreads expiration events across time so thousands of keys don't all expire at the exact same moment.",
      },
    },
    {
      heading: "Redis vs Memcached",
      table: {
        cols: ["Feature", "Redis", "Memcached"],
        rows: [
          ["Data structures", "Strings, Hashes, Lists, Sets, Sorted Sets, Streams, HyperLogLog, Bitmaps, Geo", "Strings only"],
          ["Persistence", "RDB snapshots + AOF append-only log (optional)", "None — in-memory only"],
          ["Replication", "Primary-replica, Redis Sentinel, Redis Cluster", "No built-in replication"],
          ["Pub/Sub", "Yes — built-in channel-based messaging", "No"],
          ["Lua scripting", "Yes — atomic server-side scripts", "No"],
          ["Multi-threading", "Single-threaded command execution (I/O is async multi-thread since Redis 6)", "Multi-threaded from the start"],
          ["Max value size", "512 MB per key", "1 MB per key"],
          ["Use cases", "Everything — sessions, queues, leaderboards, rate limiting, pub/sub, geospatial", "Simple string KV cache with extreme read throughput"],
          ["When to choose", "Default choice for almost all new projects", "Legacy systems or when you need raw multi-core KV throughput"],
        ],
      },
    },
  ],
};
