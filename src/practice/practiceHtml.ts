/**
 * Builds the HTML that hosts the CodeMirror 6 editor and the Pyodide runtime.
 * All assets are loaded from sibling files in the WebView's base directory —
 * no network access required.
 *
 * Bridge protocol:
 *   RN → WV: postMessage(JSON.stringify({ type: 'run', fnName, tests }))
 *           postMessage(JSON.stringify({ type: 'reset', code }))
 *   WV → RN: window.ReactNativeWebView.postMessage(JSON.stringify({
 *             type: 'ready' | 'result' | 'error', ...
 *           }))
 */

const escapeForTemplate = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

interface BuildArgs {
  starter: string;
  fnName: string;
}

export function buildPracticeHtml({ starter, fnName }: BuildArgs): string {
  const safeStarter = escapeForTemplate(starter);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<style>
  :root {
    color-scheme: dark;
  }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: #1e1e2e;
    color: #d4d4f0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-user-select: text;
    -webkit-tap-highlight-color: transparent;
  }
  #editor {
    height: 100%;
    width: 100%;
  }
  .cm-editor {
    height: 100% !important;
    background: #1e1e2e !important;
  }
  .cm-scroller {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    padding: 12px !important;
  }
  .cm-gutters {
    background: #1e1e2e !important;
    border-right: 1px solid #2a2a3e !important;
  }
  .cm-activeLine,
  .cm-activeLineGutter {
    background: #2a2a3e !important;
  }
  .cm-focused {
    outline: none !important;
  }
  .cm-cursor {
    border-left-color: #89e219 !important;
    border-left-width: 2px !important;
  }
  .cm-content {
    caret-color: #89e219 !important;
  }
  .cm-selectionBackground,
  ::selection {
    background: rgba(137, 226, 25, 0.25) !important;
  }
  #fallback {
    padding: 12px;
    color: #d4d4f0;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    white-space: pre-wrap;
  }
</style>
</head>
<body>
<div id="editor"></div>
<noscript><div id="fallback">JavaScript disabled.</div></noscript>

<script type="module">
const send = (obj) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }
};
const _consoleErr = console.error.bind(console);
console.error = (...args) => {
  _consoleErr(...args);
  try {
    send({ type: 'log', level: 'error', message: args.map(String).join(' ') });
  } catch (e) {}
};
window.addEventListener('error', (e) => {
  send({ type: 'log', level: 'error', message: 'window.error: ' + (e.message || String(e)) });
});
window.addEventListener('unhandledrejection', (e) => {
  send({ type: 'log', level: 'error', message: 'unhandledrejection: ' + ((e.reason && e.reason.message) || String(e.reason)) });
});

// Hard network lockdown for user code.
//
// 1) WKWebView blocks fetch() against file:// even when allowFileAccess* is set,
//    so we route file:// fetches through XHR and wrap them in a Response-like
//    object Pyodide is happy with. This is required by the runtime itself.
// 2) Every non-file:// fetch/XHR/WebSocket/EventSource is rejected. User Python
//    can therefore never reach the network through any standard channel.

const isFileUrl = (raw) => {
  let resolved = '';
  if (typeof raw === 'string') resolved = raw;
  else if (raw instanceof URL) resolved = raw.href;
  else if (raw && typeof raw.url === 'string') resolved = raw.url;
  else if (raw && typeof raw.toString === 'function') resolved = raw.toString();
  try {
    resolved = new URL(resolved, document.baseURI).href;
  } catch (e) {}
  return { ok: resolved.startsWith('file://'), resolved };
};

// Capture pristine constructors before we monkey-patch.
window.__rawXHR__ = window.XMLHttpRequest;

(function lockdownXHR() {
  const Original = window.XMLHttpRequest;
  const origOpen = Original.prototype.open;
  Original.prototype.open = function (method, url) {
    const { ok, resolved } = isFileUrl(url);
    if (!ok) {
      throw new Error('Network is disabled in the practice runtime: ' + resolved);
    }
    return origOpen.apply(this, arguments);
  };
})();

(function lockdownSockets() {
  const block = (name) => function () {
    throw new Error(name + ' is disabled in the practice runtime');
  };
  if (window.WebSocket) window.WebSocket = block('WebSocket');
  if (window.EventSource) window.EventSource = block('EventSource');
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon = function () {
      return false;
    };
  }
})();

(function patchFetchForFile() {
  send({ type: 'log', level: 'info', message: '[shim] installing fetch override' });
  window.fetch = function (input, init) {
    const { ok, resolved } = isFileUrl(input);
    send({ type: 'log', level: 'info', message: '[shim] fetch ' + resolved });
    if (!ok) {
      return Promise.reject(new Error('Network is disabled in the practice runtime: ' + resolved));
    }
    return new Promise((resolve, reject) => {
      const xhr = new (window.__rawXHR__ || XMLHttpRequest)();
      xhr.open('GET', resolved, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        send({ type: 'log', level: 'info', message: '[shim] xhr.onload status=' + xhr.status + ' bytes=' + (xhr.response && xhr.response.byteLength) });
        if (xhr.status !== 0 && xhr.status !== 200) {
          return reject(new Error('XHR ' + xhr.status + ' for ' + resolved));
        }
        const buf = xhr.response;
        const headers = new Headers();
        if (resolved.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
        else if (resolved.endsWith('.json')) headers.set('Content-Type', 'application/json');
        else if (resolved.endsWith('.zip')) headers.set('Content-Type', 'application/zip');
        resolve(new Response(buf, { status: 200, headers }));
      };
      xhr.onerror = (ev) => {
        send({ type: 'log', level: 'error', message: '[shim] xhr.onerror status=' + xhr.status + ' ' + resolved });
        reject(new Error('XHR network error for ' + resolved));
      };
      xhr.send();
    });
  };
})();

// --- CodeMirror 6 setup ------------------------------------------------------
let editorView;
let pyodide;
let pyodideReady = false;

const STARTER = \`${safeStarter}\`;

async function initEditor() {
  try {
    // Load CodeMirror via XHR + eval (IIFE). Real iOS devices reject file://
    // .js scripts as modules due to MIME-type, so we avoid dynamic import().
    await loadScriptAsText('./codemirror-bundle.js');
    const cm = window.__cm__;
    if (!cm || !cm.state) {
      throw new Error('CodeMirror bundle did not populate window.__cm__');
    }
    const { EditorState } = cm.state;
    const {
      EditorView,
      lineNumbers,
      drawSelection,
      highlightActiveLine,
      keymap,
    } = cm.view;
    const { defaultKeymap, indentWithTab, history, historyKeymap } = cm.commands;
    const { python } = cm.langPython;
    const { oneDark } = cm.themeOneDark;
    const {
      syntaxHighlighting,
      defaultHighlightStyle,
      bracketMatching,
      indentOnInput,
      indentUnit,
    } = cm.language;
    const { closeBrackets, closeBracketsKeymap } = cm.autocomplete;

    const startState = EditorState.create({
      doc: STARTER,
      extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        highlightActiveLine(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        indentUnit.of('    '),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        python(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,
        EditorView.theme({
          '&': { backgroundColor: '#1e1e2e' },
        }),
        EditorView.lineWrapping,
      ],
    });

    editorView = new EditorView({
      state: startState,
      parent: document.getElementById('editor'),
    });

    // Signal once Pyodide is also ready (waits below)
    waitForPyodide();
  } catch (err) {
    const fallback = document.createElement('div');
    fallback.id = 'fallback';
    fallback.textContent = 'Editor failed to load: ' + err.message;
    document.getElementById('editor').replaceWith(fallback);
    send({ type: 'error', error: 'Editor failed to load: ' + err.message });
  }
}

// --- Pyodide setup -----------------------------------------------------------
async function loadScriptAsText(url) {
  // Pulls a classic (non-module) script through our XHR fetch shim and evals
  // it at global scope. Works around WKWebView's silent failure when
  // \`await import(...)\` targets a non-ESM file.
  const resp = await fetch(url);
  const text = await resp.text();
  (0, eval)(text);
}

async function initPyodide() {
  // Pre-load pyodide.asm.js so the loader's internal \`await import(...)\`
  // is short-circuited (it skips when _createPyodideModule already exists).
  await loadScriptAsText('./pyodide.asm.js');
  send({ type: 'log', level: 'info', message: '[pyodide] asm.js loaded; _createPyodideModule=' + (typeof globalThis._createPyodideModule) });
  // Load the main loader script (defines window.loadPyodide).
  await loadScriptAsText('./pyodide.js');
  send({ type: 'log', level: 'info', message: '[pyodide] loadPyodide=' + (typeof window.loadPyodide) });
  pyodide = await window.loadPyodide({ indexURL: './' });
  pyodideReady = true;
}

async function waitForPyodide() {
  try {
    await initPyodide();
    send({ type: 'ready' });
  } catch (e) {
    send({ type: 'error', error: 'Python runtime failed to load: ' + e.message });
  }
}

// --- Grading harness ---------------------------------------------------------
const GRADER_PY = \`
import json, time, sys, io, traceback

def _canon_key(x):
    # Stable sort key so unordered comparison works on nested lists/dicts.
    return json.dumps(x, sort_keys=True, default=str)

def _normalize(x):
    # Convert tuples/sets to lists for parity with JSON expected values. Sets
    # are sorted canonically so a set-shaped answer grades deterministically.
    if isinstance(x, bool):
        return x
    if isinstance(x, _LISTY):
        # A deque or dict view grades as a plain list.
        x = list(x)
    if isinstance(x, (tuple, list)):
        return [_normalize(i) for i in x]
    if isinstance(x, (set, frozenset)):
        return sorted((_normalize(i) for i in x), key=_canon_key)
    if isinstance(x, dict):
        return {str(k): _normalize(v) for k, v in x.items()}
    return x

def _equal(a, b, compare='exact'):
    a = _normalize(a)
    b = _normalize(b)
    if isinstance(a, float) or isinstance(b, float):
        try:
            return abs(float(a) - float(b)) < 1e-6
        except Exception:
            return False
    if compare == 'unordered' and isinstance(a, list) and isinstance(b, list):
        # Top-level multiset equality: element order is ignored, but each
        # element (including nested lists) must still match exactly.
        if len(a) != len(b):
            return False
        return sorted(map(_canon_key, a)) == sorted(map(_canon_key, b))
    return a == b

# --- Tree / linked-list support ---------------------------------------------
# Problems that declare structs get real node objects instead of raw arrays:
# level-order arrays become TreeNode trees, value lists become ListNode chains,
# and returned nodes are flattened back so results compare against plain JSON.
import collections, heapq, bisect, math, itertools, functools, string, re, random, operator, typing

# Names available to every solution without an import, the way interview
# sites provide them. Anything the user defines or imports themselves wins.
_PRELOAD_NAMES = [
    (collections, 'deque defaultdict Counter OrderedDict namedtuple'),
    (heapq, 'heappush heappop heapify heappushpop heapreplace nlargest nsmallest'),
    (bisect, 'bisect_left bisect_right insort insort_left insort_right'),
    (math, 'inf gcd lcm ceil floor sqrt isqrt comb factorial log2'),
    (functools, 'lru_cache cache reduce cmp_to_key'),
    (itertools, 'accumulate permutations combinations combinations_with_replacement product zip_longest chain groupby pairwise'),
    (typing, 'Optional List Dict Tuple Set Any Deque DefaultDict Union Callable Iterable Iterator'),
]
_PRELOAD_MODULES = [collections, heapq, bisect, math, itertools, functools, string, re, random, operator, typing]

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return 'TreeNode(' + repr(self.val) + ')'

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return 'ListNode(' + repr(self.val) + ')'

_MAX_NODES = 100000

def _base_globals():
    glb = {'__name__': '__main__', 'TreeNode': TreeNode, 'ListNode': ListNode}
    for mod in _PRELOAD_MODULES:
        glb[mod.__name__] = mod
    for mod, names in _PRELOAD_NAMES:
        for name in names.split():
            glb[name] = getattr(mod, name)
    return glb

# Concrete collections that grade as plain lists. Lazy iterators (generators,
# map, zip...) are deliberately NOT included: returning one where a list is
# expected is a real bug, and some debug problems are about exactly that.
_LISTY = (collections.deque, type({}.keys()), type({}.values()), type({}.items()))

def _json_safe(x):
    # JSON has no inf / nan; show them as text instead of breaking the result.
    if isinstance(x, float) and (x != x or x in (math.inf, -math.inf)):
        return str(x)
    if isinstance(x, list):
        return [_json_safe(i) for i in x]
    if isinstance(x, dict):
        return {str(k): _json_safe(v) for k, v in x.items()}
    return x

def _build_tree(vals, cls):
    # Standard level-order encoding: children of a missing node are omitted.
    if not vals or vals[0] is None:
        return None
    root = cls(vals[0])
    queue = [root]
    qi = 0
    i = 1
    while i < len(vals) and qi < len(queue):
        node = queue[qi]
        qi += 1
        if vals[i] is not None:
            node.left = cls(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = cls(vals[i])
            queue.append(node.right)
        i += 1
    return root

def _build_list(vals, cls, pos=-1):
    nodes = [cls(v) for v in (vals or [])]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if nodes and isinstance(pos, int) and 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return (nodes[0] if nodes else None), nodes

def _dump_tree(root):
    out = []
    queue = [root]
    qi = 0
    while qi < len(queue):
        node = queue[qi]
        qi += 1
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        if len(out) > _MAX_NODES:
            raise ValueError('Returned tree is too large (does it contain a cycle?)')
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def _dump_list(head):
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        if len(out) > _MAX_NODES:
            raise ValueError('Returned list never ends (does it contain a cycle?)')
        node = node.next
    return out

def _prepare_args(inputs, structs, glb):
    kinds = (structs or {}).get('args') or []
    if not kinds:
        return list(inputs), None
    # Honour a TreeNode / ListNode class the user defined themselves.
    tree_cls = glb.get('TreeNode', TreeNode)
    list_cls = glb.get('ListNode', ListNode)
    args = []
    cycle_nodes = None
    i = 0
    while i < len(inputs):
        kind = kinds[i] if i < len(kinds) else None
        if kind == 'tree':
            args.append(_build_tree(inputs[i], tree_cls))
        elif kind == 'list':
            args.append(_build_list(inputs[i], list_cls)[0])
        elif kind == 'cycle':
            # Consumes two inputs: the values and the index the tail links to.
            pos = inputs[i + 1] if i + 1 < len(inputs) else -1
            head, cycle_nodes = _build_list(inputs[i], list_cls, pos)
            args.append(head)
            i += 1
        else:
            args.append(inputs[i])
        i += 1
    return args, cycle_nodes

def _export_value(value, structs, cycle_nodes):
    ret = (structs or {}).get('returns')
    if ret == 'tree':
        if value is None:
            return []
        if hasattr(value, 'left') and hasattr(value, 'right'):
            return _dump_tree(value)
    elif ret == 'list':
        if value is None:
            return []
        if hasattr(value, 'next') and hasattr(value, 'val'):
            return _dump_list(value)
    elif ret == 'node_index':
        if value is None:
            return -1
        for idx, node in enumerate(cycle_nodes or []):
            if node is value:
                return idx
    return value

def _run_one(fn, inputs, structs, glb):
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    try:
        args, cycle_nodes = _prepare_args(inputs, structs, glb)
        t0 = time.perf_counter()
        out = fn(*args)
        t1 = time.perf_counter()
        return {
            'ok': True,
            'value': _normalize(_export_value(out, structs, cycle_nodes)),
            'runtime_ms': round((t1 - t0) * 1000.0, 1),
            'stdout': buf.getvalue(),
        }
    except Exception:
        return {
            'ok': False,
            'error': traceback.format_exc(),
            'runtime_ms': 0,
            'stdout': buf.getvalue(),
        }
    finally:
        sys.stdout = old_stdout

def grade(user_code: str, fn_name: str, tests_json: str):
    tests = json.loads(tests_json)
    glb = _base_globals()
    try:
        exec(user_code, glb)
    except Exception:
        return json.dumps({
            'kind': 'compile_error',
            'error': traceback.format_exc(),
        })
    fn = glb.get(fn_name)
    if not callable(fn):
        return json.dumps({
            'kind': 'no_fn',
            'error': f"Function '{fn_name}' was not defined.",
        })
    out_cases = []
    total_ms = 0.0
    passed = 0
    for t in tests:
        res = _run_one(fn, t['input'], t.get('structs'), glb)
        runtime_ms = res['runtime_ms']
        total_ms += runtime_ms
        if not res['ok']:
            out_cases.append({
                'hidden': t.get('hidden', False),
                'pass': False,
                'runtime_ms': runtime_ms,
                'error': res['error'],
                'stdout': res.get('stdout', ''),
            })
            continue
        ok = _equal(res['value'], t['expected'], t.get('compare', 'exact'))
        if ok:
            passed += 1
        out_cases.append({
            'hidden': t.get('hidden', False),
            'pass': ok,
            'runtime_ms': runtime_ms,
            'expected': t['expected'],
            'actual': _json_safe(res['value']),
            'stdout': res.get('stdout', ''),
        })
    return json.dumps({
        'kind': 'graded',
        'passed': passed,
        'total': len(tests),
        'cases': out_cases,
        'total_runtime_ms': round(total_ms, 1),
    }, default=str)
\`;

let graderLoaded = false;
async function ensureGrader() {
  if (graderLoaded) return;
  await pyodide.runPythonAsync(GRADER_PY);
  graderLoaded = true;
}

async function runUserCode(fnName, tests) {
  if (!pyodideReady) {
    send({ type: 'error', error: 'Python runtime not ready yet' });
    return;
  }
  if (!editorView) {
    send({ type: 'error', error: 'Editor not ready yet' });
    return;
  }
  try {
    await ensureGrader();
    const userCode = editorView.state.doc.toString();
    const testsJson = JSON.stringify(tests);
    pyodide.globals.set('__user_code__', userCode);
    pyodide.globals.set('__fn_name__', fnName);
    pyodide.globals.set('__tests_json__', testsJson);
    const out = await pyodide.runPythonAsync(
      'grade(__user_code__, __fn_name__, __tests_json__)'
    );
    const parsed = JSON.parse(out);
    if (parsed.kind === 'compile_error' || parsed.kind === 'no_fn') {
      send({
        type: 'result',
        payload: {
          passed: 0,
          total: 0,
          cases: [{ hidden: false, pass: false, runtimeMs: 0, error: parsed.error }],
          totalRuntimeMs: 0,
        },
      });
      return;
    }
    send({
      type: 'result',
      payload: {
        passed: parsed.passed,
        total: parsed.total,
        cases: parsed.cases.map((c) => ({
          hidden: !!c.hidden,
          pass: !!c.pass,
          runtimeMs: c.runtime_ms,
          error: c.error,
          expected: c.expected,
          actual: c.actual,
          stdout: c.stdout || '',
        })),
        totalRuntimeMs: parsed.total_runtime_ms,
      },
    });
  } catch (e) {
    send({ type: 'error', error: 'Run failed: ' + (e && e.message ? e.message : String(e)) });
  }
}

function resetEditor(code) {
  if (!editorView) return;
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: code },
  });
}

// Insert text at the current selection. If \`cursorOffset\` is provided it is
// applied relative to the start of the inserted string so we can drop the
// caret inside paired delimiters like () [] {}.
function insertAtCursor(text, cursorOffset) {
  if (!editorView) return;
  const { from, to } = editorView.state.selection.main;
  const finalText = String(text == null ? '' : text);
  const offset =
    typeof cursorOffset === 'number' ? cursorOffset : finalText.length;
  editorView.dispatch({
    changes: { from, to, insert: finalText },
    selection: { anchor: from + offset },
  });
  editorView.focus();
}

// --- RN -> WV bridge ---------------------------------------------------------
function handleHostMessage(rawData) {
  let msg;
  try {
    msg = JSON.parse(rawData);
  } catch {
    return;
  }
  if (msg.type === 'run') {
    runUserCode(msg.fnName, msg.tests);
  } else if (msg.type === 'reset') {
    resetEditor(msg.code);
  } else if (msg.type === 'insert') {
    insertAtCursor(msg.text, msg.cursorOffset);
  }
}

// iOS WKWebView dispatches incoming postMessage on window or document.
window.addEventListener('message', (e) => handleHostMessage(e.data));
document.addEventListener('message', (e) => handleHostMessage(e.data));

initEditor();
</script>
</body>
</html>`;
}
