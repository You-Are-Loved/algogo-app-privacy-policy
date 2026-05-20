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

def _normalize(x):
    # Lists of lists with order-independent semantics aren't auto-detected;
    # we rely on equality. Convert tuples to lists for parity with JSON.
    if isinstance(x, tuple):
        return [_normalize(i) for i in x]
    if isinstance(x, list):
        return [_normalize(i) for i in x]
    if isinstance(x, dict):
        return {k: _normalize(v) for k, v in x.items()}
    return x

def _equal(a, b):
    a = _normalize(a)
    b = _normalize(b)
    if isinstance(a, float) or isinstance(b, float):
        try:
            return abs(float(a) - float(b)) < 1e-6
        except Exception:
            return False
    return a == b

def _run_one(fn, args):
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    try:
        t0 = time.perf_counter()
        out = fn(*args)
        t1 = time.perf_counter()
        return {
            'ok': True,
            'value': out,
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
    glb = {'__name__': '__main__'}
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
        res = _run_one(fn, t['input'])
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
        ok = _equal(res['value'], t['expected'])
        if ok:
            passed += 1
        out_cases.append({
            'hidden': t.get('hidden', False),
            'pass': ok,
            'runtime_ms': runtime_ms,
            'expected': t['expected'],
            'actual': res['value'],
            'stdout': res.get('stdout', ''),
        })
    return json.dumps({
        'kind': 'graded',
        'passed': passed,
        'total': len(tests),
        'cases': out_cases,
        'total_runtime_ms': round(total_ms, 1),
    })
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
