import type { Concept } from "./index";

export const messageQueues: Concept = {
  slug:     "message-queues",
  title:    "Message Queues",
  emoji:    "📨",
  category: "Distributed Systems",
  tagline:  "Async communication so services don't wait on each other",
  roadmapKeywords: ["queue", "kafka", "rabbitmq", "pub sub", "message", "async", "event", "sqs", "broker"],
  related:  ["microservices", "cap-theorem", "replication"],

  sections: [
    {
      heading: "Why Asynchronous Messaging?",
      body: `In a synchronous architecture, Service A calls Service B and waits for a response before continuing. This works fine when B is fast and always available. But in a distributed system, B can be slow, overloaded, or temporarily down.

If A waits synchronously for B:
- Latency compounds: A's response time = A's time + B's time + network latency
- Failure propagates: if B crashes, A's request fails too
- No buffering: if B is slow, A accumulates open connections until it runs out of resources

Message queues decouple producers (senders) from consumers (receivers) in space, time, and processing rate.

In space: A doesn't need to know B's IP address or even that B exists. A sends to the queue; B reads from the queue.
In time: A can send a message and continue without waiting. B can process the message hours later.
In rate: A can produce 1,000 messages/second; B can consume 100/second. The queue absorbs the burst and B catches up at its own pace — this is called backpressure buffering.`,
      diagram: "queue-flow",
    },
    {
      heading: "Point-to-Point vs Pub/Sub",
      table: {
        cols: ["Property", "Point-to-Point (Queue)", "Publish-Subscribe (Topic)"],
        rows: [
          ["Model",          "One producer → One queue → One consumer (at a time)",          "One producer → One topic → Many consumer groups simultaneously"],
          ["Message delivery","Each message consumed by exactly one consumer",                 "Each message delivered to every subscribed consumer group"],
          ["Use case",       "Task queues: email sending, image resizing, billing. Each job done once by one worker.", "Event broadcasting: order placed → notify inventory + notify email + notify analytics all in parallel"],
          ["Examples",       "AWS SQS (standard), RabbitMQ queue, ActiveMQ",                  "Apache Kafka, AWS SNS, Google Pub/Sub, RabbitMQ fanout exchange"],
          ["Scaling consumers", "Add consumers to the same queue — they compete for messages and share the load", "Add consumer groups — each group gets all messages independently"],
          ["Message retention","Message deleted after successful consumption",                  "Messages retained for configurable period (Kafka: days/weeks) regardless of consumption"],
        ],
      },
    },
    {
      heading: "Delivery Guarantees",
      body: `One of the most important — and often misunderstood — properties of a message queue is its delivery guarantee. What does the queue promise about whether a message will be delivered?`,
      table: {
        cols: ["Guarantee", "Definition", "Implementation", "Risk", "When to use"],
        rows: [
          ["At-most-once",   "Message delivered 0 or 1 time — may be lost",         "Fire and forget; no ack required",                          "Lost messages",    "Metrics, logs, telemetry — loss is acceptable"],
          ["At-least-once",  "Message delivered 1 or more times — never lost",       "Producer retries until ack. Consumer must ack after processing.", "Duplicate messages", "Most business events — use idempotent consumers"],
          ["Exactly-once",   "Message delivered exactly 1 time — no loss, no dups",  "Two-phase commit or idempotent producer + transactional consumer", "Very high overhead; distributed transactions", "Payments, financial records — but rare; often simulated with idempotency keys"],
        ],
      },
      callout: {
        kind: "warning",
        text: "Exactly-once is extremely difficult in distributed systems (see CAP theorem). In practice, most systems target at-least-once delivery and make consumers idempotent (processing the same message twice produces the same result as processing it once). Use idempotency keys (unique message IDs) so consumers can detect and discard duplicates.",
      },
    },
    {
      heading: "Kafka vs RabbitMQ vs SQS vs Redis Streams",
      table: {
        cols: ["System", "Model", "Retention", "Throughput", "Ordering", "Best for"],
        rows: [
          ["Apache Kafka",     "Distributed log / pub-sub", "Days to weeks (configurable)", "Millions of msg/sec", "Ordered within partition", "High-throughput event streaming, event sourcing, audit logs, stream processing (Flink, Spark)"],
          ["RabbitMQ",         "Traditional AMQP broker", "Until consumed (or TTL)", "Tens of thousands/sec", "FIFO within queue", "Task queues, request/reply patterns, complex routing (fanout, topic, direct), legacy AMQP integration"],
          ["AWS SQS",          "Managed queue service", "Up to 14 days", "Unlimited (managed)", "FIFO queue for ordering (extra cost)", "Simple task queues on AWS; standard queue for highest throughput, FIFO queue for strict ordering"],
          ["Redis Streams",    "Append-only log (like mini-Kafka)", "Configurable (MAXLEN)", "Very high (in-memory)", "Ordered by ID", "Low-latency pub-sub, real-time notifications, leaderboards with streaming updates"],
        ],
      },
    },
    {
      heading: "Dead Letter Queues (DLQ)",
      body: `When a consumer fails to process a message (exception thrown, timeout, invalid data), the queue typically requeues the message and tries again. But what if the message is fundamentally unprocessable — a malformed payload, a dependency that's permanently unavailable, a bug in consumer code?

Without a dead letter queue, the message will be retried forever, blocking other messages and consuming resources endlessly. This is called a poison pill message.

A dead letter queue is a separate queue where messages are moved after a configurable number of failed processing attempts (e.g., after 3 retries). The original queue is unblocked and moves on to healthy messages. Engineers can inspect the DLQ, fix the root cause, and re-queue the messages when ready.

DLQ is supported natively by: AWS SQS, RabbitMQ, Azure Service Bus, Kafka (via a convention — route to a dead-letter topic in your consumer code).

Always configure a DLQ in production. The alternative is silent message loss (if you give up after N retries without a DLQ) or an infinite retry loop poisoning your queue.`,
    },
    {
      heading: "Backpressure and Consumer Scaling",
      body: `Backpressure is the mechanism by which a slow consumer signals to a fast producer to slow down. Without backpressure, an overwhelmed consumer's queue grows indefinitely until memory is exhausted.

In queue-based systems, backpressure is implicit: the queue depth (number of unprocessed messages) is the signal. When queue depth grows, you scale consumers. When it shrinks, you can scale down.

Autoscaling based on queue depth: AWS SQS + Lambda scales automatically based on queue depth. Kubernetes + KEDA can scale deployments based on Kafka consumer lag. This is one of the most powerful patterns for cost-efficient horizontal scaling.

Consumer scaling strategies:
1. Add more consumers to the same queue (competing consumers pattern) — each message processed by one consumer, load spreads automatically
2. Partition-based parallelism (Kafka) — add consumers up to the number of partitions; more partitions = more parallelism possible
3. Vertical scaling — give existing consumers more CPU/memory to process messages faster`,
      callout: {
        kind: "tip",
        text: "Design your consumers to be stateless and idempotent. Stateless means you can add and remove consumer instances at will without coordination. Idempotent means that if the queue accidentally delivers a message twice (at-least-once semantics), processing it twice produces the same result as once.",
      },
    },
  ],
};
