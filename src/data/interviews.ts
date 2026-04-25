// ── INTERVIEWS DATA ───────────────────────────────────────────────────────────
// Curated system design + behavioral interview questions.
// Each entry has hints (key points to hit), follow-ups, and company tags.
//
// HOW TO CONTRIBUTE:
//   1. Fork the repo, add your entry to INTERVIEWS array (next id)
//   2. Open a Pull Request — maintainer reviews and merges
//   3. Site auto-deploys via GitHub Actions on merge
//
// FIELDS:
//   id          — auto-increment
//   category    — one of CATEGORIES
//   title       — the question as asked by the interviewer
//   difficulty  — "Easy" | "Medium" | "Hard"
//   companies   — companies known to ask this (lowercase, e.g. ["amazon"])
//   topics      — kebab-case topic tags
//   hints       — ordered list of key points the answer must cover
//   followUps   — optional: likely follow-up questions
//   addedOn     — ISO date YYYY-MM-DD

export interface InterviewQ {
  id:          number;
  category:    string;
  title:       string;
  difficulty:  "Easy" | "Medium" | "Hard";
  companies:   string[];
  topics:      string[];
  hints:       string[];
  followUps?:  string[];
  addedOn:     string;
  /** Community-contributed answer documents (Google Docs, Gist links, etc.) */
  answerDocs?: { id?: number; label: string; url: string; by: string; github?: string | null; addedOn: string }[];
}

export const CATEGORIES = [
  "System Design",
  "Behavioral",
  "Databases",
  "Networking",
  "Concepts",
  "Architecture",
] as const;

export const COMPANIES = [
  "Amazon", "Google", "Meta", "Microsoft", "Apple",
  "Netflix", "Uber", "Airbnb", "Twitter", "LinkedIn",
  "Stripe", "Shopify", "Atlassian", "Oracle", "ByteDance",
] as const;

// ── Interview questions ───────────────────────────────────────────────────────
export const INTERVIEWS: InterviewQ[] = [
  {
    id: 1,
    category: "System Design",
    title: "Design a URL shortener (like bit.ly)",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Microsoft"],
    topics: ["hashing", "databases", "caching", "hld"],
    hints: [
      "Estimate scale: how many URLs/day, reads vs writes ratio",
      "Choose a short code strategy: Base62 encoding vs MD5 hash prefix",
      "Pick storage: NoSQL (DynamoDB/Cassandra) for high-read throughput",
      "Add a caching layer (Redis) in front of DB for hot URLs",
      "Handle redirects via 301 (permanent) vs 302 (temporary) and their caching implications",
      "Consider custom aliases and expiry TTL",
    ],
    followUps: [
      "How would you handle 10 billion URLs?",
      "How do you prevent abuse / spam links?",
      "How would analytics (click counts, geo) work?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 2,
    category: "System Design",
    title: "Design a rate limiter",
    difficulty: "Medium",
    companies: ["Stripe", "Google", "Amazon", "Netflix"],
    topics: ["rate-limiting", "redis", "api-design", "distributed-systems"],
    hints: [
      "Clarify scope: per user, per IP, or per API key; hard vs soft limit",
      "Compare algorithms: Token Bucket (smooth), Leaky Bucket, Fixed Window, Sliding Window Log, Sliding Window Counter",
      "For distributed systems, use Redis with atomic Lua scripts or INCR + EXPIRE",
      "Return HTTP 429 with Retry-After header",
      "Handle race conditions in distributed counters (INCR is atomic in Redis)",
      "Consider in-memory counters per node + periodic sync for very high throughput",
    ],
    followUps: [
      "What algorithm would you use for a payment API vs a search API?",
      "How do you prevent a single Redis node from being a bottleneck?",
      "How would you rate-limit at the API gateway level?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 3,
    category: "System Design",
    title: "Design Netflix / a video streaming platform",
    difficulty: "Hard",
    companies: ["Netflix", "Amazon", "Google", "Meta"],
    topics: ["streaming", "cdn", "encoding", "scale", "hld"],
    hints: [
      "Separate upload pipeline (async transcoding) from playback pipeline",
      "Use Adaptive Bitrate Streaming (ABR): HLS or DASH, multiple quality levels",
      "CDN placement: push popular content to edge nodes, use origin for long-tail",
      "Metadata service (titles, thumbnails) separate from video blob storage",
      "Resumable uploads and chunk-based storage (S3 multipart)",
      "Recommendation engine is a separate concern — mention it but don't deep-dive unless asked",
    ],
    followUps: [
      "How would you handle live streaming vs on-demand?",
      "How does Netflix decide which CDN node to serve?",
      "How would you implement a 'watch party' feature?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 4,
    category: "System Design",
    title: "Design a notification service (push / email / SMS)",
    difficulty: "Medium",
    companies: ["Meta", "Amazon", "Uber", "LinkedIn"],
    topics: ["messaging", "queues", "fanout", "reliability"],
    hints: [
      "Decouple producers from senders using a message queue (Kafka / SQS)",
      "Separate workers for each channel: push (APNs / FCM), email (SES), SMS (Twilio)",
      "Store notification preferences per user; respect opt-out / quiet hours",
      "Handle delivery guarantees: at-least-once + idempotency key to prevent duplicates",
      "Priority queue: critical alerts bypass normal queue",
      "Track delivery status and allow retries with exponential backoff",
    ],
    followUps: [
      "How would you handle 10M notifications in a burst (e.g., product launch)?",
      "How do you handle a user who uninstalls the app?",
      "How would you implement notification grouping / digest?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 5,
    category: "System Design",
    title: "Design a distributed message queue (like Kafka)",
    difficulty: "Hard",
    companies: ["Amazon", "LinkedIn", "Uber", "Netflix"],
    topics: ["kafka", "messaging", "partitioning", "replication", "distributed-systems"],
    hints: [
      "Partition topics for parallelism; each partition is an ordered, append-only log",
      "Replication factor >= 3: leader handles reads/writes, followers replicate",
      "Consumer groups for parallel consumption; each partition consumed by one consumer in a group",
      "Offset management: consumer tracks where it has read (Kafka stores in __consumer_offsets)",
      "Retention policy: time-based or size-based; enable replay",
      "Producer acknowledgements: acks=0 (fire-and-forget), acks=1 (leader), acks=all (all ISR)",
    ],
    followUps: [
      "How do you handle a slow consumer?",
      "How does Kafka achieve exactly-once semantics?",
      "What is the difference between Kafka and RabbitMQ?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 6,
    category: "System Design",
    title: "Design a key-value store (like Redis)",
    difficulty: "Hard",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    topics: ["key-value", "storage", "hashing", "replication", "lld"],
    hints: [
      "In-memory hash table with O(1) get/set; eviction policy (LRU, LFU)",
      "Persistence: AOF (append-only file) for durability vs RDB snapshots for speed",
      "Replication: single-leader with read replicas; RESP protocol",
      "Partitioning: consistent hashing so adding/removing nodes minimises rebalancing",
      "Cluster mode: multiple shards, each shard has primary + replicas",
      "Expiry: background thread + lazy expiry on access",
    ],
    followUps: [
      "How do you handle hot keys in a distributed cache?",
      "How does Redis handle transactions?",
      "What is the difference between Redis and Memcached?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 7,
    category: "System Design",
    title: "Design Twitter's home timeline feed",
    difficulty: "Hard",
    companies: ["Twitter", "Meta", "LinkedIn"],
    topics: ["fanout", "caching", "social-graph", "scale"],
    hints: [
      "Fanout on write (push model): precompute feed on tweet creation — fast reads, expensive writes for celebrities",
      "Fanout on read (pull model): compute feed on demand — simple writes, slow reads at scale",
      "Hybrid: push for normal users, pull for high-follower users (celebrities)",
      "Use a sorted set in Redis per user as the feed cache (score = timestamp)",
      "Paginate with cursor-based pagination, not offset",
      "CDN for media (images, video) separate from text feed",
    ],
    followUps: [
      "How would you handle a celebrity with 100M followers tweeting?",
      "How do you rank tweets (relevance vs chronological)?",
      "How would you implement 'trending topics'?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 8,
    category: "Concepts",
    title: "Explain CAP theorem. Which trade-off does your favourite database make?",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Netflix", "Stripe"],
    topics: ["cap-theorem", "consistency", "availability", "partition-tolerance"],
    hints: [
      "CAP: in a network partition, you must choose Consistency OR Availability",
      "CP systems: reject requests rather than return stale data (Zookeeper, HBase)",
      "AP systems: return potentially stale data rather than fail (Cassandra, DynamoDB)",
      "PACELC extends CAP: even without partition, there is Latency vs Consistency trade-off",
      "Strong consistency (linearisability) vs eventual consistency vs causal consistency",
      "Give a concrete example: Cassandra AP — tunable consistency with quorum reads/writes",
    ],
    followUps: [
      "Is it ever possible to have all three?",
      "How does Cassandra achieve tunable consistency?",
      "How does Google Spanner claim to be CA?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 9,
    category: "Databases",
    title: "When would you choose NoSQL over SQL? Give a real-world example.",
    difficulty: "Easy",
    companies: ["Amazon", "Meta", "Netflix", "Uber"],
    topics: ["nosql", "sql", "databases", "schema-design"],
    hints: [
      "SQL: ACID, structured schema, complex joins — use for financials, user accounts",
      "NoSQL: horizontal scale, flexible schema, high write throughput — use for catalogs, sessions, events",
      "Document store (MongoDB) for nested, variable schema (product catalog)",
      "Column-family (Cassandra) for time-series, write-heavy, wide rows",
      "Key-value (Redis/DynamoDB) for sessions, caching, leaderboards",
      "Always mention the specific access pattern driving the choice",
    ],
    followUps: [
      "Can you use both in the same system?",
      "How do you handle schema migrations in a NoSQL store?",
      "What are the trade-offs of DynamoDB vs PostgreSQL for a user profile store?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 10,
    category: "Behavioral",
    title: "Tell me about a time you had to make a technical decision under uncertainty.",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    topics: ["leadership", "decision-making", "communication"],
    hints: [
      "Use STAR format: Situation → Task → Action → Result",
      "Emphasise data you gathered to reduce uncertainty (spikes, prototypes, benchmarks)",
      "Show you weighed trade-offs explicitly, not just picked an option",
      "Describe how you got team buy-in even without full confidence",
      "Quantify the outcome if possible (latency improvement, cost saving, incident reduction)",
      "Reflect on what you learned or would do differently",
    ],
    followUps: [
      "What would you have done if the decision turned out to be wrong?",
      "How did you communicate the risk to stakeholders?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 11,
    category: "Behavioral",
    title: "Describe a situation where you disagreed with your team or manager.",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Netflix"],
    topics: ["leadership", "communication", "conflict-resolution"],
    hints: [
      "Use STAR; pick a technical disagreement rather than personal conflict",
      "Show you raised your concern with data/evidence, not just opinion",
      "Demonstrate you listened to the other side genuinely",
      "Result: either you changed their mind or gracefully accepted the final call",
      "Avoid making the other party look bad in your story",
      "Amazon LP angle: 'Have Backbone; Disagree and Commit'",
    ],
    followUps: [
      "What did you learn from the experience?",
      "How do you handle it when a decision you disagreed with turns out to be right?",
    ],
    addedOn: "2026-04-25",
  },
  {
    id: 12,
    category: "Networking",
    title: "What happens when you type https://www.google.com in a browser?",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Microsoft", "Meta"],
    topics: ["dns", "tcp", "http", "tls", "networking"],
    hints: [
      "DNS resolution: browser cache → OS cache → recursive resolver → authoritative NS",
      "TCP 3-way handshake to establish connection",
      "TLS handshake: cipher negotiation, certificate validation, session keys",
      "HTTP/2 or HTTP/3 (QUIC) request/response",
      "Server processing: load balancer → app server → DB/cache",
      "Browser parses HTML, fetches sub-resources (CSS, JS, images) — critical render path",
    ],
    followUps: [
      "How does HTTP/2 multiplexing improve on HTTP/1.1?",
      "What is HSTS and why does it matter?",
      "How does a CDN fit into this picture?",
    ],
    addedOn: "2026-04-25",
  },
];

// ── Interview Experiences ─────────────────────────────────────────────────────
// Real interview experience posts shared on LinkedIn, YouTube, blogs etc.
// Contributors share their experience; upvotes reflect community value.
//
// HOW TO CONTRIBUTE:
//   1. Fork + add entry to EXPERIENCES array (next id)
//   2. Open a Pull Request — site auto-deploys on merge via GitHub Actions

export type ExpPlatform =
  | "YouTube" | "LinkedIn" | "Blog" | "Reddit" | "Medium"
  | "Dev.to" | "Blind" | "Twitter" | "Discord" | "Other";

export type ExpOutcome = "Offer" | "Rejected" | "Ongoing" | "Unknown";

export const EXP_PLATFORMS: ExpPlatform[] = [
  "YouTube", "LinkedIn", "Blog", "Medium", "Reddit",
  "Dev.to", "Blind", "Twitter", "Discord", "Other",
];

export const EXP_OUTCOMES: ExpOutcome[] = ["Offer", "Rejected", "Ongoing", "Unknown"];

export interface InterviewExp {
  id:          number;
  platform:    ExpPlatform;
  company:     string;
  role:        string;
  title:       string;
  url:         string;
  addedBy:     string;
  githubUser?: string;
  linkedin?:   string;
  topics:      string[];
  outcome?:    ExpOutcome;
  upvotes:     number;
  addedOn:     string;
  notes?:      string;
}

export const EXPERIENCES: InterviewExp[] = [
  {
    id: 1,
    platform: "LinkedIn",
    company: "Google",
    role: "Senior SDE (L5)",
    title: "Google L5 System Design — 3 rounds, got offer",
    url: "https://www.linkedin.com/feed/",
    addedBy: "Pavan Gattupalli",
    githubUser: "pavan-gattupalli-savii",
    topics: ["hld", "distributed-systems", "caching"],
    outcome: "Offer",
    upvotes: 24,
    addedOn: "2026-04-20",
    notes: "Covers URL shortener design, notification system, and leadership principle rounds.",
  },
  {
    id: 2,
    platform: "YouTube",
    company: "Amazon",
    role: "SDE II",
    title: "Amazon SDE2 Interview — System Design + Leadership Principles walkthrough",
    url: "https://www.youtube.com/",
    addedBy: "Rajesh Kumar",
    topics: ["lld", "behavioral", "amazon-lp", "rate-limiting"],
    outcome: "Offer",
    upvotes: 18,
    addedOn: "2026-04-15",
    notes: "Interviewer went deep on LP stories. Very detailed breakdown of the design round.",
  },
  {
    id: 3,
    platform: "Medium",
    company: "Meta",
    role: "E5 Software Engineer",
    title: "Failing the Meta system design round — and what I learned",
    url: "https://medium.com/",
    addedBy: "Priya Sharma",
    topics: ["hld", "distributed-systems", "failure-analysis", "newsfeed"],
    outcome: "Rejected",
    upvotes: 31,
    addedOn: "2026-04-10",
    notes: "Great breakdown of what interviewers look for vs. what candidates assume. Highly recommended.",
  },
  {
    id: 4,
    platform: "Blind",
    company: "Netflix",
    role: "Senior Engineer",
    title: "Netflix senior SWE interview process — 5 rounds detailed",
    url: "https://www.teamblind.com/",
    addedBy: "Arun Menon",
    topics: ["streaming", "distributed-systems", "cdn", "behavioral"],
    outcome: "Offer",
    upvotes: 14,
    addedOn: "2026-04-05",
  },
  {
    id: 5,
    platform: "Blog",
    company: "Stripe",
    role: "Backend Engineer",
    title: "How I prepared for Stripe’s system design interview in 4 weeks",
    url: "https://dev.to/",
    addedBy: "Sneha Iyer",
    topics: ["payments", "idempotency", "api-design", "rate-limiting"],
    outcome: "Offer",
    upvotes: 22,
    addedOn: "2026-03-28",
    notes: "Focus on idempotency and distributed transactions. Stripe goes very deep on correctness.",
  },
];
