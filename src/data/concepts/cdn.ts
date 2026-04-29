import type { Concept } from "./index";

export const cdn: Concept = {
  slug:     "cdn",
  title:    "CDN",
  emoji:    "🌐",
  category: "Networking",
  tagline:  "Delivering content from the edge, close to the user",
  roadmapKeywords: ["cdn", "edge", "cloudflare", "akamai", "cache", "static assets", "ttl", "invalidation"],
  related:  ["caching", "dns", "load-balancing"],

  sections: [
    {
      heading: "What is a CDN?",
      body: `A Content Delivery Network (CDN) is a geographically distributed network of proxy servers (Points of Presence, PoPs) that cache and serve content from locations physically close to end users.

Without a CDN: a user in Sydney requesting your website hosted in US-East waits for a round trip of ~200ms just for the initial TCP handshake, plus another 200ms for TLS, before any content is transferred. Each resource (HTML, CSS, JS, images) adds more round trips. A page with 50 resources can take 4-5 seconds to load from the other side of the world.

With a CDN: that same Sydney user connects to a PoP in Sydney (maybe 5ms away), which has a cached copy of your content. The full page loads in under 500ms. Your US-East server never receives the request.

CDNs serve two functions:
1. Caching static assets (HTML, CSS, JS, images, fonts, video) at the edge — the primary use case.
2. Accelerating dynamic content — the CDN's optimised network backbone routes requests faster than the public internet, even when content can't be cached.`,
      diagram: "cdn-flow",
    },
    {
      heading: "How CDN Caching Works",
      body: `When a user requests content, the CDN PoP checks its local cache:

Cache HIT: PoP has a fresh copy → serves immediately from edge. Origin server never involved.
Cache MISS: PoP doesn't have it or it's expired → PoP fetches from origin, caches the response, serves to user. Origin pays the cost only on first request per PoP.

Cache freshness is controlled by HTTP response headers from the origin:
- Cache-Control: max-age=86400 — cache for 24 hours
- Cache-Control: public — cacheable by CDN (and browser)
- Cache-Control: private — browser cache only, NOT the CDN
- Cache-Control: no-store — never cache (login pages, bank transfers)
- Surrogate-Control (Fastly, Akamai): same as Cache-Control but only for CDN layer; not passed to browser

After a cache entry expires (TTL elapsed), the CDN makes a conditional GET to origin (If-None-Match with ETag, or If-Modified-Since). If content unchanged, origin returns 304 Not Modified — no content transferred, CDN extends the cache. Only if content actually changed does origin return a full 200 with the new body.`,
    },
    {
      heading: "Cache Invalidation",
      body: `Cache invalidation is one of the hardest problems in CDNs. Your content is cached across hundreds of PoPs globally. When you deploy a new version of your website, how do you get all PoPs to serve the new content?

Strategy 1 — Content-addressed URLs (best practice): embed a file hash in the filename: app-3f4a9b.js. When the file changes, the hash changes, the URL changes, and the new URL is a cache MISS everywhere → guaranteed fresh content. The old URL expires naturally via TTL. This is what all modern build tools (Vite, webpack) do with code-splitting and asset fingerprinting.

Strategy 2 — CDN Cache Purge API: explicitly send API calls to the CDN to invalidate specific URLs or paths. Cloudflare, Fastly, and AWS CloudFront all provide purge APIs. Fast (seconds) but requires integrating purge calls into your deployment pipeline.

Strategy 3 — Short TTLs: set max-age=60 (1 minute). All caches expire quickly. Simple but means 60% more origin requests — caches don't provide much benefit at 1-minute TTLs.

Strategy 4 — Surrogate keys (cache tags): tag cached content with metadata. When a product is updated, purge all cached responses tagged with that product ID. Fastly and Varnish support this natively.`,
      callout: {
        kind: "tip",
        text: "The correct production setup: use content-addressed URLs with long TTLs (max-age=31536000, 1 year) for versioned assets (JS, CSS, images). Use short TTLs or CDN purge for your HTML files, which reference the new asset URLs. HTML is small and cheap to re-fetch; assets are large and benefit most from long-term caching.",
      },
    },
    {
      heading: "Push vs Pull CDN",
      table: {
        cols: ["Property", "Pull CDN", "Push CDN"],
        rows: [
          ["How it works",   "CDN fetches content from origin on first cache miss. Content pulled on demand.", "You upload content to CDN storage directly. CDN serves from its storage, never fetching from origin."],
          ["Setup",          "Just point CDN at your origin URL. No pre-upload step.",                         "Must upload all content to CDN before users request it. More complex deployment."],
          ["Best for",       "Any content with unpredictable access patterns; most web apps.",                 "Large files with predictable access: software downloads, game updates, firmware images, video files."],
          ["Storage cost",   "CDN only stores what's been requested at least once. Efficient.",                "You pay for all stored content upfront, even if never accessed."],
          ["Freshness",      "Easy — set TTL on origin response. Stale content auto-evicted.",                 "Manual — you must re-upload when content changes. Risk of serving stale content."],
          ["Examples",       "CloudFront (default mode), Cloudflare, Fastly",                                  "AWS CloudFront with S3 origin, Akamai NetStorage, BunnyCDN"],
        ],
      },
    },
    {
      heading: "CDN for Dynamic Content",
      body: `CDNs aren't just for static files. Modern CDNs can accelerate dynamic content and run code at the edge.

Edge caching for dynamic content: even a 10-second cache of an API response can dramatically reduce origin load for popular endpoints. GET /api/trending/posts → cache for 30 seconds. Each PoP serves thousands of requests from cache; origin gets 1 request per PoP per 30 seconds.

Edge functions / workers: run JavaScript or WebAssembly at the PoP, close to the user. Used for: A/B testing (modify HTML at the edge), personalisation (insert user-specific content), authentication (validate JWT at the edge before proxying), geo-redirects, and bot detection. Examples: Cloudflare Workers, Vercel Edge Functions, Fastly Compute.

Request coalescing (request collapsing): if 1,000 users simultaneously request the same cache-expired URL, the CDN collapses those into a single upstream request. Only one request hits your origin; 999 users wait for that response and receive it simultaneously. Prevents cache stampede against your origin.`,
    },
    {
      heading: "CDN Providers",
      table: {
        cols: ["Provider", "Known for", "Differentiator"],
        rows: [
          ["Cloudflare",     "Security + performance",    "DDoS protection, DNS, edge workers (Cloudflare Workers), free tier, Argo routing"],
          ["Fastly",         "Programmable CDN",          "Varnish-based, instant purge (150ms), Compute@Edge (Wasm), best-in-class cache tags"],
          ["AWS CloudFront", "AWS integration",           "Native S3, ALB, API Gateway origins; Lambda@Edge; tightest AWS IAM integration"],
          ["Akamai",         "Enterprise, media",         "Largest PoP count (4,000+ globally); advanced media delivery; DDoS scrubbing"],
          ["Vercel Edge",    "Frontend frameworks",       "Seamless Next.js/React deployment; edge functions; automatic static optimisation"],
          ["BunnyCDN",       "Price performance",         "Very low cost; pull + push zones; good for storage-heavy workloads"],
        ],
      },
    },
  ],
};
