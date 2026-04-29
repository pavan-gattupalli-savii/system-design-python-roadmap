import type { Concept } from "./index";

export const rateLimiting: Concept = {
  slug:     "rate-limiting",
  title:    "Rate Limiting",
  emoji:    "🚦",
  category: "Networking",
  tagline:  "Protecting your API from being overwhelmed",
  roadmapKeywords: ["rate limit", "rate limiting", "throttle", "token bucket", "api gateway", "429", "leaky bucket"],
  related:  ["load-balancing", "api-design", "caching"],

  sections: [
    {
      heading: "Why Rate Limiting?",
      body: `An API without rate limits is an invitation to abuse. A single misbehaving client — a broken retry loop, a scraper, a DDoS attack, or a well-meaning developer with a bug — can consume all your server resources and degrade service for every other user.

Rate limiting caps how many requests a client can make within a time window. It protects your system by:
1. Preventing resource exhaustion: database connections, CPU, memory, and bandwidth are finite.
2. Ensuring fair usage: one client can't starve others by monopolising server capacity.
3. Protecting downstream services: if your API calls a payment processor that limits you to 100 req/sec, you need to enforce that limit before hitting it.
4. Enabling tiered pricing: free tier gets 100 req/min; paid tier gets 10,000 req/min. Rate limits enforce the business model.
5. Slowing brute-force attacks: password guessing and credential stuffing attacks depend on making thousands of rapid attempts. Rate limiting makes them economically unviable.`,
    },
    {
      heading: "The Token Bucket Algorithm",
      body: `Token bucket is the most widely used rate limiting algorithm, used by AWS API Gateway, Stripe, GitHub, and most major APIs.

Imagine a bucket with a maximum capacity of B tokens. Tokens are added to the bucket at a fixed rate R tokens/second. Each incoming request consumes one token. If there are no tokens left, the request is rejected (HTTP 429 Too Many Requests).

Properties:
- Burst allowance: if a client sends no requests for 5 seconds, the bucket fills up. It can then burst up to B requests instantly before being throttled. This is crucial for real users who send occasional bursts (opening a page loads 20 resources simultaneously).
- Sustained rate: over a long window, the client cannot exceed R requests/second regardless of burst behaviour.
- Two parameters to tune: R (fill rate = sustained average) and B (bucket capacity = maximum burst size).

Example: R=10 req/sec, B=50 tokens. Client can burst 50 requests instantly, then is limited to 10/sec thereafter.`,
      diagram: "token-bucket",
    },
    {
      heading: "Rate Limiting Algorithms Compared",
      table: {
        cols: ["Algorithm", "How it works", "Allows bursts?", "Memory per client", "Best for"],
        rows: [
          ["Token Bucket",            "Tokens accumulate at rate R up to capacity B. Requests consume tokens.", "Yes — up to B requests instantly", "O(1) — just current token count + timestamp", "Most APIs; AWS API Gateway, Stripe, GitHub"],
          ["Leaky Bucket",            "Requests enter a queue (bucket); processed at fixed rate. Overflow is dropped.", "No — fixed output rate regardless of input", "O(queue size) — entire queue stored", "Traffic shaping for uniform output; networking QoS"],
          ["Fixed Window Counter",    "Count requests in current time window (e.g., this minute). Reset at window boundary.", "Yes — burst at window start", "O(1) — just a counter + window start time", "Simple, low-memory; coarse-grained limits"],
          ["Sliding Window Log",      "Store timestamp of every request. Count how many fall within the last N seconds.", "No — precise rolling window", "O(requests per window) — all timestamps stored", "Precise limits when memory is available"],
          ["Sliding Window Counter",  "Approximate sliding window: blend current window count + previous window count weighted by position", "Slight burst at boundary", "O(1) — two counters", "Best balance of accuracy and memory; recommended for most production systems"],
        ],
      },
      callout: {
        kind: "warning",
        text: "Fixed Window Counter has a boundary burst problem: a client can make 100 requests in the last second of window 1 and 100 requests in the first second of window 2 — 200 requests in 2 seconds despite a limit of 100/minute. Sliding Window Counter solves this without the memory cost of storing individual timestamps.",
      },
    },
    {
      heading: "Where to Enforce Rate Limits",
      bullets: [
        "API Gateway (recommended): Centralize rate limiting at the entry point. AWS API Gateway, Kong, Nginx, Envoy, Traefik all support rate limiting natively. The application servers never see excess traffic.",
        "Middleware layer: If you don't have an API gateway, add rate limiting as middleware in your application server (e.g., express-rate-limit for Node.js, Flask-Limiter for Python). Uses Redis for shared state across multiple app servers.",
        "CDN / Edge: Cloudflare Rate Limiting can enforce limits before requests even reach your infrastructure. Best for DDoS protection — traffic is blocked at the edge, saving origin bandwidth.",
        "Load balancer: HAProxy, Nginx, and AWS ALB support basic request rate limiting. Good for coarse-grained protection.",
        "Service mesh: Envoy and Istio support rate limiting at the sidecar proxy level — useful for service-to-service rate limiting in microservices architectures.",
      ],
      callout: {
        kind: "tip",
        text: "Rate limiting at the application layer is fine for a single server. The moment you have multiple instances, you need a shared counter — use Redis. Redis's atomic INCR and EXPIRE commands make it the de-facto standard for distributed rate limiting.",
      },
    },
    {
      heading: "Distributed Rate Limiting",
      body: `Rate limiting a single server is trivial: store the counter in memory. The challenge appears when you have multiple API server instances behind a load balancer.

Problem: if counter is stored in-process, each of your 10 servers has its own counter. A client can make 100 requests to each server for a total of 1,000 requests — 10x your limit.

Solution 1 — Centralised Redis counter: Every request increments a shared Redis key (e.g., rate:user:12345). Redis's single-threaded atomic INCR ensures no race conditions. EXPIRE sets the window. This adds ~0.5ms per request (one Redis round trip). Works well up to millions of requests/second.

Solution 2 — Sticky load balancing: Route each client to the same server always (IP hash or session affinity). Eliminates distributed counter problem. But creates hot spots and defeats horizontal scaling — not recommended.

Solution 3 — Gossip protocol with approximate counting: Each server tracks its own count and shares with peers periodically. Approximate but avoids central bottleneck. Used at very large scale (Twitter's approach).`,
    },
    {
      heading: "HTTP 429 and Client Handling",
      body: `When a client exceeds a rate limit, your API should return HTTP 429 Too Many Requests with standard headers that tell the client when they can retry.

Standard response headers (de-facto standard, also in RFC 6585):
- X-RateLimit-Limit: the maximum requests allowed in the window
- X-RateLimit-Remaining: how many requests the client has left in the current window
- X-RateLimit-Reset: Unix timestamp when the window resets (or seconds until reset)
- Retry-After: seconds the client should wait before retrying (required by RFC 6585)

Client-side best practices:
1. Exponential backoff with jitter: wait 2^attempt + random(0, 1) seconds before each retry. Prevents all clients retrying simultaneously after a 429.
2. Respect Retry-After: don't retry before the server says it's safe. Respect the header.
3. Circuit breaker: after N consecutive 429s, stop sending requests entirely for a cooldown period. Re-try after the circuit opens.`,
    },
  ],
};
