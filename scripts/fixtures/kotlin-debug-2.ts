export { problems } from '../../src/data/more/kotlin-debug-2';

export const fixes: Record<string, string> = {
  'kotlin-batch-download-tally-lost-updates': `import kotlinx.coroutines.flow.*

data class BatchProgress(val finished: Int = 0, val bytes: Long = 0L)

class BatchDownloadTally {
    private val _progress = MutableStateFlow(BatchProgress())
    val progress: StateFlow<BatchProgress> = _progress.asStateFlow()

    // Called from many download coroutines running on a thread pool.
    fun onFileFinished(sizeBytes: Long) {
        _progress.update { current ->
            current.copy(
                finished = current.finished + 1,
                bytes = current.bytes + sizeBytes,
            )
        }
    }
}
`,
  'kotlin-stop-finder-stale-results': `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class StopFinder(
    private val scope: CoroutineScope,
    private val lookup: suspend (String) -> List<String>,
) {
    private val _results = MutableStateFlow<List<String>>(emptyList())
    val results: StateFlow<List<String>> = _results.asStateFlow()

    fun bind(queries: Flow<String>): Job = scope.launch {
        queries.collectLatest { query ->
            _results.value = lookup(query)
        }
    }
}
`,
  'kotlin-backup-checksum-ignores-cancel': `import kotlinx.coroutines.*

class BackupVerifier(private val dispatcher: CoroutineDispatcher) {
    @Volatile
    var chunksHashed = 0
        private set

    suspend fun checksum(chunks: List<ByteArray>): Long = withContext(dispatcher) {
        var sum = 17L
        for (chunk in chunks) {
            ensureActive()
            for (b in chunk) sum = sum * 31 + b
            chunksHashed++
        }
        sum
    }
}
`,
  'kotlin-receipt-sync-reports-done-early': `import kotlinx.coroutines.*

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
        coroutineScope {
            for (id in receiptIds) {
                launch { api.upload(id) }
            }
        }
        lastSyncComplete = true
    }
}
`,
  'kotlin-fuel-price-board-resubscribes': `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

interface PriceFeed {
    fun stream(): Flow<Int>   // cold: every collection opens a new socket
}

class FuelPriceBoard(
    private val feed: PriceFeed,
    private val scope: CoroutineScope,
) {
    val price: StateFlow<Int?> =
        feed.stream().stateIn(scope, SharingStarted.Eagerly, null)
}
`,
  'kotlin-trip-log-reader-wrong-context': `import kotlinx.coroutines.*
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
        for (index in 0 until file.pageCount()) {
            emit(file.readPage(index))
        }
    }.flowOn(io)
}
`,
  'kotlin-session-gate-waits-forever': `import kotlinx.coroutines.flow.*

data class Session(val userId: String, val token: String)

class SessionGate(private val sessions: Flow<Session?>) {

    /** Suspends until someone is signed in, then returns that session. */
    suspend fun awaitSignedIn(): Session =
        sessions.filterNotNull().first()
}
`,
  'kotlin-account-header-lazy-stale': `data class Account(val displayName: String, val plan: String)

class AccountHeaderModel(initial: Account) {
    var account: Account = initial
        private set

    val headerText: String
        get() = "\${account.displayName} (\${account.plan})"

    fun switchAccount(next: Account) {
        account = next
    }
}
`,
  'kotlin-parking-pass-screen-blocks-main': `import kotlinx.coroutines.*

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
        scope.launch {
            val pass = api.fetchPass(plate)
            label = "\${pass.zone}: \${pass.minutesLeft} min"
        }
    }
}
`,
  'kotlin-login-token-store-never-commits': `interface KeyValueEditor {
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
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putLong(KEY_EXPIRY, expiresAtMs)
            .apply()
    }

    fun token(nowMs: Long): String? =
        prefs.getString(KEY_TOKEN)?.takeIf { prefs.getLong(KEY_EXPIRY, 0L) > nowMs }

    private companion object {
        const val KEY_TOKEN = "token"
        const val KEY_EXPIRY = "expires_at"
    }
}
`,
  'kotlin-offline-tile-cache-prune-crash': `data class MapTile(val key: String, val sizeBytes: Long, val lastUsedMs: Long)

class OfflineTileCache {
    private val tiles = mutableListOf<MapTile>()

    fun add(tile: MapTile) {
        tiles.add(tile)
    }

    /** Drops every tile not used since [cutoffMs]; returns the number of bytes freed. */
    fun prune(cutoffMs: Long): Long {
        var freed = 0L
        val it = tiles.iterator()
        while (it.hasNext()) {
            val tile = it.next()
            if (tile.lastUsedMs < cutoffMs) {
                it.remove()
                freed += tile.sizeBytes
            }
        }
        return freed
    }

    fun size(): Int = tiles.size
}
`,
  'kotlin-promo-code-set-misses-repeats': `class PromoCode(val raw: String) {
    override fun equals(other: Any?): Boolean =
        other is PromoCode && raw.equals(other.raw, ignoreCase = true)

    override fun hashCode(): Int = raw.lowercase().hashCode()

    override fun toString(): String = raw
}

class RedeemedCodes {
    private val used = HashSet<PromoCode>()

    /** Returns true the first time a code is redeemed, false for any repeat. */
    fun redeem(code: PromoCode): Boolean = used.add(code)
}
`,
  'kotlin-inbox-badge-elvis-precedence': `data class InboxSnapshot(val unreadThreads: List<String>?, val mentionCount: Int)

fun badgeCount(snapshot: InboxSnapshot?): Int {
    val mentions = snapshot?.mentionCount ?: 0
    return (snapshot?.unreadThreads?.size ?: 0) + mentions
}
`,
  'kotlin-mark-all-read-lazy-chain': `data class Message(val id: Long, val read: Boolean)

interface ReadTracker {
    fun markRead(id: Long)
}

/** Marks every unread message as read and returns how many were marked. */
fun markAllRead(messages: List<Message>, tracker: ReadTracker): Int {
    var marked = 0
    messages.asSequence()
        .filter { !it.read }
        .forEach { message ->
            tracker.markRead(message.id)
            marked++
        }
    return marked
}
`,
  'kotlin-equalizer-state-array-equality': `data class EqualizerState(val preset: String, val bandGains: List<Int>)

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
  'kotlin-toll-label-remember-missing-key': `/** Tiny stand-in for Compose's remember: caches a value until one of the keys changes. */
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
    val formatter = composer.remember(currency) { TollFormatter(currency) }
    return formatter.format(cents)
}
`,
  'kotlin-shake-listener-unregister-misses': `class SensorHub {
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

    private val onShake: (Float) -> Unit = { gForce -> if (gForce > 2.5f) shakes++ }

    fun onStart() {
        hub.register(onShake)
    }

    fun onStop() {
        hub.unregister(onShake)
    }
}
`,
  'kotlin-retry-after-header-case': `class HttpReply(val status: Int, val headers: Map<String, String>)

/** Seconds the server asked us to wait before retrying, or null when it did not say. */
fun retryAfterSeconds(reply: HttpReply): Long? {
    if (reply.status != 429 && reply.status != 503) return null
    val header = reply.headers.entries.firstOrNull { it.key.equals("Retry-After", ignoreCase = true) }
    return header?.value?.trim()?.toLongOrNull()
}
`,
  'kotlin-draft-box-companion-shared-state': `class DraftBox(val accountId: String) {
    private val drafts = mutableMapOf<String, String>()

    fun save(threadId: String, text: String) {
        if (drafts.size >= MAX_DRAFTS && threadId !in drafts) return
        drafts[threadId] = text
    }

    fun draftFor(threadId: String): String? = drafts[threadId]

    fun count(): Int = drafts.size

    companion object {
        const val MAX_DRAFTS = 50
    }
}
`,
  'kotlin-photo-backup-diff-quadratic': `data class Photo(val id: String, val bytes: Long)

interface BackupIndex {
    fun uploadedIds(): List<String>   // builds a fresh list from the local database on every call
}

class BackupPlanner(private val index: BackupIndex) {

    /** Photos that still need uploading, in their original order. */
    fun pending(library: List<Photo>): List<Photo> {
        val uploaded = index.uploadedIds().toSet()
        return library.filter { photo -> photo.id !in uploaded }
    }
}
`,
};
