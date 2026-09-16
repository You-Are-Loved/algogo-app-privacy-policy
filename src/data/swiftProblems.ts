// Swift / iOS practice — mobile-first build and debug problems graded by the rules engine (no on-device compiler); compile-checked with swiftc at authoring time. `language: 'swift'`.
// Shares the BugFixProblem shape: `kind: 'build'` problems show a skeleton in
// the editor and grade the user's implementation against tests (Python /
// JavaScript) or rules (Java / Swift / Kotlin). See bugFixes.ts for the type.

import type { BugFixProblem } from './bugFixes';

// Swift / iOS batch 1: build 1–15, debug 1–10.
// Topics: SwiftUI State ×6, Concurrency ×6, Networking & Data ×5, UIKit & Layout ×4, Memory & Lifecycle ×4.
// All Swift code and regex patterns are String.raw so backslashes survive verbatim.

const r = String.raw;
// Swift / iOS batch 2 — build 16–30, debug 11–20.

export const swiftProblems: BugFixProblem[] = [
  // ═══════════════════════════════════════════════════════════════ BUILD 1–15
  {
    id: 'swift-pantry-stock-model',
    number: 1,
    language: 'swift',
    kind: 'build',
    title: 'Pantry Stock View Model',
    difficulty: 'Easy',
    topic: 'SwiftUI State',
    statement:
      "A bakery's front-of-house iPad shows how many loaves are left. Build `PantryModel`, the `ObservableObject` the SwiftUI screen observes.\n\n" +
      '- Mark the class `@MainActor` so every mutation happens on the main thread where SwiftUI reads it.\n' +
      '- `@Published private(set) var loaves: Int` starts at 0; `@Published private(set) var lastEvent: String` starts at `""`. Views may read both but only the model may write them.\n' +
      '- `func bake(_ count: Int)` adds `count` loaves and sets `lastEvent` to `"baked N"`. Ignore `count <= 0` entirely (no event).\n' +
      '- `func sell(_ count: Int) -> Bool` returns `false` and changes nothing when `count <= 0` or `count > loaves`; otherwise subtracts, sets `lastEvent` to `"sold N"` and returns `true`.',
    functionSignature: '@MainActor final class PantryModel: ObservableObject',
    buggyCode: r`import SwiftUI

final class PantryModel {
    var loaves: Int = 0
    var lastEvent: String = ""

    func bake(_ count: Int) {
        // TODO
    }

    func sell(_ count: Int) -> Bool {
        // TODO
        return false
    }
}
`,
    solution: r`import SwiftUI

@MainActor
final class PantryModel: ObservableObject {
    @Published private(set) var loaves: Int = 0
    @Published private(set) var lastEvent: String = ""

    func bake(_ count: Int) {
        guard count > 0 else { return }
        loaves += count
        lastEvent = "baked \(count)"
    }

    func sell(_ count: Int) -> Bool {
        guard count > 0, count <= loaves else { return false }
        loaves -= count
        lastEvent = "sold \(count)"
        return true
    }
}
`,
    hint: 'ObservableObject + @Published is what makes SwiftUI re-render; private(set) keeps views from writing. Guard the sell before touching state.',
    explanation:
      'SwiftUI only re-renders when a property wrapped in `@Published` on an `ObservableObject` changes, and `@MainActor` guarantees those changes are made on the thread SwiftUI reads from. `private(set)` keeps the write path inside the model so every mutation goes through `bake`/`sell`, which validate before touching state. Validating first (guard, then mutate) means a rejected sale leaves both `loaves` and `lastEvent` untouched.',
    rules: [
      { label: 'Class is isolated to the main actor', type: 'mustContain', pattern: r`@MainActor`, regex: true },
      { label: 'Conforms to ObservableObject', type: 'mustContain', pattern: r`:\s*ObservableObject`, regex: true },
      { label: 'loaves is @Published with private(set)', type: 'mustContain', pattern: r`@Published\s+private\(set\)\s+var\s+loaves`, regex: true },
      { label: 'Refuses to sell more than is in stock', type: 'mustContain', pattern: r`count\s*<=\s*loaves|loaves\s*>=\s*count|count\s*>\s*loaves|loaves\s*<\s*count`, regex: true },
    ],
  },
  {
    id: 'swift-ride-fare-derived-state',
    number: 2,
    language: 'swift',
    kind: 'build',
    title: 'Bike-Share Fare Summary',
    difficulty: 'Easy',
    topic: 'SwiftUI State',
    statement:
      'A bike-share app shows the running fare while you ride. Build `RideSummaryModel: ObservableObject` with two inputs and two derived values.\n\n' +
      '- Inputs: `@Published var minutes: Int = 0` and `@Published var hasPass: Bool = false`.\n' +
      '- `var fareCents: Int` must be a **computed** property (never stored, never `@Published`): pass holders ride the first 30 minutes free and pay 10¢ per minute after that; non-pass riders pay 25¢ per minute with a 100¢ minimum (so 0 minutes → 100).\n' +
      '- `var fareLabel: String` is computed too and formats dollars with two-digit cents, e.g. 125 → `"$1.25"`, 100 → `"$1.00"`.\n\n' +
      'Derived state that is stored drifts out of sync with its inputs; compute it on read.',
    functionSignature: 'final class RideSummaryModel: ObservableObject',
    buggyCode: r`import SwiftUI

final class RideSummaryModel: ObservableObject {
    @Published var minutes: Int = 0
    @Published var hasPass: Bool = false
    @Published var fareCents: Int = 0
    @Published var fareLabel: String = ""

    func recalculate() {
        // TODO
    }
}
`,
    solution: r`import SwiftUI

final class RideSummaryModel: ObservableObject {
    @Published var minutes: Int = 0
    @Published var hasPass: Bool = false

    var fareCents: Int {
        if hasPass {
            return max(0, minutes - 30) * 10
        }
        return max(100, minutes * 25)
    }

    var fareLabel: String {
        String(format: "$%d.%02d", fareCents / 100, fareCents % 100)
    }
}
`,
    hint: 'Only the inputs need @Published. A computed property is re-evaluated on every body render, so it can never be stale.',
    explanation:
      'When `minutes` or `hasPass` changes, `objectWillChange` fires and SwiftUI re-runs `body`, which reads `fareCents` and `fareLabel` fresh. Storing the fare as a second `@Published` value forces you to remember to call `recalculate()` after every input change, and the day you forget, the UI shows a stale fare. `String(format: "%02d")` pads the cents so 5¢ renders as `.05`, not `.5`.',
    rules: [
      { label: 'fareCents is a computed property', type: 'mustContain', pattern: r`var\s+fareCents\s*:\s*Int\s*\{`, regex: true },
      { label: 'fareCents is not stored/@Published', type: 'mustNotContain', pattern: r`@Published\s+(private\(set\)\s+)?var\s+fareCents`, regex: true },
      { label: 'Applies the 100¢ minimum for non-pass rides', type: 'mustContain', pattern: r`max\s*\(|100`, regex: true },
      { label: 'Formats cents with two digits', type: 'mustContain', pattern: r`%02d|String\(format`, regex: true },
    ],
  },
  {
    id: 'swift-invite-form-validation',
    number: 3,
    language: 'swift',
    kind: 'build',
    title: 'Podcast Invite Form Validation',
    difficulty: 'Medium',
    topic: 'SwiftUI State',
    statement:
      'A podcast app lets hosts invite a co-host by handle and email. Build `InviteFormModel: ObservableObject` so the form can show errors only after the first submit attempt.\n\n' +
      '- Inputs: `@Published var handle = ""`, `@Published var email = ""`, `@Published var acceptedTerms = false`, plus `@Published var attemptedSubmit = false`.\n' +
      '- `var errors: [String]` (computed) collects, in this order: `"Handle must be 3–20 characters"` when the whitespace-trimmed handle is outside 3...20 characters; `"Handle may only use lowercase letters, digits and _"` when it contains anything else; `"Enter a valid email"` when the email has no `@` or no `.` after the last `@`; `"Accept the terms to continue"` when `acceptedTerms` is false.\n' +
      '- `var visibleErrors: [String]` returns `errors` once `attemptedSubmit` is true, otherwise `[]`.\n' +
      '- `var canSubmit: Bool` is `errors.isEmpty`.\n' +
      '- `func submit() -> Bool` sets `attemptedSubmit = true` and returns `canSubmit`.',
    functionSignature: 'final class InviteFormModel: ObservableObject',
    buggyCode: r`import SwiftUI

final class InviteFormModel: ObservableObject {
    @Published var handle = ""
    @Published var email = ""
    @Published var acceptedTerms = false
    @Published var attemptedSubmit = false

    var visibleErrors: [String] {
        // TODO
        return []
    }

    var canSubmit: Bool {
        // TODO
        return false
    }

    func submit() -> Bool {
        // TODO
        return false
    }
}
`,
    solution: r`import SwiftUI

final class InviteFormModel: ObservableObject {
    @Published var handle = ""
    @Published var email = ""
    @Published var acceptedTerms = false
    @Published var attemptedSubmit = false

    private static let handleCharacters = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyz0123456789_")

    var errors: [String] {
        var out: [String] = []
        let trimmed = handle.trimmingCharacters(in: .whitespaces)
        if trimmed.count < 3 || trimmed.count > 20 {
            out.append("Handle must be 3–20 characters")
        }
        if trimmed.unicodeScalars.contains(where: { !Self.handleCharacters.contains($0) }) {
            out.append("Handle may only use lowercase letters, digits and _")
        }
        if let at = email.lastIndex(of: "@") {
            if !email[email.index(after: at)...].contains(".") {
                out.append("Enter a valid email")
            }
        } else {
            out.append("Enter a valid email")
        }
        if !acceptedTerms {
            out.append("Accept the terms to continue")
        }
        return out
    }

    var visibleErrors: [String] { attemptedSubmit ? errors : [] }

    var canSubmit: Bool { errors.isEmpty }

    func submit() -> Bool {
        attemptedSubmit = true
        return canSubmit
    }
}
`,
    hint: 'Validation is a pure function of the inputs — make `errors` computed and derive everything else (visibility, canSubmit) from it.',
    explanation:
      'Keeping `errors` as a computed property means every keystroke re-validates automatically without a `didSet` chain, and `visibleErrors` layers the "show only after the first attempt" UX rule on top without duplicating logic. `canSubmit` is just `errors.isEmpty`, so the button state and the error list can never disagree. Gating on `attemptedSubmit` avoids shouting at the user before they have typed anything.',
    rules: [
      { label: 'errors is a computed [String] property', type: 'mustContain', pattern: r`var\s+errors\s*:\s*\[String\]\s*\{`, regex: true },
      { label: 'canSubmit derives from errors being empty', type: 'mustContain', pattern: r`errors\.isEmpty`, regex: true },
      { label: 'submit() flips attemptedSubmit', type: 'mustContain', pattern: r`attemptedSubmit\s*=\s*true`, regex: true },
      { label: 'Checks the email for an @', type: 'mustContain', pattern: r`(firstIndex|lastIndex)\(of:\s*"@"\)|contains\("@"\)|split\(separator:\s*"@"\)|components\(separatedBy:\s*"@"\)`, regex: true },
    ],
  },
  {
    id: 'swift-episode-feed-load-state',
    number: 4,
    language: 'swift',
    kind: 'build',
    title: 'Episode Feed Load State',
    difficulty: 'Medium',
    topic: 'SwiftUI State',
    statement:
      'Model the four states an episode list screen can be in as one enum so the view cannot show a spinner and an error at the same time.\n\n' +
      '- Declare `enum LoadState<Value>` with cases `idle`, `loading`, `loaded(Value)` and `failed(String)`.\n' +
      '- Keep `struct Episode: Identifiable, Equatable { let id: String; let title: String }`.\n' +
      '- Build `@MainActor final class EpisodeFeedModel: ObservableObject` with `@Published private(set) var state: LoadState<[Episode]> = .idle`.\n' +
      '- `var episodes: [Episode]` returns the loaded list, or `[]` in any other state.\n' +
      '- `func load(using fetch: () async throws -> [Episode]) async`: if the state is already `.loading`, return immediately (no double fetch). Otherwise set `.loading`, await `fetch()`, and end in `.loaded(list)` or `.failed(error.localizedDescription)`.',
    functionSignature: 'func load(using fetch: () async throws -> [Episode]) async',
    buggyCode: r`import SwiftUI

enum LoadState<Value> {
    case idle
    case loading
    // TODO: add the content and error cases
}

struct Episode: Identifiable, Equatable {
    let id: String
    let title: String
}

@MainActor
final class EpisodeFeedModel: ObservableObject {
    @Published private(set) var state: LoadState<[Episode]> = .idle

    var episodes: [Episode] {
        // TODO
        return []
    }

    func load(using fetch: () async throws -> [Episode]) async {
        // TODO
    }
}
`,
    solution: r`import SwiftUI

enum LoadState<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(String)
}

struct Episode: Identifiable, Equatable {
    let id: String
    let title: String
}

@MainActor
final class EpisodeFeedModel: ObservableObject {
    @Published private(set) var state: LoadState<[Episode]> = .idle

    var episodes: [Episode] {
        if case .loaded(let list) = state { return list }
        return []
    }

    func load(using fetch: () async throws -> [Episode]) async {
        if case .loading = state { return }
        state = .loading
        do {
            let list = try await fetch()
            state = .loaded(list)
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
`,
    hint: 'An enum with associated values makes illegal combinations (loading + error) unrepresentable. Pattern-match with `if case`.',
    explanation:
      'Three separate booleans (`isLoading`, `error`, `items`) allow 8 combinations, most of them nonsense; a single `LoadState` enum allows exactly the four you can render. The `.loading` guard prevents a pull-to-refresh from stacking two in-flight fetches whose results race. Because the class is `@MainActor`, the `state` writes after `await` are still on the main thread, which is what `@Published` requires.',
    rules: [
      { label: 'Has a loaded(Value) case', type: 'mustContain', pattern: r`case\s+loaded\s*\(\s*Value\s*\)`, regex: true },
      { label: 'Has a failed(String) case', type: 'mustContain', pattern: r`case\s+failed\s*\(\s*String\s*\)`, regex: true },
      { label: 'Catches the fetch error', type: 'mustContain', pattern: r`catch`, regex: true },
      { label: 'Ignores load() while already loading', type: 'mustContain', pattern: r`case\s+\.loading`, regex: true },
    ],
  },
  {
    id: 'swift-geocoder-continuation-bridge',
    number: 5,
    language: 'swift',
    kind: 'build',
    title: 'Bridge a Callback Geocoder to async',
    difficulty: 'Medium',
    topic: 'Concurrency',
    statement:
      'A delivery app still ships a callback-based `LegacyGeocoder` you cannot modify. Add an `async` overload so new code can `try await` it.\n\n' +
      '- Implement `extension LegacyGeocoder { func lookup(_ query: String) async throws -> Coordinate }` on top of `lookup(_:completion:)`.\n' +
      '- Use a checked continuation. If the callback delivers an `Error`, throw it. If it delivers a coordinate, return it. If it delivers neither (`nil, nil`), throw `GeocodeError.notFound`.\n' +
      '- The continuation must be resumed exactly once on every path. No semaphores, no blocking.',
    functionSignature: 'func lookup(_ query: String) async throws -> Coordinate',
    buggyCode: r`import Foundation

struct Coordinate: Equatable {
    let lat: Double
    let lon: Double
}

enum GeocodeError: Error {
    case notFound
}

final class LegacyGeocoder {
    func lookup(_ query: String, completion: @escaping (Coordinate?, Error?) -> Void) {
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.01) {
            if query.isEmpty {
                completion(nil, nil)
            } else {
                completion(Coordinate(lat: 51.5, lon: -0.12), nil)
            }
        }
    }
}

extension LegacyGeocoder {
    func lookup(_ query: String) async throws -> Coordinate {
        // TODO: wrap lookup(_:completion:)
        throw GeocodeError.notFound
    }
}
`,
    solution: r`import Foundation

struct Coordinate: Equatable {
    let lat: Double
    let lon: Double
}

enum GeocodeError: Error {
    case notFound
}

final class LegacyGeocoder {
    func lookup(_ query: String, completion: @escaping (Coordinate?, Error?) -> Void) {
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.01) {
            if query.isEmpty {
                completion(nil, nil)
            } else {
                completion(Coordinate(lat: 51.5, lon: -0.12), nil)
            }
        }
    }
}

extension LegacyGeocoder {
    func lookup(_ query: String) async throws -> Coordinate {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Coordinate, Error>) in
            lookup(query) { coordinate, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let coordinate {
                    continuation.resume(returning: coordinate)
                } else {
                    continuation.resume(throwing: GeocodeError.notFound)
                }
            }
        }
    }
}
`,
    hint: '`withCheckedThrowingContinuation` hands you a continuation; call `resume(returning:)` or `resume(throwing:)` exactly once inside the completion handler.',
    explanation:
      'A continuation suspends the calling task until the legacy callback fires, then resumes it with a value or an error, so the async overload composes with `Task`, cancellation and structured concurrency. The checked variant traps if you resume twice or never resume, which catches the classic "forgot the nil/nil branch" bug in development. The three-way branch (error, value, neither) is the part interviewers watch: an unhandled `nil, nil` would hang the caller forever.',
    rules: [
      { label: 'Uses a checked/unsafe throwing continuation', type: 'mustContain', pattern: r`withCheckedThrowingContinuation|withUnsafeThrowingContinuation`, regex: true },
      { label: 'Resumes the continuation', type: 'mustContain', pattern: r`resume\s*\(\s*(throwing|returning|with)\s*:`, regex: true },
      { label: 'Throws notFound when neither value nor error arrives', type: 'mustContain', pattern: r`GeocodeError\.notFound`, regex: true },
      { label: 'No blocking semaphores', type: 'mustNotContain', pattern: r`DispatchSemaphore|DispatchGroup`, regex: true },
    ],
  },
  {
    id: 'swift-search-debouncer',
    number: 6,
    language: 'swift',
    kind: 'build',
    title: 'Search Box Debouncer',
    difficulty: 'Easy',
    topic: 'Concurrency',
    statement:
      'A recipe app fires a network search on every keystroke. Build `SearchDebouncer` so only the last query in a burst runs.\n\n' +
      '- `@MainActor final class SearchDebouncer` with `init(delay: Duration = .milliseconds(300))` and a private `pending: Task<Void, Never>?`.\n' +
      '- `func submit(_ query: String, perform: @escaping @MainActor (String) async -> Void)`: cancel any pending task, then start a new `Task` that sleeps `delay` with `Task.sleep(for:)`, bails out if it was cancelled during the sleep, and otherwise awaits `perform(query)`.\n' +
      '- `func cancel()` cancels and clears the pending task.\n\n' +
      'Do not use `DispatchQueue.asyncAfter` or `DispatchWorkItem`.',
    functionSignature: 'func submit(_ query: String, perform: @escaping @MainActor (String) async -> Void)',
    buggyCode: r`import Foundation

@MainActor
final class SearchDebouncer {
    private var pending: Task<Void, Never>?
    let delay: Duration

    init(delay: Duration = .milliseconds(300)) {
        self.delay = delay
    }

    func submit(_ query: String, perform: @escaping @MainActor (String) async -> Void) {
        // TODO
    }

    func cancel() {
        // TODO
    }
}
`,
    solution: r`import Foundation

@MainActor
final class SearchDebouncer {
    private var pending: Task<Void, Never>?
    let delay: Duration

    init(delay: Duration = .milliseconds(300)) {
        self.delay = delay
    }

    func submit(_ query: String, perform: @escaping @MainActor (String) async -> Void) {
        pending?.cancel()
        pending = Task { [delay] in
            try? await Task.sleep(for: delay)
            guard !Task.isCancelled else { return }
            await perform(query)
        }
    }

    func cancel() {
        pending?.cancel()
        pending = nil
    }
}
`,
    hint: 'Cancel the previous Task before creating the next. `Task.sleep` throws on cancellation, so check `Task.isCancelled` after it.',
    explanation:
      'Each keystroke cancels the previous sleeping task and starts a new one, so `perform` only runs for the query that survived a quiet period of `delay`. `Task.sleep(for:)` throws `CancellationError` when the task is cancelled mid-sleep; swallowing that with `try?` and then checking `Task.isCancelled` keeps a cancelled task from running the search anyway. Because the class is `@MainActor`, the `Task { }` inherits main-actor isolation and the `@MainActor` closure can be called directly.',
    rules: [
      { label: 'Cancels the previous pending task', type: 'mustContain', pattern: r`\.cancel\(\)`, regex: true },
      { label: 'Sleeps with Task.sleep', type: 'mustContain', pattern: r`Task\.sleep`, regex: true },
      { label: 'Bails out when the sleep is cancelled', type: 'mustContain', pattern: r`isCancelled|catch|!=\s*nil`, regex: true },
      { label: 'No GCD timers', type: 'mustNotContain', pattern: r`asyncAfter|DispatchWorkItem`, regex: true },
    ],
  },
  {
    id: 'swift-thumbnail-cache-actor',
    number: 7,
    language: 'swift',
    kind: 'build',
    title: 'Coalescing Thumbnail Cache',
    difficulty: 'Hard',
    topic: 'Concurrency',
    statement:
      'A photo grid asks for the same thumbnail from several cells at once. Build `actor ThumbnailCache` so identical keys share one load.\n\n' +
      '- `func thumbnail(for key: String, load: @escaping @Sendable (String) async throws -> Data) async throws -> Data`.\n' +
      '- If the key is already cached, return the cached `Data` without calling `load`.\n' +
      '- If a load for that key is in flight, await that same task instead of starting a second one.\n' +
      '- Otherwise start a `Task` that calls `load(key)`, record it in an `inFlight: [String: Task<Data, Error>]` dictionary, await it, cache the result on success, and remove the in-flight entry whether it succeeded or failed (failures are not cached, so a later call can retry).\n' +
      '- `func evict(_ key: String)` removes a cached entry.\n\n' +
      'Rely on actor isolation for thread safety — no locks or dispatch queues.',
    functionSignature: 'func thumbnail(for key: String, load: @escaping @Sendable (String) async throws -> Data) async throws -> Data',
    buggyCode: r`import Foundation

final class ThumbnailCache {
    private var stored: [String: Data] = [:]

    func thumbnail(for key: String, load: @escaping @Sendable (String) async throws -> Data) async throws -> Data {
        // TODO: return cached data, share in-flight loads, otherwise load and cache
        return try await load(key)
    }

    func evict(_ key: String) {
        // TODO
    }
}
`,
    solution: r`import Foundation

actor ThumbnailCache {
    private var stored: [String: Data] = [:]
    private var inFlight: [String: Task<Data, Error>] = [:]

    func thumbnail(for key: String, load: @escaping @Sendable (String) async throws -> Data) async throws -> Data {
        if let data = stored[key] { return data }
        if let task = inFlight[key] { return try await task.value }

        let task = Task { try await load(key) }
        inFlight[key] = task
        defer { inFlight[key] = nil }

        let data = try await task.value
        stored[key] = data
        return data
    }

    func evict(_ key: String) {
        stored[key] = nil
    }
}
`,
    hint: 'Store the Task itself, not just a flag. A second caller can `await task.value` on the same Task, and `defer` clears the entry on both success and failure.',
    explanation:
      'An `actor` serializes access to `stored` and `inFlight`, so checking and inserting between suspension points is race-free without a lock. Storing the `Task<Data, Error>` lets every concurrent caller await the same underlying load; without that, ten cells scrolling into view start ten identical downloads. `defer { inFlight[key] = nil }` guarantees the entry is cleared even when `load` throws, so a transient failure does not poison the key forever.',
    rules: [
      { label: 'ThumbnailCache is an actor', type: 'mustContain', pattern: r`actor\s+ThumbnailCache`, regex: true },
      { label: 'Tracks in-flight loads keyed by the thumbnail key', type: 'mustContain', pattern: r`inFlight\s*\[\s*key\s*\]`, regex: true },
      { label: 'Removes the in-flight entry when the load finishes', type: 'mustContain', pattern: r`inFlight\s*\[\s*key\s*\]\s*=\s*nil|inFlight\.removeValue\(forKey:`, regex: true },
      { label: 'No locks or dispatch queues', type: 'mustNotContain', pattern: r`NSLock|DispatchQueue|os_unfair_lock|DispatchSemaphore`, regex: true },
    ],
  },
  {
    id: 'swift-dashboard-parallel-fetch',
    number: 8,
    language: 'swift',
    kind: 'build',
    title: 'Storefront Dashboard in Parallel',
    difficulty: 'Medium',
    topic: 'Concurrency',
    statement:
      "A seller's dashboard needs three independent API calls. Fetched one after another they take 900 ms; fetched together they take 300 ms.\n\n" +
      '- Implement `func loadDashboard(api: StorefrontAPI) async throws -> Dashboard`.\n' +
      '- Start `fetchOrders()`, `fetchRevenueCents()` and `fetchAlerts()` concurrently with `async let` and await all three.\n' +
      '- If any call throws, propagate the error (structured concurrency cancels the siblings for you).\n' +
      '- Return `Dashboard(orders:revenueCents:alerts:)`.',
    functionSignature: 'func loadDashboard(api: StorefrontAPI) async throws -> Dashboard',
    buggyCode: r`import Foundation

protocol StorefrontAPI: Sendable {
    func fetchOrders() async throws -> [String]
    func fetchRevenueCents() async throws -> Int
    func fetchAlerts() async throws -> [String]
}

struct Dashboard: Equatable {
    let orders: [String]
    let revenueCents: Int
    let alerts: [String]
}

func loadDashboard(api: StorefrontAPI) async throws -> Dashboard {
    // TODO: fetch all three concurrently
    return Dashboard(orders: [], revenueCents: 0, alerts: [])
}
`,
    solution: r`import Foundation

protocol StorefrontAPI: Sendable {
    func fetchOrders() async throws -> [String]
    func fetchRevenueCents() async throws -> Int
    func fetchAlerts() async throws -> [String]
}

struct Dashboard: Equatable {
    let orders: [String]
    let revenueCents: Int
    let alerts: [String]
}

func loadDashboard(api: StorefrontAPI) async throws -> Dashboard {
    async let orders = api.fetchOrders()
    async let revenue = api.fetchRevenueCents()
    async let alerts = api.fetchAlerts()
    let (o, r, a) = try await (orders, revenue, alerts)
    return Dashboard(orders: o, revenueCents: r, alerts: a)
}
`,
    hint: '`async let x = ...` starts the child task immediately; the work only serializes if you `await` each one before starting the next.',
    explanation:
      'Each `async let` spawns a child task right away, so all three requests are in flight at once and the total latency is the slowest call, not the sum. Awaiting them as a tuple with a single `try await` keeps the code linear while preserving structured concurrency: if `fetchAlerts` throws, the enclosing scope cancels the other children before the error propagates. Writing `let orders = try await api.fetchOrders()` three times would compile but silently run sequentially, which is the trap this exercise checks for.',
    rules: [
      { label: 'Uses async let (or a task group) to run the fetches concurrently', type: 'mustContain', pattern: r`async\s+let|withThrowingTaskGroup`, regex: true },
      { label: 'Awaits the results with try await', type: 'mustContain', pattern: r`try\s+await`, regex: true },
      { label: 'Does not await the calls one at a time', type: 'mustNotContain', pattern: r`let\s+\w+\s*=\s*try\s+await\s+api\.fetchOrders\(\)`, regex: true },
      { label: 'No detached tasks', type: 'mustNotContain', pattern: r`Task\.detached`, regex: true },
    ],
  },
  {
    id: 'swift-shipment-codable-keys',
    number: 9,
    language: 'swift',
    kind: 'build',
    title: 'Shipment Record Decoding',
    difficulty: 'Medium',
    topic: 'Networking & Data',
    statement:
      'The warehouse API returns shipments as `{"tracking_id":"ZX-88","shipped_at":"2024-05-01T10:15:00Z","weight_grams":1250,"notes":null}`. Make it decode into a Swift-native struct.\n\n' +
      '- `struct Shipment: Codable, Equatable` with `trackingID: String`, `shippedAt: Date`, `weightGrams: Int` and `notes: String?` (must decode `null` and a missing key as `nil`).\n' +
      '- Map the snake_case keys with an explicit `CodingKeys` enum (note `trackingID` — automatic snake-case conversion would produce `trackingId`).\n' +
      '- `enum ShipmentCoding` with `static func makeDecoder() -> JSONDecoder` and `static func makeEncoder() -> JSONEncoder`, both configured for ISO 8601 dates.\n' +
      '- `func decodeShipments(_ data: Data) throws -> [Shipment]` decodes a JSON array with that decoder.',
    functionSignature: 'func decodeShipments(_ data: Data) throws -> [Shipment]',
    buggyCode: r`import Foundation

struct Shipment: Codable, Equatable {
    let trackingID: String
    let shippedAt: Date
    let weightGrams: Int
    let notes: String

    // TODO: map the snake_case keys
}

enum ShipmentCoding {
    static func makeDecoder() -> JSONDecoder {
        // TODO: configure dates
        return JSONDecoder()
    }

    static func makeEncoder() -> JSONEncoder {
        // TODO: configure dates
        return JSONEncoder()
    }
}

func decodeShipments(_ data: Data) throws -> [Shipment] {
    // TODO
    return []
}
`,
    solution: r`import Foundation

struct Shipment: Codable, Equatable {
    let trackingID: String
    let shippedAt: Date
    let weightGrams: Int
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case trackingID = "tracking_id"
        case shippedAt = "shipped_at"
        case weightGrams = "weight_grams"
        case notes
    }
}

enum ShipmentCoding {
    static func makeDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    static func makeEncoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

func decodeShipments(_ data: Data) throws -> [Shipment] {
    try ShipmentCoding.makeDecoder().decode([Shipment].self, from: data)
}
`,
    hint: 'A nested `enum CodingKeys: String, CodingKey` renames keys; `dateDecodingStrategy = .iso8601` parses the timestamp. Optional properties tolerate null.',
    explanation:
      '`Codable` synthesis uses property names as keys unless you supply `CodingKeys`, and `.convertFromSnakeCase` would map `tracking_id` to `trackingId`, not `trackingID`, so an explicit enum is the reliable choice. The default date strategy expects a Double (seconds since 2001), so an ISO 8601 string throws unless you set `.iso8601`. Declaring `notes` as `String?` is what lets `null` and an absent key both decode to `nil` instead of failing the whole payload.',
    rules: [
      { label: 'Declares a CodingKeys enum', type: 'mustContain', pattern: r`enum\s+CodingKeys\s*:\s*String\s*,\s*CodingKey`, regex: true },
      { label: 'Maps trackingID to tracking_id', type: 'mustContain', pattern: r`case\s+trackingID\s*=\s*"tracking_id"`, regex: true },
      { label: 'Decoder parses ISO 8601 dates', type: 'mustContain', pattern: r`dateDecodingStrategy\s*=\s*\.iso8601|dateDecodingStrategy\s*=\s*\.custom|dateDecodingStrategy\s*=\s*\.formatted`, regex: true },
      { label: 'notes is optional so null decodes', type: 'mustContain', pattern: r`let\s+notes\s*:\s*String\?`, regex: true },
    ],
  },
  {
    id: 'swift-menu-client-injected-transport',
    number: 10,
    language: 'swift',
    kind: 'build',
    title: 'Menu Client with Injected Transport',
    difficulty: 'Medium',
    topic: 'Networking & Data',
    statement:
      'A food-ordering app wants its API client unit-testable without hitting the network. Put the transport behind a protocol and inject it.\n\n' +
      '- Declare `protocol HTTPTransport { func data(for request: URLRequest) async throws -> (Data, URLResponse) }` and make `URLSession` conform to it.\n' +
      '- `struct MenuClient { let baseURL: URL; let transport: HTTPTransport }` with `func fetchMenu(venueID: String) async throws -> [Dish]`.\n' +
      '- Build a GET to `venues/<venueID>/menu` under `baseURL` with an `Accept: application/json` header and send it through `transport` only — never `URLSession.shared`.\n' +
      '- If the response is not an `HTTPURLResponse`, throw `MenuClientError.notHTTP`. If the status code is outside `200..<300`, throw `MenuClientError.badStatus(code)`. Otherwise decode `[Dish]` with `JSONDecoder`.',
    functionSignature: 'func fetchMenu(venueID: String) async throws -> [Dish]',
    buggyCode: r`import Foundation

protocol HTTPTransport {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

// TODO: make URLSession an HTTPTransport

struct Dish: Decodable, Equatable {
    let id: String
    let name: String
    let priceCents: Int
}

enum MenuClientError: Error, Equatable {
    case notHTTP
    case badStatus(Int)
}

struct MenuClient {
    let baseURL: URL
    let transport: HTTPTransport

    func fetchMenu(venueID: String) async throws -> [Dish] {
        // TODO
        return []
    }
}
`,
    solution: r`import Foundation

protocol HTTPTransport {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

extension URLSession: HTTPTransport {}

struct Dish: Decodable, Equatable {
    let id: String
    let name: String
    let priceCents: Int
}

enum MenuClientError: Error, Equatable {
    case notHTTP
    case badStatus(Int)
}

struct MenuClient {
    let baseURL: URL
    let transport: HTTPTransport

    func fetchMenu(venueID: String) async throws -> [Dish] {
        let url = baseURL.appendingPathComponent("venues/\(venueID)/menu")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await transport.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw MenuClientError.notHTTP
        }
        guard (200..<300).contains(http.statusCode) else {
            throw MenuClientError.badStatus(http.statusCode)
        }
        return try JSONDecoder().decode([Dish].self, from: data)
    }
}
`,
    hint: '`URLSession.data(for:)` already has the protocol\'s shape, so `extension URLSession: HTTPTransport {}` is enough. Cast the response to `HTTPURLResponse` before reading `statusCode`.',
    explanation:
      'Depending on a small `HTTPTransport` protocol instead of `URLSession` directly lets tests inject a stub that returns canned `(Data, URLResponse)` pairs, so status-code handling and decoding are testable offline and deterministically. `URLResponse` has no status code; only `HTTPURLResponse` does, so the `as?` cast is mandatory and a non-HTTP response is its own error. Checking the `200..<300` range before decoding turns a 500 with an HTML body into a clear `badStatus` instead of a confusing `DecodingError`.',
    rules: [
      { label: 'URLSession conforms to HTTPTransport', type: 'mustContain', pattern: r`extension\s+URLSession\s*:\s*HTTPTransport`, regex: true },
      { label: 'Casts the response to HTTPURLResponse', type: 'mustContain', pattern: r`as\?\s+HTTPURLResponse`, regex: true },
      { label: 'Checks for a 2xx status', type: 'mustContain', pattern: r`200\s*\.\.<\s*300|200\s*\.\.\.\s*299|statusCode\s*/\s*100\s*==\s*2`, regex: true },
      { label: 'Sends through the injected transport, not URLSession.shared', type: 'mustNotContain', pattern: r`URLSession\.shared`, regex: true },
    ],
  },
  {
    id: 'swift-retry-backoff',
    number: 11,
    language: 'swift',
    kind: 'build',
    title: 'Retry Uploads with Exponential Backoff',
    difficulty: 'Hard',
    topic: 'Networking & Data',
    statement:
      'Photo uploads on a flaky train connection should retry a few times, waiting longer each time, but must stop immediately when the user cancels.\n\n' +
      '- Implement `func withRetry<T>(_ policy: RetryPolicy, sleep: (Duration) async throws -> Void = { try await Task.sleep(for: $0) }, operation: () async throws -> T) async throws -> T`.\n' +
      '- Try `operation` up to `policy.maxAttempts` times (assume ≥ 1). Before retry number `n` (1-based) wait `min(baseDelay * 2^(n-1), maxDelay)` using the injected `sleep` so tests can run instantly.\n' +
      '- After the final attempt fails, rethrow that last error.\n' +
      '- Never retry a `CancellationError` (or when `Task.isCancelled` is true) — rethrow it right away.\n' +
      '- Wrap the attempt in `do/catch`; do not use recursion.',
    functionSignature: 'func withRetry<T>(_ policy: RetryPolicy, sleep: (Duration) async throws -> Void, operation: () async throws -> T) async throws -> T',
    buggyCode: r`import Foundation

struct RetryPolicy {
    let maxAttempts: Int
    let baseDelay: Duration
    let maxDelay: Duration
}

func withRetry<T>(
    _ policy: RetryPolicy,
    sleep: (Duration) async throws -> Void = { try await Task.sleep(for: $0) },
    operation: () async throws -> T
) async throws -> T {
    // TODO: retry with exponential backoff, capped, never on cancellation
    return try await operation()
}
`,
    solution: r`import Foundation

struct RetryPolicy {
    let maxAttempts: Int
    let baseDelay: Duration
    let maxDelay: Duration
}

func withRetry<T>(
    _ policy: RetryPolicy,
    sleep: (Duration) async throws -> Void = { try await Task.sleep(for: $0) },
    operation: () async throws -> T
) async throws -> T {
    var attempt = 1
    while true {
        do {
            return try await operation()
        } catch let cancelled as CancellationError {
            throw cancelled
        } catch {
            if attempt >= policy.maxAttempts || Task.isCancelled {
                throw error
            }
            let delay = min(policy.baseDelay * (1 << (attempt - 1)), policy.maxDelay)
            try await sleep(delay)
            attempt += 1
        }
    }
}
`,
    hint: 'A `while true` loop with `do { return try await operation() } catch { ... }` keeps the happy path first. `Duration * Int` and `min` on Durations both work.',
    explanation:
      'Exponential backoff spreads retries out so a struggling server is not hammered by every client at once, and the `maxDelay` cap keeps the wait bounded. Catching `CancellationError` first (and checking `Task.isCancelled`) is what makes cancel feel instant — otherwise a cancelled upload would sit through two more sleeps before giving up. Injecting `sleep` keeps the function deterministic and lets unit tests assert the exact delay sequence without waiting real seconds.',
    rules: [
      { label: 'Refuses to retry after cancellation', type: 'mustContain', pattern: r`as\s+CancellationError|is\s+CancellationError|Task\.isCancelled`, regex: true },
      { label: 'Doubles the delay each attempt', type: 'mustContain', pattern: r`\*\s*2|<<|pow\s*\(`, regex: true },
      { label: 'Caps the delay at maxDelay', type: 'mustContain', pattern: r`min\s*\(`, regex: true },
      { label: 'Catches the failed attempt', type: 'mustContain', pattern: r`catch`, regex: true },
    ],
  },
  {
    id: 'swift-timeline-cursor-pager',
    number: 12,
    language: 'swift',
    kind: 'build',
    title: 'Cursor-Paged Timeline Loader',
    difficulty: 'Medium',
    topic: 'Networking & Data',
    statement:
      'A social timeline loads in pages identified by an opaque cursor. Build the model that a "load more" footer drives.\n\n' +
      '- `struct Page<Item: Decodable>: Decodable { let items: [Item]; let nextCursor: String? }`.\n' +
      '- `@MainActor final class TimelinePager<Item: Decodable>` exposing `private(set) var items: [Item]`, `private(set) var isLoading`, `private(set) var isExhausted` and a private `cursor: String?`.\n' +
      '- `func loadNextPage(fetch: (String?) async throws -> Page<Item>) async throws`: return immediately (without fetching) if `isLoading` or `isExhausted`. Otherwise set `isLoading = true`, guarantee it returns to `false` even if `fetch` throws (use `defer`), call `fetch(cursor)`, append the page\'s items, store `nextCursor`, and set `isExhausted = true` when `nextCursor` is `nil`.\n' +
      '- `func reset()` clears items, cursor and both flags.',
    functionSignature: 'func loadNextPage(fetch: (String?) async throws -> Page<Item>) async throws',
    buggyCode: r`import Foundation

struct Page<Item: Decodable>: Decodable {
    let items: [Item]
    let nextCursor: String?
}

@MainActor
final class TimelinePager<Item: Decodable> {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    private(set) var isExhausted = false
    private var cursor: String?

    func loadNextPage(fetch: (String?) async throws -> Page<Item>) async throws {
        // TODO
    }

    func reset() {
        // TODO
    }
}
`,
    solution: r`import Foundation

struct Page<Item: Decodable>: Decodable {
    let items: [Item]
    let nextCursor: String?
}

@MainActor
final class TimelinePager<Item: Decodable> {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    private(set) var isExhausted = false
    private var cursor: String?

    func loadNextPage(fetch: (String?) async throws -> Page<Item>) async throws {
        guard !isLoading, !isExhausted else { return }
        isLoading = true
        defer { isLoading = false }

        let page = try await fetch(cursor)
        items.append(contentsOf: page.items)
        cursor = page.nextCursor
        isExhausted = page.nextCursor == nil
    }

    func reset() {
        items = []
        cursor = nil
        isLoading = false
        isExhausted = false
    }
}
`,
    hint: 'Guard on the two flags first, then `defer { isLoading = false }` right after setting it so a thrown error cannot leave the pager stuck.',
    explanation:
      'Cursor pagination hands the server an opaque bookmark instead of an offset, so new posts arriving at the top do not shift the window and duplicate rows. The `isLoading` guard stops a fast-scrolling user from triggering overlapping fetches that would append the same page twice, and `defer` is the idiom that resets the flag on every exit path, including throws. Treating a `nil` cursor as exhaustion lets the footer stop asking once the feed ends.',
    rules: [
      { label: 'Skips the fetch while loading or exhausted', type: 'mustContain', pattern: r`guard\s+!isLoading|guard\s+!isExhausted|if\s+isLoading|if\s+isExhausted`, regex: true },
      { label: 'Resets isLoading on every exit (defer)', type: 'mustContain', pattern: r`defer\s*\{\s*isLoading\s*=\s*false`, regex: true },
      { label: 'Appends the new page to items', type: 'mustContain', pattern: r`items\.append\(contentsOf:|items\s*\+=`, regex: true },
      { label: 'Marks exhaustion when nextCursor is nil', type: 'mustContain', pattern: r`isExhausted\s*=\s*(page\.nextCursor\s*==\s*nil|true|cursor\s*==\s*nil)`, regex: true },
    ],
  },
  {
    id: 'swift-outbox-mutation-queue',
    number: 13,
    language: 'swift',
    kind: 'build',
    title: 'Offline Outbox for Cart Mutations',
    difficulty: 'Hard',
    topic: 'Networking & Data',
    statement:
      'A grocery app must keep working in a basement. Cart changes go into an outbox and are replayed in order when the network returns.\n\n' +
      '- `struct PendingMutation: Codable, Equatable, Identifiable { let id: UUID; let kind: String; let payload: Data; var attempts: Int }`.\n' +
      '- `enum DrainOutcome: Equatable { case drained; case stalled(remaining: Int) }`.\n' +
      '- `final class OutboxQueue` with `private(set) var pending: [PendingMutation]`, `let maxAttempts: Int`, `init(maxAttempts: Int = 3)` and `init(restoring data: Data, maxAttempts: Int = 3) throws` that decodes a previous `snapshot()`.\n' +
      '- `func enqueue(kind: String, payload: Data)` appends a mutation with a fresh `UUID` and `attempts = 0`.\n' +
      '- `func drain(send: (PendingMutation) async throws -> Void) async -> DrainOutcome`: always send the **head** first. On success remove it and continue. On failure increment its `attempts`; if that reaches `maxAttempts` drop it and continue, otherwise stop and return `.stalled(remaining:)` with the count still pending. Return `.drained` when the queue is empty. Order is never reshuffled.\n' +
      '- `func snapshot() throws -> Data` encodes `pending` with `JSONEncoder` so it can be persisted.',
    functionSignature: 'func drain(send: (PendingMutation) async throws -> Void) async -> DrainOutcome',
    buggyCode: r`import Foundation

struct PendingMutation: Codable, Equatable, Identifiable {
    let id: UUID
    let kind: String
    let payload: Data
    var attempts: Int
}

enum DrainOutcome: Equatable {
    case drained
    case stalled(remaining: Int)
}

final class OutboxQueue {
    private(set) var pending: [PendingMutation] = []
    let maxAttempts: Int

    init(maxAttempts: Int = 3) {
        self.maxAttempts = maxAttempts
    }

    init(restoring data: Data, maxAttempts: Int = 3) throws {
        // TODO: decode the snapshot
        self.maxAttempts = maxAttempts
    }

    func enqueue(kind: String, payload: Data) {
        // TODO
    }

    func drain(send: (PendingMutation) async throws -> Void) async -> DrainOutcome {
        // TODO
        return .drained
    }

    func snapshot() throws -> Data {
        // TODO
        return Data()
    }
}
`,
    solution: r`import Foundation

struct PendingMutation: Codable, Equatable, Identifiable {
    let id: UUID
    let kind: String
    let payload: Data
    var attempts: Int
}

enum DrainOutcome: Equatable {
    case drained
    case stalled(remaining: Int)
}

final class OutboxQueue {
    private(set) var pending: [PendingMutation] = []
    let maxAttempts: Int

    init(maxAttempts: Int = 3) {
        self.maxAttempts = maxAttempts
    }

    init(restoring data: Data, maxAttempts: Int = 3) throws {
        self.pending = try JSONDecoder().decode([PendingMutation].self, from: data)
        self.maxAttempts = maxAttempts
    }

    func enqueue(kind: String, payload: Data) {
        pending.append(PendingMutation(id: UUID(), kind: kind, payload: payload, attempts: 0))
    }

    func drain(send: (PendingMutation) async throws -> Void) async -> DrainOutcome {
        while let head = pending.first {
            do {
                try await send(head)
                pending.removeFirst()
            } catch {
                pending[0].attempts += 1
                if pending[0].attempts >= maxAttempts {
                    pending.removeFirst()
                } else {
                    return .stalled(remaining: pending.count)
                }
            }
        }
        return .drained
    }

    func snapshot() throws -> Data {
        try JSONEncoder().encode(pending)
    }
}
`,
    hint: 'Loop `while let head = pending.first`. Success pops the head; failure bumps `pending[0].attempts` and either drops it or returns `.stalled`.',
    explanation:
      'Replaying mutations strictly in FIFO order matters because "add 2 apples" followed by "remove 1 apple" must not be reordered, so a failure at the head has to stall the whole queue rather than skipping ahead. Counting attempts per mutation and dropping after `maxAttempts` prevents one permanently rejected request from blocking every later change forever. Because `PendingMutation` is `Codable`, the queue can be snapshotted to disk and restored after the app is killed, which is the whole point of an outbox.',
    rules: [
      { label: 'Removes the head of the queue after success/drop', type: 'mustContain', pattern: r`removeFirst\(\)|remove\(at:\s*0\)`, regex: true },
      { label: 'Increments attempts on failure', type: 'mustContain', pattern: r`attempts\s*\+=\s*1|attempts\s*=\s*[\w\[\]\.]*attempts\s*\+\s*1`, regex: true },
      { label: 'Snapshot encodes with JSONEncoder', type: 'mustContain', pattern: r`JSONEncoder\(\)`, regex: true },
      { label: 'Restores with JSONDecoder', type: 'mustContain', pattern: r`JSONDecoder\(\)`, regex: true },
    ],
  },
  {
    id: 'swift-menu-diffable-snapshot',
    number: 14,
    language: 'swift',
    kind: 'build',
    title: 'Menu Snapshot Builder',
    difficulty: 'Medium',
    topic: 'UIKit & Layout',
    statement:
      'A restaurant menu screen uses `UICollectionViewDiffableDataSource`. Write the pure function that turns dishes into a snapshot.\n\n' +
      '- `enum MenuSection: Int, CaseIterable, Hashable { case specials, mains, drinks }` and `struct Dish: Hashable { let id: String; let name: String; let section: MenuSection; let priceCents: Int }` are given.\n' +
      '- Implement `func makeMenuSnapshot(_ dishes: [Dish]) -> NSDiffableDataSourceSnapshot<MenuSection, String>`.\n' +
      '- Sections appear in `MenuSection.allCases` order; a section with no dishes is omitted entirely.\n' +
      '- Item identifiers are the dish `id` strings, **not** the `Dish` structs, so a price change updates a cell instead of deleting and re-inserting it.\n' +
      '- Within a section, keep the dishes in input order.',
    functionSignature: 'func makeMenuSnapshot(_ dishes: [Dish]) -> NSDiffableDataSourceSnapshot<MenuSection, String>',
    buggyCode: r`import UIKit

enum MenuSection: Int, CaseIterable, Hashable {
    case specials, mains, drinks
}

struct Dish: Hashable {
    let id: String
    let name: String
    let section: MenuSection
    let priceCents: Int
}

func makeMenuSnapshot(_ dishes: [Dish]) -> NSDiffableDataSourceSnapshot<MenuSection, String> {
    var snapshot = NSDiffableDataSourceSnapshot<MenuSection, String>()
    // TODO
    return snapshot
}
`,
    solution: r`import UIKit

enum MenuSection: Int, CaseIterable, Hashable {
    case specials, mains, drinks
}

struct Dish: Hashable {
    let id: String
    let name: String
    let section: MenuSection
    let priceCents: Int
}

func makeMenuSnapshot(_ dishes: [Dish]) -> NSDiffableDataSourceSnapshot<MenuSection, String> {
    var snapshot = NSDiffableDataSourceSnapshot<MenuSection, String>()
    for section in MenuSection.allCases {
        let ids = dishes.filter { $0.section == section }.map(\.id)
        guard !ids.isEmpty else { continue }
        snapshot.appendSections([section])
        snapshot.appendItems(ids, toSection: section)
    }
    return snapshot
}
`,
    hint: 'Loop over `MenuSection.allCases`, filter the dishes for that section, skip if empty, then `appendSections` followed by `appendItems(_:toSection:)`.',
    explanation:
      'Diffable data sources diff by identifier, so the identifier must be stable across edits: keying on `Dish` (whose `Hashable` includes the price) makes every price change look like a delete plus insert, with a flashing cell and lost selection. Keying on `id` makes the same edit a reconfigure. Iterating `allCases` fixes the section order regardless of how the API sorted the dishes, and appending an empty section would render an orphan header, hence the `continue`.',
    rules: [
      { label: 'Snapshot is keyed by dish id strings', type: 'mustContain', pattern: r`NSDiffableDataSourceSnapshot<\s*MenuSection\s*,\s*String\s*>`, regex: true },
      { label: 'Appends sections', type: 'mustContain', pattern: r`appendSections\s*\(`, regex: true },
      { label: 'Appends items to a section', type: 'mustContain', pattern: r`appendItems\s*\(`, regex: true },
      { label: 'Uses the dish id as the item identifier', type: 'mustContain', pattern: r`\.id\b`, regex: true },
    ],
  },
  {
    id: 'swift-dish-cell-responder-action',
    number: 15,
    language: 'swift',
    kind: 'build',
    title: 'Favorite Button up the Responder Chain',
    difficulty: 'Easy',
    topic: 'UIKit & Layout',
    statement:
      'A dish cell has a heart button, but the cell must not know which screen it lives in. Route the tap up the responder chain instead of through a delegate or closure.\n\n' +
      '- `@objc protocol DishActions: AnyObject { func toggleFavorite(_ sender: Any?) }` is given; the view controller that hosts the table conforms to it.\n' +
      '- In `DishCell.wireActions()`, attach a target-action to `favoriteButton` for `.touchUpInside` with a **nil target** and `#selector(DishActions.toggleFavorite(_:))`. UIKit walks cell → table view → view controller until it finds a responder that implements the selector.\n' +
      '- Do not add a `delegate` property or an `onFavorite` closure, and do not target `self`.',
    functionSignature: 'private func wireActions()',
    buggyCode: r`import UIKit

@objc protocol DishActions: AnyObject {
    func toggleFavorite(_ sender: Any?)
}

final class DishCell: UITableViewCell {
    let favoriteButton = UIButton(type: .system)

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        contentView.addSubview(favoriteButton)
        wireActions()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func wireActions() {
        // TODO: send the tap up the responder chain
    }
}
`,
    solution: r`import UIKit

@objc protocol DishActions: AnyObject {
    func toggleFavorite(_ sender: Any?)
}

final class DishCell: UITableViewCell {
    let favoriteButton = UIButton(type: .system)

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        contentView.addSubview(favoriteButton)
        wireActions()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func wireActions() {
        favoriteButton.addTarget(nil, action: #selector(DishActions.toggleFavorite(_:)), for: .touchUpInside)
    }
}
`,
    hint: '`addTarget(nil, action:for:)` — a nil target tells UIKit to search the responder chain for the first object that responds to the selector.',
    explanation:
      'When a `UIControl` fires with a `nil` target, UIKit starts at the control and walks `next` responders (cell, table view, view controller, navigation controller…) until one responds to the selector, so the cell stays completely decoupled from its host. `#selector(DishActions.toggleFavorite(_:))` gets the selector from the `@objc` protocol without the cell referencing any concrete class. This is the same mechanism behind `UIMenuController`, `paste:`, and undo, which is why interviewers like it.',
    rules: [
      { label: 'Targets nil so the responder chain is searched', type: 'mustContain', pattern: r`addTarget\s*\(\s*nil|sendAction\s*\(`, regex: true },
      { label: 'Uses the protocol selector', type: 'mustContain', pattern: r`#selector\s*\(\s*DishActions\.toggleFavorite`, regex: true },
      { label: 'Does not target the cell itself', type: 'mustNotContain', pattern: r`addTarget\s*\(\s*self`, regex: true },
      { label: 'No delegate or closure back-channel', type: 'mustNotContain', pattern: r`var\s+delegate|onFavorite`, regex: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════ DEBUG 1–10
  {
    id: 'swift-route-recorder-closure-cycle',
    number: 1,
    language: 'swift',
    kind: 'debug',
    title: 'Route Recorder Never Deallocates',
    difficulty: 'Easy',
    topic: 'Memory & Lifecycle',
    statement:
      'A running app creates a `RouteRecorder` per workout and drops it when the workout ends — but Instruments shows every recorder still alive and `deinit` never prints.\n\n' +
      '`RouteRecorder` owns a `LocationFeed` and installs a closure on it. Find the reference cycle and break it so the recorder deallocates. Keep the counting behaviour: each location increments `pointCount` and calls `onTick`.',
    functionSignature: 'init(feed: LocationFeed)',
    buggyCode: r`import Foundation

struct GeoPoint {
    let lat: Double
    let lon: Double
}

final class LocationFeed {
    var onLocation: ((GeoPoint) -> Void)?
}

final class RouteRecorder {
    private(set) var pointCount = 0
    var onTick: (() -> Void)?
    let feed: LocationFeed

    init(feed: LocationFeed) {
        self.feed = feed
        feed.onLocation = { point in
            self.pointCount += 1
            self.onTick?()
        }
    }

    deinit {
        print("RouteRecorder freed")
    }
}
`,
    solution: r`import Foundation

struct GeoPoint {
    let lat: Double
    let lon: Double
}

final class LocationFeed {
    var onLocation: ((GeoPoint) -> Void)?
}

final class RouteRecorder {
    private(set) var pointCount = 0
    var onTick: (() -> Void)?
    let feed: LocationFeed

    init(feed: LocationFeed) {
        self.feed = feed
        feed.onLocation = { [weak self] point in
            guard let self else { return }
            self.pointCount += 1
            self.onTick?()
        }
    }

    deinit {
        print("RouteRecorder freed")
    }
}
`,
    hint: 'Recorder → feed → onLocation closure → recorder. Which link should be weak?',
    explanation:
      'The recorder strongly owns `feed`, `feed` strongly owns the `onLocation` closure, and the closure strongly captures `self` — a cycle with no outside owner, so ARC never frees any of it. Capturing `[weak self]` turns the closure\'s reference into a non-owning one; `guard let self` then safely upgrades it for the duration of one callback. In a real app this leak also keeps the GPS callback firing for a workout that already ended.',
    rules: [
      { label: 'Captures self weakly in the closure', type: 'mustContain', pattern: r`\[\s*weak\s+self\s*\]`, regex: true },
      { label: 'Unwraps the weak reference before use', type: 'mustContain', pattern: r`self\?\.|guard\s+let\s+self`, regex: true },
      { label: 'No longer captures self strongly', type: 'mustNotContain', pattern: r`\{\s*point\s+in\s+self\.pointCount`, regex: true },
    ],
  },
  {
    id: 'swift-scanner-delegate-strong',
    number: 2,
    language: 'swift',
    kind: 'debug',
    title: 'Barcode Scanner Leaks Its Screen',
    difficulty: 'Easy',
    topic: 'Memory & Lifecycle',
    statement:
      'Every time the checkout screen is dismissed, memory climbs by one `CheckoutViewController` and the scanner keeps reporting codes to a screen that is gone.\n\n' +
      'The delegate protocol is already class-bound. One property declaration is wrong. Fix it so the scanner never keeps its delegate alive.',
    functionSignature: 'var delegate: BarcodeScannerDelegate?',
    buggyCode: r`import UIKit

protocol BarcodeScannerDelegate: AnyObject {
    func scanner(_ scanner: BarcodeScanner, didRead code: String)
}

final class BarcodeScanner {
    var delegate: BarcodeScannerDelegate?

    func simulateRead(_ code: String) {
        delegate?.scanner(self, didRead: code)
    }
}

final class CheckoutViewController: UIViewController, BarcodeScannerDelegate {
    private let scanner = BarcodeScanner()

    override func viewDidLoad() {
        super.viewDidLoad()
        scanner.delegate = self
    }

    func scanner(_ scanner: BarcodeScanner, didRead code: String) {
        title = code
    }
}
`,
    solution: r`import UIKit

protocol BarcodeScannerDelegate: AnyObject {
    func scanner(_ scanner: BarcodeScanner, didRead code: String)
}

final class BarcodeScanner {
    weak var delegate: BarcodeScannerDelegate?

    func simulateRead(_ code: String) {
        delegate?.scanner(self, didRead: code)
    }
}

final class CheckoutViewController: UIViewController, BarcodeScannerDelegate {
    private let scanner = BarcodeScanner()

    override func viewDidLoad() {
        super.viewDidLoad()
        scanner.delegate = self
    }

    func scanner(_ scanner: BarcodeScanner, didRead code: String) {
        title = code
    }
}
`,
    hint: 'The view controller owns the scanner and the scanner owns the delegate. That is a cycle unless one side is `weak`.',
    explanation:
      '`CheckoutViewController` strongly holds `scanner`, and `scanner.delegate` strongly holds the controller back, so neither retain count ever reaches zero. Delegates are conventionally `weak`: the delegate outlives nothing and the owner (the controller) is responsible for lifetime. `weak` is only allowed on class-bound types, which is why the protocol is declared `: AnyObject`.',
    rules: [
      { label: 'Delegate is declared weak (or unowned)', type: 'mustContain', pattern: r`(weak|unowned)\s+var\s+delegate`, regex: true },
      { label: 'No strong delegate declaration remains', type: 'mustNotContain', pattern: r`\n\s*var\s+delegate\s*:`, regex: true },
      { label: 'Protocol stays class-bound', type: 'mustContain', pattern: r`BarcodeScannerDelegate\s*:\s*AnyObject`, regex: true },
    ],
  },
  {
    id: 'swift-keyboard-observer-never-removed',
    number: 3,
    language: 'swift',
    kind: 'debug',
    title: 'Keyboard Observer Outlives the Form',
    difficulty: 'Medium',
    topic: 'Memory & Lifecycle',
    statement:
      'A `KeyboardAvoider` adjusts a scroll view\'s bottom inset when the keyboard shows or hides. After navigating in and out of the form ten times, ten avoiders are alive and each keyboard event runs ten handlers.\n\n' +
      'The observation is never torn down. Fix it: keep the observer tokens, remove them in `deinit`, and make sure the notification blocks do not keep the avoider alive.',
    functionSignature: 'init(scrollView: UIScrollView)',
    buggyCode: r`import UIKit

final class KeyboardAvoider {
    private let scrollView: UIScrollView

    init(scrollView: UIScrollView) {
        self.scrollView = scrollView
        let center = NotificationCenter.default
        center.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: .main) { note in
            let frame = (note.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue ?? .zero
            self.scrollView.contentInset.bottom = frame.height
        }
        center.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main) { _ in
            self.scrollView.contentInset.bottom = 0
        }
    }
}
`,
    solution: r`import UIKit

final class KeyboardAvoider {
    private let scrollView: UIScrollView
    private var tokens: [NSObjectProtocol] = []

    init(scrollView: UIScrollView) {
        self.scrollView = scrollView
        let center = NotificationCenter.default
        tokens.append(center.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: .main) { [weak self] note in
            let frame = (note.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue ?? .zero
            self?.scrollView.contentInset.bottom = frame.height
        })
        tokens.append(center.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main) { [weak self] _ in
            self?.scrollView.contentInset.bottom = 0
        })
    }

    deinit {
        tokens.forEach { NotificationCenter.default.removeObserver($0) }
    }
}
`,
    hint: 'Block-based `addObserver` returns a token you must keep and later pass to `removeObserver`. The block also needs `[weak self]` or `deinit` will never run.',
    explanation:
      'The block-based `addObserver(forName:object:queue:using:)` API returns an opaque token, and the observation lives until that token is passed to `removeObserver` — discarding it makes the observation immortal. Because the block captured `self` strongly, `NotificationCenter` kept the avoider alive, so `deinit` (the natural place to remove observers) could never run: the two halves of the fix depend on each other. With `[weak self]` and token removal, each avoider is freed with its screen and stale handlers stop stacking up.',
    rules: [
      { label: 'Removes the observers', type: 'mustContain', pattern: r`removeObserver\s*\(`, regex: true },
      { label: 'Tears down in deinit', type: 'mustContain', pattern: r`deinit`, regex: true },
      { label: 'Notification blocks capture self weakly', type: 'mustContain', pattern: r`\[\s*weak\s+self\s*\]`, regex: true },
    ],
  },
  {
    id: 'swift-brew-timer-never-invalidated',
    number: 4,
    language: 'swift',
    kind: 'debug',
    title: 'Brew Timer Keeps Ticking Offscreen',
    difficulty: 'Medium',
    topic: 'Memory & Lifecycle',
    statement:
      'A coffee app shows a four-minute brew countdown. Pop the screen and the countdown keeps running in the background; come back and a second timer starts, so the label now drops two seconds per tick and the old controller never deallocates.\n\n' +
      'Pair the timer with the view lifecycle: stop it when the view disappears and make sure the repeating closure cannot keep the controller alive.',
    functionSignature: 'override func viewDidAppear(_ animated: Bool)',
    buggyCode: r`import UIKit

final class BrewTimerViewController: UIViewController {
    private let countdownLabel = UILabel()
    private var timer: Timer?
    private var secondsLeft = 240

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.secondsLeft -= 1
            self.countdownLabel.text = "\(self.secondsLeft)s"
        }
    }
}
`,
    solution: r`import UIKit

final class BrewTimerViewController: UIViewController {
    private let countdownLabel = UILabel()
    private var timer: Timer?
    private var secondsLeft = 240

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.secondsLeft -= 1
            self.countdownLabel.text = "\(self.secondsLeft)s"
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        timer?.invalidate()
        timer = nil
    }
}
`,
    hint: 'A scheduled repeating Timer is retained by the run loop until `invalidate()`. Balance `viewDidAppear` with `viewWillDisappear`, and use `[weak self]`.',
    explanation:
      'A repeating `Timer` is owned by the run loop, not by your property, so it fires until `invalidate()` is called — and its closure held `self` strongly, so the controller could not be freed either. Invalidating in `viewWillDisappear` mirrors the `viewDidAppear` start, and invalidating any existing timer before scheduling guards against the double-timer bug on re-appearance. `[weak self]` breaks the run loop → timer → closure → controller chain so `deinit` can run.',
    rules: [
      { label: 'Invalidates the timer', type: 'mustContain', pattern: r`\.invalidate\(\)`, regex: true },
      { label: 'Stops the timer when the view goes away', type: 'mustContain', pattern: r`viewWillDisappear|viewDidDisappear`, regex: true },
      { label: 'Timer closure captures self weakly', type: 'mustContain', pattern: r`\[\s*weak\s+self\s*\]`, regex: true },
    ],
  },
  {
    id: 'swift-upload-progress-off-main',
    number: 5,
    language: 'swift',
    kind: 'debug',
    title: 'Upload Progress Published Off the Main Thread',
    difficulty: 'Medium',
    topic: 'Concurrency',
    statement:
      'A chunked video upload reports progress through an `ObservableObject`. The progress bar stutters, Xcode logs "Publishing changes from background threads is not allowed", and occasionally the app crashes.\n\n' +
      'The `@Published` properties are mutated from a detached task. Fix the isolation so every publish happens on the main actor while the uploads themselves still run asynchronously.',
    functionSignature: 'func start(chunks: [Data], upload: @escaping @Sendable (Data) async throws -> Void)',
    buggyCode: r`import SwiftUI

final class UploadProgressModel: ObservableObject {
    @Published var fraction: Double = 0
    @Published var isDone = false

    func start(chunks: [Data], upload: @escaping @Sendable (Data) async throws -> Void) {
        Task.detached {
            for (index, chunk) in chunks.enumerated() {
                try? await upload(chunk)
                self.fraction = Double(index + 1) / Double(chunks.count)
            }
            self.isDone = true
        }
    }
}
`,
    solution: r`import SwiftUI

@MainActor
final class UploadProgressModel: ObservableObject {
    @Published var fraction: Double = 0
    @Published var isDone = false

    func start(chunks: [Data], upload: @escaping @Sendable (Data) async throws -> Void) {
        Task {
            for (index, chunk) in chunks.enumerated() {
                try? await upload(chunk)
                fraction = Double(index + 1) / Double(chunks.count)
            }
            isDone = true
        }
    }
}
`,
    hint: '`Task.detached` runs on the global executor. Either isolate the model to `@MainActor` and use a plain `Task`, or hop with `await MainActor.run { }` before each publish.',
    explanation:
      '`@Published` drives `objectWillChange`, which SwiftUI subscribes to on the main thread; publishing from a background thread races the render loop and is a documented crash. `Task.detached` deliberately discards the caller\'s actor context, so the writes landed on a background executor. Marking the model `@MainActor` and using an unstructured `Task { }` (which inherits the actor) keeps every property write on main while `await upload(chunk)` still suspends and lets the network work run elsewhere.',
    rules: [
      { label: 'Publishes from the main actor', type: 'mustContain', pattern: r`@MainActor|MainActor\.run|DispatchQueue\.main\.async`, regex: true },
      { label: 'fraction is still @Published', type: 'mustContain', pattern: r`@Published\s+var\s+fraction`, regex: true },
      { label: 'No blocking hop to main', type: 'mustNotContain', pattern: r`DispatchQueue\.main\.sync`, regex: true },
    ],
  },
  {
    id: 'swift-photo-export-ignores-cancel',
    number: 6,
    language: 'swift',
    kind: 'debug',
    title: 'Photo Export Ignores Cancel',
    difficulty: 'Medium',
    topic: 'Concurrency',
    statement:
      'Exporting an album renders each photo in a loop. Tapping Cancel calls `cancelExport()`, yet CPU stays pinned and the export finishes every photo anyway — `render` is CPU-bound and never suspends, so it never notices the cancellation.\n\n' +
      'Task cancellation in Swift is cooperative. Make the loop honour it so a cancelled export stops before rendering the next photo (throwing `CancellationError` is fine).',
    functionSignature: 'func startExport(ids: [String], render: @escaping @Sendable (String) async throws -> Data)',
    buggyCode: r`import Foundation

@MainActor
final class PhotoExporter {
    private var exportTask: Task<[Data], Error>?
    private(set) var exported: [Data] = []

    func startExport(ids: [String], render: @escaping @Sendable (String) async throws -> Data) {
        exportTask = Task {
            var out: [Data] = []
            for id in ids {
                let data = try await render(id)
                out.append(data)
            }
            return out
        }
    }

    func cancelExport() {
        exportTask?.cancel()
        exportTask = nil
    }

    func waitForResult() async throws {
        guard let task = exportTask else { return }
        exported = try await task.value
    }
}
`,
    solution: r`import Foundation

@MainActor
final class PhotoExporter {
    private var exportTask: Task<[Data], Error>?
    private(set) var exported: [Data] = []

    func startExport(ids: [String], render: @escaping @Sendable (String) async throws -> Data) {
        exportTask = Task {
            var out: [Data] = []
            for id in ids {
                try Task.checkCancellation()
                let data = try await render(id)
                out.append(data)
            }
            return out
        }
    }

    func cancelExport() {
        exportTask?.cancel()
        exportTask = nil
    }

    func waitForResult() async throws {
        guard let task = exportTask else { return }
        exported = try await task.value
    }
}
`,
    hint: '`task.cancel()` only sets a flag. Check it inside the loop with `try Task.checkCancellation()` (or `Task.isCancelled`).',
    explanation:
      'Calling `cancel()` on a `Task` does not stop it; it only flips `Task.isCancelled`, and the work must check that flag itself. Foundation APIs like `URLSession` and `Task.sleep` check it for you, but a hand-written CPU-bound loop does not, so the export ran to completion. `try Task.checkCancellation()` at the top of each iteration throws `CancellationError`, unwinding the task and freeing the CPU the moment the user taps Cancel.',
    rules: [
      { label: 'Checks for cancellation inside the loop', type: 'mustContain', pattern: r`Task\.checkCancellation\(\)|Task\.isCancelled`, regex: true },
      { label: 'Still iterates the ids', type: 'mustContain', pattern: r`for\s+id\s+in\s+ids`, regex: true },
      { label: 'cancelExport still cancels the task', type: 'mustContain', pattern: r`exportTask\?\.cancel\(\)`, regex: true },
    ],
  },
  {
    id: 'swift-reminder-list-unstable-ids',
    number: 7,
    language: 'swift',
    kind: 'debug',
    title: 'Reminder Rows Keep Reshuffling',
    difficulty: 'Easy',
    topic: 'SwiftUI State',
    statement:
      'A reminders list renders fine, but toggling one row animates every row, the toggle you tapped sometimes snaps back, and scrolling position resets on each change.\n\n' +
      '`Reminder` conforms to `Identifiable`, but its identity is not stable between renders. Fix the model so each reminder keeps the same id for its whole life. Keep the view as is.',
    functionSignature: 'struct Reminder: Identifiable',
    buggyCode: r`import SwiftUI

struct Reminder: Identifiable {
    var id: UUID { UUID() }
    let title: String
    var isDone: Bool
}

struct ReminderListView: View {
    @State private var reminders: [Reminder] = [
        Reminder(title: "Water the basil", isDone: false),
        Reminder(title: "Order flour", isDone: true),
    ]

    var body: some View {
        List($reminders) { $reminder in
            Toggle(reminder.title, isOn: $reminder.isDone)
        }
    }
}
`,
    solution: r`import SwiftUI

struct Reminder: Identifiable {
    let id = UUID()
    let title: String
    var isDone: Bool
}

struct ReminderListView: View {
    @State private var reminders: [Reminder] = [
        Reminder(title: "Water the basil", isDone: false),
        Reminder(title: "Order flour", isDone: true),
    ]

    var body: some View {
        List($reminders) { $reminder in
            Toggle(reminder.title, isOn: $reminder.isDone)
        }
    }
}
`,
    hint: 'A computed `id` that calls `UUID()` returns a different value every time it is read. Store the id once.',
    explanation:
      'SwiftUI diffs a `List` by each element\'s `id`; a computed `var id: UUID { UUID() }` produces a fresh value on every read, so every render looks like "all old rows deleted, all new rows inserted". That is why every row animates and per-row state (scroll position, focus, the toggle you just flipped) is lost. Storing `let id = UUID()` assigns the identity once at creation, which is what `Identifiable` is meant to express.',
    rules: [
      { label: 'id is stored, assigned once', type: 'mustContain', pattern: r`let\s+id\s*(:\s*UUID)?\s*=\s*UUID\(\)|let\s+id\s*:\s*(UUID|String)\b`, regex: true },
      { label: 'No computed id that regenerates', type: 'mustNotContain', pattern: r`var\s+id\s*:\s*UUID\s*\{`, regex: true },
    ],
  },
  {
    id: 'swift-tag-selection-drops',
    number: 8,
    language: 'swift',
    kind: 'debug',
    title: 'Tag Selection Vanishes After Refresh',
    difficulty: 'Hard',
    topic: 'SwiftUI State',
    statement:
      'A tag picker lets users multi-select tags; every 30 seconds the app refreshes each tag\'s `usageCount` from the server. After a refresh, every selected chip appears unselected — yet `selected.count` is unchanged.\n\n' +
      'The selection is a `Set<Tag>`, and `Tag`\'s synthesized `Hashable` includes the mutable `usageCount`. Key the selection by tag `id` instead (a `Set<Tag.ID>`), updating `toggle`, `isSelected` and `selectedTags` accordingly, so the selection survives any refresh.',
    functionSignature: 'func toggle(_ tag: Tag)',
    buggyCode: r`import SwiftUI

struct Tag: Hashable, Identifiable {
    let id: String
    let label: String
    var usageCount: Int
}

final class TagPickerModel: ObservableObject {
    @Published private(set) var tags: [Tag]
    @Published private(set) var selected: Set<Tag> = []

    init(tags: [Tag]) {
        self.tags = tags
    }

    func toggle(_ tag: Tag) {
        if selected.contains(tag) {
            selected.remove(tag)
        } else {
            selected.insert(tag)
        }
    }

    func isSelected(_ tag: Tag) -> Bool {
        selected.contains(tag)
    }

    var selectedTags: [Tag] {
        tags.filter { selected.contains($0) }
    }

    func applyUsageCounts(_ counts: [String: Int]) {
        tags = tags.map { tag in
            var copy = tag
            copy.usageCount = counts[tag.id] ?? tag.usageCount
            return copy
        }
    }
}
`,
    solution: r`import SwiftUI

struct Tag: Hashable, Identifiable {
    let id: String
    let label: String
    var usageCount: Int
}

final class TagPickerModel: ObservableObject {
    @Published private(set) var tags: [Tag]
    @Published private(set) var selected: Set<Tag.ID> = []

    init(tags: [Tag]) {
        self.tags = tags
    }

    func toggle(_ tag: Tag) {
        if selected.contains(tag.id) {
            selected.remove(tag.id)
        } else {
            selected.insert(tag.id)
        }
    }

    func isSelected(_ tag: Tag) -> Bool {
        selected.contains(tag.id)
    }

    var selectedTags: [Tag] {
        tags.filter { selected.contains($0.id) }
    }

    func applyUsageCounts(_ counts: [String: Int]) {
        tags = tags.map { tag in
            var copy = tag
            copy.usageCount = counts[tag.id] ?? tag.usageCount
            return copy
        }
    }
}
`,
    hint: 'Two `Tag` values with different `usageCount` are not equal, so the refreshed tag is "not in" the set. Store ids, not whole values.',
    explanation:
      'Synthesized `Hashable` on a struct hashes every stored property, so after `applyUsageCounts` produces a `Tag` with a new count, `selected.contains(tag)` compares against the old value and returns `false` — the set still holds the stale copies, which is why the count did not change. Selection is about identity, not value, so it belongs in a `Set<Tag.ID>`. This is the same reason diffable data sources and `ForEach` want a stable `id` rather than the full model as the key.',
    rules: [
      { label: 'Selection is keyed by tag id', type: 'mustContain', pattern: r`Set<\s*(Tag\.ID|String)\s*>`, regex: true },
      { label: 'Selection operations use tag.id', type: 'mustContain', pattern: r`selected\.(contains|insert|remove)\(\s*tag\.id\s*\)`, regex: true },
      { label: 'No longer stores whole Tag values', type: 'mustNotContain', pattern: r`Set<\s*Tag\s*>`, regex: true },
    ],
  },
  {
    id: 'swift-order-cell-stale-badge',
    number: 9,
    language: 'swift',
    kind: 'debug',
    title: 'Rush Badge Sticks to Reused Cells',
    difficulty: 'Easy',
    topic: 'UIKit & Layout',
    statement:
      'A kitchen display lists orders; rush orders show a red RUSH badge. Scroll far enough and normal orders start showing the badge too — it seems to follow the cell, not the order.\n\n' +
      'The cell is being reused with stale state. Fix `OrderCell` so the badge always reflects the order it is configured with (resetting in `prepareForReuse()` or configuring unconditionally are both acceptable).',
    functionSignature: 'func configure(with order: Order)',
    buggyCode: r`import UIKit

struct Order {
    let number: String
    let isRush: Bool
}

final class OrderCell: UITableViewCell {
    static let reuseID = "OrderCell"
    private let numberLabel = UILabel()
    private let rushBadge = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        rushBadge.text = "RUSH"
        rushBadge.textColor = .systemRed
        rushBadge.isHidden = true
        contentView.addSubview(numberLabel)
        contentView.addSubview(rushBadge)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func configure(with order: Order) {
        numberLabel.text = "#\(order.number)"
        if order.isRush {
            rushBadge.isHidden = false
        }
    }
}
`,
    solution: r`import UIKit

struct Order {
    let number: String
    let isRush: Bool
}

final class OrderCell: UITableViewCell {
    static let reuseID = "OrderCell"
    private let numberLabel = UILabel()
    private let rushBadge = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        rushBadge.text = "RUSH"
        rushBadge.textColor = .systemRed
        rushBadge.isHidden = true
        contentView.addSubview(numberLabel)
        contentView.addSubview(rushBadge)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        numberLabel.text = nil
        rushBadge.isHidden = true
    }

    func configure(with order: Order) {
        numberLabel.text = "#\(order.number)"
        rushBadge.isHidden = !order.isRush
    }
}
`,
    hint: 'A dequeued cell keeps whatever the previous row set. Either reset in `prepareForReuse()` (call super) or assign `isHidden` on both branches.',
    explanation:
      '`dequeueReusableCell` recycles cells that scrolled offscreen, so a cell that showed a rush order comes back with `rushBadge.isHidden == false` already set. `configure` only ever revealed the badge and never hid it, so the state leaked from row to row. Configuring every visual property unconditionally (`isHidden = !order.isRush`) makes `configure` idempotent, and `prepareForReuse()` is the belt-and-braces reset for anything configure might not touch, such as images still loading.',
    rules: [
      { label: 'Badge visibility reflects the order every time', type: 'mustContain', pattern: r`rushBadge\.isHidden\s*=\s*!\s*order\.isRush|override\s+func\s+prepareForReuse`, regex: true },
      { label: 'Either calls super.prepareForReuse() or assigns unconditionally', type: 'mustContain', pattern: r`super\.prepareForReuse\(\)|isHidden\s*=\s*!`, regex: true },
      { label: 'Still sets the order number', type: 'mustContain', pattern: r`numberLabel\.text\s*=`, regex: true },
    ],
  },
  {
    id: 'swift-note-cell-layout-conflict',
    number: 10,
    language: 'swift',
    kind: 'debug',
    title: 'Self-Sizing Note Cell Logs a Constraint Conflict',
    difficulty: 'Hard',
    topic: 'UIKit & Layout',
    statement:
      'A notes table uses `rowHeight = UITableView.automaticDimension` with an estimated height. On first layout the console prints "Unable to simultaneously satisfy constraints" naming `UIView-Encapsulated-Layout-Height`, and Auto Layout breaks a constraint at random, so some cells render clipped.\n\n' +
      'All four edge constraints are `.required`, so they fight the temporary encapsulated height UIKit applies before the real height is known. Fix the priority so the label still drives the cell height but cannot conflict with the system\'s constraint.',
    functionSignature: 'override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?)',
    buggyCode: r`import UIKit

final class NoteCell: UITableViewCell {
    private let bodyLabel = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        bodyLabel.numberOfLines = 0
        bodyLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(bodyLabel)
        NSLayoutConstraint.activate([
            bodyLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 12),
            bodyLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            bodyLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            bodyLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -12),
        ])
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func configure(text: String) {
        bodyLabel.text = text
    }
}
`,
    solution: r`import UIKit

final class NoteCell: UITableViewCell {
    private let bodyLabel = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        bodyLabel.numberOfLines = 0
        bodyLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(bodyLabel)

        let bottom = bodyLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -12)
        bottom.priority = UILayoutPriority(999)

        NSLayoutConstraint.activate([
            bodyLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 12),
            bodyLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            bodyLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            bottom,
        ])
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func configure(text: String) {
        bodyLabel.text = text
    }
}
`,
    hint: 'Keep the vertical chain, but give the bottom constraint a priority just below `.required` (999) so the system height can win momentarily without an error.',
    explanation:
      'Before a self-sizing cell has measured its content, UIKit pins `contentView` to the estimated row height with a required `UIView-Encapsulated-Layout-Height` constraint. If your own vertical chain is also required and disagrees, the solver has an unsatisfiable system and breaks one at random — sometimes yours. Lowering one vertical constraint to `UILayoutPriority(999)` keeps it winning against everything else you wrote while letting the temporary system constraint take precedence during that first pass, so the label still sizes the cell and the log goes quiet.',
    rules: [
      { label: 'A vertical constraint is lowered just below required', type: 'mustContain', pattern: r`\.priority\s*=\s*(UILayoutPriority\s*\(\s*(rawValue:\s*)?\d+\s*\)|\.defaultHigh|UILayoutPriority\.defaultHigh|\.required\s*-\s*1|UILayoutPriority\.required\s*-\s*1)`, regex: true },
      { label: 'Constraints are still activated', type: 'mustContain', pattern: r`NSLayoutConstraint\.activate\s*\(|\.isActive\s*=\s*true`, regex: true },
      { label: 'Autoresizing mask translation stays off', type: 'mustContain', pattern: r`translatesAutoresizingMaskIntoConstraints\s*=\s*false`, regex: true },
    ],
  },
  {
    id: "swift-debounced-catalog-search",
    number: 16,
    language: "swift",
    kind: "build",
    title: "Debounced Catalogue Search",
    difficulty: "Medium",
    topic: "Combine & Reactive",
    statement: "Implement `queries` on `CatalogSearchModel`. Starting from `$query`, the pipeline must:\n\n1. trim leading/trailing whitespace and newlines;\n2. debounce by **300 ms** on the injected `scheduler` (a `DispatchQueue`), so a fast typist triggers one request, not one per keystroke;\n3. drop anything shorter than **2 characters**;\n4. never emit the same string twice in a row (`removeDuplicates`).\n\nErase to `AnyPublisher<String, Never>`. Do not touch `query` itself; the text field stays bound to it.",
    functionSignature: "var queries: AnyPublisher<String, Never>",
    buggyCode: "import Combine\nimport Foundation\n\n/// Drives the catalogue search box. `queries` must emit only the queries worth sending to the server.\nfinal class CatalogSearchModel: ObservableObject {\n    @Published var query = \"\"\n    private let scheduler: DispatchQueue\n\n    init(scheduler: DispatchQueue = .main) {\n        self.scheduler = scheduler\n    }\n\n    /// Trimmed, debounced 300 ms on `scheduler`, at least 2 characters, no consecutive repeats.\n    var queries: AnyPublisher<String, Never> {\n        // TODO: build the pipeline\n        return $query.eraseToAnyPublisher()\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\n/// Drives the catalogue search box. `queries` must emit only the queries worth sending to the server.\nfinal class CatalogSearchModel: ObservableObject {\n    @Published var query = \"\"\n    private let scheduler: DispatchQueue\n\n    init(scheduler: DispatchQueue = .main) {\n        self.scheduler = scheduler\n    }\n\n    /// Trimmed, debounced 300 ms on `scheduler`, at least 2 characters, no consecutive repeats.\n    var queries: AnyPublisher<String, Never> {\n        $query\n            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }\n            .debounce(for: .milliseconds(300), scheduler: scheduler)\n            .filter { $0.count >= 2 }\n            .removeDuplicates()\n            .eraseToAnyPublisher()\n    }\n}\n",
    hint: "Order matters: trim → debounce → filter → removeDuplicates. Use `.debounce(for: .milliseconds(300), scheduler: scheduler)`.",
    explanation: "Debouncing waits for a quiet gap before forwarding the latest value, which turns a burst of keystrokes into a single search. Trimming before debounce and filtering short strings after it means \"a \" and \"a\" collapse to nothing, and `removeDuplicates` stops a backspace-and-retype from refiring an identical request. Injecting the scheduler is what lets a unit test drive the pipeline deterministically instead of sleeping.",
    rules: [
      { label: "Debounces by 300 ms", type: "mustContain", pattern: "\\.debounce\\(\\s*for:\\s*(\\.milliseconds\\(\\s*300\\s*\\)|\\.seconds\\(\\s*0?\\.3\\s*\\)|0?\\.3\\b)", regex: true },
      { label: "Filters out queries shorter than 2 characters", type: "mustContain", pattern: "\\.filter\\s*\\{[^}]*\\.count\\s*(>=|>|<|<=)\\s*\\w+", regex: true },
      { label: "Removes consecutive duplicates", type: "mustContain", pattern: "\\.removeDuplicates\\(", regex: true },
      { label: "No longer forwards $query untouched", type: "mustNotContain", pattern: "return\\s+\\$query\\s*\\.eraseToAnyPublisher\\(\\)", regex: true },
    ],
  },
  {
    id: "swift-enroll-form-submit-gate",
    number: 17,
    language: "swift",
    kind: "build",
    title: "Sign-Up Button Gate",
    difficulty: "Easy",
    topic: "Combine & Reactive",
    statement: "Implement `canSubmit` on `EnrollFormModel` by combining the three `@Published` fields with `combineLatest` (or `Publishers.CombineLatest3`). It emits `true` only when **all** of these hold:\n\n- `email` contains an `@` that is not the first character, followed somewhere later by a `.`;\n- `password.count >= 8`;\n- `password == confirmPassword`.\n\nAdd `removeDuplicates()` so the button is not re-rendered on every keystroke, and erase to `AnyPublisher<Bool, Never>`.",
    functionSignature: "var canSubmit: AnyPublisher<Bool, Never>",
    buggyCode: "import Combine\nimport Foundation\n\n/// Backs the \"Create account\" form. The submit button is bound to `canSubmit`.\nfinal class EnrollFormModel: ObservableObject {\n    @Published var email = \"\"\n    @Published var password = \"\"\n    @Published var confirmPassword = \"\"\n\n    /// true only when the email has an \"@\" followed by a \".\", the password is 8+ characters,\n    /// and both password fields match. Must not re-emit the same Bool twice in a row.\n    var canSubmit: AnyPublisher<Bool, Never> {\n        // TODO\n        return Just(false).eraseToAnyPublisher()\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\n/// Backs the \"Create account\" form. The submit button is bound to `canSubmit`.\nfinal class EnrollFormModel: ObservableObject {\n    @Published var email = \"\"\n    @Published var password = \"\"\n    @Published var confirmPassword = \"\"\n\n    /// true only when the email has an \"@\" followed by a \".\", the password is 8+ characters,\n    /// and both password fields match. Must not re-emit the same Bool twice in a row.\n    var canSubmit: AnyPublisher<Bool, Never> {\n        Publishers.CombineLatest3($email, $password, $confirmPassword)\n            .map { email, password, confirm in\n                Self.looksLikeEmail(email) && password.count >= 8 && password == confirm\n            }\n            .removeDuplicates()\n            .eraseToAnyPublisher()\n    }\n\n    private static func looksLikeEmail(_ text: String) -> Bool {\n        guard let at = text.firstIndex(of: \"@\"), at != text.startIndex else { return false }\n        return text[text.index(after: at)...].contains(\".\")\n    }\n}\n",
    hint: "`Publishers.CombineLatest3($email, $password, $confirmPassword).map { e, p, c in … }`.",
    explanation: "`combineLatest` re-evaluates whenever any input changes and only starts once every input has produced a value — `@Published` publishers emit their current value on subscription, so the button state is correct immediately. `removeDuplicates` matters because each keystroke would otherwise push a fresh `true`/`false` through the view hierarchy.",
    rules: [
      { label: "Combines the three fields with combineLatest", type: "mustContain", pattern: "combineLatest|CombineLatest3", regex: true },
      { label: "Requires an 8+ character password", type: "mustContain", pattern: "count\\s*>=\\s*8|count\\s*>\\s*7", regex: true },
      { label: "Suppresses repeated Bool values", type: "mustContain", pattern: "\\.removeDuplicates\\(", regex: true },
      { label: "No longer returns the Just(false) placeholder", type: "mustNotContain", pattern: "Just\\(\\s*false\\s*\\)", regex: true },
    ],
  },
  {
    id: "swift-shared-rate-feed-replay",
    number: 18,
    language: "swift",
    kind: "build",
    title: "One Socket, Many Screens",
    difficulty: "Hard",
    topic: "Combine & Reactive",
    statement: "`ExchangeRateFeed` wraps an `upstream` publisher that is expensive to subscribe to (it opens a socket). Implement `rates` so that:\n\n- the **first** subscriber causes exactly one subscription to `upstream`; later subscribers reuse it — `upstream` must never be subscribed twice for the lifetime of the feed;\n- a subscriber that arrives after values have flowed **immediately** receives the most recent rate, then live updates;\n- subscribers never receive a `nil`/placeholder — before the first upstream value they simply wait.\n\nA `CurrentValueSubject<Double?, Never>` fed by one stored `AnyCancellable` (or a `multicast` with `autoconnect`) is the expected shape. Make the one-time connection thread-safe.",
    functionSignature: "var rates: AnyPublisher<Double, Never>",
    buggyCode: "import Combine\nimport Foundation\n\n/// Wraps an expensive upstream (a live exchange-rate socket). Every screen that reads `rates`\n/// must share ONE upstream subscription, and a late subscriber must receive the latest rate immediately.\nfinal class ExchangeRateFeed {\n    private let upstream: AnyPublisher<Double, Never>\n\n    init(upstream: AnyPublisher<Double, Never>) {\n        self.upstream = upstream\n    }\n\n    var rates: AnyPublisher<Double, Never> {\n        // TODO: one shared subscription + replay of the latest value\n        return upstream.eraseToAnyPublisher()\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\n/// Wraps an expensive upstream (a live exchange-rate socket). Every screen that reads `rates`\n/// must share ONE upstream subscription, and a late subscriber must receive the latest rate immediately.\nfinal class ExchangeRateFeed {\n    private let upstream: AnyPublisher<Double, Never>\n    private let latest = CurrentValueSubject<Double?, Never>(nil)\n    private var connection: AnyCancellable?\n    private let lock = NSLock()\n\n    init(upstream: AnyPublisher<Double, Never>) {\n        self.upstream = upstream\n    }\n\n    var rates: AnyPublisher<Double, Never> {\n        lock.lock()\n        if connection == nil {\n            // Connect exactly once; the subject fans out to every subscriber and caches the last value.\n            connection = upstream.map { Optional($0) }.subscribe(latest)\n        }\n        lock.unlock()\n        return latest.compactMap { $0 }.eraseToAnyPublisher()\n    }\n}\n",
    hint: "Keep a `CurrentValueSubject<Double?, Never>(nil)`, connect `upstream` to it once (store the `AnyCancellable`), and return `subject.compactMap { $0 }`.",
    explanation: "Plain `share()` only de-duplicates work for simultaneous subscribers and gives late-comers nothing until the next emission; routing the upstream into a `CurrentValueSubject` caches the last value for replay and fans out to any number of subscribers. The connection must happen exactly once, so it is guarded by a lock (or done under `multicast(...).autoconnect()`). This is how a single websocket feeds a watchlist, a detail screen and a widget at the same time.",
    rules: [
      { label: "Caches the latest value in a subject (or multicasts)", type: "mustContain", pattern: "CurrentValueSubject|multicast\\(", regex: true },
      { label: "Connects the upstream exactly once and keeps the cancellable", type: "mustContain", pattern: "\\.subscribe\\(|\\.sink\\s*[\\{(]|\\.autoconnect\\(\\)|\\.connect\\(\\)", regex: true },
      { label: "Skips the empty placeholder before the first value", type: "mustContain", pattern: "compactMap|autoconnect", regex: true },
      { label: "No longer hands out the raw upstream", type: "mustNotContain", pattern: "return\\s+upstream\\s*\\.eraseToAnyPublisher\\(\\)", regex: true },
    ],
  },
  {
    id: "swift-defaults-preference-wrapper",
    number: 19,
    language: "swift",
    kind: "build",
    title: "Preference Property Wrapper",
    difficulty: "Medium",
    topic: "Persistence",
    statement: "Finish the `Preference` property wrapper so `ReaderSettings` works:\n\n- **get**: read `store.data(forKey: key)` and decode it with `JSONDecoder` into `Value`; if nothing is stored, or decoding fails (the schema changed), return `defaultValue`;\n- **set**: encode `newValue` with `JSONEncoder` and write the `Data` with `store.set(_:forKey:)`. Keep the setter `nonmutating` so the wrapper works on `let`-like class properties.\n\nNever use `try!` — a corrupt blob must degrade to the default, not crash the app at launch.",
    functionSignature: "@propertyWrapper struct Preference<Value: Codable>",
    buggyCode: "import Foundation\n\n/// Persists any Codable value in UserDefaults under `key`. Reads fall back to `default` when nothing\n/// is stored or the stored blob no longer decodes; writes encode the new value as JSON data.\n@propertyWrapper\nstruct Preference<Value: Codable> {\n    let key: String\n    let defaultValue: Value\n    let store: UserDefaults\n\n    init(key: String, default defaultValue: Value, store: UserDefaults = .standard) {\n        self.key = key\n        self.defaultValue = defaultValue\n        self.store = store\n    }\n\n    var wrappedValue: Value {\n        get { defaultValue }   // TODO: read data(forKey:) and decode\n        nonmutating set { }    // TODO: encode and store\n    }\n}\n\nfinal class ReaderSettings {\n    @Preference(key: \"reader.fontScale\", default: 1.0) var fontScale: Double\n    @Preference(key: \"reader.recentIds\", default: []) var recentIds: [String]\n}\n",
    solution: "import Foundation\n\n/// Persists any Codable value in UserDefaults under `key`. Reads fall back to `default` when nothing\n/// is stored or the stored blob no longer decodes; writes encode the new value as JSON data.\n@propertyWrapper\nstruct Preference<Value: Codable> {\n    let key: String\n    let defaultValue: Value\n    let store: UserDefaults\n\n    init(key: String, default defaultValue: Value, store: UserDefaults = .standard) {\n        self.key = key\n        self.defaultValue = defaultValue\n        self.store = store\n    }\n\n    var wrappedValue: Value {\n        get {\n            guard let data = store.data(forKey: key),\n                  let value = try? JSONDecoder().decode(Value.self, from: data) else {\n                return defaultValue\n            }\n            return value\n        }\n        nonmutating set {\n            guard let data = try? JSONEncoder().encode(newValue) else { return }\n            store.set(data, forKey: key)\n        }\n    }\n}\n\nfinal class ReaderSettings {\n    @Preference(key: \"reader.fontScale\", default: 1.0) var fontScale: Double\n    @Preference(key: \"reader.recentIds\", default: []) var recentIds: [String]\n}\n",
    hint: "Encode to `Data` with `JSONEncoder` and store it with `store.set(data, forKey: key)`; decode with `try?` and fall back to `defaultValue`.",
    explanation: "Going through `Data` lets a single wrapper persist any `Codable` type — arrays, enums, nested structs — not just the property-list scalars `UserDefaults` accepts natively. Falling back on decode failure is what keeps an app launchable after a model change ships. Injecting the `UserDefaults` instance means tests use `UserDefaults(suiteName:)` and never pollute the real one.",
    rules: [
      { label: "Decodes the stored data", type: "mustContain", pattern: "JSONDecoder\\(\\)|PropertyListDecoder\\(\\)", regex: true },
      { label: "Encodes the new value", type: "mustContain", pattern: "JSONEncoder\\(\\)|PropertyListEncoder\\(\\)", regex: true },
      { label: "Writes to the injected store", type: "mustContain", pattern: "store\\.(set|setValue)\\(", regex: true },
      { label: "No force-try", type: "mustNotContain", pattern: "try!", regex: true },
    ],
  },
  {
    id: "swift-versioned-snapshot-cache",
    number: 20,
    language: "swift",
    kind: "build",
    title: "Versioned Launch Snapshot",
    difficulty: "Medium",
    topic: "Persistence",
    statement: "Implement `save(_:at:)` and `load()` on `SnapshotCache`.\n\n- `save` wraps the payload in `CacheEnvelope(schemaVersion:savedAt:payload:)` using the cache's own `schemaVersion` and the supplied date, encodes it with `JSONEncoder`, and writes the bytes to `store` under `name`.\n- `load` reads the blob for `name`, decodes a `CacheEnvelope<Payload>`, and returns its `payload` — but returns `nil` when nothing is stored, when decoding fails, **or when the envelope's `schemaVersion` differs from the cache's**, so a build with a new model never renders a stale blob.\n\nNo `try!`: a bad blob means \"no cache\", never a crash.",
    functionSignature: "final class SnapshotCache<Payload: Codable>",
    buggyCode: "import Foundation\n\nprotocol BlobStore {\n    func read(_ name: String) -> Data?\n    func write(_ data: Data, name: String)\n}\n\nfinal class InMemoryBlobStore: BlobStore {\n    private var blobs: [String: Data] = [:]\n    func read(_ name: String) -> Data? { blobs[name] }\n    func write(_ data: Data, name: String) { blobs[name] = data }\n}\n\nstruct CacheEnvelope<Payload: Codable>: Codable {\n    let schemaVersion: Int\n    let savedAt: Date\n    let payload: Payload\n}\n\n/// Caches one Codable snapshot (e.g. the home feed) so the app can paint instantly on launch.\nfinal class SnapshotCache<Payload: Codable> {\n    private let store: BlobStore\n    private let name: String\n    private let schemaVersion: Int\n\n    init(store: BlobStore, name: String, schemaVersion: Int) {\n        self.store = store\n        self.name = name\n        self.schemaVersion = schemaVersion\n    }\n\n    func save(_ payload: Payload, at date: Date) {\n        // TODO: wrap in CacheEnvelope, encode, write under `name`\n    }\n\n    /// nil when nothing is cached, the blob no longer decodes, or it was written by another schema version.\n    func load() -> Payload? {\n        // TODO\n        return nil\n    }\n}\n",
    solution: "import Foundation\n\nprotocol BlobStore {\n    func read(_ name: String) -> Data?\n    func write(_ data: Data, name: String)\n}\n\nfinal class InMemoryBlobStore: BlobStore {\n    private var blobs: [String: Data] = [:]\n    func read(_ name: String) -> Data? { blobs[name] }\n    func write(_ data: Data, name: String) { blobs[name] = data }\n}\n\nstruct CacheEnvelope<Payload: Codable>: Codable {\n    let schemaVersion: Int\n    let savedAt: Date\n    let payload: Payload\n}\n\n/// Caches one Codable snapshot (e.g. the home feed) so the app can paint instantly on launch.\nfinal class SnapshotCache<Payload: Codable> {\n    private let store: BlobStore\n    private let name: String\n    private let schemaVersion: Int\n\n    init(store: BlobStore, name: String, schemaVersion: Int) {\n        self.store = store\n        self.name = name\n        self.schemaVersion = schemaVersion\n    }\n\n    func save(_ payload: Payload, at date: Date) {\n        let envelope = CacheEnvelope(schemaVersion: schemaVersion, savedAt: date, payload: payload)\n        guard let data = try? JSONEncoder().encode(envelope) else { return }\n        store.write(data, name: name)\n    }\n\n    /// nil when nothing is cached, the blob no longer decodes, or it was written by another schema version.\n    func load() -> Payload? {\n        guard let data = store.read(name),\n              let envelope = try? JSONDecoder().decode(CacheEnvelope<Payload>.self, from: data),\n              envelope.schemaVersion == schemaVersion else {\n            return nil\n        }\n        return envelope.payload\n    }\n}\n",
    hint: "Compare `envelope.schemaVersion == schemaVersion` inside the same `guard` that decodes.",
    explanation: "Wrapping the payload in an envelope gives every cached blob a version tag and a timestamp without touching the payload type. Checking the version on read is the cheapest migration strategy for a cache: since the data is reproducible from the server, a mismatch just means \"fetch fresh\". Force-unwrapping decode results is the classic launch-crash bug after a schema change.",
    rules: [
      { label: "Encodes the envelope", type: "mustContain", pattern: "JSONEncoder\\(\\)|PropertyListEncoder\\(\\)", regex: true },
      { label: "Decodes the envelope", type: "mustContain", pattern: "JSONDecoder\\(\\)|PropertyListDecoder\\(\\)", regex: true },
      { label: "Rejects a blob written by another schema version", type: "mustContain", pattern: "schemaVersion\\s*(==|!=)\\s*(self\\.)?\\w*\\.?schemaVersion", regex: true },
      { label: "No force-try", type: "mustNotContain", pattern: "try!", regex: true },
    ],
  },
  {
    id: "swift-rider-profile-migration",
    number: 21,
    language: "swift",
    kind: "build",
    title: "Rider Profile Schema Upgrade",
    difficulty: "Hard",
    topic: "Persistence",
    statement: "Older builds of the bike-share app saved `RiderProfile` as **v1**: `{\"version\":1,\"fullName\":\"Ada Lovelace\",\"radiusKm\":5}`. The current model is **v2**: `{\"version\":2,\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"radiusMeters\":5000}`. Write a custom `init(from:)` and `encode(to:)` so that:\n\n- decoding reads `version` (missing → treat as 1);\n- v1: split `fullName` on the **first** space — everything before is `firstName`, everything after is `lastName` (empty when there is no space); `radiusMeters = radiusKm * 1000`;\n- v2: read the new keys directly;\n- any other version throws a `DecodingError`;\n- encoding **always** writes `version: 2` plus the v2 keys.\n\nKeep the memberwise-style `init(firstName:lastName:radiusMeters:)` available.",
    functionSignature: "struct RiderProfile: Codable",
    buggyCode: "import Foundation\n\n/// Profiles were saved to disk by two app generations:\n///   v1  {\"version\":1,\"fullName\":\"Ada Lovelace\",\"radiusKm\":5}\n///   v2  {\"version\":2,\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"radiusMeters\":5000}\n/// Decode both (a missing \"version\" means v1); always encode v2.\nstruct RiderProfile: Codable, Equatable {\n    var firstName: String\n    var lastName: String\n    var radiusMeters: Int\n\n    static let currentVersion = 2\n\n    // TODO: custom decoding that migrates v1 → v2, and encoding that always writes version 2\n}\n",
    solution: "import Foundation\n\n/// Profiles were saved to disk by two app generations:\n///   v1  {\"version\":1,\"fullName\":\"Ada Lovelace\",\"radiusKm\":5}\n///   v2  {\"version\":2,\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"radiusMeters\":5000}\n/// Decode both (a missing \"version\" means v1); always encode v2.\nstruct RiderProfile: Codable, Equatable {\n    var firstName: String\n    var lastName: String\n    var radiusMeters: Int\n\n    static let currentVersion = 2\n\n    private enum Keys: String, CodingKey {\n        case version, fullName, radiusKm, firstName, lastName, radiusMeters\n    }\n\n    init(firstName: String, lastName: String, radiusMeters: Int) {\n        self.firstName = firstName\n        self.lastName = lastName\n        self.radiusMeters = radiusMeters\n    }\n\n    init(from decoder: Decoder) throws {\n        let c = try decoder.container(keyedBy: Keys.self)\n        let version = try c.decodeIfPresent(Int.self, forKey: .version) ?? 1\n        switch version {\n        case 1:\n            let full = try c.decode(String.self, forKey: .fullName)\n            let parts = full.split(separator: \" \", maxSplits: 1).map(String.init)\n            firstName = parts.first ?? \"\"\n            lastName = parts.count > 1 ? parts[1] : \"\"\n            radiusMeters = try c.decode(Int.self, forKey: .radiusKm) * 1000\n        case 2:\n            firstName = try c.decode(String.self, forKey: .firstName)\n            lastName = try c.decode(String.self, forKey: .lastName)\n            radiusMeters = try c.decode(Int.self, forKey: .radiusMeters)\n        default:\n            throw DecodingError.dataCorruptedError(forKey: .version, in: c,\n                                                   debugDescription: \"Unsupported profile version \\(version)\")\n        }\n    }\n\n    func encode(to encoder: Encoder) throws {\n        var c = encoder.container(keyedBy: Keys.self)\n        try c.encode(Self.currentVersion, forKey: .version)\n        try c.encode(firstName, forKey: .firstName)\n        try c.encode(lastName, forKey: .lastName)\n        try c.encode(radiusMeters, forKey: .radiusMeters)\n    }\n}\n",
    hint: "One `CodingKeys` enum can list keys from both versions; branch on `decodeIfPresent(Int.self, forKey: .version) ?? 1`.",
    explanation: "Reading the version first and branching inside `init(from:)` lets one type decode every blob a user might have on disk, while `encode(to:)` always writes the newest shape so the migration runs at most once per record. Splitting on the first space only (`maxSplits: 1`) keeps multi-word surnames intact. Throwing on unknown versions is deliberate: silently defaulting would hide a downgrade bug.",
    rules: [
      { label: "Custom decoder", type: "mustContain", pattern: "init\\(from\\s+decoder", regex: true },
      { label: "Splits the legacy fullName on the first space", type: "mustContain", pattern: "split\\(separator:\\s*\"\\s\"|components\\(separatedBy:\\s*\"\\s\"|firstIndex\\(of:\\s*\"\\s\"\\)", regex: true },
      { label: "Converts kilometres to metres", type: "mustContain", pattern: "\\*\\s*1[_]?000\\b", regex: true },
      { label: "Always encodes version 2", type: "mustContain", pattern: "encode\\(\\s*(2|Self\\.\\w*[vV]ersion\\w*|RiderProfile\\.\\w*[vV]ersion\\w*)\\s*,\\s*forKey:\\s*\\.version", regex: true },
    ],
  },
  {
    id: "swift-voiceover-spice-picker",
    number: 22,
    language: "swift",
    kind: "build",
    title: "Spice Picker for VoiceOver",
    difficulty: "Medium",
    topic: "Accessibility & UX",
    statement: "The five-flame `SpiceLevelPicker` works by touch but VoiceOver reads it as five unlabeled images. Add the accessibility modifiers so that:\n\n- the whole row is **one** element (`accessibilityElement(children: .ignore)`);\n- its label is `\"Spice level\"` and its value reads `\"<level> of 4\"`;\n- it is adjustable: `accessibilityAdjustableAction` increments on `.increment` and decrements on `.decrement`, clamped to `0...maxLevel`. Handle `@unknown default`.\n\nDo not change the visual layout.",
    functionSignature: "struct SpiceLevelPicker: View",
    buggyCode: "import SwiftUI\n\n/// Five flames; tapping the n-th one sets the level (0...4). VoiceOver must see ONE adjustable element\n/// labelled \"Spice level\" whose value reads like \"2 of 4\", and swiping up/down must change it.\nstruct SpiceLevelPicker: View {\n    @Binding var level: Int\n    private let maxLevel = 4\n\n    var body: some View {\n        HStack(spacing: 6) {\n            ForEach(0...maxLevel, id: \\.self) { index in\n                Image(systemName: index <= level ? \"flame.fill\" : \"flame\")\n                    .foregroundStyle(index <= level ? Color.orange : Color.secondary)\n                    .onTapGesture { level = index }\n            }\n        }\n        // TODO: accessibility modifiers\n    }\n}\n",
    solution: "import SwiftUI\n\n/// Five flames; tapping the n-th one sets the level (0...4). VoiceOver must see ONE adjustable element\n/// labelled \"Spice level\" whose value reads like \"2 of 4\", and swiping up/down must change it.\nstruct SpiceLevelPicker: View {\n    @Binding var level: Int\n    private let maxLevel = 4\n\n    var body: some View {\n        HStack(spacing: 6) {\n            ForEach(0...maxLevel, id: \\.self) { index in\n                Image(systemName: index <= level ? \"flame.fill\" : \"flame\")\n                    .foregroundStyle(index <= level ? Color.orange : Color.secondary)\n                    .onTapGesture { level = index }\n            }\n        }\n        .accessibilityElement(children: .ignore)\n        .accessibilityLabel(\"Spice level\")\n        .accessibilityValue(\"\\(level) of \\(maxLevel)\")\n        .accessibilityAdjustableAction { direction in\n            switch direction {\n            case .increment: level = min(level + 1, maxLevel)\n            case .decrement: level = max(level - 1, 0)\n            @unknown default: break\n            }\n        }\n    }\n}\n",
    hint: "Attach the modifiers to the `HStack`, not the individual images.",
    explanation: "Collapsing the children into one element with a label, a value and an adjustable action is the VoiceOver contract for any slider-like control: the user hears \"Spice level, 2 of 4, adjustable\" and swipes up/down to change it, instead of hunting through five identical \"image\" elements. Clamping inside the action keeps the control from stepping past its range when swiped repeatedly.",
    rules: [
      { label: "Row is a single accessibility element", type: "mustContain", pattern: "\\.accessibilityElement\\(\\s*children:\\s*\\.(ignore|combine)\\s*\\)", regex: true },
      { label: "Has an accessibility label", type: "mustContain", pattern: "\\.accessibilityLabel\\(", regex: true },
      { label: "Exposes the current level as the value", type: "mustContain", pattern: "\\.accessibilityValue\\(", regex: true },
      { label: "Adjustable via swipe up/down", type: "mustContain", pattern: "\\.accessibilityAdjustableAction", regex: true },
    ],
  },
  {
    id: "swift-plural-download-badge",
    number: 23,
    language: "swift",
    kind: "build",
    title: "Pluralized Download Badge",
    difficulty: "Easy",
    topic: "Accessibility & UX",
    statement: "The podcast app ships in eleven languages, several of which have more than two plural forms (Russian, Arabic, Polish). `DownloadBadge.label(count:)` currently branches on `count == 1` in English. `Localizable.stringsdict` already defines the key **`downloads_count`** with a `%lld` plural rule for every locale.\n\nRewrite `label(count:)` to look the format up with `NSLocalizedString` (or `String(localized:)`) and render it with `String.localizedStringWithFormat(_:_:)`, so the plural category is chosen by the system for the current locale. No hard-coded English strings or count-based branching may remain.",
    functionSignature: "static func label(count: Int) -> String",
    buggyCode: "import Foundation\n\nenum DownloadBadge {\n    /// \"1 episode downloaded\", \"3 episodes downloaded\" — correct in every supported locale.\n    /// Localizable.stringsdict already defines the key \"downloads_count\" with a %lld plural rule.\n    static func label(count: Int) -> String {\n        // TODO: replace the hard-coded English branching with the localized plural format\n        return count == 1 ? \"1 episode downloaded\" : \"\\(count) episodes downloaded\"\n    }\n}\n",
    solution: "import Foundation\n\nenum DownloadBadge {\n    /// \"1 episode downloaded\", \"3 episodes downloaded\" — correct in every supported locale.\n    /// Localizable.stringsdict already defines the key \"downloads_count\" with a %lld plural rule.\n    static func label(count: Int) -> String {\n        let format = NSLocalizedString(\"downloads_count\", comment: \"Badge: number of downloaded episodes\")\n        return String.localizedStringWithFormat(format, count)\n    }\n}\n",
    hint: "`String.localizedStringWithFormat(NSLocalizedString(\"downloads_count\", comment: \"\"), count)`.",
    explanation: "CLDR plural rules are not \"one vs. many\": Russian needs one/few/many, Arabic six categories. A `.stringsdict` entry carries those rules per locale and `localizedStringWithFormat` picks the right variant for the given number, so the code never encodes a grammar assumption. Reviewers specifically look for count-based ternaries as a localization smell.",
    rules: [
      { label: "Looks the format up by localization key", type: "mustContain", pattern: "NSLocalizedString\\(|String\\(\\s*localized:|LocalizedStringResource", regex: true },
      { label: "Formats with the locale-aware plural formatter", type: "mustContain", pattern: "localizedStringWithFormat|inflect:\\s*true", regex: true },
      { label: "No English count branching remains", type: "mustNotContain", pattern: "count\\s*(==|!=|>|<|>=|<=)\\s*\\d+\\s*\\?", regex: true },
    ],
  },
  {
    id: "swift-drag-dismiss-snapback",
    number: 24,
    language: "swift",
    kind: "build",
    title: "Swipe-Down Sheet Card",
    difficulty: "Medium",
    topic: "Animation & Gestures",
    statement: "Attach a `DragGesture` to `content` in `DismissibleCard` so that:\n\n- while dragging, the card follows the finger: `offset = value.translation` in `onChanged`;\n- on release (`onEnded`), if the drag ended more than **120 pt** downward (`translation.height > 120`) call `onDismiss()`;\n- otherwise animate the card back to `.zero` with a spring (`withAnimation(.spring(...))` or an `.animation(_, value:)` modifier).\n\nKeep the existing `.offset(offset)` modifier.",
    functionSignature: "struct DismissibleCard<Content: View>: View",
    buggyCode: "import SwiftUI\n\n/// A bottom card the user can drag. Dragging follows the finger; releasing past 120 pt downward\n/// dismisses, anything less springs the card back to where it started.\nstruct DismissibleCard<Content: View>: View {\n    let onDismiss: () -> Void\n    @ViewBuilder let content: Content\n    @State private var offset: CGSize = .zero\n\n    var body: some View {\n        content\n            .offset(offset)\n        // TODO: attach the drag gesture\n    }\n}\n",
    solution: "import SwiftUI\n\n/// A bottom card the user can drag. Dragging follows the finger; releasing past 120 pt downward\n/// dismisses, anything less springs the card back to where it started.\nstruct DismissibleCard<Content: View>: View {\n    let onDismiss: () -> Void\n    @ViewBuilder let content: Content\n    @State private var offset: CGSize = .zero\n\n    var body: some View {\n        content\n            .offset(offset)\n            .gesture(\n                DragGesture()\n                    .onChanged { value in\n                        offset = value.translation\n                    }\n                    .onEnded { value in\n                        if value.translation.height > 120 {\n                            onDismiss()\n                        } else {\n                            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {\n                                offset = .zero\n                            }\n                        }\n                    }\n            )\n    }\n}\n",
    hint: "`DragGesture().onChanged { offset = $0.translation }.onEnded { … }`, and snap back inside `withAnimation`.",
    explanation: "Tracking the raw translation during the drag keeps the card glued to the finger (no animation), while the snap-back happens only in `onEnded`, wrapped in `withAnimation`, so the spring plays once from the release point. Deciding on the *ended* translation rather than the live one avoids dismissing mid-drag if the user overshoots and comes back.",
    rules: [
      { label: "Uses a DragGesture", type: "mustContain", pattern: "DragGesture\\(", regex: true },
      { label: "Decides on release", type: "mustContain", pattern: "\\.onEnded\\s*\\{", regex: true },
      { label: "Checks the 120 pt threshold", type: "mustContain", pattern: "height\\s*>\\s*120|120\\s*<\\s*[\\w.]*height", regex: true },
      { label: "Animates back to zero", type: "mustContain", pattern: "withAnimation|\\.animation\\(", regex: true },
    ],
  },
  {
    id: "swift-flashcard-3d-flip",
    number: 25,
    language: "swift",
    kind: "build",
    title: "Study Card 3D Flip",
    difficulty: "Medium",
    topic: "Animation & Gestures",
    statement: "Rebuild `FlashcardView.body` as a real flip:\n\n- put both faces in a `ZStack`; rotate the **container** with `rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))`;\n- pre-rotate the back face by 180° around the same axis so it reads normally once the container has turned, and toggle each face's `opacity` on `isFlipped` so the hidden one never bleeds through;\n- tapping toggles `isFlipped` inside `withAnimation` (or use an `.animation(_, value:)` modifier).\n\nReuse the provided `face(_:)` helper.",
    functionSignature: "struct FlashcardView: View",
    buggyCode: "import SwiftUI\n\n/// Tap to flip a study card over. The flip must be a real 3D turn around the vertical axis,\n/// and the back face must never appear mirrored.\nstruct FlashcardView: View {\n    let front: String\n    let back: String\n    @State private var isFlipped = false\n\n    var body: some View {\n        // TODO: two faces in a ZStack, rotation3DEffect, animated toggle\n        face(isFlipped ? back : front)\n            .onTapGesture { isFlipped.toggle() }\n    }\n\n    private func face(_ text: String) -> some View {\n        Text(text)\n            .padding(24)\n            .frame(maxWidth: .infinity, minHeight: 160)\n            .background(RoundedRectangle(cornerRadius: 16).fill(Color(.systemGray6)))\n    }\n}\n",
    solution: "import SwiftUI\n\n/// Tap to flip a study card over. The flip must be a real 3D turn around the vertical axis,\n/// and the back face must never appear mirrored.\nstruct FlashcardView: View {\n    let front: String\n    let back: String\n    @State private var isFlipped = false\n\n    var body: some View {\n        ZStack {\n            face(front)\n                .opacity(isFlipped ? 0 : 1)\n            face(back)\n                // Pre-rotate the back so that after the container turns 180° it reads normally.\n                .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))\n                .opacity(isFlipped ? 1 : 0)\n        }\n        .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))\n        .onTapGesture {\n            withAnimation(.easeInOut(duration: 0.4)) { isFlipped.toggle() }\n        }\n    }\n\n    private func face(_ text: String) -> some View {\n        Text(text)\n            .padding(24)\n            .frame(maxWidth: .infinity, minHeight: 160)\n            .background(RoundedRectangle(cornerRadius: 16).fill(Color(.systemGray6)))\n    }\n}\n",
    hint: "Two faces, two `rotation3DEffect`s (180° fixed on the back, 0/180 on the container), opacity swapped at the midpoint.",
    explanation: "A single view flipped 180° shows its mirror image, so the back face is pre-rotated by 180° and both are toggled with opacity so exactly one is visible on each side of the turn. Rotating the container instead of each face keeps the two in lockstep. This is the standard flip pattern in SwiftUI without needing `matchedGeometryEffect`.",
    rules: [
      { label: "Rotates in 3D", type: "mustContain", pattern: "\\.rotation3DEffect\\(", regex: true },
      { label: "Rotates around the vertical axis", type: "mustContain", pattern: "axis:\\s*\\(\\s*x:\\s*0\\s*,\\s*y:\\s*1\\s*,\\s*z:\\s*0\\s*\\)", regex: true },
      { label: "Hides the back face with opacity driven by isFlipped", type: "mustContain", pattern: "\\.opacity\\(\\s*!?isFlipped", regex: true },
      { label: "Animates the flip", type: "mustContain", pattern: "withAnimation|\\.animation\\(", regex: true },
    ],
  },
  {
    id: "swift-haptic-player-abstraction",
    number: 26,
    language: "swift",
    kind: "build",
    title: "Testable Haptic Feedback",
    difficulty: "Easy",
    topic: "Animation & Gestures",
    statement: "Implement both `HapticPlayer`s:\n\n- `SystemHaptics.play` maps `.success` and `.warning` to `UINotificationFeedbackGenerator().notificationOccurred(.success / .warning)` and `.selection` to `UISelectionFeedbackGenerator().selectionChanged()`. Call `prepare()` before triggering.\n- `RecordingHaptics.play` appends the kind to `played` so a unit test can assert, e.g., `[.selection, .success]`.\n\nView models take a `HapticPlayer`, never the UIKit generators directly.",
    functionSignature: "protocol HapticPlayer { func play(_ kind: HapticKind) }",
    buggyCode: "import UIKit\n\nenum HapticKind: Equatable { case success, warning, selection }\n\nprotocol HapticPlayer {\n    func play(_ kind: HapticKind)\n}\n\n/// Production player backed by UIKit's feedback generators.\nstruct SystemHaptics: HapticPlayer {\n    func play(_ kind: HapticKind) {\n        // TODO\n    }\n}\n\n/// Test double: remembers every haptic that was requested, in order.\nfinal class RecordingHaptics: HapticPlayer {\n    private(set) var played: [HapticKind] = []\n\n    func play(_ kind: HapticKind) {\n        // TODO\n    }\n}\n",
    solution: "import UIKit\n\nenum HapticKind: Equatable { case success, warning, selection }\n\nprotocol HapticPlayer {\n    func play(_ kind: HapticKind)\n}\n\n/// Production player backed by UIKit's feedback generators.\nstruct SystemHaptics: HapticPlayer {\n    func play(_ kind: HapticKind) {\n        switch kind {\n        case .success:\n            let generator = UINotificationFeedbackGenerator()\n            generator.prepare()\n            generator.notificationOccurred(.success)\n        case .warning:\n            let generator = UINotificationFeedbackGenerator()\n            generator.prepare()\n            generator.notificationOccurred(.warning)\n        case .selection:\n            let generator = UISelectionFeedbackGenerator()\n            generator.prepare()\n            generator.selectionChanged()\n        }\n    }\n}\n\n/// Test double: remembers every haptic that was requested, in order.\nfinal class RecordingHaptics: HapticPlayer {\n    private(set) var played: [HapticKind] = []\n\n    func play(_ kind: HapticKind) {\n        played.append(kind)\n    }\n}\n",
    hint: "A `switch kind` with three cases; the test double is a one-liner.",
    explanation: "Hiding the feedback generators behind a protocol keeps view models free of UIKit and makes \"did we buzz on success?\" a plain array assertion instead of an untestable side effect. `prepare()` warms the Taptic Engine so the pulse lands on time. The same seam is where you disable haptics from a settings toggle.",
    rules: [
      { label: "Uses the notification generator", type: "mustContain", pattern: "UINotificationFeedbackGenerator\\(", regex: true },
      { label: "Uses the selection generator", type: "mustContain", pattern: "UISelectionFeedbackGenerator\\(", regex: true },
      { label: "Fires a success notification", type: "mustContain", pattern: "notificationOccurred\\(\\s*\\.success\\s*\\)", regex: true },
      { label: "Test double records every request", type: "mustContain", pattern: "played\\.append\\(", regex: true },
    ],
  },
  {
    id: "swift-deep-link-route-table",
    number: 27,
    language: "swift",
    kind: "build",
    title: "Deep Link Route Table",
    difficulty: "Hard",
    topic: "Navigation & Deep Links",
    statement: "Implement `RouteParser.parse`. Two URL forms map to the same `AppRoute`:\n\n| custom scheme | universal link |\n|---|---|\n| `nestly://home` | `https://nestly.example/home` |\n| `nestly://listing/42` | `https://nestly.example/listing/42` |\n| `nestly://u/ada` | `https://nestly.example/u/ada` |\n| `nestly://search?q=loft&page=2` | `https://nestly.example/search?q=loft&page=2` |\n\nRules: build a `URLComponents` from the URL; for the custom scheme remember the first segment arrives as the `host`; `https` is accepted only for `nestly.example`; any other scheme/host → `nil`. `home` with an empty path is also `.home`. `search` requires a non-empty `q` (read from `queryItems`); `page` defaults to **1** and must be ≥ 1, otherwise `nil`. Any other path shape → `nil`. Match scheme/host case-insensitively.",
    functionSignature: "static func parse(_ url: URL) -> AppRoute?",
    buggyCode: "import Foundation\n\nenum AppRoute: Equatable {\n    case home\n    case listing(id: String)\n    case search(term: String, page: Int)\n    case profile(handle: String)\n}\n\n/// Turns incoming URLs into routes. Two forms are accepted and must map identically:\n///   nestly://home                nestly://listing/42     nestly://u/ada     nestly://search?q=loft&page=2\n///   https://nestly.example/home  https://nestly.example/listing/42  ...\n/// Rules: any other scheme/host → nil; \"search\" needs a non-empty q, page defaults to 1 and must be ≥ 1;\n/// unknown or malformed paths → nil.\nenum RouteParser {\n    static let scheme = \"nestly\"\n    static let webHost = \"nestly.example\"\n\n    static func parse(_ url: URL) -> AppRoute? {\n        // TODO\n        return nil\n    }\n}\n",
    solution: "import Foundation\n\nenum AppRoute: Equatable {\n    case home\n    case listing(id: String)\n    case search(term: String, page: Int)\n    case profile(handle: String)\n}\n\n/// Turns incoming URLs into routes. Two forms are accepted and must map identically:\n///   nestly://home                nestly://listing/42     nestly://u/ada     nestly://search?q=loft&page=2\n///   https://nestly.example/home  https://nestly.example/listing/42  ...\n/// Rules: any other scheme/host → nil; \"search\" needs a non-empty q, page defaults to 1 and must be ≥ 1;\n/// unknown or malformed paths → nil.\nenum RouteParser {\n    static let scheme = \"nestly\"\n    static let webHost = \"nestly.example\"\n\n    static func parse(_ url: URL) -> AppRoute? {\n        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return nil }\n        var segments = components.path.split(separator: \"/\").map(String.init)\n\n        switch components.scheme?.lowercased() {\n        case scheme:\n            // In a custom scheme the first segment is parsed as the host: nestly://listing/42\n            if let host = components.host, !host.isEmpty { segments.insert(host, at: 0) }\n        case \"https\":\n            guard components.host?.lowercased() == webHost else { return nil }\n        default:\n            return nil\n        }\n\n        var query: [String: String] = [:]\n        for item in components.queryItems ?? [] where query[item.name] == nil {\n            query[item.name] = item.value ?? \"\"\n        }\n\n        let head = segments.first ?? \"\"\n        switch (head, segments.count) {\n        case (\"home\", 1), (\"\", 0):\n            return .home\n        case (\"listing\", 2):\n            return .listing(id: segments[1])\n        case (\"u\", 2):\n            return .profile(handle: segments[1])\n        case (\"search\", 1):\n            guard let term = query[\"q\"], !term.isEmpty else { return nil }\n            let page = query[\"page\"].flatMap(Int.init) ?? 1\n            return page >= 1 ? .search(term: term, page: page) : nil\n        default:\n            return nil\n        }\n    }\n}\n",
    hint: "Normalise both forms into a `[String]` of path segments first, then `switch` on `(segments.first, segments.count)`.",
    explanation: "Universal links and custom schemes differ only in where the first segment lives (`host` vs. path), so normalising to a segment list up front collapses two parsers into one and keeps the route table declarative. `URLComponents` handles percent-decoding and query parsing, which hand-rolled `split` code gets wrong on the first `%20`. Rejecting unknown hosts is a security requirement: a link to another domain must never drive in-app navigation.",
    rules: [
      { label: "Parses with URLComponents", type: "mustContain", pattern: "URLComponents\\(", regex: true },
      { label: "Reads the query through queryItems", type: "mustContain", pattern: "\\.queryItems", regex: true },
      { label: "Splits the path into segments", type: "mustContain", pattern: "\\.path\\s*\\.split\\(|pathComponents|\\.path\\s*\\.components\\(", regex: true },
      { label: "Validates page ≥ 1", type: "mustContain", pattern: "page\\s*>=\\s*1|page\\s*<\\s*1|page\\s*>\\s*0|page\\s*<=\\s*0", regex: true },
    ],
  },
  {
    id: "swift-typed-trip-navigator",
    number: 28,
    language: "swift",
    kind: "build",
    title: "Typed Trip Navigation Stack",
    difficulty: "Medium",
    topic: "Navigation & Deep Links",
    statement: "Wire up a typed `NavigationStack` for the Trips tab.\n\n`TripNavigator`: `show(_:)` appends to `path`; `pop()` removes the last element (no-op when empty); `popToRoot()` empties it; `open(_:)` replaces the whole path — this is how a deep link lands on `[.itinerary(id:), .stop(id:index:)]` in one go.\n\n`TripFlowView`: bind the stack with `NavigationStack(path: $navigator.path)` and register **one** `navigationDestination(for: TripDestination.self)` that switches over all three cases and returns a screen for each.",
    functionSignature: "final class TripNavigator: ObservableObject",
    buggyCode: "import SwiftUI\n\nenum TripDestination: Hashable {\n    case itinerary(id: String)\n    case stop(id: String, index: Int)\n    case receipt(id: String)\n}\n\n/// Owns the navigation stack for the Trips tab so that view models and deep links can push\n/// screens without touching views.\n@MainActor\nfinal class TripNavigator: ObservableObject {\n    @Published var path: [TripDestination] = []\n\n    func show(_ destination: TripDestination) { /* TODO */ }\n    func pop() { /* TODO */ }\n    func popToRoot() { /* TODO */ }\n    /// Replace the whole stack (used by deep links).\n    func open(_ route: [TripDestination]) { /* TODO */ }\n}\n\nstruct TripFlowView: View {\n    @StateObject private var navigator = TripNavigator()\n\n    var body: some View {\n        // TODO: drive the stack from navigator.path and map every destination to a screen\n        NavigationStack {\n            Text(\"Trips\")\n        }\n        .environmentObject(navigator)\n    }\n}\n",
    solution: "import SwiftUI\n\nenum TripDestination: Hashable {\n    case itinerary(id: String)\n    case stop(id: String, index: Int)\n    case receipt(id: String)\n}\n\n/// Owns the navigation stack for the Trips tab so that view models and deep links can push\n/// screens without touching views.\n@MainActor\nfinal class TripNavigator: ObservableObject {\n    @Published var path: [TripDestination] = []\n\n    func show(_ destination: TripDestination) { path.append(destination) }\n    func pop() { if !path.isEmpty { path.removeLast() } }\n    func popToRoot() { path.removeAll() }\n    /// Replace the whole stack (used by deep links).\n    func open(_ route: [TripDestination]) { path = route }\n}\n\nstruct TripFlowView: View {\n    @StateObject private var navigator = TripNavigator()\n\n    var body: some View {\n        NavigationStack(path: $navigator.path) {\n            Button(\"Open latest itinerary\") { navigator.show(.itinerary(id: \"latest\")) }\n                .navigationDestination(for: TripDestination.self) { destination in\n                    switch destination {\n                    case .itinerary(let id):\n                        Text(\"Itinerary \\(id)\")\n                    case .stop(let id, let index):\n                        Text(\"Stop \\(index) of itinerary \\(id)\")\n                    case .receipt(let id):\n                        Text(\"Receipt \\(id)\")\n                    }\n                }\n        }\n        .environmentObject(navigator)\n    }\n}\n",
    hint: "Because `path` is `[TripDestination]`, every mutation of the array is a navigation.",
    explanation: "Owning the path as an array of a `Hashable` enum makes navigation a pure data operation: view models push by appending, deep links assign a full route, and tests assert on `path` without rendering anything. A single `navigationDestination(for:)` keeps every destination-to-screen mapping in one place. `@MainActor` on the navigator is required because `path` drives UI.",
    rules: [
      { label: "Stack is driven by the navigator path", type: "mustContain", pattern: "NavigationStack\\(\\s*path:\\s*\\$navigator\\.path", regex: true },
      { label: "Registers one destination builder for TripDestination", type: "mustContain", pattern: "\\.navigationDestination\\(\\s*for:\\s*TripDestination\\.self", regex: true },
      { label: "show() pushes by appending", type: "mustContain", pattern: "path\\.append\\(", regex: true },
      { label: "popToRoot() empties the path", type: "mustContain", pattern: "path\\.removeAll\\(|path\\s*=\\s*\\[\\]", regex: true },
    ],
  },
  {
    id: "swift-scene-session-restore",
    number: 29,
    language: "swift",
    kind: "build",
    title: "Cold-Launch Session Restore",
    difficulty: "Hard",
    topic: "Navigation & Deep Links",
    statement: "iOS may evict the app while the user is three screens deep with a half-written note. Make `SessionSnapshot` restorable through `@SceneStorage`:\n\n1. `@SceneStorage` only stores `RawRepresentable` values with a `String` raw value, so add `extension SessionSnapshot: RawRepresentable` whose `rawValue` is the JSON produced by `JSONEncoder` and whose `init?(rawValue:)` decodes it with `JSONDecoder` (return `nil` on failure).\n2. Write `SessionSnapshot`'s `Codable` conformance **by hand** (`CodingKeys`, `init(from:)`, `encode(to:)`), because the stdlib's default `Codable` for `RawRepresentable` types encodes via `rawValue` — which would call `JSONEncoder`, which calls `encode(to:)`, forever. Missing keys must fall back to the defaults so an older snapshot still restores.\n3. In `RootView`, replace the `@State` with `@SceneStorage(\"session\") private var session: SessionSnapshot = .empty`.",
    functionSignature: "extension SessionSnapshot: RawRepresentable",
    buggyCode: "import SwiftUI\n\nenum RestorableDestination: Hashable, Codable {\n    case itinerary(id: String)\n    case receipt(id: String)\n}\n\n/// Everything needed to put the user back where they were after iOS evicted the app.\nstruct SessionSnapshot: Codable, Equatable {\n    var selectedTab: String = \"trips\"\n    var path: [RestorableDestination] = []\n    var draftNote: String = \"\"\n\n    static let empty = SessionSnapshot()\n}\n\n// TODO: make SessionSnapshot usable with @SceneStorage (String rawValue round-trip via JSON),\n// implement its Codable conformance by hand so the two conformances don't feed each other,\n// then persist tab, stack path and draft note in RootView.\n\nstruct RootView: View {\n    @State private var session = SessionSnapshot.empty\n\n    var body: some View {\n        TabView(selection: $session.selectedTab) {\n            NavigationStack(path: $session.path) {\n                TextField(\"Draft note\", text: $session.draftNote)\n                    .navigationDestination(for: RestorableDestination.self) { destination in\n                        Text(String(describing: destination))\n                    }\n            }\n            .tabItem { Text(\"Trips\") }\n            .tag(\"trips\")\n        }\n    }\n}\n",
    solution: "import SwiftUI\n\nenum RestorableDestination: Hashable, Codable {\n    case itinerary(id: String)\n    case receipt(id: String)\n}\n\n/// Everything needed to put the user back where they were after iOS evicted the app.\nstruct SessionSnapshot: Codable, Equatable {\n    var selectedTab: String = \"trips\"\n    var path: [RestorableDestination] = []\n    var draftNote: String = \"\"\n\n    static let empty = SessionSnapshot()\n\n    init() {}\n\n    // Hand-written Codable: with a String RawRepresentable conformance in play, the stdlib would\n    // otherwise route encode(to:) through rawValue → JSONEncoder → encode(to:) … forever.\n    private enum CodingKeys: String, CodingKey { case selectedTab, path, draftNote }\n\n    init(from decoder: Decoder) throws {\n        let c = try decoder.container(keyedBy: CodingKeys.self)\n        selectedTab = try c.decodeIfPresent(String.self, forKey: .selectedTab) ?? \"trips\"\n        path = try c.decodeIfPresent([RestorableDestination].self, forKey: .path) ?? []\n        draftNote = try c.decodeIfPresent(String.self, forKey: .draftNote) ?? \"\"\n    }\n\n    func encode(to encoder: Encoder) throws {\n        var c = encoder.container(keyedBy: CodingKeys.self)\n        try c.encode(selectedTab, forKey: .selectedTab)\n        try c.encode(path, forKey: .path)\n        try c.encode(draftNote, forKey: .draftNote)\n    }\n}\n\nextension SessionSnapshot: RawRepresentable {\n    init?(rawValue: String) {\n        guard let data = rawValue.data(using: .utf8),\n              let value = try? JSONDecoder().decode(SessionSnapshot.self, from: data) else { return nil }\n        self = value\n    }\n\n    var rawValue: String {\n        guard let data = try? JSONEncoder().encode(self) else { return \"{}\" }\n        return String(decoding: data, as: UTF8.self)\n    }\n}\n\nstruct RootView: View {\n    @SceneStorage(\"session\") private var session: SessionSnapshot = .empty\n\n    var body: some View {\n        TabView(selection: $session.selectedTab) {\n            NavigationStack(path: $session.path) {\n                TextField(\"Draft note\", text: $session.draftNote)\n                    .navigationDestination(for: RestorableDestination.self) { destination in\n                        Text(String(describing: destination))\n                    }\n            }\n            .tabItem { Text(\"Trips\") }\n            .tag(\"trips\")\n        }\n    }\n}\n",
    hint: "The trap is not the JSON round-trip, it is the recursion: implement `encode(to:)` explicitly.",
    explanation: "Scene storage survives app termination but only accepts small property-list-friendly values, so a JSON string is the idiomatic way to stash a whole navigation state. Adding `RawRepresentable` on top of a synthesized `Codable` is a well-known infinite-recursion trap; an explicit `encode(to:)`/`init(from:)` sidesteps it and lets you tolerate missing keys from older builds. Restoring the path into `NavigationStack(path:)` puts the user back exactly where they were.",
    rules: [
      { label: "Snapshot is RawRepresentable for @SceneStorage", type: "mustContain", pattern: "RawRepresentable", regex: true },
      { label: "Persists through @SceneStorage", type: "mustContain", pattern: "@SceneStorage\\(", regex: true },
      { label: "Round-trips through JSON", type: "mustContain", pattern: "JSONEncoder\\(\\)[\\s\\S]*JSONDecoder\\(\\)|JSONDecoder\\(\\)[\\s\\S]*JSONEncoder\\(\\)", regex: true },
      { label: "Codable is implemented explicitly (avoids the rawValue recursion)", type: "mustContain", pattern: "func\\s+encode\\(\\s*to\\s+\\w+:\\s*Encoder\\s*\\)", regex: true },
    ],
  },
  {
    id: "swift-checkout-flow-coordinator",
    number: 30,
    language: "swift",
    kind: "build",
    title: "Checkout Flow Coordinator",
    difficulty: "Hard",
    topic: "Testing & Architecture",
    statement: "Implement the coordinator pair.\n\n`CheckoutCoordinator.start()` remembers the screen it started from, builds the cart with `factory.makeCart`, and pushes it. Cart `onContinue` → push the address screen; address `onContinue` → push payment; payment `onPaid(orderId)` → finish with `.placed(orderId:)`; cart `onCancel` → finish with `.abandoned`. Finishing pops back to the origin screen (fall back to `popToRootViewController` if it is gone) and then calls `onFinished`. Every callback captures `self` **weakly** — the factory's screens outlive the coordinator in the nav stack.\n\n`AppCoordinator.startCheckout()` creates a child, appends it to `childCoordinators`, sets `onFinished` to remove **that** child by identity (`===`) without retaining it, and calls `start()`.",
    functionSignature: "final class CheckoutCoordinator: Coordinator",
    buggyCode: "import UIKit\n\nenum CheckoutOutcome: Equatable {\n    case placed(orderId: String)\n    case abandoned\n}\n\nprotocol Coordinator: AnyObject {\n    var childCoordinators: [Coordinator] { get set }\n    func start()\n}\n\n/// Builds the screens; injected so the flow can be exercised with stub view controllers.\nprotocol CheckoutScreenFactory {\n    func makeCart(onContinue: @escaping () -> Void, onCancel: @escaping () -> Void) -> UIViewController\n    func makeAddress(onContinue: @escaping () -> Void) -> UIViewController\n    func makePayment(onPaid: @escaping (_ orderId: String) -> Void) -> UIViewController\n}\n\n/// Cart → Address → Payment. When the flow ends (paid or cancelled) it pops back to the screen\n/// it started from and reports the outcome to its parent.\nfinal class CheckoutCoordinator: Coordinator {\n    var childCoordinators: [Coordinator] = []\n    var onFinished: ((CheckoutOutcome) -> Void)?\n\n    private let navigationController: UINavigationController\n    private let factory: CheckoutScreenFactory\n\n    init(navigationController: UINavigationController, factory: CheckoutScreenFactory) {\n        self.navigationController = navigationController\n        self.factory = factory\n    }\n\n    func start() {\n        // TODO\n    }\n}\n\nfinal class AppCoordinator: Coordinator {\n    var childCoordinators: [Coordinator] = []\n    private let navigationController: UINavigationController\n    private let factory: CheckoutScreenFactory\n\n    init(navigationController: UINavigationController, factory: CheckoutScreenFactory) {\n        self.navigationController = navigationController\n        self.factory = factory\n    }\n\n    func start() {}\n\n    /// Kick off checkout as a child; forget the child once it reports back (no retain cycle).\n    func startCheckout() {\n        // TODO\n    }\n}\n",
    solution: "import UIKit\n\nenum CheckoutOutcome: Equatable {\n    case placed(orderId: String)\n    case abandoned\n}\n\nprotocol Coordinator: AnyObject {\n    var childCoordinators: [Coordinator] { get set }\n    func start()\n}\n\n/// Builds the screens; injected so the flow can be exercised with stub view controllers.\nprotocol CheckoutScreenFactory {\n    func makeCart(onContinue: @escaping () -> Void, onCancel: @escaping () -> Void) -> UIViewController\n    func makeAddress(onContinue: @escaping () -> Void) -> UIViewController\n    func makePayment(onPaid: @escaping (_ orderId: String) -> Void) -> UIViewController\n}\n\n/// Cart → Address → Payment. When the flow ends (paid or cancelled) it pops back to the screen\n/// it started from and reports the outcome to its parent.\nfinal class CheckoutCoordinator: Coordinator {\n    var childCoordinators: [Coordinator] = []\n    var onFinished: ((CheckoutOutcome) -> Void)?\n\n    private let navigationController: UINavigationController\n    private let factory: CheckoutScreenFactory\n    private weak var origin: UIViewController?\n\n    init(navigationController: UINavigationController, factory: CheckoutScreenFactory) {\n        self.navigationController = navigationController\n        self.factory = factory\n    }\n\n    func start() {\n        origin = navigationController.topViewController\n        let cart = factory.makeCart(\n            onContinue: { [weak self] in self?.showAddress() },\n            onCancel: { [weak self] in self?.finish(.abandoned) }\n        )\n        navigationController.pushViewController(cart, animated: true)\n    }\n\n    private func showAddress() {\n        let address = factory.makeAddress(onContinue: { [weak self] in self?.showPayment() })\n        navigationController.pushViewController(address, animated: true)\n    }\n\n    private func showPayment() {\n        let payment = factory.makePayment(onPaid: { [weak self] orderId in\n            self?.finish(.placed(orderId: orderId))\n        })\n        navigationController.pushViewController(payment, animated: true)\n    }\n\n    private func finish(_ outcome: CheckoutOutcome) {\n        if let origin, navigationController.viewControllers.contains(origin) {\n            navigationController.popToViewController(origin, animated: true)\n        } else {\n            navigationController.popToRootViewController(animated: true)\n        }\n        onFinished?(outcome)\n    }\n}\n\nfinal class AppCoordinator: Coordinator {\n    var childCoordinators: [Coordinator] = []\n    private let navigationController: UINavigationController\n    private let factory: CheckoutScreenFactory\n\n    init(navigationController: UINavigationController, factory: CheckoutScreenFactory) {\n        self.navigationController = navigationController\n        self.factory = factory\n    }\n\n    func start() {}\n\n    /// Kick off checkout as a child; forget the child once it reports back (no retain cycle).\n    func startCheckout() {\n        let checkout = CheckoutCoordinator(navigationController: navigationController, factory: factory)\n        checkout.onFinished = { [weak self, weak checkout] _ in\n            guard let self, let checkout else { return }\n            self.childCoordinators.removeAll { $0 === checkout }\n        }\n        childCoordinators.append(checkout)\n        checkout.start()\n    }\n}\n",
    hint: "Screens hold their callbacks strongly and the nav stack holds the screens, so `[weak self]` in every closure is what lets the coordinator deallocate.",
    explanation: "Coordinators pull navigation logic out of view controllers so screens stay dumb and reusable, and the injected factory means the whole checkout flow can be driven in a unit test with stub controllers. The parent must keep the child alive in `childCoordinators` (nothing else retains it) and must forget it on completion, otherwise every checkout leaks a coordinator. Weak captures in the screen callbacks break the screen → closure → coordinator → screen cycle.",
    rules: [
      { label: "Callbacks capture self weakly", type: "mustContain", pattern: "\\[\\s*weak\\s+self\\b", regex: true },
      { label: "Parent retains the child while it runs", type: "mustContain", pattern: "childCoordinators\\.append\\(", regex: true },
      { label: "Parent forgets the child when it finishes", type: "mustContain", pattern: "childCoordinators\\.removeAll|childCoordinators\\.remove\\(|firstIndex\\(where:", regex: true },
      { label: "Screens are pushed on the navigation controller", type: "mustContain", pattern: "\\.pushViewController\\(", regex: true },
    ],
  },
  {
    id: "swift-retry-after-catch",
    number: 11,
    language: "swift",
    kind: "debug",
    title: "Weather Tile Never Retries",
    difficulty: "Medium",
    topic: "Combine & Reactive",
    statement: "`ForecastTileModel.tile(for:)` is meant to try the network up to **three** times (one attempt plus two retries) and only then fall back to the cached tile. In production a single transient failure immediately shows the cached tile and the retries never happen. Nothing is wrong with `ForecastClient`. Fix the pipeline.",
    functionSignature: "func tile(for city: String) -> AnyPublisher<ForecastTile, Never>",
    buggyCode: "import Combine\nimport Foundation\n\nstruct ForecastTile: Equatable {\n    let city: String\n    let tempC: Double\n}\n\nprotocol ForecastClient {\n    func forecast(for city: String) -> AnyPublisher<ForecastTile, Error>\n}\n\n/// Home-screen weather tile: try the network up to 3 times total, then fall back to the last cached tile.\nfinal class ForecastTileModel {\n    private let client: ForecastClient\n    private let cached: ForecastTile\n\n    init(client: ForecastClient, cached: ForecastTile) {\n        self.client = client\n        self.cached = cached\n    }\n\n    func tile(for city: String) -> AnyPublisher<ForecastTile, Never> {\n        let fallback = cached\n        return client.forecast(for: city)\n            .catch { _ in Just(fallback) }\n            .retry(2)\n            .eraseToAnyPublisher()\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\nstruct ForecastTile: Equatable {\n    let city: String\n    let tempC: Double\n}\n\nprotocol ForecastClient {\n    func forecast(for city: String) -> AnyPublisher<ForecastTile, Error>\n}\n\n/// Home-screen weather tile: try the network up to 3 times total, then fall back to the last cached tile.\nfinal class ForecastTileModel {\n    private let client: ForecastClient\n    private let cached: ForecastTile\n\n    init(client: ForecastClient, cached: ForecastTile) {\n        self.client = client\n        self.cached = cached\n    }\n\n    func tile(for city: String) -> AnyPublisher<ForecastTile, Never> {\n        let fallback = cached\n        return client.forecast(for: city)\n            .retry(2)\n            .catch { _ in Just(fallback) }\n            .eraseToAnyPublisher()\n    }\n}\n",
    hint: "Look at the order of the operators. What does `retry` see when the upstream has already been replaced?",
    explanation: "`catch` swaps the failing upstream for `Just(fallback)`, which completes successfully — so by the time `retry(2)` sees the stream there is no error left to retry. Operators compose top-down: `retry` must sit on the failing publisher and `catch` after it. Combine pipelines read like a middleware stack, and ordering bugs like this pass compilation silently.",
    rules: [
      { label: "retry runs before catch", type: "mustContain", pattern: "\\.retry\\(\\s*2\\s*\\)[\\s\\S]*?\\.catch\\s*\\{", regex: true },
      { label: "catch no longer precedes retry", type: "mustNotContain", pattern: "\\.catch\\s*\\{[\\s\\S]*?\\.retry\\(", regex: true },
      { label: "Falls back to the cached tile", type: "mustContain", pattern: "Just\\(\\s*(fallback|cached|self\\.cached)\\s*\\)", regex: true },
    ],
  },
  {
    id: "swift-ticker-cancellable-dropped",
    number: 12,
    language: "swift",
    kind: "debug",
    title: "Timer That Never Ticks",
    difficulty: "Easy",
    topic: "Combine & Reactive",
    statement: "`WorkoutTimerModel` subscribes to a once-per-second `ticker` and mirrors it into `elapsedSeconds`. On device the label stays at `0` forever, even though the ticker is verified to emit. Fix the model so the subscription lives as long as the model does.",
    functionSignature: "init(ticker: AnyPublisher<Int, Never>)",
    buggyCode: "import Combine\nimport Foundation\n\n/// Shows elapsed seconds during a live workout. `ticker` emits the elapsed count once per second.\nfinal class WorkoutTimerModel: ObservableObject {\n    @Published private(set) var elapsedSeconds = 0\n\n    init(ticker: AnyPublisher<Int, Never>) {\n        _ = ticker\n            .receive(on: DispatchQueue.main)\n            .sink { [weak self] seconds in\n                self?.elapsedSeconds = seconds\n            }\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\n/// Shows elapsed seconds during a live workout. `ticker` emits the elapsed count once per second.\nfinal class WorkoutTimerModel: ObservableObject {\n    @Published private(set) var elapsedSeconds = 0\n    private var cancellables = Set<AnyCancellable>()\n\n    init(ticker: AnyPublisher<Int, Never>) {\n        ticker\n            .receive(on: DispatchQueue.main)\n            .sink { [weak self] seconds in\n                self?.elapsedSeconds = seconds\n            }\n            .store(in: &cancellables)\n    }\n}\n",
    hint: "What happens to an `AnyCancellable` that nobody holds on to?",
    explanation: "`sink` returns an `AnyCancellable`, and Combine cancels the subscription the moment that token is deallocated — discarding it with `_ =` cancels the pipeline before the first tick. Store it in a `Set<AnyCancellable>` via `.store(in:)` (or a dedicated property) so its lifetime matches the model, and it is cancelled automatically when the model deinits.",
    rules: [
      { label: "Keeps the cancellable alive", type: "mustContain", pattern: "\\.store\\(\\s*in:\\s*&|:\\s*AnyCancellable\\?|\\w+\\s*=\\s*ticker[\\s\\S]*?\\.sink", regex: true },
      { label: "Declares storage for the subscription", type: "mustContain", pattern: "Set<AnyCancellable>|AnyCancellable\\?|\\[AnyCancellable\\]", regex: true },
      { label: "No longer discards the sink result", type: "mustNotContain", pattern: "_\\s*=\\s*ticker", regex: true },
    ],
  },
  {
    id: "swift-token-vault-bypasses-store",
    number: 13,
    language: "swift",
    kind: "debug",
    title: "Session Vault Ignores Its Store",
    difficulty: "Easy",
    topic: "Persistence",
    statement: "`SessionTokenVault` is constructed with a `SecretStore` so that unit tests can pass `InMemorySecretStore` and never touch the keychain. The tests are failing: after `vault.save(token:)`, the in-memory store is still empty, and CI (with no keychain access) crashes. Fix the vault. Do not change the protocol or the stores.",
    functionSignature: "final class SessionTokenVault",
    buggyCode: "import Foundation\n\nprotocol SecretStore {\n    func set(_ value: String, forKey key: String)\n    func get(_ key: String) -> String?\n    func remove(_ key: String)\n}\n\n/// Production store — wraps the keychain (SecItem* calls elided; the dictionary stands in for them).\nfinal class KeychainSecretStore: SecretStore {\n    static let shared = KeychainSecretStore()\n    private var items: [String: String] = [:]\n\n    func set(_ value: String, forKey key: String) { items[key] = value }\n    func get(_ key: String) -> String? { items[key] }\n    func remove(_ key: String) { items[key] = nil }\n}\n\n/// Test double.\nfinal class InMemorySecretStore: SecretStore {\n    private var items: [String: String] = [:]\n    func set(_ value: String, forKey key: String) { items[key] = value }\n    func get(_ key: String) -> String? { items[key] }\n    func remove(_ key: String) { items[key] = nil }\n}\n\n/// Owns the session token. Takes a SecretStore so unit tests never touch the real keychain.\nfinal class SessionTokenVault {\n    private let store: SecretStore\n    private let key = \"session.token\"\n\n    init(store: SecretStore) {\n        self.store = store\n    }\n\n    func save(token: String) {\n        KeychainSecretStore.shared.set(token, forKey: key)\n    }\n\n    var token: String? {\n        KeychainSecretStore.shared.get(key)\n    }\n\n    func clear() {\n        KeychainSecretStore.shared.remove(key)\n    }\n}\n",
    solution: "import Foundation\n\nprotocol SecretStore {\n    func set(_ value: String, forKey key: String)\n    func get(_ key: String) -> String?\n    func remove(_ key: String)\n}\n\n/// Production store — wraps the keychain (SecItem* calls elided; the dictionary stands in for them).\nfinal class KeychainSecretStore: SecretStore {\n    static let shared = KeychainSecretStore()\n    private var items: [String: String] = [:]\n\n    func set(_ value: String, forKey key: String) { items[key] = value }\n    func get(_ key: String) -> String? { items[key] }\n    func remove(_ key: String) { items[key] = nil }\n}\n\n/// Test double.\nfinal class InMemorySecretStore: SecretStore {\n    private var items: [String: String] = [:]\n    func set(_ value: String, forKey key: String) { items[key] = value }\n    func get(_ key: String) -> String? { items[key] }\n    func remove(_ key: String) { items[key] = nil }\n}\n\n/// Owns the session token. Takes a SecretStore so unit tests never touch the real keychain.\nfinal class SessionTokenVault {\n    private let store: SecretStore\n    private let key = \"session.token\"\n\n    init(store: SecretStore) {\n        self.store = store\n    }\n\n    func save(token: String) {\n        store.set(token, forKey: key)\n    }\n\n    var token: String? {\n        store.get(key)\n    }\n\n    func clear() {\n        store.remove(key)\n    }\n}\n",
    hint: "Compare what the initializer stores with what the methods actually call.",
    explanation: "The vault accepts a store but then talks to the `KeychainSecretStore.shared` singleton directly, silently bypassing the injected dependency — so tests hit the real keychain and production could never swap in another backend. Every access must go through `store`. Reaching for a `.shared` singleton inside a type that already has the dependency injected is one of the most common DI regressions in code review.",
    rules: [
      { label: "Saves through the injected store", type: "mustContain", pattern: "\\bstore\\.set\\(\\s*token", regex: true },
      { label: "Reads through the injected store", type: "mustContain", pattern: "\\bstore\\.get\\(\\s*(self\\.)?key\\s*\\)", regex: true },
      { label: "No longer reaches for the keychain singleton", type: "mustNotContain", pattern: "KeychainSecretStore\\.shared\\.(set|get|remove)\\(", regex: true },
    ],
  },
  {
    id: "swift-recipe-tag-index-stale",
    number: 14,
    language: "swift",
    kind: "debug",
    title: "Tag Index Goes Stale",
    difficulty: "Medium",
    topic: "Persistence",
    statement: "`RecipeIndex` keeps a by-id map and a tag → ids index for fast filtering. Bug report: a recipe that was tagged `vegan`, then edited to remove that tag and saved again via `upsert`, still shows up in `recipes(tagged: \"vegan\")`. `remove(id:)` works. Fix `upsert` so the tag index always reflects the recipe's current tags.",
    functionSignature: "func upsert(_ recipe: Recipe)",
    buggyCode: "import Foundation\n\nstruct Recipe: Identifiable, Equatable {\n    let id: UUID\n    var title: String\n    var tags: Set<String>\n}\n\n/// In-memory index over the recipes persisted on disk: O(1) lookup by id and by tag.\nfinal class RecipeIndex {\n    private(set) var byId: [UUID: Recipe] = [:]\n    private var byTag: [String: Set<UUID>] = [:]\n\n    /// Insert or replace a recipe. The tag index must reflect the recipe's CURRENT tags only.\n    func upsert(_ recipe: Recipe) {\n        byId[recipe.id] = recipe\n        for tag in recipe.tags {\n            byTag[tag.lowercased(), default: []].insert(recipe.id)\n        }\n    }\n\n    func remove(id: UUID) {\n        guard let old = byId.removeValue(forKey: id) else { return }\n        for tag in old.tags {\n            byTag[tag.lowercased()]?.remove(id)\n        }\n    }\n\n    func recipes(tagged tag: String) -> [Recipe] {\n        (byTag[tag.lowercased()] ?? [])\n            .compactMap { byId[$0] }\n            .sorted { $0.title < $1.title }\n    }\n}\n",
    solution: "import Foundation\n\nstruct Recipe: Identifiable, Equatable {\n    let id: UUID\n    var title: String\n    var tags: Set<String>\n}\n\n/// In-memory index over the recipes persisted on disk: O(1) lookup by id and by tag.\nfinal class RecipeIndex {\n    private(set) var byId: [UUID: Recipe] = [:]\n    private var byTag: [String: Set<UUID>] = [:]\n\n    /// Insert or replace a recipe. The tag index must reflect the recipe's CURRENT tags only.\n    func upsert(_ recipe: Recipe) {\n        if let old = byId[recipe.id] {\n            for tag in old.tags {\n                byTag[tag.lowercased()]?.remove(recipe.id)\n            }\n        }\n        byId[recipe.id] = recipe\n        for tag in recipe.tags {\n            byTag[tag.lowercased(), default: []].insert(recipe.id)\n        }\n    }\n\n    func remove(id: UUID) {\n        guard let old = byId.removeValue(forKey: id) else { return }\n        for tag in old.tags {\n            byTag[tag.lowercased()]?.remove(id)\n        }\n    }\n\n    func recipes(tagged tag: String) -> [Recipe] {\n        (byTag[tag.lowercased()] ?? [])\n            .compactMap { byId[$0] }\n            .sorted { $0.title < $1.title }\n    }\n}\n",
    hint: "Upserting an existing id replaces the recipe but leaves behind index entries for tags it no longer has.",
    explanation: "A secondary index has to be maintained on *every* write path, not just insert and delete: replacing a record means unlinking the old tags before linking the new ones (or the equivalent `remove` then insert). Forgetting the unlink is how denormalised caches drift from the source of truth and show ghost results. The same discipline applies to Core Data derived attributes and search indexes.",
    rules: [
      { label: "upsert unlinks the previous tags", type: "mustContain", pattern: "func upsert\\((?:(?!func\\s)[\\s\\S])*?(byId\\[recipe\\.id\\]\\s*(\\{|,|else)|if\\s+let\\s+\\w+\\s*=\\s*byId\\[recipe\\.id\\]|guard\\s+let\\s+\\w+\\s*=\\s*byId\\[recipe\\.id\\]|updateValue\\(|remove\\(\\s*id:\\s*recipe\\.id\\s*\\)|removeValue\\(\\s*forKey:\\s*recipe\\.id\\s*\\)|byTag\\s*=\\s*\\[:\\]|byTag\\.removeAll)", regex: true },
      { label: "upsert removes the id from stale tag sets", type: "mustContain", pattern: "func upsert\\((?:(?!func\\s)[\\s\\S])*?(\\.remove\\(|removeValue\\(|subtract|byTag\\s*=\\s*\\[:\\]|byTag\\.removeAll)", regex: true },
      { label: "Still stores the new recipe", type: "mustContain", pattern: "byId\\[recipe\\.id\\]\\s*=\\s*recipe|updateValue\\(\\s*recipe", regex: true },
    ],
  },
  {
    id: "swift-stat-row-dynamic-type",
    number: 15,
    language: "swift",
    kind: "debug",
    title: "Stat Row Clips at Large Text",
    difficulty: "Medium",
    topic: "Accessibility & UX",
    statement: "QA filed a screenshot from a user with **Accessibility Extra Large** text: `StatRow` shows \"Active energ…\" truncated and the value overlaps the label. Make the row Dynamic Type friendly:\n\n- use text styles (`.body`, `.headline`, …) instead of fixed point sizes so the fonts scale;\n- drop the hard-coded `frame(height: 44)` so the row grows with its content;\n- when `dynamicTypeSize.isAccessibilitySize` is true, stack label and value vertically (`AnyLayout`/`ViewThatFits`) instead of side by side;\n- scale the icon with `@ScaledMetric`.",
    functionSignature: "struct StatRow: View",
    buggyCode: "import SwiftUI\n\n/// One row of the workout summary: icon, label, value.\nstruct StatRow: View {\n    let symbol: String\n    let label: String\n    let value: String\n\n    var body: some View {\n        HStack(spacing: 12) {\n            Image(systemName: symbol)\n                .font(.system(size: 20))\n            Text(label)\n                .font(.system(size: 17))\n                .lineLimit(1)\n            Spacer()\n            Text(value)\n                .font(.system(size: 17, weight: .semibold))\n                .lineLimit(1)\n        }\n        .frame(height: 44)\n        .padding(.horizontal, 16)\n    }\n}\n",
    solution: "import SwiftUI\n\n/// One row of the workout summary: icon, label, value.\nstruct StatRow: View {\n    let symbol: String\n    let label: String\n    let value: String\n\n    @Environment(\\.dynamicTypeSize) private var typeSize\n    @ScaledMetric(relativeTo: .body) private var iconSize: CGFloat = 20\n\n    var body: some View {\n        // Side by side normally; stacked once the user picks an accessibility text size.\n        let layout = typeSize.isAccessibilitySize\n            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 4))\n            : AnyLayout(HStackLayout(spacing: 12))\n\n        layout {\n            Image(systemName: symbol)\n                .frame(width: iconSize, height: iconSize)\n            Text(label)\n                .font(.body)\n            if !typeSize.isAccessibilitySize { Spacer() }\n            Text(value)\n                .font(.headline)\n        }\n        .padding(.horizontal, 16)\n        .padding(.vertical, 8)\n    }\n}\n",
    hint: "`@Environment(\\.dynamicTypeSize)` tells you when to switch layouts; `AnyLayout` lets you switch without duplicating the children.",
    explanation: "Fixed point sizes ignore the user's text setting entirely, and a fixed row height then clips whatever does scale — both are top App Store accessibility rejections. Text styles scale automatically, `@ScaledMetric` scales non-text dimensions in step, and swapping `HStackLayout` for `VStackLayout` at accessibility sizes gives the larger text room instead of truncating it.",
    rules: [
      { label: "No fixed point sizes", type: "mustNotContain", pattern: "\\.font\\(\\s*\\.system\\(\\s*size:\\s*\\d", regex: true },
      { label: "No hard-coded row height", type: "mustNotContain", pattern: "\\.frame\\(\\s*height:\\s*44\\s*\\)", regex: true },
      { label: "Uses scalable text styles", type: "mustContain", pattern: "\\.font\\(\\s*\\.(body|headline|subheadline|callout|footnote|caption2?|title[23]?|largeTitle)\\s*\\)|\\.font\\(\\s*\\.system\\(\\s*\\.(body|headline|subheadline|callout|footnote|caption2?|title[23]?|largeTitle)", regex: true },
      { label: "Adapts layout to the type size", type: "mustContain", pattern: "dynamicTypeSize|ViewThatFits|AnyLayout|sizeCategory", regex: true },
    ],
  },
  {
    id: "swift-celebration-ignores-reduce-motion",
    number: 16,
    language: "swift",
    kind: "debug",
    title: "Celebration Ignores Reduce Motion",
    difficulty: "Easy",
    topic: "Accessibility & UX",
    statement: "`GoalReachedBanner` bounces and wobbles a star forever when the daily goal is hit. A user with **Reduce Motion** enabled reported it makes them nauseous — the setting is being ignored. Fix the view: read `accessibilityReduceMotion` from the environment and, when it is on, replace the scale/rotation bounce with a gentle opacity pulse (still animated, no motion).",
    functionSignature: "struct GoalReachedBanner: View",
    buggyCode: "import SwiftUI\n\n/// Bounces a star when the daily step goal is hit.\nstruct GoalReachedBanner: View {\n    @State private var celebrate = false\n\n    var body: some View {\n        Image(systemName: \"star.fill\")\n            .font(.largeTitle)\n            .scaleEffect(celebrate ? 1.4 : 1.0)\n            .rotationEffect(.degrees(celebrate ? 20 : -20))\n            .animation(.spring(response: 0.4, dampingFraction: 0.5).repeatForever(autoreverses: true), value: celebrate)\n            .onAppear { celebrate = true }\n    }\n}\n",
    solution: "import SwiftUI\n\n/// Bounces a star when the daily step goal is hit.\nstruct GoalReachedBanner: View {\n    @State private var celebrate = false\n    @Environment(\\.accessibilityReduceMotion) private var reduceMotion\n\n    var body: some View {\n        Image(systemName: \"star.fill\")\n            .font(.largeTitle)\n            .scaleEffect(reduceMotion ? 1.0 : (celebrate ? 1.4 : 1.0))\n            .rotationEffect(.degrees(reduceMotion ? 0 : (celebrate ? 20 : -20)))\n            // With Reduce Motion on, celebrate with a gentle fade instead of bouncing.\n            .opacity(reduceMotion ? (celebrate ? 1.0 : 0.5) : 1.0)\n            .animation(\n                reduceMotion\n                    ? .easeInOut(duration: 0.8).repeatForever(autoreverses: true)\n                    : .spring(response: 0.4, dampingFraction: 0.5).repeatForever(autoreverses: true),\n                value: celebrate\n            )\n            .onAppear { celebrate = true }\n    }\n}\n",
    hint: "`@Environment(\\.accessibilityReduceMotion) private var reduceMotion`, then branch every motion effect on it.",
    explanation: "Reduce Motion is a system-wide promise that the UI will not translate, scale or spin large elements; SwiftUI exposes it as an environment value and expects each custom animation to honour it. Cross-fades and opacity changes are the sanctioned substitute, so the celebration still reads as a celebration. Apple reviews and enterprise accessibility audits both check this.",
    rules: [
      { label: "Reads the Reduce Motion setting", type: "mustContain", pattern: "accessibilityReduceMotion", regex: true },
      { label: "Branches the effect on the setting", type: "mustContain", pattern: "reduceMotion\\s*\\?|if\\s+reduceMotion|!reduceMotion|reduceMotion\\s*==|reduceMotion\\s*\\{", regex: true },
      { label: "Still animates when motion is allowed", type: "mustContain", pattern: "\\.animation\\(|withAnimation", regex: true },
    ],
  },
  {
    id: "swift-implicit-animation-spillover",
    number: 17,
    language: "swift",
    kind: "debug",
    title: "Toggle Animates the Whole Screen",
    difficulty: "Easy",
    topic: "Animation & Gestures",
    statement: "Expanding `OrderDetailsCard` looks fine, but every time the receipt screen refreshes its `lines`, the whole card slides and cross-fades even though nothing was tapped, and the keyboard avoidance below it now animates in slow motion. Fix the animation so **only** the expand/collapse triggered by `isExpanded` animates.",
    functionSignature: "struct OrderDetailsCard: View",
    buggyCode: "import SwiftUI\n\n/// Collapsible \"order details\" card on the receipt screen.\nstruct OrderDetailsCard: View {\n    let lines: [String]\n    @State private var isExpanded = false\n\n    var body: some View {\n        VStack(alignment: .leading, spacing: 8) {\n            Button(isExpanded ? \"Hide details\" : \"Show details\") {\n                isExpanded.toggle()\n            }\n            if isExpanded {\n                ForEach(lines, id: \\.self) { line in\n                    Text(line)\n                }\n            }\n        }\n        .animation(.easeInOut(duration: 0.25))\n    }\n}\n",
    solution: "import SwiftUI\n\n/// Collapsible \"order details\" card on the receipt screen.\nstruct OrderDetailsCard: View {\n    let lines: [String]\n    @State private var isExpanded = false\n\n    var body: some View {\n        VStack(alignment: .leading, spacing: 8) {\n            Button(isExpanded ? \"Hide details\" : \"Show details\") {\n                isExpanded.toggle()\n            }\n            if isExpanded {\n                ForEach(lines, id: \\.self) { line in\n                    Text(line)\n                }\n            }\n        }\n        .animation(.easeInOut(duration: 0.25), value: isExpanded)\n    }\n}\n",
    hint: "The `.animation` modifier form you are using was deprecated for exactly this reason — it needs a `value:`.",
    explanation: "The bare `.animation(_:)` modifier animates *any* change to the view subtree, including data updates and parent-driven layout changes — which is why unrelated refreshes started animating. `.animation(_, value: isExpanded)` scopes the implicit animation to changes of that one value (or use `withAnimation` at the call site). Unscoped animations are a classic source of janky, hard-to-reproduce SwiftUI bugs.",
    rules: [
      { label: "Animation is scoped to isExpanded", type: "mustContain", pattern: "\\.animation\\([^\\n]*,\\s*value:\\s*isExpanded\\s*\\)|withAnimation", regex: true },
      { label: "No unscoped implicit animation", type: "mustNotContain", pattern: "\\.animation\\(\\s*\\.\\w+(\\([^()]*\\))?\\s*\\)", regex: true },
    ],
  },
  {
    id: "swift-universal-link-safari-bounce",
    number: 18,
    language: "swift",
    kind: "debug",
    title: "Universal Link Bounce Loop",
    difficulty: "Medium",
    topic: "Navigation & Deep Links",
    statement: "`UniversalLinkHandler` opens known `pizza.example` links in-app. For paths the router does not recognise (a blog post, a careers page) it is supposed to still show the page **inside the app**. Instead, tapping such a link flashes the app and then it opens again, over and over, on some devices. Fix `handle(_:)` so unknown links show the web page without leaving the app. `SafariServices` is already imported.",
    functionSignature: "func handle(_ activity: NSUserActivity) -> Bool",
    buggyCode: "import UIKit\nimport SafariServices\n\nenum LinkRoute: Equatable {\n    case order(id: String)\n    case menu\n}\n\nprotocol LinkRouter {\n    func parse(_ url: URL) -> LinkRoute?\n}\n\n/// Handles universal links for pizza.example. Known paths open in-app screens; anything else\n/// must still show the web page to the user without leaving the app.\nfinal class UniversalLinkHandler {\n    private let router: LinkRouter\n    private let navigation: UINavigationController\n\n    init(router: LinkRouter, navigation: UINavigationController) {\n        self.router = router\n        self.navigation = navigation\n    }\n\n    @discardableResult\n    func handle(_ activity: NSUserActivity) -> Bool {\n        guard activity.activityType == NSUserActivityTypeBrowsingWeb,\n              let url = activity.webpageURL else { return false }\n\n        guard let route = router.parse(url) else {\n            UIApplication.shared.open(url)\n            return true\n        }\n        show(route)\n        return true\n    }\n\n    private func show(_ route: LinkRoute) {\n        let screen = UIViewController()\n        screen.title = String(describing: route)\n        navigation.pushViewController(screen, animated: true)\n    }\n}\n",
    solution: "import UIKit\nimport SafariServices\n\nenum LinkRoute: Equatable {\n    case order(id: String)\n    case menu\n}\n\nprotocol LinkRouter {\n    func parse(_ url: URL) -> LinkRoute?\n}\n\n/// Handles universal links for pizza.example. Known paths open in-app screens; anything else\n/// must still show the web page to the user without leaving the app.\nfinal class UniversalLinkHandler {\n    private let router: LinkRouter\n    private let navigation: UINavigationController\n\n    init(router: LinkRouter, navigation: UINavigationController) {\n        self.router = router\n        self.navigation = navigation\n    }\n\n    @discardableResult\n    func handle(_ activity: NSUserActivity) -> Bool {\n        guard activity.activityType == NSUserActivityTypeBrowsingWeb,\n              let url = activity.webpageURL else { return false }\n\n        guard let route = router.parse(url) else {\n            // Unknown page: render it in-app. Handing it back to the system would re-open us.\n            let safari = SFSafariViewController(url: url)\n            navigation.present(safari, animated: true)\n            return true\n        }\n        show(route)\n        return true\n    }\n\n    private func show(_ route: LinkRoute) {\n        let screen = UIViewController()\n        screen.title = String(describing: route)\n        navigation.pushViewController(screen, animated: true)\n    }\n}\n",
    hint: "Where does `UIApplication.shared.open(url)` send a URL whose domain is associated with your own app?",
    explanation: "Handing the URL back to the system with `UIApplication.shared.open` asks iOS to route it — and since `pizza.example` is an associated domain, iOS routes it straight back to the app, producing the bounce. Presenting an `SFSafariViewController` renders the page in-app with Safari's cookies and Reader mode, never re-entering the universal-link path. Every universal-link handler needs a fallback that terminates.",
    rules: [
      { label: "No longer hands the URL back to the system", type: "mustNotContain", pattern: "UIApplication\\.shared\\.open\\(", regex: true },
      { label: "Unknown links render in-app", type: "mustContain", pattern: "guard\\s+let\\s+route\\s*=\\s*router\\.parse\\(url\\)\\s*else\\s*\\{(?:(?!\\n\\s*\\}\\n)[\\s\\S])*?(SFSafariViewController\\(|WKWebView|\\.present\\(|\\.pushViewController\\()", regex: true },
      { label: "Still returns true after handling", type: "mustContain", pattern: "return\\s+true", regex: true },
    ],
  },
  {
    id: "swift-coupon-clock-hardwired",
    number: 19,
    language: "swift",
    kind: "debug",
    title: "Coupon Expiry Uses the Wall Clock",
    difficulty: "Medium",
    topic: "Testing & Architecture",
    statement: "`CouponValidator` is injected with a `DateProvider` precisely so the test suite can freeze time. Yet `testExpiresAtMidnight` passes in the morning and fails after lunch, and a test with a coupon that \"expires tomorrow\" broke when it was left running overnight. Fix `validate` so the injected provider is the **only** source of the current time.",
    functionSignature: "func validate(_ coupon: Coupon, basketTotalCents: Int) throws",
    buggyCode: "import Foundation\n\nprotocol DateProvider {\n    func now() -> Date\n}\n\nstruct SystemDateProvider: DateProvider {\n    func now() -> Date { Date() }\n}\n\nstruct Coupon: Equatable {\n    let code: String\n    let expiresAt: Date\n    let minimumSpendCents: Int\n}\n\nenum CouponError: Error, Equatable {\n    case expired\n    case belowMinimum\n}\n\n/// Decides whether a coupon can be applied to a basket. Takes a DateProvider so tests are deterministic.\nstruct CouponValidator {\n    private let dates: DateProvider\n\n    init(dates: DateProvider) {\n        self.dates = dates\n    }\n\n    func validate(_ coupon: Coupon, basketTotalCents: Int) throws {\n        let now = Date()\n        guard coupon.expiresAt > now else { throw CouponError.expired }\n        guard basketTotalCents >= coupon.minimumSpendCents else { throw CouponError.belowMinimum }\n    }\n}\n",
    solution: "import Foundation\n\nprotocol DateProvider {\n    func now() -> Date\n}\n\nstruct SystemDateProvider: DateProvider {\n    func now() -> Date { Date() }\n}\n\nstruct Coupon: Equatable {\n    let code: String\n    let expiresAt: Date\n    let minimumSpendCents: Int\n}\n\nenum CouponError: Error, Equatable {\n    case expired\n    case belowMinimum\n}\n\n/// Decides whether a coupon can be applied to a basket. Takes a DateProvider so tests are deterministic.\nstruct CouponValidator {\n    private let dates: DateProvider\n\n    init(dates: DateProvider) {\n        self.dates = dates\n    }\n\n    func validate(_ coupon: Coupon, basketTotalCents: Int) throws {\n        let now = dates.now()\n        guard coupon.expiresAt > now else { throw CouponError.expired }\n        guard basketTotalCents >= coupon.minimumSpendCents else { throw CouponError.belowMinimum }\n    }\n}\n",
    hint: "Find the one line in `validate` that does not go through `dates`.",
    explanation: "Calling `Date()` inside the validator makes \"now\" an ambient hidden dependency, so tests depend on when they run and cannot cover the exact expiry boundary. Reading `dates.now()` instead makes the validator a pure function of its inputs: a `FixedDateProvider` in tests can pin the clock one second before and after `expiresAt`. Any hidden `Date()`, `UUID()`, or `.random` inside business logic is the same class of bug.",
    rules: [
      { label: "Reads the time from the injected provider", type: "mustContain", pattern: "dates\\.now\\(\\)", regex: true },
      { label: "validate no longer calls Date() directly", type: "mustNotContain", pattern: "func validate\\((?:(?!func\\s)[\\s\\S])*?\\bDate\\(\\)", regex: true },
    ],
  },
  {
    id: "swift-order-state-snapshot-flaky",
    number: 20,
    language: "swift",
    kind: "debug",
    title: "Snapshot Test That Never Matches",
    difficulty: "Medium",
    topic: "Testing & Architecture",
    statement: "`OrderStatusViewModel` exposes a single value-type `state` so the screen can be tested by comparing snapshots: `XCTAssertEqual(vm.state, expected)`. Two symptoms: the assertion never passes even when every visible field matches, and the view re-renders on every poll although nothing on screen changed. The UI still needs `refreshedAt` for its \"updated 2 min ago\" caption. Fix the model so `apply` produces the same state for the same inputs. Change the signature to `apply(_ update: OrderUpdate, at now: Date)` and initialise `refreshedAt` to `.distantPast`.",
    functionSignature: "func apply(_ update: OrderUpdate, at now: Date)",
    buggyCode: "import Combine\nimport Foundation\n\nstruct OrderStatusState: Equatable {\n    enum Stage: Equatable { case received, preparing, outForDelivery, delivered }\n\n    var stage: Stage\n    var etaMinutes: Int?\n    var isRefreshing: Bool\n    var refreshedAt: Date = Date()\n}\n\nstruct OrderUpdate: Equatable {\n    let stage: OrderStatusState.Stage\n    let etaMinutes: Int?\n}\n\n/// Exposes one value-type `state` so the screen can be snapshot-tested by comparing states.\nfinal class OrderStatusViewModel: ObservableObject {\n    @Published private(set) var state = OrderStatusState(stage: .received, etaMinutes: nil, isRefreshing: false)\n\n    func beginRefresh() {\n        state.isRefreshing = true\n    }\n\n    /// Only publishes when something actually changed.\n    func apply(_ update: OrderUpdate) {\n        let next = OrderStatusState(stage: update.stage, etaMinutes: update.etaMinutes, isRefreshing: false)\n        if next != state {\n            state = next\n        }\n    }\n}\n",
    solution: "import Combine\nimport Foundation\n\nstruct OrderStatusState: Equatable {\n    enum Stage: Equatable { case received, preparing, outForDelivery, delivered }\n\n    var stage: Stage\n    var etaMinutes: Int?\n    var isRefreshing: Bool\n    var refreshedAt: Date\n}\n\nstruct OrderUpdate: Equatable {\n    let stage: OrderStatusState.Stage\n    let etaMinutes: Int?\n}\n\n/// Exposes one value-type `state` so the screen can be snapshot-tested by comparing states.\nfinal class OrderStatusViewModel: ObservableObject {\n    @Published private(set) var state = OrderStatusState(stage: .received, etaMinutes: nil,\n                                                         isRefreshing: false, refreshedAt: .distantPast)\n\n    func beginRefresh() {\n        state.isRefreshing = true\n    }\n\n    /// Only publishes when something actually changed. The caller supplies the timestamp.\n    func apply(_ update: OrderUpdate, at now: Date) {\n        let next = OrderStatusState(stage: update.stage, etaMinutes: update.etaMinutes,\n                                    isRefreshing: false, refreshedAt: now)\n        if next != state {\n            state = next\n        }\n    }\n}\n",
    hint: "Which field takes a different value every time the struct is constructed?",
    explanation: "A `Date()` default inside the state struct injects wall-clock time into every construction, so two states built from identical updates are never `==` — the change-detection guard becomes useless and snapshot equality can never hold. Making the timestamp an explicit input (`at now: Date`) keeps the state a deterministic function of its inputs; tests pass a fixed date and production passes `Date()` at the call site, where non-determinism belongs.",
    rules: [
      { label: "No wall-clock reads inside the model", type: "mustNotContain", pattern: "\\bDate\\(\\)", regex: true },
      { label: "Timestamp is supplied by the caller", type: "mustContain", pattern: "func apply\\([^)]*\\b(at|now|date|timestamp)\\s*\\w*:\\s*Date", regex: true },
      { label: "refreshedAt comes from the supplied value", type: "mustContain", pattern: "refreshedAt:\\s*(now|date|timestamp|\\.distantPast|at)\\b", regex: true },
    ],
  },
];
