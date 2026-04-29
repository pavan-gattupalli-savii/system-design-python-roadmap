import type { Concept } from "./index";

export const acidTransactions: Concept = {
  slug:     "acid-transactions",
  title:    "ACID Transactions",
  emoji:    "⚗️",
  category: "Database",
  tagline:  "The four guarantees that make databases trustworthy",
  roadmapKeywords: ["acid", "transactions", "atomicity", "consistency", "isolation", "durability", "sql", "rollback"],
  related:  ["sql-vs-nosql", "replication", "cap-theorem", "database-indexes"],

  sections: [
    {
      heading: "What is a Transaction?",
      body: `A database transaction is a sequence of one or more operations (reads and writes) that are treated as a single indivisible unit. Either all operations in the transaction succeed (commit), or none of them take effect (rollback).

The classic example: transferring $100 from Alice's account to Bob's account requires two writes:
1. Deduct $100 from Alice (balance: 1000 → 900)
2. Add $100 to Bob (balance: 500 → 600)

If the server crashes after step 1 but before step 2, Alice has lost $100 and Bob received nothing. The money vanished. Without transactions, this is a real risk. With a transaction, if anything goes wrong, both writes are rolled back atomically — the system returns to a consistent state as if neither write happened.

ACID is a set of four properties that define what a "reliable transaction" means.`,
    },
    {
      heading: "A — Atomicity",
      body: `Atomicity guarantees that a transaction is all-or-nothing. If any part of the transaction fails (due to a crash, constraint violation, network error, or explicit ROLLBACK), the entire transaction is rolled back as if it never happened. Partial updates are never persisted.

Implementation: databases implement atomicity via a Write-Ahead Log (WAL). Before modifying data on disk, the database writes the intended change to the WAL. If the database crashes mid-transaction, on restart it reads the WAL and determines whether to commit (replay the operations) or abort (ignore them). Incomplete transactions in the WAL are rolled back.

Savepoints: SQL supports partial rollbacks within a transaction using SAVEPOINT. You can roll back to a savepoint without aborting the entire transaction. Useful for nested operations where you want to retry a sub-operation.`,
      callout: {
        kind: "note",
        text: "Atomicity is about fault tolerance, not isolation. It says: on failure, no partial state is visible. It doesn't say anything about what concurrent transactions see while the transaction is in progress — that's Isolation.",
      },
    },
    {
      heading: "C — Consistency",
      body: `Consistency guarantees that a transaction takes the database from one valid state to another valid state. Any data written to the database must satisfy all defined constraints, rules, and cascades.

Consistency is partially the database's job (enforcing CHECK constraints, foreign keys, NOT NULL, UNIQUE) and partially the application's job (ensuring the business logic in a transaction maintains invariants).

Example consistency constraints enforced by the database:
- account.balance >= 0 (CHECK constraint — prevents negative balance)
- orders.user_id references users.id (FOREIGN KEY — prevents orphaned orders)
- users.email UNIQUE (UNIQUE constraint — prevents duplicate accounts)

If a transaction would violate any of these, the database rejects it with an error and rolls back.

Note: Consistency in ACID is subtly different from Consistency in CAP. ACID Consistency = database constraints. CAP Consistency = all nodes see the same data at the same time (linearizability).`,
    },
    {
      heading: "I — Isolation",
      body: `Isolation governs what a transaction sees when other transactions are running concurrently. Without isolation, concurrent transactions would interfere with each other, causing various anomalies.

Isolation is the most nuanced ACID property. It's a spectrum, not a binary. SQL defines four isolation levels, each protecting against a different set of anomalies at different performance costs.

Understanding the anomalies:
- Dirty read: reading uncommitted data from another transaction. If that transaction rolls back, you read data that never "officially" existed.
- Non-repeatable read: reading the same row twice in one transaction and getting different values because another committed transaction modified it between your reads.
- Phantom read: running the same query twice in one transaction and getting different rows because another committed transaction inserted/deleted rows that match your query's WHERE clause.
- Write skew: two transactions both read a shared condition, make a decision based on it, and then write — but together their writes violate the invariant neither write individually would violate (e.g., both approve the "last doctor on call" to take leave simultaneously).`,
    },
    {
      heading: "Isolation Levels",
      table: {
        cols: ["Level", "Dirty Read", "Non-repeatable Read", "Phantom Read", "Write Skew", "Performance", "Implementation"],
        rows: [
          ["Read Uncommitted", "Possible",  "Possible",  "Possible",  "Possible",  "Fastest",  "No locks on reads — see everything"],
          ["Read Committed",   "Prevented", "Possible",  "Possible",  "Possible",  "Fast",     "Only reads committed data. Default in PostgreSQL, Oracle, SQL Server"],
          ["Repeatable Read",  "Prevented", "Prevented", "Possible",  "Possible",  "Medium",   "Snapshot of data at transaction start. Default in MySQL InnoDB"],
          ["Serializable",     "Prevented", "Prevented", "Prevented", "Prevented", "Slowest",  "Transactions appear to execute one-at-a-time. Predicate locks or SSI"],
        ],
      },
      callout: {
        kind: "tip",
        text: "Most applications are fine with Read Committed (PostgreSQL default). Use Repeatable Read when you need consistent reads of the same rows. Use Serializable only for critical financial operations where write skew would be catastrophic (e.g., double-spending prevention, booking the last seat on a flight). PostgreSQL implements Serializable Snapshot Isolation (SSI) — it's more efficient than traditional locking-based serializability.",
      },
    },
    {
      heading: "D — Durability",
      body: `Durability guarantees that once a transaction is committed, the data is permanently saved — even if the system crashes immediately after the commit. A committed transaction is never lost.

Implementation: durability is achieved through the WAL (Write-Ahead Log) + fsync.

1. Write-Ahead Log: before the database modifies its data files, it writes the intended change to a sequential log on disk. Sequential writes are much faster than random writes.
2. fsync: after writing to the WAL, the database calls fsync() to force the OS to flush data from its buffer cache to physical disk. Only after fsync returns does the database send a commit acknowledgement to the client.

The fsync story: many databases historically "cheated" by not calling fsync (or accepting OS promises without true flushing). During power failures, this caused data loss even after apparent commits. MongoDB had this issue in early versions. PostgreSQL's fsync call is the reason it's considered highly durable.

Cloud databases: Aurora, Cloud Spanner, CockroachDB write to multiple nodes before acknowledging a commit. Even if a physical disk fails, your commit is on 3+ nodes. Physical durability is handled at the storage layer.`,
    },
    {
      heading: "ACID vs BASE",
      body: `As distributed databases emerged, the strict ACID model was seen as incompatible with the availability and partition tolerance required at internet scale. BASE is an alternative model designed for AP (Available + Partition Tolerant) systems.

BASE stands for: Basically Available, Soft state, Eventually consistent.

- Basically Available: the system remains available even during partial failures (some nodes down), possibly returning stale data.
- Soft state: the system's state may change over time even without new inputs — replication is happening in the background, updating state gradually.
- Eventually consistent: if no new updates are made, all replicas will eventually converge to the same value. Consistency is not guaranteed at any given moment.

ACID ↔ BASE is a spectrum. Modern databases blur the line: MongoDB added multi-document ACID transactions in v4.0. Cassandra has lightweight transactions (Paxos) for specific operations. DynamoDB has transactional APIs for up to 25 items. You can have ACID semantics within a shard of a NoSQL system.`,
      table: {
        cols: ["Property", "ACID", "BASE"],
        rows: [
          ["Consistency",  "Immediate — all reads see committed data",          "Eventual — reads may see stale data for a window of time"],
          ["Availability", "May sacrifice availability for consistency",          "Always available, even with partial failures"],
          ["Transactions", "Full multi-statement, multi-table transactions",      "Limited or no multi-document transactions"],
          ["Performance",  "Write overhead from locking and WAL fsync",           "Very high throughput — no global locking"],
          ["Use cases",    "Financial, inventory, bookings, CRM, ERP, any CRUD app", "Social feeds, event logs, IoT, time-series, real-time analytics"],
          ["Examples",     "PostgreSQL, MySQL, Oracle, SQL Server, CockroachDB",  "Cassandra, DynamoDB, CouchDB (BASE by default)"],
        ],
      },
    },
  ],
};
