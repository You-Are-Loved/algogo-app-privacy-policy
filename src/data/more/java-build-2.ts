// Java backend build problems, batch 2 (numbers 51-75). Rule-graded: `language: 'java'`, `kind: 'build'`.
// Every solution is compile-checked at authoring time (scripts/verify-bugfix.ts scripts/fixtures/java-build-2.ts).

import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  {
    id: 'java-build-sealed-ledger-entry-switch',
    number: 51,
    language: 'java',
    kind: 'build',
    title: 'Sealed Ledger Entry Switch',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'A wallet ledger has exactly three kinds of entry, and the balance code must stop compiling the day someone adds a fourth without handling it. In `LedgerMath`:\n\n- Declare `Entry` as a `sealed interface` (the three records in the same file are its only implementations; a `permits` clause is optional).\n- Implement `delta(Entry entry)` as **one pattern-matching `switch`** over the entry, using type patterns (`case Deposit d ->`) or record patterns (`case Deposit(long cents) ->`).\n  - `Deposit` adds `cents`.\n  - `Withdrawal` subtracts `cents + feeCents`.\n  - `Reversal` is the negation of `delta(original)` (call `delta` recursively).\n- Do not write a `default` branch and do not use `instanceof`: the switch must be exhaustive because the interface is sealed.',
    functionSignature: 'public static long delta(Entry entry)',
    buggyCode: `public class LedgerMath {
    // TODO: make Entry a sealed interface so only these three records can implement it
    public interface Entry {}
    public record Deposit(long cents) implements Entry {}
    public record Withdrawal(long cents, long feeCents) implements Entry {}
    public record Reversal(Entry original) implements Entry {}

    /** Signed effect of one entry on the balance, in cents. */
    public static long delta(Entry entry) {
        // TODO: one exhaustive pattern-matching switch, no default branch
        return 0L;
    }
}
`,
    solution: `public class LedgerMath {
    public sealed interface Entry permits Deposit, Withdrawal, Reversal {}
    public record Deposit(long cents) implements Entry {}
    public record Withdrawal(long cents, long feeCents) implements Entry {}
    public record Reversal(Entry original) implements Entry {}

    /** Signed effect of one entry on the balance, in cents. */
    public static long delta(Entry entry) {
        return switch (entry) {
            case Deposit d -> d.cents();
            case Withdrawal w -> -(w.cents() + w.feeCents());
            case Reversal r -> -delta(r.original());
        };
    }
}
`,
    hint: 'Once the interface is sealed the compiler knows every subtype, so a switch with one case per record needs no default. The reversal case just calls delta again on the wrapped entry.',
    explanation:
      'A sealed interface closes the set of implementations, which turns the type hierarchy into something the compiler can reason about: a pattern-matching switch over it is checked for exhaustiveness. That is the whole point of leaving out `default`. With a default branch (or an instanceof chain ending in `return 0`), a new entry type added next year silently contributes nothing to the balance; without it, the missing case is a compile error at the exact line that needs attention. Type patterns bind the narrowed value directly, so no casts are needed, and a reversal is naturally recursive: it negates whatever the wrapped entry would have done. Cost is O(depth of nested reversals) per entry.',
    rules: [
      { label: 'Entry is declared as a sealed interface', type: 'mustContain', pattern: 'sealed\\s+interface\\s+Entry\\b', regex: true },
      { label: 'Handles the entry kinds with type or record patterns in a switch', type: 'mustContain', pattern: 'switch\\s*\\([\\s\\S]*case\\s+Reversal\\s*[(\\w]', regex: true },
      { label: 'A reversal calls delta again on the original entry', type: 'mustContain', pattern: 'delta\\s*\\(\\s*\\w+(\\s*\\.\\s*original\\s*\\(\\s*\\))?\\s*\\)', regex: true },
      { label: 'No default branch, so the compiler checks that every entry kind is handled', type: 'mustNotContain', pattern: '\\bdefault\\s*(->|:)', regex: true },
      { label: 'No instanceof chain', type: 'mustNotContain', pattern: '\\binstanceof\\b', regex: true },
    ],
  },
  {
    id: 'java-build-highest-ranked-bounded-generic',
    number: 52,
    language: 'java',
    kind: 'build',
    title: 'Highest Ranked Bounded Generic',
    difficulty: 'Easy',
    topic: 'Data Modelling',
    statement:
      'A leaderboard helper must work for any element type that has a natural ordering (`Integer`, `String`, `LocalDate`, your own `Comparable` classes) and must refuse, at compile time, types that have none. Implement `highest(List<T> items)` in `Rankings`:\n\n- Change the type parameter so that it is **bounded by `Comparable`**: `<T extends Comparable<? super T>>` (or `<T extends Comparable<T>>`).\n- Return the largest element by natural ordering wrapped in an `Optional`, or `Optional.empty()` for an empty list. The list contains no nulls.\n- Compare through the natural ordering (`compareTo`, `Collections.max` or `Comparator.naturalOrder()`); no casts to `Comparable` and never return `null`.',
    functionSignature: 'public static <T extends Comparable<? super T>> Optional<T> highest(List<T> items)',
    buggyCode: `public class Rankings {
    /** The largest element by natural ordering, or empty for an empty list. */
    public static <T> Optional<T> highest(List<T> items) {
        // TODO: bound T so that elements can be compared without any cast
        return Optional.empty();
    }
}
`,
    solution: `public class Rankings {
    /** The largest element by natural ordering, or empty for an empty list. */
    public static <T extends Comparable<? super T>> Optional<T> highest(List<T> items) {
        if (items.isEmpty()) {
            return Optional.empty();
        }
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) {
                best = item;
            }
        }
        return Optional.of(best);
    }
}
`,
    hint: 'The bound goes where the type parameter is declared, before the return type. With it in place, item.compareTo(best) compiles without a cast.',
    explanation:
      'An unbounded `<T>` tells the compiler nothing about T, so the only way to compare elements is an unchecked cast to Comparable, which fails with a ClassCastException at run time when someone passes a list of things that cannot be ordered. A bounded type parameter moves that failure to compile time: `<T extends Comparable<? super T>>` means "T can be compared with itself (or a supertype)". The `? super T` form also accepts classes that inherit their ordering from a parent, such as java.sql.Date. The scan itself is one pass, O(n) time and O(1) space, and Optional makes the empty-list case explicit instead of returning null.',
    rules: [
      { label: 'The type parameter is bounded by Comparable', type: 'mustContain', pattern: '<\\s*\\w+\\s+extends\\s+Comparable\\s*<', regex: true },
      { label: 'Compares elements through their natural ordering', type: 'mustContain', pattern: 'compareTo\\s*\\(|Collections\\s*\\.\\s*max\\s*\\(|naturalOrder\\s*\\(|Comparable\\s*::\\s*compareTo', regex: true },
      { label: 'An empty list produces an empty Optional', type: 'mustContain', pattern: 'Optional\\s*\\.\\s*(<\\s*\\w+\\s*>\\s*)?empty\\s*\\(|\\.max\\s*\\(|\\.reduce\\s*\\(', regex: true },
      { label: 'No casts to Comparable', type: 'mustNotContain', pattern: '\\(\\s*Comparable\\s*(<[^>]*>)?\\s*\\)', regex: true },
      { label: 'Never returns null', type: 'mustNotContain', pattern: 'return\\s+null\\b', regex: true },
    ],
  },
  {
    id: 'java-build-ring-log-iterator',
    number: 53,
    language: 'java',
    kind: 'build',
    title: 'Ring Log Iterator',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      '`RingLog<T>` keeps the last `capacity` log lines in a fixed array: `head` is the index of the oldest element and `size` is how many are stored. Make it usable in a for-each loop by implementing `iterator()`:\n\n- Return your own `Iterator<T>` (an anonymous class or a nested class that `implements Iterator<T>`).\n- It yields the elements **from oldest to newest**: positions `head`, `head + 1`, ... wrapping around the end of the array (use `% slots.length` or `Math.floorMod`).\n- `hasNext()` is true while fewer than `size` elements have been returned.\n- `next()` throws `NoSuchElementException` when called after the last element.\n- Walk the array in place: do not copy the elements into a list, an array copy or a stream first.',
    functionSignature: 'public Iterator<T> iterator()',
    buggyCode: `public class RingLog<T> implements Iterable<T> {
    private final Object[] slots;
    private int head;   // index of the oldest element
    private int size;   // number of stored elements

    public RingLog(int capacity) {
        this.slots = new Object[capacity];
    }

    /** Appends a value, overwriting the oldest one when the ring is full. */
    public void add(T value) {
        slots[(head + size) % slots.length] = value;
        if (size < slots.length) {
            size++;
        } else {
            head = (head + 1) % slots.length;
        }
    }

    @Override
    public Iterator<T> iterator() {
        // TODO: oldest to newest, in place; next() past the end throws NoSuchElementException
        return null;
    }
}
`,
    solution: `public class RingLog<T> implements Iterable<T> {
    private final Object[] slots;
    private int head;   // index of the oldest element
    private int size;   // number of stored elements

    public RingLog(int capacity) {
        this.slots = new Object[capacity];
    }

    /** Appends a value, overwriting the oldest one when the ring is full. */
    public void add(T value) {
        slots[(head + size) % slots.length] = value;
        if (size < slots.length) {
            size++;
        } else {
            head = (head + 1) % slots.length;
        }
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private int served = 0;

            @Override
            public boolean hasNext() {
                return served < size;
            }

            @Override
            @SuppressWarnings("unchecked")
            public T next() {
                if (!hasNext()) {
                    throw new NoSuchElementException();
                }
                T value = (T) slots[(head + served) % slots.length];
                served++;
                return value;
            }
        };
    }
}
`,
    hint: 'Keep one counter of how many elements you have handed out. The array index of the next element is head plus that counter, wrapped with the modulo of the array length.',
    explanation:
      'The Iterator contract has two halves that are easy to get half right: hasNext() must be a pure question, and next() must both advance and fail loudly with NoSuchElementException when there is nothing left. Skipping that check makes the iterator keep returning stale slots after wrapping, which is very hard to debug in the caller. In a ring buffer the logical order (oldest to newest) differs from the physical order, so the iterator counts how many elements it has served and maps that count to a physical index with (head + served) % slots.length. Iterating in place keeps it O(1) extra memory and O(1) per step; copying into a list first would allocate on every for-each loop over a structure whose whole purpose is to avoid allocation.',
    rules: [
      { label: 'Returns its own Iterator implementation', type: 'mustContain', pattern: 'new\\s+Iterator\\s*<|implements\\s+Iterator\\s*<', regex: true },
      { label: 'next() throws NoSuchElementException when the elements are used up', type: 'mustContain', pattern: 'throw\\s+new\\s+(java\\s*\\.\\s*util\\s*\\.\\s*)?NoSuchElementException\\s*\\(', regex: true },
      { label: 'hasNext() is implemented', type: 'mustContain', pattern: 'boolean\\s+hasNext\\s*\\(\\s*\\)', regex: true },
      { label: 'Walks the ring in place instead of copying it', type: 'mustNotContain', pattern: 'new\\s+ArrayList|Arrays\\s*\\.|List\\s*\\.\\s*of\\s*\\(|\\.stream\\s*\\(|\\.clone\\s*\\(', regex: true },
      { label: 'No longer returns the null placeholder', type: 'mustNotContain', pattern: 'return\\s+null\\b', regex: true },
    ],
  },
  {
    id: 'java-build-clocked-token-bucket',
    number: 54,
    language: 'java',
    kind: 'build',
    title: 'Clocked Token Bucket',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'An outbound SMS gateway allows short bursts but only a steady average rate. Implement `tryAcquire()` on `TokenBucket`. The bucket starts full with `capacity` tokens, gains `refillPerMilli` tokens per elapsed millisecond, and time comes only from the injected `LongSupplier clockMillis` so tests never sleep.\n\nOn every call, in this order:\n\n1. Read the clock **once** with `clockMillis.getAsLong()`.\n2. Add `(now - lastRefill) * refillPerMilli` to `tokens`, but never above `capacity` (clamp with `Math.min`), and set `lastRefill = now`.\n3. If `tokens >= 1`, subtract one token and return `true`; otherwise return `false` and leave the tokens as they are.\n\nKeep the method `synchronized` and use the existing fields. Do not call `System.currentTimeMillis()`, `System.nanoTime()` or `Instant.now()`.',
    functionSignature: 'public synchronized boolean tryAcquire()',
    buggyCode: `public class TokenBucket {
    private final long capacity;
    private final double refillPerMilli;
    private final LongSupplier clockMillis;
    private double tokens;
    private long lastRefill;

    public TokenBucket(long capacity, double refillPerSecond, LongSupplier clockMillis) {
        this.capacity = capacity;
        this.refillPerMilli = refillPerSecond / 1000.0;
        this.clockMillis = clockMillis;
        this.tokens = capacity;                 // starts full
        this.lastRefill = clockMillis.getAsLong();
    }

    /** Takes one token if available; never blocks. */
    public synchronized boolean tryAcquire() {
        // TODO: refill for the elapsed time (capped at capacity), then spend one token
        return true;
    }
}
`,
    solution: `public class TokenBucket {
    private final long capacity;
    private final double refillPerMilli;
    private final LongSupplier clockMillis;
    private double tokens;
    private long lastRefill;

    public TokenBucket(long capacity, double refillPerSecond, LongSupplier clockMillis) {
        this.capacity = capacity;
        this.refillPerMilli = refillPerSecond / 1000.0;
        this.clockMillis = clockMillis;
        this.tokens = capacity;                 // starts full
        this.lastRefill = clockMillis.getAsLong();
    }

    /** Takes one token if available; never blocks. */
    public synchronized boolean tryAcquire() {
        long now = clockMillis.getAsLong();
        long elapsed = now - lastRefill;
        if (elapsed > 0) {
            tokens = Math.min(capacity, tokens + elapsed * refillPerMilli);
            lastRefill = now;
        }
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }
}
`,
    hint: 'Refill lazily: there is no background thread. Work out how much time has passed since lastRefill, top the bucket up (capped), then decide whether one whole token is there to spend.',
    explanation:
      'A token bucket separates burst size (capacity) from sustained rate (refill speed). The neat part is that it needs no timer thread: every call computes how many tokens the elapsed time has earned and adds them before deciding. Two details carry the correctness. First, the refill must be capped at capacity, otherwise an idle hour banks thousands of tokens and the next burst is unlimited. Second, tokens are fractional, so the test is "at least one whole token", not "more than zero". Injecting the clock as a LongSupplier keeps the class deterministic under test (a test advances a counter instead of sleeping), and reading it once per call keeps the arithmetic consistent. Each call is O(1).',
    rules: [
      { label: 'Refills in proportion to the time elapsed since lastRefill', type: 'mustContain', pattern: '-\\s*(this\\s*\\.\\s*)?lastRefill\\b', regex: true },
      { label: 'Never holds more than capacity tokens', type: 'mustContain', pattern: 'Math\\s*\\.\\s*min\\s*\\(|>\\s*(this\\s*\\.\\s*)?capacity\\s*\\)\\s*\\{?\\s*(this\\s*\\.\\s*)?tokens\\s*=\\s*(this\\s*\\.\\s*)?capacity\\b', regex: true },
      { label: 'Spends a token only when at least one whole token is available', type: 'mustContain', pattern: '(this\\s*\\.\\s*)?tokens\\s*(>=|<)\\s*1(\\.0*)?[dD]?\\b|\\b1(\\.0*)?[dD]?\\s*(<=|>)\\s*(this\\s*\\.\\s*)?tokens\\b', regex: true },
      { label: 'Time comes only from the injected clock', type: 'mustNotContain', pattern: 'System\\s*\\.\\s*(currentTimeMillis|nanoTime)|Instant\\s*\\.\\s*now', regex: true },
    ],
  },
  {
    id: 'java-build-geocode-memoizer',
    number: 55,
    language: 'java',
    kind: 'build',
    title: 'Geocode Memoizer',
    difficulty: 'Easy',
    topic: 'Caching & Concurrency',
    statement:
      'Geocoding an address costs a paid API call, and request threads often ask for the same address at the same moment. Finish the generic `Memoizer<K, V>`, which wraps a `Function<K, V> loader`:\n\n- Add a field holding the results in a `ConcurrentHashMap` (declared as `ConcurrentHashMap`, `ConcurrentMap` or `Map`).\n- `get(key)` returns the cached value and runs the loader **at most once per key**, even when several threads ask for the same new key together. Use the atomic `computeIfAbsent`.\n- `size()` returns the number of cached keys.\n\nDo not use `containsKey` followed by `put` (two threads can both miss), and do not use a plain `HashMap`.',
    functionSignature: 'public V get(K key)',
    buggyCode: `public class Memoizer<K, V> {
    private final Function<K, V> loader;
    // TODO: a thread-safe map that holds one computed value per key

    public Memoizer(Function<K, V> loader) {
        this.loader = loader;
    }

    /** Returns the cached value, running the loader at most once per key. */
    public V get(K key) {
        // TODO
        return loader.apply(key);
    }

    /** Number of keys computed so far. */
    public int size() {
        // TODO
        return 0;
    }
}
`,
    solution: `public class Memoizer<K, V> {
    private final Function<K, V> loader;
    private final Map<K, V> cache = new ConcurrentHashMap<>();

    public Memoizer(Function<K, V> loader) {
        this.loader = loader;
    }

    /** Returns the cached value, running the loader at most once per key. */
    public V get(K key) {
        return cache.computeIfAbsent(key, loader);
    }

    /** Number of keys computed so far. */
    public int size() {
        return cache.size();
    }
}
`,
    hint: 'ConcurrentHashMap.computeIfAbsent takes the key and a mapping function and does the check and the insert as one atomic step. Your loader already is a mapping function.',
    explanation:
      'Check-then-act on a concurrent map is the classic race: two threads both see "absent", both call the expensive loader, and one result overwrites the other. ConcurrentHashMap.computeIfAbsent closes that window because the lookup, the computation and the insert happen atomically for that key, so every concurrent caller of the same key gets the single computed value. Two properties to remember: the mapping function should be short-ish and must not touch the same map (it runs while that bin is locked), and a loader that returns null stores nothing, so the next call will try again. Lookups after the first are lock-free and O(1).',
    rules: [
      { label: 'Stores results in a concurrent map', type: 'mustContain', pattern: '\\bConcurrent(Hash|SkipList)?Map\\b', regex: true },
      { label: 'Computes each key atomically with computeIfAbsent', type: 'mustContain', pattern: '\\.\\s*computeIfAbsent\\s*\\(', regex: true },
      { label: 'No containsKey-then-put race', type: 'mustNotContain', pattern: 'containsKey\\s*\\(', regex: true },
      { label: 'No plain HashMap for shared state', type: 'mustNotContain', pattern: 'new\\s+HashMap\\b', regex: true },
    ],
  },
  {
    id: 'java-build-storefront-page-composer',
    number: 56,
    language: 'java',
    kind: 'build',
    title: 'Storefront Page Composer',
    difficulty: 'Hard',
    topic: 'Caching & Concurrency',
    statement:
      'A product page needs the product (required) and its stock level (nice to have). Both services return a `CompletableFuture`. Implement `page(String sku, Duration stockTimeout)` on `StorefrontComposer`:\n\n- Call `catalog.product(sku)` and `inventory.stock(sku)` **both up front**, so they run concurrently; do not wait for the product before asking for stock.\n- The stock branch must never fail the page: if it has not completed within `stockTimeout` (use `completeOnTimeout` or `orTimeout`) or it completes exceptionally (use `exceptionally` or `handle`), the page shows `units = -1`.\n- Join the two results with `thenCombine` into `new ProductPage(product.name(), units)`.\n- A failure of the product call must propagate to the returned future.\n- Never block: no `join()` and no `get()`.',
    functionSignature: 'public CompletableFuture<ProductPage> page(String sku, Duration stockTimeout)',
    buggyCode: `public class StorefrontComposer {
    public record Product(String sku, String name) {}
    public record Stock(String sku, int units) {}
    public record ProductPage(String name, int units) {}
    public interface Catalog { CompletableFuture<Product> product(String sku); }
    public interface Inventory { CompletableFuture<Stock> stock(String sku); }

    private final Catalog catalog;
    private final Inventory inventory;

    public StorefrontComposer(Catalog catalog, Inventory inventory) {
        this.catalog = catalog;
        this.inventory = inventory;
    }

    /** Product name plus stock units; units is -1 when stock is slow or failing. */
    public CompletableFuture<ProductPage> page(String sku, Duration stockTimeout) {
        // TODO: start both calls, make the stock branch infallible, combine without blocking
        return null;
    }
}
`,
    solution: `public class StorefrontComposer {
    public record Product(String sku, String name) {}
    public record Stock(String sku, int units) {}
    public record ProductPage(String name, int units) {}
    public interface Catalog { CompletableFuture<Product> product(String sku); }
    public interface Inventory { CompletableFuture<Stock> stock(String sku); }

    private final Catalog catalog;
    private final Inventory inventory;

    public StorefrontComposer(Catalog catalog, Inventory inventory) {
        this.catalog = catalog;
        this.inventory = inventory;
    }

    /** Product name plus stock units; units is -1 when stock is slow or failing. */
    public CompletableFuture<ProductPage> page(String sku, Duration stockTimeout) {
        CompletableFuture<Product> product = catalog.product(sku);
        CompletableFuture<Integer> units = inventory.stock(sku)
            .thenApply(Stock::units)
            .completeOnTimeout(-1, stockTimeout.toMillis(), TimeUnit.MILLISECONDS)
            .exceptionally(error -> -1);
        return product.thenCombine(units, (p, u) -> new ProductPage(p.name(), u));
    }
}
`,
    hint: 'First turn the stock future into one that always completes with a number (a timeout value and an error fallback), then thenCombine it with the product future.',
    explanation:
      'thenCombine is the two-input join of CompletableFuture: both futures are already running, and the combining function fires when both are done. That is different from thenCompose, which starts the second call only after the first finishes and so adds the two latencies together. Because thenCombine fails if either input fails, the optional branch has to be made infallible before combining: completeOnTimeout (or orTimeout) bounds how long it can take, and exceptionally (or handle) maps any failure to the sentinel -1. The required branch is left alone so its failure reaches the caller. Nothing blocks a thread at any point, which matters when this runs on a small request pool. Total latency is max(product, min(stock, timeout)).',
    rules: [
      { label: 'Joins the two calls with thenCombine', type: 'mustContain', pattern: '\\.\\s*thenCombine(Async)?\\s*\\(', regex: true },
      { label: 'Bounds the stock call with a timeout', type: 'mustContain', pattern: '\\.\\s*(completeOnTimeout|orTimeout)\\s*\\(', regex: true },
      { label: 'A failed or late stock call falls back to -1 instead of failing the page', type: 'mustContain', pattern: '\\.\\s*(exceptionally|handle)(Async)?\\s*\\(', regex: true },
      { label: 'Never blocks on a future', type: 'mustNotContain', pattern: '\\.\\s*join\\s*\\(\\s*\\)|\\.\\s*get\\s*\\(\\s*\\)|\\.\\s*get\\s*\\(\\s*\\w+\\s*,', regex: true },
      { label: 'Does not chain the calls one after the other', type: 'mustNotContain', pattern: '\\.\\s*thenCompose(Async)?\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-shipment-event-bus',
    number: 57,
    language: 'java',
    kind: 'build',
    title: 'Shipment Event Bus',
    difficulty: 'Medium',
    topic: 'Messaging',
    statement:
      'An in-process bus fans shipment events out to listeners that come and go at runtime, while other threads are publishing. Implement `EventBus<E>`:\n\n- Hold the listeners in a `CopyOnWriteArrayList`, so that `publish` can iterate while another thread subscribes or unsubscribes.\n- `subscribe(listener)` adds the listener and returns a `Runnable`; running it removes that listener again.\n- `publish(event)` calls every listener in subscription order. A listener that throws a `RuntimeException` must **not** stop the remaining listeners: catch it per listener, count it, and return the number of listeners that threw.\n\nDo not use a plain `ArrayList` for the listener list.',
    functionSignature: 'public int publish(E event)',
    buggyCode: `public class EventBus<E> {
    // TODO: a listener list that is safe to iterate while other threads subscribe or unsubscribe
    private final List<Consumer<E>> listeners = new ArrayList<>();

    /** Registers a listener; running the returned handle removes it again. */
    public Runnable subscribe(Consumer<E> listener) {
        // TODO
        return () -> {};
    }

    /** Delivers the event to every listener in subscription order; returns how many threw. */
    public int publish(E event) {
        // TODO
        return 0;
    }
}
`,
    solution: `public class EventBus<E> {
    private final List<Consumer<E>> listeners = new CopyOnWriteArrayList<>();

    /** Registers a listener; running the returned handle removes it again. */
    public Runnable subscribe(Consumer<E> listener) {
        listeners.add(listener);
        return () -> listeners.remove(listener);
    }

    /** Delivers the event to every listener in subscription order; returns how many threw. */
    public int publish(E event) {
        int failed = 0;
        for (Consumer<E> listener : listeners) {
            try {
                listener.accept(event);
            } catch (RuntimeException e) {
                failed++;
            }
        }
        return failed;
    }
}
`,
    hint: 'CopyOnWriteArrayList iterates over a snapshot, so no locking is needed in publish. Put the try/catch inside the loop, around a single accept call.',
    explanation:
      'Listener lists are read on every event and changed rarely, which is exactly the trade CopyOnWriteArrayList makes: each add or remove copies the backing array, and iteration walks an immutable snapshot with no lock and no ConcurrentModificationException, even if a listener unsubscribes itself while being called. Returning a Runnable from subscribe gives the caller a handle that cannot be mismatched with the wrong bus. The second half is failure isolation: one broken subscriber must not prevent the others from hearing about the event, so the try/catch belongs inside the loop around each individual call, not around the loop. publish is O(listeners); subscribe and unsubscribe are O(listeners) because of the copy.',
    rules: [
      { label: 'Keeps the listeners in a CopyOnWriteArrayList', type: 'mustContain', pattern: 'new\\s+CopyOnWriteArrayList\\b', regex: true },
      { label: 'The returned handle removes the listener', type: 'mustContain', pattern: '\\.\\s*remove\\s*\\(\\s*\\w+\\s*\\)|\\.\\s*removeIf\\s*\\(', regex: true },
      { label: 'Catches a failing listener so the others still receive the event', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(final\\s+)?(RuntimeException|Exception|Throwable)\\s+\\w+\\s*\\)', regex: true },
      { label: 'No plain ArrayList for the shared listener list', type: 'mustNotContain', pattern: 'new\\s+ArrayList\\b', regex: true },
    ],
  },
  {
    id: 'java-build-invoice-tax-half-even',
    number: 58,
    language: 'java',
    kind: 'build',
    title: 'Invoice Tax Half-Even Rounding',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'An invoicing service receives prices and the tax rate as decimal strings and must produce the gross total exactly. Implement `grossTotal(List<Line> lines, String ratePercent)` in `InvoiceMath` with `BigDecimal`:\n\n- Parse each `unitPrice` and the rate with `new BigDecimal(String)`.\n- `net` = sum of `unitPrice * quantity` over all lines (`BigDecimal.ZERO` for an empty list).\n- `gross` = `net + net * ratePercent / 100` (dividing by 100 is exact; `movePointLeft(2)` also works).\n- Round **once, at the end**: return `gross.setScale(2, RoundingMode.HALF_EVEN)`. An empty invoice therefore returns `0.00`.\n\nNo `double` or `float` anywhere, and no other rounding mode. Example: one line `"0.25" x 1` at `"10"` percent gives `0.275`, which rounds half-even to `0.28`; `"0.05" x 1` at `"10"` percent gives `0.055`, which rounds to `0.06`; `"0.25" x 1` at `"2"` percent gives `0.255`, which rounds to `0.26`, while `"0.25" x 1` at `"6"` percent gives `0.265`, which also rounds to `0.26`.',
    functionSignature: 'public static BigDecimal grossTotal(List<Line> lines, String ratePercent)',
    buggyCode: `public class InvoiceMath {
    /** unitPrice is a decimal string such as "19.99". */
    public record Line(String unitPrice, int quantity) {}

    /** Net total of all lines plus tax at ratePercent (e.g. "8.25"), rounded once to 2 decimals. */
    public static BigDecimal grossTotal(List<Line> lines, String ratePercent) {
        // TODO: exact decimal arithmetic, RoundingMode.HALF_EVEN, scale 2
        return null;
    }
}
`,
    solution: `public class InvoiceMath {
    /** unitPrice is a decimal string such as "19.99". */
    public record Line(String unitPrice, int quantity) {}

    /** Net total of all lines plus tax at ratePercent (e.g. "8.25"), rounded once to 2 decimals. */
    public static BigDecimal grossTotal(List<Line> lines, String ratePercent) {
        BigDecimal net = BigDecimal.ZERO;
        for (Line line : lines) {
            BigDecimal price = new BigDecimal(line.unitPrice());
            net = net.add(price.multiply(BigDecimal.valueOf(line.quantity())));
        }
        BigDecimal rate = new BigDecimal(ratePercent).movePointLeft(2);
        BigDecimal gross = net.add(net.multiply(rate));
        return gross.setScale(2, RoundingMode.HALF_EVEN);
    }
}
`,
    hint: 'Keep full precision through every add and multiply; the only place a scale and a rounding mode appear is the final setScale.',
    explanation:
      'Binary floating point cannot represent most decimal fractions, so 0.1 + 0.2 style drift eventually shows up as a cent on an invoice. BigDecimal built from the decimal string (never from a double, which would import the error) keeps every digit, and add and multiply are exact. Rounding is then a business decision made in exactly one place: setScale(2, RoundingMode.HALF_EVEN) rounds a tie to the even neighbour (0.265 becomes 0.26, 0.275 becomes 0.28), which avoids the upward bias that HALF_UP accumulates over millions of lines. Rounding each line separately and summing would give a different total, which is why the statement asks for a single rounding at the end. Cost is O(lines).',
    rules: [
      { label: 'Parses the decimal strings with new BigDecimal(...)', type: 'mustContain', pattern: 'new\\s+BigDecimal\\s*\\(', regex: true },
      { label: 'Multiplies with BigDecimal.multiply', type: 'mustContain', pattern: '\\.\\s*multiply\\s*\\(', regex: true },
      { label: 'Rounds to 2 decimals with RoundingMode.HALF_EVEN', type: 'mustContain', pattern: 'setScale\\s*\\(\\s*2\\s*,\\s*[\\w.\\s]*\\bHALF_EVEN\\s*\\)', regex: true },
      { label: 'No floating-point arithmetic', type: 'mustNotContain', pattern: '\\bdouble\\b|\\bfloat\\b|doubleValue\\s*\\(|parseDouble\\s*\\(', regex: true },
      { label: 'No other rounding mode', type: 'mustNotContain', pattern: 'HALF_UP|HALF_DOWN|ROUND_|RoundingMode\\s*\\.\\s*(UP|DOWN|CEILING|FLOOR)\\b', regex: true },
    ],
  },
  {
    id: 'java-build-frozen-tour-itinerary',
    number: 59,
    language: 'java',
    kind: 'build',
    title: 'Frozen Tour Itinerary',
    difficulty: 'Easy',
    topic: 'Data Modelling',
    statement:
      '`Itinerary` is meant to be immutable, but it stores the caller\'s `List` and `java.util.Date` directly, so anyone holding those references can change a booked trip. Fix the class with defensive copies:\n\n- The constructor stores an **unmodifiable copy** of `stops` (`List.copyOf(stops)` is ideal) and a **copy** of the date (`new Date(departs.getTime())` or `clone()`).\n- `departs()` returns a fresh copy of the date every time, never the stored instance.\n- `withStop(stop)` returns a **new** `Itinerary` with the stop appended; it must not modify the stored list of this object.',
    functionSignature: 'public Itinerary withStop(String stop)',
    buggyCode: `public final class Itinerary {
    private final String traveller;
    private final List<String> stops;
    private final Date departs;

    public Itinerary(String traveller, List<String> stops, Date departs) {
        // TODO: the caller keeps references to stops and departs; do not share them
        this.traveller = traveller;
        this.stops = stops;
        this.departs = departs;
    }

    public String traveller() { return traveller; }

    public List<String> stops() { return stops; }

    public Date departs() {
        // TODO: Date is mutable
        return departs;
    }

    /** An itinerary with one more stop at the end; this object is left unchanged. */
    public Itinerary withStop(String stop) {
        // TODO
        stops.add(stop);
        return this;
    }
}
`,
    solution: `public final class Itinerary {
    private final String traveller;
    private final List<String> stops;
    private final Date departs;

    public Itinerary(String traveller, List<String> stops, Date departs) {
        this.traveller = traveller;
        this.stops = List.copyOf(stops);
        this.departs = new Date(departs.getTime());
    }

    public String traveller() { return traveller; }

    public List<String> stops() { return stops; }

    public Date departs() {
        return new Date(departs.getTime());
    }

    /** An itinerary with one more stop at the end; this object is left unchanged. */
    public Itinerary withStop(String stop) {
        List<String> next = new ArrayList<>(stops);
        next.add(stop);
        return new Itinerary(traveller, next, departs);
    }
}
`,
    hint: 'Copy on the way in and on the way out for anything mutable. A list of Strings needs one copy (Strings are immutable); a Date needs a copy in the constructor and another in the getter.',
    explanation:
      '`final` only freezes the reference, not the object behind it. If the constructor keeps the caller\'s list, the caller can still add to it afterwards; if a getter hands out the internal Date, anyone can call setTime on it. Defensive copying closes both doors: copy mutable inputs when storing them and copy mutable state when returning it. List.copyOf gives an unmodifiable snapshot (and returns the same instance when the input is already an immutable copy, so it is cheap to repeat). "Modifying" an immutable object means building a new one, which is what withStop does. The modern alternative for the date is to use the immutable java.time.Instant, which needs no copying at all.',
    rules: [
      { label: 'Stores its own copy of the stops list', type: 'mustContain', pattern: 'List\\s*\\.\\s*copyOf\\s*\\(|new\\s+ArrayList\\s*<[^>]*>\\s*\\(\\s*(this\\s*\\.\\s*)?\\w+\\s*\\)|\\.\\s*stream\\s*\\(\\s*\\)[^;]*toList', regex: true },
      { label: 'Copies the Date both when storing it and when returning it', type: 'mustContain', pattern: '(new\\s+Date\\s*\\([^;]*getTime|\\.\\s*clone\\s*\\()[\\s\\S]*(new\\s+Date\\s*\\([^;]*getTime|\\.\\s*clone\\s*\\()', regex: true },
      { label: 'withStop returns a new Itinerary', type: 'mustContain', pattern: 'return\\s+new\\s+Itinerary\\s*\\(', regex: true },
      { label: 'Does not keep the caller\'s list', type: 'mustNotContain', pattern: 'this\\s*\\.\\s*stops\\s*=\\s*stops\\s*;', regex: true },
      { label: 'Never adds to the stored list', type: 'mustNotContain', pattern: '(^|[^\\w.])stops\\s*\\.\\s*add\\s*\\(|this\\s*\\.\\s*stops\\s*\\.\\s*add\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-courier-depot-phone-chain',
    number: 60,
    language: 'java',
    kind: 'build',
    title: 'Courier Depot Phone Chain',
    difficulty: 'Easy',
    topic: 'Services & APIs',
    statement:
      'A dispatcher screen shows the phone number of a courier\'s depot. Every step can be missing: `dir.courier(id)` returns an `Optional<Courier>`, `courier.depotId()` is an `Optional<String>`, `dir.depot(id)` returns an `Optional<Depot>`, and `depot.phone()` may be `null` or blank.\n\nImplement `depotPhone(Directory dir, String courierId)` as a **single Optional chain**:\n\n- Use `flatMap` for the steps that themselves return an `Optional`.\n- Use `map` for the phone (a `null` result of `map` becomes an empty Optional).\n- Trim the phone, and treat an empty or whitespace-only phone as missing (`isBlank`).\n- Finish with `orElse("N/A")`: the method returns `"N/A"` whenever any step is missing and never returns `null`.\n\nNo `isPresent()` and no `get()`.',
    functionSignature: 'public static String depotPhone(Directory dir, String courierId)',
    buggyCode: `public class CourierContacts {
    public record Courier(String id, Optional<String> depotId) {}
    /** phone may be null when the depot has no line. */
    public record Depot(String id, String phone) {}

    public interface Directory {
        Optional<Courier> courier(String id);
        Optional<Depot> depot(String id);
    }

    /** The trimmed phone of the courier's depot, or "N/A" when any step is missing. */
    public static String depotPhone(Directory dir, String courierId) {
        // TODO: one Optional chain, no isPresent()/get()
        return null;
    }
}
`,
    solution: `public class CourierContacts {
    public record Courier(String id, Optional<String> depotId) {}
    /** phone may be null when the depot has no line. */
    public record Depot(String id, String phone) {}

    public interface Directory {
        Optional<Courier> courier(String id);
        Optional<Depot> depot(String id);
    }

    /** The trimmed phone of the courier's depot, or "N/A" when any step is missing. */
    public static String depotPhone(Directory dir, String courierId) {
        return dir.courier(courierId)
            .flatMap(Courier::depotId)
            .flatMap(dir::depot)
            .map(Depot::phone)
            .map(String::trim)
            .filter(phone -> !phone.isBlank())
            .orElse("N/A");
    }
}
`,
    hint: 'map wraps the function result in an Optional; flatMap is for functions that already return one. filter drops a value that should count as absent.',
    explanation:
      'Optional is at its best as a pipeline: each step runs only if the previous one produced a value, and the single fallback at the end covers every way the chain can come up empty. flatMap is needed whenever the step itself returns an Optional (using map there would give Optional<Optional<...>>), while map conveniently turns a null result into empty, which handles the nullable phone. filter turns "present but useless" (a blank string) into absent. The isPresent()/get() style re-creates nested null checks with extra steps and is easy to get wrong when one branch is forgotten. Each call does a constant number of lookups.',
    rules: [
      { label: 'Chains the Optional-returning lookups with flatMap', type: 'mustContain', pattern: '\\.\\s*flatMap\\s*\\(', regex: true },
      { label: 'Falls back to "N/A" at the end of the chain', type: 'mustContain', pattern: 'orElse(Get)?\\s*\\(\\s*(\\(\\s*\\)\\s*->\\s*)?"N/A"\\s*\\)', regex: true },
      { label: 'A blank phone counts as missing', type: 'mustContain', pattern: 'isBlank\\b|isEmpty\\b', regex: true },
      { label: 'No isPresent()/get() unwrapping', type: 'mustNotContain', pattern: 'isPresent\\s*\\(|\\.\\s*get\\s*\\(\\s*\\)', regex: true },
      { label: 'Never returns null', type: 'mustNotContain', pattern: 'return\\s+null\\b', regex: true },
    ],
  },
  {
    id: 'java-build-bulk-insert-chunker',
    number: 61,
    language: 'java',
    kind: 'build',
    title: 'Bulk Insert Chunker',
    difficulty: 'Easy',
    topic: 'Persistence Patterns',
    statement:
      'The database driver accepts at most a few hundred rows per batch statement. Implement the generic `chunks(List<T> rows, int size)` in `BulkInsert`:\n\n- Throw `IllegalArgumentException` when `size <= 0`.\n- Return consecutive chunks in the original order; every chunk has exactly `size` rows except possibly the last, which holds the remainder. An empty input returns an empty list (no empty chunk).\n- Cut each chunk with `rows.subList(from, to)`, clamping `to` to the list size with `Math.min`.\n- Each chunk must be an **independent copy** (`new ArrayList<>(...)` or `List.copyOf(...)` of the slice), because `subList` is only a view that breaks when the source list changes.\n\nExample: 7 rows with size 3 gives chunks of 3, 3 and 1.',
    functionSignature: 'public static <T> List<List<T>> chunks(List<T> rows, int size)',
    buggyCode: `public class BulkInsert {
    /** Splits rows into consecutive chunks of at most size elements, each an independent copy. */
    public static <T> List<List<T>> chunks(List<T> rows, int size) {
        // TODO: step through the list with subList, clamp the last chunk, copy every slice
        return List.of(rows);
    }
}
`,
    solution: `public class BulkInsert {
    /** Splits rows into consecutive chunks of at most size elements, each an independent copy. */
    public static <T> List<List<T>> chunks(List<T> rows, int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("size must be positive, got " + size);
        }
        List<List<T>> out = new ArrayList<>();
        for (int from = 0; from < rows.size(); from += size) {
            int to = Math.min(from + size, rows.size());
            out.add(new ArrayList<>(rows.subList(from, to)));
        }
        return out;
    }
}
`,
    hint: 'Advance a start index by size each round; the end index is the smaller of start + size and the list size. Wrap the slice in a new list before adding it to the result.',
    explanation:
      'Batching is index arithmetic with one trap at each end. At the tail, start + size can run past the list, so the end index is clamped with Math.min; that is also what produces the shorter final chunk. At the API level, subList returns a view backed by the original list: it is O(1) to create, but any structural change to the source afterwards makes every view throw ConcurrentModificationException, and writes through the view alter the source. Handing such views to code that runs later (a retry queue, an async writer) is a latent bug, so each slice is copied. Rejecting a non-positive size up front prevents an infinite loop. Total cost is O(n) time and O(n) extra space.',
    rules: [
      { label: 'Cuts the chunks with subList', type: 'mustContain', pattern: '\\.\\s*subList\\s*\\(', regex: true },
      { label: 'Clamps the end of the last chunk with Math.min', type: 'mustContain', pattern: 'Math\\s*\\.\\s*min\\s*\\(', regex: true },
      { label: 'Copies each slice instead of returning subList views', type: 'mustContain', pattern: 'new\\s+ArrayList\\s*<[^>]*>\\s*\\([^;]*subList|List\\s*\\.\\s*copyOf\\s*\\([^;]*subList|addAll\\s*\\([^;]*subList|subList\\s*\\([^;]*\\)\\s*\\.\\s*stream\\s*\\(', regex: true },
      { label: 'Rejects a non-positive size with IllegalArgumentException', type: 'mustContain', pattern: 'throw\\s+new\\s+IllegalArgumentException\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-latest-reading-per-sensor',
    number: 62,
    language: 'java',
    kind: 'build',
    title: 'Latest Reading Per Sensor',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'A dashboard shows the most recent reading of every sensor. Implement `latestBySensor(List<Reading> readings)` in `SensorSnapshot` with a single stream collect:\n\n- Use the four-argument `Collectors.toMap(keyMapper, valueMapper, mergeFunction, mapSupplier)`.\n- Key: `sensorId`. Value: the reading itself.\n- Merge function: when two readings share a sensor, keep the one with the **larger `takenAt`**; on an equal `takenAt` keep the one that came first in the list. (Compare `takenAt()` directly, or use `BinaryOperator.maxBy(Comparator.comparingLong(Reading::takenAt))`.)\n- Collect into a `TreeMap` so the keys come out sorted by sensor id.\n\nAn empty list gives an empty map.',
    functionSignature: 'public static Map<String, Reading> latestBySensor(List<Reading> readings)',
    buggyCode: `public class SensorSnapshot {
    public record Reading(String sensorId, long takenAt, double value) {}

    /** The most recent reading of every sensor, keyed and sorted by sensor id. */
    public static Map<String, Reading> latestBySensor(List<Reading> readings) {
        // TODO: Collectors.toMap with a merge function, collected into a TreeMap
        return Map.of();
    }
}
`,
    solution: `public class SensorSnapshot {
    public record Reading(String sensorId, long takenAt, double value) {}

    /** The most recent reading of every sensor, keyed and sorted by sensor id. */
    public static Map<String, Reading> latestBySensor(List<Reading> readings) {
        return readings.stream().collect(Collectors.toMap(
            Reading::sensorId,
            Function.identity(),
            (kept, next) -> next.takenAt() > kept.takenAt() ? next : kept,
            TreeMap::new));
    }
}
`,
    hint: 'The two-argument toMap throws on a duplicate key. The third argument decides which of two values for the same key survives, and the fourth chooses the map implementation.',
    explanation:
      'Collectors.toMap in its short form throws IllegalStateException on the first duplicate key, which is the usual surprise with real data. The merge function is the fix: it receives the value already in the map and the new one and returns the survivor, here the reading with the larger timestamp. Keeping the existing value on a tie makes the result deterministic (BinaryOperator.maxBy behaves the same way: it returns its first argument when the two compare equal). The fourth argument picks the map type; a TreeMap gives sorted keys, where the default HashMap gives an arbitrary order that changes between runs. This is the "latest row per key" query done in one O(n log k) pass, with k distinct sensors.',
    rules: [
      { label: 'Collects with Collectors.toMap', type: 'mustContain', pattern: '\\btoMap\\s*\\(', regex: true },
      { label: 'The merge function keeps the reading with the larger takenAt', type: 'mustContain', pattern: 'takenAt\\s*\\(\\s*\\)\\s*(>=|<=|>|<)|comparing(Long)?\\s*\\(\\s*Reading\\s*::\\s*takenAt|Long\\s*\\.\\s*compare\\s*\\(', regex: true },
      { label: 'Collects into a TreeMap', type: 'mustContain', pattern: 'TreeMap', regex: true },
      { label: 'No longer returns the empty placeholder map', type: 'mustNotContain', pattern: 'return\\s+Map\\s*\\.\\s*of\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-loyalty-tier-pricing-enum',
    number: 63,
    language: 'java',
    kind: 'build',
    title: 'Loyalty Tier Pricing Enum',
    difficulty: 'Medium',
    topic: 'Data Modelling',
    statement:
      'Each loyalty tier prices an order differently, and the rules keep growing. Put the behaviour **on the enum constants** of `Tier` instead of in a `switch`:\n\n- `BASIC`: no discount, `priceCents(list)` returns `list`.\n- `SILVER`: 5% off, `list * 95 / 100` (integer arithmetic).\n- `GOLD`: 10% off but the discount is capped at 2000 cents: `list - Math.min(list / 10, 2000)`.\n\nGive every constant its own behaviour in one of the two standard ways: a constructor argument such as a `LongUnaryOperator` lambda stored in a field, or constant-specific method bodies (`GOLD { @Override public long priceCents(...) { ... } }`, optionally with an `abstract` method).\n\nNo `switch` and no `if (this == GOLD)` style chain.',
    functionSignature: 'public long priceCents(long listCents)',
    buggyCode: `public class Loyalty {
    public enum Tier {
        BASIC, SILVER, GOLD;

        // TODO: give every constant its own pricing behaviour (no switch, no if-chain on the constant)

        /** Price in cents after this tier's discount. */
        public long priceCents(long listCents) {
            return listCents;
        }
    }
}
`,
    solution: `public class Loyalty {
    public enum Tier {
        BASIC(list -> list),
        SILVER(list -> list * 95 / 100),
        GOLD(list -> list - Math.min(list / 10, 2000));

        private final LongUnaryOperator pricing;

        Tier(LongUnaryOperator pricing) {
            this.pricing = pricing;
        }

        /** Price in cents after this tier's discount. */
        public long priceCents(long listCents) {
            return pricing.applyAsLong(listCents);
        }
    }
}
`,
    hint: 'An enum constant can take constructor arguments, and a lambda is a perfectly good argument: BASIC(list -> list). priceCents then just applies the stored function.',
    explanation:
      'A switch over an enum scatters the knowledge about each constant across every method that switches on it; adding a constant means finding all of those switches, and a forgotten one falls into `default` silently. Attaching the behaviour to the constant (the strategy pattern, with the enum as the registry) keeps each tier\'s rule next to its name. With a constructor-injected LongUnaryOperator a new constant cannot be declared without supplying its pricing; with an abstract method the compiler likewise refuses a constant with no body. The cap on GOLD is a plain Math.min on the discount, and using integer arithmetic on cents avoids floating point entirely. Calls are O(1).',
    rules: [
      { label: 'Each constant carries its own pricing behaviour', type: 'mustContain', pattern: 'LongUnaryOperator|UnaryOperator\\s*<\\s*Long\\s*>|Function\\s*<\\s*Long\\s*,\\s*Long\\s*>|LongFunction|abstract\\s+long\\s+\\w+\\s*\\(|\\b[A-Z_]+\\s*(\\([^)]*\\))?\\s*\\{\\s*(@Override\\s*)?(public\\s+)?long\\s+\\w+\\s*\\(', regex: true },
      { label: 'Caps the GOLD discount at 2000 cents', type: 'mustContain', pattern: 'Math\\s*\\.\\s*min\\s*\\(|[<>]=?\\s*2_?000L?\\s*(\\?|\\))', regex: true },
      { label: 'No switch on the tier', type: 'mustNotContain', pattern: '\\bswitch\\b', regex: true },
      { label: 'No if-chain comparing the constant', type: 'mustNotContain', pattern: 'this\\s*==|==\\s*(Tier\\s*\\.\\s*)?(BASIC|SILVER|GOLD)\\b|equals\\s*\\(\\s*(Tier\\s*\\.\\s*)?(BASIC|SILVER|GOLD)\\b|\\bordinal\\s*\\(|\\bname\\s*\\(\\s*\\)\\s*\\.\\s*equals', regex: true },
    ],
  },
  {
    id: 'java-build-checked-call-adapter',
    number: 64,
    language: 'java',
    kind: 'build',
    title: 'Checked Call Adapter',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'Stream pipelines and `CompletableFuture.supplyAsync` take a `Supplier`, which cannot throw checked exceptions, so file and network calls do not fit. Build the adapter in `Unchecked`:\n\n- Turn `ThrowingSupplier<T>` into a proper functional interface: annotate it with `@FunctionalInterface` and declare `T get() throws Exception;`.\n- `wrap(body)` returns a `Supplier<T>` that calls `body.get()` and translates what it throws:\n  - a `RuntimeException` is rethrown unchanged;\n  - an `IOException` becomes `new UncheckedIOException(e)`;\n  - an `InterruptedException` first restores the flag with `Thread.currentThread().interrupt()` and is then thrown as an `IllegalStateException` with the original as its cause;\n  - any other checked exception becomes an `IllegalStateException` with the original as its cause (`new IllegalStateException(e)` or `new IllegalStateException(message, e)`).',
    functionSignature: 'public static <T> Supplier<T> wrap(ThrowingSupplier<T> body)',
    buggyCode: `public class Unchecked {
    // TODO: mark this as a functional interface whose get() may throw checked exceptions
    public interface ThrowingSupplier<T> {
        T get();
    }

    /** Adapts a throwing supplier to a plain Supplier that only throws unchecked exceptions. */
    public static <T> Supplier<T> wrap(ThrowingSupplier<T> body) {
        // TODO: translate checked exceptions, keep the cause, restore the interrupt flag
        return null;
    }
}
`,
    solution: `public class Unchecked {
    @FunctionalInterface
    public interface ThrowingSupplier<T> {
        T get() throws Exception;
    }

    /** Adapts a throwing supplier to a plain Supplier that only throws unchecked exceptions. */
    public static <T> Supplier<T> wrap(ThrowingSupplier<T> body) {
        return () -> {
            try {
                return body.get();
            } catch (RuntimeException e) {
                throw e;
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(e);
            } catch (Exception e) {
                throw new IllegalStateException(e);
            }
        };
    }
}
`,
    hint: 'Order the catch blocks from most specific to least specific. Catching InterruptedException clears the thread\'s interrupt flag, so set it again before translating.',
    explanation:
      'A functional interface is just an interface with one abstract method, so you can declare your own whose method has a throws clause; @FunctionalInterface makes the compiler enforce the single-method shape. The adapter is where the translation policy lives. Runtime exceptions pass through untouched so callers still see the real type. IOException has a dedicated unchecked twin, UncheckedIOException, which the JDK itself uses in streams. InterruptedException is special: catching it clears the interrupt status, and if you do not set it again the code further up (a pool worker, a shutdown hook) never learns that it was asked to stop. Everything else is wrapped with the original as the cause so the stack trace is not lost.',
    rules: [
      { label: 'ThrowingSupplier is annotated with @FunctionalInterface', type: 'mustContain', pattern: '@FunctionalInterface', regex: true },
      { label: 'Its get() declares a checked exception', type: 'mustContain', pattern: 'get\\s*\\(\\s*\\)\\s*throws\\s+\\w+', regex: true },
      { label: 'An IOException becomes an UncheckedIOException', type: 'mustContain', pattern: 'new\\s+UncheckedIOException\\s*\\(', regex: true },
      { label: 'Restores the interrupt flag for an InterruptedException', type: 'mustContain', pattern: 'Thread\\s*\\.\\s*currentThread\\s*\\(\\s*\\)\\s*\\.\\s*interrupt\\s*\\(\\s*\\)', regex: true },
      { label: 'Other checked exceptions are wrapped with the original as the cause', type: 'mustContain', pattern: 'new\\s+IllegalStateException\\s*\\((.*,\\s*)?\\w+\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-pooled-connection-lease',
    number: 65,
    language: 'java',
    kind: 'build',
    title: 'Pooled Connection Lease',
    difficulty: 'Medium',
    topic: 'Resilience',
    statement:
      'A tiny connection pool hands out `Lease` objects. Today a lease that is never closed leaks its connection, and one that is closed twice puts the same connection into the idle queue twice, so two threads end up sharing it. Fix both in `ConnectionPool`:\n\n- Make `Lease` implement `AutoCloseable` so it works in try-with-resources (its `close()` throws no checked exception).\n- Make `close()` **idempotent**: the connection goes back to `idle` only on the first call. Guard it with an `AtomicBoolean` (`compareAndSet(false, true)` or `getAndSet(true)`); a `boolean` flag checked inside a `synchronized` close is also fine.\n- Rewrite `withConnection(work)` to acquire the lease in a **try-with-resources** statement (`try (Lease lease = acquire()) { ... }`) and return `work.apply(lease.conn())`, so the connection is returned even when `work` throws.',
    functionSignature: 'public <R> R withConnection(Function<Conn, R> work) throws InterruptedException',
    buggyCode: `public class ConnectionPool {
    public interface Conn { String query(String sql); }

    private final BlockingQueue<Conn> idle;

    public ConnectionPool(Collection<Conn> conns) {
        this.idle = new LinkedBlockingQueue<>(conns);
    }

    public int idleCount() { return idle.size(); }

    // TODO: make Lease usable in try-with-resources; close() must hand the connection back exactly once
    public final class Lease {
        private final Conn conn;

        Lease(Conn conn) { this.conn = conn; }

        public Conn conn() { return conn; }

        public void close() {
            idle.add(conn);
        }
    }

    public Lease acquire() throws InterruptedException {
        return new Lease(idle.take());
    }

    /** Borrows a connection for one call and always gives it back, even when work throws. */
    public <R> R withConnection(Function<Conn, R> work) throws InterruptedException {
        // TODO: try-with-resources
        return work.apply(acquire().conn());
    }
}
`,
    solution: `public class ConnectionPool {
    public interface Conn { String query(String sql); }

    private final BlockingQueue<Conn> idle;

    public ConnectionPool(Collection<Conn> conns) {
        this.idle = new LinkedBlockingQueue<>(conns);
    }

    public int idleCount() { return idle.size(); }

    public final class Lease implements AutoCloseable {
        private final Conn conn;
        private final AtomicBoolean closed = new AtomicBoolean();

        Lease(Conn conn) { this.conn = conn; }

        public Conn conn() { return conn; }

        @Override
        public void close() {
            if (closed.compareAndSet(false, true)) {
                idle.add(conn);
            }
        }
    }

    public Lease acquire() throws InterruptedException {
        return new Lease(idle.take());
    }

    /** Borrows a connection for one call and always gives it back, even when work throws. */
    public <R> R withConnection(Function<Conn, R> work) throws InterruptedException {
        try (Lease lease = acquire()) {
            return work.apply(lease.conn());
        }
    }
}
`,
    hint: 'try-with-resources calls close() on every exit path, so withConnection needs no finally. The lease itself has to remember that it has already been closed.',
    explanation:
      'AutoCloseable plus try-with-resources moves cleanup from "remember to call it" to "the compiler generates it": close() runs when the block exits normally, by return or by exception, and an exception thrown by close() is attached as suppressed instead of hiding the original. The contract of AutoCloseable encourages close() to be idempotent, and for a pooled resource that is a hard requirement: returning the same connection twice lets two borrowers use it at once, a bug that shows up as corrupted protocol state far from its cause. An AtomicBoolean flipped with compareAndSet(false, true) lets exactly one caller win even when two threads close the same lease concurrently. Both operations are O(1).',
    rules: [
      { label: 'Lease implements AutoCloseable', type: 'mustContain', pattern: 'Lease\\s+implements\\s+[\\w\\s,.]*\\bAutoCloseable\\b', regex: true },
      { label: 'close() returns the connection only the first time it is called', type: 'mustContain', pattern: 'compareAndSet\\s*\\(\\s*false\\s*,\\s*true\\s*\\)|getAndSet\\s*\\(\\s*true\\s*\\)|if\\s*\\(\\s*!?\\s*(this\\s*\\.\\s*)?\\w+\\s*\\)\\s*\\{?\\s*(return\\s*;|(this\\s*\\.\\s*)?\\w+\\s*=\\s*true\\b)', regex: true },
      { label: 'withConnection borrows the lease in try-with-resources', type: 'mustContain', pattern: 'try\\s*\\(\\s*(final\\s+)?(var|Lease|ConnectionPool\\s*\\.\\s*Lease)\\s+\\w+\\s*=', regex: true },
      { label: 'No longer uses a lease without closing it', type: 'mustNotContain', pattern: 'apply\\s*\\(\\s*(this\\s*\\.\\s*)?acquire\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-condition-guarded-print-spool',
    number: 66,
    language: 'java',
    kind: 'build',
    title: 'Condition-Guarded Print Spool',
    difficulty: 'Hard',
    topic: 'Caching & Concurrency',
    statement:
      'Build a bounded blocking buffer by hand, the way `ArrayBlockingQueue` works inside. `Spool<T>` holds at most `capacity` jobs in the given `ArrayDeque`:\n\n- Add one `ReentrantLock` and **two** `Condition` objects created with `lock.newCondition()`: one for "not full", one for "not empty".\n- `put(item)`: take the lock; **while** the spool is full, `await()` on the not-full condition; add the item at the tail; `signal()` the not-empty condition.\n- `take()`: take the lock; **while** the spool is empty, `await()` on the not-empty condition; remove the head; `signal()` the not-full condition; return the item.\n- The wait must be in a `while` loop (not an `if`), and the lock must be released in a `finally` block.\n\nDo not use any `BlockingQueue`/`BlockingDeque` class, `synchronized`, `wait()` or `notify()`.',
    functionSignature: 'public void put(T item) throws InterruptedException',
    buggyCode: `import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Spool<T> {
    private final Deque<T> items = new ArrayDeque<>();
    private final int capacity;
    // TODO: one ReentrantLock and two Conditions created from it (not full / not empty)

    public Spool(int capacity) {
        this.capacity = capacity;
    }

    /** Adds a job, waiting while the spool is full. */
    public void put(T item) throws InterruptedException {
        // TODO
        items.addLast(item);
    }

    /** Removes the oldest job, waiting while the spool is empty. */
    public T take() throws InterruptedException {
        // TODO
        return items.pollFirst();
    }
}
`,
    solution: `import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Spool<T> {
    private final Deque<T> items = new ArrayDeque<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public Spool(int capacity) {
        this.capacity = capacity;
    }

    /** Adds a job, waiting while the spool is full. */
    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (items.size() == capacity) {
                notFull.await();
            }
            items.addLast(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    /** Removes the oldest job, waiting while the spool is empty. */
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (items.isEmpty()) {
                notEmpty.await();
            }
            T item = items.pollFirst();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
`,
    hint: 'await() releases the lock while it waits and re-acquires it before returning, but by then another thread may have changed the queue again. That is why the condition is re-tested in a loop.',
    explanation:
      'A Condition is a wait queue attached to a Lock: await() atomically releases the lock and parks the thread, and signal() wakes one waiter, which must re-acquire the lock before it continues. Two rules make the pattern correct. First, always wait in a while loop: between the signal and the moment the woken thread actually gets the lock, another thread may have taken the slot (and spurious wakeups are allowed), so the condition has to be checked again. With an `if`, a consumer can wake up to an empty deque and return null. Second, unlock in finally, or an InterruptedException thrown by await() leaves the lock held forever. Two separate conditions mean a producer only wakes consumers and vice versa, instead of waking everyone as notifyAll does. Each operation is O(1).',
    rules: [
      { label: 'Creates its conditions from a ReentrantLock', type: 'mustContain', pattern: 'new\\s+ReentrantLock\\s*\\([\\s\\S]*\\.\\s*newCondition\\s*\\(\\s*\\)[\\s\\S]*\\.\\s*newCondition\\s*\\(\\s*\\)', regex: true },
      { label: 'Waits inside a while loop that re-checks the state', type: 'mustContain', pattern: 'while\\s*\\(.*\\)\\s*\\{?\\s*(this\\s*\\.\\s*)?\\w+\\s*\\.\\s*await\\s*\\(', regex: true },
      { label: 'Signals waiting threads after changing the queue', type: 'mustContain', pattern: '\\.\\s*signal(All)?\\s*\\(\\s*\\)', regex: true },
      { label: 'Releases the lock in a finally block', type: 'mustContain', pattern: 'finally\\s*\\{\\s*(this\\s*\\.\\s*)?\\w+\\s*\\.\\s*unlock\\s*\\(\\s*\\)', regex: true },
      { label: 'Built on Lock and Condition, not on a blocking queue or intrinsic monitors', type: 'mustNotContain', pattern: 'Blocking(Queue|Deque)|\\bsynchronized\\b|\\.\\s*wait\\s*\\(|\\bnotify(All)?\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-login-attempt-sliding-window',
    number: 67,
    language: 'java',
    kind: 'build',
    title: 'Login Attempt Sliding Window',
    difficulty: 'Medium',
    topic: 'Security',
    statement:
      'To slow down password guessing, an account may make at most `maxAttempts` login attempts in any `windowMillis` span. Implement `allow(String account)` on `LoginThrottle` as a **sliding window log**; time comes only from the injected `LongSupplier clockMillis`.\n\nOn every call:\n\n1. Read the clock once: `now = clockMillis.getAsLong()`.\n2. Get the account\'s `Deque<Long>` of timestamps from `attempts`, creating an `ArrayDeque` on first use.\n3. Evict expired timestamps from the **front** in a loop: a timestamp `ts` has expired when `ts <= now - windowMillis`. (`removeIf` with the same test is also accepted.)\n4. If the deque now holds `maxAttempts` timestamps or more, return `false` and record nothing.\n5. Otherwise append `now` at the back and return `true`.\n\nKeep the method `synchronized`. No `System.currentTimeMillis()`, `System.nanoTime()` or `Instant.now()`.\n\nExample with `maxAttempts = 2`, `windowMillis = 1000`: calls at t = 0, 900, 1000, 1100, 1900 return true, true, true, false, true (at 1000 the attempt from t = 0 has just expired; at 1100 the attempts from 900 and 1000 are both still inside the window).',
    functionSignature: 'public synchronized boolean allow(String account)',
    buggyCode: `public class LoginThrottle {
    private final int maxAttempts;
    private final long windowMillis;
    private final LongSupplier clockMillis;
    private final Map<String, Deque<Long>> attempts = new HashMap<>();

    public LoginThrottle(int maxAttempts, long windowMillis, LongSupplier clockMillis) {
        this.maxAttempts = maxAttempts;
        this.windowMillis = windowMillis;
        this.clockMillis = clockMillis;
    }

    /** Records an attempt for the account and returns true when it is allowed. */
    public synchronized boolean allow(String account) {
        // TODO: sliding window over the timestamps of the allowed attempts
        return true;
    }
}
`,
    solution: `public class LoginThrottle {
    private final int maxAttempts;
    private final long windowMillis;
    private final LongSupplier clockMillis;
    private final Map<String, Deque<Long>> attempts = new HashMap<>();

    public LoginThrottle(int maxAttempts, long windowMillis, LongSupplier clockMillis) {
        this.maxAttempts = maxAttempts;
        this.windowMillis = windowMillis;
        this.clockMillis = clockMillis;
    }

    /** Records an attempt for the account and returns true when it is allowed. */
    public synchronized boolean allow(String account) {
        long now = clockMillis.getAsLong();
        Deque<Long> recent = attempts.computeIfAbsent(account, a -> new ArrayDeque<>());
        while (!recent.isEmpty() && recent.peekFirst() <= now - windowMillis) {
            recent.pollFirst();
        }
        if (recent.size() >= maxAttempts) {
            return false;
        }
        recent.addLast(now);
        return true;
    }
}
`,
    hint: 'Timestamps are appended in increasing order, so the oldest is always at the front: pop from the front while the front is too old, then compare the size with the limit.',
    explanation:
      'A fixed-window counter (reset the count every N seconds) lets an attacker fire a full quota at the end of one window and another at the start of the next, doubling the real rate. The sliding window log stores the timestamp of each allowed attempt instead, so the question "how many in the last N milliseconds" is always answered exactly. Because timestamps arrive in order, the deque is sorted and expired entries are all at the front; evicting them in a loop is amortised O(1) per call and memory is bounded by maxAttempts per account. Denied attempts are not recorded, otherwise a client that keeps hammering would never be let back in. The injected clock makes the boundary cases (exactly one window later) testable without sleeping.',
    rules: [
      { label: 'Reads the time from the injected clock', type: 'mustContain', pattern: '\\.\\s*getAsLong\\s*\\(\\s*\\)', regex: true },
      { label: 'Evicts expired timestamps before counting', type: 'mustContain', pattern: 'while\\s*\\(.*(peek|peekFirst|getFirst|element|isEmpty)\\s*\\(|\\.\\s*removeIf\\s*\\(', regex: true },
      { label: 'Compares the number of remembered attempts with maxAttempts', type: 'mustContain', pattern: 'size\\s*\\(\\s*\\)\\s*(>=|<=|==|>|<)\\s*(this\\s*\\.\\s*)?maxAttempts\\b|(this\\s*\\.\\s*)?maxAttempts\\s*(>=|<=|==|>|<)\\s*\\w+\\s*\\.\\s*size\\s*\\(', regex: true },
      { label: 'Time comes only from the injected clock', type: 'mustNotContain', pattern: 'System\\s*\\.\\s*(currentTimeMillis|nanoTime)|Instant\\s*\\.\\s*now', regex: true },
    ],
  },
  {
    id: 'java-build-lazy-audit-log-pages',
    number: 68,
    language: 'java',
    kind: 'build',
    title: 'Lazy Audit Log Pages',
    difficulty: 'Hard',
    topic: 'Services & APIs',
    statement:
      'An audit API returns its log one page at a time: `source.fetch(token)` gives a `Page` with its `entries` and a `nextToken`, which is `null` on the last page (pass `null` to fetch the first page). Callers want a plain `Stream<String>` of entries and often stop early (`limit`, `findFirst`), so later pages must be fetched **only when the stream reaches them**.\n\nImplement `entries(PageSource source)` in `AuditLogReader`:\n\n- Build the stream of pages with `Stream.iterate`: the seed is the first page, each next page is fetched from the previous page\'s `nextToken`, and the stream ends after the page whose `nextToken` is `null`. Use either the three-argument form with a `hasNext` predicate, or the two-argument form followed by `takeWhile`.\n- Flatten the pages into entries with `flatMap`.\n- No `for`/`while` loop and no intermediate `ArrayList` that collects every page first.',
    functionSignature: 'public static Stream<String> entries(PageSource source)',
    buggyCode: `public class AuditLogReader {
    /** nextToken is null on the last page. */
    public record Page(List<String> entries, String nextToken) {}

    public interface PageSource {
        /** token is null for the first page. */
        Page fetch(String token);
    }

    /** Every entry of every page in order, fetching later pages only as the stream is consumed. */
    public static Stream<String> entries(PageSource source) {
        // TODO: Stream.iterate over pages, then flatten
        return Stream.empty();
    }
}
`,
    solution: `public class AuditLogReader {
    /** nextToken is null on the last page. */
    public record Page(List<String> entries, String nextToken) {}

    public interface PageSource {
        /** token is null for the first page. */
        Page fetch(String token);
    }

    /** Every entry of every page in order, fetching later pages only as the stream is consumed. */
    public static Stream<String> entries(PageSource source) {
        return Stream.iterate(
                source.fetch(null),
                Objects::nonNull,
                page -> page.nextToken() == null ? null : source.fetch(page.nextToken()))
            .flatMap(page -> page.entries().stream());
    }
}
`,
    hint: 'Let the "next" function return null when the current page has no nextToken, and let the predicate stop the stream at that null.',
    explanation:
      'Stream.iterate(seed, hasNext, next) is a for-loop turned into a lazy stream: `next` is only invoked when the downstream asks for another element, so a consumer that stops after the first page causes exactly one fetch. The end-of-data signal here lives on the current page (a null nextToken), so the next function maps "no token" to null and the predicate (or takeWhile) stops there, without calling fetch again. flatMap then turns each page into its entries while preserving order. The eager alternative, looping until the token is null and collecting into a list, always pays for every page and holds the whole log in memory, which is precisely what pagination was meant to avoid.',
    rules: [
      { label: 'Generates the pages with Stream.iterate', type: 'mustContain', pattern: 'Stream\\s*\\.\\s*(<[^>]*>\\s*)?iterate\\s*\\(', regex: true },
      { label: 'Flattens the pages into entries with flatMap', type: 'mustContain', pattern: '\\.\\s*flatMap\\s*\\(', regex: true },
      { label: 'Stops after the page that has no next token', type: 'mustContain', pattern: 'nextToken\\s*\\(\\s*\\)\\s*(==|!=)\\s*null|Objects\\s*(::|\\.)\\s*(nonNull|isNull)|[!=]=\\s*null|takeWhile\\s*\\(', regex: true },
      { label: 'Does not loop over every page up front', type: 'mustNotContain', pattern: '\\bwhile\\s*\\(|\\bfor\\s*\\(|new\\s+ArrayList\\b', regex: true },
    ],
  },
  {
    id: 'java-build-staff-role-enumset-grants',
    number: 69,
    language: 'java',
    kind: 'build',
    title: 'Staff Role EnumSet Grants',
    difficulty: 'Easy',
    topic: 'Security',
    statement:
      'A restaurant back office maps staff roles to permissions. In `StaffAccess`:\n\n- Give each `Role` its permissions as an `EnumSet<Permission>` (build them with `EnumSet.of`, `EnumSet.allOf`, `EnumSet.range` or `EnumSet.noneOf`):\n  - `WAITER`: `READ_ORDERS`\n  - `MANAGER`: `READ_ORDERS`, `REFUND`, `EDIT_MENU`\n  - `OWNER`: every permission\n- `permissions()` must not let a caller change the role: return a copy (`EnumSet.copyOf(...)`, `clone()`, `Set.copyOf(...)`) or a read-only view (`Collections.unmodifiableSet(...)`), never the internal mutable set itself.\n- `canPerform(roles, required)` returns true when the union of the roles\' permissions contains **every** required permission (`containsAll` on the union, or `allMatch` over `required`). An empty `required` set is always allowed; an empty `roles` set grants nothing.',
    functionSignature: 'public static boolean canPerform(Set<Role> roles, Set<Permission> required)',
    buggyCode: `public class StaffAccess {
    public enum Permission { READ_ORDERS, REFUND, EDIT_MENU, MANAGE_STAFF }

    public enum Role {
        WAITER, MANAGER, OWNER;

        // TODO: give each role its permissions as an EnumSet

        /** The permissions of this role; callers must not be able to change the role through it. */
        public Set<Permission> permissions() {
            return Set.of();
        }
    }

    /** True when the roles together grant every required permission. */
    public static boolean canPerform(Set<Role> roles, Set<Permission> required) {
        // TODO
        return false;
    }
}
`,
    solution: `public class StaffAccess {
    public enum Permission { READ_ORDERS, REFUND, EDIT_MENU, MANAGE_STAFF }

    public enum Role {
        WAITER(EnumSet.of(Permission.READ_ORDERS)),
        MANAGER(EnumSet.of(Permission.READ_ORDERS, Permission.REFUND, Permission.EDIT_MENU)),
        OWNER(EnumSet.allOf(Permission.class));

        private final EnumSet<Permission> granted;

        Role(EnumSet<Permission> granted) {
            this.granted = granted;
        }

        /** The permissions of this role; callers must not be able to change the role through it. */
        public Set<Permission> permissions() {
            return EnumSet.copyOf(granted);
        }
    }

    /** True when the roles together grant every required permission. */
    public static boolean canPerform(Set<Role> roles, Set<Permission> required) {
        EnumSet<Permission> held = EnumSet.noneOf(Permission.class);
        for (Role role : roles) {
            held.addAll(role.permissions());
        }
        return held.containsAll(required);
    }
}
`,
    hint: 'Start from EnumSet.noneOf(Permission.class), addAll each role\'s permissions, then one containsAll answers the question.',
    explanation:
      'EnumSet is a bit vector behind the Set interface: for an enum with up to 64 constants it is a single long, so add, contains, addAll and containsAll are a handful of bitwise operations, and you get that speed without hand-written masks and shifts. It is also mutable, which is the trap: an enum constant is a process-wide singleton, so handing out its internal EnumSet lets any caller grant MANAGE_STAFF to every waiter with one add(). Returning a copy or an unmodifiable view keeps the role definitions read-only. The check itself is a union followed by containsAll, O(roles) with tiny constants; containsAll on an empty required set is true, which gives the "nothing required" case for free.',
    rules: [
      { label: 'Builds the permission sets with EnumSet', type: 'mustContain', pattern: 'EnumSet\\s*\\.\\s*(of|allOf|range|noneOf|complementOf)\\s*\\(', regex: true },
      { label: 'permissions() hands out a copy or a read-only view', type: 'mustContain', pattern: 'EnumSet\\s*\\.\\s*copyOf\\s*\\(|unmodifiableSet\\s*\\(|Set\\s*\\.\\s*copyOf\\s*\\(|\\.\\s*clone\\s*\\(', regex: true },
      { label: 'Checks that every required permission is granted', type: 'mustContain', pattern: '\\.\\s*containsAll\\s*\\(|\\.\\s*allMatch\\s*\\(', regex: true },
      { label: 'No longer returns the empty placeholder set', type: 'mustNotContain', pattern: 'return\\s+Set\\s*\\.\\s*of\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-lease-renewal-ticker',
    number: 70,
    language: 'java',
    kind: 'build',
    title: 'Lease Renewal Ticker',
    difficulty: 'Medium',
    topic: 'Scheduling',
    statement:
      'A worker holds a distributed lock that must be renewed periodically or it expires. Implement `LeaseRenewer` on the given `ScheduledExecutorService`:\n\n- `start(renew, periodMillis)`: throw `IllegalStateException` if it was already started. Otherwise schedule a periodic task with `scheduleAtFixedRate` (or `scheduleWithFixedDelay`), with both the initial delay and the period equal to `periodMillis` in `TimeUnit.MILLISECONDS`, and keep the returned `ScheduledFuture` in `task`.\n- A periodic task that throws is **cancelled silently and never runs again**, so the scheduled task must call `renew.run()` inside a `try`/`catch` for `RuntimeException` (or broader) and count the failure in `failures` instead of letting it escape.\n- `close()`: cancel the task if there is one and shut the scheduler down (`shutdown()` or `shutdownNow()`), so its thread does not keep the JVM alive.\n\nNo `Thread.sleep` loops, no `new Thread`, no `java.util.Timer`.',
    functionSignature: 'public synchronized void start(Runnable renew, long periodMillis)',
    buggyCode: `public class LeaseRenewer implements AutoCloseable {
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicInteger failures = new AtomicInteger();
    private ScheduledFuture<?> task;

    /** Runs renew every periodMillis, first after one full period. */
    public synchronized void start(Runnable renew, long periodMillis) {
        // TODO: schedule periodically; a renewal that throws must not stop later ticks
    }

    /** Number of renewals that threw. */
    public int failures() {
        return failures.get();
    }

    /** Stops ticking and releases the scheduler thread. */
    @Override
    public synchronized void close() {
        // TODO
    }
}
`,
    solution: `public class LeaseRenewer implements AutoCloseable {
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicInteger failures = new AtomicInteger();
    private ScheduledFuture<?> task;

    /** Runs renew every periodMillis, first after one full period. */
    public synchronized void start(Runnable renew, long periodMillis) {
        if (task != null) {
            throw new IllegalStateException("already started");
        }
        task = scheduler.scheduleAtFixedRate(() -> {
            try {
                renew.run();
            } catch (RuntimeException e) {
                failures.incrementAndGet();
            }
        }, periodMillis, periodMillis, TimeUnit.MILLISECONDS);
    }

    /** Number of renewals that threw. */
    public int failures() {
        return failures.get();
    }

    /** Stops ticking and releases the scheduler thread. */
    @Override
    public synchronized void close() {
        if (task != null) {
            task.cancel(false);
        }
        scheduler.shutdown();
    }
}
`,
    hint: 'Do not hand renew to the scheduler directly: wrap it in a lambda that catches what it throws. Remember that the executor owns a non-daemon thread.',
    explanation:
      'ScheduledExecutorService has one sharp edge that bites almost everyone once: if any execution of a periodic task throws, all subsequent executions are suppressed, and nothing is logged unless someone inspects the future. For a lease renewer that means one transient network error ends renewals forever and the lock quietly expires. Catching inside the task keeps the schedule alive and makes failures countable. The other half is lifecycle: the executor thread is non-daemon, so a renewer that is never shut down prevents the JVM from exiting, which is why the class is AutoCloseable and close() shuts the scheduler down. scheduleAtFixedRate keeps a steady cadence; scheduleWithFixedDelay measures from the end of the previous run. Both are fine for a short renewal call.',
    rules: [
      { label: 'Schedules the renewal periodically on the executor', type: 'mustContain', pattern: '\\.\\s*(scheduleAtFixedRate|scheduleWithFixedDelay)\\s*\\(', regex: true },
      { label: 'Catches a failing renewal inside the task so later ticks still run', type: 'mustContain', pattern: 'catch\\s*\\(\\s*(final\\s+)?(RuntimeException|Exception|Throwable)\\s+\\w+\\s*\\)', regex: true },
      { label: 'Refuses a second start with IllegalStateException', type: 'mustContain', pattern: 'throw\\s+new\\s+IllegalStateException\\s*\\(', regex: true },
      { label: 'close() shuts the scheduler down', type: 'mustContain', pattern: '\\.\\s*shutdown(Now)?\\s*\\(\\s*\\)', regex: true },
      { label: 'No sleep loops, raw threads or java.util.Timer', type: 'mustNotContain', pattern: 'Thread\\s*\\.\\s*sleep|new\\s+Timer\\b|new\\s+Thread\\b', regex: true },
    ],
  },
  {
    id: 'java-build-studio-booking-overlap-check',
    number: 71,
    language: 'java',
    kind: 'build',
    title: 'Studio Booking Overlap Check',
    difficulty: 'Hard',
    topic: 'Scheduling',
    statement:
      'A rehearsal studio stores its bookings in a `TreeMap<Integer, Integer>` from start minute to end minute. Intervals are half-open, `[start, end)`, so a booking that ends at 600 and one that starts at 600 do **not** overlap. Stored bookings never overlap each other.\n\nImplement `book(int start, int end)`:\n\n- Throw `IllegalArgumentException` when `start >= end`.\n- Return `false` (and store nothing) when the new interval overlaps an existing booking; otherwise `put(start, end)` and return `true`.\n- Run in **O(log n)**: because the stored bookings are disjoint and sorted, only the neighbours of the new interval can collide. Find them with the TreeMap navigation methods (`floorEntry`/`lowerEntry` for the booking that starts before, `ceilingEntry`/`ceilingKey`/`higherEntry` for the one that starts after; a single `lowerEntry(end)` also works).\n- Do not loop or stream over the bookings.\n\nExample: after booking `[540, 600)`, `book(600, 660)` is true, `book(590, 610)` is false, `book(500, 541)` is false and `book(480, 540)` is true.',
    functionSignature: 'public boolean book(int start, int end)',
    buggyCode: `public class StudioCalendar {
    // start minute -> end minute (exclusive); stored bookings never overlap
    private final TreeMap<Integer, Integer> bookings = new TreeMap<>();

    /** Books [start, end) when it overlaps no existing booking; returns whether it was booked. */
    public boolean book(int start, int end) {
        // TODO: look only at the neighbouring bookings, never at all of them
        return false;
    }

    public int count() {
        return bookings.size();
    }
}
`,
    solution: `public class StudioCalendar {
    // start minute -> end minute (exclusive); stored bookings never overlap
    private final TreeMap<Integer, Integer> bookings = new TreeMap<>();

    /** Books [start, end) when it overlaps no existing booking; returns whether it was booked. */
    public boolean book(int start, int end) {
        if (start >= end) {
            throw new IllegalArgumentException("start must be before end");
        }
        Map.Entry<Integer, Integer> before = bookings.floorEntry(start);
        if (before != null && before.getValue() > start) {
            return false;
        }
        Integer nextStart = bookings.ceilingKey(start);
        if (nextStart != null && nextStart < end) {
            return false;
        }
        bookings.put(start, end);
        return true;
    }

    public int count() {
        return bookings.size();
    }
}
`,
    hint: 'The booking that starts at or before your start collides if its end is after your start. The next booking collides if it starts before your end.',
    explanation:
      'Two half-open intervals [a, b) and [c, d) overlap exactly when a < d and c < b. Checking that against every booking is O(n) per insert. The invariant that stored bookings are disjoint makes almost all of those checks unnecessary: sorted by start, their ends are sorted too, so the only candidates are the booking that starts at or before the new start (floorEntry) and the first one that starts at or after it (ceilingEntry). The first collides if its end is greater than the new start; the second collides if its start is less than the new end. A TreeMap answers both lookups in O(log n). The strict comparisons are what make back-to-back bookings legal; using <= or >= there would reject a session that starts the minute another ends.',
    rules: [
      { label: 'Finds the neighbouring bookings with the TreeMap navigation methods', type: 'mustContain', pattern: '\\.\\s*(floor|lower|ceiling|higher)(Entry|Key)\\s*\\(|\\.\\s*(headMap|tailMap|subMap)\\s*\\(', regex: true },
      { label: 'Stores an accepted booking', type: 'mustContain', pattern: '\\.\\s*put\\s*\\(', regex: true },
      { label: 'Rejects an empty or reversed interval with IllegalArgumentException', type: 'mustContain', pattern: 'throw\\s+new\\s+IllegalArgumentException\\s*\\(', regex: true },
      { label: 'Does not scan every booking', type: 'mustNotContain', pattern: '\\bfor\\s*\\(|\\bwhile\\s*\\(|\\.\\s*forEach\\s*\\(|\\.\\s*stream\\s*\\(|entrySet\\s*\\(\\s*\\)|\\.\\s*values\\s*\\(\\s*\\)|keySet\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-build-transaction-template-rollback',
    number: 72,
    language: 'java',
    kind: 'build',
    title: 'Transaction Template Rollback',
    difficulty: 'Hard',
    topic: 'Persistence Patterns',
    statement:
      'Every repository method repeats the same begin/commit/rollback dance, and half of them get the failure path wrong. Centralise it in `TxTemplate.inTransaction(Supplier<R> work)`:\n\n1. Call `tx.begin()`.\n2. Run `work.get()`, then `tx.commit()`, and return the result.\n3. If the work **or the commit** throws a `RuntimeException`, call `tx.rollback()` and then **rethrow the original exception** (the same object, not a wrapper).\n4. If `rollback()` itself throws, it must not replace the original failure: catch it and attach it with `original.addSuppressed(rollbackFailure)`, then still throw the original.\n\nNever roll back after a successful commit, and never swallow the failure.',
    functionSignature: 'public <R> R inTransaction(Supplier<R> work)',
    buggyCode: `public class TxTemplate {
    public interface Tx {
        void begin();
        void commit();
        void rollback();
    }

    private final Tx tx;

    public TxTemplate(Tx tx) {
        this.tx = tx;
    }

    /** Runs work inside one transaction and returns its result. */
    public <R> R inTransaction(Supplier<R> work) {
        // TODO: begin, commit on success, roll back and rethrow on failure
        return work.get();
    }
}
`,
    solution: `public class TxTemplate {
    public interface Tx {
        void begin();
        void commit();
        void rollback();
    }

    private final Tx tx;

    public TxTemplate(Tx tx) {
        this.tx = tx;
    }

    /** Runs work inside one transaction and returns its result. */
    public <R> R inTransaction(Supplier<R> work) {
        tx.begin();
        try {
            R result = work.get();
            tx.commit();
            return result;
        } catch (RuntimeException failure) {
            try {
                tx.rollback();
            } catch (RuntimeException rollbackFailure) {
                failure.addSuppressed(rollbackFailure);
            }
            throw failure;
        }
    }
}
`,
    hint: 'Put the commit inside the try, right after the work. The rollback needs its own small try/catch inside the catch block.',
    explanation:
      'The template method keeps transaction demarcation in one place so business code only supplies the work. The success path is begin, work, commit. On failure the transaction must be rolled back and the caller must see the exception that actually caused the problem. The subtle part is the failure of the cleanup: if the connection has died, rollback() throws too, and a naive catch block lets that second exception replace the first, so the log shows "rollback failed" and the root cause is gone. Throwable.addSuppressed exists for exactly this (try-with-resources uses it for close() failures): the original stays the primary exception and the rollback failure travels with it. Putting commit inside the try means a failed commit is also rolled back.',
    rules: [
      { label: 'Begins the transaction, then commits after the work', type: 'mustContain', pattern: '\\.\\s*begin\\s*\\(\\s*\\)[\\s\\S]*\\.\\s*commit\\s*\\(\\s*\\)', regex: true },
      { label: 'Rolls back when the work fails', type: 'mustContain', pattern: '\\.\\s*rollback\\s*\\(\\s*\\)', regex: true },
      { label: 'Rethrows the original exception', type: 'mustContain', pattern: 'throw\\s+\\w+\\s*;', regex: true },
      { label: 'A failing rollback is attached with addSuppressed instead of hiding the original error', type: 'mustContain', pattern: '\\.\\s*addSuppressed\\s*\\(', regex: true },
      { label: 'Never swallows the failure', type: 'mustNotContain', pattern: 'printStackTrace|catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}', regex: true },
    ],
  },
  {
    id: 'java-build-partition-high-water-marks',
    number: 73,
    language: 'java',
    kind: 'build',
    title: 'Partition High-Water Marks',
    difficulty: 'Easy',
    topic: 'Messaging',
    statement:
      'Consumer threads acknowledge message offsets out of order, and the tracker must remember, per partition, the **highest** offset acknowledged so far. Rebuild `OffsetTracker`:\n\n- Store the marks in a `ConcurrentHashMap<Integer, Long>` (not a plain `HashMap`).\n- `ack(partition, offset)` updates the mark in **one atomic call**: `merge(partition, offset, Math::max)` (or an equivalent `compute`). A late ack with a lower offset must leave the mark where it is. A separate read followed by `put` is not atomic and is not accepted.\n- `resumeFrom(partition)` returns the highest acked offset plus 1, or `0` for a partition with no acks.',
    functionSignature: 'public void ack(int partition, long offset)',
    buggyCode: `public class OffsetTracker {
    // TODO: acks arrive from many consumer threads
    private final Map<Integer, Long> committed = new HashMap<>();

    /** Remembers the highest offset acknowledged for the partition. */
    public void ack(int partition, long offset) {
        // TODO: one atomic update; a late, lower ack must not move the mark backwards
        committed.put(partition, offset);
    }

    /** Next offset to read: highest acked + 1, or 0 when nothing was acked yet. */
    public long resumeFrom(int partition) {
        // TODO
        return 0L;
    }
}
`,
    solution: `public class OffsetTracker {
    private final ConcurrentHashMap<Integer, Long> committed = new ConcurrentHashMap<>();

    /** Remembers the highest offset acknowledged for the partition. */
    public void ack(int partition, long offset) {
        committed.merge(partition, offset, Math::max);
    }

    /** Next offset to read: highest acked + 1, or 0 when nothing was acked yet. */
    public long resumeFrom(int partition) {
        Long highest = committed.get(partition);
        return highest == null ? 0L : highest + 1;
    }
}
`,
    hint: 'Map.merge takes the key, the new value and a function that combines the old and new values; when the key is absent it simply stores the new value.',
    explanation:
      'With a plain put, a slow thread acknowledging offset 41 after another thread acknowledged 57 moves the mark backwards, and after a restart sixteen messages are processed again. Reading the current value, comparing and then putting does not help under concurrency: two threads can both read the old value and the lower one can write last. ConcurrentHashMap.merge performs the read, the combination and the write atomically for that key, and Math::max as the remapping function makes the mark monotonic. When the key is missing, merge stores the given value without calling the function, so the first ack needs no special case. Both methods are O(1).',
    rules: [
      { label: 'Stores the marks in a concurrent map', type: 'mustContain', pattern: '\\bConcurrent(Hash|SkipList)?Map\\b', regex: true },
      { label: 'Updates the mark with one atomic merge or compute', type: 'mustContain', pattern: '\\.\\s*(merge|compute)\\s*\\(', regex: true },
      { label: 'Keeps the larger offset so a late ack cannot move the mark backwards', type: 'mustContain', pattern: '(Math|Long)\\s*(::|\\.)\\s*max\\b|\\?[^;:]*:', regex: true },
      { label: 'resumeFrom handles a partition that was never acked', type: 'mustContain', pattern: 'getOrDefault\\s*\\(|[=!]=\\s*null|ofNullable\\s*\\(|containsKey\\s*\\(', regex: true },
      { label: 'No plain HashMap for shared state', type: 'mustNotContain', pattern: 'new\\s+HashMap\\b', regex: true },
    ],
  },
  {
    id: 'java-build-queue-url-pattern-parser',
    number: 74,
    language: 'java',
    kind: 'build',
    title: 'Queue URL Pattern Parser',
    difficulty: 'Medium',
    topic: 'Validation & Config',
    statement:
      'A worker reads its broker address from configuration as `amqp://host:port/queue`. Implement `parse(String url)` in `QueueUrl` with a regular expression:\n\n- Compile the expression **once** into a `private static final Pattern` constant (not on every call).\n- The **whole** string must fit the shape, so use `matcher.matches()` (or anchor the pattern with `^` and `$`):\n  - scheme: `amqp` or `amqps`\n  - `://`\n  - host: one or more of letters, digits, `.` and `-`\n  - `:` and a port of 1 to 5 digits\n  - `/` and a queue name of one or more letters, digits, `_`, `.` and `-`\n- Read the parts with capturing groups (named or numbered) via `group(...)`.\n- The port must be between 1 and 65535 inclusive.\n- Return `Optional.of(new Target(scheme, host, port, queue))`, or `Optional.empty()` for `null`, for text that does not match, or for a port out of range.\n\nNo manual `split`, `indexOf` or `substring` parsing.',
    functionSignature: 'public static Optional<Target> parse(String url)',
    buggyCode: `public class QueueUrl {
    public record Target(String scheme, String host, int port, String queue) {}

    // TODO: compile the pattern once, as a constant

    /** Parses amqp://host:port/queue (or amqps://...); empty when the text is not exactly that shape. */
    public static Optional<Target> parse(String url) {
        // TODO
        return Optional.empty();
    }
}
`,
    solution: `public class QueueUrl {
    public record Target(String scheme, String host, int port, String queue) {}

    private static final Pattern URL = Pattern.compile(
        "(?<scheme>amqps?)://(?<host>[A-Za-z0-9.-]+):(?<port>\\\\d{1,5})/(?<queue>[A-Za-z0-9_.-]+)");

    /** Parses amqp://host:port/queue (or amqps://...); empty when the text is not exactly that shape. */
    public static Optional<Target> parse(String url) {
        if (url == null) {
            return Optional.empty();
        }
        Matcher m = URL.matcher(url);
        if (!m.matches()) {
            return Optional.empty();
        }
        int port = Integer.parseInt(m.group("port"));
        if (port < 1 || port > 65535) {
            return Optional.empty();
        }
        return Optional.of(new Target(m.group("scheme"), m.group("host"), port, m.group("queue")));
    }
}
`,
    hint: 'matches() succeeds only if the entire input fits the pattern; find() is happy with a fragment in the middle. Five digits can still be 70000, so check the number after parsing it.',
    explanation:
      'Pattern.compile parses the expression and builds a matcher program; doing it per call wastes that work, while a static final Pattern is immutable, thread-safe and shared. matches() versus find() is the classic validation bug: find() accepts "xx amqp://h:1/q; rm -rf" because a valid fragment appears somewhere inside, whereas matches() (or explicit ^...$ anchors) requires the whole input to conform. Capturing groups then hand you the validated pieces, and named groups keep the code readable when the pattern changes. A regex checks shape, not meaning: \\d{1,5} still admits 0 and 99999, so the numeric range is checked after Integer.parseInt. Returning Optional keeps "not a valid URL" out of the exception path. Matching is linear in the input length for this pattern.',
    rules: [
      { label: 'Compiles the pattern once into a static final constant', type: 'mustContain', pattern: '(static\\s+final|final\\s+static)\\s+Pattern\\s+\\w+\\s*=\\s*Pattern\\s*\\.\\s*compile\\s*\\(', regex: true },
      { label: 'Requires the whole string to match', type: 'mustContain', pattern: '\\.\\s*matches\\s*\\(\\s*\\)|"\\^[^\\n]*\\$"', regex: true },
      { label: 'Reads the parts through capturing groups', type: 'mustContain', pattern: '\\.\\s*group\\s*\\(', regex: true },
      { label: 'Rejects ports outside 1 to 65535', type: 'mustContain', pattern: '65_?535|65_?536|0[xX][fF]{4}', regex: true },
      { label: 'Parses with the regex, not by slicing the string', type: 'mustNotContain', pattern: '\\.\\s*split\\s*\\(|indexOf\\s*\\(|substring\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-build-opaque-api-key-minting',
    number: 75,
    language: 'java',
    kind: 'build',
    title: 'Opaque API Key Minting',
    difficulty: 'Easy',
    topic: 'Security',
    statement:
      'The developer portal issues API keys such as `live_3q2-7wX...`. The current code derives the key from the clock, which is guessable. Implement both methods of `ApiKeys`:\n\n`mint(prefix)`\n- Throw `IllegalArgumentException` when `prefix` is null or blank.\n- Fill a 32-byte array from the given `SecureRandom` with `RANDOM.nextBytes(...)`.\n- Encode the bytes as **URL-safe Base64 without padding**: `Base64.getUrlEncoder().withoutPadding()`.\n- Return `prefix + "_" + encoded`.\n\n`redact(key)` (what is safe to log)\n- Return `"****"` followed by the last 4 characters of the key.\n- For keys shorter than 8 characters return just `"****"`.\n\nNo `java.util.Random`, `Math.random()`, `ThreadLocalRandom` or clock values in the key.',
    functionSignature: 'public static String mint(String prefix)',
    buggyCode: `import java.security.SecureRandom;

public class ApiKeys {
    private static final SecureRandom RANDOM = new SecureRandom();

    /** A new key: prefix, an underscore, then 32 random bytes as unpadded URL-safe Base64. */
    public static String mint(String prefix) {
        // TODO
        return prefix + "_" + System.nanoTime();
    }

    /** What may appear in logs: four asterisks plus the last 4 characters of the key. */
    public static String redact(String key) {
        // TODO
        return key;
    }
}
`,
    solution: `import java.security.SecureRandom;

public class ApiKeys {
    private static final SecureRandom RANDOM = new SecureRandom();

    /** A new key: prefix, an underscore, then 32 random bytes as unpadded URL-safe Base64. */
    public static String mint(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            throw new IllegalArgumentException("prefix is required");
        }
        byte[] secret = new byte[32];
        RANDOM.nextBytes(secret);
        return prefix + "_" + Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
    }

    /** What may appear in logs: four asterisks plus the last 4 characters of the key. */
    public static String redact(String key) {
        if (key.length() < 8) {
            return "****";
        }
        return "****" + key.substring(key.length() - 4);
    }
}
`,
    hint: 'SecureRandom fills a byte array you give it. Base64 has several encoders; the URL one swaps + and / for - and _, and withoutPadding drops the trailing = signs.',
    explanation:
      'An API key is a bearer secret, so its only real property is unpredictability. java.util.Random and anything derived from the clock are predictable from a few outputs or a rough idea of when the key was made; SecureRandom draws from the operating system\'s cryptographic generator, and 32 bytes give 256 bits of entropy. The encoding matters for where keys travel: the standard Base64 alphabet contains + and /, and the = padding, all of which get mangled in URLs, headers and shell commands, so the URL-safe alphabet without padding is the usual choice. On the logging side, printing a full key puts a credential into every log aggregator; showing only the last four characters is enough for a human to recognise which key was used.',
    rules: [
      { label: 'Draws the key bytes from SecureRandom with nextBytes', type: 'mustContain', pattern: '\\.\\s*nextBytes\\s*\\(', regex: true },
      { label: 'Encodes with the unpadded URL-safe Base64 encoder', type: 'mustContain', pattern: 'getUrlEncoder\\s*\\(\\s*\\)\\s*\\.\\s*withoutPadding\\s*\\(\\s*\\)', regex: true },
      { label: 'redact keeps only the last four characters', type: 'mustContain', pattern: 'substring\\s*\\(|subSequence\\s*\\(|charAt\\s*\\(', regex: true },
      { label: 'No predictable source of randomness', type: 'mustNotContain', pattern: 'new\\s+Random\\s*\\(|Math\\s*\\.\\s*random|nanoTime|currentTimeMillis|ThreadLocalRandom', regex: true },
      { label: 'redact never returns the whole key', type: 'mustNotContain', pattern: 'return\\s+key\\s*;', regex: true },
    ],
  },
];
