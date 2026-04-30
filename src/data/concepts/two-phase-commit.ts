import type { Concept } from "./index";

export const twoPc: Concept = {
  slug:     "two-phase-commit",
  title:    "Two-Phase Commit",
  emoji:    "🤝",
  category: "Distributed Systems",
  tagline:  "Coordinating atomic commits across multiple nodes — and why it's hard",
  roadmapKeywords: ["two phase commit", "2pc", "distributed transaction", "coordinator", "xa", "consensus", "atomicity"],
  related:  ["acid-transactions", "cap-theorem", "saga-pattern", "replication"],

  sections: [
    {
      heading: "The Problem: Atomic Commits Across Nodes",
      body: `Single-node databases achieve atomicity with a write-ahead log (WAL): if the machine crashes mid-transaction, the log is replayed on restart — either committing or rolling back. This works because the coordinator (database engine) and the participants (disk/memory) are on the same machine.

Distribute a transaction across two machines — "debit Alice on Node 1 AND credit Bob on Node 2" — and this breaks. If Node 1 commits its debit but the network fails before Node 2 can commit its credit, the money vanishes. There is no shared WAL, no single crash recovery.

Two-Phase Commit (2PC) solves this with a protocol that guarantees either all nodes commit or all nodes abort, even in the presence of node crashes and network failures.`,
      diagram: "two-pc-flow",
    },
    {
      heading: "Protocol: Phase 1 — Prepare (Voting)",
      body: `Participants: one coordinator node and N participant nodes. The coordinator orchestrates the protocol.

Phase 1 — Prepare (Voting):
1. The coordinator writes "begin prepare" to its WAL.
2. The coordinator sends a PREPARE message to all participants.
3. Each participant receives PREPARE, does all necessary pre-commit work (write new data to WAL, acquire all locks, validate constraints), and then votes:
   - YES (commit-ready): participant writes "yes" to its WAL and sends YES to coordinator. The participant is now in a "prepared" state — it MUST commit if the coordinator says so.
   - NO (abort): participant cannot commit (constraint violation, deadlock, disk full). Sends NO to coordinator and rolls back immediately.
4. The coordinator collects votes from all participants and moves to Phase 2.

The key insight of Phase 1: a participant that votes YES has made a binding promise. Even if it crashes and restarts, it can reconstruct its prepared state from its WAL and still commit when Phase 2 arrives. This is what makes 2PC recoverable.`,
    },
    {
      heading: "Protocol: Phase 2 — Commit/Abort",
      body: `Phase 2 — Commit or Abort:

If ALL participants voted YES:
1. Coordinator writes "commit" to its WAL.
2. Coordinator sends COMMIT to all participants.
3. Each participant commits, releases locks, writes "committed" to its WAL.
4. Each participant sends ACK to coordinator.
5. Coordinator writes "done" to WAL. Transaction is complete.

If ANY participant voted NO (or timed out):
1. Coordinator writes "abort" to its WAL.
2. Coordinator sends ABORT to all participants.
3. Each participant rolls back, releases locks.
4. Transaction is cancelled.

The protocol guarantees: every participant either commits or aborts — never a split (one commits, another aborts).`,
    },
    {
      heading: "The Blocking Problem — 2PC's Fatal Flaw",
      body: `2PC has a fundamental weakness: it is a blocking protocol. After a participant votes YES in Phase 1, it holds all its locks and waits for the Phase 2 commit/abort message. If the COORDINATOR fails at this moment, the participants are stuck — they cannot commit (haven't received COMMIT) and cannot abort (they voted YES, binding themselves).

The participant must wait indefinitely until the coordinator recovers. It cannot ask other participants what to do — they're in the same uncertain state. This is the "uncertain period" of 2PC.

In practice: the coordinator uses a WAL. On restart, it reads its log and sends the missed Phase 2 messages. Recovery time = coordinator restart time. With persistent storage and fast restarts, this is typically seconds to minutes.

But in cloud environments with transient node failures, 2PC can block for extended periods. Database administrators have war stories about 2PC transactions holding locks for hours during coordinator failures, blocking all writes to affected tables.`,
      callout: {
        kind: "warning",
        text: "2PC does NOT handle the case where both the coordinator AND a participant crash simultaneously. In this scenario, even after the coordinator recovers, it doesn't know whether the crashed participant had committed before crashing. Human intervention or a timeout-based heuristic abort is required. This is called the 'heuristic hazard.'",
      },
    },
    {
      heading: "XA Transactions — 2PC in Practice",
      body: `The XA standard (by The Open Group) defines a protocol for 2PC between a transaction manager (coordinator) and multiple resource managers (databases, message brokers).

Supported by: PostgreSQL, MySQL, Oracle, SQL Server, IBM DB2. Message brokers: IBM MQ, ActiveMQ. Java applications use XA via JTA (Java Transaction API).

XA transaction flow: the Java EE application server (coordinator) begins an XA transaction, calls xa_start() on each database, executes SQL, calls xa_end(), then xa_prepare() (Phase 1), then xa_commit() or xa_rollback() (Phase 2).

Limitations: XA is slow (multiple network round trips, lock holding across phases), not supported by all NoSQL databases or modern cloud-native datastores, and has the blocking failure mode described above. Most cloud-native architects avoid XA and use the Saga pattern instead.`,
    },
    {
      heading: "Comparison: 2PC vs Saga vs Paxos/Raft",
      table: {
        cols: ["Property", "2PC", "Saga", "Paxos / Raft"],
        rows: [
          ["Guarantee",      "Atomic commit across all nodes",              "Eventual consistency via compensation",              "Distributed consensus (elect leader, replicate log)"],
          ["Blocking",       "Yes — locks held across network round trips", "No — each step commits independently",              "No — non-blocking under quorum availability"],
          ["Failure mode",   "Blocks if coordinator fails during prepare",  "Temporary inconsistency; compensating txns run",    "Progress if majority of nodes available"],
          ["Performance",    "High latency — 2+ round trips, lock holding", "High throughput — no global locking",               "High throughput at log level; used for coordination"],
          ["Use case",       "OLTP across 2-3 databases in same DC",        "Business processes across microservices",            "Leader election, distributed log, metadata store"],
          ["Examples",       "XA transactions, PostgreSQL 2PC",             "Temporal.io, Axon, hand-rolled orchestrators",      "etcd (Raft), ZooKeeper (ZAB), Spanner (Paxos)"],
        ],
      },
    },
  ],
};
