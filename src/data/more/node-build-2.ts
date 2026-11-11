// Node.js practice, build batch 2 (numbers 51-75): HTTP-layer logic as pure functions over
// plain request/response data. Same shape and grading as src/data/nodeProblems.ts.

import type { BugFixProblem } from '../bugFixes';

const BOOK_ROUTES = [{ method: 'GET', path: '/books', handler: 'listBooks' }, { method: 'POST', path: '/books', handler: 'createBook' }, { method: 'GET', path: '/books/:id', handler: 'getBook' }, { method: 'DELETE', path: '/books/:id', handler: 'deleteBook' }, { method: 'GET', path: '/books/featured', handler: 'featuredBooks' }, { method: 'OPTIONS', path: '/books', handler: 'booksOptions' }, { method: 'GET', path: '/health', handler: 'health' }, { method: 'HEAD', path: '/health', handler: 'ping' }, { method: 'POST', path: '/loans/:memberId/:bookId', handler: 'createLoan' }];
const ERR_OPTS = { debug: false, requestId: 'req-81c' };
const ERR_OPTS_DEBUG = { debug: true, requestId: null };
const ERR_OPTS_PLAIN = { debug: false, requestId: null };
const MP_SIMPLE = '--XyZ\r\nContent-Disposition: form-data; name="title"\r\n\r\nTrip notes\r\n--XyZ\r\nContent-Disposition: form-data; name="doc"; filename="notes.txt"\r\nContent-Type: text/plain\r\n\r\nDay 1\r\n\r\nDay 2\r\n--XyZ--\r\n';
const MP_TRICKY = 'This preamble is ignored, even though it mentions --b7 here.\r\n--b7\r\ncontent-type: text/csv\r\nCONTENT-DISPOSITION: form-data; filename="name=\'x\'.csv"; name="sheet"\r\n\r\nid,note\r\n1,--b7 inline\r\n--not-a-boundary\r\n\r\n--b7\r\nContent-Disposition: form-data; name="empty"\r\n\r\n\r\n--b7\r\nContent-Disposition: form-data; name="padded"\r\n\r\n  keep my spaces  \r\n--b7--\r\nepilogue to ignore';
const MP_TRUNCATED = '--XyZ\r\nContent-Disposition: form-data; name="title"\r\n\r\nTrip notes\r\n--XyZ\r\nContent-Disposition: form-data; name="doc"\r\n\r\ncut off he';
const MP_NAMELESS = '--XyZ\r\nContent-Disposition: form-data; name="a"\r\n\r\n1\r\n--XyZ\r\nContent-Disposition: attachment; filename="b.bin"\r\n\r\n2\r\n--XyZ--';
const MP_NO_HEADERS = '--XyZ\r\n\r\norphan content\r\n--XyZ--';
const MP_LF_INSIDE = '--XyZ\r\nContent-Disposition: form-data; name="poem"\r\nX-Note: a: b\r\n\r\nroses\nviolets\n\n--XyZ\r\nend\r\n--XyZ--';
const SITE = { 'http://shop.example.com/cart': { status: 301, location: 'https://shop.example.com/cart' }, 'https://shop.example.com/cart': { status: 302, location: '/basket?from=cart' }, 'https://shop.example.com/basket?from=cart': { status: 200 }, 'https://shop.example.com/orders': { status: 303, location: 'orders/latest' }, 'https://shop.example.com/orders/latest': { status: 307, location: 'receipt' }, 'https://shop.example.com/orders/receipt': { status: 308, location: 'https://pay.example.net/r/77' }, 'https://pay.example.net/r/77': { status: 201 }, 'https://shop.example.com/a': { status: 302, location: '/b' }, 'https://shop.example.com/b': { status: 302, location: '/c' }, 'https://shop.example.com/c': { status: 302, location: '/a' }, 'https://shop.example.com/old/docs/intro?lang=en': { status: 308, location: 'start' }, 'https://shop.example.com/old/docs/start': { status: 301, location: '/gone' }, 'https://shop.example.com/moved': { status: 301, location: '/teapot' }, 'https://shop.example.com/teapot': { status: 302 } };
const VERSION_CONFIG = { supported: [1, 2, 3, 4], default: 3, deprecated: [1], sunset: { '1': 'Sat, 01 Mar 2025 00:00:00 GMT', '2': 'Thu, 01 Jan 2026 00:00:00 GMT' } };
const CLI_SPEC = { verbose: { type: 'boolean', short: 'v' }, quiet: { type: 'boolean', short: 'q' }, color: { type: 'boolean', default: true }, port: { type: 'number', short: 'p', default: 3000 }, host: { type: 'string' }, tag: { type: 'string', short: 't', multiple: true } };
const PROXIES = ['10.0.0.0/8', '192.168.1.1'];

export const problems: BugFixProblem[] = [
  {
    id: 'node-catalog-query-serializer',
    number: 51,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Catalog Query Serializer',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A grocery API client builds search URLs, and its CDN caches by the exact URL text, so the same filters must always produce the same query string. Implement `buildQuery(params)` that turns a plain object into a query string.\n' +
      '\n' +
      '- Emit keys in ascending order as sorted by the default `Array.prototype.sort()` (code-unit order, so `Zeta` comes before `alpha`).\n' +
      '- A value is a string, number, boolean, `null`, or an array of those. `null` (as a value or as an array element) is skipped. An array repeats its key once per remaining element, in array order: `{ tag: [\'a\', \'b\'] }` gives `tag=a&tag=b`.\n' +
      '- Everything else is kept, including `0`, `false` and the empty string (`q=`). Numbers and booleans are written with `String(value)`.\n' +
      '- Encode both key and value with `encodeURIComponent`, then write each encoded space (`%20`) as `+`.\n' +
      '- Join the pairs with `&` and prefix the result with `?`. If no pair is emitted, return the empty string.',
    functionName: 'buildQuery',
    functionSignature: 'function buildQuery(params)',
    buggyCode:
      'function buildQuery(params) {\n' +
      '  // TODO: sort the keys, skip nulls, repeat array keys,\n' +
      '  // encode with encodeURIComponent (%20 becomes +), prefix with ?\n' +
      '  return \'\';\n' +
      '}\n',
    solution:
      'function buildQuery(params) {\n' +
      '  const enc = (v) => encodeURIComponent(String(v)).replace(/%20/g, \'+\');\n' +
      '  const parts = [];\n' +
      '  for (const key of Object.keys(params).sort()) {\n' +
      '    const value = params[key];\n' +
      '    const list = Array.isArray(value) ? value : [value];\n' +
      '    for (const item of list) {\n' +
      '      if (item === null) continue;\n' +
      '      parts.push(enc(key) + \'=\' + enc(item));\n' +
      '    }\n' +
      '  }\n' +
      '  return parts.length ? \'?\' + parts.join(\'&\') : \'\';\n' +
      '}\n',
    hint: 'Decide what to skip with an explicit `=== null` test. A truthiness test also throws away 0, false and the empty string.',
    explanation:
      'Serialising a query string is the mirror image of parsing one, and the hard part is being deterministic. Object key order reflects how the caller happened to build the object, so two logically identical requests can produce different URLs and miss the cache; sorting the keys removes that source of variation.\n' +
      '\n' +
      'Normalise every value to a list (a scalar becomes a one-element list), drop only `null`, and push one `key=value` pair per element. Filtering with truthiness is the classic mistake: `limit=0`, `exact=false` and `q=` are all meaningful and must survive. Encoding must happen per key and per value, before joining, so that a `&` or `=` inside a value cannot be mistaken for a separator.\n' +
      '\n' +
      'Cost is O(n log n) for the sort plus the length of the output.',
    examples: [
      { input: [{ q: 'trail mix', page: 2, inStock: true }], expected: '?inStock=true&page=2&q=trail+mix' },
      { input: [{ tag: ['vegan', 'gluten free'], sort: null }], expected: '?tag=vegan&tag=gluten+free' },
      { input: [{}], expected: '' },
    ],
    hiddenTests: [
      { input: [{ limit: 0, q: '', exact: false }], expected: '?exact=false&limit=0&q=' },
      { input: [{ 'b&c': 'x=y/z', a: '100%' }], expected: '?a=100%25&b%26c=x%3Dy%2Fz' },
      { input: [{ ids: [3, null, 1], Zeta: 'z', alpha: 'a' }], expected: '?Zeta=z&alpha=a&ids=3&ids=1' },
      { input: [{ a: null, b: [], c: [null] }], expected: '' },
      { input: [{ note: 'a+b c', 'shelf life': '7 days' }], expected: '?note=a%2Bb+c&shelf+life=7+days' },
    ],
  },
  {
    id: 'node-set-cookie-line-builder',
    number: 52,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Set-Cookie Line Builder',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A ticketing site sets its cookies by hand. Implement `serializeCookie(name, value, options)` returning the text of one `Set-Cookie` header, or `null` for an unusable name.\n' +
      '\n' +
      '- `name` must be one or more of the characters `A-Z a-z 0-9 _ -`; otherwise return `null`.\n' +
      '- The line starts with `name=` followed by `encodeURIComponent(value)` (`value` is a string and may be empty).\n' +
      '- Attributes follow, each preceded by `; `, ALWAYS in this order no matter how `options` was written:\n' +
      '  1. `Max-Age=<n>` when `options.maxAge` is a number, with `n = Math.floor(maxAge)`. A `maxAge` of `0` is meaningful (it deletes the cookie) and must be written.\n' +
      '  2. `Domain=<domain>` when `options.domain` is a non-empty string.\n' +
      '  3. `Path=<path>` when `options.path` is a non-empty string.\n' +
      '  4. `Secure` when `options.secure` is `true`, or when SameSite is None (browsers reject `SameSite=None` cookies that are not Secure).\n' +
      '  5. `HttpOnly` when `options.httpOnly` is `true`.\n' +
      '  6. `SameSite=Strict`, `SameSite=Lax` or `SameSite=None` when `options.sameSite` is given. It arrives as `strict`, `lax` or `none` in any letter case; always write it capitalised as shown.\n' +
      '- `options` is always an object; any of its keys may be missing.',
    functionName: 'serializeCookie',
    functionSignature: 'function serializeCookie(name, value, options)',
    buggyCode:
      'function serializeCookie(name, value, options) {\n' +
      '  // TODO: validate the name, encode the value, then append\n' +
      '  // Max-Age, Domain, Path, Secure, HttpOnly, SameSite in that order\n' +
      '  return name + \'=\' + value;\n' +
      '}\n',
    solution:
      'function serializeCookie(name, value, options) {\n' +
      '  if (!/^[A-Za-z0-9_-]+$/.test(name)) return null;\n' +
      '  const parts = [name + \'=\' + encodeURIComponent(value)];\n' +
      '  const sameSite = typeof options.sameSite === \'string\' ? options.sameSite.toLowerCase() : null;\n' +
      '  if (typeof options.maxAge === \'number\') parts.push(\'Max-Age=\' + Math.floor(options.maxAge));\n' +
      '  if (options.domain) parts.push(\'Domain=\' + options.domain);\n' +
      '  if (options.path) parts.push(\'Path=\' + options.path);\n' +
      '  if (options.secure === true || sameSite === \'none\') parts.push(\'Secure\');\n' +
      '  if (options.httpOnly === true) parts.push(\'HttpOnly\');\n' +
      '  if (sameSite) parts.push(\'SameSite=\' + sameSite[0].toUpperCase() + sameSite.slice(1));\n' +
      '  return parts.join(\'; \');\n' +
      '}\n',
    hint: 'Write the attributes in a fixed sequence of `if` statements instead of looping over the options object, and test `maxAge` by type, not truthiness.',
    explanation:
      'A `Set-Cookie` header is a `name=value` pair followed by `; `-separated attributes. Building it is simple string assembly, but three details matter in production.\n' +
      '\n' +
      'First, the value must be encoded: a raw `;` or `=` inside it would be read as an attribute boundary. Second, `Max-Age=0` is how a cookie is deleted, so `if (options.maxAge)` silently breaks logout; check `typeof maxAge === \'number\'`. Third, browsers drop a `SameSite=None` cookie that lacks `Secure`, so the serializer adds it rather than trusting every caller to remember.\n' +
      '\n' +
      'Emitting attributes in a fixed order (rather than in the caller\'s key order) keeps the output stable for tests, logs and caches. The work is O(length of the output).',
    examples: [
      { input: ['sid', 'abc 123', { path: '/', httpOnly: true, maxAge: 3600 }], expected: 'sid=abc%20123; Max-Age=3600; Path=/; HttpOnly' },
      { input: ['theme', 'dark', { sameSite: 'none' }], expected: 'theme=dark; Secure; SameSite=None' },
      { input: ['bad name', 'x', {}], expected: null },
    ],
    hiddenTests: [
      { input: ['sid', '', { maxAge: 0, path: '/' }], expected: 'sid=; Max-Age=0; Path=/' },
      { input: ['pref', 'a=b;c', {}], expected: 'pref=a%3Db%3Bc' },
      { input: ['cart_id', '42', { sameSite: 'LAX', secure: true, domain: 'shop.example.com', maxAge: 59.9 }], expected: 'cart_id=42; Max-Age=59; Domain=shop.example.com; Secure; SameSite=Lax' },
      { input: ['', 'v', { path: '/' }], expected: null },
      { input: ['k-1', 'v', { secure: false, httpOnly: false, sameSite: 'Strict' }], expected: 'k-1=v; SameSite=Strict' },
      { input: ['seat', 'A/12', { httpOnly: true, sameSite: 'None', secure: true, path: '/checkout' }], expected: 'seat=A%2F12; Path=/checkout; Secure; HttpOnly; SameSite=None' },
    ],
  },
  {
    id: 'node-library-method-dispatch',
    number: 53,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Library Method Dispatch',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'A library API must tell apart "no such URL" (404) from "that URL exists but not for this method" (405), and answer `HEAD` and `OPTIONS` sensibly. Implement `dispatch(routes, method, path)`.\n' +
      '\n' +
      '`routes` is an ordered array of `{ method, path, handler }` (`handler` is just a name). `method` is already uppercase.\n' +
      '\n' +
      'Path matching: split the route path and the request path on `/`, ignoring empty segments. They match when they have the same number of segments and every route segment is either equal to the request segment (case-sensitive) or starts with `:`, in which case it captures that request segment as a string param under the name after the colon.\n' +
      '\n' +
      'Decide in this order:\n' +
      '1. No route path matches: return `{ status: 404 }`.\n' +
      '2. Among the routes whose path matches, take the FIRST (in array order) whose method equals `method`. If there is none and `method` is `HEAD`, take the first matching `GET` route instead. If you found one, return `{ status: 200, handler, params }` using that route\'s handler and captured params.\n' +
      '3. Otherwise build the `allow` string: the distinct methods of all path-matching routes, plus `HEAD` if `GET` is among them, plus `OPTIONS` always; sorted alphabetically and joined with `, `.\n' +
      '4. If `method` is `OPTIONS`, return `{ status: 204, allow }`; for any other method return `{ status: 405, allow }`.',
    functionName: 'dispatch',
    functionSignature: 'function dispatch(routes, method, path)',
    buggyCode:
      'function dispatch(routes, method, path) {\n' +
      '  // TODO: collect every route whose path matches, then decide between\n' +
      '  // 200 (with HEAD falling back to GET), 204 for OPTIONS, 405 with allow, and 404\n' +
      '  return { status: 404 };\n' +
      '}\n',
    solution:
      'function dispatch(routes, method, path) {\n' +
      '  const segs = path.split(\'/\').filter(Boolean);\n' +
      '  const matchPath = (pattern) => {\n' +
      '    const pat = pattern.split(\'/\').filter(Boolean);\n' +
      '    if (pat.length !== segs.length) return null;\n' +
      '    const params = {};\n' +
      '    for (let i = 0; i < pat.length; i++) {\n' +
      '      if (pat[i].startsWith(\':\')) params[pat[i].slice(1)] = segs[i];\n' +
      '      else if (pat[i] !== segs[i]) return null;\n' +
      '    }\n' +
      '    return params;\n' +
      '  };\n' +
      '  const hits = [];\n' +
      '  for (const route of routes) {\n' +
      '    const params = matchPath(route.path);\n' +
      '    if (params) hits.push({ route, params });\n' +
      '  }\n' +
      '  if (hits.length === 0) return { status: 404 };\n' +
      '  const find = (m) => hits.find((h) => h.route.method === m);\n' +
      '  const hit = find(method) || (method === \'HEAD\' ? find(\'GET\') : undefined);\n' +
      '  if (hit) return { status: 200, handler: hit.route.handler, params: hit.params };\n' +
      '  const allowed = new Set(hits.map((h) => h.route.method));\n' +
      '  if (allowed.has(\'GET\')) allowed.add(\'HEAD\');\n' +
      '  allowed.add(\'OPTIONS\');\n' +
      '  const allow = [...allowed].sort().join(\', \');\n' +
      '  return { status: method === \'OPTIONS\' ? 204 : 405, allow };\n' +
      '}\n',
    hint: 'Do the path match first and keep ALL the routes that match, ignoring the method. Whether the answer is 404 or 405 depends only on whether that list is empty.',
    explanation:
      'The mistake this exercise targets is matching method and path in one step: when nothing matches you can no longer tell a missing resource from a wrong verb, and everything becomes a 404. Split the work in two. Phase one collects every route whose path matches, capturing its params. If that list is empty the resource does not exist: 404.\n' +
      '\n' +
      'Phase two looks only inside that list. An exact method match wins, in declaration order. `HEAD` is defined as `GET` without a body, so it falls back to the `GET` route when no explicit `HEAD` route exists. If still nothing fits, the resource exists but the verb is wrong, and HTTP requires a 405 to carry an `Allow` header listing what would work; an unhandled `OPTIONS` request gets the same list with a 204.\n' +
      '\n' +
      'Deriving `Allow` from the route table (rather than hard-coding it) keeps it truthful as routes are added. Cost is O(routes x segments).',
    examples: [
      { input: [BOOK_ROUTES, 'GET', '/books/42'], expected: { status: 200, handler: 'getBook', params: { id: '42' } } },
      { input: [BOOK_ROUTES, 'PUT', '/books/42'], expected: { status: 405, allow: 'DELETE, GET, HEAD, OPTIONS' } },
      { input: [BOOK_ROUTES, 'GET', '/authors'], expected: { status: 404 } },
    ],
    hiddenTests: [
      { input: [BOOK_ROUTES, 'HEAD', '/books/'], expected: { status: 200, handler: 'listBooks', params: {} } },
      { input: [BOOK_ROUTES, 'HEAD', '/health'], expected: { status: 200, handler: 'ping', params: {} } },
      { input: [BOOK_ROUTES, 'OPTIONS', '/books/7'], expected: { status: 204, allow: 'DELETE, GET, HEAD, OPTIONS' } },
      { input: [BOOK_ROUTES, 'OPTIONS', '/books'], expected: { status: 200, handler: 'booksOptions', params: {} } },
      { input: [BOOK_ROUTES, 'HEAD', '/loans/m9/b12'], expected: { status: 405, allow: 'OPTIONS, POST' } },
      { input: [BOOK_ROUTES, 'GET', '/books/featured'], expected: { status: 200, handler: 'getBook', params: { id: 'featured' } } },
    ],
  },
  {
    id: 'node-route-specificity-order',
    number: 54,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Route Specificity Ordering',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'A file-sharing service registers routes from many plugins in no particular order, and its router tries patterns first to last. Before start-up the patterns must be sorted so that a specific pattern is always tried before a more general one that would shadow it. Implement `orderRoutes(patterns)` returning a new array of the same pattern strings.\n' +
      '\n' +
      'Split each pattern on `/`, ignoring empty segments. Every segment has a kind: the segment `*` is a WILDCARD, a segment starting with `:` is a PARAM, anything else is STATIC.\n' +
      '\n' +
      'To compare two patterns, walk their segments left to right:\n' +
      '- At the first position where the kinds differ, the pattern with the more specific kind comes first: STATIC before PARAM before WILDCARD. (Two STATIC segments with different text count as the same kind.)\n' +
      '- If one pattern runs out of segments before any kind differs, the LONGER pattern comes first.\n' +
      '- If the kind sequences are identical, keep the two patterns in their original relative order.',
    functionName: 'orderRoutes',
    functionSignature: 'function orderRoutes(patterns)',
    buggyCode:
      'function orderRoutes(patterns) {\n' +
      '  // TODO: compare patterns segment by segment (static < param < wildcard),\n' +
      '  // longer first when one is a prefix of the other, original order on ties\n' +
      '  return patterns;\n' +
      '}\n',
    solution:
      'function orderRoutes(patterns) {\n' +
      '  const rank = (seg) => (seg === \'*\' ? 2 : seg.startsWith(\':\') ? 1 : 0);\n' +
      '  const keyed = patterns.map((pattern, index) => ({\n' +
      '    pattern,\n' +
      '    index,\n' +
      '    kinds: pattern.split(\'/\').filter(Boolean).map(rank),\n' +
      '  }));\n' +
      '  keyed.sort((a, b) => {\n' +
      '    const shared = Math.min(a.kinds.length, b.kinds.length);\n' +
      '    for (let i = 0; i < shared; i++) {\n' +
      '      if (a.kinds[i] !== b.kinds[i]) return a.kinds[i] - b.kinds[i];\n' +
      '    }\n' +
      '    if (a.kinds.length !== b.kinds.length) return b.kinds.length - a.kinds.length;\n' +
      '    return a.index - b.index;\n' +
      '  });\n' +
      '  return keyed.map((k) => k.pattern);\n' +
      '}\n',
    hint: 'Turn each pattern into an array of small numbers (0 static, 1 param, 2 wildcard) and compare those arrays position by position. Carry the original index for the tie-break.',
    explanation:
      'First-match routers are order-sensitive: `/files/:id` registered before `/files/recent` swallows the request for the recent list. Sorting by specificity fixes that once, at start-up.\n' +
      '\n' +
      'A tempting shortcut is to score each pattern with one number, such as how many static segments it has. That loses position: `/a/:id/c` and `/:x/b/c` both have two static segments, but the first one commits to a literal earlier and must win. The comparison has to be lexicographic over the kind sequence, exactly like comparing words letter by letter, with running out of segments treated as the least specific outcome so that `/users/:id/posts` is tried before `/users/:id`.\n' +
      '\n' +
      'Precompute the kind array per pattern, keep the original index, and return the index difference when everything else is equal so the result does not depend on the engine\'s sort being stable. Cost is O(n log n) comparisons of O(segments) each.',
    examples: [
      { input: [['/files/*', '/files/:id', '/files/recent']], expected: ['/files/recent', '/files/:id', '/files/*'] },
      { input: [['/:x/b/c', '/a/:id/c']], expected: ['/a/:id/c', '/:x/b/c'] },
      { input: [['/users', '/users/:id', '/users/:id/posts']], expected: ['/users/:id/posts', '/users/:id', '/users'] },
    ],
    hiddenTests: [
      { input: [['/b', '/a', '/:any', '/c']], expected: ['/b', '/a', '/c', '/:any'] },
      { input: [[]], expected: [] },
      { input: [['/*', '/:lang/docs', '/en/docs', '/:lang/*', '/en/:page']], expected: ['/en/docs', '/en/:page', '/:lang/docs', '/:lang/*', '/*'] },
      { input: [['/:a/:b', '/x/*', '/:a/y', '/x/:b/z/w', '/x/y']], expected: ['/x/y', '/x/:b/z/w', '/x/*', '/:a/y', '/:a/:b'] },
      { input: [['/teams/:team/members/:id', '/teams/:org/members/me', '/teams/:slug/members/:member']], expected: ['/teams/:org/members/me', '/teams/:team/members/:id', '/teams/:slug/members/:member'] },
    ],
  },
  {
    id: 'node-upload-content-type-parse',
    number: 55,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Upload Content-Type Parser',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'An upload endpoint must read the `Content-Type` request header properly: the media type decides which body parser runs, and parameters such as `charset` and `boundary` configure it. Implement `parseContentType(header)` returning `{ type, params }`, or `null` when the header is unusable.\n' +
      '\n' +
      '- The header is a media type followed by zero or more parameters, separated by `;`. A `;` inside a double-quoted value does NOT separate anything.\n' +
      '- `type` is the first piece, trimmed and lowercased. It must look like `token/token`, where a token is one or more of the characters `a-z 0-9 ! # $ & ^ _ . + -` (checked after lowercasing). Otherwise return `null`.\n' +
      '- A piece that is empty or only whitespace (for example after a trailing `;`) is skipped.\n' +
      '- Every other piece is `name=value`, split at its first `=`. The name is trimmed and lowercased; a piece with no `=` or with an empty name makes the whole header invalid: return `null`.\n' +
      '- The value is trimmed. If it then starts with `"` it is a quoted string that runs to the closing `"`: drop the surrounding quotes, and inside them a backslash makes the next character literal (`\\"` is a quote, `\\\\` is a backslash). An unquoted value is used as is. Values keep their letter case.\n' +
      '- A quote that is never closed makes the header invalid: return `null`.\n' +
      '- If a parameter name appears more than once, the first occurrence wins.\n' +
      '\n' +
      'In the tests nothing ever follows the closing quote of a quoted value except whitespace and the next `;`.',
    functionName: 'parseContentType',
    functionSignature: 'function parseContentType(header)',
    buggyCode:
      'function parseContentType(header) {\n' +
      '  // TODO: split on ; outside double quotes, validate the type/subtype,\n' +
      '  // then read name=value parameters (quoted values, first duplicate wins)\n' +
      '  return { type: header, params: {} };\n' +
      '}\n',
    solution:
      'function parseContentType(header) {\n' +
      '  const pieces = [];\n' +
      '  let current = \'\';\n' +
      '  let quoted = false;\n' +
      '  for (let i = 0; i < header.length; i++) {\n' +
      '    const ch = header[i];\n' +
      '    if (quoted && ch === \'\\\\\' && i + 1 < header.length) {\n' +
      '      current += ch + header[++i];\n' +
      '    } else if (ch === \';\' && !quoted) {\n' +
      '      pieces.push(current);\n' +
      '      current = \'\';\n' +
      '    } else {\n' +
      '      if (ch === \'"\') quoted = !quoted;\n' +
      '      current += ch;\n' +
      '    }\n' +
      '  }\n' +
      '  if (quoted) return null;\n' +
      '  pieces.push(current);\n' +
      '  const type = pieces[0].trim().toLowerCase();\n' +
      '  if (!/^[a-z0-9!#$&^_.+-]+\\/[a-z0-9!#$&^_.+-]+$/.test(type)) return null;\n' +
      '  const params = {};\n' +
      '  for (const piece of pieces.slice(1)) {\n' +
      '    if (piece.trim() === \'\') continue;\n' +
      '    const eq = piece.indexOf(\'=\');\n' +
      '    const name = eq === -1 ? \'\' : piece.slice(0, eq).trim().toLowerCase();\n' +
      '    if (name === \'\') return null;\n' +
      '    let value = piece.slice(eq + 1).trim();\n' +
      '    if (value.startsWith(\'"\')) value = value.slice(1, -1).replace(/\\\\(.)/g, \'$1\');\n' +
      '    if (!Object.prototype.hasOwnProperty.call(params, name)) params[name] = value;\n' +
      '  }\n' +
      '  return { type, params };\n' +
      '}\n',
    hint: 'A plain `split(";")` cuts quoted values in half. Scan character by character with an "inside quotes" flag, and when you meet a backslash inside quotes, copy it together with the next character.',
    explanation:
      'Headers with parameters look splittable, but HTTP allows a parameter value to be a quoted string that may contain the separators themselves: a multipart boundary such as `"--a;b=c"` is legal. The reliable approach is a small scanner: walk the characters, flip an `inQuotes` flag on each unescaped double quote, and only treat `;` as a separator while the flag is off. A backslash inside quotes consumes the following character, so an escaped quote cannot end the string. If the scan finishes with the flag still on, the header is malformed.\n' +
      '\n' +
      'After splitting, the first piece is the media type; it is case-insensitive, so lowercase it and validate the `type/subtype` shape instead of passing garbage to the body-parser lookup. Each remaining piece splits at its FIRST `=` (values may contain `=`), names are lowercased, and quoted values are unwrapped and unescaped. Values keep their case because a boundary is compared byte for byte.\n' +
      '\n' +
      'The scan is a single O(n) pass.',
    examples: [
      { input: ['text/html; charset=UTF-8'], expected: { type: 'text/html', params: { charset: 'UTF-8' } } },
      { input: ['multipart/form-data; boundary="--a;b=c"; charset=utf-8'], expected: { type: 'multipart/form-data', params: { boundary: '--a;b=c', charset: 'utf-8' } } },
      { input: ['text/plain; charset'], expected: null },
    ],
    hiddenTests: [
      { input: ['Application/JSON;'], expected: { type: 'application/json', params: {} } },
      { input: ['text/plain; title="say \\"hi\\" \\\\ bye"'], expected: { type: 'text/plain', params: { title: 'say "hi" \\ bye' } } },
      { input: ['text/plain; note="unterminated'], expected: null },
      { input: ['text/csv ; Header = present ; header=absent;;'], expected: { type: 'text/csv', params: { header: 'present' } } },
      { input: ['json'], expected: null },
      { input: ['application/vnd.api+json;profile="https://x.io/a;b";v=1=2'], expected: { type: 'application/vnd.api+json', params: { profile: 'https://x.io/a;b', v: '1=2' } } },
    ],
  },
  {
    id: 'node-transit-api-key-check',
    number: 56,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Transit API Key Shape Check',
    difficulty: 'Easy',
    topic: 'Auth & Security',
    statement:
      'A transit-data API hands out keys that carry a check value, so an obviously mistyped key can be rejected at the edge without a database lookup. Implement `checkApiKey(header)`, where `header` is the raw `Authorization` header (a string, or `null` when absent).\n' +
      '\n' +
      'A key looks like `tk_<env>_<id>_<check>`:\n' +
      '- `<env>` is `live` or `test`;\n' +
      '- `<id>` is exactly 8 characters, each a lowercase letter or a digit;\n' +
      '- `<check>` is exactly 2 digits.\n' +
      '\n' +
      'The check is valid when it equals the sum of the character codes (`charCodeAt`) of the 8 `<id>` characters, modulo 97, written with two digits (`5` is written `05`).\n' +
      '\n' +
      'Return the first that applies:\n' +
      '1. `header` is `null` or empty: `{ ok: false, error: \'missing\' }`.\n' +
      '2. The header is not the word `Bearer` (any letter case) followed by one or more spaces: `{ ok: false, error: \'scheme\' }`. Everything after those spaces, possibly nothing, is the key.\n' +
      '3. The key does not have exactly the shape above (nothing before or after it): `{ ok: false, error: \'malformed\' }`.\n' +
      '4. The check does not match: `{ ok: false, error: \'checksum\' }`.\n' +
      '5. Otherwise `{ ok: true, env, id }`.',
    functionName: 'checkApiKey',
    functionSignature: 'function checkApiKey(header)',
    buggyCode:
      'function checkApiKey(header) {\n' +
      '  // TODO: missing -> scheme -> malformed -> checksum -> ok\n' +
      '  // check = (sum of the char codes of the 8 id characters) % 97, two digits\n' +
      '  return { ok: false, error: \'missing\' };\n' +
      '}\n',
    solution:
      'function checkApiKey(header) {\n' +
      '  if (header === null || header === \'\') return { ok: false, error: \'missing\' };\n' +
      '  const scheme = /^bearer +(.*)$/i.exec(header);\n' +
      '  if (!scheme) return { ok: false, error: \'scheme\' };\n' +
      '  const m = /^tk_(live|test)_([a-z0-9]{8})_(\\d{2})$/.exec(scheme[1]);\n' +
      '  if (!m) return { ok: false, error: \'malformed\' };\n' +
      '  let sum = 0;\n' +
      '  for (let i = 0; i < m[2].length; i++) sum += m[2].charCodeAt(i);\n' +
      '  if (sum % 97 !== Number(m[3])) return { ok: false, error: \'checksum\' };\n' +
      '  return { ok: true, env: m[1], id: m[2] };\n' +
      '}\n',
    hint: 'Two anchored regular expressions do most of the work: one for the scheme, one for the whole key with capture groups for env, id and check.',
    explanation:
      'This is layered validation: each check assumes the previous ones passed, and each failure gets its own error so clients and logs can tell a missing header from a typo.\n' +
      '\n' +
      'Auth schemes are case-insensitive, so match `Bearer` with the `i` flag and allow any number of spaces. Anchor the key pattern at both ends (`^...$`): an unanchored pattern accepts a valid key buried inside junk, which is how prefix and suffix smuggling bugs happen. With capture groups the regular expression both validates the shape and extracts the three fields.\n' +
      '\n' +
      'The checksum is computed over the id only. Comparing numbers (`sum % 97 === Number(check)`) is safe here because the shape already guarantees exactly two digits. A check value like this is not a secret or a signature; it only catches transcription errors cheaply, before the real lookup. Cost is O(length of the header).',
    examples: [
      { input: ['Bearer tk_live_a1b2c3d4_14'], expected: { ok: true, env: 'live', id: 'a1b2c3d4' } },
      { input: ['Bearer tk_test_zz9ykq07_67'], expected: { ok: false, error: 'checksum' } },
      { input: ['Basic dXNlcjpwYXNz'], expected: { ok: false, error: 'scheme' } },
    ],
    hiddenTests: [
      { input: [null], expected: { ok: false, error: 'missing' } },
      { input: ['bearer   tk_test_q7007999_05'], expected: { ok: true, env: 'test', id: 'q7007999' } },
      { input: ['Bearer tk_live_a1b2c3d4_14x'], expected: { ok: false, error: 'malformed' } },
      { input: ['Bearer xtk_live_a1b2c3d4_14'], expected: { ok: false, error: 'malformed' } },
      { input: ['Bearer tk_prod_a1b2c3d4_14'], expected: { ok: false, error: 'malformed' } },
      { input: ['Bearer tk_test_q7007999_5'], expected: { ok: false, error: 'malformed' } },
    ],
  },
  {
    id: 'node-lecture-video-byte-ranges',
    number: 57,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Lecture Video Byte Ranges',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'A course platform streams lecture videos, and players seek by sending a `Range` header. Implement `resolveRange(header, size)` that decides what to serve. `header` is the raw header (or `null`), `size` is the file length in bytes (an integer, possibly `0`).\n' +
      '\n' +
      '- If `header` is `null` or does not start with exactly `bytes=`, ignore it: return `{ status: 200 }`.\n' +
      '- The rest is a comma-separated list of specs; trim whitespace around each. A spec is one of:\n' +
      '  - `a-b`: bytes `a` through `b` inclusive. If `b` is past the end, it is lowered to `size - 1`.\n' +
      '  - `a-`: from byte `a` to the end.\n' +
      '  - `-n`: the LAST `n` bytes (the whole file if `n` exceeds `size`).\n' +
      '  Here `a`, `b`, `n` are runs of digits.\n' +
      '- If ANY spec is malformed (anything else, including a bare `-`, or `a-b` with `b < a`), ignore the whole header: return `{ status: 200 }`.\n' +
      '- A well-formed spec is unsatisfiable when it selects no bytes: `a >= size`, or `-0`. Drop unsatisfiable specs.\n' +
      '- If nothing is left, return `{ status: 416, contentRange: \'bytes */<size>\' }`.\n' +
      '- Otherwise sort the remaining ranges by start and merge any two that overlap or touch (the next one starts at or before the previous end plus one). Return `{ status: 206, ranges }` where `ranges` is the merged array of `{ start, end }` (both inclusive) in ascending order.',
    functionName: 'resolveRange',
    functionSignature: 'function resolveRange(header, size)',
    buggyCode:
      'function resolveRange(header, size) {\n' +
      '  // TODO: parse a-b, a- and -n specs, clamp to the file size,\n' +
      '  // 200 when the header is ignored, 416 when nothing is satisfiable,\n' +
      '  // otherwise 206 with sorted, merged { start, end } ranges\n' +
      '  return { status: 200 };\n' +
      '}\n',
    solution:
      'function resolveRange(header, size) {\n' +
      '  if (header === null || !header.startsWith(\'bytes=\')) return { status: 200 };\n' +
      '  const ranges = [];\n' +
      '  for (const raw of header.slice(6).split(\',\')) {\n' +
      '    const m = /^(\\d*)-(\\d*)$/.exec(raw.trim());\n' +
      '    if (!m || (m[1] === \'\' && m[2] === \'\')) return { status: 200 };\n' +
      '    let start;\n' +
      '    let end = size - 1;\n' +
      '    if (m[1] === \'\') {\n' +
      '      start = Math.max(0, size - Number(m[2]));\n' +
      '      if (Number(m[2]) === 0) start = size;\n' +
      '    } else {\n' +
      '      start = Number(m[1]);\n' +
      '      if (m[2] !== \'\') {\n' +
      '        if (Number(m[2]) < start) return { status: 200 };\n' +
      '        end = Math.min(Number(m[2]), size - 1);\n' +
      '      }\n' +
      '    }\n' +
      '    if (start < size) ranges.push({ start, end });\n' +
      '  }\n' +
      '  if (ranges.length === 0) return { status: 416, contentRange: \'bytes */\' + size };\n' +
      '  ranges.sort((a, b) => a.start - b.start);\n' +
      '  const merged = [ranges[0]];\n' +
      '  for (const range of ranges.slice(1)) {\n' +
      '    const last = merged[merged.length - 1];\n' +
      '    if (range.start <= last.end + 1) last.end = Math.max(last.end, range.end);\n' +
      '    else merged.push(range);\n' +
      '  }\n' +
      '  return { status: 206, ranges: merged };\n' +
      '}\n',
    hint: 'Keep three outcomes apart: a syntax error means "ignore the header" (200), a valid range that is out of bounds is just dropped, and only when every range was dropped do you answer 416.',
    explanation:
      'Range handling is mostly about classifying input correctly. HTTP says a server that cannot parse a `Range` header should behave as if it was not sent (a full 200), whereas a header that parses but selects nothing gets 416 with a `Content-Range` that tells the client the real size. Mixing the two up either breaks players that send odd headers or hides genuine out-of-bounds seeks.\n' +
      '\n' +
      'Parse each spec with one anchored pattern, `^(\\d*)-(\\d*)$`, and branch on which side is empty: an empty left side is a suffix length counted from the end (not an offset from the start), an empty right side runs to the last byte. Clamp ends to `size - 1`; an end past the file is normal, because players often ask for more than exists.\n' +
      '\n' +
      'Finally apply the classic interval merge: sort by start, then extend the last kept range when the next one begins at or before `last.end + 1`, taking the maximum of the ends so a range nested inside another cannot shrink it. That stops a client from making the server send the same bytes several times. Cost is O(k log k) for k specs.',
    examples: [
      { input: ['bytes=0-499', 1000], expected: { status: 206, ranges: [{ start: 0, end: 499 }] } },
      { input: ['bytes=-200', 1000], expected: { status: 206, ranges: [{ start: 800, end: 999 }] } },
      { input: ['bytes=600-700, 0-10, 650-800', 1000], expected: { status: 206, ranges: [{ start: 0, end: 10 }, { start: 600, end: 800 }] } },
    ],
    hiddenTests: [
      { input: ['bytes=500-1999, 1000-1200', 1000], expected: { status: 206, ranges: [{ start: 500, end: 999 }] } },
      { input: ['bytes=1000-, -0', 1000], expected: { status: 416, contentRange: 'bytes */1000' } },
      { input: ['bytes=0-99,100-199,300-', 1000], expected: { status: 206, ranges: [{ start: 0, end: 199 }, { start: 300, end: 999 }] } },
      { input: ['bytes=0-10,7-3', 1000], expected: { status: 200 } },
      { input: ['bytes=-5000', 1000], expected: { status: 206, ranges: [{ start: 0, end: 999 }] } },
      { input: ['bytes=0-900, 100-200', 1000], expected: { status: 206, ranges: [{ start: 0, end: 900 }] } },
    ],
  },
  {
    id: 'node-webhook-signature-window',
    number: 58,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Webhook Signature Window',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A billing provider signs every webhook it sends, and the receiver must reject forged and replayed deliveries. Real systems use HMAC; here a simple stated checksum stands in for it. Implement `verifyWebhook(header, body, secret, now, tolerance)`.\n' +
      '\n' +
      '`header` is the signature header, a comma-separated list of `key=value` pieces such as `t=1700000000,v1=5f3a9c01,v1=0b77e2d4`. Trim whitespace around each key and value. Pieces without `=` and pieces with any other key are ignored.\n' +
      '- `t` is the unix time in seconds at which the sender signed (at most one `t` appears).\n' +
      '- Every `v1` is a candidate signature; several may be present while the sender rotates secrets.\n' +
      '\n' +
      'The signature of a delivery is computed over the string `secret + \'.\' + t + \'.\' + body`, using `t` exactly as written in the header: start with `h = 5381`; for each character, `h = (h * 33 + charCode) % 4294967296`; the signature is `h` in lowercase hexadecimal, left-padded with zeros to 8 characters.\n' +
      '\n' +
      'Return the first that applies:\n' +
      '1. No `t`, a `t` that is not all digits, or no `v1` at all: `{ ok: false, reason: \'malformed\' }`.\n' +
      '2. The timestamp is more than `tolerance` seconds away from `now`, in EITHER direction: `{ ok: false, reason: \'stale\' }`. Exactly `tolerance` seconds away is still accepted.\n' +
      '3. None of the `v1` values equals the computed signature: `{ ok: false, reason: \'mismatch\' }`.\n' +
      '4. Otherwise `{ ok: true, timestamp }` with the timestamp as a number.\n' +
      '\n' +
      '`now` (seconds) and `tolerance` are passed in; never read a clock.',
    functionName: 'verifyWebhook',
    functionSignature: 'function verifyWebhook(header, body, secret, now, tolerance)',
    buggyCode:
      'function verifyWebhook(header, body, secret, now, tolerance) {\n' +
      '  // TODO: read t and every v1 from the header, reject malformed and stale,\n' +
      '  // then compare against the checksum of secret + \'.\' + t + \'.\' + body\n' +
      '  // (h = 5381; h = (h * 33 + code) % 4294967296; 8 hex digits)\n' +
      '  return { ok: false, reason: \'malformed\' };\n' +
      '}\n',
    solution:
      'function verifyWebhook(header, body, secret, now, tolerance) {\n' +
      '  let t = null;\n' +
      '  const signatures = [];\n' +
      '  for (const piece of header.split(\',\')) {\n' +
      '    const eq = piece.indexOf(\'=\');\n' +
      '    if (eq === -1) continue;\n' +
      '    const key = piece.slice(0, eq).trim();\n' +
      '    const value = piece.slice(eq + 1).trim();\n' +
      '    if (key === \'t\') t = value;\n' +
      '    else if (key === \'v1\') signatures.push(value);\n' +
      '  }\n' +
      '  if (t === null || !/^\\d+$/.test(t) || signatures.length === 0) return { ok: false, reason: \'malformed\' };\n' +
      '  if (Math.abs(now - Number(t)) > tolerance) return { ok: false, reason: \'stale\' };\n' +
      '  const payload = secret + \'.\' + t + \'.\' + body;\n' +
      '  let h = 5381;\n' +
      '  for (let i = 0; i < payload.length; i++) h = (h * 33 + payload.charCodeAt(i)) % 4294967296;\n' +
      '  const expected = h.toString(16).padStart(8, \'0\');\n' +
      '  if (!signatures.includes(expected)) return { ok: false, reason: \'mismatch\' };\n' +
      '  return { ok: true, timestamp: Number(t) };\n' +
      '}\n',
    hint: 'The timestamp is part of what gets signed, and the freshness check must use the absolute difference. Keep every v1 you see, not just the first.',
    explanation:
      'A webhook signature answers "did the real sender produce this body?", but a valid signature alone does not stop an attacker who captured one delivery from replaying it forever. That is why the timestamp is included in the signed string and then compared with the receiver\'s clock: an old delivery is rejected even though its signature is genuine, and the timestamp cannot be changed without invalidating the signature.\n' +
      '\n' +
      'Parse the header into one `t` and a list of `v1` values, splitting each piece at its first `=`. Validate shape first, then freshness with `Math.abs(now - t) > tolerance` (a timestamp far in the future is as suspicious as one far in the past), then the signature. Accepting any of several `v1` values is what lets a sender roll its secret without dropped deliveries.\n' +
      '\n' +
      'Two arithmetic details: `h * 33 + code` stays below 2^53, so the plain `%` is exact, whereas a `| 0` would produce negative numbers; and the hex string must be zero-padded or one signature in sixteen will fail to match. Cost is O(header + body).',
    examples: [
      { input: ['t=1700000000,v1=c44853fc', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000120, 300], expected: { ok: true, timestamp: 1700000000 } },
      { input: ['t=1700000000,v1=c44853fc', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000301, 300], expected: { ok: false, reason: 'stale' } },
      { input: ['t=1700000000,v1=c44853fc', '{"id":"in_204","event":"invoice.void"}', 'whsec_plum', 1700000120, 300], expected: { ok: false, reason: 'mismatch' } },
    ],
    hiddenTests: [
      { input: ['v0=legacy, t = 1700000300 , v1=5403feb6, v1=068e84d5', '{"seq":5,"event":"ping"}', 'whsec_plum', 1700000000, 300], expected: { ok: true, timestamp: 1700000300 } },
      { input: ['t=1700000900,v1=deadbeef', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000000, 300], expected: { ok: false, reason: 'stale' } },
      { input: ['v1=c44853fc', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000000, 300], expected: { ok: false, reason: 'malformed' } },
      { input: ['t=1700000000', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000000, 300], expected: { ok: false, reason: 'malformed' } },
      { input: ['t=17e8,v1=edcf3799', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000000, 300], expected: { ok: false, reason: 'malformed' } },
      { input: ['t=1700000050,v1=c44853fc', '{"id":"in_204","event":"invoice.paid"}', 'whsec_plum', 1700000060, 300], expected: { ok: false, reason: 'mismatch' } },
    ],
  },
  {
    id: 'node-listing-query-validator',
    number: 59,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Listing Query Validator',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement:
      'A marketplace\'s `GET /listings` endpoint accepts paging, sorting and filtering through the query string. Implement `validateListQuery(query)`, where `query` is an object whose values are all strings (already URL-decoded). Return either the normalised values or EVERY problem found, so the client can fix them in one round trip.\n' +
      '\n' +
      'Recognised parameters (a missing one takes its default; values are never trimmed):\n' +
      '- `limit`: digits only (`^\\d+$`), and between 1 and 100 as a number. Default `20`. Error message: `must be an integer between 1 and 100`.\n' +
      '- `offset`: digits only. Default `0`. Error message: `must be a non-negative integer`.\n' +
      '- `sort`: one of `createdAt`, `name`, `price`, optionally prefixed with `-` for descending. It becomes `{ field, dir }` with `dir` `\'asc\'` or `\'desc\'`. Default `{ field: \'createdAt\', dir: \'desc\' }`. Error message: `unknown sort field`.\n' +
      '- `status`: a comma-separated list where every item is one of `active`, `archived`, `draft`. It becomes an array with duplicates removed, keeping first appearances in order. Default `[]`. Error message: `unknown status: <item>` for the FIRST bad item only.\n' +
      '\n' +
      'Any other key in `query` is an error with message `unknown parameter`.\n' +
      '\n' +
      'Return `{ ok: true, value: { limit, offset, sort, status } }` (numbers for `limit` and `offset`) when there are no errors. Otherwise return `{ ok: false, errors }`, where `errors` is an array of `{ field, message }`: at most one each for `limit`, `offset`, `sort`, `status` in that order, followed by the unknown keys in ascending order as sorted by the default `Array.prototype.sort()`.',
    functionName: 'validateListQuery',
    functionSignature: 'function validateListQuery(query)',
    buggyCode:
      'function validateListQuery(query) {\n' +
      '  // TODO: validate limit, offset, sort and status, apply the defaults,\n' +
      '  // and collect every error (known fields in order, then unknown keys sorted)\n' +
      '  return { ok: true, value: query };\n' +
      '}\n',
    solution:
      'function validateListQuery(query) {\n' +
      '  const has = (key) => Object.prototype.hasOwnProperty.call(query, key);\n' +
      '  const errors = [];\n' +
      '  const value = { limit: 20, offset: 0, sort: { field: \'createdAt\', dir: \'desc\' }, status: [] };\n' +
      '  if (has(\'limit\')) {\n' +
      '    const n = /^\\d+$/.test(query.limit) ? Number(query.limit) : 0;\n' +
      '    if (n >= 1 && n <= 100) value.limit = n;\n' +
      '    else errors.push({ field: \'limit\', message: \'must be an integer between 1 and 100\' });\n' +
      '  }\n' +
      '  if (has(\'offset\')) {\n' +
      '    if (/^\\d+$/.test(query.offset)) value.offset = Number(query.offset);\n' +
      '    else errors.push({ field: \'offset\', message: \'must be a non-negative integer\' });\n' +
      '  }\n' +
      '  if (has(\'sort\')) {\n' +
      '    const desc = query.sort.startsWith(\'-\');\n' +
      '    const field = desc ? query.sort.slice(1) : query.sort;\n' +
      '    if ([\'createdAt\', \'name\', \'price\'].includes(field)) value.sort = { field, dir: desc ? \'desc\' : \'asc\' };\n' +
      '    else errors.push({ field: \'sort\', message: \'unknown sort field\' });\n' +
      '  }\n' +
      '  if (has(\'status\')) {\n' +
      '    for (const item of query.status.split(\',\')) {\n' +
      '      if (![\'active\', \'archived\', \'draft\'].includes(item)) {\n' +
      '        errors.push({ field: \'status\', message: \'unknown status: \' + item });\n' +
      '        break;\n' +
      '      }\n' +
      '      if (!value.status.includes(item)) value.status.push(item);\n' +
      '    }\n' +
      '  }\n' +
      '  for (const key of Object.keys(query).sort()) {\n' +
      '    if (![\'limit\', \'offset\', \'sort\', \'status\'].includes(key)) errors.push({ field: key, message: \'unknown parameter\' });\n' +
      '  }\n' +
      '  return errors.length ? { ok: false, errors } : { ok: true, value };\n' +
      '}\n',
    hint: 'Start from an object holding all the defaults, overwrite a field only when its input is valid, and push to an errors array instead of returning early.',
    explanation:
      'Input validation at the HTTP edge has two jobs: turning strings into typed values, and telling the caller precisely what is wrong. Returning on the first failure makes clients play whack-a-mole, so collect errors into a list and decide at the end.\n' +
      '\n' +
      'Be strict about numbers. `Number(\'1e2\')`, `Number(\' 5\')` and `parseInt(\'10.5\')` all quietly produce a number from text that is not a plain integer; a digits-only pattern followed by a range check accepts exactly what the API documents. For `sort`, peel off an optional leading `-` and check the rest against a whitelist: never pass a client-supplied field name through to a database query. `status` splits on commas, validates each item, and de-duplicates while keeping order.\n' +
      '\n' +
      'Unknown parameters are rejected rather than ignored: a typo like `limt=5` would otherwise fall back to the default and look like a server bug. Sorting them makes the error list deterministic. Cost is linear in the size of the query.',
    examples: [
      { input: [{ limit: '50', sort: 'price', status: 'active,draft,active' }], expected: { ok: true, value: { limit: 50, offset: 0, sort: { field: 'price', dir: 'asc' }, status: ['active', 'draft'] } } },
      { input: [{ limit: '0', page: '2' }], expected: { ok: false, errors: [{ field: 'limit', message: 'must be an integer between 1 and 100' }, { field: 'page', message: 'unknown parameter' }] } },
      { input: [{}], expected: { ok: true, value: { limit: 20, offset: 0, sort: { field: 'createdAt', dir: 'desc' }, status: [] } } },
    ],
    hiddenTests: [
      { input: [{ limit: '10.5', offset: '-1', sort: '-rating', status: 'active,deleted,bogus', page: '2', cursor: 'x' }], expected: { ok: false, errors: [{ field: 'limit', message: 'must be an integer between 1 and 100' }, { field: 'offset', message: 'must be a non-negative integer' }, { field: 'sort', message: 'unknown sort field' }, { field: 'status', message: 'unknown status: deleted' }, { field: 'cursor', message: 'unknown parameter' }, { field: 'page', message: 'unknown parameter' }] } },
      { input: [{ limit: '100', offset: '007', sort: '-name', status: 'draft' }], expected: { ok: true, value: { limit: 100, offset: 7, sort: { field: 'name', dir: 'desc' }, status: ['draft'] } } },
      { input: [{ limit: '1e2', offset: '3' }], expected: { ok: false, errors: [{ field: 'limit', message: 'must be an integer between 1 and 100' }] } },
      { input: [{ limit: ' 5', sort: 'Price' }], expected: { ok: false, errors: [{ field: 'limit', message: 'must be an integer between 1 and 100' }, { field: 'sort', message: 'unknown sort field' }] } },
      { input: [{ zeta: '1', limit: '101', Alpha: '2', status: 'archived,active,archived,draft,active' }], expected: { ok: false, errors: [{ field: 'limit', message: 'must be an integer between 1 and 100' }, { field: 'Alpha', message: 'unknown parameter' }, { field: 'zeta', message: 'unknown parameter' }] } },
      { input: [{ offset: '12abc', status: 'draft,Active' }], expected: { ok: false, errors: [{ field: 'offset', message: 'must be a non-negative integer' }, { field: 'status', message: 'unknown status: Active' }] } },
    ],
  },
  {
    id: 'node-error-envelope-mapper',
    number: 60,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Error Envelope Mapper',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'Every route in a clinic-booking API funnels its failures through one error handler, which must turn any thrown error into a consistent JSON envelope without leaking server internals. Implement `toErrorResponse(err, opts)`.\n' +
      '\n' +
      '`err` is a plain object with `name` and `message`, and possibly `status`, `code`, `details`, `retryAfter`. `opts` is `{ debug, requestId }` (`debug` is a boolean, `requestId` a string or `null`).\n' +
      '\n' +
      '1. Status: if `err.status` is an integer from 400 to 599, use it. Otherwise look `err.name` up in this table: `ValidationError` 422, `AuthError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409, `RateLimitError` 429. Anything else is 500.\n' +
      '2. Hiding: when the status is 500 or above and `opts.debug` is `false`, the client must not see internals: the message becomes `Internal Server Error` and the code becomes `HTTP_<status>`.\n' +
      '3. Otherwise the message is `err.message`, and the code is `err.code` when that is a non-empty string, else `HTTP_<status>`.\n' +
      '4. `details`: included only when the status is 422 and `err.details` is an array.\n' +
      '5. `requestId`: included when `opts.requestId` is not `null`.\n' +
      '6. Headers: `{ \'Retry-After\': String(err.retryAfter) }` when the status is 429 and `err.retryAfter` is a number; otherwise `{}`.\n' +
      '\n' +
      'Return `{ status, headers, body: { error: { code, message, ...optional details and requestId } } }`. Optional keys that do not apply must be absent, not `null`.',
    functionName: 'toErrorResponse',
    functionSignature: 'function toErrorResponse(err, opts)',
    buggyCode:
      'function toErrorResponse(err, opts) {\n' +
      '  // TODO: pick the status (explicit 4xx/5xx, else by name, else 500),\n' +
      '  // hide message and code for 5xx unless opts.debug, add details / requestId / Retry-After\n' +
      '  return { status: 500, headers: {}, body: { error: { code: err.code, message: err.message } } };\n' +
      '}\n',
    solution:
      'function toErrorResponse(err, opts) {\n' +
      '  const byName = {\n' +
      '    ValidationError: 422,\n' +
      '    AuthError: 401,\n' +
      '    ForbiddenError: 403,\n' +
      '    NotFoundError: 404,\n' +
      '    ConflictError: 409,\n' +
      '    RateLimitError: 429,\n' +
      '  };\n' +
      '  let status = 500;\n' +
      '  if (Number.isInteger(err.status) && err.status >= 400 && err.status <= 599) status = err.status;\n' +
      '  else if (Object.prototype.hasOwnProperty.call(byName, err.name)) status = byName[err.name];\n' +
      '  const hide = status >= 500 && !opts.debug;\n' +
      '  const error = {\n' +
      '    code: !hide && typeof err.code === \'string\' && err.code !== \'\' ? err.code : \'HTTP_\' + status,\n' +
      '    message: hide ? \'Internal Server Error\' : err.message,\n' +
      '  };\n' +
      '  if (status === 422 && Array.isArray(err.details)) error.details = err.details;\n' +
      '  if (opts.requestId !== null) error.requestId = opts.requestId;\n' +
      '  const headers = {};\n' +
      '  if (status === 429 && typeof err.retryAfter === \'number\') headers[\'Retry-After\'] = String(err.retryAfter);\n' +
      '  return { status, headers, body: { error } };\n' +
      '}\n',
    hint: 'Work out the status first; every later rule (hiding, details, Retry-After) is a simple condition on that one number.',
    explanation:
      'A central error mapper gives every endpoint the same failure shape and gives you one place to enforce a security rule: client errors (4xx) describe what the caller did wrong and are safe to echo, while server errors (5xx) often carry stack-level detail such as `connect ECONNREFUSED 10.0.0.5:5432` or a driver error code, which tells an attacker about your network and database. So 5xx responses get a fixed message and a generic code unless debugging is explicitly on.\n' +
      '\n' +
      'Compute the status once, preferring an explicit valid `status` over the name table, and defaulting to 500 for anything unrecognised (an out-of-range value like 200 on an error object is a bug, not something to send). Then build the body conditionally: `details` only for validation failures, `requestId` only when there is one, and `Retry-After` only for 429, as a string because header values are strings.\n' +
      '\n' +
      'Leave optional keys out entirely rather than setting them to `null`; clients commonly test for presence. The function is O(1) apart from copying the details.',
    examples: [
      { input: [{ name: 'NotFoundError', message: 'No appointment 88', code: 'APPOINTMENT_NOT_FOUND' }, ERR_OPTS], expected: { status: 404, headers: {}, body: { error: { code: 'APPOINTMENT_NOT_FOUND', message: 'No appointment 88', requestId: 'req-81c' } } } },
      { input: [{ name: 'Error', message: 'connect ECONNREFUSED 10.0.0.5:5432', code: 'ECONNREFUSED' }, ERR_OPTS], expected: { status: 500, headers: {}, body: { error: { code: 'HTTP_500', message: 'Internal Server Error', requestId: 'req-81c' } } } },
      { input: [{ name: 'ValidationError', message: 'Invalid booking', details: [{ field: 'slot', issue: 'in the past' }] }, ERR_OPTS_PLAIN], expected: { status: 422, headers: {}, body: { error: { code: 'HTTP_422', message: 'Invalid booking', details: [{ field: 'slot', issue: 'in the past' }] } } } },
    ],
    hiddenTests: [
      { input: [{ name: 'RateLimitError', message: 'Slow down', retryAfter: 30, details: ['x'] }, ERR_OPTS_PLAIN], expected: { status: 429, headers: { 'Retry-After': '30' }, body: { error: { code: 'HTTP_429', message: 'Slow down' } } } },
      { input: [{ name: 'Error', message: 'connect ECONNREFUSED 10.0.0.5:5432', code: 'ECONNREFUSED' }, ERR_OPTS_DEBUG], expected: { status: 500, headers: {}, body: { error: { code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 10.0.0.5:5432' } } } },
      { input: [{ name: 'NotFoundError', message: 'Upstream calendar is down', status: 503, code: 'CAL_DOWN', retryAfter: 5 }, ERR_OPTS], expected: { status: 503, headers: {}, body: { error: { code: 'HTTP_503', message: 'Internal Server Error', requestId: 'req-81c' } } } },
      { input: [{ name: 'ConflictError', message: 'Slot already taken', status: 200, code: '' }, ERR_OPTS_PLAIN], expected: { status: 409, headers: {}, body: { error: { code: 'HTTP_409', message: 'Slot already taken' } } } },
      { input: [{ name: 'TeapotError', message: 'Short and stout', status: 418, code: 'TEAPOT', details: [1] }, ERR_OPTS_DEBUG], expected: { status: 418, headers: {}, body: { error: { code: 'TEAPOT', message: 'Short and stout' } } } },
      { input: [{ name: 'TypeError', message: 'x is not a function', status: 404.5 }, ERR_OPTS_PLAIN], expected: { status: 500, headers: {}, body: { error: { code: 'HTTP_500', message: 'Internal Server Error' } } } },
    ],
  },
  {
    id: 'node-fixed-window-limit-headers',
    number: 61,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Fixed-Window Limit Headers',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A weather API limits each client to `limit` requests per fixed window and reports the state in response headers so well-behaved clients can pace themselves. Implement `rateLimitHeaders(limit, windowSec, hits, now)` for a request arriving at `now`.\n' +
      '\n' +
      '- All times are whole unix seconds. Windows are aligned to the clock: the current window starts at `windowStart = Math.floor(now / windowSec) * windowSec` and the next one starts at `reset = windowStart + windowSec`.\n' +
      '- `hits` lists the timestamps of this client\'s earlier requests that were counted (ascending, none later than `now`, possibly from older windows). `used` is how many of them fall in the current window, that is `>= windowStart`.\n' +
      '- The new request is allowed when `used < limit`.\n' +
      '- Headers (every value is a STRING):\n' +
      '  - `X-RateLimit-Limit`: the limit.\n' +
      '  - `X-RateLimit-Remaining`: requests left in this window AFTER counting the new request if it was allowed; `0` when it was blocked.\n' +
      '  - `X-RateLimit-Reset`: `reset`, as a unix timestamp.\n' +
      '  - `Retry-After`: seconds from `now` until `reset`; present ONLY when the request is blocked.\n' +
      '\n' +
      'Return `{ allowed, headers }`.',
    functionName: 'rateLimitHeaders',
    functionSignature: 'function rateLimitHeaders(limit, windowSec, hits, now)',
    buggyCode:
      'function rateLimitHeaders(limit, windowSec, hits, now) {\n' +
      '  // TODO: find the clock-aligned window, count the hits inside it,\n' +
      '  // then fill X-RateLimit-Limit / -Remaining / -Reset (strings) and Retry-After when blocked\n' +
      '  return { allowed: true, headers: {} };\n' +
      '}\n',
    solution:
      'function rateLimitHeaders(limit, windowSec, hits, now) {\n' +
      '  const windowStart = Math.floor(now / windowSec) * windowSec;\n' +
      '  const reset = windowStart + windowSec;\n' +
      '  const used = hits.filter((t) => t >= windowStart).length;\n' +
      '  const allowed = used < limit;\n' +
      '  const headers = {\n' +
      '    \'X-RateLimit-Limit\': String(limit),\n' +
      '    \'X-RateLimit-Remaining\': String(allowed ? limit - used - 1 : 0),\n' +
      '    \'X-RateLimit-Reset\': String(reset),\n' +
      '  };\n' +
      '  if (!allowed) headers[\'Retry-After\'] = String(reset - now);\n' +
      '  return { allowed, headers };\n' +
      '}\n',
    hint: 'The window is found by rounding `now` down to a multiple of `windowSec`, not by subtracting `windowSec` from `now`. Remember the request being answered also uses one slot.',
    explanation:
      'A fixed-window limiter buckets time into aligned slices: with a 60 second window, every request between 12:00:00 and 12:00:59 shares one counter that resets at 12:01:00. `Math.floor(now / windowSec) * windowSec` gives the start of the slice, and adding `windowSec` gives the reset time. Using `now - windowSec` instead describes a sliding window, a different algorithm with different answers.\n' +
      '\n' +
      'Count the earlier hits at or after `windowStart` (a hit exactly on the boundary belongs to the new window). The request is allowed if that count is below the limit. `Remaining` is where off-by-one errors live: it reports what is left after this request, so an allowed request shows `limit - used - 1`, and it never goes negative.\n' +
      '\n' +
      '`X-RateLimit-Reset` is an absolute timestamp while `Retry-After` is a duration, and `Retry-After` only makes sense on a rejected request. Header values are strings on the wire, so convert the numbers. Cost is O(number of hits).',
    examples: [
      { input: [5, 60, [100, 110, 119], 125], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '5', 'X-RateLimit-Remaining': '4', 'X-RateLimit-Reset': '180' } } },
      { input: [3, 60, [120, 121, 122], 179], expected: { allowed: false, headers: { 'X-RateLimit-Limit': '3', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '180', 'Retry-After': '1' } } },
      { input: [5, 60, [121, 122, 130], 150], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '5', 'X-RateLimit-Remaining': '1', 'X-RateLimit-Reset': '180' } } },
    ],
    hiddenTests: [
      { input: [2, 3600, [3599, 3600], 3600], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '2', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '7200' } } },
      { input: [1, 10, [], 0], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '1', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '10' } } },
      { input: [3, 60, [59, 60, 61, 62, 63], 100], expected: { allowed: false, headers: { 'X-RateLimit-Limit': '3', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '120', 'Retry-After': '20' } } },
      { input: [4, 30, [1, 29, 30, 31, 59], 59], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '4', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '60' } } },
      { input: [2, 100, [150, 199], 200], expected: { allowed: true, headers: { 'X-RateLimit-Limit': '2', 'X-RateLimit-Remaining': '1', 'X-RateLimit-Reset': '300' } } },
    ],
  },
  {
    id: 'node-endpoint-url-builder',
    number: 62,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Endpoint URL Builder',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A ride-hailing backend calls a partner API and builds every outgoing URL from a base, a path template and some values. Implement `buildUrl(base, template, params, query)` returning the URL string, or `null` when a required value is missing.\n' +
      '\n' +
      '- `base` is like `https://api.partner.io/v2`; remove ALL trailing slashes from it.\n' +
      '- Split `template` on `/` and ignore empty segments. A segment starting with `:` is a placeholder: `:name` is required, `:name?` (ending in `?`) is optional. Other segments are copied as they are.\n' +
      '- A placeholder\'s value is `params[name]`. It counts as missing when `params` has no such key or the value is `null`. Any other value (including `0`) is written as `encodeURIComponent(String(value))`.\n' +
      '- A missing REQUIRED placeholder makes the whole result `null`. A missing OPTIONAL placeholder simply drops that segment.\n' +
      '- Append the resulting segments to the base, each preceded by one `/`. With no segments the URL is just the base (no trailing slash).\n' +
      '- `query` is an array of `[key, value]` string pairs. If it is non-empty, append `?` and the pairs as `key=value` joined by `&`, in the given order, encoding each key and value with `encodeURIComponent`.',
    functionName: 'buildUrl',
    functionSignature: 'function buildUrl(base, template, params, query)',
    buggyCode:
      'function buildUrl(base, template, params, query) {\n' +
      '  // TODO: fill :name and :name? placeholders (encoded), join with single slashes,\n' +
      '  // return null for a missing required value, then append the encoded query pairs\n' +
      '  return base + template;\n' +
      '}\n',
    solution:
      'function buildUrl(base, template, params, query) {\n' +
      '  const segments = [];\n' +
      '  for (const seg of template.split(\'/\')) {\n' +
      '    if (seg === \'\') continue;\n' +
      '    if (!seg.startsWith(\':\')) {\n' +
      '      segments.push(seg);\n' +
      '      continue;\n' +
      '    }\n' +
      '    const optional = seg.endsWith(\'?\');\n' +
      '    const name = optional ? seg.slice(1, -1) : seg.slice(1);\n' +
      '    const value = Object.prototype.hasOwnProperty.call(params, name) ? params[name] : null;\n' +
      '    if (value === null) {\n' +
      '      if (optional) continue;\n' +
      '      return null;\n' +
      '    }\n' +
      '    segments.push(encodeURIComponent(String(value)));\n' +
      '  }\n' +
      '  let url = base.replace(/\\/+$/, \'\');\n' +
      '  if (segments.length) url += \'/\' + segments.join(\'/\');\n' +
      '  const pairs = query.map(([key, value]) => encodeURIComponent(key) + \'=\' + encodeURIComponent(value));\n' +
      '  return pairs.length ? url + \'?\' + pairs.join(\'&\') : url;\n' +
      '}\n',
    hint: 'Work on arrays of segments, not on the template string, and join once at the end. That removes every double-slash and trailing-slash special case.',
    explanation:
      'String concatenation is the usual way URL bugs are born: `base + path` produces `//` when both sides carry a slash, and an unencoded id such as `a/b c` silently changes which resource is addressed (or lets a caller inject extra path segments). Treat the path as a list of segments instead.\n' +
      '\n' +
      'Strip trailing slashes from the base, split the template, and map each segment: literals pass through, placeholders are looked up and encoded with `encodeURIComponent`, which escapes `/`, `?` and `#` so a value can never break out of its segment. Decide "missing" with an explicit own-key and `null` check; a truthiness test would reject the legitimate id `0`. A missing required value should fail loudly (here `null`) rather than produce a URL containing `undefined`.\n' +
      '\n' +
      'Join the segments with `/`, then append the query pairs, encoding keys and values separately. Everything is a single O(n) pass over the template and the query.',
    examples: [
      { input: ['https://api.partner.io/v2/', '/riders/:riderId/trips/:tripId', { riderId: 7, tripId: 'a/b c' }, []], expected: 'https://api.partner.io/v2/riders/7/trips/a%2Fb%20c' },
      { input: ['https://api.partner.io', 'zones/:city/:district?', { city: 'porto' }, [['radius', '2 km'], ['open', 'true']]], expected: 'https://api.partner.io/zones/porto?radius=2%20km&open=true' },
      { input: ['https://api.partner.io', '/riders/:riderId/trips', { tripId: 9 }, []], expected: null },
    ],
    hiddenTests: [
      { input: ['https://api.partner.io/v2///', '/', {}, []], expected: 'https://api.partner.io/v2' },
      { input: ['https://api.partner.io/v2', 'drivers/:id', { id: 0 }, [['fields', 'name,car'], ['q', 'a&b=c']]], expected: 'https://api.partner.io/v2/drivers/0?fields=name%2Ccar&q=a%26b%3Dc' },
      { input: ['https://api.partner.io', '/zones/:city/:district?/stops', { city: 'são paulo', district: null }, []], expected: 'https://api.partner.io/zones/s%C3%A3o%20paulo/stops' },
      { input: ['https://api.partner.io/', '//fares//:from//:to?', { from: 'A#1', to: 'B?2', extra: 'unused' }, []], expected: 'https://api.partner.io/fares/A%231/B%3F2' },
      { input: ['https://api.partner.io', '/riders/:riderId', { riderId: null }, [['x', '1']]], expected: null },
      { input: ['https://api.partner.io', '/:a?/:b?', {}, [['page', '2']]], expected: 'https://api.partner.io?page=2' },
    ],
  },
  {
    id: 'node-crawler-url-canonicalizer',
    number: 63,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Crawler URL Canonicalizer',
    difficulty: 'Hard',
    topic: 'HTTP & Routing',
    statement:
      'A link-preview service keeps one cache entry per page, so URLs that differ only cosmetically must collapse to the same canonical text. Implement `normalizeUrl(url)` by hand (do not rely on the `URL` class; its output differs from these rules).\n' +
      '\n' +
      'The input must be `http://` or `https://` (any letter case) followed by a non-empty host, then an optional path, an optional `?query` and an optional `#fragment`. The host (which may include `:port`) ends at the first `/`, `?` or `#`. Anything else returns `null`.\n' +
      '\n' +
      'Build the result as `scheme://host` + path + query:\n' +
      '- Scheme and host are lowercased. A port equal to the scheme\'s default (`:80` for http, `:443` for https) is removed; any other port stays.\n' +
      '- Path: split on `/`. Drop empty segments and `.` segments. A `..` segment removes the segment before it (and does nothing when there is none). The path is `/` followed by the remaining segments joined with `/`; so an empty path becomes `/`, and a trailing slash is removed everywhere else. Path letter case is preserved.\n' +
      '- Query: split on `&` and drop empty pieces. A piece\'s key is the text before its first `=` (the whole piece if it has none). Drop tracking pieces: keys starting with `utm_`, and the keys `fbclid` and `gclid` (case-sensitive). Sort the remaining pieces by key in ascending code-unit order; pieces with the same key keep their original relative order. If any remain, append `?` and the pieces joined with `&`; otherwise no `?` at all.\n' +
      '- The fragment is dropped.\n' +
      '- Finally, in the path and query, uppercase the two hex digits of every percent escape (`%2f` becomes `%2F`). Never decode or re-encode anything.',
    functionName: 'normalizeUrl',
    functionSignature: 'function normalizeUrl(url)',
    buggyCode:
      'function normalizeUrl(url) {\n' +
      '  // TODO: lowercase scheme and host, drop the default port, resolve . and .. segments,\n' +
      '  // drop tracking params, sort the query by key (stable), uppercase %xx, drop the fragment\n' +
      '  return url;\n' +
      '}\n',
    solution:
      'function normalizeUrl(url) {\n' +
      '  const m = /^(https?):\\/\\/([^\\/?#]+)([^?#]*)(\\?[^#]*)?(#.*)?$/i.exec(url);\n' +
      '  if (!m) return null;\n' +
      '  const scheme = m[1].toLowerCase();\n' +
      '  let host = m[2].toLowerCase();\n' +
      '  const defaultPort = scheme === \'http\' ? \':80\' : \':443\';\n' +
      '  if (host.endsWith(defaultPort)) host = host.slice(0, -defaultPort.length);\n' +
      '  const upper = (text) => text.replace(/%[0-9a-fA-F]{2}/g, (escape) => escape.toUpperCase());\n' +
      '  const segments = [];\n' +
      '  for (const seg of m[3].split(\'/\')) {\n' +
      '    if (seg === \'\' || seg === \'.\') continue;\n' +
      '    if (seg === \'..\') segments.pop();\n' +
      '    else segments.push(seg);\n' +
      '  }\n' +
      '  const pieces = (m[4] || \'?\')\n' +
      '    .slice(1)\n' +
      '    .split(\'&\')\n' +
      '    .filter((piece) => piece !== \'\')\n' +
      '    .map((piece, index) => ({ piece, index, key: piece.split(\'=\')[0] }))\n' +
      '    .filter((p) => !p.key.startsWith(\'utm_\') && p.key !== \'fbclid\' && p.key !== \'gclid\');\n' +
      '  pieces.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.index - b.index));\n' +
      '  const query = pieces.length ? \'?\' + pieces.map((p) => p.piece).join(\'&\') : \'\';\n' +
      '  return scheme + \'://\' + host + upper(\'/\' + segments.join(\'/\') + query);\n' +
      '}\n',
    hint: 'One regular expression can cut the URL into scheme, host, path, query and fragment. Normalise each piece separately, and give the sort an explicit index tie-break.',
    explanation:
      'Canonicalisation is a pipeline of small, independent rewrites; the difficulty is knowing which parts of a URL are case-insensitive or redundant and which are not. Scheme and host are case-insensitive, and the default port is implied, so those can be normalised freely. The path and query are case-sensitive and must be left alone except for the hex digits of percent escapes, which are defined to be equivalent in either case. Decoding escapes would be wrong: `%2F` inside a segment is data, while `/` is a separator.\n' +
      '\n' +
      'Split the URL once into its five components. For the path, push segments onto a stack: skip empty and `.` segments, and pop for `..`; popping an empty stack is a no-op, which is what keeps `/../..` from climbing above the root. For the query, remove tracking parameters (they change per campaign but not the page), then sort by key so `?b=2&a=1` and `?a=1&b=2` hit the same cache entry. Sorting whole pieces would also reorder repeated keys such as `tag=b&tag=a`, whose order can be meaningful, so compare keys only and break ties by original index.\n' +
      '\n' +
      'Dropping the fragment is safe because browsers never send it to the server. Total cost is O(n log n) in the number of query pieces, otherwise linear.',
    examples: [
      { input: ['HTTP://Example.COM:80/a/./b/../c/?b=2&a=1#top'], expected: 'http://example.com/a/c?a=1&b=2' },
      { input: ['https://shop.example.com:443'], expected: 'https://shop.example.com/' },
      { input: ['https://x.io/p%2fq?x=%c3%a9&utm_source=mail&tag=b&tag=a&fbclid=123'], expected: 'https://x.io/p%2Fq?tag=b&tag=a&x=%C3%A9' },
    ],
    hiddenTests: [
      { input: ['https://example.com:8443//Docs///API/../Guide/#install'], expected: 'https://example.com:8443/Docs/Guide' },
      { input: ['http://example.com:443/../../a?z&y=1&z=0&&'], expected: 'http://example.com:443/a?y=1&z&z=0' },
      { input: ['ftp://example.com/file.txt'], expected: null },
      { input: ['https://example.com/?utm_campaign=x&gclid=9#frag?not=query'], expected: 'https://example.com/' },
      { input: ['https://EXAMPLE.com?Utm_source=keep&b=%7e&autm_x=1&a=%4A%4b'], expected: 'https://example.com/?Utm_source=keep&a=%4A%4B&autm_x=1&b=%7E' },
      { input: ['example.com/path?x=1'], expected: null },
    ],
  },
  {
    id: 'node-upload-body-size-gate',
    number: 64,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Upload Body Size Gate',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A photo-printing service must stop oversized uploads early instead of buffering them. Implement `checkBody(headers, chunkSizes, limit)`, which replays one request body arriving in chunks.\n' +
      '\n' +
      '- `limit` is a size string: a number (digits, optionally with a decimal part) followed by an optional unit `b`, `kb`, `mb` or `gb` in any letter case; no unit means bytes. Units are powers of 1024. The limit in bytes is `Math.floor(number * unit)`. Limits in the tests are always well formed.\n' +
      '- `headers` has lowercase keys. `chunkSizes` lists the byte length of each body chunk in arrival order.\n' +
      '\n' +
      'Decide in this order:\n' +
      '1. If there is a `content-length` header that is not digits only: `{ status: 400, error: \'bad content-length\' }`.\n' +
      '2. If the declared length is greater than the limit, reject before reading anything: `{ status: 413, read: 0 }`.\n' +
      '3. Read the chunks one at a time, keeping a running total. As soon as the total EXCEEDS the limit, stop: `{ status: 413, read: <total so far, including the chunk that crossed the limit> }`. A body exactly at the limit is fine.\n' +
      '4. After the last chunk, if a length was declared and the total differs from it: `{ status: 400, error: \'length mismatch\' }`.\n' +
      '5. Otherwise `{ status: 200, bytes: <total> }`.',
    functionName: 'checkBody',
    functionSignature: 'function checkBody(headers, chunkSizes, limit)',
    buggyCode:
      'function checkBody(headers, chunkSizes, limit) {\n' +
      '  // TODO: turn the limit string into bytes (1024-based units), check content-length,\n' +
      '  // then add up chunks and stop with 413 as soon as the running total exceeds the limit\n' +
      '  return { status: 200, bytes: 0 };\n' +
      '}\n',
    solution:
      'function checkBody(headers, chunkSizes, limit) {\n' +
      '  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };\n' +
      '  const m = /^(\\d+(?:\\.\\d+)?)(b|kb|mb|gb)?$/.exec(limit.trim().toLowerCase());\n' +
      '  const max = Math.floor(Number(m[1]) * units[m[2] || \'b\']);\n' +
      '  let declared = null;\n' +
      '  if (Object.prototype.hasOwnProperty.call(headers, \'content-length\')) {\n' +
      '    if (!/^\\d+$/.test(headers[\'content-length\'])) return { status: 400, error: \'bad content-length\' };\n' +
      '    declared = Number(headers[\'content-length\']);\n' +
      '    if (declared > max) return { status: 413, read: 0 };\n' +
      '  }\n' +
      '  let total = 0;\n' +
      '  for (const size of chunkSizes) {\n' +
      '    total += size;\n' +
      '    if (total > max) return { status: 413, read: total };\n' +
      '  }\n' +
      '  if (declared !== null && total !== declared) return { status: 400, error: \'length mismatch\' };\n' +
      '  return { status: 200, bytes: total };\n' +
      '}\n',
    hint: 'There are two separate 413 checks: one on the declared length before reading, and one on the running total inside the loop, because a client can lie about (or omit) Content-Length.',
    explanation:
      'Body limits protect memory, and they only work if they are enforced while the data is arriving. Trusting `Content-Length` alone is not enough: the header is optional (chunked uploads have none) and a hostile client can simply understate it. So there are two gates. The declared length lets you reject an honest oversized upload immediately, before reading a byte. The running total catches everything else, and the check sits inside the loop so reading stops at the first chunk that crosses the line rather than after the whole body has been buffered.\n' +
      '\n' +
      'Parse the limit once with a pattern that captures the number and the unit, lowercase it first, and multiply by a power of 1024 (`kb` in server configuration conventionally means 1024 bytes). The comparison is strictly greater-than: a body of exactly the limit is allowed.\n' +
      '\n' +
      'Only when the body fits do you compare the total with the declared length; a mismatch means a truncated or padded request and is a 400, not a 413. Cost is O(number of chunks).',
    examples: [
      { input: [{ 'content-length': '11' }, [5, 6], '1kb'], expected: { status: 200, bytes: 11 } },
      { input: [{ 'content-length': '2048' }, [1024, 1024], '1kb'], expected: { status: 413, read: 0 } },
      { input: [{}, [600, 600, 600], '1kb'], expected: { status: 413, read: 1200 } },
    ],
    hiddenTests: [
      { input: [{}, [512, 512], '1KB'], expected: { status: 200, bytes: 1024 } },
      { input: [{ 'content-length': '10' }, [4, 4], '100'], expected: { status: 400, error: 'length mismatch' } },
      { input: [{ 'content-length': '12abc' }, [12], '1mb'], expected: { status: 400, error: 'bad content-length' } },
      { input: [{ 'content-length': '100' }, [1572864, 1, 50], '1.5mb'], expected: { status: 413, read: 1572865 } },
      { input: [{}, [], '0'], expected: { status: 200, bytes: 0 } },
      { input: [{ 'content-length': '1536' }, [1000, 536], '1.5kb'], expected: { status: 200, bytes: 1536 } },
    ],
  },
  {
    id: 'node-form-multipart-splitter',
    number: 65,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Form Multipart Splitter',
    difficulty: 'Hard',
    topic: 'Data & Streams',
    statement:
      'A travel-journal app receives form posts with attachments as `multipart/form-data`. Implement `parseMultipart(body, boundary)` that splits the body text into its parts. Line breaks in the format are always `\\r\\n` (CRLF).\n' +
      '\n' +
      'Format:\n' +
      '- A delimiter is the text `--` + `boundary` located at the very start of the body or immediately after a CRLF. The delimiter that ends the body is followed directly by `--`.\n' +
      '- Text before the first delimiter (preamble) and after the closing delimiter (epilogue) is ignored.\n' +
      '- Between two delimiters sits one part: a CRLF, then zero or more header lines each ending in CRLF, then an empty line, then the content. The content runs up to, but not including, the CRLF that precedes the next delimiter. Only the FIRST empty line separates headers from content; the content itself may contain empty lines, lone `\\n` characters, leading or trailing spaces and text starting with `--`. Keep it exactly.\n' +
      '- A header line is `Name: value`, split at its first `:`. Header names are case-insensitive; trim the value.\n' +
      '- `Content-Disposition` carries `; name="..."` and optionally `; filename="..."`, in either order. The quoted values contain no `"`. Note that `filename="..."` must not be mistaken for `name="..."`.\n' +
      '- `Content-Type` is optional.\n' +
      '\n' +
      'Return an array with one `{ name, filename, contentType, content }` per part in order; `filename` and `contentType` are `null` when absent.\n' +
      '\n' +
      'Return `null` when the body is malformed: there is no delimiter, the closing delimiter is missing (a truncated upload), a part has no empty line ending its headers, or a part has no `name`.\n' +
      '\n' +
      'In the tests a delimiter never occurs inside content, the closing delimiter is always the last delimiter, and every non-closing delimiter is followed directly by CRLF.',
    functionName: 'parseMultipart',
    functionSignature: 'function parseMultipart(body, boundary)',
    buggyCode:
      'function parseMultipart(body, boundary) {\n' +
      '  // TODO: cut the body at each CRLF + "--" + boundary, require the closing "--",\n' +
      '  // split every part at its first empty line, read name / filename / Content-Type\n' +
      '  return [];\n' +
      '}\n',
    solution:
      'function parseMultipart(body, boundary) {\n' +
      '  const pieces = (\'\\r\\n\' + body).split(\'\\r\\n--\' + boundary);\n' +
      '  if (pieces.length < 2 || !pieces[pieces.length - 1].startsWith(\'--\')) return null;\n' +
      '  const parts = [];\n' +
      '  for (const piece of pieces.slice(1, -1)) {\n' +
      '    const gap = piece.indexOf(\'\\r\\n\\r\\n\');\n' +
      '    if (!piece.startsWith(\'\\r\\n\') || gap === -1) return null;\n' +
      '    const part = { name: null, filename: null, contentType: null, content: piece.slice(gap + 4) };\n' +
      '    for (const line of piece.slice(2, Math.max(gap, 2)).split(\'\\r\\n\')) {\n' +
      '      const colon = line.indexOf(\':\');\n' +
      '      if (colon === -1) continue;\n' +
      '      const header = line.slice(0, colon).trim().toLowerCase();\n' +
      '      const value = line.slice(colon + 1).trim();\n' +
      '      if (header === \'content-type\') part.contentType = value;\n' +
      '      if (header === \'content-disposition\') {\n' +
      '        const name = /;\\s*name="([^"]*)"/i.exec(value);\n' +
      '        const filename = /;\\s*filename="([^"]*)"/i.exec(value);\n' +
      '        if (name) part.name = name[1];\n' +
      '        if (filename) part.filename = filename[1];\n' +
      '      }\n' +
      '    }\n' +
      '    if (part.name === null) return null;\n' +
      '    parts.push(part);\n' +
      '  }\n' +
      '  return parts;\n' +
      '}\n',
    hint: 'Prefix the body with one CRLF so that every delimiter, including the first, looks like `\\r\\n--boundary`; then a single split gives you preamble, parts and the closing piece.',
    explanation:
      'Multipart is a framing format: a marker line separates opaque chunks, and each chunk has its own small header block. The parsing mistakes are all about boundaries between layers. Splitting the whole body on blank lines destroys content that contains blank lines; trimming content corrupts files; and searching for `--boundary` without the preceding line break matches text inside a part.\n' +
      '\n' +
      'The CRLF before a delimiter belongs to the delimiter, not to the content. Putting an artificial CRLF in front of the body makes the first delimiter look like all the others, so `split(\'\\r\\n--\' + boundary)` yields: the preamble, one piece per part, and a final piece that must start with `--` (if it does not, the upload was cut short and nothing should be trusted). Each part piece starts with the CRLF that ended the delimiter line; the first `\\r\\n\\r\\n` in it ends the headers, and everything after is content, verbatim.\n' +
      '\n' +
      'Headers are split at the first colon and compared case-insensitively. Extract `name` with a pattern anchored on the preceding `;` so that the `name=` inside `filename=` cannot match. The whole parse is linear in the body size.',
    examples: [
      { input: [MP_SIMPLE, 'XyZ'], expected: [{ name: 'title', filename: null, contentType: null, content: 'Trip notes' }, { name: 'doc', filename: 'notes.txt', contentType: 'text/plain', content: 'Day 1\r\n\r\nDay 2' }] },
      { input: [MP_TRUNCATED, 'XyZ'], expected: null },
    ],
    hiddenTests: [
      { input: [MP_TRICKY, 'b7'], expected: [{ name: 'sheet', filename: 'name=\'x\'.csv', contentType: 'text/csv', content: 'id,note\r\n1,--b7 inline\r\n--not-a-boundary\r\n' }, { name: 'empty', filename: null, contentType: null, content: '' }, { name: 'padded', filename: null, contentType: null, content: '  keep my spaces  ' }] },
      { input: [MP_NAMELESS, 'XyZ'], expected: null },
      { input: [MP_NO_HEADERS, 'XyZ'], expected: null },
      { input: [MP_LF_INSIDE, 'XyZ'], expected: [{ name: 'poem', filename: null, contentType: null, content: 'roses\nviolets\n\n--XyZ\r\nend' }] },
      { input: ['--XyZ--', 'XyZ'], expected: [] },
      { input: ['just some text with no parts', 'XyZ'], expected: null },
    ],
  },
  {
    id: 'node-redirect-chain-tracer',
    number: 66,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Redirect Chain Tracer',
    difficulty: 'Hard',
    topic: 'HTTP & Routing',
    statement:
      'A link checker follows redirects the way a browser would, against a recorded table of responses instead of the network. Implement `followRedirects(start, responses, maxHops)`.\n' +
      '\n' +
      '`start` is `{ method, url }`. `responses` maps an absolute URL (exact string match, query included) to `{ status, location? }`. Every URL has a path starting with `/`.\n' +
      '\n' +
      'Keep a `chain` of the URLs requested so far, beginning with `start.url`, and repeat:\n' +
      '1. If the current URL is not in `responses`: return `{ ok: false, error: \'unreachable\', chain }`.\n' +
      '2. The response is a redirect only when its status is 301, 302, 303, 307 or 308 AND it has a `location` string. Anything else is final: return `{ ok: true, status, method, url, chain }` with the current method and URL.\n' +
      '3. If `maxHops` redirects have already been followed: return `{ ok: false, error: \'too many redirects\', chain }`.\n' +
      '4. Resolve `location` against the current URL:\n' +
      '   - starting with `http://` or `https://`: use it as is;\n' +
      '   - starting with `/`: the current origin (`scheme://host[:port]`) followed by it;\n' +
      '   - otherwise it is relative: take the current URL without its query, keep everything up to and including the last `/` of its path, and append `location`. (No `.` or `..` handling is needed.)\n' +
      '5. If the resolved URL is already in `chain`: return `{ ok: false, error: \'loop\', chain }` (the chain does not include the repeated URL a second time).\n' +
      '6. Update the method: a 303 turns every method except `HEAD` into `GET`; a 301 or 302 turns `POST` into `GET` and leaves other methods alone; 307 and 308 never change the method.\n' +
      '7. Append the resolved URL to `chain` and continue from step 1.',
    functionName: 'followRedirects',
    functionSignature: 'function followRedirects(start, responses, maxHops)',
    buggyCode:
      'function followRedirects(start, responses, maxHops) {\n' +
      '  // TODO: loop: look the URL up, stop on a final response, enforce maxHops,\n' +
      '  // resolve absolute / root-relative / relative locations, detect loops,\n' +
      '  // and apply the 301/302/303 method rewrite rules\n' +
      '  return { ok: true, status: 200, method: start.method, url: start.url, chain: [start.url] };\n' +
      '}\n',
    solution:
      'function followRedirects(start, responses, maxHops) {\n' +
      '  let method = start.method;\n' +
      '  let url = start.url;\n' +
      '  const chain = [url];\n' +
      '  for (;;) {\n' +
      '    if (!Object.prototype.hasOwnProperty.call(responses, url)) return { ok: false, error: \'unreachable\', chain };\n' +
      '    const res = responses[url];\n' +
      '    const redirect = [301, 302, 303, 307, 308].includes(res.status) && typeof res.location === \'string\';\n' +
      '    if (!redirect) return { ok: true, status: res.status, method, url, chain };\n' +
      '    if (chain.length > maxHops) return { ok: false, error: \'too many redirects\', chain };\n' +
      '    const m = /^(https?:\\/\\/[^\\/?#]+)([^?#]*)/.exec(url);\n' +
      '    let next;\n' +
      '    if (/^https?:\\/\\//.test(res.location)) next = res.location;\n' +
      '    else if (res.location.startsWith(\'/\')) next = m[1] + res.location;\n' +
      '    else next = m[1] + m[2].slice(0, m[2].lastIndexOf(\'/\') + 1) + res.location;\n' +
      '    if (chain.includes(next)) return { ok: false, error: \'loop\', chain };\n' +
      '    if (res.status === 303 && method !== \'HEAD\') method = \'GET\';\n' +
      '    else if ((res.status === 301 || res.status === 302) && method === \'POST\') method = \'GET\';\n' +
      '    url = next;\n' +
      '    chain.push(url);\n' +
      '  }\n' +
      '}\n',
    hint: 'The number of redirects followed so far is `chain.length - 1`. Resolve the location before the loop check, because the same target can be spelled absolutely or relatively.',
    explanation:
      'Following redirects is a small state machine whose state is the current method, the current URL and the history. Three things make it subtle.\n' +
      '\n' +
      'Location resolution: a `Location` header may be absolute, root-relative or relative to the current document\'s directory. Split the current URL into origin and path with one pattern; a root-relative location replaces the whole path, while a relative one replaces only what follows the last `/` (and the old query is discarded). Appending a relative location to the full path is the common bug.\n' +
      '\n' +
      'Method rewriting: 303 means "fetch the result with GET"; 301 and 302 historically turn a POST into a GET; 307 and 308 exist precisely to forbid that, so a redirected upload stays a POST. Getting this wrong either re-submits forms or drops request bodies.\n' +
      '\n' +
      'Termination: a hop budget alone would eventually stop a cycle, but reporting it as a loop is far more useful, so keep every visited URL and test membership after resolving. Check the budget before following so that exactly `maxHops` redirects are allowed. Each step is O(chain length), so the whole trace is at most O(maxHops squared), which is tiny.',
    examples: [
      { input: [{ method: 'GET', url: 'http://shop.example.com/cart' }, SITE, 5], expected: { ok: true, status: 200, method: 'GET', url: 'https://shop.example.com/basket?from=cart', chain: ['http://shop.example.com/cart', 'https://shop.example.com/cart', 'https://shop.example.com/basket?from=cart'] } },
      { input: [{ method: 'POST', url: 'https://shop.example.com/orders' }, SITE, 5], expected: { ok: true, status: 201, method: 'GET', url: 'https://pay.example.net/r/77', chain: ['https://shop.example.com/orders', 'https://shop.example.com/orders/latest', 'https://shop.example.com/orders/receipt', 'https://pay.example.net/r/77'] } },
      { input: [{ method: 'GET', url: 'https://shop.example.com/a' }, SITE, 5], expected: { ok: false, error: 'loop', chain: ['https://shop.example.com/a', 'https://shop.example.com/b', 'https://shop.example.com/c'] } },
    ],
    hiddenTests: [
      { input: [{ method: 'POST', url: 'http://shop.example.com/cart' }, SITE, 1], expected: { ok: false, error: 'too many redirects', chain: ['http://shop.example.com/cart', 'https://shop.example.com/cart'] } },
      { input: [{ method: 'POST', url: 'http://shop.example.com/cart' }, SITE, 2], expected: { ok: true, status: 200, method: 'GET', url: 'https://shop.example.com/basket?from=cart', chain: ['http://shop.example.com/cart', 'https://shop.example.com/cart', 'https://shop.example.com/basket?from=cart'] } },
      { input: [{ method: 'DELETE', url: 'https://shop.example.com/old/docs/intro?lang=en' }, SITE, 3], expected: { ok: false, error: 'unreachable', chain: ['https://shop.example.com/old/docs/intro?lang=en', 'https://shop.example.com/old/docs/start', 'https://shop.example.com/gone'] } },
      { input: [{ method: 'POST', url: 'https://shop.example.com/orders/latest' }, SITE, 2], expected: { ok: true, status: 201, method: 'POST', url: 'https://pay.example.net/r/77', chain: ['https://shop.example.com/orders/latest', 'https://shop.example.com/orders/receipt', 'https://pay.example.net/r/77'] } },
      { input: [{ method: 'HEAD', url: 'https://shop.example.com/orders' }, SITE, 5], expected: { ok: true, status: 201, method: 'HEAD', url: 'https://pay.example.net/r/77', chain: ['https://shop.example.com/orders', 'https://shop.example.com/orders/latest', 'https://shop.example.com/orders/receipt', 'https://pay.example.net/r/77'] } },
      { input: [{ method: 'PUT', url: 'https://shop.example.com/moved' }, SITE, 1], expected: { ok: true, status: 302, method: 'PUT', url: 'https://shop.example.com/teapot', chain: ['https://shop.example.com/moved', 'https://shop.example.com/teapot'] } },
    ],
  },
  {
    id: 'node-api-version-resolver',
    number: 67,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'API Version Resolver',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'A logistics API serves several versions at once, and clients can pick one in the URL, in a header or in the query string. Implement `resolveVersion(req, config)`.\n' +
      '\n' +
      '`req` is `{ path, headers, query }` (header names are lowercase; header and query values are strings). `config` is `{ supported, default, deprecated, sunset }`: `supported` and `deprecated` are arrays of version numbers, `default` is a number, and `sunset` maps a version (as a string key) to a date string.\n' +
      '\n' +
      'Exactly ONE source decides, the first of these that is present:\n' +
      '1. `path`: split `req.path` on `/`, ignoring empty segments; the first segment is `v` followed only by digits (`v2`, not `v2beta` and not `videos`). The routed path then becomes `/` + the remaining segments joined with `/` (just `/` when none remain).\n' +
      '2. `header`: `req.headers` has `x-api-version`.\n' +
      '3. `query`: `req.query` has `api_version`.\n' +
      '4. `default`: none of the above; the version is `config.default`.\n' +
      '\n' +
      'For the first three, trim the raw text; it must be an optional `v` followed by digits only. If it is not, return `{ status: 400, error: \'invalid version\' }`; do NOT fall through to a lower-priority source.\n' +
      '\n' +
      'If the version is not in `config.supported`, return `{ status: 404, error: \'unsupported version\', supported: config.supported }`.\n' +
      '\n' +
      'Otherwise return `{ status: 200, version, source, path, headers }` where `version` is a number, `source` is `\'path\'`, `\'header\'`, `\'query\'` or `\'default\'`, `path` is the routed path (the original `req.path`, unchanged, unless the source is `path`), and `headers` contains:\n' +
      '- `X-API-Version`: the version as a string, always;\n' +
      '- `Deprecation: \'true\'` when the version is in `config.deprecated`;\n' +
      '- `Sunset: <date>` when `config.sunset` has an entry for the version.',
    functionName: 'resolveVersion',
    functionSignature: 'function resolveVersion(req, config)',
    buggyCode:
      'function resolveVersion(req, config) {\n' +
      '  // TODO: path prefix, then x-api-version header, then api_version query, then default;\n' +
      '  // 400 for a malformed value, 404 for an unsupported one,\n' +
      '  // and add X-API-Version / Deprecation / Sunset headers on success\n' +
      '  return { status: 200, version: config.default, source: \'default\', path: req.path, headers: {} };\n' +
      '}\n',
    solution:
      'function resolveVersion(req, config) {\n' +
      '  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);\n' +
      '  const segments = req.path.split(\'/\').filter(Boolean);\n' +
      '  let source = \'default\';\n' +
      '  let raw = null;\n' +
      '  let path = req.path;\n' +
      '  if (segments.length && /^v\\d+$/.test(segments[0])) {\n' +
      '    source = \'path\';\n' +
      '    raw = segments[0];\n' +
      '    path = \'/\' + segments.slice(1).join(\'/\');\n' +
      '  } else if (has(req.headers, \'x-api-version\')) {\n' +
      '    source = \'header\';\n' +
      '    raw = req.headers[\'x-api-version\'];\n' +
      '  } else if (has(req.query, \'api_version\')) {\n' +
      '    source = \'query\';\n' +
      '    raw = req.query.api_version;\n' +
      '  }\n' +
      '  let version = config.default;\n' +
      '  if (raw !== null) {\n' +
      '    const m = /^v?(\\d+)$/.exec(raw.trim());\n' +
      '    if (!m) return { status: 400, error: \'invalid version\' };\n' +
      '    version = Number(m[1]);\n' +
      '  }\n' +
      '  if (!config.supported.includes(version)) {\n' +
      '    return { status: 404, error: \'unsupported version\', supported: config.supported };\n' +
      '  }\n' +
      '  const headers = { \'X-API-Version\': String(version) };\n' +
      '  if (config.deprecated.includes(version)) headers.Deprecation = \'true\';\n' +
      '  if (has(config.sunset, String(version))) headers.Sunset = config.sunset[String(version)];\n' +
      '  return { status: 200, version, source, path, headers };\n' +
      '}\n',
    hint: 'First decide WHICH source applies and grab its raw text, without parsing it. Parse and validate afterwards, in one place.',
    explanation:
      'When the same setting can arrive through several channels, the two questions "which channel wins?" and "is its value valid?" must be answered separately. If validation is folded into the selection, a malformed high-priority value silently falls through to a lower-priority one or to the default, and a client that asked for `x-api-version: latest` gets some version it never requested instead of an error.\n' +
      '\n' +
      'So select first: a path prefix is the most explicit and wins, then the header, then the query string. The path test must be anchored (`^v\\d+$`), otherwise `/videos` or `/v2beta` is mistaken for a version; when the path wins, strip the prefix so downstream routing sees `/orders` regardless of how the version was chosen. Then parse the chosen raw value strictly. `parseInt(\'2.1\')` is 2, which is exactly the kind of leniency that makes clients believe an unsupported format works.\n' +
      '\n' +
      'A well-formed but unknown version is a different failure from a malformed one: 404 with the list of supported versions helps the client recover. On success, echo the resolved version and attach `Deprecation` and `Sunset` so clients on an old version are warned on every call. Everything is O(1) apart from splitting the path.',
    examples: [
      { input: [{ path: '/v2/shipments/88', headers: {}, query: {} }, VERSION_CONFIG], expected: { status: 200, version: 2, source: 'path', path: '/shipments/88', headers: { 'X-API-Version': '2', Sunset: 'Thu, 01 Jan 2026 00:00:00 GMT' } } },
      { input: [{ path: '/shipments', headers: { 'x-api-version': 'v1' }, query: { api_version: '4' } }, VERSION_CONFIG], expected: { status: 200, version: 1, source: 'header', path: '/shipments', headers: { 'X-API-Version': '1', Deprecation: 'true', Sunset: 'Sat, 01 Mar 2025 00:00:00 GMT' } } },
      { input: [{ path: '/shipments', headers: { 'x-api-version': 'latest' }, query: { api_version: '4' } }, VERSION_CONFIG], expected: { status: 400, error: 'invalid version' } },
    ],
    hiddenTests: [
      { input: [{ path: '/videos/v2', headers: {}, query: {} }, VERSION_CONFIG], expected: { status: 200, version: 3, source: 'default', path: '/videos/v2', headers: { 'X-API-Version': '3' } } },
      { input: [{ path: '//v4/', headers: { 'x-api-version': '1' }, query: {} }, VERSION_CONFIG], expected: { status: 200, version: 4, source: 'path', path: '/', headers: { 'X-API-Version': '4' } } },
      { input: [{ path: '/v2beta/shipments', headers: {}, query: { api_version: ' 4 ' } }, VERSION_CONFIG], expected: { status: 200, version: 4, source: 'query', path: '/v2beta/shipments', headers: { 'X-API-Version': '4' } } },
      { input: [{ path: '/v9/shipments', headers: { 'x-api-version': '2' }, query: {} }, VERSION_CONFIG], expected: { status: 404, error: 'unsupported version', supported: [1, 2, 3, 4] } },
      { input: [{ path: '/shipments', headers: { 'x-api-version': '2.1' }, query: {} }, VERSION_CONFIG], expected: { status: 400, error: 'invalid version' } },
      { input: [{ path: '/depots/7', headers: { accept: 'application/json' }, query: { api_version: 'v2', page: '3' } }, VERSION_CONFIG], expected: { status: 200, version: 2, source: 'query', path: '/depots/7', headers: { 'X-API-Version': '2', Sunset: 'Thu, 01 Jan 2026 00:00:00 GMT' } } },
    ],
  },
  {
    id: 'node-access-log-redactor',
    number: 68,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Access Log Redactor',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A payments gateway writes request details to its access log, and nothing secret or forgeable may reach disk. Implement `sanitizeLogLine(line, maxLen)` applying these steps IN THIS ORDER, each to the output of the previous one:\n' +
      '\n' +
      '1. Control characters. Replace every line feed (code 10) with the two characters `\\n` (a backslash and an `n`) and every carriage return (code 13) with `\\r`, so one event can never look like two log lines. Replace every other character with code below 32, and code 127, with `?`.\n' +
      '2. Bearer tokens. Wherever the word `bearer` (any letter case, starting at a word boundary) is followed by exactly one space and a run of non-whitespace characters, replace that run with `[REDACTED]`. Keep the word as it was written.\n' +
      '3. Secret fields. In every `key=value` where the key (the longest run of letters, digits and underscores right before the `=`) ENDS WITH one of `password`, `passwd`, `secret`, `token`, `api_key`, `authorization` (any letter case), replace the value with `[REDACTED]`. The value is the possibly empty run of characters after the `=` up to the next whitespace character or `&`. Keep the key as written.\n' +
      '4. Card numbers. Every maximal run of digits that is 13 to 19 digits long keeps its last 4 digits; each of its other digits becomes `*`. Shorter and longer runs are left alone.\n' +
      '5. Emails. For every match of `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}`, keep the first character of the part before `@`, replace the rest of that part with `***`, and keep `@` and the domain.\n' +
      '6. Length. If the result is longer than `maxLen` characters, keep the first `maxLen` and append `...(+N)`, where `N` is the number of characters cut off.\n' +
      '\n' +
      'Return the final string.',
    functionName: 'sanitizeLogLine',
    functionSignature: 'function sanitizeLogLine(line, maxLen)',
    buggyCode:
      'function sanitizeLogLine(line, maxLen) {\n' +
      '  // TODO, in order: escape control characters, redact Bearer tokens,\n' +
      '  // redact secret key=value fields, mask 13-19 digit runs, mask emails, truncate\n' +
      '  return line;\n' +
      '}\n',
    solution:
      'function sanitizeLogLine(line, maxLen) {\n' +
      '  let out = \'\';\n' +
      '  for (let i = 0; i < line.length; i++) {\n' +
      '    const code = line.charCodeAt(i);\n' +
      '    if (code === 10) out += \'\\\\n\';\n' +
      '    else if (code === 13) out += \'\\\\r\';\n' +
      '    else if (code < 32 || code === 127) out += \'?\';\n' +
      '    else out += line[i];\n' +
      '  }\n' +
      '  out = out.replace(/\\b(bearer) \\S+/gi, \'$1 [REDACTED]\');\n' +
      '  out = out.replace(/([A-Za-z0-9_]*(?:password|passwd|secret|token|api_key|authorization))=[^\\s&]*/gi, \'$1=[REDACTED]\');\n' +
      '  out = out.replace(/\\d+/g, (run) => (run.length >= 13 && run.length <= 19 ? \'*\'.repeat(run.length - 4) + run.slice(-4) : run));\n' +
      '  out = out.replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})/g, \'$1***@$2\');\n' +
      '  if (out.length > maxLen) out = out.slice(0, maxLen) + \'...(+\' + (out.length - maxLen) + \')\';\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Each step is one `replace` with a global regular expression (step 1 is easiest as a character loop). For the card step, match every digit run and decide by its length inside a replacer function.',
    explanation:
      'Log sanitising is a chain of rewrites, and the order is part of the design. Control characters go first: a raw newline in a logged value lets an attacker forge a complete fake log entry, and escaping it up front also means later patterns never have to think about line breaks.\n' +
      '\n' +
      'The Bearer rule runs before the key rule for a concrete reason. In `authorization=Bearer abc123` the key rule alone would see the value `Bearer` (values stop at whitespace), redact that word, and leave the actual token `abc123` in the log. Redacting the token first closes the gap. Matching keys by suffix catches `access_token` and `DB_PASSWORD` without listing every variant, while `tokenizer=bpe` is left alone because the key must END with a sensitive name.\n' +
      '\n' +
      'For card numbers, match every digit run with `\\d+` and choose by length in a replacer function; a pattern like `\\d{13,19}` on its own would also match the first 19 digits of a longer run. Truncation is last so that a secret can never survive by straddling the cut, and reporting the number of dropped characters keeps the log honest. Each step is linear in the line length.',
    examples: [
      { input: ['GET /login user=ana password=hunter2 ip=10.0.0.9', 200], expected: 'GET /login user=ana password=[REDACTED] ip=10.0.0.9' },
      { input: ['paid card 4111111111111111 by ana.lopez@example.com', 200], expected: 'paid card ************1111 by a***@example.com' },
      { input: ['note=ok\nINFO forged entry', 200], expected: 'note=ok\\nINFO forged entry' },
    ],
    hiddenTests: [
      { input: ['authorization=Bearer abc123 next=1; Authorization: BEARER eyJhbGci.x-9 trace=9f', 200], expected: 'authorization=[REDACTED] [REDACTED] next=1; Authorization: BEARER [REDACTED] trace=9f' },
      { input: ['POST /cb?access_token=abc&state=xyz&API_KEY=k1&tokenizer=bpe&secret=&n=1', 200], expected: 'POST /cb?access_token=[REDACTED]&state=xyz&API_KEY=[REDACTED]&tokenizer=bpe&secret=[REDACTED]&n=1' },
      { input: ['order 123456789012 imei 12345678901234567890 amex 371449635398431\ttab\x7f', 200], expected: 'order 123456789012 imei 12345678901234567890 amex ***********8431?tab?' },
      { input: ['user bob@site.io requested an export of everything in the account', 20], expected: 'user b***@site.io re...(+46)' },
      { input: ['DB_PASSWORD=p@ss w0rd token=a\r\nb', 34], expected: 'DB_PASSWORD=[REDACTED] w0rd token=...(+10)' },
      { input: ['forbearer xyz; bearer  two-spaces; mail to=Jo.Smith+tag@mail.example.co.uk.', 67], expected: 'forbearer xyz; bearer  two-spaces; mail to=J***@mail.example.co.uk.' },
    ],
  },
  {
    id: 'node-dotenv-text-loader',
    number: 69,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Dotenv Text Loader',
    difficulty: 'Hard',
    topic: 'Config & Validation',
    statement:
      'A deployment tool reads `.env` files itself. Implement `parseDotenv(text)` returning `{ values, errors }`: `values` maps each key to its string value, and `errors` lists the 1-based numbers of the lines that could not be parsed, in ascending order.\n' +
      '\n' +
      'Split the text on `\\n` and handle each line on its own (values never span lines):\n' +
      '- Trim the line (this also removes a trailing `\\r`). Then remove one leading `export` followed by whitespace, if present.\n' +
      '- Skip the line if it is now empty or starts with `#`.\n' +
      '- Split at the FIRST `=`. The key is the text before it, trimmed, and must match `^[A-Za-z_][A-Za-z0-9_]*$`. A line with no `=` or a bad key is an error.\n' +
      '- The raw value is the text after that `=`, trimmed. Its first character decides how it is read:\n' +
      '  - `\'` (single-quoted): the value is everything up to the next `\'`, taken literally (no escapes, no interpolation). No closing `\'` is an error.\n' +
      '  - `"` (double-quoted): read up to the next unescaped `"`. Inside, a backslash combines with the following character: `\\n` becomes a line feed, and any other escaped character stands for itself (`\\"` is a quote, `\\\\` is a backslash). After decoding the escapes, apply interpolation. No closing `"` is an error.\n' +
      '  - anything else (unquoted): a `#` that is the first character of the raw value or is preceded by whitespace starts a comment; remove it and everything after it, trim, then apply interpolation.\n' +
      '  - Whatever follows the closing quote of a quoted value is ignored.\n' +
      '- Interpolation replaces every `${NAME}` (NAME shaped like a key) with the value that NAME has AT THAT POINT in the file, that is, from an earlier line. A name not defined yet becomes the empty string.\n' +
      '- A key assigned more than once keeps its last value. An error line assigns nothing.',
    functionName: 'parseDotenv',
    functionSignature: 'function parseDotenv(text)',
    buggyCode:
      'function parseDotenv(text) {\n' +
      '  // TODO: per line: skip blanks and comments, strip "export", split at the first =,\n' +
      '  // read single-quoted / double-quoted / unquoted values, interpolate ${NAME}\n' +
      '  // from earlier lines, and record the 1-based numbers of bad lines\n' +
      '  return { values: {}, errors: [] };\n' +
      '}\n',
    solution:
      'function parseDotenv(text) {\n' +
      '  const values = {};\n' +
      '  const errors = [];\n' +
      '  const interpolate = (s) =>\n' +
      '    s.replace(/\\$\\{([A-Za-z_][A-Za-z0-9_]*)\\}/g, (whole, name) =>\n' +
      '      Object.prototype.hasOwnProperty.call(values, name) ? values[name] : \'\'\n' +
      '    );\n' +
      '  const lines = text.split(\'\\n\');\n' +
      '  for (let i = 0; i < lines.length; i++) {\n' +
      '    const line = lines[i].trim().replace(/^export\\s+/, \'\');\n' +
      '    if (line === \'\' || line.startsWith(\'#\')) continue;\n' +
      '    const eq = line.indexOf(\'=\');\n' +
      '    const key = eq === -1 ? \'\' : line.slice(0, eq).trim();\n' +
      '    const raw = line.slice(eq + 1).trim();\n' +
      '    let value = null;\n' +
      '    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {\n' +
      '      value = null;\n' +
      '    } else if (raw.startsWith("\'")) {\n' +
      '      const end = raw.indexOf("\'", 1);\n' +
      '      if (end !== -1) value = raw.slice(1, end);\n' +
      '    } else if (raw.startsWith(\'"\')) {\n' +
      '      let out = \'\';\n' +
      '      for (let j = 1; j < raw.length && value === null; j++) {\n' +
      '        if (raw[j] === \'\\\\\' && j + 1 < raw.length) {\n' +
      '          j++;\n' +
      '          out += raw[j] === \'n\' ? \'\\n\' : raw[j];\n' +
      '        } else if (raw[j] === \'"\') {\n' +
      '          value = interpolate(out);\n' +
      '        } else {\n' +
      '          out += raw[j];\n' +
      '        }\n' +
      '      }\n' +
      '    } else {\n' +
      '      const hash = raw.search(/(^|\\s)#/);\n' +
      '      value = interpolate((hash === -1 ? raw : raw.slice(0, hash)).trim());\n' +
      '    }\n' +
      '    if (value === null) errors.push(i + 1);\n' +
      '    else values[key] = value;\n' +
      '  }\n' +
      '  return { values, errors };\n' +
      '}\n',
    hint: 'Interpolate while you go, reading from the same `values` object you are filling; that gives "earlier lines only" for free. Branch on the first character of the trimmed raw value.',
    explanation:
      'A `.env` file looks like `KEY=value` lines, but a faithful loader is a tiny language implementation with three quoting modes, and most bugs come from applying one mode\'s rules to another.\n' +
      '\n' +
      'Single quotes mean "exactly this text": no escapes and no `${...}` expansion, which is how you store a literal dollar sign or hash. Double quotes allow escapes and expansion, so the closing quote has to be found by scanning and skipping escaped characters; searching for the next quote character would stop at an escaped quote. Unquoted values are the only place a comment can start, and only at a `#` that begins the value or follows whitespace, so `http://x.io/#top` survives. Splitting at the first `=` keeps values like `a=b=c` intact.\n' +
      '\n' +
      'Interpolation is resolved in file order against the values collected so far. That makes the result independent of any later line, and it makes self-reference such as `PATH=${PATH}:/opt/bin` well defined. Collecting error line numbers instead of throwing lets the tool report every bad line in one run. The parse is linear in the size of the text.',
    examples: [
      { input: ['PORT=3000\nHOST=localhost\n'], expected: { values: { PORT: '3000', HOST: 'localhost' }, errors: [] } },
      { input: ['# database\nexport DB_USER=ana\nDB_URL="postgres://${DB_USER}@db/${DB_NAME}"\nDB_NAME=shop'], expected: { values: { DB_USER: 'ana', DB_URL: 'postgres://ana@db/', DB_NAME: 'shop' }, errors: [] } },
      { input: ['TAG=v1 # release tag\nURL=http://x.io/#top\nGREETING=\'hi ${TAG} # kept\'\n9LIVES=cat'], expected: { values: { TAG: 'v1', URL: 'http://x.io/#top', GREETING: 'hi ${TAG} # kept' }, errors: [4] } },
    ],
    hiddenTests: [
      { input: ['MOTD="line1\\nline2 \\"q\\" \\\\ end" # note\nCOPY=${MOTD}!'], expected: { values: { MOTD: 'line1\nline2 "q" \\ end', COPY: 'line1\nline2 "q" \\ end!' }, errors: [] } },
      { input: ['1BAD=x\nNOEQUALS\nGOOD=1\nOPEN="abc\n =x\nGOOD=2\nSQ=\'open'], expected: { values: { GOOD: '2' }, errors: [1, 2, 4, 5, 7] } },
      { input: ['A=1\r\nB= spaced out \r\n\r\nC=\r\nD=${A}${B}${C}|\r\n'], expected: { values: { A: '1', B: 'spaced out', C: '', D: '1spaced out|' }, errors: [] } },
      { input: ['  export   KEY = value  \nPATHS=${KEY}/bin:${MISSING}/lib\nKEY=other\nLATER="${KEY}" trailing junk\nKEY=${KEY}-x'], expected: { values: { KEY: 'other-x', PATHS: 'value/bin:/lib', LATER: 'other' }, errors: [] } },
      { input: ['A="x" # trailing\nB=\'y\'z\nC=a=b=c\nD=#only comment\nE=tab\t# c\nF="has # hash"'], expected: { values: { A: 'x', B: 'y', C: 'a=b=c', D: '', E: 'tab', F: 'has # hash' }, errors: [] } },
      { input: [''], expected: { values: {}, errors: [] } },
    ],
  },
  {
    id: 'node-database-url-reader',
    number: 70,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Database URL Reader',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement:
      'A service receives its database settings as one connection URL such as `postgres://ana:s3cret@db.internal:6543/shop?sslmode=require`, and must validate it at start-up. Implement `parseDatabaseUrl(url)`.\n' +
      '\n' +
      'Shape: `scheme://authority/database?options`. The scheme is a letter followed by letters, digits, `+`, `.` or `-`. The authority (possibly empty) runs to the first `/` or `?`. The path and the `?options` part are optional. A URL that does not have this shape, or that contains `#`, fails with `invalid url`.\n' +
      '\n' +
      'Check in this order and return `{ ok: false, error }` with the FIRST error that applies:\n' +
      '1. `invalid url`: as above.\n' +
      '2. `unsupported driver`: the lowercased scheme must be `postgres` or `postgresql` (both give driver `postgres`, default port 5432) or `mysql` (default port 3306).\n' +
      '3. `missing host`: within the authority, everything before the LAST `@` is the user info (absent when there is no `@`). The rest is `host` or `host:port`, split at its last `:`. The host is lowercased and must not be empty.\n' +
      '4. `invalid port`: a port, when present, must be digits only and between 1 and 65535.\n' +
      '5. `missing database`: the path without its leading `/`, percent-decoded, must not be empty.\n' +
      '\n' +
      'On success return `{ ok: true, config, display }`:\n' +
      '- `config` is `{ driver, host, port, user, password, database, options }`. `port` is a number (the default when none was given).\n' +
      '- User info splits at its FIRST `:` into user and password, each percent-decoded with `decodeURIComponent`. Without user info both are `null`; with a user but no `:`, `password` is `null`.\n' +
      '- `options` comes from the query: split on `&`, skip empty pieces, split each at its first `=`, decode key and value; a piece without `=` has value `\'\'`. A repeated key keeps its last value.\n' +
      '- `display` is a version that is safe to log: `driver://` + auth + `host:port/database`, where auth is empty without a user, `user@` without a password, and `user:***@` with one. Use the decoded user and database, and always include the port.',
    functionName: 'parseDatabaseUrl',
    functionSignature: 'function parseDatabaseUrl(url)',
    buggyCode:
      'function parseDatabaseUrl(url) {\n' +
      '  // TODO: split scheme / user info / host / port / database / options,\n' +
      '  // return the first error in the stated order, apply default ports,\n' +
      '  // percent-decode credentials, and build a display string that hides the password\n' +
      '  return { ok: false, error: \'invalid url\' };\n' +
      '}\n',
    solution:
      'function parseDatabaseUrl(url) {\n' +
      '  const fail = (error) => ({ ok: false, error });\n' +
      '  const m = /^([A-Za-z][A-Za-z0-9+.-]*):\\/\\/([^\\/?#]*)(\\/[^?#]*)?(?:\\?([^#]*))?$/.exec(url);\n' +
      '  if (!m) return fail(\'invalid url\');\n' +
      '  const drivers = { postgres: [\'postgres\', 5432], postgresql: [\'postgres\', 5432], mysql: [\'mysql\', 3306] };\n' +
      '  const scheme = m[1].toLowerCase();\n' +
      '  if (!Object.prototype.hasOwnProperty.call(drivers, scheme)) return fail(\'unsupported driver\');\n' +
      '  const driver = drivers[scheme][0];\n' +
      '  let port = drivers[scheme][1];\n' +
      '  const at = m[2].lastIndexOf(\'@\');\n' +
      '  const userinfo = at === -1 ? null : m[2].slice(0, at);\n' +
      '  const hostport = m[2].slice(at + 1);\n' +
      '  const colon = hostport.lastIndexOf(\':\');\n' +
      '  const host = (colon === -1 ? hostport : hostport.slice(0, colon)).toLowerCase();\n' +
      '  if (host === \'\') return fail(\'missing host\');\n' +
      '  if (colon !== -1) {\n' +
      '    const text = hostport.slice(colon + 1);\n' +
      '    if (!/^\\d+$/.test(text) || Number(text) < 1 || Number(text) > 65535) return fail(\'invalid port\');\n' +
      '    port = Number(text);\n' +
      '  }\n' +
      '  const database = decodeURIComponent((m[3] || \'/\').slice(1));\n' +
      '  if (database === \'\') return fail(\'missing database\');\n' +
      '  let user = null;\n' +
      '  let password = null;\n' +
      '  if (userinfo !== null) {\n' +
      '    const split = userinfo.indexOf(\':\');\n' +
      '    user = decodeURIComponent(split === -1 ? userinfo : userinfo.slice(0, split));\n' +
      '    if (split !== -1) password = decodeURIComponent(userinfo.slice(split + 1));\n' +
      '  }\n' +
      '  const options = {};\n' +
      '  for (const piece of (m[4] || \'\').split(\'&\')) {\n' +
      '    if (piece === \'\') continue;\n' +
      '    const eq = piece.indexOf(\'=\');\n' +
      '    const key = decodeURIComponent(eq === -1 ? piece : piece.slice(0, eq));\n' +
      '    options[key] = eq === -1 ? \'\' : decodeURIComponent(piece.slice(eq + 1));\n' +
      '  }\n' +
      '  const auth = user === null ? \'\' : user + (password === null ? \'\' : \':***\') + \'@\';\n' +
      '  const display = driver + \'://\' + auth + host + \':\' + port + \'/\' + database;\n' +
      '  return { ok: true, config: { driver, host, port, user, password, database, options }, display };\n' +
      '}\n',
    hint: 'Split the authority at its LAST `@`, but split the user info at its FIRST `:`. Passwords are the part most likely to contain odd characters.',
    explanation:
      'A connection URL packs six settings into one string, and parsing it by hand teaches where each delimiter binds. The authority is `userinfo@host:port`. Passwords routinely contain `:` and sometimes an unencoded `@`, so the split points are asymmetric: the LAST `@` separates credentials from host, the FIRST `:` inside the credentials separates user from password, and the LAST `:` in the remainder separates host from port. Using `split(\':\')` or the first `@` truncates real passwords.\n' +
      '\n' +
      'Credentials and the database name are percent-encoded in transit (`p%40ss` for `p@ss`), so decode each component after splitting, never before, or a decoded `@` would move the split point. Validate strictly and in a fixed order so that the same bad input always reports the same problem: a port must be all digits and in range, since `parseInt(\'5432abc\')` would happily return 5432.\n' +
      '\n' +
      'Finally, never log the URL itself. Building a separate display string with the password replaced by `***` gives operators something safe to print at start-up. The whole function is a single linear pass over the URL.',
    examples: [
      { input: ['postgres://ana:s3cret@db.internal:6543/shop?sslmode=require'], expected: { ok: true, config: { driver: 'postgres', host: 'db.internal', port: 6543, user: 'ana', password: 's3cret', database: 'shop', options: { sslmode: 'require' } }, display: 'postgres://ana:***@db.internal:6543/shop' } },
      { input: ['mysql://localhost/app'], expected: { ok: true, config: { driver: 'mysql', host: 'localhost', port: 3306, user: null, password: null, database: 'app', options: {} }, display: 'mysql://localhost:3306/app' } },
      { input: ['redis://cache:6379/0'], expected: { ok: false, error: 'unsupported driver' } },
    ],
    hiddenTests: [
      { input: ['POSTGRESQL://ana@DB.Internal/shop%20db?application_name=web%20api&ssl&a=1=2&ssl=on'], expected: { ok: true, config: { driver: 'postgres', host: 'db.internal', port: 5432, user: 'ana', password: null, database: 'shop db', options: { application_name: 'web api', ssl: 'on', a: '1=2' } }, display: 'postgres://ana@db.internal:5432/shop db' } },
      { input: ['postgres://ana:p%40ss:w@rd@db:5432/shop'], expected: { ok: true, config: { driver: 'postgres', host: 'db', port: 5432, user: 'ana', password: 'p@ss:w@rd', database: 'shop', options: {} }, display: 'postgres://ana:***@db:5432/shop' } },
      { input: ['postgres://:70000/'], expected: { ok: false, error: 'missing host' } },
      { input: ['mysql://root:pw@db:5432abc/app'], expected: { ok: false, error: 'invalid port' } },
      { input: ['postgres://db.internal:0/shop'], expected: { ok: false, error: 'invalid port' } },
      { input: ['postgres://svc%2Bapi:@db.internal?sslmode=require'], expected: { ok: false, error: 'missing database' } },
    ],
  },
  {
    id: 'node-cli-argument-reader',
    number: 71,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'CLI Argument Reader',
    difficulty: 'Hard',
    topic: 'Config & Validation',
    statement:
      'A dev-server CLI needs its own argument parser. Implement `parseArgs(argv, spec)` returning `{ flags, positionals, errors }`.\n' +
      '\n' +
      '`argv` is an array of strings. `spec` maps each flag name to `{ type, short?, multiple?, default? }`, where `type` is `\'boolean\'`, `\'string\'` or `\'number\'`, `short` is a one-letter alias, and `multiple: true` (never used with booleans) collects repeated values into an array.\n' +
      '\n' +
      'Read `argv` left to right:\n' +
      '- `--` ends flag parsing: every later token is a positional, whatever it looks like.\n' +
      '- A token starting with `--` is a long flag. Its name is the text after `--`, up to the first `=` if there is one.\n' +
      '  - Known boolean: `--name` sets it to `true`. With `=...` attached, record `unexpected value for --name`.\n' +
      '  - Known string or number: the value is the text after the first `=`; without `=` it is the NEXT token, consumed whatever it looks like (even `-1` or `--x`). If there is no next token, record `missing value for --name`.\n' +
      '  - Otherwise, a token `--no-<name>` without `=`, where `<name>` is a known boolean, sets that flag to `false`.\n' +
      '  - Anything else: record `unknown flag: --<name>`.\n' +
      '- Any other token that starts with `-` and is longer than one character is a bundle of short flags, handled one letter at a time: an unknown letter records `unknown flag: -<letter>`; a boolean is set to `true`; a string or number flag takes the next token as its value if its letter is the LAST in the bundle, and otherwise records `missing value for --<name>` (using the long name).\n' +
      '- Everything else, including a lone `-`, is a positional.\n' +
      '\n' +
      'Values: a number value must be non-blank and `Number(value)` must be finite, otherwise record `invalid number for --<name>: <value>` and assign nothing; store the number. For `multiple` flags append each value to an array in order; for other flags the last assignment wins.\n' +
      '\n' +
      'After reading everything, for each flag in `spec` that was never assigned: use its `default` if the spec has one; else `false` for a boolean; else `[]` for a `multiple` flag; else leave the key out.\n' +
      '\n' +
      'Parsing always continues after an error; `errors` lists the messages in the order they occurred.',
    functionName: 'parseArgs',
    functionSignature: 'function parseArgs(argv, spec)',
    buggyCode:
      'function parseArgs(argv, spec) {\n' +
      '  // TODO: long flags (--name, --name=value, --no-name), short bundles (-vq, -p 80),\n' +
      '  // the -- terminator, number conversion, multiple values, error messages,\n' +
      '  // then fill in defaults for flags that were never assigned\n' +
      '  return { flags: {}, positionals: argv, errors: [] };\n' +
      '}\n',
    solution:
      'function parseArgs(argv, spec) {\n' +
      '  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);\n' +
      '  const flags = {};\n' +
      '  const positionals = [];\n' +
      '  const errors = [];\n' +
      '  const byShort = {};\n' +
      '  for (const name of Object.keys(spec)) if (spec[name].short) byShort[spec[name].short] = name;\n' +
      '  let i = 0;\n' +
      '  const assign = (name, raw) => {\n' +
      '    let value = raw;\n' +
      '    if (spec[name].type === \'number\') {\n' +
      '      value = Number(raw);\n' +
      '      if (raw.trim() === \'\' || !Number.isFinite(value)) return errors.push(\'invalid number for --\' + name + \': \' + raw);\n' +
      '    }\n' +
      '    if (spec[name].multiple) flags[name] = (flags[name] || []).concat([value]);\n' +
      '    else flags[name] = value;\n' +
      '  };\n' +
      '  const takeNext = (name) => {\n' +
      '    if (i + 1 >= argv.length) errors.push(\'missing value for --\' + name);\n' +
      '    else assign(name, argv[++i]);\n' +
      '  };\n' +
      '  for (; i < argv.length; i++) {\n' +
      '    const arg = argv[i];\n' +
      '    if (arg === \'--\') {\n' +
      '      positionals.push(...argv.slice(i + 1));\n' +
      '      break;\n' +
      '    }\n' +
      '    if (arg.startsWith(\'--\')) {\n' +
      '      const eq = arg.indexOf(\'=\');\n' +
      '      const name = eq === -1 ? arg.slice(2) : arg.slice(2, eq);\n' +
      '      const negated = name.slice(3);\n' +
      '      if (has(spec, name) && spec[name].type === \'boolean\') {\n' +
      '        if (eq === -1) flags[name] = true;\n' +
      '        else errors.push(\'unexpected value for --\' + name);\n' +
      '      } else if (has(spec, name)) {\n' +
      '        if (eq === -1) takeNext(name);\n' +
      '        else assign(name, arg.slice(eq + 1));\n' +
      '      } else if (eq === -1 && name.startsWith(\'no-\') && has(spec, negated) && spec[negated].type === \'boolean\') {\n' +
      '        flags[negated] = false;\n' +
      '      } else {\n' +
      '        errors.push(\'unknown flag: --\' + name);\n' +
      '      }\n' +
      '    } else if (arg.startsWith(\'-\') && arg.length > 1) {\n' +
      '      for (let j = 1; j < arg.length; j++) {\n' +
      '        const name = has(byShort, arg[j]) ? byShort[arg[j]] : null;\n' +
      '        if (name === null) errors.push(\'unknown flag: -\' + arg[j]);\n' +
      '        else if (spec[name].type === \'boolean\') flags[name] = true;\n' +
      '        else if (j === arg.length - 1) takeNext(name);\n' +
      '        else errors.push(\'missing value for --\' + name);\n' +
      '      }\n' +
      '    } else {\n' +
      '      positionals.push(arg);\n' +
      '    }\n' +
      '  }\n' +
      '  for (const name of Object.keys(spec)) {\n' +
      '    if (has(flags, name)) continue;\n' +
      '    if (has(spec[name], \'default\')) flags[name] = spec[name].default;\n' +
      '    else if (spec[name].type === \'boolean\') flags[name] = false;\n' +
      '    else if (spec[name].multiple) flags[name] = [];\n' +
      '  }\n' +
      '  return { flags, positionals, errors };\n' +
      '}\n',
    hint: 'Use an index-based loop so a flag can consume the following token with `argv[++i]`. Put "convert, validate and store one value" in a helper shared by the `=`, next-token and short-flag paths.',
    explanation:
      'An argument parser is a single left-to-right scan in which a token\'s meaning depends on the spec, so the loop needs an index it can advance by hand: a value-taking flag swallows the token after it. That consumption must be unconditional. If the parser refuses values that start with `-`, then `--port -1` and `--host --weird-name` become impossible to express; the spec, not the look of the next token, decides whether a value is expected.\n' +
      '\n' +
      'Classify each token in a fixed order: the `--` terminator, long flags, short bundles, positionals. For long flags split at the first `=` only, so values may contain `=`. `--no-x` is checked after an exact-name lookup and applies only to booleans. In a bundle such as `-vq` every letter is its own flag, and only the last may take a value.\n' +
      '\n' +
      'Funnel every value through one `assign` helper that converts numbers strictly (`Number` plus a blank check, since `Number(\'\')` is 0), appends for `multiple` flags and overwrites otherwise. Apply defaults in a final pass over the spec, so that a flag whose only occurrence was invalid still falls back to its default. Errors are collected rather than thrown, letting the CLI print every problem at once. Cost is linear in the number of tokens.',
    examples: [
      { input: [['serve', '--port', '8080', '-v', 'public'], CLI_SPEC], expected: { flags: { port: 8080, verbose: true, quiet: false, color: true, tag: [] }, positionals: ['serve', 'public'], errors: [] } },
      { input: [['--tag=a', '-t', 'b', '--no-color', '--host=0.0.0.0'], CLI_SPEC], expected: { flags: { tag: ['a', 'b'], color: false, host: '0.0.0.0', verbose: false, quiet: false, port: 3000 }, positionals: [], errors: [] } },
      { input: [['--port', 'abc', '--bogus=1', '-vz', '--host'], CLI_SPEC], expected: { flags: { verbose: true, quiet: false, color: true, port: 3000, tag: [] }, positionals: [], errors: ['invalid number for --port: abc', 'unknown flag: --bogus', 'unknown flag: -z', 'missing value for --host'] } },
    ],
    hiddenTests: [
      { input: [['-vq', '--', '--port', 'x', '-z'], CLI_SPEC], expected: { flags: { verbose: true, quiet: true, color: true, port: 3000, tag: [] }, positionals: ['--port', 'x', '-z'], errors: [] } },
      { input: [['-p', '-1', '-', '--host', '--port', '--tag', 'x=y', '--tag=y=z'], CLI_SPEC], expected: { flags: { port: -1, host: '--port', tag: ['x=y', 'y=z'], verbose: false, quiet: false, color: true }, positionals: ['-'], errors: [] } },
      { input: [['-pv', 'file', '-vt'], CLI_SPEC], expected: { flags: { verbose: true, quiet: false, color: true, port: 3000, tag: [] }, positionals: ['file'], errors: ['missing value for --port', 'missing value for --tag'] } },
      { input: [['--verbose=true', '--no-port', '--no-verbose', '--verbose', '--no-quiet=1', '--color'], CLI_SPEC], expected: { flags: { verbose: true, color: true, quiet: false, port: 3000, tag: [] }, positionals: [], errors: ['unexpected value for --verbose', 'unknown flag: --no-port', 'unknown flag: --no-quiet'] } },
      { input: [[], CLI_SPEC], expected: { flags: { verbose: false, quiet: false, color: true, port: 3000, tag: [] }, positionals: [], errors: [] } },
      { input: [['--port', '80', '--port=', '--port', '1e3', '--port=12px', '--no-color', '--host', 'a', '--host', 'b'], CLI_SPEC], expected: { flags: { port: 1000, color: false, host: 'b', verbose: false, quiet: false, tag: [] }, positionals: [], errors: ['invalid number for --port: ', 'invalid number for --port: 12px'] } },
    ],
  },
  {
    id: 'node-release-tag-ordering',
    number: 72,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Release Tag Ordering',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement:
      'A package registry\'s "versions" endpoint lists a package\'s release tags newest first. Implement `sortVersions(tags)` returning the valid tags ordered from highest to lowest precedence, as the original strings.\n' +
      '\n' +
      'A valid tag is an optional `v`, then `major.minor.patch` (three runs of digits), then an optional pre-release (`-` followed by dot-separated identifiers made of letters, digits and hyphens), then optional build metadata (`+` followed by letters, digits, dots and hyphens). Examples: `1.4.0`, `v2.0.0-rc.1`, `1.0.0-beta+exp.sha`. Drop every tag that is not valid (`1.0`, `latest`).\n' +
      '\n' +
      'Precedence:\n' +
      '- Compare major, then minor, then patch, as NUMBERS.\n' +
      '- With those equal, a version WITHOUT a pre-release is higher than one with a pre-release.\n' +
      '- Two pre-releases are compared identifier by identifier from the left; the first difference decides: two all-digit identifiers compare as numbers; an all-digit identifier is LOWER than one containing a letter or hyphen; two others compare as strings in code-unit order. If one list runs out first, the shorter one is lower (`alpha` is lower than `alpha.1`).\n' +
      '- The leading `v` and the build metadata never affect precedence.\n' +
      '\n' +
      'Tags of equal precedence keep their original relative order.',
    functionName: 'sortVersions',
    functionSignature: 'function sortVersions(tags)',
    buggyCode:
      'function sortVersions(tags) {\n' +
      '  // TODO: drop invalid tags, then sort newest first: numeric major/minor/patch,\n' +
      '  // release above pre-release, pre-release identifiers compared one by one,\n' +
      '  // original order for ties\n' +
      '  return tags;\n' +
      '}\n',
    solution:
      'function sortVersions(tags) {\n' +
      '  const pattern = /^v?(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z.-]+))?(?:\\+[0-9A-Za-z.-]+)?$/;\n' +
      '  const isNum = (id) => /^\\d+$/.test(id);\n' +
      '  const comparePre = (a, b) => {\n' +
      '    if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;\n' +
      '    for (let i = 0; i < Math.min(a.length, b.length); i++) {\n' +
      '      if (a[i] === b[i]) continue;\n' +
      '      if (isNum(a[i]) && isNum(b[i])) return Number(a[i]) - Number(b[i]);\n' +
      '      if (isNum(a[i]) !== isNum(b[i])) return isNum(a[i]) ? -1 : 1;\n' +
      '      return a[i] < b[i] ? -1 : 1;\n' +
      '    }\n' +
      '    return a.length - b.length;\n' +
      '  };\n' +
      '  const parsed = [];\n' +
      '  tags.forEach((tag, index) => {\n' +
      '    const m = pattern.exec(tag);\n' +
      '    if (m) parsed.push({ tag, index, core: [Number(m[1]), Number(m[2]), Number(m[3])], pre: m[4] ? m[4].split(\'.\') : null });\n' +
      '  });\n' +
      '  parsed.sort((x, y) => {\n' +
      '    for (let i = 0; i < 3; i++) if (x.core[i] !== y.core[i]) return y.core[i] - x.core[i];\n' +
      '    return comparePre(y.pre, x.pre) || x.index - y.index;\n' +
      '  });\n' +
      '  return parsed.map((p) => p.tag);\n' +
      '}\n',
    hint: 'Parse each tag once into numbers plus an array of pre-release identifiers (or null). Write a comparator for "ascending precedence" and flip its arguments for the descending sort.',
    explanation:
      'Version strings must never be sorted as text: `1.10.0` sorts before `1.9.9` alphabetically, and `rc.10` before `rc.9`. Parse first, compare structured data second.\n' +
      '\n' +
      'One anchored regular expression both validates a tag and captures its parts; anything it rejects is dropped. The numeric core is compared component by component. The pre-release rules are the part people forget: a release outranks all of its own pre-releases (`2.0.0` is newer than `2.0.0-rc.1`), numeric identifiers compare numerically and rank below alphanumeric ones, and when one identifier list is a prefix of the other the longer list is the later version.\n' +
      '\n' +
      'Build metadata is informational only, so `1.0.0+build7` and `v1.0.0` are equal in precedence; an explicit original-index tie-break keeps the output deterministic. Write one ascending comparator and call it with swapped arguments for newest-first, which is less error-prone than negating every branch. Cost is O(n log n) comparisons, each proportional to the number of identifiers.',
    examples: [
      { input: [['1.2.3', '1.10.0', '1.9.9']], expected: ['1.10.0', '1.9.9', '1.2.3'] },
      { input: [['2.0.0-rc.1', '2.0.0', '2.0.0-beta.11', '2.0.0-beta.2', '2.0.0-alpha']], expected: ['2.0.0', '2.0.0-rc.1', '2.0.0-beta.11', '2.0.0-beta.2', '2.0.0-alpha'] },
      { input: [['v1.0.0', 'latest', '1.0.0+build7', '1.0', '1.0.0-0']], expected: ['v1.0.0', '1.0.0+build7', '1.0.0-0'] },
    ],
    hiddenTests: [
      { input: [['1.0.0-alpha.1', '1.0.0-alpha', '1.0.0-alpha.beta', '1.0.0-1', '1.0.0-beta', '1.0.0-2.x']], expected: ['1.0.0-beta', '1.0.0-alpha.beta', '1.0.0-alpha.1', '1.0.0-alpha', '1.0.0-2.x', '1.0.0-1'] },
      { input: [[]], expected: [] },
      { input: [['3.0.0-rc.1+exp.sha', '0.0.9', '3.0.0-rc.1', 'v3.0.0-rc.1+a', '0.0.10', '3.0.0-rc.01x']], expected: ['3.0.0-rc.01x', '3.0.0-rc.1+exp.sha', '3.0.0-rc.1', 'v3.0.0-rc.1+a', '0.0.10', '0.0.9'] },
      { input: [['1.0.0-rc.10', '1.0.0-rc.9', '1.0.0-rc.x', '1.0.0-rc-1', '1.0.0-rc']], expected: ['1.0.0-rc-1', '1.0.0-rc.x', '1.0.0-rc.10', '1.0.0-rc.9', '1.0.0-rc'] },
      { input: [['v10.0.0', '9.12.1', 'release-1.0.0', '1.2.3.4', '10.0.0-0+z', 'v9.2.20', '9.2', '10.0.0-rc.1']], expected: ['v10.0.0', '10.0.0-rc.1', '10.0.0-0+z', '9.12.1', 'v9.2.20'] },
    ],
  },
  {
    id: 'node-static-file-path-guard',
    number: 73,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Static File Path Guard',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A documentation server maps URL paths onto files below a root directory and must never serve anything outside it. Implement `resolveSafePath(root, requestPath)`. `root` is an absolute directory without a trailing slash (for example `/srv/www`); `requestPath` is the raw, still percent-encoded URL path.\n' +
      '\n' +
      'Apply these steps in order:\n' +
      '1. Percent-decode the path exactly ONCE with `decodeURIComponent`. If decoding throws, return `{ ok: false, status: 400 }`.\n' +
      '2. If the decoded text contains a NUL character (code 0), return `{ ok: false, status: 400 }`.\n' +
      '3. Replace every backslash with `/`.\n' +
      '4. Split on `/` and walk the segments: skip empty segments and `.`; a `..` removes the previous kept segment, but if there is none the request is trying to climb above the root: return `{ ok: false, status: 403 }`. Keep every other segment.\n' +
      '5. If any segment that remains starts with `.` (hidden files such as `.env` or `.git`), return `{ ok: false, status: 403 }`.\n' +
      '6. If no segment remains, or the text from step 3 ends with `/`, the request is for a directory: append the segment `index.html`.\n' +
      '7. Return `{ ok: true, path }` where `path` is `root`, then `/`, then the segments joined with `/`.',
    functionName: 'resolveSafePath',
    functionSignature: 'function resolveSafePath(root, requestPath)',
    buggyCode:
      'function resolveSafePath(root, requestPath) {\n' +
      '  // TODO: decode once (400 on failure or NUL), treat \\ as /, resolve . and ..\n' +
      '  // segment by segment (403 when .. would leave the root), block dotfiles,\n' +
      '  // add index.html for directories\n' +
      '  return { ok: true, path: root + requestPath };\n' +
      '}\n',
    solution:
      'function resolveSafePath(root, requestPath) {\n' +
      '  let decoded;\n' +
      '  try {\n' +
      '    decoded = decodeURIComponent(requestPath);\n' +
      '  } catch (e) {\n' +
      '    return { ok: false, status: 400 };\n' +
      '  }\n' +
      '  if (decoded.includes(\'\\0\')) return { ok: false, status: 400 };\n' +
      '  decoded = decoded.replace(/\\\\/g, \'/\');\n' +
      '  const segments = [];\n' +
      '  for (const seg of decoded.split(\'/\')) {\n' +
      '    if (seg === \'\' || seg === \'.\') continue;\n' +
      '    if (seg === \'..\') {\n' +
      '      if (segments.length === 0) return { ok: false, status: 403 };\n' +
      '      segments.pop();\n' +
      '    } else {\n' +
      '      segments.push(seg);\n' +
      '    }\n' +
      '  }\n' +
      '  if (segments.some((seg) => seg.startsWith(\'.\'))) return { ok: false, status: 403 };\n' +
      '  if (segments.length === 0 || decoded.endsWith(\'/\')) segments.push(\'index.html\');\n' +
      '  return { ok: true, path: root + \'/\' + segments.join(\'/\') };\n' +
      '}\n',
    hint: 'Do not search the string for "..". Decode first, then resolve the segments with a stack; an attempt to pop an empty stack is the traversal signal.',
    explanation:
      'Path traversal is one of the oldest web vulnerabilities, and the fixes that fail are all string-matching fixes. Rejecting any path containing `..` breaks legitimate names such as `notes..txt` and harmless paths such as `/a/../b.txt`, and if the check runs before decoding it misses `%2e%2e` entirely. The robust approach is to normalise first and judge the result.\n' +
      '\n' +
      'Decode exactly once: the web server already knows the path is encoded once, and decoding a second time would turn the literal text `%2e%2e` (sent as `%252e%252e`) into a traversal that was never there, or let a doubly encoded attack through a filter that ran in between. Convert backslashes because some platforms treat them as separators. Then resolve segments with a stack: `..` pops, and popping an empty stack means the path points above the root, so it is refused rather than clamped.\n' +
      '\n' +
      'Only after normalisation do the policy checks run: no hidden files, and directory requests map to `index.html`. Because the final path is built from the root plus validated segments, it cannot escape by construction. Cost is linear in the path length.',
    examples: [
      { input: ['/srv/www', '/css/app.css'], expected: { ok: true, path: '/srv/www/css/app.css' } },
      { input: ['/srv/www', '/guide/%2e%2e/%2e%2e/etc/passwd'], expected: { ok: false, status: 403 } },
      { input: ['/srv/www', '/guide/'], expected: { ok: true, path: '/srv/www/guide/index.html' } },
    ],
    hiddenTests: [
      { input: ['/srv/www', '/a/.b/../../c/./d//notes..txt'], expected: { ok: true, path: '/srv/www/c/d/notes..txt' } },
      { input: ['/srv/www', '/%252e%252e/x%20y.txt'], expected: { ok: true, path: '/srv/www/%2e%2e/x y.txt' } },
      { input: ['/srv/www', '/img\\..\\..\\boot.ini'], expected: { ok: false, status: 403 } },
      { input: ['/srv/www', '/bad%zz/../../x'], expected: { ok: false, status: 400 } },
      { input: ['/var/site', '/docs/.git/../../.env'], expected: { ok: false, status: 403 } },
      { input: ['/var/site', '/.well-known/../a%00.png'], expected: { ok: false, status: 400 } },
    ],
  },
  {
    id: 'node-proxy-chain-client-ip',
    number: 74,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Proxy Chain Client IP',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A fraud-scoring service sits behind load balancers and needs each request\'s real client address. Every proxy appends the address it received the request from to `X-Forwarded-For`, so the header reads `client, proxy1, proxy2` from left to right, but a client can put anything it likes at the left end. Implement `clientIp(remoteAddr, forwardedFor, trusted)` (IPv4 only).\n' +
      '\n' +
      '- `remoteAddr` is the address of the socket peer (always a valid IPv4 address).\n' +
      '- `forwardedFor` is the raw header or `null`. Split it on commas, trim each entry, and drop empty entries.\n' +
      '- `trusted` lists your own proxies. Each rule is either a single address (`192.168.1.1`) or a CIDR block (`10.0.0.0/8`, prefix length 0 to 32). An address matches a block when its first `prefix` bits equal the block\'s first `prefix` bits; `/0` matches every address. Rules are always valid.\n' +
      '\n' +
      'Algorithm: start with `current = remoteAddr`. While `current` is trusted and header entries remain, take the RIGHTMOST remaining entry: if it is not a valid IPv4 address (four dot-separated decimal numbers of 1 to 3 digits, each 0 to 255), stop; otherwise it becomes `current` and is removed from the list. Return `current`.\n' +
      '\n' +
      'In other words: walk leftwards through the chain for as long as the hop that reported an address is one of your proxies, and return the first address that is not trusted (or the leftmost one if they all are). If `remoteAddr` itself is not trusted, the header is ignored completely.',
    functionName: 'clientIp',
    functionSignature: 'function clientIp(remoteAddr, forwardedFor, trusted)',
    buggyCode:
      'function clientIp(remoteAddr, forwardedFor, trusted) {\n' +
      '  // TODO: walk X-Forwarded-For from the right while the current hop is a trusted\n' +
      '  // proxy (exact address or CIDR block); stop at an invalid entry\n' +
      '  return forwardedFor;\n' +
      '}\n',
    solution:
      'function clientIp(remoteAddr, forwardedFor, trusted) {\n' +
      '  const toInt = (ip) => {\n' +
      '    const m = /^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$/.exec(ip);\n' +
      '    if (!m) return null;\n' +
      '    const octets = m.slice(1).map(Number);\n' +
      '    if (octets.some((n) => n > 255)) return null;\n' +
      '    return ((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3];\n' +
      '  };\n' +
      '  const isTrusted = (ip) =>\n' +
      '    trusted.some((rule) => {\n' +
      '      const parts = rule.split(\'/\');\n' +
      '      const block = Math.pow(2, 32 - (parts.length > 1 ? Number(parts[1]) : 32));\n' +
      '      return Math.floor(toInt(ip) / block) === Math.floor(toInt(parts[0]) / block);\n' +
      '    });\n' +
      '  const chain = (forwardedFor || \'\').split(\',\').map((s) => s.trim()).filter((s) => s !== \'\');\n' +
      '  let current = remoteAddr;\n' +
      '  while (chain.length > 0 && isTrusted(current)) {\n' +
      '    const next = chain.pop();\n' +
      '    if (toInt(next) === null) break;\n' +
      '    current = next;\n' +
      '  }\n' +
      '  return current;\n' +
      '}\n',
    hint: 'Convert an address to one number with multiplication (not `<<`, which goes negative for addresses above 127.255.255.255). Two addresses share a /n prefix when dividing both by 2^(32-n) and flooring gives the same result.',
    explanation:
      '`X-Forwarded-For` is only as trustworthy as the hop that wrote each entry. The leftmost value is whatever the client chose to send, so code that reads the first entry lets anyone spoof their address by adding a header. The reliable information is at the right-hand end: the entry appended by your own outermost proxy.\n' +
      '\n' +
      'So walk from the right. The socket peer is known for certain. If it is one of your proxies, the entry it appended (the rightmost) can be believed, and it becomes the current hop; repeat while the current hop is itself a trusted proxy. The first untrusted address reached is the real client, and everything to its left is unverified. If the socket peer is not a proxy at all, the header is ignored entirely.\n' +
      '\n' +
      'CIDR matching needs integer arithmetic on 32-bit values. JavaScript bitwise operators work on signed 32-bit integers and shift counts wrap at 32, so `1 << 31` is negative and a `/0` mask built with shifts is wrong. Building the number with multiplication and comparing `Math.floor(ip / 2 ** (32 - prefix))` avoids both traps. String prefix comparison is not a substitute: `10.0.0.0/12` does not end on a dot boundary. Cost is O(entries x rules).',
    examples: [
      { input: ['10.0.0.5', '203.0.113.7, 10.0.0.9', PROXIES], expected: '203.0.113.7' },
      { input: ['10.0.0.5', '6.6.6.6, 203.0.113.7, 10.0.0.9', PROXIES], expected: '203.0.113.7' },
      { input: ['198.51.100.2', '1.2.3.4', PROXIES], expected: '198.51.100.2' },
    ],
    hiddenTests: [
      { input: ['192.168.1.1', ' 10.1.1.1 ,, 10.2.2.2 , 192.168.1.2,10.255.0.1', PROXIES], expected: '192.168.1.2' },
      { input: ['172.16.0.1', '9.9.9.9, 172.31.255.254, 172.32.0.1, 172.20.1.1', ['172.16.0.0/12']], expected: '172.32.0.1' },
      { input: ['10.0.0.5', '1.1.1.1, unknown, 10.0.0.7', PROXIES], expected: '10.0.0.7' },
      { input: ['200.1.2.3', '5.5.5.5, 300.1.1.1, 129.0.0.1, 201.0.0.1', ['128.0.0.0/1']], expected: '129.0.0.1' },
      { input: ['1.1.1.1', '2.2.2.2, 3.3.3.3', ['0.0.0.0/0']], expected: '2.2.2.2' },
      { input: ['10.9.9.9', null, PROXIES], expected: '10.9.9.9' },
    ],
  },
  {
    id: 'node-raw-header-folding',
    number: 75,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Raw Header Folding',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'An HTTP parser hands a gateway the request or response headers as a flat array that alternates names and values exactly as they came off the wire: `[name1, value1, name2, value2, ...]`. Implement `mergeHeaders(rawHeaders)` that folds this into one object, treating repeated headers correctly.\n' +
      '\n' +
      '- Process the pairs in order. If the array has an odd length, ignore the final unpaired name.\n' +
      '- Header names are case-insensitive: use the lowercased name as the key. Trim whitespace around each value.\n' +
      '- When a name is seen again:\n' +
      '  - `set-cookie` is special: its value in the result is ALWAYS an array of every value in order, even if it appears only once.\n' +
      '  - `authorization`, `content-length`, `content-type`, `host` and `user-agent` may only occur once: keep the FIRST value and discard later ones.\n' +
      '  - `cookie` values are joined with `; ` (semicolon and space).\n' +
      '  - Every other header is joined with `, ` (comma and space).\n' +
      '\n' +
      'Return the object. All values are strings except `set-cookie`.',
    functionName: 'mergeHeaders',
    functionSignature: 'function mergeHeaders(rawHeaders)',
    buggyCode:
      'function mergeHeaders(rawHeaders) {\n' +
      '  // TODO: walk the name/value pairs, lowercase names, trim values, and combine\n' +
      '  // duplicates: set-cookie -> array, single-value headers keep the first,\n' +
      '  // cookie joins with \'; \', everything else with \', \'\n' +
      '  return {};\n' +
      '}\n',
    solution:
      'function mergeHeaders(rawHeaders) {\n' +
      '  const single = [\'authorization\', \'content-length\', \'content-type\', \'host\', \'user-agent\'];\n' +
      '  const out = {};\n' +
      '  for (let i = 0; i + 1 < rawHeaders.length; i += 2) {\n' +
      '    const name = rawHeaders[i].toLowerCase();\n' +
      '    const value = rawHeaders[i + 1].trim();\n' +
      '    const seen = Object.prototype.hasOwnProperty.call(out, name);\n' +
      '    if (name === \'set-cookie\') {\n' +
      '      if (seen) out[name].push(value);\n' +
      '      else out[name] = [value];\n' +
      '    } else if (!seen) {\n' +
      '      out[name] = value;\n' +
      '    } else if (!single.includes(name)) {\n' +
      '      out[name] += (name === \'cookie\' ? \'; \' : \', \') + value;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Step through the array two items at a time and check whether the lowercased name is already a key of the result before deciding how to combine.',
    explanation:
      'HTTP allows a header to appear several times, and what a repeat means depends on the header. For list-valued headers such as `Accept` or `Cache-Control`, repeated lines are defined to be equivalent to one line joined with commas. `Set-Cookie` is the exception: cookie attributes such as `Expires=Wed, 21 Oct ...` contain commas themselves, so joining would be ambiguous and each value must stay separate, hence the array. `Cookie` uses `; ` as its own separator. And for headers that describe the message as a whole (`Content-Length`, `Host`, `Authorization`), a duplicate is either a mistake or a request-smuggling attempt, so only the first is honoured. This is the same policy Node\'s own `http` module applies.\n' +
      '\n' +
      'The implementation is a single pass in steps of two: lowercase the name, trim the value, and branch on whether the key already exists. Always making `set-cookie` an array, even for a single cookie, spares every consumer from handling two shapes. Cost is O(n).',
    examples: [
      { input: [['Host', 'api.example.com', 'Accept', 'text/html', 'accept', 'application/json']], expected: { host: 'api.example.com', accept: 'text/html, application/json' } },
      { input: [['Set-Cookie', 'sid=1; Path=/', 'Content-Type', 'text/html', 'content-type', 'text/plain']], expected: { 'set-cookie': ['sid=1; Path=/'], 'content-type': 'text/html' } },
      { input: [['Cookie', 'a=1', 'cookie', 'b=2', 'X-Trace']], expected: { cookie: 'a=1; b=2' } },
    ],
    hiddenTests: [
      { input: [[]], expected: {} },
      { input: [['SET-COOKIE', 'a=1', 'Set-Cookie', 'b=2; Expires=Wed, 21 Oct 2026 07:28:00 GMT', 'set-cookie', '  c=3  ']], expected: { 'set-cookie': ['a=1', 'b=2; Expires=Wed, 21 Oct 2026 07:28:00 GMT', 'c=3'] } },
      { input: [['Content-Length', '12', 'Content-Length', '999', 'HOST', 'a.io', 'Host', 'evil.io', 'Authorization', 'Bearer x', 'authorization', 'Bearer y']], expected: { 'content-length': '12', host: 'a.io', authorization: 'Bearer x' } },
      { input: [['Cache-Control', ' no-cache ', 'X-Forwarded-For', '1.1.1.1', 'cache-control', 'no-store', 'x-forwarded-for', ' 2.2.2.2', 'CACHE-CONTROL', 'max-age=0']], expected: { 'cache-control': 'no-cache, no-store, max-age=0', 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } },
      { input: [['User-Agent', 'curl/8', 'Via', '1.1 a', 'user-agent', 'bot', 'via', '1.1 b', 'Cookie', 'x=1', 'Dangling']], expected: { 'user-agent': 'curl/8', via: '1.1 a, 1.1 b', cookie: 'x=1' } },
    ],
  },
];
