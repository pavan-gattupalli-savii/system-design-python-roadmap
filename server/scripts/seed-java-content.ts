// ── Seed Java phase outcomes + week objectives + checkpoints ──────────────────
// Mirrors seed-example-content.ts but targets language='java'. Each phase gets
// 4-6 outcomes; each week gets 2-3 objectives; each phase gets 3 quiz Qs.
//
// Idempotent. Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db, sql } from "../src/db/client.js";
import { phaseCheckpoints, roadmapPhases } from "../src/db/schema.js";
import { and, eq } from "drizzle-orm";

interface CheckpointRow {
  question:    string;
  options:     string[];
  answerIdx:   number;
  explanation: string;
}

const PHASE_OUTCOMES: Record<number, string[]> = {
  1: [
    "Use Java 21 features (records, sealed types, pattern matching, virtual threads) idiomatically",
    "Compose async work with CompletableFuture without lost exceptions or thread-pool exhaustion",
    "Reason about the JVM memory model, GC choices, and when each tuning knob matters",
    "Pick the right Collection (HashMap/TreeMap/ArrayDeque/PriorityQueue) per access pattern",
  ],
  2: [
    "Apply each SOLID principle on a real Java refactor and defend the trade-offs",
    "Recognise and implement the GoF patterns most asked in interviews",
    "Translate a verbal LLD prompt into Parking-Lot/Library/ATM-style class diagrams",
    "Write a 1-page LLD design doc that an interviewer or engineer could implement from",
  ],
  3: [
    "Bootstrap Spring Boot 3 with DI, profiles, Actuator, and constructor injection by default",
    "Author a CRUD REST API with Bean Validation + RFC 7807 error responses",
    "Model with JPA + Flyway migrations without N+1 or production locking issues",
    "Layer tests: unit (Mockito), slice (@WebMvcTest), integration (Testcontainers)",
    "Wire JWT auth and lock down protected routes correctly",
  ],
  4: [
    "Read EXPLAIN and design indexes that match the hot read path",
    "Pick the right isolation level per workload and justify with anomaly examples",
    "Choose between Postgres / MongoDB / Redis / DynamoDB with a real reason",
    "Author Flyway migrations that don't lock production tables",
    "Expose the same query over REST, GraphQL, and gRPC and pick the right one per client",
  ],
  5: [
    "State CAP / PACELC and the trade-off real production systems pick",
    "Compare leader/follower, multi-leader, leaderless replication for a workload",
    "Pick a sharding key and identify hot-shard mitigations",
    "Do back-of-envelope estimation (QPS, storage, bandwidth) in under 5 minutes",
  ],
  6: [
    "Walk an HLD prompt through requirements → estimation → HLD → deep-dives → bottlenecks",
    "Design URL shortener, social feed, chat, KV store, search, video, ride-sharing at whiteboard depth",
    "Trade off consistency, latency, and cost with concrete numbers",
  ],
  7: [
    "Containerise a Spring Boot app with a multi-stage Dockerfile (<200MB image)",
    "Author a Helm chart with Deployment + Service + HPA + ConfigMap + Secret",
    "Build a CI/CD pipeline that tests, gates, and deploys (with manual prod approval)",
    "Instrument metrics, logs, and traces and use them to debug a real slow span",
    "Provision real infra with Terraform (VPC + ECS + RDS + ALB)",
  ],
  8: [
    "Stand up a microservices skeleton: gateway + service discovery + shared config",
    "Apply circuit breaker / retry / bulkhead correctly via Resilience4j",
    "Propagate trace context across services + Kafka and find slow spans in Jaeger",
    "Author an event-sourced aggregate + saga with compensating actions",
  ],
  9: [
    "Walk into an LLD + HLD interview with a rehearsed framework rather than improvisation",
    "Capstone-ship a multi-service Spring Boot platform with auth, async, observability",
    "Articulate every Phase 1-8 concept in 60 seconds under pressure",
  ],
};

// Java weeks: phase 1 = w1-6, phase 2 = w7-12, etc. up to week 54.
const WEEK_OBJECTIVES: Record<number, string[]> = {
  1:  ["Use records, sealed interfaces, and switch pattern matching idiomatically", "Spot when a record beats a class and when it doesn't"],
  2:  ["Write Stream pipelines that beat hand-written loops for clarity", "Avoid the common Stream traps (boxing, side-effects, parallel without reason)"],
  3:  ["Build producer-consumer with bounded queue + graceful shutdown", "Reason about thread-pool sizing for IO vs CPU work"],
  4:  ["Compose async work with CompletableFuture.allOf + orTimeout", "Compare CompletableFuture vs virtual threads on the same workload"],
  5:  ["Pick a GC (G1, ZGC, Shenandoah) per latency / throughput target", "Read a heap dump in VisualVM and find the leak"],
  6:  ["Map a Collections need to the right concrete impl (HashMap vs TreeMap vs LinkedHashMap)", "Justify ArrayDeque over LinkedList for FIFO/LIFO"],
  7:  ["Apply each SOLID principle on a real refactor", "Spot SRP / OCP violations in code review"],
  8:  ["Implement Factory / Builder / Singleton idiomatically in Java", "Avoid Singleton when DI gives you the same thing for free"],
  9:  ["Use Adapter, Decorator, Proxy, Facade in real code", "Explain when composition beats one of these patterns"],
  10: ["Pick between Observer / Strategy / Command / State per use case", "Walk an interviewer through a state-machine implementation"],
  11: ["Translate Parking Lot + Library prompts into clean class diagrams", "Ship both with unit tests in < 90 minutes"],
  12: ["Implement the ATM as a State machine", "Write the 1-page LLD design doc for each of your LLD projects"],
  13: ["Bootstrap Spring Boot 3 with profiles + Actuator + custom HealthIndicator", "Use constructor DI everywhere; reject field DI in code review"],
  14: ["Author a CRUD API with Bean Validation + RFC 7807 problem JSON", "Generate and serve OpenAPI 3 spec"],
  15: ["Model bi-directional JPA without N+1 (use @EntityGraph)", "Author Specifications for dynamic search"],
  16: ["Add JWT auth with BCrypt + role-based @PreAuthorize", "Configure SecurityFilterChain correctly"],
  17: ["Layer tests: unit (Mockito), slice (@WebMvcTest), integration (Testcontainers)", "Hit 80%+ JaCoCo coverage on business logic"],
  18: ["Author a GitHub Actions pipeline with cache + JaCoCo gate + image push", "Block PRs that drop coverage"],
  19: ["Use JDBC directly and understand what Hibernate is doing under the hood", "Tune the connection pool (HikariCP) per workload"],
  20: ["Read Hibernate-generated SQL and spot the N+1", "Use @Query / native queries when the criteria builder loses"],
  21: ["Build a real-time leaderboard with Redis sorted sets", "Use SETNX for distributed locks + TTL for sessions"],
  22: ["Author Flyway migrations that don't lock a 10M-row table", "Define a rollback strategy per migration"],
  23: ["Wire Kafka producer / consumer with idempotent processing + DLQ", "Pick at-least-once vs exactly-once and explain trade-off"],
  24: ["Expose the same query over REST + GraphQL + gRPC", "Pick the right protocol per client (browser, mobile, internal)"],
  25: ["Synthesise the DDIA storage chapters into a 1-page reference card", "Sketch B-Tree vs LSM in your own words"],
  26: ["Choose isolation level per workload (bank / feed / cart / analytics)", "Show a concurrency anomaly for each system if level is wrong"],
  27: ["Sketch how Raft elects a leader and survives a partition", "Pick ZooKeeper vs etcd vs Redis Sentinel and justify"],
  28: ["Pick caching strategy per workload (write-through / write-back / read-through)", "Reason about cache eviction (LRU / LFU / TTL)"],
  29: ["Configure nginx as L7 load balancer with health checks", "Reason about CDN cache headers (Cache-Control, Vary, ETag)"],
  30: ["Do back-of-envelope estimation in < 5 minutes for any workload", "Walk an HLD prompt through the 6-step framework cleanly"],
  31: ["Design bit.ly from scratch in 45 minutes (no notes)", "Reason about ID generation (base62, hash, autoincrement)"],
  32: ["Design Twitter feed with hybrid fanout", "Trade off consistency vs cost for celebrity tweets"],
  33: ["Design WhatsApp with WebSocket + presence + delivery receipts", "Trade off storage tiering (hot / cold)"],
  34: ["Implement consistent hash ring with virtual nodes", "Reason about minimal rehashing on cluster changes"],
  35: ["Design typeahead with trie + aggregation pipeline + hot cache", "Trade off real-time vs batched index updates"],
  36: ["Design YouTube with async transcoding + CDN + view counter", "Reason about HLS adaptive bitrate"],
  37: ["Design Uber with geohash + WebSocket + saga payment", "Reason about driver matching at scale"],
  38: ["Write HLD lessons-learned: 5 things you do differently now"],
  39: ["Containerise a Spring Boot app with multi-stage Dockerfile <200MB", "Compose the local stack (app + DB + Redis + Kafka) with health checks"],
  40: ["Author a Helm chart with Deployment + HPA + Secret", "Use ConfigMap for non-secret config"],
  41: ["Pipeline: build → test → JaCoCo gate → SonarQube → image push → Helm upgrade", "Gate prod deploys behind manual approval"],
  42: ["Instrument metrics (Micrometer) + structured logs + traces (OTel)", "Build a Grafana dashboard for the capstone"],
  43: ["Upload to S3 + consume from SQS + use DynamoDB sessions", "Test against LocalStack in dev"],
  44: ["Provision VPC + ECS + RDS + ALB with Terraform", "Manage state in S3 with DynamoDB lock"],
  45: ["Decompose a monolith using Domain-Driven Design", "Identify aggregate roots + bounded contexts"],
  46: ["Wire Spring Cloud Gateway + Eureka + Config Server", "Refresh config without restart using @RefreshScope"],
  47: ["Apply CircuitBreaker / Retry / Bulkhead via Resilience4j", "Explain when retry is wrong (non-idempotent calls)"],
  48: ["Propagate trace context across services + Kafka headers", "Locate a slow span in Jaeger in under 5 sec"],
  49: ["Model an event-sourced aggregate with Axon", "Replay events to rebuild projection state"],
  50: ["Coordinate distributed work with sagas + compensating actions", "Reason about why 2PC almost never wins"],
  51: ["Walk an HLD prompt the 6-step way under interview pressure"],
  52: ["Recognise the LeetCode patterns that show up in coding rounds (sliding window, two pointers, monotonic stack)", "Pick the right data structure cold"],
  53: ["Architect a multi-service Spring Boot platform with diagram + 3 deep-dives"],
  54: ["Ship the capstone live + record a 10-min Loom walkthrough"],
};

const PHASE_CHECKPOINTS: Record<number, CheckpointRow[]> = {
  1: [
    {
      question: "Which Java collection is the right choice for FIFO/LIFO operations?",
      options:  ["LinkedList", "ArrayDeque", "Vector", "Stack"],
      answerIdx: 1,
      explanation: "ArrayDeque outperforms LinkedList on every metric and is the modern replacement for the legacy Stack / Vector classes.",
    },
    {
      question: "CompletableFuture.allOf with 3 futures: one throws. Default behaviour?",
      options:  ["Returns first failure synchronously", "Combined future completes exceptionally with that exception", "Others are cancelled automatically", "Returns null"],
      answerIdx: 1,
      explanation: "allOf completes exceptionally when any input does. Other futures continue running; you only see their results if you call .exceptionally / .handle.",
    },
    {
      question: "Virtual threads (Java 21) are best for:",
      options:  ["CPU-bound parallel computation", "IO-bound work that blocks on network / DB", "GC tuning", "Replacing all platform threads"],
      answerIdx: 1,
      explanation: "Virtual threads cheaply park on IO. They don't speed up CPU-bound work and shouldn't replace platform threads for compute.",
    },
  ],
  2: [
    {
      question: "A class has two reasons to change. Which SOLID principle does that violate?",
      options:  ["Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation"],
      answerIdx: 1,
      explanation: "SRP says a class should have one reason to change. Two reasons → split it.",
    },
    {
      question: "Need swappable algorithms at runtime (e.g. shipping cost: standard vs express). Pattern?",
      options:  ["Factory", "Strategy", "Observer", "Singleton"],
      answerIdx: 1,
      explanation: "Strategy hides each algorithm behind a common interface so callers pick one at runtime without if/else cascades.",
    },
    {
      question: "Object behaviour depends on its current mode (order: CREATED → PAID → SHIPPED). Cleanest pattern?",
      options:  ["State", "Decorator", "Visitor", "Mediator"],
      answerIdx: 0,
      explanation: "State swaps behaviour by replacing the state object — no giant switch on a mode field.",
    },
  ],
  3: [
    {
      question: "Prefer constructor injection over field injection because:",
      options:  ["Faster startup", "Allows final fields + easier unit testing without Spring", "Required by Spring Boot 3", "Less code"],
      answerIdx: 1,
      explanation: "Constructor DI gives you final fields and lets you instantiate the class in unit tests without reflection or @SpringBootTest.",
    },
    {
      question: "JPA bidirectional one-to-many with default fetch loading parent + 100 children causes:",
      options:  ["N+1 query problem", "Stack overflow", "Lazy loading exception", "Optimistic locking exception"],
      answerIdx: 0,
      explanation: "Default fetch issues 1 parent query + N child queries. Fix with @EntityGraph, JOIN FETCH, or @BatchSize.",
    },
    {
      question: "@WebMvcTest gives you:",
      options:  ["Full Spring context", "MVC slice only — controllers, exception handlers, JSON binding", "JPA repos", "Mocked Spring Security only"],
      answerIdx: 1,
      explanation: "@WebMvcTest loads only the MVC layer. Services + repos are mocked. Faster than full @SpringBootTest for controller logic.",
    },
  ],
  4: [
    {
      question: "Query: `WHERE user_id=? AND status=? ORDER BY created_at DESC LIMIT 20`. Best index?",
      options:  ["Single on user_id", "Single on created_at", "Composite (user_id, status, created_at DESC)", "Three separate single-column indexes"],
      answerIdx: 2,
      explanation: "Composite in the WHERE + ORDER BY order lets the engine seek then scan a sorted slice without a separate sort step.",
    },
    {
      question: "Workload: 100k inserts/sec, eventual consistency OK, simple key-based access. Pick:",
      options:  ["Single Postgres", "MongoDB sharded", "MySQL synchronous replicas", "SQLite"],
      answerIdx: 1,
      explanation: "Sharded NoSQL scales writes horizontally and tolerates eventual consistency. Postgres single instance hits IO ceiling; synchronous replication kills throughput.",
    },
    {
      question: "Kafka consumer crashes mid-batch. What guarantees no double-processing?",
      options:  ["Default consumer settings", "Idempotent processing keyed by message-id", "Increasing partition count", "Disabling auto-commit"],
      answerIdx: 1,
      explanation: "At-least-once is the default. To prevent double-effects, processing must be idempotent — usually a (consumer-group, key) unique check.",
    },
  ],
  5: [
    {
      question: "CAP theorem says during a network partition you must pick:",
      options:  ["Consistency or Availability", "Consistency or Partition tolerance", "Availability or Partition tolerance", "Any two of C/A/P"],
      answerIdx: 0,
      explanation: "Partition is unavoidable in distributed systems. CAP forces you to choose between Consistency (refuse writes) or Availability (accept inconsistency) during the partition.",
    },
    {
      question: "Leader-follower replication, leader dies. Which failure mode loses writes?",
      options:  ["Sync replication", "Async replication", "Both", "Neither"],
      answerIdx: 1,
      explanation: "Async replication acks the writer before fanning out. If the leader dies before replicating, those acked writes are lost on failover.",
    },
    {
      question: "Hot-shard problem in Twitter feed sharded by user_id appears when:",
      options:  ["Adding new shards", "One celebrity has 100M followers reading their tweets", "Cold reads", "Schema migrations"],
      answerIdx: 1,
      explanation: "Sharding by user_id puts celebrity reads on one shard. Hybrid fanout (write-fanout normal, read-fanout celeb) is the standard mitigation.",
    },
  ],
  6: [
    {
      question: "First minute of any HLD interview should be:",
      options:  ["Drawing architecture", "Listing tech you know", "Clarifying requirements + scale", "Picking a database"],
      answerIdx: 2,
      explanation: "Functional + non-functional + scale numbers come first. Designing without them = shooting in the dark, and interviewers downgrade for it.",
    },
    {
      question: "200M DAU Twitter. Celebrity with 100M followers. Pure fanout-on-write:",
      options:  ["Works fine", "Causes a write storm — hybrid (fanout-on-read for celebs) is correct", "Is cheaper", "Improves consistency"],
      answerIdx: 1,
      explanation: "Writing 100M timeline entries per celebrity tweet is impossible. Hybrid fanout is the universal answer.",
    },
    {
      question: "WhatsApp delivery receipt for a 500-person group sent to a sender. Best approach?",
      options:  ["Per-recipient ACK to sender", "Aggregate to a single count (delivered/read counts)", "Don't show receipts in groups", "Use Kafka transactions"],
      answerIdx: 1,
      explanation: "Aggregating to counts is what WhatsApp/Slack actually do at scale. Per-recipient ACKs would multiply traffic by group size.",
    },
  ],
  7: [
    {
      question: "Multi-stage Dockerfile: stage 1 builds the JAR with Maven, stage 2 only copies the JAR onto a JRE base. The point is:",
      options:  ["Faster builds", "Smaller runtime image (no Maven, no source, no test deps)", "Multi-arch builds", "Layer caching"],
      answerIdx: 1,
      explanation: "Multi-stage cuts the runtime image from GBs (Maven + JDK) to MB (just JRE + JAR). Source code never ships to production.",
    },
    {
      question: "HPA on CPU 70% triggers scale-up. Why not just always run max pods?",
      options:  ["HPA is required by Spring Boot", "Cost — pods are billed; HPA scales down during low load", "It's the default", "It improves latency"],
      answerIdx: 1,
      explanation: "HPA is a cost-optimisation. Scale up only when CPU > 70% sustained, scale back down during low load.",
    },
    {
      question: "Service is slow. Which observability pillar locates the bottleneck fastest?",
      options:  ["Logs", "Metrics", "Distributed traces", "Heap dumps"],
      answerIdx: 2,
      explanation: "Traces show end-to-end latency broken down per span. You see exactly which call took the time. Metrics confirm, logs add detail.",
    },
  ],
  8: [
    {
      question: "Circuit breaker opens at 50% failure rate. Bulkhead's job is:",
      options:  ["Same as circuit breaker", "Isolate threads per dependency so one slow downstream doesn't exhaust the pool", "Retry failed calls", "Cache responses"],
      answerIdx: 1,
      explanation: "Bulkhead partitions resources (thread pools / connections) per dependency. Circuit breaker fails fast; bulkhead prevents one slow caller starving the whole service.",
    },
    {
      question: "Retry an HTTP POST that creates an order. Safety?",
      options:  ["Always safe", "Safe only if endpoint is idempotent (e.g. accepts an Idempotency-Key header)", "Never safe", "Safe if you wait 1 second between attempts"],
      answerIdx: 1,
      explanation: "POST is not idempotent by default. Retrying without an idempotency key risks duplicate orders. Producers must send a unique key per logical request.",
    },
    {
      question: "Distributed saga vs 2PC. The saga wins because:",
      options:  ["Faster", "No global locks; tolerates partial failures with compensations", "Stronger consistency", "Simpler to implement"],
      answerIdx: 1,
      explanation: "2PC holds locks across services through the prepare/commit phases. Sagas don't — they commit per service and run compensations on failure. Lower latency, no global blocker.",
    },
  ],
  9: [
    {
      question: "Interviewer goes silent after you propose a solution. Usually means:",
      options:  ["They're impressed", "They want you to self-critique edge cases", "Interview is over", "They forgot the question"],
      answerIdx: 1,
      explanation: "Silence is a prompt to keep going. Walk through trade-offs, edge cases, bottlenecks — proves you can self-critique.",
    },
    {
      question: "45-min HLD time-management rule of thumb:",
      options:  ["5/5/30/5", "10/5/20/10 (req / estimate / HLD / deep-dive + wrap)", "30 HLD only", "Leave 20 min for questions"],
      answerIdx: 1,
      explanation: "Roughly: 10 min requirements + estimation, 20 HLD, 10 deep-dives, 5 wrap. Adjust per interviewer.",
    },
    {
      question: "Capstone is meant to be:",
      options:  ["A toy demo", "Something you walk into interviews with as proof of work", "Identical to FAANG production code", "Just a README"],
      answerIdx: 1,
      explanation: "Capstone = portfolio artefact. Live URL + README + Loom + clean repo. It's the thing you point to when an interviewer asks 'tell me about a project'.",
    },
  ],
};

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Seed Java content — ${apply ? "APPLY" : "DRY RUN"}`);

  // ── Outcomes ──────────────────────────────────────────────────────────────
  for (const [phaseStr, outcomes] of Object.entries(PHASE_OUTCOMES)) {
    const phaseNum = parseInt(phaseStr, 10);
    console.log(`  outcomes [java p${phaseNum}] ${outcomes.length} items`);
    if (!apply) continue;
    await db.update(roadmapPhases)
      .set({ outcomes })
      .where(and(eq(roadmapPhases.language, "java"), eq(roadmapPhases.phaseNumber, phaseNum)));
  }

  // ── Week objectives ───────────────────────────────────────────────────────
  for (const [weekStr, objectives] of Object.entries(WEEK_OBJECTIVES)) {
    const weekNum = parseInt(weekStr, 10);
    console.log(`  objectives [java w${weekNum}] ${objectives.length} items`);
    if (!apply) continue;
    await sql`
      UPDATE roadmap_weeks
      SET learning_objectives = ${objectives}
      WHERE phase_id IN (SELECT id FROM roadmap_phases WHERE language = 'java')
        AND week_number = ${weekNum}
    `;
  }

  // ── Checkpoints ───────────────────────────────────────────────────────────
  for (const [phaseStr, qs] of Object.entries(PHASE_CHECKPOINTS)) {
    const phaseNum = parseInt(phaseStr, 10);
    console.log(`  checkpoints [java p${phaseNum}] ${qs.length} questions`);
    if (!apply) continue;
    await db.delete(phaseCheckpoints).where(and(
      eq(phaseCheckpoints.language, "java"),
      eq(phaseCheckpoints.phaseNumber, phaseNum),
    ));
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      await db.insert(phaseCheckpoints).values({
        language:    "java",
        phaseNumber: phaseNum,
        question:    q.question,
        options:     q.options,
        answerIdx:   q.answerIdx,
        explanation: q.explanation,
        sortOrder:   i,
      });
    }
  }

  if (!apply) {
    console.log();
    console.log("Run with --apply to commit.");
    return;
  }
  console.log("✅ Java content seeded");
}

main().catch((err) => {
  console.error("❌ Seed Java content failed:", err);
  process.exit(1);
});
