export const TRACKER_URL =
  "https://docs.google.com/spreadsheets/d/1w3S42p_ZAH9t_OLJQZ8N5fkFy4wHnmdj/edit?usp=drivesdk&ouid=106113630169695081159&rtpof=true&sd=true";

export const TYPES = {
  "Book":       { bg: "#1a2740", tx: "#7eb8f7", icon: "📖" },
  "YouTube":    { bg: "#3b0a0a", tx: "#f87171", icon: "▶"  },
  "Docs":       { bg: "#0f2a18", tx: "#6ee7b7", icon: "📄" },
  "Article":    { bg: "#2a1f00", tx: "#fbbf24", icon: "📰" },
  "Build":      { bg: "#1a0a3b", tx: "#c4b5fd", icon: "🔨" },
  "Practice":   { bg: "#3b0f1a", tx: "#f9a8d4", icon: "🎯" },
  "Ask Claude": { bg: "#0a2030", tx: "#67e8f9", icon: "🤖" },
  "Platform":   { bg: "#0f2a20", tx: "#86efac", icon: "🌐" },
  "Blog":       { bg: "#2a1500", tx: "#fb923c", icon: "✍️" },
};

export const roadmap = [
  {
    phase: 1, title: "Python Internals & OOP Mastery", icon: "🐍",
    accent: "#059669", light: "#6EE7B7",
    desc: "Deepen the Python skills everything else rests on",
    weeks: [
      { n: 1, title: "Dataclasses, ABCs & Protocols", sessions: [
        { label: "Study", focus: "Dataclasses deep dive", resources: [
          { type: "Docs",    item: "Python dataclasses module",                                         where: "docs.python.org/3/library/dataclasses.html", mins: 30 },
          { type: "YouTube", item: "ArjanCodes – 'Dataclasses are one of my favorite Python features'", where: "YouTube → search 'arjan codes dataclasses'", mins: 22 },
        ]},
        { label: "Study", focus: "Abstract Base Classes & Protocols", resources: [
          { type: "Book",    item: "Fluent Python 2e – Ch 13 'Interfaces, Protocols & ABCs'",           where: "~40 pages – your core reference", mins: 45 },
          { type: "Docs",    item: "abc module + PEP 544 (Protocols)",                                  where: "docs.python.org/3/library/abc.html & peps.python.org/pep-0544", mins: 25 },
        ]},
        { label: "Build", focus: "Project: Typed Config System", resources: [
          { type: "Article", item: "Real Python – 'Python Dataclasses Guide'",                          where: "realpython.com → search 'python dataclasses'", mins: 20 },
          { type: "Build",   item: "Typed config system: dataclass fields + Protocol validator + ABC loader", where: "Implement from scratch. Bring questions to Claude!", mins: 60 },
        ]},
      ]},
      { n: 2, title: "Dunder Methods, Descriptors & Metaclasses", sessions: [
        { label: "Study", focus: "The Python Data Model", resources: [
          { type: "Book",    item: "Fluent Python 2e – Ch 1 'The Python Data Model'",                   where: "pp. 1–30 — foundational, read carefully", mins: 40 },
          { type: "Book",    item: "Fluent Python 2e – Ch 11 'A Pythonic Object'",                      where: "pp. 310–350 — __repr__, __eq__, __hash__, __slots__", mins: 40 },
        ]},
        { label: "Study", focus: "Descriptors & Properties", resources: [
          { type: "Article", item: "Real Python – 'Python Descriptors: An Introduction'",               where: "realpython.com → search 'python descriptors'", mins: 40 },
          { type: "YouTube", item: "ArjanCodes – 'Python Properties and Descriptors'",                  where: "YouTube → search 'arjan codes python descriptors'", mins: 20 },
        ]},
        { label: "Build", focus: "Project: Mini ORM layer", resources: [
          { type: "Article", item: "Real Python – 'Python Metaclasses'",                                where: "realpython.com → search 'python metaclasses'", mins: 35 },
          { type: "Build",   item: "Mini ORM: Field descriptors, Model metaclass, basic validation",    where: "Think SQLAlchemy-lite. Ask Claude to review!", mins: 60 },
        ]},
      ]},
      { n: 3, title: "Context Managers, Generators & Memory", sessions: [
        { label: "Study", focus: "Context Managers & Generators", resources: [
          { type: "Book",    item: "Fluent Python 2e – Ch 17 'Iterators, Generators and Classic Coroutines'", where: "pp. 510–550", mins: 45 },
          { type: "Book",    item: "Fluent Python 2e – Ch 18 'with, match and else Blocks'",            where: "pp. 551–580", mins: 35 },
        ]},
        { label: "Study", focus: "Memory model & asyncio", resources: [
          { type: "Article", item: "Real Python – 'Memory Management in Python'",                       where: "realpython.com → search 'memory management python'", mins: 30 },
          { type: "Article", item: "Real Python – 'Async IO in Python: A Complete Walkthrough'",        where: "realpython.com → search 'async io python'", mins: 40 },
        ]},
        { label: "Build", focus: "Project: Connection Pool", resources: [
          { type: "YouTube", item: "ArjanCodes – 'Context Managers and Generators'",                    where: "YouTube → search 'arjan codes context managers'", mins: 20 },
          { type: "Build",   item: "Thread-safe connection pool (__enter__/__exit__) + generator pipeline", where: "Test with concurrent.futures.", mins: 60 },
        ]},
      ]},
      { n: 4, title: "Async Python & Type System", sessions: [
        { label: "Study", focus: "asyncio internals", resources: [
          { type: "Book",    item: "Fluent Python 2e – Ch 19–21 (async chapters)",                      where: "pp. 590–680 — pace across 2–3 sessions", mins: 50 },
          { type: "Docs",    item: "Python asyncio – Tasks and Coroutines",                             where: "docs.python.org/3/library/asyncio-task.html", mins: 30 },
        ]},
        { label: "Study", focus: "Type hints & mypy", resources: [
          { type: "Docs",    item: "mypy – Type hints cheat sheet",                                     where: "mypy.readthedocs.io/en/stable/cheat_sheet_py3.html", mins: 25 },
          { type: "YouTube", item: "ArjanCodes – 'Python Type Checking'",                               where: "YouTube → search 'arjan codes type checking'", mins: 22 },
        ]},
        { label: "Build", focus: "Project: Async HTTP client with rate limiting", resources: [
          { type: "Docs",    item: "aiohttp – Client quickstart",                                       where: "docs.aiohttp.org/en/stable/client_quickstart.html", mins: 25 },
          { type: "Build",   item: "Async crawler: 100 URLs, asyncio.Semaphore, exponential backoff. Full type hints.", where: "Use aiohttp. Add mypy checks.", mins: 60 },
        ]},
      ]},
    ],
  },
  {
    phase: 2, title: "Low-Level Design (LLD)", icon: "🏗️",
    accent: "#2563EB", light: "#93C5FD",
    desc: "Design clean, extensible class structures using design patterns",
    weeks: [
      { n: 5, title: "SOLID Principles", sessions: [
        { label: "Study", focus: "S, O, L principles", resources: [
          { type: "Article", item: "refactoring.guru – SOLID: SRP, OCP, LSP",                          where: "refactoring.guru/solid — read first 3 with Python examples", mins: 35 },
          { type: "YouTube", item: "ArjanCodes – 'SOLID Principles: Improve Your OOP with Python'",    where: "YouTube → search 'arjan codes solid principles'", mins: 30 },
        ]},
        { label: "Study", focus: "I, D principles + practical violations", resources: [
          { type: "Article", item: "refactoring.guru – ISP + DIP",                                     where: "refactoring.guru/solid — last two sections", mins: 25 },
          { type: "YouTube", item: "ArjanCodes – 'Dependency Inversion'",                               where: "YouTube → search 'arjan codes dependency inversion'", mins: 20 },
        ]},
        { label: "Build", focus: "Refactor a messy class to SOLID", resources: [
          { type: "Build",      item: "Take a messy God-object order handler and refactor it to SOLID", where: "Before/after comparison. Document every violation fixed.", mins: 60 },
          { type: "Ask Claude", item: "Paste your refactored code. Ask: 'What SOLID violations did I miss?'", where: "Use Claude as your tech lead reviewer", mins: 20 },
        ]},
      ]},
      { n: 6, title: "Creational Design Patterns", sessions: [
        { label: "Study", focus: "Factory & Builder", resources: [
          { type: "Article", item: "refactoring.guru – Factory Method + Abstract Factory",              where: "refactoring.guru/design-patterns/factory-method", mins: 35 },
          { type: "Book",    item: "Head First Design Patterns – Ch 4 'The Factory Pattern'",           where: "pp. 109–168 — very visual", mins: 45 },
        ]},
        { label: "Study", focus: "Singleton & Builder", resources: [
          { type: "Article", item: "refactoring.guru – Builder + Singleton patterns",                   where: "refactoring.guru/design-patterns/builder", mins: 30 },
          { type: "YouTube", item: "ArjanCodes – 'Builder Pattern in Python'",                          where: "YouTube → search 'arjan codes builder pattern'", mins: 20 },
        ]},
        { label: "Build", focus: "Project: Notification system", resources: [
          { type: "YouTube", item: "ArjanCodes – 'Factory Pattern in Python'",                          where: "YouTube → search 'arjan codes factory pattern'", mins: 18 },
          { type: "Build",   item: "Notification system: Factory + Strategy routing + Builder for configs", where: "Use ABCs. Add type hints throughout.", mins: 60 },
        ]},
      ]},
      { n: 7, title: "Structural Design Patterns", sessions: [
        { label: "Study", focus: "Adapter & Decorator", resources: [
          { type: "Article", item: "refactoring.guru – Adapter + Decorator",                            where: "refactoring.guru/design-patterns/adapter", mins: 35 },
          { type: "Book",    item: "Head First Design Patterns – Ch 3 'Decorator Pattern'",             where: "pp. 79–107 — Starbucks coffee analogy", mins: 40 },
        ]},
        { label: "Study", focus: "Proxy & Facade", resources: [
          { type: "Article", item: "refactoring.guru – Proxy + Facade",                                 where: "refactoring.guru/design-patterns/proxy", mins: 30 },
          { type: "YouTube", item: "ArjanCodes – 'Proxy Pattern in Python'",                            where: "YouTube → search 'arjan codes proxy pattern'", mins: 18 },
        ]},
        { label: "Build", focus: "Project: Caching Proxy + Logging Decorator", resources: [
          { type: "Build",      item: "Caching proxy (DB call intercept + Redis) + logging decorator",  where: "Use functools.wraps. Test with unit tests.", mins: 60 },
          { type: "Ask Claude", item: "Ask: 'When in production would you pick Proxy vs Decorator? 3 real examples of each.'", where: "Great for cementing the conceptual difference", mins: 15 },
        ]},
      ]},
      { n: 8, title: "Behavioral Design Patterns", sessions: [
        { label: "Study", focus: "Observer & Strategy", resources: [
          { type: "Article", item: "refactoring.guru – Observer + Strategy",                            where: "refactoring.guru/design-patterns/observer", mins: 35 },
          { type: "YouTube", item: "ArjanCodes – 'Observer Pattern in Python'",                         where: "YouTube → search 'arjan codes observer pattern'", mins: 20 },
        ]},
        { label: "Study", focus: "State & Command", resources: [
          { type: "Article", item: "refactoring.guru – State + Command",                                where: "refactoring.guru/design-patterns/state", mins: 30 },
          { type: "YouTube", item: "ArjanCodes – 'State Pattern in Python'",                            where: "YouTube → search 'arjan codes state pattern'", mins: 18 },
        ]},
        { label: "Build", focus: "Project: Order State Machine", resources: [
          { type: "Build",   item: "Order State Machine: State + Observer for events + Command for undo/redo", where: "Real e-commerce order flow.", mins: 60 },
        ]},
      ]},
      { n: 9, title: "LLD Practice: Library & Elevator", sessions: [
        { label: "Study + Build", focus: "Library Management System", resources: [
          { type: "YouTube", item: "Search: 'library management system LLD python'",                    where: "YouTube — pick a good walkthrough", mins: 25 },
          { type: "Build",   item: "Library: Book, Member, Loan, Reservation, Fine calculator. Observer for due-date alerts.", where: "Full type hints throughout.", mins: 60 },
        ]},
        { label: "Build", focus: "Elevator System", resources: [
          { type: "Ask Claude", item: "Ask: 'Interview me on designing an Elevator system LLD. What classes and edge cases matter?'", where: "Use Claude as your design interviewer", mins: 30 },
          { type: "Build",   item: "Elevator: Elevator, Controller, Request, DispatchStrategy (SCAN/LOOK algorithm)", where: "Try 2 dispatch strategies and compare.", mins: 60 },
        ]},
      ]},
      { n: 10, title: "Food Delivery + Design Docs", sessions: [
        { label: "Build", focus: "Food Delivery System", resources: [
          { type: "YouTube", item: "Search: 'food delivery system LLD design Swiggy Zomato'",           where: "YouTube — pick a recent video", mins: 30 },
          { type: "Build",   item: "Food delivery: Restaurant, Menu, Order, DeliveryAgent, RealTimeTracking.", where: "Combine all your patterns.", mins: 60 },
        ]},
        { label: "Study", focus: "How to write a design doc", resources: [
          { type: "Blog",    item: "Gergely Orosz – 'How to Write a Good Design Document'",             where: "blog.pragmaticengineer.com or search his name + design doc", mins: 25 },
          { type: "Article", item: "Google Design Doc format",                                           where: "Search 'google design doc template one-pager'", mins: 20 },
        ]},
        { label: "Build", focus: "Document all your LLDs", resources: [
          { type: "Build",      item: "Write 1-page design doc for each of your 4 LLD projects",        where: "Problem → Key classes → Patterns used → Trade-offs", mins: 60 },
          { type: "Ask Claude", item: "Paste your design doc. Ask: 'What edge cases am I missing? What would break at scale?'", where: "Use Claude as your tech lead reviewer", mins: 20 },
        ]},
      ]},
    ],
  },
  {
    phase: 3, title: "Databases & Storage", icon: "🗄️",
    accent: "#DC2626", light: "#FCA5A5",
    desc: "Understand when and how to use every major storage system",
    weeks: [
      { n: 11, title: "SQL Internals & Indexing", sessions: [
        { label: "Study", focus: "DDIA foundations + B-Trees", resources: [
          { type: "Book",    item: "DDIA – Ch 1 'Reliable, Scalable, Maintainable'",                    where: "pp. 3–30 — read slowly. Sets the mental model.", mins: 45 },
          { type: "Book",    item: "DDIA – Ch 3 'Storage and Retrieval' (B-Tree section)",               where: "pp. 69–99 — how indexes work on disk", mins: 40 },
        ]},
        { label: "Study", focus: "SQL indexing deep dive", resources: [
          { type: "Article", item: "Use The Index, Luke – Ch 1 'Anatomy of an Index'",                  where: "use-the-index-luke.com/sql/anatomy — FREE, best SQL resource", mins: 35 },
          { type: "YouTube", item: "Hussein Nasser – 'Database Indexing Explained'",                    where: "YouTube → search 'hussein nasser database indexing'", mins: 25 },
        ]},
        { label: "Build", focus: "Index your own queries", resources: [
          { type: "Build",   item: "Create 5 tables with 1M rows each. Run EXPLAIN ANALYZE before/after adding indexes.", where: "PostgreSQL. Measure query time. Document findings.", mins: 60 },
        ]},
      ]},
      { n: 12, title: "ACID, Transactions & SQL Schema Design", sessions: [
        { label: "Study", focus: "ACID & transactions", resources: [
          { type: "Book",    item: "DDIA – Ch 7 'Transactions'",                                        where: "pp. 221–270 — ACID, isolation levels, write skew", mins: 55 },
          { type: "YouTube", item: "Hussein Nasser – 'Database Transactions'",                          where: "YouTube → search 'hussein nasser database transactions'", mins: 25 },
        ]},
        { label: "Study", focus: "Isolation levels", resources: [
          { type: "Docs",       item: "PostgreSQL – Transaction Isolation docs",                         where: "postgresql.org/docs/current/transaction-iso.html", mins: 25 },
          { type: "Ask Claude", item: "Ask: 'Explain isolation levels with concrete SQL examples. When does each break?'", where: "Ask for examples with actual SQL", mins: 20 },
        ]},
        { label: "Build", focus: "Twitter schema + optimization", resources: [
          { type: "Build",      item: "Full Twitter schema: users, tweets, follows, likes, hashtags. Add indexes, explain choices.", where: "Draw ERD first, then write CREATE TABLE SQL.", mins: 60 },
          { type: "Ask Claude", item: "Paste your schema. Ask: 'N+1 risks and missing indexes in this schema?'", where: "Claude as your senior DB reviewer", mins: 20 },
        ]},
      ]},
      { n: 13, title: "NoSQL: MongoDB, DynamoDB & Redis", sessions: [
        { label: "Study", focus: "NoSQL data models", resources: [
          { type: "Book",    item: "DDIA – Ch 2 'Data Models and Query Languages'",                     where: "pp. 31–63 — document, relational, graph models compared", mins: 45 },
          { type: "YouTube", item: "Fireship – 'SQL vs NoSQL Explained'",                               where: "YouTube → search 'fireship sql nosql'", mins: 12 },
        ]},
        { label: "Study", focus: "Redis in depth", resources: [
          { type: "Platform", item: "Redis University – RU101: Intro to Redis Data Structures",         where: "university.redis.com — FREE, ~3 hours total", mins: 45 },
          { type: "YouTube",  item: "Hussein Nasser – 'Redis Crash Course'",                            where: "YouTube → search 'hussein nasser redis crash course'", mins: 30 },
        ]},
        { label: "Build", focus: "Project: Redis Leaderboard", resources: [
          { type: "Docs",    item: "Redis sorted sets: ZADD, ZRANGE, ZRANK, ZINCRBY",                   where: "redis.io/docs/data-types/sorted-sets/", mins: 20 },
          { type: "Build",   item: "Gaming leaderboard: add scores, get top-10, user rank, paginate. FastAPI endpoint.", where: "Test with 1 million fake entries.", mins: 60 },
        ]},
      ]},
      { n: 14, title: "Replication & Partitioning", sessions: [
        { label: "Study", focus: "Replication strategies", resources: [
          { type: "Book",    item: "DDIA – Ch 5 'Replication' (full chapter)",                          where: "pp. 151–194 — leader-follower, multi-leader, leaderless", mins: 50 },
          { type: "YouTube", item: "Martin Kleppmann – 'Distributed Systems Lecture 5: Replication'",  where: "YouTube → search 'martin kleppmann distributed systems replication'", mins: 40 },
        ]},
        { label: "Study", focus: "Partitioning & sharding", resources: [
          { type: "Book",    item: "DDIA – Ch 6 'Partitioning'",                                        where: "pp. 199–228 — key range vs hash, secondary indexes", mins: 45 },
          { type: "YouTube", item: "Gaurav Sen – 'Database Sharding'",                                  where: "YouTube → search 'gaurav sen database sharding'", mins: 20 },
        ]},
        { label: "Build", focus: "Design: Sharded user database", resources: [
          { type: "Ask Claude", item: "Ask: 'Shard key for 1-billion-user app. What are the hotspot risks?'", where: "Discuss consistent hashing vs range-based", mins: 25 },
          { type: "Build",      item: "Write a doc: shard key options for users table. Pros/cons of each.", where: "At least 3 strategies with trade-off analysis.", mins: 45 },
        ]},
      ]},
      { n: 15, title: "CAP Theorem & Distributed Consensus", sessions: [
        { label: "Study", focus: "CAP & consistency models", resources: [
          { type: "Book",    item: "DDIA – Ch 8 'The Trouble with Distributed Systems'",                where: "pp. 273–320 — clocks, networks, partial failures", mins: 55 },
          { type: "Book",    item: "DDIA – Ch 9 'Consistency and Consensus'",                           where: "pp. 321–370 — linearizability, Raft, 2PC", mins: 55 },
        ]},
        { label: "Study", focus: "Practical consistency choices", resources: [
          { type: "YouTube", item: "Martin Kleppmann – 'CAP Theorem'",                                  where: "YouTube → search 'martin kleppmann cap theorem'", mins: 25 },
          { type: "Article", item: "Aphyr – 'Please stop calling databases CP or AP'",                  where: "Search: 'aphyr please stop calling databases CP AP'", mins: 20 },
        ]},
        { label: "Build", focus: "Consistency choice exercise", resources: [
          { type: "Build",      item: "For 4 systems choose consistency model + justify: bank, social feed, shopping cart, DNS", where: "2–3 sentences per scenario.", mins: 45 },
          { type: "Ask Claude", item: "Share your choices. Ask: 'What are the second-order consequences of each choice?'", where: "Interviewer-style pushback practice", mins: 20 },
        ]},
      ]},
      { n: 16, title: "Blob Storage, CDN & Search Engines", sessions: [
        { label: "Study", focus: "Object storage & CDN", resources: [
          { type: "Blog",    item: "AWS Blog – 'How Amazon S3 Works'",                                  where: "aws.amazon.com/blogs → search 'S3 architecture'", mins: 30 },
          { type: "YouTube", item: "ByteByteGo – 'CDN Explained'",                                     where: "YouTube → search 'bytebytego cdn explained'", mins: 15 },
        ]},
        { label: "Study", focus: "Search engines (Elasticsearch)", resources: [
          { type: "Docs",    item: "Elasticsearch – 'Getting started' guide",                           where: "elastic.co/guide/en/elasticsearch/reference/current/getting-started.html", mins: 30 },
          { type: "YouTube", item: "ByteByteGo – 'How does Elasticsearch work?'",                      where: "YouTube → search 'bytebytego elasticsearch'", mins: 15 },
        ]},
        { label: "Build", focus: "Storage choice exercise", resources: [
          { type: "Build",      item: "For 5 scenarios choose right storage + justify: pics, leaderboard, full-text, logs, video", where: "2–3 sentences per scenario.", mins: 45 },
          { type: "Ask Claude", item: "Ask: 'Review my storage choices and challenge me on each trade-off.'", where: "Debate-style review", mins: 20 },
        ]},
      ]},
    ],
  },
  {
    phase: 4, title: "Networking, APIs & Communication", icon: "🌐",
    accent: "#7C3AED", light: "#C4B5FD",
    desc: "Design robust APIs and understand how systems communicate",
    weeks: [
      { n: 17, title: "HTTP Deep Dive & REST APIs", sessions: [
        { label: "Study", focus: "HTTP fundamentals", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'HTTP/1.1 vs HTTP/2 vs HTTP/3'",                  where: "YouTube → search 'hussein nasser http1 http2 http3'", mins: 30 },
          { type: "YouTube", item: "Hussein Nasser – 'How HTTP Works'",                                where: "YouTube → search 'hussein nasser how http works'", mins: 25 },
        ]},
        { label: "Study", focus: "REST design + FastAPI", resources: [
          { type: "Article", item: "REST API best practices 2024",                                      where: "Search 'REST API design best practices 2024'", mins: 30 },
          { type: "Docs",    item: "FastAPI – Getting Started tutorial (full walkthrough)",             where: "fastapi.tiangolo.com/tutorial/ — do it hands-on", mins: 45 },
        ]},
        { label: "Build", focus: "Project: Blog REST API", resources: [
          { type: "Build",   item: "FastAPI Blog API: Users, Posts, Comments, Tags. JWT headers, pagination, proper HTTP codes.", where: "SQLAlchemy + Pydantic + FastAPI. Full type hints.", mins: 60 },
        ]},
      ]},
      { n: 18, title: "gRPC, WebSockets & Real-time", sessions: [
        { label: "Study", focus: "gRPC & Protobuf", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'gRPC Crash Course'",                             where: "YouTube → search 'hussein nasser grpc crash course'", mins: 35 },
          { type: "Docs",    item: "gRPC Python quickstart",                                           where: "grpc.io/docs/languages/python/quickstart/", mins: 30 },
        ]},
        { label: "Study", focus: "WebSockets & SSE", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'WebSockets Crash Course'",                       where: "YouTube → search 'hussein nasser websockets'", mins: 30 },
          { type: "Docs",    item: "FastAPI WebSockets documentation",                                 where: "fastapi.tiangolo.com/advanced/websockets/", mins: 20 },
        ]},
        { label: "Build", focus: "Project: Real-time chat", resources: [
          { type: "Build",      item: "Real-time chat: FastAPI + WebSockets. Rooms, Redis message history, presence tracking.", where: "Handle reconnections. Test with multiple browser tabs.", mins: 60 },
          { type: "Ask Claude", item: "Ask: 'WebSockets vs SSE vs Long Polling — compare for my chat use case with trade-offs'", where: "Architecture decision practice", mins: 15 },
        ]},
      ]},
      { n: 19, title: "Message Queues & Event-Driven Architecture", sessions: [
        { label: "Study", focus: "Kafka fundamentals", resources: [
          { type: "YouTube", item: "ByteByteGo – 'What is a Message Queue?'",                         where: "YouTube → search 'bytebytego message queue'", mins: 15 },
          { type: "YouTube", item: "Hussein Nasser – 'Apache Kafka Crash Course'",                     where: "YouTube → search 'hussein nasser kafka crash course'", mins: 35 },
        ]},
        { label: "Study", focus: "DDIA streams + event patterns", resources: [
          { type: "Book",    item: "DDIA – Ch 11 'Stream Processing'",                                 where: "pp. 439–490 — Kafka internals, exactly-once delivery", mins: 55 },
          { type: "YouTube", item: "ByteByteGo – 'Kafka vs RabbitMQ vs SQS'",                         where: "YouTube → search 'bytebytego kafka rabbitmq'", mins: 15 },
        ]},
        { label: "Build", focus: "Project: Async order processing pipeline", resources: [
          { type: "Docs",    item: "confluent-kafka-python docs",                                      where: "github.com/confluentinc/confluent-kafka-python", mins: 20 },
          { type: "Build",   item: "Order flow: REST API → Kafka producer → Consumer → Email/SMS. Handle retries.", where: "Log processing time per step.", mins: 60 },
        ]},
      ]},
      { n: 20, title: "Rate Limiting & API Gateway", sessions: [
        { label: "Study", focus: "Rate limiting algorithms", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 4 'Design a Rate Limiter'",     where: "pp. 55–80 — token bucket, leaky bucket, sliding window", mins: 40 },
          { type: "YouTube", item: "ByteByteGo – 'Rate Limiting'",                                    where: "YouTube → search 'bytebytego rate limiter'", mins: 15 },
        ]},
        { label: "Study", focus: "API Gateway & GraphQL", resources: [
          { type: "Article", item: "AWS API Gateway overview",                                         where: "aws.amazon.com/api-gateway/features/", mins: 25 },
          { type: "YouTube", item: "Fireship – 'GraphQL in 100 seconds' + full video",                where: "YouTube → search 'fireship graphql'", mins: 20 },
        ]},
        { label: "Build", focus: "Project: Rate limiter middleware", resources: [
          { type: "Build",      item: "FastAPI middleware: token bucket rate limiter using Redis. X-RateLimit-* headers, 429 responses.", where: "Test with locust or wrk.", mins: 60 },
          { type: "Ask Claude", item: "Ask: 'In-process vs distributed rate limiter trade-offs. How does Stripe handle it?'", where: "Real operational complexity discussion", mins: 15 },
        ]},
      ]},
      { n: 21, title: "Security, Auth & API Best Practices", sessions: [
        { label: "Study", focus: "OAuth 2.0 & JWT", resources: [
          { type: "Article", item: "jwt.io – Introduction to JSON Web Tokens",                         where: "jwt.io/introduction — concise and official", mins: 20 },
          { type: "YouTube", item: "Fireship – 'OAuth 2.0 Explained'",                                where: "YouTube → search 'fireship oauth 2.0'", mins: 12 },
        ]},
        { label: "Study", focus: "API security patterns", resources: [
          { type: "Docs",    item: "FastAPI Security – OAuth2 with JWT",                               where: "fastapi.tiangolo.com/tutorial/security/", mins: 35 },
          { type: "Article", item: "OWASP API Security Top 10 (2023)",                                where: "owasp.org/API-Security/editions/2023/en/0x11-t10/", mins: 30 },
        ]},
        { label: "Build", focus: "Add auth to your Blog API", resources: [
          { type: "Build",   item: "Add JWT auth: register, login, refresh tokens, role-based access. Protect endpoints.", where: "Use python-jose + passlib. Write integration tests.", mins: 60 },
        ]},
      ]},
      { n: 22, title: "Networking Deep Dives & Review", sessions: [
        { label: "Study", focus: "TCP/IP, DNS & TLS", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'TCP vs UDP'",                                    where: "YouTube → search 'hussein nasser tcp vs udp'", mins: 25 },
          { type: "YouTube", item: "Hussein Nasser – 'HTTPS, SSL, TLS Explained'",                    where: "YouTube → search 'hussein nasser https ssl tls'", mins: 25 },
        ]},
        { label: "Study", focus: "Proxies, load balancers & DNS", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'Proxy vs Reverse Proxy'",                       where: "YouTube → search 'hussein nasser proxy reverse proxy'", mins: 20 },
          { type: "YouTube", item: "ByteByteGo – 'DNS Explained'",                                    where: "YouTube → search 'bytebytego dns explained'", mins: 15 },
        ]},
        { label: "Build", focus: "Full networking diagram", resources: [
          { type: "Build",      item: "Draw end-to-end: app calls api.twitter.com → DNS → TCP → TLS → HTTP → LB → App → DB", where: "Use Excalidraw. No code — just architecture.", mins: 45 },
          { type: "Ask Claude", item: "Share your diagram. Ask: 'What failure points did I miss?'",   where: "Pressure-test your mental model", mins: 20 },
        ]},
      ]},
    ],
  },
  {
    phase: 5, title: "High-Level Design (HLD)", icon: "🏛️",
    accent: "#D97706", light: "#FDE68A",
    desc: "Design large-scale distributed systems end-to-end",
    weeks: [
      { n: 23, title: "HLD Framework & Estimation", sessions: [
        { label: "Study", focus: "The canonical scale-up story", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 1 'Scale from Zero to Millions'", where: "pp. 1–22", mins: 40 },
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 2 'Back-of-Envelope Estimation'", where: "pp. 23–32 — memorize these numbers", mins: 30 },
        ]},
        { label: "Study", focus: "HLD answer structure", resources: [
          { type: "YouTube", item: "ByteByteGo – 'System Design Interview Framework'",                 where: "YouTube → search 'bytebytego system design framework'", mins: 20 },
          { type: "Article", item: "GitHub: donnemartin/system-design-primer",                         where: "github.com/donnemartin/system-design-primer — bookmark this now", mins: 30 },
        ]},
        { label: "Build", focus: "Estimation practice", resources: [
          { type: "Build",      item: "Estimate for Twitter: DAU, tweets/day, read/write ratio, storage/year, bandwidth.", where: "Aim for order-of-magnitude accuracy.", mins: 40 },
          { type: "Ask Claude", item: "Ask: 'Check my Twitter estimates. Where am I off?'",            where: "Get the standard interviewer numbers", mins: 20 },
        ]},
      ]},
      { n: 24, title: "Load Balancing & Horizontal Scaling", sessions: [
        { label: "Study", focus: "Load balancers deep dive", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'Load Balancing'",                                where: "YouTube → search 'hussein nasser load balancing'", mins: 30 },
          { type: "YouTube", item: "ByteByteGo – 'Cache Systems Every Developer Should Know'",         where: "YouTube → search 'bytebytego cache systems'", mins: 18 },
        ]},
        { label: "Study", focus: "Stateless design", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 1 (stateless web tier section)", where: "Re-read the stateless + data tier sections", mins: 25 },
          { type: "YouTube", item: "ByteByteGo – 'Horizontal vs Vertical Scaling'",                   where: "YouTube → search 'bytebytego horizontal vertical scaling'", mins: 12 },
        ]},
        { label: "Build", focus: "Design: URL Shortener (bit.ly)", resources: [
          { type: "Build",   item: "Design URL shortener on Excalidraw FIRST (45 min) — then read the book chapter", where: "API, ID gen (base62), redirect, analytics, expiry", mins: 45 },
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 8 'Design a URL Shortener'",    where: "pp. 143–162 — read after your own attempt", mins: 35 },
        ]},
      ]},
      { n: 25, title: "Consistent Hashing & Key-Value Stores", sessions: [
        { label: "Study", focus: "Consistent hashing", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 5 'Design Consistent Hashing'", where: "pp. 81–101 — critical HLD building block", mins: 40 },
          { type: "YouTube", item: "ByteByteGo – 'Consistent Hashing Explained'",                     where: "YouTube → search 'bytebytego consistent hashing'", mins: 15 },
        ]},
        { label: "Study", focus: "Distributed key-value stores", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 6 'Design a Key-Value Store'",  where: "pp. 103–130", mins: 45 },
          { type: "Article", item: "AWS DynamoDB architecture blog",                                    where: "aws.amazon.com/blogs → search 'DynamoDB architecture'", mins: 25 },
        ]},
        { label: "Build", focus: "Design: Pastebin", resources: [
          { type: "Build",   item: "Design Pastebin: paste storage (S3 + metadata DB), URL shortening, expiry, CDN", where: "Full Excalidraw diagram.", mins: 50 },
        ]},
      ]},
      { n: 26, title: "Social Media Feed Design", sessions: [
        { label: "Study", focus: "Feed generation strategies", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 11 'Design a News Feed'",       where: "pp. 199–213 — push vs pull vs hybrid, fanout", mins: 40 },
          { type: "YouTube", item: "Gaurav Sen – 'Design Facebook / Twitter News Feed'",               where: "YouTube → search 'gaurav sen news feed design'", mins: 25 },
        ]},
        { label: "Study", focus: "Instagram & Twitter reality", resources: [
          { type: "Blog",    item: "Instagram Engineering – scaling posts",                             where: "instagram-engineering.com — search 'scaling'", mins: 25 },
          { type: "YouTube", item: "ByteByteGo – 'Design Twitter'",                                   where: "YouTube → search 'bytebytego design twitter'", mins: 18 },
        ]},
        { label: "Build", focus: "Design: Twitter/Instagram feed", resources: [
          { type: "Build",   item: "Full design doc + Excalidraw: Twitter feed. Fanout, timeline, caching, media. 45-min timed.", where: "Write a 1-page design doc after.", mins: 60 },
        ]},
      ]},
      { n: 27, title: "Messaging & Chat Systems", sessions: [
        { label: "Study", focus: "Chat system architecture", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 12 'Design a Chat System'",     where: "pp. 215–240", mins: 45 },
          { type: "YouTube", item: "ByteByteGo – 'WhatsApp System Design'",                           where: "YouTube → search 'bytebytego whatsapp system design'", mins: 18 },
        ]},
        { label: "Study", focus: "Engineering at WhatsApp scale", resources: [
          { type: "Blog",    item: "High Scalability – 'WhatsApp Architecture' summary",               where: "highscalability.com — search 'whatsapp'", mins: 25 },
          { type: "YouTube", item: "Gaurav Sen – 'Messenger / WhatsApp system design'",               where: "YouTube → search 'gaurav sen messenger system design'", mins: 25 },
        ]},
        { label: "Build", focus: "Design: WhatsApp / Messenger", resources: [
          { type: "Build",   item: "Design WhatsApp: 1:1 + group, delivery receipts, presence, offline storage. 45-min timed.", where: "Full Excalidraw + 1-page design doc.", mins: 60 },
        ]},
      ]},
      { n: 28, title: "Distributed Transactions & Ride-Sharing", sessions: [
        { label: "Study", focus: "Saga pattern", resources: [
          { type: "Article", item: "Chris Richardson – 'Pattern: Saga' at microservices.io",          where: "microservices.io/patterns/data/saga.html", mins: 30 },
          { type: "YouTube", item: "CodeOpinion – 'Saga Pattern for Microservices'",                  where: "YouTube → search 'codeopinion saga pattern microservices'", mins: 25 },
        ]},
        { label: "Study", focus: "Uber engineering deep dive", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Uber System Design'",                               where: "YouTube → search 'bytebytego uber system design'", mins: 20 },
          { type: "Blog",    item: "Uber Engineering Blog – architecture articles",                    where: "eng.uber.com — search 'domain-oriented microservices'", mins: 25 },
        ]},
        { label: "Build", focus: "Design: Ride-sharing (Uber/Ola)", resources: [
          { type: "Build",   item: "Design Uber: driver matching (geohash), trip tracking, surge pricing, saga payment. 45-min timed.", where: "Use geohash or quadtree for location search.", mins: 60 },
        ]},
      ]},
      { n: 29, title: "Search Systems & Typeahead", sessions: [
        { label: "Study", focus: "Autocomplete & trie structures", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 13 'Design a Search Autocomplete System'", where: "pp. 241–260", mins: 40 },
          { type: "YouTube", item: "Gaurav Sen – 'Typeahead Suggestion System Design'",               where: "YouTube → search 'gaurav sen typeahead suggestion'", mins: 20 },
        ]},
        { label: "Study", focus: "Web crawlers & full-text search", resources: [
          { type: "YouTube", item: "ByteByteGo – 'How does Google Search work?'",                     where: "YouTube → search 'bytebytego google search'", mins: 15 },
          { type: "Book",    item: "System Design Interview Vol 2 – 'Design Google Search' chapter",  where: "Read the web crawler + inverted index sections", mins: 40 },
        ]},
        { label: "Build", focus: "Design: Search Autocomplete", resources: [
          { type: "Build",   item: "Design Google-style typeahead: trie vs DB, aggregation pipeline, caching hot queries. 45-min timed.", where: "Draw keypress → suggestion data flow.", mins: 55 },
        ]},
      ]},
      { n: 30, title: "Video Streaming (YouTube / Netflix)", sessions: [
        { label: "Study", focus: "Video system design", resources: [
          { type: "Book",    item: "System Design Interview Vol 2 – 'Design YouTube'",                 where: "pp. 179–209 — upload, transcoding pipeline, streaming, CDN", mins: 45 },
          { type: "YouTube", item: "ByteByteGo – 'Netflix System Design'",                            where: "YouTube → search 'bytebytego netflix system design'", mins: 18 },
        ]},
        { label: "Study", focus: "Real Netflix engineering", resources: [
          { type: "Blog",    item: "Netflix Tech Blog – video encoding/transcoding",                   where: "netflixtechblog.com — search 'encoding' or 'video pipeline'", mins: 25 },
          { type: "Article", item: "HLS vs DASH adaptive streaming protocols",                         where: "Search 'HLS vs DASH comparison 2024'", mins: 20 },
        ]},
        { label: "Build", focus: "Design: YouTube", resources: [
          { type: "Build",   item: "Design YouTube: upload → async transcoding (Kafka) → CDN → view count → recommendations. 45-min timed.", where: "Focus on the async pipeline.", mins: 60 },
        ]},
      ]},
      { n: 31, title: "Payment Systems & Notifications", sessions: [
        { label: "Study", focus: "Payment system design", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Payment System Design'",                            where: "YouTube → search 'bytebytego payment system design'", mins: 20 },
          { type: "Blog",    item: "Stripe Engineering – 'Idempotency and exactly-once delivery'",    where: "stripe.com/blog → search 'idempotency'", mins: 25 },
        ]},
        { label: "Study", focus: "Notification system at scale", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 10 'Design a Notification System'", where: "pp. 181–198", mins: 35 },
          { type: "YouTube", item: "Gaurav Sen – 'Notification Service Design'",                      where: "YouTube → search 'gaurav sen notification service'", mins: 20 },
        ]},
        { label: "Build", focus: "Design: Payment system", resources: [
          { type: "Build",   item: "Design payment system: idempotency key, double-entry ledger, saga, reconciliation. 45-min timed.", where: "Correctness over speed.", mins: 60 },
        ]},
      ]},
      { n: 32, title: "HLD Mock Interview Gauntlet", sessions: [
        { label: "Practice", focus: "Mock 1: URL Shortener", resources: [
          { type: "Practice", item: "Timed mock: Design bit.ly in 45 min. No notes. Whiteboard only.", where: "Requirements → estimates → components → bottlenecks.", mins: 50 },
          { type: "YouTube",  item: "Watch a system design mock and compare your approach",            where: "YouTube → search 'system design interview URL shortener mock'", mins: 30 },
        ]},
        { label: "Practice", focus: "Mock 2: Twitter or WhatsApp", resources: [
          { type: "Practice", item: "Timed mock: Design Twitter feed OR WhatsApp in 45 min. Record yourself.", where: "Watch it back. Find where you stalled.", mins: 50 },
          { type: "Ask Claude", item: "Ask: 'Critique my WhatsApp design. What would break at 1 billion users?'", where: "Stress-test your design", mins: 20 },
        ]},
        { label: "Practice", focus: "Mock 3: Your weakest system", resources: [
          { type: "Practice", item: "Pick the system you felt weakest on. Redo it cold. No notes.",   where: "Use Pramp.com or ask a friend.", mins: 50 },
          { type: "Build",    item: "Write 'HLD Lessons Learned': top 5 things you do differently now vs Week 23", where: "Review before every interview.", mins: 25 },
        ]},
      ]},
    ],
  },
  {
    phase: 6, title: "Reliability, Observability & DevOps", icon: "🔧",
    accent: "#E11D48", light: "#FDA4AF",
    desc: "Make your systems production-ready",
    weeks: [
      { n: 33, title: "SRE, Error Budgets & Resilience", sessions: [
        { label: "Study", focus: "SRE fundamentals", resources: [
          { type: "Book",    item: "Google SRE Book – Ch 1 + Ch 2 'The Production Environment'",      where: "sre.google/sre-book/ — FREE online.", mins: 45 },
          { type: "Book",    item: "Google SRE Book – Ch 3 'Embracing Risk' + Ch 4 'Service Level Objectives'", where: "SLIs, SLOs, error budgets", mins: 40 },
        ]},
        { label: "Study", focus: "Resilience patterns", resources: [
          { type: "Article", item: "Martin Fowler – 'CircuitBreaker' pattern",                         where: "martinfowler.com/bliki/CircuitBreaker.html", mins: 25 },
          { type: "YouTube", item: "ByteByteGo – 'Resilience Patterns: Retry, Circuit Breaker, Timeout'", where: "YouTube → search 'bytebytego resilience patterns'", mins: 15 },
        ]},
        { label: "Build", focus: "Circuit breaker on your services", resources: [
          { type: "Docs",    item: "pybreaker library (Python circuit breaker)",                       where: "github.com/danielfm/pybreaker", mins: 15 },
          { type: "Build",   item: "Circuit breaker + exponential backoff on Kafka order service. Kill services to watch it open/close.", where: "Simulate failures. Add alerting.", mins: 60 },
        ]},
      ]},
      { n: 34, title: "Observability: Logs, Metrics & Traces", sessions: [
        { label: "Study", focus: "The 3 pillars of observability", resources: [
          { type: "Article", item: "Honeycomb – 'Observability vs Monitoring: What's the Difference?'", where: "honeycomb.io/blog — search 'observability vs monitoring'", mins: 20 },
          { type: "YouTube", item: "ByteByteGo – 'Logging, Metrics, Tracing Explained'",              where: "YouTube → search 'bytebytego logging metrics tracing'", mins: 15 },
        ]},
        { label: "Study", focus: "OpenTelemetry + Prometheus", resources: [
          { type: "Docs",    item: "OpenTelemetry Python – Getting Started",                           where: "opentelemetry.io/docs/languages/python/getting-started/", mins: 35 },
          { type: "YouTube", item: "TechWorld with Nana – 'Prometheus and Grafana Tutorial'",          where: "YouTube → search 'nana prometheus grafana tutorial'", mins: 35 },
        ]},
        { label: "Build", focus: "Full observability on chat service", resources: [
          { type: "Build",   item: "Add: structlog JSON logging, Prometheus metrics, OpenTelemetry traces, Grafana dashboard via docker-compose.", where: "See your own system in a real dashboard!", mins: 60 },
        ]},
      ]},
      { n: 35, title: "Docker & Containerization", sessions: [
        { label: "Study", focus: "Docker fundamentals", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'Docker Tutorial for Beginners'",           where: "YouTube → search 'nana docker tutorial beginners'", mins: 50 },
          { type: "Docs",    item: "Docker – Getting Started guide",                                   where: "docs.docker.com/get-started/", mins: 25 },
        ]},
        { label: "Study", focus: "Docker Compose", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'Docker Compose Tutorial'",                 where: "YouTube → search 'nana docker compose tutorial'", mins: 30 },
          { type: "Docs",    item: "Docker Compose – getting started",                                where: "docs.docker.com/compose/gettingstarted/", mins: 20 },
        ]},
        { label: "Build", focus: "Containerize your Blog API", resources: [
          { type: "Build",   item: "Dockerize Blog API: multi-stage Dockerfile, docker-compose (PostgreSQL + Redis + API), health checks.", where: "Teach yourself the full container lifecycle.", mins: 60 },
        ]},
      ]},
      { n: 36, title: "Kubernetes & CI/CD", sessions: [
        { label: "Study", focus: "Kubernetes core concepts", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'Kubernetes Tutorial for Beginners'",       where: "YouTube → search 'nana kubernetes tutorial beginners'", mins: 50 },
          { type: "Docs",    item: "Kubernetes – Getting started with minikube",                      where: "kubernetes.io/docs/tutorials/hello-minikube/", mins: 30 },
        ]},
        { label: "Study", focus: "CI/CD pipeline design", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'CI/CD Pipeline with GitHub Actions'",     where: "YouTube → search 'nana github actions ci cd'", mins: 30 },
          { type: "Article", item: "Google Cloud – 'DevOps: Continuous Delivery'",                    where: "cloud.google.com/architecture/devops/devops-tech-continuous-delivery", mins: 20 },
        ]},
        { label: "Build", focus: "Deploy to cloud with CI/CD", resources: [
          { type: "Build",   item: "Deploy Blog API: Dockerize → registry → Railway/Render/Fly.io → GitHub Actions CI on every push.", where: "Teaches the full deployment lifecycle.", mins: 60 },
        ]},
      ]},
    ],
  },
  {
    phase: 7, title: "Interview Prep & Capstone", icon: "🎓",
    accent: "#16A34A", light: "#86EFAC",
    desc: "Mock interviews, capstone project, and portfolio",
    weeks: [
      { n: 37, title: "LLD Mock Interviews & Review", sessions: [
        { label: "Practice", focus: "Mock LLD 1 & 2", resources: [
          { type: "Practice", item: "Timed LLD mock: Parking Lot, 40 min. No notes. Speak aloud.",    where: "Draw on paper or Excalidraw.", mins: 45 },
          { type: "Platform", item: "Schedule a Pramp interview (free peer system design interviews)", where: "pramp.com — free, matches you with another engineer", mins: 60 },
        ]},
        { label: "Practice", focus: "Claude as your interviewer", resources: [
          { type: "Ask Claude", item: "Ask: 'Interview me on designing a ride-sharing LLD. Start simple, add complexity. Push back.'", where: "Ask for scoring after.", mins: 40 },
          { type: "Build",     item: "Write 'My LLD Playbook': 2-page cheat sheet of patterns you reach for first", where: "Your mental checklist for every future problem.", mins: 35 },
        ]},
        { label: "Review", focus: "Gap analysis", resources: [
          { type: "Build",   item: "Re-read all your LLD design docs from Phase 2. Annotate what you'd change now.", where: "You'll see how much your thinking has evolved.", mins: 45 },
        ]},
      ]},
      { n: 38, title: "HLD Mock Interviews", sessions: [
        { label: "Practice", focus: "Mock HLD 1 & 2", resources: [
          { type: "Platform", item: "interviewing.io – schedule a free mock with an engineer",         where: "interviewing.io — real feedback from FAANG engineers", mins: 60 },
          { type: "Practice", item: "Timed mock: Design YouTube in 45 min. Record on camera. Watch back.", where: "Ask: 'What degrades gracefully?'", mins: 50 },
        ]},
        { label: "Practice", focus: "Mock HLD 3 + gap identification", resources: [
          { type: "Practice", item: "Timed mock: Your weakest HLD system, cold. No notes.",           where: "Real interview conditions. Strict timing.", mins: 50 },
          { type: "Ask Claude", item: "Tell Claude your top 3 HLD weaknesses. Ask for 5 tough follow-up questions for each.", where: "The hardest interview prep drill you can do", mins: 30 },
        ]},
        { label: "Review", focus: "Final consolidation", resources: [
          { type: "Build",   item: "Re-read ALL design docs from Phase 5. Annotate what you'd change now.", where: "Fastest way to close remaining gaps.", mins: 60 },
        ]},
      ]},
      { n: 39, title: "Capstone: Mini Twitter Clone", sessions: [
        { label: "Build", focus: "Architecture doc + foundation", resources: [
          { type: "Build",   item: "Write 1-page architecture doc BEFORE writing any code: components, data models, API contracts.", where: "No shortcuts — this discipline separates great engineers.", mins: 45 },
          { type: "Build",   item: "Set up: FastAPI + PostgreSQL + Redis + Kafka in docker-compose. Schema + migrations working.", where: "Get the plumbing right first.", mins: 60 },
        ]},
        { label: "Build", focus: "Core services", resources: [
          { type: "Build",   item: "User service (JWT auth) + Tweet service + Follow service. Apply all your LLD patterns.", where: "Separation of concerns throughout.", mins: 60 },
        ]},
        { label: "Build", focus: "Feed + notifications + observability", resources: [
          { type: "Build",   item: "Feed (fan-out via Redis) + Kafka notifications + Prometheus metrics + Grafana dashboard.", where: "HLD + LLD + observability all converge here.", mins: 60 },
        ]},
      ]},
      { n: 40, title: "Deploy, Portfolio & Celebration 🎉", sessions: [
        { label: "Build", focus: "Deploy + portfolio docs", resources: [
          { type: "Build",   item: "Deploy to cloud with CI/CD. README with Excalidraw architecture diagram.", where: "What you show in interviews and to the world.", mins: 60 },
          { type: "Build",   item: "Record a 10-min Loom video: architecture decisions, trade-offs, what you'd change at 10x scale.", where: "loom.com — free. Link in GitHub and LinkedIn.", mins: 30 },
        ]},
        { label: "Build", focus: "Community + reflection", resources: [
          { type: "Build",      item: "Write a LinkedIn post: your 9-month journey. Key lessons + what you built.", where: "Tag #systemdesign #python #softwarearchitecture", mins: 30 },
          { type: "Ask Claude", item: "Full mock: LLD (30 min) + HLD (45 min) back to back. Ask for 1–10 scoring per dimension.", where: "The ultimate stress test. You've earned this.", mins: 75 },
        ]},
        { label: "Review", focus: "The meta-level view", resources: [
          { type: "Ask Claude", item: "Ask: 'What are the most common mistakes senior engineers make in system design?'", where: "The final boss question. You're ready for it.", mins: 30 },
        ]},
      ]},
    ],
  },
];

export const allWeeks = roadmap.flatMap(p =>
  p.weeks.map(w => ({ ...w, phase: p.phase, accent: p.accent, light: p.light }))
);

export const resId = (phase, weekN, si, ri) => `${phase}_${weekN}_${si}_${ri}`;

export const sessionColors = (label) => {
  if (label.startsWith("Build"))  return { color: "#c4b5fd", bg: "#1a0a3b", border: "#3b1f7b" };
  if (label === "Practice")       return { color: "#f9a8d4", bg: "#3b0f1a", border: "#7f1d3b" };
  if (label === "Review")         return { color: "#fde68a", bg: "#2a1f00", border: "#78350f" };
  return                                 { color: "#6ee7b7", bg: "#0f2a18", border: "#1a4d2e" };
};

export const getPhaseStats = (p, completed) => {
  let total = 0, done = 0;
  p.weeks.forEach(w => {
    w.sessions.forEach((s, si) => {
      s.resources.forEach((_, ri) => {
        total++;
        if (completed.has(resId(p.phase, w.n, si, ri))) done++;
      });
    });
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
};
