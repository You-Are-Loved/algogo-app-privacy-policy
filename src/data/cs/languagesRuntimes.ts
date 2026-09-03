// CS Fundamentals - Languages & Runtimes
// Compilers vs interpreters, garbage collection, type systems, and how your code actually executes

import { Category } from '../../types';

export const languagesRuntimes: Category = {
  id: 'cs-languages-runtimes',
  name: 'Languages & Runtimes',
  slug: 'cs-languages-runtimes',
  description: 'Compilers vs interpreters, garbage collection, type systems, and how your code actually executes',
  icon: 'terminal-outline',
  color: '#6366F1',
  colorDark: '#4F46E5',
  premium: true,

  learnContent: [
    {
      id: 'cs-lr-1',
      title: 'Compilers, Interpreters, and JITs',
      content: `Every language implementation turns source text into something a CPU can execute. The differences are *when* that translation happens and *how much* work is done ahead of time.

**The Compilation Pipeline:**
- **Lexing** - characters to tokens (\`while\`, \`(\`, identifier \`x\`, number \`42\`)
- **Parsing** - tokens to an abstract syntax tree (AST) according to the grammar; syntax errors live here
- **Semantic analysis** - name resolution, type checking, scope rules; "undefined variable" and type errors live here
- **IR generation** - the AST becomes an intermediate representation (LLVM IR, JVM bytecode, SSA form) that is easier to analyze than source and independent of the target CPU
- **Optimization** - constant folding, dead-code elimination, inlining, loop-invariant code motion, escape analysis. Most of a compiler\'s complexity lives here.
- **Code generation** - instruction selection and register allocation produce assembly for one target, then an assembler produces an object file
- **Linking** - object files and libraries are merged and symbols resolved. **Static** linking copies library code into the binary; **dynamic** linking leaves references to shared libraries (.so/.dll) resolved at load time, so one copy serves many processes and can be patched independently.

**Interpreters:**
A **tree-walking** interpreter executes the AST directly - simple, slow (pointer chasing per node). A **bytecode VM** first compiles to compact instructions for a virtual machine and then runs a dispatch loop (CPython, Lua, early JVM). Startup is instant and the program is portable, but every operation pays dispatch and dynamic-type-check overhead.

**Just-In-Time Compilation:**
A JIT starts by interpreting, profiles which code is *hot* and what types actually flow through it, then compiles that code to native machine code at runtime using the observed types:
- **Tiered compilation** - interpreter → quick baseline compiler → optimizing compiler (HotSpot C1/C2, V8 Ignition/TurboFan). Cheap tiers give fast startup; expensive tiers give peak speed for the code that matters.
- **Speculation and inline caches** - "this call site has always seen a String" lets the JIT emit a direct call instead of a dynamic lookup, guarded by a cheap type check.
- **Deoptimization** - when a guard fails (a different type shows up), execution bails back to the interpreter and the optimized code is discarded. Polymorphic call sites and changing object shapes make JITs slow.

**AOT vs JIT Tradeoffs:**
Ahead-of-time (C, C++, Go, Rust) gives predictable performance and instant startup but must optimize for the average case without runtime profiles. JITs pay warm-up time and memory but can specialize on real behavior and inline across dynamic boundaries.`,
      codeExample: `# A miniature pipeline: tokens -> AST -> bytecode -> a VM loop

import re

SRC = "x = 2 + 3 * 4"

# 1. Lexer: characters -> tokens
TOKEN = re.compile(r"\\s*(?:(\\d+)|(\\w+)|(.))")
def lex(src):
    for num, ident, op in TOKEN.findall(src):
        if num:   yield ("NUM", int(num))
        elif ident: yield ("ID", ident)
        elif op.strip(): yield ("OP", op)

# 2. Parser (precedence climbing): tokens -> AST tuples
class Parser:
    def __init__(self, toks): self.toks = list(toks); self.i = 0
    def peek(self): return self.toks[self.i] if self.i < len(self.toks) else (None, None)
    def take(self): t = self.toks[self.i]; self.i += 1; return t
    def expr(self, prec=0):
        kind, val = self.take()
        left = ("num", val) if kind == "NUM" else ("var", val)
        while True:
            k, op = self.peek()
            if k != "OP" or op not in "+*" or {"+": 1, "*": 2}[op] <= prec:
                return left
            self.take()
            left = ("bin", op, left, self.expr({"+": 1, "*": 2}[op]))
    def assign(self):
        _, name = self.take(); self.take()          # ID, '='
        return ("assign", name, self.expr())

# 3. Code generation: AST -> stack-machine bytecode
def compile_node(node, out):
    tag = node[0]
    if tag == "num":    out.append(("PUSH", node[1]))
    elif tag == "var":  out.append(("LOAD", node[1]))
    elif tag == "bin":
        compile_node(node[2], out); compile_node(node[3], out)
        out.append(("ADD" if node[1] == "+" else "MUL", None))
    elif tag == "assign":
        compile_node(node[2], out); out.append(("STORE", node[1]))
    return out

# 4. Bytecode VM: the dispatch loop an interpreter runs
def run(code):
    stack, env = [], {}
    for op, arg in code:
        if op == "PUSH": stack.append(arg)
        elif op == "LOAD": stack.append(env[arg])
        elif op == "ADD": b, a = stack.pop(), stack.pop(); stack.append(a + b)
        elif op == "MUL": b, a = stack.pop(), stack.pop(); stack.append(a * b)
        elif op == "STORE": env[arg] = stack.pop()
    return env

ast = Parser(lex(SRC)).assign()
bytecode = compile_node(ast, [])
# [('PUSH', 2), ('PUSH', 3), ('PUSH', 4), ('MUL', None), ('ADD', None), ('STORE', 'x')]
print(run(bytecode))   # {'x': 14}

# A JIT would notice this loop is hot, observe that ADD only ever sees ints,
# and emit a native 'add' instruction guarded by an int type check.`
    },
    {
      id: 'cs-lr-2',
      title: 'Memory Management: Stack, Heap, and Ownership',
      content: `Where a value lives determines how fast it is to allocate, how long it survives, and who is responsible for freeing it.

**The Stack:**
- One per thread; a contiguous region that grows and shrinks with function calls
- Each call pushes a **frame**: return address, saved registers, parameters, locals
- Allocation is a pointer bump and deallocation is free (return pops the frame), so it is extremely fast
- Lifetime is tied to scope: returning a pointer to a local is a dangling pointer
- Size is fixed and small (often 1-8 MB); unbounded recursion causes a **stack overflow**

**The Heap:**
- Process-wide region for objects whose size or lifetime is not known at compile time
- Allocation goes through an allocator (\`malloc\`, \`new\`, or the runtime) that manages free lists, size classes, and fragmentation
- Slower than the stack, and the object outlives the function that created it, so *someone* must free it

**Manual Management (C, C++ without RAII):**
The programmer pairs every allocation with a free. The failure modes are famous:
- **Leak** - never freed; memory grows until the process dies
- **Use-after-free / dangling pointer** - freed then accessed; silent corruption or exploits
- **Double free** - corrupts the allocator\'s bookkeeping
- **Buffer overflow** - writing past the allocation

**RAII (C++, Rust):**
Resource Acquisition Is Initialization: a resource is owned by an object whose destructor releases it when the object goes out of scope. Cleanup is deterministic and exception-safe. Smart pointers (\`unique_ptr\`, \`shared_ptr\`, \`Box\`, \`Rc\`) apply RAII to heap memory.

**Ownership and Borrowing (Rust):**
Every value has exactly one owner; assignment *moves* ownership; the borrow checker enforces at compile time that you have either any number of shared references or exactly one mutable reference, never both. Use-after-free, double free, and data races become compile errors with no runtime cost.

**Garbage Collection (Java, Go, Python, JS, C#):**
The runtime finds unreachable objects and frees them. The programmer cannot leak by forgetting to free, but can still leak by keeping references alive (caches, listeners, static maps). Finalization is non-deterministic, so non-memory resources (files, sockets) still need explicit close or try-with-resources.

**Escape Analysis:**
JITs and AOT compilers (HotSpot, Go) can prove an object never escapes its function and allocate it on the stack instead of the heap, which is why "allocations are expensive" is less true than it used to be.`,
      codeExample: `// C++: the four classic manual-memory bugs and the RAII fix

#include <cstdio>
#include <memory>
#include <vector>

int* dangling() {
    int local = 42;
    return &local;              // BUG: local's frame is gone after return
}

void manualBugs() {
    int* p = new int(1);
    delete p;
    // *p = 2;                  // BUG: use-after-free
    // delete p;                // BUG: double free

    int* leak = new int(3);     // BUG: never deleted -> leak
    (void)leak;

    int buf[4];
    // buf[4] = 0;              // BUG: buffer overflow (one past the end)
}

// RAII: the object owns the resource; the destructor releases it
class File {
    FILE* f_;
public:
    explicit File(const char* path) : f_(std::fopen(path, "r")) {}
    ~File() { if (f_) std::fclose(f_); }          // runs on ANY scope exit
    File(const File&) = delete;                   // one owner
    File& operator=(const File&) = delete;
};

void raii() {
    File log("app.log");                          // opened here
    auto data = std::make_unique<std::vector<int>>(1000);   // heap, owned
    data->push_back(7);
    if (data->size() > 500) return;               // both released automatically
    throw 1;                                      // ...even on exceptions
}   // destructors run in reverse order here

/* Rust encodes the same idea in the type system:
   let v = vec![1, 2, 3];
   let w = v;            // ownership MOVES to w
   println!("{:?}", v);  // compile error: value used after move
*/`
    },
    {
      id: 'cs-lr-3',
      title: 'Garbage Collection Algorithms',
      content: `A garbage collector answers one question - which objects are still reachable? - and the algorithms differ in how they find the answer and how long they stop your program to do it.

**Reachability:**
The **roots** are the thread stacks, global/static variables, and CPU registers. Anything reachable from a root by following references is live; everything else is garbage. Note that this is about reachability, not "is anyone using it": a forgotten reference in a cache keeps an object alive forever.

**Reference Counting (CPython, Swift ARC, Rust Rc):**
Each object stores how many references point to it; it is freed the instant the count hits zero. Reclamation is prompt and incremental with no pauses, but every pointer assignment costs an increment/decrement (and an atomic one across threads), and **cycles** never reach zero. CPython pairs it with a cycle detector; Swift and Rust rely on \`weak\` references to break cycles.

**Mark-Sweep:**
Stop the world, **mark** everything reachable from the roots (a graph traversal), then **sweep** the heap freeing unmarked objects. Handles cycles, but leaves the heap fragmented and pause time grows with heap size. **Mark-compact** adds a phase that slides live objects together, fixing fragmentation at the cost of updating every pointer.

**Copying Collectors:**
Split the heap into two semispaces; copy live objects from *from-space* to *to-space*, then swap. Cost is proportional to *live* data, not heap size, and allocation becomes a pointer bump because to-space is always contiguous. The price is half the memory sitting idle.

**Generational Collection:**
The **weak generational hypothesis**: most objects die young. So allocate into a small **nursery** (young generation) and collect it often with a fast copying collector; survivors get promoted to the **old generation**, collected rarely with mark-sweep/compact. Pointers from old to young objects must be tracked (via a **write barrier** recording into a card table or remembered set) so a minor GC does not have to scan the whole old generation. This is the design of HotSpot\'s collectors and V8.

**Stop-the-World vs Concurrent:**
A stop-the-world collector pauses all mutator threads; simple, but a 10 GB heap can pause for seconds. **Incremental** collectors do the work in small slices; **concurrent** collectors (Go, ZGC, Shenandoah, G1\'s marking) run alongside the program using **tri-color marking** (white = unvisited, gray = to scan, black = done) and write barriers to stay correct while the program mutates the graph. They trade throughput and CPU for low pause times.

**Tuning and Interview Questions:**
- Throughput vs latency: bigger heaps mean fewer collections but longer pauses
- Nursery too small means premature promotion and expensive old-gen collections
- Allocation rate is usually the real problem: reduce garbage instead of tuning the collector
- "Memory leak in a GC language" means unintended reachability: static collections, listeners never removed, closures capturing large objects, thread-locals in pools`,
      codeExample: `# Reference counting, cycles, and mark-sweep, simulated in Python

import sys
import gc

# --- Reference counting: CPython frees on the last decref
a = [1, 2, 3]
print(sys.getrefcount(a))     # 2: 'a' plus the temporary argument reference
b = a                         # refcount 3
del a                         # refcount 2 - still alive through b
del b                         # refcount 1 -> 0 -> list freed immediately

# --- Cycles defeat reference counting
class Node:
    def __init__(self): self.other = None

x, y = Node(), Node()
x.other, y.other = y, x       # x -> y -> x: each has refcount 2
del x, y                      # refcounts drop to 1, never 0: leaked...
print(gc.collect() > 0)       # ...until the cycle collector (mark-based) finds them

# --- Mark-sweep in miniature over an object graph
heap = {
    "root": ["cfg", "cache"],
    "cfg": [],
    "cache": ["entry1"],
    "entry1": ["cfg"],
    "orphan": ["orphan2"],    # unreachable cycle
    "orphan2": ["orphan"],
}

def mark_sweep(heap, roots):
    marked = set()
    stack = list(roots)                     # gray set
    while stack:
        obj = stack.pop()
        if obj in marked:
            continue
        marked.add(obj)                     # black
        stack.extend(heap[obj])             # children become gray
    return [o for o in heap if o not in marked]   # sweep the white ones

print(mark_sweep(heap, ["root"]))          # ['orphan', 'orphan2']

# A generational collector would only scan the nursery on a minor GC and rely on
# a write barrier to know which old objects point into it.`
    },
    {
      id: 'cs-lr-4',
      title: 'Type Systems',
      content: `A type system is a set of rules for what values an expression can produce, and *when* those rules are checked is the first axis interviewers ask about.

**Static vs Dynamic:**
- **Static** typing checks at compile time (Java, Go, Rust, TypeScript, Haskell). Errors surface before running; tooling (refactors, completion) is precise; some correct programs are rejected.
- **Dynamic** typing checks at runtime, with each *value* carrying its type (Python, JavaScript, Ruby). Flexible and quick to write; type errors appear only on the code path that runs.

**Strong vs Weak:**
Orthogonal to static/dynamic; it describes how eagerly the language **coerces** between types. Python is dynamic *and* strong: \`"5" + 1\` raises. JavaScript is dynamic and weak: \`"5" - 1\` is \`4\` and \`"5" + 1\` is \`"51"\`. C is static and weak (casts and implicit integer conversions).

**Nominal vs Structural:**
- **Nominal**: compatibility is by declared name. A \`Dog\` is an \`Animal\` only if it says \`extends Animal\` (Java, C#, Swift).
- **Structural**: compatibility is by shape. Anything with the right members satisfies the type (TypeScript interfaces, Go interfaces, OCaml). Go interfaces are satisfied implicitly, which is why you can adapt third-party types without editing them.
- **Duck typing** is structural typing checked at runtime (Python).

**Generics and Variance:**
Generics (parametric polymorphism) let \`List<T>\` work for any T with one implementation. Implementations differ: Java **erases** T at runtime (one bytecode copy, no \`new T()\`), C++ and Rust **monomorphize** (a specialized copy per T, faster but larger binaries), C# reifies generics at runtime.

Variance answers "is \`List<Cat>\` a \`List<Animal>\`?"
- **Covariant** (\`out\`): yes, safe only for read-only positions. Java arrays are covariant, which is why storing a \`Dog\` into an \`Animal[]\` that is really a \`Cat[]\` throws \`ArrayStoreException\` at runtime.
- **Contravariant** (\`in\`): reversed, correct for parameter/consumer positions - a function accepting \`Animal\` can be used where one accepting \`Cat\` is expected.
- **Invariant**: neither; the default for mutable containers because a \`List<Cat>\` used as \`List<Animal>\` would let you add a \`Dog\`.

**Type Inference:**
The compiler deduces types you did not write. Local inference (\`var\`, \`auto\`, \`let\`) reads the initializer; **Hindley-Milner** (ML, Haskell, and Rust within functions) infers whole function types from usage. Inference keeps static typing without the annotation noise.

**Gradual Typing:**
Add static types incrementally to a dynamic language: TypeScript over JavaScript, type hints plus mypy over Python. An escape hatch (\`any\`) opts individual values out. TypeScript is deliberately **unsound** for pragmatism - well-typed programs can still fail at runtime - which is a favorite discussion question.

**Null Safety:**
Nullable types (Kotlin \`String?\`, Swift optionals, Rust \`Option<T>\`, TS \`strictNullChecks\`) move the "billion-dollar mistake" from a runtime crash to a compile-time obligation to handle the absent case.`,
      codeExample: `// TypeScript: structural typing, variance, inference, and the gradual escape hatch

// Structural: no 'implements' needed - shape is what matters
interface HasArea { area(): number; }
class Circle { constructor(private r: number) {} area() { return Math.PI * this.r ** 2; } }
const shapes: HasArea[] = [new Circle(1), { area: () => 4 }];   // both fit

// Inference: no annotation, yet 'total' is number and 'names' is string[]
const total = shapes.reduce((sum, s) => sum + s.area(), 0);
const names = ["ada", "alan"].map((n) => n.toUpperCase());

// Variance: mutable arrays are unsafely covariant in TS (like Java arrays)
class Animal { name = "animal"; }
class Cat extends Animal { purr() {} }
class Dog extends Animal { bark() {} }

const cats: Cat[] = [new Cat()];
const animals: Animal[] = cats;      // allowed (covariant)...
animals.push(new Dog());             // ...so now cats[1] is a Dog
// cats[1].purr();                   // runtime TypeError: purr is not a function
// This is the unsoundness TypeScript accepts on purpose.

// Contravariance in parameters: a handler of Animal works where a handler of Cat is needed
type Handler<T> = (x: T) => void;
const handleAnimal: Handler<Animal> = (a) => console.log(a.name);
const handleCat: Handler<Cat> = handleAnimal;   // OK: it can take any Cat

// Nominal-style branding when structure isn't enough (UserId vs OrderId are both numbers)
type UserId = number & { readonly __brand: "UserId" };
type OrderId = number & { readonly __brand: "OrderId" };
const uid = 7 as UserId;
// const oid: OrderId = uid;          // error: brands differ despite same runtime shape

// Gradual typing: 'any' switches the checker off for this value
const legacy: any = JSON.parse('{"count":"3"}');
const n: number = legacy.count;      // compiles; at runtime n is the string "3"

// Weak coercion in the underlying JS
console.log("5" - 1, "5" + 1);       // 4 "51"
void [total, names, handleCat, n];`
    },
    {
      id: 'cs-lr-5',
      title: 'Calling Conventions, Closures, and this',
      content: `"How does a function call actually work?" and "how does a closure remember its variables?" separate candidates who have used a language from those who understand its runtime.

**Calling Conventions:**
A calling convention is the contract between caller and callee about where arguments and return values go and who cleans up:
- On x86-64 (System V ABI) the first six integer/pointer arguments travel in registers (\`rdi, rsi, rdx, rcx, r8, r9\`), the rest on the stack; the return value comes back in \`rax\`
- **Caller-saved** registers may be clobbered by the callee, so the caller preserves what it needs; **callee-saved** registers must be restored before returning
- The **prologue** pushes the frame pointer and reserves stack space for locals; the **epilogue** undoes it and returns to the saved return address
- Conventions are why languages can interoperate through a C ABI, and why name mangling exists (encoding parameter types into symbol names for overloading)

**Frames and Recursion:**
Each call gets a fresh frame, so recursive calls have independent locals. **Tail-call optimization** reuses the current frame when the call is the last action; Scheme and many functional languages guarantee it, Python and JavaScript engines generally do not.

**First-Class Functions:**
A plain function pointer is just a code address. Once functions can be created at runtime and passed around, a value needs *two* things: the code and the **environment** it was created in. That pair is a **closure**. C++ lambdas compile to an object with captured members and an \`operator()\`; Rust closures are anonymous structs implementing \`Fn\` traits.

**How Closures Capture:**
Captured variables cannot live in a stack frame that will be popped. Implementations either copy the value at creation (capture by value) or **box** the variable on the heap so the closure and the enclosing scope share one cell (capture by reference; Lua "upvalues", Python cell objects, JS environment records). Escape analysis decides which variables need boxing. Capturing by reference is why a loop variable declared with \`var\` in JS is shared by every closure created in the loop, while \`let\` creates a fresh binding per iteration.

**Methods, this, and self:**
A method is a function with a hidden first argument for the receiver. C++ and Java pass \`this\` implicitly; Python makes \`self\` explicit and a *bound method* is a closure over the instance. JavaScript is the outlier: \`this\` is determined by the **call site**, not by where the function was defined:
- \`obj.f()\` binds \`this\` to \`obj\`
- \`const g = obj.f; g()\` loses the receiver (\`undefined\` in strict mode)
- \`f.call(x)\`, \`f.apply(x)\`, \`f.bind(x)\` set it explicitly
- Arrow functions do not have their own \`this\`; they capture it lexically like any other variable

**Dynamic Dispatch:**
Virtual method calls index into a per-class **vtable** of function pointers, so the receiver\'s runtime type selects the implementation in constant time. Dynamic languages look methods up by name in the object and its prototype/class chain, which JITs speed up with inline caches keyed on the object\'s hidden class.`,
      codeExample: `// JavaScript: closures, the loop-variable trap, and call-site this

// A closure = code + captured environment
function makeCounter() {
    let count = 0;                       // lives in a heap cell, not a dead frame
    return {
        inc: () => ++count,
        get: () => count,
    };
}
const c = makeCounter();
c.inc(); c.inc();
console.log(c.get());                    // 2 - count outlived makeCounter's frame

// Capture by reference: 'var' is ONE binding shared by all three closures
const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()));        // [3, 3, 3]

// 'let' creates a fresh binding per iteration
const fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);
console.log(fns2.map((f) => f()));       // [0, 1, 2]

// 'this' is decided at the call site, not the definition site
const user = {
    name: "ada",
    greet() { return "hi " + this.name; },
    greetLater() {
        setTimeout(function () { console.log(this.name); }, 0);   // undefined: plain call
        setTimeout(() => console.log(this.name), 0);              // "ada": arrow is lexical
    },
};
console.log(user.greet());               // "hi ada"  (receiver = user)
const detached = user.greet;
// detached();                           // TypeError in strict mode: this is undefined
console.log(detached.call({ name: "alan" }));   // "hi alan" (explicit receiver)
const bound = user.greet.bind(user);
console.log(bound());                    // "hi ada" (receiver fixed permanently)
user.greetLater();

/* Python makes the receiver explicit and bound methods are closures over it:
   class User:
       def greet(self): return "hi " + self.name
   u = User(); u.name = "ada"
   g = u.greet          # bound method: remembers u
   g()                  # "hi ada" - no call-site surprise
*/`
    },
    {
      id: 'cs-lr-6',
      title: 'How the Big Runtimes Differ',
      content: `"Compare X and Y" questions are really asking whether you understand each runtime\'s execution and memory model. Here are the comparisons that come up most.

**Python and the GIL:**
CPython has a Global Interpreter Lock: only one thread executes Python bytecode at a time, which keeps reference counting and the interpreter\'s internals simple. Consequences:
- Threads are fine for **I/O-bound** work because the GIL is released while waiting on sockets, files, and sleep
- Threads give no speedup for **CPU-bound** work; use \`multiprocessing\` (separate interpreters, separate GILs) or native extensions (NumPy) that release the GIL inside C code
- The GIL does *not* make your code thread-safe: \`count += 1\` can still be interrupted between bytecodes
- CPython ships an optional free-threaded build that removes the GIL, but the standard build still has it

**JavaScript: Single Thread + Event Loop:**
One call stack, one thread of JS execution. Asynchronous work (timers, network, disk) is handed to the host (browser/libuv), and its callbacks are queued. The **event loop** runs each **macrotask** (a timer, an I/O callback) to completion, and after each one drains the entire **microtask** queue (promise reactions, \`queueMicrotask\`). This is why \`Promise.resolve().then(...)\` runs before \`setTimeout(..., 0)\`, and why a synchronous infinite loop freezes the page. Real parallelism needs Web Workers or worker threads, which share nothing except explicit \`SharedArrayBuffer\`s.

**Java and the JVM:**
Source compiles to portable **bytecode**, loaded lazily by class loaders and verified. HotSpot interprets first, then JIT-compiles hot methods with tiered compilation, making aggressive speculative optimizations (inlining virtual calls, escape analysis) with deoptimization as a safety net. Memory is fully garbage collected with a choice of collectors (throughput-oriented Parallel, balanced G1, low-pause ZGC/Shenandoah). The costs are startup time and warm-up, which is why long-running servers love it and short CLIs do not.

**Go: Goroutines and a Concurrent GC:**
Go compiles ahead of time to a single static binary. **Goroutines** are green threads with tiny growable stacks (a few KB) multiplexed by the runtime scheduler onto a small pool of OS threads (an M:N scheduler), so hundreds of thousands are practical. Channels give CSP-style communication. The garbage collector is a concurrent, non-generational, non-compacting mark-sweep tuned for sub-millisecond pauses at the expense of some throughput and memory overhead.

**Rust: Ownership Instead of a GC:**
Rust is AOT compiled with no runtime or garbage collector. The **ownership** model (one owner, moves, borrows checked at compile time) frees memory deterministically via RAII and makes use-after-free and data races compile errors. The \`Send\` and \`Sync\` traits encode which types may cross or be shared between threads. The trade is a steeper learning curve and longer compile times for predictable performance and memory.

**Putting It Together:**
When asked "why is Python slower than Java?" the answer is not "interpreted vs compiled" alone: it is dynamic typing forcing type checks on every operation, boxed integers, the absence of a specializing JIT in CPython, and the GIL limiting parallelism. When asked "why does Go start faster than Java?" it is AOT compilation and no class loading or JIT warm-up. Frame every comparison in terms of execution model, memory model, and type system.`,
      codeExample: `// JavaScript: microtasks vs macrotasks in the event loop

console.log("1: sync start");

setTimeout(() => console.log("5: timeout (macrotask)"), 0);

Promise.resolve().then(() => console.log("3: promise (microtask)"));

queueMicrotask(() => console.log("4: queueMicrotask"));

console.log("2: sync end");

// Output order: 1, 2, 3, 4, 5
// The current macrotask (this script) runs to completion, the microtask queue is
// drained in full, and only then does the loop pick up the next macrotask (the timer).

// A synchronous loop blocks EVERYTHING, including that timer:
function blockFor(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {}   // no await, no yield: the loop is stuck
}
// blockFor(5000);   // the timeout above could not fire until this returned


/* Python GIL in one picture:

   import threading, time

   def cpu():   # CPU-bound: two threads take ~2x as long as one (GIL serializes)
       sum(i * i for i in range(10_000_000))

   def io():    # I/O-bound: GIL released during sleep, threads overlap fine
       time.sleep(1)

   For real CPU parallelism: multiprocessing.Pool, or a C extension that
   releases the GIL (NumPy does).
*/


/* Go: cheap goroutines, scheduled M:N onto OS threads

   var wg sync.WaitGroup
   for i := 0; i < 100_000; i++ {     // 100k goroutines is fine
       wg.Add(1)
       go func() { defer wg.Done(); time.Sleep(time.Second) }()
   }
   wg.Wait()

   The same with 100k OS threads would exhaust memory on most systems.
*/`
    }
  ],

  visualizations: [
    {
      title: 'Source to Machine Code',
      description: 'The stages a compiler runs to turn text into an executable, and where each kind of error is caught',
      nodes: [
        { id: 'src', label: 'Source text', x: 60, y: 40, type: 'primary' },
        { id: 'lex', label: 'Lexer\ntokens', x: 190, y: 40, type: 'secondary' },
        { id: 'parse', label: 'Parser\nAST', x: 320, y: 40, type: 'secondary' },
        { id: 'sem', label: 'Semantic analysis\ntypes, scopes', x: 320, y: 140, type: 'warning' },
        { id: 'ir', label: 'IR + optimizer\ninline, fold, DCE', x: 190, y: 140, type: 'info' },
        { id: 'gen', label: 'Codegen\nregisters, asm', x: 60, y: 140, type: 'secondary' },
        { id: 'link', label: 'Linker\nresolve symbols', x: 60, y: 250, type: 'secondary' },
        { id: 'exe', label: 'Executable', x: 190, y: 250, type: 'success' }
      ],
      edges: [
        { from: 'src', to: 'lex' },
        { from: 'lex', to: 'parse', label: 'syntax errors' },
        { from: 'parse', to: 'sem', label: 'type errors' },
        { from: 'sem', to: 'ir' },
        { from: 'ir', to: 'gen' },
        { from: 'gen', to: 'link', label: 'object files' },
        { from: 'link', to: 'exe', label: '+ libraries' }
      ]
    },
    {
      title: 'Generational Garbage Collection',
      description: 'New objects start in a small nursery that is collected often; survivors are promoted to an old generation collected rarely',
      nodes: [
        { id: 'alloc', label: 'new Object()', x: 60, y: 40, type: 'primary' },
        { id: 'nursery', label: 'Nursery\n(young gen)', x: 190, y: 40, type: 'info' },
        { id: 'minor', label: 'Minor GC\nfast, frequent, copying', x: 190, y: 140, type: 'secondary' },
        { id: 'dead', label: 'Freed\n(most objects)', x: 60, y: 240, type: 'error' },
        { id: 'old', label: 'Old generation\n(tenured)', x: 320, y: 140, type: 'info' },
        { id: 'major', label: 'Major GC\nslow, rare, mark-sweep', x: 320, y: 240, type: 'warning' },
        { id: 'barrier', label: 'Write barrier\nremembered set', x: 320, y: 40, type: 'secondary' }
      ],
      edges: [
        { from: 'alloc', to: 'nursery', label: 'bump alloc' },
        { from: 'nursery', to: 'minor', label: 'nursery full' },
        { from: 'minor', to: 'dead', label: 'unreachable' },
        { from: 'minor', to: 'old', label: 'survived N times' },
        { from: 'old', to: 'major', label: 'old gen full' },
        { from: 'major', to: 'dead', label: 'unreachable' },
        { from: 'old', to: 'barrier', label: 'old -> young ref' },
        { from: 'barrier', to: 'minor', label: 'extra roots' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-lr-c1', front: 'What are the main stages of a compiler, in order?', back: 'Lexing (tokens), parsing (AST), semantic analysis (names, types), IR generation, optimization, code generation (instruction selection, register allocation), then assembling and linking into an executable.' },
    { id: 'cs-lr-c2', front: 'Where in the pipeline is "undefined variable" caught, versus a missing semicolon?', back: 'A missing semicolon is a syntax error caught by the parser. An undefined variable is caught during semantic analysis (name resolution), after the AST is built.' },
    { id: 'cs-lr-c3', front: 'Why do compilers translate to an intermediate representation instead of generating machine code straight from the AST?', back: 'An IR (LLVM IR, bytecode, SSA) is simpler and more uniform than source and independent of the target CPU, so one set of optimizations serves every front-end language and every back-end target.' },
    { id: 'cs-lr-c4', front: 'What is the difference between static and dynamic linking?', back: 'Static linking copies library code into the executable at build time (self-contained, larger). Dynamic linking records references to shared libraries resolved at load/run time (smaller binaries, one copy shared by many processes, patchable independently, but dependency on the installed library).' },
    { id: 'cs-lr-c5', front: 'What is a bytecode virtual machine and why is it faster than a tree-walking interpreter?', back: 'The source is compiled once into compact instructions for an abstract machine, then executed by a tight dispatch loop. Bytecode avoids the pointer chasing and repeated analysis of walking an AST node by node.' },
    { id: 'cs-lr-c6', front: 'What is tiered compilation in a JIT?', back: 'Code starts in an interpreter, is quickly compiled by a cheap baseline compiler once warm, and then by an expensive optimizing compiler once hot. Cheap tiers give fast startup; expensive tiers give peak speed only for code that earns it.' },
    { id: 'cs-lr-c7', front: 'What is deoptimization?', back: 'A JIT compiles code speculatively based on observed types ("this is always an int"). If a guard fails at runtime, execution bails out of the optimized code back to the interpreter and the compiled version is discarded or recompiled.' },
    { id: 'cs-lr-c8', front: 'What is an inline cache?', back: 'A per-call-site cache remembering which class/shape was last seen and the resolved method or property offset. If the next object matches, the lookup is skipped. Monomorphic sites are fast; megamorphic sites fall back to slow lookup.' },
    { id: 'cs-lr-c9', front: 'What can a JIT do that an ahead-of-time compiler cannot?', back: 'Optimize using actual runtime profiles: specialize on the types that really occur, inline across dynamic call boundaries, and recompile when behavior changes. The AOT compiler must optimize for the general case without that data.' },
    { id: 'cs-lr-c10', front: 'Why is stack allocation so much faster than heap allocation?', back: 'Allocating on the stack is a pointer bump and freeing is implicit when the frame pops. Heap allocation goes through an allocator that searches free lists, handles size classes and fragmentation, and later needs explicit freeing or GC.' },
    { id: 'cs-lr-c11', front: 'What is in a stack frame?', back: 'The return address, saved registers (including the previous frame pointer), the function\'s parameters (those not passed in registers), and its local variables. It is pushed on call and popped on return.' },
    { id: 'cs-lr-c12', front: 'What is a dangling pointer?', back: 'A pointer to memory that has been freed or whose stack frame has been popped. Reading or writing through it is undefined behavior: silent corruption, crashes, or exploitable bugs.' },
    { id: 'cs-lr-c13', front: 'What does RAII guarantee that garbage collection does not?', back: 'Deterministic, scope-bound release: the destructor runs at the exact moment the owner goes out of scope, including on exceptions. GC finalization is non-deterministic, so files, sockets, and locks still need explicit close in GC languages.' },
    { id: 'cs-lr-c14', front: 'How does Rust prevent use-after-free without a garbage collector?', back: 'Ownership: each value has one owner, assignment moves it, and the borrow checker verifies at compile time that references never outlive the owner and that mutable access is exclusive. Violations are compile errors with zero runtime cost.' },
    { id: 'cs-lr-c15', front: 'How can a program in a garbage-collected language still leak memory?', back: 'By keeping objects reachable unintentionally: entries in static maps or caches, event listeners never unregistered, closures capturing large objects, thread-locals in pooled threads. The GC frees only unreachable objects.' },
    { id: 'cs-lr-c16', front: 'What are GC roots?', back: 'The starting points for reachability: thread stacks (locals and parameters), global and static variables, and CPU registers. Anything reachable by following references from a root is live; the rest is garbage.' },
    { id: 'cs-lr-c17', front: 'What is the main weakness of reference counting and how do runtimes handle it?', back: 'Cycles: objects that reference each other never reach a count of zero. CPython adds a separate cycle-detecting collector; Swift and Rust rely on weak references to break cycles. It also costs an increment/decrement on every pointer assignment.' },
    { id: 'cs-lr-c18', front: 'How does a copying collector\'s cost differ from mark-sweep?', back: 'Copying is proportional to live data (only survivors are copied) and yields a compacted heap with bump allocation. Mark-sweep touches all objects during sweep and leaves fragmentation. Copying wastes half the memory as the empty semispace.' },
    { id: 'cs-lr-c19', front: 'What is the weak generational hypothesis and how does a generational GC exploit it?', back: 'Most objects die young. So allocate into a small nursery collected frequently with a fast copying collector, and promote the few survivors to an old generation collected rarely. Minor GCs are cheap because most of the nursery is dead.' },
    { id: 'cs-lr-c20', front: 'Why does a generational GC need a write barrier?', back: 'A minor GC scans only the nursery, so it must know about references from old objects into young ones. The write barrier intercepts pointer stores into old objects and records them (card table or remembered set) as extra roots for the next minor GC.' },
    { id: 'cs-lr-c21', front: 'What is tri-color marking and why do concurrent collectors use it?', back: 'Objects are white (unvisited), gray (reached, children not yet scanned), or black (fully scanned). The invariant "no black object points to a white one", maintained with write barriers, lets marking run while the program mutates the heap.' },
    { id: 'cs-lr-c22', front: 'What is the tradeoff between stop-the-world and concurrent garbage collectors?', back: 'Stop-the-world collectors are simpler and have higher throughput but pause the program for time proportional to the work. Concurrent collectors run alongside the program for millisecond pauses, at the cost of CPU overhead, barriers, and some throughput.' },
    { id: 'cs-lr-c23', front: 'Is Python strongly or weakly typed, and static or dynamic?', back: 'Dynamic (types checked at runtime, values carry their type) and strong ("5" + 1 raises TypeError rather than coercing). JavaScript is dynamic and weak; C is static and weak; Java is static and strong.' },
    { id: 'cs-lr-c24', front: 'What is the difference between nominal and structural typing?', back: 'Nominal: compatibility by declared name (a class must explicitly extend or implement). Structural: compatibility by shape (any type with the required members qualifies), as with TypeScript interfaces and Go interfaces, which are satisfied implicitly.' },
    { id: 'cs-lr-c25', front: 'What is type erasure and what does it prevent in Java?', back: 'Generic type parameters are removed at compile time, so List<String> and List<Integer> are the same runtime class. You cannot do new T(), T[] creation, or instanceof List<String>, and overloads differing only by type argument are rejected.' },
    { id: 'cs-lr-c26', front: 'Why are mutable generic containers invariant?', back: 'If List<Cat> were usable as List<Animal>, you could add a Dog to it through the Animal view and later read a Dog from the Cat list. Reads are safe under covariance, writes under contravariance; a mutable container does both, so it must be invariant.' },
    { id: 'cs-lr-c27', front: 'What is gradual typing?', back: 'Adding static types incrementally to a dynamically typed language (TypeScript, Python type hints with mypy), with an escape hatch like any so untyped and typed code coexist. Checks are usually erased at runtime, so they are hints for tools, not guarantees.' },
    { id: 'cs-lr-c28', front: 'What is a closure, at the implementation level?', back: 'A function value that pairs code with its captured environment. Captured variables that outlive the enclosing frame are moved into heap-allocated cells shared by the closure and the enclosing scope, which is why mutations are visible in both.' },
    { id: 'cs-lr-c29', front: 'How is the receiver (this/self) of a method call passed?', back: 'As a hidden first argument. C++ and Java pass it implicitly, Python names it self explicitly, and JavaScript binds it at the call site (obj.f() sets it to obj; a detached call does not), which is why arrow functions and bind exist.' },
    { id: 'cs-lr-c30', front: 'Why are goroutines cheaper than OS threads?', back: 'They start with a tiny growable stack (a few KB, not megabytes), are created and switched in user space by the Go scheduler without a kernel call, and are multiplexed M:N onto a small pool of OS threads, so hundreds of thousands are practical.' }
  ],

  quizQuestions: [
    {
      id: 'cs-lr-q1',
      question: 'A compiler reports "expected \')\' before \'{\'". Which stage produced this error?',
      options: ['Lexer', 'Parser', 'Semantic analysis', 'Linker'],
      correctAnswer: 1,
      explanation: 'Mismatched or missing punctuation violates the grammar, which the parser checks while building the AST. The lexer only splits characters into tokens; semantic analysis handles names and types; the linker resolves symbols.'
    },
    {
      id: 'cs-lr-q2',
      question: 'A JIT compiled a hot function assuming its argument is always a number. A string is passed for the first time. What happens?',
      options: ['A runtime type error is thrown', 'The compiled code silently returns NaN', 'A guard fails and execution deoptimizes back to the interpreter, which handles the string', 'The JIT refuses to run the function again'],
      correctAnswer: 2,
      explanation: 'Speculative optimizations are protected by guards. When one fails the runtime bails out to the generic interpreted path and may recompile with the new profile. This is why type-unstable code runs slower in JIT engines.'
    },
    {
      id: 'cs-lr-q3',
      question: 'Two identical services are benchmarked: one in Go, one on the JVM. The JVM one is slower for the first 30 seconds and then matches or beats Go. What best explains the first 30 seconds?',
      options: ['JIT warm-up: the JVM interprets and profiles before tiered compilation produces optimized native code', 'Java\'s garbage collector runs continuously at startup', 'Go binaries are always faster than JVM code', 'The JVM was still downloading class files'],
      correctAnswer: 0,
      explanation: 'Go is AOT compiled and runs at full speed immediately. HotSpot starts in the interpreter, collects profiles, and compiles hot methods in tiers, so peak performance arrives only after warm-up.'
    },
    {
      id: 'cs-lr-q4',
      question: 'A C function returns the address of a local array to its caller, which then reads from it. Why is this a bug?',
      options: ['Arrays cannot be returned by pointer in C', 'The caller must free the array first', 'Local arrays are stored in read-only memory', 'The local lived in a stack frame that was popped on return, so the pointer dangles'],
      correctAnswer: 3,
      explanation: 'Locals live in the function\'s stack frame, which is reclaimed when the function returns. The next call overwrites it. To outlive the call the data must be heap-allocated or owned by the caller.'
    },
    {
      id: 'cs-lr-q5',
      question: 'In a C++ function, an object holding a file handle is created on the stack and an exception is thrown before the function ends. What happens to the file?',
      options: ['It stays open until the program exits', 'It is closed by the garbage collector eventually', 'It is closed by the object\'s destructor during stack unwinding', 'The exception is suppressed until the file is closed'],
      correctAnswer: 2,
      explanation: 'RAII ties the resource to the object\'s lifetime. Stack unwinding runs destructors for every fully constructed local object, so the handle is released deterministically even on the exceptional path.'
    },
    {
      id: 'cs-lr-q6',
      question: 'A Java service slowly grows in memory until it crashes with OutOfMemoryError. Which is the most likely cause?',
      options: ['The GC forgot to free some objects', 'Objects are still reachable from a static map or listener list that is never cleared', 'The JVM does not free memory from short-lived objects', 'Stack frames are not popped after method returns'],
      correctAnswer: 1,
      explanation: 'GC frees only unreachable objects. A leak in a GC language means unintended reachability: caches without eviction, listeners never removed, static collections. The collector is doing its job; the program is holding references.'
    },
    {
      id: 'cs-lr-q7',
      question: 'Two CPython objects reference each other and nothing else references them. What happens under pure reference counting?',
      options: ['Neither is freed because each still has a count of one', 'Both are freed immediately because they are unreachable', 'The interpreter raises a MemoryError', 'One is freed and the other becomes a dangling reference'],
      correctAnswer: 0,
      explanation: 'Reference counting frees an object only when its count reaches zero, and the cycle keeps both counts at one. CPython needs its separate cycle collector, which uses reachability, to reclaim them.'
    },
    {
      id: 'cs-lr-q8',
      question: 'In a generational collector, why can a minor GC finish quickly without scanning the large old generation?',
      options: ['Old objects are never referenced by young ones', 'The old generation is stored on disk', 'A write barrier recorded which old objects point into the nursery, and those serve as extra roots', 'Minor GCs use reference counting instead of tracing'],
      correctAnswer: 2,
      explanation: 'Without the remembered set/card table maintained by the write barrier, the collector would have to scan every old object to find pointers into the nursery. The barrier makes old-to-young references explicit and cheap to find.'
    },
    {
      id: 'cs-lr-q9',
      question: 'A latency-sensitive service on a 16 GB heap suffers 2-second pauses during full collections. Which change most directly targets the pauses?',
      options: ['Increase the heap to 32 GB', 'Disable the young generation', 'Replace the JVM with reference counting', 'Switch to a concurrent, low-pause collector such as ZGC or Shenandoah'],
      correctAnswer: 3,
      explanation: 'A bigger heap makes stop-the-world collections rarer but each one longer. Concurrent collectors do most marking and relocation alongside the application, trading some throughput for pauses measured in milliseconds.'
    },
    {
      id: 'cs-lr-q10',
      question: 'What does the copying (semispace) collector\'s cost depend on, and what is its main memory cost?',
      options: ['Proportional to total heap size; no extra memory', 'Proportional to live data; half the heap is idle as the empty to-space', 'Proportional to the number of roots; doubles every object\'s header', 'Constant time; requires no extra memory'],
      correctAnswer: 1,
      explanation: 'Only live objects are copied, so a mostly-dead heap is collected almost for free and the result is compacted with bump allocation. The price is reserving a second semispace that is empty between collections.'
    },
    {
      id: 'cs-lr-q11',
      question: 'In JavaScript, what do "5" - 1 and "5" + 1 evaluate to?',
      options: ['4 and 6', 'TypeError for both', '4 and "51"', '"4" and "51"'],
      correctAnswer: 2,
      explanation: 'JavaScript is weakly typed: minus only makes sense on numbers so the string is coerced to 5, giving 4. Plus with a string operand means concatenation, giving "51". Python (strongly typed) would raise on both.'
    },
    {
      id: 'cs-lr-q12',
      question: 'In Go, a type from a third-party package has a Write([]byte) (int, error) method but never mentions io.Writer. Can it be passed where an io.Writer is required?',
      options: ['Yes, Go interfaces are structural and satisfied implicitly by matching method sets', 'No, it must explicitly declare that it implements io.Writer', 'Only after wrapping it in a struct that embeds io.Writer', 'Only if both types are in the same package'],
      correctAnswer: 0,
      explanation: 'Go uses structural typing for interfaces: any type with the right method set satisfies the interface, with no declaration. This is what lets you adapt types you do not own. Java, by contrast, is nominal and needs an explicit implements.'
    },
    {
      id: 'cs-lr-q13',
      question: 'Java code does: Animal[] a = new Cat[2]; a[0] = new Dog(); What happens?',
      options: ['Compile error: Cat[] is not an Animal[]', 'Compiles and runs; a[0] holds a Dog', 'Compiles but throws ArrayStoreException at runtime', 'The Dog is silently converted to a Cat'],
      correctAnswer: 2,
      explanation: 'Java arrays are covariant so the assignment compiles, but the runtime array is really a Cat[] and checks each store. This unsoundness is why generics (List<Cat>) were made invariant instead.'
    },
    {
      id: 'cs-lr-q14',
      question: 'Why can a Java generic method not execute new T() to create an instance of its type parameter?',
      options: ['Generic types are abstract by default', 'Constructors cannot be generic', 'T might be a primitive type', 'Type erasure removes T at compile time, so the runtime has no class to instantiate'],
      correctAnswer: 3,
      explanation: 'After erasure T becomes Object (or its bound), so the bytecode has no record of the actual type argument. C# and C++ retain or specialize the type and allow it; Java code passes a Class<T> or a factory instead.'
    },
    {
      id: 'cs-lr-q15',
      question: 'In a TypeScript function typed to accept a User, a value declared as any is passed. What does the type checker do?',
      options: ['Rejects the call because any is not a User', 'Accepts the call and stops checking that value; any is the gradual-typing escape hatch', 'Inserts a runtime check that the value is a User', 'Converts the value to a User'],
      correctAnswer: 1,
      explanation: 'any is assignable to and from everything, deliberately disabling checking so untyped code can coexist with typed code. Nothing is verified at runtime because TypeScript types are erased.'
    },
    {
      id: 'cs-lr-q16',
      question: 'for (var i = 0; i < 3; i++) fns.push(() => i); What does fns.map(f => f()) return, and why?',
      options: ['[3, 3, 3] because var creates one binding shared by reference across all closures', '[0, 1, 2] because each closure captures the value at creation', '[undefined, undefined, undefined] because i is out of scope', '[0, 1, 2] because arrow functions freeze their arguments'],
      correctAnswer: 0,
      explanation: 'Closures capture variables, not values. var is function-scoped, so all three closures share the same i, which is 3 when they run. let creates a fresh binding per iteration and yields [0, 1, 2].'
    },
    {
      id: 'cs-lr-q17',
      question: 'const greet = user.greet; greet(); In strict-mode JavaScript, what is this inside greet?',
      options: ['user, because greet was defined on user', 'The global object', 'undefined, because this is bound by the call site and there is no receiver', 'A new empty object'],
      correctAnswer: 2,
      explanation: 'JavaScript binds this at the call site, not the definition site. A plain call has no receiver, so strict mode gives undefined (sloppy mode gives the global object). Use bind, call, or an arrow function to fix the receiver.'
    },
    {
      id: 'cs-lr-q18',
      question: 'A CPU-bound Python script is parallelized with 8 threads on an 8-core machine and gets no faster. Which explanation and fix are correct?',
      options: ['Python threads are simulated; use asyncio instead', 'The GIL lets only one thread run Python bytecode at a time; use multiprocessing or a GIL-releasing native library', 'The threads need higher priority; use os.nice', 'Python has no real threads; use a thread pool'],
      correctAnswer: 1,
      explanation: 'CPython threads are real OS threads, but the GIL serializes bytecode execution, so CPU-bound work does not scale. Separate processes have separate GILs, and C extensions like NumPy release the GIL inside native code. asyncio is for I/O, not CPU.'
    },
    {
      id: 'cs-lr-q19',
      question: 'setTimeout(() => log("A"), 0); Promise.resolve().then(() => log("B")); log("C"); What order is logged?',
      options: ['A, B, C', 'C, A, B', 'C, B, A', 'B, C, A'],
      correctAnswer: 2,
      explanation: 'Synchronous code runs first (C). After the current macrotask ends the microtask queue is drained fully, so the promise callback (B) runs before the event loop picks up the timer macrotask (A), even with a 0 ms delay.'
    },
    {
      id: 'cs-lr-q20',
      question: 'A Rust program tries to send a value to another thread but the compiler rejects it, citing a missing Send implementation. What is the compiler protecting against?',
      options: ['Sharing a value across threads in a way that could cause a data race or unsound access', 'A stack overflow on the new thread', 'The value being garbage collected too early', 'The thread exceeding its memory quota'],
      correctAnswer: 0,
      explanation: 'Send and Sync are marker traits that encode thread-safety in the type system. A type like Rc (non-atomic reference counting) is not Send, so moving it to another thread is a compile error rather than a latent data race.'
    }
  ]
};
