import type { Concept } from "./index";

export const bloomFilter: Concept = {
  slug:     "bloom-filter",
  title:    "Bloom Filter",
  emoji:    "🌸",
  category: "Database",
  tagline:  "Probably yes, definitely no — a space-efficient membership test",
  roadmapKeywords: ["bloom filter", "probabilistic", "false positive", "hashing", "set membership", "cassandra", "bigtable"],
  related:  ["caching", "database-indexes", "consistent-hashing", "sharding"],

  sections: [
    {
      heading: "The Problem: Expensive Membership Checks",
      body: `Before accessing a database or cache for a key, you want to know: does this key exist? Checking the actual datastore takes a full read — disk I/O, network round-trip, or cache lookup. When millions of keys don't exist (the "negative lookup" case), these misses are expensive and wasteful.

Examples:
- Cassandra checking if an SSTable contains a key before reading it from disk
- A cache layer checking if a URL has been crawled before
- Chrome checking if a URL is in Google's Safe Browsing blacklist
- A database checking if a username is taken during signup

A Bloom filter solves this: a compact probabilistic data structure that answers "is this element in the set?" with two possible answers:
- "Definitely NOT in the set" — 100% accurate (no false negatives)
- "Probably IN the set" — may have false positives (but configurable rate)

A false positive means the bloom filter says "yes, it's there" but the element isn't actually in the set. A false negative (saying "not there" when it is) is impossible — making Bloom filters safe for use as a pre-filter before the real lookup.`,
      diagram: "bloom-filter-viz",
    },
    {
      heading: "How It Works",
      body: `A Bloom filter is a bit array of m bits (initially all 0) and k hash functions.

Adding an element: hash the element with each of the k hash functions, producing k array positions. Set each of those bits to 1.

Querying an element: hash the element with the same k functions. If ALL k bits are 1 → "probably present." If ANY bit is 0 → "definitely not present."

Why false positives happen: two different elements may map some of their bit positions to the same slots. If those slots are already set to 1 by other elements, a query for an element that was never inserted can find all k bits set — a false positive.

Why there are no false negatives: when you insert element X, its k bits are set to 1. When you query X, you check those same k positions. Since bits are only ever set to 1 (never reset to 0), all k bits will still be 1 — so X is always reported as "probably present."

Deletion is not supported in a standard Bloom filter — clearing a bit could affect other elements that share it. Counting Bloom filters use counters instead of bits to support deletion, at the cost of more space.`,
    },
    {
      heading: "Math: False Positive Rate and Sizing",
      body: `The false positive probability p depends on three parameters: m (bit array size), n (number of elements inserted), and k (number of hash functions).

False positive probability: p ≈ (1 − e^(−kn/m))^k

Optimal k for a given m and n: k = (m/n) × ln(2) ≈ 0.693 × (m/n)

Practical sizing: to achieve a false positive rate of p with n expected elements, you need m = −(n × ln p) / (ln 2)² bits.

Example: 1 million URLs, 1% false positive rate → m = −(1,000,000 × ln 0.01) / (ln 2)² ≈ 9.6 million bits ≈ 1.2 MB. For the same data in a hash set, you'd need at least 50-100 MB. Bloom filter uses ~100x less memory.`,
      table: {
        cols: ["False Positive Rate", "Bits per element (optimal k)", "Optimal k"],
        rows: [
          ["10%",   "4.8 bits",  "3 hash functions"],
          ["1%",    "9.6 bits",  "7 hash functions"],
          ["0.1%",  "14.4 bits", "10 hash functions"],
          ["0.01%", "19.2 bits", "13 hash functions"],
        ],
      },
      callout: {
        kind: "tip",
        text: "In practice, you choose your acceptable false positive rate first (usually 1–5%), then compute the bit array size. Cassandra uses one Bloom filter per SSTable — with a 1% false positive rate, 99% of non-existent key lookups skip the SSTable entirely (no disk read). This dramatically reduces read amplification for large datasets.",
      },
    },
    {
      heading: "Real-World Applications",
      table: {
        cols: ["System", "What's stored", "What Bloom filter prevents"],
        rows: [
          ["Cassandra / HBase",      "SSTable file per row range",         "Disk reads for keys that don't exist in that SSTable"],
          ["Bigtable (Google)",      "Tablet files",                       "Disk I/O for negative lookups across large tablets"],
          ["Chrome Safe Browsing",   "Millions of malicious URLs",         "Server round-trips for safe URLs (local Bloom filter check first)"],
          ["Akamai CDN",             "Recently requested URLs",            "Caching 'one-hit wonder' URLs that are never requested again"],
          ["Ethereum nodes",         "Recent transaction pool",            "Redundant transaction propagation across the P2P network"],
          ["Medium (blog platform)", "Recommended articles per user",      "Re-showing articles the user has already read"],
          ["Redis (4.0+)",           "Built-in module",                    "Native Bloom filter support with BF.ADD / BF.EXISTS commands"],
        ],
      },
    },
    {
      heading: "Variants",
      body: `Counting Bloom Filter: replaces each bit with a small counter (4 bits). Supports deletion — decrement counters instead of clearing bits. Used in network packet classification and IP routing. Cost: 4x more space than a standard Bloom filter.

Scalable Bloom Filter: automatically grows by adding new Bloom filter tiers as the set fills. Each tier has a stricter false positive rate so the overall rate stays bounded. Good for datasets with unknown or unbounded size.

Cuckoo Filter: an alternative to Bloom filters that supports deletion (without counting), uses slightly less space at low false positive rates (<3%), and has better cache locality. Faster for lookups. Favoured in modern implementations.

Xor Filter: even more compact than Cuckoo filters for static sets (cannot add elements after construction). Used in database indexes where the set is built once and then read-only.`,
    },
    {
      heading: "When NOT to Use a Bloom Filter",
      bullets: [
        "When false positives are unacceptable — e.g., financial transactions where 'probably exists' isn't good enough. Use a hash set or the actual database.",
        "When the set is small enough to fit in memory — a hash set is faster and exact.",
        "When you need to delete elements frequently — use a Counting Bloom Filter or Cuckoo Filter instead.",
        "When you need to enumerate the elements in the set — Bloom filters are write-only; you can't retrieve what was inserted.",
        "When the fill ratio will exceed ~50% — false positive rate rises sharply. Size generously or use a Scalable Bloom Filter.",
      ],
    },
  ],
};
