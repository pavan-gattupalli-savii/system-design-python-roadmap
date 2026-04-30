// ── Seed script ──────────────────────────────────────────────────────────────
// Run with: npx tsx src/seed.ts
// Inserts curated readings, interview experiences, questions, and answer docs.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema.js";

const SUBMITTED_BY = "09a53f50-c795-4a31-8d19-48d34a9cc846";

const sql = neon(process.env.DATABASE_URL!);
const db  = drizzle(sql, { schema });

// ── Readings ──────────────────────────────────────────────────────────────────
const readings = [
  {
    type: "Blog",
    title: "Designing Netflix — How 1M users stream simultaneously",
    url: "https://blog.bytebytego.com/p/netflix-system-design",
    topics: ["streaming", "cdn", "scale", "hld"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Brilliant breakdown of edge-caching and adaptive bitrate streaming.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "CAP Theorem explained with real examples",
    url: "https://blog.bytebytego.com/p/cap-theorem",
    topics: ["cap-theorem", "distributed-systems", "consistency"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Visual walkthrough with Cassandra / ZooKeeper comparisons.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "YouTube",
    title: "ByteByteGo — How does a CDN work?",
    url: "https://www.youtube.com/watch?v=RI9np1LWzqw",
    topics: ["cdn", "caching", "networking"],
    difficulty: "Beginner",
    upvotes: 0,
    notes: null,
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Book",
    title: "Designing Data-Intensive Applications — Ch. 5: Replication",
    url: "https://dataintensive.net/",
    topics: ["replication", "databases", "consistency", "ddia"],
    difficulty: "Advanced",
    upvotes: 0,
    notes: "Kleppmann's masterpiece. Leader election, replication lag, read-your-writes.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "How Discord Stores Billions of Messages",
    url: "https://discord.com/blog/how-discord-stores-billions-of-messages",
    topics: ["cassandra", "databases", "scale", "hld"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Real-world migration from MongoDB to Cassandra. Great for write-heavy systems.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "System Design — Consistent Hashing",
    url: "https://blog.bytebytego.com/p/consistent-hashing",
    topics: ["consistent-hashing", "distributed-systems", "load-balancing"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Virtual nodes, hot spots, and real-world use in DynamoDB / Cassandra.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "What is a Message Queue and When Should You Use One?",
    url: "https://blog.bytebytego.com/p/why-do-we-need-a-message-queue",
    topics: ["message-queue", "kafka", "rabbitmq", "async"],
    difficulty: "Beginner",
    upvotes: 0,
    notes: "Covers Kafka vs RabbitMQ vs SQS tradeoffs with nice diagrams.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "Rate Limiting Algorithms — Token Bucket, Sliding Window, Leaky Bucket",
    url: "https://blog.bytebytego.com/p/rate-limiting-algorithms-explained",
    topics: ["rate-limiting", "api-design", "distributed-systems"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Side-by-side comparison of all major algorithms. Great for API Gateway interviews.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "YouTube",
    title: "Gaurav Sen — Consistent Hashing | Algorithms You Should Know",
    url: "https://www.youtube.com/watch?v=zaRkONvyGr8",
    topics: ["consistent-hashing", "distributed-systems"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: null,
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "How Uber Scales Their Real-Time Market Platform",
    url: "https://eng.uber.com/real-time-push-platform/",
    topics: ["real-time", "websockets", "scale", "hld"],
    difficulty: "Advanced",
    upvotes: 0,
    notes: "Deep dive into Uber's push notification and driver-location system.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Paper",
    title: "Google Bigtable: A Distributed Storage System for Structured Data",
    url: "https://research.google.com/archive/bigtable-osdi06.pdf",
    topics: ["bigtable", "distributed-systems", "databases", "google"],
    difficulty: "Advanced",
    upvotes: 0,
    notes: "Original Bigtable paper. Foundation for HBase, Cassandra, DynamoDB.",
    submittedBy: SUBMITTED_BY,
  },
  {
    type: "Blog",
    title: "Understanding Database Indexes — B-Tree vs LSM-Tree",
    url: "https://blog.bytebytego.com/p/understanding-database-indexes",
    topics: ["databases", "indexes", "b-tree", "lsm-tree"],
    difficulty: "Intermediate",
    upvotes: 0,
    notes: "Essential for explaining write-heavy vs read-heavy storage engines.",
    submittedBy: SUBMITTED_BY,
  },
];

// ── Interview questions ───────────────────────────────────────────────────────
const questions = [
  {
    category: "System Design",
    title: "Design a URL shortener like bit.ly",
    difficulty: "Easy",
    companies: ["Amazon", "Google", "Microsoft"],
    topics: ["hashing", "databases", "caching", "hld"],
    hints: [
      "Clarify scale: how many URLs/day, expected read:write ratio",
      "Use base62 encoding (a-z A-Z 0-9) on a counter or MD5 hash",
      "Single-point counter creates a bottleneck — use distributed ID generator (Snowflake)",
      "Cache hot URLs in Redis with LRU eviction",
      "Handle collisions: check DB before writing, retry with different hash",
      "Consider custom aliases and expiry TTL",
    ],
    followUps: [
      "How do you handle 100B URLs?",
      "How would you add analytics (click count, geo)?",
      "How do you prevent abuse / spam URLs?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "System Design",
    title: "Design a distributed rate limiter",
    difficulty: "Medium",
    companies: ["Stripe", "Google", "Netflix", "Uber"],
    topics: ["rate-limiting", "redis", "distributed-systems", "api-design"],
    hints: [
      "Pick algorithm: Token Bucket (smooth bursts), Sliding Window Log (accurate), Fixed Window (simple)",
      "Store counters in Redis with atomic INCR + EXPIRE; use Lua scripts for atomicity",
      "For distributed setup, use Redis Cluster or a gossip-based counter",
      "Return 429 with Retry-After header",
      "Consider per-user, per-IP, and per-endpoint limits",
      "Race condition in INCR+EXPIRE can be avoided with SET key value EX ttl NX",
    ],
    followUps: [
      "How does your design handle Redis failover?",
      "What if you need different limits per user tier?",
      "How would you implement a sliding window in Redis?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "System Design",
    title: "Design a notification service (push, email, SMS)",
    difficulty: "Medium",
    companies: ["Meta", "Amazon", "Microsoft", "LinkedIn"],
    topics: ["message-queue", "kafka", "async", "scale", "hld"],
    hints: [
      "Decouple producers (event sources) from consumers (delivery workers) via a message queue",
      "Use Kafka topics per channel type: push_notifications, email_notifications, sms",
      "Idempotency key on each message to prevent duplicate sends",
      "Dead Letter Queue for failed deliveries; retry with exponential backoff",
      "Store user device tokens in a separate service with FCM/APNs integration",
      "Priority queues for urgent vs marketing notifications",
    ],
    followUps: [
      "How do you guarantee at-least-once delivery?",
      "How would you handle unsubscribes?",
      "How do you avoid sending 10M push notifications at exactly the same time?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "System Design",
    title: "Design Twitter's news feed / home timeline",
    difficulty: "Hard",
    companies: ["Twitter", "Meta", "LinkedIn"],
    topics: ["fan-out", "caching", "social-graph", "hld", "scale"],
    hints: [
      "Push model (fan-out on write): precompute feed on tweet creation — fast reads, expensive writes for celebrities",
      "Pull model (fan-out on read): query all followees on load — slow reads, cheap writes",
      "Hybrid: push for normal users, pull for celebrities (>1M followers)",
      "Store timelines in Redis sorted sets (score = timestamp)",
      "Use a graph DB or adjacency list table for follower relationships",
      "Pagination via cursor (last seen tweet ID), not offset",
    ],
    followUps: [
      "How do you handle a user with 50M followers posting a tweet?",
      "How do you keep feed fresh without polling?",
      "How would you add algorithmic ranking to the feed?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "System Design",
    title: "Design a key-value store like Redis",
    difficulty: "Hard",
    companies: ["Google", "Amazon", "Meta", "Microsoft"],
    topics: ["distributed-systems", "databases", "replication", "consistent-hashing"],
    hints: [
      "Single-node first: in-memory hash map, O(1) get/set, persistence via AOF or RDB snapshots",
      "Partitioning via consistent hashing; virtual nodes for even distribution",
      "Replication: leader-follower; gossip protocol for peer discovery in leaderless setups",
      "Conflict resolution with vector clocks or last-write-wins",
      "Eviction policies: LRU, LFU, TTL-based expiry",
      "CAP: choose CP (strong consistency) or AP (eventual consistency) based on requirements",
    ],
    followUps: [
      "How does Redis handle persistence?",
      "How would you implement distributed locking on top of your store?",
      "What happens during a network partition?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "Databases",
    title: "When would you choose NoSQL over SQL?",
    difficulty: "Easy",
    companies: ["Amazon", "Google", "Meta", "Netflix"],
    topics: ["databases", "nosql", "sql", "trade-offs"],
    hints: [
      "SQL: ACID, relational, complex joins, schema-enforced — good for financial, transactional data",
      "NoSQL: flexible schema, horizontal scale, eventual consistency — good for social, IoT, logs",
      "Document DB (MongoDB) for nested/variable schema; Column DB (Cassandra) for time-series; Graph DB (Neo4j) for relationships",
      "NoSQL doesn't mean no transactions — MongoDB 4+ supports multi-document ACID",
      "Polyglot persistence: use both in the same system for different use cases",
    ],
    followUps: [
      "Can you give an example where you'd use both in one architecture?",
      "How does DynamoDB handle consistency?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "Concepts",
    title: "Explain the differences between horizontal and vertical scaling",
    difficulty: "Easy",
    companies: ["Amazon", "Google", "Microsoft", "Uber"],
    topics: ["scaling", "distributed-systems", "load-balancing"],
    hints: [
      "Vertical: bigger machine — limited by hardware ceiling, no code change, single point of failure",
      "Horizontal: more machines — requires stateless services, load balancer, sticky sessions or session store",
      "Database vertical scaling hits limits fast; read replicas and sharding are horizontal strategies",
      "Stateless services scale horizontally easily; stateful services need shared state (Redis, DB)",
      "Auto-scaling groups in AWS/GCP automate horizontal scaling based on CPU/memory metrics",
    ],
    followUps: [
      "How would you make a stateful service horizontally scalable?",
      "What is a shared-nothing architecture?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "System Design",
    title: "Design a distributed job scheduler (like AWS Batch / Airflow)",
    difficulty: "Hard",
    companies: ["Amazon", "Uber", "LinkedIn", "Airbnb"],
    topics: ["distributed-systems", "scheduler", "message-queue", "fault-tolerance"],
    hints: [
      "Components: Job Store (DB), Scheduler (picks ready jobs), Executor (runs jobs), Worker pool",
      "Use cron expression parsing to determine next run time; store in DB with next_run_at index",
      "Leader election (ZooKeeper / etcd) so only one scheduler instance runs at a time",
      "Idempotent jobs — retrying a failed job should be safe",
      "Track job state machine: PENDING → RUNNING → SUCCESS / FAILED / RETRYING",
      "At-most-once vs at-least-once delivery tradeoffs for job execution",
    ],
    followUps: [
      "How do you prevent two workers from picking up the same job?",
      "How would you support job dependencies (DAGs)?",
      "How would you handle jobs that take longer than expected?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "Architecture",
    title: "What are the trade-offs between microservices and monolithic architecture?",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Netflix", "Uber", "Airbnb"],
    topics: ["microservices", "monolith", "architecture", "trade-offs"],
    hints: [
      "Monolith: simple to develop/test/deploy initially, single codebase, no network overhead",
      "Microservices: independent deployability, technology diversity, fault isolation, team autonomy",
      "Microservices challenges: distributed transactions (saga pattern), service discovery, latency, observability",
      "Start with a modular monolith; extract services at clear seam points when team/scale demands it",
      "API Gateway as entry point; service mesh (Istio/Envoy) for inter-service communication",
    ],
    followUps: [
      "How do you handle a transaction that spans two microservices?",
      "What is the strangler fig pattern?",
    ],
    submittedBy: SUBMITTED_BY,
  },
  {
    category: "Behavioral",
    title: "Tell me about a time you improved system performance significantly",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    topics: ["behavioral", "performance", "star-method"],
    hints: [
      "Use STAR format: Situation, Task, Action, Result",
      "Quantify impact: 'reduced p99 latency from 800ms to 120ms', 'cut DB query time by 70%'",
      "Explain your diagnostic process: profiling, metrics, identifying bottleneck",
      "Mention any trade-offs you made (e.g., memory for speed, consistency for availability)",
      "Reflect: what would you do differently?",
    ],
    followUps: [
      "What tools did you use to identify the bottleneck?",
      "Was there anything you tried that didn't work?",
    ],
    submittedBy: SUBMITTED_BY,
  },
];

// ── Answer docs (linked to questions by index position above) ─────────────────
// We'll insert questions first, get their IDs, then insert answer docs.
const answerDocsByQuestion: Record<number, { label: string; url: string }[]> = {
  0: [ // URL shortener
    { label: "System Design Primer — URL shortener walkthrough", url: "https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md" },
    { label: "ByteByteGo — Design a URL shortener", url: "https://blog.bytebytego.com/p/design-a-url-shortener" },
  ],
  1: [ // Rate limiter
    { label: "ByteByteGo — Rate Limiting Algorithms deep dive", url: "https://blog.bytebytego.com/p/rate-limiting-algorithms-explained" },
    { label: "Cloudflare blog — How we built rate limiting", url: "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/" },
  ],
  2: [ // Notification service
    { label: "ByteByteGo — Design a notification system", url: "https://blog.bytebytego.com/p/design-a-notification-system" },
  ],
  3: [ // Twitter news feed
    { label: "System Design Primer — Twitter timeline", url: "https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/twitter/README.md" },
    { label: "Twitter Engineering — Building the timeline", url: "https://blog.twitter.com/engineering/en_us/topics/infrastructure/2020/rebuild-the-timeline-stream" },
  ],
  4: [ // Key-value store
    { label: "ByteByteGo — Design a key-value store", url: "https://blog.bytebytego.com/p/design-a-key-value-store" },
  ],
};

// ── Interview experiences ─────────────────────────────────────────────────────
const experiences = [
  {
    title: "Google L5 SWE — System Design round experience",
    url: "https://leetcode.com/discuss/interview-experience/google-l5-system-design",
    platform: "LeetCode",
    company: "Google",
    role: "Senior Software Engineer (L5)",
    outcome: "Offer",
    topics: ["system-design", "distributed-systems", "scale"],
    notes: "Asked to design Google Drive. Focused heavily on consistency model, chunking strategy, and conflict resolution for concurrent edits. Interviewer was interested in how I'd handle offline sync.",
    upvotes: 0,
    submittedBy: SUBMITTED_BY,
  },
  {
    title: "Amazon SDE-2 — Design a delivery tracking system",
    url: "https://leetcode.com/discuss/interview-experience/amazon-sde2-system-design",
    platform: "LeetCode",
    company: "Amazon",
    role: "SDE-2",
    outcome: "Offer",
    topics: ["system-design", "real-time", "geospatial", "scale"],
    notes: "System design was to build a real-time delivery tracking system for 1M concurrent deliveries. Key discussion points: geospatial indexing (S2 cells), WebSocket vs SSE for live updates, driver location update frequency tradeoffs.",
    upvotes: 0,
    submittedBy: SUBMITTED_BY,
  },
  {
    title: "Meta E5 — Design Instagram Stories",
    url: "https://leetcode.com/discuss/interview-experience/meta-e5-instagram-stories",
    platform: "LeetCode",
    company: "Meta",
    role: "E5 Software Engineer",
    outcome: "Offer",
    topics: ["system-design", "cdn", "media-storage", "scale"],
    notes: "Asked to design Instagram Stories from scratch. Interviewer pushed on: media upload flow (presigned S3 URLs), CDN invalidation on delete, 24-hour expiry mechanism, and fan-out for story views.",
    upvotes: 0,
    submittedBy: SUBMITTED_BY,
  },
  {
    title: "Stripe — Payment processing system design",
    url: "https://leetcode.com/discuss/interview-experience/stripe-system-design",
    platform: "LeetCode",
    company: "Stripe",
    role: "Software Engineer",
    outcome: "Offer",
    topics: ["system-design", "payments", "idempotency", "distributed-systems"],
    notes: "Designed a payment processing system. Heavy emphasis on idempotency keys, double-charge prevention, and exactly-once semantics. Also discussed saga pattern for distributed transactions across payment + inventory services.",
    upvotes: 0,
    submittedBy: SUBMITTED_BY,
  },
  {
    title: "Netflix — Video streaming platform design",
    url: "https://leetcode.com/discuss/interview-experience/netflix-system-design",
    platform: "LeetCode",
    company: "Netflix",
    role: "Senior Software Engineer",
    outcome: "Offer",
    topics: ["streaming", "cdn", "encoding", "scale", "hld"],
    notes: "Full system design of video upload and streaming. Topics covered: video chunking and transcoding pipeline, adaptive bitrate (DASH/HLS), CDN strategy, content popularity-based pre-warming, and chaos engineering approach.",
    upvotes: 0,
    submittedBy: SUBMITTED_BY,
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Insert readings ──────────────────────────────────────────────────────
  console.log(`Inserting ${readings.length} readings...`);
  const insertedReadings = await db.insert(schema.readings).values(readings).returning({ id: schema.readings.id });
  console.log(`✅ Inserted ${insertedReadings.length} readings\n`);

  // ── Insert interview questions ───────────────────────────────────────────
  console.log(`Inserting ${questions.length} interview questions...`);
  const insertedQuestions = await db.insert(schema.interviewQuestions).values(questions).returning({ id: schema.interviewQuestions.id });
  console.log(`✅ Inserted ${insertedQuestions.length} questions\n`);

  // ── Insert answer docs ───────────────────────────────────────────────────
  const allAnswerDocs: (typeof schema.answerDocs.$inferInsert)[] = [];
  for (const [idx, docs] of Object.entries(answerDocsByQuestion)) {
    const questionId = insertedQuestions[Number(idx)]?.id;
    if (!questionId) continue;
    for (const doc of docs) {
      allAnswerDocs.push({ ...doc, questionId, submittedBy: SUBMITTED_BY });
    }
  }
  console.log(`Inserting ${allAnswerDocs.length} answer docs...`);
  const insertedDocs = await db.insert(schema.answerDocs).values(allAnswerDocs).returning({ id: schema.answerDocs.id });
  console.log(`✅ Inserted ${insertedDocs.length} answer docs\n`);

  // ── Insert experiences ───────────────────────────────────────────────────
  console.log(`Inserting ${experiences.length} interview experiences...`);
  const insertedExp = await db.insert(schema.experiences).values(experiences).returning({ id: schema.experiences.id });
  console.log(`✅ Inserted ${insertedExp.length} experiences\n`);

  console.log("🎉 Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
