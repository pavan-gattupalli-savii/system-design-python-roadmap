import type { Concept } from "./index";

export const observability: Concept = {
  slug:     "observability",
  title:    "Observability",
  emoji:    "🔭",
  category: "Architecture",
  tagline:  "Understanding what your system is doing from its external outputs",
  roadmapKeywords: ["observability", "monitoring", "logs", "metrics", "traces", "opentelemetry", "prometheus", "grafana", "jaeger"],
  related:  ["microservices", "latency", "circuit-breaker", "cdn"],

  sections: [
    {
      heading: "Observability vs Monitoring",
      body: `Monitoring tells you whether a known thing is broken: "Is CPU above 90%? Is error rate above 1%?" You define dashboards and alerts for failures you can anticipate.

Observability goes further: it's the ability to understand the internal state of your system solely from its external outputs — logs, metrics, and traces — including for failures you didn't predict. An observable system lets you ask arbitrary questions about its behaviour without deploying new instrumentation.

The distinction matters in production: monitoring catches the problems you expected. Observability helps you debug the problems you didn't — the slow query that only happens for users in a specific region, the memory leak that only manifests on Tuesdays, the cascade that takes 4 services to reproduce.

Peter Bourgon coined the term "three pillars of observability" to describe the three signal types that together provide full system insight: logs, metrics, and traces.`,
      diagram: "observability-pillars",
    },
    {
      heading: "Pillar 1 — Logs",
      body: `Logs are timestamped, immutable records of discrete events: "User 12345 logged in", "Query returned 0 rows", "NullPointerException at line 47", "Payment $99 succeeded for order #8821".

Structured logging: emit JSON logs instead of plain text strings. Every log line should include: timestamp, level, service name, trace_id (for correlation), and relevant key-value fields. Plain text logs are grep-able; structured logs are query-able.

Log levels (use them consistently):
- ERROR: something failed and needs attention — alert on this
- WARN: something unexpected happened but the system recovered — track trends
- INFO: normal events worth recording — request start/end, significant state transitions
- DEBUG: detailed diagnostics — disable in production or sample at 1%

Log aggregation: logs from 100 pods need to be centrally collected and indexed. The ELK stack (Elasticsearch + Logstash + Kibana) or the EFK stack (with Fluentd) are common. CloudWatch Logs (AWS), Cloud Logging (GCP), and Datadog Logs are managed alternatives.

The failure mode of logs: log too much and storage costs explode; log too little and you're blind during incidents. Sample DEBUG logs at 1-10%. Always log at ERROR and WARN. For INFO, log request boundaries (one line per request with status, duration, user_id, trace_id).`,
      callout: {
        kind: "tip",
        text: "The single highest-value improvement to your logging is adding a trace_id to every log line. When an alert fires at 2am, being able to grep trace_id=abc123 and instantly see every log line from all services for that specific request is the difference between a 5-minute debug and a 2-hour investigation.",
      },
    },
    {
      heading: "Pillar 2 — Metrics",
      body: `Metrics are numerical measurements sampled over time: request rate, error rate, p95 latency, CPU utilisation, memory usage, queue depth, active connections. They're time series data — efficient to store, fast to query, and the basis for dashboards and alerts.

The RED method (for services): track these three metric types for every service:
- Request Rate: how many requests per second is this service receiving?
- Error Rate: what percentage of those requests are failing?
- Duration: what is the p50, p95, p99 latency distribution?

The USE method (for resources): for every hardware resource (CPU, memory, disk, network):
- Utilisation: what percentage of the resource is being used?
- Saturation: is there a queue forming? (e.g., CPU run queue length)
- Errors: are there hardware errors?

Prometheus: the industry-standard metrics collection system. Services expose a /metrics endpoint in text format. Prometheus scrapes these endpoints on a schedule and stores data in its time-series database. PromQL is its query language. Works with Grafana for visualisation and AlertManager for alerting.

The four Prometheus metric types:
- Counter: monotonically increasing (total request count, total errors). Never decreases.
- Gauge: can go up and down (current active connections, memory usage, queue depth).
- Histogram: samples observations into configurable buckets — used for latency distributions (enables p95/p99 calculations).
- Summary: calculates quantiles client-side (less flexible than histograms for aggregation).`,
    },
    {
      heading: "Pillar 3 — Traces",
      body: `A trace represents a single request's journey through your distributed system — from the user's browser through the API gateway, to Service A, which calls Service B and Service C, each making database queries.

A trace is composed of spans. Each span represents a single unit of work: one service's processing, one database query, one external API call. Spans have: service name, operation name, start time, duration, status (ok/error), and key-value attributes.

W3C Trace Context: the standard header format for propagating trace context across service boundaries. Every service adds its span to the trace by reading the traceparent header from the incoming request and writing it to all outbound requests.

OpenTelemetry (OTel): the CNCF standard for producing and collecting telemetry data. A single SDK for all three pillars — logs, metrics, traces — with exporters for Jaeger, Zipkin, Prometheus, Datadog, Honeycomb, and more. Instrument once; switch backends without code changes.

Sampling: recording every trace at 1M req/s is impractical. Strategies:
- Head-based sampling: decide at the start of a trace (e.g., sample 1% of all requests). Simple but you miss rare slow/error requests.
- Tail-based sampling (preferred): buffer spans and decide at trace completion. Always sample traces with errors or high latency. Sample the rest at 1%.`,
    },
    {
      heading: "Observability Stack Choices",
      table: {
        cols: ["Component", "Open Source", "Managed (cloud)", "Description"],
        rows: [
          ["Metrics",     "Prometheus + Grafana",    "Datadog, New Relic, CloudWatch",    "Collect, store, visualise numerical time series"],
          ["Logs",        "ELK / EFK, Loki",         "Datadog, Splunk, CloudWatch Logs",  "Aggregate, index, and search log streams"],
          ["Traces",      "Jaeger, Zipkin, Tempo",   "Datadog APM, AWS X-Ray, Honeycomb", "Distributed request tracing across services"],
          ["All-in-one",  "OpenTelemetry Collector", "Datadog, Dynatrace, Honeycomb",     "Unified collection agent — one SDK for all signals"],
          ["Alerting",    "AlertManager, PagerDuty", "PagerDuty, OpsGenie, Datadog",      "Route alerts to on-call engineers"],
        ],
      },
    },
    {
      heading: "SLIs, SLOs, and Error Budgets",
      body: `Observability without targets is noise. Site Reliability Engineering (SRE) defines formal targets:

SLI (Service Level Indicator): a quantitative measure of a service behaviour. The ratio of "good requests" to total requests. "Good" means: responded in <200ms AND status 2xx.

SLO (Service Level Objective): the target value for an SLI. "99.9% of requests in any 30-day window are good." This is your internal target — stricter than your SLA with customers.

Error Budget: the allowed number of "bad" events before breaching the SLO. At 99.9% SLO and 1M daily requests: error budget = 0.1% × 1M = 1,000 bad requests/day. If the error budget is being consumed faster than expected, freeze feature launches and focus on reliability. If the budget is healthy, ship features aggressively.

SLA (Service Level Agreement): the contractual commitment to customers, with financial penalties for breach. Always set your SLA looser than your SLO — the SLO is your safety margin.`,
      callout: {
        kind: "note",
        text: "The most important alert is not 'CPU > 90%' — it's 'error rate exceeding SLO budget.' Alert on user-visible symptoms (latency, error rate) rather than causes (CPU, memory). A high-CPU system might be perfectly healthy; a low-CPU system might be returning errors to every user.",
      },
    },
  ],
};
