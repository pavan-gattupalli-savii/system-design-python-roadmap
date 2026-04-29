import type { Concept } from "./index";

export const databaseIndexes: Concept = {
  slug:     "database-indexes",
  title:    "Database Indexes",
  emoji:    "🔍",
  category: "Database",
  tagline:  "The lookup table inside your database",
  roadmapKeywords: ["index", "indexes", "b-tree", "database", "query", "sql", "postgres", "covering index", "composite index"],
  related:  ["sql-vs-nosql", "acid-transactions", "sharding"],

  sections: [
    {
      heading: "What is a Database Index?",
      body: `An index is a separate data structure maintained by the database that maps key values to the physical location of the corresponding rows on disk. It is analogous to the index at the back of a textbook: instead of reading every page to find "load balancing", you look it up in the index and jump directly to page 142.

Without an index, a query like SELECT * FROM orders WHERE user_id = 12345 requires a full table scan — the database reads every single row in the table and checks if user_id matches 12345. For a table with 100 million rows, this could take many seconds.

With an index on user_id, the database uses the index's data structure to find the matching rows in O(log n) time, then fetches only those rows. The same query might complete in milliseconds.

The trade-off: indexes are not free. Every index takes storage space. Every INSERT, UPDATE, or DELETE must also update all indexes on the affected columns — writes become slower as you add more indexes. Indexes are a read optimisation that costs write performance and storage.`,
      diagram: "btree-index",
    },
    {
      heading: "B-Tree Indexes — The Default Index Type",
      body: `Almost every relational database (PostgreSQL, MySQL, Oracle, SQL Server) uses a B-tree (Balanced Tree) as the default index structure. Understanding the B-tree helps you reason about which queries benefit from an index and which don't.

A B-tree is a self-balancing tree where every node can have multiple keys and multiple children. All leaf nodes are at the same depth (balanced). The tree is kept sorted, which enables efficient range queries.

B-tree properties that matter for SQL:
- Equality lookups (=): O(log n) — traverse from root to the leaf containing the key
- Range queries (BETWEEN, >, <, >=, <=): very efficient — find the starting leaf, then follow the linked-list pointers between leaves
- ORDER BY: "free" — data in the index is already sorted
- Prefix LIKE queries (LIKE 'John%'): works — the tree is sorted, prefix scan is efficient
- Suffix LIKE queries (LIKE '%son'): does NOT work — the tree doesn't sort by suffix

The database's query planner decides whether to use an index. If the planner estimates that a table scan is faster than using the index (e.g., for very low-cardinality columns, or when fetching > ~10% of rows), it will scan instead.`,
    },
    {
      heading: "B-Tree vs Hash Index",
      table: {
        cols: ["Property", "B-Tree Index", "Hash Index"],
        rows: [
          ["Lookup",        "O(log n)",             "O(1) average"],
          ["Range queries", "Excellent",             "Not supported — hashes are not ordered"],
          ["ORDER BY",      "Supported (already sorted)", "Not supported"],
          ["LIKE prefix",   "Supported",             "Not supported"],
          ["Equality (=)",  "O(log n)",              "O(1) — faster for pure equality"],
          ["Storage",       "Larger (stores sorted keys + pointers)", "Smaller (just hash → rowid)"],
          ["Default in",    "PostgreSQL, MySQL/InnoDB, Oracle, SQLite", "PostgreSQL (explicit), MySQL Memory engine"],
          ["Use when",      "Almost everything — ranges, sorting, prefix searches", "Pure equality lookups where range/order never needed"],
        ],
      },
      callout: {
        kind: "note",
        text: "PostgreSQL also offers GIN indexes (for full-text search, JSONB, arrays), GiST indexes (geometric data, full-text), and BRIN indexes (time-series tables where values correlate with physical row order). These are specialised — use B-tree until you have a specific reason to switch.",
      },
    },
    {
      heading: "Composite Indexes — Column Order Matters Enormously",
      body: `A composite index is an index on multiple columns: CREATE INDEX idx_orders_user_status ON orders(user_id, status).

The leftmost prefix rule: a composite index on (A, B, C) can be used for queries that filter on: A alone, A+B together, or A+B+C together. It cannot be used efficiently for queries on B alone, C alone, or B+C without A.

This is because the B-tree sorts entries first by A, then by B within each A, then by C within each (A,B) group. If you query only on B, the data isn't sorted by B at the top level — you'd need a full index scan.

Rule of thumb: put the column with the highest cardinality first (the one with the most distinct values), unless you have a specific equality filter that should come first.

Example — index on (user_id, created_at):
- WHERE user_id = 5 → uses index ✓
- WHERE user_id = 5 AND created_at > '2025-01-01' → uses index ✓
- WHERE created_at > '2025-01-01' → CANNOT use index efficiently ✗ (need separate index on created_at)`,
    },
    {
      heading: "Covering Indexes",
      body: `A covering index is an index that contains all the columns a query needs, so the database never has to read the actual table rows — all the data is in the index itself. This eliminates the most expensive step: the random I/O to fetch heap rows.

Example: SELECT user_id, status, total FROM orders WHERE user_id = 5

If the index is (user_id, status, total), the query can be satisfied entirely from the index. No heap access needed. This is called an index-only scan in PostgreSQL.

In PostgreSQL, you can use INCLUDE to add non-search columns to the index: CREATE INDEX idx_orders_covering ON orders(user_id) INCLUDE (status, total). This keeps the index key small (fast searches) while including extra columns for covering.`,
      callout: {
        kind: "tip",
        text: "Covering indexes are one of the biggest 'free' performance wins. Before adding a new index, check if you can extend an existing one with INCLUDE to cover frequently selected columns.",
      },
    },
    {
      heading: "Partial and Expression Indexes",
      body: `Partial index: an index that only indexes rows matching a condition. CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL. If 95% of your users are soft-deleted, this index is 20x smaller than a full index and stays more cache-friendly.

Expression index (functional index): index on an expression, not a column. CREATE INDEX idx_lower_email ON users(LOWER(email)). Enables case-insensitive lookups without a table scan. The query WHERE LOWER(email) = 'john@example.com' will use this index.`,
    },
    {
      heading: "When NOT to Index",
      body: `More indexes is not always better. Indexes have real costs — evaluate carefully before adding one.`,
      bullets: [
        "Low-cardinality columns: a boolean column (is_active) has only 2 values. If 60% of rows are active, an index scan on is_active=true still reads 60% of the table — the planner will choose a full scan instead. Indexing this column wastes space and write overhead.",
        "Small tables: if a table has fewer than ~1,000 rows, a full table scan fits in a few memory pages and is faster than the overhead of index lookup. The planner typically ignores indexes on small tables anyway.",
        "Columns that are never queried: obvious, but easy to forget when copy-pasting index creation statements from tutorials.",
        "Write-heavy tables: each index adds overhead to every INSERT/UPDATE/DELETE. A table with 10 indexes and 10,000 inserts/second is spending significant CPU on index maintenance. Profile first.",
        "Columns that are always fetched with a full scan anyway: very wide range queries that return >20% of rows — the sequential scan is often faster because it's I/O-sequential vs random heap fetches.",
      ],
      callout: {
        kind: "warning",
        text: "Run EXPLAIN ANALYZE (PostgreSQL) or EXPLAIN (MySQL) on slow queries before adding an index. The query planner will show you whether an index is being used, which index, and what the actual cost is. Index blindly and you'll slow down your writes without helping your reads.",
      },
    },
    {
      heading: "Index Cardinality and Selectivity",
      body: `Selectivity = (number of distinct values) / (total rows). A highly selective index (selectivity close to 1.0) is useful — almost every value maps to a small set of rows, so the index lookup is efficient.

A low-selectivity index (selectivity near 0) is useless for filtering. Indexing a gender column with 2 values returns half the table — the query planner will table-scan instead.

ANALYZE (PostgreSQL) / ANALYZE TABLE (MySQL) collects statistics about column cardinality. The query planner uses these statistics to estimate whether using an index is worth it. Run ANALYZE regularly or let autovacuum handle it.`,
    },
  ],
};
