import type { Concept } from "./index";

export const sagaPattern: Concept = {
  slug:     "saga-pattern",
  title:    "Saga Pattern",
  emoji:    "🎭",
  category: "Distributed Systems",
  tagline:  "Managing distributed transactions without a global lock",
  roadmapKeywords: ["saga", "distributed transaction", "compensating transaction", "choreography", "orchestration", "eventual consistency", "microservices"],
  related:  ["microservices", "event-sourcing", "message-queues", "acid-transactions", "cap-theorem"],

  sections: [
    {
      heading: "The Distributed Transaction Problem",
      body: `In a monolith with a single database, multi-step operations are wrapped in ACID transactions: if any step fails, the database rolls back all changes atomically. The database guarantees all-or-nothing.

In a microservices architecture, each service has its own database. There is no single transaction coordinator. When placing an order requires: creating an order record (Order Service), deducting inventory (Inventory Service), charging a payment (Payment Service), and sending a confirmation email (Notification Service) — how do you ensure all four either succeed together or all roll back?

Two-Phase Commit (2PC) solves this with a global coordinator but is slow, doesn't work across heterogeneous databases, and has a blocking failure mode. Most microservices teams avoid 2PC.

The Saga pattern is the alternative: break the distributed transaction into a sequence of local transactions, each with a compensating transaction that undoes its effect if a later step fails. Instead of atomic rollback, you execute compensating actions forward.`,
      diagram: "saga-flow",
    },
    {
      heading: "Compensating Transactions",
      body: `A compensating transaction is the business-level "undo" of a local transaction. It doesn't literally undo the database write (that's already committed) — instead, it applies a new write that cancels the business effect.

Examples:
- Order Service created an order (OrderPlaced) → compensating transaction: UpdateOrderStatus(cancelled)
- Inventory Service decremented stock → compensating transaction: RestoreInventory(quantity)
- Payment Service charged the card → compensating transaction: RefundPayment(amount)

Important: compensating transactions must be idempotent. The saga coordinator may retry them on failure. Issuing two refunds when one was requested is a business disaster.

Semantic locks: some steps cannot be easily compensated (you can't un-send an email, un-deliver a package). Design sagas to delay irreversible side effects until the saga is certain to succeed. Send the confirmation email only after payment capture succeeds, not after payment authorisation.`,
    },
    {
      heading: "Choreography-Based Sagas",
      body: `In a choreography saga, there is no central coordinator. Each service listens for events and knows what to do next — like dancers following each other without a conductor.

Flow: Order Service creates order and publishes OrderPlaced event. Inventory Service listens, decrements stock, publishes InventoryReserved. Payment Service listens, charges card, publishes PaymentCaptured. Notification Service listens, sends email, publishes OrderConfirmed.

Failure handling: if Payment Service fails, it publishes PaymentFailed. Inventory Service listens for PaymentFailed and publishes InventoryReleased. Order Service listens for InventoryReleased and marks the order cancelled.

Pros of choreography: simple architecture — no central coordinator to fail or scale. Services are loosely coupled. Each service only knows about its own events and the events it reacts to.

Cons of choreography: hard to reason about the overall flow. "What happens if Inventory Service is down when PaymentFailed is published?" Hard to monitor saga progress. Hard to test the full flow end-to-end. Can produce cyclic dependencies if not designed carefully.

Best for: simple sagas with 2-3 steps. High-throughput scenarios where you can't afford a coordinator bottleneck.`,
    },
    {
      heading: "Orchestration-Based Sagas",
      body: `In an orchestration saga, a central saga orchestrator coordinates all steps. The orchestrator sends commands to each service, waits for responses/events, and decides what to do next — like a conductor directing an orchestra.

Flow: Order Saga Orchestrator sends ReserveInventory command to Inventory Service. Gets InventoryReserved response. Sends ChargePayment to Payment Service. Gets PaymentCaptured. Sends SendConfirmation to Notification Service. Gets ConfirmationSent. Marks saga as complete.

Failure: if Payment Service returns PaymentFailed, the orchestrator sends ReleaseInventory to Inventory Service (compensating transaction), then sends UpdateOrderStatus(cancelled) to Order Service. Full control over the compensation sequence.

Saga state: the orchestrator persists its current step and status to its own database. If the orchestrator crashes and restarts, it resumes from the last known step.

Implementation: the orchestrator is typically implemented as a state machine. Libraries: Temporal.io (workflows as code), Apache Camel, Axon Framework (Java), or hand-rolled state machine with a saga table.

Pros: clear flow visible in one place, easy to monitor saga progress, easy to add error handling and retries per step, easier to test.

Cons: orchestrator is a single point of failure (mitigate with HA deployment), potential for the orchestrator to become a bottleneck, adds an extra service to maintain.`,
    },
    {
      heading: "Choreography vs Orchestration",
      table: {
        cols: ["Property", "Choreography", "Orchestration"],
        rows: [
          ["Architecture",   "Decentralised — no coordinator",          "Centralised — saga orchestrator service"],
          ["Coupling",       "Services know only about events they care about", "Services coupled to orchestrator commands"],
          ["Visibility",     "Hard to see the full flow",              "Full saga flow visible in one place"],
          ["Error handling", "Each service handles its own failure path", "Orchestrator manages full compensation sequence"],
          ["Testing",        "Integration tests across many services",  "Unit test orchestrator state machine + mock services"],
          ["Monitoring",     "Aggregate events across services to trace a saga", "Query orchestrator's saga table for status"],
          ["Best for",       "Simple flows, high throughput, decoupled teams", "Complex flows, critical business processes, strict ordering"],
        ],
      },
    },
    {
      heading: "Saga vs Two-Phase Commit",
      bullets: [
        "2PC requires all participants to be available simultaneously to proceed. If any participant is unavailable, the coordinator blocks indefinitely (blocking protocol). Sagas are non-blocking — each step commits independently.",
        "2PC uses a global lock held across all participants during the prepare phase. Sagas release local locks after each step — much lower contention, much better throughput.",
        "2PC works only with databases that support the XA protocol (MySQL, PostgreSQL). Sagas work with any service, any database, any external API.",
        "2PC guarantees ACID atomicity. Sagas only provide eventual consistency — there are windows where some steps have committed and others haven't. The system is temporarily inconsistent.",
        "2PC is suitable for small, same-datacenter transactions where latency is low (e.g., updating two tables in two databases within one DC). Sagas are suitable for cross-service, cross-datacenter distributed transactions.",
        "In practice: avoid 2PC in microservices. Use sagas for business processes, and accept eventual consistency with careful compensating transaction design.",
      ],
    },
  ],
};
