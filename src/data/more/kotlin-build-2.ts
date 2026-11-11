// Kotlin / Android build problems 31-60 (rule-graded; every reference compiles with kotlinc and
// kotlinx-coroutines 1.8.1, no Android SDK: Android concepts are modelled with tiny stand-ins).
import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  // ------------------------------------------------------------ Coroutines & Flow
  {
    id: 'kotlin-build-unread-badge-state-stream',
    number: 31,
    language: 'kotlin',
    kind: 'build',
    title: 'Unread Badge State Stream',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      'The inbox tab shows a badge with the number of unread messages. The data layer hands you a **cold** `Flow<List<Message>>`; the screen wants a `StateFlow<Int>` it can read synchronously and re-collect after rotation without restarting the upstream query.\n\nImplement `unreadBadge(messages, scope)`:\n\n- map each list to the number of messages with `read == false`,\n- convert the result with `stateIn` in the given `scope`,\n- start sharing with `SharingStarted.WhileSubscribed(5_000)` (keep the upstream alive for 5 seconds after the last collector leaves),\n- the initial value is `0`.\n\nDo not create a `MutableStateFlow` and do not launch a collector by hand.',
    functionSignature: 'fun unreadBadge(messages: Flow<List<Message>>, scope: CoroutineScope): StateFlow<Int>',
    buggyCode: `import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.*

data class Message(val id: String, val read: Boolean)

fun unreadBadge(messages: Flow<List<Message>>, scope: CoroutineScope): StateFlow<Int> {
    // TODO: map to the unread count, then stateIn(scope, WhileSubscribed(5_000), 0)
    return MutableStateFlow(0)
}
`,
    solution: `import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.*

data class Message(val id: String, val read: Boolean)

fun unreadBadge(messages: Flow<List<Message>>, scope: CoroutineScope): StateFlow<Int> =
    messages
        .map { list -> list.count { !it.read } }
        .stateIn(scope, SharingStarted.WhileSubscribed(5_000), 0)
`,
    hint: '`someFlow.map { ... }.stateIn(scope, started, initialValue)` returns a `StateFlow`; the middle argument decides when the upstream is collected.',
    explanation:
      '`stateIn` turns a cold flow into a hot `StateFlow` that is collected once inside `scope` and shared by every subscriber, so the screen always has a current value to render. `SharingStarted.WhileSubscribed(5_000)` stops the upstream when nobody is looking, but waits five seconds first: a rotation re-subscribes within that window, so the database query is not torn down and restarted. `Eagerly` would keep the query running for a screen nobody sees, and a hand-rolled `MutableStateFlow` plus `launch { collect { } }` re-implements the same thing without the stop behaviour. The mapping itself is one `count { !it.read }` per emission.',
    rules: [
      { label: 'Converts the mapped flow with stateIn', type: 'mustContain', pattern: '\\.stateIn\\s*\\(', regex: true },
      { label: 'Shares with SharingStarted.WhileSubscribed and a 5000 ms stop timeout', type: 'mustContain', pattern: 'WhileSubscribed\\s*\\(\\s*(stopTimeoutMillis\\s*=\\s*)?5_?000L?\\s*[,)]', regex: true },
      { label: 'Counts the unread messages of each list', type: 'mustContain', pattern: 'count\\s*\\{|filter(Not)?\\s*\\{[^}]*\\}\\s*\\.(size|count)|sumOf\\s*\\{|\\.fold\\s*\\(', regex: true },
      { label: 'Does not build its own MutableStateFlow', type: 'mustNotContain', pattern: 'MutableStateFlow\\s*[<(]', regex: true },
    ],
  },
  {
    id: 'kotlin-build-loyalty-dashboard-parallel-load',
    number: 32,
    language: 'kotlin',
    kind: 'build',
    title: 'Loyalty Dashboard Parallel Load',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'A coffee-chain app opens its loyalty dashboard with three calls. `profile(userId)` and `points(userId)` are independent; `offers(tier)` needs the tier from the profile.\n\nImplement `loadDashboard(api, userId)`:\n\n- run `profile` and `points` **concurrently**, each in its own `async`, inside one `coroutineScope { }`,\n- once the profile is available call `offers(profile.tier)`,\n- return `Dashboard(name, tier, points, offerCount)` where `offerCount` is the size of the offers list,\n- if any call throws, the others must be cancelled and the exception must reach the caller (this is what `coroutineScope` gives you; do not catch anything).\n\nNo `GlobalScope`, no `runBlocking`, no `supervisorScope`.',
    functionSignature: 'suspend fun loadDashboard(api: LoyaltyApi, userId: String): Dashboard',
    buggyCode: `import kotlinx.coroutines.*

data class Profile(val name: String, val tier: String)
data class Dashboard(val name: String, val tier: String, val points: Int, val offerCount: Int)

interface LoyaltyApi {
    suspend fun profile(userId: String): Profile
    suspend fun points(userId: String): Int
    suspend fun offers(tier: String): List<String>
}

suspend fun loadDashboard(api: LoyaltyApi, userId: String): Dashboard {
    // TODO: profile and points concurrently, then offers for the profile tier
    TODO()
}
`,
    solution: `import kotlinx.coroutines.*

data class Profile(val name: String, val tier: String)
data class Dashboard(val name: String, val tier: String, val points: Int, val offerCount: Int)

interface LoyaltyApi {
    suspend fun profile(userId: String): Profile
    suspend fun points(userId: String): Int
    suspend fun offers(tier: String): List<String>
}

suspend fun loadDashboard(api: LoyaltyApi, userId: String): Dashboard = coroutineScope {
    val profileCall = async { api.profile(userId) }
    val pointsCall = async { api.points(userId) }
    val profile = profileCall.await()
    val offers = api.offers(profile.tier)
    Dashboard(profile.name, profile.tier, pointsCall.await(), offers.size)
}
`,
    hint: 'Start both `async` blocks before the first `await()`. The dependent call can simply run in the body of `coroutineScope` after the profile has been awaited.',
    explanation:
      'Calling the three functions one after another makes the screen wait for the sum of their latencies, although two of them do not depend on each other. `coroutineScope { }` opens a child scope tied to the caller: both `async` blocks start immediately, the body awaits the profile, fires the dependent `offers` call while `points` is still in flight, and the function only returns when everything has finished. Because the scope uses a regular `Job`, a failure in any child cancels the siblings and is rethrown, so no request is left running for a screen that already shows an error. `supervisorScope` would keep the sibling alive and `GlobalScope` would detach the work from the caller entirely. Total latency becomes max(profile + offers, points).',
    rules: [
      { label: 'Opens a coroutineScope { } tied to the caller', type: 'mustContain', pattern: '\\bcoroutineScope\\s*\\{', regex: true },
      { label: 'Starts profile and points in two async blocks', type: 'mustContain', pattern: 'async\\s*(\\(.*\\))?\\s*\\{[\\s\\S]*async\\s*(\\(.*\\))?\\s*\\{', regex: true },
      { label: 'Awaits the async results', type: 'mustContain', pattern: '\\.await\\s*\\(\\s*\\)|awaitAll\\s*\\(', regex: true },
      { label: 'No GlobalScope, runBlocking or supervisorScope', type: 'mustNotContain', pattern: 'GlobalScope|runBlocking|supervisorScope', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-fare-quote-deadline',
    number: 33,
    language: 'kotlin',
    kind: 'build',
    title: 'Fare Quote With Deadline',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      'A ride-hailing booking sheet must show a price quickly. Implement `quoteWithDeadline(timeoutMs, estimateCents, fetchLive)`:\n\n- call `fetchLive()` under a deadline using `withTimeoutOrNull(timeoutMs)`,\n- if it returns in time, return `FareQuote(cents, QuoteSource.LIVE)`,\n- if the deadline passes, return `FareQuote(estimateCents, QuoteSource.ESTIMATE)`,\n- any exception thrown by `fetchLive` itself must propagate unchanged.\n\nDo not use the throwing `withTimeout` and do not catch `TimeoutCancellationException` yourself.',
    functionSignature: 'suspend fun quoteWithDeadline(timeoutMs: Long, estimateCents: Long, fetchLive: suspend () -> Long): FareQuote',
    buggyCode: `import kotlinx.coroutines.*

enum class QuoteSource { LIVE, ESTIMATE }
data class FareQuote(val cents: Long, val source: QuoteSource)

suspend fun quoteWithDeadline(
    timeoutMs: Long,
    estimateCents: Long,
    fetchLive: suspend () -> Long,
): FareQuote {
    // TODO: give fetchLive at most timeoutMs, otherwise fall back to the estimate
    return FareQuote(fetchLive(), QuoteSource.LIVE)
}
`,
    solution: `import kotlinx.coroutines.*

enum class QuoteSource { LIVE, ESTIMATE }
data class FareQuote(val cents: Long, val source: QuoteSource)

suspend fun quoteWithDeadline(
    timeoutMs: Long,
    estimateCents: Long,
    fetchLive: suspend () -> Long,
): FareQuote {
    val live = withTimeoutOrNull(timeoutMs) { fetchLive() }
    return if (live != null) FareQuote(live, QuoteSource.LIVE)
    else FareQuote(estimateCents, QuoteSource.ESTIMATE)
}
`,
    hint: '`withTimeoutOrNull` returns the block result, or `null` when the time is up. Turn that `null` into the estimate.',
    explanation:
      '`withTimeoutOrNull` cancels the block when the deadline passes and returns `null` instead of throwing, so "too slow" becomes an ordinary value you can branch on. The throwing `withTimeout` raises `TimeoutCancellationException`, which is a `CancellationException`: catching it by hand is easy to get wrong, because a broad catch also swallows the cancellation of the caller. Real failures of `fetchLive` are not timeouts and still propagate, since nothing here catches them. The function costs one suspension and no extra coroutine.',
    rules: [
      { label: 'Applies the deadline with withTimeoutOrNull', type: 'mustContain', pattern: 'withTimeoutOrNull\\s*\\(', regex: true },
      { label: 'Falls back to the estimate when the result is null', type: 'mustContain', pattern: '\\?:|[!=]=\\s*null|\\?\\.let', regex: true },
      { label: 'Does not handle TimeoutCancellationException by hand', type: 'mustNotContain', pattern: 'TimeoutCancellationException' },
      { label: 'Does not use the throwing withTimeout', type: 'mustNotContain', pattern: 'withTimeout\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-build-seat-hold-mutex-guard',
    number: 34,
    language: 'kotlin',
    kind: 'build',
    title: 'Seat Hold Mutex Guard',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'A cinema app lets several coroutines (taps, a websocket, a restore job) try to hold seats at the same time. Implement `SeatHolds(capacity)` so that every check-then-write happens under one coroutine `Mutex` via `withLock`:\n\n- `hold(seat, userId)`: returns `true` if the seat is already held by this user; `false` if it is held by someone else; `false` if the seat is free but `capacity` seats are already held in total; otherwise records the hold and returns `true`.\n- `release(seat, userId)`: removes the hold and returns `true` only if this user holds the seat, else `false`.\n- `heldBy(userId)`: the seats held by the user, sorted ascending.\n\nUse `kotlinx.coroutines.sync.Mutex`; no `synchronized`, no `runBlocking`, no Java locks.',
    functionSignature: 'class SeatHolds(capacity: Int) { suspend fun hold(seat: String, userId: String): Boolean; suspend fun release(seat: String, userId: String): Boolean; suspend fun heldBy(userId: String): List<String> }',
    buggyCode: `import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class SeatHolds(private val capacity: Int) {
    private val holds = mutableMapOf<String, String>() // seat -> userId

    // TODO: guard every read-modify-write with a Mutex and withLock
    suspend fun hold(seat: String, userId: String): Boolean = TODO()

    suspend fun release(seat: String, userId: String): Boolean = TODO()

    suspend fun heldBy(userId: String): List<String> = TODO()
}
`,
    solution: `import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class SeatHolds(private val capacity: Int) {
    private val mutex = Mutex()
    private val holds = mutableMapOf<String, String>()

    suspend fun hold(seat: String, userId: String): Boolean = mutex.withLock {
        val owner = holds[seat]
        when {
            owner == userId -> true
            owner != null -> false
            holds.size >= capacity -> false
            else -> {
                holds[seat] = userId
                true
            }
        }
    }

    suspend fun release(seat: String, userId: String): Boolean = mutex.withLock {
        if (holds[seat] == userId) {
            holds.remove(seat)
            true
        } else {
            false
        }
    }

    suspend fun heldBy(userId: String): List<String> = mutex.withLock {
        holds.filterValues { it == userId }.keys.sorted()
    }
}
`,
    hint: 'Create one `private val mutex = Mutex()` and make each function body `mutex.withLock { ... }`; the lambda result becomes the return value.',
    explanation:
      '"Is the seat free? Then take it" is a read followed by a write; on a multi-threaded dispatcher two coroutines can both see the seat as free and both record a hold. A coroutine `Mutex` makes that sequence atomic without blocking a thread: a waiting coroutine suspends. `withLock` also releases the lock when the block throws or the coroutine is cancelled, which a manual `lock()` / `unlock()` pair forgets. `synchronized` and Java locks block the thread and must not be held across suspension points. Each operation is O(1) except `heldBy`, which scans and sorts the holds.',
    rules: [
      { label: 'Creates a coroutine Mutex', type: 'mustContain', pattern: 'Mutex\\s*\\(\\s*\\)', regex: true },
      { label: 'Runs hold and release inside withLock { }', type: 'mustContain', pattern: 'withLock\\s*\\{[\\s\\S]*withLock\\s*\\{', regex: true },
      { label: 'Compares the number of holds with capacity', type: 'mustContain', pattern: '(size|count\\s*\\(\\s*\\))\\s*(>=|<|==|>)\\s*capacity|capacity\\s*(<=|>|==|<)\\s*\\w+\\.(size|count)', regex: true },
      { label: 'No synchronized, runBlocking or Java locks', type: 'mustNotContain', pattern: 'synchronized|runBlocking|ReentrantLock', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-courier-eta-polling-flow',
    number: 35,
    language: 'kotlin',
    kind: 'build',
    title: 'Courier ETA Polling Flow',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'The order-tracking screen polls the courier ETA while it is visible. Implement `pollEta(intervalMs, fetch)` as a **cold** flow built with `flow { }`:\n\n- on collection call `fetch()` immediately and `emit` the result,\n- then wait `delay(intervalMs)` and poll again, forever,\n- a poll that throws `IOException` is skipped (emit nothing for that tick) and polling continues after the usual delay,\n- any other exception, including cancellation, must propagate: catch `IOException` only, never `Exception` or `Throwable`,\n- after emitting an `Eta` with `arrived == true` the flow completes at once, without another delay.\n\nKeep the `emit` call outside the `try` block so a failure in the collector is never mistaken for a network error. Do not launch coroutines or use a scope: the collector owns the loop.',
    functionSignature: 'fun pollEta(intervalMs: Long, fetch: suspend () -> Eta): Flow<Eta>',
    buggyCode: `import java.io.IOException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.emptyFlow

data class Eta(val minutes: Int, val arrived: Boolean)

fun pollEta(intervalMs: Long, fetch: suspend () -> Eta): Flow<Eta> {
    // TODO: flow { } with a fetch / emit / delay loop that ends once arrived
    return emptyFlow()
}
`,
    solution: `import java.io.IOException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

data class Eta(val minutes: Int, val arrived: Boolean)

fun pollEta(intervalMs: Long, fetch: suspend () -> Eta): Flow<Eta> = flow {
    while (true) {
        val eta = try {
            fetch()
        } catch (e: IOException) {
            null
        }
        if (eta != null) {
            emit(eta)
            if (eta.arrived) break
        }
        delay(intervalMs)
    }
}
`,
    hint: 'Use `try` as an expression that yields the `Eta` or `null`, then emit and check `arrived` after it. `delay` is the last statement of the loop.',
    explanation:
      'A `flow { }` body runs in the coroutine of its collector, so a `while (true)` loop with `delay` is a complete polling engine: when the screen stops collecting, `delay` or `fetch` throws `CancellationException` and the loop ends by itself. That only works if cancellation is not swallowed, which is why the catch names `IOException` and nothing wider. Emitting outside the `try` keeps the flow exception-transparent: an error thrown by the collector must not be caught as if it were a failed poll. Breaking right after the final emission avoids one pointless delay before completion.',
    rules: [
      { label: 'Builds a cold flow with flow { }', type: 'mustContain', pattern: '\\bflow\\s*(<\\s*Eta\\s*>\\s*)?\\{', regex: true },
      { label: 'Waits delay(intervalMs) between polls', type: 'mustContain', pattern: 'delay\\s*\\(\\s*intervalMs\\s*\\)', regex: true },
      { label: 'Skips a failed poll by catching IOException', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*(java\\.io\\.)?IOException\\s*\\)', regex: true },
      { label: 'Never catches Exception / Throwable (cancellation must propagate)', type: 'mustNotContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*(Exception|Throwable)\\s*\\)|runCatching', regex: true },
      { label: 'Stops once the emitted ETA has arrived', type: 'mustContain', pattern: '\\.arrived\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-build-like-tap-throttle-operator',
    number: 36,
    language: 'kotlin',
    kind: 'build',
    title: 'Like Tap Throttle Operator',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'Users hammer the like button; the server should see the **first** tap of each burst right away, not the last one after a pause. Implement the operator `Flow<T>.throttleFirst(windowMs, clock)`:\n\n- the first upstream value is always emitted,\n- a later value is emitted only if at least `windowMs` milliseconds have passed since the last **emitted** value (exactly `windowMs` counts as enough); otherwise it is dropped,\n- time comes only from the injected `clock()`,\n- every collection has its own state: build the result with `flow { }`, keep the timestamp in a local variable inside the builder and `collect` the upstream there.\n\nDo not use `debounce`, `sample` or `delay`.',
    functionSignature: 'fun <T> Flow<T>.throttleFirst(windowMs: Long, clock: () -> Long): Flow<T>',
    buggyCode: `import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

fun <T> Flow<T>.throttleFirst(windowMs: Long, clock: () -> Long): Flow<T> {
    // TODO: flow { collect { ... } } that lets a value through only when the window has passed
    return this
}
`,
    solution: `import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

fun <T> Flow<T>.throttleFirst(windowMs: Long, clock: () -> Long): Flow<T> = flow {
    var lastEmitAt: Long? = null
    collect { value ->
        val now = clock()
        val last = lastEmitAt
        if (last == null || now - last >= windowMs) {
            lastEmitAt = now
            emit(value)
        }
    }
}
`,
    hint: 'Inside `flow { }` you can call `collect { }` on the receiver flow and `emit` from within it. Remember when you last emitted, not when you last received.',
    explanation:
      'A custom intermediate operator is just a `flow { }` that collects its upstream and decides what to re-emit. `debounce` is the wrong tool here: it waits for silence and delivers the last value, so a like would be sent late or never during a long burst. Measuring from the last emitted value (not the last received one) keeps a steady stream of taps flowing at one per window. Declaring the timestamp inside the builder gives each collector fresh state; a variable outside the builder would be shared by every collection of the returned flow. Reading time from `clock` makes the operator testable without real waiting.',
    rules: [
      { label: 'Builds the operator with flow { }', type: 'mustContain', pattern: '\\bflow\\s*(<\\s*T\\s*>\\s*)?\\{', regex: true },
      { label: 'Collects the upstream inside the builder', type: 'mustContain', pattern: 'collect\\s*[({]|emitAll\\s*\\(', regex: true },
      { label: 'Reads time from the injected clock()', type: 'mustContain', pattern: 'clock\\s*\\(\\s*\\)', regex: true },
      { label: 'Measures the elapsed time against windowMs', type: 'mustContain', pattern: '[-+<>=]\\s*windowMs\\b|\\bwindowMs\\s*[-+<>=]', regex: true },
      { label: 'No debounce, sample, delay or system clock', type: 'mustNotContain', pattern: 'debounce|\\bsample\\s*\\(|\\bdelay\\s*\\(|System\\.currentTimeMillis|System\\.nanoTime', regex: true },
    ],
  },
  // ------------------------------------------------------------ UI State & Architecture
  {
    id: 'kotlin-build-bottom-tab-route-lookup',
    number: 37,
    language: 'kotlin',
    kind: 'build',
    title: 'Bottom Tab Route Lookup',
    difficulty: 'Easy',
    topic: 'UI State & Architecture',
    statement:
      'The bottom bar of a food-delivery app is an `enum class Tab(val route: String, val label: String)`. Deep links and restored state arrive as route strings and must be mapped back to a tab.\n\nAdd a `companion object` with `fun fromRoute(route: String?): Tab`:\n\n- `null` returns `HOME`,\n- otherwise trim surrounding whitespace, drop leading `/` characters and keep the text before the next `/` (the first path segment),\n- compare that segment with each tab `route` ignoring case and return the matching tab: `"/orders/42"` gives `ORDERS`, `" Search "` gives `SEARCH`,\n- anything unknown (including an empty string) returns `HOME`.\n\nLook the tab up in `entries` (or `values()`); do not write a `when` that repeats the route strings.',
    functionSignature: 'enum class Tab(val route: String, val label: String) { ...; companion object { fun fromRoute(route: String?): Tab } }',
    buggyCode: `enum class Tab(val route: String, val label: String) {
    HOME("home", "Home"),
    SEARCH("search", "Search"),
    ORDERS("orders", "Orders"),
    PROFILE("profile", "Profile");

    // TODO: companion object with fun fromRoute(route: String?): Tab
}
`,
    solution: `enum class Tab(val route: String, val label: String) {
    HOME("home", "Home"),
    SEARCH("search", "Search"),
    ORDERS("orders", "Orders"),
    PROFILE("profile", "Profile");

    companion object {
        fun fromRoute(route: String?): Tab {
            val segment = route?.trim()?.trimStart('/')?.substringBefore('/')?.lowercase()
            return entries.firstOrNull { it.route == segment } ?: HOME
        }
    }
}
`,
    hint: 'Normalise the string first (`trim`, `trimStart(\'/\')`, `substringBefore(\'/\')`, `lowercase`), then `entries.firstOrNull { ... } ?: HOME`.',
    explanation:
      'The enum already knows every route, so the lookup should be driven by `entries`: adding a fifth tab then works without touching `fromRoute`. A `when` over string literals duplicates the routes and silently falls out of date. Putting the function in the `companion object` gives the call site `Tab.fromRoute(...)`, the Kotlin counterpart of a static factory. Normalising before comparing (whitespace, leading slash, first segment, case) is what makes deep links such as `/orders/42` land on the right tab, and the elvis fallback guarantees the bar always has a selected tab. The scan is O(number of tabs).',
    rules: [
      { label: 'Declares fromRoute inside a companion object', type: 'mustContain', pattern: 'companion\\s+object[\\s\\S]*fun\\s+fromRoute\\s*\\(', regex: true },
      { label: 'Looks the tab up in entries / values()', type: 'mustContain', pattern: '\\bentries\\b|\\bvalues\\s*\\(\\s*\\)', regex: true },
      { label: 'Compares the route ignoring case', type: 'mustContain', pattern: 'lowercase\\s*\\(|uppercase\\s*\\(|ignoreCase\\s*=\\s*true|equals\\s*\\([^)]*,\\s*true\\s*\\)', regex: true },
      { label: 'Falls back to HOME', type: 'mustContain', pattern: '(\\?:|else|->|return)\\s*(Tab\\.)?HOME\\b', regex: true },
      { label: 'Does not repeat the route strings in a when', type: 'mustNotContain', pattern: '"(search|orders|profile)"\\s*->', regex: true },
    ],
  },
  {
    id: 'kotlin-build-covariant-loadable-map',
    number: 38,
    language: 'kotlin',
    kind: 'build',
    title: 'Covariant Loadable Map',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      'Every screen of a banking app wraps its content in `Loadable`. The starter is invariant, so `Loading` and `Failed` need a pointless type argument and a `Loadable<Account>` cannot be mapped to a `Loadable<String>` without casts. Rewrite it:\n\n- `sealed interface Loadable<out T>` (a sealed class is fine too),\n- `data object Loading : Loadable<Nothing>`,\n- `data class Ready<T>(val value: T) : Loadable<T>`,\n- `data class Failed(val reason: String) : Loadable<Nothing>`,\n- the extension `fun <T, R> Loadable<T>.map(transform: (T) -> R): Loadable<R>` applies `transform` to the value of `Ready` and returns `Loading` and `Failed` unchanged.\n\n`map` must be a `when (this)` with one branch per case and **no `else`**, and no casts.',
    functionSignature: 'sealed interface Loadable<out T>; fun <T, R> Loadable<T>.map(transform: (T) -> R): Loadable<R>',
    buggyCode: `// TODO: make Loadable covariant so Loading and Failed can be Loadable<Nothing>
sealed interface Loadable<T> {
    class Loading<T> : Loadable<T>
    data class Ready<T>(val value: T) : Loadable<T>
    data class Failed<T>(val reason: String) : Loadable<T>
}

fun <T, R> Loadable<T>.map(transform: (T) -> R): Loadable<R> {
    // TODO: transform Ready, pass Loading and Failed through
    TODO()
}
`,
    solution: `sealed interface Loadable<out T> {
    data object Loading : Loadable<Nothing>
    data class Ready<T>(val value: T) : Loadable<T>
    data class Failed(val reason: String) : Loadable<Nothing>
}

fun <T, R> Loadable<T>.map(transform: (T) -> R): Loadable<R> = when (this) {
    is Loadable.Loading -> this
    is Loadable.Ready -> Loadable.Ready(transform(value))
    is Loadable.Failed -> this
}
`,
    hint: '`Nothing` is a subtype of every type. With `out T`, a `Loadable<Nothing>` is therefore a `Loadable<R>` for any `R`, so the two valueless cases can be returned as they are.',
    explanation:
      'Declaring the parameter as `out T` promises that `Loadable` only ever produces a `T`, which lets the compiler treat `Loadable<Nothing>` as a subtype of `Loadable<R>` for every `R`. That is why `Loading` can be a single `data object` and `Failed` needs no type argument: inside `map` the smart-cast `this` is already a valid result. Without variance each of those branches would need an unchecked cast or a fresh allocation. Writing `when (this)` over the sealed type without `else` keeps the function exhaustive, so adding a fourth state later is a compile error here instead of a silent fall-through.',
    rules: [
      { label: 'Loadable is declared covariant: Loadable<out T>', type: 'mustContain', pattern: 'sealed\\s+(interface|class)\\s+Loadable\\s*<\\s*out\\s+T\\s*>', regex: true },
      { label: 'Loading is an object typed Loadable<Nothing>', type: 'mustContain', pattern: 'object\\s+Loading\\s*:\\s*Loadable\\s*<\\s*Nothing\\s*>', regex: true },
      { label: 'Failed is typed Loadable<Nothing>', type: 'mustContain', pattern: 'class\\s+Failed\\s*\\([^)]*\\)\\s*:\\s*Loadable\\s*<\\s*Nothing\\s*>', regex: true },
      { label: 'map applies transform to the Ready value', type: 'mustContain', pattern: 'transform\\s*\\(\\s*[\\w.@]+\\s*\\)|\\(\\s*transform\\s*\\)', regex: true },
      { label: 'No else branch and no casts in map', type: 'mustNotContain', pattern: 'else\\s*->|\\bas\\s+Loadable|UNCHECKED_CAST', regex: true },
    ],
  },
  {
    id: 'kotlin-build-back-stack-navigator',
    number: 39,
    language: 'kotlin',
    kind: 'build',
    title: 'Back Stack Navigator',
    difficulty: 'Hard',
    topic: 'UI State & Architecture',
    statement:
      'Implement `Navigator`, the back stack owner of a shopping app. All calls happen on the main thread. The stack is an **immutable** `List<Screen>` (bottom first) held in a private `MutableStateFlow` and exposed as `backStack: StateFlow<List<Screen>>`; it starts as `listOf(root)` and is never empty. Every change publishes a **new** list.\n\n- `current`: the top entry.\n- `navigate(screen)`: single-top. If `screen` equals the current top, do nothing; otherwise push it.\n- `pop(): Boolean`: remove the top entry and return `true`; if only one entry is left return `false` and change nothing.\n- `popUpTo(screen, inclusive): Boolean`: find the **last** occurrence of `screen` (`lastIndexOf`). If absent return `false` and change nothing. Otherwise remove everything above it, and the entry itself when `inclusive` is true, but always keep at least the bottom entry. Return `true`.\n\nDo not use `MutableList`, `ArrayDeque` or `ArrayList`.',
    functionSignature: 'class Navigator(root: Screen) { val backStack: StateFlow<List<Screen>>; val current: Screen; fun navigate(screen: Screen); fun pop(): Boolean; fun popUpTo(screen: Screen, inclusive: Boolean): Boolean }',
    buggyCode: `import kotlinx.coroutines.flow.*

sealed interface Screen {
    data object Home : Screen
    data object Cart : Screen
    data object Checkout : Screen
    data class Product(val id: String) : Screen
}

class Navigator(private val root: Screen = Screen.Home) {
    // TODO: private MutableStateFlow(listOf(root)) exposed read-only
    val backStack: StateFlow<List<Screen>> get() = TODO()

    val current: Screen get() = TODO()

    fun navigate(screen: Screen) { TODO() }

    fun pop(): Boolean = TODO()

    fun popUpTo(screen: Screen, inclusive: Boolean): Boolean = TODO()
}
`,
    solution: `import kotlinx.coroutines.flow.*

sealed interface Screen {
    data object Home : Screen
    data object Cart : Screen
    data object Checkout : Screen
    data class Product(val id: String) : Screen
}

class Navigator(private val root: Screen = Screen.Home) {
    private val _backStack = MutableStateFlow(listOf(root))
    val backStack: StateFlow<List<Screen>> = _backStack.asStateFlow()

    val current: Screen get() = _backStack.value.last()

    fun navigate(screen: Screen) {
        _backStack.update { stack -> if (stack.last() == screen) stack else stack + screen }
    }

    fun pop(): Boolean {
        val stack = _backStack.value
        if (stack.size <= 1) return false
        _backStack.value = stack.dropLast(1)
        return true
    }

    fun popUpTo(screen: Screen, inclusive: Boolean): Boolean {
        val stack = _backStack.value
        val index = stack.lastIndexOf(screen)
        if (index < 0) return false
        val keep = if (inclusive) index else index + 1
        _backStack.value = stack.take(maxOf(keep, 1))
        return true
    }
}
`,
    hint: 'Three list operations cover everything: `stack + screen`, `stack.dropLast(1)` and `stack.take(n)`. For `popUpTo`, the number of entries to keep is `index` or `index + 1`, but never less than 1.',
    explanation:
      'Modelling the back stack as an immutable list inside a `StateFlow` makes navigation ordinary state: the UI renders the top entry and every change is a new value that collectors can compare. Mutating a `MutableList` in place would leave the flow holding the same instance, and `StateFlow` drops emissions that are equal to the current value. The three edge cases are where real navigators break: pushing the screen that is already on top (double taps), popping the last entry (the app shows nothing), and `popUpTo` with `inclusive` on the root. `lastIndexOf` matters when a screen appears twice; popping to the nearest occurrence is what the user expects. Each operation copies at most the whole stack, which is tiny.',
    rules: [
      { label: 'Keeps the stack in a private MutableStateFlow', type: 'mustContain', pattern: 'private\\s+val\\s+\\w+\\s*(:\\s*MutableStateFlow\\s*<[^=]*>\\s*)?=\\s*MutableStateFlow\\s*[<(]', regex: true },
      { label: 'Publishes a new list through update { } or value =', type: 'mustContain', pattern: '\\.update\\s*\\{|\\.value\\s*=[^=]', regex: true },
      { label: 'navigate compares the new screen with the top entry (single-top)', type: 'mustContain', pattern: '[!=]=\\s*[\\w.]*\\blast(OrNull)?\\s*\\(\\s*\\)|\\blast(OrNull)?\\s*\\(\\s*\\)\\s*[!=]=|[!=]=\\s*current\\b|\\bcurrent\\s*[!=]=', regex: true },
      { label: 'popUpTo locates the last occurrence of the screen', type: 'mustContain', pattern: 'lastIndexOf\\s*\\(|indexOfLast\\s*\\{|dropLastWhile\\s*\\{', regex: true },
      { label: 'The stack is never a mutable collection', type: 'mustNotContain', pattern: 'MutableList|mutableListOf|ArrayDeque|ArrayList', regex: true },
    ],
  },
  // ------------------------------------------------------------ Data & Persistence
  {
    id: 'kotlin-build-article-feed-cache-then-network',
    number: 40,
    language: 'kotlin',
    kind: 'build',
    title: 'Article Feed Cache Then Network',
    difficulty: 'Hard',
    topic: 'Data & Persistence',
    statement:
      'A news reader must paint instantly from disk and then refresh. Implement `FeedRepository.feed()` as a cold `flow { }` of `FeedUpdate`:\n\n1. Read the cache. If it returns a list (an empty list still counts) emit `Cached(list)`; if it returns `null` emit nothing yet.\n2. Then call `fetchRemote()`.\n3. If it throws `IOException`, emit `Offline(hasCache)` where `hasCache` tells whether step 1 found a cache, and complete. Any other exception, including cancellation, must propagate: catch `IOException` only.\n4. On success always `cache.write(fresh)` first; then emit `Fresh(fresh)` unless `fresh` equals the cached list (in that case emit nothing more).\n\nKeep every `emit` outside the `try` block that guards the network call.',
    functionSignature: 'class FeedRepository(cache: FeedCache, fetchRemote: suspend () -> List<Article>) { fun feed(): Flow<FeedUpdate> }',
    buggyCode: `import java.io.IOException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.emptyFlow

data class Article(val id: String, val title: String)

sealed interface FeedUpdate {
    data class Cached(val articles: List<Article>) : FeedUpdate
    data class Fresh(val articles: List<Article>) : FeedUpdate
    data class Offline(val hasCache: Boolean) : FeedUpdate
}

interface FeedCache {
    suspend fun read(): List<Article>?
    suspend fun write(articles: List<Article>)
}

class FeedRepository(
    private val cache: FeedCache,
    private val fetchRemote: suspend () -> List<Article>,
) {
    fun feed(): Flow<FeedUpdate> {
        // TODO: cached copy first, then the network, then write back
        return emptyFlow()
    }
}
`,
    solution: `import java.io.IOException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

data class Article(val id: String, val title: String)

sealed interface FeedUpdate {
    data class Cached(val articles: List<Article>) : FeedUpdate
    data class Fresh(val articles: List<Article>) : FeedUpdate
    data class Offline(val hasCache: Boolean) : FeedUpdate
}

interface FeedCache {
    suspend fun read(): List<Article>?
    suspend fun write(articles: List<Article>)
}

class FeedRepository(
    private val cache: FeedCache,
    private val fetchRemote: suspend () -> List<Article>,
) {
    fun feed(): Flow<FeedUpdate> = flow {
        val cached = cache.read()
        if (cached != null) emit(FeedUpdate.Cached(cached))
        val fresh = try {
            fetchRemote()
        } catch (e: IOException) {
            null
        }
        if (fresh == null) {
            emit(FeedUpdate.Offline(hasCache = cached != null))
        } else {
            cache.write(fresh)
            if (fresh != cached) emit(FeedUpdate.Fresh(fresh))
        }
    }
}
`,
    hint: 'Let `try` produce the fresh list or `null`, and do all emitting after it. Compare `fresh` with the cached list before the last emit.',
    explanation:
      'Cache-then-network is a sequence of emissions, which is exactly what a cold `flow { }` expresses: the collector first receives what is on disk, then the refreshed data, without the repository owning any scope. Fetching first and falling back to the cache only on failure looks similar but makes every launch wait for the network. Writing to the cache before emitting `Fresh` means a collector that reacts by reading the cache sees the new data. Catching only `IOException` keeps cancellation and programming errors visible, and emitting outside the `try` stops a collector failure from being reported as "offline". Skipping `Fresh` when nothing changed saves a full list re-render.',
    rules: [
      { label: 'Builds the stream with flow { }', type: 'mustContain', pattern: '\\bflow\\s*(<\\s*FeedUpdate\\s*>\\s*)?\\{', regex: true },
      { label: 'Emits the cached copy before calling fetchRemote', type: 'mustContain', pattern: 'emit\\s*\\(\\s*(FeedUpdate\\.)?Cached\\s*\\([\\s\\S]*fetchRemote\\s*\\(', regex: true },
      { label: 'Writes the fresh list back to the cache', type: 'mustContain', pattern: 'cache\\s*\\.\\s*write\\s*\\(', regex: true },
      { label: 'Reports Offline by catching IOException', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*(java\\.io\\.)?IOException\\s*\\)', regex: true },
      { label: 'Never catches Exception / Throwable (cancellation must propagate)', type: 'mustNotContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*(Exception|Throwable)\\s*\\)|runCatching', regex: true },
    ],
  },
  {
    id: 'kotlin-build-export-sink-use-block',
    number: 41,
    language: 'kotlin',
    kind: 'build',
    title: 'Export Sink Use Block',
    difficulty: 'Easy',
    topic: 'Data & Persistence',
    statement:
      'A habit tracker exports its log through a `LineSink` (a stand-in for a file writer; it extends `java.io.Closeable`). Implement `exportLines(open, lines)`:\n\n- call `open()` exactly once to get the sink,\n- write every line that is not blank, trimmed, with `writeLine`, in the original order,\n- return how many lines were written,\n- the sink must be closed exactly once, both when everything succeeds and when `writeLine` throws (the exception still propagates).\n\nUse the standard `use { }` extension for that. Do not call `close()` yourself and do not write `try` / `finally`.',
    functionSignature: 'fun exportLines(open: () -> LineSink, lines: List<String>): Int',
    buggyCode: `import java.io.Closeable

interface LineSink : Closeable {
    fun writeLine(line: String)
}

fun exportLines(open: () -> LineSink, lines: List<String>): Int {
    val sink = open()
    // TODO: write the non-blank lines (trimmed) and make sure the sink always gets closed
    return 0
}
`,
    solution: `import java.io.Closeable

interface LineSink : Closeable {
    fun writeLine(line: String)
}

fun exportLines(open: () -> LineSink, lines: List<String>): Int =
    open().use { sink ->
        var written = 0
        for (line in lines) {
            if (line.isBlank()) continue
            sink.writeLine(line.trim())
            written++
        }
        written
    }
`,
    hint: '`closeable.use { it -> ... }` returns the value of its lambda and closes the resource afterwards, whatever happens inside.',
    explanation:
      '`use` is Kotlin\'s try-with-resources: it runs the block, closes the receiver in a `finally`, and if both the block and `close()` throw it keeps the original exception and attaches the second one as suppressed. A hand-written `try` / `finally` usually loses one of the two, and a version without `finally` leaks the file handle on the first failed write. Because `use` is an inline function that returns the lambda result, the count can be computed inside the block and returned directly. The work is a single pass over the lines.',
    rules: [
      { label: 'Closes the sink with use { }', type: 'mustContain', pattern: '\\.use\\s*\\{', regex: true },
      { label: 'Writes through writeLine', type: 'mustContain', pattern: '(\\.|::)\\s*writeLine\\b', regex: true },
      { label: 'Skips blank lines', type: 'mustContain', pattern: 'isBlank|isNotBlank|isNullOrBlank|ifBlank|isNotEmpty|isEmpty', regex: true },
      { label: 'Does not call close() by hand', type: 'mustNotContain', pattern: '\\.close\\s*\\(\\s*\\)', regex: true },
      { label: 'No try / finally', type: 'mustNotContain', pattern: '\\bfinally\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-build-int-preference-delegate',
    number: 42,
    language: 'kotlin',
    kind: 'build',
    title: 'Int Preference Delegate',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'Settings of an e-book reader live in a `KeyValueStore` (a SharedPreferences stand-in). Make them readable as ordinary properties with a **property delegate**.\n\n`IntPref(store, default, key = null)` must implement `ReadWriteProperty<Any?, Int>`:\n\n- the storage key is `key`, or the **name of the delegated property** (`property.name`) when `key` is `null`,\n- `getValue` returns `store.getInt(k) ?: default`; every read goes to the store, nothing is cached in the delegate,\n- `setValue` calls `store.putInt(k, value)`.\n\nThen delegate both properties of `ReaderSettings` with `by IntPref(...)`: `fontSize` with default `16` and no explicit key, `launchCount` with default `0` and the key `"launch_count"`.',
    functionSignature: 'class IntPref(store: KeyValueStore, default: Int, key: String? = null) : ReadWriteProperty<Any?, Int>',
    buggyCode: `import kotlin.properties.ReadWriteProperty
import kotlin.reflect.KProperty

interface KeyValueStore {
    fun getInt(key: String): Int?
    fun putInt(key: String, value: Int)
}

// TODO: implement ReadWriteProperty<Any?, Int> (getValue / setValue)
class IntPref(
    private val store: KeyValueStore,
    private val default: Int,
    private val key: String? = null,
)

class ReaderSettings(store: KeyValueStore) {
    // TODO: delegate both properties to IntPref
    var fontSize: Int = 16
    var launchCount: Int = 0
}
`,
    solution: `import kotlin.properties.ReadWriteProperty
import kotlin.reflect.KProperty

interface KeyValueStore {
    fun getInt(key: String): Int?
    fun putInt(key: String, value: Int)
}

class IntPref(
    private val store: KeyValueStore,
    private val default: Int,
    private val key: String? = null,
) : ReadWriteProperty<Any?, Int> {
    override fun getValue(thisRef: Any?, property: KProperty<*>): Int =
        store.getInt(key ?: property.name) ?: default

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: Int) {
        store.putInt(key ?: property.name, value)
    }
}

class ReaderSettings(store: KeyValueStore) {
    var fontSize: Int by IntPref(store, default = 16)
    var launchCount: Int by IntPref(store, default = 0, key = "launch_count")
}
`,
    hint: 'Both delegate functions receive a `KProperty<*>`; its `name` is the name of the property written before `by`.',
    explanation:
      'A delegated property forwards every read and write to `getValue` / `setValue` of the object after `by`, so the storage logic is written once and each setting becomes a one-line declaration. Implementing `ReadWriteProperty<Any?, Int>` gives the compiler-checked signatures of both operators. The `KProperty` argument is what allows the property name to serve as the default key, removing a whole class of copy-paste bugs where two settings share one key string. Reading through the store on every access keeps the property truthful when another component writes the same key; a cached field in the delegate would go stale.',
    rules: [
      { label: 'IntPref implements ReadWriteProperty<Any?, Int>', type: 'mustContain', pattern: ':\\s*ReadWriteProperty\\s*<\\s*Any\\?\\s*,\\s*Int\\s*>', regex: true },
      { label: 'getValue reads the store and falls back to default', type: 'mustContain', pattern: 'getInt\\s*\\([\\s\\S]{0,80}?\\)\\s*\\?:\\s*(this\\.)?default\\b', regex: true },
      { label: 'Uses the property name as the key when none is given', type: 'mustContain', pattern: '\\?:\\s*\\w+\\.name\\b|\\w+\\.name\\b', regex: true },
      { label: 'setValue writes through putInt', type: 'mustContain', pattern: 'putInt\\s*\\(', regex: true },
      { label: 'Both settings are delegated with by IntPref(...)', type: 'mustContain', pattern: 'by\\s+IntPref\\s*\\([\\s\\S]*by\\s+IntPref\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-build-draft-autosave-job',
    number: 43,
    language: 'kotlin',
    kind: 'build',
    title: 'Draft Autosave Job',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'A notes editor saves the draft once the user has stopped typing for `quietMs`. All calls come from the main thread. Implement `DraftAutosaver(scope, quietMs, save)`:\n\n- keep the scheduled save in a `private var` of type `Job?`,\n- `onTextChanged(text)`: `cancel()` the previous job (whether it is still waiting or already saving), then `scope.launch { delay(quietMs); save(text) }` and remember the new job,\n- `discard()`: cancel the scheduled save, if any, and forget it,\n- `hasPendingSave`: `true` while the remembered job is active.\n\nOnly the latest text may ever be saved. No `GlobalScope`, timers, threads or `runBlocking`.',
    functionSignature: 'class DraftAutosaver(scope: CoroutineScope, quietMs: Long, save: suspend (String) -> Unit) { val hasPendingSave: Boolean; fun onTextChanged(text: String); fun discard() }',
    buggyCode: `import kotlinx.coroutines.*

class DraftAutosaver(
    private val scope: CoroutineScope,
    private val quietMs: Long,
    private val save: suspend (String) -> Unit,
) {
    // TODO: remember the scheduled save as a Job?

    val hasPendingSave: Boolean get() = TODO()

    fun onTextChanged(text: String) {
        // TODO: cancel the previous save, schedule a new one after quietMs
        TODO()
    }

    fun discard() {
        TODO()
    }
}
`,
    solution: `import kotlinx.coroutines.*

class DraftAutosaver(
    private val scope: CoroutineScope,
    private val quietMs: Long,
    private val save: suspend (String) -> Unit,
) {
    private var pending: Job? = null

    val hasPendingSave: Boolean get() = pending?.isActive == true

    fun onTextChanged(text: String) {
        pending?.cancel()
        pending = scope.launch {
            delay(quietMs)
            save(text)
        }
    }

    fun discard() {
        pending?.cancel()
        pending = null
    }
}
`,
    hint: 'One nullable `Job` field is all the state you need: cancel it, replace it with the job returned by `scope.launch { ... }`.',
    explanation:
      'Cancel-and-relaunch is the imperative form of debounce: each keystroke cancels the coroutine that is sitting in `delay` and starts a new countdown, so only the last text survives the quiet period. Forgetting the `cancel()` schedules one save per keystroke, and they all fire, possibly out of order. Because the job is launched in the injected `scope`, it dies with the screen and tests can drive it with a test scope. `delay` is cancellable, so the cancelled coroutine never reaches `save`; a save that is already running is cancelled at its next suspension point. `Job.isActive` gives the pending flag for free.',
    rules: [
      { label: 'Remembers the scheduled save as a Job?', type: 'mustContain', pattern: 'Job\\?', regex: true },
      { label: 'onTextChanged cancels the previous job before launching a new one', type: 'mustContain', pattern: 'fun\\s+onTextChanged[^}]*?(\\.cancel\\s*\\(|\\bdiscard\\s*\\()[\\s\\S]*?launch', regex: true },
      { label: 'Launches the save in the injected scope', type: 'mustContain', pattern: 'scope\\s*\\.\\s*launch\\s*(\\(.*\\))?\\s*\\{', regex: true },
      { label: 'Waits delay(quietMs) before saving', type: 'mustContain', pattern: 'delay\\s*\\(\\s*quietMs\\s*\\)', regex: true },
      { label: 'No GlobalScope, runBlocking, timers or sleeping threads', type: 'mustNotContain', pattern: 'GlobalScope|runBlocking|Thread\\.sleep|Timer\\s*\\(|Handler\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-build-ledger-cursor-sequence',
    number: 44,
    language: 'kotlin',
    kind: 'build',
    title: 'Ledger Cursor Sequence',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'A budgeting app reads its local ledger table page by page through `readPage(offset, limit)`. Callers want to write `allRows(...).filter { ... }.take(20)` without loading the whole table. Implement `allRows(pageSize, readPage)` with the `sequence { }` builder:\n\n- `require(pageSize > 0)` when the function is called,\n- nothing is read until the sequence is iterated,\n- pages are requested as `readPage(0, pageSize)`, `readPage(pageSize, pageSize)`, ... and their rows are yielded in order (`yieldAll` or `yield`),\n- a page with fewer than `pageSize` rows (including an empty one) is the last: after yielding it, never request another page,\n- if the consumer stops early, no further page is read.\n\nDo not collect the rows into a list first.',
    functionSignature: 'fun allRows(pageSize: Int, readPage: (offset: Int, limit: Int) -> List<LedgerRow>): Sequence<LedgerRow>',
    buggyCode: `data class LedgerRow(val id: Long, val cents: Long)

fun allRows(pageSize: Int, readPage: (offset: Int, limit: Int) -> List<LedgerRow>): Sequence<LedgerRow> {
    // TODO: a lazy sequence { } that pulls one page at a time
    return emptySequence()
}
`,
    solution: `data class LedgerRow(val id: Long, val cents: Long)

fun allRows(pageSize: Int, readPage: (offset: Int, limit: Int) -> List<LedgerRow>): Sequence<LedgerRow> {
    require(pageSize > 0) { "pageSize must be positive" }
    return sequence {
        var offset = 0
        while (true) {
            val page = readPage(offset, pageSize)
            yieldAll(page)
            if (page.size < pageSize) break
            offset += page.size
        }
    }
}
`,
    hint: 'Inside `sequence { }` the code pauses at every `yield` / `yieldAll` until the consumer asks for more, so a plain `while (true)` loop with a `break` on a short page is enough.',
    explanation:
      'The `sequence { }` builder turns ordinary sequential code into a lazy generator: the body is suspended at each `yield` and resumed only when the consumer requests the next element. A caller that takes twenty rows therefore triggers exactly as many `readPage` calls as needed, while an eager loop that fills a list reads the whole table first and holds it in memory. A short page proves the table is exhausted, so stopping there saves the final empty query that an `isEmpty()` check would cost. Doing the `require` outside the builder reports a bad argument at the call site instead of at first iteration. Memory use is one page at a time.',
    rules: [
      { label: 'Builds the result lazily with sequence { }', type: 'mustContain', pattern: '\\bsequence\\s*(<\\s*\\w+\\s*>\\s*)?\\{', regex: true },
      { label: 'Yields the rows of each page', type: 'mustContain', pattern: '\\byieldAll\\s*\\(|\\byield\\s*\\(', regex: true },
      { label: 'Stops after a page shorter than pageSize', type: 'mustContain', pattern: '[A-Za-z_)]\\s*(<|==|>=|!=)\\s*pageSize\\b|\\bpageSize\\s*(>|==|<=|!=)\\s*[A-Za-z_]', regex: true },
      { label: 'Does not collect all rows into a list first', type: 'mustNotContain', pattern: 'mutableListOf|ArrayList|buildList|asSequence\\s*\\(', regex: true },
    ],
  },
  // ------------------------------------------------------------ Kotlin Idioms
  {
    id: 'kotlin-build-observable-theme-setting',
    number: 45,
    language: 'kotlin',
    kind: 'build',
    title: 'Observable Theme Setting',
    difficulty: 'Easy',
    topic: 'Kotlin Idioms',
    statement:
      'The appearance screen of a reading app holds two settings that need behaviour on assignment. Use the standard delegates from `kotlin.properties.Delegates` instead of hand-written setters:\n\n- `theme` starts as `Theme.SYSTEM` and is declared with `Delegates.observable`: after an assignment that **changes** the value, call `onThemeChanged(old, new)`; assigning the value it already has must not call it.\n- `fontScale` starts as `1.0f` and is declared with `Delegates.vetoable`: an assignment is accepted only when the new value lies in `0.5f..2.0f` (both ends included); otherwise the old value stays.\n\nNo custom `set(value)` blocks and no backing `field`.',
    functionSignature: 'class ThemeSettings(onThemeChanged: (old: Theme, new: Theme) -> Unit) { var theme: Theme; var fontScale: Float }',
    buggyCode: `import kotlin.properties.Delegates

enum class Theme { SYSTEM, LIGHT, DARK }

class ThemeSettings(private val onThemeChanged: (old: Theme, new: Theme) -> Unit) {
    // TODO: Delegates.observable - report real changes through onThemeChanged
    var theme: Theme = Theme.SYSTEM

    // TODO: Delegates.vetoable - only accept 0.5f..2.0f
    var fontScale: Float = 1.0f
}
`,
    solution: `import kotlin.properties.Delegates

enum class Theme { SYSTEM, LIGHT, DARK }

class ThemeSettings(private val onThemeChanged: (old: Theme, new: Theme) -> Unit) {
    var theme: Theme by Delegates.observable(Theme.SYSTEM) { _, old, new ->
        if (old != new) onThemeChanged(old, new)
    }

    var fontScale: Float by Delegates.vetoable(1.0f) { _, _, new ->
        new in 0.5f..2.0f
    }
}
`,
    hint: 'Both delegates take the initial value and a lambda `(property, oldValue, newValue)`. For `vetoable` the lambda returns whether the assignment is allowed.',
    explanation:
      '`Delegates.observable` stores the value and invokes its callback after every assignment, which replaces the usual "custom setter with a backing field" boilerplate. The callback also fires when the same value is assigned again, so the `old != new` check is what prevents a redundant theme re-application. `Delegates.vetoable` runs its callback before the assignment and keeps the old value when the lambda returns `false`, a compact way to enforce a range without throwing. Both are plain library classes implementing `ReadWriteProperty`, so they cost one small object per property.',
    rules: [
      { label: 'theme uses Delegates.observable', type: 'mustContain', pattern: 'by\\s+(Delegates\\s*\\.\\s*)?observable\\s*\\(', regex: true },
      { label: 'fontScale uses Delegates.vetoable', type: 'mustContain', pattern: 'by\\s+(Delegates\\s*\\.\\s*)?vetoable\\s*\\(', regex: true },
      { label: 'Calls onThemeChanged from the observer', type: 'mustContain', pattern: 'onThemeChanged\\s*\\(', regex: true },
      { label: 'Compares old and new so an unchanged theme is not reported', type: 'mustContain', pattern: '[!=]=', regex: true },
      { label: 'No hand-written setter', type: 'mustNotContain', pattern: '\\bset\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-build-money-operators',
    number: 46,
    language: 'kotlin',
    kind: 'build',
    title: 'Money Operators',
    difficulty: 'Easy',
    topic: 'Kotlin Idioms',
    statement:
      'A split-the-bill app wants to write `price * 3 + tip` and `total > budget` with its `Money` type (integer cents plus a currency code). Add **operator** functions to `Money`:\n\n- `plus(other: Money): Money` adds the cents,\n- `times(quantity: Int): Money` multiplies the cents,\n- `compareTo(other: Money): Int` orders by cents so that `<`, `>`, `<=`, `>=` work (declare it as an `operator fun`, or implement `Comparable<Money>`),\n- `plus` and `compareTo` must throw `IllegalArgumentException` when the currencies differ (use `require`).\n\nKeep `Money` an immutable `data class`: every operator returns a new value.',
    functionSignature: 'data class Money(val cents: Long, val currency: String) { operator fun plus(other: Money): Money; operator fun times(quantity: Int): Money; operator fun compareTo(other: Money): Int }',
    buggyCode: `data class Money(val cents: Long, val currency: String) {
    // TODO: operator plus(other: Money), times(quantity: Int), compareTo(other: Money)
    // TODO: mixing currencies must fail with IllegalArgumentException
}
`,
    solution: `data class Money(val cents: Long, val currency: String) : Comparable<Money> {
    operator fun plus(other: Money): Money {
        requireSameCurrency(other)
        return copy(cents = cents + other.cents)
    }

    operator fun times(quantity: Int): Money = copy(cents = cents * quantity)

    override operator fun compareTo(other: Money): Int {
        requireSameCurrency(other)
        return cents.compareTo(other.cents)
    }

    private fun requireSameCurrency(other: Money) {
        require(currency == other.currency) { "Currency mismatch: " + currency + " vs " + other.currency }
    }
}
`,
    hint: 'The compiler rewrites `a + b` to `a.plus(b)`, `a * n` to `a.times(n)` and `a < b` to `a.compareTo(b) < 0`, but only for functions marked `operator` (or inherited from `Comparable`).',
    explanation:
      'Operator overloading in Kotlin is a naming convention: a function called `plus`, `times` or `compareTo` with the `operator` modifier is what the `+`, `*` and comparison symbols compile to. Without the modifier the functions exist but `price * 3 + tip` does not compile. Returning `copy(...)` keeps the value type immutable, which is what you want for money shared between screens. The `require` guard turns the classic "added euros to dollars" bug into an immediate `IllegalArgumentException` instead of a wrong total. Implementing `Comparable<Money>` additionally unlocks `maxOf`, `sorted()` and ranges.',
    rules: [
      { label: 'Defines operator fun plus', type: 'mustContain', pattern: 'operator\\s+fun\\s+(Money\\s*\\.\\s*)?plus\\s*\\(', regex: true },
      { label: 'Defines operator fun times', type: 'mustContain', pattern: 'operator\\s+fun\\s+(Money\\s*\\.\\s*)?times\\s*\\(', regex: true },
      { label: 'Defines compareTo as an operator (or a Comparable override)', type: 'mustContain', pattern: '(operator|override)\\s+(operator\\s+)?fun\\s+(Money\\s*\\.\\s*)?compareTo\\s*\\(', regex: true },
      { label: 'Rejects mixed currencies with require / IllegalArgumentException', type: 'mustContain', pattern: 'require\\s*\\(|IllegalArgumentException', regex: true },
    ],
  },
  {
    id: 'kotlin-build-notification-builder-dsl',
    number: 47,
    language: 'kotlin',
    kind: 'build',
    title: 'Notification Builder DSL',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      'The push module of a parcel app should describe notifications with a small type-safe DSL, used like this: `notification { title = "Parcel out for delivery"; body = "Arrives before 18:00"; action { label = "Track"; deepLink = "app://parcels/42" } }`.\n\nBuild it:\n\n- `fun notification(block: NotificationBuilder.() -> Unit): Notification` creates a builder, runs the **lambda with receiver** on it and returns `build()`.\n- `NotificationBuilder.action(block: ActionBuilder.() -> Unit)` builds an `Action` the same way and appends it; actions keep their declaration order.\n- `NotificationBuilder.build()` throws `IllegalArgumentException` when `title` is blank (use `require`) and passes a read-only snapshot of the actions.\n- Declare a `@DslMarker` annotation class and annotate **both** builders with it, so `title = ...` cannot be written by accident inside `action { }`.',
    functionSignature: 'fun notification(block: NotificationBuilder.() -> Unit): Notification',
    buggyCode: `data class Action(val label: String, val deepLink: String)
data class Notification(val title: String, val body: String, val actions: List<Action>)

// TODO: declare a @DslMarker annotation and put it on both builders

class ActionBuilder {
    var label: String = ""
    var deepLink: String = ""
    fun build(): Action = Action(label, deepLink)
}

class NotificationBuilder {
    var title: String = ""
    var body: String = ""

    // TODO: fun action(block: ActionBuilder.() -> Unit)

    fun build(): Notification = TODO()
}

// TODO: fun notification(block: NotificationBuilder.() -> Unit): Notification
`,
    solution: `data class Action(val label: String, val deepLink: String)
data class Notification(val title: String, val body: String, val actions: List<Action>)

@DslMarker
annotation class NotificationDsl

@NotificationDsl
class ActionBuilder {
    var label: String = ""
    var deepLink: String = ""
    fun build(): Action = Action(label, deepLink)
}

@NotificationDsl
class NotificationBuilder {
    var title: String = ""
    var body: String = ""
    private val actions = mutableListOf<Action>()

    fun action(block: ActionBuilder.() -> Unit) {
        actions += ActionBuilder().apply(block).build()
    }

    fun build(): Notification {
        require(title.isNotBlank()) { "title is required" }
        return Notification(title, body, actions.toList())
    }
}

fun notification(block: NotificationBuilder.() -> Unit): Notification =
    NotificationBuilder().apply(block).build()
`,
    hint: 'A parameter of type `Builder.() -> Unit` can be handed straight to `apply`: `Builder().apply(block).build()`.',
    explanation:
      'A function type with receiver, `NotificationBuilder.() -> Unit`, makes the builder the implicit `this` inside the lambda, which is why `title = ...` needs no qualifier. A plain `(NotificationBuilder) -> Unit` would force `it.title = ...` on every line and is not a DSL. Nested lambdas see every outer receiver as well, so without help `title = "x"` inside `action { }` would silently change the notification; a `@DslMarker` annotation on both builders makes the compiler reject implicit access to the outer receiver. `apply(block)` runs the lambda on a fresh builder and returns it, and `toList()` hands out a snapshot so the built object cannot be changed through the builder afterwards.',
    rules: [
      { label: 'Declares a @DslMarker annotation class', type: 'mustContain', pattern: '@DslMarker[\\s\\S]{0,200}?annotation\\s+class\\s+\\w+', regex: true },
      { label: 'notification takes a lambda with NotificationBuilder as receiver', type: 'mustContain', pattern: '\\w+\\s*:\\s*NotificationBuilder\\s*\\.\\s*\\(\\s*\\)\\s*->\\s*Unit', regex: true },
      { label: 'action takes a lambda with ActionBuilder as receiver', type: 'mustContain', pattern: '\\w+\\s*:\\s*ActionBuilder\\s*\\.\\s*\\(\\s*\\)\\s*->\\s*Unit', regex: true },
      { label: 'Rejects a blank title with require / IllegalArgumentException', type: 'mustContain', pattern: 'require\\s*\\(|IllegalArgumentException', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-event-pipe-variance',
    number: 48,
    language: 'kotlin',
    kind: 'build',
    title: 'Event Pipe Variance',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      'An analytics module moves events from sources to sinks. `forwardClicks` wants to drain a source of `ClickEvent` into a logger that accepts any `AnalyticsEvent`, which is perfectly safe, yet the starter does not compile because both interfaces are invariant.\n\n- Give `EventSource` **declaration-site** covariance (`out T`) and `EventSink` contravariance (`in T`); change the interface declarations, not the call sites.\n- Implement `drain(source, sink)`: call `source.next()` repeatedly, pass every non-null event to `sink.accept`, stop at the first `null`, and return the number of events moved.\n- `forwardClicks` must stay exactly as it is and compile without casts or `@Suppress`.',
    functionSignature: 'interface EventSource<out T> { fun next(): T? }; interface EventSink<in T> { fun accept(event: T) }; fun <T : Any> drain(source: EventSource<T>, sink: EventSink<T>): Int',
    buggyCode: `open class AnalyticsEvent(val name: String)
class ClickEvent(val targetId: String) : AnalyticsEvent("click")

// TODO: add the right variance to both interfaces
interface EventSource<T> {
    fun next(): T?
}

interface EventSink<T> {
    fun accept(event: T)
}

fun <T : Any> drain(source: EventSource<T>, sink: EventSink<T>): Int {
    // TODO: move events until next() returns null, return how many were moved
    TODO()
}

// Does not compile until the variance is right. Do not change this function.
fun forwardClicks(clicks: EventSource<ClickEvent>, log: EventSink<AnalyticsEvent>): Int =
    drain(clicks, log)
`,
    solution: `open class AnalyticsEvent(val name: String)
class ClickEvent(val targetId: String) : AnalyticsEvent("click")

interface EventSource<out T> {
    fun next(): T?
}

interface EventSink<in T> {
    fun accept(event: T)
}

fun <T : Any> drain(source: EventSource<T>, sink: EventSink<T>): Int {
    var moved = 0
    while (true) {
        val event = source.next() ?: break
        sink.accept(event)
        moved++
    }
    return moved
}

fun forwardClicks(clicks: EventSource<ClickEvent>, log: EventSink<AnalyticsEvent>): Int =
    drain(clicks, log)
`,
    hint: 'A type that only returns `T` can be `out T`; a type that only takes `T` as a parameter can be `in T`.',
    explanation:
      'Generics are invariant by default: `EventSource<ClickEvent>` is not an `EventSource<AnalyticsEvent>` even though every click is an analytics event. Marking the parameter `out` states that the interface only produces `T`, which makes that substitution safe; marking it `in` states that it only consumes `T`, so a sink of the general type can stand in for a sink of the specific one. With both in place the compiler infers `T = AnalyticsEvent` (or `ClickEvent`) for `drain` and no cast is needed. Declaration-site variance fixes this once for every user of the interfaces, where use-site projections would have to be repeated in each signature. The loop itself is a null-terminated read: `?: break` ends it.',
    rules: [
      { label: 'EventSource is covariant: EventSource<out T>', type: 'mustContain', pattern: 'interface\\s+EventSource\\s*<\\s*out\\s+T\\b', regex: true },
      { label: 'EventSink is contravariant: EventSink<in T>', type: 'mustContain', pattern: 'interface\\s+EventSink\\s*<\\s*in\\s+T\\b', regex: true },
      { label: 'drain stops at the first null from next()', type: 'mustContain', pattern: '\\?:\\s*(break|return)|[!=]=\\s*null|generateSequence|\\?\\.let', regex: true },
      { label: 'No casts or suppressions to force the types', type: 'mustNotContain', pattern: '\\bas\\s+Event(Source|Sink)|@Suppress|UNCHECKED_CAST', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  // ------------------------------------------------------------ Compose-style State
  {
    id: 'kotlin-build-state-cell-property-delegate',
    number: 49,
    language: 'kotlin',
    kind: 'build',
    title: 'State Cell Property Delegate',
    difficulty: 'Medium',
    topic: 'Compose-style State',
    statement:
      'Compose lets you write `var count by mutableStateOf(0)`: plain property syntax on top of an observable holder. Build the same idea without Compose.\n\n`StateCell<T>(initial)`:\n\n- `value` can be read and written. A write that **changes** the value stores it and then calls every registered observer with the new value; a write of an equal value (`==`) does nothing at all.\n- `observe` is already written.\n- Add `operator fun getValue(thisRef: Any?, property: KProperty<*>): T` and `operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T)` that read and write `value`, so a cell can be used after `by`.\n\nThen make `CounterScreen.count` a delegated property backed by `countCell` (`var count: Int by countCell`), so `increment()` notifies the observers of the cell.',
    functionSignature: 'class StateCell<T>(initial: T) { var value: T; fun observe(observer: (T) -> Unit): () -> Unit; operator fun getValue(...): T; operator fun setValue(...) }',
    buggyCode: `import kotlin.reflect.KProperty

class StateCell<T>(initial: T) {
    private val observers = mutableListOf<(T) -> Unit>()

    // TODO: notify the observers from the setter, but only when the value really changes
    var value: T = initial

    /** Registers an observer and returns a function that removes it again. */
    fun observe(observer: (T) -> Unit): () -> Unit {
        observers += observer
        return { observers.remove(observer) }
    }

    // TODO: operator getValue / setValue so that a cell can back a property with by
}

class CounterScreen {
    val countCell = StateCell(0)

    // TODO: delegate to countCell
    var count: Int = 0

    fun increment() {
        count += 1
    }
}
`,
    solution: `import kotlin.reflect.KProperty

class StateCell<T>(initial: T) {
    private val observers = mutableListOf<(T) -> Unit>()

    var value: T = initial
        set(next) {
            if (field == next) return
            field = next
            observers.toList().forEach { it(next) }
        }

    fun observe(observer: (T) -> Unit): () -> Unit {
        observers += observer
        return { observers.remove(observer) }
    }

    operator fun getValue(thisRef: Any?, property: KProperty<*>): T = value

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        this.value = value
    }
}

class CounterScreen {
    val countCell = StateCell(0)

    var count: Int by countCell

    fun increment() {
        count += 1
    }
}
`,
    hint: 'Any class with `operator fun getValue(thisRef, property)` and `operator fun setValue(thisRef, property, value)` can stand after `by`; no interface is required.',
    explanation:
      'Property delegation is resolved by convention: `var count by cell` compiles to calls of `cell.getValue(...)` and `cell.setValue(...)`, which is how Compose gives `MutableState` property syntax. Routing both operators through the single `value` property keeps one place where change detection happens. The equality check in the setter is the important part of any snapshot-style state: without it every assignment of the same value wakes all observers, the equivalent of needless recomposition. Iterating over a copy of the observer list (`toList()`) lets an observer unregister itself while being notified. A write costs O(observers) only when the value changed.',
    rules: [
      { label: 'Defines operator fun getValue', type: 'mustContain', pattern: 'operator\\s+fun\\s*(<\\s*T\\s*>\\s*)?(StateCell\\s*<\\s*T\\s*>\\s*\\.\\s*)?getValue\\s*\\(', regex: true },
      { label: 'Defines operator fun setValue', type: 'mustContain', pattern: 'operator\\s+fun\\s*(<\\s*T\\s*>\\s*)?(StateCell\\s*<\\s*T\\s*>\\s*\\.\\s*)?setValue\\s*\\(', regex: true },
      { label: 'Compares old and new value so an equal write notifies nobody', type: 'mustContain', pattern: '[!=]=|\\.equals\\s*\\(', regex: true },
      { label: 'count is a delegated property (var count by ...)', type: 'mustContain', pattern: 'var\\s+count\\s*(:\\s*Int\\s*)?by\\s+\\w+', regex: true },
      { label: 'Observers are called with the new value', type: 'mustContain', pattern: 'forEach\\s*[({]|for\\s*\\(', regex: true },
    ],
  },
  // ------------------------------------------------------------ Lifecycle
  {
    id: 'kotlin-build-screen-scope-owner',
    number: 50,
    language: 'kotlin',
    kind: 'build',
    title: 'Screen Scope Owner',
    difficulty: 'Easy',
    topic: 'Lifecycle',
    statement:
      'Without the Android libraries there is no `viewModelScope`. Build the stand-in every screen model of a fitness app inherits from, `ScreenModel(dispatcher)`:\n\n- `scope` is a `CoroutineScope` made of a `SupervisorJob()` plus the injected `dispatcher`, so one failing child coroutine does not cancel its siblings and tests can pass their own dispatcher,\n- `clear()` is called when the screen is gone for good: it sets `isCleared` to `true`, cancels the scope and then calls `onCleared()`,\n- `clear()` is idempotent: a second call does nothing (in particular `onCleared()` runs only once).\n\nDo not use `GlobalScope` and do not hard-code a dispatcher from `Dispatchers`.',
    functionSignature: 'open class ScreenModel(dispatcher: CoroutineDispatcher) { protected val scope: CoroutineScope; var isCleared: Boolean; fun clear(); protected open fun onCleared() }',
    buggyCode: `import kotlinx.coroutines.*

open class ScreenModel(dispatcher: CoroutineDispatcher) {
    // TODO: a scope built from SupervisorJob() + dispatcher
    protected val scope: CoroutineScope get() = TODO()

    var isCleared: Boolean = false
        private set

    fun clear() {
        // TODO: idempotent - cancel the scope, then onCleared()
    }

    protected open fun onCleared() {}
}
`,
    solution: `import kotlinx.coroutines.*

open class ScreenModel(dispatcher: CoroutineDispatcher) {
    protected val scope: CoroutineScope = CoroutineScope(SupervisorJob() + dispatcher)

    var isCleared: Boolean = false
        private set

    fun clear() {
        if (isCleared) return
        isCleared = true
        scope.cancel()
        onCleared()
    }

    protected open fun onCleared() {}
}
`,
    hint: 'A coroutine context is assembled with `+`: `CoroutineScope(SupervisorJob() + dispatcher)`. `scope.cancel()` cancels the job and every coroutine launched in it.',
    explanation:
      'A screen model needs one scope whose lifetime equals the screen: everything launched in it is cancelled by a single `scope.cancel()` when the screen is finished, which is exactly what `viewModelScope` does. `SupervisorJob` matters because with a plain `Job` the first child that throws cancels the parent and with it every other request of the screen. Injecting the dispatcher instead of naming `Dispatchers.Main` keeps the class testable on the JVM. The `isCleared` guard makes teardown safe to call from more than one path (back press and process shutdown) without running `onCleared` twice.',
    rules: [
      { label: 'Creates its own CoroutineScope', type: 'mustContain', pattern: 'CoroutineScope\\s*\\(', regex: true },
      { label: 'Uses a SupervisorJob', type: 'mustContain', pattern: 'SupervisorJob\\s*\\(', regex: true },
      { label: 'Combines the job with the injected dispatcher', type: 'mustContain', pattern: '\\+\\s*dispatcher\\b|\\bdispatcher\\s*\\+', regex: true },
      { label: 'clear() cancels the scope / job', type: 'mustContain', pattern: '\\.cancel\\s*\\(|cancelChildren\\s*\\(', regex: true },
      { label: 'No GlobalScope or hard-coded Dispatchers', type: 'mustNotContain', pattern: 'GlobalScope|Dispatchers\\s*\\.', regex: true },
    ],
  },
  // @@NEXT@@
];
