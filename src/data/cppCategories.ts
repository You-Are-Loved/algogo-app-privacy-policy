// C++ Categories - Comprehensive content for C++ interview prep
// Each subcategory has: learnContent, visualizations, flashcards, quizQuestions

import { Category } from '../types';

// Same Category shape as every other track
export type CppCategory = Category;

// =============================================================================
// 1. C++ FUNDAMENTALS
// =============================================================================
const cppFundamentals: CppCategory = {
  id: 'cpp-fundamentals',
  name: 'C++ Fundamentals',
  slug: 'cpp-fundamentals',
  description: 'Value semantics, references, const correctness, and the compilation model',
  icon: 'code-slash-outline',
  color: '#00599C',
  colorDark: '#004A82',

  learnContent: [
    {
      title: 'Values, References, and Copies',
      content: `C++ has value semantics by default: assignment and pass-by-value copy the entire object, unlike Java or Python where variables hold references.

**Value Semantics:**
- \`T x = y;\` creates an independent copy of y
- Passing \`T\` by value copies the argument into the parameter
- Copies of large objects (e.g. \`std::vector\`) duplicate all elements

**References:**
- \`T&\` is an alias for an existing object, not a copy
- Must be bound at initialization and cannot be reseated
- \`const T&\` binds to temporaries and avoids copies without allowing mutation

**Parameter Passing Rules of Thumb:**
- Cheap-to-copy types (int, double, pointers, small structs): pass by value
- Large read-only objects: pass by \`const T&\`
- Out/in-out parameters: pass by \`T&\` (or return a value instead)
- Sink parameters (the function keeps the object): pass by value and move

**Interview Trap - Slicing:**
Copying a derived object into a base-class value slices off the derived part. Pass polymorphic types by reference or pointer, never by value.`,
      codeExample: `#include <string>
#include <vector>
#include <iostream>

// Pass by value: 'v' is a full copy; mutations don't affect the caller
void byValue(std::vector<int> v) {
    v.push_back(99);  // caller's vector unchanged
}

// Pass by const reference: no copy, no mutation allowed
void byConstRef(const std::vector<int>& v) {
    std::cout << v.size() << "\\n";
    // v.push_back(1);  // ERROR: v is const
}

// Pass by reference: mutations are visible to the caller
void byRef(std::vector<int>& v) {
    v.push_back(42);  // caller sees this
}

// Sink parameter: take by value, then move into storage
class Widget {
    std::string name_;
public:
    explicit Widget(std::string name)
        : name_(std::move(name)) {}  // one copy or move total
};

int main() {
    std::vector<int> data{1, 2, 3};

    byValue(data);     // data still {1, 2, 3}
    byRef(data);       // data now {1, 2, 3, 42}

    int x = 10;
    int& ref = x;      // ref aliases x
    ref = 20;          // x is now 20

    // const ref can bind to a temporary
    const std::string& s = std::string("temp");
    std::cout << s << "\\n";  // lifetime extended to s's scope

    Widget w{"sensor"};  // string moved into the member
    return 0;
}`
    },
    {
      title: 'Const Correctness',
      content: `Const correctness lets the compiler enforce which code may mutate which data. Interviewers use it to test whether you read declarations precisely.

**Where const Appears:**
- \`const int x = 5;\` - immutable variable
- \`const T&\` parameter - function promises not to modify the argument
- \`void f() const;\` - member function promises not to modify the object
- \`const T* p\` - pointer to const (can't modify pointee)
- \`T* const p\` - const pointer (can't reseat the pointer)

**Reading Pointer Declarations:**
Read right to left: \`const int* p\` is "p is a pointer to an int that is const". \`int* const p\` is "p is a const pointer to int".

**Const Member Functions:**
- Callable on const objects; non-const members are not
- Inside, \`this\` has type \`const T*\`
- Overloading on constness is common for accessors

**mutable:**
Allows a member to be modified inside a const member function - used for caches, mutexes, and lazily computed values.

**Why It Matters:**
Const propagates through APIs. One missing const forces callers to drop const too ("const poisoning" in reverse). It also documents intent and enables compiler optimizations.`,
      codeExample: `#include <string>
#include <mutex>

class Account {
    std::string owner_;
    double balance_ = 0.0;
    mutable std::mutex mtx_;       // lockable even in const functions
    mutable double cachedFee_ = -1;

public:
    // const member function: cannot modify members (except mutable)
    double balance() const {
        std::lock_guard<std::mutex> lock(mtx_);  // OK: mtx_ is mutable
        return balance_;
    }

    // non-const: allowed to mutate
    void deposit(double amount) {
        std::lock_guard<std::mutex> lock(mtx_);
        balance_ += amount;
        cachedFee_ = -1;  // invalidate cache
    }

    // overloading on const: const object gets read-only access
    const std::string& owner() const { return owner_; }
    std::string& owner() { return owner_; }
};

void demoPointers() {
    int a = 1, b = 2;

    const int* p1 = &a;   // pointer to const int
    // *p1 = 5;           // ERROR: pointee is const
    p1 = &b;              // OK: pointer itself can move

    int* const p2 = &a;   // const pointer to int
    *p2 = 5;              // OK: pointee is mutable
    // p2 = &b;           // ERROR: pointer is const

    const int* const p3 = &a;  // neither can change
    (void)p3;
}

void useAccount(const Account& acc) {
    double b = acc.balance();  // OK: balance() is const
    // acc.deposit(10);        // ERROR: deposit() is non-const
    (void)b;
}`
    },
    {
      title: 'Functions and Overloading',
      content: `C++ selects among same-named functions at compile time using overload resolution - a frequent source of subtle interview questions.

**Overloading Basics:**
- Functions can share a name if their parameter lists differ
- Return type alone cannot distinguish overloads
- Top-level const on a by-value parameter does not create a new overload

**Overload Resolution Ranking (simplified):**
- Exact match (including trivial conversions)
- Promotion (\`char\` → \`int\`, \`float\` → \`double\`)
- Standard conversion (\`int\` → \`double\`, derived → base)
- User-defined conversion (converting constructors, conversion operators)
- If two candidates tie, the call is ambiguous - a compile error

**Default Arguments:**
- Supplied at the call site by the compiler
- Must be trailing; specified once (usually in the header)
- Virtual functions use the static type's defaults - a classic gotcha

**= delete:**
Explicitly removes an overload so certain calls fail to compile. Used to forbid copies or reject implicit conversions.

**Function Signatures and Linkage:**
The signature (name + parameter types) is what the linker matches. C++ name mangling encodes parameter types, which is why \`extern "C"\` disables overloading.`,
      codeExample: `#include <iostream>
#include <string>

void print(int x)         { std::cout << "int: " << x << "\\n"; }
void print(double x)      { std::cout << "double: " << x << "\\n"; }
void print(const std::string& s) { std::cout << "string: " << s << "\\n"; }

// Reject char* so print('x') can't sneak into a bad overload
void print(char) = delete;

// Default arguments must be trailing
std::string greet(const std::string& name, bool shout = false) {
    return shout ? name + "!!!" : "hi " + name;
}

struct Meters {
    double value;
    // explicit blocks implicit int -> Meters conversion in overloads
    explicit Meters(double v) : value(v) {}
};

void drive(Meters m) { std::cout << m.value << "m\\n"; }

struct NonCopyable {
    NonCopyable() = default;
    NonCopyable(const NonCopyable&) = delete;             // no copies
    NonCopyable& operator=(const NonCopyable&) = delete;
};

int main() {
    print(42);        // int: exact match
    print(3.14);      // double: exact match
    print(42L);       // long -> int and long -> double both convert...
                      // this one is actually ambiguous on many platforms
    print(std::string("hello"));
    // print('a');    // ERROR: deleted overload selected

    std::cout << greet("Ada") << "\\n";        // default used
    std::cout << greet("Ada", true) << "\\n";

    drive(Meters{100.0});  // OK: explicit construction
    // drive(100.0);       // ERROR: explicit blocks the conversion
    return 0;
}`
    },
    {
      title: 'Headers and the Compilation Model',
      content: `C++ compiles each source file independently, then links the results. Understanding this model explains headers, include guards, and most linker errors.

**Translation Units:**
- A .cpp file plus everything it \`#include\`s, after preprocessing
- Each translation unit compiles to one object file (.o / .obj)
- The linker merges object files, resolving symbols across them

**Declaration vs Definition:**
- Declaration: introduces a name (\`void f(int);\`) - can appear many times
- Definition: provides the body or storage - normally exactly once program-wide (the One Definition Rule, ODR)
- Headers hold declarations; .cpp files hold definitions

**Include Guards:**
Prevent a header from being processed twice in the same translation unit. Use \`#ifndef/#define/#endif\` or the widely supported \`#pragma once\`.

**Linkage:**
- External linkage (default for functions/globals): visible across translation units
- Internal linkage: \`static\` at namespace scope or an anonymous namespace - private to the translation unit
- \`inline\` permits a definition in multiple translation units (must be identical) - required for functions defined in headers

**Classic Errors:**
- "undefined reference": declared but never defined, or the .cpp wasn't linked
- "multiple definition": a non-inline definition placed in a header included by several .cpp files`,
      codeExample: `// ---------- math_utils.h ----------
#ifndef MATH_UTILS_H          // include guard
#define MATH_UTILS_H

// Declaration only: definition lives in math_utils.cpp
double average(const double* data, int count);

// inline: definition may appear in every TU that includes this header
inline double square(double x) { return x * x; }

// constexpr variables are implicitly usable in headers (C++17 inline)
inline constexpr double kPi = 3.14159265358979;

// extern declaration: storage defined elsewhere
extern int globalCounter;

#endif // MATH_UTILS_H

// ---------- math_utils.cpp ----------
#include "math_utils.h"

int globalCounter = 0;  // the single definition

// internal linkage: only this translation unit can see it
namespace {
    double clamp01(double x) {
        return x < 0 ? 0 : (x > 1 ? 1 : x);
    }
}

double average(const double* data, int count) {
    double sum = 0;
    for (int i = 0; i < count; ++i) sum += data[i];
    return clamp01(count > 0 ? 1.0 : 0.0) * (count ? sum / count : 0);
}

// ---------- main.cpp ----------
#include "math_utils.h"
#include <iostream>

int main() {
    double xs[] = {1.0, 2.0, 3.0};
    std::cout << average(xs, 3) << "\\n";   // linker finds math_utils.o
    std::cout << square(kPi) << "\\n";      // inline: defined right here
    ++globalCounter;                          // shared across TUs
    return 0;
}`
    },
    {
      title: 'Namespaces and Scope',
      content: `Namespaces partition names to prevent collisions in large codebases and libraries. Scope rules decide which declaration a name refers to.

**Namespaces:**
- Group related declarations: \`namespace net { class Socket; }\`
- Reopenable: the same namespace can be extended across files
- Nested namespaces: \`namespace a::b::c { }\` (C++17)

**using Declarations vs Directives:**
- \`using std::cout;\` - imports one name (fine in .cpp files)
- \`using namespace std;\` - imports everything (never in headers; it leaks into every includer and invites collisions)

**Anonymous Namespaces:**
Everything inside has internal linkage - the modern replacement for file-level \`static\`. Use for helpers private to a .cpp file.

**Argument-Dependent Lookup (ADL):**
Unqualified function calls also search the namespaces of their argument types. This is why \`std::cout << x\` finds \`operator<<\` and why \`swap(a, b)\` after \`using std::swap;\` picks up a type's custom swap.

**Scope and Shadowing:**
- Inner scopes may shadow outer names - compilers can warn (\`-Wshadow\`)
- Name lookup happens before overload resolution: a name found in an inner scope hides all outer overloads, not just matching ones.`,
      codeExample: `#include <iostream>
#include <utility>

namespace geometry {
    struct Point { double x, y; };

    // Found by ADL because Point lives in geometry
    double norm(const Point& p) {
        return p.x * p.x + p.y * p.y;
    }

    void swap(Point& a, Point& b) {  // custom swap, found by ADL
        std::swap(a.x, b.x);
        std::swap(a.y, b.y);
    }
}

namespace app::config {            // nested namespace (C++17)
    inline constexpr int kRetries = 3;
}

// Anonymous namespace: internal linkage, private to this file
namespace {
    int callCount = 0;
}

void logCall() { ++callCount; }

int main() {
    geometry::Point p{3, 4}, q{1, 2};

    // ADL: unqualified call finds geometry::norm via the argument type
    std::cout << norm(p) << "\\n";      // 25

    // The std::swap two-step idiom
    using std::swap;
    swap(p, q);   // ADL prefers geometry::swap; falls back to std::swap

    std::cout << app::config::kRetries << "\\n";

    int value = 1;
    {
        int value = 2;                   // shadows the outer 'value'
        std::cout << value << "\\n";    // 2
    }
    std::cout << value << "\\n";        // 1
    return 0;
}`
    },
    {
      title: 'Type Deduction with auto',
      content: `\`auto\` asks the compiler to deduce a variable's type from its initializer, using (almost) the same rules as template argument deduction.

**Core Rules:**
- \`auto\` deduces the value type and drops top-level const and references
- \`auto&\` deduces a reference and keeps low-level const
- \`const auto&\` binds to anything without copying, read-only
- \`auto&&\` is a forwarding reference: lvalue → lvalue ref, rvalue → rvalue ref

**Classic Gotchas:**
- \`auto x = getVector();\` copies; \`auto& x = ...\` may be what you meant
- Iterating \`for (auto item : container)\` copies each element - use \`const auto&\` for read-only loops
- \`auto\` with a braced initializer deduces \`std::initializer_list\` in a plain declaration: \`auto x{1};\` rules changed over standards - avoid relying on it
- \`std::vector<bool>\` returns a proxy: \`auto b = v[0];\` is not a \`bool\`

**Return Type Deduction:**
Functions may declare \`auto\` returns (C++14); all return statements must deduce the same type.

**decltype and decltype(auto):**
- \`decltype(expr)\` yields the exact declared type, references included
- \`decltype(auto)\` deduces like decltype - used in generic code to perfectly preserve reference-ness

**Structured Bindings (C++17):**
\`auto [a, b] = pair;\` unpacks tuples, pairs, arrays, and simple structs.`,
      codeExample: `#include <map>
#include <string>
#include <vector>
#include <iostream>

std::vector<int> makeData() { return {1, 2, 3}; }

int main() {
    // Basic deduction
    auto i = 42;              // int
    auto d = 3.14;            // double
    auto s = std::string("hi");  // std::string, not const char*

    // auto drops top-level const and references
    const int ci = 10;
    auto a = ci;              // int (const dropped) - 'a' is mutable
    auto& r = ci;             // const int& (low-level const kept)

    // Copy vs reference: an easy performance bug
    auto copy = makeData();          // whole vector copied? No - moved,
                                     // but binding auto& to it would dangle
    const auto& view = copy;         // no copy, read-only alias

    // Range-for: const auto& avoids copying each element
    std::map<std::string, int> ages{{"ada", 36}, {"alan", 41}};
    for (const auto& [name, age] : ages) {     // structured binding
        std::cout << name << " is " << age << "\\n";
    }

    // Iterators are where auto shines
    for (auto it = ages.begin(); it != ages.end(); ++it) {
        it->second += 1;
    }

    // auto&& forwarding reference in generic code
    auto&& x = 42;            // int&& (rvalue)
    auto&& y = i;             // int&  (lvalue)
    (void)x; (void)y; (void)a; (void)r; (void)d; (void)s; (void)view;

    // vector<bool> proxy trap
    std::vector<bool> flags{true, false};
    auto b = flags[0];        // NOT bool: a proxy object referencing flags
    bool realBool = flags[0]; // explicit type forces the conversion
    (void)b; (void)realBool;
    return 0;
}`
    }
  ],

  visualizations: [
    {
      title: 'Compilation Pipeline',
      description: 'From source files to a runnable executable',
      nodes: [
        { id: 'src', label: 'main.cpp\n+ headers', x: 60, y: 60, type: 'primary' },
        { id: 'pre', label: 'Preprocessor\n#include, #define', x: 190, y: 60, type: 'secondary' },
        { id: 'obj', label: 'Compiler\nmain.o', x: 320, y: 60, type: 'secondary' },
        { id: 'lib', label: 'other .o files\n+ libraries', x: 190, y: 170, type: 'secondary' },
        { id: 'link', label: 'Linker\nresolves symbols', x: 320, y: 170, type: 'warning' },
        { id: 'exe', label: 'Executable', x: 320, y: 260, type: 'primary' }
      ],
      edges: [
        { from: 'src', to: 'pre' },
        { from: 'pre', to: 'obj', label: 'translation unit' },
        { from: 'obj', to: 'link' },
        { from: 'lib', to: 'link' },
        { from: 'link', to: 'exe' }
      ]
    },
    {
      title: 'Parameter Passing Decision',
      description: 'Choosing how to pass an argument',
      nodes: [
        { id: 'q', label: 'How to pass?', x: 190, y: 40, type: 'primary' },
        { id: 'val', label: 'By value\ncheap types / sinks', x: 70, y: 140, type: 'secondary' },
        { id: 'cref', label: 'const T&\nlarge, read-only', x: 190, y: 140, type: 'secondary' },
        { id: 'ref', label: 'T&\nout / in-out', x: 310, y: 140, type: 'secondary' },
        { id: 'slice', label: 'Never by value\nfor polymorphic types', x: 190, y: 240, type: 'warning' }
      ],
      edges: [
        { from: 'q', to: 'val', label: 'small / owned' },
        { from: 'q', to: 'cref', label: 'read only' },
        { from: 'q', to: 'ref', label: 'mutate' },
        { from: 'cref', to: 'slice' }
      ]
    }
  ],

  flashcards: [
    { id: 'cf1', front: 'What does "value semantics" mean in C++?', back: 'Assignment and pass-by-value create independent copies of the whole object. Unlike Java/Python, a C++ variable of class type IS the object, not a reference to it.' },
    { id: 'cf2', front: 'What is the difference between T& and const T& parameters?', back: 'T& allows the function to mutate the caller\'s object and cannot bind to temporaries. const T& is read-only, avoids a copy, and can bind to temporaries.' },
    { id: 'cf3', front: 'Can a reference be reseated to refer to a different object?', back: 'No. A reference must be initialized when declared and is bound to that object for its entire lifetime. Assignment through it assigns to the referent.' },
    { id: 'cf4', front: 'What is object slicing?', back: 'Copying a derived object into a base-class value copies only the base part; derived members and dynamic behavior are lost. Pass polymorphic types by reference or pointer.' },
    { id: 'cf5', front: 'What is the difference between const int* p and int* const p?', back: 'const int* p: pointer to const int - pointee immutable, pointer reseatable. int* const p: const pointer - pointer fixed, pointee mutable. Read right to left.' },
    { id: 'cf6', front: 'What does a const member function promise?', back: 'It will not modify the object (this becomes const T*). Only const member functions can be called on a const object. mutable members are exempt.' },
    { id: 'cf7', front: 'What is the mutable keyword for?', back: 'Allows a member to be modified inside const member functions. Used for things that are not part of logical state: caches, mutexes, lazily computed values.' },
    { id: 'cf8', front: 'Can two overloads differ only by return type?', back: 'No. Overloads must differ in their parameter lists. Return type is not part of the signature for overload resolution.' },
    { id: 'cf9', front: 'What is a translation unit?', back: 'One source file after preprocessing: the .cpp plus everything it #includes. Each translation unit compiles independently into one object file.' },
    { id: 'cf10', front: 'What is the One Definition Rule (ODR)?', back: 'Every non-inline function or variable must have exactly one definition across the whole program. Declarations may repeat; duplicate definitions cause linker errors or undefined behavior.' },
    { id: 'cf11', front: 'What do include guards prevent?', back: 'A header being processed twice within the same translation unit, which would cause redefinition errors. Implemented with #ifndef/#define/#endif or #pragma once.' },
    { id: 'cf12', front: 'What does an anonymous namespace do?', back: 'Gives everything inside internal linkage: the names are private to that translation unit. Modern replacement for file-scope static.' },
    { id: 'cf13', front: 'What is argument-dependent lookup (ADL)?', back: 'Unqualified function calls also search the namespaces of the argument types. It is how operator<< and custom swap functions are found without qualification.' },
    { id: 'cf14', front: 'What does auto drop during type deduction?', back: 'Top-level const and references. auto x = constRefToInt yields a mutable int copy. Use auto& or const auto& to keep reference semantics.' },
    { id: 'cf15', front: 'What are the three primary value categories of a C++ expression?', back: 'lvalue: has identity and cannot be moved from (a named variable). prvalue: a pure temporary with no identity (a literal, the result of f()). xvalue: has identity but may be moved from (std::move(x), or a member of a temporary).' },
    { id: 'cf16', front: 'When do you use static_cast versus reinterpret_cast?', back: 'static_cast performs checked, well-defined conversions: numeric conversions, up/down class hierarchy, void* round trips. reinterpret_cast reinterprets bits (pointer to integer, unrelated pointer types) with no checking and is almost always a sign of low-level or unsafe code.' },
    { id: 'cf17', front: 'What does const_cast do, and when is using it undefined behavior?', back: 'It adds or removes const/volatile qualification. Writing through the result is UB if the original object was declared const. It is only legitimate for calling a const-incorrect legacy API on an object that is actually mutable.' },
    { id: 'cf18', front: 'What does brace (list) initialization forbid that parentheses allow?', back: 'Narrowing conversions. int x{3.7}; and char c{300}; are compile errors, while int x(3.7); silently truncates. Braces also cannot be parsed as a function declaration.' },
    { id: 'cf19', front: 'What is the "most vexing parse"?', back: 'Widget w(); declares a function named w returning Widget, not a default-constructed object. Anything that can be parsed as a declaration is one. Use Widget w; or Widget w{}; instead.' },
    { id: 'cf20', front: 'Why prefer enum class over a plain enum?', back: 'Scoped enumerators do not leak into the enclosing namespace, do not implicitly convert to int, and cannot be compared with unrelated enums. You can also specify the underlying type and forward-declare it.' },
    { id: 'cf21', front: 'Undefined vs unspecified vs implementation-defined behavior?', back: 'Undefined: the standard imposes no requirements - anything may happen (signed overflow, null deref). Unspecified: one of several valid outcomes, not documented (evaluation order of function arguments). Implementation-defined: a documented choice per compiler (sizeof(int)).' },
    { id: 'cf22', front: 'When is a function-local static variable initialized?', back: 'Once, the first time control passes through its declaration, and it lives until program exit. Since C++11 that initialization is guaranteed thread-safe, which is why it is used for lazy singletons.' },
    { id: 'cf23', front: 'What does the inline keyword actually mean in modern C++?', back: 'It permits a definition to appear in multiple translation units (ODR exemption) as long as all are identical - required for functions and variables defined in headers. It is only a weak hint about actual call inlining; the optimizer decides that.' },
    { id: 'cf24', front: 'What does extern do on a variable declaration?', back: 'extern int counter; declares a variable with external linkage without defining it, so multiple files can reference one definition that lives in exactly one .cpp file. Without extern, int counter; at namespace scope is a definition.' },
    { id: 'cf25', front: 'What goes wrong with for (size_t i = v.size() - 1; i >= 0; --i)?', back: 'size_t is unsigned, so i >= 0 is always true and the loop never ends; when i decrements past 0 it wraps to SIZE_MAX and v[i] is out of bounds. Loop with i-- inside the condition, use signed indices, or iterate with reverse iterators.' },
    { id: 'cf26', front: 'How does decltype differ from auto?', back: 'auto deduces from an initializer and strips references and top-level const. decltype(expr) yields the exact declared type of a name, or the type plus value category of an expression (T& for lvalue expressions). decltype(auto) declares a variable or return type using decltype rules.' },
    { id: 'cf27', front: 'What is the difference between const and constexpr on a variable?', back: 'const means the value cannot change after initialization, which may happen at runtime. constexpr means the value is computed at compile time and is usable in constant expressions (array bounds, template arguments). constexpr implies const.' },
    { id: 'cf28', front: 'What is name mangling and why does extern "C" exist?', back: 'The compiler encodes namespaces, class names, and parameter types into symbol names so overloads can coexist. extern "C" disables mangling for a declaration so C code (or another language) can link against it, at the cost of no overloading.' },
    { id: 'cf29', front: 'When is a forward declaration (class Foo;) enough?', back: 'Whenever the compiler does not need the size or members: pointers and references to Foo, function declarations taking or returning Foo, and unique_ptr<Foo> members with the destructor defined out of line. Anything that needs sizeof(Foo) or member access requires the full definition.' },
    { id: 'cf30', front: 'Why is sizeof an empty class 1 and not 0?', back: 'Every distinct object must have a unique address, so an empty class still occupies one byte in an array. The empty base optimization lets an empty base class add zero bytes to a derived object.' }
  ],

  quizQuestions: [
    {
      id: 'cfq1',
      question: 'A function receives std::vector<int> v (by value) and calls v.push_back(1). What does the caller observe?',
      options: ['The caller\'s vector gains an element', 'Nothing - the function modified a copy', 'Undefined behavior', 'A compile error'],
      correctAnswer: 1,
      explanation: 'Pass-by-value copies the entire vector. The push_back happens on the copy, so the caller\'s vector is untouched.'
    },
    {
      id: 'cfq2',
      question: 'Which declaration makes the pointer itself immutable but allows modifying what it points to?',
      options: ['const int* p', 'int* const p', 'const int* const p', 'int const* p'],
      correctAnswer: 1,
      explanation: 'int* const p is a const pointer to (mutable) int: p cannot be reseated, but *p can be assigned. const int* and int const* both mean pointer to const int.'
    },
    {
      id: 'cfq3',
      question: 'Why can a const member function modify a member declared mutable?',
      options: ['mutable disables all type checking', 'mutable members are excluded from the object\'s const-ness', 'const member functions can modify any member', 'mutable members are stored outside the object'],
      correctAnswer: 1,
      explanation: 'mutable marks a member as not part of the object\'s logical state, so the const qualification on this does not apply to it. Typical uses: caches and mutexes.'
    },
    {
      id: 'cfq4',
      question: 'Two overloads differ only in return type: int f(); and double f();. What happens?',
      options: ['The compiler picks based on the call context', 'The int version wins by default', 'Compile error - return type is not part of the overload signature', 'The double version wins by promotion'],
      correctAnswer: 2,
      explanation: 'Overloads must differ in parameter lists. Declaring two functions with the same name and parameters but different return types is a redeclaration error.'
    },
    {
      id: 'cfq5',
      question: 'A non-inline function is defined in a header included by three .cpp files. What is the result?',
      options: ['Multiple definition error at link time', 'The compiler merges the copies automatically', 'Only the first definition is kept', 'A warning, but the program links'],
      correctAnswer: 0,
      explanation: 'Each translation unit gets its own definition, violating the ODR. The linker reports a multiple definition error. Mark the function inline or move the definition to a .cpp file.'
    },
    {
      id: 'cfq6',
      question: 'What does "undefined reference to f(int)" at link time usually mean?',
      options: ['f was defined twice', 'f was called before being declared', 'f was declared but its definition was never compiled or linked', 'f has internal linkage in the caller\'s file'],
      correctAnswer: 2,
      explanation: 'The compiler was satisfied by a declaration, but the linker could not find the definition - typically a missing .cpp in the build or a signature mismatch.'
    },
    {
      id: 'cfq7',
      question: 'Why is "using namespace std;" discouraged in header files specifically?',
      options: ['It slows down compilation dramatically', 'It is a syntax error in headers', 'It only works in .cpp files', 'It injects every std name into every file that includes the header, risking collisions'],
      correctAnswer: 3,
      explanation: 'A header is textually pasted into every includer, so the directive pollutes their global scope too. In a .cpp file the damage is at least contained to that translation unit.'
    },
    {
      id: 'cfq8',
      question: 'Given const int ci = 5; auto x = ci; what is the type of x?',
      options: ['const int', 'int', 'const int&', 'int&'],
      correctAnswer: 1,
      explanation: 'auto deduction drops top-level const and references, so x is a plain mutable int copy. Use const auto or auto& to preserve them.'
    },
    {
      id: 'cfq9',
      question: 'In "for (auto item : bigStrings)" over a std::vector<std::string>, what happens to each element?',
      options: ['It is moved out of the vector', 'It is accessed by reference', 'It is copied into item on every iteration', 'It is accessed through an iterator proxy'],
      correctAnswer: 2,
      explanation: 'Plain auto in a range-for copies each element. For read-only iteration over non-trivial types, write for (const auto& item : bigStrings).'
    },
    {
      id: 'cfq10',
      question: 'What does the statement Widget w(); declare?',
      options: ['A function named w that takes no arguments and returns Widget', 'A default-constructed Widget named w', 'A Widget named w initialized with an empty initializer list', 'Nothing - it is a compile error'],
      correctAnswer: 0,
      explanation: 'This is the most vexing parse: the compiler reads it as a function declaration. Write Widget w; or Widget w{}; to construct an object.'
    },
    {
      id: 'cfq11',
      question: 'What happens with int x{3.7};?',
      options: ['x becomes 3', 'x becomes 4', 'Compile error - brace initialization forbids narrowing', 'Undefined behavior'],
      correctAnswer: 2,
      explanation: 'List initialization rejects narrowing conversions such as double to int. int x(3.7); or int x = 3.7; would silently truncate to 3.'
    },
    {
      id: 'cfq12',
      question: 'std::vector<int> v(5); for (size_t i = v.size() - 1; i >= 0; --i) v[i] = 0; What happens?',
      options: ['Sets all five elements to zero and stops', 'Never terminates: i is unsigned so i >= 0 is always true, and v[i] goes out of bounds after wrapping', 'Compile error comparing unsigned with 0', 'Skips element 0'],
      correctAnswer: 1,
      explanation: 'When i reaches 0 and decrements, it wraps to SIZE_MAX rather than becoming negative. The condition stays true and v[SIZE_MAX] is undefined behavior.'
    },
    {
      id: 'cfq13',
      question: 'enum class Color { Red, Green }; int x = Color::Red; What is the result?',
      options: ['x == 0', 'x == 1', 'Undefined behavior', 'Compile error - scoped enums do not implicitly convert to int'],
      correctAnswer: 3,
      explanation: 'Unlike a plain enum, enum class requires an explicit static_cast<int>(Color::Red). That is the point: it prevents accidental mixing of enums and integers.'
    },
    {
      id: 'cfq14',
      question: 'int next() { static int n = 0; return ++n; } is called three times. How many times is n initialized, and what is the third result?',
      options: ['Once; returns 3', 'Three times; returns 1', 'Once; returns 1', 'Three times; returns 3'],
      correctAnswer: 0,
      explanation: 'A function-local static is initialized exactly once, on the first call, and keeps its value across calls. The calls return 1, 2, 3.'
    },
    {
      id: 'cfq15',
      question: 'What is the primary effect of marking a function inline in modern C++?',
      options: ['It guarantees the call is inlined by the compiler', 'It makes the function private to the translation unit', 'It allows an identical definition to appear in multiple translation units without an ODR violation', 'It forces the function to be evaluated at compile time'],
      correctAnswer: 2,
      explanation: 'inline is about linkage rules, letting header-defined functions and variables be included everywhere. Whether the call is actually inlined is up to the optimizer regardless of the keyword.'
    },
    {
      id: 'cfq16',
      question: 'float f = 1.5f; int bits = reinterpret_cast<int&>(f); What is the status of this code?',
      options: ['Well-defined: it reads the raw bits of f', 'Undefined behavior - it violates strict aliasing; use std::memcpy or std::bit_cast', 'Compile error - reinterpret_cast cannot produce a reference', 'It converts 1.5 to 1 numerically'],
      correctAnswer: 1,
      explanation: 'Accessing a float object through an int lvalue breaks the aliasing rules, and optimizers exploit that. std::bit_cast<int>(f) (C++20) or memcpy is the sanctioned way to reinterpret bits.'
    },
    {
      id: 'cfq17',
      question: 'std::string s = "x"; what is the value category of the expression std::move(s)?',
      options: ['lvalue', 'prvalue', 'glvalue that is also a prvalue', 'xvalue'],
      correctAnswer: 3,
      explanation: 'std::move returns T&&, and a function call returning an rvalue reference is an xvalue: it still names s (has identity) but may be moved from.'
    },
    {
      id: 'cfq18',
      question: 'int x = INT_MAX; x = x + 1; What does the standard say?',
      options: ['x wraps to INT_MIN', 'Undefined behavior - signed integer overflow', 'x is clamped to INT_MAX', 'A runtime exception is thrown'],
      correctAnswer: 1,
      explanation: 'Signed overflow is UB, and compilers optimize on the assumption it never happens (e.g. folding x + 1 > x to true). Only unsigned arithmetic is defined to wrap.'
    },
    {
      id: 'cfq19',
      question: 'Given only the forward declaration class Foo; which of these compiles?',
      options: ['Foo* makeFoo();', 'Foo f;', 'sizeof(Foo)', 'struct Bar { Foo member; };'],
      correctAnswer: 0,
      explanation: 'Declaring pointers, references, and function signatures needs only the name. Creating an object, taking its size, or embedding it as a member requires the complete class definition.'
    },
    {
      id: 'cfq20',
      question: 'A header declares void log(int level = 1); and the .cpp defines void log(int level = 1) { ... }. What happens?',
      options: ['It compiles; the definition just repeats the default', 'The definition\'s default overrides the header\'s', 'Compile error - a default argument may only be specified once for a parameter', 'Link error - two different functions'],
      correctAnswer: 2,
      explanation: 'Default arguments are part of the declaration and cannot be redeclared in the same scope, even with the same value. Specify them once, in the header, so every caller sees them.'
    }
  ]
};

// =============================================================================
// 2. POINTERS & MEMORY
// =============================================================================
const pointersMemory: CppCategory = {
  id: 'cpp-pointers-memory',
  name: 'Pointers & Memory',
  slug: 'cpp-pointers-memory',
  description: 'Raw pointers, stack vs heap, RAII, and smart pointers',
  icon: 'hardware-chip-outline',
  color: '#E17055',
  colorDark: '#C05A44',

  learnContent: [
    {
      title: 'Pointers vs References',
      content: `Pointers and references both refer to other objects, but their rules differ enough that "when would you use each?" is a standard interview question.

**Pointers:**
- Hold an address; \`*p\` dereferences, \`&x\` takes an address
- Can be null (\`nullptr\`), reseated, and used in arithmetic
- Must be checked before dereferencing when null is possible

**References:**
- An alias bound once at initialization; cannot be null or reseated
- No "empty" state to check - simpler and safer for parameters
- No pointer arithmetic

**When to Use Which:**
- Reference: the referent always exists (parameters, return values)
- Pointer: "maybe absent" semantics, reseating, or interop with C APIs
- Modern code prefers references and smart pointers; raw pointers survive as non-owning observers

**nullptr vs NULL:**
\`nullptr\` (C++11) has its own type \`std::nullptr_t\` and never ambiguously converts to int, unlike the macro \`NULL\` (often just \`0\`).

**Pointer Arithmetic:**
\`p + 1\` advances by \`sizeof(*p)\` bytes - defined only within the same array (plus one-past-the-end). Anything else is undefined behavior.`,
      codeExample: `#include <iostream>

void increment(int& x) { ++x; }          // referent always exists
void maybeLog(const int* p) {            // pointer models "optional"
    if (p) std::cout << *p << "\\n";
}

int main() {
    int a = 10, b = 20;

    // Pointers: reseatable, nullable
    int* p = &a;
    std::cout << *p << "\\n";   // 10 (dereference)
    p = &b;                      // reseat to b
    *p = 99;                     // b is now 99
    p = nullptr;                 // explicitly empty
    // *p = 1;                   // CRASH/UB: dereferencing null

    // References: bound once, never null
    int& r = a;
    r = 42;                      // assigns to a, does NOT rebind
    int& r2 = b;
    r = r2;                      // copies b's VALUE into a

    increment(a);                // a == 43, no & needed at call site
    maybeLog(&a);                // prints 43
    maybeLog(nullptr);           // prints nothing - legal

    // Pointer arithmetic within an array
    int arr[4] = {1, 2, 3, 4};
    int* it = arr;               // decays to pointer to first element
    int* end = arr + 4;          // one-past-the-end: valid to compute
    while (it != end) {
        std::cout << *it++ << " ";
    }
    std::cout << "\\n";

    // sizeof-aware stepping
    double ds[3] = {1.5, 2.5, 3.5};
    double* dp = ds;
    ++dp;                        // advances 8 bytes, not 1
    std::cout << *dp << "\\n";  // 2.5
    return 0;
}`
    },
    {
      title: 'Stack vs Heap',
      content: `Where an object lives determines its lifetime, cost, and failure modes - a core systems-interview topic.

**The Stack:**
- Automatic storage: locals, parameters, return addresses
- Allocation is one pointer bump - essentially free
- Destroyed deterministically when the scope exits (reverse order)
- Limited size (typically 1-8 MB per thread); overflow crashes the program
- Objects cannot outlive their scope

**The Heap (free store):**
- Dynamic storage requested at runtime (\`new\`, \`malloc\`, containers)
- Sized at runtime, can be huge, lifetime controlled by the programmer
- Slower: allocator bookkeeping, possible locks, cache-unfriendly scatter
- You (or a smart pointer/container) must release it

**Interview Angles:**
- "Where do std::vector's elements live?" The vector object may be on the stack, but its elements are heap-allocated.
- Returning the address of a local is a dangling pointer - the frame is gone
- Large buffers belong on the heap; deep recursion risks stack overflow
- Stack allocation is faster mainly due to locality and zero bookkeeping

**Static Storage:**
A third region: globals and \`static\` locals live for the whole program, initialized before/at first use.`,
      codeExample: `#include <vector>
#include <memory>
#include <iostream>

int* danglingBad() {
    int local = 42;
    return &local;         // BUG: local dies when the function returns
}

std::unique_ptr<int> heapGood() {
    return std::make_unique<int>(42);   // heap object outlives the frame
}

int valueGood() {
    int local = 42;
    return local;          // copy/move out - always safe
}

int main() {
    // Stack: automatic lifetime, destroyed at scope exit
    {
        std::vector<int> v{1, 2, 3};
        // 'v' (the small header: pointer/size/capacity) is on the STACK
        // its 3 ints live on the HEAP, freed by v's destructor
    }   // <- vector destructor runs here, heap memory released

    // Heap via smart pointer: explicit dynamic lifetime
    auto p = heapGood();
    std::cout << *p << "\\n";           // 42, still alive

    // Stack size limits: this would overflow most default stacks
    // int huge[10'000'000];             // ~40 MB -> stack overflow
    auto huge = std::make_unique<int[]>(10'000'000);  // heap: fine
    huge[0] = 1;

    // Static storage: lives for the whole program
    static int counter = 0;              // initialized once
    ++counter;

    // Deterministic reverse-order destruction
    struct Noisy {
        const char* name;
        ~Noisy() { std::cout << name << " destroyed\\n"; }
    };
    Noisy first{"first"}, second{"second"};
    return 0;
    // prints: "second destroyed" then "first destroyed"
}`
    },
    {
      title: 'new/delete and Why to Avoid Them',
      content: `\`new\` and \`delete\` are the raw C++ mechanism for heap objects. Interviewers expect you to know exactly how they work - and why modern code almost never writes them directly.

**Mechanics:**
- \`new T(args)\` allocates memory AND runs T's constructor
- \`delete p\` runs the destructor AND frees the memory
- \`new T[n]\` / \`delete[] p\` for arrays - mismatching \`delete\` with \`delete[]\` is undefined behavior
- \`new\` throws \`std::bad_alloc\` on failure (it does not return null unless you use \`new (std::nothrow)\`)

**vs malloc/free:**
\`malloc\` only allocates bytes - no constructors, no type safety, returns null on failure. Never mix malloc/free with new/delete on the same object.

**Why Avoid Raw new/delete:**
- Every \`new\` needs exactly one \`delete\` on every path - including early returns and exceptions
- An exception between new and delete leaks
- Manual ownership doesn't compose: who deletes when pointers are shared?

**The Modern Rule:**
- Containers (\`std::vector\`, \`std::string\`) for dynamic arrays and buffers
- \`std::make_unique\` / \`std::make_shared\` for single heap objects
- Raw \`new\`/\`delete\` only inside low-level library internals

**delete on nullptr:**
Safe and does nothing - so null checks before delete are redundant.`,
      codeExample: `#include <memory>
#include <vector>
#include <stdexcept>
#include <string>

struct Session {
    std::string user;
    explicit Session(std::string u) : user(std::move(u)) {}
};

void validate(const Session&) { throw std::runtime_error("invalid"); }

// ---------- The old, fragile way ----------
void leaky() {
    Session* s = new Session("ada");    // allocate + construct
    validate(*s);                        // throws...
    delete s;                            // ...so this NEVER runs: LEAK
}

void manualButCorrect() {
    Session* s = new Session("ada");
    try {
        validate(*s);
    } catch (...) {
        delete s;                        // cleanup on every path
        throw;
    }
    delete s;                            // and the happy path
}

// ---------- The modern way ----------
void safe() {
    auto s = std::make_unique<Session>("ada");
    validate(*s);                        // throws? destructor still runs
}                                        // no delete anywhere

void arrays() {
    int* raw = new int[100];             // array new
    delete[] raw;                        // MUST be delete[], not delete

    // But really, just use a container:
    std::vector<int> buf(100);           // sized, zeroed, self-freeing

    // Or if you truly need a unique_ptr array:
    auto arr = std::make_unique<int[]>(100);
}   // everything released automatically

int main() {
    safe();       // ok (exception propagates but nothing leaks)
    arrays();
    Session* p = nullptr;
    delete p;     // legal no-op: delete on nullptr is safe
    return 0;
}`
    },
    {
      title: 'RAII',
      content: `RAII - Resource Acquisition Is Initialization - is C++'s central idiom: tie a resource's lifetime to an object's lifetime, so the destructor releases it automatically.

**The Pattern:**
- Acquire the resource in the constructor
- Release it in the destructor
- The compiler guarantees destructors run at scope exit - on returns, exceptions, break, everything

**Why It Matters:**
- No finally blocks needed: cleanup is written once, in the type
- Exception safety falls out for free
- Applies to any resource: memory, files, locks, sockets, GPU handles, database transactions

**Standard Library RAII Types:**
- \`std::unique_ptr\` / \`std::shared_ptr\` - heap memory
- \`std::lock_guard\` / \`std::unique_lock\` - mutexes
- \`std::fstream\` - file handles
- \`std::vector\`, \`std::string\` - buffers

**Writing Your Own:**
Wrap the resource, release in the destructor, and decide the copy/move story. Usually: delete copies, allow moves (transferring ownership) - see the Rule of Five in the classes section.

**Interview Framing:**
"How does C++ manage resources without a garbage collector?" The answer is RAII plus deterministic destruction - and it handles non-memory resources (files, locks) that GC finalizers handle poorly.`,
      codeExample: `#include <cstdio>
#include <mutex>
#include <stdexcept>
#include <utility>

// A hand-rolled RAII wrapper around a C FILE*
class File {
    std::FILE* handle_ = nullptr;
public:
    File(const char* path, const char* mode)
        : handle_(std::fopen(path, mode)) {
        if (!handle_) throw std::runtime_error("open failed");
    }

    ~File() {
        if (handle_) std::fclose(handle_);   // release, always
    }

    // Resource types: no copying (who would close the file?)
    File(const File&) = delete;
    File& operator=(const File&) = delete;

    // ...but ownership can MOVE
    File(File&& other) noexcept
        : handle_(std::exchange(other.handle_, nullptr)) {}
    File& operator=(File&& other) noexcept {
        if (this != &other) {
            if (handle_) std::fclose(handle_);
            handle_ = std::exchange(other.handle_, nullptr);
        }
        return *this;
    }

    std::FILE* get() const { return handle_; }
};

std::mutex gMutex;
int gCounter = 0;

void writeLog(const char* msg) {
    // lock_guard: RAII for mutexes - unlocks on ANY exit path
    std::lock_guard<std::mutex> lock(gMutex);
    ++gCounter;
    if (!msg) throw std::invalid_argument("null msg");  // still unlocks!

    File f("app.log", "a");         // throws if open fails
    std::fputs(msg, f.get());
}   // f closed, lock released - in reverse declaration order

int main() {
    try {
        writeLog("started\\n");
        writeLog(nullptr);           // throws, but nothing leaks
    } catch (const std::exception&) {
        // mutex already unlocked, file already closed
    }
    return 0;
}`
    },
    {
      title: 'unique_ptr, shared_ptr, and weak_ptr',
      content: `Smart pointers are RAII for heap objects. Choosing the right one is a guaranteed interview question.

**std::unique_ptr - sole ownership:**
- Exactly one owner; the destructor deletes the object
- Move-only: copying is a compile error, moving transfers ownership
- Zero overhead versus a raw pointer (with the default deleter)
- Create with \`std::make_unique<T>(args)\`
- Your default choice - upgrade only when you truly need sharing

**std::shared_ptr - shared ownership:**
- Reference-counted: the last owner's destruction deletes the object
- Copying increments an atomic count; that costs on hot paths
- \`std::make_shared\` allocates object + control block in one shot
- The control block also tracks weak references

**std::weak_ptr - non-owning observer of shared state:**
- References a shared_ptr's object without extending its lifetime
- \`lock()\` returns a shared_ptr (or empty if the object died)
- Breaks reference cycles: parent holds shared_ptr to child, child holds weak_ptr to parent

**The Cycle Problem:**
Two objects holding shared_ptrs to each other keep counts at 1 forever - a leak the GC-less model can't detect. weak_ptr is the fix.

**Passing Smart Pointers:**
- Function just uses the object? Take \`T&\` or \`const T&\`
- Function takes ownership? Take \`unique_ptr<T>\` by value
- Function shares ownership? Take \`shared_ptr<T>\` by value
- Never pass \`shared_ptr\` by const ref just to observe`,
      codeExample: `#include <memory>
#include <iostream>
#include <vector>

struct Texture {
    int id;
    explicit Texture(int i) : id(i) { std::cout << "load " << id << "\\n"; }
    ~Texture() { std::cout << "free " << id << "\\n"; }
};

// Ownership transfer: take unique_ptr BY VALUE
void store(std::unique_ptr<Texture> t, std::vector<std::unique_ptr<Texture>>& out) {
    out.push_back(std::move(t));
}

struct Child;
struct Parent {
    std::shared_ptr<Child> child;
    ~Parent() { std::cout << "~Parent\\n"; }
};
struct Child {
    std::weak_ptr<Parent> parent;   // weak breaks the cycle
    ~Child() { std::cout << "~Child\\n"; }
};

int main() {
    // unique_ptr: sole owner, move-only
    auto tex = std::make_unique<Texture>(1);
    // auto copy = tex;                    // ERROR: no copying
    std::vector<std::unique_ptr<Texture>> cache;
    store(std::move(tex), cache);          // ownership moved in
    // tex is now null - using it would be a bug

    // shared_ptr: reference counted
    auto a = std::make_shared<Texture>(2);
    std::cout << a.use_count() << "\\n";  // 1
    {
        auto b = a;                         // count -> 2
        std::cout << a.use_count() << "\\n";
    }                                       // b dies, count -> 1
    a.reset();                              // count -> 0, "free 2"

    // weak_ptr: observe without owning
    auto parent = std::make_shared<Parent>();
    parent->child = std::make_shared<Child>();
    parent->child->parent = parent;         // weak: count stays 1

    if (auto p = parent->child->parent.lock()) {
        std::cout << "parent alive\\n";    // safe temporary shared_ptr
    }

    parent.reset();  // ~Parent AND ~Child both run - no leak
    return 0;
}`
    },
    {
      title: 'Common Memory Bugs',
      content: `Senior interviews probe whether you can name, cause, and prevent the classic C++ memory bugs.

**Dangling Pointer / Use-After-Free:**
Using memory after its lifetime ended: a pointer to a freed heap object, a reference to a dead local, or an iterator invalidated by container growth. Symptoms range from "works fine" to corruption - it's undefined behavior.

**Memory Leak:**
Heap memory never released. The process's footprint grows; long-running services eventually die. Caused by missing delete, exception paths, or shared_ptr cycles.

**Double Free:**
Deleting the same pointer twice corrupts allocator metadata - often exploited in security attacks. Caused by two raw owners of one allocation.

**Buffer Overflow:**
Writing past an allocation's end tramples neighboring memory - the classic security vulnerability. \`std::vector::at()\` and bounds-checked APIs prevent it.

**Iterator/Reference Invalidation:**
\`push_back\` may reallocate a vector, invalidating every pointer, reference, and iterator into it - a use-after-free without any visible free.

**Prevention Toolkit:**
- RAII and smart pointers eliminate leaks and double frees by construction
- Prefer values and containers over raw allocation
- AddressSanitizer (\`-fsanitize=address\`) catches use-after-free, overflow, leaks at runtime
- Valgrind for leak checking; static analyzers (clang-tidy) for dangling patterns
- In interviews, name the tools - it signals real-world experience`,
      codeExample: `#include <vector>
#include <memory>
#include <iostream>

// BUG 1: dangling reference to a dead stack frame
const std::string& danglingRef() {
    std::string local = "temp";
    return local;                 // UB: local destroyed at return
}

// BUG 2: use-after-free on the heap
void useAfterFree() {
    int* p = new int(5);
    delete p;
    // std::cout << *p;           // UB: reads freed memory
    p = nullptr;                  // mitigation: null after delete
}

// BUG 3: double free via two raw "owners"
void doubleFree() {
    int* p = new int(1);
    int* q = p;                   // both think they own it
    delete p;
    // delete q;                  // UB: heap corruption
    (void)q;
}

// BUG 4: leak on an early-exit path
void leak(bool fail) {
    int* buf = new int[1024];
    if (fail) return;             // LEAK: delete[] skipped
    delete[] buf;
}

// BUG 5: iterator invalidation - a hidden use-after-free
void invalidation() {
    std::vector<int> v{1, 2, 3};
    int* first = &v[0];
    v.push_back(4);               // may reallocate: 'first' now dangles
    // std::cout << *first;       // UB if reallocation happened
    first = &v[0];                // must re-acquire after growth
    (void)first;
}

// THE FIX: ownership expressed in types
void fixed(bool fail) {
    auto buf = std::make_unique<int[]>(1024);   // no leak, any path
    auto shared = std::make_shared<int>(1);
    auto alias = shared;          // counted, no double free possible
    if (fail) return;             // everything still released
}

int main() {
    useAfterFree();
    leak(true);        // AddressSanitizer would flag this at exit
    invalidation();
    fixed(true);
    // Compile with: g++ -fsanitize=address,undefined -g bugs.cpp
    return 0;
}`
    }
  ],

  visualizations: [
    {
      title: 'Smart Pointer Decision',
      description: 'Choosing the right ownership type',
      nodes: [
        { id: 'start', label: 'Heap object\nneeded?', x: 190, y: 40, type: 'primary' },
        { id: 'unique', label: 'unique_ptr\nsole owner', x: 70, y: 140, type: 'secondary' },
        { id: 'shared', label: 'shared_ptr\nshared owners', x: 190, y: 140, type: 'secondary' },
        { id: 'weak', label: 'weak_ptr\nbreak cycles', x: 310, y: 140, type: 'secondary' },
        { id: 'raw', label: 'raw T* / T&\nnon-owning observer', x: 130, y: 240, type: 'warning' }
      ],
      edges: [
        { from: 'start', to: 'unique', label: 'one owner' },
        { from: 'start', to: 'shared', label: 'many owners' },
        { from: 'shared', to: 'weak', label: 'cycle risk' },
        { from: 'unique', to: 'raw', label: 'just borrow' }
      ]
    },
    {
      title: 'Stack vs Heap Layout',
      description: 'Where objects live in process memory',
      nodes: [
        { id: 'stack', label: 'Stack\nlocals, frames\nauto lifetime', x: 80, y: 60, type: 'primary' },
        { id: 'heap', label: 'Heap\nnew / make_unique\nmanual lifetime', x: 300, y: 60, type: 'secondary' },
        { id: 'vec', label: 'vector v\nptr,size,cap', x: 80, y: 170, type: 'primary' },
        { id: 'elems', label: 'elements\n[1,2,3,...]', x: 300, y: 170, type: 'secondary' },
        { id: 'static', label: 'Static storage\nglobals, static locals', x: 190, y: 260, type: 'warning' }
      ],
      edges: [
        { from: 'stack', to: 'vec', label: 'contains' },
        { from: 'vec', to: 'elems', label: 'points to' },
        { from: 'heap', to: 'elems', label: 'allocates' },
        { from: 'stack', to: 'static' }
      ]
    }
  ],

  flashcards: [
    { id: 'pm1', front: 'What are the key differences between a pointer and a reference?', back: 'Pointers can be null, reseated, and support arithmetic; they must be dereferenced explicitly. References are bound once at initialization, cannot be null or reseated, and act as aliases.' },
    { id: 'pm2', front: 'Why prefer nullptr over NULL?', back: 'nullptr has its own type (std::nullptr_t) and never converts ambiguously to an integer. NULL is a macro (often 0) that can select the wrong overload in f(int) vs f(int*).' },
    { id: 'pm3', front: 'Where do a std::vector\'s elements live if the vector is a local variable?', back: 'The vector object (pointer/size/capacity header) is on the stack, but the elements it manages are allocated on the heap and freed by its destructor.' },
    { id: 'pm4', front: 'Why is stack allocation faster than heap allocation?', back: 'Stack allocation is a pointer bump with no bookkeeping, and stack memory is cache-hot. Heap allocation involves allocator data structures, possible locking, and scattered addresses.' },
    { id: 'pm5', front: 'What happens if you return the address of a local variable?', back: 'The local is destroyed when the function returns, so the pointer dangles. Dereferencing it is undefined behavior. Return by value or allocate on the heap instead.' },
    { id: 'pm6', front: 'What is the difference between new and malloc?', back: 'new allocates AND runs the constructor, is type-safe, and throws std::bad_alloc on failure. malloc only allocates raw bytes, returns void*, and returns null on failure. Never mix their release functions.' },
    { id: 'pm7', front: 'What happens if you delete a new[] array with plain delete?', back: 'Undefined behavior. Array allocations must be released with delete[] so all element destructors run and the allocator bookkeeping matches.' },
    { id: 'pm8', front: 'What does RAII stand for and mean?', back: 'Resource Acquisition Is Initialization: acquire a resource in a constructor, release it in the destructor. Scope exit (including via exceptions) guarantees cleanup.' },
    { id: 'pm9', front: 'How does RAII provide exception safety?', back: 'Destructors of fully constructed locals run during stack unwinding, so resources held by RAII objects are released even when an exception propagates - no finally blocks needed.' },
    { id: 'pm10', front: 'Why is unique_ptr move-only?', back: 'It models sole ownership: copying would create two owners that both delete the object (double free). Moving transfers ownership, leaving the source null.' },
    { id: 'pm11', front: 'What is the advantage of make_shared over shared_ptr<T>(new T)?', back: 'make_shared allocates the object and control block in a single allocation: faster, cache-friendlier, and leak-safe if another argument\'s construction throws.' },
    { id: 'pm12', front: 'How does weak_ptr break shared_ptr reference cycles?', back: 'weak_ptr observes the object without incrementing the strong count. In parent/child graphs, the back-edge is weak, so counts reach zero and destructors run.' },
    { id: 'pm13', front: 'What is a use-after-free bug?', back: 'Accessing memory after its lifetime ended - a freed heap block, dead stack frame, or invalidated iterator. It is undefined behavior; AddressSanitizer detects it at runtime.' },
    { id: 'pm14', front: 'Why can push_back invalidate pointers into a vector?', back: 'If size exceeds capacity, the vector reallocates: elements move to a new heap block and the old one is freed, so every prior pointer, reference, and iterator dangles.' },
    { id: 'pm15', front: 'What is stored in a shared_ptr control block?', back: 'The strong reference count, the weak reference count, the deleter, the allocator, and (with make_shared) the object itself. Every shared_ptr copy points at the same control block; the counts are updated atomically.' },
    { id: 'pm16', front: 'What thread-safety does shared_ptr actually guarantee?', back: 'Only the reference count updates are atomic: many threads may copy or destroy their own shared_ptr instances to the same object. The pointed-to object gets no protection, and concurrently modifying one shared_ptr instance is still a data race.' },
    { id: 'pm17', front: 'What is the downside of make_shared when weak_ptrs are involved?', back: 'The object and control block share one allocation, so the memory cannot be freed until the weak count also hits zero. A large object observed by long-lived weak_ptrs keeps its storage alive after the destructor has already run.' },
    { id: 'pm18', front: 'How do custom deleters differ between unique_ptr and shared_ptr?', back: 'For unique_ptr the deleter is a template parameter: part of the type, and a stateless functor adds zero size. For shared_ptr it is type-erased into the control block at construction, so shared_ptr<T> stays the same type regardless of deleter.' },
    { id: 'pm19', front: 'What does unique_ptr<T[]> add, and when should you use it?', back: 'It calls delete[] instead of delete and exposes operator[] rather than operator->. Use it only when handed a raw new[] array by a legacy API; otherwise prefer std::vector or std::array, which also know their size.' },
    { id: 'pm20', front: 'What does weak_ptr::lock() do?', back: 'Atomically checks whether the object is still alive and, if so, returns a shared_ptr that keeps it alive while you use it; otherwise it returns an empty shared_ptr. Always lock rather than checking expired() then dereferencing, which is a race.' },
    { id: 'pm21', front: 'What does a shared_ptr cost compared to a raw pointer?', back: 'Twice the size (object pointer plus control block pointer), an extra heap allocation unless make_shared is used, and an atomic increment/decrement on every copy and destruction. Pass by const reference when the callee does not need to share ownership.' },
    { id: 'pm22', front: 'Why does struct { char c; int i; char d; } occupy 12 bytes, and how do you shrink it?', back: 'Alignment: int must sit on a 4-byte boundary, so 3 padding bytes follow c and 3 more follow d to make the struct size a multiple of 4. Reordering members largest-first (int, char, char) shrinks it to 8 bytes.' },
    { id: 'pm23', front: 'What is placement new?', back: 'new (address) T(args) constructs an object in storage you already own instead of allocating. Because no allocation happened, you must not delete it; call the destructor explicitly (p->~T()) and release the buffer yourself. It underpins std::vector and allocators.' },
    { id: 'pm24', front: 'When does binding a temporary to a const reference extend its lifetime?', back: 'const T& r = makeT(); keeps the temporary alive as long as r. It does not apply through a function boundary: a function returning const T& to a parameter it was passed, or a reference to a member of a temporary, dangles at the end of the full expression.' },
    { id: 'pm25', front: 'Memory leak vs dangling pointer - which one is undefined behavior?', back: 'A leak is memory never freed: wasteful but well-defined. A dangling pointer refers to freed or dead storage; merely holding it is fine, but reading or writing through it is undefined behavior. Leaks are annoying; dangling pointers are security bugs.' },
    { id: 'pm26', front: 'How should a function declare a smart pointer parameter?', back: 'unique_ptr<T> by value if it takes ownership (caller must std::move). shared_ptr<T> by value if it will store a copy. If it only uses the object, take T& or T* - do not force callers into a particular ownership model.' },
    { id: 'pm27', front: 'Why is std::shared_ptr<T>(this) wrong, and what is enable_shared_from_this?', back: 'It creates a second, independent control block for an object already owned by another shared_ptr, so the object is deleted twice. Inheriting enable_shared_from_this<T> lets you call shared_from_this() to obtain a shared_ptr that shares the existing control block.' },
    { id: 'pm28', front: 'What causes a stack overflow, and how big is the stack?', back: 'Deep or unbounded recursion and large local arrays exhaust the thread\'s fixed stack (typically 1 to 8 MB on the main thread, often less on worker threads). There is no bad_alloc; the process usually crashes with a segmentation fault. Move large buffers to the heap.' },
    { id: 'pm29', front: 'unique_ptr::release() vs reset()?', back: 'release() gives up ownership and returns the raw pointer without deleting - the caller is now responsible. reset(p) deletes the current object (if any) and takes ownership of p (or nothing). Confusing the two is a classic leak or double delete.' },
    { id: 'pm30', front: 'When is a raw pointer still appropriate in modern C++?', back: 'As a non-owning observer: a nullable parameter, a back-pointer to a parent, or an element in a container that does not own. The convention is that raw pointers never own; ownership is always expressed with unique_ptr, shared_ptr, or a container.' }
  ],

  quizQuestions: [
    {
      id: 'pmq1',
      question: 'Given int& r = a; int& r2 = b; what does r = r2; do?',
      options: ['Rebinds r to refer to b', 'Copies b\'s value into a', 'Creates a compile error', 'Makes r and r2 aliases of each other'],
      correctAnswer: 1,
      explanation: 'References cannot be reseated. Assignment through a reference assigns to the referent, so a receives b\'s current value.'
    },
    {
      id: 'pmq2',
      question: 'For int* p pointing into an array of ints, what does p + 1 point to?',
      options: ['The next byte', 'The next int (sizeof(int) bytes ahead)', 'Undefined - pointer arithmetic is not allowed', 'The previous element'],
      correctAnswer: 1,
      explanation: 'Pointer arithmetic is scaled by the pointee type: p + 1 advances sizeof(int) bytes. It is only defined within the same array (plus one-past-the-end).'
    },
    {
      id: 'pmq3',
      question: 'Which of these is stored entirely on the stack?',
      options: ['The elements of a local std::vector<int>', 'An object created with make_unique', 'A local int array declared as int arr[16]', 'A static local counter'],
      correctAnswer: 2,
      explanation: 'A fixed-size local array lives in the function\'s stack frame. Vector elements and make_unique objects are heap-allocated; static locals live in static storage.'
    },
    {
      id: 'pmq4',
      question: 'What does plain new T() do when allocation fails (no nothrow)?',
      options: ['Returns nullptr', 'Returns a pointer to zeroed memory', 'Calls std::terminate', 'Throws std::bad_alloc'],
      correctAnswer: 3,
      explanation: 'Standard new throws std::bad_alloc on failure. Only new (std::nothrow) T returns nullptr, so null-checking the result of plain new is dead code.'
    },
    {
      id: 'pmq5',
      question: 'A function does "T* p = new T; f(*p); delete p;" and f throws. What happens?',
      options: ['The object leaks because delete is skipped', 'delete runs during stack unwinding', 'The compiler inserts the cleanup automatically', 'std::terminate is called'],
      correctAnswer: 0,
      explanation: 'Raw pointers have no destructor, so unwinding does nothing for them - the delete statement is simply never reached. A unique_ptr would have destroyed the object during unwinding.'
    },
    {
      id: 'pmq6',
      question: 'What is the core idea of RAII?',
      options: ['Allocate all resources at program startup', 'Tie resource lifetime to object lifetime via constructors and destructors', 'Use reference counting for all allocations', 'Avoid heap allocation entirely'],
      correctAnswer: 1,
      explanation: 'RAII acquires resources in constructors and releases them in destructors, letting deterministic scope-exit destruction guarantee cleanup on every path.'
    },
    {
      id: 'pmq7',
      question: 'Why does copying a unique_ptr fail to compile?',
      options: ['unique_ptr has no copy constructor declared at all', 'Its copy operations are deleted to enforce single ownership', 'The compiler cannot copy heap pointers', 'It compiles but throws at runtime'],
      correctAnswer: 1,
      explanation: 'unique_ptr explicitly deletes its copy constructor and copy assignment. Two owners would both delete the object. Use std::move to transfer ownership.'
    },
    {
      id: 'pmq8',
      question: 'Two objects hold shared_ptrs to each other and all external references are dropped. What happens?',
      options: ['Both are destroyed when the last external owner resets', 'The runtime detects the cycle and frees both', 'Neither is destroyed - the cycle keeps both counts at 1 (a leak)', 'One is destroyed, invalidating the other'],
      correctAnswer: 2,
      explanation: 'Each object keeps the other\'s strong count above zero forever. shared_ptr has no cycle detection; the fix is making one direction a weak_ptr.'
    },
    {
      id: 'pmq9',
      question: 'Which tool catches use-after-free and heap buffer overflow at runtime?',
      options: ['AddressSanitizer (-fsanitize=address)', 'The linker', 'clang-format', 'The preprocessor'],
      correctAnswer: 0,
      explanation: 'AddressSanitizer instruments allocations and memory accesses, reporting use-after-free, out-of-bounds reads/writes, and leaks with stack traces at modest runtime cost.'
    },
    {
      id: 'pmq10',
      question: 'std::shared_ptr<T> a(new T); std::shared_ptr<T> b(a.get()); What is the result?',
      options: ['a and b share ownership with a use count of 2', 'b is a non-owning observer of a\'s object', 'Undefined behavior - two control blocks delete the same object twice', 'Compile error'],
      correctAnswer: 2,
      explanation: 'Constructing a shared_ptr from a raw pointer always creates a new control block. Each will delete T when its count hits zero. Copy a, or use make_shared, to share the same control block.'
    },
    {
      id: 'pmq11',
      question: 'On a typical 64-bit platform, what is sizeof(struct { char a; int b; char c; })?',
      options: ['6', '8', '12', '16'],
      correctAnswer: 2,
      explanation: 'b needs 4-byte alignment, so 3 padding bytes follow a; then 3 tail padding bytes after c keep the struct size a multiple of its alignment. Reordering to int, char, char gives 8.'
    },
    {
      id: 'pmq12',
      question: 'std::unique_ptr<int> p(new int[10]); What happens when p is destroyed?',
      options: ['delete[] is called correctly', 'delete is called on an array allocation - undefined behavior', 'Only the first element is freed', 'Compile error - unique_ptr rejects array pointers'],
      correctAnswer: 1,
      explanation: 'unique_ptr<int> uses std::default_delete<int>, which calls plain delete. You need unique_ptr<int[]> for delete[] - or better, std::vector<int>.'
    },
    {
      id: 'pmq13',
      question: 'A weak_ptr observes an object whose last shared_ptr has been destroyed. What does lock() return?',
      options: ['A shared_ptr to the destroyed object', 'It throws std::bad_weak_ptr', 'A shared_ptr that resurrects the object', 'An empty shared_ptr (use_count 0)'],
      correctAnswer: 3,
      explanation: 'lock() returns an empty shared_ptr when the object is gone; only the shared_ptr constructor from an expired weak_ptr throws bad_weak_ptr. Always test the result of lock().'
    },
    {
      id: 'pmq14',
      question: 'std::string makeName(); ... const std::string& s = makeName(); Is using s afterwards safe?',
      options: ['Yes - binding a temporary to a const reference extends its lifetime to that of s', 'No - the temporary dies at the end of the statement', 'Only if the string is short enough for SSO', 'Compile error - cannot bind a temporary to a reference'],
      correctAnswer: 0,
      explanation: 'Lifetime extension applies to a temporary bound directly to a local const& (or &&). It would NOT apply if makeName returned a reference to something that dies.'
    },
    {
      id: 'pmq15',
      question: 'alignas(T) char buf[sizeof(T)]; T* p = new (buf) T(); How must p be cleaned up?',
      options: ['delete p;', 'free(p);', 'Call p->~T() explicitly; the buffer is released by its own owner', 'Nothing - placement new objects are cleaned up automatically'],
      correctAnswer: 2,
      explanation: 'Placement new only constructs; no allocation occurred, so delete would free memory that was never heap-allocated. Run the destructor explicitly, then let buf go out of scope.'
    },
    {
      id: 'pmq16',
      question: 'Two threads each hold their own copy of a shared_ptr to the same Widget and both call widget->update(). Which statement is correct?',
      options: ['Safe - shared_ptr makes the object thread-safe', 'The reference counting is safe, but the concurrent update() calls are a data race unless Widget synchronizes internally', 'Undefined behavior because shared_ptr copies cannot coexist across threads', 'The second call blocks until the first finishes'],
      correctAnswer: 1,
      explanation: 'shared_ptr only makes its own control-block updates atomic. The pointee is an ordinary object; concurrent mutation needs a mutex or atomics just like any other shared data.'
    },
    {
      id: 'pmq17',
      question: 'A function only reads from a Widget and never stores it. Which parameter type is the best choice?',
      options: ['std::shared_ptr<Widget> by value', 'std::unique_ptr<Widget> by value', 'std::shared_ptr<Widget>&&', 'const Widget& (or Widget* if it may be null)'],
      correctAnswer: 3,
      explanation: 'Passing shared_ptr by value costs an atomic increment and decrement and forces callers to use shared ownership. A function that just uses an object should take a reference or observing pointer.'
    },
    {
      id: 'pmq18',
      question: 'int arr[5]; int* end = arr + 5; Which operation is defined?',
      options: ['*end', 'end[0] = 1', 'Comparing end with arr and computing end - arr', 'arr + 6'],
      correctAnswer: 2,
      explanation: 'A pointer one past the end of an array is valid for comparison and subtraction (that is how iterator ranges work) but must never be dereferenced. Forming arr + 6 is already undefined behavior.'
    },
    {
      id: 'pmq19',
      question: 'A recursive function with a missing base case is called. What is the typical outcome?',
      options: ['std::bad_alloc is thrown when memory runs out', 'The stack overflows and the process crashes (segmentation fault)', 'The compiler detects infinite recursion and refuses to compile', 'The heap grows until the OS kills the process'],
      correctAnswer: 1,
      explanation: 'Each call pushes a frame onto the fixed-size thread stack. No exception mechanism covers exhausting it; the guard page is hit and the OS terminates the process.'
    },
    {
      id: 'pmq20',
      question: 'Base has a NON-virtual destructor. std::shared_ptr<Base> p = std::make_shared<Derived>(); p.reset(); Which destructor runs?',
      options: ['Only Base::~Base - undefined behavior like raw delete', 'Neither - the object leaks', 'Base::~Base then Derived::~Derived', 'Derived::~Derived (and then Base) - shared_ptr captured a deleter for Derived at construction'],
      correctAnswer: 3,
      explanation: 'The control block stores the deleter based on the static type used at creation (Derived), so the correct destructor runs even through a Base pointer. unique_ptr<Base> would NOT do this - its deleter is based on Base.'
    }
  ]
};

// =============================================================================
// 3. OBJECT-ORIENTED C++
// =============================================================================
const oopCpp: CppCategory = {
  id: 'cpp-oop',
  name: 'Object-Oriented C++',
  slug: 'cpp-oop',
  description: 'Classes, constructors, virtual dispatch, and the rule of five',
  icon: 'cube-outline',
  color: '#8E44AD',
  colorDark: '#71368A',
  premium: true,

  learnContent: [
    {
      title: 'Classes, Constructors, and Destructors',
      content: `A C++ class bundles data and behavior with deterministic lifetime: constructors initialize, destructors clean up, and both run at precisely defined points.

**Construction Order:**
- Base classes first (in declaration order for multiple inheritance)
- Then members, in the order they are *declared* in the class, not the order in the initializer list
- Then the constructor body runs

**Member Initializer Lists:**
Prefer initializer lists over assignment in the body. For \`const\` members, references, and types without default constructors, they are required. Assignment in the body means default-construct then assign — wasted work.

**Special Constructor Forms:**
- Default constructor: \`Widget() = default;\`
- Delegating constructor: one constructor calls another via the initializer list
- \`explicit\` prevents unwanted implicit conversions from single-argument constructors
- In-class default member initializers (\`int count = 0;\`) apply when no initializer list entry overrides them

**Destructors:**
Run in reverse order of construction: body, then members, then bases. Never let exceptions escape a destructor — destructors are implicitly \`noexcept\`, and throwing during stack unwinding calls \`std::terminate\`.

**Interview Angle:**
Interviewers probe initialization order bugs (member declared after the one that uses it) and why \`explicit\` matters on single-argument constructors.`,
      codeExample: `#include <string>
#include <utility>

class Connection {
public:
    // explicit prevents: Connection c = "host"; (implicit conversion)
    explicit Connection(std::string host, int port = 443)
        : host_(std::move(host)),   // initializer list: direct init
          port_(port) {}            // order follows DECLARATION order

    // Delegating constructor (C++11)
    Connection() : Connection("localhost") {}

    ~Connection() {
        // Clean up in destructor; never throw from here
        close();
    }

    void close() noexcept { /* release socket */ }

private:
    // Members initialize in THIS order, regardless of the
    // order written in any initializer list.
    std::string host_;
    int port_ = 443;          // in-class default initializer
    bool open_ = false;
};

// Classic initialization-order bug:
class Buggy {
    int size_;                // declared first -> initialized first
    int capacity_;
public:
    // capacity_ is listed first, but size_ initializes first,
    // reading capacity_ before it exists. Compilers warn (-Wreorder).
    Buggy(int cap) : capacity_(cap), size_(capacity_ / 2) {}
};

int main() {
    Connection c{"api.example.com", 8443};
    // Connection bad = "host";   // error: constructor is explicit
    Connection ok{"host"};         // fine: direct initialization
}   // ~Connection runs here, deterministically`
    },
    {
      title: 'Copy and Move Semantics (Rule of 3/5/0)',
      content: `If a class manages a resource, the compiler-generated copy operations are usually wrong — they copy the handle, not the resource. The rules of 3, 5, and 0 tell you which special members to define.

**Rule of Three (C++98):**
If you need any one of destructor, copy constructor, or copy assignment, you almost certainly need all three.

**Rule of Five (C++11):**
Add the move constructor and move assignment operator. Declaring any copy operation or destructor *suppresses* implicit move generation — a class with a user-declared destructor silently copies where it could move.

**Rule of Zero:**
The best rule: manage resources with RAII members (\`std::unique_ptr\`, \`std::vector\`, \`std::string\`) and declare *no* special members. The compiler-generated ones are then correct.

**Move Semantics:**
- A move transfers ownership and leaves the source in a valid but unspecified state
- \`std::move\` is just a cast to rvalue reference — it moves nothing itself
- Mark moves \`noexcept\`: \`std::vector\` only moves elements during reallocation if the move constructor is \`noexcept\`, otherwise it copies

**Copy-and-Swap:**
An assignment idiom that gets strong exception safety and de-duplicates copy/move assignment by taking the parameter by value.

**Interview Angle:**
"Why did my vector copy instead of move?" (missing \`noexcept\`) and "what state is a moved-from object in?" are senior-level staples.`,
      codeExample: `#include <algorithm>
#include <cstddef>
#include <utility>

// Rule of Five: manually managed buffer
class Buffer {
public:
    explicit Buffer(std::size_t n)
        : size_(n), data_(new char[n]) {}

    ~Buffer() { delete[] data_; }

    // Copy constructor: deep copy
    Buffer(const Buffer& other)
        : size_(other.size_), data_(new char[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // Move constructor: steal, then null the source. noexcept is
    // critical -- std::vector<Buffer> won't move on realloc without it.
    Buffer(Buffer&& other) noexcept
        : size_(other.size_), data_(other.data_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    // Copy-and-swap handles copy AND move assignment,
    // self-assignment, and gives the strong guarantee.
    Buffer& operator=(Buffer other) noexcept {  // by value!
        swap(*this, other);
        return *this;
    }

    friend void swap(Buffer& a, Buffer& b) noexcept {
        std::swap(a.size_, b.size_);
        std::swap(a.data_, b.data_);
    }

private:
    std::size_t size_;
    char* data_;
};

// Rule of Zero: let RAII members do everything
#include <memory>
#include <string>
class Document {
    std::string title_;
    std::unique_ptr<Buffer> body_;   // move-only member
    // No destructor, no copy/move declarations needed.
    // Document is automatically move-only (unique_ptr blocks copies).
};

int main() {
    Buffer a(1024);
    Buffer b = std::move(a);   // move ctor: a is now empty but valid
    a = Buffer(64);            // fine: assigning to moved-from object
}`
    },
    {
      title: 'Inheritance and Virtual Functions (vtables, override/final)',
      content: `Virtual functions give runtime polymorphism: the call resolves by the *dynamic* type of the object, implemented (in every mainstream ABI) via vtables.

**How Virtual Dispatch Works:**
- Each polymorphic class gets one vtable: a static array of function pointers
- Each object carries a hidden vptr pointing to its class's vtable
- A virtual call loads the vptr, indexes the vtable, and calls through the pointer — roughly one extra indirection, and it usually blocks inlining

**override and final (C++11):**
- \`override\` makes the compiler verify you are actually overriding a base virtual — catches signature typos and missing \`const\`
- \`final\` on a function stops further overriding; on a class it stops derivation, which can let the compiler devirtualize calls

**Rules Worth Knowing:**
- Overriding requires the same signature; a different parameter list *hides* the base overload instead
- Default arguments are bound statically (by the pointer/reference type), not virtually
- Covariant return types are allowed: an override may return \`Derived*\` where the base returns \`Base*\`
- Name hiding: any \`f\` in a derived class hides *all* base \`f\` overloads; fix with \`using Base::f;\`

**Cost Model for Interviews:**
Virtual calls cost an indirect call plus lost inlining — usually negligible, but relevant in hot loops. The vptr adds one pointer to object size.`,
      codeExample: `#include <iostream>
#include <memory>

class Shape {
public:
    virtual ~Shape() = default;          // virtual dtor: mandatory
    virtual double area() const = 0;
    virtual const char* name() const { return "shape"; }
    void describe() const {              // non-virtual: static dispatch
        std::cout << name() << " area=" << area() << '\\n';
    }
};

class Circle : public Shape {
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return 3.14159265 * r_ * r_; }
    const char* name() const override { return "circle"; }
private:
    double r_;
};

class Sprite final : public Circle {     // no further derivation
public:
    using Circle::Circle;                // inherit constructors
    // area() const final would also stop overrides of area()
private:
    // double area() override;  // error without const: override
                                 // catches the signature mismatch
};

// Default arguments bind STATICALLY:
struct Base {
    virtual void log(int level = 1) { std::cout << "Base " << level; }
    virtual ~Base() = default;
};
struct Derived : Base {
    void log(int level = 2) override { std::cout << "Derived " << level; }
};

int main() {
    std::unique_ptr<Shape> s = std::make_unique<Circle>(2.0);
    s->describe();               // vptr -> Circle vtable -> Circle::area

    Base* b = new Derived;
    b->log();                    // prints "Derived 1": Derived body,
                                 // but Base's default argument!
    delete b;                    // safe: Base has a virtual destructor
}`
    },
    {
      title: 'Abstract Classes and Interfaces',
      content: `C++ has no \`interface\` keyword; an interface is a class of pure virtual functions. An abstract class has at least one pure virtual and cannot be instantiated.

**Pure Virtual Functions:**
- Declared with \`= 0\`: \`virtual void draw() = 0;\`
- A class with any pure virtual is abstract — you can hold pointers and references to it, but never create one directly
- A pure virtual *may* still have a definition (out of line), which derived classes can call explicitly — occasionally used for a pure virtual destructor or shared default logic

**Interface Conventions:**
- All pure virtuals, no data members
- A \`virtual ~Interface() = default;\` so deleting through the interface pointer is safe
- Non-copyable or with protected copy operations to prevent slicing through the interface

**NVI (Non-Virtual Interface) Idiom:**
Make the public method non-virtual and have it call a private virtual. The base controls pre/post-conditions (locking, logging, validation); derived classes customize only the core step. This is the C++ version of the Template Method pattern.

**Abstract Base vs Concrete Base:**
Prefer abstract bases for polymorphic hierarchies. Concrete base classes invite slicing and make it unclear whether the base is meant to be instantiated.

**Interview Angle:**
Expect "how do you define an interface in C++?", "can a pure virtual function have a body?", and "why is the destructor virtual and default?"`,
      codeExample: `#include <iostream>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

// Interface: all pure virtual, virtual destructor, no state
class Serializer {
public:
    virtual ~Serializer() = default;
    virtual std::string serialize() const = 0;
};

// NVI idiom: public non-virtual wraps private virtual
class Logger {
public:
    virtual ~Logger() = default;

    void log(const std::string& msg) {      // public, NON-virtual
        std::lock_guard<std::mutex> lock(m_); // invariant enforced once
        writeLine("[log] " + msg);            // customization point
    }

private:
    virtual void writeLine(const std::string& line) = 0;
    std::mutex m_;
};

class ConsoleLogger : public Logger {
private:
    void writeLine(const std::string& line) override {
        std::cout << line << '\\n';
    }
};

// Pure virtual WITH a definition: derived classes may reuse it
class Task {
public:
    virtual ~Task() = default;
    virtual void run() = 0;
};
void Task::run() { std::cout << "default bookkeeping\\n"; }

class BuildTask : public Task {
public:
    void run() override {
        Task::run();                 // explicit call to the pure body
        std::cout << "building...\\n";
    }
};

int main() {
    std::vector<std::unique_ptr<Logger>> logs;
    logs.push_back(std::make_unique<ConsoleLogger>());
    logs[0]->log("hello");           // locked in base, printed in derived

    BuildTask t;
    t.run();
    // Task t2;                      // error: Task is abstract
}`
    },
    {
      title: 'Operator Overloading',
      content: `Operator overloading lets user-defined types behave like built-ins. The rule: overload only when the meaning is obvious, and keep semantics consistent with the built-in operator.

**Member vs Non-Member:**
- Must be members: \`=\`, \`[]\`, \`()\`, \`->\`
- Prefer non-member (often \`friend\`) for symmetric binary operators like \`+\` and \`==\`, so conversions apply to *both* operands (\`2 + money\` works, not just \`money + 2\`)

**Canonical Patterns:**
- Define \`+=\` as a member; implement \`+\` as a non-member in terms of \`+=\`
- \`operator<<\` for streams is a non-member taking \`std::ostream&\` and returning it, enabling chaining
- Prefix \`++\` returns a reference; postfix \`++\` takes a dummy \`int\` parameter and returns the old value by copy

**Comparisons in C++20:**
\`operator<=>\` (spaceship) plus \`= default\` generates all six comparisons from member-wise comparison. Defaulted \`operator==\` alone gives you \`==\` and \`!=\`.

**What Not to Overload:**
\`&&\`, \`||\`, and \`,\` lose short-circuit/sequencing behavior when overloaded — avoid. Never make \`+\` mutate, and never make \`==\` inconsistent with \`<\`.

**Interview Angle:**
Common questions: why non-member \`+\`? Why does \`operator<<\` return \`ostream&\`? How does postfix \`++\` differ in signature and cost?`,
      codeExample: `#include <compare>
#include <iostream>

class Money {
public:
    constexpr Money(long long cents = 0) : cents_(cents) {}

    // Compound assignment as member: mutates *this, returns ref
    Money& operator+=(Money rhs) {
        cents_ += rhs.cents_;
        return *this;
    }

    // Prefix ++ : increment, return reference (cheap)
    Money& operator++() { ++cents_; return *this; }

    // Postfix ++ : dummy int param, return OLD value by copy
    Money operator++(int) {
        Money old = *this;
        ++(*this);
        return old;
    }

    // C++20: one defaulted spaceship gives <, <=, >, >=, ==, !=
    auto operator<=>(const Money&) const = default;

    long long cents() const { return cents_; }

private:
    long long cents_;
};

// Binary + as NON-member, built on +=. Takes lhs by value:
// the copy becomes the result. Symmetric: 5 + m converts 5 -> Money.
Money operator+(Money lhs, Money rhs) {
    lhs += rhs;
    return lhs;
}

// Stream insertion: non-member, returns the stream for chaining
std::ostream& operator<<(std::ostream& os, Money m) {
    return os << '$' << m.cents() / 100 << '.'
              << (m.cents() % 100 < 10 ? "0" : "") << m.cents() % 100;
}

int main() {
    Money price{1999};
    Money total = price + 1;      // non-member: converts 1 -> Money
    Money also  = 1 + price;      // works ONLY because + is non-member
    std::cout << total << ' ' << also << '\\n';
    std::cout << (price < total) << '\\n';  // from operator<=>
}`
    },
    {
      title: 'Polymorphism Pitfalls',
      content: `Three classic C++ traps break polymorphism silently: object slicing, missing virtual destructors, and virtual calls during construction.

**Object Slicing:**
Assigning or passing a derived object *by value* as a base copies only the base subobject — the derived data and behavior are sliced off. The copy's vptr points to the base vtable, so virtual calls dispatch to the base. Fix: pass polymorphic types by reference, pointer, or smart pointer, never by value.

**Missing Virtual Destructor:**
\`delete base_ptr\` where the dynamic type is derived is *undefined behavior* unless the base destructor is virtual — the derived destructor never runs and derived members leak. Guideline: a base class needs either a public virtual destructor, or a protected non-virtual destructor (when deletion through the base is not supported).

**Virtuals in Constructors/Destructors:**
During a base constructor or destructor, the object's dynamic type *is the base* — the vptr points at the base vtable. A virtual call resolves to the base version; a pure virtual called this way is UB (typically "pure virtual call" abort). Fix: two-phase init, or pass the varying behavior as a parameter.

**Related Traps:**
- \`std::vector<Base>\` slices every derived element you insert — store \`std::vector<std::unique_ptr<Base>>\`
- Arrays of derived accessed through \`Base*\` break pointer arithmetic (wrong element stride)
- \`catch (Base b)\` by value slices exceptions — always \`catch (const Base& e)\`

**Interview Angle:**
"What prints and why?" slicing puzzles and "what happens if the destructor isn't virtual?" are among the most common senior C++ screens.`,
      codeExample: `#include <iostream>
#include <memory>
#include <vector>

struct Animal {
    virtual ~Animal() = default;         // FIX 2: virtual destructor
    virtual const char* speak() const { return "..."; }
};

struct Dog : Animal {
    std::string name = "Rex";
    const char* speak() const override { return "woof"; }
};

// PITFALL 1: slicing -- parameter taken by VALUE
void byValue(Animal a)        { std::cout << a.speak() << '\\n'; }
void byRef(const Animal& a)   { std::cout << a.speak() << '\\n'; }

// PITFALL 3: virtual call in a constructor
struct Base {
    Base() {
        // Dynamic type here is Base: calls Base::init, never Derived::init
        std::cout << init() << '\\n';
    }
    virtual ~Base() = default;
    virtual const char* init() { return "Base::init"; }
};
struct Derived : Base {
    const char* init() override { return "Derived::init"; }
};

int main() {
    Dog d;
    byValue(d);   // prints "..."  -- sliced to Animal
    byRef(d);     // prints "woof" -- reference preserves dynamic type

    Animal a = d; // slicing on assignment too: a is a plain Animal
    std::cout << a.speak() << '\\n';         // "..."

    Derived obj;  // prints "Base::init" during construction

    // Correct polymorphic container: pointers, not values
    std::vector<std::unique_ptr<Animal>> zoo;
    zoo.push_back(std::make_unique<Dog>());
    std::cout << zoo[0]->speak() << '\\n';   // "woof"

    // Without a virtual ~Animal, this line would be UB
    std::unique_ptr<Animal> p = std::make_unique<Dog>();
}   // ~Dog then ~Animal run correctly: destructor is virtual`
    }
  ],

  visualizations: [
    {
      title: 'Virtual Dispatch Flow',
      description: 'How a virtual call resolves through the vptr and vtable',
      nodes: [
        { id: 'call', label: 'shape->area()', x: 60, y: 60, type: 'primary' },
        { id: 'vptr', label: 'object vptr\n(hidden member)', x: 190, y: 60, type: 'secondary' },
        { id: 'vtable', label: 'Circle vtable\n[~dtor, area, name]', x: 320, y: 60, type: 'secondary' },
        { id: 'impl', label: 'Circle::area()\nexecutes', x: 320, y: 180, type: 'primary' },
        { id: 'cost', label: 'cost: indirection\n+ no inlining', x: 130, y: 180, type: 'warning' }
      ],
      edges: [
        { from: 'call', to: 'vptr', label: 'load' },
        { from: 'vptr', to: 'vtable', label: 'points to' },
        { from: 'vtable', to: 'impl', label: 'index + call' },
        { from: 'call', to: 'cost' }
      ]
    },
    {
      title: 'Rule of Five',
      description: 'Special member functions a resource-owning class must consider',
      nodes: [
        { id: 'dtor', label: '~T()\ndestructor', x: 190, y: 40, type: 'primary' },
        { id: 'cctor', label: 'T(const T&)\ncopy ctor', x: 70, y: 130, type: 'secondary' },
        { id: 'cassign', label: 'operator=(const T&)\ncopy assign', x: 190, y: 130, type: 'secondary' },
        { id: 'mctor', label: 'T(T&&) noexcept\nmove ctor', x: 310, y: 130, type: 'secondary' },
        { id: 'zero', label: 'Rule of Zero:\nRAII members,\ndeclare none', x: 190, y: 230, type: 'warning' }
      ],
      edges: [
        { from: 'dtor', to: 'cctor', label: 'need one?' },
        { from: 'dtor', to: 'cassign', label: 'need all' },
        { from: 'dtor', to: 'mctor', label: '+ move assign' },
        { from: 'cassign', to: 'zero', label: 'or avoid' }
      ]
    }
  ],

  flashcards: [
    { id: 'oo1', front: 'In what order are class members initialized?', back: 'In declaration order in the class, NOT the order written in the member initializer list. Bases initialize before members; the constructor body runs last.' },
    { id: 'oo2', front: 'What does explicit do on a constructor?', back: 'Prevents implicit conversions: Widget w = 5; fails, Widget w{5}; works. Use on single-argument constructors to avoid surprise conversions.' },
    { id: 'oo3', front: 'What is the Rule of Five?', back: 'If you define any of destructor, copy ctor, copy assignment, move ctor, or move assignment, you should consider defining all five — the class likely manages a resource.' },
    { id: 'oo4', front: 'What is the Rule of Zero?', back: 'Manage resources through RAII members (unique_ptr, vector, string) and declare no special member functions — the compiler-generated ones are then correct.' },
    { id: 'oo5', front: 'What does std::move actually do?', back: 'Nothing at runtime — it is a cast to an rvalue reference (static_cast<T&&>). It only enables a move; the move constructor/assignment does the actual transfer.' },
    { id: 'oo6', front: 'Why should move constructors be noexcept?', back: 'std::vector only moves elements during reallocation if the move ctor is noexcept (via move_if_noexcept); otherwise it copies to preserve the strong exception guarantee.' },
    { id: 'oo7', front: 'What state is a moved-from object in?', back: 'Valid but unspecified. You may destroy it, assign to it, or call methods with no preconditions — but not rely on its value.' },
    { id: 'oo8', front: 'How is virtual dispatch implemented?', back: 'Each polymorphic class has a vtable (array of function pointers); each object holds a hidden vptr to its class vtable. A virtual call loads the vptr, indexes the vtable, and calls indirectly.' },
    { id: 'oo9', front: 'What does the override specifier do?', back: 'Asks the compiler to verify the function actually overrides a base virtual. Catches signature mismatches (missing const, wrong parameter types) that would otherwise silently create a new function.' },
    { id: 'oo10', front: 'When must a base class destructor be virtual?', back: 'Whenever objects are deleted through a base pointer. Otherwise deleting a derived object via Base* is undefined behavior. Alternative: protected non-virtual destructor.' },
    { id: 'oo11', front: 'What is object slicing?', back: 'Copying a derived object into a base object (by value) keeps only the base subobject — derived data and overrides are lost, and virtual calls dispatch to the base versions.' },
    { id: 'oo12', front: 'What happens when a constructor calls a virtual function?', back: 'It dispatches to the base version — during Base construction the dynamic type IS Base. Calling a pure virtual this way is undefined behavior.' },
    { id: 'oo13', front: 'Which operators must be member functions?', back: 'operator=, operator[], operator(), and operator->. Symmetric binary operators like + and == are usually better as non-members so conversions apply to both operands.' },
    { id: 'oo14', front: 'What does a defaulted operator<=> give you in C++20?', back: 'All six comparison operators (<, <=, >, >=, ==, !=) generated from member-wise lexicographic comparison in declaration order.' },
    { id: 'oo15', front: 'What is the copy-and-swap idiom?', back: 'Write operator=(Widget other) taking the argument by value, swap *this with the copy, and let the destructor clean up the old state. One function handles copy and move assignment, is self-assignment safe, and gives the strong exception guarantee.' },
    { id: 'oo16', front: 'What makes a class abstract, and can a pure virtual function have a body?', back: 'At least one pure virtual function (= 0) makes the class non-instantiable. A pure virtual function may still have an out-of-line definition, which derived classes can call explicitly — a pure virtual destructor always needs one.' },
    { id: 'oo17', front: 'What is the diamond problem and how does virtual inheritance solve it?', back: 'When B and C both derive from A and D derives from both, D contains two A subobjects, making A\'s members ambiguous. Declaring B and C with virtual inheritance (class B : virtual public A) makes them share a single A.' },
    { id: 'oo18', front: 'Who initializes a virtual base class?', back: 'The most-derived class, always — its constructor calls the virtual base constructor directly, and the initializer for that base written in intermediate classes is ignored. That is why virtual bases usually need a default constructor.' },
    { id: 'oo19', front: 'What does final do on a function or a class?', back: 'On a virtual function it forbids further overriding; on a class it forbids derivation. Beyond expressing intent, it lets the compiler devirtualize calls when the type is known to be final.' },
    { id: 'oo20', front: 'How does dynamic_cast behave on pointers vs references?', back: 'It requires a polymorphic source type (at least one virtual function) and uses RTTI at runtime. A failed pointer cast returns nullptr; a failed reference cast throws std::bad_cast. It is also the only cast that can cross-cast between siblings.' },
    { id: 'oo21', front: 'What is the Non-Virtual Interface (NVI) idiom?', back: 'Public non-virtual functions that call private (or protected) virtual hooks. The base class controls pre/post conditions, logging, and locking around the customization point, while derived classes only supply the varying step.' },
    { id: 'oo22', front: 'Why must a hand-written copy assignment operator worry about self-assignment?', back: 'x = x; with a naive "delete old buffer, copy from other" frees the buffer it is about to copy from. Check this != &other, or use copy-and-swap, which copies before it releases anything.' },
    { id: 'oo23', front: 'What are delegating constructors?', back: 'C++11 lets one constructor call another in its initializer list: Widget() : Widget(0, "default") {}. Common initialization logic lives in one place. The target constructor runs completely before the delegating body.' },
    { id: 'oo24', front: 'What does using Base::Base; do in a derived class?', back: 'Inherits all of the base class constructors, so Derived can be constructed with Base\'s argument lists without rewriting forwarding constructors. Derived members are default-initialized (or use default member initializers).' },
    { id: 'oo25', front: 'What is the difference between = default and = delete?', back: '= default asks for the compiler-generated version of a special member explicitly (and can restore a suppressed one). = delete declares the function but makes any use a compile error — used to forbid copying or to reject specific overloads like f(double) = delete.' },
    { id: 'oo26', front: 'What does a virtual function cost at runtime?', back: 'One vptr per object, one vtable per class, and an indirect call through the vptr that cannot be inlined unless devirtualized. The real cost is usually the lost inlining and branch prediction, not the extra load.' },
    { id: 'oo27', front: 'Can a constructor be virtual? How do you copy a polymorphic object?', back: 'No — a constructor creates the object whose dynamic type is not yet known. Use the virtual clone idiom: virtual std::unique_ptr<Base> clone() const, overridden in each derived class to return a copy of itself.' },
    { id: 'oo28', front: 'Why are default arguments on virtual functions a trap?', back: 'Default arguments are bound statically by the static type of the pointer or reference, while the function is dispatched dynamically. Calling through Base* uses Base\'s defaults even when Derived\'s override runs.' },
    { id: 'oo29', front: 'What is private inheritance and when would you use it?', back: 'class D : private B makes all inherited members private and blocks the implicit D-to-B conversion outside D: "implemented in terms of", not "is-a". Prefer composition; use private inheritance mainly when you need to override a virtual or exploit the empty base optimization.' },
    { id: 'oo30', front: 'What is a covariant return type?', back: 'An override may return a pointer or reference to a MORE derived class than the base version: Base* clone() in Base, Derived* clone() in Derived. Callers with a Derived know statically that they get a Derived back.' }
  ],

  quizQuestions: [
    {
      id: 'ooq1',
      question: 'Class members are initialized in which order?',
      options: [
        'The order written in the member initializer list',
        'Alphabetical order',
        'The order they are declared in the class',
        'Reverse declaration order'
      ],
      correctAnswer: 2,
      explanation: 'Members always initialize in declaration order, regardless of initializer-list order. Compilers warn (-Wreorder) when the list order differs.'
    },
    {
      id: 'ooq2',
      question: 'A class declares only a destructor. Which special members does the compiler still implicitly generate?',
      options: [
        'Copy constructor and copy assignment (moves are suppressed)',
        'Move constructor and move assignment only',
        'All four copy/move operations',
        'None — declaring any special member suppresses all others'
      ],
      correctAnswer: 0,
      explanation: 'A user-declared destructor suppresses implicit move operations but copy operations are still generated (though deprecated). Such a class copies where it could move.'
    },
    {
      id: 'ooq3',
      question: 'Why should a move constructor be marked noexcept?',
      options: [
        'It is required by the standard for all move constructors',
        'std::vector will copy instead of move elements during reallocation otherwise',
        'It makes the move constructor run faster',
        'It prevents the object from being copied'
      ],
      correctAnswer: 1,
      explanation: 'vector uses move_if_noexcept during reallocation: without noexcept it falls back to copying to preserve the strong exception guarantee.'
    },
    {
      id: 'ooq4',
      question: 'Base* b = new Derived; delete b; — the Base destructor is non-virtual. What happens?',
      options: [
        'Only the Base destructor runs, a guaranteed leak',
        'Both destructors run in reverse order',
        'Undefined behavior',
        'A compile error'
      ],
      correctAnswer: 2,
      explanation: 'Deleting a derived object through a base pointer with a non-virtual destructor is undefined behavior — in practice often just the base dtor runs, but the standard makes no guarantee.'
    },
    {
      id: 'ooq5',
      question: 'void f(Animal a); is called with a Dog. Dog overrides speak(). What does a.speak() call inside f?',
      options: [
        'Dog::speak — virtual dispatch always applies',
        'Animal::speak — the Dog was sliced to an Animal',
        'It is undefined behavior',
        'It does not compile'
      ],
      correctAnswer: 1,
      explanation: 'Pass-by-value copies only the Animal subobject (slicing). The parameter is a genuine Animal whose vptr points to the Animal vtable.'
    },
    {
      id: 'ooq6',
      question: 'During a base class constructor, a virtual function is called. Which version runs?',
      options: [
        'The most-derived override',
        'It is always undefined behavior',
        'A randomly chosen override',
        'The base class version'
      ],
      correctAnswer: 3,
      explanation: 'While the base constructor runs, the dynamic type is the base class — the vptr points at the base vtable. (Calling a PURE virtual here is UB.)'
    },
    {
      id: 'ooq7',
      question: 'Why is operator+ usually a non-member function?',
      options: [
        'Member operators cannot return by value',
        'So implicit conversions apply to both operands, e.g. 2 + money',
        'Non-member operators are faster',
        'The standard forbids operator+ as a member'
      ],
      correctAnswer: 1,
      explanation: 'A member operator+ only converts the right operand; a non-member allows conversion of the left operand too, keeping the operator symmetric.'
    },
    {
      id: 'ooq8',
      question: 'What distinguishes the postfix operator++ overload from the prefix one?',
      options: [
        'Postfix takes a dummy int parameter and returns the old value by copy',
        'Postfix returns a reference to the incremented object',
        'Prefix takes a dummy int parameter',
        'They have identical signatures; the compiler picks by context'
      ],
      correctAnswer: 0,
      explanation: 'Postfix is declared operator++(int); the unused int only differentiates the overload. It must save and return the previous value, making it costlier than prefix.'
    },
    {
      id: 'ooq9',
      question: 'A derived class defines void f(double), the base has virtual void f(int). What happens on derived.f(1)?',
      options: [
        'Base::f(int) is called via virtual dispatch',
        'A compile error: ambiguous call',
        'Derived::f(double) is called — the base overload is hidden',
        'Both functions are called'
      ],
      correctAnswer: 2,
      explanation: 'Name hiding: any f in the derived class hides ALL base overloads of f. The int converts to double. Fix with using Base::f; in the derived class.'
    },
    {
      id: 'ooq10',
      question: 'struct A { int id; }; struct B : A {}; struct C : A {}; struct D : B, C {}; D d; d.id = 1; What happens?',
      options: [
        'Compiles; both A subobjects get id = 1',
        'Compile error: ambiguous member id, because D contains two A subobjects',
        'Compiles; only B\'s A subobject is updated',
        'Undefined behavior'
      ],
      correctAnswer: 1,
      explanation: 'Without virtual inheritance, D has an A via B and another via C. Either qualify (d.B::id) or declare B and C with virtual public A so they share one A.'
    },
    {
      id: 'ooq11',
      question: 'struct Base { int x; }; struct Derived : Base {}; Base* b = new Derived; auto* d = dynamic_cast<Derived*>(b); What happens?',
      options: [
        'd points to the Derived object',
        'd is nullptr',
        'Undefined behavior at runtime',
        'Compile error: dynamic_cast requires a polymorphic (virtual) source type'
      ],
      correctAnswer: 3,
      explanation: 'dynamic_cast relies on RTTI stored via the vtable. Base has no virtual functions, so the cast is ill-formed. Give Base a virtual destructor, or use static_cast if you already know the type.'
    },
    {
      id: 'ooq12',
      question: 'struct Base { virtual void f(int x = 1); }; struct Derived : Base { void f(int x = 2) override; }; Base* p = new Derived; p->f(); What runs and with what x?',
      options: [
        'Derived::f with x = 1',
        'Derived::f with x = 2',
        'Base::f with x = 1',
        'Compile error: overrides must repeat the same default'
      ],
      correctAnswer: 0,
      explanation: 'Dispatch is dynamic (Derived::f) but default arguments are resolved statically from the pointer type (Base), so x = 1. Never redefine defaults on overrides.'
    },
    {
      id: 'ooq13',
      question: 'class Shape { virtual void draw(); }; class Circle final : public Shape {}; class SpecialCircle : public Circle {}; What happens?',
      options: [
        'Compiles; final only affects virtual functions',
        'Compiles with a warning',
        'Compile error: cannot derive from a final class',
        'Compiles, but SpecialCircle cannot override draw'
      ],
      correctAnswer: 2,
      explanation: 'final on a class forbids any further derivation. On a virtual function it forbids overriding that function only.'
    },
    {
      id: 'ooq14',
      question: 'What is the ONLY difference between struct and class in C++?',
      options: [
        'struct cannot have member functions or constructors',
        'Default member access and default inheritance are public for struct, private for class',
        'struct is a plain C type with no vtable support',
        'class supports templates, struct does not'
      ],
      correctAnswer: 1,
      explanation: 'Both define classes with identical capabilities. The convention is struct for passive data aggregates and class for types with invariants, but the language difference is just the defaults.'
    },
    {
      id: 'ooq15',
      question: 'struct Base { virtual ~Base() = 0; }; struct Derived : Base {}; Derived d; What is needed for this to link?',
      options: [
        'Nothing - pure virtual functions never need a body',
        'Derived must declare its own destructor',
        'Base::~Base() must still be defined out of line, because Derived\'s destructor calls it',
        'Base must not be abstract to be used as a base'
      ],
      correctAnswer: 2,
      explanation: 'A derived destructor always invokes the base destructor non-virtually. A pure virtual destructor makes the class abstract but still needs a definition (Base::~Base() {}), or you get an undefined reference.'
    },
    {
      id: 'ooq16',
      question: 'A class declares only a move constructor: Widget(Widget&&). What happens to its other special members?',
      options: [
        'Copy operations are still generated implicitly',
        'The move assignment operator is generated implicitly',
        'All four copy/move operations remain available',
        'Copy constructor and copy assignment are implicitly deleted; move assignment is not declared'
      ],
      correctAnswer: 3,
      explanation: 'Declaring a move operation deletes the implicit copy operations (a class that moves specially probably should not be copied). Move assignment is simply not generated - add = default if you want it.'
    },
    {
      id: 'ooq17',
      question: 'Widget& Widget::operator=(Widget other) { swap(*this, other); return *this; } What does this implementation provide?',
      options: [
        'Strong exception safety, self-assignment safety, and one body for both copy and move assignment',
        'Faster assignment than a hand-written one in all cases',
        'Assignment that skips the copy when the sizes match',
        'A compile error - operator= must take a reference'
      ],
      correctAnswer: 0,
      explanation: 'The by-value parameter performs the copy (or move) before any state is touched; if it throws, *this is unchanged. Swapping then lets other\'s destructor release the old resources.'
    },
    {
      id: 'ooq18',
      question: 'struct A { A(int); }; struct B : virtual A { B() : A(1) {} }; struct C : virtual A { C() : A(2) {} }; struct D : B, C { D() : A(3) {} }; With what argument is A constructed for a D?',
      options: [
        '1, from B',
        '2, from C',
        '3 - the most-derived class initializes the virtual base',
        'Compile error: ambiguous initialization of A'
      ],
      correctAnswer: 2,
      explanation: 'A virtual base is constructed once, by the most-derived class, before any non-virtual bases. The A(1) and A(2) initializers in B and C are ignored when constructing a D.'
    },
    {
      id: 'ooq19',
      question: 'struct Base { virtual Base* clone() const; }; struct Derived : Base { Derived* clone() const override; }; Is this a valid override?',
      options: [
        'No - override requires an identical return type',
        'Yes - covariant return types allow a more-derived pointer or reference',
        'Only if Derived* is explicitly cast to Base*',
        'Yes, but the call through Base* will return nullptr'
      ],
      correctAnswer: 1,
      explanation: 'Return type covariance is allowed for pointers and references to classes. Through Base* you get Base*; through Derived you get Derived* - no cast needed.'
    },
    {
      id: 'ooq20',
      question: 'class Stack : private std::vector<int> { ... }; Stack s; std::vector<int>* p = &s; What is the result?',
      options: [
        'Compiles; p can now call push_back on the stack',
        'Compiles, but p is nullptr',
        'Undefined behavior',
        'Compile error: the base-class conversion is inaccessible outside Stack'
      ],
      correctAnswer: 3,
      explanation: 'Private inheritance hides the is-a relationship from the outside world: only Stack\'s own members and friends can convert to the base. That is what makes it "implemented in terms of" rather than "is-a".'
    }
  ]
};

// =============================================================================
// 4. TEMPLATES & GENERICS
// =============================================================================
const templatesGenerics: CppCategory = {
  id: 'cpp-templates',
  name: 'Templates & Generics',
  slug: 'cpp-templates',
  description: 'Function and class templates, specialization, concepts, and CRTP',
  icon: 'construct-outline',
  color: '#F39C12',
  colorDark: '#C87F0A',
  premium: true,

  learnContent: [
    {
      title: 'Function Templates and Deduction',
      content: `Function templates generate a family of functions; the compiler deduces template arguments from the call arguments, then instantiates concrete code at compile time.

**Deduction Basics:**
- \`template <typename T> void f(T x)\` — \`T\` deduced by value: references and top-level const/volatile are stripped
- \`f(T& x)\` — deduces the referenced type; const is preserved
- \`f(T&& x)\` — a *forwarding reference*: lvalues deduce \`T\` as \`T&\` (reference collapsing makes the parameter an lvalue ref), rvalues deduce plain \`T\`

**Reference Collapsing:**
\`& &\`, \`& &&\`, \`&& &\` all collapse to \`&\`; only \`&& &&\` yields \`&&\`. This is the machinery behind \`std::forward\` and perfect forwarding.

**Perfect Forwarding:**
\`std::forward<T>(arg)\` restores the original value category inside the template so wrappers pass arguments through without extra copies or lost rvalueness.

**Overload Resolution:**
A non-template function that matches exactly beats a template. Among templates, the more specialized wins (partial ordering). Deduction failures simply remove a candidate (SFINAE) rather than erroring.

**Key Details Interviewers Probe:**
- \`T&&\` in a template parameter is a forwarding reference; \`Widget&&\` is a plain rvalue reference — the difference is whether deduction occurs
- \`auto\` follows template deduction rules (with the famous exception that \`auto x = {1,2}\` deduces \`initializer_list\`)
- Explicit arguments (\`f<int>(x)\`) turn deduction off for that parameter`,
      codeExample: `#include <string>
#include <utility>
#include <vector>

// By-value: strips refs and top-level const
template <typename T>
void byValue(T x);
// const int& ci -> T = int

// By-reference: preserves const
template <typename T>
void byRef(T& x);
// const int ci -> T = const int, param = const int&

// Forwarding reference: T&& where T is deduced
template <typename T>
void byFwd(T&& x);
// lvalue int  -> T = int&,  param int& && -> int&   (collapse)
// rvalue int  -> T = int,   param int&&

// Perfect forwarding: preserve value category through a wrapper
template <typename T, typename... Args>
std::unique_ptr<T> makeUnique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

// Overload resolution: exact non-template beats template
template <typename T>
const char* kind(T)      { return "template"; }
const char* kind(int)    { return "plain int"; }

// Trailing return type using deduction (pre-C++14 style)
template <typename A, typename B>
auto add(A a, B b) -> decltype(a + b) { return a + b; }

int main() {
    int i = 42;
    const int ci = 7;

    byValue(ci);        // T = int (const stripped)
    byRef(ci);          // T = const int
    byFwd(i);           // T = int&  (lvalue)
    byFwd(42);          // T = int   (rvalue)

    kind(5);            // "plain int": exact match wins
    kind(5.0);          // "template"
    kind<int>(5);       // "template": explicit args force the template

    auto x = add(2, 3.5);        // double
    auto p = makeUnique<std::string>(5, 'x');  // "xxxxx", forwarded
}`
    },
    {
      title: 'Class Templates',
      content: `Class templates parameterize types over other types and values. Unlike Java/C# generics, each instantiation is a distinct compiled class with no runtime erasure.

**Core Mechanics:**
- \`Stack<int>\` and \`Stack<double>\` are unrelated types — no common base, no conversions between them
- Member functions are instantiated *lazily*: only the members you actually use must compile for a given \`T\`
- Non-type template parameters are allowed: \`std::array<int, 16>\` bakes the size into the type

**CTAD (C++17):**
Class Template Argument Deduction lets you write \`std::pair p{1, 2.0}\` or \`std::lock_guard lg(m)\` without angle brackets. Deduction guides can steer it (e.g., \`vector v{it1, it2}\` needing a guide to deduce the element type).

**Templates and Headers:**
Template definitions must be visible at the point of instantiation — that means header files (or explicit instantiation in one TU). This is why template-heavy code lives in headers and inflates compile times.

**Member Templates:**
A class template can have its own template members — e.g., a converting constructor \`template <typename U> Stack(const Stack<U>&)\` to allow \`Stack<double>\` from \`Stack<int>\`.

**Interview Angle:**
"Why must templates be in headers?", "are \`Vec<int>\` and \`Vec<long>\` related types?", and "what is CTAD?" come up constantly, along with the \`typename\` keyword needed before dependent type names.`,
      codeExample: `#include <cstddef>
#include <stdexcept>
#include <vector>

template <typename T, typename Container = std::vector<T>>
class Stack {
public:
    void push(T value) { c_.push_back(std::move(value)); }

    T pop() {
        if (c_.empty()) throw std::out_of_range("empty stack");
        T top = std::move(c_.back());
        c_.pop_back();
        return top;
    }

    bool empty() const { return c_.empty(); }
    std::size_t size() const { return c_.size(); }

    // Member template: converting constructor across element types
    template <typename U, typename C2>
    Stack(const Stack<U, C2>& other) {
        for (const U& v : other.data()) c_.push_back(T(v));
    }
    Stack() = default;

    const Container& data() const { return c_; }

private:
    Container c_;
};

// Non-type template parameter: size is part of the type
template <typename T, std::size_t N>
class FixedRing {
public:
    static constexpr std::size_t capacity = N;
    void push(T v) { buf_[head_++ % N] = std::move(v); }
private:
    T buf_[N]{};
    std::size_t head_ = 0;
};

// 'typename' required for dependent type names
template <typename C>
typename C::value_type firstOf(const C& c) {  // C::value_type depends on C
    return *c.begin();
}

int main() {
    Stack<int> ints;
    ints.push(1);
    Stack<double> doubles = ints;   // member template converts

    FixedRing<int, 8> ring;         // capacity in the type
    ring.push(42);

    std::vector v{1, 2, 3};         // CTAD: deduces vector<int>
    std::pair p{1, 2.5};            // CTAD: pair<int, double>
    firstOf(v);                     // 1
}`
    },
    {
      title: 'Template Specialization',
      content: `Specialization provides custom implementations for particular template arguments. It is how \`std::vector<bool>\` differs from the general case and how type traits are built.

**Full (Explicit) Specialization:**
\`template <> class Traits<char> { ... };\` — a complete replacement for one exact argument set. Allowed for both class and function templates.

**Partial Specialization:**
A class template specialized for a *pattern* of arguments: all pointers (\`T*\`), all pairs (\`std::pair<A, B>\`), same-type pairs (\`std::pair<T, T>\`). **Function templates cannot be partially specialized** — use overloading instead, which is also usually the better tool.

**Selection Rules:**
The compiler picks the most specialized match: full specialization beats partial, partial beats the primary template. Specializations must be declared before the first use that would instantiate them.

**Type Traits Pattern:**
The standard library builds \`std::is_pointer\`, \`std::remove_reference\`, etc. from a primary template (the default answer) plus partial specializations (the pattern matches). Understanding this pattern is expected of senior candidates.

**Gotchas:**
- Specializing a function template does not participate in overload resolution the way overloads do — a famous pitfall ("Why Not Specialize Function Templates," Sutter)
- Only specialize templates in \`std\` on user-defined types, and only where the standard permits (e.g., \`std::hash\`)`,
      codeExample: `#include <cstddef>
#include <functional>
#include <string>

// Primary template: the default answer
template <typename T>
struct TypeName {
    static constexpr const char* value = "unknown";
};

// Full specializations: exact types
template <>
struct TypeName<int>  { static constexpr const char* value = "int"; };
template <>
struct TypeName<bool> { static constexpr const char* value = "bool"; };

// Partial specialization: matches ANY pointer type
template <typename T>
struct TypeName<T*> {
    static constexpr const char* value = "pointer";
};

// The type-traits pattern (how std::is_pointer works):
template <typename T>
struct IsPointer { static constexpr bool value = false; };

template <typename T>
struct IsPointer<T*> { static constexpr bool value = true; };

static_assert(!IsPointer<int>::value);
static_assert(IsPointer<int*>::value);
static_assert(IsPointer<const char*>::value);

// remove_reference via partial specialization:
template <typename T> struct RemoveRef       { using type = T; };
template <typename T> struct RemoveRef<T&>   { using type = T; };
template <typename T> struct RemoveRef<T&&>  { using type = T; };

static_assert(std::is_same_v<RemoveRef<int&>::type, int>);

// std::hash: one of the FEW std templates users may specialize
struct UserId { int value; };

template <>
struct std::hash<UserId> {
    std::size_t operator()(const UserId& id) const noexcept {
        return std::hash<int>{}(id.value);
    }
};

int main() {
    static_assert(TypeName<int>::value != nullptr);
    // TypeName<int>    -> "int"      (full specialization wins)
    // TypeName<double*> -> "pointer" (partial specialization)
    // TypeName<float>  -> "unknown"  (primary template)
    std::hash<UserId> h;
    h(UserId{42});
}`
    },
    {
      title: 'Variadic Templates and Fold Expressions',
      content: `Variadic templates (C++11) accept any number of template arguments via parameter packs; fold expressions (C++17) collapse packs with an operator in one line.

**Parameter Packs:**
- \`template <typename... Ts>\` declares a pack of types; \`Ts... args\` a pack of function parameters
- \`sizeof...(args)\` gives the pack size at compile time
- \`args...\` expands the pack; the pattern before \`...\` is applied to each element: \`std::forward<Ts>(args)...\`

**Pre-C++17 Recursion:**
Process one head element plus a recursive call on the tail, with a base-case overload to stop. Verbose but still asked about.

**Fold Expressions (C++17):**
- Unary right fold: \`(args + ...)\` → \`a1 + (a2 + (a3))\`
- Unary left fold: \`(... + args)\` → \`((a1 + a2) + a3)\`
- Binary folds add an init value: \`(0 + ... + args)\` — required for empty packs with most operators
- Works with almost any binary operator, including \`,\` for "do this for each element"

**Where This Shows Up:**
\`std::make_unique\`, \`emplace_back\`, \`std::tuple\`, format/log functions — any perfect-forwarding factory is a variadic template. \`if constexpr\` (C++17) often replaces the recursive base case.

**Interview Angle:**
Writing a type-safe printf-style \`log(...)\` or \`sum(...)\` with folds is a common live-coding warmup; explaining pack expansion patterns is the follow-up.`,
      codeExample: `#include <iostream>
#include <memory>
#include <utility>

// Fold expressions (C++17)
template <typename... Ts>
auto sum(Ts... args) {
    return (args + ... + 0);        // binary left fold, safe for empty pack
}

template <typename... Ts>
bool allTruthy(Ts... args) {
    return (... && args);           // unary left fold over &&
}

// Fold over the comma operator: "for each argument"
template <typename... Ts>
void printAll(const Ts&... args) {
    ((std::cout << args << ' '), ...);
    std::cout << '\\n';
}

// Pre-C++17 style: recursion with a base case
void logImpl() { std::cout << '\\n'; }               // base case
template <typename Head, typename... Tail>
void logImpl(const Head& h, const Tail&... t) {
    std::cout << h << ' ';
    logImpl(t...);                   // recurse on the tail
}

// C++17: if constexpr replaces the base-case overload
template <typename Head, typename... Tail>
void log17(const Head& h, const Tail&... t) {
    std::cout << h << ' ';
    if constexpr (sizeof...(t) > 0)  // branch removed at compile time
        log17(t...);
    else
        std::cout << '\\n';
}

// The canonical use: perfect-forwarding factory
template <typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    // Pattern expansion: forward<Args>(args) applied per element
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

int main() {
    std::cout << sum(1, 2, 3, 4) << '\\n';     // 10
    std::cout << sum() << '\\n';                // 0 (init value)
    std::cout << allTruthy(1, true, 3) << '\\n';
    printAll("pi", 3.14, 'x', 42);
    log17("build", 17, "ok");
}`
    },
    {
      title: 'Concepts and Constraints (C++20, vs SFINAE)',
      content: `Concepts are named, reusable compile-time predicates on template arguments. They replace most SFINAE hackery with readable constraints and dramatically better error messages.

**Before Concepts — SFINAE:**
"Substitution Failure Is Not An Error": if substituting deduced arguments into a template signature fails, that candidate is silently dropped from overload resolution. \`std::enable_if\` exploits this to switch overloads on type properties — powerful but cryptic, with error novels when nothing matches.

**Defining and Using Concepts:**
- \`template <typename T> concept Numeric = std::is_arithmetic_v<T>;\`
- \`requires\` expressions check syntax validity: \`requires(T a, T b) { { a + b } -> std::convertible_to<T>; }\`
- Four ways to constrain: \`requires\` clause after the template header, trailing \`requires\`, concept as the type-parameter keyword (\`template <Numeric T>\`), or abbreviated with \`auto\` (\`void f(Numeric auto x)\`)

**Standard Concepts:**
\`std::integral\`, \`std::floating_point\`, \`std::same_as\`, \`std::convertible_to\`, \`std::invocable\`, \`std::ranges::range\` — prefer these over hand-rolled traits.

**Overloading on Concepts:**
The compiler picks the *more constrained* overload when several match (subsumption). This replaces tag dispatch and enable_if ping-pong.

**Why It Matters in Interviews:**
Explaining SFINAE, then showing the concepts equivalent, demonstrates both historical depth and modern fluency — exactly what senior C++ screens look for. Also expect: "when does a constraint get checked?" (at overload resolution, producing clean 'constraints not satisfied' errors).`,
      codeExample: `#include <concepts>
#include <iostream>
#include <string>
#include <type_traits>

// ---- The old way: SFINAE with enable_if ----
template <typename T,
          typename std::enable_if_t<std::is_integral_v<T>, int> = 0>
T twiceOld(T x) { return x * 2; }
// Fails ugly: pages of "no matching function" for twiceOld("hi")

// ---- The C++20 way: concepts ----
template <typename T>
concept Numeric = std::is_arithmetic_v<T> && !std::same_as<T, bool>;

// requires expression: checks that the SYNTAX is valid for T
template <typename T>
concept Printable = requires(std::ostream& os, T v) {
    { os << v } -> std::same_as<std::ostream&>;
};

// Style 1: concept in the template head
template <Numeric T>
T twice(T x) { return x * 2; }

// Style 2: requires clause
template <typename T>
    requires Printable<T>
void show(const T& v) { std::cout << v << '\\n'; }

// Style 3: abbreviated function template
auto half(Numeric auto x) { return x / 2; }

// Overloading by constraint: MORE constrained wins (subsumption)
template <typename T>
void describe(T)                { std::cout << "anything\\n"; }
template <std::integral T>
void describe(T)                { std::cout << "integral\\n"; }
template <std::signed_integral T>
void describe(T)                { std::cout << "signed integral\\n"; }

int main() {
    twice(21);            // OK
    // twice(std::string{"hi"});  // clean error:
    //   "constraints not satisfied: Numeric<std::string> is false"

    show(3.14);
    half(10);

    describe("text");     // anything
    describe(42u);        // integral
    describe(-1);         // signed integral (most constrained)
}`
    },
    {
      title: 'CRTP and Static Polymorphism',
      content: `The Curiously Recurring Template Pattern — a class derives from a template instantiated with *itself* — delivers polymorphic-style customization with zero virtual-dispatch cost.

**The Pattern:**
\`class Derived : public Base<Derived>\`. Inside \`Base\`, \`static_cast<Derived*>(this)\` reaches the derived class. Every call is resolved at compile time, so it can inline — no vptr, no vtable, no indirect call.

**Static vs Dynamic Polymorphism:**
- Virtual: one \`Base*\` can point at any derived type at *runtime*; costs a vtable indirection and blocks inlining
- CRTP: the derived type is fixed at *compile time*; \`Base<Dog>\` and \`Base<Cat>\` are unrelated types, so no heterogeneous containers — but zero overhead

**Classic Uses:**
- Mixins that inject functionality: \`std::enable_shared_from_this<T>\`, comparison operators from a single \`compare()\` (pre-spaceship Boost.Operators style), instance counters
- Static interfaces: the base calls \`derived().impl()\`; forgetting to define \`impl\` in the derived class is a compile error only when called

**Pitfalls:**
- Deriving from the *wrong* instantiation (\`class Cat : Base<Dog>\`) compiles until the cast misbehaves — a C++23 fix is "deducing this," which largely replaces CRTP for this use
- The base can't be used polymorphically at runtime; if you need runtime substitution, you still need virtuals or \`std::variant\`/visit

**Interview Angle:**
"How would you get polymorphism without vtables?" and "explain how enable_shared_from_this works" are direct CRTP prompts; comparing trade-offs against virtual dispatch shows senior judgment.`,
      codeExample: `#include <cstddef>
#include <iostream>

// CRTP base: Derived is known at COMPILE time
template <typename Derived>
class Shape {
public:
    double area() const {
        // Static dispatch: resolved and inlinable at compile time
        return derived().areaImpl();
    }
    void describe() const {
        std::cout << "area = " << area() << '\\n';
    }
private:
    const Derived& derived() const {
        return static_cast<const Derived&>(*this);
    }
};

class Circle : public Shape<Circle> {
public:
    explicit Circle(double r) : r_(r) {}
    double areaImpl() const { return 3.14159265 * r_ * r_; }
private:
    double r_;
};

class Square : public Shape<Square> {
public:
    explicit Square(double s) : s_(s) {}
    double areaImpl() const { return s_ * s_; }
private:
    double s_;
};

// CRTP mixin: per-class instance counting injected by inheritance
template <typename T>
class Counted {
public:
    Counted() { ++count_; }
    ~Counted() { --count_; }
    static std::size_t live() { return count_; }
private:
    inline static std::size_t count_ = 0;   // one counter PER T
};

class Session : public Counted<Session> {};
class Job     : public Counted<Job> {};

// Generic algorithm over any Shape<D> -- no virtual calls anywhere
template <typename D>
double doubledArea(const Shape<D>& s) { return 2 * s.area(); }

int main() {
    Circle c{1.0};
    Square q{3.0};
    c.describe();                    // inlined Circle::areaImpl
    q.describe();
    std::cout << doubledArea(q) << '\\n';

    Session s1, s2;
    Job j;
    std::cout << Session::live() << ' ' << Job::live() << '\\n'; // 2 1
    // Note: no vptr in Circle/Square -- sizeof stays minimal,
    // but you cannot put Circle and Square in one Shape* container.
}`
    }
  ],

  visualizations: [
    {
      title: 'Template Deduction Paths',
      description: 'How the parameter form changes what T deduces to',
      nodes: [
        { id: 'call', label: 'f(arg)\ncall site', x: 60, y: 130, type: 'primary' },
        { id: 'byval', label: 'f(T)\nstrips ref + const', x: 200, y: 40, type: 'secondary' },
        { id: 'byref', label: 'f(T&)\nkeeps const', x: 200, y: 130, type: 'secondary' },
        { id: 'fwd', label: 'f(T&&)\nforwarding ref', x: 200, y: 220, type: 'warning' },
        { id: 'collapse', label: 'reference\ncollapsing\n& + && = &', x: 320, y: 220, type: 'secondary' }
      ],
      edges: [
        { from: 'call', to: 'byval', label: 'copy' },
        { from: 'call', to: 'byref', label: 'bind' },
        { from: 'call', to: 'fwd', label: 'lvalue/rvalue' },
        { from: 'fwd', to: 'collapse', label: 'T = X&' }
      ]
    },
    {
      title: 'Specialization Selection',
      description: 'Which template the compiler picks, most specialized first',
      nodes: [
        { id: 'use', label: 'Traits<int*>\ninstantiation', x: 190, y: 40, type: 'primary' },
        { id: 'full', label: 'full spec\ntemplate<> Traits<int*>', x: 60, y: 140, type: 'primary' },
        { id: 'partial', label: 'partial spec\nTraits<T*>', x: 190, y: 140, type: 'secondary' },
        { id: 'primary', label: 'primary template\nTraits<T>', x: 320, y: 140, type: 'secondary' },
        { id: 'note', label: 'function templates:\nno partial specs,\noverload instead', x: 190, y: 240, type: 'warning' }
      ],
      edges: [
        { from: 'use', to: 'full', label: '1st: exact' },
        { from: 'use', to: 'partial', label: '2nd: pattern' },
        { from: 'use', to: 'primary', label: '3rd: fallback' },
        { from: 'partial', to: 'note' }
      ]
    }
  ],

  flashcards: [
    { id: 'tg1', front: 'What does T deduce to when a template parameter is taken by value?', back: 'References and top-level const/volatile are stripped: passing a const int& gives T = int. By-reference (T&) parameters preserve const.' },
    { id: 'tg2', front: 'What is a forwarding (universal) reference?', back: 'T&& where T is deduced (or auto&&). Binds to lvalues (T deduces to X&, collapsing to X&) and rvalues (T = X). Plain Widget&& is just an rvalue reference.' },
    { id: 'tg3', front: 'What are the reference collapsing rules?', back: '& &, & &&, and && & all collapse to &. Only && && yields &&. In short: lvalue reference wins. This powers forwarding references and std::forward.' },
    { id: 'tg4', front: 'What does std::forward do?', back: 'Conditionally casts back to rvalue: if the original argument was an rvalue (T deduced non-reference), forward<T> restores rvalueness; if it was an lvalue, it stays an lvalue.' },
    { id: 'tg5', front: 'Why must template definitions usually live in headers?', back: 'The compiler needs the full definition at each point of instantiation to generate code for the concrete types used. Alternatives: explicit instantiation in one translation unit.' },
    { id: 'tg6', front: 'Are Stack<int> and Stack<double> related types?', back: 'No — each instantiation is a completely distinct class with no common base and no implicit conversion between them.' },
    { id: 'tg7', front: 'What is CTAD?', back: 'Class Template Argument Deduction (C++17): template arguments of a class are deduced from constructor arguments, e.g. std::pair p{1, 2.0} deduces pair<int, double>.' },
    { id: 'tg8', front: 'Can function templates be partially specialized?', back: 'No. Only class (and variable) templates support partial specialization. For functions, use overloading instead — it also interacts better with overload resolution.' },
    { id: 'tg9', front: 'What is the difference between full and partial specialization?', back: 'Full: template<> Traits<int> replaces the template for one exact argument set. Partial: Traits<T*> matches a pattern of arguments and is still a template.' },
    { id: 'tg10', front: 'What is SFINAE?', back: 'Substitution Failure Is Not An Error: when substituting deduced arguments into a template signature fails, that overload is silently removed from the candidate set instead of causing a compile error.' },
    { id: 'tg11', front: 'What is a C++20 concept?', back: 'A named compile-time predicate on template arguments, e.g. template<typename T> concept Numeric = std::is_arithmetic_v<T>. Used to constrain templates with readable errors.' },
    { id: 'tg12', front: 'What does the fold expression (args + ... + 0) compute?', back: 'A binary left fold: ((0 + a1) + a2) + ... . The init value 0 makes the empty pack valid. Unary folds like (args + ...) reject empty packs for most operators.' },
    { id: 'tg13', front: 'What is CRTP?', back: 'Curiously Recurring Template Pattern: class Derived : Base<Derived>. The base static_casts this to Derived*, giving compile-time (static) polymorphism with no vtable cost.' },
    { id: 'tg14', front: 'When would you choose virtual dispatch over CRTP?', back: 'When you need runtime substitution — heterogeneous containers of Base*, plugin-style extension, types chosen at runtime. CRTP fixes the type at compile time.' },
    { id: 'tg15', front: 'How does std::enable_if work?', back: 'enable_if<Cond, T>::type exists only when Cond is true. Placing it in a template signature (a default template argument, return type, or parameter) makes substitution fail for non-matching types, and SFINAE removes that overload from consideration.' },
    { id: 'tg16', front: 'When must you write typename before a name inside a template?', back: 'When the name depends on a template parameter and refers to a type: typename T::value_type v;. Without it the compiler assumes T::value_type is a value (it cannot know until instantiation), and the parse fails.' },
    { id: 'tg17', front: 'When is the .template disambiguator needed?', back: 'When calling a member template on a dependent object with explicit template arguments: obj.template get<0>(). Otherwise the < is parsed as less-than. Same rule as typename, but for member templates.' },
    { id: 'tg18', front: 'What problem does perfect forwarding solve, and what is the canonical signature?', back: 'A wrapper (factory, emplace, bind) must pass its arguments to another function without losing whether they were lvalues or rvalues. template<class... Args> void wrap(Args&&... args) { f(std::forward<Args>(args)...); } preserves value category and constness.' },
    { id: 'tg19', front: 'Why must you not std::forward the same parameter twice?', back: 'If the argument was an rvalue, the first forward moves from it and the second call sees a moved-from object. Forward only on the last use, and pass the parameter as an lvalue for any earlier uses.' },
    { id: 'tg20', front: 'What are type traits?', back: 'Compile-time predicates and transformations on types in <type_traits>: std::is_same_v<A, B>, std::is_integral_v<T>, std::remove_reference_t<T>, std::decay_t<T>. The _v suffix gives the bool value and _t the resulting type.' },
    { id: 'tg21', front: 'What does sizeof...(args) give, and how do you process a pack without folds?', back: 'sizeof... returns the number of elements in a parameter pack. Pre-C++17 packs were processed by recursion: a base overload f() plus f(T first, Rest... rest) that peels one argument per call. if constexpr (sizeof...(rest) > 0) removes the need for the base overload.' },
    { id: 'tg22', front: 'What is a non-type template parameter?', back: 'A template parameter that is a value rather than a type: template<typename T, std::size_t N> class array. It must be a constant expression. C++20 also allows floating-point values and structural class types.' },
    { id: 'tg23', front: 'requires-clause vs requires-expression?', back: 'A requires-clause constrains a template: template<class T> requires std::integral<T>. A requires-expression is a compile-time check that yields bool: requires(T t) { t.size(); } - typically used to define a concept.' },
    { id: 'tg24', front: 'What is template code bloat and how do you limit it?', back: 'Every distinct set of template arguments generates separate code, so vector<int*>, vector<char*>, and vector<Widget*> triple the binary. Mitigations: a thin templated wrapper over a non-template core (e.g. void*), extern template declarations, and fewer template parameters.' },
    { id: 'tg25', front: 'What does extern template do?', back: 'extern template class std::vector<int>; tells the compiler not to instantiate that specialization in this translation unit because one explicit instantiation exists elsewhere. It cuts compile time and duplicate object code for heavily used instantiations.' },
    { id: 'tg26', front: 'What is a template template parameter?', back: 'A template parameter that is itself a template: template<template<class...> class Container> class Stack. It lets a class be parameterized by a container kind (vector, deque) rather than a fully specified type.' },
    { id: 'tg27', front: 'What is tag dispatch and what replaced it?', back: 'Overloading on an empty tag type (std::true_type/false_type, iterator category tags) chosen at compile time to select an implementation. if constexpr and concepts now express the same choice inline, without extra overloads.' },
    { id: 'tg28', front: 'What is an abbreviated function template?', back: 'C++20 lets you write void print(const auto& x) instead of template<class T> void print(const T& x). Each auto parameter introduces an invented template parameter; the function is still a template with all the same rules.' },
    { id: 'tg29', front: 'What does std::decay_t do?', back: 'Applies the conversions of pass-by-value: strips references and cv-qualifiers, turns arrays into pointers and functions into function pointers. decay_t<const char(&)[6]> is const char*. It is what auto and by-value template deduction produce.' },
    { id: 'tg30', front: 'Why does a derived class template need this-> to call a base template member?', back: 'When the base is dependent (Base<T>), its members are not looked up at definition time because Base<T> could be specialized to lack them. this->foo() or using Base<T>::foo; defers the lookup to instantiation.' }
  ],

  quizQuestions: [
    {
      id: 'tgq1',
      question: 'template <typename T> void f(T x); is called with const int& ci. What is T?',
      options: ['const int&', 'int&', 'int', 'const int'],
      correctAnswer: 2,
      explanation: 'By-value deduction strips the reference and top-level const: T = int. Use f(T&) to preserve constness (T = const int).'
    },
    {
      id: 'tgq2',
      question: 'In template <typename T> void f(T&& x), what is T when called with an lvalue int?',
      options: ['int', 'int&&', 'int&', 'const int&'],
      correctAnswer: 2,
      explanation: 'Forwarding references deduce T = int& for lvalues; the parameter type int& && collapses to int&. For an rvalue, T = int and the parameter is int&&.'
    },
    {
      id: 'tgq3',
      question: 'Which statement about function templates and specialization is true?',
      options: [
        'They support partial but not full specialization',
        'They support full but not partial specialization',
        'They support both full and partial specialization',
        'They support neither; only classes can be specialized'
      ],
      correctAnswer: 1,
      explanation: 'Function templates allow full (explicit) specialization only. For pattern-based variation, use overloads — partial specialization exists only for class and variable templates.'
    },
    {
      id: 'tgq4',
      question: 'Why do template definitions normally go in header files?',
      options: [
        'Headers compile faster than source files',
        'The linker requires all templates in one place',
        'The full definition must be visible wherever an instantiation occurs',
        'The standard forbids templates in .cpp files'
      ],
      correctAnswer: 2,
      explanation: 'Code is generated per instantiation, so the compiler needs the definition at each use site. Explicit instantiation in one .cpp is the exception that lets you hide the definition.'
    },
    {
      id: 'tgq5',
      question: 'What does the fold expression (... && args) evaluate to for an EMPTY pack?',
      options: ['A compile error', 'false', 'true', 'Undefined behavior'],
      correctAnswer: 2,
      explanation: '&&, ||, and comma have defined empty-pack values: true, false, and void() respectively. Every other operator requires a non-empty pack or a binary fold with an init value.'
    },
    {
      id: 'tgq6',
      question: 'What does SFINAE mean for overload resolution?',
      options: [
        'A substitution failure removes that candidate silently instead of erroring',
        'Any substitution failure aborts compilation immediately',
        'Failed templates are instantiated with default arguments',
        'The compiler retries deduction with implicit conversions'
      ],
      correctAnswer: 0,
      explanation: 'Substitution Failure Is Not An Error: an invalid substitution in the immediate context just drops that overload from the candidate set — the basis of enable_if dispatch.'
    },
    {
      id: 'tgq7',
      question: 'Two constrained overloads both match: one requires std::integral, one requires std::signed_integral. Calling with int picks which?',
      options: [
        'The std::integral overload — it was declared first',
        'Ambiguous: compile error',
        'Whichever the compiler chooses; it is unspecified',
        'The std::signed_integral overload — the more constrained wins'
      ],
      correctAnswer: 3,
      explanation: 'Concept subsumption prefers the more constrained candidate: signed_integral subsumes integral, so it wins for int. This replaces enable_if tag-dispatch tricks.'
    },
    {
      id: 'tgq8',
      question: 'What is the primary advantage of CRTP over virtual functions?',
      options: [
        'It allows heterogeneous containers of base pointers',
        'Calls resolve at compile time — no vtable indirection, and they can inline',
        'It works across shared library boundaries at runtime',
        'It reduces compile times'
      ],
      correctAnswer: 1,
      explanation: 'CRTP dispatches statically via static_cast to the known derived type: zero runtime overhead and full inlining. The trade-off is losing runtime substitution.'
    },
    {
      id: 'tgq9',
      question: 'std::pair p{1, 2.5}; compiles without template arguments in C++17. What feature is this?',
      options: [
        'SFINAE',
        'Partial specialization',
        'Class Template Argument Deduction (CTAD)',
        'A deduction guide is mandatory for std::pair'
      ],
      correctAnswer: 2,
      explanation: 'CTAD deduces class template arguments from the constructor call: pair<int, double>. std::pair needs no user-provided deduction guide; its constructors are enough.'
    },
    {
      id: 'tgq10',
      question: 'template<class T> void relay(T&& x) { sink(std::forward<T>(x)); } std::string s = "hi"; relay(s); What does sink receive, and what happens to s?',
      options: [
        'An rvalue; s is moved-from',
        'An lvalue std::string&; s is unchanged',
        'A copy of s by value',
        'Compile error: cannot forward an lvalue'
      ],
      correctAnswer: 1,
      explanation: 'For an lvalue argument T deduces to std::string&, so std::forward<std::string&> yields an lvalue. Only when relay is called with an rvalue does forward cast back to an rvalue.'
    },
    {
      id: 'tgq11',
      question: 'Inside template<class T> void f() { T::iterator it; } what does the compiler assume T::iterator is, and how do you fix it?',
      options: [
        'A type; nothing to fix',
        'A template; add .template',
        'A value (non-type); write typename T::iterator it;',
        'A function; add parentheses'
      ],
      correctAnswer: 2,
      explanation: 'Dependent qualified names are assumed to be non-types unless prefixed with typename. T::iterator it; is parsed as a multiplication-like expression and fails.'
    },
    {
      id: 'tgq12',
      question: 'template<class T> void twice(T&& v) { g(std::forward<T>(v)); h(std::forward<T>(v)); } called with an rvalue std::vector. What is the risk?',
      options: [
        'h may receive a moved-from (likely empty) vector because g already moved it',
        'Compile error: forward can only appear once',
        'Nothing - forward never moves',
        'g receives a copy, h receives the original'
      ],
      correctAnswer: 0,
      explanation: 'Both forwards cast v to an rvalue. If g takes by value or by &&, it moves from v, and h sees the leftover state. Forward only in the final use.'
    },
    {
      id: 'tgq13',
      question: 'template<class T> std::enable_if_t<std::is_integral_v<T>, T> half(T x) { return x / 2; } is the only overload. What does half(3.0) do?',
      options: [
        'Returns 1.5',
        'Returns 1 after converting to int',
        'Returns 1.5 with a warning',
        'Compile error: no matching function - the overload was removed by SFINAE'
      ],
      correctAnswer: 3,
      explanation: 'enable_if_t<false, double> has no ::type, so substitution fails and the candidate is discarded silently. With no remaining candidates, the call is an error.'
    },
    {
      id: 'tgq14',
      question: 'template<class T> struct Base { void hello(); }; template<class T> struct Derived : Base<T> { void run() { hello(); } }; What happens?',
      options: [
        'Compiles; hello is found in the base at instantiation',
        'Compile error: hello is not declared - the dependent base is not searched at definition time; use this->hello()',
        'Compiles only if T is int',
        'Link error'
      ],
      correctAnswer: 1,
      explanation: 'Because Base<T> could be specialized without hello, unqualified names are not looked up in dependent bases. this->hello() or using Base<T>::hello; fixes it.'
    },
    {
      id: 'tgq15',
      question: 'template<int N> struct Buf { char data[N]; }; Buf<3> a; Buf<4> b; a = b; What happens?',
      options: [
        'a gets a copy of b\'s first 3 bytes',
        'a is resized to 4',
        'Compile error: Buf<3> and Buf<4> are unrelated types',
        'Undefined behavior'
      ],
      correctAnswer: 2,
      explanation: 'Different template arguments - type OR non-type - produce distinct, unrelated classes. There is no implicit conversion between them.'
    },
    {
      id: 'tgq16',
      question: 'template<class... Ts> void f(Ts... ts) { constexpr auto n = sizeof...(ts); } f(1, 2.0, "x"); What is n?',
      options: ['3', 'The total bytes of all arguments', '16', 'sizeof(Ts) for the first type'],
      correctAnswer: 0,
      explanation: 'sizeof...(pack) is the number of elements in the pack, evaluated at compile time. It has nothing to do with the byte sizes of the arguments.'
    },
    {
      id: 'tgq17',
      question: 'What is std::decay_t<const char(&)[6]>?',
      options: ['const char[6]', 'const char&', 'char*', 'const char*'],
      correctAnswer: 3,
      explanation: 'decay strips the reference, then applies array-to-pointer conversion. The element constness stays: const char*. This is why auto s = "hello"; gives const char*.'
    },
    {
      id: 'tgq18',
      question: 'What does std::is_same_v<int, const int> evaluate to?',
      options: ['true', 'false', 'Compile error', 'Depends on the compiler'],
      correctAnswer: 1,
      explanation: 'is_same compares exact types, and const int is a different type from int. Use std::is_same_v<std::remove_cv_t<T>, int> (or remove_cvref_t) to ignore qualifiers.'
    },
    {
      id: 'tgq19',
      question: 'In C++20, void show(const auto& x); is what?',
      options: [
        'A function taking a std::any-like object',
        'A function using type erasure',
        'A function template - each auto parameter is an invented template parameter',
        'A syntax error; auto is not allowed in parameters'
      ],
      correctAnswer: 2,
      explanation: 'Abbreviated function templates are sugar for template<class T> void show(const T& x). The definition must be visible where called, just like any template.'
    },
    {
      id: 'tgq20',
      question: 'What does extern template class std::vector<int>; do in a translation unit?',
      options: [
        'Suppresses implicit instantiation here; the code comes from an explicit instantiation in another TU',
        'Forces vector<int> to be instantiated here',
        'Declares that vector<int> is defined in a shared library',
        'Makes vector<int> usable without including <vector>'
      ],
      correctAnswer: 0,
      explanation: 'It is the template analogue of an extern variable declaration: use it, but do not generate it. One .cpp must contain template class std::vector<int>; to provide the code.'
    }
  ]
};

// =============================================================================
// 5. STL CONTAINERS & ALGORITHMS
// =============================================================================
const stlContainers: CppCategory = {
  id: 'cpp-stl',
  name: 'STL Containers & Algorithms',
  slug: 'cpp-stl',
  description: 'vector, map, unordered_map, iterators, and the algorithms library',
  icon: 'layers-outline',
  color: '#16A085',
  colorDark: '#117A65',
  premium: true,

  learnContent: [
    {
      title: 'Sequence Containers',
      content: `Sequence containers store elements in a linear order you control. Interviewers expect you to know why \`std::vector\` is the default choice.

**std::vector:**
- Contiguous memory: cache-friendly, works with C APIs
- O(1) random access, amortized O(1) \`push_back\`
- Reallocates (typically 1.5-2x growth) when capacity is exceeded
- \`reserve()\` avoids repeated reallocation when size is known

**std::deque:**
- Chunked storage (array of fixed-size blocks)
- O(1) push/pop at both ends, O(1) random access (with one extra indirection)
- Backs \`std::stack\` and \`std::queue\` by default

**std::list:**
- Doubly-linked list: O(1) insert/erase given an iterator, O(1) \`splice\`
- Terrible cache locality - each node is a separate allocation
- Almost never faster than vector in practice, even for "lots of middle insertions", because finding the position is O(n) cache-miss-heavy traversal

**Why vector wins:**
Modern CPUs are dominated by memory latency. Contiguous data means prefetching works, so vector beats list on real hardware even for workloads that look list-friendly on paper. Bjarne Stroustrup's classic benchmark: vector wins insertion-in-the-middle tests up to surprisingly large sizes.`,
      codeExample: `#include <vector>
#include <deque>
#include <list>
#include <iostream>

int main() {
    std::vector<int> v;
    v.reserve(1000);              // one allocation, no growth churn
    for (int i = 0; i < 1000; ++i) {
        v.push_back(i);           // amortized O(1)
    }

    std::cout << v.size() << " / " << v.capacity() << "\\n";

    // size vs capacity
    v.clear();                    // size = 0, capacity unchanged
    v.shrink_to_fit();            // request capacity release (non-binding)

    // emplace_back constructs in place (no temporary)
    struct Point { int x, y; Point(int x, int y) : x(x), y(y) {} };
    std::vector<Point> pts;
    pts.emplace_back(1, 2);       // forwards args to constructor
    pts.push_back(Point{3, 4});   // constructs then moves

    // deque: cheap at both ends
    std::deque<int> dq;
    dq.push_front(1);             // O(1) - vector can't do this cheaply
    dq.push_back(2);

    // list: O(1) splice - its one killer feature
    std::list<int> a{1, 2, 3};
    std::list<int> b{4, 5, 6};
    a.splice(a.end(), b);         // moves all of b into a, no copies

    // Contiguity: vector interops with C APIs
    // legacy_api(v.data(), v.size());
    return 0;
}`
    },
    {
      title: 'Associative Containers',
      content: `Associative containers map keys to values. The tree-based and hash-based families have very different trade-offs.

**std::map / std::set (ordered):**
- Implemented as balanced binary search trees (red-black trees in practice)
- O(log n) insert, find, erase
- Iteration visits keys in sorted order
- Keys need \`operator<\` (or a custom comparator)
- Supports range queries: \`lower_bound\`, \`upper_bound\`

**std::unordered_map / std::unordered_set (hashed):**
- Hash table with buckets; average O(1) insert/find/erase, O(n) worst case
- Keys need \`std::hash\` specialization and \`operator==\`
- No ordering; iteration order is unspecified
- Load factor triggers rehashing; \`reserve()\` avoids rehash churn

**Interview talking points:**
- Default to \`unordered_map\` for pure lookup; use \`map\` when you need sorted iteration or range queries
- Custom types as keys: provide a hash functor + equality for unordered, a comparator for ordered
- \`operator[]\` default-constructs a value if the key is missing - use \`find()\` or \`at()\` for read-only lookups
- Worst-case O(n) hashing matters in adversarial settings (hash flooding attacks)`,
      codeExample: `#include <map>
#include <unordered_map>
#include <string>
#include <iostream>

struct Point {
    int x, y;
    bool operator==(const Point&) const = default;  // C++20
};

// Custom hash for unordered containers
struct PointHash {
    size_t operator()(const Point& p) const {
        size_t h1 = std::hash<int>{}(p.x);
        size_t h2 = std::hash<int>{}(p.y);
        return h1 ^ (h2 << 1);   // simple combine
    }
};

int main() {
    // Ordered map: sorted iteration + range queries
    std::map<std::string, int> scores{{"bob", 90}, {"alice", 85}};
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << "\\n";  // alice first
    }
    auto it = scores.lower_bound("b");   // first key >= "b"

    // Hash map: average O(1) lookups
    std::unordered_map<Point, std::string, PointHash> grid;
    grid[{1, 2}] = "treasure";

    // operator[] pitfall: inserts a default value on miss!
    std::unordered_map<std::string, int> counts;
    if (counts["missing"] == 0) { /* "missing" now EXISTS with value 0 */ }

    // Correct read-only lookup
    if (auto found = counts.find("missing"); found != counts.end()) {
        std::cout << found->second << "\\n";
    }

    // Counting pattern - operator[] shines here
    for (const std::string& w : {"a", "b", "a"}) {
        ++counts[w];             // default 0, then increment
    }

    // try_emplace: insert only if absent, no temporary value built
    counts.try_emplace("c", 42);
    return 0;
}`
    },
    {
      title: 'Iterators and Iterator Invalidation',
      content: `Iterators are the glue between containers and algorithms. Invalidation rules are a favorite senior interview topic because getting them wrong causes undefined behavior.

**Iterator categories:**
- Input/Output: single pass (streams)
- Forward: multi-pass, one direction (\`forward_list\`)
- Bidirectional: \`++\` and \`--\` (\`list\`, \`map\`, \`set\`)
- Random access: \`+ n\`, \`[]\` (\`deque\`)
- Contiguous (C++17): random access over contiguous memory (\`vector\`, \`array\`, \`string\`)

**Invalidation rules to memorize:**
- \`vector\`: reallocation invalidates ALL iterators, pointers, and references. \`insert\`/\`erase\` invalidates everything at and after the point of change
- \`deque\`: insert/erase in the middle invalidates all iterators; push at the ends invalidates iterators but NOT references
- \`list\` / \`map\` / \`set\`: only iterators to the erased element are invalidated - everything else survives
- \`unordered_map\`: rehashing invalidates all iterators but NOT pointers/references to elements

**The classic bug:**
Erasing inside a loop without using the returned iterator. \`erase()\` returns the iterator to the next element - always use it.`,
      codeExample: `#include <vector>
#include <map>
#include <iostream>

int main() {
    // BUG: iterator invalidated by erase
    std::vector<int> v{1, 2, 3, 4, 5, 6};
    // for (auto it = v.begin(); it != v.end(); ++it)
    //     if (*it % 2 == 0) v.erase(it);   // UB: it is invalid after erase

    // CORRECT: use the iterator returned by erase
    for (auto it = v.begin(); it != v.end(); ) {
        if (*it % 2 == 0) {
            it = v.erase(it);    // returns iterator to next element
        } else {
            ++it;
        }
    }

    // BUG: push_back while holding a reference
    std::vector<int> w{1};
    // int& first = w[0];
    // w.push_back(2);           // may reallocate -> first dangles

    // Safe: reserve first, or re-fetch after mutation
    w.reserve(10);
    int& first = w[0];
    w.push_back(2);              // no reallocation, first still valid

    // Node-based containers are forgiving
    std::map<int, std::string> m{{1, "a"}, {2, "b"}, {3, "c"}};
    auto it2 = m.find(2);
    m.erase(1);                  // it2 still valid - only node 1 died
    std::cout << it2->second << "\\n";  // "b"

    // C++20: just use std::erase_if - no manual loop at all
    std::erase_if(v, [](int x) { return x > 3; });

    // Distance and advance work across iterator categories
    auto mid = v.begin();
    std::advance(mid, v.size() / 2);   // O(1) for random access
    return 0;
}`
    },
    {
      title: 'The Algorithms Library',
      content: `The \`<algorithm>\` header is what separates fluent C++ from "C with classes". Interviewers love candidates who reach for algorithms instead of raw loops.

**Core algorithms:**
- \`std::sort\`: O(n log n) introsort (quicksort + heapsort + insertion sort). Requires random access iterators - so it works on \`vector\` but not \`list\` (which has its own \`sort()\` member)
- \`std::stable_sort\`: preserves relative order of equal elements
- \`std::find\` / \`find_if\`: linear search; use \`binary_search\`/\`lower_bound\` on sorted ranges
- \`std::transform\`: map over a range into an output
- \`std::accumulate\` (in \`<numeric>\`): fold/reduce

**The erase-remove idiom:**
\`std::remove\` doesn't remove anything - it shifts kept elements forward and returns the new logical end. You must call \`erase\` to actually shrink the container. C++20's \`std::erase\`/\`std::erase_if\` finally wraps this into one call.

**Comparators and projections:**
Pass lambdas to customize ordering. Watch out: a comparator must be a strict weak ordering - using \`<=\` instead of \`<\` is undefined behavior.

**Know the complexity:**
\`std::nth_element\` is O(n) average and answers "find the k-th smallest" - a very common interview follow-up to sorting questions.`,
      codeExample: `#include <algorithm>
#include <numeric>
#include <vector>
#include <string>
#include <iostream>

struct Employee { std::string name; int salary; };

int main() {
    std::vector<int> v{5, 2, 8, 1, 9, 3};

    // Sort with a custom comparator (must be strict weak ordering!)
    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

    // Sort structs by a field
    std::vector<Employee> staff{{"ana", 90}, {"bo", 70}, {"cy", 90}};
    std::stable_sort(staff.begin(), staff.end(),
        [](const auto& a, const auto& b) { return a.salary < b.salary; });

    // find_if: first match or end()
    auto rich = std::find_if(staff.begin(), staff.end(),
        [](const auto& e) { return e.salary > 80; });
    if (rich != staff.end()) std::cout << rich->name << "\\n";

    // transform: map into another container
    std::vector<int> squares;
    std::transform(v.begin(), v.end(), std::back_inserter(squares),
        [](int x) { return x * x; });

    // accumulate: fold (note: initial value type drives the result type)
    int sum = std::accumulate(v.begin(), v.end(), 0);
    double avg = std::accumulate(v.begin(), v.end(), 0.0) / v.size();

    // Erase-remove idiom (pre-C++20)
    std::vector<int> nums{1, 2, 3, 2, 4, 2};
    nums.erase(std::remove(nums.begin(), nums.end(), 2), nums.end());

    // C++20: one call
    std::erase_if(nums, [](int x) { return x % 2 == 0; });

    // nth_element: k-th smallest in O(n) average
    std::vector<int> data{7, 4, 9, 1, 5};
    std::nth_element(data.begin(), data.begin() + 2, data.end());
    std::cout << "median-ish: " << data[2] << "\\n";  // 5

    // Sorted-range algorithms are O(log n)
    std::sort(data.begin(), data.end());
    bool has = std::binary_search(data.begin(), data.end(), 5);
    return 0;
}`
    },
    {
      title: 'Container Complexity Cheat Sheet',
      content: `Senior interviews often boil down to: "which container, and why?" Have this table in your head.

**Lookup by key:**
- \`unordered_map\`: O(1) average - default choice for pure key-value lookup
- \`map\`: O(log n) - choose when you need sorted keys or range queries

**Access by index:**
- \`vector\` / \`array\` / \`deque\`: O(1)
- \`list\`: O(n) - no random access at all

**Insert/erase:**
- \`vector\` back: amortized O(1); front/middle: O(n) (shifts elements)
- \`deque\` both ends: O(1)
- \`list\` anywhere (with iterator in hand): O(1)
- \`map\`/\`set\`: O(log n)
- \`unordered_map\`: O(1) average

**Decision heuristics:**
- Default: \`vector\`. Contiguous, cache-friendly, least overhead
- Need key lookup: \`unordered_map\` (or \`map\` if sorted order matters)
- Need FIFO/both-end pushes: \`deque\`
- Need stable iterators/references across inserts: node-based (\`list\`, \`map\`)
- Need top-k / priority: \`priority_queue\` (binary heap over vector)
- Fixed size known at compile time: \`std::array\` (zero overhead, stack-allocated)

**Memory overhead:**
Node-based containers pay ~2-3 pointers plus allocator overhead per element. A \`list<int>\` can use 5x+ the memory of a \`vector<int>\`. This is often the deciding argument in a systems interview.`,
      codeExample: `#include <vector>
#include <array>
#include <queue>
#include <unordered_map>
#include <iostream>

int main() {
    // std::array: fixed size, lives on the stack, zero overhead
    std::array<int, 4> fixed{1, 2, 3, 4};
    static_assert(fixed.size() == 4);   // size known at compile time

    // priority_queue: O(log n) push/pop, O(1) top - top-k problems
    std::priority_queue<int> maxHeap;
    for (int x : {3, 1, 4, 1, 5}) maxHeap.push(x);
    std::cout << maxHeap.top() << "\\n";  // 5

    // Min-heap needs the comparator flipped
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    minHeap.push(3); minHeap.push(1);
    std::cout << minHeap.top() << "\\n";  // 1

    // Top-k pattern: keep a min-heap of size k
    auto topK = [](const std::vector<int>& data, size_t k) {
        std::priority_queue<int, std::vector<int>, std::greater<int>> h;
        for (int x : data) {
            h.push(x);
            if (h.size() > k) h.pop();  // evict smallest
        }
        return h;  // contains the k largest
    };
    auto best = topK({9, 4, 7, 1, 8, 2}, 3);

    // Frequency count: the unordered_map bread-and-butter
    std::unordered_map<char, int> freq;
    for (char c : std::string("hello")) ++freq[c];

    // vector as a flat map: for small N, linear scan beats hashing
    std::vector<std::pair<int, int>> flat{{1, 10}, {2, 20}};
    // For < ~50 elements this is often FASTER than unordered_map
    // because the whole thing fits in one or two cache lines.
    return 0;
}`
    },
    {
      title: 'Strings and string_view',
      content: `\`std::string\` is a dynamic character container; \`std::string_view\` (C++17) is a non-owning window over character data. Knowing when to use which signals modern C++ fluency.

**std::string:**
- Owns its buffer; contiguous, null-terminated (\`c_str()\`)
- Small String Optimization (SSO): short strings (~15-22 chars depending on the implementation) live inline in the object - no heap allocation
- Concatenation with \`+\` in a loop is O(n^2); prefer \`+=\` or \`reserve()\`

**std::string_view:**
- A pointer + length. Copying it is trivial (two words)
- Accepts \`std::string\`, string literals, and char arrays without allocation
- \`substr()\` is O(1) - it just adjusts the pointer and length, no copy

**The dangling trap:**
\`string_view\` does not own. Returning a view of a local string, or storing a view of a temporary, is a dangling reference. \`std::string s = get(); std::string_view sv = s + "!";\` dangles immediately - the temporary dies at the end of the statement.

**API guidance:**
- Take \`std::string_view\` by value for read-only string parameters
- Take \`std::string\` (by value, then move) when you need to store a copy
- Never store a \`string_view\` as a class member unless the lifetime contract is explicit
- \`string_view\` is not guaranteed null-terminated - don't pass \`.data()\` to C APIs expecting a C string`,
      codeExample: `#include <string>
#include <string_view>
#include <iostream>

// Good: read-only parameter, no allocation for any caller
size_t countVowels(std::string_view sv) {
    size_t n = 0;
    for (char c : sv) {
        if (std::string_view("aeiou").find(c) != std::string_view::npos) ++n;
    }
    return n;
}

// Good: we need to keep a copy -> take string by value and move it
struct User {
    std::string name;
    explicit User(std::string n) : name(std::move(n)) {}
};

// BAD: returning a view of a local - dangling!
// std::string_view broken() {
//     std::string local = "temp";
//     return local;              // view outlives the string. UB.
// }

int main() {
    countVowels("literal");                 // no std::string constructed
    std::string s = "hello world";
    countVowels(s);                         // no copy either

    // O(1) substring - just pointer arithmetic
    std::string_view sv = s;
    std::string_view word = sv.substr(6, 5);  // "world", zero allocation
    std::cout << word << "\\n";

    // Dangling trap: temporary dies at end of statement
    // std::string_view bad = s + "!";      // UB on next line
    std::string owned = s + "!";            // fine: owned keeps it alive

    // Efficient building: reserve, then append
    std::string out;
    out.reserve(64);
    for (int i = 0; i < 5; ++i) {
        out += "chunk ";                    // += appends, no temporaries
    }

    // SSO: short strings never touch the heap
    std::string tiny = "short";             // stored inline in the object
    return 0;
}`
    }
  ],

  visualizations: [
    {
      title: 'Choosing a Container',
      description: 'Decision path from access pattern to the right STL container',
      nodes: [
        { id: 'start', label: 'What do you\nneed?', x: 190, y: 40, type: 'primary' },
        { id: 'keyed', label: 'Lookup\nby key?', x: 80, y: 110, type: 'secondary' },
        { id: 'seq', label: 'Sequence of\nelements?', x: 300, y: 110, type: 'secondary' },
        { id: 'umap', label: 'unordered_map\nO(1) avg', x: 60, y: 190, type: 'primary' },
        { id: 'map', label: 'map\nsorted, O(log n)', x: 170, y: 190, type: 'secondary' },
        { id: 'vector', label: 'vector\n(default!)', x: 280, y: 190, type: 'primary' },
        { id: 'deque', label: 'deque\nboth ends', x: 320, y: 250, type: 'warning' }
      ],
      edges: [
        { from: 'start', to: 'keyed', label: 'key-value' },
        { from: 'start', to: 'seq', label: 'ordered data' },
        { from: 'keyed', to: 'umap', label: 'speed' },
        { from: 'keyed', to: 'map', label: 'sorted' },
        { from: 'seq', to: 'vector', label: 'usually' },
        { from: 'seq', to: 'deque', label: 'push front' }
      ]
    },
    {
      title: 'Erase-Remove Idiom',
      description: 'How std::remove and erase cooperate to delete elements from a vector',
      nodes: [
        { id: 'vec', label: 'vector\n[1,2,3,2,4]', x: 80, y: 60, type: 'primary' },
        { id: 'remove', label: 'std::remove(2)\nshifts kept values', x: 230, y: 60, type: 'secondary' },
        { id: 'logical', label: '[1,3,4,?,?]\nnew logical end', x: 230, y: 150, type: 'warning' },
        { id: 'erase', label: 'v.erase(it, end)\nshrinks size', x: 90, y: 150, type: 'secondary' },
        { id: 'done', label: '[1,3,4]\nC++20: erase_if', x: 160, y: 230, type: 'primary' }
      ],
      edges: [
        { from: 'vec', to: 'remove', label: 'step 1' },
        { from: 'remove', to: 'logical', label: 'returns iter' },
        { from: 'logical', to: 'erase', label: 'step 2' },
        { from: 'erase', to: 'done' }
      ]
    }
  ],

  flashcards: [
    { id: 'st1', front: 'Why is std::vector usually faster than std::list even for middle insertions?', back: 'Cache locality. Vector data is contiguous so prefetching works; list traversal is a cache miss per node. Finding the insertion point dominates, and vector wins that traversal.' },
    { id: 'st2', front: 'What is the amortized complexity of vector::push_back and why?', back: 'Amortized O(1). The vector grows geometrically (typically 1.5-2x), so the total cost of all reallocations over n pushes is O(n), averaging out to constant per push.' },
    { id: 'st3', front: 'How are std::map and std::set typically implemented?', back: 'As self-balancing binary search trees, in practice red-black trees. This gives O(log n) insert/find/erase and sorted iteration order.' },
    { id: 'st4', front: 'When does unordered_map degrade to O(n) lookups?', back: 'When many keys hash to the same bucket - a bad hash function or adversarial keys (hash flooding). All colliding elements sit in one bucket and must be scanned linearly.' },
    { id: 'st5', front: 'What is the pitfall of unordered_map::operator[]?', back: 'It default-constructs and inserts a value if the key is missing. Use find() or at() for read-only lookups to avoid accidentally growing the map.' },
    { id: 'st6', front: 'Which vector operations invalidate iterators?', back: 'Any reallocation (push_back past capacity, insert, resize) invalidates ALL iterators/pointers/references. insert/erase invalidates everything at and after the modification point.' },
    { id: 'st7', front: 'Does rehashing an unordered_map invalidate pointers to elements?', back: 'No. Rehashing invalidates iterators but NOT pointers or references to elements - the nodes themselves are not moved, only relinked into new buckets.' },
    { id: 'st8', front: 'What is the erase-remove idiom?', back: 'std::remove shifts kept elements forward and returns the new logical end; container.erase(newEnd, end()) then actually shrinks it. C++20 std::erase/std::erase_if does both in one call.' },
    { id: 'st9', front: 'Why does std::sort not work on std::list?', back: 'std::sort requires random access iterators; list only provides bidirectional ones. Use list::sort(), a merge-sort-based member function, instead.' },
    { id: 'st10', front: 'What does std::nth_element do and what is its complexity?', back: 'Partially sorts so the n-th position holds the element that would be there if fully sorted, with smaller elements before it. O(n) average - ideal for k-th smallest / median problems.' },
    { id: 'st11', front: 'What must a comparator passed to std::sort satisfy?', back: 'Strict weak ordering: irreflexive (comp(a,a) is false), asymmetric, transitive. Using <= instead of < violates it and causes undefined behavior.' },
    { id: 'st12', front: 'What is Small String Optimization (SSO)?', back: 'std::string stores short strings (~15-22 chars, implementation-defined) inline in the object itself, avoiding heap allocation entirely.' },
    { id: 'st13', front: 'What is std::string_view and its main danger?', back: 'A non-owning pointer + length over character data; copying is trivial and substr is O(1). Danger: it dangles if the underlying string is destroyed - never view a temporary.' },
    { id: 'st14', front: 'When would you pick a sorted vector over std::map?', back: 'When the data is built once and queried many times. Sort once, then binary-search with lower_bound: same O(log n) lookups but contiguous memory, far less overhead, and better cache behavior.' },
    { id: 'st15', front: 'emplace_back vs push_back?', back: 'emplace_back forwards its arguments to the element constructor, building the object directly in the vector\'s storage. push_back needs an already constructed object (a temporary that is then moved). For types with cheap moves the difference is small; for non-movable types emplace is the only option.' },
    { id: 'st16', front: 'reserve vs resize on a vector?', back: 'reserve(n) grows capacity only - size stays the same and no elements are constructed; it prevents reallocations when the final size is known. resize(n) changes size, default-constructing or destroying elements to reach n.' },
    { id: 'st17', front: 'What is the load factor of an unordered_map and when does it rehash?', back: 'load_factor = size / bucket_count. When an insertion would push it above max_load_factor (default 1.0), the table rehashes into more buckets. reserve(n) pre-sizes the bucket array so n elements fit without rehashing.' },
    { id: 'st18', front: 'lower_bound vs upper_bound vs equal_range?', back: 'On a sorted range, lower_bound(x) is the first element not less than x; upper_bound(x) is the first element greater than x; equal_range(x) returns both, bracketing all elements equal to x. All are O(log n) binary searches.' },
    { id: 'st19', front: 'What does std::partition do?', back: 'Reorders a range so every element satisfying the predicate comes before those that do not, returning the boundary iterator. O(n), not stable; std::stable_partition preserves relative order at extra cost. It is the core of quicksort and quickselect.' },
    { id: 'st20', front: 'Why is std::vector<bool> a notorious special case?', back: 'It is specialized to pack bits, so operator[] returns a proxy object rather than bool&. You cannot take a reference or pointer to an element, and generic code that expects T& breaks. Use std::vector<char> or std::bitset when that matters.' },
    { id: 'st21', front: 'How is std::priority_queue implemented and what are its complexities?', back: 'A binary heap stored in an underlying std::vector (a max-heap by default, using std::less). top() is O(1); push and pop are O(log n). Pass std::greater<T> for a min-heap. There is no way to iterate or decrease-key.' },
    { id: 'st22', front: 'Why prefer std::array over a C array?', back: 'It knows its size, does not decay to a pointer when passed to functions, supports copying and comparison, works with range-for and algorithms, and has at() for bounds checking - all with zero overhead over a raw array.' },
    { id: 'st23', front: 'What are the iterator categories?', back: 'Input (single pass read), output (single pass write), forward (multi-pass), bidirectional (also --), random access (+n, [], subtraction in O(1)), and contiguous (C++20: elements are adjacent in memory). Algorithms require a minimum category; std::sort needs random access.' },
    { id: 'st24', front: 'How do you erase elements from a vector while iterating?', back: 'Use the iterator erase returns: it = v.erase(it) when removing, ++it otherwise. Incrementing an erased iterator is undefined behavior. For bulk removal, erase-remove or std::erase_if is simpler and O(n).' },
    { id: 'st25', front: 'std::sort vs std::stable_sort?', back: 'stable_sort preserves the relative order of equal elements, which matters when sorting by one key after another. It is mergesort-based: O(n log n) with a temporary buffer, degrading to O(n log^2 n) if no memory is available. sort is faster but unstable.' },
    { id: 'st26', front: 'Does erasing or clearing a vector release its memory?', back: 'No. Capacity never shrinks on erase or clear; the buffer is kept for reuse. To free it call shrink_to_fit() (a non-binding request) or swap with an empty vector: std::vector<T>().swap(v).' },
    { id: 'st27', front: 'What is std::span?', back: 'A C++20 non-owning view over a contiguous sequence: pointer plus size. It accepts arrays, std::array, vector, and pointer/length pairs uniformly, replacing (T*, size_t) parameters. Like string_view, it dangles if the underlying storage dies.' },
    { id: 'st28', front: 'How do you use a custom struct as an unordered_map key?', back: 'Provide operator== and a hash: either specialize std::hash<Key> or pass a hasher type as the third template argument. Combine member hashes (e.g. h1 ^ (h2 << 1) or a proper hash_combine) so distinct keys spread across buckets.' },
    { id: 'st29', front: 'What is heterogeneous lookup in associative containers?', back: 'With a transparent comparator (std::map<std::string, V, std::less<>>) find and count accept any comparable type, so looking up a const char* or string_view does not construct a temporary std::string. C++20 adds the same for unordered containers.' },
    { id: 'st30', front: 'map::insert vs operator[] vs try_emplace vs insert_or_assign?', back: 'insert and try_emplace do nothing if the key exists (try_emplace also avoids constructing the value in that case). operator[] default-constructs then assigns, requiring a default constructor. insert_or_assign always ends with the new value, returning whether it inserted.' }
  ],

  quizQuestions: [
    {
      id: 'stq1',
      question: 'What happens to iterators when a std::vector reallocates during push_back?',
      options: ['Only the end iterator is invalidated', 'All iterators, pointers, and references are invalidated', 'Iterators stay valid but references dangle', 'Nothing - vectors never invalidate iterators'],
      correctAnswer: 1,
      explanation: 'Reallocation moves all elements to a new buffer, so every iterator, pointer, and reference into the old buffer becomes invalid.'
    },
    {
      id: 'stq2',
      question: 'Which container gives O(1) average lookup by key?',
      options: ['std::unordered_map', 'std::map', 'std::vector', 'std::list'],
      correctAnswer: 0,
      explanation: 'unordered_map is a hash table with O(1) average lookup. std::map is a balanced tree with O(log n).'
    },
    {
      id: 'stq3',
      question: 'What does std::remove(v.begin(), v.end(), x) actually do?',
      options: ['Deletes all x and shrinks the vector', 'Deletes only the first x', 'Shifts kept elements forward and returns the new logical end - the size is unchanged', 'Marks elements as deleted for the destructor'],
      correctAnswer: 2,
      explanation: 'std::remove cannot change container size (it only sees iterators). You must call erase on the returned range - the erase-remove idiom.'
    },
    {
      id: 'stq4',
      question: 'Why does counts["key"] == 0 potentially modify an unordered_map?',
      options: ['It rehashes the table', 'It sorts the buckets', 'Comparisons always copy the map', 'operator[] inserts a default-constructed value if the key is absent'],
      correctAnswer: 3,
      explanation: 'operator[] on map/unordered_map inserts a default value for missing keys. Use find() or at() for read-only access.'
    },
    {
      id: 'stq5',
      question: 'A std::map iterator points at key 5. You erase key 3. What happens to the iterator?',
      options: ['It is invalidated', 'It remains valid - node-based containers only invalidate iterators to erased elements', 'It now points at key 3', 'Undefined behavior on next dereference'],
      correctAnswer: 1,
      explanation: 'map, set, and list are node-based: erasing one element only invalidates iterators to that element. All others survive.'
    },
    {
      id: 'stq6',
      question: 'Which algorithm finds the k-th smallest element in O(n) average time?',
      options: ['std::sort', 'std::partial_sort', 'std::nth_element', 'std::binary_search'],
      correctAnswer: 2,
      explanation: 'std::nth_element uses quickselect-style partitioning: O(n) average, placing the n-th element in its sorted position.'
    },
    {
      id: 'stq7',
      question: 'std::string_view sv = s + "!"; What is wrong with this line?',
      options: ['sv views a temporary string that is destroyed at the end of the statement - sv dangles', 'string_view cannot view concatenation results', 'It copies the whole string, defeating the purpose', 'Nothing - string_view extends the temporary\'s lifetime'],
      correctAnswer: 0,
      explanation: 's + "!" creates a temporary std::string that dies at the end of the full expression. The view points at freed memory - undefined behavior.'
    },
    {
      id: 'stq8',
      question: 'What is the complexity of std::sort and what iterator category does it require?',
      options: ['O(n log n), bidirectional iterators', 'O(n^2) worst case, forward iterators', 'O(n log n) average only, any iterators', 'O(n log n), random access iterators'],
      correctAnswer: 3,
      explanation: 'std::sort is introsort (quicksort + heapsort fallback + insertion sort), guaranteed O(n log n), and requires random access iterators.'
    },
    {
      id: 'stq9',
      question: 'Which statement about std::deque is true?',
      options: ['It stores all elements in one contiguous buffer', 'It offers O(1) push at both ends using chunked storage', 'It is a linked list of single elements', 'It does not support random access'],
      correctAnswer: 1,
      explanation: 'deque uses fixed-size blocks with an index map, giving O(1) push_front/push_back and O(1) random access with one extra indirection.'
    },
    {
      id: 'stq10',
      question: 'for (auto it = v.begin(); it != v.end(); ++it) { if (*it % 2 == 0) v.erase(it); } What is wrong?',
      options: ['Nothing - erase does not affect the loop', 'It skips every other element but is otherwise safe', 'Undefined behavior: it is invalidated by erase, then incremented', 'Compile error: cannot erase while iterating'],
      correctAnswer: 2,
      explanation: 'erase invalidates the erased iterator and everything after it. Use it = v.erase(it) in the erase branch and ++it otherwise, or std::erase_if(v, pred).'
    },
    {
      id: 'stq11',
      question: 'std::vector<int> v; v.reserve(100); What are v.size() and v.capacity()?',
      options: ['size 100, capacity 100', 'size 0, capacity at least 100', 'size 100, capacity 0', 'Both unchanged - reserve is only a hint'],
      correctAnswer: 1,
      explanation: 'reserve allocates storage but constructs no elements. Accessing v[0] is still undefined behavior; use resize(100) if you want 100 elements.'
    },
    {
      id: 'stq12',
      question: 'std::vector<int> v = {1, 3, 3, 5, 8}; auto it = std::lower_bound(v.begin(), v.end(), 4); What does *it equal?',
      options: ['5 - the first element not less than 4', '3 - the last element less than 4', '8', 'Undefined - 4 is not in the vector'],
      correctAnswer: 0,
      explanation: 'lower_bound returns the first position where the value could be inserted without breaking the order: the first element >= 4. It never fails; it returns end() if all elements are smaller.'
    },
    {
      id: 'stq13',
      question: 'An unordered_map has max_load_factor 1.0 and 8 buckets with 8 elements. What happens on the next insertion of a new key?',
      options: ['It is rejected until you call rehash', 'It goes into an overflow list with O(1) access', 'Elements are moved to a bigger contiguous array like vector', 'The table rehashes into more buckets, invalidating all iterators but not references'],
      correctAnswer: 3,
      explanation: 'Exceeding max_load_factor triggers a rehash that grows the bucket array and relinks the nodes. Iterators are invalidated; pointers and references to elements stay valid because nodes are not moved.'
    },
    {
      id: 'stq14',
      question: 'std::vector<bool> flags(10); bool& b = flags[0]; What happens?',
      options: ['b refers to the first element', 'Compile error: operator[] returns a proxy object, not bool&', 'b is a dangling reference', 'It works but is slow'],
      correctAnswer: 1,
      explanation: 'vector<bool> packs bits, so there is no bool object to refer to. operator[] returns std::vector<bool>::reference, a proxy. auto b = flags[0]; gets the proxy; bool b = flags[0]; gets a copy.'
    },
    {
      id: 'stq15',
      question: 'std::priority_queue<int> pq; pq.push(3); pq.push(9); pq.push(1); What does pq.top() return and at what cost?',
      options: ['1, O(1)', '3, O(log n)', '9, O(1)', '9, O(log n)'],
      correctAnswer: 2,
      explanation: 'The default comparator is std::less, giving a max-heap: top() is the largest element and is O(1). Only push and pop are O(log n). Use std::greater<int> for a min-heap.'
    },
    {
      id: 'stq16',
      question: 'std::vector<std::pair<int, std::string>> v; What is the advantage of v.emplace_back(1, "one") over v.push_back({1, "one"})?',
      options: ['The pair is constructed directly in the vector\'s storage from the arguments - no temporary pair', 'emplace_back never reallocates', 'It avoids constructing the std::string', 'There is none; they generate identical code'],
      correctAnswer: 0,
      explanation: 'push_back must first build a temporary pair, then move it in. emplace_back forwards the arguments to the pair constructor in place. The string is constructed either way.'
    },
    {
      id: 'stq17',
      question: 'std::vector<int> v = {5, 1, 4}; bool found = std::binary_search(v.begin(), v.end(), 4); What is the result?',
      options: ['true, guaranteed', 'false, guaranteed', 'Compile error', 'Unreliable - binary_search requires a sorted range'],
      correctAnswer: 3,
      explanation: 'Binary search assumes ordering to discard half the range each step. On unsorted input the result is meaningless (here it probably returns false). Sort first, or use std::find for O(n).'
    },
    {
      id: 'stq18',
      question: 'You sort employees by name, then want to sort by department while keeping names ordered within each department. Which call is correct?',
      options: ['std::sort by department - sort preserves prior order', 'std::stable_sort by department - it preserves the relative order of equal elements', 'std::partial_sort by department', 'std::nth_element by department'],
      correctAnswer: 1,
      explanation: 'std::sort gives no guarantee about the order of equal keys, so the earlier name ordering may be scrambled. stable_sort keeps it, at the cost of extra memory.'
    },
    {
      id: 'stq19',
      question: 'std::set<std::string> names; names.find("alice"); What hidden cost does this have, and how do you avoid it?',
      options: ['None - find takes const char* directly', 'A rehash of the set', 'A temporary std::string is constructed for the lookup; declare the set with std::less<> to enable heterogeneous lookup', 'A copy of the entire set'],
      correctAnswer: 2,
      explanation: 'With the default std::less<std::string>, find takes const std::string&, so the literal is converted (possibly with a heap allocation). A transparent comparator lets find compare the const char* directly.'
    },
    {
      id: 'stq20',
      question: 'std::map<std::string, int> m; m.insert({"a", 1}); m.insert({"a", 2}); What is m["a"]?',
      options: ['1 - insert does not overwrite an existing key', '2 - the later insert wins', 'Compile error: duplicate key', 'Undefined - map has two entries for "a"'],
      correctAnswer: 0,
      explanation: 'insert returns a pair whose bool is false when the key already exists, leaving the map untouched. Use insert_or_assign or operator[] if you want to overwrite.'
    }
  ]
};

// =============================================================================
// 6. MODERN C++
// =============================================================================
const modernCpp: CppCategory = {
  id: 'cpp-modern',
  name: 'Modern C++',
  slug: 'cpp-modern',
  description: 'Move semantics, lambdas, optional/variant, and C++20 features',
  icon: 'flash-outline',
  color: '#3498DB',
  colorDark: '#2A7AB8',
  premium: true,

  learnContent: [
    {
      title: 'Move Semantics and Rvalue References',
      content: `Move semantics (C++11) lets objects transfer ownership of their resources instead of copying them. It is the single most-asked modern C++ interview topic.

**Rvalue references:**
- \`T&&\` binds to temporaries (rvalues) - objects about to die
- Overloading on \`const T&\` vs \`T&&\` lets a class copy from lvalues and steal from rvalues

**std::move:**
- Does NOT move anything - it is just a cast to \`T&&\`
- It marks an lvalue as "safe to steal from", enabling the move overload
- After moving, the source is in a valid but unspecified state: you may destroy or reassign it, but should not read its value

**When moves happen automatically:**
- Returning a local by value (and RVO usually elides even the move)
- Passing a temporary to a function
- \`push_back(std::move(x))\`, \`std::swap\`, container reallocation (if the move constructor is \`noexcept\`)

**Classic gotchas:**
- \`return std::move(local);\` is a pessimization - it blocks RVO
- A moved-from \`std::string\` may be empty or may not be - never assume
- Mark move constructors \`noexcept\`: otherwise \`vector\` copies during reallocation to preserve the strong exception guarantee`,
      codeExample: `#include <string>
#include <vector>
#include <utility>
#include <iostream>

class Buffer {
    size_t size_ = 0;
    int* data_ = nullptr;
public:
    explicit Buffer(size_t n) : size_(n), data_(new int[n]) {}
    ~Buffer() { delete[] data_; }

    // Copy: duplicate the resource
    Buffer(const Buffer& other)
        : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // Move: steal the resource, leave source empty. noexcept matters!
    Buffer(Buffer&& other) noexcept
        : size_(other.size_), data_(other.data_) {
        other.size_ = 0;
        other.data_ = nullptr;   // source must be safely destructible
    }

    Buffer& operator=(Buffer other) noexcept {  // copy-and-swap handles both
        std::swap(size_, other.size_);
        std::swap(data_, other.data_);
        return *this;
    }
};

Buffer makeBuffer() {
    Buffer b(1024);
    return b;                    // NRVO: no copy, no move at all
    // return std::move(b);      // WORSE: disables RVO, forces a move
}

int main() {
    std::string s = "a fairly long string that lives on the heap";
    std::vector<std::string> v;

    v.push_back(s);              // copy: s still usable
    v.push_back(std::move(s));   // move: s is now valid-but-unspecified
    s = "reuse is fine";         // assigning a moved-from object is OK

    Buffer a(100);
    Buffer b = std::move(a);     // move ctor: pointer swap, no allocation

    // vector reallocation moves elements ONLY if the move ctor
    // is noexcept - otherwise it copies to stay exception-safe.
    return 0;
}`
    },
    {
      title: 'Lambdas and Captures',
      content: `Lambdas are anonymous function objects. The compiler generates a class with \`operator()\` - understanding that model answers most interview questions about them.

**Capture modes:**
- \`[x]\` capture x by value (copied into the closure at creation time)
- \`[&x]\` capture x by reference (dangles if x dies first!)
- \`[=]\` / \`[&]\` capture everything used, by value / by reference
- \`[this]\` capture the enclosing object pointer; \`[*this]\` (C++17) copies the object
- Init captures (C++14): \`[p = std::move(ptr)]\` - move things into the closure

**Key facts:**
- By-value captures are \`const\` inside the lambda unless you add \`mutable\`
- A capture-less lambda converts to a plain function pointer
- Generic lambdas (C++14): \`auto\` parameters make \`operator()\` a template
- Every lambda has a unique, unnamed type - store them in \`auto\` or \`std::function\`

**The dangling-capture bug:**
Capturing a local by reference and letting the lambda outlive the scope (async callbacks, stored handlers) is the classic production bug. Rule of thumb: capture by value (or move) anything that crosses an async boundary.`,
      codeExample: `#include <algorithm>
#include <functional>
#include <memory>
#include <vector>
#include <iostream>

int main() {
    int threshold = 5;
    std::vector<int> v{2, 7, 4, 9, 1};

    // By value: closure owns a copy made right now
    auto isBig = [threshold](int x) { return x > threshold; };
    threshold = 100;                     // does NOT affect isBig
    auto n = std::count_if(v.begin(), v.end(), isBig);  // counts > 5

    // By reference: sees live updates, but must not outlive threshold
    auto isBigNow = [&threshold](int x) { return x > threshold; };

    // mutable: lets the lambda modify its own by-value copies
    auto counter = [count = 0]() mutable { return ++count; };
    counter(); counter();
    std::cout << counter() << "\\n";     // 3

    // Init capture: move a unique_ptr into the closure (C++14)
    auto ptr = std::make_unique<int>(42);
    auto owner = [p = std::move(ptr)]() { return *p; };

    // Generic lambda: operator() is a template (C++14)
    auto printAll = [](const auto& container) {
        for (const auto& e : container) std::cout << e << ' ';
        std::cout << "\\n";
    };
    printAll(v);

    // Capture-less lambda decays to a function pointer
    int (*fp)(int) = [](int x) { return x * 2; };

    // DANGLING BUG: reference capture escaping its scope
    std::function<int()> stale;
    {
        int local = 10;
        // stale = [&local] { return local; };  // UB when called later
        stale = [local] { return local; };      // safe: copied
    }
    std::cout << stale() << "\\n";              // 10
    return 0;
}`
    },
    {
      title: 'std::optional, std::variant, std::any',
      content: `C++17 added three vocabulary types that replace error-prone conventions like sentinel values, raw unions, and \`void*\`.

**std::optional<T>:**
- "Maybe a T" - replaces magic values (-1, nullptr, empty string)
- \`has_value()\` / \`operator bool\`, \`value()\` (throws \`bad_optional_access\`), \`value_or(default)\`
- Dereferencing an empty optional with \`*\` is undefined behavior, not a throw
- Ideal return type for lookups and parsers

**std::variant<Ts...>:**
- A type-safe union: holds exactly one of the listed types, and knows which
- \`std::visit\` dispatches on the active alternative; \`std::get_if\` returns a pointer or nullptr
- Powers sum-type modeling (like Kotlin sealed classes or Rust enums)
- With \`std::visit\` and an overloaded visitor, the compiler can enforce handling every alternative

**std::any:**
- Holds any copyable type, type-erased; retrieved with \`std::any_cast\`
- Use rarely - it trades compile-time safety for flexibility. Prefer \`variant\` when the set of types is known

**Interview angle:**
"How would you return a value that might not exist?" - \`optional\`. "How do you model a message that is one of N shapes?" - \`variant\` + \`visit\`.`,
      codeExample: `#include <optional>
#include <variant>
#include <any>
#include <string>
#include <iostream>

// optional: honest signature for "may fail"
std::optional<int> parseInt(const std::string& s) {
    try { return std::stoi(s); }
    catch (...) { return std::nullopt; }
}

// variant: a network event is exactly one of these
struct Connected { std::string host; };
struct Data      { std::string payload; };
struct Error     { int code; };
using Event = std::variant<Connected, Data, Error>;

// Overload pattern for exhaustive visitation
template <class... Fs> struct overloaded : Fs... { using Fs::operator()...; };
template <class... Fs> overloaded(Fs...) -> overloaded<Fs...>;  // C++17 CTAD

void handle(const Event& e) {
    std::visit(overloaded{
        [](const Connected& c) { std::cout << "up: "  << c.host << "\\n"; },
        [](const Data& d)      { std::cout << "got: " << d.payload << "\\n"; },
        [](const Error& err)   { std::cout << "err "  << err.code << "\\n"; }
    }, e);   // forgetting a case = compile error, not a runtime bug
}

int main() {
    // optional usage
    if (auto n = parseInt("42")) {
        std::cout << *n + 1 << "\\n";        // 43
    }
    int safe = parseInt("oops").value_or(0); // 0, no throw

    // variant usage
    Event e = Data{"hello"};
    handle(e);
    if (auto* d = std::get_if<Data>(&e)) {   // pointer or nullptr
        std::cout << d->payload.size() << "\\n";
    }

    // any: type-erased, checked at runtime
    std::any box = std::string("boxed");
    try {
        std::cout << std::any_cast<std::string>(box) << "\\n";
    } catch (const std::bad_any_cast&) { /* wrong type */ }
    return 0;
}`
    },
    {
      title: 'Structured Bindings and if-init',
      content: `C++17 added two small features that dramatically clean up everyday code - and interviewers notice when you use them naturally.

**Structured bindings:**
\`auto [a, b] = expr;\` unpacks tuples, pairs, arrays, and plain structs with public members into named variables.

- \`auto [key, value]\` when iterating a map - no more \`it->first\` / \`it->second\`
- \`auto& [k, v]\` binds by reference to avoid copies (and to mutate)
- Works with functions returning \`std::pair\`/\`std::tuple\`, like \`map::insert\`
- The names are bindings into one hidden object, not independent variables

**if with initializer:**
\`if (auto it = m.find(k); it != m.end()) { ... }\`

- Scopes the variable to the if/else only - no leaking into the enclosing block
- Combines perfectly with structured bindings for insert-and-check patterns
- \`switch\` supports the same initializer form

**Why interviewers care:**
These features remove the two classic map idiom warts: iterators leaking scope and cryptic \`.first\`/\`.second\` chains. Using them shows you write C++17 as a native language, not C++03 with new syntax bolted on.`,
      codeExample: `#include <map>
#include <tuple>
#include <string>
#include <iostream>

std::tuple<int, int, std::string> stats() {
    return {200, 51, "OK"};
}

struct Rect { int width; int height; };

int main() {
    // Unpack a tuple return
    auto [code, latencyMs, msg] = stats();
    std::cout << code << " " << msg << "\\n";

    // Unpack a plain struct (public members)
    Rect r{800, 600};
    auto [w, h] = r;                       // copies members
    auto& [rw, rh] = r;                    // references members
    rw = 1024;                             // mutates r.width

    std::map<std::string, int> ages{{"ana", 30}, {"bo", 25}};

    // Map iteration: before vs after
    for (const auto& [name, age] : ages) {
        std::cout << name << " is " << age << "\\n";
    }

    // if-init: iterator scoped to the if statement
    if (auto it = ages.find("ana"); it != ages.end()) {
        std::cout << "found " << it->second << "\\n";
    }   // 'it' does not exist here

    // insert returns pair<iterator, bool> - unpack it directly
    if (auto [it, inserted] = ages.insert({"cy", 40}); inserted) {
        std::cout << it->first << " added\\n";
    }

    // insert_or_assign + structured bindings + if-init together
    if (auto [it, isNew] = ages.insert_or_assign("bo", 26); !isNew) {
        std::cout << "updated bo to " << it->second << "\\n";
    }

    // switch with initializer (C++17 too)
    switch (int v = code / 100; v) {
        case 2: std::cout << "success\\n"; break;
        case 5: std::cout << "server error\\n"; break;
        default: break;
    }
    return 0;
}`
    },
    {
      title: 'constexpr and Compile-Time Programming',
      content: `\`constexpr\` moves computation from runtime to compile time. Modern C++ has steadily expanded what can run inside the compiler.

**The keywords:**
- \`constexpr\` variable: a true compile-time constant (implies const)
- \`constexpr\` function: CAN run at compile time when given constant arguments, but also works at runtime - it is a "both worlds" function
- \`consteval\` (C++20): MUST run at compile time - an "immediate function"
- \`constinit\` (C++20): guarantees static initialization, killing the static-init-order fiasco, without making the variable const

**if constexpr (C++17):**
Compile-time branching inside templates. The false branch is discarded entirely - it does not even have to compile for the current type. This replaced piles of SFINAE and tag dispatch.

**What can be constexpr now:**
C++14 allowed loops and local variables; C++20 even allows \`new\`/\`delete\`, \`std::vector\`, and \`std::string\` inside constant evaluation (as long as the memory dies before the result). Most of \`<algorithm>\` is constexpr in C++20.

**Interview framing:**
constexpr = shifting work and error-detection to compile time. UB inside constant evaluation is a compile error - so constexpr tests catch overflow and out-of-bounds bugs the compiler must diagnose.`,
      codeExample: `#include <array>
#include <string_view>
#include <type_traits>
#include <iostream>

// Runs at compile time OR runtime depending on the arguments
constexpr long fib(int n) {
    long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        long next = a + b;
        a = b; b = next;
    }
    return a;
}

static_assert(fib(10) == 55);            // proven at compile time

// Build a lookup table entirely at compile time
constexpr auto makeSquares() {
    std::array<int, 16> t{};
    for (int i = 0; i < 16; ++i) t[i] = i * i;
    return t;
}
constexpr auto SQUARES = makeSquares();  // baked into the binary

// consteval: compile-time ONLY (C++20)
consteval int version() { return 3; }
// int v = version();                    // OK - folds to 3
// int x; version(x);                    // would not compile if runtime-only

// if constexpr: discarded branches never instantiate
template <typename T>
auto describe(const T& value) {
    if constexpr (std::is_pointer_v<T>) {
        return value ? *value : throw "null";  // only compiled for pointers
    } else if constexpr (std::is_arithmetic_v<T>) {
        return value * 2;
    } else {
        return value.size();             // only needs .size() for this branch
    }
}

int main() {
    std::cout << SQUARES[7] << "\\n";    // 49, zero runtime computation

    int runtimeN = 20;
    std::cout << fib(runtimeN) << "\\n"; // same function, runtime execution

    int x = 5;
    std::cout << describe(&x) << " "     // 5   (pointer branch)
              << describe(21) << " "     // 42  (arithmetic branch)
              << describe(std::string_view("hi")) << "\\n";  // 2
    return 0;
}`
    },
    {
      title: 'Ranges and Views (C++20)',
      content: `C++20 Ranges modernize the algorithms library: algorithms take whole containers, and views compose lazy pipelines with the \`|\` operator.

**Range algorithms:**
\`std::ranges::sort(v)\` instead of \`std::sort(v.begin(), v.end())\`. Same algorithms, whole-container syntax, plus projections: \`ranges::sort(people, {}, &Person::age)\` sorts by a member without writing a comparator.

**Views:**
- Lazy: \`views::filter\`, \`views::transform\`, \`views::take\`, \`views::drop\`, \`views::reverse\`, \`views::iota\`
- Compose left-to-right with \`|\`: \`v | views::filter(even) | views::transform(square)\`
- Nothing computes until you iterate - a view is a recipe, not a result
- Views are cheap to copy: they reference the underlying range, they do not own elements

**Key properties:**
- Lazy evaluation means a pipeline over a million elements followed by \`take(5)\` only processes what is needed
- \`views::iota(0)\` is an infinite range - safe only because of laziness
- Views can dangle like \`string_view\`: do not keep a view over a destroyed container
- Materialize with \`std::ranges::to<std::vector>()\` (C++23) or a manual copy

**Interview angle:**
Compare with Java Streams / Kotlin sequences / C# LINQ: same lazy-pipeline idea, but with zero allocation and iterator-level codegen - pipelines typically compile down to the equivalent hand-written loop.`,
      codeExample: `#include <ranges>
#include <algorithm>
#include <vector>
#include <string>
#include <iostream>

struct Person { std::string name; int age; };

int main() {
    namespace views = std::views;

    std::vector<int> v{6, 3, 9, 2, 8, 5, 1};

    // Range algorithm: whole container, no begin/end noise
    std::ranges::sort(v);

    // Projection: sort by a member, no lambda comparator needed
    std::vector<Person> people{{"ana", 34}, {"bo", 21}, {"cy", 28}};
    std::ranges::sort(people, {}, &Person::age);

    // Lazy pipeline: nothing runs until iteration
    auto pipeline = v
        | views::filter([](int x) { return x % 2 == 0; })
        | views::transform([](int x) { return x * x; })
        | views::take(2);

    for (int x : pipeline) {
        std::cout << x << ' ';           // 4 36 (from 2, 6)
    }
    std::cout << "\\n";

    // Infinite range - laziness makes it finite work
    auto firstSquares = views::iota(1)              // 1, 2, 3, ...
        | views::transform([](int x) { return x * x; })
        | views::take(5);                           // 1 4 9 16 25
    for (int s : firstSquares) std::cout << s << ' ';
    std::cout << "\\n";

    // Views over other ranges: keys of a pipeline
    auto adults = people
        | views::filter([](const Person& p) { return p.age >= 25; })
        | views::transform(&Person::name);          // projection as transform
    for (const auto& n : adults) std::cout << n << ' ';  // ana cy
    std::cout << "\\n";

    // DANGLING warning: a view must not outlive its range
    // auto bad = std::vector<int>{1,2,3} | views::take(2); // temporary dies
    return 0;
}`
    }
  ],

  visualizations: [
    {
      title: 'Move vs Copy',
      description: 'What happens to the source object under copy and move construction',
      nodes: [
        { id: 'src', label: 'source object\n(owns heap buffer)', x: 190, y: 40, type: 'primary' },
        { id: 'copy', label: 'copy ctor\nconst T&', x: 80, y: 120, type: 'secondary' },
        { id: 'move', label: 'move ctor\nT&&', x: 300, y: 120, type: 'secondary' },
        { id: 'dup', label: 'new buffer\nallocated + copied', x: 70, y: 200, type: 'warning' },
        { id: 'steal', label: 'pointer stolen\nsource nulled', x: 300, y: 200, type: 'primary' },
        { id: 'state', label: 'source: valid but\nunspecified', x: 190, y: 260, type: 'warning' }
      ],
      edges: [
        { from: 'src', to: 'copy', label: 'lvalue' },
        { from: 'src', to: 'move', label: 'std::move / temp' },
        { from: 'copy', to: 'dup', label: 'O(n)' },
        { from: 'move', to: 'steal', label: 'O(1)' },
        { from: 'steal', to: 'state' }
      ]
    },
    {
      title: 'Lazy Ranges Pipeline',
      description: 'How C++20 views compose without computing until iteration',
      nodes: [
        { id: 'vec', label: 'vector\n{6,3,9,2,8}', x: 60, y: 60, type: 'primary' },
        { id: 'filter', label: 'views::filter\n(even)', x: 190, y: 60, type: 'secondary' },
        { id: 'trans', label: 'views::transform\n(square)', x: 320, y: 60, type: 'secondary' },
        { id: 'take', label: 'views::take(2)\nstops early', x: 250, y: 160, type: 'secondary' },
        { id: 'iter', label: 'for loop\npulls values', x: 110, y: 160, type: 'primary' },
        { id: 'lazy', label: 'no work happens\nuntil iteration', x: 180, y: 240, type: 'warning' }
      ],
      edges: [
        { from: 'vec', to: 'filter', label: '|' },
        { from: 'filter', to: 'trans', label: '|' },
        { from: 'trans', to: 'take', label: '|' },
        { from: 'take', to: 'iter', label: 'pull' },
        { from: 'iter', to: 'lazy' }
      ]
    }
  ],

  flashcards: [
    { id: 'mc1', front: 'What does std::move actually do?', back: 'Nothing at runtime - it is just a cast to an rvalue reference (T&&). It marks an object as safe to steal from so overload resolution picks the move constructor/assignment.' },
    { id: 'mc2', front: 'What state is an object in after being moved from?', back: 'Valid but unspecified. You may destroy it, assign to it, or call methods with no preconditions - but you should not rely on its value.' },
    { id: 'mc3', front: 'Why should move constructors be marked noexcept?', back: 'std::vector only moves elements during reallocation if the move constructor is noexcept; otherwise it copies to preserve the strong exception guarantee.' },
    { id: 'mc4', front: 'Why is "return std::move(local);" a pessimization?', back: 'It disables RVO/copy elision. Returning the local by name lets the compiler construct it directly in the caller - zero copies AND zero moves.' },
    { id: 'mc5', front: 'Difference between [=] and [&] lambda captures?', back: '[=] copies every used variable into the closure at creation time; [&] captures by reference - the lambda sees live values but dangles if it outlives them.' },
    { id: 'mc6', front: 'What does the mutable keyword do on a lambda?', back: 'Allows the lambda to modify its own by-value captured copies. Without it, operator() is const and by-value captures are read-only.' },
    { id: 'mc7', front: 'What is an init capture and why does it matter?', back: 'C++14 syntax [p = std::move(ptr)] that creates a closure member from any expression - the only way to move a unique_ptr into a lambda.' },
    { id: 'mc8', front: 'When can a lambda be converted to a function pointer?', back: 'Only when it captures nothing. A capture-less lambda has no state, so it can decay to a plain function pointer.' },
    { id: 'mc9', front: 'std::optional vs returning a sentinel like -1?', back: 'optional makes "no value" explicit in the type system: the caller must check before use, and value_or gives a safe default. Sentinels are invisible conventions that silently break.' },
    { id: 'mc10', front: 'How is std::variant better than a raw union?', back: 'It tracks which alternative is active, calls the correct destructor, and std::visit gives type-safe (and exhaustive) dispatch. Raw unions do none of that.' },
    { id: 'mc11', front: 'What does "if (auto it = m.find(k); it != m.end())" give you over the classic form?', back: 'The C++17 if-init statement scopes the iterator to the if/else block only - no variable leaking into the surrounding scope.' },
    { id: 'mc12', front: 'constexpr function vs consteval function?', back: 'constexpr: may run at compile time or runtime depending on the arguments. consteval (C++20): must run at compile time; calling it with runtime values is a compile error.' },
    { id: 'mc13', front: 'What is the key difference between if constexpr and regular if in a template?', back: 'if constexpr discards the untaken branch at compile time - it never needs to be valid for the current type. A regular if compiles both branches for every instantiation.' },
    { id: 'mc14', front: 'Why can C++20 views iterate an infinite range like views::iota(0)?', back: 'Views are lazy - they compute elements only when pulled. Combined with views::take(n), only n elements are ever generated.' },
    { id: 'mc15', front: 'What does C++17 guarantee about copy elision?', back: 'Initializing from a prvalue (T t = T(); or return T();) constructs the object in place with no copy or move at all - the type does not even need a move constructor. Named return value optimization (returning a local variable) is still only permitted, not required.' },
    { id: 'mc16', front: 'When do you use std::move and when std::forward?', back: 'std::move when you know you are done with an object and want to unconditionally treat it as an rvalue. std::forward<T> only on a forwarding reference (T&&) to pass the argument along with the value category the caller used.' },
    { id: 'mc17', front: 'What does std::function cost compared to a template or auto parameter?', back: 'It type-erases the callable: an indirect call that blocks inlining and, for callables larger than its small-buffer, a heap allocation. Use a template parameter or auto for hot paths and std::function only when you need to store heterogeneous callables.' },
    { id: 'mc18', front: 'What is a generic lambda?', back: 'A lambda with auto parameters: [](auto a, auto b) { return a + b; }. Its operator() is a member template instantiated per argument type, so one closure works for ints, doubles, and strings without writing a template by hand.' },
    { id: 'mc19', front: 'Why is capturing this in a lambda risky, and what does [*this] do?', back: '[this] (and [=] before C++20) captures the pointer only; if the object is destroyed before the lambda runs - common with callbacks - every member access dangles. [*this] (C++17) copies the whole object into the closure.' },
    { id: 'mc20', front: 'Do structured bindings copy the source object?', back: 'auto [a, b] = pair; copies pair into a hidden variable and the names alias its members - modifying a does not touch the original. auto& [a, b] = pair; binds to the original, and const auto& avoids the copy for read-only use.' },
    { id: 'mc21', front: 'std::string_view vs const std::string& as a parameter?', back: 'string_view accepts std::string, string literals, and substrings without any allocation or copy, and substr is O(1). Prefer it for read-only inputs. Caveats: it is not null-terminated (do not pass .data() to C APIs) and must not outlive the source.' },
    { id: 'mc22', front: 'When would you use std::any instead of std::variant?', back: 'When the set of possible types is open, e.g. arbitrary user data attached to a framework object. variant is closed and type-safe with std::visit; any needs any_cast with the exact type and may heap-allocate. Reach for variant by default.' },
    { id: 'mc23', front: 'What happens when a function declared noexcept throws?', back: 'std::terminate is called immediately - the exception does not propagate and stack unwinding may not happen. noexcept is a hard promise used by the optimizer and by std::vector to choose moves, not documentation.' },
    { id: 'mc24', front: 'What do C++20 modules fix compared to headers?', back: 'A module is compiled once and imported as a binary interface, not textually pasted into every user. Macros do not leak out, declaration order inside the importer does not matter, and builds avoid reparsing the same headers thousands of times.' },
    { id: 'mc25', front: 'What does [[nodiscard]] do?', back: 'Makes the compiler warn when a function\'s return value is ignored. Use it on functions whose result is the whole point (empty(), error codes, factory functions) to catch bugs like calling v.empty() intending to clear.' },
    { id: 'mc26', front: 'What is std::exchange and why is it handy in move constructors?', back: 'std::exchange(obj, newValue) sets obj to newValue and returns the old value. Widget(Widget&& o) : ptr(std::exchange(o.ptr, nullptr)) steals the pointer and nulls the source in one expression, leaving the moved-from object safely empty.' },
    { id: 'mc27', front: 'What is decltype(auto) for?', back: 'A return type or variable that preserves references and constness exactly as decltype would, where plain auto would strip them. A forwarding wrapper decltype(auto) get() { return f(); } returns T& if f returns T&, and T if f returns by value.' },
    { id: 'mc28', front: 'What are designated initializers (C++20)?', back: 'Aggregate initialization by member name: Config c{.host = "localhost", .port = 8080};. Members must appear in declaration order; omitted ones are value-initialized. They make call sites self-documenting and catch reordered fields.' },
    { id: 'mc29', front: 'What do C++20 ranges algorithms add over the classic iterator-pair versions?', back: 'They take a whole range (std::ranges::sort(v)), are constrained by concepts for readable errors, and accept projections: ranges::sort(people, {}, &Person::age) sorts by a member without writing a comparator.' },
    { id: 'mc30', front: 'What is the immediately-invoked lambda idiom for const initialization?', back: 'const auto config = [&] { Config c; ... complex setup ...; return c; }(); lets a variable be const even when its value needs multiple statements to compute, instead of a mutable variable that is only assigned once.' }
  ],

  quizQuestions: [
    {
      id: 'mcq1',
      question: 'What does std::move(x) do at runtime?',
      options: ['Copies x into a temporary', 'Immediately destroys x', 'Nothing - it is a compile-time cast to T&& that enables move overloads', 'Zeroes out x\'s memory'],
      correctAnswer: 2,
      explanation: 'std::move is equivalent to static_cast<T&&>(x). It generates no code itself; it just changes which overload is selected.'
    },
    {
      id: 'mcq2',
      question: 'Why does std::vector copy instead of move elements during reallocation for some types?',
      options: ['The element\'s move constructor is not noexcept, so vector copies to keep the strong exception guarantee', 'Moving is always slower than copying', 'vector never moves elements', 'The elements are const'],
      correctAnswer: 0,
      explanation: 'If a move could throw mid-reallocation, the vector would be left half-moved. With a noexcept move constructor, vector moves safely.'
    },
    {
      id: 'mcq3',
      question: 'A lambda captures a local variable by reference and is invoked after the enclosing function returns. What happens?',
      options: ['The lambda holds a copy, so it works', 'The compiler refuses to compile it', 'The reference is automatically promoted to a value', 'Undefined behavior - the captured reference dangles'],
      correctAnswer: 3,
      explanation: 'Reference captures do not extend lifetimes. Once the local dies, invoking the lambda reads freed stack memory - capture by value across async boundaries.'
    },
    {
      id: 'mcq4',
      question: 'What does *opt do when opt is an empty std::optional?',
      options: ['Throws std::bad_optional_access', 'Undefined behavior - only value() checks and throws', 'Returns a default-constructed T', 'Returns nullptr'],
      correctAnswer: 1,
      explanation: 'operator* on an empty optional is UB for performance. value() is the checked accessor that throws bad_optional_access.'
    },
    {
      id: 'mcq5',
      question: 'Which C++17 feature lets you write: for (const auto& [key, value] : myMap)?',
      options: ['Structured bindings', 'Template argument deduction', 'std::tie', 'Fold expressions'],
      correctAnswer: 0,
      explanation: 'Structured bindings unpack pairs, tuples, arrays, and plain structs into named variables - here each map entry\'s .first and .second.'
    },
    {
      id: 'mcq6',
      question: 'What is the difference between constexpr and consteval functions?',
      options: ['They are synonyms', 'consteval is the C++11 spelling of constexpr', 'constexpr may run at compile time or runtime; consteval must run at compile time', 'constexpr only works on variables'],
      correctAnswer: 2,
      explanation: 'A constexpr function is dual-use. consteval (C++20) marks an immediate function - any call that cannot be evaluated at compile time is ill-formed.'
    },
    {
      id: 'mcq7',
      question: 'In v | views::filter(f) | views::transform(g), when does f actually execute?',
      options: ['Immediately when the pipeline is built', 'Lazily, only when the resulting view is iterated', 'On a background thread', 'At compile time'],
      correctAnswer: 1,
      explanation: 'Views are lazy recipes. Building the pipeline does no work; elements are filtered and transformed one at a time as the consumer pulls them.'
    },
    {
      id: 'mcq8',
      question: 'How do you move a std::unique_ptr into a lambda closure?',
      options: ['[ptr] - by-value capture moves automatically', '[&ptr] then std::move inside', 'unique_ptr cannot be captured', 'Init capture: [p = std::move(ptr)] (C++14)'],
      correctAnswer: 3,
      explanation: 'By-value capture copies, and unique_ptr is not copyable. Init captures let you initialize a closure member with an arbitrary expression, including a move.'
    },
    {
      id: 'mcq9',
      question: 'What advantage does std::visit with an exhaustive visitor give over checking variant alternatives manually?',
      options: ['The compiler errors if any alternative is unhandled', 'It is always O(1) while get_if is O(n)', 'It automatically adds new alternatives', 'It works on raw unions too'],
      correctAnswer: 0,
      explanation: 'std::visit requires the visitor to be invocable with every alternative. Add a new type to the variant and every non-exhaustive visit fails to compile - like an exhaustive when over a sealed class.'
    },
    {
      id: 'mcq10',
      question: 'const std::string src = "data"; std::string dst = std::move(src); What happens?',
      options: ['dst steals src\'s buffer; src is empty', 'dst is copy-constructed - const std::string&& cannot bind to the move constructor', 'Compile error: cannot move a const object', 'Undefined behavior'],
      correctAnswer: 1,
      explanation: 'std::move yields const std::string&&, which cannot bind to std::string&& but happily binds to const std::string&. The move silently becomes a copy - a common performance bug.'
    },
    {
      id: 'mcq11',
      question: 'struct NoMove { NoMove() = default; NoMove(const NoMove&) = delete; NoMove(NoMove&&) = delete; }; NoMove make() { return NoMove(); } NoMove n = make(); In C++17, what happens?',
      options: ['Compile error: no copy or move constructor', 'Compiles only with -O2 where the compiler elides', 'Compiles: guaranteed copy elision constructs n directly from the prvalue', 'Runtime error'],
      correctAnswer: 2,
      explanation: 'Since C++17, initializing from a prvalue is not a copy or move at all, so deleted move/copy constructors are irrelevant. Returning a NAMED local would still require a move constructor.'
    },
    {
      id: 'mcq12',
      question: 'A hot inner loop calls a std::function<int(int)> instead of a lambda passed as a template parameter. What is the likely cost?',
      options: ['An indirect call through type erasure that cannot be inlined (plus a possible heap allocation when the callable was stored)', 'None - std::function is a zero-cost abstraction', 'A copy of the lambda on every call', 'A dynamic_cast on every call'],
      correctAnswer: 0,
      explanation: 'std::function hides the callable\'s type behind a virtual-like call, so the optimizer cannot inline it into the loop. A template parameter keeps the concrete type and inlines fully.'
    },
    {
      id: 'mcq13',
      question: 'class Widget { void start() { timer.onFire([this] { count++; }); } }; The Widget is destroyed before the timer fires. What happens?',
      options: ['The lambda holds a copy of the Widget, so it is safe', 'The lambda is automatically cancelled', 'Compile error: this cannot be captured', 'Undefined behavior: the captured this pointer dangles'],
      correctAnswer: 3,
      explanation: 'Capturing this stores only a pointer. Either ensure the callback is cancelled in the destructor, capture a weak_ptr and lock it inside the lambda, or capture [*this] if a copy is acceptable.'
    },
    {
      id: 'mcq14',
      question: 'void f() noexcept { throw std::runtime_error("x"); } is called inside a try/catch block. What happens?',
      options: ['The catch block handles it normally', 'std::terminate is called', 'Compile error: noexcept functions cannot contain throw', 'The exception is converted to std::bad_exception'],
      correctAnswer: 1,
      explanation: 'noexcept is enforced at runtime: an exception escaping the function calls std::terminate immediately. The compiler only warns (if at all) about a throw inside a noexcept function.'
    },
    {
      id: 'mcq15',
      question: 'std::pair<int, int> p{1, 2}; auto [a, b] = p; a = 10; What is p.first afterwards?',
      options: ['10', 'Undefined', '1 - a aliases a member of a hidden copy of p', 'Compile error: structured bindings are const'],
      correctAnswer: 2,
      explanation: 'auto [a, b] = p copies p into an unnamed object and binds a and b to that copy\'s members. Write auto& [a, b] = p; to bind to p itself.'
    },
    {
      id: 'mcq16',
      question: 'void greet(std::string_view name); greet("world"); What allocation occurs?',
      options: ['None - the view points directly at the string literal', 'A temporary std::string is heap-allocated', 'The literal is copied onto the stack', 'Compile error: cannot convert const char* to string_view'],
      correctAnswer: 0,
      explanation: 'string_view has a constructor from const char* that computes the length and stores the pointer. With const std::string& you would construct a temporary string instead.'
    },
    {
      id: 'mcq17',
      question: 'template<class T> void store(T&& item) { items.push_back(std::move(item)); } std::string s = "keep"; store(s); What is wrong?',
      options: ['Nothing - this is idiomatic', 'Compile error: cannot move from T&&', 'items gets a copy because move on T&& is ignored', 'The caller\'s s is silently moved-from even though it was passed as an lvalue; std::forward<T> should be used'],
      correctAnswer: 3,
      explanation: 'std::move unconditionally casts to rvalue, so an lvalue argument is stolen. std::forward<T>(item) moves only when the caller passed an rvalue.'
    },
    {
      id: 'mcq18',
      question: 'int x = 5; auto f = [x]() mutable { return ++x; }; f(); int r = f(); What are r and x?',
      options: ['r == 6, x == 6', 'r == 7, x == 5', 'r == 7, x == 7', 'Compile error: cannot modify a captured variable'],
      correctAnswer: 1,
      explanation: 'The closure holds its own copy of x, and mutable lets calls modify that copy, which persists between calls (6, then 7). The original x is untouched.'
    },
    {
      id: 'mcq19',
      question: 'Which is a real benefit of C++20 modules over header files?',
      options: ['Templates no longer need to be visible at the point of use', 'Modules remove the need for a linker', 'Macros defined inside a module do not leak to importers, and the module is compiled once instead of reparsed per includer', 'Modules make all functions inline'],
      correctAnswer: 2,
      explanation: 'A module interface is compiled to a binary form and imported; the preprocessor state of the module does not affect the importer. Templates are still exported through the module interface and instantiated by users.'
    },
    {
      id: 'mcq20',
      question: 'Buffer(Buffer&& o) noexcept : data(std::exchange(o.data, nullptr)), size(std::exchange(o.size, 0)) {} What does std::exchange accomplish here?',
      options: ['Takes each member from the source and resets the source to a safe empty state in one expression', 'Swaps the two objects', 'Deep-copies the buffer', 'Marks the source as destroyed so its destructor is skipped'],
      correctAnswer: 0,
      explanation: 'exchange returns the old value while storing the new one. The moved-from Buffer ends with data == nullptr and size == 0, so its destructor is a harmless no-op.'
    }
  ]
};

// =============================================================================
// 7. CONCURRENCY & PERFORMANCE
// =============================================================================
const concurrencyPerformance: CppCategory = {
  id: 'cpp-concurrency',
  name: 'Concurrency & Performance',
  slug: 'cpp-concurrency',
  description: 'Threads, mutexes, atomics, and writing fast C++',
  icon: 'speedometer-outline',
  color: '#E74C3C',
  colorDark: '#C0392B',
  premium: true,

  learnContent: [
    {
      title: 'Threads and jthread',
      content: `\`std::thread\` (C++11) runs a callable on a new OS thread. \`std::jthread\` (C++20) improves it with automatic joining and cooperative cancellation.

**std::thread Rules:**
- You must call \`join()\` or \`detach()\` before the thread object is destroyed
- Destroying a joinable \`std::thread\` calls \`std::terminate()\`
- Threads are move-only: ownership transfers with \`std::move\`
- Arguments are copied into thread storage; use \`std::ref\` to pass by reference

**std::jthread Improvements:**
- Destructor automatically requests stop and joins - no terminate surprises
- Built-in \`std::stop_token\` for cooperative cancellation
- The callable can take a \`stop_token\` as its first parameter

**Interview Points:**
- Explain why detach is dangerous: the thread may outlive the data it references
- Know that exceptions escaping a thread function call \`std::terminate()\`
- \`std::thread::hardware_concurrency()\` hints at how many threads make sense
- Prefer higher-level tools (async, thread pools) over raw threads in application code`,
      codeExample: `#include <thread>
#include <iostream>
#include <vector>

void worker(int id, int& sharedCounter) {
    std::cout << "Worker " << id << " running\\n";
    ++sharedCounter;  // Unsafe without a mutex - shown in later topics
}

int main() {
    int counter = 0;

    // std::thread: must join or detach
    std::thread t1(worker, 1, std::ref(counter));  // std::ref for references
    t1.join();  // Forgetting this -> std::terminate on destruction

    // C++20 jthread: joins automatically in its destructor
    {
        std::jthread t2(worker, 2, std::ref(counter));
    }  // t2 joined here - no terminate risk

    // jthread with cooperative cancellation
    std::jthread t3([](std::stop_token st) {
        while (!st.stop_requested()) {
            // do periodic work, check the token
        }
    });
    t3.request_stop();  // Also called automatically by destructor

    // Threads are move-only
    std::thread t4(worker, 4, std::ref(counter));
    std::thread t5 = std::move(t4);  // t4 is now empty
    t5.join();

    // Spawn one thread per core
    unsigned n = std::thread::hardware_concurrency();
    std::vector<std::jthread> pool;
    for (unsigned i = 0; i < n; ++i) {
        pool.emplace_back([] { /* work */ });
    }
    return 0;  // all jthreads join automatically
}`
    },
    {
      title: 'Mutexes and Locks',
      content: `A mutex serializes access to shared data. Modern C++ style: never call \`lock()\`/\`unlock()\` manually - use RAII lock wrappers so unlock happens even when exceptions are thrown.

**The Lock Wrappers:**
- \`std::lock_guard\` - simplest: locks in constructor, unlocks in destructor. No extra features
- \`std::unique_lock\` - flexible: deferred locking, manual unlock/relock, movable, required by condition variables
- \`std::scoped_lock\` (C++17) - locks multiple mutexes at once, deadlock-free. The modern default
- \`std::shared_mutex\` + \`std::shared_lock\` - many readers OR one writer

**Deadlock Avoidance:**
- Deadlock needs two threads acquiring two locks in opposite orders
- Fix 1: always acquire locks in a consistent global order
- Fix 2: acquire both atomically with \`std::scoped_lock(m1, m2)\`
- Fix 3: reduce lock scope so you never hold two at once

**Interview Points:**
- Keep critical sections small: never do I/O or call unknown code while holding a lock
- A mutex protects data, not code - document which data each mutex guards
- \`std::recursive_mutex\` exists but is usually a design smell
- Lock contention, not locking itself, is what kills performance`,
      codeExample: `#include <mutex>
#include <shared_mutex>
#include <map>
#include <string>

class Inventory {
    mutable std::shared_mutex mtx_;
    std::map<std::string, int> stock_;
public:
    // Writer: exclusive lock
    void add(const std::string& item, int qty) {
        std::scoped_lock lock(mtx_);        // C++17, CTAD infers type
        stock_[item] += qty;
    }
    // Reader: shared lock - many readers can run concurrently
    int count(const std::string& item) const {
        std::shared_lock lock(mtx_);
        auto it = stock_.find(item);
        return it == stock_.end() ? 0 : it->second;
    }
};

struct Account {
    std::mutex mtx;
    double balance = 0;
};

// DEADLOCK RISK: transfer(a, b) and transfer(b, a) lock in opposite order
void transferBad(Account& from, Account& to, double amt) {
    std::lock_guard l1(from.mtx);
    std::lock_guard l2(to.mtx);   // Thread 2 may hold this and wait for l1
    from.balance -= amt;
    to.balance += amt;
}

// FIX: scoped_lock acquires both atomically (deadlock-avoidance algorithm)
void transferGood(Account& from, Account& to, double amt) {
    std::scoped_lock lock(from.mtx, to.mtx);
    from.balance -= amt;
    to.balance += amt;
}

// unique_lock: deferred locking + manual control
void deferred(std::mutex& m) {
    std::unique_lock lock(m, std::defer_lock);  // not locked yet
    // ... prepare work without the lock ...
    lock.lock();
    // critical section
    lock.unlock();   // release early, before expensive non-shared work
}`
    },
    {
      title: 'Condition Variables',
      content: `A condition variable lets a thread sleep until another thread signals that some condition may now be true. It is the standard way to build producer-consumer queues.

**The Three Ingredients:**
- A \`std::mutex\` protecting the shared state
- A predicate over that state (e.g. "queue is not empty")
- A \`std::condition_variable\` to wait on and notify

**Why the Predicate Loop Matters:**
- Spurious wakeups: \`wait()\` can return without any notify - the predicate re-check handles this
- Lost wakeups: if you check the condition without the lock, a notify can slip between check and wait
- Always use \`cv.wait(lock, predicate)\` - it loops for you

**Waiting Mechanics:**
- \`wait()\` atomically unlocks the mutex and sleeps; on wake it relocks before returning
- Requires \`std::unique_lock\` (not \`lock_guard\`) because it must unlock/relock
- \`notify_one()\` wakes one waiter; \`notify_all()\` wakes all - use \`notify_all\` when waiters have different predicates

**Interview Points:**
- Modify the shared state while holding the mutex; notifying can be done after unlocking
- C++20 alternatives: \`std::counting_semaphore\`, \`std::latch\`, \`std::barrier\`, and \`atomic::wait\` cover many former CV use cases more simply`,
      codeExample: `#include <condition_variable>
#include <mutex>
#include <queue>
#include <optional>

template <typename T>
class BlockingQueue {
    std::mutex mtx_;
    std::condition_variable cv_;
    std::queue<T> q_;
    bool closed_ = false;
public:
    void push(T value) {
        {
            std::lock_guard lock(mtx_);
            q_.push(std::move(value));
        }                       // unlock BEFORE notify: waiter wakes without blocking
        cv_.notify_one();
    }

    // Blocks until an item is available or the queue is closed
    std::optional<T> pop() {
        std::unique_lock lock(mtx_);  // unique_lock required by wait()
        // Predicate form: loops internally, immune to spurious wakeups
        cv_.wait(lock, [this] { return !q_.empty() || closed_; });
        if (q_.empty()) return std::nullopt;  // closed and drained
        T value = std::move(q_.front());
        q_.pop();
        return value;
    }

    void close() {
        {
            std::lock_guard lock(mtx_);
            closed_ = true;
        }
        cv_.notify_all();  // every waiter must re-check its predicate
    }
};

// Timed wait: returns false if the predicate is still false after 100ms
bool tryWait(std::condition_variable& cv, std::unique_lock<std::mutex>& lk,
             bool& ready) {
    using namespace std::chrono_literals;
    return cv.wait_for(lk, 100ms, [&] { return ready; });
}`
    },
    {
      title: 'Atomics and the Memory Model',
      content: `\`std::atomic<T>\` gives indivisible reads/writes and, crucially, controls how memory operations become visible across threads. The memory ordering arguments are what senior interviews probe.

**The Orderings:**
- \`memory_order_seq_cst\` (default): a single global order of all seq_cst operations. Easiest to reason about, sometimes slower (full fences on some architectures)
- \`memory_order_acquire\` (loads) / \`memory_order_release\` (stores): a release store synchronizes-with an acquire load that reads it - everything written before the release is visible after the acquire
- \`memory_order_relaxed\`: atomicity only, no ordering guarantees. Fine for counters where you only need the final total

**Mental Model for Acquire-Release:**
Release is "publish": all my prior writes go out with this store. Acquire is "subscribe": after reading that store, I see all those writes. This is exactly how a mutex works - unlock is a release, lock is an acquire.

**Key Facts:**
- Atomics prevent data races on that variable AND establish happens-before edges for other data
- \`compare_exchange_weak/strong\` is the primitive behind lock-free structures; weak may fail spuriously so it belongs in loops
- \`is_lock_free()\` tells you if the type uses real atomic instructions or a hidden lock
- \`volatile\` is NOT for threading in C++ - it does not prevent races or provide ordering

**Interview Points:**
- Default to seq_cst; use acquire/release only with a measured need and a comment
- Classic pattern: relaxed counter increments, acquire/release flag publication`,
      codeExample: `#include <atomic>
#include <thread>
#include <cassert>

// Pattern 1: relaxed counter - only the final sum matters
std::atomic<int> hits{0};
void record() {
    hits.fetch_add(1, std::memory_order_relaxed);  // no ordering needed
}

// Pattern 2: acquire/release publication of non-atomic data
int payload = 0;                    // plain int - protected by the flag
std::atomic<bool> ready{false};

void producer() {
    payload = 42;                                   // A: happens before B
    ready.store(true, std::memory_order_release);   // B: publish
}

void consumer() {
    while (!ready.load(std::memory_order_acquire))  // C: subscribe
        ;
    // C read B's value, so A is visible here: guaranteed, not luck
    assert(payload == 42);
}

// Pattern 3: compare_exchange loop (lock-free max)
std::atomic<int> maxSeen{0};
void observe(int value) {
    int cur = maxSeen.load(std::memory_order_relaxed);
    // weak may fail spuriously -> always retry in a loop
    while (value > cur &&
           !maxSeen.compare_exchange_weak(cur, value,
                                          std::memory_order_relaxed)) {
        // cur was updated with the latest value; loop re-checks
    }
}

int main() {
    std::jthread t1(producer);
    std::jthread t2(consumer);

    // seq_cst by default: simplest correct choice
    std::atomic<int> x{0};
    x.store(1);          // seq_cst store
    int v = x.load();    // seq_cst load
    return v - 1;
}`
    },
    {
      title: 'async, Futures, and Promises',
      content: `Futures move a single value (or exception) from one thread to another, exactly once. They are the standard "get a result back from background work" mechanism.

**The Pieces:**
- \`std::async\` - runs a callable, returns a \`std::future\` for its result
- \`std::future<T>\` - one-shot handle: \`get()\` blocks, returns the value, and can only be called once
- \`std::promise<T>\` - the producing side when you manage the thread yourself: \`set_value\` / \`set_exception\`
- \`std::packaged_task\` - wraps a callable so its return value feeds a future; useful for thread pools
- \`std::shared_future\` - copyable, many consumers can each call \`get()\`

**Launch Policies:**
- \`std::launch::async\` - guaranteed new thread
- \`std::launch::deferred\` - runs lazily on the calling thread at \`get()\`
- Default is async|deferred: the implementation chooses - specify explicitly in real code

**The Famous Gotcha:**
A future returned by \`std::async\` has a blocking destructor: it waits for the task. Ignoring the return value makes the "async" call effectively synchronous.

**Interview Points:**
- Exceptions thrown in the task are captured and rethrown from \`get()\` - clean cross-thread error propagation
- Futures are one-shot; for streams of values you need queues or coroutines
- \`wait_for\`/\`wait_until\` allow polling with timeouts`,
      codeExample: `#include <future>
#include <thread>
#include <stdexcept>
#include <iostream>

int expensiveComputation(int input) {
    if (input < 0) throw std::invalid_argument("negative input");
    return input * input;
}

int main() {
    // std::async with explicit policy
    std::future<int> f = std::async(std::launch::async,
                                    expensiveComputation, 12);
    // ... do other work concurrently ...
    std::cout << f.get() << "\\n";   // blocks, prints 144; get() only once

    // Exception propagation: thrown in worker, rethrown at get()
    auto bad = std::async(std::launch::async, expensiveComputation, -1);
    try {
        bad.get();
    } catch (const std::invalid_argument& e) {
        std::cout << "caught: " << e.what() << "\\n";
    }

    // GOTCHA: discarded future from async blocks immediately
    // std::async(std::launch::async, slowTask);  // destructor waits here!

    // promise/future: manual channel between threads
    std::promise<int> prom;
    std::future<int> result = prom.get_future();
    std::jthread worker([p = std::move(prom)]() mutable {
        try {
            p.set_value(expensiveComputation(7));
        } catch (...) {
            p.set_exception(std::current_exception());
        }
    });
    std::cout << result.get() << "\\n";  // 49

    // packaged_task: callable + future, ready for a thread pool
    std::packaged_task<int(int)> task(expensiveComputation);
    std::future<int> fut = task.get_future();
    std::jthread runner(std::move(task), 5);
    std::cout << fut.get() << "\\n";  // 25

    // shared_future: multiple consumers
    std::shared_future<int> shared =
        std::async(std::launch::async, expensiveComputation, 3).share();
    auto a = shared.get();  // ok
    auto b = shared.get();  // also ok - copyable, multi-get
    return a + b - 18;
}`
    },
    {
      title: 'Data Races and How to Find Them',
      content: `A data race is two threads accessing the same memory location, at least one access is a write, and there is no synchronization between them. In C++ a data race is undefined behavior - not "stale reads", but anything at all.

**Data Race vs Race Condition:**
- Data race: unsynchronized conflicting access - always a bug, always UB
- Race condition: outcome depends on timing - can exist even with perfectly synchronized code (e.g. check-then-act across two lock acquisitions)

**Common Patterns That Race:**
- \`counter++\` from multiple threads (read-modify-write is not atomic)
- Lazy initialization with a plain \`bool initialized\` flag
- Capturing locals by reference in a detached thread or escaping lambda
- \`container.size()\` check followed by access, with the lock released in between
- Two threads mutating the same \`std::string\` or \`std::vector\` (const reads alone are fine)

**ThreadSanitizer (TSan):**
- Compile and link with \`-fsanitize=thread -g\` (Clang/GCC)
- Reports the racing stacks of both accesses at runtime - dramatically better than staring at core dumps
- ~5-15x slowdown, ~5-10x memory: run it in CI on tests, not in production
- Cannot be combined with ASan in the same build
- Only catches races your test actually executes - coverage matters

**Interview Points:**
- \`static\` local initialization is thread-safe since C++11 (magic statics) - the idiomatic lazy singleton
- \`std::call_once\` / \`std::once_flag\` for one-time init that isn't a static
- Best fix is often structural: share less, use message passing, make data immutable`,
      codeExample: `#include <mutex>
#include <atomic>
#include <thread>
#include <vector>

// RACE: ++ is load, add, store - threads interleave and lose updates
int unsafeCounter = 0;
void raceyIncrement() {
    for (int i = 0; i < 100000; ++i) ++unsafeCounter;  // TSan flags this
}

// FIX A: atomic
std::atomic<int> atomicCounter{0};
// FIX B: mutex around a plain int (better for compound updates)
int lockedCounter = 0;
std::mutex counterMtx;
void safeIncrement() {
    for (int i = 0; i < 100000; ++i) {
        std::lock_guard lock(counterMtx);
        ++lockedCounter;
    }
}

// RACE CONDITION despite locking: check and act under different locks
class Store {
    std::mutex mtx_;
    std::vector<int> items_;
public:
    bool empty() { std::lock_guard l(mtx_); return items_.empty(); }
    int  pop()   { std::lock_guard l(mtx_); int v = items_.back();
                   items_.pop_back(); return v; }
    // BAD usage: if (!s.empty()) s.pop();  // another thread pops between calls
    // FIX: one operation holding the lock across check + act
    std::optional<int> tryPop() {
        std::lock_guard l(mtx_);
        if (items_.empty()) return std::nullopt;
        int v = items_.back();
        items_.pop_back();
        return v;
    }
};

// Thread-safe lazy init: magic statics (C++11) - no double-checked locking
Store& globalStore() {
    static Store instance;  // initialization is synchronized by the compiler
    return instance;
}

// One-time initialization that isn't a static
std::once_flag configFlag;
void loadConfigOnce() {
    std::call_once(configFlag, [] { /* read config file exactly once */ });
}

// Build with TSan to catch the race in raceyIncrement:
//   clang++ -std=c++20 -fsanitize=thread -g races.cpp && ./a.out`
    },
    {
      title: 'Performance Fundamentals',
      content: `Fast C++ is mostly about memory access patterns and avoiding needless work - not clever micro-tricks. Interviewers want to hear "measure first" before any optimization story.

**Profile Before Optimizing:**
- Use a profiler (perf, Instruments, VTune) to find the actual hot 5% - intuition about bottlenecks is usually wrong
- Benchmark with realistic data and optimized builds (\`-O2\`); debug-build timings are meaningless
- Watch for the benchmark being optimized away - use \`benchmark::DoNotOptimize\` or equivalent

**Cache Locality:**
- Main memory is ~100x slower than L1; data layout dominates many workloads
- Contiguous containers (\`std::vector\`) beat node-based ones (\`std::list\`, \`std::map\`) for traversal - prefetchers love linear scans
- Iterate 2D data row-major (the way it is laid out), not column-major
- Structure-of-arrays beats array-of-structures when you touch only a few fields
- False sharing: two threads writing different variables on the same 64-byte cache line ping-pong it between cores - pad with \`alignas(std::hardware_destructive_interference_size)\`

**Avoiding Needless Copies:**
- RVO/copy elision: returning a local by value is free in the common case (mandatory elision for prvalues since C++17) - do NOT write \`return std::move(local)\`, it can pessimize
- \`reserve()\` before filling a vector: avoids repeated reallocation and element moves
- Pass large read-only parameters by \`const&\` (or \`std::string_view\`/\`std::span\`); take sink parameters by value and move
- \`emplace_back\` constructs in place; prefer it when passing constructor arguments

**Interview Points:**
- Know Big-O still rules: no constant-factor tuning saves an O(n^2) algorithm
- \`unordered_map\` is O(1) average but each lookup is a cache miss chain; a sorted vector + binary search often wins for small n`,
      codeExample: `#include <vector>
#include <string>
#include <new>       // hardware_destructive_interference_size
#include <atomic>

// reserve(): one allocation instead of log2(n) reallocations
std::vector<int> buildSquares(int n) {
    std::vector<int> v;
    v.reserve(n);                 // capacity up front
    for (int i = 0; i < n; ++i)
        v.push_back(i * i);
    return v;                     // NRVO: no copy. Never: return std::move(v);
}

// Cache locality: row-major traversal matches memory layout
long sumRowMajor(const std::vector<std::vector<int>>& grid) {
    long sum = 0;
    for (const auto& row : grid)       // linear scan per row - prefetch-friendly
        for (int x : row) sum += x;
    return sum;
    // Column-major (grid[r][c] with c in the outer loop) would miss cache
}

// AoS vs SoA: touching one field of many records
struct ParticleAoS { float x, y, z, mass; };   // 16 bytes per particle
struct ParticlesSoA {                          // masses are contiguous:
    std::vector<float> x, y, z, mass;          // 4x more per cache line
};
float totalMass(const ParticlesSoA& p) {
    float total = 0;
    for (float m : p.mass) total += m;         // pure linear scan
    return total;
}

// False sharing fix: keep per-thread counters on separate cache lines
struct alignas(std::hardware_destructive_interference_size) PaddedCounter {
    std::atomic<long> value{0};
};
PaddedCounter perThread[8];   // adjacent counters no longer share a line

// Sink parameter: take by value, move into place (one move, caller decides)
class Message {
    std::string body_;
public:
    explicit Message(std::string body) : body_(std::move(body)) {}
};

// emplace_back: construct in place, no temporary
void fill(std::vector<Message>& log) {
    log.emplace_back("started");   // constructs Message directly in the vector
}`
    }
  ],

  visualizations: [
    {
      title: 'Choosing a Lock',
      description: 'Which synchronization primitive fits the situation',
      nodes: [
        { id: 'shared', label: 'Shared\nmutable data', x: 190, y: 40, type: 'primary' },
        { id: 'scoped', label: 'scoped_lock\ndefault choice', x: 70, y: 130, type: 'primary' },
        { id: 'sharedm', label: 'shared_mutex\nread-heavy', x: 190, y: 130, type: 'secondary' },
        { id: 'unique', label: 'unique_lock\nCV / deferred', x: 310, y: 130, type: 'secondary' },
        { id: 'atomic', label: 'atomic<T>\nsingle variable', x: 130, y: 220, type: 'secondary' },
        { id: 'manual', label: 'lock()/unlock()\nby hand', x: 280, y: 220, type: 'warning' }
      ],
      edges: [
        { from: 'shared', to: 'scoped', label: 'general' },
        { from: 'shared', to: 'sharedm', label: 'many readers' },
        { from: 'shared', to: 'unique', label: 'wait/flex' },
        { from: 'scoped', to: 'atomic', label: 'simple flag' },
        { from: 'unique', to: 'manual', label: 'avoid' }
      ]
    },
    {
      title: 'Data Race Anatomy',
      description: 'Two unsynchronized threads corrupting a shared counter',
      nodes: [
        { id: 't1', label: 'Thread 1\nread 5', x: 70, y: 50, type: 'primary' },
        { id: 't2', label: 'Thread 2\nread 5', x: 310, y: 50, type: 'primary' },
        { id: 'inc1', label: 'add 1\n= 6', x: 70, y: 130, type: 'secondary' },
        { id: 'inc2', label: 'add 1\n= 6', x: 310, y: 130, type: 'secondary' },
        { id: 'lost', label: 'both store 6\nupdate lost!', x: 190, y: 200, type: 'warning' },
        { id: 'fix', label: 'fix: mutex\nor atomic', x: 190, y: 260, type: 'primary' }
      ],
      edges: [
        { from: 't1', to: 'inc1' },
        { from: 't2', to: 'inc2' },
        { from: 'inc1', to: 'lost', label: 'store' },
        { from: 'inc2', to: 'lost', label: 'store' },
        { from: 'lost', to: 'fix' }
      ]
    }
  ],

  flashcards: [
    { id: 'cc1', front: 'What happens if a joinable std::thread is destroyed?', back: 'std::terminate() is called. You must join() or detach() before destruction. std::jthread (C++20) fixes this by requesting stop and joining automatically in its destructor.' },
    { id: 'cc2', front: 'What does std::jthread add over std::thread?', back: 'Automatic join in the destructor and cooperative cancellation via std::stop_token - the callable can accept a stop_token and poll stop_requested().' },
    { id: 'cc3', front: 'lock_guard vs unique_lock vs scoped_lock?', back: 'lock_guard: simplest RAII lock. unique_lock: movable, supports deferred lock, unlock/relock, required by condition variables. scoped_lock (C++17): locks multiple mutexes atomically, deadlock-free - the modern default.' },
    { id: 'cc4', front: 'How do you avoid deadlock when locking two mutexes?', back: 'Acquire them in a consistent global order, or lock both atomically with std::scoped_lock(m1, m2), which uses a deadlock-avoidance algorithm. Or restructure so you never hold two locks at once.' },
    { id: 'cc5', front: 'Why must you pass a predicate to condition_variable::wait?', back: 'To handle spurious wakeups (wait can return without a notify) and lost wakeups. cv.wait(lock, pred) loops: it re-checks the predicate under the lock every time it wakes.' },
    { id: 'cc6', front: 'Why does condition_variable::wait require unique_lock, not lock_guard?', back: 'wait() must atomically unlock the mutex while sleeping and relock it on wakeup. lock_guard offers no unlock/relock interface; unique_lock does.' },
    { id: 'cc7', front: 'What is a data race in C++, and what does the standard say about it?', back: 'Two threads access the same memory location, at least one is a write, with no synchronization (happens-before) between them. It is undefined behavior - anything can happen, not just a stale read.' },
    { id: 'cc8', front: 'What guarantee does release/acquire ordering give?', back: 'A release store synchronizes-with the acquire load that reads it: all writes made before the release become visible after the acquire. It is the "publish/subscribe" model - the same ordering a mutex unlock/lock provides.' },
    { id: 'cc9', front: 'When is memory_order_relaxed safe to use?', back: 'When you need atomicity but no ordering with other memory, e.g. statistics counters where only the final total matters. It must not be used to publish other (non-atomic) data.' },
    { id: 'cc10', front: 'Is volatile useful for thread synchronization in C++?', back: 'No. volatile prevents compiler caching of the variable but provides no atomicity and no inter-thread ordering. Use std::atomic. volatile is for memory-mapped I/O and similar.' },
    { id: 'cc11', front: 'What is the famous std::async destructor gotcha?', back: 'A future returned by std::async blocks in its destructor until the task finishes. Discarding the return value makes the call effectively synchronous: std::async(std::launch::async, f); waits right there.' },
    { id: 'cc12', front: 'How do exceptions cross threads with futures?', back: 'An exception thrown in the async task (or set via promise::set_exception) is stored in the shared state and rethrown when the consumer calls future::get(). Clean cross-thread error propagation.' },
    { id: 'cc13', front: 'How do you run ThreadSanitizer and what are its limits?', back: 'Compile and link with -fsanitize=thread -g, then run your tests. It reports both racing stacks. Costs ~5-15x slowdown, only finds races that actually execute, and cannot be combined with ASan.' },
    { id: 'cc14', front: 'What is false sharing and how do you fix it?', back: 'Two threads write different variables that live on the same 64-byte cache line, so the line ping-pongs between cores. Fix: pad/align per-thread data with alignas(std::hardware_destructive_interference_size).' },
    { id: 'cc15', front: 'Why is "return std::move(local);" usually wrong?', back: 'It disables NRVO/copy elision, forcing a move where the compiler could have constructed the object directly in the caller. Return the local by name; elision is mandatory for prvalues since C++17.' },
    { id: 'cc16', front: 'Data race vs race condition - what is the difference?', back: 'A data race is a low-level, well-defined term: unsynchronized concurrent access to one memory location with a write, which is undefined behavior. A race condition is a logic bug where correctness depends on timing (check-then-act). Code can have either without the other.' },
    { id: 'cc17', front: 'How do you write a thread-safe lazy singleton in modern C++?', back: 'static Instance& get() { static Instance inst; return inst; } Since C++11 the initialization of a function-local static is guaranteed to happen exactly once, with other threads blocking until it completes ("magic statics"). No double-checked locking needed.' },
    { id: 'cc18', front: 'When do you use std::call_once instead of a magic static?', back: 'When the one-time initialization is not a static local: initializing a member lazily, running setup code with side effects, or when the target lives in an object with several instances. Pair a std::once_flag with std::call_once(flag, fn); it is also exception-safe (a throwing call lets another caller retry).' },
    { id: 'cc19', front: 'What mutex types does the standard provide, and when do you pick each?', back: 'std::mutex: default. recursive_mutex: same thread may relock (usually a design smell). timed_mutex: try_lock_for/until. shared_mutex (C++17): many readers via shared_lock or one writer via unique_lock - worthwhile only when reads vastly outnumber writes and critical sections are long.' },
    { id: 'cc20', front: 'Why is std::recursive_mutex considered a code smell?', back: 'It usually means a public locked function calls another public locked function, hiding the locking structure. It is slower, makes invariants unclear (the inner call sees partially updated state), and cannot be used with condition_variable. Refactor into private unlocked helpers instead.' },
    { id: 'cc21', front: 'std::promise vs std::packaged_task vs std::async?', back: 'promise: manually set a value or exception that a future will receive - lowest level. packaged_task: wraps a callable so its return value goes to a future; you decide when and where to run it (e.g. a thread pool). async: runs the callable for you, possibly on a new thread.' },
    { id: 'cc22', front: 'What is the difference between std::launch::async and std::launch::deferred?', back: 'async runs the task on a new thread immediately. deferred runs it lazily on the calling thread when get() or wait() is called - never, if nobody asks. The default policy is async | deferred, letting the implementation choose, so specify launch::async when you need concurrency.' },
    { id: 'cc23', front: 'Is std::atomic<T> always lock-free?', back: 'No. Small trivially copyable types (int, pointers, usually 8-byte structs) are lock-free on mainstream hardware; larger T falls back to an internal lock. Check with is_lock_free() or std::atomic<T>::is_always_lock_free at compile time.' },
    { id: 'cc24', front: 'compare_exchange_weak vs compare_exchange_strong?', back: 'Both atomically replace the value if it equals expected, otherwise load the current value into expected. weak may fail spuriously even when the values match, which is fine inside a retry loop and cheaper on LL/SC architectures (ARM). Use strong when a spurious failure would be wrong or the loop is expensive.' },
    { id: 'cc25', front: 'What does memory_order_seq_cst add over acquire/release?', back: 'A single total order of all seq_cst operations that every thread agrees on. Acquire/release only orders pairs that synchronize; with two flags each set by a different thread, two observers can disagree on which was set first. seq_cst forbids that, at the cost of extra fences on weakly ordered CPUs.' },
    { id: 'cc26', front: 'notify_one vs notify_all, and how do you avoid a lost wakeup?', back: 'notify_one wakes a single waiter (a queue with one item); notify_all wakes everyone (a broadcast state change like shutdown). Modify the shared condition while holding the mutex, then notify; otherwise a waiter can check the predicate, see false, and miss the notify before it sleeps.' },
    { id: 'cc27', front: 'How are arguments passed to a std::thread, and how do you pass a reference?', back: 'Arguments are copied (decayed) into thread-owned storage and passed as rvalues, so void f(int&) will not compile with a plain argument. Wrap with std::ref(x) - and then you own the responsibility that x outlives the thread.' },
    { id: 'cc28', front: 'What is std::shared_future for?', back: 'std::future::get() may be called exactly once and moves the result out. shared_future can be copied to many consumers, each of which may call get() and receive a const reference to the same value - e.g. several worker threads waiting on one "go" signal or configuration load.' },
    { id: 'cc29', front: 'Why use a thread pool instead of spawning a thread per task?', back: 'Thread creation costs tens of microseconds plus a stack allocation, and more runnable threads than cores causes oversubscription and context switching. A pool sized around std::thread::hardware_concurrency() reuses threads and bounds memory and contention.' },
    { id: 'cc30', front: 'Spinlock vs mutex - when does spinning win?', back: 'A spinlock (std::atomic_flag test_and_set loop) avoids the kernel and is fastest for critical sections of a few dozen instructions when the holder is running on another core. If the holder may be descheduled or the section is long, spinning burns CPU; use std::mutex, which spins briefly then blocks.' }
  ],

  quizQuestions: [
    {
      id: 'ccq1',
      question: 'What happens when a std::thread object is destroyed while still joinable?',
      options: ['The thread is detached automatically', 'The destructor blocks until the thread finishes', 'std::terminate() is called', 'The thread is cancelled and joined'],
      correctAnswer: 2,
      explanation: 'A joinable std::thread destructor calls std::terminate(). You must join() or detach() first. std::jthread instead requests stop and joins automatically.'
    },
    {
      id: 'ccq2',
      question: 'Which lock type should you use to acquire two mutexes without risking deadlock?',
      options: ['std::scoped_lock(m1, m2)', 'Two nested std::lock_guard objects', 'std::shared_lock on both', 'std::recursive_mutex'],
      correctAnswer: 0,
      explanation: 'std::scoped_lock with multiple mutexes uses a deadlock-avoidance algorithm to acquire them atomically. Nested lock_guards deadlock if another thread locks in the opposite order.'
    },
    {
      id: 'ccq3',
      question: 'Why can condition_variable::wait return even though nobody called notify?',
      options: ['The mutex timed out', 'Spurious wakeups are permitted by the standard', 'notify_all is implied by unlock', 'The predicate became true'],
      correctAnswer: 1,
      explanation: 'Spurious wakeups are allowed for implementation efficiency. That is why you always wait with a predicate: cv.wait(lock, pred) re-checks the condition in a loop.'
    },
    {
      id: 'ccq4',
      question: 'Thread A does: data = 42; flag.store(true, release). Thread B loops on flag.load(acquire) then reads data. What does B see?',
      options: ['Possibly a stale value of data', 'Undefined behavior', 'data == 42, guaranteed', 'It depends on the CPU architecture'],
      correctAnswer: 2,
      explanation: 'The release store synchronizes-with the acquire load that reads true, creating a happens-before edge. All writes before the release (data = 42) are visible after the acquire, on every architecture.'
    },
    {
      id: 'ccq5',
      question: 'Which memory order is appropriate for a pure statistics counter where only the final total is read after all threads join?',
      options: ['memory_order_seq_cst is required', 'memory_order_acquire', 'memory_order_release', 'memory_order_relaxed'],
      correctAnswer: 3,
      explanation: 'fetch_add with memory_order_relaxed is sufficient: increments stay atomic and none are lost. No ordering with other memory is needed since the total is read after joining (join provides synchronization).'
    },
    {
      id: 'ccq6',
      question: 'What does this line do? std::async(std::launch::async, longTask);',
      options: ['Runs longTask fully concurrently', 'Blocks immediately until longTask completes', 'Throws because the future is discarded', 'Defers longTask until get() is called'],
      correctAnswer: 1,
      explanation: 'The returned future is a temporary that is destroyed at the end of the statement, and a future from std::async blocks in its destructor. The "async" call becomes synchronous.'
    },
    {
      id: 'ccq7',
      question: 'A task launched with std::async throws an exception. What happens?',
      options: ['std::terminate() is called', 'The exception is silently swallowed', 'It is rethrown from future::get()', 'It propagates to the main thread immediately'],
      correctAnswer: 2,
      explanation: 'The exception is captured into the future\'s shared state and rethrown when get() is called - the standard mechanism for propagating errors across threads.'
    },
    {
      id: 'ccq8',
      question: 'Code holds a lock to check !queue.empty(), releases it, then locks again to pop. What is wrong?',
      options: ['Nothing - each access is protected', 'It is a data race and undefined behavior', 'A race condition: another thread may empty the queue between the two critical sections', 'The second lock will deadlock'],
      correctAnswer: 2,
      explanation: 'There is no data race (all access is locked), but the check-then-act is not atomic: another consumer can pop between them. Combine check and pop under one lock acquisition (e.g. tryPop).'
    },
    {
      id: 'ccq9',
      question: 'How do you enable ThreadSanitizer with Clang or GCC?',
      options: ['-fsanitize=thread when compiling and linking', '-Wthread-safety at compile time', '-fsanitize=address,thread combined', 'Link against libtsan only, no compile flags'],
      correctAnswer: 0,
      explanation: 'Build and link with -fsanitize=thread (plus -g for readable stacks). It cannot be combined with AddressSanitizer in the same build, and -Wthread-safety is a separate static annotation system.'
    },
    {
      id: 'ccq10',
      question: 'Two threads each increment their own counter, but the counters sit adjacent in one array and throughput collapses. What is the likely cause?',
      options: ['A data race on the counters', 'Lock contention on a hidden mutex', 'Branch misprediction', 'False sharing: both counters live on the same cache line'],
      correctAnswer: 3,
      explanation: 'Each write invalidates the shared cache line in the other core, causing constant coherence traffic despite no logical sharing. Fix by aligning each counter to its own line with alignas(std::hardware_destructive_interference_size).'
    },
    {
      id: 'ccq11',
      question: 'void bump(int& n) { ++n; } int x = 0; std::thread t(bump, x); t.join(); What happens?',
      options: ['x becomes 1', 'x stays 0 because a copy was incremented', 'Compile error: the thread passes a copy as an rvalue, which cannot bind to int&; use std::ref(x)', 'Data race on x'],
      correctAnswer: 2,
      explanation: 'std::thread decays and copies its arguments and invokes the callable with rvalues. int& cannot bind to that, so the constructor is ill-formed. std::ref(x) passes a reference_wrapper that converts back to int&.'
    },
    {
      id: 'ccq12',
      question: 'Logger& Logger::instance() { static Logger inst; return inst; } Two threads call instance() simultaneously for the first time. What happens?',
      options: ['Exactly one Logger is constructed; the other thread waits for initialization to finish', 'Two Loggers may be constructed - you need a mutex', 'Undefined behavior - a data race on inst', 'The second thread gets a partially constructed object'],
      correctAnswer: 0,
      explanation: 'Since C++11 the initialization of a function-local static is guaranteed thread-safe. This is the simplest correct singleton; double-checked locking is unnecessary.'
    },
    {
      id: 'ccq13',
      question: 'std::mutex m; void a() { std::lock_guard<std::mutex> g(m); b(); } void b() { std::lock_guard<std::mutex> g(m); } Calling a() does what?',
      options: ['Works - the same thread can relock', 'Throws std::system_error every time', 'The second lock is silently ignored', 'Undefined behavior - in practice the thread deadlocks on itself'],
      correctAnswer: 3,
      explanation: 'std::mutex is not recursive; locking it again from the owning thread is UB and typically hangs forever. Split b into an unlocked private helper called by both, or (less ideally) use recursive_mutex.'
    },
    {
      id: 'ccq14',
      question: 'std::future<int> f = std::async(compute); int a = f.get(); int b = f.get(); What is the status of the second get()?',
      options: ['Returns the cached result again', 'Undefined behavior - the future is no longer valid after get(); use std::shared_future for multiple reads', 'Blocks forever', 'Re-runs compute'],
      correctAnswer: 1,
      explanation: 'get() moves the result out and releases the shared state; valid() becomes false. Calling get() on an invalid future is UB (implementations often throw future_error). shared_future allows repeated get().'
    },
    {
      id: 'ccq15',
      question: 'std::atomic<int> hits{0}; Two threads each run hits = hits + 1; 1000 times. Is the final value guaranteed to be 2000?',
      options: ['Yes - every operation on an atomic is atomic', 'Yes, if memory_order_seq_cst is used', 'No - the load and the store are separate atomic operations; increments can be lost. Use ++hits or fetch_add', 'No - std::atomic<int> is not lock-free'],
      correctAnswer: 2,
      explanation: 'hits + 1 reads the value, then the assignment stores a new one. Another thread can update between them. Only the read-modify-write operations (++, +=, fetch_add) are atomic as a whole.'
    },
    {
      id: 'ccq16',
      question: 'A configuration map is read thousands of times per second and updated once an hour. Which locking scheme fits best?',
      options: ['std::shared_mutex: readers take std::shared_lock, the writer takes std::unique_lock', 'std::mutex with lock_guard for everyone', 'std::recursive_mutex', 'No lock - reads are safe as long as writes are rare'],
      correctAnswer: 0,
      explanation: 'shared_mutex lets many readers proceed concurrently while excluding them only during the rare write. Option 4 is a data race: even one unsynchronized write makes concurrent reads UB.'
    },
    {
      id: 'ccq17',
      question: 'Producer: ready = true; cv.notify_one(); (no lock held). Consumer: unique_lock lk(m); cv.wait(lk, []{ return ready; }); with bool ready. What can go wrong?',
      options: ['Nothing - the predicate makes the wait safe', 'The consumer wakes twice', 'notify_one without a lock throws', 'A data race on ready, and a lost wakeup: the consumer can read false, then the producer sets and notifies before the consumer sleeps'],
      correctAnswer: 3,
      explanation: 'The write to ready must happen under the same mutex the consumer holds while checking the predicate. That closes the window between the check and the sleep. Notifying after unlocking is fine; writing without the lock is not.'
    },
    {
      id: 'ccq18',
      question: 'while (!head.compare_exchange_weak(newNode->next, newNode)) {} Why is the weak version acceptable here?',
      options: ['weak is always faster and never fails', 'The loop retries on spurious failure anyway, and weak avoids an inner loop on LL/SC hardware', 'weak provides stronger memory ordering', 'strong cannot be used with pointers'],
      correctAnswer: 1,
      explanation: 'compare_exchange_weak may fail even when the value matched; inside a retry loop that just costs one more iteration, and on ARM-style architectures it maps to a single LL/SC pair. Use strong only when spurious failure would change behavior.'
    },
    {
      id: 'ccq19',
      question: 'auto f = std::async(std::launch::deferred, expensive); The program never calls f.get() or f.wait(). When does expensive run?',
      options: ['Immediately on a new thread', 'When f is destroyed', 'Never', 'At program exit'],
      correctAnswer: 2,
      explanation: 'deferred means lazy execution on the thread that eventually calls get() or wait(). If nobody does, the task is simply dropped - a source of "my async work never happened" bugs when the default policy picks deferred.'
    },
    {
      id: 'ccq20',
      question: 'Which of these is a data race?',
      options: ['Two threads calling push_back on the same std::vector with no lock', 'Two threads reading the same const std::vector concurrently', 'Two threads incrementing the same std::atomic<int> with fetch_add', 'Two threads each holding their own copy of a std::shared_ptr to the same object and reading through it'],
      correctAnswer: 0,
      explanation: 'push_back writes to size and possibly reallocates, so concurrent calls are unsynchronized writes to shared memory - UB. Concurrent reads, atomics, and separate shared_ptr copies are all safe.'
    }
  ]
};

// =============================================================================
// EXPORT ALL C++ CATEGORIES
// =============================================================================
export const cppCategories: CppCategory[] = [
  cppFundamentals,
  pointersMemory,
  oopCpp,
  templatesGenerics,
  stlContainers,
  modernCpp,
  concurrencyPerformance,
];
