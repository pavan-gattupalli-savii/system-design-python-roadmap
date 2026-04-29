import type { Concept } from "./index";

export const consistentHashing: Concept = {
  slug:     "consistent-hashing",
  title:    "Consistent Hashing",
  emoji:    "🔄",
  category: "Distributed Systems",
  tagline:  "Balanced by design — even when nodes come and go",
  roadmapKeywords: ["consistent hashing", "hash ring", "sharding", "partition", "vnodes", "cassandra", "dynamo"],
  related:  ["sharding", "cap-theorem", "caching"],

  sections: [
    {
      heading: "The Problem with Naive Modulo Hashing",
      body: `The simplest way to distribute data across N servers is modulo hashing: server = hash(key) % N.

If you have 3 servers and hash("user:123") = 15, that key lives on server 15 % 3 = 0.

This works perfectly until N changes. When you add a 4th server, N becomes 4. Now hash("user:123") = 15 → 15 % 4 = 3. The key moved to server 3. In fact, almost every key changes its server assignment when N changes.

In a cache cluster with 3 nodes and 1 million cached keys: if you add or remove one node, approximately (N-1)/N = 67% of all keys become invalid cache misses. Every user suddenly fetches from the database. Your database collapses under the load.

In a distributed database: reshuffling 67% of data when you add one node means massive data transfer across the network. This could take hours and saturate your network.

Consistent hashing reduces this to O(K/N) key remappings when a node is added or removed — where K is the total number of keys and N is the number of nodes. Only the keys that were on the specific node being removed need to be redistributed.`,
    },
    {
      heading: "The Hash Ring",
      body: `Consistent hashing maps both servers and data keys onto a conceptual ring (a number line that wraps around, with values 0 to 2^32 or 0 to 2^64 depending on the hash function).

Step 1 — Place servers on the ring: hash each server's identifier (hostname, IP, ID) to get a position on the ring. With 3 servers, you get 3 points distributed across the ring.

Step 2 — Place keys on the ring: hash each data key to get its position on the ring.

Step 3 — Route requests: walk clockwise from the key's position until you hit the first server. That's the server responsible for this key. This rule is fixed and deterministic.

When a server is added: it takes a position on the ring. Only the keys between the new server and its predecessor (anticlockwise) are remapped from the next server clockwise to the new server. All other keys are unaffected.

When a server is removed: only the keys it held are remapped to the next server clockwise. All other keys are unaffected.`,
      diagram: "hash-ring",
    },
    {
      heading: "Virtual Nodes (Vnodes) — Solving Hot Spots",
      body: `The basic ring has a problem: with few servers, the ring segments are uneven. If three servers hash to positions 10, 12, and 250 on a 0-255 ring, server at position 250 owns positions 12-250 — 93% of the ring! This server gets nearly all the traffic and data. The other two servers are idle.

Solution: virtual nodes (vnodes). Instead of placing each physical server once on the ring, place it at many positions. A server with 150 vnodes appears at 150 different ring positions, randomly distributed. Each vnode is a virtual replica of the physical server.

Benefits of vnodes:
1. Even data distribution: 150 random positions per server distributes load far more evenly than 1 position.
2. Graceful scaling: when adding a new server, it claims a few ring segments from each existing server rather than one large segment from one server.
3. Heterogeneous hardware: give more vnodes to more powerful servers. A server with twice the RAM can have twice as many vnodes and will hold twice as much data proportionally.

Cassandra defaults to 256 vnodes per physical server. DynamoDB uses a more complex variant internally.`,
      callout: {
        kind: "note",
        text: "Vnodes introduce overhead: the routing table grows (150 vnodes × N servers entries), and repair/rebalancing is more complex. The trade-off is worth it at scale, but for small clusters (< 10 nodes) the simple ring without vnodes is easier to reason about.",
      },
    },
    {
      heading: "Replication with Consistent Hashing",
      body: `Consistent hashing makes replication straightforward. Instead of routing to just the first clockwise server, route to the first R clockwise servers. Each key has R replicas on R consecutive servers around the ring.

This is exactly what Cassandra's replication strategy does with its SimpleStrategy (single data centre). With replication factor 3, each row is stored on 3 consecutive servers in the ring.

Reads and writes use quorum mathematics (R + W > N) to determine consistency level — this ties directly to the CAP theorem trade-offs: choose more replicas to read from for stronger consistency, at the cost of availability during partial failures.`,
    },
    {
      heading: "Real-World Usage",
      table: {
        cols: ["System", "How consistent hashing is used"],
        rows: [
          ["Apache Cassandra",  "Primary partitioning strategy. Murmur3 hash of partition key → ring position. 256 vnodes per node by default. NetworkTopologyStrategy distributes replicas across racks."],
          ["Amazon DynamoDB",   "Internal consistent hashing (details not public). Keys partitioned across storage nodes with automatic rebalancing. Users set partition key; DynamoDB handles the ring."],
          ["Memcached clients", "ketama algorithm — a consistent hash client library. Cache clients hash keys to cache servers. Adding a server only remaps ~1/N keys."],
          ["CDN cache routing", "Edge PoPs use consistent hashing to decide which cache server in a PoP handles a given URL. Prevents the same content from being cached on every server."],
          ["Discord / Riak",    "Riak (Dynamo-inspired) uses 64 ring partitions per node. Discord used it for message routing across server clusters."],
          ["Redis Cluster",     "Uses hash slots (0-16383) with CRC16 of the key. Not pure consistent hashing, but the same concept — each node owns a range of hash slots."],
        ],
      },
    },
    {
      heading: "Consistent Hashing vs Range Partitioning",
      body: `Consistent hashing is not the only way to partition data. Range partitioning assigns key ranges to nodes (e.g., A-M → node 1, N-Z → node 2). This enables efficient range scans but creates hot spots if your keys aren't uniformly distributed (e.g., all users whose name starts with 'J' go to node 1).

Consistent hashing deliberately destroys key ordering. Keys that are lexicographically close end up on different nodes. This achieves uniform load but makes range scans impossible across multiple nodes — you'd need to query all nodes and merge results.

Choose consistent hashing when: uniform load distribution is the priority and range queries span entire datasets.
Choose range partitioning when: your queries frequently scan ranges of keys and you can accept hot spots or need to ensure key locality.`,
      callout: {
        kind: "tip",
        text: "DynamoDB uses consistent hashing for its partition key — but you add a sort key to enable range queries within a single partition. This is the best of both worlds: hashing for distribution, range indexing within each partition. Understanding this pattern is the foundation of designing DynamoDB schemas.",
      },
    },
  ],
};
