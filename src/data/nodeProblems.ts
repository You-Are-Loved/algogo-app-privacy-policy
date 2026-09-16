// Node.js practice — backend-flavoured build problems (routers, middleware, rate limiters, retries, streams-style processing) that run in the JavaScript engine. `language: 'javascript'`, `track: 'node'`.
// Shares the BugFixProblem shape: `kind: 'build'` problems show a skeleton in
// the editor and grade the user's implementation against tests (Python /
// JavaScript) or rules (Java / Swift / Kotlin). See bugFixes.ts for the type.

import type { BugFixProblem } from './bugFixes';

const ROUTES = [
  { pattern: '/stations', name: 'list' },
  { pattern: '/stations/:id', name: 'station' },
  { pattern: '/stations/:id/docks/:dock', name: 'dock' },
  { pattern: '/assets/*', name: 'asset' },
];

const FORMATS = ['application/json', 'text/csv', 'text/html'];

const CRUMB_REQ = { method: 'GET', path: '/orders', headers: {} };
const CRUMB_REQ_KEY = { method: 'GET', path: '/orders', headers: { 'x-api-key': 'k1' } };

const ARTWORK = { etag: '"v3"', lastModified: 1700000000 };

const CORS_POLICY = {
  origins: ['https://shop.pedalo.io'],
  methods: ['GET', 'POST', 'DELETE'],
  headers: ['content-type', 'x-rider-token'],
  credentials: true,
  maxAge: 600,
};
const CORS_OPEN = { origins: '*', methods: ['GET'], headers: [], credentials: false };

const THUMB_JOBS = [
  { id: 'A', ms: 45 },
  { id: 'B', ms: 10 },
  { id: 'C', ms: 15 },
  { id: 'D', ms: 5 },
];

const RETRY_POLICY = { base: 100, factor: 2, cap: 1000, maxAttempts: 5 };

const ROUND_JOBS = [
  { id: 'A', ms: 20 },
  { id: 'B', ms: 5 },
  { id: 'C', ms: 10 },
  { id: 'D', ms: 15 },
  { id: 'E', ms: 1 },
];

const TYPE_EVENTS = [
  { t: 0, q: 'p' },
  { t: 50, q: 'pa' },
  { t: 80, q: 'pas' },
  { t: 400, q: 'past' },
  { t: 410, q: 'pasta' },
];

const EXPORT_STEPS = [
  { name: 'gather', ms: 20 },
  { name: 'render', ms: 20 },
  { name: 'upload', ms: 20 },
];

const PROFILE_SCHEMA = {
  nickname: { type: 'string', maxLength: 8 },
  age: { type: 'number' },
  plan: { type: 'string', enum: ['free', 'pro'] },
  newsletter: { type: 'boolean' },
};

const PASS_HEADER = 'eyJhbGciOiJub25lIiwidHlwIjoiUEFTUyJ9';
const PASS_T1 = PASS_HEADER + '.eyJzdWIiOiJtZW1iZXItNzciLCJleHAiOjE3MDAwMDM2MDB9';
const PASS_T2 = PASS_HEADER + '.eyJzdWIiOiJtZW1iZXItMTIiLCJleHAiOjE3MDAwMDAwMDB9';
const PASS_T3 = PASS_HEADER + '.eyJzdWIiOiJndWVzdC05IiwibmJmIjoxNzAwMDA3MjAwLCJleHAiOjE3MDAwMTAwMDB9';
const PASS_T4 = PASS_HEADER + '.eyJzdWIiOiJzdGFmZi0xIn0';
const PASS_T5 = PASS_HEADER + '.eyJzdWIiOiJhP2IiLCJleHAiOjE3MDAwMDAwMDEsInRpZXIiOiI-PiJ9';
const PASS_BADJSON = PASS_HEADER + '.e25vdCBqc29u';
const PASS_ARRAY = PASS_HEADER + '.WzEsMl0';

const COOKIE_OPTS = { secret: 'pretzel', digest: 'fnv1a' };

export const nodeProblems: BugFixProblem[] = [
  // ==========================================================================
  // HTTP & Routing (1–7)
  // ==========================================================================
  {
    id: 'node-dock-path-matcher',
    number: 1,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Dock Path Matcher',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'Pedalo, a bike-share API, needs a tiny router. Implement `matchRoute(routes, path)` where `routes` is an ordered array of `{ pattern, name }` and `path` is the request path.\n\n' +
      'Matching rules:\n' +
      '- Split both pattern and path on `/`, ignoring empty segments (so `/stations/` and `/stations` are the same).\n' +
      '- A pattern segment starting with `:` matches exactly one path segment and captures it under that name (as a string).\n' +
      '- A pattern whose LAST segment is `*` matches zero or more remaining path segments; capture them joined by `/` as `params.rest` (`""` when nothing remains).\n' +
      '- Any other segment must match literally and case-sensitively. The whole path must be consumed.\n' +
      '- Return `{ name, params }` for the FIRST route in array order that matches, or `null` if none does.',
    functionName: 'matchRoute',
    functionSignature: 'function matchRoute(routes, path)',
    buggyCode:
      'function matchRoute(routes, path) {\n  // TODO: split into segments, try each route in order, capture :params and *\n  return null;\n}\n',
    solution:
      'function matchRoute(routes, path) {\n' +
      '  const segs = path.split(\'/\').filter(Boolean);\n' +
      '  for (const route of routes) {\n' +
      '    const pat = route.pattern.split(\'/\').filter(Boolean);\n' +
      '    const params = {};\n' +
      '    let ok = true;\n' +
      '    let i = 0;\n' +
      '    for (; i < pat.length; i++) {\n' +
      '      const p = pat[i];\n' +
      '      if (p === \'*\' && i === pat.length - 1) {\n' +
      '        params.rest = segs.slice(i).join(\'/\');\n' +
      '        i = segs.length;\n' +
      '        break;\n' +
      '      }\n' +
      '      if (i >= segs.length) { ok = false; break; }\n' +
      '      if (p.startsWith(\':\')) params[p.slice(1)] = segs[i];\n' +
      '      else if (p !== segs[i]) { ok = false; break; }\n' +
      '    }\n' +
      '    if (ok && i === segs.length) return { name: route.name, params };\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n',
    hint: 'Compare segment arrays, not strings. After the loop, a route only matches if you consumed every path segment — a wildcard consumes all of them.',
    explanation:
      'Tokenise both sides into segments and walk them in lockstep: literals must be equal, `:name` captures, and a trailing `*` swallows the rest. The classic bug is forgetting the "whole path consumed" check, which makes `/stations/:id` match `/stations/42/photos`. Because the first match wins, route order is part of the API contract — the same rule Express and Koa routers follow.',
    examples: [
      { input: [ROUTES, '/stations/42'], expected: { name: 'station', params: { id: '42' } } },
      { input: [ROUTES, '/assets/css/app.css'], expected: { name: 'asset', params: { rest: 'css/app.css' } } },
      { input: [ROUTES, '/stations/42/photos'], expected: null },
    ],
    hiddenTests: [
      { input: [ROUTES, '/stations/'], expected: { name: 'list', params: {} } },
      { input: [ROUTES, '/stations/7/docks/3'], expected: { name: 'dock', params: { id: '7', dock: '3' } } },
      { input: [ROUTES, '/assets'], expected: { name: 'asset', params: { rest: '' } } },
      { input: [ROUTES, '/riders'], expected: null },
      { input: [ROUTES, '/Stations/1'], expected: null },
      {
        input: [[{ pattern: '/stations/:id', name: 'station' }, { pattern: '/stations/new', name: 'new' }], '/stations/new'],
        expected: { name: 'station', params: { id: 'new' } },
      },
    ],
  },
  {
    id: 'node-episode-search-query-parse',
    number: 2,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Episode Search Query Parser',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'A podcast app\'s search endpoint receives raw query strings. Implement `parseQuery(qs)` returning a plain object.\n\n' +
      '- Strip one leading `?` if present. An empty string returns `{}`.\n' +
      '- Split on `&`; skip empty pieces.\n' +
      '- Each piece splits at its FIRST `=` into key and value; a piece with no `=` gets value `""`.\n' +
      '- In both key and value replace `+` with a space, then percent-decode (`decodeURIComponent`).\n' +
      '- When a key repeats, the value becomes an array of every value in order of appearance (`tag=a&tag=b` → `{ tag: ["a", "b"] }`); a key seen once stays a plain string.',
    functionName: 'parseQuery',
    functionSignature: 'function parseQuery(qs)',
    buggyCode:
      'function parseQuery(qs) {\n  // TODO: split on &, split each at the first =, decode, collect repeats into arrays\n  return {};\n}\n',
    solution:
      'function parseQuery(qs) {\n' +
      '  const out = {};\n' +
      '  const raw = qs.startsWith(\'?\') ? qs.slice(1) : qs;\n' +
      '  if (!raw) return out;\n' +
      '  const decode = (s) => decodeURIComponent(s.replace(/\\+/g, \' \'));\n' +
      '  for (const piece of raw.split(\'&\')) {\n' +
      '    if (!piece) continue;\n' +
      '    const eq = piece.indexOf(\'=\');\n' +
      '    const key = decode(eq === -1 ? piece : piece.slice(0, eq));\n' +
      '    const value = eq === -1 ? \'\' : decode(piece.slice(eq + 1));\n' +
      '    if (key in out) {\n' +
      '      if (Array.isArray(out[key])) out[key].push(value);\n' +
      '      else out[key] = [out[key], value];\n' +
      '    } else {\n' +
      '      out[key] = value;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Use indexOf("=") rather than split("=") so a value containing "=" survives intact.',
    explanation:
      'Query strings are just `key=value` pairs joined by `&`, but three details trip people up: values may themselves contain `=`, `+` means space in form encoding, and repeated keys are legal. Splitting at the first `=` only, decoding after the split, and promoting a scalar to an array on the second sighting handles all three without a library.',
    examples: [
      { input: ['q=jazz+piano&limit=10'], expected: { q: 'jazz piano', limit: '10' } },
      { input: ['?tag=live&tag=remix'], expected: { tag: ['live', 'remix'] } },
    ],
    hiddenTests: [
      { input: [''], expected: {} },
      { input: ['a=1&&b=%2Fx%3Dy&c'], expected: { a: '1', b: '/x=y', c: '' } },
      { input: ['tag=a&tag=b&tag=c&q='], expected: { tag: ['a', 'b', 'c'], q: '' } },
      { input: ['title=100%25+done'], expected: { title: '100% done' } },
      { input: ['x=1=2'], expected: { x: '1=2' } },
      { input: ['?'], expected: {} },
    ],
  },
  {
    id: 'node-workout-export-format-pick',
    number: 3,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Workout Export Format Picker',
    difficulty: 'Hard',
    topic: 'HTTP & Routing',
    statement:
      'A fitness app exports workouts as JSON, CSV or HTML. Implement `pickFormat(accept, supported)` that chooses the media type to respond with.\n\n' +
      '- `supported` lists the server\'s media types in its own preference order (e.g. `["application/json", "text/csv", "text/html"]`).\n' +
      '- `accept` is the raw `Accept` header. An empty or blank header means "anything" → return `supported[0]`.\n' +
      '- Parse comma-separated entries; each entry is a media range (`type/subtype`, `type/*`, or `*/*`) optionally followed by `;`-separated parameters. Only the `q` parameter matters (a float, default `1`); ignore other parameters. Whitespace around entries, ranges and parameters is insignificant; comparison is case-insensitive.\n' +
      '- For each supported type find the MOST SPECIFIC matching entry (exact type/subtype beats `type/*`, which beats `*/*`) and take its `q`. A type with no matching entry or with `q` of `0` is not acceptable.\n' +
      '- Return the acceptable supported type with the highest `q`; on ties, prefer whichever appears earlier in `supported`. Return `null` when nothing is acceptable.',
    functionName: 'pickFormat',
    functionSignature: 'function pickFormat(accept, supported)',
    buggyCode:
      'function pickFormat(accept, supported) {\n  // TODO: parse the Accept header into ranges with q-values, then score each supported type\n  return supported[0];\n}\n',
    solution:
      'function pickFormat(accept, supported) {\n' +
      '  if (!accept || !accept.trim()) return supported.length ? supported[0] : null;\n' +
      '  const entries = accept\n' +
      '    .split(\',\')\n' +
      '    .map((raw) => {\n' +
      '      const [range, ...params] = raw.split(\';\').map((s) => s.trim());\n' +
      '      let q = 1;\n' +
      '      for (const p of params) {\n' +
      '        const [k, v] = p.split(\'=\').map((s) => s.trim());\n' +
      '        if (k.toLowerCase() === \'q\') {\n' +
      '          const n = parseFloat(v);\n' +
      '          if (!Number.isNaN(n)) q = n;\n' +
      '        }\n' +
      '      }\n' +
      '      const [type, sub] = range.toLowerCase().split(\'/\');\n' +
      '      return { type, sub: sub === undefined ? \'*\' : sub, q };\n' +
      '    })\n' +
      '    .filter((e) => e.type);\n' +
      '  let best = null;\n' +
      '  for (const mt of supported) {\n' +
      '    const [type, sub] = mt.toLowerCase().split(\'/\');\n' +
      '    let spec = 0;\n' +
      '    let q = 0;\n' +
      '    for (const e of entries) {\n' +
      '      let s = 0;\n' +
      '      if (e.type === type && e.sub === sub) s = 3;\n' +
      '      else if (e.type === type && e.sub === \'*\') s = 2;\n' +
      '      else if (e.type === \'*\' && e.sub === \'*\') s = 1;\n' +
      '      if (s > spec) { spec = s; q = e.q; }\n' +
      '    }\n' +
      '    if (spec > 0 && q > 0 && (!best || q > best.q)) best = { mt, q };\n' +
      '  }\n' +
      '  return best ? best.mt : null;\n' +
      '}\n',
    hint: 'Score each supported type against every parsed range and keep the q from the most specific match — not the first or the highest.',
    explanation:
      'Content negotiation is a two-pass job: parse the header into `{ type, subtype, q }` ranges, then for every server-supported type ask "which range describes me most precisely, and what quality did it assign?". Taking the most specific match matters because `text/*;q=0.5, text/html;q=0.2` must give HTML `0.2`, not `0.5`. A strict `>` when comparing candidates keeps the server\'s own ordering as the tiebreaker, which is how frameworks like Express\'s `res.format` behave.',
    examples: [
      { input: ['text/csv', FORMATS], expected: 'text/csv' },
      { input: ['text/*;q=0.5, application/json;q=0.9', FORMATS], expected: 'application/json' },
      { input: ['image/png', FORMATS], expected: null },
    ],
    hiddenTests: [
      { input: ['*/*', FORMATS], expected: 'application/json' },
      { input: ['text/html, text/csv;q=0.8, */*;q=0.1', FORMATS], expected: 'text/html' },
      { input: ['*/*;q=0.1, application/json;q=0', FORMATS], expected: 'text/csv' },
      { input: ['', FORMATS], expected: 'application/json' },
      { input: [' text/* ; q=0.3 , text/html ; q=0.2 ', FORMATS], expected: 'text/csv' },
      { input: ['application/*;q=0.4, text/csv;q=0.4', FORMATS], expected: 'application/json' },
      { input: ['TEXT/HTML;level=1;q=0.9', FORMATS], expected: 'text/html' },
    ],
  },
  {
    id: 'node-bakery-onion-pipeline',
    number: 4,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Bakery Order Onion Pipeline',
    difficulty: 'Hard',
    topic: 'HTTP & Routing',
    statement:
      'Crumb, a bakery ordering service, describes its request pipeline as a list of middleware specs. The `toMiddleware(spec)` factory (already written) turns each spec into an `async (ctx, next)` function. Implement `runPipeline(specs, request)` that composes them Koa-style and returns `{ status, body, trace }`.\n\n' +
      'Composition rules:\n' +
      '- Create `ctx = { request, response: null, trace: [] }` and call middleware `0` with `ctx` and a `next` that runs middleware `1`, whose `next` runs middleware `2`, and so on. `await` each call so work after `await next()` runs on the way back out (the onion).\n' +
      '- A middleware that does not call `next` short-circuits: nothing after it runs.\n' +
      '- Calling `next()` more than once from the same middleware must throw `Error("next() called multiple times")`.\n' +
      '- If any middleware throws, respond with `status: 500` and the error message as `body`.\n' +
      '- If the pipeline finishes with `ctx.response` still `null`, respond `404` with body `"not found"`.\n' +
      '- Always return `{ status, body, trace: ctx.trace }`.',
    functionName: 'runPipeline',
    functionSignature: 'async function runPipeline(specs, request)',
    buggyCode:
      'function toMiddleware(spec) {\n' +
      '  switch (spec.kind) {\n' +
      '    case \'trace\':\n' +
      '      return async (ctx, next) => {\n' +
      '        ctx.trace.push(spec.label + \':in\');\n' +
      '        await next();\n' +
      '        ctx.trace.push(spec.label + \':out\');\n' +
      '      };\n' +
      '    case \'guard\':\n' +
      '      return async (ctx, next) => {\n' +
      '        if (ctx.request.headers[spec.header] === undefined) {\n' +
      '          ctx.response = { status: 401, body: \'missing \' + spec.header };\n' +
      '          return;\n' +
      '        }\n' +
      '        await next();\n' +
      '      };\n' +
      '    case \'handler\':\n' +
      '      return async (ctx) => {\n' +
      '        ctx.response = { status: 200, body: spec.body };\n' +
      '      };\n' +
      '    case \'twice\':\n' +
      '      return async (ctx, next) => {\n' +
      '        await next();\n' +
      '        await next();\n' +
      '      };\n' +
      '    default:\n' +
      '      throw new Error(\'unknown middleware \' + spec.kind);\n' +
      '  }\n' +
      '}\n\n' +
      'async function runPipeline(specs, request) {\n' +
      '  const middlewares = specs.map(toMiddleware);\n' +
      '  // TODO: build ctx, dispatch through the chain with next(), handle 404/500\n' +
      '  return null;\n' +
      '}\n',
    solution:
      'function toMiddleware(spec) {\n' +
      '  switch (spec.kind) {\n' +
      '    case \'trace\':\n' +
      '      return async (ctx, next) => {\n' +
      '        ctx.trace.push(spec.label + \':in\');\n' +
      '        await next();\n' +
      '        ctx.trace.push(spec.label + \':out\');\n' +
      '      };\n' +
      '    case \'guard\':\n' +
      '      return async (ctx, next) => {\n' +
      '        if (ctx.request.headers[spec.header] === undefined) {\n' +
      '          ctx.response = { status: 401, body: \'missing \' + spec.header };\n' +
      '          return;\n' +
      '        }\n' +
      '        await next();\n' +
      '      };\n' +
      '    case \'handler\':\n' +
      '      return async (ctx) => {\n' +
      '        ctx.response = { status: 200, body: spec.body };\n' +
      '      };\n' +
      '    case \'twice\':\n' +
      '      return async (ctx, next) => {\n' +
      '        await next();\n' +
      '        await next();\n' +
      '      };\n' +
      '    default:\n' +
      '      throw new Error(\'unknown middleware \' + spec.kind);\n' +
      '  }\n' +
      '}\n\n' +
      'async function runPipeline(specs, request) {\n' +
      '  const middlewares = specs.map(toMiddleware);\n' +
      '  const ctx = { request, response: null, trace: [] };\n' +
      '  let lastIndex = -1;\n' +
      '  const dispatch = async (i) => {\n' +
      '    if (i <= lastIndex) throw new Error(\'next() called multiple times\');\n' +
      '    lastIndex = i;\n' +
      '    const mw = middlewares[i];\n' +
      '    if (!mw) return;\n' +
      '    await mw(ctx, () => dispatch(i + 1));\n' +
      '  };\n' +
      '  try {\n' +
      '    await dispatch(0);\n' +
      '  } catch (e) {\n' +
      '    ctx.response = { status: 500, body: e.message };\n' +
      '  }\n' +
      '  const res = ctx.response || { status: 404, body: \'not found\' };\n' +
      '  return { status: res.status, body: res.body, trace: ctx.trace };\n' +
      '}\n',
    hint: 'Write a recursive `dispatch(i)` that calls `middlewares[i](ctx, () => dispatch(i + 1))`; remember the highest index dispatched so far to detect a second next() call.',
    explanation:
      'The onion model is a recursive dispatch: middleware `i` receives a `next` closure that dispatches `i + 1`, and awaiting it means code after `next()` runs after everything downstream — perfect for timing, logging, and error wrapping. Tracking the last dispatched index is how koa-compose catches a middleware that calls `next()` twice, a bug that would otherwise re-run handlers and double-write responses. Wrapping the whole dispatch in one try/catch gives a single place to turn thrown errors into 500s.',
    examples: [
      {
        input: [[{ kind: 'trace', label: 'a' }, { kind: 'trace', label: 'b' }, { kind: 'handler', body: 'ok' }], CRUMB_REQ],
        expected: { status: 200, body: 'ok', trace: ['a:in', 'b:in', 'b:out', 'a:out'] },
      },
      {
        input: [[{ kind: 'trace', label: 'a' }, { kind: 'guard', header: 'x-api-key' }, { kind: 'handler', body: 'ok' }], CRUMB_REQ],
        expected: { status: 401, body: 'missing x-api-key', trace: ['a:in', 'a:out'] },
      },
    ],
    hiddenTests: [
      {
        input: [[{ kind: 'trace', label: 'a' }, { kind: 'guard', header: 'x-api-key' }, { kind: 'handler', body: 'ok' }], CRUMB_REQ_KEY],
        expected: { status: 200, body: 'ok', trace: ['a:in', 'a:out'] },
      },
      { input: [[{ kind: 'trace', label: 'a' }], CRUMB_REQ], expected: { status: 404, body: 'not found', trace: ['a:in', 'a:out'] } },
      { input: [[], CRUMB_REQ], expected: { status: 404, body: 'not found', trace: [] } },
      {
        input: [[{ kind: 'trace', label: 'a' }, { kind: 'twice' }, { kind: 'handler', body: 'ok' }], CRUMB_REQ],
        expected: { status: 500, body: 'next() called multiple times', trace: ['a:in'] },
      },
      {
        input: [[{ kind: 'handler', body: 'first' }, { kind: 'trace', label: 'a' }], CRUMB_REQ],
        expected: { status: 200, body: 'first', trace: [] },
      },
      {
        input: [[{ kind: 'trace', label: 'x' }, { kind: 'trace', label: 'y' }, { kind: 'trace', label: 'z' }], CRUMB_REQ],
        expected: { status: 404, body: 'not found', trace: ['x:in', 'y:in', 'z:in', 'z:out', 'y:out', 'x:out'] },
      },
    ],
  },
  {
    id: 'node-reader-cookie-header-parse',
    number: 5,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Reader Cookie Header Parser',
    difficulty: 'Easy',
    topic: 'HTTP & Routing',
    statement:
      'An e-reader web app needs the raw `Cookie` request header turned into an object. Implement `parseCookies(header)`.\n\n' +
      '- `null`, `undefined` or an empty string → `{}`.\n' +
      '- Split on `;` and trim each piece. Skip pieces that are empty, have no `=`, or have an empty name.\n' +
      '- The name is everything before the FIRST `=`; the value is everything after it (so `pref=x=y` gives `"x=y"`).\n' +
      '- If the value is wrapped in a pair of double quotes, strip them.\n' +
      '- Percent-decode the value with `decodeURIComponent`; if decoding throws, keep the raw value.\n' +
      '- When the same name appears more than once, the FIRST occurrence wins.',
    functionName: 'parseCookies',
    functionSignature: 'function parseCookies(header)',
    buggyCode:
      'function parseCookies(header) {\n  // TODO: split on ";", split each pair at the first "=", unquote and decode the value\n  return {};\n}\n',
    solution:
      'function parseCookies(header) {\n' +
      '  const out = {};\n' +
      '  if (!header) return out;\n' +
      '  for (const piece of header.split(\';\')) {\n' +
      '    const pair = piece.trim();\n' +
      '    const eq = pair.indexOf(\'=\');\n' +
      '    if (eq <= 0) continue;\n' +
      '    const name = pair.slice(0, eq).trim();\n' +
      '    let value = pair.slice(eq + 1).trim();\n' +
      '    if (value.length >= 2 && value.startsWith(\'"\') && value.endsWith(\'"\')) value = value.slice(1, -1);\n' +
      '    try {\n' +
      '      value = decodeURIComponent(value);\n' +
      '    } catch (e) {\n' +
      '      // keep raw value\n' +
      '    }\n' +
      '    if (!(name in out)) out[name] = value;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'indexOf("=") <= 0 covers both "no equals sign" and "empty name" in one check.',
    explanation:
      'Cookie headers are `name=value` pairs separated by `; `, and browsers send the most specific cookie first, which is why the first occurrence should win. Splitting at the first `=` keeps values that contain `=` intact, and guarding `decodeURIComponent` with try/catch prevents a single malformed cookie from crashing the whole request — a real-world availability bug in hand-rolled parsers.',
    examples: [
      { input: ['theme=dark; sid=abc123'], expected: { theme: 'dark', sid: 'abc123' } },
      { input: ['a=1; a=2; b='], expected: { a: '1', b: '' } },
    ],
    hiddenTests: [
      { input: [''], expected: {} },
      { input: [null], expected: {} },
      { input: ['name=%22Ada%22; note="hello world"; junk; =x'], expected: { name: '"Ada"', note: 'hello world' } },
      { input: ['tz=Europe%2FLisbon;pref=x=y'], expected: { tz: 'Europe/Lisbon', pref: 'x=y' } },
      { input: ['bad=%E0%A4%A; ok=1'], expected: { bad: '%E0%A4%A', ok: '1' } },
      { input: ['  spaced = padded ;other=1'], expected: { spaced: 'padded', other: '1' } },
    ],
  },
  {
    id: 'node-artwork-conditional-get',
    number: 6,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Artwork Conditional GET',
    difficulty: 'Medium',
    topic: 'HTTP & Routing',
    statement:
      'A podcast API serves show artwork and wants to answer `304 Not Modified` when the client already has the current version. Implement `decideConditional(resource, headers)`.\n\n' +
      '- `resource` is `{ etag, lastModified }` where `etag` is the quoted tag string (possibly prefixed `W/`) and `lastModified` is an integer unix timestamp in seconds.\n' +
      '- `headers` is the request header object; look names up case-insensitively.\n' +
      '- If `If-None-Match` is present: split it on commas, trim each tag, and compare weakly — strip a leading `W/` from both sides before comparing. If any tag equals the resource etag, or any tag is `*`, return `304`. Otherwise return `200`. When `If-None-Match` is present, `If-Modified-Since` is IGNORED.\n' +
      '- Else if `If-Modified-Since` is present and parses as an integer (string or number) and is `>= lastModified`, return `304`. A non-numeric value is ignored.\n' +
      '- Otherwise return `200`.\n' +
      '- A 304 result is `{ status: 304, headers: { ETag } }`; a 200 result is `{ status: 200, headers: { ETag, "Last-Modified": lastModified } }` with the ORIGINAL etag string (keep its `W/` if it had one).',
    functionName: 'decideConditional',
    functionSignature: 'function decideConditional(resource, headers)',
    buggyCode:
      'function decideConditional(resource, headers) {\n  // TODO: check If-None-Match (weak compare, "*", comma lists) then If-Modified-Since\n  return { status: 200, headers: { ETag: resource.etag, \'Last-Modified\': resource.lastModified } };\n}\n',
    solution:
      'function decideConditional(resource, headers) {\n' +
      '  const get = (name) => {\n' +
      '    const key = Object.keys(headers).find((k) => k.toLowerCase() === name);\n' +
      '    return key === undefined ? undefined : headers[key];\n' +
      '  };\n' +
      '  const weak = (tag) => tag.trim().replace(/^W\\//, \'\');\n' +
      '  const notModified = { status: 304, headers: { ETag: resource.etag } };\n' +
      '  const ok = { status: 200, headers: { ETag: resource.etag, \'Last-Modified\': resource.lastModified } };\n' +
      '  const inm = get(\'if-none-match\');\n' +
      '  if (inm !== undefined) {\n' +
      '    const mine = weak(resource.etag);\n' +
      '    const tags = String(inm).split(\',\').map((t) => t.trim());\n' +
      '    return tags.some((t) => t === \'*\' || weak(t) === mine) ? notModified : ok;\n' +
      '  }\n' +
      '  const ims = get(\'if-modified-since\');\n' +
      '  if (ims !== undefined && /^-?\\d+$/.test(String(ims).trim()) && parseInt(String(ims), 10) >= resource.lastModified) {\n' +
      '    return notModified;\n' +
      '  }\n' +
      '  return ok;\n' +
      '}\n',
    hint: 'Once If-None-Match is present, return based on it alone — the spec says If-Modified-Since only applies when there is no ETag check.',
    explanation:
      'HTTP precedence says an entity-tag check (`If-None-Match`) wins over a date check (`If-Modified-Since`), so the function must return as soon as it has evaluated the tag list — even when no tag matched. Weak comparison strips `W/` so a weakly-tagged cached copy still validates, and `*` means "any current representation". Getting this right lets CDNs and browsers skip re-downloading megabytes of artwork.',
    examples: [
      { input: [ARTWORK, { 'if-none-match': '"v3"' }], expected: { status: 304, headers: { ETag: '"v3"' } } },
      { input: [ARTWORK, {}], expected: { status: 200, headers: { ETag: '"v3"', 'Last-Modified': 1700000000 } } },
    ],
    hiddenTests: [
      { input: [ARTWORK, { 'If-None-Match': '"v1", W/"v3"' }], expected: { status: 304, headers: { ETag: '"v3"' } } },
      {
        input: [ARTWORK, { 'if-none-match': '"v1"', 'if-modified-since': '1700000500' }],
        expected: { status: 200, headers: { ETag: '"v3"', 'Last-Modified': 1700000000 } },
      },
      { input: [ARTWORK, { 'if-modified-since': '1700000000' }], expected: { status: 304, headers: { ETag: '"v3"' } } },
      { input: [ARTWORK, { 'if-modified-since': 1699999999 }], expected: { status: 200, headers: { ETag: '"v3"', 'Last-Modified': 1700000000 } } },
      { input: [ARTWORK, { 'if-none-match': '*' }], expected: { status: 304, headers: { ETag: '"v3"' } } },
      { input: [ARTWORK, { 'if-modified-since': 'yesterday' }], expected: { status: 200, headers: { ETag: '"v3"', 'Last-Modified': 1700000000 } } },
      { input: [{ etag: 'W/"v9"', lastModified: 5 }, { 'IF-NONE-MATCH': '"v9"' }], expected: { status: 304, headers: { ETag: 'W/"v9"' } } },
    ],
  },
  {
    id: 'node-cross-origin-policy-table',
    number: 7,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Cross-Origin Policy Table',
    difficulty: 'Hard',
    topic: 'HTTP & Routing',
    statement:
      'Pedalo\'s API is called from a browser storefront and must emit the right CORS headers. Implement `corsDecision(request, policy)` returning `{ kind, headers }`.\n\n' +
      '`request` is `{ method, headers }` with lowercase header names. `policy` is `{ origins, methods, headers, credentials, maxAge? }` where `origins` is an array of exact origins or the string `"*"`.\n\n' +
      'Decision table:\n' +
      '- No `origin` header → `{ kind: "not-cors", headers: {} }`.\n' +
      '- Origin not allowed (not in the array, and `origins` is not `"*"`) → `{ kind: "rejected", headers: {} }`.\n' +
      '- Origin headers: if `origins` is `"*"` AND `credentials` is false, set `Access-Control-Allow-Origin: "*"`; otherwise echo the request origin AND add `Vary: "Origin"`. If `credentials` is true, add `Access-Control-Allow-Credentials: "true"`.\n' +
      '- A preflight is `method === "OPTIONS"` with an `access-control-request-method` header. The requested method (compare uppercase) must be in `policy.methods`, and every name in the comma-separated `access-control-request-headers` (trimmed, compared lowercase) must be in `policy.headers`; otherwise → `rejected`. A valid preflight returns `kind: "preflight"` with the origin headers plus `Access-Control-Allow-Methods` (`policy.methods` joined by `", "`), `Access-Control-Allow-Headers` (`policy.headers` joined by `", "`, only when non-empty) and `Access-Control-Max-Age` (`String(policy.maxAge)`, only when `maxAge` is defined).\n' +
      '- Anything else with an allowed origin → `kind: "actual"` with just the origin headers.',
    functionName: 'corsDecision',
    functionSignature: 'function corsDecision(request, policy)',
    buggyCode:
      'function corsDecision(request, policy) {\n  // TODO: not-cors / rejected / preflight / actual, building the header set per the table\n  return { kind: \'not-cors\', headers: {} };\n}\n',
    solution:
      'function corsDecision(request, policy) {\n' +
      '  const origin = request.headers.origin;\n' +
      '  if (origin === undefined) return { kind: \'not-cors\', headers: {} };\n' +
      '  const open = policy.origins === \'*\';\n' +
      '  if (!open && !policy.origins.includes(origin)) return { kind: \'rejected\', headers: {} };\n' +
      '  const headers = {};\n' +
      '  if (open && !policy.credentials) {\n' +
      '    headers[\'Access-Control-Allow-Origin\'] = \'*\';\n' +
      '  } else {\n' +
      '    headers[\'Access-Control-Allow-Origin\'] = origin;\n' +
      '    headers[\'Vary\'] = \'Origin\';\n' +
      '  }\n' +
      '  if (policy.credentials) headers[\'Access-Control-Allow-Credentials\'] = \'true\';\n' +
      '  const reqMethod = request.headers[\'access-control-request-method\'];\n' +
      '  if (request.method === \'OPTIONS\' && reqMethod !== undefined) {\n' +
      '    const allowedMethods = policy.methods.map((m) => m.toUpperCase());\n' +
      '    if (!allowedMethods.includes(String(reqMethod).toUpperCase())) return { kind: \'rejected\', headers: {} };\n' +
      '    const allowedHeaders = policy.headers.map((h) => h.toLowerCase());\n' +
      '    const requested = (request.headers[\'access-control-request-headers\'] || \'\')\n' +
      '      .split(\',\')\n' +
      '      .map((h) => h.trim().toLowerCase())\n' +
      '      .filter(Boolean);\n' +
      '    if (requested.some((h) => !allowedHeaders.includes(h))) return { kind: \'rejected\', headers: {} };\n' +
      '    headers[\'Access-Control-Allow-Methods\'] = policy.methods.join(\', \');\n' +
      '    if (policy.headers.length) headers[\'Access-Control-Allow-Headers\'] = policy.headers.join(\', \');\n' +
      '    if (policy.maxAge !== undefined) headers[\'Access-Control-Max-Age\'] = String(policy.maxAge);\n' +
      '    return { kind: \'preflight\', headers };\n' +
      '  }\n' +
      '  return { kind: \'actual\', headers };\n' +
      '}\n',
    hint: 'Decide the origin headers first, then branch on preflight vs actual. OPTIONS without Access-Control-Request-Method is just an ordinary request.',
    explanation:
      'CORS is a decision table, and encoding it as ordered guards keeps it auditable: is this even cross-origin, is the origin allowed, is it a preflight, and are the requested method and headers within policy. Two details cause real security bugs: you may only answer `*` when credentials are off (browsers reject `*` with cookies), and when you echo the origin you must send `Vary: Origin` so a shared cache never serves one origin\'s response to another.',
    examples: [
      {
        input: [{ method: 'GET', headers: { origin: 'https://shop.pedalo.io' } }, CORS_POLICY],
        expected: {
          kind: 'actual',
          headers: { 'Access-Control-Allow-Origin': 'https://shop.pedalo.io', Vary: 'Origin', 'Access-Control-Allow-Credentials': 'true' },
        },
      },
      {
        input: [
          {
            method: 'OPTIONS',
            headers: {
              origin: 'https://shop.pedalo.io',
              'access-control-request-method': 'delete',
              'access-control-request-headers': 'X-Rider-Token, Content-Type',
            },
          },
          CORS_POLICY,
        ],
        expected: {
          kind: 'preflight',
          headers: {
            'Access-Control-Allow-Origin': 'https://shop.pedalo.io',
            Vary: 'Origin',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE',
            'Access-Control-Allow-Headers': 'content-type, x-rider-token',
            'Access-Control-Max-Age': '600',
          },
        },
      },
      { input: [{ method: 'GET', headers: {} }, CORS_POLICY], expected: { kind: 'not-cors', headers: {} } },
    ],
    hiddenTests: [
      { input: [{ method: 'GET', headers: { origin: 'https://evil.io' } }, CORS_POLICY], expected: { kind: 'rejected', headers: {} } },
      {
        input: [{ method: 'OPTIONS', headers: { origin: 'https://shop.pedalo.io', 'access-control-request-method': 'PUT' } }, CORS_POLICY],
        expected: { kind: 'rejected', headers: {} },
      },
      {
        input: [
          {
            method: 'OPTIONS',
            headers: { origin: 'https://shop.pedalo.io', 'access-control-request-method': 'POST', 'access-control-request-headers': 'x-admin' },
          },
          CORS_POLICY,
        ],
        expected: { kind: 'rejected', headers: {} },
      },
      {
        input: [{ method: 'GET', headers: { origin: 'https://anything.dev' } }, CORS_OPEN],
        expected: { kind: 'actual', headers: { 'Access-Control-Allow-Origin': '*' } },
      },
      {
        input: [{ method: 'OPTIONS', headers: { origin: 'https://anything.dev', 'access-control-request-method': 'GET' } }, CORS_OPEN],
        expected: { kind: 'preflight', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' } },
      },
      {
        input: [{ method: 'OPTIONS', headers: { origin: 'https://shop.pedalo.io' } }, CORS_POLICY],
        expected: {
          kind: 'actual',
          headers: { 'Access-Control-Allow-Origin': 'https://shop.pedalo.io', Vary: 'Origin', 'Access-Control-Allow-Credentials': 'true' },
        },
      },
      {
        input: [{ method: 'GET', headers: { origin: 'https://anything.dev' } }, { origins: '*', methods: ['GET'], headers: [], credentials: true }],
        expected: {
          kind: 'actual',
          headers: { 'Access-Control-Allow-Origin': 'https://anything.dev', Vary: 'Origin', 'Access-Control-Allow-Credentials': 'true' },
        },
      },
    ],
  },

  // ==========================================================================
  // Async Patterns (8–15)
  // ==========================================================================
  {
    id: 'node-thumbnail-worker-pool',
    number: 8,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Thumbnail Worker Pool',
    difficulty: 'Hard',
    topic: 'Async Patterns',
    statement:
      'A photo service renders thumbnails but must never run more than `limit` renders at once. Implement `async function renderWithPool(jobs, limit)`.\n\n' +
      '- `jobs` is an array of `{ id, ms }`. "Rendering" a job means waiting `ms` milliseconds (use `setTimeout`) and producing the string `id + ".png"`.\n' +
      '- Start jobs in array order. At most `limit` jobs may be in flight at any moment; as soon as one finishes, the next unstarted job begins.\n' +
      '- Resolve to `{ results, finished, peak }` where `results` holds every job\'s output in INPUT order, `finished` lists job ids in the order they COMPLETED, and `peak` is the highest number of simultaneously in-flight jobs observed (`0` for no jobs).\n' +
      '- Timings differ by at least 5 ms, so completion order is deterministic.',
    functionName: 'renderWithPool',
    functionSignature: 'async function renderWithPool(jobs, limit)',
    buggyCode:
      'async function renderWithPool(jobs, limit) {\n  // TODO: run at most `limit` jobs concurrently, record results in input order\n  return null;\n}\n',
    solution:
      'async function renderWithPool(jobs, limit) {\n' +
      '  const results = new Array(jobs.length);\n' +
      '  const finished = [];\n' +
      '  let active = 0;\n' +
      '  let peak = 0;\n' +
      '  let nextIndex = 0;\n' +
      '  const worker = async () => {\n' +
      '    while (nextIndex < jobs.length) {\n' +
      '      const i = nextIndex++;\n' +
      '      const job = jobs[i];\n' +
      '      active++;\n' +
      '      peak = Math.max(peak, active);\n' +
      '      await new Promise((resolve) => setTimeout(resolve, job.ms));\n' +
      '      active--;\n' +
      '      results[i] = job.id + \'.png\';\n' +
      '      finished.push(job.id);\n' +
      '    }\n' +
      '  };\n' +
      '  const workers = Array.from({ length: Math.min(limit, jobs.length) }, worker);\n' +
      '  await Promise.all(workers);\n' +
      '  return { results, finished, peak };\n' +
      '}\n',
    hint: 'Spawn min(limit, jobs.length) worker loops that each pull the next index from a shared counter until it runs out, then Promise.all the workers.',
    explanation:
      'The cleanest bounded-concurrency pattern is N worker loops sharing one cursor: each worker takes the next job, awaits it, and loops — so the pool refills instantly without a scheduler. Writing results by index (not by push) preserves input order even though completion order differs. This is the shape behind `p-limit`, and it\'s what protects a downstream API or database from being flooded by `Promise.all` over a thousand items.',
    examples: [
      { input: [THUMB_JOBS, 2], expected: { results: ['A.png', 'B.png', 'C.png', 'D.png'], finished: ['B', 'C', 'D', 'A'], peak: 2 } },
      { input: [THUMB_JOBS, 4], expected: { results: ['A.png', 'B.png', 'C.png', 'D.png'], finished: ['D', 'B', 'C', 'A'], peak: 4 } },
    ],
    hiddenTests: [
      { input: [THUMB_JOBS, 1], expected: { results: ['A.png', 'B.png', 'C.png', 'D.png'], finished: ['A', 'B', 'C', 'D'], peak: 1 } },
      { input: [[], 3], expected: { results: [], finished: [], peak: 0 } },
      { input: [[{ id: 'X', ms: 5 }], 10], expected: { results: ['X.png'], finished: ['X'], peak: 1 } },
      {
        input: [[{ id: 'A', ms: 20 }, { id: 'B', ms: 5 }, { id: 'C', ms: 5 }], 2],
        expected: { results: ['A.png', 'B.png', 'C.png'], finished: ['B', 'C', 'A'], peak: 2 },
      },
    ],
  },
  {
    id: 'node-webhook-retry-ledger',
    number: 9,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Webhook Retry Ledger',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A payments platform delivers webhooks with exponential backoff and wants the retry logic testable without timers. Implement `simulateRetries(outcomes, policy)`.\n\n' +
      '- `policy` is `{ base, factor, cap, maxAttempts }`. The delay waited BEFORE attempt `n` (for `n >= 2`) is `min(cap, base * factor ** (n - 2))`.\n' +
      '- `outcomes[i]` is the result of attempt `i + 1`: `"ok"`, `"fail"` (retryable) or `"fatal"` (never retry). If the array runs out, treat further attempts as `"fail"`.\n' +
      '- Walk attempts `1..maxAttempts`. `"ok"` → stop with outcome `"delivered"`. `"fatal"` → stop with outcome `"aborted"`. `"fail"` → if this was the last allowed attempt stop with `"gave-up"`, otherwise record the delay before the next attempt and continue.\n' +
      '- Return `{ attempts, delays, outcome }` where `attempts` is the number of attempts made and `delays` lists every recorded delay in order.',
    functionName: 'simulateRetries',
    functionSignature: 'function simulateRetries(outcomes, policy)',
    buggyCode:
      'function simulateRetries(outcomes, policy) {\n  // TODO: walk attempts, compute capped exponential delays, stop on ok/fatal/maxAttempts\n  return { attempts: 0, delays: [], outcome: \'gave-up\' };\n}\n',
    solution:
      'function simulateRetries(outcomes, policy) {\n' +
      '  const delays = [];\n' +
      '  for (let n = 1; n <= policy.maxAttempts; n++) {\n' +
      '    const result = n - 1 < outcomes.length ? outcomes[n - 1] : \'fail\';\n' +
      '    if (result === \'ok\') return { attempts: n, delays, outcome: \'delivered\' };\n' +
      '    if (result === \'fatal\') return { attempts: n, delays, outcome: \'aborted\' };\n' +
      '    if (n === policy.maxAttempts) break;\n' +
      '    delays.push(Math.min(policy.cap, policy.base * Math.pow(policy.factor, n - 1)));\n' +
      '  }\n' +
      '  return { attempts: policy.maxAttempts, delays, outcome: \'gave-up\' };\n' +
      '}\n',
    hint: 'The delay pushed after a failed attempt n is the one waited before attempt n+1, so its exponent is (n+1) - 2 = n - 1.',
    explanation:
      'Separating the retry policy (pure arithmetic over attempt numbers) from the transport makes backoff unit-testable and reviewable. The pitfalls are off-by-one exponents, forgetting the cap, and retrying errors that will never succeed (`fatal` — think 4xx validation errors). Production systems add jitter on top, but the deterministic schedule is what you reason about in an incident review.',
    examples: [
      { input: [['fail', 'fail', 'ok'], RETRY_POLICY], expected: { attempts: 3, delays: [100, 200], outcome: 'delivered' } },
      { input: [['fail', 'fatal'], RETRY_POLICY], expected: { attempts: 2, delays: [100], outcome: 'aborted' } },
    ],
    hiddenTests: [
      { input: [['ok'], RETRY_POLICY], expected: { attempts: 1, delays: [], outcome: 'delivered' } },
      { input: [[], RETRY_POLICY], expected: { attempts: 5, delays: [100, 200, 400, 800], outcome: 'gave-up' } },
      { input: [['fail', 'fail', 'fail', 'fail', 'fail', 'ok'], RETRY_POLICY], expected: { attempts: 5, delays: [100, 200, 400, 800], outcome: 'gave-up' } },
      {
        input: [['fail', 'fail', 'fail', 'ok'], { base: 250, factor: 3, cap: 1000, maxAttempts: 10 }],
        expected: { attempts: 4, delays: [250, 750, 1000], outcome: 'delivered' },
      },
      { input: [['fail'], { base: 50, factor: 2, cap: 1000, maxAttempts: 1 }], expected: { attempts: 1, delays: [], outcome: 'gave-up' } },
      { input: [['fatal'], RETRY_POLICY], expected: { attempts: 1, delays: [], outcome: 'aborted' } },
    ],
  },
  {
    id: 'node-deadline-guarded-fetch',
    number: 10,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Deadline-Guarded Fetch',
    difficulty: 'Easy',
    topic: 'Async Patterns',
    statement:
      'A weather widget calls a slow upstream and must give up after a deadline instead of hanging. Implement `async function fetchWithDeadline(responseMs, deadlineMs)`.\n\n' +
      '- Simulate the upstream call as a promise that resolves to the string `"payload"` after `responseMs` milliseconds (use `setTimeout`).\n' +
      '- Race it against a deadline of `deadlineMs` milliseconds.\n' +
      '- If the response arrives first, resolve to `{ ok: true, value: "payload" }`. If the deadline fires first, resolve to `{ ok: false, error: "deadline of <deadlineMs>ms exceeded" }`.\n' +
      '- Never reject. Whichever timer loses should be cleared so it doesn\'t keep the process alive.\n' +
      '- The two timings always differ by at least 10 ms.',
    functionName: 'fetchWithDeadline',
    functionSignature: 'async function fetchWithDeadline(responseMs, deadlineMs)',
    buggyCode:
      'async function fetchWithDeadline(responseMs, deadlineMs) {\n  // TODO: race the simulated response against a deadline timer\n  return { ok: true, value: \'payload\' };\n}\n',
    solution:
      'async function fetchWithDeadline(responseMs, deadlineMs) {\n' +
      '  let responseTimer;\n' +
      '  let deadlineTimer;\n' +
      '  const response = new Promise((resolve) => {\n' +
      '    responseTimer = setTimeout(() => resolve({ ok: true, value: \'payload\' }), responseMs);\n' +
      '  });\n' +
      '  const deadline = new Promise((resolve) => {\n' +
      '    deadlineTimer = setTimeout(() => resolve({ ok: false, error: \'deadline of \' + deadlineMs + \'ms exceeded\' }), deadlineMs);\n' +
      '  });\n' +
      '  const winner = await Promise.race([response, deadline]);\n' +
      '  clearTimeout(responseTimer);\n' +
      '  clearTimeout(deadlineTimer);\n' +
      '  return winner;\n' +
      '}\n',
    hint: 'Promise.race resolves with the first settled promise; keep both timer handles so you can clearTimeout the loser.',
    explanation:
      'A timeout wrapper is `Promise.race` between the real work and a timer, but the part people skip is cleanup: the losing timer still fires later, keeping the event loop alive and potentially calling callbacks on a finished request. Resolving (not rejecting) with a tagged result keeps callers from needing try/catch for a routine condition. In production you would also pass an `AbortSignal` to actually cancel the upstream call.',
    examples: [
      { input: [10, 40], expected: { ok: true, value: 'payload' } },
      { input: [40, 10], expected: { ok: false, error: 'deadline of 10ms exceeded' } },
    ],
    hiddenTests: [
      { input: [0, 30], expected: { ok: true, value: 'payload' } },
      { input: [30, 45], expected: { ok: true, value: 'payload' } },
      { input: [45, 20], expected: { ok: false, error: 'deadline of 20ms exceeded' } },
      { input: [25, 5], expected: { ok: false, error: 'deadline of 5ms exceeded' } },
    ],
  },
  {
    id: 'node-invoice-batch-rounds',
    number: 11,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Invoice Batch Rounds',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A billing job generates invoices in rounds: up to `size` invoices in parallel, and the next round starts only when the whole current round has finished. Implement `async function runInRounds(jobs, size)`.\n\n' +
      '- `jobs` is an array of `{ id, ms }`; processing a job means waiting `ms` milliseconds via `setTimeout`.\n' +
      '- Take jobs in array order, `size` at a time. Within a round all jobs run concurrently; rounds run strictly one after another.\n' +
      '- Resolve to `{ completed, rounds }` where `completed` lists ids in the order they finished and `rounds` is the number of rounds executed (`0` for no jobs).\n' +
      '- Within a round timings differ by at least 4 ms, so completion order is deterministic.',
    functionName: 'runInRounds',
    functionSignature: 'async function runInRounds(jobs, size)',
    buggyCode:
      'async function runInRounds(jobs, size) {\n  // TODO: slice jobs into rounds of `size`, run each round with Promise.all, sequentially\n  return { completed: [], rounds: 0 };\n}\n',
    solution:
      'async function runInRounds(jobs, size) {\n' +
      '  const completed = [];\n' +
      '  let rounds = 0;\n' +
      '  for (let start = 0; start < jobs.length; start += size) {\n' +
      '    const round = jobs.slice(start, start + size);\n' +
      '    rounds++;\n' +
      '    await Promise.all(\n' +
      '      round.map(\n' +
      '        (job) =>\n' +
      '          new Promise((resolve) =>\n' +
      '            setTimeout(() => {\n' +
      '              completed.push(job.id);\n' +
      '              resolve();\n' +
      '            }, job.ms),\n' +
      '          ),\n' +
      '      ),\n' +
      '    );\n' +
      '  }\n' +
      '  return { completed, rounds };\n' +
      '}\n',
    hint: 'A for-loop with `await Promise.all(round)` inside gives you parallel-within, sequential-between. Don\'t map the rounds — map creates every promise immediately.',
    explanation:
      'This is the difference between `for … await` and `.map` + `Promise.all`: the loop serialises rounds, while `Promise.all` parallelises the jobs inside one. Chunked parallelism is the everyday compromise when a fully parallel run would exhaust connections and a fully serial run would take hours. The subtle trap is building all the promises up front (via `map`), which starts every job immediately and defeats the batching.',
    examples: [
      { input: [ROUND_JOBS, 2], expected: { completed: ['B', 'A', 'C', 'D', 'E'], rounds: 3 } },
      { input: [ROUND_JOBS, 5], expected: { completed: ['E', 'B', 'C', 'D', 'A'], rounds: 1 } },
    ],
    hiddenTests: [
      { input: [ROUND_JOBS, 1], expected: { completed: ['A', 'B', 'C', 'D', 'E'], rounds: 5 } },
      { input: [[], 3], expected: { completed: [], rounds: 0 } },
      { input: [[{ id: 'A', ms: 10 }, { id: 'B', ms: 25 }, { id: 'C', ms: 5 }], 2], expected: { completed: ['A', 'B', 'C'], rounds: 2 } },
      { input: [ROUND_JOBS, 3], expected: { completed: ['B', 'C', 'A', 'E', 'D'], rounds: 2 } },
    ],
  },
  {
    id: 'node-typeahead-event-coalescer',
    number: 12,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Typeahead Event Coalescer',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A recipe search box fires a keystroke event stream and the backend team wants a pure, replayable model of debounce and throttle. Implement `coalesceEvents(events, mode, waitMs)`.\n\n' +
      '- `events` is an array of `{ t, q }` sorted by `t` (milliseconds); `mode` is `"debounce"` or `"throttle"`.\n' +
      '- `debounce` (trailing edge): every event restarts a `waitMs` timer. An event fires when the next event arrives `waitMs` or more after it (or when it is the last event). Its fire time is `t + waitMs`.\n' +
      '- `throttle` (leading edge): an event fires immediately (`at: t`) if it is the first event or if `t - lastFiredT >= waitMs`; otherwise it is dropped.\n' +
      '- Return an array of `{ at, q }` for the events that fired, in order. An empty input returns `[]`.',
    functionName: 'coalesceEvents',
    functionSignature: 'function coalesceEvents(events, mode, waitMs)',
    buggyCode:
      'function coalesceEvents(events, mode, waitMs) {\n  // TODO: replay the stream and emit { at, q } for debounce (trailing) or throttle (leading)\n  return events.map((e) => ({ at: e.t, q: e.q }));\n}\n',
    solution:
      'function coalesceEvents(events, mode, waitMs) {\n' +
      '  const fired = [];\n' +
      '  if (mode === \'debounce\') {\n' +
      '    for (let i = 0; i < events.length; i++) {\n' +
      '      const cur = events[i];\n' +
      '      const next = events[i + 1];\n' +
      '      if (!next || next.t - cur.t >= waitMs) fired.push({ at: cur.t + waitMs, q: cur.q });\n' +
      '    }\n' +
      '  } else {\n' +
      '    let lastFired = null;\n' +
      '    for (const e of events) {\n' +
      '      if (lastFired === null || e.t - lastFired >= waitMs) {\n' +
      '        fired.push({ at: e.t, q: e.q });\n' +
      '        lastFired = e.t;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return fired;\n' +
      '}\n',
    hint: 'For debounce, an event survives iff the gap to the NEXT event is >= waitMs (or there is no next event). For throttle, compare against the last time you actually fired, not the last event.',
    explanation:
      'Debounce waits for silence and emits the last value; throttle emits the first value and then ignores the burst. Modelling them over injected timestamps instead of real timers makes the policy deterministic and testable, which is exactly how you would unit-test a rate-limiting or autosave layer. The common throttle bug is measuring from the previous event rather than the previous emission, which lets a steady stream of near-together events suppress output forever.',
    examples: [
      { input: [TYPE_EVENTS, 'debounce', 200], expected: [{ at: 280, q: 'pas' }, { at: 610, q: 'pasta' }] },
      { input: [TYPE_EVENTS, 'throttle', 200], expected: [{ at: 0, q: 'p' }, { at: 400, q: 'past' }] },
    ],
    hiddenTests: [
      { input: [[], 'debounce', 100], expected: [] },
      { input: [TYPE_EVENTS, 'debounce', 40], expected: [{ at: 40, q: 'p' }, { at: 120, q: 'pas' }, { at: 450, q: 'pasta' }] },
      { input: [TYPE_EVENTS, 'throttle', 30], expected: [{ at: 0, q: 'p' }, { at: 50, q: 'pa' }, { at: 80, q: 'pas' }, { at: 400, q: 'past' }] },
      { input: [[{ t: 0, q: 'a' }, { t: 100, q: 'b' }], 'debounce', 100], expected: [{ at: 100, q: 'a' }, { at: 200, q: 'b' }] },
      { input: [[{ t: 7, q: 'solo' }], 'debounce', 500], expected: [{ at: 507, q: 'solo' }] },
      { input: [[{ t: 0, q: 'a' }, { t: 10, q: 'b' }, { t: 20, q: 'c' }], 'throttle', 1000], expected: [{ at: 0, q: 'a' }] },
    ],
  },
  {
    id: 'node-label-printer-serial-queue',
    number: 13,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Label Printer Serial Queue',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A warehouse label printer can only print one label at a time, but jobs are submitted from many places. Implement `async function printSerially(jobs)` that models a FIFO async queue.\n\n' +
      '- Each job is `{ id, submitAt, ms }`. Use `setTimeout` to submit the job to the queue `submitAt` milliseconds after the function is called; jobs with equal `submitAt` are submitted in array order.\n' +
      '- The queue runs one job at a time in submission order. Running a job means waiting `ms` milliseconds. A job submitted while another is printing must wait for everything ahead of it.\n' +
      '- Resolve once every job has printed, with `{ order, peak }`: `order` is the ids in completion order and `peak` is the maximum number of jobs printing at the same moment (`1` whenever there is at least one job, `0` for none).\n' +
      '- Timings are chosen so that the naive "run each job as soon as it is submitted" gives a different `order`.',
    functionName: 'printSerially',
    functionSignature: 'async function printSerially(jobs)',
    buggyCode:
      'async function printSerially(jobs) {\n  // TODO: submit each job at submitAt, chain executions so they never overlap\n  return { order: [], peak: 0 };\n}\n',
    solution:
      'async function printSerially(jobs) {\n' +
      '  let tail = Promise.resolve();\n' +
      '  let active = 0;\n' +
      '  let peak = 0;\n' +
      '  const order = [];\n' +
      '  const enqueue = (job) => {\n' +
      '    const run = tail.then(async () => {\n' +
      '      active++;\n' +
      '      peak = Math.max(peak, active);\n' +
      '      await new Promise((resolve) => setTimeout(resolve, job.ms));\n' +
      '      active--;\n' +
      '      order.push(job.id);\n' +
      '    });\n' +
      '    tail = run;\n' +
      '    return run;\n' +
      '  };\n' +
      '  const submissions = jobs.map(\n' +
      '    (job) => new Promise((resolve) => setTimeout(() => resolve(enqueue(job)), job.submitAt)),\n' +
      '  );\n' +
      '  await Promise.all(submissions);\n' +
      '  return { order, peak };\n' +
      '}\n',
    hint: 'Keep a `tail` promise; each enqueue does `tail = tail.then(run)`. That single chain is the whole queue.',
    explanation:
      'A serial async queue is one promise chain: every new job is appended with `.then` to the previous tail, so it cannot begin until everything before it settles — no locks, no polling. This pattern serialises writes to a single resource (a printer, a file, a SQLite connection, a rate-limited API) while still letting callers submit from anywhere. The bug the tests expose is starting a job immediately on submission, which lets short jobs overtake long ones and interleave output.',
    examples: [
      {
        input: [[{ id: 'A', submitAt: 0, ms: 30 }, { id: 'B', submitAt: 5, ms: 5 }, { id: 'C', submitAt: 10, ms: 5 }]],
        expected: { order: ['A', 'B', 'C'], peak: 1 },
      },
      { input: [[{ id: 'A', submitAt: 10, ms: 20 }, { id: 'B', submitAt: 0, ms: 5 }]], expected: { order: ['B', 'A'], peak: 1 } },
    ],
    hiddenTests: [
      { input: [[]], expected: { order: [], peak: 0 } },
      { input: [[{ id: 'A', submitAt: 0, ms: 10 }, { id: 'B', submitAt: 20, ms: 10 }]], expected: { order: ['A', 'B'], peak: 1 } },
      {
        input: [[{ id: 'A', submitAt: 0, ms: 5 }, { id: 'B', submitAt: 0, ms: 5 }, { id: 'C', submitAt: 0, ms: 5 }]],
        expected: { order: ['A', 'B', 'C'], peak: 1 },
      },
      {
        input: [[{ id: 'A', submitAt: 0, ms: 25 }, { id: 'B', submitAt: 2, ms: 1 }, { id: 'C', submitAt: 4, ms: 1 }, { id: 'D', submitAt: 6, ms: 1 }]],
        expected: { order: ['A', 'B', 'C', 'D'], peak: 1 },
      },
    ],
  },
  {
    id: 'node-export-job-cancel-token',
    number: 14,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Export Job Cancel Token',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A reporting service runs multi-step export jobs that users can cancel. Implement `async function runExport(steps, cancelAfterMs)` using a cooperative cancellation token.\n\n' +
      '- `steps` is an array of `{ name, ms }` executed strictly in order; running a step means waiting `ms` milliseconds via `setTimeout`.\n' +
      '- Create a token `{ cancelled: false }`. If `cancelAfterMs` is a number, schedule the token to be cancelled after that many milliseconds; `null` means never.\n' +
      '- Before STARTING each step, check the token. If it is cancelled, stop: the remaining steps are skipped. A step that is already running always finishes (cooperative cancellation).\n' +
      '- Resolve to `{ completed, skipped, cancelled }` — the names of steps that ran, the names that were skipped, and whether the job stopped early.\n' +
      '- If all steps finish before the cancel timer fires, clear that timer and report `cancelled: false`.\n' +
      '- Timings are at least 10 ms away from any step boundary.',
    functionName: 'runExport',
    functionSignature: 'async function runExport(steps, cancelAfterMs)',
    buggyCode:
      'async function runExport(steps, cancelAfterMs) {\n  // TODO: create a token, arm the cancel timer, run steps checking the token before each\n  return { completed: steps.map((s) => s.name), skipped: [], cancelled: false };\n}\n',
    solution:
      'async function runExport(steps, cancelAfterMs) {\n' +
      '  const token = { cancelled: false };\n' +
      '  let timer = null;\n' +
      '  if (typeof cancelAfterMs === \'number\') {\n' +
      '    timer = setTimeout(() => {\n' +
      '      token.cancelled = true;\n' +
      '    }, cancelAfterMs);\n' +
      '  }\n' +
      '  const completed = [];\n' +
      '  const skipped = [];\n' +
      '  for (const step of steps) {\n' +
      '    if (token.cancelled) {\n' +
      '      skipped.push(step.name);\n' +
      '      continue;\n' +
      '    }\n' +
      '    await new Promise((resolve) => setTimeout(resolve, step.ms));\n' +
      '    completed.push(step.name);\n' +
      '  }\n' +
      '  if (timer !== null) clearTimeout(timer);\n' +
      '  return { completed, skipped, cancelled: token.cancelled };\n' +
      '}\n',
    hint: 'The token is just a mutable flag the timer flips; the loop reads it before each step. Nothing "interrupts" a running step.',
    explanation:
      'JavaScript promises cannot be forcibly aborted, so cancellation is cooperative: work checks a shared token at safe points and exits early. That is the model behind `AbortController`, and the important consequence is that an in-flight step completes — you design steps to be small and idempotent so a cancel arrives quickly and safely. Clearing the timer on normal completion avoids flipping a token that a later, unrelated job might still be looking at.',
    examples: [
      { input: [EXPORT_STEPS, null], expected: { completed: ['gather', 'render', 'upload'], skipped: [], cancelled: false } },
      { input: [EXPORT_STEPS, 30], expected: { completed: ['gather', 'render'], skipped: ['upload'], cancelled: true } },
    ],
    hiddenTests: [
      { input: [EXPORT_STEPS, 5], expected: { completed: ['gather'], skipped: ['render', 'upload'], cancelled: true } },
      { input: [EXPORT_STEPS, 100], expected: { completed: ['gather', 'render', 'upload'], skipped: [], cancelled: false } },
      { input: [[], 10], expected: { completed: [], skipped: [], cancelled: false } },
      {
        input: [[{ name: 'a', ms: 20 }, { name: 'b', ms: 20 }, { name: 'c', ms: 20 }, { name: 'd', ms: 20 }], 50],
        expected: { completed: ['a', 'b', 'c'], skipped: ['d'], cancelled: true },
      },
    ],
  },
  {
    id: 'node-newsletter-send-settle',
    number: 15,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Newsletter Send Settlement',
    difficulty: 'Easy',
    topic: 'Async Patterns',
    statement:
      'A newsletter service sends to many recipients at once and must report every result — a single bounce must not hide the successes. Implement `async function sendAll(recipients)`.\n\n' +
      '- Each recipient is `{ email, ms, bounce }`. Sending means waiting `ms` milliseconds via `setTimeout`, then resolving to `"sent:" + email`, or rejecting with `Error("bounced:" + email)` when `bounce` is true.\n' +
      '- Start all sends concurrently.\n' +
      '- Resolve to `{ outcomes, sent, failed }` where `outcomes[i]` describes recipient `i` as `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` (`reason` is the error message string), and `sent` / `failed` are the counts.\n' +
      '- The function itself must never reject.',
    functionName: 'sendAll',
    functionSignature: 'async function sendAll(recipients)',
    buggyCode:
      'async function sendAll(recipients) {\n  // TODO: send concurrently, collect every outcome in input order\n  return { outcomes: [], sent: 0, failed: 0 };\n}\n',
    solution:
      'async function sendAll(recipients) {\n' +
      '  const send = (r) =>\n' +
      '    new Promise((resolve, reject) =>\n' +
      '      setTimeout(() => (r.bounce ? reject(new Error(\'bounced:\' + r.email)) : resolve(\'sent:\' + r.email)), r.ms),\n' +
      '    );\n' +
      '  const outcomes = await Promise.all(\n' +
      '    recipients.map((r) =>\n' +
      '      send(r).then(\n' +
      '        (value) => ({ status: \'fulfilled\', value }),\n' +
      '        (err) => ({ status: \'rejected\', reason: err.message }),\n' +
      '      ),\n' +
      '    ),\n' +
      '  );\n' +
      '  const sent = outcomes.filter((o) => o.status === \'fulfilled\').length;\n' +
      '  return { outcomes, sent, failed: outcomes.length - sent };\n' +
      '}\n',
    hint: 'Wrap each send so it always resolves — `.then(ok => ..., err => ...)` — and then Promise.all the wrappers.',
    explanation:
      'Plain `Promise.all` fails fast: one rejection discards every other result. Mapping each promise through a two-armed `.then` converts failures into values, which is precisely what `Promise.allSettled` does internally. Fan-out jobs like email, push notifications and cache invalidation need this so you can report partial success and retry only the failures.',
    examples: [
      {
        input: [[{ email: 'a@x.io', ms: 5, bounce: false }, { email: 'b@x.io', ms: 1, bounce: true }]],
        expected: { outcomes: [{ status: 'fulfilled', value: 'sent:a@x.io' }, { status: 'rejected', reason: 'bounced:b@x.io' }], sent: 1, failed: 1 },
      },
      { input: [[]], expected: { outcomes: [], sent: 0, failed: 0 } },
    ],
    hiddenTests: [
      {
        input: [[{ email: 'c@x.io', ms: 2, bounce: true }, { email: 'd@x.io', ms: 1, bounce: true }]],
        expected: { outcomes: [{ status: 'rejected', reason: 'bounced:c@x.io' }, { status: 'rejected', reason: 'bounced:d@x.io' }], sent: 0, failed: 2 },
      },
      {
        input: [[{ email: 'e@x.io', ms: 10, bounce: false }, { email: 'f@x.io', ms: 1, bounce: false }, { email: 'g@x.io', ms: 5, bounce: true }]],
        expected: {
          outcomes: [
            { status: 'fulfilled', value: 'sent:e@x.io' },
            { status: 'fulfilled', value: 'sent:f@x.io' },
            { status: 'rejected', reason: 'bounced:g@x.io' },
          ],
          sent: 2,
          failed: 1,
        },
      },
      { input: [[{ email: 'h@x.io', ms: 3, bounce: false }]], expected: { outcomes: [{ status: 'fulfilled', value: 'sent:h@x.io' }], sent: 1, failed: 0 } },
    ],
  },

  // ==========================================================================
  // Data & Streams (16–20)
  // ==========================================================================
  {
    id: 'node-telemetry-chunk-line-splitter',
    number: 16,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Telemetry Chunk Line Splitter',
    difficulty: 'Medium',
    topic: 'Data & Streams',
    statement:
      'A greenhouse sensor gateway streams text in arbitrary chunks; line boundaries can fall anywhere, including between `\\r` and `\\n`. Implement `splitChunks(chunks)` returning the complete lines.\n\n' +
      '- `chunks` is an array of strings in arrival order (some may be empty).\n' +
      '- A line ends at `\\n`; a `\\r` immediately before that `\\n` is part of the terminator, not the line. A `\\r` NOT followed by `\\n` is ordinary content.\n' +
      '- Lines may span several chunks. Empty lines in the middle of the stream are emitted as `""`.\n' +
      '- After the last chunk, emit whatever is buffered as a final line if it is non-empty; if the stream ends right after a terminator, emit nothing extra.',
    functionName: 'splitChunks',
    functionSignature: 'function splitChunks(chunks)',
    buggyCode:
      'function splitChunks(chunks) {\n  // TODO: keep a carry-over buffer between chunks, emit lines on "\\n", strip a trailing "\\r"\n  return chunks.join(\'\').split(\'\\n\');\n}\n',
    solution:
      'function splitChunks(chunks) {\n' +
      '  const lines = [];\n' +
      '  let buffer = \'\';\n' +
      '  for (const chunk of chunks) {\n' +
      '    buffer += chunk;\n' +
      '    let idx;\n' +
      '    while ((idx = buffer.indexOf(\'\\n\')) !== -1) {\n' +
      '      let line = buffer.slice(0, idx);\n' +
      '      if (line.endsWith(\'\\r\')) line = line.slice(0, -1);\n' +
      '      lines.push(line);\n' +
      '      buffer = buffer.slice(idx + 1);\n' +
      '    }\n' +
      '  }\n' +
      '  if (buffer.length) lines.push(buffer);\n' +
      '  return lines;\n' +
      '}\n',
    hint: 'Never split a chunk on its own — append it to a buffer, drain complete lines from the buffer, and keep the remainder for the next chunk.',
    explanation:
      'Stream data has no respect for your record boundaries, so a line reader must carry the incomplete tail from one chunk into the next and flush it at end-of-stream. Draining the buffer with `indexOf("\\n")` and stripping a trailing `\\r` per line handles CRLF even when the two bytes arrive separately. Joining everything and splitting once (the starter) works for small inputs but defeats streaming — memory grows with the whole payload.',
    examples: [
      { input: [['temp=2', '1\nhum=40\n']], expected: ['temp=21', 'hum=40'] },
      { input: [['a\r', '\nb\r\nc']], expected: ['a', 'b', 'c'] },
    ],
    hiddenTests: [
      { input: [['no newline at all']], expected: ['no newline at all'] },
      { input: [[]], expected: [] },
      { input: [['x\n', '\n', 'y']], expected: ['x', '', 'y'] },
      { input: [['', 'a\nb', '', '\n']], expected: ['a', 'b'] },
      { input: [['line\r', 'still\n']], expected: ['line\rstill'] },
      { input: [['\n']], expected: [''] },
    ],
  },
  {
    id: 'node-ledger-ndjson-rollup',
    number: 17,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Ledger NDJSON Rollup',
    difficulty: 'Easy',
    topic: 'Data & Streams',
    statement:
      'A café\'s point-of-sale exports its ledger as newline-delimited JSON. Implement `rollupNdjson(text)` that totals it while tolerating bad lines.\n\n' +
      '- Split `text` on `\\n`, trim each line, and skip blank lines entirely (they are neither accepted nor rejected).\n' +
      '- Parse each remaining line as JSON. A line is ACCEPTED only if it parses to a non-null object (not an array) with a string `type` and a number `amount`. Anything else — invalid JSON, arrays, `null`, missing or wrongly-typed fields — is REJECTED.\n' +
      '- Return `{ byType, total, accepted, rejected }` where `byType` maps each `type` to the sum of its amounts, `total` is the sum of all accepted amounts, and `accepted` / `rejected` are counts.',
    functionName: 'rollupNdjson',
    functionSignature: 'function rollupNdjson(text)',
    buggyCode:
      'function rollupNdjson(text) {\n  // TODO: parse line by line, validate shape, accumulate totals\n  return { byType: {}, total: 0, accepted: 0, rejected: 0 };\n}\n',
    solution:
      'function rollupNdjson(text) {\n' +
      '  const byType = {};\n' +
      '  let total = 0;\n' +
      '  let accepted = 0;\n' +
      '  let rejected = 0;\n' +
      '  for (const raw of text.split(\'\\n\')) {\n' +
      '    const line = raw.trim();\n' +
      '    if (!line) continue;\n' +
      '    let rec;\n' +
      '    try {\n' +
      '      rec = JSON.parse(line);\n' +
      '    } catch (e) {\n' +
      '      rejected++;\n' +
      '      continue;\n' +
      '    }\n' +
      '    const valid = rec !== null && typeof rec === \'object\' && !Array.isArray(rec) && typeof rec.type === \'string\' && typeof rec.amount === \'number\';\n' +
      '    if (!valid) {\n' +
      '      rejected++;\n' +
      '      continue;\n' +
      '    }\n' +
      '    byType[rec.type] = (byType[rec.type] || 0) + rec.amount;\n' +
      '    total += rec.amount;\n' +
      '    accepted++;\n' +
      '  }\n' +
      '  return { byType, total, accepted, rejected };\n' +
      '}\n',
    hint: 'typeof null === "object" and arrays are objects too — check both explicitly before reading fields.',
    explanation:
      'NDJSON is popular for logs and exports precisely because each line is independently parseable, so one corrupt record cannot poison the file. The processing loop mirrors that: try/catch per line, an explicit shape check, and separate accepted/rejected counters so operators can see data-quality problems instead of silently summing garbage. The `null`/array checks matter because `JSON.parse` happily returns both.',
    examples: [
      {
        input: ['{"type":"sale","amount":500}\n{"type":"refund","amount":-120}\n{"type":"sale","amount":250}\n'],
        expected: { byType: { sale: 750, refund: -120 }, total: 630, accepted: 3, rejected: 0 },
      },
      {
        input: ['{"type":"sale","amount":100}\nnot json\n{"type":"sale"}\n\n{"amount":5}\n[1,2]\n'],
        expected: { byType: { sale: 100 }, total: 100, accepted: 1, rejected: 4 },
      },
    ],
    hiddenTests: [
      { input: [''], expected: { byType: {}, total: 0, accepted: 0, rejected: 0 } },
      { input: ['  {"type":"tip","amount":30}  \r\n{"type":"tip","amount":"30"}'], expected: { byType: { tip: 30 }, total: 30, accepted: 1, rejected: 1 } },
      { input: ['null\n{"type":"fee","amount":0}'], expected: { byType: { fee: 0 }, total: 0, accepted: 1, rejected: 1 } },
      { input: ['\n\n\n'], expected: { byType: {}, total: 0, accepted: 0, rejected: 0 } },
      { input: ['{"type":42,"amount":1}\n{"type":"x","amount":1.5}'], expected: { byType: { x: 1.5 }, total: 1.5, accepted: 1, rejected: 1 } },
    ],
  },
  {
    id: 'node-sensor-window-flusher',
    number: 18,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Sensor Window Flusher',
    difficulty: 'Medium',
    topic: 'Data & Streams',
    statement:
      'A greenhouse ingests sensor readings and rolls them into tumbling time windows, but memory is tight, so a window also flushes early when its buffer hits a high-water mark. Implement `flushWindows(readings, windowMs, highWater)`.\n\n' +
      '- `readings` is an array of `{ t, v }` in non-decreasing `t`. A reading belongs to the window starting at `Math.floor(t / windowMs) * windowMs`.\n' +
      '- Keep one buffer for the current window. When a reading arrives whose window start differs from the buffer\'s, flush the buffer first with `reason: "window"`, then start a new buffer.\n' +
      '- After adding a reading, if the buffer now holds `highWater` readings, flush it immediately with `reason: "capacity"`. Later readings for the same window start a fresh buffer with the same `start`.\n' +
      '- After the last reading, flush a non-empty buffer with `reason: "end"`.\n' +
      '- Each flush emits `{ start, count, sum, reason }` (`sum` of `v`). Return the emitted objects in order; `[]` for no readings.',
    functionName: 'flushWindows',
    functionSignature: 'function flushWindows(readings, windowMs, highWater)',
    buggyCode:
      'function flushWindows(readings, windowMs, highWater) {\n  // TODO: bucket by window start, flush on window change, on reaching highWater, and at the end\n  return [];\n}\n',
    solution:
      'function flushWindows(readings, windowMs, highWater) {\n' +
      '  const out = [];\n' +
      '  let buf = null;\n' +
      '  const flush = (reason) => {\n' +
      '    if (buf && buf.count > 0) out.push({ start: buf.start, count: buf.count, sum: buf.sum, reason });\n' +
      '    buf = null;\n' +
      '  };\n' +
      '  for (const r of readings) {\n' +
      '    const start = Math.floor(r.t / windowMs) * windowMs;\n' +
      '    if (buf && buf.start !== start) flush(\'window\');\n' +
      '    if (!buf) buf = { start, count: 0, sum: 0 };\n' +
      '    buf.count++;\n' +
      '    buf.sum += r.v;\n' +
      '    if (buf.count >= highWater) flush(\'capacity\');\n' +
      '  }\n' +
      '  flush(\'end\');\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Three flush triggers, one flush function: window changed (before adding), capacity reached (after adding), and end of input.',
    explanation:
      'This is a windowed aggregation with backpressure: time closes a window, but a capacity limit bounds memory when the producer bursts. Centralising the emit logic in one `flush(reason)` and calling it from all three triggers keeps the state machine tiny and makes the "why did this flush" reason visible downstream. Stream processors like Kafka Streams and Flink expose the same triggers — time, count, and end-of-stream — for exactly this reason.',
    examples: [
      {
        input: [[{ t: 0, v: 1 }, { t: 10, v: 1 }, { t: 120, v: 1 }, { t: 130, v: 1 }, { t: 140, v: 1 }, { t: 150, v: 1 }, { t: 260, v: 1 }], 100, 3],
        expected: [
          { start: 0, count: 2, sum: 2, reason: 'window' },
          { start: 100, count: 3, sum: 3, reason: 'capacity' },
          { start: 100, count: 1, sum: 1, reason: 'window' },
          { start: 200, count: 1, sum: 1, reason: 'end' },
        ],
      },
      { input: [[{ t: 5, v: 2 }, { t: 7, v: 3 }, { t: 205, v: 10 }], 100, 10], expected: [{ start: 0, count: 2, sum: 5, reason: 'window' }, { start: 200, count: 1, sum: 10, reason: 'end' }] },
    ],
    hiddenTests: [
      { input: [[], 100, 3], expected: [] },
      { input: [[{ t: 50, v: 7 }], 100, 3], expected: [{ start: 0, count: 1, sum: 7, reason: 'end' }] },
      { input: [[{ t: 1, v: 1 }, { t: 2, v: 2 }], 100, 1], expected: [{ start: 0, count: 1, sum: 1, reason: 'capacity' }, { start: 0, count: 1, sum: 2, reason: 'capacity' }] },
      { input: [[{ t: 0, v: 1 }, { t: 1, v: 1 }, { t: 2, v: 1 }], 100, 2], expected: [{ start: 0, count: 2, sum: 2, reason: 'capacity' }, { start: 0, count: 1, sum: 1, reason: 'end' }] },
      { input: [[{ t: 99, v: 4 }, { t: 100, v: 6 }], 100, 5], expected: [{ start: 0, count: 1, sum: 4, reason: 'window' }, { start: 100, count: 1, sum: 6, reason: 'end' }] },
    ],
  },
  {
    id: 'node-menu-import-csv-parse',
    number: 19,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Menu Import CSV Parser',
    difficulty: 'Hard',
    topic: 'Data & Streams',
    statement:
      'Restaurants upload their menus as CSV, and item names contain commas, quotes and even line breaks. Implement `parseCsv(text)` returning an array of records, each an array of field strings.\n\n' +
      '- Fields are separated by `,`. Records are separated by `\\n` or `\\r\\n`.\n' +
      '- A field may be wrapped in double quotes. Inside quotes, commas and newlines are literal, and a doubled quote `""` stands for one literal `"`.\n' +
      '- Unquoted fields are taken verbatim — do not trim.\n' +
      '- An empty input returns `[]`. A trailing newline at the very end does NOT produce an extra empty record, but an empty line in the middle produces the record `[""]`.\n' +
      '- Do not use a regex-based split; write a character-by-character scanner.',
    functionName: 'parseCsv',
    functionSignature: 'function parseCsv(text)',
    buggyCode:
      'function parseCsv(text) {\n  // TODO: scan characters with an inQuotes flag; handle "" escapes, CRLF, trailing newline\n  return text.split(\'\\n\').map((line) => line.split(\',\'));\n}\n',
    solution:
      'function parseCsv(text) {\n' +
      '  const rows = [];\n' +
      '  if (!text) return rows;\n' +
      '  let row = [];\n' +
      '  let field = \'\';\n' +
      '  let inQuotes = false;\n' +
      '  let i = 0;\n' +
      '  while (i < text.length) {\n' +
      '    const ch = text[i];\n' +
      '    if (inQuotes) {\n' +
      '      if (ch === \'"\') {\n' +
      '        if (text[i + 1] === \'"\') { field += \'"\'; i += 2; continue; }\n' +
      '        inQuotes = false; i++; continue;\n' +
      '      }\n' +
      '      field += ch; i++; continue;\n' +
      '    }\n' +
      '    if (ch === \'"\') { inQuotes = true; i++; continue; }\n' +
      '    if (ch === \',\') { row.push(field); field = \'\'; i++; continue; }\n' +
      '    if (ch === \'\\r\' && text[i + 1] === \'\\n\') { i++; continue; }\n' +
      '    if (ch === \'\\n\') { row.push(field); rows.push(row); row = []; field = \'\'; i++; continue; }\n' +
      '    field += ch; i++;\n' +
      '  }\n' +
      '  if (field.length || row.length || !text.endsWith(\'\\n\')) { row.push(field); rows.push(row); }\n' +
      '  return rows;\n' +
      '}\n',
    hint: 'Track `inQuotes`. While inside quotes, only a `"` is special — and only if the next char is not another `"`.',
    explanation:
      'CSV looks trivial until quoted fields appear; then `split(",")` and `split("\\n")` both break, because the delimiters can legally live inside a field. A two-state scanner (in quotes / not in quotes) handles every case in one pass: `""` inside quotes is an escaped quote, a closing quote ends the field, and record terminators are only honoured outside quotes. The end-of-input rule — flush a pending field unless the text ended on a terminator — is where most hand-written parsers emit a phantom empty row.',
    examples: [
      { input: ['name,price\nCroissant,3.50\n'], expected: [['name', 'price'], ['Croissant', '3.50']] },
      { input: ['item,note\n"Pain, rustique","say ""hi"""\n'], expected: [['item', 'note'], ['Pain, rustique', 'say "hi"']] },
    ],
    hiddenTests: [
      { input: ['"multi\nline",x\r\ny,z'], expected: [['multi\nline', 'x'], ['y', 'z']] },
      { input: [''], expected: [] },
      { input: ['a,,c\n,\n'], expected: [['a', '', 'c'], ['', '']] },
      { input: ['a\n\nb'], expected: [['a'], [''], ['b']] },
      { input: ['x, y ,"z"'], expected: [['x', ' y ', 'z']] },
      { input: ['"a"'], expected: [['a']] },
      { input: ['q,"he said ""go, now"""'], expected: [['q', 'he said "go, now"']] },
    ],
  },
  {
    id: 'node-service-log-line-parse',
    number: 20,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Service Log Line Parser',
    difficulty: 'Easy',
    topic: 'Data & Streams',
    statement:
      'An ops team ships text logs of the form `<timestamp> [<level>] <service>: <message> key=value key=value` and wants them structured. Implement `parseLogLine(line)`.\n\n' +
      '- The line must match `^(\\S+) \\[(\\w+)\\] ([\\w-]+): (.*)$` (timestamp, level, service, rest); otherwise return `null`.\n' +
      '- `level` is returned uppercased.\n' +
      '- Split the rest on single spaces. Walking from the END, each token of the form `key=value` (key matches `\\w+`, value non-empty and containing no spaces) is a field; stop at the first token that is not. Everything before the fields, joined by spaces, is the `message` (`""` if none).\n' +
      '- A field value matching `^-?\\d+(\\.\\d+)?$` becomes a number; all other values stay strings.\n' +
      '- Return `{ ts, level, service, message, fields }`.',
    functionName: 'parseLogLine',
    functionSignature: 'function parseLogLine(line)',
    buggyCode:
      'function parseLogLine(line) {\n  // TODO: match the envelope, then peel key=value tokens off the end of the message\n  return null;\n}\n',
    solution:
      'function parseLogLine(line) {\n' +
      '  const m = /^(\\S+) \\[(\\w+)\\] ([\\w-]+): (.*)$/.exec(line);\n' +
      '  if (!m) return null;\n' +
      '  const tokens = m[4].split(\' \');\n' +
      '  const fields = {};\n' +
      '  let end = tokens.length;\n' +
      '  while (end > 0) {\n' +
      '    const kv = /^(\\w+)=(\\S+)$/.exec(tokens[end - 1]);\n' +
      '    if (!kv) break;\n' +
      '    const value = /^-?\\d+(\\.\\d+)?$/.test(kv[2]) ? Number(kv[2]) : kv[2];\n' +
      '    fields[kv[1]] = value;\n' +
      '    end--;\n' +
      '  }\n' +
      '  return { ts: m[1], level: m[2].toUpperCase(), service: m[3], message: tokens.slice(0, end).join(\' \'), fields };\n' +
      '}\n',
    hint: 'Peel fields from the right and stop at the first non key=value token — that keeps "url=http://x done" in the message.',
    explanation:
      'Log parsing is envelope-then-payload: a strict regex validates the fixed prefix, and the free-text tail is scanned from the right so structured `key=value` fields are separated from prose that happens to contain `=`. Coercing numeric-looking values lets downstream dashboards aggregate `attempt=3` without a second pass. Returning `null` instead of throwing keeps a single malformed line from stalling the ingestion pipeline.',
    examples: [
      {
        input: ['2024-03-01T10:00:00Z [warn] checkout: payment retry attempt=3 user=42'],
        expected: { ts: '2024-03-01T10:00:00Z', level: 'WARN', service: 'checkout', message: 'payment retry', fields: { attempt: 3, user: 42 } },
      },
      { input: ['garbage'], expected: null },
    ],
    hiddenTests: [
      {
        input: ['2024-03-01T10:00:01Z [INFO] api: request done'],
        expected: { ts: '2024-03-01T10:00:01Z', level: 'INFO', service: 'api', message: 'request done', fields: {} },
      },
      {
        input: ['2024-03-01T10:00:02Z [ERROR] billing: charge failed code=card_declined amount=19.99 retry=false'],
        expected: {
          ts: '2024-03-01T10:00:02Z',
          level: 'ERROR',
          service: 'billing',
          message: 'charge failed',
          fields: { code: 'card_declined', amount: 19.99, retry: 'false' },
        },
      },
      {
        input: ['2024-03-01T10:00:03Z [debug] cache-warm: hit=1 miss=0'],
        expected: { ts: '2024-03-01T10:00:03Z', level: 'DEBUG', service: 'cache-warm', message: '', fields: { hit: 1, miss: 0 } },
      },
      {
        input: ['T [INFO] svc: url=http://x.io/a?b=c done'],
        expected: { ts: 'T', level: 'INFO', service: 'svc', message: 'url=http://x.io/a?b=c done', fields: {} },
      },
      { input: ['2024-03-01T10:00:04Z INFO api: no brackets'], expected: null },
    ],
  },

  // ==========================================================================
  // Auth & Security (21–25)
  // ==========================================================================
  {
    id: 'node-gym-pass-token-ops',
    number: 21,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Gym Pass Token Ops',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A gym issues unsigned entry passes shaped like a JWT: `<base64url(header)>.<base64url(payload)>`. Implement `passOps(ops, now)` that processes a list of operations and returns one result per op.\n\n' +
      '- The header is always the JSON string `{"alg":"none","typ":"PASS"}` exactly. base64url = standard base64 (`btoa`) with `+`→`-`, `/`→`_`, and trailing `=` removed. Decoding reverses that and re-adds `=` padding to a multiple of 4 before `atob`.\n' +
      '- `{ op: "issue", payload }` → the token string, using `JSON.stringify(payload)` as-is.\n' +
      '- `{ op: "inspect", token }` → `{ valid: false, reason: "malformed" }` when the token does not have exactly two non-empty dot-separated parts, either part fails to decode/parse, or the payload is not a non-null, non-array object.\n' +
      '  Otherwise, if `payload.exp` is a number and `exp <= now` → `{ valid: false, reason: "expired" }`; else if `payload.nbf` is a number and `nbf > now` → `{ valid: false, reason: "not-yet-valid" }`; else `{ valid: true, sub, ttl }` where `sub` is `payload.sub` (or `null` if absent) and `ttl` is `exp - now` (or `null` when there is no `exp`).\n' +
      '- `now` is a unix timestamp in seconds.',
    functionName: 'passOps',
    functionSignature: 'function passOps(ops, now)',
    buggyCode:
      'function passOps(ops, now) {\n  // TODO: base64url encode/decode with atob/btoa, then apply the expiry rules\n  return ops.map(() => null);\n}\n',
    solution:
      'function passOps(ops, now) {\n' +
      '  const encode = (s) => btoa(s).replace(/\\+/g, \'-\').replace(/\\//g, \'_\').replace(/=+$/, \'\');\n' +
      '  const decode = (s) => {\n' +
      '    const b64 = s.replace(/-/g, \'+\').replace(/_/g, \'/\');\n' +
      '    return atob(b64 + \'=\'.repeat((4 - (b64.length % 4)) % 4));\n' +
      '  };\n' +
      '  const header = encode(JSON.stringify({ alg: \'none\', typ: \'PASS\' }));\n' +
      '  const inspect = (token) => {\n' +
      '    const malformed = { valid: false, reason: \'malformed\' };\n' +
      '    if (typeof token !== \'string\') return malformed;\n' +
      '    const parts = token.split(\'.\');\n' +
      '    if (parts.length !== 2 || !parts[0] || !parts[1]) return malformed;\n' +
      '    let payload;\n' +
      '    try {\n' +
      '      JSON.parse(decode(parts[0]));\n' +
      '      payload = JSON.parse(decode(parts[1]));\n' +
      '    } catch (e) {\n' +
      '      return malformed;\n' +
      '    }\n' +
      '    if (payload === null || typeof payload !== \'object\' || Array.isArray(payload)) return malformed;\n' +
      '    if (typeof payload.exp === \'number\' && payload.exp <= now) return { valid: false, reason: \'expired\' };\n' +
      '    if (typeof payload.nbf === \'number\' && payload.nbf > now) return { valid: false, reason: \'not-yet-valid\' };\n' +
      '    return {\n' +
      '      valid: true,\n' +
      '      sub: payload.sub === undefined ? null : payload.sub,\n' +
      '      ttl: typeof payload.exp === \'number\' ? payload.exp - now : null,\n' +
      '    };\n' +
      '  };\n' +
      '  return ops.map((op) => (op.op === \'issue\' ? header + \'.\' + encode(JSON.stringify(op.payload)) : inspect(op.token)));\n' +
      '}\n',
    hint: 'atob needs padding: append "=" until the length is a multiple of 4. Wrap decode + JSON.parse in one try/catch and return "malformed" from the catch.',
    explanation:
      'JWT-style tokens are just base64url-encoded JSON segments joined by dots; base64url swaps the two URL-unsafe characters and drops padding, so decoding must restore both before calling `atob`. Every parse step can throw on hostile input, so the inspector treats any failure as `malformed` rather than leaking a stack trace. Checking `exp` before `nbf` and comparing against an injected `now` keeps the logic deterministic and mirrors how real validators are unit-tested.',
    examples: [
      { input: [[{ op: 'issue', payload: { sub: 'member-77', exp: 1700003600 } }], 1700000000], expected: [PASS_T1] },
      {
        input: [[{ op: 'inspect', token: PASS_T1 }, { op: 'inspect', token: PASS_T2 }], 1700000000],
        expected: [{ valid: true, sub: 'member-77', ttl: 3600 }, { valid: false, reason: 'expired' }],
      },
    ],
    hiddenTests: [
      { input: [[{ op: 'inspect', token: PASS_T3 }], 1700000000], expected: [{ valid: false, reason: 'not-yet-valid' }] },
      { input: [[{ op: 'inspect', token: PASS_T3 }], 1700008000], expected: [{ valid: true, sub: 'guest-9', ttl: 2000 }] },
      { input: [[{ op: 'inspect', token: PASS_T4 }], 1700000000], expected: [{ valid: true, sub: 'staff-1', ttl: null }] },
      {
        input: [[{ op: 'issue', payload: { sub: 'a?b', exp: 1700000001, tier: '>>' } }, { op: 'inspect', token: PASS_T5 }], 1700000000],
        expected: [PASS_T5, { valid: true, sub: 'a?b', ttl: 1 }],
      },
      {
        input: [
          [
            { op: 'inspect', token: 'nodots' },
            { op: 'inspect', token: PASS_HEADER + '.' },
            { op: 'inspect', token: PASS_BADJSON },
            { op: 'inspect', token: PASS_ARRAY },
            { op: 'inspect', token: PASS_T1 + '.extra' },
          ],
          1700000000,
        ],
        expected: [
          { valid: false, reason: 'malformed' },
          { valid: false, reason: 'malformed' },
          { valid: false, reason: 'malformed' },
          { valid: false, reason: 'malformed' },
          { valid: false, reason: 'malformed' },
        ],
      },
      { input: [[{ op: 'inspect', token: PASS_HEADER + '.e30' }], 5], expected: [{ valid: true, sub: null, ttl: null }] },
    ],
  },
  {
    id: 'node-locker-permission-bits',
    number: 22,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Locker Permission Bits',
    difficulty: 'Easy',
    topic: 'Auth & Security',
    statement:
      'A shared-document service ("lockers") stores each user\'s permissions as a single integer bitmask. Implement `permissionOps(ops)` that applies a list of operations and returns the results of the query ops in order.\n\n' +
      'Bits: `PERMS = { view: 1, comment: 2, edit: 4, share: 8, admin: 16 }` (defined in the starter).\n' +
      '- `{ op: "grant", user, perms }` — OR the listed permission bits into the user\'s mask (a new user starts at `0`). Produces no result.\n' +
      '- `{ op: "revoke", user, perms }` — clear the listed bits. Produces no result.\n' +
      '- `{ op: "can", user, perms }` → `true` if the user\'s mask contains the `admin` bit, or if it contains EVERY listed bit (`(mask & required) === required`); otherwise `false`. An unknown user has mask `0`.\n' +
      '- `{ op: "mask", user }` → the user\'s current integer mask (`0` for unknown).\n' +
      '- Any permission name not in `PERMS` → throw `Error("unknown permission: <name>")`.',
    functionName: 'permissionOps',
    functionSignature: 'function permissionOps(ops)',
    buggyCode:
      'const PERMS = { view: 1, comment: 2, edit: 4, share: 8, admin: 16 };\n\n' +
      'function permissionOps(ops) {\n  // TODO: keep a mask per user; grant = OR, revoke = AND NOT, can = subset check\n  return [];\n}\n',
    solution:
      'const PERMS = { view: 1, comment: 2, edit: 4, share: 8, admin: 16 };\n\n' +
      'function permissionOps(ops) {\n' +
      '  const masks = {};\n' +
      '  const results = [];\n' +
      '  const bits = (names) =>\n' +
      '    names.reduce((acc, name) => {\n' +
      '      if (!(name in PERMS)) throw new Error(\'unknown permission: \' + name);\n' +
      '      return acc | PERMS[name];\n' +
      '    }, 0);\n' +
      '  for (const o of ops) {\n' +
      '    const mask = masks[o.user] || 0;\n' +
      '    if (o.op === \'grant\') masks[o.user] = mask | bits(o.perms);\n' +
      '    else if (o.op === \'revoke\') masks[o.user] = mask & ~bits(o.perms);\n' +
      '    else if (o.op === \'can\') {\n' +
      '      const required = bits(o.perms);\n' +
      '      results.push((mask & PERMS.admin) !== 0 || (mask & required) === required);\n' +
      '    } else if (o.op === \'mask\') results.push(mask);\n' +
      '  }\n' +
      '  return results;\n' +
      '}\n',
    hint: 'Grant is `mask | bits`, revoke is `mask & ~bits`, and "has all of" is `(mask & bits) === bits`.',
    explanation:
      'Bitmasks pack many boolean permissions into one integer that is cheap to store, index and compare — a common interview warm-up because the three operations map directly to `|`, `& ~` and an equality check on `&`. The subset test `(mask & required) === required` is the piece people get wrong by using `!== 0`, which would accept a user holding only one of several required bits. An `admin` short-circuit models super-user roles without special-casing every check.',
    examples: [
      {
        input: [[{ op: 'grant', user: 'ada', perms: ['view', 'edit'] }, { op: 'can', user: 'ada', perms: ['view'] }, { op: 'can', user: 'ada', perms: ['view', 'share'] }, { op: 'mask', user: 'ada' }]],
        expected: [true, false, 5],
      },
      { input: [[{ op: 'grant', user: 'bo', perms: ['admin'] }, { op: 'can', user: 'bo', perms: ['edit', 'share'] }]], expected: [true] },
    ],
    hiddenTests: [
      { input: [[{ op: 'can', user: 'ghost', perms: ['view'] }, { op: 'mask', user: 'ghost' }]], expected: [false, 0] },
      {
        input: [
          [
            { op: 'grant', user: 'c', perms: ['view', 'comment', 'edit'] },
            { op: 'revoke', user: 'c', perms: ['comment'] },
            { op: 'mask', user: 'c' },
            { op: 'can', user: 'c', perms: ['comment'] },
            { op: 'grant', user: 'c', perms: ['comment'] },
            { op: 'mask', user: 'c' },
          ],
        ],
        expected: [5, false, 7],
      },
      { input: [[{ op: 'grant', user: 'd', perms: ['view'] }, { op: 'grant', user: 'd', perms: ['view'] }, { op: 'mask', user: 'd' }]], expected: [1] },
      { input: [[{ op: 'grant', user: 'e', perms: ['admin'] }, { op: 'revoke', user: 'e', perms: ['admin'] }, { op: 'can', user: 'e', perms: ['view'] }]], expected: [false] },
      {
        input: [[{ op: 'grant', user: 'f', perms: ['view', 'edit'] }, { op: 'can', user: 'f', perms: ['edit', 'view'] }, { op: 'can', user: 'f', perms: ['edit', 'comment'] }]],
        expected: [true, false],
      },
    ],
  },
  {
    id: 'node-api-key-token-bucket',
    number: 23,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'API Key Token Bucket',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A maps API throttles each API key with a token bucket. Implement `throttleRequests(requests, config)` that replays a request log and decides each one.\n\n' +
      '- `requests` is an array of `{ key, t }` with `t` in milliseconds, non-decreasing. `config` is `{ capacity, refillPerSecond }`.\n' +
      '- Each key gets its own bucket that starts FULL (`capacity` tokens) at the moment of its first request.\n' +
      '- On every request, first refill: `tokens = min(capacity, tokens + (t - lastT) / 1000 * refillPerSecond)`, then set `lastT = t`.\n' +
      '- If `tokens >= 1`, the request is allowed and consumes one token; otherwise it is denied and consumes nothing.\n' +
      '- Return an array of `{ allowed, remaining }` in request order, where `remaining` is `Math.floor(tokens)` after the decision.',
    functionName: 'throttleRequests',
    functionSignature: 'function throttleRequests(requests, config)',
    buggyCode:
      'function throttleRequests(requests, config) {\n  // TODO: one bucket per key; refill by elapsed time, cap at capacity, spend 1 per allowed request\n  return requests.map(() => ({ allowed: true, remaining: config.capacity }));\n}\n',
    solution:
      'function throttleRequests(requests, config) {\n' +
      '  const buckets = {};\n' +
      '  return requests.map(({ key, t }) => {\n' +
      '    let b = buckets[key];\n' +
      '    if (!b) b = buckets[key] = { tokens: config.capacity, lastT: t };\n' +
      '    b.tokens = Math.min(config.capacity, b.tokens + ((t - b.lastT) / 1000) * config.refillPerSecond);\n' +
      '    b.lastT = t;\n' +
      '    const allowed = b.tokens >= 1;\n' +
      '    if (allowed) b.tokens -= 1;\n' +
      '    return { allowed, remaining: Math.floor(b.tokens) };\n' +
      '  });\n' +
      '}\n',
    hint: 'Refill lazily on each request from the elapsed time — no timers. Cap after refilling, then decide.',
    explanation:
      'A token bucket allows short bursts up to `capacity` while enforcing an average rate of `refillPerSecond`, and the lazy-refill trick (compute tokens from elapsed time at request time) means no background timers and O(1) memory per key. Forgetting the cap lets an idle key accumulate unlimited credit; forgetting to update `lastT` on denied requests double-counts elapsed time. This is the algorithm behind most API gateways\' per-key limits.',
    examples: [
      {
        input: [[{ key: 'k', t: 0 }, { key: 'k', t: 0 }, { key: 'k', t: 0 }, { key: 'k', t: 0 }], { capacity: 3, refillPerSecond: 1 }],
        expected: [{ allowed: true, remaining: 2 }, { allowed: true, remaining: 1 }, { allowed: true, remaining: 0 }, { allowed: false, remaining: 0 }],
      },
      {
        input: [[{ key: 'a', t: 0 }, { key: 'b', t: 0 }, { key: 'a', t: 0 }], { capacity: 3, refillPerSecond: 1 }],
        expected: [{ allowed: true, remaining: 2 }, { allowed: true, remaining: 2 }, { allowed: true, remaining: 1 }],
      },
    ],
    hiddenTests: [
      {
        input: [
          [{ key: 'a', t: 0 }, { key: 'a', t: 0 }, { key: 'a', t: 0 }, { key: 'a', t: 0 }, { key: 'a', t: 500 }, { key: 'a', t: 1000 }],
          { capacity: 3, refillPerSecond: 1 },
        ],
        expected: [
          { allowed: true, remaining: 2 },
          { allowed: true, remaining: 1 },
          { allowed: true, remaining: 0 },
          { allowed: false, remaining: 0 },
          { allowed: false, remaining: 0 },
          { allowed: true, remaining: 0 },
        ],
      },
      {
        input: [[{ key: 'a', t: 0 }, { key: 'a', t: 10000 }], { capacity: 3, refillPerSecond: 1 }],
        expected: [{ allowed: true, remaining: 2 }, { allowed: true, remaining: 2 }],
      },
      { input: [[], { capacity: 3, refillPerSecond: 1 }], expected: [] },
      {
        input: [[{ key: 'a', t: 0 }, { key: 'a', t: 100 }, { key: 'a', t: 600 }], { capacity: 1, refillPerSecond: 2 }],
        expected: [{ allowed: true, remaining: 0 }, { allowed: false, remaining: 0 }, { allowed: true, remaining: 0 }],
      },
      {
        input: [[{ key: 'z', t: 0 }, { key: 'z', t: 0 }, { key: 'z', t: 2000 }], { capacity: 2, refillPerSecond: 1 }],
        expected: [{ allowed: true, remaining: 1 }, { allowed: true, remaining: 0 }, { allowed: true, remaining: 1 }],
      },
    ],
  },
  {
    id: 'node-rider-profile-sanitizer',
    number: 24,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Rider Profile Sanitizer',
    difficulty: 'Easy',
    topic: 'Auth & Security',
    statement:
      'Pedalo lets riders edit their profile from a public form, so every field must be whitelisted and cleaned before it reaches the database. Implement `sanitizeInput(input, schema)`.\n\n' +
      '- `schema` maps allowed field names to `{ type, maxLength?, enum? }` where `type` is `"string"`, `"number"` or `"boolean"`.\n' +
      '- Walk `input`\'s keys in their own order. A key not in the schema is dropped with reason `"unknown"`. A value whose `typeof` differs from `type` is dropped with reason `"type"`.\n' +
      '- Strings are cleaned in this order: trim; if `enum` is set and the trimmed value is not listed, drop with reason `"enum"`; if `maxLength` is set, truncate to that many characters; finally replace `<` with `&lt;` and `>` with `&gt;`.\n' +
      '- Numbers and booleans pass through unchanged. Fields absent from `input` are simply absent from the output.\n' +
      '- Return `{ clean, dropped }` where `dropped` is an array of `{ field, reason }` in input order.',
    functionName: 'sanitizeInput',
    functionSignature: 'function sanitizeInput(input, schema)',
    buggyCode:
      'function sanitizeInput(input, schema) {\n  // TODO: whitelist keys, check types, trim/enum/truncate/escape strings\n  return { clean: input, dropped: [] };\n}\n',
    solution:
      'function sanitizeInput(input, schema) {\n' +
      '  const clean = {};\n' +
      '  const dropped = [];\n' +
      '  for (const field of Object.keys(input)) {\n' +
      '    const rule = schema[field];\n' +
      '    if (!rule) { dropped.push({ field, reason: \'unknown\' }); continue; }\n' +
      '    let value = input[field];\n' +
      '    if (typeof value !== rule.type) { dropped.push({ field, reason: \'type\' }); continue; }\n' +
      '    if (rule.type === \'string\') {\n' +
      '      value = value.trim();\n' +
      '      if (rule.enum && !rule.enum.includes(value)) { dropped.push({ field, reason: \'enum\' }); continue; }\n' +
      '      if (rule.maxLength !== undefined) value = value.slice(0, rule.maxLength);\n' +
      '      value = value.replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\');\n' +
      '    }\n' +
      '    clean[field] = value;\n' +
      '  }\n' +
      '  return { clean, dropped };\n' +
      '}\n',
    hint: 'Iterate the INPUT keys (not the schema) so unknown fields are seen and reported, and check the enum before truncating.',
    explanation:
      'Whitelisting is the safe default for user input: anything not explicitly allowed is discarded, which neutralises mass-assignment attacks where a client adds `role: "admin"` to a form post. Ordering the string pipeline matters — validate the enum on the trimmed raw value, truncate, and escape last so a length cut cannot split an entity. Reporting what was dropped and why makes the API debuggable for legitimate clients without weakening the filter.',
    examples: [
      { input: [{ nickname: '  Ada <3  ', age: 31 }, PROFILE_SCHEMA], expected: { clean: { nickname: 'Ada &lt;3', age: 31 }, dropped: [] } },
      {
        input: [{ nickname: 'x', role: 'admin', age: '31' }, PROFILE_SCHEMA],
        expected: { clean: { nickname: 'x' }, dropped: [{ field: 'role', reason: 'unknown' }, { field: 'age', reason: 'type' }] },
      },
    ],
    hiddenTests: [
      { input: [{ plan: ' pro ', newsletter: 'yes' }, PROFILE_SCHEMA], expected: { clean: { plan: 'pro' }, dropped: [{ field: 'newsletter', reason: 'type' }] } },
      { input: [{ plan: 'enterprise' }, PROFILE_SCHEMA], expected: { clean: {}, dropped: [{ field: 'plan', reason: 'enum' }] } },
      { input: [{ nickname: 'abcdefghijkl<script>' }, PROFILE_SCHEMA], expected: { clean: { nickname: 'abcdefgh' }, dropped: [] } },
      { input: [{}, PROFILE_SCHEMA], expected: { clean: {}, dropped: [] } },
      { input: [{ nickname: '<b>hi</b>', newsletter: false }, PROFILE_SCHEMA], expected: { clean: { nickname: '&lt;b&gt;hi&lt;/b', newsletter: false }, dropped: [] } },
      { input: [{ age: 40, nickname: 7 }, PROFILE_SCHEMA], expected: { clean: { age: 40 }, dropped: [{ field: 'nickname', reason: 'type' }] } },
    ],
  },
  {
    id: 'node-session-cookie-signer',
    number: 25,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Session Cookie Signer',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'Pedalo stores the rider id in a cookie and must detect tampering without a crypto library. The starter provides `DIGESTS`, a table of tiny string-hash functions. Implement `sessionCookieOps(ops, options)` where `options` is `{ secret, digest }` and `digest` names the hash to inject (e.g. `"fnv1a"`).\n\n' +
      '- Resolve `hash = DIGESTS[options.digest]`; if there is no such digest throw `Error("unknown digest: <name>")`.\n' +
      '- `{ op: "sign", value }` → the cookie string `value + "." + hash(value + "." + secret)`.\n' +
      '- `{ op: "verify", cookie }` → split the cookie at its LAST `.` into `value` and `sig` (values may themselves contain dots). If there is no `.`, or the recomputed signature for `value` does not equal `sig` exactly, return `{ ok: false }`; otherwise `{ ok: true, value }`.\n' +
      '- Return one result per op, in order.',
    functionName: 'sessionCookieOps',
    functionSignature: 'function sessionCookieOps(ops, options)',
    buggyCode:
      'const DIGESTS = {\n' +
      '  djb2: (s) => {\n' +
      '    let h = 5381;\n' +
      '    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;\n' +
      '    return h.toString(16);\n' +
      '  },\n' +
      '  fnv1a: (s) => {\n' +
      '    let h = 0x811c9dc5;\n' +
      '    for (let i = 0; i < s.length; i++) {\n' +
      '      h ^= s.charCodeAt(i);\n' +
      '      h = Math.imul(h, 0x01000193) >>> 0;\n' +
      '    }\n' +
      '    return h.toString(16);\n' +
      '  },\n' +
      '};\n\n' +
      'function sessionCookieOps(ops, options) {\n  // TODO: look up the digest, sign as value.sig, verify by splitting at the LAST dot\n  return ops.map(() => null);\n}\n',
    solution:
      'const DIGESTS = {\n' +
      '  djb2: (s) => {\n' +
      '    let h = 5381;\n' +
      '    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;\n' +
      '    return h.toString(16);\n' +
      '  },\n' +
      '  fnv1a: (s) => {\n' +
      '    let h = 0x811c9dc5;\n' +
      '    for (let i = 0; i < s.length; i++) {\n' +
      '      h ^= s.charCodeAt(i);\n' +
      '      h = Math.imul(h, 0x01000193) >>> 0;\n' +
      '    }\n' +
      '    return h.toString(16);\n' +
      '  },\n' +
      '};\n\n' +
      'function sessionCookieOps(ops, options) {\n' +
      '  const hash = DIGESTS[options.digest];\n' +
      '  if (!hash) throw new Error(\'unknown digest: \' + options.digest);\n' +
      '  const signatureFor = (value) => hash(value + \'.\' + options.secret);\n' +
      '  return ops.map((o) => {\n' +
      '    if (o.op === \'sign\') return o.value + \'.\' + signatureFor(o.value);\n' +
      '    const dot = o.cookie.lastIndexOf(\'.\');\n' +
      '    if (dot === -1) return { ok: false };\n' +
      '    const value = o.cookie.slice(0, dot);\n' +
      '    const sig = o.cookie.slice(dot + 1);\n' +
      '    return sig === signatureFor(value) ? { ok: true, value } : { ok: false };\n' +
      '  });\n' +
      '}\n',
    hint: 'Use lastIndexOf(".") so a value like "v1.rider.42" round-trips; recompute the signature from the extracted value and compare the whole string.',
    explanation:
      'A signed cookie is `value.signature` where the signature is a keyed digest of the value; the server never trusts the value until it recomputes and matches the signature. Injecting the hash function keeps the signing logic testable and lets you swap in a real HMAC-SHA256 in production without touching the parsing code. Splitting at the last dot (not the first) is the bug that breaks values containing dots, and a real implementation would use a constant-time comparison to avoid timing leaks.',
    examples: [
      { input: [[{ op: 'sign', value: 'rider:42' }], COOKIE_OPTS], expected: ['rider:42.d74258d5'] },
      {
        input: [[{ op: 'verify', cookie: 'rider:42.d74258d5' }, { op: 'verify', cookie: 'rider:43.d74258d5' }], COOKIE_OPTS],
        expected: [{ ok: true, value: 'rider:42' }, { ok: false }],
      },
    ],
    hiddenTests: [
      { input: [[{ op: 'verify', cookie: 'nodot' }], COOKIE_OPTS], expected: [{ ok: false }] },
      {
        input: [[{ op: 'sign', value: 'v1.rider.42' }, { op: 'verify', cookie: 'v1.rider.42.34be1192' }], COOKIE_OPTS],
        expected: ['v1.rider.42.34be1192', { ok: true, value: 'v1.rider.42' }],
      },
      { input: [[{ op: 'sign', value: 'rider:42' }], { secret: 'pretzel', digest: 'djb2' }], expected: ['rider:42.8faae1ff'] },
      { input: [[{ op: 'verify', cookie: 'rider:42.d74258d5' }], { secret: 'pretzel', digest: 'djb2' }], expected: [{ ok: false }] },
      { input: [[{ op: 'verify', cookie: 'rider:42.d74258d5' }], { secret: 'bagel', digest: 'fnv1a' }], expected: [{ ok: false }] },
      { input: [[{ op: 'verify', cookie: 'rider:42.D74258D5' }], COOKIE_OPTS], expected: [{ ok: false }] },
      { input: [[{ op: 'sign', value: '' }, { op: 'verify', cookie: '.f88f41a1' }], COOKIE_OPTS], expected: ['.f88f41a1', { ok: true, value: '' }] },
    ],
  },
  // ---------------------------------------------------------------- Caching & State
  {
    id: 'node-pantry-freshness-cache',
    number: 26,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Pantry freshness cache with expiry',
    difficulty: 'Medium',
    topic: 'Caching & State',
    statement: `A grocery app caches product freshness lookups, and each entry carries its own time-to-live. The clock is never read from the system — every operation carries the current time so tests stay deterministic.

Implement \`runFreshnessCache(ops)\` where \`ops\` is a list of arrays:
- \`['set', key, value, ttlMs, now]\` — store \`value\` under \`key\`; it expires at \`now + ttlMs\`. Re-setting a key replaces its value and its expiry. Produces no output.
- \`['get', key, now]\` — output the stored value, or \`null\` if the key is absent or \`now >= expiresAt\`. An expired entry found this way is removed.
- \`['sweep', now]\` — remove every entry with \`now >= expiresAt\` and output how many were removed.

Return the list of outputs from \`get\` and \`sweep\` ops, in order. Expiry is inclusive: an entry set at 0 with TTL 100 is already stale at 100.`,
    buggyCode: `function runFreshnessCache(ops) {
  // TODO: keep a Map of { value, expiresAt } and honour each op's clock
  return [];
}`,
    solution: `function runFreshnessCache(ops) {
  const store = new Map();
  const out = [];
  for (const op of ops) {
    if (op[0] === 'set') {
      const [, key, value, ttlMs, now] = op;
      store.set(key, { value, expiresAt: now + ttlMs });
    } else if (op[0] === 'get') {
      const [, key, now] = op;
      const entry = store.get(key);
      if (!entry || now >= entry.expiresAt) {
        if (entry) store.delete(key);
        out.push(null);
      } else {
        out.push(entry.value);
      }
    } else if (op[0] === 'sweep') {
      const now = op[1];
      let removed = 0;
      for (const [key, entry] of store) {
        if (now >= entry.expiresAt) {
          store.delete(key);
          removed++;
        }
      }
      out.push(removed);
    }
  }
  return out;
}`,
    functionName: 'runFreshnessCache',
    functionSignature: 'function runFreshnessCache(ops: any[][]): any[]',
    examples: [
      { input: [[['set', 'milk', 1, 100, 0], ['get', 'milk', 50], ['get', 'milk', 100]]], expected: [1, null] },
      { input: [[['set', 'a', 1, 10, 0], ['set', 'b', 2, 50, 0], ['sweep', 20], ['get', 'b', 30]]], expected: [1, 2] },
    ],
    hiddenTests: [
      { input: [[['get', 'x', 0]]], expected: [null] },
      { input: [[['set', 'a', 1, 10, 0], ['set', 'a', 5, 100, 5], ['get', 'a', 50]]], expected: [5] },
      { input: [[['set', 'a', 1, 10, 0], ['get', 'a', 10], ['sweep', 10]]], expected: [null, 0] },
      {
        input: [[['set', 'a', 1, 10, 0], ['set', 'b', 2, 10, 0], ['set', 'c', 3, 30, 0], ['sweep', 10], ['sweep', 10], ['get', 'c', 29]]],
        expected: [2, 0, 3],
      },
    ],
    hint: 'Store the absolute expiry time, not the TTL — then every check is a single comparison against the clock the op carries.',
    explanation:
      'Each entry records `expiresAt = now + ttlMs` at write time, so reads and sweeps just compare the supplied clock against it. The pitfall is treating expiry as exclusive (`now > expiresAt`) or forgetting that a stale hit must also evict, which lets `sweep` double-count. Injecting the clock is what makes cache behaviour testable in CI without sleeping.',
  },
  {
    id: 'node-shelf-cache-eviction',
    number: 27,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Bounded shelf cache with recency eviction',
    difficulty: 'Medium',
    topic: 'Caching & State',
    statement: `A product-detail service keeps at most \`capacity\` rendered pages in memory. When it is full and a new key arrives, it evicts the page that was touched least recently.

Implement \`runShelfCache(capacity, ops)\` (\`capacity >= 1\`) over ops:
- \`['put', key, value]\` — insert or update. Updating an existing key refreshes its recency. Inserting into a full cache first evicts the least-recently-touched key. Produces no output.
- \`['get', key]\` — output the value (and mark the key most recently touched) or \`null\` on a miss.

Return \`{ results, keys }\` where \`results\` holds the outputs of every \`get\` in order and \`keys\` lists the keys still cached from most-recently-touched to least.`,
    buggyCode: `function runShelfCache(capacity, ops) {
  // TODO: a Map preserves insertion order — re-inserting a key moves it to the end
  return { results: [], keys: [] };
}`,
    solution: `function runShelfCache(capacity, ops) {
  const cache = new Map();
  const results = [];
  for (const [op, key, value] of ops) {
    if (op === 'get') {
      if (!cache.has(key)) {
        results.push(null);
      } else {
        const v = cache.get(key);
        cache.delete(key);
        cache.set(key, v);
        results.push(v);
      }
    } else if (op === 'put') {
      if (cache.has(key)) cache.delete(key);
      else if (cache.size >= capacity) cache.delete(cache.keys().next().value);
      cache.set(key, value);
    }
  }
  return { results, keys: [...cache.keys()].reverse() };
}`,
    functionName: 'runShelfCache',
    functionSignature: 'function runShelfCache(capacity: number, ops: any[][]): { results: any[]; keys: string[] }',
    examples: [
      {
        input: [2, [['put', 'a', 1], ['put', 'b', 2], ['get', 'a'], ['put', 'c', 3], ['get', 'b'], ['get', 'c']]],
        expected: { results: [1, null, 3], keys: ['c', 'a'] },
      },
      {
        input: [1, [['put', 'a', 1], ['put', 'a', 2], ['get', 'a'], ['put', 'b', 3], ['get', 'a']]],
        expected: { results: [2, null], keys: ['b'] },
      },
    ],
    hiddenTests: [
      { input: [3, [['get', 'z']]], expected: { results: [null], keys: [] } },
      {
        input: [2, [['put', 'a', 1], ['put', 'b', 2], ['put', 'a', 9], ['put', 'c', 3], ['get', 'b'], ['get', 'a']]],
        expected: { results: [null, 9], keys: ['a', 'c'] },
      },
      {
        input: [3, [['put', 'a', 1], ['put', 'b', 2], ['put', 'c', 3], ['get', 'a'], ['get', 'b'], ['put', 'd', 4], ['get', 'c']]],
        expected: { results: [1, 2, null], keys: ['d', 'b', 'a'] },
      },
    ],
    hint: 'Delete-then-set on a Map moves a key to the end; the first key in iteration order is always the coldest.',
    explanation:
      'A Map keeps insertion order, so "touching" a key is delete + set and the least-recently-used key is always `map.keys().next().value`. The common mistakes are evicting before checking whether the key already exists (which drops a live entry on an update) and forgetting that a `get` also counts as a touch. Bounded recency caches are the standard answer for hot-object memory limits in services.',
  },
  {
    id: 'node-quote-memo-keys',
    number: 28,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Quote memoization with a field key builder',
    difficulty: 'Easy',
    topic: 'Caching & State',
    statement: `A shipping-quote service is expensive to call, so results are memoized. Two calls are "the same" only when the fields listed in \`keyFields\` match — other fields are ignored.

Implement \`replayQuoteCalls(calls, keyFields)\`:
- For each call object, build its key by taking each field in \`keyFields\` order, converting the value with \`String(...)\`, using \`''\` for fields that are absent, and joining with \`'|'\`.
- The first call with a given key is a miss (\`hit: false\`) and counts as computed; later calls with that key are hits.

Return \`{ computed, trace }\` where \`computed\` is the number of misses and \`trace\` is \`[{ key, hit }]\` in call order. With an empty \`keyFields\`, every call shares the key \`''\`.`,
    buggyCode: `function replayQuoteCalls(calls, keyFields) {
  // TODO: build a stable key per call and track which keys were seen
  return { computed: 0, trace: [] };
}`,
    solution: `function replayQuoteCalls(calls, keyFields) {
  const seen = new Set();
  const trace = [];
  let computed = 0;
  for (const call of calls) {
    const key = keyFields.map((f) => (f in call ? String(call[f]) : '')).join('|');
    const hit = seen.has(key);
    if (!hit) {
      seen.add(key);
      computed++;
    }
    trace.push({ key, hit });
  }
  return { computed, trace };
}`,
    functionName: 'replayQuoteCalls',
    functionSignature: 'function replayQuoteCalls(calls: object[], keyFields: string[]): { computed: number; trace: { key: string; hit: boolean }[] }',
    examples: [
      {
        input: [[{ from: 'SFO', to: 'LAX', seat: 'A1' }, { from: 'SFO', to: 'LAX', seat: 'B2' }, { from: 'LAX', to: 'SFO' }], ['from', 'to']],
        expected: { computed: 2, trace: [{ key: 'SFO|LAX', hit: false }, { key: 'SFO|LAX', hit: true }, { key: 'LAX|SFO', hit: false }] },
      },
      {
        input: [[{ zip: '94110' }, { zip: 94110 }, {}], ['zip']],
        expected: { computed: 2, trace: [{ key: '94110', hit: false }, { key: '94110', hit: true }, { key: '', hit: false }] },
      },
    ],
    hiddenTests: [
      { input: [[], ['a']], expected: { computed: 0, trace: [] } },
      {
        input: [[{ a: 1, b: 2 }, { b: 2, a: 1 }, { a: 1 }], ['a', 'b']],
        expected: { computed: 2, trace: [{ key: '1|2', hit: false }, { key: '1|2', hit: true }, { key: '1|', hit: false }] },
      },
      {
        input: [[{ a: 'x' }, { a: 'x' }, { a: 'x' }], []],
        expected: { computed: 1, trace: [{ key: '', hit: false }, { key: '', hit: true }, { key: '', hit: true }] },
      },
    ],
    hint: 'The key must depend only on the listed fields, in the listed order — object key order must not matter.',
    explanation:
      'A memo key is built from an explicit, ordered list of fields, so `{a, b}` and `{b, a}` collide as intended while unrelated fields cannot break caching. The trap is using `JSON.stringify(call)` as the key, which depends on property order and includes noise fields. Explicit key builders are how production memoizers avoid both false misses and false hits.',
  },
  {
    id: 'node-charge-replay-guard',
    number: 29,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Charge replay guard keyed by client token',
    difficulty: 'Medium',
    topic: 'Caching & State',
    statement: `Mobile clients retry failed "charge my card" calls, so every request carries a client-chosen \`key\`. The server must make a retry safe: the same key must never create a second charge.

Implement \`guardCharges(requests, ttlMs)\` where each request is \`{ key, amountCents, now }\` (already sorted by \`now\`). For each request, in order:
- If no record exists for the key, or the existing record is expired (\`now - createdAt >= ttlMs\`), create a new charge with id \`'ch_' + n\` (\`n\` starts at 1 and increments per charge created), store \`{ chargeId, amountCents, createdAt: now }\`, and output \`{ status: 'created', chargeId }\`.
- Else, if the amount matches the stored record, output \`{ status: 'replayed', chargeId }\` with the original id.
- Else output \`{ status: 'conflict', chargeId: null }\` and leave the stored record untouched.

Return the list of outputs.`,
    buggyCode: `function guardCharges(requests, ttlMs) {
  // TODO: keep a Map key -> { chargeId, amountCents, createdAt }
  return [];
}`,
    solution: `function guardCharges(requests, ttlMs) {
  const records = new Map();
  let nextId = 1;
  const out = [];
  for (const { key, amountCents, now } of requests) {
    const rec = records.get(key);
    if (!rec || now - rec.createdAt >= ttlMs) {
      const chargeId = 'ch_' + nextId++;
      records.set(key, { chargeId, amountCents, createdAt: now });
      out.push({ status: 'created', chargeId });
    } else if (rec.amountCents === amountCents) {
      out.push({ status: 'replayed', chargeId: rec.chargeId });
    } else {
      out.push({ status: 'conflict', chargeId: null });
    }
  }
  return out;
}`,
    functionName: 'guardCharges',
    functionSignature: 'function guardCharges(requests: { key: string; amountCents: number; now: number }[], ttlMs: number): { status: string; chargeId: string | null }[]',
    examples: [
      {
        input: [[{ key: 'k1', amountCents: 500, now: 0 }, { key: 'k1', amountCents: 500, now: 10 }, { key: 'k1', amountCents: 700, now: 20 }], 1000],
        expected: [{ status: 'created', chargeId: 'ch_1' }, { status: 'replayed', chargeId: 'ch_1' }, { status: 'conflict', chargeId: null }],
      },
      {
        input: [[{ key: 'k1', amountCents: 500, now: 0 }, { key: 'k1', amountCents: 500, now: 100 }], 100],
        expected: [{ status: 'created', chargeId: 'ch_1' }, { status: 'created', chargeId: 'ch_2' }],
      },
    ],
    hiddenTests: [
      {
        input: [[{ key: 'a', amountCents: 1, now: 0 }, { key: 'b', amountCents: 1, now: 0 }, { key: 'a', amountCents: 1, now: 49 }, { key: 'b', amountCents: 2, now: 49 }], 50],
        expected: [{ status: 'created', chargeId: 'ch_1' }, { status: 'created', chargeId: 'ch_2' }, { status: 'replayed', chargeId: 'ch_1' }, { status: 'conflict', chargeId: null }],
      },
      {
        input: [[{ key: 'a', amountCents: 5, now: 0 }, { key: 'a', amountCents: 9, now: 150 }, { key: 'a', amountCents: 9, now: 200 }], 100],
        expected: [{ status: 'created', chargeId: 'ch_1' }, { status: 'created', chargeId: 'ch_2' }, { status: 'replayed', chargeId: 'ch_2' }],
      },
      {
        input: [[{ key: 'a', amountCents: 5, now: 0 }, { key: 'a', amountCents: 9, now: 50 }, { key: 'a', amountCents: 5, now: 60 }], 100],
        expected: [{ status: 'created', chargeId: 'ch_1' }, { status: 'conflict', chargeId: null }, { status: 'replayed', chargeId: 'ch_1' }],
      },
    ],
    hint: 'A conflict must not overwrite the record — the original charge is still the truth for later replays.',
    explanation:
      'The store maps each client key to the charge it produced plus its amount and creation time; a replay returns the original id, a mismatched amount is rejected, and an expired record is treated as brand new. The subtle bug is letting a conflicting request replace the record, which would make a subsequent honest retry look like a conflict. Payment APIs rely on exactly this pattern so network retries never double-charge.',
  },
  {
    id: 'node-notice-board-fanout',
    number: 30,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Notice board fan-out with pattern topics',
    difficulty: 'Hard',
    topic: 'Caching & State',
    statement: `Build an in-process notice board: subscribers register a topic pattern, publishers post to concrete topics, and subscriptions can be cancelled with the token they were issued.

Implement \`runNoticeBoard(ops)\` over ops:
- \`['sub', pattern, subscriberId]\` — issue the token \`'sub_' + n\` (\`n\` starts at 1 and counts every sub op). Patterns and topics are dot-separated; a \`*\` segment matches exactly one segment, and the segment counts must be equal (\`'orders.*'\` matches \`'orders.paid'\` but not \`'orders'\` or \`'orders.a.b'\`).
- \`['unsub', token]\` — deactivate that subscription; unknown or already-cancelled tokens are ignored.
- \`['pub', topic, payload]\` — for every active subscription whose pattern matches, in token order, deliver \`[subscriberId, topic, payload]\`. A subscriber that holds several matching subscriptions receives the message only once per publish.

Return the delivery log as an array of \`[subscriberId, topic, payload]\` triples.`,
    buggyCode: `function runNoticeBoard(ops) {
  // TODO: keep subscriptions in issue order; match segment-by-segment; dedupe per publish
  return [];
}`,
    solution: `function runNoticeBoard(ops) {
  const subs = [];
  const log = [];
  let counter = 0;
  const matches = (pattern, topic) => {
    const p = pattern.split('.');
    const t = topic.split('.');
    if (p.length !== t.length) return false;
    return p.every((seg, i) => seg === '*' || seg === t[i]);
  };
  for (const op of ops) {
    if (op[0] === 'sub') {
      subs.push({ token: 'sub_' + ++counter, pattern: op[1], id: op[2], active: true });
    } else if (op[0] === 'unsub') {
      const s = subs.find((x) => x.token === op[1]);
      if (s) s.active = false;
    } else if (op[0] === 'pub') {
      const delivered = new Set();
      for (const s of subs) {
        if (!s.active || delivered.has(s.id) || !matches(s.pattern, op[1])) continue;
        delivered.add(s.id);
        log.push([s.id, op[1], op[2]]);
      }
    }
  }
  return log;
}`,
    functionName: 'runNoticeBoard',
    functionSignature: 'function runNoticeBoard(ops: any[][]): [string, string, any][]',
    examples: [
      {
        input: [[['sub', 'orders.created', 'mail'], ['sub', 'orders.*', 'audit'], ['pub', 'orders.created', { id: 1 }], ['pub', 'orders.paid', { id: 1 }]]],
        expected: [['mail', 'orders.created', { id: 1 }], ['audit', 'orders.created', { id: 1 }], ['audit', 'orders.paid', { id: 1 }]],
      },
      {
        input: [[['sub', 'a.b', 'x'], ['unsub', 'sub_1'], ['pub', 'a.b', 1], ['sub', 'a.b', 'y'], ['pub', 'a.b', 2]]],
        expected: [['y', 'a.b', 2]],
      },
    ],
    hiddenTests: [
      { input: [[['sub', '*.b', 'x'], ['pub', 'a.b.c', 1], ['pub', 'a.b', 2], ['pub', 'b', 3]]], expected: [['x', 'a.b', 2]] },
      { input: [[['sub', 'a.*', 'x'], ['sub', '*.b', 'x'], ['pub', 'a.b', 1]]], expected: [['x', 'a.b', 1]] },
      { input: [[['unsub', 'sub_9'], ['sub', 't', 's'], ['unsub', 'sub_1'], ['unsub', 'sub_1'], ['pub', 't', 0]]], expected: [] },
      {
        input: [[['sub', '*', 'p'], ['sub', '*', 'q'], ['pub', 'k', 'v'], ['unsub', 'sub_1'], ['pub', 'k', 'w']]],
        expected: [['p', 'k', 'v'], ['q', 'k', 'v'], ['q', 'k', 'w']],
      },
    ],
    hint: 'Split both pattern and topic on "." and compare lengths first; keep a per-publish Set of subscriber ids that already got the message.',
    explanation:
      'Subscriptions live in an ordered list so delivery order is the issue order; matching is segment-wise with an equal-length guard so `*` never swallows extra segments. The two traps are cancelling by removing from the array (which breaks later token lookups) and delivering twice to a subscriber with overlapping patterns. This is the core of any event bus or notification router.',
  },
  {
    id: 'node-idle-session-sweep',
    number: 31,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Idle and max-age session sweep',
    difficulty: 'Easy',
    topic: 'Caching & State',
    statement: `A login service stores sessions in memory and runs a periodic sweep. A session is expired when it has been idle too long **or** it is simply too old, whichever comes first.

Implement \`sweepSessions(sessions, now, idleMs, maxAgeMs)\` where each session is \`{ id, createdAt, lastSeenAt }\`. A session expires when \`now - lastSeenAt >= idleMs\` or \`now - createdAt >= maxAgeMs\`. Return \`{ kept, expired }\` — two arrays of session ids, each preserving the input order.`,
    buggyCode: `function sweepSessions(sessions, now, idleMs, maxAgeMs) {
  // TODO: partition ids by the two expiry rules
  return { kept: [], expired: [] };
}`,
    solution: `function sweepSessions(sessions, now, idleMs, maxAgeMs) {
  const kept = [];
  const expired = [];
  for (const s of sessions) {
    const idle = now - s.lastSeenAt >= idleMs;
    const old = now - s.createdAt >= maxAgeMs;
    (idle || old ? expired : kept).push(s.id);
  }
  return { kept, expired };
}`,
    functionName: 'sweepSessions',
    functionSignature: 'function sweepSessions(sessions: { id: string; createdAt: number; lastSeenAt: number }[], now: number, idleMs: number, maxAgeMs: number): { kept: string[]; expired: string[] }',
    examples: [
      {
        input: [[{ id: 's1', createdAt: 0, lastSeenAt: 90 }, { id: 's2', createdAt: 0, lastSeenAt: 50 }, { id: 's3', createdAt: 0, lastSeenAt: 100 }], 100, 30, 1000],
        expected: { kept: ['s1', 's3'], expired: ['s2'] },
      },
      {
        input: [[{ id: 'a', createdAt: 0, lastSeenAt: 999 }, { id: 'b', createdAt: 500, lastSeenAt: 999 }], 1000, 100, 1000],
        expected: { kept: ['b'], expired: ['a'] },
      },
    ],
    hiddenTests: [
      { input: [[], 5, 1, 1], expected: { kept: [], expired: [] } },
      { input: [[{ id: 'x', createdAt: 10, lastSeenAt: 10 }], 10, 0, 0], expected: { kept: [], expired: ['x'] } },
      {
        input: [[{ id: 'x', createdAt: 0, lastSeenAt: 20 }, { id: 'y', createdAt: 0, lastSeenAt: 19 }], 40, 21, 100],
        expected: { kept: ['x'], expired: ['y'] },
      },
    ],
    hint: 'Both limits are inclusive (>=) and either one alone is enough to expire a session.',
    explanation:
      'Each session is checked against two independent inclusive thresholds and routed to one of two lists. The pitfall is using `>` instead of `>=` or only checking idleness — an absolute max age is what bounds how long a stolen session token stays usable. Sweeps like this keep session stores from growing without limit.',
  },

  // ---------------------------------------------------------------- Scheduling & Jobs
  {
    id: 'node-prep-station-stages',
    number: 32,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Prep-station stages from task dependencies',
    difficulty: 'Hard',
    topic: 'Scheduling & Jobs',
    statement: `A kitchen planner receives prep tasks with dependencies and must group them into stages: every task in a stage can run in parallel because all of its dependencies finished in earlier stages.

Implement \`planPrepStages(tasks)\` where each task is \`{ name, needs }\` (\`needs\` is a list of task names; names are unique).
- Stage 1 holds every task with no needs; each following stage holds every remaining task whose needs are all in earlier stages.
- Sort names alphabetically within a stage.
- Return \`null\` if any need refers to a name that is not in the list, or if the tasks cannot all be scheduled (a cycle, including a task that needs itself).
- An empty list yields \`[]\`.

Return an array of stages (arrays of names).`,
    buggyCode: `function planPrepStages(tasks) {
  // TODO: repeatedly peel off every task whose needs are already done
  return null;
}`,
    solution: `function planPrepStages(tasks) {
  const names = new Set(tasks.map((t) => t.name));
  for (const t of tasks) for (const d of t.needs) if (!names.has(d)) return null;
  const done = new Set();
  const stages = [];
  let remaining = tasks.slice();
  while (remaining.length) {
    const ready = remaining.filter((t) => t.needs.every((d) => done.has(d))).map((t) => t.name).sort();
    if (ready.length === 0) return null;
    stages.push(ready);
    ready.forEach((n) => done.add(n));
    remaining = remaining.filter((t) => !done.has(t.name));
  }
  return stages;
}`,
    functionName: 'planPrepStages',
    functionSignature: 'function planPrepStages(tasks: { name: string; needs: string[] }[]): string[][] | null',
    examples: [
      {
        input: [[{ name: 'plate', needs: ['sear', 'sauce'] }, { name: 'sear', needs: ['marinate'] }, { name: 'sauce', needs: [] }, { name: 'marinate', needs: [] }]],
        expected: [['marinate', 'sauce'], ['sear'], ['plate']],
      },
      { input: [[{ name: 'a', needs: ['b'] }, { name: 'b', needs: ['a'] }]], expected: null },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[{ name: 'a', needs: ['zzz'] }]], expected: null },
      { input: [[{ name: 'c', needs: [] }, { name: 'b', needs: [] }, { name: 'a', needs: [] }]], expected: [['a', 'b', 'c']] },
      {
        input: [[{ name: 'a', needs: [] }, { name: 'b', needs: ['a'] }, { name: 'c', needs: ['a'] }, { name: 'd', needs: ['b', 'c'] }, { name: 'e', needs: ['a', 'd'] }]],
        expected: [['a'], ['b', 'c'], ['d'], ['e']],
      },
      { input: [[{ name: 'a', needs: ['a'] }]], expected: null },
    ],
    hint: 'If a round finds nothing ready while tasks remain, the leftovers form a cycle.',
    explanation:
      'This is a layered topological sort: each round collects every task whose dependencies are already satisfied, emits them as one stage, and repeats; a round that finds nothing while work remains proves a cycle. The pitfalls are validating unknown dependencies (which otherwise look like a cycle or get silently skipped) and letting tasks that become ready mid-round leak into the current stage. Build systems and deploy pipelines schedule exactly this way.',
  },
  {
    id: 'node-weekly-slot-next-run',
    number: 33,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Next run from a weekly slot spec',
    difficulty: 'Hard',
    topic: 'Scheduling & Jobs',
    statement: `A report scheduler uses a simplified weekly spec instead of cron. Time is expressed as a *minute of the week*: \`0\` is Monday 00:00, \`1439\` is Monday 23:59, \`1440\` is Tuesday 00:00, and \`10079\` is Sunday 23:59. Weekday \`0\` is Monday.

Implement \`nextWeeklyRun(spec, nowMin)\` where \`spec = { weekdays, hours, minutes }\` — non-empty arrays that may be unsorted. A minute \`t\` matches when its weekday, hour and minute are all listed. Return \`{ at, wrapped }\`:
- \`at\` is the smallest matching \`t\` with \`t > nowMin\` (strictly later), and \`wrapped\` is \`false\`;
- if no match remains this week, \`at\` is the earliest match of the week (the next occurrence lies in the following week) and \`wrapped\` is \`true\`.`,
    buggyCode: `function nextWeeklyRun(spec, nowMin) {
  // TODO: enumerate candidate minutes, sort, pick the first strictly after nowMin
  return { at: 0, wrapped: false };
}`,
    solution: `function nextWeeklyRun(spec, nowMin) {
  const candidates = [];
  for (const d of spec.weekdays) {
    for (const h of spec.hours) {
      for (const m of spec.minutes) candidates.push(d * 1440 + h * 60 + m);
    }
  }
  candidates.sort((a, b) => a - b);
  const next = candidates.find((t) => t > nowMin);
  return next === undefined ? { at: candidates[0], wrapped: true } : { at: next, wrapped: false };
}`,
    functionName: 'nextWeeklyRun',
    functionSignature: 'function nextWeeklyRun(spec: { weekdays: number[]; hours: number[]; minutes: number[] }, nowMin: number): { at: number; wrapped: boolean }',
    examples: [
      { input: [{ weekdays: [0, 2], hours: [9], minutes: [0, 30] }, 0], expected: { at: 540, wrapped: false } },
      { input: [{ weekdays: [0, 2], hours: [9], minutes: [0, 30] }, 570], expected: { at: 3420, wrapped: false } },
    ],
    hiddenTests: [
      { input: [{ weekdays: [4], hours: [17], minutes: [0] }, 6780], expected: { at: 6780, wrapped: true } },
      { input: [{ weekdays: [6, 0], hours: [23, 1], minutes: [59, 5] }, 10000], expected: { at: 10025, wrapped: false } },
      { input: [{ weekdays: [6, 0], hours: [23, 1], minutes: [59, 5] }, 10079], expected: { at: 65, wrapped: true } },
      { input: [{ weekdays: [1], hours: [0], minutes: [0] }, 1439], expected: { at: 1440, wrapped: false } },
    ],
    hint: 'The spec lists are unsorted — sort the numeric candidates before searching, and remember the comparison is strict.',
    explanation:
      'Every combination of weekday, hour and minute becomes a candidate minute-of-week; sorting numerically and taking the first value strictly greater than now gives the next run, and falling back to the smallest candidate models the wrap into next week. The pitfalls are relying on the spec order (unsorted lists produce wrong answers), sorting numbers lexically, and using `>=`, which would re-fire a job in the very minute it just ran. Schedulers that recompute "next run" this way are simple to test because no real clock is involved.',
  },
  {
    id: 'node-print-queue-priority',
    number: 34,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Print queue with priority and arrival ties',
    difficulty: 'Medium',
    topic: 'Scheduling & Jobs',
    statement: `A label printer pulls jobs by priority, but jobs with equal priority must print in the order they arrived — customers notice when a later job jumps the line.

Implement \`runPrintQueue(ops)\` over ops:
- \`['add', name, priority]\` — enqueue (priority may be any integer, including negative). No output.
- \`['next']\` — dequeue and output the name with the highest priority; among equal priorities the earliest-added wins. Output \`null\` when empty.
- \`['size']\` — output the number of queued jobs.

Return the list of outputs from \`next\` and \`size\` in order. Duplicate names are allowed.`,
    buggyCode: `function runPrintQueue(ops) {
  // TODO: tag each job with an arrival sequence number to break ties
  return [];
}`,
    solution: `function runPrintQueue(ops) {
  const queue = [];
  const out = [];
  let seq = 0;
  for (const op of ops) {
    if (op[0] === 'add') {
      queue.push({ name: op[1], priority: op[2], seq: seq++ });
    } else if (op[0] === 'next') {
      if (queue.length === 0) {
        out.push(null);
        continue;
      }
      let best = 0;
      for (let i = 1; i < queue.length; i++) {
        const a = queue[i];
        const b = queue[best];
        if (a.priority > b.priority || (a.priority === b.priority && a.seq < b.seq)) best = i;
      }
      out.push(queue.splice(best, 1)[0].name);
    } else if (op[0] === 'size') {
      out.push(queue.length);
    }
  }
  return out;
}`,
    functionName: 'runPrintQueue',
    functionSignature: 'function runPrintQueue(ops: any[][]): (string | number | null)[]',
    examples: [
      { input: [[['add', 'a', 1], ['add', 'b', 5], ['add', 'c', 5], ['next'], ['next'], ['next'], ['next']]], expected: ['b', 'c', 'a', null] },
      { input: [[['next'], ['add', 'x', 0], ['size'], ['next'], ['size']]], expected: [null, 1, 'x', 0] },
    ],
    hiddenTests: [
      { input: [[['add', 'a', 2], ['next'], ['add', 'b', 1], ['add', 'c', 2], ['next'], ['next']]], expected: ['a', 'c', 'b'] },
      { input: [[['add', 'a', -1], ['add', 'b', -5], ['next']]], expected: ['a'] },
      { input: [[['add', 'a', 1], ['add', 'a', 3], ['next'], ['next']]], expected: ['a', 'a'] },
      {
        input: [[['add', 'a', 1], ['next'], ['add', 'b', 1], ['add', 'c', 9], ['add', 'd', 9], ['next'], ['next'], ['next'], ['size']]],
        expected: ['a', 'c', 'd', 'b', 0],
      },
    ],
    hint: 'Compare by (priority desc, arrival seq asc); a plain sort by priority alone is not guaranteed to be stable in every engine.',
    explanation:
      'Each job gets a monotonically increasing arrival number, and `next` picks the entry with the highest priority and, on ties, the lowest arrival number. The trap is relying on sort stability or on the array order after repeated inserts — an explicit sequence makes the tie rule deterministic everywhere. Job queues, retry schedulers and UI task runners all need this exact ordering guarantee.',
  },
  {
    id: 'node-timed-dispatch-cancel',
    number: 35,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Timed dispatch with cancellable jobs',
    difficulty: 'Medium',
    topic: 'Scheduling & Jobs',
    statement: `A notification service schedules pushes with a small delay so users can "undo" them. Each job may carry a cancel time; if the cancel fires before the job runs, the push is dropped.

Implement \`async function dispatchWithCancel(jobs)\` where each job is \`{ id, delayMs, cancelAtMs? }\` (all times ≤ 50 ms):
- Schedule the job with \`setTimeout(…, delayMs)\`. When it fires, record \`id\` in \`ran\`.
- If \`cancelAtMs\` is a number, schedule a cancel with \`setTimeout(…, cancelAtMs)\`. When it fires and the job has not run yet, \`clearTimeout\` the job and record \`id\` in \`cancelled\`. A cancel that fires after the job ran does nothing.
- Resolve once every job has either run or been cancelled (an empty list resolves immediately).

Return \`{ ran, cancelled }\`, each in the order the events happened.`,
    buggyCode: `async function dispatchWithCancel(jobs) {
  // TODO: keep the timer handle per job so the cancel timer can clear it
  return { ran: [], cancelled: [] };
}`,
    solution: `async function dispatchWithCancel(jobs) {
  const ran = [];
  const cancelled = [];
  await new Promise((resolve) => {
    let pending = jobs.length;
    if (pending === 0) return resolve();
    const settle = () => {
      if (--pending === 0) resolve();
    };
    for (const job of jobs) {
      let finished = false;
      const handle = setTimeout(() => {
        finished = true;
        ran.push(job.id);
        settle();
      }, job.delayMs);
      if (typeof job.cancelAtMs === 'number') {
        setTimeout(() => {
          if (finished) return;
          finished = true;
          clearTimeout(handle);
          cancelled.push(job.id);
          settle();
        }, job.cancelAtMs);
      }
    }
  });
  return { ran, cancelled };
}`,
    functionName: 'dispatchWithCancel',
    functionSignature: 'async function dispatchWithCancel(jobs: { id: string; delayMs: number; cancelAtMs?: number }[]): Promise<{ ran: string[]; cancelled: string[] }>',
    examples: [
      {
        input: [[{ id: 'a', delayMs: 30 }, { id: 'b', delayMs: 10 }, { id: 'c', delayMs: 20, cancelAtMs: 5 }]],
        expected: { ran: ['b', 'a'], cancelled: ['c'] },
      },
      { input: [[{ id: 'a', delayMs: 10, cancelAtMs: 40 }]], expected: { ran: ['a'], cancelled: [] } },
    ],
    hiddenTests: [
      { input: [[]], expected: { ran: [], cancelled: [] } },
      { input: [[{ id: 'a', delayMs: 0 }, { id: 'b', delayMs: 0 }]], expected: { ran: ['a', 'b'], cancelled: [] } },
      {
        input: [[{ id: 'a', delayMs: 40, cancelAtMs: 20 }, { id: 'b', delayMs: 40, cancelAtMs: 0 }, { id: 'c', delayMs: 10 }]],
        expected: { ran: ['c'], cancelled: ['b', 'a'] },
      },
      { input: [[{ id: 'a', delayMs: 20, cancelAtMs: 30 }]], expected: { ran: ['a'], cancelled: [] } },
    ],
    hint: 'Count down the number of unsettled jobs and resolve the outer promise when it reaches zero — a cancel settles a job too.',
    explanation:
      'Each job keeps its timer handle and a `finished` flag; the cancel timer clears the handle only if the job has not fired, and both paths decrement a shared pending counter that resolves the result. The pitfalls are resolving after a fixed sleep instead of when the last job settles, and cancelling a job that already ran (double-counting it). Undo-able sends, debounced writes and request timeouts all rely on holding the handle you might need to clear.',
  },
  {
    id: 'node-courier-least-loaded',
    number: 36,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Parcel assignment to the least-loaded courier',
    difficulty: 'Easy',
    topic: 'Scheduling & Jobs',
    statement: `A depot hands parcels to couriers one at a time. Each parcel goes to whichever courier currently carries the least weight; when several tie, the courier listed first wins.

Implement \`assignParcels(couriers, parcels)\` where \`couriers\` is a non-empty list of \`{ id, load }\` (starting load) and \`parcels\` is a list of weights (non-negative numbers). Process parcels in order. Return \`{ assignments, loads }\` where \`assignments\` maps each courier id to the list of weights it received (empty list if none) and \`loads\` maps each id to its final load.`,
    buggyCode: `function assignParcels(couriers, parcels) {
  // TODO: for each parcel pick the courier with the minimum load (first on ties)
  return { assignments: {}, loads: {} };
}`,
    solution: `function assignParcels(couriers, parcels) {
  const state = couriers.map((c) => ({ id: c.id, load: c.load, items: [] }));
  for (const weight of parcels) {
    let best = state[0];
    for (const c of state) if (c.load < best.load) best = c;
    best.items.push(weight);
    best.load += weight;
  }
  const assignments = {};
  const loads = {};
  for (const c of state) {
    assignments[c.id] = c.items;
    loads[c.id] = c.load;
  }
  return { assignments, loads };
}`,
    functionName: 'assignParcels',
    functionSignature: 'function assignParcels(couriers: { id: string; load: number }[], parcels: number[]): { assignments: Record<string, number[]>; loads: Record<string, number> }',
    examples: [
      { input: [[{ id: 'a', load: 0 }, { id: 'b', load: 0 }], [5, 3, 4]], expected: { assignments: { a: [5], b: [3, 4] }, loads: { a: 5, b: 7 } } },
      { input: [[{ id: 'x', load: 10 }, { id: 'y', load: 2 }], [1, 1, 1]], expected: { assignments: { x: [], y: [1, 1, 1] }, loads: { x: 10, y: 5 } } },
    ],
    hiddenTests: [
      { input: [[{ id: 'a', load: 0 }], []], expected: { assignments: { a: [] }, loads: { a: 0 } } },
      {
        input: [[{ id: 'a', load: 1 }, { id: 'b', load: 1 }, { id: 'c', load: 1 }], [2, 2, 2, 2]],
        expected: { assignments: { a: [2, 2], b: [2], c: [2] }, loads: { a: 5, b: 3, c: 3 } },
      },
      { input: [[{ id: 'a', load: 0 }, { id: 'b', load: 0 }], [0, 0, 0]], expected: { assignments: { a: [0, 0, 0], b: [] }, loads: { a: 0, b: 0 } } },
    ],
    hint: 'Use a strict `<` while scanning so the first courier keeps winning ties.',
    explanation:
      'Every parcel triggers a scan for the minimum current load, with a strict less-than so earlier couriers win ties, and the load is updated before the next parcel is placed. The pitfalls are using `<=` (which hands ties to the last courier) and not copying the input so starting loads are mutated. Least-loaded assignment is the simplest form of load balancing across workers or shards.',
  },

  // ---------------------------------------------------------------- Config & Validation
  {
    id: 'node-layered-settings-merge',
    number: 37,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Layered settings merge with append and delete markers',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement: `A service loads settings from several layers (defaults, environment, per-tenant) and merges them in order, later layers winning.

Implement \`mergeSettingsLayers(layers)\` starting from \`{}\`:
- Plain objects merge recursively.
- An array value **replaces** the existing value.
- A key ending in \`+\` (e.g. \`"tags+"\`) appends its array to the existing array under the base key (\`tags\`), creating it if missing or not an array.
- A value of \`null\` removes the key; removing a missing key is a no-op.
- Any other value (string, number, boolean) replaces.

Marker keys never appear in the output. Do not mutate the input layers. Return the merged object.`,
    buggyCode: `function mergeSettingsLayers(layers) {
  // TODO: fold each layer into an accumulator with a recursive apply(base, layer)
  return {};
}`,
    solution: `function mergeSettingsLayers(layers) {
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const apply = (base, layer) => {
    const out = { ...base };
    for (const [rawKey, val] of Object.entries(layer)) {
      if (rawKey.endsWith('+')) {
        const key = rawKey.slice(0, -1);
        const prev = Array.isArray(out[key]) ? out[key] : [];
        out[key] = prev.concat(val);
      } else if (val === null) {
        delete out[rawKey];
      } else if (isObj(val) && isObj(out[rawKey])) {
        out[rawKey] = apply(out[rawKey], val);
      } else {
        out[rawKey] = isObj(val) ? apply({}, val) : val;
      }
    }
    return out;
  };
  return layers.reduce((acc, layer) => apply(acc, layer), {});
}`,
    functionName: 'mergeSettingsLayers',
    functionSignature: 'function mergeSettingsLayers(layers: Record<string, any>[]): Record<string, any>',
    examples: [
      {
        input: [[{ db: { host: 'a', port: 1 }, tags: ['x'] }, { db: { port: 2 }, 'tags+': ['y'] }]],
        expected: { db: { host: 'a', port: 2 }, tags: ['x', 'y'] },
      },
      { input: [[{ a: 1, b: { c: 1 } }, { a: null, b: { c: null, d: 2 } }]], expected: { b: { d: 2 } } },
    ],
    hiddenTests: [
      { input: [[]], expected: {} },
      { input: [[{ list: [1, 2] }, { list: [3] }]], expected: { list: [3] } },
      { input: [[{ 'tags+': ['a'] }, { 'tags+': ['b'] }, { tags: ['z'] }]], expected: { tags: ['z'] } },
      { input: [[{ x: { y: 1 } }, { x: 5 }, { x: { z: 2 } }]], expected: { x: { z: 2 } } },
      { input: [[{}, { n: { m: null, 'k+': [1] } }]], expected: { n: { k: [1] } } },
    ],
    hint: 'Recurse only when both sides are plain objects; a fresh nested object still needs to go through apply so its markers are honoured.',
    explanation:
      'The merge folds layers into a copied accumulator; objects recurse, arrays and scalars replace, and two marker forms — a `+` suffix for append and `null` for delete — give layers explicit control. The pitfalls are treating arrays as objects (which would merge them index-by-index) and copying a nested object verbatim when the base lacks it, leaking `+` keys and `null` tombstones into the result. Layered configuration with explicit markers is how deploy tooling avoids ambiguous "does this list replace or extend?" questions.',
  },
  {
    id: 'node-env-string-coercion',
    number: 38,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Environment string coercion by schema',
    difficulty: 'Easy',
    topic: 'Config & Validation',
    statement: `Environment variables arrive as strings. A tiny schema says what each one should become.

Implement \`coerceEnv(env, schema)\` where \`env\` is an object of string values and \`schema\` maps keys to one of \`'int'\`, \`'bool'\`, \`'list'\`, \`'string'\`. Process keys in schema order:
- A key absent from \`env\` is an error with reason \`'missing'\`.
- \`int\`: after trimming, must match optional sign plus digits only → a number; otherwise reason \`'invalid'\`.
- \`bool\`: after trimming and lowercasing, \`true/1/yes\` → \`true\`, \`false/0/no\` → \`false\`; anything else is \`'invalid'\`.
- \`list\`: split on commas, trim each part, drop empty parts (so \`''\` becomes \`[]\`).
- \`string\`: keep as-is.

Return \`{ values, errors }\` where \`values\` holds only the successfully coerced keys and \`errors\` is \`[{ key, reason }]\`.`,
    buggyCode: `function coerceEnv(env, schema) {
  // TODO: walk schema keys, coerce or record an error
  return { values: {}, errors: [] };
}`,
    solution: `function coerceEnv(env, schema) {
  const values = {};
  const errors = [];
  for (const [key, kind] of Object.entries(schema)) {
    if (!(key in env)) {
      errors.push({ key, reason: 'missing' });
      continue;
    }
    const raw = env[key];
    if (kind === 'int') {
      const t = raw.trim();
      if (/^[+-]?\\d+$/.test(t)) values[key] = Number(t);
      else errors.push({ key, reason: 'invalid' });
    } else if (kind === 'bool') {
      const t = raw.trim().toLowerCase();
      if (['true', '1', 'yes'].includes(t)) values[key] = true;
      else if (['false', '0', 'no'].includes(t)) values[key] = false;
      else errors.push({ key, reason: 'invalid' });
    } else if (kind === 'list') {
      values[key] = raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    } else {
      values[key] = raw;
    }
  }
  return { values, errors };
}`,
    functionName: 'coerceEnv',
    functionSignature: 'function coerceEnv(env: Record<string, string>, schema: Record<string, string>): { values: Record<string, any>; errors: { key: string; reason: string }[] }',
    examples: [
      {
        input: [{ PORT: '8080', DEBUG: 'Yes', HOSTS: 'a, b,,c' }, { PORT: 'int', DEBUG: 'bool', HOSTS: 'list' }],
        expected: { values: { PORT: 8080, DEBUG: true, HOSTS: ['a', 'b', 'c'] }, errors: [] },
      },
      {
        input: [{ PORT: '80x' }, { PORT: 'int', NAME: 'string' }],
        expected: { values: {}, errors: [{ key: 'PORT', reason: 'invalid' }, { key: 'NAME', reason: 'missing' }] },
      },
    ],
    hiddenTests: [
      { input: [{ A: ' 0 ', B: 'FALSE', C: '' }, { A: 'bool', B: 'bool', C: 'list' }], expected: { values: { A: false, B: false, C: [] }, errors: [] } },
      { input: [{ N: '-12', M: '1.5' }, { N: 'int', M: 'int' }], expected: { values: { N: -12 }, errors: [{ key: 'M', reason: 'invalid' }] } },
      { input: [{ X: 'maybe' }, { X: 'bool' }], expected: { values: {}, errors: [{ key: 'X', reason: 'invalid' }] } },
      { input: [{}, {}], expected: { values: {}, errors: [] } },
    ],
    hint: 'Validate ints with a regex before converting — `Number("1.5")` and `Number("")` both succeed silently.',
    explanation:
      'Each schema entry is coerced with an explicit parser: a strict digit regex for ints, a small accepted-token set for booleans, and a trim-and-filter split for lists. The pitfall is leaning on `Number()` or `parseInt`, which accept `"1.5"`, `""` or `"80x"` in surprising ways, and on truthiness for booleans (`"false"` is truthy). Fail-fast config parsing at boot is far cheaper than a service that starts with `PORT = NaN`.',
  },
  {
    id: 'node-shape-validation-paths',
    number: 39,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Shape validation with error paths',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement: `A request validator checks a payload against a small schema and reports every problem with the path where it occurred, so the client can highlight the exact field.

Implement \`validateShape(value, schema)\` returning \`[{ path, message }]\` in discovery order. Paths use \`/\` segments (\`''\` for the root, \`'/user/tags/1'\` for nested). Schema kinds:
- \`{ type: 'string', minLen? }\` → \`'expected string'\` when not a string; else \`'too short'\` when shorter than \`minLen\`.
- \`{ type: 'number', min?, max? }\` → \`'expected number'\` (NaN counts as not a number); else \`'below min'\` / \`'above max'\`.
- \`{ type: 'boolean' }\` → \`'expected boolean'\`.
- \`{ type: 'array', items }\` → \`'expected array'\`; else validate each element at \`path/index\`.
- \`{ type: 'object', fields, required }\` → \`'expected object'\` for anything that is not a plain object (arrays and \`null\` included); else for each field in \`fields\` order: if absent and listed in \`required\` push \`'required'\` at its path, if absent and optional skip it, otherwise validate it. Extra keys are ignored.

Return \`[]\` when the value is valid.`,
    buggyCode: `function validateShape(value, schema) {
  // TODO: recursive check(value, schema, path) pushing { path, message }
  return [];
}`,
    solution: `function validateShape(value, schema) {
  const errors = [];
  const check = (v, s, path) => {
    if (s.type === 'string') {
      if (typeof v !== 'string') errors.push({ path, message: 'expected string' });
      else if (s.minLen !== undefined && v.length < s.minLen) errors.push({ path, message: 'too short' });
    } else if (s.type === 'number') {
      if (typeof v !== 'number' || Number.isNaN(v)) errors.push({ path, message: 'expected number' });
      else if (s.min !== undefined && v < s.min) errors.push({ path, message: 'below min' });
      else if (s.max !== undefined && v > s.max) errors.push({ path, message: 'above max' });
    } else if (s.type === 'boolean') {
      if (typeof v !== 'boolean') errors.push({ path, message: 'expected boolean' });
    } else if (s.type === 'array') {
      if (!Array.isArray(v)) errors.push({ path, message: 'expected array' });
      else v.forEach((item, i) => check(item, s.items, path + '/' + i));
    } else if (s.type === 'object') {
      if (v === null || typeof v !== 'object' || Array.isArray(v)) {
        errors.push({ path, message: 'expected object' });
        return;
      }
      const required = new Set(s.required || []);
      for (const [key, fieldSchema] of Object.entries(s.fields)) {
        const p = path + '/' + key;
        if (!(key in v)) {
          if (required.has(key)) errors.push({ path: p, message: 'required' });
        } else {
          check(v[key], fieldSchema, p);
        }
      }
    }
  };
  check(value, schema, '');
  return errors;
}`,
    functionName: 'validateShape',
    functionSignature: 'function validateShape(value: any, schema: object): { path: string; message: string }[]',
    examples: [
      {
        input: [{ name: 'Al', age: 200 }, { type: 'object', fields: { name: { type: 'string', minLen: 3 }, age: { type: 'number', min: 0, max: 150 } }, required: ['name', 'age'] }],
        expected: [{ path: '/name', message: 'too short' }, { path: '/age', message: 'above max' }],
      },
      {
        input: [{ tags: ['a', 3] }, { type: 'object', fields: { tags: { type: 'array', items: { type: 'string' } } }, required: [] }],
        expected: [{ path: '/tags/1', message: 'expected string' }],
      },
    ],
    hiddenTests: [
      { input: ['x', { type: 'number' }], expected: [{ path: '', message: 'expected number' }] },
      { input: [{}, { type: 'object', fields: { id: { type: 'string' } }, required: ['id'] }], expected: [{ path: '/id', message: 'required' }] },
      { input: [{ ok: 'yes' }, { type: 'object', fields: { ok: { type: 'boolean' } }, required: [] }], expected: [{ path: '/ok', message: 'expected boolean' }] },
      {
        input: [
          { addr: { zip: 5 } },
          { type: 'object', fields: { addr: { type: 'object', fields: { zip: { type: 'string' }, city: { type: 'string' } }, required: ['city'] } }, required: ['addr'] },
        ],
        expected: [{ path: '/addr/zip', message: 'expected string' }, { path: '/addr/city', message: 'required' }],
      },
      { input: [[], { type: 'object', fields: {}, required: [] }], expected: [{ path: '', message: 'expected object' }] },
      { input: [{ n: 3 }, { type: 'object', fields: { n: { type: 'number', min: 0, max: 10 } }, required: ['n'] }], expected: [] },
    ],
    hint: 'Carry the path down the recursion as a string and only append a segment when you descend into a field or index.',
    explanation:
      'A recursive checker walks value and schema together, threading the current path so every error is addressable, and stops descending at a type mismatch so one bad node does not produce cascading noise. The pitfalls are `typeof null === "object"` and arrays passing an object check, plus forgetting that NaN is a number by type. Path-addressed validation errors are what let forms and API clients point at the exact broken field.',
  },
  {
    id: 'node-release-range-check',
    number: 40,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Release range check for plugin compatibility',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement: `A plugin host decides whether a plugin built for a given host version range can load. Versions are \`major.minor.patch\` with non-negative integers; compare numerically per component.

Implement \`versionSatisfies(version, range)\`. A range is one or more space-separated clauses that must **all** hold:
- \`*\` — always true.
- \`1.2.3\` — exact match.
- \`^1.2.3\` — \`>= 1.2.3\` and \`< 2.0.0\`; when major is \`0\`, the upper bound is \`< 0.(minor+1).0\` instead.
- \`~1.2.3\` — \`>= 1.2.3\` and \`< 1.3.0\`.
- \`>=x\`, \`>x\`, \`<=x\`, \`<x\` — the usual comparisons.

Return a boolean.`,
    buggyCode: `function versionSatisfies(version, range) {
  // TODO: parse into [major, minor, patch], write a compare(), then evaluate each clause
  return false;
}`,
    solution: `function versionSatisfies(version, range) {
  const parse = (s) => s.split('.').map(Number);
  const cmp = (a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return 0;
  };
  const v = parse(version);
  return range.split(/\\s+/).filter(Boolean).every((clause) => {
    if (clause === '*') return true;
    if (clause.startsWith('^')) {
      const b = parse(clause.slice(1));
      const upper = b[0] === 0 ? [0, b[1] + 1, 0] : [b[0] + 1, 0, 0];
      return cmp(v, b) >= 0 && cmp(v, upper) < 0;
    }
    if (clause.startsWith('~')) {
      const b = parse(clause.slice(1));
      return cmp(v, b) >= 0 && cmp(v, [b[0], b[1] + 1, 0]) < 0;
    }
    if (clause.startsWith('>=')) return cmp(v, parse(clause.slice(2))) >= 0;
    if (clause.startsWith('<=')) return cmp(v, parse(clause.slice(2))) <= 0;
    if (clause.startsWith('>')) return cmp(v, parse(clause.slice(1))) > 0;
    if (clause.startsWith('<')) return cmp(v, parse(clause.slice(1))) < 0;
    return cmp(v, parse(clause)) === 0;
  });
}`,
    functionName: 'versionSatisfies',
    functionSignature: 'function versionSatisfies(version: string, range: string): boolean',
    examples: [
      { input: ['1.4.2', '^1.2.0'], expected: true },
      { input: ['2.0.0', '^1.2.0'], expected: false },
    ],
    hiddenTests: [
      { input: ['1.2.9', '~1.2.3'], expected: true },
      { input: ['1.3.0', '~1.2.3'], expected: false },
      { input: ['1.5.0', '>=1.2.0 <1.5.0'], expected: false },
      { input: ['1.4.9', '>=1.2.0 <1.5.0'], expected: true },
      { input: ['0.3.1', '^0.2.5'], expected: false },
      { input: ['0.2.9', '^0.2.5'], expected: true },
      { input: ['3.0.0', '*'], expected: true },
      { input: ['1.10.0', '>1.9.0'], expected: true },
      { input: ['1.2.3', '1.2.3'], expected: true },
      { input: ['1.2.4', '1.2.3'], expected: false },
    ],
    hint: 'Check the two-character operators (>=, <=) before the one-character ones, and compare components as numbers, never as strings.',
    explanation:
      'Versions become numeric triples compared component-wise, and each clause is turned into one or two comparisons against derived bounds (`^` and `~` compute an exclusive upper bound). The pitfalls are string comparison (`"1.10.0" < "1.9.0"`), matching `>` before `>=`, and forgetting the special caret rule for `0.x` versions. Dependency resolvers and plugin loaders evaluate ranges exactly like this.',
  },
  {
    id: 'node-rollout-flag-eval',
    number: 41,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Feature flag with percentage rollout buckets',
    difficulty: 'Easy',
    topic: 'Config & Validation',
    statement: `A feature flag can be forced on for specific users or tiers, and otherwise rolled out to a percentage of users. Bucketing must be deterministic: the same user always lands in the same bucket, and never depends on randomness.

Implement \`evaluateFlag(flag, user)\` where \`flag = { key, enabled, rollout, allowUsers, allowTiers }\` (\`rollout\` is 0–100) and \`user = { id, tier }\`:
- \`bucket\` = sum of the UTF-16 char codes of the string \`flag.key + ':' + user.id\`, modulo 100.
- Rules in order: if \`!enabled\` → off; if \`user.id\` is in \`allowUsers\` → on; if \`user.tier\` is in \`allowTiers\` → on; if \`bucket < rollout\` → on; otherwise off.

Return \`{ on, bucket }\` (always include the bucket, even when disabled).`,
    buggyCode: `function evaluateFlag(flag, user) {
  // TODO: compute the bucket, then apply the rules in order
  return { on: false, bucket: 0 };
}`,
    solution: `function evaluateFlag(flag, user) {
  const s = flag.key + ':' + user.id;
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  const bucket = sum % 100;
  let on = false;
  if (!flag.enabled) on = false;
  else if (flag.allowUsers.includes(user.id)) on = true;
  else if (flag.allowTiers.includes(user.tier)) on = true;
  else on = bucket < flag.rollout;
  return { on, bucket };
}`,
    functionName: 'evaluateFlag',
    functionSignature: 'function evaluateFlag(flag: { key: string; enabled: boolean; rollout: number; allowUsers: string[]; allowTiers: string[] }, user: { id: string; tier: string }): { on: boolean; bucket: number }',
    examples: [
      { input: [{ key: 'dark', enabled: true, rollout: 43, allowUsers: [], allowTiers: [] }, { id: 'u1', tier: 'free' }], expected: { on: true, bucket: 42 } },
      { input: [{ key: 'dark', enabled: true, rollout: 43, allowUsers: [], allowTiers: [] }, { id: 'u2', tier: 'free' }], expected: { on: false, bucket: 43 } },
    ],
    hiddenTests: [
      { input: [{ key: 'dark', enabled: false, rollout: 100, allowUsers: ['u1'], allowTiers: [] }, { id: 'u1', tier: 'free' }], expected: { on: false, bucket: 42 } },
      { input: [{ key: 'dark', enabled: true, rollout: 0, allowUsers: ['u7'], allowTiers: [] }, { id: 'u7', tier: 'free' }], expected: { on: true, bucket: 48 } },
      { input: [{ key: 'dark', enabled: true, rollout: 0, allowUsers: [], allowTiers: ['gold'] }, { id: 'u3', tier: 'gold' }], expected: { on: true, bucket: 44 } },
      { input: [{ key: 'dark', enabled: true, rollout: 100, allowUsers: [], allowTiers: [] }, { id: 'zz', tier: 'free' }], expected: { on: true, bucket: 20 } },
      { input: [{ key: 'dark', enabled: true, rollout: 0, allowUsers: [], allowTiers: [] }, { id: 'vip9', tier: 'free' }], expected: { on: false, bucket: 68 } },
    ],
    hint: 'The bucket includes the flag key so the same user is not in the same 10% for every flag.',
    explanation:
      'The user is hashed together with the flag key into a stable 0–99 bucket, and the rules are evaluated in a fixed precedence: kill switch, user allowlist, tier allowlist, then percentage. The pitfalls are hashing only the user id (so every flag rolls out to the same cohort) and using `<=` for the rollout comparison, which makes `rollout: 0` enable 1% of users. Deterministic bucketing is what lets a rollout be widened without flipping users back and forth.',
  },

  // ---------------------------------------------------------------- Pagination & Data
  {
    id: 'node-feed-cursor-pages',
    number: 42,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Feed pages with opaque after-cursors',
    difficulty: 'Medium',
    topic: 'Pagination & Data',
    statement: `An activity feed pages by cursor instead of offset so that inserts between requests never cause duplicates or gaps.

Implement \`pageFeed(items, pageSize, cursor)\` where items are \`{ id, ... }\` with unique integer ids in any order:
- Sort by \`id\` ascending. With \`cursor === null\` start from the beginning; otherwise decode it and return items with \`id\` greater than the cursor's id.
- A cursor is \`btoa('after:' + id)\`. If \`atob\` throws, the prefix is not \`after:\`, or the rest is not an integer, return \`{ error: 'bad_cursor' }\`.
- Return \`{ items, nextCursor }\` with up to \`pageSize\` items; \`nextCursor\` encodes the last returned id, or is \`null\` when no items remain after this page (a full page that happens to be the last must still return \`null\`).`,
    buggyCode: `function pageFeed(items, pageSize, cursor) {
  // TODO: decode cursor -> afterId, slice the sorted list, encode the next cursor
  return { items: [], nextCursor: null };
}`,
    solution: `function pageFeed(items, pageSize, cursor) {
  let afterId = -Infinity;
  if (cursor !== null) {
    let decoded;
    try {
      decoded = atob(cursor);
    } catch (e) {
      return { error: 'bad_cursor' };
    }
    if (!decoded.startsWith('after:')) return { error: 'bad_cursor' };
    const rest = decoded.slice('after:'.length);
    if (!/^-?\\d+$/.test(rest)) return { error: 'bad_cursor' };
    afterId = Number(rest);
  }
  const sorted = [...items].sort((a, b) => a.id - b.id).filter((it) => it.id > afterId);
  const page = sorted.slice(0, pageSize);
  const hasMore = sorted.length > page.length;
  const nextCursor = hasMore ? btoa('after:' + page[page.length - 1].id) : null;
  return { items: page, nextCursor };
}`,
    functionName: 'pageFeed',
    functionSignature: 'function pageFeed(items: { id: number }[], pageSize: number, cursor: string | null): { items: object[]; nextCursor: string | null } | { error: string }',
    examples: [
      {
        input: [[{ id: 3, t: 'c' }, { id: 1, t: 'a' }, { id: 2, t: 'b' }, { id: 5, t: 'e' }, { id: 4, t: 'd' }], 2, null],
        expected: { items: [{ id: 1, t: 'a' }, { id: 2, t: 'b' }], nextCursor: 'YWZ0ZXI6Mg==' },
      },
      {
        input: [[{ id: 3, t: 'c' }, { id: 1, t: 'a' }, { id: 2, t: 'b' }, { id: 5, t: 'e' }, { id: 4, t: 'd' }], 2, 'YWZ0ZXI6Mg=='],
        expected: { items: [{ id: 3, t: 'c' }, { id: 4, t: 'd' }], nextCursor: 'YWZ0ZXI6NA==' },
      },
    ],
    hiddenTests: [
      { input: [[{ id: 3 }, { id: 1 }, { id: 2 }, { id: 5 }, { id: 4 }], 2, 'YWZ0ZXI6NA=='], expected: { items: [{ id: 5 }], nextCursor: null } },
      { input: [[{ id: 3 }, { id: 1 }, { id: 2 }, { id: 5 }, { id: 4 }], 2, 'YWZ0ZXI6NQ=='], expected: { items: [], nextCursor: null } },
      { input: [[{ id: 1 }], 2, '???'], expected: { error: 'bad_cursor' } },
      { input: [[{ id: 1 }], 2, 'cGFnZToy'], expected: { error: 'bad_cursor' } },
      { input: [[{ id: 2 }, { id: 1 }], 2, null], expected: { items: [{ id: 1 }, { id: 2 }], nextCursor: null } },
    ],
    hint: 'Decide "has more" by looking past the page, not by checking whether the page is full.',
    explanation:
      'The cursor is an opaque base64 wrapper around the last id seen; the server sorts, filters to ids beyond it, and returns the next slice plus a cursor only when items remain. The pitfalls are trusting the cursor without validation (`atob` throws on garbage) and emitting a cursor whenever the page is full, which yields a pointless empty final request. Keyset pagination like this stays correct while rows are being inserted, unlike offsets.',
  },
  {
    id: 'node-legacy-page-to-cursor',
    number: 43,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Legacy page numbers to cursor responses',
    difficulty: 'Easy',
    topic: 'Pagination & Data',
    statement: `Old clients still send \`page\` and \`perPage\`, but the new API responds in cursor shape. Build the adapter.

Implement \`legacyPageToCursor(items, page, perPage)\` (\`page\` is 1-based):
- If \`page < 1\` or \`perPage < 1\`, return \`{ items: [], cursor: null }\`.
- Otherwise return the slice for that page and \`cursor = btoa('offset=' + page * perPage)\` if more items exist beyond the slice, else \`null\`.`,
    buggyCode: `function legacyPageToCursor(items, page, perPage) {
  // TODO: compute the offset, slice, and only emit a cursor when items remain
  return { items: [], cursor: null };
}`,
    solution: `function legacyPageToCursor(items, page, perPage) {
  if (page < 1 || perPage < 1) return { items: [], cursor: null };
  const offset = (page - 1) * perPage;
  const slice = items.slice(offset, offset + perPage);
  const cursor = offset + perPage < items.length ? btoa('offset=' + (offset + perPage)) : null;
  return { items: slice, cursor };
}`,
    functionName: 'legacyPageToCursor',
    functionSignature: 'function legacyPageToCursor(items: any[], page: number, perPage: number): { items: any[]; cursor: string | null }',
    examples: [
      { input: [['a', 'b', 'c', 'd', 'e'], 1, 2], expected: { items: ['a', 'b'], cursor: 'b2Zmc2V0PTI=' } },
      { input: [['a', 'b', 'c', 'd', 'e'], 3, 2], expected: { items: ['e'], cursor: null } },
    ],
    hiddenTests: [
      { input: [['a', 'b', 'c', 'd', 'e'], 2, 2], expected: { items: ['c', 'd'], cursor: 'b2Zmc2V0PTQ=' } },
      { input: [['a', 'b', 'c', 'd'], 2, 2], expected: { items: ['c', 'd'], cursor: null } },
      { input: [['a', 'b'], 0, 2], expected: { items: [], cursor: null } },
      { input: [['a', 'b'], 1, 0], expected: { items: [], cursor: null } },
      { input: [['a', 'b'], 9, 2], expected: { items: [], cursor: null } },
      { input: [['a', 'b', 'c'], 1, 3], expected: { items: ['a', 'b', 'c'], cursor: null } },
    ],
    hint: 'The offset for page N is (N - 1) * perPage, but the cursor carries the offset of the *next* page.',
    explanation:
      'The adapter converts a 1-based page into an offset, slices, and emits a cursor that encodes the next offset only when something lies beyond the slice. The pitfalls are the off-by-one between page numbers and offsets and emitting a cursor for an exactly-full final page. Wrapping legacy offsets in the new cursor envelope lets old clients migrate without a flag day.',
  },
  {
    id: 'node-multi-key-stable-sort',
    number: 44,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Leaderboard sort by several keys with direction',
    difficulty: 'Easy',
    topic: 'Pagination & Data',
    statement: `A leaderboard sorts by a configurable list of keys. Each key is a field name, optionally prefixed with \`-\` for descending. Rows that tie on every key must keep their original relative order.

Implement \`sortLeaderboard(rows, keys)\`. Compare numbers numerically and strings with \`<\`/\`>\`; a field is compared only when the previous keys tie. Return a new array — do not mutate \`rows\`.`,
    buggyCode: `function sortLeaderboard(rows, keys) {
  // TODO: build a comparator over the key specs; copy before sorting
  return rows;
}`,
    solution: `function sortLeaderboard(rows, keys) {
  const specs = keys.map((k) => (k.startsWith('-') ? { field: k.slice(1), dir: -1 } : { field: k, dir: 1 }));
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const { field, dir } of specs) {
        const x = a.row[field];
        const y = b.row[field];
        if (x < y) return -dir;
        if (x > y) return dir;
      }
      return a.index - b.index;
    })
    .map((e) => e.row);
}`,
    functionName: 'sortLeaderboard',
    functionSignature: 'function sortLeaderboard(rows: object[], keys: string[]): object[]',
    examples: [
      {
        input: [[{ name: 'b', score: 5 }, { name: 'a', score: 5 }, { name: 'c', score: 9 }], ['-score', 'name']],
        expected: [{ name: 'c', score: 9 }, { name: 'a', score: 5 }, { name: 'b', score: 5 }],
      },
      { input: [[{ n: 'x', t: 2 }, { n: 'y', t: 1 }, { n: 'z', t: 2 }], ['t']], expected: [{ n: 'y', t: 1 }, { n: 'x', t: 2 }, { n: 'z', t: 2 }] },
    ],
    hiddenTests: [
      { input: [[], ['a']], expected: [] },
      {
        input: [[{ a: 1, b: 'z' }, { a: 1, b: 'a' }, { a: 0, b: 'm' }], ['a', '-b']],
        expected: [{ a: 0, b: 'm' }, { a: 1, b: 'z' }, { a: 1, b: 'a' }],
      },
      { input: [[{ v: 10 }, { v: 9 }, { v: 100 }], ['v']], expected: [{ v: 9 }, { v: 10 }, { v: 100 }] },
      { input: [[{ k: 1, i: 1 }, { k: 1, i: 2 }, { k: 1, i: 3 }], ['-k']], expected: [{ k: 1, i: 1 }, { k: 1, i: 2 }, { k: 1, i: 3 }] },
    ],
    hint: 'Pair each row with its original index and use it as the final tie-breaker — then stability no longer depends on the engine.',
    explanation:
      'The keys become a list of (field, direction) specs and the comparator walks them until one differs, falling back to the original index so ties keep their order regardless of engine sort stability. The pitfalls are sorting in place (mutating the caller\'s array) and comparing via subtraction, which breaks for strings. Multi-key ordering with a guaranteed tie rule is what makes paginated lists stable across requests.',
  },
  {
    id: 'node-region-sales-rollup',
    number: 45,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Region and category sales roll-up',
    difficulty: 'Medium',
    topic: 'Pagination & Data',
    statement: `A reporting endpoint turns raw sale rows into one summary line per (region, category) pair.

Implement \`rollupSales(rows)\` where each row is \`{ region, category, cents }\` (non-negative integers). For each distinct pair produce \`{ region, category, count, totalCents, avgCents, maxCents }\` where \`avgCents\` is \`totalCents / count\` rounded to the nearest integer (halves round up). Return the lines sorted by \`region\` ascending, then \`category\` ascending. An empty input yields \`[]\`.`,
    buggyCode: `function rollupSales(rows) {
  // TODO: group by a composite key, aggregate, then sort the groups
  return [];
}`,
    solution: `function rollupSales(rows) {
  const groups = new Map();
  for (const { region, category, cents } of rows) {
    const key = region + '\\u0000' + category;
    let g = groups.get(key);
    if (!g) {
      g = { region, category, count: 0, totalCents: 0, maxCents: 0 };
      groups.set(key, g);
    }
    g.count += 1;
    g.totalCents += cents;
    g.maxCents = Math.max(g.maxCents, cents);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, avgCents: Math.floor(g.totalCents / g.count + 0.5) }))
    .sort((a, b) => (a.region < b.region ? -1 : a.region > b.region ? 1 : a.category < b.category ? -1 : a.category > b.category ? 1 : 0));
}`,
    functionName: 'rollupSales',
    functionSignature: 'function rollupSales(rows: { region: string; category: string; cents: number }[]): { region: string; category: string; count: number; totalCents: number; avgCents: number; maxCents: number }[]',
    examples: [
      {
        input: [[{ region: 'west', category: 'tea', cents: 300 }, { region: 'east', category: 'tea', cents: 100 }, { region: 'west', category: 'tea', cents: 301 }]],
        expected: [
          { region: 'east', category: 'tea', count: 1, totalCents: 100, avgCents: 100, maxCents: 100 },
          { region: 'west', category: 'tea', count: 2, totalCents: 601, avgCents: 301, maxCents: 301 },
        ],
      },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[{ region: 'n', category: 'c', cents: 0 }]], expected: [{ region: 'n', category: 'c', count: 1, totalCents: 0, avgCents: 0, maxCents: 0 }] },
      {
        input: [[{ region: 'a', category: 'y', cents: 10 }, { region: 'a', category: 'x', cents: 20 }]],
        expected: [
          { region: 'a', category: 'x', count: 1, totalCents: 20, avgCents: 20, maxCents: 20 },
          { region: 'a', category: 'y', count: 1, totalCents: 10, avgCents: 10, maxCents: 10 },
        ],
      },
      {
        input: [[{ region: 'a', category: 'x', cents: 1 }, { region: 'a', category: 'x', cents: 2 }, { region: 'b', category: 'x', cents: 7 }, { region: 'a', category: 'x', cents: 9 }]],
        expected: [
          { region: 'a', category: 'x', count: 3, totalCents: 12, avgCents: 4, maxCents: 9 },
          { region: 'b', category: 'x', count: 1, totalCents: 7, avgCents: 7, maxCents: 7 },
        ],
      },
      {
        input: [[{ region: 'a', category: 'x', cents: 1 }, { region: 'a', category: 'x', cents: 2 }]],
        expected: [{ region: 'a', category: 'x', count: 2, totalCents: 3, avgCents: 2, maxCents: 2 }],
      },
    ],
    hint: 'Use a composite key that cannot collide (a separator no region name contains) and compute the average only after all rows are folded.',
    explanation:
      'Rows fold into a Map keyed by region and category, accumulating count, total and max in one pass; the average is derived at the end and the groups are sorted by the two string keys. The pitfalls are averaging incrementally (which accumulates rounding error), building the key with a separator that could appear in the data, and comparing strings with subtraction. Group-then-aggregate is the backbone of every dashboard query done in application code.',
  },
  {
    id: 'node-record-patch-diff',
    number: 46,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Record diff into an ordered patch list',
    difficulty: 'Hard',
    topic: 'Pagination & Data',
    statement: `A sync engine sends only what changed between two versions of a record, as a list of patch operations.

Implement \`diffRecords(before, after)\` for plain-object records:
- Recurse into keys whose value is a plain object on **both** sides. Arrays, \`null\` and primitives are atomic.
- A key present in \`before\` but not \`after\` → \`{ op: 'remove', path }\` (no \`value\` key).
- A key present in \`after\` but not \`before\` → \`{ op: 'add', path, value }\`.
- A key present on both sides with atomic values that are not deep-equal (arrays compared element-wise, objects vs non-objects always differ) → \`{ op: 'replace', path, value }\` with the \`after\` value.
- Paths are \`'/' + key\` segments joined, e.g. \`'/addr/zip'\`.

Return the operations sorted by \`path\` (plain string comparison). Identical records yield \`[]\`.`,
    buggyCode: `function diffRecords(before, after) {
  // TODO: walk both objects, emit add/remove/replace, then sort by path
  return [];
}`,
    solution: `function diffRecords(before, after) {
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const deepEq = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEq(x, b[i]));
    if (isObj(a) && isObj(b)) {
      const ka = Object.keys(a);
      const kb = Object.keys(b);
      return ka.length === kb.length && ka.every((k) => k in b && deepEq(a[k], b[k]));
    }
    return false;
  };
  const ops = [];
  const walk = (a, b, path) => {
    for (const key of Object.keys(a)) {
      const p = path + '/' + key;
      if (!(key in b)) ops.push({ op: 'remove', path: p });
      else if (isObj(a[key]) && isObj(b[key])) walk(a[key], b[key], p);
      else if (!deepEq(a[key], b[key])) ops.push({ op: 'replace', path: p, value: b[key] });
    }
    for (const key of Object.keys(b)) {
      if (!(key in a)) ops.push({ op: 'add', path: path + '/' + key, value: b[key] });
    }
  };
  walk(before, after, '');
  return ops.sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0));
}`,
    functionName: 'diffRecords',
    functionSignature: 'function diffRecords(before: Record<string, any>, after: Record<string, any>): { op: string; path: string; value?: any }[]',
    examples: [
      {
        input: [{ name: 'A', age: 3, addr: { zip: '1', city: 'x' } }, { name: 'A', age: 4, addr: { zip: '2' }, email: 'e' }],
        expected: [
          { op: 'remove', path: '/addr/city' },
          { op: 'replace', path: '/addr/zip', value: '2' },
          { op: 'replace', path: '/age', value: 4 },
          { op: 'add', path: '/email', value: 'e' },
        ],
      },
      { input: [{ tags: ['a', 'b'] }, { tags: ['a', 'b'] }], expected: [] },
    ],
    hiddenTests: [
      { input: [{ tags: ['a'] }, { tags: ['a', 'b'] }], expected: [{ op: 'replace', path: '/tags', value: ['a', 'b'] }] },
      { input: [{ a: { b: 1 } }, { a: 5 }], expected: [{ op: 'replace', path: '/a', value: 5 }] },
      { input: [{ a: 5 }, { a: { b: 1 } }], expected: [{ op: 'replace', path: '/a', value: { b: 1 } }] },
      { input: [{}, { x: null }], expected: [{ op: 'add', path: '/x', value: null }] },
      { input: [{ x: null }, {}], expected: [{ op: 'remove', path: '/x' }] },
      { input: [{ a: { b: { c: 1 } }, z: 1 }, { a: { b: { c: 1, d: 2 } } }], expected: [{ op: 'add', path: '/a/b/d', value: 2 }, { op: 'remove', path: '/z' }] },
      { input: [{ n: 1 }, { n: '1' }], expected: [{ op: 'replace', path: '/n', value: '1' }] },
    ],
    hint: 'Use `key in obj` rather than truthiness so a `null` value counts as present; arrays need element-wise equality, not `===`.',
    explanation:
      'The walker visits every key of the old record to find removals and replacements, recursing only when both sides are plain objects, then scans the new record for additions; the result is sorted by path so the output is canonical. The pitfalls are treating `null` or `0` as "absent", comparing arrays by reference (every array would look changed), and emitting a `value` key on removes. Minimal patch lists are what keep sync payloads small and mergeable.',
  },

  // ---------------------------------------------------------------- Money & Time
  {
    id: 'node-tab-split-cents',
    number: 47,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Weighted tab split without losing a cent',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement: `A group-dining app splits a bill by weights (for example, shares of what each person ordered). The parts must be whole cents and add up exactly to the total — no floating point.

Implement \`splitTab(totalCents, weights)\` where \`totalCents >= 0\` and \`weights\` are positive integers:
- Each part starts at \`floor(totalCents * w / W)\` where \`W\` is the sum of weights.
- Distribute the leftover cents one at a time to the parts with the largest remainder \`(totalCents * w) % W\`; on equal remainders the earlier index wins.

Return the list of parts in input order. Use integer arithmetic only.`,
    buggyCode: `function splitTab(totalCents, weights) {
  // TODO: floor shares, then hand out leftovers by largest remainder (earliest on ties)
  return weights.map(() => 0);
}`,
    solution: `function splitTab(totalCents, weights) {
  const W = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((w) => Math.floor((totalCents * w) / W));
  const remainders = weights.map((w, i) => ({ i, r: (totalCents * w) % W }));
  let leftover = totalCents - parts.reduce((a, b) => a + b, 0);
  remainders.sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; k < leftover; k++) parts[remainders[k].i] += 1;
  return parts;
}`,
    functionName: 'splitTab',
    functionSignature: 'function splitTab(totalCents: number, weights: number[]): number[]',
    examples: [
      { input: [100, [1, 1, 1]], expected: [34, 33, 33] },
      { input: [1000, [3, 1]], expected: [750, 250] },
    ],
    hiddenTests: [
      { input: [5, [2, 3]], expected: [2, 3] },
      { input: [7, [1, 1, 1, 1]], expected: [2, 2, 2, 1] },
      { input: [10, [1, 2, 3]], expected: [2, 3, 5] },
      { input: [0, [1, 2]], expected: [0, 0] },
      { input: [101, [50, 50]], expected: [51, 50] },
      { input: [1, [1, 1, 1]], expected: [1, 0, 0] },
    ],
    hint: 'The leftover is always less than the number of parts, so a sort by (remainder desc, index asc) and a short loop settles it.',
    explanation:
      'Integer division gives each part its floor share; the cents that division dropped are handed out by largest remainder with a stable index tie-break, so the parts always sum to the total. The pitfalls are rounding each share independently (the sum drifts by a cent or two) and computing shares with floating-point percentages. Largest-remainder apportionment is the standard way to split money, seats or quotas exactly.',
  },
  {
    id: 'node-currency-rounding-modes',
    number: 48,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Currency-aware decimal rounding modes',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement: `Prices are exchanged as decimal strings and must be rounded to a currency's minor-unit precision with an explicit rounding mode — never through floating point.

Implement \`roundMoney(amount, currency, mode)\` where \`amount\` matches \`-?digits(.digits)?\`, currency precision is \`JPY: 0, KRW: 0, USD: 2, EUR: 2, GBP: 2, KWD: 3, BHD: 3\` (any other currency → return \`null\`), and \`mode\` is:
- \`'truncate'\` — drop extra digits (toward zero).
- \`'half-up'\` — exactly half rounds away from zero.
- \`'half-even'\` — exactly half rounds to the even last digit.

Return a string with exactly the currency's number of decimals (no decimal point for 0 decimals); a result of zero has no minus sign.`,
    buggyCode: `function roundMoney(amount, currency, mode) {
  // TODO: split sign/int/frac, keep the required digits, decide by the dropped digits
  return null;
}`,
    solution: `function roundMoney(amount, currency, mode) {
  const precision = { JPY: 0, KRW: 0, USD: 2, EUR: 2, GBP: 2, KWD: 3, BHD: 3 }[currency];
  if (precision === undefined) return null;
  const negative = amount.startsWith('-');
  const [intPart, fracPart = ''] = (negative ? amount.slice(1) : amount).split('.');
  const kept = (fracPart + '0'.repeat(precision)).slice(0, precision);
  const dropped = fracPart.slice(precision);
  let units = BigInt(intPart + kept);
  if (dropped.length > 0 && mode !== 'truncate') {
    const first = dropped.charCodeAt(0) - 48;
    const restNonZero = /[1-9]/.test(dropped.slice(1));
    const above = first > 5 || (first === 5 && restNonZero);
    const tie = first === 5 && !restNonZero;
    if (above) units += 1n;
    else if (tie && (mode === 'half-up' || units % 2n === 1n)) units += 1n;
  }
  let s = units.toString();
  if (precision > 0) {
    s = s.padStart(precision + 1, '0');
    s = s.slice(0, -precision) + '.' + s.slice(-precision);
  }
  return negative && units !== 0n ? '-' + s : s;
}`,
    functionName: 'roundMoney',
    functionSignature: "function roundMoney(amount: string, currency: string, mode: 'truncate' | 'half-up' | 'half-even'): string | null",
    examples: [
      { input: ['12.345', 'USD', 'half-up'], expected: '12.35' },
      { input: ['12.345', 'USD', 'half-even'], expected: '12.34' },
    ],
    hiddenTests: [
      { input: ['2.5', 'JPY', 'half-even'], expected: '2' },
      { input: ['3.5', 'JPY', 'half-even'], expected: '4' },
      { input: ['-1.005', 'USD', 'half-up'], expected: '-1.01' },
      { input: ['-1.005', 'USD', 'truncate'], expected: '-1.00' },
      { input: ['0.9999', 'KWD', 'truncate'], expected: '0.999' },
      { input: ['7', 'USD', 'half-up'], expected: '7.00' },
      { input: ['1.2', 'XXX', 'half-up'], expected: null },
      { input: ['-0.004', 'USD', 'half-up'], expected: '0.00' },
      { input: ['1.0050001', 'USD', 'half-even'], expected: '1.01' },
      { input: ['0.001', 'USD', 'half-even'], expected: '0.00' },
    ],
    hint: 'Work on the magnitude as a digit string: the first dropped digit plus "is anything after it non-zero" is all a rounding decision needs.',
    explanation:
      'The amount is split into sign, integer and fraction strings; the kept digits become an integer count of minor units and the dropped digits decide whether to bump it, with the tie rule depending on the mode. The pitfalls are going through `Number` (`1.005 * 100` is `100.49999…`), applying half-up toward positive infinity instead of away from zero, and printing `-0.00`. Exchanges and ledgers specify the rounding mode per currency precisely because these differences are real money at scale.',
  },
  {
    id: 'node-service-window-minutes',
    number: 49,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Open minutes across service windows',
    difficulty: 'Hard',
    topic: 'Money & Time',
    statement: `A support SLA counts only the minutes a help desk is open. Time is modelled as *minutes since Monday 00:00 of week 0*: day index \`floor(t / 1440)\`, weekday \`day % 7\` (\`0\` = Monday), and minute-of-day \`t % 1440\`. No calendar library — just arithmetic.

Implement \`openMinutesBetween(startMin, endMin, hours, holidays)\`:
- \`hours\` maps weekday (\`0\`–\`6\`) to \`[openMin, closeMin]\` (minutes from midnight, close exclusive); a missing weekday is closed all day.
- \`holidays\` is a list of day indexes that are closed regardless of weekday.
- Count the minutes in \`[startMin, endMin)\` that fall inside an open window. The range may span many days and weeks.
- Return \`0\` when \`endMin <= startMin\`.`,
    buggyCode: `function openMinutesBetween(startMin, endMin, hours, holidays) {
  // TODO: iterate day by day, intersect each day's window with [start, end)
  return 0;
}`,
    solution: `function openMinutesBetween(startMin, endMin, hours, holidays) {
  if (endMin <= startMin) return 0;
  const closed = new Set(holidays);
  let total = 0;
  for (let day = Math.floor(startMin / 1440); day * 1440 < endMin; day++) {
    if (closed.has(day)) continue;
    const window = hours[day % 7];
    if (!window) continue;
    const open = day * 1440 + window[0];
    const close = day * 1440 + window[1];
    const lo = Math.max(open, startMin);
    const hi = Math.min(close, endMin);
    if (hi > lo) total += hi - lo;
  }
  return total;
}`,
    functionName: 'openMinutesBetween',
    functionSignature: 'function openMinutesBetween(startMin: number, endMin: number, hours: Record<number, [number, number]>, holidays: number[]): number',
    examples: [
      { input: [480, 1080, { 0: [540, 1020], 1: [540, 1020], 2: [540, 1020], 3: [540, 1020], 4: [540, 1020] }, []], expected: 480 },
      { input: [6720, 10680, { 0: [540, 1020], 1: [540, 1020], 2: [540, 1020], 3: [540, 1020], 4: [540, 1020] }, []], expected: 120 },
    ],
    hiddenTests: [
      { input: [600, 600, { 0: [540, 1020] }, []], expected: 0 },
      { input: [0, 1440, { 0: [540, 1020], 1: [540, 1020] }, [0]], expected: 0 },
      { input: [720, 750, { 0: [540, 1020] }, []], expected: 30 },
      { input: [10080, 20160, { 0: [540, 1020], 1: [540, 1020], 2: [540, 1020], 3: [540, 1020], 4: [540, 1020] }, [9]], expected: 1920 },
      { input: [0, 20160, { 5: [600, 660] }, []], expected: 120 },
      { input: [600, 2010, { 0: [540, 1020], 1: [540, 1020] }, []], expected: 450 },
    ],
    hint: 'Convert each day\'s window to absolute minutes, clamp it against [start, end), and add the overlap only when it is positive.',
    explanation:
      'The range is walked one day at a time; each day\'s window is lifted into absolute minutes, intersected with the query range, and the positive overlap is summed, with holidays and closed weekdays skipped. The pitfalls are counting whole days without clamping the first and last partial days, and using the weekday for the holiday check instead of the absolute day index. Business-hour arithmetic like this underpins SLA timers, shipping estimates and on-call schedules.',
  },
  {
    id: 'node-plan-switch-proration',
    number: 50,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Mid-cycle plan switch proration',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement: `When a subscriber switches plans mid-cycle, the unused portion of the old plan is credited and the same portion of the new plan is charged.

Implement \`prorateSwitch(cycleStartDay, cycleEndDay, switchDay, oldCents, newCents)\` where days are integers and the cycle is \`[cycleStartDay, cycleEndDay)\`:
- If \`switchDay < cycleStartDay\` or \`switchDay >= cycleEndDay\`, return \`null\`.
- \`usedDays = switchDay - cycleStartDay\`, \`remainingDays = cycleEndDay - switchDay\`, \`totalDays = cycleEndDay - cycleStartDay\`.
- \`credit = round(oldCents * remainingDays / totalDays)\` and \`charge = round(newCents * remainingDays / totalDays)\`, where round is half-up to a whole cent, done with integer arithmetic.
- \`due = charge - credit\` (negative means a refund).

Return \`{ usedDays, remainingDays, credit, charge, due }\`.`,
    buggyCode: `function prorateSwitch(cycleStartDay, cycleEndDay, switchDay, oldCents, newCents) {
  // TODO: validate the switch day, then prorate both amounts with half-up integer rounding
  return null;
}`,
    solution: `function prorateSwitch(cycleStartDay, cycleEndDay, switchDay, oldCents, newCents) {
  if (switchDay < cycleStartDay || switchDay >= cycleEndDay) return null;
  const totalDays = cycleEndDay - cycleStartDay;
  const usedDays = switchDay - cycleStartDay;
  const remainingDays = cycleEndDay - switchDay;
  const prorate = (cents) => Math.floor((2 * cents * remainingDays + totalDays) / (2 * totalDays));
  const credit = prorate(oldCents);
  const charge = prorate(newCents);
  return { usedDays, remainingDays, credit, charge, due: charge - credit };
}`,
    functionName: 'prorateSwitch',
    functionSignature: 'function prorateSwitch(cycleStartDay: number, cycleEndDay: number, switchDay: number, oldCents: number, newCents: number): { usedDays: number; remainingDays: number; credit: number; charge: number; due: number } | null',
    examples: [
      { input: [0, 30, 10, 3000, 6000], expected: { usedDays: 10, remainingDays: 20, credit: 2000, charge: 4000, due: 2000 } },
      { input: [0, 30, 0, 1000, 500], expected: { usedDays: 0, remainingDays: 30, credit: 1000, charge: 500, due: -500 } },
    ],
    hiddenTests: [
      { input: [0, 31, 15, 999, 999], expected: { usedDays: 15, remainingDays: 16, credit: 516, charge: 516, due: 0 } },
      { input: [0, 30, 30, 1000, 2000], expected: null },
      { input: [5, 35, 4, 1000, 2000], expected: null },
      { input: [0, 30, 29, 3000, 3000], expected: { usedDays: 29, remainingDays: 1, credit: 100, charge: 100, due: 0 } },
      { input: [0, 4, 1, 6, 0], expected: { usedDays: 1, remainingDays: 3, credit: 5, charge: 0, due: -5 } },
      { input: [0, 3, 1, 1, 1], expected: { usedDays: 1, remainingDays: 2, credit: 1, charge: 1, due: 0 } },
    ],
    hint: 'Half-up on integers is floor((2 * numerator + denominator) / (2 * denominator)) — no floats needed.',
    explanation:
      'The remaining fraction of the cycle is applied to both the old price (as a credit) and the new price (as a charge), each rounded half-up with an integer formula, and the difference is what the customer owes. The pitfalls are accepting a switch on the end day (which is outside the cycle), rounding once on the net instead of per component, and using `Math.round` on floats that may land on `x.4999…`. Billing systems prorate this way so invoices reconcile to the cent.',
  },
];
