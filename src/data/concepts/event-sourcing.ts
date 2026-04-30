import type { Concept } from "./index";

export const eventSourcing: Concept = {
  slug:     "event-sourcing",
  title:    "Event Sourcing & CQRS",
  emoji:    "📜",
  category: "Architecture",
  tagline:  "Store every change as an immutable event — your data has a full history",
  roadmapKeywords: ["event sourcing", "cqrs", "event store", "event log", "domain event", "projection", "read model", "eventual consistency"],
  related:  ["message-queues", "microservices", "saga-pattern", "acid-transactions", "replication"],

  sections: [
    {
      heading: "Traditional State Storage vs Event Sourcing",
      body: `Traditional databases store the current state of an entity. An order record has columns for status, total, shipping_address. When the order ships, you UPDATE orders SET status='shipped'. The previous status is gone — overwritten. The audit trail is lost unless you separately maintain an audit_log table.

Event Sourcing inverts this: instead of storing current state, store every event (state transition) that has ever occurred. The state at any point in time is derived by replaying events from the beginning (or from a snapshot).

Order events: OrderPlaced → ItemAdded → ItemAdded → PaymentAuthorized → PaymentCaptured → Shipped → Delivered.

Current state = result of replaying all events in sequence.

Benefits:
1. Complete audit trail: every change is recorded immutably. Who did what, when, and why.
2. Temporal queries: reconstruct state at any point in the past — "what did this order look like at 2pm last Tuesday?"
3. Event replay: rebuild read models, fix bugs by replaying with corrected logic, create new projections from historical data.
4. Debugging: reproduce bugs exactly by replaying the event sequence that caused them.
5. Event-driven integration: events are naturally publishable to message queues — other services subscribe to domain events without polling.`,
      diagram: "event-log-flow",
    },
    {
      heading: "Event Store",
      body: `An event store is an append-only log of events. Events are never updated or deleted — only new events are appended. Each event has: event_id, aggregate_id, aggregate_type, event_type, event_data (JSON/binary), occurred_at, sequence_number.

Aggregate: the root entity whose events are stored together (e.g., an Order). All events for one aggregate are stored and replayed as a unit.

Sequence numbers: events for an aggregate have monotonically increasing sequence numbers. Loading an aggregate means fetching all events with its ID, sorted by sequence number, and replaying them.

Optimistic concurrency: when saving new events, include the expected current sequence number. If the actual sequence number differs (another process added events first), reject the write with a concurrency conflict — the caller retries. This prevents lost updates without locking.

Snapshots: for aggregates with thousands of events, replaying from event 1 is slow. Periodically save a snapshot of the current state. To load the aggregate, start from the latest snapshot and replay only events after it.

Event stores: EventStoreDB (the canonical purpose-built event store), Apache Kafka (used as a durable event log), AWS DynamoDB (append-only table patterns), PostgreSQL (with a purpose-built events table and proper indexing).`,
    },
    {
      heading: "CQRS — Command Query Responsibility Segregation",
      body: `Event Sourcing pairs naturally with CQRS, though they're independent patterns.

Traditional CRUD: the same model reads and writes data. Your Order service has one model, one database, serving both "save the order" and "show me all orders for user X."

CQRS separates: the write model (command side) handles state changes. The read model (query side) handles queries. They can use different databases, different schemas, and scale independently.

Command side (write model): validates business rules, applies domain logic, saves events to the event store. Optimised for consistency and correctness. Usually strongly consistent. Often event-sourced.

Query side (read model): one or more denormalised, query-optimised projections of the data. An event handler (projector) listens to the event stream and updates the read model as events arrive. Optimised for query performance. Eventually consistent with the write model.

Example: OrderPlaced event is published. Three projectors update three read models simultaneously:
- orders_by_user read model: adds the order to the user's order history (optimised for "show me user 12345's orders")
- fulfilment_queue read model: adds the order to the picking queue (optimised for warehouse operations)
- analytics_summary read model: updates revenue counters (optimised for dashboards)

Each read model is perfectly shaped for its queries. No JOINs needed. The write model doesn't need to worry about query performance.`,
    },
    {
      heading: "Trade-offs and Complexity",
      bullets: [
        "Eventual consistency: the read model lags behind the write model by milliseconds to seconds. Users who just placed an order may not immediately see it in their order history list. You must design the UI to handle this (optimistic updates, 'your order is processing' messages).",
        "Complexity: event sourcing is significantly more complex than CRUD. You need: event store, projectors, snapshot logic, event schema versioning. Only adopt it for core domains where the benefits justify the cost.",
        "Event schema evolution: once an event is written, it's immutable. When business requirements change, you can't change old events. Use upcasting (transform old event formats when reading) or versioned event types (OrderPlacedV1, OrderPlacedV2).",
        "Replay time: for millions of events, a full replay to rebuild a read model can take hours. Design your snapshot strategy and incremental rebuild process before you need it.",
        "Testing complexity: test each projector independently. Test the aggregate's event application logic independently. Test the command handler's validation logic independently.",
        "Infrastructure dependency: you need a reliable, ordered, durable event log. Kafka, EventStoreDB, or a purpose-built Postgres events table — all have operational overhead.",
      ],
      callout: {
        kind: "warning",
        text: "Event Sourcing is not a default architecture — it's a specialised tool for specific domains: financial transactions (ledgers), audit-heavy systems (compliance, healthcare), collaborative editing, and long-running business processes. For a standard CRUD application, traditional databases with an audit_log table are simpler and sufficient.",
      },
    },
    {
      heading: "Event Sourcing in System Design Interviews",
      body: `Mention Event Sourcing when the interviewer asks about:
- Audit trails ("how do you know who changed this order?")
- Historical state ("can we see what the account balance was 6 months ago?")
- Replaying/reprocessing ("if we fix a bug in our discount calculation, can we reprocess old orders?")
- Event-driven integration ("how does the Inventory service know when an Order is placed?")

Real examples where Event Sourcing shines:
- Banking ledgers: every debit and credit is an immutable event. Current balance = sum of all events. Used by Monzo, Starling.
- Collaborative editing (Google Docs, Figma): every edit is an event. Apply events from all users to derive document state. Supports real-time collaboration and conflict resolution (CRDT).
- E-commerce order management: orders go through complex state machines with many actors (customer, fulfilment, finance, shipping). Each state transition is an event.
- Git: every commit is an event. Current file state = result of applying all commits from the root.`,
    },
  ],
};
