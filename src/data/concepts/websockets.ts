import type { Concept } from "./index";

export const websockets: Concept = {
  slug:     "websockets",
  title:    "WebSockets & Real-time",
  emoji:    "🔌",
  category: "Networking",
  tagline:  "Full-duplex communication without the HTTP overhead",
  roadmapKeywords: ["websocket", "real-time", "long polling", "server-sent events", "sse", "socket.io", "push", "pub-sub"],
  related:  ["api-design", "load-balancing", "message-queues", "cdn"],

  sections: [
    {
      heading: "Why Standard HTTP Falls Short for Real-time",
      body: `HTTP was designed for a request-response model: the client asks, the server answers. For real-time use cases (live chat, collaborative editing, stock tickers, multiplayer games, live notifications), you need the server to push updates to clients as events happen — not when the client asks.

Three solutions evolved, each with different trade-offs:

1. Short Polling: client sends a new HTTP request every N seconds: "anything new?" Server responds immediately (yes or no). Simple, but wasteful — 99% of requests get "nothing new" responses, burning bandwidth and server capacity.

2. Long Polling: client sends a request, server holds it open until there's data (or a timeout, e.g., 30 seconds). When data arrives, server responds, client immediately opens a new long-poll. Reduces wasted requests but still per-message HTTP overhead (headers, connection setup).

3. Server-Sent Events (SSE): server sends a stream of events over a persistent HTTP/1.1 connection. Client subscribes via EventSource API. One-way (server → client only). Simple, works over HTTP (firewall friendly), automatic reconnect. Good for dashboards, live feeds.

4. WebSockets: a persistent, full-duplex TCP connection between client and server. After an HTTP upgrade handshake, both sides can send messages at any time without opening new connections. The gold standard for bidirectional real-time communication.`,
      diagram: "ws-vs-polling",
    },
    {
      heading: "WebSocket Protocol Internals",
      body: `WebSockets start with an HTTP upgrade handshake. The client sends:

GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

The server responds with 101 Switching Protocols, and the HTTP connection becomes a WebSocket connection — a raw TCP stream with WebSocket framing.

WebSocket frames: data is sent in frames. A frame has: a 2-14 byte header (opcode, mask bit, payload length) and the payload. Frame types include text (UTF-8), binary, ping/pong (keep-alive), and close.

Masking: browser-to-server frames MUST be masked (XOR with a 4-byte random key). This prevents cache poisoning attacks against intermediaries. Server-to-client frames are unmasked.

Ping/Pong: WebSocket has built-in keep-alive. The server periodically sends ping frames; the client responds with pong. If no pong within a timeout, the connection is dead. This is more reliable than TCP keep-alive for connections passing through NATs and proxies.

Subprotocols: applications can negotiate application-level protocols via the Sec-WebSocket-Protocol header. Common ones: "chat", "v1.finance.api", or custom JSON/MessagePack protocols.`,
    },
    {
      heading: "Choosing the Right Real-time Pattern",
      table: {
        cols: ["Technique", "Direction", "Connection", "Overhead per message", "Best for", "Browser support"],
        rows: [
          ["Short Polling",   "Client → Server",  "New HTTP each time",     "Full HTTP headers + TCP",        "Infrequent updates, simple implementation",           "Universal"],
          ["Long Polling",    "Server → Client",  "New HTTP after response", "Full HTTP headers + TCP",       "Low-volume push to clients behind strict firewalls",  "Universal"],
          ["SSE",             "Server → Client",  "Single persistent HTTP", "~dozens of bytes",               "Live feeds, dashboards, notifications (one-way only)", "All except IE11"],
          ["WebSockets",      "Bidirectional",    "Single persistent TCP",  "~6 bytes (framing overhead)",   "Chat, gaming, collaboration, trading — any bidirectional real-time", "All modern browsers"],
          ["WebTransport",    "Bidirectional",    "QUIC (UDP)",             "Near-zero overhead",             "Next-gen real-time: lower latency than WS over QUIC", "Chrome/Edge only (2025)"],
        ],
      },
    },
    {
      heading: "Scaling WebSockets",
      body: `HTTP is stateless — any server can handle any request. WebSockets are stateful — a client's connection is tied to a specific server process. Scaling becomes harder.

Challenge: with 100 servers, User A is connected to Server 1, User B is connected to Server 2. When User A sends a message to User B, Server 1 needs to deliver it to Server 2 so it can push to User B's connection.

Solution 1 — Pub/Sub backplane: each server subscribes to a shared message broker (Redis Pub/Sub, Kafka). When Server 1 receives a message from User A, it publishes to the broker. All servers receive the message and check if the target user is connected to them. Redis Pub/Sub has sub-millisecond fanout. Socket.IO uses this pattern natively with the Redis adapter.

Solution 2 — Sticky sessions: route all requests from a given user to the same server (by IP or session cookie). Simpler architecture but limits horizontal scaling — if that server is overloaded, you can't redistribute load easily.

Solution 3 — Dedicated WebSocket gateway: separate the WebSocket connection management from application logic. A gateway layer (Ably, Pusher, AWS API Gateway WebSockets) maintains all connections and routes messages. Application servers are stateless and communicate with the gateway via webhooks or internal APIs.

Connection limits: a WebSocket connection is a file descriptor. Linux defaults to 1024 FDs per process; raise via ulimit. With tuning, a single server can sustain 100K-1M concurrent WebSocket connections. Cloudflare's Durable Objects handle billions of persistent connections globally.`,
      callout: {
        kind: "tip",
        text: "In system design interviews, mention the pub/sub backplane pattern for WebSocket scaling — it's the pattern that all major real-time systems (Slack, Discord, Figma) use. Then mention connection draining during deployments: before restarting a server, stop accepting new connections and wait for existing ones to migrate (clients reconnect after detecting disconnect).",
      },
    },
    {
      heading: "Production Considerations",
      bullets: [
        "Always implement client-side reconnection with exponential backoff. Network blips happen. The client should attempt reconnect at 1s, 2s, 4s, 8s, 16s, then cap at 60s with jitter.",
        "Set a server-side connection timeout. Idle WebSocket connections that don't ping back within 60-120 seconds should be closed — they're likely zombie connections from disconnected clients.",
        "Use message queuing at the client level. If the connection drops, buffer outgoing messages locally and flush them after reconnect. Never lose user actions.",
        "Authenticate at connection time. Validate JWT or session token in the HTTP upgrade request, not per-message. Store the user identity on the connection object.",
        "Rate-limit messages per connection. A client sending 10,000 messages/second to a WebSocket endpoint is either broken or adversarial. Apply per-connection rate limiting at the gateway.",
        "Use binary frames (MessagePack, Protocol Buffers) for high-throughput scenarios instead of JSON. Binary serialization is 40-60% more compact and faster to parse.",
      ],
    },
  ],
};
