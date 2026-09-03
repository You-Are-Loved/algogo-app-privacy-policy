// CS Fundamentals - Concurrency
// Threads, locks, atomics, async models, and the bugs that only show up under load

import { Category } from '../../types';

export const concurrency: Category = {
  id: 'cs-concurrency',
  name: 'Concurrency',
  slug: 'cs-concurrency',
  description: 'Threads, locks, atomics, async models, and the bugs that only show up under load',
  icon: 'swap-horizontal-outline',
  color: '#EF4444',
  colorDark: '#DC2626',
  premium: true,

  learnContent: [
    {
      id: 'cs-cc-1',
      title: 'Concurrency vs Parallelism and the Models',
      content: `Concurrency is about *structure*: dealing with many things at once. Parallelism is about *execution*: doing many things at once. A single-core machine can run a concurrent program (interleaving tasks) with zero parallelism; a parallel program needs multiple cores.

**Why It Matters:**
- Concurrency hides latency (waiting on network, disk, users)
- Parallelism adds throughput for CPU-bound work
- Amdahl\'s law: if 10% of a program is serial, no number of cores gets you past 10x speedup

**The Main Models:**
- **OS threads** - preemptive, share the process\'s memory, scheduled by the kernel. Simple mental model, expensive to create (MBs of stack), and shared memory invites races.
- **Event loop** - one thread, non-blocking I/O, callbacks run when events arrive (Node.js, browser JS, Python asyncio). Blocking the loop freezes everything.
- **async/await** - syntactic sugar over futures and coroutines. Cooperative: a task only yields at an \`await\`, so there is no preemption and fewer races, but a long CPU loop starves everyone.
- **Actors** - each actor owns its state and communicates only by messages through a mailbox (Erlang, Akka). No shared memory, so no locks.
- **CSP / goroutines** - lightweight green threads multiplexed onto OS threads, communicating through channels (Go). "Share memory by communicating, don\'t communicate by sharing memory."

**Preemptive vs Cooperative:**
Preemptive schedulers can interrupt a thread anywhere, which is why every shared read-modify-write needs protection. Cooperative schedulers only switch at explicit yield points, which makes reasoning easier but makes one badly behaved task everyone\'s problem.

**Interview Framing:**
When asked "how would you handle 10k connections," the answer is about the model (event loop or green threads), not about spawning 10k OS threads.`,
      codeExample: `# Python: three ways to overlap I/O-bound work

import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor

def fetch_blocking(url: str) -> str:
    # pretend this does a network call
    return f"body of {url}"

urls = ["a", "b", "c"]

# 1) OS threads: preemptive, shared memory
results = []
lock = threading.Lock()

def worker(u):
    body = fetch_blocking(u)
    with lock:                 # results.append is shared state
        results.append(body)

threads = [threading.Thread(target=worker, args=(u,)) for u in urls]
for t in threads: t.start()
for t in threads: t.join()

# 2) Thread pool: same model, bounded number of workers
with ThreadPoolExecutor(max_workers=4) as pool:
    pooled = list(pool.map(fetch_blocking, urls))

# 3) Event loop + async/await: one thread, cooperative switching
async def fetch_async(u):
    await asyncio.sleep(0.01)  # yields to the loop here (non-blocking I/O)
    return f"body of {u}"

async def main():
    # gather runs the coroutines concurrently on ONE thread
    return await asyncio.gather(*(fetch_async(u) for u in urls))

async_results = asyncio.run(main())

# A CPU loop inside a coroutine (no await) would block the whole loop.`
    },
    {
      id: 'cs-cc-2',
      title: 'Race Conditions and Critical Sections',
      content: `A race condition is a bug whose outcome depends on the timing or interleaving of threads. The code looks correct when read sequentially, and fails one time in a million under load.

**Data Race vs Race Condition:**
- **Data race**: two threads access the same memory location concurrently, at least one is a write, and there is no synchronization. In C/C++ this is undefined behavior; in Java/Go it is a bug with defined-but-surprising results.
- **Race condition**: a broader logic error caused by unlucky ordering. You can have a race condition with zero data races (every access locked, but the *combination* is not atomic).

**Classic Shapes:**
- **Lost update**: \`counter += 1\` is read, add, write. Two threads both read 5, both write 6. One increment vanishes.
- **Check-then-act (TOCTOU)**: \`if not exists(key): insert(key)\` - another thread inserts between the check and the act. The fix is a single atomic operation such as \`putIfAbsent\`, or holding the lock across both steps.
- **Read-modify-write on collections**: \`if list: list.pop()\` races with another popper.

**Critical Sections:**
A critical section is code that touches shared state and must not interleave with other critical sections on the same state. Mutual exclusion makes it atomic *with respect to other critical sections* - not with respect to code that bypasses the lock.

**Visibility and Reordering:**
Even without interleaving, a write on one core may not be visible to another core for a while (store buffers, caches), and both compilers and CPUs reorder memory operations that look independent. A \`done = true\` flag polled by another thread without synchronization may never be seen, or be seen *before* the data it was supposed to publish.

**Memory Models:**
A memory model defines which reorderings are allowed and how synchronization establishes **happens-before** edges. Unlocking a mutex happens-before a later lock of it; writing a \`volatile\`/atomic happens-before a later read of it. Anything not ordered by happens-before may be observed in any order. "Volatile makes increments atomic" is a common wrong answer: it gives visibility and ordering, not atomicity.`,
      codeExample: `// Java: the lost update, and three fixes

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;

class Counter {
    private int count = 0;                    // BROKEN under threads
    void incrementRacy() { count++; }         // load, add, store: not atomic
    // Declaring count volatile would NOT fix this: volatile gives visibility, not atomicity

    // Fix 1: mutual exclusion
    synchronized void incrementLocked() { count++; }

    // Fix 2: hardware atomic (compare-and-swap under the hood)
    private final AtomicInteger atomic = new AtomicInteger();
    void incrementAtomic() { atomic.incrementAndGet(); }
}

class Cache {
    private final ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();

    // Check-then-act race: two threads can both see "absent" and both compute
    String getRacy(String key) {
        if (!map.containsKey(key)) {          // check
            map.put(key, expensive(key));     // act - another thread may have won
        }
        return map.get(key);
    }

    // Fix 3: one atomic operation covers check + act
    String getAtomic(String key) {
        return map.computeIfAbsent(key, k -> expensive(k));
    }

    private String expensive(String k) { return k.toUpperCase(); }
}`
    },
    {
      id: 'cs-cc-3',
      title: 'Locks: Mutexes, Deadlock, and Lock-Free',
      content: `A lock serializes access to a critical section. Interviewers care less about the API and more about what goes wrong when you hold two of them.

**Kinds of Locks:**
- **Mutex** - one owner at a time; only the owner may unlock.
- **Reader-writer lock** - many concurrent readers *or* one writer. Wins when reads dominate; a naive implementation can starve writers.
- **Spinlock** - busy-waits instead of sleeping. Good for very short critical sections on multicore; terrible when the holder is descheduled.
- **Reentrant lock** - the owning thread may acquire it again (Java \`synchronized\`, \`ReentrantLock\`). Go\'s \`sync.Mutex\` and default pthread mutexes are *not* reentrant: locking twice from the same goroutine deadlocks.

**Deadlock:**
All four Coffman conditions must hold: mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one and deadlock is impossible. The practical fix is breaking circular wait with a **global lock ordering**: every thread that needs locks A and B acquires them in the same order. Alternatives: \`tryLock\` with backoff, or acquiring all locks at once.

**Livelock:**
Threads keep reacting to each other and never progress - two threads that both back off, retry, collide, back off again. Fix with randomized backoff.

**Starvation:**
A thread is runnable but never scheduled onto the resource, often because a lock is unfair or readers keep arriving. Fair locks (FIFO) trade throughput for bounded wait.

**Lock Granularity:**
Coarse locks are easy and slow; fine-grained locks scale but multiply deadlock risk. Lock striping (a lock per bucket, as in concurrent hash maps) is the usual middle ground.

**Lock-Free and CAS:**
\`compareAndSwap(addr, expected, new)\` atomically writes \`new\` only if the current value equals \`expected\`, returning whether it succeeded. Lock-free structures loop: read, compute, CAS, retry on failure. No thread can block others by being descheduled, but you pay in complexity.

**The ABA Problem:**
A CAS checks *value*, not *history*. Thread 1 reads pointer A; thread 2 pops A, pops B, pushes A back (same address, different meaning); thread 1\'s CAS sees A and succeeds on stale assumptions. Fix: pair the pointer with a version counter (tagged pointer / double-width CAS) or use hazard pointers.`,
      codeExample: `// Go: lock ordering to prevent deadlock, and a CAS retry loop

package main

import (
    "sync"
    "sync/atomic"
)

type Account struct {
    id      int
    mu      sync.Mutex
    balance int
}

// DEADLOCK-PRONE: transfer(a, b) and transfer(b, a) lock in opposite orders
func transferBad(from, to *Account, amt int) {
    from.mu.Lock()
    defer from.mu.Unlock()
    to.mu.Lock()            // may wait forever on a thread holding 'to'
    defer to.mu.Unlock()
    from.balance -= amt
    to.balance += amt
}

// SAFE: always acquire in a global order (by id) -> no circular wait
func transfer(from, to *Account, amt int) {
    first, second := from, to
    if from.id > to.id {
        first, second = to, from
    }
    first.mu.Lock()
    defer first.mu.Unlock()
    second.mu.Lock()
    defer second.mu.Unlock()
    from.balance -= amt
    to.balance += amt
}

// Lock-free increment with compare-and-swap
func incrementCAS(counter *int64) {
    for {
        old := atomic.LoadInt64(counter)
        if atomic.CompareAndSwapInt64(counter, old, old+1) {
            return          // our write won
        }
        // someone else changed it between load and CAS: retry
    }
}

func main() {
    var n int64
    var wg sync.WaitGroup
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() { defer wg.Done(); incrementCAS(&n) }()
    }
    wg.Wait()               // n == 100
}`
    },
    {
      id: 'cs-cc-4',
      title: 'Condition Variables, Semaphores, and the Classic Problems',
      content: `Locks protect state; these primitives let threads *wait for* state. The textbook problems exist because each one exposes a specific failure mode.

**Condition Variables:**
Let a thread sleep until some predicate becomes true, releasing the mutex while it sleeps and re-acquiring it before waking. Rules that interviewers check:
- Always \`wait\` inside a \`while (!predicate)\` loop, never an \`if\`. Wakeups can be **spurious**, and another thread may have consumed the condition between the notify and your wake-up.
- Hold the mutex when changing the predicate and when calling \`wait\`.
- \`notify_one\` wakes one waiter; \`notify_all\` wakes all. Use \`notify_all\` when waiters wait on different predicates.

**Semaphores:**
A counter with atomic \`acquire\` (decrement, block at zero) and \`release\` (increment). A semaphore has **no owner**: any thread may release, which makes it a signaling tool, not just a lock. A binary semaphore looks like a mutex but lacks ownership, so it cannot detect a non-owner unlocking. Counting semaphores bound access to N resources (connection pools, rate limits).

**Barriers and Latches:**
A barrier blocks every thread until all N arrive, then releases them together (phased parallel algorithms). A countdown latch is one-shot: wait until the count reaches zero (\`WaitGroup\` in Go, \`CountDownLatch\` in Java).

**Producer-Consumer (Bounded Buffer):**
Producers block when the buffer is full; consumers block when empty. Two conditions (\`notFull\`, \`notEmpty\`) plus one mutex, or two semaphores (\`empty\` slots, \`filled\` slots) plus a mutex. The bounded size is the point: it applies backpressure so producers cannot outrun consumers into memory exhaustion.

**Readers-Writers:**
Reader preference lets readers keep entering while a writer waits, starving it. Writer preference blocks new readers once a writer is queued. Real RW locks usually offer a fairness policy.

**Dining Philosophers:**
Five philosophers, five forks, each needs two. If everyone grabs the left fork first, all wait forever: circular wait. Fixes: number the forks and always pick the lower one first (breaks circular wait), allow at most four at the table (a semaphore), or an arbiter that grants both forks atomically.`,
      codeExample: `# Python: a bounded blocking queue built from a mutex + two conditions

import threading
from collections import deque

class BoundedQueue:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = deque()
        self.lock = threading.Lock()
        self.not_full = threading.Condition(self.lock)
        self.not_empty = threading.Condition(self.lock)

    def put(self, item):
        with self.not_full:                     # acquires self.lock
            while len(self.items) >= self.capacity:   # while, not if
                self.not_full.wait()            # releases lock while sleeping
            self.items.append(item)
            self.not_empty.notify()             # one consumer can proceed

    def get(self):
        with self.not_empty:
            while not self.items:               # guards against spurious wakeups
                self.not_empty.wait()
            item = self.items.popleft()
            self.not_full.notify()              # one producer can proceed
            return item

q = BoundedQueue(capacity=2)
SENTINEL = object()

def producer():
    for i in range(5):
        q.put(i)                                # blocks when 2 items are waiting
    q.put(SENTINEL)                             # tells the consumer to stop

def consumer():
    while True:
        item = q.get()                          # blocks when empty
        if item is SENTINEL:
            break
        print("consumed", item)

threads = [threading.Thread(target=producer), threading.Thread(target=consumer)]
for t in threads: t.start()
for t in threads: t.join()

# Same idea with a counting semaphore bounding a resource:
pool = threading.Semaphore(3)                   # at most 3 concurrent users
def use_connection():
    with pool:                                  # acquire; release on exit
        pass                                    # ... do work ...`
    },
    {
      id: 'cs-cc-5',
      title: 'Thread Pools, Futures, Backpressure, and Cancellation',
      content: `Production code rarely spawns raw threads. It submits work to a pool and gets back a handle. The design questions are about sizing, queuing, and what happens when work must stop.

**Thread Pools:**
A fixed set of worker threads pulling tasks from a queue. Benefits: bounded resource use, amortized thread creation, a natural place for metrics. Sizing rules of thumb:
- CPU-bound: about the number of cores (more just adds context switching)
- I/O-bound: cores × (1 + wait time / compute time), or use async I/O instead
- Never share one pool between latency-sensitive and long-running tasks; the long ones starve the short ones

**Work Queues and Backpressure:**
An unbounded queue turns a slow consumer into an out-of-memory crash. A bounded queue forces a policy when full: **block** the producer (backpressure), **reject** (fail fast, let the caller retry), or **drop** (shed load). Backpressure propagates: if the database is slow, the service should slow its intake instead of buffering forever. Reactive streams formalize this as the consumer requesting N items.

**Futures and Promises:**
A future is a read-only handle to a value that may not exist yet; a promise is the write side that completes it. Composition (\`then\`, \`thenCombine\`, \`allOf\`) avoids blocking a thread while waiting. Blocking \`.get()\` inside a pool task is a classic deadlock: every worker waits on a task that needs a free worker.

**Cancellation:**
Cancellation is **cooperative** in almost every runtime. Nobody can safely kill a thread mid-instruction (locks stay held, invariants break), so the runtime sets a flag and the task must check it:
- Java: \`Thread.interrupt()\` sets a flag; blocking calls throw \`InterruptedException\`; CPU loops must poll \`isInterrupted()\`
- Go: pass a \`context.Context\`; goroutines select on \`ctx.Done()\`
- Python asyncio: \`task.cancel()\` raises \`CancelledError\` at the next \`await\`
Swallowing the interrupt/cancellation and continuing is a bug: propagate it or restore the flag.

**Timeouts:**
Every blocking call across a boundary (network, lock, queue) needs a timeout, or one stuck dependency ties up every worker. Pair timeouts with cancellation so the abandoned work stops consuming resources, and be careful with **retries**: retrying a non-idempotent operation after a timeout may execute it twice.`,
      codeExample: `// Go: worker pool with a bounded queue, context cancellation, and timeout

package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type Job struct{ ID int }

func worker(ctx context.Context, id int, jobs <-chan Job, results chan<- string, wg *sync.WaitGroup) {
    defer wg.Done()
    for {
        select {
        case <-ctx.Done():                 // cancelled or timed out: stop cooperatively
            return
        case job, ok := <-jobs:
            if !ok {
                return                     // queue closed, no more work
            }
            time.Sleep(50 * time.Millisecond)   // simulated work
            results <- fmt.Sprintf("worker %d did job %d", id, job.ID)
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
    defer cancel()                         // always release the timer

    jobs := make(chan Job, 4)              // bounded: producers block when 4 queued
    results := make(chan string, 16)
    var wg sync.WaitGroup

    for w := 1; w <= 3; w++ {              // fixed pool of 3 workers
        wg.Add(1)
        go worker(ctx, w, jobs, results, &wg)
    }

    go func() {                            // producer feels backpressure via the channel
        defer close(jobs)
        for i := 0; i < 20; i++ {
            select {
            case jobs <- Job{ID: i}:
            case <-ctx.Done():
                return                     // note: a bare 'break' would only exit the select
            }
        }
    }()

    wg.Wait()                              // workers exit on close OR ctx timeout
    close(results)
    for r := range results {
        fmt.Println(r)
    }
    fmt.Println("stopped:", ctx.Err())     // context deadline exceeded
}`
    },
    {
      id: 'cs-cc-6',
      title: 'Testing and Debugging Concurrent Code',
      content: `Concurrency bugs are the ones a passing test suite does not catch. The interview question is usually "how would you make this safe?" and the strongest answers remove the possibility of the bug rather than add locks.

**Design Away the Problem:**
- **Immutability** - data that never changes can be shared freely with no synchronization. Build new values instead of mutating.
- **Thread confinement** - only one thread ever touches the object (per-thread state, UI-thread rules, actor-owned state). No sharing, no race.
- **Ownership transfer** - hand an object across a channel or queue and stop touching it. Rust encodes this in the type system.
- **Idempotency** - operations that can be applied twice safely make retries and at-least-once delivery correct. Use idempotency keys for payments and side effects.
- **Prefer higher-level primitives** - concurrent collections, atomics, executors, channels. Hand-rolled locking is where bugs live.

**Symptoms and What They Mean:**
- Fails only under load or in CI, never locally: a race
- Hangs with no CPU usage: deadlock (take a thread dump; look for a cycle of "waiting to lock X, held by Y")
- Hangs with 100% CPU: livelock or a spin loop on a stale value
- Counts slightly off: lost update
- Works after adding a \`print\`: timing changed; you have a race, not a fix

**Making Tests Deterministic:**
- Use latches/barriers to force the exact interleaving you want to test: start N threads, hold them at a barrier, release together
- Inject the scheduler or clock so tests control ordering and time
- Run suspect tests many times and under stress (thousands of iterations, more threads than cores)
- Property-based and model-checking tools explore interleavings systematically

**Tooling:**
- **ThreadSanitizer (TSan)** - instruments C/C++/Go/Rust builds and reports data races with both stack traces. Go: \`go test -race\`.
- **Deadlock detection** - JVM thread dumps flag deadlocks; lock-order checkers report inconsistent acquisition order.
- **Static analysis** - Rust\'s borrow checker and \`Send\`/\`Sync\`, Java\'s \`@GuardedBy\` annotations, Go vet\'s copy-lock checks.

**Debugging Rule:**
Reproduce first. A concurrency bug you cannot reproduce is one you cannot prove you fixed. Amplify it (stress, sanitizer, injected delays) until it fails reliably, then fix, then run the amplified test again.`,
      codeExample: `// Java: forcing an interleaving with a barrier so a race fails reliably

import java.util.concurrent.*;

public class RaceTest {
    static int counter = 0;                          // the unit under test

    public static void main(String[] args) throws Exception {
        int threads = 8, itersEach = 10_000;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CyclicBarrier startLine = new CyclicBarrier(threads);   // release all at once
        CountDownLatch done = new CountDownLatch(threads);

        for (int t = 0; t < threads; t++) {
            pool.submit(() -> {
                try {
                    startLine.await();               // maximize overlap
                    for (int i = 0; i < itersEach; i++) counter++;   // racy
                } catch (Exception e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        if (!done.await(5, TimeUnit.SECONDS)) {      // timeout: never wait forever
            throw new AssertionError("hung: possible deadlock");
        }
        pool.shutdown();

        int expected = threads * itersEach;
        // Without the barrier this often passes by luck; with it, it fails nearly every run.
        System.out.println(counter == expected ? "PASS" : "LOST UPDATES: " + (expected - counter));
    }
}

// Thread-confined alternative: no lock needed because only one thread owns it
class PerThreadCounter {
    private static final ThreadLocal<int[]> local = ThreadLocal.withInitial(() -> new int[1]);
    static void increment() { local.get()[0]++; }    // each thread has its own cell
}`
    }
  ],

  visualizations: [
    {
      title: 'Lost Update Race',
      description: 'Two threads increment the same counter without synchronization; one write overwrites the other',
      nodes: [
        { id: 'shared', label: 'counter = 5', x: 190, y: 40, type: 'primary' },
        { id: 'ra', label: 'Thread A\nreads 5', x: 70, y: 120, type: 'info' },
        { id: 'rb', label: 'Thread B\nreads 5', x: 310, y: 120, type: 'info' },
        { id: 'wa', label: 'A writes 6', x: 70, y: 200, type: 'secondary' },
        { id: 'wb', label: 'B writes 6', x: 310, y: 200, type: 'secondary' },
        { id: 'result', label: 'counter = 6\nexpected 7', x: 190, y: 280, type: 'error' }
      ],
      edges: [
        { from: 'shared', to: 'ra', label: 'load' },
        { from: 'shared', to: 'rb', label: 'load' },
        { from: 'ra', to: 'wa', label: '5 + 1' },
        { from: 'rb', to: 'wb', label: '5 + 1' },
        { from: 'wa', to: 'result', label: 'store' },
        { from: 'wb', to: 'result', label: 'store overwrites' }
      ]
    },
    {
      title: 'Producer–Consumer with a Bounded Buffer',
      description: 'A fixed-size queue blocks producers when full and consumers when empty, applying backpressure',
      nodes: [
        { id: 'prod', label: 'Producer', x: 60, y: 60, type: 'primary' },
        { id: 'buf', label: 'Bounded buffer\ncapacity N', x: 190, y: 160, type: 'secondary' },
        { id: 'cons', label: 'Consumer', x: 320, y: 60, type: 'primary' },
        { id: 'full', label: 'Full?\nproducer waits\non notFull', x: 60, y: 260, type: 'warning' },
        { id: 'empty', label: 'Empty?\nconsumer waits\non notEmpty', x: 320, y: 260, type: 'warning' }
      ],
      edges: [
        { from: 'prod', to: 'buf', label: 'put (lock)' },
        { from: 'buf', to: 'cons', label: 'get (lock)' },
        { from: 'buf', to: 'full', label: 'size == N' },
        { from: 'buf', to: 'empty', label: 'size == 0' },
        { from: 'cons', to: 'full', label: 'notify notFull' },
        { from: 'prod', to: 'empty', label: 'notify notEmpty' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-cc-c1', front: 'What is the difference between concurrency and parallelism?', back: 'Concurrency is structuring a program to handle many tasks at once (interleaving); parallelism is executing many tasks at the same instant on multiple cores. A single core can be concurrent but never parallel.' },
    { id: 'cs-cc-c2', front: 'What does Amdahl\'s law say about adding cores?', back: 'Speedup is capped by the serial fraction of the program. If 10% must run serially, the maximum speedup is 10x no matter how many cores you add.' },
    { id: 'cs-cc-c3', front: 'Why does blocking inside an event-loop callback hurt so much?', back: 'The loop has one thread. A blocking call (sync I/O, a long CPU loop) stops every other pending callback and timer until it returns, so the entire process appears frozen.' },
    { id: 'cs-cc-c4', front: 'How does async/await differ from OS threads in terms of scheduling?', back: 'async/await is cooperative: a task only yields at an await, so there is no preemption and fewer interleavings to reason about. OS threads are preemptive and can be interrupted between any two instructions.' },
    { id: 'cs-cc-c5', front: 'What is the actor model\'s answer to shared-state bugs?', back: 'No shared state. Each actor owns its data and only communicates through asynchronous messages placed in its mailbox, processed one at a time, so no locks are needed inside an actor.' },
    { id: 'cs-cc-c6', front: 'What is the CSP philosophy behind Go channels?', back: '"Share memory by communicating, don\'t communicate by sharing memory." Ownership of data moves through a channel from one goroutine to another instead of both touching it under a lock.' },
    { id: 'cs-cc-c7', front: 'What is the difference between a data race and a race condition?', back: 'A data race is unsynchronized concurrent access to one memory location where at least one access is a write. A race condition is any timing-dependent logic bug, and it can exist even when every individual access is locked.' },
    { id: 'cs-cc-c8', front: 'Why is counter++ not thread-safe even though it is one line?', back: 'It compiles to load, add, store. Two threads can both load the same value, both add one, and both store, so one increment is lost. Atomicity needs a lock or an atomic instruction.' },
    { id: 'cs-cc-c9', front: 'What is a check-then-act (TOCTOU) race and how do you fix it?', back: 'A check (e.g. "key absent?") and an act (insert) are separate steps; another thread can change state between them. Fix by making the pair one atomic operation (putIfAbsent, computeIfAbsent) or holding a lock across both.' },
    { id: 'cs-cc-c10', front: 'What guarantees does volatile (Java) give, and what does it not give?', back: 'Visibility and ordering: a write is seen by later reads on other threads, and it establishes happens-before. It does not make compound operations like ++ atomic.' },
    { id: 'cs-cc-c11', front: 'What is a happens-before relationship?', back: 'An ordering guarantee from the memory model: if A happens-before B, the effects of A are visible to B. Unlock/lock, volatile write/read, thread start/join, and channel send/receive create these edges; unordered operations may be observed in any order.' },
    { id: 'cs-cc-c12', front: 'Why can a thread polling a plain boolean flag spin forever even after another thread sets it?', back: 'Without synchronization the compiler may hoist the read out of the loop and the CPU may keep a stale cached value; nothing forces visibility. Use an atomic/volatile flag or a lock.' },
    { id: 'cs-cc-c13', front: 'What is a reentrant lock and which common mutexes are NOT reentrant?', back: 'A lock the owning thread can acquire again without deadlocking (Java synchronized and ReentrantLock). Go\'s sync.Mutex and default pthread mutexes are not reentrant; locking twice in one thread hangs.' },
    { id: 'cs-cc-c14', front: 'What are the four Coffman conditions for deadlock?', back: 'Mutual exclusion, hold-and-wait, no preemption, and circular wait. All four must hold; breaking any one (most practically, circular wait via lock ordering) makes deadlock impossible.' },
    { id: 'cs-cc-c15', front: 'How does a global lock ordering prevent deadlock?', back: 'If every thread acquires locks in the same total order, no thread can hold a later lock while waiting for an earlier one, so a cycle of waits cannot form. This breaks the circular-wait condition.' },
    { id: 'cs-cc-c16', front: 'What is livelock and how does it differ from deadlock?', back: 'In livelock threads are active but make no progress because they keep reacting to each other (both back off and retry in lockstep). Deadlock is blocked waiting; livelock burns CPU. Randomized backoff breaks the symmetry.' },
    { id: 'cs-cc-c17', front: 'When does a reader-writer lock beat a plain mutex, and what is its risk?', back: 'When reads vastly outnumber writes, since readers proceed in parallel. The risk is writer starvation under reader preference: readers keep arriving and the writer never gets in.' },
    { id: 'cs-cc-c18', front: 'What is a spinlock and when is it appropriate?', back: 'A lock that busy-waits in a loop instead of sleeping. Good for very short critical sections on multicore where the wait is shorter than a context switch; harmful when the holder can be descheduled or on a single core.' },
    { id: 'cs-cc-c19', front: 'What does compare-and-swap (CAS) do?', back: 'Atomically: if the value at an address equals the expected value, write the new value and report success; otherwise report failure without writing. Lock-free algorithms loop on read, compute, CAS, retry.' },
    { id: 'cs-cc-c20', front: 'What is the ABA problem?', back: 'CAS checks equality of value, not history. If a location goes A to B back to A between a thread\'s read and its CAS, the CAS succeeds on stale assumptions (e.g. a recycled node in a lock-free stack). Fix with a version tag or hazard pointers.' },
    { id: 'cs-cc-c21', front: 'Why must condition-variable waits be in a while loop rather than an if?', back: 'Wakeups can be spurious, and between the notify and this thread re-acquiring the mutex another thread may have consumed the condition. Re-checking the predicate after every wakeup is the only safe pattern.' },
    { id: 'cs-cc-c22', front: 'What happens to the mutex while a thread is blocked in condition_variable.wait()?', back: 'wait atomically releases the mutex and sleeps; on wakeup it re-acquires the mutex before returning. That is why the predicate can be safely re-checked immediately after wait returns.' },
    { id: 'cs-cc-c23', front: 'What distinguishes a semaphore from a mutex?', back: 'A semaphore is a counter with no ownership: any thread may release it, and it can allow N concurrent holders. A mutex has exactly one owner who must be the one to unlock it. Semaphores signal; mutexes protect.' },
    { id: 'cs-cc-c24', front: 'Why is the buffer in producer-consumer bounded?', back: 'A bound makes producers block when consumers fall behind, applying backpressure. An unbounded buffer lets a slow consumer turn into unbounded memory growth and an eventual crash.' },
    { id: 'cs-cc-c25', front: 'Name two fixes for the dining philosophers deadlock.', back: 'Impose a fork ordering (always pick up the lower-numbered fork first, breaking circular wait), or limit seating to four philosophers with a semaphore so at least one can always eat. An arbiter granting both forks atomically also works.' },
    { id: 'cs-cc-c26', front: 'How should a thread pool be sized for CPU-bound vs I/O-bound work?', back: 'CPU-bound: about the number of cores, since extra threads only add context switching. I/O-bound: more threads, roughly cores x (1 + wait/compute), or switch to async I/O so threads are not parked on waits.' },
    { id: 'cs-cc-c27', front: 'What are the three policies for a bounded work queue that is full?', back: 'Block the producer (backpressure), reject the task (fail fast so the caller can retry or degrade), or drop work (load shedding). Choosing one explicitly is better than an unbounded queue that hides the problem until OOM.' },
    { id: 'cs-cc-c28', front: 'Why is calling future.get() inside a task running on the same fixed pool dangerous?', back: 'If every worker blocks waiting on a future whose task needs a free worker, no worker is free and the pool deadlocks. Compose futures (then/allOf) or use a separate pool for dependent work.' },
    { id: 'cs-cc-c29', front: 'Why is cancellation cooperative in most runtimes?', back: 'Killing a thread at an arbitrary instruction leaves locks held and invariants broken. Instead the runtime sets a flag (interrupt, context.Done, CancelledError at the next await) and the task must check it and clean up.' },
    { id: 'cs-cc-c30', front: 'What does ThreadSanitizer (or go test -race) detect, and what is its limitation?', back: 'Data races: unsynchronized conflicting accesses, reported with both stack traces. It only sees races in interleavings that actually execute during the run, so it can miss races your test never triggers; it also slows and bloats the program.' }
  ],

  quizQuestions: [
    {
      id: 'cs-cc-q1',
      question: 'A program runs 8 tasks by interleaving them on a single CPU core. Which statement is accurate?',
      options: ['It is parallel but not concurrent', 'It is concurrent but not parallel', 'It is both concurrent and parallel', 'It is neither, because only one core exists'],
      correctAnswer: 1,
      explanation: 'Concurrency is about managing multiple tasks at once through interleaving; parallelism requires simultaneous execution on multiple cores. One core can be concurrent but never parallel.'
    },
    {
      id: 'cs-cc-q2',
      question: 'In an asyncio program, one coroutine runs a tight CPU loop for 5 seconds without any await. What happens to the other coroutines?',
      options: ['They keep running on other event-loop threads', 'They are preempted in and out by the scheduler every few ms', 'They make no progress until the loop finishes', 'They are automatically moved to a thread pool'],
      correctAnswer: 2,
      explanation: 'async/await is cooperative on a single thread; a task only yields at an await. A CPU loop with no await holds the loop, so every other coroutine, timer, and I/O callback stalls until it returns.'
    },
    {
      id: 'cs-cc-q3',
      question: 'Two threads each execute count += 1 once on a shared int starting at 0, with no synchronization. Which final values are possible?',
      options: ['Only 2', 'Only 1', '1 or 2', '0, 1, or 2'],
      correctAnswer: 2,
      explanation: 'Each increment is load, add, store. If the loads interleave both threads read 0 and both write 1 (a lost update); otherwise the result is 2. Zero is impossible because at least one store of 1 always happens.'
    },
    {
      id: 'cs-cc-q4',
      question: 'Code does: if (!map.containsKey(k)) { map.put(k, compute(k)); } using a ConcurrentHashMap. What is the problem?',
      options: ['A check-then-act race: two threads can both see "absent" and both compute and put', 'ConcurrentHashMap does not allow containsKey', 'It deadlocks because put acquires a lock containsKey still holds', 'Nothing - ConcurrentHashMap makes the whole block atomic'],
      correctAnswer: 0,
      explanation: 'Each map call is individually thread-safe, but the combination is not. Another thread can insert between the check and the act. computeIfAbsent performs both steps as one atomic operation.'
    },
    {
      id: 'cs-cc-q5',
      question: 'A Java field is declared volatile int hits. Ten threads each run hits++ 1000 times. What is the most likely outcome?',
      options: ['Exactly 10000 - volatile makes ++ atomic', 'Fewer than 10000 - volatile gives visibility, not atomicity', 'A compile error - volatile fields cannot be incremented', 'More than 10000 due to duplicated writes'],
      correctAnswer: 1,
      explanation: 'volatile guarantees that writes are visible and ordered, but ++ is still a read-modify-write sequence that other threads can interleave, so increments get lost. Use AtomicInteger or a lock.'
    },
    {
      id: 'cs-cc-q6',
      question: 'Thread A writes data = 42 and then done = true (both plain fields). Thread B spins on done and then reads data. Without synchronization, what may B observe?',
      options: ['B always sees data == 42 once done is true', 'B sees a deterministic result on every hardware platform', 'B throws an exception on the stale read', 'B may see done == true and data == 0, or never see done at all'],
      correctAnswer: 3,
      explanation: 'Compilers and CPUs may reorder the two independent stores, and without a happens-before edge B has no visibility guarantee. Making done an atomic/volatile establishes the ordering so data is published before the flag.'
    },
    {
      id: 'cs-cc-q7',
      question: 'Which single change guarantees that two threads acquiring locks A and B can never deadlock with each other?',
      options: ['Make both locks reentrant', 'Use spinlocks instead of mutexes', 'Both threads always acquire A before B', 'Hold each lock for as short a time as possible'],
      correctAnswer: 2,
      explanation: 'A consistent global acquisition order removes the circular-wait condition, so no cycle of waits can form. Reentrancy, spinning, and short hold times reduce contention but do not eliminate deadlock.'
    },
    {
      id: 'cs-cc-q8',
      question: 'A Go function locks a sync.Mutex, then calls a helper that locks the same mutex. What happens?',
      options: ['The goroutine deadlocks; sync.Mutex is not reentrant', 'The helper acquires it again because the same goroutine owns it', 'The runtime panics with "lock already held"', 'The second Lock is silently ignored'],
      correctAnswer: 0,
      explanation: 'Go mutexes have no notion of owner and are not reentrant, so the second Lock blocks forever waiting for an Unlock that can never come. Java synchronized would allow it.'
    },
    {
      id: 'cs-cc-q9',
      question: 'Two threads repeatedly collide, both back off for the same fixed time, retry, and collide again indefinitely. This is best described as:',
      options: ['Deadlock', 'Starvation', 'Livelock', 'Priority inversion'],
      correctAnswer: 2,
      explanation: 'Both threads are running and changing state but neither makes progress, which is livelock. Deadlock would have them blocked. Randomizing the backoff breaks the symmetry.'
    },
    {
      id: 'cs-cc-q10',
      question: 'A lock-free stack pops by reading top = head, then CAS(head, top, top.next). Why can this corrupt the stack when nodes are recycled?',
      options: ['CAS is not atomic on pointers', 'Reading head without a lock is undefined behavior', 'CAS spuriously fails on recycled addresses', 'The ABA problem: head may be A again after other threads popped A and B and pushed A back, so top.next is stale'],
      correctAnswer: 3,
      explanation: 'CAS only compares the pointer value. If head went A to B to A, the CAS succeeds but top.next refers to the old chain, corrupting the stack. Tagged pointers with a version counter or hazard pointers prevent this.'
    },
    {
      id: 'cs-cc-q11',
      question: 'A consumer does: lock(); if (queue.empty()) cond.wait(); item = queue.pop(); unlock(); Why is this wrong?',
      options: ['wait() must be called without holding the lock', 'The if should be a while: spurious wakeups or another consumer may leave the queue empty after wait returns', 'pop() must happen before wait()', 'Condition variables cannot be used with queues'],
      correctAnswer: 1,
      explanation: 'wait can return spuriously, and another consumer may drain the queue between the notify and this thread re-acquiring the lock. Re-checking in a while loop guards against popping an empty queue.'
    },
    {
      id: 'cs-cc-q12',
      question: 'Which property of a semaphore makes it suitable for signaling between threads in a way a mutex is not?',
      options: ['It has no owner, so one thread can release what another acquired', 'It is always faster than a mutex', 'It automatically detects deadlocks', 'It can only be held by one thread at a time'],
      correctAnswer: 0,
      explanation: 'Mutexes must be unlocked by their owner. A semaphore is just a counter, so a producer can release a "filled" permit that a consumer later acquires. That lack of ownership is what makes it a signaling primitive.'
    },
    {
      id: 'cs-cc-q13',
      question: 'In a reader-writer lock with reader preference and a constant stream of readers, what happens to a waiting writer?',
      options: ['It is granted the lock as soon as the current readers finish', 'It preempts readers after a timeout', 'It may starve indefinitely because new readers keep entering', 'It is upgraded to a read lock'],
      correctAnswer: 2,
      explanation: 'Reader preference admits new readers while any reader holds the lock, so the reader count never drops to zero and the writer never runs. Writer-preference or fair policies block new readers once a writer is queued.'
    },
    {
      id: 'cs-cc-q14',
      question: 'All five dining philosophers pick up the fork on their left, then wait for the one on their right. Which deadlock condition does numbering the forks and always taking the lower-numbered one first eliminate?',
      options: ['Mutual exclusion', 'Hold-and-wait', 'No preemption', 'Circular wait'],
      correctAnswer: 3,
      explanation: 'Ordered acquisition means the philosopher between forks 4 and 0 picks up fork 0 first, breaking the cycle of everyone waiting on their right neighbor. That is the circular-wait condition.'
    },
    {
      id: 'cs-cc-q15',
      question: 'A service uses a fixed pool of 4 threads. Each task submits a sub-task to the same pool and calls subFuture.get(). Under load, the service hangs. Why?',
      options: ['get() is not allowed inside a pool', 'All 4 workers block in get() waiting on sub-tasks that need a free worker, so none can run', 'The pool silently drops sub-tasks', 'get() releases the lock the sub-task needs'],
      correctAnswer: 1,
      explanation: 'This is thread-pool starvation deadlock: every worker is parked waiting, and the sub-tasks sit in the queue with no worker to run them. Compose futures asynchronously or run dependent work on a different pool.'
    },
    {
      id: 'cs-cc-q16',
      question: 'A worker consumes from an unbounded in-memory queue, and the producer is faster than the consumer. What is the eventual outcome?',
      options: ['The queue grows until the process runs out of memory', 'The producer is automatically slowed to match', 'The oldest items are dropped', 'Throughput stays constant since queues are O(1)'],
      correctAnswer: 0,
      explanation: 'An unbounded queue provides no backpressure, so the backlog grows without limit. A bounded queue forces an explicit policy (block, reject, or drop) before memory is exhausted.'
    },
    {
      id: 'cs-cc-q17',
      question: 'A Java task catches InterruptedException, logs it, and continues its loop. What is wrong with this?',
      options: ['Nothing; the exception was handled', 'InterruptedException cannot be caught', 'The thread is killed immediately after the catch block', 'Catching it clears the interrupt flag, so cancellation is swallowed and the task never stops'],
      correctAnswer: 3,
      explanation: 'Throwing InterruptedException resets the interrupt status. Swallowing it means callers cannot cancel the task. Either propagate the exception or call Thread.currentThread().interrupt() to restore the flag before continuing to clean up.'
    },
    {
      id: 'cs-cc-q18',
      question: 'An HTTP client call times out after 2s and the caller retries. The endpoint charges a credit card. What is the safest design?',
      options: ['Retry immediately; the timeout proves the first call failed', 'Never use timeouts on payment calls', 'Send an idempotency key so the server executes the charge at most once across retries', 'Increase the timeout to 60s to avoid retries'],
      correctAnswer: 2,
      explanation: 'A timeout does not mean the request was not processed; the server may have charged and been slow to respond. Idempotency keys let retries be safe. Removing timeouts just ties up workers on stuck calls.'
    },
    {
      id: 'cs-cc-q19',
      question: 'A test for a concurrent counter passes 100 times locally but fails in CI. Which action most directly makes the bug reproducible?',
      options: ['Add a print statement inside the increment', 'Start all threads behind a barrier and release them together, then run many iterations', 'Reduce the thread count to 1 to isolate the logic', 'Add Thread.sleep before each increment'],
      correctAnswer: 1,
      explanation: 'A barrier maximizes overlap of the racy operations so the interleaving that loses updates happens almost every run. Prints and sleeps change timing unpredictably, and one thread cannot exhibit a race at all.'
    },
    {
      id: 'cs-cc-q20',
      question: 'Which approach eliminates the possibility of a data race on an object rather than merely guarding it?',
      options: ['Making the object immutable and sharing it freely', 'Wrapping every method in synchronized', 'Using a reentrant lock instead of a plain mutex', 'Marking every field volatile'],
      correctAnswer: 0,
      explanation: 'A data race requires a write. An immutable object is never written after construction, so any number of threads can read it with no synchronization. Locks and volatile still leave room for misuse.'
    }
  ]
};
