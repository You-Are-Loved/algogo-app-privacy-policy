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
  | 'metadata_db';

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
];

export const getSystemDesignProblem = (id: string) =>
  systemDesignProblems.find((p) => p.id === id);
