import type { Concept } from "./index";

export const loadBalancing: Concept = {
  slug:     "load-balancing",
  title:    "Load Balancing",
  emoji:    "⚖️",
  category: "Architecture",
  tagline:  "Spreading work so no single server drowns",
  roadmapKeywords: ["load balancer", "load balancing", "nginx", "round robin", "sticky session", "haproxy", "l4", "l7"],
  related:  ["caching", "microservices", "consistent-hashing"],

  sections: [
    {
      heading: "Why Load Balancers Exist",
      body: `A single server can only handle so many requests before it becomes the bottleneck. When traffic spikes — a product goes viral, a cron job triggers, a major news event drives traffic — you need to scale horizontally by adding more servers. But adding servers alone isn't enough: you need something to distribute requests across them.

A load balancer (LB) is a reverse proxy that sits between clients and your server pool. It accepts incoming connections and routes each request to one of the backend servers according to a distribution algorithm. The client doesn't know — or care — which backend handled its request.

Beyond traffic distribution, load balancers provide: health checking (removing failed servers automatically), SSL/TLS termination (decrypting HTTPS so backend servers don't need to), connection draining (gracefully removing servers during deployments), and request logging / metrics aggregation.`,
      diagram: "lb-flow",
    },
    {
      heading: "L4 vs L7 Load Balancing",
      body: `Load balancers operate at different layers of the OSI model. The layer determines what information the LB can use to make routing decisions.`,
      table: {
        cols: ["Property", "L4 (Transport Layer)", "L7 (Application Layer)"],
        rows: [
          ["What it sees",     "IP address, TCP/UDP port, packet headers", "HTTP headers, URL path, cookies, request body, TLS SNI"],
          ["Routing basis",    "IP + port only",                            "Any HTTP attribute: path, host, cookie, header"],
          ["SSL termination",  "Pass-through only (no decryption)",         "Full SSL termination — decrypts, inspects, re-encrypts"],
          ["Performance",      "Faster — minimal parsing",                  "Slower — must parse HTTP fully"],
          ["Content routing",  "Cannot route /api vs /static differently",  "Can route /api → API servers, /static → CDN or asset servers"],
          ["Protocol support", "Any TCP/UDP protocol",                      "HTTP/1.1, HTTP/2, HTTP/3, WebSocket, gRPC"],
          ["Examples",         "AWS NLB, HAProxy TCP mode",                 "AWS ALB, Nginx, HAProxy HTTP mode, Envoy, Traefik"],
          ["Use when",         "Low latency needed; non-HTTP protocols; raw throughput", "HTTP microservices; content-based routing; SSL termination"],
        ],
      },
    },
    {
      heading: "Load Balancing Algorithms",
      body: `The algorithm determines which backend server receives each incoming request. Different workloads benefit from different strategies.`,
      table: {
        cols: ["Algorithm", "How it works", "Best for", "Weakness"],
        rows: [
          ["Round Robin",          "Requests distributed in sequence: server 1, 2, 3, 1, 2, 3…", "Homogeneous servers, uniform request cost", "Ignores server load — a slow request keeps the server busy while more arrive"],
          ["Weighted Round Robin", "Same as round robin but servers with higher weight receive more requests proportionally", "Heterogeneous servers (different CPU/RAM)", "Still ignores real-time load — weights are static"],
          ["Least Connections",    "Send to server with fewest active connections currently", "Long-lived connections, mixed request durations", "Doesn't account for connection weight (a heavy query ≠ a lightweight query)"],
          ["Least Response Time",  "Send to server with lowest combination of active connections and response latency", "Latency-sensitive applications", "Requires real-time latency tracking; more complex"],
          ["IP Hash",              "Hash client IP → always route to same server", "Session affinity without cookies, stateful protocols", "Hot spots if traffic from one IP subnet dominates; breaks when server pool changes"],
          ["Random",               "Pick a server at random", "Simplicity; works well at scale (law of large numbers)", "Poor for small server counts or skewed request costs"],
          ["Resource-based (Adaptive)", "Route to server with most available CPU/RAM, reported via health check API", "CPU/memory-intensive workloads, video encoding, ML inference", "Requires servers to expose resource metrics; more complex"],
        ],
      },
      callout: {
        kind: "tip",
        text: "Least Connections is the safe default for most HTTP APIs. Round Robin works fine when your requests have uniform cost and your servers are identical. Use IP Hash only when you need session stickiness and can't use cookies.",
      },
    },
    {
      heading: "Health Checks",
      body: `A load balancer continuously probes backend servers to detect failures. When a server fails health checks, the LB stops routing traffic to it and redistributes to healthy servers.

Active health checks: the LB periodically sends its own probe requests to each backend (e.g., HTTP GET /health every 5 seconds). If the server responds with 2xx, it's healthy. If it times out or returns 5xx, the LB marks it unhealthy and removes it from rotation.

Passive health checks: the LB observes real traffic. If a server returns errors (5xx) or times out above a threshold, it's removed. Less aggressive than active checks but doesn't require a dedicated /health endpoint.

Health check configuration knobs: interval (how often to probe), timeout (how long to wait), unhealthy threshold (how many consecutive failures before removal), healthy threshold (how many successes before re-adding).`,
      callout: {
        kind: "note",
        text: "/health should be a lightweight endpoint that checks only what's needed to serve traffic: DB connection alive, critical caches warm. Don't check external dependencies — if a 3rd-party API is down, your server can still serve many routes just fine.",
      },
    },
    {
      heading: "Sticky Sessions (Session Affinity)",
      body: `By default, the load balancer can send consecutive requests from the same user to different servers. For stateless APIs this is fine — but stateful applications that store session data in server memory break if requests are spread across servers.

Sticky sessions solve this by binding a user to a specific server for the duration of their session, usually via a cookie or IP hash.

The problem with sticky sessions: they reintroduce the uneven load problem. If one server's users are unusually active, that server gets more load than others. When a sticky server goes down, all its sessions are lost anyway. And they make rolling deployments harder — draining a server means waiting for all sticky sessions to expire.

The correct long-term fix: make your servers stateless. Move session storage into a shared store (Redis, database) that all servers can access. Then any server can handle any request. This is the right architecture.`,
      callout: {
        kind: "warning",
        text: "Sticky sessions are a band-aid. They work, but they defeat the horizontal scaling benefits of a load balancer. Architectural goal: stateless servers + shared session store.",
      },
    },
    {
      heading: "Global Load Balancing (DNS-Based)",
      body: `Beyond distributing traffic across servers in one data centre, global load balancing distributes traffic across multiple data centres or cloud regions.

DNS-based global LB: return different IP addresses for the same domain based on the requester's geographic location. A user in Tokyo gets routed to the Tokyo data centre; a user in London gets the Frankfurt IP. Tools: AWS Route 53 (latency/geolocation routing), Cloudflare, Google Cloud DNS.

Anycast: a single IP address is announced from multiple locations simultaneously. The internet routes traffic to the nearest node automatically via BGP. Used by Cloudflare, Google's 8.8.8.8 DNS, CDNs.

Trade-offs: DNS-based LB relies on TTL for failover — during a data centre outage, users with the old IP cached keep hitting the dead DC until TTL expires. Using a very low TTL (30s) mitigates this but increases DNS query volume.`,
    },
  ],
};
