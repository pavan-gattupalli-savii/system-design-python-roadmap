import type { Concept } from "./index";

export const capTheorem: Concept = {
  slug:     "cap-theorem",
  title:    "CAP Theorem",
  emoji:    "🔺",
  category: "Distributed Systems",
  tagline:  "Pick two: Consistency, Availability, Partition Tolerance",
  roadmapKeywords: ["cap", "consistency", "availability", "partition", "distributed", "base", "pacelc"],
  related:  ["consistent-hashing", "replication", "acid-transactions"],

  sections: [
    {
      heading: "The Problem CAP Theorem Addresses",
      body: `The moment you split your database across more than one machine, you have a distributed system. Distributed systems communicate over a network, and networks are fundamentally unreliable — packets get lost, links go down, switches fail, and data centres get isolated from each other.

Eric Brewer formalised this in 2000 (proven by Gilbert and Lynch in 2002): a distributed data store can guarantee at most two of the three following properties at any given time.`,
    },
    {
      heading: "The Three Properties",
      body: `Consistency (C): Every read receives the most recent write or an error. All nodes in the cluster see the same data at the same time. When you write to any node, every subsequent read from any node returns that value. This is linearizability — the strongest consistency model.

Availability (A): Every request receives a (non-error) response — but it might not be the most recent data. Every node that is up will respond, even if that response is stale. A system is available if it keeps answering requests even when some nodes are down.

Partition Tolerance (P): The system continues to operate even when network messages between nodes are lost or delayed arbitrarily. A partition is a network split — some nodes can't talk to others.`,
      diagram: "cap-triangle",
      callout: {
        kind: "warning",
        text: "Partition Tolerance is NOT optional in any real distributed system. Networks partition. It's a matter of when, not if. So in practice, the choice is always between CP (sacrifice availability during a partition) and AP (sacrifice consistency during a partition). CA systems can only exist on a single machine.",
      },
    },
    {
      heading: "What Happens During a Partition",
      body: `When a network partition occurs — Node A can't talk to Node B — a distributed system must make a choice:

Option 1 — Maintain Consistency (CP): Refuse to answer requests on the minority side of the partition. Some nodes return errors or timeouts until the partition heals. The system is correct but unavailable on those nodes.

Option 2 — Maintain Availability (AP): Keep answering requests on both sides of the partition, even though nodes might return stale or conflicting data. The system stays up but might be incorrect.

There is no third option. If you require both nodes to answer AND to always return fresh data during a split — you've violated one of the two properties. Math doesn't negotiate.`,
    },
    {
      heading: "CP Systems — Consistent but can become Unavailable",
      table: {
        cols: ["System", "Type", "How it achieves CP", "Trade-off"],
        rows: [
          ["Apache ZooKeeper",  "Coordination service", "Paxos-based consensus; writes go through a single leader; minority partition refuses writes", "Writes are slow; ZooKeeper ensemble becomes unavailable if leader is partitioned"],
          ["HBase",             "Wide-column DB",       "Strongly consistent reads/writes via HDFS; a region server outage means that region is unavailable", "Lower availability; operations can fail during region server failures"],
          ["Google Spanner",    "NewSQL / Global DB",   "TrueTime API + Paxos consensus across data centres", "High latency for globally synchronous writes"],
          ["etcd",              "Key-value store",       "Raft consensus; leader election; minority partition refuses writes", "Same as ZooKeeper — leader loss causes brief unavailability"],
          ["MongoDB (w:majority)", "Document DB",        "Majority writes ensure durability before ack; reads from primary", "If primary is unreachable, replica set refuses writes until election completes"],
        ],
      },
    },
    {
      heading: "AP Systems — Available but Eventually Consistent",
      table: {
        cols: ["System", "Type", "How it achieves AP", "Consistency model"],
        rows: [
          ["Apache Cassandra", "Wide-column DB",     "Leaderless; any node can accept writes; gossip protocol syncs nodes eventually", "Eventual consistency; tunable (QUORUM, ONE, ALL)"],
          ["Amazon DynamoDB",  "Key-value / Doc DB", "Multi-region active-active replication; always accepts writes", "Eventual (default) or strong (strongly consistent reads, extra cost)"],
          ["CouchDB",          "Document DB",        "Multi-master; conflicts resolved via MVCC and revision tracking", "Eventual; conflict resolution required"],
          ["DNS",              "Name resolution",    "Responses are cached at multiple levels; updates propagate via TTL expiry", "Eventual — TTL propagation can take minutes to hours"],
          ["Riak",             "Key-value store",    "Dynamo-style leaderless with vector clocks for conflict detection", "Eventual; last-write-wins or application-level resolution"],
        ],
      },
    },
    {
      heading: "PACELC — Beyond CAP",
      body: `CAP only describes what happens during a partition. But partitions are rare — most of the time your network is healthy. During normal operation, there's still a trade-off between latency and consistency.

Daniel Abadi proposed PACELC (2012):
- If there is a Partition (P): choose between Availability (A) and Consistency (C)  
- Else (E): choose between Latency (L) and Consistency (C)

Example: DynamoDB is PA/EL — it picks availability over consistency during a partition, and picks low latency over strong consistency during normal operation.

Example: Spanner is PC/EC — it picks consistency always. During a partition and during normal operation, it enforces strong consistency, paying the latency cost.`,
      table: {
        cols: ["System", "PACELC classification", "Meaning"],
        rows: [
          ["DynamoDB",  "PA/EL", "During partition: available. Normal: optimises for low latency (eventual consistency by default)"],
          ["Cassandra", "PA/EL", "During partition: available. Normal: low latency tunable consistency"],
          ["MongoDB",   "PC/EC", "During partition: consistent (minority refuses writes). Normal: consistent reads from primary"],
          ["Spanner",   "PC/EC", "Always consistent, pays latency price"],
          ["MySQL/Postgres (single-node)", "PC/EC", "Single node — no partition. Consistent reads, latency depends on hardware"],
        ],
      },
      callout: {
        kind: "tip",
        text: "In an interview, don't just say 'AP or CP'. Say: 'This system is AP because during a partition we need to keep serving reads (e.g., product catalogue) even if some data is slightly stale. We accept eventual consistency and reconcile via last-write-wins.' Showing the trade-off reasoning is what interviewers are looking for.",
      },
    },
    {
      heading: "Tunable Consistency — Having it Both Ways (sometimes)",
      body: `Modern systems like Cassandra and DynamoDB don't force you to pick one extreme. They let you tune consistency per request using quorum reads and writes.

For a cluster of N replicas, a write with W acknowledgements required and a read from R replicas is strongly consistent if R + W > N.

Example: N=3 replicas. Set W=2 (write must be acked by 2 nodes) and R=2 (read from 2 nodes). Since 2+2=4 > 3, at least one of your read nodes always has the latest write. Strong consistency — but you've sacrificed some availability (if 2 nodes are down, both W and R can't be satisfied).

Set W=1, R=1: maximum availability, eventual consistency.
Set W=3, R=1: strong write durability, fast reads — but any node outage blocks writes.`,
    },
  ],
};
