import { Category } from '../types';

export const backendCategories: Category[] = [
  // 1. REST APIs
  {
    id: 'rest-apis',
    name: 'REST APIs',
    slug: 'rest-apis',
    description: 'Design and build RESTful APIs with best practices',
    icon: 'cloud-outline',
    color: '#2196F3',
    colorDark: '#1976D2',
    premium: false,
    learnContent: [
      {
        id: 'rest-1',
        title: 'REST Principles',
        content: `REST (Representational State Transfer) is an architectural style for networked applications.

• Client-Server: separation of concerns
• Stateless: each request contains all info needed
• Cacheable: responses can be cached
• Uniform Interface: standardized resource operations
• Layered System: client doesn't know if connected directly
• Resource-based: everything is a resource with a URI`,
        codeExample: `// RESTful URL patterns
GET    /users          # List all users
GET    /users/123      # Get user 123
POST   /users          # Create new user
PUT    /users/123      # Update user 123 (full)
PATCH  /users/123      # Update user 123 (partial)
DELETE /users/123      # Delete user 123

// Nested resources
GET    /users/123/posts     # User's posts
POST   /users/123/posts     # Create post for user`
      },
      {
        id: 'rest-2',
        title: 'HTTP Methods & Status Codes',
        content: `Use HTTP methods semantically and return appropriate status codes.

• GET: retrieve resource (idempotent, safe)
• POST: create resource (not idempotent)
• PUT: replace resource (idempotent)
• PATCH: partial update (not always idempotent)
• DELETE: remove resource (idempotent)

Common status codes:
• 2xx Success: 200 OK, 201 Created, 204 No Content
• 4xx Client Error: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable
• 5xx Server Error: 500 Internal Server Error, 503 Service Unavailable`,
        codeExample: `// Express.js example
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);  // 201 Created
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });  // client's fault
    } else {
      res.status(500).json({ error: 'Server error' });  // our fault
    }
  }
});

app.delete('/users/:id', async (req, res) => {
  const deleted = await User.delete(req.params.id);
  // 404 when the resource never existed (or already gone)
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();  // 204 No Content
});`
      },
      {
        id: 'rest-3',
        title: 'API Versioning & Pagination',
        content: `Version your APIs and paginate large datasets.

Versioning strategies:
• URL path: /api/v1/users (most common)
• Query param: /api/users?version=1
• Header: Accept: application/vnd.api.v1+json
• Content negotiation

Pagination patterns:
• Offset: ?page=2&limit=20 (simple but slow for large offsets)
• Cursor: ?cursor=abc123&limit=20 (better for real-time)
• Keyset: ?after_id=100&limit=20 (efficient)
• Include metadata: total, hasNext, hasPrev`,
        codeExample: `// Pagination response
{
  "data": [...],
  // metadata lets clients build page controls
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  },
  // ready-made URLs so clients never build them by hand
  "links": {
    "self": "/api/v1/users?page=2",
    "next": "/api/v1/users?page=3",
    "prev": "/api/v1/users?page=1",
    "first": "/api/v1/users?page=1",
    "last": "/api/v1/users?page=8"
  }
}

// Cursor-based (better for real-time data)
{
  "data": [...],
  "cursor": {
    "next": "eyJpZCI6MTIzfQ==",  // opaque token, not a page number
    "hasMore": true
  }
}`
      },
      {
        id: 'rest-4',
        title: 'Request Validation & Error Handling',
        content: `Validate inputs and return consistent error responses.

Validation layers:
• Schema validation (JSON Schema, Joi, Zod)
• Business rule validation
• Database constraints

Error response format:
• Use consistent structure
• Include error code for programmatic handling
• Provide human-readable message
• Add details for debugging (dev only)
• Consider RFC 7807 Problem Details`,
        codeExample: `// Zod validation
import { z } from 'zod';

// Schema declares the shape once; reused for parsing + types
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(0).optional()
});

app.post('/users', async (req, res) => {
  // safeParse never throws; returns success flag + issues
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: result.error.issues
    });
  }

  // Proceed with validated data
  const user = await User.create(result.data);
  res.status(201).json(user);
});

// Consistent error format (RFC 7807)
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Email format is invalid",
  "instance": "/users",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}`
      },
      {
        id: 'rest-5',
        title: 'HATEOAS & API Documentation',
        content: `HATEOAS (Hypermedia as the Engine of Application State) provides discoverability.

HATEOAS benefits:
• Self-documenting responses
• Clients discover available actions
• Reduces coupling to URL structure
• Enables API evolution

Documentation:
• OpenAPI/Swagger specification
• Auto-generate from code or vice versa
• Interactive documentation (Swagger UI)
• Include examples and error responses`,
        codeExample: `// HATEOAS response
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  // _links advertise what the client can do next
  "_links": {
    "self": { "href": "/users/123" },
    "posts": { "href": "/users/123/posts" },
    "update": { "href": "/users/123", "method": "PUT" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}

// OpenAPI spec snippet
paths:
  /users:
    post:
      summary: Create a new user
      requestBody:
        required: true  # body schema is machine-checkable
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'  # reusable shape
      responses:  # document every outcome, not just 2xx
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Validation error`
      },
      {
        id: 'rest-6',
        title: 'Beyond REST: GraphQL & gRPC',
        content: `REST is not the only API style. Each tool fits different problems.

GraphQL:
• Single endpoint; client sends a typed query describing exactly the fields it wants
• Avoids over- and under-fetching
• Schema is the contract; introspection enables tooling (codegen, IDE help)
• Pain points: caching is harder (everything is POST), N+1 problem (use DataLoader), authorization at field level, performance unpredictability
• Fits product APIs with diverse client needs (web + mobile + partner)

gRPC:
• HTTP/2-based RPC, binary Protocol Buffers
• Strongly typed contracts in .proto, codegen for many languages
• Streaming: client-stream, server-stream, bidirectional
• Fast and tight; awkward in browsers (need grpc-web proxy)
• Fits internal microservice communication and high-throughput backend-to-backend

REST stays best for:
• Public APIs (simple, cacheable, anyone can curl it)
• Resource-oriented domains
• HTTP caching matters

Modern reality: many companies use all three — REST for public + simple internal APIs, GraphQL for product surfaces, gRPC for service-to-service. Pick by problem, not by hype.`,
        codeExample: `# gRPC .proto
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc StreamEvents(EventFilter) returns (stream Event);  # server-streaming
}

# GraphQL schema
type User {
  id: ID!
  name: String!
  posts(first: Int!): [Post!]!
}

type Query {
  user(id: ID!): User
}

# GraphQL query — client picks fields
query {
  user(id: "42") {
    name
    posts(first: 5) {
      title
    }
  }
}`
      },
      {
        id: 'rest-7',
        title: 'Webhooks: Push APIs, Retries, Signatures',
        content: `Webhooks invert the client/server relationship: instead of clients polling for updates, the server POSTs to a client-registered URL when events happen.

Reliability requirements:

Signature verification:
• Sign payloads with HMAC using a per-customer secret
• Header includes signature: X-Signature: sha256=...
• Receiver recomputes the signature and compares using constant-time comparison
• Without this, anyone who knows your endpoint can forge events

Idempotency:
• Each delivery has a unique ID (X-Webhook-Id)
• Receiver records processed IDs and ignores duplicates
• Necessary because retries are inevitable

Retry strategy:
• Sender retries 4xx (except 4xx that\'s bad-request) and 5xx with exponential backoff
• Stripe: ~3 days of retries with growing intervals
• Eventually move to dead-letter / manual investigation

Receiver responsibilities:
• Respond fast (< 5s) — otherwise sender treats as timeout and retries
• Don\'t process inline if work is heavy — enqueue and ack
• Be tolerant of new fields — don\'t parse strictly
• Return 2xx on duplicate to suppress further retries

Discoverability:
• Document event types and payload schemas
• Provide replay UI for manual investigation
• Offer test webhook delivery in your dashboard`,
        codeExample: `// Stripe-style signature verification
import crypto from 'crypto';

function verify(req, secret) {
  // Header format: "t=<timestamp>,v1=<signature>"
  const sig = req.headers['stripe-signature'];
  const [tPart, vPart] = sig.split(',');
  const timestamp = tPart.split('=')[1];
  const expected = vPart.split('=')[1];
  // Recompute HMAC over timestamp + raw (unparsed!) body
  const payload = \`\${timestamp}.\${req.rawBody}\`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  // Constant-time compare defeats timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) {
    throw new Error('Invalid signature');
  }
  // Reject if older than 5 minutes (replay protection)
  if (Date.now() / 1000 - Number(timestamp) > 300) {
    throw new Error('Replay attack');
  }
}`
      },
      {
        id: 'rest-8',
        title: 'Async Patterns: 202 Accepted, Polling, Callbacks',
        content: `Some operations take seconds to hours: video transcoding, ML inference, large exports. Don\'t make the client hold a TCP connection for that long.

The 202 Accepted pattern:
1. POST /jobs starts the operation
2. Server returns 202 Accepted with Location: /jobs/abc and a body containing job ID + status URL
3. Client polls /jobs/abc/status until status is "completed" or "failed"
4. Final result returned in completion response, or via Location to a result URL

Headers commonly used:
• Operation-Location: where to poll
• Retry-After: how long to wait before next poll
• Status payload: { status, progress, eta, result?, error? }

Alternatives to polling:

Callbacks (webhook):
• Client provides a webhook URL when starting the job
• Server POSTs to that URL on completion
• Client must accept incoming requests (not always possible)

Server-Sent Events:
• Long-lived HTTP connection; server streams progress updates
• Auto-reconnect on disconnect
• Good for in-browser progress UIs

WebSocket:
• Full-duplex; works for progress + cancel commands
• More overhead than SSE for one-way updates

Pick:
• Polling: simplest, works everywhere
• SSE: progress in a browser
• WebSocket: bidirectional progress + control
• Webhook callback: for backend-to-backend long jobs

Always cap poll frequency (Retry-After), TTL old jobs, and surface errors clearly.`,
        codeExample: `// Server side
// 1. Kick off the job — respond instantly, don't block
POST /exports
→ 202 Accepted
  Location: /exports/abc
  Operation-Location: /exports/abc/status
  Body: { id: "abc", status: "pending" }

// 2. Client polls; Retry-After caps the poll rate
GET /exports/abc/status
→ 200 OK
  Retry-After: 3
  Body: { id: "abc", status: "running", progress: 0.42 }

// 3. Terminal status includes where to fetch the result
GET /exports/abc/status (later)
→ 200 OK
  Body: { id: "abc", status: "completed", resultUrl: "/exports/abc/file" }`
      },
      {
        id: 'rest-9',
        title: 'API Caching: ETag, Conditional Requests',
        content: `HTTP\'s caching protocol scales APIs almost for free if you opt in.

Cache-Control directives for APIs:
• Cache-Control: public, max-age=60 — readers cache for 60s
• Cache-Control: private, no-store — no caching at all (sensitive data)
• Cache-Control: no-cache — caches must revalidate before serving
• stale-while-revalidate / stale-if-error — graceful degradation

ETag — strong validator:
• Server computes a hash (often of the body) and returns ETag: "abc123"
• Client sends If-None-Match: "abc123" on next request
• Server returns 304 Not Modified with no body if unchanged → bandwidth saved

Optimistic concurrency with ETag:
• Client GETs and remembers the ETag
• On PUT, sends If-Match: "abc123"
• Server returns 412 Precondition Failed if the resource has changed since
• Client merges or reports conflict — no lost updates

Last-Modified — weaker validator:
• Server returns Last-Modified: <date>
• Client sends If-Modified-Since: <date>
• Limited to 1-second granularity; ETag preferred when both possible

Vary header:
• Tells caches "responses differ by these request headers"
• Vary: Accept, Accept-Language, Authorization
• Forgetting Vary: Authorization on auth-aware endpoints leaks one user\'s data to another

Edge caching:
• Put a CDN in front; mark cacheable endpoints with Cache-Control + s-maxage
• Tag-based purge invalidates by entity (Cloudflare Cache-Tag, Fastly Surrogate-Key)`,
        codeExample: `// Express ETag for a JSON resource
app.get('/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  // ETag = hash of the body; changes whenever content changes
  const etag = \`"\${crypto.createHash('sha1').update(JSON.stringify(user)).digest('hex')}"\`;

  // Client's copy is still fresh → 304, skip sending the body
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.set({
    'ETag': etag,
    'Cache-Control': 'private, max-age=60',
    'Vary': 'Authorization, Accept-Encoding',
  });
  res.json(user);
});

// Optimistic update
app.put('/users/:id', async (req, res) => {
  const current = await db.users.findById(req.params.id);
  const currentEtag = computeEtag(current);
  // Someone else changed it since the client read → 412
  if (req.headers['if-match'] !== currentEtag) {
    return res.status(412).end();
  }
  await db.users.update(req.params.id, req.body);
  res.status(204).end();
});`
      },
      {
        id: 'rest-10',
        title: 'OpenAPI / Schema-First APIs',
        content: `OpenAPI (formerly Swagger) is the dominant spec for describing HTTP APIs. The spec becomes the single source of truth — humans read docs, machines generate code.

Two styles:

Schema-first:
• Write OpenAPI YAML by hand
• Generate server stubs and client SDKs
• Spec drives implementation; reviews focus on API design before code
• Tools: openapi-generator, redoc, prism (mock server), spectral (linting)

Code-first:
• Annotate handlers; framework generates the spec
• Tools: NestJS swagger module, FastAPI, tRPC (in spirit), Encore.dev
• Less spec hassle; risk of spec drift if you don\'t enforce types

What good OpenAPI gives you:
• Interactive docs (Swagger UI, Redoc, Stoplight Elements) — try-it-out from the browser
• Typed clients in any language via codegen
• Mock servers for parallel front/back development (Prism, mockoon)
• Contract tests in CI (spectral, openapi-diff for breaking-change detection)
• Schema-driven validation (express-openapi-validator)

JSON Schema:
• OpenAPI uses JSON Schema for request/response shapes
• Reusable components ($ref) prevent duplication
• Discriminator + oneOf for polymorphic types

Real-world advice:
• Source-of-truth the spec. Code matches the spec; spec doesn\'t match the code.
• Lint with spectral in CI. Fail the build on naming/casing/error-shape inconsistencies.
• Run openapi-diff in CI to detect breaking changes before merge.
• Publish a generated TS/Python/Go client for every consumer team.`,
        codeExample: `# Concise OpenAPI 3.1
openapi: 3.1.0
info:
  title: Algogo API
  version: 2.0.0

paths:
  /users/{id}:
    get:
      operationId: getUser  # codegen uses this as the method name
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        '200':
          description: OK
          content: { application/json: { schema: { $ref: '#/components/schemas/User' } } }
        '404':
          description: Not found
          content: { application/problem+json: { schema: { $ref: '#/components/schemas/Problem' } } }

components:
  schemas:  # shared shapes, $ref'd everywhere to avoid drift
    User:
      type: object
      required: [id, email]
      properties:
        id: { type: string }
        email: { type: string, format: email }
    Problem:  # RFC 7807
      type: object
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }`
      },
      {
        id: 'rest-11',
        title: 'Real-Time: SSE, WebSockets, Long Polling',
        content: `Three options for server-to-client real-time updates. Pick by what you actually need.

Server-Sent Events (SSE):
• Long-lived HTTP connection; server pushes "data:" lines
• Plain text, one-way (server → client)
• Native EventSource API in browsers; auto-reconnect
• Works through HTTP proxies, CDNs, mid-boxes
• Great for: live progress, notifications, chat receive, log tailing
• Limit: most browsers cap to 6 SSE connections per origin without HTTP/2

WebSockets:
• Full-duplex binary or text over a long-lived TCP connection
• Same handshake as HTTP, then upgrades
• Need your stack to handle long-lived connections (Node, Go, Erlang shine; PHP/Rails struggle)
• Sticky sessions or shared state required to scale across pods
• Great for: chat send + receive, multiplayer, collaborative editing, control planes

Long Polling:
• Client opens HTTP request; server holds it until data is ready (or timeout); client immediately reopens
• Works literally everywhere, no special infrastructure
• Higher per-message overhead than SSE/WS
• Good fallback when SSE/WS aren\'t supported

WebTransport / WebRTC DataChannel:
• Lower-level, lower-latency, mostly for games and real-time media

Decision tree:
1. Is it one-way (server → client)? → SSE
2. Is it bidirectional? → WebSockets
3. Browser must work over restrictive network? → Long polling fallback
4. Sub-50ms latency, peer-to-peer? → WebRTC

Operational concerns:
• Long-lived connections defeat L4 load balancers — use L7 with WebSocket awareness
• Plan capacity by concurrent connections, not RPS
• Drain gracefully: send Close frame and let clients reconnect to other pods`,
        codeExample: `// Server: SSE
app.get('/events', (req, res) => {
  // These headers keep the HTTP response open as a stream
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  // SSE wire format: "event:" + "data:" lines, blank line ends one
  const send = (event, data) => {
    res.write(\`event: \${event}\\n\`);
    res.write(\`data: \${JSON.stringify(data)}\\n\\n\`);
  };

  // Clean up the subscription when the client disconnects
  const id = subscribe(req.user, send);
  req.on('close', () => unsubscribe(id));
});

// Client
const es = new EventSource('/events');
es.addEventListener('message-received', (e) => {
  const msg = JSON.parse(e.data);
  appendMessage(msg);
});`
      }
    ],
    flashcards: [
      { id: 'rest-fc-1', front: 'What makes an API RESTful?', back: 'Client-server architecture, statelessness, cacheability, uniform interface, layered system, and resource-based URLs. Each request contains all info needed.' },
      { id: 'rest-fc-2', front: 'What\'s the difference between PUT and PATCH?', back: 'PUT replaces the entire resource (send full object). PATCH applies partial updates (send only changed fields). Both are used for updates.' },
      { id: 'rest-fc-3', front: 'What does idempotent mean for HTTP methods?', back: 'Multiple identical requests have the same effect as a single request. GET, PUT, DELETE are idempotent. POST is not (creates new resource each time).' },
      { id: 'rest-fc-4', front: 'When should you use 201 vs 200?', back: '201 Created when a new resource is created (POST). 200 OK for successful GET, PUT, PATCH. 204 No Content for successful DELETE.' },
      { id: 'rest-fc-5', front: 'What\'s the advantage of cursor pagination over offset?', back: 'Cursor pagination handles real-time data better (no skipping/duplicates), performs better on large datasets, and works with infinite scroll.' },
      { id: 'rest-fc-6', front: 'What is HATEOAS?', back: 'Hypermedia as the Engine of Application State. Responses include links to related actions/resources, making the API self-documenting and discoverable.' },
      { id: 'rest-fc-7', front: 'What\'s the difference between 401 and 403?', back: '401 Unauthorized: authentication required or failed. 403 Forbidden: authenticated but not authorized for this resource/action.' },
      { id: 'rest-fc-8', front: 'Why use URL path versioning (/v1/)?', back: 'Most explicit and visible. Easy to route. Cacheable. Clear which version is being used. Downside: URLs change between versions.' },
      { id: 'rest-fc-9', front: 'What is a safe HTTP method?', back: 'A method that doesn\'t modify resources. GET and HEAD are safe. Safe methods can be cached and prefetched.' },
      { id: 'rest-fc-10', front: 'What status code for validation errors?', back: '400 Bad Request for malformed requests, 422 Unprocessable Entity for semantic validation errors. Both are acceptable for validation failures.' },
      { id: 'rest-fc-11', front: 'REST vs GraphQL — when does GraphQL win?', back: 'When clients have diverse data needs and over/under-fetching is a real problem (mobile vs web vs partner needing different fields).\n\nREST stays better for:\n• Simple CRUD with HTTP caching\n• Public APIs (curl-friendly, cacheable)\n• Resource-oriented domains\n\nGraphQL costs: harder caching, N+1 traps, field-level auth, query complexity attacks.' },
      { id: 'rest-fc-12', front: 'GraphQL N+1 + DataLoader', back: 'Fetching a list and resolving a sub-field per item naively triggers N database queries.\n\nDataLoader pattern: collect all IDs requested in one tick, batch-fetch them in one query, return per-ID promises.\n\n// Inside a User resolver\nposts: (user) => postLoader.load(user.id);\n// All loads in one tick → one batched DB call.' },
      { id: 'rest-fc-13', front: 'gRPC streaming types', back: 'Four RPC patterns:\n• Unary: one request, one response (regular RPC)\n• Server streaming: client sends one request, server streams many responses\n• Client streaming: client streams many requests, server sends one response\n• Bidirectional streaming: both stream independently\n\nUnique to gRPC over HTTP/2; powerful for real-time pipelines, file uploads, and continuous monitoring.' },
      { id: 'rest-fc-14', front: 'Webhook signature verification', back: 'Sender computes HMAC(secret, payload) and includes it in a header (X-Signature: sha256=...).\n\nReceiver:\n1. Re-computes HMAC with the shared secret\n2. Compares using crypto.timingSafeEqual (constant-time)\n3. Rejects if mismatch\n\nWithout this, anyone who knows your endpoint can forge events. Stripe, GitHub, Slack all do this.' },
      { id: 'rest-fc-15', front: 'Webhook idempotency', back: 'Senders MUST retry; receivers MUST tolerate duplicates.\n\nPattern: each delivery has a unique ID (X-Webhook-Id). Receiver records processed IDs (DB or Redis with TTL) and ignores duplicates.\n\nReturn 2xx on duplicate to suppress further retries. Without this, retries cause double charges, duplicate emails, etc.' },
      { id: 'rest-fc-16', front: 'Webhook retry budget', back: 'Senders retry on 5xx and timeouts with exponential backoff. Stripe retries for ~3 days. Receivers should:\n\n• Respond fast (<5s) — anything longer is treated as timeout\n• Don\'t process inline if work is heavy — enqueue and 200 immediately\n• Be tolerant of new fields\n• Provide replay UI for messages that failed permanently' },
      { id: 'rest-fc-17', front: '202 Accepted async pattern', back: 'For long-running operations:\n1. POST starts the job → server returns 202 with Location: /jobs/abc\n2. Client polls /jobs/abc with Retry-After header guidance\n3. Status payload: { status: pending|running|completed|failed, progress, eta, result?, error? }\n4. Final response when status is terminal\n\nAvoids holding TCP for minutes/hours.' },
      { id: 'rest-fc-18', front: 'ETag for conditional GET', back: 'Server returns ETag: "abc123". Client sends If-None-Match: "abc123" on next request.\n\nIf unchanged: 304 Not Modified, no body, saves bandwidth.\nIf changed: 200 OK with new body and new ETag.\n\nWorks transparently with browser caches and CDNs.' },
      { id: 'rest-fc-19', front: 'ETag for optimistic locking', back: 'Client GETs and remembers the ETag. On PUT/PATCH, sends If-Match: "<etag>".\n\nIf the resource hasn\'t changed: server applies the update.\nIf changed: server returns 412 Precondition Failed; client must reload, merge, retry.\n\nPrevents lost-update bug without server-side locks.' },
      { id: 'rest-fc-20', front: 'OpenAPI / Swagger', back: 'Industry-standard spec for HTTP APIs (YAML or JSON). Becomes the single source of truth.\n\nUnlocks: interactive docs (Swagger UI, Redoc), typed client SDK codegen, mock servers (Prism), schema validation, breaking-change detection (openapi-diff), linting (spectral).\n\nSchema-first → write spec, generate code. Code-first → annotate handlers, generate spec.' },
      { id: 'rest-fc-21', front: 'JSON:API spec', back: 'Strict spec for JSON-over-HTTP APIs. Defines:\n• Resource objects with type and id\n• Relationships and includes\n• Sparse fieldsets (?fields[users]=name,email)\n• Pagination (?page[offset]=)\n• Errors as a top-level array\n\nReduces bikeshedding ("how should this respond shape look?"). Pairs well with libraries like JSON:API in Rails or Drupal\'s JSON:API module.' },
      { id: 'rest-fc-22', front: 'Problem Details (RFC 7807)', back: 'Standard JSON shape for HTTP API errors.\n\nContent-Type: application/problem+json\n{\n  "type": "https://example.com/probs/out-of-credit",\n  "title": "You do not have enough credit.",\n  "status": 403,\n  "detail": "Your current balance is 30, but that costs 50.",\n  "instance": "/account/12345/transactions/abc"\n}\n\nLets clients introspect errors uniformly across services. Adopted by Microsoft, Stripe-style errors mostly compatible.' },
      { id: 'rest-fc-23', front: 'Server-Sent Events (SSE)', back: 'Long-lived HTTP response with Content-Type: text/event-stream. Server emits "data: ...\\n\\n" lines; client receives via EventSource API.\n\nOne-way (server → client). Auto-reconnect. Works through proxies/CDNs/firewalls.\n\nGreat for: notifications, live progress, log streams, chat receive (combine with REST POST for send).' },
      { id: 'rest-fc-24', front: 'SSE vs WebSocket', back: 'SSE: one-way, plain HTTP, automatic reconnect, native EventSource API. Pick when you only need server → client updates.\n\nWebSocket: bidirectional, needs Upgrade handshake, no built-in reconnect. Pick when client must also push (chat send, multiplayer commands, collaborative editing).\n\nBoth scale by concurrent connections, not RPS — plan capacity accordingly.' },
      { id: 'rest-fc-25', front: 'Long polling fallback', back: 'Client opens HTTP request; server holds it open until data is ready (or timeout); client immediately reopens.\n\nWorks literally everywhere — no upgrade, no special infra.\n\nHigher per-message overhead than SSE/WS. Used by socket.io as a fallback when WebSocket fails (corporate proxies, ancient firewalls).' },
      { id: 'rest-fc-26', front: 'Vary header on API responses', back: 'Tells caches that responses differ based on listed request headers.\n\nVary: Accept, Accept-Language, Authorization\n\nCritical on auth-aware endpoints — without Vary: Authorization, a CDN can serve user A\'s data to user B because both requests look the same to the cache.' },
      { id: 'rest-fc-27', front: 'Sparse fieldsets', back: 'Let clients specify which fields they want — reduces payload size and DB load.\n\n?fields=id,name,email or JSON:API style ?fields[users]=name,email\n\nSimple precursor to GraphQL\'s field selection. Pair with cursor pagination + filtering for a flexible REST surface that doesn\'t over-fetch.' },
      { id: 'rest-fc-28', front: 'Rate limit headers', back: 'Standard headers (RFC 9239 draft, X-RateLimit-* common):\n• RateLimit-Limit: ceiling\n• RateLimit-Remaining: how many you have left\n• RateLimit-Reset: when the window resets\n\nOn 429 responses, also send Retry-After. Clients can backoff sensibly without polling failure.' },
      { id: 'rest-fc-29', front: 'Bulk endpoints', back: 'Lets clients fetch or modify many resources in one request.\n\nGET /users?ids=1,2,3 (read)\nPOST /bulk { operations: [...] } (write — atomic or independent)\n\nWhy: avoid N round-trips. Watch for: payload size limits, partial-success semantics (was the whole batch atomic, or per-item?), rate-limit accounting (1 request or N?).' },
      { id: 'rest-fc-30', front: 'Schema-first vs code-first APIs', back: 'Schema-first: write the OpenAPI/proto spec by hand; generate server stubs and clients. Spec is the source of truth; design is a separate review step.\n\nCode-first: annotate handlers; framework derives the spec. Less ceremony; risk of spec drifting from reality if not carefully linted.\n\nSchema-first scales better cross-team; code-first is faster for small teams.' }
    ],
    quizQuestions: [
      {
        id: 'rest-q-1',
        question: 'Which HTTP method is NOT idempotent?',
        options: ['GET', 'PUT', 'POST', 'DELETE'],
        correctAnswer: 2,
        explanation: 'POST creates a new resource each time it\'s called. GET, PUT, and DELETE produce the same result regardless of how many times they\'re called.'
      },
      {
        id: 'rest-q-2',
        question: 'What status code should you return after creating a resource?',
        options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
        correctAnswer: 1,
        explanation: '201 Created indicates a new resource was successfully created. Include the new resource in the response body and Location header.'
      },
      {
        id: 'rest-q-3',
        question: 'Which URL pattern is most RESTful for getting a user\'s posts?',
        options: ['/getUserPosts?id=1', '/api/posts?userId=1', '/users/1/posts', '/posts/user/1'],
        correctAnswer: 2,
        explanation: '/users/1/posts shows the hierarchical relationship. Posts are a sub-resource of users. This is the most RESTful pattern.'
      },
      {
        id: 'rest-q-4',
        question: 'Which pagination method is best for large, frequently updated datasets?',
        options: ['Offset pagination', 'Cursor pagination', 'Page number pagination', 'Random pagination'],
        correctAnswer: 1,
        explanation: 'Cursor pagination uses a pointer to the last item, avoiding issues with offset when data changes. Better performance for large datasets.'
      },
      {
        id: 'rest-q-5',
        question: 'What does the 204 status code mean?',
        options: ['Not Found', 'No Content', 'Accepted', 'Reset Content'],
        correctAnswer: 1,
        explanation: '204 No Content means the request succeeded but there\'s no content to return. Commonly used for DELETE operations.'
      },
      {
        id: 'rest-q-6',
        question: 'Which versioning approach is most explicit and cacheable?',
        options: ['Query parameter', 'Custom header', 'URL path (/v1/)', 'Content negotiation'],
        correctAnswer: 2,
        explanation: 'URL path versioning (/api/v1/users) is most visible, easy to route, and fully cacheable since version is part of the URL.'
      },
      {
        id: 'rest-q-7',
        question: 'You\'re building a public read-only API for product info, heavily cached by CDNs. REST or GraphQL?',
        options: ['GraphQL — flexibility', 'REST — HTTP caching is straightforward, public consumers can curl easily', 'gRPC', 'WebSocket'],
        correctAnswer: 1,
        explanation: 'REST shines for public, cacheable, resource-oriented APIs. GraphQL\'s POST-based queries break standard HTTP caching paths and add complexity for consumers.'
      },
      {
        id: 'rest-q-8',
        question: 'A GraphQL resolver loads each user\'s profile in a list, triggering one DB query per user. What\'s the standard fix?',
        options: ['Disable GraphQL', 'DataLoader — batch and dedupe requests within a single tick', 'Add an index', 'Reduce list size'],
        correctAnswer: 1,
        explanation: 'DataLoader collects all IDs requested in one tick, batch-fetches them in one query, and returns per-ID promises. Eliminates the GraphQL N+1 problem with no resolver changes.'
      },
      {
        id: 'rest-q-9',
        question: 'You receive a webhook. How do you verify it\'s actually from the legitimate sender (not a spoofer)?',
        options: ['Trust the source IP', 'Verify the HMAC signature in the header using your shared secret, with constant-time comparison', 'Check the User-Agent', 'Look at the timestamp'],
        correctAnswer: 1,
        explanation: 'HMAC signatures with constant-time comparison are the standard. Source IP can be spoofed; user-agent is set by the sender; timestamps alone don\'t prove authenticity (though they help with replay defense).'
      },
      {
        id: 'rest-q-10',
        question: 'Two clients GET a resource at the same time, both PUT updates. How do you prevent a lost update without server-side locks?',
        options: ['Larger timeouts', 'Optimistic concurrency: each GET returns an ETag; PUTs send If-Match; server returns 412 if changed', 'Last-write-wins always', 'Use POST instead'],
        correctAnswer: 1,
        explanation: 'ETag + If-Match lets the server detect concurrent modification and reject the stale write with 412 Precondition Failed. Client merges and retries.'
      },
      {
        id: 'rest-q-11',
        question: 'A long export takes 10 minutes. Holding the HTTP connection open is wrong. What\'s the right pattern?',
        options: ['Increase server timeouts', '202 Accepted with a status URL the client polls', 'Email the result', 'Force the client to wait'],
        correctAnswer: 1,
        explanation: 'POST returns 202 + Location: /jobs/abc. Client polls /jobs/abc/status (with Retry-After) until status is completed, then reads the result URL.'
      },
      {
        id: 'rest-q-12',
        question: 'You need server → client real-time updates only (no client-to-server messaging beyond initial subscribe). Best fit?',
        options: ['WebSocket', 'SSE (Server-Sent Events)', 'Long polling', 'WebTransport'],
        correctAnswer: 1,
        explanation: 'SSE is purpose-built for one-way server → client streams: native EventSource, automatic reconnect, plain HTTP friendly with proxies and CDNs. WebSocket is overkill when you don\'t need bidirectional.'
      },
      {
        id: 'rest-q-13',
        question: 'A CDN is caching responses that include user-specific data. Different users see each other\'s pages. What\'s the fix?',
        options: ['Disable caching everywhere', 'Add Vary: Authorization (or Cookie) so caches keep separate copies per auth value', 'Use HTTPS', 'Lower TTL'],
        correctAnswer: 1,
        explanation: 'Vary tells caches "responses differ based on these request headers." Without Vary on the auth-bearing header, the cache returns one user\'s data to other users.'
      },
      {
        id: 'rest-q-14',
        question: 'Following RFC 7807, what Content-Type should an API error response use?',
        options: ['application/json', 'application/problem+json', 'text/plain', 'application/error'],
        correctAnswer: 1,
        explanation: 'RFC 7807 Problem Details defines application/problem+json with fields type, title, status, detail, instance. Standard, machine-readable error shape across services.'
      },
      {
        id: 'rest-q-15',
        question: 'You want clients to fetch only specific fields per request to reduce payload. Without going full GraphQL, what REST pattern works?',
        options: ['Multiple endpoints per shape', 'Sparse fieldsets via ?fields=id,name', 'POST with filter body', 'Custom HTTP method'],
        correctAnswer: 1,
        explanation: 'Sparse fieldsets (e.g., ?fields=name,email or JSON:API\'s ?fields[users]=name,email) let clients ask for only what they need without abandoning REST semantics.'
      },
      {
        id: 'rest-q-16',
        question: 'A client POSTs /users with an email that already belongs to another account. Which status code communicates this most precisely?',
        options: ['409 Conflict', '400 Bad Request', '422 Unprocessable Entity', '500 Internal Server Error'],
        correctAnswer: 0,
        explanation: '409 Conflict means the request is well-formed but conflicts with the current state of the resource — a uniqueness violation is the classic case. 422 is for a body that fails semantic validation on its own; 400 is for malformed syntax; 500 disguises a client problem as a server bug.'
      },
      {
        id: 'rest-q-17',
        question: 'Your cursor pagination sorts by created_at and encodes the last row\'s timestamp as the cursor. Thousands of rows share the same second. What goes wrong?',
        options: ['Nothing — cursors handle ties automatically', 'Rows sharing the boundary timestamp are skipped or repeated across pages; sort and filter on a unique keyset like (created_at, id) instead', 'The query becomes O(n²)', 'The cursor expires after one page'],
        correctAnswer: 1,
        explanation: 'A cursor must identify a unique position. With WHERE created_at > ? the rows tied at the boundary are skipped; with >= they repeat on the next page. Ordering on (created_at, id) and comparing the tuple gives every row a unique keyset position.'
      },
      {
        id: 'rest-q-18',
        question: 'A PATCH request with Content-Type: application/merge-patch+json sends {"nickname": null}. Per RFC 7386, what should the server do?',
        options: ['Reject it with 400 — null is not allowed', 'Set nickname to the string "null"', 'Remove (unset) the nickname field on the resource', 'Ignore the field, since null means "no change"'],
        correctAnswer: 2,
        explanation: 'In JSON Merge Patch, null means "delete this member"; to leave a field untouched you omit it entirely. That is also why merge patch cannot set a field to null — use JSON Patch (application/json-patch+json) operations when you need that.'
      },
      {
        id: 'rest-q-19',
        question: 'A browser SPA on app.example.com calls api.example.com with an Authorization header. The network tab shows an OPTIONS request failing and your handler never runs, yet curl works. What is happening?',
        options: ['The API is down', 'The browser sent a CORS preflight; the server must answer OPTIONS with Access-Control-Allow-Origin and Access-Control-Allow-Headers: Authorization', 'The JWT is expired', 'The route must be lowercase'],
        correctAnswer: 1,
        explanation: 'Cross-origin requests with non-simple headers (Authorization) or methods trigger a preflight OPTIONS. If the server does not respond with matching Access-Control-Allow-* headers, the browser blocks the real request. curl is unaffected because CORS is enforced only by browsers.'
      },
      {
        id: 'rest-q-20',
        question: 'A client sends POST /orders with Content-Type: text/plain, but your API only accepts JSON bodies. Which status code?',
        options: ['406 Not Acceptable', '400 Bad Request', '405 Method Not Allowed', '415 Unsupported Media Type'],
        correctAnswer: 3,
        explanation: '415 means the server refuses the request body\'s media type. 406 is the mirror case: the client\'s Accept header asks for a representation the server cannot produce. 405 is about the HTTP method, not the payload.'
      }
    ],
    visualizations: [
      {
        id: 'rest-viz-1',
        title: 'REST Request Flow',
        type: 'diagram',
        description: 'Client-server communication in REST',
        nodes: [
          { id: 'client', label: 'Client', x: 80, y: 100 },
          { id: 'request', label: 'HTTP Request', x: 200, y: 50 },
          { id: 'server', label: 'Server', x: 320, y: 100 },
          { id: 'response', label: 'HTTP Response', x: 200, y: 150 }
        ],
        edges: [
          { from: 'client', to: 'request' },
          { from: 'request', to: 'server' },
          { from: 'server', to: 'response' },
          { from: 'response', to: 'client' }
        ]
      },
      {
        id: 'rest-viz-2',
        title: 'HTTP Methods',
        type: 'diagram',
        description: 'CRUD operations mapped to HTTP methods',
        nodes: [
          { id: 'create', label: 'Create → POST', x: 100, y: 50 },
          { id: 'read', label: 'Read → GET', x: 300, y: 50 },
          { id: 'update', label: 'Update → PUT/PATCH', x: 100, y: 130 },
          { id: 'delete', label: 'Delete → DELETE', x: 300, y: 130 }
        ],
        edges: []
      }
    ]
  },

  // 2. Database Design
  {
    id: 'database-design',
    name: 'Database Design',
    slug: 'database-design',
    description: 'SQL, NoSQL, normalization, and data modeling',
    icon: 'server-outline',
    color: '#4CAF50',
    colorDark: '#388E3C',
    premium: false,
    learnContent: [
      {
        id: 'db-1',
        title: 'SQL vs NoSQL',
        content: `Choose the right database for your use case.

SQL (Relational):
• Structured data with relationships
• ACID transactions
• Complex queries with JOINs
• Vertical scaling
• Examples: PostgreSQL, MySQL, SQLite

NoSQL (Non-relational):
• Flexible schemas
• Horizontal scaling
• Types: Document, Key-Value, Column, Graph
• BASE (Basically Available, Soft state, Eventually consistent)
• Examples: MongoDB, Redis, Cassandra, Neo4j`,
        codeExample: `-- SQL: Relational with JOINs
SELECT users.name, orders.total
FROM users
JOIN orders ON users.id = orders.user_id
WHERE orders.status = 'completed';

// MongoDB: Embedded documents
{
  "_id": ObjectId("..."),
  "name": "John",
  "orders": [
    { "total": 99.99, "status": "completed" },
    { "total": 49.99, "status": "pending" }
  ]
}

// Redis: Key-Value
SET user:123 '{"name":"John","email":"john@example.com"}'
GET user:123`
      },
      {
        id: 'db-2',
        title: 'Normalization',
        content: `Normalization reduces data redundancy and improves integrity.

• 1NF: Atomic values, no repeating groups
• 2NF: 1NF + no partial dependencies (all non-key columns depend on entire primary key)
• 3NF: 2NF + no transitive dependencies (non-key columns don't depend on other non-key columns)
• BCNF: Every determinant is a candidate key

When to denormalize:
• Read-heavy workloads
• Complex JOINs hurting performance
• Caching frequently accessed data
• Reporting/analytics databases`,
        codeExample: `-- Unnormalized (bad)
CREATE TABLE orders (
  id INT,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),  -- Repeated!
  product_name VARCHAR(100),
  product_price DECIMAL        -- Repeated!
);

-- Normalized (3NF): each fact lives in exactly one place
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL
);

-- Orders only hold foreign keys, never copied data
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(id),  -- FK enforces integrity
  product_id INT REFERENCES products(id),
  quantity INT,
  created_at TIMESTAMP
);`
      },
      {
        id: 'db-3',
        title: 'Indexing Strategies',
        content: `Indexes speed up queries but slow down writes.

Index types:
• B-Tree: default, good for ranges and equality
• Hash: exact matches only, O(1) lookup
• Composite: multiple columns, order matters
• Covering: includes all queried columns
• Partial: index subset of rows
• Full-text: text search

Guidelines:
• Index columns in WHERE, JOIN, ORDER BY
• Avoid over-indexing (impacts writes)
• Consider column cardinality
• Monitor slow query logs`,
        codeExample: `-- Create indexes
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
-- Good for: WHERE user_id = ? AND created_at > ?
-- Good for: WHERE user_id = ?
-- Bad for: WHERE created_at > ? (can't use index)
CREATE INDEX idx_orders_user_date
ON orders(user_id, created_at DESC);

-- Partial index (only active users)
CREATE INDEX idx_active_users
ON users(email)
WHERE status = 'active';

-- Covering index (avoids table lookup)
CREATE INDEX idx_orders_covering
ON orders(user_id)
INCLUDE (total, status);

-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@test.com';`
      },
      {
        id: 'db-4',
        title: 'Transactions & ACID',
        content: `ACID guarantees reliable database transactions.

• Atomicity: All operations succeed or all fail
• Consistency: Database moves from valid state to valid state
• Isolation: Concurrent transactions don't interfere
• Durability: Committed data survives failures

Isolation levels (from least to most isolated):
• Read Uncommitted: dirty reads possible
• Read Committed: no dirty reads
• Repeatable Read: no non-repeatable reads
• Serializable: no phantom reads`,
        codeExample: `-- Transaction example
BEGIN TRANSACTION;

-- Debit from account A
UPDATE accounts
SET balance = balance - 100
WHERE id = 'A';

-- Credit to account B
UPDATE accounts
SET balance = balance + 100
WHERE id = 'B';

-- Only commit if both succeed
COMMIT;
-- Or ROLLBACK on error

-- Set isolation level
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

// Node.js with Prisma
// If the callback throws, everything inside rolls back
await prisma.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: 'A' },
    data: { balance: { decrement: 100 } }
  });

  await tx.account.update({
    where: { id: 'B' },
    data: { balance: { increment: 100 } }
  });
});`
      },
      {
        id: 'db-5',
        title: 'Database Scaling',
        content: `Scale databases to handle more load.

Vertical Scaling (Scale Up):
• More CPU, RAM, faster disks
• Simpler but has limits
• Single point of failure

Horizontal Scaling (Scale Out):
• Add more database servers
• Replication: copies of data
• Sharding: split data across servers

Replication types:
• Primary-Replica: one write, many reads
• Multi-Primary: multiple write nodes

Sharding strategies:
• Range-based: by date or ID range
• Hash-based: consistent hashing
• Directory-based: lookup table`,
        codeExample: `-- Read replica setup (conceptual)
-- Primary handles writes
INSERT INTO users (name) VALUES ('John');

-- Replica handles reads (slight lag)
SELECT * FROM users WHERE id = 123;

-- Sharding by user_id (hash-based)
-- Shard 1: user_id % 4 == 0
-- Shard 2: user_id % 4 == 1
-- Shard 3: user_id % 4 == 2
-- Shard 4: user_id % 4 == 3

// Application-level sharding
function getShard(userId) {
  const shardId = userId % NUM_SHARDS;  // same user → same shard
  return shardConnections[shardId];
}

const db = getShard(userId);
await db.query('SELECT * FROM users WHERE id = ?', [userId]);`
      },
      {
        id: 'db-6',
        title: 'Schema Design Patterns',
        content: `Design choices that look small early on become structural pain at scale. A few patterns to get right from the start.

Soft delete vs hard delete:
• Soft: deleted_at column; queries filter where deleted_at IS NULL
• Pros: easy undo, audit trail, accidental delete recovery
• Cons: every query needs the filter (forget once → leak deleted data); foreign keys to "alive" rows get awkward; storage grows
• Hybrid: soft-delete with a job that hard-deletes after N days

Audit columns:
• created_at, updated_at on every table — always
• created_by, updated_by — track which user made the change
• version (integer) — optimistic locking
• Often automated via DB triggers or framework hooks

Audit log table:
• Separate table recording every change with old/new values, actor, timestamp
• Truth table for compliance (HIPAA, SOX), debugging, "who changed this?"
• Can be filled by triggers, CDC, or app code

Polymorphic associations:
• A comment can belong to a Post, Photo, or Video — modeled as commentable_type + commentable_id
• Easy to write; nightmare for foreign keys (DB can\'t enforce them)
• Alternative: one association table per parent type — verbose but DB-enforced
• Or single-table inheritance: one table with a type column

UUIDs as primary keys:
• UUIDv4: random — index B-trees fragment, inserts hit random pages
• UUIDv7 (RFC 9562, 2024): timestamp-prefixed — sortable, monotonic, far better insert behavior
• Use UUIDv7 for new tables; serial/BIGSERIAL is still fine when no client-generated IDs needed

Multi-tenant data:
• tenant_id on every row + indexes
• Always filter by tenant in queries (use Row-Level Security to enforce)
• Aggregate queries naturally scoped`,
        codeExample: `-- Audit columns standard
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid_v7(),  -- v7: sortable
  tenant_id UUID NOT NULL,  -- multi-tenant scoping on every row
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,  -- NULL = alive (soft delete)
  version INT NOT NULL DEFAULT 1  -- optimistic locking counter
);

-- Partial index: only live rows, smaller + faster
CREATE INDEX posts_tenant_active ON posts(tenant_id) WHERE deleted_at IS NULL;

-- Optimistic update
UPDATE posts SET title = $1, version = version + 1
WHERE id = $2 AND version = $3;
-- if rowCount == 0 → conflict`
      },
      {
        id: 'db-7',
        title: 'Zero-Downtime Migrations: Expand-Contract',
        content: `Big tables and long-running schema changes can lock writes for minutes. Production databases need migrations that ship without downtime.

The expand-contract pattern (renaming a column):
1. Expand — add new column, deploy code to dual-write to OLD and NEW
2. Backfill — populate NEW from OLD in batches with sleep between batches
3. Cut over — deploy code to read from NEW (still dual-write)
4. Contract — remove dual-write, drop OLD column
5. Optional cleanup migration to drop OLD column

Each step is independently shippable; rollbacks at any stage don\'t lose data.

Postgres-specific gotchas:
• ALTER TABLE ... ADD COLUMN with NOT NULL + non-volatile DEFAULT is fast (Postgres 11+, no rewrite)
• ALTER TABLE ... ADD COLUMN with VOLATILE DEFAULT (e.g., now()) rewrites the table — slow, locks
• ALTER TYPE on enums adds quickly; renaming/removing enum values is expensive
• ALTER COLUMN TYPE that needs cast → check if it\'s a metadata-only change (e.g., varchar(N) → text)
• Adding a foreign key with NOT VALID is fast; VALIDATE separately is online
• Adding an index: always CREATE INDEX CONCURRENTLY (no AccessExclusiveLock; build in background)
• Dropping an index: DROP INDEX CONCURRENTLY

Batched backfill:
• UPDATE in chunks of 1k–10k rows with a primary-key range
• Sleep 100–500ms between batches to let normal traffic flow
• Tools: pg_repack, gh-ost (MySQL), pt-online-schema-change

Practical safety nets:
• Statement timeout: SET statement_timeout = '5s' before risky DDL
• Lock timeout: SET lock_timeout = '2s' so a stuck migration fails fast instead of holding writers
• Run migrations from a dedicated user with limited connections, never from app pods`,
        codeExample: `-- Expand: add new column with backfill plan
-- Nullable ADD COLUMN is metadata-only: instant, no rewrite
ALTER TABLE users ADD COLUMN email_normalized TEXT;
-- CONCURRENTLY builds in background, no write lock
CREATE INDEX CONCURRENTLY idx_users_email_norm ON users(email_normalized);

-- Backfill in batches (run as a job)
DO $$
DECLARE batch INT := 1000;
        last_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  LOOP
    -- Keyset pagination: grab next slice of unfilled rows
    WITH cte AS (
      SELECT id FROM users
      WHERE id > last_id AND email_normalized IS NULL
      ORDER BY id LIMIT batch
    )
    UPDATE users SET email_normalized = lower(email)
    FROM cte WHERE users.id = cte.id;
    GET DIAGNOSTICS last_id = ROW_COUNT;
    EXIT WHEN NOT FOUND;  -- done when no rows left
    PERFORM pg_sleep(0.1);  -- breathe: let normal traffic through
  END LOOP;
END $$;`
      },
      {
        id: 'db-8',
        title: 'Query Performance Debugging',
        content: `Most "slow API" tickets resolve to "slow DB query." A few tools find them fast.

pg_stat_statements:
• Postgres extension that aggregates query stats — total time, calls, mean, p99
• "What are my top 10 slowest queries by total time?"
• Query: SELECT query, total_exec_time, mean_exec_time, calls FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
• Total time matters more than per-call time — a fast query called millions of times can dominate

EXPLAIN (ANALYZE, BUFFERS, VERBOSE):
• ANALYZE actually runs the query (be careful with mutations — wrap in BEGIN/ROLLBACK)
• BUFFERS shows pages read — high "shared read" means cold cache; high "shared hit" means warm
• Look for: Seq Scan on big tables (missing index), Hash Join with disk spill (work_mem too low), large estimate vs actual gap (stale stats — run ANALYZE)

auto_explain:
• Logs EXPLAIN automatically for queries over a threshold
• Set in postgresql.conf: auto_explain.log_min_duration = 100ms

pgbadger / pgstats / Datadog DBM / RDS Performance Insights:
• Aggregate the slow query log into dashboards
• Find regressions ("queries that got 3x slower this week")

ORM-specific:
• Sequelize: .logging or sequelize.options.logQueryParameters
• Prisma: $on('query') hook
• Active Record: Rails query log
• Always log query plus duration plus parameters

Application-level signals:
• Distributed traces: span around DB call shows latency in context
• Connection pool wait time as a separate metric — if waits are high, you don\'t need a faster query, you need more capacity

Common root causes:
• Missing or wrong index
• Stale statistics → bad plan
• Lock contention (check pg_locks, pg_stat_activity)
• N+1 from ORM
• Cardinality misestimation on JOINs`,
        codeExample: `-- Top time-consuming queries
SELECT
  substring(query, 1, 80) AS q,
  calls,
  total_exec_time::int AS total_ms,
  mean_exec_time::int AS mean_ms,
  rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC  -- total, not per-call, finds hotspots
LIMIT 10;

-- Plan with timings + I/O
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- Active blocking sessions
SELECT bl.pid AS blocked_pid, ka.query AS blocking_query, ka.pid AS blocking_pid
FROM pg_locks bl
JOIN pg_stat_activity ka ON bl.pid = ka.pid
WHERE NOT bl.granted;  -- ungranted lock = session stuck waiting`
      },
      {
        id: 'db-9',
        title: 'Connection Pooling: pgbouncer & Pool Sizing',
        content: `Postgres connections are expensive — each spawns a backend process. A 100-pod app with 20 connections each = 2,000 backends, exhausting Postgres before the app even feels load.

The fix: a connection pooler in front of Postgres. pgbouncer is the canonical choice.

pgbouncer modes:
• Session pooling — each client holds a backend for the connection lifetime. Same as no pooler. Useful for clients that need session state (LISTEN/NOTIFY, advisory locks).
• Transaction pooling — backend assigned per transaction. Most efficient. Caveats: no session-state features (prepared statements, SET LOCAL, LISTEN/NOTIFY).
• Statement pooling — backend per statement. Even more aggressive; rarely used.

Most apps use transaction pooling — 100 backends can serve thousands of clients.

Pool sizing:
• Postgres backends: limit to ~CPU cores × 2 (e.g., 16 cores → 32 max_connections in pgbouncer for Postgres)
• Per-pod app pool: small (5–10) — pods × per-pod pool ≤ pgbouncer pool size
• Brett Wooldridge formula: connections = ((core_count × 2) + effective_spindle_count). Most cloud DBs are SSD, spindle ≈ 1.

Symptoms of bad sizing:
• "Too many connections" errors → app pool ÷ pods × Postgres max_connections math is wrong
• High connection-pool wait time → app pool too small or DB saturated
• Postgres CPU pegged → too many backends fighting

PgBouncer alternatives:
• Postgres built-in connection pooler (Postgres 17+)
• AWS RDS Proxy / Cloud SQL Proxy
• Odyssey (Yandex)

Prepared statements: transaction pooling typically disables protocol-level prepared statements (since the backend changes between calls). Apps must use string-based statements or pgbouncer\'s server_lifetime trick.`,
        codeExample: `# pgbouncer.ini essentials
[databases]
algogo = host=db.internal port=5432 dbname=algogo

[pgbouncer]
pool_mode = transaction
max_client_conn = 5000      # how many app clients can connect to pgbouncer
default_pool_size = 30      # backends to Postgres per (db, user) pair
reserve_pool_size = 5       # extra backends during spikes
reserve_pool_timeout = 3
max_db_connections = 100    # cap across all pools
server_idle_timeout = 600
server_lifetime = 3600`
      },
      {
        id: 'db-10',
        title: 'PostgreSQL Power Features',
        content: `PostgreSQL ships features that often replace whole pieces of your stack — Redis-like pub/sub, search engines, queues, and more.

JSONB:
• Binary JSON column — fully indexable, queryable, in-place updates
• -> returns JSON, ->> returns text; @> tests containment
• GIN indexes on JSONB make containment queries fast
• Mixes well with relational columns: SELECT name, prefs->>'theme' FROM users
• When NOT to use: relational data forced into JSONB to "be flexible" — you lose constraints, types, and indexability

Full-text search (tsvector / tsquery):
• Built-in stemming, ranking, multi-language
• Materialize tsvector in a column with a trigger or generated column
• GIN index for fast queries
• Surprisingly competitive with Elasticsearch up to ~100M documents

Generated columns:
• Postgres 12+ — STORED computed columns kept in sync automatically
• Useful for: search vectors, derived totals, normalized lookups

Row-Level Security (RLS):
• Define policies per table — what rows a user can see/modify
• Combined with SET LOCAL app.current_user, app code never has to add WHERE tenant_id = ?
• Killer for multi-tenant apps and audit-heavy schemas

LISTEN / NOTIFY:
• Built-in pub/sub. NOTIFY channel, 'payload'; clients LISTEN channel
• Killer for cache invalidation, real-time UI updates without an external broker
• Caveat: messages dropped if no listener; not durable

Window functions:
• ROW_NUMBER, RANK, LAG/LEAD, SUM/AVG OVER (...)
• "Top 3 products per category", running totals, cohort analysis — all in plain SQL

Recursive CTEs:
• WITH RECURSIVE — traverse trees and graphs in SQL
• Common for: org charts, comment threads, dependency trees

Materialized views:
• Pre-computed query results stored as a table
• REFRESH MATERIALIZED VIEW (CONCURRENTLY) — slow rebuild but fast reads
• Great for analytical dashboards`,
        codeExample: `-- JSONB with GIN index
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  attrs JSONB
);
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- Containment query
SELECT * FROM products WHERE attrs @> '{"color": "red"}';

-- Generated column for search
ALTER TABLE posts ADD COLUMN search_vec tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED;
CREATE INDEX idx_posts_search ON posts USING GIN (search_vec);

SELECT id, ts_rank(search_vec, q) AS rank
FROM posts, to_tsquery('postgresql & performance') q
WHERE search_vec @@ q
ORDER BY rank DESC LIMIT 10;

-- RLS for multi-tenancy
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_tenant ON posts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- App sets context once per request:
SET LOCAL app.tenant_id = '<uuid>';

-- Window function: top 3 products per category
SELECT * FROM (
  SELECT category, name, sales,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rk
  FROM products
) WHERE rk <= 3;`
      },
      {
        id: 'db-11',
        title: 'Multi-Tenancy Patterns',
        content: `Three common ways to host many customers (tenants) on one database stack — each with different isolation, scale, and cost trade-offs.

1. Shared schema with tenant_id column:
• Every tenant-scoped table has a tenant_id
• Indexes lead with tenant_id
• RLS enforces "you only see your rows"
• Pros: cheapest infrastructure, easiest cross-tenant analytics
• Cons: noisy-neighbor risk; one tenant\'s slow query can hurt others; security depends on never forgetting to filter

2. Schema per tenant (Postgres):
• CREATE SCHEMA tenant_acme; tables under tenant_acme.posts, etc.
• search_path SET LOCAL search_path = tenant_acme, public
• Pros: stronger isolation than option 1; per-tenant migrations possible
• Cons: schema migrations multiplied by tenant count; pg_class entries can grow huge

3. Database per tenant:
• One Postgres database (or even instance) per tenant
• Pros: maximum isolation, regulatory-friendly, easy to delete a tenant cleanly
• Cons: most expensive, hardest to operate at scale (1000s of dbs to migrate, monitor, back up)

Hybrid:
• Free tier on shared schema; enterprise on dedicated DB
• Common pattern in B2B SaaS

Crucial detail across all three: app must always know which tenant it\'s acting for. Auth → tenant_id → SET LOCAL → query. Never trust the URL or client to provide tenant_id without validation.

Scaling strategy as you grow:
• Start: shared schema
• When noisy neighbors are real: split heaviest tenants to dedicated DBs
• Don\'t pre-optimize — premature isolation costs huge operational surface area

Cross-tenant operations:
• Reporting and analytics often need cross-tenant aggregates
• Solution: dump tenants into a separate analytics warehouse (CDC pipeline)
• Production DB stays tenant-scoped for safety`,
      }
    ],
    flashcards: [
      { id: 'db-fc-1', front: 'What is ACID in databases?', back: 'Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions), Durability (committed data persists). Guarantees reliable transactions.' },
      { id: 'db-fc-2', front: 'When should you use NoSQL over SQL?', back: 'Flexible/evolving schemas, horizontal scaling needs, high write throughput, unstructured data, when you don\'t need complex JOINs or strict consistency.' },
      { id: 'db-fc-3', front: 'What is database normalization?', back: 'Organizing data to reduce redundancy and dependencies. Higher normal forms (1NF→3NF→BCNF) mean less duplication but more JOINs.' },
      { id: 'db-fc-4', front: 'Why does index column order matter in composite indexes?', back: 'Index is sorted by columns in order. Query on (a, b) can use index (a, b) but not (b, a). "Leftmost prefix" rule applies.' },
      { id: 'db-fc-5', front: 'What is a covering index?', back: 'An index that includes all columns needed for a query. Database can satisfy the query from index alone without reading the table.' },
      { id: 'db-fc-6', front: 'What is database sharding?', back: 'Splitting data across multiple database servers. Each shard holds a subset of data. Enables horizontal scaling but adds complexity.' },
      { id: 'db-fc-7', front: 'What is the CAP theorem?', back: 'Distributed systems can only guarantee 2 of 3: Consistency, Availability, Partition tolerance. Must choose during network partitions.' },
      { id: 'db-fc-8', front: 'What is a partial index?', back: 'An index that only includes rows matching a condition. Smaller index, faster updates, perfect for common query patterns.' },
      { id: 'db-fc-9', front: 'Read Committed vs Repeatable Read?', back: 'Read Committed: sees committed data at query time (may change). Repeatable Read: sees snapshot from transaction start (consistent reads).' },
      { id: 'db-fc-10', front: 'When to denormalize?', back: 'Read-heavy workloads, expensive JOINs, reporting databases, caching, when write performance isn\'t critical. Trade storage for speed.' },
      { id: 'db-fc-11', front: 'Soft delete trade-offs', back: 'Soft delete (deleted_at column): easy undo, audit trail, recovery from accidents.\n\nCosts: every query must filter where deleted_at IS NULL — forget once and you leak deleted data. Foreign keys to "alive" rows get awkward. Storage grows.\n\nCommon middle ground: soft delete + nightly job that hard-deletes after N days for compliance.' },
      { id: 'db-fc-12', front: 'Audit log table pattern', back: 'Separate table records every change with old/new values, actor, timestamp.\n\nFilled by DB triggers, CDC streams, or app code. Truth source for compliance (HIPAA, SOX), debugging, and "who changed this?" investigations.\n\nDistinct from audit COLUMNS (created_at, updated_at on each row) — the audit log captures full history, not just current state.' },
      { id: 'db-fc-13', front: 'Polymorphic associations gotcha', back: 'A "comment can belong to a post, photo, or video" pattern often modeled as commentable_type + commentable_id.\n\nProblem: the database can\'t enforce foreign keys (target table varies). Orphan rows are easy.\n\nAlternatives: one foreign-key column per parent type (verbose but DB-enforced); single-table inheritance with a type column; or a join table per parent type.' },
      { id: 'db-fc-14', front: 'UUIDv4 vs UUIDv7 for primary keys', back: 'UUIDv4: random — index B-trees fragment, every insert hits a random page, hurts cache and write throughput.\n\nUUIDv7 (RFC 9562, 2024): timestamp-prefixed — sortable, monotonic, far better for B-tree inserts.\n\nFor new tables that need client-generated IDs, prefer UUIDv7. BIGSERIAL still wins when no client-generated IDs needed and you don\'t care about leaking row counts.' },
      { id: 'db-fc-15', front: 'Expand-contract migration pattern', back: 'Zero-downtime schema change in 5 stages:\n1. Expand: add new column/table; deploy code that dual-writes\n2. Backfill: populate new from old in batches\n3. Cut over: deploy code that reads from new (still dual-writes)\n4. Contract: deploy code that drops old; stops dual-writing\n5. Cleanup migration drops the old column\n\nEach stage is independently shippable; rollback safe at any step.' },
      { id: 'db-fc-16', front: 'CREATE INDEX CONCURRENTLY', back: 'Postgres builds the index in the background without taking an AccessExclusiveLock that would block writes.\n\nTrade-off: slower than non-concurrent build (does multiple passes); fails if interrupted, leaving an INVALID index that must be DROPped before retrying.\n\nALWAYS use CONCURRENTLY in production. Same goes for DROP INDEX CONCURRENTLY.' },
      { id: 'db-fc-17', front: 'pg_stat_statements', back: 'Postgres extension that aggregates per-query stats: total_exec_time, calls, mean, rows, hit/read counts.\n\nThe single most useful query: ORDER BY total_exec_time DESC LIMIT 10. Total time matters more than per-call time — a fast query called millions of times can dominate the DB.\n\nAlways enable in production.' },
      { id: 'db-fc-18', front: 'EXPLAIN (ANALYZE, BUFFERS)', back: 'ANALYZE actually runs the query (be careful with mutations — wrap in BEGIN/ROLLBACK).\n\nBUFFERS shows pages read: "shared read" = cold cache (disk read), "shared hit" = warm (memory). High shared read is a cache or capacity problem; high shared hit on slow query is a CPU/algorithm problem.\n\nLook for: Seq Scan on big tables (missing index), large estimate vs actual gap (run ANALYZE).' },
      { id: 'db-fc-19', front: 'Connection pool sizing rule', back: 'Brett Wooldridge\'s formula (HikariCP): connections = ((core_count × 2) + effective_spindle_count).\n\nFor 16 cores on SSD: ~32 connections. More than that → context switching overhead beats throughput gains. This is per-DB-server, not per-app-pod.\n\nUse pgbouncer in front to multiplex many app pods onto few real Postgres backends.' },
      { id: 'db-fc-20', front: 'pgbouncer transaction vs session pooling', back: 'Session pooling: client holds backend for the whole connection. Same as no pooler. Needed for clients that use session features (LISTEN/NOTIFY, advisory locks, prepared statements).\n\nTransaction pooling: backend assigned per transaction. Most efficient — 100 backends serve thousands of clients. Loses session features.\n\nMost apps use transaction pooling and avoid session-only features.' },
      { id: 'db-fc-21', front: 'TIMESTAMPTZ vs TIMESTAMP', back: 'TIMESTAMP WITHOUT TIME ZONE: stores wall-clock time without zone info. Two readers in different zones see different times. Almost never what you want.\n\nTIMESTAMPTZ (WITH TIME ZONE): stores UTC; converts on read using session\'s time_zone. Universally consistent.\n\nDefault to TIMESTAMPTZ. Only use TIMESTAMP for "calendar dates without zone semantics" (a stored "appointment local time" the app interprets per user).' },
      { id: 'db-fc-22', front: 'JSONB with GIN index', back: 'JSONB stores binary JSON, queryable via -> (returns JSON), ->> (returns text), @> (containment), ? (key exists).\n\nCREATE INDEX idx ON t USING GIN (jsonb_col);\n\nMakes containment queries (WHERE attrs @> \'{"color":"red"}\') fast. The jsonb_path_ops opclass is smaller and faster for pure containment, larger for general queries.' },
      { id: 'db-fc-23', front: 'Postgres full-text search', back: 'Built-in tsvector / tsquery types with stemming, ranking, multi-language support.\n\nMaterialize tsvector via generated column or trigger; GIN index on it; query with @@ operator and rank with ts_rank.\n\nCompetitive with Elasticsearch up to ~100M documents. No separate service to operate.' },
      { id: 'db-fc-24', front: 'Generated columns', back: 'STORED columns (Postgres 12+) computed automatically from other columns: ALTER TABLE t ADD col INT GENERATED ALWAYS AS (a + b) STORED.\n\nKept in sync on writes; readable like any column; can be indexed.\n\nUseful for: search vectors, normalized lookups (lower(email)), derived totals, materialized constraints (CHECK on a generated column = computed constraint).' },
      { id: 'db-fc-25', front: 'Window functions', back: 'Aggregate over a "window" of rows without collapsing them.\n\nROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) — top-N per group\nLAG(price) OVER (ORDER BY date) — previous row\'s value\nSUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) — running total\n\nReplaces a lot of self-join hackery. Available in all major databases.' },
      { id: 'db-fc-26', front: 'Recursive CTE', back: 'WITH RECURSIVE traverses trees and graphs in pure SQL.\n\nUse for: org charts (manager → reports), comment threads (parent → children), dependency walks, transitive closures.\n\nWITH RECURSIVE descendants AS (\n  SELECT id, name FROM nodes WHERE id = $1\n  UNION ALL\n  SELECT n.id, n.name FROM nodes n JOIN descendants d ON n.parent_id = d.id\n)\nSELECT * FROM descendants;' },
      { id: 'db-fc-27', front: 'Row-Level Security (RLS)', back: 'Postgres feature that enforces per-row access policies at the database level.\n\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY posts_tenant ON posts USING (tenant_id = current_setting(\'app.tenant_id\')::uuid);\n\nApp sets SET LOCAL app.tenant_id once per request; queries automatically scoped. Defense-in-depth — even a query missing WHERE tenant_id = ? returns nothing for the wrong tenant.' },
      { id: 'db-fc-28', front: 'LISTEN / NOTIFY in Postgres', back: 'Built-in pub/sub. NOTIFY channel, \'payload\'; subscribers LISTEN channel and receive payloads.\n\nUse for: cache invalidation across app instances, real-time UI updates without an external broker, simple work queues.\n\nCaveats: NOT durable — messages dropped if no listener at the moment of NOTIFY. Payload limited to ~8KB. Don\'t replace Kafka with this for serious queueing.' },
      { id: 'db-fc-29', front: 'Materialized view CONCURRENTLY refresh', back: 'A materialized view stores the result of a query as a table.\n\nREFRESH MATERIALIZED VIEW name — locks reads while rebuilding (slow).\nREFRESH MATERIALIZED VIEW CONCURRENTLY name — rebuilds in background; reads not blocked. Requires a UNIQUE index on the view.\n\nGreat for analytical dashboards built off OLTP data. Schedule refresh based on data freshness needs.' },
      { id: 'db-fc-30', front: 'Multi-tenancy patterns', back: 'Three common shapes:\n• Shared schema + tenant_id column (cheapest, RLS for safety)\n• Schema per tenant (better isolation; many migrations to manage)\n• Database per tenant (max isolation; expensive at scale)\n\nMost SaaS starts on shared schema, splits the heaviest customers off when noisy-neighbor problems appear. Don\'t pre-optimize.' }
    ],
    quizQuestions: [
      {
        id: 'db-q-1',
        question: 'Which database type is best for complex relationships?',
        options: ['Key-Value store', 'Document database', 'Relational database', 'Column store'],
        correctAnswer: 2,
        explanation: 'Relational databases excel at complex relationships with foreign keys and JOINs. They enforce referential integrity.'
      },
      {
        id: 'db-q-2',
        question: 'What does 3NF eliminate?',
        options: ['Null values', 'Transitive dependencies', 'All JOINs', 'Primary keys'],
        correctAnswer: 1,
        explanation: 'Third Normal Form eliminates transitive dependencies where non-key columns depend on other non-key columns.'
      },
      {
        id: 'db-q-3',
        question: 'When might you intentionally denormalize?',
        options: ['Always', 'Never', 'Read-heavy with expensive JOINs', 'Write-heavy workloads'],
        correctAnswer: 2,
        explanation: 'Denormalization trades write complexity for read performance. Useful when read queries with many JOINs are bottlenecks.'
      },
      {
        id: 'db-q-4',
        question: 'What does the "I" in ACID stand for?',
        options: ['Integrity', 'Isolation', 'Indexing', 'Immutability'],
        correctAnswer: 1,
        explanation: 'Isolation ensures concurrent transactions don\'t interfere with each other. Each transaction sees a consistent view.'
      },
      {
        id: 'db-q-5',
        question: 'Which index type is best for exact match lookups?',
        options: ['B-Tree', 'Hash', 'Full-text', 'Partial'],
        correctAnswer: 1,
        explanation: 'Hash indexes provide O(1) lookup for exact matches. B-Tree is better for range queries and sorting.'
      },
      {
        id: 'db-q-6',
        question: 'What is the main drawback of horizontal sharding?',
        options: ['Slower reads', 'Cross-shard queries are complex', 'Less storage', 'Single point of failure'],
        correctAnswer: 1,
        explanation: 'Sharding makes cross-shard queries and JOINs complex. Need application logic to route queries and aggregate results.'
      },
      {
        id: 'db-q-7',
        question: 'You need to add a NOT NULL column with a default to a 100M-row Postgres table without downtime. What\'s the safest approach?',
        options: ['Single ALTER TABLE statement at midnight', 'Use a non-volatile DEFAULT (Postgres 11+ skips table rewrite); add NOT NULL with NOT VALID then VALIDATE separately', 'Drop and recreate the table', 'Disable indexes temporarily'],
        correctAnswer: 1,
        explanation: 'Postgres 11+ optimizes ADD COLUMN with non-volatile DEFAULT to a metadata-only change (no row rewrite). VOLATILE defaults like now() force a full rewrite that locks for hours.'
      },
      {
        id: 'db-q-8',
        question: 'You\'re renaming a column in production with no downtime. What pattern do you follow?',
        options: ['Single migration that renames it', 'Big-bang deploy with downtime', 'Expand-contract: add new column, dual-write, backfill, cut over reads, drop old', 'Rename in shadow DB and switch'],
        correctAnswer: 2,
        explanation: 'Expand-contract is the canonical zero-downtime pattern: each step is independently shippable and rollback-safe.'
      },
      {
        id: 'db-q-9',
        question: 'Why should production index creation use CREATE INDEX CONCURRENTLY?',
        options: ['It\'s faster', 'It avoids the AccessExclusiveLock that would block writes during the build', 'It uses less disk', 'It\'s required by spec'],
        correctAnswer: 1,
        explanation: 'CONCURRENTLY builds the index in the background without blocking writes. Slower than regular CREATE INDEX, but safe to run in production.'
      },
      {
        id: 'db-q-10',
        question: 'You have 100 app pods, each with a connection pool of 20. Postgres is hitting "too many connections." What\'s the fix?',
        options: ['Increase max_connections to 5000', 'Put pgbouncer (transaction mode) in front; app pods → pgbouncer (5000) → small pool to Postgres (~30)', 'Reduce pods to 5', 'Use NoSQL'],
        correctAnswer: 1,
        explanation: 'Postgres backends are expensive (process per connection). pgbouncer transaction-mode multiplexes thousands of clients onto a small backend pool sized to your CPU cores.'
      },
      {
        id: 'db-q-11',
        question: 'Why prefer UUIDv7 over UUIDv4 for primary keys?',
        options: ['It\'s shorter', 'UUIDv7 is timestamp-prefixed and monotonic, so B-tree inserts hit recent pages instead of fragmenting the index across random pages', 'Better collision resistance', 'It\'s required by spec'],
        correctAnswer: 1,
        explanation: 'UUIDv4 is fully random — every insert hits a random page, fragmenting the index and tanking write throughput. UUIDv7 (RFC 9562) is timestamp-prefixed; inserts are monotonic and cache-friendly.'
      },
      {
        id: 'db-q-12',
        question: 'Your app is multi-tenant. How do you ensure that even a query missing "WHERE tenant_id = ?" never leaks data across tenants?',
        options: ['Code review every query', 'Postgres Row-Level Security policies enforced via SET LOCAL app.tenant_id', 'Per-table check constraints', 'Always use stored procedures'],
        correctAnswer: 1,
        explanation: 'RLS enforces filtering at the database level. Even a developer who forgets the WHERE clause gets the right rows because Postgres applies the policy. Defense in depth — app filters too.'
      },
      {
        id: 'db-q-13',
        question: 'A Postgres column should store time of an event globally consistent across time zones. Which type?',
        options: ['DATE', 'TIMESTAMP WITHOUT TIME ZONE', 'TIMESTAMPTZ (TIMESTAMP WITH TIME ZONE)', 'TEXT in ISO 8601'],
        correctAnswer: 2,
        explanation: 'TIMESTAMPTZ stores the moment in UTC, returning correct local time for each session\'s configured zone. TIMESTAMP without zone is wall-clock-only and inconsistent across zones — almost never what you want.'
      },
      {
        id: 'db-q-14',
        question: 'You need fast "find products with attrs containing color: red" queries on a JSONB column. What index?',
        options: ['B-tree on the column', 'GIN index on the JSONB column', 'Hash index', 'No index'],
        correctAnswer: 1,
        explanation: 'GIN (Generalized Inverted Index) on JSONB enables fast containment queries (@>). B-tree only helps for full-value lookups; not useful for nested-key search.'
      },
      {
        id: 'db-q-15',
        question: 'You want to find the top 3 products by sales in each category. What\'s the cleanest SQL approach?',
        options: ['One query per category', 'Self-join with ORDER BY', 'Window function: ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) <= 3', 'Application-side filtering'],
        correctAnswer: 2,
        explanation: 'Window functions partition rows by category and rank within each partition without collapsing. Cleaner and faster than self-joins or N queries.'
      },
      {
        id: 'db-q-16',
        question: 'An ORM loop does: users = User.all(); for u in users: print(u.posts.count()). With 500 users, how many queries run, and what is the fix?',
        options: ['1 query — the ORM joins automatically', '501 queries (1 + N); fix with eager loading (a JOIN or a single WHERE user_id IN (...) query)', '2 queries — one per table', '500 queries; fix by adding an index on posts.user_id'],
        correctAnswer: 1,
        explanation: 'Lazy-loaded associations fire one query per parent row — the N+1 problem. Eager loading (includes / joinedload / select_related) fetches all children in one extra query or a JOIN. An index speeds up each of the 500 queries but does not remove the 500 round trips.'
      },
      {
        id: 'db-q-17',
        question: 'Deleting a user must also delete their sessions, but must fail if the user has any orders. Which foreign key actions?',
        options: ['sessions.user_id ON DELETE CASCADE; orders.user_id ON DELETE RESTRICT', 'Both ON DELETE CASCADE', 'Both ON DELETE SET NULL', 'sessions ON DELETE SET NULL; orders ON DELETE CASCADE'],
        correctAnswer: 0,
        explanation: 'CASCADE propagates the delete to dependent rows (fine for disposable sessions). RESTRICT (or NO ACTION) rejects the delete while referencing rows exist, protecting financial records. Cascading orders would silently destroy history; SET NULL would orphan them.'
      },
      {
        id: 'db-q-18',
        question: 'UPDATE accounts SET balance = 90, version = version + 1 WHERE id = 7 AND version = 3 returns "0 rows affected". What does that mean, and what should the app do?',
        options: ['The row was deleted; insert it again', 'The update succeeded silently', 'The database is read-only', 'Another transaction changed the row since it was read (version is no longer 3); reload the row and retry the operation'],
        correctAnswer: 3,
        explanation: 'This is optimistic locking with a version column. Zero affected rows means the WHERE clause failed because someone else already bumped the version. The app re-reads, reapplies its change, and retries — no long-held locks needed.'
      },
      {
        id: 'db-q-19',
        question: 'You have a B-tree index on users(email), but WHERE lower(email) = lower($1) still does a sequential scan. Why, and what fixes it?',
        options: ['The index is corrupted; run REINDEX', 'Wrapping the column in a function hides it from the index; create an expression index ON users (lower(email)) or use a case-insensitive type/collation', 'B-tree indexes never work with text columns', 'Add LIMIT 1'],
        correctAnswer: 1,
        explanation: 'A B-tree indexes the stored value, not lower(value), so the planner cannot use it for a function-wrapped predicate. An expression index matches the expression exactly. Same reason WHERE created_at::date = ... or LIKE \'%foo\' cannot use a plain index.'
      },
      {
        id: 'db-q-20',
        question: 'Transaction A updates row 1 then row 2; transaction B updates row 2 then row 1, concurrently. Postgres aborts one with "deadlock detected". What is the durable fix?',
        options: ['Increase deadlock_timeout', 'Retry the aborted transaction forever', 'Acquire locks in a consistent global order (e.g. always touch rows sorted by id) so cycles cannot form, and retry the aborted transaction once', 'Switch to SERIALIZABLE isolation'],
        correctAnswer: 2,
        explanation: 'Deadlocks come from lock-ordering cycles. Sorting the rows you touch (ORDER BY id in SELECT ... FOR UPDATE, or updating in id order) guarantees every transaction takes locks in the same order. Raising the timeout only delays detection; SERIALIZABLE does not prevent lock-wait cycles.'
      }
    ],
    visualizations: [
      {
        id: 'db-viz-1',
        title: 'SQL vs NoSQL',
        type: 'diagram',
        description: 'Comparing database paradigms',
        nodes: [
          { id: 'sql', label: 'SQL', x: 100, y: 50 },
          { id: 'nosql', label: 'NoSQL', x: 300, y: 50 },
          { id: 'structure', label: 'Structured', x: 100, y: 120 },
          { id: 'flexible', label: 'Flexible', x: 300, y: 120 },
          { id: 'scale-v', label: 'Vertical Scale', x: 100, y: 190 },
          { id: 'scale-h', label: 'Horizontal Scale', x: 300, y: 190 }
        ],
        edges: [
          { from: 'sql', to: 'structure' },
          { from: 'sql', to: 'scale-v' },
          { from: 'nosql', to: 'flexible' },
          { from: 'nosql', to: 'scale-h' }
        ]
      },
      {
        id: 'db-viz-2',
        title: 'Database Replication',
        type: 'diagram',
        description: 'Primary-Replica architecture',
        nodes: [
          { id: 'app', label: 'Application', x: 200, y: 30 },
          { id: 'primary', label: 'Primary (Write)', x: 200, y: 110 },
          { id: 'replica1', label: 'Replica (Read)', x: 80, y: 190 },
          { id: 'replica2', label: 'Replica (Read)', x: 320, y: 190 }
        ],
        edges: [
          { from: 'app', to: 'primary', label: 'writes' },
          { from: 'primary', to: 'replica1', label: 'sync' },
          { from: 'primary', to: 'replica2', label: 'sync' },
          { from: 'app', to: 'replica1', label: 'reads' },
          { from: 'app', to: 'replica2', label: 'reads' }
        ]
      }
    ]
  },

  // 3. Authentication & Authorization
  {
    id: 'auth',
    name: 'Auth & Authorization',
    slug: 'auth',
    description: 'JWT, OAuth, sessions, and access control patterns',
    icon: 'key-outline',
    color: '#9C27B0',
    colorDark: '#7B1FA2',
    premium: true,
    learnContent: [
      {
        id: 'auth-1',
        title: 'Authentication vs Authorization',
        content: `Authentication (AuthN) verifies WHO you are.
Authorization (AuthZ) verifies WHAT you can do.

Authentication methods:
• Session-based: server stores session state
• Token-based: client stores JWT
• OAuth/OIDC: third-party identity providers
• API keys: simple service authentication
• Multi-factor: something you know + have + are

Authorization models:
• RBAC: Role-Based Access Control
• ABAC: Attribute-Based Access Control
• ACL: Access Control Lists
• ReBAC: Relationship-Based Access Control`,
        codeExample: `// Authentication middleware
const authenticate = async (req, res, next) => {
  // Expect "Authorization: Bearer <token>"
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // verify() checks signature + expiry, throws if invalid
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;  // attach identity for later handlers
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware
// Who you are is known; now check what you may do
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });  // 403, not 401
  }
  next();
};

// Usage: authN first, then authZ, then the handler
app.delete('/users/:id',
  authenticate,
  authorize('admin'),
  deleteUser
);`
      },
      {
        id: 'auth-2',
        title: 'JWT (JSON Web Tokens)',
        content: `JWTs are self-contained tokens for stateless authentication.

Structure: header.payload.signature
• Header: algorithm and token type
• Payload: claims (user data, expiration)
• Signature: verifies token integrity

Best practices:
• Short expiration (15min access, days refresh)
• Store refresh token securely (httpOnly cookie)
• Include only necessary claims
• Use RS256 for distributed systems
• Don't store sensitive data in payload (it's base64, not encrypted)`,
        codeExample: `// Generate tokens
// Access token: short-lived, sent on every API call
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  ACCESS_SECRET,
  { expiresIn: '15m' }
);

// Refresh token: long-lived, only used to mint new access tokens
const refreshToken = jwt.sign(
  { userId: user.id, tokenVersion: user.tokenVersion },
  REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Set refresh token as httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,   // JS can't read it → XSS can't steal it
  secure: true,     // HTTPS only
  sameSite: 'strict',  // blocks CSRF sends
  maxAge: 7 * 24 * 60 * 60 * 1000
});

// Refresh flow
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const { userId, tokenVersion } = jwt.verify(refreshToken, REFRESH_SECRET);

    // Validate token version (allows invalidation)
    const user = await User.findById(userId);
    if (user.tokenVersion !== tokenVersion) {
      throw new Error('Token revoked');
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});`
      },
      {
        id: 'auth-3',
        title: 'OAuth 2.0 & OpenID Connect',
        content: `OAuth 2.0 is for authorization, OIDC adds authentication.

OAuth 2.0 flows:
• Authorization Code: web apps (most secure)
• PKCE: mobile/SPA (no client secret)
• Client Credentials: machine-to-machine
• Implicit: deprecated (use PKCE instead)

Key concepts:
• Resource Owner: the user
• Client: your application
• Authorization Server: issues tokens
• Resource Server: protected API

OIDC adds:
• ID Token: contains user info
• UserInfo endpoint
• Standardized claims (sub, email, name)`,
        codeExample: `// Authorization Code Flow with PKCE

// 1. Generate code verifier and challenge
const codeVerifier = generateRandomString(64);
const codeChallenge = base64url(sha256(codeVerifier));

// 2. Redirect user to auth server
const authUrl = new URL('https://auth.example.com/authorize');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', randomState);  // anti-CSRF nonce

// 3. Exchange code for tokens
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  verifyState(state);

  const tokens = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier  // Prove we initiated the request
    })
  }).then(r => r.json());

  // tokens.access_token, tokens.id_token, tokens.refresh_token
});`
      },
      {
        id: 'auth-4',
        title: 'Session-Based Authentication',
        content: `Traditional server-side session management.

How it works:
1. User logs in with credentials
2. Server creates session, stores in session store
3. Server sends session ID as cookie
4. Client sends cookie with each request
5. Server validates session ID

Session stores:
• Memory (dev only, not scalable)
• Redis (fast, scalable)
• Database (persistent but slower)

Pros: Easy to invalidate, smaller cookie
Cons: Server state, scaling challenges`,
        codeExample: `// Express session setup with Redis
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis').createClient();

app.use(session({
  store: new RedisStore({ client: redis }),  // shared across servers
  secret: SESSION_SECRET,  // signs the cookie against tampering
  resave: false,             // don't rewrite unchanged sessions
  saveUninitialized: false,  // no session until login
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));

// Login
app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // Writing to req.session persists it to Redis automatically
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ message: 'Logged in' });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy();  // server-side invalidation, instant
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};`
      },
      {
        id: 'auth-5',
        title: 'Security Best Practices',
        content: `Protect your authentication system.

Password security:
• Use bcrypt/argon2 with high cost factor
• Never store plain text passwords
• Implement rate limiting on login
• Use secure password reset flows

Token security:
• Short-lived access tokens
• Secure refresh token storage
• Token rotation on refresh
• Ability to revoke tokens

Additional measures:
• HTTPS everywhere
• CSRF protection
• Content Security Policy
• Security headers (Helmet.js)`,
        codeExample: `// Password hashing with bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;  // cost factor: higher = slower to brute-force

// Hash password on signup
const hash = await bcrypt.hash(password, SALT_ROUNDS);
await User.create({ email, passwordHash: hash });

// Verify on login
const user = await User.findByEmail(email);
// compare() re-hashes with the salt stored inside the hash
const valid = await bcrypt.compare(password, user.passwordHash);

// Rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: { error: 'Too many login attempts' }
});

app.post('/login', loginLimiter, handleLogin);

// Security headers with Helmet
const helmet = require('helmet');
app.use(helmet());

// CSRF protection
const csrf = require('csurf');
app.use(csrf({ cookie: true }));

app.get('/form', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});`
      },
      {
        id: 'auth-6',
        title: 'MFA: TOTP, Recovery Codes, WebAuthn',
        content: `Multi-factor authentication is no longer optional for any account that holds value. The 2026 best-practice stack: passkeys primary, TOTP fallback, SMS only as last resort.

TOTP (Time-based One-Time Password, RFC 6238):
• Server generates a per-user secret on enrollment, displays as a QR code (otpauth:// URI)
• User\'s authenticator app (Google Authenticator, 1Password, Authy) reads it and stores
• Both sides compute HMAC-SHA1(secret, floor(unix_time / 30)) → 6-digit code
• Server checks current code AND ±1 window to handle clock drift
• Code is valid 30s; replay-resistant if you record used codes per user

HOTP vs TOTP:
• HOTP is counter-based (RFC 4226). Both sides increment a counter. Drift is harder to recover from.
• TOTP is HOTP with time as the counter. Standard for app-based 2FA.

Recovery codes:
• 8–10 single-use codes shown ONCE at enrollment
• User stores them somewhere safe (printed, password manager)
• Required for account recovery if device is lost
• Hashed in DB like passwords; mark as used on consumption

WebAuthn / passkeys:
• Public-key crypto bound to a hardware device (Touch ID, Face ID, security key, platform passkey)
• Phishing-resistant by design — the device only signs for the legit origin
• Modern best practice: passkey as primary, TOTP as fallback, SMS only as last resort
• Server stores credential ID + public key + counter (defense against cloned authenticators)

SMS 2FA:
• Better than nothing, weakest in the family
• Vulnerable to SIM swapping, SS7 attacks, phishing
• Avoid for high-value accounts (bank, admin); accept for low-value with risk-based step-up

Risk-based step-up auth:
• Default flow uses one factor
• Step up to MFA on signals: new device, new location, sensitive action (password change, large transaction)
• Increases security without burdening every login`,
        codeExample: `// TOTP enrollment (Node, otplib)
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

const secret = authenticator.generateSecret(); // base32
// Not enabled until the user proves their app has the secret
await db.users.update(userId, { totp_secret: secret, totp_enabled: false });

// otpauth:// URI rendered as QR for the authenticator app
const otpauth = authenticator.keyuri(user.email, 'Algogo', secret);
const qr = await qrcode.toDataURL(otpauth);
res.json({ qr });

// Verify enrollment with first code
app.post('/mfa/verify', async (req, res) => {
  const { code } = req.body;
  const user = await db.users.find(req.user.id);
  // check() computes TOTP for now ±1 window (clock drift)
  if (!authenticator.check(code, user.totp_secret)) {
    return res.status(401).json({ error: 'Invalid code' });
  }
  await db.users.update(user.id, { totp_enabled: true });
  // Generate + show recovery codes (hash before storing)
  const recovery = Array.from({ length: 10 }, () => crypto.randomBytes(8).toString('hex'));
  await db.recovery_codes.bulkCreate(recovery.map(r => ({
    user_id: user.id,
    code_hash: bcrypt.hashSync(r, 10),
  })));
  res.json({ recoveryCodes: recovery });
});`
      },
      {
        id: 'auth-7',
        title: 'Password Reset & Magic Link Flows',
        content: `These flows are an attacker\'s favorite door — get them right.

Password reset:
1. User enters email → server checks if account exists; ALWAYS responds the same way (don\'t leak existence)
2. Generate a single-use, time-bound token (32+ bytes random, base64url)
3. Hash the token with sha256; store hash + expiry in DB; return raw token in email link
4. Email link → user pastes new password
5. Server hashes the link\'s token, looks up hash in DB; if found and not expired, mark consumed and update password
6. Invalidate all existing sessions of that user (force re-login everywhere)

Critical gotchas:
• Tokens MUST be single-use — flag consumed in DB, race-safe with UPDATE ... WHERE consumed_at IS NULL
• Short TTL (15–60 min) — long enough for users; short enough to limit blast radius
• Notify the user via email when password changes ("if this wasn\'t you...")
• Throttle reset requests per email (5/hour)

Magic links (passwordless via email):
• Same architecture as password reset, but the consumed token logs in instead of resetting
• UX win for occasional-use apps (Slack, Notion, Glassdoor)
• Risks: email account compromise = full account access; phishing kits forge magic links
• Pair with device fingerprinting and step-up MFA for sensitive actions

Email verification:
• Same token shape as reset; goal is to prove the user owns the email
• Don\'t let unverified accounts perform sensitive actions
• Re-verify on email change

Token shape comparison:
• Random 32-byte token + DB lookup: simplest, server has full control, easy to revoke
• Signed JWT in URL: stateless but harder to revoke (need a deny list); larger
• Most teams use the DB lookup pattern — boring, secure, debuggable`,
        codeExample: `// Reset flow — request
app.post('/password/reset/request', async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  // Always respond OK — don't leak existence
  res.json({ ok: true });
  if (!user) return;

  const raw = crypto.randomBytes(32).toString('base64url');
  // Store only the hash — a DB leak can't reuse tokens
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  await db.password_reset_tokens.create({
    user_id: user.id,
    token_hash: hash,
    expires_at: new Date(Date.now() + 30 * 60_000),
  });
  await sendEmail(user.email, \`https://app/reset?token=\${raw}\`);
});

// Reset flow — consume
app.post('/password/reset/consume', async (req, res) => {
  const { token, password } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  // Single UPDATE = atomic single-use check (race-safe)
  const result = await db.password_reset_tokens.update({
    where: { token_hash: hash, consumed_at: null, expires_at: { gt: new Date() } },
    data: { consumed_at: new Date() },
  });
  if (result.count === 0) return res.status(400).json({ error: 'Invalid or expired token' });

  await db.users.update({ /* ... new password hash ... */ });
  await db.sessions.deleteMany({ user_id: result.user_id }); // force re-login
});`
      },
      {
        id: 'auth-8',
        title: 'Session Management at Scale',
        content: `Once you have more than one app pod, session storage becomes a real architectural decision.

Cookie-based session ID (server-side store):
• Server issues an opaque session ID, stores associated state (user_id, expires_at, csrf_token, etc.) in a shared store
• Cookie is HttpOnly + Secure + SameSite=Strict/Lax + __Host- prefix
• Easy revocation: delete the row → next request fails
• Stores: Redis (most common), Memcached, dedicated DB table

Distributed session store choices:
• Redis: fast, supports TTL, simple. Industry default for sessions.
• DB table: slow but durable; only sensible for low-traffic apps
• Memcached: fast, no persistence; OK if losing sessions on restart is acceptable

Sliding expiry:
• Update expires_at on every request → session lasts as long as the user is active
• Refresh in Redis with EXPIRE; in DB, only update if last_seen is more than N minutes old (avoid write-storm)

Sticky sessions (last resort):
• Load balancer routes the same client to the same backend (cookie-based affinity)
• Used when sessions live in app memory (legacy)
• Defeats horizontal scaling — first pod down loses its sessions
• Modern apps avoid this entirely with a shared session store

Cookie attributes:
• Secure: HTTPS only — don\'t leak over plaintext
• HttpOnly: not accessible to JS — XSS can\'t read it
• SameSite=Lax (modern default) prevents most CSRF; Strict for sensitive sites
• __Host- prefix forces Secure + Path=/ + no Domain — host-only cookie

Session vs JWT decision:
• Pure JWT in cookie/storage: no server state, fast, but revocation requires a deny list (defeats statelessness)
• Session ID + server store: trivial revocation, audit, "log out all devices" work
• Hybrid: short-lived JWT access token (5 min) + opaque refresh token (DB-backed) — most common modern pattern. Refresh token IS effectively a session.

Concurrent session limits:
• Cap how many active sessions per user (1 for banking, many for social)
• Cleaner than just "log out everywhere on password change" — natural device management UI`,
        codeExample: `// Redis session middleware
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60_000, // 30 days
  },
  rolling: true,                  // sliding expiration
  name: '__Host-session',         // host-only, secure, path=/
  resave: false,
  saveUninitialized: false,
}));`
      },
      {
        id: 'auth-9',
        title: 'SSO: SAML vs OIDC',
        content: `Single Sign-On lets a user log in once at an Identity Provider (IdP) and access many Service Providers (SPs) without re-entering credentials. Two protocols dominate.

SAML 2.0:
• XML-based, designed in 2005, ubiquitous in enterprise
• Browser POSTs an XML SAMLResponse signed by the IdP
• SPs verify the signature, extract claims, create a session
• Painful: XML signature canonicalization bugs, XXE risks, fiddly metadata exchange
• Still required by most enterprise customers ("we use Okta/AzureAD for SSO")

OIDC (OpenID Connect):
• Built on OAuth 2.0, JSON-based, designed for modern apps
• Three flows; Authorization Code with PKCE is the only correct one
• Returns JSON tokens (id_token = JWT, access_token, refresh_token)
• Cleaner, simpler, better tooling

When does each fit?
• Modern web/mobile/SPA: OIDC always
• Old enterprise IdPs only support SAML: live with it
• B2B SaaS targeting enterprise: implement BOTH (SCIM for provisioning + SAML for SSO + OIDC for modern customers)

SP-initiated vs IdP-initiated:
• SP-initiated: user goes to your app first; you redirect them to the IdP for auth; they come back authenticated. Most secure.
• IdP-initiated: user clicks "Algogo" tile in the IdP\'s app launcher; IdP POSTs assertion to your SP without you initiating. Vulnerable to assertion replay if not careful — defense: nonce, time bounds, audience check.

SCIM (System for Cross-domain Identity Management):
• HTTP API for provisioning (creating, updating, deactivating users) and group sync
• Customer\'s IdP pushes user lifecycle events to your /scim/v2/Users endpoint
• Required for "automatic offboarding" enterprise expectations
• Often paired with SSO so account creation + access work together

Just-in-time (JIT) provisioning:
• Create the user account on first SSO login from claims in the assertion
• Avoids requiring SCIM for simpler setups
• Can\'t handle deprovisioning on its own — pair with SCIM or periodic cleanup`,
      },
      {
        id: 'auth-10',
        title: 'Permissions: RBAC, ABAC, ReBAC',
        content: `As your app grows, "is_admin" boolean stops being enough. Three models for serious permission systems.

RBAC (Role-Based Access Control):
• Users → Roles → Permissions
• Admin role grants 100 permissions; assign Admin to a user
• Simple, common, fits most apps under 100k users
• Cracks when permissions need to vary by row (which orders can this support agent see?)

ABAC (Attribute-Based Access Control):
• Decisions based on attributes: user attrs (department, level, region), resource attrs (owner, sensitivity), environment (time, IP)
• Policies expressed in a language (XACML, Cedar, OPA Rego)
• Powerful: "support agents can read tickets in their region during business hours unless escalated"
• Cost: policy authoring becomes a real skill; debugging "why was this denied?" gets harder

ReBAC (Relationship-Based Access Control):
• Decisions based on graph relationships: user is a member of group X, X is editor on document Y
• Google\'s Zanzibar paper describes the most famous implementation (Google Drive, Calendar, YouTube)
• Open-source: SpiceDB (AuthZed), OpenFGA (Auth0)
• Killer for apps with hierarchical/nested permissions: folders, organizations, teams

Production pattern:
• Start with RBAC for coarse-grained ("admin", "user", "billing")
• Add row-level checks (often done via DB RLS or query filters) for resource ownership
• Reach for ABAC/ReBAC engine when permissions become too dynamic for code

Engines:
• OPA (Open Policy Agent): policy-as-code, runs anywhere, common for infrastructure
• Cedar (AWS): typed policy language, fast eval, used by AWS Verified Permissions
• SpiceDB / OpenFGA: Zanzibar-style, relationship graph
• Casbin: lightweight, multi-paradigm

Two enforcement points:
• PEP (Policy Enforcement Point): your code that asks "can this user do X?"
• PDP (Policy Decision Point): the engine that returns yes/no

Cache decisions carefully — stale "yes" is a security bug.`,
        codeExample: `// RBAC with explicit role check
// Role → flat list of permission strings
const ROLES = {
  admin: ['users:read', 'users:write', 'billing:read'],
  support: ['users:read'],
  user: ['profile:read', 'profile:write'],
};

// Middleware factory: guard routes by permission, not role
function requirePermission(perm) {
  return (req, res, next) => {
    const userPerms = ROLES[req.user.role] ?? [];
    if (!userPerms.includes(perm)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

app.post('/users/:id', requirePermission('users:write'), updateUser);

// Zanzibar-style relationship tuple (SpiceDB)
// (user:alice, can-edit, document:42) — derived through:
//   user:alice → member-of → team:backend → editor-of → document:42

await zed.checkPermission({
  resource: { objectType: 'document', objectId: '42' },
  permission: 'edit',
  subject: { object: { objectType: 'user', objectId: 'alice' } },
});`
      },
      {
        id: 'auth-11',
        title: 'API Keys & Service-to-Service Auth',
        content: `Authenticating non-human callers — partners, microservices, CLI tools — uses different patterns than user auth.

API keys:
• Long random string (32+ bytes) issued per integration
• Sent in Authorization: Bearer <key> or X-API-Key header
• Hash before storing (treat like passwords); compare hashes on lookup
• Each key has scopes (read, write, admin, specific resources) and a key_id for revocation
• Show key ONCE at creation; users save it themselves

Rotation:
• Allow multiple active keys per user/integration
• Issue a new one, customer rotates clients, old one deleted
• Set last_used_at + expires_at to enable "auto-disable unused keys after 90 days"

Token introspection (OAuth, RFC 7662):
• When you accept tokens you didn\'t issue, you call the issuer\'s /introspect endpoint to validate
• Returns: active, scope, exp, sub, etc.
• Cache results briefly (seconds) — full introspection on every request kills performance

Client Credentials grant (OAuth 2.0):
• For service-to-service calls — no user is involved
• Client app authenticates with client_id + client_secret to get an access token
• Standard mechanism behind "API key" SDKs in modern services

mTLS (mutual TLS):
• Both sides present certificates; both verify
• Service A\'s cert must be valid AND issued by a trusted CA
• Authentication is the network layer, not the application
• Fits well in service meshes (Istio, Linkerd) — cert provisioning automated via SPIFFE/SPIRE
• Best for high-security internal calls; impractical for public APIs

JWT for service-to-service:
• Small, stateless, no introspection round trip
• Issuer signs with a private key; consumers verify with the public key
• Pair with short TTL + key rotation via JWKS

Auditability:
• Log who called what and when, with key_id
• Rate limit per key
• Alert on first usage from a new IP (possible key leak)

Secret hygiene:
• Never check secrets into git (use git-secrets, gitleaks, GitGuardian for detection)
• Inject from secret managers (Vault, AWS Secrets Manager, Doppler) at runtime
• Rotate on team-member departure, on suspected compromise, on schedule`,
        codeExample: `// API key issuance
async function createApiKey(userId, scopes) {
  const id = crypto.randomBytes(8).toString('hex');
  const secret = crypto.randomBytes(32).toString('base64url');
  // Prefix + id + secret: id enables lookup and revocation
  const fullKey = \`ak_\${id}_\${secret}\`;

  await db.api_keys.create({
    id,
    user_id: userId,
    secret_hash: bcrypt.hashSync(secret, 10),  // never store raw
    scopes,
    created_at: new Date(),
  });
  return fullKey; // shown ONCE, not stored
}

// Verification
app.use(async (req, res, next) => {
  const header = req.headers.authorization?.replace('Bearer ', '');
  if (!header?.startsWith('ak_')) return next();  // not an API key
  const [, id, secret] = header.split('_');
  const key = await db.api_keys.findById(id);  // fast lookup by id
  if (!key || !await bcrypt.compare(secret, key.secret_hash)) {
    return res.status(401).end();
  }
  req.apiKey = key;
  // Track usage — enables "disable stale keys" policies
  await db.api_keys.update(id, { last_used_at: new Date() });
  next();
});`
      }
    ],
    flashcards: [
      { id: 'auth-fc-1', front: 'What\'s the difference between authentication and authorization?', back: 'Authentication verifies identity (who you are). Authorization determines permissions (what you can do). AuthN happens before AuthZ.' },
      { id: 'auth-fc-2', front: 'What are the three parts of a JWT?', back: 'Header (algorithm, type), Payload (claims like userId, exp), Signature (verifies integrity). Format: header.payload.signature' },
      { id: 'auth-fc-3', front: 'Why use refresh tokens?', back: 'Access tokens are short-lived (minutes) for security. Refresh tokens are long-lived, stored securely, and used to get new access tokens without re-login.' },
      { id: 'auth-fc-4', front: 'What is RBAC?', back: 'Role-Based Access Control. Users are assigned roles (admin, user, editor), and permissions are granted to roles, not individual users.' },
      { id: 'auth-fc-5', front: 'What is PKCE in OAuth?', back: 'Proof Key for Code Exchange. Secures OAuth for public clients (mobile/SPA) that can\'t store secrets. Uses code_verifier and code_challenge.' },
      { id: 'auth-fc-6', front: 'Session vs JWT authentication?', back: 'Sessions: server-side state, easy to invalidate, scaling challenges. JWT: stateless, scalable, harder to invalidate, larger payload.' },
      { id: 'auth-fc-7', front: 'Why use httpOnly cookies for tokens?', back: 'httpOnly cookies can\'t be accessed by JavaScript, protecting against XSS attacks. Combined with Secure and SameSite for full protection.' },
      { id: 'auth-fc-8', front: 'What is token rotation?', back: 'Issuing a new refresh token each time it\'s used. Old token becomes invalid. Limits damage if refresh token is stolen.' },
      { id: 'auth-fc-9', front: 'What is CSRF and how to prevent it?', back: 'Cross-Site Request Forgery: attacker tricks user into making unwanted requests. Prevent with CSRF tokens, SameSite cookies, and checking Origin header.' },
      { id: 'auth-fc-10', front: 'Why not store sensitive data in JWT payload?', back: 'JWT payload is base64 encoded, not encrypted. Anyone can decode and read it. Only store non-sensitive claims like userId, role, expiration.' },
      { id: 'auth-fc-11', front: 'TOTP — how it works', back: 'Server and authenticator share a secret. Both compute HMAC-SHA1(secret, floor(now / 30)) → 6-digit code.\n\nServer accepts current code AND ±1 window for clock drift. Code is valid 30s; replay-resistant if you record used codes per user.\n\nStandardized as RFC 6238. Backed by every authenticator app (Google Authenticator, Authy, 1Password).' },
      { id: 'auth-fc-12', front: 'HOTP vs TOTP', back: 'HOTP (RFC 4226): counter-based. Both sides increment a counter on each use. Drift recovery is harder.\n\nTOTP (RFC 6238): HOTP with time as the counter. Standard for app-based 2FA today.\n\nHOTP still appears in some hardware tokens; TOTP is the default for software authenticators.' },
      { id: 'auth-fc-13', front: 'Recovery codes', back: '8–10 single-use codes shown ONCE at MFA enrollment. User stores them safely; required if device is lost.\n\nStore in DB hashed (like passwords); mark consumed_at on use. Generate fresh ones whenever the user resets MFA.\n\nWithout recovery codes, lost devices = locked-out account = support burden.' },
      { id: 'auth-fc-14', front: 'Why is SMS 2FA weak?', back: 'SIM swapping: attacker convinces carrier to port the victim\'s number to a SIM they control. SMS codes go to attacker.\n\nSS7 attacks: telecom protocol vulnerabilities allow message interception.\n\nPhishing: attacker forwards a real login page that captures the SMS code in real time.\n\nBetter than nothing for low-value accounts; never the only factor on high-value (banking, admin).' },
      { id: 'auth-fc-15', front: 'Password reset token requirements', back: 'A safe reset token must be:\n• Cryptographically random (32+ bytes)\n• Single-use (atomic UPDATE marks consumed)\n• Time-bound (15–60 min TTL)\n• Hashed in DB (raw token only in the email link)\n• Bound to the user account\n\nAnd the flow must invalidate all existing sessions on use.' },
      { id: 'auth-fc-16', front: 'Magic link security model', back: 'Email-based passwordless login: clicking a one-time link logs the user in.\n\nSame token shape as password reset. Risks: email account compromise = full app access; phishing kits forge links.\n\nMitigations: short TTL, single-use, IP/device check on click, step-up MFA for sensitive actions. Combine with passkeys for high-value flows.' },
      { id: 'auth-fc-17', front: 'Email-existence enumeration defense', back: 'Naive: "We sent a reset link to that email" if exists, "No such account" if not — leaks who has accounts.\n\nFix: ALWAYS respond identically regardless of account existence. Send the email only if the account exists. Apply the same rule to login errors ("invalid credentials" not "no such email").\n\nLeaked email enumeration enables credential stuffing on sister services.' },
      { id: 'auth-fc-18', front: 'Refresh token reuse detection', back: 'Refresh tokens rotate on each use. The OLD token is invalidated.\n\nIf the OLD token is presented again (e.g., attacker stole it but didn\'t use it before victim refreshed), it\'s a tampered/stolen-token signal. Server should:\n• Reject the request\n• Revoke the entire token family for that user\n• Force re-login on all devices\n\nStandard pattern in OAuth 2.1.' },
      { id: 'auth-fc-19', front: 'Sliding session expiry', back: 'Each request extends the session\'s expiration window. Active users stay logged in indefinitely; inactive ones eventually expire.\n\nImplementation: rolling: true on session middleware, or update last_seen + EXPIRE in Redis on each request.\n\nAvoid write-storm by only updating if last_seen is older than N minutes.' },
      { id: 'auth-fc-20', front: 'Distributed session store (Redis)', back: 'Multiple app pods share session state via Redis. Any pod can serve any request.\n\nKey pattern: sess:<session-id> → JSON blob (or hash) with TTL.\n\nFaster than DB-backed sessions; loses sessions only on full Redis loss (mitigate with persistence + replication). Industry default for stateful sessions.' },
      { id: 'auth-fc-21', front: 'SAML vs OIDC', back: 'SAML 2.0 (2005): XML-based, browser POST flow with signed XML assertion. Ubiquitous in enterprise IdPs (Okta, AzureAD, Ping). Painful protocol — XML signatures, canonicalization bugs.\n\nOIDC (built on OAuth 2.0): JSON-based, modern, cleaner. Returns JWT id_tokens.\n\nB2B SaaS targeting enterprise: implement BOTH. Modern apps for end users: OIDC only.' },
      { id: 'auth-fc-22', front: 'SP-initiated vs IdP-initiated SSO', back: 'SP-initiated: user lands on your app first; you redirect to the IdP; IdP authenticates and redirects back. Standard, more secure (you control the nonce).\n\nIdP-initiated: user clicks "Algogo" tile in IdP launcher; IdP POSTs assertion directly to you. Vulnerable to assertion replay if you don\'t validate audience, nonce, and issuance time strictly.' },
      { id: 'auth-fc-23', front: 'SCIM (System for Cross-domain Identity Management)', back: 'HTTP API for user/group provisioning. Customer\'s IdP pushes user lifecycle events (create, update, deactivate) to your /scim/v2/Users endpoint.\n\nRequired by enterprise customers for "automatic offboarding" — when an employee leaves, their access is revoked everywhere they had SCIM accounts within minutes.\n\nPair with SAML/OIDC for full B2B integration.' },
      { id: 'auth-fc-24', front: 'JIT (just-in-time) provisioning', back: 'Create the user account on first SSO login from claims in the assertion (email, name, groups).\n\nAvoids requiring SCIM. Simpler for small SSO deployments.\n\nLimitation: doesn\'t handle deprovisioning — user keeps access until you reap stale accounts. Pair with SCIM or periodic cleanup.' },
      { id: 'auth-fc-25', front: 'RBAC vs ABAC vs ReBAC', back: 'RBAC: users → roles → permissions. Simple, fits most apps. Cracks when permissions vary by row.\n\nABAC: decisions from attributes (user dept, resource owner, time). Powerful, complex policy authoring. Engines: OPA, Cedar.\n\nReBAC: decisions from relationship graphs (user member-of team, team editor-of doc). Google Zanzibar pattern. Engines: SpiceDB, OpenFGA. Best for hierarchical resources (Drive, GitHub).' },
      { id: 'auth-fc-26', front: 'Zanzibar-style permissions', back: 'Google\'s approach to global permission systems. Permissions modeled as relationship tuples: (user:alice, editor, document:42).\n\nDerived through hops: user:alice member-of team:eng, team:eng editor-of document:42 → alice can edit doc 42.\n\nOpen-source implementations: SpiceDB (AuthZed), OpenFGA (Auth0). Used in modern apps that need flexible, hierarchical permissions at scale.' },
      { id: 'auth-fc-27', front: 'API key rotation pattern', back: 'Allow multiple active keys per user/integration:\n1. Customer creates key #2 in dashboard\n2. Updates client to use key #2\n3. Confirms it works\n4. Deletes key #1\n\nWith only one slot, rotation requires downtime. last_used_at metadata enables alerts on stale keys and "auto-disable after 90 days unused."' },
      { id: 'auth-fc-28', front: 'Token introspection (RFC 7662)', back: 'When you accept tokens you didn\'t issue, you call the issuer\'s /introspect endpoint with the token to validate.\n\nReturns: active (true/false), scope, exp, sub, client_id, etc.\n\nCache briefly (1–5s) to avoid full introspection per request. Useful in proxy/gateway architectures where the gateway validates tokens for downstream services.' },
      { id: 'auth-fc-29', front: 'mTLS for service-to-service', back: 'Both sides present TLS certificates and verify each other. Authentication moves to the network layer.\n\nIn a service mesh (Istio, Linkerd), every workload gets a SPIFFE identity certificate; mTLS handshakes are automatic.\n\nKey for zero-trust networks; impractical for public APIs (cert distribution to clients is a nightmare).' },
      { id: 'auth-fc-30', front: 'OAuth Client Credentials grant', back: 'OAuth flow for service-to-service: client authenticates with client_id + client_secret to the token endpoint, gets an access token, calls APIs.\n\nNo user is involved — this is machine-to-machine auth.\n\nStandard mechanism behind modern API SDK auth: "create a client app in our dashboard, get id+secret, call our APIs."' }
    ],
    quizQuestions: [
      {
        id: 'auth-q-1',
        question: 'Which HTTP status code indicates authentication failure?',
        options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
        correctAnswer: 1,
        explanation: '401 Unauthorized means authentication is required or failed. 403 Forbidden means authenticated but not authorized.'
      },
      {
        id: 'auth-q-2',
        question: 'Where should refresh tokens be stored in a web app?',
        options: ['localStorage', 'sessionStorage', 'httpOnly cookie', 'URL parameter'],
        correctAnswer: 2,
        explanation: 'httpOnly cookies can\'t be accessed by JavaScript, protecting against XSS. Also set Secure and SameSite flags.'
      },
      {
        id: 'auth-q-3',
        question: 'What does OAuth 2.0 primarily provide?',
        options: ['Authentication', 'Authorization', 'Encryption', 'Session management'],
        correctAnswer: 1,
        explanation: 'OAuth 2.0 is an authorization framework. OpenID Connect (OIDC) is a layer on top that adds authentication.'
      },
      {
        id: 'auth-q-4',
        question: 'Which OAuth flow is best for single-page applications?',
        options: ['Implicit', 'Client Credentials', 'Authorization Code with PKCE', 'Password Grant'],
        correctAnswer: 2,
        explanation: 'Authorization Code with PKCE is recommended for SPAs. Implicit flow is deprecated due to security concerns.'
      },
      {
        id: 'auth-q-5',
        question: 'What algorithm should you use for password hashing?',
        options: ['MD5', 'SHA-256', 'bcrypt or argon2', 'Base64'],
        correctAnswer: 2,
        explanation: 'bcrypt and argon2 are designed for passwords with salt and work factor. MD5/SHA are fast hash functions, not suitable for passwords.'
      },
      {
        id: 'auth-q-6',
        question: 'What is the purpose of the JWT signature?',
        options: ['Encrypt the payload', 'Verify token integrity', 'Compress the token', 'Add user info'],
        correctAnswer: 1,
        explanation: 'The signature verifies the token hasn\'t been tampered with. It doesn\'t encrypt - the payload is still readable.'
      },
      {
        id: 'auth-q-7',
        question: 'TOTP code generation requires what server-side state?',
        options: ['Just the user\'s password', 'A per-user secret stored in DB at enrollment, used to derive 6-digit codes via HMAC-SHA1', 'A one-time challenge', 'The user\'s phone number'],
        correctAnswer: 1,
        explanation: 'TOTP shares a secret between server and authenticator app, established at QR-scan enrollment. Both sides derive the same code from HMAC(secret, time_window) at any moment.'
      },
      {
        id: 'auth-q-8',
        question: 'A password reset link should be valid for how long?',
        options: ['7 days', '15–60 minutes, single-use', 'Forever', 'Until the user logs in again'],
        correctAnswer: 1,
        explanation: 'Short TTL limits blast radius if the email is intercepted. Single-use prevents replay. Both are mandatory; long-lived multi-use tokens are how account-takeover incidents start.'
      },
      {
        id: 'auth-q-9',
        question: 'Why does enumeration defense require returning the same response whether or not an email exists?',
        options: ['Better UX', 'Different responses leak which emails have accounts → enables credential stuffing on other services', 'Required by GDPR', 'Caching reasons'],
        correctAnswer: 1,
        explanation: 'If "we sent a link" vs "no account" reveals existence, attackers learn which emails have accounts. They then try those emails with leaked password lists on other services.'
      },
      {
        id: 'auth-q-10',
        question: 'A user\'s refresh token gets used twice — first by the legit client, then by an attacker who stole it earlier. Modern OAuth 2.1 servers should:',
        options: ['Issue new tokens both times', 'Detect reuse of a rotated token, revoke the entire token family, force re-login', 'Block the IP', 'Email the user'],
        correctAnswer: 1,
        explanation: 'Reuse detection: when a refresh token is rotated, the old token is invalidated. If it ever comes back, it\'s evidence of theft. Revoke the family + force re-login limits blast radius.'
      },
      {
        id: 'auth-q-11',
        question: 'You\'re building B2B SaaS. Enterprise customers want SSO. What\'s the minimum protocol set to support?',
        options: ['Just OIDC', 'SAML 2.0 + OIDC + SCIM', 'Just SAML', 'Just OAuth 2.0'],
        correctAnswer: 1,
        explanation: 'SAML 2.0 is still the dominant enterprise SSO protocol. OIDC for modern customers. SCIM for automatic user provisioning/deprovisioning — required for "automatic offboarding" enterprise expectations.'
      },
      {
        id: 'auth-q-12',
        question: 'Your app has hierarchical permissions: folders contain documents; teams have access to folders. Which permissions model fits best?',
        options: ['RBAC with global roles', 'ABAC with attribute policies', 'ReBAC (Zanzibar-style) — relationships drive decisions', 'Hardcoded if-statements'],
        correctAnswer: 2,
        explanation: 'Hierarchical/relationship permissions (Drive, GitHub, Notion-like) are the canonical use case for ReBAC. Engines like SpiceDB or OpenFGA model "user member-of team, team editor-of folder, folder contains doc" naturally.'
      },
      {
        id: 'auth-q-13',
        question: 'How should an API key be stored in the database?',
        options: ['Plain text — it\'s a key, not a password', 'Hashed (bcrypt or argon2) like a password — never plain text', 'Encrypted with a master key', 'Base64-encoded'],
        correctAnswer: 1,
        explanation: 'API keys are bearer credentials — equivalent to passwords. Hash before storing; compare hashes on lookup. If the DB leaks, plain-text keys give attackers immediate API access.'
      },
      {
        id: 'auth-q-14',
        question: 'Service A calls Service B internally. What auth pattern provides the strongest identity guarantees with the least app-code burden?',
        options: ['Shared API key', 'Hardcoded IPs', 'mTLS with workload identity certificates (e.g., SPIFFE/SPIRE in a service mesh)', 'No auth — internal network is trusted'],
        correctAnswer: 2,
        explanation: 'mTLS authenticates at the network layer. In a service mesh, SPIRE provisions certs automatically; both sides verify each other on every connection. App code sees authenticated identity without writing auth code.'
      },
      {
        id: 'auth-q-15',
        question: 'Why are recovery codes essential for any TOTP/passkey-based MFA?',
        options: ['Backup of the password', 'Without them, a lost device = locked-out account = support burden and angry users', 'They\'re a regulatory requirement', 'They speed up login'],
        correctAnswer: 1,
        explanation: 'Devices are lost, stolen, replaced. Without offline-storable recovery codes, your only fallback is identity-verification by support — slow, error-prone, expensive. Recovery codes give the user a self-service escape hatch.'
      },
      {
        id: 'auth-q-16',
        question: 'Your JWT verifier reads alg from the token header and verifies with whatever algorithm it names. An attacker changes alg from RS256 to HS256 and signs the token with your PUBLIC key. Result?',
        options: ['Verification fails — public keys cannot sign', 'The token is rejected as expired', 'Only alg: none is dangerous; this is harmless', 'The forged token verifies: the library treats the RSA public key as an HMAC secret. Fix: pin the allowed algorithm and key type server-side; never trust the header'],
        correctAnswer: 3,
        explanation: 'This is the algorithm confusion attack. With HS256 the "key" is a shared secret; if the verifier feeds the (public) RSA key into HMAC verification, anyone can forge tokens. Hard-code the expected algorithm, and reject alg: none as well.'
      },
      {
        id: 'auth-q-17',
        question: 'Access tokens are stateless JWTs with a 15-minute TTL. A user reports a stolen laptop. How do you cut off access immediately instead of waiting 15 minutes?',
        options: ['Impossible with JWTs', 'Rotate the signing key — this logs everyone out', 'Keep a short-lived denylist (jti, or "user X issued before T") in Redis checked on every request, and revoke the refresh token so no new access tokens are minted', 'Have the user change their password; old tokens then fail automatically'],
        correctAnswer: 2,
        explanation: 'Stateless tokens cannot be recalled, so revocation needs a little state: a denylist whose entries expire when the token would have anyway. A password change does not invalidate an already-signed JWT unless you also check something like a per-user token version on each request.'
      },
      {
        id: 'auth-q-18',
        question: 'An attacker gets a victim to visit your site with a session cookie value the attacker chose, then the victim logs in. What attack is this, and what is the defense?',
        options: ['Session fixation; regenerate the session ID on login (and any privilege change) and reject session IDs the server did not issue', 'CSRF; use SameSite cookies', 'XSS; use httpOnly cookies', 'Clickjacking; use X-Frame-Options'],
        correctAnswer: 0,
        explanation: 'Session fixation works because the pre-login session ID survives authentication, so the attacker already knows the now-authenticated ID. Issuing a fresh ID at login breaks the link. SameSite, httpOnly and X-Frame-Options defend against different attacks.'
      },
      {
        id: 'auth-q-19',
        question: 'In the OAuth 2.0 authorization code flow, which parameter binds the callback to the browser session that started the flow, defending against login CSRF?',
        options: ['code_challenge', 'redirect_uri', 'state', 'scope'],
        correctAnswer: 2,
        explanation: 'The client generates a random state, stores it in the session, sends it to the authorization server, and verifies it on the redirect back. Without it an attacker can trick a victim into completing a flow with the attacker\'s authorization code. code_challenge (PKCE) protects the code from interception — a different threat.'
      },
      {
        id: 'auth-q-20',
        question: 'Your login handler returns "invalid credentials" immediately when the email is not found, but only after running bcrypt when it is. What is the problem?',
        options: ['No problem — both paths return the same message', 'The response-time difference leaks whether the email exists; always run the hash comparison (against a dummy hash if needed) so both paths take the same time', 'bcrypt is too slow; switch to SHA-256', 'The message should say "email not found" for clarity'],
        correctAnswer: 1,
        explanation: 'A ~100ms bcrypt call versus a ~1ms early return is trivially measurable, so timing defeats the identical error message and enables user enumeration. Hash against a stored dummy hash when the user is missing, and use constant-time comparison for the result.'
      }
    ],
    visualizations: [
      {
        id: 'auth-viz-1',
        title: 'JWT Authentication Flow',
        type: 'diagram',
        description: 'Token-based authentication',
        nodes: [
          { id: 'client', label: 'Client\nlogin', x: 100, y: 50, type: 'primary' },
          { id: 'server', label: 'Server\nverify', x: 250, y: 50, type: 'secondary' },
          { id: 'jwt', label: 'JWT\ntoken', x: 100, y: 150, type: 'info' },
          { id: 'api', label: 'API\ncall', x: 250, y: 150, type: 'success' }
        ],
        edges: [
          { from: 'client', to: 'server' },
          { from: 'server', to: 'jwt' },
          { from: 'jwt', to: 'api' }
        ]
      },
      {
        id: 'auth-viz-2',
        title: 'OAuth 2.0 Authorization Code Flow',
        type: 'diagram',
        description: 'Third-party authentication',
        nodes: [
          { id: 'user', label: 'User\nlogin', x: 100, y: 50, type: 'primary' },
          { id: 'auth', label: 'Auth\nServer', x: 250, y: 50, type: 'secondary' },
          { id: 'code', label: 'Auth\nCode', x: 100, y: 150, type: 'info' },
          { id: 'token', label: 'Access\nToken', x: 250, y: 150, type: 'success' }
        ],
        edges: [
          { from: 'user', to: 'auth' },
          { from: 'auth', to: 'code' },
          { from: 'code', to: 'token' }
        ]
      }
    ]
  },

  // 4. Microservices
  {
    id: 'microservices',
    name: 'Microservices',
    slug: 'microservices',
    description: 'Service architecture, communication, and patterns',
    icon: 'apps-outline',
    color: '#FF9800',
    colorDark: '#F57C00',
    premium: true,
    learnContent: [
      {
        id: 'micro-1',
        title: 'Microservices vs Monolith',
        content: `Microservices decompose applications into independent services.

Monolith:
• Single deployable unit
• Shared database
• Simpler to develop initially
• Scaling requires full app scaling
• One tech stack

Microservices:
• Independent, loosely coupled services
• Own database per service
• Independent deployment
• Team autonomy and tech diversity
• Higher operational complexity`,
        codeExample: `// Monolith - everything in one app
app.get('/orders/:id', async (req, res) => {
  const order = db.orders.find(req.params.id);
  const user = db.users.find(order.userId);
  const products = db.products.findMany(order.productIds);
  res.json({ order, user, products });
});

// Microservices - separate services
// Order Service
app.get('/orders/:id', async (req, res) => {
  const order = await orderDb.find(req.params.id);

  // Call other services via HTTP or gRPC
  // Promise.all = parallel fan-out, latency is the slowest call
  const [user, products] = await Promise.all([
    userService.getUser(order.userId),
    productService.getProducts(order.productIds)
  ]);

  res.json({ order, user, products });
});`
      },
      {
        id: 'micro-2',
        title: 'Service Communication',
        content: `Services communicate synchronously or asynchronously.

Synchronous:
• REST/HTTP: simple, widely understood
• gRPC: efficient, typed, streaming
• GraphQL Federation: unified graph

Asynchronous:
• Message queues: RabbitMQ, SQS
• Event streaming: Kafka
• Pub/Sub: decouple producers/consumers

Patterns:
• API Gateway: single entry point
• Service mesh: inter-service communication (Istio)
• Sidecar: proxy alongside each service`,
        codeExample: `// REST call between services
const user = await fetch(\`http://user-service/users/\${userId}\`)
  .then(r => r.json());

// gRPC (more efficient, typed)
const user = await userClient.GetUser({ id: userId });

// Async with message queue
// Producer (Order Service)
await rabbitMQ.publish('order.created', {
  orderId: order.id,
  userId: order.userId,
  items: order.items
});

// Consumer (Email Service)
rabbitMQ.subscribe('order.created', async (msg) => {
  const order = JSON.parse(msg.content);
  await sendOrderConfirmation(order);
  channel.ack(msg);  // ack only after success → safe redelivery
});

// Consumer (Inventory Service)
rabbitMQ.subscribe('order.created', async (msg) => {
  const order = JSON.parse(msg.content);
  await decrementStock(order.items);
  channel.ack(msg);
});`
      },
      {
        id: 'micro-3',
        title: 'Resilience Patterns',
        content: `Build resilient services that handle failures gracefully.

• Circuit Breaker: stop calling failing service
• Retry with backoff: exponential delay between retries
• Timeout: don't wait forever
• Bulkhead: isolate failures to prevent cascade
• Fallback: provide degraded functionality
• Health checks: detect failing services

States of Circuit Breaker:
• Closed: normal operation
• Open: fail fast, don't call
• Half-Open: test if recovered`,
        codeExample: `// Circuit Breaker pattern
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.threshold || 5;  // failures to trip
    this.resetTimeout = options.timeout || 30000;    // cool-down (ms)
    this.failures = 0;
    this.state = 'CLOSED';  // CLOSED = normal traffic
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      // Fail fast while cooling down — no load on the sick service
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit is OPEN');
      }
      this.state = 'HALF-OPEN';  // cool-down over: allow one probe
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    // Any success (incl. half-open probe) heals the circuit
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    // Too many consecutive failures → trip open, schedule retry
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker({ threshold: 5, timeout: 30000 });
const result = await breaker.call(() => userService.getUser(id));`
      },
      {
        id: 'micro-4',
        title: 'Data Management',
        content: `Each service owns its data - no shared databases.

Patterns:
• Database per Service: full isolation
• Saga Pattern: distributed transactions
• Event Sourcing: store events, derive state
• CQRS: separate read/write models

Saga Types:
• Choreography: services react to events
• Orchestration: central coordinator

Challenges:
• Data consistency (eventual)
• Distributed queries
• Data duplication`,
        codeExample: `// Saga Pattern - Choreography
// Each service reacts to events and publishes next step

// Order Service
async function createOrder(orderData) {
  const order = await db.orders.create({ ...orderData, status: 'PENDING' });
  await publish('order.created', { orderId: order.id, amount: order.total });
  return order;
}

// Payment Service listens
subscribe('order.created', async (event) => {
  try {
    await processPayment(event.orderId, event.amount);
    await publish('payment.completed', { orderId: event.orderId });
  } catch (err) {
    await publish('payment.failed', { orderId: event.orderId, reason: err.message });
  }
});

// Order Service listens for payment result
subscribe('payment.completed', async (event) => {
  await db.orders.update(event.orderId, { status: 'CONFIRMED' });
  await publish('order.confirmed', { orderId: event.orderId });
});

subscribe('payment.failed', async (event) => {
  await db.orders.update(event.orderId, { status: 'CANCELLED' });
  // Compensating action - release inventory, refund, etc.
});`
      },
      {
        id: 'micro-5',
        title: 'Service Discovery & API Gateway',
        content: `Services need to find each other and clients need a single entry point.

Service Discovery:
• Client-side: client queries registry (Consul, etcd)
• Server-side: load balancer queries registry
• DNS-based: Kubernetes services

API Gateway responsibilities:
• Request routing
• Authentication/Authorization
• Rate limiting
• Load balancing
• Request/Response transformation
• Caching
• Monitoring`,
        codeExample: `// API Gateway with Express Gateway or custom
const express = require('express');
const httpProxy = require('http-proxy-middleware');

const app = express();

// Authentication middleware
app.use(authenticate);

// Rate limiting
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// Route to services
app.use('/api/users', httpProxy({
  target: 'http://user-service:3001',
  pathRewrite: { '^/api/users': '/users' }  // strip gateway prefix
}));

app.use('/api/orders', httpProxy({
  target: 'http://order-service:3002',
  pathRewrite: { '^/api/orders': '/orders' }
}));

app.use('/api/products', httpProxy({
  target: 'http://product-service:3003',
  pathRewrite: { '^/api/products': '/products' }
}));

// Kubernetes Service Discovery (DNS-based)
// Services are accessible by name: http://user-service/users
// Kubernetes handles load balancing across pods

// Consul service registration
const consul = require('consul')();
await consul.agent.service.register({
  name: 'user-service',
  address: HOST,
  port: PORT,
  check: { http: \`http://\${HOST}:\${PORT}/health\`, interval: '10s' }
});`
      },
      {
        id: 'micro-6',
        title: 'Distributed Tracing & Correlation IDs',
        content: `When a single user request crosses 10+ services, the only way to debug latency or errors is end-to-end tracing.

Concepts:
• Trace: the full request path through your system (one trace per user action)
• Span: one unit of work within a trace — typically one service call. Has start/end times, attributes, and events.
• Trace context propagation: every outbound call carries the trace ID + span ID + sampling decision

W3C Trace Context (the modern standard):
• Headers: traceparent (required), tracestate (optional, vendor-specific)
• Format: traceparent: 00-{trace-id}-{parent-id}-{flags}
• Auto-propagated by HTTP libs that integrate with OpenTelemetry

OpenTelemetry (OTel):
• Vendor-neutral SDK + protocol (OTLP) for traces, metrics, logs
• Auto-instrumentation for Express, Fastify, gRPC, HTTP, DB libraries
• Export to: Jaeger, Tempo, Honeycomb, Datadog, New Relic, etc.

Correlation IDs in logs:
• Inject trace_id into structured logs
• When you see an error, copy trace_id, paste into your tracing tool, see the full path
• Without this, "this request is slow" debugging takes hours

Sampling:
• 100% tracing has cost — most traces aren\'t interesting
• Head-based: random sample at the start (e.g., 1%)
• Tail-based: collect everything in a buffer, decide what to keep based on outcome (errors, slow traces always sampled)
• Tail-based gives the most signal per cost; needs a collector that buffers traces

Practical tips:
• Set baggage values for cross-service context (user_id, tenant_id)
• Add semantic attributes (http.method, db.statement, http.status_code)
• Cap span attribute size — long SQL strings will blow up storage
• Always trace BG jobs and queue consumers — those are where weird latency hides`,
        codeExample: `// OpenTelemetry setup (Node)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  // Ship spans to an OTLP collector over HTTP
  traceExporter: new OTLPTraceExporter({ url: 'http://collector:4318/v1/traces' }),
  // Auto-patches http, express, pg, redis... no code changes
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

// Manual span around interesting work
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('order-service');

async function processOrder(order) {
  // Child spans created inside automatically nest under this one
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', order.id);  // searchable in tracing UI
    try {
      await chargePayment(order);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (e) {
      span.recordException(e);  // attaches stack trace to the span
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      throw e;
    } finally {
      span.end();  // never forget — unended spans leak
    }
  });
}

// Inject trace_id into logs
logger.info({ trace_id: span.spanContext().traceId, order_id: order.id }, 'order processed');`
      },
      {
        id: 'micro-7',
        title: 'Health Checks: Liveness, Readiness, Startup',
        content: `Three different probes, three different questions. Mixing them up causes outages.

Liveness probe ("is the process alive?"):
• If it fails, Kubernetes RESTARTS the container
• Should check ONLY the process itself — not dependencies
• Common bug: checking DB connectivity in liveness → DB hiccup → entire app gets restarted → cascading outage

Readiness probe ("is this instance ready to serve traffic?"):
• If it fails, Kubernetes REMOVES the pod from the Service load balancer (no restart)
• SHOULD check critical dependencies (DB pool, cache, downstream services warmed up)
• Critical for graceful shutdown: flip ready=false, drain in-flight, exit cleanly

Startup probe ("is initial startup done?"):
• If it fails, Kubernetes treats the pod as still starting (delays liveness checks)
• For slow-starting workloads (JVMs, ML models loading)
• Once it succeeds, liveness takes over

Probe types:
• HTTP: GET /healthz returning 200 → healthy
• TCP: connection succeeds → healthy
• gRPC: native gRPC health-check protocol
• Exec: command exits 0 → healthy

What to put in /healthz vs /readyz:
• /healthz (liveness): minimal — "process not deadlocked"
• /readyz (readiness): "all critical deps available; warmup complete"
• Some teams add /alive separately for human ops

Common patterns:
• Cache readiness for 1–5s in memory to avoid cascading failure when downstream stutters
• Don\'t fail readiness on transient downstream errors — use a degradation mode that\'s "ready but partially functional"
• Log when probe state changes; alert on unexpected unreadiness

Graceful shutdown:
1. SIGTERM received
2. Flip readyz to false
3. Wait for k8s endpoint controller to update (~5–10s)
4. Drain in-flight requests
5. Exit cleanly

Without proper readiness, deploys cause user-visible 502s as new pods start before they\'re ready or old pods exit before draining.`,
        codeExample: `// Express health endpoints
app.get('/healthz', (req, res) => res.send('ok')); // liveness — always trivial

let isReady = false;
// Readiness DOES check deps — 503 pulls pod from the LB
app.get('/readyz', async (req, res) => {
  if (!isReady) return res.status(503).send('starting');
  try {
    await db.raw('SELECT 1');   // DB pool alive?
    await redis.ping();         // cache reachable?
    res.send('ready');
  } catch (e) {
    res.status(503).send('dependency unhealthy');
  }
});

// Mark ready after warmup
async function startup() {
  await prewarmCache();
  await runMigrations();
  isReady = true;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  isReady = false;  // stop taking new traffic first
  // Wait for endpoint propagation
  await new Promise(r => setTimeout(r, 10_000));
  server.close(() => process.exit(0));
});`
      },
      {
        id: 'micro-8',
        title: 'Idempotency & Deduplication',
        content: `Networks fail, retries happen, message buses deliver duplicates. If your services aren\'t idempotent, retries cause double-charges and corruption.

Two perspectives:

Idempotent endpoint (HTTP):
• POST /charges with Idempotency-Key: <client-uuid> header
• Server records: { idempotency_key, request_hash, response, expires_at }
• Same key + same body → return cached response
• Same key + DIFFERENT body → reject (suspicious)
• Different key → process as new
• Store keys for 24h–7d depending on retry windows

Idempotent message consumer (queues):
• Each message has a unique ID; consumer records "processed: <id>" before acking
• Same ID arriving again → skip
• Storage: Redis SET with TTL, or DB unique constraint on processed_id
• Crucial for at-least-once delivery (Kafka, SQS, RabbitMQ default)

Implementation patterns:

Database unique constraint:
• Make the side effect have a natural unique key (charge_id, order_id, message_id)
• Insert with ON CONFLICT DO NOTHING (Postgres) or unique constraint
• Duplicate insert → constraint violation → ignore safely
• Pure SQL solution; no extra infrastructure

Idempotency table:
• Separate table for idempotency keys → response cache
• Best when no natural unique key exists
• Stripe-style API: client provides Idempotency-Key, server stores result for 24h

Compensating idempotency:
• If your operation is naturally idempotent (UPSERT, set-not-increment), you\'re done
• If not (INSERT new row, increment counter), wrap with one of the patterns above

Time bounds:
• Don\'t keep idempotency records forever — storage explodes
• Match retention to retry budget: 24h for synchronous APIs, 7d for queue consumers

Don\'t confuse:
• Idempotency: same operation safely repeatable
• Concurrency control (optimistic locking with version): different problem (concurrent updates)
• Both often needed together`,
        codeExample: `// Idempotency middleware (Express)
async function idempotent(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const requestHash = sha256(JSON.stringify(req.body));
  const existing = await db.idempotency.findById(key);

  if (existing) {
    // Same key, different payload = client bug or abuse
    if (existing.request_hash !== requestHash) {
      return res.status(422).json({ error: 'idempotency-key reused with different body' });
    }
    // Replay: return the stored response, do no work
    return res.status(existing.status_code).json(existing.response);
  }

  // Capture the response by wrapping res.json
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    db.idempotency.create({
      id: key,
      request_hash: requestHash,
      status_code: res.statusCode,
      response: body,
      expires_at: new Date(Date.now() + 24 * 60 * 60_000),
    });
    return originalJson(body);
  };
  next();
}

// Queue consumer with DB unique constraint
async function handleMessage(msg) {
  try {
    // Insert acts as the dedup gate: second insert fails
    await db.processed_messages.insert({ id: msg.id, processed_at: new Date() });
  } catch (e) {
    if (e.code === 'UNIQUE_CONSTRAINT') return; // duplicate, skip
    throw e;
  }
  await processBusiness(msg);
}`
      },
      {
        id: 'micro-9',
        title: 'Microservice Testing Pyramid',
        content: `Testing N services × M consumers naively = N×M integration tests. Doesn\'t scale. The pyramid puts most tests at the lowest layers.

Layers (bottom to top):

Unit tests (most):
• In-process tests of pure functions and small modules
• Fast (milliseconds), reliable, run on every save
• Mock or fake external dependencies sparingly — favor pure functions

Integration tests:
• Test a service against its real DB, real Redis, real message broker — running locally via docker-compose or testcontainers
• Catches issues unit tests miss (SQL syntax, schema, real serialization)
• Slower (seconds) but worth it

Contract tests (Pact, OpenAPI):
• Each consumer describes what it expects from a provider
• Provider runs those contracts against itself in CI
• Replaces N×M integration testing with N consumer tests + M provider verifications
• Fastest way to catch breaking API changes pre-merge

End-to-end tests (fewest):
• Spin up the full system, hit the public API or UI, assert business outcomes
• Slow, flaky, expensive to maintain
• Reserve for critical user journeys (signup, purchase, login)

Dev/staging environments:
• Integration tests run hermetically in CI (containers)
• A staging environment for human verification, smoke tests, and load tests
• Production-like data shapes (sanitized) — synthetic data hides real issues

Property-based testing:
• Generate inputs and assert invariants (Hypothesis, fast-check)
• Catches edge cases hand-written tests miss
• Especially valuable for serializers, parsers, state machines

Chaos testing:
• Inject failures (kill instances, network latency, packet drops)
• Verify your retries, timeouts, fallbacks actually work
• Tools: Chaos Monkey, Litmus, Gremlin`,
        codeExample: `// Pact consumer test (Node, frontend → orders service)
import { Pact } from '@pact-foundation/pact';

const provider = new Pact({ consumer: 'web', provider: 'orders' });

beforeAll(() => provider.setup());
afterAll(() => provider.finalize());

test('creates an order', async () => {
  // Declare what this consumer expects from the provider
  await provider.addInteraction({
    state: 'user 42 is authenticated',  // provider seeds this state
    uponReceiving: 'a create-order request',
    withRequest: {
      method: 'POST',
      path: '/orders',
      body: { items: [{ sku: 'A', qty: 1 }] },
      headers: { 'Authorization': 'Bearer ...' },
    },
    willRespondWith: {
      status: 201,
      body: { id: Matchers.string(), status: 'pending' },  // shape, not value
    },
  });
  const result = await api.createOrder({ items: [{ sku: 'A', qty: 1 }] });
  expect(result.status).toBe('pending');
  await provider.verify();
});
// Pact emits a contract JSON; provider verifies it in CI`
      },
      {
        id: 'micro-10',
        title: 'Local Development for Microservices',
        content: `Spinning up 30 services on a laptop is impractical. Modern tools make local dev work at microservice scale.

The naive approach (don\'t do this):
• docker-compose with every service
• Boots in 5 minutes; uses 16GB RAM; falls over
• Most engineers can\'t run a full local environment

Better patterns:

Telepresence / mirrord:
• Your local service joins a real Kubernetes cluster
• Other services in the cluster see "local" service as if it were running there
• Outbound calls from your local service hit the real cluster\'s services
• You only run YOUR service locally; everything else is real

Tilt / Skaffold:
• Watch local source files; rebuild containers and deploy to local k8s on save
• Live-reload feel for k8s development
• Tilt has a nice UI; Skaffold integrates well with kubectl/helm

Docker Compose for tightly coupled subsets:
• Run YOUR service + the 2–3 services it talks to
• Mock or stub the rest

Shared dev clusters:
• Persistent k8s cluster every engineer can deploy ephemeral previews to
• Each PR gets a preview environment
• Vercel / Render / Coolify do this for web; Argo CD + Octant for k8s

Local mocks for external dependencies:
• LocalStack: AWS APIs locally
• Wiremock: HTTP service mocks
• Testcontainers: real Postgres, Redis, Kafka in containers per test

Service templates / golden paths:
• A "hello world" template for new services with logging, tracing, deploy pipeline, dashboards baked in
• Backstage software catalog manages templates and service ownership
• Eliminates "I have to figure out the deploy pipeline from scratch" tax`,
      },
      {
        id: 'micro-11',
        title: 'Schema Evolution & Backwards Compatibility',
        content: `Service contracts evolve constantly. Bad evolution = midnight outages. Good evolution = invisible upgrades.

The cardinal rule: NEVER make a breaking change to an API or message schema that has live consumers. Always deploy additive changes; remove old fields only after consumers have migrated.

Safe (backwards-compatible) changes:
• Add new optional fields
• Add new endpoints / methods
• Add new enum values (consumers should ignore unknown enums)
• Add new event types

Breaking changes (don\'t do these):
• Rename a field
• Remove a field
• Change a field\'s type or semantic meaning
• Make optional → required
• Remove an enum value
• Tighten validation rules

Migration playbook (rename a field example):
1. Add the new field; keep the old one
2. Code writes BOTH fields
3. Migrate consumers to read the new field
4. Once all consumers updated (track with metrics + logs), code reads only new field
5. Stop writing the old field
6. Remove the old field from the schema
7. Deprecation cycle: ~3 months for internal, 6–12 months for public

Versioning strategies:
• URL versioning (/v1/, /v2/) — simple but doubles maintenance
• Header versioning (Accept: application/vnd.algogo.v2+json) — cleaner, harder to debug
• No versioning + only-additive changes — works for internal services with contract testing

Avro/Protobuf evolution rules:
• Avro: backward-compat fields need defaults; new readers can read old data
• Protobuf: never change field numbers; never reuse field numbers; new fields default to "missing"
• Pair with a schema registry (Confluent, Apicurio) that enforces these rules at registration time

Detection in CI:
• openapi-diff fails the build on breaking REST changes
• buf breaking detects breaking Protobuf changes
• Pact tests fail when consumers\' expectations are no longer satisfied`,
      }
    ],
    flashcards: [
      { id: 'micro-fc-1', front: 'What is a key benefit of microservices?', back: 'Independent deployment and scaling. Teams can deploy their service without coordinating with others. Each service can scale based on its own load.' },
      { id: 'micro-fc-2', front: 'What is the Circuit Breaker pattern?', back: 'Stops calling a failing service after threshold failures. Prevents cascade failures. After timeout, allows test requests (half-open state).' },
      { id: 'micro-fc-3', front: 'Why use an API Gateway?', back: 'Single entry point for clients. Handles auth, rate limiting, routing, aggregation. Clients don\'t need to know about individual services.' },
      { id: 'micro-fc-4', front: 'What is event sourcing?', back: 'Store all changes as events instead of current state. Rebuild state by replaying events. Provides audit log and enables time travel.' },
      { id: 'micro-fc-5', front: 'Sync vs async communication trade-offs?', back: 'Sync (REST): simpler, immediate response, tight coupling. Async (queues): decoupled, resilient, eventual consistency, more complex.' },
      { id: 'micro-fc-6', front: 'What is the Saga pattern?', back: 'Manages distributed transactions across services. Each step has a compensating action for rollback. Can be choreographed (events) or orchestrated (coordinator).' },
      { id: 'micro-fc-7', front: 'Why "database per service"?', back: 'Loose coupling - services can evolve independently. Each service chooses best database for its needs. No shared schema changes.' },
      { id: 'micro-fc-8', front: 'What is service mesh?', back: 'Infrastructure layer handling service-to-service communication. Provides observability, security, traffic management. Examples: Istio, Linkerd.' },
      { id: 'micro-fc-9', front: 'What is the Bulkhead pattern?', back: 'Isolate failures to prevent cascade. Like ship compartments - one flooding doesn\'t sink the ship. Separate thread pools, connections per service.' },
      { id: 'micro-fc-10', front: 'When NOT to use microservices?', back: 'Small teams, simple domains, unclear boundaries, need strong consistency, early-stage startups. Start monolith, extract services when needed.' },
      { id: 'micro-fc-11', front: 'Trace ID vs span ID', back: 'Trace ID: unique per user request, propagated to every service involved.\n\nSpan ID: unique per unit of work — each service call has its own span. Each span has a parent_span_id that builds the call tree.\n\nTogether they let you visualize the full path of a request and pinpoint which span took 500ms.' },
      { id: 'micro-fc-12', front: 'W3C Trace Context', back: 'Standard for cross-service trace propagation. Header: traceparent: 00-{trace-id}-{parent-id}-{flags}.\n\nReplaces vendor-specific headers (X-B3-*, X-Datadog-*). All major SDKs (OpenTelemetry, OpenTracing) emit and consume traceparent automatically.\n\nUnifies tracing across services using different observability vendors.' },
      { id: 'micro-fc-13', front: 'OpenTelemetry (OTel)', back: 'Vendor-neutral SDK + protocol (OTLP) for traces, metrics, logs.\n\nReplaces OpenTracing and OpenCensus (their merger). Auto-instrumentation libraries cover most frameworks.\n\nExport to: Jaeger, Tempo, Honeycomb, Datadog, New Relic, Splunk. Switch vendors by changing the exporter, not the app code.' },
      { id: 'micro-fc-14', front: 'Liveness vs readiness probe', back: 'Liveness: "is the process alive?" Failure → Kubernetes RESTARTS the container. Should check ONLY the process.\n\nReadiness: "is this instance ready to serve traffic?" Failure → Kubernetes REMOVES the pod from the load balancer (no restart). Should check critical dependencies.\n\nMixing them up causes cascading restarts during transient downstream failures.' },
      { id: 'micro-fc-15', front: 'Startup probe', back: 'For slow-starting workloads (JVM warming, ML model loading). While failing, Kubernetes treats the pod as still starting and DELAYS liveness checks.\n\nWithout startup probes, slow-start pods get killed by liveness before they\'re ready. With them, you can give the app 5 minutes to warm up while liveness gets a generous grace period.' },
      { id: 'micro-fc-16', front: 'Idempotency-Key header pattern', back: 'Stripe-style: client sends Idempotency-Key: <uuid> on POST. Server records: { key, request_hash, response, expires_at }.\n\nSame key + same body → return cached response (deduped retry).\nSame key + different body → reject (suspicious replay).\nDifferent key → process as new.\n\nStorage TTL: 24h for synchronous APIs.' },
      { id: 'micro-fc-17', front: 'Database unique constraint for idempotency', back: 'Make the side effect have a natural unique key (charge_id, message_id). INSERT with ON CONFLICT DO NOTHING (Postgres).\n\nDuplicate insert → constraint violation → ignore safely. No extra infra; the database is your idempotency record.\n\nSimplest pattern when a natural unique ID exists. Combine with idempotency table only when no natural key exists.' },
      { id: 'micro-fc-18', front: 'Pact / consumer-driven contracts', back: 'Each consumer writes tests describing what it expects from the provider. Tests generate a contract JSON.\n\nProvider runs those contracts against itself in CI. Breaking changes fail the build before deploy.\n\nReplaces N×M integration testing matrix with N consumer tests + M provider verifications.' },
      { id: 'micro-fc-19', front: 'Microservices testing pyramid', back: 'Bottom (most): unit tests — pure-function tests, fast, run on every save.\nMiddle: integration tests — service against real DB/Redis/queue (testcontainers).\nMiddle: contract tests — Pact, OpenAPI diff.\nTop (fewest): end-to-end tests — full system, critical user journeys only.\n\nNaive integration testing across N services × M consumers doesn\'t scale. Pyramid does.' },
      { id: 'micro-fc-20', front: 'Telepresence / mirrord', back: 'Tools that let your local service join a real Kubernetes cluster.\n\nOther services in the cluster see your local service as if it were a pod. Your local outbound calls hit real cluster services.\n\nResult: dev loop without running 30 services on your laptop. Run only YOUR service locally; everything else is the live cluster.' },
      { id: 'micro-fc-21', front: 'Tilt / Skaffold', back: 'Live-reload tools for Kubernetes development. Watch local source files; rebuild containers and deploy to local k8s on save.\n\nTilt has a polished UI showing build/deploy status per service. Skaffold integrates tightly with kubectl/helm.\n\nMakes "save → see in cluster" feel like local Node dev. Eliminates context-switching pain in microservice work.' },
      { id: 'micro-fc-22', front: 'Testcontainers', back: 'Library that spins up real services (Postgres, Redis, Kafka, Elasticsearch) in containers for the duration of a test, then tears them down.\n\nReal infrastructure → real bug coverage. Avoid mocks except for slow/flaky external services.\n\nAvailable in Java, Go, Node, Python. The de facto standard for integration tests in 2026.' },
      { id: 'micro-fc-23', front: 'Service templates / golden paths', back: '"Hello world" starter for new services with logging, metrics, tracing, deploy pipeline, dashboards, on-call config baked in.\n\nNew service goes idea → running in hours, not weeks.\n\nBackstage (Spotify) is the dominant tool for managing software catalogs and templates. Eliminates "platform tax" of reinventing infra per service.' },
      { id: 'micro-fc-24', front: 'Backwards compatible API change rules', back: 'Safe additive changes:\n• Add optional fields\n• Add new endpoints / methods\n• Add new enum values\n\nUnsafe:\n• Rename, remove, retype fields\n• Tighten validation\n• Remove enum values\n• Make optional fields required\n\nFollow the expand-contract pattern even for APIs.' },
      { id: 'micro-fc-25', front: 'Renaming an API field with no downtime', back: '1. Add new field; keep old one\n2. Code writes BOTH (dual-write)\n3. Migrate consumers to read new field\n4. Track adoption with metrics — when 100% migrated, code reads only new\n5. Stop writing old field\n6. Remove old field from schema\n\nEach step is independently shippable; rollbacks safe at any point.' },
      { id: 'micro-fc-26', front: 'Protobuf field number rules', back: 'NEVER reuse field numbers and NEVER change a field\'s type. Once a field number is in production, it\'s permanent.\n\nNumbers 1–15 take 1 byte on the wire; 16+ take 2. Reserve numbers 1–15 for hot fields.\n\nReserved numbers (after deletion) prevent accidental reuse: reserved 4, 5; reserved "old_name";' },
      { id: 'micro-fc-27', front: 'Avro schema compatibility modes', back: 'Backward (most common): new schema can read OLD data. Add fields with defaults; never remove required fields.\n\nForward: old schema can read NEW data. Never add required fields.\n\nFull: both at once. Most restrictive but consumers and producers can deploy in any order.\n\nSchema registry enforces the chosen mode on every new schema version.' },
      { id: 'micro-fc-28', front: 'openapi-diff / buf breaking', back: 'Tools that compare API schemas between Git versions and fail CI on breaking changes.\n\nopenapi-diff: catches REST API breaking changes (removed endpoints, changed response shapes, removed fields).\n\nbuf breaking: catches Protobuf breaking changes (removed fields, type changes, reused numbers).\n\nMandatory in CI for any service with external consumers.' },
      { id: 'micro-fc-29', front: 'Tail-based sampling', back: 'Trace sampling decision made AFTER the trace completes, not at the start.\n\nCollector buffers all spans of a trace; once complete, decides keep/drop based on outcome (errors and slow traces always kept; happy paths sampled at 1%).\n\nMore signal per cost than head-based (1% random) sampling. Needs a collector that can buffer; OpenTelemetry Collector supports this.' },
      { id: 'micro-fc-30', front: 'Graceful shutdown sequence', back: '1. SIGTERM received\n2. Flip readiness probe to false (stops new traffic)\n3. Wait ~10s for k8s endpoint controller to propagate\n4. Drain in-flight requests (server.close() in Node)\n5. Close DB pools, message broker connections\n6. Exit cleanly\n\nWithout this, deploys cause user-visible 502s and connection resets.' }
    ],
    quizQuestions: [
      {
        id: 'micro-q-1',
        question: 'What is a major challenge of microservices?',
        options: ['Faster development', 'Distributed system complexity', 'Easier testing', 'Less code'],
        correctAnswer: 1,
        explanation: 'Microservices add distributed system challenges: network failures, data consistency, debugging across services, deployment coordination.'
      },
      {
        id: 'micro-q-2',
        question: 'Which pattern prevents cascade failures?',
        options: ['Load balancer', 'Circuit breaker', 'API Gateway', 'Service mesh'],
        correctAnswer: 1,
        explanation: 'Circuit breaker stops calling a failing service, preventing failures from cascading to dependent services.'
      },
      {
        id: 'micro-q-3',
        question: 'When should services communicate asynchronously?',
        options: ['Always', 'Never', 'When immediate response isn\'t needed', 'Only for reads'],
        correctAnswer: 2,
        explanation: 'Async communication (queues) works when you don\'t need immediate response. It provides better decoupling and resilience.'
      },
      {
        id: 'micro-q-4',
        question: 'What is the main purpose of service discovery?',
        options: ['Load balancing', 'Finding service locations dynamically', 'Authentication', 'Caching'],
        correctAnswer: 1,
        explanation: 'Service discovery allows services to find each other without hardcoded addresses. Essential when services scale up/down dynamically.'
      },
      {
        id: 'micro-q-5',
        question: 'Which Saga type uses a central coordinator?',
        options: ['Choreography', 'Orchestration', 'Both', 'Neither'],
        correctAnswer: 1,
        explanation: 'Orchestration uses a central saga orchestrator to coordinate steps. Choreography relies on services reacting to events independently.'
      },
      {
        id: 'micro-q-6',
        question: 'What protocol is most efficient for service-to-service communication?',
        options: ['REST/JSON', 'gRPC', 'SOAP', 'GraphQL'],
        correctAnswer: 1,
        explanation: 'gRPC uses Protocol Buffers (binary), HTTP/2 (multiplexing), and is typed. More efficient than JSON-based REST for internal services.'
      },
      {
        id: 'micro-q-7',
        question: 'A user request fans out across 8 services. To debug latency, which observability primitive is essential?',
        options: ['Logs only', 'Distributed traces with W3C trace context propagated across all services', 'Metrics dashboards', 'CPU usage graphs'],
        correctAnswer: 1,
        explanation: 'Distributed tracing (OpenTelemetry, Jaeger, Tempo) shows the full request path with per-span timings. Logs alone can\'t tell you that span 4 of 8 took 700ms.'
      },
      {
        id: 'micro-q-8',
        question: 'Your liveness probe checks DB connectivity. The DB blips for 30s. What happens?',
        options: ['Nothing — Kubernetes handles it', 'Liveness fails → Kubernetes restarts the container; thundering herd of restarts during the DB blip', 'Latency increases briefly', 'Probe is cached'],
        correctAnswer: 1,
        explanation: 'Liveness checks the PROCESS, not dependencies. Putting DB checks in liveness causes cascading restarts during transient downstream issues. Use readiness for dependencies.'
      },
      {
        id: 'micro-q-9',
        question: 'A client retries POST /charges due to a timeout. How do you prevent double-charging without losing legitimate retries?',
        options: ['Block all retries', 'Idempotency-Key header — server caches response per key for ~24h', 'Trust the client', 'Lock by user ID'],
        correctAnswer: 1,
        explanation: 'Stripe-style: client sends a unique Idempotency-Key. Server stores result on first call; same key returns the cached result. Different key processes as new. Standard for payment APIs.'
      },
      {
        id: 'micro-q-10',
        question: 'Which testing layer scales best for catching API breaking changes BEFORE merge across N consumers?',
        options: ['End-to-end tests', 'Manual QA', 'Consumer-driven contract tests (Pact) — N consumer-defined contracts verified by the provider', 'Unit tests'],
        correctAnswer: 2,
        explanation: 'Naive integration testing across N×M is unmaintainable. Pact files are written by consumers and verified by providers in CI — catches breaking changes before deploy with N+M test runs total.'
      },
      {
        id: 'micro-q-11',
        question: 'You\'re running 30 microservices. A new engineer wants to develop locally. What\'s the modern approach?',
        options: ['Run all 30 in docker-compose locally', 'Use Telepresence to join a real k8s cluster — only run YOUR service locally', 'Provision a personal AWS account', 'Use mocks for everything'],
        correctAnswer: 1,
        explanation: 'Running 30 services on a laptop is impractical. Telepresence/mirrord let your local service join the cluster as if it were a pod; outbound calls hit real services.'
      },
      {
        id: 'micro-q-12',
        question: 'You want to RENAME a field in your API response that has 5 active consumer teams. What\'s the safe sequence?',
        options: ['Big-bang deploy at midnight', 'Add new field, dual-write, migrate consumers, then remove old field', 'Email everyone and rename it', 'Version the entire API'],
        correctAnswer: 1,
        explanation: 'Expand-contract for APIs: add new, write both, consumers migrate at their own pace, then remove old. Each step is independently shippable; rollbacks safe at any point.'
      },
      {
        id: 'micro-q-13',
        question: 'Sampling 1% of traces randomly catches few errors. What\'s a smarter sampling strategy?',
        options: ['Sample 100%', 'Tail-based sampling — buffer all spans of a trace, decide keep/drop based on outcome (errors, slow always kept)', 'Sample only the first request of the day', 'Don\'t sample'],
        correctAnswer: 1,
        explanation: 'Tail-based sampling guarantees every error is kept while still discarding boring happy paths. Higher signal-to-cost ratio than random head-based sampling.'
      },
      {
        id: 'micro-q-14',
        question: 'Why is reusing a Protobuf field number in a new schema a serious bug?',
        options: ['It\'s a syntax error', 'Old serialized data still uses that number with the old type — readers will deserialize garbage as the new type', 'It\'s slower', 'It uses more bytes'],
        correctAnswer: 1,
        explanation: 'Protobuf wire format is field-number → type-tagged-bytes. Reusing a number means old data on disk or in transit gets mis-interpreted. Always "reserved" deleted numbers; never repurpose.'
      },
      {
        id: 'micro-q-15',
        question: 'Deploy completes; users see brief 502 errors. What\'s the most likely missing piece?',
        options: ['HTTPS', 'Graceful shutdown — readiness flip + drain timeout before SIGTERM kills in-flight requests', 'Bigger pods', 'A WAF'],
        correctAnswer: 1,
        explanation: 'Without graceful shutdown, deploys kill connections mid-request. Pattern: flip readiness false → wait ~10s for endpoint propagation → close server → drain → exit. Done right, deploys are user-invisible.'
      },
      {
        id: 'micro-q-16',
        question: 'Why do microservice architectures prefer sagas over two-phase commit (2PC) for a transaction spanning Orders, Payments and Inventory?',
        options: ['2PC is not supported by any modern database', 'A saga is faster because it skips validation', '2PC holds locks in every participant until the coordinator decides and stalls entirely if the coordinator dies; a saga commits each step locally and undoes earlier steps with compensating actions', 'Sagas provide full ACID isolation across services'],
        correctAnswer: 2,
        explanation: '2PC couples the availability of every participant and the coordinator and holds resources across network round trips. A saga uses local transactions plus compensations (refund, restock) on failure. The cost is that intermediate states are visible — sagas give no isolation.'
      },
      {
        id: 'micro-q-17',
        question: 'A circuit breaker has been OPEN for 30 seconds. How does it discover that the downstream service has recovered without unleashing full traffic on it?',
        options: ['It polls the downstream health endpoint every second', 'It waits for an operator to reset it', 'It never recovers — the caller must be redeployed', 'It moves to HALF-OPEN and lets a small number of trial requests through; success closes the breaker, failure re-opens it'],
        correctAnswer: 3,
        explanation: 'Half-open is the probing state: one or a few requests are allowed. If they succeed the breaker closes and normal traffic resumes; if they fail the open timer restarts. This avoids the thundering herd a naive open-to-closed reset would cause.'
      },
      {
        id: 'micro-q-18',
        question: 'The mobile app wants tiny aggregated payloads while the web app needs rich, nested responses from the same 10 backend services. Which pattern fits?',
        options: ['Backend-for-Frontend: a dedicated aggregation layer per client type, owned by that client\'s team', 'A single generic API gateway that returns everything to everyone', 'Have each client call all 10 services directly', 'Merge the 10 services into one'],
        correctAnswer: 0,
        explanation: 'A BFF sits between one client type and the microservices, shaping and aggregating responses for that client. A shared gateway remains useful for cross-cutting concerns (auth, rate limits, TLS), but per-client shaping logic belongs in a BFF so teams do not fight over one gateway.'
      },
      {
        id: 'micro-q-19',
        question: 'Service A calls B, B calls C, C calls D. Each layer retries 3 times on failure. D has a brief outage. How many requests can one user request generate at D, and what is the remedy?',
        options: ['3 — retries do not multiply', '9 — only the two innermost layers matter', 'Up to 27 (3 × 3 × 3): retry amplification. Retry at one layer only, cap retries with a budget (e.g. ≤ 10% of traffic), and back off with jitter', '1 — circuit breakers stop all retries'],
        correctAnswer: 2,
        explanation: 'Nested retries multiply: each of A\'s 3 attempts triggers 3 at B, each of which triggers 3 at C. A struggling D gets 27x load exactly when it is weakest. Retry only where you own the idempotency story, enforce retry budgets, and let breakers cut the fan-out.'
      },
      {
        id: 'micro-q-20',
        question: 'You are decomposing a monolith into services with no downtime. Which pattern routes traffic feature-by-feature to new services while the monolith keeps serving the rest?',
        options: ['Big-bang rewrite behind a feature flag', 'Strangler fig: put a routing facade in front of the monolith and migrate one endpoint or capability at a time until the monolith is empty', 'Database-first: split the database, then the code', 'Fork the monolith per team'],
        correctAnswer: 1,
        explanation: 'The strangler fig pattern incrementally replaces the monolith behind a proxy; each migrated route can be rolled back independently. Big-bang rewrites are the classic failure mode, and splitting the database first tends to produce a distributed monolith.'
      }
    ],
    visualizations: [
      {
        id: 'micro-viz-1',
        title: 'Microservices Architecture',
        type: 'diagram',
        description: 'Services communicating through API Gateway',
        nodes: [
          { id: 'client', label: 'Client', x: 200, y: 30 },
          { id: 'gateway', label: 'API Gateway', x: 200, y: 100 },
          { id: 'user', label: 'User Service', x: 80, y: 180 },
          { id: 'order', label: 'Order Service', x: 200, y: 180 },
          { id: 'product', label: 'Product Service', x: 320, y: 180 }
        ],
        edges: [
          { from: 'client', to: 'gateway' },
          { from: 'gateway', to: 'user' },
          { from: 'gateway', to: 'order' },
          { from: 'gateway', to: 'product' }
        ]
      },
      {
        id: 'micro-viz-2',
        title: 'Circuit Breaker States',
        type: 'diagram',
        description: 'State transitions in circuit breaker',
        nodes: [
          { id: 'closed', label: 'CLOSED', x: 80, y: 100 },
          { id: 'open', label: 'OPEN', x: 320, y: 100 },
          { id: 'half', label: 'HALF-OPEN', x: 200, y: 180 }
        ],
        edges: [
          { from: 'closed', to: 'open', label: 'failures' },
          { from: 'open', to: 'half', label: 'timeout' },
          { from: 'half', to: 'closed', label: 'success' },
          { from: 'half', to: 'open', label: 'failure' }
        ]
      }
    ]
  },

  // 5. Caching Strategies
  {
    id: 'caching',
    name: 'Caching Strategies',
    slug: 'caching',
    description: 'Redis, CDN, cache invalidation patterns',
    icon: 'flash-outline',
    color: '#E91E63',
    colorDark: '#C2185B',
    premium: true,
    learnContent: [
      {
        id: 'cache-1',
        title: 'Caching Layers',
        content: `Cache at multiple levels for maximum performance.

• Browser cache: HTTP headers (Cache-Control, ETag)
• CDN: edge servers for static assets
• Application cache: Redis, Memcached
• Database cache: query cache, buffer pool
• CPU cache: L1, L2, L3 (hardware level)

Key metrics:
• Hit ratio: higher = better performance
• TTL: time data stays in cache
• Eviction policy: what to remove when full (LRU, LFU)`,
        codeExample: `// HTTP caching headers
Cache-Control: public, max-age=31536000  // 1 year, CDN can cache
Cache-Control: private, no-cache          // revalidate each time
Cache-Control: no-store                   // never cache

// ETag for conditional requests
ETag: "abc123"                // Version identifier
If-None-Match: "abc123"       // Client sends to check if changed

// Server response
// 304 Not Modified = use cached version
// 200 OK with new content = cache was stale

// Express.js example
app.get('/api/data', (req, res) => {
  const etag = generateETag(data);

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.set('ETag', etag);
  res.set('Cache-Control', 'private, max-age=60');
  res.json(data);
});`
      },
      {
        id: 'cache-2',
        title: 'Caching Patterns',
        content: `Different patterns for different use cases.

• Cache-Aside (Lazy Loading):
  App checks cache, loads from DB if miss
  Most common, app controls caching

• Write-Through:
  Write to cache and DB together
  Consistent but slower writes

• Write-Behind (Write-Back):
  Write to cache, async sync to DB
  Fast writes, eventual consistency, risk of data loss

• Read-Through:
  Cache automatically loads from DB on miss
  Simpler app code, cache library handles loading`,
        codeExample: `// Cache-Aside pattern (most common)
async function getUser(id) {
  const cacheKey = \`user:\${id}\`;

  // Check cache first
  let user = await redis.get(cacheKey);

  if (user) {
    return JSON.parse(user);  // Cache hit
  }

  // Cache miss - load from DB
  user = await db.users.findById(id);

  if (user) {
    // Populate cache with TTL
    await redis.set(cacheKey, JSON.stringify(user), {
      EX: 3600  // 1 hour TTL
    });
  }

  return user;
}

// Write-Through pattern
async function updateUser(id, data) {
  // Update DB first
  const user = await db.users.update(id, data);

  // Then update cache
  await redis.set(\`user:\${id}\`, JSON.stringify(user), {
    EX: 3600
  });

  return user;
}`
      },
      {
        id: 'cache-3',
        title: 'Cache Invalidation',
        content: `Keeping cache consistent with source of truth.

Strategies:
• TTL (Time-To-Live): expire after duration
• Event-driven: invalidate on write
• Version keys: user:123:v2
• Cache tags: invalidate related items

Common problems:
• Stale data: cache doesn't match DB
• Cache stampede: many requests on miss
• Thundering herd: mass invalidation
• Cold cache: empty after restart`,
        codeExample: `// TTL-based invalidation
await redis.set('user:123', data, { EX: 3600 });

// Event-driven invalidation
async function updateUser(id, data) {
  await db.users.update(id, data);

  // Invalidate all related caches
  await redis.del(\`user:\${id}\`);
  await redis.del('users:list');
  await redis.del(\`user:\${id}:posts\`);
}

// Prevent cache stampede with mutex
async function getWithLock(key, fetchFn, ttl = 3600) {
  let data = await redis.get(key);
  if (data) return JSON.parse(data);

  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, '1', {
    NX: true,  // Only if not exists
    EX: 10     // Lock expires in 10s
  });

  if (acquired) {
    try {
      data = await fetchFn();
      await redis.set(key, JSON.stringify(data), { EX: ttl });
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // Wait and retry
    await sleep(100);
    return getWithLock(key, fetchFn, ttl);
  }

  return data;
}`
      },
      {
        id: 'cache-4',
        title: 'Redis Data Structures',
        content: `Redis offers more than simple key-value storage.

Data structures:
• Strings: simple values, counters
• Hashes: object-like, partial updates
• Lists: queues, recent items
• Sets: unique items, intersections
• Sorted Sets: leaderboards, time-series
• Streams: event log, message queues

Advanced features:
• Pub/Sub: real-time messaging
• Lua scripts: atomic operations
• Transactions: MULTI/EXEC
• Persistence: RDB, AOF`,
        codeExample: `// Strings - counters
await redis.incr('page:views');
await redis.incrby('user:123:points', 10);

// Hashes - partial updates
await redis.hset('user:123', { name: 'John', email: 'j@example.com' });
await redis.hget('user:123', 'name');
await redis.hincrby('user:123', 'loginCount', 1);

// Lists - recent items
await redis.lpush('user:123:notifications', notification);
await redis.ltrim('user:123:notifications', 0, 99);  // Keep last 100
const recent = await redis.lrange('user:123:notifications', 0, 9);

// Sets - unique items
await redis.sadd('post:123:likes', 'user:456');
await redis.sismember('post:123:likes', 'user:456');  // Check if liked
const likeCount = await redis.scard('post:123:likes');

// Sorted Sets - leaderboard
await redis.zadd('leaderboard', { score: 1000, member: 'user:123' });
const topPlayers = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
const rank = await redis.zrevrank('leaderboard', 'user:123');`
      },
      {
        id: 'cache-5',
        title: 'CDN & Edge Caching',
        content: `CDNs cache content at edge servers close to users.

Benefits:
• Lower latency (geographic proximity)
• Reduced origin load
• DDoS protection
• Global availability

What to cache at CDN:
• Static assets (JS, CSS, images)
• API responses (with care)
• HTML pages (for static sites)

Cache control:
• Origin headers respected
• Cache tags for selective purge
• Edge compute for dynamic content`,
        codeExample: `// CDN cache headers
Cache-Control: public, max-age=31536000, immutable
// immutable = don't revalidate, trust max-age

// Versioned assets (cache forever)
// main.abc123.js - hash in filename
Cache-Control: public, max-age=31536000, immutable

// API responses (short cache)
Cache-Control: public, max-age=60, s-maxage=300
// s-maxage = CDN cache time (longer than browser)

// Vary header for personalized content
Vary: Accept-Encoding, Authorization
// Different cached versions based on headers

// Cloudflare cache tags
res.set('Cache-Tag', 'user-123, posts');
// Later: purge all caches tagged 'user-123'

// Stale-while-revalidate
Cache-Control: public, max-age=60, stale-while-revalidate=300
// Serve stale while fetching fresh in background`
      },
      {
        id: 'cache-6',
        title: 'Read/Write Strategy Trade-offs',
        content: `Five common caching patterns. Pick by the question "where is the cache in the read path, and who keeps it fresh?"

Cache-Aside (Lazy Load):
• App reads cache; on miss, loads from DB and writes back to cache
• On write, updates DB and INVALIDATES cache (or updates it)
• Pros: simple, only caches what\'s actually used
• Cons: stale until invalidation; cache stampede on miss; race conditions on concurrent reads + writes
• Default for most apps

Read-Through:
• App reads through the cache (cache library is responsible for filling on miss)
• App\'s code never touches the DB
• Pros: cleaner code; centralizes cache logic
• Cons: harder to mock in tests; library couples DB and cache

Write-Through:
• App writes go to cache, cache writes to DB synchronously
• Pros: cache always fresh; reads never see stale
• Cons: every write pays both cache + DB latency; useless cache slots if read pattern doesn\'t match write pattern

Write-Behind (Write-Back):
• App writes to cache; cache flushes to DB asynchronously
• Pros: extremely fast writes; batching possible
• Cons: data loss risk if cache dies before flush; ordering guarantees tricky
• Use only when stale-on-read is unacceptable AND you can tolerate write loss

Refresh-Ahead:
• Cache infrastructure proactively reloads entries before they expire
• Pros: hot keys never go cold; eliminates breakdown
• Cons: wasted work on rarely-accessed keys
• Hybrid: enable for top-N hot keys only

Decision shortcut:
• Read-heavy + stale OK → cache-aside
• Read-heavy + must-be-fresh → write-through
• Write-heavy + can lose recent writes → write-behind
• Hot key with strict latency budget → refresh-ahead

Race conditions in cache-aside:
• Reader gets miss → starts loading from DB
• Writer updates DB
• Reader writes the OLD value to cache → stuck stale until TTL
• Mitigations: invalidate-on-write (delete cache key), versioned keys, or single-flight (one reader rebuilds, others wait)`,
      },
      {
        id: 'cache-7',
        title: 'Distributed Cache: Cluster, Sentinel, Sharding',
        content: `Single-Redis is a single-point of failure and capped at one machine\'s RAM. Production deploys use one of three patterns.

Redis Sentinel:
• Multiple Redis instances; Sentinel processes monitor and elect a new primary on failure
• Single primary, many replicas — same data on all
• Failover: ~30s typical; clients reconnect to new primary
• Use: small/medium scale where one machine\'s RAM is enough

Redis Cluster:
• Sharded across nodes; 16,384 hash slots distributed
• Each shard is its own primary + replicas
• Client computes slot = CRC16(key) % 16384, sends to correct node (or follows MOVED redirect)
• Cross-slot transactions and Lua scripts NOT supported (one slot per script)
• Use: when single-machine RAM isn\'t enough

Client-side sharding (memcached, simple Redis setups):
• Client hashes key, picks node via consistent hashing
• Each node knows nothing about the cluster
• Simple, but adding/removing nodes is a bigger remap operation

Hash tags in Redis Cluster:
• Force keys to same slot with curly braces: cache:{user-42}:profile and cache:{user-42}:settings hash on "user-42"
• Lets transactions and Lua scripts span multiple keys
• Use sparingly — concentrating keys defeats sharding

Persistence (Redis):
• RDB: periodic snapshot; smaller, faster restart, last few minutes lost
• AOF (Append-Only File): every command logged; slower, more durable
• Hybrid: AOF + RDB for durability + fast restart
• "Cache only" deploys often disable persistence entirely

Picking topology:
• Pure cache, can rebuild from DB: single instance + max memory eviction is fine
• Cache + transient state (sessions, rate limiters): Sentinel for HA
• Massive cache that doesn\'t fit one machine: Cluster
• Don\'t use replication for "scale reads" without thinking — most Redis workloads are bottlenecked by one node\'s CPU, not replicas`,
      },
      {
        id: 'cache-8',
        title: 'Lua Scripting for Atomic Operations',
        content: `Many cache operations are read-modify-write — naive code has race conditions. Redis Lua scripting runs atomically server-side.

Why atomicity matters:
• "If this counter is below 100, increment and let the request through" needs read + check + increment to happen indivisibly
• Two clients running this concurrently in app code race; Lua makes it atomic

Common patterns:

Rate limiter (sliding window counter):
• Increment a counter for the current minute; reject if > limit
• Naive (race-prone): GET → if < limit, INCR; else reject
• Atomic Lua: single script doing the GET and the INCR

Distributed lock release:
• Naive DEL releases someone else\'s lock if your TTL expired and another holder grabbed it
• Atomic Lua: GET, compare to expected token, only DEL if match

Cache + timestamp:
• Atomic SET-with-version: only update if my version is newer

Caveats:
• Scripts block the server — keep them <1ms typically
• Scripts can\'t span hash slots in Redis Cluster (use hash tags)
• Use EVALSHA after first EVAL to skip re-sending the script

Alternatives:
• Redis MULTI/EXEC: optimistic transaction with WATCH/DISCARD; less convenient
• Redis Functions (7.0+): like Lua but stored more like stored procedures with versioning`,
        codeExample: `// Atomic rate limiter (Lua)
const rateLimitScript = \`
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  -- first hit in window: start the TTL clock
  redis.call('EXPIRE', KEYS[1], ARGV[2])
end
if current > tonumber(ARGV[1]) then
  return 0  -- over limit
end
return 1  -- allowed
\`;

const allowed = await redis.eval(
  rateLimitScript,
  1,                          // keys count
  \`rate:\${userId}:\${minute}\`, // KEYS[1]
  '100',                      // ARGV[1] - limit
  '60'                        // ARGV[2] - TTL seconds
);
if (allowed === 0) throw new Error('Rate limit exceeded');

// Safe distributed-lock release (Lua)
// Only delete if we still own the lock (token matches)
const releaseScript = \`
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0  -- someone else holds it now, don't touch
end
\`;
await redis.eval(releaseScript, 1, lockKey, lockToken);`
      },
      {
        id: 'cache-9',
        title: 'Cache Warming & Startup Strategies',
        content: `Empty cache + full traffic = database melts. Plan warming as carefully as the cache itself.

Cold start problem:
• Cache flush, deploy, new cluster spin-up → hit rate near 0%
• DB takes the FULL unfiltered load (often 10–100× normal)
• Common cause of "deploy caused outage"

Warming strategies:

1. Replay top queries:
• Track top-N queries with pg_stat_statements / Prometheus / app metrics
• On startup, run them in the background to fill the cache
• Trade-off: warmup time before serving traffic

2. Snapshot-restore from another instance:
• Redis allows replicating from a known-warm instance
• New cluster syncs from existing one before serving traffic
• Fast for big caches; needs operational tooling

3. Multi-tier with stable L2:
• L1 (in-process LRU) cold on each pod restart, but small
• L2 (shared Redis) survives pod restarts
• Pod startup pulls from L2 on miss; only the FIRST request per key per pod hits Redis, not the DB

4. Gradual traffic ramp:
• Send 1% of traffic to new pods, ramp up over 5 minutes
• Pods warm gradually instead of all at once
• Mostly handled at the LB / service mesh layer

5. Backfill workers:
• Scheduled jobs that pre-fetch likely-needed data
• "Top 1000 users\' profiles, refresh every 5 min"
• Cost: extra compute; benefit: predictable hit rate

Avoid these mistakes:
• Reaching for cache only when "the DB is slow" — cache that\'s 10% hit rate adds latency, not subtracts
• Caching things you can\'t invalidate — gradual rot
• Mixing cache and source-of-truth in the same key namespace`,
      },
      {
        id: 'cache-10',
        title: 'Cache Observability',
        content: `If you don\'t measure your cache, you don\'t know if it\'s helping. Three vital metrics + a few diagnostic commands.

Hit ratio:
• hits / (hits + misses), per key prefix or endpoint
• Healthy: 80%+ for hot keys; >95% for "this should always hit" keys
• Below 50% on a "cache" tells you it\'s actively HURTING (extra hop, extra serialization, no benefit)
• Track in Prometheus / Datadog with histograms by key family

P99 latency, hit vs miss:
• Hit latency: should be <2ms (network + serialization)
• Miss latency: cache check + DB call
• If hit latency creeps up, look at: serialization size, network saturation, GC pauses

Memory pressure:
• Redis maxmemory + eviction policy (allkeys-lru is the common default)
• Watch evictions per second — if high, you\'re thrashing; either grow cache or shrink data
• Watch ops/sec, used_memory, used_memory_peak

Hot key detection:
• redis-cli --hotkeys (samples and reports)
• A single key getting 10x more traffic than the next is a hotspot
• Mitigations: replicate hot key, in-process cache it, randomize suffix

Cardinality:
• How many distinct keys are you holding?
• Out-of-control cardinality = leak (per-request keys never expire)
• KEYS is dangerous; use SCAN with COUNT for production-safe iteration

Useful diagnostic commands:
• INFO stats / memory / clients
• MEMORY USAGE <key>
• OBJECT ENCODING <key>
• DEBUG OBJECT <key>
• MONITOR (development only — show all commands; expensive in prod)
• SLOWLOG GET 10`,
      },
      {
        id: 'cache-11',
        title: 'Multi-Tier Caching: In-Process L1 + Redis L2',
        content: `One cache layer is good; two strategically placed are great. Multi-tier minimizes both latency and shared-cache load.

Architecture:
• L1: in-process (Caffeine, lru-cache, sync.Map) — nanoseconds, per-pod copy
• L2: shared Redis — sub-millisecond, cluster-wide
• L3: database — milliseconds, source of truth

Read path:
1. Check L1 (hit → return)
2. Check L2 (hit → store in L1, return)
3. DB (miss → store in both L1 and L2, return)

Write path:
1. Update DB (source of truth)
2. Invalidate L2
3. Invalidate or update L1 across ALL pods (this is the hard part)

L1 invalidation:
• Pub/Sub (Redis) — write publishes "invalidate user:42"; every pod subscribes and clears its L1 entry
• Time-based: short L1 TTL (10–60s) for tolerable staleness, no fan-out needed
• Versioned keys: bump version on write, every L1 entry naturally becomes stale

When NOT to add L1:
• Data updates more than once per L1 TTL — L1 fights L2 instead of helping
• Writes are highly concurrent — invalidation overhead dominates
• Per-user data unlikely to repeat on the same pod (random LB) — L1 hit ratio stays low

Practical wins:
• Feature flags, config, schemas, common lookups — heavy L1 hit ratio, dramatic cost reduction on Redis
• Hot keys — putting them in L1 protects Redis from a single-key thundering herd

Caching the right thing in the right tier:
• Tiny + read-very-often → L1
• Big or shared-state → L2
• Source of truth → DB`,
        codeExample: `// In-process LRU + Redis L2
import LRU from 'lru-cache';
import Redis from 'ioredis';

const l1 = new LRU<string, any>({ max: 10_000, ttl: 60_000 });
const redis = new Redis();
const sub = new Redis(); // pub/sub subscriber

// Other pods' writes evict our local copy
sub.subscribe('cache:invalidate');
sub.on('message', (_chan, key) => l1.delete(key));

async function get(key: string) {
  // 1. L1: in-process, nanoseconds
  const local = l1.get(key);
  if (local !== undefined) return local;

  // 2. L2: shared Redis, sub-millisecond
  const remote = await redis.get(key);
  if (remote !== null) {
    const value = JSON.parse(remote);
    l1.set(key, value);  // promote to L1 for next time
    return value;
  }

  // 3. DB: source of truth — populate both tiers
  const fresh = await db.findById(key);
  if (fresh) {
    await redis.set(key, JSON.stringify(fresh), 'EX', 300);
    l1.set(key, fresh);
  }
  return fresh;
}

async function invalidate(key: string) {
  await redis.del(key);
  l1.delete(key);
  await redis.publish('cache:invalidate', key); // tell other pods
}`
      }
    ],
    flashcards: [
      { id: 'cache-fc-1', front: 'What is the Cache-Aside pattern?', back: 'App checks cache first. On miss, loads from DB and populates cache. On write, update DB and invalidate/update cache. Most common pattern.' },
      { id: 'cache-fc-2', front: 'What is cache stampede?', back: 'When cache expires, many requests hit DB simultaneously. Solutions: mutex/lock, staggered TTLs, background refresh, early expiration.' },
      { id: 'cache-fc-3', front: 'What is Write-Behind caching?', back: 'Write to cache immediately, async sync to database. Very fast writes but risks data loss if cache fails before sync.' },
      { id: 'cache-fc-4', front: 'What does TTL mean in caching?', back: 'Time-To-Live: how long data stays in cache before expiring. Automatic invalidation but may serve stale data until expiry.' },
      { id: 'cache-fc-5', front: 'When should you NOT cache?', back: 'Frequently changing data, sensitive data (unless encrypted), data that must always be fresh, when cache invalidation is too complex.' },
      { id: 'cache-fc-6', front: 'What is LRU eviction?', back: 'Least Recently Used - evicts items that haven\'t been accessed for the longest time when cache is full. Most common eviction policy.' },
      { id: 'cache-fc-7', front: 'What does ETag do?', back: 'Entity Tag - version identifier for cached resource. Client sends If-None-Match, server returns 304 Not Modified if unchanged.' },
      { id: 'cache-fc-8', front: 'Redis Sorted Set use case?', back: 'Leaderboards, ranking, time-series data. Items have scores for ordering. O(log N) add/remove, O(log N + M) range queries.' },
      { id: 'cache-fc-9', front: 'What is stale-while-revalidate?', back: 'Serve stale cached content immediately while fetching fresh content in background. Better UX - no waiting for fresh data.' },
      { id: 'cache-fc-10', front: 'CDN vs Application cache?', back: 'CDN: edge servers, static assets, global. Application cache (Redis): dynamic data, business logic, single region typically.' },
      { id: 'cache-fc-11', front: 'Read-through vs cache-aside', back: 'Read-through: app reads through the cache; the cache library is responsible for filling on miss. Cleaner code but tighter coupling.\n\nCache-aside (lazy-load): app reads cache, on miss reads DB and writes back to cache. Most common pattern; explicit, easy to reason about.\n\nMost teams use cache-aside; read-through is convenient when a library standardizes the pattern.' },
      { id: 'cache-fc-12', front: 'Write-through vs write-behind', back: 'Write-through: write to cache AND DB synchronously. Cache always fresh; every write pays both latencies.\n\nWrite-behind (write-back): write to cache only; flush to DB asynchronously. Extremely fast writes; data loss risk if cache dies before flush.\n\nUse write-through when correctness > speed; write-behind when extreme write throughput trumps occasional loss.' },
      { id: 'cache-fc-13', front: 'Refresh-ahead caching', back: 'Cache infrastructure proactively reloads entries before they expire (or based on access patterns) so hot keys never go cold.\n\nEliminates cache breakdown for known-hot keys. Cost: wasted work on keys that aren\'t accessed before next refresh.\n\nHybrid: enable refresh-ahead only for top-N hot keys identified by metrics.' },
      { id: 'cache-fc-14', front: 'Redis Cluster vs Sentinel', back: 'Sentinel: monitors a single primary + replicas; elects new primary on failure. One node holds all data.\n\nCluster: data sharded across nodes via 16,384 hash slots. Each shard has its own primary + replicas. Scales beyond one machine\'s RAM.\n\nUse Sentinel for HA when one node\'s RAM is enough. Cluster when you outgrow one node.' },
      { id: 'cache-fc-15', front: 'Redis Cluster hash tags', back: 'Curly-brace prefix forces keys to the same slot: cache:{user-42}:profile and cache:{user-42}:settings hash on "user-42" alone.\n\nLets transactions and Lua scripts span multiple keys (which require same-slot keys in Cluster mode).\n\nUse sparingly — concentrating keys defeats sharding. Hot tags become hotspots.' },
      { id: 'cache-fc-16', front: 'Redis MULTI/EXEC vs Lua', back: 'MULTI/EXEC: queue commands, EXEC runs them atomically. WATCH for optimistic concurrency. No conditional logic between commands.\n\nLua scripts: full scripting language, server-side, atomic. Conditionals, loops, multiple operations.\n\nLua is more powerful for read-modify-write. MULTI/EXEC is simpler when you just need atomic command execution.' },
      { id: 'cache-fc-17', front: 'EVALSHA vs EVAL', back: 'EVAL sends the full Lua source on every call.\n\nEVALSHA references a previously-loaded script by SHA1 hash — saves bandwidth.\n\nClients usually do EVAL once (Redis caches the script), then EVALSHA. If EVALSHA returns NOSCRIPT, fall back to EVAL to re-cache.\n\nClient libraries (ioredis, node-redis) handle this automatically.' },
      { id: 'cache-fc-18', front: 'SCAN vs KEYS', back: 'KEYS: scans the entire keyspace synchronously. Blocks Redis for the duration. Production-killer on large keyspaces.\n\nSCAN: cursor-based iteration; returns batches; non-blocking. Production-safe.\n\nNEVER use KEYS in production. Use SCAN with MATCH pattern and COUNT hint.' },
      { id: 'cache-fc-19', front: 'Redis Pub/Sub limitations', back: 'NOT durable — messages dropped if no subscriber at the moment of publish.\n\nNo delivery guarantees, no replay, no consumer group semantics.\n\nGood for: ephemeral notifications, cache invalidation across pods, real-time signaling.\n\nFor durable messaging, use Redis Streams (introduced 5.0) or a real broker like Kafka.' },
      { id: 'cache-fc-20', front: 'Redis Streams', back: 'Append-only log data structure (5.0+). Consumer groups, persistence, replay support.\n\nXADD to write, XREAD or XREADGROUP to read.\n\nKafka-like semantics with Redis simplicity. Good fit for moderate-throughput event streams; not a Kafka replacement at extreme scale.' },
      { id: 'cache-fc-21', front: 'Redis maxmemory eviction policies', back: 'When maxmemory hit:\n• allkeys-lru — evict least-recently-used across ALL keys (default for cache)\n• allkeys-lfu — least-frequently-used (better for non-recency hot)\n• volatile-lru / lfu — only evict keys with TTL\n• allkeys-random / volatile-random — random\n• noeviction — return errors on write (default for source-of-truth Redis)\n\nPick by workload. Cache → allkeys-lru or lfu. Sessions → volatile-lru.' },
      { id: 'cache-fc-22', front: 'Cache hit ratio interpretation', back: 'hits / (hits + misses).\n\n>95%: cache is doing its job\n80–95%: healthy for most workloads\n50–80%: marginal — investigate cardinality, TTL, key design\n<50%: cache is HURTING — extra latency for little benefit; reconsider\n\nMeasure per key family — global aggregate hides bad caches inside healthy ones.' },
      { id: 'cache-fc-23', front: 'Hot key detection', back: 'A single key getting 10x+ more traffic than the next.\n\nDetection:\n• redis-cli --hotkeys (samples; needs CONFIG SET maxmemory-policy allkeys-lfu)\n• Application metrics (count cache reads per key family)\n• OBJECT FREQ <key> (shows access frequency under LFU)\n\nMitigations: replicate hot key across nodes, in-process cache it, randomize suffix to spread load.' },
      { id: 'cache-fc-24', front: 'Cache cardinality runaway', back: 'When unique-per-request keys never expire, cache grows unbounded.\n\nExample: per-user-per-request session-id keys without TTL.\n\nDiagnose: INFO keyspace shows total keys; MEMORY USAGE samples shows distribution.\n\nFix: aggressive TTL, key-namespace consolidation, switch to per-user (not per-session) keys when stale-tolerant.' },
      { id: 'cache-fc-25', front: 'Per-request memoization', back: 'Cache results within a single request. Same query asked 10 times → 1 backend call.\n\nNot cross-request — disposed when the request finishes. Solves accidental N+1 in resolvers and middlewares.\n\nIn JS: a Map or WeakMap. In React: useMemo / DataLoader. In Express: a request-scoped object.' },
      { id: 'cache-fc-26', front: 'DataLoader pattern (backend)', back: 'Class that batches and dedupes async lookups within a tick.\n\nN .load(id) calls in the same tick → 1 batched DB call.\n\nKey to GraphQL N+1 elimination; useful in REST resolvers too. Per-request scope (new instance per request) — never share across requests.' },
      { id: 'cache-fc-27', front: 'Cache pub/sub invalidation', back: 'Cross-pod L1 cache invalidation pattern.\n\nWriter publishes "invalidate user:42" to a Redis channel. Every pod subscribes and deletes its L1 entry for that key.\n\nFan-out latency is single-digit ms — much faster than waiting for L1 TTL. Pair with versioned keys as a fallback if pub/sub messages get dropped.' },
      { id: 'cache-fc-28', front: 'Redis pipelining', back: 'Send N commands without waiting for individual responses; receive N responses in one batch.\n\nReduces round-trips dramatically — 1000 SET ops can drop from 100ms to 5ms over a network connection.\n\nClients (ioredis, node-redis) expose .pipeline() builders. Don\'t pipeline so much that you starve other clients.' },
      { id: 'cache-fc-29', front: 'Cache poisoning', back: 'Storing bad data in cache (corrupted bytes, attacker-controlled content) that then gets served to other users.\n\nCauses: trusting unvalidated user input, mixing tenants in shared keys, deserializing untrusted data.\n\nDefenses: validate before caching, keep tenant boundaries explicit in keys, never cache untrusted serialized objects (deserialization gadgets).' },
      { id: 'cache-fc-30', front: 'When NOT to add L1 in a multi-tier cache', back: 'L1 (in-process) doesn\'t always help.\n\nSkip if:\n• Data updates more than once per L1 TTL (constant invalidation churn)\n• Per-user data with random LB (low L1 hit ratio per pod)\n• Tiny pods where L1 memory is precious\n\nL1 wins when: small data, read-heavy, shared across many requests (feature flags, config, schema metadata).' }
    ],
    quizQuestions: [
      {
        id: 'cache-q-1',
        question: 'Which caching pattern has the fastest write performance?',
        options: ['Cache-Aside', 'Write-Through', 'Write-Behind', 'Read-Through'],
        correctAnswer: 2,
        explanation: 'Write-Behind writes to cache immediately and syncs to DB asynchronously. Fastest writes but eventual consistency.'
      },
      {
        id: 'cache-q-2',
        question: 'What causes cache stampede?',
        options: ['Too much RAM', 'Many requests when cache expires', 'Slow network', 'Wrong data type'],
        correctAnswer: 1,
        explanation: 'When cached data expires, multiple requests simultaneously try to regenerate it, overwhelming the database.'
      },
      {
        id: 'cache-q-3',
        question: 'What is the main challenge of caching?',
        options: ['Memory cost', 'Cache invalidation', 'Network latency', 'CPU usage'],
        correctAnswer: 1,
        explanation: 'Cache invalidation - ensuring cache stays consistent with the source of truth - is notoriously difficult to get right.'
      },
      {
        id: 'cache-q-4',
        question: 'What Redis data structure is best for a leaderboard?',
        options: ['String', 'Hash', 'List', 'Sorted Set'],
        correctAnswer: 3,
        explanation: 'Sorted Sets store items with scores, enabling efficient ranking, range queries, and score-based sorting.'
      },
      {
        id: 'cache-q-5',
        question: 'What does "Cache-Control: no-store" mean?',
        options: ['Cache for 1 hour', 'Cache but revalidate', 'Never cache the response', 'Cache only on CDN'],
        correctAnswer: 2,
        explanation: 'no-store means don\'t cache at all - not in browser, CDN, or anywhere. Used for sensitive data.'
      },
      {
        id: 'cache-q-6',
        question: 'What is the purpose of cache warming?',
        options: ['Increase temperature', 'Pre-populate cache before traffic', 'Clear old data', 'Encrypt cached data'],
        correctAnswer: 1,
        explanation: 'Cache warming pre-populates the cache with expected data before traffic hits, avoiding cold cache performance issues.'
      },
      {
        id: 'cache-q-7',
        question: 'Which Redis topology shards data across nodes so cache size exceeds one machine\'s RAM?',
        options: ['Sentinel', 'Master-Replica', 'Cluster', 'Single instance'],
        correctAnswer: 2,
        explanation: 'Redis Cluster distributes data across nodes via 16,384 hash slots. Sentinel only provides HA for a single primary; data fits on one machine.'
      },
      {
        id: 'cache-q-8',
        question: 'You\'re implementing a rate limiter in Redis. Two app instances see "current=99, limit=100" simultaneously. Without atomicity, both increment to 100 and approve the request — total now 101. Best fix?',
        options: ['Distributed lock', 'Lua script that does GET + check + INCR atomically', 'Higher TTL', 'Network retry'],
        correctAnswer: 1,
        explanation: 'Lua scripts run atomically server-side in Redis. The whole rate-limit decision happens as one indivisible operation, eliminating the race.'
      },
      {
        id: 'cache-q-9',
        question: 'You need to find all keys matching a pattern in production Redis. Which command is safe?',
        options: ['KEYS pattern*', 'SCAN cursor MATCH pattern* COUNT 100', 'DEBUG OBJECT', 'INFO keyspace'],
        correctAnswer: 1,
        explanation: 'KEYS scans the entire keyspace synchronously and blocks Redis. SCAN is cursor-based, non-blocking, returns batches — production-safe iteration.'
      },
      {
        id: 'cache-q-10',
        question: 'A single celebrity user\'s key gets 100x more traffic than other keys. Best mitigation?',
        options: ['Lower TTL', 'Increase Redis memory', 'Replicate the hot key across nodes / cache it in-process per-pod', 'Drop the user'],
        correctAnswer: 2,
        explanation: 'Hot keys overwhelm a single Redis node. Replicate the hot key across multiple Redis instances, or store it in each pod\'s in-process L1 cache to bypass Redis entirely.'
      },
      {
        id: 'cache-q-11',
        question: 'Cache hit ratio for a "feature_flags" key family is 98%. For "search_results" it\'s 35%. What does the 35% tell you?',
        options: ['Search is fast', 'The cache is HURTING — extra latency for almost no benefit; reconsider caching strategy', 'Increase TTL', 'Expected behavior'],
        correctAnswer: 1,
        explanation: 'Below ~50% hit ratio, cache adds round-trip overhead with little payback. Either cardinality is too high (every search is unique), TTL is too short, or the data simply doesn\'t belong in cache.'
      },
      {
        id: 'cache-q-12',
        question: 'A pod restarts; its in-process L1 cache is empty. Without protection, what happens?',
        options: ['Nothing — L2 handles it', 'Every request misses L1, hits L2 (Redis) — Redis sees a traffic spike', 'L1 is auto-restored', 'L2 is wiped too'],
        correctAnswer: 1,
        explanation: 'Cold L1 means every request goes to L2. Mitigations: gradual traffic ramp on new pods, multi-tier with stable L2 (Redis survives pod restarts), or cache warming on startup.'
      },
      {
        id: 'cache-q-13',
        question: 'Multi-tier cache: write updates the DB and invalidates Redis. How do you invalidate the L1 in OTHER pods?',
        options: ['Restart all pods', 'Wait for L1 TTL', 'Redis Pub/Sub message that all pods subscribe to → each pod deletes the key from its L1', 'Skip L1 invalidation'],
        correctAnswer: 2,
        explanation: 'Redis Pub/Sub is the canonical fan-out pattern. Writer publishes "invalidate <key>"; every pod\'s subscriber deletes the L1 entry within milliseconds. Pair with short TTL as fallback for missed messages.'
      },
      {
        id: 'cache-q-14',
        question: 'Within a single GraphQL request, the resolver calls db.users.findById(42) ten times for the same ID. What pattern eliminates the redundancy?',
        options: ['Add a Redis cache', 'Per-request DataLoader — batches and dedupes lookups in a single tick', 'Memoize globally', 'Bigger DB pool'],
        correctAnswer: 1,
        explanation: 'DataLoader collects all requested IDs in one tick, batch-fetches them in one DB call, returns per-ID promises. Per-request scope means no cross-request leakage.'
      },
      {
        id: 'cache-q-15',
        question: 'Your "user sessions" key family in Redis is growing unbounded — millions of keys, none expiring. Diagnosis?',
        options: ['Healthy growth', 'Cardinality runaway — keys lack TTL; set EXPIRE on every session key', 'Redis is broken', 'Need bigger nodes'],
        correctAnswer: 1,
        explanation: 'Without TTL, session keys live forever. Set EXPIRE on every session write (24h or 30 days based on your sliding window). Use INFO keyspace and MEMORY USAGE to confirm.'
      },
      {
        id: 'cache-q-16',
        question: 'At startup you warm 50,000 keys, each with TTL = 3600s. What happens an hour later, and how do you prevent it?',
        options: ['All keys expire in the same second, so misses arrive as a wave and the DB gets a synchronized load spike; add random jitter to each TTL (e.g. 3600 ± 300s)', 'Nothing — Redis spreads expirations automatically', 'Redis crashes from expiring too many keys at once', 'Keys renew themselves on read'],
        correctAnswer: 0,
        explanation: 'Identical TTLs turn cache warming into a scheduled stampede. Jittered TTLs de-synchronize expiry so misses trickle in continuously instead of hitting the database all at once.'
      },
      {
        id: 'cache-q-17',
        question: 'Using cache-aside, after a successful DB update should the writer SET the new value into the cache or DELETE the key?',
        options: ['SET — it saves the next reader a miss', 'DELETE — two concurrent writers can SET in the wrong order and leave a stale value cached until TTL; a delete forces the next reader to load the committed truth', 'Neither — TTL handles it', 'SET with a longer TTL'],
        correctAnswer: 1,
        explanation: 'With SET, writer 1 (old value) may reach the cache after writer 2 (new value) even though the DB committed them in the opposite order, and the stale value lives until TTL. Invalidating is the safer default; the cost is a single miss.'
      },
      {
        id: 'cache-q-18',
        question: 'Attackers request /users/{random_id} millions of times. Every ID is nonexistent, so every request misses the cache and hits the DB. What is the mitigation?',
        options: ['Increase the DB connection pool', 'Turn off the cache', 'Use a longer TTL for existing users', 'Cache the "not found" result with a short TTL (negative caching) and/or put a Bloom filter of existing IDs in front of the DB'],
        correctAnswer: 3,
        explanation: 'This is cache penetration: keys that never exist are never populated by a naive cache-aside loop. Storing a short-lived sentinel for misses (or rejecting impossible IDs with a Bloom filter) turns repeated lookups into cache hits.'
      },
      {
        id: 'cache-q-19',
        question: 'A per-user dashboard response is safe to cache in that user\'s browser for 60 seconds but must never be stored by the CDN. Which header?',
        options: ['Cache-Control: public, max-age=60', 'Cache-Control: no-store', 'Cache-Control: private, max-age=60', 'Cache-Control: no-cache'],
        correctAnswer: 2,
        explanation: 'private restricts storage to the end user\'s browser; shared caches (CDNs, proxies) must not store it. public would let the CDN serve one user\'s dashboard to another; no-store forbids caching entirely; no-cache allows storing but forces revalidation on every use.'
      },
      {
        id: 'cache-q-20',
        question: 'A single Redis hash holds 5 million fields. Running DEL on it makes every other client stall for seconds. Why, and what should you do instead?',
        options: ['Redis has a bug with large hashes', 'Add more replicas', 'Redis runs commands on one thread, so freeing a huge key blocks everyone; use UNLINK (frees in a background thread) and split big keys into many smaller ones', 'Set a longer TTL on the hash'],
        correctAnswer: 2,
        explanation: 'Commands execute one at a time on the main thread; an O(N) free of millions of entries blocks every client. UNLINK returns immediately and reclaims memory lazily. The real fix is design: shard big collections so each key stays small.'
      }
    ],
    visualizations: [
      {
        id: 'cache-viz-1',
        title: 'Cache-Aside Pattern',
        type: 'diagram',
        description: 'Application-managed caching',
        nodes: [
          { id: 'app', label: 'Application', x: 200, y: 40 },
          { id: 'cache', label: 'Cache', x: 100, y: 130 },
          { id: 'db', label: 'Database', x: 300, y: 130 }
        ],
        edges: [
          { from: 'app', to: 'cache', label: '1. Check' },
          { from: 'app', to: 'db', label: '2. On miss' },
          { from: 'app', to: 'cache', label: '3. Populate' }
        ]
      },
      {
        id: 'cache-viz-2',
        title: 'CDN Caching Flow',
        type: 'diagram',
        description: 'Edge caching for global performance',
        nodes: [
          { id: 'user', label: 'User', x: 60, y: 100 },
          { id: 'edge', label: 'CDN Edge', x: 180, y: 100 },
          { id: 'origin', label: 'Origin Server', x: 320, y: 100 }
        ],
        edges: [
          { from: 'user', to: 'edge', label: 'request' },
          { from: 'edge', to: 'origin', label: 'if miss' },
          { from: 'edge', to: 'user', label: 'response' }
        ]
      }
    ]
  },

  // 6. Message Queues
  {
    id: 'message-queues',
    name: 'Message Queues',
    slug: 'message-queues',
    description: 'RabbitMQ, Kafka, async processing patterns',
    icon: 'mail-outline',
    color: '#00BCD4',
    colorDark: '#0097A7',
    premium: true,
    learnContent: [
      {
        id: 'mq-1',
        title: 'Why Message Queues?',
        content: `Message queues enable asynchronous, decoupled communication.

Benefits:
• Decoupling: producers/consumers independent
• Resilience: messages persist if consumer down
• Scalability: add more consumers for throughput
• Load leveling: smooth out traffic spikes
• Guaranteed delivery: at-least-once semantics

Use cases:
• Background jobs (emails, reports, processing)
• Event-driven architecture
• Microservices communication
• Rate limiting / throttling`,
        codeExample: `// Without queue - tightly coupled, slow response
app.post('/order', async (req, res) => {
  const order = await createOrder(req.body);
  await sendEmail(req.body.email);        // Slow!
  await updateInventory(req.body.items);  // Slow!
  await notifyWarehouse(req.body);        // Slow!
  await updateAnalytics(order);           // Slow!
  res.json({ status: 'created' });        // User waits for all
});

// With queue - decoupled, fast response
app.post('/order', async (req, res) => {
  const order = await createOrder(req.body);

  // Publish event - async, fast
  await queue.publish('order.created', {
    orderId: order.id,
    userId: req.body.userId,
    items: req.body.items
  });

  res.json({ status: 'created' });  // Immediate response
});

// Separate workers handle the rest
emailWorker.subscribe('order.created', sendOrderEmail);
inventoryWorker.subscribe('order.created', updateStock);
warehouseWorker.subscribe('order.created', notifyTeam);
analyticsWorker.subscribe('order.created', trackOrder);`
      },
      {
        id: 'mq-2',
        title: 'RabbitMQ vs Kafka',
        content: `Different tools for different needs.

RabbitMQ (Message Broker):
• Traditional message queue
• Message routing with exchanges
• Message acknowledgment
• Deletes after consume
• Good for: task queues, RPC, complex routing

Kafka (Event Streaming):
• Distributed log storage
• High throughput (millions/sec)
• Message replay capability
• Retains messages (configurable)
• Good for: event sourcing, analytics, CDC`,
        codeExample: `// RabbitMQ with amqplib
const amqp = require('amqplib');

// Setup
const connection = await amqp.connect('amqp://localhost');
const channel = await connection.createChannel();
await channel.assertQueue('tasks', { durable: true });  // survives restart

// Producer
channel.sendToQueue('tasks', Buffer.from(JSON.stringify(task)), {
  persistent: true  // Survive broker restart
});

// Consumer with acknowledgment
channel.consume('tasks', async (msg) => {
  try {
    const task = JSON.parse(msg.content);
    await processTask(task);
    channel.ack(msg);  // Success - remove from queue
  } catch (err) {
    channel.nack(msg, false, true);  // Failure - requeue
  }
});

// Kafka with kafkajs
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['localhost:9092'] });

// Producer
const producer = kafka.producer();
await producer.connect();
await producer.send({
  topic: 'events',
  messages: [{ key: 'user-123', value: JSON.stringify(event) }]
});

// Consumer (with consumer group)
// Same groupId = partitions shared; new group = full copy of stream
const consumer = kafka.consumer({ groupId: 'my-service' });
await consumer.connect();
await consumer.subscribe({ topic: 'events', fromBeginning: false });
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value);
    await processEvent(event);
  }
});`
      },
      {
        id: 'mq-3',
        title: 'Reliability Patterns',
        content: `Ensure messages are processed reliably.

Delivery guarantees:
• At-most-once: may lose messages (fastest)
• At-least-once: may duplicate (most common)
• Exactly-once: no loss or duplicates (hardest)

Patterns:
• Dead Letter Queue (DLQ): failed messages
• Idempotency: safe to process multiple times
• Outbox pattern: transactional messaging
• Retry with backoff: handle transient failures`,
        codeExample: `// Idempotent consumer - safe for duplicates
async function processOrder(order) {
  const idempotencyKey = \`order:\${order.id}\`;

  // Check if already processed
  const processed = await redis.get(idempotencyKey);
  if (processed) {
    console.log('Already processed, skipping');
    return;
  }

  // Process order (your business logic)
  await db.orders.create(order);
  await updateInventory(order.items);

  // Mark as processed (with expiry)
  await redis.set(idempotencyKey, '1', { EX: 86400 });  // 24 hours
}

// Dead Letter Queue handling
async function consumeWithDLQ(msg, channel) {
  const retries = (msg.properties.headers['x-retries'] || 0);

  try {
    await processMessage(JSON.parse(msg.content));
    channel.ack(msg);
  } catch (err) {
    if (retries >= 3) {
      // Move to DLQ after 3 retries
      channel.sendToQueue('tasks.dlq', msg.content, {
        headers: { 'x-error': err.message, 'x-retries': retries }
      });
      channel.ack(msg);  // Remove from main queue
    } else {
      // Retry with exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      setTimeout(() => {
        channel.sendToQueue('tasks', msg.content, {
          headers: { 'x-retries': retries + 1 }
        });
        channel.ack(msg);
      }, delay);
    }
  }
}`
      },
      {
        id: 'mq-4',
        title: 'Message Routing & Exchanges',
        content: `RabbitMQ exchanges route messages to queues.

Exchange types:
• Direct: exact routing key match
• Fanout: broadcast to all bound queues
• Topic: pattern matching (*.error, order.#)
• Headers: match on headers

Patterns:
• Work queue: multiple consumers, load balance
• Pub/Sub: fanout to multiple services
• Routing: selective message delivery
• RPC: request-reply pattern`,
        codeExample: `// Fanout exchange - pub/sub
await channel.assertExchange('events', 'fanout', { durable: true });

// Service A queue
await channel.assertQueue('service-a-events');
await channel.bindQueue('service-a-events', 'events', '');

// Service B queue
await channel.assertQueue('service-b-events');
await channel.bindQueue('service-b-events', 'events', '');

// Publish - goes to ALL bound queues
channel.publish('events', '', Buffer.from(JSON.stringify(event)));

// Topic exchange - pattern matching
await channel.assertExchange('logs', 'topic', { durable: true });

// Queue for all errors
await channel.bindQueue('all-errors', 'logs', '*.error');

// Queue for order events only
await channel.bindQueue('order-events', 'logs', 'order.*');

// Publish
channel.publish('logs', 'order.created', msg);  // -> order-events
channel.publish('logs', 'order.error', msg);    // -> both queues
channel.publish('logs', 'user.error', msg);     // -> all-errors only`
      },
      {
        id: 'mq-5',
        title: 'Stream Processing with Kafka',
        content: `Kafka enables real-time stream processing.

Concepts:
• Topics: categories of records
• Partitions: parallel processing units
• Consumer Groups: scale consumers
• Offsets: position in partition

Stream processing:
• Filtering: drop unwanted events
• Mapping: transform events
• Aggregation: count, sum over windows
• Joining: combine multiple streams

Tools: Kafka Streams, ksqlDB, Flink`,
        codeExample: `// Kafka partitioning for ordering
await producer.send({
  topic: 'orders',
  messages: [{
    key: order.userId,  // Same user -> same partition -> ordered
    value: JSON.stringify(order)
  }]
});

// Consumer group - parallel processing
// 3 partitions, 3 consumers = each handles 1 partition
const consumer = kafka.consumer({ groupId: 'order-processor' });

// Kafka Streams-like processing (conceptual)
const events = new KafkaStream('raw-events');

events
  .filter(e => e.type === 'purchase')
  .map(e => ({
    userId: e.userId,
    amount: e.total,
    timestamp: e.timestamp
  }))
  .groupBy(e => e.userId)
  .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))  // 5-min buckets
  .aggregate(
    () => ({ count: 0, total: 0 }),
    (userId, event, agg) => ({
      count: agg.count + 1,
      total: agg.total + event.amount
    })
  )
  .to('user-purchase-summary');

// ksqlDB example
// CREATE STREAM purchases AS
//   SELECT userId, SUM(amount) as total
//   FROM raw_events
//   WHERE type = 'purchase'
//   WINDOW TUMBLING (SIZE 5 MINUTES)
//   GROUP BY userId;`
      },
      {
        id: 'mq-6',
        title: 'Worker Patterns: Prefetch, Concurrency, Ack Timing',
        content: `The shape of your worker pool determines whether your queue is a buffer or a ticking time bomb.

Prefetch count (RabbitMQ qos / SQS message visibility):
• How many messages a worker can hold "in-flight" at once before acking
• Too low (1): worker idle while broker waits for ack — bad throughput
• Too high (100+): one slow worker hogs messages while others starve
• Sweet spot: 10–50 for typical IO-bound workers, 1–5 for CPU-heavy or long-running jobs

Concurrency model:
• Multiple workers per pod, each with prefetch=N → effective parallelism = workers × N
• Match to your downstream capacity — DB connection pool, downstream API rate limit
• Watch CPU utilization; if at 100%, more concurrency hurts

Ack timing trade-offs:

Auto-ack (don\'t do this in production):
• Broker considers message done as soon as it sends to worker
• Worker crash = message lost
• Useful only for fire-and-forget logs

Manual ack BEFORE processing:
• Worker acks immediately, then processes
• Same risk as auto-ack — preserves throughput at the cost of durability
• Almost never the right choice

Manual ack AFTER processing (default):
• Worker acks only after successful processing
• Crash mid-process = redelivery (at-least-once)
• Requires idempotent processing
• Standard pattern

Long-running work:
• Send heartbeats / extend visibility timeout periodically (SQS ChangeMessageVisibility, RabbitMQ basic.nack with requeue=false → DLQ)
• Or break the job into smaller messages with explicit progress tracking
• A 60-minute job that crashes at minute 55 wasting all that work is a sign you should split it

Avoid:
• Processing huge batches in one ack window (entire batch redelivers on failure)
• Acknowledging too eagerly to "improve throughput" — you\'re trading correctness for rare wins`,
      },
      {
        id: 'mq-7',
        title: 'Retry & Poison Message Handling',
        content: `Failures are inevitable. Without explicit retry policy, you either lose messages or replay them forever.

Failure categories:

Transient (retry helps):
• Network timeout, downstream 503, transient DB error, brief rate limit
• Solution: retry with exponential backoff + jitter
• Cap attempts (5–10) and total time

Permanent (retry doesn\'t help):
• Bad data (validation fails), business logic refuses (account closed), expired auth
• Solution: send to DLQ immediately; don\'t pretend it\'s transient

Ambiguous:
• 500 error with vague message
• Treat as transient with bounded retry

Retry implementations:

Broker-level retry (RabbitMQ delayed queues):
• On nack, send to a "retry-1m" queue with TTL=60s
• When TTL expires, message routes back to main queue
• Track attempt count in headers; route to DLQ after N attempts

Application-level retry:
• Worker catches error, schedules redelivery with delay
• Easier to implement custom backoff curves
• Risk: long-running retry loops if broker is unaware

Kafka retry topics:
• Standard pattern: main → retry-5s → retry-30s → retry-5m → DLQ
• Each retry topic has TTL via consumer-side delay
• "Spring Cloud Stream" style or hand-rolled

Poison message:
• Same message keeps failing — usually bad data
• Detection: message acked NACK'd N times → DLQ
• Important: log the cause (exception, payload sample) before DLQing for forensics

DLQ practices:
• Always alert on DLQ depth > 0
• Provide a replay tool for ops (don\'t make engineers handcraft Lua scripts at 3am)
• Periodically clean DLQ to find systemic bugs (recurring same poison message)
• Never auto-replay DLQ unconditionally — you\'ll loop forever on a real poison message`,
      },
      {
        id: 'mq-8',
        title: 'Producer Reliability: acks, Idempotent, Transactional',
        content: `Kafka offers three levels of producer durability and consistency. Pick correctly or lose data quietly.

acks levels:
• acks=0 — fire and forget. Producer doesn\'t wait for any broker confirmation. Fastest; can drop messages on broker failure. Only for high-volume telemetry where loss is OK.
• acks=1 — leader writes; producer continues. Safer; can lose messages if leader dies before replication.
• acks=all (or -1) — leader writes AND replicas confirm. Pair with min.insync.replicas=2 for true durability. Slowest, but safe.

Most production setups: acks=all + min.insync.replicas=2 + retries=Integer.MAX.

Idempotent producer:
• Set enable.idempotence=true
• Producer gets a producer ID; messages get monotonic sequence numbers
• Broker dedupes within the same producer session
• Eliminates duplicates from RETRIES (not from app re-sending the same message)
• Available since Kafka 0.11; on by default in modern client libs

Transactional producer:
• Producer can atomically write to multiple topics + commit consumer offsets
• transactional.id (must be stable across instances) + initTransactions() / beginTransaction() / commitTransaction()
• Required for exactly-once stream processing pipelines (read from topic A, transform, write to topic B with same offset commit)
• Heavy: each transaction has overhead. Don\'t wrap individual sends.

Effectively-once pattern:
• acks=all + idempotent producer + idempotent consumer (dedup by message ID) = effectively-once observable behavior
• Works without distributed transactions; usually sufficient

Compression:
• Producer-side: gzip / snappy / lz4 / zstd
• Massively reduces network and storage cost; compute cost minimal on modern CPUs
• Default: lz4 or zstd (zstd has best ratio with similar speed)

Linger.ms + batch.size:
• Producer batches messages before sending
• linger.ms=5 → wait up to 5ms to fill batch
• Bigger batches = better compression + less network overhead
• Trade-off: 5ms added p99 latency for substantial throughput`,
      },
      {
        id: 'mq-9',
        title: 'Job Queues: BullMQ, Sidekiq, Celery',
        content: `Message queues handle event distribution; job queues handle background work with richer semantics — delays, priorities, retries built-in.

BullMQ (Node, Redis-backed):
• Native delayed jobs (ZSET with delivery time as score)
• Priority queues, repeating jobs, job dependencies (parent + children)
• Job-level concurrency, rate limiting, retries with backoff
• UI dashboard via Bull Board

Sidekiq (Ruby, Redis-backed):
• Industry standard in Ruby world
• Threaded workers (low memory vs forking workers)
• Plugins for unique jobs, batches, throttling
• Sidekiq Pro adds reliable fetch (no job loss on crash)

Celery (Python, broker-agnostic):
• RabbitMQ or Redis broker
• Celery Beat for scheduled jobs (cron-like)
• Group / chord / chain primitives for workflows
• Verbose configuration; powerful but old-school

RQ (Python, Redis):
• Simpler alternative to Celery
• No fancy workflow primitives, but easy to grok
• Good fit for small-to-medium Python apps

Resque (Ruby):
• Sidekiq predecessor; forking workers
• Slower than Sidekiq; mostly legacy now

When to pick a job queue over a message broker:
• Need delayed jobs ("send this email in 24h")
• Need scheduled / cron-like jobs
• Want priority queues
• Want a built-in retry policy
• Want visibility into job status, history, manual replay

Use a message broker (Kafka/RabbitMQ) when:
• Event distribution to many consumers
• Strict ordering by partition key
• Replay capability (Kafka)
• Complex routing (RabbitMQ exchanges)

Pattern: many production systems use both — broker for events, job queue for application-level tasks (emails, exports, reports).`,
        codeExample: `// BullMQ example (Node)
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email', { connection: redis });

// Add job with delay + retry policy
await emailQueue.add('welcome', { userId: 42 }, {
  delay: 5_000,                      // 5 seconds
  attempts: 5,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: 1000,            // keep last 1000
  removeOnFail: 500,
});

// Repeating job (cron)
await emailQueue.add('digest', {}, {
  repeat: { pattern: '0 9 * * 1' },  // every Monday 9am
});

// Worker
new Worker('email', async (job) => {
  await sendEmail(job.data);
}, {
  connection: redis,
  concurrency: 10,
  limiter: { max: 100, duration: 60_000 }, // 100/min
});`
      },
      {
        id: 'mq-10',
        title: 'Inbox Pattern & Idempotent Consumers',
        content: `Outbox solves "did the DB write AND the publish both happen?" Inbox solves "did this consumer process this message exactly once?"

The problem:
• Broker delivers a message
• Consumer starts work, makes side effects
• Consumer crashes before acking
• Broker redelivers
• Side effects happen twice

Inbox pattern:
1. On message receipt, INSERT into an inbox table with the message ID
2. If insert succeeds (no duplicate), process the message
3. Commit the inbox insert + business changes in ONE transaction
4. Ack the message

Subsequent redeliveries find the row already in the inbox → skip. Atomic, exactly-once observable behavior.

Storage: inbox table with primary key on (queue_name, message_id). TTL via cleanup job (1–7 days).

Variants:

Naive idempotency:
• On receipt, check if processed_messages contains message_id
• Process and add to set
• Race condition: two workers can both check, both process, both add. Mitigated by unique constraint with ON CONFLICT.

Stronger guarantee with side-effect IDs:
• If side effects have natural unique keys (charge_id), let those be the idempotency anchor
• No inbox table needed; the side effect IS the dedup record

Combining outbox + inbox:
• Producer: outbox guarantees publish
• Consumer: inbox guarantees process-once
• Together: end-to-end effectively-once across services

Cleanup:
• Inbox grows forever without TTL
• Set TTL longer than your retry budget — 7 days for queues with daily retries
• Index by created_at for efficient cleanup

Performance considerations:
• Inbox table sees one INSERT per message — index it well
• Partition by date if volume is huge
• Consider Redis SET with TTL for high-volume, low-correctness inboxes`,
        codeExample: `// Inbox pattern (Node + Postgres)
async function handleMessage(msg) {
  await db.transaction(async (tx) => {
    try {
      // Inbox insert is the dedup gate — PK on (queue, message_id)
      await tx.inbox.insert({
        queue: 'orders',
        message_id: msg.id,
        received_at: new Date(),
      });
    } catch (e) {
      if (e.code === '23505') {  // unique violation
        return; // already processed; safe to ack
      }
      throw e;
    }
    // Business logic in same transaction
    // Inbox row + side effects commit or roll back together
    await tx.orders.create({ /* ... */ });
    await tx.audit.create({ /* ... */ });
  });
  await msg.ack();  // only after the transaction committed
}`
      },
      {
        id: 'mq-11',
        title: 'Kafka Consumer Group Tuning',
        content: `Consumer groups have surprisingly many knobs. Wrong settings produce constant rebalances, lag spikes, or data loss.

Key parameters:

session.timeout.ms (default 45s):
• How long the broker waits before declaring a consumer dead
• Too low → false positives, frequent rebalances
• Too high → real failures take forever to detect

heartbeat.interval.ms (default 3s):
• How often the consumer pings "I\'m alive"
• Should be ≤ 1/3 of session.timeout

max.poll.interval.ms (default 5min):
• Max time between poll() calls
• If processing takes longer than this, broker assumes the consumer is stuck and triggers rebalance
• Set generously for slow consumers; pair with smaller batch sizes

max.poll.records (default 500):
• How many records returned per poll
• Lower if processing is slow per record (otherwise you exceed max.poll.interval)
• Higher for fast processors

Assignor strategies:
• range — partitions allocated by range. Default until recently. Causes uneven distribution across topics.
• round-robin — partitions distributed evenly across consumers
• sticky — minimizes reshuffling between rebalances
• cooperative-sticky — KIP-429, cooperative rebalance (only revoke partitions that move). Strongly recommended for low-latency apps. Default since 3.0.

Static membership:
• Set group.instance.id to a stable value (e.g., pod name)
• Brief disconnect (deploy, restart) doesn\'t trigger rebalance — the broker recognizes you when you reconnect
• Combine with longer session.timeout for stable rebalances

Common rebalance causes:
• Processing exceeds max.poll.interval.ms — most common
• Pod restarts — fix with static membership
• Network blips — fix with longer session.timeout
• New deploys — accept; cooperative-sticky minimizes pain

Consumer lag thresholds:
• Steady lag at 0 — over-provisioned
• Steady lag at low N — healthy headroom
• Growing lag → consumer can\'t keep up; scale out (add consumers up to partition count) or speed up processing

Don\'t scale beyond partition count: partitions are the unit of parallelism. 10 partitions caps you at 10 active consumers.`,
      }
    ],
    flashcards: [
      { id: 'mq-fc-1', front: 'What is a Dead Letter Queue (DLQ)?', back: 'A queue where messages that fail processing are sent. Allows investigation and reprocessing of failed messages without blocking the main queue.' },
      { id: 'mq-fc-2', front: 'What is the difference between RabbitMQ and Kafka?', back: 'RabbitMQ: traditional broker, deletes after consume, complex routing. Kafka: distributed log, retains messages, replay capability, higher throughput.' },
      { id: 'mq-fc-3', front: 'What is at-least-once delivery?', back: 'Messages are guaranteed to be delivered but may be delivered multiple times. Consumer must be idempotent to handle duplicates safely.' },
      { id: 'mq-fc-4', front: 'Why use message acknowledgment?', back: 'Confirms message was processed successfully. If consumer crashes before ack, message is redelivered. Prevents message loss.' },
      { id: 'mq-fc-5', front: 'What is the Outbox pattern?', back: 'Write message to outbox table in same transaction as business data. Separate process publishes to queue. Ensures consistency between DB and queue.' },
      { id: 'mq-fc-6', front: 'What is a Kafka consumer group?', back: 'Multiple consumers sharing a group ID. Each partition is consumed by only one consumer in the group. Enables parallel processing and scaling.' },
      { id: 'mq-fc-7', front: 'What is a fanout exchange?', back: 'RabbitMQ exchange that broadcasts messages to all bound queues. Used for pub/sub patterns where all services need all events.' },
      { id: 'mq-fc-8', front: 'Why partition messages by key in Kafka?', back: 'Messages with same key go to same partition, guaranteeing order. Important for events that must be processed in sequence (e.g., user actions).' },
      { id: 'mq-fc-9', front: 'What is backpressure in queues?', back: 'When producer is faster than consumer, queue grows. Backpressure signals producer to slow down. Prevents memory exhaustion and dropped messages.' },
      { id: 'mq-fc-10', front: 'When to use queues vs direct HTTP calls?', back: 'Queues: async is OK, need resilience, spiky traffic, multiple consumers. HTTP: need immediate response, simple request-reply, low latency required.' },
      { id: 'mq-fc-11', front: 'Prefetch count (RabbitMQ qos)', back: 'How many in-flight unacked messages a worker can hold.\n\nToo low (1): worker idle waiting for next message — bad throughput.\nToo high (100+): one slow worker hogs messages, others starve.\n\nSweet spot: 10–50 for IO-bound workers, 1–5 for CPU-heavy or long-running jobs.' },
      { id: 'mq-fc-12', front: 'Why is auto-ack dangerous?', back: 'Broker considers the message done as soon as it sends to the worker. Worker crash = message lost.\n\nUseful only for fire-and-forget logs where loss is acceptable.\n\nProduction default: manual ack AFTER processing — pair with idempotent consumer for safe redelivery on crash.' },
      { id: 'mq-fc-13', front: 'Exponential backoff with jitter', back: 'Retry delays grow exponentially: 1s, 2s, 4s, 8s, 16s.\n\nJitter (random delay added) prevents synchronized retries from many clients all hitting at the same time after a downstream outage.\n\nFull jitter: delay = random(0, base * 2^attempt). AWS SDK uses this. Caps thundering-herd risk on recovery.' },
      { id: 'mq-fc-14', front: 'Poison message vs transient failure', back: 'Transient: network blip, downstream 503, brief rate limit. Retry helps.\n\nPoison: bad data that ALWAYS fails — validation error, business logic refusal. Retry doesn\'t help.\n\nDifferentiate by error type. Send poison to DLQ immediately; retry transients with bounded attempts. Both go to DLQ after max attempts as a safety net.' },
      { id: 'mq-fc-15', front: 'DLQ replay strategy', back: 'Don\'t auto-replay DLQ in a loop — you\'ll re-poison the main queue forever.\n\nManual or batched replay tool that:\n• Lets ops inspect and filter messages\n• Replays in batches with monitoring\n• Marks replayed messages so you can correlate with new failures\n\nAlert on DLQ depth growing unexpectedly — usually a real bug.' },
      { id: 'mq-fc-16', front: 'Kafka acks=0 vs 1 vs all', back: 'acks=0: fire and forget. Fastest; can lose messages if broker fails.\n\nacks=1: wait for leader write. Can lose messages if leader dies before replication.\n\nacks=all (or -1): wait for all in-sync replicas. Pair with min.insync.replicas=2 for true durability.\n\nProduction safe default: acks=all + min.insync.replicas=2.' },
      { id: 'mq-fc-17', front: 'Idempotent producer (Kafka)', back: 'enable.idempotence=true gives the producer a unique ID; broker dedupes RETRIES (same producer ID + sequence number) within a session.\n\nEliminates duplicates from network-induced retries — NOT from app re-sending the same message manually.\n\nOn by default in modern Kafka clients. Tiny overhead, big correctness win.' },
      { id: 'mq-fc-18', front: 'Transactional producer (Kafka)', back: 'Producer can atomically commit writes to multiple topics + consumer offsets.\n\nRequires transactional.id (stable across instances) + initTransactions() / beginTransaction() / commitTransaction().\n\nUsed for exactly-once stream processing pipelines (read from A, transform, write to B atomically). Heavy — don\'t wrap individual sends.' },
      { id: 'mq-fc-19', front: 'Inbox pattern', back: 'Consumer-side outbox: on message receipt, INSERT into an inbox table with the message ID inside the same DB transaction as the business write.\n\nDuplicate delivery → unique constraint violation → safe skip.\n\nResult: exactly-once observable processing across redeliveries. Pair with outbox on the producer side for end-to-end effectively-once.' },
      { id: 'mq-fc-20', front: 'Delayed jobs in Redis', back: 'Use a sorted set (ZSET) with delivery time as score. ZADD job_queue <delivery_ts> <job_id>.\n\nWorker polls ZRANGEBYSCORE 0 NOW LIMIT 0 1 to pop ready jobs.\n\nBullMQ, Sidekiq Pro, RQ all use this pattern. Native delayed-message support in brokers (RabbitMQ delayed-message plugin, SQS DelaySeconds=≤15min) is similar.' },
      { id: 'mq-fc-21', front: 'Priority queues', back: 'Higher-priority jobs processed before lower-priority ones.\n\nImplementation: separate queues per priority (high/normal/low) with a worker that polls high first; OR a single ZSET with priority encoded in the score.\n\nWatch starvation — lowest-priority jobs may never run if high-priority constantly arrives. Cap with "must run within X" timeouts.' },
      { id: 'mq-fc-22', front: 'BullMQ flow (parent + children)', back: 'Define a parent job that depends on N children. The parent runs only after all children complete successfully.\n\nUse for: workflow orchestration without an external orchestrator. Generate report → send email → update dashboard.\n\nCoarse-grained alternative to step-functions / Temporal for in-process workflows.' },
      { id: 'mq-fc-23', front: 'Sidekiq concurrency model', back: 'Threaded workers: each Sidekiq process spawns N threads, each pulls from Redis.\n\nVs forking workers (Resque): much lower memory per worker (one Ruby VM, many threads).\n\nDefault: 5 threads. Tune based on IO-vs-CPU mix and DB pool size.' },
      { id: 'mq-fc-24', front: 'Celery Beat for scheduled jobs', back: 'Celery\'s cron-like scheduler. Runs in a single process (don\'t run multiple — they\'ll all schedule the same job).\n\nDefine: send_daily_report.s().apply_async(eta=tomorrow_9am)\nOr: declarative schedule in CELERY_BEAT_SCHEDULE config.\n\nFor HA, use single-instance Beat with a leader-election lock (Redis SETNX, ZooKeeper).' },
      { id: 'mq-fc-25', front: 'Long job heartbeats', back: 'For jobs that take longer than the visibility timeout / lock TTL, send periodic heartbeats to extend the lease.\n\nSQS: ChangeMessageVisibility every N seconds.\nRedis-based queues: extend lock TTL.\nKafka: not really applicable (offsets work differently).\n\nWithout heartbeats, the broker assumes failure and redelivers — duplicate processing.' },
      { id: 'mq-fc-26', front: 'Cooperative-sticky assignor', back: 'KIP-429 (Kafka 2.4+). During rebalance, only the partitions that actually move are revoked; other consumers keep processing.\n\nMassive availability win during deploys and scaling vs the legacy "stop-the-world" rebalance.\n\nDefault since 3.0. Always use unless you have a specific reason not to.' },
      { id: 'mq-fc-27', front: 'Static group membership (Kafka)', back: 'Set group.instance.id to a stable value (e.g., pod name). Brief disconnects (deploy, restart) don\'t trigger rebalance — broker recognizes the consumer when it reconnects within session timeout.\n\nPair with longer session.timeout.ms. Critical for stable consumer groups in Kubernetes deployments.' },
      { id: 'mq-fc-28', front: 'max.poll.interval.ms', back: 'Max time allowed between consumer poll() calls. If processing takes longer, the broker assumes the consumer is stuck and triggers a rebalance.\n\nDefault 5 minutes. Tune up for slow processors; tune down max.poll.records to keep batches small.\n\nThe #1 cause of "constant rebalance" outages.' },
      { id: 'mq-fc-29', front: 'Consumer lag scaling rule', back: 'Scale consumers up to (but not beyond) the partition count.\n\nPartitions are the parallelism unit — 10 partitions = max 10 active consumers per group. Adding more leaves them idle.\n\nIf you need more parallelism, increase partition count. But adding partitions to existing topics is disruptive — plan for headroom up front.' },
      { id: 'mq-fc-30', front: 'Linger.ms + batch.size', back: 'Producer batches messages before sending.\n\nlinger.ms: wait up to this long to fill a batch (default 0). Setting to 5–10ms massively improves throughput at minimal latency cost.\n\nbatch.size: max bytes per batch. Bigger = better compression + fewer round trips.\n\nTrade-off: small added p99 latency for substantial throughput.' }
    ],
    quizQuestions: [
      {
        id: 'mq-q-1',
        question: 'Which is better for message replay?',
        options: ['RabbitMQ', 'Kafka', 'Redis Pub/Sub', 'WebSockets'],
        correctAnswer: 1,
        explanation: 'Kafka retains messages in a log, enabling consumers to replay from any offset. RabbitMQ deletes messages after consumption.'
      },
      {
        id: 'mq-q-2',
        question: 'What makes a consumer idempotent?',
        options: ['Fast processing', 'Same result if processed multiple times', 'Single-threaded', 'Memory efficiency'],
        correctAnswer: 1,
        explanation: 'Idempotent consumers produce the same result regardless of how many times a message is processed. Essential for at-least-once delivery.'
      },
      {
        id: 'mq-q-3',
        question: 'When should you use a message queue?',
        options: ['Real-time chat', 'Background email sending', 'Serving static files', 'Database queries'],
        correctAnswer: 1,
        explanation: 'Message queues excel at async background tasks like email sending. They decouple the sender from slow operations.'
      },
      {
        id: 'mq-q-4',
        question: 'What RabbitMQ exchange type broadcasts to all queues?',
        options: ['Direct', 'Topic', 'Fanout', 'Headers'],
        correctAnswer: 2,
        explanation: 'Fanout exchange broadcasts messages to all bound queues regardless of routing key. Used for pub/sub patterns.'
      },
      {
        id: 'mq-q-5',
        question: 'How do Kafka consumer groups enable scaling?',
        options: ['By caching messages', 'Each consumer handles different partitions', 'By compressing data', 'Through load balancing'],
        correctAnswer: 1,
        explanation: 'In a consumer group, each partition is assigned to one consumer. More consumers (up to partition count) means more parallelism.'
      },
      {
        id: 'mq-q-6',
        question: 'What is the purpose of message persistence?',
        options: ['Faster delivery', 'Survive broker restarts', 'Reduce memory', 'Enable encryption'],
        correctAnswer: 1,
        explanation: 'Persistent messages are written to disk. If the broker crashes and restarts, messages aren\'t lost.'
      },
      {
        id: 'mq-q-7',
        question: 'A worker has prefetch=1. Throughput is bad even though the worker has spare CPU. What\'s the likely fix?',
        options: ['Lower prefetch to 0', 'Increase prefetch (e.g., 10–50) so the worker can hold multiple in-flight messages', 'More replicas', 'Increase ack timeout'],
        correctAnswer: 1,
        explanation: 'prefetch=1 means the worker waits for ack before broker sends the next message — bad for throughput. 10–50 lets the broker keep workers busy without one slow worker hogging too much.'
      },
      {
        id: 'mq-q-8',
        question: 'Why is auto-ack a bad default in production?',
        options: ['It\'s slower', 'Worker crash mid-processing loses the message — broker thinks it\'s already done', 'Auto-ack uses more memory', 'Required by HTTPS'],
        correctAnswer: 1,
        explanation: 'Auto-ack signals "done" before the worker actually processes. Crash = lost message. Production default: manual ack AFTER successful processing, paired with idempotent consumer for safe redelivery.'
      },
      {
        id: 'mq-q-9',
        question: 'A downstream service is briefly overloaded. Many workers retry simultaneously, hammering it. What backoff strategy avoids this?',
        options: ['Linear backoff', 'Exponential backoff with JITTER (random delay added per attempt)', 'No backoff — fail fast', 'Constant 1s delay'],
        correctAnswer: 1,
        explanation: 'Without jitter, all workers retry at exactly the same offsets and create thundering herds during recovery. Full jitter (delay = random(0, base * 2^attempt)) spreads retries naturally.'
      },
      {
        id: 'mq-q-10',
        question: 'A Kafka producer config sets acks=all and min.insync.replicas=2. What does this guarantee?',
        options: ['Faster writes', 'Messages are durable — confirmed only after at least 2 replicas have written', 'Compression', 'Encryption'],
        correctAnswer: 1,
        explanation: 'acks=all + min.insync.replicas=2 means a broker write isn\'t acknowledged until at least 2 in-sync replicas have it. Survives one node failure without data loss. Standard durability config.'
      },
      {
        id: 'mq-q-11',
        question: 'A Kafka producer crashes mid-send and retries. Without intervention, the same message lands twice. What setting prevents this?',
        options: ['Higher retries count', 'enable.idempotence=true (idempotent producer)', 'Larger batch size', 'Compression'],
        correctAnswer: 1,
        explanation: 'Idempotent producer assigns each message a producer ID + sequence number. The broker dedupes retries. On by default in modern clients; eliminates duplicates from network-induced retries.'
      },
      {
        id: 'mq-q-12',
        question: 'You consume a message, write to DB, then crash before acking. Broker redelivers; you process again — duplicate DB row. What\'s the structural fix?',
        options: ['Skip ack', 'Inbox pattern: insert into inbox table inside the same DB transaction; unique constraint catches duplicates', 'Larger timeout', 'Disable retries'],
        correctAnswer: 1,
        explanation: 'Inbox pattern records the message ID in the same transaction as business writes. Redelivery → unique constraint violation → safe skip. End-to-end exactly-once observable behavior.'
      },
      {
        id: 'mq-q-13',
        question: 'You need a job to run "in 24 hours" with retries and a UI dashboard. Best fit?',
        options: ['Kafka', 'A job queue like BullMQ / Sidekiq / Celery (delay + retry + dashboard built in)', 'cron', 'PostgreSQL LISTEN/NOTIFY'],
        correctAnswer: 1,
        explanation: 'Job queues bake in delayed jobs, priorities, retry policies, and dashboards. Kafka is for event streams; cron is fragile at scale; LISTEN/NOTIFY isn\'t durable.'
      },
      {
        id: 'mq-q-14',
        question: 'A long-running job (45 min) sometimes triggers redelivery to another worker. What\'s the fix?',
        options: ['Crash recovery', 'Send periodic heartbeats / extend visibility timeout while processing', 'Disable retries', 'Larger pods'],
        correctAnswer: 1,
        explanation: 'Without heartbeats, the broker assumes failure once the visibility timeout passes. SQS ChangeMessageVisibility, Redis lock TTL extension, or BullMQ updateProgress() keep the lease alive during long work.'
      },
      {
        id: 'mq-q-15',
        question: 'Your Kafka consumer group is rebalancing every few minutes, killing throughput. Most likely cause?',
        options: ['Partition count too low', 'Processing takes longer than max.poll.interval.ms — broker thinks consumers are stuck and rebalances', 'Wrong serializer', 'Network outage'],
        correctAnswer: 1,
        explanation: 'When poll() isn\'t called within max.poll.interval.ms, the broker considers the consumer dead and triggers rebalance. Either speed up processing, increase max.poll.interval, or reduce max.poll.records to keep batches small.'
      },
      {
        id: 'mq-q-16',
        question: 'Orders for a customer are kept in order by partitioning on customer_id. Ops raises the topic from 8 to 16 partitions for throughput. What breaks?',
        options: ['Nothing — Kafka rebalances keys safely', 'Old messages are deleted', 'hash(key) % partitions changes, so new messages for an existing customer land on a different partition than their older ones and per-key ordering across that boundary is lost; over-provision partitions up front or migrate to a new topic', 'Consumers can no longer join the group'],
        correctAnswer: 2,
        explanation: 'Kafka only guarantees order within a partition. Changing the partition count changes the key-to-partition mapping for all future messages, so a consumer can see a customer\'s newer event before an older one still sitting on the old partition. Pick partition counts with headroom from day one.'
      },
      {
        id: 'mq-q-17',
        question: 'A Kafka consumer commits its offset immediately after poll(), then processes the batch. It crashes halfway through. What delivery semantics did you just implement?',
        options: ['At-most-once — the committed offset already moved past the unprocessed messages, so they are never seen again', 'At-least-once — the batch will be redelivered', 'Exactly-once', 'Ordered delivery'],
        correctAnswer: 0,
        explanation: 'Committing before processing means a crash loses everything after the crash point. For at-least-once you commit after processing (and make the consumer idempotent); exactly-once needs transactions or an inbox pattern, not an offset trick.'
      },
      {
        id: 'mq-q-18',
        question: 'You want a Kafka topic to hold the latest state of every user profile so a new service can rebuild its cache by reading from the beginning — without the topic growing forever. What feature?',
        options: ['A short retention.ms', 'A fanout exchange', 'Resetting consumer group offsets', 'Log compaction (cleanup.policy=compact): Kafka keeps at least the latest record per key and removes older ones'],
        correctAnswer: 3,
        explanation: 'Compaction turns a topic into a changelog snapshot: per key, only the most recent value survives. Time-based retention would drop keys that have not changed recently, so a full rebuild from the topic would be incomplete.'
      },
      {
        id: 'mq-q-19',
        question: 'Both the Billing service and the Analytics service must receive EVERY order event. In Kafka, how must they consume?',
        options: ['Join the same consumer group so the load is shared', 'Use different group.id values: each group receives its own copy of every message, while instances within a group split the partitions', 'Read from different partitions', 'Publish every event to two topics'],
        correctAnswer: 1,
        explanation: 'A consumer group is a unit of work-sharing, not a subscriber. If Billing and Analytics shared a group, each event would go to only one of them. Separate groups (or, in RabbitMQ, separate queues bound to the same exchange) give independent pub/sub delivery.'
      },
      {
        id: 'mq-q-20',
        question: 'One malformed message in a partition fails processing every time. The consumer retries it endlessly, so thousands of good messages behind it are never processed. What is the fix?',
        options: ['Increase the retry count', 'Skip all messages from that producer', 'After a bounded number of attempts, publish the message to a dead-letter topic with error metadata and commit past it so the partition keeps flowing; alert on DLQ depth', 'Restart the consumer'],
        correctAnswer: 2,
        explanation: 'This is head-of-line blocking caused by a poison message. Infinite retries hold the whole partition hostage. Bounded retries with a DLQ preserve the bad message for investigation while healthy traffic proceeds.'
      }
    ],
    visualizations: [
      {
        id: 'mq-viz-1',
        title: 'Message Queue Flow',
        type: 'diagram',
        description: 'Producer-Consumer pattern',
        nodes: [
          { id: 'producer', label: 'Producer', x: 80, y: 100 },
          { id: 'queue', label: 'Queue', x: 200, y: 100 },
          { id: 'consumer1', label: 'Consumer 1', x: 320, y: 60 },
          { id: 'consumer2', label: 'Consumer 2', x: 320, y: 140 }
        ],
        edges: [
          { from: 'producer', to: 'queue', label: 'publish' },
          { from: 'queue', to: 'consumer1', label: 'consume' },
          { from: 'queue', to: 'consumer2', label: 'consume' }
        ]
      },
      {
        id: 'mq-viz-2',
        title: 'Kafka Partitioning',
        type: 'diagram',
        description: 'Parallel processing with partitions',
        nodes: [
          { id: 'topic', label: 'Topic', x: 80, y: 100 },
          { id: 'p0', label: 'Partition 0', x: 200, y: 40 },
          { id: 'p1', label: 'Partition 1', x: 200, y: 100 },
          { id: 'p2', label: 'Partition 2', x: 200, y: 160 },
          { id: 'c0', label: 'Consumer 0', x: 320, y: 40 },
          { id: 'c1', label: 'Consumer 1', x: 320, y: 100 },
          { id: 'c2', label: 'Consumer 2', x: 320, y: 160 }
        ],
        edges: [
          { from: 'topic', to: 'p0' },
          { from: 'topic', to: 'p1' },
          { from: 'topic', to: 'p2' },
          { from: 'p0', to: 'c0' },
          { from: 'p1', to: 'c1' },
          { from: 'p2', to: 'c2' }
        ]
      }
    ]
  },

  // 7. DevOps Basics
  {
    id: 'devops-basics',
    name: 'DevOps Basics',
    slug: 'devops-basics',
    description: 'Docker, CI/CD, monitoring, and deployment',
    icon: 'git-branch-outline',
    color: '#607D8B',
    colorDark: '#455A64',
    premium: true,
    learnContent: [
      {
        id: 'devops-1',
        title: 'Docker Containers',
        content: `Containers package applications with their dependencies.

Benefits:
• Consistent environment dev → prod
• Isolation between applications
• Lightweight compared to VMs
• Easy scaling and deployment
• Reproducible builds

Key concepts:
• Image: blueprint (immutable)
• Container: running instance
• Dockerfile: instructions to build image
• Registry: image storage (Docker Hub, ECR)
• Volume: persistent data`,
        codeExample: `# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Non-root user for security
USER node

EXPOSE 3000

CMD ["node", "server.js"]

# Build and run
docker build -t myapp:1.0 .
docker run -p 3000:3000 -d myapp:1.0

# Docker Compose for multi-container
version: '3.8'
services:
  app:
    build: .            # build from the Dockerfile above
    ports:
      - "3000:3000"     # host:container
    environment:
      - DATABASE_URL=postgres://db:5432/app  # 'db' resolves by name
    depends_on:
      - db              # start db first
  db:
    image: postgres:14
    volumes:
      - pgdata:/var/lib/postgresql/data  # persist data across restarts
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  pgdata:`
      },
      {
        id: 'devops-2',
        title: 'CI/CD Pipelines',
        content: `Continuous Integration/Delivery automates build and deploy.

CI (Continuous Integration):
• Automated builds on every commit
• Run tests automatically
• Code quality checks (lint, security)
• Fast feedback to developers

CD (Continuous Delivery/Deployment):
• Delivery: automated to staging, manual to prod
• Deployment: fully automated to prod
• Blue-green, canary deployments
• Rollback capabilities`,
        codeExample: `# GitHub Actions workflow
name: CI/CD

# Run on pushes to main and on every PR targeting main
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'   # reuse npm cache between runs
      - run: npm ci      # clean install from lockfile
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test   # gate: only deploy if tests passed
    if: github.ref == 'refs/heads/main'   # never deploy from PRs
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        # Tag with commit SHA — every deploy is traceable
        run: |
          docker build -t myapp:\${{ github.sha }} .
          docker push registry.example.com/myapp:\${{ github.sha }}

      - name: Deploy to Kubernetes
        # Updating the image triggers a rolling update
        run: |
          kubectl set image deployment/myapp \\
            myapp=registry.example.com/myapp:\${{ github.sha }}`
      },
      {
        id: 'devops-3',
        title: 'Monitoring & Observability',
        content: `The three pillars of observability:

1. Metrics: numerical measurements over time
   • CPU, memory, request rate, error rate
   • Tools: Prometheus, Datadog, CloudWatch

2. Logs: discrete events with context
   • Errors, warnings, info, debug
   • Tools: ELK Stack, Loki, CloudWatch Logs

3. Traces: request flow across services
   • Distributed tracing
   • Tools: Jaeger, Zipkin, AWS X-Ray

Alerting: notify on anomalies before users notice`,
        codeExample: `// Structured logging with pino
const logger = require('pino')();

app.use((req, res, next) => {
  const start = Date.now();
  // Propagate or mint a request ID for cross-service correlation
  const requestId = req.headers['x-request-id'] || uuid();

  // Log once per request, when the response is done
  res.on('finish', () => {
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      userAgent: req.headers['user-agent']
    });
  });

  next();
});

// Prometheus metrics
const { Counter, Histogram, register } = require('prom-client');

// Counter: only goes up — rates computed at query time
const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Histogram: latency distribution → percentiles in PromQL
const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.5, 1, 2, 5]  // bucket bounds in seconds
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.route?.path });

  res.on('finish', () => {
    httpRequests.inc({ method: req.method, path: req.route?.path, status: res.statusCode });
    end();
  });

  next();
});

// Metrics endpoint — Prometheus scrapes this on an interval
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});`
      },
      {
        id: 'devops-4',
        title: 'Kubernetes Basics',
        content: `Kubernetes orchestrates containerized applications.

Core concepts:
• Pod: smallest deployable unit (1+ containers)
• Deployment: manages pod replicas
• Service: stable network endpoint
• ConfigMap/Secret: configuration
• Ingress: external HTTP routing

Benefits:
• Self-healing (restart failed pods)
• Horizontal scaling
• Rolling updates
• Service discovery
• Load balancing`,
        codeExample: `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3            # desired pod count, self-healed
  selector:
    matchLabels:
      app: myapp         # which pods this Deployment manages
  template:              # pod blueprint
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 3000
        resources:
          requests:      # guaranteed — used for scheduling
            memory: "128Mi"
            cpu: "100m"
          limits:        # hard cap — OOM-kill / throttle beyond
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:   # fail → restart container
          httpGet:
            path: /health
            port: 3000
        readinessProbe:  # fail → remove from load balancer
          httpGet:
            path: /ready
            port: 3000

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp     # routes to pods with this label
  ports:
  - port: 80         # service port
    targetPort: 3000 # container port
  type: ClusterIP    # internal-only virtual IP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
spec:
  rules:
  - host: myapp.example.com   # external hostname → this service
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp
            port:
              number: 80`
      },
      {
        id: 'devops-5',
        title: 'Infrastructure as Code',
        content: `Manage infrastructure through code, not manual processes.

Benefits:
• Version controlled
• Reproducible environments
• Self-documenting
• Auditable changes
• Disaster recovery

Tools:
• Terraform: cloud-agnostic IaC
• AWS CDK/CloudFormation: AWS-specific
• Pulumi: code in real languages
• Ansible: configuration management`,
        codeExample: `# Terraform example - AWS infrastructure
# Pin the provider so runs are reproducible
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"   # any 5.x, never 6
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier        = "myapp-db"
  engine            = "postgres"
  engine_version    = "14"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "myapp"
  username = "admin"
  password = var.db_password  # never hardcode — pass as variable

  # References create implicit dependency ordering
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true  # dev only — keep snapshots in prod
}

# ECS Service
resource "aws_ecs_service" "myapp" {
  name            = "myapp"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.myapp.arn
  desired_count   = 3   # ECS keeps 3 tasks running

  # Register tasks with the ALB target group
  load_balancer {
    target_group_arn = aws_lb_target_group.myapp.arn
    container_name   = "myapp"
    container_port   = 3000
  }
}`
      },
      {
        id: 'devops-6',
        title: 'Docker Image Optimization & Security',
        content: `Container images are an attack surface AND a build-time cost center. A few practices cut both.

Multi-stage builds:
• First stage: full toolchain (compilers, dev deps), produce artifacts
• Second stage: minimal base, COPY only the artifacts
• Result: production image is 10–100x smaller, no build tools to exploit

Distroless / minimal bases:
• gcr.io/distroless/nodejs22 — just Node + your app, no shell, no package manager
• alpine — small but uses musl libc (occasional surprises with native deps)
• ubuntu/debian-slim — full Linux but minimal packages
• Smaller image = faster pulls + smaller attack surface

Layer caching (the order matters):
• Each Dockerfile instruction creates a layer; cache invalidates from the first changed line down
• Wrong: COPY . . → npm install — every code change reruns npm install
• Right: COPY package*.json → npm ci → COPY . . — code changes reuse the npm layer
• .dockerignore to exclude node_modules, .git, *.log

Non-root user:
• Default Docker user is root inside the container
• Create a dedicated user; chown app files; USER appuser
• Required by many k8s clusters (PodSecurityPolicy / PodSecurityStandards)
• Distroless nonroot variants come with this set

Image scanning:
• Trivy, Grype, Snyk scan for known CVEs in installed packages
• Run on every PR; fail the build on critical findings
• Continuously rescan deployed images (CVEs are discovered after publish)

Image signing & SBOM:
• Cosign (Sigstore) signs images with keyless cryptographic attestations
• SBOM (Software Bill of Materials): inventory of every package in the image (Syft generates them)
• Policies (Kyverno, Gatekeeper) verify only signed images deploy

BuildKit / buildx:
• Modern Docker builder — parallel stages, better caching, secret mounting
• --mount=type=secret lets the build use secrets that don\'t end up in the image
• --cache-from / --cache-to for distributed cache (registry-based)

Common mistakes:
• ENV / ARG with secrets — they end up in image history. Use BuildKit secret mounts.
• Running as root unnecessarily
• Pinning to ":latest" tag — non-reproducible builds
• Overlay-mounting host paths in production — escape vector`,
        codeExample: `# Multi-stage Node example
# Stage 1: install deps only — cached until package.json changes
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Stage 2: compile with full toolchain
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: ship only artifacts on a distroless base
FROM gcr.io/distroless/nodejs22-debian12 AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER nonroot   # never run as root in production
EXPOSE 3000
CMD ["dist/server.js"]

# Result: ~150MB instead of 1.2GB; no shell, no apt, no curl.`
      },
      {
        id: 'devops-7',
        title: 'GitOps with ArgoCD & Flux',
        content: `GitOps moves deployment configuration into Git. The cluster continuously reconciles its state to match what Git says — full audit trail, easy rollback.

Core principles:
1. The desired state lives in Git (Helm charts, Kustomize overlays, raw YAML)
2. An agent in the cluster watches Git
3. Any drift → agent applies Git\'s state automatically
4. Manual kubectl edits get reverted (fight the drift)

ArgoCD:
• UI-driven, app-centric model
• Visualize sync status, drift, rollback per-app
• Webhooks for fast updates
• Most popular in 2026

Flux:
• CLI-driven, more composable
• "Helm Operator" style — declarative HelmRelease objects
• Pairs with Kustomize and Source controllers
• Bigger lift to learn but more flexible

Workflow:
• Engineer opens PR with manifest change → reviewed → merged
• Argo/Flux notices the new commit (poll or webhook) and applies
• If sync fails, ArgoCD shows the error in its UI
• Rollback = revert the commit (audited, traceable)

Multi-environment patterns:
• Per-environment Git repos (or directories)
• Helm values-prod.yaml / values-staging.yaml
• Kustomize overlays — base + dev/staging/prod
• Avoid having one repo with environment branches — drift is hard to track

Secret challenges:
• You don\'t commit raw secrets to Git
• Sealed Secrets: encrypt secrets so the cluster can decrypt; safe to commit
• External Secrets Operator: Git references the secret name; operator fetches from Vault/Secrets Manager
• SOPS (Mozilla) encrypts YAML files with KMS or age keys

Promotion patterns:
• Image bumped in Git → ArgoCD picks up → deploys
• Auto-promotion: bot opens PR to staging on merge to main, then to prod after staging approval
• Image Updater (ArgoCD plugin) automates image bumps from container registry

Why teams adopt GitOps:
• Audit trail of every change (Git log)
• Easy rollback (git revert)
• Disaster recovery (recreate cluster from Git)
• Separation of concerns (devs change YAML; agent does the apply)`,
      },
      {
        id: 'devops-8',
        title: 'Helm & Kustomize',
        content: `Two ways to manage Kubernetes manifests at scale. Pick by team preference and complexity.

Helm — package manager for Kubernetes:
• Charts: bundles of templates with values
• values.yaml provides defaults; overrides per environment
• helm install / upgrade / rollback
• Templating engine handles loops, conditionals, helpers
• Public chart registry (Artifact Hub) — "helm install bitnami/redis"

Pros: rich templating, reusable charts, third-party charts
Cons: complex Go templates, hard to debug, "helm template" before applying for sanity

Kustomize — overlay-based, no templating:
• base/ contains resources
• overlays/{dev,staging,prod}/ patches the base
• kubectl apply -k overlay/prod
• Built into kubectl since 1.14

Pros: pure YAML, easy to read, no templating language to learn
Cons: less expressive than Helm, no third-party "package" ecosystem

Common workflows:

Pure Helm: third-party services (Redis, Postgres, ingress controllers) installed from charts; your apps as your own charts.

Pure Kustomize: simpler, especially for small fleets. Common in newer GitOps shops.

Helm + Kustomize hybrid:
• Helm renders the chart; Kustomize patches the output
• helm template my-app | kustomize build (or use post-renderers)
• Best when third-party charts need targeted patches

Anti-patterns:
• Hardcoded environment in templates (keep it in values/overlays)
• Massive single chart with 100s of templates — break into subcharts
• Templating per-resource secrets — use a secrets management tool
• Pinning chart version to "latest" — break-without-warning

Tools that complement:
• helm diff — preview changes before applying
• kubeval / kubeconform — validate manifests against k8s schemas
• polaris / kube-score — best-practice linting`,
      },
      {
        id: 'devops-9',
        title: 'Secrets Management',
        content: `Secrets in plain text in Git, env vars baked into images, or admin-only k8s Secrets are all on the spectrum from "easy" to "safe." Modern stacks pick a tool.

The threat model:
• Devs shouldn\'t see prod secrets
• Compromised pods shouldn\'t leak shared secrets
• Secrets rotate (compromise, employee departure, scheduled)
• Audit log of secret access

Tools:

HashiCorp Vault:
• Most powerful: dynamic secrets, lease-based access, fine-grained ACLs
• Apps authenticate to Vault (k8s ServiceAccount, AppRole, AWS IAM) and request secrets
• Vault returns scoped, short-lived secrets (e.g., DB credentials valid for 1 hour)
• Audit log of every secret read

External Secrets Operator (ESO):
• Bridge: ESO syncs secrets from Vault / AWS Secrets Manager / GCP Secret Manager into native k8s Secrets
• Apps continue to mount Secrets normally
• Operator handles refresh on rotation

Sealed Secrets (Bitnami):
• Encrypt-then-commit pattern
• Engineer encrypts secret with cluster\'s public key (kubeseal CLI) → commits SealedSecret YAML
• Cluster\'s controller decrypts and creates the actual Secret
• Safe to commit; audit via Git history

SOPS + age/KMS:
• Encrypt YAML/JSON files with age keys or cloud KMS
• Edit decrypted in memory; commit encrypted
• Pairs naturally with GitOps (Flux supports SOPS-encrypted manifests natively)

AWS Secrets Manager / GCP Secret Manager / Azure Key Vault:
• Cloud-native managed secret stores
• IAM-based access; auto-rotation built-in
• Pair with ESO or vendor-specific operators (e.g., AWS Secrets and Configuration Provider)

Common pitfalls:
• Logging secrets accidentally — use redaction in logging libs
• Embedding secrets in container images
• Long-lived secrets — rotate aggressively
• Sharing one DB credential across apps — use Vault dynamic credentials so each pod gets its own short-lived creds

Rotation:
• Hard secrets (per-deploy database master password): scheduled rotation in Vault
• Application secrets (API keys, OAuth client secrets): rotate on schedule + on incident
• Short-lived dynamic secrets: Vault generates per-request, leases expire

Detection:
• git-secrets, gitleaks, GitGuardian scan repos for accidental commits
• AWS Macie / GCP DLP scan storage for secret-shaped strings`,
      },
      {
        id: 'devops-10',
        title: 'Observability Stack: Prometheus, Grafana, Loki, Tempo',
        content: `The 2026 open-source observability default. Each piece is best-of-breed; together they cover metrics, logs, and traces.

Prometheus — metrics:
• Pull-based: Prometheus scrapes /metrics endpoints on apps and exporters
• Time-series database with PromQL query language
• Recording rules: pre-compute expensive queries
• Alerting rules: fire alerts based on PromQL
• Federated for scale; long-term storage via Thanos or Cortex/Mimir

Metric types:
• Counter — monotonically increasing (request count). Query rate(http_requests_total[5m]).
• Gauge — current value (queue depth, memory)
• Histogram — buckets (p50/p99 latency). Query histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
• Summary — pre-computed quantiles client-side (less flexible than histograms)

Grafana — visualization:
• Dashboards on top of any data source (Prom, Loki, Tempo, MySQL, Postgres)
• Templating, alerting, anomaly detection
• Industry standard

Loki — logs:
• Like Prometheus but for logs
• Indexes labels only (not log content) — cheap storage
• LogQL query language similar to PromQL
• Good fit when paired with Grafana + Prom

Tempo — traces:
• Stores traces from OpenTelemetry / Jaeger / Zipkin
• Object-storage backed (cheap)
• Pairs with Grafana for trace exploration
• Works with metrics and logs via exemplars (link from a metric to the relevant trace)

OpenTelemetry Collector:
• Receives data from apps in many formats
• Processes (batch, attribute manipulation, sampling)
• Exports to Prometheus, Tempo, Loki, vendor backends
• The "router" that lets you swap backends without changing app code

Cardinality discipline:
• High-cardinality labels (user_id, session_id) blow up Prom storage
• Move per-user data to logs/traces; keep metrics aggregate
• Watch up{} count and prom-metric churn

Alert routing:
• Alertmanager: dedup, grouping, silence, routing to Slack/PagerDuty/email
• Use receivers per severity (paging vs ticketing)
• Inhibit rules to avoid alert storms

The 4 golden signals:
• Latency (p99 of request duration)
• Traffic (request rate)
• Errors (rate of 5xx / explicit error counter)
• Saturation (CPU, memory, queue depth)`,
        codeExample: `# PromQL essentials
# Request rate per second over last 5 min
sum(rate(http_requests_total[5m])) by (route)

# 99th-percentile latency
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))

# Error rate (5xx / total)
sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))

# Pods near OOM (memory > 80% of limit)
container_memory_working_set_bytes{pod!=""}
  /
container_spec_memory_limit_bytes > 0.8

# Alert rule
- alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
      /
    sum(rate(http_requests_total[5m])) > 0.01
  for: 10m
  labels: { severity: page }
  annotations: { summary: "Error rate >1% for 10min" }`
      },
      {
        id: 'devops-11',
        title: 'SRE Practices: Error Budgets, Postmortems',
        content: `Site Reliability Engineering practices, popularized by Google\'s SRE book, give you a structured approach to running production systems.

Service Level Objectives (SLO):
• Internal targets that quantify reliability: "99.9% of requests under 300ms"
• Different from SLA (contractual, looser, with penalties)
• Owned by the engineering team, reviewed quarterly
• Measured via SLI: a metric you actually compute

Error budget = 1 − SLO:
• 99.9% SLO over 30 days = 43.2 minutes of allowed badness
• Spend the budget on risky work (big deploys, experiments)
• When exhausted, freeze risky changes; focus on stability

Why this matters:
• Replaces "100% uptime" goal (impossible, expensive) with rational risk-taking
• Aligns dev and ops: shipping more = burning budget = need to invest in reliability
• Prevents the swing between "ship reckless" and "ship nothing"

Postmortems (blameless):
• Run after every significant incident
• Focus on systemic causes, not individuals
• Output: timeline, contributing factors, action items, learnings
• "What did the system do that allowed this?" not "who screwed up?"

The five whys / contributing factors:
• Don\'t stop at the first cause
• "DB went down" → "config bug" → "missing test for that case" → "PR template doesn\'t prompt for tests on infra changes" → "..."
• Action items address the deeper cause when possible

On-call practices:
• Tier 1 alerts must be PAGEABLE — wake-someone-up if not addressed
• Tier 2: ticket-able, look at next business day
• Audit alert volume monthly; alerts that fire and require no action are noise; tune them out
• Page > 4 times per shift = alert fatigue → unreliable response

Runbooks:
• Step-by-step recovery procedures for known failure modes
• Linked from alerts ("DB high CPU → see runbook X")
• Living documents; update after every incident

Chaos testing / game days:
• Periodic exercises injecting failures (kill instances, regional outage)
• Verify runbooks work, on-call can respond, dependencies fail gracefully
• Builds confidence that incident response actually works under stress

Metrics for SRE work:
• MTTR (Mean Time To Recovery) — how fast you fix
• MTTD (Mean Time To Detect) — how fast you notice
• Change failure rate — % of deploys causing incidents
• Deploy frequency — how often you ship
• These four (DORA metrics) correlate with high-performing engineering orgs`,
      }
    ],
    flashcards: [
      { id: 'devops-fc-1', front: 'What is the difference between a Docker image and container?', back: 'Image is a read-only template/blueprint. Container is a running instance of an image. One image can spawn multiple containers.' },
      { id: 'devops-fc-2', front: 'What is CI/CD?', back: 'CI (Continuous Integration): auto-build and test on commit. CD (Continuous Delivery/Deployment): auto-deploy to staging/production.' },
      { id: 'devops-fc-3', front: 'What are the three pillars of observability?', back: 'Metrics (numbers over time), Logs (discrete events), Traces (request flow). Together they give visibility into system behavior.' },
      { id: 'devops-fc-4', front: 'Why use Docker volumes?', back: 'Containers are ephemeral - data is lost when container stops. Volumes persist data outside the container lifecycle.' },
      { id: 'devops-fc-5', front: 'What is a multi-stage Docker build?', back: 'Uses multiple FROM statements. Build in one stage (with dev tools), copy only artifacts to final stage. Smaller, more secure images.' },
      { id: 'devops-fc-6', front: 'What is a Kubernetes Pod?', back: 'Smallest deployable unit. Contains one or more containers that share network and storage. Containers in a pod are co-located and co-scheduled.' },
      { id: 'devops-fc-7', front: 'What is Infrastructure as Code (IaC)?', back: 'Managing infrastructure through code files instead of manual processes. Version controlled, reproducible, auditable. Examples: Terraform, CloudFormation.' },
      { id: 'devops-fc-8', front: 'What is a liveness probe in Kubernetes?', back: 'Checks if container is running. If it fails, Kubernetes restarts the container. Detects deadlocks and unresponsive applications.' },
      { id: 'devops-fc-9', front: 'Blue-green vs canary deployment?', back: 'Blue-green: switch all traffic at once between identical environments. Canary: gradually shift traffic (1%, 10%, 50%, 100%) to new version.' },
      { id: 'devops-fc-10', front: 'What is a readiness probe?', back: 'Checks if container is ready to receive traffic. Failed probe removes pod from service endpoints. Useful during startup or temporary unavailability.' },
      { id: 'devops-fc-11', front: 'ENTRYPOINT vs CMD', back: 'ENTRYPOINT is the fixed executable; CMD supplies default arguments that `docker run image <args>` overrides.\n\nENTRYPOINT ["node"] + CMD ["server.js"] runs node server.js; `docker run image repl.js` runs node repl.js instead.\n\nUse exec (JSON array) form for both so the process is PID 1 and receives SIGTERM for graceful shutdown; shell form wraps it in /bin/sh -c, which swallows signals.' },
      { id: 'devops-fc-12', front: 'Distroless images', back: 'gcr.io/distroless/nodejs22 — base image with just the runtime, no shell, no package manager, no curl.\n\nWhy: smaller attack surface, smaller image, faster pulls. Debugging is harder (no shell to exec into); use a debug variant or kubectl debug for that.' },
      { id: 'devops-fc-13', front: 'Docker layer cache order', back: 'Each Dockerfile instruction creates a layer; cache invalidates from the first changed line.\n\nWrong: COPY . . then npm install — every code change reruns the install.\n\nRight: COPY package*.json then npm ci, then COPY . . — code changes reuse the npm layer.\n\nMultiplies CI build speed.' },
      { id: 'devops-fc-14', front: 'Why run containers as non-root?', back: 'Default container UID is 0 (root). A container compromise + a kernel exploit = host escape with root.\n\nFix: create a dedicated user in the Dockerfile (USER appuser); chown app files. Required by k8s Pod Security Standards (restricted profile).\n\nDistroless "nonroot" variants come with this set automatically.' },
      { id: 'devops-fc-15', front: 'Image scanning (Trivy / Grype / Snyk)', back: 'Scan container images for known CVEs in installed OS packages and language deps.\n\nRun in CI on every PR; fail the build on critical findings. Continuously rescan deployed images — CVEs are discovered AFTER publish.\n\nPair with SBOM generation (Syft) for "what\'s in this image" inventory.' },
      { id: 'devops-fc-16', front: 'Cosign / Sigstore', back: 'Cryptographic image signing. Sign on push; verify on deploy with admission controllers (Kyverno, Gatekeeper).\n\nKeyless mode (Sigstore) uses OIDC identity tokens — no key management overhead.\n\nResult: only signed-by-our-CI images can run in production. Defends against registry compromise + supply chain attacks.' },
      { id: 'devops-fc-17', front: 'SBOM (Software Bill of Materials)', back: 'Inventory of every package, version, and license in an image or build.\n\nGenerated by Syft, Trivy, or build-tool plugins. Standardized formats: SPDX, CycloneDX.\n\nWhy: when CVE-2024-XXXX drops in lib-foo 2.1, an SBOM tells you exactly which images are affected. Required by US executive order 14028 for federal procurement.' },
      { id: 'devops-fc-18', front: 'GitOps principles', back: '1. Desired state lives in Git (manifests, Helm charts, Kustomize overlays)\n2. An agent in the cluster watches Git\n3. Drift triggers automatic reconciliation\n4. Manual kubectl edits get reverted\n\nResult: full audit trail (Git log), easy rollback (git revert), and disaster recovery (recreate cluster from Git).' },
      { id: 'devops-fc-19', front: 'ArgoCD vs Flux', back: 'ArgoCD: UI-first, app-centric. Visualize sync status per-app; one-click rollback. Most popular in 2026.\n\nFlux: CLI-first, more composable. Declarative HelmRelease objects; pairs naturally with Source controllers and Helm. Bigger lift to learn but more flexible.\n\nBoth are CNCF-graduated. Either is a fine default; teams pick based on UI vs CLI preference.' },
      { id: 'devops-fc-20', front: 'Helm chart structure', back: 'Chart.yaml — metadata.\nvalues.yaml — default config.\ntemplates/ — Kubernetes manifests with Go templates.\nhelpers.tpl — reusable template functions.\n\nhelm install / upgrade / rollback. Override values per environment with -f values-prod.yaml. Render before applying with helm template for sanity.' },
      { id: 'devops-fc-21', front: 'Kustomize overlays', back: 'No templating. base/ contains pure YAML; overlays/{dev,staging,prod}/ patches it.\n\nkubectl apply -k overlays/prod\n\nPros: no templating language; easy to read; built into kubectl since 1.14.\nCons: less expressive than Helm for complex conditionals; no third-party "package" ecosystem.' },
      { id: 'devops-fc-22', front: 'Vault dynamic secrets', back: 'Apps request DB credentials from Vault → Vault creates a real DB user with limited scope and short TTL → Vault returns creds → app uses them.\n\nWhen the lease expires, the user is dropped automatically. No long-lived shared password.\n\nResult: per-app, per-pod, per-request short-lived creds. Compromise blast radius = one lease.' },
      { id: 'devops-fc-23', front: 'External Secrets Operator (ESO)', back: 'Bridge between Kubernetes Secrets and external secret stores (Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault).\n\nDefine an ExternalSecret CR pointing at a remote secret; ESO syncs it into a native k8s Secret with periodic refresh.\n\nApps continue mounting Secrets normally; rotation handled by ESO.' },
      { id: 'devops-fc-24', front: 'Sealed Secrets', back: 'Encrypt-then-commit pattern. Engineer encrypts a secret with the cluster\'s public key (kubeseal CLI) → commits the SealedSecret YAML. Cluster\'s controller decrypts and creates the actual Secret.\n\nSafe to commit; audit via Git history; works without a separate secret store. Only the cluster can decrypt.' },
      { id: 'devops-fc-25', front: 'Prometheus metric types', back: 'Counter — monotonically increasing (request count). Query rate(...) over [time].\n\nGauge — current value (memory usage, queue depth).\n\nHistogram — buckets for distributions; query histogram_quantile() for percentiles.\n\nSummary — pre-computed quantiles client-side; less aggregatable than histograms.\n\nDefault for latency: histogram with le buckets.' },
      { id: 'devops-fc-26', front: 'PromQL rate() function', back: 'rate(metric[5m]) computes per-second rate of increase over the last 5 minutes.\n\nUse for counters: rate(http_requests_total[5m]) gives requests-per-second.\n\nirate() uses the last two samples — more spiky, less smooth. Use rate() for alerts and dashboards; irate() only for very-fast-moving counters.' },
      { id: 'devops-fc-27', front: 'Recording rules vs alerting rules', back: 'Recording rule: pre-computes an expensive PromQL query and stores the result as a new metric. Speeds up dashboards and alerts.\n\nAlerting rule: fires an alert (sent to Alertmanager) when an expression is true for a duration.\n\nGood pattern: define recording rules for "request rate per route", reference those in alerts.' },
      { id: 'devops-fc-28', front: 'Error budget', back: '1 − SLO, expressed as allowed downtime/badness over a window.\n\n99.9% over 30 days = 43.2 minutes.\n\nSpend the budget on risky work (deploys, migrations). When exhausted, freeze risky changes; invest in reliability.\n\nReplaces "100% uptime" goal (impossible) with rational risk-taking aligned to user impact.' },
      { id: 'devops-fc-29', front: 'Blameless postmortem', back: 'Incident review focused on SYSTEMIC causes, not individuals.\n\nOutput: timeline, contributing factors, action items, learnings.\n\n"What did the system allow that produced this?" Not "who screwed up?"\n\nMakes engineers willing to talk honestly about mistakes — vital for finding deep causes. Without it, incidents repeat.' },
      { id: 'devops-fc-30', front: 'DORA metrics', back: 'Four metrics correlated with high-performing engineering orgs (DevOps Research & Assessment).\n\n• Deploy frequency\n• Lead time for changes (commit → prod)\n• Mean time to recovery (MTTR)\n• Change failure rate (% of deploys causing incidents)\n\nElite teams: deploy on demand, lead time <1 day, MTTR <1 hour, failure rate 0–15%.' }
    ],
    quizQuestions: [
      {
        id: 'devops-q-1',
        question: 'What is the main benefit of containers over VMs?',
        options: ['More secure', 'Lightweight, share OS kernel', 'Faster network', 'Better graphics'],
        correctAnswer: 1,
        explanation: 'Containers share the host OS kernel, making them much lighter than VMs which each run a full OS. Faster startup and less resource usage.'
      },
      {
        id: 'devops-q-2',
        question: 'What triggers a CI pipeline?',
        options: ['Manual button', 'Code commit/push', 'Server restart', 'Scheduled timer only'],
        correctAnswer: 1,
        explanation: 'CI pipelines typically trigger on code push or pull request. This provides immediate feedback on code changes.'
      },
      {
        id: 'devops-q-3',
        question: 'Which tool is used for metrics collection?',
        options: ['Elasticsearch', 'Prometheus', 'Jaeger', 'Kafka'],
        correctAnswer: 1,
        explanation: 'Prometheus is a popular time-series database for metrics. Elasticsearch is for logs, Jaeger for traces, Kafka for messaging.'
      },
      {
        id: 'devops-q-4',
        question: 'What does a Kubernetes Service provide?',
        options: ['Persistent storage', 'Stable network endpoint for pods', 'Container runtime', 'CI/CD pipeline'],
        correctAnswer: 1,
        explanation: 'Services provide stable network endpoints (IP/DNS) for pods. Pods are ephemeral, but services maintain a consistent way to reach them.'
      },
      {
        id: 'devops-q-5',
        question: 'What is Terraform used for?',
        options: ['Container orchestration', 'Infrastructure as Code', 'Log aggregation', 'Message queuing'],
        correctAnswer: 1,
        explanation: 'Terraform is an IaC tool for provisioning and managing cloud infrastructure through declarative configuration files.'
      },
      {
        id: 'devops-q-6',
        question: 'What is the purpose of a Docker layer cache?',
        options: ['Encrypt images', 'Speed up builds by reusing unchanged layers', 'Compress images', 'Load balance containers'],
        correctAnswer: 1,
        explanation: 'Docker caches each layer. If a layer hasn\'t changed, it\'s reused from cache. Order Dockerfile instructions to maximize cache hits.'
      },
      {
        id: 'devops-q-7',
        question: 'A Node Dockerfile copies . then runs npm install. Build is slow even on small code changes. Best fix?',
        options: ['Use a faster CPU', 'COPY package*.json before COPY . to cache the install layer separately', 'Disable layer caching', 'Use a different base image'],
        correctAnswer: 1,
        explanation: 'Layer caching invalidates from the first changed line. Copying package.json first lets the install layer be cached; only the COPY . layer rebuilds when code changes.'
      },
      {
        id: 'devops-q-8',
        question: 'Why use a distroless base image (gcr.io/distroless/nodejs22) in production?',
        options: ['It\'s newer', 'No shell, no package manager, smaller attack surface, smaller pulls', 'It\'s required by Kubernetes', 'Faster CPU'],
        correctAnswer: 1,
        explanation: 'Distroless ships only the language runtime + your app. No /bin/sh for an attacker to abuse, no apt to add to a compromise. Smaller image = faster pulls.'
      },
      {
        id: 'devops-q-9',
        question: 'A new CVE drops in libssl. How do you find which deployed images are affected?',
        options: ['Manual audit', 'SBOM (Software Bill of Materials) generated for each image, queryable by package + version', 'Trust the registry', 'Rebuild every image'],
        correctAnswer: 1,
        explanation: 'SBOMs are inventories of every package in an image. When a CVE lands, a query against your SBOM database tells you which images are affected without rescanning.'
      },
      {
        id: 'devops-q-10',
        question: 'In GitOps, an operator notices kubectl drift and reverts it to match Git. Why is this the desired behavior?',
        options: ['It\'s a bug', 'Git is the single source of truth — every change must be auditable in Git history', 'kubectl is deprecated', 'Pods can\'t handle changes'],
        correctAnswer: 1,
        explanation: 'GitOps principle: desired state lives in Git. Manual edits get reverted so all changes flow through PRs — full audit trail, easy rollback (git revert), reproducible disaster recovery.'
      },
      {
        id: 'devops-q-11',
        question: 'You want a third-party Redis chart but with one custom annotation patched in. Best tool combination?',
        options: ['Fork the Helm chart', 'Helm + Kustomize: helm template the chart, Kustomize patches the output', 'Write raw YAML', 'kubectl apply --dry-run'],
        correctAnswer: 1,
        explanation: 'Helm renders the chart; Kustomize layers a small patch over the output. Best of both — keep upstream chart updates, apply your customizations declaratively.'
      },
      {
        id: 'devops-q-12',
        question: 'You want to commit a database password to Git safely. Which tool encrypts so the cluster can decrypt?',
        options: ['Plain Git', 'Sealed Secrets (encrypt with cluster public key, commit, cluster decrypts)', 'Base64', '.gitignore'],
        correctAnswer: 1,
        explanation: 'Sealed Secrets uses asymmetric crypto: encrypt with the cluster\'s public key (kubeseal CLI), commit the SealedSecret manifest, cluster\'s controller decrypts and creates the actual Secret.'
      },
      {
        id: 'devops-q-13',
        question: 'You want 99th-percentile request latency. Which Prometheus query?',
        options: ['avg(http_request_duration_seconds)', 'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))', 'count(http_requests)', 'max(latency)'],
        correctAnswer: 1,
        explanation: 'p99 is computed from histogram buckets. Aggregate the rate of bucket increments over a time window, then histogram_quantile(0.99, ...) interpolates the 99th percentile from the bucket distribution.'
      },
      {
        id: 'devops-q-14',
        question: 'Your SLO is 99.9% availability over 30 days. After a 30-min outage, what should you do with the remaining error budget?',
        options: ['Ignore it', '13 of 43 minutes spent — be more cautious with deploys this month, pause risky work, focus on reliability', 'Restart everything', 'Lower the SLO'],
        correctAnswer: 1,
        explanation: 'Error budget remaining = 43min − 30min ≈ 13min. With less than 1/3 of the budget left, freeze risky changes and stabilize. The principle: ship aggressively when budget is healthy, conservatively when it\'s low.'
      },
      {
        id: 'devops-q-15',
        question: 'After every incident, the team writes a postmortem. What\'s the cardinal rule of effective postmortems?',
        options: ['Identify the responsible engineer', 'Be blameless — focus on systemic causes, not individuals', 'Keep them short', 'Skip if minor'],
        correctAnswer: 1,
        explanation: 'Blameless postmortems make engineers willing to discuss mistakes honestly, surfacing the deeper systemic causes that allowed the failure. Blame culture hides real issues and ensures the same incidents repeat.'
      },
      {
        id: 'devops-q-16',
        question: 'You use blue-green deploys. The new release adds a NOT NULL column the old code does not know about. What is the risk at cutover and on rollback?',
        options: ['Both environments share one database, so schema changes must stay compatible with the old version: add the column nullable (or with a default) first, deploy code, then tighten the constraint in a later release', 'None — blue and green have separate databases', 'Rollback is always safe because the old image is still running', 'Blue-green cannot be used with relational databases'],
        correctAnswer: 0,
        explanation: 'Blue-green swaps application instances, not the data. If green writes rows the blue code cannot read, or blue inserts rows missing a NOT NULL column, rollback breaks. Expand-contract migrations keep every deployed version compatible with the live schema.'
      },
      {
        id: 'devops-q-17',
        question: 'To fix an urgent bug, an engineer SSHes into a production VM and edits a config file by hand. Why does immutable infrastructure forbid this even though it worked?',
        options: ['SSH is insecure', 'Config files cannot be edited on Linux', 'It uses more CPU', 'The server is now a snowflake: its state differs from the image and its peers, the change is not in version control, and the next autoscale or redeploy silently reverts it. Rebuild the image and roll it out instead'],
        correctAnswer: 3,
        explanation: 'Immutable infrastructure means running servers are never modified in place; every change is a new image shipped through the pipeline. In-place edits create configuration drift that cannot be reproduced or audited and undermine the assumption that any instance can be replaced at any time.'
      },
      {
        id: 'devops-q-18',
        question: 'Following the twelve-factor app, where should the database URL that differs between staging and production live?',
        options: ['Hard-coded in source behind an if (env === "prod") branch', 'In a config.prod.json checked into the repo', 'In environment variables injected at deploy time (credentials from a secrets manager), so one immutable image runs in every environment', 'Baked into a separate Docker image per environment'],
        correctAnswer: 2,
        explanation: 'Factor III (Config): strict separation of config from code. One artifact is promoted through environments with environment-specific values supplied from outside. Per-environment images or committed config files couple the build to the environment and leak secrets into Git.'
      },
      {
        id: 'devops-q-19',
        question: 'Two engineers run terraform apply against the same infrastructure at the same time from their laptops. What protects you, and what is the right setup?',
        options: ['Terraform detects the conflict from Git automatically', 'Run terraform destroy first', 'Nothing if state is local — both can corrupt the state file. Use a remote backend with state locking (S3 + DynamoDB, GCS, Terraform Cloud) and run apply from CI rather than laptops', 'Give each engineer their own workspace'],
        correctAnswer: 2,
        explanation: 'Terraform state maps config to real resources; concurrent writes lose or duplicate resources. Remote backends provide locking so the second apply waits or fails, and centralizing apply in CI gives one audited path. Per-engineer workspaces would create two copies of production.'
      },
      {
        id: 'devops-q-20',
        question: 'A pod restarts every few minutes and kubectl describe shows "Last State: Terminated, Reason: OOMKilled". What happened?',
        options: ['The container exceeded resources.limits.memory and the kernel killed it; raise the limit if the usage is legitimate, otherwise fix the leak, and set requests close to real usage so scheduling is accurate', 'The liveness probe failed', 'The node ran out of disk', 'The image is too large'],
        correctAnswer: 0,
        explanation: 'OOMKilled is enforced per container via cgroups when usage crosses the memory limit — it is not a probe failure. Check container_memory_working_set_bytes before simply raising the limit; a leak will just take longer to hit the new ceiling.'
      }
    ],
    visualizations: [
      {
        id: 'devops-viz-1',
        title: 'CI/CD Pipeline',
        type: 'diagram',
        description: 'From code to production',
        nodes: [
          { id: 'code', label: 'Code', x: 50, y: 100 },
          { id: 'build', label: 'Build', x: 110, y: 100 },
          { id: 'test', label: 'Test', x: 170, y: 100 },
          { id: 'deploy', label: 'Deploy', x: 230, y: 100 },
          { id: 'prod', label: 'Prod', x: 290, y: 100 }
        ],
        edges: [
          { from: 'code', to: 'build' },
          { from: 'build', to: 'test' },
          { from: 'test', to: 'deploy' },
          { from: 'deploy', to: 'prod' }
        ]
      },
      {
        id: 'devops-viz-2',
        title: 'Kubernetes Architecture',
        type: 'diagram',
        description: 'Pod deployment and service routing',
        nodes: [
          { id: 'ingress', label: 'Ingress', x: 200, y: 30 },
          { id: 'service', label: 'Service', x: 200, y: 100 },
          { id: 'pod1', label: 'Pod 1', x: 100, y: 180 },
          { id: 'pod2', label: 'Pod 2', x: 200, y: 180 },
          { id: 'pod3', label: 'Pod 3', x: 300, y: 180 }
        ],
        edges: [
          { from: 'ingress', to: 'service' },
          { from: 'service', to: 'pod1' },
          { from: 'service', to: 'pod2' },
          { from: 'service', to: 'pod3' }
        ]
      }
    ]
  }
];
