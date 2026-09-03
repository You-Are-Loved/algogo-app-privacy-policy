// iOS Development Categories - Comprehensive content for iOS interview prep
// Each subcategory has: learnContent, visualizations, flashcards, quizQuestions

import { Category, LearnSection, Flashcard, QuizQuestion, Visualization } from '../types';

// Re-export as iOSCategory for backwards compatibility
export type iOSCategory = Category;

// =============================================================================
// 1. SWIFT FUNDAMENTALS
// =============================================================================
const swiftFundamentals: iOSCategory = {
  id: 'ios-swift-fundamentals',
  name: 'Swift Fundamentals',
  slug: 'swift-fundamentals',
  description: 'Core Swift language features: optionals, protocols, generics, and memory management',
  icon: 'phone-portrait-outline',
  color: '#FA7343',
  colorDark: '#D55A2B',

  learnContent: [
    {
      id: 'ios-swift-1',
      title: 'Optionals and Unwrapping',
      content: `Optionals are Swift's way of handling the absence of a value. An optional either contains a value or contains nil.

**Declaration:**
- Optional: \`var name: String?\` - can be nil
- Non-optional: \`var name: String\` - must have a value

**Unwrapping Techniques:**
1. **Optional Binding (if let)**: Safely unwrap with a conditional
2. **Guard Statement**: Early exit if nil
3. **Nil Coalescing**: Provide default value with \`??\`
4. **Force Unwrapping**: Use \`!\` (dangerous, can crash)
5. **Optional Chaining**: Access properties with \`?.\`

**Implicitly Unwrapped Optionals:**
Declared with \`!\`, these are optionals that are automatically unwrapped. Use sparingly, mainly for IBOutlets.`,
      codeExample: `// Optional binding
var name: String? = "Swift"

if let unwrappedName = name {
    print("Hello, \\(unwrappedName)")
}

// Guard statement
func greet(_ name: String?) {
    guard let name = name else {
        print("No name provided")
        return
    }
    print("Hello, \\(name)")
}

// Nil coalescing
let displayName = name ?? "Anonymous"

// Optional chaining
struct Person {
    var address: Address?
}
struct Address {
    var city: String
}
let person = Person(address: nil)
let city = person.address?.city // nil`
    },
    {
      id: 'ios-swift-2',
      title: 'Protocols and Protocol-Oriented Programming',
      content: `Protocols define a blueprint of methods, properties, and requirements. Swift emphasizes Protocol-Oriented Programming (POP) over traditional inheritance.

**Key Concepts:**
- **Protocol Requirements**: Define what conforming types must implement
- **Protocol Extensions**: Add default implementations
- **Protocol Composition**: Combine protocols with \`&\`
- **Associated Types**: Generic placeholders in protocols

**Benefits of POP:**
1. Value types (structs/enums) can conform to protocols
2. Multiple protocol conformance
3. Default implementations reduce boilerplate
4. Better testability through protocol-based dependencies

**Common Protocols:**
- \`Equatable\`: Enable == comparison
- \`Hashable\`: Enable use in Sets/Dictionary keys
- \`Codable\`: Enable JSON encoding/decoding
- \`Comparable\`: Enable <, >, <=, >= comparison`,
      codeExample: `// Protocol definition
protocol Drawable {
    var color: String { get set }
    func draw()
}

// Protocol extension with default implementation
extension Drawable {
    func draw() {
        print("Drawing in \\(color)")
    }
}

// Conforming type
struct Circle: Drawable {
    var color: String
    var radius: Double
    // Uses default draw() implementation
}

// Protocol composition
protocol Named {
    var name: String { get }
}

func greet(entity: Drawable & Named) {
    print("Hello, \\(entity.name)")
    entity.draw()
}

// Associated types
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
}`
    },
    {
      title: 'Generics',
      content: `Generics enable you to write flexible, reusable functions and types that can work with any type, subject to requirements you define.

**Why Generics?**
- Avoid code duplication
- Type safety at compile time
- More expressive APIs

**Key Features:**
1. **Generic Functions**: Work with any type
2. **Generic Types**: Classes, structs, enums with type parameters
3. **Type Constraints**: Limit which types can be used
4. **Where Clauses**: Complex type requirements

**Common Uses:**
- Collections (Array<Element>, Dictionary<Key, Value>)
- Result type (Result<Success, Failure>)
- Optional (Optional<Wrapped>)`,
      codeExample: `// Generic function
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

// Generic type
struct Stack<Element> {
    private var items: [Element] = []

    mutating func push(_ item: Element) {
        items.append(item)
    }

    mutating func pop() -> Element? {
        return items.popLast()
    }
}

// Type constraints
func findIndex<T: Equatable>(of value: T, in array: [T]) -> Int? {
    for (index, item) in array.enumerated() {
        if item == value {
            return index
        }
    }
    return nil
}

// Where clause
func allItemsMatch<C1: Container, C2: Container>(
    _ c1: C1, _ c2: C2
) -> Bool where C1.Item == C2.Item, C1.Item: Equatable {
    if c1.count != c2.count { return false }
    // Compare items...
    return true
}`
    },
    {
      title: 'Memory Management (ARC)',
      content: `Swift uses Automatic Reference Counting (ARC) to track and manage memory. Understanding ARC is crucial for avoiding memory leaks.

**How ARC Works:**
- Each class instance has a reference count
- Count increases when a strong reference is created
- Count decreases when reference is removed
- Instance is deallocated when count reaches 0

**Reference Types:**
1. **Strong**: Default, increases reference count
2. **Weak**: Doesn't increase count, becomes nil when deallocated
3. **Unowned**: Doesn't increase count, crashes if accessed after deallocation

**Retain Cycles:**
Two objects holding strong references to each other prevent deallocation. Solve with:
- \`weak\` for optional references (delegates)
- \`unowned\` for non-optional references that outlive the referencer

**Closures and Memory:**
Closures can capture \`self\`, creating retain cycles. Use capture lists: \`[weak self]\` or \`[unowned self]\``,
      codeExample: `// Retain cycle example
class Person {
    var name: String
    var apartment: Apartment?

    init(name: String) { self.name = name }
    deinit { print("\\(name) deinitialized") }
}

class Apartment {
    var number: Int
    weak var tenant: Person? // weak to break cycle

    init(number: Int) { self.number = number }
    deinit { print("Apartment \\(number) deinitialized") }
}

// Closure capture list
class ViewController {
    var name = "Main"

    func setupHandler() {
        // Without [weak self], this creates a retain cycle
        someAsyncOperation { [weak self] result in
            guard let self = self else { return }
            print(self.name)
        }
    }
}

// Unowned example - when you're sure self will exist
class Customer {
    let name: String
    var card: CreditCard?

    init(name: String) { self.name = name }
}

class CreditCard {
    let number: Int
    unowned let customer: Customer // Customer always outlives card

    init(number: Int, customer: Customer) {
        self.number = number
        self.customer = customer
    }
}`
    },
    {
      title: 'Value vs Reference Types',
      content: `Swift distinguishes between value types (copied) and reference types (shared). This is fundamental to Swift's design.

**Value Types (Structs, Enums, Tuples):**
- Copied when assigned or passed
- Each copy is independent
- Stored on stack (generally)
- Thread-safe by default

**Reference Types (Classes):**
- Share the same instance
- Changes affect all references
- Stored on heap
- Need synchronization for thread safety

**When to Use What:**
- **Struct**: Default choice, immutable data, no inheritance needed
- **Class**: Need inheritance, reference semantics, or Objective-C interop

**Copy-on-Write:**
Swift's standard library uses copy-on-write for efficiency. Large value types like Array only copy when modified.`,
      codeExample: `// Value type (struct)
struct Point {
    var x: Double
    var y: Double
}

var p1 = Point(x: 0, y: 0)
var p2 = p1  // p2 is a copy
p2.x = 10
print(p1.x)  // 0 - p1 unchanged

// Reference type (class)
class PointClass {
    var x: Double
    var y: Double

    init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}

var pc1 = PointClass(x: 0, y: 0)
var pc2 = pc1  // pc2 points to same instance
pc2.x = 10
print(pc1.x)  // 10 - pc1 changed!

// Mutating methods for value types
struct Counter {
    var count = 0

    mutating func increment() {
        count += 1
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'ARC Reference Counting',
      description: 'How ARC manages memory with reference counts',
      nodes: [
        { id: 'heap', label: 'Heap\nMemory', x: 100, y: 50, type: 'info' },
        { id: 'obj', label: 'Object\ncount: 2', x: 250, y: 50, type: 'primary' },
        { id: 'ref1', label: 'Ref 1\nstrong', x: 100, y: 150, type: 'secondary' },
        { id: 'ref2', label: 'Ref 2\nstrong', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'ref1', to: 'obj' },
        { from: 'ref2', to: 'obj' }
      ]
    },
    {
      title: 'Retain Cycle',
      description: 'Two objects strongly referencing each other prevents deallocation',
      nodes: [
        { id: 'person', label: 'Person\nstrong ref', x: 100, y: 50, type: 'warning' },
        { id: 'apt', label: 'Apartment\nstrong ref', x: 250, y: 50, type: 'warning' },
        { id: 'leak', label: 'Memory\nLeak!', x: 100, y: 150, type: 'error' },
        { id: 'fix', label: 'Use weak\nor unowned', x: 250, y: 150, type: 'success' }
      ],
      edges: [
        { from: 'person', to: 'apt' },
        { from: 'apt', to: 'person' },
        { from: 'leak', to: 'fix' }
      ]
    }
  ],

  flashcards: [
    { id: 'sf1', front: 'What is the difference between if let and guard let?', back: 'if let creates a new scope for the unwrapped value. guard let requires an early exit (return, throw, etc.) if nil, and the unwrapped value is available in the rest of the function.' },
    { id: 'sf2', front: 'What is the nil coalescing operator?', back: 'The ?? operator provides a default value when an optional is nil. Example: let name = optionalName ?? "Unknown"' },
    { id: 'sf3', front: 'What is a protocol extension?', back: 'A protocol extension adds default implementations to a protocol. Types conforming to the protocol get these implementations automatically unless they provide their own.' },
    { id: 'sf4', front: 'What is an associated type in a protocol?', back: 'An associated type is a placeholder type used in a protocol. The conforming type specifies the actual type. Example: associatedtype Item in a Container protocol.' },
    { id: 'sf5', front: 'What is a generic type constraint?', back: 'A type constraint limits which types can be used with a generic. Example: func sort<T: Comparable>(_ array: [T]) requires T to conform to Comparable.' },
    { id: 'sf6', front: 'What is ARC?', back: 'Automatic Reference Counting. Swift automatically tracks how many references point to a class instance and deallocates it when the count reaches zero.' },
    { id: 'sf7', front: 'What is a retain cycle?', back: 'A retain cycle occurs when two or more objects hold strong references to each other, preventing ARC from deallocating them. Solved with weak or unowned references.' },
    { id: 'sf8', front: 'When should you use weak vs unowned?', back: 'Use weak when the reference can become nil (optionals, delegates). Use unowned when you\'re certain the reference will never be nil while in use (parent-child relationships).' },
    { id: 'sf9', front: 'What is [weak self] in a closure?', back: 'A capture list that creates a weak reference to self, preventing retain cycles when a closure is stored by self. Must be unwrapped before use.' },
    { id: 'sf10', front: 'What is the difference between struct and class?', back: 'Structs are value types (copied), classes are reference types (shared). Structs can\'t inherit, have automatic memberwise init. Classes support inheritance and deinit.' },
    { id: 'sf11', front: 'What is copy-on-write?', back: 'An optimization where value types share storage until one is modified, then a copy is made. Used by Swift collections like Array and Dictionary.' },
    { id: 'sf12', front: 'What does mutating mean in a struct method?', back: 'The mutating keyword allows a struct method to modify the instance\'s properties. Required because structs are value types.' },
    { id: 'sf13', front: 'What is an implicitly unwrapped optional?', back: 'An optional declared with ! that is automatically unwrapped when accessed. Crashes if nil. Used for values that start nil but are set before use (IBOutlets).' },
    { id: 'sf14', front: 'What is optional chaining?', back: 'Using ?. to access properties/methods on an optional. Returns nil if any part of the chain is nil instead of crashing. Example: person?.address?.city' },
    { id: 'sf15', front: 'What is the @escaping attribute?', back: 'Marks a closure parameter that will be stored or called after the function returns. Required for async callbacks, stored closures, etc.' },
    { id: 'sf16', front: 'What does `final` do on a class or method?', back: 'Forbids further subclassing or overriding. Lets the compiler use static dispatch instead of dynamic dispatch, often a small performance win.' },
    { id: 'sf17', front: 'What is an `inout` parameter?', back: 'Lets a function modify its caller\'s variable in place. The caller passes it with &, e.g. swap(&a, &b). Conceptually a value copied in then copied back out.' },
    { id: 'sf18', front: 'When do you need a `where` clause on a generic?', back: 'When you want to constrain associated types or combine multiple constraints. Example: `extension Array where Element: Numeric` only applies to arrays of numbers.' },
    { id: 'sf19', front: 'What is type erasure?', back: 'Hiding a protocol with associated types behind a concrete wrapper so you can use it as a value type. Standard wrappers include AnyView, AnyPublisher, AnySequence.' },
    { id: 'sf20', front: 'What is Result<Success, Failure>?', back: 'An enum with .success(value) and .failure(error) cases. Lets you store an outcome as a value, pass it across boundaries, and `switch` on it cleanly.' },
    { id: 'sf21', front: 'What does `defer` do?', back: 'Schedules a block to run when the enclosing scope exits, regardless of how (return, throw, break). Useful for paired setup/teardown like locking, file handles, or cleanup.' },
    { id: 'sf22', front: 'What is a KeyPath?', back: 'A reference to a property\'s location on a type, written `\\Type.property`. Lets you read or write a property generically — used by KVO, SwiftUI, sort(by:), and reduce(into:).' },
    { id: 'sf23', front: 'What\'s the difference between `Self` and `self`?', back: '`self` (lowercase) is the current instance. `Self` (capital) is the type of the current instance — handy in protocol requirements that need to refer to the conforming type.' },
    { id: 'sf24', front: 'What happens if you access an unowned reference after its target is deallocated?', back: 'The program traps (crashes) — unowned is non-optional and has no nil check. A weak reference in the same situation is zeroed out to nil. Choose unowned only when the referenced object provably outlives the reference.' },
    { id: 'sf25', front: 'What does `lazy var` do and when is it useful?', back: 'Defers initialization until the property is first read. Must be a var. Useful for expensive setup you may never need, and because its initializer can reference `self` (it runs after init has completed).' },
    { id: 'sf26', front: 'What is the difference between `static` and `class` members?', back: 'Both are type-level members. `static` members can\'t be overridden by subclasses; `class` members (methods and computed properties on classes only) can be. Structs and enums only get `static`.' },
    { id: 'sf27', front: 'What happens when you copy a struct that contains a class reference?', back: 'The struct is copied but the reference inside it is shared — both copies point at the same object. Mutating that object through one copy is visible through the other. Value semantics only go as deep as the value-typed fields.' },
    { id: 'sf28', front: 'What is the difference between `==` and `===`?', back: '`==` is value equality defined by Equatable — two instances with the same contents. `===` is identity — the two references point to the exact same class instance. Only reference types support `===`.' },
    { id: 'sf29', front: 'What is a property wrapper?', back: 'A type marked @propertyWrapper with a `wrappedValue` that adds behavior to a stored property (validation, persistence, observation). Applied with @Name on the property; an optional `projectedValue` is exposed through the `$` prefix — this is what powers @State and @Published.' },
    { id: 'sf30', front: 'What is the difference between `try`, `try?`, and `try!`?', back: '`try` propagates the error to a `throws` context or do/catch. `try?` converts a thrown error into nil and gives you an optional. `try!` asserts the call can\'t fail and crashes if it does — only for programmer-controlled invariants.' }
  ],

  quizQuestions: [
    {
      id: 'sfq1',
      question: 'Which unwrapping technique provides a default value when an optional is nil?',
      options: ['Optional binding (if let)', 'Guard statement', 'Nil coalescing (??)', 'Force unwrapping (!)'],
      correctAnswer: 2,
      explanation: 'The nil coalescing operator ?? provides a default value when the optional is nil. Example: name ?? "Unknown"'
    },
    {
      id: 'sfq2',
      question: 'What is the primary advantage of Protocol-Oriented Programming?',
      options: ['Faster runtime performance', 'Value types can conform to protocols', 'Automatic memory management', 'Built-in multithreading'],
      correctAnswer: 1,
      explanation: 'POP allows value types (structs, enums) to share behavior through protocols, unlike class inheritance which only works with reference types.'
    },
    {
      id: 'sfq3',
      question: 'Which reference type should you use for a delegate property?',
      options: ['strong', 'weak', 'unowned', 'lazy'],
      correctAnswer: 1,
      explanation: 'Delegates should be weak to prevent retain cycles. The delegate (often a view controller) shouldn\'t be kept alive by the delegating object.'
    },
    {
      id: 'sfq4',
      question: 'What happens when you modify a struct stored in a variable?',
      options: ['The original struct is modified', 'A new copy is created and modified', 'A compile error occurs', 'The change is ignored'],
      correctAnswer: 1,
      explanation: 'Structs are value types. When you modify a struct, Swift creates a copy with the changes (copy-on-write optimization may delay this).'
    },
    {
      id: 'sfq5',
      question: 'What is the purpose of a capture list in a closure?',
      options: ['To define parameters', 'To specify return type', 'To control how values are captured', 'To enable async execution'],
      correctAnswer: 2,
      explanation: 'Capture lists like [weak self] or [unowned self] control how values are captured by the closure, preventing retain cycles.'
    },
    {
      id: 'sfq6',
      question: 'Which keyword is required to modify a property inside a struct method?',
      options: ['mutable', 'var', 'mutating', 'inout'],
      correctAnswer: 2,
      explanation: 'The mutating keyword is required for struct methods that modify the instance\'s properties because structs are value types.'
    },
    {
      id: 'sfq7',
      question: 'What does the where clause do in generics?',
      options: ['Filters array elements', 'Adds type constraints', 'Handles errors', 'Defines protocols'],
      correctAnswer: 1,
      explanation: 'The where clause adds complex type constraints to generics, like requiring associated types to match or conform to protocols.'
    },
    {
      id: 'sfq8',
      question: 'When is a class instance deallocated by ARC?',
      options: ['When the app terminates', 'When marked for deletion', 'When reference count reaches zero', 'After a garbage collection cycle'],
      correctAnswer: 2,
      explanation: 'ARC deallocates a class instance when its reference count reaches zero, meaning no strong references point to it.'
    },
    {
      id: 'sfq9',
      question: 'What protocol should a type conform to for use as a Dictionary key?',
      options: ['Equatable', 'Comparable', 'Hashable', 'Codable'],
      correctAnswer: 2,
      explanation: 'Dictionary keys must be Hashable (which includes Equatable). This allows efficient lookup using hash values.'
    },
    {
      id: 'sfq10',
      question: 'What is an associated type in a protocol?',
      options: ['A default implementation', 'A protocol extension', 'A placeholder type', 'A type alias'],
      correctAnswer: 2,
      explanation: 'An associated type is a placeholder type in a protocol. The conforming type specifies what actual type to use.'
    },
    {
      id: 'sfq11',
      question: 'class Person { var pet: Pet? }; class Pet { var owner: Person? } — you link a Person and Pet to each other, then set both local variables to nil. What happens?',
      options: ['Both objects are deallocated', 'Neither is deallocated — they hold each other alive', 'The compiler rejects the assignment', 'Only Pet is deallocated'],
      correctAnswer: 1,
      explanation: 'Each object holds a strong reference to the other, so both reference counts stay at 1 after the locals go away. This is a retain cycle; make one side weak (typically `weak var owner`).'
    },
    {
      id: 'sfq12',
      question: 'What happens when you read an unowned reference whose target has already been deallocated?',
      options: ['Runtime crash', 'It returns nil', 'A compile-time error', 'The object is re-created'],
      correctAnswer: 0,
      explanation: 'unowned skips the nil check that weak performs. Accessing a dangling unowned reference traps at runtime. If nil is a legitimate possibility, use weak instead.'
    },
    {
      id: 'sfq13',
      question: 'struct Wrapper { let box: Box }; class Box { var value = 0 }. var a = Wrapper(box: Box()); var b = a; b.box.value = 5. What is a.box.value?',
      options: ['0', 'Compile error: box is a let', '5', 'Undefined'],
      correctAnswer: 2,
      explanation: 'Copying the struct copies the reference, not the object. Both wrappers share one Box, so the mutation through b is visible through a. The `let` only stops you reassigning `box` itself.'
    },
    {
      id: 'sfq14',
      question: 'Which statement about a `lazy` stored property is true?',
      options: ['It must be declared with let', 'It is initialized on first access and must be a var', 'Its initializer cannot reference self', 'It is automatically thread-safe'],
      correctAnswer: 1,
      explanation: 'lazy defers initialization until first read, which is why it must be a var. Because it runs after init completes it can reference self. It is not synchronized — two threads racing on first access is a bug.'
    },
    {
      id: 'sfq15',
      question: 'What is the difference between Any and AnyObject?',
      options: ['They are interchangeable', 'AnyObject includes value types, Any does not', 'Any is only for functions', 'Any covers every type; AnyObject only class instances'],
      correctAnswer: 3,
      explanation: 'Any can hold structs, enums, functions, optionals, and class instances. AnyObject is restricted to instances of classes (it is the protocol every class implicitly conforms to).'
    },
    {
      id: 'sfq16',
      question: 'let n = try? Int(text, radix: 16) — hypothetically, if the call throws, what is n?',
      options: ['The program crashes', 'The error is rethrown to the caller', 'A default value of 0', 'nil'],
      correctAnswer: 3,
      explanation: 'try? swallows the error and produces an optional: the value on success, nil on failure. try! would crash and plain try would propagate the error.'
    },
    {
      id: 'sfq17',
      question: 'Which type-level member can a subclass override?',
      options: ['static func', 'final class func', 'class func', 'A method on a struct'],
      correctAnswer: 2,
      explanation: 'class members participate in dynamic dispatch and may be overridden. static members are implicitly final, and final class explicitly forbids overriding. Structs have no inheritance at all.'
    },
    {
      id: 'sfq18',
      question: 'What does the === operator check?',
      options: ['That two references point to the same instance', 'That two values are Equatable-equal', 'That two values have the same type', 'That two values have the same hash'],
      correctAnswer: 0,
      explanation: '=== is identity, only meaningful for reference types. == is value equality through Equatable — two distinct instances can be == without being ===.'
    },
    {
      id: 'sfq19',
      question: 'var a = [1, 2, 3]; var b = a; b.append(4). What is a.count?',
      options: ['3', '4', 'Compile error', 'It depends on optimization level'],
      correctAnswer: 0,
      explanation: 'Arrays have value semantics. b shares storage with a until it is mutated, at which point copy-on-write gives b its own buffer. a is untouched and still has 3 elements.'
    },
    {
      id: 'sfq20',
      question: 'What is the minimum requirement for a type marked @propertyWrapper?',
      options: ['An init(wrappedValue:) initializer', 'A projectedValue property', 'A wrappedValue property', 'Conformance to a Wrapper protocol'],
      correctAnswer: 2,
      explanation: 'The compiler only requires a `wrappedValue`. init(wrappedValue:) is needed if you want `@Wrapper var x = 1` syntax, and projectedValue is optional and exposed via the $ prefix.'
    }
  ]
};

// =============================================================================
// 2. UIKIT ESSENTIALS
// =============================================================================
const uikitEssentials: iOSCategory = {
  id: 'ios-uikit',
  name: 'UIKit Essentials',
  slug: 'uikit-essentials',
  description: 'View controllers, lifecycle, Auto Layout, and navigation patterns',
  icon: 'layers-outline',
  color: '#007AFF',
  colorDark: '#0056B3',

  learnContent: [
    {
      title: 'View Controller Lifecycle',
      content: `Understanding the view controller lifecycle is essential for proper setup, cleanup, and responding to state changes.

**Lifecycle Methods (in order):**

1. **init**: Object created
2. **loadView**: Create view hierarchy (override only if not using storyboards)
3. **viewDidLoad**: View loaded into memory - setup that only happens once
4. **viewWillAppear**: About to become visible - refresh data, start animations
5. **viewDidAppear**: Now visible - start expensive operations, analytics
6. **viewWillDisappear**: About to be hidden - pause operations, save state
7. **viewDidDisappear**: No longer visible - stop operations, release resources
8. **deinit**: Being deallocated - cleanup

**Best Practices:**
- Setup UI in viewDidLoad (called once)
- Refresh data in viewWillAppear (called each time)
- Start/stop operations in appear/disappear pairs
- Don't assume view geometry is final until viewDidLayoutSubviews`,
      codeExample: `class MyViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Called once when view loads
        setupUI()
        setupConstraints()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Called every time view is about to appear
        refreshData()
        navigationController?.setNavigationBarHidden(false, animated: animated)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // View is now visible
        startAnimations()
        trackScreenView()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // About to be hidden
        pauseVideo()
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // No longer visible
        stopExpensiveOperations()
    }

    deinit {
        // Cleanup
        NotificationCenter.default.removeObserver(self)
    }
}`
    },
    {
      title: 'Auto Layout',
      content: `Auto Layout is a constraint-based system for creating adaptive user interfaces that respond to different screen sizes and orientations.

**Core Concepts:**
- **Constraints**: Rules defining view positions and sizes
- **Intrinsic Content Size**: Natural size based on content (labels, buttons)
- **Content Hugging**: Resistance to growing larger than intrinsic size
- **Compression Resistance**: Resistance to shrinking smaller than intrinsic size

**Constraint Priorities:**
- Required: 1000 (must be satisfied)
- High: 750 (default for content hugging)
- Low: 250 (default for compression resistance)

**Common Patterns:**
1. Pin to edges with safe area
2. Center in container
3. Stack views for linear layouts
4. Equal widths/heights
5. Aspect ratio constraints`,
      codeExample: `// Programmatic constraints
let label = UILabel()
label.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(label)

NSLayoutConstraint.activate([
    // Pin to safe area edges
    label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

    // Height constraint with priority
    label.heightAnchor.constraint(greaterThanOrEqualToConstant: 44)
])

// Content hugging and compression resistance
label.setContentHuggingPriority(.defaultHigh, for: .vertical)
label.setContentCompressionResistancePriority(.required, for: .vertical)

// Using anchors with multiplier (aspect ratio)
imageView.heightAnchor.constraint(
    equalTo: imageView.widthAnchor,
    multiplier: 9.0/16.0
).isActive = true

// Stack views for layout
let stackView = UIStackView(arrangedSubviews: [label1, label2, label3])
stackView.axis = .vertical
stackView.spacing = 8
stackView.distribution = .fillEqually`
    },
    {
      title: 'Navigation Patterns',
      content: `iOS provides several navigation patterns for moving between screens.

**UINavigationController:**
- Manages a stack of view controllers
- Push/pop for hierarchical navigation
- Built-in back button and gesture

**UITabBarController:**
- Parallel screens at the same level
- User can switch between tabs
- Each tab can have its own navigation stack

**Modal Presentation:**
- Present over current context
- Different styles: fullScreen, pageSheet, formSheet
- Dismissal via button or swipe

**Container View Controllers:**
- UISplitViewController: Primary-detail
- UIPageViewController: Swiping pages

**Coordinator Pattern:**
For complex navigation, extract logic into coordinators.`,
      codeExample: `// Navigation Controller - Push/Pop
class ListViewController: UIViewController {
    func showDetail(item: Item) {
        let detailVC = DetailViewController(item: item)
        // Push adds to the stack; back button pops it off
        navigationController?.pushViewController(detailVC, animated: true)
    }
}

// Tab Bar Controller setup
class MainTabBarController: UITabBarController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Each tab wraps its root VC in its own nav stack
        let homeNav = UINavigationController(rootViewController: HomeViewController())
        homeNav.tabBarItem = UITabBarItem(title: "Home", image: UIImage(systemName: "house"), tag: 0)

        let profileNav = UINavigationController(rootViewController: ProfileViewController())
        profileNav.tabBarItem = UITabBarItem(title: "Profile", image: UIImage(systemName: "person"), tag: 1)

        viewControllers = [homeNav, profileNav]
    }
}

// Modal presentation
func showSettings() {
    let settingsVC = SettingsViewController()
    settingsVC.modalPresentationStyle = .pageSheet

    if let sheet = settingsVC.sheetPresentationController {
        // Detents: heights the sheet can rest at (half/full)
        sheet.detents = [.medium(), .large()]
        sheet.prefersGrabberVisible = true // drag handle at top
    }

    present(settingsVC, animated: true)
}

// Dismiss modal
@objc func dismissTapped() {
    dismiss(animated: true)
}`
    },
    {
      title: 'Table Views and Collection Views',
      content: `UITableView and UICollectionView are fundamental for displaying lists and grids of data.

**Data Source Pattern:**
Both use delegate and data source protocols:
- numberOfSections
- numberOfItemsInSection
- cellForItemAt

**Modern Approach - Diffable Data Source:**
iOS 13+ provides type-safe, performant data management.

**Cell Reuse:**
Cells are recycled for memory efficiency. Dequeue and configure, never create new cells in cellForRow.

**Collection View Layouts:**
- UICollectionViewFlowLayout: Grid/list
- UICollectionViewCompositionalLayout: Complex layouts
- Custom UICollectionViewLayout

**Performance Tips:**
- Register cells and reuse identifiers
- Prefetch data for smooth scrolling
- Avoid layout in cellForRow`,
      codeExample: `// Modern Diffable Data Source approach
// Sections and items must be Hashable so diffing works
enum Section: Hashable {
    case main
}

struct Item: Hashable {
    let id: UUID
    let title: String
}

class ListViewController: UIViewController {
    var collectionView: UICollectionView!
    var dataSource: UICollectionViewDiffableDataSource<Section, Item>!

    override func viewDidLoad() {
        super.viewDidLoad()
        configureCollectionView()
        configureDataSource()
    }

    func configureCollectionView() {
        // List layout gives table-view style rows for free
        let config = UICollectionLayoutListConfiguration(appearance: .insetGrouped)
        let layout = UICollectionViewCompositionalLayout.list(using: config)
        collectionView = UICollectionView(frame: view.bounds, collectionViewLayout: layout)
    }

    func configureDataSource() {
        // Registration: how to configure a cell for an Item
        let cellRegistration = UICollectionView.CellRegistration<UICollectionViewListCell, Item> {
            cell, indexPath, item in
            var content = cell.defaultContentConfiguration()
            content.text = item.title
            cell.contentConfiguration = content
        }

        // Data source dequeues reused cells via the registration
        dataSource = UICollectionViewDiffableDataSource<Section, Item>(
            collectionView: collectionView
        ) { collectionView, indexPath, item in
            return collectionView.dequeueConfiguredReusableCell(
                using: cellRegistration, for: indexPath, item: item
            )
        }
    }

    func applySnapshot(items: [Item]) {
        // Snapshot = full desired state; diffing animates changes
        var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
        snapshot.appendSections([.main])
        snapshot.appendItems(items)
        dataSource.apply(snapshot, animatingDifferences: true)
    }
}`
    },
    {
      title: 'Delegation Pattern',
      content: `Delegation is a fundamental iOS design pattern where one object delegates responsibility to another.

**How It Works:**
1. Define a protocol with required methods
2. Delegating object has a weak delegate property
3. Delegate conforms to protocol and implements methods
4. Delegating object calls delegate methods

**Why Weak Reference?**
Prevents retain cycles. The delegate (often a view controller) typically owns the delegating object.

**Common Examples:**
- UITableViewDelegate/DataSource
- UITextFieldDelegate
- CLLocationManagerDelegate
- Custom delegation for communication between objects`,
      codeExample: `// Define protocol
protocol SettingsViewControllerDelegate: AnyObject {
    func settingsDidUpdate(_ settings: Settings)
    func settingsDidCancel()
}

// Delegating object
class SettingsViewController: UIViewController {
    weak var delegate: SettingsViewControllerDelegate?

    @objc func saveButtonTapped() {
        let settings = createSettings()
        delegate?.settingsDidUpdate(settings)
        dismiss(animated: true)
    }

    @objc func cancelButtonTapped() {
        delegate?.settingsDidCancel()
        dismiss(animated: true)
    }
}

// Delegate implementation
class MainViewController: UIViewController, SettingsViewControllerDelegate {

    func showSettings() {
        let settingsVC = SettingsViewController()
        settingsVC.delegate = self // Set ourselves as delegate
        present(settingsVC, animated: true)
    }

    // MARK: - SettingsViewControllerDelegate

    func settingsDidUpdate(_ settings: Settings) {
        applySettings(settings)
    }

    func settingsDidCancel() {
        // Handle cancellation
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'View Controller Lifecycle',
      description: 'Key lifecycle method calls',
      nodes: [
        { id: 'viewDidLoad', label: 'viewDidLoad', x: 100, y: 50, type: 'primary' },
        { id: 'viewWillAppear', label: 'willAppear', x: 250, y: 50, type: 'primary' },
        { id: 'viewDidAppear', label: 'didAppear', x: 100, y: 150, type: 'success' },
        { id: 'viewWillDisappear', label: 'willDisappear', x: 250, y: 150, type: 'warning' }
      ],
      edges: [
        { from: 'viewDidLoad', to: 'viewWillAppear' },
        { from: 'viewWillAppear', to: 'viewDidAppear' },
        { from: 'viewDidAppear', to: 'viewWillDisappear' }
      ]
    },
    {
      title: 'Navigation Stack',
      description: 'UINavigationController manages a stack of view controllers',
      nodes: [
        { id: 'nav', label: 'NavController\nmanages', x: 100, y: 50, type: 'primary' },
        { id: 'stack', label: 'VC Stack\narray', x: 250, y: 50, type: 'info' },
        { id: 'push', label: 'Push VC\nadd to stack', x: 100, y: 150, type: 'secondary' },
        { id: 'pop', label: 'Pop VC\nremove top', x: 250, y: 150, type: 'warning' }
      ],
      edges: [
        { from: 'nav', to: 'stack' },
        { from: 'nav', to: 'push' },
        { from: 'stack', to: 'pop' }
      ]
    }
  ],

  flashcards: [
    { id: 'uk1', front: 'What is the first lifecycle method where the view is available?', back: 'viewDidLoad. This is called after loadView and the view hierarchy exists. Use it for one-time setup.' },
    { id: 'uk2', front: 'When should you refresh data in a view controller?', back: 'In viewWillAppear, because it\'s called every time the view is about to appear, not just the first time.' },
    { id: 'uk3', front: 'What does translatesAutoresizingMaskIntoConstraints = false do?', back: 'It tells the system not to create automatic constraints from autoresizing mask, which is required for programmatic Auto Layout.' },
    { id: 'uk4', front: 'What is content hugging priority?', back: 'Resistance to growing larger than intrinsic content size. Higher priority = less likely to stretch. Default is 250.' },
    { id: 'uk5', front: 'What is compression resistance priority?', back: 'Resistance to shrinking smaller than intrinsic content size. Higher priority = less likely to be compressed. Default is 750.' },
    { id: 'uk6', front: 'What is the safe area?', back: 'The portion of the screen not covered by navigation bars, tab bars, home indicator, or notch. Use safeAreaLayoutGuide for constraints.' },
    { id: 'uk7', front: 'Why should the delegate property be weak?', back: 'To prevent retain cycles. The delegate typically owns the delegating object, so a strong reference would create a cycle.' },
    { id: 'uk8', front: 'What is a Diffable Data Source?', back: 'iOS 13+ feature for type-safe table/collection view updates. Uses snapshots for automatic animations and no more index path errors.' },
    { id: 'uk9', front: 'What is cell reuse?', back: 'Cells are recycled when scrolling to save memory. You dequeue a reusable cell and configure it, never creating new cells in cellForRow.' },
    { id: 'uk10', front: 'What is UICollectionViewCompositionalLayout?', back: 'iOS 13+ flexible layout system using sections, groups, and items. Enables complex layouts like App Store cards.' },
    { id: 'uk11', front: 'What is the difference between push and present?', back: 'Push adds to navigation stack (with back button). Present shows modally over current content (with dismiss).' },
    { id: 'uk12', front: 'What is a container view controller?', back: 'A view controller that manages child view controllers. Examples: UINavigationController, UITabBarController, UISplitViewController.' },
    { id: 'uk13', front: 'When is viewDidLayoutSubviews called?', back: 'After the view controller\'s view has laid out its subviews. Frame values are accurate here, unlike viewDidLoad.' },
    { id: 'uk14', front: 'What is UIStackView used for?', back: 'Simplified Auto Layout for linear arrangements. It manages constraints for arranged subviews based on axis, distribution, and spacing.' },
    { id: 'uk15', front: 'What happens in deinit?', back: 'Called when the view controller is being deallocated. Use for cleanup like removing observers or invalidating timers.' },
    { id: 'uk16', front: 'What is intrinsicContentSize?', back: 'A view\'s natural size based on its content — a label\'s text, an image\'s pixels. Auto Layout falls back to it when constraints don\'t fully specify width or height.' },
    { id: 'uk17', front: 'What is the difference between safeAreaLayoutGuide and layoutMarginsGuide?', back: 'The safe area is what system UI obscures — status bar, notch, home indicator, bars. Layout margins are the view\'s own content inset (8pt by default, 16–20pt on a view controller\'s root view) and, because insetsLayoutMarginsFromSafeArea defaults to true, they sit inside the safe area. Pin edge-to-edge chrome to the safe area and text/content to the margins.' },
    { id: 'uk18', front: 'How do you set up a UIScrollView with Auto Layout?', back: 'Pin the content view\'s four edges to the scroll view\'s contentLayoutGuide — that is what defines contentSize. Then constrain the content view\'s width to the frameLayoutGuide for vertical-only scrolling. If the content has no unambiguous height (a broken top-to-bottom constraint chain), the scroll view simply won\'t scroll.' },
    { id: 'uk19', front: 'What\'s the difference between frame and bounds?', back: 'frame is the view\'s rect in its superview\'s coordinate space. bounds is in its own coordinate space; bounds.origin scrolls the content. Rotation only affects frame.' },
    { id: 'uk20', front: 'How do you implement view-controller containment?', back: 'addChild(_:), addSubview, then call didMove(toParent:) on the child. Reverse with willMove(toParent: nil), removeFromSuperview, removeFromParent. Lets one VC host another.' },
    { id: 'uk21', front: 'How do you get self-sizing UITableView cells?', back: 'Set rowHeight = UITableView.automaticDimension and a non-zero estimatedRowHeight, then constrain the cell\'s content to all four edges of contentView so Auto Layout can derive the height from the content. Any gap in the vertical constraint chain silently gives you the estimated height instead.' },
    { id: 'uk22', front: 'When would you choose UICollectionView over UITableView?', back: 'Anything beyond a single vertical column — grids, horizontal scrollers, self-sizing items in a flow, custom layouts. UICollectionViewCompositionalLayout makes this much easier.' },
    { id: 'uk23', front: 'What is the responder chain?', back: 'The ordered sequence of objects that get a chance to handle a UI event. It starts at the first responder and walks up: responder → next responder → view → superview → window → app.' },
    { id: 'uk24', front: 'What is the order of lifecycle callbacks when a view controller is first shown?', back: 'loadView → viewDidLoad → viewWillAppear → viewWillLayoutSubviews → viewDidLayoutSubviews → viewDidAppear. viewDidLoad runs once per instance; the appear/layout callbacks repeat every time the view is shown or resized.' },
    { id: 'uk25', front: 'Why would you give a constraint priority 999 instead of the required 1000?', back: 'A required constraint that can\'t be satisfied triggers "Unable to simultaneously satisfy constraints" and Auto Layout breaks one at random. At 999 the constraint is optional — it holds whenever possible but yields quietly during transient states like cell sizing or rotation.' },
    { id: 'uk26', front: 'How does UIKit decide which view receives a touch?', back: 'Hit testing: starting at the window, hitTest(_:with:) calls point(inside:with:) and recurses into subviews from front to back, returning the deepest view that contains the point. Hidden views, alpha below 0.01, and isUserInteractionEnabled == false are skipped.' },
    { id: 'uk27', front: 'What is prepareForReuse() for?', back: 'Resetting a cell\'s state before it is dequeued again — cancel in-flight image loads, clear text, reset selection. It is not the place to configure new content; do that in cellForRowAt.' },
    { id: 'uk28', front: 'What is the difference between setNeedsLayout() and layoutIfNeeded()?', back: 'setNeedsLayout marks the view dirty and defers layout to the next run-loop pass (cheap, coalesced). layoutIfNeeded forces a synchronous layout now. Call layoutIfNeeded inside UIView.animate to animate constraint changes.' },
    { id: 'uk29', front: 'How do UIView and CALayer relate?', back: 'Every UIView owns a backing CALayer. The view handles touch, Auto Layout, and responder duties; the layer does the drawing — cornerRadius, borders, shadows, masks, and Core Animation. Appearance tweaks that aren\'t on UIView usually live on view.layer.' },
    { id: 'uk30', front: 'How do you debug an "Unable to simultaneously satisfy constraints" warning?', back: 'Read the log to see which constraint was broken, give constraints `identifier`s so they are readable, set a symbolic breakpoint on UIViewAlertForUnsatisfiableConstraints, and inspect in the view debugger. Usually a duplicate or conflicting required constraint.' }
  ],

  quizQuestions: [
    {
      id: 'ukq1',
      question: 'Which lifecycle method is called every time a view controller is about to appear?',
      options: ['viewDidLoad', 'viewWillAppear', 'loadView', 'init'],
      correctAnswer: 1,
      explanation: 'viewWillAppear is called every time the view is about to become visible, making it ideal for refreshing data.'
    },
    {
      id: 'ukq2',
      question: 'What must you set to false for programmatic Auto Layout?',
      options: ['clipsToBounds', 'isHidden', 'translatesAutoresizingMaskIntoConstraints', 'isUserInteractionEnabled'],
      correctAnswer: 2,
      explanation: 'translatesAutoresizingMaskIntoConstraints must be false to use programmatic constraints, otherwise autoresizing conflicts occur.'
    },
    {
      id: 'ukq3',
      question: 'Which layout guide should you use to avoid the notch and home indicator?',
      options: ['layoutMarginsGuide', 'readableContentGuide', 'safeAreaLayoutGuide', 'contentLayoutGuide'],
      correctAnswer: 2,
      explanation: 'safeAreaLayoutGuide represents the area not obscured by navigation bars, tab bars, notch, or home indicator.'
    },
    {
      id: 'ukq4',
      question: 'Why is the delegate property typically weak?',
      options: ['For performance', 'To prevent retain cycles', 'Required by the protocol', 'To allow nil values'],
      correctAnswer: 1,
      explanation: 'Weak prevents retain cycles. The delegate usually owns the delegating object, creating a potential cycle with strong references.'
    },
    {
      id: 'ukq5',
      question: 'What is the benefit of Diffable Data Source?',
      options: ['Faster compilation', 'Automatic animated updates', 'Smaller app size', 'Background fetching'],
      correctAnswer: 1,
      explanation: 'Diffable Data Source automatically calculates and animates changes between snapshots, eliminating manual insert/delete calls.'
    },
    {
      id: 'ukq6',
      question: 'When are frame values accurate in a view controller?',
      options: ['viewDidLoad', 'viewWillAppear', 'viewDidLayoutSubviews', 'init'],
      correctAnswer: 2,
      explanation: 'viewDidLayoutSubviews is called after layout, so frame values are accurate. In viewDidLoad, layout hasn\'t occurred yet.'
    },
    {
      id: 'ukq7',
      question: 'What method presents a view controller modally?',
      options: ['pushViewController', 'present', 'show', 'addChild'],
      correctAnswer: 1,
      explanation: 'present(_:animated:completion:) shows a view controller modally. push is for navigation stack.'
    },
    {
      id: 'ukq8',
      question: 'What is content hugging priority?',
      options: ['Resistance to clipping', 'Resistance to growing', 'Resistance to shrinking', 'Resistance to rotation'],
      correctAnswer: 1,
      explanation: 'Content hugging is resistance to growing larger than intrinsic content size. Higher priority = less stretching.'
    },
    {
      id: 'ukq9',
      question: 'Which class provides compositional layouts in iOS 13+?',
      options: ['UICollectionViewFlowLayout', 'UICollectionViewCompositionalLayout', 'UICollectionViewDelegateFlowLayout', 'UICollectionViewListLayout'],
      correctAnswer: 1,
      explanation: 'UICollectionViewCompositionalLayout enables complex, flexible layouts using sections, groups, and items.'
    },
    {
      id: 'ukq10',
      question: 'What is the purpose of cell reuse in table/collection views?',
      options: ['Code organization', 'Memory efficiency', 'Animation support', 'Type safety'],
      correctAnswer: 1,
      explanation: 'Cell reuse saves memory by recycling cells as they scroll off screen rather than creating new ones.'
    },
    {
      id: 'ukq11',
      question: 'How many times is viewDidLoad called for a single view controller instance?',
      options: ['Once, after the view is loaded', 'Every time the view appears', 'Every layout pass', 'Once per navigation push'],
      correctAnswer: 0,
      explanation: 'viewDidLoad fires once, right after loadView creates the view hierarchy. Per-appearance work belongs in viewWillAppear; size-dependent work belongs in viewDidLayoutSubviews.'
    },
    {
      id: 'ukq12',
      question: 'You change a constraint constant inside UIView.animate but the view jumps instead of animating. What is missing?',
      options: ['setNeedsDisplay() before the block', 'view.layoutIfNeeded() inside the animation block', 'updateConstraints() after the block', 'translatesAutoresizingMaskIntoConstraints = true'],
      correctAnswer: 1,
      explanation: 'Changing a constant only marks layout dirty. Calling layoutIfNeeded inside the animation block performs the layout now, so the frame change is captured by the animation.'
    },
    {
      id: 'ukq13',
      question: 'Two labels sit in a horizontal stack with extra space. You want the right label to stretch to absorb it. What do you change?',
      options: ['Raise the right label\'s compression resistance', 'Raise the right label\'s content hugging priority', 'Set the stack distribution to .fillEqually', 'Lower the right label\'s content hugging priority'],
      correctAnswer: 3,
      explanation: 'Hugging is resistance to growing. The label with the lower hugging priority is the one Auto Layout stretches. Compression resistance only matters when there is too little space.'
    },
    {
      id: 'ukq14',
      question: 'A button is positioned outside its superview\'s bounds and does not respond to taps. Why?',
      options: ['Hit testing stops at the superview\'s point(inside:) check, so children outside its bounds are never asked', 'clipsToBounds defaults to true', 'The button needs a gesture recognizer', 'Buttons cannot extend beyond their superview'],
      correctAnswer: 0,
      explanation: 'hitTest only descends into a view if point(inside:) returns true for that view. A child outside the parent\'s bounds is visible (when clipsToBounds is false) but unreachable unless you override point(inside:) on the parent.'
    },
    {
      id: 'ukq15',
      question: 'What should a UITableViewCell subclass do in prepareForReuse()?',
      options: ['Configure the cell with the next row\'s data', 'Register the cell with the table view', 'Reset state such as cancelling image loads and clearing text', 'Compute the row height'],
      correctAnswer: 2,
      explanation: 'prepareForReuse runs before a recycled cell is handed back to you. Reset anything that could leak from the previous row; configure the new content in cellForRowAt.'
    },
    {
      id: 'ukq16',
      question: 'In a UIScrollView, what does changing bounds.origin correspond to?',
      options: ['Moving the scroll view within its superview', 'Resizing the scroll view', 'Applying a transform', 'Scrolling the content (contentOffset)'],
      correctAnswer: 3,
      explanation: 'bounds is the view\'s own coordinate space. Shifting its origin shifts which part of the content is visible — that is exactly what contentOffset does. frame.origin would move the scroll view itself.'
    },
    {
      id: 'ukq17',
      question: 'A UIBarButtonItem sends its action with target: nil. Who handles it?',
      options: ['The AppDelegate only', 'The window', 'The first responder, then up the responder chain until something implements the action', 'The topmost view controller only'],
      correctAnswer: 2,
      explanation: 'A nil target means UIKit walks the responder chain starting at the first responder. Whichever responder implements the selector handles it — this is how paste/undo style actions work.'
    },
    {
      id: 'ukq18',
      question: 'How do you give a UIImageView rounded corners that actually clip the image?',
      options: ['layer.cornerRadius plus clipsToBounds (masksToBounds) = true', 'view.cornerRadius = 12', 'layer.borderRadius = 12', 'contentMode = .scaleAspectFill'],
      correctAnswer: 0,
      explanation: 'cornerRadius lives on the backing layer, and the image contents are only clipped when masksToBounds (UIView exposes it as clipsToBounds) is enabled. There is no cornerRadius on UIView itself.'
    },
    {
      id: 'ukq19',
      question: 'What happens at runtime when two required constraints conflict?',
      options: ['The app crashes', 'Both constraints are ignored', 'Auto Layout logs a warning and breaks one of them', 'The most recently added constraint always wins'],
      correctAnswer: 2,
      explanation: 'Auto Layout prints "Unable to simultaneously satisfy constraints", picks one to break, and carries on. Layout may look right by luck, so treat the log as a bug to fix.'
    },
    {
      id: 'ukq20',
      question: 'You set isUserInteractionEnabled = false on a container view. What happens to taps on its subviews?',
      options: ['Subviews still receive taps normally', 'Only subviews with gesture recognizers receive taps', 'Neither the container nor any subview receives taps', 'Taps are forwarded to the container\'s superview and then to the subviews'],
      correctAnswer: 2,
      explanation: 'Hit testing skips a view with user interaction disabled and never descends into its subtree, so every subview goes dead too. Enable interaction on the container and disable individual children if that is what you want.'
    }
  ]
};

// =============================================================================
// 3. SWIFTUI
// =============================================================================
const swiftUI: iOSCategory = {
  id: 'ios-swiftui',
  name: 'SwiftUI',
  slug: 'swiftui',
  description: 'Declarative UI: State, bindings, property wrappers, and animations',
  icon: 'color-wand-outline',
  color: '#00C7BE',
  colorDark: '#00A099',
  premium: true,

  learnContent: [
    {
      title: 'SwiftUI Basics',
      content: `SwiftUI is Apple's declarative UI framework. Instead of imperatively manipulating views, you describe what the UI should look like based on state.

**Key Principles:**
- **Declarative**: Describe what, not how
- **State-driven**: UI reflects current state
- **Composable**: Build complex UIs from small views
- **Cross-platform**: iOS, macOS, watchOS, tvOS

**View Protocol:**
All SwiftUI views conform to the View protocol, which requires a body property returning some View.

**View Modifiers:**
Chain modifiers to configure views. Order matters! Modifiers return new views wrapping the original.

**Stacks:**
- HStack: Horizontal
- VStack: Vertical
- ZStack: Layered (back to front)`,
      codeExample: `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Hello, SwiftUI!")
                .font(.largeTitle)
                .fontWeight(.bold)

            Image(systemName: "star.fill")
                .foregroundColor(.yellow)
                .font(.system(size: 60))

            Button("Tap Me") {
                print("Button tapped")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

// Modifier order matters!
Text("Example")
    .padding()        // First: adds padding
    .background(.red) // Second: background includes padding

Text("Example")
    .background(.red) // First: background only around text
    .padding()        // Second: padding outside background`
    },
    {
      title: 'State Management',
      content: `SwiftUI uses property wrappers to manage state. When state changes, affected views automatically re-render.

**Property Wrappers:**

1. **@State**: Local state owned by a view
   - Use for simple value types
   - Private to the view

2. **@Binding**: Two-way connection to state
   - Parent passes binding to child
   - Child can read and write

3. **@StateObject**: Own a reference type
   - View creates and owns the object
   - Survives view re-creation

4. **@ObservedObject**: Observe external reference type
   - View doesn't own the object
   - Passed in from parent

5. **@EnvironmentObject**: Shared object in environment
   - Passed through view hierarchy
   - Access anywhere below injection point

6. **@Environment**: System environment values
   - colorScheme, locale, etc.`,
      codeExample: `// @State - Local value type state
struct CounterView: View {
    @State private var count = 0 // view owns this value

    var body: some View {
        VStack {
            Text("Count: \\(count)")
            Button("Increment") {
                count += 1 // mutation triggers a re-render
            }
        }
    }
}

// @Binding - Two-way connection
struct ToggleRow: View {
    let title: String
    @Binding var isOn: Bool // reads/writes the parent's state

    var body: some View {
        Toggle(title, isOn: $isOn)
    }
}

struct SettingsView: View {
    @State private var notificationsEnabled = true

    var body: some View {
        // $ prefix passes a binding, not just the value
        ToggleRow(title: "Notifications", isOn: $notificationsEnabled)
    }
}

// @StateObject - Own a reference type
class UserViewModel: ObservableObject {
    @Published var name = ""  // changes notify observing views
    @Published var email = ""
}

struct ProfileView: View {
    // @StateObject keeps the object alive across re-renders
    @StateObject private var viewModel = UserViewModel()

    var body: some View {
        Form {
            TextField("Name", text: $viewModel.name)
            TextField("Email", text: $viewModel.email)
        }
    }
}`
    },
    {
      title: 'Observable Objects and @Published',
      content: `For complex state, use ObservableObject classes with @Published properties.

**ObservableObject Protocol:**
- Classes conforming to ObservableObject can notify views of changes
- Use @Published to mark properties that trigger updates
- Auto-generates objectWillChange publisher

**When to Use:**
- State shared between views
- Complex business logic
- Data that needs to persist
- Async operations

**@StateObject vs @ObservedObject:**
- @StateObject: View creates and owns the object
- @ObservedObject: View receives object from elsewhere
- Use @StateObject at the source, @ObservedObject downstream`,
      codeExample: `class TaskStore: ObservableObject {
    // @Published fires objectWillChange on every update
    @Published var tasks: [Task] = []
    @Published var isLoading = false

    func fetchTasks() async {
        isLoading = true
        // Fetch from API...
        tasks = await api.getTasks() // views re-render on assign
        isLoading = false
    }

    func addTask(_ task: Task) {
        tasks.append(task)
    }
}

// Owner creates with @StateObject
struct TaskListView: View {
    @StateObject private var store = TaskStore()

    var body: some View {
        NavigationView {
            List(store.tasks) { task in
                TaskRow(task: task, store: store)
            }
            .navigationTitle("Tasks")
            .task {
                await store.fetchTasks() // runs when view appears
            }
        }
    }
}

// Child receives with @ObservedObject
struct TaskRow: View {
    let task: Task
    @ObservedObject var store: TaskStore

    var body: some View {
        Text(task.title)
    }
}

// Or use @EnvironmentObject for deep hierarchies
struct MyApp: App {
    @StateObject private var store = TaskStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store) // inject once at the root
        }
    }
}

struct DeepChildView: View {
    @EnvironmentObject var store: TaskStore // No need to pass through

    var body: some View {
        Text("\\(store.tasks.count) tasks")
    }
}`
    },
    {
      title: 'Animations',
      content: `SwiftUI makes animations simple with implicit and explicit animation APIs.

**Implicit Animations:**
Apply .animation() modifier. Changes to that view animate automatically.

**Explicit Animations:**
Wrap state changes in withAnimation { }.

**Animation Types:**
- .default
- .easeIn, .easeOut, .easeInOut
- .linear
- .spring()
- .interactiveSpring()

**Transitions:**
Control how views appear/disappear:
- .opacity
- .slide
- .scale
- .move(edge:)
- .asymmetric(insertion:, removal:)

**matchedGeometryEffect:**
Smooth transitions between views with shared identity.`,
      codeExample: `struct AnimatedView: View {
    @State private var isExpanded = false
    @State private var showDetail = false

    var body: some View {
        VStack {
            // Implicit animation
            RoundedRectangle(cornerRadius: isExpanded ? 25 : 10)
                .fill(.blue)
                .frame(
                    width: isExpanded ? 300 : 100,
                    height: isExpanded ? 200 : 100
                )
                // Animates whenever isExpanded changes
                .animation(.spring(response: 0.5), value: isExpanded)
                .onTapGesture {
                    isExpanded.toggle()
                }

            // Explicit animation: animate this state change only
            Button("Toggle Detail") {
                withAnimation(.easeInOut(duration: 0.3)) {
                    showDetail.toggle()
                }
            }

            // Transition: how the view enters/exits
            if showDetail {
                Text("Detail Content")
                    .transition(.asymmetric(
                        insertion: .scale.combined(with: .opacity),
                        removal: .slide
                    ))
            }
        }
    }
}

// Matched Geometry Effect
struct CardListView: View {
    @Namespace private var animation // links the two views
    @State private var selectedCard: Card?

    var body: some View {
        ZStack {
            // Grid of cards
            LazyVGrid(columns: [GridItem(), GridItem()]) {
                ForEach(cards) { card in
                    if selectedCard?.id != card.id {
                        CardView(card: card)
                            // Same id: SwiftUI morphs between views
                            .matchedGeometryEffect(id: card.id, in: animation)
                            .onTapGesture {
                                withAnimation(.spring()) {
                                    selectedCard = card
                                }
                            }
                    }
                }
            }

            // Expanded card
            if let card = selectedCard {
                ExpandedCardView(card: card)
                    .matchedGeometryEffect(id: card.id, in: animation)
                    .onTapGesture {
                        withAnimation(.spring()) {
                            selectedCard = nil
                        }
                    }
            }
        }
    }
}`
    },
    {
      title: 'Navigation in SwiftUI',
      content: `SwiftUI provides NavigationStack (iOS 16+) and NavigationView for navigation.

**NavigationStack (iOS 16+):**
- Value-based navigation with navigationDestination
- Programmatic navigation with path
- Type-safe routing

**NavigationLink:**
- Trigger navigation
- Can be value-based or view-based

**Sheet and FullScreenCover:**
Modal presentation with bindings.

**NavigationSplitView (iOS 16+):**
Multi-column layouts for iPad.`,
      codeExample: `// NavigationStack (iOS 16+)
struct ContentView: View {
    @State private var path = NavigationPath() // the nav stack

    var body: some View {
        NavigationStack(path: $path) {
            List(items) { item in
                // Link pushes a value, not a view
                NavigationLink(value: item) {
                    Text(item.title)
                }
            }
            // Maps each value type to its destination view
            .navigationDestination(for: Item.self) { item in
                DetailView(item: item)
            }
            .navigationDestination(for: Settings.self) { settings in
                SettingsView(settings: settings)
            }
        }
    }

    // Programmatic navigation
    func navigateToItem(_ item: Item) {
        path.append(item) // appending to path pushes a screen
    }
}

// Sheet presentation
struct MainView: View {
    @State private var showSheet = false
    @State private var showFullScreen = false

    var body: some View {
        VStack {
            Button("Show Sheet") {
                showSheet = true
            }
            Button("Show Full Screen") {
                showFullScreen = true
            }
        }
        // Sheet shows when the bound state becomes true
        .sheet(isPresented: $showSheet) {
            SheetContent()
                .presentationDetents([.medium, .large]) // heights
                .presentationDragIndicator(.visible)
        }
        // Covers the whole screen; no swipe-to-dismiss
        .fullScreenCover(isPresented: $showFullScreen) {
            FullScreenContent()
        }
    }
}

// NavigationSplitView (iPad)
struct SplitView: View {
    @State private var selectedItem: Item?

    var body: some View {
        NavigationSplitView {
            // Sidebar: selection drives the detail column
            List(items, selection: $selectedItem) { item in
                Text(item.title)
            }
        } detail: {
            if let item = selectedItem {
                DetailView(item: item)
            } else {
                Text("Select an item") // empty-state placeholder
            }
        }
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'State Flow',
      description: 'How state changes trigger view updates in SwiftUI',
      nodes: [
        { id: 'state', label: '@State\nvalue', x: 100, y: 50, type: 'primary' },
        { id: 'view', label: 'View\nbody', x: 250, y: 50, type: 'secondary' },
        { id: 'action', label: 'User\nAction', x: 100, y: 150, type: 'warning' },
        { id: 'ui', label: 'Rendered\nUI', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'state', to: 'view' },
        { from: 'view', to: 'ui' },
        { from: 'action', to: 'state' }
      ]
    },
    {
      title: 'Property Wrapper Ownership',
      description: 'When to use each property wrapper',
      nodes: [
        { id: 'state', label: '@State\nLocal', x: 100, y: 50, type: 'primary' },
        { id: 'stateobj', label: '@StateObject\nOwned', x: 250, y: 50, type: 'primary' },
        { id: 'binding', label: '@Binding\nTwo-way', x: 100, y: 150, type: 'secondary' },
        { id: 'observed', label: '@Observed\nPassed', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'state', to: 'binding' },
        { from: 'stateobj', to: 'observed' }
      ]
    }
  ],

  flashcards: [
    { id: 'sui1', front: 'What is the difference between @State and @Binding?', back: '@State owns the value (source of truth). @Binding is a two-way connection to state owned elsewhere. Use $ to create a binding from state.' },
    { id: 'sui2', front: 'When should you use @StateObject vs @ObservedObject?', back: '@StateObject when the view creates and owns the object. @ObservedObject when the object is passed in from a parent. Use @StateObject at the source.' },
    { id: 'sui3', front: 'What is @EnvironmentObject used for?', back: 'Sharing an observable object through the view hierarchy without passing it explicitly. Inject with .environmentObject() at the top, access with @EnvironmentObject anywhere below.' },
    { id: 'sui4', front: 'What does @Published do?', back: '@Published marks a property in an ObservableObject that should trigger view updates when changed. It auto-generates the objectWillChange publisher.' },
    { id: 'sui5', front: 'What is the difference between implicit and explicit animation?', back: 'Implicit: .animation() modifier on a view. Explicit: withAnimation { } wrapping state changes. Explicit gives more control over what animates.' },
    { id: 'sui6', front: 'What is a transition in SwiftUI?', back: 'Transitions define how views appear and disappear. Examples: .opacity, .slide, .scale. Use .asymmetric for different insertion/removal animations.' },
    { id: 'sui7', front: 'What is matchedGeometryEffect?', back: 'Creates smooth animations between views with shared identity across different locations. Use @Namespace to create the ID space.' },
    { id: 'sui8', front: 'What is NavigationPath in iOS 16+?', back: 'A type-erased collection for programmatic navigation. Supports multiple destination types and deep linking.' },
    { id: 'sui9', front: 'What is some View?', back: 'An opaque return type meaning "some specific View type." Swift infers the actual type. Required because body can return any View.' },
    { id: 'sui10', front: 'Why does modifier order matter?', back: 'Each modifier wraps the view in a new view. .padding().background() adds padding then background (includes padding). .background().padding() adds background then padding (outside background).' },
    { id: 'sui11', front: 'What is @Environment used for?', back: 'Accessing system environment values like colorScheme, locale, dismiss action, etc. Example: @Environment(\\.colorScheme) var colorScheme' },
    { id: 'sui12', front: 'What is the .task modifier?', back: 'Runs an async task when the view appears and cancels it when the view disappears. Replaces onAppear for async work.' },
    { id: 'sui13', front: 'What is presentationDetents?', back: 'iOS 16+ modifier for sheets that allows setting height stops like .medium, .large, or custom heights.' },
    { id: 'sui14', front: 'What is @ViewBuilder?', back: 'Enables functions to return multiple views as a single result. Used for building view hierarchies in custom containers.' },
    { id: 'sui15', front: 'What is the difference between List and ForEach?', back: 'List is a scrollable container with platform styling. ForEach is just a loop that generates views. ForEach can be used inside any container.' },
    { id: 'sui16', front: 'What is the difference between VStack and LazyVStack?', back: 'VStack creates all of its children immediately and sizes itself from them. LazyVStack (inside a ScrollView) creates child views only as they approach the visible region, so long lists stay cheap; once created, lazy children are kept around. Use VStack for small fixed groups and LazyVStack for long or unbounded lists.' },
    { id: 'sui17', front: 'How do you use a UIKit view inside SwiftUI?', back: 'Conform a struct to UIViewRepresentable: makeUIView creates the view once, updateUIView pushes SwiftUI state into it on every render, and makeCoordinator returns a class that acts as the UIKit delegate/target and writes changes back through a @Binding. UIViewControllerRepresentable does the same for view controllers.' },
    { id: 'sui18', front: 'What does .task(id:) do?', back: 'Runs the async closure when the view appears and again whenever the id value changes, cancelling the previous task first. It is the idiomatic way to react to a changing input with async work — re-running a search whenever the query changes, for example — without managing Task handles yourself.' },
    { id: 'sui19', front: 'What is a ViewModifier?', back: 'A reusable wrapper that applies a transformation to a view. Used via .modifier(...) or as a custom .someStyle() extension method on View.' },
    { id: 'sui20', front: 'When would you reach for PreferenceKey?', back: 'When a child view needs to send data *up* the hierarchy — the opposite direction of environment. Common case: measure a child\'s size and have the parent react.' },
    { id: 'sui21', front: 'What does GeometryReader give you?', back: 'A view that exposes the size and frame its parent gave it via a GeometryProxy. Use it sparingly — it disables natural flex sizing for everything inside it.' },
    { id: 'sui22', front: 'What is @FocusState?', back: 'A property wrapper that binds keyboard focus to a Bool or an optional enum value. Pair it with .focused($field, equals: .email) on each text field; setting the state moves focus programmatically, and setting it to nil (or false) dismisses the keyboard. It lives in the view, not in a view model.' },
    { id: 'sui23', front: 'How do you hide a view but keep its space?', back: '.opacity(0) or .hidden() — invisible but still occupies layout space. To remove from the layout entirely, conditionally include it: `if condition { TheView() }`.' },
    { id: 'sui24', front: 'What is view identity in SwiftUI?', back: 'How SwiftUI decides two views across renders are "the same" view. Structural identity comes from position in the view tree (an if/else branch is a different identity); explicit identity comes from .id() or ForEach ids. Identity controls whether @State persists and whether a change animates or transitions.' },
    { id: 'sui25', front: 'Why is initializing @State from an init parameter a trap?', back: 'SwiftUI stores @State outside the view and only uses your initial value the first time the view\'s identity is created. If the parent later passes a different value, the stored state keeps the old one. Use @Binding for parent-owned data or key the view with .id().' },
    { id: 'sui26', front: 'How does @Observable (iOS 17) differ from ObservableObject?', back: 'It tracks reads at the property level, so a view only re-renders when a property it actually read changes — no @Published needed. Own it with @State, inject it with .environment(), and use @Bindable to get bindings into its properties.' },
    { id: 'sui27', front: 'What goes wrong if you write `@ObservedObject var model = Model()` inside a view?', back: 'The view struct is recreated whenever its parent re-renders, so a brand-new Model is created each time and any state in it is lost. @StateObject (or @State with @Observable) ties the object\'s lifetime to the view\'s identity instead.' },
    { id: 'sui28', front: 'Why does ForEach need stable ids?', back: 'Ids give each row an explicit identity across updates. With stable ids SwiftUI can diff inserts and deletes, animate them correctly, and keep per-row @State attached to the right row. Using array indices as ids breaks all of that the moment an element is removed.' },
    { id: 'sui29', front: 'How does SwiftUI layout work at a high level?', back: 'Parent proposes a size, the child chooses its own size (which may ignore the proposal), and the parent then positions the child. This is why .frame(width:) is a wrapper view that proposes a size rather than a constraint — a Text can still refuse to shrink and overflow it.' },
    { id: 'sui30', front: 'When does a SwiftUI view\'s body get re-evaluated?', back: 'Whenever a dependency it reads changes — @State, @Binding, an observed object, or an environment value — or when its parent re-renders and passes new inputs. body should therefore be cheap and side-effect free; a View is a description, not the rendered object.' }
  ],

  quizQuestions: [
    {
      id: 'suiq1',
      question: 'Which property wrapper creates a two-way connection to state owned by another view?',
      options: ['@State', '@Binding', '@ObservedObject', '@Published'],
      correctAnswer: 1,
      explanation: '@Binding creates a two-way connection to state. The parent provides a binding using $ prefix on @State.'
    },
    {
      id: 'suiq2',
      question: 'When should you use @StateObject instead of @ObservedObject?',
      options: ['For value types', 'When the view creates the object', 'For environment values', 'Never, they are the same'],
      correctAnswer: 1,
      explanation: '@StateObject is for when the view creates and owns the observable object. @ObservedObject is for objects passed in.'
    },
    {
      id: 'suiq3',
      question: 'What does withAnimation { } do?',
      options: ['Creates implicit animation', 'Creates explicit animation', 'Disables animation', 'Loops animation'],
      correctAnswer: 1,
      explanation: 'withAnimation creates explicit animations. State changes inside the closure animate. This gives more control than implicit animation.'
    },
    {
      id: 'suiq4',
      question: 'Which modifier would you use to control sheet height in iOS 16+?',
      options: ['.frame()', '.presentationDetents()', '.height()', '.sheetHeight()'],
      correctAnswer: 1,
      explanation: '.presentationDetents() allows setting height stops for sheets like .medium, .large, or custom values.'
    },
    {
      id: 'suiq5',
      question: 'What is required for matchedGeometryEffect?',
      options: ['@State', '@Namespace', '@Animation', '@Transition'],
      correctAnswer: 1,
      explanation: '@Namespace creates the ID space for matchedGeometryEffect. Views with the same ID in the namespace animate between positions.'
    },
    {
      id: 'suiq6',
      question: 'How do you pass an observable object through the view hierarchy?',
      options: ['@Binding', 'init parameter', '.environmentObject()', '@State'],
      correctAnswer: 2,
      explanation: '.environmentObject() injects an object into the environment. Child views access it with @EnvironmentObject without explicit passing.'
    },
    {
      id: 'suiq7',
      question: 'What type does body return in a SwiftUI View?',
      options: ['View', 'AnyView', 'some View', 'UIView'],
      correctAnswer: 2,
      explanation: 'body returns "some View", an opaque type. Swift infers the actual type, enabling type-safe composition.'
    },
    {
      id: 'suiq8',
      question: 'What replaces viewDidLoad for async work in SwiftUI?',
      options: ['.onAppear', '.task', '.init', '.body'],
      correctAnswer: 1,
      explanation: '.task runs async work when the view appears and automatically cancels when the view disappears.'
    },
    {
      id: 'suiq9',
      question: 'Text("Hi").padding().background(.red) - where is the red background?',
      options: ['Only behind text', 'Behind text and padding', 'Outside the padding', 'No background shows'],
      correctAnswer: 1,
      explanation: 'Modifiers apply in order. .padding() adds space, then .background() fills that padded area with red.'
    },
    {
      id: 'suiq10',
      question: 'Which is used for value-based navigation in iOS 16+?',
      options: ['NavigationView', 'NavigationStack', 'NavigationLink only', 'UINavigationController'],
      correctAnswer: 1,
      explanation: 'NavigationStack with navigationDestination provides type-safe, value-based navigation in iOS 16+.'
    },
    {
      id: 'suiq11',
      question: 'struct Counter: View { @ObservedObject var model = CounterModel() ... }. The parent view re-renders often. What happens to the count?',
      options: ['It is preserved because ObservedObject caches the instance', 'It resets, because a new CounterModel is created every time the parent re-renders', 'The compiler rejects the default value', 'It doubles on each render'],
      correctAnswer: 1,
      explanation: '@ObservedObject does not own the object. Each time the parent creates a new Counter struct the default initializer runs again, replacing the model. @StateObject keeps one instance for the lifetime of the view\'s identity.'
    },
    {
      id: 'suiq12',
      question: 'if isOn { Text("On") } else { Text("Off") } — what happens when isOn toggles?',
      options: ['The same Text is updated in place', 'A compile error: both branches must be identical', 'The two Texts have different identities, so one is removed and the other inserted (with a transition)', 'Nothing renders until the next state change'],
      correctAnswer: 2,
      explanation: 'Each branch of an if has its own structural identity. Toggling swaps views rather than mutating one, so transitions apply and any @State inside is reset. Text(isOn ? "On" : "Off") would keep one identity.'
    },
    {
      id: 'suiq13',
      question: 'What happens when you change the value passed to .id() on a view?',
      options: ['Only the accessibility identifier changes', 'The view is treated as a new view: its @State is reset and it is re-created', 'The view is cached under both ids', 'It becomes the first responder'],
      correctAnswer: 1,
      explanation: '.id() sets explicit identity. A different id means a different view to SwiftUI, which tears down the old one (including its state and animations) and creates a fresh one — a common trick to force a reset.'
    },
    {
      id: 'suiq14',
      question: 'struct Child: View { @State var text: String; init(text: String) { _text = State(initialValue: text) } }. The parent later passes a new string. What does Child show?',
      options: ['The new string', 'An empty string', 'A crash', 'The original string — @State keeps the first value'],
      correctAnswer: 3,
      explanation: 'The initial value is only consulted when the view\'s identity is first created. Subsequent inits with different parameters do not overwrite existing state. Use @Binding or a plain property for parent-owned data.'
    },
    {
      id: 'suiq15',
      question: 'With an @Observable model passed into a child view, which wrapper lets the child create bindings to its properties?',
      options: ['@Binding', '@ObservedObject', '@Bindable', '@StateObject'],
      correctAnswer: 2,
      explanation: '@Bindable is the Observation-framework counterpart to @ObservedObject\'s $ projection. @ObservedObject and @StateObject are for ObservableObject types; @Binding wraps a single value, not a model.'
    },
    {
      id: 'suiq16',
      question: 'A parent proposes 300x300 to Text("Hi"). What size does the Text take?',
      options: ['Its ideal size — just big enough for "Hi"', '300x300, filling the proposal', 'Zero until a frame is applied', 'The screen size'],
      correctAnswer: 0,
      explanation: 'Children choose their own size. Text returns the size of its content regardless of the proposal (it only uses the proposal to decide wrapping). Shapes and Colors, by contrast, accept the whole proposal.'
    },
    {
      id: 'suiq17',
      question: 'What does .frame(maxWidth: .infinity) do?',
      options: ['Gives the view infinite width', 'Makes the view horizontally scrollable', 'Lets the view accept all of the width its parent proposes', 'Ignores the safe area'],
      correctAnswer: 2,
      explanation: 'It wraps the view in a flexible frame whose width can grow up to the full proposed width, which is how you make a button or row fill horizontally. The actual width is still bounded by the parent\'s proposal.'
    },
    {
      id: 'suiq18',
      question: 'Three views observe the same ObservableObject via @ObservedObject; only one reads the @Published property that changes. How many bodies re-evaluate?',
      options: ['Only the one that reads the property', 'None until the next user interaction', 'All three', 'Only the view that owns the object'],
      correctAnswer: 2,
      explanation: '@Published fires objectWillChange for the whole object, so every observing view is invalidated regardless of which properties it uses. The @Observable macro fixes this with per-property tracking.'
    },
    {
      id: 'suiq19',
      question: 'ForEach(items.indices, id: \\.self) { i in Row(items[i]) }. What breaks when the first item is deleted?',
      options: ['Nothing — indices are always unique', 'Identities shift, so the wrong rows animate and per-row state attaches to the wrong item', 'The compiler requires Identifiable', 'The list stops scrolling'],
      correctAnswer: 1,
      explanation: 'After the delete, index 0 now refers to a different item, but SwiftUI thinks it is the same row. Use a stable id such as a UUID or a database key so identity follows the data.'
    },
    {
      id: 'suiq20',
      question: 'var body: some View { if flag { return Text("A") } else { return Image(systemName: "star") } } — what happens?',
      options: ['Works, because both are Views', 'Runtime crash', 'The Image is silently ignored', 'Compile error — explicit returns of different types are not allowed with some View'],
      correctAnswer: 3,
      explanation: 'some View is a single concrete type. Without @ViewBuilder (which explicit `return` opts out of) the branches must return the same type. Drop the returns so the @ViewBuilder wraps them in a _ConditionalContent, or use AnyView.'
    }
  ]
};

// =============================================================================
// 4. CONCURRENCY
// =============================================================================
const concurrency: iOSCategory = {
  id: 'ios-concurrency',
  name: 'Concurrency',
  slug: 'concurrency',
  description: 'GCD, async/await, actors, and thread-safe programming',
  icon: 'git-branch-outline',
  color: '#5856D6',
  colorDark: '#4240A8',
  premium: true,

  learnContent: [
    {
      title: 'Grand Central Dispatch (GCD)',
      content: `GCD is Apple's low-level API for managing concurrent operations using dispatch queues.

**Queue Types:**

1. **Main Queue**: Serial, runs on main thread for UI
2. **Global Queues**: Concurrent, with QoS levels
3. **Custom Queues**: Serial or concurrent

**Quality of Service (QoS):**
- .userInteractive: Highest priority, UI updates
- .userInitiated: User-triggered, quick results
- .default: Standard priority
- .utility: Long-running, progress shown
- .background: Lowest priority, not visible

**Key Operations:**
- sync: Blocks current thread until complete
- async: Returns immediately, work runs concurrently
- asyncAfter: Delay execution

**⚠️ Never sync to main from main (deadlock)!**`,
      codeExample: `// Dispatch to background, update UI on main
DispatchQueue.global(qos: .userInitiated).async {
    let data = performExpensiveOperation()

    DispatchQueue.main.async {
        // Update UI on main thread
        self.updateUI(with: data)
    }
}

// Delay execution
DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
    showWelcomeMessage()
}

// Serial queue for thread-safe access
let serialQueue = DispatchQueue(label: "com.app.dataQueue")

serialQueue.async {
    // Only one task runs at a time
    self.sharedData.append(newItem)
}

// Concurrent queue with barrier for safe writes
let concurrentQueue = DispatchQueue(
    label: "com.app.concurrent",
    attributes: .concurrent
)

// Reads can happen concurrently
concurrentQueue.async {
    let value = sharedDict["key"]
}

// Writes use barrier (waits for reads, blocks new reads)
concurrentQueue.async(flags: .barrier) {
    sharedDict["key"] = newValue
}`
    },
    {
      title: 'Swift Concurrency (async/await)',
      content: `Swift 5.5 introduced modern concurrency with async/await, making asynchronous code read like synchronous code.

**Key Concepts:**

1. **async**: Function may suspend
2. **await**: Suspension point, waits for result
3. **Task**: Unit of async work
4. **Structured concurrency**: Child tasks tied to parent

**Benefits:**
- No callback hell
- Compiler-checked thread safety
- Automatic cancellation propagation
- Clear control flow

**Task Types:**
- Task { }: Unstructured, inherits actor context
- Task.detached { }: Unstructured, no inherited context
- async let: Structured concurrent binding
- TaskGroup: Dynamic number of concurrent tasks`,
      codeExample: `// Async function
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Calling async function
Task {
    do {
        let user = try await fetchUser(id: "123")
        // Back on main actor for SwiftUI/UIKit
        updateUI(with: user)
    } catch {
        showError(error)
    }
}

// Concurrent execution with async let
func fetchDashboard() async throws -> Dashboard {
    async let user = fetchUser(id: currentUserId)
    async let posts = fetchPosts()
    async let notifications = fetchNotifications()

    // All three run concurrently, await all results
    return try await Dashboard(
        user: user,
        posts: posts,
        notifications: notifications
    )
}

// TaskGroup for dynamic concurrency
func fetchAllUsers(ids: [String]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            // Spawn one child task per id; all run concurrently
            group.addTask {
                try await fetchUser(id: id)
            }
        }

        var users: [User] = []
        // Collect results as each task finishes (any order)
        for try await user in group {
            users.append(user)
        }
        return users
    }
}`
    },
    {
      title: 'Actors',
      content: `Actors are reference types that protect their mutable state from data races by ensuring only one task accesses their state at a time.

**Key Properties:**
- Isolated mutable state
- Async access from outside
- Sync access from inside
- Compiler-enforced safety

**@MainActor:**
Special actor for main thread. Use for UI code.
- Mark classes/structs with @MainActor
- Mark individual functions
- SwiftUI views are implicitly @MainActor

**nonisolated:**
Opt out of actor isolation for read-only or thread-safe operations.`,
      codeExample: `// Custom actor
actor BankAccount {
    private var balance: Double = 0

    func deposit(_ amount: Double) {
        balance += amount
    }

    func withdraw(_ amount: Double) -> Bool {
        guard balance >= amount else { return false }
        balance -= amount
        return true
    }

    // nonisolated for computed property without state
    nonisolated var accountType: String {
        "Checking"
    }
}

// Using actor (requires await from outside)
let account = BankAccount()

Task {
    await account.deposit(100)
    let success = await account.withdraw(50)
}

// @MainActor for UI
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [Item] = []

    func loadItems() async {
        // Can safely update @Published from here
        items = await fetchItems()
    }
}

// Or mark individual functions
class DataManager {
    @MainActor
    func updateUI(with data: Data) {
        // Guaranteed to run on main thread
    }
}

// Calling @MainActor function
Task {
    let data = await fetchData()
    await updateUI(with: data) // Automatically dispatches to main
}`
    },
    {
      title: 'Sendable and Data Races',
      content: `Sendable is a protocol indicating a type is safe to pass across concurrency domains.

**Sendable Types:**
- Value types with Sendable properties
- Actors (inherently Sendable)
- Classes marked @Sendable with proper synchronization
- Immutable classes (all let properties)

**@Sendable Closures:**
Closures passed to async contexts must be @Sendable, meaning they can only capture Sendable values.

**Compiler Checks:**
Swift 6 will enforce strict Sendable checking. Enable warnings now with:
-warn-concurrency flag`,
      codeExample: `// Sendable struct (value type, safe to copy)
struct User: Sendable {
    let id: String
    let name: String
}

// Sendable class (immutable, all let)
final class Configuration: Sendable {
    let apiKey: String
    let baseURL: URL

    init(apiKey: String, baseURL: URL) {
        self.apiKey = apiKey
        self.baseURL = baseURL
    }
}

// @unchecked Sendable (you guarantee thread safety)
final class ThreadSafeCache: @unchecked Sendable {
    private var cache: [String: Data] = [:]
    private let lock = NSLock()

    func get(_ key: String) -> Data? {
        lock.lock()
        defer { lock.unlock() }
        return cache[key]
    }
}

// @Sendable closure
func performAsync(_ work: @Sendable @escaping () -> Void) {
    Task {
        work()
    }
}

// This fails - capturing non-Sendable class
class NonSendableClass {
    var value = 0
}

let obj = NonSendableClass()
performAsync {
    // Error: Capture of 'obj' with non-sendable type
    print(obj.value)
}`
    },
    {
      title: 'Cancellation and Structured Concurrency',
      content: `Structured concurrency ensures child tasks are tied to their parent, enabling automatic cancellation propagation.

**Task Cancellation:**
- Check Task.isCancelled
- Use try Task.checkCancellation()
- Cancellation is cooperative

**Structured Concurrency Rules:**
- async let creates child task
- TaskGroup creates child tasks
- Children cancelled when parent cancelled
- Parent waits for all children

**Unstructured Tasks:**
- Task { } doesn't automatically cancel
- Store task handle and call .cancel() manually`,
      codeExample: `// Checking cancellation
func processItems(_ items: [Item]) async throws -> [Result] {
    var results: [Result] = []

    for item in items {
        // Check if cancelled
        try Task.checkCancellation()

        // Or check manually
        if Task.isCancelled {
            break
        }

        let result = await process(item)
        results.append(result)
    }

    return results
}

// Cancellation with async let (automatic)
func fetchAndProcess() async throws -> Data {
    async let part1 = fetchPart1()
    async let part2 = fetchPart2()

    // If this throws, part1 and part2 are cancelled
    let combined = try await combine(part1, part2)
    return combined
}

// TaskGroup cancellation
func fetchAll() async throws -> [Item] {
    try await withThrowingTaskGroup(of: Item.self) { group in
        // Add tasks...

        // Cancel all remaining if one fails
        do {
            var items: [Item] = []
            for try await item in group {
                items.append(item)
            }
            return items
        } catch {
            group.cancelAll() // Cancel remaining tasks
            throw error
        }
    }
}

// Storing task for manual cancellation
class ViewModel {
    private var loadTask: Task<Void, Never>?

    func startLoading() {
        loadTask = Task {
            await loadData()
        }
    }

    func cancelLoading() {
        loadTask?.cancel()
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Dispatch Queue Types',
      description: 'Main, global, and custom queues in GCD',
      nodes: [
        { id: 'main', label: 'Main Queue\nSerial, UI', x: 100, y: 50, type: 'primary' },
        { id: 'global', label: 'Global Queue\nConcurrent', x: 250, y: 50, type: 'secondary' },
        { id: 'serial', label: 'Serial\nCustom', x: 100, y: 150, type: 'info' },
        { id: 'concurrent', label: 'Concurrent\nCustom', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'main', to: 'global' },
        { from: 'global', to: 'serial' },
        { from: 'global', to: 'concurrent' }
      ]
    },
    {
      title: 'Actor Isolation',
      description: 'How actors protect mutable state',
      nodes: [
        { id: 'task1', label: 'Task 1\ndeposit()', x: 100, y: 50, type: 'info' },
        { id: 'task2', label: 'Task 2\nwithdraw()', x: 250, y: 50, type: 'info' },
        { id: 'actor', label: 'Actor\nisolated', x: 100, y: 150, type: 'primary' },
        { id: 'state', label: 'State\nprotected', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'task1', to: 'actor' },
        { from: 'task2', to: 'actor' },
        { from: 'actor', to: 'state' }
      ]
    }
  ],

  flashcards: [
    { id: 'cc1', front: 'What is the main queue used for?', back: 'UI updates. It\'s a serial queue that runs on the main thread. All UI code must run on the main queue.' },
    { id: 'cc2', front: 'What is the difference between sync and async dispatch?', back: 'sync blocks the current thread until work completes. async returns immediately and work runs concurrently.' },
    { id: 'cc3', front: 'What is a dispatch barrier?', back: 'A barrier waits for existing tasks to finish, runs exclusively, then allows new tasks. Used for thread-safe writes in concurrent queues.' },
    { id: 'cc4', front: 'What does async let do?', back: 'Creates a child task that runs concurrently. The value is awaited when accessed. Multiple async let bindings run in parallel.' },
    { id: 'cc5', front: 'What is an actor?', back: 'A reference type that isolates its mutable state. Only one task can access an actor\'s state at a time, preventing data races.' },
    { id: 'cc6', front: 'What is @MainActor?', back: 'A global actor that ensures code runs on the main thread. Use for UI code. SwiftUI views are implicitly @MainActor.' },
    { id: 'cc7', front: 'What is Sendable?', back: 'A protocol indicating a type is safe to pass across concurrency boundaries. Value types, actors, and properly synchronized classes can be Sendable.' },
    { id: 'cc8', front: 'How do you check for task cancellation?', back: 'Use Task.isCancelled (returns Bool) or try Task.checkCancellation() (throws if cancelled).' },
    { id: 'cc9', front: 'What is structured concurrency?', back: 'Child tasks are tied to their parent scope. Children are automatically cancelled when parent is cancelled, and parent waits for all children.' },
    { id: 'cc10', front: 'What is TaskGroup used for?', back: 'Running a dynamic number of concurrent tasks and collecting results. Use withTaskGroup or withThrowingTaskGroup.' },
    { id: 'cc11', front: 'What does nonisolated mean on an actor?', back: 'Opts out of actor isolation for that member. Use for computed properties or functions that don\'t access mutable state.' },
    { id: 'cc12', front: 'What QoS should you use for user-initiated work?', back: '.userInitiated - high priority for work the user is waiting for. Use .userInteractive for UI updates.' },
    { id: 'cc13', front: 'How do you run async code from synchronous context?', back: 'Create a Task { } block. The task runs asynchronously and inherits the current actor context.' },
    { id: 'cc14', front: 'What is Task.detached for?', back: 'Creates an unstructured task that doesn\'t inherit the current actor context. Runs independently.' },
    { id: 'cc15', front: 'Why should you never sync to main from main?', back: 'Causes deadlock. The main queue waits for sync work, but sync work needs the main queue (which is blocked).' },
    { id: 'cc16', front: 'What is actor reentrancy?', back: 'An actor\'s method can suspend at an await, and while it is suspended other calls may run on the same actor and change its state. Actors prevent data races, not logic races — re-validate any assumption after every await.' },
    { id: 'cc17', front: 'What is a global actor and when would you define your own?', back: 'A singleton actor that can isolate declarations anywhere in the program: annotate a type, function, or property with @MyActor and all of it runs serialized on that actor. Define one with @globalActor plus a static shared instance — e.g. a @DatabaseActor so every type that touches the database shares one isolation domain. @MainActor is the built-in example.' },
    { id: 'cc18', front: 'What does withTaskCancellationHandler do?', back: 'Runs an operation and, if the task is cancelled, invokes the handler immediately — even while the operation is suspended — instead of waiting for the next cancellation check. Use it to push cancellation into non-Swift-concurrency work such as a URLSessionTask or a stored continuation. The handler can run concurrently with the operation, so it must be thread-safe.' },
    { id: 'cc19', front: 'What is an `isolated` parameter?', back: 'Marking a parameter `isolated` (e.g. func flush(_ db: isolated Database)) makes the function run inside that actor\'s isolation for the whole call. It can read and mutate the actor\'s state synchronously with no awaits — handy for helpers that need to perform several operations atomically without being declared on the actor itself.' },
    { id: 'cc20', front: 'What does Task.yield() do?', back: 'Voluntarily suspends the current task so the executor can run other tasks, then resumes it. Use it inside long CPU-bound loops that never hit an await; otherwise the task hogs a cooperative-pool thread. It does not throw on cancellation — pair it with Task.checkCancellation() if the loop should stop.' },
    { id: 'cc21', front: 'How do you cancel a Task?', back: 'Call task.cancel(). The task itself must observe by checking Task.isCancelled or calling try Task.checkCancellation(). Cancellation is cooperative — the task decides how to bail.' },
    { id: 'cc22', front: 'What is a task-local value (@TaskLocal)?', back: 'A static property marked @TaskLocal that you bind for a scope with $value.withValue(x) { ... }. Every child task created inside that scope — async let, task groups, plain Task { } — inherits it, while Task.detached does not. Ideal for request ids, tracing context, or a test-injected clock without threading a parameter through every call.' },
    { id: 'cc23', front: 'How does an actor differ from a serial queue?', back: 'A serial queue serialises *closure execution*. An actor serialises *access to its state* via the language. Actors integrate with structured concurrency; queues do not.' },
    { id: 'cc24', front: 'When would you still use GCD instead of async/await?', back: 'Bridging legacy callback APIs, simple fire-and-forget hops to the main queue, and barrier-protected caches in older code. New code should prefer async/await for cancellation, structure, and compiler-checked isolation — and never mix them by blocking an async context with a semaphore or DispatchQueue.sync.' },
    { id: 'cc25', front: 'What is the cooperative thread pool and why must you never block it?', back: 'Swift concurrency runs tasks on a small pool of threads (roughly one per core). Blocking one with a semaphore, sleep(), or a sync dispatch can starve every other task — including the one you are waiting for — and deadlock. Suspend with await instead.' },
    { id: 'cc26', front: 'What is a continuation used for?', back: 'withCheckedContinuation / withCheckedThrowingContinuation wrap a callback-based API in async. You call continuation.resume(...) exactly once from the callback; the checked variants trap if you resume twice and log if you never resume.' },
    { id: 'cc27', front: 'What is the difference between a data race and a race condition?', back: 'A data race is unsynchronized concurrent access to memory where at least one access is a write — undefined behavior, and a compile error under Swift 6 strict concurrency. A race condition is any timing-dependent bug, which can survive even in race-free code (see actor reentrancy).' },
    { id: 'cc28', front: 'What does @Sendable on a closure mean?', back: 'The closure may be run from another concurrency domain, so it can only capture Sendable values and cannot capture mutable local variables by reference. Task initializers and detached tasks take @Sendable closures.' },
    { id: 'cc29', front: 'What is AsyncStream for?', back: 'Turning a push-based source — delegate callbacks, NotificationCenter, a socket — into an AsyncSequence you can `for await` over. You get a continuation to yield values and finish, and cancellation flows through automatically.' },
    { id: 'cc30', front: 'What actually happens at an `await`?', back: 'The function may suspend: its thread is released to run other work, and it resumes later — possibly on a different thread, and after other code has run. Anything you checked before the await may no longer be true afterwards.' }
  ],

  quizQuestions: [
    {
      id: 'ccq1',
      question: 'Which dispatch method should you use to update UI from a background queue?',
      options: ['DispatchQueue.global().sync', 'DispatchQueue.main.async', 'DispatchQueue.main.sync', 'DispatchQueue.global().async'],
      correctAnswer: 1,
      explanation: 'Use DispatchQueue.main.async to update UI. Never use sync to main from background (could deadlock in some cases).'
    },
    {
      id: 'ccq2',
      question: 'What does async let enable?',
      options: ['Sequential execution', 'Concurrent execution of child tasks', 'Synchronous execution', 'Background execution only'],
      correctAnswer: 1,
      explanation: 'async let creates child tasks that run concurrently. Multiple async let bindings execute in parallel.'
    },
    {
      id: 'ccq3',
      question: 'How do actors prevent data races?',
      options: ['Using locks', 'Allowing only one task at a time', 'Copying all data', 'Using semaphores'],
      correctAnswer: 1,
      explanation: 'Actors ensure only one task accesses their mutable state at a time. Access from outside requires await.'
    },
    {
      id: 'ccq4',
      question: 'What attribute ensures code runs on the main thread?',
      options: ['@UIThread', '@MainActor', '@MainThread', '@Synchronized'],
      correctAnswer: 1,
      explanation: '@MainActor is a global actor that guarantees code runs on the main thread. Use for UI updates.'
    },
    {
      id: 'ccq5',
      question: 'What is a dispatch barrier used for?',
      options: ['Blocking all queues', 'Thread-safe writes', 'UI updates', 'Error handling'],
      correctAnswer: 1,
      explanation: 'Barriers in concurrent queues wait for reads to finish, run exclusively (for writes), then allow new reads.'
    },
    {
      id: 'ccq6',
      question: 'Which is a valid way to check task cancellation?',
      options: ['Task.cancelled', 'try Task.checkCancellation()', 'await Task.cancel', 'Task.stop()'],
      correctAnswer: 1,
      explanation: 'try Task.checkCancellation() throws CancellationError if cancelled. Also Task.isCancelled returns Bool.'
    },
    {
      id: 'ccq7',
      question: 'What does Sendable indicate?',
      options: ['Can be sent to server', 'Safe to pass across concurrency domains', 'Can be serialized', 'Can be copied'],
      correctAnswer: 1,
      explanation: 'Sendable means a type can safely cross concurrency boundaries without data races.'
    },
    {
      id: 'ccq8',
      question: 'What is the benefit of structured concurrency?',
      options: ['Faster execution', 'Automatic cancellation propagation', 'Less memory usage', 'Type safety'],
      correctAnswer: 1,
      explanation: 'Structured concurrency ties child tasks to parents. Cancelling parent cancels children, and parent waits for all children.'
    },
    {
      id: 'ccq9',
      question: 'Which QoS has the highest priority?',
      options: ['.background', '.utility', '.userInitiated', '.userInteractive'],
      correctAnswer: 3,
      explanation: '.userInteractive has highest priority, used for UI updates. .background is lowest priority.'
    },
    {
      id: 'ccq10',
      question: 'How do you create an unstructured task that doesn\'t inherit actor context?',
      options: ['Task { }', 'Task.detached { }', 'async let', 'withTaskGroup'],
      correctAnswer: 1,
      explanation: 'Task.detached creates an unstructured task without inheriting the current actor context.'
    },
    {
      id: 'ccq11',
      question: 'actor Bank { var balance = 100; func withdraw(_ n: Int) async { if balance >= n { await audit(); balance -= n } } }. Two tasks call withdraw(80) concurrently. What can happen?',
      options: ['Balance can end at -60 because state changes across the await', 'Balance is always 20 — actors serialize whole methods', 'Compile error: await inside an actor method', 'Deadlock between the two calls'],
      correctAnswer: 0,
      explanation: 'Actors are reentrant. Both calls pass the balance check, suspend at await audit(), and then each subtracts 80. Re-check invariants after every await, or avoid suspending between check and mutation.'
    },
    {
      id: 'ccq12',
      question: 'Inside an async function you call semaphore.wait() to block until a callback fires. What is the risk?',
      options: ['The compiler inserts an implicit await', 'The semaphore is automatically released', 'Starving or deadlocking the cooperative thread pool', 'Nothing — semaphores are the recommended bridge'],
      correctAnswer: 2,
      explanation: 'Blocking a cooperative thread removes it from the pool. If the callback needs one of those threads to run, nothing can make progress. Bridge callbacks with withCheckedContinuation instead.'
    },
    {
      id: 'ccq13',
      question: 'A callback fires twice and your withCheckedContinuation code calls continuation.resume(returning:) both times. What happens?',
      options: ['The second value overwrites the first', 'A runtime trap on the second resume', 'The second resume is silently ignored', 'The awaiting task receives an array of both values'],
      correctAnswer: 1,
      explanation: 'A continuation must be resumed exactly once. The checked variant detects a double resume and crashes deliberately; the unsafe variant would be undefined behavior. Guard the callback so it resumes only once.'
    },
    {
      id: 'ccq14',
      question: 'Under Swift 6 strict concurrency, you capture a non-Sendable class instance inside Task.detached { }. What happens?',
      options: ['It works but with a runtime warning', 'The instance is copied', 'The Task runs on the main actor to stay safe', 'Compile error: the value is not Sendable'],
      correctAnswer: 3,
      explanation: 'Detached tasks take a @Sendable closure, so every capture must be Sendable. The compiler rejects the capture. Fix by making the type Sendable, moving it into an actor, or passing only the data you need.'
    },
    {
      id: 'ccq15',
      question: 'Which of these is a race condition but NOT a data race?',
      options: ['Two threads incrementing a plain Int with no lock', 'Two actor methods interleaving at an await so a stale check is acted on', 'Reading a let constant from two threads', 'Two tasks appending to the same array without synchronization'],
      correctAnswer: 1,
      explanation: 'Actor isolation guarantees no simultaneous memory access, so there is no data race — but the logic can still be wrong because the state changed across a suspension point. Options 1 and 4 are data races; option 3 is safe.'
    },
    {
      id: 'ccq16',
      question: 'Inside a @MainActor-isolated method you write Task { updateUI() }. Where does the Task body run?',
      options: ['On the main actor — Task inherits the caller\'s actor context', 'On a background thread of the cooperative pool', 'On a new dedicated thread', 'It is undefined'],
      correctAnswer: 0,
      explanation: 'Task { } inherits the current actor isolation, priority, and task-locals. Only Task.detached drops that context, which is why UI updates inside a plain Task from a view or view model are safe.'
    },
    {
      id: 'ccq17',
      question: 'func load() async -> A { async let a = fetchA(); async let b = fetchB(); return await a } — b is never awaited. What happens to it?',
      options: ['It keeps running in the background after load() returns', 'Compile error: every async let must be awaited', 'It is cancelled and awaited implicitly when the scope exits', 'It is promoted to a detached task'],
      correctAnswer: 2,
      explanation: 'async let creates a child task bound to the scope. Structured concurrency guarantees the child does not outlive its parent, so on scope exit Swift cancels it and waits for it to finish.'
    },
    {
      id: 'ccq18',
      question: 'Three legacy completion-handler network calls must all finish before you refresh the UI. Which GCD tool fits?',
      options: ['DispatchSemaphore on the main queue', 'DispatchGroup with enter/leave and notify', 'A serial DispatchQueue', 'DispatchQueue.main.asyncAfter'],
      correctAnswer: 1,
      explanation: 'enter() before each call, leave() in each completion, and group.notify(queue: .main) fires once all three have left. A semaphore would block, and a serial queue would only order the starts, not wait for completions.'
    },
    {
      id: 'ccq19',
      question: 'A long-running Task is cancelled with task.cancel() but its body never checks Task.isCancelled or calls checkCancellation. What happens?',
      options: ['It is killed immediately', 'It throws CancellationError at the next await', 'It pauses until resumed', 'It keeps running to completion'],
      correctAnswer: 3,
      explanation: 'Cancellation is cooperative — it only sets a flag. Library calls like Task.sleep and URLSession do check it and throw, but your own loops must check explicitly or the work continues.'
    },
    {
      id: 'ccq20',
      question: 'Which statement is true about the code that runs after an await returns?',
      options: ['It always runs on the same thread it suspended on', 'It runs on the main thread', 'It may run on a different thread, and other code may have run in between', 'It runs before any other task can execute'],
      correctAnswer: 2,
      explanation: 'A suspension releases the thread. Resumption is scheduled on whatever thread the executor chooses (unless actor-isolated), and any amount of other work can have happened. Never rely on thread identity or unchanged state across an await.'
    }
  ]
};

// =============================================================================
// 5. ARCHITECTURE
// =============================================================================
const architecture: iOSCategory = {
  id: 'ios-architecture',
  name: 'Architecture',
  slug: 'architecture',
  description: 'MVC, MVVM, Clean Architecture, and dependency injection',
  icon: 'construct-outline',
  color: '#AF52DE',
  colorDark: '#8B42B2',
  premium: true,

  learnContent: [
    {
      title: 'MVC (Model-View-Controller)',
      content: `MVC is Apple's traditional architecture pattern for iOS apps.

**Components:**

1. **Model**: Data and business logic
   - Structs, classes, CoreData entities
   - No UI code

2. **View**: Visual elements
   - UIView, UIControl, storyboards
   - No business logic

3. **Controller**: Mediator
   - UIViewController
   - Connects model and view
   - Handles user input

**Problems with MVC:**
- "Massive View Controller"
- Controllers become too large
- Hard to test controllers
- Tight coupling

**When to Use:**
- Simple apps
- Apple's default pattern
- Learning iOS development`,
      codeExample: `// Model
struct User {
    let id: String
    var name: String
    var email: String
}

// View Controller (often too much responsibility)
class UserViewController: UIViewController {
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var emailLabel: UILabel!

    var user: User? // controller also holds the model state

    override func viewDidLoad() {
        super.viewDidLoad()
        loadUser()
    }

    func loadUser() {
        // Networking code in controller (not ideal)
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data = data else { return }
            self.user = try? JSONDecoder().decode(User.self, from: data)
            DispatchQueue.main.async {
                self.updateUI() // UI work must be on main thread
            }
        }.resume()
    }

    func updateUI() {
        // View logic also lives in the controller
        nameLabel.text = user?.name
        emailLabel.text = user?.email
    }

    @IBAction func editTapped() {
        // Navigation, validation, all in controller
    }
}`
    },
    {
      title: 'MVVM (Model-View-ViewModel)',
      content: `MVVM separates presentation logic into a ViewModel, making code more testable.

**Components:**

1. **Model**: Same as MVC - data and business logic

2. **View**: UIViewController + UIViews
   - Binds to ViewModel
   - No business logic

3. **ViewModel**: Presentation logic
   - Transforms model for display
   - Handles user actions
   - No UIKit imports

**Benefits:**
- Testable ViewModels
- Smaller ViewControllers
- Clear separation
- Works great with SwiftUI/Combine

**Binding Options:**
- Closures
- Combine Publishers
- @Published + ObservableObject`,
      codeExample: `// Model
struct User {
    let id: String
    var name: String
    var email: String
}

// ViewModel (no UIKit!)
class UserViewModel: ObservableObject {
    // @Published state the view binds to
    @Published var displayName: String = ""
    @Published var displayEmail: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let userService: UserServiceProtocol

    // Injected service makes the ViewModel testable
    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    func loadUser(id: String) async {
        isLoading = true
        errorMessage = nil

        do {
            // Transform the model into display-ready values
            let user = try await userService.fetchUser(id: id)
            displayName = user.name
            displayEmail = user.email
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// View (UIKit)
class UserViewController: UIViewController {
    private let viewModel = UserViewModel()
    private var cancellables = Set<AnyCancellable>()

    override func viewDidLoad() {
        super.viewDidLoad()
        bindViewModel()
        Task { await viewModel.loadUser(id: "123") }
    }

    func bindViewModel() {
        // Combine: subscribe to ViewModel changes, update UI
        viewModel.$displayName
            .receive(on: DispatchQueue.main)
            .sink { [weak self] name in
                self?.nameLabel.text = name
            }
            .store(in: &cancellables) // keep subscription alive
    }
}

// SwiftUI (even simpler)
struct UserView: View {
    @StateObject private var viewModel = UserViewModel()

    var body: some View {
        VStack {
            Text(viewModel.displayName)
            Text(viewModel.displayEmail)
        }
        .task { await viewModel.loadUser(id: "123") }
    }
}`
    },
    {
      title: 'Clean Architecture',
      content: `Clean Architecture organizes code into layers with clear boundaries and dependency rules.

**Layers (outside → inside):**

1. **Presentation**: UI, ViewModels
2. **Domain**: Business logic, use cases, entities
3. **Data**: Repositories, data sources, APIs

**Dependency Rule:**
Inner layers don't know about outer layers. Dependencies point inward.

**Key Components:**
- **Entities**: Core business objects
- **Use Cases**: Application-specific business rules
- **Repositories**: Abstract data access
- **Data Sources**: Concrete implementations

**Benefits:**
- Highly testable
- Framework independent
- Flexible to change`,
      codeExample: `// Domain Layer - Entity
struct User {
    let id: String
    var name: String
    var email: String
}

// Domain Layer - Repository Protocol
protocol UserRepository {
    func getUser(id: String) async throws -> User
    func saveUser(_ user: User) async throws
}

// Domain Layer - Use Case
class GetUserUseCase {
    private let repository: UserRepository

    init(repository: UserRepository) {
        self.repository = repository
    }

    func execute(userId: String) async throws -> User {
        // Business logic here
        let user = try await repository.getUser(id: userId)
        return user
    }
}

// Data Layer - Repository Implementation
class UserRepositoryImpl: UserRepository {
    private let remoteDataSource: UserRemoteDataSource
    private let localDataSource: UserLocalDataSource

    func getUser(id: String) async throws -> User {
        // Try cache first, fallback to remote
        if let cached = try? await localDataSource.getUser(id: id) {
            return cached
        }
        let user = try await remoteDataSource.fetchUser(id: id)
        try await localDataSource.saveUser(user)
        return user
    }
}

// Presentation Layer - ViewModel
class UserViewModel {
    private let getUserUseCase: GetUserUseCase

    init(getUserUseCase: GetUserUseCase) {
        self.getUserUseCase = getUserUseCase
    }

    func loadUser(id: String) async {
        let user = try? await getUserUseCase.execute(userId: id)
        // Update UI state
    }
}`
    },
    {
      title: 'Dependency Injection',
      content: `Dependency Injection (DI) provides dependencies to objects rather than having them create dependencies themselves.

**Types of DI:**

1. **Constructor Injection**: Pass dependencies in init
2. **Property Injection**: Set via property
3. **Method Injection**: Pass as method parameter

**Benefits:**
- Testability (inject mocks)
- Flexibility (swap implementations)
- Loose coupling
- Clear dependencies

**DI Containers:**
Libraries like Swinject, Resolver, or Factory can manage complex dependency graphs.

**Protocol-Based DI:**
Define protocols for dependencies, inject conforming types.`,
      codeExample: `// Protocol defining the dependency
protocol NetworkServiceProtocol {
    func fetch<T: Decodable>(url: URL) async throws -> T
}

// Real implementation
class NetworkService: NetworkServiceProtocol {
    func fetch<T: Decodable>(url: URL) async throws -> T {
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// Mock for testing
class MockNetworkService: NetworkServiceProtocol {
    var mockData: Any?   // canned response for tests
    var mockError: Error?

    func fetch<T: Decodable>(url: URL) async throws -> T {
        if let error = mockError { throw error }
        return mockData as! T
    }
}

// Constructor injection
class UserRepository {
    private let networkService: NetworkServiceProtocol

    // Default arg keeps call sites simple; tests inject mocks
    init(networkService: NetworkServiceProtocol = NetworkService()) {
        self.networkService = networkService
    }

    func getUser(id: String) async throws -> User {
        let url = URL(string: "https://api.example.com/users/\\(id)")!
        return try await networkService.fetch(url: url)
    }
}

// Using in tests
class UserRepositoryTests: XCTestCase {
    func testGetUser() async throws {
        let mock = MockNetworkService()
        mock.mockData = User(id: "1", name: "Test", email: "test@example.com")

        // Inject the mock - no real network call happens
        let repo = UserRepository(networkService: mock)
        let user = try await repo.getUser(id: "1")

        XCTAssertEqual(user.name, "Test")
    }
}

// DI Container example
class DependencyContainer {
    static let shared = DependencyContainer()

    // lazy: built once, on first use; wires the graph
    lazy var networkService: NetworkServiceProtocol = NetworkService()
    lazy var userRepository: UserRepository = UserRepository(
        networkService: networkService
    )
}`
    },
    {
      title: 'Coordinator Pattern',
      content: `The Coordinator pattern extracts navigation logic from view controllers, making them simpler and more reusable.

**Components:**

1. **Coordinator Protocol**: Defines start method
2. **AppCoordinator**: Root coordinator
3. **Child Coordinators**: For flows (auth, settings)
4. **View Controllers**: Delegate navigation to coordinator

**Benefits:**
- View controllers don't know about each other
- Reusable view controllers
- Centralized navigation logic
- Easy to change flows

**Flow:**
1. Coordinator creates view controller
2. Sets itself as delegate
3. VC calls delegate methods for navigation
4. Coordinator pushes/presents next VC`,
      codeExample: `// Coordinator protocol
protocol Coordinator: AnyObject {
    var childCoordinators: [Coordinator] { get set } // keep alive
    var navigationController: UINavigationController { get set }

    func start() // kicks off the flow's first screen
}

// App Coordinator
class AppCoordinator: Coordinator {
    var childCoordinators: [Coordinator] = []
    var navigationController: UINavigationController

    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }

    func start() {
        // Routing decision lives here, not in a VC
        if isLoggedIn {
            showMain()
        } else {
            showAuth()
        }
    }

    func showAuth() {
        // Hand the auth flow to a child coordinator
        let authCoordinator = AuthCoordinator(
            navigationController: navigationController
        )
        authCoordinator.delegate = self
        childCoordinators.append(authCoordinator) // retain it
        authCoordinator.start()
    }

    func showMain() {
        let mainVC = MainViewController()
        mainVC.coordinator = self // VC delegates navigation back
        navigationController.setViewControllers([mainVC], animated: true)
    }
}

// Auth Coordinator
protocol AuthCoordinatorDelegate: AnyObject {
    func authDidComplete()
}

class AuthCoordinator: Coordinator {
    weak var delegate: AuthCoordinatorDelegate? // weak: no cycle
    var childCoordinators: [Coordinator] = []
    var navigationController: UINavigationController

    func start() {
        let loginVC = LoginViewController()
        loginVC.coordinator = self
        navigationController.pushViewController(loginVC, animated: true)
    }

    func showRegister() {
        let registerVC = RegisterViewController()
        registerVC.coordinator = self
        navigationController.pushViewController(registerVC, animated: true)
    }

    func didLogin() {
        // Tell the parent coordinator the flow finished
        delegate?.authDidComplete()
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'MVVM Architecture',
      description: 'Separation of concerns in MVVM',
      nodes: [
        { id: 'view', label: 'View\n(UI)', x: 60, y: 80, type: 'secondary' },
        { id: 'vm', label: 'ViewModel\n(Logic)', x: 160, y: 80, type: 'primary' },
        { id: 'model', label: 'Model\n(Data)', x: 260, y: 80, type: 'info' },
        { id: 'binding', label: 'Data Binding', x: 110, y: 170, type: 'warning' }
      ],
      edges: [
        { from: 'view', to: 'vm', label: 'user actions' },
        { from: 'vm', to: 'view', label: 'state updates' },
        { from: 'vm', to: 'model', label: 'reads/writes' }
      ]
    },
    {
      title: 'Clean Architecture Layers',
      description: 'Dependencies point inward',
      nodes: [
        { id: 'ui', label: 'Presentation\nUI + ViewModel', x: 100, y: 50, type: 'secondary' },
        { id: 'domain', label: 'Domain\nUse Cases', x: 250, y: 50, type: 'primary' },
        { id: 'data', label: 'Data\nRepos + APIs', x: 100, y: 150, type: 'info' },
        { id: 'deps', label: 'Deps point\ninward', x: 250, y: 150, type: 'warning' }
      ],
      edges: [
        { from: 'ui', to: 'domain' },
        { from: 'data', to: 'domain' }
      ]
    }
  ],

  flashcards: [
    { id: 'ar1', front: 'What is the main problem with MVC on iOS?', back: '"Massive View Controller" - controllers take on too many responsibilities (networking, logic, navigation) and become hard to test and maintain.' },
    { id: 'ar2', front: 'What is the role of the ViewModel in MVVM?', back: 'The ViewModel contains presentation logic, transforms model data for display, handles user actions, and has no UIKit imports. It\'s easily testable.' },
    { id: 'ar3', front: 'What is the Dependency Rule in Clean Architecture?', back: 'Dependencies can only point inward. Inner layers (domain) don\'t know about outer layers (UI, data). This keeps business logic independent.' },
    { id: 'ar4', front: 'What is a Use Case in Clean Architecture?', back: 'A Use Case encapsulates a single piece of business logic. It coordinates entities and calls repositories. Each use case does one thing.' },
    { id: 'ar5', front: 'What is Constructor Injection?', back: 'Passing dependencies through the initializer. Example: init(service: ServiceProtocol). This makes dependencies explicit and enables testing.' },
    { id: 'ar6', front: 'What is the Coordinator pattern for?', back: 'Extracting navigation logic from view controllers. Coordinators handle the flow between screens, making view controllers reusable.' },
    { id: 'ar7', front: 'Why use protocols for dependencies?', back: 'Protocols allow swapping implementations (real vs mock). This enables unit testing and flexibility to change implementations.' },
    { id: 'ar8', front: 'What layer contains business logic in Clean Architecture?', back: 'The Domain layer contains business logic, entities, and use cases. It has no dependencies on other layers.' },
    { id: 'ar9', front: 'What is a Repository pattern?', back: 'An abstraction over data sources. The repository provides a clean API to the domain layer, hiding whether data comes from network, database, or cache.' },
    { id: 'ar10', front: 'How do you bind a ViewModel to a View?', back: 'Use Combine (@Published, Publishers), closures, or KVO. In SwiftUI, @StateObject/@ObservedObject automatically bind @Published properties.' },
    { id: 'ar11', front: 'What is a DI Container?', back: 'A dependency injection container manages object creation and their dependencies. It resolves the full dependency graph automatically.' },
    { id: 'ar12', front: 'What is Property Injection?', back: 'Setting dependencies via properties after initialization. Less preferred than constructor injection as dependencies aren\'t explicit in the init.' },
    { id: 'ar13', front: 'What makes ViewModels testable?', back: 'No UIKit dependencies, pure logic, injectable dependencies. You can test input/output without a view.' },
    { id: 'ar14', front: 'What is a Composition Root?', back: 'The single place — the App struct, SceneDelegate, or an AppContainer — where the whole object graph is wired: concrete services are created, injected into view models and coordinators, and handed out. Everything below it receives dependencies rather than creating them, so swapping an implementation (or a whole test graph) happens in one file.' },
    { id: 'ar15', front: 'What is an Entity in Clean Architecture?', back: 'Core business objects with business rules. They\'re independent of frameworks and the outermost layers.' },
    { id: 'ar16', front: 'How does MVVM differ from MVC?', back: 'MVVM adds a ViewModel between the View and the Model. The View binds to observable properties on the ViewModel, so the View has no business logic and the ViewModel has no UI dependencies — easier to test.' },
    { id: 'ar17', front: 'What does VIPER add over MVVM?', back: 'Two extra roles: an Interactor (business logic and data) and a Router (navigation). Each screen has more files but each file has a sharper responsibility — common in large UIKit codebases.' },
    { id: 'ar18', front: 'What is dependency injection?', back: 'Passing collaborators in from outside instead of constructing them inside. Lets tests substitute fakes and decouples your type from the concrete implementations it talks to.' },
    { id: 'ar19', front: 'What is unidirectional data flow?', back: 'State flows down to views, and views send actions up to a store or reducer that produces the next state. There is one source of truth and one place where state changes, which makes features predictable, easy to log, and easy to test (Redux, TCA, and much of SwiftUI follow this).' },
    { id: 'ar20', front: 'When would you reach for The Composable Architecture (TCA)?', back: 'When you want a unidirectional store, reducer-style updates, and explicit effects in a feature you\'ll grow over time. The learning curve and boilerplate aren\'t worth it for a tiny screen.' },
    { id: 'ar21', front: 'How do you handle deep links cleanly?', back: 'Parse the URL or notification payload into a typed Route value in one parser, then hand it to the root coordinator or router, which knows how to build the screen stack for that route (switch tab, pop to root, push detail). Routes are plain data, so parsing and navigation decisions are unit-testable and the same routes can drive in-app navigation.' },
    { id: 'ar22', front: 'How do you keep feature flags from spreading through a codebase?', back: 'Put them behind a protocol (e.g. FeatureFlags) injected like any other dependency, and branch on a flag at one boundary — the composition root or a single factory — rather than scattering `if flags.newCheckout` through views. Back it with remote config plus local overrides for QA, and delete the flag and the old path once the rollout completes.' },
    { id: 'ar23', front: 'When is "no architecture" the right answer?', back: 'Prototypes, demos, and screens that will never grow. Patterns trade up-front complexity for testability and clear seams — not always worth the cost on a 50-line throwaway.' },
    { id: 'ar24', front: 'Who keeps a Coordinator alive?', back: 'Nothing in UIKit holds it, so you must. The app or parent coordinator keeps a strong array of child coordinators; each child holds its parent weakly and is removed from the array when its flow finishes — otherwise coordinators leak or vanish mid-flow.' },
    { id: 'ar25', front: 'What is wrong with reaching for Singleton.shared inside a class?', back: 'It hides a dependency: nothing in the type\'s interface says it needs the singleton, and tests can\'t substitute it. Keep the single lifetime if you like, but pass the instance in through the initializer behind a protocol.' },
    { id: 'ar26', front: 'Why modularize an app into Swift packages or frameworks?', back: 'Enforced boundaries (a feature can\'t import what it doesn\'t declare), faster incremental builds, parallel team ownership, and testable seams. A common split is an interface module plus an implementation module so features depend on abstractions only.' },
    { id: 'ar27', front: 'How does MVP differ from MVVM?', back: 'In MVP the Presenter holds a weak reference to the View (behind a protocol) and imperatively tells it what to display. In MVVM the ViewModel knows nothing about the view; it exposes observable state and the view binds to it.' },
    { id: 'ar28', front: 'What does "single source of truth" mean in practice?', back: 'Every piece of state lives in exactly one place and everything else derives from it. Two screens that each cache a copy of the same user will drift; one store (or one @Observable model) shared by both never can.' },
    { id: 'ar29', front: 'What belongs in a ViewModel versus a Use Case?', back: 'Use Case: business rules reusable across screens (can this order be cancelled?). ViewModel: presentation state for one screen — loading/error flags, formatted strings, which button is enabled. If a rule would be duplicated by a second screen, it is not presentation logic.' },
    { id: 'ar30', front: 'Compare NotificationCenter, KVO, and Combine for observation.', back: 'NotificationCenter is global and stringly typed — easy but hard to trace. KVO needs NSObject subclasses and @objc dynamic properties. Combine (and the Observation framework) is typed and composable with explicit lifetimes via AnyCancellable. Prefer the narrowest tool that reaches the observer.' }
  ],

  quizQuestions: [
    {
      id: 'arq1',
      question: 'What is the "Massive View Controller" problem?',
      options: ['Controllers use too much memory', 'Controllers have too many responsibilities', 'Controllers are too slow', 'Controllers can\'t be instantiated'],
      correctAnswer: 1,
      explanation: 'In MVC, controllers often handle networking, logic, navigation, and UI - too many responsibilities making them hard to test and maintain.'
    },
    {
      id: 'arq2',
      question: 'What should a ViewModel NOT contain in MVVM?',
      options: ['Business logic', '@Published properties', 'UIKit imports', 'Data transformation'],
      correctAnswer: 2,
      explanation: 'ViewModels should not import UIKit. They contain presentation logic but are framework-independent for testability.'
    },
    {
      id: 'arq3',
      question: 'Which direction do dependencies point in Clean Architecture?',
      options: ['Outward', 'Inward', 'Both directions', 'No dependencies allowed'],
      correctAnswer: 1,
      explanation: 'Dependencies point inward. Outer layers depend on inner layers. Domain layer has no dependencies.'
    },
    {
      id: 'arq4',
      question: 'What is Constructor Injection?',
      options: ['Creating objects with new', 'Passing dependencies in init', 'Using singletons', 'Automatic instantiation'],
      correctAnswer: 1,
      explanation: 'Constructor injection passes dependencies through the initializer, making them explicit and enabling mock injection for testing.'
    },
    {
      id: 'arq5',
      question: 'What does the Coordinator pattern manage?',
      options: ['Memory', 'Navigation flow', 'Network requests', 'Database access'],
      correctAnswer: 1,
      explanation: 'Coordinators manage navigation between screens, extracting this logic from view controllers.'
    },
    {
      id: 'arq6',
      question: 'Which layer contains Use Cases in Clean Architecture?',
      options: ['Presentation', 'Domain', 'Data', 'Infrastructure'],
      correctAnswer: 1,
      explanation: 'Use Cases are part of the Domain layer. They contain application-specific business rules.'
    },
    {
      id: 'arq7',
      question: 'Why use protocols for dependencies?',
      options: ['Required by Swift', 'Enable mock injection', 'Faster compilation', 'Memory efficiency'],
      correctAnswer: 1,
      explanation: 'Protocols allow different implementations (real, mock) to be injected, enabling testing and flexibility.'
    },
    {
      id: 'arq8',
      question: 'What is a Repository?',
      options: ['Git storage', 'Data access abstraction', 'UI component', 'Network layer'],
      correctAnswer: 1,
      explanation: 'A Repository abstracts data access, providing a clean API while hiding the actual data source (network, DB, cache).'
    },
    {
      id: 'arq9',
      question: 'In MVVM, what observes the ViewModel?',
      options: ['Model', 'Controller', 'View', 'Repository'],
      correctAnswer: 2,
      explanation: 'The View observes the ViewModel\'s @Published properties and updates when they change.'
    },
    {
      id: 'arq10',
      question: 'What is a benefit of dependency injection?',
      options: ['Faster execution', 'Less code', 'Improved testability', 'Automatic UI updates'],
      correctAnswer: 2,
      explanation: 'DI allows injecting mock dependencies in tests, making code testable without real services.'
    },
    {
      id: 'arq11',
      question: 'How should a parent coordinator and its child coordinators reference each other?',
      options: ['Parent holds children strongly; child holds parent weakly', 'Parent holds children weakly; child holds parent strongly', 'Both hold each other strongly', 'Both hold each other weakly'],
      correctAnswer: 0,
      explanation: 'Someone must own the child or it deallocates immediately, so the parent keeps a strong array. The back-reference must be weak or you get a retain cycle and the whole flow leaks.'
    },
    {
      id: 'arq12',
      question: 'Your Domain package suddenly needs `import UIKit` to build. Which principle has been violated?',
      options: ['Single Responsibility', 'Liskov Substitution', 'The Dependency Rule — inner layers must not depend on outer ones', 'Interface Segregation'],
      correctAnswer: 2,
      explanation: 'Business logic sits at the center and must be framework-agnostic. Needing UIKit means a UI concern leaked inward. Move the formatting or color choice out to the presentation layer.'
    },
    {
      id: 'arq13',
      question: 'A ViewModel imports UIKit to return a UIColor for a status. What is the practical downside?',
      options: ['UIColor is not thread-safe', 'The ViewModel becomes harder to unit test and reuse in SwiftUI or on other platforms', 'Colors cannot be stored in properties', 'It forces the view to become an ObservableObject'],
      correctAnswer: 1,
      explanation: 'Coupling to a UI framework drags UIKit into your test target and ties the ViewModel to one rendering technology. Expose a semantic value (e.g. an enum) and let the view map it to a color.'
    },
    {
      id: 'arq14',
      question: 'In MVP, how does the Presenter refer to the View?',
      options: ['It does not reference the view at all', 'Through a strong reference to the concrete UIViewController', 'Through the app delegate', 'Through a weak reference to a view protocol'],
      correctAnswer: 3,
      explanation: 'The presenter drives the view directly, so it needs a reference, but behind a protocol (for testing) and weak (the view controller owns the presenter). MVVM is the pattern where the view model has no view reference.'
    },
    {
      id: 'arq15',
      question: 'In a unidirectional data flow architecture, how does a view change application state?',
      options: ['It sends an action to the store, which produces the new state', 'It mutates the state property directly', 'It calls a setter on the parent view', 'It posts a notification that other views observe'],
      correctAnswer: 0,
      explanation: 'State flows down, actions flow up. Only the reducer/store mutates state, which keeps every change predictable, loggable, and testable in isolation.'
    },
    {
      id: 'arq16',
      question: 'Two tabs show the same user profile and sometimes display different names after an edit. What is the root cause?',
      options: ['Missing @MainActor', 'The view models are not using Combine', 'Multiple sources of truth — each tab caches its own copy', 'The coordinator is not shared'],
      correctAnswer: 2,
      explanation: 'When the same data is stored in two places, one of them will be stale. Give both screens the same store or observable model so an edit is visible everywhere at once.'
    },
    {
      id: 'arq17',
      question: 'Twenty view models call URLSession.shared directly. What is the smallest refactor that makes them unit-testable?',
      options: ['Wrap each call in a Task', 'Inject a protocol (e.g. NetworkClient) that URLSession is adapted to and tests can fake', 'Move the calls into the AppDelegate', 'Switch to Combine publishers'],
      correctAnswer: 1,
      explanation: 'Depending on an abstraction lets tests substitute a fake that returns canned responses instantly. Tasks or Combine change the async style but leave the hard dependency on the real network.'
    },
    {
      id: 'arq18',
      question: 'Where should the code that turns a Date into "2 hours ago" for the UI live?',
      options: ['In the Entity', 'In the Repository', 'In the Use Case', 'In the ViewModel or a presentation formatter'],
      correctAnswer: 3,
      explanation: 'Relative-time strings are presentation, not business rules. Keeping them in the ViewModel keeps entities and use cases free of locale and display concerns, and the formatting is still unit-testable.'
    },
    {
      id: 'arq19',
      question: 'What is the main drawback of the Service Locator pattern compared with constructor injection?',
      options: ['Dependencies are hidden and missing registrations only fail at runtime', 'It cannot return protocol types', 'It requires third-party libraries', 'It only works with singletons'],
      correctAnswer: 0,
      explanation: 'With a locator, a type\'s real dependencies are invisible from its initializer and resolution errors surface as crashes at runtime. Constructor injection makes them explicit and compile-checked.'
    },
    {
      id: 'arq20',
      question: 'Which architecture introduces an Interactor and a Router as distinct roles?',
      options: ['MVVM', 'MVC', 'VIPER', 'TCA'],
      correctAnswer: 2,
      explanation: 'VIPER splits a screen into View, Interactor (business logic), Presenter, Entity, and Router (navigation). MVVM has none of these extra roles, and TCA uses reducers and stores instead.'
    }
  ]
};

// =============================================================================
// 6. DATA & NETWORKING
// =============================================================================
const dataNetworking: iOSCategory = {
  id: 'ios-data-networking',
  name: 'Data & Networking',
  slug: 'data-networking',
  description: 'Core Data, URLSession, Codable, and persistent storage',
  icon: 'cloud-download-outline',
  color: '#FF9500',
  colorDark: '#CC7700',
  premium: true,

  learnContent: [
    {
      title: 'URLSession Basics',
      content: `URLSession is Apple's networking API for HTTP requests.

**Components:**
- **URLSession**: Manages requests
- **URLSessionTask**: Individual request (data, download, upload)
- **URLRequest**: Request configuration
- **URLResponse**: Response metadata

**Task Types:**
1. **DataTask**: In-memory data (APIs)
2. **DownloadTask**: File downloads
3. **UploadTask**: File uploads
4. **WebSocketTask**: Real-time communication

**Session Configurations:**
- .default: Disk caching, credentials
- .ephemeral: No persistence (private browsing)
- .background: Continues when app suspended`,
      codeExample: `// Simple GET request with async/await
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw NetworkError.invalidResponse
    }

    return try JSONDecoder().decode(User.self, from: data)
}

// POST request with body
func createUser(_ user: User) async throws -> User {
    var request = URLRequest(url: URL(string: "https://api.example.com/users")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(user)

    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(User.self, from: data)
}

// Custom session configuration
let config = URLSessionConfiguration.default
config.timeoutIntervalForRequest = 30
config.httpAdditionalHeaders = ["Authorization": "Bearer \\(token)"]

let session = URLSession(configuration: config)

// Download with progress
let task = URLSession.shared.downloadTask(with: url) { localURL, response, error in
    guard let localURL = localURL else { return }
    // Move file from temp location
    try? FileManager.default.moveItem(at: localURL, to: destinationURL)
}`
    },
    {
      title: 'Codable (JSON Encoding/Decoding)',
      content: `Codable is Swift's protocol for encoding/decoding data, primarily JSON.

**Protocols:**
- **Encodable**: Convert to external representation
- **Decodable**: Create from external representation
- **Codable**: Both (typealias)

**Automatic Synthesis:**
Swift auto-generates implementations when all properties are Codable.

**Custom Keys:**
Use CodingKeys enum to map JSON keys to property names.

**Custom Decoding:**
Implement init(from decoder:) for complex transformations.`,
      codeExample: `// Basic Codable struct
struct User: Codable {
    let id: Int
    let name: String
    let email: String
}

// Custom keys
struct Post: Codable {
    let id: Int
    let title: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case createdAt = "created_at"  // Map snake_case
    }
}

// Custom decoding
struct Product: Codable {
    let id: Int
    let name: String
    let price: Decimal

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)

        // Handle price as string or number
        if let priceString = try? container.decode(String.self, forKey: .price) {
            price = Decimal(string: priceString) ?? 0
        } else {
            price = try container.decode(Decimal.self, forKey: .price)
        }
    }
}

// Decoder configuration
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
decoder.dateDecodingStrategy = .iso8601

let encoder = JSONEncoder()
encoder.keyEncodingStrategy = .convertToSnakeCase
encoder.dateEncodingStrategy = .iso8601
encoder.outputFormatting = .prettyPrinted

// Usage
let json = Data(...)
let user = try decoder.decode(User.self, from: json)
let jsonData = try encoder.encode(user)`
    },
    {
      title: 'Core Data',
      content: `Core Data is Apple's framework for persistent storage with an object graph.

**Components:**
- **NSManagedObjectModel**: Data schema
- **NSPersistentStoreCoordinator**: Manages persistent stores
- **NSManagedObjectContext**: Object manipulation
- **NSPersistentContainer**: Convenience wrapper

**Key Concepts:**
- Entities = Tables
- Attributes = Columns
- Relationships = Foreign keys
- Fetch Requests = Queries

**Thread Safety:**
Each context is tied to a thread. Use perform/performAndWait for safety.`,
      codeExample: `// Setting up Core Data stack
class CoreDataStack {
    static let shared = CoreDataStack()

    // Container bundles model, coordinator, and context
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "MyApp")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed: \\(error)")
            }
        }
        return container
    }()

    // viewContext: main-thread context for UI work
    var context: NSManagedObjectContext {
        persistentContainer.viewContext
    }

    func save() {
        // Skip disk write if nothing changed
        guard context.hasChanges else { return }
        try? context.save()
    }
}

// Entity class (generated or manual)
@objc(Task)
class Task: NSManagedObject {
    @NSManaged var id: UUID
    @NSManaged var title: String
    @NSManaged var isCompleted: Bool
    @NSManaged var createdAt: Date
}

// CRUD operations
class TaskRepository {
    let context = CoreDataStack.shared.context

    func create(title: String) -> Task {
        // New objects are inserted into a context, then saved
        let task = Task(context: context)
        task.id = UUID()
        task.title = title
        task.isCompleted = false
        task.createdAt = Date()
        CoreDataStack.shared.save()
        return task
    }

    func fetchAll() -> [Task] {
        // Fetch request = query; sort newest first
        let request: NSFetchRequest<Task> = Task.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        return (try? context.fetch(request)) ?? []
    }

    func delete(_ task: Task) {
        context.delete(task) // deletion persists only after save
        CoreDataStack.shared.save()
    }
}

// Fetch with predicate
let request: NSFetchRequest<Task> = Task.fetchRequest()
// Predicate filters like a SQL WHERE clause
request.predicate = NSPredicate(format: "isCompleted == %@", NSNumber(value: false))
request.fetchLimit = 10`
    },
    {
      title: 'UserDefaults and Keychain',
      content: `UserDefaults stores simple preferences. Keychain stores sensitive data securely.

**UserDefaults:**
- Simple key-value storage
- Persists across launches
- NOT for sensitive data
- Synchronizes automatically

**Keychain:**
- Encrypted storage
- For passwords, tokens, keys
- Survives app reinstall
- Access control options

**@AppStorage (SwiftUI):**
Property wrapper for UserDefaults.`,
      codeExample: `// UserDefaults
class SettingsManager {
    private let defaults = UserDefaults.standard

    // Computed properties wrap raw key-value access
    var username: String? {
        get { defaults.string(forKey: "username") }
        set { defaults.set(newValue, forKey: "username") }
    }

    var hasSeenOnboarding: Bool {
        get { defaults.bool(forKey: "hasSeenOnboarding") }
        set { defaults.set(newValue, forKey: "hasSeenOnboarding") }
    }

    var lastSyncDate: Date? {
        get { defaults.object(forKey: "lastSync") as? Date }
        set { defaults.set(newValue, forKey: "lastSync") }
    }
}

// SwiftUI @AppStorage
struct SettingsView: View {
    // Reads/writes UserDefaults and refreshes the view
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("fontSize") private var fontSize = 14.0

    var body: some View {
        Toggle("Dark Mode", isOn: $isDarkMode)
        Slider(value: $fontSize, in: 12...24)
    }
}

// Keychain (using Security framework)
class KeychainManager {
    static func save(key: String, data: Data) -> Bool {
        // Query dictionary describes the keychain item
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        // Delete any old value first, then add (no upsert API)
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    static func load(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true, // return the data itself
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        // nil on any failure (missing item, access denied)
        return status == errSecSuccess ? result as? Data : nil
    }
}`
    },
    {
      title: 'Building a Network Layer',
      content: `A well-designed network layer is reusable, testable, and handles errors gracefully.

**Key Components:**
1. **APIClient**: Makes requests
2. **Endpoint**: Defines requests
3. **NetworkError**: Custom errors
4. **Request/Response interceptors**: Auth, logging

**Design Principles:**
- Protocol-based for testing
- Async/await for modern Swift
- Proper error handling
- Retry logic for transient failures`,
      codeExample: `// Endpoint definition
// Each API route becomes a type conforming to this
protocol Endpoint {
    var baseURL: URL { get }
    var path: String { get }
    var method: HTTPMethod { get }
    var headers: [String: String]? { get }
    var body: Encodable? { get }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

// Network errors: typed cases callers can switch on
enum NetworkError: Error {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case noData
}

// API Client
// Protocol lets tests substitute a mock client
protocol APIClientProtocol {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

class APIClient: APIClientProtocol {
    private let session: URLSession
    private let decoder: JSONDecoder

    init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        // Build the URLRequest from the endpoint description
        var request = URLRequest(url: endpoint.baseURL.appendingPathComponent(endpoint.path))
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers

        // Encode body as JSON only when one is provided
        if let body = endpoint.body {
            request.httpBody = try JSONEncoder().encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        // Any non-2xx status becomes a typed error
        guard 200..<300 ~= httpResponse.statusCode else {
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            // Wrap so callers can tell decode failures apart
            throw NetworkError.decodingError(error)
        }
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'URLSession Architecture',
      description: 'Components of iOS networking',
      nodes: [
        { id: 'session', label: 'URLSession\nnetwork', x: 100, y: 50, type: 'primary' },
        { id: 'config', label: 'Config\ndefault/bg', x: 250, y: 50, type: 'secondary' },
        { id: 'data', label: 'DataTask\nmemory', x: 100, y: 150, type: 'info' },
        { id: 'download', label: 'Download\nfile', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'session', to: 'config' },
        { from: 'session', to: 'data' },
        { from: 'session', to: 'download' }
      ]
    },
    {
      title: 'Core Data Stack',
      description: 'Core Data components and relationships',
      nodes: [
        { id: 'container', label: 'Container\nPersistent', x: 100, y: 50, type: 'primary' },
        { id: 'context', label: 'Context\nscratchpad', x: 250, y: 50, type: 'secondary' },
        { id: 'coord', label: 'Coordinator\nstore', x: 100, y: 150, type: 'secondary' },
        { id: 'store', label: 'Store\nSQLite', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'container', to: 'context' },
        { from: 'container', to: 'coord' },
        { from: 'coord', to: 'store' }
      ]
    }
  ],

  flashcards: [
    { id: 'dn1', front: 'What is the difference between URLSession.shared and custom URLSession?', back: 'shared is a singleton with default configuration. Custom sessions allow setting timeout, headers, caching policy, and delegate for fine-grained control.' },
    { id: 'dn2', front: 'What is the purpose of Codable?', back: 'Codable is a protocol for encoding/decoding data (JSON, plist). Types conforming to Codable can be easily serialized and deserialized.' },
    { id: 'dn3', front: 'How do you handle custom JSON keys with Codable?', back: 'Use CodingKeys enum with String raw values to map JSON keys to property names. Example: case createdAt = "created_at"' },
    { id: 'dn4', front: 'What is NSManagedObjectContext?', back: 'The scratchpad for Core Data objects. Changes are made in a context and must be saved to persist. Each context is tied to a thread.' },
    { id: 'dn5', front: 'When should you use Keychain vs UserDefaults?', back: 'Keychain for sensitive data (passwords, tokens, keys) - encrypted and secure. UserDefaults for preferences and non-sensitive settings.' },
    { id: 'dn6', front: 'What is a fetch request in Core Data?', back: 'NSFetchRequest retrieves objects from persistent store. Can include predicate (filter), sort descriptors, and fetch limit.' },
    { id: 'dn7', front: 'What session configuration is used for background downloads?', back: '.background configuration. Allows downloads to continue when app is suspended. Requires identifier and delegate.' },
    { id: 'dn8', front: 'How do you decode snake_case JSON to camelCase properties?', back: 'Set decoder.keyDecodingStrategy = .convertFromSnakeCase. This automatically converts created_at to createdAt.' },
    { id: 'dn9', front: 'What is @AppStorage in SwiftUI?', back: 'Property wrapper that reads/writes to UserDefaults. Changes automatically update the view. Example: @AppStorage("key") var value = default' },
    { id: 'dn10', front: 'How do you handle optional JSON fields with Codable?', back: 'Make the property optional (Type?). Use decodeIfPresent for manual decoding. Missing keys result in nil, not errors.' },
    { id: 'dn11', front: 'What is an NSPersistentContainer?', back: 'Convenience class that encapsulates Core Data stack (model, coordinator, context). Simplifies setup with loadPersistentStores.' },
    { id: 'dn12', front: 'What is the thread rule for Core Data contexts?', back: 'Each context is tied to a thread/queue. Use perform or performAndWait to safely execute code on the context\'s queue.' },
    { id: 'dn13', front: 'What is URLSessionDataTask vs DownloadTask?', back: 'DataTask loads data into memory (for APIs). DownloadTask saves to file system (for large files, supports resume).' },
    { id: 'dn14', front: 'How do you save data securely in Keychain?', back: 'Use Security framework with SecItemAdd/SecItemCopyMatching. Store as kSecClassGenericPassword with account key.' },
    { id: 'dn15', front: 'What is an NSPredicate in Core Data?', back: 'A filter for fetch requests. Example: NSPredicate(format: "age > %d AND name CONTAINS %@", 18, "John")' },
    { id: 'dn16', front: 'What is URLProtocol used for?', back: 'Custom request handling — stubbing in tests, transparent caching, custom URL schemes. Register a subclass with a URLSessionConfiguration and you intercept matching requests.' },
    { id: 'dn17', front: 'What is NSFetchedResultsController?', back: 'A controller that runs a fetch request, keeps the results in sync as the context changes, and reports inserts, deletes, moves, and updates to a delegate so a table or collection view can animate them. It supports sections and a cache, and controller(_:didChangeContentWith:) hands you a diffable snapshot directly.' },
    { id: 'dn18', front: 'How does a background URLSession deliver a download if your app was terminated?', back: 'The system finishes the transfer out of process, relaunches your app in the background, and calls application(_:handleEventsForBackgroundURLSession:completionHandler:). You recreate the session with the same identifier so its delegate callbacks fire, then call the stored completion handler from urlSessionDidFinishEvents(forBackgroundURLSession:).' },
    { id: 'dn19', front: 'What are Core Data batch requests and what is their catch?', back: 'NSBatchInsertRequest, NSBatchUpdateRequest, and NSBatchDeleteRequest run directly against the persistent store, skipping managed objects entirely, so big imports and mass updates are fast and use little memory. The catch: no context sees the changes — merge them with NSManagedObjectContext.mergeChanges(fromRemoteContextSave:into:) or enable persistent history tracking.' },
    { id: 'dn20', front: 'When might you skip Core Data?', back: 'When migrations, threading rules, or the API\'s ceremony slow you down. Realm or SwiftData are simpler for many cases; raw SQLite gives full SQL control if you need it.' },
    { id: 'dn21', front: 'How does URLSession honour cache headers?', back: 'URLCache reads Cache-Control / ETag / Last-Modified automatically. Tune behaviour by configuring URLSessionConfiguration.urlCache and the request\'s cachePolicy.' },
    { id: 'dn22', front: 'How do you handle a 401 globally?', back: 'Wrap URLSession in a client (or use a URLSessionDelegate) that intercepts responses. On 401, refresh the token and retry the original request once before bubbling the error up.' },
    { id: 'dn23', front: 'What is App Transport Security?', back: 'iOS forbids plaintext HTTP and weak TLS by default. Exceptions require explicit entries under NSAppTransportSecurity in Info.plist — App Review pushes back on broad exemptions.' },
    { id: 'dn24', front: 'How do you decode polymorphic JSON such as {"type": "image", ...} / {"type": "text", ...}?', back: 'Model it as an enum with associated values and write a custom init(from:): decode the "type" discriminator first, then decode the matching payload into the right case. Codable cannot synthesize this for you.' },
    { id: 'dn25', front: 'What is the gotcha with decoding Date via Codable?', back: 'The default dateDecodingStrategy expects a Double (seconds since 2001), so ISO strings fail. Set .iso8601, .secondsSince1970, or .formatted(formatter). The built-in .iso8601 strategy does not accept fractional seconds — use a custom formatter for those.' },
    { id: 'dn26', front: 'How do you decode an array where one element may be malformed without failing the whole response?', back: 'Wrap elements in a `FailableDecodable<T>` whose init(from:) does `try? T(from: decoder)`, decode `[FailableDecodable<T>]`, then compactMap the values. Codable\'s default is all-or-nothing.' },
    { id: 'dn27', front: 'How do viewContext and a background context work together in Core Data?', back: 'viewContext is main-queue-bound and feeds the UI; newBackgroundContext() does imports and heavy writes. Set viewContext.automaticallyMergesChangesFromParent = true so background saves flow in, and pick a mergePolicy to resolve conflicts.' },
    { id: 'dn28', front: 'What does kSecAttrAccessible control on a Keychain item?', back: 'When the item can be read: .whenUnlocked (default), .afterFirstUnlock (needed for background work), and the ThisDeviceOnly variants that block backup/iCloud migration. Choose the most restrictive class that still works for your use case.' },
    { id: 'dn29', front: 'What is a Core Data lightweight migration?', back: 'Automatic migration between model versions for simple changes — adding optional attributes, renaming with a renaming identifier, changing optionality. Enabled by default on NSPersistentContainer. Anything structural needs a mapping model or a manual migration.' },
    { id: 'dn30', front: 'What is a fault in Core Data?', back: 'A placeholder NSManagedObject whose attributes are not loaded yet. Accessing a property "fires" the fault and hits the store. Fetching a list and touching a relationship in each row causes N+1 fetches — fix with relationshipKeyPathsForPrefetching or returnsObjectsAsFaults = false.' }
  ],

  quizQuestions: [
    {
      id: 'dnq1',
      question: 'Which URLSession configuration continues downloads when the app is suspended?',
      options: ['.default', '.ephemeral', '.background', '.persistent'],
      correctAnswer: 2,
      explanation: '.background configuration allows downloads/uploads to continue when the app is suspended or terminated.'
    },
    {
      id: 'dnq2',
      question: 'What protocol enables JSON encoding and decoding in Swift?',
      options: ['Serializable', 'JSONConvertible', 'Codable', 'Parseable'],
      correctAnswer: 2,
      explanation: 'Codable (combining Encodable and Decodable) enables JSON serialization with JSONEncoder/JSONDecoder.'
    },
    {
      id: 'dnq3',
      question: 'Where should you store an API token?',
      options: ['UserDefaults', 'Keychain', 'Core Data', 'File system'],
      correctAnswer: 1,
      explanation: 'Keychain provides encrypted storage for sensitive data like tokens and passwords.'
    },
    {
      id: 'dnq4',
      question: 'What is NSManagedObjectContext in Core Data?',
      options: ['The database file', 'The object manipulation scratchpad', 'The data model', 'The query builder'],
      correctAnswer: 1,
      explanation: 'Context is the scratchpad where you create, fetch, and modify managed objects before saving.'
    },
    {
      id: 'dnq5',
      question: 'How do you map JSON key "created_at" to property "createdAt"?',
      options: ['@JSONKey annotation', 'CodingKeys enum', 'Rename the property', 'Custom decoder only'],
      correctAnswer: 1,
      explanation: 'CodingKeys enum with raw value: case createdAt = "created_at" maps the JSON key.'
    },
    {
      id: 'dnq6',
      question: 'What is the correct way to use Core Data on a background thread?',
      options: ['Access viewContext directly', 'Use newBackgroundContext()', 'Lock the context', 'Disable thread checking'],
      correctAnswer: 1,
      explanation: 'Use newBackgroundContext() for background work. Each context is tied to a thread.'
    },
    {
      id: 'dnq7',
      question: 'What does @AppStorage do in SwiftUI?',
      options: ['Stores in iCloud', 'Reads/writes UserDefaults', 'Encrypts data', 'Caches network responses'],
      correctAnswer: 1,
      explanation: '@AppStorage is a property wrapper that reads/writes UserDefaults and updates views on change.'
    },
    {
      id: 'dnq8',
      question: 'Which task type should you use for downloading a large file?',
      options: ['DataTask', 'DownloadTask', 'StreamTask', 'UploadTask'],
      correctAnswer: 1,
      explanation: 'DownloadTask saves to file system, supports resume, and is better for large files than DataTask.'
    },
    {
      id: 'dnq9',
      question: 'What filter is used in Core Data fetch requests?',
      options: ['NSFilter', 'NSPredicate', 'NSQuery', 'NSCondition'],
      correctAnswer: 1,
      explanation: 'NSPredicate filters results. Example: NSPredicate(format: "name == %@", "John")'
    },
    {
      id: 'dnq10',
      question: 'What happens to missing optional JSON fields with Codable?',
      options: ['Error is thrown', 'Property is set to nil', 'Default value used', 'Crash'],
      correctAnswer: 1,
      explanation: 'Optional properties become nil if the key is missing. Non-optional properties throw an error.'
    },
    {
      id: 'dnq11',
      question: 'The API returns "price": "12.5" but your Codable struct declares `let price: Double`. What happens on decode?',
      options: ['price becomes 12.5', 'DecodingError.typeMismatch is thrown', 'price becomes nil', 'price becomes 0'],
      correctAnswer: 1,
      explanation: 'Codable does not coerce types. A JSON string into a Double fails the entire decode. Decode it as String and convert, or write a custom init(from:).'
    },
    {
      id: 'dnq12',
      question: 'You decode {"createdAt": "2024-01-01T10:00:00Z"} into `let createdAt: Date` with a plain JSONDecoder(). What happens?',
      options: ['It decodes correctly', 'It decodes as midnight 1970', 'It decodes as a String', 'It fails — the default strategy expects a Double timestamp'],
      correctAnswer: 3,
      explanation: 'The default dateDecodingStrategy is .deferredToDate, which reads a Double of seconds since the reference date. Set decoder.dateDecodingStrategy = .iso8601 for this format.'
    },
    {
      id: 'dnq13',
      question: 'You save new objects on a background context, but the UI list backed by viewContext does not update. What is the usual fix?',
      options: ['Set viewContext.automaticallyMergesChangesFromParent = true', 'Call viewContext.reset()', 'Save on viewContext instead, from the background thread', 'Increase the fetch limit'],
      correctAnswer: 0,
      explanation: 'Contexts do not see each other\'s changes by default. Merging saves from the coordinator into viewContext (automatically or via the didSave notification) is what refreshes fetched results.'
    },
    {
      id: 'dnq14',
      question: 'You fetch an NSManagedObject on a background context and later read its properties on the main thread. What is the outcome?',
      options: ['It works because the object is immutable', 'Core Data copies the object to the main context', 'Undefined behavior — possible crashes or corrupt data', 'A compile error'],
      correctAnswer: 2,
      explanation: 'Managed objects are bound to their context\'s queue. Cross-thread use is a classic intermittent crash. Pass the objectID and re-fetch on viewContext, or turn on -com.apple.CoreData.ConcurrencyDebug to catch it.'
    },
    {
      id: 'dnq15',
      question: 'A background refresh needs a Keychain token while the device is locked. Which accessibility class should the token use?',
      options: ['kSecAttrAccessibleWhenUnlocked', 'kSecAttrAccessibleAfterFirstUnlock', 'kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly', 'kSecAttrAccessibleWhenUnlockedThisDeviceOnly'],
      correctAnswer: 1,
      explanation: 'The WhenUnlocked classes make the item unreadable while the device is locked, so background reads fail. AfterFirstUnlock is readable after the first unlock since boot, which is what background work needs.'
    },
    {
      id: 'dnq16',
      question: 'A Task is cancelled while it is suspended on `try await URLSession.shared.data(for: request)`. What happens?',
      options: ['The request completes and the data is discarded', 'The request continues but the task is marked cancelled', 'Nothing until the timeout fires', 'The underlying request is cancelled and the call throws URLError.cancelled'],
      correctAnswer: 3,
      explanation: 'URLSession\'s async APIs are cancellation-aware. Cancelling the task cancels the network request immediately and the await throws, which is why .task-driven fetches in SwiftUI clean up on disappear.'
    },
    {
      id: 'dnq17',
      question: 'You add a new optional attribute to a Core Data entity and ship the update. What kind of migration is needed?',
      options: ['A manual migration with NSMigrationManager', 'A custom mapping model', 'A lightweight migration, which NSPersistentContainer performs automatically', 'No migration is possible — the store must be deleted'],
      correctAnswer: 2,
      explanation: 'Adding an optional attribute is a lightweight-migratable change. Creating a new model version (rather than editing the old one in place) is the only thing you must remember.'
    },
    {
      id: 'dnq18',
      question: 'Which JSONEncoder setting writes `createdAt` as "created_at" without a CodingKeys enum?',
      options: ['keyEncodingStrategy = .convertToSnakeCase', 'keyDecodingStrategy = .convertFromSnakeCase', 'outputFormatting = .snakeCase', 'dataEncodingStrategy = .snakeCase'],
      correctAnswer: 0,
      explanation: 'Encoding and decoding have separate strategies. .convertFromSnakeCase is the decoder side; .convertToSnakeCase is its encoder counterpart. outputFormatting only affects pretty printing and key ordering.'
    },
    {
      id: 'dnq19',
      question: 'Scrolling a list of 500 Core Data rows is slow; profiling shows one SQL query per row when reading `item.category.name`. What is happening?',
      options: ['The predicate is too complex', 'Each relationship is a fault that fires on access, causing N+1 fetches', 'The view context is on the wrong thread', 'NSFetchedResultsController is missing a cache name'],
      correctAnswer: 1,
      explanation: 'Relationships are returned as faults. Touching one per row triggers a fetch per row. Prefetch with fetchRequest.relationshipKeyPathsForPrefetching = ["category"].'
    },
    {
      id: 'dnq20',
      question: 'Which URLSessionConfiguration keeps cookies, cache, and credentials in memory only?',
      options: ['.default', '.background(withIdentifier:)', 'URLSession.shared', '.ephemeral'],
      correctAnswer: 3,
      explanation: '.ephemeral writes nothing to disk, similar to private browsing — useful for privacy-sensitive or test sessions. .default and .shared persist cache and cookies; .background is for transfers that outlive the app.'
    }
  ]
};

// =============================================================================
// 7. APP LIFECYCLE & TESTING
// =============================================================================
const appLifecycleTesting: iOSCategory = {
  id: 'ios-lifecycle-testing',
  name: 'App Lifecycle & Testing',
  slug: 'lifecycle-testing',
  description: 'App lifecycle, scenes, background tasks, and unit/UI testing',
  icon: 'refresh-outline',
  color: '#34C759',
  colorDark: '#248A3D',
  premium: true,

  learnContent: [
    {
      title: 'App Lifecycle',
      content: `Understanding app states is crucial for managing resources and user experience.

**App States:**
1. **Not Running**: App hasn't started or was terminated
2. **Inactive**: Running but not receiving events (transitioning)
3. **Active**: Running and receiving events
4. **Background**: Running but not visible
5. **Suspended**: In memory but not executing

**Key Events:**
- applicationDidFinishLaunching: Initial setup
- applicationWillResignActive: About to leave foreground
- applicationDidEnterBackground: Now in background
- applicationWillEnterForeground: About to return
- applicationDidBecomeActive: Now in foreground

**Scene Lifecycle (iOS 13+):**
With scenes, lifecycle is per-scene, not per-app.`,
      codeExample: `// UIKit AppDelegate
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Initial setup: configure services, analytics, etc.
        configureServices()
        return true
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Save data, release resources
        saveUserData()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Refresh data, restore state
        refreshContent()
    }
}

// SceneDelegate (iOS 13+)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        // Create the window and show the first screen
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Per-scene background handling
    }
}

// SwiftUI App
@main
struct MyApp: App {
    // scenePhase mirrors the old lifecycle callbacks
    @Environment(\\.scenePhase) var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        // React to foreground/background transitions
        .onChange(of: scenePhase) { phase in
            switch phase {
            case .active: print("Active")
            case .inactive: print("Inactive")
            case .background: print("Background")
            @unknown default: break
            }
        }
    }
}`
    },
    {
      title: 'Background Execution',
      content: `iOS limits background execution to preserve battery. Several modes exist for legitimate background work.

**Background Modes:**
1. **Background Tasks**: Short tasks when entering background
2. **Background Fetch**: Periodic content updates
3. **Remote Notifications**: Push-triggered updates
4. **Background Processing**: Long tasks (ML training)
5. **Audio/Location/VoIP**: Continuous background execution

**BGTaskScheduler (iOS 13+):**
Modern API for scheduling background work.

**Best Practices:**
- Complete quickly (30 seconds for most tasks)
- Handle expiration gracefully
- Test on device (simulator doesn't fully simulate)`,
      codeExample: `// Register background tasks in AppDelegate
func application(_ application: UIApplication, didFinishLaunchingWithOptions: ...) -> Bool {

    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.app.refresh",
        using: nil
    ) { task in
        self.handleAppRefresh(task: task as! BGAppRefreshTask)
    }

    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.app.processing",
        using: nil
    ) { task in
        self.handleProcessing(task: task as! BGProcessingTask)
    }

    return true
}

// Schedule refresh task
func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 min

    try? BGTaskScheduler.shared.submit(request)
}

// Handle the task
func handleAppRefresh(task: BGAppRefreshTask) {
    scheduleAppRefresh() // Schedule next

    let operation = RefreshOperation()

    task.expirationHandler = {
        operation.cancel()
    }

    operation.completionBlock = {
        task.setTaskCompleted(success: !operation.isCancelled)
    }

    operationQueue.addOperation(operation)
}

// Simple background task (UIKit)
func applicationDidEnterBackground(_ application: UIApplication) {
    var taskID = UIBackgroundTaskIdentifier.invalid

    taskID = application.beginBackgroundTask {
        // Expiration handler - clean up
        application.endBackgroundTask(taskID)
    }

    // Do work
    saveData {
        application.endBackgroundTask(taskID)
    }
}`
    },
    {
      title: 'Unit Testing with XCTest',
      content: `XCTest is Apple's testing framework for unit and UI tests.

**Test Structure:**
- Test class inherits from XCTestCase
- Test methods start with "test"
- setUp() runs before each test
- tearDown() runs after each test

**Assertions:**
- XCTAssertTrue/False
- XCTAssertEqual/NotEqual
- XCTAssertNil/NotNil
- XCTAssertThrowsError

**Async Testing:**
Use async/await or XCTestExpectation for async code.

**Best Practices:**
- Test one thing per test
- Use descriptive names
- Arrange-Act-Assert pattern
- Mock dependencies`,
      codeExample: `import XCTest
@testable import MyApp

class UserServiceTests: XCTestCase {

    var sut: UserService! // System Under Test
    var mockNetwork: MockNetworkService!

    override func setUp() {
        super.setUp()
        // Fresh SUT + mock before every test
        mockNetwork = MockNetworkService()
        sut = UserService(network: mockNetwork)
    }

    override func tearDown() {
        // Release everything so tests can't leak state
        sut = nil
        mockNetwork = nil
        super.tearDown()
    }

    func testFetchUser_success() async throws {
        // Arrange
        let expectedUser = User(id: "1", name: "Test")
        mockNetwork.mockResult = expectedUser

        // Act
        let user = try await sut.fetchUser(id: "1")

        // Assert
        XCTAssertEqual(user.name, "Test")
        XCTAssertEqual(mockNetwork.fetchCallCount, 1)
    }

    func testFetchUser_networkError_throwsError() async {
        // Arrange
        mockNetwork.mockError = NetworkError.noConnection

        // Act & Assert
        do {
            _ = try await sut.fetchUser(id: "1")
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertEqual(error as? NetworkError, .noConnection)
        }
    }

    // Testing with expectations (older async pattern)
    func testNotificationPosted() {
        let expectation = expectation(forNotification: .userLoggedIn, object: nil)

        sut.login()

        wait(for: [expectation], timeout: 1.0)
    }
}

// Mock
class MockNetworkService: NetworkServiceProtocol {
    var mockResult: Any?  // preset response
    var mockError: Error? // preset failure
    var fetchCallCount = 0

    func fetch<T: Decodable>(url: URL) async throws -> T {
        fetchCallCount += 1 // record the interaction
        if let error = mockError { throw error }
        return mockResult as! T
    }
}`
    },
    {
      title: 'UI Testing',
      content: `UI tests verify the app from the user's perspective, interacting with actual UI elements.

**Key Concepts:**
- XCUIApplication: Launches and controls app
- XCUIElement: UI elements (buttons, labels, etc.)
- XCUIElementQuery: Finding elements
- Accessibility identifiers: Stable element identification

**Finding Elements:**
- By type: app.buttons, app.textFields
- By identifier: app.buttons["login"]
- By label: app.staticTexts["Welcome"]

**Actions:**
- tap(), doubleTap()
- typeText()
- swipeUp/Down/Left/Right()
- exists, isHittable`,
      codeExample: `import XCTest

class LoginUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false // stop at first failure
        app = XCUIApplication()
        // Flag lets the app stub data for UI tests
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    func testSuccessfulLogin() {
        // Find elements
        let emailField = app.textFields["emailTextField"]
        let passwordField = app.secureTextFields["passwordTextField"]
        let loginButton = app.buttons["loginButton"]

        // Type credentials
        emailField.tap()
        emailField.typeText("test@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        // Tap login
        loginButton.tap()

        // Verify navigation (wait: next screen loads async)
        let welcomeLabel = app.staticTexts["Welcome"]
        XCTAssertTrue(welcomeLabel.waitForExistence(timeout: 5))
    }

    func testLoginValidation() {
        let loginButton = app.buttons["loginButton"]
        loginButton.tap()

        // Verify error message
        let errorLabel = app.staticTexts["Please enter email"]
        XCTAssertTrue(errorLabel.exists)
    }

    func testScrollAndTap() {
        let table = app.tables.firstMatch
        let lastCell = table.cells["item_99"]

        // Scroll to element
        while !lastCell.isHittable {
            table.swipeUp()
        }

        lastCell.tap()
    }
}

// Set accessibility identifier in code
class LoginViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        emailTextField.accessibilityIdentifier = "emailTextField"
        passwordTextField.accessibilityIdentifier = "passwordTextField"
        loginButton.accessibilityIdentifier = "loginButton"
    }
}`
    },
    {
      title: 'Test Doubles and Mocking',
      content: `Test doubles replace real dependencies in tests for isolation and control.

**Types of Test Doubles:**
1. **Mock**: Verifies interactions (was method called?)
2. **Stub**: Returns predefined data
3. **Fake**: Working implementation (in-memory DB)
4. **Spy**: Records calls for later verification

**Protocol-Based Mocking:**
Define protocols for dependencies, create mock implementations.

**Best Practices:**
- Only mock what you own
- Prefer fakes for repositories
- Use dependency injection
- Verify meaningful interactions`,
      codeExample: `// Protocol for dependency
protocol AnalyticsServiceProtocol {
    func track(event: String, properties: [String: Any]?)
}

// Real implementation
class AnalyticsService: AnalyticsServiceProtocol {
    func track(event: String, properties: [String: Any]?) {
        // Send to analytics service
    }
}

// Mock for testing
class MockAnalyticsService: AnalyticsServiceProtocol {
    var trackedEvents: [(event: String, properties: [String: Any]?)] = []

    func track(event: String, properties: [String: Any]?) {
        trackedEvents.append((event, properties))
    }

    func verify(event: String, called times: Int = 1) -> Bool {
        trackedEvents.filter { $0.event == event }.count == times
    }
}

// Stub for returning data
class StubUserRepository: UserRepositoryProtocol {
    var stubbedUsers: [User] = []

    func fetchUsers() async throws -> [User] {
        return stubbedUsers
    }
}

// Fake with working implementation
class FakeUserRepository: UserRepositoryProtocol {
    private var users: [User] = []

    func fetchUsers() async throws -> [User] {
        return users
    }

    func save(_ user: User) async throws {
        users.append(user)
    }
}

// Usage in tests
class CheckoutViewModelTests: XCTestCase {
    func testCheckout_tracksAnalytics() async {
        // Arrange
        let mockAnalytics = MockAnalyticsService()
        let viewModel = CheckoutViewModel(analytics: mockAnalytics)

        // Act
        await viewModel.completeCheckout()

        // Assert
        XCTAssertTrue(mockAnalytics.verify(event: "checkout_completed"))
        XCTAssertEqual(mockAnalytics.trackedEvents.first?.properties?["total"] as? Double, 99.99)
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'App State Transitions',
      description: 'iOS app lifecycle states and transitions',
      nodes: [
        { id: 'inactive', label: 'Inactive\nstarting', x: 100, y: 50, type: 'warning' },
        { id: 'active', label: 'Active\nforeground', x: 250, y: 50, type: 'primary' },
        { id: 'bg', label: 'Background\nrunning', x: 100, y: 150, type: 'secondary' },
        { id: 'suspended', label: 'Suspended\nstopped', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'inactive', to: 'active' },
        { from: 'active', to: 'inactive' },
        { from: 'inactive', to: 'bg' },
        { from: 'bg', to: 'suspended' }
      ]
    },
    {
      title: 'Test Structure',
      description: 'XCTest execution flow',
      nodes: [
        { id: 'setup', label: 'setUp()\nbefore', x: 100, y: 50, type: 'secondary' },
        { id: 'test', label: 'testMethod()\nrun', x: 250, y: 50, type: 'primary' },
        { id: 'assert', label: 'XCTAssert\nverify', x: 100, y: 150, type: 'warning' },
        { id: 'teardown', label: 'tearDown()\nafter', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'setup', to: 'test' },
        { from: 'test', to: 'assert' },
        { from: 'test', to: 'teardown' }
      ]
    }
  ],

  flashcards: [
    { id: 'lt1', front: 'What are the 5 app states in iOS?', back: 'Not Running, Inactive, Active, Background, Suspended. Apps transition between these based on user interaction and system events.' },
    { id: 'lt2', front: 'When is applicationDidEnterBackground called?', back: 'When the app transitions from foreground to background (e.g., user presses home). Use it to save data and release resources.' },
    { id: 'lt3', front: 'What is SceneDelegate for?', back: 'iOS 13+ scene lifecycle management. Handles per-scene events like willConnect, didEnterBackground. Replaces some AppDelegate methods.' },
    { id: 'lt4', front: 'What is BGTaskScheduler?', back: 'iOS 13+ API for scheduling background work. Register tasks with identifiers, schedule with BGAppRefreshTaskRequest or BGProcessingTaskRequest.' },
    { id: 'lt5', front: 'What does XCTAssertEqual do?', back: 'Asserts that two expressions are equal. Test fails if values don\'t match. Example: XCTAssertEqual(result, expected)' },
    { id: 'lt6', front: 'What is the purpose of setUp() in XCTestCase?', back: 'Runs before each test method. Use it to create the system under test and mock dependencies. Ensures each test starts fresh.' },
    { id: 'lt7', front: 'How do you test async code with XCTest?', back: 'Use async test methods (async throws) with await, or use XCTestExpectation with wait(for:timeout:).' },
    { id: 'lt8', front: 'What is an accessibility identifier?', back: 'A string identifier for UI elements used in UI testing. More stable than labels. Set with element.accessibilityIdentifier.' },
    { id: 'lt9', front: 'What is the difference between mock and stub?', back: 'Mock verifies interactions (was method called?). Stub returns predefined data. Mocks are about behavior, stubs about state.' },
    { id: 'lt10', front: 'How long do background tasks have to complete?', back: 'About 30 seconds for beginBackgroundTask. Handle expiration gracefully. BGProcessingTask can run longer with appropriate configuration.' },
    { id: 'lt11', front: 'What is @Environment(\\.scenePhase) in SwiftUI?', back: 'Property wrapper to observe scene state changes (active, inactive, background). Use onChange(of:) to respond.' },
    { id: 'lt12', front: 'What is XCUIApplication?', back: 'UI testing class that launches and controls the app. Use it to find elements, perform actions, and verify state.' },
    { id: 'lt13', front: 'What does waitForExistence(timeout:) do?', back: 'Waits up to timeout seconds for an element to exist. Returns true if found, false if timeout. Use for async UI updates.' },
    { id: 'lt14', front: 'What is the Arrange-Act-Assert pattern?', back: 'Test structure: Arrange (setup), Act (execute), Assert (verify). Makes tests clear and readable.' },
    { id: 'lt15', front: 'How do you mock a protocol dependency?', back: 'Create a class conforming to the protocol that records calls and returns preset values. Inject it instead of the real implementation.' },
    { id: 'lt16', front: 'How do you put the app into a known state for a UI test?', back: 'Set launchArguments or launchEnvironment on XCUIApplication before launch() — e.g. ["-uiTesting", "-mockNetwork"] — and have the app read ProcessInfo.processInfo.arguments at startup to reset UserDefaults, skip onboarding, or swap in stub services. The UI test runs in a separate process, so this is the only channel; you can\'t inject objects directly.' },
    { id: 'lt17', front: 'When does applicationDidBecomeActive fire?', back: 'Every time the app moves from inactive to active in the foreground — first launch, returning from background, dismissing a system prompt (Face ID, alert), or coming back from a phone call.' },
    { id: 'lt18', front: 'What is an Xcode test plan?', back: 'An .xctestplan file that lists which test targets run and under which configurations — environment variables, launch arguments, language and region, sanitizers, code coverage, repetitions. One plan can run the same tests under several configurations (English and Arabic, or with Thread Sanitizer on), and schemes and CI pick a plan to execute.' },
    { id: 'lt19', front: 'How does Swift Testing differ from XCTest?', back: 'Swift Testing uses #expect macros, struct-based suites, trait-driven configuration, and parallel execution by default. XCTest is still required for UI tests and remains supported.' },
    { id: 'lt20', front: 'What is Xcode\'s UI test recording good for?', back: 'A first-draft sketch. Xcode generates XCUIElement queries while you tap through the app. The recording usually needs hand-edits — use accessibility identifiers and trim brittle parts.' },
    { id: 'lt21', front: 'How do you mock URLSession in unit tests?', back: 'Register a URLProtocol stub on a custom URLSessionConfiguration, then pass that into a test URLSession. Your stub returns canned responses without touching the network.' },
    { id: 'lt22', front: 'What does measure { } do in XCTest?', back: 'Runs the block several times, records timing, and compares against the saved baseline. The test fails if performance regresses beyond an allowed deviation.' },
    { id: 'lt23', front: 'How do you stabilise a flaky UI test?', back: 'Wait on expectations (waitForExpectations, expectation(for:evaluatedWith:handler:)) instead of fixed sleeps. Disable animations in setup. Address views by accessibilityIdentifier, not visible text.' },
    { id: 'lt24', front: 'What is the difference between the Inactive and Background states?', back: 'Inactive: the app is in the foreground but not receiving events — a system alert, Control Center, or a transition is on top. Background: the app is not visible and has a short window to finish work before suspension.' },
    { id: 'lt25', front: 'What are background modes and how do you declare them?', back: 'Capabilities under UIBackgroundModes in Info.plist — audio, location, voip, fetch, processing, remote-notification, bluetooth-central, and others — that let specific work continue after the app leaves the foreground. Each needs the matching framework usage; App Review rejects modes that aren\'t genuinely used.' },
    { id: 'lt26', front: 'How should an app respond to a memory warning?', back: 'Release anything rebuildable — image caches, prefetched data, offscreen view hierarchies — in didReceiveMemoryWarning or the UIApplication.didReceiveMemoryWarningNotification. If usage keeps growing the system\'s jetsam mechanism terminates the app without a normal crash report.' },
    { id: 'lt27', front: 'What does the Memory Graph Debugger show?', back: 'A snapshot of every live object and the references between them. Filter to leaked objects (marked with a purple !), select one, and follow the arrows to see who is holding it — the fastest way to find a retain cycle.' },
    { id: 'lt28', front: 'Which Instruments template do you reach for, and when?', back: 'Time Profiler for CPU hotspots and slow scrolling; Allocations and Leaks for memory growth and leaks; Animation Hitches / Core Animation for dropped frames; Network for request timing. Always profile a Release build on a real device.' },
    { id: 'lt29', front: 'How do you test a method that fires off an unstructured Task { } internally?', back: 'Make the async work awaitable: return the Task, expose an async version, or inject a scheduler. Otherwise assert with an XCTestExpectation fulfilled from the completion path. Sleeping in the test is a flaky non-answer.' },
    { id: 'lt30', front: 'How do you write a unit test that catches a memory leak?', back: 'Hold the system under test with a `weak var` alongside the strong reference in the test, then use addTeardownBlock { XCTAssertNil(weakSut) }. If a retain cycle keeps the object alive after the test releases it, the assertion fails.' }
  ],

  quizQuestions: [
    {
      id: 'ltq1',
      question: 'Which method is called when the app enters the background?',
      options: ['applicationWillResignActive', 'applicationDidEnterBackground', 'applicationWillTerminate', 'applicationDidBecomeActive'],
      correctAnswer: 1,
      explanation: 'applicationDidEnterBackground is called when the app transitions to background. Save data here.'
    },
    {
      id: 'ltq2',
      question: 'What replaced some AppDelegate methods in iOS 13+?',
      options: ['WindowDelegate', 'SceneDelegate', 'ViewDelegate', 'LifecycleDelegate'],
      correctAnswer: 1,
      explanation: 'SceneDelegate handles per-scene lifecycle. Multi-window support moved scene management here.'
    },
    {
      id: 'ltq3',
      question: 'Which XCTest method runs before each test?',
      options: ['init()', 'setUp()', 'prepare()', 'beforeEach()'],
      correctAnswer: 1,
      explanation: 'setUp() runs before each test method. Use it to create test fixtures and mocks.'
    },
    {
      id: 'ltq4',
      question: 'How do you identify UI elements for UI testing?',
      options: ['By frame', 'By accessibility identifier', 'By memory address', 'By view controller'],
      correctAnswer: 1,
      explanation: 'Accessibility identifiers provide stable element identification. Set accessibilityIdentifier in code.'
    },
    {
      id: 'ltq5',
      question: 'What is BGTaskScheduler used for?',
      options: ['UI animations', 'Background task scheduling', 'Network requests', 'Memory management'],
      correctAnswer: 1,
      explanation: 'BGTaskScheduler (iOS 13+) schedules and manages background tasks like refresh and processing.'
    },
    {
      id: 'ltq6',
      question: 'Which assertion checks if two values are equal?',
      options: ['XCTAssertTrue', 'XCTAssertNil', 'XCTAssertEqual', 'XCTAssertExists'],
      correctAnswer: 2,
      explanation: 'XCTAssertEqual(a, b) fails if a != b. Most common assertion for checking results.'
    },
    {
      id: 'ltq7',
      question: 'What is a test double that verifies method calls?',
      options: ['Stub', 'Fake', 'Mock', 'Spy'],
      correctAnswer: 2,
      explanation: 'Mock objects verify interactions - whether methods were called with expected parameters.'
    },
    {
      id: 'ltq8',
      question: 'How long does beginBackgroundTask have to complete?',
      options: ['5 seconds', '30 seconds', '5 minutes', 'Unlimited'],
      correctAnswer: 1,
      explanation: 'About 30 seconds. Handle expiration in the expiration handler to clean up gracefully.'
    },
    {
      id: 'ltq9',
      question: 'What SwiftUI property wrapper observes scene state?',
      options: ['@State', '@Environment(\\.scenePhase)', '@Binding', '@ObservedObject'],
      correctAnswer: 1,
      explanation: '@Environment(\\.scenePhase) provides the current scene state (active, inactive, background).'
    },
    {
      id: 'ltq10',
      question: 'What is the Arrange-Act-Assert pattern for?',
      options: ['UI layout', 'Dependency injection', 'Test structure', 'Error handling'],
      correctAnswer: 2,
      explanation: 'AAA organizes tests: Arrange (setup), Act (execute), Assert (verify). Makes tests clear and maintainable.'
    },
    {
      id: 'ltq11',
      question: 'The user pulls down Control Center over your app. Which state is your app in?',
      options: ['Background', 'Suspended', 'Inactive', 'Not Running'],
      correctAnswer: 2,
      explanation: 'The app is still in the foreground but has stopped receiving touch events, which is exactly the Inactive state. applicationWillResignActive fires; didEnterBackground does not.'
    },
    {
      id: 'ltq12',
      question: 'A suspended app in the background is using too much memory and the system needs it. What happens?',
      options: ['The system terminates it (jetsam) and the next launch is a cold start', 'didReceiveMemoryWarning is called while suspended', 'The app is moved to Inactive', 'applicationWillTerminate is called first'],
      correctAnswer: 0,
      explanation: 'Suspended apps run no code, so they get no warning and no willTerminate callback. That is why state must be saved in didEnterBackground, before suspension.'
    },
    {
      id: 'ltq13',
      question: 'Which Instruments template directly shows dropped frames while scrolling?',
      options: ['Leaks', 'Animation Hitches', 'Network', 'Energy Log'],
      correctAnswer: 1,
      explanation: 'Animation Hitches (and the older Core Animation template) measure frames that missed their deadline and attribute them to commit or render phases. Time Profiler helps find the CPU cause afterwards.'
    },
    {
      id: 'ltq14',
      question: 'In the Memory Graph Debugger, what does a purple exclamation badge next to an object mean?',
      options: ['The object is on the main thread', 'The object is a Swift struct', 'The object was created by a system framework', 'Xcode believes the object is leaked'],
      correctAnswer: 3,
      explanation: 'The runtime leak checker flags objects that are unreachable from any root yet still allocated. Inspect the object\'s references to find the cycle that keeps it alive.'
    },
    {
      id: 'ltq15',
      question: 'viewModel.load() spawns a Task internally. The test calls load() then immediately asserts items.count == 3 and fails only sometimes. Why?',
      options: ['XCTAssertEqual is not thread-safe', 'The Task has not finished yet — the test needs to await the work or use an expectation', 'load() must be marked @MainActor', 'The mock returned the wrong data'],
      correctAnswer: 1,
      explanation: 'Unstructured tasks run independently of the caller, so the assertion races the network mock. Make the work awaitable or fulfil an expectation when it completes; never add a sleep.'
    },
    {
      id: 'ltq16',
      question: 'When does XCTestCase.tearDown() run?',
      options: ['Once after the whole test class', 'Only when a test fails', 'After each individual test method', 'Before each test method'],
      correctAnswer: 2,
      explanation: 'tearDown pairs with setUp and runs after every test, so shared state and the system under test are reset between tests. The class-level equivalent is the class func tearDown.'
    },
    {
      id: 'ltq17',
      question: 'In a unit test (not UI test) you need to wait until a property becomes true without polling manually. Which XCTest tool fits?',
      options: ['expectation(for: NSPredicate, evaluatedWith:) plus wait(for:timeout:)', 'XCTAssertTrue in a while loop', 'Thread.sleep(forTimeInterval:)', 'XCUIElement.waitForExistence'],
      correctAnswer: 0,
      explanation: 'A predicate expectation polls the condition for you and fails cleanly on timeout. Sleeping is slow and flaky, and waitForExistence is for UI-test elements, not model state.'
    },
    {
      id: 'ltq18',
      question: 'Your podcast app stops playing when the user locks the phone. What is required to keep audio running?',
      options: ['Request a BGProcessingTask', 'Call beginBackgroundTask before play()', 'Use a background URLSession', 'Add the audio background mode and configure an AVAudioSession playback category'],
      correctAnswer: 3,
      explanation: 'Continuous audio needs the audio entry in UIBackgroundModes and an active AVAudioSession with the .playback category. beginBackgroundTask only buys about 30 seconds.'
    },
    {
      id: 'ltq19',
      question: 'When is applicationWillTerminate(_:) actually called?',
      options: ['Every time the user swipes the app away', 'Only when the app is terminated while still running, not when a suspended app is killed', 'Whenever the app enters the background', 'On every low-memory event'],
      correctAnswer: 1,
      explanation: 'Suspended apps execute no code, so the system kills them silently. willTerminate fires only in cases like a foreground app being killed or an app with background execution being terminated — do not rely on it to save data.'
    },
    {
      id: 'ltq20',
      question: 'A test creates `var sut: ViewModel? = ViewModel()`, keeps `weak var weakSut = sut`, sets sut = nil, and then asserts XCTAssertNil(weakSut). What is being verified?',
      options: ['That ViewModel is thread-safe', 'That ViewModel conforms to Equatable', 'That the ViewModel deallocates when released, i.e. it has no retain cycle', 'That the ViewModel was initialized on the main thread'],
      correctAnswer: 2,
      explanation: 'If a retain cycle (for example a closure capturing self strongly) keeps the object alive, the weak reference stays non-nil and the test fails. This is a cheap guard against leaks in view models and coordinators.'
    }
  ]
};

// Export all iOS categories
export const iosCategories: iOSCategory[] = [
  swiftFundamentals,
  uikitEssentials,
  swiftUI,
  concurrency,
  architecture,
  dataNetworking,
  appLifecycleTesting,
];
