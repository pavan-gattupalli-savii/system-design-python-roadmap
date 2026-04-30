import type { Concept } from "./index";

export const fullTextSearch: Concept = {
  slug:     "full-text-search",
  title:    "Full-Text Search",
  emoji:    "🔎",
  category: "Database",
  tagline:  "Searching document content in milliseconds — not exact matches but relevance",
  roadmapKeywords: ["full text search", "elasticsearch", "inverted index", "tfidf", "bm25", "lucene", "search engine", "tokenization", "relevance"],
  related:  ["database-indexes", "caching", "sharding", "replication"],

  sections: [
    {
      heading: "Why Regular Database Indexes Don't Work for Search",
      body: `A B-tree index on a text column supports prefix matches (LIKE 'foo%') but not substring or relevance-ranked search. Finding all documents containing the word "distributed" in a million-row table with LIKE '%distributed%' requires a full table scan — O(n) with no index help.

Even if you could make it fast, a naive LIKE match doesn't handle:
- Stemming: "running" should match "run", "runs", "runner"
- Synonyms: "automobile" should match "car"
- Relevance: documents where "distributed systems" appears 10 times are more relevant than those where it appears once
- Multi-field ranking: a match in the title is more important than a match in the body
- Typos: "distibuted" should still find "distributed" (fuzzy matching)

Full-text search engines solve all of this with an inverted index and a relevance scoring model.`,
      diagram: "inverted-index-viz",
    },
    {
      heading: "Inverted Index",
      body: `An inverted index maps each term (word) to the list of documents that contain it — the inverse of a document-to-word mapping.

Building the index (indexing pipeline):
1. Tokenisation: split text into tokens (words). "The quick brown fox" → ["The", "quick", "brown", "fox"]
2. Normalisation: lowercase, remove punctuation. ["the", "quick", "brown", "fox"]
3. Stop word removal: remove common words that add no search signal. ["quick", "brown", "fox"] (removed "the")
4. Stemming / lemmatisation: reduce words to root form. "running" → "run", "faster" → "fast"
5. Store: for each resulting term, record the document ID and position(s) where the term appears.

Example inverted index:
- "quick"  → [doc1: positions [2], doc5: positions [7, 12]]
- "brown"  → [doc1: positions [3], doc3: positions [1]]
- "fox"    → [doc1: positions [4], doc8: positions [9]]

When searching for "quick brown fox": look up all three terms, intersect the posting lists, documents containing all three terms rank highest. doc1 contains all three → top result.

Phrase queries: "quick brown fox" as a phrase requires that the terms appear in consecutive positions. The position data in the posting list enables this.`,
    },
    {
      heading: "Relevance Scoring — TF-IDF and BM25",
      body: `A search for "distributed systems" matches thousands of documents. Which one should rank first? Relevance scoring determines the order.

TF-IDF (Term Frequency–Inverse Document Frequency):
- TF (term frequency): how many times the search term appears in this document? More occurrences = more relevant. Normalised by document length.
- IDF (inverse document frequency): how rare is this term across all documents? "the" appears in every document (low IDF, low weight). "Paxos" appears in few documents (high IDF, high weight).
- Score = TF × IDF. Terms that appear frequently in this document AND rarely across all documents give the highest signal.

BM25 (Best Match 25): the modern improvement over TF-IDF, used by Elasticsearch (since v5), Lucene, and Solr as the default. BM25 adds:
- Saturation: TF contribution doesn't grow linearly — a word appearing 100 times is not 10x more relevant than one appearing 10 times. BM25 saturates the TF component.
- Length normalisation: short documents with a match are more relevant than long documents with the same match (the term density is higher).
- Configurable k1 (TF saturation) and b (length normalisation) parameters.`,
      callout: {
        kind: "note",
        text: "Modern search systems supplement BM25 with semantic/vector search: encode documents and queries as dense vectors (via transformer models like BERT, sentence-transformers). Compute cosine similarity between query vector and document vectors. This enables 'find documents about distributed systems' even without exact keyword matches. Hybrid search (BM25 + vector) is the current state of the art in Elasticsearch 8.x, OpenSearch, and pgvector.",
      },
    },
    {
      heading: "Elasticsearch Architecture",
      body: `Elasticsearch is a distributed full-text search engine built on Apache Lucene. Each Lucene instance manages local inverted indexes; Elasticsearch adds distribution.

Index: a collection of documents with the same schema (like a database table). E.g., a "products" index with 10 million product documents.

Shard: an index is split into N primary shards, each a self-contained Lucene instance. A query fans out to all shards (scatter-gather). More shards = more parallelism but more coordination overhead. Rule of thumb: 10-50GB per shard.

Replica shards: each primary shard has R replicas. Reads can be served from any replica. Replicas also provide fault tolerance.

Write path: document → coordinating node → hashed to primary shard → primary writes + indexes → replicas sync.

Query path: query → coordinating node → fan out to all shards (or only shards with matching data for filter queries) → each shard returns its top-K results + scores → coordinating node merges and re-ranks → final top-K returned to client.

Inverted index on disk: Elasticsearch uses Lucene segments — immutable on-disk files. New documents go into an in-memory buffer, periodically flushed as a new segment (refresh, default every 1 second). Background merges combine small segments into large ones for query performance.`,
    },
    {
      heading: "Search vs Database — When to Use Each",
      table: {
        cols: ["Need", "Use", "Why"],
        rows: [
          ["Exact lookup by ID",              "Database (B-tree index)",    "O(log n) exact match, ACID guarantees"],
          ["Keyword search with ranking",     "Search engine (ES, Solr)",   "Inverted index, BM25 scoring, millisecond response"],
          ["Autocomplete / prefix search",    "Search engine or prefix trie", "ES completion suggester, edge ngrams"],
          ["Fuzzy / typo-tolerant search",    "Search engine",              "Levenshtein automata, fuzziness parameter in ES"],
          ["Semantic / meaning-based search", "Vector database or ES+kNN",  "Dense vector similarity (cosine/dot product)"],
          ["Faceted navigation (filters)",    "Search engine",              "Aggregations in ES, faceting in Solr"],
          ["Geospatial search",               "Postgres (PostGIS) or ES",   "Geo distance queries, bounding box, polygon"],
          ["Aggregations / analytics",        "OLAP (ClickHouse) or ES",    "ES aggregations for search-adjacent analytics; ClickHouse for heavy analytics"],
        ],
      },
    },
    {
      heading: "Keeping the Search Index in Sync",
      body: `Search engines are typically a secondary store, not the source of truth. Data lives in PostgreSQL/MySQL; Elasticsearch contains a copy for search. Keeping them in sync is non-trivial.

Dual write (synchronous): application writes to both the database and Elasticsearch in the same request. Simple but error-prone — if the ES write fails after the DB write succeeds, they're out of sync.

Change Data Capture (CDC): stream database changes (via WAL for PostgreSQL, binlog for MySQL) to a connector (Debezium) that publishes them to Kafka. Elasticsearch consumer ingests the events and updates its index. Eventually consistent (seconds lag) but reliable and decoupled from the application write path.

Bulk re-indexing: periodically rebuild the entire search index from the source of truth. Safe but introduces downtime or requires blue/green index aliases. Use when CDC is impractical or for schema migrations.

Index aliases: Elasticsearch supports index aliases — a pointer from an alias name ("products") to one or more real indexes ("products-v2"). During a re-index, build a new index in parallel, then atomically switch the alias. Zero downtime for search consumers.`,
    },
  ],
};
