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
];

export const getSystemDesignProblem = (id: string) =>
  systemDesignProblems.find((p) => p.id === id);
