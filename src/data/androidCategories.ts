// Android Development Categories - Comprehensive content for Android interview prep
// Each subcategory has: learnContent, visualizations, flashcards, quizQuestions

import { Category, LearnSection, Flashcard, QuizQuestion, Visualization } from '../types';

// Re-export as AndroidCategory for backwards compatibility
export type AndroidCategory = Category;

// =============================================================================
// 1. KOTLIN FUNDAMENTALS
// =============================================================================
const kotlinFundamentals: AndroidCategory = {
  id: 'android-kotlin-fundamentals',
  name: 'Kotlin Fundamentals',
  slug: 'kotlin-fundamentals',
  description: 'Core Kotlin features: null safety, extensions, data classes, and sealed classes',
  icon: 'code-slash-outline',
  color: '#7F52FF',
  colorDark: '#6641CC',

  learnContent: [
    {
      title: 'Null Safety',
      content: `Kotlin's type system distinguishes nullable and non-nullable types, eliminating NullPointerExceptions at compile time.

**Key Concepts:**
- Non-nullable: \`String\` - cannot hold null
- Nullable: \`String?\` - can hold null
- Safe call: \`?.\` - returns null if object is null
- Elvis operator: \`?:\` - provides default value
- Not-null assertion: \`!!\` - throws if null (use sparingly)

**Smart Casting:**
After a null check, Kotlin automatically casts to non-null type within that scope.

**Platform Types:**
Java types are "platform types" with unknown nullability. Use @Nullable/@NotNull annotations or handle carefully.`,
      codeExample: `// Non-nullable vs nullable
var name: String = "Kotlin"
var nullableName: String? = null

// Safe call operator
val length = nullableName?.length  // null, not NPE

// Elvis operator
val len = nullableName?.length ?: 0  // 0 if null

// Safe call chain
val city = user?.address?.city ?: "Unknown"

// Not-null assertion (avoid when possible)
val forceLength = nullableName!!.length  // Throws if null

// Smart casting
fun printLength(text: String?) {
    if (text != null) {
        // text is automatically String (non-null) here
        println(text.length)
    }
}

// let for null checks
nullableName?.let { name ->
    println("Name is $name with length \${name.length}")
}

// Safe cast
val str: Any = "hello"
val safeStr: String? = str as? String  // null if cast fails`
    },
    {
      title: 'Extension Functions and Properties',
      content: `Extensions add functionality to existing classes without modifying their source code or using inheritance.

**Extension Functions:**
Add methods to any class, including final classes and primitives.

**Extension Properties:**
Add computed properties (no backing field, must have getter).

**Scope:**
Extensions are resolved statically at compile time based on the declared type, not runtime type.

**Use Cases:**
- Utility functions on framework classes
- DSL builders
- Cleaner code without utility classes`,
      codeExample: `// Extension function on String
fun String.addExclamation(): String = "$this!"

val greeting = "Hello".addExclamation()  // "Hello!"

// Extension function with receiver
fun String.printWithPrefix(prefix: String) {
    println("$prefix: $this")
}
"Kotlin".printWithPrefix("Language")  // "Language: Kotlin"

// Extension property
val String.lastChar: Char
    get() = this[length - 1]

val last = "Kotlin".lastChar  // 'n'

// Extension on nullable type
fun String?.orEmpty(): String = this ?: ""

// Generic extension
fun <T> List<T>.secondOrNull(): T? = if (size >= 2) this[1] else null

// Extension on Android classes
fun Context.toast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}

// In Activity:
toast("Hello!")  // Instead of Toast.makeText(this, "Hello!", ...).show()

// Extension function resolved statically
open class Shape
class Circle : Shape()

fun Shape.name() = "Shape"
fun Circle.name() = "Circle"

val shape: Shape = Circle()
println(shape.name())  // "Shape" - resolved by declared type`
    },
    {
      title: 'Data Classes and Sealed Classes',
      content: `Data classes and sealed classes are powerful Kotlin features for modeling data and state.

**Data Classes:**
Automatically generate equals(), hashCode(), toString(), copy(), and component functions.

Requirements:
- Primary constructor with at least one parameter
- Parameters must be val or var
- Cannot be abstract, open, sealed, or inner

**Sealed Classes:**
Restrict class hierarchies. All subclasses must be in the same package.

Benefits:
- Exhaustive when expressions
- Type-safe state modeling
- ADT (Algebraic Data Types)`,
      codeExample: `// Data class
data class User(
    val id: Int,
    val name: String,
    val email: String
)

val user = User(1, "John", "john@example.com")

// Auto-generated methods
println(user.toString())  // User(id=1, name=John, email=john@example.com)

// Copy with modifications
val updated = user.copy(name = "Jane")

// Destructuring
val (id, name, email) = user
println("$name's email is $email")

// Sealed class
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// Exhaustive when (compiler enforces all cases)
fun handleResult(result: Result<String>) = when (result) {
    is Result.Success -> println("Data: \${result.data}")
    is Result.Error -> println("Error: \${result.exception.message}")
    is Result.Loading -> println("Loading...")
    // No else needed - all cases covered
}

// Sealed class for UI state
sealed class UiState {
    object Idle : UiState()
    object Loading : UiState()
    data class Success(val items: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

// Sealed interface (Kotlin 1.5+)
sealed interface Error {
    data class NetworkError(val code: Int) : Error
    data class DatabaseError(val query: String) : Error
    object Unknown : Error
}`
    },
    {
      title: 'Higher-Order Functions and Lambdas',
      content: `Kotlin treats functions as first-class citizens. Higher-order functions take or return functions.

**Lambda Syntax:**
\`{ parameters -> body }\`

**Key Features:**
- it: implicit single parameter name
- Last lambda outside parentheses
- Return from lambda vs enclosing function
- Inline functions for performance

**Common Higher-Order Functions:**
map, filter, reduce, forEach, let, run, with, apply, also`,
      codeExample: `// Lambda syntax
val sum = { a: Int, b: Int -> a + b }
println(sum(1, 2))  // 3

// Higher-order function
fun operate(a: Int, b: Int, operation: (Int, Int) -> Int): Int {
    return operation(a, b)
}
val result = operate(10, 5) { x, y -> x * y }  // 50

// it - implicit single parameter
val numbers = listOf(1, 2, 3, 4, 5)
val doubled = numbers.map { it * 2 }

// Lambda outside parentheses
numbers.filter { it > 2 }
       .map { it * 2 }
       .forEach { println(it) }

// Scope functions
// let - transform and return
val length = "Hello"?.let { it.length }  // 5

// run - execute block with receiver, return result
val result = "Hello".run {
    println("Processing: $this")
    length * 2
}

// with - like run but non-extension
val greeting = with(StringBuilder()) {
    append("Hello, ")
    append("World!")
    toString()
}

// apply - configure object, return object
val user = User().apply {
    name = "John"
    email = "john@example.com"
}

// also - perform side effect, return object
val list = mutableListOf(1, 2, 3).also {
    println("Original: $it")
}

// Inline function (avoids lambda overhead)
inline fun measureTime(block: () -> Unit): Long {
    val start = System.currentTimeMillis()
    block()
    return System.currentTimeMillis() - start
}`
    },
    {
      title: 'Coroutine Basics Preview',
      content: `Coroutines provide lightweight concurrency. This is a preview - detailed coverage in the Coroutines section.

**Key Concepts:**
- suspend functions: Can pause and resume
- Coroutine builders: launch, async
- Scopes: Structured concurrency
- Dispatchers: Thread control

**Why Coroutines:**
- Simpler than callbacks
- Lighter than threads
- Structured cancellation
- Sequential-looking async code`,
      codeExample: `// Suspend function
suspend fun fetchUser(id: String): User {
    delay(1000)  // Non-blocking delay
    return api.getUser(id)
}

// Coroutine builder - launch (fire and forget)
lifecycleScope.launch {
    val user = fetchUser("123")
    updateUI(user)
}

// async for parallel execution
lifecycleScope.launch {
    val user = async { fetchUser("123") }
    val posts = async { fetchPosts("123") }

    // Both run in parallel
    updateUI(user.await(), posts.await())
}

// Dispatchers
lifecycleScope.launch(Dispatchers.IO) {
    // Network/disk operations
    val data = fetchData()

    withContext(Dispatchers.Main) {
        // UI updates
        updateUI(data)
    }
}

// Exception handling
lifecycleScope.launch {
    try {
        val user = fetchUser("123")
    } catch (e: Exception) {
        showError(e.message)
    }
}

// Structured concurrency - child coroutines
coroutineScope {
    launch { task1() }
    launch { task2() }
    // Waits for both to complete
}`
    }
  ],

  visualizations: [
    {
      title: 'Null Safety Operators',
      description: 'How Kotlin handles nullable types',
      nodes: [
        { id: 'safe', label: '?.\nsafe call', x: 100, y: 50, type: 'primary' },
        { id: 'elvis', label: '?:\nelvis', x: 250, y: 50, type: 'primary' },
        { id: 'assert', label: '!!\nassertion', x: 100, y: 150, type: 'warning' },
        { id: 'cast', label: 'as?\nsafe cast', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'safe', to: 'elvis' },
        { from: 'elvis', to: 'cast' },
        { from: 'assert', to: 'safe' }
      ]
    },
    {
      title: 'Scope Functions',
      description: 'Choosing the right scope function',
      nodes: [
        { id: 'let', label: 'let\nit → result', x: 100, y: 50, type: 'primary' },
        { id: 'run', label: 'run\nthis → result', x: 250, y: 50, type: 'primary' },
        { id: 'apply', label: 'apply\nthis → this', x: 100, y: 150, type: 'secondary' },
        { id: 'also', label: 'also\nit → this', x: 250, y: 150, type: 'secondary' }
      ],
      edges: [
        { from: 'let', to: 'also' },
        { from: 'run', to: 'apply' }
      ]
    }
  ],

  flashcards: [
    { id: 'kf1', front: 'What is the difference between String and String? in Kotlin?', back: 'String cannot hold null (non-nullable). String? can hold null (nullable). The compiler enforces null checks on nullable types.' },
    { id: 'kf2', front: 'What does the Elvis operator (?:) do?', back: 'Returns the left side if non-null, otherwise the right side. Example: name ?: "Unknown" returns "Unknown" if name is null.' },
    { id: 'kf3', front: 'What is an extension function?', back: 'A function added to an existing class without modifying it. Syntax: fun ClassName.functionName(). Resolved at compile time based on declared type.' },
    { id: 'kf4', front: 'What methods does a data class automatically generate?', back: 'equals(), hashCode(), toString(), copy(), and componentN() functions for destructuring.' },
    { id: 'kf5', front: 'What is a sealed class?', back: 'A class with restricted subclasses, all defined in the same package. Enables exhaustive when expressions and type-safe state modeling.' },
    { id: 'kf6', front: 'What is the difference between let and also?', back: 'let: reference is "it", returns lambda result. also: reference is "it", returns the original object. Use also for side effects.' },
    { id: 'kf7', front: 'What is the difference between run and apply?', back: 'run: reference is "this", returns lambda result. apply: reference is "this", returns the original object. Use apply for object configuration.' },
    { id: 'kf8', front: 'What does inline do for a function?', back: 'Copies the function body at call sites instead of creating a function object. Avoids overhead for higher-order functions with lambdas.' },
    { id: 'kf9', front: 'What is smart casting?', back: 'After a null or type check, Kotlin automatically casts to the more specific type within that scope. No explicit cast needed.' },
    { id: 'kf10', front: 'What is destructuring declaration?', back: 'Unpacking an object into multiple variables. Example: val (name, age) = person. Uses componentN() functions.' },
    { id: 'kf11', front: 'What is the safe cast operator (as?)?', back: 'Returns null if cast fails instead of throwing ClassCastException. Example: obj as? String returns null if obj is not a String.' },
    { id: 'kf12', front: 'What is a platform type in Kotlin?', back: 'A type coming from Java with unknown nullability (shown as Type!). Handle carefully as null safety is not enforced.' },
    { id: 'kf13', front: 'What is the difference between launch and async?', back: 'launch: fire-and-forget, returns Job. async: returns Deferred<T> for getting a result with await(). Use async for parallel execution with results.' },
    { id: 'kf14', front: 'What is "it" in a lambda?', back: 'Implicit name for a single parameter in a lambda. Example: list.map { it * 2 } instead of list.map { x -> x * 2 }.' },
    { id: 'kf15', front: 'What is a trailing lambda?', back: 'If the last parameter of a function is a lambda, it can be placed outside the parentheses. Enables DSL-like syntax.' },
    { id: 'kf16', front: 'What is a value class (@JvmInline) and when is it boxed?', back: 'A class wrapping a single value that the compiler inlines to the underlying type, so UserId(String) costs nothing at runtime. It is boxed (allocated) when used as a nullable, a generic type argument, or through an interface it implements.' },
    { id: 'kf17', front: 'What is the difference between a sealed class and a sealed interface?', back: 'Both restrict subtypes to the same module/package and enable exhaustive when. A sealed interface lets a subtype also extend another class or implement several sealed interfaces; a sealed class can hold constructor state and shared implementation.' },
    { id: 'kf18', front: 'When would you pick a sealed class over an enum?', back: 'Enum constants are fixed singletons that all share the same fields. Sealed subclasses can each carry different data and have multiple instances (e.g., Error(message), Success(data)). Use enum for a flat set of constants, sealed for state with payloads.' },
    { id: 'kf19', front: 'What is the difference between object and companion object?', back: 'object declares a lazily initialized, thread-safe singleton. A companion object is a single object tied to a class, accessed through the class name, often used for factories and constants; it can implement interfaces and expose @JvmStatic members to Java.' },
    { id: 'kf20', front: 'What is the difference between lateinit and by lazy?', back: 'lateinit is a non-null var (no primitives) you promise to initialize before use; reading it early throws UninitializedPropertyAccessException. by lazy is a val computed on first access and cached; it is thread-safe (SYNCHRONIZED) by default.' },
    { id: 'kf21', front: 'What does reified do and why does it require inline?', back: 'Generics are erased at runtime, so T::class or x is T normally will not compile. Marking an inline function\'s type parameter reified makes the compiler substitute the concrete type at each call site, which only works because the body is inlined.' },
    { id: 'kf22', front: 'What do noinline and crossinline mean on lambda parameters?', back: 'noinline keeps a lambda as a real object so it can be stored or passed on instead of inlined. crossinline still inlines it but forbids non-local return because the lambda is invoked from another context (nested lambda, other thread).' },
    { id: 'kf23', front: 'Why is a data class with var properties dangerous as a HashSet element or map key?', back: 'hashCode() is computed from the constructor properties. Mutating one after insertion changes the hash, so the set can no longer find the element. Prefer val properties and copy() for changes.' },
    { id: 'kf24', front: 'What is the difference between == and === in Kotlin?', back: '== is structural equality and calls equals() (null-safe). === is referential equality and checks whether both references point to the same object.' },
    { id: 'kf25', front: 'Does val make an object immutable?', back: 'No. val only prevents reassigning the reference; the object it points to can still be mutable (val list: MutableList). Immutability comes from the type (List, immutable data class with val fields), not from val alone.' },
    { id: 'kf26', front: 'Is Kotlin\'s List actually immutable?', back: 'List is only a read-only interface. The underlying object is usually a mutable ArrayList, and another holder of a MutableList reference can change it. For guaranteed immutability use kotlinx.collections.immutable or defensive copies.' },
    { id: 'kf27', front: 'What is the Nothing type?', back: 'A type with no values, used for expressions that never complete normally, such as throw or TODO(). Because Nothing is a subtype of every type, val x = y ?: throw Exception() still infers x as non-null.' },
    { id: 'kf28', front: 'What does class Wrapper(inner: Api) : Api by inner do?', back: 'Class delegation: the compiler generates forwarding implementations of every Api member to inner. You can override only the members you care about. It favors composition over inheritance without boilerplate.' },
    { id: 'kf29', front: 'Why are Kotlin classes final by default?', back: 'To avoid the fragile base class problem: a class must opt in to inheritance with open. Frameworks that need proxies (Hilt, Mockito) rely on the all-open plugin or interfaces; MockK can mock final classes.' },
    { id: 'kf30', front: 'What do out and in mean on a generic type parameter?', back: 'out T makes the type covariant: it only produces T, so List<String> can be used as List<Any>. in T makes it contravariant: it only consumes T, so Comparable<Any> can be used as Comparable<String>. Invariant types like MutableList allow neither.' }
  ],

  quizQuestions: [
    {
      id: 'kfq1',
      question: 'What does name?.length return if name is null?',
      options: ['0', 'NullPointerException', 'null', 'Empty string'],
      correctAnswer: 2,
      explanation: 'The safe call operator (?.) returns null if the receiver is null instead of throwing an exception.'
    },
    {
      id: 'kfq2',
      question: 'Which scope function returns the original object and uses "this"?',
      options: ['let', 'run', 'apply', 'with'],
      correctAnswer: 2,
      explanation: 'apply uses "this" as receiver and returns the original object. Perfect for object configuration.'
    },
    {
      id: 'kfq3',
      question: 'What is required for a data class primary constructor?',
      options: ['No parameters', 'At least one val/var parameter', 'Only var parameters', 'No annotations'],
      correctAnswer: 1,
      explanation: 'Data class primary constructor must have at least one val or var parameter.'
    },
    {
      id: 'kfq4',
      question: 'Why are sealed classes useful with when expressions?',
      options: ['Faster execution', 'Compiler enforces exhaustive branches', 'Enable inheritance', 'Allow null values'],
      correctAnswer: 1,
      explanation: 'Sealed classes restrict subclasses, so the compiler can verify all cases are handled in when expressions.'
    },
    {
      id: 'kfq5',
      question: 'What does the !! operator do?',
      options: ['Safe call', 'Returns default', 'Throws NPE if null', 'Casts to non-null'],
      correctAnswer: 2,
      explanation: 'The not-null assertion (!!) throws NullPointerException if the value is null. Use sparingly.'
    },
    {
      id: 'kfq6',
      question: 'How are extension functions resolved?',
      options: ['At runtime by actual type', 'At compile time by declared type', 'By reflection', 'By priority'],
      correctAnswer: 1,
      explanation: 'Extension functions are resolved statically at compile time based on the declared type, not runtime type.'
    },
    {
      id: 'kfq7',
      question: 'What does inline do for higher-order functions?',
      options: ['Makes them faster', 'Avoids lambda object creation', 'Enables tail recursion', 'Allows suspend'],
      correctAnswer: 1,
      explanation: 'inline copies the function body at call sites, avoiding the overhead of creating lambda objects.'
    },
    {
      id: 'kfq8',
      question: 'Which method is NOT auto-generated for data classes?',
      options: ['equals()', 'clone()', 'toString()', 'copy()'],
      correctAnswer: 1,
      explanation: 'Data classes generate equals(), hashCode(), toString(), copy(), and componentN(), but not clone().'
    },
    {
      id: 'kfq9',
      question: 'What is the result of val x = null ?: "default"?',
      options: ['null', '"default"', 'Exception', 'Empty string'],
      correctAnswer: 1,
      explanation: 'Elvis operator returns the right side when left is null. So null ?: "default" returns "default".'
    },
    {
      id: 'kfq10',
      question: 'What is a platform type in Kotlin?',
      options: ['Android-only type', 'Java type with unknown nullability', 'Primitive type', 'Generic type'],
      correctAnswer: 1,
      explanation: 'Platform types (Type!) come from Java with unknown nullability. Kotlin doesn\'t enforce null safety on them.'
    },
    {
      id: 'kfq11',
      question: 'data class User(val name: String) { var age = 0 }. Is age used by equals() and hashCode()?',
      options: ['Yes, all properties are used', 'Only if it is declared with var', 'No, only primary constructor properties are used', 'Only if annotated with @Include'],
      correctAnswer: 2,
      explanation: 'Data classes generate equals(), hashCode(), toString() and copy() from primary constructor properties only. Properties declared in the body are ignored.'
    },
    {
      id: 'kfq12',
      question: 'What happens when you read a lateinit var before it is assigned?',
      options: ['It returns null', 'UninitializedPropertyAccessException is thrown', 'A compile error', 'It returns the type\'s default value'],
      correctAnswer: 1,
      explanation: 'lateinit defers the null check to runtime. Reading before assignment throws UninitializedPropertyAccessException; use ::prop.isInitialized to check first.'
    },
    {
      id: 'kfq13',
      question: 'Why does fun <T> isType(x: Any) = x is T fail to compile?',
      options: ['Generic types are erased at runtime; the function must be inline with reified T', 'T must be declared as T : Any', 'is cannot be used on Any', 'Generic functions cannot return Boolean'],
      correctAnswer: 0,
      explanation: 'Because of type erasure the JVM does not know T at runtime. Only an inline function with a reified type parameter can check x is T, since the concrete type is substituted at each call site.'
    },
    {
      id: 'kfq14',
      question: 'What thread-safety mode does by lazy use by default?',
      options: ['LazyThreadSafetyMode.NONE', 'LazyThreadSafetyMode.PUBLICATION', 'LazyThreadSafetyMode.SYNCHRONIZED', 'It is not thread-safe by default'],
      correctAnswer: 2,
      explanation: 'The default is SYNCHRONIZED: only one thread runs the initializer and all others see the same value. Pass NONE when you know only one thread will access the property to avoid locking.'
    },
    {
      id: 'kfq15',
      question: '@JvmInline value class UserId(val raw: String). When does UserId get boxed into a real object?',
      options: ['Never, it is always inlined', 'Always, it is an ordinary class', 'When used as a nullable, generic type argument, or through an interface', 'Only when called from Java'],
      correctAnswer: 2,
      explanation: 'The compiler inlines the wrapper where the static type is UserId. Positions that need a reference type (UserId?, List<UserId>, an interface it implements) require boxing.'
    },
    {
      id: 'kfq16',
      question: 'What is the difference between == and === in Kotlin?',
      options: ['There is none', '== is structural (calls equals), === is referential identity', '== is referential identity, === is structural', '=== compares hashCode values'],
      correctAnswer: 1,
      explanation: '== translates to a null-safe equals() call. === checks whether two references point to the same object.'
    },
    {
      id: 'kfq17',
      question: 'fun process(list: List<Int>) { list.forEach { if (it == 0) return; println(it) } }. What does return do?',
      options: ['Returns from process() entirely (non-local return)', 'Exits only the current lambda iteration', 'Compile error: return is not allowed in a lambda', 'Throws an exception'],
      correctAnswer: 0,
      explanation: 'forEach is an inline function, so a bare return inside its lambda is a non-local return from the enclosing function. Use return@forEach to skip only the current element.'
    },
    {
      id: 'kfq18',
      question: 'Which allows a subtype to also extend an unrelated class?',
      options: ['sealed class', 'sealed interface', 'Both', 'Neither'],
      correctAnswer: 1,
      explanation: 'A class can extend only one superclass, so a sealed class subtype cannot extend anything else. Sealed interfaces have no such limit and a class can implement several of them.'
    },
    {
      id: 'kfq19',
      question: 'Can a List<String> be passed where a List<Any> is expected?',
      options: ['Yes, List is declared as List<out E>, so it is covariant', 'No, generics are invariant', 'Only with an unchecked cast', 'Only for MutableList'],
      correctAnswer: 0,
      explanation: 'The read-only List interface is declared with out, so List<String> is a subtype of List<Any>. MutableList is invariant because it both produces and consumes E.'
    },
    {
      id: 'kfq20',
      question: 'What is the Nothing return type used for?',
      options: ['Functions that return Unit', 'A nullable version of Unit', 'Abstract functions without a body', 'Functions that never return normally, e.g. always throw'],
      correctAnswer: 3,
      explanation: 'Nothing has no instances and marks code that never completes normally (throw, exitProcess, TODO). Being a subtype of every type, it lets the Elvis-throw idiom type-check.'
    }
  ]
};

// =============================================================================
// 2. ACTIVITY & FRAGMENTS
// =============================================================================
const activityFragments: AndroidCategory = {
  id: 'android-activity-fragments',
  name: 'Activity & Fragments',
  slug: 'activity-fragments',
  description: 'Activity lifecycle, Fragment management, navigation, and configuration changes',
  icon: 'layers-outline',
  color: '#3DDC84',
  colorDark: '#2DA866',

  learnContent: [
    {
      title: 'Activity Lifecycle',
      content: `Activities have a defined lifecycle that you must understand to handle state properly and avoid memory leaks.

**Lifecycle Callbacks:**
1. **onCreate**: Initialize activity, setContentView
2. **onStart**: Activity visible
3. **onResume**: Activity interactive (foreground)
4. **onPause**: Another activity gaining focus
5. **onStop**: Activity no longer visible
6. **onDestroy**: Activity being destroyed

**Key Scenarios:**
- Rotation: onPause → onStop → onDestroy → onCreate → onStart → onResume
- Home button: onPause → onStop
- Back: onPause → onStop → onDestroy
- Another activity: onPause → onStop (if fully covered)

**ViewModel survives configuration changes!**`,
      codeExample: `class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Check if this is a fresh start or recreation
        if (savedInstanceState == null) {
            // First time - initialize
            loadInitialData()
        } else {
            // Recreated - restore state
            val score = savedInstanceState.getInt("score")
        }
    }

    override fun onStart() {
        super.onStart()
        // Register listeners, bind services
    }

    override fun onResume() {
        super.onResume()
        // Start animations, acquire resources
    }

    override fun onPause() {
        super.onPause()
        // Pause animations, save transient state
    }

    override fun onStop() {
        super.onStop()
        // Unregister listeners, release resources
    }

    override fun onDestroy() {
        super.onDestroy()
        // Final cleanup (if not killed)
    }

    // Save instance state before destruction
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt("score", currentScore)
    }
}`
    },
    {
      title: 'Fragment Lifecycle',
      content: `Fragments have their own lifecycle that coordinates with their host activity.

**Additional Fragment Callbacks:**
- **onAttach**: Fragment attached to activity
- **onCreateView**: Create fragment UI
- **onViewCreated**: View is ready
- **onDestroyView**: View being destroyed
- **onDetach**: Fragment detached from activity

**View Lifecycle:**
Fragment can be retained while view is destroyed (back stack).
Always clear view references in onDestroyView.

**ViewLifecycleOwner:**
Use viewLifecycleOwner for observing LiveData in fragments.`,
      codeExample: `class MyFragment : Fragment() {

    // Binding only valid between onCreateView and onDestroyView
    private var _binding: FragmentMyBinding? = null
    private val binding get() = _binding!!

    override fun onAttach(context: Context) {
        super.onAttach(context)
        // Access activity, inject dependencies
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout via ViewBinding
        _binding = FragmentMyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup UI
        binding.button.setOnClickListener { doSomething() }

        // Observe LiveData with viewLifecycleOwner
        viewModel.data.observe(viewLifecycleOwner) { data ->
            binding.textView.text = data
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        // Clear binding to prevent memory leaks
        _binding = null
    }

    override fun onDetach() {
        super.onDetach()
        // Clear activity references
    }
}

// Fragment transaction
supportFragmentManager.commit {
    replace(R.id.container, MyFragment())
    addToBackStack("my_fragment")
}`
    },
    {
      title: 'Navigation Component',
      content: `Jetpack Navigation simplifies fragment transactions and provides type-safe argument passing.

**Components:**
- **NavGraph**: XML/Kotlin defining destinations and actions
- **NavHost**: Container for navigation (NavHostFragment)
- **NavController**: Controls navigation

**Safe Args:**
Type-safe argument passing between destinations.

**Benefits:**
- Handles fragment transactions
- Back stack management
- Deep linking support
- Transition animations`,
      codeExample: `// nav_graph.xml
/*
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.HomeFragment">

        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>

    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.DetailFragment">

        <argument
            android:name="itemId"
            app:argType="string" />
    </fragment>
</navigation>
*/

// Navigate with NavController
class HomeFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.itemButton.setOnClickListener {
            // Using Safe Args (generated class)
            val action = HomeFragmentDirections
                .actionHomeToDetail(itemId = "123")
            findNavController().navigate(action)
        }

        // Or using ID
        findNavController().navigate(R.id.action_home_to_detail)
    }
}

// Receive arguments
class DetailFragment : Fragment() {
    // Safe Args delegate: typed access to passed arguments
    private val args: DetailFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val itemId = args.itemId
    }
}

// Activity setup
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Get controller from NavHost, wire up the ActionBar
        val navController = findNavController(R.id.nav_host_fragment)
        setupActionBarWithNavController(navController)
    }
}`
    },
    {
      title: 'Configuration Changes',
      content: `Configuration changes (rotation, locale, etc.) destroy and recreate activities by default.

**Survival Strategies:**
1. **ViewModel**: Survives configuration changes
2. **onSaveInstanceState**: Save small UI state to Bundle
3. **android:configChanges**: Handle manually (not recommended)

**What to Save Where:**
- ViewModel: Data, loading state, business state
- SavedStateHandle: Small UI state, user input
- onSaveInstanceState: Transient state, scroll position

**Lifecycle-aware components** automatically handle config changes.`,
      codeExample: `// ViewModel survives configuration changes
class MainViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    fun loadUsers() {
        // Coroutine is cancelled when the ViewModel is cleared
        viewModelScope.launch {
            _users.value = repository.getUsers()
        }
    }
}

class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ViewModel data survives rotation
        viewModel.users.observe(this) { users ->
            adapter.submitList(users)
        }

        // Only load on first creation, not after rotation
        if (savedInstanceState == null) {
            viewModel.loadUsers()
        }
    }

    // Save small UI state
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt("scrollPosition", recyclerView.scrollPosition)
        outState.putString("searchQuery", searchView.query.toString())
    }
}

// SavedStateHandle in ViewModel
class SearchViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    // Automatically saved and restored
    var searchQuery: String
        get() = savedStateHandle["query"] ?: ""
        set(value) { savedStateHandle["query"] = value }

    // Re-runs the search whenever the saved query changes
    val results = savedStateHandle.getLiveData<String>("query")
        .switchMap { query ->
            repository.search(query)
        }
}`
    },
    {
      title: 'Intent and StartActivity',
      content: `Intents are messaging objects for requesting actions from other components.

**Intent Types:**
- **Explicit**: Specify exact component (class)
- **Implicit**: Specify action, let system find handler

**Starting Activities:**
- startActivity(): One-way navigation
- ActivityResult API: Get result back (replaces startActivityForResult)

**Intent Extras:**
Pass data between activities using putExtra/getExtra.`,
      codeExample: `// Explicit intent - specific component
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("ITEM_ID", itemId)
    putExtra("USER_NAME", userName)
}
startActivity(intent)

// Receive extras
class DetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val itemId = intent.getStringExtra("ITEM_ID")
        val userName = intent.getStringExtra("USER_NAME")
    }
}

// Implicit intent - action-based
val intent = Intent(Intent.ACTION_VIEW).apply {
    data = Uri.parse("https://example.com")
}
startActivity(intent)

// Activity Result API (modern approach)
class MainActivity : AppCompatActivity() {
    private val pickImage = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        // Handle the returned Uri
        uri?.let { loadImage(it) }
    }

    private val requestPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            accessCamera()
        }
    }

    fun onPickImageClick() {
        pickImage.launch("image/*")
    }

    fun onCameraClick() {
        requestPermission.launch(Manifest.permission.CAMERA)
    }
}

// Custom result contract
val startForResult = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
) { result ->
    if (result.resultCode == Activity.RESULT_OK) {
        val data = result.data?.getStringExtra("result")
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Activity Lifecycle',
      description: 'Key activity states',
      nodes: [
        { id: 'created', label: 'Created', x: 100, y: 50, type: 'info' },
        { id: 'resumed', label: 'Resumed', x: 250, y: 50, type: 'primary' },
        { id: 'paused', label: 'Paused', x: 100, y: 150, type: 'warning' },
        { id: 'destroyed', label: 'Destroyed', x: 250, y: 150, type: 'error' }
      ],
      edges: [
        { from: 'created', to: 'resumed' },
        { from: 'resumed', to: 'paused' },
        { from: 'paused', to: 'destroyed' },
        { from: 'paused', to: 'resumed' }
      ]
    },
    {
      title: 'Fragment Lifecycle',
      description: 'Fragment lifecycle states',
      nodes: [
        { id: 'attached', label: 'onAttach', x: 100, y: 50, type: 'info' },
        { id: 'viewcreated', label: 'onCreateView', x: 250, y: 50, type: 'primary' },
        { id: 'resumed', label: 'onResume', x: 100, y: 150, type: 'success' },
        { id: 'viewdestroyed', label: 'onDestroyView', x: 250, y: 150, type: 'warning' }
      ],
      edges: [
        { from: 'attached', to: 'viewcreated' },
        { from: 'viewcreated', to: 'resumed' },
        { from: 'resumed', to: 'viewdestroyed' },
        { from: 'viewdestroyed', to: 'attached' }
      ]
    }
  ],

  flashcards: [
    { id: 'af1', front: 'What lifecycle method should you use to initialize views?', back: 'onCreate() for activities, onViewCreated() for fragments. This is where you set up UI, bind views, and configure listeners.' },
    { id: 'af2', front: 'When is onSaveInstanceState called?', back: 'Before the activity may be destroyed (before onStop in newer Android). Used to save small amounts of UI state to a Bundle.' },
    { id: 'af3', front: 'Why use viewLifecycleOwner instead of this in fragments?', back: 'Fragment can outlive its view (when in back stack). viewLifecycleOwner is tied to the view lifecycle, preventing leaks and crashes.' },
    { id: 'af4', front: 'What happens to a ViewModel during rotation?', back: 'ViewModel survives configuration changes. The same instance is returned to the new activity, preserving data.' },
    { id: 'af5', front: 'What is the difference between add and replace fragment transaction?', back: 'add: Adds fragment on top (previous visible if transparent). replace: Removes previous fragment from container before adding new one.' },
    { id: 'af6', front: 'What is addToBackStack in fragment transactions?', back: 'Adds the transaction to the back stack. Pressing back will reverse the transaction instead of finishing the activity.' },
    { id: 'af7', front: 'What is NavController?', back: 'Manages app navigation within a NavHost. Handles fragment transactions, back stack, and navigation actions.' },
    { id: 'af8', front: 'What are Safe Args?', back: 'Gradle plugin generating type-safe classes for Navigation arguments. Prevents runtime errors from argument name/type mismatches.' },
    { id: 'af9', front: 'What is an explicit intent?', back: 'An intent specifying the exact component (class) to start. Used for launching your own components.' },
    { id: 'af10', front: 'What is an implicit intent?', back: 'An intent specifying an action without a specific component. System finds matching handlers (e.g., ACTION_VIEW for URLs).' },
    { id: 'af11', front: 'What replaced startActivityForResult?', back: 'Activity Result API (registerForActivityResult). More type-safe and lifecycle-aware way to get results from activities.' },
    { id: 'af12', front: 'When is onDestroyView called but not onDestroy?', back: 'When fragment is added to back stack. The view is destroyed but fragment instance remains. View recreated when popped.' },
    { id: 'af13', front: 'What is SavedStateHandle?', back: 'A key-value map in ViewModel that survives process death. Can be used with Hilt injection for saving ViewModel state.' },
    { id: 'af14', front: 'What lifecycle method pairs should be matched?', back: 'onCreate/onDestroy, onStart/onStop, onResume/onPause. Resources acquired in one should be released in its pair.' },
    { id: 'af15', front: 'What happens when you press the Home button?', back: 'Activity goes through onPause → onStop. It\'s still alive but not visible. Returns through onRestart → onStart → onResume.' },
    { id: 'af16', front: 'What is the practical difference between onPause and onStop?', back: 'onPause: the activity lost focus but may still be partially visible (dialog, multi-window), so keep it light and fast. onStop: the activity is no longer visible; release heavier resources (camera, sensors, location updates) here.' },
    { id: 'af17', front: 'What is process death and how do you reproduce it?', back: 'The OS kills a backgrounded app to reclaim memory. On return, the activity is recreated with its saved instance state Bundle but all in-memory objects, including ViewModels, are gone (only SavedStateHandle survives). Reproduce with adb shell am kill <package> or the Terminate Application button in Logcat.' },
    { id: 'af18', front: 'What does android:configChanges do and why is it discouraged?', back: 'Declaring configChanges (e.g. orientation|screenSize) stops the system from recreating the activity and calls onConfigurationChanged instead, so you must update resources manually. It is discouraged except for cases like video playback or games where recreation is too costly.' },
    { id: 'af19', front: 'What is a PendingIntent?', back: 'A token that lets another process (system, notification manager, AlarmManager, widgets) perform an Intent later with your app\'s identity and permissions. On Android 12+ you must specify FLAG_IMMUTABLE or FLAG_MUTABLE.' },
    { id: 'af20', front: 'What are the four activity launch modes?', back: 'standard: new instance every time. singleTop: reuse if already at the top of the stack (onNewIntent). singleTask: one instance per task; launching it clears activities above it. singleInstance: like singleTask but the activity is alone in its task.' },
    { id: 'af21', front: 'What is a task in Android?', back: 'A collection of activities the user interacts with, arranged in a back stack. Back pops the top activity; Recents shows tasks. Flags like FLAG_ACTIVITY_NEW_TASK and taskAffinity control which task an activity joins.' },
    { id: 'af22', front: 'When is onNewIntent called?', back: 'When an existing activity instance (singleTop, singleTask, or FLAG_ACTIVITY_SINGLE_TOP) receives a new Intent instead of being recreated. getIntent() still returns the original intent unless you call setIntent(intent) yourself.' },
    { id: 'af23', front: 'How should back navigation be handled today?', back: 'Register an OnBackPressedCallback with the OnBackPressedDispatcher instead of overriding the deprecated onBackPressed(). This works with fragments, Compose (BackHandler) and predictive back (android:enableOnBackInvokedCallback).' },
    { id: 'af24', front: 'What is the difference between childFragmentManager and parentFragmentManager?', back: 'childFragmentManager manages fragments nested inside this fragment and follows its lifecycle. parentFragmentManager is the manager that hosts this fragment (the activity\'s supportFragmentManager or a parent fragment\'s childFragmentManager).' },
    { id: 'af25', front: 'How should two fragments communicate?', back: 'Through a shared ViewModel scoped to the activity or navigation graph, or the Fragment Result API (setFragmentResult / setFragmentResultListener). Avoid holding direct references to sibling fragments or casting the activity to an interface.' },
    { id: 'af26', front: 'Why must a Fragment have a public no-argument constructor?', back: 'On configuration change or process death the FragmentManager re-instantiates fragments reflectively, so constructor parameters would be lost. Pass data through the arguments Bundle, or use a FragmentFactory for constructor injection.' },
    { id: 'af27', front: 'What is the difference between commit(), commitNow() and commitAllowingStateLoss()?', back: 'commit() schedules the transaction asynchronously on the main thread. commitNow() executes it synchronously but cannot be added to the back stack. commitAllowingStateLoss() will not throw after onSaveInstanceState, but the transaction may be lost if the activity is recreated.' },
    { id: 'af28', front: 'What causes "Can not perform this action after onSaveInstanceState"?', back: 'Committing a FragmentTransaction after the activity state was saved. The transaction would not be restored after process death, so FragmentManager throws IllegalStateException. Commit only while the lifecycle is at least STARTED, e.g. from a lifecycle-aware observer.' },
    { id: 'af29', front: 'How do you know whether onDestroy is due to finish() or a configuration change?', back: 'isFinishing() is true when the activity is really going away (finish() or back). isChangingConfigurations() is true during rotation or other config changes, where the activity will be recreated immediately.' },
    { id: 'af30', front: 'When must registerForActivityResult be called?', back: 'Before the activity or fragment reaches STARTED, typically as a property initializer or in onCreate. Registering later (e.g. inside a click listener) throws IllegalStateException, because the callback must exist to receive results after recreation.' }
  ],

  quizQuestions: [
    {
      id: 'afq1',
      question: 'Which lifecycle method is called when activity becomes visible?',
      options: ['onCreate', 'onStart', 'onResume', 'onRestart'],
      correctAnswer: 1,
      explanation: 'onStart is called when the activity becomes visible. onResume is called when it becomes interactive.'
    },
    {
      id: 'afq2',
      question: 'What survives configuration changes (like rotation)?',
      options: ['Activity instance', 'Fragment instance', 'ViewModel instance', 'Intent extras'],
      correctAnswer: 2,
      explanation: 'ViewModel survives configuration changes. Activity and Fragment are destroyed and recreated.'
    },
    {
      id: 'afq3',
      question: 'Why should you null the binding in onDestroyView?',
      options: ['For performance', 'To prevent memory leaks', 'Required by ViewBinding', 'For animations'],
      correctAnswer: 1,
      explanation: 'Fragment can outlive its view. Keeping view references after onDestroyView causes memory leaks.'
    },
    {
      id: 'afq4',
      question: 'What is the purpose of addToBackStack?',
      options: ['Save state', 'Enable back navigation', 'Improve performance', 'Handle rotation'],
      correctAnswer: 1,
      explanation: 'addToBackStack adds the transaction to the back stack, so pressing back reverses the transaction.'
    },
    {
      id: 'afq5',
      question: 'Which component manages navigation in Navigation Component?',
      options: ['NavGraph', 'NavHost', 'NavController', 'FragmentManager'],
      correctAnswer: 2,
      explanation: 'NavController manages navigation, handles the back stack, and navigates between destinations.'
    },
    {
      id: 'afq6',
      question: 'What is called first when a fragment is attached?',
      options: ['onCreate', 'onCreateView', 'onAttach', 'onViewCreated'],
      correctAnswer: 2,
      explanation: 'onAttach is the first callback, called when fragment is attached to its context (activity).'
    },
    {
      id: 'afq7',
      question: 'What API replaced startActivityForResult?',
      options: ['Intent Result API', 'Activity Result API', 'Launch Result API', 'Contract Result API'],
      correctAnswer: 1,
      explanation: 'Activity Result API with registerForActivityResult provides a type-safe, lifecycle-aware replacement.'
    },
    {
      id: 'afq8',
      question: 'What happens to fragment view when navigating away with back stack?',
      options: ['Kept in memory', 'Destroyed', 'Saved to bundle', 'Cached'],
      correctAnswer: 1,
      explanation: 'The view is destroyed (onDestroyView), but the fragment instance remains. View is recreated when popped.'
    },
    {
      id: 'afq9',
      question: 'Which lifecycle callback should you use to observe LiveData in fragments?',
      options: ['onCreate', 'onCreateView', 'onViewCreated', 'onStart'],
      correctAnswer: 2,
      explanation: 'onViewCreated is ideal - view exists and you can use viewLifecycleOwner for observation.'
    },
    {
      id: 'afq10',
      question: 'What type of intent specifies an action without a target component?',
      options: ['Explicit intent', 'Implicit intent', 'Pending intent', 'Broadcast intent'],
      correctAnswer: 1,
      explanation: 'Implicit intents specify an action (like ACTION_VIEW) and let the system find matching handlers.'
    },
    {
      id: 'afq11',
      question: 'A translucent dialog activity from another app partially covers your activity. Which callback runs?',
      options: ['onStop', 'onPause', 'onDestroy', 'onSaveInstanceState only'],
      correctAnswer: 1,
      explanation: 'The activity loses focus but stays partially visible, so only onPause runs. onStop is called only when the activity is fully hidden.'
    },
    {
      id: 'afq12',
      question: 'What is the callback order when the device rotates?',
      options: ['onPause, onDestroy, onCreate, onResume', 'onStop, onSaveInstanceState, onDestroy, onCreate, onStart', 'onPause, onStop, onSaveInstanceState, onDestroy, onCreate, onStart, onRestoreInstanceState, onResume', 'onSaveInstanceState, onPause, onStop, onCreate, onResume'],
      correctAnswer: 2,
      explanation: 'The activity is torn down (onPause, onStop, onSaveInstanceState, onDestroy) and rebuilt (onCreate, onStart, onRestoreInstanceState, onResume). Since API 28 onSaveInstanceState runs after onStop.'
    },
    {
      id: 'afq13',
      question: 'Which of these survives rotation but is lost after process death?',
      options: ['The onSaveInstanceState Bundle', 'Values stored in SavedStateHandle', 'Plain fields inside a ViewModel', 'Intent extras'],
      correctAnswer: 2,
      explanation: 'ViewModels are retained across configuration changes but live in memory, so process death destroys them. Bundle, SavedStateHandle and Intent extras are restored by the system.'
    },
    {
      id: 'afq14',
      question: 'An activity with launchMode="singleTop" is on top of the stack and is started again. What happens?',
      options: ['A second instance is pushed on top', 'onNewIntent is delivered to the existing instance', 'The task is cleared and it restarts', 'onCreate runs again on the same instance'],
      correctAnswer: 1,
      explanation: 'singleTop reuses the instance only when it is already at the top; it receives the Intent via onNewIntent. If it were lower in the stack a new instance would be created.'
    },
    {
      id: 'afq15',
      question: 'What must you specify when creating a PendingIntent on Android 12 (API 31) and above?',
      options: ['FLAG_ONE_SHOT', 'FLAG_UPDATE_CURRENT', 'Either FLAG_IMMUTABLE or FLAG_MUTABLE', 'FLAG_CANCEL_CURRENT'],
      correctAnswer: 2,
      explanation: 'Targeting API 31+ requires an explicit mutability flag or creation throws IllegalArgumentException. Prefer FLAG_IMMUTABLE unless another app must fill in the Intent (e.g. direct reply).'
    },
    {
      id: 'afq16',
      question: 'Why does Android require fragments to have a public no-arg constructor?',
      options: ['FragmentManager re-creates them reflectively during restore', 'Hilt needs it for injection', 'ViewBinding requires it', 'Kotlin data classes require it'],
      correctAnswer: 0,
      explanation: 'On configuration change or process death the system instantiates the fragment class by reflection and restores its arguments Bundle. Constructor parameters would not be restored.'
    },
    {
      id: 'afq17',
      question: 'Which FragmentTransaction commit method cannot be combined with addToBackStack?',
      options: ['commit()', 'commitAllowingStateLoss()', 'All of them can', 'commitNow()'],
      correctAnswer: 3,
      explanation: 'commitNow() executes synchronously and throws if the transaction was added to the back stack, because back stack ordering relies on asynchronous execution.'
    },
    {
      id: 'afq18',
      question: 'In onDestroy, how do you know the activity is being recreated for a configuration change rather than finishing?',
      options: ['isChangingConfigurations() returns true', 'isFinishing() returns true', 'savedInstanceState is null', 'onStop was skipped'],
      correctAnswer: 0,
      explanation: 'isChangingConfigurations() is true during rotation and similar changes. isFinishing() is true when the activity is really ending, which is when you should release shared resources.'
    },
    {
      id: 'afq19',
      question: 'Two sibling fragments need to share a selected item. What is the recommended approach?',
      options: ['Cast requireActivity() to a listener interface', 'A static singleton holding the item', 'A shared ViewModel via activityViewModels() or the Fragment Result API', 'findFragmentByTag and call a method on the sibling'],
      correctAnswer: 2,
      explanation: 'A ViewModel scoped to the activity or nav graph keeps fragments decoupled and survives rotation. The Fragment Result API handles one-off results. Direct references couple fragments and break on recreation.'
    },
    {
      id: 'afq20',
      question: 'You start activity B with FLAG_ACTIVITY_CLEAR_TOP and B already exists in the stack under C and D. What happens?',
      options: ['A new task is created for B', 'The entire back stack is cleared', 'Nothing unless B is singleInstance', 'C and D are finished and the Intent is delivered to B'],
      correctAnswer: 3,
      explanation: 'CLEAR_TOP finishes everything above the existing B. B itself is recreated unless it is singleTop or the intent also has FLAG_ACTIVITY_SINGLE_TOP, in which case it gets onNewIntent.'
    }
  ]
};

// =============================================================================
// 3. JETPACK COMPOSE
// =============================================================================
const jetpackCompose: AndroidCategory = {
  id: 'android-compose',
  name: 'Jetpack Compose',
  slug: 'jetpack-compose',
  description: 'Declarative UI, state management, composables, and theming',
  icon: 'color-wand-outline',
  color: '#4285F4',
  colorDark: '#2A6AC7',
  premium: true,

  learnContent: [
    {
      title: 'Composable Basics',
      content: `Jetpack Compose is Android's modern toolkit for building native UI with declarative syntax.

**Key Concepts:**
- **Composable functions**: Building blocks of UI (annotated with @Composable)
- **Declarative**: Describe what UI should look like
- **Recomposition**: UI automatically updates when state changes

**Benefits:**
- Less code than XML layouts
- Kotlin-first, no XML
- Powerful preview tools
- Better performance with smart recomposition

**Basic Composables:**
Text, Image, Button, Row, Column, Box`,
      codeExample: `// A composable is a function that emits UI
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}

// Composables are functions that emit UI
@Composable
fun UserCard(user: User) {
    // Row places avatar and text side by side
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Circular avatar image
        Image(
            painter = painterResource(R.drawable.avatar),
            contentDescription = "Avatar",
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
        )
        Spacer(modifier = Modifier.width(16.dp))  // Gap between elements
        // Name stacked above email
        Column {
            Text(
                text = user.name,
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = user.email,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// Preview in Android Studio
@Preview(showBackground = true)
@Composable
fun UserCardPreview() {
    MyTheme {
        UserCard(User("John Doe", "john@example.com"))
    }
}`
    },
    {
      title: 'State in Compose',
      content: `Compose uses state to determine what to display. When state changes, affected composables recompose.

**State Holders:**
- **remember**: Survive recomposition
- **rememberSaveable**: Survive configuration changes
- **mutableStateOf**: Observable state

**State Hoisting:**
Move state up to make composables stateless and reusable.

**Derived State:**
Use derivedStateOf to calculate values from other state without recomposition on every change.`,
      codeExample: `// State in composable
@Composable
fun Counter() {
    // Remember state across recompositions
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}

// rememberSaveable for configuration changes
@Composable
fun SearchField() {
    var query by rememberSaveable { mutableStateOf("") }

    TextField(
        value = query,
        onValueChange = { query = it },
        placeholder = { Text("Search...") }
    )
}

// State hoisting - move state up
@Composable
fun StatelessCounter(
    count: Int,
    onIncrement: () -> Unit
) {
    Button(onClick = onIncrement) {
        Text("Count: $count")
    }
}

@Composable
fun StatefulCounter() {
    var count by remember { mutableStateOf(0) }
    StatelessCounter(count = count, onIncrement = { count++ })
}

// Derived state
@Composable
fun FilteredList(items: List<String>) {
    var searchQuery by remember { mutableStateOf("") }

    // Only recalculates when items or searchQuery changes
    val filteredItems by remember(items, searchQuery) {
        derivedStateOf {
            items.filter { it.contains(searchQuery, ignoreCase = true) }
        }
    }

    Column {
        TextField(value = searchQuery, onValueChange = { searchQuery = it })
        LazyColumn {
            items(filteredItems) { item ->
                Text(item)
            }
        }
    }
}`
    },
    {
      title: 'Modifiers',
      content: `Modifiers configure composables - size, layout, appearance, and behavior.

**Key Points:**
- Modifiers are ordered (chain matters)
- Each modifier wraps the previous
- Common: padding, size, background, clickable

**Categories:**
- Layout: size, padding, fillMaxWidth
- Drawing: background, border, clip
- Interaction: clickable, scrollable
- Semantics: contentDescription`,
      codeExample: `// Order matters!
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)          // 1. Padding outside
        .background(Color.Blue)  // 2. Background (includes padding)
        .padding(8.dp)           // 3. More padding inside
)

// vs
Text(
    text = "Hello",
    modifier = Modifier
        .background(Color.Blue)  // 1. Background only around text
        .padding(16.dp)          // 2. Padding outside background
)

// Common modifier patterns
@Composable
fun StyledCard(onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick() }
            .semantics { contentDescription = "User card" }
    ) {
        // Content
    }
}

// Size modifiers
Box(
    modifier = Modifier
        .size(100.dp)              // Fixed size
        .fillMaxWidth()            // Fill parent width
        .fillMaxHeight(0.5f)       // Half parent height
        .wrapContentSize()         // Wrap content
        .requiredSize(50.dp)       // Ignore parent constraints
)

// Combining modifiers
fun Modifier.cardStyle() = this
    .fillMaxWidth()
    .padding(16.dp)
    .background(Color.White, RoundedCornerShape(8.dp))
    .border(1.dp, Color.Gray, RoundedCornerShape(8.dp))

// Usage
Box(modifier = Modifier.cardStyle()) { }`
    },
    {
      title: 'Lists with LazyColumn/LazyRow',
      content: `Lazy composables only compose visible items, like RecyclerView but declarative.

**LazyColumn/LazyRow:**
- Vertical/horizontal scrolling lists
- Only composes visible items
- items() DSL for content

**Keys:**
Provide stable keys for efficient updates and animations.

**Performance:**
- Avoid creating objects in items
- Use remember for expensive calculations
- Consider contentType for better recycling`,
      codeExample: `@Composable
fun UserList(users: List<User>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Header
        item {
            Text(
                "Users",
                style = MaterialTheme.typography.headlineMedium
            )
        }

        // List items with keys
        items(
            items = users,
            key = { user -> user.id }  // Stable key
        ) { user ->
            UserCard(user = user)
        }

        // Footer
        item {
            Text("End of list")
        }
    }
}

// With index
LazyColumn {
    itemsIndexed(users) { index, user ->
        Text("$index: \${user.name}")
    }
}

// Grid layout
@Composable
fun PhotoGrid(photos: List<Photo>) {
    LazyVerticalGrid(
        // Fit as many 100dp+ columns as the screen allows
        columns = GridCells.Adaptive(minSize = 100.dp),
        contentPadding = PaddingValues(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(photos, key = { it.id }) { photo ->
            AsyncImage(
                model = photo.url,
                contentDescription = null,
                modifier = Modifier
                    .aspectRatio(1f)  // Square cells
                    .clip(RoundedCornerShape(8.dp))
            )
        }
    }
}

// Sticky headers
LazyColumn {
    // Group by first letter; header pins while its group scrolls
    users.groupBy { it.name.first() }.forEach { (letter, users) ->
        stickyHeader {
            Text(
                text = letter.toString(),
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(8.dp)
            )
        }
        items(users) { user ->
            UserCard(user)
        }
    }
}`
    },
    {
      title: 'Side Effects',
      content: `Side effects are operations that affect state outside a composable, like API calls or navigation.

**Effect APIs:**
- **LaunchedEffect**: Run suspend function when key changes
- **rememberCoroutineScope**: Get scope for callbacks
- **DisposableEffect**: Setup/cleanup with lifecycle
- **SideEffect**: Run after every successful recomposition
- **derivedStateOf**: Derive state efficiently`,
      codeExample: `// LaunchedEffect - runs when key changes
@Composable
fun UserProfile(userId: String) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        // Runs when userId changes
        user = fetchUser(userId)
    }

    user?.let { UserCard(it) }
}

// rememberCoroutineScope - for callbacks
@Composable
fun SubmitButton(onSubmit: suspend () -> Unit) {
    val scope = rememberCoroutineScope()

    Button(onClick = {
        scope.launch {
            onSubmit()
        }
    }) {
        Text("Submit")
    }
}

// DisposableEffect - setup and cleanup
@Composable
fun AnalyticsScreen(screenName: String) {
    DisposableEffect(screenName) {
        analytics.trackScreenView(screenName)

        onDispose {
            analytics.trackScreenExit(screenName)
        }
    }
}

// Lifecycle observer
@Composable
fun LifecycleAwareComposable() {
    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> { /* Start */ }
                Lifecycle.Event.ON_PAUSE -> { /* Stop */ }
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)

        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
}

// Collecting Flow
@Composable
fun FlowCollector(viewModel: MyViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // Or with LaunchedEffect for one-time events
    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is Event.ShowSnackbar -> { /* show */ }
                is Event.Navigate -> { /* navigate */ }
            }
        }
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Recomposition',
      description: 'How Compose updates UI when state changes',
      nodes: [
        { id: 'state', label: 'State\nchanges', x: 100, y: 50, type: 'primary' },
        { id: 'compose', label: 'Compose\nruntime', x: 250, y: 50, type: 'secondary' },
        { id: 'recompose', label: 'Recompose\naffected', x: 100, y: 150, type: 'info' },
        { id: 'skip', label: 'Skip\nunchanged', x: 250, y: 150, type: 'success' }
      ],
      edges: [
        { from: 'state', to: 'compose' },
        { from: 'compose', to: 'recompose' },
        { from: 'compose', to: 'skip' }
      ]
    },
    {
      title: 'State Hoisting',
      description: 'Moving state up for reusability',
      nodes: [
        { id: 'parent', label: 'Stateful\nParent', x: 100, y: 50, type: 'primary' },
        { id: 'state', label: 'State ↓', x: 250, y: 50, type: 'info' },
        { id: 'child', label: 'Stateless\nChild', x: 100, y: 150, type: 'secondary' },
        { id: 'event', label: 'Event ↑', x: 250, y: 150, type: 'warning' }
      ],
      edges: [
        { from: 'parent', to: 'child' },
        { from: 'state', to: 'child' },
        { from: 'child', to: 'event' }
      ]
    }
  ],

  flashcards: [
    { id: 'jc1', front: 'What is recomposition in Compose?', back: 'The process of re-executing composable functions when their inputs change. Only affected composables recompose, not the entire UI.' },
    { id: 'jc2', front: 'What is the difference between remember and rememberSaveable?', back: 'remember survives recomposition. rememberSaveable also survives configuration changes (rotation) by saving to Bundle.' },
    { id: 'jc3', front: 'What is state hoisting?', back: 'Moving state up to a parent composable. Child becomes stateless, receiving state and events as parameters. Improves reusability and testability.' },
    { id: 'jc4', front: 'Why does modifier order matter?', back: 'Modifiers are applied in order, each wrapping the previous. padding().background() puts background inside padding; background().padding() puts it outside.' },
    { id: 'jc5', front: 'What is LaunchedEffect used for?', back: 'Running suspend functions when a key changes. Used for one-time effects like data loading or navigation. Cancels and restarts on key change.' },
    { id: 'jc6', front: 'What is DisposableEffect for?', back: 'Setup and cleanup effects with lifecycle. Returns onDispose block for cleanup when composable leaves composition or key changes.' },
    { id: 'jc7', front: 'Why provide keys to LazyColumn items?', back: 'Keys help Compose identify items for efficient updates and animations. Without stable keys, reordering causes unnecessary recomposition.' },
    { id: 'jc8', front: 'What is derivedStateOf?', back: 'Creates derived state that only recalculates when its inputs change. Avoids unnecessary recalculations during recomposition.' },
    { id: 'jc9', front: 'What is rememberCoroutineScope?', back: 'Provides a CoroutineScope tied to the composable lifecycle. Use for launching coroutines from callbacks (onClick).' },
    { id: 'jc10', front: 'What is CompositionLocal?', back: 'Implicit dependency passing through the composition tree. Avoids passing values through every composable. Examples: LocalContext, LocalLifecycleOwner.' },
    { id: 'jc11', front: 'What is the difference between Column and LazyColumn?', back: 'Column composes all children immediately. LazyColumn only composes visible items, like RecyclerView. Use LazyColumn for long lists.' },
    { id: 'jc12', front: 'What makes a composable skippable?', back: 'Stable parameters that haven\'t changed. Compose skips recomposition of composables whose inputs are unchanged.' },
    { id: 'jc13', front: 'What is collectAsStateWithLifecycle?', back: 'Collects Flow as State, respecting lifecycle. Stops collection when lifecycle is below STARTED, preventing wasted resources.' },
    { id: 'jc14', front: 'What annotation marks a composable function?', back: '@Composable. It tells the compiler this function can emit UI and participate in recomposition.' },
    { id: 'jc15', front: 'What is SideEffect used for?', back: 'Running code after every successful recomposition. Used to sync Compose state with non-Compose code (analytics, logging).' },
    { id: 'jc16', front: 'What are the three phases of a Compose frame?', back: 'Composition (what UI to show), Layout (measure and place), Drawing (render). Compose tracks which phase reads a state; reading it inside a lambda such as Modifier.offset { } or drawBehind { } only re-runs that phase and skips recomposition.' },
    { id: 'jc17', front: 'What makes a type stable for the Compose compiler?', back: 'All public properties are val of stable types, or the class is annotated @Stable/@Immutable. Primitives, String and function types are stable; List and Map interfaces are unstable by default because their implementation may be mutable. Types from other modules without a stability config are treated as unstable.' },
    { id: 'jc18', front: 'What problem does rememberUpdatedState solve?', back: 'A long-running effect like LaunchedEffect(Unit) captures its lambdas at launch. rememberUpdatedState keeps a reference that always reflects the latest value without restarting the effect, so the effect calls the newest callback.' },
    { id: 'jc19', front: 'What is produceState?', back: 'A composable that launches a coroutine scoped to the composition and exposes its results as State. Useful for turning suspend calls or callback APIs into State that restarts when its keys change.' },
    { id: 'jc20', front: 'What does snapshotFlow do?', back: 'Converts reads of Compose State into a cold Flow that emits when the read values change (distinct only). Typical use: snapshotFlow { listState.firstVisibleItemIndex } inside LaunchedEffect to react to scrolling.' },
    { id: 'jc21', front: 'When should you use derivedStateOf instead of remember(key)?', back: 'When the derived result changes far less often than its inputs. remember(key) recomputes and recomposes on every key change; derivedStateOf only notifies readers when the computed value actually changes, e.g. showButton = firstVisibleItemIndex > 0.' },
    { id: 'jc22', front: 'What is a slot API?', back: 'A composable that takes @Composable lambda parameters (slots) so callers supply arbitrary content, e.g. Scaffold(topBar = { }, content = { }). It keeps components flexible without exploding the number of parameters.' },
    { id: 'jc23', front: 'What is a backwards write and why is it bad?', back: 'Writing to a state that was already read earlier in the same composition. It invalidates the current composition immediately, causing repeated recompositions or an infinite loop. Mutate state from event handlers or effects instead.' },
    { id: 'jc24', front: 'Why can a lambda parameter make a composable non-skippable?', back: 'A lambda that captures unstable values (like a ViewModel) is a new instance each recomposition, so the parameter is seen as changed. Fix by capturing only stable values, using method references, or enabling strong skipping mode, which memoizes lambdas automatically.' },
    { id: 'jc25', front: 'Why does adding to a MutableList inside mutableStateOf not trigger recomposition?', back: 'MutableState only notifies when its value reference changes; mutating the list in place does not. Use mutableStateListOf for observable mutation, or store an immutable List and assign a new copy.' },
    { id: 'jc26', front: 'How does Compose interoperate with the View system?', back: 'AndroidView embeds a View (MapView, WebView) inside Compose; ComposeView hosts composables inside XML or fragments via setContent. In fragments set ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed to avoid leaks.' },
    { id: 'jc27', front: 'What is the key() composable for?', back: 'It gives identity to composables emitted in a loop outside lazy layouts, e.g. Column with a for loop. Without key(item.id), reordering items causes remembered state to attach to the wrong item.' },
    { id: 'jc28', front: 'What is the semantics tree?', back: 'A parallel description of the UI used by accessibility services and tests. Modifiers like contentDescription, semantics { }, testTag and mergeDescendants shape it; onNode matchers query it.' },
    { id: 'jc29', front: 'What is the difference between compositionLocalOf and staticCompositionLocalOf?', back: 'compositionLocalOf tracks readers so only composables that read the value recompose when it changes. staticCompositionLocalOf does not track reads, so a change recomposes the entire content lambda; it is cheaper for values that rarely change (themes).' },
    { id: 'jc30', front: 'How should one-off events like navigation or snackbars flow from ViewModel to Compose UI?', back: 'Prefer modelling them as UI state that the UI consumes and then reports back as handled (e.g. errorMessage then onErrorShown()). Channels/SharedFlow collected in a LaunchedEffect can drop events during configuration changes or when the app is backgrounded.' }
  ],

  quizQuestions: [
    {
      id: 'jcq1',
      question: 'What survives configuration changes like rotation?',
      options: ['remember', 'rememberSaveable', 'LaunchedEffect', 'mutableStateOf'],
      correctAnswer: 1,
      explanation: 'rememberSaveable survives configuration changes by saving state to Bundle. remember only survives recomposition.'
    },
    {
      id: 'jcq2',
      question: 'Which composable is used for efficient scrolling lists?',
      options: ['Column', 'LazyColumn', 'ScrollableColumn', 'RecyclerView'],
      correctAnswer: 1,
      explanation: 'LazyColumn only composes visible items, providing efficient scrolling like RecyclerView.'
    },
    {
      id: 'jcq3',
      question: 'What is state hoisting?',
      options: ['Caching state', 'Moving state to parent', 'Persisting state', 'Optimizing state'],
      correctAnswer: 1,
      explanation: 'State hoisting moves state up to a parent composable, making children stateless and reusable.'
    },
    {
      id: 'jcq4',
      question: 'Which effect runs when a key changes?',
      options: ['SideEffect', 'LaunchedEffect', 'DisposableEffect', 'rememberUpdatedState'],
      correctAnswer: 1,
      explanation: 'LaunchedEffect runs its suspend block when the key changes, canceling previous execution.'
    },
    {
      id: 'jcq5',
      question: 'Why do modifier order matter?',
      options: ['Performance', 'Compilation', 'Each wraps the previous', 'Alphabetical'],
      correctAnswer: 2,
      explanation: 'Modifiers are applied in sequence, each wrapping the result of the previous. Order affects final appearance.'
    },
    {
      id: 'jcq6',
      question: 'What triggers recomposition?',
      options: ['Timer', 'State change', 'User input only', 'Lifecycle events'],
      correctAnswer: 1,
      explanation: 'Recomposition is triggered when state read by a composable changes.'
    },
    {
      id: 'jcq7',
      question: 'What is derivedStateOf used for?',
      options: ['State persistence', 'Derived state that minimizes recalculation', 'State sharing', 'Async state'],
      correctAnswer: 1,
      explanation: 'derivedStateOf creates derived state that only recalculates when its inputs change, avoiding unnecessary work.'
    },
    {
      id: 'jcq8',
      question: 'What does DisposableEffect return?',
      options: ['State', 'onDispose block', 'Coroutine', 'Nothing'],
      correctAnswer: 1,
      explanation: 'DisposableEffect returns an onDispose block for cleanup when the composable leaves composition.'
    },
    {
      id: 'jcq9',
      question: 'How do you get a CoroutineScope for callbacks?',
      options: ['LaunchedEffect', 'rememberCoroutineScope', 'viewModelScope', 'GlobalScope'],
      correctAnswer: 1,
      explanation: 'rememberCoroutineScope provides a CoroutineScope tied to the composable for use in callbacks.'
    },
    {
      id: 'jcq10',
      question: 'What annotation is required for composable functions?',
      options: ['@Component', '@Composable', '@UI', '@View'],
      correctAnswer: 1,
      explanation: '@Composable marks functions that can emit UI and participate in the composition.'
    },
    {
      id: 'jcq11',
      question: 'val items = remember { mutableListOf<String>() }; a button calls items.add("x") but the list on screen never updates. Why?',
      options: ['remember blocks updates', 'You must use rememberSaveable', 'MutableList is not observable state; use mutableStateListOf', 'add() must run on Dispatchers.Main'],
      correctAnswer: 2,
      explanation: 'Compose only observes snapshot state. A plain MutableList changes silently. mutableStateListOf() notifies on element changes, or replace an immutable List held in mutableStateOf.'
    },
    {
      id: 'jcq12',
      question: 'LaunchedEffect(Unit) starts a 5s timer and then calls onTimeout, but onTimeout may change during those 5s. How do you call the latest one without restarting the timer?',
      options: ['LaunchedEffect(onTimeout)', 'rememberUpdatedState(onTimeout)', 'derivedStateOf { onTimeout }', 'SideEffect { onTimeout() }'],
      correctAnswer: 1,
      explanation: 'rememberUpdatedState keeps a State that always holds the newest lambda. Keying the effect on onTimeout would restart the timer on every change.'
    },
    {
      id: 'jcq13',
      question: 'A state is read only inside Modifier.offset { IntOffset(x, 0) }. Which phase re-runs when x changes?',
      options: ['All three phases', 'Composition only', 'Layout only, skipping recomposition', 'Drawing only'],
      correctAnswer: 2,
      explanation: 'The lambda version of offset defers the read to the layout phase, so Compose re-measures and places without recomposing. The non-lambda offset(x) would read x during composition.'
    },
    {
      id: 'jcq14',
      question: 'Which parameter type is treated as unstable by the Compose compiler by default?',
      options: ['String', 'Int', 'List<String>', 'A same-module data class with only val String fields'],
      correctAnswer: 2,
      explanation: 'List is an interface whose implementation may be mutable, so the compiler cannot prove stability. Use ImmutableList, wrap it in an @Immutable class, or a stability configuration file.'
    },
    {
      id: 'jcq15',
      question: 'What happens if a composable writes to a state it already read during the same composition?',
      options: ['Compile error', 'The write is ignored', 'The composition is invalidated again, leading to repeated recompositions', 'The state resets to its initial value'],
      correctAnswer: 2,
      explanation: 'This is a backwards write. Compose schedules another recomposition immediately, and if the write happens every time you get an infinite loop. Move writes into event handlers or effects.'
    },
    {
      id: 'jcq16',
      question: 'When is derivedStateOf the right tool rather than remember(key) { }?',
      options: ['When the derived value changes much less often than the state it reads', 'When the value must survive rotation', 'When the computation is a suspend function', 'When the input is a lambda'],
      correctAnswer: 0,
      explanation: 'derivedStateOf only notifies readers when the result changes, so a fast-changing input like scroll offset does not recompose consumers of a Boolean derived from it.'
    },
    {
      id: 'jcq17',
      question: 'What happens when the value provided to a staticCompositionLocalOf changes?',
      options: ['Nothing recomposes', 'Only composables that read it recompose', 'A compile error', 'The whole content lambda under the provider recomposes'],
      correctAnswer: 3,
      explanation: 'Static locals do not track individual reads, so Compose recomposes everything inside the CompositionLocalProvider. That is fine for rarely changing values like a theme.'
    },
    {
      id: 'jcq18',
      question: 'A Column renders items with a for loop; each child holds remember state. After reordering, state appears on the wrong rows. Fix?',
      options: ['Use remember(item) instead', 'Wrap each child in key(item.id) { }', 'Use rememberSaveable', 'Add a LaunchedEffect per item'],
      correctAnswer: 1,
      explanation: 'Without keys, Compose identifies children by call position, so state stays with the slot rather than the item. key() ties remembered state to the item identity.'
    },
    {
      id: 'jcq19',
      question: 'Which ViewCompositionStrategy should a ComposeView inside a Fragment use?',
      options: ['DisposeOnViewTreeLifecycleDestroyed', 'DisposeOnDetachedFromWindow', 'DisposeOnLifecycleDestroyed of the Activity', 'The default is always correct'],
      correctAnswer: 0,
      explanation: 'The fragment view lifecycle ends in onDestroyView, and this strategy disposes the composition with it. Disposing on detach can drop the composition too early during transitions.'
    },
    {
      id: 'jcq20',
      question: 'What does snapshotFlow { } do?',
      options: ['Converts Compose State reads into a cold Flow that emits when they change', 'Converts a Flow into Compose State', 'Captures a bitmap of the composable', 'Runs a block after every recomposition'],
      correctAnswer: 0,
      explanation: 'snapshotFlow observes the state read inside its block and emits distinct new values, bridging State to coroutine-based code. collectAsState goes the other direction.'
    }
  ]
};

// =============================================================================
// 4. COROUTINES & FLOW
// =============================================================================
const coroutinesFlow: AndroidCategory = {
  id: 'android-coroutines-flow',
  name: 'Coroutines & Flow',
  slug: 'coroutines-flow',
  description: 'Async programming with coroutines, Flow, channels, and structured concurrency',
  icon: 'git-branch-outline',
  color: '#FF6B6B',
  colorDark: '#CC5555',
  premium: true,

  learnContent: [
    {
      title: 'Coroutine Basics',
      content: `Coroutines are lightweight threads for async programming without callbacks.

**Key Concepts:**
- **suspend**: Function that can pause and resume
- **CoroutineScope**: Defines coroutine lifecycle
- **CoroutineContext**: Configuration (dispatcher, job)
- **Dispatchers**: Thread control

**Dispatchers:**
- Main: UI operations
- IO: Network/disk (optimized for blocking)
- Default: CPU-intensive work

**Structured Concurrency:**
Coroutines form a hierarchy. Parent cancellation cancels children.`,
      codeExample: `// Suspend function
suspend fun fetchUser(id: String): User {
    delay(1000)  // Non-blocking
    return api.getUser(id)
}

// CoroutineScope in ViewModel
class UserViewModel : ViewModel() {
    fun loadUser() {
        viewModelScope.launch {
            try {
                val user = fetchUser("123")
                _user.value = user
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}

// Switching dispatchers
suspend fun loadData(): Data = withContext(Dispatchers.IO) {
    // Runs on IO dispatcher
    val data = api.fetchData()
    // Returns to previous dispatcher
    data
}

// Parallel execution with async
suspend fun loadDashboard(): Dashboard = coroutineScope {
    val user = async { fetchUser() }
    val posts = async { fetchPosts() }
    val notifications = async { fetchNotifications() }

    // All run in parallel
    Dashboard(
        user.await(),
        posts.await(),
        notifications.await()
    )
}

// Structured concurrency
suspend fun processItems(items: List<Item>) = coroutineScope {
    items.forEach { item ->
        launch {
            processItem(item)
        }
    }
    // Returns when all launched coroutines complete
}`
    },
    {
      title: 'Exception Handling',
      content: `Coroutine exceptions propagate up the hierarchy. Proper handling is crucial.

**Exception Propagation:**
- launch: Exceptions propagate to parent
- async: Exceptions exposed when awaited
- SupervisorJob: Failures don't cancel siblings

**CoroutineExceptionHandler:**
Global handler for uncaught exceptions.

**Best Practices:**
- try-catch in suspend functions
- SupervisorScope for independent tasks
- Handle exceptions at appropriate level`,
      codeExample: `// try-catch in coroutines
viewModelScope.launch {
    try {
        val data = fetchData()
        _state.value = State.Success(data)
    } catch (e: IOException) {
        _state.value = State.Error("Network error")
    } catch (e: Exception) {
        _state.value = State.Error(e.message ?: "Unknown error")
    }
}

// async exception handling
val deferred = async {
    fetchData()  // May throw
}

try {
    val result = deferred.await()  // Exception thrown here
} catch (e: Exception) {
    // Handle
}

// SupervisorScope - failures don't cancel siblings
suspend fun loadMultiple() = supervisorScope {
    val job1 = launch {
        fetchData1()  // If this fails...
    }
    val job2 = launch {
        fetchData2()  // ...this still runs
    }
}

// CoroutineExceptionHandler
val handler = CoroutineExceptionHandler { _, exception ->
    Log.e("Coroutine", "Caught: $exception")
}

viewModelScope.launch(handler) {
    throw Exception("Error")  // Caught by handler
}

// runCatching for Result
suspend fun safeLoad(): Result<Data> = runCatching {
    fetchData()
}

when (val result = safeLoad()) {
    is Result.Success -> useData(result.value)
    is Result.Failure -> showError(result.exception)
}`
    },
    {
      title: 'Flow Basics',
      content: `Flow is Kotlin's cold, asynchronous stream. Values are emitted over time.

**Characteristics:**
- Cold: Starts when collected
- Asynchronous: Suspend-based
- Cancellable: Respects cancellation
- Sequential: Processes values in order

**Operators:**
- Intermediate: map, filter, transform (lazy)
- Terminal: collect, first, toList (trigger execution)

**Hot vs Cold:**
- Flow: Cold (starts fresh for each collector)
- StateFlow/SharedFlow: Hot (active regardless of collectors)`,
      codeExample: `// Creating a Flow
fun numbers(): Flow<Int> = flow {
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}

// Collecting
lifecycleScope.launch {
    numbers().collect { value ->
        println(value)
    }
}

// Operators
suspend fun processUsers() {
    repository.getUsers()
        .filter { it.isActive }
        .map { it.toDisplayModel() }
        .collect { user ->
            updateUI(user)
        }
}

// flowOf and asFlow
val flow1 = flowOf(1, 2, 3)
val flow2 = listOf(1, 2, 3).asFlow()

// transform operator
flow.transform { value ->
    emit("Processing $value")
    emit(processValue(value))
}

// catch operator
flow
    .catch { e ->
        emit(ErrorState(e))
    }
    .collect { state ->
        updateUI(state)
    }

// onEach for side effects
flow
    .onEach { log("Received: $it") }
    .onStart { showLoading() }
    .onCompletion { hideLoading() }
    .collect { update(it) }

// flowOn - change upstream dispatcher
flow
    .map { heavyComputation(it) }
    .flowOn(Dispatchers.Default)
    .collect { updateUI(it) }  // Main thread`
    },
    {
      title: 'StateFlow and SharedFlow',
      content: `Hot flows that emit to multiple collectors and hold state.

**StateFlow:**
- Always has a value (initial required)
- Only emits when value changes
- Replays latest to new collectors
- Perfect for UI state

**SharedFlow:**
- No initial value required
- Configurable replay cache
- Supports multiple subscribers
- Good for events

**Comparison:**
- LiveData → StateFlow
- Event bus → SharedFlow`,
      codeExample: `// StateFlow in ViewModel
class UserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()  // Read-only view

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val users = repository.getUsers()
                _uiState.value = UiState.Success(users)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

// Collecting StateFlow in Activity
lifecycleScope.launch {
    // Collect only while STARTED; stops in background
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            when (state) {
                is UiState.Loading -> showLoading()
                is UiState.Success -> showUsers(state.users)
                is UiState.Error -> showError(state.message)
            }
        }
    }
}

// In Compose
@Composable
fun UserScreen(viewModel: UserViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    // Use state
}

// SharedFlow for events
class EventViewModel : ViewModel() {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()

    fun onButtonClick() {
        viewModelScope.launch {
            _events.emit(Event.NavigateToDetail)  // One-shot event
        }
    }
}

// Collecting events
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.events.collect { event ->
            when (event) {
                is Event.NavigateToDetail -> navigate()
                is Event.ShowSnackbar -> showSnackbar(event.message)
            }
        }
    }
}`
    },
    {
      title: 'Cancellation and Timeout',
      content: `Coroutine cancellation is cooperative. Suspend functions check for cancellation.

**Cancellation:**
- job.cancel(): Cancel coroutine
- isActive: Check cancellation
- ensureActive(): Throw if cancelled
- CancellationException: Normal cancellation

**Timeout:**
- withTimeout: Throws on timeout
- withTimeoutOrNull: Returns null on timeout

**Best Practices:**
- Check isActive in long loops
- Use suspending functions (automatically check)
- Clean up resources in finally or invokeOnCompletion`,
      codeExample: `// Cancellation
val job = viewModelScope.launch {
    repeat(1000) { i ->
        println("Working $i")
        delay(100)  // Suspends, checks cancellation
    }
}

// Cancel after 1 second
delay(1000)
job.cancel()

// Checking cancellation manually
suspend fun longTask() = coroutineScope {
    for (i in 1..1000) {
        ensureActive()  // Throws if cancelled
        // or: if (!isActive) return@coroutineScope
        doWork(i)
    }
}

// Timeout
try {
    withTimeout(5000) {
        fetchData()  // Throws TimeoutCancellationException if > 5s
    }
} catch (e: TimeoutCancellationException) {
    // Handle timeout
}

// withTimeoutOrNull - no exception
val result = withTimeoutOrNull(5000) {
    fetchData()
}
if (result == null) {
    // Timed out
}

// Cleanup with finally
viewModelScope.launch {
    try {
        openResource()
        useResource()
    } finally {
        // Always runs, even if cancelled
        closeResource()
    }
}

// invokeOnCompletion
val job = launch {
    doWork()
}
job.invokeOnCompletion { cause ->
    when (cause) {
        null -> println("Completed normally")
        is CancellationException -> println("Cancelled")
        else -> println("Failed: $cause")
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Coroutine Dispatchers',
      description: 'Different dispatchers for different work',
      nodes: [
        { id: 'main', label: 'Main\nUI thread', x: 100, y: 50, type: 'primary' },
        { id: 'io', label: 'IO\nNetwork/Disk', x: 250, y: 50, type: 'secondary' },
        { id: 'default', label: 'Default\nCPU work', x: 100, y: 150, type: 'secondary' },
        { id: 'unconfined', label: 'Unconfined\nNo context', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'main', to: 'io' },
        { from: 'main', to: 'default' },
        { from: 'io', to: 'unconfined' }
      ]
    },
    {
      title: 'StateFlow vs SharedFlow',
      description: 'Hot flow comparison',
      nodes: [
        { id: 'state', label: 'StateFlow\nhas value', x: 100, y: 50, type: 'primary' },
        { id: 'shared', label: 'SharedFlow\nno initial', x: 250, y: 50, type: 'primary' },
        { id: 'distinct', label: 'Distinct\nonly', x: 100, y: 150, type: 'info' },
        { id: 'replay', label: 'Replay\nconfig', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'state', to: 'distinct' },
        { from: 'shared', to: 'replay' }
      ]
    }
  ],

  flashcards: [
    { id: 'cf1', front: 'What is the difference between launch and async?', back: 'launch returns Job (fire-and-forget). async returns Deferred<T> with result accessible via await(). Use async for parallel execution with results.' },
    { id: 'cf2', front: 'What does Dispatchers.IO optimize for?', back: 'Blocking I/O operations (network, disk). Uses a larger thread pool than Default. Good for API calls, file operations.' },
    { id: 'cf3', front: 'What is structured concurrency?', back: 'Coroutines form a hierarchy. Parent scope waits for children. Cancelling parent cancels all children. Prevents leaks.' },
    { id: 'cf4', front: 'What is the difference between Flow and StateFlow?', back: 'Flow is cold (starts on collect). StateFlow is hot (always active), has initial value, and only emits distinct values.' },
    { id: 'cf5', front: 'When should you use SharedFlow over StateFlow?', back: 'For events that shouldn\'t be replayed (navigation, snackbar). SharedFlow doesn\'t require initial value and can emit same value.' },
    { id: 'cf6', front: 'What does flowOn do?', back: 'Changes the dispatcher for upstream operations (before flowOn). Collection still happens on the original dispatcher.' },
    { id: 'cf7', front: 'What is SupervisorJob used for?', back: 'Children can fail independently without cancelling siblings. Normal Job propagates failure to cancel all children.' },
    { id: 'cf8', front: 'How do you handle exceptions in async?', back: 'Exception is thrown when calling await(). Wrap await() in try-catch, not the async block itself.' },
    { id: 'cf9', front: 'What is repeatOnLifecycle?', back: 'Repeats collection block when lifecycle reaches specified state. Cancels when below state. Prevents collection when app is backgrounded.' },
    { id: 'cf10', front: 'What is withContext?', back: 'Switches to specified dispatcher for the block, then returns to previous. Use for changing threads mid-coroutine.' },
    { id: 'cf11', front: 'What does ensureActive() do?', back: 'Throws CancellationException if coroutine is cancelled. Use in long loops to make them cancellation-aware.' },
    { id: 'cf12', front: 'What is the catch operator in Flow?', back: 'Catches exceptions from upstream operators and can emit replacement values. Doesn\'t catch collection exceptions.' },
    { id: 'cf13', front: 'What is viewModelScope?', back: 'Pre-defined CoroutineScope in ViewModel. Automatically cancelled when ViewModel is cleared. Uses Main dispatcher.' },
    { id: 'cf14', front: 'What is collectAsStateWithLifecycle?', back: 'Compose function that collects Flow as State while respecting lifecycle. Stops collection when below STARTED.' },
    { id: 'cf15', front: 'What does withTimeoutOrNull return on timeout?', back: 'Returns null instead of throwing TimeoutCancellationException. Useful when timeout is recoverable.' },
    { id: 'cf16', front: 'What does the suspend modifier do under the hood?', back: 'The compiler rewrites the function into a state machine that takes an extra Continuation parameter. At each suspension point it saves local state and returns; when resumed it jumps to the next state. No thread is blocked while suspended.' },
    { id: 'cf17', front: 'What is the difference between Dispatchers.Default and Dispatchers.IO?', back: 'Default is sized to the CPU core count and meant for CPU-bound work. IO is an elastic pool (up to 64 threads by default) for blocking I/O. They share threads, so switching from Default to IO often reuses the same thread.' },
    { id: 'cf18', front: 'What is Dispatchers.Unconfined?', back: 'Starts the coroutine in the caller thread and after each suspension resumes on whatever thread the suspending function used. It has no thread confinement, so it is rarely appropriate outside tests and library internals.' },
    { id: 'cf19', front: 'Why is coroutine cancellation cooperative?', back: 'cancel() only sets the Job state; the coroutine notices it at the next suspension point or explicit check. A CPU loop that never suspends keeps running, so call yield(), ensureActive() or check isActive inside long loops.' },
    { id: 'cf20', front: 'Why must you not swallow CancellationException?', back: 'Cancellation is delivered as a CancellationException at the suspension point. catch (e: Exception) that does not rethrow it makes the coroutine continue running after cancellation, leaking work. Rethrow it or catch more specific exceptions.' },
    { id: 'cf21', front: 'What is the difference between coroutineScope { } and supervisorScope { }?', back: 'Both create a child scope and wait for all children. In coroutineScope one failing child cancels the siblings and rethrows. In supervisorScope children fail independently, so you handle each failure locally.' },
    { id: 'cf22', front: 'Where does a CoroutineExceptionHandler take effect?', back: 'Only on root coroutines started with launch (or installed in the scope). Handlers on child coroutines are ignored because exceptions propagate to the parent first, and async exposes exceptions through await() instead.' },
    { id: 'cf23', front: 'Why is GlobalScope discouraged?', back: 'Its coroutines are not tied to any lifecycle or parent, so they cannot be cancelled together, leak on screen exit, and break structured concurrency. Use viewModelScope, lifecycleScope, or an injected application-level scope with a SupervisorJob.' },
    { id: 'cf24', front: 'What is withContext(NonCancellable) for?', back: 'Running cleanup that must complete even after cancellation, e.g. closing a database transaction in a finally block. Once cancelled, any other suspend call throws immediately, so the cleanup would otherwise be skipped.' },
    { id: 'cf25', front: 'What is the difference between SharingStarted.WhileSubscribed(5000), Eagerly and Lazily?', back: 'WhileSubscribed starts the upstream on the first subscriber and stops 5s after the last one leaves, which survives rotation but stops in the background. Eagerly starts immediately and never stops. Lazily starts on the first subscriber and never stops.' },
    { id: 'cf26', front: 'What is the difference between buffer, conflate and collectLatest?', back: 'buffer lets the producer run ahead without waiting for the collector. conflate keeps only the newest value when the collector is slow. collectLatest cancels the in-progress collector block whenever a new value arrives.' },
    { id: 'cf27', front: 'What is the difference between combine, zip and flatMapLatest?', back: 'combine emits whenever either flow emits, using the latest value of each. zip pairs emissions one-to-one and waits for both. flatMapLatest maps each value to a new inner flow and cancels the previous inner flow.' },
    { id: 'cf28', front: 'How does a Channel differ from a Flow?', back: 'A Channel is a hot, coroutine-safe queue for sending values between coroutines; each value is delivered to exactly one receiver. A Flow is a cold, declarative stream that runs per collector. Channels suit one-shot events and producer/consumer pipelines.' },
    { id: 'cf29', front: 'What is callbackFlow?', back: 'A builder that wraps callback-based APIs into a Flow. Register the callback, push values with trySend, and use awaitClose { unregister() } so the listener is removed when the collector cancels.' },
    { id: 'cf30', front: 'Why use Mutex instead of synchronized in coroutines?', back: 'Mutex.withLock suspends while waiting instead of blocking the thread, and you cannot call suspend functions inside a synchronized block. Mutex is not reentrant, so do not lock it twice from the same coroutine.' }
  ],

  quizQuestions: [
    {
      id: 'cfq1',
      question: 'Which dispatcher should you use for UI updates?',
      options: ['Dispatchers.IO', 'Dispatchers.Default', 'Dispatchers.Main', 'Dispatchers.Unconfined'],
      correctAnswer: 2,
      explanation: 'Dispatchers.Main runs on the main/UI thread, required for UI updates in Android.'
    },
    {
      id: 'cfq2',
      question: 'What is the difference between Flow and StateFlow?',
      options: ['Flow is hot, StateFlow is cold', 'StateFlow has value, Flow doesn\'t', 'Flow is faster', 'No difference'],
      correctAnswer: 1,
      explanation: 'StateFlow always has a value (initial required) and only emits distinct values. Flow is cold and starts fresh.'
    },
    {
      id: 'cfq3',
      question: 'Where is the exception thrown with async?',
      options: ['In async block', 'When calling await()', 'In parent scope', 'Never thrown'],
      correctAnswer: 1,
      explanation: 'Exceptions in async are exposed when calling await(). That\'s where you should try-catch.'
    },
    {
      id: 'cfq4',
      question: 'What does SupervisorJob enable?',
      options: ['Faster execution', 'Independent child failure', 'Automatic retry', 'Thread safety'],
      correctAnswer: 1,
      explanation: 'SupervisorJob allows children to fail without cancelling siblings. Normal Job cancels all children on failure.'
    },
    {
      id: 'cfq5',
      question: 'What does flowOn change?',
      options: ['Downstream dispatcher', 'Upstream dispatcher', 'Collection dispatcher', 'All dispatchers'],
      correctAnswer: 1,
      explanation: 'flowOn changes the dispatcher for upstream operations (before flowOn). Collection remains on original.'
    },
    {
      id: 'cfq6',
      question: 'When is viewModelScope cancelled?',
      options: ['On rotation', 'When ViewModel cleared', 'On pause', 'Never'],
      correctAnswer: 1,
      explanation: 'viewModelScope is cancelled when ViewModel is cleared (not just rotation). It survives config changes.'
    },
    {
      id: 'cfq7',
      question: 'What does repeatOnLifecycle do?',
      options: ['Loops forever', 'Restarts collection based on lifecycle', 'Prevents cancellation', 'Caches results'],
      correctAnswer: 1,
      explanation: 'Repeats the collection block when lifecycle reaches specified state, cancelling when below.'
    },
    {
      id: 'cfq8',
      question: 'What is the purpose of ensureActive()?',
      options: ['Keep coroutine alive', 'Check and throw if cancelled', 'Prevent suspension', 'Log activity'],
      correctAnswer: 1,
      explanation: 'ensureActive() throws CancellationException if the coroutine is cancelled. Makes loops cancellation-aware.'
    },
    {
      id: 'cfq9',
      question: 'What does withContext return?',
      options: ['Job', 'Deferred', 'Result of the block', 'Nothing'],
      correctAnswer: 2,
      explanation: 'withContext executes the block on specified dispatcher and returns its result.'
    },
    {
      id: 'cfq10',
      question: 'What should SharedFlow be used for?',
      options: ['UI state', 'One-time events', 'Configuration', 'Database queries'],
      correctAnswer: 1,
      explanation: 'SharedFlow is ideal for one-time events like navigation or snackbar that shouldn\'t replay to new subscribers.'
    },
    {
      id: 'cfq11',
      question: 'viewModelScope.launch { try { repo.load() } catch (e: Exception) { showError() } }. The user leaves the screen mid-load. What is the bug?',
      options: ['Nothing is wrong', 'CancellationException is caught, so cancellation is swallowed and showError runs', 'try/catch is not allowed inside coroutines', 'load() must be wrapped in async'],
      correctAnswer: 1,
      explanation: 'Clearing the ViewModel cancels the scope and repo.load() throws CancellationException, which this catch swallows. Rethrow it (if (e is CancellationException) throw e) or catch specific exceptions.'
    },
    {
      id: 'cfq12',
      question: 'launch(Dispatchers.Default) { while (true) { compute() } } and later job.cancel(). What happens?',
      options: ['It keeps running because cancellation is cooperative and the loop never suspends', 'It stops immediately', 'CancellationException is thrown on the next iteration', 'The thread is interrupted'],
      correctAnswer: 0,
      explanation: 'The loop never reaches a suspension point, so it never observes the cancelled state. Use while (isActive), ensureActive() or yield() inside the loop.'
    },
    {
      id: 'cfq13',
      question: 'You need two independent network calls to run in parallel and combine their results. Which is idiomatic?',
      options: ['Two sequential withContext(Dispatchers.IO) calls', 'launch for each and write into a shared variable', 'runBlocking around both calls', 'async for each inside coroutineScope, then await both'],
      correctAnswer: 3,
      explanation: 'async starts both concurrently and await returns typed results; coroutineScope ensures a failure cancels the other and propagates. Sequential withContext calls run one after the other.'
    },
    {
      id: 'cfq14',
      question: 'You pass a CoroutineExceptionHandler to a child launch inside viewModelScope. Will it handle the child\'s exception?',
      options: ['Yes, always', 'No, handlers on child coroutines are ignored; install it on the scope or root coroutine', 'Only for async children', 'Only if the child uses Dispatchers.Main'],
      correctAnswer: 1,
      explanation: 'A child failure propagates to its parent, and only the root coroutine consults the handler. Put the handler in the scope context or on a launch that is a direct child of a SupervisorJob.'
    },
    {
      id: 'cfq15',
      question: 'Why is SharingStarted.WhileSubscribed(5000) the common choice for stateIn in a ViewModel?',
      options: ['It is a network timeout', 'It delays the first emission by 5s', 'It survives brief unsubscription like rotation without restarting the upstream, but stops in the background', 'It is the minimum allowed value'],
      correctAnswer: 2,
      explanation: 'During a configuration change the UI unsubscribes for a moment; the 5s grace period keeps the upstream alive so it does not refetch. After the app is backgrounded longer than that, collection stops to save resources.'
    },
    {
      id: 'cfq16',
      question: 'Search queries arrive quickly and each triggers a slow suspend fetch. You want to cancel the in-progress fetch when a new query arrives. Which operator?',
      options: ['buffer()', 'conflate()', 'collectLatest { }', 'distinctUntilChanged()'],
      correctAnswer: 2,
      explanation: 'collectLatest cancels the previous block when a new value is emitted. conflate only drops intermediate values; it does not cancel work already running. (flatMapLatest is the equivalent for transforming flows.)'
    },
    {
      id: 'cfq17',
      question: 'What does flatMapLatest do when the upstream emits a new value while an inner flow is still active?',
      options: ['Cancels the current inner flow and switches to the new one', 'Waits for the inner flow to complete first', 'Runs both inner flows concurrently and merges', 'Drops the new upstream value'],
      correctAnswer: 0,
      explanation: 'flatMapLatest is a switch operator: only the most recent inner flow is collected. flatMapMerge would run them concurrently and flatMapConcat sequentially.'
    },
    {
      id: 'cfq18',
      question: 'Inside coroutineScope { launch { A() }; launch { B() } }, A throws. What happens to B?',
      options: ['B continues normally', 'B finishes, then the exception is thrown', 'B is silently ignored', 'B is cancelled and the exception propagates to the caller of coroutineScope'],
      correctAnswer: 3,
      explanation: 'coroutineScope uses a regular Job, so a failing child cancels its siblings and the scope rethrows. Use supervisorScope if B should be independent of A.'
    },
    {
      id: 'cfq19',
      question: 'Why is runBlocking discouraged in Android app code?',
      options: ['It blocks the calling thread, which on the main thread causes jank or ANRs', 'It cannot call suspend functions', 'It runs on Dispatchers.IO', 'It is deprecated'],
      correctAnswer: 0,
      explanation: 'runBlocking bridges blocking code to coroutines by blocking the thread until the block finishes. It belongs in tests and main() functions, not in lifecycle callbacks or ViewModels.'
    },
    {
      id: 'cfq20',
      question: 'Which statement about StateFlow compared with LiveData is correct?',
      options: ['StateFlow collection is lifecycle-aware by default', 'StateFlow can only be observed on the main thread', 'StateFlow requires an initial value, only emits distinct values, and needs repeatOnLifecycle for lifecycle-aware collection', 'StateFlow is nullable by design'],
      correctAnswer: 2,
      explanation: 'LiveData stops delivering when the observer is inactive. StateFlow is a plain coroutine primitive, so the UI must collect it inside repeatOnLifecycle or collectAsStateWithLifecycle to avoid work in the background.'
    }
  ]
};

// =============================================================================
// 5. ARCHITECTURE COMPONENTS
// =============================================================================
const architectureComponents: AndroidCategory = {
  id: 'android-architecture',
  name: 'Architecture Components',
  slug: 'architecture-components',
  description: 'ViewModel, LiveData, Room, Hilt, and clean architecture patterns',
  icon: 'construct-outline',
  color: '#9C27B0',
  colorDark: '#7B1FA2',
  premium: true,

  learnContent: [
    {
      title: 'ViewModel',
      content: `ViewModel stores and manages UI-related data that survives configuration changes.

**Key Features:**
- Survives rotation
- Scoped to lifecycle (Activity, Fragment, NavGraph)
- Cleared when scope is destroyed
- viewModelScope for coroutines

**What to Store:**
- UI state
- Loading/error states
- Business logic results

**What NOT to Store:**
- Context references (memory leak)
- View references
- Activity/Fragment references`,
      codeExample: `// Basic ViewModel
class UserViewModel : ViewModel() {
    // Mutable privately, exposed as read-only LiveData
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    fun loadUser(id: String) {
        // viewModelScope cancels automatically on clear
        viewModelScope.launch {
            _loading.value = true
            try {
                _user.value = repository.getUser(id)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }
}

// In Activity/Fragment
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModels()  // Survives rotation

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewModel.user.observe(viewLifecycleOwner) { user ->
            binding.nameText.text = user.name
        }

        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.isVisible = isLoading
        }

        viewModel.loadUser("123")
    }
}

// Shared ViewModel (Activity scope)
class DetailFragment : Fragment() {
    private val sharedViewModel: SharedViewModel by activityViewModels()  // Same instance for all fragments
}

// With SavedStateHandle
class SearchViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    var query: String
        get() = savedStateHandle["query"] ?: ""
        set(value) { savedStateHandle["query"] = value }
}`
    },
    {
      title: 'Room Database',
      content: `Room is an abstraction layer over SQLite providing compile-time query verification.

**Components:**
- **Entity**: Table definition (@Entity)
- **DAO**: Data access methods (@Dao)
- **Database**: Abstract database class (@Database)

**Features:**
- Compile-time SQL verification
- LiveData/Flow integration
- Migration support
- Type converters

**Best Practices:**
- One database instance (singleton)
- Access through repository pattern
- Use Flow for reactive updates`,
      codeExample: `// Entity
@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: String,  // Unique row identifier
    @ColumnInfo(name = "full_name") val name: String,  // Custom column name
    val email: String,
    val createdAt: Date
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<User>>  // Re-emits on table changes

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: String): User?

    @Insert(onConflict = OnConflictStrategy.REPLACE)  // Upsert
    suspend fun insert(user: User)

    @Update
    suspend fun update(user: User)

    @Delete
    suspend fun delete(user: User)

    @Query("DELETE FROM users")
    suspend fun deleteAll()
}

// Database
@Database(entities = [User::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        // Single shared instance; @Volatile for thread visibility
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            // synchronized stops two threads creating two DBs
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                ).build().also { INSTANCE = it }
            }
        }
    }
}

// Type Converter
// Room can't store Date directly; convert to/from Long
class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? = value?.let { Date(it) }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? = date?.time
}`
    },
    {
      title: 'Hilt Dependency Injection',
      content: `Hilt is Jetpack's recommended DI framework, built on Dagger.

**Annotations:**
- @HiltAndroidApp: Application class
- @AndroidEntryPoint: Activity, Fragment, Service
- @Inject: Constructor or field injection
- @Module/@InstallIn: Provide dependencies
- @Singleton, @ViewModelScoped: Scope

**Components (Scopes):**
- SingletonComponent: Application lifetime
- ViewModelComponent: ViewModel lifetime
- ActivityComponent: Activity lifetime
- FragmentComponent: Fragment lifetime`,
      codeExample: `// Application
@HiltAndroidApp  // Generates and attaches the DI container
class MyApplication : Application()

// Activity
@AndroidEntryPoint  // Enables injection into this class
class MainActivity : AppCompatActivity() {
    @Inject lateinit var analytics: Analytics  // Field injection
}

// ViewModel with injection
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // ...
}

// Module for providing dependencies
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    // @Provides builds types you don't own; @Singleton caches one
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

// Module with bindings
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    // @Binds maps an interface to its implementation
    @Binds
    @Singleton
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}

// Repository with injected dependencies
class UserRepositoryImpl @Inject constructor(
    private val api: ApiService,
    private val dao: UserDao
) : UserRepository {
    override suspend fun getUser(id: String): User {
        // Cache-first: try DB, else fetch from API and cache
        return dao.getUserById(id) ?: api.getUser(id).also {
            dao.insert(it)
        }
    }
}`
    },
    {
      title: 'Clean Architecture',
      content: `Clean Architecture separates concerns into layers with clear dependencies.

**Layers:**
1. **Presentation**: UI, ViewModels
2. **Domain**: Business logic, use cases
3. **Data**: Repositories, data sources

**Dependency Rule:**
Dependencies point inward. Domain doesn't know about UI or data implementation.

**Components:**
- Use Cases: Single business operation
- Repository Interface: In domain
- Repository Impl: In data layer`,
      codeExample: `// Domain Layer - Use Case
class GetUserUseCase @Inject constructor(
    private val repository: UserRepository
) {
    // operator invoke: call the use case like a function
    suspend operator fun invoke(userId: String): Result<User> {
        return try {
            Result.success(repository.getUser(userId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// Domain Layer - Repository Interface
interface UserRepository {
    suspend fun getUser(id: String): User
    suspend fun saveUser(user: User)
    fun observeUsers(): Flow<List<User>>
}

// Data Layer - Repository Implementation
class UserRepositoryImpl @Inject constructor(
    private val remoteDataSource: UserRemoteDataSource,
    private val localDataSource: UserLocalDataSource
) : UserRepository {

    override suspend fun getUser(id: String): User {
        // Local cache first, fall back to network and save
        return localDataSource.getUser(id)
            ?: remoteDataSource.fetchUser(id).also {
                localDataSource.saveUser(it)
            }
    }

    override fun observeUsers(): Flow<List<User>> {
        return localDataSource.observeUsers()
    }
}

// Presentation Layer - ViewModel
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase
) : ViewModel() {

    private val _state = MutableStateFlow<UserState>(UserState.Loading)
    val state: StateFlow<UserState> = _state  // UI observes this

    fun loadUser(id: String) {
        viewModelScope.launch {
            _state.value = UserState.Loading
            getUserUseCase(id)
                .onSuccess { _state.value = UserState.Success(it) }
                .onFailure { _state.value = UserState.Error(it.message) }
        }
    }
}

// State
sealed class UserState {
    object Loading : UserState()
    data class Success(val user: User) : UserState()
    data class Error(val message: String?) : UserState()
}`
    },
    {
      title: 'WorkManager',
      content: `WorkManager handles deferrable, guaranteed background work.

**Use Cases:**
- Syncing data
- Uploading logs
- Periodic cleanup
- Work that must complete

**Features:**
- Survives app restart
- Battery-efficient
- Constraints (network, charging)
- Chaining and parallel work

**Work Types:**
- OneTimeWorkRequest: Single execution
- PeriodicWorkRequest: Repeating`,
      codeExample: `// Worker class
class UploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    // Runs in the background; return success/retry/failure
    override suspend fun doWork(): Result {
        val data = inputData.getString("file_path")
            ?: return Result.failure()  // Missing input: give up

        return try {
            uploadFile(data)
            Result.success()
        } catch (e: Exception) {
            // Retry up to 3 attempts, then fail permanently
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}

// Enqueue work
val uploadRequest = OneTimeWorkRequestBuilder<UploadWorker>()
    .setInputData(workDataOf("file_path" to filePath))
    // Only run when network is up and battery is OK
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
    )
    // Wait longer between each retry
    .setBackoffCriteria(
        BackoffPolicy.EXPONENTIAL,
        WorkRequest.MIN_BACKOFF_MILLIS,
        TimeUnit.MILLISECONDS
    )
    .build()

WorkManager.getInstance(context).enqueue(uploadRequest)

// Periodic work
val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES  // Minimum allowed period
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()
).build()

WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork(
        "sync_work",
        ExistingPeriodicWorkPolicy.KEEP,  // Skip if already scheduled
        syncRequest
    )

// Observe work status
WorkManager.getInstance(context)
    .getWorkInfoByIdLiveData(uploadRequest.id)
    .observe(this) { workInfo ->
        when (workInfo?.state) {
            WorkInfo.State.SUCCEEDED -> showSuccess()
            WorkInfo.State.FAILED -> showError()
            WorkInfo.State.RUNNING -> showProgress()
            else -> {}
        }
    }

// Chain work
WorkManager.getInstance(context)
    .beginWith(downloadWork)
    .then(processWork)  // Runs only after download succeeds
    .then(uploadWork)
    .enqueue()`
    }
  ],

  visualizations: [
    {
      title: 'Clean Architecture Layers',
      description: 'Dependencies point inward',
      nodes: [
        { id: 'ui', label: 'Presentation\nUI + ViewModel', x: 100, y: 50, type: 'secondary' },
        { id: 'domain', label: 'Domain\nUse Cases', x: 250, y: 50, type: 'primary' },
        { id: 'data', label: 'Data\nRepository', x: 100, y: 150, type: 'info' },
        { id: 'sources', label: 'Sources\nAPI + DB', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'ui', to: 'domain' },
        { from: 'data', to: 'domain' },
        { from: 'data', to: 'sources' }
      ]
    },
    {
      title: 'Hilt Component Hierarchy',
      description: 'Scopes from application to fragment',
      nodes: [
        { id: 'singleton', label: 'Singleton\n@Singleton', x: 100, y: 50, type: 'primary' },
        { id: 'vm', label: 'ViewModel\n@ViewModelScoped', x: 250, y: 50, type: 'secondary' },
        { id: 'activity', label: 'Activity\n@ActivityScoped', x: 100, y: 150, type: 'secondary' },
        { id: 'fragment', label: 'Fragment\n@FragmentScoped', x: 250, y: 150, type: 'info' }
      ],
      edges: [
        { from: 'singleton', to: 'vm' },
        { from: 'singleton', to: 'activity' },
        { from: 'activity', to: 'fragment' }
      ]
    }
  ],

  flashcards: [
    { id: 'ac1', front: 'What does ViewModel survive?', back: 'Configuration changes (rotation, locale). ViewModel is retained while Activity/Fragment is destroyed and recreated.' },
    { id: 'ac2', front: 'When is ViewModel cleared?', back: 'When its scope is finished - Activity is finished (not just rotated), Fragment is removed, or NavGraph popped.' },
    { id: 'ac3', front: 'What is @HiltViewModel?', back: 'Annotation for ViewModels that should be created by Hilt. Enables constructor injection including SavedStateHandle.' },
    { id: 'ac4', front: 'What are the three Room components?', back: 'Entity (table), DAO (data access), Database (abstract class with DAOs). Database is a singleton.' },
    { id: 'ac5', front: 'What is a Use Case in Clean Architecture?', back: 'A single business operation in the domain layer. Encapsulates business logic, uses repositories. Often uses operator invoke.' },
    { id: 'ac6', front: 'What is the Dependency Rule?', back: 'Inner layers can\'t depend on outer layers. Domain doesn\'t know about UI or data implementation. Dependencies point inward.' },
    { id: 'ac7', front: 'What is @Provides vs @Binds in Hilt?', back: '@Provides: concrete implementation creation. @Binds: maps interface to implementation (abstract function, more efficient).' },
    { id: 'ac8', front: 'What is WorkManager used for?', back: 'Deferrable, guaranteed background work that must run even if app is killed. Syncing, uploads, periodic tasks.' },
    { id: 'ac9', front: 'What is viewModelScope?', back: 'CoroutineScope in ViewModel that\'s automatically cancelled when ViewModel is cleared. Uses Dispatchers.Main.' },
    { id: 'ac10', front: 'What is SavedStateHandle?', back: 'Key-value map in ViewModel that survives process death. Like onSaveInstanceState but in ViewModel.' },
    { id: 'ac11', front: 'What does @InstallIn specify?', back: 'Which Hilt component (scope) a module belongs to. E.g., @InstallIn(SingletonComponent::class) for app-wide singletons.' },
    { id: 'ac12', front: 'What is a TypeConverter in Room?', back: 'Converts complex types to/from primitives that SQLite can store. E.g., Date to Long, List to String (JSON).' },
    { id: 'ac13', front: 'What is activityViewModels()?', back: 'Gets ViewModel scoped to the parent Activity. Used for sharing ViewModel between Fragments.' },
    { id: 'ac14', front: 'What does OnConflictStrategy.REPLACE do?', back: 'If primary key exists, replace the row instead of failing. Other options: ABORT, IGNORE, ROLLBACK.' },
    { id: 'ac15', front: 'What is a PeriodicWorkRequest?', back: 'WorkManager request that repeats at intervals (minimum 15 minutes). Survives app restarts.' },
    { id: 'ac16', front: 'What is Unidirectional Data Flow (UDF)?', back: 'State flows down from the ViewModel to the UI, and events flow up from the UI to the ViewModel. The ViewModel is the single source of truth; the UI only renders state and reports user actions, which makes state changes predictable and testable.' },
    { id: 'ac17', front: 'How does MVI differ from MVVM?', back: 'MVI models the screen as one immutable state object updated by a pure reducer from intents/actions, with explicit side-effect handling. MVVM typically exposes several observable fields. MVI is easier to reason about and test but adds boilerplate.' },
    { id: 'ac18', front: 'Why should a ViewModel never hold an Activity, Fragment or View reference?', back: 'The ViewModel outlives them across configuration changes, so the reference keeps a destroyed Activity (and its whole view tree) alive: a memory leak. Use the Application context if needed (AndroidViewModel or @ApplicationContext) and expose state instead of touching views.' },
    { id: 'ac19', front: 'How should a ViewModel expose UI state?', back: 'As a single immutable UiState data class in a private MutableStateFlow with a public read-only StateFlow (asStateFlow()). The UI cannot mutate it, and all updates go through the ViewModel using update { it.copy(...) }.' },
    { id: 'ac20', front: 'What are the main Hilt components and scopes?', back: 'SingletonComponent/@Singleton (app lifetime), ActivityRetainedComponent/@ActivityRetainedScoped (survives rotation), ViewModelComponent/@ViewModelScoped, ActivityComponent/@ActivityScoped, FragmentComponent/@FragmentScoped. Bindings without a scope annotation are created on every injection.' },
    { id: 'ac21', front: 'What does @AndroidEntryPoint do?', back: 'Generates a Hilt base class for an Activity, Fragment, View, Service or BroadcastReceiver so its @Inject fields are populated. A fragment annotated with it must be hosted in an annotated activity, and a ViewModel is obtained with hiltViewModel() or by viewModels().' },
    { id: 'ac22', front: 'What is a Hilt qualifier and when do you need one?', back: 'An annotation (custom @Qualifier or @Named) that distinguishes multiple bindings of the same type, e.g. @IoDispatcher vs @MainDispatcher for CoroutineDispatcher, or an authenticated vs plain OkHttpClient.' },
    { id: 'ac23', front: 'What is the job of a Repository?', back: 'To be the single source of truth for a type of data: it coordinates network, database and cache, decides caching and offline-first policy, maps DTOs to domain models, and hides where data came from so the rest of the app depends only on its interface.' },
    { id: 'ac24', front: 'What are the layers in the recommended Android app architecture?', back: 'UI layer (screens plus state holders such as ViewModels), an optional domain layer (use cases that combine repositories and hold reusable business logic), and the data layer (repositories backed by data sources). Dependencies point from UI toward data.' },
    { id: 'ac25', front: 'How do you evolve a Room schema without losing user data?', back: 'Increase the database version and register a Migration(from, to) with the SQL that transforms the old schema, or use @AutoMigration with exportSchema for simple changes. fallbackToDestructiveMigration() wipes the database and should only be a last resort.' },
    { id: 'ac26', front: 'Why does Room refuse queries on the main thread?', back: 'Disk I/O would block the UI and cause jank or ANRs, so Room throws IllegalStateException. Declare DAO methods as suspend or return Flow/LiveData; allowMainThreadQueries() exists only for tests.' },
    { id: 'ac27', front: 'What happens when a DAO query returns Flow<List<T>>?', back: 'Room observes the tables the query touches and re-runs it, emitting a new list whenever any of those tables changes, even if the result is identical. Apply distinctUntilChanged() if identical emissions are costly.' },
    { id: 'ac28', front: 'What are @Transaction and @Relation in Room?', back: '@Relation lets Room load one-to-many or many-to-many data into a class with an @Embedded parent and a related list. Such queries run multiple SQL statements, so they need @Transaction to keep the result consistent; @Transaction also wraps custom multi-step DAO methods.' },
    { id: 'ac29', front: 'What constraints can WorkManager enforce?', back: 'Network type (CONNECTED, UNMETERED), requires charging, device idle, battery not low, and storage not low. Work runs only while all constraints hold; if one stops holding mid-run the worker is stopped and retried later.' },
    { id: 'ac30', front: 'What is unique work in WorkManager?', back: 'enqueueUniqueWork / enqueueUniquePeriodicWork name a request so duplicates are not scheduled. ExistingWorkPolicy decides the conflict: KEEP ignores the new request, REPLACE cancels the old one, APPEND chains it after the existing work.' }
  ],

  quizQuestions: [
    {
      id: 'acq1',
      question: 'What survives when an Activity is rotated?',
      options: ['Activity instance', 'Fragment instance', 'ViewModel instance', 'Views'],
      correctAnswer: 2,
      explanation: 'ViewModel survives configuration changes. Activity, Fragment, and Views are destroyed and recreated.'
    },
    {
      id: 'acq2',
      question: 'Which annotation makes a class injectable with Hilt?',
      options: ['@Inject', '@Injectable', '@Provided', '@Component'],
      correctAnswer: 0,
      explanation: '@Inject on the constructor tells Hilt how to create instances of that class.'
    },
    {
      id: 'acq3',
      question: 'Where does the Repository interface belong in Clean Architecture?',
      options: ['Presentation', 'Domain', 'Data', 'Framework'],
      correctAnswer: 1,
      explanation: 'Repository interface is in Domain layer. Implementation is in Data layer. This allows domain to be framework-independent.'
    },
    {
      id: 'acq4',
      question: 'Which Room component defines table structure?',
      options: ['DAO', 'Database', 'Entity', 'Query'],
      correctAnswer: 2,
      explanation: '@Entity annotates data classes that represent tables. Properties become columns.'
    },
    {
      id: 'acq5',
      question: 'What is the minimum interval for PeriodicWorkRequest?',
      options: ['1 minute', '5 minutes', '15 minutes', '1 hour'],
      correctAnswer: 2,
      explanation: 'PeriodicWorkRequest has a minimum interval of 15 minutes to preserve battery.'
    },
    {
      id: 'acq6',
      question: 'What is @Binds used for in Hilt?',
      options: ['Create instances', 'Map interface to implementation', 'Provide context', 'Scope binding'],
      correctAnswer: 1,
      explanation: '@Binds maps an interface to its implementation. More efficient than @Provides for simple bindings.'
    },
    {
      id: 'acq7',
      question: 'When is viewModelScope cancelled?',
      options: ['On rotation', 'When ViewModel cleared', 'On pause', 'On stop'],
      correctAnswer: 1,
      explanation: 'viewModelScope is cancelled when ViewModel is cleared, not on configuration changes.'
    },
    {
      id: 'acq8',
      question: 'What does SavedStateHandle survive?',
      options: ['Rotation only', 'Process death', 'App uninstall', 'Device restart'],
      correctAnswer: 1,
      explanation: 'SavedStateHandle survives process death, like onSaveInstanceState but accessible in ViewModel.'
    },
    {
      id: 'acq9',
      question: 'Which component scope lives as long as the app?',
      options: ['ActivityComponent', 'ViewModelComponent', 'SingletonComponent', 'FragmentComponent'],
      correctAnswer: 2,
      explanation: 'SingletonComponent lives for the application lifetime. @Singleton scoped dependencies are created once.'
    },
    {
      id: 'acq10',
      question: 'What does WorkManager guarantee?',
      options: ['Immediate execution', 'Execution even if app killed', 'UI updates', 'Main thread execution'],
      correctAnswer: 1,
      explanation: 'WorkManager guarantees work will execute even if app is killed. Uses JobScheduler, AlarmManager as appropriate.'
    },
    {
      id: 'acq11',
      question: 'A ViewModel needs to build a localized message from string resources. What is the recommended approach?',
      options: ['Pass the Activity into the ViewModel constructor', 'Keep a reference to the TextView and set its text', 'Use the Application context (@ApplicationContext / AndroidViewModel) or expose a resource ID for the UI to resolve', 'Store the Activity in a static field'],
      correctAnswer: 2,
      explanation: 'The Application context lives as long as the process, so it cannot leak. An Activity or View reference would outlive rotation inside the ViewModel and leak the destroyed screen.'
    },
    {
      id: 'acq12',
      question: 'Which Hilt scope survives configuration changes but is destroyed when the Activity finishes?',
      options: ['@ActivityScoped', '@ActivityRetainedScoped', '@FragmentScoped', '@Singleton'],
      correctAnswer: 1,
      explanation: 'ActivityRetainedComponent is retained across rotation like a ViewModel. @ActivityScoped instances are recreated with the Activity.'
    },
    {
      id: 'acq13',
      question: 'You bump a Room database from version 1 to 2, add a column, but provide no Migration and no fallback. What happens on open?',
      options: ['IllegalStateException: a migration from 1 to 2 is required', 'Room adds the column automatically', 'The database is silently recreated', 'Room keeps using the old schema'],
      correctAnswer: 0,
      explanation: 'Room validates the schema on open and crashes when it cannot find a migration path. Provide a Migration, an @AutoMigration, or (data loss) fallbackToDestructiveMigration().'
    },
    {
      id: 'acq14',
      question: 'A DAO returns Flow<List<User>>. Why can it emit a new list even though no user changed?',
      options: ['Flow emits on every collection', 'Room emits on a timer', 'The Flow is hot and replays', 'Room re-runs the query whenever any observed table is written, regardless of the result'],
      correctAnswer: 3,
      explanation: 'The invalidation tracker triggers on table-level writes, not row diffs. Apply distinctUntilChanged() downstream if identical emissions matter.'
    },
    {
      id: 'acq15',
      question: 'In MVI, what produces the next UI state?',
      options: ['The View mutating state directly', 'A pure reducer that takes the current state and an action/result', 'The Repository', 'The Activity lifecycle callback'],
      correctAnswer: 1,
      explanation: 'The reducer is a pure function (state, action) -> newState, which makes state transitions deterministic and unit-testable without Android dependencies.'
    },
    {
      id: 'acq16',
      question: 'Why expose val uiState: StateFlow<UiState> = _uiState.asStateFlow() instead of the MutableStateFlow itself?',
      options: ['asStateFlow makes it lifecycle-aware', 'It improves performance', 'It prevents the UI from mutating state, preserving unidirectional data flow', 'MutableStateFlow cannot be collected in Compose'],
      correctAnswer: 2,
      explanation: 'The read-only view guarantees that only the ViewModel changes state. asStateFlow also hides the mutable type from a cast, unlike a plain upcast.'
    },
    {
      id: 'acq17',
      question: 'A Hilt binding has no scope annotation. How many instances are created?',
      options: ['A new instance every time it is injected', 'One per application', 'One per Activity', 'One per ViewModel'],
      correctAnswer: 0,
      explanation: 'Unscoped bindings are transient. Add @Singleton, @ActivityRetainedScoped, etc. only when you need a shared instance, since scoping keeps objects alive for the component lifetime.'
    },
    {
      id: 'acq18',
      question: 'A worker requires an unmetered network. The user switches to mobile data while the worker is running. What happens?',
      options: ['The worker continues to completion', 'The worker fails permanently', 'The worker is moved to the main thread', 'The worker is stopped (onStopped / cancelled) and retried when constraints are met again'],
      correctAnswer: 3,
      explanation: 'WorkManager cancels the running worker when a constraint stops holding and reschedules it. Workers should be idempotent and check isStopped for long operations.'
    },
    {
      id: 'acq19',
      question: 'Which best describes a well-designed use case class in the domain layer?',
      options: ['One public operation, often operator fun invoke, with no Android framework dependencies', 'A class holding many related database queries', 'A subclass of ViewModel', 'A Hilt module providing repositories'],
      correctAnswer: 0,
      explanation: 'Use cases encapsulate a single piece of business logic that combines repositories, stay pure Kotlin for testability, and are reused by multiple ViewModels.'
    },
    {
      id: 'acq20',
      question: 'enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP, request) is called while a "sync" request is already pending. What happens?',
      options: ['The old request is replaced', 'The new request is appended after the old one', 'The new request is ignored and the existing one is kept', 'Both run in parallel'],
      correctAnswer: 2,
      explanation: 'KEEP is a no-op when uncompleted work with that name exists. REPLACE cancels the existing work and APPEND chains the new request after it.'
    }
  ]
};

// =============================================================================
// 6. NETWORKING & STORAGE
// =============================================================================
const networkingStorage: AndroidCategory = {
  id: 'android-networking-storage',
  name: 'Networking & Storage',
  slug: 'networking-storage',
  description: 'Retrofit, OkHttp, DataStore, and SharedPreferences',
  icon: 'cloud-download-outline',
  color: '#FF9800',
  colorDark: '#F57C00',
  premium: true,

  learnContent: [
    {
      title: 'Retrofit',
      content: `Retrofit is a type-safe HTTP client for Android that turns your API into a Kotlin interface.

**Key Features:**
- Interface-based API definition
- Automatic JSON conversion (Gson, Moshi, Kotlinx Serialization)
- Coroutines support (suspend functions)
- Call adapters (RxJava, Flow)

**Components:**
- @GET, @POST, @PUT, @DELETE: HTTP methods
- @Path, @Query, @Body: Parameters
- @Headers: Static headers`,
      codeExample: `// API interface
interface ApiService {
    // {id} in the URL is filled from the @Path argument
    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: String): User

    // @Query appends ?page=..&limit=.. to the URL
    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int,
        @Query("limit") limit: Int = 20
    ): List<User>

    @POST("users")
    suspend fun createUser(@Body user: User): User  // Sent as JSON body

    @PUT("users/{id}")
    suspend fun updateUser(
        @Path("id") userId: String,
        @Body user: User
    ): User

    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") userId: String)

    @Headers("Cache-Control: no-cache")
    @GET("refresh")
    suspend fun refreshData(): Data
}

// Retrofit setup
val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(GsonConverterFactory.create())  // JSON parsing
    .client(okHttpClient)
    .build()

// Retrofit generates the interface implementation
val apiService = retrofit.create(ApiService::class.java)

// Using the API
class UserRepository @Inject constructor(
    private val api: ApiService
) {
    suspend fun getUser(id: String): Result<User> {
        return try {
            Result.success(api.getUser(id))
        } catch (e: HttpException) {
            Result.failure(e)  // Server returned an error status
        } catch (e: IOException) {
            Result.failure(e)  // Network failure (no connection)
        }
    }
}`
    },
    {
      title: 'OkHttp Interceptors',
      content: `OkHttp interceptors modify requests and responses. Essential for auth, logging, and caching.

**Types:**
- **Application Interceptors**: See final request/response
- **Network Interceptors**: See network-level details

**Common Uses:**
- Authentication (add headers)
- Logging
- Caching
- Retry logic
- Request/response modification`,
      codeExample: `// Logging interceptor
val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}

// Auth interceptor
class AuthInterceptor @Inject constructor(
    private val tokenProvider: TokenProvider
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer \${tokenProvider.token}")
            .build()
        // Pass the modified request down the chain
        return chain.proceed(request)
    }
}

// Retry interceptor
class RetryInterceptor(private val maxRetries: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var attempt = 0
        var response: Response? = null

        while (attempt < maxRetries) {
            try {
                response = chain.proceed(chain.request())
                if (response.isSuccessful) return response  // Done
            } catch (e: IOException) {
                if (attempt == maxRetries - 1) throw e
            }
            attempt++
        }
        return response ?: throw IOException("Failed after $maxRetries attempts")
    }
}

// OkHttpClient setup
val okHttpClient = OkHttpClient.Builder()
    // Interceptors run in the order they are added
    .addInterceptor(authInterceptor)
    .addInterceptor(loggingInterceptor)
    .addNetworkInterceptor(cacheInterceptor)
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .cache(Cache(cacheDir, 10 * 1024 * 1024))  // 10 MB
    .build()

// Error handling
suspend fun <T> safeApiCall(apiCall: suspend () -> T): Result<T> {
    return try {
        Result.success(apiCall())
    } catch (e: HttpException) {
        // Non-2xx response: extract the error body
        val errorBody = e.response()?.errorBody()?.string()
        Result.failure(ApiException(e.code(), errorBody))
    } catch (e: IOException) {
        Result.failure(NetworkException(e.message))  // Connectivity issue
    }
}`
    },
    {
      title: 'DataStore',
      content: `DataStore is Jetpack's modern replacement for SharedPreferences, offering coroutines support and type safety.

**Types:**
- **Preferences DataStore**: Key-value pairs (like SharedPreferences)
- **Proto DataStore**: Typed objects with Protocol Buffers

**Benefits over SharedPreferences:**
- Async API (coroutines/Flow)
- No runtime exceptions
- Type safety
- Atomic operations`,
      codeExample: `// Preferences DataStore
val Context.dataStore by preferencesDataStore(name = "settings")  // App-wide singleton

// Keys
object PreferencesKeys {
    val DARK_MODE = booleanPreferencesKey("dark_mode")
    val USERNAME = stringPreferencesKey("username")
    val NOTIFICATION_ENABLED = booleanPreferencesKey("notifications")
}

// Repository
class SettingsRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    // Read as Flow
    val darkMode: Flow<Boolean> = dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.DARK_MODE] ?: false
        }

    val settings: Flow<Settings> = dataStore.data
        .map { preferences ->
            Settings(
                darkMode = preferences[PreferencesKeys.DARK_MODE] ?: false,
                username = preferences[PreferencesKeys.USERNAME] ?: "",
                notifications = preferences[PreferencesKeys.NOTIFICATION_ENABLED] ?: true
            )
        }

    // Write
    suspend fun setDarkMode(enabled: Boolean) {
        // edit applies changes as one atomic transaction
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.DARK_MODE] = enabled
        }
    }

    suspend fun updateSettings(settings: Settings) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.DARK_MODE] = settings.darkMode
            preferences[PreferencesKeys.USERNAME] = settings.username
            preferences[PreferencesKeys.NOTIFICATION_ENABLED] = settings.notifications
        }
    }
}

// In ViewModel
class SettingsViewModel @Inject constructor(
    private val repository: SettingsRepository
) : ViewModel() {

    // Convert the cold Flow into StateFlow for the UI
    val settings = repository.settings
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),  // Stop 5s after last collector
            initialValue = Settings()
        )

    fun toggleDarkMode() {
        viewModelScope.launch {
            repository.setDarkMode(!settings.value.darkMode)
        }
    }
}`
    },
    {
      title: 'Image Loading with Coil',
      content: `Coil is a modern image loading library for Android, built with Kotlin coroutines.

**Features:**
- Kotlin-first (coroutines, extensions)
- Compose support
- Disk and memory caching
- Transformations
- Lifecycle awareness

**Advantages:**
- Smaller than Glide/Picasso
- Modern API
- Built-in Compose support`,
      codeExample: `// Basic usage with ImageView
imageView.load("https://example.com/image.jpg") {
    placeholder(R.drawable.placeholder)
    error(R.drawable.error)
    crossfade(true)
    transformations(CircleCropTransformation())
}

// With Compose
@Composable
fun ProfileImage(imageUrl: String) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(imageUrl)
            .crossfade(true)
            .build(),
        contentDescription = "Profile",
        placeholder = painterResource(R.drawable.placeholder),
        error = painterResource(R.drawable.error),
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .size(100.dp)
            .clip(CircleShape)
    )
}

// Custom ImageLoader
val imageLoader = ImageLoader.Builder(context)
    .memoryCache {
        MemoryCache.Builder(context)
            .maxSizePercent(0.25)  // 25% of app memory
            .build()
    }
    .diskCache {
        DiskCache.Builder()
            .directory(context.cacheDir.resolve("image_cache"))
            .maxSizePercent(0.02)  // 2% of disk
            .build()
    }
    .crossfade(true)
    .build()

// Preloading
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .memoryCachePolicy(CachePolicy.ENABLED)
    .build()

context.imageLoader.enqueue(request)

// SVG support
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()`
    },
    {
      title: 'SharedPreferences (Legacy)',
      content: `SharedPreferences is the traditional key-value storage. Still used but DataStore is preferred.

**Important:**
- Synchronous API (can block UI)
- Use commit() sparingly (synchronous)
- apply() is asynchronous
- Not type-safe
- Can cause ANRs if large

**When to Use:**
- Legacy codebases
- Simple, small data
- Immediate synchronous reads needed`,
      codeExample: `// Get SharedPreferences
val prefs = context.getSharedPreferences("my_prefs", Context.MODE_PRIVATE)

// Read values
val username = prefs.getString("username", "default") ?: "default"
val darkMode = prefs.getBoolean("dark_mode", false)
val count = prefs.getInt("count", 0)

// Write values (async)
prefs.edit()
    .putString("username", "john")
    .putBoolean("dark_mode", true)
    .apply()  // Async, preferred

// Write values (sync - blocks thread)
prefs.edit()
    .putInt("count", 10)
    .commit()  // Synchronous, returns boolean

// Remove
prefs.edit().remove("username").apply()

// Clear all
prefs.edit().clear().apply()

// Listen to changes
prefs.registerOnSharedPreferenceChangeListener { sharedPrefs, key ->
    when (key) {
        "dark_mode" -> updateTheme(sharedPrefs.getBoolean(key, false))
    }
}

// Wrapper class
class PreferencesManager(context: Context) {
    private val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)

    var isLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_LOGGED_IN, false)
        set(value) = prefs.edit().putBoolean(KEY_LOGGED_IN, value).apply()

    var authToken: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    companion object {
        private const val KEY_LOGGED_IN = "logged_in"
        private const val KEY_TOKEN = "auth_token"
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Retrofit Request Flow',
      description: 'How Retrofit processes API calls',
      nodes: [
        { id: 'interface', label: 'API Interface', x: 200, y: 50, type: 'primary' },
        { id: 'retrofit', label: 'Retrofit', x: 200, y: 120, type: 'secondary' },
        { id: 'okhttp', label: 'OkHttp', x: 200, y: 190, type: 'secondary' },
        { id: 'interceptor', label: 'Interceptors', x: 100, y: 260, type: 'info' },
        { id: 'network', label: 'Network', x: 300, y: 260, type: 'info' }
      ],
      edges: [
        { from: 'interface', to: 'retrofit', label: 'call' },
        { from: 'retrofit', to: 'okhttp', label: 'request' },
        { from: 'okhttp', to: 'interceptor' },
        { from: 'interceptor', to: 'network' }
      ]
    },
    {
      title: 'DataStore vs SharedPreferences',
      description: 'Modern vs legacy storage',
      nodes: [
        { id: 'datastore', label: 'DataStore\nAsync, Flow\nType-safe', x: 120, y: 100, type: 'primary' },
        { id: 'prefs', label: 'SharedPreferences\nSync, Blocking\nNot type-safe', x: 280, y: 100, type: 'warning' },
        { id: 'file', label: 'File Storage', x: 200, y: 200, type: 'info' }
      ],
      edges: [
        { from: 'datastore', to: 'file' },
        { from: 'prefs', to: 'file' }
      ]
    }
  ],

  flashcards: [
    { id: 'ns1', front: 'What is Retrofit?', back: 'Type-safe HTTP client that turns REST APIs into Kotlin/Java interfaces. Uses annotations to define endpoints.' },
    { id: 'ns2', front: 'What is an OkHttp Interceptor?', back: 'Middleware that can modify requests/responses. Used for auth headers, logging, retry logic, caching.' },
    { id: 'ns3', front: 'What is the difference between @Query and @Path?', back: '@Path replaces URL path segments: users/{id}. @Query adds query parameters: users?page=1.' },
    { id: 'ns4', front: 'What is DataStore?', back: 'Jetpack replacement for SharedPreferences. Async (Flow/coroutines), type-safe, no runtime exceptions.' },
    { id: 'ns5', front: 'What is the difference between apply() and commit()?', back: 'apply() is async (preferred, non-blocking). commit() is sync (blocks thread, returns boolean success).' },
    { id: 'ns6', front: 'What is Coil?', back: 'Modern Kotlin-first image loading library. Uses coroutines, has Compose support, small size.' },
    { id: 'ns7', front: 'What converter does Retrofit need for JSON?', back: 'GsonConverterFactory, MoshiConverterFactory, or KotlinxSerializationConverterFactory for JSON parsing.' },
    { id: 'ns8', front: 'What is the difference between Preferences and Proto DataStore?', back: 'Preferences: key-value like SharedPreferences. Proto: typed objects defined with Protocol Buffers.' },
    { id: 'ns9', front: 'How do you add auth headers to all requests?', back: 'Create an OkHttp Interceptor that adds Authorization header, then add it to OkHttpClient.' },
    { id: 'ns10', front: 'What is HttpException in Retrofit?', back: 'Exception thrown for non-2xx HTTP responses. Contains response code and body for error handling.' },
    { id: 'ns11', front: 'How do you read DataStore values?', back: 'DataStore.data returns a Flow<Preferences>. Use map to extract specific values. Collect in coroutine.' },
    { id: 'ns12', front: 'What caching does OkHttp provide?', back: 'Memory and disk caching. Configure with Cache class. Respects HTTP cache headers.' },
    { id: 'ns13', front: 'What is @Body in Retrofit?', back: 'Annotation for request body. Object is serialized to JSON (or other format) and sent as request body.' },
    { id: 'ns14', front: 'Why is DataStore better than SharedPreferences?', back: 'Async API (no ANRs), type safety, no runtime exceptions, atomic transactions, Flow support.' },
    { id: 'ns15', front: 'What is AsyncImage in Coil?', back: 'Composable for loading images asynchronously. Supports placeholder, error, transformations, and caching.' },
    { id: 'ns16', front: 'What is the difference between an application interceptor and a network interceptor in OkHttp?', back: 'Application interceptors run once per call, see the original request and the final response, and are not invoked for cached responses or intermediate redirects. Network interceptors run for every network round trip, see redirects and retries, can access the Connection, and are skipped when a cached response is served.' },
    { id: 'ns17', front: 'What is an OkHttp Authenticator?', back: 'A hook called when the server responds 401. It can refresh the token and return a new Request with an updated Authorization header, which OkHttp retries; returning null gives up. Count prior responses to avoid infinite retry loops.' },
    { id: 'ns18', front: 'How do you avoid multiple concurrent token refreshes?', back: 'Serialize the refresh in the Authenticator with a lock (synchronized or a Mutex with runBlocking). After acquiring it, compare the current token with the one that failed; if another request already refreshed it, reuse the new token instead of refreshing again.' },
    { id: 'ns19', front: 'When should a Retrofit method return Response<T> instead of T?', back: 'Returning T throws HttpException for non-2xx codes. Response<T> lets you inspect code(), headers() and errorBody() without exceptions, useful for mapping 4xx bodies into domain errors. Network failures throw IOException in both cases.' },
    { id: 'ns20', front: 'How does Retrofit support suspend functions?', back: 'Since 2.6 Retrofit has built-in support: a suspend fun is executed with enqueue on OkHttp\'s dispatcher and resumes the coroutine with the result, so no Call<T> wrapper or Dispatchers.IO switch is needed. Cancellation of the coroutine cancels the call.' },
    { id: 'ns21', front: 'What is certificate pinning and what is its main risk?', back: 'Pinning (CertificatePinner) accepts only servers whose certificate or public key hash matches, defeating man-in-the-middle attacks even with a compromised CA. The risk: when the certificate rotates without a pinned backup key the app cannot connect until updated.' },
    { id: 'ns22', front: 'How should a repository distinguish network failures from HTTP errors?', back: 'IOException (UnknownHostException, SocketTimeoutException) means the request never got a response: retryable, show offline UI. HttpException or a non-successful Response means the server answered with 4xx/5xx: map the code and body to a domain error. Model both in a sealed Result.' },
    { id: 'ns23', front: 'What OkHttp timeouts exist?', back: 'connectTimeout (TCP/TLS handshake), readTimeout (gap between bytes read), writeTimeout (gap between bytes written), each 10s by default, and callTimeout which bounds the entire call including redirects and retries (disabled by default).' },
    { id: 'ns24', front: 'How are DataStore writes performed?', back: 'dataStore.edit { prefs -> prefs[KEY] = value } is a suspend call that applies the change transactionally on Dispatchers.IO; edits are serialized so concurrent writers cannot corrupt the file. Readers observing dataStore.data get the new value.' },
    { id: 'ns25', front: 'Why must there be only one DataStore instance per file?', back: 'Creating two instances for the same file throws IllegalStateException (multiple DataStores active for the same file) because they would race on the file. Expose it as a top-level preferencesDataStore delegate or a Hilt @Singleton.' },
    { id: 'ns26', front: 'How should secrets like tokens be stored on device?', back: 'Encrypt them with a key held in the Android Keystore, whose keys are non-exportable and can require user authentication, then store the ciphertext in DataStore or files. Never hardcode secrets in the APK; anything shipped can be decompiled.' },
    { id: 'ns27', front: 'What is scoped storage?', back: 'Since Android 10/11 apps get unrestricted access only to their own app-specific directories. Shared media is accessed through MediaStore, and arbitrary documents through the Storage Access Framework, so broad READ/WRITE_EXTERNAL_STORAGE access is gone.' },
    { id: 'ns28', front: 'When should you use filesDir vs cacheDir?', back: 'filesDir holds private persistent data that is only removed on uninstall. cacheDir is for reproducible temporary data; the system may delete it under storage pressure and the user can clear it. Neither needs permissions.' },
    { id: 'ns29', front: 'How does an image loader like Coil cache images?', back: 'A memory cache of decoded bitmaps (LRU, keyed by URL plus size and transformations) for instant reuse, plus a disk cache of downloaded bytes (respecting HTTP cache headers). Memory entries are dropped under pressure; disk survives restarts.' },
    { id: 'ns30', front: 'Why is Gson risky with Kotlin data classes?', back: 'Gson bypasses constructors via reflection/Unsafe, so it ignores default values and can leave a non-null property as null when the JSON field is missing, crashing later. Moshi with codegen or kotlinx.serialization respect Kotlin nullability and defaults at parse time.' }
  ],

  quizQuestions: [
    {
      id: 'nsq1',
      question: 'Which annotation defines the request body in Retrofit?',
      options: ['@Query', '@Path', '@Body', '@Field'],
      correctAnswer: 2,
      explanation: '@Body serializes an object as the request body. Used for POST/PUT requests.'
    },
    {
      id: 'nsq2',
      question: 'What is the modern replacement for SharedPreferences?',
      options: ['Room', 'DataStore', 'SQLite', 'Firebase'],
      correctAnswer: 1,
      explanation: 'DataStore is Jetpack\'s replacement with async API, type safety, and Flow support.'
    },
    {
      id: 'nsq3',
      question: 'What does an OkHttp Interceptor do?',
      options: ['Parse JSON', 'Modify requests/responses', 'Cache images', 'Handle lifecycles'],
      correctAnswer: 1,
      explanation: 'Interceptors can modify requests (add headers) and responses (logging, retry).'
    },
    {
      id: 'nsq4',
      question: 'Which method writes to SharedPreferences asynchronously?',
      options: ['commit()', 'apply()', 'save()', 'write()'],
      correctAnswer: 1,
      explanation: 'apply() writes asynchronously without blocking. commit() is synchronous.'
    },
    {
      id: 'nsq5',
      question: 'What does Retrofit need to parse JSON?',
      options: ['JsonParser', 'Converter Factory', 'Call Adapter', 'Serializer'],
      correctAnswer: 1,
      explanation: 'Converter Factory (Gson, Moshi, Kotlinx Serialization) converts JSON to objects.'
    },
    {
      id: 'nsq6',
      question: 'How does DataStore expose its data?',
      options: ['Callback', 'Flow', 'LiveData only', 'Direct access'],
      correctAnswer: 1,
      explanation: 'DataStore.data returns a Flow<Preferences> for reactive updates.'
    },
    {
      id: 'nsq7',
      question: 'What exception does Retrofit throw for 404 errors?',
      options: ['IOException', 'HttpException', 'NetworkException', 'NotFoundException'],
      correctAnswer: 1,
      explanation: 'HttpException is thrown for non-2xx responses. Check response code for specific error.'
    },
    {
      id: 'nsq8',
      question: 'What is Coil built with?',
      options: ['Java only', 'Kotlin coroutines', 'RxJava', 'Callbacks'],
      correctAnswer: 1,
      explanation: 'Coil is Kotlin-first, using coroutines for async loading and modern Kotlin idioms.'
    },
    {
      id: 'nsq9',
      question: 'What is the difference between @Query and @QueryMap?',
      options: ['@Query is faster', '@QueryMap for multiple params', '@Query for lists', 'No difference'],
      correctAnswer: 1,
      explanation: '@Query is for single param. @QueryMap takes Map<String, String> for multiple dynamic params.'
    },
    {
      id: 'nsq10',
      question: 'What problem can SharedPreferences cause?',
      options: ['Data loss', 'ANRs (blocking)', 'Memory leaks', 'Security issues'],
      correctAnswer: 1,
      explanation: 'SharedPreferences I/O can block the main thread, potentially causing ANRs. DataStore is async.'
    },
    {
      id: 'nsq11',
      question: 'Which OkHttp interceptor type observes redirects and retries?',
      options: ['Application interceptor', 'Network interceptor', 'Both', 'Neither, redirects are invisible to interceptors'],
      correctAnswer: 1,
      explanation: 'Network interceptors sit below the retry-and-follow-up logic, so they run for every network request. Application interceptors see one request and the final response.'
    },
    {
      id: 'nsq12',
      question: 'A Retrofit suspend fun getUser(): User is called with airplane mode on. What happens?',
      options: ['An IOException (e.g. UnknownHostException) is thrown', 'HttpException with code 0', 'It returns null', 'It returns an empty User'],
      correctAnswer: 0,
      explanation: 'No HTTP response is received, so there is no HttpException. Transport failures surface as IOException subclasses, which is how you detect offline or timeout conditions.'
    },
    {
      id: 'nsq13',
      question: 'When does OkHttp invoke an Authenticator?',
      options: ['Before every request', 'On 403 Forbidden responses', 'On connection timeouts', 'When a response returns 401 Unauthorized'],
      correctAnswer: 3,
      explanation: 'Authenticators react to 401 (and 407 for proxies). Adding headers proactively is the job of an interceptor; 403 means authenticated but not allowed and is not retried.'
    },
    {
      id: 'nsq14',
      question: 'data class User(val name: String) is parsed by Gson from {}. What is the result?',
      options: ['JsonSyntaxException is thrown', 'name is null at runtime despite the non-null type', 'name is an empty string', 'A compile error'],
      correctAnswer: 1,
      explanation: 'Gson instantiates the class without calling the constructor and never sets name, leaving a null in a non-null field. The crash happens later when name is used.'
    },
    {
      id: 'nsq15',
      question: 'Two parts of the app each create preferencesDataStore for the same file name. What happens?',
      options: ['They share data transparently', 'The second instance overwrites the first', 'IllegalStateException: multiple DataStores active for the same file', 'Both work but writes are slower'],
      correctAnswer: 2,
      explanation: 'DataStore enforces a single active instance per file to prevent corruption. Create it once with a top-level delegate or a singleton.'
    },
    {
      id: 'nsq16',
      question: 'Which OkHttp timeout limits the total duration of a call including redirects and retries?',
      options: ['callTimeout', 'readTimeout', 'connectTimeout', 'writeTimeout'],
      correctAnswer: 0,
      explanation: 'callTimeout spans the whole call. The others each bound one phase, so a slow server that trickles bytes can exceed them combined without any single one firing.'
    },
    {
      id: 'nsq17',
      question: 'Where should a downloaded preview image that can be re-fetched anytime be stored?',
      options: ['filesDir', 'Public Downloads directory', 'cacheDir', 'SharedPreferences as Base64'],
      correctAnswer: 2,
      explanation: 'cacheDir is intended for reproducible data the system may reclaim when storage is low. filesDir persists until uninstall and would bloat the app.'
    },
    {
      id: 'nsq18',
      question: 'On Android 11+, how do you let the user pick a PDF from any provider without broad storage permission?',
      options: ['Request READ_EXTERNAL_STORAGE', 'List File("/sdcard") directly', 'Request MANAGE_EXTERNAL_STORAGE', 'Storage Access Framework via ActivityResultContracts.OpenDocument'],
      correctAnswer: 3,
      explanation: 'The system picker returns a content URI with temporary access, no permission required. MANAGE_EXTERNAL_STORAGE is restricted to file managers and similar apps.'
    },
    {
      id: 'nsq19',
      question: 'What is the main operational risk of certificate pinning?',
      options: ['The app stops connecting when the server certificate rotates without a pinned backup', 'It disables TLS', 'It makes requests slower', 'It only works on rooted devices'],
      correctAnswer: 0,
      explanation: 'Pins are shipped in the app, so a certificate change on the server breaks every installed version until an update. Pin backup keys and set expiration.'
    },
    {
      id: 'nsq20',
      question: 'Reading dataStore.data can fail with IOException. What is the idiomatic handling?',
      options: ['Wrap collect in try/catch and ignore', 'Use commit() instead', 'Use the Flow catch operator and emit(emptyPreferences()) for IOException', 'Switch to SharedPreferences'],
      correctAnswer: 2,
      explanation: 'catch keeps the Flow alive with default preferences when the file cannot be read. Non-IO exceptions should still be rethrown so real bugs surface.'
    }
  ]
};

// =============================================================================
// 7. TESTING & PERFORMANCE
// =============================================================================
const testingPerformance: AndroidCategory = {
  id: 'android-testing-performance',
  name: 'Testing & Performance',
  slug: 'testing-performance',
  description: 'Unit testing, UI testing, profiling, and optimization',
  icon: 'speedometer-outline',
  color: '#4CAF50',
  colorDark: '#388E3C',
  premium: true,

  learnContent: [
    {
      title: 'Unit Testing',
      content: `Unit tests verify individual components in isolation. Run on JVM, fast feedback.

**Frameworks:**
- JUnit: Test framework
- Mockito/MockK: Mocking
- Truth/AssertJ: Assertions

**Test Structure:**
- Given/When/Then or Arrange/Act/Assert
- @Before: Setup before each test
- @After: Cleanup after each test
- @Test: Mark test methods`,
      codeExample: `// ViewModel test
class UserViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @get:Rule
    val coroutineRule = MainCoroutineRule()

    private lateinit var viewModel: UserViewModel
    private lateinit var repository: FakeUserRepository

    @Before
    fun setup() {
        repository = FakeUserRepository()
        viewModel = UserViewModel(repository)
    }

    @Test
    fun \`loadUser updates state to success\`() = runTest {
        // Given
        repository.addUser(User("1", "John"))

        // When
        viewModel.loadUser("1")

        // Then
        val state = viewModel.state.first()
        assertThat(state).isInstanceOf(UiState.Success::class.java)
        assertThat((state as UiState.Success).user.name).isEqualTo("John")
    }

    @Test
    fun \`loadUser updates state to error on failure\`() = runTest {
        // Given
        repository.shouldFail = true

        // When
        viewModel.loadUser("1")

        // Then
        val state = viewModel.state.first()
        assertThat(state).isInstanceOf(UiState.Error::class.java)
    }
}

// Fake repository
class FakeUserRepository : UserRepository {
    private val users = mutableListOf<User>()
    var shouldFail = false

    fun addUser(user: User) = users.add(user)

    override suspend fun getUser(id: String): User {
        if (shouldFail) throw IOException("Network error")
        return users.find { it.id == id }
            ?: throw NotFoundException("User not found")
    }
}`
    },
    {
      title: 'MockK for Mocking',
      content: `MockK is a Kotlin-first mocking library with coroutine support.

**Key Features:**
- Kotlin DSL
- Coroutine support (coEvery, coVerify)
- Relaxed mocks
- Spy, capture, slot

**When to Mock:**
- External dependencies
- Network calls
- Database access
- System services`,
      codeExample: `@Test
fun \`fetchUser calls repository\`() = runTest {
    // Given
    val repository = mockk<UserRepository>()
    val viewModel = UserViewModel(repository)

    coEvery { repository.getUser("1") } returns User("1", "John")

    // When
    viewModel.loadUser("1")

    // Then
    coVerify(exactly = 1) { repository.getUser("1") }
}

// Relaxed mock (returns default values)
val repository = mockk<UserRepository>(relaxed = true)

// Capturing arguments
@Test
fun \`saveUser passes correct data\`() = runTest {
    val slot = slot<User>()
    val repository = mockk<UserRepository>()

    coEvery { repository.saveUser(capture(slot)) } just Runs

    viewModel.createUser("John", "john@example.com")

    assertThat(slot.captured.name).isEqualTo("John")
    assertThat(slot.captured.email).isEqualTo("john@example.com")
}

// Spy for partial mocking
val realRepository = UserRepositoryImpl(api, dao)
val spyRepository = spyk(realRepository)

coEvery { spyRepository.fetchFromNetwork(any()) } returns mockUser

// Answers for dynamic responses
coEvery { repository.getUser(any()) } answers {
    val id = firstArg<String>()
    User(id, "User $id")
}

// Verify order
coVerifyOrder {
    repository.fetchUser(any())
    dao.insert(any())
}`
    },
    {
      title: 'UI Testing with Espresso',
      content: `Espresso tests UI interactions on actual devices/emulators.

**Components:**
- ViewMatchers: Find views
- ViewActions: Perform actions
- ViewAssertions: Check state

**Best Practices:**
- Use IdlingResource for async
- Clear app state before tests
- Test user flows, not implementation`,
      codeExample: `@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun successfulLogin_navigatesToHome() {
        // Type email
        onView(withId(R.id.emailEditText))
            .perform(typeText("test@example.com"))

        // Type password
        onView(withId(R.id.passwordEditText))
            .perform(typeText("password123"), closeSoftKeyboard())

        // Click login button
        onView(withId(R.id.loginButton))
            .perform(click())

        // Verify home screen
        onView(withId(R.id.welcomeText))
            .check(matches(isDisplayed()))
    }

    @Test
    fun emptyEmail_showsError() {
        onView(withId(R.id.loginButton))
            .perform(click())

        onView(withText("Email is required"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun listItem_click() {
        // Click item in RecyclerView
        onView(withId(R.id.recyclerView))
            .perform(
                RecyclerViewActions.actionOnItemAtPosition<ViewHolder>(
                    0, click()
                )
            )
    }
}

// IdlingResource for async operations
class EspressoIdlingResource {
    companion object {
        val countingIdlingResource = CountingIdlingResource("GLOBAL")
    }

    fun increment() = countingIdlingResource.increment()
    fun decrement() = countingIdlingResource.decrement()
}

// In test setup
@Before
fun registerIdlingResource() {
    IdlingRegistry.getInstance()
        .register(EspressoIdlingResource.countingIdlingResource)
}`
    },
    {
      title: 'Compose Testing',
      content: `Compose has its own testing APIs that work with semantic trees.

**Key Components:**
- ComposeTestRule: Test environment
- onNode/onNodeWithText: Find nodes
- performClick, performTextInput: Actions
- assertExists, assertIsDisplayed: Assertions

**Semantic Properties:**
Test using content descriptions and test tags for stable selectors.`,
      codeExample: `@RunWith(AndroidJUnit4::class)
class LoginScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()  // Hosts composables under test

    @Test
    fun loginButton_showsLoadingState() {
        // Render the UI under test
        composeTestRule.setContent {
            LoginScreen(
                onLogin = { _, _ -> },
                isLoading = true
            )
        }

        // Find nodes by visible text or by test tag
        composeTestRule
            .onNodeWithText("Loading...")
            .assertIsDisplayed()

        composeTestRule
            .onNodeWithTag("loginButton")
            .assertIsNotEnabled()
    }

    @Test
    fun validInput_enablesLoginButton() {
        composeTestRule.setContent {
            var email by remember { mutableStateOf("") }
            var password by remember { mutableStateOf("") }

            LoginScreen(
                email = email,
                password = password,
                onEmailChange = { email = it },
                onPasswordChange = { password = it },
                onLogin = { _, _ -> }
            )
        }

        // Type email
        composeTestRule
            .onNodeWithTag("emailField")
            .performTextInput("test@example.com")

        // Type password
        composeTestRule
            .onNodeWithTag("passwordField")
            .performTextInput("password123")

        // Assert button is enabled
        composeTestRule
            .onNodeWithTag("loginButton")
            .assertIsEnabled()
    }

    @Test
    fun scrollAndClick() {
        composeTestRule.setContent {
            ItemList(items = (1..100).map { "Item $it" })
        }

        composeTestRule
            .onNodeWithText("Item 50")
            .performScrollTo()  // Scrolls the lazy list to the node
            .performClick()
    }
}

// Add testTag in composable
TextField(
    value = email,
    onValueChange = onEmailChange,
    modifier = Modifier.testTag("emailField")
)`
    },
    {
      title: 'Performance Optimization',
      content: `Optimize app performance to ensure smooth user experience.

**Key Metrics:**
- Frame rate (60 fps target)
- App startup time
- Memory usage
- Battery consumption

**Tools:**
- Android Studio Profiler
- Systrace/Perfetto
- Baseline Profiles
- LeakCanary

**Common Issues:**
- Overdraw
- Layout passes
- Memory leaks
- Main thread blocking`,
      codeExample: `// Avoid creating objects in draw/layout
// BAD
fun onDraw(canvas: Canvas) {
    val paint = Paint()  // Created every frame!
    canvas.drawRect(rect, paint)
}

// GOOD
private val paint = Paint()  // Reuse
fun onDraw(canvas: Canvas) {
    canvas.drawRect(rect, paint)
}

// Use lazy for expensive initialization
class MyClass {
    private val heavyObject by lazy {
        createHeavyObject()  // Only created when accessed
    }
}

// Avoid memory leaks - clear references
override fun onDestroy() {
    super.onDestroy()
    callback = null
    handler.removeCallbacksAndMessages(null)
}

// Use ViewStub for rarely-shown views
<ViewStub
    android:id="@+id/errorStub"
    android:layout="@layout/error_view"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

// Inflate only when needed
binding.errorStub.inflate()

// Compose: Use key for stable identity
LazyColumn {
    items(items, key = { it.id }) { item ->
        ItemRow(item)
    }
}

// Compose: Avoid unnecessary recomposition
@Composable
fun UserCard(user: User) {
    // Wrap in remember with key
    val formattedDate = remember(user.createdAt) {
        formatDate(user.createdAt)
    }
    Text(formattedDate)
}

// Baseline Profile
@ExperimentalBaselineProfilesApi
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val baselineRule = BaselineProfileRule()

    @Test
    fun startup() = baselineRule.collectBaselineProfile(
        packageName = "com.example.app"
    ) {
        startActivityAndWait()
        // Navigate critical user journeys
    }
}`
    }
  ],

  visualizations: [
    {
      title: 'Test Pyramid',
      description: 'Testing strategy layers',
      nodes: [
        { id: 'e2e', label: 'E2E Tests\n(Few, Slow)', x: 200, y: 50, type: 'warning' },
        { id: 'integration', label: 'Integration Tests\n(Some)', x: 200, y: 130, type: 'secondary' },
        { id: 'unit', label: 'Unit Tests\n(Many, Fast)', x: 200, y: 210, type: 'primary' }
      ],
      edges: [
        { from: 'e2e', to: 'integration' },
        { from: 'integration', to: 'unit' }
      ]
    },
    {
      title: 'Performance Tools',
      description: 'Android profiling toolkit',
      nodes: [
        { id: 'profiler', label: 'Android Studio\nProfiler', x: 200, y: 50, type: 'primary' },
        { id: 'cpu', label: 'CPU', x: 100, y: 130, type: 'info' },
        { id: 'memory', label: 'Memory', x: 200, y: 130, type: 'info' },
        { id: 'network', label: 'Network', x: 300, y: 130, type: 'info' },
        { id: 'leak', label: 'LeakCanary', x: 200, y: 210, type: 'secondary' }
      ],
      edges: [
        { from: 'profiler', to: 'cpu' },
        { from: 'profiler', to: 'memory' },
        { from: 'profiler', to: 'network' },
        { from: 'memory', to: 'leak' }
      ]
    }
  ],

  flashcards: [
    { id: 'tp1', front: 'What is the test pyramid?', back: 'Testing strategy: Many fast unit tests at base, fewer integration tests, even fewer slow E2E tests at top.' },
    { id: 'tp2', front: 'What is MockK?', back: 'Kotlin-first mocking library with coroutine support (coEvery, coVerify), relaxed mocks, and DSL syntax.' },
    { id: 'tp3', front: 'What is Espresso?', back: 'Android UI testing framework. Uses ViewMatchers to find views, ViewActions to interact, ViewAssertions to verify.' },
    { id: 'tp4', front: 'What is an IdlingResource?', back: 'Espresso mechanism to wait for async operations. Tells Espresso when app is idle and ready for interaction.' },
    { id: 'tp5', front: 'What is onNode in Compose testing?', back: 'Finds a Compose node by matcher (text, tag, etc.). Use .performClick(), .assertExists(), etc.' },
    { id: 'tp6', front: 'What is the target frame rate?', back: '60 fps (16ms per frame). Dropping frames causes jank. Use Profiler to identify slow frames.' },
    { id: 'tp7', front: 'What is LeakCanary?', back: 'Memory leak detection library. Automatically detects and reports leaks during debug builds.' },
    { id: 'tp8', front: 'What is coEvery in MockK?', back: 'Sets up behavior for suspend functions. Like every but for coroutines. Use coVerify to verify calls.' },
    { id: 'tp9', front: 'What is a Baseline Profile?', back: 'AOT compilation rules that improve startup and runtime performance. Pre-compiles critical paths.' },
    { id: 'tp10', front: 'What is testTag in Compose?', back: 'Modifier that adds a tag for testing. Find with onNodeWithTag(). More stable than text matching.' },
    { id: 'tp11', front: 'What is a Fake vs Mock?', back: 'Fake: Working implementation with shortcuts (in-memory DB). Mock: Programmed behavior with verification.' },
    { id: 'tp12', front: 'What causes overdraw?', back: 'Pixels drawn multiple times per frame. Reduce with flat hierarchies, removing unnecessary backgrounds.' },
    { id: 'tp13', front: 'What is runTest in coroutine testing?', back: 'Test builder that runs test body in TestScope. Automatically advances virtual time for delays.' },
    { id: 'tp14', front: 'What is InstantTaskExecutorRule?', back: 'JUnit rule that makes Architecture Components execute synchronously. Required for LiveData testing.' },
    { id: 'tp15', front: 'What is ViewStub?', back: 'Lightweight placeholder that inflates layout only when needed. Improves initial layout performance.' },
    { id: 'tp16', front: 'What is the difference between local unit tests and instrumented tests?', back: 'Local tests (src/test) run on the JVM: fast, but android.jar is a stub whose methods throw "not mocked". Instrumented tests (src/androidTest) run on a device or emulator with the real framework: slower but faithful.' },
    { id: 'tp17', front: 'What is Robolectric?', back: 'A framework that runs Android code on the JVM by providing shadow implementations of framework classes. Much faster than an emulator and works for Compose and View tests, at the cost of some fidelity.' },
    { id: 'tp18', front: 'Why do ViewModel unit tests need a Main dispatcher rule?', back: 'viewModelScope uses Dispatchers.Main, which is backed by the Android Looper and is unavailable on the JVM. A JUnit rule calls Dispatchers.setMain(testDispatcher) before each test and resetMain() after.' },
    { id: 'tp19', front: 'What is the difference between StandardTestDispatcher and UnconfinedTestDispatcher?', back: 'StandardTestDispatcher queues coroutines until you call advanceUntilIdle(), runCurrent() or advanceTimeBy(), giving precise control. UnconfinedTestDispatcher runs them eagerly up to the first suspension, which is simpler but hides ordering issues.' },
    { id: 'tp20', front: 'How do you test a StateFlow exposed by a ViewModel?', back: 'Collect it in runTest, e.g. with Turbine (flow.test { awaitItem() }) or backgroundScope.launch { collect }. A stateIn(WhileSubscribed) flow only runs its upstream while something collects, so an active collector is required.' },
    { id: 'tp21', front: 'What is an ANR and what triggers it?', back: 'Application Not Responding: the system shows the dialog when the main thread is blocked for about 5s while an input event is pending, or a BroadcastReceiver (10s foreground) or Service (20s) does not finish. Causes: I/O or heavy work on the main thread, deadlocks, synchronous IPC.' },
    { id: 'tp22', front: 'What is StrictMode?', back: 'A debug tool with a ThreadPolicy that flags disk and network access on the main thread and a VmPolicy that flags leaked Activities, unclosed Closeables and SQLite cursors. Penalties range from logging to crashing the app.' },
    { id: 'tp23', front: 'What are the most common causes of Activity memory leaks?', back: 'Static fields or singletons holding a Context or View, non-static inner classes and anonymous listeners (Handler, callbacks) referencing the Activity, unregistered receivers and listeners, fragment view references kept after onDestroyView, and coroutines or subscriptions not tied to a lifecycle.' },
    { id: 'tp24', front: 'What does R8 do?', back: 'Shrinks unused classes and methods, obfuscates names, and optimizes bytecode (inlining, class merging) for release builds; with shrinkResources it also drops unused resources. Code reached via reflection (Gson models, JNI) needs @Keep or keep rules.' },
    { id: 'tp25', front: 'What causes jank and how do you diagnose it?', back: 'Any frame over the deadline: heavy work or allocations on the main thread, deep View hierarchies, over-recomposition, work inside onDraw. Diagnose with System Trace / Perfetto, the Layout Inspector recomposition counts, JankStats, and Macrobenchmark frame timing.' },
    { id: 'tp26', front: 'What is the difference between Macrobenchmark and Microbenchmark?', back: 'Macrobenchmark measures whole-app interactions (startup, scrolling) on a device and can generate Baseline Profiles. Microbenchmark times small pieces of Kotlin code in a loop with JIT warm-up.' },
    { id: 'tp27', front: 'How do you measure and improve app startup?', back: 'Measure cold, warm and hot starts via TTID (first frame) and TTFD (reportFullyDrawn). Improve by keeping Application.onCreate light, lazy-initializing libraries (App Startup), avoiding synchronous disk/network, and shipping Baseline Profiles.' },
    { id: 'tp28', front: 'How do Compose tests synchronize with the UI?', back: 'createComposeRule waits for the composition and layout to become idle before actions and assertions. Use mainClock (autoAdvance = false) to step animations deterministically and waitUntil { } for states driven by external coroutines.' },
    { id: 'tp29', front: 'What is the difference between a stub, a spy and a mock?', back: 'Stub: returns canned answers, no verification. Mock: records interactions so the test can verify calls (behavior verification). Spy: wraps a real object, calling through by default while allowing selective overrides and verification.' },
    { id: 'tp30', front: 'How do you test a Room DAO?', back: 'Build the database with Room.inMemoryDatabaseBuilder in an instrumented or Robolectric test, run suspend DAO calls inside runTest, and close the database in @After. In-memory databases are fast and isolated per test.' }
  ],

  quizQuestions: [
    {
      id: 'tpq1',
      question: 'Which testing level should have the most tests?',
      options: ['E2E tests', 'Integration tests', 'Unit tests', 'Manual tests'],
      correctAnswer: 2,
      explanation: 'Unit tests are at the base of the pyramid - most numerous, fastest, cheapest to maintain.'
    },
    {
      id: 'tpq2',
      question: 'What does coEvery do in MockK?',
      options: ['Verify calls', 'Set up suspend function behavior', 'Create mocks', 'Run tests'],
      correctAnswer: 1,
      explanation: 'coEvery sets up expected behavior for suspend functions. Use coVerify for verification.'
    },
    {
      id: 'tpq3',
      question: 'What is IdlingResource used for?',
      options: ['Background processing', 'Sync Espresso with async operations', 'Memory management', 'Network caching'],
      correctAnswer: 1,
      explanation: 'IdlingResource tells Espresso when app is busy/idle, ensuring tests wait for async completion.'
    },
    {
      id: 'tpq4',
      question: 'What is the target frame time for 60fps?',
      options: ['8ms', '16ms', '32ms', '100ms'],
      correctAnswer: 1,
      explanation: '60fps means 16.67ms per frame. Exceeding this causes dropped frames (jank).'
    },
    {
      id: 'tpq5',
      question: 'How do you find Compose nodes in tests?',
      options: ['findViewById', 'onNode/onNodeWithText', 'findViewByTag', 'querySelector'],
      correctAnswer: 1,
      explanation: 'Compose testing uses onNode, onNodeWithText, onNodeWithTag to find semantic nodes.'
    },
    {
      id: 'tpq6',
      question: 'What detects memory leaks automatically?',
      options: ['Espresso', 'LeakCanary', 'Profiler', 'MockK'],
      correctAnswer: 1,
      explanation: 'LeakCanary automatically detects and reports memory leaks in debug builds.'
    },
    {
      id: 'tpq7',
      question: 'What is a Baseline Profile?',
      options: ['User profile', 'AOT compilation hints', 'Test configuration', 'Performance log'],
      correctAnswer: 1,
      explanation: 'Baseline Profiles provide AOT compilation hints for critical code paths, improving startup.'
    },
    {
      id: 'tpq8',
      question: 'What is the difference between Fake and Mock?',
      options: ['Same thing', 'Fake has working logic, Mock is programmed', 'Mock is faster', 'Fake is for UI'],
      correctAnswer: 1,
      explanation: 'Fakes have working implementations (in-memory). Mocks have programmed responses and verification.'
    },
    {
      id: 'tpq9',
      question: 'What does runTest provide for coroutine testing?',
      options: ['Real delays', 'TestScope with virtual time', 'Main dispatcher', 'Network mocking'],
      correctAnswer: 1,
      explanation: 'runTest provides TestScope that can skip delays and control virtual time for faster tests.'
    },
    {
      id: 'tpq10',
      question: 'What is ViewStub used for?',
      options: ['Testing', 'Lazy layout inflation', 'Animations', 'Data binding'],
      correctAnswer: 1,
      explanation: 'ViewStub is a zero-size placeholder that inflates its layout only when needed, improving performance.'
    },
    {
      id: 'tpq11',
      question: 'A local JVM unit test crashes with "Method d in android.util.Log not mocked". Why?',
      options: ['Log needs a Context', 'Log requires the INTERNET permission', 'Local tests compile against a stub android.jar whose methods throw; avoid framework calls, set unitTests.isReturnDefaultValues, or use Robolectric', 'Log is deprecated'],
      correctAnswer: 2,
      explanation: 'The JVM has no Android runtime. Keep framework classes out of pure logic, wrap them behind interfaces, or run under Robolectric.'
    },
    {
      id: 'tpq12',
      question: 'A ViewModel test fails with "Module with the Main dispatcher had failed to initialize". What is the fix?',
      options: ['Call Dispatchers.setMain(testDispatcher) in a JUnit rule and resetMain afterwards', 'Use runBlocking instead of runTest', 'Add InstantTaskExecutorRule', 'Move the test to androidTest'],
      correctAnswer: 0,
      explanation: 'viewModelScope uses Dispatchers.Main, which needs the Android Looper. Replacing it with a test dispatcher makes the ViewModel runnable on the JVM and controllable.'
    },
    {
      id: 'tpq13',
      question: 'With StandardTestDispatcher as Main, viewModel.load() is called but the assertion right after sees the old state. Why?',
      options: ['The ViewModel is broken', 'runTest does not support StateFlow', 'load() must be a suspend function', 'Coroutines are queued until advanceUntilIdle() or runCurrent() is called'],
      correctAnswer: 3,
      explanation: 'StandardTestDispatcher never runs work eagerly. Advance the scheduler, or use UnconfinedTestDispatcher if eager execution is acceptable.'
    },
    {
      id: 'tpq14',
      question: 'How long may the main thread block on a pending input event before an ANR is triggered?',
      options: ['1 second', '5 seconds', '10 seconds', '20 seconds'],
      correctAnswer: 1,
      explanation: 'Input dispatch times out at 5s. Broadcast receivers get 10s in the foreground and services 20s to finish their lifecycle callbacks.'
    },
    {
      id: 'tpq15',
      question: 'After enabling R8 the release build crashes because Gson returns objects with null fields. What is the fix?',
      options: ['Disable minification', 'Use commit() instead of apply()', 'Add @Keep or -keep rules for the model classes (or use a codegen serializer)', 'Increase the heap size'],
      correctAnswer: 2,
      explanation: 'R8 renamed the fields, so reflection-based JSON mapping no longer matches. Keep rules preserve names; Moshi codegen or kotlinx.serialization avoid reflection entirely.'
    },
    {
      id: 'tpq16',
      question: 'An Activity posts an anonymous Runnable with handler.postDelayed(runnable, 60_000) and is then rotated. Does it leak?',
      options: ['Yes, the Runnable implicitly references the Activity until it runs', 'No, Handler clears it on rotation', 'Only if the Runnable is a lambda', 'Only on API < 21'],
      correctAnswer: 0,
      explanation: 'Anonymous inner classes and lambdas capturing this keep the destroyed Activity reachable from the main Looper queue. Remove callbacks in onDestroy or use lifecycle-aware coroutines.'
    },
    {
      id: 'tpq17',
      question: 'Which tool generates a Baseline Profile from real user journeys?',
      options: ['Microbenchmark', 'Layout Inspector', 'LeakCanary', 'Macrobenchmark with BaselineProfileRule'],
      correctAnswer: 3,
      explanation: 'A Macrobenchmark test drives the app on a device and records the classes and methods used, producing the profile that ART compiles ahead of time at install.'
    },
    {
      id: 'tpq18',
      question: 'Which StrictMode policy detects leaked Activity instances?',
      options: ['ThreadPolicy', 'VmPolicy', 'NetworkPolicy', 'LeakPolicy'],
      correctAnswer: 1,
      explanation: 'VmPolicy.Builder().detectActivityLeaks() (plus detectLeakedClosableObjects) watches object lifetimes. ThreadPolicy covers disk and network on the main thread.'
    },
    {
      id: 'tpq19',
      question: 'Which startup metric does calling reportFullyDrawn() affect?',
      options: ['Time to initial display (TTID)', 'Frame render time', 'Time to full display (TTFD)', 'ANR rate'],
      correctAnswer: 2,
      explanation: 'TTID is measured automatically at the first frame. TTFD is only accurate when the app reports that its content is actually ready, e.g. after data loads.'
    },
    {
      id: 'tpq20',
      question: 'A test asserts that analytics.track("login") was called exactly once. Which test double role is that?',
      options: ['Stub', 'Fake', 'Mock', 'Dummy'],
      correctAnswer: 2,
      explanation: 'Verifying interactions is behavior verification, the defining job of a mock. Stubs and fakes supply data or working logic but do not record calls.'
    }
  ]
};

// Export all Android categories
export const androidCategories: AndroidCategory[] = [
  kotlinFundamentals,
  activityFragments,
  jetpackCompose,
  coroutinesFlow,
  architectureComponents,
  networkingStorage,
  testingPerformance,
];
