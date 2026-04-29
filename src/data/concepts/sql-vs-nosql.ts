import type { Concept } from "./index";

export const sqlVsNosql: Concept = {
  slug:     "sql-vs-nosql",
  title:    "SQL vs NoSQL",
  emoji:    "🗃️",
  category: "Database",
  tagline:  "Choosing the right data store for the job",
  roadmapKeywords: ["sql", "nosql", "database", "postgresql", "mongodb", "cassandra", "dynamo", "relational", "document", "key-value"],
  related:  ["database-indexes", "acid-transactions", "sharding", "cap-theorem"],

  sections: [
    {
      heading: "The Relational Model",
      body: `SQL databases (Relational databases) organise data into tables — rows and columns — with a fixed schema. Relationships between tables are expressed via foreign keys and enforced by the database engine. The query language is SQL (Structured Query Language), which is declarative: you describe what data you want, not how to retrieve it.

The relational model was invented by E.F. Codd at IBM in 1970 and remains dominant for most transactional workloads. Its strengths: strong consistency (ACID guarantees), powerful JOIN operations, referential integrity (foreign keys prevent orphaned data), and a mature ecosystem of tooling, ORMs, and operational expertise.

The relational model's constraints: schema must be defined upfront (migrations required for changes), scaling horizontally (sharding) is harder than scaling vertically, and JOIN-heavy queries don't distribute well across shards.`,
    },
    {
      heading: "The 4 NoSQL Families",
      body: `"NoSQL" is not one thing — it's a category of databases that don't use the relational model. There are four distinct families, each optimised for a different data shape and access pattern.`,
      table: {
        cols: ["Family", "Data model", "Examples", "Best for"],
        rows: [
          ["Key-Value",   "Dictionary: key → opaque blob or structured value", "Redis, DynamoDB (KV mode), Memcached, Riak", "Sessions, caches, user preferences, rate limiting counters, shopping carts"],
          ["Document",    "Nested JSON/BSON documents; flexible schema per document", "MongoDB, CouchDB, Couchbase, AWS DocumentDB", "Product catalogs, user profiles, content management, mobile apps with variable fields"],
          ["Wide-Column", "Rows with dynamic columns; rows grouped into column families", "Apache Cassandra, HBase, Google Bigtable", "Time-series data, event logs, IoT sensor data, write-heavy workloads at massive scale"],
          ["Graph",       "Nodes (entities) and edges (relationships) with properties", "Neo4j, Amazon Neptune, JanusGraph, TigerGraph", "Social networks, recommendation engines, fraud detection, knowledge graphs"],
        ],
      },
    },
    {
      heading: "Head-to-Head Comparison",
      table: {
        cols: ["Property", "SQL (Relational)", "NoSQL (general)"],
        rows: [
          ["Schema",             "Rigid, defined upfront; ALTER TABLE for changes",            "Flexible (schema-on-read); documents can have different fields"],
          ["ACID transactions",  "Strong ACID out of the box",                                 "Varies widely: Redis is atomic per command; Cassandra is eventually consistent; MongoDB 4+ supports multi-doc ACID"],
          ["Scaling axis",       "Vertical (bigger machine) primary; horizontal sharding is complex", "Horizontal by design; easy to add shards/nodes"],
          ["JOINs",              "First-class SQL feature; efficient with indexes",             "Not natively supported; denormalise data or do application-level joins"],
          ["Query language",     "SQL — standardised, declarative, portable",                  "Database-specific APIs; no universal standard"],
          ["Consistency",        "Strong (ACID) by default",                                   "Often eventual consistency for availability/partition tolerance (AP in CAP)"],
          ["Write throughput",   "Limited by single-master (typically)",                        "Very high — leaderless or multi-leader; Cassandra handles millions of writes/sec"],
          ["Data relationships", "Normalise into multiple tables; enforce with FK constraints", "Embed related data in same document; denormalise for read performance"],
          ["Operational maturity","Very mature (50+ years); excellent tooling, ORMs, DBA expertise", "Younger; tooling varies; operational complexity higher"],
        ],
      },
    },
    {
      heading: "When to Use SQL",
      bullets: [
        "Your data is relational with clear foreign-key relationships (orders → users → addresses → products).",
        "You need ACID transactions — money transfers, inventory updates, booking systems where partial updates would be catastrophic.",
        "Your schema is stable and well-understood upfront. Relational databases reward careful schema design.",
        "You need complex queries: multi-table JOINs, GROUP BY aggregations, window functions, CTEs. SQL is far more expressive than NoSQL query APIs for ad-hoc analysis.",
        "You're building an OLTP (Online Transaction Processing) system: e-commerce, ERP, banking, CRM, SaaS products. PostgreSQL handles 99% of these perfectly.",
        "Your team has more SQL expertise than NoSQL expertise. Operational familiarity matters enormously.",
      ],
    },
    {
      heading: "When to Use NoSQL",
      bullets: [
        "You need massive write throughput that SQL can't sustain on a single master (10,000+ writes/sec → Cassandra).",
        "Your data is schemaless or evolves rapidly (different fields per user, variable product attributes) → MongoDB/DynamoDB.",
        "You're building a time-series data store for millions of sensor/event writes per second → Cassandra, InfluxDB.",
        "You need a cache or session store with sub-millisecond reads → Redis.",
        "Your queries are primarily single-entity lookups by key, with no complex JOINs needed → DynamoDB.",
        "You're modelling highly connected data (social graph, fraud rings) → Neo4j.",
        "Global multi-region active-active writes with eventual consistency are acceptable → DynamoDB, Cassandra.",
      ],
    },
    {
      heading: "Polyglot Persistence",
      body: `Modern large-scale systems rarely use just one database. They use the right tool for each job — a pattern called polyglot persistence.

Example architecture for a large e-commerce platform:
- PostgreSQL: orders, payments, user accounts (ACID, relational)
- Redis: sessions, shopping cart, rate limiting, real-time inventory counters
- Elasticsearch: full-text product search with faceting and ranking
- Cassandra: clickstream/event logs (append-only, time-series, massive write volume)
- Neo4j: recommendation engine (who bought this also bought…)
- S3: product images, PDFs, raw data lake

Each database handles what it's best at. The trade-off: operational complexity increases significantly. You now need engineers who know all these systems, monitoring for all of them, and backup/recovery procedures for each.`,
      callout: {
        kind: "tip",
        text: "In a system design interview, defaulting to PostgreSQL for your primary data store is a strong choice. Then add Redis for caching/sessions, Elasticsearch for search, and Cassandra/DynamoDB only when you can justify the need for massive horizontal write scale. Don't add complexity without a reason.",
      },
    },
    {
      heading: "NewSQL — The Best of Both?",
      body: `NewSQL databases attempt to provide the horizontal scalability of NoSQL while maintaining SQL and ACID guarantees. They use consensus algorithms (Paxos, Raft) to synchronise writes across shards while still exposing a standard SQL interface.

Google Spanner (2012) was the first major NewSQL system — globally distributed, externally consistent SQL. CockroachDB and YugabyteDB are open-source NewSQL databases inspired by Spanner.

Trade-offs: higher write latency (synchronous consensus adds round trips), significant operational complexity, and still relatively young compared to PostgreSQL. For most startups and mid-size companies, PostgreSQL with read replicas and connection pooling (PgBouncer) handles 10-100x more load than you think before you need NewSQL.`,
    },
  ],
};
