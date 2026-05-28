/**
 * Builds the HTML that hosts the CodeMirror 6 editor for bug-fix problems
 * in JavaScript and Java. Python bug-fix problems use the existing
 * buildPracticeHtml() since they need the Pyodide runtime.
 *
 * Two execution backends:
 *   - 'javascript' — user code is run natively inside the WebView via
 *                    new Function(). Tests post {type:'run', fnName, tests}
 *                    and the WV posts back {type:'result', payload}.
 *   - 'java'       — no execution. The WV posts the current editor text back
 *                    via {type:'submit', code} and the RN side runs the
 *                    rules grader (gradeJava.ts) and renders the result.
 *
 * Note: this host does NOT load Pyodide, so it shows up instantly. The
 * CodeMirror bundle still uses Python syntax highlighting — proper JS/Java
 * modes require rebuilding the CM bundle with @codemirror/lang-javascript
 * and @codemirror/lang-java added.
 */

const escapeForTemplate = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

export type BugFixHtmlLang = 'javascript' | 'java';

interface BuildArgs {
  starter: string;
  language: BugFixHtmlLang;
}

export function buildBugFixHtml({ starter, language }: BuildArgs): string {
  const safeStarter = escapeForTemplate(starter);
  const langJson = JSON.stringify(language);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<style>
  :root { color-scheme: dark; }
  html, body {
    margin: 0; padding: 0; height: 100%;
    background: #1e1e2e; color: #d4d4f0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-user-select: text;
    -webkit-tap-highlight-color: transparent;
  }
  #editor { height: 100%; width: 100%; }
  .cm-editor { height: 100% !important; background: #1e1e2e !important; }
  .cm-scroller {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace !important;
    font-size: 13px !important; line-height: 1.55 !important; padding: 12px !important;
  }
  .cm-gutters { background: #1e1e2e !important; border-right: 1px solid #2a2a3e !important; }
  .cm-activeLine, .cm-activeLineGutter { background: #2a2a3e !important; }
  .cm-focused { outline: none !important; }
  .cm-cursor { border-left-color: #89e219 !important; border-left-width: 2px !important; }
  .cm-content { caret-color: #89e219 !important; }
  .cm-selectionBackground, ::selection { background: rgba(137, 226, 25, 0.25) !important; }
  #fallback {
    padding: 12px; color: #d4d4f0;
    font-family: ui-monospace, monospace; font-size: 12px;
    white-space: pre-wrap;
  }
</style>
</head>
<body>
<div id="editor"></div>
<noscript><div id="fallback">JavaScript disabled.</div></noscript>

<script>
const send = (obj) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }
};
const _consoleErr = console.error.bind(console);
console.error = (...args) => {
  _consoleErr(...args);
  try { send({ type: 'log', level: 'error', message: args.map(String).join(' ') }); } catch (e) {}
};
window.addEventListener('error', (e) => {
  send({ type: 'log', level: 'error', message: 'window.error: ' + (e.message || String(e)) });
});
window.addEventListener('unhandledrejection', (e) => {
  send({ type: 'log', level: 'error', message: 'unhandledrejection: ' + ((e.reason && e.reason.message) || String(e.reason)) });
});

// --- Network lockdown -------------------------------------------------------
// User code can't reach the network. Same posture as the Python practice page.
const isFileUrl = (raw) => {
  let resolved = '';
  if (typeof raw === 'string') resolved = raw;
  else if (raw instanceof URL) resolved = raw.href;
  else if (raw && typeof raw.url === 'string') resolved = raw.url;
  else if (raw && typeof raw.toString === 'function') resolved = raw.toString();
  try { resolved = new URL(resolved, document.baseURI).href; } catch (e) {}
  return { ok: resolved.startsWith('file://'), resolved };
};

window.__rawXHR__ = window.XMLHttpRequest;
(function lockdownXHR() {
  const Original = window.XMLHttpRequest;
  const origOpen = Original.prototype.open;
  Original.prototype.open = function (method, url) {
    const { ok, resolved } = isFileUrl(url);
    if (!ok) throw new Error('Network is disabled in the practice runtime: ' + resolved);
    return origOpen.apply(this, arguments);
  };
})();
(function lockdownSockets() {
  const block = (name) => function () { throw new Error(name + ' is disabled in the practice runtime'); };
  if (window.WebSocket) window.WebSocket = block('WebSocket');
  if (window.EventSource) window.EventSource = block('EventSource');
  if (navigator && navigator.sendBeacon) { navigator.sendBeacon = function () { return false; }; }
})();
(function patchFetchForFile() {
  window.fetch = function (input) {
    const { ok, resolved } = isFileUrl(input);
    if (!ok) return Promise.reject(new Error('Network is disabled in the practice runtime: ' + resolved));
    return new Promise((resolve, reject) => {
      const xhr = new (window.__rawXHR__ || XMLHttpRequest)();
      xhr.open('GET', resolved, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status !== 0 && xhr.status !== 200) return reject(new Error('XHR ' + xhr.status + ' for ' + resolved));
        const headers = new Headers();
        if (resolved.endsWith('.json')) headers.set('Content-Type', 'application/json');
        resolve(new Response(xhr.response, { status: 200, headers }));
      };
      xhr.onerror = () => reject(new Error('XHR network error for ' + resolved));
      xhr.send();
    });
  };
})();

// --- CodeMirror setup -------------------------------------------------------
const LANGUAGE = ${langJson};
const STARTER = \`${safeStarter}\`;
let editorView;

async function loadScriptAsText(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  (0, eval)(text);
}

async function initEditor() {
  try {
    await loadScriptAsText('./codemirror-bundle.js');
    const cm = window.__cm__;
    if (!cm || !cm.state) throw new Error('CodeMirror bundle did not populate window.__cm__');
    const { EditorState } = cm.state;
    const { EditorView, lineNumbers, drawSelection, highlightActiveLine, keymap } = cm.view;
    const { defaultKeymap, indentWithTab, history, historyKeymap } = cm.commands;
    const { python } = cm.langPython;
    const { oneDark } = cm.themeOneDark;
    const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput, indentUnit } = cm.language;
    const { closeBrackets, closeBracketsKeymap } = cm.autocomplete;

    // We highlight all languages with Python mode for now — proper JS/Java
    // grammars require rebuilding the CM bundle with their lang packages.
    const startState = EditorState.create({
      doc: STARTER,
      extensions: [
        lineNumbers(), history(), drawSelection(), highlightActiveLine(),
        bracketMatching(), closeBrackets(), indentOnInput(), indentUnit.of('    '),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
        python(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,
        EditorView.theme({ '&': { backgroundColor: '#1e1e2e' } }),
        EditorView.lineWrapping,
      ],
    });

    editorView = new EditorView({ state: startState, parent: document.getElementById('editor') });
    send({ type: 'ready' });
  } catch (err) {
    const fallback = document.createElement('div');
    fallback.id = 'fallback';
    fallback.textContent = 'Editor failed to load: ' + (err && err.message ? err.message : String(err));
    document.getElementById('editor').replaceWith(fallback);
    send({ type: 'error', error: 'Editor failed to load: ' + (err && err.message ? err.message : String(err)) });
  }
}

// --- JavaScript grader (in-WebView) ----------------------------------------
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-9;
  }
  if (typeof a === 'object') {
    if (Array.isArray(b)) return false;
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.length !== kb.length) return false;
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return false;
      if (!deepEqual(a[ka[i]], b[kb[i]])) return false;
    }
    return true;
  }
  return false;
}

function runJsTests(fnName, tests) {
  if (!editorView) {
    send({ type: 'error', error: 'Editor not ready' });
    return;
  }
  const userCode = editorView.state.doc.toString();
  let userFn;
  try {
    // Wrap in a Function so it gets its own scope, then return the named function.
    const factory = new Function(userCode + '\\n; return typeof ' + fnName + ' !== "undefined" ? ' + fnName + ' : undefined;');
    userFn = factory();
  } catch (e) {
    send({
      type: 'result',
      payload: {
        passed: 0, total: 0,
        cases: [{ hidden: false, pass: false, runtimeMs: 0, error: (e && e.message) || String(e) }],
        totalRuntimeMs: 0,
      },
    });
    return;
  }
  if (typeof userFn !== 'function') {
    send({
      type: 'result',
      payload: {
        passed: 0, total: 0,
        cases: [{ hidden: false, pass: false, runtimeMs: 0, error: "Function '" + fnName + "' was not defined." }],
        totalRuntimeMs: 0,
      },
    });
    return;
  }
  const cases = [];
  let passed = 0;
  let totalRuntimeMs = 0;
  for (const t of tests) {
    const t0 = performance.now();
    try {
      const actual = userFn.apply(null, t.input);
      const ms = +(performance.now() - t0).toFixed(2);
      totalRuntimeMs += ms;
      const ok = deepEqual(actual, t.expected);
      if (ok) passed++;
      cases.push({
        hidden: !!t.hidden, pass: ok, runtimeMs: ms,
        expected: t.expected, actual,
      });
    } catch (e) {
      const ms = +(performance.now() - t0).toFixed(2);
      totalRuntimeMs += ms;
      cases.push({
        hidden: !!t.hidden, pass: false, runtimeMs: ms,
        error: (e && e.message) || String(e),
      });
    }
  }
  send({
    type: 'result',
    payload: { passed, total: tests.length, cases, totalRuntimeMs: +totalRuntimeMs.toFixed(2) },
  });
}

// --- Helpers ---------------------------------------------------------------
function resetEditor(code) {
  if (!editorView) return;
  editorView.dispatch({ changes: { from: 0, to: editorView.state.doc.length, insert: code } });
}
function insertAtCursor(text, cursorOffset) {
  if (!editorView) return;
  const { from, to } = editorView.state.selection.main;
  const finalText = String(text == null ? '' : text);
  const offset = typeof cursorOffset === 'number' ? cursorOffset : finalText.length;
  editorView.dispatch({
    changes: { from, to, insert: finalText },
    selection: { anchor: from + offset },
  });
  editorView.focus();
}

// --- RN -> WV bridge --------------------------------------------------------
function handleHostMessage(rawData) {
  let msg;
  try { msg = JSON.parse(rawData); } catch { return; }
  if (msg.type === 'run') {
    if (LANGUAGE === 'javascript') {
      runJsTests(msg.fnName, msg.tests);
    } else {
      // Java: just hand the user's code back; RN runs the rules check.
      if (!editorView) { send({ type: 'error', error: 'Editor not ready' }); return; }
      send({ type: 'submit', code: editorView.state.doc.toString() });
    }
  } else if (msg.type === 'reset') {
    resetEditor(msg.code);
  } else if (msg.type === 'insert') {
    insertAtCursor(msg.text, msg.cursorOffset);
  }
}

window.addEventListener('message', (e) => handleHostMessage(e.data));
document.addEventListener('message', (e) => handleHostMessage(e.data));

initEditor();
</script>
</body>
</html>`;
}
