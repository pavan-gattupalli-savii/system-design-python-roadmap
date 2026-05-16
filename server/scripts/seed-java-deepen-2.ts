// ── Java deepen pass 2 ────────────────────────────────────────────────────────
// Round 6 closed the requirements + acceptance gap; hints still lag Python (2
// vs 4). This script adds 2 more hints per Java spec where authored, plus
// architecture diagrams for a few more HLD/Cloud builds.
//
// Idempotent — appends, doesn't replace. Diagram set only when missing.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { buildSpecs, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../src/db/schema.js";
import { eq, and, asc } from "drizzle-orm";

interface Extras { extraHints?: string[]; diagram?: string }

function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

const DEEPEN: Record<string, Extras> = {
  "p1w1.0": { extraHints: [
    "Sealed types only work if every permitted subtype lives in the same module — declare them next to the interface",
    "Compact constructors fire BEFORE field assignment — perfect for validation, useless for transformation",
  ]},
  "p1w2.0": { extraHints: [
    "Collectors.groupingBy + Collectors.summarizingDouble is the idiomatic combo for aggregates",
    "Stream operations are lazy until a terminal op — that's why peek() inside a non-terminated chain does nothing",
  ]},
  "p1w3.0": { extraHints: [
    "Use ArrayBlockingQueue for known-cap workloads; LinkedBlockingQueue is unbounded by default",
    "Poison-pill messages should be a distinct sentinel type, not a magic null",
  ]},
  "p1w4.0": { extraHints: [
    "Virtual threads (Java 21) replace much of CompletableFuture's value for IO-bound work — try both and benchmark",
    "Always specify your own Executor — the common ForkJoinPool gets noisy fast",
  ]},
  "p1w5.0": { extraHints: [
    "G1 is the default; ZGC wins for huge heaps + low pause; Shenandoah wins for steady-state latency",
    "VisualVM is free; Mission Control + JFR is built into the JDK and more powerful",
  ]},
  "p1w6.0": { extraHints: [
    "LinkedHashMap(initialCapacity, loadFactor, accessOrder=true) is the entire LRU trick — don't write your own",
    "PriorityQueue is min-heap by default — pass Comparator.reverseOrder() for top-K",
  ]},

  "p2w7.0": { extraHints: [
    "Don't refactor without tests — write characterization tests on the existing behaviour first",
    "Aim for SOLID as a *direction*, not a rulebook — three classes is fine if it stays readable",
  ]},
  "p2w8.0": { extraHints: [
    "Staged builders eliminate runtime 'missing field' errors at the cost of more interfaces",
    "Lombok @Builder is great but skips required-field enforcement — pick per project",
  ]},
  "p2w9.0": { extraHints: [
    "JDK Dynamic Proxy needs an interface; CGLib / ByteBuddy proxies classes directly",
    "Cache invalidation in a proxy is harder than you think — TTL + explicit eviction beats clever LRU here",
  ]},
  "p2w10.0": { extraHints: [
    "Sealed interfaces let the compiler verify every state is handled in a switch — make use of it",
    "Don't model State as an enum + switch — that's the anti-pattern State pattern fixes",
  ]},
  "p2w11.0": { extraHints: [
    "Use ConcurrentSkipListSet of free spots if you need ordering; otherwise ConcurrentHashMap is fine",
    "Don't extend Vehicle for SUVs / motorcycles — use composition + a SpotPolicy strategy",
  ]},
  "p2w11.1": { extraHints: [
    "Loan policies as injected strategies beat Standard/Premium subclasses every time",
    "Track fines as immutable events rather than mutating a `Member.totalFine` field — easier to audit",
  ]},
  "p2w12.0": { extraHints: [
    "Each State implements `next(ATM, Event)` and returns the next State — no shared mutable state",
    "Test invalid transitions explicitly — IDLE → DISPENSING should be a typed exception, not a silent no-op",
  ]},
  "p2w12.1": { extraHints: [
    "1-page doc means 1 page — if you can't fit it, your design has too many parts",
    "PlantUML diagrams version nicely in git; tools that need binary export create churn",
  ]},

  "p3w13.0": { extraHints: [
    "Use @ConfigurationProperties + @Validated to validate config at boot, not at first use",
    "Liveness vs readiness — Spring Boot's HealthIndicator goes into /actuator/health/{group}",
  ]},
  "p3w14.0": { extraHints: [
    "Spring's ResponseEntityExceptionHandler covers 80% of error cases out of the box — extend it",
    "@Validated on the controller class, @Valid on the @RequestBody — both, not one",
  ]},
  "p3w15.0": { extraHints: [
    "Verify N+1 with Hibernate's `spring.jpa.properties.hibernate.generate_statistics=true` + a log appender",
    "Specifications beat QueryDSL until you actually need QueryDSL — fewer moving parts",
  ]},
  "p3w16.0": { extraHints: [
    "Don't put PII in JWT claims — it's base64, not encrypted",
    "Refresh tokens belong in HttpOnly secure cookies, not localStorage",
  ]},
  "p3w17.0": { extraHints: [
    "@DataJpaTest for repos, @WebMvcTest for controllers, @SpringBootTest for E2E — keep them separate",
    "Testcontainers' reuse mode (testcontainers.reuse.enable=true) cuts test boot time by 5×",
  ]},
  "p3w18.0": { extraHints: [
    "Cache .m2 by hashing pom.xml — caching by branch name is wasteful and stale",
    "Artifact uploads on failure cost zero when the build passes — always-include is safe",
  ]},

  "p4w21.0": { extraHints: [
    "SET NX EX wins over SETNX + EXPIRE because it's atomic — never use the legacy variant",
    "ZADD-based leaderboards scale to 1M entries; beyond that, shard by score range",
  ]},
  "p4w22.0": { extraHints: [
    "CREATE INDEX CONCURRENTLY can't run inside a transaction — Flyway needs a baseline + the no-tx config",
    "Always backfill in batches with a sleep — full-table updates lock for the duration of the statement",
  ]},
  "p4w23.0": { extraHints: [
    "Idempotency keys belong in Postgres unique index; Redis is a cache, not source of truth",
    "Producer + consumer acks=all + idempotent producer is the right config for at-least-once",
  ]},
  "p4w24.0": { extraHints: [
    "GraphQL DataLoader prevents N+1 — use it from day one or pay the migration cost",
    "gRPC for service-to-service, REST for public API, GraphQL for varied UI clients — typical split",
  ]},

  "p5w26.0": { extraHints: [
    "READ COMMITTED is fine for 90% of OLTP; reach for higher levels only with a concrete anomaly story",
    "Postgres' SERIALIZABLE is SSI (snapshot-based) — different perf profile from MySQL's lock-based",
  ]},
  "p5w27.0": { extraHints: [
    "etcd is what Kubernetes uses internally — bet that direction unless you have a reason not to",
    "Redis Sentinel does failover, not consensus — don't confuse it with Raft-based systems",
  ]},
  "p5w29.0": { extraHints: [
    "Nginx upstream `keepalive` directive is critical for connection reuse — default is 0",
    "Health-check endpoint should NOT depend on downstreams — that creates cascading failures",
  ]},
  "p5w30.0": { extraHints: [
    "Memorise: 1 day ≈ 100k seconds, 1 GB ≈ 10⁹ bytes, 1B requests/day ≈ 12k req/sec average",
    "Always show your working — interviewers downgrade for handwave estimates",
  ]},

  "p6w31.0": { extraHints: [
    "base62 of a Snowflake ID is the production-grade approach — counter-based has hot-shard issues",
    "Always cache the redirect path; cold reads should be the exception, not the norm",
  ]},
  "p6w31.1": { extraHints: [
    "Store the big content blob in S3 + reference; metadata in your DB",
    "TTL-based auto-deletion via a background job is simpler than per-paste cron",
  ]},
  "p6w32.0": { extraHints: [
    "Cap timeline cache at 800 entries — nobody scrolls past the first few hundred anyway",
    "Hybrid fanout: write-fanout for users <10k followers, read-fanout for celebs — never one strategy for all",
  ]},
  "p6w33.0": { extraHints: [
    "Don't store every read receipt for big groups — aggregate to counts",
    "Connection pinning via consistent hash of user-id → chat pod avoids gossip cost",
  ]},
  "p6w34.0": { extraHints: [
    "150 virtual nodes per physical node is the empirically-validated default",
    "Pin the hash function — changing later invalidates every placement",
  ]},
  "p6w35.0": { extraHints: [
    "Trie + Redis cache for hot suggestions; full-text engine for everything else",
    "Updating the trie incrementally is doable; rebuilds are easier and usually fast enough",
  ]},
  "p6w36.0": { extraHints: [
    "Encoding on upload = bad (blocks). Encoding via async worker pool = production-grade",
    "HLS adaptive bitrate is the standard for the past decade — don't reinvent",
  ]},
  "p6w37.0": { extraHints: [
    "Geohash-based driver index works for ~1M drivers; H3 (Uber's own) for higher scale",
    "Surge pricing is its own service — don't entangle with trip-matching",
  ]},
  "p6w38.0": { extraHints: [
    "Most common interview miss: skipping requirements / estimation step",
    "Second most common: forgetting bottleneck + wrap-up at the end",
  ]},

  "p7w39.0": { extraHints: [
    "Multi-stage Dockerfile keeps source out of prod image — security baseline",
    "Run as non-root in container — every prod image, every time",
  ]},
  "p7w40.0": { extraHints: [
    "Helm values per env; chart itself is environment-agnostic",
    "HPA on CPU is the default; queue-depth-based HPA is more correct for async workloads",
  ]},
  "p7w41.0": { extraHints: [
    "Image tag = git short SHA; never `latest` in prod",
    "Manual approval gate between staging + prod — never auto-promote",
  ]},
  "p7w42.0": { extraHints: [
    "High-cardinality labels (user-id, request-id) blow up Prometheus cardinality — never tag with them",
    "Correlate logs to traces via trace-id in MDC — Slf4J + Logback support this natively",
  ]},
  "p7w44.0": { extraHints: [
    "Remote state in S3 + DynamoDB lock — never local",
    "terraform-docs auto-generates README from variables — wire it into CI",
  ]},

  "p8w46.0": { extraHints: [
    "Spring Cloud Bus over Kafka triggers @RefreshScope across all replicas instantly",
    "Config encryption: Spring Cloud Config supports {cipher}... values — use it for secrets",
  ]},
  "p8w47.0": { extraHints: [
    "Retry on idempotent calls only — POST without idempotency keys is unsafe to retry",
    "Bulkhead: prefer semaphore for non-blocking I/O, thread-pool for blocking calls",
  ]},
  "p8w49.0": { extraHints: [
    "Never modify event schemas in place — version them and translate forward on read",
    "Snapshot strategy for aggregates with >1k events — replays of 10k events take minutes",
  ]},
  "p8w50.0": { extraHints: [
    "Orchestration sagas (one coordinator) are easier to debug; choreography scales better",
    "Compensations must be true inverses, not just 'undo' — refunds for charges, restock for reservations",
  ]},

  "p9w53.0": { extraHints: [
    "Pick deep-dives where you don't already know the answer — that's where the learning compounds",
    "2PC is rarely the right answer for distributed transactions; sagas almost always win",
  ]},
};

const DIAGRAMS: Record<string, string> = {
  "p6w35.0": `
  ┌────────┐  prefix  ┌──────────┐
  │ Client │─────────▶│   API    │
  └────────┘          └────┬─────┘
       ▲                   │ cache lookup
       │                   ▼
       │            ┌──────────────┐
       │   miss     │     Redis    │
       │ ──────────▶│ (hot top-N)  │
       │            └──────┬───────┘
       │                   │ miss
       │                   ▼
       │            ┌──────────────────┐
       │            │   In-mem Trie    │
       │            └──────┬───────────┘
       │                   ▲
       │                   │ nightly rebuild
       │            ┌──────┴───────────┐
       │            │ Kafka  → Batch    │
       │            │   aggregator     │
       │            └──────────────────┘
       │ suggestions
       └────────────`,

  "p6w37.0": `
  ┌────────┐ open WebSocket ┌──────────┐
  │ Rider  │───────────────▶│  WS GW   │
  └────────┘                └────┬─────┘
       │ request trip            │ enqueue
       ▼                         ▼
  ┌──────────┐              ┌──────────────┐
  │ Matching │              │   Trip Svc   │
  │  Service │◀──geohash────│ (saga state) │
  └────┬─────┘              └──────┬───────┘
       │ candidates                │ steps
       ▼                           ▼
  ┌──────────┐              ┌──────────────┐
  │  Driver  │              │  Payments    │
  │  Index   │              │  + Pricing   │
  │ (geohash)│              └──────┬───────┘
  └──────────┘                     │
                                   ▼
                            ┌──────────────┐
                            │   Driver     │
                            │   Payout     │
                            └──────────────┘`,

  "p7w40.0": `
  ┌─────────────────────────────────────────────┐
  │                  Ingress                    │
  │  TLS termination + host/path routing        │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │                Service (Cluster)            │
  └────────────────────┬────────────────────────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
  ┌────────┐      ┌────────┐       ┌────────┐
  │  Pod   │      │  Pod   │       │  Pod   │
  │ 2 → 10 │      │ via    │       │ HPA on │
  │ HPA    │      │ HPA    │       │ CPU 70%│
  └───┬────┘      └───┬────┘       └───┬────┘
      │ env / mounts  │                │
      ▼               ▼                ▼
  ┌──────────┐  ┌─────────────┐   ┌──────────┐
  │ Secret   │  │ ConfigMap   │   │ Volume   │
  └──────────┘  └─────────────┘   └──────────┘`,

  "p8w46.0": `
  ┌─────────────────────────────────────────────┐
  │              Spring Cloud Gateway           │
  │   - route by host / path                    │
  │   - JWT validation                          │
  │   - rate limit                              │
  └────────────────────┬────────────────────────┘
                       │ lookup
                       ▼
  ┌─────────────────────────────────────────────┐
  │              Eureka Server                  │
  │  service discovery + heartbeat              │
  └─────────────┬───────────────────┬───────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐  ┌────────────────┐
       │ Product Svc    │  │  Order Svc     │
       │ (×N replicas)  │  │  (×N replicas) │
       └────────┬───────┘  └────────┬───────┘
                │ config             │ config
                ▼                    ▼
                ┌──────────────────────┐
                │  Config Server (Git) │
                └──────────────────────┘`,

  "p8w50.0": `
  ┌───────────────────────────────────────────────────────┐
  │                Saga Orchestrator                      │
  │   state: persisted at every step                      │
  └────────┬──────────────────┬─────────────────┬─────────┘
           │                  │                 │
       ChargePayment   ReserveInventory     ConfirmOrder
           │                  │                 │
           ▼                  ▼                 ▼
        ┌──────┐          ┌──────┐         ┌──────┐
        │ Pay  │          │ Inv  │         │Order │
        │ Svc  │          │ Svc  │         │ Svc  │
        └──────┘          └──────┘         └──────┘
           ▲                  ▲                 ▲
           │ compensation: Refund / Restock / CancelOrder
           └──────────────────┴─────────────────┘`,
};

function dedupAppend(existing: string[], extras: string[] | undefined): string[] {
  if (!extras) return existing;
  const seen = new Set(existing);
  const out  = [...existing];
  for (const x of extras) if (!seen.has(x)) { out.push(x); seen.add(x); }
  return out;
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Java deepen pass 2 — ${apply ? "APPLY" : "DRY RUN"}`);

  const phases    = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, "java")).orderBy(asc(roadmapPhases.phaseNumber));
  const weeks     = await db.select().from(roadmapWeeks);
  const sessions  = await db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder));
  const resources = await db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder));

  const weeksByPhase = new Map<number, typeof weeks>();
  weeks.forEach((w) => { const a = weeksByPhase.get(w.phaseId) ?? []; a.push(w); weeksByPhase.set(w.phaseId, a); });
  const sessionsByWeek = new Map<number, typeof sessions>();
  sessions.forEach((s) => { const a = sessionsByWeek.get(s.weekId) ?? []; a.push(s); sessionsByWeek.set(s.weekId, a); });
  const resourcesBySession = new Map<number, typeof resources>();
  resources.forEach((r) => { const a = resourcesBySession.get(r.sessionId) ?? []; a.push(r); resourcesBySession.set(r.sessionId, a); });

  const existing = await db.select().from(buildSpecs).where(eq(buildSpecs.language, "java"));
  const specByKey = new Map(existing.map((s) => [s.resourceKey, s]));

  let touched = 0;
  for (const p of phases) {
    for (const w of (weeksByPhase.get(p.id) ?? [])) {
      const wSessions = sessionsByWeek.get(w.id) ?? [];
      let buildIdx = 0;
      for (let si = 0; si < wSessions.length; si++) {
        const s = wSessions[si];
        const sRes = resourcesBySession.get(s.id) ?? [];
        for (let ri = 0; ri < sRes.length; ri++) {
          const r = sRes[ri];
          if (r.type !== "Build") continue;
          const tag = `p${p.phaseNumber}w${w.weekNumber}.${buildIdx}`;
          buildIdx++;
          const key = resId(p.phaseNumber, w.weekNumber, si, ri);
          const spec = specByKey.get(key);
          if (!spec) continue;

          const extras = DEEPEN[tag];
          const newDiag = DIAGRAMS[tag];
          if (!extras && !newDiag) continue;
          touched++;

          const nextHints = dedupAppend(spec.hints, extras?.extraHints);
          const nextDiag = spec.diagram ?? newDiag ?? null;

          if (!apply) continue;
          await db.update(buildSpecs)
            .set({ hints: nextHints, diagram: nextDiag })
            .where(and(eq(buildSpecs.language, "java"), eq(buildSpecs.resourceKey, key)));
        }
      }
    }
  }

  console.log(`  Touched ${touched} Java specs`);
  if (!apply) console.log(`Run with --apply to commit.`);
  else        console.log(`✅ Pass 2 applied`);
}

main().catch((err) => {
  console.error("❌ Deepen pass 2 failed:", err);
  process.exit(1);
});
