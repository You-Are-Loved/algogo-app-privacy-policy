import type { BugFixProblem } from '../bugFixes';

// JavaScript "fix the bug" problems 101-125: arrays, objects, strings, regex,
// numbers, coercion and dates. Every test value is JSON-safe and independent
// of engine-specific behaviour (JavaScriptCore and V8 agree on all of them).

export const problems: BugFixProblem[] = [
  // ---------------------------------------------------------------- 101 Easy
  {
    id: 'js-splice-missing-index',
    number: 101,
    language: 'javascript',
    title: 'Removing What Is Not There',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      '`removeItem(list, item)` should return a NEW array equal to `list` with the first occurrence of `item` removed. When `item` does not appear in `list`, the result must contain exactly the same elements as `list`. Right now, asking to remove something that is not there quietly deletes a different element.',
    functionName: 'removeItem',
    functionSignature: 'function removeItem<T>(list: T[], item: T): T[]',
    buggyCode: `function removeItem(list, item) {
  const copy = list.slice();
  const index = copy.indexOf(item);
  copy.splice(index, 1);
  return copy;
}
`,
    hint: 'What does `indexOf` return when nothing matches, and what does `splice` do with that number as a start position?',
    explanation:
      '`indexOf` reports "not found" as `-1`. `splice` accepts negative start positions and counts them from the end, so `copy.splice(-1, 1)` removes the LAST element instead of doing nothing. The two APIs are each behaving as documented; the bug is passing one straight into the other. Check the index first (`if (index !== -1) copy.splice(index, 1)`), and remember that index 0 is a valid hit, so `index > 0` or a truthiness check would break removing the first element. A `findIndex`-based version or a single loop that skips the first match works equally well. O(n) time, O(n) space for the copy.',
    examples: [
      { input: [['a', 'b', 'c'], 'b'], expected: ['a', 'c'] },
      { input: [['a', 'b', 'c'], 'z'], expected: ['a', 'b', 'c'] },
    ],
    hiddenTests: [
      { input: [['a', 'b', 'c'], 'a'], expected: ['b', 'c'] },
      { input: [[1, 2, 1, 3], 1], expected: [2, 1, 3] },
      { input: [[], 'x'], expected: [] },
      { input: [[7], 8], expected: [7] },
      { input: [[4, 5, 6], 6], expected: [4, 5] },
    ],
  },
  // ---------------------------------------------------------------- 102 Easy
  {
    id: 'js-template-plain-quotes',
    number: 102,
    language: 'javascript',
    title: 'Template in Plain Quotes',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`cartMessage(name, count)` should return the sentence `Hi <name>, your cart has <count> item(s).` with the two values filled in, for example `Hi Ada, your cart has 3 item(s).` Customers are currently being shown the raw placeholders.',
    functionName: 'cartMessage',
    functionSignature: 'function cartMessage(name: string, count: number): string',
    buggyCode:
      "function cartMessage(name, count) {\n  return 'Hi ${name}, your cart has ${count} item(s).';\n}\n",
    hint: 'Look closely at the characters that open and close the string.',
    explanation:
      '`${...}` is only special inside a template literal, which is delimited by backticks. Inside single or double quotes it is ordinary text, so the function returns the placeholders verbatim and never reads its arguments. Switch the delimiters to backticks, or build the string with `+`. This slips through review easily because the code "looks" interpolated; a linter rule such as `no-template-curly-in-string` exists precisely for it.',
    examples: [
      { input: ['Ada', 3], expected: 'Hi Ada, your cart has 3 item(s).' },
      { input: ['Sam', 0], expected: 'Hi Sam, your cart has 0 item(s).' },
    ],
    hiddenTests: [
      { input: ['Mary Ann', 12], expected: 'Hi Mary Ann, your cart has 12 item(s).' },
      { input: ["O'Brien", 1], expected: "Hi O'Brien, your cart has 1 item(s)." },
      { input: ['', 5], expected: 'Hi , your cart has 5 item(s).' },
      { input: ['Zed', 100], expected: 'Hi Zed, your cart has 100 item(s).' },
    ],
  },
  // ---------------------------------------------------------------- 103 Easy
  {
    id: 'js-chained-comparison',
    number: 103,
    language: 'javascript',
    title: 'Chained Comparison',
    difficulty: 'Easy',
    topic: 'Operators',
    statement:
      '`isBetween(low, value, high)` should return true when `value` is strictly greater than `low` AND strictly less than `high`, and false otherwise (so the two boundaries themselves are not "between"). It was written the way the condition reads in maths, and it gives wrong answers for many inputs.',
    functionName: 'isBetween',
    functionSignature: 'function isBetween(low: number, value: number, high: number): boolean',
    buggyCode: `function isBetween(low, value, high) {
  return low < value < high;
}
`,
    hint: 'Evaluate `1 < 50 < 10` by hand, one operator at a time, left to right.',
    explanation:
      'JavaScript has no chained comparisons. `low < value < high` parses as `(low < value) < high`: the first comparison yields a boolean, which is then coerced to 0 or 1 and compared with `high`. So `1 < 50 < 10` becomes `true < 10`, i.e. `1 < 10`, which is true, while `0 < 0.5 < 1` becomes `1 < 1`, which is false. Write the two comparisons separately and join them: `low < value && value < high`.',
    examples: [
      { input: [1, 5, 10], expected: true },
      { input: [1, 50, 10], expected: false },
      { input: [0, 0.5, 1], expected: true },
    ],
    hiddenTests: [
      { input: [5, 3, 10], expected: false },
      { input: [1, 1, 10], expected: false },
      { input: [1, 10, 10], expected: false },
      { input: [-10, -5, -1], expected: true },
      { input: [-3, 0, 0.5], expected: true },
      { input: [2, 3, 2], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 104 Easy
  {
    id: 'js-parsefloat-thousands',
    number: 104,
    language: 'javascript',
    title: 'Thousands Separators',
    difficulty: 'Easy',
    topic: 'Numbers',
    statement:
      '`parseAmount(text)` receives an amount typed by a user, such as `"1,234.50"`: digits, with optional commas as thousands separators and an optional decimal part. Return it as a number (`1234.5`). Amounts under a thousand work, but larger ones come back tiny.',
    functionName: 'parseAmount',
    functionSignature: 'function parseAmount(text: string): number',
    buggyCode: `function parseAmount(text) {
  return parseFloat(text);
}
`,
    hint: 'What does `parseFloat` do when it reaches a character that cannot be part of a number?',
    explanation:
      '`parseFloat` reads the longest numeric prefix and silently ignores the rest. A comma is not part of a number, so `"1,234.50"` parses as `1` with no error and no NaN to warn you. Strip every separator before parsing: `text.replace(/,/g, "")` or `text.replaceAll(",", "")` or `text.split(",").join("")`. Note that `replace(",", "")` with a string pattern only removes the FIRST comma, so `"1,234,567.89"` would still be cut short.',
    examples: [
      { input: ['1,234.50'], expected: 1234.5 },
      { input: ['99.95'], expected: 99.95 },
    ],
    hiddenTests: [
      { input: ['1,234,567.89'], expected: 1234567.89 },
      { input: ['12'], expected: 12 },
      { input: ['10,000'], expected: 10000 },
      { input: ['0.5'], expected: 0.5 },
      { input: ['2,500,000'], expected: 2500000 },
    ],
  },
  // ---------------------------------------------------------------- 105 Medium
  {
    id: 'js-sort-subtract-strings',
    number: 105,
    language: 'javascript',
    title: 'Subtracting Strings in a Comparator',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      '`sortByName(people)` receives an array of `{ name, age }` objects and should return a new array sorted by `name` in ascending alphabetical order. Names consist of lowercase letters a-z only and no two people share a name. The comparator was copied from a function that sorted by age, and now the list comes back in its original order.',
    functionName: 'sortByName',
    functionSignature: 'function sortByName(people: { name: string; age: number }[]): { name: string; age: number }[]',
    buggyCode: `function sortByName(people) {
  return people.slice().sort((a, b) => a.name - b.name);
}
`,
    hint: 'Evaluate `"mia" - "ben"` in a console. What can a sort do with that answer?',
    explanation:
      'The `a - b` comparator idiom only works for numbers. Subtracting two non-numeric strings gives `NaN`, and the specification tells `sort` to treat a `NaN` comparator result as 0, meaning "these two are equal". Every pair looks equal, so the (stable) sort leaves the array untouched and no error is raised. For strings, return a real negative/zero/positive number: `a.name < b.name ? -1 : a.name > b.name ? 1 : 0`, or `a.name.localeCompare(b.name)`. Do not return the boolean `a.name > b.name`: it can never be negative, so the result depends on the engine. O(n log n).',
    examples: [
      {
        input: [[{ name: 'mia', age: 31 }, { name: 'ben', age: 25 }, { name: 'zoe', age: 40 }]],
        expected: [{ name: 'ben', age: 25 }, { name: 'mia', age: 31 }, { name: 'zoe', age: 40 }],
      },
      {
        input: [[{ name: 'bo', age: 9 }, { name: 'al', age: 70 }]],
        expected: [{ name: 'al', age: 70 }, { name: 'bo', age: 9 }],
      },
    ],
    hiddenTests: [
      {
        input: [[{ name: 'dee', age: 1 }, { name: 'cy', age: 2 }, { name: 'bea', age: 3 }, { name: 'abe', age: 4 }]],
        expected: [{ name: 'abe', age: 4 }, { name: 'bea', age: 3 }, { name: 'cy', age: 2 }, { name: 'dee', age: 1 }],
      },
      {
        input: [[{ name: 'ann', age: 50 }, { name: 'anna', age: 20 }, { name: 'an', age: 35 }]],
        expected: [{ name: 'an', age: 35 }, { name: 'ann', age: 50 }, { name: 'anna', age: 20 }],
      },
      { input: [[]], expected: [] },
      { input: [[{ name: 'solo', age: 8 }]], expected: [{ name: 'solo', age: 8 }] },
      {
        input: [[{ name: 'kai', age: 5 }, { name: 'ray', age: 6 }, { name: 'eve', age: 7 }, { name: 'lou', age: 8 }, { name: 'ada', age: 9 }]],
        expected: [{ name: 'ada', age: 9 }, { name: 'eve', age: 7 }, { name: 'kai', age: 5 }, { name: 'lou', age: 8 }, { name: 'ray', age: 6 }],
      },
    ],
  },
  // ---------------------------------------------------------------- 106 Easy
  {
    id: 'js-switch-strict-match',
    number: 106,
    language: 'javascript',
    title: 'switch Compares Strictly',
    difficulty: 'Easy',
    topic: 'Control Flow',
    statement:
      '`statusLabel(code)` should return `"OK"` for 200, `"Not Found"` for 404, `"Server Error"` for 500 and `"Unknown"` for anything else. The code may arrive as a number or as a string of digits such as `"404"` (it is sometimes read from a URL), and both forms must get the same label. String codes are all coming back as "Unknown".',
    functionName: 'statusLabel',
    functionSignature: 'function statusLabel(code: number | string): string',
    buggyCode: `function statusLabel(code) {
  switch (code) {
    case 200:
      return 'OK';
    case 404:
      return 'Not Found';
    case 500:
      return 'Server Error';
    default:
      return 'Unknown';
  }
}
`,
    hint: 'Which equality does `switch` use to match a `case`: the one behind `==` or the one behind `===`?',
    explanation:
      'A `switch` matches cases with strict equality (`===`), so there is no type coercion: the string `"404"` is not the number `404` and falls through to `default`. Normalise the value once at the top, `switch (Number(code))`, rather than duplicating every case for both types. `Number` is a good choice here because a non-numeric string becomes `NaN`, which matches no case and correctly ends up as "Unknown".',
    examples: [
      { input: [200], expected: 'OK' },
      { input: ['404'], expected: 'Not Found' },
      { input: [418], expected: 'Unknown' },
    ],
    hiddenTests: [
      { input: ['500'], expected: 'Server Error' },
      { input: ['200'], expected: 'OK' },
      { input: [404], expected: 'Not Found' },
      { input: ['abc'], expected: 'Unknown' },
      { input: ['302'], expected: 'Unknown' },
    ],
  },
  // ---------------------------------------------------------------- 107 Medium
  {
    id: 'js-foreach-return-lost',
    number: 107,
    language: 'javascript',
    title: 'Returning From forEach',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      '`firstOverLimit(readings, limit)` should return the first number in `readings` that is strictly greater than `limit`, or `null` when no reading is. It currently returns `null` for every input.',
    functionName: 'firstOverLimit',
    functionSignature: 'function firstOverLimit(readings: number[], limit: number): number | null',
    buggyCode: `function firstOverLimit(readings, limit) {
  readings.forEach((reading) => {
    if (reading > limit) {
      return reading;
    }
  });
  return null;
}
`,
    hint: 'Which function does that inner `return` actually return from?',
    explanation:
      'The `return reading` sits inside the arrow function passed to `forEach`, so it only ends that one callback invocation. `forEach` ignores callback return values and cannot be stopped early, so the loop always runs to the end and the outer function always reaches `return null`. Use a `for...of` loop, where `return` leaves `firstOverLimit` itself, or use `find`. With `find`, be careful with the fallback: a matching reading can be `0` (for a negative limit), so `readings.find(...) || null` would wrongly turn it into `null`; use `?? null` or an explicit `undefined` check. O(n) time, O(1) space.',
    examples: [
      { input: [[3, 8, 12, 9], 7], expected: 8 },
      { input: [[1, 2], 5], expected: null },
    ],
    hiddenTests: [
      { input: [[10, 20], 5], expected: 10 },
      { input: [[], 0], expected: null },
      { input: [[5, 5, 6], 5], expected: 6 },
      { input: [[-3, -1, 0], -2], expected: -1 },
      { input: [[-5, 0, 4], -1], expected: 0 },
    ],
  },
  // ---------------------------------------------------------------- 108 Easy
  {
    id: 'js-regex-unanchored-test',
    number: 108,
    language: 'javascript',
    title: 'Pattern Without Anchors',
    difficulty: 'Easy',
    topic: 'Regex',
    statement:
      '`isPin(text)` should return true only when `text` is exactly four digits (0-9) and nothing else. It is currently accepting longer strings and strings with other characters around the digits.',
    functionName: 'isPin',
    functionSignature: 'function isPin(text: string): boolean',
    buggyCode: String.raw`function isPin(text) {
  return /\d{4}/.test(text);
}
`,
    hint: '`test` answers "does this pattern occur anywhere in the string?"',
    explanation:
      'Without anchors a regular expression searches for a match ANYWHERE in the input, so `/\\d{4}/` is satisfied by the first four digits of `"12345"` or the digits inside `"abc1234"`. Validation needs the pattern to span the whole string: `/^\\d{4}$/`. Both anchors matter: `^` alone still accepts `"12345"`, and `$` alone still accepts `"abc1234"`. A non-regex alternative is to check `text.length === 4` and that every character is between "0" and "9".',
    examples: [
      { input: ['1234'], expected: true },
      { input: ['12345'], expected: false },
      { input: ['12a4'], expected: false },
    ],
    hiddenTests: [
      { input: ['abc1234'], expected: false },
      { input: ['0000'], expected: true },
      { input: [''], expected: false },
      { input: ['123'], expected: false },
      { input: ['1234 '], expected: false },
      { input: ['99 1234'], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 109 Medium
  {
    id: 'js-object-assign-target',
    number: 109,
    language: 'javascript',
    title: 'Object.assign Writes Into Its Target',
    difficulty: 'Medium',
    topic: 'Objects',
    statement:
      '`buildSettings(overrides)` should return a settings object made of the shared `DEFAULTS` with the caller\'s `overrides` applied on top. Every call must start from the original defaults: one caller\'s overrides must never show up in a later caller\'s result. The first call after a restart is right, then the results start to drift.',
    functionName: 'buildSettings',
    functionSignature: 'function buildSettings(overrides: Record<string, unknown>): Record<string, unknown>',
    buggyCode: `const DEFAULTS = { theme: 'light', fontSize: 14, notifications: true };

function buildSettings(overrides) {
  return Object.assign(DEFAULTS, overrides);
}
`,
    hint: 'Which object does `Object.assign` modify, and which object does it return?',
    explanation:
      '`Object.assign(target, ...sources)` copies properties INTO its first argument and returns that same object. Here the target is the shared `DEFAULTS`, so each call permanently rewrites the defaults and hands every caller the same object. `const` does not help: it stops the variable being reassigned, not the object being modified. Give `Object.assign` a fresh target, `Object.assign({}, DEFAULTS, overrides)`, or use spread, `{ ...DEFAULTS, ...overrides }`. Keep `overrides` last so it wins over the defaults.',
    examples: [
      { input: [{ theme: 'dark' }], expected: { theme: 'dark', fontSize: 14, notifications: true } },
      { input: [{ fontSize: 18 }], expected: { theme: 'light', fontSize: 18, notifications: true } },
    ],
    hiddenTests: [
      { input: [{}], expected: { theme: 'light', fontSize: 14, notifications: true } },
      { input: [{ notifications: false, language: 'fr' }], expected: { theme: 'light', fontSize: 14, notifications: false, language: 'fr' } },
      { input: [{ theme: 'sepia', fontSize: 10 }], expected: { theme: 'sepia', fontSize: 10, notifications: true } },
      { input: [{}], expected: { theme: 'light', fontSize: 14, notifications: true } },
    ],
  },
  // ---------------------------------------------------------------- 110 Medium
  {
    id: 'js-regex-greedy-quantifier',
    number: 110,
    language: 'javascript',
    title: 'The Greedy Quantifier',
    difficulty: 'Medium',
    topic: 'Regex',
    statement:
      '`firstQuoted(text)` should return the text between the FIRST pair of double quotes in `text` (possibly an empty string), or `null` when `text` does not contain a complete pair. When a line contains more than one quoted phrase, far too much comes back.',
    functionName: 'firstQuoted',
    functionSignature: 'function firstQuoted(text: string): string | null',
    buggyCode: `function firstQuoted(text) {
  const match = text.match(/"(.*)"/);
  return match ? match[1] : null;
}
`,
    hint: 'How many characters does `.*` try to take before the engine looks for the closing quote?',
    explanation:
      'Quantifiers are greedy by default: `.*` grabs as much as it can and only gives characters back until the rest of the pattern can match. So the closing `"` in the pattern lines up with the LAST quote on the line, and the capture spans everything between the first and last quote. Either make the quantifier lazy, `/"(.*?)"/`, or (clearer and faster) say what you mean: `/"([^"]*)"/`, "any run of characters that are not a quote". Keep `*` rather than `+`, because an empty pair `""` is a valid quoted phrase and `.+?` would skip past its closing quote.',
    examples: [
      { input: ['say "hi" now'], expected: 'hi' },
      { input: ['say "hi" and "bye"'], expected: 'hi' },
      { input: ['nothing quoted'], expected: null },
    ],
    hiddenTests: [
      { input: ['"a" "b" "c"'], expected: 'a' },
      { input: ['"" then "x"'], expected: '' },
      { input: ['one " only'], expected: null },
      { input: ['""'], expected: '' },
      { input: ['x "y z" w "q'], expected: 'y z' },
    ],
  },
  // ---------------------------------------------------------------- 111 Easy
  {
    id: 'js-string-false-is-truthy',
    number: 111,
    language: 'javascript',
    title: 'The String "false"',
    difficulty: 'Easy',
    topic: 'Type Coercion',
    statement:
      '`parseFlag(value)` receives a flag read from a query string, so it is always a string. Return true only when the string is `"true"` in any letter case (`"true"`, `"TRUE"`, `"True"`), and false for every other string, including `"false"` and the empty string. Features are currently being switched on for users who explicitly sent `false`.',
    functionName: 'parseFlag',
    functionSignature: 'function parseFlag(value: string): boolean',
    buggyCode: `function parseFlag(value) {
  return Boolean(value);
}
`,
    hint: 'Which strings are falsy in JavaScript? There are fewer than you might hope.',
    explanation:
      '`Boolean(x)` and `!!x` test truthiness, they do not parse text. The only falsy string is the empty string, so `"false"`, `"0"` and `"no"` are all truthy. Compare the text itself: `value.toLowerCase() === "true"`. Avoid the tempting `value !== "false"`: it treats the empty string and every typo as true, and it is case-sensitive.',
    examples: [
      { input: ['true'], expected: true },
      { input: ['false'], expected: false },
      { input: ['TRUE'], expected: true },
    ],
    hiddenTests: [
      { input: ['False'], expected: false },
      { input: [''], expected: false },
      { input: ['yes'], expected: false },
      { input: ['True'], expected: true },
      { input: ['0'], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 112 Medium
  {
    id: 'js-dollars-to-cents-floor',
    number: 112,
    language: 'javascript',
    title: 'Dollars to Whole Cents',
    difficulty: 'Medium',
    topic: 'Numbers',
    statement:
      'A payment API wants amounts as a string holding a whole number of cents. `centsField(dollars)` receives a non-negative price with at most two decimal places (for example `19.99`) and should return that string (`"1999"`). Some prices are arriving one cent short.',
    functionName: 'centsField',
    functionSignature: 'function centsField(dollars: number): string',
    buggyCode: `function centsField(dollars) {
  return String(Math.floor(dollars * 100));
}
`,
    hint: 'Print `1.15 * 100` and `19.99 * 100` before any rounding is applied.',
    explanation:
      'Most two-decimal prices have no exact binary representation, so multiplying by 100 lands a hair above or below the integer you expect: `1.15 * 100` is `114.99999999999999` and `1.1 * 100` is `110.00000000000001`. `Math.floor` (like `Math.trunc`, `parseInt` or `| 0`) throws the fraction away and turns the first into 114. The product is always within a tiny fraction of the right integer, so round to the NEAREST one: `Math.round(dollars * 100)`, or `(dollars * 100).toFixed(0)`. `Math.ceil` just moves the error to the values that land slightly above. Better still, keep money as integer cents everywhere and only convert at the edges.',
    examples: [
      { input: [1.15], expected: '115' },
      { input: [2.5], expected: '250' },
      { input: [19.99], expected: '1999' },
    ],
    hiddenTests: [
      { input: [0], expected: '0' },
      { input: [4.35], expected: '435' },
      { input: [1.1], expected: '110' },
      { input: [0.29], expected: '29' },
      { input: [1000.01], expected: '100001' },
      { input: [8], expected: '800' },
    ],
  },
  // ---------------------------------------------------------------- 113 Medium
  {
    id: 'js-in-sees-inherited',
    number: 113,
    language: 'javascript',
    title: 'in Sees Inherited Properties',
    difficulty: 'Medium',
    topic: 'Objects',
    statement:
      '`roleLevel(role)` looks a role name up in the `ROLE_LEVELS` table and should return its numeric level, or `0` for any string that is not one of the roles listed in the table. The role name comes straight from a request, so it can be any string at all. A security review found role names that are not in the table yet do not get 0.',
    functionName: 'roleLevel',
    functionSignature: 'function roleLevel(role: string): number',
    buggyCode: `const ROLE_LEVELS = { viewer: 1, editor: 2, admin: 3 };

function roleLevel(role) {
  if (role in ROLE_LEVELS) {
    return ROLE_LEVELS[role];
  }
  return 0;
}
`,
    hint: 'An object literal is not an empty dictionary. Try `"toString" in {}`.',
    explanation:
      'The `in` operator walks the prototype chain. Every object literal inherits from `Object.prototype`, so `"toString" in ROLE_LEVELS`, `"constructor" in ROLE_LEVELS` and `"__proto__" in ROLE_LEVELS` are all true, and the lookup then returns a function or an object instead of a level. Plain `ROLE_LEVELS[role] || 0` has the same hole. Ask only about the object\'s OWN keys: `Object.prototype.hasOwnProperty.call(ROLE_LEVELS, role)` or `Object.hasOwn(ROLE_LEVELS, role)`. Alternatives are a `Map`, or a table created with `Object.create(null)` so there is nothing to inherit. Any lookup keyed by untrusted input needs this care.',
    examples: [
      { input: ['editor'], expected: 2 },
      { input: ['guest'], expected: 0 },
      { input: ['toString'], expected: 0 },
    ],
    hiddenTests: [
      { input: ['admin'], expected: 3 },
      { input: ['constructor'], expected: 0 },
      { input: ['viewer'], expected: 1 },
      { input: ['hasOwnProperty'], expected: 0 },
      { input: ['__proto__'], expected: 0 },
      { input: [''], expected: 0 },
    ],
  },
  // ---------------------------------------------------------------- 114 Medium
  {
    id: 'js-split-capturing-group',
    number: 114,
    language: 'javascript',
    title: 'split Keeps Captured Separators',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      '`splitFields(line)` receives a non-empty line whose fields are separated by either a comma or a semicolon, and should return the array of fields in order. Fields never contain a comma or semicolon; an empty field (two separators in a row, or a separator at the very start or end) must be kept as an empty string. The result currently has extra entries mixed in between the fields.',
    functionName: 'splitFields',
    functionSignature: 'function splitFields(line: string): string[]',
    buggyCode: `function splitFields(line) {
  return line.split(/(,|;)/);
}
`,
    hint: 'Parentheses in a regular expression do two jobs. `split` cares about one of them.',
    explanation:
      'When the separator passed to `split` is a regular expression containing a CAPTURING group, the text captured by the group is spliced into the output between the pieces. That is occasionally useful (tokenisers), but here it turns `"a,b;c"` into `["a", ",", "b", ";", "c"]`. The parentheses were only meant for grouping the alternation, so drop the capture: use a character class `/[,;]/` or a non-capturing group `/(?:,|;)/`. Do not "fix" it with `/[,;]+/` or by filtering out empty strings: both would also delete the legitimately empty fields.',
    examples: [
      { input: ['a,b;c'], expected: ['a', 'b', 'c'] },
      { input: ['solo'], expected: ['solo'] },
      { input: ['x;;y'], expected: ['x', '', 'y'] },
    ],
    hiddenTests: [
      { input: [',a'], expected: ['', 'a'] },
      { input: ['red;green,blue;'], expected: ['red', 'green', 'blue', ''] },
      { input: ['1,2,3,4'], expected: ['1', '2', '3', '4'] },
      { input: ['a b;c d'], expected: ['a b', 'c d'] },
      { input: [';'], expected: ['', ''] },
    ],
  },
  // ---------------------------------------------------------------- 115 Easy
  {
    id: 'js-date-seconds-not-millis',
    number: 115,
    language: 'javascript',
    title: 'Seconds Are Not Milliseconds',
    difficulty: 'Easy',
    topic: 'Dates',
    statement:
      '`yearOf(unixSeconds)` receives a Unix timestamp in whole SECONDS since 1970-01-01T00:00:00Z (the format most backends send; it may be negative for earlier moments) and should return the calendar year of that moment in UTC. Every recent timestamp is reported as 1970.',
    functionName: 'yearOf',
    functionSignature: 'function yearOf(unixSeconds: number): number',
    buggyCode: `function yearOf(unixSeconds) {
  return new Date(unixSeconds).getUTCFullYear();
}
`,
    hint: 'What unit does the `Date` constructor expect when it is given a single number?',
    explanation:
      'JavaScript dates count MILLISECONDS since the epoch, while Unix timestamps from servers, databases and JWTs are usually in seconds. Passing seconds straight in gives a moment about 1/1000th of the way from 1970 to the real date: 1,700,000,000 ms is only about 19.7 days after the epoch. Convert first: `new Date(unixSeconds * 1000)`. Keep `getUTCFullYear` (not `getFullYear`), because the local-time getter can report the neighbouring year near New Year depending on the device time zone.',
    examples: [
      { input: [1700000000], expected: 2023 },
      { input: [946684800], expected: 2000 },
    ],
    hiddenTests: [
      { input: [946684799], expected: 1999 },
      { input: [0], expected: 1970 },
      { input: [1735689600], expected: 2025 },
      { input: [-1], expected: 1969 },
      { input: [86400000], expected: 1972 },
    ],
  },
  // ---------------------------------------------------------------- 116 Medium
  {
    id: 'js-parseint-trailing-garbage',
    number: 116,
    language: 'javascript',
    title: 'parseInt Forgives Too Much',
    difficulty: 'Medium',
    topic: 'Numbers',
    statement:
      '`isWholeNumber(text)` validates a form field. Return true only when `text` is a whole number written in plain digits: an optional leading minus sign, then one or more digits 0-9, and nothing else. Spaces, a plus sign, decimal points, exponents, hex prefixes and trailing letters all make it invalid; leading zeros are fine. Inputs such as `"42abc"` are being accepted.',
    functionName: 'isWholeNumber',
    functionSignature: 'function isWholeNumber(text: string): boolean',
    buggyCode: `function isWholeNumber(text) {
  return !Number.isNaN(parseInt(text, 10));
}
`,
    hint: 'Being able to extract a number from a string is not the same as the string being a number.',
    explanation:
      '`parseInt` is a lenient extractor, not a validator: it skips leading whitespace, reads digits for as long as it can and ignores whatever follows, so `"42abc"`, `"3.5"`, `"1e3"` and `" 42"` all produce a number. Swapping in `Number(text)` is stricter about trailing junk but wrong in other ways: it accepts `"3.5"`, `"1e3"`, `" 42"`, `"0x1A"` and turns `""` into 0. When the question is "does this text have exactly this shape?", describe the shape: `/^-?\\d+$/.test(text)`. Parse only after the shape check has passed.',
    examples: [
      { input: ['42'], expected: true },
      { input: ['42abc'], expected: false },
      { input: ['-7'], expected: true },
    ],
    hiddenTests: [
      { input: ['3.5'], expected: false },
      { input: ['1e3'], expected: false },
      { input: [' 42'], expected: false },
      { input: [''], expected: false },
      { input: ['-'], expected: false },
      { input: ['007'], expected: true },
    ],
  },
  // ---------------------------------------------------------------- 117 Medium
  {
    id: 'js-object-key-collision',
    number: 117,
    language: 'javascript',
    title: 'Objects as Property Keys',
    difficulty: 'Medium',
    topic: 'Objects',
    statement:
      '`countDistinctUsers(events)` receives an array of events shaped like `{ user: { id, name }, action }` and should return how many different users appear. Two events belong to the same user exactly when their `user.id` values are equal (names are not unique and can change). Any non-empty list currently produces 1.',
    functionName: 'countDistinctUsers',
    functionSignature: 'function countDistinctUsers(events: { user: { id: number; name: string }; action: string }[]): number',
    buggyCode: `function countDistinctUsers(events) {
  const seen = {};
  for (const event of events) {
    seen[event.user] = true;
  }
  return Object.keys(seen).length;
}
`,
    hint: 'Log `Object.keys(seen)` after the loop. What key did each user turn into?',
    explanation:
      'Property keys of a plain object are always strings (or symbols). Using an object as a key converts it with `String(obj)`, and every plain object stringifies to the same text, `"[object Object]"`. All users therefore land on one key and overwrite each other. Key the lookup by the value that defines identity: `seen[event.user.id] = true`, or collect ids in a `Set`. Serialising the whole user with `JSON.stringify` is not a fix: it treats the same id with a different name (or a different key order) as a different user. O(n) time, O(k) space for k users.',
    examples: [
      {
        input: [[
          { user: { id: 1, name: 'Ada' }, action: 'login' },
          { user: { id: 2, name: 'Bo' }, action: 'login' },
          { user: { id: 1, name: 'Ada' }, action: 'logout' },
        ]],
        expected: 2,
      },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[{ user: { id: 9, name: 'Zed' }, action: 'view' }]], expected: 1 },
      {
        input: [[
          { user: { id: 3, name: 'Sam' }, action: 'view' },
          { user: { id: 4, name: 'Sam' }, action: 'view' },
          { user: { id: 5, name: 'Sam' }, action: 'view' },
        ]],
        expected: 3,
      },
      {
        input: [[
          { user: { id: 7, name: 'Kim' }, action: 'login' },
          { user: { id: 7, name: 'Kimberly' }, action: 'rename' },
        ]],
        expected: 1,
      },
      {
        input: [[
          { user: { id: 10, name: 'A' }, action: 'x' },
          { user: { id: 20, name: 'B' }, action: 'x' },
          { user: { id: 10, name: 'A' }, action: 'y' },
          { user: { id: 30, name: 'C' }, action: 'x' },
          { user: { id: 20, name: 'B2' }, action: 'z' },
        ]],
        expected: 3,
      },
    ],
  },
  // ---------------------------------------------------------------- 118 Medium
  {
    id: 'js-version-string-compare',
    number: 118,
    language: 'javascript',
    title: 'Comparing Version Strings',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      '`compareVersions(a, b)` compares two version strings such as `"1.10.2"`: one or more non-negative integers without leading zeros, joined by dots. Compare them part by part from the left, numerically; when one version has fewer parts, its missing parts count as 0 (so `"1.2"` equals `"1.2.0"`). Return -1 when `a` is the older version, 1 when `a` is the newer one and 0 when they are equal. The update checker thinks 1.10.0 is older than 1.2.0.',
    functionName: 'compareVersions',
    functionSignature: 'function compareVersions(a: string, b: string): -1 | 0 | 1',
    buggyCode: `function compareVersions(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
`,
    hint: 'How does `<` decide between two strings? Try `"10" < "9"`.',
    explanation:
      'Relational operators on two strings compare them character by character by code unit, like a dictionary. `"1.10.0" < "1.2.0"` is true because at the third character `"1"` sorts before `"2"`; the fact that 10 is more than 2 never enters into it. Strings of different lengths that mean the same version (`"1.2"` and `"1.2.0"`) also compare as different. Split both on `"."`, convert each part with `Number`, and walk up to the longer length treating a missing part as 0; return at the first difference. `parseFloat` is not a shortcut: it reads `"1.10"` as 1.1, which is less than 1.9. O(n) in the number of parts.',
    examples: [
      { input: ['1.2.0', '1.10.0'], expected: -1 },
      { input: ['2.0', '1.9'], expected: 1 },
      { input: ['1.2', '1.2.0'], expected: 0 },
    ],
    hiddenTests: [
      { input: ['1.0', '1.0'], expected: 0 },
      { input: ['1.2', '1.2.1'], expected: -1 },
      { input: ['10.0', '9.9'], expected: 1 },
      { input: ['1.10', '1.9'], expected: 1 },
      { input: ['3', '3.0.1'], expected: -1 },
      { input: ['4.0.0.1', '4'], expected: 1 },
    ],
  },
  // ---------------------------------------------------------------- 119 Hard
  {
    id: 'js-regexp-unescaped-input',
    number: 119,
    language: 'javascript',
    title: 'User Text Inside a RegExp',
    difficulty: 'Hard',
    topic: 'Regex',
    statement:
      '`countOccurrences(text, term)` should return how many times the non-empty string `term` occurs in `text`. Matching is literal and case-sensitive, and occurrences are counted left to right without overlapping (so `"aa"` occurs twice in `"aaaa"`). It works for ordinary words, but punctuation in the search term gives wrong counts or crashes.',
    functionName: 'countOccurrences',
    functionSignature: 'function countOccurrences(text: string, term: string): number',
    buggyCode: `function countOccurrences(text, term) {
  const matches = text.match(new RegExp(term, 'g'));
  return matches ? matches.length : 0;
}
`,
    hint: 'What does the pattern `.` mean to a regular expression? What about `+` or `?` with nothing in front of it?',
    explanation:
      '`new RegExp(term)` compiles the user\'s text as a PATTERN, so every metacharacter in it is live: `.` matches any character (5 "matches" in `"a.b.c"`), `|` creates an empty alternative, and a lone `+`, `?` or a trailing backslash is a syntax error that throws. This is also how regex-injection bugs arise. Either avoid regular expressions for literal search (`text.split(term).length - 1`, or a loop over `text.indexOf(term, from)` that advances by `term.length`), or escape the term first: `term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")`. Escaping only the characters you happened to test with (just the dot, say) leaves the rest broken. O(n) time.',
    examples: [
      { input: ['ha ha ha', 'ha'], expected: 3 },
      { input: ['a.b.c', '.'], expected: 2 },
      { input: ['1+1=2', '+'], expected: 1 },
    ],
    hiddenTests: [
      { input: ['aaaa', 'aa'], expected: 2 },
      { input: ['what? why?', '?'], expected: 2 },
      { input: ['a|b', '|'], expected: 1 },
      { input: ['x', 'xyz'], expected: 0 },
      { input: ['C:\\dir\\file', '\\'], expected: 2 },
      { input: ['f(x) and g(x)', '(x)'], expected: 2 },
    ],
  },
  // ---------------------------------------------------------------- 120 Medium
  {
    id: 'js-json-compare-key-order',
    number: 120,
    language: 'javascript',
    title: 'Comparing Objects as JSON',
    difficulty: 'Medium',
    topic: 'Equality',
    statement:
      '`sameSettings(a, b)` receives two flat objects whose values are strings, numbers or booleans. Return true when they have exactly the same set of keys and each key holds the same value with the same type in both; the order in which the keys were written must not matter. Two settings objects with identical contents are sometimes reported as different.',
    functionName: 'sameSettings',
    functionSignature: 'function sameSettings(a: Record<string, string | number | boolean>, b: Record<string, string | number | boolean>): boolean',
    buggyCode: `function sameSettings(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
`,
    hint: 'Stringify `{ x: 1, y: 2 }` and `{ y: 2, x: 1 }` and compare the two texts.',
    explanation:
      '`JSON.stringify` writes keys in the object\'s own property order, which for ordinary string keys is insertion order. Two objects with the same contents built in a different order serialise to different text, so comparing the strings gives a false negative. Compare structurally: check that both have the same number of keys, then that every key of `a` is an own key of `b` with a strictly equal value. The length check matters, otherwise `{ a: 1 }` would "equal" `{ a: 1, b: 2 }`; strict equality matters so `1` and `"1"` stay different. Sorting the keys before stringifying both sides also works. O(k) for k keys.',
    examples: [
      { input: [{ theme: 'dark', size: 12 }, { size: 12, theme: 'dark' }], expected: true },
      { input: [{ theme: 'dark', size: 12 }, { theme: 'dark', size: 14 }], expected: false },
    ],
    hiddenTests: [
      { input: [{ a: 1, b: 2, c: 3 }, { c: 3, b: 2, a: 1 }], expected: true },
      { input: [{ a: 1 }, { a: 1, b: 2 }], expected: false },
      { input: [{ a: 1, b: 2 }, { a: 1 }], expected: false },
      { input: [{}, {}], expected: true },
      { input: [{ a: 1 }, { a: '1' }], expected: false },
      { input: [{ a: 1, b: 2 }, { a: 1, c: 2 }], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 121 Medium
  {
    id: 'js-null-compares-as-zero',
    number: 121,
    language: 'javascript',
    title: 'null Passes the Zero Check',
    difficulty: 'Medium',
    topic: 'Type Coercion',
    statement:
      '`averageAnswered(scores)` receives survey scores. Each entry is a number, or `null` when the question was skipped. Negative numbers are data-entry errors. Return the average of the valid scores only (numbers that are 0 or greater), ignoring skipped and negative entries, or 0 when there are no valid scores. Skipped questions are dragging the averages down.',
    functionName: 'averageAnswered',
    functionSignature: 'function averageAnswered(scores: (number | null)[]): number',
    buggyCode: `function averageAnswered(scores) {
  let sum = 0;
  let count = 0;
  for (const score of scores) {
    if (score >= 0) {
      sum += score;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}
`,
    hint: 'Evaluate `null >= 0` and `null == 0` in a console. They do not agree.',
    explanation:
      'Relational operators (`<`, `>`, `<=`, `>=`) convert `null` to the number 0, so `null >= 0` is true even though `null == 0` is false. The guard that was meant to filter out bad entries lets every skipped question through; it then adds 0 to the sum and 1 to the count. Test the type explicitly before comparing: `typeof score === "number" && score >= 0` (or `score !== null && score >= 0`). A truthiness guard such as `if (score && score >= 0)` is the classic wrong fix, because a genuine score of 0 is falsy and would be dropped too. O(n) time, O(1) space.',
    examples: [
      { input: [[4, null, 2]], expected: 3 },
      { input: [[5, 5]], expected: 5 },
      { input: [[0, null, 6]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[null, null]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[-1, 3, null]], expected: 3 },
      { input: [[0, 0, null]], expected: 0 },
      { input: [[null, 10, 0, 2, -4, null]], expected: 4 },
    ],
  },
  // ---------------------------------------------------------------- 122 Hard
  {
    id: 'js-replacement-dollar-patterns',
    number: 122,
    language: 'javascript',
    title: 'Dollar Signs in the Replacement',
    difficulty: 'Hard',
    topic: 'Strings',
    statement:
      '`fillTemplate(template, value)` receives a template that contains the placeholder `{value}` exactly once, and should return the template with the placeholder replaced by `value`, inserted exactly as given whatever characters it contains. Values that contain dollar signs come out mangled.',
    functionName: 'fillTemplate',
    functionSignature: 'function fillTemplate(template: string, value: string): string',
    buggyCode: `function fillTemplate(template, value) {
  return template.replace('{value}', value);
}
`,
    hint: 'The second argument of `replace` is not plain text when it is a string. Look up what `$&` and `$$` mean there.',
    explanation:
      'A STRING passed as the replacement to `replace` (and `replaceAll`) is a mini-template: `$$` inserts one dollar sign, `$&` inserts the matched text, and `` $` `` and `$\'` insert the text before and after the match. This applies even when the search pattern is a plain string. So a value of `"echo $$"` loses a dollar and `"$&"` re-inserts the placeholder. To insert text verbatim, pass a FUNCTION, whose return value is used as-is: `template.replace("{value}", () => value)`. `template.split("{value}").join(value)` or slicing around `indexOf` work too. Escaping by hand needs every `$` doubled (`value.replace(/\\$/g, "$$$$")`), which is easy to get wrong.',
    examples: [
      { input: ['Total: {value}', '42'], expected: 'Total: 42' },
      { input: ['Run: {value}', 'echo $$'], expected: 'Run: echo $$' },
      { input: ['Type {value} to reuse the match', '$&'], expected: 'Type $& to reuse the match' },
    ],
    hiddenTests: [
      { input: ['[{value}]', 'a$`b'], expected: '[a$`b]' },
      { input: ['<{value}>', "x$'y"], expected: "<x$'y>" },
      { input: ['{value}', '$& and $&'], expected: '$& and $&' },
      { input: ['Price: {value} each', '$5'], expected: 'Price: $5 each' },
      { input: ['pid={value};', '$$ $$ $$'], expected: 'pid=$$ $$ $$;' },
      { input: ['Hello, {value}!', 'world'], expected: 'Hello, world!' },
    ],
  },
  // ---------------------------------------------------------------- 123 Hard
  {
    id: 'js-shallow-merge-nested',
    number: 123,
    language: 'javascript',
    title: 'Shallow Merge Drops Nested Defaults',
    difficulty: 'Hard',
    topic: 'Objects',
    statement:
      '`mergeConfig(defaults, overrides)` combines two config objects into a new one. Each value is either a primitive (string, number or boolean) or a section: a plain object holding only primitives (never null, never an array, never nested further). The result starts with everything in `defaults`; then for each key in `overrides`: if BOTH sides hold a section, the two sections are merged key by key with the override winning; in every other case the override value simply replaces the default. Overriding one setting inside a section currently wipes out the rest of that section.',
    functionName: 'mergeConfig',
    functionSignature: 'function mergeConfig(defaults: Record<string, any>, overrides: Record<string, any>): Record<string, any>',
    buggyCode: `function mergeConfig(defaults, overrides) {
  return { ...defaults, ...overrides };
}
`,
    hint: 'When both objects have a `retry` key, what exactly does the spread copy for that key?',
    explanation:
      'Object spread (like `Object.assign`) merges ONE level deep. For a key present on both sides it copies the override\'s value wholesale; if that value is an object, it replaces the whole default section rather than being combined with it, so `{ retry: { count: 5 } }` discards `retry.delayMs`. Merge the top level, then handle section-on-section keys separately: for each key of `overrides`, if both values are objects build `{ ...defaults[key], ...overrides[key] }`, otherwise take the override. Do not spread unconditionally: spreading a primitive yields `{}` (and a string spreads into its characters), which breaks plain values. O(total keys) time and space.',
    examples: [
      {
        input: [{ retry: { count: 3, delayMs: 500 }, verbose: false }, { retry: { count: 5 } }],
        expected: { retry: { count: 5, delayMs: 500 }, verbose: false },
      },
      { input: [{ a: 1, b: 2 }, { b: 3 }], expected: { a: 1, b: 3 } },
    ],
    hiddenTests: [
      {
        input: [{ db: { host: 'localhost', port: 5432 } }, { cache: { ttl: 60 } }],
        expected: { db: { host: 'localhost', port: 5432 }, cache: { ttl: 60 } },
      },
      { input: [{ mode: 'fast', timeout: 30 }, { mode: { name: 'slow', level: 2 } }], expected: { mode: { name: 'slow', level: 2 }, timeout: 30 } },
      { input: [{ log: { level: 'info', color: true } }, { log: 'off' }], expected: { log: 'off' } },
      {
        input: [{ a: { x: 1 }, b: { y: 2 } }, { a: { x: 9, z: 3 }, b: {} }],
        expected: { a: { x: 9, z: 3 }, b: { y: 2 } },
      },
      { input: [{}, {}], expected: {} },
      {
        input: [{ name: 'app', ui: { theme: 'light', dense: false } }, { name: 'app2', ui: { dense: true }, debug: true }],
        expected: { name: 'app2', ui: { theme: 'light', dense: true }, debug: true },
      },
    ],
  },
  // ---------------------------------------------------------------- 124 Hard
  {
    id: 'js-add-months-overflow',
    number: 124,
    language: 'javascript',
    title: 'Month-End Overflow',
    difficulty: 'Hard',
    topic: 'Dates',
    statement:
      '`addMonths(isoDate, months)` receives a valid calendar date as `"YYYY-MM-DD"` and an integer number of months (possibly negative), and should return the date that many calendar months away in the same format. The day of the month stays the same, except that when the target month is shorter the result is that month\'s LAST day (one month after January 31 is the last day of February). Billing dates at the end of a month are jumping into the following month.',
    functionName: 'addMonths',
    functionSignature: 'function addMonths(isoDate: string, months: number): string',
    buggyCode: `function addMonths(isoDate, months) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1 + months, day));
  return result.toISOString().slice(0, 10);
}
`,
    hint: 'What date does `Date.UTC(2024, 1, 31)` (the 31st of February) turn into?',
    explanation:
      '`Date` never rejects an out-of-range day; it rolls the extra days forward. February 31 becomes March 2 (or March 3), so anything scheduled on the 29th-31st drifts into the next month. Compute the target month with day 1 first, find how many days that month has, and clamp: `const last = new Date(Date.UTC(year, month + months, 0)).getUTCDate()` (day 0 of the FOLLOWING month is the last day of the target month), then use `Math.min(day, last)`. An equivalent fix is to detect the overflow (the resulting day of month differs from `day`) and step back with `setUTCDate(0)`. A hard-coded table of month lengths must still account for leap years. Staying in UTC throughout keeps the answer independent of the device time zone.',
    examples: [
      { input: ['2024-01-15', 1], expected: '2024-02-15' },
      { input: ['2024-01-31', 1], expected: '2024-02-29' },
      { input: ['2024-03-31', 1], expected: '2024-04-30' },
    ],
    hiddenTests: [
      { input: ['2023-01-31', 1], expected: '2023-02-28' },
      { input: ['2024-11-30', 3], expected: '2025-02-28' },
      { input: ['2024-03-31', -1], expected: '2024-02-29' },
      { input: ['2024-05-31', 12], expected: '2025-05-31' },
      { input: ['2024-02-29', 12], expected: '2025-02-28' },
      { input: ['2024-10-31', 0], expected: '2024-10-31' },
    ],
  },
  // ---------------------------------------------------------------- 125 Hard
  {
    id: 'js-tofixed-half-cent',
    number: 125,
    language: 'javascript',
    title: 'toFixed and the Half Cent',
    difficulty: 'Hard',
    topic: 'Numbers',
    statement:
      '`roundPrice(text)` receives a non-negative decimal amount as a string: digits, optionally followed by a dot and one to three more digits (for example `"12"`, `"0.5"` or `"2.675"`), with a whole part below one million. Return it rounded to two decimal places as a string that always shows exactly two decimals, rounding a third digit of 5 or more UP (`"2.675"` becomes `"2.68"`, `"1.2"` becomes `"1.20"`). Some amounts ending in 5 are being rounded down.',
    functionName: 'roundPrice',
    functionSignature: 'function roundPrice(text: string): string',
    buggyCode: `function roundPrice(text) {
  return Number(text).toFixed(2);
}
`,
    hint: 'Print `(1.005).toFixed(20)`. Which number is `toFixed` actually rounding?',
    explanation:
      '`toFixed` rounds the binary double it is given, not the decimal text you typed. `1.005` is stored as 1.00499999999999989..., which is genuinely below the halfway point, so `toFixed(2)` correctly gives `"1.00"`; likewise `2.675` is stored slightly low. `Math.round(x * 100) / 100` fails the same way (`1.005 * 100` is `100.49999999999999`), and nudging by `Number.EPSILON` only rescues values near 1. The decimal digits are only exact while they are still text, so do the rounding there: split on the dot, pad the fraction to three digits, form integer cents from the whole part and the first two digits, add one cent when the third digit is 5 or more, then re-insert the dot. A compact alternative is `Math.round(Number(text + "e2"))`, because parsing `"1.005e2"` yields exactly 100.5; divide by 100 and format with `toFixed(2)`.',
    examples: [
      { input: ['1.005'], expected: '1.01' },
      { input: ['1.2'], expected: '1.20' },
      { input: ['2.675'], expected: '2.68' },
    ],
    hiddenTests: [
      { input: ['10'], expected: '10.00' },
      { input: ['1.004'], expected: '1.00' },
      { input: ['0.995'], expected: '1.00' },
      { input: ['8.345'], expected: '8.35' },
      { input: ['4.015'], expected: '4.02' },
      { input: ['0.07'], expected: '0.07' },
    ],
  },
];
