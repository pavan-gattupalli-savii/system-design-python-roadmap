import type { Concept } from "./index";

export const proxies: Concept = {
  slug:     "proxies",
  title:    "Proxies",
  emoji:    "🔀",
  category: "Networking",
  tagline:  "Intermediaries that sit between clients and servers — for security, caching, and control",
  roadmapKeywords: ["proxy", "reverse proxy", "forward proxy", "nginx", "api gateway", "vpn", "ssl termination", "sidecar"],
  related:  ["load-balancing", "cdn", "api-design", "service-mesh"],

  sections: [
    {
      heading: "What is a Proxy?",
      body: `A proxy is any intermediary that sits between a client and a server, forwarding requests and responses. Proxies add a layer of control: they can inspect, transform, block, cache, log, or route traffic.

Two fundamental types — forward proxy and reverse proxy — differ in whose side they represent.`,
      diagram: "proxy-flow",
    },
    {
      heading: "Forward Proxy — The Client's Representative",
      body: `A forward proxy sits in front of clients and speaks to the internet on their behalf. The origin server sees the proxy's IP, not the client's.

How it works: Client → Forward Proxy → Internet (server). The proxy forwards requests and returns responses. From the server's view, the request came from the proxy.

Use cases:
1. Corporate security / filtering: all employee traffic routes through a company proxy. The proxy blocks social media, malware domains, and enforces DLP (Data Loss Prevention) by scanning outbound content.
2. Privacy / anonymity: hide the client's real IP from websites. VPNs work on this principle (though VPN is a tunnel, not just a proxy).
3. Caching: the proxy caches responses. All employees fetching the same Windows update get it from the proxy's cache rather than hammering Microsoft's CDN.
4. Bypassing geo-restrictions: appear to be in another country by using a proxy located there.
5. Access control: schools and governments use forward proxies to restrict which websites can be accessed.

Examples: Squid (popular open-source forward proxy), corporate VPNs, browser proxy settings.`,
    },
    {
      heading: "Reverse Proxy — The Server's Representative",
      body: `A reverse proxy sits in front of servers and receives requests from the internet. Clients don't know which backend server they're actually talking to.

How it works: Client → Internet → Reverse Proxy → Backend Server. The proxy receives the request and decides which server should handle it. From the client's view, the reverse proxy IS the server.

Use cases:
1. Load balancing: distribute requests across multiple backend servers — the core use case of Nginx and HAProxy.
2. SSL/TLS termination: handle the expensive TLS handshake at the proxy. Backend servers communicate over plain HTTP internally, reducing CPU load.
3. Caching: cache responses for static assets or API responses. Varnish and Nginx can serve cached responses in microseconds, protecting backends.
4. Compression: compress responses (gzip, Brotli) at the proxy layer before sending to clients. Backends emit uncompressed responses (faster to generate).
5. Security: hide backend IP addresses. DDoS protection at the proxy layer (Cloudflare, AWS Shield). WAF (Web Application Firewall) to block SQLi, XSS.
6. Request routing: route /api/* to API servers, /static/* to file servers, /ws/* to WebSocket servers — all on the same public domain.
7. Rate limiting: enforce global rate limits at the proxy before traffic reaches services.

Examples: Nginx, HAProxy, Traefik, Envoy, Caddy, AWS CloudFront (also a CDN), Cloudflare.`,
    },
    {
      heading: "Forward vs Reverse Proxy",
      table: {
        cols: ["Property", "Forward Proxy", "Reverse Proxy"],
        rows: [
          ["Whose side",         "Client's — acts for the client",          "Server's — acts for the server"],
          ["Client configuration", "Clients must be configured to use it",  "Transparent to clients — they don't know it exists"],
          ["Server sees",        "Proxy's IP, not the real client",         "Client's IP (or X-Forwarded-For header)"],
          ["Client sees",        "No difference (proxy is transparent outbound)", "Proxy as the server — never sees backend IPs"],
          ["Primary uses",       "Privacy, filtering, corporate access control, caching", "Load balancing, SSL termination, caching, security"],
          ["Example products",   "Squid, corporate VPN, SOCKS5 proxy",      "Nginx, HAProxy, Traefik, Envoy, Cloudflare"],
        ],
      },
    },
    {
      heading: "Sidecar Proxy (Service Mesh)",
      body: `In microservices architectures, a sidecar proxy is a proxy deployed alongside each service instance — in the same Pod in Kubernetes. Instead of every service implementing retries, circuit breaking, TLS, and distributed tracing, the sidecar handles all of this transparently.

Envoy is the most widely used sidecar proxy. Istio and Linkerd are service mesh control planes that manage Envoy sidecars across thousands of service instances.

Traffic flow: Client Service → Envoy Sidecar → (mTLS) → Envoy Sidecar → Server Service. Neither service knows the other is using a proxy. Envoy is injected automatically by the service mesh.

What sidecar proxies handle: automatic mTLS encryption between all services (zero-trust networking), distributed tracing (Envoy injects trace headers), circuit breaking, retries with backoff, load balancing, traffic shaping (canary deployments by routing 5% of traffic to v2), access control policies.

Trade-offs: sidecar proxies add latency (~1ms per hop), memory overhead (~50MB per Envoy instance), and significant operational complexity. Worth it at large scale (100+ services); usually overkill for small deployments.`,
    },
    {
      heading: "API Gateway vs Reverse Proxy vs Load Balancer",
      table: {
        cols: ["Component", "Layer", "Key responsibilities", "Examples"],
        rows: [
          ["Load Balancer",    "L4 (TCP) or L7 (HTTP)", "Distribute traffic across server pool; health checks; failover",          "AWS NLB, HAProxy, F5"],
          ["Reverse Proxy",    "L7 (HTTP)",              "SSL termination, caching, compression, routing, basic auth",             "Nginx, Caddy, Traefik"],
          ["API Gateway",      "L7 (HTTP)",              "Auth/authz, rate limiting, request transformation, versioning, analytics", "AWS API Gateway, Kong, Apigee"],
          ["Service Mesh",     "L7 (HTTP/gRPC)",         "mTLS, observability, retries, circuit breaking — between services",       "Istio, Linkerd, Consul Connect"],
        ],
      },
      callout: {
        kind: "note",
        text: "In practice, these components overlap. Cloudflare is simultaneously a DNS provider, CDN, DDoS scrubber, WAF, forward proxy, and reverse proxy. Nginx can act as a reverse proxy, load balancer, and API gateway simultaneously. Choose based on what features you need, not strict categories.",
      },
    },
  ],
};
