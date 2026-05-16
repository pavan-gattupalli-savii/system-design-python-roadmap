// ── Seed 10 additional concepts ────────────────────────────────────────────────
// New concepts go straight to DB (the frontend's CONCEPTS array is now a
// migration artefact; runtime data comes from /api/concepts). Each concept
// follows the same shape as the original 27.
//
// Idempotent — upserts by slug. Pass --apply to write.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { concepts as conceptsTable } from "../src/db/schema.js";

interface ConceptSection {
  heading: string;
  body?:   string;
  bullets?: string[];
  callout?: { kind: "tip" | "note" | "warning"; text: string };
}

interface NewConcept {
  slug: string;
  title: string;
  emoji: string;
  category: string;
  tagline: string;
  sections: ConceptSection[];
  related: string[];
  roadmapKeywords: string[];
}

const CONCEPTS: NewConcept[] = [

  // ── 1. Idempotency ──────────────────────────────────────────────────────────
  {
    slug: "idempotency",
    title: "Idempotency",
    emoji: "🔁",
    category: "Architecture",
    tagline: "Calling the same API ten times should change the world once",
    roadmapKeywords: ["idempotency", "idempotent", "retry", "exactly once", "at least once", "duplicate", "payment", "webhook"],
    related: ["api-design", "message-queues", "circuit-breaker"],
    sections: [
      {
        heading: "What does idempotent mean?",
        body: `An operation is idempotent if calling it multiple times with the same arguments produces the same end-state as calling it once. That is the entire definition; everything else flows from it.

GET, PUT, DELETE are idempotent by spec. POST is not. That means a network retry of POST risks double-effects — a second order, a second charge, a second email. The fix is not to forbid retries; networks fail, retries are unavoidable. The fix is to make the operation tolerate them.

Why it matters in practice: every distributed system at scale runs into duplicate delivery. At-least-once message delivery is the default for Kafka, SQS, and most messaging systems. Network retries happen. Browser refreshes happen. Your endpoint will see the same request twice — design for it.`,
      },
      {
        heading: "Idempotency keys",
        body: `The standard solution: the client generates a unique idempotency key (a UUID) and sends it as a header (Idempotency-Key) or in the body. The server records the key on first acceptance. On any subsequent request with the same key, the server returns the cached response from the first call instead of executing the operation again.

Stripe popularised this pattern; their docs read like the canonical guide. AWS, Square, and most payment APIs follow the same approach.

Two design choices to make:
- Storage: idempotency keys are usually stored in Postgres with a UNIQUE index, not Redis. The DB unique constraint provides true atomicity; Redis-only solutions race under retry storms.
- TTL: keys are typically kept 24h to a few days. Long enough to cover retry storms; short enough to bound storage. Stripe defaults to 24 hours.`,
        callout: {
          kind: "warning",
          text: "If you store the response and serve it on retry, persist the exact response (status + body) — recomputing risks producing a different result if external state has changed.",
        },
      },
      {
        heading: "Idempotency at different layers",
        bullets: [
          "HTTP: idempotency key in a header; server caches response by key",
          "Message queue consumer: store (consumer-group, message-id) in a UNIQUE index before performing the side-effect — skip if already present",
          "Database: use INSERT … ON CONFLICT DO NOTHING for inserts that may be retried",
          "Event-sourced: deduplicate by event-id at the projection layer",
        ],
      },
      {
        heading: "Idempotent vs nullipotent vs safe",
        body: `Three related but distinct properties, easy to confuse in interviews:

- Safe: no side effects (GET). Reading a resource doesn't change it.
- Idempotent: same effect whether called once or N times (PUT, DELETE). Includes safe operations.
- Nullipotent: zero side effects on either call (a true no-op).

Examples: PUT /users/123 with the same body is idempotent (sets the resource to the same state every call). POST /orders creates a new order every call — not idempotent unless paired with an idempotency key.`,
      },
      {
        heading: "Common pitfalls",
        bullets: [
          "Storing idempotency state in Redis only — under retry storms a TTL gap can let two requests both 'win'. Use a DB UNIQUE constraint",
          "Replaying the operation on retry instead of returning the cached response — defeats the whole point",
          "Idempotency window too short — clients may legitimately retry minutes later (especially after circuit-breaker cooldowns)",
          "Mixing idempotency keys across endpoints — keep them scoped per route or use globally-unique keys",
        ],
      },
    ],
  },

  // ── 2. OAuth & JWT ──────────────────────────────────────────────────────────
  {
    slug: "oauth-jwt",
    title: "OAuth 2.0 & JWT",
    emoji: "🔐",
    category: "Architecture",
    tagline: "Delegated access for users, stateless tokens for services",
    roadmapKeywords: ["oauth", "oauth2", "jwt", "auth", "authentication", "authorization", "openid", "oidc", "sso", "refresh token"],
    related: ["api-design", "api-gateway"],
    sections: [
      {
        heading: "OAuth is not authentication",
        body: `Common confusion: OAuth 2.0 is an authorization protocol, not an authentication one. It lets your app act on behalf of a user against a resource server, without seeing their password. "Sign in with Google" works because Google built OpenID Connect (OIDC) — an authentication layer on top of OAuth.

The four roles in OAuth:
- Resource Owner — the user
- Client — your app
- Authorization Server — the identity provider (Google, Auth0, your own)
- Resource Server — the API serving protected data

The user authorizes the client at the authorization server, which issues an access token. The client presents the token to the resource server.`,
      },
      {
        heading: "Flows that matter",
        bullets: [
          "Authorization Code with PKCE — public clients (SPAs, mobile apps). The only flow you should use for browser/mobile in 2024+",
          "Client Credentials — service-to-service. No user involved; client authenticates itself",
          "Refresh Token — exchange a long-lived refresh token for a fresh access token without re-prompting the user",
          "Implicit (deprecated) — old SPA flow, vulnerable to token leakage via URL fragments",
          "Resource Owner Password Credentials (deprecated) — client sees the user's password; only acceptable for legacy migration",
        ],
        callout: {
          kind: "warning",
          text: "Never use the Implicit flow for new code. Always use Authorization Code with PKCE for browser and mobile clients.",
        },
      },
      {
        heading: "JWT structure",
        body: `A JWT is three base64url-encoded parts separated by dots: header.payload.signature

- Header: algorithm (e.g. RS256) and token type
- Payload: claims — sub (subject), iss (issuer), aud (audience), exp (expiry), iat (issued-at), plus custom claims like roles or tenant
- Signature: HMAC or RSA signature of header+payload, verifying the token wasn't tampered with

Critically: JWT is signed, not encrypted. Anyone can decode the payload — never put secrets or PII in JWT claims. Use JWE (JSON Web Encryption) if you need encryption.

Symmetric (HS256) signing: both signer and verifier share the secret. Fine for one-service systems. Bad for multi-service — every verifier becomes a potential leak.

Asymmetric (RS256) signing: issuer signs with private key; verifiers check with public key. Standard for federated systems and microservices. Verifiers can't forge tokens.`,
      },
      {
        heading: "Access tokens vs refresh tokens",
        body: `Two-token system is the standard pattern:

- Access token: short-lived (5-60 min). Carries claims. Sent on every request. If stolen, damage is bounded to its TTL. Stateless verification — no DB lookup per request.
- Refresh token: long-lived (days to weeks). Stored server-side. Used only to mint a new access token when the current one expires.

Refresh token rotation: each refresh issues a new refresh token and invalidates the old one. If an attacker steals a refresh token and uses it, the legitimate user's next refresh will fail (rotation breaks the chain), surfacing the breach. Implementations: persist refresh tokens with a 'family' identifier; revoke the whole family on detected misuse.`,
      },
      {
        heading: "Storing tokens in the browser",
        bullets: [
          "localStorage: XSS-readable. Any injected script can exfiltrate the token. Common but risky",
          "sessionStorage: same as localStorage, scoped to tab. Same XSS exposure",
          "HttpOnly Secure cookie: not readable by JavaScript. Safe from XSS but exposed to CSRF — pair with SameSite=Lax/Strict + CSRF tokens for mutating requests",
          "In-memory: safest, but lost on refresh — usually combined with HttpOnly cookie holding a refresh token",
        ],
        callout: {
          kind: "tip",
          text: "The OAuth Working Group's current recommendation: access tokens in memory, refresh tokens in HttpOnly Secure SameSite cookies, refresh-token rotation enabled. Avoids the XSS exposure of localStorage and the CSRF exposure of pure-cookie auth.",
        },
      },
    ],
  },

  // ── 3. gRPC ─────────────────────────────────────────────────────────────────
  {
    slug: "grpc",
    title: "gRPC",
    emoji: "⚡",
    category: "Networking",
    tagline: "Schema-first RPC over HTTP/2 with bidirectional streaming",
    roadmapKeywords: ["grpc", "rpc", "protobuf", "protocol buffers", "http2", "streaming"],
    related: ["api-design", "websockets"],
    sections: [
      {
        heading: "What gRPC is and isn't",
        body: `gRPC is a high-performance RPC framework from Google built on HTTP/2 and Protocol Buffers. You define services in a .proto schema; the toolchain generates client + server stubs in 10+ languages.

What it gives you over REST:
- Smaller wire format — protobuf binary is 3-10x smaller than JSON for typed data
- Strict schema — versioning is explicit, breaking changes show up at codegen time
- Bidirectional streaming over a single long-lived HTTP/2 connection
- Built-in deadlines, retries, load balancing, and auth interceptors

What it costs:
- Browsers can't speak gRPC directly — need gRPC-Web with a proxy
- Less ecosystem tooling than REST + JSON for debugging / curl-style ad-hoc calls
- Schema-first workflow means you need a build step between proto changes and code`,
      },
      {
        heading: "Four call patterns",
        bullets: [
          "Unary — single request, single response. The familiar REST-style call",
          "Server streaming — client sends one request, server sends a stream back (e.g. live tail of logs)",
          "Client streaming — client sends a stream, server replies once at the end (e.g. file upload)",
          "Bidirectional streaming — both sides stream simultaneously over the same connection (e.g. chat, live tracking)",
        ],
      },
      {
        heading: "When gRPC wins",
        bullets: [
          "Service-to-service calls inside your own network — typed contracts + small payloads",
          "High-throughput data planes (Envoy, Kubernetes use gRPC internally)",
          "Polyglot environments — one .proto generates Go, Java, Python, TypeScript clients",
          "Workloads that need streaming without WebSocket reinvention",
        ],
      },
      {
        heading: "When to stay with REST",
        bullets: [
          "Public APIs consumed by third-party browsers — gRPC-Web adds friction",
          "Workloads where humans interact (curl, Postman) — JSON is easier to debug",
          "Simple CRUD where the protobuf build pipeline isn't worth the speedup",
        ],
        callout: {
          kind: "tip",
          text: "Typical production split: REST for the public API (browser, mobile), gRPC for service-to-service calls inside the cluster. Pick per boundary.",
        },
      },
      {
        heading: "Schema evolution rules",
        body: `Protobuf is forward and backward compatible if you follow these rules:

- Never reuse a field number. Removed fields stay removed forever
- Never change a field's type — add a new field with a new number instead
- New fields must be optional in proto3 (the default)
- Mark deprecated fields with [deprecated = true] before removing them

Break these rules and old clients suddenly read garbage when new servers respond with the new schema. Treat field numbers like database primary keys — sacred.`,
      },
    ],
  },

  // ── 4. Eventual Consistency ──────────────────────────────────────────────────
  {
    slug: "eventual-consistency",
    title: "Eventual Consistency",
    emoji: "⏳",
    category: "Distributed Systems",
    tagline: "Reads converge on the truth — given enough time",
    roadmapKeywords: ["eventual consistency", "strong consistency", "consistency model", "linearizable", "read your writes", "monotonic"],
    related: ["cap-theorem", "replication", "two-phase-commit"],
    sections: [
      {
        heading: "What 'eventual' really means",
        body: `Eventual consistency guarantees that if no new writes happen, all replicas will converge to the same value eventually. It does not promise when. In the meantime, different clients may read different values for the same key.

This is the model behind DynamoDB defaults, Cassandra, DNS, Git, S3 (until 2020), and most CRDTs. It's the price you pay for availability under network partitions (the 'AP' choice in CAP).

The flip side — strong consistency — guarantees that after a write completes, every subsequent read returns the new value. Postgres single-leader is strongly consistent. Spanner achieves strong consistency globally via TrueTime.`,
      },
      {
        heading: "Stronger guarantees than 'eventual'",
        body: `Eventual is the weakest useful guarantee. Real systems usually want one of these stronger models without paying for full linearizability:

- Read-your-writes: a client always sees its own writes immediately. Doesn't matter if other clients see stale data
- Monotonic reads: once a client sees a value, subsequent reads return that value or a newer one — never an older one
- Monotonic writes: writes from a single client are applied in the order issued
- Consistent prefix: readers see writes in some valid causal order, even if delayed

Most apps need read-your-writes + monotonic reads at minimum. Without them, a user updates their profile, refreshes, and sees the old data — confusing.`,
        callout: {
          kind: "note",
          text: "Session consistency = read-your-writes + monotonic reads + monotonic writes. DynamoDB and Cosmos DB offer this as a configurable level — usually the right default for user-facing apps.",
        },
      },
      {
        heading: "How replicas converge",
        bullets: [
          "Last-write-wins (LWW): each write carries a timestamp; latest timestamp wins on conflict. Simple but loses concurrent writes",
          "Vector clocks: track per-replica versions; detect concurrent writes and surface conflicts for app to resolve",
          "CRDTs (Conflict-free Replicated Data Types): operations that commute by construction — counter increments, OR-sets. No conflicts to resolve",
          "Read repair: on read, compare replicas, propagate the latest. Used by Cassandra and DynamoDB",
          "Anti-entropy / Merkle trees: background process compares replicas, syncs differences. Used by Dynamo",
        ],
      },
      {
        heading: "Anomalies you'll see in practice",
        bullets: [
          "Stale reads after writes — user updates profile, refresh shows old name",
          "Lost updates — two clients update the same field; one overwrites the other",
          "Causal violations — comment appears before the post it replies to",
          "Time-travel — a value disappears for one reader and reappears for another",
        ],
      },
      {
        heading: "Designing for eventual consistency",
        bullets: [
          "Idempotent operations — retries during convergence don't break state",
          "Commutative operations where possible — order doesn't matter (counter increments, set unions)",
          "Conflict resolution policy declared upfront — LWW, app-level merge, or user-driven (like git merge conflicts)",
          "Show 'optimistic' UI updates locally — the user sees their write immediately, even if the server is still propagating",
        ],
      },
    ],
  },

  // ── 5. API Gateway ──────────────────────────────────────────────────────────
  {
    slug: "api-gateway",
    title: "API Gateway",
    emoji: "🚪",
    category: "Architecture",
    tagline: "The single front door to your backend",
    roadmapKeywords: ["api gateway", "gateway", "edge", "kong", "envoy", "spring cloud gateway", "rate limit"],
    related: ["microservices", "rate-limiting", "load-balancing", "oauth-jwt"],
    sections: [
      {
        heading: "What an API gateway does",
        body: `An API Gateway is a reverse proxy that sits between clients and your backend services. It's the single entrypoint for all external traffic. Every microservices architecture ends up needing one.

Responsibilities typically include:
- Routing — map URL paths to backend services
- Authentication — verify JWT/OAuth tokens; reject unauthenticated calls before they touch services
- Rate limiting — per-user, per-route, per-IP
- Request/response transformation — strip internal headers, add tracing IDs
- TLS termination — handle certificates centrally
- Observability — log every request, emit metrics, propagate trace context

Common products: Kong, Apigee, AWS API Gateway, Spring Cloud Gateway, Envoy, Traefik. Same shape, different tradeoffs.`,
      },
      {
        heading: "What it should NOT do",
        bullets: [
          "Business logic — gateway logic rots fast; keep it stateless and configuration-driven",
          "Per-service auth — service-specific authorization (e.g. 'is this user the owner of this resource?') belongs in the service",
          "Aggregation across services for every endpoint — that's BFF (Backend for Frontend) territory; gateways do generic concerns, BFFs do client-specific orchestration",
        ],
        callout: {
          kind: "warning",
          text: "An API gateway is not a microservice — it's infrastructure. Treat it the same way you'd treat nginx: configuration-managed, version-controlled, not a place to write code.",
        },
      },
      {
        heading: "Gateway vs Load Balancer vs Service Mesh",
        body: `Confusing because the categories overlap:

- Load balancer (L4 or L7): distributes traffic across replicas of one service. Cheap and dumb.
- API gateway: layer-7 reverse proxy with auth, rate-limiting, routing. Public-facing.
- Service mesh (Istio, Linkerd): handles service-to-service traffic inside the cluster — mTLS, retries, circuit breaking, observability. Usually one sidecar per pod.

A common stack: ALB/Cloudflare in front (DDoS protection + TLS) → API Gateway (auth, rate limit) → service mesh (internal routing, mTLS).`,
      },
      {
        heading: "Sizing and scaling concerns",
        bullets: [
          "Single point of failure — run multiple replicas behind a load balancer; don't deploy the gateway as one box",
          "Latency budget — the gateway adds ~1-5ms; tune timeouts to avoid cascading slow services",
          "Configuration reload — gateways should hot-reload routing rules; restart-to-change is unacceptable in prod",
          "Tracing — the gateway is the obvious place to mint trace-ids and propagate them forward",
        ],
      },
    ],
  },

  // ── 6. Backpressure ─────────────────────────────────────────────────────────
  {
    slug: "backpressure",
    title: "Backpressure",
    emoji: "🌊",
    category: "Distributed Systems",
    tagline: "When the producer is faster than the consumer, push back",
    roadmapKeywords: ["backpressure", "back pressure", "flow control", "queue", "buffer", "overload", "shedding"],
    related: ["message-queues", "rate-limiting", "circuit-breaker"],
    sections: [
      {
        heading: "The problem backpressure solves",
        body: `Every pipeline has a producer and a consumer. When the producer outpaces the consumer, queues grow. Unbounded growth means OOM, blown latency tails, or service crash. Bounded queues that silently drop means lost data. Backpressure is the third option: tell the producer to slow down.

You see it everywhere: HTTP client overwhelming server, Kafka producer ahead of consumers, fast WebSocket sender, batch job feeding a DB write path. Without backpressure, the slowest component becomes a queue that grows until something breaks.`,
      },
      {
        heading: "Three ways to handle overload",
        bullets: [
          "Buffer — store excess work in a queue. Works until the queue fills",
          "Drop — discard messages above capacity. Cheap but loses data",
          "Backpressure — push the slowness back to the producer; producer either pauses or sheds load upstream",
        ],
        callout: {
          kind: "note",
          text: "Backpressure is the only one that propagates the problem to where it can be solved — at the source. The buffer + drop approaches just defer the failure until later.",
        },
      },
      {
        heading: "Common backpressure mechanisms",
        bullets: [
          "Bounded queue with blocking puts — producer thread blocks when queue is full (Java's ArrayBlockingQueue)",
          "Bounded queue with reactive semantics — producer pulls demand from consumer via request(N) signals (Reactive Streams, Project Reactor, Akka Streams)",
          "TCP window — receiver advertises remaining buffer space; sender stops sending when window=0",
          "HTTP/2 flow control — explicit WINDOW_UPDATE frames between client and server",
          "Kafka consumer lag → producer throttling via custom logic",
        ],
      },
      {
        heading: "Reactive Streams in one paragraph",
        body: `The Reactive Streams spec (adopted by RxJava, Project Reactor, Akka Streams, and JDK Flow) is the most influential backpressure protocol. The consumer signals demand by calling request(N) on the subscription; the producer is forbidden from sending more than N items until the next request. This makes backpressure explicit and language-agnostic. Every modern reactive library converges on this contract.`,
      },
      {
        heading: "Load shedding",
        body: `When backpressure isn't possible (you can't pause an external producer), shed load instead: drop low-priority requests, return 503 early, serve cached responses. The goal is to keep the service responsive for the work it can handle, even if some requests are refused. Better to fail 20% of requests cleanly than to crash and fail 100%.`,
      },
    ],
  },

  // ── 7. Heartbeats & Failure Detection ───────────────────────────────────────
  {
    slug: "heartbeats",
    title: "Heartbeats & Failure Detection",
    emoji: "💓",
    category: "Distributed Systems",
    tagline: "How distributed systems decide a peer has died",
    roadmapKeywords: ["heartbeat", "failure detection", "phi accrual", "gossip", "membership", "liveness"],
    related: ["leader-election", "service-mesh", "consistent-hashing"],
    sections: [
      {
        heading: "The fundamental problem",
        body: `Distributed systems must decide when to treat a peer as failed. They can't ask the peer ('are you alive?') — that's exactly what's failing. They infer liveness from observable signals: heartbeats, response times, timeouts.

The hard truth: you can never be certain a node is down. The network might just be slow. Picking a timeout is a tradeoff:
- Short timeout → fast failover but false positives (healthy nodes marked dead)
- Long timeout → fewer false positives but slow failover, service stays partially down longer

This is impossibility-of-failure-detection-in-asynchronous-systems territory (FLP). All practical detectors are heuristics.`,
      },
      {
        heading: "Push vs pull heartbeats",
        bullets: [
          "Push: each node periodically sends 'I'm alive' to a monitor. Monitor declares node dead if no heartbeat in N intervals. Simple; common in Kubernetes liveness probes, Eureka",
          "Pull: monitor periodically asks 'are you alive?'. Better for monitoring third-party services that can't push to you. Used by Prometheus scraping",
          "Gossip: nodes exchange liveness info with random peers. No central monitor; eventually-consistent membership. Used by Cassandra, Consul, Akka Cluster",
        ],
      },
      {
        heading: "Phi-Accrual Failure Detector",
        body: `The state-of-the-art heuristic, used by Cassandra and Akka. Instead of a binary alive/dead decision, the detector outputs a suspicion level (phi) that rises with elapsed time since the last heartbeat.

phi = -log10(P(future heartbeat arrives within elapsed time)), based on observed inter-arrival history.

Threshold of phi=8 typically means '99.99% confident the node is down'. Applications choose thresholds per use case — leader election might use phi=12 (very confident), load balancing might use phi=4 (fast failover, accept some false positives).

The win: adapts to actual network conditions instead of a hard-coded timeout. Slow but reliable connections don't trigger false positives the way fixed timeouts do.`,
      },
      {
        heading: "Kubernetes liveness vs readiness vs startup",
        bullets: [
          "Liveness probe: 'should I restart this container?' Failure → kill + restart pod",
          "Readiness probe: 'should I send traffic to this pod?' Failure → remove from service endpoints; container stays running",
          "Startup probe: 'has the container finished initialising?' Used to delay liveness/readiness for slow-starting apps",
        ],
        callout: {
          kind: "warning",
          text: "Don't make liveness probes depend on downstreams. If your DB is slow, liveness should still pass — otherwise every replica restarts simultaneously, multiplying the outage.",
        },
      },
    ],
  },

  // ── 8. Leader Election ──────────────────────────────────────────────────────
  {
    slug: "leader-election",
    title: "Leader Election",
    emoji: "👑",
    category: "Distributed Systems",
    tagline: "Pick one — and one only — to coordinate the cluster",
    roadmapKeywords: ["leader election", "raft", "paxos", "consensus", "zookeeper", "etcd", "coordination"],
    related: ["heartbeats", "two-phase-commit", "cap-theorem"],
    sections: [
      {
        heading: "Why elect a leader at all?",
        body: `Many distributed problems collapse to a much simpler design once a single coordinator exists. Database replication needs a leader to order writes. A scheduled job needs exactly one runner. A distributed lock needs an owner. Pick a leader, route the coordination work through it, and step back.

The challenges: nodes can fail, networks can partition, multiple leaders can think they're the leader simultaneously (split-brain). Leader election protocols are designed to make that risk small enough to ignore.`,
      },
      {
        heading: "Approaches",
        bullets: [
          "Lease-based (Redis Redlock, Chubby) — leader holds a time-bound lease; renew or lose it. Simple but clock-skew sensitive",
          "Raft / Paxos — full consensus protocol; leaders elected per term. Used by etcd, Consul, Kafka KRaft, CockroachDB",
          "ZooKeeper ephemeral nodes — the node that creates the lowest-numbered sequential znode wins; ephemeral znode disappears when its owner dies",
          "Bully algorithm — academic; nodes with higher IDs override others. Rarely used in practice",
        ],
      },
      {
        heading: "The split-brain problem",
        body: `Split-brain: two nodes simultaneously believe they are leader. Each accepts writes; the data diverges. When the partition heals, the system has two inconsistent histories and no clean way to merge.

Mitigations:
- Fencing tokens: every leader operation includes a monotonically-increasing token. The storage layer rejects operations with stale tokens. Even if two nodes think they're leader, only the higher-token one's writes succeed.
- Quorum reads/writes: require majority acks for every operation; minority partitions can't make progress.
- STONITH ("shoot the other node in the head"): explicitly kill peers before assuming leadership. Common in HA databases.`,
        callout: {
          kind: "warning",
          text: "Time-based leases without fencing tokens are a famous failure mode. Martin Kleppmann's 'How to do distributed locking' post is required reading on why Redis-only locks are usually wrong.",
        },
      },
      {
        heading: "Practical reality",
        body: `In 2024+, almost no team writes consensus from scratch. The standard path is to delegate to a battle-tested coordinator: etcd, ZooKeeper, or Consul. Your application code uses primitives like 'try to acquire lock L for 30 seconds; if I get it, I'm the leader for that scope'.

Kubernetes' leader-election library (used by every controller) is a textbook example: a config map with a leader annotation, renewed via a lease. Simple from the consumer's perspective; the heavy lifting lives in etcd underneath.`,
      },
    ],
  },

  // ── 9. Change Data Capture ──────────────────────────────────────────────────
  {
    slug: "cdc",
    title: "Change Data Capture (CDC)",
    emoji: "📡",
    category: "Database",
    tagline: "Stream every row change out of your database",
    roadmapKeywords: ["cdc", "change data capture", "debezium", "outbox", "wal", "logical replication", "streaming"],
    related: ["replication", "event-sourcing", "message-queues"],
    sections: [
      {
        heading: "What CDC is",
        body: `Change Data Capture turns every INSERT/UPDATE/DELETE in a database into an event on a stream. Instead of polling 'what changed since last time?', downstream systems subscribe to a real-time stream of row-level changes.

The mechanism in Postgres: logical replication reads the write-ahead log (WAL). In MySQL: the binlog. The CDC tool (Debezium is the most popular) plugs into that log and emits an event per change to Kafka.

Why it matters: it turns your operational DB into a source-of-truth event stream without requiring application code changes. The DB becomes the contract; every downstream system reads the same canonical stream.`,
      },
      {
        heading: "Common use cases",
        bullets: [
          "Cache invalidation — when a row changes, invalidate / refresh the Redis entry",
          "Search index sync — keep Elasticsearch in sync with Postgres without dual-writes",
          "Data lake / warehouse ingestion — stream changes into S3 / Snowflake / BigQuery in near-real-time",
          "Microservice integration — other services subscribe to your DB's change stream rather than calling your API",
          "Audit log — every change becomes an immutable record automatically",
        ],
      },
      {
        heading: "Why dual-writes are wrong",
        body: `The naive alternative — app writes to DB and Kafka in the same transaction — doesn't work. The two systems can't be in a distributed transaction, so partial failures leave them out of sync. App writes to DB succeed, Kafka write fails: cache is stale forever. The opposite: Kafka write succeeds, DB rollback: phantom event in the stream.

CDC bypasses this. The DB is the source of truth; the CDC tool reads its WAL after commit. Events are emitted only for changes that actually committed. Atomicity for free.

The pure-app alternative is the Outbox Pattern: app writes to the DB and an 'outbox' table in the same transaction; a separate worker reads the outbox and publishes to Kafka. Same atomicity guarantees without an external CDC tool — but more app code.`,
      },
      {
        heading: "Operational gotchas",
        bullets: [
          "WAL retention — if a consumer falls behind, WAL grows unbounded. Configure retention carefully",
          "Schema changes — DDL events need a strategy; Debezium emits a 'DDL change' event but downstream may need manual intervention",
          "Snapshots vs streaming — initial sync requires snapshotting; downstream sees the snapshot once, then live stream",
          "Ordering — CDC guarantees per-row ordering; cross-row ordering is best-effort. Don't assume global ordering",
        ],
        callout: {
          kind: "tip",
          text: "Run Debezium in distributed mode (Kafka Connect cluster) for production. Single-node mode is fine for dev; not for ops.",
        },
      },
    ],
  },

  // ── 10. Snowflake IDs ───────────────────────────────────────────────────────
  {
    slug: "snowflake-ids",
    title: "Snowflake-style IDs",
    emoji: "❄️",
    category: "Architecture",
    tagline: "Distributed unique IDs without coordination",
    roadmapKeywords: ["snowflake", "uuid", "id generation", "unique id", "ulid", "ksuid", "sortable"],
    related: ["sharding", "consistent-hashing"],
    sections: [
      {
        heading: "Why not just use UUIDs?",
        body: `UUIDs (v4) are random 128-bit identifiers. They work — but at scale they have two problems:

- B-tree index fragmentation: random insertions land all over the index, causing page splits and cache misses. Every insert touches a different B-tree page; cache hit rate plummets.
- Not sortable: you can't ORDER BY id and get chronological order. Need a separate created_at column.

Snowflake IDs solve both: 64-bit, time-prefixed, sortable, generated without coordination. Twitter created the original for tweet IDs. Discord, Instagram, Sony, and many others use variants.`,
      },
      {
        heading: "Anatomy of a Twitter Snowflake",
        body: `64 bits laid out as:
- 1 bit: unused (always 0; ensures positive signed integer)
- 41 bits: timestamp in milliseconds since a custom epoch (gives ~69 years)
- 10 bits: machine ID (supports 1024 generator instances)
- 12 bits: sequence number within the millisecond (supports 4096 IDs per ms per machine)

Total: 4096 × 1024 = 4.2M unique IDs per millisecond globally. At Twitter scale, this is comfortable.

Each generator coordinates only with itself — no DB lookup, no network call, no central counter. A machine just needs a unique machine-ID at startup (often from ZooKeeper or env config).`,
      },
      {
        heading: "Variants worth knowing",
        bullets: [
          "ULID — 128-bit, lexicographically sortable, base32-encoded. More readable than UUID, sortable like Snowflake",
          "KSUID — 27-character sortable string. Lexicographic order ≈ timestamp order. Used at Segment",
          "UUIDv7 — new spec (2022): time-ordered UUID. Drop-in replacement that fixes the B-tree fragmentation issue",
          "Sonyflake — Sony's variant; smaller machine-id field, larger time field (~174 years)",
          "Discord Snowflake — same shape as Twitter's but with a different epoch (2015-01-01)",
        ],
        callout: {
          kind: "tip",
          text: "For most new systems in 2024+: use UUIDv7. It's a standardised drop-in replacement for UUIDv4 that preserves sortability without the coordination cost of Snowflake.",
        },
      },
      {
        heading: "Clock-skew gotcha",
        body: `Snowflake assumes monotonic clocks. If a server's clock jumps backward (NTP correction, leap second), the generator may produce a duplicate ID. Twitter's original implementation refuses to mint IDs during a backward clock drift. Most others wait for the clock to catch up before resuming.

Practical lesson: enable NTP smearing (or chrony with smooth corrections) on every generator host. Hard time jumps will eventually bite you.`,
      },
      {
        heading: "When you don't need this",
        body: `If your service can use a single Postgres sequence (single primary, no sharding), don't reach for Snowflake. BIGSERIAL is faster, simpler, and gives you sortable IDs by definition. Snowflake earns its complexity only when you've outgrown single-leader DB capacity or need ID generation without DB access.`,
      },
    ],
  },
];

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Seed ${CONCEPTS.length} new concepts — ${apply ? "APPLY" : "DRY RUN"}`);

  for (const c of CONCEPTS) {
    console.log(`  ${c.emoji} ${c.title.padEnd(28)} (${c.category}) sections=${c.sections.length} keywords=${c.roadmapKeywords.length}`);
    if (!apply) continue;
    // Use sort_order = 100+ so they sort after the original 27 (which used 0..26)
    const sortOrder = 100 + CONCEPTS.indexOf(c);
    await db.insert(conceptsTable)
      .values({
        slug:             c.slug,
        title:            c.title,
        emoji:            c.emoji,
        category:         c.category,
        tagline:          c.tagline,
        sections:         c.sections,
        related:          c.related,
        roadmapKeywords:  c.roadmapKeywords,
        sortOrder,
      })
      .onConflictDoUpdate({
        target: conceptsTable.slug,
        set: {
          title:            c.title,
          emoji:            c.emoji,
          category:         c.category,
          tagline:          c.tagline,
          sections:         c.sections,
          related:          c.related,
          roadmapKeywords:  c.roadmapKeywords,
          sortOrder,
        },
      });
  }

  if (!apply) console.log(`Run with --apply to commit.`);
  else        console.log(`✅ Inserted/updated ${CONCEPTS.length} concepts`);
}

main().catch((err) => {
  console.error("❌ Seed new concepts failed:", err);
  process.exit(1);
});
