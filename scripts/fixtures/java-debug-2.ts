export { problems } from '../../src/data/more/java-debug-2';

// One full corrected snippet per problem id (reference fixes; each compiles with javac).
export const fixes: Record<string, string> = {
  'java-bigdecimal-equals-scale': `public static boolean isPaidInFull(BigDecimal paid, BigDecimal due) {
    return paid.compareTo(due) == 0;
}
`,
  'java-bigdecimal-divide-nonterminating': `public static BigDecimal perPerson(BigDecimal total, int people) {
    return total.divide(BigDecimal.valueOf(people), 2, RoundingMode.HALF_UP);
}
`,
  'java-int-multiply-before-widening': `public static long daysToMillis(int days) {
    return (long) days * 24 * 60 * 60 * 1000;
}
`,
  'java-hashcode-negative-bucket': `public static int bucketFor(String key, int buckets) {
    return Math.floorMod(key.hashCode(), buckets);
}
`,
  'java-optional-of-null': `public static Optional<String> nicknameOf(Map<String, String> nicknames, String userId) {
    return Optional.ofNullable(nicknames.get(userId));
}
`,
  'java-stream-limit-before-sorted': `public static List<Integer> topThree(List<Integer> scores) {
    return scores.stream()
        .sorted(Comparator.reverseOrder())
        .limit(3)
        .collect(Collectors.toList());
}
`,
  'java-record-unmodifiable-view': `record Playlist(String name, List<String> tracks) {
    Playlist {
        tracks = List.copyOf(tracks);
    }
}
`,
  'java-toarray-object-cast': `public static String[] toNameArray(List<String> names) {
    return names.toArray(new String[0]);
}
`,
  'java-lock-unlock-not-in-finally': `import java.util.concurrent.locks.ReentrantLock;

class Inventory {
    private final ReentrantLock lock = new ReentrantLock();
    private final Map<String, Integer> stock = new HashMap<>();

    void remove(String sku, int qty) {
        lock.lock();
        try {
            int have = stock.getOrDefault(sku, 0);
            if (qty > have) {
                throw new IllegalArgumentException("not enough stock for " + sku);
            }
            stock.put(sku, have - qty);
        } finally {
            lock.unlock();
        }
    }
}
`,
  'java-instance-lock-static-state': `class TicketNumbers {
    private static long next = 1;

    static synchronized long take() {
        return next++;
    }
}
`,
  'java-period-getdays-total': `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

class Rental {
    static long daysRented(LocalDate pickup, LocalDate dropoff) {
        return ChronoUnit.DAYS.between(pickup, dropoff);
    }
}
`,
  'java-ncopies-shared-list': `public static List<List<String>> groupByLength(List<String> words, int maxLen) {
    List<List<String>> buckets = new ArrayList<>();
    for (int i = 0; i <= maxLen; i++) {
        buckets.add(new ArrayList<>());
    }
    for (String word : words) {
        buckets.get(word.length()).add(word);
    }
    return buckets;
}
`,
  'java-plusmonths-chained-drift': `public static List<LocalDate> billingDates(LocalDate first, int count) {
    List<LocalDate> dates = new ArrayList<>();
    for (int i = 0; i < count; i++) {
        dates.add(first.plusMonths(i));
    }
    return dates;
}
`,
  'java-withzonesamelocal-instant': `public static ZonedDateTime forViewer(ZonedDateTime meeting, ZoneId viewerZone) {
    return meeting.withZoneSameInstant(viewerZone);
}
`,
  'java-field-hiding-subclass': `class Account {
    protected String tier = "basic";

    String describe() {
        return "tier=" + tier;
    }
}

class PremiumAccount extends Account {
    PremiumAccount() {
        tier = "premium";
    }
}
`,
  'java-enum-ordinal-persisted': `enum OrderStatus {
    NEW(0), PAID(1), CANCELLED(3), SHIPPED(2);

    private final int code;

    OrderStatus(int code) {
        this.code = code;
    }

    int toDbCode() {
        return code;
    }

    static OrderStatus fromDbCode(int code) {
        for (OrderStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
}
`,
  'java-hashcode-ignores-case-rule': `class Email {
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
        return address.toLowerCase(Locale.ROOT).hashCode();
    }
}
`,
  'java-split-drops-trailing-empty': `public static int columnCount(String csvLine) {
    return csvLine.split(",", -1).length;
}
`,
  'java-ceil-of-int-division': `public static int pageCount(int totalItems, int pageSize) {
    return (totalItems + pageSize - 1) / pageSize;
}
`,
  'java-putifabsent-returns-null': `public static Map<String, List<String>> byDepartment(List<String[]> rows) {
    Map<String, List<String>> result = new TreeMap<>();
    for (String[] row : rows) {
        result.computeIfAbsent(row[0], k -> new ArrayList<>()).add(row[1]);
    }
    return result;
}
`,
  'java-iterator-next-twice': `public static List<String> longWords(List<String> words, int minLength) {
    List<String> out = new ArrayList<>();
    Iterator<String> it = words.iterator();
    while (it.hasNext()) {
        String word = it.next();
        if (word.length() >= minLength) {
            out.add(word);
        }
    }
    return out;
}
`,
  'java-try-around-whole-loop': `public static int sumValid(List<String> entries) {
    int sum = 0;
    for (String entry : entries) {
        try {
            sum += Integer.parseInt(entry.trim());
        } catch (NumberFormatException e) {
            // skip the bad entry
        }
    }
    return sum;
}
`,
  'java-set-long-contains-int': `public static boolean isBlocked(Set<Long> blockedIds, int userId) {
    return blockedIds.contains((long) userId);
}
`,
  'java-comparator-reversed-whole-chain': `record Employee(String name, String dept, int salary) {}

class Payroll {
    static void sortForReport(List<Employee> staff) {
        staff.sort(Comparator.comparing(Employee::dept)
            .thenComparing(Employee::salary, Comparator.reverseOrder()));
    }
}
`,
  'java-thenapply-nested-future': `record User(String id) {}

class OrderService {
    CompletableFuture<User> findUser(String userId) {
        return CompletableFuture.supplyAsync(() -> new User(userId));
    }

    CompletableFuture<List<String>> findOrders(User user) {
        return CompletableFuture.supplyAsync(() -> List.of(user.id() + "-order-1"));
    }

    CompletableFuture<List<String>> ordersFor(String userId) {
        return findUser(userId).thenCompose(user -> findOrders(user));
    }
}
`,
};
