// ── Deepen existing Java build_specs ─────────────────────────────────────────
// Java specs landed thinner than Python (4 reqs / 3 accept / 2 hints vs 6/4/4).
// This script *appends* to the existing arrays rather than overwriting, so
// you can re-run safely; duplicates are deduped before write. Diagrams are
// set only when the row currently has none.
//
// Keyed by the same `pPwW.B` tag as seed-java-build-specs.ts.
//
// Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { buildSpecs, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../src/db/schema.js";
import { eq, and, asc } from "drizzle-orm";

interface Extras {
  extraReqs?:    string[];
  extraAccept?:  string[];
  extraHints?:   string[];
  diagram?:      string;
}

function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

// Each entry adds depth to an existing Java spec. Overview untouched.
const DEEPEN: Record<string, Extras> = {

  // ── Phase 1 ────────────────────────────────────────────────────────────────
  "p1w1.0": {
    extraReqs: [
      "Add a `Money` validation test suite covering negative, zero, null currency, and large BigDecimal values",
      "Expose a `combine(Result<T> other, BinaryOperator<T>)` to thread Results without nested if/else",
    ],
    extraAccept: ["Adding a new permitted Result subtype causes a compile error in every switch — proves exhaustiveness"],
    extraHints: ["Combine compact constructor checks with @NotNull annotations only when you also enable an actual nullness checker"],
  },

  "p1w2.0": {
    extraReqs: [
      "Use Collectors.teeing or Collectors.collectingAndThen for one combined aggregate",
      "Read the CSV via BufferedReader.lines() (not Files.readAllLines) so memory stays bounded",
    ],
    extraAccept: ["Peak heap stays within 64MB even on a 100MB CSV"],
    extraHints: [
      "Avoid Collectors.toUnmodifiableList until you've collected — terminal ops on unmodifiable collectors throw on attempts to mutate",
      "When a single .collect handles two aggregates, teeing beats two passes",
    ],
  },

  "p1w3.0": {
    extraReqs: [
      "Producer + consumer rates configurable via CLI args; demonstrate backpressure when producers outpace consumers",
      "Expose a Micrometer or simple counter so you can see per-thread throughput",
    ],
    extraAccept: ["Killing the process with SIGTERM drains the queue and joins all threads in under 5 seconds"],
    extraHints: ["Always shutdown the executor in a finally — interrupts only propagate cleanly that way"],
  },

  "p1w4.0": {
    extraReqs: [
      "Build a virtual-thread variant of the same flow and assert identical correctness",
      "Capture per-call latency with Micrometer Timer; print p50 / p95 / p99",
    ],
    extraAccept: ["With one slow downstream (500ms vs 50ms), wall-clock stays at ~500ms — not 600+"],
    extraHints: ["Pair orTimeout with .exceptionally so a timeout doesn't poison the combined result"],
  },

  "p1w5.0": {
    extraReqs: [
      "Generate a controlled allocation pattern (e.g. churn 1M small objects/sec)",
      "Capture GC logs (-Xlog:gc*) and parse them to compute pause percentiles",
    ],
    extraAccept: [
      "Switching from G1 to ZGC produces measurably different p99 pauses (record both)",
      "Heap dump opens in VisualVM / IntelliJ profiler without errors",
    ],
    extraHints: [
      "Bench on -Xmx of the size you'd run in prod — tuning at 256MB tells you nothing about a 16GB heap",
      "-XX:+PrintFlagsFinal dumps every JVM flag including their effective values",
    ],
  },

  "p1w6.0": {
    extraReqs: [
      "Each function lives in its own file with a `main` quick-demo",
      "Provide an MIT-licensed README with Big-O annotations per function",
    ],
    extraAccept: ["JMH benchmarks confirm advertised Big-O (LRU stays flat as size grows; naive top-K does not)"],
    extraHints: ["For LinkedHashMap-based LRU, override removeEldestEntry — it's the only line you should write"],
  },

  // ── Phase 2: LLD ───────────────────────────────────────────────────────────
  "p2w7.0": {
    extraReqs: [
      "Before refactoring, write characterization tests that capture current behaviour — these must still pass after",
      "Show the cyclomatic-complexity drop (use a tool like SonarLint) — before/after numbers in the PR",
    ],
    extraAccept: ["Adding a new pricing strategy requires only one new file and no other diff"],
    extraHints: ["Constructor injection lets the compiler check what each class needs — kill any `@Autowired` field access along the way"],
  },

  "p2w8.0": {
    extraReqs: [
      "Add a third concrete Notifier (PushNotifier) without touching NotificationFactory's signature",
      "Builder uses staged-builder pattern so subject() is enforced at compile time, not runtime",
    ],
    extraAccept: [
      "Forgetting to call .subject() on the Builder fails compilation, not at runtime",
      "Adding the 4th channel needs zero core changes — factory tests stay green",
    ],
    extraHints: ["Lombok @Builder is a great default but loses the compile-time required-field guarantee — staged builder is more code but bug-proof"],
  },

  "p2w9.0": {
    extraReqs: [
      "Add a metric showing cache hit ratio over a 1-minute window — must beat 80% for the demo workload",
      "Demonstrate that swapping the proxy out (e.g. to a no-op) requires only the @Bean change",
    ],
    extraAccept: [
      "Cache hits return in under 1ms while underlying repository call averages 50ms (benchmarked)",
      "Logging proxy adds less than 5% overhead vs no proxy",
    ],
    extraHints: ["JDK Dynamic Proxy only works for interfaces — for class-based proxies you need CGLib / ByteBuddy"],
  },

  "p2w10.0": {
    extraReqs: [
      "Persist transitions to an in-memory event log so undo can replay state",
      "Expose a /states endpoint returning the FSM graph as JSON — handy for UI / docs",
    ],
    extraAccept: [
      "Calling an illegal transition (e.g. SHIPPED → CREATED) throws a typed IllegalStateException with a clear message",
      "Undo after a 1-hour window returns a typed error, not a silent no-op",
    ],
    extraHints: ["Make each State class immutable; the transition returns the next State rather than mutating the current one"],
  },

  "p2w11.0": {
    extraReqs: [
      "Add a per-spot ReentrantLock OR a single ConcurrentSkipListSet — write the rationale in the README",
      "Expose metrics for occupancy % per level, per spot type",
    ],
    extraAccept: [
      "Concurrent park calls from 10 threads never double-allocate the same spot (1M-iteration stress test)",
      "All public method return values are unmodifiable collections",
    ],
    extraHints: ["A single skip-list of free spots is simpler than per-spot locks; choose only if a fairness requirement forces per-spot"],
  },

  "p2w11.1": {
    extraReqs: [
      "Loan policy injected as a strategy — Premium / Standard / Student loaders all use the same Member class",
      "Late-return fine calculation is a separate FineCalculator strategy injected per member type",
    ],
    extraAccept: [
      "Switching a Standard member to Premium requires no Member.class change — just inject the other LoanPolicy",
      "Reservation queue handles 1k concurrent reservations without losing any (stress test)",
    ],
    extraHints: ["BlockingQueue with offer/poll handles fair-order reservations elegantly without ad-hoc locks"],
  },

  "p2w12.0": {
    extraReqs: [
      "Each state class is a separate file in a `state` package — no central switch on a mode enum",
      "Cash inventory updates are atomic inside the DISPENSING state's exit transition",
    ],
    extraAccept: [
      "Adding a CARD_BLOCKED state requires only the new class + edge from PIN_ENTERED — no other file changes",
      "3 wrong PIN attempts lock the card and produce an audit-log entry",
    ],
    extraHints: ["Sealed interface for ATMState makes the compiler enforce exhaustive switching when you add a state"],
  },

  // ── Phase 3: Spring Boot ───────────────────────────────────────────────────
  "p3w13.0": {
    extraReqs: [
      "Externalise every property via @ConfigurationProperties — no @Value on individual fields",
      "Custom HealthIndicator includes detail like 'downstream cached for 30s, last fetch 12s ago'",
    ],
    extraAccept: [
      "Booting with no profile throws a clear error rather than picking a silent default",
      "Killing the downstream URL flips /actuator/health to DOWN within 5 seconds",
    ],
    extraHints: ["Use spring-boot-properties-migrator on every upgrade so deprecation warnings surface at boot"],
  },

  "p3w14.0": {
    extraReqs: [
      "Pagination via Spring's Pageable + Page<T>; expose total-count via response header",
      "All 4xx / 5xx responses use a single shared @ControllerAdvice — Problem JSON shape only",
    ],
    extraAccept: [
      "Validation failure on POST returns 400 with `errors[]` listing every offending field",
      "OpenAPI spec includes example payloads for every endpoint",
    ],
    extraHints: [
      "Spring already has a ResponseEntityExceptionHandler base class — extend it; never copy/paste its body",
      "springdoc-openapi-starter-webmvc-ui auto-generates Swagger UI — no separate config",
    ],
  },

  "p3w15.0": {
    extraReqs: [
      "Use @EntityGraph or JOIN FETCH explicitly on every list-style endpoint that touches a relationship",
      "Run integration tests against Postgres via Testcontainers — not H2 (Hibernate behaves differently)",
    ],
    extraAccept: [
      "No N+1 on the order-listing endpoint — verified via Hibernate's SQL log + assertion",
      "Flyway clean → migrate produces an identical DB to running migrations sequentially",
    ],
    extraHints: [
      "Spring Data's @EntityGraph attribute on repository methods is less invasive than EntityManager.createQuery",
      "Use spring.jpa.properties.hibernate.generate_statistics=true in test profile to catch N+1 early",
    ],
  },

  "p3w16.0": {
    extraReqs: [
      "Refresh tokens stored server-side (Redis or DB) with explicit revocation endpoint",
      "Audit log every auth event (login, refresh, password change) with structured fields",
    ],
    extraAccept: [
      "Token replay after rotation returns 401 with `code=token_rotated`",
      "BCrypt cost factor verifiable from a unit test (load factor 12 takes >250ms on the test box)",
    ],
    extraHints: [
      "RS256 wins for inter-service JWTs — the service that issues doesn't have to be the service that validates",
      "Never log a full JWT — log its prefix only",
    ],
  },

  "p3w17.0": {
    extraReqs: [
      "@DataJpaTest for repository tests — JPA slice only, fast",
      "Testcontainers' @ServiceConnection (Spring Boot 3.1+) wires the DB automatically",
    ],
    extraAccept: ["Integration tests run on a CI machine in under 60 seconds total"],
    extraHints: ["JaCoCo line coverage on getters is noise — exclude them from the gate"],
  },

  "p3w18.0": {
    extraReqs: [
      "Cache key uses ${{ hashFiles('**/pom.xml') }} — never just `maven`",
      "Workflow uploads test reports + JaCoCo HTML on failure for debugging without re-running",
    ],
    extraAccept: ["A failing test on a PR blocks merge; a flaky test cannot retroactively pass without intervention"],
    extraHints: ["actions/setup-java's cache: 'maven' uses ~/.m2 — works but is global; per-repo cache is more reliable"],
  },

  // ── Phase 4: Databases ─────────────────────────────────────────────────────
  "p4w21.0": {
    extraReqs: [
      "Sliding-window scores: ZADD with timestamp-prefixed scores so range queries respect time",
      "Distributed lock auto-extends via background heartbeat for long-running scoring jobs",
    ],
    extraAccept: [
      "100 concurrent clients incrementing the same player's score result in zero lost updates",
      "Lock held by a crashed process expires within the configured TTL — no zombies",
    ],
    extraHints: [
      "Use SET key value NX EX — the deprecated SETNX has no TTL atomic option",
      "Redlock is overkill for single-master Redis; SET NX is enough most of the time",
    ],
  },

  "p4w22.0": {
    extraReqs: [
      "Show a 3-step rename: V2 adds new column + backfill, V3 dual-writes, V4 drops old column",
      "Every migration includes a rollback strategy in a top comment",
    ],
    extraAccept: [
      "Each migration on a 10M-row test DB doesn't hold a table-level lock longer than 5 seconds",
      "Flyway info ledger matches expected sequence after running 50 migrations in random order on a fresh DB",
    ],
    extraHints: ["CREATE INDEX CONCURRENTLY is Postgres-only; it can't run inside a migration transaction — Flyway needs the noTransaction marker"],
  },

  "p4w23.0": {
    extraReqs: [
      "Idempotency key persisted in Postgres (unique constraint) — Redis is fine for cache but not source of truth",
      "DLQ consumer + dashboard so poison messages don't accumulate silently",
    ],
    extraAccept: [
      "Killing the inventory consumer mid-batch and restarting doesn't double-reserve any order",
      "1k orders/sec sustained for 30 seconds with no lag accumulation",
    ],
    extraHints: ["Kafka transactions get you exactly-once at the cost of throughput — quantify before reaching for them"],
  },

  "p4w24.0": {
    extraReqs: [
      "All three protocols share the same underlying service; differences are at the transport boundary",
      "Benchmark via wrk / k6 with documented load profile",
    ],
    extraAccept: [
      "GraphQL avoids over-fetching: querying 2 of 10 fields transfers < 30% of REST's payload",
      "gRPC streaming variant handles 10k events/sec on commodity hardware",
    ],
    extraHints: ["GraphQL N+1 is a real problem — use DataLoader from the start"],
  },

  // ── Phase 6: HLD ───────────────────────────────────────────────────────────
  "p6w31.0": {
    extraReqs: [
      "ID generation strategy documented with collision math",
      "Hot URL fetch path uses Redis cache + DB fallback — cache miss + DB latency both bounded",
    ],
    extraAccept: [
      "Generating 1M IDs produces zero collisions (verified in test)",
      "p99 redirect latency under 30ms on local stack",
    ],
    extraHints: ["base62 of a Snowflake-style ID gives you sortable short codes + collision-free at scale"],
  },

  "p6w32.0": {
    extraReqs: [
      "Hybrid fanout: write fan-out for users with < 10k followers, read-side aggregation for everyone else",
      "Per-user timeline cache capped at 800 entries; older entries reload from cold store",
    ],
    extraAccept: ["Modeled celeb tweet (50M followers) doesn't issue 50M writes in the diagram — uses pull"],
    extraHints: ["Cap timeline cache early; nobody reads past the first 500 tweets anyway"],
  },

  "p6w33.0": {
    extraReqs: [
      "Connection-pinning via consistent hash of user_id → chat pod",
      "Read receipts aggregated for groups; per-recipient ACKs only for 1:1",
    ],
    extraAccept: [
      "Diagram shows write, read, presence, and DLQ paths separately",
      "Group with 500 members: each new message produces at most 500 fanout ops, never 500×N",
    ],
    extraHints: ["Encryption: handwave Signal protocol unless the interview pushes; the storage / fanout questions are the meaty ones"],
  },

  "p6w34.0": {
    extraReqs: [
      "Use a stable hash (Murmur3 or SHA-256 prefix) — explain why CRC32's bad distribution doesn't suffice",
      "Virtual node count configurable; default 150 per physical node",
    ],
    extraAccept: [
      "Removing one of 10 nodes reassigns approximately 10% of keys — within ±2% in benchmarks",
      "1M-key benchmark completes in under 5 seconds on a laptop",
    ],
    extraHints: ["TreeMap.ceilingEntry → firstEntry fallback handles the wrap-around without special-casing"],
  },

  "p6w36.0": {
    extraReqs: [
      "Encoding pipeline runs out-of-band (Kafka → workers) — upload returns 202 immediately",
      "View counter uses Redis HINCR with periodic batched flush to durable store",
    ],
    extraAccept: ["Diagram covers upload, transcode pipeline, CDN delivery, view-count flow as separate flows"],
    extraHints: ["HLS adaptive bitrate is the standard; abr ladder choice depends on target device mix"],
  },

  "p6w37.0": {
    extraReqs: [
      "Geohash-based driver index supports k-nearest queries in O(log n) average",
      "Saga state persisted at every step so a node restart resumes correctly",
    ],
    extraAccept: ["Driver matching at 100k drivers in a metro stays under 50ms p99 (synthetic test)"],
    extraHints: ["Surge pricing is a separate service with its own data source (demand/supply); don't fold it into trip-matching"],
  },

  // ── Phase 7: Cloud ────────────────────────────────────────────────────────
  "p7w39.0": {
    extraReqs: [
      "Final runtime image runs as a non-root UID with explicit USER directive",
      "BuildKit cache mounts speed up CI Maven builds by 3-5×",
    ],
    extraAccept: ["docker scan / Trivy reports zero CRITICAL or HIGH vulnerabilities on the runtime image"],
    extraHints: ["Order Dockerfile lines from least → most likely to change; cache invalidation respects order"],
  },

  // ── Phase 8: Microservices ────────────────────────────────────────────────
  "p8w46.0": {
    extraReqs: [
      "Spring Cloud Bus for live config refresh — properties change without restart",
      "Gateway rate-limits the most expensive route at 10 RPS in a documented test",
    ],
    extraAccept: ["Killing one Product replica routes the next request to a healthy replica within the health-check interval"],
    extraHints: ["@RefreshScope only refreshes beans annotated with it — singletons stay cached"],
  },

  "p8w47.0": {
    extraReqs: [
      "Resilience4j metrics surfaced via Micrometer; verifiable in Grafana",
      "Retry never fires on non-idempotent calls — guard with explicit annotation or check",
    ],
    extraAccept: ["Stress-killing the inventory service opens the breaker within 10 seconds and the fallback path keeps working"],
    extraHints: ["Bulkhead semaphore variant works for non-blocking calls; thread-pool variant for blocking I/O"],
  },

  "p8w49.0": {
    extraReqs: [
      "Snapshot strategy for aggregates that exceed 1k events — replay-from-snapshot, not from event 0",
      "Projection rebuild CLI usable for ops",
    ],
    extraAccept: [
      "Replay reproduces the read model byte-for-byte",
      "Adding a new projection requires zero changes to the aggregate",
    ],
    extraHints: ["Never modify an event's schema in place — version events and translate forward at read time"],
  },

  "p8w50.0": {
    extraReqs: [
      "Compensations explicitly inverse to the forward step — RefundPayment cancels ChargePayment fully",
      "Saga state persisted at every step so a crash mid-saga resumes correctly",
    ],
    extraAccept: ["Failure injected at any step rolls back all earlier steps via compensations within configured timeout"],
    extraHints: ["Orchestration sagas (Axon, Camunda) are easier to debug; choreography sagas scale better"],
  },

  // ── Phase 9: Capstone ─────────────────────────────────────────────────────
  "p9w53.0": {
    extraReqs: [
      "Deep-dive 1: gateway rate-limiting strategy + per-route bucket sizing",
      "Deep-dive 2: saga orchestrator placement (separate service vs in-process)",
      "Deep-dive 3: Kafka topic + partition strategy for the place-order flow",
    ],
    extraAccept: ["Each deep-dive includes the alternatives considered and why each was rejected"],
    extraHints: ["Pick deep-dives where you genuinely don't know the answer yet — that's where the work compounds"],
  },
};

// ── Architecture diagrams for HLD builds that lack one ─────────────────────────
const DIAGRAMS: Record<string, string> = {
  "p2w11.0": `
  ┌─────────────────────────────────────────┐
  │             ParkingLot                  │
  │  - levels: List<Level>                  │
  │  - strategy: ParkingStrategy            │
  │  + park(Vehicle) : Ticket               │
  │  + leave(Ticket) : Fee                  │
  └────────────────┬────────────────────────┘
                   │ 1..*
                   ▼
       ┌────────────────┐      ┌────────────────────┐
       │     Level      │──*──▶│        Spot        │
       │  - number      │      │  - type: SpotType  │
       │  - spots       │      │  - isFree: bool    │
       └────────────────┘      └────────────────────┘`,

  "p2w12.0": `
                 ┌───────────┐
        ┌───────▶│   IDLE    │◀──────cancel/eject──┐
        │        └─────┬─────┘                     │
        │              │ insert card               │
        │              ▼                           │
        │     ┌─────────────────┐                  │
        │     │ CARD_INSERTED   │──cancel──────────┤
        │     └───────┬─────────┘                  │
        │             │ enter PIN                  │
        │             ▼                            │
        │     ┌─────────────────┐                  │
        │     │  PIN_ENTERED    │──cancel──────────┤
        │     └───────┬─────────┘                  │
        │             │ enter amount               │
        │             ▼                            │
        │     ┌─────────────────┐                  │
        │     │ AMOUNT_ENTERED  │──cancel──────────┤
        │     └───────┬─────────┘                  │
        │             │ confirm                    │
        │             ▼                            │
        │     ┌─────────────────┐                  │
        └─────│   DISPENSING    │──complete────────┘
              └─────────────────┘`,

  "p6w31.0": `
  ┌─────────┐   POST /shorten   ┌──────────┐
  │ Client  │ ────────────────▶ │  API GW  │
  └─────────┘                   └────┬─────┘
       ▲                             │
       │ 302 + Location              ▼
       │                  ┌──────────────────┐
       │                  │  Shortener Svc   │
       │                  │  base62(id)      │
       │                  └────────┬─────────┘
       │                           │ write
       │                           ▼
       │                  ┌──────────────────┐
       │                  │   Postgres / KV  │
       │                  └────────┬─────────┘
       │  GET /:code               │
       └────────────┐              ▼
                    │     ┌──────────────────┐
                    └────▶│      Redis       │
                          │   (hot codes)    │
                          └──────────────────┘`,

  "p6w33.0": `
  ┌───────────┐ WSS  ┌────────────┐   send    ┌─────────────┐
  │  Client A │─────▶│ WS Gateway │──────────▶│   Kafka     │
  └───────────┘      │  (sticky)  │           │ topic/conv  │
                     └─────┬──────┘           └──────┬──────┘
                           │ presence ping            │ stream
                           ▼                          ▼
                     ┌────────────┐            ┌───────────────┐
                     │   Redis    │            │  Chat Service │
                     │ (presence) │            │ (fanout + AC) │
                     └────────────┘            └────┬──────────┘
                                                    │ write
                                                    ▼
                                            ┌───────────────┐
                                            │ Hot store +   │
                                            │ Cold archive  │
                                            └───────────────┘`,

  "p6w36.0": `
  ┌────────┐    upload    ┌──────────┐    202     ┌────────┐
  │ Client │─────────────▶│ Upload   │───────────▶│ Client │
  └────────┘              │ Service  │            └────────┘
                          └────┬─────┘
                               │ raw video → S3
                               ▼
                          ┌──────────┐
                          │   S3     │
                          └────┬─────┘
                               │ Kafka event
                               ▼
                     ┌─────────────────────┐
                     │ Transcode Workers   │
                     │ (multiple bitrates) │
                     └────────┬────────────┘
                              │ HLS manifest + segments
                              ▼
                          ┌──────────┐    cache hit    ┌────────┐
                          │   CDN    │◀───────────────▶│ Viewer │
                          └────┬─────┘                 └────────┘
                               │ miss
                               ▼
                          ┌──────────┐
                          │  Origin  │
                          └──────────┘`,
};

function dedupAppend(existing: string[], extras: string[] | undefined): string[] {
  if (!extras) return existing;
  const seen = new Set(existing);
  const out = [...existing];
  for (const x of extras) {
    if (!seen.has(x)) { out.push(x); seen.add(x); }
  }
  return out;
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Deepen Java build_specs — ${apply ? "APPLY" : "DRY RUN"}`);

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
          const newDiagram = DIAGRAMS[tag];
          if (!extras && !newDiagram) continue;
          touched++;

          const nextReqs   = dedupAppend(spec.requirements, extras?.extraReqs);
          const nextAccept = dedupAppend(spec.acceptance,   extras?.extraAccept);
          const nextHints  = dedupAppend(spec.hints,        extras?.extraHints);
          const nextDiag   = spec.diagram ?? newDiagram ?? null;

          if (!apply) continue;
          await db.update(buildSpecs)
            .set({
              requirements: nextReqs,
              acceptance:   nextAccept,
              hints:        nextHints,
              diagram:      nextDiag,
            })
            .where(and(eq(buildSpecs.language, "java"), eq(buildSpecs.resourceKey, key)));
        }
      }
    }
  }

  console.log(`  Touched ${touched} Java specs`);
  if (!apply) console.log(`Run with --apply to commit.`);
  else        console.log(`✅ Deepening applied`);
}

main().catch((err) => {
  console.error("❌ Deepen failed:", err);
  process.exit(1);
});
