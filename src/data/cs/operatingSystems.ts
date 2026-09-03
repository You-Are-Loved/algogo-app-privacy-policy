// CS Fundamentals - Operating Systems
// Processes, threads, scheduling, memory management, and the syscalls behind everything you run

import { Category } from '../../types';

export const operatingSystems: Category = {
  id: 'cs-operating-systems',
  name: 'Operating Systems',
  slug: 'cs-operating-systems',
  description: 'Processes, threads, scheduling, memory management, and the syscalls behind everything you run',
  icon: 'hardware-chip-outline',
  color: '#8B5CF6',
  colorDark: '#7C3AED',
  premium: true,

  learnContent: [
    {
      id: 'cs-os-1',
      title: 'Processes vs Threads',
      content: `"What is the difference between a process and a thread?" is the most common OS interview question. The good answer is about what is shared, what a context switch costs, and how new ones are created.

**Process:**
- A running program plus its resources: a private **virtual address space**, open file descriptors, environment, signal handlers, credentials, and at least one thread
- Isolation is the point: one process cannot read another's memory without explicit IPC, and a crash is contained
- The kernel tracks each process in a process control block (PCB / \`task_struct\`)

**Thread:**
- An execution context inside a process: its own program counter, registers, and **stack**; everything else (heap, globals, code, file descriptors) is shared with sibling threads
- Cheap to create and communicate (shared memory), dangerous for the same reason: data races, and one thread's segfault kills the whole process

**Context Switch Cost:**
- Direct: trap into the kernel, save registers and stack pointer, pick the next task, restore its registers, return - on the order of 1-2 microseconds
- Indirect and usually larger: the new task's working set is not in cache, so it suffers cache misses; a **process** switch also changes the page table, which invalidates TLB entries (mitigated by PCID/ASID tagging)
- Thread switches within a process skip the page-table change, so they are cheaper. User-space threads (green threads, goroutines, async tasks) switch without the kernel at all, at tens of nanoseconds.

**Creating Processes: fork and exec:**
- \`fork()\` clones the calling process. The child gets a copy of the address space, implemented lazily with **copy-on-write**: pages are shared read-only until one side writes. fork returns the child's PID to the parent and 0 to the child.
- \`exec()\` replaces the current process image with a new program, keeping the PID and open file descriptors. This is how a shell runs a command: fork, then exec in the child, while the parent \`wait()\`s.
- Separating the two lets the child rewire descriptors (redirects, pipes) between fork and exec
- \`posix_spawn\` and \`vfork\` exist because fork of a huge process still has to copy page tables

**Zombies and Orphans:**
- A **zombie** has exited but its parent has not called \`wait()\`; only the PCB remains so the exit status can be collected
- An **orphan** outlives its parent and is adopted by init (PID 1), which reaps it

**Thread Models:**
- 1:1 (Linux pthreads, Windows): each user thread is a kernel thread; the kernel schedules them on multiple cores
- M:N (Go goroutines, Java virtual threads): a runtime multiplexes many user threads on a few kernel threads; blocking syscalls need special handling
- Languages with a global interpreter lock (CPython) run threads for I/O concurrency but not CPU parallelism; use processes for that`,
      codeExample: `#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    int counter = 42;

    pid_t pid = fork();                 // one process in, two out
    if (pid < 0) {
        perror("fork");
        return 1;
    }

    if (pid == 0) {
        // Child: private copy-on-write view of the parent's memory
        counter += 1;                   // parent does NOT see this
        printf("child  pid=%d counter=%d\\n", getpid(), counter);

        // Replace this process image with 'ls -l'; PID stays the same.
        // On success exec never returns.
        execlp("ls", "ls", "-l", (char *)NULL);
        perror("execlp");               // only reached on failure
        _exit(127);
    }

    // Parent: wait so the child does not linger as a zombie
    int status;
    waitpid(pid, &status, 0);
    printf("parent pid=%d counter=%d child exit=%d\\n",
           getpid(), counter, WEXITSTATUS(status));   // counter still 42
    return 0;
}

/* Threads share the address space; a plain counter needs a lock.

#include <pthread.h>
static long shared = 0;
static pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;

void *worker(void *arg) {
    for (int i = 0; i < 1000000; i++) {
        pthread_mutex_lock(&mtx);
        shared++;                       // without the lock: lost updates
        pthread_mutex_unlock(&mtx);
    }
    return NULL;
}
*/`
    },
    {
      id: 'cs-os-2',
      title: 'CPU Scheduling',
      content: `The scheduler decides which runnable thread gets a CPU and for how long. Interviewers probe the tradeoffs between throughput, fairness, and latency, and a few classic failure modes.

**Preemptive vs Cooperative:**
- Cooperative: a task runs until it yields or blocks. Simple, but one misbehaving task freezes the system (classic Mac OS, early Windows, most async runtimes within one thread).
- Preemptive: a periodic **timer interrupt** (the "tick", typically 100-1000 Hz) or an event lets the kernel take the CPU away. All modern general-purpose kernels are preemptive.

**Metrics:**
- Turnaround (submit to finish), waiting time (in the run queue), response time (submit to first run), throughput, fairness
- Interactive workloads care about response time; batch workloads care about throughput. No policy optimizes both.

**Classic Policies:**
- **FCFS:** simplest; suffers the **convoy effect** where a long CPU-bound job makes short jobs wait
- **Shortest Job First:** provably minimizes average waiting time, but needs to know burst lengths. Its preemptive form (shortest remaining time) starves long jobs.
- **Round robin:** each task runs for a time quantum, then goes to the back of the queue. Quantum too small → context-switch overhead dominates; too large → degenerates into FCFS. Typical: a few milliseconds.
- **Priority:** run the highest priority first. Risk: **starvation** of low-priority tasks; fix with **aging** (priority rises while waiting).
- **Multilevel feedback queue:** several round-robin queues; tasks that use a full quantum drop to a lower-priority, longer-quantum queue, and tasks that block early stay high. This automatically favors I/O-bound interactive tasks without prior knowledge.

**Linux CFS (Completely Fair Scheduler):**
- Tracks each task's **virtual runtime** (CPU time weighted by its nice value); always runs the task with the smallest vruntime
- Runnable tasks live in a red-black tree keyed by vruntime, so picking the next task is O(log n) and the leftmost node is cached
- The time slice is a share of a target latency period rather than a fixed quantum, so latency stays bounded as the run queue grows
- Linux 6.6 replaced CFS with EEVDF, which keeps the weighted-fairness idea but adds explicit latency deadlines

**Multicore:**
- Per-CPU run queues avoid a global lock; a load balancer migrates tasks periodically
- Migration is expensive because caches are cold, so schedulers prefer keeping a task on its previous core (**affinity**)

**Priority Inversion:**
A low-priority task holds a lock a high-priority task needs; a medium-priority task preempts the low one, so the high-priority task waits on something that is not even running. The Mars Pathfinder reset loop was exactly this. Fixes: **priority inheritance** (the lock holder temporarily inherits the waiter's priority) or **priority ceiling** protocols.`,
      codeExample: `from collections import deque

def round_robin(jobs, quantum):
    """jobs: list of (name, burst). Returns per-job completion times.
    Demonstrates why quantum size matters."""
    queue = deque((name, burst) for name, burst in jobs)
    clock, finished, switches = 0, {}, 0
    while queue:
        name, remaining = queue.popleft()
        run = min(quantum, remaining)
        clock += run
        switches += 1
        if remaining - run > 0:
            queue.append((name, remaining - run))   # back of the line
        else:
            finished[name] = clock
    return finished, switches

jobs = [("A", 8), ("B", 2), ("C", 1)]
print(round_robin(jobs, quantum=1))
# ({'C': 3, 'B': 5, 'A': 11}, 11 switches): short jobs finish fast
print(round_robin(jobs, quantum=100))
# ({'A': 8, 'B': 10, 'C': 11}, 3 switches): degenerates to FCFS


def cfs_pick(tasks):
    """CFS idea: run whichever task has the least weighted CPU so far.
    tasks: dict name -> {'vruntime': float, 'weight': float}."""
    return min(tasks, key=lambda t: tasks[t]["vruntime"])

def cfs_run(tasks, name, cpu_ms):
    # A heavier (lower nice) task's vruntime grows more slowly,
    # so it gets picked more often: proportional share.
    tasks[name]["vruntime"] += cpu_ms / tasks[name]["weight"]

tasks = {"editor": {"vruntime": 0, "weight": 2.0},
         "build":  {"vruntime": 0, "weight": 1.0}}
schedule = []
for _ in range(6):
    t = cfs_pick(tasks)
    cfs_run(tasks, t, 10)
    schedule.append(t)
print(schedule)   # editor runs ~2x as often as build


# Priority inversion, as a timeline:
#   t0  LOW  acquires lock L
#   t1  HIGH becomes runnable, preempts LOW, blocks on L
#   t2  MED  becomes runnable, preempts LOW (LOW < MED)
#   ...  HIGH waits for LOW, which cannot run because MED is running
# Priority inheritance: at t1, LOW is boosted to HIGH's priority until
# it releases L, so MED cannot preempt it.`
    },
    {
      id: 'cs-os-3',
      title: 'Virtual Memory: Paging, Page Tables, and the TLB',
      content: `Every pointer your program uses is a virtual address. The MMU translates it to a physical address on every access, using tables the kernel maintains. Understanding that path explains isolation, page faults, and why memory-hungry programs suddenly crawl.

**Why Virtual Memory:**
- Each process sees a private, contiguous address space starting at the same addresses, regardless of where its pages physically live
- Isolation: a process cannot name another's physical memory
- Programs can use more memory than is physically present, with the rest on disk (swap) or not yet allocated

**Paging:**
- Memory is divided into fixed-size **pages** (4 KB typical; 2 MB / 1 GB huge pages for large working sets)
- A virtual address splits into a **virtual page number** and an **offset** within the page. Only the page number is translated; the offset passes through unchanged.
- The **page table** maps virtual page number → physical frame number plus flag bits: present, read/write, user/supervisor, no-execute, accessed, dirty

**Multi-Level Page Tables:**
- A flat table for a 48-bit address space would need 2³⁶ entries per process. Instead the page number is split into several indexes (x86-64 uses four 9-bit levels plus a 12-bit offset) and only the branches that are actually mapped are allocated.
- A **page walk** reads one table per level: 4 memory accesses just to translate one address

**TLB (Translation Lookaside Buffer):**
- A small hardware cache of recent translations (tens to a couple thousand entries). A hit makes translation essentially free; a miss triggers a page walk.
- 64 entries × 4 KB covers only 256 KB of memory - this "TLB reach" is why huge pages help databases and JVMs
- Switching processes changes the page table, so TLB entries must be flushed unless they are tagged with an address-space ID (PCID on x86, ASID on ARM)

**Page Faults:**
- **Minor:** the page is in physical memory but not mapped for this process yet - first touch of a freshly allocated page (mapped to a shared zero page until written), copy-on-write after fork, or a file page already in the page cache. Cheap: microseconds.
- **Major:** the page must come from disk (swap or a file). Expensive: milliseconds on HDD, tens of microseconds on NVMe.
- **Invalid:** no mapping and no valid reason for one → SIGSEGV. A null-pointer dereference is a fault on page 0, which is deliberately left unmapped.

**Demand Paging and Copy-on-Write:**
\`malloc\` and \`mmap\` reserve address space, not memory. Physical frames are allocated on first write. This is why a 1 GB allocation returns instantly and why fork of a large process is fast: both sides share pages until one writes.

**Page Replacement and Thrashing:**
- When memory is full the kernel evicts pages, approximating LRU with the hardware accessed bit (**clock / second-chance** algorithm). Dirty pages must be written back first.
- The **working set** is the pages a process touches in a window. When the sum of working sets exceeds RAM, every task faults constantly, the disk saturates, and CPU utilization collapses: **thrashing**. The only real fix is fewer concurrent tasks or more memory.
- **Belady's anomaly:** with FIFO replacement, adding frames can increase faults. LRU and other stack algorithms never show this.`,
      codeExample: `# Simulating x86-64 style 4-level translation of a 48-bit address.
PAGE_BITS = 12                      # 4 KB pages
LEVEL_BITS = 9                      # 512 entries per table

def split(vaddr):
    offset = vaddr & ((1 << PAGE_BITS) - 1)
    vpn = vaddr >> PAGE_BITS
    indexes = []
    for _ in range(4):              # PT, PD, PDPT, PML4 (low to high)
        indexes.append(vpn & ((1 << LEVEL_BITS) - 1))
        vpn >>= LEVEL_BITS
    return list(reversed(indexes)), offset

class MMU:
    def __init__(self):
        self.root = {}              # sparse: only mapped branches exist
        self.tlb = {}               # vpn -> frame
        self.stats = {"tlb_hit": 0, "walk": 0, "fault": 0}

    def map_page(self, vaddr, frame):
        idx, _ = split(vaddr)
        table = self.root
        for i in idx[:-1]:
            table = table.setdefault(i, {})   # allocate on demand
        table[idx[-1]] = frame

    def translate(self, vaddr):
        idx, offset = split(vaddr)
        vpn = vaddr >> PAGE_BITS
        if vpn in self.tlb:                   # fast path
            self.stats["tlb_hit"] += 1
            return (self.tlb[vpn] << PAGE_BITS) | offset
        self.stats["walk"] += 1               # 4 dependent memory reads
        table = self.root
        for i in idx:
            if i not in table:
                self.stats["fault"] += 1      # kernel decides: demand
                raise MemoryError("page fault")   # page, COW, or SIGSEGV
            table = table[i]
        self.tlb[vpn] = table                 # table is the frame here
        return (table << PAGE_BITS) | offset

mmu = MMU()
mmu.map_page(0x7fff_0000_1000, frame=0x1234)
print(hex(mmu.translate(0x7fff_0000_1abc)))  # 0x1234abc: offset kept
print(hex(mmu.translate(0x7fff_0000_1f00)))  # TLB hit, same page
try:
    mmu.translate(0x0)                       # null page is unmapped
except MemoryError as e:
    print(e)
print(mmu.stats)   # {'tlb_hit': 1, 'walk': 2, 'fault': 1}

# TLB reach: 64 entries * 4 KB = 256 KB; with 2 MB huge pages = 128 MB.`
    },
    {
      id: 'cs-os-4',
      title: 'Memory Allocation: Heap, Stack, and mmap',
      content: `\`malloc\` is not a system call. Knowing what happens between your allocation request and the kernel explains fragmentation, why freed memory does not shrink your process, and why deep recursion crashes.

**Process Address Space Layout:**
- **Text** (code, read-only), **data** (initialized globals), **BSS** (zero-initialized globals)
- **Heap**: grows upward from the end of BSS via \`brk\`/\`sbrk\`
- **Memory-mapped region**: shared libraries, large allocations, file mappings, thread stacks
- **Stack**: grows downward from near the top; fixed maximum size

**Stack Allocation:**
- Bump the stack pointer: O(1), no bookkeeping, freed automatically on return
- Each thread has its own stack, typically 8 MB for the main thread on Linux (\`ulimit -s\`) and 1-8 MB for other threads; Windows defaults to 1 MB
- A **guard page** below the stack is unmapped; touching it raises SIGSEGV. That is what "stack overflow" is: unbounded recursion or a huge local array walking into the guard page.
- Returning a pointer to a local is a classic bug: the frame is reused by the next call

**Heap Allocation - The User-Space Allocator:**
- \`malloc\`/\`free\` (glibc ptmalloc, jemalloc, tcmalloc, mimalloc) manage memory in user space and ask the kernel for more only when they run out
- Small requests: carve from the heap, extended with \`brk\`. Large requests (above ~128 KB in glibc) get a dedicated \`mmap\` region that is unmapped on free.
- Allocators keep **free lists** or **size-class bins**; each chunk has a small header recording its size, which is how \`free(p)\` knows how much to release
- Adjacent free chunks are **coalesced** to fight fragmentation (boundary tags make the neighbor's size findable)
- Modern allocators use per-thread caches or arenas so threads do not contend on one lock

**Fragmentation:**
- **Internal:** wasted space inside an allocated block, from rounding up to a size class or alignment (16 bytes typical). A 17-byte request may consume 32.
- **External:** enough total free memory, but no single hole large enough. Long-running processes with mixed allocation sizes suffer most; compaction is impossible without moving objects (which garbage-collected runtimes can do).

**Why free() Doesn't Return Memory to the OS:**
The heap is a contiguous region; \`brk\` can only shrink it from the top. A freed chunk in the middle stays reserved for reuse. Process RSS therefore rarely drops after freeing. mmap-backed large blocks are the exception.

**Kernel Allocators:**
- **Buddy allocator:** physical pages in power-of-two blocks; split on allocation, merge with the "buddy" on free. Fast coalescing, up to 50% internal waste.
- **Slab allocator:** caches of pre-sized objects (inodes, task_structs) carved from buddy pages; avoids repeated initialization and fragmentation for the kernel's own hot objects

**Common Bugs an Interviewer Will Name:**
Use-after-free, double free, memory leaks (unreachable but never freed), buffer overflow into the neighbor chunk's header, and stack overflow. Tools: AddressSanitizer, Valgrind, and in production, a leak shows up as steadily growing RSS.`,
      codeExample: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>

// 1. Stack: automatic, fast, and gone when the function returns
char *broken(void) {
    char buf[64];                     // lives in this frame
    strcpy(buf, "hello");
    return buf;                       // BUG: dangling once we return
}

// 2. Unbounded recursion walks into the guard page -> SIGSEGV
long depth(long n) {
    char pad[1024];                   // 1 KB per frame
    pad[0] = (char)n;
    return n == 0 ? 0 : 1 + depth(n - 1);   // ~8000 frames on 8 MB
}

int main(void) {
    // 3. Small malloc: carved from the heap, extended with brk/sbrk
    void *before = sbrk(0);
    char *small = malloc(100);        // rounds up to a size class
    void *after = sbrk(0);
    printf("heap grew by %ld bytes for a 100-byte request\\n",
           (long)((char *)after - (char *)before));  // often 132 KB:
                                                     // allocator batches

    // 4. Large malloc: glibc uses mmap directly (threshold ~128 KB)
    char *big = malloc(1 << 20);      // 1 MB: separate mapping,
    big[0] = 1;                       // physical page only on first touch
    free(big);                        // munmap: memory really returned

    // 5. free() of a small chunk keeps it on a free list, RSS unchanged
    free(small);

    // 6. Explicit mmap: pages are demand-zero, allocated on first write
    size_t len = 64 * 1024 * 1024;    // 64 MB reserved instantly
    char *region = mmap(NULL, len, PROT_READ | PROT_WRITE,
                        MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    if (region == MAP_FAILED) { perror("mmap"); return 1; }
    region[0] = 'x';                  // now exactly one 4 KB page exists
    munmap(region, len);

    // 7. Internal fragmentation: 17 bytes requested, 32 consumed
    char *p = malloc(17);
    printf("usable size for 17-byte request: %zu\\n",
           malloc_usable_size(p));    // glibc: 24 on 64-bit
    free(p);
    return 0;
}`
    },
    {
      id: 'cs-os-5',
      title: 'Synchronization and Deadlock',
      content: `When threads share memory, correctness depends on primitives the OS and hardware provide. Interviewers ask you to pick the right one and to reason about deadlock precisely.

**The Root Problem:**
- A **race condition** occurs when the result depends on the interleaving of threads. \`counter++\` is three instructions (load, add, store); two threads can both load the same value and one increment is lost.
- A **critical section** is code that must not be interleaved with other threads touching the same data

**Hardware Foundations:**
- Atomic read-modify-write instructions: **compare-and-swap** (CAS), test-and-set, fetch-and-add. Every lock is built on one of these.
- Memory barriers order loads and stores across cores; locks include them implicitly

**Primitives and When to Use Each:**
- **Spinlock:** loop on CAS until acquired. No sleeping, no context switch, so it is the fastest way to guard a critical section of a few dozen instructions on a multicore machine. Wasteful if held long, and useless on a single core (the spinner prevents the holder from running). Used inside kernels and in lock-free fast paths.
- **Mutex:** if the lock is taken, the thread sleeps and the kernel wakes it on release. Has an **owner**: only the locker may unlock. Costs a syscall and context switch on contention. Modern mutexes (futex-based) spin briefly, then sleep, getting most of both worlds.
- **Semaphore:** an integer with atomic \`wait\` (decrement or block if zero) and \`signal\` (increment). No owner, so one thread can signal another - the right tool for **counting** resources (connection pool slots) and for one-shot signaling. A binary semaphore looks like a mutex but is not: any thread can release it.
- **Condition variable:** lets a thread sleep until some predicate is true, always paired with a mutex. \`wait\` atomically releases the mutex and sleeps; on wake it reacquires. Check the predicate in a \`while\` loop because of **spurious wakeups** and because another thread may have consumed the state.
- **Reader-writer lock:** many concurrent readers or one writer. Beware writer starvation.

**Deadlock - The Coffman Conditions (all four must hold):**
- **Mutual exclusion:** the resource cannot be shared
- **Hold and wait:** a thread holds one resource while waiting for another
- **No preemption:** resources are released only voluntarily
- **Circular wait:** a cycle of threads each waiting for the next one's resource

**Breaking Deadlock:**
- **Prevention** removes one condition. The most practical: impose a global **lock ordering** so circular wait is impossible; or acquire all locks at once / use \`trylock\` with back-off to remove hold-and-wait.
- **Avoidance:** the Banker's algorithm grants a request only if the system stays in a safe state; requires knowing maximum claims up front, so it is rare in practice.
- **Detection and recovery:** build a wait-for graph, look for cycles, kill or roll back a victim. Databases do exactly this for transaction deadlocks.

**Related Failures:**
- **Livelock:** threads keep changing state in response to each other without progressing (two threads that both back off and retry in lockstep)
- **Starvation:** a thread is runnable but never chosen (unfair locks, priority scheduling without aging)
- **ABA problem** in lock-free code: a CAS sees value A, another thread changes A → B → A, and the CAS wrongly succeeds. Fixed with tagged pointers or hazard pointers.`,
      codeExample: `#include <pthread.h>
#include <stdio.h>
#include <stdbool.h>

// ---------- Deadlock: two locks taken in opposite orders ----------
pthread_mutex_t A = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t B = PTHREAD_MUTEX_INITIALIZER;

void *thread1(void *_) {
    pthread_mutex_lock(&A);
    pthread_mutex_lock(&B);          // waits if thread2 holds B
    pthread_mutex_unlock(&B);
    pthread_mutex_unlock(&A);
    return NULL;
}

void *thread2_deadlocks(void *_) {
    pthread_mutex_lock(&B);
    pthread_mutex_lock(&A);          // waits if thread1 holds A: cycle
    pthread_mutex_unlock(&A);
    pthread_mutex_unlock(&B);
    return NULL;
}

// Fix 1: global lock ordering (always A before B) -> no circular wait
void *thread2_ordered(void *_) {
    pthread_mutex_lock(&A);
    pthread_mutex_lock(&B);
    pthread_mutex_unlock(&B);
    pthread_mutex_unlock(&A);
    return NULL;
}

// Fix 2: trylock + back off -> no hold-and-wait
void *thread2_trylock(void *_) {
    for (;;) {
        pthread_mutex_lock(&B);
        if (pthread_mutex_trylock(&A) == 0) break;   // got both
        pthread_mutex_unlock(&B);                    // release, retry
        sched_yield();
    }
    pthread_mutex_unlock(&A);
    pthread_mutex_unlock(&B);
    return NULL;
}

// ---------- Bounded buffer with mutex + condition variables ----------
#define CAP 8
int buf[CAP], head = 0, tail = 0, count = 0;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;

void put(int v) {
    pthread_mutex_lock(&m);
    while (count == CAP)                     // while, not if:
        pthread_cond_wait(&not_full, &m);    // releases m while asleep
    buf[tail] = v; tail = (tail + 1) % CAP; count++;
    pthread_cond_signal(&not_empty);
    pthread_mutex_unlock(&m);
}

int get(void) {
    pthread_mutex_lock(&m);
    while (count == 0)
        pthread_cond_wait(&not_empty, &m);
    int v = buf[head]; head = (head + 1) % CAP; count--;
    pthread_cond_signal(&not_full);
    pthread_mutex_unlock(&m);
    return v;
}

// A spinlock in two lines, built on compare-and-swap:
//   while (!__atomic_compare_exchange_n(&flag, &expected0, 1, ...)) {}
//   ... critical section ...   __atomic_store_n(&flag, 0, RELEASE);`
    },
    {
      id: 'cs-os-6',
      title: 'I/O, Syscalls, and File Systems',
      content: `Everything a program does outside its own memory goes through a system call. Interviewers use I/O questions to test whether you understand where time actually goes in a server.

**System Calls:**
- The only way into the kernel: a special instruction (\`syscall\` on x86-64) switches to kernel mode, the kernel validates arguments, does the work, and returns
- Cost: hundreds of nanoseconds to a microsecond for the transition alone, plus cache pollution. That is why batching (\`writev\`, \`sendfile\`, \`io_uring\`) and user-space buffering matter.
- Library calls are not syscalls: \`printf\` buffers in user space and issues one \`write\` per flush; \`malloc\` calls \`brk\`/\`mmap\` only occasionally

**File Descriptors:**
- A small integer indexing the process's fd table; 0, 1, 2 are stdin, stdout, stderr
- The fd table entry points to an **open file description** (current offset, access mode), which points to the **inode**. \`fork\` copies the table, so parent and child share the same offset; \`dup2\` is how shells implement redirection.
- Sockets, pipes, and devices are file descriptors too, which is why \`read\`/\`write\`/\`poll\` work on all of them

**Buffering Layers:**
- **User-space** (stdio, language runtimes): amortizes syscalls; must be flushed
- **Page cache** in the kernel: \`write()\` returns after copying into RAM. Data reaches disk later via writeback. Durability requires \`fsync()\`, which is why databases call it on commit and why it is slow.
- \`O_DIRECT\` bypasses the page cache for applications that manage their own caching (databases)

**Blocking vs Non-Blocking:**
- A blocking \`read\` on a socket sleeps until data arrives; one thread per connection scales poorly (memory per stack, context switches)
- \`O_NONBLOCK\` makes the call return \`EAGAIN\` immediately when nothing is ready; you then need a way to be told when to retry

**I/O Multiplexing - Waiting on Many Descriptors:**
- \`select\`: fixed-size bitmap, limited to 1024 fds, O(n) scan per call, rebuilt every time
- \`poll\`: array of fds, no 1024 limit, still O(n) per call
- \`epoll\` (Linux) / \`kqueue\` (BSD, macOS): register descriptors once; each wait returns only the ready ones, O(1) per event. This is what nginx, Node.js (via libuv), Redis, and every event loop use. Level-triggered reports readiness on every wait; edge-triggered reports only transitions, so you must drain the fd until EAGAIN.
- \`io_uring\` (Linux) and IOCP (Windows) are **completion**-based: submit operations, get told when they finish, with no per-operation syscall

**How Devices Talk to the Kernel:**
DMA lets a device copy data directly into memory, then raises an **interrupt**. Under heavy load interrupts are throttled and the kernel **polls** instead (NAPI), because an interrupt per packet at 10 Gb/s would consume the CPU.

**File Systems:**
- An **inode** holds a file's metadata (mode, owner, size, timestamps) and the location of its data blocks (direct/indirect pointers or extents). It does **not** hold the name.
- A **directory** is a file mapping names → inode numbers. A **hard link** is a second name for the same inode (link count); a **symlink** is a small file containing a path.
- \`unlink\` removes a name; data is freed only when the link count hits zero **and** no process has it open. This is why you can delete a running executable or a log file that a process is still writing.
- **Journaling** (ext4, NTFS, XFS): write the intended metadata changes to a sequential journal, commit, then apply them in place. After a crash, replay the journal instead of scanning the whole disk (fsck). Modes range from metadata-only to full data journaling. Copy-on-write file systems (APFS, ZFS, btrfs) never overwrite in place, which gives atomicity and cheap snapshots.
- The **VFS** layer presents one interface over ext4, tmpfs, NFS, and FUSE, so \`open\`/\`read\` code is file-system agnostic`,
      codeExample: `// Minimal epoll-based echo server: one thread, thousands of sockets.
#include <sys/epoll.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <stdio.h>

static void set_nonblocking(int fd) {
    fcntl(fd, F_SETFL, fcntl(fd, F_GETFL) | O_NONBLOCK);
}

int main(void) {
    int listener = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = { .sin_family = AF_INET,
                                .sin_port = htons(8080),
                                .sin_addr.s_addr = INADDR_ANY };
    bind(listener, (struct sockaddr *)&addr, sizeof addr);
    listen(listener, 128);
    set_nonblocking(listener);

    int ep = epoll_create1(0);                  // register once...
    struct epoll_event ev = { .events = EPOLLIN, .data.fd = listener };
    epoll_ctl(ep, EPOLL_CTL_ADD, listener, &ev);

    struct epoll_event events[64];
    char buf[4096];
    for (;;) {
        int n = epoll_wait(ep, events, 64, -1); // ...wait for READY fds
        for (int i = 0; i < n; i++) {
            int fd = events[i].data.fd;
            if (fd == listener) {
                int client;
                while ((client = accept(listener, NULL, NULL)) >= 0) {
                    set_nonblocking(client);
                    ev.events = EPOLLIN | EPOLLET;  // edge-triggered
                    ev.data.fd = client;
                    epoll_ctl(ep, EPOLL_CTL_ADD, client, &ev);
                }
                // accept returned -1 with EAGAIN: backlog drained
            } else {
                // Edge-triggered: MUST drain until EAGAIN or we miss data
                for (;;) {
                    ssize_t r = read(fd, buf, sizeof buf);
                    if (r > 0) {
                        write(fd, buf, (size_t)r);       // echo back
                    } else if (r == 0 || (r < 0 && errno != EAGAIN)) {
                        close(fd);                       // peer closed
                        break;                           // (auto-removed)
                    } else {
                        break;                           // EAGAIN: drained
                    }
                }
            }
        }
    }
}

/* Durability requires fsync; write() only reaches the page cache:
       int fd = open("wal.log", O_WRONLY | O_APPEND);
       write(fd, record, len);   // in RAM
       fsync(fd);                // now on disk (or the disk lied)
   Hard link vs symlink:
       link("a.txt", "b.txt");     // same inode, link count 2
       symlink("a.txt", "c.txt");  // new inode containing the path
       unlink("a.txt");            // b.txt still works, c.txt dangles */`
    }
  ],

  visualizations: [
    {
      title: 'Virtual Address Translation',
      description: 'From a virtual address to a physical one: TLB first, page walk on a miss, fault if unmapped',
      nodes: [
        { id: 'va', label: 'virtual address\nVPN | offset', x: 60, y: 50, type: 'primary' },
        { id: 'tlb', label: 'TLB lookup\n(hardware cache)', x: 190, y: 50, type: 'secondary' },
        { id: 'hit', label: 'hit: frame\n~0 extra cost', x: 320, y: 50, type: 'success' },
        { id: 'walk', label: 'miss: page walk\n4 table reads', x: 190, y: 150, type: 'warning' },
        { id: 'pte', label: 'PTE present?\nR/W, NX, dirty', x: 320, y: 150, type: 'info' },
        { id: 'fault', label: 'page fault\nminor / major / SIGSEGV', x: 190, y: 250, type: 'error' },
        { id: 'pa', label: 'physical address\nframe | offset', x: 320, y: 250, type: 'primary' }
      ],
      edges: [
        { from: 'va', to: 'tlb' },
        { from: 'tlb', to: 'hit', label: 'hit' },
        { from: 'tlb', to: 'walk', label: 'miss' },
        { from: 'walk', to: 'pte' },
        { from: 'pte', to: 'fault', label: 'not present' },
        { from: 'pte', to: 'pa', label: 'present' },
        { from: 'hit', to: 'pa' },
        { from: 'fault', to: 'walk', label: 'kernel maps, retry' }
      ]
    },
    {
      title: 'Process State Machine',
      description: 'A process moves between states as it is scheduled, blocks on I/O, and exits',
      nodes: [
        { id: 'new', label: 'New\nfork()', x: 60, y: 50, type: 'secondary' },
        { id: 'ready', label: 'Ready\nin run queue', x: 190, y: 50, type: 'info' },
        { id: 'running', label: 'Running\non a CPU', x: 320, y: 50, type: 'success' },
        { id: 'blocked', label: 'Blocked\nwaiting on I/O, lock', x: 190, y: 160, type: 'warning' },
        { id: 'zombie', label: 'Zombie\nexited, not reaped', x: 320, y: 160, type: 'error' },
        { id: 'gone', label: 'Terminated\nparent called wait()', x: 320, y: 260, type: 'primary' }
      ],
      edges: [
        { from: 'new', to: 'ready', label: 'admitted' },
        { from: 'ready', to: 'running', label: 'scheduled' },
        { from: 'running', to: 'ready', label: 'preempted / quantum' },
        { from: 'running', to: 'blocked', label: 'syscall blocks' },
        { from: 'blocked', to: 'ready', label: 'I/O done' },
        { from: 'running', to: 'zombie', label: 'exit()' },
        { from: 'zombie', to: 'gone', label: 'reaped' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-os-c1', front: 'What do threads in the same process share, and what is private to each thread?', back: 'Shared: the address space (heap, globals, code), open file descriptors, signal handlers, and credentials. Private: the program counter, registers, and stack. Sharing memory makes communication cheap and races easy.' },
    { id: 'cs-os-c2', front: 'Why is switching between processes more expensive than switching between threads of one process?', back: 'A process switch changes the page table, invalidating TLB entries (unless tagged with an address-space ID) and cooling caches. A thread switch keeps the same address space, so it only saves and restores registers and the stack pointer.' },
    { id: 'cs-os-c3', front: 'What does fork() return, and how does the child get its own memory so quickly?', back: 'It returns the child\'s PID to the parent and 0 to the child. The child\'s address space is copy-on-write: pages are shared read-only, and a private copy is made only when either side writes to a page.' },
    { id: 'cs-os-c4', front: 'Why are fork() and exec() separate calls instead of one "spawn" call?', back: 'The gap between them lets the child adjust its environment before the new program starts: redirect stdin/stdout with dup2, set up pipes, change directory, or drop privileges. Shells rely on this to implement redirection and pipelines.' },
    { id: 'cs-os-c5', front: 'What is a zombie process, and how is it cleaned up?', back: 'A process that has exited but whose parent has not yet called wait(); only its PCB remains so the exit status can be collected. The parent reaps it with wait/waitpid. If the parent dies first, init adopts and reaps it.' },
    { id: 'cs-os-c6', front: 'What is the difference between preemptive and cooperative scheduling?', back: 'Cooperative: a task runs until it yields or blocks, so one misbehaving task can freeze the system. Preemptive: a timer interrupt or event lets the kernel take the CPU away at any time. All modern general-purpose kernels are preemptive.' },
    { id: 'cs-os-c7', front: 'What happens if the round-robin time quantum is too small or too large?', back: 'Too small: context-switch overhead dominates and throughput drops. Too large: it degenerates into first-come-first-served and interactive tasks get poor response time. Typical quanta are a few milliseconds.' },
    { id: 'cs-os-c8', front: 'What is the convoy effect?', back: 'Under FCFS scheduling, one long CPU-bound job at the front of the queue makes many short (often I/O-bound) jobs wait behind it, leaving devices idle and lengthening average waiting time.' },
    { id: 'cs-os-c9', front: 'How does a multilevel feedback queue favor interactive tasks without knowing burst lengths in advance?', back: 'Tasks that consume a whole quantum are demoted to a lower-priority queue with a longer quantum; tasks that block before their quantum ends stay in high-priority queues. CPU-bound tasks sink, I/O-bound tasks float, based on observed behavior.' },
    { id: 'cs-os-c10', front: 'How does the Linux CFS scheduler choose the next task?', back: 'Each task accumulates virtual runtime (CPU time weighted by its nice value). Runnable tasks sit in a red-black tree keyed by vruntime, and the scheduler runs the leftmost (smallest vruntime) task, giving each a proportional share of the CPU.' },
    { id: 'cs-os-c11', front: 'What is priority inversion, and how is it fixed?', back: 'A low-priority thread holds a lock a high-priority thread needs, and a medium-priority thread preempts the low one, so the high-priority thread is stuck behind medium work. Fix with priority inheritance (the holder temporarily gets the waiter\'s priority) or a priority ceiling protocol.' },
    { id: 'cs-os-c12', front: 'What is aging in a priority scheduler?', back: 'Gradually raising the priority of tasks that have waited a long time, so low-priority tasks eventually run instead of starving indefinitely behind a stream of higher-priority arrivals.' },
    { id: 'cs-os-c13', front: 'Which part of a virtual address is translated by the page table, and which passes through unchanged?', back: 'The virtual page number is looked up and replaced by a physical frame number; the low-order offset bits (12 bits for 4 KB pages) are appended unchanged, since a page maps to a frame of the same size.' },
    { id: 'cs-os-c14', front: 'Why do CPUs use multi-level page tables instead of one flat table?', back: 'A flat table for a 48-bit address space would need billions of entries per process, almost all unused. Splitting the page number into several indexes lets the kernel allocate only the sub-tables for regions that are actually mapped.' },
    { id: 'cs-os-c15', front: 'What is the TLB and what happens on a TLB miss?', back: 'A small hardware cache of virtual-to-physical translations. On a miss the MMU performs a page walk, reading one page-table entry per level (four dependent memory accesses on x86-64) before the original access can proceed.' },
    { id: 'cs-os-c16', front: 'How do huge pages improve performance for large-memory applications?', back: 'A 2 MB page covers 512 times more memory per TLB entry than a 4 KB page, so TLB reach grows from a few hundred KB to hundreds of MB and page walks become rare. Databases and JVMs with large heaps benefit most.' },
    { id: 'cs-os-c17', front: 'Minor vs major page fault: what is the difference?', back: 'Minor: the page is already in RAM but not mapped into this process (first touch of a new page, copy-on-write, page-cache hit); resolved in microseconds. Major: the page must be read from disk (swap or file); costs milliseconds on HDD.' },
    { id: 'cs-os-c18', front: 'Why does malloc(1 GB) return instantly even on a machine with little free RAM?', back: 'Demand paging: the call reserves virtual address space, and physical frames are allocated only when pages are first written. Until then the pages have no backing (or map to a shared zero page).' },
    { id: 'cs-os-c19', front: 'What is thrashing, and what are the symptoms?', back: 'The combined working sets of running processes exceed physical memory, so every process keeps faulting pages back in that were just evicted. Disk utilization saturates while CPU utilization collapses. The fix is fewer concurrent processes or more RAM.' },
    { id: 'cs-os-c20', front: 'How does the clock (second-chance) algorithm approximate LRU?', back: 'Pages sit in a circular list with a hardware-set accessed bit. The hand sweeps: a page with the bit set gets it cleared and is skipped; a page with the bit clear is evicted. Recently used pages survive at least one sweep, without the cost of true LRU bookkeeping.' },
    { id: 'cs-os-c21', front: 'Why does calling free() usually not reduce a process\'s memory footprint?', back: 'The heap is a contiguous region that brk can only shrink from the top. A freed chunk in the middle stays reserved on the allocator\'s free list for reuse. Large blocks that were mmap-ed separately are the exception: free() unmaps them.' },
    { id: 'cs-os-c22', front: 'Internal vs external fragmentation: what is the difference?', back: 'Internal: wasted space inside an allocated block from rounding up to a size class or alignment. External: enough total free memory exists but it is split into holes too small for the request. Coalescing free neighbors fights external fragmentation.' },
    { id: 'cs-os-c23', front: 'Why does deep recursion crash with a segmentation fault rather than growing the stack indefinitely?', back: 'Each thread\'s stack has a fixed maximum size (about 8 MB for the main thread on Linux) with an unmapped guard page below it. When frames reach the guard page, the access faults with no valid mapping and the kernel sends SIGSEGV.' },
    { id: 'cs-os-c24', front: 'When is a spinlock the right choice over a mutex?', back: 'For very short critical sections on a multicore machine, where the expected wait is shorter than a context switch. It is wrong for long holds (wasted CPU) and useless on a single core, where spinning prevents the holder from running.' },
    { id: 'cs-os-c25', front: 'Mutex vs semaphore: what is the key semantic difference?', back: 'A mutex has an owner: only the thread that locked it may unlock it, and it guards a critical section. A semaphore is a counter with no owner; any thread can signal it, which makes it suitable for counting resources and for one thread waking another.' },
    { id: 'cs-os-c26', front: 'Why must a condition-variable wait be wrapped in a while loop rather than an if?', back: 'Wakeups can be spurious, and between the signal and reacquiring the mutex another thread may have consumed the state. Re-checking the predicate in a loop guarantees the condition actually holds when the thread proceeds.' },
    { id: 'cs-os-c27', front: 'What are the four Coffman conditions for deadlock?', back: 'Mutual exclusion (resources cannot be shared), hold and wait (holding one while waiting for another), no preemption (resources released only voluntarily), and circular wait (a cycle of threads each waiting on the next). All four must hold; break any one to prevent deadlock.' },
    { id: 'cs-os-c28', front: 'What is the most practical way to prevent deadlock in code that takes multiple locks?', back: 'A global lock ordering: every thread acquires locks in the same fixed order, which makes a circular wait impossible. Alternatives are trylock with back-off (breaks hold-and-wait) or acquiring all locks atomically.' },
    { id: 'cs-os-c29', front: 'Why does write() returning successfully not guarantee the data is on disk?', back: 'write() copies the data into the kernel page cache and returns; writeback to the device happens later. A crash before writeback loses it. fsync() blocks until the data (and metadata) reach stable storage, which is why databases call it on commit.' },
    { id: 'cs-os-c30', front: 'Why does epoll scale better than select or poll for many connections?', back: 'select and poll pass the entire fd set to the kernel on every call and scan it: O(n) per wait, and select is capped at 1024 fds. epoll registers fds once and each wait returns only the ready ones, so cost is proportional to events, not connections.' }
  ],

  quizQuestions: [
    {
      id: 'cs-os-q1',
      question: 'After fork(), the child modifies a global variable. What does the parent see?',
      options: ['The updated value, because globals are shared', 'The original value, because the child has a copy-on-write private address space', 'Undefined behavior', 'A segmentation fault in the parent'],
      correctAnswer: 1,
      explanation: 'fork creates a separate process with its own address space. Pages are shared copy-on-write, so the child\'s write triggers a private copy of that page. Threads, not processes, share globals.'
    },
    {
      id: 'cs-os-q2',
      question: 'A thread in a multithreaded process dereferences a null pointer. What happens to the other threads?',
      options: ['Only the faulting thread is terminated', 'They continue until they next block', 'The whole process receives SIGSEGV and, by default, terminates', 'The kernel restarts the faulting thread'],
      correctAnswer: 2,
      explanation: 'Threads share one address space and one process; a fatal signal like SIGSEGV is delivered to the process, and the default action kills all of it. Isolation between failures is a reason to use separate processes.'
    },
    {
      id: 'cs-os-q3',
      question: 'Why is a thread context switch cheaper than a process context switch on the same core?',
      options: ['Threads have no registers to save', 'Threads share the page table, so the TLB and caches are not invalidated by an address-space change', 'The kernel is not involved in thread switches', 'Thread stacks are smaller'],
      correctAnswer: 1,
      explanation: 'Both switches save and restore registers via the kernel. A process switch additionally loads a new page table, which invalidates TLB entries (unless tagged) and leads to cold caches. Threads keep the same address space.'
    },
    {
      id: 'cs-os-q4',
      question: 'A shell runs "cat file | grep foo". Which sequence of syscalls sets up the pipeline correctly?',
      options: ['exec cat, exec grep, then pipe', 'pipe, then fork twice; each child calls dup2 to wire stdin/stdout to the pipe ends before calling exec', 'fork once and call exec twice in the child', 'exec both programs in the shell process using threads'],
      correctAnswer: 1,
      explanation: 'The pipe must exist before the children are created so they inherit its descriptors. Each child rewires its standard input or output with dup2, closes unused ends, and then exec replaces it with cat or grep. This is why fork and exec are separate.'
    },
    {
      id: 'cs-os-q5',
      question: 'Round-robin scheduling with quantum 1 ms is switched to quantum 500 ms on a system with many interactive tasks. What is the most likely effect?',
      options: ['Higher context-switch overhead', 'Better response time for interactive tasks', 'Behavior close to FCFS, with long delays before short tasks get the CPU', 'CPU-bound tasks starve'],
      correctAnswer: 2,
      explanation: 'A very large quantum means a CPU-bound task can hold the CPU for a long time before yielding, so every other runnable task waits: effectively first-come-first-served. Overhead drops, but responsiveness suffers. CPU-bound tasks benefit, not starve.'
    },
    {
      id: 'cs-os-q6',
      question: 'In CFS, task A has nice 0 and task B has nice 0, but A blocks on I/O frequently while B is CPU-bound. Which is picked when A becomes runnable?',
      options: ['B, because it is already running and has affinity', 'A, because its virtual runtime is smaller after spending time blocked', 'Whichever was created first', 'They alternate strictly in round-robin order'],
      correctAnswer: 1,
      explanation: 'vruntime only accrues while running. A was blocked while B consumed CPU, so A\'s vruntime is now the smaller one and CFS picks the leftmost task in the tree. This is how CFS favors interactive tasks without explicit heuristics.'
    },
    {
      id: 'cs-os-q7',
      question: 'A high-priority thread H is blocked on a mutex held by low-priority thread L, and medium-priority thread M keeps running instead of L. Which mechanism resolves this?',
      options: ['Aging of thread M', 'Priority inheritance: L temporarily runs at H\'s priority until it releases the mutex', 'Converting the mutex to a spinlock', 'A larger time quantum for L'],
      correctAnswer: 1,
      explanation: 'This is priority inversion. Priority inheritance boosts the lock holder to the priority of the highest waiter, so M can no longer preempt L, L finishes the critical section, and H proceeds. Spinning would make it worse.'
    },
    {
      id: 'cs-os-q8',
      question: 'With 4 KB pages, virtual address 0x7f3a_1234_5678 is translated. Which bits are unchanged in the physical address?',
      options: ['The top 16 bits', 'The lowest 12 bits (0x678)', 'The lowest 16 bits (0x5678)', 'None; every bit is looked up'],
      correctAnswer: 1,
      explanation: '4 KB = 2^12, so the low 12 bits are the offset within the page and pass through untouched. Only the remaining bits (the virtual page number) are translated to a physical frame number via the page table.'
    },
    {
      id: 'cs-os-q9',
      question: 'A program allocates a 512 MB array with malloc and immediately writes to every element. When are physical pages actually assigned?',
      options: ['All at once inside malloc', 'On each first write to a page, via minor page faults', 'Only when the array is freed', 'When the process is scheduled for the first time'],
      correctAnswer: 1,
      explanation: 'Demand paging: malloc (via mmap for a block this large) reserves address space only. Each first touch of a page traps, and the kernel allocates and zeroes a frame. Writing every element causes about 131,072 minor faults for 4 KB pages.'
    },
    {
      id: 'cs-os-q10',
      question: 'A server with 64 GB of RAM runs jobs whose combined working set is 80 GB. Monitoring shows disk I/O near 100% and CPU near 10%. What is happening?',
      options: ['A memory leak in one job', 'The scheduler quantum is too small', 'Thrashing: the system spends its time paging working-set pages in and out', 'The TLB is too small'],
      correctAnswer: 2,
      explanation: 'When working sets exceed RAM, pages are evicted and needed again almost immediately. The disk saturates with page traffic while CPUs sit idle waiting on major faults. Adding more jobs makes it worse; the fix is fewer concurrent jobs or more memory.'
    },
    {
      id: 'cs-os-q11',
      question: 'Why does switching to 2 MB huge pages speed up a database with a 100 GB buffer pool?',
      options: ['Larger pages mean fewer bytes to copy on writes', 'Each TLB entry covers 512 times more memory, so far fewer page walks occur', 'The kernel can skip permission checks on huge pages', 'Huge pages are stored in faster memory'],
      correctAnswer: 1,
      explanation: 'A random access pattern over 100 GB with 4 KB pages misses the TLB almost every time, costing a multi-level page walk per access. With 2 MB pages TLB reach grows dramatically and page walks become rare. Data still moves at the same speed.'
    },
    {
      id: 'cs-os-q12',
      question: 'A C function declares char buf[10 * 1024 * 1024]; as a local variable and is called once. What most likely happens on Linux with default settings?',
      options: ['It works; the stack grows on demand', 'Segmentation fault: the frame exceeds the 8 MB stack limit and hits the guard page', 'Compile error: local arrays over 1 MB are not allowed', 'The allocation silently moves to the heap'],
      correctAnswer: 1,
      explanation: 'The main thread\'s stack is capped at 8 MB by default (ulimit -s). A 10 MB frame pushes the stack pointer past the guard page, and the first access there faults with no valid mapping. Large buffers belong on the heap.'
    },
    {
      id: 'cs-os-q13',
      question: 'A long-running server\'s RSS keeps growing even though it calls free() on everything it allocates. Which explanation is consistent with correct code?',
      options: ['free() is asynchronous and has not run yet', 'Heap fragmentation and allocator caching keep freed chunks reserved rather than returning them to the OS', 'The page cache counts against RSS', 'The kernel never reclaims memory from a process until it exits'],
      correctAnswer: 1,
      explanation: 'The heap can only shrink from the top via brk, and allocators keep freed chunks on free lists for reuse. Mixed-size allocation patterns leave holes (external fragmentation), so RSS creeps up despite no leak. Large mmap-ed blocks are returned on free.'
    },
    {
      id: 'cs-os-q14',
      question: 'Which allocation request creates internal fragmentation?',
      options: ['malloc(17) in an allocator with 16-byte size classes and alignment', 'Freeing a chunk between two allocated chunks', 'Allocating a 1 MB block with mmap', 'Growing a dynamic array by doubling'],
      correctAnswer: 0,
      explanation: 'The 17-byte request is rounded up to the next size class (24 or 32 bytes), and the unused tail inside the block is internal fragmentation. Freeing a middle chunk creates an external hole. A page-aligned mmap of exactly 1 MB has no rounding waste.'
    },
    {
      id: 'cs-os-q15',
      question: 'Two threads execute counter++ on a shared int 1,000,000 times each without synchronization. What is the final value?',
      options: ['Exactly 2,000,000', 'Exactly 1,000,000', 'Somewhere between 1,000,000 and 2,000,000, varying between runs', 'The program crashes'],
      correctAnswer: 2,
      explanation: 'counter++ is load, add, store. When both threads load the same value, one increment is lost. The number of lost updates depends on interleaving, so the result is nondeterministic but never exceeds 2,000,000 and (in practice) exceeds 1,000,000 since not every increment collides.'
    },
    {
      id: 'cs-os-q16',
      question: 'On a single-core machine, thread T1 holds a spinlock and is preempted; T2 then tries to acquire it. What happens?',
      options: ['T2 acquires the lock because T1 is not running', 'T2 spins for its entire time slice accomplishing nothing, since T1 cannot run to release the lock', 'The kernel detects the spin and blocks T2', 'T1 is immediately rescheduled'],
      correctAnswer: 1,
      explanation: 'A spinlock busy-waits. On one core, the only thread that can release the lock is not running while T2 spins, so T2 burns its whole quantum. This is why user-space spinlocks are a bad idea on single cores and why kernels disable preemption while holding them.'
    },
    {
      id: 'cs-os-q17',
      question: 'Thread 1 locks A then B; thread 2 locks B then A. Both run concurrently. Which Coffman condition does enforcing "always lock A before B" eliminate?',
      options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
      correctAnswer: 3,
      explanation: 'With a global order, no thread can hold B while waiting for A, so a cycle in the wait-for graph cannot form. The locks are still exclusive, threads still hold one while waiting for the next, and nothing is preempted; only the circularity is gone.'
    },
    {
      id: 'cs-os-q18',
      question: 'A producer signals a condition variable but the consumer, written with "if (count == 0) wait()", occasionally reads from an empty buffer. Why?',
      options: ['Condition variables lose signals when no one is waiting, so the consumer must poll', 'The consumer may wake spuriously or after another consumer already took the item, and the if does not re-check the predicate', 'The producer must signal before releasing the mutex', 'The mutex is not reentrant'],
      correctAnswer: 1,
      explanation: 'pthread_cond_wait may return spuriously, and between the signal and reacquiring the mutex another consumer can empty the buffer. A while loop re-tests count == 0 after every wakeup; an if trusts the wakeup blindly.'
    },
    {
      id: 'cs-os-q19',
      question: 'A process opens a 2 GB log file, another process deletes it with rm, and the first keeps writing. What happens to the disk space?',
      options: ['Writes fail with ENOENT', 'The space is freed immediately and the writes go to a new file', 'The space stays in use until the first process closes the file, because the inode lives on while an open descriptor references it', 'The file is truncated to zero but the name remains'],
      correctAnswer: 2,
      explanation: 'rm calls unlink, which removes the directory entry. The inode and its blocks are freed only when the link count is zero AND no process holds it open. The writer keeps a valid descriptor, so the "deleted" file keeps consuming space (a classic "df says full but du disagrees" mystery).'
    },
    {
      id: 'cs-os-q20',
      question: 'An event loop uses epoll in edge-triggered mode and reads exactly 4096 bytes when a socket is reported readable, then returns to epoll_wait. A client sent 10,000 bytes. What goes wrong?',
      options: ['Nothing; epoll will report the socket readable again on the next wait', 'The remaining 5,904 bytes are never reported until new data arrives, because edge-triggered mode only signals transitions from not-ready to ready', 'epoll_wait returns an error', 'The kernel discards the unread bytes'],
      correctAnswer: 1,
      explanation: 'Edge-triggered epoll fires once when data arrives, not while data remains. The loop must read until EAGAIN before returning to epoll_wait. Level-triggered mode would keep reporting readiness, at the cost of repeated wakeups.'
    }
  ]
};
