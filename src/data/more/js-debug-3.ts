// JavaScript "fix the bug" problems 126-150: async/promises, closures and scope,
// `this`, classes, generators, event-loop ordering, error handling, timing logic.

import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  // ------------------------------------------------------------------ 126
  {
    id: 'js-async-price-not-awaited',
    number: 126,
    language: 'javascript',
    title: 'The Price Is a Promise',
    difficulty: 'Easy',
    topic: 'Async',
    statement:
      "`cartTotal(items)` receives cart lines like `{ name: 'apple', qty: 2 }`, looks up each unit price with the async helper `fetchPrice`, and should resolve to the total cost (sum of price x qty). Products that are not in the price list cost 0, and an empty cart totals 0. Right now any non-empty cart resolves to `NaN`.",
    functionName: 'cartTotal',
    functionSignature: 'async function cartTotal(items: { name: string; qty: number }[]): Promise<number>',
    buggyCode: `const PRICES = { apple: 3, bread: 4, milk: 2, cheese: 7 };

// Pretend this is a network call.
async function fetchPrice(name) {
  await null;
  return PRICES[name] || 0;
}

async function cartTotal(items) {
  let total = 0;
  for (const item of items) {
    const price = fetchPrice(item.name);
    total += price * item.qty;
  }
  return total;
}
`,
    hint: 'Log `price` inside the loop. Is it a number?',
    explanation:
      "Calling an `async` function never hands back its return value directly: it hands back a promise for it. `fetchPrice(item.name)` is therefore a Promise object, and `promise * item.qty` coerces the object to `NaN`, which then poisons the running total. Nothing throws, which is why this bug survives code review so often.\n\nThe fix is to wait for the value: `const price = await fetchPrice(item.name);`. That keeps the lookups sequential. If the lookups are independent you can also start them all and wait once: `const prices = await Promise.all(items.map(i => fetchPrice(i.name)))`, then sum `prices[i] * items[i].qty`.\n\nRule of thumb: if a function is `async` (or returns a promise), every caller must `await` it or chain `.then` before using the result. Cost is O(n) lookups either way.",
    examples: [
      { input: [[{ name: 'apple', qty: 2 }, { name: 'milk', qty: 1 }]], expected: 8 },
      { input: [[{ name: 'cheese', qty: 3 }]], expected: 21 },
      { input: [[{ name: 'bread', qty: 1 }, { name: 'truffle', qty: 5 }]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[{ name: 'apple', qty: 0 }, { name: 'bread', qty: 10 }]], expected: 40 },
      { input: [[{ name: 'milk', qty: 4 }, { name: 'milk', qty: 1 }, { name: 'cheese', qty: 1 }]], expected: 17 },
      { input: [[{ name: 'caviar', qty: 2 }]], expected: 0 },
    ],
  },
  // ------------------------------------------------------------------ 127
  {
    id: 'js-memo-cache-rebuilt-per-call',
    number: 127,
    language: 'javascript',
    title: 'The Cache That Never Hits',
    difficulty: 'Easy',
    topic: 'Closures',
    statement:
      "`squareAll(nums)` squares every number through a memoized helper and returns `{ results, computed }`: `results` holds the squares in input order and `computed` is how many times the expensive function actually ran. A value that appears several times in `nums` must be computed only once, so `computed` equals the number of DISTINCT values. Every call to `squareAll` starts with an empty cache. Currently `computed` always equals `nums.length`.",
    functionName: 'squareAll',
    functionSignature: 'function squareAll(nums: number[]): { results: number[]; computed: number }',
    buggyCode: `function memoize(fn) {
  return function (n) {
    const cache = {};
    if (n in cache) return cache[n];
    const value = fn(n);
    cache[n] = value;
    return value;
  };
}

function squareAll(nums) {
  let computed = 0;
  const square = memoize(function (n) {
    computed++;
    return n * n;
  });
  const results = nums.map(function (n) {
    return square(n);
  });
  return { results: results, computed: computed };
}
`,
    hint: 'How many `cache` objects exist after `square` has been called five times?',
    explanation:
      "A closure remembers the variables of the scope it was CREATED in. Here `cache` is declared inside the returned function, so it is not closed-over state at all: it is an ordinary local that is created empty on every call, filled with one entry, and thrown away. The `n in cache` check can never be true.\n\nMove the declaration up one level, into `memoize` itself: `function memoize(fn) { const cache = {}; return function (n) { ... }; }`. Now each call to `memoize` creates one cache and the returned function keeps it alive between calls.\n\nDo not move it further out to the top of the file: then every memoized function, and every call to `squareAll`, would share one cache and the counts would depend on what ran earlier. With the fix each lookup is O(1), so the whole pass is O(n) time and O(distinct values) space.",
    examples: [
      { input: [[2, 2, 3]], expected: { results: [4, 4, 9], computed: 2 } },
      { input: [[5]], expected: { results: [25], computed: 1 } },
      { input: [[1, 2, 1, 2, 1]], expected: { results: [1, 4, 1, 4, 1], computed: 2 } },
    ],
    hiddenTests: [
      { input: [[2, 5]], expected: { results: [4, 25], computed: 2 } },
      { input: [[]], expected: { results: [], computed: 0 } },
      { input: [[0, 0, 0]], expected: { results: [0, 0, 0], computed: 1 } },
      { input: [[-3, 3, -3]], expected: { results: [9, 9, 9], computed: 2 } },
      { input: [[2, 3, 5, 7]], expected: { results: [4, 9, 25, 49], computed: 4 } },
    ],
  },
  // ------------------------------------------------------------------ 128
  {
    id: 'js-tdz-helper-reads-const-early',
    number: 128,
    language: 'javascript',
    title: 'Called Before the const Exists',
    difficulty: 'Easy',
    topic: 'Hoisting',
    statement:
      "`invoiceTotal(lines)` receives invoice lines like `{ price: 50, qty: 2 }` and should return the subtotal (sum of price x qty) plus 20% tax. An empty invoice totals 0. Every call currently dies with a `ReferenceError`.",
    functionName: 'invoiceTotal',
    functionSignature: 'function invoiceTotal(lines: { price: number; qty: number }[]): number',
    buggyCode: `function invoiceTotal(lines) {
  let subtotal = 0;
  for (const line of lines) {
    subtotal += line.price * line.qty;
  }

  const total = addTax(subtotal);

  const TAX_PERCENT = 20;

  function addTax(amount) {
    return amount + (amount * TAX_PERCENT) / 100;
  }

  return total;
}
`,
    hint: 'The function `addTax` is usable before its line is reached. Is the same true for everything it reads?',
    explanation:
      "Function declarations are hoisted together with their bodies, so calling `addTax` above its definition is legal. `const` and `let` are hoisted too, but only as names: from the top of the scope until the declaration line executes, the binding sits in the temporal dead zone and any read throws `ReferenceError: Cannot access 'TAX_PERCENT' before initialization`. `addTax` runs while `TAX_PERCENT` is still in that zone.\n\nFix it by making sure the constant is initialised before anything that uses it runs: move `const TAX_PERCENT = 20;` above the `addTax(subtotal)` call (constants at the top is the usual convention), or pass the rate in as an argument.\n\nSwitching to `var` is not a fix. A `var` is hoisted as `undefined`, so the error disappears and the function quietly returns `NaN` instead, which is worse. The dead zone exists precisely to turn that silent bug into a loud one.",
    examples: [
      { input: [[{ price: 50, qty: 2 }]], expected: 120 },
      { input: [[{ price: 10, qty: 1 }, { price: 5, qty: 3 }]], expected: 30 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[{ price: 100, qty: 0 }]], expected: 0 },
      { input: [[{ price: 25, qty: 4 }, { price: 200, qty: 1 }]], expected: 360 },
      { input: [[{ price: 5, qty: 1 }]], expected: 6 },
      { input: [[{ price: 15, qty: 2 }, { price: 15, qty: 2 }, { price: 40, qty: 1 }]], expected: 120 },
    ],
  },
  // ------------------------------------------------------------------ 129
  {
    id: 'js-arrow-method-has-no-this',
    number: 129,
    language: 'javascript',
    title: 'Arrow Function as a Method',
    difficulty: 'Easy',
    topic: 'this Binding',
    statement:
      "`describeAccount(owner, balance)` builds an account object and returns the text produced by its `summary` method, in the form `\"<owner> has <balance> credits\"`. For example `describeAccount('Ada', 70)` should return `\"Ada has 70 credits\"`, but the owner and balance never make it into the text.",
    functionName: 'describeAccount',
    functionSignature: 'function describeAccount(owner: string, balance: number): string',
    buggyCode: `function describeAccount(owner, balance) {
  const account = {
    owner: owner,
    balance: balance,
    summary: () => {
      return this.owner + ' has ' + this.balance + ' credits';
    },
  };
  return account.summary();
}
`,
    hint: 'Calling `account.summary()` normally sets `this` to `account`. Which kind of function ignores that?',
    explanation:
      "An arrow function has no `this` of its own. It uses the `this` of the code that surrounds it at the place it was written, and nothing about how it is later called (`account.summary()`, `call`, `bind`) can change that. An object literal is not a scope, so the surrounding `this` here is the `this` of `describeAccount`: the global object in sloppy mode (giving `undefined has undefined credits`) or `undefined` in strict mode (giving a TypeError).\n\nUse a real method so that the call `account.summary()` supplies the receiver: `summary() { return this.owner + ' has ' + this.balance + ' credits'; }` or `summary: function () { ... }`.\n\nGuideline: arrow functions are for callbacks that should KEEP the outer `this`; object and class methods that need the object itself should be written with method syntax.",
    examples: [
      { input: ['Ada', 70], expected: 'Ada has 70 credits' },
      { input: ['Lin', 0], expected: 'Lin has 0 credits' },
    ],
    hiddenTests: [
      { input: ['Sam', -15], expected: 'Sam has -15 credits' },
      { input: ['', 3], expected: ' has 3 credits' },
      { input: ['Grace Hopper', 1000], expected: 'Grace Hopper has 1000 credits' },
      { input: ['Bo', 2.5], expected: 'Bo has 2.5 credits' },
    ],
  },
  // ------------------------------------------------------------------ 130
  {
    id: 'js-bind-first-arg-is-this',
    number: 130,
    language: 'javascript',
    title: "bind's First Argument",
    difficulty: 'Easy',
    topic: 'this Binding',
    statement:
      "`applyDiscount(prices, percentOff)` should return a new array with every price reduced by `percentOff` percent, in the same order. For example `applyDiscount([10, 20, 30], 50)` should give `[5, 10, 15]`. It pre-fills the general helper `scale(factor, value)` to build a one-argument `discount` function, but the output is wrong: the example comes back as `[0, 20, 60]`.",
    functionName: 'applyDiscount',
    functionSignature: 'function applyDiscount(prices: number[], percentOff: number): number[]',
    buggyCode: `function scale(factor, value) {
  return factor * value;
}

function applyDiscount(prices, percentOff) {
  const keep = (100 - percentOff) / 100;
  const discount = scale.bind(keep);
  return prices.map(discount);
}
`,
    hint: 'What does the FIRST argument of `bind` set? Then look at what `map` passes to its callback.',
    explanation:
      "`fn.bind(thisArg, a, b, ...)` fixes `this` with its first argument and only the arguments after that are pre-filled parameters. `scale.bind(keep)` therefore creates a function whose `this` is `keep` (which `scale` never reads) and whose parameters are all still open. `map` then calls it as `(price, index, array)`, so `factor` becomes the price and `value` becomes the index: `[10*0, 20*1, 30*2]`.\n\nSupply a placeholder for `this` and then the argument you want to lock in: `const discount = scale.bind(null, keep);`. Now `map` calls `scale(keep, price, index, array)` and the extra arguments are ignored. An arrow function says the same thing more plainly: `prices.map(p => scale(keep, p))`.\n\nThe work is one multiplication per price, O(n).",
    examples: [
      { input: [[10, 20, 30], 50], expected: [5, 10, 15] },
      { input: [[80], 25], expected: [60] },
      { input: [[], 10], expected: [] },
    ],
    hiddenTests: [
      { input: [[100, 200], 0], expected: [100, 200] },
      { input: [[40, 40, 40], 100], expected: [0, 0, 0] },
      { input: [[8, 4, 2, 6], 75], expected: [2, 1, 0.5, 1.5] },
      { input: [[0, 50], 10], expected: [0, 45] },
    ],
  },
  // ------------------------------------------------------------------ 131
  {
    id: 'js-subclass-constructor-skips-super',
    number: 131,
    language: 'javascript',
    title: 'Subclass Forgot Its Parent',
    difficulty: 'Easy',
    topic: 'Classes',
    statement:
      "`describeRect(label, width, height)` creates a `Rect` (a subclass of `Shape`) and returns its description, e.g. `describeRect('door', 2, 3)` should return `\"door with area 6\"`. Creating the rectangle currently throws before anything is returned.",
    functionName: 'describeRect',
    functionSignature: 'function describeRect(label: string, width: number, height: number): string',
    buggyCode: `class Shape {
  constructor(label) {
    this.label = label;
  }
  describe() {
    return this.label + ' with area ' + this.area();
  }
}

class Rect extends Shape {
  constructor(label, width, height) {
    this.width = width;
    this.height = height;
  }
  area() {
    return this.width * this.height;
  }
}

function describeRect(label, width, height) {
  return new Rect(label, width, height).describe();
}
`,
    hint: 'In a class that `extends` another, who is responsible for creating `this`?',
    explanation:
      "In a derived class the object is created by the PARENT constructor. Until `super(...)` has run there is no `this`, and touching it throws `ReferenceError: Must call super constructor in derived class before accessing 'this'`. `Rect`'s constructor assigns to `this.width` without ever calling `super`.\n\nCall the parent first and hand it what it needs: `constructor(label, width, height) { super(label); this.width = width; this.height = height; }`.\n\nA bare `super()` silences the error but is still wrong: `Shape` would store `undefined` as the label and the description would read `undefined with area 6`. Whatever the parent constructor expects must be passed through.",
    examples: [
      { input: ['door', 2, 3], expected: 'door with area 6' },
      { input: ['tile', 1, 1], expected: 'tile with area 1' },
    ],
    hiddenTests: [
      { input: ['line', 5, 0], expected: 'line with area 0' },
      { input: ['field', 100, 60], expected: 'field with area 6000' },
      { input: ['', 4, 4], expected: ' with area 16' },
      { input: ['strip', 0.5, 8], expected: 'strip with area 4' },
    ],
  },
  // ------------------------------------------------------------------ 132
  {
    id: 'js-throwing-bare-strings',
    number: 132,
    language: 'javascript',
    title: 'Throwing Bare Strings',
    difficulty: 'Easy',
    topic: 'Error Handling',
    statement:
      "`validateAge(age)` should return `{ ok: true, age }` for a valid age, and `{ ok: false, error }` otherwise, where `error` is the text `\"age must be a number\"` when `age` is not of type number and `\"age cannot be negative\"` when it is below zero. Invalid input is detected, but the `error` text is missing from the result.",
    functionName: 'validateAge',
    functionSignature: 'function validateAge(age: unknown): { ok: boolean; age?: number; error?: string }',
    buggyCode: `function checkAge(age) {
  if (typeof age !== 'number') throw 'age must be a number';
  if (age < 0) throw 'age cannot be negative';
  return age;
}

function validateAge(age) {
  try {
    return { ok: true, age: checkAge(age) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
`,
    hint: 'Inside `catch`, what type is `err`? Does that type have a `.message`?',
    explanation:
      "JavaScript lets you `throw` any value, and `catch` receives exactly what was thrown. `checkAge` throws plain strings, and a string has no `message` property, so `err.message` is `undefined`. A thrown string also carries no stack trace and fails every `instanceof Error` check further up, which is why throwing non-Errors is considered a bug even when it seems to work.\n\nThrow real errors: `throw new Error('age must be a number')` and `throw new Error('age cannot be negative')`. The handler's `err.message` then holds the text, and tools get a stack trace.\n\nIf you cannot control what a third-party function throws, normalise in the handler instead, for example `const message = err instanceof Error ? err.message : String(err);`.",
    examples: [
      { input: [30], expected: { ok: true, age: 30 } },
      { input: [-1], expected: { ok: false, error: 'age cannot be negative' } },
      { input: ['30'], expected: { ok: false, error: 'age must be a number' } },
    ],
    hiddenTests: [
      { input: [0], expected: { ok: true, age: 0 } },
      { input: [null], expected: { ok: false, error: 'age must be a number' } },
      { input: [-0.5], expected: { ok: false, error: 'age cannot be negative' } },
      { input: [[41]], expected: { ok: false, error: 'age must be a number' } },
      { input: [118], expected: { ok: true, age: 118 } },
    ],
  },
  // ------------------------------------------------------------------ 133
  {
    id: 'js-foreach-ignores-async-callbacks',
    number: 133,
    language: 'javascript',
    title: "forEach Doesn't Wait",
    difficulty: 'Medium',
    topic: 'Async',
    statement:
      "`saveAll(records)` saves each record with the async helper `saveRecord` (each save takes `record.ms` milliseconds) and should resolve to the list of generated ids in the SAME ORDER as the input records, no matter which save finishes first. An empty input resolves to `[]`. At the moment it always resolves to an empty array.",
    functionName: 'saveAll',
    functionSignature: 'async function saveAll(records: { name: string; ms: number }[]): Promise<string[]>',
    buggyCode: `// Pretend database write that takes record.ms milliseconds.
function saveRecord(record) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('id-' + record.name);
    }, record.ms);
  });
}

async function saveAll(records) {
  const ids = [];
  records.forEach(async function (record) {
    const id = await saveRecord(record);
    ids.push(id);
  });
  return ids;
}
`,
    hint: 'What does `forEach` do with the value its callback returns?',
    explanation:
      "`forEach` calls the callback for each element and discards whatever it returns. An `async` callback returns a promise at its first `await`, so `forEach` finishes immediately having merely STARTED every save, and `return ids` runs while the array is still empty. The pushes happen later, after the caller already has its answer. Putting `await` in front of `records.forEach(...)` does not help: `forEach` returns `undefined`.\n\nTwo correct shapes:\n- Sequential: `for (const record of records) { ids.push(await saveRecord(record)); }`. A `for...of` loop really does pause at each `await`.\n- Concurrent: `return Promise.all(records.map(saveRecord));`. `Promise.all` resolves to the results in INPUT order, whatever order they complete in.\n\nBeware the half-fix `await Promise.all(records.map(async r => { ids.push(await saveRecord(r)); }))`: it waits correctly, but pushes in completion order, so a slow first record ends up last. Collect results by position, not by arrival.",
    examples: [
      { input: [[{ name: 'a', ms: 1 }, { name: 'b', ms: 1 }]], expected: ['id-a', 'id-b'] },
      { input: [[{ name: 'slow', ms: 5 }, { name: 'fast', ms: 0 }]], expected: ['id-slow', 'id-fast'] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[{ name: 'only', ms: 0 }]], expected: ['id-only'] },
      { input: [[{ name: 'x', ms: 5 }, { name: 'y', ms: 2 }, { name: 'z', ms: 0 }]], expected: ['id-x', 'id-y', 'id-z'] },
      { input: [[{ name: 'p', ms: 0 }, { name: 'q', ms: 5 }, { name: 'r', ms: 0 }]], expected: ['id-p', 'id-q', 'id-r'] },
      { input: [[{ name: 'dup', ms: 0 }, { name: 'dup', ms: 0 }]], expected: ['id-dup', 'id-dup'] },
    ],
  },
  // ------------------------------------------------------------------ 134
  {
    id: 'js-filter-with-async-predicate',
    number: 134,
    language: 'javascript',
    title: 'Filtering With an Async Test',
    difficulty: 'Medium',
    topic: 'Async',
    statement:
      "`allowedEmails(emails)` should resolve to the addresses whose domain is NOT on the block list, in their original order. The check `isAllowed` is async because in production it calls a reputation service. Right now nothing is ever filtered out: every address comes back.",
    functionName: 'allowedEmails',
    functionSignature: 'async function allowedEmails(emails: string[]): Promise<string[]>',
    buggyCode: `const BLOCKED = ['spam.example', 'junk.example'];

// Pretend this asks a remote reputation service.
async function isAllowed(email) {
  await null;
  const domain = email.split('@')[1];
  return !BLOCKED.includes(domain);
}

async function allowedEmails(emails) {
  return emails.filter(async function (email) {
    return await isAllowed(email);
  });
}
`,
    hint: 'What value does an `async` callback hand back to `filter`, and is that value truthy?',
    explanation:
      "`filter` is synchronous: it calls the predicate and keeps the element if the RETURN VALUE is truthy. An `async` predicate returns a promise, and a promise object is always truthy, even one that will later resolve to `false`. So every element is kept. The `await` inside the callback only delays the callback's own promise; `filter` has already moved on.\n\nSeparate the asynchronous part from the filtering:\n1. Get all the answers: `const flags = await Promise.all(emails.map(isAllowed));`\n2. Filter synchronously by position: `return emails.filter((_, i) => flags[i]);`\n\nA plain `for...of` loop with `if (await isAllowed(email)) result.push(email);` is equally correct and keeps order naturally, at the cost of running the checks one at a time. The same trap applies to `some`, `every`, `find` and `sort` comparators: none of them understand promises.",
    examples: [
      { input: [['ann@mail.example', 'bot@spam.example', 'cy@work.example']], expected: ['ann@mail.example', 'cy@work.example'] },
      { input: [['x@junk.example']], expected: [] },
      { input: [['kim@mail.example']], expected: ['kim@mail.example'] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [['a@spam.example', 'b@junk.example', 'c@spam.example']], expected: [] },
      { input: [['z@work.example', 'y@junk.example', 'x@work.example', 'w@spam.example', 'v@mail.example']], expected: ['z@work.example', 'x@work.example', 'v@mail.example'] },
      { input: [['spam.example@mail.example', 'me@notspam.example']], expected: ['spam.example@mail.example', 'me@notspam.example'] },
    ],
  },
  // ------------------------------------------------------------------ 135
  {
    id: 'js-then-callback-drops-inner-promise',
    number: 135,
    language: 'javascript',
    title: 'The Chain Moved On Early',
    difficulty: 'Medium',
    topic: 'Async',
    statement:
      "`loadProfile(id)` looks up a user (ids 1 to 5 exist), then that user's orders, and should resolve to a line such as `\"Ada: 2 orders\"` (always the word `orders`, whatever the count). The name is right, but the count is `0` for everyone.",
    functionName: 'loadProfile',
    functionSignature: 'function loadProfile(id: number): Promise<string>',
    buggyCode: `const USERS = { 1: 'Ada', 2: 'Lin', 3: 'Sam', 4: 'Mia', 5: 'Zed' };
const ORDERS = {
  Ada: ['book', 'pen'],
  Lin: [],
  Sam: ['lamp'],
  Mia: ['desk', 'chair', 'rug', 'vase'],
  Zed: ['mug', 'tea', 'kettle'],
};

function getUser(id) {
  return Promise.resolve({ id: id, name: USERS[id] });
}

function getOrders(name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(ORDERS[name]);
    }, 1);
  });
}

function loadProfile(id) {
  const profile = { name: '', orderCount: 0 };
  return getUser(id)
    .then(function (user) {
      profile.name = user.name;
      getOrders(user.name).then(function (orders) {
        profile.orderCount = orders.length;
      });
    })
    .then(function () {
      return profile.name + ': ' + profile.orderCount + ' orders';
    });
}
`,
    hint: 'How does the second `.then` know when the orders request has finished?',
    explanation:
      "A `.then` callback tells the chain what to wait for through its RETURN VALUE. Return a promise and the next `.then` waits for it; return nothing and the chain continues on the very next microtask. The first callback starts `getOrders(...)` but does not return it, so that request becomes a detached side branch. The final step builds the text while `orderCount` is still 0, and the orders arrive a millisecond too late. Any error in the detached branch would also be lost.\n\nReturn the inner promise so the chain flattens: `return getOrders(user.name).then(function (orders) { profile.orderCount = orders.length; });`.\n\nWith `async`/`await` the same logic is harder to get wrong: `const user = await getUser(id); const orders = await getOrders(user.name); return user.name + ': ' + orders.length + ' orders';`. Either way the two lookups run one after the other, which is required here because the second depends on the first.",
    examples: [
      { input: [1], expected: 'Ada: 2 orders' },
      { input: [3], expected: 'Sam: 1 orders' },
    ],
    hiddenTests: [
      { input: [2], expected: 'Lin: 0 orders' },
      { input: [4], expected: 'Mia: 4 orders' },
      { input: [5], expected: 'Zed: 3 orders' },
      { input: [1], expected: 'Ada: 2 orders' },
    ],
  },
  // ------------------------------------------------------------------ 136
  {
    id: 'js-retry-loop-keeps-going',
    number: 136,
    language: 'javascript',
    title: 'Retrying After It Worked',
    difficulty: 'Medium',
    topic: 'Async',
    statement:
      "`retry(outcomes, maxAttempts)` simulates a flaky operation: attempt number k yields `outcomes[k]`, where a number means success with that value and a string means failure with that error message (`outcomes` always has at least `maxAttempts` entries, and `maxAttempts` is at least 1). It should stop at the FIRST success and resolve to `{ ok: true, value, attempts }`, or, if all `maxAttempts` attempts fail, to `{ ok: false, error, attempts }` with the message of the LAST failure. `attempts` is the number of attempts actually made.",
    functionName: 'retry',
    functionSignature:
      'async function retry(outcomes: (number | string)[], maxAttempts: number): Promise<{ ok: boolean; value?: number; error?: string; attempts: number }>',
    buggyCode: `async function retry(outcomes, maxAttempts) {
  let calls = 0;

  // The flaky operation: consumes one outcome per call.
  async function attempt() {
    const outcome = outcomes[calls];
    calls++;
    await null;
    if (typeof outcome !== 'number') throw new Error(outcome);
    return outcome;
  }

  let value = null;
  let lastError = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      value = await attempt();
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) {
    return { ok: false, error: lastError.message, attempts: calls };
  }
  return { ok: true, value: value, attempts: calls };
}
`,
    hint: 'Trace `["timeout", 8, 9]` with three attempts. What happens after the 8 arrives?',
    explanation:
      "A retry loop has two exits: success (stop immediately) and exhaustion (give up). This loop has only the second. After a successful attempt it carries on calling the operation, which repeats side effects, overwrites the good value, and inflates `attempts`. Then the verdict is taken from `lastError`, which stays set from an earlier failure even when a later attempt succeeded, so fail-then-succeed is reported as a failure.\n\nReturn from inside the `try` as soon as an attempt works: `const value = await attempt(); return { ok: true, value: value, attempts: calls };`. Only when the loop runs out does control reach the bottom, where the result is unconditionally the failure built from `lastError`.\n\nAdding just a `break` is not enough: the `if (lastError)` test below would still misreport a success that followed a failure. Decide the outcome at the moment you know it. Cost is at most `maxAttempts` calls.",
    examples: [
      { input: [[5, 'x', 'y'], 3], expected: { ok: true, value: 5, attempts: 1 } },
      { input: [['timeout', 8, 9], 3], expected: { ok: true, value: 8, attempts: 2 } },
      { input: [['a', 'b', 'c'], 3], expected: { ok: false, error: 'c', attempts: 3 } },
    ],
    hiddenTests: [
      { input: [['a', 'b', 7], 2], expected: { ok: false, error: 'b', attempts: 2 } },
      { input: [['down', 'down', 0, 'late'], 4], expected: { ok: true, value: 0, attempts: 3 } },
      { input: [['nope'], 1], expected: { ok: false, error: 'nope', attempts: 1 } },
      { input: [[42], 1], expected: { ok: true, value: 42, attempts: 1 } },
      { input: [['e1', 'e2', 'e3', 4, 5], 5], expected: { ok: true, value: 4, attempts: 4 } },
    ],
  },
  // ------------------------------------------------------------------ 137
  {
    id: 'js-stale-closure-click-handler',
    number: 137,
    language: 'javascript',
    title: 'The Handler Remembers an Old Count',
    difficulty: 'Medium',
    topic: 'Closures',
    statement:
      "`countClicks(start, clicks)` models a tiny UI: `render()` produces a view with a label and an `onClick` handler. The view is rendered once, the user then clicks `clicks` times in a quick burst (all on that same rendered view), and the screen is rendered again. The function returns the final label, which should be `\"Count: \" + (start + clicks)`. However many times the user clicks, the count only ever goes up by one.",
    functionName: 'countClicks',
    functionSignature: 'function countClicks(start: number, clicks: number): string',
    buggyCode: `function countClicks(start, clicks) {
  let state = { count: start };

  function setState(next) {
    state = next;
  }

  function render() {
    const count = state.count;
    return {
      label: 'Count: ' + count,
      onClick: function () {
        setState({ count: count + 1 });
      },
    };
  }

  const view = render(); // drawn once before the burst of clicks
  for (let i = 0; i < clicks; i++) {
    view.onClick();
  }
  return render().label;
}
`,
    hint: 'When was the `count` that `onClick` uses read from the state?',
    explanation:
      "`onClick` closes over `count`, a constant that was copied out of the state when `render` ran. The closure keeps that snapshot alive, so every click in the burst computes `snapshot + 1` and stores the same number. This is the classic stale closure: the handler is correct for the render it belongs to, and wrong as soon as the state moves on without a re-render.\n\nMake the handler read the CURRENT state at the moment it runs instead of a value captured earlier: `setState({ count: state.count + 1 });`. `state` is a variable of the enclosing function that is reassigned, and closures see variables, not copies, so each click observes the previous click's update. UI libraries offer the same idea as an updater function (`setCount(c => c + 1)`).\n\nThe snapshot is still right for the label: a label should show the value at render time. Only the update must be based on live state.",
    examples: [
      { input: [0, 3], expected: 'Count: 3' },
      { input: [10, 2], expected: 'Count: 12' },
      { input: [5, 0], expected: 'Count: 5' },
    ],
    hiddenTests: [
      { input: [0, 1], expected: 'Count: 1' },
      { input: [-2, 5], expected: 'Count: 3' },
      { input: [7, 10], expected: 'Count: 17' },
      { input: [100, 4], expected: 'Count: 104' },
    ],
  },
  // ------------------------------------------------------------------ 138
  {
    id: 'js-undeclared-variable-in-recursion',
    number: 138,
    language: 'javascript',
    title: 'One Variable for Every Call',
    difficulty: 'Medium',
    topic: 'Scope',
    statement:
      "`listTeam(person)` receives an org-chart node `{ name, reports }` (where `reports` is an array of nodes of the same shape) and should return every name in that person's organisation: the person first, then each report's whole team in order (a pre-order walk). It works for someone with no reports, but for a manager the result loses the manager and repeats people.",
    functionName: 'listTeam',
    functionSignature: 'function listTeam(person: { name: string; reports: any[] }): string[]',
    buggyCode: `function listTeam(person) {
  names = [person.name];
  for (const report of person.reports) {
    const below = listTeam(report);
    names = names.concat(below);
  }
  return names;
}
`,
    hint: 'Where is `names` declared? How many separate `names` exist while the recursion is three levels deep?',
    explanation:
      "`names` is assigned without `let`, `const` or `var`. In sloppy-mode JavaScript that silently creates a single GLOBAL variable (in strict mode or a module it is a ReferenceError instead). A recursive function relies on each call having its own locals, but here every level of the recursion reads and overwrites the same `names`: the recursive call for a report replaces the manager's list with the report's list, and the manager then appends `below` to that.\n\nDeclare it: `let names = [person.name];`. Each invocation then gets a fresh binding and the recursion composes correctly. (Declaring `names` once at the top of the file, outside the function, does not help: it is still one variable shared by every call.)\n\nThis is the reason to run code in strict mode and to enable the linter rule `no-undef`. The walk visits each person once; with `concat` copying at each level the cost is O(n x depth), or O(n) if you push into one accumulator passed down as a parameter.",
    examples: [
      { input: [{ name: 'Ada', reports: [{ name: 'Bo', reports: [] }, { name: 'Cy', reports: [] }] }], expected: ['Ada', 'Bo', 'Cy'] },
      { input: [{ name: 'Solo', reports: [] }], expected: ['Solo'] },
      {
        input: [{ name: 'A', reports: [{ name: 'B', reports: [{ name: 'D', reports: [] }] }, { name: 'C', reports: [] }] }],
        expected: ['A', 'B', 'D', 'C'],
      },
    ],
    hiddenTests: [
      { input: [{ name: 'Top', reports: [{ name: 'Mid', reports: [{ name: 'Low', reports: [] }] }] }], expected: ['Top', 'Mid', 'Low'] },
      {
        input: [
          {
            name: 'R',
            reports: [
              { name: 'X', reports: [{ name: 'X1', reports: [] }, { name: 'X2', reports: [] }] },
              { name: 'Y', reports: [{ name: 'Y1', reports: [] }] },
            ],
          },
        ],
        expected: ['R', 'X', 'X1', 'X2', 'Y', 'Y1'],
      },
      { input: [{ name: 'Pat', reports: [{ name: 'Pat', reports: [] }] }], expected: ['Pat', 'Pat'] },
      { input: [{ name: 'Lone', reports: [] }], expected: ['Lone'] },
      {
        input: [{ name: 'M', reports: [{ name: 'a', reports: [] }, { name: 'b', reports: [] }, { name: 'c', reports: [] }] }],
        expected: ['M', 'a', 'b', 'c'],
      },
    ],
  },
  // ------------------------------------------------------------------ 139
  {
    id: 'js-class-method-passed-detached',
    number: 139,
    language: 'javascript',
    title: 'A Method Handed Over Without Its Object',
    difficulty: 'Medium',
    topic: 'this Binding',
    statement:
      "`tallyVotes(votes)` should return an object mapping each candidate name to the number of votes they received, e.g. `tallyVotes(['ann', 'bob', 'ann'])` gives `{ ann: 2, bob: 1 }`. No votes gives `{}`. With any votes at all it throws a TypeError.",
    functionName: 'tallyVotes',
    functionSignature: 'function tallyVotes(votes: string[]): Record<string, number>',
    buggyCode: `class Tally {
  constructor() {
    this.counts = {};
  }
  record(name) {
    this.counts[name] = (this.counts[name] || 0) + 1;
  }
}

function tallyVotes(votes) {
  const tally = new Tally();
  votes.forEach(tally.record);
  return tally.counts;
}
`,
    hint: '`tally.record` (no parentheses) is just a function value. Who calls it, and with what `this`?',
    explanation:
      "`this` is decided at the call, not at the definition. `tally.record(x)` sets `this` to `tally` because of the dot at the call site. But `votes.forEach(tally.record)` only LOOKS UP the function and passes the bare function along; `forEach` later invokes it as a plain function. Class bodies are always strict, so `this` is `undefined` and `this.counts` throws.\n\nKeep the object attached, in any of these ways:\n- wrap the call: `votes.forEach(name => tally.record(name));`\n- bind it: `votes.forEach(tally.record.bind(tally));`\n- use `forEach`'s second parameter: `votes.forEach(tally.record, tally);`\n\nThe same thing happens whenever a method is used as a callback or event handler (`button.onclick = widget.handle`, `setTimeout(obj.tick, 0)`, `const { record } = tally`). The count itself is one pass, O(n).",
    examples: [
      { input: [['ann', 'bob', 'ann']], expected: { ann: 2, bob: 1 } },
      { input: [['zed']], expected: { zed: 1 } },
      { input: [[]], expected: {} },
    ],
    hiddenTests: [
      { input: [['a', 'a', 'a', 'a']], expected: { a: 4 } },
      { input: [['x', 'y', 'z', 'y', 'x', 'y']], expected: { x: 2, y: 3, z: 1 } },
      { input: [['Ann', 'ann']], expected: { Ann: 1, ann: 1 } },
      { input: [['q', 'r']], expected: { q: 1, r: 1 } },
    ],
  },
  // ------------------------------------------------------------------ 140
  {
    id: 'js-debounce-timer-not-restarted',
    number: 140,
    language: 'javascript',
    title: 'Debounce That Fires Mid-Burst',
    difficulty: 'Medium',
    topic: 'Timing',
    statement:
      "`debounceFires(calls, wait)` simulates a trailing debounce. `calls` is a strictly increasing list of timestamps (ms) at which the debounced function is invoked. Every invocation (re)starts a countdown of `wait` ms, and the real function fires when a countdown reaches zero without being restarted, i.e. `wait` ms after the last invocation of a burst. An invocation arriving exactly at the moment a countdown ends comes too late to stop it and starts a new burst. Return the list of times at which the real function fires, in order. Currently a long burst of rapid calls fires in the middle of the burst.",
    functionName: 'debounceFires',
    functionSignature: 'function debounceFires(calls: number[], wait: number): number[]',
    buggyCode: `function debounceFires(calls, wait) {
  const fires = [];
  let deadline = null; // when the pending countdown ends, or null if none

  for (const t of calls) {
    if (deadline !== null && t >= deadline) {
      fires.push(deadline);
      deadline = null;
    }
    if (deadline === null) {
      deadline = t + wait;
    }
  }

  if (deadline !== null) fires.push(deadline);
  return fires;
}
`,
    hint: 'Calls at 0, 50 and 120 with a 100 ms wait are never 100 ms apart. When should the single fire happen?',
    explanation:
      "Debouncing means \"wait until things have been quiet for `wait` ms\". The quiet period is measured from the LATEST call, so every call must push the deadline back. This code only sets a deadline when none is pending, so the deadline stays anchored to the first call of the burst. That is a different behaviour (closer to a throttle): during continuous typing it fires every `wait` ms instead of once at the end.\n\nIn a real implementation the missing piece is `clearTimeout(timer)` before `timer = setTimeout(fn, wait)`. In this simulation it is the same idea: after flushing a countdown that has already elapsed (`t >= deadline`), ALWAYS set `deadline = t + wait`.\n\nKeep the comparison as `>=`: a call landing exactly on the deadline is too late to cancel that fire. The simulation is a single pass, O(n) time and O(1) extra space besides the output.",
    examples: [
      { input: [[0, 50, 120], 100], expected: [220] },
      { input: [[0, 300], 100], expected: [100, 400] },
      { input: [[0, 100], 100], expected: [100, 200] },
    ],
    hiddenTests: [
      { input: [[], 100], expected: [] },
      { input: [[7], 30], expected: [37] },
      { input: [[0, 10, 20, 30, 40, 50, 60], 25], expected: [85] },
      { input: [[0, 99, 198, 500, 550], 100], expected: [298, 650] },
      { input: [[5, 6, 106, 107, 300], 100], expected: [106, 207, 400] },
      { input: [[0, 40, 80, 119, 400, 499, 599], 100], expected: [219, 599, 699] },
    ],
  },
  // ------------------------------------------------------------------ 141
  {
    id: 'js-assigning-to-getter-only-property',
    number: 141,
    language: 'javascript',
    title: 'Writing to a Read-Only Accessor',
    difficulty: 'Medium',
    topic: 'Classes',
    statement:
      "A `Temperature` stores degrees Celsius and exposes the Fahrenheit equivalent as the property `fahrenheit` (F = C x 9 / 5 + 32). `warmUp(celsius, degreesF)` creates a temperature, raises it by `degreesF` Fahrenheit degrees through that property, and returns `{ celsius, fahrenheit }` for the result. For example `warmUp(0, 18)` should return `{ celsius: 10, fahrenheit: 50 }`. The temperature never changes.",
    functionName: 'warmUp',
    functionSignature: 'function warmUp(celsius: number, degreesF: number): { celsius: number; fahrenheit: number }',
    buggyCode: `class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
  get fahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }
}

function warmUp(celsius, degreesF) {
  const t = new Temperature(celsius);
  t.fahrenheit = t.fahrenheit + degreesF;
  return { celsius: t.celsius, fahrenheit: t.fahrenheit };
}
`,
    hint: 'Reading `t.fahrenheit` runs the getter. What runs when you assign to it?',
    explanation:
      "`fahrenheit` is an accessor property with a getter and no setter. Assigning to such a property does nothing: in sloppy mode the write is silently dropped, in strict mode it throws a TypeError. No own data property is created either, because the accessor on the prototype intercepts the assignment. So `celsius` is untouched and the getter keeps reporting the old value.\n\nGive the accessor its other half, converting back into the one value that is actually stored: `set fahrenheit(f) { this.celsius = ((f - 32) * 5) / 9; }`. Now `t.fahrenheit = ...` updates `celsius` and both views stay consistent.\n\nTwo tempting mistakes: a setter that assigns `this.fahrenheit = f` calls itself forever, and replacing the getter with a plain `fahrenheit` field stored in the constructor gives two copies of the truth that drift apart (the field changes, `celsius` does not). Keep one stored value and derive the other.",
    examples: [
      { input: [0, 18], expected: { celsius: 10, fahrenheit: 50 } },
      { input: [100, -180], expected: { celsius: 0, fahrenheit: 32 } },
      { input: [20, 9], expected: { celsius: 25, fahrenheit: 77 } },
    ],
    hiddenTests: [
      { input: [37, 0], expected: { celsius: 37, fahrenheit: 98.6 } },
      { input: [-40, 72], expected: { celsius: 0, fahrenheit: 32 } },
      { input: [10, -90], expected: { celsius: -40, fahrenheit: -40 } },
      { input: [0, 1], expected: { celsius: 0.5555555555555556, fahrenheit: 33 } },
    ],
  },
  // ------------------------------------------------------------------ 142
  {
    id: 'js-generator-consumed-twice',
    number: 142,
    language: 'javascript',
    title: 'A Generator Only Runs Once',
    difficulty: 'Medium',
    topic: 'Generators',
    statement:
      "`passStats(scores, cutoff)` should return `{ count, average }` for the scores that are greater than or equal to `cutoff`: how many there are and their mean. When no score passes, both are 0. The count is right, but the average always comes back as 0.",
    functionName: 'passStats',
    functionSignature: 'function passStats(scores: number[], cutoff: number): { count: number; average: number }',
    buggyCode: `function* passing(scores, cutoff) {
  for (const score of scores) {
    if (score >= cutoff) yield score;
  }
}

function passStats(scores, cutoff) {
  const passed = passing(scores, cutoff);

  let count = 0;
  for (const score of passed) {
    count++;
  }

  let total = 0;
  for (const score of passed) {
    total += score;
  }

  return { count: count, average: count === 0 ? 0 : total / count };
}
`,
    hint: 'How many times does the body of the second loop run?',
    explanation:
      "Calling a generator function returns a generator object, which is an iterator: a one-shot cursor, not a collection. The first `for...of` drives it to completion. Asking a finished generator for its iterator just returns the same finished object, so the second loop sees `done: true` immediately and its body never runs. `total` stays 0.\n\nPick one of these:\n- Materialise once and reuse: `const passed = [...passing(scores, cutoff)];` An array can be iterated as often as you like.\n- Do everything in a single pass: increment `count` and add to `total` in the same loop.\n- Create a fresh generator for each pass by calling `passing(scores, cutoff)` again.\n\nThe single pass is the cheapest: O(n) time and O(1) memory, which is the reason to use a generator in the first place. The same one-shot rule applies to `map.entries()`, `str.matchAll()` and any other iterator.",
    examples: [
      { input: [[80, 40, 90, 55], 60], expected: { count: 2, average: 85 } },
      { input: [[10, 20], 50], expected: { count: 0, average: 0 } },
      { input: [[70], 70], expected: { count: 1, average: 70 } },
    ],
    hiddenTests: [
      { input: [[], 10], expected: { count: 0, average: 0 } },
      { input: [[1, 2, 3, 4], 0], expected: { count: 4, average: 2.5 } },
      { input: [[50, 49, 51, 50], 50], expected: { count: 3, average: 50.333333333333336 } },
      { input: [[0, 0, -5], 0], expected: { count: 2, average: 0 } },
      { input: [[100, 99, 12], 99], expected: { count: 2, average: 99.5 } },
    ],
  },
  // ------------------------------------------------------------------ 143
  {
    id: 'js-urgent-jobs-on-the-slow-queue',
    number: 143,
    language: 'javascript',
    title: 'Urgent Jobs in the Slow Lane',
    difficulty: 'Medium',
    topic: 'Event Loop',
    statement:
      "`runJobs(jobs)` receives jobs like `{ name: 'save', urgent: true }`. Each job, when it runs, appends its name to a log. No job may run while the jobs are still being scheduled: once they are all scheduled the function logs `\"queued\"`, and only then do the jobs run. EVERY urgent job must run before ANY non-urgent job, and within each group jobs run in input order. The function resolves to the finished log. At the moment urgent jobs end up after the others.",
    functionName: 'runJobs',
    functionSignature: 'async function runJobs(jobs: { name: string; urgent: boolean }[]): Promise<string[]>',
    buggyCode: `async function runJobs(jobs) {
  const log = [];

  for (const job of jobs) {
    const run = function () {
      log.push(job.name);
    };
    if (job.urgent) {
      setTimeout(run, 0);
    } else {
      Promise.resolve().then(run);
    }
  }
  log.push('queued');

  // Give everything that was scheduled time to run.
  await new Promise(function (resolve) {
    setTimeout(resolve, 2);
  });
  return log;
}
`,
    hint: 'Which is processed first once the current code finishes: promise callbacks or a 0 ms timer?',
    explanation:
      "The event loop has two kinds of queue. Promise reactions (`.then`, `await`, `queueMicrotask`) are MICROTASKS: the engine drains all of them as soon as the currently running code finishes. Timers are MACROTASKS (tasks): the loop takes one only after the microtask queue is empty. So `setTimeout(fn, 0)` does not mean \"immediately\"; it means \"after the current code and after every pending microtask\". The code puts urgent work on the slow queue and background work on the fast one.\n\nSwap them: schedule urgent jobs with `Promise.resolve().then(run)` (or `queueMicrotask(run)`) and the rest with `setTimeout(run, 0)`. Microtasks run in the order they were queued, and equal-delay timers fire in the order they were set, so input order is preserved inside each group.\n\nPutting both groups on the same queue is not enough: they would then simply run in input order, and a non-urgent job listed first would still beat an urgent one. Running the jobs directly in the loop is not allowed either, since `\"queued\"` must be logged before any job.",
    examples: [
      {
        input: [[{ name: 'report', urgent: false }, { name: 'save', urgent: true }]],
        expected: ['queued', 'save', 'report'],
      },
      {
        input: [[{ name: 'a', urgent: true }, { name: 'b', urgent: false }, { name: 'c', urgent: true }, { name: 'd', urgent: false }]],
        expected: ['queued', 'a', 'c', 'b', 'd'],
      },
      { input: [[]], expected: ['queued'] },
    ],
    hiddenTests: [
      { input: [[{ name: 'x', urgent: true }, { name: 'y', urgent: true }]], expected: ['queued', 'x', 'y'] },
      { input: [[{ name: 'x', urgent: false }, { name: 'y', urgent: false }]], expected: ['queued', 'x', 'y'] },
      {
        input: [[{ name: 'low1', urgent: false }, { name: 'low2', urgent: false }, { name: 'hi', urgent: true }]],
        expected: ['queued', 'hi', 'low1', 'low2'],
      },
      {
        input: [[{ name: 'h1', urgent: true }, { name: 'l1', urgent: false }, { name: 'h2', urgent: true }, { name: 'h3', urgent: true }]],
        expected: ['queued', 'h1', 'h2', 'h3', 'l1'],
      },
      { input: [[{ name: 'solo', urgent: false }]], expected: ['queued', 'solo'] },
    ],
  },
  // ------------------------------------------------------------------ 144
  {
    id: 'js-memo-key-runs-arguments-together',
    number: 144,
    language: 'javascript',
    title: 'Two Rooms, One Cache Entry',
    difficulty: 'Medium',
    topic: 'Memoization',
    statement:
      "`areaReport(rooms)` receives rooms as `[width, height]` pairs of positive integers and returns `{ areas, computed }`: `areas` lists each room's area in input order, and `computed` is how many times the area was actually calculated rather than served from the cache. Results are cached per exact `(width, height)` pair, so `computed` equals the number of distinct pairs; `[2, 3]` and `[3, 2]` are different pairs. Some rooms are being given another room's area.",
    functionName: 'areaReport',
    functionSignature: 'function areaReport(rooms: [number, number][]): { areas: number[]; computed: number }',
    buggyCode: `function areaReport(rooms) {
  const cache = {};
  let computed = 0;

  function area(width, height) {
    const key = '' + width + height;
    if (!(key in cache)) {
      computed++;
      cache[key] = width * height;
    }
    return cache[key];
  }

  const areas = rooms.map(function (room) {
    return area(room[0], room[1]);
  });
  return { areas: areas, computed: computed };
}
`,
    hint: 'Write down the cache key for a 1 x 23 room and for a 12 x 3 room.',
    explanation:
      "A memoization key must be different whenever the arguments are different. Gluing the numbers together with nothing between them loses the boundary: `(1, 23)` and `(12, 3)` both become `\"123\"`, so the second room is served the first room's cached area. The function is fast and wrong, and only for particular inputs, which makes this kind of bug hard to spot.\n\nBuild a key that cannot collide by putting in a separator that cannot appear inside an argument: `const key = width + ',' + height;` (or `JSON.stringify([width, height])`, which also copes with strings and nested values). A two-level cache, `cache[width][height]`, works as well.\n\nDo not overcorrect by sorting the pair or keying on the product: the contract caches per exact pair, so `[2, 3]` and `[3, 2]` are separate entries, and `2 x 6` must not share an entry with `3 x 4`. Lookups are O(1), the report is O(n).",
    examples: [
      { input: [[[1, 23], [12, 3]]], expected: { areas: [23, 36], computed: 2 } },
      { input: [[[4, 5], [4, 5], [2, 2]]], expected: { areas: [20, 20, 4], computed: 2 } },
      { input: [[[2, 3], [3, 2]]], expected: { areas: [6, 6], computed: 2 } },
    ],
    hiddenTests: [
      { input: [[]], expected: { areas: [], computed: 0 } },
      { input: [[[11, 1], [1, 11], [1, 11]]], expected: { areas: [11, 11, 11], computed: 2 } },
      { input: [[[2, 6], [3, 4]]], expected: { areas: [12, 12], computed: 2 } },
      { input: [[[10, 10], [1, 10], [101, 1], [10, 110]]], expected: { areas: [100, 10, 101, 1100], computed: 4 } },
      { input: [[[7, 7], [7, 7], [7, 7]]], expected: { areas: [49, 49, 49], computed: 1 } },
      { input: [[[1, 5], [2, 4]]], expected: { areas: [5, 8], computed: 2 } },
    ],
  },
  // ------------------------------------------------------------------ 145
  {
    id: 'js-throttle-rejected-calls-reset-window',
    number: 145,
    language: 'javascript',
    title: 'Throttle That Starves',
    difficulty: 'Medium',
    topic: 'Timing',
    statement:
      "`throttle(calls, interval)` simulates a leading-edge throttle. `calls` is a strictly increasing list of non-negative timestamps (ms). The first call is always let through; after that a call is let through only if at least `interval` ms have passed since the last call that WAS let through (exactly `interval` ms is enough). Return the timestamps that are let through. With a steady stream of rapid calls, only the very first one ever gets through.",
    functionName: 'throttle',
    functionSignature: 'function throttle(calls: number[], interval: number): number[]',
    buggyCode: `function throttle(calls, interval) {
  const accepted = [];
  let last = null; // timestamp the window is measured from

  for (const t of calls) {
    if (last === null || t - last >= interval) {
      accepted.push(t);
    }
    last = t;
  }
  return accepted;
}
`,
    hint: 'Calls arrive every 40 ms with a 100 ms interval. What is `last` when the call at 120 is examined?',
    explanation:
      "A throttle guarantees a steady trickle: at most one call per `interval`, measured from the last call that was allowed to run. This code moves `last` on EVERY call, including the ones it rejects. Under a continuous stream each call is always close to the (rejected) call before it, so nothing after the first ever passes. Resetting the window on every call is debounce behaviour, and it turns a rate limiter into a blocker.\n\nUpdate the reference point only when a call is accepted: move `last = t;` inside the `if`, next to `accepted.push(t)`.\n\nKeep the two details the contract fixes: `last` starts as `null` so the first call always passes whatever its timestamp (initialising it to 0 would wrongly reject a first call at t = 50), and the comparison is `>=` so a call exactly `interval` ms later is allowed. One pass, O(n) time.",
    examples: [
      { input: [[0, 40, 80, 120, 160], 100], expected: [0, 120] },
      { input: [[0, 100, 200], 100], expected: [0, 100, 200] },
      { input: [[50, 160], 100], expected: [50, 160] },
    ],
    hiddenTests: [
      { input: [[], 100], expected: [] },
      { input: [[30], 1000], expected: [30] },
      { input: [[0, 10, 20, 30, 40, 50, 60, 70], 25], expected: [0, 30, 60] },
      { input: [[5, 99, 104, 105, 204, 206], 100], expected: [5, 105, 206] },
      { input: [[0, 500, 1000], 100], expected: [0, 500, 1000] },
      { input: [[10, 60, 109, 110, 209], 100], expected: [10, 110] },
    ],
  },
  // ------------------------------------------------------------------ 146
  {
    id: 'js-slow-response-overwrites-newer-one',
    number: 146,
    language: 'javascript',
    title: 'The Slow Response Wins',
    difficulty: 'Hard',
    topic: 'Async',
    statement:
      "`typeAhead(requests)` models a search box. The user types the queries in `requests` in order, and each one immediately fires a request (`search`) that answers after its own `ms` milliseconds, so answers can arrive in any order. Once every request has answered, the function resolves to what the screen shows, which must be the results for the LAST query typed, however the answers were ordered. With no requests the screen shows `\"\"`. Right now the screen shows whichever answer happened to arrive last.",
    functionName: 'typeAhead',
    functionSignature: 'async function typeAhead(requests: { q: string; ms: number }[]): Promise<string>',
    buggyCode: `// Pretend network search that answers after ms milliseconds.
function search(q, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('results for ' + q);
    }, ms);
  });
}

async function typeAhead(requests) {
  let shown = '';

  const pending = requests.map(function (request) {
    return search(request.q, request.ms).then(function (results) {
      shown = results;
    });
  });

  await Promise.all(pending);
  return shown;
}
`,
    hint: 'When an answer arrives, how can its handler tell whether a newer query has been sent since?',
    explanation:
      "Requests are sent in order, but nothing makes the answers come back in order. Each handler unconditionally writes to the shared `shown`, so the final value belongs to the SLOWEST request. When an early query (`c`) is slower than a later one (`ca`), the stale answer lands on top of the fresh one. This is the classic out-of-order response race in autocomplete, tab switching and pagination.\n\nGive every request an identity and let a handler apply its answer only if it is still the newest request. For example keep `let latest = 0;` and, in the `map` callback, `const id = ++latest;` before calling `search`; in the handler, `if (id === latest) shown = results;`. By the time any answer arrives, `latest` names the last request sent, so older answers are dropped. Real code does the same with a request counter, by comparing against the current input value, or by cancelling the previous request with an `AbortController`.\n\n\"First answer wins\" (`if (!shown) ...`) is not a fix: it fails whenever the last query is not the fastest. The guard costs O(1) per response.",
    examples: [
      { input: [[{ q: 'c', ms: 5 }, { q: 'ca', ms: 0 }]], expected: 'results for ca' },
      { input: [[{ q: 'd', ms: 0 }, { q: 'do', ms: 5 }]], expected: 'results for do' },
      { input: [[{ q: 'solo', ms: 1 }]], expected: 'results for solo' },
    ],
    hiddenTests: [
      { input: [[]], expected: '' },
      { input: [[{ q: 'a', ms: 0 }, { q: 'ab', ms: 5 }, { q: 'abc', ms: 2 }]], expected: 'results for abc' },
      { input: [[{ q: 'x', ms: 5 }, { q: 'xy', ms: 2 }, { q: 'xyz', ms: 0 }]], expected: 'results for xyz' },
      { input: [[{ q: 'm', ms: 2 }, { q: 'mo', ms: 0 }, { q: 'moo', ms: 5 }]], expected: 'results for moo' },
      { input: [[{ q: 'same', ms: 1 }, { q: 'same2', ms: 1 }]], expected: 'results for same2' },
    ],
  },
  // ------------------------------------------------------------------ 147
  {
    id: 'js-try-catch-misses-returned-promise',
    number: 147,
    language: 'javascript',
    title: 'The catch That Never Catches',
    difficulty: 'Hard',
    topic: 'Error Handling',
    statement:
      "`safeReserve(item)` should never reject. It resolves to `\"reserved <item>\"` when the async `reserve` succeeds, and to `\"failed: <error message>\"` when `reserve` rejects (unknown item or out of stock). The success case works, but failures escape as rejections even though the call sits inside `try`/`catch`.",
    functionName: 'safeReserve',
    functionSignature: 'async function safeReserve(item: string): Promise<string>',
    buggyCode: `const STOCK = { widget: 4, gadget: 0, gizmo: 1 };

// Pretend this talks to the warehouse service.
async function reserve(item) {
  await null;
  if (!(item in STOCK)) throw new Error('unknown item: ' + item);
  if (STOCK[item] === 0) throw new Error('out of stock: ' + item);
  return 'reserved ' + item;
}

async function safeReserve(item) {
  try {
    return reserve(item);
  } catch (err) {
    return 'failed: ' + err.message;
  }
}
`,
    hint: 'At the moment the `try` block is exited, has `reserve` failed yet?',
    explanation:
      "`try`/`catch` only sees exceptions thrown WHILE the `try` block is executing. `reserve(item)` does not throw: it returns a promise that will reject later. `return reserve(item)` hands that still-pending promise out of the function, the `try` block is over, and when the rejection happens there is no handler left around it. The async function's own promise simply adopts the rejection.\n\nWait for the promise inside the block: `return await reserve(item);`. `await` turns a rejection into an exception thrown at that line, which is inside the `try`, so the `catch` runs. This is the one place where `return await` is not redundant.\n\nEquivalent without try/catch: `return reserve(item).catch(err => 'failed: ' + err.message);`. Note that `await reserve(item);` with the `return` dropped catches the error but loses the success value. The rule also covers `finally`: cleanup after `return somePromise` runs before the work is finished unless you `await`.",
    examples: [
      { input: ['widget'], expected: 'reserved widget' },
      { input: ['gadget'], expected: 'failed: out of stock: gadget' },
      { input: ['sprocket'], expected: 'failed: unknown item: sprocket' },
    ],
    hiddenTests: [
      { input: ['gizmo'], expected: 'reserved gizmo' },
      { input: [''], expected: 'failed: unknown item: ' },
      { input: ['gadget'], expected: 'failed: out of stock: gadget' },
      { input: ['gizmo'], expected: 'reserved gizmo' },
      { input: ['Widget'], expected: 'failed: unknown item: Widget' },
    ],
  },
  // ------------------------------------------------------------------ 148
  {
    id: 'js-compound-assignment-across-await',
    number: 148,
    language: 'javascript',
    title: 'Lost Updates Across an await',
    difficulty: 'Hard',
    topic: 'Async',
    statement:
      "`totalSize(files)` asks a remote service for the size of every file (`fetchSize`, which answers after the file's `ms` milliseconds) with all requests in flight at the same time, and should resolve to the sum of all the sizes. No files gives 0. With more than one file the result is the size of just one of them.",
    functionName: 'totalSize',
    functionSignature: 'async function totalSize(files: { size: number; ms: number }[]): Promise<number>',
    buggyCode: `// Pretend remote lookup that answers after file.ms milliseconds.
function fetchSize(file) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(file.size);
    }, file.ms);
  });
}

async function totalSize(files) {
  let total = 0;

  await Promise.all(
    files.map(async function (file) {
      total += await fetchSize(file);
    })
  );

  return total;
}
`,
    hint: '`total += await x` is `total = total + (await x)`. Which part of that is evaluated before the pause?',
    explanation:
      "JavaScript is single-threaded, but an `await` is a point where other code runs, and a statement can straddle it. `total += await fetchSize(file)` means `total = total + (await fetchSize(file))`, evaluated left to right: the CURRENT `total` is read first, then the function pauses. All the callbacks start together, so each one reads `total` as 0, and when the answers come in each writes `0 + its own size`. Whichever finishes last wins. It is a read-modify-write race without any threads.\n\nMake the read and the write happen on the same side of the `await`: `const size = await fetchSize(file); total += size;`. After the pause the statement reads the up-to-date total and updates it with no interruption in between.\n\nBetter still, do not share mutable state between concurrent tasks: `const sizes = await Promise.all(files.map(fetchSize)); return sizes.reduce((a, b) => a + b, 0);`. Writing it as `total = total + await fetchSize(file)` changes nothing, it is the same statement spelled out.",
    examples: [
      { input: [[{ size: 10, ms: 1 }, { size: 20, ms: 1 }]], expected: 30 },
      { input: [[{ size: 5, ms: 3 }, { size: 7, ms: 0 }, { size: 9, ms: 1 }]], expected: 21 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[{ size: 42, ms: 0 }]], expected: 42 },
      { input: [[{ size: 1, ms: 0 }, { size: 1, ms: 0 }, { size: 1, ms: 0 }, { size: 1, ms: 0 }]], expected: 4 },
      { input: [[{ size: 100, ms: 0 }, { size: 0, ms: 4 }]], expected: 100 },
      { input: [[{ size: 0, ms: 4 }, { size: 100, ms: 0 }]], expected: 100 },
      { input: [[{ size: 3, ms: 2 }, { size: 4, ms: 2 }, { size: 5, ms: 0 }]], expected: 12 },
    ],
  },
  // ------------------------------------------------------------------ 149
  {
    id: 'js-array-on-prototype-shared-by-instances',
    number: 149,
    language: 'javascript',
    title: "Everyone Reads Everyone's Mail",
    difficulty: 'Hard',
    topic: 'Prototypes',
    statement:
      "`deliver(mail)` receives messages like `{ to: 'ann', text: 'hi' }`, creates one `Inbox` per recipient, and should return an object mapping each recipient to the list of texts sent to THAT recipient, in arrival order. Every call starts with no inboxes. Recipients are getting each other's messages, and even messages from earlier calls.",
    functionName: 'deliver',
    functionSignature: 'function deliver(mail: { to: string; text: string }[]): Record<string, string[]>',
    buggyCode: `function Inbox(owner) {
  this.owner = owner;
}
Inbox.prototype.messages = [];
Inbox.prototype.receive = function (text) {
  this.messages.push(text);
};

function deliver(mail) {
  const inboxes = {};
  for (const message of mail) {
    if (!inboxes[message.to]) {
      inboxes[message.to] = new Inbox(message.to);
    }
    inboxes[message.to].receive(message.text);
  }

  const result = {};
  for (const owner in inboxes) {
    result[owner] = inboxes[owner].messages;
  }
  return result;
}
`,
    hint: 'How many arrays does this program create, no matter how many inboxes are constructed?',
    explanation:
      "Everything on a prototype exists once and is shared by all instances. That is ideal for methods and harmless for primitive defaults, because ASSIGNING `this.x = ...` creates an own property that shadows the shared one. But `this.messages.push(text)` assigns nothing: it looks `messages` up, finds the single array on `Inbox.prototype`, and mutates it. Every inbox therefore pushes into the same array, and because the prototype lives as long as the program, messages from earlier calls are still there.\n\nPer-instance state must be created per instance, in the constructor: `function Inbox(owner) { this.owner = owner; this.messages = []; }` and delete the `Inbox.prototype.messages` line. Each `new Inbox` now owns a fresh array. With `class` syntax it is the same rule: initialise in the constructor (or a field initialiser), never on the prototype.\n\nEmptying the prototype's array at the start of `deliver` only hides the leak between calls; inside one call all recipients would still share it. Delivery is O(n) over the messages.",
    examples: [
      {
        input: [[{ to: 'ann', text: 'hi' }, { to: 'bob', text: 'yo' }, { to: 'ann', text: 'lunch?' }]],
        expected: { ann: ['hi', 'lunch?'], bob: ['yo'] },
      },
      { input: [[{ to: 'cy', text: 'one' }]], expected: { cy: ['one'] } },
      { input: [[]], expected: {} },
    ],
    hiddenTests: [
      { input: [[{ to: 'ann', text: 'again' }]], expected: { ann: ['again'] } },
      {
        input: [[{ to: 'x', text: '1' }, { to: 'y', text: '2' }, { to: 'z', text: '3' }]],
        expected: { x: ['1'], y: ['2'], z: ['3'] },
      },
      {
        input: [[{ to: 'dee', text: 'a' }, { to: 'dee', text: 'a' }, { to: 'dee', text: 'b' }]],
        expected: { dee: ['a', 'a', 'b'] },
      },
      {
        input: [[{ to: 'p', text: 'first' }, { to: 'q', text: 'second' }, { to: 'q', text: 'third' }, { to: 'p', text: 'fourth' }]],
        expected: { p: ['first', 'fourth'], q: ['second', 'third'] },
      },
    ],
  },
  // ------------------------------------------------------------------ 150
  {
    id: 'js-break-closes-the-generator',
    number: 150,
    language: 'javascript',
    title: 'break Slams the Generator Shut',
    difficulty: 'Hard',
    topic: 'Generators',
    statement:
      "`splitMessage(rows)` reads the rows of a message through the generator `reader` and should return `{ headers, body }`. The headers are the rows before the first empty string `\"\"`; the body is every row after it (later empty rows are part of the body). The separator itself belongs to neither. If there is no empty row, everything is a header and the body is `[]`. The headers come out right, but the body is always empty.",
    functionName: 'splitMessage',
    functionSignature: 'function splitMessage(rows: string[]): { headers: string[]; body: string[] }',
    buggyCode: `function* reader(rows) {
  for (const row of rows) {
    yield row;
  }
}

function splitMessage(rows) {
  const input = reader(rows);

  const headers = [];
  for (const row of input) {
    if (row === '') break;
    headers.push(row);
  }

  const body = [];
  for (const row of input) {
    body.push(row);
  }

  return { headers: headers, body: body };
}
`,
    hint: 'Leaving a `for...of` loop early does something to the iterator. Check what `input.next()` returns right after the first loop.',
    explanation:
      "The plan is sensible: consume the header rows, then let a second loop continue from where the first stopped. But `for...of` owns its iterator. When the loop is left early (`break`, `return` or a thrown error) it calls the iterator's `return()` method so the source can clean up. For a generator, `return()` finishes it for good: any `finally` blocks run and every later `next()` reports `done: true`. The second loop therefore has nothing to read.\n\nTo stop early and keep the generator alive, drive it by hand for the first phase:\n`let step = input.next(); while (!step.done && step.value !== '') { headers.push(step.value); step = input.next(); }`\nCalling `next()` yourself never triggers `return()`, so the following `for (const row of input)` picks up right after the separator. Alternatively skip the generator and use `rows.indexOf('')` with `slice`.\n\nReplacing `break` with `continue` is wrong: it would walk the whole input and file body rows under headers. Note that array iterators have no `return()` method, which is why the same two-loop pattern appears to work on `rows[Symbol.iterator]()` and then breaks when the source becomes a generator. One pass, O(n).",
    examples: [
      {
        input: [['To: ann', 'Subject: hi', '', 'Hello Ann', 'Bye']],
        expected: { headers: ['To: ann', 'Subject: hi'], body: ['Hello Ann', 'Bye'] },
      },
      { input: [['A: 1', '', 'x', '', 'y']], expected: { headers: ['A: 1'], body: ['x', '', 'y'] } },
      { input: [['Only: header']], expected: { headers: ['Only: header'], body: [] } },
    ],
    hiddenTests: [
      { input: [[]], expected: { headers: [], body: [] } },
      { input: [['', 'just body']], expected: { headers: [], body: ['just body'] } },
      { input: [['H: 1', 'H: 2', '']], expected: { headers: ['H: 1', 'H: 2'], body: [] } },
      { input: [['', '', 'z']], expected: { headers: [], body: ['', 'z'] } },
      { input: [['K: v', '', 'l1', 'l2', 'l3']], expected: { headers: ['K: v'], body: ['l1', 'l2', 'l3'] } },
    ],
  },
];
