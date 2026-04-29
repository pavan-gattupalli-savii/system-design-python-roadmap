import type { Concept } from "./index";

export const sharding: Concept = {
  slug:     "sharding",
  title:    "Sharding",
  emoji:    "🔪",
  category: "Database",
  tagline:  "Splitting data horizontally across multiple servers",
  roadmapKeywords: ["sharding", "partition", "horizontal scaling", "shard key", "database scaling", "hot spot"],
  related:  ["consistent-hashing", "replication", "database-indexes", "sql-vs-nosql"],

  sections: [
    {
      heading: "Vertical vs Horizontal Scaling",
      body: `When a single database server can't keep up with load, you have two options:

Vertical scaling (scale up): buy a bigger machine — more CPU cores, more RAM, faster SSD. This is simple (no code changes) but has a hard ceiling. The largest AWS RDS instance as of 2025 has 768 GB RAM and 96 vCPUs. Beyond that limit, you can't scale up further. It's also expensive and creates a single point of failure.

Horizontal scaling (scale out): add more machines. Split your data across them. This is sharding. There's no theoretical ceiling — add 10 more shards when you need them. But it introduces massive complexity in your application and data model.

Sharding is the last resort for database scaling. Before sharding, exhaust these options: read replicas (for read-heavy load), caching (for repeated queries), index optimisation (for slow queries), connection pooling (for connection exhaustion), and query optimisation. Sharding is operationally expensive — do it only when you've exhausted everything else.`,
      diagram: "sharding-flow",
    },
    {
      heading: "What is Sharding?",
      body: `Sharding (also called horizontal partitioning) splits a large database table across multiple database instances. Each instance (shard) holds a subset of the rows. The full dataset is distributed across all shards.

A shard key (partition key) determines which shard a given row belongs to. The shard key is a column or set of columns in your data model. Choosing the right shard key is the most critical decision in a sharding architecture — a bad shard key creates hot spots and uneven data distribution that can be worse than not sharding at all.

Example: a social media platform shards its users table by user_id. Users with IDs 1-10M go to shard 1, 10M-20M to shard 2, etc. All data for a given user lives on one shard, so user-specific queries never need to span shards.`,
    },
    {
      heading: "Sharding Strategies",
      table: {
        cols: ["Strategy", "How it works", "Hot spot risk", "Range queries", "Resharding difficulty"],
        rows: [
          ["Range sharding",     "Split by key ranges: shard 1 = IDs 1-10M, shard 2 = 10M-20M",           "High — if recent data is popular (e.g., new users are most active), the highest shard gets all traffic", "Efficient — all data in a range is on one shard", "Hard — range boundaries must be manually re-assigned"],
          ["Hash sharding",      "hash(shard_key) % N determines shard. Even distribution.",               "Low — hash function distributes uniformly",                  "Not supported — adjacent keys hash to different shards", "Hard — changing N invalidates all hashes (use consistent hashing)"],
          ["Consistent hashing", "Keys map to a hash ring; shards own ring segments. See Consistent Hashing.", "Low with vnodes",                                         "Not supported",                                            "Easy — add shard, redistribute only adjacent ring segment"],
          ["Directory sharding", "A lookup table maps key ranges to shards. Fully flexible.",               "Low — lookup table can be rebalanced arbitrarily",            "Possible if directory maps ranges",                        "Easy — update directory; but directory is a bottleneck and single point of failure"],
          ["Geo sharding",       "Route by user geography: US users → US shard, EU users → EU shard",      "Low if traffic distributed globally",                         "Within-region only",                                       "Medium — add regions; cross-region queries are expensive"],
        ],
      },
    },
    {
      heading: "Hot Spots — The #1 Sharding Failure Mode",
      body: `A hot spot occurs when one shard receives a disproportionate amount of traffic, while other shards sit idle. This defeats the entire purpose of sharding.

Common causes:
1. Popular keys: a celebrity's post on a social network (user_id = Justin Bieber's account). If sharding by user_id, all reads for that post go to one shard.
2. Monotonically increasing keys: if sharding by created_at or an auto-increment ID, all new writes go to the "latest" shard. The newest shard is always the hot shard.
3. Skewed data distribution: if sharding by country and 70% of users are in the US, the US shard gets 70% of traffic.

Solutions:
1. Add entropy to the shard key: instead of user_id, use hash(user_id). Instead of created_at, use hash(user_id + created_at). This distributes writes uniformly at the cost of range query ability.
2. Compound shard key: combine two columns to better distribute load.
3. Split the hot key: for celebrity accounts, use user_id + random_suffix (0-99). Distribute reads across 100 sub-shards. The application queries all 100 and merges results. This is "cell-based" sharding.
4. Caching: a hot key is often hot because it's read frequently. Cache aggressively and only a tiny fraction of reads reach the shard.`,
      callout: {
        kind: "warning",
        text: "Avoid sharding by time (created_at, date) unless your workload accesses historical data uniformly. Append-only workloads (logs, events) with time-based sharding always create a write hot spot on the current shard. Use consistent hashing instead.",
      },
    },
    {
      heading: "Cross-Shard Operations",
      body: `The hardest problems in a sharded database arise when operations span multiple shards.

Cross-shard queries: SELECT * FROM orders WHERE status = 'pending' — if orders are sharded by user_id, this query must run on every shard and the results merged. This is called a scatter-gather query. At 100 shards, you're making 100 parallel DB queries per request.

Cross-shard joins: impossible to do in the database layer. You must load data from multiple shards in the application and join in code. This is orders of magnitude slower than a SQL JOIN.

Cross-shard transactions: transactions that span multiple shards require a distributed transaction protocol (two-phase commit, 2PC). This is complex, slow, and introduces new failure modes (coordinator failure mid-transaction leaves shards in an inconsistent state).

The golden rule: design your shard key so that 99% of your queries are single-shard queries. If your most frequent query spans all shards, you've chosen the wrong shard key.`,
    },
    {
      heading: "Resharding — Adding or Removing Shards",
      body: `When you eventually outgrow your current shard count and need to add more shards, you must reshard — redistribute data across the new shard topology. This is one of the most dangerous operations in a sharded database.

Naive resharding: change N in hash(key) % N. Every key remaps. 100% of your data needs to move. This requires a full data migration — read from old shards, write to new shards, zero downtime is nearly impossible.

Better approach with consistent hashing: adding a new shard only moves 1/N of keys. The data transfer is proportional, and the system can continue serving traffic during migration with only the keys being moved temporarily in flux.

Online resharding strategies:
1. Read from old, write to new + old: during migration, writes go to both old and new shard locations. Once data is fully copied to new shard, flip reads to new shard and stop writes to old.
2. Version-based routing: maintain a routing version. When resharding, increment version and serve traffic from both topologies, merging results, until migration completes.
3. Vitess (YouTube's sharding layer for MySQL): handles resharding transparently via virtual shards and a routing layer. Moves data in the background with no application changes.`,
      callout: {
        kind: "tip",
        text: "Always shard with future resharding in mind. Use a large virtual shard count (Kafka uses 2048 partitions; Redis Cluster uses 16384 hash slots) — larger than you need now. Remapping virtual shards to physical nodes is cheaper than remapping keys.",
      },
    },
  ],
};
