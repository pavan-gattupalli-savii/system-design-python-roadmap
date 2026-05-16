// ── Seed example phase outcomes + week objectives + checkpoints ───────────────
// Populates a minimal exemplar set for Python Phase 1 so the new UI surfaces
// have something to render. Authors can extend the same shape from admin.
//
// Idempotent: outcomes/objectives overwrite, checkpoints upsert by (lang, phase, sort_order).

import "dotenv/config";
import { db, sql } from "../src/db/client.js";
import { phaseCheckpoints, roadmapPhases, roadmapWeeks } from "../src/db/schema.js";
import { and, eq } from "drizzle-orm";

interface CheckpointRow {
  question:    string;
  options:     string[];
  answerIdx:   number;
  explanation: string;
}

const PHASE_OUTCOMES: Record<string, Record<number, string[]>> = {
  python: {
    1: [
      "Set up a clean Python development environment with venv and Git",
      "Read and write Python syntax fluently: control flow, functions, comprehensions",
      "Apply OOP fundamentals: classes, inheritance, exceptions, @property",
      "Reason about Big-O for built-in data structures",
      "Ship 4 small CLI tools end-to-end and check them into version control",
    ],
    2: [
      "Use dataclasses, ABCs, and Protocols for clean domain modelling",
      "Explain descriptors, __slots__, and metaclasses — and when each is the right tool",
      "Write generators and async code that don't block",
      "Apply functional patterns (map/filter/reduce, partial, itertools) where they read clearer",
      "Choose between threading, multiprocessing, and asyncio based on workload shape",
    ],
    3: [
      "Apply the SOLID principles to refactor a real piece of messy code",
      "Recognise and apply the major creational, structural, and behavioral design patterns",
      "Translate a verbal LLD interview prompt into a coherent class diagram and code",
      "Write a 1-page LLD design doc that an engineer could implement from",
    ],
    4: [
      "Write pytest tests with fixtures, parametrize, and clear assertions",
      "Use mocks and fakes appropriately — and know when each is wrong",
      "Read coverage reports and add tests for the gaps that matter",
      "Run mypy + ruff in CI and treat warnings as errors",
    ],
    5: [
      "Sketch the right index for a query and reason about its cost",
      "Pick SQL vs NoSQL with a clear reason rooted in access patterns",
      "Explain ACID + isolation levels in plain language with examples",
      "Reason about replication lag, partitioning strategy, and CAP trade-offs",
    ],
    6: [
      "Design a REST API with proper status codes, idempotency, and versioning",
      "Pick between REST, gRPC, and WebSockets per use case",
      "Apply rate limiting, auth, and gateway concerns to an API surface",
      "Reason about message queues vs synchronous calls for inter-service comms",
    ],
    7: [
      "Walk through an HLD interview prompt with the standard 6-step framework",
      "Do back-of-envelope estimation for QPS, storage, and bandwidth",
      "Design feeds, chat, search, ride-sharing, video — at whiteboard depth",
      "Trade off consistency, availability, and cost in a real design",
    ],
    8: [
      "Define SLOs, error budgets, and choose alert thresholds that don't page on noise",
      "Instrument a service with metrics, logs, and traces (the three pillars)",
      "Containerise a Python app and deploy it on Kubernetes",
      "Author a CI/CD pipeline that runs tests, builds, and deploys safely",
    ],
    9: [
      "Walk into an LLD + HLD interview with a rehearsed framework, not improvisation",
      "Capstone-ship a full mini-Twitter clone: auth, feed, search, observability",
      "Articulate every roadmap concept under pressure in 60 seconds",
    ],
  },
};

const WEEK_OBJECTIVES: Record<string, Record<number, string[]>> = {
  python: {
    1: [
      "Run a Python script from the terminal and understand REPL vs file execution",
      "Use f-strings, string methods, and the major built-in types fluently",
      "Write a control-flow heavy CLI tool with input validation",
    ],
    2: [
      "Split logic across multiple modules and import between them",
      "Distinguish function args, kwargs, *args, **kwargs, and default values",
      "Use list/dict/set comprehensions where they read more clearly than loops",
    ],
    3: [
      "Define a class with __init__, methods, and @property",
      "Use inheritance + polymorphism to share behaviour between related classes",
      "Define and raise custom exception subclasses",
    ],
    4: [
      "Choose the right built-in (list / dict / set / deque) for an access pattern",
      "Set up a venv and install packages with pip into it (not globally)",
      "Initialise a Git repo, stage, commit, and push to a remote",
    ],
    5: [
      "Model a domain with @dataclass and frozen=True for immutability",
      "Choose between ABCs and Protocols for typed interfaces",
      "Write fully type-hinted code that mypy accepts",
    ],
    6: [
      "Explain how a @property is actually a descriptor under the hood",
      "Use __slots__ to cut memory for large counts of small objects",
      "Build a metaclass or class decorator and justify which",
    ],
    7: [
      "Author generators with yield and yield from for lazy pipelines",
      "Write a context manager both as a class and with @contextmanager",
      "Use itertools.chain / groupby / islice instead of hand-rolled loops",
    ],
    8: [
      "Use asyncio.gather and TaskGroup correctly without lost exceptions",
      "Add type hints to async generators and async context managers",
      "Run mypy --strict on a small module and fix every error",
    ],
    9: [
      "Compose pure functions with functools.partial and functools.reduce",
      "Memoise hot functions with functools.lru_cache and know its bounds",
      "Replace loops with map/filter/reduce where they read more clearly",
    ],
    10: [
      "Pick between threading, multiprocessing, and asyncio per workload shape",
      "Reason about the GIL and where it does (and doesn't) bite",
      "Coordinate workers with a thread-safe queue or asyncio.Queue",
    ],
    11: [
      "Apply each SOLID principle on a concrete refactor and explain trade-offs",
      "Spot SRP / OCP / LSP violations in a code review",
    ],
    12: [
      "Recognise when Factory, Builder, or Singleton is genuinely needed",
      "Implement each creational pattern in idiomatic Python (not Java-with-extra-steps)",
    ],
    13: [
      "Apply Adapter, Decorator, Proxy, Facade, Composite in real code",
      "Explain when composition beats one of these patterns",
    ],
    14: [
      "Pick the right behavioral pattern (Observer/Strategy/Command/State) per use case",
      "Walk an interviewer through a state-machine implementation",
    ],
    15: [
      "Translate verbal Library / Elevator prompts into clean class diagrams",
      "Implement both end-to-end with unit tests in under 90 minutes",
    ],
    16: [
      "Apply DDD lite (entities, value objects, aggregates) on a food-delivery domain",
      "Write a 1-page design doc that captures the why, not just the what",
    ],
    17: [
      "Author parametrised pytest tests and fixtures that scope correctly",
      "Use `tmp_path`, `monkeypatch`, and `capsys` idiomatically",
    ],
    18: [
      "Distinguish mocks, fakes, stubs, and spies — and pick the right one",
      "Write a failing test first, then make it pass (true TDD cycle)",
    ],
    19: [
      "Run mypy --strict and resolve every error in a small codebase",
      "Wire pytest + ruff + mypy into a GitHub Actions workflow",
    ],
    20: [
      "Read EXPLAIN output and explain why an index is (or isn't) being used",
      "Design a covering index for a hot read path",
    ],
    21: [
      "Reason about REPEATABLE READ vs SERIALIZABLE on a concrete contention story",
      "Write a schema migration that doesn't lock a 50M-row table",
    ],
    22: [
      "Pick MongoDB vs Postgres vs Redis for a workload and defend it",
      "Model a one-to-many relationship in Mongo without N+1",
    ],
    23: [
      "Compare leader/follower, multi-leader, and leaderless replication",
      "Pick a sharding key and walk through hot-shard mitigations",
    ],
    24: [
      "State CAP, PACELC, and the actual trade-off PCs make in practice",
      "Sketch how Raft elects a leader and survives a network partition",
    ],
    25: [
      "Design how images / videos / static assets flow through a CDN",
      "Reason about inverted indexes and the cost of full-text search",
    ],
    26: [
      "Explain HTTP/1.1 vs HTTP/2 vs HTTP/3 trade-offs",
      "Author a REST API with proper status codes, idempotency, and pagination",
    ],
    27: [
      "Pick REST vs gRPC vs WebSockets and justify per workload",
      "Implement a long-lived WebSocket service with backpressure handling",
    ],
    28: [
      "Pick Kafka vs SQS vs Redis Streams per durability and ordering need",
      "Reason about at-least-once vs exactly-once semantics in practice",
    ],
    29: [
      "Implement token-bucket and sliding-window rate limiters with Redis",
      "Sketch the responsibilities of an API gateway (auth, routing, throttle)",
    ],
    30: [
      "Explain OAuth2 / OIDC flows at a level that survives interview questions",
      "List the OWASP top-10 mitigations every API should ship with",
    ],
    31: [
      "Re-read core networking chapters and synthesise into a 1-pager",
    ],
    32: [
      "Walk a system design prompt through requirements → estimates → HLD → deep-dives → bottlenecks → wrap",
      "Do back-of-envelope estimation in <5 minutes without panicking",
    ],
    33: [
      "Pick between L4 vs L7 load balancing, sticky vs round-robin, per use case",
      "Reason about consistent hashing for cache fronting",
    ],
    34: [
      "Explain why consistent hashing minimises rehashing on node add/remove",
      "Sketch a key-value store with replication and gossip-based membership",
    ],
    35: [
      "Compare push (fan-out-on-write) vs pull (fan-out-on-read) feeds",
      "Pick the right approach for celebrity-skew",
    ],
    36: [
      "Design a chat system with delivery receipts and historic message storage",
      "Reason about online presence and connection pinning",
    ],
    37: [
      "Coordinate distributed transactions via saga + compensation",
      "Sketch matching, pricing, and ETA for a ride-sharing system",
    ],
    38: [
      "Implement typeahead with a trie + edit distance",
      "Tune ranking signals for a search system",
    ],
    39: [
      "Walk through CDN + manifest-driven adaptive bitrate streaming",
      "Reason about chunked encoding and player buffer maths",
    ],
    40: [
      "Design idempotent payment endpoints with strong audit trails",
      "Sketch a notification system that fans out to email / push / SMS",
    ],
    41: [
      "Mock 5 HLD problems back-to-back under time pressure and debrief each",
    ],
    42: [
      "Define an SLO + error budget for a service you've worked on",
      "Pick alert thresholds that page on real incidents, not noise",
    ],
    43: [
      "Distinguish metrics, logs, traces — and instrument all three",
      "Read a trace and find the slow span",
    ],
    44: [
      "Containerise a Python service with a slim multi-stage Dockerfile",
      "Deploy a Pod + Service + Ingress on minikube",
    ],
    45: [
      "Author a GitHub Actions pipeline that tests, builds, and deploys",
      "Explain blue/green vs canary vs rolling deploys with trade-offs",
    ],
    46: [
      "Walk an LLD problem from scratch in a recorded mock",
      "Self-critique on coverage, time-management, and explanation clarity",
    ],
    47: [
      "Walk an HLD problem in a recorded mock and grade yourself",
    ],
    48: [
      "Ship a mini-Twitter clone end-to-end and deploy it",
      "Demonstrate auth, feed, search, and observability working",
    ],
    49: [
      "Publish the project, write the README, and share it publicly",
    ],
  },
};

const PHASE_CHECKPOINTS: Record<string, Record<number, CheckpointRow[]>> = {
  python: {
    1: [
      {
        question: "Average-case time complexity of `x in some_set` where `some_set` is a Python `set`?",
        options:  ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIdx: 0,
        explanation: "Python sets are hash tables. Membership testing is O(1) amortised. Lists would be O(n).",
      },
      {
        question: "Which call mutates the original list?",
        options:  ["`sorted(lst)`", "`lst[:].sort()`", "`lst.sort()`", "`list(reversed(lst))`"],
        answerIdx: 2,
        explanation: "`lst.sort()` sorts in place and returns None. `sorted()` returns a new list. `lst[:]` is a copy, so `.sort()` on it doesn't touch the original.",
      },
      {
        question: "You want a class attribute that is computed from instance state and read like an attribute (no parentheses). What do you use?",
        options:  ["`@staticmethod`", "`@classmethod`", "`@property`", "Plain assignment in __init__"],
        answerIdx: 2,
        explanation: "`@property` turns a method into a read-only attribute. Plain assignment in __init__ wouldn't update if other state changes.",
      },
    ],
    2: [
      {
        question: "What does `__slots__` give you?",
        options:  ["Faster method dispatch", "Lower memory per instance + restricted attrs", "Automatic __init__", "Thread-safe attribute access"],
        answerIdx: 1,
        explanation: "`__slots__` allocates a fixed array slot per attribute instead of a per-instance __dict__, cutting memory and rejecting new attributes at runtime.",
      },
      {
        question: "You want a callable that lazily yields one item at a time and remembers position. What do you write?",
        options:  ["A class with `__iter__` only", "A regular function with `return`", "A function with `yield`", "A list comprehension"],
        answerIdx: 2,
        explanation: "A `yield` makes the function a generator. Each `next()` resumes where the last yield left off.",
      },
      {
        question: "Which call returns a coroutine without scheduling it on the event loop?",
        options:  ["`await coro()`", "`asyncio.gather(coro())`", "`coro()`", "`asyncio.create_task(coro())`"],
        answerIdx: 2,
        explanation: "Calling an async function returns a coroutine object. Until you `await` it or pass it to `create_task` / `gather`, the loop does nothing.",
      },
      {
        question: "asyncio.gather raises an exception in one task. Default behaviour for the others?",
        options:  ["Cancelled automatically", "Continue running; their exceptions are swallowed", "Continue running; their results are still returned if `return_exceptions=True`", "Loop crashes"],
        answerIdx: 2,
        explanation: "By default the first exception propagates and other tasks are cancelled. Pass `return_exceptions=True` to collect them all instead of cancelling.",
      },
    ],
    3: [
      {
        question: "A class has two reasons to change (DB schema and report layout). Which SOLID principle does that violate?",
        options:  ["Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation"],
        answerIdx: 1,
        explanation: "Single Responsibility says a class should have one reason to change. Two reasons → split the class.",
      },
      {
        question: "You need to swap algorithms at runtime (e.g. shipping cost: standard vs express). Which pattern?",
        options:  ["Factory", "Strategy", "Observer", "Singleton"],
        answerIdx: 1,
        explanation: "Strategy encapsulates each algorithm behind a common interface so callers can pick one at runtime without conditional spaghetti.",
      },
      {
        question: "An object's behaviour depends on which mode it's in (e.g. order: created → paid → shipped). The cleanest pattern is:",
        options:  ["State", "Decorator", "Visitor", "Mediator"],
        answerIdx: 0,
        explanation: "State swaps the behaviour by replacing the state object on the context — no giant `if/elif` ladder.",
      },
    ],
    4: [
      {
        question: "A test mocks the database it claims to integrate with. What kind of test is it?",
        options:  ["Integration test", "Unit test", "End-to-end test", "Smoke test"],
        answerIdx: 1,
        explanation: "If you mock the dependency, you're not integrating with it — that's a unit test. Real integration tests hit a real (or testcontainer) dependency.",
      },
      {
        question: "pytest fixture with `scope=\"module\"` runs:",
        options:  ["Once per test", "Once per test class", "Once per file", "Once per test session"],
        answerIdx: 2,
        explanation: "Module-scope fixtures are created once per test file and torn down at the end of the file.",
      },
      {
        question: "You want to assert a function was called with specific args. Best tool:",
        options:  ["`assert_called_with`", "`assert_called`", "`called` boolean check", "manual side-effect list"],
        answerIdx: 0,
        explanation: "`Mock.assert_called_with(*args, **kwargs)` checks the last call matched. `assert_called` only checks if it was called at all.",
      },
    ],
    5: [
      {
        question: "Reads are slow on a `WHERE user_id=? AND created_at > ?` query. The right index is:",
        options:  ["B-tree on `user_id`", "B-tree on `created_at`", "Composite B-tree on `(user_id, created_at)`", "Hash on `user_id`"],
        answerIdx: 2,
        explanation: "Composite index in the right order lets the engine seek to the user_id range then scan a contiguous slice ordered by created_at. Two separate single-column indexes are worse.",
      },
      {
        question: "READ COMMITTED isolation prevents which anomaly?",
        options:  ["Lost update", "Dirty read", "Non-repeatable read", "Phantom read"],
        answerIdx: 1,
        explanation: "READ COMMITTED prevents dirty reads (reading uncommitted data). It still allows non-repeatable reads and phantoms — those require REPEATABLE READ / SERIALIZABLE.",
      },
      {
        question: "Pick the storage for a workload of 100k inserts/sec with eventual consistency OK:",
        options:  ["Postgres single instance", "MongoDB sharded cluster", "MySQL with synchronous replication", "SQLite"],
        answerIdx: 1,
        explanation: "Sharded NoSQL scales writes horizontally and tolerates eventual consistency. A single Postgres instance hits IO ceiling; synchronous replication kills write throughput.",
      },
    ],
    6: [
      {
        question: "Which HTTP method should be idempotent?",
        options:  ["GET only", "POST", "PUT and DELETE", "GET, PUT, DELETE"],
        answerIdx: 3,
        explanation: "GET, PUT, DELETE are all idempotent by spec — calling repeatedly has the same effect as once. POST is intentionally not idempotent (creates a new resource each time).",
      },
      {
        question: "You need server-pushed updates to many clients with low latency. Pick:",
        options:  ["REST polling", "Long polling", "WebSockets", "gRPC unary"],
        answerIdx: 2,
        explanation: "WebSockets give a full-duplex persistent connection — server pushes without the client asking. Polling burns bandwidth; gRPC unary is request-response.",
      },
      {
        question: "Token-bucket rate limiter with 100 capacity, 10/sec refill. Burst of 50 requests at t=0?",
        options:  ["All 50 rejected", "All 50 served", "First 10 served, 40 rejected", "First 100 served then rejected"],
        answerIdx: 1,
        explanation: "Token bucket allows bursts up to capacity. 50 < 100 tokens available at t=0, so all 50 are served. Future requests wait for refill.",
      },
    ],
    7: [
      {
        question: "First step of an HLD interview should be:",
        options:  ["Drawing boxes", "Choosing a database", "Clarifying requirements + scale", "Listing technologies you know"],
        answerIdx: 2,
        explanation: "Functional + non-functional requirements + scale numbers come first. Designing without them is shooting in the dark.",
      },
      {
        question: "Twitter timeline at 200M DAU, fanout-on-write for celebrity (100M followers) would:",
        options:  ["Work fine", "Cause a write storm; hybrid (fanout for normal users, fanout-on-read for celebs) is better", "Be cheaper than fanout-on-read", "Improve consistency"],
        answerIdx: 1,
        explanation: "Writing 100M timeline entries on every celebrity tweet is impossible. Hybrid: fanout-on-write for normal users, fanout-on-read (compute at view time) for celebrities.",
      },
      {
        question: "1B users × 100 events/day each. Daily event count is:",
        options:  ["1B", "10B", "100B", "1T"],
        answerIdx: 2,
        explanation: "1B × 100 = 100B events/day. Quick back-of-envelope: 100B / 86400 ≈ 1.1M events/sec average, with spikes 3–5×.",
      },
    ],
    8: [
      {
        question: "SLO is 99.9%. Monthly error budget is roughly:",
        options:  ["1 minute", "10 minutes", "43 minutes", "7 hours"],
        answerIdx: 2,
        explanation: "99.9% / month = 0.1% downtime = 0.001 × 43200 min ≈ 43 minutes. Three nines monthly = ~43 min, yearly = ~8.7h.",
      },
      {
        question: "Service is slow. Which observability pillar locates the bottleneck fastest?",
        options:  ["Logs", "Metrics", "Distributed traces", "Heap dumps"],
        answerIdx: 2,
        explanation: "Traces show end-to-end latency broken down per span — you see exactly which service / call took the time. Logs and metrics confirm but don't localise.",
      },
      {
        question: "Blue/green deploy means:",
        options:  ["Two versions run in parallel; switch traffic atomically", "Gradual percent rollout", "Deploy then test", "Rollback only"],
        answerIdx: 0,
        explanation: "Blue/green: full second environment runs the new version. Router flips traffic atomically. Canary is the gradual percentage approach.",
      },
    ],
    9: [
      {
        question: "First minute of any interview should be:",
        options:  ["Drawing the architecture", "Listing tech you know", "Clarifying scope + scale", "Picking a database"],
        answerIdx: 2,
        explanation: "Always start by clarifying. Skipping this is the most common reason candidates fail HLD.",
      },
      {
        question: "An interviewer's silence after you propose a solution usually means:",
        options:  ["They're impressed", "They want you to find the flaw yourself", "They forgot the question", "The interview is over"],
        answerIdx: 1,
        explanation: "Silence is a prompt. Walk through edge cases, trade-offs, and bottlenecks proactively — show you can self-critique.",
      },
      {
        question: "Time-management rule of thumb for a 45-min HLD interview:",
        options:  ["5/5/30/5", "10/5/20/10 (req/estimate/HLD/deep-dive+wrap)", "30 min HLD only", "Leave 20 min for questions"],
        answerIdx: 1,
        explanation: "Roughly 10 min on requirements + estimation, 20 on HLD, 10 on deep-dives, 5 on bottlenecks + wrap. Adjust per interviewer.",
      },
    ],
  },
};

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Seed example content — ${apply ? "APPLY" : "DRY RUN"}`);

  // ── Phase outcomes ─────────────────────────────────────────────────────────
  for (const [lang, byPhase] of Object.entries(PHASE_OUTCOMES)) {
    for (const [phaseStr, outcomes] of Object.entries(byPhase)) {
      const phaseNum = parseInt(phaseStr, 10);
      console.log(`  outcomes [${lang} p${phaseNum}] ${outcomes.length} items`);
      if (!apply) continue;
      await db.update(roadmapPhases)
        .set({ outcomes })
        .where(and(eq(roadmapPhases.language, lang), eq(roadmapPhases.phaseNumber, phaseNum)));
    }
  }

  // ── Week objectives ────────────────────────────────────────────────────────
  for (const [lang, byWeek] of Object.entries(WEEK_OBJECTIVES)) {
    for (const [weekStr, objectives] of Object.entries(byWeek)) {
      const weekNum = parseInt(weekStr, 10);
      console.log(`  objectives [${lang} w${weekNum}] ${objectives.length} items`);
      if (!apply) continue;
      // Look up week_id via join (week_number is unique within a language).
      await sql`
        UPDATE roadmap_weeks
        SET learning_objectives = ${objectives}
        WHERE phase_id IN (SELECT id FROM roadmap_phases WHERE language = ${lang})
          AND week_number = ${weekNum}
      `;
    }
  }

  // ── Checkpoints ────────────────────────────────────────────────────────────
  for (const [lang, byPhase] of Object.entries(PHASE_CHECKPOINTS)) {
    for (const [phaseStr, qs] of Object.entries(byPhase)) {
      const phaseNum = parseInt(phaseStr, 10);
      console.log(`  checkpoints [${lang} p${phaseNum}] ${qs.length} questions`);
      if (!apply) continue;
      // Wipe existing for this (lang, phase) so re-running stays deterministic
      await db.delete(phaseCheckpoints).where(and(
        eq(phaseCheckpoints.language, lang),
        eq(phaseCheckpoints.phaseNumber, phaseNum),
      ));
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        await db.insert(phaseCheckpoints).values({
          language:    lang,
          phaseNumber: phaseNum,
          question:    q.question,
          options:     q.options,
          answerIdx:   q.answerIdx,
          explanation: q.explanation,
          sortOrder:   i,
        });
      }
    }
  }

  if (!apply) {
    console.log();
    console.log("Run with --apply to commit.");
    return;
  }
  console.log("✅ Example content seeded");
}

main().catch((err) => {
  console.error("❌ Seed example content failed:", err);
  process.exit(1);
});
