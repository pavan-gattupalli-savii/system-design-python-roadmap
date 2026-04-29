import type { Concept } from "./index";

export const replication: Concept = {
  slug:     "replication",
  title:    "Replication",
  emoji:    "📋",
  category: "Database",
  tagline:  "Keeping copies in sync across machines",
  roadmapKeywords: ["replication", "replica", "leader", "follower", "primary", "secondary", "read replica", "sync", "async"],
  related:  ["cap-theorem", "sharding", "acid-transactions", "consistent-hashing"],

  sections: [
    {
      heading: "Why Replicate?",
      body: `Replication means keeping a copy of the same data on multiple machines. There are three primary reasons you'd want this:

1. High availability / fault tolerance: if one machine fails, another has the data and can take over. No single point of failure. This is why databases have primary/replica configurations.

2. Read scalability: instead of all read queries hitting one machine, spread them across multiple replicas. Ten replicas → roughly 10x read throughput. Writes still go to one machine (in leader-follower), but reads scale horizontally.

3. Geographic latency reduction: put a read replica physically close to your users. Users in Tokyo read from a Tokyo replica instead of your US-East primary. Reduces round-trip time from 200ms to 5ms.

The fundamental challenge: once you have multiple copies of data, keeping them in sync is hard. Any change on one node must eventually propagate to all other nodes. When and how this happens defines the replication model.`,
      diagram: "replication-flow",
    },
    {
      heading: "Leader-Follower (Primary-Replica) Replication",
      body: `The most common replication architecture. One node is designated the leader (primary, master). All write operations must go to the leader. The leader applies the write and propagates the change to all followers (replicas, standby nodes).

Read operations can go to any node — the leader or any follower. Since followers may be slightly behind the leader (replication lag), reading from a follower can return stale data.

Failover: if the leader fails, one of the followers is promoted to leader. This can be manual (DBA intervention) or automatic (using a consensus algorithm to elect a new leader — PostgreSQL + Patroni, MySQL + MHA, MongoDB replica set election).

Advantages: simple mental model; strong consistency for writes (single writer); read scalability via followers.
Disadvantages: leader is the write bottleneck; failover has a brief unavailability window; replication lag can cause read-your-writes anomalies.`,
    },
    {
      heading: "Synchronous vs Asynchronous Replication",
      table: {
        cols: ["Property", "Synchronous", "Asynchronous"],
        rows: [
          ["How it works",       "Leader waits for at least one follower to confirm write before acknowledging client", "Leader acknowledges client immediately after local write; propagates to followers in background"],
          ["Write latency",      "Higher — includes network round trip to follower",                                    "Lower — just local disk write"],
          ["Durability",         "Strong — committed data on ≥2 nodes before ack",                                     "Weaker — committed data only on leader at ack time; follower may be behind"],
          ["Data loss on failover", "None — at least one follower has the latest data",                                "Possible — follower may not have the last N writes"],
          ["Availability",       "Lower — if synchronous follower is slow or down, writes block",                      "Higher — leader writes even if all followers are down"],
          ["Network partition",  "Writes block during partition",                                                        "Writes continue; diverge with followers"],
          ["Examples",           "PostgreSQL synchronous_standby_names, MySQL semi-sync, Spanner",                      "PostgreSQL default (async streaming replication), MySQL async binlog, MongoDB default"],
        ],
      },
      callout: {
        kind: "tip",
        text: "PostgreSQL's recommended production setup: one synchronous replica (prevents data loss on failover) + one or more async replicas (for read scaling without blocking writes). The synchronous replica is your safety net; async replicas are your read scale-out.",
      },
    },
    {
      heading: "Replication Lag and Read Anomalies",
      body: `Replication lag is the delay between when a write is applied on the leader and when it appears on a follower. In async replication, this can range from milliseconds to seconds (or longer during heavy write load or network issues).

Replication lag causes consistency anomalies for read-from-replica workloads:

Read-your-writes anomaly: user submits a form (write to leader) and immediately refreshes the page (read from follower). The follower hasn't replicated the write yet — the user sees stale data and thinks their write failed. Solution: after a write, route the next read for that user to the leader or wait for the follower to catch up.

Monotonic reads anomaly: user makes two reads from different replicas. Follower A is 100ms behind, Follower B is 1 second behind. User reads from B first, then A — they see older data on the second read. Time appears to go backwards. Solution: route each user's reads to the same replica (sticky reads).

Phantom reads / non-repeatable reads: data changes between two reads within the same "session" because different replicas are at different points. Solution: read from the leader for consistency-sensitive operations.`,
    },
    {
      heading: "Multi-Leader Replication",
      body: `In single-leader replication, all writes go to one machine. Multi-leader (multi-master) replication allows writes to be accepted by any of several leaders simultaneously.

Why multi-leader: multiple data centres — each DC has a local leader that accepts writes. Writes are replicated asynchronously to other DCs' leaders. Users in each DC get low-latency writes.

The write conflict problem: if User A updates their profile in DC-East and simultaneously User B updates the same profile in DC-West, both leaders accept the write. When these writes replicate to each other, they conflict. Who wins?

Conflict resolution strategies:
1. Last-Write-Wins (LWW): use a timestamp; the write with the latest timestamp wins. Simple but loses data — the earlier write is discarded.
2. Merge: application-specific merging (used in Google Docs — CRDT, operational transformation).
3. Custom conflict resolution: expose conflicts to the application for manual resolution (CouchDB).

Multi-leader is complex. Avoid it unless you have a specific cross-DC low-latency write requirement.`,
    },
    {
      heading: "Leaderless Replication (Dynamo-style)",
      body: `Amazon's Dynamo paper (2007) introduced a different model: no leader at all. Any node can accept writes. Reads and writes go to multiple nodes simultaneously, and quorum logic determines consistency.

With N replicas, W write quorum, and R read quorum:
- Write: send to all N replicas; wait for W acknowledgements. If W < N, some replicas may not have the latest data yet.
- Read: send to R replicas; compare responses; return the latest version (using timestamps or vector clocks).
- Strong consistency: R + W > N. If W=2, R=2, N=3 → 2+2=4 > 3. At least one read node always overlaps with the write quorum.

Read repair: when a read detects that some replicas have stale data (their version is older), the system writes the latest version back to those replicas in the background.

Anti-entropy: background process that constantly compares replicas and propagates differences. Ensures eventual convergence even for data that isn't frequently read.

Used by: Apache Cassandra, Amazon DynamoDB, Riak.`,
      callout: {
        kind: "note",
        text: "Leaderless replication gives maximum write availability — you can keep accepting writes even if N-W nodes are down. The trade-off is operational complexity: vector clocks or timestamps for conflict resolution, tuning R/W/N for your consistency vs availability needs, and read repair overhead.",
      },
    },
  ],
};
