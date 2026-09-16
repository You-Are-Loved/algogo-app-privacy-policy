// Python backend build problems (services, caches, parsers, schedulers) that run in Pyodide. `language: 'python'`, `kind: 'build'`.
// Shares the BugFixProblem shape: `kind: 'build'` problems show a skeleton in
// the editor and grade the user's implementation against tests (Python /
// JavaScript) or rules (Java / Swift / Kotlin). See bugFixes.ts for the type.

import type { BugFixProblem } from './bugFixes';

export const pythonBuildProblems: BugFixProblem[] = [
  {
    id: "py-build-typed-route-matcher",
    number: 1,
    language: 'python',
    kind: 'build',
    title: "Typed Route Matcher",
    difficulty: "Medium",
    topic: "Services & APIs",
    statement:
      "You are writing the request router for a bike-share API. Implement `match_route(routes, method, path)`.\n\n`routes` is a list of `[method, pattern, name]` entries checked **in order** — the first entry that matches wins. A pattern is a `/`-separated path where a segment written as `{name}` captures a string and `{name:int}` captures an integer: it only matches if the incoming segment is made of digits, and the captured value is converted with `int()` (so `007` becomes `7`).\n\nRules:\n- The HTTP method must match exactly.\n- The pattern and the path must have the same number of segments; literal segments must match exactly.\n- A single trailing `/` on the path is ignored (`/docks/` matches `/docks`), but an empty segment anywhere else never matches a parameter.\n- Return `{\"name\": name, \"params\": {...}}` for the winning route (empty dict when there are no parameters), or `None` when nothing matches.",
    functionName: "match_route",
    functionSignature: "def match_route(routes: list, method: str, path: str) -> dict:",
    buggyCode:
      "def match_route(routes: list, method: str, path: str) -> dict:\n    # TODO: walk the routes in order and return the first typed match\n    return None\n",
    solution:
      "def match_route(routes: list, method: str, path: str) -> dict:\n    if len(path) > 1 and path.endswith('/'):\n        path = path[:-1]\n    segments = path.split('/')\n    for route_method, pattern, name in routes:\n        if route_method != method:\n            continue\n        parts = pattern.split('/')\n        if len(parts) != len(segments):\n            continue\n        params = {}\n        matched = True\n        for part, seg in zip(parts, segments):\n            if part.startswith('{') and part.endswith('}'):\n                spec = part[1:-1]\n                pname, _, ptype = spec.partition(':')\n                if seg == '':\n                    matched = False\n                    break\n                if ptype == 'int':\n                    if not seg.isdigit():\n                        matched = False\n                        break\n                    params[pname] = int(seg)\n                else:\n                    params[pname] = seg\n            elif part != seg:\n                matched = False\n                break\n        if matched:\n            return {'name': name, 'params': params}\n    return None\n",
    hint: "Split both the pattern and the path on \"/\" and compare segment by segment; a \"{name:int}\" segment only matches when the incoming segment isdigit().",
    explanation:
      "The router tokenizes the pattern and the path into segments and compares them pairwise, treating `{name}` and `{name:int}` as captures with a type check. Because routes are tried in declaration order, a typed parameter that fails to match lets a later literal route (like `/docks/all`) win. Typed captures push validation to the edge so handlers never see a non-numeric id.",
    examples: [
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "GET", "/docks/42/bikes/ab-7"], expected: {"name": "dock_bike", "params": {"dock_id": 42, "tag": "ab-7"}} },
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "GET", "/docks/all"], expected: {"name": "all_docks", "params": {}} },
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "POST", "/docks/"], expected: {"name": "create_dock", "params": {}} },
    ],
    hiddenTests: [
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "GET", "/docks/007"], expected: {"name": "dock", "params": {"dock_id": 7}} },
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "DELETE", "/docks/42"], expected: null },
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/docks/{dock_id:int}", "dock"], ["POST", "/docks", "create_dock"], ["GET", "/docks/all", "all_docks"]], "GET", "/docks/42/bikes"], expected: null },
      { input: [[["GET", "/docks/{dock_id:int}/bikes/{tag}", "dock_bike"], ["GET", "/riders/{handle}", "rider"]], "GET", "/docks//bikes/x"], expected: null },
      { input: [[["GET", "/riders/{handle}", "rider"]], "GET", "/riders/sam_1/"], expected: {"name": "rider", "params": {"handle": "sam_1"}} },
    ],
  },
  {
    id: "py-build-opaque-page-cursor",
    number: 2,
    language: 'python',
    kind: 'build',
    title: "Opaque Page Cursor",
    difficulty: "Easy",
    topic: "Services & APIs",
    statement:
      "A podcast app lists episodes with cursor pagination. Implement `page_through(items, limit, cursor)`.\n\n`items` is a list of dicts sorted ascending by their integer `\"id\"`. The cursor is opaque to clients: it is the base64 (standard alphabet, `base64.b64encode`) of the ASCII text `after:<id>` where `<id>` is the last id on the previous page.\n\n- When `cursor` is `None`, start from the first item; otherwise return items whose `id` is strictly greater than the cursor's id.\n- Return `{\"items\": page, \"next_cursor\": cursor_or_None}` where `page` holds at most `limit` items. `next_cursor` is only set when more items remain after this page; when the remaining items fit exactly, it is `None`.\n- If the cursor cannot be decoded, or the decoded text does not look like `after:<digits>`, return `{\"error\": \"bad_cursor\"}`.",
    functionName: "page_through",
    functionSignature: "def page_through(items: list, limit: int, cursor) -> dict:",
    buggyCode:
      "import base64\n\ndef page_through(items: list, limit: int, cursor) -> dict:\n    # TODO: decode the cursor, slice the page, encode the next cursor\n    return {'items': items[:limit], 'next_cursor': None}\n",
    solution:
      "import base64\n\ndef page_through(items: list, limit: int, cursor) -> dict:\n    after = None\n    if cursor is not None:\n        try:\n            raw = base64.b64decode(cursor.encode('ascii')).decode('ascii')\n        except Exception:\n            return {'error': 'bad_cursor'}\n        prefix, _, digits = raw.partition(':')\n        if prefix != 'after' or not digits.isdigit():\n            return {'error': 'bad_cursor'}\n        after = int(digits)\n    remaining = [it for it in items if after is None or it['id'] > after]\n    page = remaining[:limit]\n    next_cursor = None\n    if len(remaining) > limit:\n        token = 'after:%d' % page[-1]['id']\n        next_cursor = base64.b64encode(token.encode('ascii')).decode('ascii')\n    return {'items': page, 'next_cursor': next_cursor}\n",
    hint: "Only emit next_cursor when len(remaining) > limit; base64.b64encode wants bytes and returns bytes.",
    explanation:
      "Cursor pagination encodes \"where the previous page ended\" so the next request can filter with `id > after` instead of skipping `offset` rows, which stays correct when rows are inserted or deleted between requests. Keeping the token opaque (base64 of a private format) lets you change the format later. The classic mistake is emitting a next cursor when the page is exactly full, which makes clients fetch an empty page.",
    examples: [
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}, {"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}, {"id": 21, "t": "Finale"}], 2, null], expected: {"items": [{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}], "next_cursor": "YWZ0ZXI6NQ=="} },
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}, {"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}, {"id": 21, "t": "Finale"}], 2, "YWZ0ZXI6NQ=="], expected: {"items": [{"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}], "next_cursor": "YWZ0ZXI6MTM="} },
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}, {"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}, {"id": 21, "t": "Finale"}], 2, "YWZ0ZXI6MTM="], expected: {"items": [{"id": 21, "t": "Finale"}], "next_cursor": null} },
    ],
    hiddenTests: [
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}, {"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}, {"id": 21, "t": "Finale"}], 5, null], expected: {"items": [{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}, {"id": 8, "t": "Harbor"}, {"id": 13, "t": "Echoes"}, {"id": 21, "t": "Finale"}], "next_cursor": null} },
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}], 2, "not-a-cursor!"], expected: {"error": "bad_cursor"} },
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}], 2, "cGFnZTo5"], expected: {"error": "bad_cursor"} },
      { input: [[{"id": 3, "t": "Pilot"}, {"id": 5, "t": "Storms"}], 3, "YWZ0ZXI6NQ=="], expected: {"items": [], "next_cursor": null} },
      { input: [[], 2, null], expected: {"items": [], "next_cursor": null} },
    ],
  },
  {
    id: "py-build-replay-safe-topups",
    number: 3,
    language: 'python',
    kind: 'build',
    title: "Replay-Safe Top-Ups",
    difficulty: "Medium",
    topic: "Services & APIs",
    statement:
      "An arcade issues prepaid play cards, and mobile clients retry top-up requests when the network drops. Implement `settle_topups(ops)` so a retried request is never applied twice.\n\nEach op is a dict `{\"key\": str_or_None, \"amount\": int}` processed in order against a single card balance that starts at 0. Return one result dict per op:\n- First time a non-empty `key` is seen: apply the amount and return `{\"status\": \"applied\", \"balance\": <balance after applying>}`; remember the key together with the amount and that balance.\n- Same key again with the **same** amount: do not touch the balance; return `{\"status\": \"replayed\", \"balance\": <the balance recorded when it was first applied>}`.\n- Same key again with a **different** amount: reject it; return `{\"status\": \"conflict\", \"balance\": <current balance>}`.\n- A missing, `None`, or empty-string key is not idempotent: always apply it and return `\"applied\"` with the new balance, without remembering anything.",
    functionName: "settle_topups",
    functionSignature: "def settle_topups(ops: list) -> list:",
    buggyCode:
      "def settle_topups(ops: list) -> list:\n    # TODO: apply each op once, replay or reject repeats by key\n    results = []\n    balance = 0\n    for op in ops:\n        balance += op['amount']\n        results.append({'status': 'applied', 'balance': balance})\n    return results\n",
    solution:
      "def settle_topups(ops: list) -> list:\n    balance = 0\n    seen = {}\n    results = []\n    for op in ops:\n        key = op.get('key')\n        amount = op['amount']\n        if not key:\n            balance += amount\n            results.append({'status': 'applied', 'balance': balance})\n            continue\n        if key in seen:\n            first_amount, first_balance = seen[key]\n            if first_amount == amount:\n                results.append({'status': 'replayed', 'balance': first_balance})\n            else:\n                results.append({'status': 'conflict', 'balance': balance})\n            continue\n        balance += amount\n        seen[key] = (amount, balance)\n        results.append({'status': 'applied', 'balance': balance})\n    return results\n",
    hint: "Store (amount, balance_after) per key the first time you see it; a replay returns the stored balance, not the current one.",
    explanation:
      "Idempotency keys let a client retry safely: the server stores the outcome of the first request under the key and replays that stored response for repeats. Returning the *original* response (not the current balance) matters because other operations may have run in between. A repeat with a different payload is a bug on the client side and must be rejected rather than silently applied.",
    examples: [
      { input: [[{"key": "k1", "amount": 500}, {"key": "k1", "amount": 500}, {"key": "k2", "amount": 250}]], expected: [{"status": "applied", "balance": 500}, {"status": "replayed", "balance": 500}, {"status": "applied", "balance": 750}] },
      { input: [[{"key": "a", "amount": 100}, {"key": "b", "amount": 300}, {"key": "a", "amount": 100}, {"key": "a", "amount": 999}]], expected: [{"status": "applied", "balance": 100}, {"status": "applied", "balance": 400}, {"status": "replayed", "balance": 100}, {"status": "conflict", "balance": 400}] },
    ],
    hiddenTests: [
      { input: [[{"key": null, "amount": 50}, {"key": null, "amount": 50}, {"key": "", "amount": 25}, {"amount": 25}]], expected: [{"status": "applied", "balance": 50}, {"status": "applied", "balance": 100}, {"status": "applied", "balance": 125}, {"status": "applied", "balance": 150}] },
      { input: [[{"key": "x", "amount": 100}, {"key": "y", "amount": 100}, {"key": "x", "amount": 100}, {"key": "y", "amount": 100}]], expected: [{"status": "applied", "balance": 100}, {"status": "applied", "balance": 200}, {"status": "replayed", "balance": 100}, {"status": "replayed", "balance": 200}] },
      { input: [[]], expected: [] },
      { input: [[{"key": "r", "amount": 40}, {"key": "r", "amount": 41}, {"key": "r", "amount": 40}, {"key": "s", "amount": -10}]], expected: [{"status": "applied", "balance": 40}, {"status": "conflict", "balance": 40}, {"status": "replayed", "balance": 40}, {"status": "applied", "balance": 30}] },
    ],
  },
  {
    id: "py-build-uniform-reply-envelope",
    number: 4,
    language: 'python',
    kind: 'build',
    title: "Uniform Reply Envelope",
    difficulty: "Easy",
    topic: "Services & APIs",
    statement:
      "Every response from a florist's order service must share one shape so clients can parse it blindly. Implement `wrap_reply(payload, request_id, errors)`.\n\n- `errors` may be `None`, an empty list, or a list whose entries are either a plain string or a dict with optional `\"code\"` and `\"message\"` keys. Normalize every entry to `{\"code\": ..., \"message\": ...}`: a string becomes `{\"code\": \"error\", \"message\": <the string>}`; a dict keeps its keys, defaulting `code` to `\"error\"` and `message` to `\"\"`.\n- When there is at least one error, return `{\"ok\": False, \"request_id\": request_id, \"data\": None, \"errors\": <normalized list>}` — the payload is dropped.\n- Otherwise return `{\"ok\": True, \"request_id\": request_id, \"data\": payload, \"errors\": []}`. A payload of `None`, `0`, or `[]` is still a success.",
    functionName: "wrap_reply",
    functionSignature: "def wrap_reply(payload, request_id: str, errors) -> dict:",
    buggyCode:
      "def wrap_reply(payload, request_id: str, errors) -> dict:\n    # TODO: normalize errors and build the envelope\n    return {'ok': True, 'request_id': request_id, 'data': payload, 'errors': errors}\n",
    solution:
      "def wrap_reply(payload, request_id: str, errors) -> dict:\n    normalized = []\n    for entry in errors or []:\n        if isinstance(entry, str):\n            normalized.append({'code': 'error', 'message': entry})\n        else:\n            normalized.append({'code': entry.get('code', 'error'), 'message': entry.get('message', '')})\n    if normalized:\n        return {'ok': False, 'request_id': request_id, 'data': None, 'errors': normalized}\n    return {'ok': True, 'request_id': request_id, 'data': payload, 'errors': []}\n",
    hint: "Normalize first, then decide success by whether the normalized list is empty — never by whether payload is truthy.",
    explanation:
      "A response envelope gives every reply the same top-level keys so clients branch on `ok` instead of guessing from the shape. Normalizing loose error inputs into `{code, message}` at one choke point keeps the rest of the service simple. Deciding success from the error list (not from the truthiness of the payload) avoids misreporting empty-but-valid results.",
    examples: [
      { input: [{"order": 17, "stems": 12}, "req-1", null], expected: {"ok": true, "request_id": "req-1", "data": {"order": 17, "stems": 12}, "errors": []} },
      { input: [null, "req-2", ["out of tulips", {"code": "limit", "message": "max 50 stems"}]], expected: {"ok": false, "request_id": "req-2", "data": null, "errors": [{"code": "error", "message": "out of tulips"}, {"code": "limit", "message": "max 50 stems"}]} },
    ],
    hiddenTests: [
      { input: [[], "req-3", []], expected: {"ok": true, "request_id": "req-3", "data": [], "errors": []} },
      { input: [{"order": 9}, "req-4", [{"code": "auth"}]], expected: {"ok": false, "request_id": "req-4", "data": null, "errors": [{"code": "auth", "message": ""}]} },
      { input: [0, "req-5", null], expected: {"ok": true, "request_id": "req-5", "data": 0, "errors": []} },
      { input: [{"x": 1}, "req-6", [{}]], expected: {"ok": false, "request_id": "req-6", "data": null, "errors": [{"code": "error", "message": ""}]} },
    ],
  },
  {
    id: "py-build-jittered-retry-plan",
    number: 5,
    language: 'python',
    kind: 'build',
    title: "Jittered Retry Plan",
    difficulty: "Easy",
    topic: "Services & APIs",
    statement:
      "A shipping-label service calls a flaky carrier API and needs a deterministic retry schedule it can unit-test. Implement `retry_plan(base_ms, factor, cap_ms, seeds)`.\n\n`seeds` is a list of floats in `[0, 1]`, one per retry attempt; the length of `seeds` is the number of attempts. For attempt `i` (0-based):\n- `raw = min(cap_ms, base_ms * factor ** i)` — exponential growth, clipped at the cap.\n- Apply \"equal jitter\": `delay = raw / 2 + (raw / 2) * seeds[i]`.\n- Truncate the delay to an integer with `int()`.\n\nReturn the list of integer delays. An empty `seeds` list returns `[]`.",
    functionName: "retry_plan",
    functionSignature: "def retry_plan(base_ms: int, factor: int, cap_ms: int, seeds: list) -> list:",
    buggyCode:
      "def retry_plan(base_ms: int, factor: int, cap_ms: int, seeds: list) -> list:\n    # TODO: exponential growth, cap, equal jitter, truncate\n    return [base_ms for _ in seeds]\n",
    solution:
      "def retry_plan(base_ms: int, factor: int, cap_ms: int, seeds: list) -> list:\n    delays = []\n    for i, seed in enumerate(seeds):\n        raw = min(cap_ms, base_ms * (factor ** i))\n        half = raw / 2\n        delays.append(int(half + half * seed))\n    return delays\n",
    hint: "Compute raw = min(cap, base * factor**i) first, then jitter only the top half of it.",
    explanation:
      "Exponential backoff spaces retries out so a struggling dependency gets room to recover, the cap keeps the worst-case wait bounded, and jitter spreads simultaneous retries from many clients so they do not thunder back in lockstep. Equal jitter keeps at least half the backoff, so retries never collapse toward zero. Passing the random seeds in makes the schedule reproducible in tests.",
    examples: [
      { input: [100, 2, 1000, [0, 0.5, 1, 0.25, 0.9]], expected: [50, 150, 400, 500, 950] },
      { input: [100, 2, 1000, [1, 1, 1, 1, 1, 1]], expected: [100, 200, 400, 800, 1000, 1000] },
    ],
    hiddenTests: [
      { input: [250, 3, 5000, [0.2, 0.2, 0.2, 0.2]], expected: [150, 450, 1350, 3000] },
      { input: [50, 2, 400, []], expected: [] },
      { input: [1, 10, 999999, [0.5, 0.5, 0.5, 0.5, 0.5]], expected: [0, 7, 75, 750, 7500] },
      { input: [200, 2, 200, [0, 0.99, 0.5]], expected: [100, 199, 150] },
    ],
  },
  {
    id: "py-build-bulk-patch-ledger",
    number: 6,
    language: 'python',
    kind: 'build',
    title: "Bulk Patch Ledger",
    difficulty: "Medium",
    topic: "Services & APIs",
    statement:
      "A gym's member service accepts a batch of partial updates and must report exactly which ones landed. Implement `bulk_patch(records, patches)`.\n\n`records` is a list of dicts each with a unique `\"id\"`. Each patch is `{\"id\": ..., \"fields\": {...}}`. Process patches in order and never abort the batch. A patch fails, with the first matching reason, when:\n1. `\"duplicate\"` — a patch for the same id already appeared earlier in this batch (whether or not that one succeeded);\n2. `\"not_found\"` — no record has that id;\n3. `\"immutable_field\"` — `fields` contains the key `\"id\"`.\n\nA successful patch merges `fields` into the record (overwriting existing keys, adding new ones). Return `{\"updated\": [ids in order], \"failed\": [{\"id\": ..., \"reason\": ...} in order], \"records\": <all records in their original order, with successful patches applied>}`. Do not mutate the input lists or dicts.",
    functionName: "bulk_patch",
    functionSignature: "def bulk_patch(records: list, patches: list) -> dict:",
    buggyCode:
      "def bulk_patch(records: list, patches: list) -> dict:\n    # TODO: apply what you can, report the rest\n    return {'updated': [], 'failed': [], 'records': records}\n",
    solution:
      "def bulk_patch(records: list, patches: list) -> dict:\n    by_id = {r['id']: dict(r) for r in records}\n    updated = []\n    failed = []\n    seen = set()\n    for patch in patches:\n        pid = patch['id']\n        if pid in seen:\n            failed.append({'id': pid, 'reason': 'duplicate'})\n            continue\n        seen.add(pid)\n        if pid not in by_id:\n            failed.append({'id': pid, 'reason': 'not_found'})\n            continue\n        if 'id' in patch['fields']:\n            failed.append({'id': pid, 'reason': 'immutable_field'})\n            continue\n        by_id[pid].update(patch['fields'])\n        updated.append(pid)\n    return {\n        'updated': updated,\n        'failed': failed,\n        'records': [by_id[r['id']] for r in records],\n    }\n",
    hint: "Copy each record into a dict keyed by id, track the ids you have already seen in this batch, and check the failure reasons in the stated order.",
    explanation:
      "Bulk endpoints should be partial-success by design: one bad item must not roll back the rest, and the caller needs a per-item report to retry only what failed. Checking failure reasons in a fixed order keeps the report deterministic. Copying the records before mutating keeps the function pure, which is what makes it safe to retry.",
    examples: [
      { input: [[{"id": 1, "name": "Ana", "tier": "basic"}, {"id": 2, "name": "Bo", "tier": "basic"}], [{"id": 2, "fields": {"tier": "gold"}}, {"id": 3, "fields": {"tier": "gold"}}, {"id": 1, "fields": {"id": 9}}]], expected: {"updated": [2], "failed": [{"id": 3, "reason": "not_found"}, {"id": 1, "reason": "immutable_field"}], "records": [{"id": 1, "name": "Ana", "tier": "basic"}, {"id": 2, "name": "Bo", "tier": "gold"}]} },
      { input: [[{"id": "m1", "visits": 3}], [{"id": "m1", "fields": {"visits": 4}}, {"id": "m1", "fields": {"visits": 5}}]], expected: {"updated": ["m1"], "failed": [{"id": "m1", "reason": "duplicate"}], "records": [{"id": "m1", "visits": 4}]} },
    ],
    hiddenTests: [
      { input: [[{"id": 1, "name": "Ana"}], [{"id": 7, "fields": {"name": "Zed"}}, {"id": 7, "fields": {"name": "Zed"}}, {"id": 1, "fields": {"name": "Anna", "plan": "annual"}}]], expected: {"updated": [1], "failed": [{"id": 7, "reason": "not_found"}, {"id": 7, "reason": "duplicate"}], "records": [{"id": 1, "name": "Anna", "plan": "annual"}]} },
      { input: [[{"id": 1, "a": 1}, {"id": 2, "a": 2}], []], expected: {"updated": [], "failed": [], "records": [{"id": 1, "a": 1}, {"id": 2, "a": 2}]} },
      { input: [[], [{"id": 1, "fields": {"a": 1}}]], expected: {"updated": [], "failed": [{"id": 1, "reason": "not_found"}], "records": []} },
      { input: [[{"id": 5, "locker": null}], [{"id": 5, "fields": {"locker": 12, "id": 5}}, {"id": 5, "fields": {"locker": 13}}]], expected: {"updated": [], "failed": [{"id": 5, "reason": "immutable_field"}, {"id": 5, "reason": "duplicate"}], "records": [{"id": 5, "locker": null}]} },
    ],
  },
  {
    id: "py-build-webhook-seal-check",
    number: 7,
    language: 'python',
    kind: 'build',
    title: "Webhook Seal Check",
    difficulty: "Medium",
    topic: "Services & APIs",
    statement:
      "A payments provider signs the webhooks it sends to your ticketing service. The starter includes `rolling_digest(secret, message)`, a toy keyed hash that returns an 8-char hex string; the real one would be HMAC, so it is injected as the `digest` parameter and you must call `digest(...)` rather than hard-coding a hash. Implement `verify_webhook(body, signature_header, secret, now, digest)` returning one of `\"ok\"`, `\"malformed\"`, `\"stale\"`, `\"mismatch\"`, checked in that order of precedence.\n\n- `signature_header` looks like `t=<unix seconds>,v1=<hex>`: comma-separated `key=value` pairs (surrounding whitespace around keys and values is ignored). If any pair lacks `=`, or `t` or `v1` is missing, or `t` is not all digits, return `\"malformed\"`.\n- If `abs(now - t) > 300`, return `\"stale\"`.\n- The expected signature is `digest(secret, f\"{t}.{body}\")`. If the header's `v1` differs from it, return `\"mismatch\"` (a constant-time comparison is good practice, but only correctness is tested).\n- Otherwise return `\"ok\"`.",
    functionName: "verify_webhook",
    functionSignature: "def verify_webhook(body: str, signature_header: str, secret: str, now: int, digest=rolling_digest) -> str:",
    buggyCode:
      "def rolling_digest(secret: str, message: str) -> str:\n    h = 5381\n    for ch in secret + '|' + message:\n        h = (h * 33 + ord(ch)) % 4294967296\n    return format(h, '08x')\n\n\ndef verify_webhook(body: str, signature_header: str, secret: str, now: int, digest=rolling_digest) -> str:\n    # TODO: parse the header, check freshness, recompute and compare\n    return 'ok'\n",
    solution:
      "def rolling_digest(secret: str, message: str) -> str:\n    h = 5381\n    for ch in secret + '|' + message:\n        h = (h * 33 + ord(ch)) % 4294967296\n    return format(h, '08x')\n\n\ndef verify_webhook(body: str, signature_header: str, secret: str, now: int, digest=rolling_digest) -> str:\n    parts = {}\n    for chunk in signature_header.split(','):\n        if '=' not in chunk:\n            return 'malformed'\n        key, value = chunk.split('=', 1)\n        parts[key.strip()] = value.strip()\n    if 't' not in parts or 'v1' not in parts or not parts['t'].isdigit():\n        return 'malformed'\n    ts = int(parts['t'])\n    if abs(now - ts) > 300:\n        return 'stale'\n    expected = digest(secret, '%d.%s' % (ts, body))\n    given = parts['v1']\n    if len(expected) != len(given):\n        return 'mismatch'\n    diff = 0\n    for a, b in zip(expected, given):\n        diff |= ord(a) ^ ord(b)\n    return 'ok' if diff == 0 else 'mismatch'\n",
    hint: "Parse the header into a dict first; the signed message is the timestamp, a dot, then the raw body — sign what the sender signed.",
    explanation:
      "Webhook verification recomputes the signature over exactly what the sender signed — the timestamp joined to the raw body — so a tampered body or a replayed old event fails. Including the timestamp in the signed message is what makes the freshness window meaningful: an attacker cannot just bump `t`. Injecting the digest function keeps the parsing logic testable without a real HMAC.",
    examples: [
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=1700000000,v1=75745c9a", "s3cr3t", 1700000100], expected: "ok" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=1700000000,v1=75745cbb", "s3cr3t", 1700000100], expected: "mismatch" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=1700000000,v1=75745c9a", "s3cr3t", 1700000301], expected: "stale" },
    ],
    hiddenTests: [
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=1700000000,v1=75745c9a", "s3cr3t", 1700000300], expected: "ok" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "v1=deadbeef", "s3cr3t", 1700000000], expected: "malformed" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=soon,v1=deadbeef", "s3cr3t", 1700000000], expected: "malformed" },
      { input: ["{\"event\":\"paid\",\"id\":88}", " t = 1700000000 , v1 = 75745c9a", "s3cr3t", 1700000000], expected: "ok" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "t=1700000000,v1=44e627e5", "s3cr3t", 1700000000], expected: "mismatch" },
      { input: ["{\"event\":\"paid\",\"id\":88}", "", "s3cr3t", 1700000000], expected: "malformed" },
    ],
  },
  {
    id: "py-build-expiring-lookup-shelf",
    number: 8,
    language: 'python',
    kind: 'build',
    title: "Expiring Lookup Shelf",
    difficulty: "Easy",
    topic: "Caching & Rate Limiting",
    statement:
      "A weather widget caches forecasts per city for a fixed time-to-live. Because the tests must be deterministic, every operation carries its own timestamp instead of reading a clock. Implement `ttl_shelf(ttl, ops)`.\n\nEach op is either `[\"set\", t, key, value]` or `[\"get\", t, key]`, with timestamps `t` (integers) non-decreasing across ops.\n- `set` stores the value and makes it expire at `t + ttl`; setting an existing key replaces its value and restarts its expiry.\n- `get` returns the stored value when `t < expiry`, otherwise `None` (a value read at exactly `t == expiry` is already expired).\n- Return the list of `get` results in order; `set` produces no output.",
    functionName: "ttl_shelf",
    functionSignature: "def ttl_shelf(ttl: int, ops: list) -> list:",
    buggyCode:
      "def ttl_shelf(ttl: int, ops: list) -> list:\n    # TODO: store (value, expiry) per key; answer gets in order\n    store = {}\n    out = []\n    for op in ops:\n        if op[0] == 'set':\n            store[op[2]] = op[3]\n        else:\n            out.append(store.get(op[2]))\n    return out\n",
    solution:
      "def ttl_shelf(ttl: int, ops: list) -> list:\n    store = {}\n    out = []\n    for op in ops:\n        if op[0] == 'set':\n            _, t, key, value = op\n            store[key] = (value, t + ttl)\n        else:\n            _, t, key = op\n            entry = store.get(key)\n            if entry is not None and t < entry[1]:\n                out.append(entry[0])\n            else:\n                store.pop(key, None)\n                out.append(None)\n    return out\n",
    hint: "Store a (value, expires_at) pair and compare the get timestamp against expires_at with a strict less-than.",
    explanation:
      "A TTL cache attaches an expiry instant to every entry and treats expired entries as misses; lazily evicting on read keeps the code tiny. Taking the timestamp as input rather than calling `time.time()` is what makes the cache testable and is how production caches are usually written (an injected clock). The boundary rule (`t == expiry` is expired) is exactly the kind of detail interviewers probe.",
    examples: [
      { input: [10, [["set", 0, "oslo", "rain"], ["get", 5, "oslo"], ["get", 10, "oslo"], ["get", 11, "oslo"]]], expected: ["rain", null, null] },
      { input: [5, [["get", 0, "lima"], ["set", 1, "lima", 21], ["set", 4, "lima", 22], ["get", 8, "lima"], ["get", 9, "lima"]]], expected: [null, 22, null] },
    ],
    hiddenTests: [
      { input: [3, [["set", 0, "a", 1], ["set", 0, "b", 2], ["get", 2, "a"], ["get", 3, "b"], ["set", 3, "b", 3], ["get", 5, "b"]]], expected: [1, null, 3] },
      { input: [1, [["set", 7, "k", "v"], ["get", 7, "k"], ["get", 8, "k"], ["set", 8, "k", "w"], ["get", 8, "k"]]], expected: ["v", null, "w"] },
      { input: [100, [["get", 0, "missing"], ["get", 50, "missing"]]], expected: [null, null] },
    ],
  },
  {
    id: "py-build-warm-shelf-eviction",
    number: 9,
    language: 'python',
    kind: 'build',
    title: "Warm Shelf Eviction",
    difficulty: "Medium",
    topic: "Caching & Rate Limiting",
    statement:
      "A bakery's point-of-sale keeps the `capacity` most recently touched product records in memory. Implement `warm_shelf(capacity, ops)` and return one result per op.\n\n- `[\"get\", key]` → the stored value, or `None` if absent. A hit makes the key the most recently used.\n- `[\"put\", key, value]` → stores or replaces the value and makes the key most recently used. If inserting a **new** key pushes the shelf past `capacity`, evict the least recently used key first and return that evicted key; otherwise return `None`. Replacing an existing key never evicts.\n- `capacity` is at least 1.",
    functionName: "warm_shelf",
    functionSignature: "def warm_shelf(capacity: int, ops: list) -> list:",
    buggyCode:
      "def warm_shelf(capacity: int, ops: list) -> list:\n    # TODO: recency-ordered store with eviction reporting\n    store = {}\n    out = []\n    for op in ops:\n        if op[0] == 'get':\n            out.append(store.get(op[1]))\n        else:\n            store[op[1]] = op[2]\n            out.append(None)\n    return out\n",
    solution:
      "from collections import OrderedDict\n\n\ndef warm_shelf(capacity: int, ops: list) -> list:\n    shelf = OrderedDict()\n    out = []\n    for op in ops:\n        if op[0] == 'get':\n            key = op[1]\n            if key in shelf:\n                shelf.move_to_end(key)\n                out.append(shelf[key])\n            else:\n                out.append(None)\n        else:\n            _, key, value = op\n            evicted = None\n            if key in shelf:\n                shelf.move_to_end(key)\n            elif len(shelf) >= capacity:\n                evicted, _ = shelf.popitem(last=False)\n            shelf[key] = value\n            out.append(evicted)\n    return out\n",
    hint: "OrderedDict gives you move_to_end() for touches and popitem(last=False) for the oldest entry.",
    explanation:
      "A bounded recency cache keeps entries in touch order so eviction is O(1): move a key to the tail on every get or put, and pop the head when a new key would exceed capacity. Reporting the evicted key is a common real-world need (to flush it to disk or to log churn). The subtle cases are a get that must count as a touch and a put that replaces an existing key without evicting.",
    examples: [
      { input: [2, [["put", "rye", 3], ["put", "sourdough", 5], ["get", "rye"], ["put", "bagel", 9], ["get", "sourdough"], ["get", "rye"]]], expected: [null, null, 3, "sourdough", null, 3] },
      { input: [1, [["put", "a", 1], ["put", "a", 2], ["get", "a"], ["put", "b", 3], ["get", "a"]]], expected: [null, null, 2, "a", null] },
    ],
    hiddenTests: [
      { input: [3, [["put", "a", 1], ["put", "b", 2], ["put", "c", 3], ["get", "a"], ["put", "d", 4], ["put", "e", 5], ["get", "c"], ["get", "a"]]], expected: [null, null, null, 1, "b", "c", null, 1] },
      { input: [2, [["get", "x"], ["put", "x", 1], ["put", "y", 2], ["put", "x", 10], ["put", "z", 3], ["get", "x"], ["get", "y"]]], expected: [null, null, null, null, "y", 10, null] },
      { input: [2, [["put", "a", 1], ["put", "b", 2], ["put", "c", 3], ["put", "d", 4]]], expected: [null, null, "a", "b"] },
    ],
  },
  {
    id: "py-build-rolling-window-gate",
    number: 10,
    language: 'python',
    kind: 'build',
    title: "Rolling Window Gate",
    difficulty: "Medium",
    topic: "Caching & Rate Limiting",
    statement:
      "A photo-upload API allows each client at most `limit` **accepted** uploads in any rolling window of `window_ms` milliseconds. Implement `rolling_gate(limit, window_ms, requests)`.\n\n`requests` is a list of `[client_id, timestamp_ms]` in non-decreasing timestamp order. For each request, count the client's previously accepted requests whose timestamp lies in `(timestamp - window_ms, timestamp]` — a request made exactly `window_ms` ago has already left the window. Accept the request (`True`) if that count is below `limit`, else reject it (`False`). Rejected requests never count toward later windows. Return the list of booleans, one per request.",
    functionName: "rolling_gate",
    functionSignature: "def rolling_gate(limit: int, window_ms: int, requests: list) -> list:",
    buggyCode:
      "def rolling_gate(limit: int, window_ms: int, requests: list) -> list:\n    # TODO: per-client log of accepted timestamps, trimmed to the window\n    counts = {}\n    out = []\n    for client, ts in requests:\n        counts[client] = counts.get(client, 0) + 1\n        out.append(counts[client] <= limit)\n    return out\n",
    solution:
      "from collections import deque\n\n\ndef rolling_gate(limit: int, window_ms: int, requests: list) -> list:\n    accepted = {}\n    out = []\n    for client, ts in requests:\n        log = accepted.setdefault(client, deque())\n        while log and log[0] <= ts - window_ms:\n            log.popleft()\n        if len(log) < limit:\n            log.append(ts)\n            out.append(True)\n        else:\n            out.append(False)\n    return out\n",
    hint: "Keep a deque of accepted timestamps per client; pop from the left while the oldest is <= ts - window_ms.",
    explanation:
      "A sliding-log limiter stores accepted timestamps per client and drops the ones that have aged out before counting, which gives an exact rolling window rather than the burst-at-the-boundary behaviour of fixed windows. Only accepted requests are logged so a flood of rejections cannot extend the lockout. The boundary comparison (`<= ts - window`) decides whether a request exactly one window old still counts.",
    examples: [
      { input: [2, 1000, [["a", 0], ["a", 400], ["a", 900], ["a", 1000], ["a", 1400], ["a", 1401]]], expected: [true, true, false, true, true, false] },
      { input: [1, 500, [["a", 0], ["b", 0], ["a", 499], ["a", 500], ["b", 100]]], expected: [true, true, false, true, false] },
    ],
    hiddenTests: [
      { input: [3, 100, [["c", 10], ["c", 20], ["c", 30], ["c", 40], ["c", 50], ["c", 110], ["c", 120], ["c", 125]]], expected: [true, true, true, false, false, true, true, false] },
      { input: [2, 1000, [["x", 0], ["x", 0], ["x", 0], ["x", 999], ["x", 1000], ["x", 1000]]], expected: [true, true, false, false, true, true] },
      { input: [0, 10, [["z", 1], ["z", 2]]], expected: [false, false] },
    ],
  },
  {
    id: "py-build-refilling-credit-pool",
    number: 11,
    language: 'python',
    kind: 'build',
    title: "Refilling Credit Pool",
    difficulty: "Medium",
    topic: "Caching & Rate Limiting",
    statement:
      "A map-tiles API charges each request a number of credits from a pool that refills continuously. Implement `credit_pool(capacity, refill_per_sec, requests)`.\n\n- The pool starts full at `capacity` credits.\n- `requests` is a list of `[timestamp_seconds, cost]` in non-decreasing time order (timestamps and costs may be floats or ints). Before handling a request, add `(timestamp - previous_timestamp) * refill_per_sec` credits, never exceeding `capacity`; the first request adds nothing.\n- If the available credits are at least `cost` (allow a tolerance of `1e-9` for floating point), deduct the cost and return `True`; otherwise return `False` and deduct nothing.\n- Return the list of booleans.",
    functionName: "credit_pool",
    functionSignature: "def credit_pool(capacity: int, refill_per_sec: float, requests: list) -> list:",
    buggyCode:
      "def credit_pool(capacity: int, refill_per_sec: float, requests: list) -> list:\n    # TODO: refill by elapsed time, cap at capacity, then charge\n    credits = capacity\n    out = []\n    for ts, cost in requests:\n        out.append(cost <= credits)\n        credits -= cost\n    return out\n",
    solution:
      "def credit_pool(capacity: int, refill_per_sec: float, requests: list) -> list:\n    credits = float(capacity)\n    last_ts = None\n    out = []\n    for ts, cost in requests:\n        if last_ts is not None:\n            credits = min(float(capacity), credits + (ts - last_ts) * refill_per_sec)\n        last_ts = ts\n        if cost <= credits + 1e-9:\n            credits -= cost\n            out.append(True)\n        else:\n            out.append(False)\n    return out\n",
    hint: "Track the previous timestamp; refill lazily on each request and clamp with min(capacity, ...).",
    explanation:
      "A token bucket allows bursts up to its capacity while enforcing a long-run average of `refill_per_sec`, and the lazy refill trick (add elapsed_time × rate on demand) means no background timer is needed. Clamping at capacity is what prevents an idle client from banking unlimited credit. Rejected requests must not deduct, otherwise the pool goes negative and the client is punished twice.",
    examples: [
      { input: [5, 1, [[0, 3], [0, 3], [1, 3], [1, 1], [10, 5]]], expected: [true, false, true, false, true] },
      { input: [10, 0.5, [[0, 10], [4, 2], [4, 1], [100, 11], [100, 10]]], expected: [true, true, false, false, true] },
    ],
    hiddenTests: [
      { input: [2, 2, [[0, 2], [0.25, 1], [0.5, 1], [0.75, 1], [1.0, 1]]], expected: [true, false, true, false, true] },
      { input: [3, 1, [[5, 1], [5, 1], [5, 1], [5, 1], [6, 1], [6, 1]]], expected: [true, true, true, false, true, false] },
      { input: [1, 1, [[0, 0], [0, 1], [0, 1], [0.5, 0.5], [0.5, 0.01]]], expected: [true, true, false, true, false] },
    ],
  },
  {
    id: "py-build-tenant-usage-meter",
    number: 12,
    language: 'python',
    kind: 'build',
    title: "Tenant Usage Meter",
    difficulty: "Easy",
    topic: "Caching & Rate Limiting",
    statement:
      "A transcription SaaS bills tenants in minutes and each tenant has a monthly quota. Implement `meter_tenants(quotas, default_quota, events)`.\n\n- `quotas` maps tenant id → allowed units; tenants not present use `default_quota`.\n- `events` is a list of `[tenant_id, units]` in order. An event is `\"ok\"` when the tenant's usage so far plus `units` is `<=` its quota, in which case the units are consumed; otherwise it is `\"denied\"` and consumes nothing (all-or-nothing — no partial fills).\n- Return `{\"results\": [one string per event], \"usage\": {tenant_id: consumed_units}}`. Only tenants that appear in `events` show up in `usage`, even if their consumption is 0.",
    functionName: "meter_tenants",
    functionSignature: "def meter_tenants(quotas: dict, default_quota: int, events: list) -> dict:",
    buggyCode:
      "def meter_tenants(quotas: dict, default_quota: int, events: list) -> dict:\n    # TODO: check each event against the tenant quota, all-or-nothing\n    return {'results': ['ok' for _ in events], 'usage': {}}\n",
    solution:
      "def meter_tenants(quotas: dict, default_quota: int, events: list) -> dict:\n    usage = {}\n    results = []\n    for tenant, units in events:\n        cap = quotas.get(tenant, default_quota)\n        used = usage.setdefault(tenant, 0)\n        if used + units <= cap:\n            usage[tenant] = used + units\n            results.append('ok')\n        else:\n            results.append('denied')\n    return {'results': results, 'usage': usage}\n",
    hint: "Look the quota up with quotas.get(tenant, default_quota) and only add to usage on the accepted branch.",
    explanation:
      "Per-tenant quotas isolate customers from each other: one tenant exhausting its allowance cannot degrade another. All-or-nothing admission keeps accounting simple and avoids half-processed jobs. Registering a tenant in `usage` even when its first event is denied gives operators a complete picture of who tried to use the system.",
    examples: [
      { input: [{"acme": 100, "zen": 10}, 50, [["acme", 60], ["acme", 50], ["zen", 10], ["zen", 1], ["solo", 50]]], expected: {"results": ["ok", "denied", "ok", "denied", "ok"], "usage": {"acme": 60, "zen": 10, "solo": 50}} },
      { input: [{}, 20, [["a", 15], ["b", 5], ["a", 5], ["a", 1], ["b", 15]]], expected: {"results": ["ok", "ok", "ok", "denied", "ok"], "usage": {"a": 20, "b": 20}} },
    ],
    hiddenTests: [
      { input: [{"free": 0}, 100, [["free", 1], ["free", 0], ["paid", 100], ["paid", 0]]], expected: {"results": ["denied", "ok", "ok", "ok"], "usage": {"free": 0, "paid": 100}} },
      { input: [{"big": 1000}, 1, []], expected: {"results": [], "usage": {}} },
      { input: [{"t": 5}, 5, [["t", 3], ["t", 3], ["t", 2], ["u", 6], ["u", 5]]], expected: {"results": ["ok", "denied", "ok", "denied", "ok"], "usage": {"t": 5, "u": 5}} },
    ],
  },
  {
    id: "py-build-canonical-call-memo",
    number: 13,
    language: 'python',
    kind: 'build',
    title: "Canonical Call Memo",
    difficulty: "Easy",
    topic: "Caching & Rate Limiting",
    statement:
      "A recipe-search service memoizes expensive query calls, but clients send the same query with arguments in different orders and with explicit `None`s for defaults, so naive keys miss constantly. Implement `memo_plan(calls)`.\n\nEach call is `[function_name, kwargs]` where `kwargs` is a dict of JSON-serialisable values. Two calls hit the same cache entry when they have the same function name and their kwargs are equal after normalization:\n- drop every key whose value is `None`;\n- key order is irrelevant, at every nesting level of dicts;\n- list values are compared in order (`[1, 2]` and `[2, 1]` differ).\n\nReturn a list with `\"compute\"` for the first call with a given canonical key and `\"cached\"` for every later one.",
    functionName: "memo_plan",
    functionSignature: "def memo_plan(calls: list) -> list:",
    buggyCode:
      "def memo_plan(calls: list) -> list:\n    # TODO: build a canonical key per call and detect repeats\n    seen = set()\n    out = []\n    for name, kwargs in calls:\n        key = name + str(kwargs)\n        out.append('cached' if key in seen else 'compute')\n        seen.add(key)\n    return out\n",
    solution:
      "import json\n\n\ndef memo_plan(calls: list) -> list:\n    seen = set()\n    out = []\n    for name, kwargs in calls:\n        cleaned = {k: v for k, v in kwargs.items() if v is not None}\n        key = name + '|' + json.dumps(cleaned, sort_keys=True, separators=(',', ':'))\n        if key in seen:\n            out.append('cached')\n        else:\n            seen.add(key)\n            out.append('compute')\n    return out\n",
    hint: "json.dumps(obj, sort_keys=True) turns nested dicts into an order-independent string; strip None values before serialising.",
    explanation:
      "Memoization is only as good as its key: dict repr depends on insertion order, so `{\"a\":1,\"b\":2}` and `{\"b\":2,\"a\":1}` would look different. Serialising with sorted keys produces one canonical string for equal inputs, and dropping `None` values folds \"argument omitted\" and \"argument explicitly None\" into the same entry. This same normalization step powers HTTP cache keys and idempotency keys in real services.",
    examples: [
      { input: [[["search", {"q": "soup", "limit": 10}], ["search", {"limit": 10, "q": "soup"}], ["search", {"q": "soup", "limit": 10, "cursor": null}], ["search", {"q": "soup"}]]], expected: ["compute", "cached", "cached", "compute"] },
      { input: [[["search", {"tags": ["veg", "fast"]}], ["search", {"tags": ["fast", "veg"]}], ["browse", {"tags": ["veg", "fast"]}], ["search", {"tags": ["veg", "fast"]}]]], expected: ["compute", "compute", "compute", "cached"] },
    ],
    hiddenTests: [
      { input: [[["f", {"opts": {"a": 1, "b": {"c": 2, "d": 3}}}], ["f", {"opts": {"b": {"d": 3, "c": 2}, "a": 1}}], ["f", {"opts": {"a": 1, "b": {"c": 2}}}]]], expected: ["compute", "cached", "compute"] },
      { input: [[["f", {}], ["f", {"x": null}], ["g", {}], ["f", {"x": 0}]]], expected: ["compute", "cached", "compute", "compute"] },
      { input: [[["f", {"n": 1}], ["f", {"n": "1"}], ["f", {"n": 1, "m": null, "k": null}]]], expected: ["compute", "compute", "cached"] },
    ],
  },
  {
    id: "py-build-structured-log-lines",
    number: 14,
    language: 'python',
    kind: 'build',
    title: "Structured Log Lines",
    difficulty: "Medium",
    topic: "Data Processing",
    statement:
      "A ride-hailing backend emits one text line per event and you need them as dicts for a dashboard. Implement `parse_log_lines(lines)`.\n\nA well-formed line is `<timestamp> <LEVEL> key=value key=value ...` where tokens are separated by one or more spaces, except that a value may be wrapped in double quotes and then may contain spaces (quotes are not nested and there are no escaped quotes). For each well-formed line produce `{\"ts\": timestamp, \"level\": level lowercased, \"fields\": {...}}` where:\n- an unquoted value made only of digits (optionally with a leading `-`) becomes an `int`;\n- a quoted value is always a string with the quotes removed, even if it looks numeric;\n- a key that appears twice keeps the last value.\n\nSkip a line entirely (do not include it) when it is blank, has fewer than two tokens, or any token after the level lacks an `=`. Preserve line order.",
    functionName: "parse_log_lines",
    functionSignature: "def parse_log_lines(lines: list) -> list:",
    buggyCode:
      "def parse_log_lines(lines: list) -> list:\n    # TODO: tokenize respecting quotes, then build the records\n    out = []\n    for line in lines:\n        parts = line.split(' ')\n        out.append({'ts': parts[0], 'level': parts[1], 'fields': {}})\n    return out\n",
    solution:
      "def _tokenize(line: str) -> list:\n    tokens = []\n    current = []\n    in_quotes = False\n    for ch in line:\n        if ch == '\"':\n            in_quotes = not in_quotes\n            current.append(ch)\n        elif ch == ' ' and not in_quotes:\n            if current:\n                tokens.append(''.join(current))\n                current = []\n        else:\n            current.append(ch)\n    if current:\n        tokens.append(''.join(current))\n    return tokens\n\n\ndef _coerce(value: str):\n    if len(value) >= 2 and value[0] == '\"' and value[-1] == '\"':\n        return value[1:-1]\n    body = value[1:] if value.startswith('-') else value\n    if body.isdigit():\n        return int(value)\n    return value\n\n\ndef parse_log_lines(lines: list) -> list:\n    records = []\n    for line in lines:\n        tokens = _tokenize(line)\n        if len(tokens) < 2:\n            continue\n        fields = {}\n        ok = True\n        for token in tokens[2:]:\n            if '=' not in token:\n                ok = False\n                break\n            key, value = token.split('=', 1)\n            fields[key] = _coerce(value)\n        if ok:\n            records.append({'ts': tokens[0], 'level': tokens[1].lower(), 'fields': fields})\n    return records\n",
    hint: "Write a small tokenizer that flips an in_quotes flag on each double quote and only splits on spaces outside quotes; coerce values afterwards.",
    explanation:
      "Structured logging turns free text into fields you can filter and aggregate, and the parser is a tiny state machine: a quote toggles whether spaces separate tokens. Coercing unquoted digit-only values to ints while leaving quoted ones as strings mirrors how logfmt-style pipelines behave, and skipping malformed lines (rather than crashing) keeps a dashboard alive when one service misbehaves.",
    examples: [
      { input: [["2024-05-01T10:00:00Z INFO rider=ann trip=118 fare=1450", "2024-05-01T10:00:02Z WARN driver=\"lee m\" msg=\"gps drift high\" delay=-3"]], expected: [{"ts": "2024-05-01T10:00:00Z", "level": "info", "fields": {"rider": "ann", "trip": 118, "fare": 1450}}, {"ts": "2024-05-01T10:00:02Z", "level": "warn", "fields": {"driver": "lee m", "msg": "gps drift high", "delay": -3}}] },
      { input: [["2024-05-01T10:00:00Z ERROR msg=\"boom\"", "", "just-a-timestamp", "2024-05-01T10:00:03Z INFO", "2024-05-01T10:00:04Z INFO oops fare=1"]], expected: [{"ts": "2024-05-01T10:00:00Z", "level": "error", "fields": {"msg": "boom"}}, {"ts": "2024-05-01T10:00:03Z", "level": "info", "fields": {}}] },
    ],
    hiddenTests: [
      { input: [["t1 debug code=\"0042\" count=0042 note=\"a = b\" code=7"]], expected: [{"ts": "t1", "level": "debug", "fields": {"code": 7, "count": 42, "note": "a = b"}}] },
      { input: [["t2 Info a=1 b=\"\" c==x"]], expected: [{"ts": "t2", "level": "info", "fields": {"a": 1, "b": "", "c": "=x"}}] },
      { input: [["t3   INFO   spaced=1  ", "t4 INFO k=v=w"]], expected: [{"ts": "t3", "level": "info", "fields": {"spaced": 1}}, {"ts": "t4", "level": "info", "fields": {"k": "v=w"}}] },
    ],
  },
  {
    id: "py-build-hot-hashtags",
    number: 15,
    language: 'python',
    kind: 'build',
    title: "Hot Hashtags",
    difficulty: "Easy",
    topic: "Data Processing",
    statement:
      "A microblog shows the `k` hottest hashtags from a stream of tag mentions. Implement `hot_tags(tags, k)`.\n\n`tags` is a list of strings in the order they were posted. Rank tags by mention count descending; break ties by which tag was **first mentioned** earlier in the stream. Return a list of `[tag, count]` pairs for the top `k` (fewer if there are not that many distinct tags; `[]` when `k` is 0). Tag comparison is case-sensitive.",
    functionName: "hot_tags",
    functionSignature: "def hot_tags(tags: list, k: int) -> list:",
    buggyCode:
      "def hot_tags(tags: list, k: int) -> list:\n    # TODO: count, rank by (count desc, first seen asc), slice\n    return []\n",
    solution:
      "def hot_tags(tags: list, k: int) -> list:\n    counts = {}\n    first_seen = {}\n    for index, tag in enumerate(tags):\n        counts[tag] = counts.get(tag, 0) + 1\n        first_seen.setdefault(tag, index)\n    ranked = sorted(counts, key=lambda t: (-counts[t], first_seen[t]))\n    return [[t, counts[t]] for t in ranked[:k]]\n",
    hint: "Record the index of the first occurrence alongside the count and sort by (-count, first_index).",
    explanation:
      "Top-K by frequency is a count-then-sort problem, but production ranking needs a deterministic tie-break, and \"first seen wins\" is a common one because it keeps the ordering stable as counts grow. Capturing the first index with `setdefault` during the single counting pass avoids a second scan. Sorting by a tuple key expresses the two-level ordering without a custom comparator.",
    examples: [
      { input: [["sun", "rain", "sun", "fog", "rain", "sun", "fog"], 2], expected: [["sun", 3], ["rain", 2]] },
      { input: [["b", "a", "c", "a", "b"], 3], expected: [["b", 2], ["a", 2], ["c", 1]] },
    ],
    hiddenTests: [
      { input: [["x", "y", "z"], 5], expected: [["x", 1], ["y", 1], ["z", 1]] },
      { input: [["one"], 0], expected: [] },
      { input: [["Tea", "tea", "TEA", "tea"], 2], expected: [["tea", 2], ["Tea", 1]] },
      { input: [[], 3], expected: [] },
    ],
  },
  {
    id: "py-build-regional-sales-digest",
    number: 16,
    language: 'python',
    kind: 'build',
    title: "Regional Sales Digest",
    difficulty: "Medium",
    topic: "Data Processing",
    statement:
      "A coffee-roaster's ops team wants a per-region digest of yesterday's orders. Implement `sales_digest(orders)`.\n\nEach order is `{\"region\": str, \"product\": str, \"cents\": int}`. For every region produce\n`{\"region\": ..., \"orders\": <count>, \"total\": <sum of cents>, \"avg\": <total // orders>, \"top_product\": ...}`\nwhere `top_product` is the product with the highest summed cents inside that region; on a tie choose the alphabetically smallest product name.\n\nReturn the digests sorted by `total` descending, then by `region` ascending. An empty input returns `[]`.",
    functionName: "sales_digest",
    functionSignature: "def sales_digest(orders: list) -> list:",
    buggyCode:
      "def sales_digest(orders: list) -> list:\n    # TODO: group by region, aggregate, rank products, sort digests\n    return []\n",
    solution:
      "def sales_digest(orders: list) -> list:\n    groups = {}\n    for order in orders:\n        g = groups.setdefault(order['region'], {'orders': 0, 'total': 0, 'products': {}})\n        g['orders'] += 1\n        g['total'] += order['cents']\n        g['products'][order['product']] = g['products'].get(order['product'], 0) + order['cents']\n    digests = []\n    for region, g in groups.items():\n        top = sorted(g['products'].items(), key=lambda kv: (-kv[1], kv[0]))[0][0]\n        digests.append({\n            'region': region,\n            'orders': g['orders'],\n            'total': g['total'],\n            'avg': g['total'] // g['orders'],\n            'top_product': top,\n        })\n    digests.sort(key=lambda dg: (-dg['total'], dg['region']))\n    return digests\n",
    hint: "Accumulate a nested dict region -> {count, total, product -> cents}, then derive each digest and sort by (-total, region).",
    explanation:
      "Group-and-aggregate is the backbone of reporting endpoints: one pass builds per-group accumulators, a second pass derives the summary fields. Keeping a nested product tally per region makes `top_product` a simple sort with a two-part key. Using integer cents and floor division avoids float drift in money math.",
    examples: [
      { input: [[{"region": "north", "product": "espresso", "cents": 900}, {"region": "south", "product": "latte", "cents": 1200}, {"region": "north", "product": "latte", "cents": 500}, {"region": "north", "product": "espresso", "cents": 400}]], expected: [{"region": "north", "orders": 3, "total": 1800, "avg": 600, "top_product": "espresso"}, {"region": "south", "orders": 1, "total": 1200, "avg": 1200, "top_product": "latte"}] },
      { input: [[{"region": "east", "product": "mocha", "cents": 700}, {"region": "west", "product": "mocha", "cents": 700}, {"region": "east", "product": "chai", "cents": 300}, {"region": "west", "product": "americano", "cents": 300}]], expected: [{"region": "east", "orders": 2, "total": 1000, "avg": 500, "top_product": "mocha"}, {"region": "west", "orders": 2, "total": 1000, "avg": 500, "top_product": "mocha"}] },
    ],
    hiddenTests: [
      { input: [[{"region": "r", "product": "b", "cents": 100}, {"region": "r", "product": "a", "cents": 100}, {"region": "r", "product": "c", "cents": 99}]], expected: [{"region": "r", "orders": 3, "total": 299, "avg": 99, "top_product": "a"}] },
      { input: [[]], expected: [] },
      { input: [[{"region": "z", "product": "p", "cents": 5}, {"region": "z", "product": "p", "cents": 5}, {"region": "z", "product": "p", "cents": 5}, {"region": "a", "product": "q", "cents": 15}]], expected: [{"region": "a", "orders": 1, "total": 15, "avg": 15, "top_product": "q"}, {"region": "z", "orders": 3, "total": 15, "avg": 5, "top_product": "p"}] },
    ],
  },
  {
    id: "py-build-signup-collapse",
    number: 17,
    language: 'python',
    kind: 'build',
    title: "Signup Collapse",
    difficulty: "Medium",
    topic: "Data Processing",
    statement:
      "A newsletter imports signups from several forms and the same person shows up with slightly different emails. Implement `collapse_signups(records)`.\n\nEach record is a dict with an `\"email\"` plus other optional string fields (e.g. `\"name\"`, `\"phone\"`). Two records are the same person when their emails match after canonicalizing: trim whitespace, lowercase, and in the local part (before `@`) drop everything from the first `+` onward and remove all dots (`Ann.Lee+promo@Mail.com` → `annlee@mail.com`).\n\nKeep the **first** record for each person, with its original `email` string untouched. For later duplicates, copy over any field the kept record is missing or has as `None`/`\"\"`, but never overwrite a non-empty value. Add a `\"copies\"` field to every output record holding how many records collapsed into it (1 when unique). Return the kept records in first-appearance order.",
    functionName: "collapse_signups",
    functionSignature: "def collapse_signups(records: list) -> list:",
    buggyCode:
      "def collapse_signups(records: list) -> list:\n    # TODO: canonicalize emails, merge later duplicates into the first\n    return [dict(r, copies=1) for r in records]\n",
    solution:
      "def _canonical(email: str) -> str:\n    email = email.strip().lower()\n    local, _, domain = email.partition('@')\n    local = local.split('+', 1)[0].replace('.', '')\n    return local + '@' + domain\n\n\ndef collapse_signups(records: list) -> list:\n    merged = {}\n    order = []\n    for record in records:\n        key = _canonical(record['email'])\n        if key not in merged:\n            kept = dict(record)\n            kept['copies'] = 1\n            merged[key] = kept\n            order.append(key)\n            continue\n        kept = merged[key]\n        kept['copies'] += 1\n        for field, value in record.items():\n            if field == 'email' or value in (None, ''):\n                continue\n            if kept.get(field) in (None, ''):\n                kept[field] = value\n    return [merged[key] for key in order]\n",
    hint: "Write a canonical(email) helper and use its output as the dict key; merge with \"fill only if empty\" semantics.",
    explanation:
      "Fuzzy deduplication hinges on a canonical key: normalize each record into the form that two \"same\" inputs share, then group on it. The merge policy (\"first record wins, later ones fill gaps\") is what makes the operation deterministic and safe to rerun. Plus-tags and dots in the local part are the classic email aliases that inflate subscriber counts.",
    examples: [
      { input: [[{"email": "Ann.Lee+promo@Mail.com", "name": "Ann"}, {"email": "annlee@mail.com", "name": "Ann Lee", "phone": "555-1"}, {"email": "bo@x.io", "name": ""}]], expected: [{"email": "Ann.Lee+promo@Mail.com", "name": "Ann", "copies": 2, "phone": "555-1"}, {"email": "bo@x.io", "name": "", "copies": 1}] },
      { input: [[{"email": " bo@x.io ", "name": null}, {"email": "b.o@x.io", "name": "Bo"}, {"email": "BO+news@X.IO", "name": "Robert", "phone": "1"}]], expected: [{"email": " bo@x.io ", "name": "Bo", "copies": 3, "phone": "1"}] },
    ],
    hiddenTests: [
      { input: [[{"email": "a@a.com"}, {"email": "b@b.com"}, {"email": "a@a.com"}, {"email": "a+1@a.com"}]], expected: [{"email": "a@a.com", "copies": 3}, {"email": "b@b.com", "copies": 1}] },
      { input: [[]], expected: [] },
      { input: [[{"email": "x.y@z.com", "name": "", "phone": ""}, {"email": "xy@z.com", "name": "", "phone": "7"}, {"email": "x.y+a@z.com", "name": "XY", "phone": "8"}]], expected: [{"email": "x.y@z.com", "name": "XY", "phone": "7", "copies": 3}] },
      { input: [[{"email": "dot.ted@dom.ain.com", "name": "D"}, {"email": "dotted@dom.ain.com", "name": "E"}, {"email": "dotted@domain.com", "name": "F"}]], expected: [{"email": "dot.ted@dom.ain.com", "name": "D", "copies": 2}, {"email": "dotted@domain.com", "name": "F", "copies": 1}] },
    ],
  },
  {
    id: "py-build-braid-sensor-feeds",
    number: 18,
    language: 'python',
    kind: 'build',
    title: "Braid Sensor Feeds",
    difficulty: "Easy",
    topic: "Data Processing",
    statement:
      "A greenhouse has several sensors, each producing readings already sorted by time, and the dashboard needs one merged timeline. Implement `braid_feeds(feeds)`.\n\n`feeds` is a list of feeds; each feed is a list of `[timestamp, value]` sorted by timestamp ascending (equal timestamps within one feed are possible). Return a single list of `[timestamp, value, feed_index]` sorted by timestamp ascending, with ties broken by lower `feed_index` first and, within one feed, by original order. Empty feeds are allowed. Do not simply concatenate and sort by timestamp alone — the tie rules must hold.",
    functionName: "braid_feeds",
    functionSignature: "def braid_feeds(feeds: list) -> list:",
    buggyCode:
      "def braid_feeds(feeds: list) -> list:\n    # TODO: k-way merge with (timestamp, feed_index, position) ordering\n    return []\n",
    solution:
      "import heapq\n\n\ndef braid_feeds(feeds: list) -> list:\n    heap = []\n    for index, feed in enumerate(feeds):\n        if feed:\n            heapq.heappush(heap, (feed[0][0], index, 0))\n    merged = []\n    while heap:\n        ts, index, pos = heapq.heappop(heap)\n        merged.append([ts, feeds[index][pos][1], index])\n        if pos + 1 < len(feeds[index]):\n            heapq.heappush(heap, (feeds[index][pos + 1][0], index, pos + 1))\n    return merged\n",
    hint: "Push (timestamp, feed_index, position) tuples onto a heap; the tuple order already encodes the tie rules.",
    explanation:
      "A k-way merge with a heap produces the combined ordering in O(n log k) without materialising and re-sorting everything, which matters when feeds are large or streamed. Encoding the tie-break inside the heap tuple (timestamp, then feed index, then position) makes the ordering deterministic for free. Merging sorted streams is exactly how log aggregators and time-series stores combine shards.",
    examples: [
      { input: [[[[1, "a1"], [4, "a2"]], [[2, "b1"], [4, "b2"]], [[4, "c1"]]]], expected: [[1, "a1", 0], [2, "b1", 1], [4, "a2", 0], [4, "b2", 1], [4, "c1", 2]] },
      { input: [[[[5, "x"]], [], [[1, "y"], [5, "z"]]]], expected: [[1, "y", 2], [5, "x", 0], [5, "z", 2]] },
    ],
    hiddenTests: [
      { input: [[[[1, "p"], [1, "q"]], [[1, "r"]]]], expected: [[1, "p", 0], [1, "q", 0], [1, "r", 1]] },
      { input: [[]], expected: [] },
      { input: [[[], []]], expected: [] },
      { input: [[[[3, 30], [9, 90]], [[3, 31], [3, 32], [10, 100]], [[0, 0]]]], expected: [[0, 0, 2], [3, 30, 0], [3, 31, 1], [3, 32, 1], [9, 90, 0], [10, 100, 1]] },
    ],
  },
  {
    id: "py-build-quoted-sheet-reader",
    number: 19,
    language: 'python',
    kind: 'build',
    title: "Quoted Sheet Reader",
    difficulty: "Hard",
    topic: "Data Processing",
    statement:
      "A supplier sends price sheets as comma-separated text with quoted fields, and you must parse them by hand (treat the `csv` module as unavailable). Implement `read_sheet(text)` returning a list of rows, each a list of strings.\n\nRules:\n- Fields are separated by `,` and rows by `\\n`; a `\\r` is ignored everywhere.\n- A field may be wrapped in double quotes; inside quotes, commas and newlines are literal, and a doubled quote `\"\"` stands for one `\"` character. A closing quote ends the quoted section; any text after it up to the next comma is appended verbatim.\n- A line with no characters at all (two adjacent `\\n`, or a leading `\\n`) is skipped; a line like `,` still yields `[\"\", \"\"]`.\n- A trailing newline at the end of the text does not create an extra row.\n- If the text ends while still inside quotes, the field ends there.\n- Empty text returns `[]`.",
    functionName: "read_sheet",
    functionSignature: "def read_sheet(text: str) -> list:",
    buggyCode:
      "def read_sheet(text: str) -> list:\n    # TODO: character-by-character state machine\n    return [line.split(',') for line in text.split('\\n') if line]\n",
    solution:
      "def read_sheet(text: str) -> list:\n    rows = []\n    row = []\n    field = []\n    in_quotes = False\n    line_chars = 0\n    i = 0\n    n = len(text)\n    while i < n:\n        ch = text[i]\n        if ch == '\\r':\n            i += 1\n            continue\n        if in_quotes:\n            if ch == '\"':\n                if i + 1 < n and text[i + 1] == '\"':\n                    field.append('\"')\n                    i += 1\n                else:\n                    in_quotes = False\n            else:\n                field.append(ch)\n            line_chars += 1\n        elif ch == '\"':\n            in_quotes = True\n            line_chars += 1\n        elif ch == ',':\n            row.append(''.join(field))\n            field = []\n            line_chars += 1\n        elif ch == '\\n':\n            if line_chars > 0:\n                row.append(''.join(field))\n                rows.append(row)\n            row = []\n            field = []\n            line_chars = 0\n        else:\n            field.append(ch)\n            line_chars += 1\n        i += 1\n    if line_chars > 0:\n        row.append(''.join(field))\n        rows.append(row)\n    return rows\n",
    hint: "Keep an in_quotes flag and a count of characters seen on the current line; a doubled quote inside quotes needs a one-character lookahead.",
    explanation:
      "Real CSV cannot be split on commas because quoted fields may contain the delimiter and even newlines, so the parser is a character-level state machine with two states (inside or outside quotes) and a lookahead for the escaped `\"\"`. Tracking whether the current line has any characters distinguishes a blank line from a legitimate row of empty fields. This is the same shape as tokenizers for query languages and config formats.",
    examples: [
      { input: ["sku,name,price\nA1,\"Bolt, brass\",120\nA2,\"Say \"\"hi\"\"\",5\n"], expected: [["sku", "name", "price"], ["A1", "Bolt, brass", "120"], ["A2", "Say \"hi\"", "5"]] },
      { input: ["a,b\n\nc,d\r\n,\n"], expected: [["a", "b"], ["c", "d"], ["", ""]] },
      { input: ["\"multi\nline\",x\ny,\"\""], expected: [["multi\nline", "x"], ["y", ""]] },
    ],
    hiddenTests: [
      { input: [""], expected: [] },
      { input: ["\"unterminated,field\nstill inside"], expected: [["unterminated,field\nstill inside"]] },
      { input: ["\"q\"tail,\"\"\"\",end"], expected: [["qtail", "\"", "end"]] },
      { input: ["\n\nonly\n\n"], expected: [["only"]] },
    ],
  },
  {
    id: "py-build-dotted-path-pluck",
    number: 20,
    language: 'python',
    kind: 'build',
    title: "Dotted Path Pluck",
    difficulty: "Hard",
    topic: "Data Processing",
    statement:
      "A storefront's templating layer lets designers reference nested JSON with tiny path expressions. Implement `pluck(doc, path)`.\n\nA path is a sequence of segments joined by `.`. Each segment is a key name optionally followed by one or more bracket suffixes: `[<non-negative integer>]` indexes a list and `[*]` fans out over every element of a list. Examples: `order.id`, `order.lines[1].sku`, `order.lines[*].sku`, `order.lines[*].tags[*]`.\n\n- Without any `[*]`, the result is the single value reached, or `None` if any key is missing, any index is out of range, or a key/index is applied to the wrong container type.\n- Once a `[*]` has been applied, the result is a **flat list** of every value reached by continuing the path from each element; elements where the rest of the path does not resolve are silently skipped. A second `[*]` extends the same flat list (no nesting). A `[*]` applied to a non-list before any fan-out yields `None`; after fan-out it skips that element.\n- Assume the path is well-formed.",
    functionName: "pluck",
    functionSignature: "def pluck(doc, path: str):",
    buggyCode:
      "def pluck(doc, path: str):\n    # TODO: tokenize the path, then walk with fan-out for [*]\n    return None\n",
    solution:
      "import re\n\n_BRACKET = re.compile(r'\\[([^\\]]*)\\]')\n\n\ndef _tokens(path: str) -> list:\n    tokens = []\n    for segment in path.split('.'):\n        name = segment.split('[', 1)[0]\n        if name:\n            tokens.append(('key', name))\n        for inner in _BRACKET.findall(segment):\n            tokens.append(('star', None) if inner == '*' else ('index', int(inner)))\n    return tokens\n\n\ndef pluck(doc, path: str):\n    current = [doc]\n    fanned = False\n    for kind, value in _tokens(path):\n        nxt = []\n        for node in current:\n            if kind == 'key' and isinstance(node, dict) and value in node:\n                nxt.append(node[value])\n            elif kind == 'index' and isinstance(node, list) and 0 <= value < len(node):\n                nxt.append(node[value])\n            elif kind == 'star' and isinstance(node, list):\n                nxt.extend(node)\n            elif not fanned:\n                return None\n        if kind == 'star':\n            fanned = True\n        current = nxt\n    return current if fanned else current[0]\n",
    hint: "Walk a list of \"current nodes\" (starting as [doc]); a [*] extends it with every element, and a miss returns None only while you have not fanned out yet.",
    explanation:
      "Treating the traversal as a frontier of current nodes unifies the scalar and wildcard cases: before the first `[*]` the frontier has exactly one node and a miss means `None`; after it, misses just drop out of the frontier. Flattening as you go keeps `[*].tags[*]` a single list, which is what template engines expect. This pattern underlies JSONPath, jq and GraphQL field selection.",
    examples: [
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.lines[*].sku"], expected: ["A", "B"] },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.lines[1].sku"], expected: "B" },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.lines[*].tags[*]"], expected: ["x", "y"] },
    ],
    hiddenTests: [
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.id"], expected: 7 },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.lines[5].sku"], expected: null },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "customer.name"], expected: null },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.lines[0].tags[1]"], expected: "y" },
      { input: [{"order": {"id": 7, "lines": [{"sku": "A", "qty": 2, "tags": ["x", "y"]}, {"sku": "B", "qty": 1}, {"qty": 3}]}}, "order.id[*]"], expected: null },
      { input: [{"grid": [[1, 2], [3], []]}, "grid[*][*]"], expected: [1, 2, 3] },
      { input: [{"grid": [[1, 2], [3], []]}, "grid[1][0]"], expected: 3 },
    ],
  },
  {
    id: "py-build-render-farm-dispatch",
    number: 21,
    language: 'python',
    kind: 'build',
    title: "Render Farm Dispatch",
    difficulty: "Medium",
    topic: "Concurrency Models",
    statement:
      "A video studio simulates how a fixed pool of render workers will chew through a queue of jobs. Implement `dispatch_jobs(worker_count, jobs)`.\n\n`jobs` is a list of `[name, arrival, duration]` sorted by `arrival` (ties keep list order). Jobs are assigned strictly in list order. For each job:\n- pick the worker that becomes free earliest; on a tie pick the lowest worker index (workers are `0..worker_count-1` and all free at time 0);\n- the job starts at `max(arrival, worker_free_at)` and ends at `start + duration`; the worker is then busy until that end time.\n\nReturn `{\"assignments\": [[name, worker_index, start, end], ...] in job order, \"makespan\": <latest end time, or 0 when there are no jobs>}`.",
    functionName: "dispatch_jobs",
    functionSignature: "def dispatch_jobs(worker_count: int, jobs: list) -> dict:",
    buggyCode:
      "def dispatch_jobs(worker_count: int, jobs: list) -> dict:\n    # TODO: assign each job to the earliest-free worker\n    return {'assignments': [], 'makespan': 0}\n",
    solution:
      "def dispatch_jobs(worker_count: int, jobs: list) -> dict:\n    free_at = [0] * worker_count\n    assignments = []\n    makespan = 0\n    for name, arrival, duration in jobs:\n        worker = min(range(worker_count), key=lambda w: (free_at[w], w))\n        start = max(arrival, free_at[worker])\n        end = start + duration\n        free_at[worker] = end\n        makespan = max(makespan, end)\n        assignments.append([name, worker, start, end])\n    return {'assignments': assignments, 'makespan': makespan}\n",
    hint: "Keep a free_at list per worker; min(range(n), key=lambda w: (free_at[w], w)) picks the earliest-free, lowest-index worker.",
    explanation:
      "This is a discrete-event simulation of a worker pool: each worker is fully described by the time it becomes free, so assignment is just \"earliest free wins\". Starting at `max(arrival, free_at)` models both idle workers waiting for work and jobs waiting for workers. Being able to simulate a pool like this is how capacity planners answer \"how many workers do we need to hit this deadline?\".",
    examples: [
      { input: [2, [["intro", 0, 5], ["credits", 0, 2], ["trailer", 1, 4], ["teaser", 3, 1]]], expected: {"assignments": [["intro", 0, 0, 5], ["credits", 1, 0, 2], ["trailer", 1, 2, 6], ["teaser", 0, 5, 6]], "makespan": 6} },
      { input: [1, [["a", 0, 3], ["b", 10, 1], ["c", 10, 2]]], expected: {"assignments": [["a", 0, 0, 3], ["b", 0, 10, 11], ["c", 0, 11, 13]], "makespan": 13} },
    ],
    hiddenTests: [
      { input: [3, [["a", 0, 4], ["b", 0, 4], ["c", 0, 4], ["d", 0, 4], ["e", 2, 1]]], expected: {"assignments": [["a", 0, 0, 4], ["b", 1, 0, 4], ["c", 2, 0, 4], ["d", 0, 4, 8], ["e", 1, 4, 5]], "makespan": 8} },
      { input: [2, []], expected: {"assignments": [], "makespan": 0} },
      { input: [2, [["x", 5, 1], ["y", 5, 1], ["z", 5, 1], ["w", 6, 1]]], expected: {"assignments": [["x", 0, 5, 6], ["y", 1, 5, 6], ["z", 0, 6, 7], ["w", 1, 6, 7]], "makespan": 7} },
    ],
  },
  {
    id: "py-build-migration-run-order",
    number: 22,
    language: 'python',
    kind: 'build',
    title: "Migration Run Order",
    difficulty: "Medium",
    topic: "Concurrency Models",
    statement:
      "A deploy tool runs database migration steps that declare which other steps must finish first. Implement `run_order(steps)`.\n\n`steps` maps a step name to the list of names it depends on. A name that appears only inside a dependency list is an implicit step with no dependencies. Produce the execution order by repeatedly running the **alphabetically smallest** step whose dependencies have all completed (a single runner, one step at a time). Steps that can never run because they sit on or behind a dependency cycle are reported as blocked.\n\nReturn `{\"order\": [names in run order], \"blocked\": [never-run names, sorted alphabetically]}`.",
    functionName: "run_order",
    functionSignature: "def run_order(steps: dict) -> dict:",
    buggyCode:
      "def run_order(steps: dict) -> dict:\n    # TODO: topological order with a min-heap of ready steps\n    return {'order': sorted(steps), 'blocked': []}\n",
    solution:
      "import heapq\n\n\ndef run_order(steps: dict) -> dict:\n    deps = {}\n    for name, needs in steps.items():\n        deps.setdefault(name, set()).update(needs)\n        for dep in needs:\n            deps.setdefault(dep, set())\n    remaining = {name: len(needs) for name, needs in deps.items()}\n    dependents = {name: [] for name in deps}\n    for name, needs in deps.items():\n        for dep in needs:\n            dependents[dep].append(name)\n    ready = [name for name, count in remaining.items() if count == 0]\n    heapq.heapify(ready)\n    order = []\n    while ready:\n        name = heapq.heappop(ready)\n        order.append(name)\n        for child in dependents[name]:\n            remaining[child] -= 1\n            if remaining[child] == 0:\n                heapq.heappush(ready, child)\n    done = set(order)\n    blocked = sorted(name for name in deps if name not in done)\n    return {'order': order, 'blocked': blocked}\n",
    hint: "Kahn's algorithm with a heap instead of a queue gives the alphabetical tie-break; whatever never reaches in-degree zero is blocked.",
    explanation:
      "Dependency-ordered execution is a topological sort; using a min-heap for the ready set makes the order deterministic (smallest name first) which matters for reproducible deploys. Kahn's algorithm also detects cycles for free: any node whose remaining dependency count never hits zero is stuck, and so is everything downstream of it. Registering implicit dependencies as nodes avoids a KeyError on names that only appear on the right-hand side.",
    examples: [
      { input: [{"seed_users": ["create_users"], "create_orders": ["create_users"], "create_users": [], "index_orders": ["create_orders", "seed_users"]}], expected: {"order": ["create_users", "create_orders", "seed_users", "index_orders"], "blocked": []} },
      { input: [{"b": ["a"], "a": ["b"], "c": [], "d": ["a"]}], expected: {"order": ["c"], "blocked": ["a", "b", "d"]} },
    ],
    hiddenTests: [
      { input: [{"z": ["m"], "y": ["m"], "x": []}], expected: {"order": ["m", "x", "y", "z"], "blocked": []} },
      { input: [{}], expected: {"order": [], "blocked": []} },
      { input: [{"a": ["a"], "b": []}], expected: {"order": ["b"], "blocked": ["a"]} },
      { input: [{"c": ["a", "b"], "b": ["a"], "a": [], "d": ["c"], "e": ["f"], "f": ["g"], "g": ["e"]}], expected: {"order": ["a", "b", "c", "d"], "blocked": ["e", "f", "g"]} },
    ],
  },
  {
    id: "py-build-lock-wait-knot",
    number: 23,
    language: 'python',
    kind: 'build',
    title: "Lock Wait Knot",
    difficulty: "Hard",
    topic: "Concurrency Models",
    statement:
      "A database engine snapshots which transactions hold which row locks and which lock each blocked transaction is waiting for, then looks for a deadlock. Implement `find_knot(holds, waits)`.\n\n- `holds` is a list of `[txn, lock]` pairs (each lock has at most one holder).\n- `waits` is a list of `[txn, lock]` pairs, at most one per transaction.\n- Build the wait-for graph: transaction `A` waits for transaction `B` when `A` waits on a lock that `B` holds. A wait on a lock nobody holds, or on a lock the same transaction already holds, creates no edge.\n- A deadlock is a cycle in this graph. Return the transactions in the cycle as a sorted list, or `[]` when there is no cycle. The inputs contain at most one cycle, but transactions may point into the cycle without being part of it — those must not be included.",
    functionName: "find_knot",
    functionSignature: "def find_knot(holds: list, waits: list) -> list:",
    buggyCode:
      "def find_knot(holds: list, waits: list) -> list:\n    # TODO: build the wait-for graph and detect a cycle\n    return []\n",
    solution:
      "def find_knot(holds: list, waits: list) -> list:\n    owner = {lock: txn for txn, lock in holds}\n    graph = {}\n    for txn, lock in waits:\n        holder = owner.get(lock)\n        if holder is not None and holder != txn:\n            graph.setdefault(txn, set()).add(holder)\n    state = {}\n    path = []\n\n    def visit(node):\n        state[node] = 'active'\n        path.append(node)\n        for nxt in sorted(graph.get(node, ())):\n            status = state.get(nxt)\n            if status is None:\n                found = visit(nxt)\n                if found:\n                    return found\n            elif status == 'active':\n                return path[path.index(nxt):]\n        path.pop()\n        state[node] = 'done'\n        return None\n\n    for start in sorted(graph):\n        if start not in state:\n            cycle = visit(start)\n            if cycle:\n                return sorted(cycle)\n    return []\n",
    hint: "Map each lock to its holder, turn waits into txn -> holder edges, then DFS with an \"active\" set; when you hit an active node, the cycle is the path from that node onward.",
    explanation:
      "Deadlock detection reduces to finding a cycle in the wait-for graph, which is why lock managers keep exactly this structure. A DFS that tracks the current recursion path can not only detect the cycle but also return its members — the path suffix starting at the revisited node — while excluding transactions that merely lead into it. Real databases run this periodically and abort one member of the cycle as the victim.",
    examples: [
      { input: [[["t1", "rowA"], ["t2", "rowB"]], [["t1", "rowB"], ["t2", "rowA"]]], expected: ["t1", "t2"] },
      { input: [[["t1", "rowA"], ["t2", "rowB"], ["t3", "rowC"]], [["t1", "rowB"], ["t2", "rowC"], ["t3", "rowZ"]]], expected: [] },
    ],
    hiddenTests: [
      { input: [[["t1", "rowA"], ["t2", "rowB"], ["t3", "rowC"], ["t9", "rowQ"]], [["t9", "rowA"], ["t1", "rowB"], ["t2", "rowC"], ["t3", "rowA"]]], expected: ["t1", "t2", "t3"] },
      { input: [[["t1", "rowA"]], [["t1", "rowA"], ["t2", "rowA"]]], expected: [] },
      { input: [[], [["t1", "rowA"]]], expected: [] },
      { input: [[["a", "L1"], ["b", "L2"], ["c", "L3"], ["d", "L4"]], [["a", "L2"], ["b", "L3"], ["c", "L2"], ["d", "L1"]]], expected: ["b", "c"] },
    ],
  },
  {
    id: "py-build-per-key-resequencer",
    number: 24,
    language: 'python',
    kind: 'build',
    title: "Per-Key Resequencer",
    difficulty: "Hard",
    topic: "Concurrency Models",
    statement:
      "A chat backend receives per-conversation messages from parallel producers, so they can arrive out of order or twice. Implement `resequence(messages)` so each conversation is delivered in order.\n\nEach message is `[key, seq, payload]` where `seq` numbers start at 1 for every key and increase by 1. Process messages in arrival order:\n- Deliver a message immediately when its `seq` is exactly the next expected for its key, then keep delivering any buffered messages for that key that now follow consecutively.\n- Buffer a message whose `seq` is greater than expected (a gap).\n- Drop a message whose `seq` is below the next expected (already delivered) or whose `seq` is already buffered (duplicate).\n\nReturn `{\"delivered\": [payloads in delivery order across all keys], \"pending\": {key: [buffered seqs sorted ascending]}}` — only keys that still have buffered messages appear in `pending`.",
    functionName: "resequence",
    functionSignature: "def resequence(messages: list) -> dict:",
    buggyCode:
      "def resequence(messages: list) -> dict:\n    # TODO: per-key expected counter plus a gap buffer\n    return {'delivered': [m[2] for m in messages], 'pending': {}}\n",
    solution:
      "def resequence(messages: list) -> dict:\n    expected = {}\n    buffers = {}\n    delivered = []\n    for key, seq, payload in messages:\n        want = expected.get(key, 1)\n        buffer = buffers.setdefault(key, {})\n        if seq < want or seq in buffer:\n            continue\n        buffer[seq] = payload\n        while want in buffer:\n            delivered.append(buffer.pop(want))\n            want += 1\n        expected[key] = want\n    pending = {key: sorted(buf) for key, buf in buffers.items() if buf}\n    return {'delivered': delivered, 'pending': pending}\n",
    hint: "Put every accepted message into the key's buffer dict, then drain while the expected seq is present — this handles the immediate case and the catch-up case with one loop.",
    explanation:
      "Partitioned message systems guarantee order only per key, so consumers resequence with a per-key \"next expected\" counter and a small buffer for early arrivals. Draining the buffer in a loop after each insert handles the moment a gap closes and several messages become deliverable at once. Dropping stale and duplicate sequence numbers is what makes at-least-once delivery safe to consume exactly once.",
    examples: [
      { input: [[["room1", 1, "hi"], ["room1", 3, "late?"], ["room2", 1, "yo"], ["room1", 2, "how are you"], ["room2", 3, "gap"]]], expected: {"delivered": ["hi", "yo", "how are you", "late?"], "pending": {"room2": [3]}} },
      { input: [[["r", 2, "b"], ["r", 2, "b-dup"], ["r", 1, "a"], ["r", 1, "a-dup"], ["r", 4, "d"]]], expected: {"delivered": ["a", "b"], "pending": {"r": [4]}} },
    ],
    hiddenTests: [
      { input: [[["k", 5, "e"], ["k", 4, "d"], ["k", 3, "c"], ["k", 2, "b"], ["k", 1, "a"]]], expected: {"delivered": ["a", "b", "c", "d", "e"], "pending": {}} },
      { input: [[]], expected: {"delivered": [], "pending": {}} },
      { input: [[["a", 1, "a1"], ["b", 2, "b2"], ["a", 2, "a2"], ["b", 1, "b1"], ["a", 1, "again"], ["b", 4, "b4"]]], expected: {"delivered": ["a1", "a2", "b1", "b2"], "pending": {"b": [4]}} },
    ],
  },
  {
    id: "py-build-outbox-relay-drain",
    number: 25,
    language: 'python',
    kind: 'build',
    title: "Outbox Relay Drain",
    difficulty: "Hard",
    topic: "Concurrency Models",
    statement:
      "An order service writes events to an outbox table and a relay pushes them to a broker that acknowledges each one. Implement `run_outbox(timeout, max_attempts, ops)` to simulate the relay deterministically.\n\n`ops` arrive in non-decreasing time order and are one of:\n- `[\"enqueue\", t, id]` — a new message in state `\"pending\"` with 0 attempts (a repeated id is ignored);\n- `[\"tick\", t]` — the relay wakes up and scans messages in enqueue order. A message is **due** when it is `\"pending\"`, or when it is `\"inflight\"` and `t - sent_at >= timeout`. For each due message: if its attempts already equal `max_attempts`, mark it `\"dead\"`; otherwise increment attempts, set `sent_at = t`, mark it `\"inflight\"`, and record `[t, id, attempts]` in the send log;\n- `[\"ack\", t, id]` — if the message is `\"inflight\"`, mark it `\"acked\"`; acks for unknown, pending, dead or already-acked messages are ignored.\n\nReturn `{\"states\": {id: final_state}, \"sends\": [send log in order]}`.",
    functionName: "run_outbox",
    functionSignature: "def run_outbox(timeout: int, max_attempts: int, ops: list) -> dict:",
    buggyCode:
      "def run_outbox(timeout: int, max_attempts: int, ops: list) -> dict:\n    # TODO: enqueue / tick / ack state machine with a send log\n    return {'states': {}, 'sends': []}\n",
    solution:
      "def run_outbox(timeout: int, max_attempts: int, ops: list) -> dict:\n    messages = {}\n    order = []\n    sends = []\n    for op in ops:\n        kind, t = op[0], op[1]\n        if kind == 'enqueue':\n            mid = op[2]\n            if mid not in messages:\n                messages[mid] = {'state': 'pending', 'attempts': 0, 'sent_at': None}\n                order.append(mid)\n        elif kind == 'ack':\n            msg = messages.get(op[2])\n            if msg is not None and msg['state'] == 'inflight':\n                msg['state'] = 'acked'\n        elif kind == 'tick':\n            for mid in order:\n                msg = messages[mid]\n                due = msg['state'] == 'pending' or (\n                    msg['state'] == 'inflight' and t - msg['sent_at'] >= timeout\n                )\n                if not due:\n                    continue\n                if msg['attempts'] >= max_attempts:\n                    msg['state'] = 'dead'\n                else:\n                    msg['attempts'] += 1\n                    msg['sent_at'] = t\n                    msg['state'] = 'inflight'\n                    sends.append([t, mid, msg['attempts']])\n    return {'states': {mid: messages[mid]['state'] for mid in order}, 'sends': sends}\n",
    hint: "Keep {state, attempts, sent_at} per message and a separate list for enqueue order; only a tick changes pending/inflight into a send or a dead letter.",
    explanation:
      "The transactional outbox pattern makes event publishing reliable: messages are persisted first and a relay retries until the broker acknowledges, which yields at-least-once delivery. The simulation captures the essentials — an in-flight timeout that triggers a resend, a bounded attempt count that parks poison messages as dead letters, and acks that are only meaningful while a send is outstanding. Modelling it with explicit timestamps makes the retry behaviour testable without sleeping.",
    examples: [
      { input: [10, 3, [["enqueue", 0, "m1"], ["enqueue", 0, "m2"], ["tick", 1], ["ack", 2, "m1"], ["tick", 5], ["tick", 11], ["ack", 12, "m2"], ["tick", 30]]], expected: {"states": {"m1": "acked", "m2": "acked"}, "sends": [[1, "m1", 1], [1, "m2", 1], [11, "m2", 2]]} },
      { input: [5, 2, [["enqueue", 0, "p"], ["tick", 0], ["tick", 5], ["tick", 10], ["tick", 15], ["ack", 16, "p"]]], expected: {"states": {"p": "dead"}, "sends": [[0, "p", 1], [5, "p", 2]]} },
    ],
    hiddenTests: [
      { input: [5, 1, [["ack", 0, "ghost"], ["enqueue", 1, "a"], ["ack", 1, "a"], ["enqueue", 1, "a"], ["tick", 2], ["tick", 6], ["tick", 7], ["ack", 8, "a"]]], expected: {"states": {"a": "dead"}, "sends": [[2, "a", 1]]} },
      { input: [3, 3, [["enqueue", 0, "x"], ["enqueue", 2, "y"], ["tick", 2], ["ack", 3, "y"], ["tick", 4], ["tick", 5], ["enqueue", 5, "z"], ["tick", 5]]], expected: {"states": {"x": "inflight", "y": "acked", "z": "inflight"}, "sends": [[2, "x", 1], [2, "y", 1], [5, "x", 2], [5, "z", 1]]} },
      { input: [1, 1, []], expected: {"states": {}, "sends": []} },
    ],
  },
  // ------------------------------------------------------------ State Machines
  {
    id: 'py-build-order-guarded-transitions',
    number: 26,
    language: 'python',
    kind: 'build',
    title: 'Sourdough Order Ledger',
    difficulty: 'Medium',
    topic: 'State Machines',
    statement:
      'Implement `run_order_events(events)` for a bakery order. The order starts in state `draft` with a running total of 0 cents. Each event is a list and you return one string per event: the new state on success, or `rejected:<reason>` (state unchanged) on failure.\n\n- `["add", qty, unit_cents]` — only in `draft`. If `qty <= 0` reject with `quantity`. Otherwise add `qty * unit_cents` to the total; state stays `draft`.\n- `["submit"]` — `draft` → `placed`. If the total is 0 reject with `empty`.\n- `["pay", cents]` — `placed` → `paid`. If `cents != total` reject with `amount`.\n- `["ship"]` — `paid` → `shipped`.\n- `["cancel"]` — from `draft`, `placed` or `paid` → `cancelled`.\n\nAny event that is not allowed in the current state (including unknown event names, and anything at all once the order is `shipped` or `cancelled`) is rejected with reason `transition`. Check the state before the guard, so `["add", 0, 100]` while `placed` is `rejected:transition`, not `rejected:quantity`.',
    functionName: 'run_order_events',
    functionSignature: 'def run_order_events(events: list) -> list[str]:',
    buggyCode:
      "def run_order_events(events: list) -> list[str]:\n    # TODO: walk the events, keep state + total, apply guards\n    return []\n",
    solution: `def run_order_events(events: list) -> list[str]:
    state = 'draft'
    total = 0
    out = []
    for ev in events:
        kind = ev[0]
        if kind == 'add' and state == 'draft':
            qty, unit = ev[1], ev[2]
            if qty <= 0:
                out.append('rejected:quantity')
                continue
            total += qty * unit
        elif kind == 'submit' and state == 'draft':
            if total == 0:
                out.append('rejected:empty')
                continue
            state = 'placed'
        elif kind == 'pay' and state == 'placed':
            if ev[1] != total:
                out.append('rejected:amount')
                continue
            state = 'paid'
        elif kind == 'ship' and state == 'paid':
            state = 'shipped'
        elif kind == 'cancel' and state in ('draft', 'placed', 'paid'):
            state = 'cancelled'
        else:
            out.append('rejected:transition')
            continue
        out.append(state)
    return out
`,
    hint: 'Decide legality in two steps: first "is this event allowed in this state?" (else transition), then the event-specific guard.',
    explanation:
      'A lifecycle is a table of (state, event) → next state, plus guards that inspect data before the move happens. Keeping the transition check separate from the guard gives callers precise reasons and makes terminal states trivially safe: nothing matches, so everything is rejected. Production order systems rely on exactly this shape so that a duplicate "ship" webhook or a stale "pay" cannot corrupt an order.',
    examples: [
      { input: [[['add', 2, 450], ['submit'], ['pay', 900], ['ship']]], expected: ['draft', 'placed', 'paid', 'shipped'] },
      {
        input: [[['submit'], ['add', 1, 300], ['submit'], ['pay', 250], ['cancel'], ['ship']]],
        expected: ['rejected:empty', 'draft', 'placed', 'rejected:amount', 'cancelled', 'rejected:transition'],
      },
    ],
    hiddenTests: [
      {
        input: [[['add', 0, 100], ['add', 3, 100], ['ship'], ['submit'], ['add', 1, 100], ['pay', 300]]],
        expected: ['rejected:quantity', 'draft', 'rejected:transition', 'placed', 'rejected:transition', 'paid'],
      },
      { input: [[['cancel'], ['add', 1, 50]]], expected: ['cancelled', 'rejected:transition'] },
      {
        input: [[['add', 1, 100], ['submit'], ['pay', 100], ['cancel'], ['cancel']]],
        expected: ['draft', 'placed', 'paid', 'cancelled', 'rejected:transition'],
      },
      { input: [[['refund']]], expected: ['rejected:transition'] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'py-build-membership-status-machine',
    number: 27,
    language: 'python',
    kind: 'build',
    title: 'Gym Membership Status',
    difficulty: 'Easy',
    topic: 'State Machines',
    statement:
      'Implement `membership_states(events)` that replays billing events for a gym membership and returns the state after each event. The membership starts as `trialing`.\n\n- `payment_ok`: from `trialing`, `active` or `past_due` → `active`, and the consecutive-failure counter resets to 0.\n- `payment_failed`: from `trialing` or `active` → `past_due` (counter becomes 1). From `past_due` the counter increments; when it reaches 3 the state becomes `expired`, otherwise it stays `past_due`.\n- `cancel`: from any non-terminal state → `canceled`.\n\n`canceled` and `expired` are terminal: every later event leaves the state unchanged. Unknown event names never change the state. Always append the current state after each event.',
    functionName: 'membership_states',
    functionSignature: 'def membership_states(events: list[str]) -> list[str]:',
    buggyCode:
      "def membership_states(events: list[str]) -> list[str]:\n    # TODO: track state and consecutive failures\n    return []\n",
    solution: `def membership_states(events: list[str]) -> list[str]:
    state = 'trialing'
    failures = 0
    out = []
    for ev in events:
        if state in ('canceled', 'expired'):
            pass
        elif ev == 'payment_ok':
            state = 'active'
            failures = 0
        elif ev == 'payment_failed':
            failures += 1
            state = 'expired' if failures >= 3 else 'past_due'
        elif ev == 'cancel':
            state = 'canceled'
        out.append(state)
    return out
`,
    hint: 'Check for a terminal state before looking at the event, and keep the failure counter next to the state.',
    explanation:
      'The counter is the piece of state that a naive "state string only" implementation forgets: past_due after one failure and past_due after two look identical yet behave differently on the next event. Reset it on success so a member who pays late is not one failure away from expiry. Handling terminal states up front keeps late-arriving webhooks harmless.',
    examples: [
      { input: [['payment_ok', 'payment_failed', 'payment_ok']], expected: ['active', 'past_due', 'active'] },
      {
        input: [['payment_failed', 'payment_failed', 'payment_failed', 'payment_ok']],
        expected: ['past_due', 'past_due', 'expired', 'expired'],
      },
    ],
    hiddenTests: [
      { input: [['cancel', 'payment_ok']], expected: ['canceled', 'canceled'] },
      {
        input: [['payment_failed', 'payment_failed', 'payment_ok', 'payment_failed', 'payment_failed']],
        expected: ['past_due', 'past_due', 'active', 'past_due', 'past_due'],
      },
      { input: [['renew', 'payment_ok', 'cancel']], expected: ['trialing', 'active', 'canceled'] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'py-build-breaker-trace',
    number: 28,
    language: 'python',
    kind: 'build',
    title: 'Tripwire for a Flaky Upstream',
    difficulty: 'Hard',
    topic: 'State Machines',
    statement:
      'Implement `breaker_trace(calls, threshold, cooldown)` that simulates a protective breaker in front of an unreliable weather API. `calls` is a list of `[t, ok]` pairs in non-decreasing time order, where `ok` says whether the call *would* succeed if executed. Return one string per call: `ok`, `fail`, or `skipped`.\n\nThe breaker starts **closed** with a consecutive-failure count of 0.\n- Closed: execute the call. Success → `ok` and the count resets to 0. Failure → `fail`, count += 1; if the count reaches `threshold` the breaker **opens** and records `opened_at = t`.\n- Open: if `t < opened_at + cooldown` the call is not executed → `skipped`. Otherwise this is a half-open trial: execute it. Success → `ok`, breaker closes, count resets to 0. Failure → `fail`, breaker stays open with `opened_at = t` (the cooldown restarts).\n\nA `cooldown` of 0 means every call while open is a trial.',
    functionName: 'breaker_trace',
    functionSignature: 'def breaker_trace(calls: list, threshold: int, cooldown: int) -> list[str]:',
    buggyCode:
      "def breaker_trace(calls: list, threshold: int, cooldown: int) -> list[str]:\n    # TODO: closed / open / half-open trial\n    return []\n",
    solution: `def breaker_trace(calls: list, threshold: int, cooldown: int) -> list[str]:
    is_open = False
    opened_at = 0
    failures = 0
    out = []
    for t, ok in calls:
        if is_open:
            if t < opened_at + cooldown:
                out.append('skipped')
                continue
            # half-open trial
            if ok:
                is_open = False
                failures = 0
                out.append('ok')
            else:
                opened_at = t
                out.append('fail')
            continue
        if ok:
            failures = 0
            out.append('ok')
        else:
            failures += 1
            out.append('fail')
            if failures >= threshold:
                is_open = True
                opened_at = t
    return out
`,
    hint: 'A half-open trial is just "open, but the cooldown has elapsed" — you do not need a third state variable, only a branch.',
    explanation:
      'Circuit breakers convert a storm of slow failures into fast skips so a dying dependency cannot exhaust your workers. The subtle rules are the ones tests probe: the trial after cooldown executes exactly one call, a failed trial restarts the cooldown from the trial time, and a successful trial fully resets the failure counter. Get any of these wrong and the breaker either never recovers or flaps open and closed.',
    examples: [
      {
        input: [[[0, false], [1, false], [5, true], [11, true], [12, true]], 2, 10],
        expected: ['fail', 'fail', 'skipped', 'ok', 'ok'],
      },
      {
        input: [[[0, false], [1, true], [2, false], [3, false], [20, false], [25, true], [31, true]], 2, 10],
        expected: ['fail', 'ok', 'fail', 'fail', 'fail', 'skipped', 'ok'],
      },
    ],
    hiddenTests: [
      { input: [[[0, false], [4, true], [5, false], [9, true], [10, true]], 1, 5], expected: ['fail', 'skipped', 'fail', 'skipped', 'ok'] },
      {
        input: [[[0, false], [1, false], [2, true], [3, false], [4, false], [5, false], [50, true]], 3, 100],
        expected: ['fail', 'fail', 'ok', 'fail', 'fail', 'fail', 'skipped'],
      },
      {
        input: [[[0, false], [0, false], [0, true], [0, false], [0, false], [0, false]], 2, 0],
        expected: ['fail', 'fail', 'ok', 'fail', 'fail', 'fail'],
      },
      { input: [[], 2, 10], expected: [] },
    ],
  },
  {
    id: 'py-build-signoff-workflow',
    number: 29,
    language: 'python',
    kind: 'build',
    title: 'Contract Sign-off Board',
    difficulty: 'Medium',
    topic: 'State Machines',
    statement:
      'Implement `signoff_states(required, events)` for a contract that needs sign-off from every name in `required`. The contract starts in `draft` with no approvals. Return the state after each event; an event that is not applicable is ignored (state unchanged) but you still append the current state.\n\n- `["submit"]`: `draft` → `in_review`.\n- `["approve", who]`: only in `in_review` and only if `who` is in `required`. Record the approval (approving twice counts once). When every required name has approved, the state becomes `approved`.\n- `["reject", who]`: only in `in_review` and only by a required name. The state returns to `draft` and all approvals are cleared.\n- `["edit"]`: in `in_review` the state returns to `draft` and approvals are cleared; in `draft` nothing changes.\n\n`approved` is terminal — every later event is ignored.',
    functionName: 'signoff_states',
    functionSignature: 'def signoff_states(required: list[str], events: list) -> list[str]:',
    buggyCode:
      "def signoff_states(required: list[str], events: list) -> list[str]:\n    # TODO: state + set of approvals\n    return []\n",
    solution: `def signoff_states(required: list[str], events: list) -> list[str]:
    needed = set(required)
    state = 'draft'
    approvals = set()
    out = []
    for ev in events:
        kind = ev[0]
        if state == 'approved':
            pass
        elif kind == 'submit' and state == 'draft':
            state = 'in_review'
        elif kind == 'approve' and state == 'in_review' and ev[1] in needed:
            approvals.add(ev[1])
            if approvals == needed:
                state = 'approved'
        elif kind == 'reject' and state == 'in_review' and ev[1] in needed:
            state = 'draft'
            approvals = set()
        elif kind == 'edit' and state == 'in_review':
            state = 'draft'
            approvals = set()
        out.append(state)
    return out
`,
    hint: 'Store approvals as a set and compare it to the set of required names; clear it whenever the document leaves review.',
    explanation:
      'Approval workflows fail in production when stale approvals survive an edit — a reviewer signed off on text that no longer exists. Modelling approvals as a set that is wiped on every transition back to draft encodes the rule structurally instead of hoping callers remember it. Ignoring approvals from non-required users blocks the classic "approve your own change" hole.',
    examples: [
      { input: [['ana', 'bo'], [['submit'], ['approve', 'ana'], ['approve', 'bo']]], expected: ['in_review', 'in_review', 'approved'] },
      {
        input: [
          ['ana', 'bo'],
          [['approve', 'ana'], ['submit'], ['approve', 'cy'], ['reject', 'bo'], ['submit'], ['approve', 'ana'], ['approve', 'ana'], ['approve', 'bo']],
        ],
        expected: ['draft', 'in_review', 'in_review', 'draft', 'in_review', 'in_review', 'in_review', 'approved'],
      },
    ],
    hiddenTests: [
      {
        input: [['ana', 'bo'], [['submit'], ['approve', 'ana'], ['edit'], ['submit'], ['approve', 'bo'], ['approve', 'ana']]],
        expected: ['in_review', 'in_review', 'draft', 'in_review', 'in_review', 'approved'],
      },
      {
        input: [['ana'], [['submit'], ['approve', 'ana'], ['reject', 'ana'], ['edit']]],
        expected: ['in_review', 'approved', 'approved', 'approved'],
      },
      {
        input: [['ana', 'bo', 'cy'], [['submit'], ['approve', 'bo'], ['approve', 'cy'], ['reject', 'ana'], ['approve', 'ana']]],
        expected: ['in_review', 'in_review', 'in_review', 'draft', 'draft'],
      },
      { input: [['ana'], [['edit'], ['reject', 'ana']]], expected: ['draft', 'draft'] },
    ],
  },
  {
    id: 'py-build-link-handshake',
    number: 30,
    language: 'python',
    kind: 'build',
    title: 'Bike Dock Link-Up',
    difficulty: 'Easy',
    topic: 'State Machines',
    statement:
      'Implement `handshake_states(frames, supported)` that drives the connection handshake between a bike-share dock and its controller. `frames` is the list of incoming text frames in order; `supported` lists the protocol versions the dock accepts. Return the state after each frame. Frames are a keyword optionally followed by one space and an argument.\n\nStarting state is `idle`.\n- `idle` + `HELLO` → `greeted`\n- `greeted` + `ACK <n>` → `negotiated` if `int(n)` is in `supported`, otherwise `closed`\n- `negotiated` + `AUTH <token>` → `authing`\n- `authing` + `AUTH_OK` → `ready`; `authing` + `AUTH_FAIL` → `closed`\n- `ready` + `DATA <payload>` → `ready`\n- any non-terminal state + `BYE` → `closed`\n\nAny other (state, frame) combination → `error`. `closed` and `error` are terminal: later frames leave the state unchanged.',
    functionName: 'handshake_states',
    functionSignature: 'def handshake_states(frames: list[str], supported: list[int]) -> list[str]:',
    buggyCode:
      "def handshake_states(frames: list[str], supported: list[int]) -> list[str]:\n    # TODO: split each frame into keyword + argument, drive the state\n    return []\n",
    solution: `def handshake_states(frames: list[str], supported: list[int]) -> list[str]:
    state = 'idle'
    out = []
    for frame in frames:
        parts = frame.split(' ', 1)
        kw = parts[0]
        arg = parts[1] if len(parts) > 1 else ''
        if state in ('closed', 'error'):
            pass
        elif kw == 'BYE':
            state = 'closed'
        elif state == 'idle' and kw == 'HELLO':
            state = 'greeted'
        elif state == 'greeted' and kw == 'ACK':
            state = 'negotiated' if int(arg) in supported else 'closed'
        elif state == 'negotiated' and kw == 'AUTH':
            state = 'authing'
        elif state == 'authing' and kw == 'AUTH_OK':
            state = 'ready'
        elif state == 'authing' and kw == 'AUTH_FAIL':
            state = 'closed'
        elif state == 'ready' and kw == 'DATA':
            state = 'ready'
        else:
            state = 'error'
        out.append(state)
    return out
`,
    hint: 'Split each frame once on the first space; the keyword picks the transition and the argument is only needed for ACK.',
    explanation:
      'Protocol handshakes are state machines where the *order* of messages is the contract: DATA before AUTH_OK is not a data frame, it is a protocol violation. Encoding every valid (state, keyword) pair explicitly and defaulting to a terminal error state is what keeps a malformed or malicious peer from sneaking past authentication. Terminal states must swallow everything, otherwise a late HELLO could restart a closed link.',
    examples: [
      {
        input: [['HELLO', 'ACK 2', 'AUTH abc', 'AUTH_OK', 'DATA 1', 'BYE'], [1, 2]],
        expected: ['greeted', 'negotiated', 'authing', 'ready', 'ready', 'closed'],
      },
      { input: [['HELLO', 'ACK 3', 'HELLO'], [1, 2]], expected: ['greeted', 'closed', 'closed'] },
    ],
    hiddenTests: [
      { input: [['ACK 1', 'HELLO'], [1]], expected: ['error', 'error'] },
      { input: [['HELLO', 'ACK 1', 'AUTH t', 'AUTH_FAIL', 'DATA x'], [1]], expected: ['greeted', 'negotiated', 'authing', 'closed', 'closed'] },
      { input: [['HELLO', 'BYE', 'HELLO'], [1]], expected: ['greeted', 'closed', 'closed'] },
      { input: [['HELLO', 'ACK 1', 'DATA x'], [1]], expected: ['greeted', 'negotiated', 'error'] },
    ],
  },

  // ------------------------------------------------------------ Money & Time
  {
    id: 'py-build-fair-cents-split',
    number: 31,
    language: 'python',
    kind: 'build',
    title: 'Split the Brunch Tab',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement:
      'Implement `split_cents(total, weights)` that divides an integer amount of cents among diners in proportion to `weights` (non-negative ints, sum > 0) using only integer arithmetic. The returned shares must be ints that sum exactly to `total`.\n\nUse the largest-remainder method: give each diner `floor(total * w / sum)`, then hand out the leftover cents one at a time to the diners with the largest remainders `(total * w) % sum`; break ties by the earlier index. A diner with weight 0 receives 0.',
    functionName: 'split_cents',
    functionSignature: 'def split_cents(total: int, weights: list[int]) -> list[int]:',
    buggyCode: "def split_cents(total: int, weights: list[int]) -> list[int]:\n    # TODO: floors first, then largest remainders\n    return []\n",
    solution: `def split_cents(total: int, weights: list[int]) -> list[int]:
    w_sum = sum(weights)
    shares = [total * w // w_sum for w in weights]
    rems = [(total * w) % w_sum for w in weights]
    leftover = total - sum(shares)
    order = sorted(range(len(weights)), key=lambda i: (-rems[i], i))
    for i in order[:leftover]:
        shares[i] += 1
    return shares
`,
    hint: 'Compute floor shares and integer remainders in one pass, then sort indices by (-remainder, index) and top up the first `leftover` of them.',
    explanation:
      'Floating-point division followed by rounding loses or invents cents; ledgers must balance to the cent, so integer floors plus a deterministic remainder pass is the standard fix. Sorting by remainder with the index as tie-breaker makes the split reproducible across runs and machines, which matters when the same invoice is recomputed for an audit.',
    examples: [
      { input: [100, [1, 1, 1]], expected: [34, 33, 33] },
      { input: [1000, [3, 1]], expected: [750, 250] },
    ],
    hiddenTests: [
      { input: [101, [1, 1, 1, 1]], expected: [26, 25, 25, 25] },
      { input: [10, [2, 3, 5]], expected: [2, 3, 5] },
      { input: [7, [1, 2]], expected: [2, 5] },
      { input: [5, [0, 1]], expected: [0, 5] },
      { input: [1, [1, 1, 1]], expected: [1, 0, 0] },
    ],
  },
  {
    id: 'py-build-coupon-then-tax',
    number: 32,
    language: 'python',
    kind: 'build',
    title: 'Coupon Before Tax',
    difficulty: 'Easy',
    topic: 'Money & Time',
    statement:
      'Implement `checkout_total(items, coupon, tax_bp)` for a plant-shop checkout, using integer cents throughout.\n\n- `items` is a list of `[unit_cents, qty]`; `subtotal` is the sum of `unit_cents * qty`.\n- `coupon` is `None`, `{"kind": "percent", "value": p}` (discount = `subtotal * p // 100`, floored) or `{"kind": "fixed", "value": c}` (discount = `min(c, subtotal)`).\n- `taxable = subtotal - discount`; tax is charged in basis points on the taxable amount, rounded half-up to the cent: `tax = (taxable * tax_bp + 5000) // 10000`.\n- `total = taxable + tax`.\n\nReturn `{"subtotal": ..., "discount": ..., "tax": ..., "total": ...}`.',
    functionName: 'checkout_total',
    functionSignature: 'def checkout_total(items: list, coupon, tax_bp: int) -> dict:',
    buggyCode:
      "def checkout_total(items: list, coupon, tax_bp: int) -> dict:\n    # TODO: subtotal -> discount -> tax (half-up) -> total\n    return {}\n",
    solution: `def checkout_total(items: list, coupon, tax_bp: int) -> dict:
    subtotal = sum(unit * qty for unit, qty in items)
    discount = 0
    if coupon is not None:
        if coupon['kind'] == 'percent':
            discount = subtotal * coupon['value'] // 100
        else:
            discount = min(coupon['value'], subtotal)
    taxable = subtotal - discount
    tax = (taxable * tax_bp + 5000) // 10000
    return {'subtotal': subtotal, 'discount': discount, 'tax': tax, 'total': taxable + tax}
`,
    hint: 'Never touch floats: percent and basis points are integer multiplications followed by one floor division.',
    explanation:
      'Order of operations is a business rule, not an implementation detail — discounting after tax would overcharge tax on money the customer never paid. Integer basis points with an explicit "+5000 then floor" implement half-up rounding without the banker\'s-rounding surprise of Python\'s round(). Clamping a fixed coupon at the subtotal prevents negative invoices.',
    examples: [
      {
        input: [[[1000, 2], [250, 1]], { kind: 'percent', value: 10 }, 825],
        expected: { subtotal: 2250, discount: 225, tax: 167, total: 2192 },
      },
      { input: [[[499, 3]], null, 0], expected: { subtotal: 1497, discount: 0, tax: 0, total: 1497 } },
    ],
    hiddenTests: [
      { input: [[[300, 1]], { kind: 'fixed', value: 500 }, 1000], expected: { subtotal: 300, discount: 300, tax: 0, total: 0 } },
      { input: [[[1999, 1]], { kind: 'percent', value: 15 }, 700], expected: { subtotal: 1999, discount: 299, tax: 119, total: 1819 } },
      { input: [[[1, 1]], null, 5000], expected: { subtotal: 1, discount: 0, tax: 1, total: 2 } },
      { input: [[], { kind: 'fixed', value: 100 }, 800], expected: { subtotal: 0, discount: 0, tax: 0, total: 0 } },
    ],
  },
  {
    id: 'py-build-plan-switch-proration',
    number: 33,
    language: 'python',
    kind: 'build',
    title: 'Mid-Cycle Plan Switch',
    difficulty: 'Easy',
    topic: 'Money & Time',
    statement:
      'Implement `prorate_switch(old_cents, new_cents, period_days, days_used)` for a podcast-hosting subscription that changes plan part-way through a billing period. `days_used` days of the period have already elapsed (0 ≤ days_used ≤ period_days).\n\nLet `remaining = period_days - days_used`. Using integer arithmetic with floor division:\n- `credit = old_cents * remaining // period_days` (unused portion of the old plan)\n- `charge = new_cents * remaining // period_days` (remaining portion of the new plan)\n- `due = charge - credit` (negative means the customer is owed a credit)\n\nReturn `{"credit": ..., "charge": ..., "due": ...}`.',
    functionName: 'prorate_switch',
    functionSignature: 'def prorate_switch(old_cents: int, new_cents: int, period_days: int, days_used: int) -> dict:',
    buggyCode:
      "def prorate_switch(old_cents: int, new_cents: int, period_days: int, days_used: int) -> dict:\n    # TODO\n    return {}\n",
    solution: `def prorate_switch(old_cents: int, new_cents: int, period_days: int, days_used: int) -> dict:
    remaining = period_days - days_used
    credit = old_cents * remaining // period_days
    charge = new_cents * remaining // period_days
    return {'credit': credit, 'charge': charge, 'due': charge - credit}
`,
    hint: 'Multiply before dividing so the floor happens once, on the final cent amount.',
    explanation:
      'Proration is "credit what was not used, charge what will be used", computed on the same remaining fraction so upgrades and downgrades are symmetric. Multiplying first and flooring once keeps the result an exact integer number of cents; computing a per-day rate first would accumulate rounding drift. A negative `due` is a legitimate outcome that billing code must be able to represent.',
    examples: [
      { input: [3000, 6000, 30, 10], expected: { credit: 2000, charge: 4000, due: 2000 } },
      { input: [6000, 3000, 30, 15], expected: { credit: 3000, charge: 1500, due: -1500 } },
    ],
    hiddenTests: [
      { input: [1000, 1000, 31, 0], expected: { credit: 1000, charge: 1000, due: 0 } },
      { input: [999, 2999, 30, 29], expected: { credit: 33, charge: 99, due: 66 } },
      { input: [5000, 8000, 30, 30], expected: { credit: 0, charge: 0, due: 0 } },
    ],
  },
  {
    id: 'py-build-working-day-offset',
    number: 34,
    language: 'python',
    kind: 'build',
    title: 'Courier Working-Day Offset',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement:
      'Implement `add_working_days(start, n, holidays)` for a courier that only operates Monday–Friday. `start` is an ISO date string `YYYY-MM-DD`, `n` is an integer (may be negative), and `holidays` is a list of ISO date strings that are also non-working days.\n\nMove forward (or backward when `n < 0`) one calendar day at a time, counting a day only if it is a weekday and not a holiday, until `n` working days have been counted; return that date as `YYYY-MM-DD`. When `n == 0` return `start` unchanged even if it is a weekend or holiday. Use only the `datetime` module.',
    functionName: 'add_working_days',
    functionSignature: 'def add_working_days(start: str, n: int, holidays: list[str]) -> str:',
    buggyCode:
      "from datetime import date, timedelta\n\ndef add_working_days(start: str, n: int, holidays: list[str]) -> str:\n    # TODO: step day by day, count only working days\n    return start\n",
    solution: `from datetime import date, timedelta

def add_working_days(start: str, n: int, holidays: list[str]) -> str:
    off = set(date.fromisoformat(h) for h in holidays)
    d = date.fromisoformat(start)
    step = timedelta(days=1 if n >= 0 else -1)
    left = abs(n)
    while left > 0:
        d += step
        if d.weekday() < 5 and d not in off:
            left -= 1
    return d.isoformat()
`,
    hint: '`date.weekday()` returns 0 for Monday and 5/6 for the weekend; step first, then test whether the day counts.',
    explanation:
      'SLAs like "ships within 2 working days" hide three traps: weekends, holidays, and a start date that is itself a non-working day. Stepping one calendar day at a time and only decrementing on a qualifying day handles all three uniformly, including negative offsets for "latest pick-up date" calculations. Parsing holidays into a set of date objects once avoids string comparisons in the loop.',
    examples: [
      { input: ['2024-03-01', 1, []], expected: '2024-03-04' },
      { input: ['2024-12-24', 2, ['2024-12-25', '2024-12-26']], expected: '2024-12-30' },
    ],
    hiddenTests: [
      { input: ['2024-03-04', -1, []], expected: '2024-03-01' },
      { input: ['2024-05-25', 1, []], expected: '2024-05-27' },
      { input: ['2024-07-03', 3, ['2024-07-04']], expected: '2024-07-09' },
      { input: ['2024-01-02', 0, ['2024-01-02']], expected: '2024-01-02' },
      { input: ['2024-01-08', -2, ['2024-01-05']], expected: '2024-01-03' },
    ],
  },
  {
    id: 'py-build-shared-open-windows',
    number: 35,
    language: 'python',
    kind: 'build',
    title: 'Where Two Rosters Overlap',
    difficulty: 'Medium',
    topic: 'Money & Time',
    statement:
      'Implement `shared_windows(a, b)` for a clinic that needs the minutes when both a nurse and a room are available. `a` and `b` are lists of `[start, end)` availability windows in minutes since midnight. Each list may be unsorted and may contain windows that overlap or touch each other.\n\nFirst normalise each list by sorting and merging overlapping *or touching* windows (`[0,50]` and `[50,100]` become `[0,100]`). Then return the intersection of the two normalised lists as a sorted list of `[start, end]` pairs, omitting empty intersections (where `start == end`).',
    functionName: 'shared_windows',
    functionSignature: 'def shared_windows(a: list, b: list) -> list:',
    buggyCode: "def shared_windows(a: list, b: list) -> list:\n    # TODO: merge each side, then two-pointer intersection\n    return []\n",
    solution: `def shared_windows(a: list, b: list) -> list:
    def merge(ws):
        merged = []
        for s, e in sorted(ws):
            if merged and s <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])
        return merged

    x, y = merge(a), merge(b)
    i = j = 0
    out = []
    while i < len(x) and j < len(y):
        s = max(x[i][0], y[j][0])
        e = min(x[i][1], y[j][1])
        if s < e:
            out.append([s, e])
        if x[i][1] < y[j][1]:
            i += 1
        else:
            j += 1
    return out
`,
    hint: 'After merging, both lists are sorted and disjoint, so a two-pointer sweep that always advances the window ending first finds every overlap.',
    explanation:
      'Availability math is interval math: merge first so that adjacent shifts do not create phantom gaps, then intersect. The two-pointer sweep runs in linear time after sorting and never emits a zero-length window, which downstream booking code would otherwise treat as a valid slot. Keeping everything in integer minutes sidesteps timezone and DST questions entirely.',
    examples: [
      { input: [[[540, 720], [780, 1020]], [[600, 900]]], expected: [[600, 720], [780, 900]] },
      { input: [[[0, 100]], [[100, 200]]], expected: [] },
    ],
    hiddenTests: [
      { input: [[[100, 200], [150, 300], [400, 500]], [[0, 1000]]], expected: [[100, 300], [400, 500]] },
      { input: [[[300, 400], [100, 200]], [[350, 600], [0, 120]]], expected: [[100, 120], [350, 400]] },
      { input: [[[0, 50], [50, 100]], [[25, 75]]], expected: [[25, 75]] },
      { input: [[], [[0, 10]]], expected: [] },
    ],
  },

  // ------------------------------------------------------------ Config & Validation
  {
    id: 'py-build-layered-settings',
    number: 36,
    language: 'python',
    kind: 'build',
    title: 'Settings From Three Layers',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement:
      'Implement `merge_layers(layers)` that combines configuration layers (defaults, environment, per-tenant overrides) into one dict. `layers` is a list of dicts applied in order; later layers win.\n\nRules:\n- When both the existing value and the new value are dicts, merge them recursively.\n- Otherwise the new value replaces the old one entirely — lists are replaced, not concatenated; a dict can be replaced by a scalar and vice versa.\n- A value of `None` in a later layer **deletes** the key from the result (if it exists). It never stores `None`.\n- Do not mutate the input dicts. An empty `layers` list returns `{}`.',
    functionName: 'merge_layers',
    functionSignature: 'def merge_layers(layers: list[dict]) -> dict:',
    buggyCode: "def merge_layers(layers: list[dict]) -> dict:\n    # TODO: recursive merge with None-as-delete\n    return {}\n",
    solution: `def merge_layers(layers: list[dict]) -> dict:
    def merge_into(base, layer):
        for key, val in layer.items():
            if val is None:
                base.pop(key, None)
            elif isinstance(val, dict) and isinstance(base.get(key), dict):
                merge_into(base[key], val)
            elif isinstance(val, dict):
                base[key] = merge_into({}, val)
            else:
                base[key] = val
        return base

    result = {}
    for layer in layers:
        merge_into(result, layer)
    return result
`,
    hint: 'Build a fresh result dict and merge each layer into it; when you copy a dict value in, merge it into a new empty dict so you never alias the input.',
    explanation:
      'Layered config is the backbone of every twelve-factor deployment: defaults in code, overrides from the environment, tenant tweaks from a database. Deep-merging dicts while replacing lists matches what operators expect (you override the whole allow-list, not append to it), and "None deletes" gives a way to unset a default without a special sentinel string. Aliasing the input dict is the classic bug — a later layer would silently mutate your defaults.',
    examples: [
      {
        input: [[{ db: { host: 'a', port: 1 }, debug: false }, { db: { port: 2 }, debug: true }]],
        expected: { db: { host: 'a', port: 2 }, debug: true },
      },
      { input: [[{ tags: ['a', 'b'], cache: { ttl: 10 } }, { tags: ['c'], cache: null }]], expected: { tags: ['c'] } },
    ],
    hiddenTests: [
      { input: [[{ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } }, { a: { b: { c: null } } }]], expected: { a: { b: { d: 2 } } } },
      { input: [[{ a: 1 }, { a: { x: 1 } }, { a: { y: 2 } }]], expected: { a: { x: 1, y: 2 } } },
      { input: [[{ a: null }, { a: 5 }]], expected: { a: 5 } },
      { input: [[]], expected: {} },
      { input: [[{ a: { x: 1 } }, { a: 7 }]], expected: { a: 7 } },
    ],
  },
  {
    id: 'py-build-schema-error-paths',
    number: 37,
    language: 'python',
    kind: 'build',
    title: 'Payload Checker With Pointers',
    difficulty: 'Hard',
    topic: 'Config & Validation',
    statement:
      'Implement `validate(schema, value)` that checks an API payload against a tiny schema language and returns a list of `"<path>: <message>"` strings in the order the problems are encountered (empty list when valid). The root path is `$`; a field is `<path>.<name>`; a list element is `<path>[<index>]`.\n\nSchema nodes are dicts with a `type`:\n- `{"type": "str", "min_len"?: n}` → `expected str`; then `too short (min n)`.\n- `{"type": "int", "min"?: a, "max"?: b}` → `expected int` (booleans are **not** ints); then `below min a` and/or `above max b`.\n- `{"type": "bool"}` → `expected bool`.\n- `{"type": "list", "items": schema, "max_items"?: n}` → `expected list`; then `too many items (max n)`; then validate every element regardless.\n- `{"type": "obj", "fields": {name: schema}, "required"?: [names]}` → `expected obj`; then for each required name in the given order that is absent report `missing`; then validate every present field in `fields` order. Unknown keys are ignored.\n\nWhen the type check fails, report it and do not descend further into that value.',
    functionName: 'validate',
    functionSignature: 'def validate(schema: dict, value) -> list[str]:',
    buggyCode: "def validate(schema: dict, value) -> list[str]:\n    # TODO: recursive walk carrying the path\n    return []\n",
    solution: `def validate(schema: dict, value) -> list[str]:
    errors = []

    def walk(s, v, path):
        t = s['type']
        if t == 'str':
            if not isinstance(v, str):
                errors.append(path + ': expected str')
                return
            if 'min_len' in s and len(v) < s['min_len']:
                errors.append('%s: too short (min %d)' % (path, s['min_len']))
        elif t == 'int':
            if isinstance(v, bool) or not isinstance(v, int):
                errors.append(path + ': expected int')
                return
            if 'min' in s and v < s['min']:
                errors.append('%s: below min %d' % (path, s['min']))
            if 'max' in s and v > s['max']:
                errors.append('%s: above max %d' % (path, s['max']))
        elif t == 'bool':
            if not isinstance(v, bool):
                errors.append(path + ': expected bool')
        elif t == 'list':
            if not isinstance(v, list):
                errors.append(path + ': expected list')
                return
            if 'max_items' in s and len(v) > s['max_items']:
                errors.append('%s: too many items (max %d)' % (path, s['max_items']))
            for i, item in enumerate(v):
                walk(s['items'], item, '%s[%d]' % (path, i))
        elif t == 'obj':
            if not isinstance(v, dict):
                errors.append(path + ': expected obj')
                return
            for name in s.get('required', []):
                if name not in v:
                    errors.append('%s.%s: missing' % (path, name))
            for name, sub in s['fields'].items():
                if name in v:
                    walk(sub, v[name], path + '.' + name)

    walk(schema, value, '$')
    return errors
`,
    hint: 'Write one recursive `walk(schema, value, path)` that appends to a shared list; remember `isinstance(True, int)` is True in Python.',
    explanation:
      'Good validators return every problem with a pointer to where it is, so a client can fix a payload in one round trip instead of ten. The recursion carries the path as a string and each node decides whether to descend — a type mismatch stops there, because reporting "missing field" inside a value that is not even an object is noise. The bool/int distinction is a Python-specific trap that lets `true` slip into an age field.',
    examples: [
      {
        input: [
          {
            type: 'obj',
            fields: { name: { type: 'str', min_len: 2 }, age: { type: 'int', min: 0, max: 120 }, tags: { type: 'list', items: { type: 'str' }, max_items: 2 } },
            required: ['name', 'age'],
          },
          { name: 'Al', age: 30, tags: ['x'] },
        ],
        expected: [],
      },
      {
        input: [
          {
            type: 'obj',
            fields: { name: { type: 'str', min_len: 2 }, age: { type: 'int', min: 0, max: 120 }, tags: { type: 'list', items: { type: 'str' }, max_items: 2 } },
            required: ['name', 'age'],
          },
          { name: 'A', age: -5 },
        ],
        expected: ['$.name: too short (min 2)', '$.age: below min 0'],
      },
    ],
    hiddenTests: [
      {
        input: [
          {
            type: 'obj',
            fields: { name: { type: 'str', min_len: 2 }, age: { type: 'int', min: 0, max: 120 }, tags: { type: 'list', items: { type: 'str' }, max_items: 2 } },
            required: ['name', 'age'],
          },
          { age: '30', tags: 'x' },
        ],
        expected: ['$.name: missing', '$.age: expected int', '$.tags: expected list'],
      },
      {
        input: [
          {
            type: 'obj',
            fields: { name: { type: 'str', min_len: 2 }, age: { type: 'int', min: 0, max: 120 }, tags: { type: 'list', items: { type: 'str' }, max_items: 2 } },
            required: ['name', 'age'],
          },
          { name: 'Bob', age: true, tags: ['a', 'b', 3] },
        ],
        expected: ['$.age: expected int', '$.tags: too many items (max 2)', '$.tags[2]: expected str'],
      },
      {
        input: [{ type: 'obj', fields: { name: { type: 'str' } }, required: ['name'] }, []],
        expected: ['$: expected obj'],
      },
      {
        input: [{ type: 'list', items: { type: 'obj', fields: { ok: { type: 'bool' } }, required: ['ok'] } }, [{ ok: 1 }, {}]],
        expected: ['$[0].ok: expected bool', '$[1].ok: missing'],
      },
      {
        input: [{ type: 'obj', fields: { n: { type: 'int', min: 1, max: 5 } } }, { n: 200 }],
        expected: ['$.n: above max 5'],
      },
    ],
  },
  {
    id: 'py-build-release-tag-order',
    number: 38,
    language: 'python',
    kind: 'build',
    title: 'Which Firmware Is Newer',
    difficulty: 'Hard',
    topic: 'Config & Validation',
    statement:
      'Implement `compare_tags(a, b)` that orders firmware release tags and returns `-1`, `0` or `1` (a < b, a == b, a > b).\n\nA tag is `[v]MAJOR[.MINOR[.PATCH]][-PRERELEASE][+BUILD]`:\n- An optional leading `v` is ignored. Missing minor/patch count as 0, so `v1.2` equals `1.2.0`.\n- Core parts compare numerically: `1.10.0` > `1.2.0`.\n- Anything after `+` is build metadata and is ignored for ordering.\n- With equal cores, a tag **with** a pre-release is lower than one without (`2.0.0-beta.2` < `2.0.0`).\n- Two pre-releases compare identifier by identifier (split on `.`): if both are all-digit, compare as integers; if only one is all-digit, the numeric one is lower; otherwise compare as plain strings. If all compared identifiers are equal, the shorter list is lower.',
    functionName: 'compare_tags',
    functionSignature: 'def compare_tags(a: str, b: str) -> int:',
    buggyCode: "def compare_tags(a: str, b: str) -> int:\n    # TODO: parse, compare core, then pre-release rules\n    return 0\n",
    solution: `def compare_tags(a: str, b: str) -> int:
    def parse(tag):
        tag = tag.split('+', 1)[0]
        if tag.startswith('v'):
            tag = tag[1:]
        core, _, pre = tag.partition('-')
        nums = [int(x) for x in core.split('.')]
        while len(nums) < 3:
            nums.append(0)
        pre_ids = pre.split('.') if pre else []
        return nums, pre_ids

    def cmp(x, y):
        return (x > y) - (x < y)

    def cmp_ids(p, q):
        for x, y in zip(p, q):
            xd, yd = x.isdigit(), y.isdigit()
            if xd and yd:
                c = cmp(int(x), int(y))
            elif xd != yd:
                c = -1 if xd else 1
            else:
                c = cmp(x, y)
            if c:
                return c
        return cmp(len(p), len(q))

    ca, pa = parse(a)
    cb, pb = parse(b)
    c = cmp(ca, cb)
    if c:
        return c
    if not pa and not pb:
        return 0
    if not pa:
        return 1
    if not pb:
        return -1
    return cmp_ids(pa, pb)
`,
    hint: 'Strip build metadata first, pad the core to three ints, and treat "no pre-release" as a special case before comparing identifier lists.',
    explanation:
      'Version ordering decides which firmware a fleet installs, and string comparison gets it wrong the moment a component reaches 10. Parsing to integer tuples handles the core; the pre-release rules are where hand-rolled comparers fail — `alpha.10` must beat `alpha.9`, a numeric identifier loses to a word, and a bare `alpha` loses to `alpha.1`. Ignoring build metadata means two builds of the same release are treated as equal.',
    examples: [
      { input: ['1.2.0', '1.10.0'], expected: -1 },
      { input: ['2.0.0-beta.2', '2.0.0'], expected: -1 },
    ],
    hiddenTests: [
      { input: ['v1.2', '1.2.0+build.7'], expected: 0 },
      { input: ['1.0.0-alpha.10', '1.0.0-alpha.9'], expected: 1 },
      { input: ['1.0.0-alpha', '1.0.0-alpha.1'], expected: -1 },
      { input: ['1.0.0-1', '1.0.0-a'], expected: -1 },
      { input: ['3.1.4', '3.1.3-rc.1'], expected: 1 },
      { input: ['1.0.0-rc.1', '1.0.0-beta.9'], expected: 1 },
    ],
  },
  {
    id: 'py-build-env-coercion',
    number: 39,
    language: 'python',
    kind: 'build',
    title: 'Typed Settings From the Environment',
    difficulty: 'Medium',
    topic: 'Config & Validation',
    statement:
      'Implement `load_env(env, spec)` that turns raw environment strings into typed settings. `env` is a dict of variable name → string. `spec` maps each setting name to `{"type": "int" | "bool" | "list" | "str", "default"?: any, "required"?: bool}`. Return `{"values": {...}, "errors": [...]}`, processing settings in `spec` order.\n\n- A variable is *missing* only when its name is absent from `env` (an empty string is a value). Missing + `required` → error `"NAME is required"`. Missing + `default` → the default. Missing with neither → the key is left out of `values`.\n- `int`: strip whitespace; accept an optional sign followed by digits only, else error `"NAME must be an integer"`.\n- `bool`: case-insensitive `1/true/yes/on` → True, `0/false/no/off` → False, anything else → error `"NAME must be a boolean"`.\n- `list`: split on commas, strip each piece, drop empty pieces (so `""` → `[]`).\n- `str`: the raw string.\n\nSettings that error are absent from `values`.',
    functionName: 'load_env',
    functionSignature: 'def load_env(env: dict, spec: dict) -> dict:',
    buggyCode: "def load_env(env: dict, spec: dict) -> dict:\n    # TODO\n    return {'values': {}, 'errors': []}\n",
    solution: `import re

TRUE_WORDS = {'1', 'true', 'yes', 'on'}
FALSE_WORDS = {'0', 'false', 'no', 'off'}

def load_env(env: dict, spec: dict) -> dict:
    values = {}
    errors = []
    for name, rule in spec.items():
        if name not in env:
            if rule.get('required'):
                errors.append(name + ' is required')
            elif 'default' in rule:
                values[name] = rule['default']
            continue
        raw = env[name]
        kind = rule['type']
        if kind == 'int':
            s = raw.strip()
            if re.fullmatch(r'[+-]?\\d+', s):
                values[name] = int(s)
            else:
                errors.append(name + ' must be an integer')
        elif kind == 'bool':
            s = raw.strip().lower()
            if s in TRUE_WORDS:
                values[name] = True
            elif s in FALSE_WORDS:
                values[name] = False
            else:
                errors.append(name + ' must be a boolean')
        elif kind == 'list':
            values[name] = [p.strip() for p in raw.split(',') if p.strip()]
        else:
            values[name] = raw
    return {'values': values, 'errors': errors}
`,
    hint: 'Handle "missing" before type coercion, and remember `bool("false")` is True — you need an explicit word table.',
    explanation:
      'Environment variables are always strings, and the two classic production bugs are `bool("false")` evaluating truthy and `int()` accepting something surprising. A single loader that coerces by declared type, distinguishes "unset" from "empty", and collects every error at once lets a service refuse to boot with a complete, readable list instead of crashing on the first bad value at 3 a.m.',
    examples: [
      {
        input: [
          { PORT: '8080', DEBUG: 'yes', ORIGINS: 'a.com, b.com,,' },
          { PORT: { type: 'int' }, DEBUG: { type: 'bool', default: false }, ORIGINS: { type: 'list', default: [] } },
        ],
        expected: { values: { PORT: 8080, DEBUG: true, ORIGINS: ['a.com', 'b.com'] }, errors: [] },
      },
      {
        input: [{ PORT: 'eighty' }, { PORT: { type: 'int' }, SECRET: { type: 'str', required: true } }],
        expected: { values: {}, errors: ['PORT must be an integer', 'SECRET is required'] },
      },
    ],
    hiddenTests: [
      {
        input: [{}, { DEBUG: { type: 'bool', default: false }, WORKERS: { type: 'int', default: 4 }, NAME: { type: 'str' } }],
        expected: { values: { DEBUG: false, WORKERS: 4 }, errors: [] },
      },
      {
        input: [{ DEBUG: 'maybe', WORKERS: ' -3 ' }, { DEBUG: { type: 'bool' }, WORKERS: { type: 'int' } }],
        expected: { values: { WORKERS: -3 }, errors: ['DEBUG must be a boolean'] },
      },
      {
        input: [{ TAGS: '', ON: 'OFF' }, { TAGS: { type: 'list' }, ON: { type: 'bool' } }],
        expected: { values: { TAGS: [], ON: false }, errors: [] },
      },
      {
        input: [{ N: '1.5', M: '' }, { N: { type: 'int' }, M: { type: 'int', default: 9 } }],
        expected: { values: {}, errors: ['N must be an integer', 'M must be an integer'] },
      },
    ],
  },
  {
    id: 'py-build-rollout-buckets',
    number: 40,
    language: 'python',
    kind: 'build',
    title: 'Gradual Rollout Gate',
    difficulty: 'Easy',
    topic: 'Config & Validation',
    statement:
      'Implement `rollout(flag, users)` that decides which users see a new map renderer. Each user already carries a stable hash bucket (0–99) computed elsewhere, so this function must be pure.\n\n`flag` is `{"percent": int, "allow": [ids], "deny": [ids], "regions"?: [codes]}`; each user is `{"id", "bucket", "region"}`. Evaluate in this order and stop at the first rule that applies:\n1. id in `deny` → False\n2. id in `allow` → True\n3. `regions` present and user\'s region not in it → False\n4. `bucket < percent` → True, else False\n\nReturn a dict of `id → bool`.',
    functionName: 'rollout',
    functionSignature: 'def rollout(flag: dict, users: list[dict]) -> dict:',
    buggyCode: "def rollout(flag: dict, users: list[dict]) -> dict:\n    # TODO\n    return {}\n",
    solution: `def rollout(flag: dict, users: list[dict]) -> dict:
    deny = set(flag.get('deny', []))
    allow = set(flag.get('allow', []))
    regions = flag.get('regions')
    out = {}
    for u in users:
        uid = u['id']
        if uid in deny:
            out[uid] = False
        elif uid in allow:
            out[uid] = True
        elif regions is not None and u['region'] not in regions:
            out[uid] = False
        else:
            out[uid] = u['bucket'] < flag['percent']
    return out
`,
    hint: 'Precedence is the whole problem: deny beats allow, allow beats region, and the percentage is only consulted last.',
    explanation:
      'Feature flags gate risk, so the evaluation order must be explicit: a kill-switch deny list overrides everything, an allow list lets QA in regardless of region or percentage, and only then does the deterministic bucket decide. Taking the bucket as input rather than hashing inside keeps the function pure and testable, and guarantees the same user gets the same answer on every request.',
    examples: [
      {
        input: [
          { percent: 50, allow: ['vip'], deny: [] },
          [
            { id: 'u1', bucket: 10, region: 'us' },
            { id: 'u2', bucket: 50, region: 'us' },
            { id: 'vip', bucket: 99, region: 'eu' },
          ],
        ],
        expected: { u1: true, u2: false, vip: true },
      },
      { input: [{ percent: 100, allow: ['u1'], deny: ['u1'] }, [{ id: 'u1', bucket: 0, region: 'us' }]], expected: { u1: false } },
    ],
    hiddenTests: [
      {
        input: [
          { percent: 30, allow: [], deny: [], regions: ['eu'] },
          [
            { id: 'a', bucket: 10, region: 'us' },
            { id: 'b', bucket: 10, region: 'eu' },
            { id: 'c', bucket: 30, region: 'eu' },
          ],
        ],
        expected: { a: false, b: true, c: false },
      },
      {
        input: [
          { percent: 0, allow: ['x'], deny: [], regions: ['us'] },
          [
            { id: 'x', bucket: 0, region: 'eu' },
            { id: 'y', bucket: 0, region: 'us' },
          ],
        ],
        expected: { x: true, y: false },
      },
      { input: [{ percent: 100, allow: [], deny: [] }, []], expected: {} },
    ],
  },

  // ------------------------------------------------------------ Permissions & Tenancy
  {
    id: 'py-build-role-closure',
    number: 41,
    language: 'python',
    kind: 'build',
    title: 'Roles That Inherit Roles',
    difficulty: 'Medium',
    topic: 'Permissions & Tenancy',
    statement:
      'Implement `effective_grants(roles, assigned)` for a print-shop admin panel. `roles` maps a role name to `{"inherits": [role names], "grants": [permission strings]}`. A role has its own grants plus, transitively, everything its parents grant. `assigned` is the list of roles given to a user.\n\nReturn the sorted list of distinct permissions the user effectively holds. Role names that do not exist in `roles` (whether assigned or inherited) contribute nothing. Inheritance graphs may contain cycles — do not loop forever.',
    functionName: 'effective_grants',
    functionSignature: 'def effective_grants(roles: dict, assigned: list[str]) -> list[str]:',
    buggyCode: "def effective_grants(roles: dict, assigned: list[str]) -> list[str]:\n    # TODO: DFS with a visited set\n    return []\n",
    solution: `def effective_grants(roles: dict, assigned: list[str]) -> list[str]:
    seen = set()
    perms = set()
    stack = list(assigned)
    while stack:
        name = stack.pop()
        if name in seen or name not in roles:
            continue
        seen.add(name)
        perms.update(roles[name].get('grants', []))
        stack.extend(roles[name].get('inherits', []))
    return sorted(perms)
`,
    hint: 'Treat roles as a graph and do a plain DFS/BFS from every assigned role, marking roles as visited before you expand them.',
    explanation:
      'Role hierarchies are directed graphs, and the moment two admins can edit them a cycle will appear — a recursive resolver without a visited set then hangs an authorization check, which takes the whole API down. Collecting into a set and returning it sorted gives callers a canonical answer they can cache or diff. Silently skipping unknown roles keeps a typo from raising inside the hot path.',
    examples: [
      {
        input: [
          {
            viewer: { inherits: [], grants: ['read'] },
            editor: { inherits: ['viewer'], grants: ['write'] },
            admin: { inherits: ['editor'], grants: ['delete'] },
          },
          ['admin'],
        ],
        expected: ['delete', 'read', 'write'],
      },
      {
        input: [
          {
            viewer: { inherits: [], grants: ['read'] },
            editor: { inherits: ['viewer'], grants: ['write'] },
          },
          ['viewer', 'ghost'],
        ],
        expected: ['read'],
      },
    ],
    hiddenTests: [
      { input: [{ a: { inherits: ['b'], grants: ['x'] }, b: { inherits: ['a'], grants: ['y'] } }, ['a']], expected: ['x', 'y'] },
      {
        input: [{ a: { inherits: ['b', 'c'], grants: [] }, b: { inherits: [], grants: ['p'] }, c: { inherits: ['b'], grants: ['q', 'p'] } }, ['a']],
        expected: ['p', 'q'],
      },
      { input: [{}, ['a']], expected: [] },
      {
        input: [{ viewer: { inherits: [], grants: ['read'] }, editor: { inherits: ['viewer'], grants: ['write'] } }, ['viewer', 'editor']],
        expected: ['read', 'write'],
      },
      { input: [{ a: { inherits: ['missing'], grants: ['z'] } }, ['a', 'a']], expected: ['z'] },
    ],
  },
  {
    id: 'py-build-doc-access-check',
    number: 42,
    language: 'python',
    kind: 'build',
    title: 'Who May Touch This Recipe',
    difficulty: 'Easy',
    topic: 'Permissions & Tenancy',
    statement:
      'Implement `may(user, doc, action)` for a shared recipe book. `user` is `{"id", "team", "roles": [...]}`, `doc` is `{"owner", "team", "visibility": "private"|"team"|"public", "deleted": bool}`, and `action` is `"read"`, `"edit"` or `"delete"`. Return a bool, applying these rules in order:\n\n1. A user with `"admin"` in `roles` may do anything, even to deleted documents.\n2. Otherwise a deleted document allows nothing.\n3. The owner may do anything.\n4. `delete` is only for owners/admins → False.\n5. `edit`: allowed when the user is on the document\'s team **and** visibility is not `private`.\n6. `read`: allowed when visibility is `public`, or visibility is `team` and the user is on the document\'s team.\n7. Anything else → False.',
    functionName: 'may',
    functionSignature: 'def may(user: dict, doc: dict, action: str) -> bool:',
    buggyCode: "def may(user: dict, doc: dict, action: str) -> bool:\n    # TODO\n    return False\n",
    solution: `def may(user: dict, doc: dict, action: str) -> bool:
    if 'admin' in user.get('roles', []):
        return True
    if doc.get('deleted'):
        return False
    if user['id'] == doc['owner']:
        return True
    same_team = user['team'] == doc['team']
    vis = doc['visibility']
    if action == 'edit':
        return same_team and vis != 'private'
    if action == 'read':
        return vis == 'public' or (vis == 'team' and same_team)
    return False
`,
    hint: 'Write the rules top to bottom as early returns — the order in which they short-circuit is the specification.',
    explanation:
      'Authorization checks are best written as an ordered list of early returns so the precedence (admin beats deleted beats owner) is visible in the code, not hidden in nested conditions. Centralising this in one function means every endpoint asks the same question the same way, which is how you avoid the "delete endpoint forgot to check visibility" class of incident.',
    examples: [
      {
        input: [{ id: 'u1', team: 't1', roles: [] }, { owner: 'u2', team: 't1', visibility: 'team', deleted: false }, 'edit'],
        expected: true,
      },
      {
        input: [{ id: 'u1', team: 't1', roles: [] }, { owner: 'u2', team: 't1', visibility: 'private', deleted: false }, 'read'],
        expected: false,
      },
    ],
    hiddenTests: [
      {
        input: [{ id: 'u9', team: 't2', roles: ['admin'] }, { owner: 'u2', team: 't1', visibility: 'private', deleted: true }, 'delete'],
        expected: true,
      },
      {
        input: [{ id: 'u2', team: 't1', roles: [] }, { owner: 'u2', team: 't1', visibility: 'public', deleted: true }, 'read'],
        expected: false,
      },
      {
        input: [{ id: 'u3', team: 't2', roles: [] }, { owner: 'u2', team: 't1', visibility: 'public', deleted: false }, 'read'],
        expected: true,
      },
      {
        input: [{ id: 'u3', team: 't2', roles: [] }, { owner: 'u2', team: 't1', visibility: 'public', deleted: false }, 'edit'],
        expected: false,
      },
      {
        input: [{ id: 'u1', team: 't1', roles: [] }, { owner: 'u2', team: 't1', visibility: 'team', deleted: false }, 'delete'],
        expected: false,
      },
    ],
  },
  {
    id: 'py-build-scope-wildcards',
    number: 43,
    language: 'python',
    kind: 'build',
    title: 'Token Scopes With Wildcards',
    difficulty: 'Medium',
    topic: 'Permissions & Tenancy',
    statement:
      'Implement `covers(granted, needed)` for an API-token check. Scopes are colon-separated segments such as `repo:main:read`. `needed` contains literal scopes an endpoint requires; `granted` contains the token\'s scopes, which may use wildcards:\n\n- `*` matches **exactly one** segment.\n- `**` may appear only as the last segment and matches **one or more** remaining segments.\n- Any other segment must match literally. Without `**`, the segment counts must be equal.\n\nReturn True when every needed scope is matched by at least one granted scope. An empty `needed` list is always covered.',
    functionName: 'covers',
    functionSignature: 'def covers(granted: list[str], needed: list[str]) -> bool:',
    buggyCode: "def covers(granted: list[str], needed: list[str]) -> bool:\n    # TODO: segment-wise matching\n    return False\n",
    solution: `def covers(granted: list[str], needed: list[str]) -> bool:
    def matches(pattern, scope):
        p = pattern.split(':')
        s = scope.split(':')
        for i, seg in enumerate(p):
            if seg == '**':
                return i == len(p) - 1 and len(s) > i
            if i >= len(s):
                return False
            if seg != '*' and seg != s[i]:
                return False
        return len(p) == len(s)

    patterns = [g for g in granted]
    return all(any(matches(g, n) for g in patterns) for n in needed)
`,
    hint: 'Compare segment lists index by index; `**` short-circuits with a length check, and a plain match must also verify both lists ended together.',
    explanation:
      'Scope matching is where OAuth-style tokens become useful or dangerous: `repo:*` must not silently cover `repo:main:read`, or one wildcard grants far more than intended. Segment-wise matching with a strict length check for `*` and an explicit "at least one more segment" rule for `**` keeps the semantics narrow and predictable. Every needed scope must be covered independently — matching is `all(any(...))`, never a single combined check.',
    examples: [
      { input: [['repo:*:read', 'billing:**'], ['repo:main:read', 'billing:invoices:pdf']], expected: true },
      { input: [['repo:*:read'], ['repo:main:write']], expected: false },
    ],
    hiddenTests: [
      { input: [['repo:*'], ['repo:main:read']], expected: false },
      { input: [['repo:**'], ['repo']], expected: false },
      { input: [['*:*:read', 'admin'], ['a:b:read', 'admin']], expected: true },
      { input: [[], []], expected: true },
      { input: [['repo:main:read'], ['repo:main:read', 'repo:dev:read']], expected: false },
      { input: [['repo:*:*'], ['repo:main:read', 'repo:dev:write']], expected: true },
    ],
  },
  {
    id: 'py-build-change-record',
    number: 44,
    language: 'python',
    kind: 'build',
    title: 'Change Record for a Settings Save',
    difficulty: 'Medium',
    topic: 'Permissions & Tenancy',
    statement:
      'Implement `change_record(before, after, secret_keys)` that produces the audit-log entry for a settings save. Flatten both nested dicts into dotted paths (`limits.cpu`); a nested dict contributes only its leaf paths (an empty dict contributes nothing). Non-dict values (numbers, strings, lists, booleans) are leaves compared as whole values with `==`.\n\nReturn a list of `{"path", "op", "from", "to"}` sorted by `path` where `op` is `added` (path only in `after`; `from` is None), `removed` (path only in `before`; `to` is None) or `changed` (both present, values differ). Equal leaves are omitted.\n\nIf a path\'s last segment is in `secret_keys`, replace each **present** value with `"***"` (None stays None) — but still compare the real values to decide whether it changed.',
    functionName: 'change_record',
    functionSignature: 'def change_record(before: dict, after: dict, secret_keys: list[str]) -> list[dict]:',
    buggyCode:
      "def change_record(before: dict, after: dict, secret_keys: list[str]) -> list[dict]:\n    # TODO: flatten, compare, redact\n    return []\n",
    solution: `def change_record(before: dict, after: dict, secret_keys: list[str]) -> list[dict]:
    def flatten(d, prefix=''):
        out = {}
        for k, v in d.items():
            path = prefix + k
            if isinstance(v, dict):
                out.update(flatten(v, path + '.'))
            else:
                out[path] = v
        return out

    secrets = set(secret_keys)
    old = flatten(before)
    new = flatten(after)

    def show(path, value, present):
        if not present:
            return None
        return '***' if path.split('.')[-1] in secrets else value

    entries = []
    for path in sorted(set(old) | set(new)):
        in_old, in_new = path in old, path in new
        if in_old and in_new:
            if old[path] == new[path]:
                continue
            op = 'changed'
        elif in_new:
            op = 'added'
        else:
            op = 'removed'
        entries.append({
            'path': path,
            'op': op,
            'from': show(path, old.get(path), in_old),
            'to': show(path, new.get(path), in_new),
        })
    return entries
`,
    hint: 'Flatten both sides into `path → leaf` dicts first; the diff is then a walk over the union of keys.',
    explanation:
      'Audit logs answer "who changed what" months later, so the record must be structured (path + op + old/new) rather than a blob, and it must never leak credentials — hence redaction happens at render time while comparison uses real values, so a rotated password still shows up as changed. Flattening to dotted paths turns a nested diff into a simple set problem and gives a stable sort order.',
    examples: [
      {
        input: [{ name: 'a', limits: { cpu: 1, mem: 2 } }, { name: 'a', limits: { cpu: 2, disk: 9 } }, []],
        expected: [
          { path: 'limits.cpu', op: 'changed', from: 1, to: 2 },
          { path: 'limits.disk', op: 'added', from: null, to: 9 },
          { path: 'limits.mem', op: 'removed', from: 2, to: null },
        ],
      },
      {
        input: [{ db: { password: 'old' } }, { db: { password: 'new' } }, ['password']],
        expected: [{ path: 'db.password', op: 'changed', from: '***', to: '***' }],
      },
    ],
    hiddenTests: [
      { input: [{ a: 1 }, { a: 1 }, []], expected: [] },
      {
        input: [{ a: { b: 1 } }, { a: 5 }, []],
        expected: [
          { path: 'a', op: 'added', from: null, to: 5 },
          { path: 'a.b', op: 'removed', from: 1, to: null },
        ],
      },
      {
        input: [{ tags: ['x'], token: 't1' }, { tags: ['x', 'y'] }, ['token']],
        expected: [
          { path: 'tags', op: 'changed', from: ['x'], to: ['x', 'y'] },
          { path: 'token', op: 'removed', from: '***', to: null },
        ],
      },
      { input: [{}, { z: { y: { x: 0 } } }, []], expected: [{ path: 'z.y.x', op: 'added', from: null, to: 0 }] },
      { input: [{ db: { password: 'same' } }, { db: { password: 'same' } }, ['password']], expected: [] },
    ],
  },
  {
    id: 'py-build-tenant-kv',
    number: 45,
    language: 'python',
    kind: 'build',
    title: 'Per-Tenant Key Store',
    difficulty: 'Easy',
    topic: 'Permissions & Tenancy',
    statement:
      'Implement `tenant_kv(ops)` — an in-memory key/value store for a multi-tenant SaaS where one tenant must never see another tenant\'s data. Process the operations in order and return a list containing one result for every operation that produces output:\n\n- `["set", tenant, key, value]` — store (overwrite) the value; produces **no** output.\n- `["get", tenant, key]` → the value, or `None` when that tenant has no such key.\n- `["del", tenant, key]` → True if the key existed for that tenant and was removed, else False. A key whose stored value is `None` still exists.\n- `["count", tenant]` → the number of keys that tenant currently has.\n\nTenant names and keys are arbitrary strings and may contain any character, including `:`.',
    functionName: 'tenant_kv',
    functionSignature: 'def tenant_kv(ops: list) -> list:',
    buggyCode: "def tenant_kv(ops: list) -> list:\n    # TODO\n    return []\n",
    solution: `def tenant_kv(ops: list) -> list:
    store = {}
    out = []
    for op in ops:
        kind, tenant = op[0], op[1]
        bucket = store.setdefault(tenant, {})
        if kind == 'set':
            bucket[op[2]] = op[3]
        elif kind == 'get':
            out.append(bucket.get(op[2]))
        elif kind == 'del':
            existed = op[2] in bucket
            if existed:
                del bucket[op[2]]
            out.append(existed)
        elif kind == 'count':
            out.append(len(bucket))
    return out
`,
    hint: 'Use a dict of dicts (tenant → its own dict) rather than gluing tenant and key into one string.',
    explanation:
      'Tenant isolation is the one invariant a SaaS backend cannot get wrong. The tempting shortcut — one flat dict keyed by `tenant + ":" + key` — breaks the moment a tenant name or key contains the separator, letting `("a", "b:c")` and `("a:b", "c")` collide. A dict of per-tenant dicts makes cross-tenant reads structurally impossible and makes `count` and future "wipe tenant" operations trivial.',
    examples: [
      { input: [[['set', 'acme', 'theme', 'dark'], ['get', 'acme', 'theme'], ['get', 'globex', 'theme']]], expected: ['dark', null] },
      {
        input: [[['set', 'a', 'k', 1], ['set', 'b', 'k', 2], ['count', 'a'], ['del', 'a', 'k'], ['del', 'a', 'k'], ['get', 'b', 'k']]],
        expected: [1, true, false, 2],
      },
    ],
    hiddenTests: [
      { input: [[['get', 'x', 'y'], ['count', 'x']]], expected: [null, 0] },
      { input: [[['set', 'a', 'k', 1], ['set', 'a', 'k', 2], ['count', 'a'], ['get', 'a', 'k']]], expected: [1, 2] },
      { input: [[['set', 'a', 'b:c', 'v'], ['get', 'a:b', 'c'], ['get', 'a', 'b:c']]], expected: [null, 'v'] },
      { input: [[['set', 'a', 'k', null], ['del', 'a', 'k'], ['count', 'a']]], expected: [true, 0] },
    ],
  },

  // ------------------------------------------------------------ Inventory & Scheduling
  {
    id: 'py-build-stock-holds',
    number: 46,
    language: 'python',
    kind: 'build',
    title: 'Warehouse Holds and Commits',
    difficulty: 'Hard',
    topic: 'Inventory & Scheduling',
    statement:
      'Implement `stock_holds(initial, ops)` for a ceramics warehouse. `initial` maps SKU → on-hand quantity. A *hold* reserves stock for a checkout without removing it yet; `available = on_hand - sum(active holds)`. Process ops in order and return one result per op:\n\n- `["hold", hold_id, sku, qty]` → `"unknown_sku"` if the SKU does not exist; `"duplicate"` if `hold_id` is currently active **or was previously committed**; `"insufficient"` if `qty > available`; otherwise `"ok"` and the hold becomes active.\n- `["release", hold_id]` → `"ok"` and the hold is dropped (its id may be reused later), or `"unknown"` if no active hold has that id.\n- `["commit", hold_id]` → `"ok"`: on-hand is reduced by the held qty and the hold is no longer active (but its id is remembered as committed); `"unknown"` if no active hold has that id.\n- `["available", sku]` → the available quantity as an int, or `None` for an unknown SKU.\n\nCheck the rules for `hold` in the order listed.',
    functionName: 'stock_holds',
    functionSignature: 'def stock_holds(initial: dict, ops: list) -> list:',
    buggyCode: "def stock_holds(initial: dict, ops: list) -> list:\n    # TODO: on_hand, active holds, committed ids\n    return []\n",
    solution: `def stock_holds(initial: dict, ops: list) -> list:
    on_hand = dict(initial)
    active = {}      # hold_id -> (sku, qty)
    committed = set()
    reserved = {sku: 0 for sku in on_hand}
    out = []
    for op in ops:
        kind = op[0]
        if kind == 'hold':
            hid, sku, qty = op[1], op[2], op[3]
            if sku not in on_hand:
                out.append('unknown_sku')
            elif hid in active or hid in committed:
                out.append('duplicate')
            elif qty > on_hand[sku] - reserved[sku]:
                out.append('insufficient')
            else:
                active[hid] = (sku, qty)
                reserved[sku] += qty
                out.append('ok')
        elif kind == 'release':
            hid = op[1]
            if hid not in active:
                out.append('unknown')
            else:
                sku, qty = active.pop(hid)
                reserved[sku] -= qty
                out.append('ok')
        elif kind == 'commit':
            hid = op[1]
            if hid not in active:
                out.append('unknown')
            else:
                sku, qty = active.pop(hid)
                reserved[sku] -= qty
                on_hand[sku] -= qty
                committed.add(hid)
                out.append('ok')
        elif kind == 'available':
            sku = op[1]
            out.append(on_hand[sku] - reserved[sku] if sku in on_hand else None)
    return out
`,
    hint: 'Keep three structures: on-hand per SKU, active holds by id, and a set of committed ids; availability is derived, never stored.',
    explanation:
      'Two-phase reservation (hold, then commit or release) is how checkouts avoid overselling: stock is protected while the customer pays, and released if they walk away. Deriving availability from on-hand minus active holds instead of mutating a single counter keeps the ledger consistent, and remembering committed ids blocks a replayed "hold" from double-charging inventory — the idempotency guarantee payment webhooks rely on.',
    examples: [
      {
        input: [
          { mug: 3 },
          [['hold', 'h1', 'mug', 2], ['available', 'mug'], ['hold', 'h2', 'mug', 2], ['release', 'h1'], ['hold', 'h2', 'mug', 2], ['commit', 'h2'], ['available', 'mug']],
        ],
        expected: ['ok', 1, 'insufficient', 'ok', 'ok', 'ok', 1],
      },
      {
        input: [{ pen: 1 }, [['hold', 'h1', 'pen', 1], ['hold', 'h1', 'pen', 1], ['commit', 'h1'], ['commit', 'h1'], ['release', 'h1'], ['available', 'pen']]],
        expected: ['ok', 'duplicate', 'ok', 'unknown', 'unknown', 0],
      },
    ],
    hiddenTests: [
      {
        input: [{ a: 5 }, [['hold', 'x', 'b', 1], ['available', 'b'], ['hold', 'x', 'a', 5], ['available', 'a'], ['hold', 'y', 'a', 1]]],
        expected: ['unknown_sku', null, 'ok', 0, 'insufficient'],
      },
      {
        input: [{ a: 2 }, [['hold', 'h1', 'a', 1], ['release', 'h1'], ['hold', 'h1', 'a', 2], ['commit', 'h1'], ['hold', 'h1', 'a', 1], ['available', 'a']]],
        expected: ['ok', 'ok', 'ok', 'ok', 'duplicate', 0],
      },
      { input: [{ a: 1 }, [['release', 'nope'], ['commit', 'nope'], ['available', 'a']]], expected: ['unknown', 'unknown', 1] },
      {
        input: [{ a: 4, b: 1 }, [['hold', 'h1', 'a', 3], ['hold', 'h2', 'b', 1], ['hold', 'h3', 'a', 2], ['commit', 'h1'], ['hold', 'h3', 'a', 1], ['available', 'a'], ['available', 'b']]],
        expected: ['ok', 'ok', 'insufficient', 'ok', 'ok', 0, 0],
      },
    ],
  },
  {
    id: 'py-build-room-bookings',
    number: 47,
    language: 'python',
    kind: 'build',
    title: 'Studio Room Bookings',
    difficulty: 'Medium',
    topic: 'Inventory & Scheduling',
    statement:
      'Implement `accept_bookings(requests)` for a rehearsal studio with several rooms. Each request is `[id, room, start, end]` with integer hours and a half-open interval `[start, end)`; requests arrive in list order and are handled first-come-first-served.\n\nAccept a request when `start < end` and it does not overlap any **already accepted** booking in the same room (touching intervals such as `[9,11)` and `[11,12)` do not overlap). Rejected requests never block later ones. Return the ids of accepted requests in arrival order.',
    functionName: 'accept_bookings',
    functionSignature: 'def accept_bookings(requests: list) -> list[str]:',
    buggyCode: "def accept_bookings(requests: list) -> list[str]:\n    # TODO: per-room list of accepted intervals\n    return []\n",
    solution: `def accept_bookings(requests: list) -> list[str]:
    taken = {}
    accepted = []
    for rid, room, start, end in requests:
        if start >= end:
            continue
        slots = taken.setdefault(room, [])
        if any(start < e and s < end for s, e in slots):
            continue
        slots.append((start, end))
        accepted.append(rid)
    return accepted
`,
    hint: 'Two half-open intervals overlap exactly when `a.start < b.end and b.start < a.end`.',
    explanation:
      'Overlap detection on half-open intervals is a two-comparison formula, and getting the strictness right is what lets back-to-back bookings coexist. Keeping accepted intervals per room (a dict of lists) means a busy room never blocks a free one. First-come-first-served with rejected requests discarded models what a real booking endpoint does: conflicts are answered immediately and never queued.',
    examples: [
      { input: [[['a', 'r1', 9, 11], ['b', 'r1', 10, 12], ['c', 'r1', 11, 12], ['d', 'r2', 10, 12]]], expected: ['a', 'c', 'd'] },
      { input: [[['a', 'r1', 9, 9], ['b', 'r1', 9, 10]]], expected: ['b'] },
    ],
    hiddenTests: [
      { input: [[['a', 'r1', 13, 15], ['b', 'r1', 9, 13], ['c', 'r1', 14, 16], ['d', 'r1', 15, 17]]], expected: ['a', 'b', 'd'] },
      { input: [[]], expected: [] },
      { input: [[['a', 'r1', 0, 100], ['b', 'r1', 50, 60], ['c', 'r2', 50, 60], ['d', 'r2', 55, 65]]], expected: ['a', 'c'] },
      { input: [[['a', 'r1', 10, 12], ['b', 'r1', 8, 10], ['c', 'r1', 12, 14], ['d', 'r1', 9, 13]]], expected: ['a', 'b', 'c'] },
    ],
  },
  {
    id: 'py-build-slot-capacity',
    number: 48,
    language: 'python',
    kind: 'build',
    title: 'Loading Dock Slots',
    difficulty: 'Medium',
    topic: 'Inventory & Scheduling',
    statement:
      'Implement `admit_deliveries(slot_len, capacity, deliveries)` for a loading dock that plans in fixed slots. Slot `k` covers minutes `[k*slot_len, (k+1)*slot_len)` and can host at most `capacity` deliveries at once. Each delivery is `[start, duration]` (minutes from opening, `duration >= 1`) and occupies every slot that its interval `[start, start+duration)` intersects.\n\nProcess deliveries in order: admit one only if every slot it touches currently has fewer than `capacity` admitted deliveries; an admitted delivery then counts against all those slots. Return a list of booleans, one per delivery.',
    functionName: 'admit_deliveries',
    functionSignature: 'def admit_deliveries(slot_len: int, capacity: int, deliveries: list) -> list[bool]:',
    buggyCode:
      "def admit_deliveries(slot_len: int, capacity: int, deliveries: list) -> list[bool]:\n    # TODO: first slot = start // slot_len, last slot = (start + duration - 1) // slot_len\n    return []\n",
    solution: `def admit_deliveries(slot_len: int, capacity: int, deliveries: list) -> list[bool]:
    load = {}
    out = []
    for start, duration in deliveries:
        first = start // slot_len
        last = (start + duration - 1) // slot_len
        slots = range(first, last + 1)
        if all(load.get(k, 0) < capacity for k in slots):
            for k in slots:
                load[k] = load.get(k, 0) + 1
            out.append(True)
        else:
            out.append(False)
    return out
`,
    hint: 'The last touched slot is `(start + duration - 1) // slot_len`, not `(start + duration) // slot_len` — an interval ending exactly on a boundary does not touch the next slot.',
    explanation:
      'Capacity planning by slot is how docks, clinics and GPU clusters admit work: convert a continuous interval into the discrete buckets it touches, check every bucket, then commit to all of them atomically. The off-by-one at the end boundary is the classic mistake — it makes a 60-minute delivery starting at 0 occupy two hourly slots. A sparse dict of slot loads avoids pre-allocating a whole day.',
    examples: [
      { input: [60, 1, [[0, 30], [30, 30], [45, 30]]], expected: [true, false, false] },
      { input: [60, 2, [[0, 120], [60, 60], [60, 1]]], expected: [true, true, false] },
    ],
    hiddenTests: [
      { input: [30, 1, [[0, 60], [60, 30], [59, 2]]], expected: [true, true, false] },
      { input: [15, 3, [[0, 15], [0, 15], [0, 15], [0, 15], [15, 15]]], expected: [true, true, true, false, true] },
      { input: [60, 1, []], expected: [] },
      { input: [60, 1, [[0, 60], [60, 60], [119, 1], [120, 1]]], expected: [true, true, false, true] },
    ],
  },
  {
    id: 'py-build-backorder-fill',
    number: 49,
    language: 'python',
    kind: 'build',
    title: 'Filling Backorders by Priority',
    difficulty: 'Medium',
    topic: 'Inventory & Scheduling',
    statement:
      'Implement `fill_backorders(stock, orders)` for a seed supplier receiving a restock. `orders` is a list of `{"id", "qty", "priority", "partial"}`. Allocate the `stock` units by **descending** priority, breaking ties by the order\'s position in the list (earlier first).\n\nFor each order in that sequence: if `qty <= stock` fill it fully; otherwise, if `partial` is true and `stock > 0`, give it all remaining stock; otherwise allocate 0 and leave the stock untouched for the next order. Return `{"filled": {id: allocated_qty for every order}, "left": remaining_stock}`.',
    functionName: 'fill_backorders',
    functionSignature: 'def fill_backorders(stock: int, orders: list[dict]) -> dict:',
    buggyCode: "def fill_backorders(stock: int, orders: list[dict]) -> dict:\n    # TODO: stable sort by priority desc, then allocate\n    return {'filled': {}, 'left': stock}\n",
    solution: `def fill_backorders(stock: int, orders: list[dict]) -> dict:
    filled = {}
    queue = sorted(range(len(orders)), key=lambda i: (-orders[i]['priority'], i))
    for i in queue:
        o = orders[i]
        if o['qty'] <= stock:
            filled[o['id']] = o['qty']
            stock -= o['qty']
        elif o['partial'] and stock > 0:
            filled[o['id']] = stock
            stock = 0
        else:
            filled[o['id']] = 0
    return {'filled': filled, 'left': stock}
`,
    hint: 'Sort indices by `(-priority, index)` so ties stay in arrival order, then walk that sequence mutating a single stock counter.',
    explanation:
      'Backorder allocation is a greedy pass over a deterministically ordered queue; the ordering key must encode both priority and arrival so two runs on the same data allocate identically. Skipping an order that cannot be fully filled (when it refuses partials) instead of stopping lets smaller lower-priority orders still ship, which is what customers and warehouses actually expect.',
    examples: [
      {
        input: [
          10,
          [
            { id: 'a', qty: 4, priority: 1, partial: false },
            { id: 'b', qty: 8, priority: 5, partial: true },
          ],
        ],
        expected: { filled: { a: 0, b: 8 }, left: 2 },
      },
      {
        input: [
          5,
          [
            { id: 'a', qty: 3, priority: 1, partial: false },
            { id: 'b', qty: 3, priority: 1, partial: true },
          ],
        ],
        expected: { filled: { a: 3, b: 2 }, left: 0 },
      },
    ],
    hiddenTests: [
      { input: [0, [{ id: 'a', qty: 1, priority: 9, partial: true }]], expected: { filled: { a: 0 }, left: 0 } },
      {
        input: [
          7,
          [
            { id: 'x', qty: 5, priority: 2, partial: false },
            { id: 'y', qty: 5, priority: 3, partial: false },
            { id: 'z', qty: 2, priority: 1, partial: false },
          ],
        ],
        expected: { filled: { x: 0, y: 5, z: 2 }, left: 0 },
      },
      { input: [4, []], expected: { filled: {}, left: 4 } },
      {
        input: [
          6,
          [
            { id: 'p', qty: 4, priority: 1, partial: true },
            { id: 'q', qty: 4, priority: 1, partial: true },
            { id: 'r', qty: 1, priority: 0, partial: false },
          ],
        ],
        expected: { filled: { p: 4, q: 2, r: 0 }, left: 0 },
      },
    ],
  },
  {
    id: 'py-build-team-slot-finder',
    number: 50,
    language: 'python',
    kind: 'build',
    title: 'Earliest Slot for the Whole Crew',
    difficulty: 'Hard',
    topic: 'Inventory & Scheduling',
    statement:
      'Implement `earliest_slot(calendars, duration, window)` for a film crew\'s call-sheet tool. `calendars` is a list (one per person) of busy intervals `[start, end)` in minutes; each list may be unsorted and its intervals may overlap. `window` is `[open, close]`.\n\nReturn the smallest integer `start` such that `open <= start`, `start + duration <= close`, and no busy interval of any person intersects `[start, start + duration)`. Return `None` if no such start exists. Busy intervals may lie partly or wholly outside the window. A meeting may begin exactly when a busy interval ends.',
    functionName: 'earliest_slot',
    functionSignature: 'def earliest_slot(calendars: list, duration: int, window: list) -> int:',
    buggyCode: "def earliest_slot(calendars: list, duration: int, window: list):\n    # TODO: merge everyone's busy time, sweep for the first gap\n    return None\n",
    solution: `def earliest_slot(calendars: list, duration: int, window: list):
    busy = sorted(iv for cal in calendars for iv in cal)
    start = window[0]
    for s, e in busy:
        if s >= start + duration:
            break
        if e > start:
            start = e
    if start + duration <= window[1]:
        return start
    return None
`,
    hint: 'Pool every busy interval into one sorted list and sweep: keep a candidate start, and push it to the end of any busy block that intersects the candidate meeting.',
    explanation:
      'Finding common free time is the union of everyone\'s busy time followed by a gap search. Sorting all intervals together and sweeping with a single candidate start naturally merges overlaps and handles busy blocks that spill outside the window. The break condition — the next busy block starts at or after the candidate meeting would end — is what makes it return the *earliest* gap rather than the first gap after all busy time.',
    examples: [
      { input: [[[[540, 600], [720, 780]], [[600, 660]]], 60, [540, 1020]], expected: 660 },
      { input: [[[[540, 1020]]], 30, [540, 1020]], expected: null },
    ],
    hiddenTests: [
      { input: [[[]], 60, [600, 700]], expected: 600 },
      { input: [[[[0, 100], [50, 200]], [[250, 300]]], 50, [0, 300]], expected: 200 },
      { input: [[[[100, 200]], [[210, 220]]], 15, [150, 300]], expected: 220 },
      { input: [[[[0, 10]], [[20, 30]]], 10, [0, 30]], expected: 10 },
      { input: [[[[0, 10]]], 10, [0, 19]], expected: null },
      { input: [[[[30, 40]], [[0, 5]]], 20, [0, 60]], expected: 5 },
    ],
  },
];
