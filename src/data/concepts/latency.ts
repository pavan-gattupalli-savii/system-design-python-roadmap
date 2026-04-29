import type { Concept } from "./index";

export const latency: Concept = {
  slug:     "latency",
  title:    "Latency",
  emoji:    "⚡",
  category: "Networking",
  tagline:  "The time your system spends waiting, not working",
  roadmapKeywords: ["latency", "network", "performance", "throughput", "cdn", "cache"],
  related:  ["lld-symbols"],

  sections: [
    {
      heading: "What is Latency?",
      body: `Latency is the time that elapses between a cause and its effect — in systems, it is the delay between when a request is made and when the response begins to arrive. It is measured in milliseconds (ms), microseconds (µs), or even nanoseconds (ns) depending on the operation.

The key word is "begins to arrive." Latency is about delay, not volume. A fire hose has high throughput but can still have high latency if it takes 2 seconds before any water comes out.`,
      callout: {
        kind: "note",
        text: "Latency ≠ Bandwidth. Bandwidth is how much data can flow per second. Latency is how long the first byte takes to arrive. A satellite link can have high bandwidth but very high latency (~600 ms round trip).",
      },
    },

    {
      heading: "Real-World Analogy",
      body: `Think of ordering a pizza. You pick up the phone, dial, the restaurant answers, you place the order, they confirm, they cook it, and the delivery driver brings it to your door.

The moment you hang up after placing the order is when your "request" was sent. The moment the pizza arrives at your door is when the "response" is received. That entire duration — including the cooking time, packing, and driving — is the latency of your pizza order.

Meanwhile, the "bandwidth" of the delivery system is how many pizzas they can deliver per hour. The restaurant can have 10 drivers (high bandwidth) and still make you wait 45 minutes (high latency).`,
    },

    {
      heading: "Request Journey — Where Latency Hides",
      body: `Every HTTP request you send travels through multiple layers, each adding latency. Understanding where the time goes is the first step to reducing it.`,
      diagram: "latency-timeline",
      bullets: [
        "DNS lookup: resolving the hostname to an IP address (can be 0 ms if cached, up to 100 ms if not)",
        "TCP handshake: 3-way SYN → SYN-ACK → ACK exchange before any data flows",
        "TLS handshake: 1–2 extra round trips to negotiate encryption (TLS 1.3 reduces this to 1-RTT)",
        "Server processing: your actual business logic, DB queries, cache hits/misses",
        "Data transfer: the time to transmit the response payload over the wire",
        "Last-mile: the final hop from the ISP to the user's device — often the most unpredictable",
      ],
    },

    {
      heading: "Latency Numbers Every Engineer Should Know",
      body: `These are rough order-of-magnitude numbers popularised by Peter Norvig and Jeff Dean. They are approximate but incredibly useful for back-of-the-envelope reasoning about system design.`,
      diagram: "latency-table",
      callout: {
        kind: "tip",
        text: "The 10× rule of thumb: each layer up the stack adds roughly an order of magnitude in latency. L1 cache (1 ns) → L2 (10 ns) → RAM (100 ns) → SSD (100 µs) → HDD (10 ms) → Network (100 ms).",
      },
    },

    {
      heading: "Latency vs Throughput — The Classic Trade-off",
      body: `Latency and throughput are related but not the same thing, and optimising for one can hurt the other.

Batching is the classic example: sending 1,000 records as a single database INSERT is more throughput-efficient than 1,000 separate inserts, but the last record in the batch has to wait for all the others — higher latency for that individual record.

In system design interviews, always clarify which metric the problem cares about more. A real-time chat app needs low latency. A bulk data-export pipeline cares about throughput.`,
      table: {
        cols: ["Metric", "Definition", "Optimised by"],
        rows: [
          ["Latency",    "Time for one request to complete",     "Caching, CDN, connection pooling, fewer round trips"],
          ["Throughput", "Requests (or bytes) handled per second","Parallelism, batching, horizontal scaling"],
          ["Bandwidth",  "Maximum data transfer capacity",       "Better network hardware, compression"],
          ["P99 Latency","The 99th-percentile response time",    "Eliminating tail latencies, retry budgets"],
        ],
      },
    },

    {
      heading: "P50, P95, P99 — Why Averages Lie",
      body: `An average latency of 50 ms can hide enormous pain. If 1% of your requests take 5 seconds, your users notice — even though the average looks fine.

Percentile latencies (p50, p95, p99, p999) tell a much better story:
- p50 (median): half of requests are faster than this
- p95: 95% of requests are faster than this — only 1 in 20 is slower
- p99: 99% of requests are faster — only 1 in 100 is slower
- p999: the "tail" — 1 in 1,000 requests that can be catastrophically slow

In distributed systems, tail latency compounds. If a request fans out to 100 microservices, and each has 1% chance of a 5s tail, the probability of hitting at least one tail is almost certain. This is why teams obsess over p99 and p999.`,
      callout: {
        kind: "warning",
        text: "Never report only average latency in a design review. Always show p50/p95/p99. Averages hide the worst-case experience your slowest users are having.",
      },
    },

    {
      heading: "How to Reduce Latency",
      bullets: [
        "Cache aggressively — serve from memory instead of disk or network (Redis, in-process LRU cache)",
        "Move data closer to users — CDN edge nodes serve static assets from the nearest PoP",
        "Reduce round trips — HTTP/2 multiplexing, GraphQL batching, persistent connections",
        "Use faster storage — NVMe SSDs vs spinning HDDs, or in-memory DBs for hot paths",
        "Avoid synchronous calls in serial — fan out parallel requests with Promise.all or async workers",
        "TCP keep-alive + connection pooling — avoid paying the TCP handshake cost on every request",
        "TLS 1.3 + QUIC — fewer handshake round trips; QUIC runs over UDP to avoid TCP head-of-line blocking",
        "Pre-compute and pre-warm — do expensive work ahead of time (search index, recommendation model)",
      ],
    },
  ],
};
