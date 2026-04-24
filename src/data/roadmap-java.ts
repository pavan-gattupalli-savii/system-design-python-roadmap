import type { Phase } from "./models";

// Java roadmap — 54 weeks, 9 phases.
// Phase 2 = dedicated LLD (SOLID + all patterns + practice).
// Phase 6 = dedicated HLD case studies (URL shortener → YouTube → Uber).
export const javaRoadmap: Phase[] = [
  {
    phase: 1, title: "Java Core & OOP Mastery", icon: "☕",
    accent: "#d97706", light: "#fcd34d",
    desc: "Master modern Java 21 — generics, streams, concurrency, JVM internals, and clean collection usage",
    weeks: [
      { n: 1, title: "Generics, Records & Modern Java Features", sessions: [
        { label: "Study", focus: "Generics & type bounds", resources: [
          { type: "Book",    item: "Effective Java 3e – Items 26–33 (Generics chapter)", where: "~80 pages — wildcards, PECS, type tokens. The best Java book by far.", mins: 75 },
          { type: "YouTube", item: "Coding with John – 'Generics in Java'", where: "YouTube → search 'Coding with John Java generics'", mins: 22 },
        ]},
        { label: "Study", focus: "Records, Sealed Classes & Pattern Matching (Java 17–21)", resources: [
          { type: "Docs",    item: "JEP 395 Records · JEP 409 Sealed Classes · JEP 441 Pattern Matching for switch", where: "openjdk.org/jeps/395", mins: 45 },
          { type: "Article", item: "Baeldung – 'New Features in Java 21'", where: "baeldung.com/java-21-new-features", mins: 30 },
        ]},
        { label: "Build", focus: "Typed Domain Model", resources: [
          { type: "Build",   item: "Domain model with Records (immutable value types), Sealed class hierarchies (Result<T>), and a generic Repository<T, ID>", where: "Use JDK 21. Add pattern-matching switch on the sealed hierarchy. Ask Claude to review!", mins: 75 },
        ]},
      ]},
      { n: 2, title: "Lambdas, Streams & Functional Programming", sessions: [
        { label: "Study", focus: "Functional interfaces & lambdas", resources: [
          { type: "Book",    item: "Effective Java 3e – Items 42–48 (Lambdas & Streams)", where: "~50 pages — prefer lambdas, use streams judiciously, method references", mins: 60 },
          { type: "YouTube", item: "Amigoscode – 'Java Functional Programming Full Course'", where: "YouTube → search 'Amigoscode Java functional programming'", mins: 60 },
        ]},
        { label: "Study", focus: "Stream API — intermediate & terminal operations, Collectors", resources: [
          { type: "Docs",    item: "java.util.stream package — Stream, Collectors, Optional (Java 21 docs)", where: "docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html", mins: 45 },
          { type: "Article", item: "Baeldung – 'Java 8 Streams Guide'", where: "baeldung.com/java-8-streams", mins: 30 },
        ]},
        { label: "Build", focus: "Data processing pipeline", resources: [
          { type: "Build",   item: "CSV → Stream filter → groupingBy → aggregate stats → formatted report. No external libs, pure Streams + Collectors.", where: "Compare with imperative loops (lines of code, readability). Ask Claude!", mins: 60 },
        ]},
      ]},
      { n: 3, title: "Concurrency — Threads, Executors & Locks", sessions: [
        { label: "Study", focus: "Thread model & java.util.concurrent fundamentals", resources: [
          { type: "Book",    item: "Java Concurrency in Practice – Ch 1–6 (Fundamentals)", where: "~120 pages — Goetz et al. The definitive Java concurrency reference.", mins: 120 },
          { type: "YouTube", item: "Java Brains – 'Java Concurrency' playlist", where: "YouTube → search 'Java Brains concurrency'", mins: 60 },
        ]},
        { label: "Study", focus: "ExecutorService, ThreadPoolExecutor & BlockingQueue", resources: [
          { type: "Docs",    item: "java.util.concurrent — Executor, Future, BlockingQueue, ScheduledExecutorService", where: "docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html", mins: 40 },
          { type: "Article", item: "Baeldung – 'Java ExecutorService Guide'", where: "baeldung.com/java-executor-service-tutorial", mins: 30 },
        ]},
        { label: "Build", focus: "Thread-safe producer-consumer", resources: [
          { type: "Build",   item: "Fixed thread pool producers + consumers + LinkedBlockingQueue + poison-pill graceful shutdown + AtomicLong stats counter", where: "Avoid raw Thread where possible. Ask Claude to spot race conditions!", mins: 90 },
        ]},
      ]},
      { n: 4, title: "CompletableFuture & Virtual Threads (Java 21)", sessions: [
        { label: "Study", focus: "CompletableFuture — async composition", resources: [
          { type: "Article", item: "Baeldung – 'Guide to CompletableFuture'", where: "baeldung.com/java-completablefuture", mins: 50 },
          { type: "YouTube", item: "Marco Codes – 'CompletableFuture in Practice'", where: "YouTube → search 'Marco Codes CompletableFuture'", mins: 35 },
        ]},
        { label: "Study", focus: "Project Loom — Virtual Threads (JEP 444)", resources: [
          { type: "Docs",    item: "JEP 444 Virtual Threads — motivation, API, structured concurrency", where: "openjdk.org/jeps/444", mins: 45 },
          { type: "Article", item: "Baeldung – 'Java Virtual Threads'", where: "baeldung.com/java-virtual-thread-vs-thread", mins: 30 },
        ]},
        { label: "Build", focus: "Async HTTP aggregator", resources: [
          { type: "Build",   item: "Call 3 external APIs in parallel with CompletableFuture.allOf(), handle timeouts/failures, merge results. Rewrite with virtual threads. Compare throughput.", where: "Use Java 21 HttpClient. Ask Claude about structured concurrency!", mins: 75 },
        ]},
      ]},
      { n: 5, title: "JVM Internals, GC & Performance", sessions: [
        { label: "Study", focus: "JVM memory model & GC algorithms", resources: [
          { type: "YouTube", item: "Java Brains – 'JVM Internals' series", where: "YouTube → search 'Java Brains JVM internals'", mins: 75 },
          { type: "Article", item: "Baeldung – 'JVM Garbage Collectors Guide'", where: "baeldung.com/jvm-garbage-collectors", mins: 45 },
        ]},
        { label: "Study", focus: "JMH microbenchmarks & JFR profiling", resources: [
          { type: "Article", item: "Baeldung – 'Microbenchmarking with JMH'", where: "baeldung.com/java-microbenchmark-harness", mins: 40 },
          { type: "Docs",    item: "Java Flight Recorder & Mission Control — official guide", where: "docs.oracle.com/en/java/java-components/jdk-mission-control/", mins: 35 },
        ]},
        { label: "Practice", focus: "Heap analysis & GC tuning", resources: [
          { type: "Practice", item: "Generate heap dump with -XX:+HeapDumpOnOutOfMemoryError, analyse with Eclipse MAT, identify a memory leak, fix it, verify with -Xmx + -verbose:gc", where: "Compare G1GC vs ZGC pause times. Ask Claude to explain GC logs!", mins: 90 },
        ]},
      ]},
      { n: 6, title: "Java Collections, Algorithms & Clean Code", sessions: [
        { label: "Study", focus: "Collections deep dive — PriorityQueue, TreeMap, ArrayDeque", resources: [
          { type: "Book",    item: "Effective Java 3e – Items 49–56 (Methods) & Items 57–68 (General programming)", where: "Clean code idioms, collection usage, loop optimization — essential Java style guide", mins: 60 },
          { type: "Article", item: "Baeldung – 'Java Collections Interview Questions'", where: "baeldung.com/java-collections-interview-questions — understand internal implementations", mins: 35 },
        ]},
        { label: "Study", focus: "Comparable, Comparator & custom sorting", resources: [
          { type: "Article", item: "Baeldung – 'Java Comparator and Comparable'", where: "baeldung.com/java-comparator-comparable", mins: 25 },
          { type: "Ask Claude", item: "Ask Claude: when do you use TreeMap vs HashMap vs LinkedHashMap? Design a real scenario that requires each.", where: "Ask for time/space trade-offs for each scenario", mins: 25 },
        ]},
        { label: "Build", focus: "Classic interview problems with Java collections", resources: [
          { type: "Build",   item: "Implement: LRU Cache (LinkedHashMap), Top-K Frequent (PriorityQueue), Sliding Window Max (ArrayDeque), Interval Merge (TreeMap). Java 21 style.", where: "Write proper unit tests. This is also interview preparation!", mins: 90 },
        ]},
      ]},
    ],
  },
  {
    phase: 2, title: "Low-Level Design (LLD) with Java", icon: "🧩",
    accent: "#7c3aed", light: "#c4b5fd",
    desc: "SOLID principles, all major design patterns in Java, and hands-on LLD interview problems",
    weeks: [
      { n: 7, title: "SOLID Principles in Java", sessions: [
        { label: "Study", focus: "SRP, OCP & LSP in Java", resources: [
          { type: "Blog",    item: "refactoring.guru – SOLID principles with Java examples (SRP, OCP, LSP sections)", where: "refactoring.guru/solid — read all 5 sections in order", mins: 45 },
          { type: "Book",    item: "Effective Java 3e – Items 15–22 (Classes & Interfaces)", where: "pp. 93–135 — minimize accessibility, prefer composition over inheritance, Liskov in practice", mins: 60 },
        ]},
        { label: "Study", focus: "ISP & DIP — interface design and dependency inversion", resources: [
          { type: "Blog",    item: "refactoring.guru – ISP + DIP with Java examples", where: "refactoring.guru/solid — last two sections. Focus on coding examples.", mins: 30 },
          { type: "YouTube", item: "CodeAesthetic – 'Why You Shouldn't Nest Your Code' (clean code principles)", where: "YouTube → search 'CodeAesthetic shouldn't nest code'", mins: 12 },
        ]},
        { label: "Build", focus: "Refactor a God-class order handler to SOLID", resources: [
          { type: "Build",   item: "Take a 300-line Java God-class OrderProcessor and refactor: SRP splits it, OCP adds new order types without edits, DIP injects PaymentGateway and Notifier", where: "Before/after comparison. Document every SOLID violation fixed.", mins: 75 },
          { type: "Ask Claude", item: "Paste your refactored code. Ask: 'What SOLID violations did I miss? What would break when adding a new order type?'", where: "Use Claude as your senior Java reviewer", mins: 20 },
        ]},
      ]},
      { n: 8, title: "Creational Design Patterns in Java", sessions: [
        { label: "Study", focus: "Factory Method & Abstract Factory", resources: [
          { type: "Blog",    item: "refactoring.guru – Factory Method + Abstract Factory with Java examples", where: "refactoring.guru/design-patterns/factory-method — full Java code provided", mins: 40 },
          { type: "Book",    item: "Effective Java 3e – Item 1 'Consider static factory methods over constructors'", where: "pp. 5–16 — why Java prefers static factories. Named constructors pattern.", mins: 30 },
        ]},
        { label: "Study", focus: "Builder & Singleton", resources: [
          { type: "Book",    item: "Effective Java 3e – Item 2 'Builder' + Item 3 'Singleton with enum'", where: "pp. 11–24 — the definitive Java Builder pattern. Enum Singleton is thread-safe.", mins: 40 },
          { type: "Blog",    item: "refactoring.guru – Builder + Prototype with Java", where: "refactoring.guru/design-patterns/builder — step-builder variant for fluent APIs", mins: 25 },
        ]},
        { label: "Build", focus: "Notification system with creational patterns", resources: [
          { type: "Build",   item: "NotificationFactory (Abstract Factory for Email/SMS/Push), Builder for NotificationConfig (retries, priority, template), Strategy for channel routing", where: "All in Java 21. Use Records for immutable config. Ask Claude to review!", mins: 90 },
        ]},
      ]},
      { n: 9, title: "Structural Design Patterns in Java", sessions: [
        { label: "Study", focus: "Adapter & Decorator — Java IO as the real-world example", resources: [
          { type: "Blog",    item: "refactoring.guru – Adapter + Decorator with Java examples", where: "refactoring.guru/design-patterns/adapter — note that Java IO streams ARE the Decorator pattern", mins: 40 },
          { type: "YouTube", item: "Derek Banas – 'Adapter + Decorator Pattern Java'", where: "YouTube → search 'Derek Banas adapter decorator Java'", mins: 30 },
        ]},
        { label: "Study", focus: "Proxy (JDK Dynamic Proxy) & Facade", resources: [
          { type: "Blog",    item: "refactoring.guru – Proxy + Facade with Java examples", where: "refactoring.guru/design-patterns/proxy — includes JDK dynamic proxy example", mins: 35 },
          { type: "Article", item: "Baeldung – 'Dynamic Proxies in Java'", where: "baeldung.com/java-dynamic-proxies — how Spring AOP is implemented under the hood", mins: 30 },
        ]},
        { label: "Build", focus: "Caching proxy + logging decorator + payment facade", resources: [
          { type: "Build",   item: "JDK Dynamic Proxy for caching repository calls. Logging decorator with @FunctionalInterface interceptor. PaymentFacade hiding Stripe+PayPal+Braintree complexity.", where: "Test: kill one payment provider — facade falls back transparently. Ask Claude!", mins: 90 },
        ]},
      ]},
      { n: 10, title: "Behavioral Design Patterns in Java", sessions: [
        { label: "Study", focus: "Strategy & Observer", resources: [
          { type: "Blog",    item: "refactoring.guru – Strategy + Observer with Java examples", where: "refactoring.guru/design-patterns/strategy — Observer pattern underpins Java event listeners", mins: 40 },
          { type: "YouTube", item: "Derek Banas – 'Observer + Strategy Pattern Java'", where: "YouTube → search 'Derek Banas observer strategy Java'", mins: 30 },
        ]},
        { label: "Study", focus: "Command, State & Template Method", resources: [
          { type: "Blog",    item: "refactoring.guru – Command + State + Template Method with Java", where: "refactoring.guru/design-patterns/command — Template Method is heavily used in Spring (JdbcTemplate, RestTemplate)", mins: 45 },
          { type: "Ask Claude", item: "Ask Claude: 'In Spring Boot, which design patterns does the framework use internally? Name 5 with code examples.'", where: "Connecting patterns to real framework code = interviewer gold", mins: 20 },
        ]},
        { label: "Build", focus: "Order State Machine with patterns", resources: [
          { type: "Build",   item: "Order state machine: State pattern (CREATED→PAID→SHIPPED→DELIVERED→CANCELLED), Observer notifies Email/SMS on each transition, Command for undo/redo support", where: "Java 21 sealed classes work beautifully for state enums. Ask Claude to review!", mins: 90 },
        ]},
      ]},
      { n: 11, title: "LLD Practice — Parking Lot & Library System", sessions: [
        { label: "Study + Build", focus: "Parking Lot System", resources: [
          { type: "YouTube", item: "Search: 'parking lot system design LLD Java' — pick a top result", where: "YouTube — watch one walkthrough for approach ideas", mins: 30 },
          { type: "Build",   item: "Parking Lot: ParkingLot, Level, Spot (enum: COMPACT/LARGE/MOTORCYCLE), Ticket, ParkingStrategy, FeeCalculator (hourly vs flat). State for spot availability.", where: "Full unit tests. Handle: multi-level, handicapped spots, multiple entry gates.", mins: 90 },
        ]},
        { label: "Build", focus: "Library Management System", resources: [
          { type: "Ask Claude", item: "Ask Claude: 'Interview me on Library Management System LLD in Java. Start with requirements, push back on my classes.'", where: "Use Claude as your design interviewer before coding", mins: 30 },
          { type: "Build",   item: "Library: Book, Member (Standard/Premium), Loan, Reservation, FineCalculator, Observer for due-date alerts. Builder for Member registration.", where: "Full type hints & interfaces. Ask Claude to review for missed edge cases!", mins: 75 },
        ]},
      ]},
      { n: 12, title: "LLD Practice — ATM Machine & Design Docs", sessions: [
        { label: "Build", focus: "ATM Machine System", resources: [
          { type: "Ask Claude", item: "Ask Claude: 'Walk me through designing an ATM Machine in Java. What states and edge cases matter most?'", where: "Use Claude as your interviewer — ask for follow-up questions", mins: 30 },
          { type: "Build",   item: "ATM: Card, Account, Transaction, ATM, State pattern (IDLE→CARD_INSERTED→PIN_ENTERED→AMOUNT_SELECTED→DISPENSING), CashDispenser strategy", where: "Handle: wrong PIN 3x → card capture, insufficient funds, network timeout.", mins: 90 },
        ]},
        { label: "Study", focus: "How to write a design document", resources: [
          { type: "Blog",    item: "Gergely Orosz – 'How to Write a Good Design Document'", where: "blog.pragmaticengineer.com or search 'Gergely Orosz design document'", mins: 25 },
          { type: "Article", item: "Google Design Doc format — one-pager template", where: "Search 'Google design doc template one-pager'", mins: 20 },
        ]},
        { label: "Build", focus: "Document all your LLD systems", resources: [
          { type: "Build",      item: "Write 1-page design doc for each LLD project (Parking Lot, Library, ATM): Problem → Key classes → Patterns used → Trade-offs → What breaks at scale", where: "4 docs total. This is what you show in interviews.", mins: 60 },
          { type: "Ask Claude", item: "Paste your Parking Lot design doc. Ask: 'What edge cases am I missing? What changes at 100 floors and 10,000 spots?'", where: "Scale pressure reveals design weaknesses", mins: 20 },
        ]},
      ]},
    ],
  },
  {
    phase: 3, title: "Spring Boot & Enterprise Java", icon: "🌿",
    accent: "#16a34a", light: "#86efac",
    desc: "Build production-grade REST APIs and enterprise services with Spring Boot 3",
    weeks: [
      { n: 13, title: "Spring Boot Fundamentals & Dependency Injection", sessions: [
        { label: "Study", focus: "Spring IoC container, bean lifecycle & @Component hierarchy", resources: [
          { type: "Docs",    item: "Spring Framework – 'Core: IoC Container' reference", where: "docs.spring.io/spring-framework/reference/core/beans.html", mins: 55 },
          { type: "YouTube", item: "Amigoscode – 'Spring Boot 3 Tutorial for Beginners'", where: "YouTube → search 'Amigoscode Spring Boot 3 tutorial'", mins: 90 },
        ]},
        { label: "Study", focus: "Auto-configuration, starters, profiles & Actuator", resources: [
          { type: "Docs",    item: "Spring Boot – 'Auto-configuration' & 'Externalized Configuration'", where: "docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html", mins: 45 },
          { type: "Article", item: "Baeldung – 'Spring Boot Auto-Configuration'", where: "baeldung.com/spring-boot-auto-configuration", mins: 25 },
        ]},
        { label: "Build", focus: "Spring Boot skeleton", resources: [
          { type: "Build",   item: "Bootstrap Spring Boot 3.x: multiple bean scopes, @Configuration, @Profile dev/prod, Actuator health + info + metrics endpoints", where: "Use start.spring.io. Ask Claude about @Conditional and bean ordering!", mins: 75 },
        ]},
      ]},
      { n: 14, title: "Spring MVC & REST API Design", sessions: [
        { label: "Study", focus: "@RestController, Bean Validation & exception handling", resources: [
          { type: "Docs",    item: "Spring Web MVC – @RequestMapping, @RestController, @ControllerAdvice, HandlerExceptionResolver", where: "docs.spring.io/spring-framework/reference/web/webmvc.html", mins: 50 },
          { type: "Article", item: "Baeldung – 'Error Handling for REST with Spring'", where: "baeldung.com/exception-handling-for-rest-with-spring", mins: 30 },
        ]},
        { label: "Study", focus: "OpenAPI/Swagger docs & API versioning", resources: [
          { type: "Docs",    item: "Springdoc OpenAPI 3 — integration with Spring Boot 3", where: "springdoc.org", mins: 30 },
          { type: "Article", item: "Baeldung – 'REST API Versioning with Spring'", where: "baeldung.com/rest-versioning", mins: 25 },
        ]},
        { label: "Build", focus: "Product catalog REST API", resources: [
          { type: "Build",   item: "CRUD REST API: Bean Validation on DTOs, @ControllerAdvice with RFC 7807 Problem JSON, Springdoc UI, pagination with Pageable", where: "Ask Claude to review the API contract — naming, status codes, pagination shape!", mins: 90 },
        ]},
      ]},
      { n: 15, title: "Spring Data JPA & Hibernate", sessions: [
        { label: "Study", focus: "JPA entities, relationships, JPQL & projections", resources: [
          { type: "Docs",    item: "Spring Data JPA – repositories, @Query, projections, Specifications, pagination", where: "docs.spring.io/spring-data/jpa/reference/", mins: 50 },
          { type: "YouTube", item: "Amigoscode – 'Spring Data JPA Tutorial'", where: "YouTube → search 'Amigoscode Spring Data JPA'", mins: 60 },
        ]},
        { label: "Study", focus: "N+1 problem, FetchType & EntityGraph", resources: [
          { type: "Blog",    item: "Vlad Mihalcea – 'How to detect and fix the N+1 query problem'", where: "vladmihalcea.com/n-plus-1-query-problem/", mins: 45 },
          { type: "Article", item: "Baeldung – 'JPA Entity Graphs'", where: "baeldung.com/jpa-entity-graph", mins: 25 },
        ]},
        { label: "Build", focus: "E-commerce data model", resources: [
          { type: "Build",   item: "JPA model: User → Order → OrderItem → Product, bi-directional lazy loading, @EntityGraph on repo, zero N+1 verified with Hibernate statistics", where: "Enable spring.jpa.properties.hibernate.generate_statistics=true. Ask Claude to review cascade settings!", mins: 90 },
        ]},
      ]},
      { n: 16, title: "Spring Security & JWT Authentication", sessions: [
        { label: "Study", focus: "Spring Security filter chain & authentication flow", resources: [
          { type: "Docs",    item: "Spring Security – architecture, filters, DelegatingFilterProxy, SecurityFilterChain", where: "docs.spring.io/spring-security/reference/servlet/architecture.html", mins: 55 },
          { type: "YouTube", item: "Amigoscode – 'Spring Boot 3 + Spring Security 6 + JWT'", where: "YouTube → search 'Amigoscode Spring Security 6 JWT'", mins: 90 },
        ]},
        { label: "Study", focus: "OAuth2 resource server & method-level security", resources: [
          { type: "Docs",    item: "Spring Security – OAuth2 Resource Server configuration", where: "docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/", mins: 40 },
          { type: "Article", item: "Baeldung – 'Spring Security @PreAuthorize and @PostAuthorize'", where: "baeldung.com/spring-security-preauthorize", mins: 25 },
        ]},
        { label: "Build", focus: "Secure the product API with JWT", resources: [
          { type: "Build",   item: "Add JWT auth: UserDetailsService, JwtAuthFilter, /auth/login endpoint, role-based @PreAuthorize, refresh token with rotation", where: "Use jjwt library. Ask Claude about token expiry, refresh strategy, and CSRF!", mins: 90 },
        ]},
      ]},
      { n: 17, title: "Testing — JUnit 5, Mockito & Testcontainers", sessions: [
        { label: "Study", focus: "JUnit 5 & Mockito", resources: [
          { type: "Docs",    item: "JUnit 5 User Guide – @Test, @ParameterizedTest, @ExtendWith, lifecycle annotations", where: "junit.org/junit5/docs/current/user-guide/", mins: 45 },
          { type: "YouTube", item: "Amigoscode – 'Spring Boot Testing Tutorial'", where: "YouTube → search 'Amigoscode Spring Boot testing Mockito'", mins: 60 },
        ]},
        { label: "Study", focus: "Testcontainers for integration testing", resources: [
          { type: "Docs",    item: "Testcontainers Java – Spring Boot integration, @Testcontainers, @Container", where: "java.testcontainers.org/frameworks/spring_boot/", mins: 35 },
          { type: "Article", item: "Baeldung – 'Testing with Testcontainers'", where: "baeldung.com/spring-boot-testcontainers-integration-test", mins: 25 },
        ]},
        { label: "Build", focus: "Full test suite for product API", resources: [
          { type: "Build",   item: "Unit tests with Mockito, @WebMvcTest slice tests, full integration test with Testcontainers Postgres — aim for 80%+ Jacoco coverage", where: "Run with mvn verify. Ask Claude to review test quality and boundary cases!", mins: 90 },
        ]},
      ]},
      { n: 18, title: "Build Tools, Gradle & CI/CD Basics", sessions: [
        { label: "Study", focus: "Maven lifecycle & dependency management", resources: [
          { type: "Docs",    item: "Maven – Build Lifecycle, POM reference, dependency scopes, plugins", where: "maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html", mins: 40 },
          { type: "YouTube", item: "Daily Code Buffer – 'Maven Tutorial for Beginners'", where: "YouTube → search 'Daily Code Buffer Maven tutorial'", mins: 40 },
        ]},
        { label: "Study", focus: "GitHub Actions CI for Java", resources: [
          { type: "Docs",    item: "GitHub Actions – 'Building and testing Java with Maven'", where: "docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-java-with-maven", mins: 35 },
          { type: "Article", item: "Baeldung – 'Jacoco code coverage in Maven'", where: "baeldung.com/jacoco", mins: 20 },
        ]},
        { label: "Build", focus: "Full CI pipeline", resources: [
          { type: "Build",   item: "GitHub Actions: checkout → compile → test → Jacoco (fail < 80%) → Docker build/push to GHCR → deploy notification on merge to main", where: "Add branch protection requiring green CI. Ask Claude for the workflow YAML!", mins: 90 },
        ]},
      ]},
    ],
  },
  {
    phase: 4, title: "Databases & Data Layer", icon: "🗄️",
    accent: "#0891b2", light: "#67e8f9",
    desc: "SQL mastery, JPA performance, NoSQL with Java, Redis caching, and Flyway migrations",
    weeks: [
      { n: 19, title: "SQL Mastery & JDBC", sessions: [
        { label: "Study", focus: "Advanced SQL — CTEs, window functions, indexes", resources: [
          { type: "Blog",    item: "Use The Index, Luke – 'Execution Plans & Index Basics'", where: "use-the-index-luke.com/sql/explain-plan", mins: 50 },
          { type: "Platform", item: "SQLZoo – window functions exercises (RANK, PARTITION, LAG/LEAD)", where: "sqlzoo.net", mins: 45 },
        ]},
        { label: "Study", focus: "JDBC API & HikariCP connection pooling", resources: [
          { type: "Docs",    item: "HikariCP – configuration properties, pool sizing formula", where: "github.com/brettwooldridge/HikariCP#configuration-knobs-baby", mins: 30 },
          { type: "Article", item: "Baeldung – 'Introduction to HikariCP'", where: "baeldung.com/hikaricp", mins: 25 },
        ]},
        { label: "Practice", focus: "Complex query workout", resources: [
          { type: "Practice", item: "10 window function problems on a sample e-commerce DB: running total orders, rank customers by revenue, YoY growth per category using CTEs", where: "Use PostgreSQL locally. Ask Claude to explain the execution plan!", mins: 90 },
        ]},
      ]},
      { n: 20, title: "Hibernate Deep Dive & Query Optimization", sessions: [
        { label: "Study", focus: "Hibernate internals — session, first/second-level cache, stats", resources: [
          { type: "Blog",    item: "Vlad Mihalcea – 'Hibernate Performance Tuning Tips'", where: "vladmihalcea.com/hibernate-performance-tuning-tips/", mins: 60 },
          { type: "Article", item: "Baeldung – 'Hibernate Second-Level Cache with Ehcache'", where: "baeldung.com/hibernate-second-level-cache", mins: 35 },
        ]},
        { label: "Study", focus: "@BatchSize, @FetchMode & bulk operations", resources: [
          { type: "Article", item: "Baeldung – 'Hibernate @BatchSize'", where: "baeldung.com/hibernate-batchsize", mins: 25 },
          { type: "Article", item: "Baeldung – 'Spring Data JPA Bulk Insert'", where: "baeldung.com/spring-data-jpa-bulk-insert", mins: 20 },
        ]},
        { label: "Practice", focus: "Profile & optimize 3 slow queries", resources: [
          { type: "Practice", item: "Enable pg_stat_statements, find top 3 slow queries, add composite indexes, verify with EXPLAIN ANALYZE, measure p99 before/after with wrk", where: "Use PostgreSQL 16. Ask Claude to review the index choice!", mins: 90 },
        ]},
      ]},
      { n: 21, title: "NoSQL — MongoDB, Redis & DynamoDB Concepts", sessions: [
        { label: "Study", focus: "NoSQL data models vs relational", resources: [
          { type: "Book",    item: "DDIA – Ch 2 'Data Models and Query Languages'", where: "pp. 31–63 — document, relational, graph models compared. Required reading.", mins: 50 },
          { type: "YouTube", item: "Fireship – 'SQL vs NoSQL Explained'", where: "YouTube → search 'Fireship sql nosql'", mins: 12 },
        ]},
        { label: "Study", focus: "Redis data structures & Spring Data Redis", resources: [
          { type: "Platform", item: "Redis University – RU101: Intro to Redis Data Structures (FREE, ~3 hours)", where: "university.redis.com — Strings, Lists, Sets, Sorted Sets, Hashes", mins: 60 },
          { type: "Article", item: "Baeldung – 'Introduction to Spring Data Redis'", where: "baeldung.com/spring-data-redis-tutorial", mins: 30 },
        ]},
        { label: "Build", focus: "Redis leaderboard & session store", resources: [
          { type: "Build",   item: "Gaming leaderboard: ZADD/ZRANGE/ZRANK for scores, SETNX for distributed lock, TTL-based session store. Spring Data Redis with Spring Boot.", where: "Test with 1M fake entries. Ask Claude about cache-aside vs read-through!", mins: 75 },
        ]},
      ]},
      { n: 22, title: "Flyway Migrations & Production DB Patterns", sessions: [
        { label: "Study", focus: "Flyway schema migrations", resources: [
          { type: "Docs",    item: "Flyway Documentation – versioned migrations, Spring Boot auto-config, repair, dry-run", where: "flywaydb.org/documentation/ — the go-to DB migration tool for Java", mins: 40 },
          { type: "Article", item: "Baeldung – 'Database Migrations with Flyway'", where: "baeldung.com/database-migrations-with-flyway", mins: 25 },
        ]},
        { label: "Study", focus: "HikariCP pool tuning & slow query monitoring", resources: [
          { type: "Article", item: "Baeldung – 'Configuring HikariCP in Spring Boot'", where: "baeldung.com/spring-boot-hikari", mins: 25 },
          { type: "Ask Claude", item: "Ask Claude: what is the optimal HikariCP pool size formula? How do you detect pool exhaustion from Spring Boot Actuator metrics?", where: "Bring your app's thread count and DB server's max_connections", mins: 25 },
        ]},
        { label: "Build", focus: "Production-grade DB setup", resources: [
          { type: "Build",   item: "Add Flyway to your e-commerce project: V1→V5 migrations, seed data, rollback strategy. Add HikariCP metrics to Actuator. Add read-replica datasource for reports.", where: "Ask Claude to review your migration scripts for safety!", mins: 90 },
        ]},
      ]},
      { n: 23, title: "Messaging & Kafka with Spring", sessions: [
        { label: "Study", focus: "Kafka fundamentals — topics, partitions, consumer groups", resources: [
          { type: "YouTube", item: "Confluent – 'Apache Kafka in 5 Minutes'", where: "YouTube → search 'Confluent Kafka in 5 minutes'", mins: 10 },
          { type: "Docs",    item: "Spring Kafka Reference – KafkaTemplate, @KafkaListener, consumer groups, error handling, DLT", where: "docs.spring.io/spring-kafka/reference/", mins: 55 },
        ]},
        { label: "Study", focus: "Kafka Streams & exactly-once semantics", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'Kafka Internals Deep Dive'", where: "YouTube → search 'Hussein Nasser Kafka internals'", mins: 35 },
          { type: "Article", item: "Confluent – 'Exactly-Once Semantics Are Possible in Kafka'", where: "confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/", mins: 25 },
        ]},
        { label: "Build", focus: "Order events pipeline", resources: [
          { type: "Build",   item: "Order service publishes OrderPlaced → Kafka → Inventory service consumes + reserves stock → InventoryReserved. Add DLT, Testcontainers Kafka for tests.", where: "Enable idempotent producer. Ask Claude about DLQ vs retry strategy!", mins: 90 },
        ]},
      ]},
      { n: 24, title: "API Design — REST, gRPC & GraphQL", sessions: [
        { label: "Study", focus: "REST best practices — idempotency, pagination, versioning", resources: [
          { type: "Article", item: "Zalando REST API Guidelines — the industry gold standard", where: "opensource.zalando.com/restful-api-guidelines/", mins: 55 },
          { type: "YouTube", item: "ByteByteGo – 'REST vs GraphQL vs gRPC'", where: "YouTube → search 'ByteByteGo REST GraphQL gRPC'", mins: 20 },
        ]},
        { label: "Study", focus: "gRPC with Java — Protobuf definitions & streaming", resources: [
          { type: "Docs",    item: "gRPC Java – quickstart, service definition, server & client stub generation", where: "grpc.io/docs/languages/java/quickstart/", mins: 45 },
          { type: "YouTube", item: "Amigoscode – 'gRPC with Java Spring Boot'", where: "YouTube → search 'Amigoscode gRPC Java'", mins: 60 },
        ]},
        { label: "Build", focus: "Multi-protocol product search", resources: [
          { type: "Build",   item: "Expose product search via REST, GraphQL (Spring for GraphQL), and gRPC. Benchmark latency + payload size with wrk/ghz. Decide which to keep.", where: "Ask Claude to summarise when to use each protocol!", mins: 90 },
        ]},
      ]},
    ],
  },
  {
    phase: 5, title: "System Design Theory & Fundamentals", icon: "📐",
    accent: "#2563eb", light: "#93c5fd",
    desc: "DDIA, CAP theorem, distributed systems theory — the mental models behind every HLD decision",
    weeks: [
      { n: 25, title: "DDIA — Reliability, Scalability & Storage Engines", sessions: [
        { label: "Study", focus: "DDIA Ch 1–2 — Foundations", resources: [
          { type: "Book",    item: "DDIA Ch 1 'Reliable, Scalable, and Maintainable Applications'", where: "pp. 1–29 — your compass for everything that follows", mins: 50 },
          { type: "Book",    item: "DDIA Ch 2 'Data Models and Query Languages'", where: "pp. 30–77 — relational vs document vs graph", mins: 55 },
        ]},
        { label: "Study", focus: "DDIA Ch 3 — Storage Engines (B-Trees vs LSM)", resources: [
          { type: "Book",    item: "DDIA Ch 3 'Storage and Retrieval' — B-Trees vs LSM-Trees, SSTables", where: "pp. 70–100 — understand InnoDB (B-Tree) vs RocksDB/Cassandra (LSM) internals", mins: 55 },
          { type: "YouTube", item: "Hussein Nasser – 'B-Trees vs LSM Trees'", where: "YouTube → search 'Hussein Nasser B-Tree LSM'", mins: 25 },
        ]},
        { label: "Ask Claude", focus: "Storage engine synthesis", resources: [
          { type: "Ask Claude", item: "Ask Claude: compare B-Tree vs LSM-Tree for a Java microservice with 90% reads vs 90% writes — which DB engine fits each?", where: "Think PostgreSQL (B-Tree) vs Cassandra (LSM) for your specific use case", mins: 35 },
        ]},
      ]},
      { n: 26, title: "DDIA — Replication, Partitioning & Transactions", sessions: [
        { label: "Study", focus: "DDIA Ch 5 — Replication", resources: [
          { type: "Book",    item: "DDIA Ch 5 'Replication' — leader-follower, multi-leader, leaderless replication", where: "pp. 151–195 — read repair, quorums, eventual consistency", mins: 65 },
        ]},
        { label: "Study", focus: "DDIA Ch 6–7 — Partitioning & Transactions", resources: [
          { type: "Book",    item: "DDIA Ch 6 'Partitioning' — hash vs range, consistent hashing, secondary indexes", where: "pp. 199–241 — hotspot mitigation, skewed workloads", mins: 55 },
          { type: "Book",    item: "DDIA Ch 7 'Transactions' — ACID, isolation levels, serializability", where: "pp. 222–271 — clearest explanation of Read Committed vs Serializable you'll find", mins: 65 },
        ]},
        { label: "Build", focus: "Consistency model decision exercise", resources: [
          { type: "Build",   item: "For 4 systems choose isolation level + justify: bank transfer, social feed, shopping cart, analytics. 3 sentences per scenario with concrete SQL examples.", where: "Test each scenario with actual PostgreSQL transactions. Ask Claude to push back!", mins: 60 },
        ]},
      ]},
      { n: 27, title: "Distributed Systems Theory — CAP, Consensus & Clocks", sessions: [
        { label: "Study", focus: "DDIA Ch 8 — The Trouble with Distributed Systems", resources: [
          { type: "Book",    item: "DDIA Ch 8 'The Trouble with Distributed Systems'", where: "pp. 273–320 — clocks, networks, partial failures. Fundamental mental model.", mins: 60 },
          { type: "YouTube", item: "Martin Kleppmann – 'CAP Theorem' lecture", where: "YouTube → search 'Martin Kleppmann CAP theorem'", mins: 30 },
        ]},
        { label: "Study", focus: "DDIA Ch 9 — Consistency & Consensus", resources: [
          { type: "Book",    item: "DDIA Ch 9 'Consistency and Consensus'", where: "pp. 321–370 — linearizability, Raft algorithm, 2PC vs Paxos", mins: 65 },
          { type: "Article", item: "Aphyr – 'Please stop calling databases CP or AP'", where: "Search: 'aphyr please stop calling databases CP AP'", mins: 20 },
        ]},
        { label: "Build", focus: "Distributed systems trade-off analysis", resources: [
          { type: "Build",   item: "Compare ZooKeeper vs etcd vs Redis Sentinel for leader election. Document: consistency guarantees, partition tolerance, performance characteristics.", where: "Ask Claude: 'What would Kafka, Spring Boot app and PostgreSQL each use — and why?'", mins: 60 },
        ]},
      ]},
      { n: 28, title: "Caching Strategies at Scale", sessions: [
        { label: "Study", focus: "Cache patterns — aside, through, behind, refresh-ahead", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Top Caching Strategies'", where: "YouTube → search 'ByteByteGo caching strategies'", mins: 25 },
          { type: "Article", item: "AWS – 'Caching Strategies and Best Practices'", where: "aws.amazon.com/caching/best-practices/", mins: 30 },
        ]},
        { label: "Study", focus: "Thundering herd, cache stampede & hotspot keys", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'Cache Invalidation'", where: "YouTube → search 'Hussein Nasser cache invalidation'", mins: 25 },
          { type: "Ask Claude", item: "Ask Claude: thundering herd on cache miss for a product page with 1M concurrent users — how do you use Redis SETNX + TTL to prevent it?", where: "Also ask about probabilistic early expiration strategy", mins: 30 },
        ]},
        { label: "Practice", focus: "Design caching layers for 3 systems", resources: [
          { type: "Practice", item: "Design caching strategy for: 1) news feed (write-heavy), 2) leaderboard (sorted set), 3) auth token store (TTL + revocation). Write up before asking Claude.", where: "Specify data structure, TTL, eviction policy, invalidation strategy for each", mins: 75 },
        ]},
      ]},
      { n: 29, title: "Load Balancing, Reverse Proxies & CDN", sessions: [
        { label: "Study", focus: "Load balancing algorithms & Nginx", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Load Balancing Algorithms Explained'", where: "YouTube → search 'ByteByteGo load balancing algorithms'", mins: 25 },
          { type: "Docs",    item: "Nginx – load balancing guide (round-robin, least_conn, ip_hash, zone)", where: "nginx.org/en/docs/http/load_balancing.html", mins: 30 },
        ]},
        { label: "Study", focus: "CDN & edge caching", resources: [
          { type: "YouTube", item: "ByteByteGo – 'What is a CDN and how does it work?'", where: "YouTube → search 'ByteByteGo CDN explained'", mins: 15 },
          { type: "Article", item: "Cloudflare – 'What is a CDN?'", where: "cloudflare.com/en-gb/learning/cdn/what-is-a-cdn/", mins: 20 },
        ]},
        { label: "Build", focus: "Nginx load balancer for Spring Boot", resources: [
          { type: "Build",   item: "Docker Compose: nginx load balancing 2× Spring Boot + upstream health checks + gzip + static asset caching headers", where: "Test failover by stopping one container. Ask Claude to review the nginx.conf!", mins: 75 },
        ]},
      ]},
      { n: 30, title: "Back-of-Envelope Estimation & HLD Framework", sessions: [
        { label: "Study", focus: "Estimation framework — powers of 2 and latency numbers", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 2 'Back-of-the-Envelope Estimation'", where: "pp. 19–28 — memorise these latency numbers. Interviewers expect them.", mins: 35 },
          { type: "YouTube", item: "ByteByteGo – 'System Design Interview Framework'", where: "YouTube → search 'ByteByteGo system design framework'", mins: 20 },
        ]},
        { label: "Study", focus: "HLD answer structure & System Design Primer", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 1 'Scale from Zero to Millions'", where: "pp. 1–22 — the canonical scale-up story. Every interviewer knows it.", mins: 40 },
          { type: "Article", item: "GitHub: donnemartin/system-design-primer", where: "github.com/donnemartin/system-design-primer — bookmark this now", mins: 30 },
        ]},
        { label: "Build", focus: "Estimation practice", resources: [
          { type: "Build",      item: "Estimate for Twitter: DAU, tweets/day, read/write ratio, storage/year, bandwidth. Aim for order-of-magnitude accuracy.", where: "Show your working. Document assumptions explicitly.", mins: 45 },
          { type: "Ask Claude", item: "Ask Claude: 'Check my Twitter estimates. Where am I off by an order of magnitude?'", where: "Get the standard interviewer numbers", mins: 20 },
        ]},
      ]},
    ],
  },
  {
    phase: 6, title: "High-Level Design (HLD) Case Studies", icon: "🏛️",
    accent: "#d97706", light: "#fde68a",
    desc: "Design real systems end-to-end: from requirements to architecture diagrams, covering 8 classic HLD problems",
    weeks: [
      { n: 31, title: "URL Shortener & Pastebin", sessions: [
        { label: "Build", focus: "Design URL Shortener (bit.ly) — timed session", resources: [
          { type: "Build",   item: "Design bit.ly on Excalidraw FIRST (45 min, no peeking): API, ID generation (base62), redirect flow, analytics, expiry.", where: "Estimate QPS, storage first. Draw component diagram. Write key API contracts.", mins: 55 },
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 8 'Design a URL Shortener'", where: "pp. 143–162 — read AFTER your own attempt. Compare approaches.", mins: 40 },
        ]},
        { label: "Build", focus: "Design Pastebin — solo session", resources: [
          { type: "Build",   item: "Design Pastebin: S3 for paste content, metadata DB, URL shortening, CDN for popular pastes, expiry + cleanup worker", where: "Full Excalidraw diagram + 1-page design doc.", mins: 55 },
          { type: "Ask Claude", item: "Ask Claude: 'Critique my Pastebin design. What happens when a paste goes viral with 1M views/min?'", where: "Stress-test your CDN, S3, and redirect service assumptions", mins: 20 },
        ]},
      ]},
      { n: 32, title: "Social Media Feed (Twitter / Instagram)", sessions: [
        { label: "Study", focus: "Feed generation strategies — push vs pull vs hybrid", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 11 'Design a News Feed'", where: "pp. 199–213 — fanout on write vs fanout on read. Celebrity problem.", mins: 45 },
          { type: "YouTube", item: "Gaurav Sen – 'Design Facebook / Twitter News Feed'", where: "YouTube → search 'Gaurav Sen news feed design'", mins: 30 },
        ]},
        { label: "Study", focus: "Instagram & Twitter at scale", resources: [
          { type: "Blog",    item: "Instagram Engineering – 'Scaling Instagram'", where: "instagram-engineering.com — search 'scaling'", mins: 25 },
          { type: "YouTube", item: "ByteByteGo – 'Design Twitter'", where: "YouTube → search 'ByteByteGo design Twitter'", mins: 20 },
        ]},
        { label: "Build", focus: "Design Twitter feed — 45 min timed mock", resources: [
          { type: "Build",   item: "Full design: Twitter feed with fanout strategy, Redis timeline cache, media CDN, Like/Retweet counters, Home vs User timeline. 45-min timed.", where: "Write 1-page design doc after. Document your fanout choice + trade-offs.", mins: 75 },
        ]},
      ]},
      { n: 33, title: "Chat Systems (WhatsApp / Slack)", sessions: [
        { label: "Study", focus: "Chat system architecture", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 12 'Design a Chat System'", where: "pp. 215–240 — WebSocket connections, message storage, presence, group chat", mins: 50 },
          { type: "YouTube", item: "ByteByteGo – 'WhatsApp System Design'", where: "YouTube → search 'ByteByteGo WhatsApp system design'", mins: 20 },
        ]},
        { label: "Study", focus: "WhatsApp & Slack at scale", resources: [
          { type: "Blog",    item: "High Scalability – 'WhatsApp Architecture' summary", where: "highscalability.com — search 'whatsapp'", mins: 25 },
          { type: "YouTube", item: "Gaurav Sen – 'Messenger / WhatsApp system design'", where: "YouTube → search 'Gaurav Sen messenger system design'", mins: 25 },
        ]},
        { label: "Build", focus: "Design WhatsApp — 45 min timed mock", resources: [
          { type: "Build",   item: "Design WhatsApp: 1:1 + group messaging, delivery receipts (✓✓), presence, offline message queue, media (S3 + CDN). 45-min timed.", where: "Full Excalidraw + 1-page design doc. Document WebSocket vs long-polling choice.", mins: 75 },
        ]},
      ]},
      { n: 34, title: "Consistent Hashing & Key-Value Stores", sessions: [
        { label: "Study", focus: "Consistent hashing — the core distributed primitive", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 5 'Design Consistent Hashing'", where: "pp. 81–101 — virtual nodes, hotspot mitigation. Critical HLD building block.", mins: 45 },
          { type: "YouTube", item: "ByteByteGo – 'Consistent Hashing Explained'", where: "YouTube → search 'ByteByteGo consistent hashing'", mins: 18 },
        ]},
        { label: "Study", focus: "Distributed key-value stores", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 6 'Design a Key-Value Store'", where: "pp. 103–130 — vector clocks, gossip protocol, Merkle trees", mins: 50 },
          { type: "Article", item: "AWS DynamoDB architecture blog", where: "aws.amazon.com/blogs → search 'DynamoDB architecture'", mins: 30 },
        ]},
        { label: "Build", focus: "Implement consistent hashing + design Dynamo-style store", resources: [
          { type: "Build",   item: "Implement consistent hash ring in Java: add/remove node, virtual nodes, key lookup. Document how Cassandra/DynamoDB apply this.", where: "Write a 1-page doc: consistent hashing vs random partitioning trade-offs.", mins: 75 },
        ]},
      ]},
      { n: 35, title: "Search Systems, Typeahead & Web Crawlers", sessions: [
        { label: "Study", focus: "Autocomplete & trie structures", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 13 'Design a Search Autocomplete System'", where: "pp. 241–260 — trie vs DB, aggregation pipeline, caching hot queries", mins: 45 },
          { type: "YouTube", item: "Gaurav Sen – 'Typeahead Suggestion System Design'", where: "YouTube → search 'Gaurav Sen typeahead suggestion'", mins: 25 },
        ]},
        { label: "Study", focus: "Web crawlers & full-text search", resources: [
          { type: "YouTube", item: "ByteByteGo – 'How does Google Search work?'", where: "YouTube → search 'ByteByteGo google search'", mins: 15 },
          { type: "Book",    item: "System Design Interview Vol 2 – 'Design Google Search' (web crawler + inverted index sections)", where: "Focus on the crawl frontier and index building", mins: 45 },
        ]},
        { label: "Build", focus: "Design typeahead + web crawler — timed", resources: [
          { type: "Build",   item: "Design Google-style typeahead: trie vs DB decision, aggregation pipeline, hot-query cache, 45-min timed. Then design web crawler: politeness, BFS, deduplication.", where: "Two designs, 30 min each. Full Excalidraw diagrams.", mins: 75 },
        ]},
      ]},
      { n: 36, title: "Video Streaming (YouTube / Netflix)", sessions: [
        { label: "Study", focus: "Video system architecture", resources: [
          { type: "Book",    item: "System Design Interview Vol 2 – 'Design YouTube'", where: "pp. 179–209 — upload, async transcoding pipeline, streaming, CDN distribution", mins: 50 },
          { type: "YouTube", item: "ByteByteGo – 'Netflix System Design'", where: "YouTube → search 'ByteByteGo Netflix system design'", mins: 20 },
        ]},
        { label: "Study", focus: "Netflix engineering deep dive", resources: [
          { type: "Blog",    item: "Netflix Tech Blog – video encoding/transcoding pipeline", where: "netflixtechblog.com — search 'encoding' or 'video pipeline'", mins: 30 },
          { type: "Article", item: "HLS vs DASH adaptive streaming protocols", where: "Search 'HLS vs DASH comparison 2024'", mins: 20 },
        ]},
        { label: "Build", focus: "Design YouTube — 45 min timed mock", resources: [
          { type: "Build",   item: "Design YouTube: upload → async transcoding (Kafka) → CDN → view count (Redis incr) → recommendations. 45-min timed.", where: "Focus on the async transcoding pipeline. Full Excalidraw + 1-page doc.", mins: 75 },
        ]},
      ]},
      { n: 37, title: "Ride-Sharing, Payment & Notification Systems", sessions: [
        { label: "Study", focus: "Ride-sharing architecture", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Uber System Design'", where: "YouTube → search 'ByteByteGo Uber system design'", mins: 20 },
          { type: "Blog",    item: "Uber Engineering Blog – 'Domain-Oriented Microservices'", where: "eng.uber.com — search 'domain-oriented microservices'", mins: 25 },
        ]},
        { label: "Study", focus: "Payment & notification systems", resources: [
          { type: "Blog",    item: "Stripe Engineering – 'Idempotency and exactly-once delivery'", where: "stripe.com/blog → search 'idempotency'", mins: 25 },
          { type: "Book",    item: "System Design Interview Vol 1 – Ch 10 'Design a Notification System'", where: "pp. 181–198 — push, SMS, email at scale, rate limiting", mins: 40 },
        ]},
        { label: "Build", focus: "Design Uber + payment system — timed", resources: [
          { type: "Build",   item: "Design Uber: driver matching (geohash), trip tracking (WebSocket), surge pricing, saga-based payment flow. 45-min timed.", where: "Use geohash or quadtree for geo-search. Document saga compensation flows.", mins: 75 },
        ]},
      ]},
      { n: 38, title: "HLD Mock Interview Gauntlet", sessions: [
        { label: "Practice", focus: "Mock 1: URL Shortener (no notes)", resources: [
          { type: "Practice", item: "Timed mock: Design bit.ly in 45 min. No notes. Whiteboard only. Requirements → estimates → components → bottlenecks → monitoring.", where: "Record yourself. Watch it back — find where you stalled.", mins: 55 },
          { type: "YouTube",  item: "Watch a system design mock interview and compare your approach", where: "YouTube → search 'system design interview URL shortener mock'", mins: 30 },
        ]},
        { label: "Practice", focus: "Mock 2: Twitter or WhatsApp", resources: [
          { type: "Practice", item: "Timed mock: Design Twitter feed OR WhatsApp in 45 min. Record yourself on camera.", where: "Watch it back. Find where you stalled or handwaved.", mins: 55 },
          { type: "Ask Claude", item: "Ask: 'Critique my WhatsApp design. What would break at 1 billion users?'", where: "Stress-test your design with scale pressure", mins: 20 },
        ]},
        { label: "Practice", focus: "Mock 3: Your weakest system", resources: [
          { type: "Practice", item: "Pick the system you felt weakest on. Redo it cold. No notes. Use Pramp.com or ask a friend.", where: "pramp.com — free peer mock matching. Strict 45-min timing.", mins: 55 },
          { type: "Build",    item: "Write 'HLD Lessons Learned': top 5 things you do differently now vs Week 31.", where: "Review this doc before every interview. It's your interview cheat sheet.", mins: 30 },
        ]},
      ]},
    ],
  },
  {
    phase: 7, title: "Infrastructure & Cloud", icon: "☁️",
    accent: "#059669", light: "#6ee7b7",
    desc: "Docker, Kubernetes, CI/CD pipelines, observability, and AWS for Java developers",
    weeks: [
      { n: 39, title: "Docker for Java Applications", sessions: [
        { label: "Study", focus: "Dockerfile for Spring Boot & multi-stage builds", resources: [
          { type: "Docs",    item: "Spring Boot – 'Containerizing Spring Boot Applications' (official guide)", where: "docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html", mins: 35 },
          { type: "YouTube", item: "Amigoscode – 'Docker Tutorial for Beginners (Java focused)'", where: "YouTube → search 'Amigoscode Docker tutorial'", mins: 60 },
        ]},
        { label: "Study", focus: "Docker Compose for local dev stack", resources: [
          { type: "Docs",    item: "Docker Compose – Getting Started, Networking, health checks", where: "docs.docker.com/compose/gettingstarted/", mins: 35 },
          { type: "Article", item: "Baeldung – 'Docker Compose with Spring Boot'", where: "baeldung.com/spring-boot-docker-compose", mins: 25 },
        ]},
        { label: "Build", focus: "Dockerize the full stack", resources: [
          { type: "Build",   item: "Multi-stage Dockerfile (Maven build → JRE runtime), target < 200 MB image, Docker Compose: app + postgres + redis + kafka + zookeeper, .dockerignore", where: "Use BuildKit cache mounts for Maven .m2. Ask Claude to review the Dockerfile!", mins: 90 },
        ]},
      ]},
      { n: 40, title: "Kubernetes Fundamentals", sessions: [
        { label: "Study", focus: "Pods, Deployments, Services, ConfigMaps & Secrets", resources: [
          { type: "Docs",    item: "Kubernetes Docs – Deployments, Services, ConfigMaps, Secrets, HPA", where: "kubernetes.io/docs/concepts/workloads/controllers/deployment/", mins: 65 },
          { type: "YouTube", item: "TechWorld with Nana – 'Kubernetes Tutorial for Beginners'", where: "YouTube → search 'TechWorld Nana Kubernetes tutorial'", mins: 90 },
        ]},
        { label: "Study", focus: "Helm charts & values.yaml", resources: [
          { type: "Docs",    item: "Helm Docs – Chart Template Guide, values, helpers, hooks", where: "helm.sh/docs/chart_template_guide/", mins: 45 },
          { type: "Article", item: "Baeldung – 'Deploying Spring Boot to Kubernetes'", where: "baeldung.com/spring-boot-kubernetes", mins: 25 },
        ]},
        { label: "Build", focus: "Deploy Spring Boot to local K8s", resources: [
          { type: "Build",   item: "Helm chart: Deployment + ClusterIP Service + HPA (CPU 70%) + ConfigMap for app props + Secret for DB password. Deploy to minikube.", where: "Test rolling update and HPA scale-out. Ask Claude to help write the HPA config!", mins: 90 },
        ]},
      ]},
      { n: 41, title: "CI/CD Pipelines & Code Quality", sessions: [
        { label: "Study", focus: "GitHub Actions for Java CI", resources: [
          { type: "Docs",    item: "GitHub Actions – Building and testing Java, caching Maven/.gradle, matrix builds", where: "docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-java-with-maven", mins: 35 },
          { type: "YouTube", item: "TechWorld with Nana – 'GitHub Actions Full Course'", where: "YouTube → search 'TechWorld Nana GitHub Actions'", mins: 60 },
        ]},
        { label: "Study", focus: "SonarQube analysis & Jacoco coverage", resources: [
          { type: "Docs",    item: "SonarQube – Java analysis, quality gates, issue rules", where: "docs.sonarsource.com/sonarqube/latest/analysis/languages/java/", mins: 30 },
          { type: "Article", item: "Baeldung – 'Jacoco — code coverage in Maven'", where: "baeldung.com/jacoco", mins: 20 },
        ]},
        { label: "Build", focus: "Full CI/CD pipeline", resources: [
          { type: "Build",   item: "GitHub Actions: build → test → Jacoco (fail <80%) → SonarQube → Docker build/push → Helm upgrade to dev K8s. Branch protection = green CI required.", where: "Use GitHub Environments for staging/prod. Ask Claude to review the pipeline!", mins: 90 },
        ]},
      ]},
      { n: 42, title: "Observability — Metrics, Tracing & Logging", sessions: [
        { label: "Study", focus: "Micrometer metrics & Spring Boot Actuator", resources: [
          { type: "Docs",    item: "Micrometer – Getting Started, meters, registries, Prometheus integration", where: "micrometer.io/docs/observation", mins: 45 },
          { type: "Docs",    item: "Spring Boot Actuator – production-ready endpoints, custom metrics", where: "docs.spring.io/spring-boot/reference/actuator/", mins: 35 },
        ]},
        { label: "Study", focus: "Prometheus + Grafana & distributed tracing with Zipkin", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'Prometheus & Grafana Tutorial'", where: "YouTube → search 'TechWorld Nana Prometheus Grafana'", mins: 60 },
          { type: "Docs",    item: "Micrometer Tracing – Zipkin, Brave, OpenTelemetry bridge", where: "micrometer.io/docs/tracing", mins: 35 },
        ]},
        { label: "Build", focus: "Instrument the Spring Boot app", resources: [
          { type: "Build",   item: "Add: custom Counter + Timer metrics via Micrometer, Prometheus /actuator/prometheus, Grafana dashboard (RPS, p99 latency, error rate), Zipkin traces", where: "Add to Docker Compose. Ask Claude to help write Grafana alert rules!", mins: 90 },
        ]},
      ]},
      { n: 43, title: "AWS for Java Developers", sessions: [
        { label: "Study", focus: "AWS SDK for Java 2.x — S3, SQS, DynamoDB", resources: [
          { type: "Docs",    item: "AWS SDK for Java 2.x Developer Guide – S3, SQS, DynamoDB, async clients", where: "docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html", mins: 65 },
          { type: "YouTube", item: "Amigoscode – 'AWS with Spring Boot'", where: "YouTube → search 'Amigoscode AWS Spring Boot'", mins: 60 },
        ]},
        { label: "Study", focus: "Spring Cloud AWS & Parameter Store", resources: [
          { type: "Docs",    item: "Spring Cloud AWS 3.x – S3, SQS, Parameter Store, SecretsManager integration", where: "docs.awspring.io/spring-cloud-aws/docs/3.0.0/reference/html/index.html", mins: 45 },
          { type: "Article", item: "Baeldung – 'Spring Cloud AWS'", where: "baeldung.com/spring-cloud-aws", mins: 25 },
        ]},
        { label: "Build", focus: "Cloud-native feature additions", resources: [
          { type: "Build",   item: "Add to the project: S3 file upload endpoint, SQS consumer (Spring Cloud AWS), DynamoDB session store, Parameter Store for secrets. Test with LocalStack.", where: "Use @LocalStackContainer in Testcontainers. Ask Claude about IAM least-privilege!", mins: 90 },
        ]},
      ]},
      { n: 44, title: "Infrastructure as Code & 12-Factor App", sessions: [
        { label: "Study", focus: "Terraform for AWS infrastructure", resources: [
          { type: "YouTube", item: "TechWorld with Nana – 'Terraform Tutorial for Beginners'", where: "YouTube → search 'TechWorld Nana Terraform tutorial'", mins: 65 },
          { type: "Docs",    item: "Terraform AWS Provider – VPC, ECS Fargate, RDS, ALB, S3 resources", where: "registry.terraform.io/providers/hashicorp/aws/latest/docs", mins: 45 },
        ]},
        { label: "Study", focus: "12-Factor App applied to Spring Boot", resources: [
          { type: "Article", item: "12factor.net – all 12 factors, applied to Spring Boot microservice", where: "12factor.net", mins: 35 },
          { type: "Ask Claude", item: "Ask Claude: which 12-factor principles does your current Spring Boot project violate? How to fix each?", where: "Go through your application.properties, Dockerfile, and CI pipeline", mins: 30 },
        ]},
        { label: "Build", focus: "Terraform AWS baseline", resources: [
          { type: "Build",   item: "Terraform: VPC with public/private subnets, ECS Fargate for Spring Boot, RDS Postgres Multi-AZ, ALB, Parameter Store, proper IAM roles + tags", where: "Use terraform plan before apply. Ask Claude to review security group rules!", mins: 90 },
        ]},
      ]},
    ],
  },
  {
    phase: 8, title: "Microservices & Distributed Systems", icon: "🔗",
    accent: "#dc2626", light: "#fca5a5",
    desc: "Spring Cloud, Resilience4j, distributed tracing, event sourcing, sagas, and CQRS",
    weeks: [
      { n: 45, title: "Microservices Architecture & DDD", sessions: [
        { label: "Study", focus: "Domain-Driven Design — bounded contexts & aggregates", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Microservices Architecture Pattern'", where: "YouTube → search 'ByteByteGo microservices architecture'", mins: 20 },
          { type: "Article", item: "Martin Fowler – 'Bounded Context' & 'Aggregate' patterns", where: "martinfowler.com/bliki/BoundedContext.html", mins: 30 },
        ]},
        { label: "Study", focus: "Microservice patterns — API Gateway, BFF, Strangler Fig", resources: [
          { type: "Blog",    item: "microservices.io – Pattern catalog by Chris Richardson (Sam Newman endorsed)", where: "microservices.io/patterns/index.html", mins: 65 },
          { type: "YouTube", item: "Hussein Nasser – 'Microservices Communication Patterns'", where: "YouTube → search 'Hussein Nasser microservices communication'", mins: 30 },
        ]},
        { label: "Ask Claude", focus: "Decomposition exercise", resources: [
          { type: "Ask Claude", item: "Ask Claude: decompose an e-commerce monolith. Identify 5 bounded contexts, define service contracts, choose sync (gRPC/REST) vs async (Kafka) for each interaction.", where: "Use your product catalog Spring Boot app as the starting monolith", mins: 50 },
        ]},
      ]},
      { n: 46, title: "Spring Cloud Gateway & Service Discovery", sessions: [
        { label: "Study", focus: "Spring Cloud Gateway — routing, predicates & filters", resources: [
          { type: "Docs",    item: "Spring Cloud Gateway Docs – routes, predicates, global filters, rate limiting", where: "docs.spring.io/spring-cloud-gateway/reference/", mins: 50 },
          { type: "YouTube", item: "Daily Code Buffer – 'Spring Cloud Gateway Tutorial'", where: "YouTube → search 'Daily Code Buffer Spring Cloud Gateway'", mins: 55 },
        ]},
        { label: "Study", focus: "Eureka service discovery & Spring Cloud Config", resources: [
          { type: "Docs",    item: "Spring Cloud Netflix Eureka – self-preservation, heartbeat, zone affinity", where: "docs.spring.io/spring-cloud-netflix/reference/", mins: 35 },
          { type: "Docs",    item: "Spring Cloud Config Server – encrypted properties, refresh scope, Git backend", where: "docs.spring.io/spring-cloud-config/reference/", mins: 35 },
        ]},
        { label: "Build", focus: "Mini service mesh", resources: [
          { type: "Build",   item: "API Gateway → Product Service + Order Service (Eureka-registered), Config Server for shared properties, JWT validation at gateway, rate limiting per IP", where: "All in Docker Compose. Ask Claude to help with gateway route config!", mins: 90 },
        ]},
      ]},
      { n: 47, title: "Resilience — Circuit Breaker, Retry & Bulkhead", sessions: [
        { label: "Study", focus: "Resilience4j core patterns", resources: [
          { type: "Docs",    item: "Resilience4j Docs – CircuitBreaker, Retry, Bulkhead, RateLimiter, TimeLimiter", where: "resilience4j.readme.io/docs/circuitbreaker", mins: 55 },
          { type: "YouTube", item: "Daily Code Buffer – 'Spring Boot Resilience4j Tutorial'", where: "YouTube → search 'Daily Code Buffer Resilience4j Spring Boot'", mins: 55 },
        ]},
        { label: "Study", focus: "Fallback strategies & testing resilience", resources: [
          { type: "Article", item: "Baeldung – 'Guide to Resilience4j with Spring Boot'", where: "baeldung.com/resilience4j", mins: 35 },
          { type: "Ask Claude", item: "Ask Claude: what circuit breaker thresholds are appropriate for a payment service? How do you test the half-open state in integration tests?", where: "Think about slow calls (latency-based) vs error rate thresholds", mins: 30 },
        ]},
        { label: "Build", focus: "Resilient order service", resources: [
          { type: "Build",   item: "CircuitBreaker around inventory check, Retry with exponential backoff for payment, Bulkhead for DB calls, fallback returning cached stale data. Simulate failures with WireMock.", where: "Verify state machine transitions in tests. Ask Claude to review the config!", mins: 90 },
        ]},
      ]},
      { n: 48, title: "Distributed Tracing & Structured Logging", sessions: [
        { label: "Study", focus: "OpenTelemetry Java agent & Micrometer Tracing", resources: [
          { type: "Docs",    item: "OpenTelemetry Java – auto-instrumentation agent, manual spans, context propagation", where: "opentelemetry.io/docs/languages/java/", mins: 45 },
          { type: "Docs",    item: "Micrometer Tracing – Zipkin/Jaeger exporter, Spring Boot 3 integration", where: "micrometer.io/docs/tracing", mins: 35 },
        ]},
        { label: "Study", focus: "Structured logging with Logback & ELK stack", resources: [
          { type: "Article", item: "Baeldung – 'Structured Logging with Logstash Logback Encoder'", where: "baeldung.com/logback", mins: 30 },
          { type: "YouTube", item: "TechWorld with Nana – 'ELK Stack Tutorial'", where: "YouTube → search 'TechWorld Nana ELK stack'", mins: 65 },
        ]},
        { label: "Build", focus: "End-to-end distributed tracing", resources: [
          { type: "Build",   item: "OpenTelemetry agent on all services, propagate trace-id through Kafka headers, visualize in Jaeger, add MDC trace-id to every Logback log line, Kibana dashboard", where: "Add Jaeger + ELK to Docker Compose. Ask Claude about sampling strategies!", mins: 90 },
        ]},
      ]},
      { n: 49, title: "Event-Driven Architecture & CQRS", sessions: [
        { label: "Study", focus: "CQRS and Event Sourcing patterns", resources: [
          { type: "Article", item: "Martin Fowler – 'CQRS' + 'Event Sourcing' (bliki articles)", where: "martinfowler.com/bliki/CQRS.html", mins: 45 },
          { type: "YouTube", item: "Hussein Nasser – 'Event Sourcing and CQRS Explained'", where: "YouTube → search 'Hussein Nasser CQRS event sourcing'", mins: 35 },
        ]},
        { label: "Study", focus: "Axon Framework for event sourcing in Java", resources: [
          { type: "Docs",    item: "Axon Framework Reference – Aggregate, Command, Event, Query handling, Saga", where: "docs.axoniq.io/reference-guide/", mins: 55 },
          { type: "Article", item: "Baeldung – 'CQRS and Event Sourcing with Axon Framework'", where: "baeldung.com/axon-cqrs-event-sourcing", mins: 35 },
        ]},
        { label: "Build", focus: "CQRS order service", resources: [
          { type: "Build",   item: "Axon: CreateOrderCommand → OrderCreatedEvent (event-sourced aggregate) → projection to read model → GetOrderQuery handler. Compare state rebuild time.", where: "Ask Claude when NOT to use event sourcing — it's not always the right choice!", mins: 90 },
        ]},
      ]},
      { n: 50, title: "Distributed Transactions & Sagas", sessions: [
        { label: "Study", focus: "2PC vs Saga — trade-offs", resources: [
          { type: "YouTube", item: "ByteByteGo – 'Distributed Transactions Explained'", where: "YouTube → search 'ByteByteGo distributed transactions'", mins: 20 },
          { type: "Article", item: "Chris Richardson – 'Saga Pattern' at microservices.io", where: "microservices.io/patterns/data/saga.html", mins: 35 },
        ]},
        { label: "Study", focus: "Orchestration vs Choreography sagas", resources: [
          { type: "YouTube", item: "Hussein Nasser – 'Saga Orchestration vs Choreography'", where: "YouTube → search 'Hussein Nasser saga orchestration choreography'", mins: 30 },
          { type: "Ask Claude", item: "Ask Claude: design a checkout saga — Order, Payment, Inventory services. Walk through happy path and full compensation flow with rollbacks.", where: "Draw the state machine first, then discuss with Claude", mins: 50 },
        ]},
        { label: "Build", focus: "Orchestrated checkout saga", resources: [
          { type: "Build",   item: "Axon Saga: PlaceOrder → ChargePayment → ReserveInventory. Compensating transactions: RefundPayment, ReleaseInventory on any failure. Integration tested.", where: "Ask Claude to review the compensation logic edge cases!", mins: 90 },
        ]},
      ]},
    ],
  },
  {
    phase: 9, title: "Interview Prep & Capstone", icon: "🎯",
    accent: "#4f46e5", light: "#a5b4fc",
    desc: "System design interview patterns, Java coding, and a full-stack microservice capstone project",
    weeks: [
      { n: 51, title: "System Design Interview Patterns", sessions: [
        { label: "Study", focus: "Classic designs — URL Shortener, Rate Limiter, News Feed", resources: [
          { type: "Book",    item: "System Design Interview Vol 1 (Alex Xu) – Ch 1–8", where: "~200 pages — step-by-step framework + 8 designs everyone asks about", mins: 120 },
          { type: "YouTube", item: "ByteByteGo – 'System Design Interview' channel (full playlist)", where: "YouTube → search 'ByteByteGo system design interview'", mins: 90 },
        ]},
        { label: "Study", focus: "Advanced designs from Vol 2", resources: [
          { type: "Book",    item: "System Design Interview Vol 2 (Alex Xu) – Hotel Reservation, Stock Exchange, Ad Click Aggregator", where: "Pick 3 chapters you haven't covered. These are harder interview questions.", mins: 90 },
          { type: "Ask Claude", item: "Ask Claude to quiz you: 'Design WhatsApp message storage for 2B users'. Do the estimation verbally first.", where: "Use the powers-of-two cheat sheet. Time yourself to 5 minutes.", mins: 35 },
        ]},
        { label: "Practice", focus: "Timed mock design session", resources: [
          { type: "Practice", item: "Solo 45-min session: Design Uber. Requirements → estimation → high-level design → deep dive. Record yourself, watch back, ask Claude to evaluate.", where: "Use excalidraw.com. Focus on: matching algorithm, geo-index, surge pricing", mins: 60 },
        ]},
      ]},
      { n: 52, title: "Java Coding Patterns for Interviews", sessions: [
        { label: "Study", focus: "Core data structure & algorithm patterns in Java", resources: [
          { type: "Platform", item: "LeetCode – Top Interview 150 in Java (arrays, hashing, two-pointers, sliding window, binary search)", where: "leetcode.com/studyplan/top-interview-150/", mins: 120 },
          { type: "YouTube", item: "NeetCode – 'Coding Interview Patterns'", where: "YouTube → search 'NeetCode coding interview patterns'", mins: 60 },
        ]},
        { label: "Study", focus: "Java-specific patterns — Comparable, thread-safe collections", resources: [
          { type: "Article", item: "Baeldung – 'Java Comparator and Comparable'", where: "baeldung.com/java-comparator-comparable", mins: 25 },
          { type: "Ask Claude", item: "Ask Claude: implement a thread-safe LRU Cache using LinkedHashMap + ReentrantReadWriteLock in Java 21. Review it before looking at Claude's answer.", where: "Common senior Java interview question", mins: 60 },
        ]},
        { label: "Practice", focus: "Daily LeetCode practice", resources: [
          { type: "Practice", item: "3 problems/day: 1 easy warm-up + 1 medium + 1 hard from rotating patterns (BFS, DP, graphs, heap, backtracking). 35-min timer per problem.", where: "leetcode.com — review editorial if stuck after 35 min. Ask Claude for hints, not answers!", mins: 90 },
        ]},
      ]},
      { n: 53, title: "Capstone — Build a Mini Platform", sessions: [
        { label: "Build", focus: "Architecture design & review", resources: [
          { type: "Build",   item: "Define architecture: API Gateway → Auth Service (JWT) → Product Service (REST + Kafka) → Order Service (Saga) → Notification Service (email/SQS)", where: "Draw in Excalidraw. Ask Claude to punch holes in the design before coding!", mins: 75 },
          { type: "Ask Claude", item: "Ask Claude: architecture review — identify SPOFs, missing resilience, observability gaps, security issues in your design.", where: "Share your diagram. Claude should challenge: what happens if Kafka is down?", mins: 35 },
        ]},
        { label: "Build", focus: "Full implementation", resources: [
          { type: "Build",   item: "Implement all services with Spring Boot 3, Docker Compose stack (Postgres, Redis, Kafka, Prometheus, Grafana, Jaeger), E2E integration test for checkout happy path", where: "Commit each service separately. Ask Claude to review each PR!", mins: 180 },
        ]},
      ]},
      { n: 54, title: "Final Review & Mock Interviews 🎉", sessions: [
        { label: "Review", focus: "DDIA final chapters & System Design Primer", resources: [
          { type: "Book",    item: "DDIA – re-read Ch 8 'The Trouble with Distributed Systems' + Ch 9 'Consistency and Consensus'", where: "pp. 274–338 — hardest chapters. Everything clicks on second read.", mins: 90 },
          { type: "Blog",    item: "System Design Primer — full review of all patterns", where: "github.com/donnemartin/system-design-primer", mins: 60 },
        ]},
        { label: "Practice", focus: "3 peer mock interviews", resources: [
          { type: "Practice", item: "3 mock system design interviews (Pramp, interviewing.io, or peer) — timed 45 min each. Get written feedback on each one.", where: "pramp.com — schedule now, don't leave it to the last day!", mins: 135 },
          { type: "Ask Claude", item: "Final debrief: Ask Claude to quiz you on your 3 weakest system design areas. Respond without notes, under time pressure.", where: "Common gaps: exactly-once delivery, consensus algorithms, schema evolution", mins: 60 },
        ]},
        { label: "Build", focus: "Portfolio & celebration", resources: [
          { type: "Build",      item: "Deploy capstone with CI/CD. README with Excalidraw architecture diagram. Record 10-min Loom walkthrough of architectural decisions.", where: "loom.com — free. Link on GitHub and LinkedIn.", mins: 60 },
          { type: "Ask Claude", item: "Ask: 'What are the most common mistakes senior engineers make in system design?'", where: "The final boss question. You've earned this.", mins: 30 },
        ]},
      ]},
    ],
  },
];
