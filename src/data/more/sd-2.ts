import type { SystemDesignProblem } from '../systemDesign';

// System-design practice problems 61-100. Weighted toward the thinner topics
// (Web service, Media, Social, Search, ML). Every required connection joins two
// required components, and the required connections form one connected graph.

export const problems: SystemDesignProblem[] = [
  {
    id: 'text-paste-sharing',
    number: 61,
    title: "Text Paste Sharing",
    topic: "Web service",
    prompt:
      "Design a pastebin: a user submits a block of text (a log, a config file, a code snippet of up to 10 MB) and gets a link anyone can open, with an optional expiry of an hour, a day, or never. Reads outnumber writes about 20 to 1, and a paste linked from a popular forum can be opened millions of times in an hour. Listing a user's own pastes must stay fast even though the bodies are large.",
    palette: ['client', 'web_server', 'database', 'object_storage', 'cache', 'message_queue', 'search_index'],
    requiredComponents: ['client', 'web_server', 'database', 'object_storage', 'cache'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'object_storage'],
      ['web_server', 'cache'],
    ],
    hints: [
      "A paste is two things with very different shapes: a tiny record (owner, title, expiry, size) and a large body that never changes. Keeping 10 MB bodies in the rows you list and filter makes every query drag blobs around.",
      "Store bodies in an object store under the paste key and keep only the record in the database. Because a paste is immutable, a viral one is an ideal thing to hold in a cache.",
      "Read flow: client → API server → cache. On a miss the API reads the record from the database, checks the expiry, pulls the body from the object store, and fills the cache with a TTL no longer than the paste's remaining life.",
    ],
    solution:
      "To create a paste, the client posts the text to the API server, which generates a random unguessable key, writes the body to the object store under that key, and inserts a small row in the database: key, owner, title, size, created-at, and expires-at. Listing a user's pastes is then an indexed query over small rows and never touches a body. To open a paste, the API server first asks the cache; a hit returns the text without any storage read, which is what absorbs a link going viral. On a miss it loads the row from the database, returns 404 if the expiry has passed, fetches the body from the object store, and writes it into the cache with a TTL capped at the time left before expiry so an expired paste can never be served from memory. Deletion of expired data is lazy: an object-store lifecycle rule and a periodic sweep of the expires-at index remove what nobody asked for. The trade-off is one extra hop on a cold read in exchange for a database that stays small and cheap. What breaks first is the cache memory if large hot pastes are stored whole, so cap the cached size and let the biggest bodies stream from the object store.",
  },
  {
    id: 'async-report-export',
    number: 62,
    title: "Async Report Export",
    topic: "Web service",
    prompt:
      "A business analytics product lets customers export reports (a year of orders as CSV, a 300-page PDF) that take anywhere from a few seconds to twenty minutes to build. Thousands of exports are requested at month end, the work must not tie up the servers that answer normal page loads, and a user who closes the tab must still be told when the file is ready. Finished files are kept for seven days.",
    palette: ['client', 'web_server', 'database', 'message_queue', 'worker', 'object_storage', 'notification_service', 'cache', 'cdn'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'worker', 'object_storage', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
      ['worker', 'object_storage'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "A twenty-minute job cannot live inside an HTTP request. The request should only record that an export was asked for and hand back an export ID.",
      "Put the work on a queue consumed by a separate pool of workers, and write the finished file somewhere built for large blobs rather than returning it through the API.",
      "Flow: API server stores a 'pending' export row and enqueues a job → a worker reads the data, writes the file to the object store, marks the row 'ready' → the notification service emails or pushes a download link.",
    ],
    solution:
      "The client asks the API server for an export. The API server inserts an export row in the database with status 'pending' and the report parameters, publishes a job carrying the export ID onto the message queue, and returns the ID immediately, so page-serving capacity is never held by report generation. A worker takes the job, marks the row 'running', reads the source data from the database in pages (ideally from a read replica so reporting does not compete with live traffic), streams the CSV or PDF into the object store, then sets the row to 'ready' with the object key. It finally calls the notification service, which emails or pushes a message to the client with a link; the API server turns that link into a short-lived signed download URL after checking ownership. The export ID makes the job idempotent: a job redelivered after a worker crash overwrites the same object rather than creating a second file. A lifecycle rule on the object store deletes files after seven days. The trade-off is latency for isolation: even a two-second export pays the queue hop. Month end is what breaks first, as one tenant's hundred giant exports can starve everyone, so cap in-flight jobs per customer and let the worker pool scale with queue depth.",
  },
  {
    id: 'virtual-waiting-room',
    number: 63,
    title: "Virtual Waiting Room",
    topic: "Web service",
    prompt:
      "Tickets for a major concert go on sale at 10:00 and two million people arrive in the same minute, while the purchase backend can safely serve about 5,000 active shoppers at a time. Design the waiting room that holds everyone else in a fair first-come line, shows each person their position, and admits them in order as capacity frees up. Holding a person in line must cost almost nothing, and nobody may skip the line by refreshing or by sharing a link.",
    palette: ['client', 'edge_server', 'cache', 'web_server', 'database', 'message_queue', 'load_balancer', 'ws_gateway'],
    requiredComponents: ['client', 'edge_server', 'cache', 'web_server', 'database'],
    requiredConnections: [
      ['client', 'edge_server'],
      ['edge_server', 'cache'],
      ['edge_server', 'web_server'],
      ['web_server', 'database'],
    ],
    hints: [
      "The purchase backend is the scarce resource. Two million waiting browsers must be answered by something far cheaper that sits in front of it and lets only admitted users through.",
      "A line is just two numbers: the next ticket number to hand out and the highest number currently admitted. Keep both as atomic counters in a fast in-memory store, and give each visitor a signed token carrying their number.",
      "Flow: client → edge server. No token: the edge takes the next number from the cache and returns a signed token plus a waiting page. Token above the admitted number: return the position. Token at or below it: forward to the API server, which talks to the database.",
    ],
    solution:
      "Every request from a client lands on an edge server, a thin tier that can answer millions of cheap requests without touching the shop. A first-time visitor has no token, so the edge server atomically increments a 'next number' counter in the cache and returns a signed, tamper-proof token containing that number along with a static waiting page. The page polls every few seconds; the edge server verifies the signature, reads the 'now admitting up to' counter from the cache, and replies with the visitor's position, which costs one in-memory read. A small controller raises the admitted counter as shoppers finish or time out, keeping the number of active sessions near 5,000. Once a token's number is at or below the admitted counter, the edge server forwards the request to the API server, which runs the real purchase flow against the database. Refreshing does nothing because the number lives in the signed token, and a shared link carries no token at all. The trade-off is polling versus held connections: polling wastes requests but keeps the edge stateless. What breaks first is the single counter, a hot key; it survives because an increment is tiny, and it can be handed out in blocks per edge location if needed.",
  },
  {
    id: 'public-weather-api',
    number: 64,
    title: "Public Weather API",
    topic: "Web service",
    prompt:
      "Design a public weather API that developers call with an API key to get the forecast for a latitude and longitude. Forecast data is regenerated once an hour by an ingest job that pulls in new model runs, while lookups arrive at 50,000 per second and cluster around big cities. Each key has a monthly quota set by its pricing tier, and requests over quota must be rejected before they reach the forecast servers.",
    palette: ['client', 'api_gateway', 'rate_limiter', 'web_server', 'cache', 'database', 'worker', 'message_queue', 'load_balancer', 'cdn'],
    requiredComponents: ['client', 'api_gateway', 'rate_limiter', 'web_server', 'cache', 'database', 'worker'],
    requiredConnections: [
      ['client', 'api_gateway'],
      ['api_gateway', 'rate_limiter'],
      ['api_gateway', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['worker', 'database'],
    ],
    hints: [
      "The data changes once an hour but is read 50,000 times a second, and a forecast for one grid cell is identical for every caller. Snap coordinates to a grid cell and almost every request becomes a repeat.",
      "Quota enforcement belongs at the front door, not in the forecast code: a gateway that authenticates the key and consults a rate limiter can turn away over-quota traffic cheaply.",
      "Flow: client → API gateway (key check, rate limiter) → API server → cache keyed by grid cell and model run → database on a miss. Separately, an hourly worker writes each new model run into the database.",
    ],
    solution:
      "A client request reaches the API gateway, which validates the API key and asks the rate limiter whether the key still has quota; the rate limiter keeps a counter per key and billing period and answers in well under a millisecond, so over-quota calls get a 429 without ever reaching the forecast tier. Allowed requests are routed to an API server, which snaps the latitude and longitude to a grid cell and looks up the cell plus the current model-run ID in the cache. Because traffic clusters around cities, the hit rate is very high. On a miss the API server reads the cell's forecast from the database and populates the cache. Independently, an ingest worker runs every hour: it downloads the new model output, converts it to per-cell forecasts, and bulk-writes them to the database under a new run ID, then flips a 'current run' pointer so readers move over atomically and old cache entries simply age out. The trade-off is grid resolution: finer cells are more accurate but lower the hit rate and multiply storage. What breaks first is the moment after each hourly flip, when every cached cell is stale at once; warming the busiest cells from the worker and adding jitter to TTLs keeps the database from being stampeded.",
  },
  {
    id: 'link-preview-service',
    number: 65,
    title: "Link Preview Service",
    topic: "Web service",
    prompt:
      "A messaging app shows a preview card (title, description, thumbnail URL) when someone pastes a link. The card should come back in the same request within about a second, the same trending links are pasted by millions of users, and the target sites are untrusted: they can be slow, enormous, or point at internal addresses. Design the service that turns a URL into preview data.",
    palette: ['client', 'web_server', 'cache', 'fetcher', 'parser', 'database', 'message_queue', 'cdn'],
    requiredComponents: ['client', 'web_server', 'cache', 'fetcher', 'parser'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'fetcher'],
      ['fetcher', 'parser'],
    ],
    hints: [
      "The expensive, risky step is the outbound HTTP request to a stranger's site. Most pasted links have been seen before, so the common case should never make that request at all.",
      "Isolate the outbound fetch in its own component with strict limits (timeout, maximum bytes, blocked private IP ranges), separate from the code that extracts the title and image tags from the HTML.",
      "Flow: client → API server → cache by normalised URL. On a miss the API server calls the fetcher, the fetcher hands the HTML to the parser, and the extracted preview is cached with a TTL before it is returned.",
    ],
    solution:
      "The client sends the pasted URL to the API server, which normalises it (lower-case host, strip tracking parameters) and looks it up in the cache. A trending link is fetched once and then served from memory to everyone else, which is what keeps the service inside its one-second budget. On a miss the API server calls the fetcher synchronously. The fetcher is the only component allowed to talk to the outside world: it resolves the host and refuses private or loopback addresses to block server-side request forgery, follows a bounded number of redirects, enforces a short timeout, and stops reading after the first few hundred kilobytes. It passes the HTML to the parser, which pulls Open Graph and Twitter-card tags and falls back to the title element and the first large image. The API server stores the result in the cache with a TTL of hours and returns it; failures are cached too, for a shorter time, so a dead site is not retried on every paste. Concurrent misses for one URL are collapsed into a single fetch. The trade-off is freshness versus load on other people's sites. What breaks first is the fetcher pool when one popular domain turns slow, so cap concurrent fetches per domain and return an empty card rather than waiting.",
  },
  {
    id: 'event-ticket-check-in',
    number: 66,
    title: "Event Ticket Check-In",
    topic: "Web service",
    prompt:
      "Fans buy tickets online and receive a QR code; at a 60,000-seat stadium, staff scan the codes at 80 gates in the hour before kickoff. Each ticket must admit exactly one person even if a screenshot is shared, a scan must answer in under 200 ms, and the gates must keep working when the stadium's internet link drops for several minutes.",
    palette: ['client', 'web_server', 'database', 'edge_server', 'cache', 'message_queue', 'cdn'],
    requiredComponents: ['client', 'web_server', 'database', 'edge_server'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['client', 'edge_server'],
      ['edge_server', 'web_server'],
    ],
    hints: [
      "If every scan depends on a round trip to a distant data centre, a dropped uplink closes the stadium. The decision 'has this ticket already been used?' has to be made on site.",
      "Place a server inside the venue that holds this one event's ticket list and is the single authority for scans at all 80 gates. Scanners talk to it over the local network; it syncs with the central system when the link is up.",
      "Flow: buyers (clients) purchase through the API server, which stores tickets in the database. Before doors open the edge server downloads the event's tickets from the API server. Scanners (clients) call the edge server, which marks tickets used locally and uploads the scans afterwards.",
    ],
    solution:
      "There are two kinds of client. A buyer's phone talks to the central API server, which sells the ticket, stores it in the database, and returns a QR code containing a signed ticket ID. A gate scanner talks to an edge server installed at the stadium. Before doors open, the edge server pulls the full list of valid ticket IDs for this event from the API server, a few megabytes at most. When a code is scanned, the scanner sends it over the venue's local network to the edge server, which verifies the signature, checks the ticket is on the list, and atomically flips it from unused to used in its local store before answering. Because all 80 gates consult the same on-site authority, a shared screenshot works exactly once, and the answer arrives in milliseconds with no dependency on the internet link. The edge server streams scan records back to the API server whenever the uplink is available, and the API server writes them to the database so the organiser's dashboards and refund rules see them; it also receives late purchases and cancellations in the other direction. The trade-off is that a ticket sold during an outage is unknown at the gate until the link returns. What breaks first is the edge server itself, so run a pair with local replication.",
  },
  {
    id: 'username-availability-check',
    number: 67,
    title: "Username Availability Check",
    topic: "Web service",
    prompt:
      "A signup form tells people whether a username is free as they type, checking on every pause in typing. The service already holds two billion taken names, the check runs about 100 times more often than an actual registration, and most names people try are in fact free. Two people must never end up owning the same name, and scripts must not be able to enumerate which names exist.",
    palette: ['client', 'web_server', 'bloom_filter', 'database', 'rate_limiter', 'cache', 'search_index', 'id_generator'],
    requiredComponents: ['client', 'web_server', 'bloom_filter', 'database', 'rate_limiter'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'rate_limiter'],
      ['web_server', 'bloom_filter'],
      ['web_server', 'database'],
    ],
    hints: [
      "Most checks are for names that do not exist. Caching past answers does not help much because each new guess is a new key; you want a structure that can say 'definitely not taken' for a name it has never been asked about.",
      "A Bloom filter over all taken names fits in a few gigabytes of memory and never gives a false 'not taken'. Only its 'maybe taken' answers need the database, and the final claim is settled by a unique constraint there.",
      "Flow: client → API server → rate limiter (per IP and session) → Bloom filter. 'Not present' returns 'available' at once; 'maybe present' is confirmed with a database lookup. Registration inserts into the database and then adds the name to the filter.",
    ],
    solution:
      "As the user types, the client calls the API server with the candidate name. The API server first asks the rate limiter, which counts checks per IP address and signup session and rejects bursts, so a script cannot walk the namespace to harvest account names. It then normalises the name (case-folding, look-alike characters) and tests it against the Bloom filter built from every taken name. A Bloom filter has no false negatives, so 'not present' means the name is certainly free and the API server replies without any disk read; this is the common case. 'Maybe present' is either a real hit or a false positive, so the API server confirms with an indexed lookup in the database. The check is only advisory. When the user submits the form, the API server inserts the row into the database, where a unique index on the normalised name is what guarantees two simultaneous signups cannot both win; after a successful insert the name is added to the filter. A filter that briefly lags can show 'available' for a name claimed a second ago, and the insert then fails cleanly. The trade-off is memory versus false-positive rate: about ten bits per name gives roughly 1% unnecessary lookups. What breaks first is deletions, which a plain Bloom filter cannot express, so rebuild it periodically from the database.",
  },
  {
    id: 'on-demand-image-resizing',
    number: 68,
    title: "On-Demand Image Resizing",
    topic: "Media",
    prompt:
      "A storefront platform stores one high-resolution original per product photo and must serve it at whatever width, crop, and format each page and device asks for through URL parameters. There are 500 million originals and thousands of possible variants of each, but only a small fraction of variants is ever requested. Popular variants must load from nearby in tens of milliseconds, and storage cost matters.",
    palette: ['client', 'cdn', 'web_server', 'object_storage', 'message_queue', 'worker', 'database'],
    requiredComponents: ['client', 'cdn', 'web_server', 'object_storage'],
    requiredConnections: [
      ['client', 'web_server'],
      ['client', 'cdn'],
      ['cdn', 'web_server'],
      ['web_server', 'object_storage'],
    ],
    hints: [
      "Pre-generating every size of every image at upload time multiplies storage by thousands for variants nobody will view. Work out what happens if you generate a variant only the first time someone asks for it.",
      "A resize is a pure function of (original, parameters), so its output can be cached forever under the URL. Put a CDN in front and let a resize origin behind it do the work only on a miss.",
      "Flow: uploads go client → API server → object store. Views go client → CDN; on a miss the CDN calls the API server acting as resize origin, which reads the original from the object store, transforms it, and returns it with a long cache lifetime.",
    ],
    solution:
      "Uploading is simple: the client sends the original to the API server (or to a signed URL the API server issues), and it lands in the object store under an immutable key. Viewing never touches that path. The page requests a URL that encodes the image key and the transformation, and the client fetches it from the CDN. If the edge has that exact variant it returns it in milliseconds. On a miss the CDN forwards the request to the origin, an API server running the image pipeline: it validates the parameters against an allow-list, reads the original from the object store, resizes, crops, and re-encodes to the requested format, and responds with a year-long immutable cache header so the CDN keeps the result. Only variants that are really requested are ever computed, and the object store holds one copy per photo instead of thousands. Changing a photo means a new key, so nothing has to be purged. The trade-off is a slow first view of each variant in each region in exchange for a huge storage saving. What breaks first is the resize origin under a flood of unique parameter combinations, whether accidental or an attack, so round widths to a fixed set of steps, sign the URLs, and keep the origin's own disk cache of recent outputs.",
  },
  {
    id: 'music-streaming',
    number: 69,
    title: "Music Streaming",
    topic: "Media",
    prompt:
      "Design a music service with a catalog of 100 million tracks, delivered by labels already encoded at three bitrates, and 50 million daily listeners. Playback must start in under half a second anywhere in the world. Every play longer than 30 seconds must be counted exactly once because royalties are paid per play, but the counting must never delay or interrupt the audio.",
    palette: ['client', 'web_server', 'database', 'cdn', 'object_storage', 'message_queue', 'worker', 'transcoder', 'cache', 'search_index'],
    requiredComponents: ['client', 'web_server', 'database', 'cdn', 'object_storage', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['client', 'cdn'],
      ['cdn', 'object_storage'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      "There are two independent problems here: getting immutable audio bytes to the listener quickly, and recording a financial fact about each play. Neither should wait on the other.",
      "Audio files never change, so they belong in an object store behind a CDN. Play reports are a write-heavy event stream, so buffer them on a durable queue and count them off the request path.",
      "Flow: client → API server → database for track metadata and a signed audio URL; client → CDN → object store for the bytes. The client reports the play to the API server, which publishes it to the queue; workers deduplicate and write royalty counts to the database.",
    ],
    solution:
      "When a listener taps a track, the client asks the API server, which reads the track's metadata and the user's entitlement from the database and returns signed URLs for the audio at each bitrate. The client streams the file from the CDN, which serves it from an edge near the listener and pulls from the object store only on a miss; because tracks are immutable and already encoded, the popular head of the catalog is almost always at the edge, and the client pre-fetches the first seconds of the next track to keep start-up time low. Once 30 seconds have played, the client sends a play report with a client-generated play ID to the API server, which publishes it to the message queue and acknowledges. Workers consume the queue, drop duplicates by play ID (the client retries until acknowledged, so reports can arrive twice), and write per-track, per-day play counts and the raw play ledger to the database that royalty statements are computed from. The audio path has no dependency on the counting path, so a backlog only delays reporting. The trade-off is at-least-once delivery plus deduplication rather than attempting exactly-once end to end. What breaks first is the long tail: rarely played tracks miss the CDN and hit the object store, so keep that origin in several regions.",
  },
  {
    id: 'short-video-feed',
    number: 70,
    title: "Short Video Feed",
    topic: "Media",
    prompt:
      "Design a short-video app: creators upload 15 to 60 second clips from their phones, and viewers swipe through an endless feed chosen for them individually rather than from accounts they follow. The next clip must start playing the instant the viewer swipes, on any network quality, and a newly uploaded clip should be watchable within about a minute. Uploads spike in the evening.",
    palette: ['client', 'web_server', 'object_storage', 'message_queue', 'transcoder', 'cdn', 'recommendation_engine', 'database', 'cache'],
    requiredComponents: ['client', 'web_server', 'object_storage', 'message_queue', 'transcoder', 'cdn', 'recommendation_engine'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'recommendation_engine'],
      ['message_queue', 'transcoder'],
      ['transcoder', 'object_storage'],
      ['cdn', 'object_storage'],
      ['client', 'cdn'],
    ],
    hints: [
      "Instant playback on a weak connection means the clip must already exist in a small rendition, close to the viewer, before they swipe to it. That work has to be done once at upload time, not at view time.",
      "Encoding is slow and uploads are bursty, so put a queue between 'file received' and the transcoders. The feed is not a follow timeline; it needs a component whose job is choosing clips per viewer.",
      "Flow: the uploaded file lands in the object store and a job goes on the queue → a transcoder reads the source and writes several renditions back to the object store → CDN serves them. For viewing, client → API server → recommender for the next batch of clip IDs, then client → CDN for the bytes.",
    ],
    solution:
      "A creator's client asks the API server for an upload slot and sends the raw clip into the object store; a transcode job is then placed on the message queue. The queue is what lets the evening spike pile up briefly without failing uploads. A transcoder takes each job, reads the source from the object store, and writes back a ladder of renditions (for example 360p, 540p, 720p) cut into short segments, plus a cover frame; short clips encode in seconds, so the one-minute target is met as long as the transcoder fleet scales with queue depth. For viewing, the client asks the API server for the next batch of the feed. The API server calls the recommendation engine, which picks clips for this viewer from watch history and engagement signals and returns a short list of IDs with their playback URLs. The client plays each clip from the CDN, which pulls segments from the object store on a miss, and while one clip plays it pre-fetches the first segment of the next two so a swipe starts instantly at a rendition matched to the measured bandwidth. The trade-off is storage and compute spent encoding every upload in several sizes, although most clips get few views. What breaks first is CDN efficiency on the long tail, so brand-new and unpopular clips need a well-provisioned origin.",
  },
  // __APPEND__
];
