import type { Concept } from "./index";

export const microservices: Concept = {
  slug:     "microservices",
  title:    "Microservices",
  emoji:    "🧩",
  category: "Architecture",
  tagline:  "Breaking monoliths into independent, deployable pieces",
  roadmapKeywords: ["microservices", "monolith", "service mesh", "api gateway", "docker", "kubernetes", "service discovery"],
  related:  ["api-design", "message-queues", "load-balancing", "rate-limiting"],

  sections: [
    {
      heading: "Monolith vs Microservices",
      body: `A monolithic application has all functionality — user management, orders, payments, inventory, notifications — in a single deployable unit. One codebase, one database, one deployment.

Monoliths are not bad. They're simpler to develop, test, deploy, and debug. For most small and medium products, a well-structured monolith is the right choice. Amazon, Netflix, and Uber all started as monoliths.

Microservices split the monolith into a collection of small, independently deployable services, each owning a specific business domain. Each service:
- Runs as a separate process
- Has its own database (no shared databases)
- Communicates via network calls (HTTP/gRPC/message queues)
- Can be deployed, scaled, and failed independently

The trade-off in one sentence: microservices trade deployment independence and scalability for network complexity, distributed systems challenges, and operational overhead.`,
      diagram: "microservices-flow",
    },
    {
      heading: "When to Choose Microservices",
      body: `Don't start with microservices. The distributed systems complexity they introduce is a significant ongoing tax — every engineer must understand network failures, timeouts, distributed tracing, and eventual consistency.

Consider microservices when:
1. Different parts of your system have wildly different scaling requirements (e.g., image processing needs 100x more CPU than user authentication — it makes sense to scale them independently).
2. Different teams own different domains and need independent deployment cadences — a team shouldn't need to coordinate with 5 other teams to deploy their service.
3. You need to use different technology stacks for different services (ML model serving in Python, user API in Go, legacy integration in Java).
4. Your monolith has become so large that builds take 30+ minutes and a small change requires deploying and testing the entire application.
5. You have the operational maturity: container orchestration (Kubernetes), distributed tracing, service mesh, CI/CD pipelines, and on-call culture.

Signs you're NOT ready: if you can't deploy your monolith confidently and reliably, microservices will make things worse. Fix your deployment pipeline first.`,
      callout: {
        kind: "warning",
        text: "Microservices are the solution to an organisational problem as much as a technical one. If Conway's Law applies (systems mirror the communication structure of the organisations that build them), then one team building a microservices architecture produces a distributed monolith — tightly coupled services that must be deployed together. Team structure should align with service boundaries.",
      },
    },
    {
      heading: "API Gateway",
      body: `In a microservices architecture, clients should not call individual services directly. An API Gateway is the single entry point for all external clients.

Responsibilities of an API gateway:
1. Routing: proxy requests to the appropriate service based on path, method, headers.
2. Authentication & authorisation: validate JWTs, API keys, OAuth tokens before requests reach services. Services trust that requests arriving from the gateway are authenticated.
3. Rate limiting: centralised rate limiting per client before traffic reaches services.
4. SSL termination: decrypt HTTPS at the gateway; internal traffic can be plain HTTP.
5. Request transformation: translate between external API formats and internal service APIs. Add/remove headers, reshape request bodies.
6. Response aggregation (BFF pattern): combine responses from multiple services into a single client response, reducing round trips.
7. Load balancing: distribute traffic across service instances.
8. Observability: centralised logging, metrics, and distributed trace header injection.

Examples: AWS API Gateway, Kong, Envoy, Nginx, Traefik, Netflix Zuul.`,
    },
    {
      heading: "Service Communication Patterns",
      table: {
        cols: ["Pattern", "Protocol", "Style", "When to use", "Trade-off"],
        rows: [
          ["Synchronous HTTP/REST",  "HTTP/1.1 or HTTP/2 + JSON",    "Request-response",   "Standard CRUD operations, when caller needs an immediate response",          "Temporal coupling — caller blocks; service B failure directly affects service A"],
          ["Synchronous gRPC",       "HTTP/2 + Protocol Buffers",    "Request-response",   "High-throughput internal APIs, bidirectional streaming, polyglot services",   "Browser support requires grpc-web proxy; learning curve for .proto files"],
          ["Async messaging (queue)","Message broker (Kafka, SQS)",  "Fire-and-forget",    "Background jobs, notifications, events where caller doesn't need response now", "Eventual consistency; harder to debug; DLQ management required"],
          ["Event-driven (pub/sub)", "Message broker (Kafka, SNS)",  "Broadcast events",   "One service event needs to trigger many services simultaneously",              "Harder to trace event chains; ordering guarantees complex across topics"],
          ["Service mesh (sidecar)", "mTLS via Envoy/Istio",         "Transparent proxy",  "Zero-trust networking, circuit breaking, retries, distributed tracing at infra level", "Significant complexity; Istio learning curve; performance overhead of sidecar"],
        ],
      },
    },
    {
      heading: "Service Discovery",
      body: `In a microservices environment, services scale up and down dynamically. IP addresses of service instances change constantly. How does Service A know where to send requests to Service B?

Client-side service discovery: Service A queries a service registry (e.g., Consul, etcd, Eureka) to get the current list of Service B's IP addresses and load-balances across them itself. Gives the client full control; requires client-side load balancing logic.

Server-side service discovery: Service A sends requests to a load balancer or API gateway. The load balancer queries the service registry and routes to a healthy Service B instance. The client is unaware of the registry. Simpler clients; load balancer is the single point of control (and potential failure).

DNS-based service discovery: each service has a DNS name (e.g., payment-service.svc.cluster.local in Kubernetes). DNS returns the IP of a healthy pod. Kubernetes uses this model — kube-dns (CoreDNS) maintains records for every service. Changes in pod IPs are automatically reflected in DNS.

Kubernetes service discovery: Kubernetes Services are the primitive. A Service object provides a stable IP (ClusterIP) and DNS name. kube-proxy routes ClusterIP traffic to a healthy pod. Developers only need to know the service name.`,
    },
    {
      heading: "Data Isolation — Database per Service",
      body: `The most important rule in microservices: each service must own its data exclusively. No two services share a database. If two services share a database, they are not truly independent — a schema migration in one breaks the other, and you have a distributed monolith.

Consequences of database-per-service:
1. No cross-service SQL JOINs. Data that would naturally be joined in a monolith must be composed in the application layer or via eventual consistency.
2. Eventual consistency: if Order Service creates an order and sends a message to Inventory Service to decrement stock, there's a window where the order exists but inventory hasn't decremented. Design for this.
3. Distributed transactions: operations that span multiple services (e.g., place order + deduct inventory + charge payment) cannot use a database transaction. Use the Saga pattern instead.

Saga pattern: a sequence of local transactions, each publishing an event/message to trigger the next step. On failure, compensating transactions undo previous steps. Two flavours: choreography (each service reacts to events and publishes new events) and orchestration (a central saga orchestrator coordinates all steps).`,
      callout: {
        kind: "tip",
        text: "In a system design interview, always mention the data isolation principle when discussing microservices. Then bring up eventual consistency and the Saga pattern for cross-service operations. This signals deep understanding beyond just 'services talk to each other via APIs'.",
      },
    },
    {
      heading: "Distributed Tracing and Observability",
      body: `In a monolith, debugging a slow request is straightforward: check the logs and profiler for that request. In microservices, a single user request might traverse 10 services. Which service caused the 500ms latency spike?

Distributed tracing addresses this by generating a unique trace ID for each incoming request and propagating it through every service call as an HTTP header (e.g., X-Trace-ID, W3C Trace-Context). Each service records its own span (start time, duration, service name, operation name) tagged with the trace ID.

A tracing backend (Jaeger, Zipkin, AWS X-Ray, Datadog APM) collects all spans with the same trace ID and reconstructs the full request timeline as a flame graph. You can instantly see: Service A took 5ms, Service B (which A called) took 450ms (the culprit), and B's database query took 430ms.

The three pillars of microservices observability:
- Logs: structured JSON logs with trace ID in every line
- Metrics: RED metrics per service — Request rate, Error rate, Duration (latency)
- Traces: distributed traces correlating all spans for a single request

Without all three, debugging production issues in a microservices environment is guesswork.`,
    },
  ],
};
