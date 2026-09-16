// Java backend build problems graded by the rules engine and compile-checked at authoring time. `language: 'java'`, `kind: 'build'`.
// Shares the BugFixProblem shape: `kind: 'build'` problems show a skeleton in
// the editor and grade the user's implementation against tests (Python /
// JavaScript) or rules (Java / Swift / Kotlin). See bugFixes.ts for the type.

import type { BugFixProblem } from './bugFixes';

export const javaBuildProblems: BugFixProblem[] = [
  // ---------------------------------------------------------------- Services & APIs
  {
    id: 'java-build-rider-signup-field-errors',
    number: 1,
    language: 'java',
    kind: 'build',
    title: 'Rider Signup Field Errors',
    difficulty: 'Easy',
    topic: 'Services & APIs',
    statement:
      'A bike-share signup endpoint must report **every** invalid field at once, not just the first. Implement `validate(SignupRequest req)` returning a `List<FieldError>` (field name + message):\n\n- `handle`: required, 3–20 characters after checking it is not blank.\n- `email`: required and must contain an `@`.\n- `age`: required (may be null) and must be at least 16.\n\nReturn an **empty list** when everything is valid — never null. Order errors handle, email, age.',
    functionSignature: 'public static List<FieldError> validate(SignupRequest req)',
    buggyCode: `public class SignupValidator {
    public record SignupRequest(String handle, String email, Integer age) {}
    public record FieldError(String field, String message) {}

    public static List<FieldError> validate(SignupRequest req) {
        // TODO: collect every violation instead of stopping at the first
        return null;
    }
}
`,
    solution: `public class SignupValidator {
    public record SignupRequest(String handle, String email, Integer age) {}
    public record FieldError(String field, String message) {}

    public static List<FieldError> validate(SignupRequest req) {
        List<FieldError> errors = new ArrayList<>();

        String handle = req.handle();
        if (handle == null || handle.isBlank()) {
            errors.add(new FieldError("handle", "required"));
        } else if (handle.length() < 3 || handle.length() > 20) {
            errors.add(new FieldError("handle", "must be 3-20 characters"));
        }

        String email = req.email();
        if (email == null || email.isBlank()) {
            errors.add(new FieldError("email", "required"));
        } else if (!email.contains("@")) {
            errors.add(new FieldError("email", "must contain @"));
        }

        Integer age = req.age();
        if (age == null) {
            errors.add(new FieldError("age", "required"));
        } else if (age < 16) {
            errors.add(new FieldError("age", "must be at least 16"));
        }

        return errors;
    }
}
`,
    hint: 'Build an ArrayList of FieldError and keep going after each failed check; the caller wants the whole picture in one round trip.',
    explanation:
      'Accumulating errors into a list (instead of throwing on the first) lets a client highlight every bad field in one request. Returning an empty list rather than null means callers can write `errors.isEmpty()` without a null check. Nullable boxed types like `Integer age` must be null-checked before comparison or they throw on unboxing.',
    rules: [
      { label: 'Accumulates FieldError values into a list', type: 'mustContain', pattern: 'errors\\s*\\.add\\s*\\(|\\.add\\s*\\(\\s*new\\s+FieldError', regex: true },
      { label: 'Checks the email contains an @', type: 'mustContain', pattern: 'contains\\s*\\(\\s*"@"\\s*\\)|indexOf\\s*\\(\\s*[\'"]@[\'"]\\s*\\)', regex: true },
      { label: 'Enforces the minimum age of 16', type: 'mustContain', pattern: '<\\s*16|>=\\s*16', regex: true },
      { label: 'Returns an empty list, never null', type: 'mustNotContain', pattern: 'return null' },
    ],
  },
  {
    id: 'java-build-episode-feed-cursor-page',
    number: 2,
    language: 'java',
    kind: 'build',
    title: 'Episode Feed Cursor Page',
    difficulty: 'Medium',
    topic: 'Services & APIs',
    statement:
      'A podcast feed is served in pages keyed by an opaque cursor. Implement `page(List<Episode> episodes, String cursor, int limit)`:\n\n- `episodes` is already in feed order. `cursor` is `null` for the first page, otherwise the `id` of the last episode the client received.\n- Return up to `limit` episodes **after** the cursor position.\n- `nextCursor` is the id of the last returned episode when more remain, otherwise `null`.\n- Throw `IllegalArgumentException` for `limit <= 0` or a cursor id that is not in the list.\n\nThe returned items list must not share structure with the input (copy the slice).',
    functionSignature: 'public static Page page(List<Episode> episodes, String cursor, int limit)',
    buggyCode: `public class EpisodeFeed {
    public record Episode(String id, String title) {}
    public record Page(List<Episode> items, String nextCursor) {}

    public static Page page(List<Episode> episodes, String cursor, int limit) {
        // TODO: slice after the cursor, compute nextCursor only when more remain
        return new Page(List.of(), null);
    }
}
`,
    solution: `public class EpisodeFeed {
    public record Episode(String id, String title) {}
    public record Page(List<Episode> items, String nextCursor) {}

    public static Page page(List<Episode> episodes, String cursor, int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("limit must be positive");
        }
        int start = 0;
        if (cursor != null) {
            int idx = -1;
            for (int i = 0; i < episodes.size(); i++) {
                if (episodes.get(i).id().equals(cursor)) {
                    idx = i;
                    break;
                }
            }
            if (idx < 0) {
                throw new IllegalArgumentException("unknown cursor: " + cursor);
            }
            start = idx + 1;
        }
        int end = Math.min(start + limit, episodes.size());
        List<Episode> items = new ArrayList<>(episodes.subList(start, end));
        String next = end < episodes.size() ? items.get(items.size() - 1).id() : null;
        return new Page(items, next);
    }
}
`,
    hint: 'Find the index of the cursor id, start one past it, clamp the end with Math.min, and only emit a nextCursor when end is still before the list size.',
    explanation:
      'Cursor pagination hands the client a stable position (the last id seen) instead of an offset, so inserts at the head do not cause skipped or duplicated rows. Clamping the end index with Math.min avoids IndexOutOfBounds on the last page, and emitting nextCursor only when items remain gives clients a clean "done" signal. Copying the subList prevents the returned page from being a live view of the source list.',
    rules: [
      { label: 'Clamps the end of the slice to the list size with Math.min', type: 'mustContain', pattern: 'Math\\.min\\s*\\(', regex: true },
      { label: 'Slices the source list (subList or stream skip/limit)', type: 'mustContain', pattern: 'subList\\s*\\(|\\.skip\\s*\\(', regex: true },
      { label: 'Rejects a bad limit or unknown cursor with IllegalArgumentException', type: 'mustContain', pattern: 'IllegalArgumentException' },
      { label: 'No longer returns the empty placeholder page', type: 'mustNotContain', pattern: 'new Page(List.of(), null)' },
    ],
  },
  {
    id: 'java-build-charge-once-idempotency-key',
    number: 3,
    language: 'java',
    kind: 'build',
    title: 'Charge Once Per Idempotency Key',
    difficulty: 'Hard',
    topic: 'Services & APIs',
    statement:
      'Payment clients retry on timeouts, so `charge(String idempotencyKey, Supplier<Receipt> work)` must run `work` **at most once per key**, even when two threads race with the same key. Implement it with a `ConcurrentHashMap<String, CompletableFuture<Receipt>>`:\n\n- Reserve the key with `putIfAbsent` using a fresh, incomplete future. The winner runs `work`, completes its future, and returns the receipt.\n- A loser (the key was already present) waits on the existing future and returns the same receipt.\n- If `work` throws, remove the reservation with the **two-argument** `remove(key, future)` (so only your own future is removed), fail the future, and rethrow so a later retry can run again.\n\nDo not use a plain `HashMap`, and do not run `work` inside `computeIfAbsent`.',
    functionSignature: 'public Receipt charge(String idempotencyKey, Supplier<Receipt> work)',
    buggyCode: `public class IdempotentCharger {
    public record Receipt(String key, long amountCents) {}

    private final Map<String, Receipt> done = new HashMap<>();

    public Receipt charge(String idempotencyKey, Supplier<Receipt> work) {
        // TODO: reserve the key first so concurrent retries share one execution
        return work.get();
    }
}
`,
    solution: `public class IdempotentCharger {
    public record Receipt(String key, long amountCents) {}

    private final ConcurrentHashMap<String, CompletableFuture<Receipt>> inFlight = new ConcurrentHashMap<>();

    public Receipt charge(String idempotencyKey, Supplier<Receipt> work) {
        CompletableFuture<Receipt> mine = new CompletableFuture<>();
        CompletableFuture<Receipt> existing = inFlight.putIfAbsent(idempotencyKey, mine);
        if (existing != null) {
            return existing.join();
        }
        try {
            Receipt receipt = work.get();
            mine.complete(receipt);
            return receipt;
        } catch (RuntimeException e) {
            inFlight.remove(idempotencyKey, mine);
            mine.completeExceptionally(e);
            throw e;
        }
    }
}
`,
    hint: 'putIfAbsent returns null only for the thread that won the reservation; everyone else gets the winning future and should join it.',
    explanation:
      'Reserving the key with an incomplete CompletableFuture before doing the work is what makes concurrent duplicates share one execution: the map insert is atomic, and losers block on the future instead of charging again. Running the work inside computeIfAbsent would hold the map bin locked during a slow network call and is disallowed for recursive updates. The two-argument remove ensures a failed attempt only clears its own reservation and never a newer one.',
    rules: [
      { label: 'Stores reservations in a ConcurrentHashMap', type: 'mustContain', pattern: 'ConcurrentHashMap' },
      { label: 'Reserves the key atomically with putIfAbsent', type: 'mustContain', pattern: 'putIfAbsent\\s*\\(', regex: true },
      { label: 'Clears a failed reservation with the two-argument remove(key, future)', type: 'mustContain', pattern: '\\.remove\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)', regex: true },
      { label: 'No plain HashMap for shared state', type: 'mustNotContain', pattern: 'new HashMap' },
    ],
  },
  {
    id: 'java-build-webhook-backoff-schedule',
    number: 4,
    language: 'java',
    kind: 'build',
    title: 'Webhook Backoff Schedule',
    difficulty: 'Easy',
    topic: 'Services & APIs',
    statement:
      'Failed webhook deliveries are retried with exponential backoff. Implement `delayMillis(int attempt)` on `RetryPolicy`:\n\n- `attempt` is 1-based: attempt 1 waits `baseMillis`, attempt 2 waits `2 * baseMillis`, attempt 3 waits `4 * baseMillis`, and so on.\n- Never return more than `capMillis` — clamp with `Math.min`.\n- Throw `IllegalArgumentException` when `attempt < 1`.\n- Guard against overflow for large attempts (a shift/exponent above 30 should already be capped).\n\n`shouldRetry(int attempt)` is provided.',
    functionSignature: 'public long delayMillis(int attempt)',
    buggyCode: `public class RetryPolicy {
    private final long baseMillis;
    private final long capMillis;
    private final int maxAttempts;

    public RetryPolicy(long baseMillis, long capMillis, int maxAttempts) {
        this.baseMillis = baseMillis;
        this.capMillis = capMillis;
        this.maxAttempts = maxAttempts;
    }

    public boolean shouldRetry(int attempt) {
        return attempt < maxAttempts;
    }

    public long delayMillis(int attempt) {
        // TODO: base * 2^(attempt - 1), capped, attempt must be >= 1
        return 0L;
    }
}
`,
    solution: `public class RetryPolicy {
    private final long baseMillis;
    private final long capMillis;
    private final int maxAttempts;

    public RetryPolicy(long baseMillis, long capMillis, int maxAttempts) {
        this.baseMillis = baseMillis;
        this.capMillis = capMillis;
        this.maxAttempts = maxAttempts;
    }

    public boolean shouldRetry(int attempt) {
        return attempt < maxAttempts;
    }

    public long delayMillis(int attempt) {
        if (attempt < 1) {
            throw new IllegalArgumentException("attempt is 1-based, got " + attempt);
        }
        int exponent = Math.min(attempt - 1, 30);
        long delay = baseMillis << exponent;
        return Math.min(delay, capMillis);
    }
}
`,
    hint: 'Doubling per attempt is a left shift (or Math.pow); clamp both the exponent and the final value so a long retry loop cannot overflow past the cap.',
    explanation:
      'Exponential backoff spaces retries out so a struggling downstream is not hammered, and the cap keeps the wait bounded. Computing the delay purely from the attempt number keeps the policy stateless and trivially testable. Clamping the exponent before shifting matters: `1000L << 63` silently wraps negative, which would make the next retry fire immediately.',
    rules: [
      { label: 'Clamps the delay to the cap with Math.min', type: 'mustContain', pattern: 'Math\\.min\\s*\\(', regex: true },
      { label: 'Doubles per attempt (shift, Math.pow, or repeated *2)', type: 'mustContain', pattern: '<<|Math\\.pow\\s*\\(|\\*=\\s*2\\b|\\*\\s*2\\b', regex: true },
      { label: 'Rejects attempt < 1 with IllegalArgumentException', type: 'mustContain', pattern: 'IllegalArgumentException' },
      { label: 'No longer returns the 0 placeholder', type: 'mustNotContain', pattern: 'return\\s+0L?\\s*;', regex: true },
    ],
  },
  {
    id: 'java-build-customer-view-optional-mapper',
    number: 5,
    language: 'java',
    kind: 'build',
    title: 'Customer View Optional Mapper',
    difficulty: 'Easy',
    topic: 'Services & APIs',
    statement:
      'Map a storage row to an API view. Implement `toView(CustomerRow row)` returning `Optional<CustomerView>`:\n\n- Return `Optional.empty()` when `row` is null or `row.deleted()` is true — never return null.\n- `displayName` is the nickname when it is non-null and not blank, otherwise the full name.\n- Otherwise return `Optional.of(new CustomerView(id, displayName))`.',
    functionSignature: 'public static Optional<CustomerView> toView(CustomerRow row)',
    buggyCode: `public class CustomerMapper {
    public record CustomerRow(long id, String fullName, String nickname, boolean deleted) {}
    public record CustomerView(long id, String displayName) {}

    public static Optional<CustomerView> toView(CustomerRow row) {
        // TODO
        return null;
    }
}
`,
    solution: `public class CustomerMapper {
    public record CustomerRow(long id, String fullName, String nickname, boolean deleted) {}
    public record CustomerView(long id, String displayName) {}

    public static Optional<CustomerView> toView(CustomerRow row) {
        if (row == null || row.deleted()) {
            return Optional.empty();
        }
        String displayName = Optional.ofNullable(row.nickname())
            .filter(n -> !n.isBlank())
            .orElse(row.fullName());
        return Optional.of(new CustomerView(row.id(), displayName));
    }
}
`,
    hint: 'Optional.empty() is the absent case; Optional.ofNullable(...).filter(...).orElse(...) picks the nickname or falls back cleanly.',
    explanation:
      'Returning Optional.empty() instead of null makes absence part of the method contract, so callers chain map/orElse instead of sprinkling null checks. A blank nickname (spaces only) must count as absent, which isBlank handles. Mapping soft-deleted rows to empty at the boundary keeps deleted customers from leaking into API responses.',
    rules: [
      { label: 'Signals absence with Optional.empty()', type: 'mustContain', pattern: 'Optional\\.empty\\s*\\(\\s*\\)', regex: true },
      { label: 'Wraps the view with Optional.of / ofNullable', type: 'mustContain', pattern: 'Optional\\.of\\s*\\(|Optional\\.ofNullable\\s*\\(', regex: true },
      { label: 'Treats a blank nickname as absent', type: 'mustContain', pattern: 'isBlank\\s*\\(|isEmpty\\s*\\(|trim\\s*\\(', regex: true },
      { label: 'Never returns null', type: 'mustNotContain', pattern: 'return null' },
    ],
  },
  {
    id: 'java-build-method-aware-route-table',
    number: 6,
    language: 'java',
    kind: 'build',
    title: 'Method-Aware Route Table',
    difficulty: 'Medium',
    topic: 'Services & APIs',
    statement:
      'Build a tiny typed router for an inventory API. Handlers are `Function<Request, Response>` stored in a `Map` keyed by **method + path**.\n\n- Define a value type `RouteKey(method, path)` (a `record` is ideal) so two keys with the same method and path are equal map keys. Normalise the method to upper-case.\n- `register(method, path, handler)` throws `IllegalStateException` on a duplicate route.\n- `dispatch(req)` looks the key up in the map and calls the handler. Unknown path → `Response(404, "not found")`. Path known but under a different method → `Response(405, "method not allowed")`.',
    functionSignature: 'public Response dispatch(Request req)',
    buggyCode: `public class ApiRouter {
    public record Request(String method, String path) {}
    public record Response(int status, String body) {}

    // TODO: define a value-typed RouteKey and use it as the map key
    private final Map<Object, Function<Request, Response>> handlers = new HashMap<>();

    public void register(String method, String path, Function<Request, Response> handler) {
        // TODO
    }

    public Response dispatch(Request req) {
        // TODO: 404 for an unknown path, 405 when the path exists for another method
        return new Response(500, "TODO");
    }
}
`,
    solution: `public class ApiRouter {
    public record Request(String method, String path) {}
    public record Response(int status, String body) {}
    private record RouteKey(String method, String path) {}

    private final Map<RouteKey, Function<Request, Response>> handlers = new HashMap<>();
    private final Set<String> knownPaths = new HashSet<>();

    public void register(String method, String path, Function<Request, Response> handler) {
        RouteKey key = new RouteKey(method.toUpperCase(Locale.ROOT), path);
        if (handlers.putIfAbsent(key, handler) != null) {
            throw new IllegalStateException("duplicate route " + key);
        }
        knownPaths.add(path);
    }

    public Response dispatch(Request req) {
        RouteKey key = new RouteKey(req.method().toUpperCase(Locale.ROOT), req.path());
        Function<Request, Response> handler = handlers.get(key);
        if (handler != null) {
            return handler.apply(req);
        }
        if (knownPaths.contains(req.path())) {
            return new Response(405, "method not allowed");
        }
        return new Response(404, "not found");
    }
}
`,
    hint: 'A record gives you equals/hashCode for free, so `handlers.get(new RouteKey(...))` finds the registered handler; track registered paths separately to tell 404 from 405.',
    explanation:
      'A composite map key only works if equals and hashCode cover both fields, which a record guarantees; a plain class without them would never hit on lookup. Distinguishing 404 (nothing at that path) from 405 (path exists, wrong verb) is what HTTP clients expect and is cheap once you keep a set of known paths. Upper-casing the method means `get` and `GET` route the same way.',
    rules: [
      { label: 'Defines RouteKey as a record (or with hashCode/equals)', type: 'mustContain', pattern: 'record\\s+RouteKey\\s*\\(|hashCode\\s*\\(\\s*\\)', regex: true },
      { label: 'Looks the handler up in the map', type: 'mustContain', pattern: 'handlers\\.get\\s*\\(', regex: true },
      { label: 'Returns 405 for a known path under another method', type: 'mustContain', pattern: '405' },
      { label: 'Returns 404 for an unknown path', type: 'mustContain', pattern: '404' },
    ],
  },
  {
    id: 'java-build-if-none-match-etag-check',
    number: 7,
    language: 'java',
    kind: 'build',
    title: 'If-None-Match Tag Check',
    difficulty: 'Medium',
    topic: 'Services & APIs',
    statement:
      'Decide whether a GET can answer `304 Not Modified`. Implement `notModified(String ifNoneMatch, String currentEtag)`:\n\n- `ifNoneMatch` is the raw header value and may be null/blank → return false.\n- A header of `*` matches anything → true.\n- The header may list several tags separated by commas, each optionally weak (`W/` prefix) and wrapped in double quotes, with stray spaces. Split on commas and trim each entry.\n- Compare using **weak comparison**: strip a leading `W/` and the surrounding quotes from both sides, then compare the opaque tag text exactly.\n\nReturn true if any listed tag matches `currentEtag`.',
    functionSignature: 'public static boolean notModified(String ifNoneMatch, String currentEtag)',
    buggyCode: `public class EtagMatcher {
    /** ifNoneMatch: raw If-None-Match header (may be null). currentEtag: the strong tag, e.g. v42 wrapped in double quotes. */
    public static boolean notModified(String ifNoneMatch, String currentEtag) {
        // TODO: handle *, comma lists, W/ weak prefix, quotes and spaces
        return false;
    }
}
`,
    solution: `public class EtagMatcher {
    public static boolean notModified(String ifNoneMatch, String currentEtag) {
        if (ifNoneMatch == null || ifNoneMatch.isBlank()) {
            return false;
        }
        if (ifNoneMatch.trim().equals("*")) {
            return true;
        }
        String current = opaqueTag(currentEtag);
        for (String candidate : ifNoneMatch.split(",")) {
            if (opaqueTag(candidate).equals(current)) {
                return true;
            }
        }
        return false;
    }

    private static String opaqueTag(String tag) {
        String t = tag.trim();
        if (t.startsWith("W/")) {
            t = t.substring(2);
        }
        if (t.length() >= 2 && t.charAt(0) == '"' && t.charAt(t.length() - 1) == '"') {
            t = t.substring(1, t.length() - 1);
        }
        return t;
    }
}
`,
    hint: 'Write one helper that normalises a tag (trim, drop W/, drop quotes) and apply it to both the header entries and the current tag before comparing.',
    explanation:
      'Conditional GETs save bandwidth only if the server recognises the tag the client sends back, and proxies routinely rewrite tags to weak form (`W/"v42"`) or bundle several in one header. Normalising both sides through the same helper handles quotes, weak prefixes, and spacing in one place. Treating `*` as a wildcard and a missing header as "modified" are the two boundary cases that break naive `equals` implementations.',
    rules: [
      { label: 'Treats * as matching everything', type: 'mustContain', pattern: '"*"' },
      { label: 'Splits the header on commas', type: 'mustContain', pattern: 'split\\s*\\(\\s*"\\s*,\\s*"', regex: true },
      { label: 'Strips the W/ weak prefix', type: 'mustContain', pattern: 'startsWith\\s*\\(\\s*"W/"\\s*\\)|replaceFirst\\s*\\(\\s*"\\^?W/|"W/"', regex: true },
      { label: 'Trims whitespace around each tag', type: 'mustContain', pattern: 'trim\\s*\\(\\s*\\)|strip\\s*\\(\\s*\\)', regex: true },
    ],
  },
  // ---------------------------------------------------------------- Caching & Concurrency
  {
    id: 'java-build-recent-route-eviction-map',
    number: 8,
    language: 'java',
    kind: 'build',
    title: 'Recent Route Eviction Map',
    difficulty: 'Easy',
    topic: 'Caching & Concurrency',
    statement:
      'A ride-hailing service caches computed routes but must never hold more than `capacity` entries. Back `RecentRouteCache` with a `LinkedHashMap` constructed in **access order** (`new LinkedHashMap<>(16, 0.75f, true)`) and override `removeEldestEntry` so the least-recently-used entry is dropped once `size() > capacity`.\n\n`get` must count as a use (so a recently read route survives eviction); `put` of an existing key refreshes it. The public `get`/`put`/`size` methods stay as they are.',
    functionSignature: 'public RecentRouteCache(int capacity)',
    buggyCode: `public class RecentRouteCache<K, V> {
    private final int capacity;
    private final Map<K, V> map;

    public RecentRouteCache(int capacity) {
        this.capacity = capacity;
        // TODO: back this with an access-ordered LinkedHashMap that evicts the eldest entry
        this.map = new HashMap<>();
    }

    public V get(K key) {
        return map.get(key);
    }

    public void put(K key, V value) {
        map.put(key, value);
    }

    public int size() {
        return map.size();
    }
}
`,
    solution: `public class RecentRouteCache<K, V> {
    private final int capacity;
    private final Map<K, V> map;

    public RecentRouteCache(int capacity) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("capacity must be positive");
        }
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > RecentRouteCache.this.capacity;
            }
        };
    }

    public V get(K key) {
        return map.get(key);
    }

    public void put(K key, V value) {
        map.put(key, value);
    }

    public int size() {
        return map.size();
    }
}
`,
    hint: 'The third constructor argument of LinkedHashMap switches it to access order; removeEldestEntry is consulted after every put.',
    explanation:
      'LinkedHashMap in access-order mode moves an entry to the tail on every get and put, so the head is always the least recently used. Overriding removeEldestEntry to return true when the map has grown past capacity gives you an LRU cache in a handful of lines without hand-rolling a linked list. The default insertion-order mode would evict the oldest inserted key even if it is hot.',
    rules: [
      { label: 'Overrides removeEldestEntry', type: 'mustContain', pattern: 'removeEldestEntry' },
      { label: 'Constructs the LinkedHashMap in access order (third argument true)', type: 'mustContain', pattern: ',\\s*true\\s*\\)', regex: true },
      { label: 'Evicts once size() exceeds the capacity', type: 'mustContain', pattern: 'size\\s*\\(\\s*\\)\\s*>', regex: true },
      { label: 'No longer uses a plain HashMap', type: 'mustNotContain', pattern: 'new HashMap' },
    ],
  },
  {
    id: 'java-build-clock-driven-freshness-cache',
    number: 9,
    language: 'java',
    kind: 'build',
    title: 'Clock-Driven Freshness Cache',
    difficulty: 'Medium',
    topic: 'Caching & Concurrency',
    statement:
      'Implement a TTL cache for exchange-rate lookups that is **fully testable without sleeping**. `FreshnessCache` receives a `java.time.Clock` and a `Duration ttl` in its constructor.\n\n- `put(key, value)` stores the value with `expiresAt = clock.instant().plus(ttl)`.\n- `get(key)` returns `Optional.of(value)` while `clock.instant()` is strictly before `expiresAt`. An entry whose expiry is at or before now is stale: remove it from the map and return `Optional.empty()`.\n\nRead time only from the injected clock — never `Instant.now()` or `System.currentTimeMillis()`.',
    functionSignature: 'public Optional<V> get(K key)',
    buggyCode: `public class FreshnessCache<K, V> {
    private record Entry<V>(V value, Instant expiresAt) {}

    private final Clock clock;
    private final Duration ttl;
    private final Map<K, Entry<V>> entries = new HashMap<>();

    public FreshnessCache(Clock clock, Duration ttl) {
        this.clock = clock;
        this.ttl = ttl;
    }

    public void put(K key, V value) {
        // TODO: stamp the entry with an expiry taken from the clock
    }

    public Optional<V> get(K key) {
        // TODO: evict and return empty when the entry is stale
        return Optional.empty();
    }
}
`,
    solution: `public class FreshnessCache<K, V> {
    private record Entry<V>(V value, Instant expiresAt) {}

    private final Clock clock;
    private final Duration ttl;
    private final Map<K, Entry<V>> entries = new HashMap<>();

    public FreshnessCache(Clock clock, Duration ttl) {
        this.clock = clock;
        this.ttl = ttl;
    }

    public void put(K key, V value) {
        entries.put(key, new Entry<>(value, clock.instant().plus(ttl)));
    }

    public Optional<V> get(K key) {
        Entry<V> entry = entries.get(key);
        if (entry == null) {
            return Optional.empty();
        }
        if (!clock.instant().isBefore(entry.expiresAt())) {
            entries.remove(key);
            return Optional.empty();
        }
        return Optional.of(entry.value());
    }
}
`,
    hint: 'Store the absolute expiry instant at put time; on get, compare clock.instant() with isBefore and evict lazily when it has passed.',
    explanation:
      'Injecting a Clock lets tests advance time deterministically with Clock.fixed / Clock.offset instead of Thread.sleep, and makes the expiry rule explicit. Storing an absolute expiry instant means each read is a single comparison, and evicting on read keeps stale values from lingering indefinitely. Using Instant.now() directly would couple the cache to wall-clock time and make the boundary case untestable.',
    rules: [
      { label: 'Reads the current time from the injected clock', type: 'mustContain', pattern: 'clock\\.instant\\s*\\(\\s*\\)|clock\\.millis\\s*\\(\\s*\\)|Instant\\.now\\s*\\(\\s*clock\\s*\\)', regex: true },
      { label: 'Compares instants with isBefore/isAfter/compareTo', type: 'mustContain', pattern: 'isBefore\\s*\\(|isAfter\\s*\\(|compareTo\\s*\\(', regex: true },
      { label: 'Evicts a stale entry on read', type: 'mustContain', pattern: 'entries\\.remove\\s*\\(', regex: true },
      { label: 'Never reads wall-clock time directly', type: 'mustNotContain', pattern: 'System\\.currentTimeMillis|Instant\\.now\\s*\\(\\s*\\)|System\\.nanoTime', regex: true },
    ],
  },
  {
    id: 'java-build-lock-free-trip-metrics',
    number: 10,
    language: 'java',
    kind: 'build',
    title: 'Lock-Free Trip Metrics',
    difficulty: 'Easy',
    topic: 'Caching & Concurrency',
    statement:
      'Scooter trips finish on many worker threads and each calls `recordTrip(long meters)`. Make `TripMetrics` correct under concurrency **without `synchronized`** by switching the three counters to `AtomicLong`:\n\n- `trips` increments by one per call.\n- `totalMeters` adds `meters`.\n- `longestMeters` becomes the maximum seen so far (use `accumulateAndGet(meters, Math::max)` or an `updateAndGet`/CAS loop).\n\nThe getters return the current values.',
    functionSignature: 'public void recordTrip(long meters)',
    buggyCode: `public class TripMetrics {
    // TODO: make these safe to update from many threads without locking
    private long trips;
    private long totalMeters;
    private long longestMeters;

    public void recordTrip(long meters) {
        // TODO
    }

    public long trips() { return trips; }
    public long totalMeters() { return totalMeters; }
    public long longestMeters() { return longestMeters; }
}
`,
    solution: `public class TripMetrics {
    private final AtomicLong trips = new AtomicLong();
    private final AtomicLong totalMeters = new AtomicLong();
    private final AtomicLong longestMeters = new AtomicLong();

    public void recordTrip(long meters) {
        trips.incrementAndGet();
        totalMeters.addAndGet(meters);
        longestMeters.accumulateAndGet(meters, Math::max);
    }

    public long trips() { return trips.get(); }
    public long totalMeters() { return totalMeters.get(); }
    public long longestMeters() { return longestMeters.get(); }
}
`,
    hint: 'Each AtomicLong method is a single atomic read-modify-write; accumulateAndGet takes a binary function such as Math::max.',
    explanation:
      '`count++` on a plain long is a read, an add, and a write — two threads can interleave and lose an update. AtomicLong performs the whole read-modify-write as one hardware CAS, so incrementAndGet/addAndGet never lose increments, and accumulateAndGet lets you express "max so far" without a lock. This is the standard building block for hot metrics counters where a synchronized block would serialise every worker.',
    rules: [
      { label: 'Counters are AtomicLong', type: 'mustContain', pattern: 'AtomicLong' },
      { label: 'Increments/adds atomically', type: 'mustContain', pattern: 'incrementAndGet\\s*\\(|getAndIncrement\\s*\\(|addAndGet\\s*\\(|getAndAdd\\s*\\(', regex: true },
      { label: 'Tracks the maximum with accumulateAndGet / updateAndGet / compareAndSet', type: 'mustContain', pattern: 'accumulateAndGet\\s*\\(|updateAndGet\\s*\\(|compareAndSet\\s*\\(', regex: true },
      { label: 'No synchronized blocks', type: 'mustNotContain', pattern: 'synchronized' },
    ],
  },
  {
    id: 'java-build-webhook-registry-read-write-lock',
    number: 11,
    language: 'java',
    kind: 'build',
    title: 'Webhook Registry Read-Write Lock',
    difficulty: 'Medium',
    topic: 'Caching & Concurrency',
    statement:
      'A webhook registry is read on every event but only changed at deploy time. Guard `WebhookRegistry` with a `ReentrantReadWriteLock`:\n\n- `register(event, hook)` and `unregister(event)` take the **write** lock.\n- `lookup(event)` and `events()` take the **read** lock so concurrent readers do not block each other.\n- Every `lock()` is paired with `unlock()` in a `finally` block.\n- `events()` returns a **copy** (e.g. `new TreeSet<>(hooks.keySet())`) so callers never iterate the live map outside the lock.',
    functionSignature: 'public Optional<Consumer<String>> lookup(String event)',
    buggyCode: `import java.util.concurrent.locks.ReentrantReadWriteLock;

public class WebhookRegistry {
    private final Map<String, Consumer<String>> hooks = new HashMap<>();
    // TODO: guard hooks with a ReentrantReadWriteLock

    public void register(String event, Consumer<String> hook) {
        // TODO
    }

    public void unregister(String event) {
        // TODO
    }

    public Optional<Consumer<String>> lookup(String event) {
        // TODO
        return Optional.empty();
    }

    public Set<String> events() {
        // TODO: return a copy taken under the read lock
        return Set.of();
    }
}
`,
    solution: `import java.util.concurrent.locks.ReentrantReadWriteLock;

public class WebhookRegistry {
    private final Map<String, Consumer<String>> hooks = new HashMap<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    public void register(String event, Consumer<String> hook) {
        lock.writeLock().lock();
        try {
            hooks.put(event, hook);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void unregister(String event) {
        lock.writeLock().lock();
        try {
            hooks.remove(event);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Optional<Consumer<String>> lookup(String event) {
        lock.readLock().lock();
        try {
            return Optional.ofNullable(hooks.get(event));
        } finally {
            lock.readLock().unlock();
        }
    }

    public Set<String> events() {
        lock.readLock().lock();
        try {
            return new TreeSet<>(hooks.keySet());
        } finally {
            lock.readLock().unlock();
        }
    }
}
`,
    hint: 'lock.readLock().lock() for reads, lock.writeLock().lock() for writes, and always unlock in finally so an exception cannot leave the lock held.',
    explanation:
      'A read-write lock lets any number of readers proceed in parallel while a writer gets exclusive access, which fits read-heavy registries far better than a single mutex. Unlocking in finally is non-negotiable: an exception thrown while holding the lock would otherwise deadlock every future caller. Returning a copy from events() matters because a HashMap keySet is a live view that would be iterated after the read lock is released.',
    rules: [
      { label: 'Uses a ReentrantReadWriteLock', type: 'mustContain', pattern: 'ReentrantReadWriteLock' },
      { label: 'Readers take the read lock', type: 'mustContain', pattern: 'readLock\\s*\\(\\s*\\)\\s*\\.lock\\s*\\(', regex: true },
      { label: 'Writers take the write lock', type: 'mustContain', pattern: 'writeLock\\s*\\(\\s*\\)\\s*\\.lock\\s*\\(', regex: true },
      { label: 'Unlocks in a finally block', type: 'mustContain', pattern: 'finally\\s*\\{[^}]*unlock\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-cheapest-fare-fan-out',
    number: 12,
    language: 'java',
    kind: 'build',
    title: 'Cheapest Fare Fan-Out',
    difficulty: 'Hard',
    topic: 'Caching & Concurrency',
    statement:
      'A travel search asks several fare providers at once and returns the cheapest answer that arrives in time. Implement `cheapest(List<QuoteProvider> providers, String route, Duration perProviderTimeout)` returning a `CompletableFuture<Quote>`, **without blocking the calling thread**:\n\n- Call `fetch(route)` on every provider. Give each call a per-provider timeout with `completeOnTimeout(null, ...)` (or `orTimeout` + `exceptionally`), and turn any failure into `null` with `exceptionally`/`handle` so one bad provider cannot sink the whole search. A provider whose `fetch` throws synchronously counts as failed.\n- Combine the calls with `CompletableFuture.allOf`, then pick the non-null quote with the lowest `priceCents`.\n- If no provider produced a quote, the returned future completes exceptionally with `NoQuoteException`.\n\nNo `Thread.sleep` and no blocking `get()` on the calling thread.',
    functionSignature: 'public static CompletableFuture<Quote> cheapest(List<QuoteProvider> providers, String route, Duration perProviderTimeout)',
    buggyCode: `public class FareAggregator {
    public record Quote(String provider, long priceCents) {}

    public interface QuoteProvider {
        CompletableFuture<Quote> fetch(String route);
    }

    public static class NoQuoteException extends RuntimeException {
        public NoQuoteException(String message) { super(message); }
    }

    public static CompletableFuture<Quote> cheapest(List<QuoteProvider> providers, String route, Duration perProviderTimeout) {
        // TODO: fan out with per-provider timeouts, tolerate failures, fan in with allOf
        return CompletableFuture.failedFuture(new NoQuoteException("TODO"));
    }
}
`,
    solution: `public class FareAggregator {
    public record Quote(String provider, long priceCents) {}

    public interface QuoteProvider {
        CompletableFuture<Quote> fetch(String route);
    }

    public static class NoQuoteException extends RuntimeException {
        public NoQuoteException(String message) { super(message); }
    }

    public static CompletableFuture<Quote> cheapest(List<QuoteProvider> providers, String route, Duration perProviderTimeout) {
        List<CompletableFuture<Quote>> calls = new ArrayList<>();
        for (QuoteProvider provider : providers) {
            CompletableFuture<Quote> call;
            try {
                call = provider.fetch(route);
            } catch (RuntimeException e) {
                call = CompletableFuture.failedFuture(e);
            }
            calls.add(call
                .completeOnTimeout(null, perProviderTimeout.toMillis(), TimeUnit.MILLISECONDS)
                .exceptionally(t -> null));
        }
        return CompletableFuture.allOf(calls.toArray(new CompletableFuture[0]))
            .thenApply(ignored -> calls.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .min(Comparator.comparingLong(Quote::priceCents))
                .orElseThrow(() -> new NoQuoteException("no provider answered for " + route)));
    }
}
`,
    hint: 'Normalise every provider future into one that always completes (timeout → null, failure → null), then allOf(...).thenApply(...) is safe to join inside because every future is already done.',
    explanation:
      'The trick to a robust fan-out is making each branch infallible before combining: completeOnTimeout bounds the wait and exceptionally swallows provider errors into a sentinel, so allOf never fails early because of one slow or broken provider. Joining inside thenApply is not blocking in practice because allOf only fires once every branch has completed. Surfacing "no quotes at all" as a typed exception lets the caller distinguish an empty market from a bug.',
    rules: [
      { label: 'Fans in with CompletableFuture.allOf', type: 'mustContain', pattern: 'allOf\\s*\\(', regex: true },
      { label: 'Applies a per-provider timeout', type: 'mustContain', pattern: 'completeOnTimeout\\s*\\(|orTimeout\\s*\\(', regex: true },
      { label: 'Turns provider failures into a sentinel instead of failing the whole search', type: 'mustContain', pattern: 'exceptionally\\s*\\(|handle\\s*\\(|whenComplete\\s*\\(', regex: true },
      { label: 'Does not block the calling thread', type: 'mustNotContain', pattern: 'Thread\\.sleep|\\.get\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-parallel-vocabulary-count',
    number: 13,
    language: 'java',
    kind: 'build',
    title: 'Parallel Vocabulary Count',
    difficulty: 'Medium',
    topic: 'Caching & Concurrency',
    statement:
      'Index a batch of documents on a worker pool. Implement `distinctWordCounts(List<String> docs, int threads)` returning, **in the same order as `docs`**, the number of distinct lower-cased words in each document (words are separated by single spaces; ignore empty tokens).\n\n- Create the pool with `Executors.newFixedThreadPool(threads)`.\n- Fan out one `Callable<Integer>` per document with `invokeAll` (or `submit` each and collect the futures in order).\n- Fan in by calling `get()` on each future in order.\n- Always shut the pool down: `shutdown()` in a `finally` block followed by `awaitTermination` (or a try-with-resources on Java 21+).',
    functionSignature: 'public static List<Integer> distinctWordCounts(List<String> docs, int threads) throws InterruptedException, ExecutionException',
    buggyCode: `public class IndexBuilder {
    /** Number of distinct lower-cased words per document, in input order. */
    public static List<Integer> distinctWordCounts(List<String> docs, int threads) throws InterruptedException, ExecutionException {
        // TODO: fan out on a fixed pool, fan in in order, shut the pool down
        return List.of();
    }
}
`,
    solution: `public class IndexBuilder {
    public static List<Integer> distinctWordCounts(List<String> docs, int threads) throws InterruptedException, ExecutionException {
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        try {
            List<Callable<Integer>> tasks = new ArrayList<>();
            for (String doc : docs) {
                tasks.add(() -> {
                    Set<String> seen = new HashSet<>();
                    for (String word : doc.toLowerCase(Locale.ROOT).split(" ")) {
                        if (!word.isEmpty()) {
                            seen.add(word);
                        }
                    }
                    return seen.size();
                });
            }
            List<Integer> counts = new ArrayList<>(docs.size());
            for (Future<Integer> future : pool.invokeAll(tasks)) {
                counts.add(future.get());
            }
            return counts;
        } finally {
            pool.shutdown();
            pool.awaitTermination(30, TimeUnit.SECONDS);
        }
    }
}
`,
    hint: 'invokeAll returns futures in the same order as the tasks you passed, so iterating them in order preserves the document order; put shutdown in finally so an exception cannot leak threads.',
    explanation:
      'invokeAll keeps the futures in submission order, which makes reassembling results trivially deterministic even though the work finishes out of order. A pool that is never shut down keeps non-daemon threads alive and stops the JVM from exiting — putting shutdown in finally guarantees cleanup on the failure path too. awaitTermination gives in-flight tasks a bounded grace period instead of abandoning them.',
    rules: [
      { label: 'Creates a fixed-size worker pool', type: 'mustContain', pattern: 'newFixedThreadPool\\s*\\(', regex: true },
      { label: 'Fans out with invokeAll or submit', type: 'mustContain', pattern: 'invokeAll\\s*\\(|\\.submit\\s*\\(', regex: true },
      { label: 'Shuts the pool down in finally (or try-with-resources)', type: 'mustContain', pattern: 'finally\\s*\\{[^}]*shutdown|try\\s*\\(\\s*(final\\s+)?(var|ExecutorService)\\b', regex: true },
      { label: 'Waits for termination', type: 'mustContain', pattern: 'awaitTermination\\s*\\(|\\.close\\s*\\(\\s*\\)|try\\s*\\(\\s*(final\\s+)?(var|ExecutorService)\\b', regex: true },
    ],
  },
  {
    id: 'java-build-station-index-holder-singleton',
    number: 14,
    language: 'java',
    kind: 'build',
    title: 'Station Index Holder Singleton',
    difficulty: 'Easy',
    topic: 'Caching & Concurrency',
    statement:
      'The docking-station geo index is expensive to build and must exist exactly once, created lazily on first use, safely from any thread. Implement the **initialization-on-demand holder** idiom on `GeoIndex`:\n\n- Make the constructor `private`.\n- Add a private static nested class (e.g. `Holder`) containing `static final GeoIndex INSTANCE = new GeoIndex();`.\n- `instance()` returns `Holder.INSTANCE`.\n\nDo not use `synchronized` or `volatile` — the JVM class-loading guarantee does the work.',
    functionSignature: 'public static GeoIndex instance()',
    buggyCode: `public class GeoIndex {
    private final Map<String, double[]> stations = new ConcurrentHashMap<>();

    // TODO: private constructor + lazy, thread-safe instance() via the holder idiom
    public GeoIndex() {}

    public static GeoIndex instance() {
        // TODO
        return null;
    }

    public void put(String id, double lat, double lon) {
        stations.put(id, new double[] { lat, lon });
    }

    public Optional<double[]> find(String id) {
        return Optional.ofNullable(stations.get(id));
    }
}
`,
    solution: `public class GeoIndex {
    private final Map<String, double[]> stations = new ConcurrentHashMap<>();

    private GeoIndex() {}

    private static final class Holder {
        static final GeoIndex INSTANCE = new GeoIndex();
    }

    public static GeoIndex instance() {
        return Holder.INSTANCE;
    }

    public void put(String id, double lat, double lon) {
        stations.put(id, new double[] { lat, lon });
    }

    public Optional<double[]> find(String id) {
        return Optional.ofNullable(stations.get(id));
    }
}
`,
    hint: 'A nested class is not initialised until first referenced, and the JVM guarantees class initialisation happens exactly once and is visible to all threads.',
    explanation:
      'The holder idiom gets lazy initialisation and thread safety for free: the nested class is loaded only when instance() first touches it, and the JVM serialises class initialisation under its own lock. That avoids the cost of a synchronized accessor on every call and the subtlety of double-checked locking with volatile. A private constructor is what actually enforces the single instance.',
    rules: [
      { label: 'Declares a nested holder class', type: 'mustContain', pattern: 'class\\s+\\w*Holder\\b', regex: true },
      { label: 'Holder owns the static final instance', type: 'mustContain', pattern: 'static\\s+final\\s+GeoIndex\\s+\\w+\\s*=\\s*new\\s+GeoIndex\\s*\\(', regex: true },
      { label: 'Constructor is private', type: 'mustContain', pattern: 'private\\s+GeoIndex\\s*\\(', regex: true },
      { label: 'No synchronized or volatile needed', type: 'mustNotContain', pattern: 'synchronized|volatile', regex: true },
    ],
  },
  // ---------------------------------------------------------------- Data Modelling
  {
    id: 'java-build-canonical-sku-value',
    number: 15,
    language: 'java',
    kind: 'build',
    title: 'Canonical Sku Value',
    difficulty: 'Easy',
    topic: 'Data Modelling',
    statement:
      'Warehouse stock is keyed by `Sku` (warehouse + code), and it is currently a mutable class with public fields, so two equal SKUs are different map keys. Rewrite `Sku` as a `record Sku(String warehouse, String code)`:\n\n- In the compact constructor, reject a null or blank warehouse/code with `IllegalArgumentException`.\n- Canonicalise both parts to trimmed **upper-case** (so `new Sku("ldn", " ab12 ")` equals `new Sku("LDN", "AB12")`).\n- Add `static Sku parse(String text)` that splits `WAREHOUSE-CODE` on the first dash.\n- `toString()` renders `WAREHOUSE-CODE`.',
    functionSignature: 'public record Sku(String warehouse, String code)',
    buggyCode: `// TODO: make Sku an immutable value type — equal by value, canonicalised, validated
public class Sku {
    public String warehouse;
    public String code;
}
`,
    solution: `public record Sku(String warehouse, String code) {
    public Sku {
        if (warehouse == null || warehouse.isBlank()) {
            throw new IllegalArgumentException("warehouse is required");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("code is required");
        }
        warehouse = warehouse.trim().toUpperCase(Locale.ROOT);
        code = code.trim().toUpperCase(Locale.ROOT);
    }

    public static Sku parse(String text) {
        int dash = text.indexOf('-');
        if (dash < 0) {
            throw new IllegalArgumentException("expected WAREHOUSE-CODE, got " + text);
        }
        return new Sku(text.substring(0, dash), text.substring(dash + 1));
    }

    @Override
    public String toString() {
        return warehouse + "-" + code;
    }
}
`,
    hint: 'A compact record constructor can validate and reassign its parameters before the fields are set; records generate equals/hashCode from the components.',
    explanation:
      'A record makes Sku immutable and gives value-based equals/hashCode, which is exactly what a map key needs. Normalising inside the compact constructor means every Sku in the system is canonical the moment it exists, so `ldn-ab12` and `LDN-AB12` collide correctly instead of silently creating duplicate stock rows. Validation at construction turns bad data into an immediate exception rather than a corrupt key.',
    rules: [
      { label: 'Sku is a record', type: 'mustContain', pattern: 'record\\s+Sku\\s*\\(', regex: true },
      { label: 'Canonicalises to upper-case', type: 'mustContain', pattern: 'toUpperCase\\s*\\(', regex: true },
      { label: 'Rejects blank parts with IllegalArgumentException', type: 'mustContain', pattern: 'IllegalArgumentException' },
      { label: 'No longer a mutable class', type: 'mustNotContain', pattern: 'class\\s+Sku\\b', regex: true },
    ],
  },
  {
    id: 'java-build-departures-board-ordering',
    number: 16,
    language: 'java',
    kind: 'build',
    title: 'Departures Board Ordering',
    difficulty: 'Easy',
    topic: 'Data Modelling',
    statement:
      'Sort flights for an airport board with a stable, multi-key order. Implement `boardOrder(List<Flight> flights)`:\n\n1. By status in this order: `BOARDING`, `DELAYED`, `ON_TIME`, `LANDED` (which is the enum declaration order).\n2. Then by `departsAtMinutes` ascending.\n3. Then by `gate` **ignoring case**.\n\nBuild the comparator with `Comparator.comparing(...).thenComparing(...)`, return a new sorted list, and do not mutate the input.',
    functionSignature: 'public static List<Flight> boardOrder(List<Flight> flights)',
    buggyCode: `public class DeparturesBoard {
    public enum Status { BOARDING, DELAYED, ON_TIME, LANDED }
    public record Flight(String code, Status status, int departsAtMinutes, String gate) {}

    public static List<Flight> boardOrder(List<Flight> flights) {
        // TODO: status, then departure time, then gate ignoring case
        return flights;
    }
}
`,
    solution: `public class DeparturesBoard {
    public enum Status { BOARDING, DELAYED, ON_TIME, LANDED }
    public record Flight(String code, Status status, int departsAtMinutes, String gate) {}

    public static List<Flight> boardOrder(List<Flight> flights) {
        Comparator<Flight> order = Comparator.comparing(Flight::status)
            .thenComparingInt(Flight::departsAtMinutes)
            .thenComparing(Flight::gate, String.CASE_INSENSITIVE_ORDER);
        return flights.stream().sorted(order).toList();
    }
}
`,
    hint: 'Enums compare by declaration order, so Comparator.comparing(Flight::status) is the first key; thenComparing accepts a key extractor plus a comparator such as String.CASE_INSENSITIVE_ORDER.',
    explanation:
      'Comparator chains read exactly like the specification and keep the tie-breaking explicit, which is much less error-prone than a hand-written compare method with nested ifs. Stream.sorted and List.sort are stable, so rows that tie on every key keep their input order. Returning a fresh list means the caller can keep the unsorted arrival order for other views.',
    rules: [
      { label: 'Builds the primary key with Comparator.comparing', type: 'mustContain', pattern: 'Comparator\\.comparing', regex: true },
      { label: 'Chains secondary keys with thenComparing', type: 'mustContain', pattern: 'thenComparing' },
      { label: 'Compares gates ignoring case', type: 'mustContain', pattern: 'CASE_INSENSITIVE_ORDER|compareToIgnoreCase|toLowerCase|toUpperCase', regex: true },
      { label: 'Returns a new list instead of the input', type: 'mustNotContain', pattern: 'return\\s+flights\\s*;', regex: true },
    ],
  },
  {
    id: 'java-build-shipment-request-builder',
    number: 17,
    language: 'java',
    kind: 'build',
    title: 'Shipment Request Builder',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'Turn `ShipmentRequest` into an immutable object created through a validating builder:\n\n- Fields become `private final` with accessor methods; the constructor is `private` and takes the builder.\n- A `public static final class Builder` with fluent setters `origin`, `destination`, `weightGrams`, `express` that each `return this`; `weightGrams` defaults to 500.\n- `build()` collects every problem — missing/blank origin, missing/blank destination, `weightGrams <= 0` — and throws one `IllegalStateException` naming all of them; otherwise it returns the request.\n- `static Builder builder()` starts a new builder.',
    functionSignature: 'public static Builder builder()',
    buggyCode: `public class ShipmentRequest {
    // TODO: private constructor + nested static Builder with fluent setters; build() validates
    public String origin;
    public String destination;
    public int weightGrams = 500;
    public boolean express;
}
`,
    solution: `public final class ShipmentRequest {
    private final String origin;
    private final String destination;
    private final int weightGrams;
    private final boolean express;

    private ShipmentRequest(Builder b) {
        this.origin = b.origin;
        this.destination = b.destination;
        this.weightGrams = b.weightGrams;
        this.express = b.express;
    }

    public String origin() { return origin; }
    public String destination() { return destination; }
    public int weightGrams() { return weightGrams; }
    public boolean express() { return express; }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String origin;
        private String destination;
        private int weightGrams = 500;
        private boolean express;

        public Builder origin(String origin) { this.origin = origin; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder weightGrams(int weightGrams) { this.weightGrams = weightGrams; return this; }
        public Builder express(boolean express) { this.express = express; return this; }

        public ShipmentRequest build() {
            List<String> problems = new ArrayList<>();
            if (origin == null || origin.isBlank()) problems.add("origin is required");
            if (destination == null || destination.isBlank()) problems.add("destination is required");
            if (weightGrams <= 0) problems.add("weightGrams must be positive");
            if (!problems.isEmpty()) {
                throw new IllegalStateException("invalid shipment: " + String.join("; ", problems));
            }
            return new ShipmentRequest(this);
        }
    }
}
`,
    hint: 'The builder holds the mutable state; the private constructor copies it into final fields, so a ShipmentRequest can never exist in an invalid state.',
    explanation:
      'A builder separates the messy, optional, order-independent assembly of a request from the immutable object that the rest of the system consumes. Putting validation in build() means every ShipmentRequest that exists is valid, and reporting all problems at once saves the caller a fix-one-rerun loop. The private constructor closes the back door so nothing can bypass the checks.',
    rules: [
      { label: 'Nested static Builder class', type: 'mustContain', pattern: 'static\\s+(final\\s+)?class\\s+Builder\\b', regex: true },
      { label: 'Fluent setters return this', type: 'mustContain', pattern: 'return\\s+this\\s*;', regex: true },
      { label: 'build() rejects invalid state with IllegalStateException', type: 'mustContain', pattern: 'IllegalStateException' },
      { label: 'Constructor is private so only the builder creates instances', type: 'mustContain', pattern: 'private\\s+ShipmentRequest\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-parcel-state-transitions',
    number: 18,
    language: 'java',
    kind: 'build',
    title: 'Parcel State Transitions',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'Model a parcel lifecycle as an enum with an explicit transition table. On `ParcelState` implement:\n\n- `canMoveTo(next)`: true only for allowed edges — `LABELLED→COLLECTED`; `COLLECTED→IN_TRANSIT|RETURNED`; `IN_TRANSIT→OUT_FOR_DELIVERY|RETURNED`; `OUT_FOR_DELIVERY→DELIVERED|IN_TRANSIT|RETURNED`; `DELIVERED` and `RETURNED` are terminal. A null `next` is never allowed.\n- `moveTo(next)`: returns `next` when allowed, otherwise throws `IllegalStateException` naming both states.\n- `isTerminal()`: true when no transition leaves the state.\n\nKeep the table in data (`EnumSet`/`EnumMap`, `Set.of`) or a `switch` — not scattered ifs.',
    functionSignature: 'public ParcelState moveTo(ParcelState next)',
    buggyCode: `public enum ParcelState {
    LABELLED, COLLECTED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED;

    // TODO: transition table + guarded moveTo
    public boolean canMoveTo(ParcelState next) {
        return false;
    }

    public ParcelState moveTo(ParcelState next) {
        return this;
    }

    public boolean isTerminal() {
        return false;
    }
}
`,
    solution: `public enum ParcelState {
    LABELLED, COLLECTED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED;

    private static final Map<ParcelState, Set<ParcelState>> ALLOWED = new EnumMap<>(ParcelState.class);

    static {
        ALLOWED.put(LABELLED, EnumSet.of(COLLECTED));
        ALLOWED.put(COLLECTED, EnumSet.of(IN_TRANSIT, RETURNED));
        ALLOWED.put(IN_TRANSIT, EnumSet.of(OUT_FOR_DELIVERY, RETURNED));
        ALLOWED.put(OUT_FOR_DELIVERY, EnumSet.of(DELIVERED, IN_TRANSIT, RETURNED));
        ALLOWED.put(DELIVERED, EnumSet.noneOf(ParcelState.class));
        ALLOWED.put(RETURNED, EnumSet.noneOf(ParcelState.class));
    }

    public boolean canMoveTo(ParcelState next) {
        return next != null && ALLOWED.get(this).contains(next);
    }

    public ParcelState moveTo(ParcelState next) {
        if (!canMoveTo(next)) {
            throw new IllegalStateException("cannot move parcel from " + this + " to " + next);
        }
        return next;
    }

    public boolean isTerminal() {
        return ALLOWED.get(this).isEmpty();
    }
}
`,
    hint: 'An EnumMap<ParcelState, Set<ParcelState>> filled in a static block makes the whole graph readable in one place; moveTo just delegates to canMoveTo.',
    explanation:
      'Encoding the allowed edges as data turns the state machine into something you can read, review, and test exhaustively, instead of logic hidden across service methods. Throwing on an illegal move (rather than silently ignoring it) surfaces bugs like a double-scan at the door. Terminal states fall out naturally as entries with an empty edge set.',
    rules: [
      { label: 'Keeps the transitions in a table or switch', type: 'mustContain', pattern: 'EnumSet\\.(of|noneOf)|Set\\.of\\s*\\(|switch\\s*\\(|case\\s+\\w+\\s*->', regex: true },
      { label: 'Rejects an illegal move with IllegalStateException', type: 'mustContain', pattern: 'IllegalStateException' },
      { label: 'Checks the requested next state against the allowed set', type: 'mustContain', pattern: '\\.contains\\s*\\(\\s*next\\s*\\)|next\\s*==\\s*\\w+', regex: true },
      { label: 'moveTo no longer returns the current state', type: 'mustNotContain', pattern: 'return\\s+this\\s*;', regex: true },
    ],
  },
  {
    id: 'java-build-exact-cents-money',
    number: 19,
    language: 'java',
    kind: 'build',
    title: 'Exact Cents Money',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'Tip pooling is computed in `double` and rounding drift keeps losing cents. Rewrite `Money` around a single `long cents` field with **no floating point anywhere**:\n\n- `plus(other)` and `times(qty)` use `Math.addExact` / `Math.multiplyExact` so overflow throws instead of wrapping.\n- `splitEvenly(ways)` returns `ways` parts whose cents sum exactly to the original; distribute the remainder one cent at a time to the first parts (use `%` or `Math.floorMod`). Throw `IllegalArgumentException` for `ways <= 0`.\n- `format()` returns the amount with two decimals via `BigDecimal.valueOf(cents, 2).toPlainString()`.\n- Equal by cents; provide `equals`, `hashCode`, `cents()`.',
    functionSignature: 'public List<Money> splitEvenly(int ways)',
    buggyCode: `public class Money {
    // TODO: long cents, exact arithmetic, even split, BigDecimal formatting
    private final double amount;

    public Money(double amount) {
        this.amount = amount;
    }

    public Money plus(Money other) {
        return new Money(amount + other.amount);
    }

    public Money times(int qty) {
        return new Money(amount * qty);
    }

    public List<Money> splitEvenly(int ways) {
        return List.of();
    }

    public String format() {
        return String.valueOf(amount);
    }
}
`,
    solution: `public final class Money {
    private final long cents;

    public Money(long cents) {
        this.cents = cents;
    }

    public long cents() {
        return cents;
    }

    public Money plus(Money other) {
        return new Money(Math.addExact(cents, other.cents));
    }

    public Money times(int qty) {
        return new Money(Math.multiplyExact(cents, qty));
    }

    public List<Money> splitEvenly(int ways) {
        if (ways <= 0) {
            throw new IllegalArgumentException("ways must be positive");
        }
        long base = Math.floorDiv(cents, ways);
        long remainder = Math.floorMod(cents, ways);
        List<Money> parts = new ArrayList<>(ways);
        for (int i = 0; i < ways; i++) {
            parts.add(new Money(i < remainder ? base + 1 : base));
        }
        return parts;
    }

    public String format() {
        return BigDecimal.valueOf(cents, 2).toPlainString();
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Money m && m.cents == cents;
    }

    @Override
    public int hashCode() {
        return Long.hashCode(cents);
    }

    @Override
    public String toString() {
        return format();
    }
}
`,
    hint: 'Integer division gives the base share and the remainder tells you how many parts get one extra cent; BigDecimal.valueOf(cents, 2) places the decimal point without any float conversion.',
    explanation:
      'Storing money as an integer number of minor units makes addition and splitting exact; 0.1 + 0.2 in binary floating point is already not 0.3. The Exact arithmetic helpers convert silent overflow into an ArithmeticException, which is the right failure mode for a ledger. BigDecimal is used only at the formatting boundary, so the domain logic stays in fast, exact long math.',
    rules: [
      { label: 'Formats via BigDecimal with scale 2', type: 'mustContain', pattern: 'BigDecimal\\.valueOf\\s*\\(\\s*cents\\s*,\\s*2\\s*\\)|movePointLeft\\s*\\(\\s*2\\s*\\)|setScale\\s*\\(\\s*2', regex: true },
      { label: 'Uses overflow-checked arithmetic', type: 'mustContain', pattern: 'Math\\.addExact|Math\\.multiplyExact', regex: true },
      { label: 'Distributes the remainder of the split', type: 'mustContain', pattern: '%\\s*ways|floorMod\\s*\\(', regex: true },
      { label: 'No floating-point types', type: 'mustNotContain', pattern: '\\bdouble\\b|\\bfloat\\b', regex: true },
    ],
  },
  {
    id: 'java-build-category-revenue-rollup',
    number: 20,
    language: 'java',
    kind: 'build',
    title: 'Category Revenue Rollup',
    difficulty: 'Hard',
    topic: 'Data Modelling',
    statement:
      'Produce a per-category sales report with the Streams API. Implement `summarize(List<Sale> sales)` returning `Map<String, CategorySummary>` where:\n\n- Keys are categories and **iterate alphabetically** (collect into a `TreeMap`).\n- `orders` = number of sales in the category; `revenueCents` = sum of `cents`.\n- `topItem` = the item with the highest summed revenue within the category; on a tie, the alphabetically first item.\n\nUse `Collectors.groupingBy` with a map factory and a downstream collector (`summingLong`, `counting`, `collectingAndThen`, …). An empty input yields an empty map.',
    functionSignature: 'public static Map<String, CategorySummary> summarize(List<Sale> sales)',
    buggyCode: `public class SalesReport {
    public record Sale(String category, String item, long cents) {}
    public record CategorySummary(long orders, long revenueCents, String topItem) {}

    public static Map<String, CategorySummary> summarize(List<Sale> sales) {
        // TODO: groupingBy category into a TreeMap with a downstream summary
        return Map.of();
    }
}
`,
    solution: `public class SalesReport {
    public record Sale(String category, String item, long cents) {}
    public record CategorySummary(long orders, long revenueCents, String topItem) {}

    public static Map<String, CategorySummary> summarize(List<Sale> sales) {
        return sales.stream().collect(Collectors.groupingBy(
            Sale::category,
            TreeMap::new,
            Collectors.collectingAndThen(Collectors.toList(), SalesReport::summarizeGroup)));
    }

    private static CategorySummary summarizeGroup(List<Sale> group) {
        long revenue = group.stream().mapToLong(Sale::cents).sum();
        Map<String, Long> byItem = group.stream().collect(
            Collectors.groupingBy(Sale::item, TreeMap::new, Collectors.summingLong(Sale::cents)));
        Comparator<Map.Entry<String, Long>> byRevenueThenName = Map.Entry.<String, Long>comparingByValue()
            .thenComparing(Map.Entry.<String, Long>comparingByKey(Comparator.reverseOrder()));
        String topItem = byItem.entrySet().stream()
            .max(byRevenueThenName)
            .map(Map.Entry::getKey)
            .orElse(null);
        return new CategorySummary(group.size(), revenue, topItem);
    }
}
`,
    hint: 'groupingBy(classifier, TreeMap::new, downstream) — the three-argument form picks the map type; collectingAndThen(toList(), fn) lets one downstream compute several numbers from the group.',
    explanation:
      'The three-argument groupingBy controls the map implementation, which is the only way to get deterministic alphabetical iteration from a stream rollup. collectingAndThen over the grouped list keeps the per-category logic in one plain function instead of a tangle of teeing collectors. The tie-break for topItem is made explicit with a comparator chain — relying on encounter order of max() is fragile and easy to get wrong.',
    rules: [
      { label: 'Groups with Collectors.groupingBy', type: 'mustContain', pattern: 'groupingBy\\s*\\(', regex: true },
      { label: 'Collects into a TreeMap for alphabetical keys', type: 'mustContain', pattern: 'TreeMap::new|new\\s+TreeMap', regex: true },
      { label: 'Aggregates revenue with a downstream collector or mapToLong', type: 'mustContain', pattern: 'summingLong\\s*\\(|mapToLong\\s*\\(|collectingAndThen\\s*\\(', regex: true },
      { label: 'No longer returns the empty placeholder map', type: 'mustNotContain', pattern: 'Map\\.of\\s*\\(\\s*\\)', regex: true },
    ],
  },
  // ---------------------------------------------------------------- Resilience
  {
    id: 'java-build-partner-api-circuit-breaker',
    number: 21,
    language: 'java',
    kind: 'build',
    title: 'Partner API Circuit Breaker',
    difficulty: 'Hard',
    topic: 'Resilience',
    statement:
      'Protect calls to a flaky partner API with a three-state breaker. The caller passes the current time in millis (no clocks inside). Implement on `CircuitBreaker`:\n\n- `allowRequest(now)`: `CLOSED` → true. `OPEN` → if `now - openedAt >= openMillis` move to `HALF_OPEN` and allow exactly this one probe; otherwise false. `HALF_OPEN` → false (a probe is already in flight).\n- `onSuccess()`: reset `failures` to 0 and go `CLOSED`.\n- `onFailure(now)`: in `HALF_OPEN` re-open immediately with `openedAt = now`. Otherwise increment `failures` and, once `failures >= failureThreshold`, open the breaker (`openedAt = now`, failures reset).\n\nUse the existing field names; methods stay `synchronized`.',
    functionSignature: 'public synchronized boolean allowRequest(long now)',
    buggyCode: `public class CircuitBreaker {
    public enum State { CLOSED, OPEN, HALF_OPEN }

    private final int failureThreshold;
    private final long openMillis;
    private int failures;
    private long openedAt = -1;
    private State state = State.CLOSED;

    public CircuitBreaker(int failureThreshold, long openMillis) {
        this.failureThreshold = failureThreshold;
        this.openMillis = openMillis;
    }

    public synchronized boolean allowRequest(long now) {
        // TODO
        return true;
    }

    public synchronized void onSuccess() {
        // TODO
    }

    public synchronized void onFailure(long now) {
        // TODO
    }

    public synchronized State state() {
        return state;
    }
}
`,
    solution: `public class CircuitBreaker {
    public enum State { CLOSED, OPEN, HALF_OPEN }

    private final int failureThreshold;
    private final long openMillis;
    private int failures;
    private long openedAt = -1;
    private State state = State.CLOSED;

    public CircuitBreaker(int failureThreshold, long openMillis) {
        this.failureThreshold = failureThreshold;
        this.openMillis = openMillis;
    }

    public synchronized boolean allowRequest(long now) {
        if (state == State.OPEN) {
            if (now - openedAt >= openMillis) {
                state = State.HALF_OPEN;
                return true;
            }
            return false;
        }
        if (state == State.HALF_OPEN) {
            return false;
        }
        return true;
    }

    public synchronized void onSuccess() {
        failures = 0;
        openedAt = -1;
        state = State.CLOSED;
    }

    public synchronized void onFailure(long now) {
        if (state == State.HALF_OPEN) {
            trip(now);
            return;
        }
        failures++;
        if (failures >= failureThreshold) {
            trip(now);
        }
    }

    private void trip(long now) {
        state = State.OPEN;
        openedAt = now;
        failures = 0;
    }

    public synchronized State state() {
        return state;
    }
}
`,
    hint: 'OPEN is a timer: compare now against openedAt + openMillis. HALF_OPEN lets exactly one probe through, and its result decides whether to close or re-open.',
    explanation:
      'A breaker stops a failing dependency from consuming every thread and timeout budget: after the threshold it fails fast for openMillis, then lets a single probe test recovery. Allowing only one probe in HALF_OPEN is the subtle part — letting every waiting caller through at once would just re-stampede the partner. Taking time as a parameter keeps the state machine deterministic and unit-testable.',
    rules: [
      { label: 'Moves into the HALF_OPEN state after the open window', type: 'mustContain', pattern: 'State\\.HALF_OPEN', regex: true },
      { label: 'Compares elapsed time against the open window', type: 'mustContain', pattern: 'now\\s*-\\s*openedAt|openedAt\\s*\\+\\s*openMillis', regex: true },
      { label: 'Opens once failures reach the threshold', type: 'mustContain', pattern: '>=\\s*failureThreshold|==\\s*failureThreshold', regex: true },
      { label: 'Resets the failure count', type: 'mustContain', pattern: 'failures\\s*=\\s*0', regex: true },
    ],
  },
  {
    id: 'java-build-export-job-bulkhead',
    number: 22,
    language: 'java',
    kind: 'build',
    title: 'Export Job Bulkhead',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'CSV exports are heavy, and too many at once starve the rest of the API. Implement a bulkhead on `ExportBulkhead` that allows at most `maxConcurrent` exports in flight:\n\n- Replace the `inFlight` counter with a `Semaphore(maxConcurrent)`.\n- `run(task)`: `tryAcquire()` a permit **without waiting**; if none is available throw `BulkheadFullException`. Otherwise call the task and release the permit in a `finally` block — also when the task throws.\n- `availableSlots()` reports the free permits.\n\nNo `synchronized` — the semaphore is the only coordination.',
    functionSignature: 'public <T> T run(Callable<T> task) throws Exception',
    buggyCode: `public class ExportBulkhead {
    public static class BulkheadFullException extends RuntimeException {
        public BulkheadFullException(String message) { super(message); }
    }

    private final int maxConcurrent;
    private int inFlight; // TODO: replace with a Semaphore

    public ExportBulkhead(int maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
    }

    public <T> T run(Callable<T> task) throws Exception {
        // TODO: reject when full, always release
        return task.call();
    }

    public int availableSlots() {
        return maxConcurrent - inFlight;
    }
}
`,
    solution: `public class ExportBulkhead {
    public static class BulkheadFullException extends RuntimeException {
        public BulkheadFullException(String message) { super(message); }
    }

    private final Semaphore permits;

    public ExportBulkhead(int maxConcurrent) {
        this.permits = new Semaphore(maxConcurrent);
    }

    public <T> T run(Callable<T> task) throws Exception {
        if (!permits.tryAcquire()) {
            throw new BulkheadFullException("too many exports in flight");
        }
        try {
            return task.call();
        } finally {
            permits.release();
        }
    }

    public int availableSlots() {
        return permits.availablePermits();
    }
}
`,
    hint: 'tryAcquire() returns immediately with false when no permit is free; the release must sit in finally so a failed export gives its slot back.',
    explanation:
      'A bulkhead caps how much of a shared resource one kind of work may consume, so a burst of exports degrades exports alone rather than the whole service. Semaphore.tryAcquire gives non-blocking admission control: callers are rejected fast and can fall back or retry later. Releasing in finally is what keeps the permit count from leaking downward every time a task throws.',
    rules: [
      { label: 'Limits concurrency with a Semaphore', type: 'mustContain', pattern: 'new\\s+Semaphore\\s*\\(', regex: true },
      { label: 'Admits without waiting via tryAcquire', type: 'mustContain', pattern: 'tryAcquire\\s*\\(', regex: true },
      { label: 'Releases the permit in finally', type: 'mustContain', pattern: 'finally\\s*\\{[^}]*release\\s*\\(', regex: true },
      { label: 'No synchronized blocks', type: 'mustNotContain', pattern: 'synchronized' },
    ],
  },
  {
    id: 'java-build-invoice-poison-message-parking',
    number: 23,
    language: 'java',
    kind: 'build',
    title: 'Invoice Poison Message Parking',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'An invoice consumer must not loop forever on a message that always fails. Implement `consume(Message m)` on `InvoiceConsumer`:\n\n- Track attempts per message id in the `attempts` map (`merge(id, 1, Integer::sum)` or `getOrDefault` + `put`).\n- Call `handler.handle(m)`. On success clear the id from `attempts` and return `PROCESSED`.\n- On any exception: if the attempt count has reached `maxAttempts`, park the message in `deadLetters` as a `DeadLetter(id, payload, attempts, reason)` where reason is the exception class simple name plus message, clear the id, and return `DEAD_LETTERED`. Otherwise return `RETRY`.\n- `deadLetters()` returns an unmodifiable view.',
    functionSignature: 'public Outcome consume(Message m)',
    buggyCode: `public class InvoiceConsumer {
    public record Message(String id, String payload) {}
    public record DeadLetter(String id, String payload, int attempts, String reason) {}
    public enum Outcome { PROCESSED, RETRY, DEAD_LETTERED }

    public interface Handler {
        void handle(Message m) throws Exception;
    }

    private final Handler handler;
    private final int maxAttempts;
    private final Map<String, Integer> attempts = new HashMap<>();
    private final List<DeadLetter> deadLetters = new ArrayList<>();

    public InvoiceConsumer(Handler handler, int maxAttempts) {
        this.handler = handler;
        this.maxAttempts = maxAttempts;
    }

    public Outcome consume(Message m) {
        // TODO: count attempts, park poison messages after maxAttempts
        return Outcome.PROCESSED;
    }

    public List<DeadLetter> deadLetters() {
        return deadLetters;
    }
}
`,
    solution: `public class InvoiceConsumer {
    public record Message(String id, String payload) {}
    public record DeadLetter(String id, String payload, int attempts, String reason) {}
    public enum Outcome { PROCESSED, RETRY, DEAD_LETTERED }

    public interface Handler {
        void handle(Message m) throws Exception;
    }

    private final Handler handler;
    private final int maxAttempts;
    private final Map<String, Integer> attempts = new HashMap<>();
    private final List<DeadLetter> deadLetters = new ArrayList<>();

    public InvoiceConsumer(Handler handler, int maxAttempts) {
        this.handler = handler;
        this.maxAttempts = maxAttempts;
    }

    public Outcome consume(Message m) {
        int attempt = attempts.merge(m.id(), 1, Integer::sum);
        try {
            handler.handle(m);
            attempts.remove(m.id());
            return Outcome.PROCESSED;
        } catch (Exception e) {
            if (attempt >= maxAttempts) {
                attempts.remove(m.id());
                String reason = e.getClass().getSimpleName() + ": " + e.getMessage();
                deadLetters.add(new DeadLetter(m.id(), m.payload(), attempt, reason));
                return Outcome.DEAD_LETTERED;
            }
            return Outcome.RETRY;
        }
    }

    public List<DeadLetter> deadLetters() {
        return Collections.unmodifiableList(deadLetters);
    }
}
`,
    hint: 'Map.merge returns the updated count, so one call both increments and tells you whether this was the last allowed attempt.',
    explanation:
      'A poison message — one that fails deterministically — would otherwise be redelivered forever, blocking the queue behind it. Counting attempts per id and parking the message with its failure reason after a bounded number of tries keeps the pipeline moving and gives operators something to inspect. Clearing the counter on success or parking prevents the map from growing without bound.',
    rules: [
      { label: 'Catches handler failures', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(Exception|RuntimeException|Throwable)\\b', regex: true },
      { label: 'Counts attempts per message id', type: 'mustContain', pattern: 'attempts\\.merge\\s*\\(|attempts\\.getOrDefault\\s*\\(|attempts\\.compute', regex: true },
      { label: 'Parks exhausted messages in deadLetters', type: 'mustContain', pattern: 'deadLetters\\.add\\s*\\(', regex: true },
      { label: 'Reports the DEAD_LETTERED outcome', type: 'mustContain', pattern: 'Outcome\\.DEAD_LETTERED', regex: true },
    ],
  },
  {
    id: 'java-build-interrupt-alarm-guard',
    number: 24,
    language: 'java',
    kind: 'build',
    title: 'Interrupt Alarm Guard',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'Give a blocking report call a hard deadline without a second thread pool per call. Implement `InterruptAfter` as an `AutoCloseable` guard and use it from `callWithDeadline`:\n\n- The constructor captures `Thread.currentThread()` and schedules `owner.interrupt()` on the given `ScheduledExecutorService` after `timeout`.\n- `close()` cancels the scheduled alarm (`cancel(false)`) and then calls `Thread.interrupted()` to clear a stale interrupt flag in case the alarm fired just as the work finished.\n- `callWithDeadline(scheduler, timeout, task)` wraps `task.call()` in a **try-with-resources** over a new `InterruptAfter`, so the alarm is always disarmed.',
    functionSignature: 'public static <T> T callWithDeadline(ScheduledExecutorService scheduler, Duration timeout, Callable<T> task) throws Exception',
    buggyCode: `public class Deadline {
    // TODO: make this an AutoCloseable guard that interrupts the current thread after the timeout
    public static class InterruptAfter {
        public InterruptAfter(ScheduledExecutorService scheduler, Duration timeout) {
        }
    }

    public static <T> T callWithDeadline(ScheduledExecutorService scheduler, Duration timeout, Callable<T> task) throws Exception {
        // TODO: wrap task.call() in try-with-resources over InterruptAfter
        return task.call();
    }
}
`,
    solution: `public class Deadline {
    public static final class InterruptAfter implements AutoCloseable {
        private final Thread owner = Thread.currentThread();
        private final ScheduledFuture<?> alarm;

        public InterruptAfter(ScheduledExecutorService scheduler, Duration timeout) {
            this.alarm = scheduler.schedule(owner::interrupt, timeout.toMillis(), TimeUnit.MILLISECONDS);
        }

        @Override
        public void close() {
            alarm.cancel(false);
            Thread.interrupted();
        }
    }

    public static <T> T callWithDeadline(ScheduledExecutorService scheduler, Duration timeout, Callable<T> task) throws Exception {
        try (InterruptAfter guard = new InterruptAfter(scheduler, timeout)) {
            return task.call();
        }
    }
}
`,
    hint: 'ScheduledExecutorService.schedule returns a ScheduledFuture you can cancel; try-with-resources guarantees close() runs whether the task returns, throws, or is interrupted.',
    explanation:
      'Scheduling an interrupt is a lightweight way to bound blocking work that honours interruption (sleeps, locks, blocking queues) without a thread per call. The guard pattern with try-with-resources makes disarming the alarm impossible to forget, and clearing the interrupt flag in close() stops a late alarm from poisoning the next blocking call on the same thread. There is still a tiny window if the alarm fires between cancel and interrupted(), which is why production code also checks the flag before reuse.',
    rules: [
      { label: 'InterruptAfter implements AutoCloseable', type: 'mustContain', pattern: 'implements\\s+AutoCloseable', regex: true },
      { label: 'Uses try-with-resources around the task', type: 'mustContain', pattern: 'try\\s*\\(', regex: true },
      { label: 'Cancels the scheduled alarm on close', type: 'mustContain', pattern: '\\.cancel\\s*\\(', regex: true },
      { label: 'Clears a stale interrupt flag with Thread.interrupted()', type: 'mustContain', pattern: 'Thread\\.interrupted\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-ledger-error-translation',
    number: 25,
    language: 'java',
    kind: 'build',
    title: 'Ledger Error Translation',
    difficulty: 'Hard',
    topic: 'Resilience',
    statement:
      'The ledger service must not leak storage exceptions to its callers. Build a small unchecked hierarchy under the given abstract `LedgerException` and a translator:\n\n- Subclasses `LedgerNotFoundException`, `LedgerConflictException`, `LedgerUnavailableException`, `LedgerInternalException`, each with a `(String message, Throwable cause)` constructor. Add `abstract boolean retryable()` to the base; only `LedgerUnavailableException` returns true.\n- `translate(Exception e)`: if `e` is already a `LedgerException` return it **unchanged** (never double-wrap). `NoSuchElementException` → NotFound; `IllegalStateException` → Conflict; `IOException` or `TimeoutException` → Unavailable; anything else → Internal. Always pass `e` as the cause so the stack trace is preserved.',
    functionSignature: 'public static LedgerException translate(Exception e)',
    buggyCode: `public class LedgerErrors {
    // TODO: subclasses NotFound / Conflict / Unavailable / Internal, retryable(), translate()
    public static abstract class LedgerException extends RuntimeException {
        protected LedgerException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static LedgerException translate(Exception e) {
        // TODO
        return null;
    }
}
`,
    solution: `public class LedgerErrors {
    public static abstract class LedgerException extends RuntimeException {
        protected LedgerException(String message, Throwable cause) {
            super(message, cause);
        }

        public abstract boolean retryable();
    }

    public static final class LedgerNotFoundException extends LedgerException {
        public LedgerNotFoundException(String message, Throwable cause) { super(message, cause); }
        @Override public boolean retryable() { return false; }
    }

    public static final class LedgerConflictException extends LedgerException {
        public LedgerConflictException(String message, Throwable cause) { super(message, cause); }
        @Override public boolean retryable() { return false; }
    }

    public static final class LedgerUnavailableException extends LedgerException {
        public LedgerUnavailableException(String message, Throwable cause) { super(message, cause); }
        @Override public boolean retryable() { return true; }
    }

    public static final class LedgerInternalException extends LedgerException {
        public LedgerInternalException(String message, Throwable cause) { super(message, cause); }
        @Override public boolean retryable() { return false; }
    }

    public static LedgerException translate(Exception e) {
        if (e instanceof LedgerException already) {
            return already;
        }
        if (e instanceof NoSuchElementException) {
            return new LedgerNotFoundException("ledger entry not found", e);
        }
        if (e instanceof IllegalStateException) {
            return new LedgerConflictException("ledger conflict", e);
        }
        if (e instanceof IOException || e instanceof TimeoutException) {
            return new LedgerUnavailableException("ledger storage unavailable", e);
        }
        return new LedgerInternalException("unexpected ledger failure", e);
    }
}
`,
    hint: 'Check for LedgerException first so already-translated errors pass straight through, then map the storage exceptions with instanceof and always chain the cause.',
    explanation:
      'Translating at the service boundary gives callers a small, stable set of failure types with a clear retry policy, instead of coupling them to whatever the storage layer throws this quarter. Passing the original as the cause keeps the full stack trace for debugging. The pass-through check is what prevents nested layers from wrapping a LedgerException inside another LedgerException, which would break instanceof checks upstream.',
    rules: [
      { label: 'Defines concrete subclasses of LedgerException', type: 'mustContain', pattern: 'extends\\s+LedgerException\\b', regex: true },
      { label: 'Returns an existing LedgerException unchanged', type: 'mustContain', pattern: 'instanceof\\s+LedgerException|case\\s+LedgerException', regex: true },
      { label: 'Maps NoSuchElementException to the not-found type', type: 'mustContain', pattern: 'instanceof\\s+NoSuchElementException|case\\s+NoSuchElementException', regex: true },
      { label: 'Never returns null', type: 'mustNotContain', pattern: 'return null' },
    ],
  },
  // ------------------------------------------------------------------ Persistence Patterns
  {
    id: 'java-build-garment-ticket-repository',
    number: 26,
    language: 'java',
    kind: 'build',
    title: 'Garment Ticket Repository',
    difficulty: 'Easy',
    topic: 'Persistence Patterns',
    statement:
      'A dry-cleaning shop tracks garments with `Ticket(id, customer, status)`. Implement `InMemoryTicketRepository`, which fulfils the `TicketRepository` interface using a `Map<String, Ticket>` keyed by ticket id.\n\n- `findById` returns `Optional.empty()` when the id is unknown — never null.\n- `findByStatus` returns every ticket whose status equals the argument, in insertion order (an empty list when none match).\n- `save` inserts or replaces the ticket with the same id and returns it.\n- `deleteById` removes the ticket and returns true only if something was actually removed.',
    functionSignature: 'class InMemoryTicketRepository implements TicketRepository',
    buggyCode: `record Ticket(String id, String customer, String status) {}

interface TicketRepository {
    Optional<Ticket> findById(String id);
    List<Ticket> findByStatus(String status);
    Ticket save(Ticket ticket);
    boolean deleteById(String id);
}

class InMemoryTicketRepository implements TicketRepository {
    private final Map<String, Ticket> rows = new LinkedHashMap<>();

    @Override
    public Optional<Ticket> findById(String id) {
        // TODO
        return null;
    }

    @Override
    public List<Ticket> findByStatus(String status) {
        // TODO
        return List.of();
    }

    @Override
    public Ticket save(Ticket ticket) {
        // TODO
        return ticket;
    }

    @Override
    public boolean deleteById(String id) {
        // TODO
        return false;
    }
}
`,
    solution: `record Ticket(String id, String customer, String status) {}

interface TicketRepository {
    Optional<Ticket> findById(String id);
    List<Ticket> findByStatus(String status);
    Ticket save(Ticket ticket);
    boolean deleteById(String id);
}

class InMemoryTicketRepository implements TicketRepository {
    private final Map<String, Ticket> rows = new LinkedHashMap<>();

    @Override
    public Optional<Ticket> findById(String id) {
        return Optional.ofNullable(rows.get(id));
    }

    @Override
    public List<Ticket> findByStatus(String status) {
        List<Ticket> out = new ArrayList<>();
        for (Ticket t : rows.values()) {
            if (t.status().equals(status)) out.add(t);
        }
        return out;
    }

    @Override
    public Ticket save(Ticket ticket) {
        rows.put(ticket.id(), ticket);
        return ticket;
    }

    @Override
    public boolean deleteById(String id) {
        return rows.remove(id) != null;
    }
}
`,
    hint: 'Optional.ofNullable turns a possibly-null map lookup into an Optional, and Map.remove returns the previous value, which tells you whether anything was deleted.',
    explanation:
      'A repository hides how rows are stored behind a small interface, so services depend on TicketRepository and tests can use this in-memory version instead of a database. The two pitfalls are returning null where Optional was promised and reporting a delete as successful when nothing existed — Map.remove returning the old value gives you that answer for free. The same interface later gets a JDBC implementation without touching callers.',
    rules: [
      { label: 'findById wraps the lookup in an Optional', type: 'mustContain', pattern: 'Optional\\.ofNullable\\(|Optional\\.of\\(', regex: true },
      { label: 'save stores the ticket under its id', type: 'mustContain', pattern: '\\.put\\(\\s*ticket\\.id\\(\\)', regex: true },
      { label: 'deleteById reports whether a row was removed', type: 'mustContain', pattern: '\\.remove\\(\\s*id\\s*\\)\\s*!=\\s*null|containsKey\\(\\s*id\\s*\\)', regex: true },
      { label: 'Never returns null from a repository method', type: 'mustNotContain', pattern: 'return null;' },
    ],
  },
  {
    id: 'java-build-greenhouse-change-set',
    number: 27,
    language: 'java',
    kind: 'build',
    title: 'Greenhouse Change Set',
    difficulty: 'Medium',
    topic: 'Persistence Patterns',
    statement:
      'Sensors in a greenhouse report readings all day, but the `ReadingStore` should be hit once per flush. Implement `ChangeSet`, a unit-of-work that buffers writes and applies them in one `commit`.\n\n- `stage(sensorId, value)` records an upsert. Staging the same id twice keeps only the last value (one upsert). Staging an id that was previously `remove`d cancels the delete.\n- `remove(sensorId)` records a delete and cancels any staged upsert for that id.\n- `pendingCount()` returns staged upserts plus pending deletes.\n- `commit(store)` applies all upserts (in staging order) via `store.upsert`, then all deletes via `store.delete`, returns the number of operations applied, and leaves the change set empty.',
    functionSignature: 'public int commit(ReadingStore store)',
    buggyCode: `interface ReadingStore {
    void upsert(String sensorId, String value);
    void delete(String sensorId);
}

class ChangeSet {
    private final Map<String, String> staged = new LinkedHashMap<>();
    private final Set<String> removed = new LinkedHashSet<>();

    public void stage(String sensorId, String value) {
        // TODO
    }

    public void remove(String sensorId) {
        // TODO
    }

    public int pendingCount() {
        return staged.size() + removed.size();
    }

    public int commit(ReadingStore store) {
        // TODO
        return 0;
    }
}
`,
    solution: `interface ReadingStore {
    void upsert(String sensorId, String value);
    void delete(String sensorId);
}

class ChangeSet {
    private final Map<String, String> staged = new LinkedHashMap<>();
    private final Set<String> removed = new LinkedHashSet<>();

    public void stage(String sensorId, String value) {
        removed.remove(sensorId);
        staged.put(sensorId, value);
    }

    public void remove(String sensorId) {
        staged.remove(sensorId);
        removed.add(sensorId);
    }

    public int pendingCount() {
        return staged.size() + removed.size();
    }

    public int commit(ReadingStore store) {
        int applied = 0;
        for (Map.Entry<String, String> e : staged.entrySet()) {
            store.upsert(e.getKey(), e.getValue());
            applied++;
        }
        for (String id : removed) {
            store.delete(id);
            applied++;
        }
        staged.clear();
        removed.clear();
        return applied;
    }
}
`,
    hint: 'stage and remove must each cancel the other for the same id, so the store never sees a write immediately undone by a delete.',
    explanation:
      'A unit of work collects intended changes and flushes them together, which turns hundreds of tiny writes into a single batch and keeps the in-memory picture coherent until commit. The subtle part is that later operations on the same key must override earlier ones — a remove after a stage should not send both. Clearing after commit makes the object reusable and prevents double-applying on the next flush.',
    rules: [
      { label: 'commit sends upserts to the store', type: 'mustContain', pattern: 'store.upsert(' },
      { label: 'commit sends deletes to the store', type: 'mustContain', pattern: 'store.delete(' },
      { label: 'stage/remove cancel each other for the same id', type: 'mustContain', pattern: 'removed\\.remove\\(\\s*sensorId\\s*\\)|staged\\.remove\\(\\s*sensorId\\s*\\)', regex: true },
      { label: 'The change set is emptied after commit', type: 'mustContain', pattern: 'staged\\.clear\\(\\)|staged\\s*=\\s*new', regex: true },
    ],
  },
  {
    id: 'java-build-seating-chart-version-guard',
    number: 28,
    language: 'java',
    kind: 'build',
    title: 'Seating Chart Version Guard',
    difficulty: 'Medium',
    topic: 'Persistence Patterns',
    statement:
      'Two wedding planners can edit the same seating chart at once. Implement optimistic locking in `SeatingChartStore.update(id, newLayout, expectedVersion)`:\n\n- If no row has that id, throw `NoSuchElementException`.\n- If the stored row\'s `version()` is not equal to `expectedVersion`, throw `StaleUpdateException` with a message that mentions both versions — do not overwrite.\n- Otherwise store a new `ChartRow` with `newLayout` and `version + 1`, and return it.\n\n`create` stores a row at version 1 and `find` is already written. Rows are immutable records, so an update always replaces the row.',
    functionSignature: 'public ChartRow update(String id, String newLayout, long expectedVersion)',
    buggyCode: `class StaleUpdateException extends RuntimeException {
    public StaleUpdateException(String message) { super(message); }
}

record ChartRow(String id, String layout, long version) {}

class SeatingChartStore {
    private final Map<String, ChartRow> rows = new HashMap<>();

    public ChartRow create(String id, String layout) {
        ChartRow row = new ChartRow(id, layout, 1L);
        rows.put(id, row);
        return row;
    }

    public Optional<ChartRow> find(String id) {
        return Optional.ofNullable(rows.get(id));
    }

    public ChartRow update(String id, String newLayout, long expectedVersion) {
        // TODO: refuse stale writes
        ChartRow next = new ChartRow(id, newLayout, expectedVersion);
        rows.put(id, next);
        return next;
    }
}
`,
    solution: `class StaleUpdateException extends RuntimeException {
    public StaleUpdateException(String message) { super(message); }
}

record ChartRow(String id, String layout, long version) {}

class SeatingChartStore {
    private final Map<String, ChartRow> rows = new HashMap<>();

    public ChartRow create(String id, String layout) {
        ChartRow row = new ChartRow(id, layout, 1L);
        rows.put(id, row);
        return row;
    }

    public Optional<ChartRow> find(String id) {
        return Optional.ofNullable(rows.get(id));
    }

    public ChartRow update(String id, String newLayout, long expectedVersion) {
        ChartRow current = rows.get(id);
        if (current == null) throw new NoSuchElementException("no chart with id " + id);
        if (current.version() != expectedVersion) {
            throw new StaleUpdateException("chart " + id + " is at version " + current.version()
                + " but the update expected " + expectedVersion);
        }
        ChartRow next = new ChartRow(id, newLayout, current.version() + 1);
        rows.put(id, next);
        return next;
    }
}
`,
    hint: 'Compare the stored version to the caller\'s expected version before writing, and bump the stored version rather than trusting the caller\'s number.',
    explanation:
      'Optimistic locking lets concurrent editors work without holding locks: each update carries the version it was based on, and the store rejects it if someone else got there first. The version must come from the stored row plus one, never from the caller, or a stale client could reset it. In SQL this is `UPDATE ... WHERE id = ? AND version = ?` with a check that one row was affected.',
    rules: [
      { label: 'Compares the stored version with expectedVersion', type: 'mustContain', pattern: 'version\\(\\)\\s*!=\\s*expectedVersion|expectedVersion\\s*!=\\s*\\w+\\.version\\(\\)', regex: true },
      { label: 'Throws StaleUpdateException on a mismatch', type: 'mustContain', pattern: 'throw new StaleUpdateException' },
      { label: 'Increments the stored version', type: 'mustContain', pattern: 'version\\(\\)\\s*\\+\\s*1', regex: true },
      { label: 'No longer writes the caller-supplied version blindly', type: 'mustNotContain', pattern: 'new ChartRow\\(\\s*id\\s*,\\s*newLayout\\s*,\\s*expectedVersion\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-bistro-menu-soft-delete',
    number: 29,
    language: 'java',
    kind: 'build',
    title: 'Bistro Menu Soft Delete',
    difficulty: 'Easy',
    topic: 'Persistence Patterns',
    statement:
      'A bistro retires dishes but keeps them for old receipts. `MenuItem` carries a nullable `deletedAt` timestamp. Implement soft deletion in `MenuStore`:\n\n- `softDelete(id, at)` replaces the item with a copy whose `deletedAt` is `at` and returns true. It returns false (and changes nothing) when the id is unknown or the item is already deleted. The row must stay in the map.\n- `findActive()` returns only items whose `deletedAt` is null, in insertion order.\n- `findById(id, includeDeleted)` returns the item; when `includeDeleted` is false a deleted item counts as absent.',
    functionSignature: 'public boolean softDelete(String id, long at)',
    buggyCode: `record MenuItem(String id, String name, Long deletedAt) {
    boolean isDeleted() { return deletedAt != null; }
}

class MenuStore {
    private final Map<String, MenuItem> items = new LinkedHashMap<>();

    public void add(MenuItem item) {
        items.put(item.id(), item);
    }

    public boolean softDelete(String id, long at) {
        // TODO: mark instead of removing
        return items.remove(id) != null;
    }

    public List<MenuItem> findActive() {
        // TODO
        return new ArrayList<>(items.values());
    }

    public Optional<MenuItem> findById(String id, boolean includeDeleted) {
        // TODO
        return Optional.ofNullable(items.get(id));
    }
}
`,
    solution: `record MenuItem(String id, String name, Long deletedAt) {
    boolean isDeleted() { return deletedAt != null; }
}

class MenuStore {
    private final Map<String, MenuItem> items = new LinkedHashMap<>();

    public void add(MenuItem item) {
        items.put(item.id(), item);
    }

    public boolean softDelete(String id, long at) {
        MenuItem item = items.get(id);
        if (item == null || item.isDeleted()) return false;
        items.put(id, new MenuItem(item.id(), item.name(), at));
        return true;
    }

    public List<MenuItem> findActive() {
        List<MenuItem> out = new ArrayList<>();
        for (MenuItem m : items.values()) {
            if (!m.isDeleted()) out.add(m);
        }
        return out;
    }

    public Optional<MenuItem> findById(String id, boolean includeDeleted) {
        MenuItem m = items.get(id);
        if (m == null || (!includeDeleted && m.isDeleted())) return Optional.empty();
        return Optional.of(m);
    }
}
`,
    hint: 'Deleting means replacing the record with a copy that has a timestamp; every read path then has to filter on that timestamp.',
    explanation:
      'Soft deletion keeps history and referential integrity intact while hiding rows from normal reads. The cost is discipline: every query must apply the "not deleted" filter, and admin paths need an explicit way to see retired rows — which is what the includeDeleted flag models. Because records are immutable, deleting is a replace, not a mutation.',
    rules: [
      { label: 'Read paths filter on the deleted marker', type: 'mustContain', pattern: '\\w+\\.isDeleted\\(\\)|deletedAt\\(\\)\\s*[!=]=\\s*null', regex: true },
      { label: 'softDelete stores a copy stamped with the timestamp', type: 'mustContain', pattern: 'new MenuItem\\(\\s*\\w+\\.id\\(\\)\\s*,\\s*\\w+\\.name\\(\\)\\s*,\\s*at\\s*\\)', regex: true },
      { label: 'findById honours includeDeleted', type: 'mustContain', pattern: '!\\s*includeDeleted|includeDeleted\\s*(\\|\\||&&|\\?)', regex: true },
      { label: 'Rows are never physically removed', type: 'mustNotContain', pattern: 'items\\.remove\\(', regex: true },
    ],
  },
  {
    id: 'java-build-cargo-crate-specifications',
    number: 30,
    language: 'java',
    kind: 'build',
    title: 'Cargo Crate Specifications',
    difficulty: 'Medium',
    topic: 'Persistence Patterns',
    statement:
      'A freight yard filters crates with composable rules. Implement the `Spec<T>` interface\'s combinators and `select`:\n\n- `and(other)` returns a spec satisfied only when both this and `other` are satisfied.\n- `or(other)` returns a spec satisfied when either is.\n- `not()` returns a spec satisfied exactly when this one is not.\n- `static <T> List<T> select(List<T> items, Spec<T> spec)` returns the items satisfying `spec`, in the original order.\n\nAll combinators must be lazy — they build a new `Spec`, they do not evaluate anything until `isSatisfiedBy` is called. `CrateSpecs` shows how leaf specs are written; leave it as is.',
    functionSignature: 'default Spec<T> and(Spec<T> other)',
    buggyCode: `interface Spec<T> {
    boolean isSatisfiedBy(T candidate);

    default Spec<T> and(Spec<T> other) {
        throw new UnsupportedOperationException("TODO");
    }

    default Spec<T> or(Spec<T> other) {
        throw new UnsupportedOperationException("TODO");
    }

    default Spec<T> not() {
        throw new UnsupportedOperationException("TODO");
    }

    static <T> List<T> select(List<T> items, Spec<T> spec) {
        // TODO
        return items;
    }
}

record Crate(String id, int weightKg, boolean hazardous, String destination) {}

class CrateSpecs {
    static Spec<Crate> heavierThan(int kg) { return c -> c.weightKg() > kg; }
    static Spec<Crate> hazardous() { return Crate::hazardous; }
    static Spec<Crate> boundFor(String port) { return c -> c.destination().equals(port); }
}
`,
    solution: `interface Spec<T> {
    boolean isSatisfiedBy(T candidate);

    default Spec<T> and(Spec<T> other) {
        return c -> this.isSatisfiedBy(c) && other.isSatisfiedBy(c);
    }

    default Spec<T> or(Spec<T> other) {
        return c -> this.isSatisfiedBy(c) || other.isSatisfiedBy(c);
    }

    default Spec<T> not() {
        return c -> !this.isSatisfiedBy(c);
    }

    static <T> List<T> select(List<T> items, Spec<T> spec) {
        List<T> out = new ArrayList<>();
        for (T item : items) {
            if (spec.isSatisfiedBy(item)) out.add(item);
        }
        return out;
    }
}

record Crate(String id, int weightKg, boolean hazardous, String destination) {}

class CrateSpecs {
    static Spec<Crate> heavierThan(int kg) { return c -> c.weightKg() > kg; }
    static Spec<Crate> hazardous() { return Crate::hazardous; }
    static Spec<Crate> boundFor(String port) { return c -> c.destination().equals(port); }
}
`,
    hint: 'Spec is a functional interface, so each combinator can return a lambda that calls this.isSatisfiedBy and other.isSatisfiedBy.',
    explanation:
      'The specification pattern turns query rules into first-class values that can be combined, named and tested in isolation, and later translated into SQL WHERE clauses or in-memory filters alike. Default methods on the interface give every leaf spec the combinators for free. Keeping them lazy matters: the composed spec is data until it is applied, so it can be built once and reused.',
    rules: [
      { label: 'and() requires both specs', type: 'mustContain', pattern: '\\.isSatisfiedBy\\(\\s*\\w+\\s*\\)\\s*&&\\s*\\w+\\.isSatisfiedBy\\(', regex: true },
      { label: 'or() accepts either spec', type: 'mustContain', pattern: '\\|\\|\\s*\\w+\\.isSatisfiedBy\\(', regex: true },
      { label: 'not() negates the spec', type: 'mustContain', pattern: '!\\s*(this\\.)?isSatisfiedBy\\(', regex: true },
      { label: 'No placeholder exceptions remain', type: 'mustNotContain', pattern: 'UnsupportedOperationException' },
    ],
  },
  {
    id: 'java-build-shipment-row-mapper',
    number: 31,
    language: 'java',
    kind: 'build',
    title: 'Shipment Row Mapper',
    difficulty: 'Medium',
    topic: 'Persistence Patterns',
    statement:
      'Query results arrive as `Row` objects whose `get(column)` returns the cell text or null when the column is absent or NULL. Implement `ShipmentMapper.fromRow` to build a `Shipment` record and `mapAll` to convert a whole result set.\n\n- Columns `id`, `carrier`, `weight_grams` and `shipped_on` are required; if one is null throw `IllegalArgumentException` whose message names the column.\n- `weight_grams` is parsed as an int and `shipped_on` as an ISO date (`LocalDate.parse`). A malformed value throws `IllegalArgumentException` naming the column (wrap the parse failure).\n- `tracking_note` is optional and may be null.\n- `mapAll` returns the shipments in row order and lets any exception propagate.',
    functionSignature: 'public static Shipment fromRow(Row row)',
    buggyCode: `interface Row {
    /** The cell as text, or null when the column is absent or SQL NULL. */
    String get(String column);
}

record Shipment(String id, String carrier, int weightGrams, LocalDate shippedOn, String trackingNote) {}

class ShipmentMapper {
    public static Shipment fromRow(Row row) {
        // TODO: validate and parse every column
        return new Shipment(row.get("id"), row.get("carrier"), 0, null, row.get("tracking_note"));
    }

    public static List<Shipment> mapAll(List<Row> rows) {
        // TODO
        return List.of();
    }
}
`,
    solution: `interface Row {
    /** The cell as text, or null when the column is absent or SQL NULL. */
    String get(String column);
}

record Shipment(String id, String carrier, int weightGrams, LocalDate shippedOn, String trackingNote) {}

class ShipmentMapper {
    public static Shipment fromRow(Row row) {
        String id = required(row, "id");
        String carrier = required(row, "carrier");
        int weight;
        try {
            weight = Integer.parseInt(required(row, "weight_grams").trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("column weight_grams is not an integer", e);
        }
        LocalDate shipped;
        try {
            shipped = LocalDate.parse(required(row, "shipped_on").trim());
        } catch (DateTimeException e) {
            throw new IllegalArgumentException("column shipped_on is not an ISO date", e);
        }
        return new Shipment(id, carrier, weight, shipped, row.get("tracking_note"));
    }

    public static List<Shipment> mapAll(List<Row> rows) {
        List<Shipment> out = new ArrayList<>(rows.size());
        for (Row r : rows) out.add(fromRow(r));
        return out;
    }

    private static String required(Row row, String column) {
        String value = row.get(column);
        if (value == null) throw new IllegalArgumentException("column " + column + " is required");
        return value;
    }
}
`,
    hint: 'Write a small required(row, column) helper that throws with the column name, then parse ints and dates inside try/catch so the failure names the column too.',
    explanation:
      'Row mappers are the boundary between untyped storage and typed domain objects, so they should fail loudly and precisely: a message like "column shipped_on is not an ISO date" saves an hour of debugging compared with a bare NumberFormatException. Centralising the required-column check in a helper keeps the mapper readable. Optional columns are read directly, with null as the legitimate absence value.',
    rules: [
      { label: 'Parses weight_grams as an integer', type: 'mustContain', pattern: 'Integer\\.parseInt\\(', regex: true },
      { label: 'Parses shipped_on as a LocalDate', type: 'mustContain', pattern: 'LocalDate\\.parse\\(', regex: true },
      { label: 'Rejects missing required columns with IllegalArgumentException', type: 'mustContain', pattern: 'throw new IllegalArgumentException\\(', regex: true },
      { label: 'Wraps parse failures', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(NumberFormatException|DateTimeParseException|DateTimeException|RuntimeException)', regex: true },
    ],
  },

  // ------------------------------------------------------------------ Messaging
  {
    id: 'java-build-parcel-scan-once-only',
    number: 32,
    language: 'java',
    kind: 'build',
    title: 'Once-Only Scan Handler',
    difficulty: 'Easy',
    topic: 'Messaging',
    statement:
      'A courier hub receives parcel scan events from a queue that guarantees at-least-once delivery, so the same `ScanEvent` can arrive twice. Implement `ScanConsumer.receive(event, handler)`:\n\n- Keep a `Set<String>` of event ids that have been handled.\n- If the event id was already handled, return false without calling the handler.\n- Otherwise call `handler.accept(event)`, then record the id and return true.\n- Record the id only after the handler returns normally, so a handler that throws leaves the event unhandled and a redelivery will retry it.\n\n`handledCount()` returns how many distinct events have been handled.',
    functionSignature: 'public boolean receive(ScanEvent event, Consumer<ScanEvent> handler)',
    buggyCode: `record ScanEvent(String eventId, String parcelId, String hub) {}

class ScanConsumer {
    // TODO: remember which event ids have been handled

    public boolean receive(ScanEvent event, Consumer<ScanEvent> handler) {
        // TODO: skip redeliveries
        handler.accept(event);
        return true;
    }

    public int handledCount() {
        return 0;
    }
}
`,
    solution: `record ScanEvent(String eventId, String parcelId, String hub) {}

class ScanConsumer {
    private final Set<String> handled = new HashSet<>();

    public boolean receive(ScanEvent event, Consumer<ScanEvent> handler) {
        if (handled.contains(event.eventId())) return false;
        handler.accept(event);
        handled.add(event.eventId());
        return true;
    }

    public int handledCount() {
        return handled.size();
    }
}
`,
    hint: 'Check the set before calling the handler, and add to it after the handler succeeds — not before.',
    explanation:
      'Queues rarely promise exactly-once delivery; instead consumers are made idempotent by remembering which message ids they have processed. Ordering matters: marking an event handled before the handler runs would lose it forever if the handler crashed halfway. In production the set lives in the database, often in the same transaction as the handler\'s writes.',
    rules: [
      { label: 'Tracks handled ids in a Set<String>', type: 'mustContain', pattern: 'Set<String>' },
      { label: 'Skips events whose id was already handled', type: 'mustContain', pattern: '\\w+\\.contains\\(\\s*event\\.eventId\\(\\)\\s*\\)', regex: true },
      { label: 'Records the id after handling', type: 'mustContain', pattern: '\\w+\\.add\\(\\s*event\\.eventId\\(\\)\\s*\\)', regex: true },
      { label: 'Still invokes the handler', type: 'mustContain', pattern: 'handler.accept(event)' },
    ],
  },
  {
    id: 'java-build-rider-ordered-lanes',
    number: 33,
    language: 'java',
    kind: 'build',
    title: 'Per-Rider Ordered Lanes',
    difficulty: 'Medium',
    topic: 'Messaging',
    statement:
      'A bike-share backend processes trip events concurrently, but events for the same rider must run one after another in the order they were submitted. Implement `KeyedExecutor`:\n\n- The constructor creates `laneCount` lanes, each backed by `Executors.newSingleThreadExecutor()`.\n- `laneFor(key)` maps a key to a lane index in `[0, laneCount)` deterministically — use `Math.floorMod(key.hashCode(), laneCount)` so negative hash codes do not break it.\n- `submit(key, task)` submits the task to that key\'s lane and returns the `Future`.\n- `shutdown()` calls `shutdown()` on every lane, waits up to 5 seconds for each with `awaitTermination`, and calls `shutdownNow()` on any lane that has not finished.',
    functionSignature: 'public Future<?> submit(String key, Runnable task)',
    buggyCode: `class KeyedExecutor {
    private final ExecutorService pool;

    public KeyedExecutor(int laneCount) {
        // TODO: one single-threaded lane per index
        pool = Executors.newFixedThreadPool(laneCount);
    }

    public int laneFor(String key) {
        // TODO
        return 0;
    }

    public Future<?> submit(String key, Runnable task) {
        // TODO: route to the key's lane
        return pool.submit(task);
    }

    public void shutdown() throws InterruptedException {
        pool.shutdown();
    }
}
`,
    solution: `class KeyedExecutor {
    private final ExecutorService[] lanes;

    public KeyedExecutor(int laneCount) {
        lanes = new ExecutorService[laneCount];
        for (int i = 0; i < laneCount; i++) {
            lanes[i] = Executors.newSingleThreadExecutor();
        }
    }

    public int laneFor(String key) {
        return Math.floorMod(key.hashCode(), lanes.length);
    }

    public Future<?> submit(String key, Runnable task) {
        return lanes[laneFor(key)].submit(task);
    }

    public void shutdown() throws InterruptedException {
        for (ExecutorService lane : lanes) lane.shutdown();
        for (ExecutorService lane : lanes) {
            if (!lane.awaitTermination(5, TimeUnit.SECONDS)) lane.shutdownNow();
        }
    }
}
`,
    hint: 'A shared thread pool interleaves tasks; per-key ordering needs an array of single-thread executors and a stable key-to-index function.',
    explanation:
      'A fixed thread pool gives parallelism but no ordering guarantee — two events for one rider can run on two threads at once. Partitioning keys across single-threaded lanes (the same idea as Kafka partitions) preserves per-key order while still using all cores. floorMod is essential because hashCode can be negative, and a graceful shutdown lets in-flight events finish before forcing the rest.',
    rules: [
      { label: 'Each lane is a single-thread executor', type: 'mustContain', pattern: 'newSingleThreadExecutor\\(\\)', regex: true },
      { label: 'Keys map to a non-negative lane index', type: 'mustContain', pattern: 'Math\\.floorMod\\(|Math\\.abs\\(\\s*\\w+\\.hashCode\\(\\)', regex: true },
      { label: 'shutdown waits for lanes to drain', type: 'mustContain', pattern: 'awaitTermination(' },
      { label: 'No longer uses a shared multi-thread pool', type: 'mustNotContain', pattern: 'newFixedThreadPool|newCachedThreadPool', regex: true },
    ],
  },
  {
    id: 'java-build-invoice-poison-parking',
    number: 34,
    language: 'java',
    kind: 'build',
    title: 'Invoice Poison Pill Parking',
    difficulty: 'Medium',
    topic: 'Messaging',
    statement:
      'An invoicing worker sometimes receives a message that fails every time. Implement `RetryingInvoiceConsumer.receive(msg, handler)` so poison messages are parked instead of blocking the queue:\n\n- Call `handler.accept(msg)`. On success clear any attempt count for that id and return `"ok"`.\n- If the handler throws a `RuntimeException`, increment the attempt count for `msg.id()`.\n- If the count has reached `maxAttempts`, remove the count, append the message to `deadLetters` and return `"dead"`.\n- Otherwise return `"retry"` so the broker redelivers it.\n\n`deadLetters()` exposes the parked messages read-only.',
    functionSignature: 'public String receive(InvoiceMsg msg, Consumer<InvoiceMsg> handler)',
    buggyCode: `record InvoiceMsg(String id, String payload) {}

class RetryingInvoiceConsumer {
    private final int maxAttempts;
    private final Map<String, Integer> attempts = new HashMap<>();
    private final List<InvoiceMsg> deadLetters = new ArrayList<>();

    public RetryingInvoiceConsumer(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public String receive(InvoiceMsg msg, Consumer<InvoiceMsg> handler) {
        // TODO: count failures and park the message after maxAttempts
        handler.accept(msg);
        return "ok";
    }

    public List<InvoiceMsg> deadLetters() {
        return Collections.unmodifiableList(deadLetters);
    }
}
`,
    solution: `record InvoiceMsg(String id, String payload) {}

class RetryingInvoiceConsumer {
    private final int maxAttempts;
    private final Map<String, Integer> attempts = new HashMap<>();
    private final List<InvoiceMsg> deadLetters = new ArrayList<>();

    public RetryingInvoiceConsumer(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public String receive(InvoiceMsg msg, Consumer<InvoiceMsg> handler) {
        try {
            handler.accept(msg);
            attempts.remove(msg.id());
            return "ok";
        } catch (RuntimeException e) {
            int count = attempts.merge(msg.id(), 1, Integer::sum);
            if (count >= maxAttempts) {
                attempts.remove(msg.id());
                deadLetters.add(msg);
                return "dead";
            }
            return "retry";
        }
    }

    public List<InvoiceMsg> deadLetters() {
        return Collections.unmodifiableList(deadLetters);
    }
}
`,
    hint: 'Map.merge(id, 1, Integer::sum) increments and returns the new count in one call; compare it with maxAttempts inside the catch block.',
    explanation:
      'Without a dead-letter path, one permanently failing message is redelivered forever and starves everything behind it. Counting attempts per message id and parking the message after N failures keeps the queue flowing while preserving the bad message for inspection. Clearing the count on success or parking avoids unbounded growth of the attempts map.',
    rules: [
      { label: 'Catches handler failures', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(RuntimeException|Exception)\\s+\\w+\\s*\\)', regex: true },
      { label: 'Counts attempts per message id', type: 'mustContain', pattern: 'attempts\\.merge\\(|attempts\\.getOrDefault\\(|attempts\\.put\\(', regex: true },
      { label: 'Parks the message in deadLetters', type: 'mustContain', pattern: 'deadLetters\\.add\\(\\s*msg\\s*\\)', regex: true },
      { label: 'Compares the count with maxAttempts', type: 'mustContain', pattern: '>=\\s*maxAttempts|==\\s*maxAttempts|maxAttempts\\s*<=', regex: true },
    ],
  },
  {
    id: 'java-build-florist-order-outbox',
    number: 35,
    language: 'java',
    kind: 'build',
    title: 'Florist Order Outbox',
    difficulty: 'Medium',
    topic: 'Messaging',
    statement:
      'A florist\'s order service must save the order and announce an `OrderPlaced` event, and the two must never disagree. The current code commits the order and then publishes directly — if the publish fails the event is lost, and if the commit fails after a publish the event is a lie. Implement the transactional outbox instead:\n\n- Inside one `Tx`, `insert` the order row into `"orders"` (as `orderId + "|" + bouquet`) and the event row into `"outbox"` (as `"OrderPlaced|" + orderId`), then `commit`.\n- If any step throws a `RuntimeException`, call `tx.rollback()` and rethrow.\n- `placeOrder` must not publish anything itself. A separate relay process reads the outbox table and publishes later, so remove the `Publisher` dependency from the service.',
    functionSignature: 'public void placeOrder(Tx tx, String orderId, String bouquet)',
    buggyCode: `interface Tx {
    void insert(String table, String row);
    void commit();
    void rollback();
}

interface Publisher {
    void publish(String event);
}

class FloristOrderService {
    private final Publisher publisher;

    public FloristOrderService(Publisher publisher) {
        this.publisher = publisher;
    }

    public void placeOrder(Tx tx, String orderId, String bouquet) {
        // TODO: write the event to the outbox inside the same transaction
        tx.insert("orders", orderId + "|" + bouquet);
        tx.commit();
        publisher.publish("OrderPlaced|" + orderId);
    }
}
`,
    solution: `interface Tx {
    void insert(String table, String row);
    void commit();
    void rollback();
}

interface Publisher {
    void publish(String event);
}

class FloristOrderService {
    public void placeOrder(Tx tx, String orderId, String bouquet) {
        try {
            tx.insert("orders", orderId + "|" + bouquet);
            tx.insert("outbox", "OrderPlaced|" + orderId);
            tx.commit();
        } catch (RuntimeException e) {
            tx.rollback();
            throw e;
        }
    }
}
`,
    hint: 'Write the event as a row in the same transaction as the order; the broker is never touched from inside placeOrder.',
    explanation:
      'Publishing to a broker and committing to a database cannot be made atomic together, so the outbox pattern stores the event as a database row in the same transaction as the business data. A relay later reads unsent outbox rows and publishes them, giving at-least-once delivery that is consistent with what was committed. Rolling back on failure keeps the order and its event together in both directions.',
    rules: [
      { label: 'Writes the event to the outbox table in the transaction', type: 'mustContain', pattern: 'tx\\.insert\\(\\s*"outbox"', regex: true },
      { label: 'Rolls back when a step fails', type: 'mustContain', pattern: 'tx.rollback()' },
      { label: 'Catches failures around the transaction', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(RuntimeException|Exception)', regex: true },
      { label: 'No longer publishes directly from placeOrder', type: 'mustNotContain', pattern: 'publisher\\.publish\\(', regex: true },
    ],
  },
  {
    id: 'java-build-turnstile-ack-batcher',
    number: 36,
    language: 'java',
    kind: 'build',
    title: 'Turnstile Ack Batcher',
    difficulty: 'Easy',
    topic: 'Messaging',
    statement:
      'Stadium turnstiles stream entry offsets, and acknowledging each one individually floods the broker. Implement `AckBatcher`:\n\n- `ack(offset)` appends the offset to a pending list. When the list reaches `maxBatch` entries, flush.\n- `flush()` sends a copy of the pending offsets to `sender` in one call (as a `List<Long>`) and clears the pending list. Flushing with nothing pending must not call the sender.\n- `pendingCount()` returns how many offsets are waiting.\n\nThe sender must receive a copy, not the live list, so it cannot be affected by later acks.',
    functionSignature: 'public void ack(long offset)',
    buggyCode: `class AckBatcher {
    private final int maxBatch;
    private final Consumer<List<Long>> sender;
    private final List<Long> pending = new ArrayList<>();

    public AckBatcher(int maxBatch, Consumer<List<Long>> sender) {
        this.maxBatch = maxBatch;
        this.sender = sender;
    }

    public void ack(long offset) {
        // TODO: buffer instead of sending every offset alone
        sender.accept(List.of(offset));
    }

    public void flush() {
        // TODO
    }

    public int pendingCount() {
        return pending.size();
    }
}
`,
    solution: `class AckBatcher {
    private final int maxBatch;
    private final Consumer<List<Long>> sender;
    private final List<Long> pending = new ArrayList<>();

    public AckBatcher(int maxBatch, Consumer<List<Long>> sender) {
        if (maxBatch < 1) throw new IllegalArgumentException("maxBatch must be at least 1");
        this.maxBatch = maxBatch;
        this.sender = sender;
    }

    public void ack(long offset) {
        pending.add(offset);
        if (pending.size() >= maxBatch) flush();
    }

    public void flush() {
        if (pending.isEmpty()) return;
        sender.accept(new ArrayList<>(pending));
        pending.clear();
    }

    public int pendingCount() {
        return pending.size();
    }
}
`,
    hint: 'ack adds and checks the size; flush hands the sender a fresh ArrayList copy and then clears the original.',
    explanation:
      'Batching acknowledgements trades a little latency for far fewer round trips to the broker. The classic bug is passing the live pending list to the sender and then clearing it — the sender now holds an empty list. Copying before clearing, and skipping empty flushes, keeps the batcher correct under any sender behaviour.',
    rules: [
      { label: 'Flushes once the batch is full', type: 'mustContain', pattern: 'pending\\.size\\(\\)\\s*(>=|==)\\s*maxBatch|maxBatch\\s*(<=|==)\\s*pending\\.size\\(\\)', regex: true },
      { label: 'Sends a copy of the pending list', type: 'mustContain', pattern: 'new ArrayList<>\\(\\s*pending\\s*\\)|List\\.copyOf\\(\\s*pending\\s*\\)', regex: true },
      { label: 'Clears pending after sending', type: 'mustContain', pattern: 'pending\\.clear\\(\\)', regex: true },
      { label: 'No longer acknowledges offsets one at a time', type: 'mustNotContain', pattern: 'List\\.of\\(\\s*offset\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-telemetry-intake-backpressure',
    number: 37,
    language: 'java',
    kind: 'build',
    title: 'Telemetry Intake Backpressure',
    difficulty: 'Medium',
    topic: 'Messaging',
    statement:
      'Wind-turbine sensors push samples faster than the aggregator can consume during storms, and the current unbounded queue grows until the JVM dies. Rebuild `TelemetryIntake` on a bounded `BlockingQueue`:\n\n- The constructor creates a queue with exactly `capacity` slots (`ArrayBlockingQueue` or a bounded `LinkedBlockingQueue`).\n- `submit(sample, timeoutMs)` waits up to `timeoutMs` milliseconds for room using the timed `offer(e, timeout, unit)`. If the queue is still full it increments a dropped counter and returns false; otherwise returns true.\n- `next()` blocks until a sample is available and returns it.\n- `dropped()` and `buffered()` report the drop count and current queue size.',
    functionSignature: 'public boolean submit(String sample, long timeoutMs) throws InterruptedException',
    buggyCode: `class TelemetryIntake {
    private final Queue<String> buffer = new ConcurrentLinkedQueue<>();
    private final AtomicInteger dropped = new AtomicInteger();

    public TelemetryIntake(int capacity) {
        // TODO: bound the buffer
    }

    public boolean submit(String sample, long timeoutMs) throws InterruptedException {
        // TODO: wait for room, then drop
        buffer.add(sample);
        return true;
    }

    public String next() throws InterruptedException {
        // TODO: block until a sample arrives
        return buffer.poll();
    }

    public int dropped() { return dropped.get(); }
    public int buffered() { return buffer.size(); }
}
`,
    solution: `class TelemetryIntake {
    private final BlockingQueue<String> buffer;
    private final AtomicInteger dropped = new AtomicInteger();

    public TelemetryIntake(int capacity) {
        buffer = new ArrayBlockingQueue<>(capacity);
    }

    public boolean submit(String sample, long timeoutMs) throws InterruptedException {
        boolean accepted = buffer.offer(sample, timeoutMs, TimeUnit.MILLISECONDS);
        if (!accepted) dropped.incrementAndGet();
        return accepted;
    }

    public String next() throws InterruptedException {
        return buffer.take();
    }

    public int dropped() { return dropped.get(); }
    public int buffered() { return buffer.size(); }
}
`,
    hint: 'ArrayBlockingQueue has a fixed capacity; its timed offer returns false instead of growing, and take() blocks the consumer until data arrives.',
    explanation:
      'Backpressure means a fast producer is slowed or shed rather than allowed to consume unbounded memory. A bounded BlockingQueue gives that for free: the timed offer makes the producer wait briefly and then drop with a metric, while take() lets the consumer sleep instead of spinning on poll(). Unbounded queues like ConcurrentLinkedQueue hide the overload until it becomes an OutOfMemoryError.',
    rules: [
      { label: 'Buffer is a bounded blocking queue sized by capacity', type: 'mustContain', pattern: 'new (ArrayBlockingQueue|LinkedBlockingQueue|LinkedBlockingDeque)<[^>]*>\\(\\s*capacity\\s*\\)', regex: true },
      { label: 'submit uses the timed offer', type: 'mustContain', pattern: '\\.offer\\(\\s*sample\\s*,\\s*timeoutMs\\s*,\\s*TimeUnit\\.MILLISECONDS\\s*\\)', regex: true },
      { label: 'next blocks for a sample', type: 'mustContain', pattern: '\\.take\\(\\)|\\.poll\\(\\s*\\w+\\s*,\\s*TimeUnit', regex: true },
      { label: 'No unbounded queue remains', type: 'mustNotContain', pattern: 'ConcurrentLinkedQueue|new LinkedList|new ArrayDeque', regex: true },
    ],
  },

  // ------------------------------------------------------------------ Validation & Config
  {
    id: 'java-build-kiln-config-layers',
    number: 38,
    language: 'java',
    kind: 'build',
    title: 'Kiln Controller Config Layers',
    difficulty: 'Medium',
    topic: 'Validation & Config',
    statement:
      'A pottery kiln controller reads settings from four layers. Implement `ConfigResolver.resolve(defaults, file, env, cli)` returning a single `Properties` where later layers override earlier ones: `defaults` < `file` < `env` < `cli`.\n\n- `defaults` and `file` use dotted keys such as `max.temp`.\n- `env` entries are only considered when the key starts with `KILN_`; strip the prefix, lower-case the rest and turn `_` into `.` — so `KILN_MAX_TEMP=1200` sets `max.temp`. Ignore other env entries.\n- `cli` already uses dotted keys.\n- Do not mutate any of the inputs; return a new `Properties`.',
    functionSignature: 'public static Properties resolve(Properties defaults, Properties file, Map<String, String> env, Map<String, String> cli)',
    buggyCode: `class ConfigResolver {
    static final String ENV_PREFIX = "KILN_";

    public static Properties resolve(Properties defaults, Properties file, Map<String, String> env, Map<String, String> cli) {
        // TODO: layer the sources with the right precedence
        return defaults;
    }
}
`,
    solution: `class ConfigResolver {
    static final String ENV_PREFIX = "KILN_";

    public static Properties resolve(Properties defaults, Properties file, Map<String, String> env, Map<String, String> cli) {
        Properties merged = new Properties();
        merged.putAll(defaults);
        merged.putAll(file);
        for (Map.Entry<String, String> e : env.entrySet()) {
            String key = e.getKey();
            if (!key.startsWith(ENV_PREFIX)) continue;
            String dotted = key.substring(ENV_PREFIX.length()).toLowerCase().replace('_', '.');
            merged.setProperty(dotted, e.getValue());
        }
        merged.putAll(cli);
        return merged;
    }
}
`,
    hint: 'Start from an empty Properties and putAll each layer in precedence order; translate env keys before inserting them.',
    explanation:
      'Layered configuration is how the same binary runs in dev, staging and prod: defaults ship with the code, a file customises the deployment, environment variables let the platform inject secrets, and CLI flags win for one-off runs. Applying layers in ascending precedence with putAll makes the ordering obvious. Environment keys need normalisation because shells cannot express dots.',
    rules: [
      { label: 'Merges layers with putAll into a fresh Properties', type: 'mustContain', pattern: 'putAll\\(\\s*(defaults|file|cli)\\s*\\)', regex: true },
      { label: 'Only considers env keys with the KILN_ prefix', type: 'mustContain', pattern: 'startsWith\\(\\s*(ENV_PREFIX|"KILN_")\\s*\\)', regex: true },
      { label: 'Lower-cases env keys', type: 'mustContain', pattern: 'toLowerCase()' },
      { label: 'Turns underscores into dots', type: 'mustContain', pattern: "replace\\(\\s*'_'\\s*,\\s*'\\.'\\s*\\)|replace(All)?\\(\\s*\"_\"\\s*,\\s*\"\\.\"\\s*\\)", regex: true },
    ],
  },
  {
    id: 'java-build-typed-environment-reader',
    number: 39,
    language: 'java',
    kind: 'build',
    title: 'Typed Environment Reader',
    difficulty: 'Medium',
    topic: 'Validation & Config',
    statement:
      'Environment variables are strings, but the service wants ints, booleans and durations. Implement the three getters on `EnvReader`, which wraps a `Map<String, String>`:\n\n- A missing or blank value returns the fallback.\n- `getInt` parses with `Integer.parseInt` (after trimming); an unparsable value throws `ConfigException` whose message includes the key.\n- `getBool` accepts `true/false`, `1/0`, `yes/no`, `on/off` case-insensitively; anything else throws `ConfigException` naming the key.\n- `getDuration` accepts a number followed by `ms`, `s`, `m` or `h` (for example `250ms`, `30s`, `5m`, `2h`) and returns a `java.time.Duration`; anything else throws `ConfigException` naming the key.',
    functionSignature: 'public Duration getDuration(String key, Duration fallback)',
    buggyCode: `class ConfigException extends RuntimeException {
    public ConfigException(String message) { super(message); }
}

class EnvReader {
    private final Map<String, String> env;

    public EnvReader(Map<String, String> env) {
        this.env = env;
    }

    public int getInt(String key, int fallback) {
        // TODO
        return fallback;
    }

    public boolean getBool(String key, boolean fallback) {
        // TODO
        return fallback;
    }

    public Duration getDuration(String key, Duration fallback) {
        // TODO
        return fallback;
    }
}
`,
    solution: `class ConfigException extends RuntimeException {
    public ConfigException(String message) { super(message); }
}

class EnvReader {
    private final Map<String, String> env;

    public EnvReader(Map<String, String> env) {
        this.env = env;
    }

    public int getInt(String key, int fallback) {
        String raw = env.get(key);
        if (raw == null || raw.isBlank()) return fallback;
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            throw new ConfigException(key + " must be an integer, got '" + raw + "'");
        }
    }

    public boolean getBool(String key, boolean fallback) {
        String raw = env.get(key);
        if (raw == null || raw.isBlank()) return fallback;
        switch (raw.trim().toLowerCase()) {
            case "true": case "1": case "yes": case "on":
                return true;
            case "false": case "0": case "no": case "off":
                return false;
            default:
                throw new ConfigException(key + " must be a boolean, got '" + raw + "'");
        }
    }

    public Duration getDuration(String key, Duration fallback) {
        String raw = env.get(key);
        if (raw == null || raw.isBlank()) return fallback;
        String v = raw.trim();
        try {
            if (v.endsWith("ms")) return Duration.ofMillis(Long.parseLong(v.substring(0, v.length() - 2)));
            if (v.endsWith("s")) return Duration.ofSeconds(Long.parseLong(v.substring(0, v.length() - 1)));
            if (v.endsWith("m")) return Duration.ofMinutes(Long.parseLong(v.substring(0, v.length() - 1)));
            if (v.endsWith("h")) return Duration.ofHours(Long.parseLong(v.substring(0, v.length() - 1)));
        } catch (NumberFormatException e) {
            throw new ConfigException(key + " must be a duration like 250ms, 30s, 5m or 2h, got '" + raw + "'");
        }
        throw new ConfigException(key + " must be a duration like 250ms, 30s, 5m or 2h, got '" + raw + "'");
    }
}
`,
    hint: 'Check the "ms" suffix before "s", since "250ms" also ends with "s".',
    explanation:
      'Parsing configuration once at startup, with typed getters that fail fast and name the offending key, is far better than discovering a typo when a timeout fires an hour later. The suffix order matters for durations, and a blank value should behave like an unset one because many platforms export empty strings. ConfigException carrying the key is what turns a stack trace into an actionable message.',
    rules: [
      { label: 'Parses numeric values', type: 'mustContain', pattern: 'Integer\\.parseInt\\(|Long\\.parseLong\\(', regex: true },
      { label: 'Throws ConfigException for bad values', type: 'mustContain', pattern: 'throw new ConfigException\\(', regex: true },
      { label: 'Recognises the ms suffix', type: 'mustContain', pattern: 'endsWith\\(\\s*"ms"\\s*\\)', regex: true },
      { label: 'Builds a Duration from the parsed amount', type: 'mustContain', pattern: 'Duration\\.of(Millis|Seconds|Minutes|Hours)\\(', regex: true },
    ],
  },
  {
    id: 'java-build-firmware-version-ordering',
    number: 40,
    language: 'java',
    kind: 'build',
    title: 'Firmware Version Ordering',
    difficulty: 'Medium',
    topic: 'Validation & Config',
    statement:
      'A device fleet must pick the newest compatible firmware from strings like `2.4.1`, `2.4.1-beta.2` and `3.0.0-rc.1`. Implement `FirmwareVersion.parse` and `compareTo`:\n\n- `parse` splits `major.minor.patch` on dots (all three required and numeric; otherwise throw `IllegalArgumentException`). An optional `-` introduces the pre-release label, which is stored as-is (`null` when absent).\n- `compareTo` orders by major, then minor, then patch using `Integer.compare`.\n- When the numeric parts are equal, a release (no pre-release) is greater than any pre-release.\n- Two pre-releases compare dot-separated identifier by identifier: purely numeric identifiers compare numerically and rank below alphanumeric ones; otherwise compare as strings; a shorter list of identifiers ranks lower when all shared identifiers are equal.',
    functionSignature: 'public int compareTo(FirmwareVersion other)',
    buggyCode: `record FirmwareVersion(int major, int minor, int patch, String preRelease) implements Comparable<FirmwareVersion> {

    public static FirmwareVersion parse(String text) {
        // TODO
        return new FirmwareVersion(0, 0, 0, null);
    }

    @Override
    public int compareTo(FirmwareVersion other) {
        // TODO
        return 0;
    }
}
`,
    solution: `record FirmwareVersion(int major, int minor, int patch, String preRelease) implements Comparable<FirmwareVersion> {

    public static FirmwareVersion parse(String text) {
        String core = text;
        String pre = null;
        int dash = text.indexOf('-');
        if (dash >= 0) {
            core = text.substring(0, dash);
            pre = text.substring(dash + 1);
            if (pre.isEmpty()) throw new IllegalArgumentException("empty pre-release label in " + text);
        }
        String[] parts = core.split("\\\\.");
        if (parts.length != 3) throw new IllegalArgumentException("expected major.minor.patch in " + text);
        try {
            return new FirmwareVersion(
                Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2]), pre);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("non-numeric version component in " + text, e);
        }
    }

    @Override
    public int compareTo(FirmwareVersion other) {
        int c = Integer.compare(major, other.major);
        if (c != 0) return c;
        c = Integer.compare(minor, other.minor);
        if (c != 0) return c;
        c = Integer.compare(patch, other.patch);
        if (c != 0) return c;
        if (preRelease == null && other.preRelease == null) return 0;
        if (preRelease == null) return 1;
        if (other.preRelease == null) return -1;
        return comparePreRelease(preRelease, other.preRelease);
    }

    private static int comparePreRelease(String a, String b) {
        String[] as = a.split("\\\\.");
        String[] bs = b.split("\\\\.");
        int shared = Math.min(as.length, bs.length);
        for (int i = 0; i < shared; i++) {
            boolean aNum = as[i].chars().allMatch(Character::isDigit);
            boolean bNum = bs[i].chars().allMatch(Character::isDigit);
            int c;
            if (aNum && bNum) c = Long.compare(Long.parseLong(as[i]), Long.parseLong(bs[i]));
            else if (aNum) c = -1;
            else if (bNum) c = 1;
            else c = as[i].compareTo(bs[i]);
            if (c != 0) return c;
        }
        return Integer.compare(as.length, bs.length);
    }
}
`,
    hint: 'Compare the three numbers first; only when they tie does the pre-release label matter, and a null label wins over any label.',
    explanation:
      'Version strings cannot be compared lexically — "2.10.0" would sort before "2.9.0" — so parse them into numbers and compare field by field. Semantic versioning adds the twist that a pre-release sorts below its release and that pre-release identifiers mix numeric and alphanumeric comparison. Implementing Comparable lets Collections.max or a TreeSet pick the newest version without any extra code.',
    rules: [
      { label: 'Compares numeric components with Integer.compare', type: 'mustContain', pattern: 'Integer\\.compare\\(\\s*major', regex: true },
      { label: 'Handles the absence of a pre-release label', type: 'mustContain', pattern: 'preRelease(\\(\\))?\\s*[!=]=\\s*null', regex: true },
      { label: 'parse converts the components with parseInt', type: 'mustContain', pattern: 'Integer\\.parseInt\\(', regex: true },
      { label: 'compareTo no longer returns the placeholder', type: 'mustNotContain', pattern: 'compareTo\\([^)]*\\)\\s*\\{\\s*(//[^\\n]*\\s*)?return 0;', regex: true },
    ],
  },
  {
    id: 'java-build-podcast-feature-gate',
    number: 41,
    language: 'java',
    kind: 'build',
    title: 'Podcast Feature Gate',
    difficulty: 'Medium',
    topic: 'Validation & Config',
    statement:
      'A podcast app rolls out features gradually. Implement `FlagEvaluator.isEnabled(flag, userId, userGroups)` using these rules, checked in order:\n\n1. If `flag.enabled()` is false, return false.\n2. If `flag.denyUsers()` contains the user id, return false.\n3. If any of the user\'s groups appears in `flag.allowGroups()`, return true.\n4. Otherwise return true only if the user\'s bucket is below `flag.rolloutPercent()`.\n\nThe bucket is computed by `bucket(flagKey, userId)`: a stable number in `[0, 100)` derived from the string `flagKey + ":" + userId` via `hashCode()` and `Math.floorMod`. The same user must land in the same bucket on every call and on every server — no randomness, no clocks.',
    functionSignature: 'public boolean isEnabled(Flag flag, String userId, Set<String> userGroups)',
    buggyCode: `record Flag(String key, boolean enabled, Set<String> allowGroups, Set<String> denyUsers, int rolloutPercent) {}

class FlagEvaluator {
    public boolean isEnabled(Flag flag, String userId, Set<String> userGroups) {
        // TODO: deny list, allow groups, then percentage rollout
        return flag.enabled();
    }

    static int bucket(String flagKey, String userId) {
        // TODO
        return 0;
    }
}
`,
    solution: `record Flag(String key, boolean enabled, Set<String> allowGroups, Set<String> denyUsers, int rolloutPercent) {}

class FlagEvaluator {
    public boolean isEnabled(Flag flag, String userId, Set<String> userGroups) {
        if (!flag.enabled()) return false;
        if (flag.denyUsers().contains(userId)) return false;
        for (String group : userGroups) {
            if (flag.allowGroups().contains(group)) return true;
        }
        return bucket(flag.key(), userId) < flag.rolloutPercent();
    }

    static int bucket(String flagKey, String userId) {
        return Math.floorMod((flagKey + ":" + userId).hashCode(), 100);
    }
}
`,
    hint: 'Hash the flag key together with the user id so each flag rolls out to a different slice of users, and floorMod keeps negative hashes in range.',
    explanation:
      'Percentage rollouts must be deterministic: if a user saw the feature on one request and not the next, the product would feel broken. Hashing flag key plus user id into a fixed bucket makes the decision stable and stateless, while combining the key means 10% of users for one flag is a different 10% for another. Deny lists and allow groups are checked first so kill switches and internal testers always win.',
    rules: [
      { label: 'Denied users are always off', type: 'mustContain', pattern: 'denyUsers\\(\\)\\.contains\\(\\s*userId\\s*\\)', regex: true },
      { label: 'Allowed groups switch the flag on', type: 'mustContain', pattern: 'allowGroups\\(\\)\\.contains\\(|Collections\\.disjoint\\(|allowGroups\\(\\)\\.stream\\(\\)|retainAll\\(', regex: true },
      { label: 'Bucket is derived deterministically from the hash', type: 'mustContain', pattern: 'Math\\.floorMod\\(|Math\\.abs\\(', regex: true },
      { label: 'No randomness or clocks in the decision', type: 'mustNotContain', pattern: 'Random|nanoTime|currentTimeMillis', regex: true },
    ],
  },
  {
    id: 'java-build-booking-payload-validator',
    number: 42,
    language: 'java',
    kind: 'build',
    title: 'Booking Payload Validator',
    difficulty: 'Hard',
    topic: 'Validation & Config',
    statement:
      'A hotel booking API receives JSON decoded into `Map<String, Object>` and validates it against a schema of `FieldSpec`s (type `"string"`, `"integer"` or `"object"`; `required`; nested `children` for objects). Implement `PayloadValidator.validate(doc, schema)` returning every error as `"<path>: <message>"`, where paths are dotted (`guest.address.city`).\n\n- A missing or null value for a required field yields `"<path>: required"`; optional missing fields are fine.\n- A present value must match its type: `instanceof String`, `instanceof Integer`, or `instanceof Map` for objects — otherwise `"<path>: expected string"` (or integer/object).\n- Objects are validated recursively with the path extended by the field name.\n- After the schema fields, any key in the document that the schema does not declare yields `"<path>: unexpected field"`.\n- Collect all errors; return an empty list for a valid document. Errors for a level follow the schema\'s iteration order.',
    functionSignature: 'public static List<String> validate(Map<String, Object> doc, Map<String, FieldSpec> schema)',
    buggyCode: `record FieldSpec(String type, boolean required, Map<String, FieldSpec> children) {
    static FieldSpec string(boolean required) { return new FieldSpec("string", required, Map.of()); }
    static FieldSpec integer(boolean required) { return new FieldSpec("integer", required, Map.of()); }
    static FieldSpec object(boolean required, Map<String, FieldSpec> children) { return new FieldSpec("object", required, children); }
}

class PayloadValidator {
    public static List<String> validate(Map<String, Object> doc, Map<String, FieldSpec> schema) {
        // TODO: walk the schema, collecting dotted error paths
        return List.of();
    }
}
`,
    solution: `record FieldSpec(String type, boolean required, Map<String, FieldSpec> children) {
    static FieldSpec string(boolean required) { return new FieldSpec("string", required, Map.of()); }
    static FieldSpec integer(boolean required) { return new FieldSpec("integer", required, Map.of()); }
    static FieldSpec object(boolean required, Map<String, FieldSpec> children) { return new FieldSpec("object", required, children); }
}

class PayloadValidator {
    public static List<String> validate(Map<String, Object> doc, Map<String, FieldSpec> schema) {
        List<String> errors = new ArrayList<>();
        walk(doc, schema, "", errors);
        return errors;
    }

    @SuppressWarnings("unchecked")
    private static void walk(Map<String, Object> doc, Map<String, FieldSpec> schema, String prefix, List<String> errors) {
        for (Map.Entry<String, FieldSpec> e : schema.entrySet()) {
            String path = join(prefix, e.getKey());
            FieldSpec spec = e.getValue();
            Object value = doc.get(e.getKey());
            if (value == null) {
                if (spec.required()) errors.add(path + ": required");
                continue;
            }
            switch (spec.type()) {
                case "string":
                    if (!(value instanceof String)) errors.add(path + ": expected string");
                    break;
                case "integer":
                    if (!(value instanceof Integer)) errors.add(path + ": expected integer");
                    break;
                case "object":
                    if (!(value instanceof Map)) {
                        errors.add(path + ": expected object");
                    } else {
                        walk((Map<String, Object>) value, spec.children(), path, errors);
                    }
                    break;
                default:
                    errors.add(path + ": unknown type " + spec.type());
            }
        }
        for (String key : doc.keySet()) {
            if (!schema.containsKey(key)) errors.add(join(prefix, key) + ": unexpected field");
        }
    }

    private static String join(String prefix, String key) {
        return prefix.isEmpty() ? key : prefix + "." + key;
    }
}
`,
    hint: 'Write a private recursive walk(doc, schema, prefix, errors) helper; the top-level call passes an empty prefix and the object case passes the extended path.',
    explanation:
      'Validators that report every problem with a precise path let a client fix a whole request in one round trip instead of discovering errors one by one. The recursive helper threads the dotted prefix and the shared error list through each level, so nested objects reuse exactly the same logic. Checking for unexpected fields after the declared ones catches typos like "guestt" that a lenient decoder would silently drop.',
    rules: [
      { label: 'Recurses into nested objects', type: 'mustContain', pattern: 'instanceof\\s+Map', regex: true },
      { label: 'Checks scalar types with instanceof', type: 'mustContain', pattern: 'instanceof\\s+(String|Integer)', regex: true },
      { label: 'Reports missing required fields', type: 'mustContain', pattern: '":\\s*required"', regex: true },
      { label: 'Builds dotted paths from the prefix', type: 'mustContain', pattern: 'prefix\\s*\\+\\s*"\\."|"\\."\\s*\\+', regex: true },
    ],
  },

  // ------------------------------------------------------------------ Security
  {
    id: 'java-build-workspace-permission-bits',
    number: 43,
    language: 'java',
    kind: 'build',
    title: 'Workspace Permission Bits',
    difficulty: 'Easy',
    topic: 'Security',
    statement:
      'A design tool stores each collaborator\'s workspace rights as one int, one bit per permission (`VIEW`, `COMMENT`, `EDIT`, `SHARE`, `OWNER`). Implement the helpers on `WorkspacePerms`:\n\n- `grant(mask, perm)` returns the mask with the bit(s) in `perm` set.\n- `revoke(mask, perm)` returns the mask with the bit(s) in `perm` cleared; revoking a bit that is not set is a no-op.\n- `hasAll(mask, required)` is true only if every bit in `required` is set in `mask`.\n- `describe(mask)` lists the set permission names lowest bit first, comma-separated with no spaces, e.g. `"VIEW,EDIT"`; an empty mask gives `""`.\n\nAll methods are pure bit operations; `perm` and `required` may combine several bits.',
    functionSignature: 'static boolean hasAll(int mask, int required)',
    buggyCode: `final class WorkspacePerms {
    static final int VIEW = 1;
    static final int COMMENT = 1 << 1;
    static final int EDIT = 1 << 2;
    static final int SHARE = 1 << 3;
    static final int OWNER = 1 << 4;
    static final String[] NAMES = {"VIEW", "COMMENT", "EDIT", "SHARE", "OWNER"};

    static int grant(int mask, int perm) {
        // TODO
        return mask;
    }

    static int revoke(int mask, int perm) {
        // TODO
        return mask;
    }

    static boolean hasAll(int mask, int required) {
        // TODO
        return false;
    }

    static String describe(int mask) {
        // TODO
        return "";
    }
}
`,
    solution: `final class WorkspacePerms {
    static final int VIEW = 1;
    static final int COMMENT = 1 << 1;
    static final int EDIT = 1 << 2;
    static final int SHARE = 1 << 3;
    static final int OWNER = 1 << 4;
    static final String[] NAMES = {"VIEW", "COMMENT", "EDIT", "SHARE", "OWNER"};

    static int grant(int mask, int perm) {
        return mask | perm;
    }

    static int revoke(int mask, int perm) {
        return mask & ~perm;
    }

    static boolean hasAll(int mask, int required) {
        return (mask & required) == required;
    }

    static String describe(int mask) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < NAMES.length; i++) {
            if ((mask & (1 << i)) != 0) {
                if (sb.length() > 0) sb.append(',');
                sb.append(NAMES[i]);
            }
        }
        return sb.toString();
    }
}
`,
    hint: 'OR sets bits, AND with the complement clears them, and (mask & required) == required tests a whole set of bits at once.',
    explanation:
      'Bitmasks pack a set of booleans into one integer that is cheap to store, compare and index. The trap is testing several required bits with != 0, which only proves that at least one is present; comparing the masked value back to required proves all of them are. Iterating bit positions with 1 << i is what makes describe work for any future permission added to NAMES.',
    rules: [
      { label: 'grant sets bits with OR', type: 'mustContain', pattern: 'mask\\s*\\|\\s*perm', regex: true },
      { label: 'revoke clears bits with AND NOT', type: 'mustContain', pattern: '&\\s*~\\s*perm', regex: true },
      { label: 'hasAll checks every required bit', type: 'mustContain', pattern: '\\(\\s*mask\\s*&\\s*required\\s*\\)\\s*==\\s*required', regex: true },
      { label: 'describe tests each bit position', type: 'mustContain', pattern: '\\(\\s*mask\\s*&\\s*\\(?\\s*(1\\s*<<\\s*\\w+|\\w+)\\s*\\)?\\s*\\)\\s*!=\\s*0|mask\\s*>>', regex: true },
    ],
  },
  {
    id: 'java-build-access-scope-wildcards',
    number: 44,
    language: 'java',
    kind: 'build',
    title: 'Access Scope Wildcards',
    difficulty: 'Hard',
    topic: 'Security',
    statement:
      'API tokens carry granted scopes such as `repo:alpha:read`, `repo:*:read` or `billing:**`. Implement `ScopeMatcher.grants(granted, requested)` and `anyGrants(granted, requested)`.\n\nScopes are `:`-separated segments. Compare segment by segment:\n\n- A literal segment must equal the requested segment exactly.\n- `*` matches exactly one segment of any value.\n- `**` is only valid as the last segment and matches one or more remaining segments (so `repo:**` grants `repo:read` and `repo:alpha:read` but not `repo`).\n- Without `**`, both scopes must have the same number of segments: `repo:*:read` does not grant `repo:read`.\n\n`anyGrants` returns true if any scope in the set grants the request.',
    functionSignature: 'public static boolean grants(String granted, String requested)',
    buggyCode: `class ScopeMatcher {
    public static boolean grants(String granted, String requested) {
        // TODO: segment-wise matching with * and **
        return granted.equals(requested);
    }

    public static boolean anyGrants(Set<String> granted, String requested) {
        // TODO
        return granted.contains(requested);
    }
}
`,
    solution: `class ScopeMatcher {
    public static boolean grants(String granted, String requested) {
        String[] g = granted.split(":");
        String[] r = requested.split(":");
        for (int i = 0; i < g.length; i++) {
            if (g[i].equals("**")) {
                return i == g.length - 1 && r.length > i;
            }
            if (i >= r.length) return false;
            if (!g[i].equals("*") && !g[i].equals(r[i])) return false;
        }
        return g.length == r.length;
    }

    public static boolean anyGrants(Set<String> granted, String requested) {
        for (String scope : granted) {
            if (grants(scope, requested)) return true;
        }
        return false;
    }
}
`,
    hint: 'Split both scopes on ":" and walk the granted segments; ** ends the walk early, * skips the comparison, and a length check finishes the exact case.',
    explanation:
      'Scope matching is authorization logic, so the rules must be exact: an off-by-one in the length check would let `repo:*:read` grant `repo:read`, and a `**` that accepts zero segments would let `repo:**` grant the bare resource. Walking segments with explicit handling of each wildcard keeps every rule visible and testable. anyGrants composes the per-scope check across a token\'s whole grant set.',
    rules: [
      { label: 'Splits scopes into segments on ":"', type: 'mustContain', pattern: 'split\\(\\s*":"\\s*\\)', regex: true },
      { label: 'Handles the ** suffix', type: 'mustContain', pattern: '"\\*\\*"', regex: true },
      { label: 'Handles the single-segment * wildcard', type: 'mustContain', pattern: 'equals\\(\\s*"\\*"\\s*\\)|"\\*"\\.equals\\(', regex: true },
      { label: 'anyGrants no longer relies on exact set membership', type: 'mustNotContain', pattern: 'granted\\.contains\\(\\s*requested\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-webhook-signature-compare',
    number: 45,
    language: 'java',
    kind: 'build',
    title: 'Webhook Signature Compare',
    difficulty: 'Easy',
    topic: 'Security',
    statement:
      'A payments webhook checks an HMAC signature, and `Arrays.equals` returns as soon as bytes differ — which lets an attacker measure how many leading bytes were right. Implement `SignatureCheck.constantTimeEquals(expected, actual)` so the running time does not depend on where the arrays differ:\n\n- Return false for a null argument.\n- Fold the length difference into an accumulator (`expected.length ^ actual.length`).\n- Loop over `min(expected.length, actual.length)` bytes and OR the XOR of each pair into the accumulator; never return early from the loop.\n- Return true only if the accumulator is zero.\n\nDo not call `Arrays.equals` or `MessageDigest.isEqual` — write the loop yourself.',
    functionSignature: 'public static boolean constantTimeEquals(byte[] expected, byte[] actual)',
    buggyCode: `class SignatureCheck {
    public static boolean constantTimeEquals(byte[] expected, byte[] actual) {
        // TODO: no early exit on the first mismatch
        return Arrays.equals(expected, actual);
    }
}
`,
    solution: `class SignatureCheck {
    public static boolean constantTimeEquals(byte[] expected, byte[] actual) {
        if (expected == null || actual == null) return false;
        int diff = expected.length ^ actual.length;
        int n = Math.min(expected.length, actual.length);
        for (int i = 0; i < n; i++) {
            diff |= expected[i] ^ actual[i];
        }
        return diff == 0;
    }
}
`,
    hint: 'Accumulate every mismatch with diff |= a[i] ^ b[i] and decide only after the loop has visited every byte.',
    explanation:
      'A comparison that exits at the first different byte leaks, through timing, how much of the guess was correct, and over many requests an attacker can reconstruct the signature byte by byte. XOR-ing each pair and OR-ing the results visits every byte regardless of content, so the time is a function of length alone. This is exactly what MessageDigest.isEqual does internally, and knowing why matters when you review code that reimplements it.',
    rules: [
      { label: 'Accumulates each byte XOR into the result', type: 'mustContain', pattern: '\\|=\\s*\\(?\\s*\\w+\\[\\s*\\w+\\s*\\]\\s*\\^', regex: true },
      { label: 'Visits the bytes in a loop', type: 'mustContain', pattern: 'for\\s*\\(', regex: true },
      { label: 'Does not delegate to a library comparison', type: 'mustNotContain', pattern: 'Arrays\\.equals\\(|MessageDigest\\.isEqual\\(', regex: true },
      { label: 'Never returns early from inside the loop', type: 'mustNotContain', pattern: 'for\\s*\\([^)]*\\)[^}]*return\\s+false', regex: true },
    ],
  },
  {
    id: 'java-build-locker-code-expiry',
    number: 46,
    language: 'java',
    kind: 'build',
    title: 'Locker Code Expiry Clock',
    difficulty: 'Easy',
    topic: 'Security',
    statement:
      'Parcel lockers issue one-time pickup codes that expire. The current `LockerCodes` reads `Instant.now()`, which makes expiry impossible to unit-test. Rewrite it to use the injected `Clock`:\n\n- `issue(code, ttl)` stores the expiry as `clock.instant().plus(ttl)`.\n- `isValid(code)` returns true only if the code exists and the current clock instant is strictly before its expiry (a code whose expiry equals now is expired).\n- `purgeExpired()` removes every expired code (`removeIf` on the map values is the natural tool) and returns how many were removed.\n\nNo method may call `Instant.now()` without the clock or `System.currentTimeMillis()`.',
    functionSignature: 'public boolean isValid(String code)',
    buggyCode: `class LockerCodes {
    private final Clock clock;
    private final Map<String, Instant> expiresAt = new HashMap<>();

    public LockerCodes(Clock clock) {
        this.clock = clock;
    }

    public void issue(String code, Duration ttl) {
        // TODO: use the injected clock
        expiresAt.put(code, Instant.now().plus(ttl));
    }

    public boolean isValid(String code) {
        // TODO
        return expiresAt.containsKey(code);
    }

    public int purgeExpired() {
        // TODO
        return 0;
    }
}
`,
    solution: `class LockerCodes {
    private final Clock clock;
    private final Map<String, Instant> expiresAt = new HashMap<>();

    public LockerCodes(Clock clock) {
        this.clock = clock;
    }

    public void issue(String code, Duration ttl) {
        expiresAt.put(code, clock.instant().plus(ttl));
    }

    public boolean isValid(String code) {
        Instant expiry = expiresAt.get(code);
        return expiry != null && clock.instant().isBefore(expiry);
    }

    public int purgeExpired() {
        Instant now = clock.instant();
        int before = expiresAt.size();
        expiresAt.values().removeIf(expiry -> !expiry.isAfter(now));
        return before - expiresAt.size();
    }
}
`,
    hint: 'Every "now" comes from clock.instant(); tests can then pass Clock.fixed(...) and move time forward deliberately.',
    explanation:
      'Time is an input like any other, and hiding it behind a static call makes expiry logic untestable and flaky. Injecting java.time.Clock lets tests pin the moment with Clock.fixed and prove both the valid and the expired branch. Treating expiry-equals-now as expired closes the one-instant window that off-by-one comparisons leave open.',
    rules: [
      { label: 'Reads the current time from the injected clock', type: 'mustContain', pattern: 'clock\\.instant\\(\\)|Instant\\.now\\(\\s*clock\\s*\\)|clock\\.millis\\(\\)', regex: true },
      { label: 'Compares instants for expiry', type: 'mustContain', pattern: 'isBefore\\(|isAfter\\(|compareTo\\(', regex: true },
      { label: 'purgeExpired removes expired entries', type: 'mustContain', pattern: 'removeIf\\(|iterator\\(\\)', regex: true },
      { label: 'No wall-clock calls remain', type: 'mustNotContain', pattern: 'Instant\\.now\\(\\s*\\)|System\\.currentTimeMillis\\(\\)', regex: true },
    ],
  },

  // ------------------------------------------------------------------ Scheduling
  {
    id: 'java-build-delivery-window-next-run',
    number: 47,
    language: 'java',
    kind: 'build',
    title: 'Delivery Window Next Run',
    difficulty: 'Hard',
    topic: 'Scheduling',
    statement:
      'A grocery delivery scheduler describes when a route may start with a `RunSpec` of allowed minutes (0–59), hours (0–23) and days of week. Implement `RunPlanner.nextRun(spec, after)`: the first `LocalDateTime`, strictly after `after`, whose minute, hour and day of week are all allowed.\n\n- Start from `after` truncated to the minute plus one minute, so the result is on a whole minute and strictly later.\n- Advance efficiently: if the day is not allowed jump to 00:00 of the next day; if the hour is not allowed jump to the start of the next hour; if the minute is not allowed step one minute.\n- Give up and return `Optional.empty()` if nothing matches within 8 days of `after` (this also guards against empty sets).\n\nSeconds and nanoseconds in the result must be zero.',
    functionSignature: 'public static Optional<LocalDateTime> nextRun(RunSpec spec, LocalDateTime after)',
    buggyCode: `record RunSpec(Set<Integer> minutes, Set<Integer> hours, Set<DayOfWeek> days) {}

class RunPlanner {
    public static Optional<LocalDateTime> nextRun(RunSpec spec, LocalDateTime after) {
        // TODO: scan forward minute by minute (with jumps) until every field matches
        return Optional.of(after);
    }
}
`,
    solution: `record RunSpec(Set<Integer> minutes, Set<Integer> hours, Set<DayOfWeek> days) {}

class RunPlanner {
    public static Optional<LocalDateTime> nextRun(RunSpec spec, LocalDateTime after) {
        LocalDateTime limit = after.plusDays(8);
        LocalDateTime t = after.withSecond(0).withNano(0).plusMinutes(1);
        while (t.isBefore(limit)) {
            if (!spec.days().contains(t.getDayOfWeek())) {
                t = t.plusDays(1).withHour(0).withMinute(0);
                continue;
            }
            if (!spec.hours().contains(t.getHour())) {
                t = t.plusHours(1).withMinute(0);
                continue;
            }
            if (!spec.minutes().contains(t.getMinute())) {
                t = t.plusMinutes(1);
                continue;
            }
            return Optional.of(t);
        }
        return Optional.empty();
    }
}
`,
    hint: 'Check the coarsest field first and jump past the whole rejected unit, resetting the finer fields to zero as you go.',
    explanation:
      'Cron-style "next run" questions are best solved by scanning forward with jumps: rejecting a day skips 1440 minutes at once, so the loop stays cheap even for sparse specs. Truncating to the minute and adding one guarantees the strictly-after contract and a clean timestamp. The 8-day bound turns an impossible spec into an empty result instead of an infinite loop.',
    rules: [
      { label: 'Starts from a whole minute', type: 'mustContain', pattern: 'withSecond\\(\\s*0\\s*\\)|truncatedTo\\(', regex: true },
      { label: 'Moves strictly past the given time', type: 'mustContain', pattern: 'plusMinutes\\(\\s*1\\s*\\)', regex: true },
      { label: 'Checks the day of week', type: 'mustContain', pattern: 'getDayOfWeek()' },
      { label: 'Returns empty when nothing matches in range', type: 'mustContain', pattern: 'Optional\\.empty\\(\\)', regex: true },
    ],
  },
  {
    id: 'java-build-print-farm-job-queue',
    number: 48,
    language: 'java',
    kind: 'build',
    title: 'Print Farm Job Queue',
    difficulty: 'Medium',
    topic: 'Scheduling',
    statement:
      'A 3D print farm takes jobs with a priority. Implement `PrintJobQueue` so that `next()` always returns the highest-priority job, and jobs with equal priority come out in the exact order they were submitted (a `PriorityQueue` alone does not promise that).\n\n- `submit(job, priority)` enqueues the job. Higher numbers are more urgent.\n- `next()` removes and returns the most urgent job, or `Optional.empty()` when the queue is empty.\n- `size()` reports the number of waiting jobs.\n\nUse a `PriorityQueue` of entries that carry the job, its priority and a monotonically increasing sequence number assigned at submit time; order by priority descending, then sequence ascending.',
    functionSignature: 'public Optional<PrintJob> next()',
    buggyCode: `record PrintJob(String id, String file) {}

class PrintJobQueue {
    private final Deque<PrintJob> fifo = new ArrayDeque<>();

    public void submit(PrintJob job, int priority) {
        // TODO: honour priority with stable ties
        fifo.addLast(job);
    }

    public Optional<PrintJob> next() {
        // TODO
        return Optional.ofNullable(fifo.pollFirst());
    }

    public int size() {
        return fifo.size();
    }
}
`,
    solution: `record PrintJob(String id, String file) {}

class PrintJobQueue {
    private record Entry(PrintJob job, int priority, long seq) {}

    private final PriorityQueue<Entry> heap = new PriorityQueue<>(
        Comparator.comparingInt((Entry e) -> e.priority()).reversed().thenComparingLong(Entry::seq));
    private long nextSeq = 0;

    public void submit(PrintJob job, int priority) {
        heap.add(new Entry(job, priority, nextSeq++));
    }

    public Optional<PrintJob> next() {
        Entry e = heap.poll();
        return e == null ? Optional.empty() : Optional.of(e.job());
    }

    public int size() {
        return heap.size();
    }
}
`,
    hint: 'Wrap each job in an entry with a sequence number, and make the comparator fall back to that number after comparing priority.',
    explanation:
      'A binary heap is not a stable structure: two entries that compare equal can come out in any order, which makes a priority queue feel unfair to whoever submitted first. Adding a per-submit sequence number as the final comparison key restores FIFO among equals with no extra cost. This entry-plus-sequence trick is the standard way to build task schedulers, timers and event loops on PriorityQueue.',
    rules: [
      { label: 'Backed by a PriorityQueue', type: 'mustContain', pattern: 'PriorityQueue<' },
      { label: 'Assigns an increasing sequence number per submit', type: 'mustContain', pattern: 'nextSeq\\+\\+|seq\\+\\+|\\+\\+seq|\\+\\+nextSeq|getAndIncrement\\(\\)|incrementAndGet\\(\\)', regex: true },
      { label: 'Breaks priority ties by sequence', type: 'mustContain', pattern: 'thenComparing(Long|Int)?\\(|Long\\.compare\\(', regex: true },
      { label: 'No plain FIFO deque remains', type: 'mustNotContain', pattern: 'ArrayDeque|LinkedList', regex: true },
    ],
  },
  {
    id: 'java-build-charger-heartbeat-retrier',
    number: 49,
    language: 'java',
    kind: 'build',
    title: 'Charger Heartbeat Retrier',
    difficulty: 'Hard',
    topic: 'Scheduling',
    statement:
      'EV chargers send a heartbeat that occasionally fails; the retry must back off instead of hammering the server, and the retrier must shut down cleanly when the service stops. Implement `HeartbeatRetrier`:\n\n- `runWithRetry(attempt, maxAttempts, baseDelayMs)` runs `attempt` on the scheduler right away. If it returns true, complete the returned `CompletableFuture<Boolean>` with true. If it returns false or throws, schedule another try after `baseDelayMs * 2^(n-1)` milliseconds where `n` is the attempt number just made (1st failure waits `baseDelayMs`, 2nd waits `2 * baseDelayMs`, …) using `scheduler.schedule(...)`. After `maxAttempts` failures complete the future with false.\n- `close()` calls `shutdown()`, waits up to 2 seconds with `awaitTermination`, and calls `shutdownNow()` if work is still running; if the wait is interrupted, call `shutdownNow()` and restore the interrupt flag.',
    functionSignature: 'public CompletableFuture<Boolean> runWithRetry(Callable<Boolean> attempt, int maxAttempts, long baseDelayMs)',
    buggyCode: `class HeartbeatRetrier {
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public CompletableFuture<Boolean> runWithRetry(Callable<Boolean> attempt, int maxAttempts, long baseDelayMs) {
        // TODO: retry with exponential delays on the scheduler
        CompletableFuture<Boolean> result = new CompletableFuture<>();
        try {
            result.complete(attempt.call());
        } catch (Exception e) {
            result.complete(false);
        }
        return result;
    }

    public void close() {
        // TODO: drain, then force
        scheduler.shutdown();
    }
}
`,
    solution: `class HeartbeatRetrier {
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public CompletableFuture<Boolean> runWithRetry(Callable<Boolean> attempt, int maxAttempts, long baseDelayMs) {
        CompletableFuture<Boolean> result = new CompletableFuture<>();
        scheduler.execute(() -> tryOnce(attempt, 1, maxAttempts, baseDelayMs, result));
        return result;
    }

    private void tryOnce(Callable<Boolean> attempt, int attemptNo, int maxAttempts, long baseDelayMs,
                         CompletableFuture<Boolean> result) {
        boolean ok;
        try {
            ok = attempt.call();
        } catch (Exception e) {
            ok = false;
        }
        if (ok) {
            result.complete(true);
            return;
        }
        if (attemptNo >= maxAttempts) {
            result.complete(false);
            return;
        }
        long delay = baseDelayMs * (1L << (attemptNo - 1));
        scheduler.schedule(() -> tryOnce(attempt, attemptNo + 1, maxAttempts, baseDelayMs, result),
            delay, TimeUnit.MILLISECONDS);
    }

    public void close() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(2, TimeUnit.SECONDS)) scheduler.shutdownNow();
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
`,
    hint: 'Write a private tryOnce(attempt, attemptNo, ...) that either completes the future or schedules itself again with a doubled delay.',
    explanation:
      'Exponential backoff spreads retries out so a struggling server is not hit harder as it fails, and ScheduledExecutorService lets you wait without blocking a thread. The self-rescheduling helper keeps state in parameters, so many retries can share one scheduler thread. The two-phase shutdown — polite shutdown, bounded wait, then shutdownNow — is what lets the JVM exit promptly while giving an in-flight attempt a chance to finish.',
    rules: [
      { label: 'Retries are scheduled with a delay', type: 'mustContain', pattern: 'scheduler\\.schedule\\(', regex: true },
      { label: 'Delay doubles with each attempt', type: 'mustContain', pattern: '<<|Math\\.pow\\(\\s*2|\\*\\s*2\\b', regex: true },
      { label: 'close waits for in-flight work', type: 'mustContain', pattern: 'awaitTermination(' },
      { label: 'close forces termination if the wait times out', type: 'mustContain', pattern: 'shutdownNow()' },
    ],
  },
  {
    id: 'java-build-pipeline-stage-ordering',
    number: 50,
    language: 'java',
    kind: 'build',
    title: 'Pipeline Stage Ordering',
    difficulty: 'Hard',
    topic: 'Scheduling',
    statement:
      'A data pipeline declares its stages as a map from stage name to the list of stages that must finish first. Implement `StagePlanner.plan(deps)` returning an execution order:\n\n- Every stage mentioned anywhere (as a key or as a dependency) appears exactly once.\n- A stage appears only after all of its dependencies.\n- When several stages are runnable at the same time, pick them in alphabetical order so the plan is deterministic (a `PriorityQueue<String>` or `TreeSet` of ready stages works).\n- If the dependencies contain a cycle, throw `IllegalStateException` whose message lists the stages that could not be scheduled.\n\nDependency lists contain no duplicates. Use in-degree counting (Kahn\'s approach) rather than recursion.',
    functionSignature: 'public static List<String> plan(Map<String, List<String>> deps)',
    buggyCode: `class StagePlanner {
    public static List<String> plan(Map<String, List<String>> deps) {
        // TODO: order stages so dependencies run first; detect cycles
        return new ArrayList<>(deps.keySet());
    }
}
`,
    solution: `class StagePlanner {
    public static List<String> plan(Map<String, List<String>> deps) {
        Map<String, Integer> inDegree = new TreeMap<>();
        Map<String, List<String>> dependents = new HashMap<>();
        for (Map.Entry<String, List<String>> e : deps.entrySet()) {
            inDegree.putIfAbsent(e.getKey(), 0);
            for (String dep : e.getValue()) {
                inDegree.putIfAbsent(dep, 0);
                inDegree.merge(e.getKey(), 1, Integer::sum);
                dependents.computeIfAbsent(dep, k -> new ArrayList<>()).add(e.getKey());
            }
        }

        PriorityQueue<String> ready = new PriorityQueue<>();
        for (Map.Entry<String, Integer> e : inDegree.entrySet()) {
            if (e.getValue() == 0) ready.add(e.getKey());
        }

        List<String> order = new ArrayList<>();
        while (!ready.isEmpty()) {
            String stage = ready.poll();
            order.add(stage);
            for (String next : dependents.getOrDefault(stage, List.of())) {
                if (inDegree.merge(next, -1, Integer::sum) == 0) ready.add(next);
            }
        }

        if (order.size() != inDegree.size()) {
            List<String> stuck = new ArrayList<>();
            for (Map.Entry<String, Integer> e : inDegree.entrySet()) {
                if (e.getValue() > 0) stuck.add(e.getKey());
            }
            throw new IllegalStateException("dependency cycle among stages: " + stuck);
        }
        return order;
    }
}
`,
    hint: 'Count incoming edges per stage, seed a sorted ready set with the zero-count stages, and decrement dependents as you emit each stage; anything left with a positive count is in a cycle.',
    explanation:
      'Topological ordering is the core of build systems, migration runners and DAG schedulers. Kahn\'s algorithm makes cycle detection trivial — if the output is shorter than the node count, the leftovers form a cycle — and choosing the next ready node from a sorted structure makes the order reproducible across runs. Registering dependency-only stages as nodes is the detail that most first attempts miss.',
    rules: [
      { label: 'Tracks incoming edges per stage', type: 'mustContain', pattern: '[iI]n[dD]eg|incoming|indeg', regex: true },
      { label: 'Picks ready stages in a deterministic order', type: 'mustContain', pattern: 'PriorityQueue<String>|TreeSet<String>|TreeMap<String|Collections\\.sort\\(|\\.sort\\(', regex: true },
      { label: 'Throws IllegalStateException on a cycle', type: 'mustContain', pattern: 'throw new IllegalStateException\\(', regex: true },
      { label: 'No longer returns the keys in map order', type: 'mustNotContain', pattern: 'new ArrayList<>\\(\\s*deps\\.keySet\\(\\)\\s*\\)', regex: true },
    ],
  },
];
