// Kotlin / Android debug problems 21-40 (rule-graded; every starter and reference fix compiles with kotlinc and
// kotlinx-coroutines 1.8.1, no Android SDK: Android concepts are modelled with tiny stand-ins).
import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  // ------------------------------------------------------------ Coroutines & Flow
  {
    id: 'kotlin-batch-download-tally-lost-updates',
    number: 21,
    language: 'kotlin',
    title: 'Batch Download Tally Loses Counts',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'An offline-playlist screen downloads tracks in parallel on a thread pool. Each download calls `onFileFinished(sizeBytes)` when it completes, and the screen shows `progress.finished` of N. With 40 tracks the counter regularly stops at 37 or 38 and the "Done" state never appears, although every file is on disk. On a single thread the class is correct.\n\nFix `onFileFinished` so that no completion is ever lost when many threads call it at the same moment. It must stay a plain (non-suspending) function and keep publishing a new `BatchProgress` with both `finished` and `bytes` advanced.',
    functionSignature: 'class BatchDownloadTally { val progress: StateFlow<BatchProgress>; fun onFileFinished(sizeBytes: Long) }',
    buggyCode: `import kotlinx.coroutines.flow.*

data class BatchProgress(val finished: Int = 0, val bytes: Long = 0L)

class BatchDownloadTally {
    private val _progress = MutableStateFlow(BatchProgress())
    val progress: StateFlow<BatchProgress> = _progress.asStateFlow()

    // Called from many download coroutines running on a thread pool.
    fun onFileFinished(sizeBytes: Long) {
        val current = _progress.value
        _progress.value = current.copy(
            finished = current.finished + 1,
            bytes = current.bytes + sizeBytes,
        )
    }
}
`,
    hint: 'Two threads can both read the same `current` before either writes. What would make "read, compute, write" one indivisible step?',
    explanation:
      'Reading `value`, building a copy and assigning `value` are three separate steps. When two downloads finish together, both read the same snapshot (say `finished = 5`), both compute 6, and the second write silently overwrites the first: one completion is gone. `MutableStateFlow.update { }` solves exactly this: it runs the lambda in a compare-and-set loop and retries when another thread changed the value in between, so every increment lands. A hand-written `compareAndSet` loop or a lock around the read-modify-write is equivalent. Marking a field `@Volatile` does not help: visibility was never the problem, atomicity is. Cost is unchanged in the uncontended case; under contention the lambda may run more than once, so it must stay side-effect free.',
    rules: [
      { label: 'The read-modify-write is atomic (update { }, a compareAndSet loop, or a lock)', type: 'mustContain', pattern: '\\.(update|updateAndGet|getAndUpdate)\\s*\\{|\\.compareAndSet\\s*\\(|synchronized\\s*\\(|\\.withLock\\s*[({]', regex: true },
      { label: 'Still publishes a new BatchProgress built with copy()', type: 'mustContain', pattern: '\\.copy\\s*\\(', regex: true },
      { label: 'The byte total still grows by sizeBytes', type: 'mustContain', pattern: '\\+\\s*sizeBytes\\b|\\bsizeBytes\\s*\\+', regex: true },
    ],
  },
  {
    id: 'kotlin-stop-finder-stale-results',
    number: 22,
    language: 'kotlin',
    title: 'Stop Finder Shows Stale Results',
    difficulty: 'Hard',
    topic: 'Coroutines & Flow',
    statement:
      'A transit app searches bus stops as the rider types. `bind(queries)` receives the text-field flow and publishes lookups into `results`. Short prefixes are slow on the server: typing `ma` and then `main st` often ends with the list for `ma` on screen, because that response arrives last and overwrites the newer one.\n\nFix `bind` so that when a newer query arrives, the lookup still in flight for the older query is cancelled and can never publish. A new query must not wait for the previous lookup to finish, and only the screen `scope` may own the work.',
    functionSignature: 'class StopFinder(scope: CoroutineScope, lookup: suspend (String) -> List<String>) { val results: StateFlow<List<String>>; fun bind(queries: Flow<String>): Job }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class StopFinder(
    private val scope: CoroutineScope,
    private val lookup: suspend (String) -> List<String>,
) {
    private val _results = MutableStateFlow<List<String>>(emptyList())
    val results: StateFlow<List<String>> = _results.asStateFlow()

    fun bind(queries: Flow<String>): Job = scope.launch {
        queries.collect { query ->
            launch { _results.value = lookup(query) }
        }
    }
}
`,
    hint: 'Every query starts a lookup that nobody ever stops. Which collecting operator restarts its block for each new value?',
    explanation:
      'Launching one child coroutine per query makes the lookups race: they all run to completion and the last one to finish wins, which is not necessarily the last one started. Simply removing the inner `launch` is not the fix either, because then each keystroke queues behind the previous slow request. The intent is "latest only": `collectLatest { }` (or `mapLatest` / `flatMapLatest`) cancels the block that is still running as soon as a new value arrives, so a stale lookup is cancelled at its suspension point and never reaches the assignment. Keeping a `Job` reference and calling `cancel()` before launching the next lookup expresses the same idea by hand. Cancellation is cooperative, so `lookup` must be a suspending call, which it is here.',
    rules: [
      { label: 'The in-flight lookup is cancelled when a newer query arrives (collectLatest / mapLatest / flatMapLatest, or cancelling the previous Job)', type: 'mustContain', pattern: 'collectLatest\\s*\\{|mapLatest\\s*\\{|flatMapLatest\\s*\\{|transformLatest\\s*\\{|\\w\\s*\\??\\.\\s*cancel(AndJoin|Children)?\\s*\\(', regex: true },
      { label: 'Still calls lookup for the query', type: 'mustContain', pattern: 'lookup\\s*\\(', regex: true },
      { label: 'Does not cancel the whole screen scope or escape into GlobalScope', type: 'mustNotContain', pattern: '\\bscope\\s*\\.\\s*cancel\\s*\\(|GlobalScope', regex: true },
      { label: 'Does not block a thread with runBlocking', type: 'mustNotContain', pattern: 'runBlocking', regex: true },
    ],
  },
  {
    id: 'kotlin-backup-checksum-ignores-cancel',
    number: 23,
    language: 'kotlin',
    title: 'Backup Checksum Outlives Its Screen',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'Before restoring a backup, `BackupVerifier.checksum` hashes every chunk on a background dispatcher. When the user backs out, the screen cancels the coroutine, yet the phone keeps one core pinned until all 4,000 chunks are hashed; `chunksHashed` keeps climbing long after `cancel()`.\n\nFix `checksum` so that a cancelled call stops at the next chunk boundary. The hashing must stay on the injected `dispatcher`, and the result for an uncancelled call must not change.',
    functionSignature: 'class BackupVerifier(dispatcher: CoroutineDispatcher) { suspend fun checksum(chunks: List<ByteArray>): Long }',
    buggyCode: `import kotlinx.coroutines.*

class BackupVerifier(private val dispatcher: CoroutineDispatcher) {
    @Volatile
    var chunksHashed = 0
        private set

    suspend fun checksum(chunks: List<ByteArray>): Long = withContext(dispatcher) {
        var sum = 17L
        for (chunk in chunks) {
            for (b in chunk) sum = sum * 31 + b
            chunksHashed++
        }
        sum
    }
}
`,
    hint: 'Cancellation only takes effect when the coroutine looks for it. Does anything inside this loop ever suspend or check?',
    explanation:
      'Coroutine cancellation is cooperative: `cancel()` just flips the job to "cancelling", and the code notices only at a suspension point of a cancellable function or when it asks. A tight CPU loop with no suspending call never asks, so it runs to the end and only then does `withContext` report the cancellation. Add a check once per chunk: `ensureActive()` throws `CancellationException` if the job is no longer active, `yield()` does the same and also lets other coroutines run, and `if (!isActive) ...` lets you leave the loop yourself. Per-chunk is the right granularity: the check costs a volatile read, far less than hashing a chunk. Wrapping the loop in try/catch or adding `delay(0)` does nothing, because nothing is ever thrown and `delay(0)` returns without checking.',
    rules: [
      { label: 'The loop checks for cancellation (ensureActive, yield or isActive)', type: 'mustContain', pattern: '(for\\s*\\(|while\\s*\\(|forEach\\w*\\s*\\{|repeat\\s*\\()[\\s\\S]*?(ensureActive\\s*\\(\\s*\\)|\\byield\\s*\\(\\s*\\)|\\bisActive\\b)', regex: true },
      { label: 'Still hashes on the injected dispatcher', type: 'mustContain', pattern: 'withContext\\s*\\(\\s*(this\\.)?dispatcher\\s*\\)', regex: true },
      { label: 'Does not make the work non-cancellable or blocking', type: 'mustNotContain', pattern: 'NonCancellable|runBlocking', regex: true },
    ],
  },
  {
    id: 'kotlin-receipt-sync-reports-done-early',
    number: 24,
    language: 'kotlin',
    title: 'Receipt Sync Reports Done Too Early',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      'An expense app uploads pending receipts when the user taps "Sync". `syncAll` is supposed to upload all receipts **in parallel** and return only when every upload has finished, at which point `lastSyncComplete` becomes `true` and the screen shows "All receipts synced". In production the banner appears instantly, even in airplane mode, and uploads are still running (or failing) afterwards.\n\nFix `syncAll` so it returns, and sets the flag, only after every upload has completed. Uploads must still run concurrently rather than one after another.',
    functionSignature: 'class ReceiptSync(scope: CoroutineScope, api: ReceiptApi) { val lastSyncComplete: Boolean; suspend fun syncAll(receiptIds: List<String>) }',
    buggyCode: `import kotlinx.coroutines.*

interface ReceiptApi {
    suspend fun upload(receiptId: String)
}

class ReceiptSync(
    private val scope: CoroutineScope,
    private val api: ReceiptApi,
) {
    @Volatile
    var lastSyncComplete = false
        private set

    suspend fun syncAll(receiptIds: List<String>) {
        lastSyncComplete = false
        for (id in receiptIds) {
            scope.launch { api.upload(id) }
        }
        lastSyncComplete = true
    }
}
`,
    hint: '`launch` returns immediately with a `Job`. Who waits for those jobs?',
    explanation:
      '`scope.launch` starts a coroutine and returns at once, so the loop only *schedules* the uploads; the function then falls through to `lastSyncComplete = true` while they are still in flight. The work has also escaped the caller: cancelling `syncAll` does not cancel it, and a failed upload never reaches the caller. Structured concurrency fixes all three at once: `coroutineScope { ids.forEach { launch { api.upload(it) } } }` suspends until every child has finished, rethrows the first failure and cancels the children if the caller is cancelled. Collecting the jobs and calling `joinAll()`, or using `async` with `awaitAll()`, also waits. Running the uploads sequentially or sleeping for a fixed delay are not fixes: one is slow, the other is a guess.',
    rules: [
      { label: 'Waits for every upload before returning (coroutineScope, joinAll, awaitAll, join or await)', type: 'mustContain', pattern: 'coroutineScope\\s*\\{|supervisorScope\\s*\\{|joinAll\\s*\\(|awaitAll\\s*\\(|\\.join\\s*\\(\\s*\\)|\\.await\\s*\\(\\s*\\)', regex: true },
      { label: 'Uploads still run concurrently (launch or async per receipt)', type: 'mustContain', pattern: '\\b(launch|async)\\s*(\\([^)]*\\))?\\s*\\{', regex: true },
      { label: 'Does not join each upload before starting the next one', type: 'mustNotContain', pattern: '(launch|async)\\s*(\\([^)]*\\))?\\s*\\{[^}]*\\}\\s*\\.\\s*(join|await)\\s*\\(\\s*\\)', regex: true },
      { label: 'Does not guess with a fixed delay or sleep', type: 'mustNotContain', pattern: 'delay\\s*\\(|Thread\\.sleep', regex: true },
      { label: 'Does not use GlobalScope or runBlocking', type: 'mustNotContain', pattern: 'GlobalScope|runBlocking', regex: true },
    ],
  },
  {
    id: 'kotlin-fuel-price-board-resubscribes',
    number: 25,
    language: 'kotlin',
    title: 'Fuel Price Board Resubscribes',
    difficulty: 'Medium',
    topic: 'Coroutines & Flow',
    statement:
      '`FuelPriceBoard` turns a cold price feed (each collection opens a new socket) into a `StateFlow` that three widgets collect and that the toolbar reads through `price.value`. The backend team reports dozens of sockets per open screen, and the toolbar almost always shows the placeholder because `price.value` is `null` right after it is read, even though prices are flowing.\n\nFix the class so that every reader of `price` shares **one** upstream subscription that lives in the injected `scope`, and `price.value` holds the latest price.',
    functionSignature: 'class FuelPriceBoard(feed: PriceFeed, scope: CoroutineScope) { val price: StateFlow<Int?> }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

interface PriceFeed {
    fun stream(): Flow<Int>   // cold: every collection opens a new socket
}

class FuelPriceBoard(
    private val feed: PriceFeed,
    private val scope: CoroutineScope,
) {
    val price: StateFlow<Int?>
        get() = feed.stream().stateIn(scope, SharingStarted.Eagerly, null)
}
`,
    hint: 'How many times does the right-hand side of a property with a custom getter run?',
    explanation:
      'A property declared with `get() = ...` evaluates its expression on **every access**. Each `board.price` therefore calls `stateIn` again, which launches a brand-new sharing coroutine with its own upstream collection (a new socket) and returns a brand-new `StateFlow` that starts at the initial `null`. Nothing is shared and nothing is ever cancelled until the scope dies. `stateIn` / `shareIn` must run once per owner: assign the result to a stored property (`val price = feed.stream().stateIn(...)`), or create it lazily with `by lazy`, or collect once into a private `MutableStateFlow` in `init`. Changing the `SharingStarted` policy does not help while the flow is still rebuilt per read.',
    rules: [
      { label: 'The hot flow is not rebuilt inside a getter', type: 'mustNotContain', pattern: 'get\\s*\\(\\s*\\)\\s*(:\\s*[\\w<>?, ]+)?\\s*(=|\\{\\s*return)\\s*[\\w.()\\s]*?\\.(stateIn|shareIn)\\s*\\(', regex: true },
      { label: 'One hot flow is created for the board (stateIn / shareIn, or a MutableStateFlow fed by one collector)', type: 'mustContain', pattern: '(stateIn|shareIn)\\s*\\(|MutableStateFlow\\s*[<(]', regex: true },
      { label: 'price stays a property of the board', type: 'mustContain', pattern: 'va[lr]\\s+price\\b', regex: true },
      { label: 'The subscription lives in the injected scope, not a new or global one', type: 'mustNotContain', pattern: 'GlobalScope|CoroutineScope\\s*\\(', regex: true },
    ],
  },
  {
    id: 'kotlin-trip-log-reader-wrong-context',
    number: 26,
    language: 'kotlin',
    title: 'Trip Log Reader Breaks Flow Context',
    difficulty: 'Hard',
    topic: 'Coroutines & Flow',
    statement:
      'A cycling app streams a saved trip log page by page so the list can render while the file is still being read. `readPage` is a blocking disk read, so the author moved the loop onto the injected `io` dispatcher. Collecting `pages()` now crashes on the first page with `IllegalStateException: Flow invariant is violated: ... Flow was collected in [...], but emission happened in [...]`.\n\nFix `pages()` so the blocking reads run on `io`, while the collector receives every page, in order, in its own context without any exception.',
    functionSignature: 'class TripLogReader(file: TripLogFile, io: CoroutineDispatcher) { fun pages(): Flow<List<String>> }',
    buggyCode: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

interface TripLogFile {
    fun pageCount(): Int
    fun readPage(index: Int): List<String>   // blocking disk read
}

class TripLogReader(
    private val file: TripLogFile,
    private val io: CoroutineDispatcher,
) {
    fun pages(): Flow<List<String>> = flow {
        withContext(io) {
            for (index in 0 until file.pageCount()) {
                emit(file.readPage(index))
            }
        }
    }
}
`,
    hint: 'A `flow { }` block may only call `emit` from the context it is collected in. There is an operator for changing where the upstream runs.',
    explanation:
      'The `flow { }` builder guarantees *context preservation*: the collector\'s lambda always runs in the collector\'s context, so a UI collector can touch views safely. Calling `emit` from inside `withContext(io)` would run the collector\'s code on an IO thread, so the builder detects it and throws. The supported way to move the producing side is `flowOn(io)`: it runs everything upstream of it on that dispatcher and hands values to the collector through a channel. Alternatives that keep the invariant: do only the blocking read inside `withContext(io) { ... }` and call `emit` after it returns, or switch to `channelFlow { }` and `send`, which is designed for emitting from other contexts. Deleting `withContext` makes the crash go away but puts disk reads back on the collector\'s (main) thread.',
    rules: [
      { label: 'emit() is not called from inside withContext / launch / async', type: 'mustNotContain', pattern: '(withContext|launch|async)\\s*(\\([^)]*\\))?\\s*\\{[^}]*\\bemit\\s*\\(', regex: true },
      { label: 'Disk reads still run on the injected io dispatcher', type: 'mustContain', pattern: 'flowOn\\s*\\(\\s*(this\\.)?io\\s*\\)|withContext\\s*\\(\\s*(this\\.)?io\\s*\\)|(launch|async)\\s*\\(\\s*(this\\.)?io\\s*\\)', regex: true },
      { label: 'Pages are still delivered downstream', type: 'mustContain', pattern: '\\b(emit|emitAll|send|trySend)\\s*\\(', regex: true },
      { label: 'Does not hard-code a global dispatcher or block with runBlocking', type: 'mustNotContain', pattern: 'Dispatchers\\.|runBlocking', regex: true },
    ],
  },
  {
    id: 'kotlin-session-gate-waits-forever',
    number: 27,
    language: 'kotlin',
    title: 'Session Gate Never Returns',
    difficulty: 'Easy',
    topic: 'Coroutines & Flow',
    statement:
      'The launch screen calls `SessionGate.awaitSignedIn()` and navigates home once it returns. `sessions` is backed by a `StateFlow`, so it replays the current session (or `null` when signed out) and then **never completes**. Even for a user who is already signed in, the spinner stays forever.\n\nFix `awaitSignedIn` so it returns the first non-null session as soon as it is seen and stops collecting. While signed out it should keep suspending.',
    functionSignature: 'class SessionGate(sessions: Flow<Session?>) { suspend fun awaitSignedIn(): Session }',
    buggyCode: `import kotlinx.coroutines.flow.*

data class Session(val userId: String, val token: String)

class SessionGate(private val sessions: Flow<Session?>) {

    /** Suspends until someone is signed in, then returns that session. */
    suspend fun awaitSignedIn(): Session {
        var found: Session? = null
        sessions.collect { session ->
            if (session != null) found = session
        }
        return found ?: error("no session")
    }
}
`,
    hint: '`collect` returns only when the upstream flow completes. Does this one ever complete?',
    explanation:
      '`collect` is a terminal operator that suspends until the flow finishes. A `StateFlow` (and most "current value" streams) never finishes, so the line after `collect` is unreachable: the session is found and stored, but the function never gets to return it. Use a terminal operator that stops early: `sessions.filterNotNull().first()` or `sessions.first { it != null }` cancel the collection as soon as a matching value arrives and return it. `take(1)` or `takeWhile` achieve the same. Operators such as `last()` or `toList()` have the same hang, because they too need completion.',
    rules: [
      { label: 'Stops at the first signed-in session (first / firstOrNull / take(1) / takeWhile)', type: 'mustContain', pattern: '\\.first(OrNull)?\\s*[({]|\\.take\\s*\\(\\s*1\\s*\\)|takeWhile\\s*\\{|transformWhile\\s*\\{', regex: true },
      { label: 'Signed-out (null) values are skipped, not returned', type: 'mustContain', pattern: 'filterNotNull\\s*\\(\\s*\\)|!=\\s*null|mapNotNull\\s*\\{|filterIsInstance|is\\s+Session\\b', regex: true },
      { label: 'Does not use a terminal operator that needs the flow to complete', type: 'mustNotContain', pattern: '\\bsessions\\s*\\.\\s*collect(Latest)?\\s*\\{|\\.last(OrNull)?\\s*\\(|\\.toList\\s*\\(|\\.count\\s*\\(', regex: true },
    ],
  },

  // ------------------------------------------------------------ UI State & Architecture
  {
    id: 'kotlin-account-header-lazy-stale',
    number: 28,
    language: 'kotlin',
    title: 'Account Header Sticks To First Profile',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      'The navigation drawer shows `headerText` ("name (plan)") for the active account, and `switchAccount` changes the active account. After switching from the personal to the work account, the drawer still shows the personal name and plan until the app is restarted, although `account` itself is correct.\n\nFix the model so `headerText` always describes the **current** `account`. It should remain a readable property of the model.',
    functionSignature: 'class AccountHeaderModel(initial: Account) { val account: Account; val headerText: String; fun switchAccount(next: Account) }',
    buggyCode: `data class Account(val displayName: String, val plan: String)

class AccountHeaderModel(initial: Account) {
    var account: Account = initial
        private set

    val headerText: String by lazy { "\${account.displayName} (\${account.plan})" }

    fun switchAccount(next: Account) {
        account = next
    }
}
`,
    hint: 'How many times does a `lazy` initialiser run over the lifetime of the object?',
    explanation:
      '`by lazy` runs its block on the first read and caches the result forever. That is ideal for an expensive value that never changes, but here the value depends on `account`, a `var`: the first read freezes the header for the first account and later switches are invisible. A value that is a pure function of mutable state should be *derived*, not cached: `val headerText: String get() = ...` recomputes on each read and can never be stale. If recomputing were expensive, the alternative is to reassign a stored `var headerText` in the one place where `account` changes. Replacing `lazy` with an eager initialiser has exactly the same bug, only earlier.',
    rules: [
      { label: 'headerText is no longer cached with by lazy', type: 'mustNotContain', pattern: 'by\\s+lazy', regex: true },
      { label: 'headerText is computed on each read, or reassigned when the account changes', type: 'mustContain', pattern: 'get\\s*\\(\\s*\\)|(^|\\n)\\s*(this\\.)?headerText\\s*=', regex: true },
      { label: 'The header still shows the display name and the plan', type: 'mustContain', pattern: 'displayName[\\s\\S]*\\bplan\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-parking-pass-screen-blocks-main',
    number: 29,
    language: 'kotlin',
    title: 'Parking Pass Screen Freezes On Tap',
    difficulty: 'Medium',
    topic: 'UI State & Architecture',
    statement:
      '`onRefreshTapped` is invoked on the main thread by a click listener. Users report that the whole screen freezes after tapping refresh: the "Loading..." text never appears, scrolling is dead, and on a slow network the OS shows an "app is not responding" dialog.\n\nFix `onRefreshTapped` so it returns immediately, the label shows "Loading..." while the request is running and the pass text once it arrives, and the request is cancelled automatically when the screen closes (the injected `scope` is cancelled at that point).',
    functionSignature: 'class ParkingPassScreen(scope: CoroutineScope, api: PassApi) { val label: String; fun onRefreshTapped(plate: String) }',
    buggyCode: `import kotlinx.coroutines.*

data class ParkingPass(val zone: String, val minutesLeft: Int)

interface PassApi {
    suspend fun fetchPass(plate: String): ParkingPass
}

class ParkingPassScreen(
    private val scope: CoroutineScope,   // main-thread scope, cancelled when the screen closes
    private val api: PassApi,
) {
    @Volatile
    var label: String = "Tap to load"
        private set

    // Called on the main thread by the click listener.
    fun onRefreshTapped(plate: String) {
        label = "Loading..."
        val pass = runBlocking { api.fetchPass(plate) }
        label = "\${pass.zone}: \${pass.minutesLeft} min"
    }
}
`,
    hint: 'What does the calling thread do while `runBlocking` waits for its block?',
    explanation:
      '`runBlocking` is a bridge for `main()` functions and tests: it parks the **calling thread** until the block completes. On the main thread that means no frames, no input and, if the suspended call ever needs the main dispatcher to resume, a deadlock. The click handler should start a coroutine and return: `scope.launch { val pass = api.fetchPass(plate); label = ... }`. The handler finishes in microseconds, the UI can draw "Loading...", the continuation runs when the response arrives, and because the coroutine is a child of the screen scope it is cancelled when the screen goes away. `GlobalScope.launch` or a raw `Thread` would unfreeze the UI but leak the request past the screen.',
    rules: [
      { label: 'The main thread is no longer blocked with runBlocking', type: 'mustNotContain', pattern: 'runBlocking', regex: true },
      { label: 'The request runs in a coroutine owned by the screen scope', type: 'mustContain', pattern: '\\bscope\\s*\\.\\s*(launch|async)\\b|launchIn\\s*\\(\\s*(this\\.)?scope\\s*\\)', regex: true },
      { label: 'No unowned scope or raw thread is introduced', type: 'mustNotContain', pattern: 'GlobalScope|\\bThread\\s*[({]|\\bthread\\s*[({]|CoroutineScope\\s*\\(', regex: true },
      { label: 'Still fetches the pass for the given plate', type: 'mustContain', pattern: 'fetchPass\\s*\\(\\s*plate\\s*\\)', regex: true },
    ],
  },

  // ------------------------------------------------------------ Data & Persistence
  {
    id: 'kotlin-login-token-store-never-commits',
    number: 30,
    language: 'kotlin',
    title: 'Login Token Store Forgets Everything',
    difficulty: 'Easy',
    topic: 'Data & Persistence',
    statement:
      '`KeyValueStore` mirrors Android\'s `SharedPreferences`: `edit()` returns a **new** pending editor, the `put...` calls queue changes on that editor and return it, and nothing is written until `apply()` (asynchronous) or `commit()` (synchronous) is called on it. After signing in, `token(now)` always returns `null` and users are asked to log in again on every launch.\n\nFix `save` so the token and its expiry are actually persisted, together, through a single editor (a crash must never leave a token stored without its expiry).',
    functionSignature: 'class LoginTokenStore(prefs: KeyValueStore) { fun save(token: String, expiresAtMs: Long); fun token(nowMs: Long): String? }',
    buggyCode: `interface KeyValueEditor {
    fun putString(key: String, value: String): KeyValueEditor
    fun putLong(key: String, value: Long): KeyValueEditor
    fun apply()
    fun commit(): Boolean
}

interface KeyValueStore {
    fun edit(): KeyValueEditor   // every call returns a NEW pending editor
    fun getString(key: String): String?
    fun getLong(key: String, default: Long): Long
}

class LoginTokenStore(private val prefs: KeyValueStore) {

    fun save(token: String, expiresAtMs: Long) {
        prefs.edit().putString(KEY_TOKEN, token)
        prefs.edit().putLong(KEY_EXPIRY, expiresAtMs)
    }

    fun token(nowMs: Long): String? =
        prefs.getString(KEY_TOKEN)?.takeIf { prefs.getLong(KEY_EXPIRY, 0L) > nowMs }

    private companion object {
        const val KEY_TOKEN = "token"
        const val KEY_EXPIRY = "expires_at"
    }
}
`,
    hint: 'An editor is a shopping basket. Putting things in it is not the same as checking out, and each `edit()` hands you a different basket.',
    explanation:
      'An editor only *collects* changes; the store is untouched until `apply()` or `commit()` is called on that same editor. `save` fills two separate editors and throws both away, so nothing is ever written. Chain both puts on one editor and finish it: `prefs.edit().putString(...).putLong(...).apply()`. One editor matters for correctness too: its changes are written atomically, so the token can never be stored without its expiry. A common half-fix, adding `prefs.edit().apply()` on a third line, commits a fresh empty editor and still loses both values. `apply()` writes to memory immediately and to disk in the background; use `commit()` only when you need the boolean result.',
    rules: [
      { label: 'The pending edit is finished with apply() or commit()', type: 'mustContain', pattern: '\\b(apply|commit)\\s*\\(\\s*\\)', regex: true },
      { label: 'Does not commit a fresh, empty editor', type: 'mustNotContain', pattern: 'edit\\s*\\(\\s*\\)\\s*\\.\\s*(apply|commit)\\s*\\(\\s*\\)', regex: true },
      { label: 'Both values go through a single edit()', type: 'mustNotContain', pattern: '\\.\\s*edit\\s*\\(\\s*\\)[\\s\\S]*\\.\\s*edit\\s*\\(\\s*\\)', regex: true },
      { label: 'The token is still written under KEY_TOKEN', type: 'mustContain', pattern: 'putString\\s*\\(\\s*KEY_TOKEN\\b', regex: true },
      { label: 'The expiry is still written under KEY_EXPIRY', type: 'mustContain', pattern: 'putLong\\s*\\(\\s*KEY_EXPIRY\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-offline-tile-cache-prune-crash',
    number: 31,
    language: 'kotlin',
    title: 'Offline Tile Cache Prune Crashes',
    difficulty: 'Easy',
    topic: 'Data & Persistence',
    statement:
      'A hiking app keeps downloaded map tiles in `OfflineTileCache`. `prune(cutoffMs)` must drop every tile whose `lastUsedMs` is **before** the cutoff and return the total `sizeBytes` freed. In production it usually dies with `ConcurrentModificationException`; in the rare runs that survive, some stale tiles are left behind.\n\nFix `prune` so it removes exactly the stale tiles, keeps the others in their original order, and returns the bytes freed.',
    functionSignature: 'class OfflineTileCache { fun add(tile: MapTile); fun prune(cutoffMs: Long): Long; fun size(): Int }',
    buggyCode: `data class MapTile(val key: String, val sizeBytes: Long, val lastUsedMs: Long)

class OfflineTileCache {
    private val tiles = mutableListOf<MapTile>()

    fun add(tile: MapTile) {
        tiles.add(tile)
    }

    /** Drops every tile not used since [cutoffMs]; returns the number of bytes freed. */
    fun prune(cutoffMs: Long): Long {
        var freed = 0L
        for (tile in tiles) {
            if (tile.lastUsedMs < cutoffMs) {
                tiles.remove(tile)
                freed += tile.sizeBytes
            }
        }
        return freed
    }

    fun size(): Int = tiles.size
}
`,
    hint: 'The `for` loop holds an iterator over `tiles`. What happens to that iterator when the list changes underneath it?',
    explanation:
      'A `for (x in list)` loop uses the list\'s iterator, and `ArrayList` iterators are fail-fast: after `tiles.remove(tile)` the next `next()` call sees that the list was modified behind its back and throws. When the removed element happens to be the second to last, `hasNext()` returns false early instead, so the loop ends silently and skips the last tile. Remove through something that knows about the removal: `tiles.removeAll { predicate }`, the iterator\'s own `remove()`, iterating a snapshot (`tiles.toList()`), or walking indices backwards. Counting forward with `removeAt(i)` is the classic wrong fix: every removal shifts the rest left, so the element after a removed one is skipped and the index runs off the end.',
    rules: [
      { label: 'The list is not modified while a for / forEach over it is running', type: 'mustNotContain', pattern: 'for\\s*\\(\\s*\\w+\\s+in\\s+(this\\.)?tiles\\s*\\)[^}]*?tiles\\s*\\.\\s*remove(At)?\\s*\\(|tiles\\s*\\.\\s*forEach(Indexed)?\\s*\\{[^}]*tiles\\s*\\.\\s*remove', regex: true },
      { label: 'Removal goes through an iterator, a bulk removal, a snapshot or a reverse index walk', type: 'mustContain', pattern: '[iI]terator\\s*\\(\\s*\\)|removeAll\\s*[({]|removeIf\\s*[({]|retainAll\\s*[({]|\\.toList\\s*\\(\\s*\\)|\\.toTypedArray\\s*\\(\\s*\\)|\\.filter(Not)?\\s*\\{|\\.partition\\s*\\{|\\bdownTo\\b|\\.reversed\\s*\\(\\s*\\)', regex: true },
      { label: 'Only tiles used before the cutoff are dropped', type: 'mustContain', pattern: 'lastUsedMs\\s*<\\s*cutoffMs|cutoffMs\\s*>\\s*[\\w.\\[\\]]+\\.lastUsedMs|lastUsedMs\\s*>=\\s*cutoffMs|cutoffMs\\s*<=\\s*[\\w.\\[\\]]+\\.lastUsedMs', regex: true },
      { label: 'Still totals the bytes freed', type: 'mustContain', pattern: '\\.sizeBytes\\b', regex: true },
    ],
  },
  {
    id: 'kotlin-promo-code-set-misses-repeats',
    number: 32,
    language: 'kotlin',
    title: 'Redeemed Promo Codes Slip Through',
    difficulty: 'Medium',
    topic: 'Data & Persistence',
    statement:
      'Promo codes are case-insensitive: `SPRING20` and `spring20` are the same code, and `PromoCode.equals` implements that (a unit test asserting `PromoCode("SPRING20") == PromoCode("spring20")` passes). `RedeemedCodes.redeem` must return `true` the first time a code is used and `false` for every repeat, yet customers redeem the same code twice by changing its capitalisation.\n\nFix the root cause so that codes differing only by letter case are treated as one entry by hash-based collections. Equality must stay case-insensitive.',
    functionSignature: 'class PromoCode(raw: String) { override fun equals(other: Any?): Boolean }; class RedeemedCodes { fun redeem(code: PromoCode): Boolean }',
    buggyCode: `class PromoCode(val raw: String) {
    override fun equals(other: Any?): Boolean =
        other is PromoCode && raw.equals(other.raw, ignoreCase = true)

    override fun toString(): String = raw
}

class RedeemedCodes {
    private val used = HashSet<PromoCode>()

    /** Returns true the first time a code is redeemed, false for any repeat. */
    fun redeem(code: PromoCode): Boolean = used.add(code)
}
`,
    hint: 'A `HashSet` asks two questions, in order. `equals` is only the second one.',
    explanation:
      'Hash-based collections first use `hashCode()` to choose a bucket and only then call `equals` on the entries in that bucket. `PromoCode` overrides `equals` but inherits `hashCode` from `Any`, which is identity-based, so two equal codes land in different buckets and are never compared. The contract is: equal objects must have equal hash codes. Because equality ignores case, the hash must ignore case too: `override fun hashCode() = raw.lowercase().hashCode()` (or store a normalised key once and use it in both methods). Returning `raw.hashCode()` is the tempting wrong fix: it is consistent for identical strings but still differs between `SPRING20` and `spring20`. Turning the class into a `data class` has the same flaw, since generated equality is case-sensitive.',
    rules: [
      { label: 'PromoCode overrides hashCode alongside equals', type: 'mustContain', pattern: 'override\\s+fun\\s+hashCode\\s*\\(\\s*\\)', regex: true },
      { label: 'The hash is computed from the case-normalised code', type: 'mustContain', pattern: '(lowercase|uppercase)\\s*\\(\\s*\\)\\s*\\.\\s*hashCode\\s*\\(\\s*\\)|hash\\s*\\([^)]*(lowercase|uppercase)\\s*\\(|=\\s*\\w+\\s*\\.\\s*(lowercase|uppercase)\\s*\\(', regex: true },
      { label: 'The hash does not depend on the raw letter case', type: 'mustNotContain', pattern: 'hashCode\\s*\\(\\s*\\)\\s*(:\\s*Int\\s*)?(=|\\{\\s*return)\\s*(this\\.)?raw\\s*\\.\\s*hashCode\\s*\\(\\s*\\)', regex: true },
      { label: 'PromoCode keeps its own equals', type: 'mustContain', pattern: 'override\\s+fun\\s+equals\\s*\\(', regex: true },
    ],
  },

  // ------------------------------------------------------------ Kotlin Idioms
  {
    id: 'kotlin-inbox-badge-elvis-precedence',
    number: 33,
    language: 'kotlin',
    title: 'Inbox Badge Drops Mentions',
    difficulty: 'Easy',
    topic: 'Kotlin Idioms',
    statement:
      'The tab-bar badge should show **unread threads + mentions**. `snapshot` is `null` before the first sync, and `unreadThreads` is `null` when the server omits the list; a missing value counts as zero. With 3 unread threads and 2 mentions the badge shows `3` instead of `5`. With no thread list and 2 mentions it correctly shows `2`, which is why QA missed it.\n\nFix `badgeCount` so mentions are always added.',
    functionSignature: 'fun badgeCount(snapshot: InboxSnapshot?): Int',
    buggyCode: `data class InboxSnapshot(val unreadThreads: List<String>?, val mentionCount: Int)

fun badgeCount(snapshot: InboxSnapshot?): Int {
    val mentions = snapshot?.mentionCount ?: 0
    return snapshot?.unreadThreads?.size ?: 0 + mentions
}
`,
    hint: 'Which binds tighter in Kotlin, `+` or `?:`? Read the return line the way the compiler groups it.',
    explanation:
      'The elvis operator has **lower** precedence than arithmetic, so `a ?: 0 + mentions` parses as `a ?: (0 + mentions)`. When the thread count is present the whole right-hand side, mentions included, is skipped; mentions are only added when the count is missing. Group the default with the value it belongs to: `(snapshot?.unreadThreads?.size ?: 0) + mentions`, or resolve the nullable into its own `val` first and add afterwards, or use `orEmpty().size`. A good habit: whenever `?:` shares a line with another operator, parenthesise it or split the line.',
    rules: [
      { label: 'The 0 default applies only to the missing thread count', type: 'mustNotContain', pattern: '\\?:\\s*0\\s*\\+|\\?:\\s*\\(\\s*0\\s*\\+', regex: true },
      { label: 'Mentions are added to the thread count', type: 'mustContain', pattern: '\\+\\s*mentions\\b|\\bmentions\\s*\\+|mentionCount[^\\n]*\\+|\\+[^\\n]*mentionCount', regex: true },
      { label: 'A missing thread list still counts as zero', type: 'mustContain', pattern: 'unreadThreads[^\\n]*(\\?:\\s*0\\b|orEmpty\\s*\\(\\s*\\)|\\?:\\s*emptyList)', regex: true },
      { label: 'No force-unwrap of the nullable snapshot', type: 'mustNotContain', pattern: '!!', regex: false },
    ],
  },
  {
    id: 'kotlin-mark-all-read-lazy-chain',
    number: 34,
    language: 'kotlin',
    title: 'Mark All Read Does Nothing',
    difficulty: 'Medium',
    topic: 'Kotlin Idioms',
    statement:
      'Tapping "Mark all as read" calls `markAllRead`, which should call `tracker.markRead(id)` once for every message that is not yet read, in list order, and return how many messages it marked. The toast always says "0 messages marked" and the tracker is never called, although the function runs without error.\n\nFix `markAllRead` so the unread messages are really processed. Messages that are already read must still be skipped.',
    functionSignature: 'fun markAllRead(messages: List<Message>, tracker: ReadTracker): Int',
    buggyCode: `data class Message(val id: Long, val read: Boolean)

interface ReadTracker {
    fun markRead(id: Long)
}

/** Marks every unread message as read and returns how many were marked. */
fun markAllRead(messages: List<Message>, tracker: ReadTracker): Int {
    var marked = 0
    messages.asSequence()
        .filter { !it.read }
        .map { message ->
            tracker.markRead(message.id)
            marked++
        }
    return marked
}
`,
    hint: 'A `Sequence` is a recipe, not a result. What makes a recipe actually get cooked?',
    explanation:
      '`asSequence()` makes the chain lazy: `filter` and `map` only *describe* a pipeline and return another `Sequence`. Elements flow through it only when a **terminal** operation (`forEach`, `toList`, `count`, `first`, ...) pulls them. Here the chain ends in `map`, its result is discarded, and so the lambda with the side effect never runs. End the chain with `forEach { ... }` (the honest operator for side effects), use a plain `for` loop, or drop `asSequence()` so the collection operators run eagerly. Swapping `map` for `onEach` changes nothing: `onEach` is intermediate too. As a rule, do not hide side effects in `map`; `map` is for transforming values.',
    rules: [
      { label: 'The pipeline actually runs: it ends in a terminal operation, or is an eager loop / collection chain', type: 'mustContain', pattern: '^(?![\\s\\S]*asSequence)[\\s\\S]|\\.forEach\\s*\\{|\\bfor\\s*\\(|\\.toList\\s*\\(\\s*\\)|\\.count\\s*[({]|\\.sum(Of)?\\s*[({]|\\.last\\s*\\(', regex: true },
      { label: 'Still reports each unread message to the tracker', type: 'mustContain', pattern: 'markRead\\s*\\(', regex: true },
      { label: 'Already-read messages are still skipped', type: 'mustContain', pattern: '!\\s*\\w+\\.read\\b|\\.read\\s*==\\s*false|\\.read\\s*\\)\\s*continue|filterNot\\s*\\{\\s*(\\w+\\s*->\\s*)?\\w+\\.read\\b', regex: true },
    ],
  },

  // ------------------------------------------------------------ Compose-style State
  {
    id: 'kotlin-equalizer-state-array-equality',
    number: 35,
    language: 'kotlin',
    title: 'Equalizer Bands Always Look Changed',
    difficulty: 'Medium',
    topic: 'Compose-style State',
    statement:
      'The audio engine calls `EqualizerPanel.render` about 60 times a second with a **freshly built** `EqualizerState`. The panel compares it with the state already on screen and should skip the expensive redraw when nothing changed. Profiling shows `redrawCount` going up on every callback even when the preset and all band gains are identical.\n\nFix the root cause so that two `EqualizerState` values with the same preset and the same gains are equal (and have the same hash code), so `render` skips them.',
    functionSignature: 'data class EqualizerState(preset, bandGains); class EqualizerPanel(redraw: (EqualizerState) -> Unit) { val redrawCount: Int; fun render(next: EqualizerState) }',
    buggyCode: `data class EqualizerState(val preset: String, val bandGains: IntArray)

class EqualizerPanel(private val redraw: (EqualizerState) -> Unit) {
    private var shown: EqualizerState? = null
    var redrawCount = 0
        private set

    /** Called on every audio-engine callback (about 60 times a second). */
    fun render(next: EqualizerState) {
        if (next == shown) return      // nothing changed: skip the expensive redraw
        shown = next
        redrawCount++
        redraw(next)
    }
}
`,
    hint: 'A data class compares each property with `==`. What does `==` mean for two different array objects holding the same numbers?',
    explanation:
      'The generated `equals` of a data class calls `==` on every constructor property. For arrays, `==` is **reference** equality (arrays do not override `equals`), so two states built from different `IntArray` instances are never equal, however identical their contents. Everything that relies on equality then misfires: skipping redraws, `distinctUntilChanged`, `StateFlow` conflation, Compose skipping, test assertions. The simplest fix is to model the gains as a `List<Int>`, which compares by content and is read-only as a bonus. If the array must stay for performance, override **both** `equals` (using `contentEquals`) and `hashCode` (using `contentHashCode`); overriding only one breaks hash-based collections.',
    rules: [
      { label: 'Band gains are compared by content (a List<Int>, or equals() using contentEquals)', type: 'mustContain', pattern: 'bandGains\\s*:\\s*(kotlin\\.collections\\.)?List\\s*<\\s*Int\\s*>|contentEquals\\s*\\(|Arrays\\.equals\\s*\\(', regex: true },
      { label: 'hashCode agrees with equals (a List<Int>, or contentHashCode)', type: 'mustContain', pattern: 'bandGains\\s*:\\s*(kotlin\\.collections\\.)?List\\s*<\\s*Int\\s*>|contentHashCode\\s*\\(|Arrays\\.hashCode\\s*\\(', regex: true },
      { label: 'render still skips a state equal to the one shown', type: 'mustContain', pattern: 'next\\s*[!=]=\\s*shown|shown\\s*[!=]=\\s*next|\\.equals\\s*\\(\\s*(shown|next)\\s*\\)', regex: true },
      { label: 'Does not compare string dumps of the state', type: 'mustNotContain', pattern: 'toString\\s*\\(\\s*\\)\\s*[!=]=|contentToString\\s*\\(\\s*\\)\\s*[!=]=', regex: true },
    ],
  },
  {
    id: 'kotlin-toll-label-remember-missing-key',
    number: 36,
    language: 'kotlin',
    title: 'Toll Label Keeps The Old Currency',
    difficulty: 'Easy',
    topic: 'Compose-style State',
    statement:
      '`Composer.remember` is a tiny stand-in for Compose\'s `remember`: it caches the calculation result and re-runs the calculation only when one of the keys passed to it differs from the previous call. `tollLabel` runs on every recomposition; `TollFormatter` is expensive to build, so it is remembered. After the driver crosses a border and `currency` changes from `"USD"` to `"EUR"`, the label keeps printing `USD`.\n\nFix `tollLabel` so a new formatter is built exactly when `currency` changes, and the cached one is reused otherwise.',
    functionSignature: 'fun tollLabel(composer: Composer, currency: String, cents: Long): String',
    buggyCode: `/** Tiny stand-in for Compose's remember: caches a value until one of the keys changes. */
class Composer {
    private var keys: List<Any?>? = null
    private var slot: Any? = null
    var calculations = 0
        private set

    @Suppress("UNCHECKED_CAST")
    fun <T> remember(vararg key: Any?, calculation: () -> T): T {
        val incoming = key.toList()
        if (keys != incoming) {
            keys = incoming
            slot = calculation()
            calculations++
        }
        return slot as T
    }
}

class TollFormatter(val currency: String) {   // expensive to build
    fun format(cents: Long): String = currency + " " + (cents / 100) + "." + (cents % 100).toString().padStart(2, '0')
}

/** Runs on every recomposition of the toll row. */
fun tollLabel(composer: Composer, currency: String, cents: Long): String {
    val formatter = composer.remember { TollFormatter(currency) }
    return formatter.format(cents)
}
`,
    hint: 'The lambda captures `currency`, but how would `remember` know that the captured value changed?',
    explanation:
      '`remember { }` without keys computes once and returns the cached object on every later recomposition; it has no idea which variables the lambda captured. The first `TollFormatter("USD")` is therefore reused forever. Every input the calculation reads must be passed as a key: `composer.remember(currency) { TollFormatter(currency) }` re-runs the calculation when `currency` differs from the previous call and reuses the cached formatter otherwise. Removing `remember` entirely would show the right currency but rebuild the expensive formatter on every recomposition, and keying on `cents` invalidates on the wrong input. The same rule applies to `LaunchedEffect`, `derivedStateOf` wrappers and `produceState`: captured inputs go in the key list.',
    rules: [
      { label: 'remember is keyed on currency', type: 'mustContain', pattern: 'remember\\s*\\([^){]*\\bcurrency\\b', regex: true },
      { label: 'No key-less remember remains', type: 'mustNotContain', pattern: 'remember\\s*\\{|remember\\s*\\(\\s*\\)', regex: true },
      { label: 'The formatter is still built for the current currency', type: 'mustContain', pattern: 'TollFormatter\\s*\\(\\s*currency\\s*\\)', regex: true },
    ],
  },

  // ------------------------------------------------------------ Lifecycle
  {
    id: 'kotlin-shake-listener-unregister-misses',
    number: 37,
    language: 'kotlin',
    title: 'Shake Listener Survives Its Screen',
    difficulty: 'Hard',
    topic: 'Lifecycle',
    statement:
      '"Shake to report a bug" should only be active while its screen is visible: `onStart` registers a listener with the `SensorHub`, `onStop` removes it. QA finds that shakes are still counted after leaving the screen, and `hub.listenerCount` grows by one on every visit instead of returning to zero. Both lifecycle methods are definitely being called.\n\nFix `ShakeToReportScreen` so that after `onStop` the hub no longer holds any listener from this screen, across any number of start/stop cycles.',
    functionSignature: 'class ShakeToReportScreen(hub: SensorHub) { val shakes: Int; fun onStart(); fun onStop() }',
    buggyCode: `class SensorHub {
    private val listeners = mutableListOf<(Float) -> Unit>()

    fun register(listener: (Float) -> Unit) {
        listeners.add(listener)
    }

    fun unregister(listener: (Float) -> Unit) {
        listeners.remove(listener)
    }

    fun dispatch(gForce: Float) {
        listeners.toList().forEach { it(gForce) }
    }

    val listenerCount: Int get() = listeners.size
}

class ShakeToReportScreen(private val hub: SensorHub) {
    var shakes = 0
        private set

    fun onStart() {
        hub.register { gForce -> if (gForce > 2.5f) shakes++ }
    }

    fun onStop() {
        hub.unregister { gForce -> if (gForce > 2.5f) shakes++ }
    }
}
`,
    hint: 'The hub removes "the listener you pass in". Is the object passed to `unregister` the one that was passed to `register`?',
    explanation:
      'Every lambda expression evaluated at runtime produces a **new function object**, and function objects compare by identity. The lambda in `onStop` has the same source text as the one in `onStart`, but it is a different object, so `listeners.remove(...)` finds nothing and silently returns `false`. The registered listener stays in the hub, keeps the screen alive (it captures `this`) and keeps counting. Create the listener once, keep it in a property, and pass that same reference to both calls: `private val onShake: (Float) -> Unit = { ... }`. A bound function reference such as `::onShake` also works with this hub, because bound references to the same function on the same receiver are equal. The same bug appears with `removeTextChangedListener`, `removeCallbacks`, broadcast receivers and any "remove by instance" API.',
    rules: [
      { label: 'unregister is not handed a brand-new lambda', type: 'mustNotContain', pattern: 'unregister\\s*(\\(\\s*)?\\{', regex: true },
      { label: 'unregister receives a stored listener reference', type: 'mustContain', pattern: '\\bunregister\\s*\\(\\s*[\\w.:]+(!!)?\\s*\\)|::unregister\\b', regex: true },
      { label: 'register is given a listener the screen keeps a reference to', type: 'mustNotContain', pattern: '\\bregister\\s*(\\(\\s*)?\\{', regex: true },
      { label: 'Strong shakes are still counted', type: 'mustContain', pattern: 'shakes\\s*(\\+\\+|\\+=\\s*1)|\\+\\+\\s*shakes|shakes\\s*=\\s*shakes\\s*\\+\\s*1', regex: true },
    ],
  },

  // ------------------------------------------------------------ Networking Layer
  {
    id: 'kotlin-retry-after-header-case',
    number: 38,
    language: 'kotlin',
    title: 'Retry-After Header Goes Missing',
    difficulty: 'Easy',
    topic: 'Networking Layer',
    statement:
      'When the API answers `429` or `503`, the client should wait the number of seconds given in the `Retry-After` header before retrying; `retryAfterSeconds` returns that number, or `null` when the status is different, the header is absent, or its value is not a whole number. It works against staging, but in production (behind an HTTP/2 CDN, where header names arrive lower-cased as `retry-after`) it always returns `null` and the app hammers the server.\n\nHTTP header names are case-insensitive. Fix the function so the header is found whatever its capitalisation.',
    functionSignature: 'fun retryAfterSeconds(reply: HttpReply): Long?',
    buggyCode: `class HttpReply(val status: Int, val headers: Map<String, String>)

/** Seconds the server asked us to wait before retrying, or null when it did not say. */
fun retryAfterSeconds(reply: HttpReply): Long? {
    if (reply.status != 429 && reply.status != 503) return null
    return reply.headers["Retry-After"]?.trim()?.toLongOrNull()
}
`,
    hint: 'A `Map<String, String>` lookup compares keys exactly. What does the key look like on an HTTP/2 connection?',
    explanation:
      'A plain map lookup is an exact, case-sensitive string match, but header names are case-insensitive by specification, and HTTP/2 always transmits them in lower case. The lookup for `"Retry-After"` therefore misses `"retry-after"` and the function quietly reports "no hint". Compare names without regard to case: scan the entries with `key.equals("Retry-After", ignoreCase = true)`, or normalise the keys once (`mapKeys { it.key.lowercase() }`), or copy them into a `TreeMap(String.CASE_INSENSITIVE_ORDER)`. Trying a second hard-coded spelling is not a fix; `RETRY-AFTER` or `Retry-after` would still be missed. Real HTTP clients expose a case-insensitive headers type for exactly this reason: prefer it to a raw map.',
    rules: [
      { label: 'The header name is matched case-insensitively', type: 'mustContain', pattern: 'ignoreCase\\s*=\\s*true|\\.equals\\s*\\([^)]*,\\s*true\\s*\\)|\\.(lowercase|uppercase)\\s*\\(|CASE_INSENSITIVE_ORDER|equalsIgnoreCase|IGNORE_CASE', regex: true },
      { label: 'No exact-case lookup on the raw header map', type: 'mustNotContain', pattern: 'headers\\s*(\\[|\\.\\s*get\\s*\\(|\\.\\s*getValue\\s*\\()\\s*"[Rr]etry-[Aa]fter"', regex: true },
      { label: 'A non-numeric value still yields null', type: 'mustContain', pattern: 'toLongOrNull\\s*\\(\\s*\\)', regex: true },
      { label: 'Still only applies to 429 and 503', type: 'mustContain', pattern: '429[\\s\\S]*503|503[\\s\\S]*429', regex: true },
    ],
  },

  // ------------------------------------------------------------ Testing & DI
  {
    id: 'kotlin-draft-box-companion-shared-state',
    number: 39,
    language: 'kotlin',
    title: 'Draft Box Leaks Between Accounts',
    difficulty: 'Medium',
    topic: 'Testing & DI',
    statement:
      'A mail app creates one `DraftBox` per signed-in account. A reply typed in the work account shows up as the draft for the same thread id in the personal account, and the `DraftBox` unit tests pass one by one but fail when the whole class runs, because each test\'s fresh `DraftBox("test")` already contains drafts written by earlier tests.\n\nFix `DraftBox` so every instance owns its own drafts. `MAX_DRAFTS` should remain a shared constant and the limit must still be enforced per box.',
    functionSignature: 'class DraftBox(accountId: String) { fun save(threadId: String, text: String); fun draftFor(threadId: String): String?; fun count(): Int }',
    buggyCode: `class DraftBox(val accountId: String) {

    fun save(threadId: String, text: String) {
        if (drafts.size >= MAX_DRAFTS && threadId !in drafts) return
        drafts[threadId] = text
    }

    fun draftFor(threadId: String): String? = drafts[threadId]

    fun count(): Int = drafts.size

    companion object {
        const val MAX_DRAFTS = 50
        private val drafts = mutableMapOf<String, String>()
    }
}
`,
    hint: 'How many copies of a companion object\'s properties exist, however many `DraftBox` instances you create?',
    explanation:
      'A `companion object` is a singleton attached to the class: its properties exist once per process, like `static` fields in Java. Putting the mutable `drafts` map there means every `DraftBox` reads and writes the same map, so accounts see each other\'s drafts and tests inherit state from whichever test ran before (hidden global state is the classic cause of order-dependent tests). Constants such as `MAX_DRAFTS` belong in the companion; **mutable state belongs to the instance**: declare `private val drafts = mutableMapOf<String, String>()` in the class body, or accept the map as a constructor parameter with a default. Moving the map to a top-level property or an `object` only relocates the global, and prefixing keys with `accountId` hides the leak in production while tests still share state.',
    rules: [
      { label: 'The companion object no longer holds the draft map', type: 'mustNotContain', pattern: 'companion\\s+object\\s*\\w*\\s*\\{[^}]*\\b(mutableMapOf|HashMap|LinkedHashMap|MutableMap|hashMapOf|linkedMapOf|ConcurrentHashMap)\\b', regex: true },
      { label: 'Each DraftBox still stores its drafts in a map', type: 'mustContain', pattern: 'mutableMapOf|HashMap|LinkedHashMap|hashMapOf|linkedMapOf|MutableMap', regex: true },
      { label: 'Drafts are not moved to another global (top-level property or object)', type: 'mustNotContain', pattern: '(^|\\n)(private\\s+|internal\\s+)?(val|var)\\s+\\w+\\s*(:[^=\\n]+)?=\\s*(mutableMapOf|HashMap|LinkedHashMap|hashMapOf|linkedMapOf|ConcurrentHashMap)|(^|\\n)\\s*(private\\s+|internal\\s+)?object\\s+\\w+', regex: true },
      { label: 'The MAX_DRAFTS limit is still enforced', type: 'mustContain', pattern: '>=\\s*MAX_DRAFTS|<\\s*MAX_DRAFTS|MAX_DRAFTS\\s*<=|MAX_DRAFTS\\s*>', regex: true },
    ],
  },

  // ------------------------------------------------------------ Performance
  {
    id: 'kotlin-photo-backup-diff-quadratic',
    number: 40,
    language: 'kotlin',
    title: 'Photo Backup Diff Stalls',
    difficulty: 'Medium',
    topic: 'Performance',
    statement:
      '`BackupPlanner.pending` works out which photos still need uploading. With a 300-photo test library it is instant; for a user with 30,000 photos, 29,000 of them already uploaded, the "Preparing backup" spinner sits for over a minute and the database log shows the uploaded-id query running 30,000 times.\n\nFix `pending` so the index is queried **once** per call and each photo is checked in constant time. The result must contain the same photos in the same (library) order.',
    functionSignature: 'class BackupPlanner(index: BackupIndex) { fun pending(library: List<Photo>): List<Photo> }',
    buggyCode: `data class Photo(val id: String, val bytes: Long)

interface BackupIndex {
    fun uploadedIds(): List<String>   // builds a fresh list from the local database on every call
}

class BackupPlanner(private val index: BackupIndex) {

    /** Photos that still need uploading, in their original order. */
    fun pending(library: List<Photo>): List<Photo> =
        library.filter { photo -> photo.id !in index.uploadedIds() }
}
`,
    hint: 'Count the work per photo: how is the list produced, and how does `in` search a `List`?',
    explanation:
      'The lambda runs once per photo, and each run does two expensive things: it calls `uploadedIds()` again (a database query that builds a new list) and then `!in` scans that list linearly. For n photos and m uploaded ids that is n queries plus n x m comparisons: 30,000 x 29,000 is roughly 870 million string comparisons. Hoist the query out of the loop and turn the result into a hash set: `val uploaded = index.uploadedIds().toSet()`, then `library.filter { it.id !in uploaded }`. Building the set is O(m), each membership test is O(1) on average, so the whole call is O(n + m) with one query. Hoisting the list without converting it fixes the query count but keeps the quadratic scan; `filter` preserves order, so the result is unchanged.',
    rules: [
      { label: 'Membership is checked against a hash set (or another sub-linear lookup)', type: 'mustContain', pattern: '\\.to(Hash|Mutable|Sorted)?Set\\s*\\(\\s*\\)|HashSet\\s*[<(]|hashSetOf|mutableSetOf|mapTo\\s*\\(|associate(By|With)?\\s*\\{|binarySearch', regex: true },
      { label: 'The index is queried once, not once per photo', type: 'mustNotContain', pattern: '\\b(filter|filterNot|filterTo|none|any|all|forEach|map|mapNotNull)\\s*\\{[^{}]*uploadedIds\\s*\\(|!in\\s+(\\w+\\.)?uploadedIds\\s*\\(\\s*\\)(?!\\s*\\.)|uploadedIds\\s*\\(\\s*\\)\\s*\\.\\s*contains\\s*\\(', regex: true },
      { label: 'Photos are still selected by their id', type: 'mustContain', pattern: '\\.id\\b', regex: true },
    ],
  },
];
