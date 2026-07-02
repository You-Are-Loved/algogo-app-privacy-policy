// System-design practice problems. Each problem ships with:
//   - palette: the components a user can drop onto the canvas
//   - requiredComponents: every component type that must exist (>=1)
//   - requiredConnections: undirected edges that must be present, by type pair
//   - hints: three progressive nudges
//   - solution: a worked-through explanation + canonical node placement
//
// Validation treats edges as undirected to keep MVP feedback forgiving.

export type ComponentType =
  | 'client'
  | 'rider'
  | 'driver'
  | 'web_server'
  | 'api_gateway'
  | 'ws_gateway'
  | 'load_balancer'
  | 'cache'
  | 'database'
  | 'object_storage'
  | 'cdn'
  | 'message_queue'
  | 'worker'
  | 'id_generator'
  | 'rate_limiter'
  | 'search_index'
  | 'location_service'
  | 'matching_service'
  | 'transcoder'
  | 'ranking_service'
  | 'replica'
  | 'url_frontier'
  | 'fetcher'
  | 'parser'
  | 'deduper'
  | 'metadata_db'
  | 'notification_service'
  | 'agent'
  | 'time_series_db'
  | 'payment_processor'
  | 'collab_engine'
  | 'bloom_filter'
  | 'game_server'
  | 'recommendation_engine';

export interface ComponentSpec {
  label: string;
  icon: string; // ionicon name
  color: string; // hex
}

export const componentCatalog: Record<ComponentType, ComponentSpec> = {
  client: { label: 'Client', icon: 'phone-portrait-outline', color: '#8B5CF6' },
  rider: { label: 'Rider', icon: 'person-outline', color: '#8B5CF6' },
  driver: { label: 'Driver', icon: 'car-outline', color: '#0EA5E9' },
  web_server: { label: 'API Server', icon: 'server-outline', color: '#10B981' },
  api_gateway: { label: 'API Gateway', icon: 'git-network-outline', color: '#10B981' },
  ws_gateway: { label: 'WS Gateway', icon: 'radio-outline', color: '#10B981' },
  load_balancer: { label: 'Load Balancer', icon: 'shuffle-outline', color: '#F59E0B' },
  cache: { label: 'Cache', icon: 'flash-outline', color: '#F43F5E' },
  database: { label: 'Database', icon: 'cube-outline', color: '#2563EB' },
  object_storage: { label: 'Object Store', icon: 'archive-outline', color: '#6366F1' },
  cdn: { label: 'CDN', icon: 'globe-outline', color: '#06B6D4' },
  message_queue: { label: 'Queue', icon: 'layers-outline', color: '#F97316' },
  worker: { label: 'Worker', icon: 'cog-outline', color: '#65A30D' },
  id_generator: { label: 'ID Gen', icon: 'pricetag-outline', color: '#EAB308' },
  rate_limiter: { label: 'Rate Limiter', icon: 'speedometer-outline', color: '#DC2626' },
  search_index: { label: 'Search Index', icon: 'search-outline', color: '#7C3AED' },
  location_service: { label: 'Location Svc', icon: 'navigate-outline', color: '#0EA5E9' },
  matching_service: { label: 'Matcher', icon: 'magnet-outline', color: '#F97316' },
  transcoder: { label: 'Transcoder', icon: 'film-outline', color: '#7C3AED' },
  ranking_service: { label: 'Ranker', icon: 'trophy-outline', color: '#F59E0B' },
  replica: { label: 'Replica', icon: 'copy-outline', color: '#94A3B8' },
  url_frontier: { label: 'URL Frontier', icon: 'list-outline', color: '#F97316' },
  fetcher: { label: 'Fetcher', icon: 'cloud-download-outline', color: '#06B6D4' },
  parser: { label: 'Parser', icon: 'reader-outline', color: '#10B981' },
  deduper: { label: 'Deduper', icon: 'remove-circle-outline', color: '#DC2626' },
  metadata_db: { label: 'Metadata DB', icon: 'document-text-outline', color: '#2563EB' },
  notification_service: { label: 'Notifications', icon: 'notifications-outline', color: '#EC4899' },
  agent: { label: 'Agent', icon: 'pulse-outline', color: '#22D3EE' },
  time_series_db: { label: 'Time-Series DB', icon: 'time-outline', color: '#0EA5E9' },
  payment_processor: { label: 'Payments', icon: 'card-outline', color: '#10B981' },
  collab_engine: { label: 'Collab Engine', icon: 'people-outline', color: '#8B5CF6' },
  bloom_filter: { label: 'Bloom Filter', icon: 'filter-outline', color: '#EF4444' },
  game_server: { label: 'Game Server', icon: 'game-controller-outline', color: '#F43F5E' },
  recommendation_engine: { label: 'Recommender', icon: 'star-outline', color: '#FBBF24' },
};

export interface SystemDesignProblem {
  id: string;
  number: number;
  title: string;
  topic: string;
  prompt: string;
  palette: ComponentType[];
  requiredComponents: ComponentType[];
  requiredConnections: [ComponentType, ComponentType][];
  hints: [string, string, string];
  solution: string;
}

export const systemDesignProblems: SystemDesignProblem[] = [
  {
    id: 'url-shortener',
    number: 1,
    title: 'URL Shortener',
    topic: 'Web service',
    prompt:
      'Design a service that accepts a long URL and hands back a short token. Visiting the token redirects to the original URL. Reads dwarf writes. Latency on the redirect matters.',
    palette: ['client', 'web_server', 'cache', 'database', 'id_generator', 'load_balancer'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'id_generator'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'id_generator'],
    ],
    hints: [
      "Reads massively outnumber writes — the lookup path should never hit the database first.",
      "You need a unique-token generator (base62 from a counter, hashed input, etc.). Decide if it sits inline or as its own service.",
      'A read flow looks like: client → API → cache (hit returns instantly, miss falls through to DB then populates cache).',
    ],
    solution:
      'Clients hit an API server via a load balancer. On a write, the API asks the ID generator for a new token, stores `(token → long_url)` in the database, and warms the cache. On a read, the API checks the cache first; on miss it loads the row from the database and writes it back into the cache before responding with a redirect. Tokens are short base62 strings from a monotonically increasing counter (sharded across ID-generator instances) so collisions are impossible.',
  },
  {
    id: 'photo-sharing',
    number: 2,
    title: 'Photo Sharing Service',
    topic: 'Media',
    prompt:
      'Users upload photos and share them with friends. Reads are global; serving the photo bytes should be fast everywhere.',
    palette: ['client', 'web_server', 'database', 'object_storage', 'cdn', 'cache'],
    requiredComponents: ['client', 'web_server', 'database', 'object_storage', 'cdn'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'object_storage'],
      ['object_storage', 'cdn'],
      ['client', 'cdn'],
    ],
    hints: [
      'Separate the metadata path (small, transactional) from the bytes path (large, immutable).',
      'Photos live in object storage. The database only holds pointers + metadata.',
      'A CDN sits in front of object storage; clients fetch the actual pixels from the CDN edge nearest to them, not your origin.',
    ],
    solution:
      'Upload flow: the client sends a presigned upload request to the API server, the API returns a signed URL, the client PUTs the bytes directly to object storage. The API writes a metadata row pointing to the object key. Read flow: the client fetches metadata via the API, then loads the image bytes from the CDN. The CDN pulls from object storage on first miss and caches at the edge afterwards. Decoupling metadata from bytes keeps the database small and lets you scale media delivery with the CDN.',
  },
  {
    id: 'twitter-feed',
    number: 3,
    title: 'Microblog Feed',
    topic: 'Social',
    prompt:
      'Users post short messages and follow others. Each user has a home timeline of recent posts from people they follow. Reads vastly outnumber writes.',
    palette: ['client', 'web_server', 'database', 'cache', 'message_queue', 'worker'],
    requiredComponents: ['client', 'web_server', 'database', 'cache', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'cache'],
      ['web_server', 'cache'],
    ],
    hints: [
      "Computing each user's home timeline on every read is too slow at scale. Think about pre-computing it.",
      "On a write, fan the post out into the timeline of each follower (the 'fan-out-on-write' pattern). Heavy work for celebrities; cap or fan-out-on-read for them.",
      'A queue + worker decouples the write request from the fan-out. The worker pushes new entries into each follower’s cached timeline.',
    ],
    solution:
      "When a user posts, the API server writes the post to the database and enqueues a fan-out job. A worker pulls the job, looks up the author's followers, and pushes the post ID into each follower's cached timeline (a Redis list keyed by user ID). Home-timeline reads just return the cached list. Hot accounts (large follower counts) fall back to fan-out-on-read so they don't choke the queue.",
  },
  {
    id: 'ride-sharing',
    number: 4,
    title: 'Ride Matching',
    topic: 'Marketplace',
    prompt:
      'Riders request rides; nearby drivers should be matched within seconds. Driver locations change continuously. Latency between request and match is the user-facing metric.',
    palette: [
      'rider',
      'driver',
      'web_server',
      'location_service',
      'matching_service',
      'message_queue',
      'database',
    ],
    requiredComponents: [
      'rider',
      'driver',
      'web_server',
      'location_service',
      'matching_service',
      'database',
    ],
    requiredConnections: [
      ['rider', 'web_server'],
      ['driver', 'web_server'],
      ['web_server', 'matching_service'],
      ['web_server', 'location_service'],
      ['matching_service', 'location_service'],
      ['matching_service', 'database'],
    ],
    hints: [
      "Driver locations stream in constantly — separate that hot write path from the slower request DB.",
      "A geo-index (geohash or H3 cells) lets you fetch 'drivers within X meters of point P' in O(log n) or better.",
      'A dedicated matching service can pull candidate drivers from the location service and run scoring/assignment logic without touching the main DB.',
    ],
    solution:
      'Drivers stream location updates into a location service backed by a geo-index, not the relational DB. When a rider requests a ride, the API forwards to the matching service, which queries the location service for nearby online drivers, scores them (distance, rating, ETA), and writes the trip into the database. A queue between the API and matching service can absorb bursts during peak hours. The relational DB never has to hold real-time driver positions.',
  },
  {
    id: 'chat-service',
    number: 5,
    title: 'Chat / Messaging',
    topic: 'Realtime',
    prompt:
      'Users send 1:1 and group messages in real time, with delivery to recipients even when their app is backgrounded. Messages must persist for history.',
    palette: ['client', 'ws_gateway', 'message_queue', 'database', 'cache', 'worker'],
    requiredComponents: ['client', 'ws_gateway', 'message_queue', 'database'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'message_queue'],
      ['message_queue', 'database'],
      ['ws_gateway', 'database'],
    ],
    hints: [
      "Persistent WebSocket connections + a routing layer beat polling for delivery latency.",
      'Decouple delivery from persistence with a queue, so a slow database write does not block other recipients.',
      'For offline users, store-and-forward: persist the message, then deliver on next connect.',
    ],
    solution:
      'Clients hold a WebSocket to a gateway server. When a message is sent, the gateway publishes it to a queue keyed by conversation ID. A consumer persists the message to the database and pushes it to gateways that have the recipients connected. If a recipient is offline, the gateway skips delivery; on next connect, the gateway replays unread history from the database. Gateways are horizontally scaled, and a presence cache tracks which gateway holds each user’s socket.',
  },
  {
    id: 'video-streaming',
    number: 6,
    title: 'Video Streaming',
    topic: 'Media',
    prompt:
      "Users upload videos and other users stream them. Source files can be huge; viewers expect smooth playback on any network. You don't transcode at request time.",
    palette: ['client', 'web_server', 'object_storage', 'transcoder', 'cdn', 'metadata_db'],
    requiredComponents: ['client', 'object_storage', 'transcoder', 'cdn', 'metadata_db'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'metadata_db'],
      ['web_server', 'object_storage'],
      ['object_storage', 'transcoder'],
      ['transcoder', 'object_storage'],
      ['object_storage', 'cdn'],
      ['client', 'cdn'],
    ],
    hints: [
      'Pre-encode at multiple bitrates so the player can switch (HLS/DASH) instead of re-encoding live.',
      'Transcoding is async and CPU-heavy; trigger it from upload, write outputs back to object storage.',
      'A CDN serves the segmented bitrate variants. Origin only sees cache misses.',
    ],
    solution:
      'Upload lands the source file in object storage and writes a row to the metadata DB. An object-storage event kicks off the transcoder, which produces HLS/DASH segments at several bitrates and writes them back. The CDN fronts those segments. The client first asks the API for the manifest URL (stored in metadata), then streams segments from the CDN, switching bitrates based on its current bandwidth.',
  },
  {
    id: 'news-feed',
    number: 7,
    title: 'Ranked News Feed',
    topic: 'Social',
    prompt:
      "Build a feed that mixes signals (recency, engagement, personalisation) and serves a ranked list per user. Updates do not have to be instant but should feel fresh.",
    palette: ['client', 'web_server', 'cache', 'database', 'ranking_service', 'message_queue'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'ranking_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'ranking_service'],
      ['ranking_service', 'database'],
    ],
    hints: [
      'Ranking is the expensive step. Cache the ranked list per user with a short TTL.',
      'Decouple the ranker from the request path; precompute scores in batches.',
      'Use a queue if you want near-real-time score updates as new posts arrive.',
    ],
    solution:
      'The API server checks a per-user ranked feed cache. On miss, it asks the ranking service to produce a fresh list using candidate posts from the database. Ranking runs feature pipelines (engagement, recency, affinity) and returns a sorted list, which the API writes back to the cache with a short TTL. A background worker can refresh feeds for active users out-of-band so steady-state reads stay cache-hot.',
  },
  {
    id: 'distributed-cache',
    number: 8,
    title: 'Distributed Cache',
    topic: 'Infrastructure',
    prompt:
      'Stand up a fleet of in-memory cache nodes that scale horizontally, survive single-node failures, and front a slower data store.',
    palette: ['client', 'web_server', 'cache', 'replica', 'database'],
    requiredComponents: ['client', 'web_server', 'cache', 'replica', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['cache', 'replica'],
      ['cache', 'database'],
    ],
    hints: [
      'Pick a routing strategy: consistent hashing minimises remap when you add or remove nodes.',
      'A primary/replica per shard gives you read scaling and a hot standby.',
      "On miss, the cache loads from the database (read-through) or the client does (cache-aside); pick one.",
    ],
    solution:
      'Cache nodes are sharded by consistent hashing of the key. Each shard runs a primary plus one or two read replicas. Clients (or a thin proxy) route requests to the owning shard. On a primary failure, a replica is promoted. Misses fall through to the database in cache-aside mode: app code reads from DB, writes the result back into the cache. Replication keeps reads available during failover; consistent hashing limits the keys that move when topology changes.',
  },
  {
    id: 'rate-limiter',
    number: 9,
    title: 'Rate Limiter',
    topic: 'Infrastructure',
    prompt:
      "Throttle requests per API key so a single tenant can't exhaust shared capacity. Must be fast enough to sit in the request path and consistent across many gateway nodes.",
    palette: ['client', 'api_gateway', 'rate_limiter', 'cache', 'web_server'],
    requiredComponents: ['client', 'api_gateway', 'rate_limiter', 'cache', 'web_server'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'rate_limiter'],
      ['rate_limiter', 'cache'],
      ['api_gateway', 'web_server'],
    ],
    hints: [
      'Counters per API key need to be shared across all gateway instances — store them somewhere central and fast.',
      'Algorithms vary in fairness: fixed window (cheap), sliding window (smoother), token bucket (burst-friendly).',
      'Use atomic operations on Redis (INCR + EXPIRE, or a Lua script for the token-bucket variant) to avoid race conditions.',
    ],
    solution:
      'Every gateway calls the rate-limiter on the request hot path. The limiter increments a Redis counter for `(api_key, window)` atomically; if the result exceeds the quota, it returns reject and the gateway returns 429 without ever forwarding upstream. For burst tolerance, swap the fixed-window counter for a token-bucket Lua script in Redis. The actual app servers behind the gateway only see allowed traffic, so they stay protected.',
  },
  {
    id: 'web-crawler',
    number: 10,
    title: 'Web Crawler',
    topic: 'Pipeline',
    prompt:
      'Crawl a large portion of the web politely and store the parsed results. Avoid re-fetching pages you have already seen.',
    palette: ['url_frontier', 'fetcher', 'parser', 'deduper', 'object_storage', 'metadata_db'],
    requiredComponents: ['url_frontier', 'fetcher', 'parser', 'deduper', 'object_storage'],
    requiredConnections: [
      ['url_frontier', 'fetcher'],
      ['fetcher', 'parser'],
      ['parser', 'deduper'],
      ['deduper', 'object_storage'],
      ['parser', 'url_frontier'],
    ],
    hints: [
      'Treat the URL frontier as a queue, not a list. Politeness rules (per-host rate limits) belong inside it.',
      "Dedup by URL hash, then by content hash — both matter, since pages can have multiple URLs and rotating duplicates.",
      'New URLs discovered in parsing feed back into the frontier — that’s the loop that makes it a crawler.',
    ],
    solution:
      'The frontier hands URLs to fetcher workers under per-host rate limits. Fetchers pull bytes and hand them to parsers, which extract links and text. The deduper hashes URLs and content to skip seen pages, then writes the parsed result to object storage (with a row in the metadata DB linking URL → object key). Newly discovered links go back into the frontier, completing the BFS-style crawl. Frontiers, fetchers, parsers, and dedupers all scale independently.',
  },
  {
    id: 'notification-service',
    number: 11,
    title: 'Notification Service',
    topic: 'Infrastructure',
    prompt:
      "Dispatch push notifications, emails, and SMS to millions of users. A single API call may fan out to several channels. Failed deliveries must retry without double-sending, and a chatty system shouldn't flood a single user.",
    palette: [
      'client',
      'web_server',
      'message_queue',
      'worker',
      'notification_service',
      'database',
      'cache',
      'rate_limiter',
    ],
    requiredComponents: [
      'client',
      'web_server',
      'message_queue',
      'worker',
      'notification_service',
      'database',
    ],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      'Each channel (push, email, SMS) has its own latency, failure modes, and provider quirks — give them their own queue + workers so a slow vendor never stalls the others.',
      "Idempotency: dedupe by (user_id, notification_id) before sending or retries will double-ping users.",
      "Per-user rate limits should sit in front of the dispatcher, not after — once the SMS has gone out you can't take it back.",
    ],
    solution:
      'The API writes the notification record to the DB and publishes a job per channel onto channel-specific queues. Workers consume each queue and call the appropriate adapter (FCM/APNS for push, SES for email, Twilio for SMS) through the notification service. A Redis set of dedupe keys with TTL prevents retries from double-sending. The rate limiter caps each user to N notifications per hour to avoid spam. Failures requeue with exponential backoff; permanent failures (invalid token, hard bounce) mark the channel disabled on the user record.',
  },
  {
    id: 'job-scheduler',
    number: 12,
    title: 'Distributed Job Scheduler',
    topic: 'Infrastructure',
    prompt:
      'Run millions of scheduled jobs across a fleet of workers — one-shot or recurring. The same job must not run twice when nodes contend; a crashed worker must not strand a job forever.',
    palette: ['client', 'web_server', 'database', 'message_queue', 'worker', 'cache'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['database', 'worker'],
      ['worker', 'message_queue'],
      ['message_queue', 'worker'],
    ],
    hints: [
      'Index the jobs table by `next_run_at` so a single SELECT can pull everything that should fire in the next tick.',
      'Atomic claim: an UPDATE…WHERE status=pending sets the row to "claimed" in one round trip, so two pickers cannot grab the same job.',
      "Heartbeats from workers let a janitor process release claims that have gone stale — that's how a crashed worker stops blocking the job forever.",
    ],
    solution:
      'Job specs live in a database table keyed by `next_run_at` with a `status` column. A scheduler process polls every second for `pending` rows whose time has arrived and atomically flips them to `claimed` with the picker\'s ID. The picker enqueues each claimed job onto a work queue; downstream workers consume, execute, and report success. For recurring jobs the picker re-computes `next_run_at` and resets the row to `pending`. Worker heartbeats refresh a claim timestamp; a janitor releases claims older than a threshold so a crashed worker never leaves a job stranded.',
  },
  {
    id: 'observability-pipeline',
    number: 13,
    title: 'Logging & Metrics Pipeline',
    topic: 'Pipeline',
    prompt:
      'Collect logs and metrics from thousands of production hosts. Engineers should be able to grep raw logs from the last week and chart any metric back to a month ago. Cost matters: most of the volume is rarely read.',
    palette: [
      'agent',
      'message_queue',
      'worker',
      'search_index',
      'time_series_db',
      'object_storage',
      'web_server',
      'client',
    ],
    requiredComponents: [
      'agent',
      'message_queue',
      'worker',
      'search_index',
      'time_series_db',
      'object_storage',
    ],
    requiredConnections: [
      ['agent', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'search_index'],
      ['worker', 'time_series_db'],
      ['worker', 'object_storage'],
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'time_series_db'],
    ],
    hints: [
      'Push, do not poll. A small agent on every host tails files and pre-aggregates metrics, then streams to a high-throughput broker.',
      'Logs (text) and metrics (numbers) want very different storage — inverted index for free-text search, time-series store for charts.',
      'Hot vs cold: keep the last week in the index for live debugging; archive everything else to object storage and rehydrate on demand.',
    ],
    solution:
      'A lightweight agent runs on each host, tailing log files and sampling metric counters. Agents publish to a Kafka-style broker partitioned by service. Stream-processing workers split the firehose: log lines flow into a search index (inverted index on tokens), metric points are downsampled and written to a time-series DB, and every line is also batched into object storage for long-term archival. The UI calls a query layer that picks the right backend per query. Index retention is short and cheap; cold investigations rehydrate from object storage when needed.',
  },
  {
    id: 'typeahead-autocomplete',
    number: 14,
    title: 'Typeahead Autocomplete',
    topic: 'Search',
    prompt:
      'As a user types into a search box, suggest the top completions within 50ms. Suggestions reflect popularity, must update as trends shift, and the long tail is enormous.',
    palette: ['client', 'web_server', 'cache', 'search_index', 'database', 'message_queue', 'worker'],
    requiredComponents: ['client', 'web_server', 'cache', 'search_index', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'search_index'],
      ['worker', 'search_index'],
      ['worker', 'database'],
      ['message_queue', 'worker'],
    ],
    hints: [
      'A prefix trie (or Elasticsearch completion suggester) returns top-K for any prefix in O(prefix length), not O(corpus).',
      "The hottest prefixes get queried orders of magnitude more than the rest — cache their top-K results in front of the index.",
      'Build the index offline from query logs and ship it as a read-only artifact. Serving never has to look at raw logs.',
    ],
    solution:
      'A nightly batch job aggregates query logs into prefix → top-K-suggestion maps and ships the result to a search-index cluster (a trie at each leaf, or a managed completion suggester). At request time the API checks an in-memory cache for the exact prefix; misses fall through to the search index, which responds in single-digit ms. Streaming query events flow through a queue + worker for near-real-time index updates so trending searches surface fast. Personalised completions blend the global top-K with a user-specific recents list pulled from the DB.',
  },
  {
    id: 'ecommerce-checkout',
    number: 15,
    title: 'E-commerce Checkout & Inventory',
    topic: 'Marketplace',
    prompt:
      'Run the checkout flow for an online store: decrement stock, create the order, charge the card, fulfil the order. Two customers must never both succeed on the last unit, and a payment failure must never leave stock locked.',
    palette: [
      'client',
      'web_server',
      'database',
      'cache',
      'message_queue',
      'worker',
      'payment_processor',
      'notification_service',
    ],
    requiredComponents: [
      'client',
      'web_server',
      'database',
      'payment_processor',
      'message_queue',
      'notification_service',
    ],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'notification_service'],
    ],
    hints: [
      'Atomic stock decrement — a conditional UPDATE (`WHERE stock > 0`) avoids the lost-update race that lets two buyers grab the last unit.',
      'Payment is a side effect with cost. Use an idempotency key per attempt so a retried network call never double-charges.',
      'Outbox pattern: write the order row and an event row in the same DB transaction. A worker reads the outbox afterwards; that way the event and the data can never diverge.',
    ],
    solution:
      'The API receives the order, runs `UPDATE products SET stock = stock - qty WHERE id = ? AND stock >= qty` — if zero rows match, fail fast. In the same transaction it writes an `order` row and an `outbox` row describing an `order.created` event. A worker reads from the outbox and calls the payment processor with the order ID as idempotency key. On success it emits `payment.captured`, which fans out to fulfilment, warehouse pick, and the notification service for the receipt email. On failure, a compensating action restores stock — a saga that keeps the system eventually consistent without holding locks across the payment call.',
  },
  {
    id: 'leaderboard',
    number: 16,
    title: 'Real-time Leaderboard',
    topic: 'Realtime',
    prompt:
      'Show the top 100 players globally plus the current user’s rank, updated within seconds as scores change. Millions of players, billions of updates per day.',
    palette: ['client', 'web_server', 'cache', 'database', 'message_queue', 'worker', 'ws_gateway'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'ws_gateway'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
      ['ws_gateway', 'client'],
      ['ws_gateway', 'cache'],
    ],
    hints: [
      'A Redis sorted set gives O(log n) ZADD on score update and O(log n + k) ZREVRANGE for top-K — the exact operations a leaderboard needs.',
      "Persisting every update to a relational DB on the hot path is the wrong call; emit them to a queue and let workers catch up async.",
      "Subscribers should be pushed, not polled. WebSockets fan out top-N deltas so clients don't poll a counter that hasn't changed.",
    ],
    solution:
      'Score updates land at the API, which writes to a Redis sorted set keyed by leaderboard ID. Top-N reads are ZREVRANGE; individual rank is ZREVRANK in O(log n). The update is also published to a queue; workers persist to a relational DB for replay, analytics, and durability if Redis is lost. Clients hold a WebSocket to a gateway and subscribe to leaderboard channels; when the cached top-N changes the gateway broadcasts the diff. Hot leaderboards partition by region or game to spread load.',
  },
  {
    id: 'cloud-file-storage',
    number: 17,
    title: 'Cloud File Storage',
    topic: 'Media',
    prompt:
      'Sync a user’s files across all their devices. Files can be tens of GB. Storage cost matters; identical chunks shared across users should be stored once.',
    palette: [
      'client',
      'web_server',
      'object_storage',
      'database',
      'message_queue',
      'worker',
      'deduper',
      'bloom_filter',
    ],
    requiredComponents: ['client', 'web_server', 'object_storage', 'database', 'deduper', 'bloom_filter'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['client', 'object_storage'],
      ['object_storage', 'deduper'],
      ['deduper', 'database'],
      ['web_server', 'bloom_filter'],
    ],
    hints: [
      'Chunk files into fixed-size blocks and hash each one. The same chunk reused across files (or users) gets stored once.',
      'A bloom filter in front of the chunk store gives a fast "definitely not present" answer — cheap negative lookups before hitting the DB.',
      'Metadata is small and relational (file → ordered list of chunk hashes). Bytes are huge and content-addressed (hash → object).',
    ],
    solution:
      'The client splits each file into 4MB blocks and computes a SHA-256 per block. It asks the API which hashes already exist — the API consults the bloom filter for the no-path and the DB for confirmation. Missing blocks are PUT directly to object storage by hash. The API writes a metadata row mapping `file_id → ordered list of chunk hashes`. Reads reverse the path: fetch metadata, then fetch only the chunks the client doesn’t already have locally. A periodic deduper sweeps object storage against the DB to reclaim orphaned chunks. Encryption happens client-side with per-user keys before upload.',
  },
  {
    id: 'payment-processing',
    number: 18,
    title: 'Payment Processing',
    topic: 'Marketplace',
    prompt:
      'Charge customer cards safely. The system must be idempotent under retries, never double-charge on a network blip, and survive a third-party processor outage without losing transactions.',
    palette: [
      'client',
      'api_gateway',
      'web_server',
      'database',
      'message_queue',
      'worker',
      'payment_processor',
      'notification_service',
    ],
    requiredComponents: [
      'client',
      'api_gateway',
      'web_server',
      'database',
      'payment_processor',
      'message_queue',
    ],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'notification_service'],
    ],
    hints: [
      'Idempotency keys on every charge request are non-negotiable — if the client retries you must return the original result, not run a fresh charge.',
      'Outbox pattern keeps the ledger entry and the event emit atomic. The user is told "captured" only after both are durable.',
      'PCI scope: never store raw card numbers. The processor returns an opaque token your DB stores in place of the card.',
    ],
    solution:
      'A request arrives with an `Idempotency-Key` header. The API writes a `payment_attempt` row keyed on that header inside a transaction — if the row already exists, return its outcome verbatim. Otherwise it calls the payment processor, then writes a ledger entry plus an outbox row recording `payment.captured` in the same transaction. A worker reads the outbox and notifies the user via the notification service. Cards are tokenised by the processor; the DB only stores the token plus last-4 and brand. Failed charges retry with exponential backoff up to N attempts; permanent failures emit `payment.failed` for ops/customer-service review.',
  },
  {
    id: 'search-engine',
    number: 19,
    title: 'Web Search Engine',
    topic: 'Search',
    prompt:
      'Build a Google-scale search engine: index billions of documents and serve relevance-ranked results in under 200ms. The query mix is heavy-tailed — a small slice of queries dominates the load.',
    palette: [
      'client',
      'web_server',
      'cache',
      'search_index',
      'url_frontier',
      'fetcher',
      'parser',
      'ranking_service',
      'object_storage',
    ],
    requiredComponents: [
      'client',
      'web_server',
      'search_index',
      'ranking_service',
      'url_frontier',
      'fetcher',
      'parser',
    ],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'search_index'],
      ['search_index', 'ranking_service'],
      ['url_frontier', 'fetcher'],
      ['fetcher', 'parser'],
      ['parser', 'search_index'],
      ['parser', 'object_storage'],
    ],
    hints: [
      'Inverted index: term → posting list of docIDs. Shard by docID so each shard owns an independent slice of the corpus.',
      'Queries are scatter-gather: ask every shard for its top-K, then merge + re-rank at the aggregator.',
      "Caching the result page for popular queries is huge — a small slice of queries makes up most of the load.",
    ],
    solution:
      'A crawler pipeline (frontier → fetcher → parser) writes raw docs to object storage and ships parsed text to indexer workers. Indexers build an inverted index sharded by docID across many index nodes. At query time the API runs scatter-gather: each shard returns its top-K candidates against the query, an aggregator merges them, and a ranking service re-scores using richer features (TF-IDF, query-doc embeddings, click-through rate). A query cache in front of the whole thing absorbs the head of the long-tail. Replicas per shard handle read scale and provide failover; shards are added as the corpus grows.',
  },
  {
    id: 'game-server',
    number: 20,
    title: 'Multiplayer Game Server',
    topic: 'Realtime',
    prompt:
      'Run an online battle arena: up to 100 players share a match, server tick rate is 60Hz, and latency above ~80ms feels bad. Matches must end consistently and persistent rewards must save.',
    palette: ['client', 'ws_gateway', 'game_server', 'cache', 'database', 'matching_service'],
    requiredComponents: ['client', 'ws_gateway', 'game_server', 'database', 'matching_service'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'matching_service'],
      ['matching_service', 'game_server'],
      ['ws_gateway', 'game_server'],
      ['game_server', 'cache'],
      ['game_server', 'database'],
    ],
    hints: [
      'The server is authoritative — clients send inputs, the server runs the simulation, then broadcasts state at a fixed tick.',
      'Matchmaking is its own service: it pools waiting players by region and skill and hands a roster to a game server.',
      'In-match state lives in memory; only the end-of-match results (winners, XP, item drops) hit the durable DB.',
    ],
    solution:
      'Players connect to a WS gateway and request a match. The matchmaking service pools waiting players by skill + region and assigns a roster to a game-server instance. The game server runs the simulation at ~60Hz, receives inputs from clients via the gateway, advances state, and broadcasts snapshots back. In-match state lives in process memory (and a hot cache for crash recovery); only the final result writes to the durable DB. Lag compensation rewinds the simulation to the client’s viewpoint when processing late inputs; client-side prediction hides round-trip latency.',
  },
  {
    id: 'live-streaming',
    number: 21,
    title: 'Live Streaming (Twitch)',
    topic: 'Media',
    prompt:
      'A streamer broadcasts to tens of thousands of concurrent viewers in real time. Viewer end-to-end latency should be a few seconds; chat must feel instant.',
    palette: [
      'client',
      'web_server',
      'transcoder',
      'object_storage',
      'cdn',
      'ws_gateway',
      'message_queue',
      'worker',
    ],
    requiredComponents: ['client', 'transcoder', 'cdn', 'web_server', 'ws_gateway', 'message_queue'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'transcoder'],
      ['transcoder', 'object_storage'],
      ['object_storage', 'cdn'],
      ['client', 'cdn'],
      ['client', 'ws_gateway'],
      ['ws_gateway', 'message_queue'],
      ['message_queue', 'worker'],
    ],
    hints: [
      'Ingest with RTMP from the streamer, then transcode into low-latency HLS at several bitrates so any viewer’s player can adapt.',
      'A CDN is non-negotiable — a single origin cannot fan out tens of thousands of segment requests per stream.',
      'Chat is its own pipeline. WebSockets + a pub/sub broker fan out messages; the video path stays clean.',
    ],
    solution:
      'The streamer pushes RTMP to an ingest server. A transcoder produces LL-HLS segments at multiple bitrates and writes them to object storage. The CDN pulls segments from object storage on demand and caches at edges nearest each viewer; viewers fetch the manifest from the API and segments straight from the CDN. Chat runs in parallel: viewers hold a WebSocket to the WS gateway, chat messages publish to a per-channel topic in the broker, and gateways subscribed to the topic forward to connected viewers. Moderation workers consume the same topic and act on banned words or rate violations.',
  },
  {
    id: 'distributed-counter',
    number: 22,
    title: 'Distributed Counter / Analytics',
    topic: 'Pipeline',
    prompt:
      'Count billions of events per day — ad clicks, video views, page hits — and roll them up into per-minute, per-hour, and per-day buckets. Live counters power the dashboard; historical charts power analysis.',
    palette: [
      'client',
      'web_server',
      'message_queue',
      'worker',
      'time_series_db',
      'cache',
      'database',
    ],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'cache'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'time_series_db'],
      ['worker', 'cache'],
      ['web_server', 'cache'],
    ],
    hints: [
      'Never write one DB row per event. Buffer in the queue, aggregate in flight in the workers.',
      'Probabilistic structures (HyperLogLog for cardinality, Count-Min for top-K) handle billions of items in bounded memory.',
      'Two read paths: a Redis counter for "right now" and a time-series DB for everything older than a minute.',
    ],
    solution:
      'Tracking pixels POST events to the API, which publishes to a Kafka-style queue partitioned by event key. Stream-processing workers consume in micro-batches, aggregate into per-minute rollups, and write to a time-series DB; they also bump a Redis counter for "events in the last N seconds." HyperLogLog sketches handle uniques (DAU/MAU) without storing every user ID. The UI queries Redis for the live dashboard and the time-series DB for historical charts. Late events flow through a small reprocessing window so the rollups stay accurate even with clock skew.',
  },
  {
    id: 'pubsub-broker',
    number: 23,
    title: 'Pub/Sub Message Broker',
    topic: 'Infrastructure',
    prompt:
      'Build a durable pub/sub system like Kafka: producers append to topics, consumers read in order, messages survive node failures, and a slow consumer must not stall a fast one.',
    palette: ['client', 'message_queue', 'replica', 'worker', 'database'],
    requiredComponents: ['client', 'message_queue', 'replica', 'worker', 'database'],
    requiredConnections: [
      ['client', 'message_queue'],
      ['message_queue', 'replica'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      'Split each topic into partitions for parallelism. Producers hash on a key so that all messages for that key land in order.',
      'Replication factor ≥ 3 with a leader per partition gives you durability and quick failover.',
      'Consumer offsets are state — store them with the broker, not on the consumer, so a restarted consumer picks up where it left off.',
    ],
    solution:
      'Producers send messages keyed for a topic; the broker routes by `hash(key) % partitions` and appends to that partition\'s log file. Each partition has a leader and ≥2 followers replicating writes synchronously to commit. Consumers join a consumer group; the broker assigns partitions across the group so each partition has exactly one consumer (which preserves per-key ordering). Consumer offsets are stored in an internal compacted topic and durably written to a metadata DB. Leader election (Raft or Zookeeper-backed) handles partition leader failover. Retention is by time or size; segments older than the retention window are deleted on a rolling basis.',
  },
  {
    id: 'collaborative-doc',
    number: 24,
    title: 'Collaborative Document',
    topic: 'Realtime',
    prompt:
      'Many users edit the same document concurrently in real time. Edits made while offline should merge cleanly when the client reconnects. Cursor positions and presence are visible to everyone.',
    palette: ['client', 'ws_gateway', 'collab_engine', 'database', 'object_storage', 'cache'],
    requiredComponents: ['client', 'ws_gateway', 'collab_engine', 'database'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'collab_engine'],
      ['collab_engine', 'cache'],
      ['collab_engine', 'database'],
      ['collab_engine', 'object_storage'],
    ],
    hints: [
      'Either Operational Transformation or CRDT. CRDTs commute by construction, which makes offline merge much easier to get right.',
      'Pin each open document to a single engine instance — it holds the in-memory state and arbitrates every edit for that doc.',
      'Snapshot periodically and append ops between snapshots to an op log. Replaying snapshot + ops reconstructs any version.',
    ],
    solution:
      'Each open document is routed (consistent hash on doc_id) to one collab-engine instance, which holds the CRDT state in memory. Clients connect via the WS gateway, send deltas (operations) tagged with their causal context, and the engine merges + broadcasts to everyone else watching. Every N operations or M seconds the engine snapshots the state into the DB; the op log between snapshots flushes to object storage for cheap replay history. When a client reconnects after offline edits it ships its pending ops; the engine merges them into the current state and rebroadcasts. Presence + cursors ride the same WS channel as a lightweight ephemeral message.',
  },
  {
    id: 'recommendation-service',
    number: 25,
    title: 'Recommendation Service',
    topic: 'ML',
    prompt:
      'Show personalised home-screen recommendations to every user — movies, shows, products, whatever the catalog is. New users see something reasonable on day one; long-tenured users see content tuned to their taste.',
    palette: [
      'client',
      'web_server',
      'cache',
      'database',
      'message_queue',
      'worker',
      'recommendation_engine',
      'search_index',
    ],
    requiredComponents: [
      'client',
      'web_server',
      'cache',
      'recommendation_engine',
      'database',
      'worker',
    ],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'recommendation_engine'],
      ['recommendation_engine', 'database'],
      ['recommendation_engine', 'search_index'],
      ['worker', 'recommendation_engine'],
      ['message_queue', 'worker'],
    ],
    hints: [
      'Two-stage retrieval: cheap candidate generation (collaborative filtering or embedding ANN) then a heavier ranking model on the short list.',
      'Precompute per-user top-K offline; serve from cache. Real-time signals (this session, current device) re-rank a small candidate set.',
      'Cold-start needs a fallback — popularity, content-based features, or trending — until enough signal exists to personalise.',
    ],
    solution:
      'A nightly batch pipeline trains a collaborative-filtering model on watch/view history and emits per-user candidate lists (~500 items) into a Redis cache. At request time the API pulls the candidate list, hands it to a ranking model that scores using real-time features (current device, time of day, ongoing session), and returns the top 20. New users see a popularity-blended fallback derived from content features served by the search index until enough interactions land. Worker pipelines refresh the model on user interactions consumed off a queue; offline metrics (CTR, watch-through rate) feed back into the next training cycle.',
  },
  {
    id: 'distributed-lock',
    number: 26,
    title: "Distributed Lock Service",
    topic: "Infrastructure",
    prompt:
      "Design a service that lets many clients across different machines acquire a mutually-exclusive lock on a named resource. Only one holder may own a lock at a time, locks must auto-expire if the holder crashes, and the service itself must survive node failures without ever granting the same lock twice.",
    palette: ['client', 'web_server', 'cache', 'replica', 'database', 'load_balancer'],
    requiredComponents: ['client', 'web_server', 'cache', 'replica', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['cache', 'replica'],
      ['web_server', 'database'],
    ],
    hints: [
      "A lock is just a key with a single owner and a TTL — an atomic compare-and-set (SET key owner NX PX ttl) in fast in-memory storage is the core primitive.",
      "Auto-expiry via TTL protects you from a holder that crashes while holding the lock; the client must renew (heartbeat) before expiry if it needs to keep the lock.",
      "A single lock node is a single point of failure — replicate the state so a promoted replica keeps the ownership record, and persist a durable record for audit/recovery.",
    ],
    solution:
      "Clients ask the lock service (behind a load balancer) to acquire a named lock. The API server performs an atomic compare-and-set against an in-memory store: SET lock:<name> <owner_token> NX PX <ttl>. Success means the caller owns the lock until the TTL expires; the client heartbeats to extend it and issues a release (checking the owner token first) when done, so it never frees someone else's lock. The cache runs primary plus replica so a crash promotes the replica without losing ownership state, and a fencing token (monotonically increasing) is handed out on each grant so stale holders are rejected downstream. A durable database keeps a record of grants for auditing and recovery. TTL-based expiry guarantees a crashed holder's lock is eventually reclaimed, preventing permanent deadlock.",
  },
  {
    id: 'ad-click-aggregator',
    number: 27,
    title: "Ad Click Aggregator",
    topic: "Pipeline",
    prompt:
      "Design a system that ingests a firehose of ad-click events and produces near-real-time aggregated counts (clicks per ad, per minute) for advertiser dashboards. Ingest volume is enormous and bursty, some duplicate events will arrive, and dashboards should reflect fresh data within seconds.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'deduper', 'cache'],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'deduper'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'deduper'],
      ['worker', 'time_series_db'],
      ['client', 'cache'],
    ],
    hints: [
      "Never write raw clicks straight to the database — buffer them in a queue so ingest spikes don't overwhelm the aggregation layer.",
      "Each click carries an event ID; a deduper (e.g. a set/bloom filter keyed by event ID within a window) drops replays before they inflate counts.",
      "Aggregate in tumbling time windows (per-minute) inside the worker and write rollups to a time-series store; dashboards read the pre-aggregated buckets from a cache.",
    ],
    solution:
      "The ingestion API accepts click events and immediately publishes them to a partitioned message queue, decoupling the bursty firehose from downstream processing. Stream workers consume from the queue, and for each event first consult the deduper (a windowed set or bloom filter keyed on event ID) to discard duplicates and late replays. Surviving events are aggregated into tumbling per-minute windows keyed by ad ID and flushed as rollups into a time-series database. Advertiser dashboards read pre-aggregated buckets served from a cache for sub-second latency rather than scanning raw events. Partitioning by ad ID lets workers scale horizontally, and the queue provides replay and back-pressure so no clicks are lost during spikes.",
  },
  {
    id: 'food-delivery-system',
    number: 28,
    title: "Food Delivery System",
    topic: "Marketplace",
    prompt:
      "Design a platform where customers order from nearby restaurants and a courier is dispatched to pick up and deliver the food. The system must match orders to available couriers based on live location, process payment, and push status updates (order accepted, picked up, delivered) to the customer in real time.",
    palette: ['client', 'driver', 'web_server', 'location_service', 'matching_service', 'payment_processor', 'notification_service', 'database'],
    requiredComponents: ['client', 'driver', 'web_server', 'location_service', 'matching_service', 'payment_processor', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['driver', 'web_server'],
      ['web_server', 'payment_processor'],
      ['web_server', 'matching_service'],
      ['matching_service', 'location_service'],
      ['web_server', 'database'],
      ['web_server', 'notification_service'],
    ],
    hints: [
      "Separate the three concerns: placing/paying for the order, dispatching a courier, and streaming status back to the customer.",
      "Courier positions change constantly — keep them in a geo-indexed location service, not the transactional order database.",
      "The matching service pulls nearby available couriers from the location service, scores them (distance, current load, ETA), and assigns; status changes fan out through a notification service.",
    ],
    solution:
      "A customer places an order through the API server, which charges the customer via the payment processor and writes the order to the transactional database once payment authorizes. Couriers stream their GPS positions into a geo-indexed location service, kept separate from the order DB so the hot location writes don't contend with order transactions. When a restaurant accepts, the API calls the matching service, which queries the location service for nearby idle couriers, scores candidates by distance/ETA/current load, and assigns one, recording the assignment in the database. Every state transition (accepted, picked up, en route, delivered) is pushed through the notification service to the customer's client. This split lets the marketplace scale each axis independently: payments, dispatch, and real-time updates.",
  },
  {
    id: 'hotel-reservation',
    number: 29,
    title: "Hotel Reservation System",
    topic: "Marketplace",
    prompt:
      "Design a system to search hotel availability and book rooms. The critical constraint is correctness under concurrency: the same room-night must never be double-booked even when many users check out simultaneously, while search over availability and amenities stays fast.",
    palette: ['client', 'web_server', 'cache', 'database', 'search_index', 'payment_processor', 'load_balancer'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'search_index', 'payment_processor'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
    ],
    hints: [
      "Split the read-heavy search path from the write-heavy, correctness-critical booking path — they have opposite requirements.",
      "Search runs against a denormalized search index (rooms, dates, amenities, price); it can be slightly stale, so cache popular queries.",
      "Booking must be transactional: reserve the specific room-night with an atomic conditional update (or SELECT ... FOR UPDATE) so two payments can't claim the same inventory.",
    ],
    solution:
      "Search and booking are deliberately separated. The search path runs queries against a denormalized search index of rooms, dates, amenities and price, with popular result sets cached and served behind a load balancer; slight staleness is acceptable here. The booking path is strictly transactional: when a user confirms, the API server opens a database transaction that atomically checks-and-decrements the specific room-night inventory (conditional update or row lock), so concurrent requests for the last room serialize and only one wins. Payment is authorized through the payment processor as part of the reservation flow, and the transaction commits only if inventory reservation and payment both succeed, otherwise it rolls back and releases the hold. Availability changes are propagated asynchronously back into the search index. This isolates the fast, eventually-consistent read side from the slow, strongly-consistent write side that guarantees no double-booking.",
  },
  {
    id: 'stock-trading-exchange',
    number: 30,
    title: "Stock Trading Exchange",
    topic: "Realtime",
    prompt:
      "Design the core of an electronic exchange that accepts buy/sell orders and matches them into trades. Orders must be matched deterministically by price-time priority with very low latency, every order and fill must be durably recorded, and market data (order book, executed trades) must stream to clients in real time.",
    palette: ['client', 'api_gateway', 'matching_service', 'message_queue', 'database', 'ws_gateway', 'time_series_db', 'cache'],
    requiredComponents: ['client', 'api_gateway', 'matching_service', 'message_queue', 'database', 'ws_gateway'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'matching_service'],
      ['matching_service', 'message_queue'],
      ['message_queue', 'database'],
      ['message_queue', 'ws_gateway'],
      ['ws_gateway', 'client'],
    ],
    hints: [
      "The matching engine (order book) is the heart: keep it single-threaded per symbol and in-memory so matching is deterministic and microsecond-fast.",
      "Match by price-time priority — best price first, then earliest arrival — and emit a fill event for every match.",
      "Fan out the resulting trade/order-book events through a queue: one consumer persists durably, another streams market data to clients over WebSockets.",
    ],
    solution:
      "Orders enter through the API gateway (which handles auth and validation) and are routed to the matching service. The matching engine keeps an in-memory order book per symbol, processed single-threaded so matching is fully deterministic under price-time priority: incoming orders cross against the best-priced resting orders, oldest first, generating fill events. Every accepted order and every fill is published to a durable, sequenced message queue, which acts as the source of truth. Downstream consumers fan out from that log: one writes orders and trades into the database (and a time-series store for tick history) for durability and audit, while another feeds the WebSocket gateway that streams order-book updates and executed trades to clients in real time. A cache holds the current top-of-book for fast snapshot delivery on connect. Because the queue is an ordered, replayable log, the exchange can recover the exact book state after a crash by replaying events.",
  },
  {
    id: 'distributed-commit-log',
    number: 31,
    title: "Distributed Commit Log",
    topic: "Infrastructure",
    prompt:
      "Build an append-only commit log (think Kafka) that ingests high-volume event streams and lets many consumers read them independently. Writes must be durable and ordered within a partition, and the system must survive broker failures without losing committed records.",
    palette: ['client', 'load_balancer', 'message_queue', 'worker', 'replica', 'database', 'cache'],
    requiredComponents: ['client', 'load_balancer', 'message_queue', 'replica', 'worker'],
    requiredConnections: [
      ['client', 'load_balancer'],
      ['load_balancer', 'message_queue'],
      ['message_queue', 'replica'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      "Partition the log so writes scale horizontally; ordering only needs to hold within a partition, not across the whole topic.",
      "Durability comes from replication: each partition has a leader and follower replicas that acknowledge writes before a record is considered committed.",
      "Consumers track their own offset and pull at their own pace, so a slow consumer never blocks producers or other readers.",
    ],
    solution:
      "Producers connect through a load balancer that routes each record to the partition leader (a message-queue broker) chosen by the record key. The leader appends the record to its on-disk segment and replicates it to follower replicas; once a quorum of replicas acknowledge, the offset is marked committed and returned to the producer. Consumers (workers) pull from a partition starting at their stored offset, and periodically checkpoint their committed offset into a durable database so they can resume after a crash. Because each partition is an ordered, replicated, append-only sequence, ordering and durability hold per-partition while total throughput scales with partition count. On a leader failure, one of the in-sync replicas is promoted, preserving all committed records.",
  },
  {
    id: 'feature-flag-service',
    number: 32,
    title: "Feature Flag Service",
    topic: "Infrastructure",
    prompt:
      "Design a service that lets teams toggle features and run percentage rollouts without redeploying. Client SDKs evaluate flags on nearly every request, so reads must be extremely fast and flag changes should propagate to all clients within seconds.",
    palette: ['client', 'api_gateway', 'web_server', 'cache', 'database', 'message_queue', 'worker'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'message_queue'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'client'],
    ],
    hints: [
      "Flag evaluation is on the hot path — clients should evaluate locally against a cached ruleset, not call your server per request.",
      "The database is the source of truth for flag rules, but reads should be served from a cache to keep evaluation latency near zero.",
      "Propagate changes with a push channel (streaming/pub-sub) so SDKs refresh their local ruleset within seconds instead of polling constantly.",
    ],
    solution:
      "Flag definitions and targeting rules live in a database as the source of truth. The API server serves the current ruleset from an in-memory cache, so client SDKs can fetch the full evaluation bundle in one fast request and then evaluate flags locally on every user request. When an operator changes a flag, the API writes to the database and publishes the update onto a message queue / pub-sub channel; connected client SDKs receive the delta and refresh their local ruleset within seconds, falling back to periodic polling if the stream drops. Percentage rollouts are done deterministically by hashing the user ID against the flag's bucket, so the same user always gets a stable assignment. Keeping evaluation client-side plus cache-fronted reads makes the common path effectively zero added latency.",
  },
  {
    id: 'nearby-places',
    number: 33,
    title: "Nearby Places Search",
    topic: "Search",
    prompt:
      "Build a service that returns points of interest near a user's coordinates, ranked by distance and relevance. The place catalog is mostly static but huge, and 'find everything within N km of this lat/long' queries must return in milliseconds.",
    palette: ['client', 'api_gateway', 'location_service', 'search_index', 'cache', 'database', 'ranking_service'],
    requiredComponents: ['client', 'api_gateway', 'location_service', 'search_index', 'database'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'location_service'],
      ['location_service', 'search_index'],
      ['location_service', 'database'],
      ['api_gateway', 'cache'],
    ],
    hints: [
      "A plain lat/long column can't answer radius queries fast — you need a spatial index (geohash, quadtree, or H3 cells).",
      "Split the problem: a geo/location service narrows candidates to nearby cells, then you enrich and rank those candidates.",
      "Popular areas get the same queries repeatedly; cache results keyed by rounded location + radius to shed load.",
    ],
    solution:
      "Client requests hit an API gateway that first checks a cache keyed by a coarsened (lat, long, radius) tuple, since dense areas repeat the same queries. On a miss, the gateway calls the location service, which uses a spatial search index (geohash or H3 buckets) to find candidate place IDs in the cells covering the requested radius. Those candidate IDs are hydrated with full details (name, hours, category) from the database and can be scored by a ranking service that blends distance with relevance signals like popularity and rating. The ranked list is written back to the cache with a short TTL. Because the place catalog is largely static, the spatial index can be precomputed and heavily replicated, keeping radius queries in the millisecond range.",
  },
  {
    id: 'live-comments',
    number: 34,
    title: "Live Comments",
    topic: "Realtime",
    prompt:
      "Design a live comment stream for events where thousands of viewers post and see comments in real time, like a livestream chat. New comments must appear near-instantly for all viewers, while also being persisted so late joiners can load recent history.",
    palette: ['client', 'ws_gateway', 'message_queue', 'worker', 'cache', 'database'],
    requiredComponents: ['client', 'ws_gateway', 'message_queue', 'worker', 'database'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
      ['worker', 'cache'],
    ],
    hints: [
      "Persistent WebSocket connections fan a new comment out to thousands of viewers far more efficiently than each client polling.",
      "Decouple broadcast from persistence with a queue, so a slow database write never delays delivery to viewers.",
      "Late joiners shouldn't hit the database for a cold read — keep a rolling window of recent comments in a cache.",
    ],
    solution:
      "Viewers hold a WebSocket to a WS gateway, subscribed to a given event/room. When someone posts, the gateway publishes the comment onto a message queue keyed by room ID rather than writing synchronously. A worker consumes the queue, persists the comment to the database for durable history, appends it to a rolling recent-comments cache (a capped list keyed by room), and pushes it out to every gateway holding subscribers for that room, which broadcast to their connected clients. This keeps broadcast latency independent of database write latency. A late joiner loads the last N comments straight from the cache, then receives new ones live over the socket. Gateways scale horizontally, and the queue absorbs bursts when a stream spikes in popularity.",
  },
  {
    id: 'digital-wallet',
    number: 35,
    title: "Digital Wallet",
    topic: "Marketplace",
    prompt:
      "Build a digital wallet that holds user balances and moves money between accounts and to external payment rails. Transfers must be atomic and never double-spend, even under concurrent requests or retries, and every balance change must be auditable.",
    palette: ['client', 'api_gateway', 'web_server', 'database', 'message_queue', 'worker', 'payment_processor'],
    requiredComponents: ['client', 'api_gateway', 'web_server', 'database', 'payment_processor'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
      ['web_server', 'message_queue'],
    ],
    hints: [
      "Money movement must be exactly-once — use idempotency keys so a retried request can't apply the same transfer twice.",
      "Model balances as an append-only ledger of entries rather than mutating a single balance field; the balance is the sum of entries.",
      "External rails (card networks, banks) are slow and async — push those settlements through a queue and reconcile the result.",
    ],
    solution:
      "Requests enter through an API gateway to the wallet service (web server), which carries a client-supplied idempotency key so retries are safely deduplicated. Internal transfers are recorded as balanced double-entry rows in the database inside a single ACID transaction (debit one account, credit another), and the current balance is derived from the ledger, giving a full audit trail and preventing double-spend via row-level locking or an optimistic version check. For payouts to external rails, the service writes a pending ledger entry and enqueues a job onto a message queue; a worker calls the payment processor asynchronously and, on the callback, posts the settling ledger entry or a reversal. Because every state change is an immutable ledger entry keyed by idempotency, the system is atomic, auditable, and resilient to retries and concurrent access.",
  },
  {
    id: 'flash-sale-inventory',
    number: 36,
    title: "Flash Sale Inventory",
    topic: "Marketplace",
    prompt:
      "A limited batch of hot items goes on sale at a fixed second, and millions of buyers hit checkout at once. You must never oversell the stock, yet keep the request path fast enough that the flood does not topple the database. Fairness and correctness of the remaining count matter more than showing every user a spinner-free page.",
    palette: ['client', 'load_balancer', 'web_server', 'rate_limiter', 'cache', 'message_queue', 'worker', 'database'],
    requiredComponents: ['client', 'web_server', 'rate_limiter', 'cache', 'message_queue', 'worker', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'rate_limiter'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      "The database cannot take a write per buyer at peak. Hold the authoritative remaining count somewhere in-memory and atomic so decrements never race.",
      "Shed load before it reaches your stock logic: a rate limiter and admission control drop the obvious excess so only plausible winners get in.",
      "Decouple 'reserve a unit' from 'persist the order'. An atomic decrement in the cache decides the winner instantly; a queue + workers write the durable order behind it.",
    ],
    solution:
      "Buyers come in through a load-balanced fleet of API servers, each fronted by a rate limiter that sheds the obvious excess so only a survivable trickle reaches the stock logic. The authoritative remaining count lives in the cache as a single atomic counter (Redis DECR or a Lua script); a buyer who decrements it above zero has won a unit, everyone else is instantly told sold out without ever touching the database. Winning reservations are published to a message queue, and workers drain the queue to write durable order rows to the database at a rate it can absorb. Because the winner decision is a single atomic in-memory op, you cannot oversell even under a million concurrent requests, and the slow durable path is fully decoupled from the hot path.",
  },
  {
    id: 'movie-ticket-booking',
    number: 37,
    title: "Movie Ticket Booking",
    topic: "Marketplace",
    prompt:
      "Users pick specific seats for a showtime and pay. Two people must never end up holding the same seat, and a seat that someone is mid-checkout on should be held briefly then released if they abandon. Payment happens before the booking is confirmed.",
    palette: ['client', 'web_server', 'cache', 'database', 'message_queue', 'payment_processor', 'notification_service'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'payment_processor'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
      ['web_server', 'message_queue'],
      ['message_queue', 'notification_service'],
    ],
    hints: [
      "Seat selection is a distributed lock problem: only one session may hold a seat at a time, and the hold must expire on its own.",
      "Use a short-TTL reservation in the cache to hold seats during checkout, and the database as the durable source of truth once payment clears.",
      "Confirm the booking only after the payment processor returns success; if payment fails or the hold expires, release the seats back to the pool.",
    ],
    solution:
      "When a user selects seats, the API server places a short-TTL hold in the cache keyed by (showtime, seat) using an atomic set-if-absent, which acts as a distributed lock — a second user attempting the same seat is rejected immediately. The TTL guarantees abandoned checkouts auto-release without a cleanup job. The user then pays through the payment processor; only on a success callback does the API commit the booking to the database inside a transaction that re-validates the hold, then deletes the cache hold. If payment fails or the hold expires first, the seats fall back into the available pool. A confirmation event is dropped on a queue and consumed by the notification service to email the ticket, keeping that slow side-effect off the booking path.",
  },
  {
    id: 'snowflake-id-generator',
    number: 38,
    title: "Snowflake ID Generator",
    topic: "Infrastructure",
    prompt:
      "Produce unique, roughly time-ordered 64-bit IDs across a large fleet of servers, thousands per node per millisecond, with no central bottleneck on the hot path. IDs must be sortable by creation time and must never collide even if two machines mint at the same instant.",
    palette: ['client', 'web_server', 'id_generator', 'cache', 'database'],
    requiredComponents: ['client', 'web_server', 'id_generator', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'id_generator'],
      ['id_generator', 'database'],
      ['id_generator', 'cache'],
    ],
    hints: [
      "Compose the ID from independent fields so no coordination is needed per call: a timestamp, a machine id, and a per-millisecond sequence.",
      "The timestamp high bits make IDs time-sortable; the sequence counter disambiguates multiple IDs within the same millisecond on one node.",
      "The only shared state is assigning each generator a unique machine id at startup — persist that in a small store, then generate entirely in-process afterward.",
    ],
    solution:
      "Each ID generator builds a 64-bit value from three fields: a 41-bit millisecond timestamp (relative to a custom epoch) in the high bits, a ~10-bit machine id, and a ~12-bit per-millisecond sequence counter. Because the timestamp is most significant, IDs are monotonically increasing and sortable by creation time. Within a single millisecond a node increments its sequence counter; if it overflows, the generator spins until the next millisecond. The only coordination is one-time: at boot each generator claims a unique machine id from a durable store (the database), optionally cached for fast lookup. After that, generation is a purely in-process bit-packing operation with no network call, so throughput scales linearly with the fleet and there is no central bottleneck. Clock skew is handled by refusing to emit if the wall clock moves backward until time catches up.",
  },
  {
    id: 'social-follow-graph',
    number: 39,
    title: "Social Follow Graph",
    topic: "Social",
    prompt:
      "Model who-follows-whom for hundreds of millions of users and answer 'is A following B', 'list A's followers', and 'list who A follows' with low latency. Some accounts have tens of millions of followers, so a single row-per-edge scan will not do. Follows and unfollows are frequent writes.",
    palette: ['client', 'web_server', 'cache', 'database', 'message_queue', 'worker'],
    requiredComponents: ['client', 'web_server', 'cache', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      "Store the edge in both directions so both 'followers of X' and 'following of X' are direct lookups, not scans.",
      "Cache hot fan-out lists and the frequent 'does A follow B?' check; celebrity accounts make these reads extremely skewed.",
      "Keep the follow write on the fast path but push the expensive fan-out side-effects (counters, feed invalidation) onto a queue and workers.",
    ],
    solution:
      "The follow graph is stored as adjacency lists sharded by user id, and every edge is written twice — into A's 'following' list and B's 'followers' list — so both directions are O(1) partitioned lookups rather than scans. Hot accounts and frequent membership checks ('does A follow B?') are served from a cache; a Bloom-style or set membership entry answers the check without a database round trip. A follow request writes the two edges to the database on the request path, then enqueues a fan-out event; workers consume the queue to update follower counts and invalidate downstream caches asynchronously, keeping the write latency flat even for celebrity accounts with tens of millions of edges. Unfollows follow the same dual-write-then-fan-out pattern.",
  },
  {
    id: 'content-moderation-pipeline',
    number: 40,
    title: "Content Moderation Pipeline",
    topic: "Pipeline",
    prompt:
      "Every uploaded image, video, or post must be scanned for policy violations before or shortly after it goes live. Automated classifiers handle the bulk; borderline cases escalate to human reviewers. Throughput is huge and bursty, and the ingest path must not block on slow model inference.",
    palette: ['client', 'web_server', 'object_storage', 'message_queue', 'worker', 'ranking_service', 'database', 'agent'],
    requiredComponents: ['client', 'web_server', 'object_storage', 'message_queue', 'worker', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'object_storage'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
      ['worker', 'ranking_service'],
      ['worker', 'database'],
    ],
    hints: [
      "The upload path should just store the content and enqueue a job — never wait for a model to run.",
      "Score each item with automated classifiers; use the confidence to auto-approve, auto-block, or route to a human review queue.",
      "Keep every decision and its evidence in a durable store for appeals, audits, and retraining the models.",
    ],
    solution:
      "On upload the API server writes the raw content to object storage and drops a moderation job on a message queue, returning immediately so ingest never blocks on inference. Moderation workers pull jobs, fetch the bytes from object storage, and run them through classifiers via the ranking/scoring service, which returns per-policy confidence scores. High-confidence clean items are auto-approved and high-confidence violations auto-blocked; anything in the ambiguous middle band is written to a human-review queue in the database, where reviewers (or an assisting agent that pre-summarizes context) make the final call. Every decision, score, and reviewer action is persisted for appeals, audit trails, and as labeled data to retrain the models. The queue absorbs bursts and lets you scale worker count independently of upload volume.",
  },
  {
    id: 'bulk-email-service',
    number: 41,
    title: "Bulk Email Service",
    topic: "Pipeline",
    prompt:
      "Design a service that sends marketing and transactional emails to tens of millions of recipients per campaign. A single API call may enqueue millions of messages that must be delivered without overwhelming any downstream provider, and a crashed worker must not send the same email twice.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'notification_service', 'database', 'cache', 'rate_limiter'],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'notification_service', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'notification_service'],
      ['worker', 'database'],
    ],
    hints: [
      "Do not send inside the API request. Accept the campaign, persist it, and fan the recipient list out onto a queue so the send happens asynchronously.",
      "Idempotency matters: key each message by (campaign_id, recipient) and record delivery state so a re-delivered queue item never double-sends.",
      "Rate-limit per sending domain and per email provider so you respect their quotas and protect your sender reputation.",
    ],
    solution:
      "The client POSTs a campaign to the API server, which validates it and writes the campaign plus recipient list to the database. A fan-out step publishes one job per recipient (or per batch) onto a message queue. Worker pools consume the queue and hand each message to the notification service, which talks to email providers (SES/SendGrid) over SMTP or API. Each worker checks and updates a per-(campaign_id, recipient) delivery record in the database (or a Redis dedupe set) before sending, so retries after a crash are idempotent. A rate limiter throttles throughput per sending domain and per provider to stay within quotas and protect deliverability. Bounces and complaints flow back as webhooks that mark addresses suppressed. Workers, queues, and providers all scale independently, and failed sends requeue with exponential backoff.",
  },
  {
    id: 'ci-cd-deployment',
    number: 42,
    title: "CI/CD Deployment Pipeline",
    topic: "Pipeline",
    prompt:
      "Design a system that builds, tests, and deploys code every time a developer pushes to a repository. Builds must run in parallel across a fleet of workers, artifacts must be stored durably, and a slow or failing build must never block unrelated pipelines.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'object_storage', 'database', 'cache', 'notification_service'],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'object_storage', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
      ['worker', 'database'],
    ],
    hints: [
      "A push (webhook) should enqueue a build job, not run it inline — the API just accepts the trigger and records pipeline state.",
      "Runners are ephemeral, stateless workers pulling jobs off a queue; scale them horizontally so many builds run in parallel.",
      "Build outputs (binaries, images, test reports) are immutable artifacts — store them in object storage and keep only pointers + status in the database.",
    ],
    solution:
      "A git push fires a webhook to the API server, which creates a pipeline record in the database and publishes a build job onto the message queue. A fleet of stateless runner workers consume jobs, each cloning the repo, running the build and test stages in an isolated environment, and streaming status back to the database so the UI can show live progress. Successful builds upload artifacts (container images, binaries, coverage reports) to object storage and record the artifact keys against the pipeline row. On success the deploy stage promotes the artifact to the target environment; on failure the pipeline is marked red and a notification service alerts the author. Because runners are ephemeral and pull from a shared queue, builds run in parallel and a stuck job on one runner never blocks others. Caching dependency layers in object storage (or a cache tier) speeds up repeated builds.",
  },
  {
    id: 'dns-resolver',
    number: 43,
    title: "DNS Resolver",
    topic: "Infrastructure",
    prompt:
      "Design a recursive DNS resolver that turns hostnames into IP addresses for millions of clients. The vast majority of queries repeat, so lookups must be answered from cache in well under a millisecond, and results must respect each record's TTL.",
    palette: ['client', 'load_balancer', 'web_server', 'cache', 'database', 'replica'],
    requiredComponents: ['client', 'load_balancer', 'web_server', 'cache', 'database'],
    requiredConnections: [
      ['client', 'load_balancer'],
      ['load_balancer', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['cache', 'replica'],
    ],
    hints: [
      "Reads dominate and repeat heavily — the resolver must answer from an in-memory cache before doing any recursive work.",
      "Cache entries expire by the record's TTL, not by a fixed policy; a stale record must be re-resolved once the TTL elapses.",
      "Spread load with anycast/load balancing across many resolver nodes, and replicate the cache so a node failure doesn't cause a cold-start storm.",
    ],
    solution:
      "Clients send queries to a load balancer (anycast in practice) that fans them across a fleet of resolver nodes. Each resolver first checks an in-memory cache keyed by (name, record type); a hit returns the answer instantly and honours the remaining TTL. On a miss the resolver performs the recursive walk — root, TLD, then authoritative nameservers — persisting the resolved records and their TTLs into the backing store and warming the cache before replying. Cache entries expire exactly when their TTL runs out, forcing a fresh resolution. Cache replicas keep the hot working set available across nodes so a single-node failure doesn't trigger a cold-start thundering herd. Negative results (NXDOMAIN) are cached too, with their own shorter TTL, to blunt repeated lookups for bad names.",
  },
  {
    id: 'price-alerting-service',
    number: 44,
    title: "Price Alerting Service",
    topic: "Realtime",
    prompt:
      "Design a service where users set price thresholds on stocks or crypto and get notified the instant the market crosses them. A high-frequency price feed must be evaluated against millions of standing rules with low latency, and no user should ever be double-alerted for the same trigger.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'notification_service', 'database', 'cache'],
    requiredComponents: ['client', 'web_server', 'worker', 'time_series_db', 'notification_service', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['worker', 'time_series_db'],
      ['worker', 'database'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "Store user alert rules durably, but keep the hot set (active thresholds per symbol) in memory so each incoming tick is cheap to evaluate.",
      "Ingest the price feed into a time-series store, then match ticks against standing rules in a streaming evaluator rather than polling per user.",
      "Fire-once semantics: mark a rule as triggered (and debounce) so a symbol oscillating around the threshold doesn't spam the user.",
    ],
    solution:
      "Users create alert rules through the API server, which persists them in the database and indexes the active thresholds per symbol into a fast in-memory structure (cache) that the evaluators keep warm. A market-data feed streams ticks that are written to a time-series DB for history and charting. Streaming worker/evaluators consume each incoming price and check it against the standing rules for that symbol; when a threshold is crossed they look up the affected users and hand a job to the notification service, which pushes to the client via push/email/SMS. Each rule carries a triggered flag and a cooldown so a symbol oscillating around the boundary fires exactly once until reset, giving fire-once semantics. Partitioning rules by symbol lets evaluators scale horizontally, and the time-series DB backs both historical charts and back-testing of new alerts.",
  },
  {
    id: 'multiplayer-matchmaking',
    number: 45,
    title: "Multiplayer Matchmaking",
    topic: "Realtime",
    prompt:
      "Design the matchmaking system for an online game: waiting players must be grouped into balanced matches by skill and region within seconds, then handed off to a game server that runs the session. Queue times should stay low even as the skill pool thins out.",
    palette: ['client', 'ws_gateway', 'matching_service', 'game_server', 'cache', 'database'],
    requiredComponents: ['client', 'ws_gateway', 'matching_service', 'game_server', 'database'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'matching_service'],
      ['matching_service', 'cache'],
      ['matching_service', 'game_server'],
      ['game_server', 'database'],
      ['ws_gateway', 'game_server'],
    ],
    hints: [
      "The matcher works over pools of waiting players bucketed by region and skill rating — keep those pools in a fast in-memory store, not a slow DB scan.",
      "Balance quality against wait time: widen the acceptable skill window the longer a player has waited so the queue never starves.",
      "Once a roster is formed, allocate (or reserve) a game-server instance and route every player's connection to it; only durable results hit the database.",
    ],
    solution:
      "Players connect through a WS gateway and request a match; the request enters the matching service, which maintains per-(region, skill-band) waiting pools in an in-memory cache (Redis sorted sets keyed by MMR). The matcher periodically scans compatible buckets to assemble balanced rosters, progressively widening the acceptable skill and latency window as a player's wait time grows so the queue never starves. When a roster is complete the matcher allocates or reserves a game-server instance from a warm pool and returns its address; the gateway then routes each player's connection to that game server, which runs the authoritative session. In-session state stays in the game server's memory; only durable outcomes — results, rating changes, rewards — are written to the database, which also feeds updated MMR back into the matcher for future queues. Sharding pools by region keeps matching fast and horizontally scalable.",
  },
  {
    id: 'api-gateway-design',
    number: 46,
    title: "API Gateway",
    topic: "Infrastructure",
    prompt:
      "Design an API gateway that fronts dozens of backend microservices behind a single public entry point. It must authenticate every request, enforce per-client rate limits, and route traffic to the right service. A misbehaving client should never be able to overwhelm the fleet.",
    palette: ['client', 'api_gateway', 'rate_limiter', 'web_server', 'cache', 'database', 'load_balancer'],
    requiredComponents: ['client', 'api_gateway', 'rate_limiter', 'web_server', 'cache'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'rate_limiter'],
      ['api_gateway', 'cache'],
      ['api_gateway', 'web_server'],
      ['web_server', 'database'],
    ],
    hints: [
      "The gateway is the single choke point — authentication, rate limiting, and routing all happen here before any request touches a backend service.",
      "Rate limiting needs shared state so limits hold across gateway instances; back it with a fast counter store rather than per-node memory.",
      "Cache auth tokens and hot responses at the edge so the gateway resolves identity and common reads without round-tripping to every backend.",
    ],
    solution:
      "Clients send all requests to the API gateway (fronted by a load balancer for horizontal scale). The gateway first validates the auth token — checking a cache of active sessions to avoid a lookup on every call — then consults a rate limiter backed by a shared counter store (Redis token bucket keyed by client ID) to decide whether to admit or reject with 429. Admitted requests are routed by path/host to the appropriate downstream web server, which reads and writes its own database. Because auth, throttling, and routing are centralized, individual services stay thin and a single abusive client is throttled at the door before it can saturate the backend fleet.",
  },
  {
    id: 'sms-otp-service',
    number: 47,
    title: "SMS OTP Service",
    topic: "Infrastructure",
    prompt:
      "Design a service that generates and verifies one-time passcodes delivered over SMS for login and signup flows. Codes must expire quickly, resist brute-force guessing, and be sent through third-party SMS providers that can be slow or flaky. An attacker must not be able to request unlimited codes for a phone number.",
    palette: ['client', 'web_server', 'rate_limiter', 'cache', 'message_queue', 'worker', 'notification_service', 'database'],
    requiredComponents: ['client', 'web_server', 'rate_limiter', 'cache', 'message_queue', 'worker', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'rate_limiter'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "Store the code with a short TTL, not forever — a fast key-value store with expiry is a natural fit for both the code and its verification-attempt counter.",
      "Rate-limit on both axes: how often a number can request a new code, and how many wrong guesses are allowed before the code is burned.",
      "SMS delivery is slow and unreliable, so hand it to a queue plus workers; the API returns immediately while a worker calls the provider and retries on failure.",
    ],
    solution:
      "On a code request the API server first checks the rate limiter (e.g. max 3 sends per number per 10 minutes) to block abuse. It then generates a random 6-digit code, stores it in a cache under the phone number with a 5-minute TTL alongside an attempt counter, and publishes a send job to a message queue. Workers consume the queue and call the SMS provider through the notification service, retrying with backoff on provider failure so a flaky vendor never blocks the request path. To verify, the client submits the code; the API compares it against the cached value, increments the attempt counter, and deletes the key on success or after too many wrong guesses. Short TTLs, single-use deletion, and dual rate limits (per-send and per-verify) keep codes safe from brute force.",
  },
  {
    id: 'coupon-promo-service',
    number: 48,
    title: "Coupon & Promo Service",
    topic: "Marketplace",
    prompt:
      "Design a service that validates and redeems discount coupons at checkout. Some codes are limited to a fixed number of total uses or one-per-customer, so redemptions must be counted exactly even under a flash sale with heavy concurrent traffic. Validation reads should be fast; double-spending a single-use code must be impossible.",
    palette: ['client', 'web_server', 'cache', 'database', 'rate_limiter', 'load_balancer', 'message_queue'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'rate_limiter'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'rate_limiter'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['database', 'cache'],
    ],
    hints: [
      "Split the read path (is this code valid?) from the write path (claim one use) — validation can be cached, but redemption needs a durable, atomic decrement.",
      "The usage counter is the contended resource. An atomic conditional update in the database (decrement WHERE remaining > 0) prevents two shoppers from claiming the last coupon.",
      "A flash sale can hammer a single popular code; a rate limiter smooths the burst and caches shield the database from validation-only lookups.",
    ],
    solution:
      "Coupon definitions (rules, discount, remaining_uses) live in a database, with hot codes cached for fast read-only validation. At checkout the client hits the API through a load balancer; a rate limiter throttles bursts on any single code during a flash sale. Validation reads the cached rule to check eligibility and expiry. Redemption is the critical path: the API issues an atomic conditional UPDATE (`SET remaining = remaining - 1 WHERE code = ? AND remaining > 0`), which either succeeds — guaranteeing exactly one claim — or fails when the coupon is exhausted, making double-spend impossible even under concurrency. Per-customer limits are enforced with a unique constraint on a redemptions table keyed by (code, customer_id). The cache is invalidated or refreshed from the database after each successful redemption. An optional queue can defer downstream side effects like analytics without slowing the redeem.",
  },
  {
    id: 'real-time-analytics-dashboard',
    number: 49,
    title: "Real-Time Analytics Dashboard",
    topic: "Pipeline",
    prompt:
      "Design a dashboard that shows live metrics — active users, events per second, conversion rates — updating within seconds as raw events stream in from millions of clients. Ingestion is write-heavy and bursty, while the dashboard needs low-latency reads over rolling time windows.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'cache', 'ws_gateway', 'object_storage'],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'time_series_db', 'ws_gateway'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'time_series_db'],
      ['ws_gateway', 'time_series_db'],
      ['client', 'ws_gateway'],
    ],
    hints: [
      "Decouple ingestion from processing: raw events land on a high-throughput broker so bursts are absorbed instead of overwhelming the store.",
      "Pre-aggregate in stream workers — roll events into per-minute buckets before writing, so the dashboard queries small summaries rather than scanning raw firehose.",
      "The dashboard should feel live; push aggregated updates to the browser over a persistent WebSocket connection instead of polling.",
    ],
    solution:
      "Clients emit events to an ingestion API that immediately publishes them onto a partitioned message queue, absorbing bursty write load. Stream-processing workers consume the queue and compute windowed aggregates (counts, rates, uniques over sliding minutes) which they write into a time-series DB optimized for time-bucketed reads. The dashboard connects through a WebSocket gateway that queries the time-series DB and pushes fresh aggregates to the browser every few seconds, so numbers update live without polling. A cache can hold the newest window for instant first paint, and raw events are optionally archived to object storage for later reprocessing. Separating write-heavy ingestion (queue + workers) from low-latency reads (pre-aggregated time-series store) is what keeps both sides fast.",
  },
  {
    id: 'iot-device-telemetry',
    number: 50,
    title: "IoT Device Telemetry",
    topic: "Pipeline",
    prompt:
      "Design a platform that ingests sensor readings from millions of IoT devices reporting temperature, location, and status every few seconds. The system must handle massive sustained write throughput, store time-stamped readings for historical charts, and let operators query the latest state of any device instantly.",
    palette: ['agent', 'load_balancer', 'message_queue', 'worker', 'time_series_db', 'cache', 'web_server', 'client'],
    requiredComponents: ['agent', 'message_queue', 'worker', 'time_series_db', 'cache', 'web_server'],
    requiredConnections: [
      ['agent', 'load_balancer'],
      ['load_balancer', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'time_series_db'],
      ['worker', 'cache'],
      ['client', 'web_server'],
      ['web_server', 'time_series_db'],
      ['web_server', 'cache'],
    ],
    hints: [
      "Millions of devices writing constantly means ingestion is the hard part — buffer readings on a broker so no single store is the bottleneck.",
      "Time-stamped sensor readings are a textbook fit for a time-series database with retention/downsampling for historical charts.",
      "\"Latest state of a device\" is a hot point lookup; keep the most recent reading per device in a cache so the query never scans the time series.",
    ],
    solution:
      "Each device runs a lightweight agent that batches and pushes readings to an ingestion tier behind a load balancer, which forwards them onto a partitioned message queue (partitioned by device ID) to absorb sustained write throughput. Consumer workers pull from the queue and do two writes per reading: they append the time-stamped point to a time-series DB for historical charts (with downsampling and retention to control cost), and they upsert the newest value into a cache keyed by device ID. Operators use a web dashboard: latest-state queries hit the cache for instant point lookups, while historical range queries read the time-series DB. Decoupling ingestion (queue + workers) from storage, and separating the hot latest-state cache from the cold historical store, lets the platform scale writes and reads independently.",
  },
];

export const getSystemDesignProblem = (id: string) =>
  systemDesignProblems.find((p) => p.id === id);
