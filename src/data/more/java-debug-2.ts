import type { BugFixProblem } from '../bugFixes';

// Java "fix the bug" problems 101-125. Rule-graded: every pattern below is a
// regex source written with String.raw so backslashes read as in a regex.
const re = String.raw;

export const problems: BugFixProblem[] = [
  {
    id: 'java-bigdecimal-equals-scale',
    number: 101,
    language: 'java',
    title: 'Paid in Full, Except for the Scale',
    difficulty: 'Easy',
    topic: 'Numbers',
    statement:
      '`isPaidInFull` should return true exactly when the amount paid is numerically equal to the amount due. `isPaidInFull(new BigDecimal("10.0"), new BigDecimal("10.00"))` returns false, so invoices paid through one gateway (which reports one decimal place) are never marked as settled. Keep the arithmetic in `BigDecimal`.',
    functionSignature: 'public static boolean isPaidInFull(BigDecimal paid, BigDecimal due)',
    buggyCode: `public static boolean isPaidInFull(BigDecimal paid, BigDecimal due) {
    return paid.equals(due);
}
`,
    hint: 'A BigDecimal is an unscaled value plus a scale. One of its comparison methods looks at both, the other only at the number.',
    explanation:
      '`BigDecimal.equals` is true only when the value AND the scale match, so 10.0 (scale 1) and 10.00 (scale 2) are different objects to it. `compareTo` compares the numbers themselves and returns 0 for both. Use `paid.compareTo(due) == 0`. Equivalent ideas: `paid.subtract(due).signum() == 0`, or strip trailing zeros from both sides before calling `equals`. Dropping to `double` to compare would bring back the rounding errors BigDecimal exists to avoid. The same trap makes 10.0 and 10.00 two different keys in a HashSet but one key in a TreeSet.',
    rules: [
      { label: 'Compares numeric value, ignoring scale (compareTo, signum of the difference, or stripTrailingZeros)', type: 'mustContain', pattern: re`compareTo\s*\(|stripTrailingZeros\s*\(|signum\s*\(`, regex: true },
      { label: 'No longer calls equals directly on the two raw amounts', type: 'mustNotContain', pattern: re`\b(paid|due)\.equals\s*\(\s*(paid|due)\s*\)`, regex: true },
      { label: 'Tests for equality, not for "at least"', type: 'mustContain', pattern: re`==\s*0|0\s*==|\.equals\s*\(`, regex: true },
      { label: 'Does not convert the amounts to double or float', type: 'mustNotContain', pattern: re`doubleValue|floatValue`, regex: true },
    ],
  },
  {
    id: 'java-bigdecimal-divide-nonterminating',
    number: 102,
    language: 'java',
    title: 'Splitting a Bill Three Ways',
    difficulty: 'Medium',
    topic: 'Numbers',
    statement:
      '`perPerson` should return each person\'s share of `total`, rounded to 2 decimal places with halves rounded up (`RoundingMode.HALF_UP`). `people` is always at least 1. `perPerson(new BigDecimal("100.00"), 4)` works, but `perPerson(new BigDecimal("100.00"), 3)` should return `33.33` and instead throws `ArithmeticException: Non-terminating decimal expansion; no exact representable decimal result`. Keep the arithmetic in `BigDecimal`.',
    functionSignature: 'public static BigDecimal perPerson(BigDecimal total, int people)',
    buggyCode: `public static BigDecimal perPerson(BigDecimal total, int people) {
    return total.divide(BigDecimal.valueOf(people));
}
`,
    hint: 'One-argument divide promises an exact answer. One third has no exact decimal form, so you have to say how many digits you want and how to round.',
    explanation:
      '`divide(BigDecimal)` must return the exact quotient and throws when the expansion never ends (1/3, 1/7, ...). It only appears to work in tests that happen to divide evenly. Give it a scale and a rounding mode: `total.divide(BigDecimal.valueOf(people), 2, RoundingMode.HALF_UP)`. The two-argument form `divide(x, RoundingMode.HALF_UP)` is not enough: it keeps the scale of `total`, so a total of `100` would give `33`. Converting to `double` avoids the exception but reintroduces binary rounding error into money.',
    rules: [
      { label: 'Rounds with RoundingMode.HALF_UP', type: 'mustContain', pattern: 'HALF_UP' },
      { label: 'Fixes the result at 2 decimal places (divide(x, 2, mode) or setScale(2, mode))', type: 'mustContain', pattern: re`\.divide\s*\([^;]*,\s*2\s*,|setScale\s*\(\s*2\s*,`, regex: true },
      { label: 'No longer uses the exact one-argument divide', type: 'mustNotContain', pattern: re`\.divide\s*\(\s*(BigDecimal\.valueOf\s*\(\s*\w+\s*\)|new\s+BigDecimal\s*\(\s*\w+\s*\)|\w+)\s*\)`, regex: true },
      { label: 'Stays in BigDecimal (no double arithmetic)', type: 'mustNotContain', pattern: re`doubleValue|\bdouble\s+\w+\s*=`, regex: true },
    ],
  },
  {
    id: 'java-int-multiply-before-widening',
    number: 103,
    language: 'java',
    title: 'Thirty Days in Negative Milliseconds',
    difficulty: 'Easy',
    topic: 'Overflow',
    statement:
      '`daysToMillis` converts a number of days to milliseconds and must be correct for every non-negative `int`. The return type is already `long`, yet `daysToMillis(30)` returns `-1702967296` instead of `2592000000`, so 30-day sessions expire immediately.',
    functionSignature: 'public static long daysToMillis(int days)',
    buggyCode: `public static long daysToMillis(int days) {
    return days * 24 * 60 * 60 * 1000;
}
`,
    hint: 'The type of the variable you assign to does not affect how the right-hand side is computed. What are the operand types of each multiplication, left to right?',
    explanation:
      'Every operand is an `int`, so the whole product is computed in 32-bit arithmetic and wraps around; only the already-wrong result is widened to `long`. Make the FIRST multiplication a long one so everything after it is too: `(long) days * 24 * 60 * 60 * 1000`, `days * 24L * 60 * 60 * 1000`, `days * 86_400_000L`, or `TimeUnit.DAYS.toMillis(days)`. Two near-misses: `(long) (days * 24 * 60 * 60 * 1000)` casts after the overflow has happened, and `days * 24 * 60 * 60 * 1000L` still multiplies `days * 24 * 60 * 60` in `int` first, which overflows once `days` passes 24,855.',
    rules: [
      { label: 'Widens to long before multiplying (long literal, (long) cast, long variable, or TimeUnit/Duration)', type: 'mustContain', pattern: re`\d[\d_]*[lL]\b|\(\s*long\s*\)|\blong\s+\w+\s*=\s*days\s*;|TimeUnit\.DAYS|Duration\.ofDays`, regex: true },
      { label: 'Does not start the product with an int-by-int multiplication of days', type: 'mustNotContain', pattern: re`(return|=|\()\s*days\s*\*\s*\d[\d_]*\s*\*`, regex: true },
      { label: 'Keeps the signature long daysToMillis(int days)', type: 'mustContain', pattern: re`long\s+daysToMillis\s*\(\s*(final\s+)?int\s+days\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-hashcode-negative-bucket',
    number: 104,
    language: 'java',
    title: 'Bucket Index Goes Negative',
    difficulty: 'Medium',
    topic: 'Overflow',
    statement:
      '`bucketFor` picks which of `buckets` shards a key lives in and must return an index in the range 0 to `buckets - 1` for every non-null key (`buckets` is positive). `bucketFor("order-1042", 16)` returns 12, but `bucketFor("user-77", 16)` returns -14 and the caller crashes with `ArrayIndexOutOfBoundsException`.',
    functionSignature: 'public static int bucketFor(String key, int buckets)',
    buggyCode: `public static int bucketFor(String key, int buckets) {
    return key.hashCode() % buckets;
}
`,
    hint: 'hashCode() can be any int, including negative ones, and in Java the sign of a % b follows a. Also check what Math.abs does to the single most negative int.',
    explanation:
      'About half of all hash codes are negative, and Java\'s `%` keeps the sign of the left operand, so the "index" is negative for those keys. `Math.floorMod(key.hashCode(), buckets)` always returns a value in `[0, buckets)`. Equivalent fixes: clear the sign bit first with `(key.hashCode() & 0x7fffffff) % buckets`, or add `buckets` back when the remainder is negative. The tempting `Math.abs(key.hashCode()) % buckets` is still wrong: `Math.abs(Integer.MIN_VALUE)` is `Integer.MIN_VALUE`, and real strings hash to it (for example "polygenelubricants"), so the crash just becomes rarer.',
    rules: [
      { label: 'Produces a non-negative remainder (floorMod, sign-bit mask, or adding buckets back when negative)', type: 'mustContain', pattern: re`Math\.floorMod\s*\(|&\s*(0x7[fF]{7}|Integer\.MAX_VALUE)|\+\s*\w+\s*\)\s*%|Math\.abs\s*\(\s*\w+(\.hashCode\s*\(\s*\))?\s*%\s*\w+\s*\)|<\s*0`, regex: true },
      { label: 'Does not take Math.abs of the raw hash (still negative for Integer.MIN_VALUE)', type: 'mustNotContain', pattern: re`Math\.abs\s*\(\s*\w+(\.hashCode\s*\(\s*\))?\s*\)\s*%`, regex: true },
      { label: 'No longer returns the raw signed remainder', type: 'mustNotContain', pattern: re`return\s+\w+\.hashCode\s*\(\s*\)\s*%\s*\w+\s*;`, regex: true },
      { label: 'Still derives the bucket from the key\'s hashCode', type: 'mustContain', pattern: re`hashCode\s*\(\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-optional-of-null',
    number: 105,
    language: 'java',
    title: 'Optional.of Meets a Missing Key',
    difficulty: 'Easy',
    topic: 'Optional',
    statement:
      '`nicknameOf` should return the user\'s nickname wrapped in an `Optional`, or an empty `Optional` when the map has no entry for `userId` (the map never stores null values). It works for users who have a nickname and throws `NullPointerException` for everyone else. It must never return null.',
    functionSignature: 'public static Optional<String> nicknameOf(Map<String, String> nicknames, String userId)',
    buggyCode: `public static Optional<String> nicknameOf(Map<String, String> nicknames, String userId) {
    return Optional.of(nicknames.get(userId));
}
`,
    hint: 'Optional has two factory methods for wrapping a value. One of them insists the value is not null.',
    explanation:
      '`Map.get` returns null for a missing key, and `Optional.of(null)` throws immediately: `of` is for values you know are present. `Optional.ofNullable(nicknames.get(userId))` turns null into `Optional.empty()` and wraps anything else. Spelling it out works too: look the value up, return `Optional.empty()` when it is null and `Optional.of(value)` otherwise. Substituting a default such as "" would return a non-empty Optional and hide the fact that the user has no nickname.',
    rules: [
      { label: 'Maps a missing nickname to an empty Optional (ofNullable or Optional.empty())', type: 'mustContain', pattern: re`Optional\.ofNullable\s*\(|Optional\.empty\s*\(\s*\)`, regex: true },
      { label: 'Still looks the user up in the map', type: 'mustContain', pattern: re`\.get\s*\(\s*userId\s*\)`, regex: true },
      { label: 'Never returns null', type: 'mustNotContain', pattern: re`return\s+null\s*;`, regex: true },
    ],
  },
  {
    id: 'java-stream-limit-before-sorted',
    number: 106,
    language: 'java',
    title: 'Top Three of the First Three',
    difficulty: 'Easy',
    topic: 'Streams',
    statement:
      '`topThree` should return the three highest scores, highest first (all of them, highest first, when there are fewer than three), without modifying the input list. `topThree(List.of(50, 90, 70, 100, 80))` should return `[100, 90, 80]` but returns `[90, 70, 50]`.',
    functionSignature: 'public static List<Integer> topThree(List<Integer> scores)',
    buggyCode: `public static List<Integer> topThree(List<Integer> scores) {
    return scores.stream()
        .limit(3)
        .sorted(Comparator.reverseOrder())
        .collect(Collectors.toList());
}
`,
    hint: 'Each stage of a pipeline only sees what the previous stage lets through. Which elements reach sorted()?',
    explanation:
      'Stream stages run in the order written. `limit(3)` passes on the first three elements in encounter order (50, 90, 70) and discards the rest, so `sorted` only reorders those three. Sort first and then truncate: `scores.stream().sorted(Comparator.reverseOrder()).limit(3)`. The same rule applies to `skip`, `filter` and `distinct`: their position relative to `sorted` and `limit` changes the answer, not just the speed. Sorting a copy of the list in descending order and taking `subList(0, min(3, size))` is an equivalent non-stream fix.',
    rules: [
      { label: 'Sorts before cutting down to three', type: 'mustContain', pattern: re`\.sorted\s*\([\s\S]*\.limit\s*\(\s*3\s*\)|\.sort\s*\([\s\S]*(\.subList\s*\(\s*0|\.limit\s*\(\s*3)`, regex: true },
      { label: 'No longer limits to three before sorting', type: 'mustNotContain', pattern: re`\.limit\s*\(\s*3\s*\)[\s\S]*\.sort(ed)?\s*\(`, regex: true },
      { label: 'Orders the scores highest first', type: 'mustContain', pattern: re`reverseOrder|reversed\s*\(|\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*->\s*(\2\s*-\s*\1|\2\.compareTo\s*\(\s*\1|Integer\.compare\s*\(\s*\2\s*,\s*\1)`, regex: true },
    ],
  },
  {
    id: 'java-record-unmodifiable-view',
    number: 107,
    language: 'java',
    title: 'The Record That Kept Changing',
    difficulty: 'Medium',
    topic: 'Encapsulation',
    statement:
      'A `Playlist` record is meant to be an immutable snapshot: once created, `tracks()` must never change and callers must not be able to modify it. The compact constructor wraps the list to block `playlist.tracks().add(...)`, and that part works. But after `List<String> draft = new ArrayList<>(List.of("Intro")); Playlist p = new Playlist("Road", draft); draft.add("Outro");` the call `p.tracks()` returns both tracks.',
    functionSignature: 'record Playlist(String name, List<String> tracks)',
    buggyCode: `record Playlist(String name, List<String> tracks) {
    Playlist {
        tracks = Collections.unmodifiableList(tracks);
    }
}
`,
    hint: 'An unmodifiable wrapper stops writes through the wrapper. Who else still holds a reference to the list underneath it?',
    explanation:
      '`Collections.unmodifiableList` returns a read-only VIEW of the list it is given: it rejects writes made through the view, but it shows every change made to the backing list, which the caller still owns. Immutability needs a private copy: `tracks = List.copyOf(tracks);` copies the elements into an unmodifiable list (and skips the copy when the argument is already an immutable list). `Collections.unmodifiableList(new ArrayList<>(tracks))` or `tracks.stream().toList()` do the same. A plain `new ArrayList<>(tracks)` detaches the record from the caller but lets anyone mutate it through the accessor.',
    rules: [
      { label: 'Stores an unmodifiable COPY of the incoming list', type: 'mustContain', pattern: re`List\.copyOf\s*\(\s*tracks\s*\)|unmodifiableList\s*\(\s*new\s+ArrayList<[^>]*>\s*\(\s*tracks\s*\)\s*\)|tracks\.stream\s*\(\s*\)\s*\.toList\s*\(\s*\)|toUnmodifiableList`, regex: true },
      { label: 'No longer wraps the caller\'s own list in a live view', type: 'mustNotContain', pattern: re`unmodifiableList\s*\(\s*tracks\s*\)`, regex: true },
      { label: 'Playlist is still a record of (String name, List<String> tracks)', type: 'mustContain', pattern: re`record\s+Playlist\s*\(\s*String\s+name\s*,\s*List<String>\s+tracks\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-toarray-object-cast',
    number: 108,
    language: 'java',
    title: 'Casting toArray to String[]',
    difficulty: 'Easy',
    topic: 'Collections',
    statement:
      '`toNameArray` should return the list\'s elements as a `String[]` in the same order. It compiles, but every call fails with `ClassCastException: class [Ljava.lang.Object; cannot be cast to class [Ljava.lang.String;`.',
    functionSignature: 'public static String[] toNameArray(List<String> names)',
    buggyCode: `public static String[] toNameArray(List<String> names) {
    return (String[]) names.toArray();
}
`,
    hint: 'Generics are erased at runtime, so the no-argument toArray() cannot know the element type. There is an overload that lets you tell it.',
    explanation:
      'Because of type erasure the list does not know it holds Strings, so `toArray()` always creates an `Object[]`. An `Object[]` that happens to contain Strings is still not a `String[]`, and the cast fails at runtime. Pass the array type in: `names.toArray(new String[0])` or `names.toArray(String[]::new)`. Both return a real `String[]`. Filling a `new String[names.size()]` in a loop also works. Changing the return type to `Object[]` only pushes the failed cast to the caller.',
    rules: [
      { label: 'Creates a real String[] (typed toArray overload, String[]::new, or a new String[size])', type: 'mustContain', pattern: re`toArray\s*\(\s*new\s+String\s*\[[^\]]*\]\s*\)|toArray\s*\(\s*String\s*\[\s*\]\s*::\s*new\s*\)|new\s+String\s*\[\s*\w+\.size\s*\(\s*\)\s*\]|String\s*\[\s*\]\s*\.class`, regex: true },
      { label: 'No longer casts the Object[] from the no-argument toArray()', type: 'mustNotContain', pattern: re`\(\s*String\s*\[\s*\]\s*\)\s*\w+\.toArray\s*\(\s*\)`, regex: true },
      { label: 'Still returns String[]', type: 'mustContain', pattern: re`String\s*\[\s*\]\s+toNameArray\s*\(`, regex: true },
    ],
  },
  {
    id: 'java-lock-unlock-not-in-finally',
    number: 109,
    language: 'java',
    title: 'One Exception Locks Everyone Out',
    difficulty: 'Medium',
    topic: 'Concurrency basics',
    statement:
      '`Inventory.remove` takes stock under a `ReentrantLock` and throws `IllegalArgumentException` when there is not enough. After the first such failure, every other thread that calls `remove` hangs forever. Keep the `ReentrantLock` and the exception, and make sure the lock is released on every way out of the method, including exceptions nobody anticipated.',
    functionSignature: 'class Inventory',
    buggyCode: `import java.util.concurrent.locks.ReentrantLock;

class Inventory {
    private final ReentrantLock lock = new ReentrantLock();
    private final Map<String, Integer> stock = new HashMap<>();

    void remove(String sku, int qty) {
        lock.lock();
        int have = stock.getOrDefault(sku, 0);
        if (qty > have) {
            throw new IllegalArgumentException("not enough stock for " + sku);
        }
        stock.put(sku, have - qty);
        lock.unlock();
    }
}
`,
    hint: 'Unlike a synchronized block, an explicit Lock is not released for you when an exception leaves the method. Which construct runs on every exit path?',
    explanation:
      'When the `throw` fires, control leaves `remove` before `lock.unlock()` runs. The failing thread still owns the lock, and since nothing will ever release it, every later `lock()` call blocks forever. The idiom for explicit locks is `lock.lock(); try { ... } finally { lock.unlock(); }`: the `finally` block runs on normal return and on any exception. Calling `unlock()` just before the `throw` fixes this one path but leaks again the moment another line in the critical section can throw (a NullPointerException from a null sku in a different map, for instance).',
    rules: [
      { label: 'Releases the lock in a finally block', type: 'mustContain', pattern: re`finally\s*\{[^}]*\.unlock\s*\(\s*\)`, regex: true },
      { label: 'Still acquires the ReentrantLock', type: 'mustContain', pattern: re`ReentrantLock[\s\S]*\.lock\s*\(\s*\)`, regex: true },
      { label: 'Still throws IllegalArgumentException when stock is short', type: 'mustContain', pattern: re`throw\s+new\s+IllegalArgumentException`, regex: true },
    ],
  },
  {
    id: 'java-instance-lock-static-state',
    number: 110,
    language: 'java',
    title: 'Synchronized, Yet Duplicate Tickets',
    difficulty: 'Hard',
    topic: 'Concurrency basics',
    statement:
      'Every request handler creates its own `TicketNumbers` object and calls `take()`. The counter is `static` so that numbers are unique across the whole JVM, and `take()` is `synchronized`, yet under load two handlers occasionally receive the same ticket number. Make `take()` safe when called on different instances at the same time; the counter must stay shared by all instances.',
    functionSignature: 'class TicketNumbers',
    buggyCode: `class TicketNumbers {
    private static long next = 1;

    synchronized long take() {
        return next++;
    }
}
`,
    hint: 'A synchronized instance method locks on `this`. How many different `this` objects are involved here, and how many counters?',
    explanation:
      'A `synchronized` instance method uses the instance\'s own monitor. Two handlers hold two different `TicketNumbers` objects, so they take two different locks and both run `next++` (read, add, write) on the one static field at the same time, which loses updates. The lock must be as widely shared as the data it protects: make the method `static synchronized` (locks `TicketNumbers.class`), use `synchronized (TicketNumbers.class)` or a `private static final Object` lock, or drop locking and use a `static final AtomicLong` with `getAndIncrement()`. `volatile` does not help because `next++` is still three separate steps, and `synchronized (this)` is the same per-instance lock spelled differently.',
    rules: [
      { label: 'Guards the counter with something shared by all instances (class-level lock, static lock object, or an atomic)', type: 'mustContain', pattern: re`static\s+synchronized|synchronized\s+static|synchronized\s*\(\s*TicketNumbers\.class\s*\)|Atomic(Long|Integer)|static\s+final\s+(Object|ReentrantLock|Lock)\s+\w+\s*=`, regex: true },
      { label: 'Does not lock on this', type: 'mustNotContain', pattern: re`synchronized\s*\(\s*this\s*\)`, regex: true },
      { label: 'The counter is still static, shared by every instance', type: 'mustContain', pattern: re`static\s+(final\s+)?(volatile\s+)?(long|int|AtomicLong|AtomicInteger)\s+\w+`, regex: true },
    ],
  },
  {
    id: 'java-period-getdays-total',
    number: 111,
    language: 'java',
    title: 'A Two-Month Rental Billed as Five Days',
    difficulty: 'Medium',
    topic: 'Dates',
    statement:
      '`Rental.daysRented` should return the total number of calendar days from `pickup` to `dropoff` (dropoff is never before pickup; same day is 0). From 2024-01-10 to 2024-03-15 the answer should be 65, but the method returns 5, and customers are billed for 5 days.',
    functionSignature: 'static long daysRented(LocalDate pickup, LocalDate dropoff)',
    buggyCode: `import java.time.LocalDate;
import java.time.Period;

class Rental {
    static long daysRented(LocalDate pickup, LocalDate dropoff) {
        return Period.between(pickup, dropoff).getDays();
    }
}
`,
    hint: 'A Period is a bundle of years, months and days, like "2 months and 5 days". getDays() hands you only one part of it.',
    explanation:
      '`Period.between` describes the gap as years + months + days: here "0 years, 2 months, 5 days". `getDays()` returns just the days component, 5, not the length of the whole period. A Period cannot be converted to a day count on its own because months have different lengths. Ask for the distance in a single unit instead: `ChronoUnit.DAYS.between(pickup, dropoff)` (import `java.time.temporal.ChronoUnit`), `pickup.until(dropoff, ChronoUnit.DAYS)`, or `dropoff.toEpochDay() - pickup.toEpochDay()`. Multiplying the months by 30 is an approximation and gives wrong totals.',
    rules: [
      { label: 'Measures the whole gap in days (ChronoUnit.DAYS, toEpochDay, or a Duration between start-of-day times)', type: 'mustContain', pattern: re`ChronoUnit\.DAYS|DAYS\.between|toEpochDay\s*\(|\.until\s*\([^;]*DAYS|Duration\.between`, regex: true },
      { label: 'No longer reads only the days component of a Period', type: 'mustNotContain', pattern: re`\.getDays\s*\(\s*\)`, regex: true },
      { label: 'Does not approximate months as 30 days or years as 365', type: 'mustNotContain', pattern: re`\*\s*30\b|\*\s*365\b|\b30\s*\*|\b365\s*\*`, regex: true },
    ],
  },
  {
    id: 'java-ncopies-shared-list',
    number: 112,
    language: 'java',
    title: 'Every Bucket Holds Every Word',
    difficulty: 'Medium',
    topic: 'Collections',
    statement:
      '`groupByLength` should return `maxLen + 1` lists where list `i` holds the words of length `i`, in input order (no word is longer than `maxLen`). `groupByLength(List.of("a", "bb", "c"), 2)` should return `[[], [a, c], [bb]]` but returns `[[a, bb, c], [a, bb, c], [a, bb, c]]`.',
    functionSignature: 'public static List<List<String>> groupByLength(List<String> words, int maxLen)',
    buggyCode: `public static List<List<String>> groupByLength(List<String> words, int maxLen) {
    List<List<String>> buckets = new ArrayList<>(Collections.nCopies(maxLen + 1, new ArrayList<>()));
    for (String word : words) {
        buckets.get(word.length()).add(word);
    }
    return buckets;
}
`,
    hint: 'Count how many times `new ArrayList<>()` is evaluated in this method.',
    explanation:
      '`Collections.nCopies(n, x)` evaluates `x` once and returns a list of `n` references to that single object. All the buckets are therefore the same `ArrayList`, and adding to one adds to "all" of them. (`Arrays.fill(array, new ArrayList<>())` has the same problem.) nCopies is fine for immutable values such as 0 or "", but for mutable elements each slot needs its own instance: loop `maxLen + 1` times calling `buckets.add(new ArrayList<>())`, or generate them with a stream such as `Stream.generate(() -> new ArrayList<String>()).limit(maxLen + 1)`.',
    rules: [
      { label: 'Creates a separate list for each bucket (new ArrayList per iteration, lambda, or constructor reference)', type: 'mustContain', pattern: re`\.add\s*\(\s*new\s+(ArrayList|LinkedList)<[^>]*>\s*\(\s*\)\s*\)|->\s*new\s+(ArrayList|LinkedList)<[^>]*>\s*\(\s*\)|(ArrayList|LinkedList)(<[^>]*>)?\s*::\s*new`, regex: true },
      { label: 'No longer fills the buckets with nCopies of one list', type: 'mustNotContain', pattern: re`nCopies\s*\([^;]*new\s+(ArrayList|LinkedList)`, regex: true },
      { label: 'Still buckets words by their length', type: 'mustContain', pattern: re`\.length\s*\(\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-plusmonths-chained-drift',
    number: 113,
    language: 'java',
    title: 'Billing Day Drifts After February',
    difficulty: 'Hard',
    topic: 'Dates',
    statement:
      'A subscription is charged every month on the day-of-month of the first charge, or on the last day of the month when that day does not exist. `billingDates(first, count)` returns the first `count` charge dates starting with `first`. For `first = 2024-01-31` and `count = 4` it should return Jan 31, Feb 29, Mar 31, Apr 30, but it returns Jan 31, Feb 29, Mar 29, Apr 29: once a short month is crossed, the customer is billed on the 29th forever.',
    functionSignature: 'public static List<LocalDate> billingDates(LocalDate first, int count)',
    buggyCode: `public static List<LocalDate> billingDates(LocalDate first, int count) {
    List<LocalDate> dates = new ArrayList<>();
    LocalDate next = first;
    for (int i = 0; i < count; i++) {
        dates.add(next);
        next = next.plusMonths(1);
    }
    return dates;
}
`,
    hint: 'plusMonths clamps to the end of a shorter month, and the clamped date remembers nothing about the day you started from. What should each date be measured from?',
    explanation:
      '`plusMonths(1)` on Jan 31 gives Feb 29 (clamped). The next step starts from Feb 29, so it gives Mar 29: the original "31st" is lost the first time a clamp happens, and every later date inherits the smaller day. Always compute from the anchor: the i-th charge is `first.plusMonths(i)`, which clamps independently each time (Jan 31 + 2 months = Mar 31, + 3 months = Apr 30). Alternatively keep stepping month by month but restore the day with `withDayOfMonth(Math.min(first.getDayOfMonth(), date.lengthOfMonth()))`. Adding 30 days instead of a month is a different schedule altogether.',
    rules: [
      { label: 'Derives each date from the first charge (plusMonths(i) from the anchor, or re-applies the original day-of-month)', type: 'mustContain', pattern: re`plusMonths\s*\(\s*[A-Za-z_]\w*\s*\)|plus\s*\(\s*\w+\s*,\s*[\w.]*MONTHS\s*\)|Period\.ofMonths\s*\(\s*[A-Za-z_]|withDayOfMonth\s*\(|lengthOfMonth\s*\(|YearMonth`, regex: true },
      { label: 'Does not approximate a month as a fixed number of days', type: 'mustNotContain', pattern: re`plusDays\s*\(\s*(28|29|30|31)\s*\)|plusWeeks\s*\(`, regex: true },
      { label: 'Still produces one date per charge', type: 'mustContain', pattern: re`for\s*\(|while\s*\(|mapToObj\s*\(|iterate\s*\(`, regex: true },
    ],
  },
  {
    id: 'java-withzonesamelocal-instant',
    number: 114,
    language: 'java',
    title: 'Meeting Shown Nine Hours Early',
    difficulty: 'Medium',
    topic: 'Dates',
    statement:
      '`forViewer` converts a meeting time into the viewer\'s time zone so both people see the same moment. A meeting at 2024-03-04 15:00 in Europe/London should be shown to a viewer in Asia/Tokyo as 2024-03-05 00:00 (+09:00). The method returns 2024-03-04 15:00 (+09:00) instead, which is nine hours before the real meeting.',
    functionSignature: 'public static ZonedDateTime forViewer(ZonedDateTime meeting, ZoneId viewerZone)',
    buggyCode: `public static ZonedDateTime forViewer(ZonedDateTime meeting, ZoneId viewerZone) {
    return meeting.withZoneSameLocal(viewerZone);
}
`,
    hint: 'A ZonedDateTime is a wall-clock reading plus a zone. When you change the zone, one of two things has to stay the same: the clock reading or the moment in time.',
    explanation:
      '`withZoneSameLocal` keeps the wall-clock fields (15:00) and swaps the zone label, which produces a different instant: 15:00 in Tokyo happens nine hours before 15:00 in London. To show the same moment elsewhere, keep the instant and let the clock reading change: `meeting.withZoneSameInstant(viewerZone)`. `meeting.toInstant().atZone(viewerZone)` and `ZonedDateTime.ofInstant(meeting.toInstant(), viewerZone)` are equivalent. `meeting.toLocalDateTime().atZone(viewerZone)` is the same bug written differently.',
    rules: [
      { label: 'Keeps the same instant when changing zone (withZoneSameInstant or via toInstant())', type: 'mustContain', pattern: re`withZoneSameInstant\s*\(|\.toInstant\s*\(\s*\)`, regex: true },
      { label: 'No longer uses withZoneSameLocal', type: 'mustNotContain', pattern: 'withZoneSameLocal' },
      { label: 'Does not re-label the local wall-clock time with the new zone', type: 'mustNotContain', pattern: re`toLocalDateTime\s*\(\s*\)\s*\.atZone|ZonedDateTime\.of\s*\(\s*\w+\.toLocalDateTime`, regex: true },
    ],
  },
  {
    id: 'java-field-hiding-subclass',
    number: 115,
    language: 'java',
    title: 'The Subclass Field Nobody Reads',
    difficulty: 'Medium',
    topic: 'OOP',
    statement:
      '`PremiumAccount` is supposed to change the tier reported by the inherited `describe()` method. `new PremiumAccount().describe()` should return `"tier=premium"` but returns `"tier=basic"`. Fix it without copying `describe()` into the subclass; a plain `Account` must still report `"tier=basic"`.',
    functionSignature: 'class PremiumAccount extends Account',
    buggyCode: `class Account {
    protected String tier = "basic";

    String describe() {
        return "tier=" + tier;
    }
}

class PremiumAccount extends Account {
    protected String tier = "premium";
}
`,
    hint: 'Methods are overridden; fields are not. How many fields named tier does a PremiumAccount object contain?',
    explanation:
      'Declaring `tier` again in the subclass does not replace the parent\'s field, it HIDES it: a `PremiumAccount` object now has two separate `tier` fields. Field access is resolved at compile time from the class where the code is written, so `describe()` in `Account` always reads `Account.tier`, which is still "basic". Remove the duplicate declaration and assign the inherited field instead, for example in a constructor (`PremiumAccount() { tier = "premium"; }`) or by passing the value up with `super("premium")`. If behaviour really must vary by subclass, put it behind a method (`String tier()`), because only methods are dispatched dynamically.',
    rules: [
      { label: 'PremiumAccount no longer declares its own tier field', type: 'mustNotContain', pattern: re`class\s+PremiumAccount\s+extends\s+Account\s*\{[^}]*?\bString\s+tier\s*(=|;)`, regex: true },
      { label: 'Supplies "premium" through inherited state or an overridden method', type: 'mustContain', pattern: re`tier\s*=\s*"premium"|super\s*\(\s*"premium"\s*\)|return\s+"premium"`, regex: true },
      { label: 'describe() still builds the "tier=" label', type: 'mustContain', pattern: re`"tier="\s*\+`, regex: true },
      { label: 'A plain Account still defaults to "basic"', type: 'mustContain', pattern: '"basic"' },
    ],
  },
  {
    id: 'java-enum-ordinal-persisted',
    number: 116,
    language: 'java',
    title: 'Shipped Orders Turned Cancelled',
    difficulty: 'Hard',
    topic: 'OOP',
    statement:
      'Order rows store a status code: 0 = NEW, 1 = PAID, 2 = SHIPPED. A teammate then added `CANCELLED` between `PAID` and `SHIPPED` so the constants read in a sensible order, and every existing shipped order now loads as `CANCELLED`. Make the stored codes explicit so they no longer depend on declaration order: NEW 0, PAID 1, SHIPPED 2, CANCELLED 3. Keep the constants in their current order, keep `toDbCode()` and `fromDbCode(int)`, and have `fromDbCode` throw `IllegalArgumentException` for an unknown code.',
    functionSignature: 'enum OrderStatus',
    buggyCode: `enum OrderStatus {
    NEW, PAID, CANCELLED, SHIPPED;

    int toDbCode() {
        return ordinal();
    }

    static OrderStatus fromDbCode(int code) {
        return values()[code];
    }
}
`,
    hint: 'ordinal() is just the position of a constant in the source file. Anything written to disk should be a value you chose and wrote down.',
    explanation:
      '`ordinal()` and `values()[i]` are both defined by declaration order, so inserting or reordering a constant silently changes the meaning of every number already stored. Persisted identifiers must be explicit and stable: give each constant its own code (`NEW(0), PAID(1), CANCELLED(3), SHIPPED(2)`), keep it in a `private final int code` field set by the constructor, return that field from `toDbCode()`, and have `fromDbCode` search `values()` for the matching code, throwing `IllegalArgumentException` when none matches. A pair of `switch` statements works as well. Moving `CANCELLED` to the end would repair today\'s data but leaves the same trap for the next edit.',
    rules: [
      { label: 'Does not use ordinal()', type: 'mustNotContain', pattern: re`ordinal\s*\(\s*\)`, regex: true },
      { label: 'SHIPPED is tied explicitly to the stored code 2', type: 'mustContain', pattern: re`SHIPPED\s*(\(\s*2\s*\)|->\s*2\b|:\s*return\s+2\b|,\s*2\b)`, regex: true },
      { label: 'CANCELLED is tied explicitly to the new code 3', type: 'mustContain', pattern: re`CANCELLED\s*(\(\s*3\s*\)|->\s*3\b|:\s*return\s+3\b|,\s*3\b)`, regex: true },
      { label: 'fromDbCode no longer indexes values() by position', type: 'mustNotContain', pattern: re`values\s*\(\s*\)\s*\[`, regex: true },
      { label: 'Rejects unknown codes with IllegalArgumentException', type: 'mustContain', pattern: re`throw\s+new\s+IllegalArgumentException`, regex: true },
    ],
  },
  {
    id: 'java-hashcode-ignores-case-rule',
    number: 117,
    language: 'java',
    title: 'Equal Emails, Different Hashes',
    difficulty: 'Medium',
    topic: 'Equality',
    statement:
      'Two `Email` objects are equal when their addresses match ignoring letter case, and `equals` implements that. Still, after `Set<Email> seen = new HashSet<>(); seen.add(new Email("Ann@Example.com"));` the call `seen.contains(new Email("ann@example.com"))` returns false, so the same person can sign up twice. Equality must stay case-insensitive.',
    functionSignature: 'class Email',
    buggyCode: `class Email {
    private final String address;

    Email(String address) {
        this.address = address;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Email)) return false;
        return address.equalsIgnoreCase(((Email) o).address);
    }

    @Override
    public int hashCode() {
        return address.hashCode();
    }
}
`,
    hint: 'A hash-based collection only calls equals on objects that landed in the same bucket. What decides the bucket, and does it agree with equals about "Ann" and "ann"?',
    explanation:
      'The contract is: objects that are equal must return the same hash code. Here `equals` ignores case but `hashCode` hashes the exact characters, so "Ann@Example.com" and "ann@example.com" are equal yet almost always land in different buckets, and `HashSet.contains` never gets as far as calling `equals`. Both methods must be derived from the same normalised data: hash a case-folded form (`address.toLowerCase(Locale.ROOT).hashCode()`), or normalise once in the constructor and use plain `equals`/`hashCode` on the stored value. Making `equals` case-sensitive would satisfy the contract but break the requirement.',
    rules: [
      { label: 'Hashes a case-normalised form of the address (in hashCode or by normalising when stored)', type: 'mustContain', pattern: re`to(Lower|Upper)Case\s*\([^)]*\)\s*\.hashCode\s*\(|Objects\.hash\s*\([^;]*to(Lower|Upper)Case|=\s*(this\.)?\w+(\.trim\s*\(\s*\))?\.to(Lower|Upper)Case\s*\(`, regex: true },
      { label: 'Equality is still case-insensitive', type: 'mustContain', pattern: re`equalsIgnoreCase|to(Lower|Upper)Case`, regex: true },
      { label: 'Still overrides hashCode()', type: 'mustContain', pattern: re`int\s+hashCode\s*\(\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-split-drops-trailing-empty',
    number: 118,
    language: 'java',
    title: 'The Vanishing Empty Columns',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`columnCount` should return how many comma-separated columns a line has, counting empty ones (there is no quoting; an empty line is one empty column). `columnCount("ann,42,,")` should return 4, since the last two columns are empty, but it returns 2, and rows with blank trailing fields are rejected as malformed.',
    functionSignature: 'public static int columnCount(String csvLine)',
    buggyCode: `public static int columnCount(String csvLine) {
    return csvLine.split(",").length;
}
`,
    hint: 'split has a second, optional argument. Read what the Javadoc says happens to trailing empty strings when it is left out.',
    explanation:
      'One-argument `split(regex)` behaves like `split(regex, 0)`, and a limit of 0 removes all trailing empty strings from the result. So "ann,42,," becomes ["ann", "42"], while leading and middle empties are kept, which makes the bug easy to miss. A negative limit keeps everything: `csvLine.split(",", -1).length`. Counting the commas and adding one is an equally valid fix. Trimming the line first does nothing, because the lost fields are empty strings, not whitespace.',
    rules: [
      { label: 'Keeps trailing empty columns (negative split limit, or counts the commas directly)', type: 'mustContain', pattern: re`split\s*\(\s*("[^"]*"|\w+)\s*,\s*-\s*\d+\s*\)|==\s*','|','\s*==|indexOf\s*\(\s*(','|",")`, regex: true },
      { label: 'No longer uses the one-argument split', type: 'mustNotContain', pattern: re`split\s*\(\s*"[^"]*"\s*\)`, regex: true },
      { label: 'Does not pass limit 0 (it behaves exactly like no limit)', type: 'mustNotContain', pattern: re`split\s*\(\s*("[^"]*"|\w+)\s*,\s*0\s*\)`, regex: true },
    ],
  },
  {
    id: 'java-ceil-of-int-division',
    number: 119,
    language: 'java',
    title: 'The Last Page Is Missing',
    difficulty: 'Easy',
    topic: 'Arithmetic',
    statement:
      '`pageCount` should return how many pages are needed to show `totalItems` items at `pageSize` per page (`totalItems` is 0 or more, `pageSize` is positive; 0 items need 0 pages). `pageCount(41, 10)` should return 5 but returns 4, so the last item can never be reached. `pageCount(40, 10)` must stay 4.',
    functionSignature: 'public static int pageCount(int totalItems, int pageSize)',
    buggyCode: `public static int pageCount(int totalItems, int pageSize) {
    return (int) Math.ceil(totalItems / pageSize);
}
`,
    hint: 'Work out the value of the expression inside Math.ceil(...) for 41 and 10 before ceil ever sees it.',
    explanation:
      '`totalItems / pageSize` divides two ints, so it has already been truncated to 4 by the time `Math.ceil` receives it; rounding 4.0 up changes nothing. Either make the division real, `Math.ceil((double) totalItems / pageSize)`, or stay in integers with the round-up idiom `(totalItems + pageSize - 1) / pageSize`, a remainder check (`totalItems % pageSize != 0` adds one page), or `Math.ceilDiv` on Java 18+. Two near-misses: `(double) (totalItems / pageSize)` casts after the truncation, and `totalItems / pageSize + 1` adds a phantom empty page whenever the items divide evenly.',
    rules: [
      { label: 'Rounds up correctly (real division, the (a + b - 1) / b idiom, a remainder check, or Math.ceilDiv)', type: 'mustContain', pattern: re`\(\s*double\s*\)|\+\s*\w+\s*-\s*1\s*\)\s*/|-\s*1\s*\+\s*\w+\s*\)\s*/|Math\.ceilDiv\s*\(|%\s*\w+|\*\s*1\.0|1\.0\s*\*`, regex: true },
      { label: 'Does not round up an int division that has already been truncated', type: 'mustNotContain', pattern: re`Math\.ceil\s*\(\s*\w+\s*/\s*\w+\s*\)|\(\s*double\s*\)\s*\(\s*\w+\s*/\s*\w+\s*\)`, regex: true },
      { label: 'Does not add an extra page unconditionally', type: 'mustNotContain', pattern: re`return\s+\w+\s*/\s*\w+\s*\+\s*1\s*;`, regex: true },
    ],
  },
  {
    id: 'java-putifabsent-returns-null',
    number: 120,
    language: 'java',
    title: 'putIfAbsent Hands Back Nothing',
    difficulty: 'Medium',
    topic: 'Maps',
    statement:
      '`byDepartment` receives rows of `{department, employee}` and should return a map from each department to its employees in input order. It throws `NullPointerException` on the very first row, before anything has been grouped.',
    functionSignature: 'public static Map<String, List<String>> byDepartment(List<String[]> rows)',
    buggyCode: `public static Map<String, List<String>> byDepartment(List<String[]> rows) {
    Map<String, List<String>> result = new TreeMap<>();
    for (String[] row : rows) {
        result.putIfAbsent(row[0], new ArrayList<>()).add(row[1]);
    }
    return result;
}
`,
    hint: 'Check the return value of putIfAbsent when the key was NOT in the map yet. It is not the value you just passed in.',
    explanation:
      '`putIfAbsent` returns the PREVIOUS value for the key, which is null the first time a department is seen, so `.add(...)` is called on null. (`put` has the same return convention.) `computeIfAbsent(row[0], k -> new ArrayList<>())` is the method written for this job: it returns the value now in the map, whether it already existed or was just created, and it only builds a new list when one is needed. Splitting the statement in two (`putIfAbsent(...)` and then `result.get(row[0]).add(...)`) also works. `getOrDefault(key, new ArrayList<>()).add(...)` avoids the exception but adds to a list that is never stored in the map.',
    rules: [
      { label: 'Adds to the list that is actually in the map (computeIfAbsent, a separate lookup, or an explicit null/containsKey check)', type: 'mustContain', pattern: re`computeIfAbsent\s*\(|putIfAbsent\s*\([^;]*\)\s*;|containsKey\s*\(|[!=]=\s*null|groupingBy`, regex: true },
      { label: 'No longer chains .add onto the return value of putIfAbsent', type: 'mustNotContain', pattern: re`putIfAbsent\s*\([^;]*\)\s*\.add\s*\(`, regex: true },
      { label: 'Still reads the employee from column 1 of each row', type: 'mustContain', pattern: re`\[\s*1\s*\]`, regex: true },
    ],
  },
  {
    id: 'java-iterator-next-twice',
    number: 121,
    language: 'java',
    title: 'Two next() Calls per Lap',
    difficulty: 'Easy',
    topic: 'Iteration',
    statement:
      '`longWords` should return, in order, the words that have at least `minLength` characters. `longWords(List.of("tree", "a", "river", "ok"), 4)` should return `[tree, river]` but returns `[a, ok]`, and for some inputs it throws `NoSuchElementException`.',
    functionSignature: 'public static List<String> longWords(List<String> words, int minLength)',
    buggyCode: `public static List<String> longWords(List<String> words, int minLength) {
    List<String> out = new ArrayList<>();
    Iterator<String> it = words.iterator();
    while (it.hasNext()) {
        if (it.next().length() >= minLength) {
            out.add(it.next());
        }
    }
    return out;
}
`,
    hint: 'next() does two things: it returns an element and it moves the iterator forward. How far has the iterator moved by the time out.add runs?',
    explanation:
      'Each call to `next()` advances the iterator. The `if` tests one element and the `add` then fetches the FOLLOWING one, so the method stores the neighbour of every long word, and when a long word is last the second `next()` runs off the end and throws. Call `next()` once per pass and keep the result: `String word = it.next(); if (word.length() >= minLength) out.add(word);`. A for-each loop or `words.stream().filter(...)` hides the iterator and makes the mistake impossible.',
    rules: [
      { label: 'Calls next() at most once per element', type: 'mustNotContain', pattern: re`\.next\s*\(\s*\)[\s\S]*\.next\s*\(\s*\)`, regex: true },
      { label: 'Holds each word in a variable (or uses for-each / filter) before testing and adding it', type: 'mustContain', pattern: re`\w+\s*=\s*\w+\.next\s*\(\s*\)|for\s*\(\s*(final\s+)?\w+\s+\w+\s*:|\.filter\s*\(`, regex: true },
      { label: 'Still keeps words of at least minLength characters', type: 'mustContain', pattern: re`>=\s*minLength|minLength\s*<=|<\s*minLength|minLength\s*>`, regex: true },
    ],
  },
  {
    id: 'java-try-around-whole-loop',
    number: 122,
    language: 'java',
    title: 'One Bad Entry Ends the Sum',
    difficulty: 'Medium',
    topic: 'Exceptions',
    statement:
      '`sumValid` should add up every entry that parses as an int (after trimming whitespace) and skip the entries that do not, by catching `NumberFormatException` for that entry alone. `sumValid(List.of("4", "x", "6"))` should return 10 but returns 4: everything after the first bad entry is ignored.',
    functionSignature: 'public static int sumValid(List<String> entries)',
    buggyCode: `public static int sumValid(List<String> entries) {
    int sum = 0;
    try {
        for (String entry : entries) {
            sum += Integer.parseInt(entry.trim());
        }
    } catch (NumberFormatException e) {
        // skip the bad entry
    }
    return sum;
}
`,
    hint: 'When an exception is caught, execution continues after the try/catch statement, not back where it was thrown. Where does that leave the loop?',
    explanation:
      'A `catch` does not resume the code that threw. The `try` wraps the entire loop, so the first `NumberFormatException` jumps out of the loop to the handler and then straight on to `return sum`; the remaining entries are never visited. The scope of a `try` block is the unit of work that gets abandoned on failure, so make it one entry: put the `try { ... } catch (NumberFormatException e) { }` inside the loop body around the single `parseInt` call (or move the parse into a small helper that returns null or an empty Optional on failure). The loop then carries on with the next entry.',
    rules: [
      { label: 'The try block no longer wraps the whole loop', type: 'mustNotContain', pattern: re`try\s*\{\s*(for|while)\s*\(|try\s*\{[^}]*\.(forEach|stream)\s*\(`, regex: true },
      { label: 'Catches NumberFormatException around a single parse', type: 'mustContain', pattern: re`try\s*\{[^{}]*parseInt[^{}]*\}\s*catch\s*\(\s*(final\s+)?NumberFormatException`, regex: true },
      { label: 'Still visits every entry', type: 'mustContain', pattern: re`(for|while)\s*\(|forEach|stream\s*\(`, regex: true },
    ],
  },
  {
    id: 'java-set-long-contains-int',
    number: 123,
    language: 'java',
    title: 'The Blocked User Who Gets Through',
    difficulty: 'Medium',
    topic: 'Autoboxing',
    statement:
      '`isBlocked` should return true when `userId` is in the set of blocked ids. With `blockedIds = Set.of(42L, 77L)`, `isBlocked(blockedIds, 42)` returns false, and it returns false for every other id as well. The code compiles without warnings.',
    functionSignature: 'public static boolean isBlocked(Set<Long> blockedIds, int userId)',
    buggyCode: `public static boolean isBlocked(Set<Long> blockedIds, int userId) {
    return blockedIds.contains(userId);
}
`,
    hint: 'contains takes an Object, so the compiler boxes the int for you. Into which wrapper class, and can an object of that class ever equal a Long?',
    explanation:
      '`Collection.contains(Object)` is not generic, so any argument compiles. The `int` is autoboxed to an `Integer`, and `Long.equals(Integer)` is always false, even for the same number: wrapper classes never compare equal across types. The set is asked for an object it cannot contain. Convert to the element type before the lookup: `blockedIds.contains((long) userId)` or `contains(Long.valueOf(userId))`. The same trap applies to `Map<Long, V>.get(int)`, `List<Long>.remove(Object)` and `indexOf`.',
    rules: [
      { label: 'Converts userId to a long/Long before the lookup (or compares numerically)', type: 'mustContain', pattern: re`\(\s*long\s*\)\s*userId|Long\.valueOf\s*\(\s*userId\s*\)|\blong\s+\w+\s*=\s*userId\s*;|userId\s*\+\s*0L|\dL\s*\*\s*userId|==\s*userId|userId\s*==`, regex: true },
      { label: 'No longer passes the raw int to contains', type: 'mustNotContain', pattern: re`contains\s*\(\s*userId\s*\)`, regex: true },
      { label: 'Still checks the blocked set', type: 'mustContain', pattern: re`blockedIds\s*\.\s*(contains|stream|iterator)|:\s*blockedIds`, regex: true },
    ],
  },
  {
    id: 'java-comparator-reversed-whole-chain',
    number: 124,
    language: 'java',
    title: 'reversed() Flips More Than Salary',
    difficulty: 'Hard',
    topic: 'Comparators',
    statement:
      '`Payroll.sortForReport` should sort staff by department A to Z and, within a department, by salary from highest to lowest. The salaries come out in the right order, but the departments are now listed Z to A.',
    functionSignature: 'static void sortForReport(List<Employee> staff)',
    buggyCode: `record Employee(String name, String dept, int salary) {}

class Payroll {
    static void sortForReport(List<Employee> staff) {
        staff.sort(Comparator.comparing(Employee::dept)
            .thenComparing(Employee::salary)
            .reversed());
    }
}
`,
    hint: 'reversed() is called on a comparator object. Which comparator is the receiver at the point where it is called here?',
    explanation:
      'Each call in the chain returns a new comparator, and `.reversed()` reverses the comparator it is called on. At the end of the chain that is the whole "dept, then salary" comparator, so both keys flip. Reverse only the salary key: `thenComparing(Employee::salary, Comparator.reverseOrder())`, or `thenComparing(Comparator.comparingInt(Employee::salary).reversed())`, where `reversed()` applies to the inner comparator alone. Moving `.reversed()` to sit right after `comparing(Employee::dept)` has the opposite problem (departments descending, salary ascending).',
    rules: [
      { label: 'Sorts salary in descending order', type: 'mustContain', pattern: re`reverseOrder\s*\(|\.reversed\s*\(|->\s*-\s*\w|compare\s*\(\s*\w+\.salary\(\)\s*,\s*\w+\.salary\(\)|\w+\.salary\(\)\s*-\s*\w+\.salary\(\)`, regex: true },
      { label: 'Does not call reversed() on the whole dept-then-salary chain', type: 'mustNotContain', pattern: re`thenComparing\w*\s*\((?:[^()]|\([^()]*\))*\)\s*\.reversed\s*\(`, regex: true },
      { label: 'Does not reverse the department key', type: 'mustNotContain', pattern: re`dept\s*(\(\s*\))?\s*\)\s*\.reversed\s*\(`, regex: true },
      { label: 'Department is still compared first', type: 'mustContain', pattern: re`\bcomparing\s*\(\s*(Employee::dept|\w+\s*->\s*\w+\.dept\s*\(\s*\))|\.dept\s*\(\s*\)\s*\.compareTo`, regex: true },
    ],
  },
  {
    id: 'java-thenapply-nested-future',
    number: 125,
    language: 'java',
    title: 'A Future Inside a Future',
    difficulty: 'Hard',
    topic: 'Concurrency basics',
    statement:
      '`OrderService.ordersFor` should look a user up asynchronously and then load that user\'s orders asynchronously, returning a single `CompletableFuture<List<String>>` without blocking any thread. The method does not compile: the expression has type `CompletableFuture<CompletableFuture<List<String>>>`.',
    functionSignature: 'CompletableFuture<List<String>> ordersFor(String userId)',
    buggyCode: `record User(String id) {}

class OrderService {
    CompletableFuture<User> findUser(String userId) {
        return CompletableFuture.supplyAsync(() -> new User(userId));
    }

    CompletableFuture<List<String>> findOrders(User user) {
        return CompletableFuture.supplyAsync(() -> List.of(user.id() + "-order-1"));
    }

    CompletableFuture<List<String>> ordersFor(String userId) {
        return findUser(userId).thenApply(user -> findOrders(user));
    }
}
`,
    hint: 'thenApply is to CompletableFuture what map is to Optional and Stream. What is the counterpart of flatMap?',
    explanation:
      '`thenApply(f)` wraps whatever `f` returns in a new future. Since `findOrders` itself returns a future, the result is a future of a future. When the next step is asynchronous too, use `thenCompose`, which takes a function returning a `CompletionStage` and flattens the result: `findUser(userId).thenCompose(this::findOrders)`. It is the flatMap of CompletableFuture. Unwrapping by hand with `thenApply(user -> findOrders(user).join())` compiles, but it parks a pool thread until the inner future completes, which defeats the point of composing asynchronously and can starve a small pool.',
    rules: [
      { label: 'Chains the second async call with thenCompose', type: 'mustContain', pattern: re`\.thenCompose(Async)?\s*\(`, regex: true },
      { label: 'No longer maps to a nested future with thenApply', type: 'mustNotContain', pattern: re`\.thenApply(Async)?\s*\(\s*(\w+\s*->\s*(this\.)?findOrders|this::findOrders)`, regex: true },
      { label: 'Does not block on a future with join() or get()', type: 'mustNotContain', pattern: re`\.join\s*\(\s*\)|\.get\s*\(\s*\)`, regex: true },
      { label: 'Still loads the orders through findOrders', type: 'mustContain', pattern: re`findOrders`, regex: true },
    ],
  },
];
