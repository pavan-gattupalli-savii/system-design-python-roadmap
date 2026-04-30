import type { Concept } from "./index";

export const circuitBreaker: Concept = {
  slug:     "circuit-breaker",
  title:    "Circuit Breaker",
  emoji:    "⚡",
  category: "Architecture",
  tagline:  "Fail fast so one broken service doesn't cascade into full outage",
  roadmapKeywords: ["circuit breaker", "resilience", "fault tolerance", "hystrix", "resilience4j", "retry", "timeout"],
  related:  ["microservices", "load-balancing", "rate-limiting", "message-queues"],

  sections: [
    {
      heading: "The Cascading Failure Problem",
      body: `In distributed systems, services call other services. When a downstream service becomes slow or unavailable, the callers block waiting for responses. If enough requests pile up, the caller's thread pool exhausts and it too becomes unresponsive — causing its callers to fail as well. A single failing service cascades into a full system outage in seconds.

Classic example: Payment Service calls Fraud Detection Service. Fraud Detection is having a slow database day — responses that normally take 20ms now take 30 seconds. Payment Service's 50 threads are all blocked waiting for Fraud Detection. New payment requests queue up, then timeout. Users see "Payment failed." Payment Service itself is now unresponsive. Checkout Service (which calls Payment) starts failing too. A database problem in one service has taken down the entire checkout flow.

The circuit breaker pattern, named after the electrical circuit breaker that physically interrupts current when overloaded, is a state machine that wraps outbound service calls and trips open when failure rate exceeds a threshold — causing calls to fail immediately rather than waiting for the slow downstream.`,
      diagram: "circuit-breaker-flow",
    },
    {
      heading: "Three States",
      body: `The circuit breaker has three states:

CLOSED (normal operation): requests flow through to the downstream service. The circuit breaker tracks success and failure counts in a sliding window. While the failure rate stays below the threshold (e.g., <50% failures), the circuit stays closed.

OPEN (failing fast): once the failure rate exceeds the threshold, the circuit trips open. All calls fail immediately with a CircuitBreakerOpenException — no calls reach the downstream service. This gives the failing service time to recover, and prevents thread exhaustion in the caller. A timer starts (e.g., 30 seconds).

HALF-OPEN (probing recovery): after the timer expires, the circuit allows a small number of probe requests through. If the probe requests succeed, the circuit closes (normal operation resumes). If they fail, the circuit opens again and resets the timer. This enables automatic recovery without human intervention.`,
    },
    {
      heading: "Implementation Details",
      body: `Sliding window types for failure counting:
- Count-based window: track the last N requests. If >X% fail, trip. Simple, but one slow request can delay the trip if N is large.
- Time-based window: track failures in the last T seconds. More responsive to sudden degradation.

Key configuration parameters:
- failureRateThreshold (e.g., 50%): circuit opens when this % of requests fail within the window
- minimumNumberOfCalls (e.g., 10): don't trip on the first request if it fails; collect enough data first
- waitDurationInOpenState (e.g., 30s): how long to stay open before transitioning to half-open
- permittedNumberOfCallsInHalfOpenState (e.g., 3): how many probe requests to allow in half-open
- slowCallRateThreshold (e.g., 80%): trip on slowness too (not just errors) — if 80% of calls take >slowCallDurationThreshold, treat as failure

Fallback strategy: when the circuit is open, instead of returning an error, provide a fallback: serve stale cached data, return a default response, queue the request for later processing, or degrade gracefully (e.g., "fraud check temporarily unavailable, proceeding with manual review").`,
      callout: {
        kind: "tip",
        text: "A circuit breaker without a fallback is only half the solution. The fallback is what determines the user experience during an outage. Design fallbacks first: ask 'what should happen when this service is unavailable?' before implementing the circuit breaker.",
      },
    },
    {
      heading: "Circuit Breaker vs Retry vs Timeout",
      table: {
        cols: ["Pattern", "What it does", "When to use", "Risk without it"],
        rows: [
          ["Timeout",          "Limit how long a single call can block",                    "Always — every network call needs a timeout",                    "Thread starvation — threads blocked forever on dead services"],
          ["Retry",            "Automatically retry failed requests with backoff",           "Transient failures (network blip, 503 for <1s)",                 "Missing idempotency causes duplicate side effects"],
          ["Circuit Breaker",  "Stop calling a service that is consistently failing",       "Sustained downstream failures (not transient)",                  "Cascading failures across the service graph"],
          ["Bulkhead",         "Isolate thread pools per downstream service",               "Prevent one slow downstream from starving all threads",          "Thread pool exhaustion affecting unrelated features"],
          ["Fallback",         "Provide a degraded but functional response on failure",     "When partial data is better than no data",                       "Hard errors propagated to users"],
        ],
      },
      callout: {
        kind: "note",
        text: "Retry + Circuit Breaker is a dangerous combination if not designed carefully. Retries amplify load during an outage (the 'thundering herd' problem). Use circuit breakers to stop retrying altogether once the circuit opens. Resilience4j lets you chain: CircuitBreaker → Retry → Timeout as decorators — order matters.",
      },
    },
    {
      heading: "Real-World Libraries",
      table: {
        cols: ["Library / Tool", "Language", "Key Feature"],
        rows: [
          ["Resilience4j",  "Java",          "Lightweight, functional-style, integrates with Spring Boot, Micrometer metrics"],
          ["Hystrix",       "Java",          "Netflix OSS, battle-tested but now in maintenance mode — use Resilience4j instead"],
          ["Polly",         ".NET",          "Comprehensive resilience library with circuit breaker, retry, bulkhead, timeout, fallback"],
          ["PyBreaker",     "Python",        "Simple circuit breaker for Python services"],
          ["Istio / Envoy", "Any language",  "Circuit breaking at the infrastructure/service mesh level — no application code changes required. Configured via Istio DestinationRule."],
          ["AWS App Mesh",  "Any language",  "Managed service mesh with circuit breaker via Envoy proxy"],
        ],
      },
    },
    {
      heading: "Circuit Breaker in System Design Interviews",
      body: `Circuit breakers are a key resilience pattern to mention in any system design interview involving microservices, payment systems, or high-availability requirements.

When asked "how do you handle a downstream service failure?", structure your answer as:

1. Timeout: every call to ServiceB has a 500ms timeout. We never block indefinitely.
2. Circuit breaker: after 5 consecutive timeouts or >50% failure rate in 10 seconds, the circuit opens. We fail fast for the next 30 seconds without hitting ServiceB.
3. Fallback: while the circuit is open, we serve the last known good response from cache / use a simplified default / enqueue for later processing.
4. Monitoring: circuit state transitions are emitted as metrics (circuit_open_count, circuit_close_count). Alerts fire when circuits stay open for >2 minutes.
5. Recovery: after 30 seconds, we probe with 3 test requests. On success, we close the circuit and resume normal traffic gradually.`,
    },
  ],
};
