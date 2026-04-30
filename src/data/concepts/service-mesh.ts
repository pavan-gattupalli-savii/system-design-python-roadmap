import type { Concept } from "./index";

export const serviceMesh: Concept = {
  slug:     "service-mesh",
  title:    "Service Mesh",
  emoji:    "🕸️",
  category: "Architecture",
  tagline:  "Infrastructure-level control over service-to-service communication",
  roadmapKeywords: ["service mesh", "istio", "linkerd", "envoy", "sidecar", "mtls", "control plane", "data plane", "traffic management"],
  related:  ["microservices", "proxies", "observability", "load-balancing", "circuit-breaker"],

  sections: [
    {
      heading: "Why a Service Mesh?",
      body: `In a microservices architecture with 50+ services, each service needs to handle: mutual TLS (mTLS) between services, retries with exponential backoff, circuit breaking, distributed tracing (inject/propagate trace headers), load balancing across instances, canary deployments (route 5% of traffic to v2), rate limiting, access control (Service A may call Service B, but Service C may not).

Without a service mesh, every service implements these features in its own code. You have the same retry logic in 50 different services in 3 different languages. Updating the retry policy requires deploying 50 services. Enforcing mTLS requires every team to implement TLS correctly.

A service mesh moves these concerns to the infrastructure layer: a sidecar proxy (Envoy) deployed alongside every service instance handles all network concerns transparently. The service speaks plain HTTP/gRPC to localhost; Envoy intercepts, enforces policies, and handles the network.`,
      diagram: "service-mesh-flow",
    },
    {
      heading: "The Sidecar Pattern",
      body: `In Kubernetes, a sidecar is an additional container in the same Pod as your application container. The service mesh injects the Envoy sidecar automatically (via a MutatingAdmissionWebhook) — your Kubernetes manifests don't need to mention it.

The sidecar proxy intercepts all inbound and outbound traffic using iptables rules (init container sets up the rules before your app starts). Your app binds to port 8080; Envoy intercepts traffic on that port, applies policies, and forwards to your app on port 8081 (or vice versa for outbound).

From your application's perspective: you make an HTTP request to another service's hostname and get a response. Envoy handles TLS, retries, circuit breaking, load balancing, and trace header injection — invisibly.

The sidecar proxy receives its configuration from the control plane. When you update a routing rule or circuit breaker policy via the control plane API, the control plane pushes the new config to all Envoy sidecars over a long-lived gRPC connection (xDS protocol: Listener Discovery Service, Route Discovery Service, Cluster Discovery Service, Endpoint Discovery Service).`,
    },
    {
      heading: "Control Plane vs Data Plane",
      body: `Data plane: all the Envoy sidecar proxies running in your cluster. They handle the actual network traffic — load balancing, TLS, retries. The data plane is in the hot path of every request.

Control plane: the management layer that configures and manages the data plane. You interact with the control plane (via YAML resources or API); it translates your policies into Envoy configuration and distributes them to all sidecars. The control plane is NOT in the request path — only in the configuration path.

Istio control plane components:
- istiod: the unified control plane daemon. Combines the old Pilot (service discovery, routing), Citadel (certificate management, mTLS), and Galley (configuration validation).
- istiod connects to the Kubernetes API server to watch Service, Pod, and Istio CRD resources. It translates these into Envoy xDS configuration and pushes updates to sidecars.

Linkerd control plane components:
- linkerd-controller: implements the Destination API (service discovery, routing rules)
- linkerd-identity: manages mTLS certificate issuance (acts as a CA)
- linkerd-proxy-injector: webhook that injects the linkerd-proxy sidecar

Key difference: Linkerd uses a custom lightweight Rust proxy (linkerd-proxy) instead of Envoy. Smaller memory footprint, simpler configuration, but fewer features than Envoy/Istio.`,
    },
    {
      heading: "Features of a Service Mesh",
      bullets: [
        "Mutual TLS (mTLS): every service-to-service connection is encrypted and both sides authenticate. The service mesh acts as a CA, issuing short-lived certificates to each sidecar. Zero-trust networking — even inside the cluster, traffic is encrypted and authenticated. Certificates rotate automatically.",
        "Traffic management: fine-grained routing rules. Route 95% of traffic to v1, 5% to v2 (canary). Route traffic based on headers (A/B testing by user segment). Shift 100% to v2 once validated (blue-green rollout).",
        "Retries and timeouts: configure retry policies (3 retries with exponential backoff for 503 errors) centrally without touching application code. Per-route timeout configuration.",
        "Circuit breaking: automatically open the circuit for a service returning too many 5xx errors, preventing cascading failures. Configured centrally, enforced by each sidecar.",
        "Distributed tracing: Envoy injects B3/W3C trace headers on every request. Export spans to Jaeger, Zipkin, or Tempo. Full call graph across all services, automatically.",
        "Observability: every sidecar emits Prometheus metrics (request rate, error rate, latency percentiles, connection counts) per (source service, destination service, route). No instrumentation needed in application code.",
        "Authorization policies: Istio's AuthorizationPolicy allows you to declare 'Service A can call GET /api/orders on Service B, but Service C cannot.' Enforced by the sidecar — your application doesn't need to implement authz.",
      ],
    },
    {
      heading: "Istio vs Linkerd vs Consul Connect",
      table: {
        cols: ["Property", "Istio", "Linkerd", "Consul Connect"],
        rows: [
          ["Proxy",          "Envoy (C++)",                  "linkerd-proxy (Rust)",      "Envoy or built-in proxy"],
          ["Complexity",     "High — many features, steep learning curve", "Low — opinionated, simpler CRDs", "Medium"],
          ["Performance",    "Higher latency/memory vs Linkerd", "Lowest overhead in benchmarks", "Medium"],
          ["Features",       "Most complete — traffic mgmt, Wasm extensions", "Good baseline — mTLS, observability, retries", "Good Vault/Consul integration"],
          ["Best for",       "Complex traffic management, advanced auth",  "Simplicity, Kubernetes-native, low overhead", "Multi-cloud, existing Consul/HashiCorp stack"],
          ["Platform",       "Kubernetes",                   "Kubernetes",                "Kubernetes, VMs, bare metal"],
        ],
      },
    },
    {
      heading: "When NOT to Use a Service Mesh",
      bullets: [
        "Small teams and few services: if you have 5-10 services and a small team, the operational complexity of running a service mesh (Istio adds ~10 CRD types, 3 control plane pods, requires expertise to debug) exceeds the benefit. Implement mTLS and tracing directly in your services.",
        "Non-Kubernetes deployments: service meshes are designed for Kubernetes. Running them on VMs or bare metal is possible but much more complex.",
        "Performance-critical paths: every request incurs an extra local network hop through the sidecar proxy (~1ms). For latency-critical services where 1ms matters, this overhead may be unacceptable.",
        "Simple architectures: monoliths, 2-3 service architectures, or serverless functions don't benefit enough to justify the complexity.",
        "Recommendation: adopt a service mesh when you have 10+ services in Kubernetes, multiple teams, and are struggling with cross-cutting concerns (mTLS enforcement, consistent observability, traffic management for canary releases).",
      ],
    },
  ],
};
