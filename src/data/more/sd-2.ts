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
  {
    id: 'ebook-store-library',
    number: 71,
    title: "E-Book Store & Library",
    topic: "Media",
    prompt:
      "Design a store that sells e-books and audiobooks and keeps each customer's library available on all their devices. Files range from 1 MB novels to 500 MB audiobooks and are downloaded worldwide, but only by people who bought them. A purchase must charge the card once and add the title once even if the app retries, and the reading position should follow the user from phone to tablet.",
    palette: ['client', 'web_server', 'database', 'payment_processor', 'object_storage', 'cdn', 'cache', 'message_queue', 'search_index'],
    requiredComponents: ['client', 'web_server', 'database', 'payment_processor', 'object_storage', 'cdn'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'payment_processor'],
      ['cdn', 'object_storage'],
      ['client', 'cdn'],
    ],
    hints: [
      "Ownership is a small transactional fact; the book itself is a large file that is the same for every buyer. The system that decides who may download should not be the system that moves 500 MB.",
      "Keep purchases and reading positions in a database, the files in an object store fronted by a CDN, and bridge the two with short-lived signed URLs that only the API hands out to owners.",
      "Flow: client → API server → payment processor with an idempotency key, then the purchase row goes in the database. To read, client → API server (ownership check) → signed URL → client downloads from the CDN, which pulls from the object store.",
    ],
    solution:
      "To buy, the client sends the title and a client-generated idempotency key to the API server. The API server calls the payment processor with that key, so a retried request cannot create a second charge, and on success inserts a purchase row in the database under a unique constraint on (user, title), which makes adding to the library idempotent too. The library screen is a query over those rows, identical on every device. Publisher files sit in the object store and are never public. When the user opens a book, the client asks the API server, which checks the purchase row and returns a signed URL that expires in minutes; the client downloads from the CDN, which validates the signature at the edge and pulls the file from the object store on a miss, so a 500 MB audiobook streams from a nearby location with range requests and resumes after a dropped connection. Reading position is a tiny row per (user, title) that the client writes to the API server periodically, with last-write-wins by timestamp. The trade-off is signed-URL lifetime: short limits link sharing but forces a refresh during long downloads. What breaks first is a big release day, when one file is requested everywhere at once; that is exactly the load the CDN absorbs, while the payment path must be sized for the purchase spike.",
  },
  {
    id: 'ephemeral-stories',
    number: 72,
    title: "Ephemeral Stories",
    topic: "Social",
    prompt:
      "Design the stories feature of a social app: a user posts photos or short clips that vanish 24 hours later, and friends see a row of rings for everyone who has something new. That row is loaded on every app open, hundreds of thousands of times per second, and it must show which stories this viewer has not watched yet. Expired media must stop being served.",
    palette: ['client', 'web_server', 'database', 'object_storage', 'cdn', 'cache', 'message_queue', 'worker', 'search_index'],
    requiredComponents: ['client', 'web_server', 'database', 'object_storage', 'cdn', 'cache'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'cache'],
      ['cdn', 'object_storage'],
      ['client', 'cdn'],
    ],
    hints: [
      "Everything here has a 24-hour life, and the busiest read (the row of rings) happens on every app open. Data that expires on a known schedule and is read constantly is a natural fit for an in-memory store with TTLs.",
      "Keep each author's list of active story IDs in a cache with a TTL so expiry needs no cleanup job on the read path; keep story records and view receipts in a database; keep the media in an object store behind a CDN.",
      "Flow: posting writes the media to the object store and a story row with an expiry to the database, then adds it to the author's active list in the cache. Opening the app: client → API server → cache for the friends' active lists; the client then loads media from the CDN.",
    ],
    solution:
      "To post, the client uploads the photo or clip into the object store and tells the API server, which writes a story row (author, media key, created-at, expires-at) to the database and appends the story ID to the author's active-stories list in the cache with a 24-hour TTL per entry. On app open the client asks the API server for the row of rings. The API server reads the viewer's friend list and fetches each friend's active list from the cache in one batched call, compares the newest story time against the viewer's last-seen marker for that author, and returns the authors with unseen stories first. No database query is needed for the common case. Watching a story loads the media from the CDN, which pulls from the object store on a miss, using a signed URL whose lifetime ends at the story's expiry, and the client reports the view to the API server, which records a view receipt in the database and advances the last-seen marker in the cache. Expiry is mostly passive: cache entries age out, URLs stop validating, and a lifecycle rule deletes the media a little later. The trade-off is fan-out on read, which costs a batched lookup per app open but avoids writing to millions of followers. What breaks first is an account with millions of viewers, whose view receipts need to be sampled or counted rather than stored one by one.",
  },
  {
    id: 'threaded-comments-voting',
    number: 73,
    title: "Threaded Comments & Voting",
    topic: "Social",
    prompt:
      "Design the comment section of a discussion site: comments nest to any depth, each can be upvoted or downvoted, and a thread is shown sorted by score. A popular thread holds 50,000 comments, is read thousands of times per second, and receives bursts of hundreds of votes per second on a handful of comments. A user's own new comment must appear to them immediately, while vote totals may lag by a few seconds.",
    palette: ['client', 'web_server', 'database', 'cache', 'message_queue', 'worker', 'search_index', 'ws_gateway'],
    requiredComponents: ['client', 'web_server', 'database', 'cache', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
    ],
    hints: [
      "Comments and votes have different requirements. A comment is rare, valuable, and must be visible to its author at once; a vote is tiny, extremely frequent on a few rows, and allowed to lag.",
      "Write comments straight to the database, but push votes through a queue so a worker can fold hundreds of votes on one comment into a single score update. Serve the assembled thread from a cache, since it is read far more than it changes.",
      "Flow: read: client → API server → cache → database on a miss. Comment: API server → database. Vote: API server → queue → worker, which records the vote and applies the batched score change in the database.",
    ],
    solution:
      "Each comment is a row in the database with its thread ID, parent ID, and a materialised path, so a whole subtree can be fetched with one range query instead of a recursive walk. Reading a thread goes from the client to the API server, which serves the sorted top of the tree from the cache and falls back to the database on a miss; deeper branches load on demand. Posting a comment is a synchronous insert by the API server into the database, and the response includes the new comment so the author sees it immediately even if the cached thread is a few seconds old. A vote takes the other route: the API server validates it and publishes it to the message queue, then returns. A worker consumes votes in small batches, upserts each (user, comment) vote row so that a repeated or changed vote is counted once, and applies one net score update per comment per batch to the database, which is what stops hundreds of concurrent writers fighting over a single hot row. The cached thread is refreshed on a short TTL or when a score moves enough to change the order. The trade-off is a few seconds of lag on totals in exchange for removing lock contention. What breaks first is the giant thread, where re-sorting 50,000 comments on every refresh is too slow, so only the top levels are cached and sorted.",
  },
  {
    id: 'friend-suggestions',
    number: 74,
    title: "Friend Suggestions",
    topic: "Social",
    prompt:
      "Design 'People You May Know' for a network of 500 million users: show each user a ranked list of people they probably know, based mainly on mutual connections. Computing friends-of-friends for one user can touch hundreds of thousands of edges, so it cannot happen while the page loads, yet the module sits on the home screen and must render in under 50 ms. Lists may be a day stale, but a person the user has just connected with or dismissed should drop out within seconds.",
    palette: ['client', 'web_server', 'cache', 'database', 'worker', 'message_queue', 'recommendation_engine', 'search_index', 'ranking_service'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'worker', 'message_queue'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
      ['worker', 'cache'],
    ],
    hints: [
      "The expensive part (a two-hop traversal of the graph) and the latency-critical part (rendering the home screen) cannot be the same step. Whatever the page reads must already be computed.",
      "Precompute each user's top suggestions offline and store them as a ready-made list in a key-value cache. Because the list can be rebuilt from the graph at any time, it does not need to be the source of truth.",
      "Flow: workers read the connection graph from the database, score candidates by mutual friends, and write a top-100 list per user into the cache. The home screen is client → API server → cache. Connect and dismiss actions go API server → queue → worker, which patches the affected lists.",
    ],
    solution:
      "The heavy lifting happens offline. Batch workers walk the connection graph stored in the database: for each user they gather friends-of-friends, count mutual connections, add weaker signals such as shared school or workplace, drop people who are already connected, blocked, or previously dismissed, and write the top 100 candidates into the cache as one list keyed by user ID. Rendering the module is then a single key lookup: client to API server to cache, comfortably inside 50 ms, with no graph traversal on the request path. Freshness comes from events. When a user connects with or dismisses someone, the API server publishes that event to the message queue and removes the entry from the response it returns. A worker consumes the event, deletes that person from the user's cached list straight away, and schedules a recomputation for the two people involved, because a new connection changes the mutual-friend counts of everyone around them. Users with no list yet (new accounts) fall back to contacts-based or popular suggestions. The trade-off is staleness for speed: most lists are up to a day old, patched by events in between. What breaks first is the batch job on very well-connected accounts, whose two-hop neighbourhood is enormous, so cap the friends sampled per hop and recompute active users more often than dormant ones.",
  },
  {
    id: 'forum-front-page',
    number: 75,
    title: "Forum Front Page",
    topic: "Social",
    prompt:
      "Design the front page of a link-sharing forum: each community shows its 'hot' posts, ordered by a score that rises with votes and decays with age. The front page is requested 20,000 times per second while votes arrive at about 2,000 per second, and it is fine for the order to lag the votes by up to 30 seconds. Sorting every post by a time-dependent formula on each page view is not affordable.",
    palette: ['client', 'web_server', 'cache', 'database', 'ranking_service', 'message_queue', 'search_index', 'cdn', 'ws_gateway'],
    requiredComponents: ['client', 'web_server', 'cache', 'database', 'ranking_service', 'message_queue'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'cache'],
      ['web_server', 'message_queue'],
      ['message_queue', 'ranking_service'],
      ['ranking_service', 'cache'],
    ],
    hints: [
      "Reads outnumber votes ten to one and may be 30 seconds stale, so the ordering should be maintained when votes happen, not recomputed when pages are viewed.",
      "Let a dedicated ranker own the hot score and keep each community's ordering as a sorted set in an in-memory cache. Choose a score formula where age is folded into a fixed value at post time, so old scores never need recalculating as the clock moves.",
      "Flow: vote: client → API server → database (the vote record), and an event onto the queue → ranker → updated score in the cache's sorted set. Page view: client → API server → top IDs from the cache → post details from the database.",
    ],
    solution:
      "A vote goes from the client to the API server, which records it in the database (one row per user and post, so a vote cannot be cast twice) and publishes a small event to the message queue. The ranking service consumes those events, recomputes the hot score for the affected post, and writes it into a sorted set per community in the cache. The trick that makes this cheap is the formula: score = log of net votes plus a term proportional to the post's creation time. Newer posts start with a higher base, so nothing has to be re-scored as time passes; a post's score changes only when its votes do. A front-page request is then client to API server, a range read of the top 25 IDs from the cache, and a batched fetch of titles, authors, and counts from the database (itself easily cached per post). The ranker batches events for a few seconds per post, which fits the 30-second staleness allowance and turns a burst of votes on one post into a single update. The trade-off is eventual consistency of the order in exchange for constant-time page views. What breaks first is the site-wide 'all communities' page, which needs its own merged sorted set and whose single key becomes the hottest in the cache, so it is replicated to read copies.",
  },
  {
    id: 'nearby-friends',
    number: 76,
    title: "Nearby Friends",
    topic: "Social",
    prompt:
      "Design an opt-in 'nearby friends' feature: while the app is open, a user sees which of their friends are within 5 km, with distances that refresh about every 30 seconds. Ten million users are active at once and each reports a new position every 30 seconds; a typical user has 400 friends, of whom only a few are nearby. A position is worthless once it is a few minutes old, and updates must be pushed to the app rather than polled.",
    palette: ['client', 'ws_gateway', 'location_service', 'cache', 'message_queue', 'database', 'search_index', 'notification_service'],
    requiredComponents: ['client', 'ws_gateway', 'location_service', 'cache', 'message_queue'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'location_service'],
      ['location_service', 'cache'],
      ['message_queue', 'ws_gateway'],
    ],
    hints: [
      "This is not a 'who is near this point' search over all users. Each user only cares about a fixed, small set of people (their friends), so the problem is routing each position update to the friends who are online.",
      "Positions are short-lived and overwritten constantly: keep only the latest one per user in an in-memory store with a TTL. Use a lightweight publish/subscribe channel per user so each friend's connection can subscribe to the people it cares about.",
      "Flow: client → WebSocket gateway → location service, which stores the latest position in the cache. The update is published to the sender's channel on the queue; gateways holding that user's online friends are subscribed, compute the distance, and push it down if it is within 5 km.",
    ],
    solution:
      "Each client keeps a WebSocket open to a WS gateway and sends its position every 30 seconds. The gateway passes the update to the location service, which overwrites that user's entry in the cache with the new coordinates and a TTL of a few minutes, so a user who closes the app simply ages out and no history is kept. The update is also published to a channel named after the sender on a publish/subscribe message queue. When a user comes online, their gateway subscribes on their behalf to the channels of all their friends and asks the location service for those friends' current positions from the cache to draw the initial list. From then on, every time a friend moves, the message arrives at the subscriber's gateway, which computes the distance to its own user's last known position and pushes an update down the socket only if the friend is within 5 km. Ten million users reporting every 30 seconds is about 330,000 updates per second, each fanned out to the fraction of 400 friends who are online. The trade-off is that the filter runs after fan-out, so many messages are delivered and discarded; that is acceptable because they are tiny. What breaks first is the publish/subscribe tier, which must be sharded by channel across many nodes with consistent hashing.",
  },
  {
    id: 'product-catalog-search',
    number: 77,
    title: "Product Catalog Search",
    topic: "Search",
    prompt:
      "Design search for an online store with 200 million products: shoppers type free text, then narrow by brand, price range, rating, and other facets, each shown with a count of matching items. Sellers change prices and stock 5,000 times per second; a change should be searchable within about ten seconds, and the price and stock shown on a result must match what checkout will charge. Popular queries repeat constantly.",
    palette: ['client', 'web_server', 'search_index', 'database', 'message_queue', 'worker', 'cache', 'cdn', 'recommendation_engine'],
    requiredComponents: ['client', 'web_server', 'search_index', 'database', 'message_queue', 'worker', 'cache'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['message_queue', 'worker'],
      ['worker', 'search_index'],
    ],
    hints: [
      "The store's database is the truth for price and stock but cannot do free-text relevance or facet counts over 200 million rows. The search copy can do both but will always be slightly behind.",
      "Keep a denormalised product document in an inverted index for matching and faceting, fed by a stream of change events that indexing workers apply in bulk. Treat the index as a way to find product IDs, not as the authority on price.",
      "Flow: product changes are published to a queue → workers batch them into the search index. Query: client → API server → cache for popular queries → search index for IDs and facet counts → database for the live price and stock of the 20 results shown.",
    ],
    solution:
      "Every product change is captured as an event on the message queue, keyed by product ID so updates to one product stay in order. Indexing workers consume the stream, build a denormalised document (title, brand, category, attributes, price, rating), and apply it to the search index with bulk writes every second or two, which meets the ten-second freshness target while keeping the index from thrashing on 5,000 single-document updates per second. A shopper's query goes from the client to the API server, which first checks the cache for that exact query and filter combination, since the head of the query distribution repeats constantly. On a miss it asks the search index, which matches the text, applies the filters, and returns the top product IDs together with facet counts computed by aggregations over the matching set. Before responding, the API server looks up those 20 IDs in the database and overwrites price and stock with the authoritative values, so a result page never shows a number that checkout would contradict, even if the index is seconds behind. Cached result pages hold IDs and facets only, for the same reason. The trade-off is one extra batched read per query for correctness. What breaks first is indexing lag during a sale, when price changes surge, so the workers scale on queue depth and price-only updates use cheap partial writes.",
  },
  {
    id: 'code-search',
    number: 78,
    title: "Code Search",
    topic: "Search",
    prompt:
      "Design code search for a hosting platform with 50 million repositories: developers search by exact substring or regular expression rather than by natural-language words. Thousands of pushes arrive per second, and a pushed change should be searchable within a minute or two. Most file contents are identical between consecutive commits and between forks, so indexing every file of every push again would be enormously wasteful.",
    palette: ['client', 'web_server', 'search_index', 'object_storage', 'message_queue', 'worker', 'database', 'cache', 'ranking_service'],
    requiredComponents: ['client', 'web_server', 'search_index', 'object_storage', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
      ['worker', 'search_index'],
    ],
    hints: [
      "A word-based inverted index cannot answer 'find the substring Mutex(' or a regular expression, because code is not made of words. You need an index over something smaller than a token.",
      "Index every three-character sequence (trigram) of each file: a substring or regex query becomes an intersection of trigram posting lists that yields candidate files, which are then verified. Key documents by content hash so an unchanged file is never indexed twice.",
      "Flow: a push puts an event on the queue → a worker reads the changed file contents from the object store, skips hashes already indexed, and writes trigram postings to the search index. Query: client → API server → search index shards, scatter and gather.",
    ],
    solution:
      "Repository contents live in the object store as content-addressed blobs, which is how the hosting platform already stores them. Each push places an event on the message queue naming the repository and the commits. An indexing worker takes the event, works out which files changed, and reads those blobs from the object store. Because a blob's hash identifies its content, the worker skips any hash that is already indexed; forks and unchanged files therefore cost nothing, and only the mapping from (repository, branch, path) to blob hash is updated. For new content the worker extracts every trigram and writes postings into the search index, sharded by repository so one repository's files sit together. A query goes from the client to the API server, which breaks the substring or regular expression into the trigrams it must contain, sends the query to the relevant shards of the search index, and merges their answers; each shard intersects the posting lists to get candidate files and then runs the real pattern over those candidates to remove false matches before returning matching lines. Only default branches are indexed, which keeps the corpus bounded. The trade-off is index size, since trigram postings are several times larger than a word index. What breaks first is a broad regex with few required trigrams, which degenerates into scanning, so queries carry a time budget and return partial results.",
  },
  {
    id: 'job-search-alerts',
    number: 79,
    title: "Job Search with Saved Alerts",
    topic: "Search",
    prompt:
      "Design a job board with 30 million open listings where seekers run keyword and location searches and can save a search to be alerted when a new matching job is posted. There are 100 million saved searches, 500,000 new jobs arrive per day, and an alert should go out within minutes of posting. Re-running every saved search on a schedule is far too expensive.",
    palette: ['client', 'web_server', 'search_index', 'database', 'message_queue', 'worker', 'notification_service', 'cache', 'recommendation_engine'],
    requiredComponents: ['client', 'web_server', 'search_index', 'database', 'message_queue', 'worker', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'search_index'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "Count both sides: 100 million saved searches against 500,000 new jobs a day. It is much cheaper to ask 'which saved searches match this one new job?' than to ask 'which jobs match this saved search?' a hundred million times.",
      "Search engines can index queries as well as documents (reverse search, or percolation): the stored queries are indexed by their terms and filters, and a new document is matched against them. Do that work off the posting path, behind a queue.",
      "Flow: employer posts → API server writes the job to the database and publishes an event → a worker adds the job to the search index and matches it against the stored searches → matches go to the notification service → seeker. Ordinary searches are client → API server → search index.",
    ],
    solution:
      "An ordinary search goes from the client to the API server and on to the search index, which holds every open listing with its text, location, and salary fields. Saved searches are stored by the API server in the database as the source of truth and also registered in the search index as stored queries, indexed by the terms and location cells they require. When an employer posts a job, the API server writes it to the database and publishes a 'job posted' event to the message queue, so the employer's request returns without waiting on matching. A worker consumes the event and does two things against the search index: it adds the job as a document so ordinary searches find it, and it runs the job through the stored queries, which returns the saved searches that match in milliseconds because only queries sharing a term and a location with the job are even considered. The worker groups matches by user, drops anyone already alerted about this job, and hands them to the notification service, which sends a push or email to the seeker's client, either at once or rolled into a daily digest according to preference. The trade-off is extra index memory for the stored queries in return for work proportional to new jobs rather than to saved searches. What breaks first is a broad saved search such as 'engineer, anywhere' that matches thousands of jobs a day, so alerts per user are capped and digested.",
  },
  {
    id: 'flight-fare-search',
    number: 80,
    title: "Flight Fare Search",
    topic: "Search",
    prompt:
      "Design a flight comparison site: a traveller enters origin, destination, and dates and sees fares from 200 airlines and booking partners, ordered by a blend of price, duration, and number of stops. The fares live in the partners' own systems, which respond in anywhere from 300 ms to 10 seconds, charge per call or enforce quotas, and change prices every few minutes. Results should start appearing within two seconds, and the same popular routes are searched over and over.",
    palette: ['client', 'web_server', 'cache', 'fetcher', 'ranking_service', 'search_index', 'database', 'message_queue'],
    requiredComponents: ['client', 'web_server', 'cache', 'fetcher', 'ranking_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'fetcher'],
      ['web_server', 'ranking_service'],
    ],
    hints: [
      "You do not own the data. There is nothing to index ahead of time: every answer comes from someone else's slow, metered API, and it goes out of date within minutes.",
      "Two things make that bearable: a short-TTL cache keyed by route and dates, so popular searches rarely call partners at all, and a pool of fetchers that query partners in parallel under a hard deadline instead of waiting for the slowest one.",
      "Flow: client → API server → cache. On a miss the API server fans the query out through fetchers to the partners that fly the route, collects whatever returns before the deadline, sends the merged itineraries to the ranker, caches the result for a few minutes, and responds.",
    ],
    solution:
      "The client sends the route and dates to the API server, which checks the cache under a key of origin, destination, dates, and cabin. Popular routes are searched constantly, so most requests are answered from an entry that is at most a few minutes old and cost no partner calls. On a miss the API server picks the partners that actually serve the route and dispatches the query to fetchers, one call per partner, all in parallel. Each fetcher wraps one partner's API: it translates the request, applies that partner's quota, timeout, and circuit breaker, and normalises the response into a common itinerary format. The API server does not wait for all of them; at the deadline it takes what has arrived, removes duplicate itineraries offered by several partners while keeping the cheapest, and passes the set to the ranking service, which scores each itinerary on price, total duration, stops, and departure time. The ordered list is written to the cache with a TTL of a few minutes and returned, and slower partners' fares are merged in when the client polls again. Because cached prices can be stale, the fare is confirmed live with the partner when the traveller clicks through. The trade-off is freshness against partner cost and latency, set by the TTL. What breaks first is one slow partner tying up fetchers, which per-partner concurrency limits and circuit breakers contain.",
  },
  {
    id: 'enterprise-document-search',
    number: 81,
    title: "Enterprise Document Search",
    topic: "Search",
    prompt:
      "Design a company-wide search box that finds documents across the wiki, shared drives, chat, and the ticket tracker, each of which exposes its content only through its own API. An employee must never see a result, not even a title or snippet, from a document they could not open in the source system, and permissions there change daily. The corpus is 500 million documents and a search should return in under 300 ms.",
    palette: ['client', 'web_server', 'search_index', 'database', 'fetcher', 'parser', 'cache', 'url_frontier', 'object_storage'],
    requiredComponents: ['client', 'web_server', 'search_index', 'database', 'fetcher', 'parser'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'database'],
      ['fetcher', 'parser'],
      ['parser', 'search_index'],
    ],
    hints: [
      "Asking each source system 'may this user see this document?' for every candidate result would blow the 300 ms budget. The permission check has to be something the search engine itself can apply as a filter.",
      "Pull content and its access list out of each source with connectors, convert the many formats to plain text, and index every document together with the users and groups allowed to read it. At query time you then only need to know which groups the searcher belongs to.",
      "Flow: fetchers call each source's API for changed documents → the parser extracts text and the access list → search index. Query: client → API server, which reads the user's group memberships from the database and sends the query to the search index with those groups as a mandatory filter.",
    ],
    solution:
      "Ingestion is a connector pipeline. A fetcher per source system calls that system's API, first for a full crawl and afterwards for its change feed, so edits, deletions, and permission changes arrive within minutes. Each fetched item goes to the parser, which turns PDFs, slides, chat threads, and tickets into plain text and normalises the source's sharing settings into a list of allowed principals (user IDs and group IDs). The parser writes one document into the search index containing the text, a link back to the source, and that access list as a filterable field. At query time the client sends the search to the API server. The API server reads the employee's group memberships from the database, which holds a copy of the company directory synced from the identity provider, and issues the query to the search index with a mandatory filter: the document's access list must contain the user or one of their groups. The filter is applied inside the index before ranking, so forbidden documents never contribute a title, snippet, or even a result count. The trade-off is that permissions are as fresh as the last sync, so a revoked share can stay visible for minutes; highly sensitive sources can be re-checked live for the top ten results. What breaks first is a permission change on a huge shared folder, which forces millions of documents to be re-indexed, so index folder-level groups instead of expanding them per document.",
  },
  {
    id: 'ml-feature-store',
    number: 82,
    title: "ML Feature Store",
    topic: "ML",
    prompt:
      "Design a feature store for a company's machine-learning models: at prediction time a model asks for a user's features (such as 'orders in the last 10 minutes' or 'average basket value over 30 days') and must get them from memory in under 5 ms, at 100,000 lookups per second. The same feature values, exactly as they stood at each past moment, must also be available in bulk to build training sets. Features are derived from a continuous stream of application events.",
    palette: ['client', 'web_server', 'cache', 'object_storage', 'message_queue', 'worker', 'time_series_db', 'search_index', 'recommendation_engine'],
    requiredComponents: ['client', 'web_server', 'cache', 'object_storage', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['message_queue', 'worker'],
      ['worker', 'cache'],
      ['worker', 'object_storage'],
    ],
    hints: [
      "Serving and training want opposite things from the same data: serving needs only the latest value per user, instantly; training needs every historical value, cheaply, and can wait minutes for a scan.",
      "Use two stores fed by one computation: an in-memory key-value store holding the current feature values for lookups, and cheap columnar files of timestamped values for training. If two different codebases compute the features, they will drift apart.",
      "Flow: application events → queue → workers compute each feature once and write the latest value to the cache and an appended, timestamped copy to the object store. At prediction time: model service (client) → API server → cache.",
    ],
    solution:
      "Application events (orders, clicks, logins) are published to the message queue. Stream workers consume them and maintain each feature's definition, for example a sliding ten-minute count or a thirty-day running average, per user. Every time a value changes, the worker writes it to two places: the online store, a cache keyed by entity ID and feature group that holds only the newest value, and the offline store, timestamped rows appended as columnar files in the object store. A model service acting as the client asks the feature API server for a list of features for one user; the API server does a single multi-key read from the cache and returns in a couple of milliseconds. To build a training set, a batch job scans the object store and joins each labelled example with the feature values that were current at that example's timestamp, never later ones, which prevents the model from learning from information it would not have had. Because both stores are written by the same worker from the same definition, the values a model trains on are the values it is served. The trade-off is paying for every feature twice in storage in exchange for removing training/serving skew. What breaks first is cache memory as features multiply per user, so give feature groups TTLs and drop features that no deployed model reads.",
  },
  {
    id: 'model-serving-platform',
    number: 83,
    title: "Model Serving Platform",
    topic: "ML",
    prompt:
      "Design the platform that serves a company's trained models behind an HTTP predict endpoint: about 200 models, each a file of 100 MB to 5 GB, answering 30,000 predictions per second in total within a 50 ms budget. A new model version must first receive a small share of traffic and be rolled back in seconds if it misbehaves. Every prediction and its inputs must be logged so it can later be compared with what really happened, without slowing the response.",
    palette: ['client', 'load_balancer', 'web_server', 'object_storage', 'message_queue', 'metadata_db', 'cache', 'worker'],
    requiredComponents: ['client', 'load_balancer', 'web_server', 'object_storage', 'message_queue'],
    requiredConnections: [
      ['client', 'load_balancer'],
      ['load_balancer', 'web_server'],
      ['web_server', 'object_storage'],
      ['web_server', 'message_queue'],
    ],
    hints: [
      "A model is a large immutable file plus stateless code that evaluates it. Once the file is in memory, serving is ordinary horizontal scaling; the interesting parts are getting the right version onto the right servers and splitting traffic between versions.",
      "Keep versioned model files in an object store and have each model server download and warm its version before taking traffic. A load balancer that can weight traffic between server groups gives you canary releases and instant rollback.",
      "Flow: client → load balancer → model server (API server) that already holds the model in memory, having loaded it from the object store at start-up. After answering, the server publishes the inputs and prediction to a queue for offline monitoring.",
    ],
    solution:
      "Training produces an immutable, versioned model file that is uploaded to the object store. Model servers, shown here as API servers, are stateless processes: at start-up each one downloads its assigned version from the object store, loads it into memory, runs a few warm-up predictions, and only then reports itself healthy. A client calls the predict endpoint through the load balancer, which spreads requests across the healthy servers for that model and holds the traffic weights between versions. Releasing version 8 means starting a small group of servers on it and giving them 5% of the traffic; if error rate or latency worsens, setting the weight back to zero is a rollback that takes seconds, because the version 7 servers never went away. Inside the 50 ms budget the server only evaluates the model. Logging is taken off the request path: after responding, the server publishes the request features, the model version, and the prediction to the message queue, and downstream consumers store them and join them with real outcomes to track accuracy and drift. The trade-off is memory cost for fast rollback, since two versions are held in memory during a rollout. What breaks first is cold start: a 5 GB model takes minutes to download and load, so autoscaling must react early and keep spare warm capacity.",
  },
  {
    id: 'realtime-fraud-scoring',
    number: 84,
    title: "Real-Time Fraud Scoring",
    topic: "ML",
    prompt:
      "A payments company must decide whether to approve, challenge, or block each card payment within 100 ms, at 8,000 payments per second. A model scores each payment using behaviour features such as 'payments on this card in the last 5 minutes' and 'distinct countries for this device today', which must reflect activity from only seconds ago. Computing those counts by querying payment history during the request is far too slow.",
    palette: ['client', 'web_server', 'ranking_service', 'cache', 'message_queue', 'worker', 'database', 'search_index', 'notification_service'],
    requiredComponents: ['client', 'web_server', 'ranking_service', 'cache', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'ranking_service'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'cache'],
    ],
    hints: [
      "The 100 ms budget leaves room for a model evaluation and a couple of in-memory reads, nothing more. Any feature that needs counting over history must already be counted when the payment arrives.",
      "Maintain the behaviour counters continuously: stream every payment event through workers that update sliding-window counts per card and per device in an in-memory store. The scoring model (the Ranker component here) then only reads ready-made numbers.",
      "Flow: client → API server → scoring service, which is given the current counters from the cache and returns a risk score. The API server also publishes the payment event to the queue → workers update the counters in the cache for the next payment.",
    ],
    solution:
      "A payment request from the client (the merchant's checkout) reaches the fraud API server. It gathers what it knows about the payment and calls the scoring service, drawn as the ranker, which evaluates a trained model over the payment's own fields plus behaviour features for this card, device, and merchant. Those features are read from the cache as precomputed sliding-window counters, a few key lookups that take about a millisecond, and the model returns a risk score that the API server maps to approve, challenge, or block using thresholds. The counters are kept current by a separate path: the API server publishes every payment attempt as an event to the message queue, and stream workers consume the events and update the windowed counts in the cache (bucketed by minute so old buckets expire by TTL). An attacker who tries a stolen card five times in a minute therefore sees the count rise within a second or two, well before the fifth attempt. Decisions and scores are stored for analysts and as training labels once chargebacks arrive. If the scorer or the cache is slow, the API server falls back to simple rules instead of holding up the payment. The trade-off is that features lag by the stream's processing delay rather than being exactly current. What breaks first is hot keys: a large merchant's counters are updated thousands of times per second, so they are sharded or updated in micro-batches.",
  },
  {
    id: 'reverse-image-search',
    number: 85,
    title: "Reverse Image Search",
    topic: "ML",
    prompt:
      "A shopping app lets a user photograph an item and returns visually similar products from a catalog of 300 million product images in under 500 ms. Sellers add or replace two million images a day, and a new product should be findable by photo within an hour. Comparing the query photo with every catalog image is out of the question, and each result must show the product's current title and price.",
    palette: ['client', 'web_server', 'object_storage', 'message_queue', 'worker', 'search_index', 'database', 'cache', 'cdn'],
    requiredComponents: ['client', 'web_server', 'object_storage', 'message_queue', 'worker', 'search_index', 'database'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'search_index'],
      ['web_server', 'database'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
      ['worker', 'search_index'],
    ],
    hints: [
      "Pixels cannot be compared directly, and 300 million comparisons per query is impossible anyway. Similarity has to become a geometric question: turn each image into a vector so that similar images lie close together.",
      "Run an embedding model over every catalog image offline and store the vectors in an approximate-nearest-neighbour index. A query then embeds one photo and asks the index for the closest few hundred vectors instead of scanning them all.",
      "Flow: a new catalog image lands in the object store and a job goes on the queue → a worker reads the image, computes its embedding, and adds it to the vector search index. Query: client → API server (embeds the photo) → search index for nearest product IDs → database for title and price.",
    ],
    solution:
      "Catalog images are stored in the object store. Whenever a seller adds or replaces one, a job naming the image is placed on the message queue. Embedding workers, which are GPU machines, consume the jobs: each reads the image from the object store, runs it through a vision model to produce a vector of a few hundred numbers, and inserts that vector with its product ID into the search index, here a vector index built for approximate nearest-neighbour lookup. The queue lets two million daily updates be processed steadily and well inside the one-hour target. At query time the client uploads a photo to the API server, which crops to the main object, computes the embedding with the same model, and asks the search index for the few hundred nearest vectors, optionally filtered by category. The index answers in tens of milliseconds because it explores a graph or a handful of clusters rather than all 300 million vectors. The API server then loads those product IDs from the database to attach the current title, price, and availability, drops anything out of stock, and returns the top results. The trade-off is recall against speed and memory, tuned by how much of the index each query explores and how hard vectors are compressed. What breaks first is a model upgrade: new embeddings are not comparable with old ones, so the whole catalog must be re-embedded into a second index before switching.",
  },
  {
    id: 'training-job-orchestrator',
    number: 86,
    title: "Training Job Orchestrator",
    topic: "ML",
    prompt:
      "Design the system a research team uses to launch model-training jobs on a shared pool of 2,000 GPUs. A job runs from minutes to several days, most of the pool is cheap preemptible capacity that can be reclaimed with 30 seconds' warning, and a reclaimed job must resume from where it stopped rather than start over. Teams have GPU quotas, urgent jobs may jump ahead, and users watch job status from a dashboard.",
    palette: ['client', 'web_server', 'database', 'message_queue', 'worker', 'object_storage', 'time_series_db', 'cache', 'sandbox'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'worker', 'object_storage'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['worker', 'database'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
    ],
    hints: [
      "A multi-day job on machines that can vanish with 30 seconds' notice will be interrupted. The design question is not how to prevent that but how little work is lost each time.",
      "Have each training process save a checkpoint to durable shared storage at regular intervals and on the preemption warning. Keep the job's desired state and progress in a database, separate from the machine that happens to be running it.",
      "Flow: client → API server → job row in the database. Runnable jobs wait on a priority queue; a GPU worker takes one, loads the dataset and the latest checkpoint from the object store, trains, saves checkpoints back, and records status and heartbeats in the database.",
    ],
    solution:
      "A researcher submits a job from the client to the API server, which validates it against the team's quota and writes a job row to the database: container image, command, GPU count, priority, and state 'queued'. The database is the source of truth the dashboard reads. Runnable jobs are placed on the message queue in priority order within each team's quota, and GPU workers pull from it when they have free capacity; multi-GPU jobs wait until enough workers are reserved together. A worker that takes a job marks it 'running' in the database, downloads the dataset and, if one exists, the newest checkpoint from the object store, and starts training. It saves a checkpoint (model weights, optimiser state, step number) to the object store every few minutes and writes a heartbeat and the current step to the database. When the provider sends a preemption warning, the worker saves a final checkpoint and exits; whether it managed that or simply died, the missing heartbeat causes the job to be put back on the queue, and the next worker resumes from the last checkpoint. The trade-off is checkpoint frequency: frequent saves waste training time on I/O, rare ones lose more work per preemption. What breaks first is fairness under contention, since large jobs can be starved by a stream of small ones, so the scheduler reserves capacity for the head-of-line job and ages priorities.",
  },
  {
    id: 'ad-serving-auction',
    number: 87,
    title: "Ad Serving & Auction",
    topic: "ML",
    prompt:
      "Design the ad server for a mobile app network: for each ad slot it must choose, among thousands of eligible campaigns, the one with the best expected value (bid times predicted click probability) and respond within 80 ms, 100,000 times per second. A campaign must stop serving promptly when its daily budget runs out, and overspending by more than a few percent is not acceptable. Every impression and click is billed to the advertiser.",
    palette: ['client', 'web_server', 'cache', 'ranking_service', 'database', 'message_queue', 'worker', 'cdn', 'search_index', 'recommendation_engine'],
    requiredComponents: ['client', 'web_server', 'cache', 'ranking_service', 'database', 'message_queue', 'worker'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'ranking_service'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'cache'],
      ['worker', 'database'],
    ],
    hints: [
      "Within 80 ms there is no time to query a campaigns table or add up today's spend. The serving path may only read data that is already in memory, and it must not write anything that needs to be durable.",
      "Keep active campaigns, their targeting, and their remaining budget in an in-memory store the ad server reads; let a prediction service score the candidates. Impressions and clicks become events on a queue, and the consumers of that queue both bill the advertiser and bring the budget numbers up to date.",
      "Flow: client → ad server (API server) → cache for eligible campaigns with budget left → ranker for click probability, then pick the highest bid × probability. Impression and click events → queue → workers → spend counters in the cache and billing records in the database.",
    ],
    solution:
      "The client (an app showing an ad slot) calls the ad API server with the slot and coarse user context. The server reads the eligible campaigns from the cache: targeting indexes, bids, and for each campaign the budget remaining today, all held in memory so selection needs no disk access. It filters out campaigns that do not match or are out of budget and sends the survivors to the ranking service, a model that predicts the click probability of each candidate for this user and slot. The server multiplies bid by probability, runs the auction, returns the winning creative's URL, and publishes an impression event to the message queue; a later click is reported the same way. Stream workers consume those events, remove duplicates and obvious invalid clicks, write the billable record to the database, which is the durable ledger advertisers are invoiced from, and add the cost to the campaign's spend counter in the cache. When spend reaches the budget, the campaign stops being eligible on the next request. Because that loop lags by a second or two, a campaign can overshoot slightly; pacing spreads the budget across the day and throttles a campaign as it nears its limit, which keeps overspend within a few percent. The trade-off is that budget enforcement is eventually consistent so that the request path performs no durable writes. What breaks first is event backlog: if workers fall behind, budgets go stale, so queue lag is the alarm that matters most.",
  },
  {
    id: 'online-auction-bidding',
    number: 88,
    title: "Online Auction Bidding",
    topic: "Marketplace",
    prompt:
      "Design an auction site where each item is sold to the highest bidder at a fixed closing time. In the final seconds a popular item can receive hundreds of bids per second from thousands of watchers, each of whom needs to see the current price within a second without refreshing. A bid must be accepted only if it beats the current highest bid, two simultaneous bids must never both be accepted at the same price, and every bid must be kept for dispute resolution.",
    palette: ['client', 'web_server', 'database', 'message_queue', 'ws_gateway', 'cache', 'worker', 'notification_service'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'ws_gateway'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['web_server', 'message_queue'],
      ['message_queue', 'ws_gateway'],
      ['client', 'ws_gateway'],
    ],
    hints: [
      "Two separate problems: deciding which bid wins is a correctness problem on a single row, while telling thousands of watchers the new price is a fan-out problem. Solve them with different tools.",
      "Let the database arbitrate with a conditional write ('set the price to X only if X is greater than the current price'), so of two racing bids exactly one succeeds. Push accepted bids to watchers over persistent connections rather than having them poll.",
      "Flow: client → API server → conditional update plus a bid-history insert in the database. On success the API server publishes the new price to the queue; WebSocket gateways subscribed to that item push it to every connected watcher.",
    ],
    solution:
      "A bid travels from the client to the API server, which checks the bidder and the amount and then issues one transaction against the database: update the item's current price and leading bidder where the new amount exceeds the current price (plus the minimum increment) and the closing time has not passed, and insert the bid into an append-only history table. The row lock serialises racing bids, so if two arrive together one commits and the other finds the condition false and is told it has been outbid. The closing time is judged by the database's clock, not the bidder's. After a successful commit the API server publishes the item ID and new price to the message queue. Every watcher's client holds a connection to a WS gateway and is registered there under the items it is viewing; the gateways subscribe to the queue and push each price change down to those sockets, so thousands of watchers see it in well under a second and never poll. A client that reconnects fetches the current price from the API server to resynchronise. The trade-off is that all bids on one item pass through one row, which is acceptable because hundreds of small transactions per second on a single row is within a database's reach. What breaks first is the gateway fan-out for a famous item, so price pushes are coalesced to a few per second per item.",
  },
  {
    id: 'subscription-billing',
    number: 89,
    title: "Subscription Billing",
    topic: "Marketplace",
    prompt:
      "Design recurring billing for a subscription product with 20 million subscribers on monthly or annual plans. Each subscriber must be charged once per period on their renewal date, never twice, even if the billing fleet crashes halfway through a run. A failed card should be retried over the following days and the customer warned before access is cut. Renewal dates are uneven, with large spikes on the 1st of the month.",
    palette: ['client', 'web_server', 'database', 'message_queue', 'worker', 'payment_processor', 'notification_service', 'cache', 'rate_limiter'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'worker', 'payment_processor', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['worker', 'database'],
      ['message_queue', 'worker'],
      ['worker', 'payment_processor'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "Nobody is sitting at a screen when a renewal is due, so the system itself must notice the date, and it must be safe for that noticing to happen twice.",
      "Model each billing period as its own invoice row with a unique key of (subscription, period), and send that key to the payment processor as the idempotency key. Creating the invoice and charging it are then both repeatable without double-charging.",
      "Flow: customers manage plans via client → API server → database. A scheduler worker finds subscriptions due in the database, creates the invoice rows, and enqueues a charge job for each; billing workers take jobs from the queue, call the payment processor, update the database, and ask the notification service to send receipts or failure warnings.",
    ],
    solution:
      "Customers sign up, change plan, or cancel from the client through the API server, which keeps each subscription in the database with its plan, payment-method token, status, and next renewal time. A scheduler worker scans the database continuously for subscriptions whose renewal time has arrived. For each one it inserts an invoice row keyed uniquely by subscription and billing period, which fails harmlessly if a previous run already created it, and places a charge job on the message queue. Billing workers consume the queue at a controlled rate, which smooths the spike on the 1st. A worker calls the payment processor with the invoice ID as the idempotency key, so a worker that crashes after charging but before recording simply repeats the call and receives the original result instead of charging again. On success it marks the invoice paid and advances the renewal time in the database, then asks the notification service to send the customer a receipt. On a decline it marks the subscription past due, schedules the next attempt (for example after 1, 3, and 7 days) by re-enqueueing with a delay, and has the notification service warn the customer to update their card; after the last attempt the subscription is suspended. The trade-off is throughput against processor limits and decline rates, since charging everything at midnight triggers throttling. What breaks first is the due-subscriptions scan, which needs an index on renewal time and several scanners claiming disjoint ranges.",
  },
  {
    id: 'package-tracking',
    number: 90,
    title: "Package Tracking",
    topic: "Marketplace",
    prompt:
      "Design the tracking service for a parcel network handling 30 million parcels a day: scanners at depots and in vans report events (picked up, at depot, out for delivery, delivered), and customers open a tracking page or receive a notification when the status changes. Scan events arrive in bursts, sometimes twice, and sometimes hours late and out of order from scanners that were offline. Tracking pages are read far more often than they change, and a few parcels are refreshed obsessively.",
    palette: ['client', 'web_server', 'message_queue', 'worker', 'database', 'cache', 'notification_service', 'location_service', 'search_index'],
    requiredComponents: ['client', 'web_server', 'message_queue', 'worker', 'database', 'cache', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'database'],
      ['web_server', 'database'],
      ['web_server', 'cache'],
      ['worker', 'notification_service'],
      ['notification_service', 'client'],
    ],
    hints: [
      "The order in which scans arrive is not the order in which they happened. If 'current status' is simply the last event received, a late 'at depot' scan will overwrite 'delivered'.",
      "Accept scans quickly onto a queue and let workers apply them: store every event with the scanner's own timestamp and a unique scan ID, and derive the current status from the event with the latest scan time, not the latest arrival. Notify only when that derived status actually changes.",
      "Flow: scanner (client) → API server → queue → worker → events and current status in the database, and the notification service on a change. Customer (client) → API server → cache → database on a miss.",
    ],
    solution:
      "There are two kinds of client: scanners that write and customers who read. A scanner uploads its events, each with a scan ID and the time recorded on the device, to the API server, which publishes them to the message queue partitioned by parcel ID and acknowledges, so a burst when a van comes back into coverage is absorbed without loss. Workers consume each partition in order. For every event a worker inserts it into the parcel's event history in the database, using the scan ID as a unique key so a scan sent twice is stored once, then recomputes the parcel's current status as the event with the latest scan time. A late 'at depot' scan is therefore added to the history but does not replace 'delivered'. Only when the current status actually changes does the worker call the notification service, which sends the customer a push, text, or email. A customer's tracking page is served by the API server from the cache, keyed by tracking number, and filled from the database on a miss; the entry is refreshed when the status changes and otherwise has a short TTL, so the few people refreshing every ten seconds never reach the database. The trade-off is that customers can briefly see an older status while late scans are in transit. What breaks first is the event table's size, so it is partitioned by date and delivered parcels are archived after a few months.",
  },
  {
    id: 'presence-online-status',
    number: 91,
    title: "Presence & Online Status",
    topic: "Realtime",
    prompt:
      "Design the presence system for a chat app: a green dot shows which of a user's contacts are online, and it should flip within a few seconds when someone connects or disappears, including when a phone loses signal without saying goodbye. Fifty million users are connected at once over long-lived connections spread across hundreds of connection servers, and each has around 300 contacts. Presence is not worth storing durably.",
    palette: ['client', 'load_balancer', 'ws_gateway', 'cache', 'message_queue', 'database', 'web_server', 'notification_service'],
    requiredComponents: ['client', 'load_balancer', 'ws_gateway', 'cache', 'message_queue'],
    requiredConnections: [
      ['client', 'load_balancer'],
      ['load_balancer', 'ws_gateway'],
      ['ws_gateway', 'cache'],
      ['ws_gateway', 'message_queue'],
    ],
    hints: [
      "A phone that drops off the network sends no 'offline' message. Online cannot be a flag someone has to remember to clear; it has to be something that lapses on its own unless it is renewed.",
      "Represent 'online' as a key with a short TTL in an in-memory store, refreshed by heartbeats over the user's connection. The interested contacts are connected to other servers, so status changes need a publish/subscribe channel between connection servers.",
      "Flow: client → load balancer → a WebSocket gateway, which holds the connection. Each heartbeat refreshes the user's key in the cache. On connect or expiry the gateway publishes the change to the queue; gateways holding that user's online contacts are subscribed and push the new status down.",
    ],
    solution:
      "A client opens a long-lived connection through the load balancer, which only has to pick a WS gateway with spare capacity; after that the socket stays pinned to that gateway. The gateway writes a presence key for the user into the cache with a TTL of about 30 seconds and renews it each time the client's heartbeat arrives, every 10 seconds or so. A clean disconnect deletes the key; a phone that silently vanishes just stops sending heartbeats and the key lapses, which is what turns the dot grey without anyone announcing it. When a user comes online, their gateway reads the keys of their 300 contacts from the cache in one batched call to paint the initial dots, and subscribes to those contacts' channels on a publish/subscribe message queue. Each transition (first connection, or expiry noticed by the gateway that owned the socket) is published to the user's channel, and every gateway with a subscribed contact pushes the change to that contact's client. Nothing is written to disk: after a failure the state rebuilds itself within one heartbeat interval. The trade-off is heartbeat interval against load and accuracy, since shorter intervals detect drops faster but multiply writes. What breaks first is flapping on poor mobile networks, which floods subscribers, so going offline is delayed by a short grace period, and users with enormous contact lists are polled on demand instead of subscribed.",
  },
  {
    id: 'live-trivia-show',
    number: 92,
    title: "Live Trivia Game Show",
    topic: "Realtime",
    prompt:
      "Design a live trivia game show: a host is streamed on video to two million players, who each get 10 seconds to answer a multiple-choice question, and a wrong answer eliminates them. All two million answers arrive inside the same ten-second window, none may be lost because prize money depends on them, and an eliminated player must not be able to answer later questions. The number of players who chose each option is shown moments after a question closes; the video may run a few seconds behind the studio.",
    palette: ['client', 'cdn', 'media_server', 'web_server', 'message_queue', 'worker', 'cache', 'ws_gateway', 'database', 'load_balancer'],
    requiredComponents: ['client', 'cdn', 'media_server', 'web_server', 'message_queue', 'worker', 'cache'],
    requiredConnections: [
      ['client', 'cdn'],
      ['cdn', 'media_server'],
      ['client', 'web_server'],
      ['web_server', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'cache'],
      ['web_server', 'cache'],
    ],
    hints: [
      "The video and the answers are separate systems with separate bottlenecks. Video is one stream copied to two million viewers; answers are two million tiny writes squeezed into ten seconds.",
      "One-to-many video that may lag a few seconds is a job for segmented streaming through a CDN. For the answer spike, the API should do almost nothing per request: check the player is still in the game, append the answer to a durable queue, and return.",
      "Flow: studio → media server → CDN → clients for video. Answers: client → API server, which checks the eliminated set in the cache and publishes to the queue → workers tally the options and mark eliminated players in the cache.",
    ],
    solution:
      "The host's camera feed goes to a media server, which encodes it at several bitrates and cuts it into short segments. Clients fetch those segments from the CDN, which pulls them from the media server once and serves the same bytes to two million players; a few seconds of delay is the price of that efficiency, and each question is embedded in the stream's timeline so it appears on every screen together with the host asking it. Answering is the hard part. The client sends its choice to the API server, which reads from the cache whether the player is still in the game and whether the question is still open (allowing for that player's stream delay), publishes the answer to the message queue, and acknowledges. The API server does no counting, so the tier scales by adding instances behind it, and the queue's durable log means no accepted answer is lost. Workers consume the answers, keep only the first one per player per question, increment the per-option tallies in the cache, and, when the question closes, add everyone who answered wrongly or not at all to the eliminated set in the cache. The totals shown on screen are read from those tallies. The trade-off is that results appear a moment after the window closes rather than live. What breaks first is the synchronised spike itself, so capacity is provisioned ahead of each show and clients add a little random delay before sending.",
  },
  {
    id: 'support-chat-routing',
    number: 93,
    title: "Support Chat Routing",
    topic: "Realtime",
    prompt:
      "Design live chat for a customer-support centre: a customer opens a chat widget and must be connected to a free human agent with the right skill (billing, technical, a given language), longest-waiting customer first. Five thousand agents each handle up to three chats at once and their availability changes second by second; 20,000 chats are in progress at peak. Messages must flow in real time in both directions, and full transcripts must be kept for years.",
    palette: ['client', 'ws_gateway', 'web_server', 'matching_service', 'cache', 'database', 'notification_service', 'search_index', 'load_balancer'],
    requiredComponents: ['client', 'ws_gateway', 'web_server', 'matching_service', 'cache', 'database'],
    requiredConnections: [
      ['client', 'ws_gateway'],
      ['ws_gateway', 'web_server'],
      ['web_server', 'matching_service'],
      ['matching_service', 'cache'],
      ['web_server', 'database'],
    ],
    hints: [
      "There are three kinds of state with different lifetimes: open connections (seconds), who is free and who is waiting (changes constantly, can be rebuilt), and transcripts (kept for years). They should not share a store.",
      "Give the assignment decision to a dedicated matcher that keeps waiting customers per skill and agent capacity in an in-memory store, where taking a slot can be done atomically. Keep the gateways dumb: they hold sockets and forward frames.",
      "Flow: customer and agent clients ↔ WebSocket gateway ↔ chat service (API server). A new chat: API server → matcher, which reads and updates queues and agent slots in the cache and returns an agent. Every message: API server → database, then out through the gateway to the other party.",
    ],
    solution:
      "Customers and agents are both clients holding a WebSocket to a WS gateway, whose only job is to keep sockets open and pass frames to and from the chat service, an API server tier that owns the logic. When a customer starts a chat, the API server creates a conversation row in the database and asks the matching service for an agent. The matcher keeps its working state in the cache: for each skill a queue of waiting conversations ordered by arrival time, and for each agent their skills, status, and number of open chats. It picks the longest-waiting conversation an available agent can serve and claims one of that agent's three slots with an atomic operation, so two matcher instances cannot hand the same slot to two customers. If nobody is free the conversation stays in the queue and the matcher runs again whenever an agent closes a chat or comes online. Once assigned, each message goes from the sender's gateway to the API server, which appends it to the transcript in the database and then forwards it through the gateway holding the other party's socket, so nothing is shown that has not been stored. If the cache is lost, queues and slot counts are rebuilt from the open conversations in the database. The trade-off is strict longest-wait fairness against best skill fit. What breaks first is an agent's dropped connection leaving customers stranded, so missed heartbeats return that agent's chats to the front of the queue.",
  },
  {
    id: 'login-session-service',
    number: 94,
    title: "Login & Session Service",
    topic: "Infrastructure",
    prompt:
      "Design the login and session service for a consumer app with 100 million accounts. Password verification is deliberately slow (a strong hash costs about 100 ms of CPU), yet each of the 200,000 API requests per second must be confirmed as coming from a logged-in user in about a millisecond. A user must be able to log out of all devices and have it take effect immediately, and attackers replaying leaked password lists must be slowed down.",
    palette: ['client', 'web_server', 'database', 'cache', 'rate_limiter', 'id_generator', 'notification_service', 'message_queue'],
    requiredComponents: ['client', 'web_server', 'database', 'cache', 'rate_limiter'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'rate_limiter'],
      ['web_server', 'database'],
      ['web_server', 'cache'],
    ],
    hints: [
      "Proving who you are (once, slowly, against the password hash) and proving you are still logged in (on every request, fast) are different operations and should hit different stores.",
      "After a successful login, issue a random session token and keep the session server-side in an in-memory store. A self-contained signed token would be faster still, but it cannot be revoked instantly, and 'log out everywhere' demands that.",
      "Flow: login: client → API server → rate limiter (per account and per IP) → database for the password hash → new session written to the cache. Every later request: API server → cache lookup of the token. Logout everywhere deletes all of that user's sessions from the cache.",
    ],
    solution:
      "To log in, the client posts credentials to the API server. Before doing any expensive work, the API server asks the rate limiter, which counts recent attempts per account and per IP address; over the threshold it answers with a delay or a challenge, which is what blunts credential-stuffing, since each guess costs the attacker time while the server skips the 100 ms hash. Allowed attempts load the account's salted password hash from the database and verify it. On success the API server generates a long random session token, stores a session record (user ID, device, creation time) in the cache under that token with a sliding expiry, adds the token to a per-user set of sessions, and returns it to the client in a secure cookie. Every subsequent request carries the token and the API server validates it with a single cache read, about a millisecond, never touching the database or the password hash. Logging out everywhere is a deletion of every token in the user's set, effective on the very next request, and a password change does the same. The trade-off is a cache lookup on each request versus stateless signed tokens that need no lookup but stay valid until they expire. What breaks first is the session store: if it is lost every user is logged out at once and the slow login path is stampeded, so it is replicated and login is rate-limited globally.",
  },
  {
    id: 'uptime-monitor',
    number: 95,
    title: "Uptime Monitor",
    topic: "Infrastructure",
    prompt:
      "Design an uptime monitoring product: customers register HTTP endpoints to be checked every 30 seconds from several regions, view response-time charts, and are alerted when an endpoint goes down. There are five million checks, so roughly 170,000 probes run every second on a strict schedule. A failure seen from only one region is usually a network blip there and must not page anyone, and a customer must not be paged repeatedly for the same outage.",
    palette: ['client', 'web_server', 'database', 'worker', 'message_queue', 'fetcher', 'time_series_db', 'notification_service', 'cache', 'load_balancer'],
    requiredComponents: ['client', 'web_server', 'database', 'worker', 'message_queue', 'fetcher', 'time_series_db', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['worker', 'database'],
      ['worker', 'message_queue'],
      ['message_queue', 'fetcher'],
      ['worker', 'time_series_db'],
      ['web_server', 'time_series_db'],
      ['worker', 'notification_service'],
    ],
    hints: [
      "Three jobs hide in this product: deciding when each check is due, making the outbound request from a particular region, and deciding whether the results add up to an outage. They scale differently and fail differently.",
      "Use a scheduler that emits due checks onto per-region queues, a fleet of probes in each region that only makes HTTP requests, a time-series store for the measurements, and an evaluator that looks across regions before alerting.",
      "Flow: client → API server → check definitions in the database. Scheduler workers read the definitions and enqueue due checks → regional fetchers probe the endpoints and report results. Evaluator workers examine recent results in the time-series DB and call the notification service on a confirmed state change; charts are API server → time-series DB.",
    ],
    solution:
      "Customers define checks from the client through the API server, which stores each check's URL, interval, regions, and alert contacts in the database. Scheduler workers load those definitions from the database, shard them by check ID so each scheduler owns a slice, and every 30 seconds place one probe job per region on that region's message queue, with a little jitter so targets are not hit by a synchronised wave. In each region a fleet of fetchers consumes its queue; a fetcher makes the HTTP request with a strict timeout and records status, latency, and region, and those measurements are written into the time-series DB. Evaluator workers read the most recent results per check from the time-series DB and apply the rule: the check is down only if a majority of regions failed on consecutive rounds, which filters out a single region's network trouble. The check's state (up or down) lives in the database, and the worker calls the notification service only when that state changes, so one outage produces one page and one recovery message rather than a page every 30 seconds. Charts are served by the API server querying the time-series DB, which downsamples old data. The trade-off is detection speed against false alarms, set by how many rounds and regions must agree. What breaks first is schedule drift when a region's probes fall behind, so queue lag per region is monitored and stale jobs are dropped rather than run late.",
  },
  {
    id: 'container-image-registry',
    number: 96,
    title: "Container Image Registry",
    topic: "Infrastructure",
    prompt:
      "Design a container image registry: build systems push images made of layers (compressed archives from a few KB to several GB) and servers around the world pull them at deploy time. Thousands of images share the same few base layers, so storing or uploading an identical layer twice is wasteful. Pulls outnumber pushes 100 to 1, a deploy can make ten thousand machines pull one image within a minute, and a tag such as 'latest' must switch to a new image atomically.",
    palette: ['client', 'web_server', 'metadata_db', 'object_storage', 'cdn', 'cache', 'message_queue', 'load_balancer'],
    requiredComponents: ['client', 'web_server', 'metadata_db', 'object_storage', 'cdn'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'metadata_db'],
      ['web_server', 'object_storage'],
      ['cdn', 'object_storage'],
      ['client', 'cdn'],
    ],
    hints: [
      "If a layer is named by the hash of its bytes, two identical layers have the same name. Deduplication, integrity checking, and safe caching forever all follow from that one decision.",
      "Split the image into immutable blobs (layers, addressed by digest, in an object store behind a CDN) and small mutable pointers (a manifest listing the layer digests, and tags pointing at manifests, in a metadata database).",
      "Flow: push: client asks the API server whether each layer digest already exists, uploads only the missing ones into the object store, then the API server records the manifest and moves the tag in the metadata DB. Pull: client → API server for the manifest, then each layer from the CDN.",
    ],
    solution:
      "An image is a manifest, a small JSON document listing the digests of its layers, plus the layers themselves, each named by the SHA-256 of its content. To push, the client asks the API server for each layer digest whether the registry already has it; base layers almost always exist, so nothing is uploaded for them. Missing layers are sent in resumable chunks through the API server into the object store, and the API server verifies that the bytes hash to the claimed digest before accepting them. Finally the client uploads the manifest and the API server, in one transaction on the metadata DB, stores it and points the tag at it. That single row update is the atomic switch: a puller sees either the old image or the new one, never a mixture. To pull, the client asks the API server to resolve the tag, receives the manifest from the metadata DB, and downloads each layer it lacks from the CDN, which fetches from the object store on a miss. Because a digest's content can never change, layers are cached at the edge indefinitely and verified by the client after download, so ten thousand machines pulling at once are served from the edge. The trade-off is garbage collection: shared layers can only be deleted once no manifest references them, which needs reference counting or a mark-and-sweep pass. What breaks first is the manifest and tag lookup path during mass deploys, which is small, cacheable, and worth putting in memory.",
  },
  {
    id: 'read-replica-scaling',
    number: 97,
    title: "Read Replica Scaling",
    topic: "Infrastructure",
    prompt:
      "A profile service for a social app keeps 300 million user profiles in a single relational database that is running out of headroom: 60,000 reads per second against 1,500 writes, with a small set of celebrity profiles drawing a large share of the reads. The data and its transactions fit comfortably on one machine, but the reads do not, and the service must survive the loss of that machine without losing committed writes. A user who edits their profile must see the change on their very next page load.",
    palette: ['client', 'load_balancer', 'web_server', 'cache', 'database', 'replica', 'message_queue', 'search_index'],
    requiredComponents: ['client', 'load_balancer', 'web_server', 'cache', 'database', 'replica'],
    requiredConnections: [
      ['client', 'load_balancer'],
      ['load_balancer', 'web_server'],
      ['web_server', 'cache'],
      ['web_server', 'database'],
      ['web_server', 'replica'],
      ['database', 'replica'],
    ],
    hints: [
      "Writes are tiny and fit on one node, so splitting the data across shards would add complexity for no gain. The thing to multiply is read capacity, plus a second copy of the data to survive a failure.",
      "Keep one primary that takes every write and stream its changes to several read-only replicas, with a cache in front for the handful of profiles everyone looks at. Replicas lag by a moment, so decide which reads may be slightly stale and which must go to the primary.",
      "Flow: client → load balancer → stateless API servers. Writes go API server → primary database, which replicates to the replicas. Ordinary reads go API server → cache, then a replica on a miss; a user's reads just after their own write go to the primary.",
    ],
    solution:
      "Clients reach a fleet of stateless API servers through a load balancer, so the application tier scales by adding machines. The database is run as one primary and several replicas: every write goes from an API server to the primary database, which streams its change log to the replicas, and the API servers send read queries to the replicas, spread evenly across them. In front of the replicas the API servers keep the most-viewed profiles in a cache with a short TTL, deleting an entry when its profile is edited, so the celebrity profiles that dominate the traffic cost no query at all. The remaining reads become a matter of how many replicas there are, while the primary handles only 1,500 writes and the replication stream. Replication is asynchronous to most replicas, so they trail the primary by tens of milliseconds, which is fine for viewing someone else's profile but not for your own edit. The API server therefore pins a user's reads to the primary for a few seconds after that user writes (or waits until the replica has caught up to the write's log position), giving read-your-own-writes without sending all reads to the primary. For durability, at least one replica is synchronous: the primary acknowledges a commit only after that replica has it, so if the primary dies that replica can be promoted with no committed write lost. The trade-off is that synchronous replication adds a network round trip to every write. What breaks first is replica lag under a write burst or a long-running query, so API servers watch each replica's lag and take a lagging one out of rotation.",
  },
  {
    id: 'change-data-capture',
    number: 98,
    title: "Change Data Capture Pipeline",
    topic: "Pipeline",
    prompt:
      "An application's relational database is the source of truth for orders, and two other systems need a copy of every change: a search index used by the support team and a data lake of files used for analytics. The copies must never miss a change or apply two changes to one row in the wrong order, and should lag by seconds rather than hours. This must be achieved without adding load or new code paths to the application's own write requests, and a downstream system that is offline for an hour must catch up on its own.",
    palette: ['database', 'agent', 'message_queue', 'worker', 'search_index', 'object_storage', 'web_server', 'cache', 'time_series_db'],
    requiredComponents: ['database', 'agent', 'message_queue', 'worker', 'search_index', 'object_storage'],
    requiredConnections: [
      ['database', 'agent'],
      ['agent', 'message_queue'],
      ['message_queue', 'worker'],
      ['worker', 'search_index'],
      ['worker', 'object_storage'],
    ],
    hints: [
      "Having the application write to the database and then also to the index and the lake fails in the gap between the writes: a crash there leaves the copies permanently different. The database already keeps a complete, ordered record of every committed change.",
      "Attach a small log-reading agent to the database's replication log and publish each committed change as an event to a durable, replayable queue, partitioned by primary key. Each destination gets its own consumer with its own position in the stream.",
      "Flow: database → agent tailing the transaction log → queue → workers. One group of workers upserts documents into the search index; another batches events into files in the object store. Each group commits its offset only after its write succeeds.",
    ],
    solution:
      "The application keeps writing to its database exactly as before and knows nothing about the pipeline. A change-capture agent connects to the database as if it were a replica and reads the transaction log, which contains every committed insert, update, and delete in commit order. It turns each log entry into an event (table, primary key, new row image, log position) and publishes it to the message queue, using the primary key as the partition key so all changes to one row stay in order on one partition. The agent stores the log position it has reached, so after a restart it resumes from there without skipping. Two independent groups of workers consume the queue. The first upserts or deletes the matching document in the search index, using the log position as a version number so a redelivered or late event can never overwrite newer data. The second buffers events and writes them as batched columnar files into the object store, partitioned by date, forming the data lake. Each group commits its queue offset only after its write succeeds; because the queue retains events for days, a destination that was down for an hour just reads forward from its last offset. The trade-off is at-least-once delivery, which requires every sink to be idempotent. What breaks first is a schema change or a bulk update in the source, which floods the stream, so a schema registry and lag alerts per consumer group are essential.",
  },
  {
    id: 'news-feed-aggregator',
    number: 99,
    title: "News Feed Aggregator",
    topic: "Pipeline",
    prompt:
      "Design a news aggregator that follows two million RSS and Atom feeds and shows each reader a timeline of new articles from the feeds they subscribe to. Some feeds publish every minute and most publish once a week, so polling them all at one rate either misses news or wastes most requests. The same article often appears in several feeds or is republished under a new URL, and readers should see it once.",
    palette: ['client', 'web_server', 'database', 'message_queue', 'fetcher', 'parser', 'deduper', 'cache', 'search_index', 'object_storage'],
    requiredComponents: ['client', 'web_server', 'database', 'message_queue', 'fetcher', 'parser', 'deduper'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['message_queue', 'fetcher'],
      ['fetcher', 'parser'],
      ['parser', 'deduper'],
      ['deduper', 'database'],
    ],
    hints: [
      "The list of feeds is fixed and known, so this is a scheduling problem rather than a discovery problem: each feed should be polled at a rate that follows how often it has actually published.",
      "Give every feed its own next-poll time, adapted after each poll, and release due feeds onto a queue for a pool of fetchers. Use conditional requests so an unchanged feed costs almost nothing. Identify duplicates by a fingerprint of the content, because URLs and IDs are not reliable.",
      "Flow: due feeds → queue → fetcher (conditional GET) → parser extracts the entries → deduper compares each entry's fingerprint with those already seen and stores only new articles in the database. Readers: client → API server → database.",
    ],
    solution:
      "Each feed has a row in the database holding its URL, last ETag, and next poll time. A scheduler releases feeds whose time has come onto the message queue, and a pool of fetchers consumes it. A fetcher makes a conditional GET with the saved ETag or Last-Modified value, so an unchanged feed returns an empty 304 response, and it limits concurrent requests per host to stay polite. After each poll the feed's interval is adjusted: it shrinks towards a minute if new entries were found and grows towards a day if not, which concentrates requests on the feeds that are actually active. Fetched documents go to the parser, which copes with the many dialects of RSS and Atom and emits normalised entries: title, link, published time, and cleaned text. Each entry passes to the deduper, which canonicalises the link, computes a fingerprint of the normalised title and text, and checks it against the fingerprints already stored; a new article is written to the database once and linked to every feed that carried it, while a repeat only adds another feed link. A reader's client asks the API server for the timeline; the API server queries the database for recent articles from the feeds that reader subscribes to and returns each article once. The trade-off is polling economy against freshness for feeds that suddenly wake up. What breaks first is the timeline query for readers with thousands of subscriptions, which then needs precomputed per-reader timelines.",
  },
  {
    id: 'settlement-reconciliation',
    number: 100,
    title: "Settlement Reconciliation",
    topic: "Pipeline",
    prompt:
      "Every night a payments company receives settlement files from a dozen banks and card networks, tens of millions of rows in total, listing what each one actually paid out. Each row must be matched against the company's own ledger, and anything missing, duplicated, or different in amount must be in front of the finance team by morning. A file may arrive late, arrive twice, or be re-issued with corrections, and a run that crashes midway must be safe to run again.",
    palette: ['client', 'web_server', 'database', 'object_storage', 'message_queue', 'worker', 'notification_service', 'cache', 'payment_processor', 'search_index'],
    requiredComponents: ['client', 'web_server', 'database', 'object_storage', 'message_queue', 'worker', 'notification_service'],
    requiredConnections: [
      ['client', 'web_server'],
      ['web_server', 'database'],
      ['message_queue', 'worker'],
      ['worker', 'object_storage'],
      ['worker', 'database'],
      ['worker', 'notification_service'],
    ],
    hints: [
      "Treat each incoming file as an immutable input you can always return to. If the raw file is kept untouched and the processing is a pure function of it, then 'run it again' is always a safe answer to a crash or a corrected file.",
      "Land files in an object store, drive processing with a queue of file and chunk jobs so many workers can share one large file, and make every write keyed by (file, row) so repeating a chunk changes nothing.",
      "Flow: a file lands in the object store and a job goes on the queue → workers read the file in chunks, match each row to the ledger in the database, and record matches and exceptions there → the notification service tells finance when a run finishes. Finance reviews exceptions via client → API server → database.",
    ],
    solution:
      "Banks deliver their files into the object store, where each is kept unmodified under a key that includes its source, date, and a checksum. A job describing the new file is placed on the message queue. A worker takes it and first checks the checksum against files already processed: an exact repeat is ignored, while a corrected re-issue is recorded as a new version that supersedes the old one. The worker then splits the file into chunks of rows and enqueues one job per chunk, so dozens of workers reconcile a ten-million-row file in parallel. Each chunk worker reads its rows from the object store, looks up the corresponding ledger entries in the database by the payment reference, and writes a result row per settlement line: matched, amount mismatch, missing in ledger, or duplicate. Results are keyed by file version and row number, so a chunk that is retried after a crash overwrites its own results instead of duplicating them. When all chunks of a file are finished, a final step finds ledger entries that should have settled but appear in no file, and the worker asks the notification service to tell the finance team that the run is complete and how many exceptions it produced. Analysts open the dashboard client, which reads the exceptions from the database through the API server and lets them resolve each one. The trade-off is strict matching against tolerance for small fee and currency differences. What breaks first is the ledger lookups competing with daytime traffic, so the run uses a read replica.",
  },
];
