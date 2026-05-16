// ── Seed Java build_specs ──────────────────────────────────────────────────────
// Hand-authored specs for the highest-value Java builds (LLD classics + Spring
// Boot CRUD + Kafka + capstone). Other Java builds keep the existing fallback —
// ResourceCard renders the raw item text when no spec exists.
//
// Keyed by exact item text. The seed walks the Java roadmap, matches item →
// spec, and writes to build_specs keyed by (language="java", resourceKey=resId).
//
// Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { buildSpecs, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../src/db/schema.js";
import { eq, asc } from "drizzle-orm";

interface SpecLike {
  difficulty:   "beginner" | "intermediate" | "advanced";
  overview:     string;
  requirements: string[];
  acceptance:   string[];
  diagram?:     string;
  hints?:       string[];
}

function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

// Keyed by `pPwW.B` where P=phase, W=week, B=0-based index of the Build resource
// within that week (in declaration order). This is stable across minor item-text
// edits — only structural roadmap reshuffles invalidate the keys.
const JAVA_SPECS: Record<string, SpecLike> = {

  "p1w1.0": {
    difficulty: "intermediate",
    overview:
      "Build a small order-domain library using modern Java: Records for value objects, sealed interfaces for closed result hierarchies, and switch-expression pattern matching. This cements why these features exist beyond syntactic sugar.",
    requirements: [
      "`record Money(BigDecimal amount, Currency currency)` with compact constructor that rejects negative amounts",
      "`sealed interface Result<T> permits Ok, Err` with `Ok<T>(T value)` and `Err<T>(String reason)` records",
      "A `processOrder(...)` method that returns `Result<Order>` and is consumed via a switch-expression on the sealed type",
      "Use pattern matching for instanceof in at least one place where it shortens the code",
    ],
    acceptance: [
      "Construction of an invalid Money (negative amount, null currency) throws",
      "All Result handling is exhaustive — adding a new permitted subtype causes a compile error in switch",
      "javac -Xlint:all is clean",
      "Records have correct equals/hashCode/toString without manual overrides",
    ],
    hints: [
      "Compact constructors are great for invariant checks — put validation there, not in static factories",
      "Sealed types only work if all permitted types are in the same module / package — declare them next to the interface",
    ],
  },

  "p1w6.0": {
    difficulty: "intermediate",
    overview:
      "Implement five interview classics using only the JDK collections. The point isn't novelty — it's picking the right container per access pattern and explaining the time/space cost.",
    requirements: [
      "`LRUCache<K, V>` extending LinkedHashMap with removeEldestEntry — O(1) get/put",
      "`topK(int[] nums, int k)` using a min-heap of size k — O(n log k)",
      "`slidingWindowMax(int[] nums, int k)` using ArrayDeque — O(n) amortised",
      "`wordFrequency(String text)` returning sorted-by-count then alphabetical",
      "`groupAnagrams(String[] words)` by sorted-chars hash key",
    ],
    acceptance: [
      "Each function has JUnit 5 tests covering empty, single-element, and large inputs",
      "Big-O is asserted in javadoc and matched by a quick benchmark",
      "LRU eviction order is stable and tested with deterministic insertion sequences",
    ],
    hints: [
      "LinkedHashMap with `accessOrder=true` is the trick for LRU — don't write your own list",
      "ArrayDeque outperforms LinkedList for FIFO/LIFO every time — prefer it",
    ],
  },

  "p2w11.0": {
    difficulty: "intermediate",
    overview:
      "Implement the canonical Parking Lot LLD problem. The interviewer wants to see Strategy, enum-driven dispatch, clean entity boundaries, and concurrency-aware spot allocation.",
    requirements: [
      "Entities: ParkingLot → List<Level> → List<Spot>; Vehicle hierarchy; Ticket with entry timestamp",
      "Spot.type ∈ {COMPACT, LARGE, MOTORCYCLE}; matching policy per vehicle type",
      "`ParkingStrategy` interface with implementations NearestFirst + RandomAvailable",
      "`FeeStrategy` for hourly vs flat-rate pricing",
      "Thread-safe spot allocation — two cars cannot claim the same spot",
    ],
    acceptance: [
      "JUnit covers: full lot rejects, motorcycle in any spot, large vehicle requires LARGE, concurrent park calls (10 threads, no double-allocation)",
      "Switching strategies requires zero changes to ParkingLot internals",
      "All collections returned from public methods are unmodifiable",
    ],
    diagram: `
  ┌─────────────────────────────────────┐
  │           ParkingLot                │
  │ - levels: List<Level>               │
  │ - strategy: ParkingStrategy         │
  │ + park(Vehicle): Ticket             │
  │ + leave(Ticket): Fee                │
  └──────────┬──────────────────────────┘
             │ 1..*
             ▼
        ┌──────────┐      ┌─────────────────┐
        │  Level   │──*──▶│      Spot       │
        │ - number │      │ - type: SpotType│
        │ - spots  │      │ - isFree: bool  │
        └──────────┘      └─────────────────┘`,
    hints: [
      "Use a per-spot ReentrantLock or a single ConcurrentSkipListSet of free spots — pick one and justify",
      "Don't model fee calculation inside Spot — it belongs in FeeStrategy",
    ],
  },

  "p2w11.1": {
    difficulty: "intermediate",
    overview:
      "Library management LLD with multiple membership tiers, loan limits, reservation queues, and overdue fines. Show composition (loan rules as injected policies) instead of subclassing Member.",
    requirements: [
      "Book, Member, Loan, Reservation entities with clear ownership",
      "LoanPolicy injected per member type — Standard (5 books, 14 days), Premium (10 books, 30 days)",
      "FineCalculator strategy for late returns",
      "Observer pattern: members get notified when a reserved book is returned",
      "Concurrency-safe reservation queue per book",
    ],
    acceptance: [
      "Loan limits are enforced per policy without conditionals in Member",
      "Tests: borrow at limit fails, premium upgrade increases limit, fine calculation matches the policy table, observer fires exactly once per return",
    ],
    hints: [
      "Resist the urge to `class PremiumMember extends Member` — make policy a field instead",
      "Use BlockingQueue or a synchronized PriorityQueue for the reservation list",
    ],
  },

  "p2w12.0": {
    difficulty: "intermediate",
    overview:
      "Classic State-pattern problem. The ATM behaves entirely differently per state — write each state as its own class implementing a common interface.",
    requirements: [
      "ATMState sealed interface with IdleState, CardInsertedState, PinEnteredState, AmountEnteredState, DispensingState",
      "Each state implements `next(ATM, Event)` and rejects illegal transitions",
      "ATM holds CashInventory; dispensing reduces it atomically",
      "Transaction history persisted in memory (in-memory list is fine)",
      "Cancel from any state returns to IDLE and ejects card",
    ],
    acceptance: [
      "Tests: every legal transition, every illegal transition rejected, cash inventory drops correctly, wrong-pin attempts lock card after 3",
      "Adding a new state requires editing only the state itself + the predecessor — no central if/else cascade",
    ],
    hints: [
      "Make ATMState immutable; state object holds the next state, not the ATM",
      "Use sealed interface so the compiler enforces exhaustive switching",
    ],
  },

  "p3w13.0": {
    difficulty: "beginner",
    overview:
      "Greenfield Spring Boot project that exercises DI, profiles, and Actuator. Use it as the foundation for the next two weeks of work.",
    requirements: [
      "`spring init` or Maven archetype → Spring Boot 3.x, Java 21",
      "Two profiles: dev (H2, debug logging) and prod (Postgres, INFO logging)",
      "@Service with one @Singleton bean and one @Scope(\"prototype\") bean — explain difference",
      "Custom HealthIndicator that fails when a downstream URL isn't reachable",
      "Actuator /info, /health, /metrics enabled and reachable",
    ],
    acceptance: [
      "`SPRING_PROFILES_ACTIVE=dev` and `=prod` both boot cleanly with different DBs",
      "`curl /actuator/health` returns DOWN when the downstream is killed and UP when it returns",
      "Constructor-DI everywhere; no @Autowired on fields",
    ],
    hints: [
      "Constructor DI gives you final fields and easier testing — never accept field DI in code review",
      "Use @ConditionalOnProperty for feature flags instead of profiles where possible",
    ],
  },

  "p3w14.0": {
    difficulty: "intermediate",
    overview:
      "Build a complete CRUD REST API the way you'd ship it at work. Validation at the boundary, structured errors, generated OpenAPI docs, and tests that catch real regressions.",
    requirements: [
      "Resource: Product (id, name, price, stockCount). CRUD endpoints follow REST conventions",
      "DTO + entity separation; MapStruct or manual mapping",
      "@Valid + Bean Validation annotations on request DTOs (NotBlank, Positive, etc.)",
      "@ControllerAdvice returns RFC 7807 Problem JSON for 400/404/500 — never a stack trace",
      "OpenAPI 3 spec served at /v3/api-docs and Swagger UI at /swagger-ui.html",
    ],
    acceptance: [
      "Validation failure returns 400 with field-level errors in Problem JSON shape",
      "Test suite: happy path, validation error, 404, optimistic-lock conflict",
      "OpenAPI spec includes every endpoint with correct request/response schemas",
    ],
    hints: [
      "Spring's default ResponseEntityExceptionHandler already does most of the RFC 7807 work — extend it, don't replace it",
      "Use Spring Data's optimistic locking via @Version to detect concurrent updates",
    ],
  },

  "p3w15.0": {
    difficulty: "advanced",
    overview:
      "Real JPA modelling: bi-directional relationships without N+1, dynamic search via Specifications, and migrations managed by Flyway from day one.",
    requirements: [
      "Entities: User, Order, OrderItem, Product with FetchType.LAZY everywhere except hot paths",
      "@EntityGraph used to eagerly load the Order's items when needed",
      "JpaSpecificationExecutor with composable Specifications for filtering orders by status/date/min total",
      "Flyway: V1__init.sql baseline, V2__add_index, V3__seed_demo_data",
      "Postgres in docker-compose; integration tests with Testcontainers",
    ],
    acceptance: [
      "No N+1 on the main listing endpoint (verified via SQL log)",
      "Dynamic search composes 3+ predicates without conditional SQL",
      "Flyway runs migrations in CI; rollback strategy documented",
    ],
    hints: [
      "Use Hibernate's `spring.jpa.properties.hibernate.generate_statistics=true` + a log appender to spot N+1",
      "Prefer Specifications over QueryDSL until you actually need QueryDSL — fewer moving parts",
    ],
  },

  "p3w16.0": {
    difficulty: "intermediate",
    overview:
      "Bolt JWT auth onto your existing CRUD API. This is the most-asked Spring Security feature in interviews because almost everyone gets one of the pieces wrong.",
    requirements: [
      "BCrypt password encoder for user passwords",
      "/auth/login returns a JWT with claims: sub, roles, exp",
      "JwtAuthFilter parses the token, populates SecurityContext per request",
      "SecurityFilterChain: /auth/** is open, /admin/** requires ROLE_ADMIN, everything else requires auth",
      "@PreAuthorize on a couple of methods to show fine-grained checks",
    ],
    acceptance: [
      "Missing/invalid token → 401 with Problem JSON",
      "Wrong role → 403",
      "Token replay after expiry rejected",
      "BCrypt cost factor ≥ 12; passwords never stored in plaintext anywhere (including logs)",
    ],
    hints: [
      "Store the secret as an environment variable + use HS256 only if you control both sides; otherwise RS256",
      "Don't put PII in JWT claims — it's base64, not encrypted",
    ],
  },

  "p4w23.0": {
    difficulty: "advanced",
    overview:
      "End-to-end event-driven flow across three services. The interview gold here is idempotent consumers, retry with backoff, and a dead-letter queue for messages you can't process.",
    requirements: [
      "Order publishes `OrderPlaced` to topic `orders` with order-id as partition key",
      "Inventory consumer is idempotent: same OrderPlaced replayed twice produces one reservation",
      "Failures: retry with exponential backoff up to N attempts then route to `orders.DLQ`",
      "StockReserved triggers Email service via topic `notifications`",
      "Use docker-compose for Kafka + ZooKeeper + your services",
    ],
    acceptance: [
      "Killing the inventory consumer mid-batch and restarting does not double-reserve",
      "Poison message (malformed JSON) ends up in DLQ after configured retries, not blocking the partition",
      "Throughput: 1k orders/sec on local Kafka with reasonable consumer count",
    ],
    hints: [
      "Persist (consumer-group, order-id) somewhere durable to enforce idempotency — Redis SETNX or a DB unique index both work",
      "Avoid synchronous calls between services — that's a microservices anti-pattern",
    ],
  },

  "p6w33.0": {
    difficulty: "advanced",
    overview:
      "Full HLD: WebSocket fan-in, presence service, message storage tiering, fanout for groups, and delivery semantics. Walk through it like an interview.",
    requirements: [
      "Connection layer: WebSocket gateway sticky-routing users to one of N chat-service pods",
      "Presence: heartbeat + Redis TTL, eventual broadcast to friends",
      "Per-conversation Kafka topic (or sharded global topic) for ordering",
      "Storage tiering: hot (last 30 days, NoSQL), cold (S3 + Parquet)",
      "Delivery receipts: separate ACK channel; group receipts aggregated",
      "Estimation: 1B users × ~40 msgs/day → storage, bandwidth, fanout cost",
    ],
    acceptance: [
      "Diagram shows write path, read path, presence path, and DLQ for failed deliveries",
      "Estimate within 2× of reality on storage + QPS",
      "Trade-offs discussed: at-most-once vs at-least-once, group fanout cost, presence accuracy vs cost",
    ],
    hints: [
      "Don't store every read receipt — aggregate at the group level for large groups",
      "Connection-pinning via consistent hashing of user-id → chat pod avoids gossip cost",
    ],
  },

  "p6w34.0": {
    difficulty: "intermediate",
    overview:
      "Build the data structure that every key-value store and load balancer relies on. After this you can sketch DynamoDB's request routing on a whiteboard.",
    requirements: [
      "`ConsistentHashRing<T>` with TreeMap<Long, T> as the ring",
      "Each physical node maps to N virtual nodes — default 150",
      "`addNode(T)`, `removeNode(T)`, `getNode(String key)` operations",
      "Use a stable hash (MurmurHash3 or SHA-256 prefix) — explain why CRC32 isn't great",
      "Benchmark: with 10 nodes and 1M keys, removing 1 node should reassign ~10% of keys, not 100%",
    ],
    acceptance: [
      "JUnit: adding a node moves only the expected slice; removing redistributes correctly",
      "Benchmark confirms reassignment ratio matches theory within tolerance",
      "1-page writeup explains virtual nodes' role in load balance",
    ],
    hints: [
      "TreeMap.ceilingEntry is the magic lookup — falls through to firstEntry() when past the last node",
      "Pin the hash function — changing it later invalidates every existing key placement",
    ],
  },

  "p7w39.0": {
    difficulty: "intermediate",
    overview:
      "Containerise a real Spring Boot app the right way. Multi-stage build cuts the image from gigabytes to <200 MB; compose orchestrates the full local stack.",
    requirements: [
      "Stage 1: maven:3.9-eclipse-temurin-21 builds the JAR with -DskipTests",
      "Stage 2: eclipse-temurin:21-jre-alpine copies only the runnable jar",
      "`.dockerignore` excludes target/, .git, IDE folders",
      "docker-compose: app, postgres, redis, kafka, zookeeper with healthchecks + depends_on conditions",
      "App reads DB URL etc from environment, never hard-coded",
    ],
    acceptance: [
      "`docker images` shows the runtime image < 200 MB",
      "`docker compose up` brings the stack up; app waits for DB healthy before booting",
      "Killing the DB while app runs → app fails health check; restart restores",
    ],
    hints: [
      "Layer caching: copy pom.xml first, run `mvn dependency:go-offline`, then copy src. Saves minutes on rebuilds.",
      "Use a non-root user in the runtime stage — security baseline",
    ],
  },

  "p9w53.0": {
    difficulty: "advanced",
    overview:
      "Capstone phase — architect a non-trivial system you can defend in an interview. Pick three components to go deep on instead of skimming everything.",
    requirements: [
      "Architecture diagram (Excalidraw) showing every service + every async edge",
      "API Gateway: rate limiting, routing rules, JWT validation",
      "Auth service: token issuance, refresh tokens, revocation strategy",
      "Order service: saga for the place-order flow with compensating actions",
      "Pick 3 deep-dives (e.g. saga coordinator, Kafka partition strategy, gateway rate limiting) and write 1 page each",
    ],
    acceptance: [
      "Diagram + 3 deep-dive docs in repo",
      "Each deep-dive includes alternatives considered and the reason for the choice",
      "Estimation: per-service QPS, per-service storage growth, blast radius",
    ],
    hints: [
      "Two-phase commit is rarely the right answer. Sagas with compensating actions almost always win.",
      "Pick deep-dives where you genuinely don't know the answer yet — that's where the learning is.",
    ],
  },

  // ── Phase 1: Java Core ──────────────────────────────────────────────────────
  "p1w2.0": {
    difficulty: "intermediate",
    overview: "Use the Streams API to transform a real dataset end-to-end without external libraries. The point: see when streams are clearer than loops and when they aren't.",
    requirements: [
      "Read a CSV (~10k rows: order_id, customer, item, qty, price)",
      "Use Stream.filter / map / groupingBy / summarizingDouble for aggregates",
      "Output a formatted report: top-5 customers by spend, daily revenue, top-3 items",
      "No external libs — only JDK",
    ],
    acceptance: [
      "Stream pipeline is single-pass where possible",
      "Output matches a hand-computed sample for 100 rows",
      "Profile with VisualVM: GC pressure stays low",
    ],
  },
  "p1w3.0": {
    difficulty: "intermediate",
    overview: "Classic producer-consumer with bounded queue + graceful shutdown. Teaches thread-pool sizing, backpressure, and poison-pill termination.",
    requirements: [
      "ExecutorService with fixed thread pool of N producers + M consumers",
      "LinkedBlockingQueue with capacity bound (backpressure)",
      "Poison-pill: shutdown drains queue then exits cleanly",
      "Track per-thread throughput, no busy-wait",
    ],
    acceptance: [
      "Producer throttles when queue full (no OOM)",
      "Shutdown drains + joins all threads in < 5 sec",
      "Counter at exit = total enqueued (no lost messages)",
    ],
    hints: ["Always shutdown the executor in a finally block — interrupts propagate correctly only then"],
  },
  "p1w4.0": {
    difficulty: "intermediate",
    overview: "Compose async calls with CompletableFuture. Show the right way to handle timeouts, partial failures, and result aggregation.",
    requirements: [
      "Call 3 mock HTTP services in parallel via supplyAsync on a custom Executor",
      "Use allOf + thenApply to combine results",
      "Timeout per call (orTimeout) + fallback on failure",
      "Compare against the same flow written with virtual threads (Java 21)",
    ],
    acceptance: [
      "All-3 wall-clock = max(call_latency), not sum",
      "One slow call doesn't block the others",
      "Fallback value used when one call times out, other two return real data",
    ],
  },

  // ── Phase 2: LLD ────────────────────────────────────────────────────────────
  "p2w7.0": {
    difficulty: "intermediate",
    overview: "Take a 300-line God-class and refactor it to SOLID. The before/after diff is the deliverable — show what each principle bought you.",
    requirements: [
      "Start file: provided messy OrderProcessor with DB calls, validation, pricing, notification all inline",
      "SRP: split into OrderRepository, PricingEngine, NotificationService, OrderProcessor (orchestrator)",
      "OCP: new order type (subscription) added without modifying processor",
      "DIP: inject dependencies, no `new` inside business logic",
    ],
    acceptance: [
      "Tests pass identically before + after refactor",
      "Adding a new pricing strategy touches 1 new file only",
      "Each class < 100 lines",
    ],
  },
  "p2w8.0": {
    difficulty: "intermediate",
    overview: "Notifications need a creational pattern combo: factory for routing, builder for complex config. Implement both in one cohesive module.",
    requirements: [
      "NotificationFactory.create(channel) returns Email/SMS/PushNotifier per enum",
      "NotificationConfig.builder().subject().body().attachment().build()",
      "Builder enforces required fields at build-time",
      "All concrete notifiers implement a single Notifier interface",
    ],
    acceptance: [
      "Adding a new channel requires touching only the factory + new class",
      "Builder rejects partial config (missing subject → compile-time error via staged builder, or runtime)",
    ],
  },
  "p2w9.0": {
    difficulty: "advanced",
    overview: "Use JDK Dynamic Proxy + functional interfaces to build a caching layer + a logging decorator. Demonstrates Java's reflection APIs at a useful depth.",
    requirements: [
      "Proxy.newProxyInstance wrapping a Repository interface — caches reads",
      "Logging decorator measures call latency + logs structured JSON",
      "Cache uses ConcurrentHashMap with per-key TTL",
      "Functional interface for the policy: `interface CachePolicy<K,V>` — decides cache vs bypass",
    ],
    acceptance: [
      "Cache hit returns in < 1 ms vs DB call ~ 50 ms (benchmark)",
      "Logging adds < 5% overhead",
      "Switching policies (LRU vs FIFO vs none) requires no proxy changes",
    ],
  },
  "p2w10.0": {
    difficulty: "intermediate",
    overview: "Order lifecycle as a State machine with Observer for transitions and Command for undo/redo. Three patterns one domain.",
    requirements: [
      "States: CREATED → PAID → SHIPPED → DELIVERED → CANCELLED",
      "Observer notifies inventory + email on every transition",
      "Command stack supports undo (refund, restock) within a 1-hour window",
      "Illegal transitions throw; legal ones are explicit",
    ],
    acceptance: [
      "Tests cover every valid transition + a few invalid ones",
      "Undo within window restores prior state + side-effects",
      "Observers can be added without modifying State classes",
    ],
  },
  "p2w12.1": {
    difficulty: "beginner",
    overview: "Write a 1-page LLD design doc for each of your three LLD projects. The doc is the interview deliverable — practice it.",
    requirements: [
      "Sections: Problem, Key Classes, Class Diagram, Trade-offs, Edge Cases",
      "Class diagram drawn in Excalidraw or PlantUML",
      "Trade-offs section explains alternatives you rejected and why",
    ],
    acceptance: [
      "Doc is readable cold by a senior engineer in < 5 min",
      "Diagram shows associations, not just inheritance",
    ],
  },

  // ── Phase 3: Spring Boot ────────────────────────────────────────────────────
  "p3w17.0": {
    difficulty: "intermediate",
    overview: "Layered testing strategy: unit (Mockito), slice (@WebMvcTest), integration (Testcontainers). Each layer tests what only that layer can.",
    requirements: [
      "Service-layer unit tests with Mockito — no Spring context",
      "@WebMvcTest for controllers — full MVC slice, mocked services",
      "Integration test with @SpringBootTest + Testcontainers Postgres",
      "JaCoCo report; aim for 80%+ line coverage",
    ],
    acceptance: [
      "Unit suite runs < 5 sec",
      "Slice tests run < 15 sec",
      "Integration suite runs < 60 sec",
      "Coverage report opens in browser",
    ],
  },
  "p3w18.0": {
    difficulty: "intermediate",
    overview: "GitHub Actions pipeline that catches problems before code hits main. Treat every warning as an error.",
    requirements: [
      "Workflow: checkout → cache .m2 → compile → unit tests → JaCoCo (fail if < 80%) → docker build → push to GHCR",
      "Run on push + pull_request to main",
      "Cache key includes pom.xml hash",
      "Artifact uploaded on failure for debugging",
    ],
    acceptance: [
      "PR with failing test cannot merge",
      "Image tag = short SHA, pushed only on main",
      "Workflow finishes < 6 min cold, < 2 min warm",
    ],
  },

  // ── Phase 4: Databases ──────────────────────────────────────────────────────
  "p4w21.0": {
    difficulty: "intermediate",
    overview: "Real-time leaderboard with Redis sorted sets. Cement ZADD/ZRANGE/ZRANK + distributed locking + TTL-based session cache.",
    requirements: [
      "ZADD player_id score for game events",
      "Top-10 via ZREVRANGE 0 9 WITHSCORES",
      "Player rank via ZREVRANK player_id",
      "Distributed lock via SET key NX EX for end-of-round scoring",
      "Session cache with EXPIRE for 30-min auto-logout",
    ],
    acceptance: [
      "Leaderboard query < 5 ms for 1M players",
      "Concurrent updates from 100 clients don't lose scores",
      "Lock expires automatically if the holder crashes",
    ],
  },
  "p4w22.0": {
    difficulty: "intermediate",
    overview: "Add Flyway to a real Spring Boot project. Practice the migration patterns that don't lock production tables.",
    requirements: [
      "V1__init: baseline schema for an existing DB",
      "V2__add_user_idx: add an index CONCURRENTLY (Postgres-specific)",
      "V3__rename_column: 3-step rename — add new, dual-write, drop old",
      "V4__split_table: extract a child table without downtime",
      "Rollback strategy documented per migration",
    ],
    acceptance: [
      "Each migration runs on a 10M-row test DB without table-level lock > 5 sec",
      "Flyway info shows clean ledger",
      "Down migrations (if used) tested and reversible",
    ],
  },
  "p4w24.0": {
    difficulty: "advanced",
    overview: "Same query, three transports: REST, GraphQL, gRPC. Benchmark them and write the case for picking one per use case.",
    requirements: [
      "Expose product search via Spring Web (REST), Spring for GraphQL, and Spring gRPC",
      "Identical underlying service",
      "Benchmark with wrk or k6: latency p50/p99, payload size, throughput",
      "Writeup: which protocol wins for browser, mobile, internal-service callers",
    ],
    acceptance: [
      "All three return the same data given the same query",
      "Benchmark numbers in a table, with conditions documented",
      "GraphQL avoids over-fetching for a partial-field query",
    ],
  },

  // ── Phase 5: System Design Theory ───────────────────────────────────────────
  "p5w26.0": {
    difficulty: "intermediate",
    overview: "Pick the right isolation level per workload. Defend each choice with concurrency examples.",
    requirements: [
      "4 systems: bank transfer, social feed, shopping cart, analytics dashboard",
      "Pick isolation level + justify (anomaly each prevents)",
      "Show a concrete concurrency anomaly for each system if level is wrong",
    ],
    acceptance: [
      "Each choice references the exact anomaly avoided (dirty/non-repeatable/phantom)",
      "Bank transfer = SERIALIZABLE or with row locks + explanation",
    ],
  },
  "p5w27.0": {
    difficulty: "intermediate",
    overview: "Compare ZooKeeper, etcd, and Redis Sentinel as coordination primitives. Pick the right one per use case.",
    requirements: [
      "Document: consistency guarantee, leader election semantics, watch/notification model",
      "When to pick each (small example: K8s control plane, microservice config, cache failover)",
      "Failure model: what happens during network partition",
    ],
    acceptance: [
      "Table comparing 3 systems on 6 axes",
      "Each pick traceable to a guarantee (linearizable vs eventual)",
    ],
  },
  "p5w29.0": {
    difficulty: "intermediate",
    overview: "Real load-balanced setup locally: nginx fronting 2 Spring Boot replicas with health checks + gzip + static asset serving.",
    requirements: [
      "docker-compose: nginx + 2 spring-boot replicas + postgres",
      "Nginx upstream block with health checks",
      "gzip on responses > 1 KB",
      "Static assets served from nginx, not Spring",
      "Kill one replica → traffic routes to the other within health-check interval",
    ],
    acceptance: [
      "wrk -t4 -c100 sustains > 5k req/s for / endpoint",
      "Killing one replica drops 0 requests after the next health check",
    ],
  },
  "p5w30.0": {
    difficulty: "intermediate",
    overview: "Back-of-envelope estimation for Twitter scale. Practice the numbers an HLD interview demands cold.",
    requirements: [
      "Estimate: DAU, tweets/day, read:write ratio (≈100:1), storage/year, bandwidth (in & out)",
      "Show working — not just final numbers",
      "Convert: avg tweet size × tweets/year → bytes → TB",
      "Identify the hot path that dominates cost",
    ],
    acceptance: [
      "Numbers within 2× of public estimates (200M DAU baseline)",
      "Each estimate has an assumption line",
    ],
  },

  // ── Phase 6: HLD Case Studies ───────────────────────────────────────────────
  "p6w31.0": {
    difficulty: "intermediate",
    overview: "Design bit.ly from scratch in 45 minutes. The interview classic — keep it tight.",
    requirements: [
      "API: POST /shorten {url} → {shortCode}, GET /:code → 302",
      "ID generation: base62 of an autoincrement, or hash-with-collision-handling",
      "Storage: KV (DynamoDB) or SQL (Postgres) — pick + justify",
      "Cache: Redis for hot codes",
      "Estimate: 500M URLs, 10:1 read:write, storage/year",
    ],
    acceptance: [
      "Diagram in Excalidraw with API gateway, app, cache, DB",
      "ID generation can't produce duplicates",
      "Hot URL fetched in < 10 ms",
    ],
  },
  "p6w31.1": {
    difficulty: "intermediate",
    overview: "Pastebin variant — different storage profile (large blobs, low write QPS, high view spikes).",
    requirements: [
      "S3 for paste content (cheap, big)",
      "Postgres metadata: shortCode, owner, expiry, view count",
      "CDN for popular pastes (cache by shortCode)",
      "Expiry job: background cron deletes expired pastes",
    ],
    acceptance: [
      "Diagram + storage estimate (avg paste 5 KB × 100M = 500 GB / yr)",
      "Reasoning for splitting content (S3) from metadata (Postgres)",
    ],
  },
  "p6w32.0": {
    difficulty: "advanced",
    overview: "Full Twitter HLD: feed, fanout, cache, search. The 200M-DAU case study.",
    requirements: [
      "Hybrid fanout: write-fanout for normal users, read-fanout for celebrities",
      "Redis timeline cache per user, capped at 800 tweets",
      "Media to CDN, metadata to Cassandra",
      "Like/retweet counters: Redis HINCR + async flush to DB",
      "Search via Elastic with eventual indexing",
    ],
    acceptance: [
      "Diagram covers write path, read path, search, media",
      "Estimate: storage/year, peak QPS, fanout cost for top celeb",
    ],
  },
  "p6w35.0": {
    difficulty: "intermediate",
    overview: "Typeahead suggestions at Google scale. Trie + aggregation pipeline + hot-query cache.",
    requirements: [
      "Prefix trie in-memory for current top-N suggestions",
      "Aggregation pipeline: queries → Kafka → batch job → updated trie nightly",
      "Hot-query cache (Redis) for top 10k queries — sub-ms read",
      "Decide: server-side trie vs CDN edge cache",
    ],
    acceptance: [
      "Diagram + p99 latency target (< 100 ms end-to-end)",
      "Trade-off: real-time vs batched updates",
    ],
  },
  "p6w36.0": {
    difficulty: "advanced",
    overview: "YouTube HLD: upload, transcode pipeline, CDN, view count, recommendations. The reference video-system design.",
    requirements: [
      "Upload to S3-style blob; async transcoding via Kafka jobs",
      "Multiple bitrates produced; HLS manifest generated",
      "CDN fronts every view; origin only on cache miss",
      "View count: Redis HINCR with periodic flush",
      "Recommendations: offline batch with online ranking layer",
    ],
    acceptance: [
      "Diagram + storage estimate",
      "Trade-off on encoding (h264 vs av1) and ladder choice",
    ],
  },
  "p6w37.0": {
    difficulty: "advanced",
    overview: "Uber HLD: driver matching, real-time tracking, surge pricing, saga payments. The hardest of the classic interviews.",
    requirements: [
      "Geohash-based driver-index for nearest-k lookup",
      "WebSocket connections for live trip tracking",
      "Surge pricing: separate microservice with demand/supply signals",
      "Trip payment via saga: charge rider → pay driver → close trip",
      "Idempotent endpoints throughout",
    ],
    acceptance: [
      "Diagram with all major services + their data stores",
      "Estimate: drivers per region, lookup QPS, WebSocket connection count",
      "Saga compensation path documented",
    ],
  },
  "p6w38.0": {
    difficulty: "beginner",
    overview: "Synthesise everything from Phase 6 into a 1-page lessons-learned doc.",
    requirements: [
      "Top 5 things you do differently now vs week 31",
      "Each lesson rooted in one HLD problem you got wrong first time",
    ],
    acceptance: [
      "Document is < 1 page",
      "Lessons are specific (e.g. 'always clarify scope before estimating'), not vague",
    ],
  },

  // ── Phase 7: Infra & Cloud ──────────────────────────────────────────────────
  "p7w40.0": {
    difficulty: "intermediate",
    overview: "Helm chart for the capstone services. Deployment + HPA + ConfigMap + Secrets + Ingress.",
    requirements: [
      "Chart structure: values.yaml + templates/",
      "Deployment with rollingUpdate strategy",
      "HPA: scale 2 → 10 on CPU 70%",
      "ConfigMap for non-secret app props; Secret for DB password",
      "Ingress with TLS termination",
    ],
    acceptance: [
      "`helm install` deploys to minikube cleanly",
      "Scale-up triggered by stress test (vegeta hammering /)",
      "Secret never appears in `kubectl describe`",
    ],
  },
  "p7w41.0": {
    difficulty: "intermediate",
    overview: "Full production-grade pipeline: build → test → quality gate → image push → Helm upgrade. With approval before prod.",
    requirements: [
      "Stages: build → test → JaCoCo gate (80%) → SonarQube → docker build/push → helm upgrade staging",
      "Manual approval before helm upgrade prod",
      "Slack notification on failure",
      "Image tag = git short SHA",
    ],
    acceptance: [
      "Failed test blocks deployment",
      "Sonar gate flags real issues (not just style)",
      "Staging deploy auto; prod requires button press",
    ],
  },
  "p7w42.0": {
    difficulty: "intermediate",
    overview: "Observability triad on the capstone: metrics (Micrometer→Prometheus), logs (structured JSON), traces (OTel→Jaeger). Dashboards for each.",
    requirements: [
      "Micrometer Counter + Timer on key endpoints",
      "Prometheus scrapes /actuator/prometheus",
      "Grafana dashboard: p50/p99 latency, error rate, QPS",
      "Structured JSON logs (Logback encoder)",
      "OpenTelemetry agent injects trace context across services",
    ],
    acceptance: [
      "Grafana dashboard loads with real data",
      "A slow trace is locatable in Jaeger by user-id correlation",
      "Logs queryable by trace-id",
    ],
  },
  "p7w43.0": {
    difficulty: "intermediate",
    overview: "AWS basics for Spring devs: S3 upload, SQS consumer, DynamoDB sessions. LocalStack for dev.",
    requirements: [
      "S3 file-upload endpoint (multipart, presigned URLs for downloads)",
      "SQS consumer with Spring Cloud AWS",
      "DynamoDB single-table for session storage",
      "LocalStack docker-compose for local dev",
    ],
    acceptance: [
      "Upload + download works end-to-end against LocalStack",
      "SQS consumer retries with backoff + DLQ",
      "DynamoDB queries < 10 ms with proper PK design",
    ],
  },
  "p7w44.0": {
    difficulty: "advanced",
    overview: "Provision the capstone stack with Terraform. VPC, ECS, RDS, ALB — all from code.",
    requirements: [
      "VPC with public + private subnets across 2 AZs",
      "ECS Fargate service for Spring Boot",
      "RDS Postgres Multi-AZ in private subnets",
      "ALB in public subnets fronting ECS",
      "Remote state in S3 with DynamoDB lock",
    ],
    acceptance: [
      "`terraform apply` from scratch deploys the whole stack",
      "`terraform destroy` cleans up with no orphans",
      "Plan output reviewed in PR before apply",
    ],
  },

  // ── Phase 8: Microservices ──────────────────────────────────────────────────
  "p8w46.0": {
    difficulty: "advanced",
    overview: "Microservices skeleton: gateway + 2 services + service discovery + shared config. The infrastructure pattern most production Java stacks settle on.",
    requirements: [
      "Spring Cloud Gateway routing to Product + Order services",
      "Eureka for service discovery",
      "Spring Cloud Config Server for shared properties",
      "Inter-service calls use Eureka-resolved names, not hard-coded URLs",
    ],
    acceptance: [
      "Killing one Product replica → next request routes to a healthy replica",
      "Adding a property in Config Server propagates without restart (use @RefreshScope)",
      "Gateway rate-limits one route to 10 RPS in test",
    ],
  },
  "p8w47.0": {
    difficulty: "intermediate",
    overview: "Resilience4j on a real call path: circuit breaker, retry, bulkhead. Each has a clear job — don't conflate them.",
    requirements: [
      "CircuitBreaker around inventory check (opens at 50% failure rate)",
      "Retry with exponential backoff for payment (max 3 attempts)",
      "Bulkhead isolates the slow downstream so it can't exhaust the thread pool",
      "Metrics exposed via Micrometer",
    ],
    acceptance: [
      "Killing inventory service → breaker opens within seconds; fallback returns cached value",
      "Slow downstream doesn't block fast endpoints (bulkhead test)",
      "Retry doesn't fire on non-idempotent failures",
    ],
  },
  "p8w48.0": {
    difficulty: "intermediate",
    overview: "Distributed tracing across services + Kafka. trace-id flows end-to-end so one slow trace finds the bottleneck.",
    requirements: [
      "OpenTelemetry Java agent on every service",
      "Propagate trace context via Kafka headers (custom KafkaTemplate interceptor)",
      "Visualise in Jaeger or Tempo",
      "Sampling: 100% in dev, 1% in prod",
    ],
    acceptance: [
      "End-to-end trace shows: gateway → product → kafka → order → notification",
      "Slow span is locatable by trace-id within 5 sec",
      "Log lines correlate with trace-id (MDC)",
    ],
  },
  "p8w49.0": {
    difficulty: "advanced",
    overview: "Event-sourced aggregate with Axon. State is the projection — events are the truth.",
    requirements: [
      "OrderAggregate handles CreateOrderCommand, emits OrderCreatedEvent",
      "Event store (Axon Server or JPA event store)",
      "Projection rebuilds read model on every event",
      "Replay test: wipe projection, replay events, projection matches",
    ],
    acceptance: [
      "Replay produces identical read model",
      "Adding a new projection requires zero changes to the aggregate",
      "Audit trail: every state change recoverable from events",
    ],
  },
  "p8w50.0": {
    difficulty: "advanced",
    overview: "Saga across 3 services with compensating transactions. The right way to coordinate distributed work without 2PC.",
    requirements: [
      "PlaceOrderSaga: ChargePayment → ReserveInventory → ConfirmOrder",
      "Compensations: Refund, RestoreInventory, CancelOrder",
      "Saga survives service restart (state persisted)",
      "Timeout per step with explicit failure routing",
    ],
    acceptance: [
      "Failure at any step rolls back prior steps via compensations",
      "Saga state recoverable after process restart",
      "End-to-end happy path < 2 sec",
    ],
  },

  // ── Phase 9: Capstone ──────────────────────────────────────────────────────
  "p9w53.1": {
    difficulty: "advanced",
    overview: "Implement the architecture from week 53.0. All services in Spring Boot 3 + Docker Compose for the supporting infra.",
    requirements: [
      "Spring Boot 3 services: gateway, auth, product, order, notification",
      "docker-compose: Postgres, Redis, Kafka, Prometheus, Grafana, Jaeger",
      "Each service has its own DB schema (DB-per-service)",
      "Inter-service: REST for sync, Kafka for async",
    ],
    acceptance: [
      "`docker compose up` boots the whole stack",
      "Happy-path order flow works end-to-end",
      "Grafana shows traffic; Jaeger shows traces",
    ],
  },
  "p9w54.0": {
    difficulty: "intermediate",
    overview: "Capstone deploy + readme + demo. The 'I shipped a thing' artefact you walk into interviews with.",
    requirements: [
      "Deployed to a free-tier cloud (Fly.io, Render, Railway)",
      "Public README with architecture diagram, setup, demo GIF",
      "10-min Loom walkthrough of the system + design decisions",
      "GitHub repo public + linked in your portfolio",
    ],
    acceptance: [
      "Live URL serves a working demo",
      "README is enough for a stranger to run it locally",
      "Loom walks through architecture, not just UI",
    ],
  },
};

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Seed Java build_specs — ${apply ? "APPLY" : "DRY RUN"} (${Object.keys(JAVA_SPECS).length} authored)`);

  // Walk Java roadmap, match by item text
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

  const matches: { resourceKey: string; item: string; spec: SpecLike; tag: string }[] = [];
  let unmatched = 0;

  for (const p of phases) {
    for (const w of (weeksByPhase.get(p.id) ?? [])) {
      const wSessions = sessionsByWeek.get(w.id) ?? [];
      // 0-based index of Build resources within this week, traversed in (session, resource) order
      let buildIdx = 0;
      for (let si = 0; si < wSessions.length; si++) {
        const s = wSessions[si];
        const sRes = resourcesBySession.get(s.id) ?? [];
        for (let ri = 0; ri < sRes.length; ri++) {
          const r = sRes[ri];
          if (r.type !== "Build") continue;
          const tag = `p${p.phaseNumber}w${w.weekNumber}.${buildIdx}`;
          buildIdx++;
          const spec = JAVA_SPECS[tag];
          if (spec) {
            matches.push({ resourceKey: resId(p.phaseNumber, w.weekNumber, si, ri), item: r.item, spec, tag });
          } else {
            unmatched++;
          }
        }
      }
    }
  }

  console.log(`  Matched ${matches.length} / ${matches.length + unmatched} Java Build resources`);

  if (!apply) {
    matches.forEach((m) => console.log(`  ${m.tag.padEnd(8)} → [${m.resourceKey}] ${m.item.slice(0, 60)}`));
    console.log();
    console.log(`Would upsert ${matches.length} rows. Run with --apply to commit.`);
    return;
  }

  for (const m of matches) {
    await db.insert(buildSpecs)
      .values({
        language:     "java",
        resourceKey:  m.resourceKey,
        overview:     m.spec.overview,
        requirements: m.spec.requirements,
        acceptance:   m.spec.acceptance,
        diagram:      m.spec.diagram ?? null,
        hints:        m.spec.hints ?? [],
        difficulty:   m.spec.difficulty,
      })
      .onConflictDoUpdate({
        target: [buildSpecs.language, buildSpecs.resourceKey],
        set: {
          overview:     m.spec.overview,
          requirements: m.spec.requirements,
          acceptance:   m.spec.acceptance,
          diagram:      m.spec.diagram ?? null,
          hints:        m.spec.hints ?? [],
          difficulty:   m.spec.difficulty,
        },
      });
  }
  console.log(`✅ Wrote ${matches.length} java build_specs rows`);
}

main().catch((err) => {
  console.error("❌ Seed Java build_specs failed:", err);
  process.exit(1);
});
