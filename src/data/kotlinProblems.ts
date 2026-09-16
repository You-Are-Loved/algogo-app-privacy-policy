// Kotlin / Android practice — mobile-first build and debug problems graded by the rules engine; compile-checked with kotlinc at authoring time. `language: 'kotlin'`.
// Shares the BugFixProblem shape: `kind: 'build'` problems show a skeleton in
// the editor and grade the user's implementation against tests (Python /
// JavaScript) or rules (Java / Swift / Kotlin). See bugFixes.ts for the type.

import type { BugFixProblem } from './bugFixes';

// Kotlin / Android batch 2 — build 16–30, debug 11–20.
// Topics: Compose-style State ×6, Lifecycle ×5, Networking Layer ×5, Testing & DI ×4, Performance ×5.
// No Android SDK at compile time: every Android concept is modelled with a tiny stand-in inside the snippet.

export const kotlinProblems: BugFixProblem[] = [
  // ===================================================================== BUILD
  {
    id: 'kotlin-build-podcast-player-state-holder',
    number: 1,
    language: 'kotlin',
    kind: 'build',
    title: 'Podcast Player State Holder',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      'Implement `PlayerStateHolder`, the state owner behind a podcast mini-player. Expose `state: StateFlow<PlayerState>` backed by a **private** `MutableStateFlow` (never leak the mutable flow).\n\n- `play(episodeId)`: if the same episode is already loaded, just set `isPlaying = true`; otherwise start that episode from `positionMs = 0` with `isPlaying = true`.\n- `pause()`: set `isPlaying = false`, keep the position.\n- `seek(positionMs)`: store the position, clamped to `>= 0`.\n\nEvery change must produce a **new** `PlayerState` via `copy` (use `update { }` or assign `value`).',
    functionSignature: 'class PlayerStateHolder { val state: StateFlow<PlayerState>; fun play(episodeId: String); fun pause(); fun seek(positionMs: Long) }',
    buggyCode: `import kotlinx.coroutines.flow.*

data class PlayerState(
    val episodeId: String? = null,
    val isPlaying: Boolean = false,
    val positionMs: Long = 0L,
)

class PlayerStateHolder {
    // TODO: back this with a private MutableStateFlow
    val state: StateFlow<PlayerState> get() = TODO()

    fun play(episodeId: String) { /* TODO */ }
    fun pause() { /* TODO */ }
    fun seek(positionMs: Long) { /* TODO */ }
}
`,
    solution: `import kotlinx.coroutines.flow.*

data class PlayerState(
    val episodeId: String? = null,
    val isPlaying: Boolean = false,
    val positionMs: Long = 0L,
)

class PlayerStateHolder {
    private val _state = MutableStateFlow(PlayerState())
    val state: StateFlow<PlayerState> = _state.asStateFlow()

    fun play(episodeId: String) {
        _state.update { current ->
            if (current.episodeId == episodeId) current.copy(isPlaying = true)
            else PlayerState(episodeId = episodeId, isPlaying = true, positionMs = 0L)
        }
    }

    fun pause() {
        _state.update { it.copy(isPlaying = false) }
    }

    fun seek(positionMs: Long) {
        _state.update { it.copy(positionMs = positionMs.coerceAtLeast(0L)) }
    }
}
`,
    hint: 'The pattern is `private val _state = MutableStateFlow(...)` plus `val state = _state.asStateFlow()`; mutate with `_state.update { it.copy(...) }`.',
    explanation:
      'A `MutableStateFlow` holds the single source of truth; exposing it through `asStateFlow()` stops the UI layer from writing to it. `update { }` applies a copy atomically so concurrent callers never lose an edit. Because `StateFlow` compares values with `equals`, producing a fresh data-class copy is what makes collectors actually re-render.',
    rules: [
      { label: 'Backs the state with a private MutableStateFlow', type: 'mustContain', pattern: 'private\\s+val\\s+\\w+\\s*(:\\s*MutableStateFlow<\\w+>)?\\s*=\\s*MutableStateFlow\\s*\\(', regex: true },
      { label: 'Exposes a read-only StateFlow (asStateFlow or a getter)', type: 'mustContain', pattern: 'asStateFlow\\s*\\(\\s*\\)|get\\s*\\(\\s*\\)\\s*=\\s*_\\w+', regex: true },
      { label: 'Updates state via update { } or value =', type: 'mustContain', pattern: '\\.update\\s*\\{|\\.value\\s*=', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-dock-snackbar-events',
    number: 2,
    language: 'kotlin',
    kind: 'build',
    title: 'Bike Dock One-Shot Events',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      'A bike-share screen needs one-shot UI events (a snackbar, a navigation) that must **not** be replayed to a late subscriber after rotation. Implement `DockEvents`:\n\n- `events: SharedFlow<DockEvent>` backed by a private `MutableSharedFlow` with `replay = 0` and an `extraBufferCapacity` of at least 1 so `tryEmit` never drops an event when nobody is collecting yet.\n- `suspend fun send(event)` emits with `emit`.\n- `fun trySend(event): Boolean` emits without suspending via `tryEmit`.\n\nDo not use `StateFlow` — a sticky value would re-show the snackbar.',
    functionSignature: 'class DockEvents { val events: SharedFlow<DockEvent>; suspend fun send(event: DockEvent); fun trySend(event: DockEvent): Boolean }',
    buggyCode: `import kotlinx.coroutines.flow.*

sealed class DockEvent {
    data class ShowMessage(val text: String) : DockEvent()
    data class NavigateToRide(val rideId: String) : DockEvent()
}

class DockEvents {
    // TODO: a private MutableSharedFlow with no replay and a small buffer
    val events: SharedFlow<DockEvent> get() = TODO()

    suspend fun send(event: DockEvent) { /* TODO */ }
    fun trySend(event: DockEvent): Boolean = false // TODO
}
`,
    solution: `import kotlinx.coroutines.flow.*

sealed class DockEvent {
    data class ShowMessage(val text: String) : DockEvent()
    data class NavigateToRide(val rideId: String) : DockEvent()
}

class DockEvents {
    private val _events = MutableSharedFlow<DockEvent>(replay = 0, extraBufferCapacity = 16)
    val events: SharedFlow<DockEvent> = _events.asSharedFlow()

    suspend fun send(event: DockEvent) {
        _events.emit(event)
    }

    fun trySend(event: DockEvent): Boolean = _events.tryEmit(event)
}
`,
    hint: '`MutableSharedFlow<DockEvent>(replay = 0, extraBufferCapacity = 16)` — with a zero buffer `tryEmit` returns false when there is no collector.',
    explanation:
      'A `SharedFlow` with `replay = 0` is the idiomatic channel for fire-and-forget UI events: a subscriber that attaches after the event was emitted never sees it, so a rotated screen will not re-navigate. `extraBufferCapacity` gives `tryEmit` room to succeed from non-suspending callers such as click handlers. Using `StateFlow` here is a classic bug — its conflated, sticky value replays the last event to every new collector.',
    rules: [
      { label: 'Backs events with a MutableSharedFlow', type: 'mustContain', pattern: 'MutableSharedFlow\\s*(<\\w+>)?\\s*\\(', regex: true },
      { label: 'Configures a buffer so tryEmit can succeed', type: 'mustContain', pattern: 'extraBufferCapacity\\s*=\\s*[1-9]', regex: true },
      { label: 'Uses emit / tryEmit to publish', type: 'mustContain', pattern: '\\.emit\\s*\\(|\\.tryEmit\\s*\\(', regex: true },
      { label: 'Does not use a sticky StateFlow for events', type: 'mustNotContain', pattern: 'StateFlow' },
    ],
  },
  {
    id: 'kotlin-build-recipe-search-pipeline',
    number: 3,
    language: 'kotlin',
    kind: 'build',
    title: 'Recipe Search Pipeline',
    difficulty: 'Hard',
    topic: 'Coroutines & Flow',
    statement:
      'Build the search pipeline for a recipe app. `searchResults(queries, lookup)` takes the raw text-field flow and a suspending `lookup` and returns a `Flow<List<String>>` that:\n\n1. trims each query,\n2. waits **300 ms** of silence (`debounce`) before acting,\n3. ignores a query identical to the previous one (`distinctUntilChanged`),\n4. emits `emptyList()` for a blank query **without** calling `lookup`,\n5. cancels an in-flight `lookup` when a newer query arrives (`flatMapLatest` or `mapLatest`) so stale results can never overwrite fresh ones.',
    functionSignature: 'fun searchResults(queries: Flow<String>, lookup: suspend (String) -> List<String>): Flow<List<String>>',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun searchResults(
    queries: Flow<String>,
    lookup: suspend (String) -> List<String>,
): Flow<List<String>> {
    // TODO: trim -> debounce 300 ms -> distinctUntilChanged -> latest-only lookup
    return queries.map { TODO() }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
fun searchResults(
    queries: Flow<String>,
    lookup: suspend (String) -> List<String>,
): Flow<List<String>> =
    queries
        .map { it.trim() }
        .debounce(300L)
        .distinctUntilChanged()
        .flatMapLatest { query ->
            if (query.isBlank()) flowOf(emptyList())
            else flow { emit(lookup(query)) }
        }
`,
    hint: 'Order matters: trim first so "pasta " and "pasta" collapse, then debounce, then distinctUntilChanged, and only then switch to the lookup with flatMapLatest.',
    explanation:
      '`debounce` absorbs keystrokes, `distinctUntilChanged` avoids re-querying the same text, and `flatMapLatest` cancels the previous inner flow the moment a new query arrives — that cancellation is what guarantees results never arrive out of order. Short-circuiting blank input before the lookup saves a network call and returns the list to its empty state immediately.',
    rules: [
      { label: 'Debounces the query stream', type: 'mustContain', pattern: 'debounce\\s*\\(', regex: true },
      { label: 'Cancels stale lookups with flatMapLatest / mapLatest', type: 'mustContain', pattern: 'flatMapLatest|mapLatest', regex: true },
      { label: 'Skips duplicate consecutive queries', type: 'mustContain', pattern: 'distinctUntilChanged' },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-home-feed-section-loader',
    number: 4,
    language: 'kotlin',
    kind: 'build',
    title: 'Home Feed Section Loader',
    difficulty: 'Hard',
    topic: 'Coroutines & Flow',
    statement:
      'The home screen of a streaming app is made of independent sections ("Continue watching", "Trending", ...). Implement `loadHome(loaders)` which runs **every** loader concurrently and returns a `Map<String, SectionResult>` keyed exactly like the input:\n\n- a loader that succeeds maps to `SectionResult.Ready(items)`,\n- a loader that throws maps to `SectionResult.Failed(message)` and must **not** cancel its siblings (use `supervisorScope` + `async`),\n- cancellation of the caller must still propagate — never swallow `CancellationException`.\n\nPreserve the input key order in the returned map.',
    functionSignature: 'suspend fun loadHome(loaders: Map<String, suspend () -> List<String>>): Map<String, SectionResult>',
    buggyCode: `import kotlinx.coroutines.*

sealed class SectionResult {
    data class Ready(val items: List<String>) : SectionResult()
    data class Failed(val message: String) : SectionResult()
}

suspend fun loadHome(loaders: Map<String, suspend () -> List<String>>): Map<String, SectionResult> {
    // TODO: run all loaders concurrently; one failure must not sink the others
    return loaders.mapValues { TODO() }
}
`,
    solution: `import kotlinx.coroutines.*

sealed class SectionResult {
    data class Ready(val items: List<String>) : SectionResult()
    data class Failed(val message: String) : SectionResult()
}

suspend fun loadHome(loaders: Map<String, suspend () -> List<String>>): Map<String, SectionResult> =
    supervisorScope {
        val jobs = loaders.map { (key, load) -> key to async { load() } }
        jobs.associate { (key, deferred) ->
            val result = try {
                SectionResult.Ready(deferred.await())
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                SectionResult.Failed(e.message ?: "unknown error")
            }
            key to result
        }
    }
`,
    hint: 'Start every `async` first inside `supervisorScope`, then `await()` each one inside a try/catch that rethrows CancellationException.',
    explanation:
      'Under a plain `coroutineScope`, one failing `async` cancels the whole scope and every sibling section disappears with it. `supervisorScope` isolates failures so each child fails alone; the failure only surfaces when you `await()` it, which is where you translate it into `Failed`. Rethrowing `CancellationException` keeps structured concurrency intact when the screen goes away.',
    rules: [
      { label: 'Isolates failures with supervisorScope / SupervisorJob', type: 'mustContain', pattern: 'supervisorScope\\s*\\{|SupervisorJob\\s*\\(', regex: true },
      { label: 'Starts loaders concurrently with async', type: 'mustContain', pattern: 'async\\s*[({]', regex: true },
      { label: 'Awaits each section result', type: 'mustContain', pattern: '\\.await\\s*\\(\\s*\\)|awaitAll', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-receipt-upload-backoff',
    number: 5,
    language: 'kotlin',
    kind: 'build',
    title: 'Receipt Upload With Backoff',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'Implement `retryWithBackoff`, the helper an expense app uses to upload receipt photos over flaky mobile networks.\n\n- Call `block(attempt)` with `attempt` starting at 1. Return its value on success.\n- On an exception: if `attempt == maxAttempts` or `shouldRetry(e)` is false, rethrow it. Otherwise wait via `delayFn(currentDelay)`, then multiply the delay by `factor` and cap it at `maxDelayMs`.\n- `CancellationException` must **never** be retried — rethrow immediately.\n- `delayFn` defaults to `delay(...)` but is injectable so tests can run without real time.\n- `require(maxAttempts >= 1)`.',
    functionSignature: 'suspend fun <T> retryWithBackoff(maxAttempts: Int, initialDelayMs: Long, maxDelayMs: Long, factor: Double = 2.0, shouldRetry: (Throwable) -> Boolean = { true }, delayFn: suspend (Long) -> Unit = { delay(it) }, block: suspend (attempt: Int) -> T): T',
    buggyCode: `import kotlinx.coroutines.*

suspend fun <T> retryWithBackoff(
    maxAttempts: Int,
    initialDelayMs: Long,
    maxDelayMs: Long,
    factor: Double = 2.0,
    shouldRetry: (Throwable) -> Boolean = { true },
    delayFn: suspend (Long) -> Unit = { delay(it) },
    block: suspend (attempt: Int) -> T,
): T {
    // TODO: attempt loop with growing, capped delay; never retry cancellation
    return block(1)
}
`,
    solution: `import kotlinx.coroutines.*

suspend fun <T> retryWithBackoff(
    maxAttempts: Int,
    initialDelayMs: Long,
    maxDelayMs: Long,
    factor: Double = 2.0,
    shouldRetry: (Throwable) -> Boolean = { true },
    delayFn: suspend (Long) -> Unit = { delay(it) },
    block: suspend (attempt: Int) -> T,
): T {
    require(maxAttempts >= 1) { "maxAttempts must be >= 1" }
    var currentDelay = initialDelayMs
    var attempt = 1
    while (true) {
        try {
            return block(attempt)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            if (attempt >= maxAttempts || !shouldRetry(e)) throw e
        }
        delayFn(currentDelay)
        currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelayMs)
        attempt++
    }
}
`,
    hint: 'A `while (true)` with `return block(attempt)` inside `try`; catch CancellationException first and rethrow, then decide whether to retry in the generic catch.',
    explanation:
      'Exponential backoff spreads retries out so a struggling server is not hammered, and the cap keeps the last waits sane. Catching `Exception` blindly would also catch `CancellationException`, which is how a coroutine learns the screen is gone — swallowing it turns cancellation into a zombie retry loop. Injecting `delayFn` (or a test dispatcher) is what makes the backoff schedule unit-testable in milliseconds.',
    rules: [
      { label: 'Loops over attempts', type: 'mustContain', pattern: 'while\\s*\\(|repeat\\s*\\(|for\\s*\\(', regex: true },
      { label: 'Caps the delay at maxDelayMs', type: 'mustContain', pattern: 'coerceAtMost\\s*\\(|minOf\\s*\\(|min\\s*\\(', regex: true },
      { label: 'Rethrows CancellationException instead of retrying it', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*CancellationException\\s*\\)', regex: true },
      { label: 'Waits through the injected delayFn', type: 'mustContain', pattern: 'delayFn\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-build-cart-summary-view-state',
    number: 6,
    language: 'kotlin',
    kind: 'build',
    title: 'Cart Summary View State',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'A grocery checkout screen shows a running total that depends on two independent streams: the cart lines and the currently applied promo (or `null`). Implement `cartViewState(items, promo)` that **combines** the two flows into a `Flow<CartViewState>`:\n\n- `lineCount` = number of lines,\n- `subtotalCents` = sum of `unitCents * qty` (integer math only — no doubles),\n- `discountCents` = `subtotalCents * percentOff / 100` rounded down, or 0 with no promo,\n- `totalCents` = subtotal − discount,\n- `promoCode` = the promo\'s `code` or `null`.\n\nRe-emit whenever **either** input changes, but suppress consecutive identical states (`distinctUntilChanged`).',
    functionSignature: 'fun cartViewState(items: Flow<List<CartLine>>, promo: Flow<Promo?>): Flow<CartViewState>',
    buggyCode: `import kotlinx.coroutines.flow.*

data class CartLine(val sku: String, val unitCents: Long, val qty: Int)
data class Promo(val code: String, val percentOff: Int)

data class CartViewState(
    val lineCount: Int,
    val subtotalCents: Long,
    val discountCents: Long,
    val totalCents: Long,
    val promoCode: String?,
) {
    val isEmpty: Boolean get() = lineCount == 0
}

fun cartViewState(items: Flow<List<CartLine>>, promo: Flow<Promo?>): Flow<CartViewState> {
    // TODO: combine both streams into one view state
    return items.map { TODO() }
}
`,
    solution: `import kotlinx.coroutines.flow.*

data class CartLine(val sku: String, val unitCents: Long, val qty: Int)
data class Promo(val code: String, val percentOff: Int)

data class CartViewState(
    val lineCount: Int,
    val subtotalCents: Long,
    val discountCents: Long,
    val totalCents: Long,
    val promoCode: String?,
) {
    val isEmpty: Boolean get() = lineCount == 0
}

fun cartViewState(items: Flow<List<CartLine>>, promo: Flow<Promo?>): Flow<CartViewState> =
    combine(items, promo) { lines, applied ->
        val subtotal = lines.sumOf { it.unitCents * it.qty }
        val discount = if (applied == null) 0L else subtotal * applied.percentOff / 100
        CartViewState(
            lineCount = lines.size,
            subtotalCents = subtotal,
            discountCents = discount,
            totalCents = subtotal - discount,
            promoCode = applied?.code,
        )
    }.distinctUntilChanged()
`,
    hint: '`combine(items, promo) { lines, applied -> ... }` emits whenever either upstream emits; `sumOf { it.unitCents * it.qty }` keeps the money in Long.',
    explanation:
      '`combine` is the right operator when the UI is a pure function of several inputs: it waits for one value from each, then re-computes on every change from either side (`zip` would pair them one-to-one and stall). Keeping money in integer cents avoids float rounding on the total. `distinctUntilChanged` stops a promo re-emission that produces the same numbers from redrawing the screen.',
    rules: [
      { label: 'Combines both flows with combine()', type: 'mustContain', pattern: 'combine\\s*\\(', regex: true },
      { label: 'Sums line totals (sumOf / fold / sum)', type: 'mustContain', pattern: 'sumOf\\s*\\{|fold\\s*\\(|\\.sum\\s*\\(\\s*\\)', regex: true },
      { label: 'Suppresses duplicate consecutive states', type: 'mustContain', pattern: 'distinctUntilChanged' },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-ticket-screen-reducer',
    number: 7,
    language: 'kotlin',
    kind: 'build',
    title: 'Ticket Screen Reducer',
    difficulty: 'Easy',
    topic: 'UI State & Architecture',
    statement:
      'An event-ticketing screen models its UI as a sealed hierarchy. Implement the **pure** reducer `reduce(state, action)`:\n\n- `Refresh` → `Loading`, unless the state is already `Loading` (return it unchanged).\n- `Loaded(tickets)` → `Content(tickets)` (an empty list is still `Content`).\n- `Failed(message)` → `Error(message)`.\n\nUse `when (action)` as an **expression** with a branch for every action and **no `else`** so adding a new action fails to compile instead of being silently ignored.',
    functionSignature: 'fun reduce(state: TicketUiState, action: TicketAction): TicketUiState',
    buggyCode: `sealed interface TicketUiState {
    data object Loading : TicketUiState
    data class Content(val tickets: List<String>) : TicketUiState
    data class Error(val message: String) : TicketUiState
}

sealed interface TicketAction {
    data object Refresh : TicketAction
    data class Loaded(val tickets: List<String>) : TicketAction
    data class Failed(val message: String) : TicketAction
}

fun reduce(state: TicketUiState, action: TicketAction): TicketUiState {
    // TODO: exhaustive when over the action
    return state
}
`,
    solution: `sealed interface TicketUiState {
    data object Loading : TicketUiState
    data class Content(val tickets: List<String>) : TicketUiState
    data class Error(val message: String) : TicketUiState
}

sealed interface TicketAction {
    data object Refresh : TicketAction
    data class Loaded(val tickets: List<String>) : TicketAction
    data class Failed(val message: String) : TicketAction
}

fun reduce(state: TicketUiState, action: TicketAction): TicketUiState = when (action) {
    TicketAction.Refresh -> if (state is TicketUiState.Loading) state else TicketUiState.Loading
    is TicketAction.Loaded -> TicketUiState.Content(action.tickets)
    is TicketAction.Failed -> TicketUiState.Error(action.message)
}
`,
    hint: 'Make the function body `= when (action) { ... }` — a `when` used as an expression over a sealed type must be exhaustive, so the compiler checks it for you.',
    explanation:
      'A reducer is a pure `(state, action) -> state` function, which makes the whole screen testable without coroutines or Android. Writing the `when` as an expression over a sealed interface gives compile-time exhaustiveness: the day someone adds `TicketAction.Sorted`, the build breaks right here rather than the screen silently ignoring it. An `else` branch would throw that safety away.',
    rules: [
      { label: 'Switches on the action with when(action)', type: 'mustContain', pattern: 'when\\s*\\(\\s*action\\s*\\)', regex: true },
      { label: 'Handles the Loaded action explicitly', type: 'mustContain', pattern: 'is\\s+TicketAction\\.Loaded\\s*->', regex: true },
      { label: 'No else branch — the when must be exhaustive', type: 'mustNotContain', pattern: 'else\\s*->', regex: true },
      { label: 'No longer returns the state unchanged for every action', type: 'mustNotContain', pattern: 'return\\s+state\\s*\\n\\s*\\}', regex: true },
    ],
  },
  {
    id: 'kotlin-build-endless-album-pager',
    number: 8,
    language: 'kotlin',
    kind: 'build',
    title: 'Endless Album Grid Pager',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      'Implement `AlbumPager`, the state holder behind an infinite-scrolling photo grid. It exposes `state: StateFlow<PagerState>` from a private `MutableStateFlow`.\n\n`suspend fun loadNext()`:\n- returns immediately if `isLoading` or `endReached`,\n- sets `isLoading = true` and clears `error`,\n- calls `fetch(offset = items.size)` and appends the page,\n- marks `endReached` when the page has fewer than `pageSize` items,\n- on a non-cancellation exception sets `error = message` and `isLoading = false` (keep the items already loaded),\n- always resets `isLoading` if cancelled, then rethrows.',
    functionSignature: 'class AlbumPager(pageSize: Int, fetch: suspend (offset: Int) -> List<String>) { val state: StateFlow<PagerState>; suspend fun loadNext() }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class PagerState(
    val items: List<String> = emptyList(),
    val isLoading: Boolean = false,
    val endReached: Boolean = false,
    val error: String? = null,
)

class AlbumPager(
    private val pageSize: Int,
    private val fetch: suspend (offset: Int) -> List<String>,
) {
    val state: StateFlow<PagerState> get() = TODO()

    suspend fun loadNext() {
        // TODO: guard, load, append, detect end, handle errors
    }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class PagerState(
    val items: List<String> = emptyList(),
    val isLoading: Boolean = false,
    val endReached: Boolean = false,
    val error: String? = null,
)

class AlbumPager(
    private val pageSize: Int,
    private val fetch: suspend (offset: Int) -> List<String>,
) {
    private val _state = MutableStateFlow(PagerState())
    val state: StateFlow<PagerState> = _state.asStateFlow()

    suspend fun loadNext() {
        val current = _state.value
        if (current.isLoading || current.endReached) return
        _state.update { it.copy(isLoading = true, error = null) }
        try {
            val page = fetch(current.items.size)
            _state.update {
                it.copy(
                    items = it.items + page,
                    isLoading = false,
                    endReached = page.size < pageSize,
                )
            }
        } catch (e: CancellationException) {
            _state.update { it.copy(isLoading = false) }
            throw e
        } catch (e: Exception) {
            _state.update { it.copy(isLoading = false, error = e.message ?: "Could not load photos") }
        }
    }
}
`,
    hint: 'Snapshot `_state.value` once for the guard and the offset, then use `update { it.copy(...) }` for each transition.',
    explanation:
      'The `isLoading || endReached` guard is what stops a fast scroller from firing overlapping requests for the same offset. Deriving the offset from `items.size` means a page is never requested twice after a retry. Resetting `isLoading` on cancellation keeps the pager usable when the user navigates away and back; leaving it stuck at `true` is a common "list never loads more" bug.',
    rules: [
      { label: 'Backs state with a MutableStateFlow', type: 'mustContain', pattern: 'MutableStateFlow\\s*\\(', regex: true },
      { label: 'Guards against overlapping loads and loading past the end', type: 'mustContain', pattern: '\\.isLoading\\s*\\|\\|\\s*\\w+\\.endReached|\\.endReached\\s*\\|\\|\\s*\\w+\\.isLoading', regex: true },
      { label: 'Detects the last page by comparing the page size with pageSize', type: 'mustContain', pattern: '\\.size\\s*<\\s*pageSize|pageSize\\s*>\\s*\\w+\\.size', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-sketch-canvas-history',
    number: 9,
    language: 'kotlin',
    kind: 'build',
    title: 'Sketch Canvas History',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      'A drawing app keeps a bounded undo/redo history of canvas snapshots. Implement the generic `History<T>`:\n\n- `current: T` (read-only from outside), `canUndo`, `canRedo`.\n- `commit(next)`: if `next == current` do nothing; otherwise push the current value onto the undo stack, drop the **oldest** entries while the stack exceeds `limit`, **clear the redo stack**, and make `next` current.\n- `undo()`: move current onto the redo stack and restore the last undo entry; return `false` when there is nothing to undo.\n- `redo()`: the mirror image.',
    functionSignature: 'class History<T>(initial: T, limit: Int = 50) { val current: T; val canUndo: Boolean; val canRedo: Boolean; fun commit(next: T); fun undo(): Boolean; fun redo(): Boolean }',
    buggyCode: `class History<T>(initial: T, private val limit: Int = 50) {
    var current: T = initial
        private set

    val canUndo: Boolean get() = false // TODO
    val canRedo: Boolean get() = false // TODO

    fun commit(next: T) {
        // TODO
        current = next
    }

    fun undo(): Boolean = false // TODO
    fun redo(): Boolean = false // TODO
}
`,
    solution: `class History<T>(initial: T, private val limit: Int = 50) {
    private val undoStack = ArrayDeque<T>()
    private val redoStack = ArrayDeque<T>()

    var current: T = initial
        private set

    val canUndo: Boolean get() = undoStack.isNotEmpty()
    val canRedo: Boolean get() = redoStack.isNotEmpty()

    fun commit(next: T) {
        if (next == current) return
        undoStack.addLast(current)
        while (undoStack.size > limit) undoStack.removeFirst()
        redoStack.clear()
        current = next
    }

    fun undo(): Boolean {
        val previous = undoStack.removeLastOrNull() ?: return false
        redoStack.addLast(current)
        current = previous
        return true
    }

    fun redo(): Boolean {
        val next = redoStack.removeLastOrNull() ?: return false
        undoStack.addLast(current)
        current = next
        return true
    }
}
`,
    hint: 'Two `ArrayDeque<T>` stacks; a fresh commit always invalidates the redo stack.',
    explanation:
      'Undo/redo is two stacks: undo holds the past, redo holds what was undone. Any new commit after an undo must clear redo, otherwise a user could "redo" into a branch of history that no longer connects to the present. Bounding the undo stack by evicting the oldest entry keeps memory flat for long drawing sessions.',
    rules: [
      { label: 'Keeps history in stacks (ArrayDeque / list)', type: 'mustContain', pattern: 'ArrayDeque\\s*<|mutableListOf\\s*<|ArrayList\\s*<', regex: true },
      { label: 'Clears the redo stack on a new commit', type: 'mustContain', pattern: '\\.clear\\s*\\(\\s*\\)', regex: true },
      { label: 'Enforces the limit on the undo stack', type: 'mustContain', pattern: '\\.size\\s*>=?\\s*limit', regex: true },
      { label: 'No TODO placeholder remains', type: 'mustNotContain', pattern: '// TODO' },
    ],
  },
  {
    id: 'kotlin-build-weather-tile-repository',
    number: 10,
    language: 'kotlin',
    kind: 'build',
    title: 'Weather Tile Repository',
    difficulty: 'Hard',
    topic: 'Data & Persistence',
    statement:
      'A home-screen weather tile reads from a repository that merges a local cache with a remote source. Implement `ForecastRepository.forecast(city, forceRefresh)`:\n\n- A cached forecast is **fresh** when `clock() - fetchedAt <= maxAgeMs`. Return it as-is when fresh and `forceRefresh` is false.\n- Otherwise call `remote(city)`, stamp it with `fetchedAt = clock()`, write it to the cache, and return it.\n- If `remote` throws a non-cancellation exception and a (stale) cached value exists, return the stale value; with no cache, rethrow.\n- Serialize calls with a `Mutex` so two tiles asking for the same city at once trigger a single remote call (the second one finds the fresh cache).\n\nTime comes only from the injected `clock`.',
    functionSignature: 'class ForecastRepository(cache: ForecastCache, remote: suspend (city: String) -> Forecast, clock: () -> Long, maxAgeMs: Long) { suspend fun forecast(city: String, forceRefresh: Boolean = false): Forecast }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*

data class Forecast(val city: String, val tempC: Int, val fetchedAt: Long)

interface ForecastCache {
    fun read(city: String): Forecast?
    fun write(forecast: Forecast)
}

class ForecastRepository(
    private val cache: ForecastCache,
    private val remote: suspend (city: String) -> Forecast,
    private val clock: () -> Long,
    private val maxAgeMs: Long,
) {
    suspend fun forecast(city: String, forceRefresh: Boolean = false): Forecast {
        // TODO: fresh cache -> return; else remote (stale-if-error); serialize with a Mutex
        return remote(city)
    }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*

data class Forecast(val city: String, val tempC: Int, val fetchedAt: Long)

interface ForecastCache {
    fun read(city: String): Forecast?
    fun write(forecast: Forecast)
}

class ForecastRepository(
    private val cache: ForecastCache,
    private val remote: suspend (city: String) -> Forecast,
    private val clock: () -> Long,
    private val maxAgeMs: Long,
) {
    private val mutex = Mutex()

    suspend fun forecast(city: String, forceRefresh: Boolean = false): Forecast = mutex.withLock {
        val cached = cache.read(city)
        val isFresh = cached != null && clock() - cached.fetchedAt <= maxAgeMs
        if (cached != null && isFresh && !forceRefresh) return@withLock cached
        try {
            val fresh = remote(city).copy(fetchedAt = clock())
            cache.write(fresh)
            fresh
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            cached ?: throw e
        }
    }
}
`,
    hint: 'Wrap the whole read-check-fetch-write sequence in `mutex.withLock { }`; compute freshness from `clock()` once, and keep `cached` around for the stale-if-error fallback.',
    explanation:
      'Freshness rules belong in the repository so screens never decide for themselves when to hit the network. Stale-if-error makes the tile degrade gracefully on a train instead of showing a blank. The mutex closes the thundering-herd gap: without it, two widgets refreshing at the same second both miss the cache and both call the API. Injecting `clock` is what makes "is it stale after 31 minutes?" a deterministic unit test.',
    rules: [
      { label: 'Serializes refreshes with a Mutex', type: 'mustContain', pattern: 'Mutex\\s*\\(|withLock\\s*\\{', regex: true },
      { label: 'Derives freshness from the injected clock', type: 'mustContain', pattern: 'clock\\s*\\(\\s*\\)\\s*-\\s*\\w+\\.fetchedAt|\\w+\\.fetchedAt\\s*\\+\\s*maxAgeMs', regex: true },
      { label: 'Falls back to the stale value when remote fails', type: 'mustContain', pattern: 'catch\\s*\\(', regex: true },
      { label: 'Never retries or swallows cancellation', type: 'mustContain', pattern: 'CancellationException' },
    ],
  },
  {
    id: 'kotlin-build-field-notes-sync-queue',
    number: 11,
    language: 'kotlin',
    kind: 'build',
    title: 'Field Notes Sync Queue',
    difficulty: 'Hard',
    topic: 'Data & Persistence',
    statement:
      'A field-inspection app lets users edit notes offline and syncs later. Implement `MutationQueue`:\n\n- `enqueue(m)`: if a mutation for the same `noteId` is already pending, **replace it in place** (same queue position) so the queue holds at most one mutation per note; otherwise append.\n- `pending: List<Mutation>` returns an immutable **snapshot** — later queue changes must not show up in a list a caller already holds.\n- `suspend fun flush(): Int` sends mutations in FIFO order through `send`. A mutation is removed only after `send` returns normally. On the first non-cancellation failure stop and leave that mutation and everything behind it queued. Return the number sent. Cancellation must propagate.',
    functionSignature: 'class MutationQueue(send: suspend (Mutation) -> Unit) { val pending: List<Mutation>; fun enqueue(m: Mutation); suspend fun flush(): Int }',
    buggyCode: `import kotlinx.coroutines.*

enum class Op { Upsert, Delete }
data class Mutation(val id: String, val noteId: String, val op: Op, val payload: String)

class MutationQueue(private val send: suspend (Mutation) -> Unit) {
    private val queue = ArrayDeque<Mutation>()

    val pending: List<Mutation> get() = queue // TODO: snapshot

    fun enqueue(m: Mutation) {
        queue.addLast(m) // TODO: coalesce per noteId
    }

    suspend fun flush(): Int {
        // TODO: FIFO send, stop at first failure, return count sent
        return 0
    }
}
`,
    solution: `import kotlinx.coroutines.*

enum class Op { Upsert, Delete }
data class Mutation(val id: String, val noteId: String, val op: Op, val payload: String)

class MutationQueue(private val send: suspend (Mutation) -> Unit) {
    private val queue = ArrayDeque<Mutation>()

    val pending: List<Mutation> get() = queue.toList()

    fun enqueue(m: Mutation) {
        val index = queue.indexOfFirst { it.noteId == m.noteId }
        if (index >= 0) queue[index] = m else queue.addLast(m)
    }

    suspend fun flush(): Int {
        var sent = 0
        while (queue.isNotEmpty()) {
            val head = queue.first()
            try {
                send(head)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                break
            }
            queue.removeFirst()
            sent++
        }
        return sent
    }
}
`,
    hint: '`indexOfFirst { it.noteId == m.noteId }` gives you the slot to overwrite; in `flush`, peek with `first()` and only `removeFirst()` after `send` succeeds.',
    explanation:
      'Coalescing per note keeps the outbox small and avoids replaying five intermediate edits when only the last matters. Removing an item only after a successful send makes the queue crash-safe: a failure or cancellation mid-flight leaves the mutation where it was, and the server-side idempotency key (`id`) makes an accidental re-send harmless. Returning a snapshot from `pending` protects UI code from seeing the list change while it is rendering.',
    rules: [
      { label: 'Coalesces a pending mutation for the same noteId', type: 'mustContain', pattern: 'indexOfFirst\\s*\\{|indexOf\\s*\\(|firstOrNull\\s*\\{|find\\s*\\{|any\\s*\\{', regex: true },
      { label: 'Exposes pending as a snapshot copy', type: 'mustContain', pattern: '\\.toList\\s*\\(\\s*\\)|ArrayList\\s*\\(\\s*queue\\s*\\)|List\\s*\\(\\s*queue', regex: true },
      { label: 'Stops at the first failed send', type: 'mustContain', pattern: 'catch\\s*\\(|runCatching|isFailure', regex: true },
      { label: 'Cancellation propagates instead of being swallowed', type: 'mustContain', pattern: 'CancellationException' },
    ],
  },
  {
    id: 'kotlin-build-avatar-thumbnail-cache',
    number: 12,
    language: 'kotlin',
    kind: 'build',
    title: 'Avatar Thumbnail Cache',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'Implement `TtlCache<K, V>`, an in-memory cache for decoded avatar thumbnails where every entry expires `ttlMs` after it was written. Time comes **only** from the injected `clock: () -> Long` (millis).\n\n- `put(key, value)` stores the value with `expiresAt = clock() + ttlMs`.\n- `get(key)` returns the value, or `null` if absent **or expired** — an expired entry must also be removed.\n- `getOrPut(key) { compute }` returns the live value or computes, stores and returns a new one.\n- `evictExpired()` removes every expired entry and returns how many were removed.\n- `size` reports the number of stored entries (expired ones count until evicted).',
    functionSignature: 'class TtlCache<K, V>(ttlMs: Long, clock: () -> Long) { fun put(key: K, value: V); fun get(key: K): V?; fun getOrPut(key: K, compute: () -> V): V; fun evictExpired(): Int; val size: Int }',
    buggyCode: `class TtlCache<K, V>(private val ttlMs: Long, private val clock: () -> Long) {
    private val entries = LinkedHashMap<K, V>()

    fun put(key: K, value: V) { entries[key] = value } // TODO: remember expiry
    fun get(key: K): V? = entries[key]                  // TODO: respect expiry
    fun getOrPut(key: K, compute: () -> V): V = get(key) ?: compute().also { put(key, it) }
    fun evictExpired(): Int = 0                          // TODO
    val size: Int get() = entries.size
}
`,
    solution: `class TtlCache<K, V>(private val ttlMs: Long, private val clock: () -> Long) {
    private class Entry<V>(val value: V, val expiresAt: Long)

    private val entries = LinkedHashMap<K, Entry<V>>()

    fun put(key: K, value: V) {
        entries[key] = Entry(value, clock() + ttlMs)
    }

    fun get(key: K): V? {
        val entry = entries[key] ?: return null
        if (entry.expiresAt <= clock()) {
            entries.remove(key)
            return null
        }
        return entry.value
    }

    fun getOrPut(key: K, compute: () -> V): V = get(key) ?: compute().also { put(key, it) }

    fun evictExpired(): Int {
        val now = clock()
        val before = entries.size
        entries.values.removeAll { it.expiresAt <= now }
        return before - entries.size
    }

    val size: Int get() = entries.size
}
`,
    hint: 'Store a small `Entry(value, expiresAt)` instead of the bare value; an entry is dead when `expiresAt <= clock()`.',
    explanation:
      'Storing the absolute expiry alongside the value makes every lookup an O(1) comparison against the injected clock — no timers, no background threads. Evicting lazily on `get` plus an explicit `evictExpired()` sweep (call it on memory pressure) is the standard mobile trade-off. Because the clock is injected, a test can "advance time" by returning a bigger number instead of sleeping.',
    rules: [
      { label: 'Reads time only from the injected clock', type: 'mustContain', pattern: 'clock\\s*\\(\\s*\\)\\s*\\+\\s*ttlMs|ttlMs\\s*\\+\\s*clock\\s*\\(\\s*\\)', regex: true },
      { label: 'Compares an expiry timestamp against the clock', type: 'mustContain', pattern: 'expiresAt\\s*<=?\\s*\\w+|\\w+\\s*>=?\\s*\\w*\\.?expiresAt', regex: true },
      { label: 'Removes expired entries', type: 'mustContain', pattern: '\\.remove\\s*\\(|removeAll\\s*\\{|removeIf\\s*\\{|iterator\\s*\\(\\s*\\)', regex: true },
      { label: 'No TODO placeholder remains', type: 'mustNotContain', pattern: '// TODO' },
    ],
  },
  {
    id: 'kotlin-build-boarding-pass-decoder',
    number: 13,
    language: 'kotlin',
    kind: 'build',
    title: 'Boarding Pass Decoder',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      'A travel wallet scans boarding passes encoded as `FLIGHT|SEAT|GATE`. Implement the parsing as a **`Result` chain — never throw to the caller**:\n\n- `parseBoardingPass(raw)`: split on `|`; a field count other than 3 fails with an `IllegalArgumentException`. Trim each field. `flight` must be non-empty; `seat` must match `\\d{1,2}[A-F]`; an empty `gate` becomes `"TBD"`. Use `runCatching` and `mapCatching` (or `map`) so validation failures become `Result.failure`.\n- `describe(raw)`: `fold` the result into `"<flight> seat <seat> gate <gate>"` on success or `"Invalid pass: <message>"` on failure.',
    functionSignature: 'fun parseBoardingPass(raw: String): Result<BoardingPass>; fun describe(raw: String): String',
    buggyCode: `data class BoardingPass(val flight: String, val seat: String, val gate: String)

fun parseBoardingPass(raw: String): Result<BoardingPass> {
    // TODO: runCatching { split + count check } then validate fields
    return Result.failure(NotImplementedError())
}

fun describe(raw: String): String {
    // TODO: fold success / failure into a label
    return ""
}
`,
    solution: `data class BoardingPass(val flight: String, val seat: String, val gate: String)

private val SEAT_PATTERN = Regex("""\\d{1,2}[A-F]""")

fun parseBoardingPass(raw: String): Result<BoardingPass> =
    runCatching {
        val parts = raw.split('|')
        require(parts.size == 3) { "expected 3 fields, got \${parts.size}" }
        parts.map { it.trim() }
    }.mapCatching { (flight, seat, gate) ->
        require(flight.isNotEmpty()) { "flight is empty" }
        require(SEAT_PATTERN.matches(seat)) { "bad seat '\$seat'" }
        BoardingPass(flight, seat, gate.ifEmpty { "TBD" })
    }

fun describe(raw: String): String = parseBoardingPass(raw).fold(
    onSuccess = { "\${it.flight} seat \${it.seat} gate \${it.gate}" },
    onFailure = { "Invalid pass: \${it.message}" },
)
`,
    hint: '`runCatching { ... }.mapCatching { ... }` keeps every `require` failure inside the Result; `fold(onSuccess, onFailure)` turns it into a string.',
    explanation:
      '`Result` makes the failure path a value the caller must handle instead of an exception that can escape into a crash. `mapCatching` is the key operator: unlike `map`, it converts an exception thrown in the transform into a failure rather than letting it propagate. Ending with `fold` forces both branches to be handled at the UI boundary.',
    rules: [
      { label: 'Starts the chain with runCatching', type: 'mustContain', pattern: 'runCatching\\s*\\{', regex: true },
      { label: 'Transforms the parsed parts inside the Result chain', type: 'mustContain', pattern: 'mapCatching\\s*\\{|\\.map\\s*\\{|flatMap\\s*\\{', regex: true },
      { label: 'Resolves the Result with fold / getOrElse', type: 'mustContain', pattern: '\\.fold\\s*\\(|getOrElse\\s*\\{|onFailure\\s*\\{', regex: true },
      { label: 'No longer returns a NotImplementedError failure', type: 'mustNotContain', pattern: 'NotImplementedError' },
    ],
  },
  {
    id: 'kotlin-build-ride-stats-formatters',
    number: 14,
    language: 'kotlin',
    kind: 'build',
    title: 'Ride Stats Formatters',
    difficulty: 'Easy',
    topic: 'Kotlin Idioms',
    statement:
      'A scooter-rental ride summary needs three **extension functions** for formatting raw numbers. Negative inputs are treated as 0.\n\n- `Long.toDurationLabel()` — milliseconds → `"1h 05m"` when there is at least one hour, otherwise `"05m 09s"` (minutes and seconds always two digits).\n- `Int.toDistanceLabel()` — metres → `"850 m"` below 1000, otherwise kilometres with one decimal truncated (not rounded): `1250 → "1.2 km"`, `3000 → "3.0 km"`.\n- `Long.toCentsLabel()` — cents → `"$12.34"`; negative values keep their sign in front: `-50 → "-$0.50"`.',
    functionSignature: 'fun Long.toDurationLabel(): String; fun Int.toDistanceLabel(): String; fun Long.toCentsLabel(): String',
    buggyCode: `fun Long.toDurationLabel(): String = TODO()

fun Int.toDistanceLabel(): String = TODO()

fun Long.toCentsLabel(): String = TODO()
`,
    solution: `fun Long.toDurationLabel(): String {
    val totalSeconds = this.coerceAtLeast(0L) / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return if (hours > 0) "%dh %02dm".format(hours, minutes) else "%02dm %02ds".format(minutes, seconds)
}

fun Int.toDistanceLabel(): String {
    val metres = this.coerceAtLeast(0)
    if (metres < 1000) return "\$metres m"
    val km = metres / 1000
    val tenths = (metres % 1000) / 100
    return "\$km.\$tenths km"
}

fun Long.toCentsLabel(): String {
    val sign = if (this < 0) "-" else ""
    val magnitude = kotlin.math.abs(this)
    return "%s\$%d.%02d".format(sign, magnitude / 100, magnitude % 100)
}
`,
    hint: 'Extension functions read as `fun Long.toDurationLabel(): String { ... }` with `this` as the receiver; `"%02d".format(n)` zero-pads.',
    explanation:
      'Extension functions let call sites read naturally (`ride.durationMs.toDurationLabel()`) without polluting the number types or scattering formatting helpers across screens. Keeping the maths in integers (truncating tenths, splitting cents) avoids the floating-point surprises that plague money and distance labels. Clamping negatives to 0 makes the helpers safe for partially-synced rides.',
    rules: [
      { label: 'Defines Long.toDurationLabel as an extension', type: 'mustContain', pattern: 'fun\\s+Long\\.toDurationLabel\\s*\\(', regex: true },
      { label: 'Zero-pads minutes/seconds to two digits', type: 'mustContain', pattern: '%02d|padStart\\s*\\(\\s*2', regex: true },
      { label: 'Defines Int.toDistanceLabel as an extension', type: 'mustContain', pattern: 'fun\\s+Int\\.toDistanceLabel\\s*\\(', regex: true },
      { label: 'No TODO() placeholder remains', type: 'mustNotContain', pattern: 'TODO()' },
    ],
  },
  {
    id: 'kotlin-build-typed-ride-ids',
    number: 15,
    language: 'kotlin',
    kind: 'build',
    title: 'Typed Ids for Rides and Riders',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      'A ride-hailing module currently passes rider and ride ids around as raw `String`s (via `typealias`), so `assign(rider, ride)` and `assign(ride, rider)` both compile. Replace the aliases with **inline value classes** so mixing them up is a compile error, without allocating a wrapper at runtime:\n\n- `@JvmInline value class RiderId(val raw: String)` and `RideId` likewise; both reject a blank `raw` in `init` with `require`.\n- `RideBook.assign(ride, rider)` records who took a ride (re-assigning overwrites).\n- `riderOf(ride)` returns the rider or `null`; `ridesOf(rider)` lists that rider\'s rides in assignment order.',
    functionSignature: '@JvmInline value class RiderId(val raw: String); @JvmInline value class RideId(val raw: String); class RideBook { fun assign(ride: RideId, rider: RiderId); fun riderOf(ride: RideId): RiderId?; fun ridesOf(rider: RiderId): List<RideId> }',
    buggyCode: `typealias RiderId = String
typealias RideId = String

class RideBook {
    private val riderByRide = LinkedHashMap<RideId, RiderId>()

    fun assign(ride: RideId, rider: RiderId) {
        riderByRide[ride] = rider
    }

    fun riderOf(ride: RideId): RiderId? = riderByRide[ride]

    fun ridesOf(rider: RiderId): List<RideId> =
        riderByRide.filterValues { it == rider }.keys.toList()
}
`,
    solution: `@JvmInline
value class RiderId(val raw: String) {
    init { require(raw.isNotBlank()) { "RiderId must not be blank" } }
}

@JvmInline
value class RideId(val raw: String) {
    init { require(raw.isNotBlank()) { "RideId must not be blank" } }
}

class RideBook {
    private val riderByRide = LinkedHashMap<RideId, RiderId>()

    fun assign(ride: RideId, rider: RiderId) {
        riderByRide[ride] = rider
    }

    fun riderOf(ride: RideId): RiderId? = riderByRide[ride]

    fun ridesOf(rider: RiderId): List<RideId> =
        riderByRide.filterValues { it == rider }.keys.toList()
}
`,
    hint: '`@JvmInline value class RideId(val raw: String) { init { require(raw.isNotBlank()) } }` — the compiler erases the wrapper but keeps the type distinct.',
    explanation:
      'A `typealias` is purely cosmetic: both aliases *are* `String`, so swapped arguments compile and only fail at runtime (or never, silently). A `@JvmInline value class` creates a real, distinct type that the compiler unboxes back to the underlying `String` in most positions, so you get type safety at zero allocation cost. Validating in `init` guarantees an id can never exist in an invalid state.',
    rules: [
      { label: 'RiderId is an inline value class', type: 'mustContain', pattern: '@JvmInline\\s+value\\s+class\\s+RiderId\\s*\\(', regex: true },
      { label: 'RideId is an inline value class', type: 'mustContain', pattern: '@JvmInline\\s+value\\s+class\\s+RideId\\s*\\(', regex: true },
      { label: 'Rejects blank ids in init', type: 'mustContain', pattern: 'require\\s*\\(\\s*raw\\.isNotBlank|require\\s*\\(\\s*!raw\\.isBlank|check\\s*\\(\\s*raw\\.isNotBlank', regex: true },
      { label: 'The String typealiases are gone', type: 'mustNotContain', pattern: 'typealias' },
    ],
  },
  // ===================================================================== DEBUG
  {
    id: 'kotlin-breadcrumb-uploader-swallows-cancel',
    number: 1,
    language: 'kotlin',
    kind: 'debug',
    title: 'Breadcrumb Uploader Ignores Cancellation',
    difficulty: 'Hard',
    topic: 'Coroutines & Flow',
    statement:
      '`BreadcrumbUploader.run()` uploads recorded GPS points one by one and is meant to skip a point whose upload fails (network hiccup) and carry on. QA reports that after the user leaves the map screen — which cancels the coroutine — the uploader keeps spinning through **every remaining point** and the job never finishes.\n\nFind the one conceptual bug and fix it so cancellation stops the loop immediately while transient failures are still skipped.',
    functionSignature: 'class BreadcrumbUploader(sink: BreadcrumbSink, points: List<String>) { suspend fun run() }',
    buggyCode: `import kotlinx.coroutines.*

interface BreadcrumbSink {
    suspend fun upload(point: String)
}

class BreadcrumbUploader(
    private val sink: BreadcrumbSink,
    private val points: List<String>,
) {
    var uploaded = 0
        private set

    suspend fun run() {
        for (point in points) {
            try {
                sink.upload(point)
                uploaded++
            } catch (e: Exception) {
                // transient failure: skip this point and keep going
                continue
            }
        }
    }
}
`,
    solution: `import kotlinx.coroutines.*

interface BreadcrumbSink {
    suspend fun upload(point: String)
}

class BreadcrumbUploader(
    private val sink: BreadcrumbSink,
    private val points: List<String>,
) {
    var uploaded = 0
        private set

    suspend fun run() {
        for (point in points) {
            try {
                sink.upload(point)
                uploaded++
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                // transient failure: skip this point and keep going
                continue
            }
        }
    }
}
`,
    hint: 'Cancellation is delivered as an exception. What does `catch (e: Exception)` do with it?',
    explanation:
      '`CancellationException` extends `IllegalStateException`, so a blanket `catch (e: Exception)` swallows it, and the loop treats "the screen is gone" as one more transient failure. Every following `upload` call throws again immediately (the coroutine is still cancelled), so the loop burns through the whole list. Catch `CancellationException` first and rethrow it — or call `coroutineContext.ensureActive()` at the top of each iteration.',
    rules: [
      { label: 'Rethrows CancellationException (or checks ensureActive / isActive)', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*CancellationException\\s*\\)\\s*\\{\\s*throw|ensureActive\\s*\\(\\s*\\)|\\.isActive', regex: true },
      { label: 'Still skips transient upload failures', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*Exception\\s*\\)', regex: true },
      { label: 'Does not widen the catch to Throwable', type: 'mustNotContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*Throwable\\s*\\)', regex: true },
    ],
  },
  {
    id: 'kotlin-sticker-decoder-hardcoded-dispatcher',
    number: 2,
    language: 'kotlin',
    kind: 'debug',
    title: 'Sticker Decoder Pins Its Dispatcher',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      '`StickerDecoder` takes an `ioDispatcher` in its constructor so unit tests can pass a test dispatcher and the production graph can pass `Dispatchers.IO`. Tests hang because the decode never runs on the injected dispatcher. Fix `decode` so it uses the injected dispatcher and nothing else.',
    functionSignature: 'class StickerDecoder(ioDispatcher: CoroutineDispatcher) { suspend fun decode(bytes: ByteArray): List<String> }',
    buggyCode: `import kotlinx.coroutines.*

class StickerDecoder(private val ioDispatcher: CoroutineDispatcher) {

    suspend fun decode(bytes: ByteArray): List<String> = withContext(Dispatchers.IO) {
        bytes.toString(Charsets.UTF_8)
            .split('\\n')
            .filter { it.isNotBlank() }
    }
}
`,
    solution: `import kotlinx.coroutines.*

class StickerDecoder(private val ioDispatcher: CoroutineDispatcher) {

    suspend fun decode(bytes: ByteArray): List<String> = withContext(ioDispatcher) {
        bytes.toString(Charsets.UTF_8)
            .split('\\n')
            .filter { it.isNotBlank() }
    }
}
`,
    hint: 'The constructor parameter is never read.',
    explanation:
      'Hard-coding `Dispatchers.IO` inside a class defeats the injection: tests using a `StandardTestDispatcher` cannot advance the work, and the decode hops onto a real thread pool. Always dispatch through the injected `CoroutineDispatcher` — this is the Kotlin equivalent of "never reference a global inside a unit".',
    rules: [
      { label: 'Switches to the injected dispatcher', type: 'mustContain', pattern: 'withContext\\s*\\(\\s*ioDispatcher\\s*\\)', regex: true },
      { label: 'No longer references Dispatchers.IO directly', type: 'mustNotContain', pattern: 'Dispatchers\\.IO', regex: true },
      { label: 'Does not swap in another global dispatcher', type: 'mustNotContain', pattern: 'Dispatchers\\.(Default|Main|Unconfined)', regex: true },
    ],
  },
  {
    id: 'kotlin-tip-jar-mutates-state-in-place',
    number: 3,
    language: 'kotlin',
    kind: 'debug',
    title: 'Tip Jar Counter Never Updates',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      '`TipJarStore` follows unidirectional data flow: the screen sends `TipEvent`s and collects `state`. Tapping "Tip $2" runs `dispatch` without error, yet the collected `StateFlow` never emits and the total on screen stays at `$0.00`. Find the one conceptual bug and fix it — the state should stay a plain data class and every event should produce a new value.',
    functionSignature: 'class TipJarStore { val state: StateFlow<TipJarState>; fun dispatch(event: TipEvent) }',
    buggyCode: `import kotlinx.coroutines.flow.*

data class TipJarState(var totalCents: Long = 0L, var tipCount: Int = 0)

sealed interface TipEvent {
    data class Tipped(val cents: Long) : TipEvent
    data object Reset : TipEvent
}

class TipJarStore {
    private val _state = MutableStateFlow(TipJarState())
    val state: StateFlow<TipJarState> = _state.asStateFlow()

    fun dispatch(event: TipEvent) {
        val current = _state.value
        when (event) {
            is TipEvent.Tipped -> {
                current.totalCents += event.cents
                current.tipCount += 1
            }
            TipEvent.Reset -> {
                current.totalCents = 0L
                current.tipCount = 0
            }
        }
        _state.value = current
    }
}
`,
    solution: `import kotlinx.coroutines.flow.*

data class TipJarState(val totalCents: Long = 0L, val tipCount: Int = 0)

sealed interface TipEvent {
    data class Tipped(val cents: Long) : TipEvent
    data object Reset : TipEvent
}

class TipJarStore {
    private val _state = MutableStateFlow(TipJarState())
    val state: StateFlow<TipJarState> = _state.asStateFlow()

    fun dispatch(event: TipEvent) {
        _state.update { current ->
            when (event) {
                is TipEvent.Tipped -> current.copy(
                    totalCents = current.totalCents + event.cents,
                    tipCount = current.tipCount + 1,
                )
                TipEvent.Reset -> TipJarState()
            }
        }
    }
}
`,
    hint: '`StateFlow` only emits when the new value is not `equals` to the old one. What is being assigned back?',
    explanation:
      'The store mutates the object already held by the flow and then assigns that same instance back. `MutableStateFlow` compares old and new with `equals` (which is `true` — it is the same object with the same fields at comparison time), so it conflates the update and no collector runs. Make the fields `val` and emit a `copy`; immutability is what makes UDF state observable.',
    rules: [
      { label: 'Produces a new state with copy()', type: 'mustContain', pattern: '\\.copy\\s*\\(', regex: true },
      { label: 'State fields are immutable (no var totalCents)', type: 'mustNotContain', pattern: 'var\\s+totalCents', regex: true },
      { label: 'Publishes through update { } or value =', type: 'mustContain', pattern: '\\.update\\s*\\{|\\.value\\s*=', regex: true },
    ],
  },
  {
    id: 'kotlin-invite-form-stale-validity',
    number: 4,
    language: 'kotlin',
    kind: 'debug',
    title: 'Invite Code Form Stays Disabled',
    difficulty: 'Easy',
    topic: 'UI State & Architecture',
    statement:
      'The invite screen enables its "Join" button from `state.isValid`, which must be true exactly when the code matches `[A-Z0-9]{6}` **and** the terms box is checked. Users who tick the box first and then type a valid code find the button stays disabled. Find and fix the one conceptual bug — prefer a fix that makes this class of bug impossible.',
    functionSignature: 'class InviteFormHolder { val state: InviteFormState; fun onCodeChanged(value: String); fun onTermsToggled(checked: Boolean) }',
    buggyCode: `private val CODE = Regex("[A-Z0-9]{6}")

data class InviteFormState(
    val code: String = "",
    val agreedToTerms: Boolean = false,
    val isValid: Boolean = false,
)

fun InviteFormState.validated(): InviteFormState =
    copy(isValid = CODE.matches(code) && agreedToTerms)

class InviteFormHolder {
    var state = InviteFormState().validated()
        private set

    fun onCodeChanged(value: String) {
        state = state.copy(code = value.trim().uppercase())
    }

    fun onTermsToggled(checked: Boolean) {
        state = state.copy(agreedToTerms = checked).validated()
    }
}
`,
    solution: `private val CODE = Regex("[A-Z0-9]{6}")

data class InviteFormState(
    val code: String = "",
    val agreedToTerms: Boolean = false,
) {
    val isValid: Boolean get() = CODE.matches(code) && agreedToTerms
}

class InviteFormHolder {
    var state = InviteFormState()
        private set

    fun onCodeChanged(value: String) {
        state = state.copy(code = value.trim().uppercase())
    }

    fun onTermsToggled(checked: Boolean) {
        state = state.copy(agreedToTerms = checked)
    }
}
`,
    hint: '`isValid` is stored, so it is only as fresh as the last call to `validated()`. Which handler forgets to call it — and why store it at all?',
    explanation:
      'Storing `isValid` as a constructor field duplicates information already present in `code` and `agreedToTerms`, so every mutation has to remember to recompute it — and `onCodeChanged` does not. Making it a derived getter (`val isValid: Boolean get() = ...`) removes the second source of truth: it can never be stale, and `copy` no longer needs a follow-up call.',
    rules: [
      { label: 'isValid is derived (getter) or re-validated after the code changes', type: 'mustContain', pattern: 'val\\s+isValid\\s*:\\s*Boolean\\s*get\\s*\\(\\s*\\)|copy\\s*\\(\\s*code\\s*=[^\\n]*\\)\\s*\\.validated\\s*\\(\\s*\\)', regex: true },
      { label: 'Validity still requires both a matching code and accepted terms', type: 'mustContain', pattern: 'CODE\\.matches\\s*\\(\\s*code\\s*\\)\\s*&&\\s*agreedToTerms|agreedToTerms\\s*&&\\s*CODE\\.matches\\s*\\(\\s*code\\s*\\)', regex: true },
      { label: 'Validity is never hard-coded to true', type: 'mustNotContain', pattern: 'isValid\\s*=\\s*true', regex: true },
    ],
  },
  {
    id: 'kotlin-gallery-selection-shared-set',
    number: 5,
    language: 'kotlin',
    kind: 'debug',
    title: 'Gallery Multi-Select Skips Updates',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      'Long-pressing a photo enters selection mode and each tap should toggle that photo\'s checkmark. The first selection renders, but toggling further photos while already in selection mode does not update the grid, and a background collector occasionally crashes with `ConcurrentModificationException`. Find the one conceptual bug in `GallerySelection` and fix it so every toggle emits a distinct, immutable state.',
    functionSignature: 'class GallerySelection { val state: StateFlow<SelectionState>; fun toggle(photoId: String); fun clear() }',
    buggyCode: `import kotlinx.coroutines.flow.*

data class SelectionState(
    val selected: MutableSet<String> = mutableSetOf(),
    val selectionMode: Boolean = false,
)

class GallerySelection {
    private val _state = MutableStateFlow(SelectionState())
    val state: StateFlow<SelectionState> = _state.asStateFlow()

    fun toggle(photoId: String) {
        val current = _state.value
        if (!current.selected.remove(photoId)) current.selected.add(photoId)
        _state.value = current.copy(selectionMode = current.selected.isNotEmpty())
    }

    fun clear() {
        _state.value.selected.clear()
        _state.value = _state.value.copy(selectionMode = false)
    }
}
`,
    solution: `import kotlinx.coroutines.flow.*

data class SelectionState(
    val selected: Set<String> = emptySet(),
    val selectionMode: Boolean = false,
)

class GallerySelection {
    private val _state = MutableStateFlow(SelectionState())
    val state: StateFlow<SelectionState> = _state.asStateFlow()

    fun toggle(photoId: String) {
        _state.update { current ->
            val next = if (photoId in current.selected) current.selected - photoId else current.selected + photoId
            current.copy(selected = next, selectionMode = next.isNotEmpty())
        }
    }

    fun clear() {
        _state.update { it.copy(selected = emptySet(), selectionMode = false) }
    }
}
`,
    hint: '`copy` is shallow — the old and new state share the very same `MutableSet`. What does the flow\'s equality check see?',
    explanation:
      'The data class wraps a `MutableSet` that is mutated in place, so the "new" state produced by `copy` points at the same set as the old one: their `equals` is true whenever `selectionMode` is unchanged, `StateFlow` conflates the emission, and the grid never re-renders. Meanwhile a collector iterating that set can observe the mutation mid-loop. Use a read-only `Set` and build the next one with `+`/`-` so each state is a distinct, safely shareable value.',
    rules: [
      { label: 'The state holds a read-only Set (no MutableSet)', type: 'mustNotContain', pattern: 'MutableSet|mutableSetOf', regex: true },
      { label: 'Builds a new set with + / - instead of mutating', type: 'mustContain', pattern: 'selected\\s*[-+]\\s*photoId|selected\\.(plus|minus)\\s*\\(\\s*photoId|toMutableSet\\s*\\(\\s*\\)', regex: true },
      { label: 'Emits the new set through copy(selected = ...)', type: 'mustContain', pattern: 'copy\\s*\\(\\s*selected\\s*=', regex: true },
    ],
  },
  {
    id: 'kotlin-profile-payload-force-casts',
    number: 6,
    language: 'kotlin',
    kind: 'debug',
    title: 'Profile Payload Mapper Crashes on Partial Data',
    difficulty: 'Easy',
    topic: 'Data & Persistence',
    statement:
      'The backend serialises profiles as a loosely-typed map. `id` and `display_name` are required — a missing one should fail with an `IllegalArgumentException` naming the key. `bio` (default `""`), `follower_count` (default `0`, may arrive as any `Number`) and `is_verified` (default `false`) are optional and may be absent or `null`. The mapper currently crashes with `NullPointerException` / `ClassCastException` on older profiles that omit those fields. Fix the mapping with safe casts and defaults.',
    functionSignature: 'fun Map<String, Any?>.toProfile(): Profile',
    buggyCode: `data class Profile(
    val id: String,
    val displayName: String,
    val bio: String,
    val followerCount: Int,
    val isVerified: Boolean,
)

fun Map<String, Any?>.toProfile(): Profile = Profile(
    id = this["id"] as String,
    displayName = this["display_name"] as String,
    bio = this["bio"] as String,
    followerCount = (this["follower_count"] as Number).toInt(),
    isVerified = this["is_verified"] as Boolean,
)
`,
    solution: `data class Profile(
    val id: String,
    val displayName: String,
    val bio: String,
    val followerCount: Int,
    val isVerified: Boolean,
)

fun Map<String, Any?>.toProfile(): Profile = Profile(
    id = this["id"] as? String ?: throw IllegalArgumentException("missing id"),
    displayName = this["display_name"] as? String ?: throw IllegalArgumentException("missing display_name"),
    bio = this["bio"] as? String ?: "",
    followerCount = (this["follower_count"] as? Number)?.toInt() ?: 0,
    isVerified = this["is_verified"] as? Boolean ?: false,
)
`,
    hint: '`as? T ?: default` is the idiom: a safe cast yields null for a missing or wrong-typed value, and the elvis supplies the default (or throws for required keys).',
    explanation:
      'An unconditional `as String` on a nullable value throws when the key is absent, so every optional field becomes a crash on any payload version that predates it. The safe cast `as?` turns "missing or wrong type" into `null`, and `?:` then either applies the documented default or raises a descriptive error for required keys. Defaults in the mapper are what let old clients and new servers coexist.',
    rules: [
      { label: 'bio defaults to an empty string', type: 'mustContain', pattern: 'as\\?\\s*String\\s*\\?:\\s*""', regex: true },
      { label: 'follower_count defaults to 0 via a safe Number/Int cast', type: 'mustContain', pattern: 'as\\?\\s*Number\\s*\\)\\s*\\?\\.toInt\\s*\\(\\s*\\)\\s*\\?:\\s*0|as\\?\\s*Int\\s*\\?:\\s*0', regex: true },
      { label: 'is_verified defaults to false', type: 'mustContain', pattern: 'as\\?\\s*Boolean\\s*\\?:\\s*false', regex: true },
      { label: 'Required keys fail with IllegalArgumentException', type: 'mustContain', pattern: 'IllegalArgumentException|requireNotNull\\s*\\(|require\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-saved-route-migration-skips-steps',
    number: 7,
    language: 'kotlin',
    kind: 'debug',
    title: 'Saved Route Migration Stops Early',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'Saved cycling routes are stored with a schema `version`; `migrate` must bring **any** older record up to `CURRENT_VERSION` (3) by applying the step functions in order, and reject unknown versions. Users upgrading straight from the v1 app see routes with no `name` because their records arrive at version 2 and stop. Find and fix the one conceptual bug.',
    functionSignature: 'fun migrate(route: StoredRoute): StoredRoute',
    buggyCode: `const val CURRENT_VERSION = 3

data class StoredRoute(val version: Int, val fields: Map<String, String>)

private fun v1ToV2(r: StoredRoute): StoredRoute {
    val km = r.fields["distance_km"]?.toDoubleOrNull() ?: 0.0
    return StoredRoute(2, r.fields - "distance_km" + ("distance_m" to (km * 1000).toInt().toString()))
}

private fun v2ToV3(r: StoredRoute): StoredRoute =
    StoredRoute(3, r.fields - "title" + ("name" to (r.fields["title"] ?: "Untitled")))

fun migrate(route: StoredRoute): StoredRoute = when (route.version) {
    1 -> v1ToV2(route)
    2 -> v2ToV3(route)
    CURRENT_VERSION -> route
    else -> throw IllegalStateException("Unknown schema version \${route.version}")
}
`,
    solution: `const val CURRENT_VERSION = 3

data class StoredRoute(val version: Int, val fields: Map<String, String>)

private fun v1ToV2(r: StoredRoute): StoredRoute {
    val km = r.fields["distance_km"]?.toDoubleOrNull() ?: 0.0
    return StoredRoute(2, r.fields - "distance_km" + ("distance_m" to (km * 1000).toInt().toString()))
}

private fun v2ToV3(r: StoredRoute): StoredRoute =
    StoredRoute(3, r.fields - "title" + ("name" to (r.fields["title"] ?: "Untitled")))

fun migrate(route: StoredRoute): StoredRoute {
    var current = route
    while (current.version < CURRENT_VERSION) {
        current = when (current.version) {
            1 -> v1ToV2(current)
            2 -> v2ToV3(current)
            else -> throw IllegalStateException("Unknown schema version \${current.version}")
        }
    }
    if (current.version > CURRENT_VERSION) {
        throw IllegalStateException("Record from a newer app version \${current.version}")
    }
    return current
}
`,
    hint: 'A single `when` applies exactly one step. A v1 record needs two.',
    explanation:
      'The `when` picks one migration step and returns, so a record more than one version behind is only partially migrated and the app then reads fields that do not exist yet. Migrations must be applied as a chain: loop (or recurse) while `version < CURRENT_VERSION`, each step advancing exactly one version, and reject versions that are newer than the app understands.',
    rules: [
      { label: 'Applies migration steps repeatedly until current (loop or recursion)', type: 'mustContain', pattern: 'while\\s*\\(|generateSequence|tailrec|migrate\\s*\\(\\s*v1ToV2\\s*\\(', regex: true },
      { label: 'A v1 record is no longer left at version 2', type: 'mustNotContain', pattern: '1\\s*->\\s*v1ToV2\\s*\\(\\s*route\\s*\\)\\s*\\n', regex: true },
      { label: 'Still anchored on CURRENT_VERSION', type: 'mustContain', pattern: 'CURRENT_VERSION' },
    ],
  },
  {
    id: 'kotlin-deep-link-router-else-branch',
    number: 8,
    language: 'kotlin',
    kind: 'debug',
    title: 'Deep Link Title Falls Through',
    difficulty: 'Easy',
    topic: 'Kotlin Idioms',
    statement:
      'A marketplace app resolves deep links into a sealed `Route` and shows a toolbar title per screen. `Route.Settings` was added last sprint, but its toolbar still reads "Marketplace", and nobody noticed because the code compiled. Rewrite `screenTitle` so every route is handled explicitly and adding a new `Route` **fails to compile** until it gets a title. `Settings` should read `"Settings"`.',
    functionSignature: 'fun screenTitle(route: Route): String',
    buggyCode: `sealed class Route {
    data object Home : Route()
    data class Listing(val id: String) : Route()
    data class Seller(val handle: String) : Route()
    data object Settings : Route()
}

fun screenTitle(route: Route): String {
    var title = "Marketplace"
    when (route) {
        Route.Home -> title = "Home"
        is Route.Listing -> title = "Listing \${route.id}"
        is Route.Seller -> title = "@\${route.handle}"
        else -> {}
    }
    return title
}
`,
    solution: `sealed class Route {
    data object Home : Route()
    data class Listing(val id: String) : Route()
    data class Seller(val handle: String) : Route()
    data object Settings : Route()
}

fun screenTitle(route: Route): String = when (route) {
    Route.Home -> "Home"
    is Route.Listing -> "Listing \${route.id}"
    is Route.Seller -> "@\${route.handle}"
    Route.Settings -> "Settings"
}
`,
    hint: 'Use `when` as an expression (`= when (route) { ... }`) and delete the `else`. The compiler then lists what is missing.',
    explanation:
      'An `else` branch in a `when` over a sealed type is an escape hatch that silently absorbs every future subclass. Written as an expression without `else`, the `when` must be exhaustive, so the day `Route.Settings` (or `Route.Cart`) is added the build fails at exactly the spot that needs a decision. This is the main reason to model navigation and UI state as sealed hierarchies.',
    rules: [
      { label: 'Handles Route.Settings explicitly', type: 'mustContain', pattern: 'Route\\.Settings\\s*->', regex: true },
      { label: 'No else branch — exhaustiveness is enforced by the compiler', type: 'mustNotContain', pattern: 'else\\s*->', regex: true },
      { label: 'Uses when as an expression', type: 'mustContain', pattern: '=\\s*when\\s*\\(\\s*route\\s*\\)|return\\s+when\\s*\\(\\s*route\\s*\\)', regex: true },
    ],
  },
  {
    id: 'kotlin-shortcode-table-reparsed',
    number: 9,
    language: 'kotlin',
    kind: 'debug',
    title: 'Shortcode Table Re-parsed Per Match',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      '`ShortcodeTable` expands `:smile:`-style shortcodes in chat messages using a lookup table parsed from a bundled text blob. Profiling shows the parse running **once per shortcode per message**, and the chat list stutters while scrolling. The table must be parsed at most once per instance, and only when first needed (some instances are never used). Find and fix the one conceptual bug.',
    functionSignature: 'class ShortcodeTable(rawTable: String) { fun expand(text: String): String }',
    buggyCode: `private val SHORTCODE = Regex(":([a-z_]+):")

class ShortcodeTable(private val rawTable: String) {

    // rawTable looks like "smile=:)\\nheart=<3\\nwave=o/"
    private val entries: Map<String, String>
        get() = rawTable.lineSequence()
            .filter { it.contains('=') }
            .associate { line ->
                val (key, value) = line.split('=', limit = 2)
                key.trim() to value.trim()
            }

    fun expand(text: String): String =
        SHORTCODE.replace(text) { match -> entries[match.groupValues[1]] ?: match.value }
}
`,
    solution: `private val SHORTCODE = Regex(":([a-z_]+):")

class ShortcodeTable(private val rawTable: String) {

    // rawTable looks like "smile=:)\\nheart=<3\\nwave=o/"
    private val entries: Map<String, String> by lazy {
        rawTable.lineSequence()
            .filter { it.contains('=') }
            .associate { line ->
                val (key, value) = line.split('=', limit = 2)
                key.trim() to value.trim()
            }
    }

    fun expand(text: String): String =
        SHORTCODE.replace(text) { match -> entries[match.groupValues[1]] ?: match.value }
}
`,
    hint: 'A property with a custom `get()` runs its body on every access. Which delegate computes once, on first access?',
    explanation:
      'A `get() = ...` accessor is a function in disguise: `entries` is rebuilt every time the replacement lambda reads it, i.e. once per match. `by lazy { }` swaps that for a delegate that evaluates the initializer on first access and caches the result for the lifetime of the instance — deferred, so unused instances pay nothing, and (by default) thread-safe.',
    rules: [
      { label: 'Parses the table with a lazy delegate', type: 'mustContain', pattern: 'by\\s+lazy\\s*[({]', regex: true },
      { label: 'entries is no longer a recomputing getter', type: 'mustNotContain', pattern: 'entries\\s*:\\s*Map<String,\\s*String>\\s*\\n?\\s*get\\s*\\(\\s*\\)', regex: true },
      { label: 'Still builds the lookup with associate', type: 'mustContain', pattern: 'associate\\s*\\{|associateBy|toMap\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-recent-searches-leaks-mutable-list',
    number: 10,
    language: 'kotlin',
    kind: 'debug',
    title: 'Recent Searches Leak Their Backing List',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      '`RecentSearches` keeps the last `limit` queries, most recent first, and exposes them as `items: List<String>` for a diffable list adapter. The adapter diffs the previous `items` against the new one after each `record()`, but it never detects any change — and one screen managed to add to the list by casting `items` to `MutableList`. Find and fix the one conceptual bug so callers only ever receive an independent, read-only snapshot.',
    functionSignature: 'class RecentSearches(limit: Int = 10) { val items: List<String>; fun record(query: String) }',
    buggyCode: `class RecentSearches(private val limit: Int = 10) {
    private val _items = mutableListOf<String>()

    val items: List<String> = _items

    fun record(query: String) {
        val q = query.trim()
        if (q.isEmpty()) return
        _items.remove(q)
        _items.add(0, q)
        while (_items.size > limit) _items.removeAt(_items.size - 1)
    }
}
`,
    solution: `class RecentSearches(private val limit: Int = 10) {
    private val _items = mutableListOf<String>()

    val items: List<String> get() = _items.toList()

    fun record(query: String) {
        val q = query.trim()
        if (q.isEmpty()) return
        _items.remove(q)
        _items.add(0, q)
        while (_items.size > limit) _items.removeAt(_items.size - 1)
    }
}
`,
    hint: 'Declaring the type as `List<String>` does not copy anything — `items` and `_items` are the same object.',
    explanation:
      '`val items: List<String> = _items` only narrows the static type; the reference still points at the live `MutableList`, so a diff of "old items" vs "new items" compares a list with itself, and a cast restores full write access. Returning `_items.toList()` from a getter hands every caller its own immutable snapshot — the same discipline as exposing `StateFlow` instead of `MutableStateFlow`.',
    rules: [
      { label: 'Exposes a defensive copy (toList / List(...) / unmodifiableList)', type: 'mustContain', pattern: '_items\\.toList\\s*\\(\\s*\\)|List\\s*\\(\\s*_items|unmodifiableList\\s*\\(|toImmutableList\\s*\\(', regex: true },
      { label: 'No longer aliases the mutable backing list', type: 'mustNotContain', pattern: 'val\\s+items\\s*:\\s*List<String>\\s*=\\s*_items\\s*\\n', regex: true },
      { label: 'Still trims the list to the limit', type: 'mustContain', pattern: '\\.size\\s*>\\s*limit', regex: true },
    ],
  },
  // ===========================================================================
  // COMPOSE-STYLE STATE
  // ===========================================================================
  {
    id: 'kotlin-checkout-sheet-copy-on-event',
    number: 16,
    language: 'kotlin',
    kind: 'build',
    title: 'Checkout Sheet Copy-On-Event',
    difficulty: 'Easy',
    topic: 'Compose-style State',
    statement:
      'A bottom sheet for a flower-delivery checkout renders from a single `CheckoutUi` value. Make the state immutable (every property `val`) and implement `reduce(state, event)` so it returns a **new** `CheckoutUi` via `copy` — never mutate the incoming object.\n\nEvents: `QuantityChanged(value)` sets `quantity` clamped to `1..99`; `PromoTyped(text)` stores the text trimmed and upper-cased; `SubmitTapped` sets `isSubmitting = true`; `SubmitFailed(message)` sets `isSubmitting = false` and `error = message`. Every event except `SubmitFailed` clears `error`. The `when` must be exhaustive over the sealed class.',
    functionSignature: 'fun reduce(state: CheckoutUi, event: CheckoutEvent): CheckoutUi',
    buggyCode: `data class CheckoutUi(
    var quantity: Int = 1,
    var promoCode: String = "",
    var isSubmitting: Boolean = false,
    var error: String? = null,
)

sealed class CheckoutEvent {
    data class QuantityChanged(val value: Int) : CheckoutEvent()
    data class PromoTyped(val text: String) : CheckoutEvent()
    object SubmitTapped : CheckoutEvent()
    data class SubmitFailed(val message: String) : CheckoutEvent()
}

fun reduce(state: CheckoutUi, event: CheckoutEvent): CheckoutUi {
    // TODO: make CheckoutUi immutable and return a copied state per event
    return state
}
`,
    solution: `data class CheckoutUi(
    val quantity: Int = 1,
    val promoCode: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
)

sealed class CheckoutEvent {
    data class QuantityChanged(val value: Int) : CheckoutEvent()
    data class PromoTyped(val text: String) : CheckoutEvent()
    object SubmitTapped : CheckoutEvent()
    data class SubmitFailed(val message: String) : CheckoutEvent()
}

fun reduce(state: CheckoutUi, event: CheckoutEvent): CheckoutUi = when (event) {
    is CheckoutEvent.QuantityChanged -> state.copy(quantity = event.value.coerceIn(1, 99), error = null)
    is CheckoutEvent.PromoTyped -> state.copy(promoCode = event.text.trim().uppercase(), error = null)
    CheckoutEvent.SubmitTapped -> state.copy(isSubmitting = true, error = null)
    is CheckoutEvent.SubmitFailed -> state.copy(isSubmitting = false, error = event.message)
}
`,
    hint: 'Data classes give you `copy(...)` for free — return `state.copy(field = newValue)` from each `when` branch.',
    explanation:
      'A Compose-style renderer only re-draws when the state object it observes changes identity, so mutating a `var` inside the old object leaves the screen stale. Keeping every property `val` and returning `state.copy(...)` guarantees a fresh, comparable value per event. Clamping and normalising inside the reducer keeps the UI layer dumb and testable.',
    rules: [
      { label: 'Returns a new state with copy(...)', type: 'mustContain', pattern: '\\.copy\\s*\\(', regex: true },
      { label: 'Quantity is clamped into 1..99', type: 'mustContain', pattern: 'coerceIn\\s*\\(\\s*1\\s*,\\s*99\\s*\\)|coerceAtLeast|maxOf\\s*\\(|minOf\\s*\\(', regex: true },
      { label: 'CheckoutUi no longer exposes a mutable quantity', type: 'mustNotContain', pattern: 'var\\s+quantity', regex: true },
    ],
  },
  {
    id: 'kotlin-single-slot-keyed-remember',
    number: 17,
    language: 'kotlin',
    kind: 'build',
    title: 'Single-Slot Keyed Remember',
    difficulty: 'Medium',
    topic: 'Compose-style State',
    statement:
      'Implement `RememberSlot<K, V>`, a one-entry memo that behaves like `remember(key) { ... }`: `remember(key, compute)` returns the cached value while `key` equals the previously remembered key (structural equality), and only calls `compute()` when the key changes or nothing has been remembered yet.\n\nRequirements: `computeCount` increments exactly once per real computation; a computed value of `null` (when `V` is nullable) must still be cached — do not use `null` as the "empty" marker; `reset()` forgets the slot so the next call recomputes.',
    functionSignature: 'class RememberSlot<K, V> { fun remember(key: K, compute: () -> V): V; fun reset() }',
    buggyCode: `class RememberSlot<K, V> {
    var computeCount: Int = 0
        private set

    fun remember(key: K, compute: () -> V): V {
        // TODO: return the cached value while the key is unchanged
        computeCount++
        return compute()
    }

    fun reset() {
        // TODO
    }
}
`,
    solution: `class RememberSlot<K, V> {
    private var hasValue = false
    private var lastKey: K? = null
    private var lastValue: V? = null

    var computeCount: Int = 0
        private set

    fun remember(key: K, compute: () -> V): V {
        if (hasValue && lastKey == key) {
            @Suppress("UNCHECKED_CAST")
            return lastValue as V
        }
        val value = compute()
        computeCount++
        lastKey = key
        lastValue = value
        hasValue = true
        return value
    }

    fun reset() {
        hasValue = false
        lastKey = null
        lastValue = null
    }
}
`,
    hint: 'Keep a separate boolean "has a value" flag so a cached `null` is distinguishable from an empty slot.',
    explanation:
      'The slot compares the new key against the last one with `==` and short-circuits when they match, exactly like `remember(key1)` in Compose. Using `null` as the empty sentinel silently breaks for nullable results, so an explicit `hasValue` flag is the safe choice. This pattern removes redundant parsing, formatting and layout work during frequent recompositions.',
    rules: [
      { label: 'Compares the incoming key with the remembered key', type: 'mustContain', pattern: 'lastKey\\s*==\\s*key|key\\s*==\\s*lastKey|lastKey\\s*!=\\s*key|key\\s*!=\\s*lastKey', regex: true },
      { label: 'Tracks whether a value has been remembered without relying on null', type: 'mustContain', pattern: 'hasValue|isEmpty|initialized|Empty', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-playlist-row-keys-drift',
    number: 11,
    language: 'kotlin',
    kind: 'debug',
    title: 'Playlist Row Keys Drift',
    difficulty: 'Medium',
    topic: 'Compose-style State',
    statement:
      '`diffRows` decides which playlist rows get an insert, remove or move animation by comparing row keys between the old and new lists. When a track is inserted at the top, every row below it animates as "moved", and deleting the first track animates the *last* row as removed. Rows must be identified by something stable across reorders and inserts. Find the one-line cause and fix it.',
    functionSignature: 'fun rowKey(index: Int, track: Track): Any',
    buggyCode: `data class Track(val id: String, val title: String, val durationSec: Int)

data class RowDiff(val inserted: List<String>, val removed: List<String>, val moved: List<String>)

/** Keys drive which rows animate; a key must survive reorders and inserts. */
fun rowKey(index: Int, track: Track): Any = index

fun diffRows(old: List<Track>, new: List<Track>): RowDiff {
    val oldKeys = old.mapIndexed { i, t -> rowKey(i, t) }
    val newKeys = new.mapIndexed { i, t -> rowKey(i, t) }
    val oldSet = oldKeys.toSet()
    val newSet = newKeys.toSet()
    val inserted = newKeys.filter { it !in oldSet }.map { it.toString() }
    val removed = oldKeys.filter { it !in newSet }.map { it.toString() }
    val moved = newKeys
        .filterIndexed { i, k -> k in oldSet && oldKeys.indexOf(k) != i }
        .map { it.toString() }
    return RowDiff(inserted, removed, moved)
}
`,
    solution: `data class Track(val id: String, val title: String, val durationSec: Int)

data class RowDiff(val inserted: List<String>, val removed: List<String>, val moved: List<String>)

/** Keys drive which rows animate; a key must survive reorders and inserts. */
fun rowKey(index: Int, track: Track): Any = track.id

fun diffRows(old: List<Track>, new: List<Track>): RowDiff {
    val oldKeys = old.mapIndexed { i, t -> rowKey(i, t) }
    val newKeys = new.mapIndexed { i, t -> rowKey(i, t) }
    val oldSet = oldKeys.toSet()
    val newSet = newKeys.toSet()
    val inserted = newKeys.filter { it !in oldSet }.map { it.toString() }
    val removed = oldKeys.filter { it !in newSet }.map { it.toString() }
    val moved = newKeys
        .filterIndexed { i, k -> k in oldSet && oldKeys.indexOf(k) != i }
        .map { it.toString() }
    return RowDiff(inserted, removed, moved)
}
`,
    hint: 'A position is not an identity — what does a track carry that does not change when its neighbours do?',
    explanation:
      'Using the list index as the row key means "row 3" is the same key before and after an insert, so the differ believes content changed in place and everything shifts. Keying by `track.id` lets the differ recognise the same track at a new position, which is exactly what `LazyColumn(key = ...)` and `DiffUtil` rely on. Stable keys also preserve per-row state such as scroll position and expanded toggles.',
    rules: [
      { label: 'Keys rows by the stable track id', type: 'mustContain', pattern: 'track\\.id', regex: true },
      { label: 'No longer keys rows by list position', type: 'mustNotContain', pattern: '(=|return)\\s*index\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-signup-form-derived-flags',
    number: 18,
    language: 'kotlin',
    kind: 'build',
    title: 'Signup Form Derived Flags',
    difficulty: 'Easy',
    topic: 'Compose-style State',
    statement:
      'A signup screen holds `email`, `password` and `acceptedTerms` as mutable inputs. The starter also *stores* `canSubmit` and expects callers to remember to call `recompute()` — they forget, and the button enables late. Turn the derived flags into computed properties (custom `get()`) so they can never be stale, and delete `recompute()`.\n\nRules: `emailValid` is true when the email contains `@` and the part after `@` contains a `.`; `passwordStrong` needs length ≥ 10 and at least one digit; `canSubmit` is `emailValid && passwordStrong && acceptedTerms`.',
    functionSignature: 'class SignupFormState { val emailValid: Boolean; val passwordStrong: Boolean; val canSubmit: Boolean }',
    buggyCode: `class SignupFormState {
    var email: String = ""
    var password: String = ""
    var acceptedTerms: Boolean = false

    var emailValid: Boolean = false
    var passwordStrong: Boolean = false
    var canSubmit: Boolean = false

    fun recompute() {
        // TODO: derive the flags instead of storing them
    }
}
`,
    solution: `class SignupFormState {
    var email: String = ""
    var password: String = ""
    var acceptedTerms: Boolean = false

    val emailValid: Boolean
        get() = email.contains('@') && email.substringAfter('@').contains('.')

    val passwordStrong: Boolean
        get() = password.length >= 10 && password.any { it.isDigit() }

    val canSubmit: Boolean
        get() = emailValid && passwordStrong && acceptedTerms
}
`,
    hint: 'A `val` with a custom `get()` is re-evaluated on every read — there is nothing to keep in sync.',
    explanation:
      'Derived state that is stored separately has two sources of truth and drifts the moment someone updates an input without recomputing. A computed getter (the plain-Kotlin cousin of `derivedStateOf`) recalculates from the inputs on every read, so the flags are correct by construction. For expensive derivations you would memoise, but for cheap checks like these a getter is the simplest correct answer.',
    rules: [
      { label: 'Flags are computed with a custom getter', type: 'mustContain', pattern: 'get\\s*\\(\\s*\\)\\s*=', regex: true },
      { label: 'canSubmit is no longer stored as a var', type: 'mustNotContain', pattern: 'var\\s+canSubmit', regex: true },
      { label: 'recompute() is gone', type: 'mustNotContain', pattern: 'fun\\s+recompute', regex: true },
    ],
  },
  {
    id: 'kotlin-station-search-bar-shadow-copy',
    number: 12,
    language: 'kotlin',
    kind: 'debug',
    title: 'Station Search Bar Shadow Copy',
    difficulty: 'Medium',
    topic: 'Compose-style State',
    statement:
      'The bike-share map screen owns the search `query` (it is saved and restored across rotation) and hoists it into `StationSearchBar`, which should be stateless: it renders whatever `query` it is given and reports edits through `onQueryChange`. After a rotation restores `query = "Mars"` the bar draws `[]`, and tapping clear leaves the screen filtering by the old text. The bar keeps a private copy of the hoisted state — remove it and make the bar work purely from its parameters.',
    functionSignature: 'class StationSearchBar(onQueryChange: (String) -> Unit) { fun render(query: String): String; fun onKey(query: String, ch: Char); fun onClear() }',
    buggyCode: `class StationSearchBar(private val onQueryChange: (String) -> Unit) {
    private var text: String = ""

    fun render(query: String): String = "[$text]"

    fun onKey(query: String, ch: Char) {
        text += ch
        onQueryChange(text)
    }

    fun onClear() {
        text = ""
    }
}

class StationSearchScreen {
    var query: String = ""
        private set

    private val bar = StationSearchBar(onQueryChange = { query = it })

    fun restore(savedQuery: String) { query = savedQuery }
    fun type(ch: Char) = bar.onKey(query, ch)
    fun clear() = bar.onClear()
    fun draw(): String = bar.render(query)
}
`,
    solution: `class StationSearchBar(private val onQueryChange: (String) -> Unit) {
    fun render(query: String): String = "[$query]"

    fun onKey(query: String, ch: Char) {
        onQueryChange(query + ch)
    }

    fun onClear() {
        onQueryChange("")
    }
}

class StationSearchScreen {
    var query: String = ""
        private set

    private val bar = StationSearchBar(onQueryChange = { query = it })

    fun restore(savedQuery: String) { query = savedQuery }
    fun type(ch: Char) = bar.onKey(query, ch)
    fun clear() = bar.onClear()
    fun draw(): String = bar.render(query)
}
`,
    hint: 'A hoisted-state child should have no `var` of its own — read the parameter, write through the callback.',
    explanation:
      'Hoisting means the parent is the single source of truth and the child is a pure function of what it receives plus callbacks it invokes. The private `text` field re-introduces a second copy that goes stale on restore and never tells the parent about the clear. Rendering from `query` and routing every edit through `onQueryChange` keeps the child stateless and trivially testable.',
    rules: [
      { label: 'Renders the hoisted query parameter', type: 'mustContain', pattern: '\\[\\$query\\]|\\[\\$\\{\\s*query\\s*\\}\\]', regex: true },
      { label: 'Clear notifies the owner through the callback', type: 'mustContain', pattern: 'onQueryChange\\s*\\(\\s*""\\s*\\)', regex: true },
      { label: 'The bar no longer keeps a private copy of the text', type: 'mustNotContain', pattern: 'private\\s+var\\s+text', regex: true },
    ],
  },
  {
    id: 'kotlin-double-tap-guard-identity',
    number: 13,
    language: 'kotlin',
    kind: 'debug',
    title: 'Double-Tap Guard Never Matches',
    difficulty: 'Easy',
    topic: 'Compose-style State',
    statement:
      'The gesture layer and the accessibility layer both deliver a `TapEvent` for the same tap, so `TapDeduper.shouldHandle` should return `false` for a second event with the same `targetId` and `frame` inside the window. In production the "Add to bag" action fires twice every time. `recent.contains(event)` never finds the duplicate. Fix the root cause with the smallest change.',
    functionSignature: 'class TapDeduper(windowFrames: Long = 3) { fun shouldHandle(event: TapEvent): Boolean }',
    buggyCode: `class TapEvent(val targetId: String, val frame: Long)

class TapDeduper(private val windowFrames: Long = 3) {
    private val recent = ArrayDeque<TapEvent>()

    fun shouldHandle(event: TapEvent): Boolean {
        while (recent.isNotEmpty() && event.frame - recent.first().frame > windowFrames) {
            recent.removeFirst()
        }
        if (recent.contains(event)) return false
        recent.addLast(event)
        return true
    }
}
`,
    solution: `data class TapEvent(val targetId: String, val frame: Long)

class TapDeduper(private val windowFrames: Long = 3) {
    private val recent = ArrayDeque<TapEvent>()

    fun shouldHandle(event: TapEvent): Boolean {
        while (recent.isNotEmpty() && event.frame - recent.first().frame > windowFrames) {
            recent.removeFirst()
        }
        if (recent.contains(event)) return false
        recent.addLast(event)
        return true
    }
}
`,
    hint: 'Two separately constructed events describe the same tap — what kind of class compares by content rather than by reference?',
    explanation:
      'A plain `class` inherits `equals` from `Any`, which is reference identity, so two event objects built by different layers are never "equal" and `contains` always misses. Declaring `data class TapEvent` generates structural `equals`/`hashCode` over the constructor properties, which is what de-duplication needs. The same mistake breaks `distinctUntilChanged`, `Set` membership and Compose skipping.',
    rules: [
      { label: 'TapEvent compares by content (data class)', type: 'mustContain', pattern: 'data\\s+class\\s+TapEvent', regex: true },
      { label: 'TapEvent is no longer a plain class', type: 'mustNotContain', pattern: '(^|\\n)\\s*class\\s+TapEvent', regex: true },
    ],
  },

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================
  {
    id: 'kotlin-foreground-only-flow-collector',
    number: 19,
    language: 'kotlin',
    kind: 'build',
    title: 'Foreground-Only Flow Collector',
    difficulty: 'Hard',
    topic: 'Lifecycle',
    statement:
      'A screen exposes its lifecycle as `StateFlow<ScreenState>` (ordered `DESTROYED < INITIALIZED < CREATED < STARTED < RESUMED`). Implement `Flow<T>.collectWhileForeground(owner, scope, action)` so the upstream flow is collected only while the screen is at least `STARTED`: when the state drops below `STARTED` the running collection is cancelled, when it comes back up a **fresh** collection starts, and when the screen reaches `DESTROYED` the returned `Job` completes.\n\nUse `isAtLeast(ScreenState.STARTED)`. Do not collect the upstream once per state emission — a `RESUMED` after `STARTED` must not restart the collection.',
    functionSignature: 'fun <T> Flow<T>.collectWhileForeground(owner: ScreenOwner, scope: CoroutineScope, action: suspend (T) -> Unit): Job',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

enum class ScreenState { DESTROYED, INITIALIZED, CREATED, STARTED, RESUMED }

fun ScreenState.isAtLeast(other: ScreenState): Boolean = ordinal >= other.ordinal

interface ScreenOwner {
    val screenState: StateFlow<ScreenState>
}

fun <T> Flow<T>.collectWhileForeground(
    owner: ScreenOwner,
    scope: CoroutineScope,
    action: suspend (T) -> Unit,
): Job {
    // TODO: collect only while the owner is at least STARTED; stop at DESTROYED
    return scope.launch { collect { action(it) } }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

enum class ScreenState { DESTROYED, INITIALIZED, CREATED, STARTED, RESUMED }

fun ScreenState.isAtLeast(other: ScreenState): Boolean = ordinal >= other.ordinal

interface ScreenOwner {
    val screenState: StateFlow<ScreenState>
}

fun <T> Flow<T>.collectWhileForeground(
    owner: ScreenOwner,
    scope: CoroutineScope,
    action: suspend (T) -> Unit,
): Job {
    val upstream = this
    return scope.launch {
        owner.screenState
            .takeWhile { it != ScreenState.DESTROYED }
            .map { it.isAtLeast(ScreenState.STARTED) }
            .distinctUntilChanged()
            .collectLatest { foreground ->
                if (foreground) upstream.collect { action(it) }
            }
    }
}
`,
    hint: 'Map the lifecycle to a boolean "foreground" flow, de-duplicate it, and let `collectLatest` cancel the previous block whenever it flips.',
    explanation:
      '`collectLatest` cancels the running block each time a new value arrives, so mapping the lifecycle to `isAtLeast(STARTED)` and de-duplicating with `distinctUntilChanged` gives exactly one cancellation per background transition and one restart per foreground transition. `takeWhile` on `DESTROYED` lets the outer flow complete so the job finishes instead of leaking. This is the mechanism behind `repeatOnLifecycle(STARTED)`, and it is what stops a location or socket stream from burning battery while the app is in the background.',
    rules: [
      { label: 'Cancels and restarts the collection on lifecycle changes', type: 'mustContain', pattern: 'collectLatest\\s*\\{|\\.cancel\\s*\\(|cancelAndJoin', regex: true },
      { label: 'Gates on being at least STARTED', type: 'mustContain', pattern: 'isAtLeast\\s*\\(\\s*ScreenState\\.STARTED\\s*\\)', regex: true },
      { label: 'Stops when the owner is destroyed', type: 'mustContain', pattern: 'takeWhile|!=\\s*ScreenState\\.DESTROYED|==\\s*ScreenState\\.DESTROYED', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-draft-note-saved-state-round-trip',
    number: 20,
    language: 'kotlin',
    kind: 'build',
    title: 'Draft Note Saved-State Round Trip',
    difficulty: 'Easy',
    topic: 'Lifecycle',
    statement:
      'A note editor must survive configuration changes and process death. Saved state is modelled as `Map<String, Any?>`. Implement `DraftNote.toSavedState()` writing the keys `title`, `body`, `cursor`, `pinned`, and `restoreDraftNote(saved)` that rebuilds the note defensively: a `null` map or a missing/wrong-typed value falls back to the defaults (`""`, `""`, `0`, `false`) using safe casts (`as?`), and `cursor` is clamped into `0..body.length` so a restored caret can never point past the text.',
    functionSignature: 'fun DraftNote.toSavedState(): SavedState; fun restoreDraftNote(saved: SavedState?): DraftNote',
    buggyCode: `typealias SavedState = Map<String, Any?>

data class DraftNote(val title: String, val body: String, val cursor: Int, val pinned: Boolean)

fun DraftNote.toSavedState(): SavedState {
    // TODO
    return emptyMap()
}

fun restoreDraftNote(saved: SavedState?): DraftNote {
    // TODO: defaults for missing values, clamp the cursor
    return DraftNote("", "", 0, false)
}
`,
    solution: `typealias SavedState = Map<String, Any?>

data class DraftNote(val title: String, val body: String, val cursor: Int, val pinned: Boolean)

fun DraftNote.toSavedState(): SavedState = mapOf(
    "title" to title,
    "body" to body,
    "cursor" to cursor,
    "pinned" to pinned,
)

fun restoreDraftNote(saved: SavedState?): DraftNote {
    if (saved == null) return DraftNote("", "", 0, false)
    val body = saved["body"] as? String ?: ""
    return DraftNote(
        title = saved["title"] as? String ?: "",
        body = body,
        cursor = (saved["cursor"] as? Int ?: 0).coerceIn(0, body.length),
        pinned = saved["pinned"] as? Boolean ?: false,
    )
}
`,
    hint: '`saved["cursor"] as? Int ?: 0` reads "cast if possible, otherwise default".',
    explanation:
      'Saved state survives process death only as primitives, so the data class needs an explicit round trip. Safe casts with defaults make restore tolerant of older app versions that wrote different keys or types, and clamping the cursor prevents an `IndexOutOfBounds` the moment the editor places the caret. Never trust restored values to satisfy your invariants.',
    rules: [
      { label: 'Restores strings with a safe cast and default', type: 'mustContain', pattern: 'as\\?\\s*String', regex: true },
      { label: 'Clamps the cursor into the body length', type: 'mustContain', pattern: 'coerceIn\\s*\\(|coerceAtMost\\s*\\(|minOf\\s*\\(|min\\s*\\(', regex: true },
      { label: 'Writes the pinned flag', type: 'mustContain', pattern: '"pinned"\\s*to\\s*pinned|put\\s*\\(\\s*"pinned"', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-claim-detail-id-lost-on-restart',
    number: 14,
    language: 'kotlin',
    kind: 'debug',
    title: 'Claim Detail Forgets Its Id',
    difficulty: 'Hard',
    topic: 'Lifecycle',
    statement:
      'An insurance app opens `ClaimDetailModel` with the claim id from the launch intent. When the OS kills the process in the background and the user returns, the model is rebuilt with `launchClaimId = null` and the saved-state store restored from the previous snapshot — and `load()` returns `Missing` even though the store was handed back intact. The id must be persisted into `saved` on first launch and read from `saved` afterwards, so it survives process death. Fix the model (the `SavedStateStore` stand-in is correct).',
    functionSignature: 'class ClaimDetailModel(saved: SavedStateStore, launchClaimId: String?, fetch: (String) -> String?) { fun load(): ClaimUi }',
    buggyCode: `class SavedStateStore {
    private val values = mutableMapOf<String, Any?>()
    operator fun get(key: String): Any? = values[key]
    operator fun set(key: String, value: Any?) { values[key] = value }
    fun snapshot(): Map<String, Any?> = values.toMap()
    fun restoreFrom(other: Map<String, Any?>) { values.putAll(other) }
}

sealed class ClaimUi {
    object Missing : ClaimUi()
    data class Loaded(val id: String, val summary: String) : ClaimUi()
}

class ClaimDetailModel(
    private val saved: SavedStateStore,
    launchClaimId: String?,
    private val fetch: (String) -> String?,
) {
    private var claimId: String? = launchClaimId

    fun load(): ClaimUi {
        val id = claimId ?: return ClaimUi.Missing
        val summary = fetch(id) ?: return ClaimUi.Missing
        return ClaimUi.Loaded(id, summary)
    }
}
`,
    solution: `class SavedStateStore {
    private val values = mutableMapOf<String, Any?>()
    operator fun get(key: String): Any? = values[key]
    operator fun set(key: String, value: Any?) { values[key] = value }
    fun snapshot(): Map<String, Any?> = values.toMap()
    fun restoreFrom(other: Map<String, Any?>) { values.putAll(other) }
}

sealed class ClaimUi {
    object Missing : ClaimUi()
    data class Loaded(val id: String, val summary: String) : ClaimUi()
}

class ClaimDetailModel(
    private val saved: SavedStateStore,
    launchClaimId: String?,
    private val fetch: (String) -> String?,
) {
    init {
        if (launchClaimId != null) saved[KEY_CLAIM_ID] = launchClaimId
    }

    private val claimId: String?
        get() = saved[KEY_CLAIM_ID] as? String

    fun load(): ClaimUi {
        val id = claimId ?: return ClaimUi.Missing
        val summary = fetch(id) ?: return ClaimUi.Missing
        return ClaimUi.Loaded(id, summary)
    }

    private companion object {
        const val KEY_CLAIM_ID = "claimId"
    }
}
`,
    hint: 'Anything that only lives in a field dies with the process — write it to `saved` once, then always read it back from there.',
    explanation:
      'Fields on a view model are recreated empty after process death, but the saved-state store is restored by the framework. Writing the launch argument into the store on first construction and reading the id through the store afterwards makes the model indifferent to whether it was rebuilt from an intent or from a snapshot. This is the `SavedStateHandle` pattern, and it is one of the most common sources of "works on my phone" crashes on low-memory devices.',
    rules: [
      { label: 'Persists the launch id into the saved-state store', type: 'mustContain', pattern: 'saved\\s*\\[[^\\]]+\\]\\s*=|saved\\.set\\s*\\(', regex: true },
      { label: 'Reads the id back from the saved-state store', type: 'mustContain', pattern: 'saved\\s*\\[[^\\]]+\\]\\s*as\\??|saved\\.get\\s*\\(', regex: true },
      { label: 'The id no longer lives only in a plain field', type: 'mustNotContain', pattern: 'private\\s+var\\s+claimId\\s*:\\s*String\\?\\s*=\\s*launchClaimId', regex: true },
    ],
  },
  {
    id: 'kotlin-single-fire-route-signal',
    number: 21,
    language: 'kotlin',
    kind: 'build',
    title: 'Single-Fire Route Signal',
    difficulty: 'Medium',
    topic: 'Lifecycle',
    statement:
      'A view model publishes navigation as state (`RouteSignal<Route>?`), and after a rotation the new screen re-reads the same state and navigates again. Implement `RouteSignal<T : Any>` so the payload can be taken exactly once: `takeOrNull()` returns the payload on the first call and `null` on every later call; `peek()` always returns it without spending; `isSpent` reports whether it was taken. Two observers may race on different threads, so the "spend" must be an atomic compare-and-set (`AtomicBoolean`), not a plain `var`.',
    functionSignature: 'class RouteSignal<T : Any>(payload: T) { fun takeOrNull(): T?; fun peek(): T; val isSpent: Boolean }',
    buggyCode: `class RouteSignal<T : Any>(private val payload: T) {
    val isSpent: Boolean
        get() = false // TODO

    fun takeOrNull(): T? {
        // TODO: hand out the payload once, atomically
        return payload
    }

    fun peek(): T = payload
}
`,
    solution: `import java.util.concurrent.atomic.AtomicBoolean

class RouteSignal<T : Any>(private val payload: T) {
    private val spent = AtomicBoolean(false)

    val isSpent: Boolean
        get() = spent.get()

    fun takeOrNull(): T? = if (spent.compareAndSet(false, true)) payload else null

    fun peek(): T = payload
}
`,
    hint: '`AtomicBoolean.compareAndSet(false, true)` succeeds for exactly one caller.',
    explanation:
      'State is re-delivered to every new observer, so a navigation command modelled as state must carry its own "already handled" flag. `compareAndSet` flips the flag and returns whether *this* caller won, which makes `takeOrNull` correct even when two collectors race. `peek` exists for logging and tests that must not consume the signal.',
    rules: [
      { label: 'Spends the signal with an atomic compare-and-set', type: 'mustContain', pattern: 'compareAndSet\\s*\\(\\s*false\\s*,\\s*true\\s*\\)', regex: true },
      { label: 'Uses an atomic flag', type: 'mustContain', pattern: 'AtomicBoolean|AtomicReference', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-courier-map-tracks-after-stop',
    number: 15,
    language: 'kotlin',
    kind: 'debug',
    title: 'Courier Map Tracks After Stop',
    difficulty: 'Medium',
    topic: 'Lifecycle',
    statement:
      '`CourierMapController` starts collecting GPS positions in `onStart` and should stop in `onStop`. QA reports the battery drains while the app is backgrounded, and after several start/stop cycles the map jitters because multiple collectors are alive. Dropping the `Job` reference does not stop the coroutine. Fix `onStop` so the collector is actually cancelled.',
    functionSignature: 'class CourierMapController(scope: CoroutineScope, positions: Flow<Pair<Double, Double>>) { fun onStart(); fun onStop(); fun onDestroy() }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class CourierMapController(
    private val scope: CoroutineScope,
    private val positions: Flow<Pair<Double, Double>>,
) {
    var lastRendered: Pair<Double, Double>? = null
        private set

    private var trackingJob: Job? = null

    fun onStart() {
        trackingJob = scope.launch {
            positions.collect { lastRendered = it }
        }
    }

    fun onStop() {
        trackingJob = null
    }

    fun onDestroy() {
        onStop()
    }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class CourierMapController(
    private val scope: CoroutineScope,
    private val positions: Flow<Pair<Double, Double>>,
) {
    var lastRendered: Pair<Double, Double>? = null
        private set

    private var trackingJob: Job? = null

    fun onStart() {
        trackingJob?.cancel()
        trackingJob = scope.launch {
            positions.collect { lastRendered = it }
        }
    }

    fun onStop() {
        trackingJob?.cancel()
        trackingJob = null
    }

    fun onDestroy() {
        onStop()
    }
}
`,
    hint: 'A `Job` keeps running until someone calls `cancel()` on it — nulling the variable only loses your handle.',
    explanation:
      'Coroutines are not garbage-collected when you drop their `Job`; they live until they complete or are cancelled. `onStop` must call `trackingJob?.cancel()` so the position stream is released, and `onStart` should cancel any stale job before launching a new one so repeated cycles never stack collectors. Tying every long-lived collector to an explicit lifecycle stop is the difference between a map that idles and one that drains the battery.',
    rules: [
      { label: 'Cancels the tracking job', type: 'mustContain', pattern: 'trackingJob\\s*\\?\\.\\s*cancel\\s*\\(|trackingJob\\s*!!\\s*\\.\\s*cancel\\s*\\(|\\.cancel\\s*\\(', regex: true },
      { label: 'onStop no longer just drops the reference', type: 'mustNotContain', pattern: 'fun\\s+onStop\\s*\\(\\s*\\)\\s*\\{\\s*trackingJob\\s*=\\s*null\\s*\\}', regex: true },
    ],
  },

  // ===========================================================================
  // NETWORKING LAYER
  // ===========================================================================
  {
    id: 'kotlin-menu-api-outcome-mapping',
    number: 22,
    language: 'kotlin',
    kind: 'build',
    title: 'Menu API Outcome Mapping',
    difficulty: 'Medium',
    topic: 'Networking Layer',
    statement:
      'A restaurant app wraps every HTTP call in a sealed `ApiOutcome<T>` so the UI never sees raw status codes or exceptions. Implement `callApi(execute, parse)`:\n\n- `execute()` throwing `ConnectionException` → `Offline(cause)`\n- status `200..299` → `Ok(parse(body))`; if `parse` throws → `Malformed(cause)`\n- `401` or `403` → `Unauthorized`\n- any other `400..499` → `ClientError(status)`\n- `500..599` → `ServerError(status)`\n- anything else → `Malformed` with an `IllegalStateException` naming the status.',
    functionSignature: 'fun <T> callApi(execute: () -> RawResponse, parse: (String) -> T): ApiOutcome<T>',
    buggyCode: `class RawResponse(val status: Int, val body: String)

class ConnectionException(message: String) : Exception(message)

sealed class ApiOutcome<out T> {
    data class Ok<T>(val value: T) : ApiOutcome<T>()
    object Unauthorized : ApiOutcome<Nothing>()
    data class ClientError(val status: Int) : ApiOutcome<Nothing>()
    data class ServerError(val status: Int) : ApiOutcome<Nothing>()
    data class Offline(val cause: Throwable) : ApiOutcome<Nothing>()
    data class Malformed(val cause: Throwable) : ApiOutcome<Nothing>()
}

fun <T> callApi(execute: () -> RawResponse, parse: (String) -> T): ApiOutcome<T> {
    // TODO: map transport errors, status ranges and parse failures
    return ApiOutcome.Ok(parse(execute().body))
}
`,
    solution: `class RawResponse(val status: Int, val body: String)

class ConnectionException(message: String) : Exception(message)

sealed class ApiOutcome<out T> {
    data class Ok<T>(val value: T) : ApiOutcome<T>()
    object Unauthorized : ApiOutcome<Nothing>()
    data class ClientError(val status: Int) : ApiOutcome<Nothing>()
    data class ServerError(val status: Int) : ApiOutcome<Nothing>()
    data class Offline(val cause: Throwable) : ApiOutcome<Nothing>()
    data class Malformed(val cause: Throwable) : ApiOutcome<Nothing>()
}

fun <T> callApi(execute: () -> RawResponse, parse: (String) -> T): ApiOutcome<T> {
    val response = try {
        execute()
    } catch (e: ConnectionException) {
        return ApiOutcome.Offline(e)
    }
    return when (response.status) {
        in 200..299 -> try {
            ApiOutcome.Ok(parse(response.body))
        } catch (e: Exception) {
            ApiOutcome.Malformed(e)
        }
        401, 403 -> ApiOutcome.Unauthorized
        in 400..499 -> ApiOutcome.ClientError(response.status)
        in 500..599 -> ApiOutcome.ServerError(response.status)
        else -> ApiOutcome.Malformed(IllegalStateException("unexpected status \${response.status}"))
    }
}
`,
    hint: 'Catch the transport exception around `execute()` only, then `when (status) { in 200..299 -> ... }` with the specific codes listed before the ranges.',
    explanation:
      'Mapping at the boundary turns three failure channels (exceptions, status codes, parse errors) into one exhaustive sealed type, so every screen handles `Unauthorized` and `Offline` the same way and the compiler enforces it. Order matters in the `when`: `401, 403` must appear before the `400..499` range or they would be swallowed as generic client errors. Keeping the parse `try` separate from the transport `try` stops a JSON bug from being reported as "offline".',
    rules: [
      { label: 'Maps transport failures to Offline', type: 'mustContain', pattern: 'catch\\s*\\(\\s*\\w+\\s*:\\s*ConnectionException\\s*\\)', regex: true },
      { label: 'Treats the 2xx range as success', type: 'mustContain', pattern: 'in\\s*200\\s*\\.\\.\\s*299|in\\s*200\\s*until\\s*300|/\\s*100\\s*==\\s*2', regex: true },
      { label: 'Maps 401 to Unauthorized', type: 'mustContain', pattern: '401' },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-relay-stage-chain',
    number: 23,
    language: 'kotlin',
    kind: 'build',
    title: 'Relay Stage Chain',
    difficulty: 'Hard',
    topic: 'Networking Layer',
    statement:
      'Build the interceptor mechanism behind a podcast app\'s HTTP client. A `Stage` receives a `Chain`, may modify the request, must call `chain.proceed(request)` to continue (or short-circuit by returning its own `Response`), and may modify the response on the way back.\n\nImplement `StageChain.proceed`: it invokes `stages[index].handle(...)` with a **new** chain positioned at `index + 1` that carries the (possibly rewritten) request; once `index` reaches `stages.size` it calls `terminal(request)` to perform the real call. `execute(stages, request, terminal)` kicks the chain off at index 0. Stages must run in list order and see each other\'s request changes.',
    functionSignature: 'class StageChain(stages: List<Stage>, index: Int, request: Request, terminal: (Request) -> Response) : Chain',
    buggyCode: `data class Request(val url: String, val headers: Map<String, String> = emptyMap())
data class Response(val status: Int, val body: String, val headers: Map<String, String> = emptyMap())

interface Chain {
    val request: Request
    fun proceed(request: Request): Response
}

fun interface Stage {
    fun handle(chain: Chain): Response
}

class StageChain(
    private val stages: List<Stage>,
    private val index: Int,
    override val request: Request,
    private val terminal: (Request) -> Response,
) : Chain {
    override fun proceed(request: Request): Response {
        // TODO: run the stage at index with a chain positioned at index + 1
        return terminal(request)
    }
}

fun execute(stages: List<Stage>, request: Request, terminal: (Request) -> Response): Response {
    // TODO
    return terminal(request)
}
`,
    solution: `data class Request(val url: String, val headers: Map<String, String> = emptyMap())
data class Response(val status: Int, val body: String, val headers: Map<String, String> = emptyMap())

interface Chain {
    val request: Request
    fun proceed(request: Request): Response
}

fun interface Stage {
    fun handle(chain: Chain): Response
}

class StageChain(
    private val stages: List<Stage>,
    private val index: Int,
    override val request: Request,
    private val terminal: (Request) -> Response,
) : Chain {
    override fun proceed(request: Request): Response {
        if (index >= stages.size) return terminal(request)
        val next = StageChain(stages, index + 1, request, terminal)
        return stages[index].handle(next)
    }
}

fun execute(stages: List<Stage>, request: Request, terminal: (Request) -> Response): Response =
    StageChain(stages, 0, request, terminal).proceed(request)
`,
    hint: 'Each `proceed` builds the next chain object, then hands it to the current stage — recursion through objects, not a loop.',
    explanation:
      'The chain is a recursive pipeline: each `proceed` constructs an immutable successor at `index + 1` carrying the current request, and the stage decides whether to continue by calling `proceed` on it. That design lets a stage wrap the downstream call (timing, retries, auth refresh) or stop it entirely (cache hit), and because each link is a fresh object the chain is safe to reuse across concurrent requests. This is the same shape as OkHttp\'s `RealInterceptorChain`.',
    rules: [
      { label: 'Advances to the next stage by building a chain at index + 1', type: 'mustContain', pattern: 'index\\s*\\+\\s*1', regex: true },
      { label: 'Invokes the current stage', type: 'mustContain', pattern: '\\.handle\\s*\\(', regex: true },
      { label: 'Falls through to the terminal call at the end of the list', type: 'mustContain', pattern: 'terminal\\s*\\(\\s*request\\s*\\)', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-transient-fault-backoff',
    number: 24,
    language: 'kotlin',
    kind: 'build',
    title: 'Transient Fault Backoff',
    difficulty: 'Hard',
    topic: 'Networking Layer',
    statement:
      'Implement retry for a ticketing API. `CallResult.isRetryable()` must be true for `Transport` failures and for HTTP `408`, `429` and any `500..599`; every other status (and `Success`) is not retryable.\n\n`withTransientRetry(maxAttempts, baseDelayMs, maxDelayMs, sleep, call)` invokes `call()` up to `maxAttempts` times. After a retryable failure it waits `baseDelayMs * 2^(attempt-1)` milliseconds (attempt 1 waits `baseDelayMs`), capped at `maxDelayMs`, using the injected `sleep` so tests can run instantly. It returns the first non-retryable result immediately, or the last result when attempts are exhausted. `maxAttempts` below 1 is a programming error (`require`).',
    functionSignature: 'suspend fun <T> withTransientRetry(maxAttempts: Int, baseDelayMs: Long, maxDelayMs: Long, sleep: suspend (Long) -> Unit = { delay(it) }, call: suspend () -> CallResult<T>): CallResult<T>',
    buggyCode: `import kotlinx.coroutines.delay

sealed class CallResult<out T> {
    data class Success<T>(val value: T) : CallResult<T>()
    data class HttpFailure(val status: Int) : CallResult<Nothing>()
    data class Transport(val cause: Throwable) : CallResult<Nothing>()
}

fun CallResult<*>.isRetryable(): Boolean {
    // TODO
    return false
}

suspend fun <T> withTransientRetry(
    maxAttempts: Int,
    baseDelayMs: Long,
    maxDelayMs: Long,
    sleep: suspend (Long) -> Unit = { delay(it) },
    call: suspend () -> CallResult<T>,
): CallResult<T> {
    // TODO: retry only retryable results with capped exponential backoff
    return call()
}
`,
    solution: `import kotlinx.coroutines.delay

sealed class CallResult<out T> {
    data class Success<T>(val value: T) : CallResult<T>()
    data class HttpFailure(val status: Int) : CallResult<Nothing>()
    data class Transport(val cause: Throwable) : CallResult<Nothing>()
}

fun CallResult<*>.isRetryable(): Boolean = when (this) {
    is CallResult.Success -> false
    is CallResult.Transport -> true
    is CallResult.HttpFailure -> status == 408 || status == 429 || status in 500..599
}

suspend fun <T> withTransientRetry(
    maxAttempts: Int,
    baseDelayMs: Long,
    maxDelayMs: Long,
    sleep: suspend (Long) -> Unit = { delay(it) },
    call: suspend () -> CallResult<T>,
): CallResult<T> {
    require(maxAttempts >= 1) { "maxAttempts must be >= 1" }
    var attempt = 0
    while (true) {
        val result = call()
        attempt++
        if (!result.isRetryable() || attempt >= maxAttempts) return result
        val backoff = (baseDelayMs shl (attempt - 1)).coerceAtMost(maxDelayMs)
        sleep(backoff)
    }
}
`,
    hint: 'Decide retryability from the result type first; then `baseDelayMs shl (attempt - 1)` doubles the wait, and `coerceAtMost` caps it.',
    explanation:
      'Retrying a `404` or a `400` only hammers the server with a request that can never succeed, so retry policy must be keyed on transient signals: transport errors, timeouts (408), throttling (429) and server errors (5xx). Exponential backoff with a cap spreads retries out without waiting forever, and injecting `sleep` keeps the unit tests deterministic and fast. Returning the last result when attempts run out lets the caller show a precise error instead of a generic one.',
    rules: [
      { label: 'Treats 429 as retryable', type: 'mustContain', pattern: '429' },
      { label: 'Grows the delay exponentially', type: 'mustContain', pattern: '\\bshl\\b|\\*\\s*2\\b|\\.pow\\s*\\(', regex: true },
      { label: 'Caps the delay at maxDelayMs', type: 'mustContain', pattern: 'coerceAtMost\\s*\\(|minOf\\s*\\(|Math\\.min\\s*\\(|\\bmin\\s*\\(', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-session-token-single-refresh',
    number: 25,
    language: 'kotlin',
    kind: 'build',
    title: 'Session Token Single Refresh',
    difficulty: 'Hard',
    topic: 'Networking Layer',
    statement:
      'When a session token expires, ten in-flight requests all receive `401` at once. Implement `SessionTokens.tokenAfterRejection(rejected)` so the refresh endpoint is called **once** for a given expired token:\n\n- if `currentToken()` already differs from `rejected`, another caller refreshed — return the current token without refreshing;\n- otherwise take a `Mutex` (`withLock`), re-check the same condition inside the lock (a waiter may have been queued behind the refresher), and only then call `refresh(rejected)`, store the result, bump `refreshCount`, and return it.\n\nThe store is shared across coroutines; the current token must be visible across threads.',
    functionSignature: 'class SessionTokens(initialToken: String, refresh: suspend (String) -> String) { suspend fun tokenAfterRejection(rejected: String): String; fun currentToken(): String }',
    buggyCode: `class SessionTokens(
    initialToken: String,
    private val refresh: suspend (expired: String) -> String,
) {
    private var current: String = initialToken

    var refreshCount: Int = 0
        private set

    fun currentToken(): String = current

    suspend fun tokenAfterRejection(rejected: String): String {
        // TODO: refresh at most once per expired token, even under concurrency
        current = refresh(rejected)
        refreshCount++
        return current
    }
}
`,
    solution: `import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class SessionTokens(
    initialToken: String,
    private val refresh: suspend (expired: String) -> String,
) {
    @Volatile private var current: String = initialToken
    private val lock = Mutex()

    var refreshCount: Int = 0
        private set

    fun currentToken(): String = current

    suspend fun tokenAfterRejection(rejected: String): String {
        if (current != rejected) return current
        return lock.withLock {
            if (current != rejected) return@withLock current
            val fresh = refresh(rejected)
            refreshCount++
            current = fresh
            fresh
        }
    }
}
`,
    hint: 'Check-lock-check: compare outside the mutex for the fast path, then compare again inside before refreshing.',
    explanation:
      'A coroutine `Mutex` serialises the refresh without blocking threads, but the lock alone is not enough: every waiter queued behind the first refresher would refresh again as soon as it acquired the lock. Re-checking `current != rejected` inside the lock turns the queue into "first one refreshes, the rest reuse". `@Volatile` makes the fast-path read see the latest token from other threads. Without single-flight, token servers see refresh storms and may revoke the session.',
    rules: [
      { label: 'Serialises the refresh with a coroutine Mutex', type: 'mustContain', pattern: 'Mutex\\s*\\(\\s*\\)', regex: true },
      { label: 'Takes the lock with withLock', type: 'mustContain', pattern: 'withLock' },
      { label: 'Skips the refresh when the token already changed', type: 'mustContain', pattern: 'current\\s*!=\\s*rejected|rejected\\s*!=\\s*current|current\\s*==\\s*rejected|rejected\\s*==\\s*current', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-catalog-refresh-precondition-failed',
    number: 16,
    language: 'kotlin',
    kind: 'debug',
    title: 'Catalog Refresh Precondition Failed',
    difficulty: 'Medium',
    topic: 'Networking Layer',
    statement:
      'A grocery app caches the product catalog with its `ETag` and asks the server whether it changed. The intent: send the cached tag so the server can answer `304 Not Modified` (reuse the cache) or `200` with a new body and tag. Since the last release every refresh with a stale cache fails with `412 Precondition Failed` and the catalog never updates. The response handling is right; the request is asking the wrong question. Fix it.',
    functionSignature: 'fun buildCatalogRequest(url: String, cached: CachedCatalog?): HttpRequest',
    buggyCode: `data class CachedCatalog(val etag: String, val body: String)
data class HttpRequest(val url: String, val headers: Map<String, String>)
data class HttpResponse(val status: Int, val body: String, val headers: Map<String, String>)

fun buildCatalogRequest(url: String, cached: CachedCatalog?): HttpRequest {
    val headers = mutableMapOf("Accept" to "application/json")
    if (cached != null) headers["If-Match"] = cached.etag
    return HttpRequest(url, headers)
}

fun resolveCatalog(response: HttpResponse, cached: CachedCatalog?): CachedCatalog? = when (response.status) {
    304 -> cached
    200 -> CachedCatalog(response.headers["ETag"] ?: "", response.body)
    else -> cached
}
`,
    solution: `data class CachedCatalog(val etag: String, val body: String)
data class HttpRequest(val url: String, val headers: Map<String, String>)
data class HttpResponse(val status: Int, val body: String, val headers: Map<String, String>)

fun buildCatalogRequest(url: String, cached: CachedCatalog?): HttpRequest {
    val headers = mutableMapOf("Accept" to "application/json")
    if (cached != null) headers["If-None-Match"] = cached.etag
    return HttpRequest(url, headers)
}

fun resolveCatalog(response: HttpResponse, cached: CachedCatalog?): CachedCatalog? = when (response.status) {
    304 -> cached
    200 -> CachedCatalog(response.headers["ETag"] ?: "", response.body)
    else -> cached
}
`,
    hint: 'Two ETag headers exist: one means "only proceed if it still matches", the other means "give me the body only if it changed".',
    explanation:
      '`If-Match` is a precondition for writes — the server refuses with `412` when the tag no longer matches. Conditional GETs use `If-None-Match`, which makes the server reply `304` with no body when the tag still matches and `200` with the fresh body otherwise. Getting this right saves bandwidth on every launch and is what lets `resolveCatalog` keep the cache on `304`.',
    rules: [
      { label: 'Sends the cached tag as a conditional GET validator', type: 'mustContain', pattern: 'If-None-Match' },
      { label: 'No longer sends the write precondition header', type: 'mustNotContain', pattern: '"If-Match"' },
      { label: 'Still reuses the cache on 304', type: 'mustContain', pattern: '304' },
    ],
  },

  // ===========================================================================
  // TESTING & DI
  // ===========================================================================
  {
    id: 'kotlin-tip-split-injected-collaborators',
    number: 26,
    language: 'kotlin',
    kind: 'build',
    title: 'Tip Split Injected Collaborators',
    difficulty: 'Easy',
    topic: 'Testing & DI',
    statement:
      '`TipSplitService` builds its own `RemoteRateSource` and `PrinterReceiptSink`, so a unit test cannot run without the network and prints to stdout. Refactor it to receive both collaborators through its primary constructor, typed as the **interfaces** `RateSource` and `ReceiptSink`, and implement `split(totalCents, diners)`: add the service fee (`totalCents * feePercent / 100`, integer math), divide by `diners` rounding **up** to the next cent, record one line through the sink, and return the per-diner amount. `diners` must be positive (`require`).',
    functionSignature: 'class TipSplitService(rates: RateSource, receipts: ReceiptSink) { fun split(totalCents: Long, diners: Int): Long }',
    buggyCode: `interface RateSource { fun serviceFeePercent(): Int }
interface ReceiptSink { fun record(line: String) }

class RemoteRateSource : RateSource {
    override fun serviceFeePercent(): Int = 12
}

class PrinterReceiptSink : ReceiptSink {
    override fun record(line: String) { println(line) }
}

class TipSplitService {
    // TODO: take the collaborators through the constructor as interfaces
    private val rates = RemoteRateSource()
    private val receipts = PrinterReceiptSink()

    fun split(totalCents: Long, diners: Int): Long {
        // TODO
        return 0L
    }
}
`,
    solution: `interface RateSource { fun serviceFeePercent(): Int }
interface ReceiptSink { fun record(line: String) }

class RemoteRateSource : RateSource {
    override fun serviceFeePercent(): Int = 12
}

class PrinterReceiptSink : ReceiptSink {
    override fun record(line: String) { println(line) }
}

class TipSplitService(
    private val rates: RateSource,
    private val receipts: ReceiptSink,
) {
    fun split(totalCents: Long, diners: Int): Long {
        require(diners > 0) { "diners must be positive" }
        val withFee = totalCents + totalCents * rates.serviceFeePercent() / 100
        val perDiner = (withFee + diners - 1) / diners
        receipts.record("split $withFee among $diners -> $perDiner each")
        return perDiner
    }
}
`,
    hint: 'Declare the dependencies as `private val rates: RateSource` in the constructor — the caller (or a DI graph) picks the implementation.',
    explanation:
      'Constructor injection against interfaces lets tests pass a fake rate source and a recording sink, and lets the app wire the real ones in one place. The class no longer knows or cares whether rates come from the network. Ceiling division `(withFee + diners - 1) / diners` keeps money in integer cents and guarantees the split never under-collects.',
    rules: [
      { label: 'Receives the rate source through the constructor as an interface', type: 'mustContain', pattern: '(val|var)\\s+\\w+\\s*:\\s*RateSource', regex: true },
      { label: 'Receives the receipt sink through the constructor as an interface', type: 'mustContain', pattern: '(val|var)\\s+\\w+\\s*:\\s*ReceiptSink', regex: true },
      { label: 'No longer constructs the remote source itself', type: 'mustNotContain', pattern: '=\\s*RemoteRateSource\\s*\\(', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-trial-banner-ignores-clock',
    number: 17,
    language: 'kotlin',
    kind: 'debug',
    title: 'Trial Banner Ignores Its Clock',
    difficulty: 'Easy',
    topic: 'Testing & DI',
    statement:
      '`TrialBanner.daysLeft()` shows how many days remain in a free trial, rounding partial days up. The class accepts a `Clock` so tests can freeze time, yet the test that sets the clock to one hour before expiry gets `0` on CI and `1` on a laptop, depending on when it runs. Make the banner honour the injected clock.',
    functionSignature: 'class TrialBanner(trialEndsAtMs: Long, clock: Clock) { fun daysLeft(): Int }',
    buggyCode: `fun interface Clock {
    fun nowMs(): Long
}

class TrialBanner(private val trialEndsAtMs: Long, private val clock: Clock) {
    fun daysLeft(): Int {
        val now = System.currentTimeMillis()
        val remaining = trialEndsAtMs - now
        return if (remaining <= 0) 0 else ((remaining + DAY_MS - 1) / DAY_MS).toInt()
    }

    companion object {
        const val DAY_MS = 24L * 60 * 60 * 1000
    }
}
`,
    solution: `fun interface Clock {
    fun nowMs(): Long
}

class TrialBanner(private val trialEndsAtMs: Long, private val clock: Clock) {
    fun daysLeft(): Int {
        val now = clock.nowMs()
        val remaining = trialEndsAtMs - now
        return if (remaining <= 0) 0 else ((remaining + DAY_MS - 1) / DAY_MS).toInt()
    }

    companion object {
        const val DAY_MS = 24L * 60 * 60 * 1000
    }
}
`,
    hint: 'The dependency is already injected — the method just never asks it.',
    explanation:
      'Injecting a clock is only useful if every read of "now" goes through it; a single `System.currentTimeMillis()` reintroduces wall-clock dependence and makes the test flaky. With `clock.nowMs()` a fake clock pins the moment, so boundary cases like "one hour left" are deterministic. The same rule applies to `SystemClock.elapsedRealtime()` and `Instant.now()` in Android code.',
    rules: [
      { label: 'Reads the time from the injected clock', type: 'mustContain', pattern: 'clock\\.nowMs\\s*\\(\\s*\\)', regex: true },
      { label: 'No longer reads the system wall clock', type: 'mustNotContain', pattern: 'System\\.currentTimeMillis', regex: true },
    ],
  },
  {
    id: 'kotlin-thumbnail-decoder-hardwired-io',
    number: 18,
    language: 'kotlin',
    kind: 'debug',
    title: 'Thumbnail Decoder Hardwires IO',
    difficulty: 'Medium',
    topic: 'Testing & DI',
    statement:
      '`ThumbnailDecoder.decodeAll` offloads decoding to a background dispatcher. The unit tests run under `runTest` with a `StandardTestDispatcher`, yet they hang or flake because the real work jumps to `Dispatchers.IO`, outside the test scheduler\'s control. Make the dispatcher injectable through the constructor (defaulting to `Dispatchers.IO` for production) and use it in `withContext`.',
    functionSignature: 'class ThumbnailDecoder(decode: (ByteArray) -> String, ioDispatcher: CoroutineDispatcher = Dispatchers.IO) { suspend fun decodeAll(blobs: List<ByteArray>): List<String> }',
    buggyCode: `import kotlinx.coroutines.*

class ThumbnailDecoder(private val decode: (ByteArray) -> String) {
    suspend fun decodeAll(blobs: List<ByteArray>): List<String> = withContext(Dispatchers.IO) {
        blobs.map { decode(it) }
    }
}
`,
    solution: `import kotlinx.coroutines.*

class ThumbnailDecoder(
    private val decode: (ByteArray) -> String,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun decodeAll(blobs: List<ByteArray>): List<String> = withContext(ioDispatcher) {
        blobs.map { decode(it) }
    }
}
`,
    hint: 'Accept a `CoroutineDispatcher` parameter with a production default; tests pass the test dispatcher.',
    explanation:
      'A hard-coded `Dispatchers.IO` cannot be replaced by the test scheduler, so virtual time and `advanceUntilIdle` never see the work and the test either blocks on real threads or races. Taking the dispatcher as a constructor parameter (defaulting to IO) is the standard Android pattern: production wiring is unchanged and tests inject `StandardTestDispatcher`, making the suspend function fully deterministic.',
    rules: [
      { label: 'Accepts a CoroutineDispatcher', type: 'mustContain', pattern: 'CoroutineDispatcher' },
      { label: 'Switches to the injected dispatcher', type: 'mustContain', pattern: 'withContext\\s*\\(\\s*\\w*[dD]ispatcher\\w*\\s*\\)', regex: true },
      { label: 'No longer hard-codes Dispatchers.IO in withContext', type: 'mustNotContain', pattern: 'withContext\\s*\\(\\s*Dispatchers\\.', regex: true },
    ],
  },
  {
    id: 'kotlin-parcel-label-sequence',
    number: 27,
    language: 'kotlin',
    kind: 'build',
    title: 'Parcel Label Sequence',
    difficulty: 'Medium',
    topic: 'Testing & DI',
    statement:
      'Parcel intake assigns each package a label. Production may use random ids, but snapshot tests need reproducible ones. Implement `SequentialLabelSource(prefix, start, width)`: `next()` returns `"<prefix>-<n>"` with `n` zero-padded to `width` digits (`"PKG-000041"`), incrementing from `start` on every call; numbers wider than `width` are never truncated (`"PKG-1234567"`). `peekNext()` returns what the next call would produce without consuming it. No randomness or clock reads.',
    functionSignature: 'class SequentialLabelSource(prefix: String, start: Long = 1, width: Int = 6) : LabelSource { override fun next(): String; fun peekNext(): String }',
    buggyCode: `interface LabelSource {
    fun next(): String
}

class SequentialLabelSource(
    private val prefix: String,
    start: Long = 1,
    private val width: Int = 6,
) : LabelSource {
    override fun next(): String {
        // TODO: deterministic, zero-padded, incrementing
        return java.util.UUID.randomUUID().toString()
    }

    fun peekNext(): String {
        // TODO
        return ""
    }
}

class ParcelIntake(private val labels: LabelSource) {
    fun register(weightsGrams: List<Int>): List<Pair<String, Int>> = weightsGrams.map { labels.next() to it }
}
`,
    solution: `interface LabelSource {
    fun next(): String
}

class SequentialLabelSource(
    private val prefix: String,
    start: Long = 1,
    private val width: Int = 6,
) : LabelSource {
    private var counter: Long = start

    private fun format(n: Long): String = prefix + "-" + n.toString().padStart(width, '0')

    override fun next(): String {
        val n = counter
        counter += 1
        return format(n)
    }

    fun peekNext(): String = format(counter)
}

class ParcelIntake(private val labels: LabelSource) {
    fun register(weightsGrams: List<Int>): List<Pair<String, Int>> = weightsGrams.map { labels.next() to it }
}
`,
    hint: '`n.toString().padStart(width, \'0\')` pads without ever cutting digits off.',
    explanation:
      'Hiding id generation behind an interface lets tests use a sequential source whose output can be asserted verbatim, while production plugs in a UUID- or server-backed one. `padStart` only adds characters, so wide numbers stay intact; `peekNext` is handy for logging the id you are about to hand out. Deterministic ids are what make golden-file and snapshot tests stable.',
    rules: [
      { label: 'Zero-pads the number', type: 'mustContain', pattern: 'padStart\\s*\\(|String\\.format\\s*\\(|\\.format\\s*\\(', regex: true },
      { label: 'Increments a counter', type: 'mustContain', pattern: 'counter\\s*\\+\\+|\\+\\+\\s*counter|counter\\s*\\+=\\s*1|counter\\s*=\\s*counter\\s*\\+\\s*1|next\\s*\\+\\+|next\\s*\\+=\\s*1|getAndIncrement|incrementAndGet', regex: true },
      { label: 'No randomness or clock reads', type: 'mustNotContain', pattern: 'UUID|Random|nanoTime|currentTimeMillis', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },

  // ===========================================================================
  // PERFORMANCE
  // ===========================================================================
  {
    id: 'kotlin-price-label-memo',
    number: 28,
    language: 'kotlin',
    kind: 'build',
    title: 'Price Label Memo',
    difficulty: 'Medium',
    topic: 'Performance',
    statement:
      'A marketplace grid formats the same handful of prices thousands of times per scroll. Implement `PriceLabelMemo(maxEntries, format)`: `label(amountCents, currency)` builds a `PriceKey` and returns the cached string when that key was formatted before, otherwise calls `format(key)` once, stores it and increments `misses`. When the cache already holds `maxEntries` entries and a new key arrives, evict the **oldest inserted** entry first (insertion order, not access order) so memory stays bounded. `maxEntries` must be positive.',
    functionSignature: 'class PriceLabelMemo(maxEntries: Int, format: (PriceKey) -> String) { fun label(amountCents: Long, currency: String): String; val misses: Int }',
    buggyCode: `data class PriceKey(val amountCents: Long, val currency: String)

class PriceLabelMemo(private val maxEntries: Int, private val format: (PriceKey) -> String) {
    var misses: Int = 0
        private set

    fun label(amountCents: Long, currency: String): String {
        // TODO: memoise by key with bounded size
        misses++
        return format(PriceKey(amountCents, currency))
    }
}
`,
    solution: `data class PriceKey(val amountCents: Long, val currency: String)

class PriceLabelMemo(private val maxEntries: Int, private val format: (PriceKey) -> String) {
    init {
        require(maxEntries > 0) { "maxEntries must be positive" }
    }

    private val cache = LinkedHashMap<PriceKey, String>()

    var misses: Int = 0
        private set

    fun label(amountCents: Long, currency: String): String {
        val key = PriceKey(amountCents, currency)
        cache[key]?.let { return it }
        misses++
        if (cache.size >= maxEntries) {
            cache.remove(cache.keys.first())
        }
        val value = format(key)
        cache[key] = value
        return value
    }
}
`,
    hint: 'A `LinkedHashMap` remembers insertion order — `keys.first()` is the oldest entry.',
    explanation:
      'Formatting money involves locale lookups and string building, which is wasteful to repeat for identical inputs during a 120 Hz scroll. A data-class key gives structural hashing, `LinkedHashMap` gives O(1) lookup plus insertion order for cheap eviction, and the bound keeps a long session from growing the cache without limit. Counting misses makes the win measurable in tests.',
    rules: [
      { label: 'Looks the key up in a cache before formatting', type: 'mustContain', pattern: 'getOrPut\\s*\\(|containsKey\\s*\\(|cache\\s*\\[\\s*key\\s*\\]|cache\\.get\\s*\\(', regex: true },
      { label: 'Evicts an entry when the bound is reached', type: 'mustContain', pattern: '\\.remove\\s*\\(|removeEldestEntry|\\.clear\\s*\\(\\s*\\)', regex: true },
      { label: 'Uses an insertion-ordered map', type: 'mustContain', pattern: 'LinkedHashMap|linkedMapOf|ArrayDeque', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-upload-meter-stale-frames',
    number: 19,
    language: 'kotlin',
    kind: 'debug',
    title: 'Upload Meter Paints Stale Frames',
    difficulty: 'Medium',
    topic: 'Performance',
    statement:
      'A video-upload screen binds a progress `Flow<Int>` (0–100, emitted for every chunk) to `paint`, which animates the ring and takes ~16 ms. On fast Wi-Fi the upload finishes in a second, but the ring keeps crawling through every intermediate value for several seconds afterwards. The meter only ever needs the **latest** value; intermediate ticks the painter could not keep up with should be dropped, not queued. Fix the operator.',
    functionSignature: 'class UploadMeter(scope: CoroutineScope, paint: suspend (Int) -> Unit) { fun bind(progress: Flow<Int>): Job }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*

class UploadMeter(
    private val scope: CoroutineScope,
    private val paint: suspend (Int) -> Unit,
) {
    fun bind(progress: Flow<Int>): Job = scope.launch {
        progress
            .buffer(Channel.UNLIMITED)
            .collect { paint(it) }
    }
}
`,
    solution: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class UploadMeter(
    private val scope: CoroutineScope,
    private val paint: suspend (Int) -> Unit,
) {
    fun bind(progress: Flow<Int>): Job = scope.launch {
        progress
            .conflate()
            .collect { paint(it) }
    }
}
`,
    hint: 'There is a flow operator whose whole job is "keep only the most recent value while the collector is busy".',
    explanation:
      '`buffer(UNLIMITED)` decouples producer and consumer but preserves every element, so a slow painter replays the full history after the producer is done. `conflate()` keeps a one-slot buffer that is overwritten by newer values, so the collector always wakes up to the latest progress and skips what it missed — the right semantics for gauges, positions and any "current value" UI. (`collectLatest` is an alternative when the paint itself should be cancelled mid-way.)',
    rules: [
      { label: 'Keeps only the latest value while painting', type: 'mustContain', pattern: 'conflate\\s*\\(\\s*\\)|collectLatest\\s*\\{|buffer\\s*\\(\\s*Channel\\.CONFLATED\\s*\\)|buffer\\s*\\(\\s*onBufferOverflow\\s*=\\s*BufferOverflow\\.DROP_OLDEST', regex: true },
      { label: 'No longer queues every tick', type: 'mustNotContain', pattern: 'Channel\\.UNLIMITED', regex: true },
    ],
  },
  {
    id: 'kotlin-gallery-index-in-slices',
    number: 29,
    language: 'kotlin',
    kind: 'build',
    title: 'Gallery Index In Slices',
    difficulty: 'Medium',
    topic: 'Performance',
    statement:
      'Indexing a 20,000-photo gallery in one shot freezes the progress bar and ignores cancellation until the end. Implement `indexGallery(photos, sliceSize, index, onProgress)`: split `photos` into consecutive slices of at most `sliceSize` (`chunked`), pass each slice to `index`, then report the cumulative number of photos processed through `onProgress`, and `yield()` between slices so a cancelled job stops promptly and other coroutines on the dispatcher get a turn. `sliceSize` must be positive (`require`). An empty list reports nothing.',
    functionSignature: 'suspend fun indexGallery(photos: List<Photo>, sliceSize: Int, index: (List<Photo>) -> Unit, onProgress: (Int) -> Unit)',
    buggyCode: `import kotlinx.coroutines.*

data class Photo(val id: String, val bytes: Int)

suspend fun indexGallery(
    photos: List<Photo>,
    sliceSize: Int,
    index: (List<Photo>) -> Unit,
    onProgress: (Int) -> Unit,
) {
    // TODO: process in slices, report progress, cooperate with cancellation
    index(photos)
    onProgress(photos.size)
}
`,
    solution: `import kotlinx.coroutines.*

data class Photo(val id: String, val bytes: Int)

suspend fun indexGallery(
    photos: List<Photo>,
    sliceSize: Int,
    index: (List<Photo>) -> Unit,
    onProgress: (Int) -> Unit,
) {
    require(sliceSize > 0) { "sliceSize must be positive" }
    var done = 0
    for (slice in photos.chunked(sliceSize)) {
        index(slice)
        done += slice.size
        onProgress(done)
        yield()
    }
}
`,
    hint: '`photos.chunked(sliceSize)` gives you the slices; `yield()` is the cheapest cancellation checkpoint.',
    explanation:
      'CPU-bound loops never suspend, so a cancelled job keeps running and a shared dispatcher starves. Chunking bounds the work between checkpoints, `yield()` throws `CancellationException` if the job was cancelled and lets other coroutines run, and per-slice progress keeps the UI honest. The same shape applies to database migrations, search indexing and image pre-warming.',
    rules: [
      { label: 'Processes the list in slices', type: 'mustContain', pattern: 'chunked\\s*\\(|windowed\\s*\\(|subList\\s*\\(', regex: true },
      { label: 'Cooperates with cancellation between slices', type: 'mustContain', pattern: 'yield\\s*\\(\\s*\\)|ensureActive\\s*\\(\\s*\\)|isActive', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
  {
    id: 'kotlin-ride-receipt-export-crawls',
    number: 20,
    language: 'kotlin',
    kind: 'debug',
    title: 'Ride Receipt Export Crawls',
    difficulty: 'Easy',
    topic: 'Performance',
    statement:
      '`exportReceipts` turns a rider\'s history into CSV text for sharing. For a 200-line month it is instant; for a power user with 60,000 lines the share sheet takes twelve seconds and the app is killed for ANR. The output is correct — the way it is built is quadratic. Rewrite the loop body so the text is built in linear time.',
    functionSignature: 'fun exportReceipts(lines: List<ReceiptLine>): String',
    buggyCode: `data class ReceiptLine(val label: String, val cents: Long)

fun exportReceipts(lines: List<ReceiptLine>): String {
    var out = "label,cents\\n"
    for (line in lines) {
        out += line.label + "," + line.cents + "\\n"
    }
    return out
}
`,
    solution: `data class ReceiptLine(val label: String, val cents: Long)

fun exportReceipts(lines: List<ReceiptLine>): String = buildString {
    append("label,cents\\n")
    for (line in lines) {
        append(line.label).append(',').append(line.cents).append('\\n')
    }
}
`,
    hint: 'Every `+=` on a String copies everything built so far — accumulate in a `StringBuilder` (or `buildString`) instead.',
    explanation:
      'Strings are immutable, so `out += ...` allocates a new string and copies the whole prefix on every iteration: O(n²) characters copied for n lines. `buildString`/`StringBuilder` appends into a growable buffer and materialises the string once. The difference is invisible at small sizes and fatal at large ones, which is why it slips through review.',
    rules: [
      { label: 'Builds the text with a growable buffer', type: 'mustContain', pattern: 'StringBuilder|buildString|joinToString', regex: true },
      { label: 'No longer concatenates onto an immutable string in the loop', type: 'mustNotContain', pattern: 'out\\s*\\+=', regex: true },
    ],
  },
  {
    id: 'kotlin-overdue-invoice-lazy-scan',
    number: 30,
    language: 'kotlin',
    kind: 'build',
    title: 'Overdue Invoice Lazy Scan',
    difficulty: 'Medium',
    topic: 'Performance',
    statement:
      'A freelancer app shows the first few overdue invoices at the top of the dashboard. `invoices` can hold years of history, so the pipeline must be **lazy**: implement `firstOverdueIds(invoices, today, graceDays, limit)` with a `Sequence` so that filtering and mapping stop as soon as `limit` ids are found, without materialising intermediate lists.\n\nAn invoice is overdue when it is unpaid and `today - dueDay > graceDays`. Preserve the original order. Return at most `limit` ids (`limit` of 0 returns an empty list).',
    functionSignature: 'fun firstOverdueIds(invoices: List<Invoice>, today: Int, graceDays: Int, limit: Int): List<String>',
    buggyCode: `data class Invoice(val id: String, val dueDay: Int, val paid: Boolean, val amountCents: Long)

fun firstOverdueIds(invoices: List<Invoice>, today: Int, graceDays: Int, limit: Int): List<String> {
    // TODO: lazy pipeline that stops after limit matches
    return emptyList()
}
`,
    solution: `data class Invoice(val id: String, val dueDay: Int, val paid: Boolean, val amountCents: Long)

fun firstOverdueIds(invoices: List<Invoice>, today: Int, graceDays: Int, limit: Int): List<String> =
    invoices.asSequence()
        .filter { !it.paid && today - it.dueDay > graceDays }
        .map { it.id }
        .take(limit)
        .toList()
`,
    hint: '`asSequence()` first, `toList()` last — everything in between runs element-by-element and `take` short-circuits.',
    explanation:
      'Chained `filter`/`map` on a `List` builds a full intermediate list at each step and only then truncates. A `Sequence` pulls one element at a time through the whole pipeline, so `take(limit)` stops the scan after the required matches — for a large history that is the difference between touching a dozen items and copying tens of thousands twice. Use sequences when the chain is long, the input is big, or a short-circuiting terminal like `take`/`first` is involved.',
    rules: [
      { label: 'Uses a lazy sequence pipeline', type: 'mustContain', pattern: 'asSequence\\s*\\(\\s*\\)|sequence\\s*\\{|generateSequence\\s*\\(', regex: true },
      { label: 'Short-circuits after limit matches', type: 'mustContain', pattern: 'take\\s*\\(\\s*limit\\s*\\)', regex: true },
      { label: 'Materialises the result once at the end', type: 'mustContain', pattern: 'toList\\s*\\(\\s*\\)', regex: true },
      { label: 'No leftover TODO', type: 'mustNotContain', pattern: 'TODO' },
    ],
  },
];
