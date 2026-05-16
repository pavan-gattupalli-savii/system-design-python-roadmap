// ── BUILD SPECS ───────────────────────────────────────────────────────────────
// Detailed requirement specs for every "Build" resource in the roadmap.
// Keyed by the exact `res.item` string from the roadmap data.
// Source-of-truth file consumed by server/scripts/seed-build-specs.ts; the
// runtime data lives in the build_specs DB table and is served via the
// /api/roadmap response (Resource.spec).

interface BuildSpec {
  overview:     string;
  requirements: string[];
  acceptance:   string[];
  diagram?:     string;
  hints?:       string[];
  difficulty:   "beginner" | "intermediate" | "advanced";
}

export const BUILD_SPECS: Record<string, BuildSpec> = {

  // ── PHASE 1: Python Foundations ──────────────────────────────────────────

  "Temperature converter (Celsius ↔ Fahrenheit ↔ Kelvin) — handles invalid input gracefully": {
    difficulty: "beginner",
    overview:
      "Build a CLI temperature converter that handles all three scales and rejects invalid input with clear error messages. A perfect first Python project to practice functions, user input handling, and exception management.",
    requirements: [
      "Accept two CLI arguments: the value (float) and the source unit (C, F, or K)",
      "Convert to all other two units and print results clearly formatted",
      "Raise a custom TempConversionError for temperatures below absolute zero (−273.15 °C / −459.67 °F / 0 K)",
      "Handle non-numeric input with a helpful error message (not a raw traceback)",
      "Bonus: word frequency counter — read any text file and print the top-10 most frequent words",
    ],
    acceptance: [
      "`python converter.py 100 C` prints: 100.0°C = 212.0°F = 373.15 K",
      "`python converter.py -500 C` prints: Error: −500°C is below absolute zero",
      "`python converter.py abc F` prints: Error: 'abc' is not a valid number",
      "Word counter reads the file in one pass, uses collections.Counter, prints formatted table",
    ],
    hints: [
      "Write one conversion function per pair (c_to_f, f_to_k, etc.) — 6 functions total",
      "Use argparse for CLI argument parsing, not raw input()",
      "Define absolute-zero constants at the top of the file",
      "For the word counter, open the file with `with open(path) as f` and use `.lower().split()` to tokenise",
    ],
  },

  "CLI todo manager split across modules: models.py (Task dataclass), storage.py (JSON file), cli.py (add/list/done/delete commands).": {
    difficulty: "beginner",
    overview:
      "Build a modular CLI todo manager split across three Python files. This teaches you how to structure a real Python project: domain models, a persistence layer, and a CLI front-end — each in its own module.",
    requirements: [
      "models.py: Task dataclass with id (uuid), title (str), done (bool), created_at (datetime)",
      "storage.py: load() reads tasks from todos.json; save(tasks) writes back; create the file if it doesn't exist",
      "cli.py: argparse sub-commands — add <title>, list (shows all), done <id>, delete <id>",
      "IDs can be the first 8 characters of the UUID — short enough to type",
      "list command shows done tasks with a ✓ prefix and undone with ○",
    ],
    acceptance: [
      "`python cli.py add 'Buy milk'` prints: Added task abc12345",
      "`python cli.py list` shows all tasks with ID, status icon, and title",
      "`python cli.py done abc12345` marks that task done",
      "Data persists across runs (stored in todos.json)",
      "Importing models.py from storage.py works without circular imports",
    ],
    diagram: `
  ┌─────────────────────────────────────┐
  │              cli.py                 │
  │  argparse sub-commands:             │
  │  add | list | done | delete         │
  └──────────────┬──────────────────────┘
                 │ imports
  ┌──────────────▼──────────────────────┐
  │            storage.py               │
  │  load() → List[Task]               │
  │  save(tasks: List[Task]) → None    │
  └──────────────┬──────────────────────┘
                 │ imports
  ┌──────────────▼──────────────────────┐
  │             models.py               │
  │  @dataclass Task:                  │
  │    id: str (uuid)                  │
  │    title: str                      │
  │    done: bool = False              │
  │    created_at: datetime            │
  └─────────────────────────────────────┘
  Persistence: todos.json (list of dicts)
`,
    hints: [
      "Use `dataclasses.asdict(task)` to serialise a Task to JSON",
      "Use `datetime.fromisoformat()` to deserialise the created_at field",
      "Use `uuid.uuid4()` to generate IDs, then `str(uid)[:8]` for the short form",
      "Add `if __name__ == '__main__': main()` in cli.py",
    ],
  },

  "BankAccount → SavingsAccount (interest, min-balance), CheckingAccount (overdraft limit). Custom InsufficientFundsError. @property for balance.": {
    difficulty: "beginner",
    overview:
      "Design a bank account class hierarchy demonstrating Python OOP: inheritance, polymorphism, custom exceptions, and the @property descriptor. This models a real-world domain with business rules enforced in code.",
    requirements: [
      "BankAccount: __init__(owner, initial_balance), deposit(amount), withdraw(amount), __repr__, __str__",
      "@property balance — read-only (no direct assignment)",
      "SavingsAccount(BankAccount): min_balance enforcement, apply_interest(rate) method",
      "CheckingAccount(BankAccount): overdraft_limit — can go negative up to limit",
      "Custom InsufficientFundsError(Exception) raised on invalid withdrawal",
      "All amounts must be positive — raise ValueError otherwise",
    ],
    acceptance: [
      "Withdrawing past min_balance on SavingsAccount raises InsufficientFundsError",
      "Withdrawing past (balance + overdraft_limit) on CheckingAccount raises InsufficientFundsError",
      "`acc.balance = 999` raises AttributeError (read-only property)",
      "apply_interest(0.05) increases balance by 5%",
      "`str(acc)` returns human-readable string; `repr(acc)` returns unambiguous form",
    ],
    diagram: `
  ┌────────────────────────────────────────┐
  │           BankAccount                  │
  ├────────────────────────────────────────┤
  │ - _balance: float                      │
  │ + owner: str                           │
  ├────────────────────────────────────────┤
  │ + balance: float  (@property)          │
  │ + deposit(amount: float) → None        │
  │ + withdraw(amount: float) → None       │
  │ + __repr__() → str                    │
  │ + __str__() → str                     │
  └───────────┬──────────────┬─────────────┘
              │              │
  ┌───────────▼──────┐  ┌───▼────────────────┐
  │  SavingsAccount  │  │  CheckingAccount    │
  ├──────────────────┤  ├────────────────────┤
  │ min_balance:float│  │ overdraft_limit:    │
  │                  │  │   float             │
  ├──────────────────┤  ├────────────────────┤
  │ apply_interest() │  │ withdraw() override │
  │ withdraw()       │  │                    │
  │   override       │  └────────────────────┘
  └──────────────────┘

  Exception:
  InsufficientFundsError(Exception)
    └── raised by withdraw() in both subclasses
`,
    hints: [
      "Use `self._balance` as the private backing attribute for the @property",
      "Call `super().withdraw(amount)` from subclasses after checking their own constraints",
      "SavingsAccount.withdraw: check `self._balance - amount < self.min_balance` before allowing withdrawal",
    ],
  },

  "Implement Stack (list-backed + LinkedList-backed), Queue (deque-backed), and LinkedList with insert/delete/search. Write unit tests for each.": {
    difficulty: "beginner",
    overview:
      "Implement three fundamental data structures from scratch — Stack, Queue, and LinkedList — with multiple backing implementations. Write unit tests for every operation. This cements your understanding of how these structures actually work.",
    requirements: [
      "Stack (list-backed): push, pop, peek, is_empty, __len__",
      "Stack (LinkedList-backed): same interface, backed by a linked node chain",
      "Queue (deque-backed): enqueue, dequeue, peek, is_empty, __len__",
      "LinkedList: Node class, insert_at_head, insert_at_tail, delete(value), search(value), __iter__, __len__",
      "Unit tests using pytest for every public method including edge cases (empty structure, single element)",
      "Performance comparison: time list-backed vs deque-backed queue for 10,000 enqueue+dequeue operations",
    ],
    acceptance: [
      "All operations have correct time complexity (O(1) for Stack push/pop, Queue enqueue/dequeue)",
      "Popping from empty Stack raises IndexError (or custom EmptyStackError)",
      "LinkedList.search() returns the node or None",
      "pytest runs with no failures: `pytest -v test_structures.py`",
    ],
    diagram: `
  Stack (list-backed)       Stack (node-backed)
  ┌──────────────┐          ┌─────┐   ┌─────┐
  │  [3, 1, 4,  ]│  top →  │  4  │──▶│  1  │──▶ None
  │   push/pop  ◀┘          └─────┘   └─────┘
  └──────────────┘          Node chain (LIFO)

  Queue (deque)             LinkedList
  front ←                   head
  ┌───┬───┬───┬───┐         ┌─────┐   ┌─────┐   ┌─────┐
  │ 1 │ 2 │ 3 │ 4 │         │  A  │──▶│  B  │──▶│  C  │──▶ None
  └───┴───┴───┴───┘         └─────┘   └─────┘   └─────┘
  dequeue ←   → enqueue     insert_at_head / insert_at_tail
`,
    hints: [
      "For LinkedList-backed Stack, keep a `head` pointer and push/pop from the head — both O(1)",
      "Use `collections.deque` for Queue; deque.appendleft() is O(1) unlike list.insert(0, x)",
      "Write tests BEFORE implementing — it forces you to think about the interface first",
      "Use `pytest.raises(IndexError)` to test that popping an empty stack raises correctly",
    ],
  },

  // ── PHASE 2: Python Internals & OOP Mastery ──────────────────────────────

  "E-commerce domain: @dataclass Product, Order, OrderItem. Abstract Notifier with EmailNotifier, SMSNotifier. Protocol for PaymentGateway.": {
    difficulty: "intermediate",
    overview:
      "Model a simplified e-commerce domain using Python's modern type system: @dataclass for value objects, Abstract Base Classes for polymorphism, and structural subtyping with Protocol. This is the foundation of real production Python codebases.",
    requirements: [
      "@dataclass Product: id (int), name (str), price (Decimal), stock (int)",
      "@dataclass OrderItem: product (Product), quantity (int); property subtotal = price × quantity",
      "@dataclass Order: id, customer_email, items (List[OrderItem]); property total, property item_count",
      "Abstract Notifier (ABC): abstract send(order: Order) → None; concrete EmailNotifier, SMSNotifier",
      "PaymentGateway Protocol: charge(amount: Decimal, token: str) → bool; implement StripeGateway, MockGateway",
      "Full type hints; mypy --strict passes with zero errors",
    ],
    acceptance: [
      "Order.total computes sum of all OrderItem.subtotals correctly",
      "EmailNotifier and SMSNotifier satisfy `isinstance(n, Notifier)` check",
      "MockGateway satisfies PaymentGateway Protocol without inheriting from it",
      "`mypy --strict ecommerce.py` exits with no errors",
    ],
    diagram: `
  Protocol (structural)       Abstract Base Class
  ┌─────────────────────┐     ┌──────────────────────┐
  │   PaymentGateway    │     │      Notifier (ABC)   │
  │  (Protocol)         │     │  @abstractmethod      │
  │  charge(amt, token) │     │  send(order) → None   │
  └──────┬──────────────┘     └───────┬───────────────┘
         │ implements                 │ inherits
  ┌──────▼──────┐  ┌──────────┐  ┌───▼──────────────┐
  │StripeGateway│  │MockGate- │  │ EmailNotifier     │
  │charge(...)  │  │way       │  │ SMSNotifier       │
  └─────────────┘  └──────────┘  └───────────────────┘

  Domain Model:
  Order ──has many──▶ OrderItem ──references──▶ Product
    │
    └── total: Decimal (computed)
`,
    hints: [
      "Use `from decimal import Decimal` for money — never float for currency",
      "PaymentGateway is a Protocol (from typing import Protocol) — StripeGateway doesn't need to import or inherit it",
      "Use `@dataclass(frozen=True)` for Product — products don't change after creation",
      "Ask: 'Should I use ABC or Protocol for Notifier?' — the answer is ABC (you own the hierarchy). Protocol is better when you don't control the implementors.",
    ],
  },

  "Write a Validated descriptor (enforces type + range). Use it in a dataclass. Then a simple ORM-style metaclass that registers all model classes.": {
    difficulty: "advanced",
    overview:
      "Build two advanced metaprogramming tools used in real frameworks like Django and SQLAlchemy: a descriptor that validates type and range on assignment, and a metaclass that automatically registers every model class into a central registry.",
    requirements: [
      "Validated descriptor: __set_name__(owner, name), __get__, __set__ with type and optional min/max validation",
      "Raise TypeError on wrong type, ValueError on out-of-range, with clear messages naming the field",
      "Use it in a dataclass: `@dataclass class Product: price: float = Validated(float, min_val=0.0)`",
      "ModelMeta metaclass: __init_subclass__ (or __new__) registers each Model subclass in `Model.registry`",
      "Registry is a dict mapping class name → class; `Model.get('Product')` returns the class",
      "Test with at least 3 model classes and verify registry contains all of them",
    ],
    acceptance: [
      "`product.price = -1` raises ValueError: 'price must be >= 0.0'",
      "`product.price = 'free'` raises TypeError: 'price must be float'",
      "`Model.registry` contains {'Product': Product, 'Order': Order, ...} after importing",
      "Descriptor __set_name__ receives the correct attribute name so error messages say 'price', not 'value'",
    ],
    hints: [
      "__set_name__(self, owner, name) is called at class creation time — store `self.name = name`",
      "Store the actual value in `instance.__dict__[self.name]` to avoid infinite recursion",
      "For ModelMeta, __init_subclass__ on the base Model class is cleaner than a full metaclass for simple registration",
      "Test the descriptor independently before using it in a dataclass",
    ],
  },

  "Generator that lazily reads a 1GB CSV line-by-line with transformations. Context manager for timing code blocks (with TimerContext() as t:). Both tested.": {
    difficulty: "intermediate",
    overview:
      "Build two Python utilities that demonstrate memory-efficient programming: a generator that streams any-size CSV without loading it into memory, and a reusable context manager that times any block of code. Both show up constantly in production Python.",
    requirements: [
      "csv_reader(path, transform=None): a generator that yields one dict per row using csv.DictReader",
      "Optional transform function applied to each row before yielding",
      "Memory usage stays constant regardless of file size (test with memory_profiler)",
      "TimerContext: __enter__ records start time, __exit__ records end; `t.elapsed` gives seconds as float",
      "Also implement as a @contextmanager decorator version for comparison",
      "Unit tests for both: test generator yields correct rows, test TimerContext records non-zero elapsed time",
    ],
    acceptance: [
      "Processing a 100MB CSV never uses more than 5MB RAM (validate with memory_profiler)",
      "`with TimerContext() as t: time.sleep(0.1)` gives `t.elapsed` between 0.09 and 0.15",
      "Transform function is applied: `csv_reader('data.csv', transform=lambda r: {k: v.strip() for k,v in r.items()})`",
      "Tests pass: `pytest test_utils.py -v`",
    ],
    hints: [
      "A generator function uses `yield` — never accumulate rows in a list",
      "For __exit__(self, exc_type, exc_val, exc_tb): return False to not suppress exceptions",
      "Install memory_profiler: `pip install memory-profiler`; decorate with `@profile` and run with `python -m memory_profiler script.py`",
      "For the @contextmanager version: `from contextlib import contextmanager`",
    ],
  },

  "Async scraper: asyncio + aiohttp, fetches 10 URLs concurrently, Protocol-typed scraper/storage, full type hints (strict mypy). 10× faster than sync.": {
    difficulty: "intermediate",
    overview:
      "Build an async web scraper that fetches 10 URLs concurrently using asyncio and aiohttp. Define typed Protocol interfaces for the scraper and storage components. Benchmark against the synchronous version to see the 10× speedup in action.",
    requirements: [
      "ScraperProtocol: `async def fetch(url: str) → str`; AiohttpScraper implements it",
      "StorageProtocol: `def save(url: str, content: str) → None`; FileStorage and MemoryStorage implement it",
      "fetch_all(urls: list[str], scraper, storage): uses asyncio.gather or TaskGroup for concurrency",
      "Per-URL error handling — a failed URL logs the error but does not abort other fetches",
      "Benchmark script: measure sync (requests) vs async time for the same 10 URLs",
      "mypy --strict passes; all async functions have return type annotations",
    ],
    acceptance: [
      "Async version completes 10 fetches in roughly the time of the slowest single request",
      "Sync version takes approximately N × average_request_time",
      "A URL that returns 404 or times out is caught and logged, not raised",
      "`mypy --strict scraper.py` exits with zero errors",
    ],
    diagram: `
  Sync (sequential):
  ──[fetch 1]──[fetch 2]──[fetch 3]── ... ──[fetch 10]──▶
  Total time ≈ 10 × avg_request_time

  Async (concurrent with asyncio.gather):
        ┌──[fetch 1]────────────┐
        ├──[fetch 2]──────┐     │
        ├──[fetch 3]───────────┐│
  ──────├── ...          │    ││──▶  done!
        ├──[fetch 9]──┐  │    ││
        └──[fetch 10]─┴──┴────┘│
  Total time ≈ slowest single request
`,
    hints: [
      "Use `async with aiohttp.ClientSession() as session:` — one session for all requests",
      "asyncio.gather(*[fetch(url) for url in urls], return_exceptions=True) catches per-task exceptions",
      "Python 3.11+: prefer `asyncio.TaskGroup` over gather for better error handling",
      "Run with: `asyncio.run(main())` at the bottom of the file",
    ],
  },

  "Memoised recursive Fibonacci + partial application for a configurable validator + itertools pipeline: chain sources → islice → groupby → accumulate.": {
    difficulty: "intermediate",
    overview:
      "Implement three functional programming patterns: memoised recursion with @lru_cache, partial application to create configurable validator factories, and a lazy data pipeline using itertools operators. No for-loops where a higher-order function works better.",
    requirements: [
      "fibonacci(n): recursive, decorated with @functools.lru_cache(maxsize=None); returns correct values up to n=50",
      "make_validator(min_val, max_val): uses functools.partial to return a single-argument validator function",
      "Data pipeline: chain() two data sources → islice(n) → groupby(key_func) → accumulate each group",
      "Pipeline must be lazy — no intermediate lists created",
      "Demonstrate partial: `validate_age = make_validator(0, 150)` then `validate_age(25)` → True",
    ],
    acceptance: [
      "fibonacci(40) returns 102334155 and runs in < 1ms (memoised)",
      "validate_age(−1) returns False; validate_age(25) returns True",
      "Pipeline processes a 10,000-item source using < 1MB RAM (no intermediate list)",
      "No bare `for` loops in pipeline code — use map/filter/reduce/itertools",
    ],
    hints: [
      "@lru_cache converts any pure function into a memoised version automatically",
      "`functools.partial(validate, min_val=0, max_val=150)` fixes those two args; the result takes one arg",
      "`itertools.chain(iter1, iter2)` yields from iter1 then iter2 — no copy",
      "`itertools.groupby` requires the input to be sorted by the grouping key first",
    ],
  },

  "Process 100 images: sequential → ThreadPool (I/O) → ProcessPool (CPU resize). Benchmark all 3. Use asyncio for concurrent downloads.": {
    difficulty: "intermediate",
    overview:
      "Benchmark three concurrency strategies for an image processing pipeline: sequential, ThreadPoolExecutor (for I/O-bound downloads), and ProcessPoolExecutor (for CPU-bound resize/filter). Print a comparison table and explain why the GIL matters here.",
    requirements: [
      "Download 100 images from a public URL set (use Unsplash source or Picsum Photos)",
      "Resize each image to 256×256 using Pillow",
      "Strategy 1: Sequential download + resize",
      "Strategy 2: ThreadPoolExecutor(max_workers=20) for downloads, then sequential resize",
      "Strategy 3: asyncio download (aiohttp), then ProcessPoolExecutor(max_workers=4) for CPU resize",
      "Print a timing table: strategy | download_time | resize_time | total_time",
    ],
    acceptance: [
      "All 100 images are correctly resized and saved in the output directory",
      "ThreadPool is at least 5× faster than sequential for downloads",
      "ProcessPool is at least 2× faster than sequential for resize",
      "Timing table is printed at the end of the script",
    ],
    diagram: `
  Sequential:
  [dl 1][rs 1][dl 2][rs 2] ... [dl 100][rs 100]  → ~40s

  ThreadPool (I/O-bound downloads):
  [dl 1] ┐
  [dl 2] ├──▶ all finish ──▶ [rs 1][rs 2]...[rs 100]
  [dl 3] ┘
  (GIL released during network I/O — threads help!)   → ~5s

  ProcessPool (CPU-bound resize):
  downloads done ──▶ [rs 1][rs 2] ┐
                                   ├──▶ done!  → ~2s
                     [rs 3][rs 4] ┘
  (separate processes bypass GIL — CPUs run in parallel)
`,
    hints: [
      "Use `concurrent.futures.ThreadPoolExecutor` with `executor.map(download, urls)`",
      "For ProcessPoolExecutor, pass a file path (not a PIL Image) — objects must be picklable",
      "Use `time.perf_counter()` for sub-millisecond accuracy",
      "Picsum Photos API: `https://picsum.photos/seed/{i}/800/600` gives a different image per seed",
    ],
  },

  // ── PHASE 3: Low-Level Design ─────────────────────────────────────────────

  "Take a messy God-object order handler and refactor it to SOLID": {
    difficulty: "intermediate",
    overview:
      "You are given a single messy OrderHandler class that violates all 5 SOLID principles. Your task: identify each violation, refactor into well-separated classes, and document every change. This is the most important exercise in Phase 3.",
    requirements: [
      "Start from this god-object:\n```python\nclass OrderHandler:\n    def process_order(self, order_data: dict):\n        # Validate order\n        if not order_data.get('items'): raise ValueError('No items')\n        if order_data['total'] <= 0: raise ValueError('Bad total')\n        # Calculate discount\n        discount = 0\n        if order_data['customer_type'] == 'premium': discount = 0.1\n        elif order_data['customer_type'] == 'vip': discount = 0.2\n        final = order_data['total'] * (1 - discount)\n        # Save to DB\n        import sqlite3\n        conn = sqlite3.connect('orders.db')\n        conn.execute('INSERT INTO orders VALUES (?)', (final,))\n        conn.commit()\n        # Send email\n        import smtplib\n        server = smtplib.SMTP('smtp.gmail.com', 587)\n        server.sendmail('shop@co.com', order_data['email'], f'Total: {final}')\n        # Generate invoice\n        with open(f'invoice_{order_data[\"id\"]}.txt', 'w') as f:\n            f.write(f'Invoice\\nTotal: {final}')\n```",
      "Identify and document each SOLID violation: SRP (5 responsibilities in one class), OCP (discount if/elif chain), LSP, ISP, DIP (concrete imports inside methods)",
      "Refactor: OrderValidator, DiscountStrategy (ABC) + PremiumDiscount + VIPDiscount, OrderRepository (interface), NotificationService (interface), InvoiceGenerator",
      "Wire them together with dependency injection in an OrderProcessor class",
    ],
    acceptance: [
      "OrderProcessor receives all dependencies via __init__ — no concrete imports inside methods",
      "Adding a new discount type requires zero changes to existing classes (OCP satisfied)",
      "Each class has exactly one reason to change (SRP satisfied)",
      "Before/after comparison is documented in a README.md or code comments",
    ],
    diagram: `
  BEFORE (violations):
  ┌─────────────────────────────────────┐
  │         OrderHandler               │  ← SRP: 5+ responsibilities
  │  validate() + discount() +          │  ← DIP: concrete DB/email imports
  │  save_db() + send_email() +         │  ← OCP: discount if/elif chain
  │  generate_invoice()                 │
  └─────────────────────────────────────┘

  AFTER (SOLID):
  ┌────────────┐  ┌────────────────────┐
  │OrderValid- │  │DiscountStrategy    │  ← OCP: add new strategy
  │ator        │  │  (ABC)             │    without changing others
  └────────────┘  │  PremiumDiscount   │
  ┌────────────┐  │  VIPDiscount       │
  │OrderRepo-  │  └────────────────────┘
  │sitory(ABC) │  ┌────────────────────┐
  │SqliteRepo  │  │NotificationService │
  └────────────┘  │  (ABC)             │
  ┌────────────┐  │  EmailNotifier     │
  │InvoiceGen- │  └────────────────────┘
  │erator      │
  └────────────┘
        └──── all injected into ────▶ OrderProcessor.__init__
`,
  },

  "Notification system: Factory + Strategy routing + Builder for configs": {
    difficulty: "intermediate",
    overview:
      "Build a notification system that routes messages to the right channel using three design patterns working together: Factory to create channel objects, Strategy to route based on message type, and Builder to construct complex notification configurations.",
    requirements: [
      "NotificationChannel (ABC): send(message: Message) → DeliveryResult",
      "Channels: EmailChannel, SMSChannel, PushChannel, SlackChannel",
      "NotificationFactory: create(channel_type: str) → NotificationChannel",
      "RoutingStrategy (ABC): route(message: Message) → list[str] (channel types); implement UrgentStrategy, BatchStrategy, UserPreferenceStrategy",
      "NotificationConfig and NotificationConfigBuilder: fluent interface — .with_retry(3).with_fallback('sms').build()",
      "NotificationService: orchestrates factory + strategy + config",
    ],
    acceptance: [
      "NotificationFactory.create('email') returns an EmailChannel",
      "UrgentStrategy routes CRITICAL messages to ['push', 'sms'] and normal to ['email']",
      "Builder: `config = builder.with_retry(3).with_fallback('sms').build()` produces correct config",
      "Sending to a failing channel falls back to the configured fallback channel",
    ],
    diagram: `
  ┌──────────────────────────────────────────────┐
  │              NotificationService             │
  └────┬──────────────┬───────────────┬──────────┘
       │              │               │
  ┌────▼────┐  ┌──────▼──────┐  ┌────▼──────────┐
  │NotifFac-│  │RoutingStrat-│  │NotifConfig    │
  │tory     │  │egy (ABC)    │  │(from Builder) │
  └────┬────┘  │UrgentStrat  │  └───────────────┘
       │       │BatchStrat   │
  ┌────▼────────────────────────────────┐
  │  NotificationChannel (ABC)          │
  │  EmailChannel | SMSChannel          │
  │  PushChannel  | SlackChannel        │
  └─────────────────────────────────────┘
`,
  },

  "Caching proxy (DB call intercept + Redis) + logging decorator": {
    difficulty: "intermediate",
    overview:
      "Implement two structural patterns: the Proxy pattern to transparently cache expensive database calls (intercepting them before they reach the real DB), and the Decorator pattern to add structured logging to any function while preserving its signature.",
    requirements: [
      "DatabaseService interface: get_user(user_id: int) → dict, get_product(product_id: int) → dict",
      "CachingProxy wraps DatabaseService: checks Redis first, falls back to real DB, stores result with TTL",
      "LoggingDecorator: function decorator using functools.wraps; logs: function name, args, return value, execution time, exceptions",
      "CachingProxy and the real DB service are interchangeable (same interface)",
      "Tests using unittest.mock: mock Redis and DB, verify cache is checked before DB, verify cache is populated on miss",
    ],
    acceptance: [
      "Second call to `proxy.get_user(1)` does not call the real DB (cache hit)",
      "LoggingDecorator on any function preserves __name__, __doc__ (functools.wraps)",
      "An exception in the wrapped function is logged before being re-raised",
      "Unit tests pass with mocked Redis and DB",
    ],
    diagram: `
  Without Proxy:              With Caching Proxy:
  Client ──▶ DatabaseService  Client ──▶ CachingProxy ──▶ Redis
                                              │ cache miss
                                              └──▶ DatabaseService

  Logging Decorator:
  @log_calls
  def get_user(id):           get_user = log_calls(get_user)
      ...                     ┌──────────────────────────────────┐
                              │ log: "calling get_user(id=1)"     │
                              │ result = original_get_user(1)     │
                              │ log: "returned {id:1,name:'Bob'}" │
                              └──────────────────────────────────┘
`,
  },

  "Order State Machine: State + Observer for events + Command for undo/redo": {
    difficulty: "advanced",
    overview:
      "Model an e-commerce order lifecycle as a State Machine, where events drive state transitions, observers receive notifications, and Commands enable undo/redo. This combines three behavioral patterns in a realistic domain.",
    requirements: [
      "OrderState enum: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED",
      "OrderStateMachine: valid_transitions dict, transition(event) method, raises InvalidTransitionError",
      "Observer pattern: OrderEventObserver (ABC) + EmailObserver, AnalyticsObserver, InventoryObserver",
      "Command pattern: OrderCommand (ABC) with execute() and undo(); commands: ConfirmOrderCommand, CancelOrderCommand, ShipOrderCommand",
      "CommandHistory: execute(command), undo(), redo()",
    ],
    acceptance: [
      "PENDING → CONFIRMED → SHIPPED → DELIVERED is valid",
      "DELIVERED → PENDING raises InvalidTransitionError",
      "Cancelling a confirmed order calls undo logic (e.g., releases reserved inventory)",
      "CommandHistory.undo() reverses the last action; redo() re-applies it",
      "All 3 observers are notified on each transition",
    ],
    diagram: `
  State Transitions:
  ┌─────────┐  confirm  ┌───────────┐  ship   ┌─────────┐
  │ PENDING │──────────▶│ CONFIRMED │────────▶│ SHIPPED │
  └────┬────┘           └─────┬─────┘         └────┬────┘
       │ cancel               │ cancel              │ deliver
       ▼                      ▼                     ▼
  ┌───────────┐         ┌─────────────┐      ┌───────────┐
  │ CANCELLED │         │  CANCELLED  │      │ DELIVERED │
  └───────────┘         └─────────────┘      └─────┬─────┘
                                                   │ refund
                                              ┌────▼──────┐
                                              │ REFUNDED  │
                                              └───────────┘
  Command + Observer:
  User ──▶ ConfirmOrderCommand.execute()
               │
               ├──▶ StateMachine.transition(CONFIRMED)
               └──▶ Observers: Email ✉ | Analytics 📊 | Inventory 📦
`,
  },

  "Library: Book, Member, Loan, Reservation, Fine calculator. Observer for due-date alerts.": {
    difficulty: "advanced",
    overview:
      "Design a complete Library Management System with books, members, loans, reservations, and a fine calculator. This is a classic LLD interview question that tests your ability to model a real domain with complex business rules and relationships.",
    requirements: [
      "Book: isbn, title, author, total_copies, available_copies",
      "Member: id, name, email, loan_limit (default 3), active_loans list",
      "Loan: id, book, member, borrowed_at, due_date, returned_at; is_overdue property",
      "FineCalculator: compute_fine(loan) → Decimal (rate × overdue_days); configurable daily rate",
      "Reservation: member reserves a book when no copies available; first-in-queue gets notified when copy returned",
      "Library: borrow(member, book), return_book(loan), reserve(member, book), cancel_reservation",
      "DueDateObserver (ABC): notify(loan); EmailDueDateAlert, SMSDueDateAlert",
    ],
    acceptance: [
      "Borrowing when member is at loan_limit raises LoanLimitExceededError",
      "Returning an overdue book calculates the correct fine",
      "Returning a book with a reservation notifies the first member in the queue",
      "Member cannot borrow a book they already have on loan",
      "`mypy --strict library.py` exits with zero errors",
    ],
    diagram: `
  ┌──────────────────────────────────────────────────────┐
  │                     Library                          │
  │  borrow() | return_book() | reserve() | cancel()    │
  └────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
  ┌────▼────┐   ┌─────▼────┐  ┌─────▼──────────────┐
  │  Book   │   │  Member  │  │  Reservation Queue │
  │ isbn    │   │ id       │  │  (per Book)        │
  │ title   │   │ name     │  └────────────────────┘
  │ copies  │   │ loans[]  │
  └────┬────┘   └──────────┘
       │
  ┌────▼──────────────────┐   ┌──────────────────────┐
  │         Loan          │   │   FineCalculator      │
  │ book | member         │──▶│ compute_fine(loan)    │
  │ borrowed_at           │   │ = rate × overdue_days │
  │ due_date              │   └──────────────────────┘
  │ is_overdue (property) │
  └───────────────────────┘
  Observer:
  Loan due soon ──▶ DueDateAlert (ABC)
                    ├── EmailDueDateAlert
                    └── SMSDueDateAlert
`,
  },

  "Elevator: Elevator, Controller, Request, DispatchStrategy (SCAN/LOOK algorithm)": {
    difficulty: "advanced",
    overview:
      "Design an Elevator Control System that manages multiple elevators using interchangeable dispatch strategies. The SCAN algorithm services all requests in one direction before reversing; LOOK only goes as far as the outermost request. This is one of the top LLD interview questions.",
    requirements: [
      "ElevatorState enum: IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE",
      "Elevator: id, current_floor, state, capacity, passengers_count",
      "Request: floor (int), direction (UP/DOWN), request_type (INTERNAL from inside, EXTERNAL from hallway)",
      "ElevatorController: manages list of elevators, receives requests, uses strategy to assign",
      "DispatchStrategy (ABC): assign(request, elevators) → Elevator; implement SCANStrategy, LOOKStrategy",
      "simulate_step(): move each elevator one floor toward its next target",
    ],
    acceptance: [
      "SCAN strategy services all UP requests on the way up before coming back down",
      "LOOK strategy reverses when no more requests in current direction (not at top/bottom floor)",
      "A request for floor 5 going UP is assigned to the nearest available elevator",
      "ElevatorController correctly removes completed requests from queue",
    ],
    diagram: `
  Floors:  1  2  3  4  5  6  7  8  9  10
  SCAN:    ←──────────────────────────────▶
           Elevator goes all the way to 10,
           then all the way to 1 (regardless
           of whether requests exist there)

  LOOK:    ←──────────────────▶
           Elevator only goes to the
           outermost pending request (floor 7),
           then reverses immediately

  Class Structure:
  ┌─────────────────────────────────────┐
  │        ElevatorController           │
  │  elevators: list[Elevator]          │
  │  pending: list[Request]             │
  │  strategy: DispatchStrategy         │
  └───────────┬──────────────┬──────────┘
              │              │
  ┌───────────▼──┐  ┌────────▼──────────┐
  │   Elevator   │  │ DispatchStrategy  │
  │ current_floor│  │  (ABC)            │
  │ state        │  │  SCANStrategy     │
  │ targets: []  │  │  LOOKStrategy     │
  └──────────────┘  └───────────────────┘
`,
  },

  "Food delivery: Restaurant, Menu, Order, DeliveryAgent, RealTimeTracking.": {
    difficulty: "advanced",
    overview:
      "Design a food delivery platform (Zomato/Swiggy-style) that combines multiple design patterns: State for order lifecycle, Observer for real-time status updates, Strategy for delivery agent assignment, and Factory for creating order types.",
    requirements: [
      "Restaurant: id, name, menu (Menu), is_open; can_accept_order()",
      "Menu + MenuItem: MenuItem has name, price, category, is_available; Menu has add/remove/get_by_category",
      "Order: id, restaurant, customer, items (list[OrderItem]), state (OrderState enum), total",
      "DeliveryAgent: id, name, is_available, current_location, assigned_order",
      "AgentAssignmentStrategy (ABC): nearest_agent, fastest_eta; implement both",
      "RealTimeTracker: subscribe(order_id, callback); notify all subscribers on state change",
      "OrderState: PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED / CANCELLED",
    ],
    acceptance: [
      "Placing an order when restaurant is closed raises RestaurantClosedError",
      "RealTimeTracker notifies all subscribers when order state changes",
      "NearestAgentStrategy picks the closest available agent (use simple Euclidean distance)",
      "An unavailable agent is never assigned to an order",
    ],
    diagram: `
  ┌─────────────┐   places   ┌─────────────────────────────┐
  │  Customer   │───────────▶│           Order              │
  └─────────────┘            │  PLACED → ACCEPTED           │
  ┌─────────────┐            │  PREPARING → READY           │
  │ Restaurant  │◀── serves ─│  PICKED_UP → DELIVERED       │
  │ Menu        │            └──────────┬──────────┬─────────┘
  └─────────────┘                       │ assigns   │ notifies
                                        ▼           ▼
                              ┌──────────────┐  ┌──────────────────┐
                              │DeliveryAgent │  │RealTimeTracker   │
                              │ location     │  │subscribers map   │
                              │ is_available │  │notify(order, evt)│
                              └──────────────┘  └──────────────────┘
  AgentAssignment (Strategy):
  NearestAgentStrategy | FastestETAStrategy
`,
  },

  "Write 1-page design doc for each of your 4 LLD projects": {
    difficulty: "intermediate",
    overview:
      "Write a concise 1-page design document for each of your four major LLD projects (Library, Elevator, Food Delivery, Notification System). This is the practice of communicating design decisions clearly — a skill that separates senior engineers.",
    requirements: [
      "For each of the 4 projects, write one design doc with these sections:",
      "  1. Problem Statement (2-3 sentences: what does this system do?)",
      "  2. Key Classes & Relationships (class names, key attributes, how they relate)",
      "  3. Design Patterns Used (name the pattern + one sentence on why you chose it)",
      "  4. Key Trade-offs (what did you sacrifice for simplicity? What would change at scale?)",
      "  5. Open Questions (what would you need to know from a real PM to finish the design?)",
      "Each doc should be ≤ 400 words — concise > comprehensive",
    ],
    acceptance: [
      "4 design docs exist, one per project",
      "Each doc clearly states which patterns are used and why (not just 'I used Observer')",
      "Trade-offs section mentions at least one concrete limitation of the current design",
      "A reviewer unfamiliar with your code could understand the design from the doc alone",
    ],
    hints: [
      "Start with the problem statement — if you can't explain what the system does in 2 sentences, your design is too complex",
      "For patterns, say: 'I used Observer because I needed to notify multiple parties without the Order knowing who they are'",
      "Trade-offs example: 'FineCalculator uses a fixed daily rate — in production, rates would vary by membership tier'",
    ],
  },

  // ── PHASE 4: Testing & Code Quality ──────────────────────────────────────

  "Write pytest test suite for Library + Elevator systems: unit tests, edge cases, @pytest.mark.parametrize for multiple inputs. Aim for 90%+ coverage.": {
    difficulty: "intermediate",
    overview:
      "Write a comprehensive pytest test suite for your Library Management System and Elevator System. Target 90%+ code coverage using fixtures, parametrize, conftest.py, and proper edge-case testing.",
    requirements: [
      "Separate test files: test_library.py, test_elevator.py",
      "conftest.py: shared fixtures (e.g., fresh Library instance, set of Books and Members)",
      "@pytest.mark.parametrize for: fine calculation with different overdue days and rates, SCAN/LOOK strategy with different request sequences",
      "pytest.raises for: borrow at loan limit, overdue returns, invalid state transitions",
      "Coverage: `pytest --cov --cov-report=html` achieves ≥ 90% on both modules",
      "At least one integration-style test (e.g., full borrow → overdue → return → fine flow)",
    ],
    acceptance: [
      "`pytest -v test_library.py test_elevator.py` shows all tests passing",
      "HTML coverage report shows ≥ 90% line coverage",
      "All edge cases covered: empty library, all elevators in maintenance, member at loan limit",
      "Parametrize is used for at least 3 different sets of inputs",
    ],
    hints: [
      "Use `@pytest.fixture(scope='function')` for fresh state per test — don't share mutable state",
      "`@pytest.mark.parametrize('days,rate,expected', [(1, 1.0, 1.0), (5, 0.5, 2.5)])` drives multiple inputs",
      "Run `coverage report --show-missing` to see exactly which lines aren't covered",
      "Test the sad path (exceptions) as thoroughly as the happy path",
    ],
  },

  "TDD an 'expired reservation cleanup' service in your Library system: write tests first (Red), implement (Green), refactor. Mock the email notifier with @patch.": {
    difficulty: "intermediate",
    overview:
      "Use strict Test-Driven Development to build an expired reservation cleanup service. You must write every test BEFORE writing any implementation. Show your work through git commits at each TDD phase.",
    requirements: [
      "Service: cleanup_expired_reservations(library, days_before_expiry=2) → int (count cleaned)",
      "A reservation expires after 7 days in the queue if the member doesn't pick up",
      "Cleanup notifies the member by email (use EmailNotifier which you'll mock in tests)",
      "Write failing tests first (Red phase) — commit: 'test: add expired reservation cleanup tests (Red)'",
      "Implement minimum code to pass (Green phase) — commit: 'feat: implement cleanup service (Green)'",
      "Refactor for clarity (Refactor phase) — commit: 'refactor: extract expiry logic to Reservation class'",
      "Use `@patch('library.notifier.EmailNotifier.send')` to mock the email sender",
    ],
    acceptance: [
      "All 3 git commits exist with the correct messages",
      "Tests were written before any implementation (provable via git history)",
      "Mocked EmailNotifier.send is called once per expired reservation",
      "cleanup_expired_reservations returns the correct count",
      "Edge cases tested: no expired reservations, all reservations expired, boundary (exactly 7 days)",
    ],
    hints: [
      "Start by writing `test_no_expired_reservations()` — this forces you to define the function signature first",
      "`with patch('mymodule.EmailNotifier') as MockEmail:` patches it for the test's duration",
      "`mock.assert_called_once_with(expected_email)` verifies the mock was called correctly",
      "The Green phase should be the minimum code that makes tests pass — don't over-engineer yet",
    ],
  },

  "GitHub Actions workflow: pytest → mypy --strict → ruff check → black --check → coverage (fail if < 80%). pre-commit hooks for local enforcement.": {
    difficulty: "intermediate",
    overview:
      "Build a complete CI/CD quality gate using GitHub Actions that runs on every push and pull request. Enforce: tests must pass, types are correct, code is linted and formatted, and coverage stays above 80%. Add pre-commit hooks for local enforcement.",
    requirements: [
      ".github/workflows/ci.yml: trigger on push and pull_request to main",
      "Jobs (in order): test (pytest), type-check (mypy --strict), lint (ruff check .), format (black --check .), coverage (fail if < 80%)",
      "Each job should fail fast and report the exact error",
      ".pre-commit-config.yaml: hooks for ruff, black, mypy before each commit",
      "pyproject.toml: configure ruff rules, black line-length=88, mypy strict mode",
      "Branch protection: set main branch to require CI passing before merge",
    ],
    acceptance: [
      "Pushing a commit with a type error fails the mypy job with a clear error",
      "Pushing code with test coverage < 80% fails the coverage job",
      "Pre-commit hook catches a formatting issue before it reaches CI",
      "Badge in README shows CI status",
    ],
    diagram: `
  Push to GitHub
       │
       ▼
  ┌────────────────────────────────────┐
  │   GitHub Actions CI Pipeline       │
  ├─────────┬──────────┬───────────────┤
  │  pytest │   mypy   │ ruff + black  │
  │  tests  │ --strict │   --check     │
  │  pass?  │  pass?   │   pass?       │
  └────┬────┴────┬─────┴───────┬───────┘
       │         │             │
       ▼         ▼             ▼
  ┌─────────────────────────────────────┐
  │    Coverage Gate (>= 80%)           │
  └───────────────┬─────────────────────┘
                  │ all pass
                  ▼
           ✅ PR can be merged

  Local (pre-commit):
  git commit ──▶ ruff ──▶ black ──▶ mypy ──▶ commit succeeds
`,
    hints: [
      "Use `actions/setup-python@v5` and `pip install -r requirements-dev.txt`",
      "For coverage gate: `pytest --cov --cov-fail-under=80`",
      "Install pre-commit: `pip install pre-commit && pre-commit install`",
      "Use `continue-on-error: false` (default) so a job failure stops the pipeline",
    ],
  },

  // ── PHASE 5: Databases & Storage ─────────────────────────────────────────

  "Create 5 tables with 1M rows each. Run EXPLAIN ANALYZE before/after adding indexes.": {
    difficulty: "intermediate",
    overview:
      "Create five realistic PostgreSQL tables, seed each with 1 million rows, identify slow queries with EXPLAIN ANALYZE, add appropriate indexes, and document the before/after query time improvement. This is how real engineers debug slow databases.",
    requirements: [
      "Tables: users(id, email, country, created_at), orders(id, user_id, total, status, created_at), products(id, name, category, price), order_items(order_id, product_id, quantity, price), events(id, user_id, type, payload, created_at)",
      "Seed each table with 1M rows using PostgreSQL generate_series() — no Python loops",
      "Identify at least 5 slow queries (> 50ms): e.g., get orders by user, find events by type, join orders+items",
      "Add appropriate index types: B-tree for equality/range, composite for multi-column filters, partial for filtered queries (e.g., WHERE status = 'pending')",
      "Run EXPLAIN ANALYZE before and after each index; document query time improvement",
    ],
    acceptance: [
      "All 5 tables have exactly 1M rows (verify with SELECT COUNT(*))",
      "Seeding uses generate_series — no slow Python INSERT loops",
      "At least one composite index and one partial index are included",
      "Documentation shows EXPLAIN ANALYZE output before/after with actual timing numbers",
    ],
    diagram: `
  Schema:
  users ──────────── orders ──────── order_items
   id (PK)            id (PK)          order_id (FK)
   email              user_id (FK) ──▶ product_id (FK)
   country            total            quantity
   created_at         status
                      created_at       products
                                        id (PK)
                                        name
  events                                category
   id (PK)                              price
   user_id (FK)
   type
   payload (JSONB)
   created_at

  Indexes to add:
  CREATE INDEX ON orders(user_id);                    ← B-tree
  CREATE INDEX ON orders(status) WHERE status='pending'; ← Partial
  CREATE INDEX ON events(user_id, created_at DESC);   ← Composite
`,
    hints: [
      "Seed users: `INSERT INTO users SELECT i, 'user'||i||'@test.com', ... FROM generate_series(1,1000000) i`",
      "Run EXPLAIN (ANALYZE, BUFFERS) for real timing — not just EXPLAIN",
      "A Sequential Scan on 1M rows is the problem; an Index Scan is the solution",
      "Partial indexes are smallest and fastest when your WHERE clause is selective (e.g., only 1% of orders are 'pending')",
    ],
  },

  "Full Twitter schema: users, tweets, follows, likes, hashtags. Add indexes, explain choices.": {
    difficulty: "intermediate",
    overview:
      "Design a complete relational database schema for Twitter-like functionality. Start with an Entity-Relationship Diagram, write the SQL, then add indexes for the most common queries. This is a real system design interview exercise.",
    requirements: [
      "Tables: users(id, username, email, display_name, bio, created_at), tweets(id, user_id, content, reply_to_id, retweet_of_id, created_at), follows(follower_id, followed_id, created_at), likes(user_id, tweet_id, created_at), hashtags(id, tag), tweet_hashtags(tweet_id, hashtag_id)",
      "Constraints: unique (follower_id, followed_id) in follows, unique (user_id, tweet_id) in likes, CHECK content LENGTH ≤ 280",
      "Indexes for: get user's feed (tweets by followed users ordered by time), trending hashtags (count tweet_hashtags last 24h), user's liked tweets",
      "Draw the ERD first (can be ASCII in a README), then write CREATE TABLE SQL",
      "Write and EXPLAIN ANALYZE the 'get home feed' query for a user with 1000 followers",
    ],
    acceptance: [
      "All 6 tables created with correct constraints and foreign keys",
      "Unique constraint on follows prevents duplicate follows",
      "`EXPLAIN ANALYZE` of the feed query shows Index Scan (not Seq Scan) after indexes added",
      "ERD diagram exists (ASCII or image) showing all relationships",
    ],
    diagram: `
  ERD (Entity-Relationship):
  ┌───────────┐    follows    ┌───────────┐
  │   users   │──────────────│   users   │
  │ id (PK)   │◀─ follower   │           │
  │ username  │   followed ──▶           │
  │ email     │              └───────────┘
  └─────┬─────┘
        │ 1:many
  ┌─────▼─────────┐    tweet_hashtags    ┌─────────┐
  │    tweets     │─────────────────────│hashtags │
  │ id (PK)       │                     │ id (PK) │
  │ user_id (FK)  │                     │ tag     │
  │ content ≤280  │                     └─────────┘
  │ reply_to_id   │
  │ created_at    │
  └──────┬────────┘
         │ 1:many
  ┌──────▼────────┐
  │    likes      │
  │ user_id (FK)  │
  │ tweet_id (FK) │
  │ UNIQUE both   │
  └───────────────┘

  Key index:
  CREATE INDEX ON tweets(user_id, created_at DESC);
  -- Enables: SELECT * FROM tweets WHERE user_id = ANY(following)
  --          ORDER BY created_at DESC LIMIT 20;
`,
  },

  // ── PHASE 5 continued ─────────────────────────────────────────────────────

  "Gaming leaderboard: add scores, get top-10, user rank, paginate. FastAPI endpoint.": {
    difficulty: "intermediate",
    overview:
      "Build a real-time gaming leaderboard using Redis Sorted Sets — one of the best data structures for ranking. Expose it via a FastAPI endpoint and validate it handles 1 million entries.",
    requirements: [
      "Redis Sorted Set: key 'leaderboard', member = username, score = game score",
      "Operations: add_score(username, score), get_top_n(n=10), get_user_rank(username), get_page(page, page_size=10)",
      "FastAPI endpoints: POST /scores, GET /leaderboard?page=1&size=10, GET /leaderboard/rank/{username}",
      "Seed with 1 million fake entries and verify get_top_10 returns in < 1ms",
      "Use Pydantic models for request/response validation",
    ],
    acceptance: [
      "POST /scores adds/updates a score; second POST for same user overwrites",
      "GET /leaderboard returns top 10 sorted by score descending with rank numbers",
      "GET /leaderboard/rank/alice returns alice's 1-based rank and score",
      "With 1M entries, all read operations complete in < 10ms",
    ],
    hints: [
      "Redis ZADD: `r.zadd('leaderboard', {'alice': 1500})`",
      "Redis ZREVRANGE with WITHSCORES for top-N",
      "Redis ZREVRANK for user rank (0-indexed, add 1 for display)",
      "Use `redis.Redis(decode_responses=True)` to get strings back",
    ],
  },

  "Write a doc: shard key options for users table. Pros/cons of each.": {
    difficulty: "intermediate",
    overview:
      "Write a technical design document exploring different sharding strategies for a users table in a large-scale system. This is a written architecture exercise, not a coding task.",
    requirements: [
      "Analyse at least 3 sharding strategies: by user_id (range), by user_id (hash), by geography/country, by account creation year",
      "For each strategy: how data is distributed, what queries are efficient, what queries require scatter-gather, hotspot risk",
      "Explain: what is a hotspot and how each strategy handles it",
      "Recommend one strategy for a social media app with 500M users and explain the trade-offs",
      "Include a 'What changes at 10× scale?' section",
    ],
    acceptance: [
      "Document covers at least 3 shard key options",
      "Each option has at least 2 pros and 2 cons",
      "A clear recommendation with justification is given",
      "Document is < 600 words (concise > exhaustive)",
    ],
  },

  "For 4 systems choose consistency model + justify: bank, social feed, shopping cart, DNS": {
    difficulty: "intermediate",
    overview:
      "Choose the appropriate consistency model (strong, eventual, causal, monotonic read, etc.) for each of four real-world systems and justify your choice with reference to the system's requirements.",
    requirements: [
      "For each system, state: the consistency model you'd choose, why (reference CAP theorem), what failure mode you're accepting, one concrete example of what goes wrong if you choose wrong",
      "Bank account: what happens with eventual consistency? Why is strong consistency non-negotiable?",
      "Social feed: why is eventual consistency acceptable? What is the user impact of a stale feed?",
      "Shopping cart: why is availability over consistency preferred? (Amazon Dynamo paper)",
      "DNS: what consistency model does DNS use and why is it the right choice?",
    ],
    acceptance: [
      "All 4 systems analysed with a clear consistency model choice",
      "Each choice is justified with at least one concrete failure scenario",
      "CAP theorem referenced correctly (bank = CP, social feed = AP, etc.)",
      "Document is 2-3 sentences per system — brevity is required",
    ],
  },

  "For 5 scenarios choose right storage + justify: pics, leaderboard, full-text, logs, video": {
    difficulty: "intermediate",
    overview:
      "Choose the right storage technology for five different use cases and explain the reasoning. This is a classic system design warm-up question.",
    requirements: [
      "Profile pictures: S3/object storage — why not a database column?",
      "Gaming leaderboard: Redis Sorted Set — why not SQL ORDER BY?",
      "Full-text search (blog posts): Elasticsearch/OpenSearch — why not LIKE queries?",
      "Application logs: time-series DB (InfluxDB) or Clickhouse — why not PostgreSQL?",
      "Video streaming: object storage + CDN — why not a single server?",
      "For each: name the technology, explain the access pattern it optimises for, state one limitation",
    ],
    acceptance: [
      "5 storage choices made, each with a clear access-pattern justification",
      "Limitations acknowledged for each choice",
      "Each answer is 2-3 sentences",
    ],
  },

  // ── PHASE 6: API & Web Services ───────────────────────────────────────────

  "FastAPI Blog API: Users, Posts, Comments, Tags. JWT headers, pagination, proper HTTP codes.": {
    difficulty: "intermediate",
    overview:
      "Build a production-quality REST API for a blog platform using FastAPI, SQLAlchemy, and Pydantic. Implement JWT authentication, proper pagination, and correct HTTP status codes throughout.",
    requirements: [
      "Models: User, Post (title, content, tags, author), Comment (post, author, content), Tag",
      "Auth: JWT access token in Authorization: Bearer header; register (POST /auth/register), login (POST /auth/login → token)",
      "Endpoints: CRUD for posts (GET paginated, GET by id, POST, PUT, DELETE), CRUD for comments, GET /tags",
      "Pagination: page and size query params; response includes total, page, size, items",
      "HTTP codes: 200 OK, 201 Created, 400 Bad Request (validation), 401 Unauthorized, 403 Forbidden, 404 Not Found",
      "SQLAlchemy async session + Alembic migrations",
    ],
    acceptance: [
      "POST /auth/register returns 201 and user object",
      "GET /posts returns paginated results with correct metadata",
      "DELETE /posts/{id} by non-author returns 403",
      "GET /posts/{id} for non-existent post returns 404",
      "All endpoints validated with Pydantic (bad input returns 422)",
    ],
  },

  "Real-time chat: FastAPI + WebSockets. Rooms, Redis message history, presence tracking.": {
    difficulty: "advanced",
    overview:
      "Build a real-time chat service with WebSocket connections, chat rooms, Redis-backed message history, and user presence tracking. This introduces WebSocket lifecycle management and Redis pub/sub.",
    requirements: [
      "WebSocket endpoint: ws://host/ws/{room_id}?token=jwt",
      "ConnectionManager: tracks active connections per room; broadcast(room_id, message)",
      "Message history: store last 100 messages per room in Redis list (LPUSH + LTRIM)",
      "Presence: track online users per room in Redis Set; broadcast join/leave events",
      "Reconnection: on connect, send the last 20 messages as history",
      "Handle disconnect gracefully — remove from room and presence set",
    ],
    acceptance: [
      "Two browser tabs in the same room receive each other's messages in real time",
      "After reconnect, last 20 messages appear immediately",
      "Closing a tab removes the user from the presence list (others see 'user left')",
      "Redis stores messages as JSON strings with timestamp and sender",
    ],
  },

  "Order flow: REST API → Kafka producer → Consumer → Email/SMS. Handle retries.": {
    difficulty: "advanced",
    overview:
      "Build an async order processing pipeline that decouples order submission from fulfillment using Kafka. Handle retries with exponential backoff and dead-letter queues.",
    requirements: [
      "REST API (FastAPI): POST /orders → validate → publish to 'orders' Kafka topic → return 202 Accepted",
      "Kafka Producer: serialise order as JSON; use key=order_id for partition consistency",
      "Kafka Consumer: poll 'orders' topic; process each order (mock inventory check + payment)",
      "On failure: retry up to 3 times with exponential backoff (1s, 2s, 4s); send to 'orders-dlq' on final failure",
      "Email/SMS: send notification on success; send failure alert from DLQ consumer",
      "Log processing time per step (receive → process → notify)",
    ],
    acceptance: [
      "POST /orders returns 202 immediately without waiting for processing",
      "Failed processing retries 3 times before going to DLQ",
      "Successful order triggers email/SMS notification",
      "Log shows: order_id, step, timestamp, duration for each stage",
    ],
  },

  "FastAPI middleware: token bucket rate limiter using Redis. X-RateLimit-* headers, 429 responses.": {
    difficulty: "intermediate",
    overview:
      "Build a production-style rate limiter as FastAPI middleware using the token bucket algorithm backed by Redis. Return standard rate limit headers and 429 Too Many Requests when the bucket is empty.",
    requirements: [
      "Token bucket: capacity=100 tokens, refill_rate=10 tokens/second per IP",
      "Redis stores current tokens and last_refill timestamp per IP",
      "Middleware: on each request, calculate tokens to add since last_refill, cap at capacity, check if ≥1 token available",
      "Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset (Unix timestamp)",
      "Return 429 with Retry-After header when rate limited",
      "Test with locust or wrk to verify the limiter works under load",
    ],
    acceptance: [
      "First 100 requests in 1 second pass; 101st returns 429",
      "After 1 second, 10 new tokens are available",
      "X-RateLimit-Remaining header decrements correctly",
      "Rate limit is per IP address (extracted from X-Forwarded-For or request.client.host)",
    ],
  },

  "Add JWT auth: register, login, refresh tokens, role-based access. Protect endpoints.": {
    difficulty: "intermediate",
    overview:
      "Add a complete JWT authentication system to your Blog API: registration, login, access + refresh token pair, token refresh endpoint, and role-based access control (RBAC) using FastAPI dependencies.",
    requirements: [
      "POST /auth/register: hash password with bcrypt; return user (not password)",
      "POST /auth/login: verify password; return {access_token, refresh_token, token_type}",
      "Access token: 15-minute expiry; refresh token: 7-day expiry",
      "POST /auth/refresh: accept refresh token; return new access token",
      "Roles: 'user' and 'admin'; only admin can DELETE any post",
      "FastAPI dependency: `get_current_user(token)` → User; `require_role('admin')` → 403 if wrong role",
    ],
    acceptance: [
      "Login returns both access and refresh tokens",
      "Expired access token returns 401; using refresh token gets a new access token",
      "Non-admin trying to delete another user's post gets 403",
      "Passwords are never stored in plaintext (verify with a DB query)",
    ],
  },

  // ── PHASE 7: High-Level Design ────────────────────────────────────────────

  "Draw end-to-end: app calls api.twitter.com → DNS → TCP → TLS → HTTP → LB → App → DB": {
    difficulty: "intermediate",
    overview:
      "Draw a complete end-to-end network diagram showing every layer a request passes through from browser to database and back. This is a foundational mental model for system design interviews.",
    requirements: [
      "Use Excalidraw (excalidraw.com — free, no account needed) to draw the diagram",
      "Show each hop: Browser → DNS resolver → DNS root → DNS TLD → Twitter DNS → IP address",
      "TCP 3-way handshake: SYN → SYN-ACK → ACK",
      "TLS 1.3 handshake: Client Hello → Server Hello → Certificate → Finished",
      "HTTP/2 request → Load Balancer → App server → PostgreSQL",
      "Return path with caching: CDN for static assets, Redis for read-heavy data",
    ],
    acceptance: [
      "Diagram exists and is readable",
      "All 6 layers shown: DNS, TCP, TLS, HTTP, LB, App+DB",
      "Annotations explain what happens at each step",
      "Return path shown (response flows back through the same layers)",
    ],
  },

  "Estimate for Twitter: DAU, tweets/day, read/write ratio, storage/year, bandwidth.": {
    difficulty: "intermediate",
    overview:
      "Practice back-of-envelope estimation for Twitter. Interviewers use this to test your ability to reason about scale. Work through DAU, request volume, storage, and bandwidth systematically.",
    requirements: [
      "DAU: start from 330M total users → ~100M DAU (reasonable assumption)",
      "Tweets/day: assume each DAU tweets 0.5/day → 50M tweets/day",
      "Read/write ratio: Twitter is read-heavy; assume 100:1 → 5B reads/day",
      "Storage: tweet (280 chars = ~280 bytes) × 50M/day × 365 = X GB/year; add media separately",
      "Bandwidth: (read_requests_per_sec × avg_response_size) = Y GB/s",
      "Show your work clearly — each number should follow from the previous",
    ],
    acceptance: [
      "Estimates are within an order of magnitude of Twitter's reported numbers",
      "Each number is derived from the previous (show the chain of reasoning)",
      "Units are always stated: GB, GB/s, requests/second",
      "At least one 'reality check' — compare your storage estimate to something tangible",
    ],
    hints: [
      "100M DAU × 0.5 tweets = 50M tweets/day = 578 tweets/second (peak ~2×)",
      "280 bytes × 50M = 14GB of text/day. Add 10% metadata → ~15GB/day of text",
      "Media: assume 30% of tweets have an image (100KB) → 50M × 0.3 × 100KB = 1.5TB/day",
      "Bandwidth: 5B reads × 1KB avg response / 86400 sec ≈ 58 GB/s at read peak",
    ],
  },

  "Design URL shortener on Excalidraw FIRST (45 min) — then read the book chapter": {
    difficulty: "intermediate",
    overview:
      "Design a URL shortener (bit.ly clone) on Excalidraw before reading any solution. This forces you to reason through the design independently. Then compare your solution to the book approach.",
    requirements: [
      "API design: POST /api/v1/shorten {longUrl, customAlias?, expiry?} → {shortUrl}; GET /{code} → 301/302 redirect",
      "ID generation: base62 encoding (a-z, A-Z, 0-9) of an auto-increment ID or MD5 hash prefix",
      "Storage: URLs table (code, long_url, user_id, created_at, expiry_at, click_count)",
      "Analytics: track click_count, referrer, user_agent per redirect (async, don't block the redirect)",
      "Scale: handle 100M URLs, 1B redirects/day",
      "Draw the architecture on Excalidraw BEFORE reading the book — compare afterward",
    ],
    acceptance: [
      "Excalidraw diagram exists with API, service, DB, and cache layers",
      "ID generation strategy chosen and explained (base62 vs hash)",
      "Redirect uses 301 (permanent, browser caches) or 302 (temporary, tracks all visits) — state the trade-off",
      "Cache layer explained: what's cached, what's the TTL, what happens on a cache miss",
    ],
  },

  "Design Pastebin: paste storage (S3 + metadata DB), URL shortening, expiry, CDN": {
    difficulty: "intermediate",
    overview:
      "Design a Pastebin clone that stores text snippets, generates short URLs, and automatically expires content. This combines object storage, a relational metadata DB, CDN caching, and background cleanup jobs.",
    requirements: [
      "POST /pastes {content, expiry?, syntax?} → {url, paste_id}",
      "GET /pastes/{id} → 200 with content; 404 if expired or not found",
      "Storage: content in S3 (key = paste_id); metadata in PostgreSQL (id, s3_key, created_at, expires_at, size, syntax, view_count)",
      "Expiry: background job deletes expired rows from DB and objects from S3",
      "CDN: serve paste content via CloudFront with TTL = min(1 hour, remaining_expiry)",
      "Abuse prevention: max paste size 10MB; rate limit by IP",
    ],
    acceptance: [
      "Architecture diagram shows all components: API, DB, S3, CDN, cleanup job",
      "Expiry strategy is clearly explained (background job frequency, cleanup order)",
      "CDN TTL strategy handles expiry correctly (expired pastes not served from cache)",
      "Large paste (10MB) is stored in S3, not DB column",
    ],
  },

  "Full design doc + Excalidraw: Twitter feed. Fanout, timeline, caching, media. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design the Twitter home feed system end-to-end: how a tweet published by user A appears in the timeline of all A's followers. Choose between fanout-on-write vs fanout-on-read and justify for different user scales.",
    requirements: [
      "Timeline API: GET /timeline?user_id=X&cursor=Y → paginated tweet list",
      "Fanout-on-write: when Alice tweets, push to all followers' timeline caches (Redis list per user)",
      "Fanout-on-read: when Bob loads his feed, query all followed users' tweets and merge",
      "Hybrid approach: fanout-on-write for normal users (< 1M followers); fanout-on-read for celebrities",
      "Media: tweets with images → upload to S3 → CDN URLs in the tweet payload",
      "Caching: timeline cache (Redis), tweet cache (Redis), user cache (Redis) — explain TTL for each",
    ],
    acceptance: [
      "Architecture diagram covers all layers: mobile client, API gateway, timeline service, fanout worker, caches, DB",
      "Fanout strategy clearly justified with celebrity user edge case handled",
      "Cache invalidation strategy stated",
      "Design doc section explains the top-3 trade-offs made",
    ],
  },

  "Design WhatsApp: 1:1 + group, delivery receipts, presence, offline storage. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design WhatsApp's core messaging system with 1:1 and group chat, delivery receipts (sent ✓, delivered ✓✓, read 🔵), user presence (last seen), and offline message storage for when recipients are disconnected.",
    requirements: [
      "Message API: send via WebSocket when online; REST POST /messages when offline",
      "1:1 messaging: sender → server → recipient WebSocket; if offline → store in DB, push notification",
      "Group chat: sender → server → fan out to all group members (cap groups at 256 members)",
      "Delivery receipts: message_status (SENT, DELIVERED, READ); server acks delivery, recipient acks read",
      "Presence: user connects → mark online in Redis; disconnect → mark last_seen timestamp",
      "Offline storage: DynamoDB or PostgreSQL for undelivered messages; deliver on reconnect",
    ],
    acceptance: [
      "Architecture diagram shows WebSocket servers, message storage, push notification service, and presence service",
      "Delivery receipt flow is fully explained (who sends what ack to whom)",
      "Group message fanout handled without blocking the sender",
      "Offline message delivery flow is described step-by-step",
    ],
  },

  "Design Uber: driver matching (geohash), trip tracking, surge pricing, saga payment. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design Uber's core systems: real-time driver matching using geospatial indexing, live trip tracking via WebSocket, surge pricing based on supply/demand, and a distributed saga for payment processing.",
    requirements: [
      "Driver matching: geohash (or quadtree) to find drivers within 1km radius; sort by ETA",
      "Location updates: driver app sends GPS every 5s via WebSocket to Location Service; stored in Redis",
      "Trip lifecycle: REQUEST → MATCHING → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED",
      "Surge pricing: surge_multiplier = f(demand_last_5min / supply_last_5min); rounded to nearest 0.5×",
      "Payment saga: charge_card → release_driver_payment → update_trip_record; compensate on failure",
      "Scale: 5M trips/day, 1M active drivers",
    ],
    acceptance: [
      "Architecture diagram covers: rider app, driver app, matching service, location service, trip service, payment service",
      "Geohash or quadtree strategy explained with example",
      "Surge calculation formula stated",
      "Saga compensation steps described for each failure scenario",
    ],
  },

  "Design Google-style typeahead: trie vs DB, aggregation pipeline, caching hot queries. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design a search autocomplete system that suggests completions as users type. Compare trie vs database approaches, design an aggregation pipeline to identify trending queries, and cache the hottest completions.",
    requirements: [
      "API: GET /autocomplete?q=pyth → ['python', 'pytorch', 'pythagoras']",
      "Trie approach: in-memory trie per service instance; updated hourly from analytics DB; good for small prefix sets",
      "DB approach: query prefix match `WHERE query LIKE 'pyth%' ORDER BY search_count DESC LIMIT 10`; B-tree index on query",
      "Aggregation pipeline: Kafka captures every search event → Spark/Flink aggregates count per query per hour → writes to analytics DB",
      "Caching: top 10 suggestions for each prefix stored in Redis; TTL = 1 hour",
      "Personalisation (stretch): blend global suggestions with user's search history",
    ],
    acceptance: [
      "Architecture diagram shows: client, CDN/edge cache, autocomplete API, trie or DB, aggregation pipeline, Redis cache",
      "Trade-off between trie and DB clearly articulated",
      "Cache key design stated (e.g., `autocomplete:{prefix}`)",
      "Aggregation pipeline explained (events → aggregate → update suggestions)",
    ],
  },

  "Design YouTube: upload → async transcoding (Kafka) → CDN → view count → recommendations. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design YouTube's video platform: upload pipeline, async transcoding into multiple resolutions, CDN delivery, view count aggregation, and the recommendation engine.",
    requirements: [
      "Upload: chunked upload to S3 directly from browser → publish 'video.uploaded' Kafka event",
      "Transcoding: consumer picks up event → transcoders (multiple workers) produce 360p, 720p, 1080p → store in S3 → update video status in DB",
      "Delivery: CDN (CloudFront) serves .m3u8 manifests and .ts segments (HLS adaptive bitrate)",
      "View count: each view → Redis INCR → async batch write to DB every 30s (eventual consistency acceptable)",
      "Recommendations: pre-computed collaborative filtering scores; stored in a graph DB or Redis sorted set per user",
      "Scale: 500 hours of video uploaded per minute; 1B+ views/day",
    ],
    acceptance: [
      "Upload pipeline clearly shows: browser → S3 pre-signed URL → Kafka → transcoder",
      "CDN explains adaptive bitrate streaming (HLS) and segment caching",
      "View count eventual consistency choice justified",
      "Recommendations explained (pre-computed vs real-time and the trade-off)",
    ],
  },

  "Design payment system: idempotency key, double-entry ledger, saga, reconciliation. 45-min timed.": {
    difficulty: "advanced",
    overview:
      "Design a payment processing system with the correctness guarantees required for real money: idempotency keys to prevent double charges, double-entry bookkeeping for accurate ledgers, saga transactions for distributed payment flows, and reconciliation jobs.",
    requirements: [
      "POST /payments {amount, currency, source_token, idempotency_key} → {payment_id, status}",
      "Idempotency: store idempotency_key → result in DB; duplicate requests return cached result without re-charging",
      "Double-entry ledger: every transaction = debit one account + credit another; sum of all ledger entries = 0",
      "Saga: charge_customer → reserve_funds → payout_merchant; compensating transactions on failure",
      "Reconciliation: nightly job compares your ledger against Stripe/PayPal reports; flags discrepancies",
      "Strong consistency (no eventual consistency for money transfers)",
    ],
    acceptance: [
      "Duplicate POST with same idempotency_key returns the original result (not a new charge)",
      "Ledger entry creation is atomic (both debit and credit in the same transaction)",
      "Saga failure scenario: if payout_merchant fails, refund_customer compensation runs automatically",
      "Reconciliation process explained step-by-step",
    ],
  },

  // ── PHASE 8: Reliability & DevOps ────────────────────────────────────────

  "Circuit breaker + exponential backoff on Kafka order service. Kill services to watch it open/close.": {
    difficulty: "advanced",
    overview:
      "Implement a circuit breaker on your Kafka order processing service. Kill downstream services to watch the circuit open (stop calls), half-open (probe), and close (resume). Add exponential backoff for retries.",
    requirements: [
      "CircuitBreaker class: states CLOSED, OPEN, HALF_OPEN; failure threshold = 5 failures in 60s",
      "CLOSED → OPEN: after 5 consecutive failures; stops all calls immediately",
      "OPEN → HALF_OPEN: after 30s timeout; allows one test request",
      "HALF_OPEN → CLOSED: if test request succeeds; → OPEN if fails",
      "Exponential backoff: retry delays 1s, 2s, 4s, 8s before circuit opens",
      "Add Prometheus counter metrics: circuit_state, calls_total, failures_total",
    ],
    acceptance: [
      "Kill the downstream service → circuit opens after 5 failures",
      "30 seconds later → circuit goes HALF_OPEN → one test call made",
      "Restart downstream service → circuit closes; normal flow resumes",
      "Grafana dashboard shows circuit state changes as events",
    ],
  },

  "Add: structlog JSON logging, Prometheus metrics, OpenTelemetry traces, Grafana dashboard via docker-compose.": {
    difficulty: "advanced",
    overview:
      "Add full observability to your chat service: structured JSON logging with structlog, Prometheus metrics, distributed tracing with OpenTelemetry, and a Grafana dashboard — all running in docker-compose.",
    requirements: [
      "structlog: configure JSON output; include request_id, user_id, duration_ms in every log line",
      "Prometheus: expose /metrics endpoint; track: http_requests_total, http_request_duration_seconds, active_websocket_connections, messages_sent_total",
      "OpenTelemetry: trace each request through WebSocket → handler → Redis → response; export to Jaeger",
      "Grafana dashboard: panels for request rate, p50/p99 latency, error rate, active connections",
      "docker-compose: app + PostgreSQL + Redis + Prometheus + Grafana + Jaeger",
    ],
    acceptance: [
      "Every HTTP request produces a structured JSON log line with all required fields",
      "Grafana dashboard shows live metrics",
      "Jaeger UI shows distributed traces for WebSocket message flow",
      "docker-compose up --build starts the entire stack",
    ],
  },

  "Dockerize Blog API: multi-stage Dockerfile, docker-compose (PostgreSQL + Redis + API), health checks. Deploy to minikube with Deployment + Service.": {
    difficulty: "advanced",
    overview:
      "Containerize your Blog API with a production-quality multi-stage Dockerfile, wire it up in docker-compose with PostgreSQL and Redis, add health checks, and deploy to a local Kubernetes cluster using minikube.",
    requirements: [
      "Multi-stage Dockerfile: build stage (install deps, copy code) → runtime stage (slim Python, copy built artifacts, no dev tools)",
      "docker-compose.yml: blog-api, postgresql, redis services; named volumes for DB data; internal network",
      "Health checks: HEALTHCHECK in Dockerfile; depends_on with condition: service_healthy in compose",
      "minikube: Deployment (2 replicas), Service (LoadBalancer or NodePort), ConfigMap for env vars, Secret for DB password",
      "Kubernetes: `kubectl rollout status deployment/blog-api` shows healthy rollout",
    ],
    acceptance: [
      "`docker build` produces image < 200MB (multi-stage removes dev dependencies)",
      "`docker-compose up` starts all services; API is healthy",
      "`kubectl apply -f k8s/` deploys to minikube; `kubectl get pods` shows 2/2 Running",
      "Rolling update: changing the image version causes zero-downtime rollout",
    ],
  },

  "Deploy Blog API: Dockerize → registry → Railway/Render/Fly.io → GitHub Actions CI on every push → pytest + mypy + coverage gates.": {
    difficulty: "advanced",
    overview:
      "Deploy your Blog API to a real cloud platform with a full CI/CD pipeline. Every push triggers automated tests, type checking, and coverage gates before the image is built and deployed.",
    requirements: [
      "Push Docker image to GitHub Container Registry (ghcr.io) or Docker Hub on every main branch push",
      "Deploy to Railway, Render, or Fly.io using their GitHub integration or CLI",
      "GitHub Actions: test → type-check → coverage-gate → docker-build → deploy",
      "Environment variables managed via platform secrets (never in code)",
      "Deployment health check: workflow fails if deployed service doesn't respond within 60s",
    ],
    acceptance: [
      "Push to main → CI runs → if all gates pass → new version deployed automatically",
      "Push a failing test → CI fails → deployment does NOT happen",
      "Production URL returns 200 from GET /health",
      "Database migrations run automatically on deploy (not manually)",
    ],
  },

  // ── PHASE 9: Interview Preparation ───────────────────────────────────────

  "Write 'My LLD Playbook': 2-page cheat sheet of patterns you reach for first": {
    difficulty: "intermediate",
    overview:
      "Create a personal LLD playbook — a 2-page cheat sheet of the design patterns you've internalised, including when to use each and a 3-line Python sketch of the key structure. This becomes your mental checklist for every future LLD problem.",
    requirements: [
      "For each pattern (minimum 8): when to reach for it (trigger phrase), key classes involved, one-line trade-off",
      "Include: Factory, Strategy, Observer, State, Decorator, Proxy, Builder, Command",
      "For each: a 3-line Python class skeleton showing the essence",
      "Section: 'Questions I ask in every LLD interview' (scalability, persistence, concurrency, error handling)",
      "Keep it to 2 pages — the constraint forces prioritisation",
    ],
    acceptance: [
      "All 8+ patterns covered with trigger phrase + trade-off",
      "Python sketches are correct and idiomatic",
      "Document fits on 2 pages (letter/A4)",
      "You can explain any pattern from memory after writing it",
    ],
  },

  "Re-read all your LLD design docs from Phase 3. Annotate what you'd change now.": {
    difficulty: "intermediate",
    overview:
      "Review every design document you wrote in Phase 3 with fresh eyes after completing Phases 4-8. Annotate each with what you'd do differently now — this reflection exercise accelerates learning more than any new content.",
    requirements: [
      "Re-read: Library, Elevator, Food Delivery, Notification System design docs",
      "For each: add annotations (can be inline comments) of: what you'd change now, what you missed, what held up well",
      "Look specifically for: missing error handling, untested edge cases, scalability blindspots, pattern misuse",
      "Write a 'What changed in my thinking' summary paragraph per project",
    ],
    acceptance: [
      "All 4 design docs have annotations",
      "At least 2 concrete changes identified per project",
      "Summary paragraph written per project",
    ],
  },

  "Re-read ALL design docs from Phase 7. Annotate what you'd change now.": {
    difficulty: "advanced",
    overview:
      "Re-read your HLD design documents from Phase 7 with the additional context of Phase 8 (reliability, observability, deployment). Annotate with what you'd add now — retry logic, circuit breakers, caching, CDN, observability.",
    requirements: [
      "Review: URL Shortener, Pastebin, Twitter Feed, WhatsApp, Uber, Typeahead, YouTube, Payment design docs",
      "For each: annotate what Phase 8 topics you'd add now (observability, circuit breakers, health checks, etc.)",
      "Identify: which designs are most affected by reliability concerns",
      "Write: a 'Pre-interview checklist' — questions to ask yourself when drawing any HLD",
    ],
    acceptance: [
      "All 8 design docs annotated",
      "Reliability additions identified for at least 5 designs",
      "Pre-interview checklist written and covers: estimation, API design, storage, scale, failure modes",
    ],
  },

  "Write 1-page architecture doc BEFORE writing any code: components, data models, API contracts.": {
    difficulty: "advanced",
    overview:
      "Before writing a single line of code for your capstone Twitter clone, write a complete 1-page architecture document. This discipline — planning before coding — is the most important habit of senior engineers.",
    requirements: [
      "Section 1: System overview (what does it do, who uses it, what scale do we target?)",
      "Section 2: Components (list each service/layer with its responsibility in one sentence)",
      "Section 3: Data models (key entities and their fields — not full schemas, just the important ones)",
      "Section 4: API contracts (key endpoints: method, path, request body, response body)",
      "Section 5: Open questions (things you need to decide before writing code)",
      "Constraint: 1 page, decisions made upfront, no implementation details",
    ],
    acceptance: [
      "All 5 sections present",
      "Data models are clear enough that a teammate could start implementing a service",
      "API contracts specify at least 5 endpoints with request/response shapes",
      "Open questions section has at least 3 genuine unresolved decisions",
    ],
  },

  "Set up: FastAPI + PostgreSQL + Redis + Kafka in docker-compose. Schema + migrations working.": {
    difficulty: "advanced",
    overview:
      "Set up the complete infrastructure stack for your Twitter capstone project: FastAPI app, PostgreSQL, Redis, and Kafka — all in docker-compose with proper networking, health checks, and Alembic migrations.",
    requirements: [
      "docker-compose.yml: fastapi, postgresql (15), redis (7), zookeeper, kafka (Confluent Platform or Bitnami)",
      "FastAPI: health endpoint GET /health → {status: 'ok', db: 'connected', redis: 'connected', kafka: 'connected'}",
      "PostgreSQL: Alembic migrations for initial schema (users, tweets tables)",
      "Kafka: create topics 'tweets' and 'notifications' on startup",
      "All services connected on internal Docker network; only FastAPI port exposed",
    ],
    acceptance: [
      "`docker-compose up` starts all services without errors",
      "GET /health returns all components as 'connected'",
      "`alembic upgrade head` creates the schema",
      "Kafka topic 'tweets' exists and accepts test messages",
    ],
  },

  "User service (JWT auth) + Tweet service + Follow service. Apply all your LLD patterns.": {
    difficulty: "advanced",
    overview:
      "Build the three core services of your Twitter capstone: User Service (registration, login, JWT), Tweet Service (create, read, delete), and Follow Service (follow, unfollow, followers/following lists). Apply your LLD patterns throughout.",
    requirements: [
      "User Service: POST /auth/register, POST /auth/login → JWT, GET /users/{id}, PATCH /users/{id}",
      "Tweet Service: POST /tweets (auth required), GET /tweets/{id}, DELETE /tweets/{id} (owner only), GET /users/{id}/tweets (paginated)",
      "Follow Service: POST /follows (follow user), DELETE /follows/{user_id} (unfollow), GET /users/{id}/followers, GET /users/{id}/following",
      "Apply: Repository pattern for DB access, Service layer for business logic, Dependency injection throughout",
      "All endpoints tested with pytest; mypy --strict passes",
    ],
    acceptance: [
      "Registration creates a user; login returns a valid JWT",
      "POST /tweets without auth returns 401",
      "GET /users/{id}/followers returns paginated list of follower objects",
      "`pytest --cov` shows ≥ 80% coverage across all three services",
    ],
  },

  "Feed (fan-out via Redis) + Kafka notifications + Prometheus metrics + Grafana dashboard.": {
    difficulty: "advanced",
    overview:
      "Build the Twitter feed with fan-out-on-write via Redis, a Kafka-based notification system, and full Prometheus + Grafana observability. This is where all your skills from the roadmap converge.",
    requirements: [
      "Feed Service: GET /feed → reads from Redis timeline list (fan-out-on-write); falls back to DB on cache miss",
      "Fan-out worker: Kafka consumer for 'tweets' topic; pushes tweet_id to all followers' Redis lists (LPUSH + LTRIM to 200)",
      "Notification Service: Kafka consumer for 'notifications' topic; stores in-app notifications in DB",
      "Prometheus: expose metrics for feed latency, fan-out duration, Kafka consumer lag",
      "Grafana: dashboard showing feed p50/p99 latency, fan-out time, notification delivery rate",
    ],
    acceptance: [
      "New tweet appears in follower's feed within 1 second",
      "Feed GET returns cached Redis data in < 5ms (not DB query)",
      "Grafana dashboard shows live feed latency",
      "Celebrity user (1M followers) fan-out is handled asynchronously without blocking the tweet endpoint",
    ],
  },

  "Deploy to cloud with CI/CD. README with Excalidraw architecture diagram.": {
    difficulty: "advanced",
    overview:
      "Deploy your complete Twitter capstone to a real cloud platform with a full CI/CD pipeline. Write a professional README with an architecture diagram that you can share in job applications and interviews.",
    requirements: [
      "Deploy to Railway, Render, or fly.io; database hosted on Neon or Supabase",
      "GitHub Actions: test → lint → type-check → build Docker image → push to registry → deploy",
      "README: project overview, architecture diagram (Excalidraw export), tech stack, local setup guide, API docs link",
      "Architecture diagram: shows all components (services, DB, Redis, Kafka, CDN) with data flow arrows",
      "The deployed app is publicly accessible and linked in README",
    ],
    acceptance: [
      "Production URL responds correctly",
      "README has architecture diagram and local setup instructions that actually work",
      "GitHub Actions workflow badge shows passing",
      "Any reviewer can run the project locally with `docker-compose up`",
    ],
  },

  "Record a 10-min Loom video: architecture decisions, trade-offs, what you'd change at 10x scale.": {
    difficulty: "intermediate",
    overview:
      "Record a 10-minute Loom video walking through your Twitter capstone's architecture. This is interview practice — you'll be asked to explain your design decisions and trade-offs under pressure.",
    requirements: [
      "Screen share your Excalidraw architecture diagram throughout",
      "Minute 1-2: What does the system do? Who uses it? (the pitch)",
      "Minute 3-5: Walk through a tweet being created — all the way from API call to fan-out",
      "Minute 6-8: Top 3 trade-offs you made and why",
      "Minute 9-10: What would change at 10× scale? (horizontal scaling, sharding, CDN)",
      "Keep it under 10 minutes — conciseness is the skill",
    ],
    acceptance: [
      "Loom video is public and link is in README",
      "All required sections covered in under 10 minutes",
      "Architecture diagram is visible throughout",
      "Trade-offs are specific (e.g., 'I chose fan-out-on-write because...') not vague",
    ],
  },

  "Write a LinkedIn post: your journey. Key lessons + what you built.": {
    difficulty: "beginner",
    overview:
      "Write a LinkedIn post sharing your system design learning journey. This is a career-building exercise — sharing publicly reinforces learning, builds your network, and demonstrates your growth to potential employers.",
    requirements: [
      "Opening hook: one sentence that makes people want to read more (not 'Excited to share...')",
      "Journey: 2-3 sentences on where you started vs where you are now",
      "What you built: list 3-5 projects with one concrete detail per project",
      "Key lessons: 2-3 things that surprised you or changed how you think",
      "Call to action: invite conversation (e.g., 'What would you design differently?')",
      "Hashtags: #systemdesign #python #softwarearchitecture (at the end, not throughout)",
    ],
    acceptance: [
      "Post is between 150-400 words",
      "Opening hook does NOT start with 'I' or 'Excited'",
      "At least 3 concrete projects mentioned",
      "Post is published publicly on LinkedIn",
    ],
    hints: [
      "Best opening hooks: a surprising stat, a question, or a bold statement",
      "Be specific: 'I built a Redis leaderboard that handles 1M entries in < 1ms' > 'I learned Redis'",
      "Vulnerability works: 'The hardest part was...' gets more engagement than pure achievement posts",
    ],
  },

  // ── PHASE 8 continued: Reliability ───────────────────────────────────────

  "Write 'HLD Lessons Learned': top 5 things you do differently now vs Week 32": {
    difficulty: "intermediate",
    overview:
      "Write a personal retrospective on your HLD journey: the 5 most important things you'd do differently if you started Phase 7 again. This reflection exercise consolidates everything you've learned.",
    requirements: [
      "5 concrete lessons, each with: what you did wrong, what you'd do now, one real example from your designs",
      "Compare: your Week 32 mindset vs your current mindset on at least 2 topics",
      "Topics to consider: estimation, storage choices, caching strategy, failure handling, API design",
      "Document is personal — no generic advice, only things you actually learned the hard way",
    ],
    acceptance: [
      "5 lessons identified, each with a specific example",
      "Before/after comparison for at least 2 topics",
      "Document reads as personal reflection, not a tutorial",
    ],
  },
};
