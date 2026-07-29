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
    { id: 'kf15', front: 'What is a trailing lambda?', back: 'If the last parameter of a function is a lambda, it can be placed outside the parentheses. Enables DSL-like syntax.' }
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
    { id: 'af15', front: 'What happens when you press the Home button?', back: 'Activity goes through onPause → onStop. It\'s still alive but not visible. Returns through onRestart → onStart → onResume.' }
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
    { id: 'jc15', front: 'What is SideEffect used for?', back: 'Running code after every successful recomposition. Used to sync Compose state with non-Compose code (analytics, logging).' }
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
    { id: 'cf15', front: 'What does withTimeoutOrNull return on timeout?', back: 'Returns null instead of throwing TimeoutCancellationException. Useful when timeout is recoverable.' }
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
    { id: 'ac15', front: 'What is a PeriodicWorkRequest?', back: 'WorkManager request that repeats at intervals (minimum 15 minutes). Survives app restarts.' }
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
    { id: 'ns15', front: 'What is AsyncImage in Coil?', back: 'Composable for loading images asynchronously. Supports placeholder, error, transformations, and caching.' }
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
    { id: 'tp15', front: 'What is ViewStub?', back: 'Lightweight placeholder that inflates layout only when needed. Improves initial layout performance.' }
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
