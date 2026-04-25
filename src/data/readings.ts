// ── READINGS DATA ─────────────────────────────────────────────────────────────
// Seed list of community-curated readings. New entries are submitted in-app via
// `/app/readings/submit` and live in the `readings` table (joined to `users`
// for author info). The exported `Reading` type still mirrors what the API
// returns so the same components can render seed data and DB rows.
//
// Upvotes are user-owned — they live in the `reading_upvotes` table and toggle
// through `POST/DELETE /api/readings/:id/upvote`. There is no browser-local
// voting any more.

export interface Reading {
  id:          number;
  type:        string;
  title:       string;
  url:         string;
  addedBy:     string;
  githubUser?: string;
  linkedin?:   string;
  topics:      string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  upvotes:     number;
  addedOn:     string;
  notes?:      string;
}

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

// ── Post types ────────────────────────────────────────────────────────────────
export const POST_TYPES = [
  "Blog", "YouTube", "LinkedIn", "Book", "Paper",
  "Course", "Newsletter", "Thread", "Docs", "Website",
  "Podcast", "Tool", "Repo", "Slide", "Case Study",
] as const;

// ── Readings data ─────────────────────────────────────────────────────────────
export const READINGS: Reading[] = [
  {
    id: 1,
    type: "Blog",
    title: "Designing Netflix — How 1M users stream simultaneously",
    url: "https://blog.bytebytego.com/p/netflix-system-design",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["streaming", "cdn", "scale", "hld"],
    difficulty: "Intermediate",
    upvotes: 14,
    addedOn: "2025-04-01",
    notes: "Brilliant breakdown of edge-caching and adaptive bitrate streaming.",
  },
  {
    id: 2,
    type: "LinkedIn",
    title: "CAP Theorem explained with real examples",
    url: "https://www.linkedin.com/posts/iamgpavan",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["cap-theorem", "distributed-systems", "consistency"],
    difficulty: "Intermediate",
    upvotes: 9,
    addedOn: "2025-04-05",
    notes: "Visual post with Cassandra / ZooKeeper comparisons.",
  },
  {
    id: 3,
    type: "YouTube",
    title: "ByteByteGo — How does a CDN work?",
    url: "https://www.youtube.com/watch?v=RI9np1LWzqw",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["cdn", "caching", "networking"],
    difficulty: "Beginner",
    upvotes: 22,
    addedOn: "2025-04-08",
  },
  {
    id: 4,
    type: "Book",
    title: "Designing Data-Intensive Applications — Ch. 5: Replication",
    url: "https://dataintensive.net/",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["replication", "databases", "consistency", "ddia"],
    difficulty: "Advanced",
    upvotes: 31,
    addedOn: "2025-04-10",
    notes: "The definitive reference for replication strategies.",
  },
  {
    id: 5,
    type: "Blog",
    title: "Stripe's rate-limiting approach with Redis",
    url: "https://stripe.com/blog/rate-limiters",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["rate-limiting", "redis", "api-design"],
    difficulty: "Intermediate",
    upvotes: 17,
    addedOn: "2025-04-12",
  },
  {
    id: 6,
    type: "Paper",
    title: "Google Spanner — Globally-Distributed Databases (2012)",
    url: "https://research.google/pubs/pub39966/",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["distributed-systems", "databases", "google", "consistency"],
    difficulty: "Advanced",
    upvotes: 11,
    addedOn: "2025-04-15",
    notes: "Original Spanner paper — TrueTime and external consistency.",
  },
  {
    id: 7,
    type: "Newsletter",
    title: "The Pragmatic Engineer — System Design deep dives",
    url: "https://newsletter.pragmaticengineer.com/",
    addedBy: "Pavan",
    githubUser: "pavan-gattupalli-savii",
    topics: ["system-design", "engineering", "career"],
    difficulty: "Intermediate",
    upvotes: 8,
    addedOn: "2025-04-18",
  },
];
