// CS Fundamentals - OOP & Design Patterns
// SOLID, the patterns interviewers actually ask about, and how to ace a low-level design round

import { Category } from '../../types';

export const oopDesignPatterns: Category = {
  id: 'cs-oop-design-patterns',
  name: 'OOP & Design Patterns',
  slug: 'cs-oop-design-patterns',
  description: 'SOLID, the patterns interviewers actually ask about, and how to ace a low-level design round',
  icon: 'cube-outline',
  color: '#EC4899',
  colorDark: '#DB2777',
  premium: true,

  learnContent: [
    {
      id: 'cs-oop-1',
      title: 'The Four Pillars, Composition, and Interfaces vs Abstract Classes',
      content: `Object-oriented design is about deciding who owns which data and behavior, and how pieces can change independently. Interviewers start with the pillars, then push on when inheritance is the wrong tool.

**The Four Pillars:**
- **Encapsulation** - bundle state with the methods that keep its invariants; hide the representation (\`private\` fields, public methods). The test: can you change the internal representation without touching callers?
- **Abstraction** - expose what an object does, not how: \`gateway.charge(amount)\` instead of HTTP calls, retries, and idempotency keys
- **Inheritance** - a subclass reuses and specializes a parent (\`is-a\`). Cheap to write, expensive to change
- **Polymorphism** - one interface, many implementations. Runtime (subtype) polymorphism dispatches on the object's actual type; compile-time polymorphism is overloading and generics

**Composition over Inheritance:**
Inheritance couples a child to its parent's *implementation*, not just its interface. The problems show up fast:
- **Fragile base class** - a change inside the parent silently breaks subclasses that depended on its internals
- Deep hierarchies and combinatorial explosion (\`FlyingSwimmingDuck\`, \`FlyingNonSwimmingDuck\`)
- Behavior is fixed at compile time; you cannot swap it per instance
Composition holds behavior as a field (\`has-a\`) behind an interface: a \`Duck\` *has* a \`FlyBehavior\`. Behaviors become reusable across unrelated classes, swappable at runtime, and testable in isolation. Reserve inheritance for genuine is-a relationships where every subclass honors the parent's full contract.

**Interfaces vs Abstract Classes:**
- **Interface** - a pure contract: method signatures, no state. A class can implement many. Use for capabilities (\`Comparable\`, \`Repository\`, \`Closeable\`)
- **Abstract class** - a partial implementation: shared fields, constructors, and concrete helpers plus abstract hooks. Single inheritance only. Use when subclasses share real code (see Template Method)
- Rule of thumb: define the *type* with an interface, share *code* with an abstract base that implements it, and let callers depend only on the interface

**Multiple Inheritance and the Diamond:**
If \`B\` and \`C\` both override \`A.m()\` and \`D\` extends both, which \`m\` does \`D\` get? Java and C# forbid multiple class inheritance and use interfaces (default-method clashes must be overridden explicitly); C++ allows it and needs virtual inheritance to avoid duplicating \`A\`; Python resolves it with the C3 method resolution order.`,
      codeExample: `// Inheritance: every Duck inherits fly(), including ducks that cannot fly
class Duck {
  fly(): string { return 'flapping'; }
  quack(): string { return 'quack'; }
}
class RubberDuck extends Duck {
  override fly(): string { return ''; }          // forced to neuter the parent's behavior
  override quack(): string { return 'squeak'; }
}

// Composition: behavior is a swappable collaborator behind an interface
interface FlyBehavior { fly(): string; }
interface QuackBehavior { quack(): string; }

class FlyWithWings implements FlyBehavior { fly() { return 'flapping'; } }
class NoFly        implements FlyBehavior { fly() { return ''; } }
class Squeak       implements QuackBehavior { quack() { return 'squeak'; } }

class ComposedDuck {
  constructor(
    private flyBehavior: FlyBehavior,             // has-a, not is-a
    private quackBehavior: QuackBehavior,
  ) {}
  performFly() { return this.flyBehavior.fly(); }
  performQuack() { return this.quackBehavior.quack(); }
  setFlyBehavior(b: FlyBehavior) { this.flyBehavior = b; }   // swap at runtime
}

const rubber = new ComposedDuck(new NoFly(), new Squeak());
rubber.setFlyBehavior(new FlyWithWings());        // rocket-powered rubber duck, no new class

// Interface = contract; abstract class = shared code plus hooks
interface Shape {
  area(): number;
  describe(): string;
}

abstract class BaseShape implements Shape {
  abstract area(): number;                        // hook each subclass must fill in
  describe(): string {                            // shared implementation
    return this.constructor.name + ' with area ' + this.area().toFixed(2);
  }
}

class Circle extends BaseShape {
  constructor(private r: number) { super(); }
  area() { return Math.PI * this.r * this.r; }
}

class Rect extends BaseShape {
  constructor(private w: number, private h: number) { super(); }
  area() { return this.w * this.h; }
}

// Callers depend on the interface only: runtime polymorphism picks area()
const shapes: Shape[] = [new Circle(1), new Rect(2, 3)];
shapes.map((s) => s.describe());   // ['Circle with area 3.14', 'Rect with area 6.00']`
    },
    {
      id: 'cs-oop-2',
      title: 'SOLID: Violations and Fixes',
      content: `SOLID is five heuristics for code that survives change. Interviewers rarely want definitions; they want you to spot a violation in code and fix it.

**S - Single Responsibility:**
A class should have one reason to change: one stakeholder, one axis of change.
- Violation: \`Invoice\` computes totals, formats itself as PDF, and saves to the database. A tax rule, a layout tweak, and a schema change all touch the same class
- Fix: \`Invoice\` (domain logic), \`InvoicePdfRenderer\`, \`InvoiceRepository\`

**O - Open/Closed:**
Open for extension, closed for modification: add behavior with new code, not by editing tested code.
- Violation: \`shippingCost(order)\` with a \`switch (order.carrier)\` that grows a case for every carrier
- Fix: a \`ShippingStrategy\` interface with one class per carrier; adding a carrier adds a class

**L - Liskov Substitution:**
Any subtype must be usable wherever the supertype is expected without surprising the caller: no strengthened preconditions, no weakened postconditions, no new exceptions, invariants preserved.
- Violation: \`Square extends Rectangle\` overrides \`setWidth\` to also set height; code that sets width 5, height 10 on a "Rectangle" gets area 100
- Violation: \`ReadOnlyList extends List\` throwing from \`add()\`
- Fix: don't inherit; model them as siblings under a common interface, or use composition

**I - Interface Segregation:**
Clients should not depend on methods they don't use. Fat interfaces force stub implementations and couple unrelated clients.
- Violation: \`Worker { work(); eat(); }\` forces \`Robot\` to implement \`eat()\`
- Fix: \`Workable\` and \`Eatable\`; \`Human\` implements both, \`Robot\` only one

**D - Dependency Inversion:**
High-level modules depend on abstractions, not on low-level details, and the abstraction is owned by the high-level side.
- Violation: \`OrderService\` calls \`new MySqlOrderRepository()\` and \`new SmtpMailer()\` in its constructor - untestable, and swapping either means editing the service
- Fix: \`OrderService\` receives \`OrderRepository\` and \`Notifier\` interfaces through its constructor (dependency injection); a composition root wires the concrete classes
- DIP is the principle; DI is the technique; an IoC container is an optional tool

**How They Connect:**
Strategy achieves OCP; DIP makes the strategy injectable; ISP keeps the strategy interface small; LSP is what makes substituting strategies safe. SRP is the reason each piece is its own class.`,
      codeExample: `// ---- Before: violates SRP, OCP, and DIP ----
class OrderService {
  private db = new MySqlConnection('localhost');            // DIP: concrete dependency
  private mailer = new SmtpMailer('smtp.example.com');

  checkout(order: Order) {
    let shipping = 0;
    switch (order.carrier) {                                  // OCP: edited for each carrier
      case 'ups':   shipping = 5 + order.weight * 0.5; break;
      case 'fedex': shipping = 7 + order.weight * 0.4; break;
    }
    this.db.execute('INSERT INTO orders ...');                // SRP: persistence
    this.mailer.send(order.email, 'Total: ' + (order.total + shipping)); // SRP: notification
  }
}

// ---- After ----
interface ShippingStrategy { cost(order: Order): number; }
class UpsShipping   implements ShippingStrategy { cost(o: Order) { return 5 + o.weight * 0.5; } }
class FedexShipping implements ShippingStrategy { cost(o: Order) { return 7 + o.weight * 0.4; } }
// Adding DHL = one new class, nothing above changes                      (OCP)

interface OrderRepository { save(order: Order): Promise<void>; }
interface Notifier { orderPlaced(order: Order, total: number): Promise<void>; }
// Small, client-specific interfaces                                      (ISP)

class BetterOrderService {
  constructor(                                                // DIP via dependency injection
    private repo: OrderRepository,
    private notifier: Notifier,
    private shipping: ShippingStrategy,
  ) {}

  async checkout(order: Order) {                              // one reason to change (SRP)
    const total = order.total + this.shipping.cost(order);
    await this.repo.save(order);
    await this.notifier.orderPlaced(order, total);
  }
}

// Composition root: the only place that knows concrete classes
const service = new BetterOrderService(new MySqlOrderRepository(), new EmailNotifier(), new UpsShipping());

// In a test: no database, no SMTP server
const totals: number[] = [];
const fakeRepo: OrderRepository = { save: async () => {} };
const spyNotifier: Notifier = { orderPlaced: async (_, total) => { totals.push(total); } };
await new BetterOrderService(fakeRepo, spyNotifier, new FedexShipping()).checkout(order);

// ---- LSP violation for contrast ----
class Rectangle {
  constructor(protected w: number, protected h: number) {}
  setWidth(w: number) { this.w = w; }
  setHeight(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  override setWidth(w: number) { this.w = w; this.h = w; }    // breaks Rectangle's contract
  override setHeight(h: number) { this.w = h; this.h = h; }
}
function stretch(r: Rectangle) { r.setWidth(5); r.setHeight(10); return r.area(); }
stretch(new Rectangle(1, 1)); // 50
stretch(new Square(1, 1));    // 100: the caller's assumption is silently broken`
    },
    {
      id: 'cs-oop-3',
      title: 'Creational Patterns',
      content: `Creational patterns decouple *what* gets created from *how*. The interview question is usually "why would you use this instead of just calling new?"

**Factory Method:**
A method that returns an interface type and hides which concrete class was chosen. Callers depend on \`Notification\`, never on \`EmailNotification\`.
- Use when the concrete type depends on runtime data (config, user preference, a string from the database)
- Adding a type means a new class plus one factory branch; callers are untouched

**Abstract Factory:**
A factory that produces a *family* of related objects meant to be used together: \`UiFactory\` with \`createButton()\` and \`createCheckbox()\`. \`MacUiFactory\` and \`WindowsUiFactory\` guarantee you never mix a Mac button with a Windows checkbox. Swap the whole family by swapping one object.

**Builder:**
Constructs a complex object step by step, replacing telescoping constructors (\`new Pizza(true, false, true, null, 12)\`).
- Named steps, optional parts, cross-field validation in \`build()\`, an immutable result
- Fluent chaining is a convenience; the pattern is about separating construction from representation
- In languages with named/default arguments (Kotlin, Python, TypeScript object literals) Builder is often unnecessary

**Singleton:**
One instance, globally reachable. It is the pattern interviewers most want you to *criticize*:
- **Global mutable state** - hidden coupling between everything that touches it
- **Hard to test** - cannot substitute a fake; state leaks between tests
- **Hidden dependencies** - a class's collaborators are not visible in its constructor
- **Concurrency** - lazy initialization needs synchronization: double-checked locking with a \`volatile\` field, the initialization-on-demand holder idiom, or an enum singleton in Java
- **Lifetime** - no clean shutdown or re-creation
Alternative: create one instance at the composition root and inject it. "There is one of these" is a wiring decision, not a class property. Defensible uses: stateless utilities, a logger, a process-wide cache where injection is impractical.

**Prototype:**
Create new objects by cloning a configured instance instead of building from scratch - useful when construction is expensive or the concrete class is unknown to the caller. Watch for shallow-copy bugs where clones share mutable sub-objects.

**Object Pool:**
Reuse expensive objects (database connections, threads, large buffers) instead of creating and discarding them; the pool bounds resource usage and hands out idle instances.`,
      codeExample: `// Factory Method: callers get the interface, never the concrete class
interface Notification { send(to: string, body: string): void; }
class EmailNotification implements Notification { send(to: string, body: string) { /* SMTP */ } }
class SmsNotification   implements Notification { send(to: string, body: string) { /* Twilio */ } }

class NotificationFactory {
  static create(channel: 'email' | 'sms'): Notification {
    switch (channel) {
      case 'email': return new EmailNotification();
      case 'sms':   return new SmsNotification();
    }
  }
}
NotificationFactory.create(user.preferredChannel).send(user.address, 'Hi');

// Builder: readable construction of a many-parameter, validated, immutable object
class HttpRequest {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly headers: Readonly<Record<string, string>>,
    readonly body?: string,
    readonly timeoutMs = 30000,
  ) {}
  static builder(url: string) { return new HttpRequestBuilder(url); }
}

class HttpRequestBuilder {
  private method = 'GET';
  private headers: Record<string, string> = {};
  private body?: string;
  private timeoutMs = 30000;
  constructor(private url: string) {}

  post(body: string) { this.method = 'POST'; this.body = body; return this; }
  header(k: string, v: string) { this.headers[k] = v; return this; }
  timeout(ms: number) { this.timeoutMs = ms; return this; }

  build(): HttpRequest {
    if (this.method === 'GET' && this.body) throw new Error('GET cannot have a body');
    return new HttpRequest(this.method, this.url, { ...this.headers }, this.body, this.timeoutMs);
  }
}

const req = HttpRequest.builder('https://api.example.com/orders')
  .post('{"id": 1}')
  .header('Content-Type', 'application/json')
  .timeout(5000)
  .build();

// Singleton: what people write, and why it hurts
class Config {
  private static instance?: Config;
  private constructor(private values: Record<string, string>) {}
  static get(): Config {                // global access point = hidden dependency
    if (!Config.instance) Config.instance = new Config(loadFromDisk());
    return Config.instance;             // lazy init: a race in multithreaded runtimes
  }
  value(key: string) { return this.values[key]; }
}
class PaymentService {
  charge() { const apiKey = Config.get().value('apiKey'); }   // untestable without disk I/O
}

// Prefer: single instance by wiring, injected explicitly
class BetterPaymentService {
  constructor(private config: Config) {}                     // visible and fakeable
}`
    },
    {
      id: 'cs-oop-4',
      title: 'Structural Patterns',
      content: `Structural patterns compose objects into larger structures. Several of them wrap an object and forward calls; the interview test is knowing *why* each one wraps.

**Adapter - change the interface:**
Make an existing class fit an interface the client expects. \`LegacyGateway.makePayment(cents)\` wrapped so it satisfies \`PaymentProcessor.charge(money)\`. Nothing new is added; the shape is translated. Use when integrating third-party or legacy code you cannot change.

**Decorator - same interface, add behavior:**
Wrap an object in another object with the same interface that adds responsibilities before or after delegating: \`LoggingRepository(CachingRepository(SqlRepository))\`. Stackable at runtime, one concern per decorator, avoids subclass explosion. Java's \`BufferedInputStream(new FileInputStream(...))\` is the canonical example; middleware chains are decorators in disguise.

**Proxy - same interface, control access:**
Stands in for the real object, usually without the client knowing:
- Virtual proxy: create the expensive object on first use
- Protection proxy: check permissions before forwarding
- Remote proxy: a local stub for an object across the network (gRPC stubs, RMI)
- Caching proxy: memoize results
Versus Decorator: a Proxy controls *whether and when* a call reaches the target and is chosen by the system; a Decorator adds behavior and is stacked by the client.

**Facade - simplify:**
One high-level entry point over a messy subsystem: \`VideoConverter.convert(file, 'mp4')\` hiding demuxers, codecs, and buffers. Reduces coupling to the subsystem; does not forbid direct access.

**Composite - treat one and many alike:**
A tree where leaves and containers share an interface, so \`folder.size()\` sums its children recursively and the client never distinguishes a file from a directory. Used for UI trees, file systems, org charts, expression trees.

**Flyweight - share the heavy part:**
When you need millions of similar objects, split state into **intrinsic** (shared, immutable: a glyph's outline, a tree model's mesh) and **extrinsic** (per use, passed in: position, color). A factory hands out shared intrinsic objects. Text editors store each character's glyph once and only the position per occurrence; Java's \`Integer.valueOf\` cache and string interning are flyweights.

**Bridge:**
Separate an abstraction hierarchy from its implementation hierarchy (\`Shape\` × \`Renderer\`) so both vary independently instead of \`CircleOpenGL\`, \`CircleVulkan\`, \`SquareOpenGL\`...`,
      codeExample: `// One interface shared by everything below
interface DataSource {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
}

class FileDataSource implements DataSource {
  async read(key: string) { return fs.readFile(key, 'utf8').catch(() => null); }
  async write(key: string, value: string) { await fs.writeFile(key, value); }
}

// Decorator: same interface, adds one concern, delegates to the wrapped instance
class EncryptedDataSource implements DataSource {
  constructor(private inner: DataSource, private key: string) {}
  async read(k: string) { const v = await this.inner.read(k); return v === null ? null : decrypt(v, this.key); }
  async write(k: string, v: string) { await this.inner.write(k, encrypt(v, this.key)); }
}
class LoggingDataSource implements DataSource {
  constructor(private inner: DataSource) {}
  async read(k: string) { console.log('read', k); return this.inner.read(k); }
  async write(k: string, v: string) { console.log('write', k); return this.inner.write(k, v); }
}
// Stacked at runtime; the client only sees DataSource
const ds: DataSource = new LoggingDataSource(new EncryptedDataSource(new FileDataSource(), 'k'));

// Proxy: same interface, controls access - a virtual + caching proxy
class CachingDataSource implements DataSource {
  private cache = new Map<string, string | null>();
  private real?: DataSource;
  constructor(private factory: () => DataSource) {}
  private target() { return (this.real ??= this.factory()); }  // create on first use
  async read(k: string) {
    if (!this.cache.has(k)) this.cache.set(k, await this.target().read(k));
    return this.cache.get(k)!;
  }
  async write(k: string, v: string) { this.cache.delete(k); await this.target().write(k, v); }
}

// Adapter: a third-party class with the wrong shape made to fit DataSource
class LegacyKvStore {
  getValue(key: string): string | undefined { return undefined; }
  setValue(key: string, value: string): void {}
}
class LegacyAdapter implements DataSource {
  constructor(private legacy: LegacyKvStore) {}
  async read(k: string) { return this.legacy.getValue(k) ?? null; }   // translate, don't add
  async write(k: string, v: string) { this.legacy.setValue(k, v); }
}

// Composite: files and folders share one interface
interface FsNode { size(): number; }
class FileNode implements FsNode {
  constructor(private bytes: number) {}
  size() { return this.bytes; }
}
class Folder implements FsNode {
  private children: FsNode[] = [];
  add(n: FsNode) { this.children.push(n); return this; }
  size() { return this.children.reduce((sum, c) => sum + c.size(), 0); }   // recursion for free
}
const root = new Folder().add(new FileNode(10)).add(new Folder().add(new FileNode(5)).add(new FileNode(7)));
root.size(); // 22

// Facade: one call over a subsystem
class MediaFacade {
  convert(path: string, format: string) {
    const stream = new Demuxer().open(path);
    const frames = new Decoder(stream.codec).decode(stream);
    return new Encoder(format).encode(frames);
  }
}`
    },
    {
      id: 'cs-oop-5',
      title: 'Behavioral Patterns',
      content: `Behavioral patterns assign responsibilities and define how objects talk to each other. Most "design a ..." questions end up reaching for two or three of these.

**Strategy - swap an algorithm:**
A family of interchangeable algorithms behind one interface, chosen at runtime: \`PricingStrategy\` (regular, member, promotional), \`CompressionStrategy\`, a sort comparator. Replaces conditionals on type; the client holds a reference to the strategy. With first-class functions a strategy is often just a function.

**Observer - publish/subscribe:**
A **subject** keeps a list of **observers** and notifies them of state changes; observers subscribe and unsubscribe. Decouples the source of an event from its reactions (UI listeners, model → view updates, domain events).
- **Push** (the subject sends the data) vs **pull** (the observer queries the subject after a notification)
- Pitfalls: forgotten unsubscribes leak memory (the "lapsed listener"), notification order is unspecified, and synchronous notify means a slow or throwing observer hurts the subject
- Message brokers are Observer at system scale

**Command - turn a request into an object:**
Wrap an action and its parameters in an object with \`execute()\` and often \`undo()\`. Enables queues, logging, retries, macros, transactional batching, and undo stacks. Menu items, thread-pool tasks, and database migrations are commands.

**State - behavior depends on state, without conditionals:**
Each state is a class implementing the same interface; the context delegates to its current state object, and transitions replace it. Cleans up sprawling \`switch (this.status)\` blocks. An \`Order\` moves Pending → Paid → Shipped → Delivered, and \`cancel()\` behaves differently in each.
- Strategy vs State: the *client* picks a Strategy and it rarely changes; State objects change *themselves* as transitions occur, and states know about each other

**Template Method - fixed skeleton, variable steps:**
An abstract base defines the algorithm's outline and calls abstract or overridable hooks for the variable parts (\`parse() → validate() → save()\`; a test framework's \`setUp\` / \`tearDown\`). Inheritance-based; Strategy is the composition-based alternative when you need runtime swapping.

**Iterator - traverse without exposing structure:**
Sequential access to a collection's elements without revealing its representation; several traversals can be in flight at once. Built into most languages (\`Iterable\`, generators); the interview version is writing one for a tree or a paginated API.

**Chain of Responsibility - pass along until handled:**
Each handler either handles the request or forwards it to the next: HTTP middleware (rate limit → auth → routing), logger hierarchies, support-ticket escalation, DOM event bubbling. The sender does not know which handler will act, and handlers can be reordered at runtime.

**Others Worth Naming:**
Mediator (centralize many-to-many communication - a chat room, an air-traffic controller), Memento (snapshot state for undo without breaking encapsulation), Visitor (add operations to a class hierarchy without editing it - AST walkers).`,
      codeExample: `// Observer: subject with an unsubscribe handle so listeners cannot leak
type Listener<T> = (event: T) => void;

class EventEmitter<T> {
  private listeners = new Set<Listener<T>>();
  subscribe(l: Listener<T>): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);        // caller MUST call this on teardown
  }
  emit(event: T) {
    for (const l of [...this.listeners]) {        // copy: a listener may unsubscribe mid-loop
      try { l(event); } catch (e) { console.error(e); }   // one bad observer must not break the rest
    }
  }
}

class StockTicker {
  readonly priceChanged = new EventEmitter<{ symbol: string; price: number }>();
  update(symbol: string, price: number) {
    this.priceChanged.emit({ symbol, price });    // push model: data travels with the event
  }
}
const ticker = new StockTicker();
const stop = ticker.priceChanged.subscribe((e) => { if (e.price > 100) alertUser(e); });
ticker.update('ACME', 101);
stop();                                           // component unmounted: unsubscribe

// Command: actions as objects, with undo/redo
interface Command { execute(): void; undo(): void; }

class InsertText implements Command {
  constructor(private doc: string[], private pos: number, private text: string) {}
  execute() { this.doc.splice(this.pos, 0, this.text); }
  undo()    { this.doc.splice(this.pos, 1); }
}

class Editor {
  private history: Command[] = [];
  private redoStack: Command[] = [];
  run(cmd: Command) { cmd.execute(); this.history.push(cmd); this.redoStack = []; }
  undo() { const c = this.history.pop(); if (c) { c.undo(); this.redoStack.push(c); } }
  redo() { const c = this.redoStack.pop(); if (c) { c.execute(); this.history.push(c); } }
}

// Chain of Responsibility: middleware where each link handles or passes on
type Req = { user?: string; path: string; ip: string };
type Handler = (req: Req, next: () => string) => string;

const rateLimit: Handler = (req, next) => (tooManyRequests(req.ip) ? '429 Too Many Requests' : next());
const auth: Handler = (req, next) => (req.user ? next() : '401 Unauthorized');
const route: Handler = (req) => '200 ' + req.path;   // end of the chain: never calls next

function chain(handlers: Handler[]): (req: Req) => string {
  return (req) => {
    let i = -1;
    const next = (): string => { i += 1; return handlers[i](req, next); };
    return next();
  };
}
const app = chain([rateLimit, auth, route]);        // reorder without touching any handler
app({ user: 'ada', path: '/orders', ip: '10.0.0.1' });   // '200 /orders'
app({ path: '/orders', ip: '10.0.0.1' });                // '401 Unauthorized'`
    },
    {
      id: 'cs-oop-6',
      title: 'The Low-Level Design Interview',
      content: `A low-level design (LLD, "object-oriented design") round asks you to design the classes for a system such as a parking lot, elevator, library, vending machine, or a game like Tic-Tac-Toe, in 30-45 minutes. You are graded on process and clean interfaces, not on finishing.

**The Method:**
1. **Requirements (3-5 min)** - ask and write down the core use cases, what is out of scope, scale hints, and the constraints that shape the model (multiple floors? spot sizes? payment?). State assumptions aloud
2. **Entities (5 min)** - list the nouns: \`ParkingLot\`, \`Level\`, \`Spot\`, \`Vehicle\`, \`Ticket\`, \`Payment\`, \`Gate\`. Decide which are classes, which are enums (\`SpotSize\`, \`VehicleType\`), and which are value objects (\`Money\`)
3. **Relationships (5 min)** - has-a with cardinality (a Lot has many Levels, a Level has many Spots, a Ticket references one Spot and one Vehicle); is-a only where it truly holds - a \`type\` field on \`Vehicle\` often beats three subclasses
4. **Interfaces and APIs (10 min)** - the verbs: \`lot.park(vehicle): Ticket\`, \`lot.unpark(ticket): Money\`. Write signatures before bodies. Put behavior on the class that owns the data; keep classes small
5. **Walk a flow (5 min)** - trace "a car arrives, parks, leaves, pays" through the objects and confirm every method you need exists
6. **Edge cases, patterns, extensibility** - lot full, lost ticket, concurrent entries at two gates, pricing changes. Name the pattern you are using and why: Strategy for pricing, Observer for display boards, State for the gate, Factory for spot creation. If someone says Singleton for the lot, explain why you would inject it instead

**What Interviewers Score:**
- Clarifying before designing; not over-modeling (\`Wheel\`, \`Engine\`, \`Windshield\` classes are a red flag)
- Correct visibility and immutability: ticket fields are read-only; a spot's occupancy changes only through \`Spot\`'s methods
- Enums instead of magic strings; value objects for money and ids
- Concurrency awareness: two gates assigning the same spot means the find-and-occupy step needs a lock, an atomic compare-and-set, or a transaction; ticket ids need a unique generator
- Extensibility through interfaces, not speculation: you can add EV spots without rewriting \`park()\`

**Worked Example - Parking Lot:**
Requirements: multiple levels; three spot sizes; motorcycles fit anywhere, cars fit medium or large, trucks need large; a ticket on entry, pay on exit by the hour; a display of free spots per level.
Entities: \`ParkingLot\`, \`Level\`, \`Spot(size, vehicle)\`, \`Vehicle(plate, type)\`, \`Ticket(id, spot, vehicle, entryTime)\`, \`PricingStrategy\`.
Flow: \`park\` → find the smallest free fitting spot across levels → occupy → issue ticket → notify display. \`unpark\` → compute duration → strategy computes fee → release spot → notify display.`,
      codeExample: `enum VehicleType { MOTORCYCLE, CAR, TRUCK }
enum SpotSize { SMALL, MEDIUM, LARGE }

class Vehicle {
  constructor(readonly plate: string, readonly type: VehicleType) {}
}

class Spot {
  private vehicle: Vehicle | null = null;
  constructor(readonly id: string, readonly size: SpotSize) {}
  isFree() { return this.vehicle === null; }
  fits(v: Vehicle): boolean {
    switch (v.type) {
      case VehicleType.MOTORCYCLE: return true;
      case VehicleType.CAR:        return this.size !== SpotSize.SMALL;
      case VehicleType.TRUCK:      return this.size === SpotSize.LARGE;
    }
  }
  occupy(v: Vehicle) { if (!this.isFree()) throw new Error('Spot occupied'); this.vehicle = v; }
  release() { this.vehicle = null; }
}

class Level {
  constructor(readonly floor: number, private spots: Spot[]) {}
  freeCount() { return this.spots.filter((s) => s.isFree()).length; }
  findSpot(v: Vehicle): Spot | undefined {
    return this.spots
      .filter((s) => s.isFree() && s.fits(v))
      .sort((a, b) => a.size - b.size)[0];        // smallest fitting spot first
  }
}

class Ticket {
  constructor(
    readonly id: string,
    readonly spot: Spot,
    readonly level: Level,
    readonly vehicle: Vehicle,
    readonly entryTime: Date,
  ) {}
}

// Strategy: pricing is the thing most likely to change
interface PricingStrategy { fee(vehicle: Vehicle, hours: number): number; }
class HourlyPricing implements PricingStrategy {
  fee(v: Vehicle, hours: number) {
    const rate = v.type === VehicleType.TRUCK ? 6 : v.type === VehicleType.CAR ? 4 : 2;
    return Math.ceil(hours) * rate;
  }
}

// Observer: display boards react without the lot knowing about them
type LotListener = (level: Level) => void;

class ParkingLot {
  private active = new Map<string, Ticket>();
  private listeners: LotListener[] = [];
  private nextId = 1;
  constructor(private levels: Level[], private pricing: PricingStrategy) {}

  onChange(l: LotListener) { this.listeners.push(l); }

  park(vehicle: Vehicle, now = new Date()): Ticket {
    // Real system: lock or compare-and-set here so two gates cannot take one spot
    for (const level of this.levels) {
      const spot = level.findSpot(vehicle);
      if (spot) {
        spot.occupy(vehicle);
        const ticket = new Ticket(String(this.nextId++), spot, level, vehicle, now);
        this.active.set(ticket.id, ticket);
        this.listeners.forEach((l) => l(level));
        return ticket;
      }
    }
    throw new Error('Lot full');
  }

  unpark(ticketId: string, now = new Date()): number {
    const ticket = this.active.get(ticketId);
    if (!ticket) throw new Error('Unknown ticket');       // lost ticket: separate flow
    const hours = (now.getTime() - ticket.entryTime.getTime()) / 3_600_000;
    const fee = this.pricing.fee(ticket.vehicle, hours);
    ticket.spot.release();
    this.active.delete(ticketId);
    this.listeners.forEach((l) => l(ticket.level));
    return fee;
  }
}

// Wiring at the composition root: one lot, no Singleton needed
const lot = new ParkingLot(
  [new Level(0, [new Spot('0-1', SpotSize.SMALL), new Spot('0-2', SpotSize.LARGE)])],
  new HourlyPricing(),
);
lot.onChange((level) => console.log('Level', level.floor, 'free:', level.freeCount()));
const t = lot.park(new Vehicle('ABC123', VehicleType.CAR));   // takes the LARGE spot
lot.unpark(t.id);                                             // fee for 1 hour: 4`
    }
  ],

  visualizations: [
    {
      title: 'Strategy vs Inheritance',
      description: 'Fixed behavior through a class hierarchy vs swappable behavior through composition',
      nodes: [
        { id: 'inh', label: 'Inheritance\nDuck.fly()', x: 90, y: 50, type: 'warning' },
        { id: 'mal', label: 'MallardDuck\ninherits fly', x: 40, y: 150, type: 'secondary' },
        { id: 'rub', label: 'RubberDuck\noverrides fly to no-op', x: 140, y: 150, type: 'error' },
        { id: 'str', label: 'Strategy\nDuck has FlyBehavior', x: 270, y: 50, type: 'primary' },
        { id: 'fb', label: 'FlyBehavior\ninterface', x: 270, y: 150, type: 'secondary' },
        { id: 'wings', label: 'FlyWithWings', x: 220, y: 250, type: 'success' },
        { id: 'nofly', label: 'NoFly\nswap at runtime', x: 320, y: 250, type: 'success' }
      ],
      edges: [
        { from: 'inh', to: 'mal', label: 'extends' },
        { from: 'inh', to: 'rub', label: 'extends (broken)' },
        { from: 'str', to: 'fb', label: 'composes' },
        { from: 'fb', to: 'wings', label: 'implements' },
        { from: 'fb', to: 'nofly', label: 'implements' }
      ]
    },
    {
      title: 'Observer: Subject and Subscribers',
      description: 'A subject notifies every registered observer when its state changes',
      nodes: [
        { id: 'subject', label: 'Subject\nobservers: [A, B, C]', x: 190, y: 40, type: 'primary' },
        { id: 'sub', label: 'subscribe()\nunsubscribe()', x: 320, y: 40, type: 'info' },
        { id: 'notify', label: 'state changes\nnotify()', x: 190, y: 140, type: 'secondary' },
        { id: 'obsA', label: 'Observer A\nupdate(e)', x: 60, y: 250, type: 'success' },
        { id: 'obsB', label: 'Observer B\nupdate(e)', x: 190, y: 250, type: 'success' },
        { id: 'obsC', label: 'Observer C\nupdate(e)', x: 320, y: 250, type: 'success' }
      ],
      edges: [
        { from: 'sub', to: 'subject', label: 'registers' },
        { from: 'subject', to: 'notify' },
        { from: 'notify', to: 'obsA', label: 'push event' },
        { from: 'notify', to: 'obsB', label: 'push event' },
        { from: 'notify', to: 'obsC', label: 'push event' },
        { from: 'obsC', to: 'sub', label: 'unsubscribe on teardown' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-oop-c1', front: 'What is the difference between encapsulation and abstraction?', back: 'Encapsulation hides how state is stored and protects its invariants (private fields, methods that maintain them). Abstraction hides what is irrelevant to the caller by exposing a simpler interface. Encapsulation is a mechanism; abstraction is a design choice about the interface.' },
    { id: 'cs-oop-c2', front: 'What is the difference between runtime and compile-time polymorphism?', back: 'Runtime (subtype) polymorphism dispatches a virtual method on the object\'s actual class when the call happens. Compile-time polymorphism (overloading, templates/generics) chooses the implementation from static types during compilation.' },
    { id: 'cs-oop-c3', front: 'Why is composition usually preferred over inheritance?', back: 'Composition depends only on a collaborator\'s interface, can be swapped at runtime, avoids fragile-base-class coupling and deep hierarchies, and is easier to test. Inheritance is reserved for true is-a relationships where every subclass honors the parent\'s full contract.' },
    { id: 'cs-oop-c4', front: 'What is the fragile base class problem?', back: 'A change to a base class - even an internal detail like which method calls which - breaks subclasses that unknowingly depended on it. It happens because inheritance exposes implementation, not just interface.' },
    { id: 'cs-oop-c5', front: 'When should you use an abstract class instead of an interface?', back: 'When subclasses share real code or state: common fields, constructors, or a Template Method skeleton. Use an interface for a pure contract that unrelated classes can implement and that a class can combine with other interfaces.' },
    { id: 'cs-oop-c6', front: 'What is the diamond problem?', back: 'With multiple inheritance, D extending B and C, which both override A.m(), makes it ambiguous which m() D inherits. Java and C# avoid it by allowing single class inheritance only (interface default-method clashes must be overridden explicitly); C++ uses virtual inheritance; Python uses the C3 MRO.' },
    { id: 'cs-oop-c7', front: 'What does "a class should have only one reason to change" mean in practice?', back: 'One actor or axis of change per class. If a tax rule, a PDF layout tweak, and a schema migration all touch Invoice, it has three responsibilities and should be split into domain, rendering, and persistence classes.' },
    { id: 'cs-oop-c8', front: 'How do you make code "open for extension, closed for modification"?', back: 'Depend on an abstraction and add behavior by adding implementations rather than editing existing conditionals: replace a growing switch on type with a Strategy interface and one class per case.' },
    { id: 'cs-oop-c9', front: 'Why does Square extends Rectangle violate the Liskov Substitution Principle?', back: 'Rectangle\'s contract lets width and height vary independently. Square must override setWidth to also change height, so code that sets width 5 and height 10 through a Rectangle reference gets area 100 instead of 50. The subtype breaks the supertype\'s postconditions.' },
    { id: 'cs-oop-c10', front: 'What rules must a subtype follow to satisfy LSP?', back: 'It may not strengthen preconditions, weaken postconditions, break the supertype\'s invariants, or throw exceptions the supertype\'s callers do not expect. In short: callers must not be able to tell the difference.' },
    { id: 'cs-oop-c11', front: 'What is a symptom of an Interface Segregation violation?', back: 'Implementations with empty or throwing methods (Robot.eat() throwing UnsupportedOperation), or clients forced to change because a method they never call changed. Fix by splitting the fat interface into small role interfaces.' },
    { id: 'cs-oop-c12', front: 'What is the difference between Dependency Inversion, Dependency Injection, and an IoC container?', back: 'DIP is the principle: high-level code depends on abstractions it owns. DI is the technique: pass dependencies in through constructors or parameters instead of constructing them. An IoC container is an optional tool that automates the wiring.' },
    { id: 'cs-oop-c13', front: 'What is the difference between Factory Method and Abstract Factory?', back: 'Factory Method creates one product behind an interface, letting a subclass or a switch pick the concrete class. Abstract Factory creates a whole family of related products (button, checkbox, menu) that must be consistent with each other.' },
    { id: 'cs-oop-c14', front: 'When is the Builder pattern worth it?', back: 'When an object has many parameters, several optional, with validation that spans them: it replaces telescoping constructors with named steps and validates in build(). It is less necessary in languages with named or default arguments.' },
    { id: 'cs-oop-c15', front: 'What is wrong with the Singleton pattern?', back: 'It is global mutable state: hidden dependencies invisible in constructors, no way to substitute a fake in tests, state leaking between tests, lazy-initialization race conditions, and no controlled lifetime. Prefer creating one instance at the composition root and injecting it.' },
    { id: 'cs-oop-c16', front: 'How do you make lazy Singleton initialization thread-safe in Java?', back: 'Use the initialization-on-demand holder idiom (a nested static class whose static field the class loader initializes once), an enum singleton, or double-checked locking with a volatile field. A plain null-check is a race.' },
    { id: 'cs-oop-c17', front: 'What is the Prototype pattern and its main pitfall?', back: 'Create objects by cloning a pre-configured instance instead of constructing from scratch - useful when construction is costly or the concrete type is unknown to the caller. Pitfall: a shallow clone shares mutable sub-objects with the original; you usually need a deep copy.' },
    { id: 'cs-oop-c18', front: 'Adapter, Decorator, and Proxy all wrap an object. How do they differ?', back: 'Adapter changes the interface to what the client expects. Decorator keeps the interface and adds behavior, stackable by the client. Proxy keeps the interface and controls access (lazy creation, permissions, caching, remoting), usually transparently.' },
    { id: 'cs-oop-c19', front: 'What problem does a Facade solve?', back: 'A subsystem with many classes and a complicated call sequence. The facade offers one simple entry point, cutting the client\'s coupling to the subsystem\'s internals, without preventing direct access when it is needed.' },
    { id: 'cs-oop-c20', front: 'When do you reach for the Composite pattern?', back: 'Part-whole hierarchies where clients should treat a single object and a group uniformly: file systems, UI trees, org charts, expression trees. Leaf and container share one interface and containers recurse over their children.' },
    { id: 'cs-oop-c21', front: 'In Flyweight, what are intrinsic and extrinsic state?', back: 'Intrinsic state is the shared, immutable part stored once in the flyweight (a glyph\'s outline, a tree type\'s mesh). Extrinsic state is the per-use part the client passes in (position, color). Sharing intrinsic state is how millions of objects fit in memory.' },
    { id: 'cs-oop-c22', front: 'What is the difference between Strategy and State?', back: 'Both delegate to an interchangeable object. With Strategy the client chooses the algorithm and it rarely changes; strategies do not know each other. With State the context\'s behavior changes as its state object transitions, and states know which state comes next.' },
    { id: 'cs-oop-c23', front: 'What is the most common bug with the Observer pattern?', back: 'The lapsed listener: an observer that never unsubscribes stays referenced by the subject, leaking memory and reacting to events after it should be gone. Return or store an unsubscribe handle and call it on teardown.' },
    { id: 'cs-oop-c24', front: 'Push vs pull in the Observer pattern?', back: 'Push: the subject includes the changed data in the notification - simple, but observers are coupled to the payload shape. Pull: the subject only signals "changed" and observers query what they need - more flexible, but observers must hold a reference to the subject.' },
    { id: 'cs-oop-c25', front: 'Why turn a request into a Command object?', back: 'Once an action is an object with execute() and undo(), you can queue it, log it, retry it, batch it, run it on another thread, and build undo/redo stacks. It decouples the invoker (a button, a scheduler) from the receiver that does the work.' },
    { id: 'cs-oop-c26', front: 'Template Method vs Strategy?', back: 'Template Method fixes the algorithm skeleton in a base class and lets subclasses override individual steps (inheritance, chosen at compile time). Strategy makes the whole algorithm a swappable object (composition, chosen at runtime). Prefer Strategy when the variation should change per instance.' },
    { id: 'cs-oop-c27', front: 'Give a real-world example of Chain of Responsibility.', back: 'HTTP middleware: a request passes through rate limiting, authentication, then routing; each handler either responds or calls next. Also DOM event bubbling and logger hierarchies. The sender never knows which handler will act.' },
    { id: 'cs-oop-c28', front: 'What should you do in the first five minutes of a low-level design interview?', back: 'Clarify requirements and scope: core use cases, what is explicitly out, scale hints, and the constraints that shape the model (spot sizes, multiple floors, payment). Write the assumptions down and get agreement before naming a single class.' },
    { id: 'cs-oop-c29', front: 'How do you find the entities and relationships for an LLD problem?', back: 'Nouns in the requirements become classes, enums, or value objects; verbs become methods on the class that owns the data. Then fix cardinality (one lot has many levels) and use is-a only when the subtype honors the full parent contract; otherwise use a type field or composition.' },
    { id: 'cs-oop-c30', front: 'Two parking-lot gates try to assign the last free spot at the same time. How do you handle it?', back: 'Make find-and-occupy atomic: a lock around allocation (per lot or per level), an atomic compare-and-set on the spot\'s occupancy, or a database transaction with a unique constraint. Generate ticket ids from a single source so the gates cannot collide.' }
  ],

  quizQuestions: [
    {
      id: 'cs-oop-q1',
      question: 'Which observation is the clearest sign that a class violates the Single Responsibility Principle?',
      options: ['It has more than five public methods', 'Unrelated teams modify it for unrelated reasons, such as tax rules and PDF layout', 'It implements two interfaces', 'Its constructor takes three parameters'],
      correctAnswer: 1,
      explanation: 'SRP is about reasons to change, not method count. If a tax change and a layout change both land in the same class, it serves two masters and should be split. Implementing two small interfaces or taking three dependencies is perfectly normal.'
    },
    {
      id: 'cs-oop-q2',
      question: 'shippingCost(order) contains switch (order.carrier) { case "ups": ...; case "fedex": ... }. Adding DHL means editing this function. Which principle is violated and what is the fix?',
      options: ['Liskov Substitution; make DHL a subclass of UPS', 'Interface Segregation; split the order class', 'Open/Closed; introduce a ShippingStrategy interface with one class per carrier', 'Single Responsibility; move the switch into the Order class'],
      correctAnswer: 2,
      explanation: 'Every new carrier reopens tested code, the hallmark of an Open/Closed violation. A strategy interface lets you add a carrier by adding a class. Moving the switch elsewhere just relocates the problem.'
    },
    {
      id: 'cs-oop-q3',
      question: 'class ReadOnlyList extends List { add(x) { throw new Error("unsupported"); } }. What is wrong with this design?',
      options: ['It violates Liskov Substitution: code holding a List can no longer rely on add() working', 'It violates Dependency Inversion: List is a concrete class', 'Nothing - throwing is the standard way to disable a method', 'It violates Open/Closed because List was extended'],
      correctAnswer: 0,
      explanation: 'A subtype that throws where the supertype succeeds adds an exception callers do not expect, so it cannot be substituted safely. Extending a class is exactly what OCP encourages; the problem is breaking the inherited contract.'
    },
    {
      id: 'cs-oop-q4',
      question: 'An interface Printer { print(); scan(); fax(); } forces BasicPrinter to implement scan() and fax() by throwing. Which principle and fix apply?',
      options: ['Open/Closed; add a canScan() flag', 'Single Responsibility; move fax() into a helper', 'Liskov Substitution; make BasicPrinter abstract', 'Interface Segregation; split into Printable, Scannable, and Faxable role interfaces'],
      correctAnswer: 3,
      explanation: 'Clients that only print are coupled to scan and fax, and implementers must stub methods they cannot support. Small role interfaces let BasicPrinter implement only Printable. A capability flag pushes the problem onto every caller.'
    },
    {
      id: 'cs-oop-q5',
      question: 'class ReportService { private db = new PostgresClient("prod-host"); }. Why is this hard to unit test, and what is the fix?',
      options: ['Postgres is slow; use SQLite instead', 'The service constructs its own dependency, so tests cannot substitute a fake; inject a Repository interface through the constructor', 'Private fields cannot be mocked; make db public', 'The hostname is hard-coded; read it from an environment variable'],
      correctAnswer: 1,
      explanation: 'This is a Dependency Inversion violation: the high-level service owns the choice of a low-level detail. Injecting an interface lets tests pass an in-memory fake. Changing the database engine or the config source does not remove the coupling.'
    },
    {
      id: 'cs-oop-q6',
      question: 'Which of these is NOT a valid reason to prefer composition over inheritance?',
      options: ['Behavior can be swapped per instance at runtime', 'It avoids fragile-base-class coupling to a parent\'s internals', 'Composition always executes faster than virtual dispatch', 'Behavior can be reused across classes that share no ancestor'],
      correctAnswer: 2,
      explanation: 'Composition is chosen for flexibility, decoupling, and testability, not speed. Delegating to a held object costs about the same as a virtual call; performance is not the argument.'
    },
    {
      id: 'cs-oop-q7',
      question: 'A UI toolkit must create matching widgets per platform so a Mac button is never paired with a Windows checkbox. Which pattern fits?',
      options: ['Abstract Factory', 'Singleton', 'Decorator', 'Template Method'],
      correctAnswer: 0,
      explanation: 'Abstract Factory produces a consistent family of related products; swapping MacUiFactory for WindowsUiFactory swaps every widget at once. A plain Factory Method makes one product and cannot enforce family consistency.'
    },
    {
      id: 'cs-oop-q8',
      question: 'A class has eight constructor parameters, five of them optional, plus a rule that timeout must be set whenever retries is set. Which pattern helps most?',
      options: ['Prototype', 'Facade', 'Abstract Factory', 'Builder'],
      correctAnswer: 3,
      explanation: 'Builder replaces telescoping constructors with named, optional steps and a build() that validates cross-field rules before producing an immutable object. The other patterns do not address construction with many optional parts.'
    },
    {
      id: 'cs-oop-q9',
      question: 'Why is "if (instance == null) instance = new Config();" unsafe as a lazy singleton in multithreaded code?',
      options: ['The null check is slower than a lock', 'Two threads can both observe null and each construct an instance, so callers end up with different objects', 'Static fields cannot be assigned from an instance method', 'The constructor may throw and leave instance null'],
      correctAnswer: 1,
      explanation: 'The check-then-act sequence is not atomic. Fixes include the initialization-on-demand holder idiom, an enum singleton, or double-checked locking with a volatile field - or simply constructing it once at startup and injecting it.'
    },
    {
      id: 'cs-oop-q10',
      question: 'A test passes when run alone but fails after another test that called Config.getInstance().set("mode", "offline"). What is the root cause?',
      options: ['The test runner is executing tests in parallel', 'The second test has a typo in the key', 'Singleton state persists between tests, so one test\'s mutation leaks into the next', 'getInstance() returns a new object each call'],
      correctAnswer: 2,
      explanation: 'A singleton is process-wide mutable state that outlives each test. This order-dependent failure is the classic argument for injecting configuration instead of reaching for a global.'
    },
    {
      id: 'cs-oop-q11',
      question: 'new LineNumberReader(new BufferedReader(new FileReader(path))) - each class implements Reader and adds behavior around the one it wraps. Which pattern is this?',
      options: ['Decorator', 'Adapter', 'Composite', 'Chain of Responsibility'],
      correctAnswer: 0,
      explanation: 'Each wrapper keeps the Reader interface and adds a responsibility (buffering, line counting), and they stack in any order. Adapter would change the interface; Composite treats one and many alike.'
    },
    {
      id: 'cs-oop-q12',
      question: 'A gRPC client stub exposes the same methods as the remote service but makes network calls under the hood. Which pattern is this?',
      options: ['Facade', 'Bridge', 'Adapter', 'Proxy'],
      correctAnswer: 3,
      explanation: 'A remote proxy stands in for the real object with the same interface and controls how calls reach it - here by serializing them over the network. A facade would simplify the interface; an adapter would change it.'
    },
    {
      id: 'cs-oop-q13',
      question: 'Your code expects Logger.info(msg), but a vendor library only offers oldLogger.writeLog(level: number, msg). What do you write?',
      options: ['A Decorator that adds levels to Logger', 'An Adapter that implements Logger and translates info(msg) into writeLog(2, msg)', 'A Proxy that lazily creates oldLogger', 'A Facade over both loggers'],
      correctAnswer: 1,
      explanation: 'The behavior already exists; only the interface shape is wrong. Adapter is the pattern whose sole job is that translation. Decorator and Proxy keep the same interface, which is not the problem here.'
    },
    {
      id: 'cs-oop-q14',
      question: 'A text editor renders a ten-million-character document; each character object stores its font, glyph outline, and position, and memory runs out. Which pattern fixes this?',
      options: ['Composite', 'Prototype', 'Flyweight', 'Object Pool'],
      correctAnswer: 2,
      explanation: 'Font and glyph outline are intrinsic state shared by every occurrence of a character; only the position is extrinsic. A flyweight factory stores each glyph once and clients pass the position in. Object Pool reuses objects over time, not memory across instances.'
    },
    {
      id: 'cs-oop-q15',
      question: 'folder.size() returns the total of all files and subfolders, and callers never check whether they hold a file or a folder. Which pattern is being used?',
      options: ['Iterator', 'Composite', 'Visitor', 'Template Method'],
      correctAnswer: 1,
      explanation: 'Leaf (file) and container (folder) share one interface, and the container implements the operation by recursing over its children. That uniform treatment of one and many is Composite.'
    },
    {
      id: 'cs-oop-q16',
      question: 'Order.cancel(), ship(), and refund() each contain a switch on this.status with different rules for Pending, Paid, and Shipped, and every new status touches every method. Which pattern cleans this up?',
      options: ['State: one class per status implementing the same interface, with the order delegating to its current state', 'Strategy: let the caller pass in a cancellation algorithm', 'Observer: notify each method when the status changes', 'Singleton: keep one status object per order type'],
      correctAnswer: 0,
      explanation: 'Behavior that varies by internal status and transitions on its own is the State pattern. Each status class handles cancel/ship/refund and decides the next state, so adding a status adds a class instead of editing every switch.'
    },
    {
      id: 'cs-oop-q17',
      question: 'A subject notifies observers with a plain for loop, calling each synchronously. The second of five observers throws. What happens to observers three to five?',
      options: ['They are notified after the exception is logged', 'They are notified on the next state change only', 'They are notified in reverse order', 'They are never notified, and the exception propagates into the subject\'s update code'],
      correctAnswer: 3,
      explanation: 'Synchronous notification means a throwing observer aborts the loop and hurts the subject. Robust implementations catch per observer, or dispatch asynchronously, so one bad subscriber cannot break the others.'
    },
    {
      id: 'cs-oop-q18',
      question: 'Which requirement is the strongest reason to use the Command pattern?',
      options: ['Selecting a sort algorithm at runtime', 'Implementing undo and redo in an editor', 'Making a legacy class fit a new interface', 'Traversing a tree without exposing its structure'],
      correctAnswer: 1,
      explanation: 'Command turns each action into an object with execute() and undo(), so a history stack gives undo/redo for free. Algorithm selection is Strategy, interface fitting is Adapter, and traversal is Iterator.'
    },
    {
      id: 'cs-oop-q19',
      question: 'In a parking-lot design interview, which of these is a red flag to the interviewer?',
      options: ['Asking whether the lot has multiple levels before drawing classes', 'Modeling Engine, Wheel, and Windshield classes for Vehicle', 'Using an enum for spot sizes instead of strings', 'Putting the pricing rule behind a strategy interface'],
      correctAnswer: 1,
      explanation: 'Modeling parts of a vehicle the lot never uses is over-engineering that wastes scarce interview time. Clarifying requirements, using enums, and isolating the most changeable rule are all things interviewers reward.'
    },
    {
      id: 'cs-oop-q20',
      question: 'Your parking-lot design must handle "pricing rules change every quarter" and "display boards must update the moment a spot frees up". Which pair of patterns fits?',
      options: ['Singleton and Facade', 'Builder and Adapter', 'Strategy and Observer', 'Template Method and Proxy'],
      correctAnswer: 2,
      explanation: 'A PricingStrategy isolates the rule most likely to change so it can be swapped without touching the lot. Observer lets display boards subscribe to spot changes without the lot knowing about them. Neither concern is about construction or interface translation.'
    }
  ]
};
