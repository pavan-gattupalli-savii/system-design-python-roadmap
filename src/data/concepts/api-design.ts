import type { Concept } from "./index";

export const apiDesign: Concept = {
  slug:     "api-design",
  title:    "API Design",
  emoji:    "🔌",
  category: "Architecture",
  tagline:  "Designing APIs that developers actually enjoy",
  roadmapKeywords: ["api", "rest", "graphql", "grpc", "endpoint", "http", "idempotent", "versioning", "pagination"],
  related:  ["load-balancing", "rate-limiting", "microservices"],

  sections: [
    {
      heading: "What Makes a Good API?",
      body: `An API (Application Programming Interface) is a contract between two systems. A good API is one that developers can understand and use correctly without reading the implementation — it should be intuitive, consistent, and predictable.

The qualities of a great API:
1. Predictability: similar operations look similar. If GET /users/:id returns a user, GET /orders/:id should return an order in the same shape.
2. Consistency: naming conventions, field formats (snake_case vs camelCase), date formats (ISO 8601), pagination shape — all uniform across every endpoint.
3. Discoverability: a developer can infer what endpoints exist from the ones they already know. /users → /users/:id → /users/:id/orders follows naturally.
4. Idempotency: safe to retry. Calling the same endpoint twice produces the same result — crucial for reliability in distributed systems.
5. Good error messages: HTTP status codes + error body that tells the developer exactly what went wrong and how to fix it.`,
    },
    {
      heading: "REST — Representational State Transfer",
      body: `REST is the dominant architectural style for HTTP APIs. It's not a protocol or standard — it's a set of constraints that, when followed, produce scalable, cacheable, and stateless APIs.

Roy Fielding's 6 REST constraints:
1. Client-Server: UI concerns separated from data storage concerns. Client and server evolve independently.
2. Stateless: every request from client to server must contain all information needed to understand the request. No session stored on the server between requests. Session state is client-side.
3. Cacheable: responses must declare themselves cacheable or non-cacheable. Caching eliminates repeated identical requests.
4. Uniform Interface: the defining constraint of REST. Achieved via: resource identification in URIs, manipulation via representations, self-descriptive messages, HATEOAS (hypermedia as the engine of application state).
5. Layered System: client doesn't know if it's talking directly to the server or through intermediaries (LBs, caches, gateways). Intermediaries are transparent.
6. Code on Demand (optional): servers can send executable code (JavaScript) to clients.`,
    },
    {
      heading: "HTTP Methods and Idempotency",
      table: {
        cols: ["Method", "Operation", "Safe?", "Idempotent?", "Request body?", "Use for"],
        rows: [
          ["GET",    "Read",             "Yes", "Yes", "No",       "Fetch resource(s). Never use GET for writes — it's cached and bookmarked."],
          ["POST",   "Create",           "No",  "No",  "Yes",      "Create a new resource. NOT idempotent — two POSTs create two resources."],
          ["PUT",    "Replace",          "No",  "Yes", "Yes",      "Replace entire resource. Idempotent — same PUT twice gives same result."],
          ["PATCH",  "Partial update",   "No",  "No*", "Yes",      "Partial update. Can be made idempotent with conditional requests (If-Match ETag)."],
          ["DELETE", "Delete",           "No",  "Yes", "Optional", "Delete resource. Idempotent — deleting an already-deleted resource returns 404 but doesn't error."],
          ["HEAD",   "Read (no body)",   "Yes", "Yes", "No",       "Same as GET but response has no body. Used to check if resource exists or get headers."],
          ["OPTIONS","Capabilities",     "Yes", "Yes", "No",       "CORS preflight. Returns allowed methods for a resource."],
        ],
      },
      callout: {
        kind: "note",
        text: "Safe means the operation doesn't change server state. Idempotent means calling it N times has the same effect as calling it once. A GET is both safe and idempotent. A DELETE is not safe (it changes state) but is idempotent (deleting twice is same as deleting once). A POST is neither — two identical POSTs create two records.",
      },
    },
    {
      heading: "REST vs GraphQL vs gRPC",
      table: {
        cols: ["Property", "REST", "GraphQL", "gRPC"],
        rows: [
          ["Protocol",          "HTTP/1.1 or HTTP/2",               "HTTP/1.1 or HTTP/2",                           "HTTP/2 (required)"],
          ["Format",            "JSON (or XML)",                     "JSON",                                          "Protocol Buffers (binary)"],
          ["Schema",            "OpenAPI/Swagger (optional)",        "Strongly typed schema (required)",              "Strongly typed .proto files (required)"],
          ["Fetching",          "Fixed response shape per endpoint", "Client specifies exact fields needed (no over/under-fetching)", "Fixed methods defined in .proto"],
          ["Over-fetching",     "Common — GET /users returns all fields even if you need only name", "Eliminated — query { user(id: 1) { name } }", "Eliminated — message types are specific"],
          ["Under-fetching",    "Common — need /users + /users/1/orders (N+1 problem)", "Eliminated — single query fetches everything", "Eliminated — client defines what it needs"],
          ["Real-time",         "Webhooks or polling",               "Subscriptions (WebSocket)",                    "Server streaming, bidirectional streaming"],
          ["Performance",       "Good",                              "Good (but resolver overhead)",                  "Excellent (binary, multiplexing, streaming)"],
          ["Browser support",   "Native",                            "Native",                                        "Requires grpc-web proxy for browsers"],
          ["Best for",          "Public APIs, CRUD services, external consumers", "Complex data graphs, mobile apps, BFFs (backend for frontend)", "Internal service-to-service, low latency, streaming, mobile gRPC"],
        ],
      },
    },
    {
      heading: "API Versioning Strategies",
      body: `APIs evolve. Adding new fields to a response is usually backward compatible. Removing fields, changing field types, or changing behaviour breaks existing clients. Versioning lets you make breaking changes while supporting old clients.`,
      table: {
        cols: ["Strategy", "Example", "Pros", "Cons"],
        rows: [
          ["URL path versioning",      "GET /api/v2/users",                            "Explicit, easy to route, cacheable, easy to see in browser", "Clutters URLs; must maintain N parallel code paths"],
          ["Header versioning",        "Accept: application/vnd.api+json; version=2", "Clean URLs; version is metadata, not path", "Not cacheable by CDNs (varies by header); less visible; harder to test in browser"],
          ["Query parameter",          "GET /api/users?version=2",                    "Easy to test in browser",                   "Can be cached incorrectly if CDN doesn't vary on query params"],
          ["Content negotiation",      "Accept: application/vnd.company.v2+json",     "RESTful; self-describing",                  "Complex; not widely adopted; poor tooling support"],
        ],
      },
      callout: {
        kind: "tip",
        text: "URL path versioning (/v1/, /v2/) is the most pragmatic choice for most teams. It's explicit, CDN-cacheable, and easy to route at the API gateway. Use it by default unless you have a specific reason for header versioning.",
      },
    },
    {
      heading: "Pagination — Handling Large Collections",
      table: {
        cols: ["Strategy", "How it works", "Pros", "Cons", "Best for"],
        rows: [
          ["Offset pagination", "GET /users?offset=200&limit=50 — skip N rows, return M", "Simple to implement; allows jumping to arbitrary page", "Slow for large offsets (DB scans N rows to skip); page drift (inserts/deletes shift items)", "Admin UIs with page numbers; small-to-medium datasets"],
          ["Cursor pagination", "GET /users?cursor=eyJ1c2VyX2lkIjoxMjN9&limit=50 — cursor is an opaque pointer to position", "Stable (insertions/deletions don't affect pages); efficient for large data", "Can't jump to arbitrary page; cursor must be opaque to client", "Infinite scroll; feeds; real-time data; large datasets"],
          ["Keyset pagination", "GET /users?after_id=12345&limit=50 — explicitly use a sortable key column", "Very efficient (uses index); predictable performance", "Requires sortable key; can't use arbitrary sort columns", "Time-series data; any table with a monotonic ID or timestamp"],
        ],
      },
    },
    {
      heading: "HTTP Status Codes Cheat Sheet",
      table: {
        cols: ["Range", "Category", "Key codes"],
        rows: [
          ["2xx", "Success",       "200 OK, 201 Created, 204 No Content (DELETE success)"],
          ["3xx", "Redirect",      "301 Moved Permanently, 302 Found (temporary), 304 Not Modified (cached)"],
          ["4xx", "Client error",  "400 Bad Request (validation), 401 Unauthorized (not logged in), 403 Forbidden (logged in but no permission), 404 Not Found, 409 Conflict (duplicate), 422 Unprocessable Entity (semantic validation), 429 Too Many Requests"],
          ["5xx", "Server error",  "500 Internal Server Error, 502 Bad Gateway (upstream failed), 503 Service Unavailable (overloaded/maintenance), 504 Gateway Timeout (upstream too slow)"],
        ],
      },
      callout: {
        kind: "warning",
        text: "Never return 200 OK with an error body ({ 'status': 'error' }). This breaks HTTP clients, monitoring tools, and CDN caching. Use the correct HTTP status code and put the error detail in the body. Your clients' health checks and alerting depend on it.",
      },
    },
  ],
};
