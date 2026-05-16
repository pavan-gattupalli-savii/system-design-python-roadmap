// ── Enrich existing build_specs ────────────────────────────────────────────────
// Adds tags / est_hours / stretch_goals / pitfalls / prerequisites / references
// to every build_specs row. Keyed by the same pPwW.B tag used by
// seed-java-build-specs.ts. Works across both languages.
//
// Conservative defaults — if a build is missing an explicit entry below, we
// fall back to a small set of safe defaults inferred from difficulty + phase.
//
// Idempotent. Dry-run by default. Pass --apply.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { buildSpecs, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../src/db/schema.js";
import { eq, and, asc } from "drizzle-orm";

interface Enrichment {
  tags?:          string[];
  estHours?:      number;
  stretchGoals?:  string[];
  pitfalls?:      string[];
  prerequisites?: string[];
  references?:    Array<{ label: string; url: string }>;
}

function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

// ── Per-(language, tag) enrichments ────────────────────────────────────────────
// `tag` = `pPwW.B` — same scheme as seed-java-build-specs.ts. Authored
// explicitly per spec; the rest fall back to inferred defaults below.
const ENRICH: Record<"python" | "java", Record<string, Enrichment>> = {
  python: {
    // ── Phase 1: Foundations ─────────────────────────────────────────────────
    "p1w1.0": {
      tags: ["CLI", "Foundations"],
      estHours: 2,
      stretchGoals: ["Wrap converter as a tiny FastAPI service", "Add fuzz tests via Hypothesis"],
      pitfalls: ["Reading raw input() instead of argparse", "Catching bare Exception instead of typed errors"],
      prerequisites: ["Python installed (3.11+)", "Basic terminal usage"],
      references: [
        { label: "Real Python — argparse",       url: "https://realpython.com/command-line-interfaces-python-argparse/" },
        { label: "Hypothesis property tests",    url: "https://hypothesis.readthedocs.io/" },
      ],
    },
    "p1w2.0": {
      tags: ["CLI", "Modules", "JSON"],
      estHours: 3,
      stretchGoals: ["Add a `due` flag with a custom date parser", "Persist as SQLite instead of JSON"],
      pitfalls: ["Mixing CLI parsing inside business logic", "Forgetting to handle missing JSON file on first run"],
      prerequisites: ["Functions + modules", "Basic file I/O"],
      references: [
        { label: "argparse subcommands tutorial", url: "https://docs.python.org/3/library/argparse.html#sub-commands" },
      ],
    },
    "p1w3.0": {
      tags: ["OOP", "Inheritance", "Exceptions"],
      estHours: 3,
      stretchGoals: ["Add interest compounding (monthly accrual)", "Persist accounts to JSON between runs"],
      pitfalls: ["Calling super().__init__ after setting subclass attrs", "Raising bare Exception in custom errors"],
      prerequisites: ["Functions, dataclasses optional"],
      references: [
        { label: "Real Python — Inheritance",    url: "https://realpython.com/inheritance-composition-python/" },
      ],
    },
    "p1w4.0": {
      tags: ["DSA", "Big-O", "Git"],
      estHours: 4,
      stretchGoals: ["Add doubly-linked list + circular variants", "Benchmark with hyperfine + plot the curves"],
      pitfalls: ["Using a list as a queue (O(n) pops)", "Skipping the unit tests — write them as you go"],
      prerequisites: ["Phase 1 weeks 1-3", "Comfort with classes"],
      references: [
        { label: "Python TimeComplexity wiki", url: "https://wiki.python.org/moin/TimeComplexity" },
      ],
    },

    // ── Phase 2: Internals & OOP Mastery ──────────────────────────────────────
    "p2w5.0": {
      tags: ["Typing", "ABCs", "Protocols", "dataclasses"],
      estHours: 4,
      stretchGoals: ["Add a fake PaymentGateway implementation for tests", "Make Notifier async and adapt clients"],
      pitfalls: ["Using ABC where Protocol fits better (structural typing)", "Forgetting frozen=True for immutable VOs"],
      prerequisites: ["Phase 1 OOP fundamentals"],
      references: [
        { label: "Fluent Python — A Pythonic Object", url: "https://www.fluentpython.com/" },
      ],
    },
    "p2w6.0": {
      tags: ["Descriptors", "Metaclasses"],
      estHours: 5,
      stretchGoals: ["Add cross-field validation (e.g. min < max)", "Generate Pydantic-style schema from the registry"],
      pitfalls: ["Using __slots__ with mixins it can't combine with", "Reaching for a metaclass when a class decorator works"],
      prerequisites: ["@property + dataclasses"],
    },
    "p2w7.0": {
      tags: ["Generators", "Iterators", "Context Managers"],
      estHours: 4,
      stretchGoals: ["Add a chunked variant for parallel downstream processing", "Wrap as an async generator"],
      pitfalls: ["Returning a list when a generator was the point", "Forgetting to handle GeneratorExit inside try/finally"],
    },
    "p2w8.0": {
      tags: ["asyncio", "Typing"],
      estHours: 5,
      stretchGoals: ["Add a circuit breaker around the scraper", "Compare against httpx.AsyncClient pool"],
      pitfalls: ["Blocking calls inside async code (requests, time.sleep)", "Mixing asyncio.gather with shared mutable state"],
      references: [
        { label: "Python asyncio — Tasks", url: "https://docs.python.org/3/library/asyncio-task.html" },
      ],
    },
    "p2w9.0": {
      tags: ["Functional", "itertools", "functools"],
      estHours: 3,
      stretchGoals: ["Profile with cProfile + flame graph", "Add lru_cache and measure hit rate"],
      pitfalls: ["Overusing map/filter where a comprehension is clearer", "Forgetting reduce's initial value"],
    },
    "p2w10.0": {
      tags: ["Concurrency", "GIL", "ThreadPool"],
      estHours: 5,
      stretchGoals: ["Add multiprocessing variant for CPU-bound transforms", "Compare against asyncio for I/O work"],
      pitfalls: ["Picking threads for CPU-bound work (GIL bites)", "Sharing mutable state without locks"],
    },

    // ── Phase 3: LLD ──────────────────────────────────────────────────────────
    "p3w11.0": {
      tags: ["SOLID", "Refactor"],
      estHours: 4,
      stretchGoals: ["Show a metrics-driven win (cyclomatic complexity before/after)", "Write characterization tests on the legacy version first"],
      pitfalls: ["Over-abstracting (SRP fundamentalism creates ravioli code)", "Refactoring without tests as a safety net"],
    },
    "p3w12.0": {
      tags: ["Design Patterns", "Creational"],
      estHours: 4,
      stretchGoals: ["Add Prototype + Object Pool", "Compare cost of each in pytest-benchmark"],
      pitfalls: ["Singleton via global module state hides dependencies", "Abstract Factory for two concrete classes (overkill)"],
    },
    "p3w13.0": {
      tags: ["Design Patterns", "Structural"],
      estHours: 4,
      stretchGoals: ["Add Composite for nested cart items", "Flyweight for character glyphs"],
      pitfalls: ["Decorator vs Proxy confusion (intent differs)", "Adapter that exposes adaptee internals"],
    },
    "p3w14.0": {
      tags: ["Design Patterns", "Behavioral"],
      estHours: 5,
      stretchGoals: ["Add Mediator + Memento", "Combine State + Strategy in one realistic flow"],
      pitfalls: ["Observer that leaks listeners — always provide unsubscribe", "Command without undo when undo was the whole point"],
    },
    "p3w15.0": {
      tags: ["LLD", "Practice"],
      estHours: 8,
      stretchGoals: ["Add reservations with priority queue", "Build a small CLI front-end"],
      pitfalls: ["Skipping the class diagram step", "Writing methods before settling responsibilities"],
    },
    "p3w16.0": {
      tags: ["LLD", "Design Doc"],
      estHours: 8,
      stretchGoals: ["Sketch a Cassandra schema for the order log", "Reason about how this evolves to HLD next phase"],
      pitfalls: ["Writing the doc after coding (doc rots)", "Listing classes without explaining trade-offs"],
    },

    // ── Phase 4: Testing & Quality ───────────────────────────────────────────
    "p4w17.0": {
      tags: ["pytest", "Testing"],
      estHours: 4,
      stretchGoals: ["Add coverage gate at 90%", "Adopt pytest-randomly to surface order dependencies"],
      pitfalls: ["Tests that depend on execution order", "Fixtures with the wrong scope (session when function fits)"],
      references: [
        { label: "pytest docs", url: "https://docs.pytest.org/" },
      ],
    },
    "p4w18.0": {
      tags: ["TDD", "Mocking"],
      estHours: 5,
      stretchGoals: ["Try property-based testing with Hypothesis", "Mutation testing with mutmut"],
      pitfalls: ["Mocking everything (no integration coverage)", "Testing implementation details instead of behaviour"],
    },
    "p4w19.0": {
      tags: ["mypy", "ruff", "CI"],
      estHours: 4,
      stretchGoals: ["Add bandit for security lint", "Pre-commit hooks for ruff format + check"],
      pitfalls: ["# type: ignore everywhere instead of fixing the root", "Loosening mypy strictness to make CI green"],
    },

    // ── Phase 5: Databases ───────────────────────────────────────────────────
    "p5w20.0": {
      tags: ["SQL", "Indexes", "Postgres"],
      estHours: 4,
      stretchGoals: ["Add a partial index for a hot WHERE", "Compare BRIN vs B-tree on time-series data"],
      pitfalls: ["Indexing without measuring (EXPLAIN ANALYZE first)", "Composite index column order ignored"],
    },
    "p5w21.0": {
      tags: ["SQL", "Transactions"],
      estHours: 5,
      stretchGoals: ["Add advisory locks for application coordination", "Simulate a write-skew anomaly with REPEATABLE READ"],
      pitfalls: ["SERIALIZABLE everywhere kills throughput", "Forgetting to retry on serialization_failure"],
    },
    "p5w22.0": {
      tags: ["NoSQL", "Mongo", "Redis"],
      estHours: 6,
      stretchGoals: ["Add DynamoDB single-table for sessions", "Compare query cost across stores"],
      pitfalls: ["Modelling Mongo like a relational DB", "Using Redis as primary store without persistence"],
    },
    "p5w23.0": {
      tags: ["Replication", "Sharding"],
      estHours: 4,
      stretchGoals: ["Sketch how to migrate from single-leader to multi-leader", "Identify hot-shard mitigations"],
      pitfalls: ["Sharding too early — usually replication is enough", "Ignoring rebalance cost on shard add"],
    },
    "p5w24.0": {
      tags: ["CAP", "Consensus"],
      estHours: 4,
      stretchGoals: ["Read Raft paper + write a 1-page summary", "Compare ZK / etcd / Consul"],
      pitfalls: ["Confusing CAP with PACELC", "Thinking 'AP' means no consistency, ever"],
    },
    "p5w25.0": {
      tags: ["CDN", "Blob Storage", "Search"],
      estHours: 4,
      stretchGoals: ["Add CloudFront-style signed URLs", "Plan an inverted index for full-text search"],
      pitfalls: ["Serving big objects through the app instead of CDN", "Storing JSON blobs in Postgres when S3 fits"],
    },

    // ── Phase 6: Networking & APIs ───────────────────────────────────────────
    "p6w26.0": {
      tags: ["REST", "HTTP"],
      estHours: 5,
      stretchGoals: ["Add ETag-based conditional GETs", "Pagination with cursors not offsets"],
      pitfalls: ["Returning 200 with error JSON", "Mutable URLs for resources that should be canonical"],
    },
    "p6w27.0": {
      tags: ["gRPC", "WebSocket"],
      estHours: 6,
      stretchGoals: ["Add streaming gRPC", "Compare WebSocket vs SSE"],
      pitfalls: ["Reinventing reliability over WebSocket (use a queue)", "gRPC across the open internet without tooling"],
    },
    "p6w28.0": {
      tags: ["Kafka", "Queues", "Event-driven"],
      estHours: 6,
      stretchGoals: ["Add Outbox pattern for atomic publish + commit", "Compare to RabbitMQ"],
      pitfalls: ["At-least-once consumed assumed exactly-once", "Coupling DB transaction to Kafka send (won't be atomic)"],
    },
    "p6w29.0": {
      tags: ["Rate Limiting", "Gateway"],
      estHours: 4,
      stretchGoals: ["Add Redis-backed sliding window", "Per-user vs per-IP buckets"],
      pitfalls: ["Naive token-bucket without atomicity (race on refill)", "Rate-limit by IP behind a load balancer (everyone shares one IP)"],
    },
    "p6w30.0": {
      tags: ["Security", "Auth"],
      estHours: 4,
      stretchGoals: ["Add refresh-token rotation", "Audit log on auth events"],
      pitfalls: ["JWT with long expiry + no revocation", "Storing secrets in repo / .env committed"],
    },

    // ── Phase 7: HLD ──────────────────────────────────────────────────────────
    "p7w32.0": {
      tags: ["HLD", "Estimation"],
      estHours: 3,
      stretchGoals: ["Re-do the estimation cold once a week for 4 weeks", "Apply to a system you've never seen"],
      pitfalls: ["Skipping the requirements step", "Estimation handwave (no per-step assumption)"],
    },
    "p7w33.0": {
      tags: ["HLD", "Load Balancing"],
      estHours: 4,
      stretchGoals: ["Sketch sticky sessions vs externalised state", "Compare nginx vs HAProxy"],
      pitfalls: ["Round-robin where consistent hashing fits", "Health check that hits the same dependency users do (cascading failure)"],
    },
    "p7w34.0": {
      tags: ["HLD", "Consistent Hashing"],
      estHours: 4,
      stretchGoals: ["Implement the ring with virtual nodes (Python)", "Read DynamoDB paper for production version"],
      pitfalls: ["Virtual nodes count too small → uneven distribution", "Re-hashing changes on every node add"],
    },
    "p7w35.0": {
      tags: ["HLD", "Feed Design"],
      estHours: 5,
      stretchGoals: ["Hybrid fanout for celebrity-heavy graphs", "Compare write-amplification numbers"],
      pitfalls: ["Pure fanout-on-write for celebs (write storm)", "Pure fanout-on-read for everyone (slow timelines)"],
    },
    "p7w36.0": {
      tags: ["HLD", "Chat", "WebSocket"],
      estHours: 6,
      stretchGoals: ["Add presence with Redis TTL", "Read receipts aggregated for groups"],
      pitfalls: ["Per-recipient ACK for big groups (multiplies traffic)", "Stateful gateways without sticky routing"],
    },
    "p7w37.0": {
      tags: ["HLD", "Distributed Tx", "Saga"],
      estHours: 6,
      stretchGoals: ["Compare to 2PC (and why you wouldn't)", "Add idempotency keys end-to-end"],
      pitfalls: ["Compensations that aren't truly inverse", "Saga state lost on restart"],
    },
    "p7w38.0": {
      tags: ["HLD", "Search", "Typeahead"],
      estHours: 5,
      stretchGoals: ["Add edit-distance for typo tolerance", "Plan how to update the trie incrementally"],
      pitfalls: ["Hand-rolling full-text from scratch (use Elastic)", "Forgetting ranking signals (popularity, recency)"],
    },
    "p7w39.0": {
      tags: ["HLD", "Video Streaming"],
      estHours: 6,
      stretchGoals: ["Plan an adaptive bitrate ladder", "Reason about live vs VOD differences"],
      pitfalls: ["Single-bitrate streaming", "Encoding on the upload path (block)"],
    },
    "p7w40.0": {
      tags: ["HLD", "Payments", "Notifications"],
      estHours: 5,
      stretchGoals: ["Add 3DS / SCA flow", "Reason about provider failover"],
      pitfalls: ["Non-idempotent payment endpoints", "Notification fanout without per-channel rate limits"],
    },
    "p7w41.0": {
      tags: ["HLD", "Mock"],
      estHours: 6,
      stretchGoals: ["Record each mock + watch back", "Score yourself against a rubric"],
      pitfalls: ["Solving same kind of problem repeatedly (stays comfy)", "Skipping the wrap-up + bottleneck step"],
    },

    // ── Phase 8: Reliability / DevOps ────────────────────────────────────────
    "p8w42.0": {
      tags: ["SRE", "SLO"],
      estHours: 4,
      stretchGoals: ["Burn-rate alerts based on remaining budget", "Run a tabletop game-day"],
      pitfalls: ["100% uptime SLO (impossible + unhelpful)", "Alerts on symptoms not causes"],
    },
    "p8w43.0": {
      tags: ["Observability"],
      estHours: 5,
      stretchGoals: ["Build a Grafana board for golden signals", "Trace one user request end-to-end"],
      pitfalls: ["Logging everything (noise drowns signal)", "Metrics with high cardinality labels"],
    },
    "p8w44.0": {
      tags: ["Docker", "Kubernetes"],
      estHours: 6,
      stretchGoals: ["Add HPA driven by custom metric (queue depth)", "Set up Argo CD or Flux for GitOps"],
      pitfalls: ["latest tag in prod", "Resources requests/limits missing → OOMKilled or noisy neighbours"],
    },
    "p8w45.0": {
      tags: ["CI/CD"],
      estHours: 5,
      stretchGoals: ["Blue/green via Helm", "Add deploy gates (Sonar / OWASP scan)"],
      pitfalls: ["No rollback plan", "Long-running prod deploys (no automation)"],
    },

    // ── Phase 9: Interview Prep & Capstone ───────────────────────────────────
    "p9w46.0": {
      tags: ["Interview", "LLD"],
      estHours: 6,
      stretchGoals: ["Pair with a friend; trade prompts", "Recording reviewed by a senior eng"],
    },
    "p9w47.0": {
      tags: ["Interview", "HLD"],
      estHours: 8,
      stretchGoals: ["Record 3 mocks back-to-back", "Critique a peer's mock"],
    },
    "p9w48.0": {
      tags: ["Capstone", "Twitter clone"],
      estHours: 25,
      stretchGoals: ["Add WebSocket live feed updates", "Image upload to S3 + CDN"],
      pitfalls: ["Scope creep (cut features ruthlessly)", "Skipping README / setup docs"],
    },
    "p9w49.0": {
      tags: ["Deploy", "Portfolio"],
      estHours: 6,
      stretchGoals: ["Add a public status page", "Share on LinkedIn / Hacker News"],
    },
  },

  // ── Java enrichments ────────────────────────────────────────────────────────
  java: {
    "p1w1.0": { tags: ["Java 21", "Records", "Sealed"], estHours: 3,
      stretchGoals: ["Add a Visitor pattern over the sealed hierarchy", "Wrap as a tiny CLI tool"],
      pitfalls: ["Records aren't always better than classes — mutable state needs a class", "Forgetting compact-constructor validation"] },
    "p1w2.0": { tags: ["Streams", "Functional"], estHours: 3,
      stretchGoals: ["Add parallelStream + benchmark vs sequential", "Output CSV instead of text report"],
      pitfalls: ["parallelStream on small data (overhead > gain)", "Stateful lambdas in stream pipelines"] },
    "p1w3.0": { tags: ["Concurrency", "Executor", "Queue"], estHours: 4,
      stretchGoals: ["Replace pool with virtual threads (Java 21)", "Add metrics: queue depth over time"],
      pitfalls: ["Not interrupting on shutdown", "Unbounded queue → OOM on producer overrun"] },
    "p1w4.0": { tags: ["CompletableFuture", "Async"], estHours: 4,
      stretchGoals: ["Implement same flow with virtual threads + structured concurrency", "Add per-call retry with jitter"],
      pitfalls: ["Forgetting orTimeout (single hang blocks allOf forever)", "exceptionally that swallows the exception"] },
    "p1w5.0": { tags: ["JVM", "GC", "Performance"], estHours: 5,
      stretchGoals: ["Compare G1 / ZGC / Shenandoah on the same load", "Tune with -XX:+UseStringDeduplication"],
      pitfalls: ["GC tuning without measurement first", "Heap dump on prod without thinking about memory size"] },
    "p1w6.0": { tags: ["DSA", "Collections"], estHours: 4,
      stretchGoals: ["Add concurrent variants", "Benchmark with JMH"],
      pitfalls: ["Using LinkedList for indexed access", "Vector / Hashtable instead of modern alternatives"] },

    "p2w7.0": { tags: ["SOLID", "Refactor"], estHours: 4,
      stretchGoals: ["Add characterization tests on the legacy version first", "Use ArchUnit to enforce package boundaries"],
      pitfalls: ["Over-abstracting (interfaces for one impl)", "Refactoring without tests"] },
    "p2w8.0": { tags: ["Design Patterns", "Creational"], estHours: 4,
      stretchGoals: ["Add Prototype for templated notifications", "Compare Builder vs Lombok @Builder"],
      pitfalls: ["Factory for two concrete classes (overkill)", "Builder without enforced required fields"] },
    "p2w9.0": { tags: ["Design Patterns", "Proxy", "Decorator"], estHours: 5,
      stretchGoals: ["Compare JDK proxy vs CGLib byte-buddy", "Add a circuit-breaker decorator"],
      pitfalls: ["Mixing concerns in a single proxy", "Proxying final classes (CGLib limitation)"] },
    "p2w10.0": { tags: ["Design Patterns", "State", "Observer"], estHours: 5,
      stretchGoals: ["Add Memento for snapshotting order state", "Wire Spring ApplicationEvents for the observers"],
      pitfalls: ["Observers that leak listeners — explicit unsubscribe", "State logic in the orchestrator instead of the State object"] },
    "p2w11.0": { tags: ["LLD", "Concurrency"], estHours: 8,
      stretchGoals: ["Add reservation system with priority queue", "Tier 2 vehicles + reserved spot types"],
      pitfalls: ["Race on spot allocation without locking", "Hard-coding the strategy in ParkingLot"] },
    "p2w11.1": { tags: ["LLD", "Composition"], estHours: 6,
      stretchGoals: ["Add e-books with concurrent checkout limits", "Late-fee waiver workflow"],
      pitfalls: ["Subclassing Member by tier (composition wins here)", "Sync issues on reservation queue under load"] },
    "p2w12.0": { tags: ["LLD", "State Machine"], estHours: 7,
      stretchGoals: ["Add multi-currency transactions", "Audit log per transaction"],
      pitfalls: ["if/else cascade instead of State pattern", "Cash inventory updated outside DISPENSING state"] },
    "p2w12.1": { tags: ["Design Doc", "LLD"], estHours: 4,
      stretchGoals: ["Get the doc reviewed by a senior eng", "Publish on your blog"],
      pitfalls: ["Doc written after coding (rots fast)", "Classes listed without trade-offs"] },

    "p3w13.0": { tags: ["Spring Boot", "DI"], estHours: 3,
      stretchGoals: ["Add Spring Boot DevTools for hot reload", "Custom Actuator metric for business stats"],
      pitfalls: ["Field DI (@Autowired) — use constructor DI", "@Component on classes that should be @Configuration"] },
    "p3w14.0": { tags: ["Spring Web", "REST", "Validation"], estHours: 4,
      stretchGoals: ["Add HATEOAS links", "API versioning via Accept header"],
      pitfalls: ["Returning entities directly (DTOs exist for a reason)", "200 with error JSON instead of 4xx"] },
    "p3w15.0": { tags: ["JPA", "Hibernate", "Flyway"], estHours: 6,
      stretchGoals: ["Add second-level cache for hot reads", "Multi-tenancy via discriminator column"],
      pitfalls: ["N+1 — verify with SQL log", "@OneToMany with eager fetch on big collections"] },
    "p3w16.0": { tags: ["Spring Security", "JWT", "Auth"], estHours: 5,
      stretchGoals: ["Refresh-token rotation", "Method-level @PreAuthorize on services"],
      pitfalls: ["Long-lived JWT with no revocation", "Storing JWT in localStorage (XSS attack surface)"] },
    "p3w17.0": { tags: ["Testing", "Mockito", "Testcontainers"], estHours: 5,
      stretchGoals: ["Add ArchUnit for architectural tests", "Run integration tests in CI in parallel"],
      pitfalls: ["@SpringBootTest everywhere (slow)", "Mocking JPA repos (test what matters)"] },
    "p3w18.0": { tags: ["CI/CD", "GitHub Actions"], estHours: 4,
      stretchGoals: ["Add SonarCloud quality gate", "Cache Docker layers via buildx"],
      pitfalls: ["Pushing latest tag from CI", "No artifact uploaded on failure"] },

    "p4w19.0": { tags: ["JDBC", "Connection Pool"], estHours: 4 },
    "p4w20.0": { tags: ["Hibernate", "Performance"], estHours: 5 },
    "p4w21.0": { tags: ["Redis", "Sorted Set", "Locking"], estHours: 5,
      stretchGoals: ["Add Redlock for multi-master Redis", "Pub/sub for live leaderboard updates"],
      pitfalls: ["Forgetting EXPIRE on lock key (zombie locks)", "Reading sorted set without WITHSCORES when you need both"] },
    "p4w22.0": { tags: ["Flyway", "Migrations"], estHours: 4,
      stretchGoals: ["Add zero-downtime rename in 3 steps", "Generate baseline from existing DB"],
      pitfalls: ["DROP COLUMN that's still being read", "Long lock during ALTER (use CONCURRENTLY)"] },
    "p4w23.0": { tags: ["Kafka", "Idempotency"], estHours: 8,
      stretchGoals: ["Add exactly-once with idempotent producer + transactions", "DLQ analyser script"],
      pitfalls: ["At-least-once assumed exactly-once", "Coupling DB tx to Kafka send"] },
    "p4w24.0": { tags: ["API", "GraphQL", "gRPC"], estHours: 6,
      stretchGoals: ["Add federation across two GraphQL services", "Generate clients from gRPC schema"],
      pitfalls: ["GraphQL N+1 without DataLoader", "gRPC across the public internet without TLS"] },

    "p5w25.0": { tags: ["DDIA", "Storage"], estHours: 3 },
    "p5w26.0": { tags: ["DDIA", "Replication"], estHours: 4 },
    "p5w27.0": { tags: ["Coordination", "Raft"], estHours: 4,
      stretchGoals: ["Read the Raft paper and write a 1-pager"],
      pitfalls: ["Confusing eventually-consistent with linearizable"] },
    "p5w28.0": { tags: ["Caching"], estHours: 4 },
    "p5w29.0": { tags: ["nginx", "Load Balancing", "CDN"], estHours: 4,
      stretchGoals: ["Add Cloudflare in front", "Tune keepalive + worker_connections"],
      pitfalls: ["Health check that hits a dependency (cascading failure)"] },
    "p5w30.0": { tags: ["HLD", "Estimation"], estHours: 3 },

    "p6w31.0": { tags: ["HLD", "URL Shortener"], estHours: 4,
      stretchGoals: ["Add analytics (clicks per URL)", "Custom domains"],
      pitfalls: ["base62 collisions without check", "Cache stampede on hot URL"] },
    "p6w31.1": { tags: ["HLD", "Pastebin"], estHours: 4,
      stretchGoals: ["Syntax highlighting in client", "Encrypted pastes"],
      pitfalls: ["Storing large content in Postgres", "No expiry cleanup"] },
    "p6w32.0": { tags: ["HLD", "Feed"], estHours: 6,
      stretchGoals: ["Add notification fanout estimate", "Plan a media CDN"],
      pitfalls: ["Pure fanout-on-write for celebs (write storm)", "Read-fanout for everyone (slow timelines)"] },
    "p6w33.0": { tags: ["HLD", "Chat", "WebSocket"], estHours: 6,
      stretchGoals: ["Add E2E encryption design (Signal protocol)", "Plan multi-region routing"],
      pitfalls: ["Per-recipient ACK in groups (multiplies traffic)", "Stateful connections without sticky routing"] },
    "p6w34.0": { tags: ["Consistent Hashing"], estHours: 5,
      stretchGoals: ["Add weighted virtual nodes", "Hot-key handling strategies"],
      pitfalls: ["Too few virtual nodes (uneven distribution)", "Hash function with bad distribution"] },
    "p6w35.0": { tags: ["HLD", "Typeahead", "Search"], estHours: 5,
      stretchGoals: ["Add typo tolerance (edit distance)", "Personalised ranking signals"],
      pitfalls: ["Querying DB on every keystroke (use cache)", "Stale trie without rebuild plan"] },
    "p6w36.0": { tags: ["HLD", "Video"], estHours: 7,
      stretchGoals: ["Add live streaming variant", "Plan a live + VOD hybrid"],
      pitfalls: ["Synchronous transcoding on upload (blocks)", "One bitrate (terrible mobile UX)"] },
    "p6w37.0": { tags: ["HLD", "Ride-sharing", "Saga"], estHours: 7,
      stretchGoals: ["Add surge-pricing simulator", "Driver-payout schedule"],
      pitfalls: ["Non-idempotent payment endpoints", "Driver matching that returns stale data"] },
    "p6w38.0": { tags: ["HLD", "Retrospective"], estHours: 2 },

    "p7w39.0": { tags: ["Docker", "Multi-stage"], estHours: 4,
      stretchGoals: ["Add a distroless variant", "Push multi-arch images (arm64 + amd64)"],
      pitfalls: ["Running as root in container", "latest tag in prod"] },
    "p7w40.0": { tags: ["Kubernetes", "Helm"], estHours: 6,
      stretchGoals: ["Add Argo CD for GitOps", "Custom metric HPA on queue depth"],
      pitfalls: ["No resource requests/limits → OOMKilled or noisy neighbours", "Secret committed to chart"] },
    "p7w41.0": { tags: ["CI/CD", "Quality Gate"], estHours: 5,
      stretchGoals: ["Add OWASP dep-check + Trivy image scan", "Canary deploys via Argo Rollouts"],
      pitfalls: ["No rollback plan", "Manual prod deploys still required"] },
    "p7w42.0": { tags: ["Observability", "Micrometer", "OTel"], estHours: 5,
      stretchGoals: ["Add SLO burn-rate alerts", "Build a golden-signals dashboard"],
      pitfalls: ["High-cardinality metric labels (cost spike)", "Logs without trace-id correlation"] },
    "p7w43.0": { tags: ["AWS", "S3", "SQS"], estHours: 5 },
    "p7w44.0": { tags: ["Terraform", "IaC"], estHours: 6,
      stretchGoals: ["Add a separate workspace per env", "Use terraform-docs to auto-generate README"],
      pitfalls: ["State stored locally (lose it once = panic)", "No DynamoDB lock for state"] },

    "p8w45.0": { tags: ["DDD", "Microservices"], estHours: 4 },
    "p8w46.0": { tags: ["Spring Cloud", "Gateway", "Eureka"], estHours: 6,
      stretchGoals: ["Replace Eureka with Consul or Kubernetes-native discovery", "Add Spring Cloud Bus for event-driven refresh"],
      pitfalls: ["Hard-coded service URLs leaking past the gateway", "Config Server without proper encryption for secrets"] },
    "p8w47.0": { tags: ["Resilience4j", "Circuit Breaker"], estHours: 5,
      stretchGoals: ["Add rate limiter alongside the breaker", "Chaos test via Chaos Monkey"],
      pitfalls: ["Retry on non-idempotent calls (double charges)", "Bulkhead too small for normal traffic"] },
    "p8w48.0": { tags: ["OpenTelemetry", "Distributed Tracing"], estHours: 5 },
    "p8w49.0": { tags: ["Event Sourcing", "Axon"], estHours: 7,
      stretchGoals: ["Add a projection rebuild CLI", "Snapshot strategy for big aggregates"],
      pitfalls: ["Event schemas changed in place (replays break)", "Storing derived state in the aggregate"] },
    "p8w50.0": { tags: ["Saga", "Compensation"], estHours: 7,
      stretchGoals: ["Compare orchestration vs choreography for the same flow", "Add visualisation of saga state"],
      pitfalls: ["Compensations that aren't truly inverse", "Saga state lost on restart"] },

    "p9w51.0": { tags: ["Interview Patterns"], estHours: 4 },
    "p9w52.0": { tags: ["LeetCode", "DSA"], estHours: 6 },
    "p9w53.0": { tags: ["Capstone", "Architecture"], estHours: 8,
      stretchGoals: ["Add a public status page", "Plan a multi-region deploy"],
      pitfalls: ["Scope creep — cut features ruthlessly", "Skipping the deep-dives part (where interview gold lives)"] },
    "p9w53.1": { tags: ["Capstone", "Implementation"], estHours: 30,
      stretchGoals: ["Add chaos test (kill a service mid-flow)", "Multi-region deploy"],
      pitfalls: ["Skipping observability (debugging hell later)", "Manual deploys"] },
    "p9w54.0": { tags: ["Capstone", "Portfolio"], estHours: 6 },
  },
};

// ── Inferred defaults — applied when no explicit entry exists ─────────────────
function defaultsFor(difficulty: string): Enrichment {
  switch (difficulty) {
    case "beginner":     return { estHours: 2, tags: ["Foundations"] };
    case "intermediate": return { estHours: 4, tags: [] };
    case "advanced":     return { estHours: 6, tags: [] };
    default:             return { estHours: 4, tags: [] };
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Enrich build_specs — ${apply ? "APPLY" : "DRY RUN"}`);

  let updated = 0, defaulted = 0;

  for (const lang of ["python", "java"] as const) {
    const phases    = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, lang)).orderBy(asc(roadmapPhases.phaseNumber));
    const weeks     = await db.select().from(roadmapWeeks);
    const sessions  = await db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder));
    const resources = await db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder));

    const weeksByPhase = new Map<number, typeof weeks>();
    weeks.forEach((w) => { const a = weeksByPhase.get(w.phaseId) ?? []; a.push(w); weeksByPhase.set(w.phaseId, a); });
    const sessionsByWeek = new Map<number, typeof sessions>();
    sessions.forEach((s) => { const a = sessionsByWeek.get(s.weekId) ?? []; a.push(s); sessionsByWeek.set(s.weekId, a); });
    const resourcesBySession = new Map<number, typeof resources>();
    resources.forEach((r) => { const a = resourcesBySession.get(r.sessionId) ?? []; a.push(r); resourcesBySession.set(r.sessionId, a); });

    // Pull current specs so we can look up difficulty
    const existing = await db.select().from(buildSpecs).where(eq(buildSpecs.language, lang));
    const specByKey = new Map(existing.map((s) => [s.resourceKey, s]));

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
            const explicit = ENRICH[lang][tag] ?? {};
            const useDefaults = Object.keys(explicit).length === 0;
            if (useDefaults) defaulted++; else updated++;
            const eff = useDefaults ? defaultsFor(spec.difficulty) : explicit;

            if (!apply) continue;
            await db.update(buildSpecs)
              .set({
                stretchGoals:  eff.stretchGoals  ?? [],
                pitfalls:      eff.pitfalls      ?? [],
                estHours:      eff.estHours      ?? 0,
                tags:          eff.tags          ?? [],
                prerequisites: eff.prerequisites ?? [],
                references:    eff.references    ?? [],
              })
              .where(and(eq(buildSpecs.language, lang), eq(buildSpecs.resourceKey, key)));
          }
        }
      }
    }
  }

  console.log(`  Explicit enrichments: ${updated}`);
  console.log(`  Defaulted (basic):    ${defaulted}`);
  if (!apply) console.log(`Run with --apply to commit.`);
  else        console.log(`✅ Enrichment applied`);
}

main().catch((err) => {
  console.error("❌ Enrichment failed:", err);
  process.exit(1);
});
