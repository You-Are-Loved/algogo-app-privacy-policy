/**
 * Builds the HTML that hosts the React (Frontend) practice editor + sandbox.
 *
 * Layout: a CodeMirror editor (JSX) and a preview host holding a sandboxed
 * <iframe>. The user's component is compiled and rendered INSIDE that frame:
 *
 *   - sandbox="allow-scripts" only → the frame has an opaque origin: no access
 *     to this page's DOM, storage, or the ReactNativeWebView bridge, and it
 *     cannot navigate the top frame, open popups or submit forms.
 *   - A strict Content-Security-Policy in the frame blocks every network
 *     request (connect-src/img-src/font-src 'none' except data:), plugins,
 *     nested frames and base-uri changes. This page also has its own network
 *     lockdown like the other practice runtimes.
 *   - React, ReactDOM and Babel are inlined from the staged offline assets;
 *     user code is delivered by postMessage (never string-concatenated into
 *     the document), and every test run gets a brand-new frame.
 *   - Messages from the frame are only accepted from the current frame's
 *     contentWindow and must carry the `__algogo` marker.
 *
 * Bridge (RN -> WV):
 *   { type: 'run', name, tests, props, setup }  -> { type: 'result', payload: ExecResult }
 *   { type: 'preview', name, props, setup }     -> { type: 'previewResult', ok, error }
 *   { type: 'mode', mode: 'code'|'preview' }
 *   { type: 'reset', code } / { type: 'insert', text, cursorOffset }
 */

import { REACT_HARNESS_SOURCE } from './reactHarness';

const escapeForTemplate = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

interface BuildArgs {
  starter: string;
}

export function buildReactHtml({ starter }: BuildArgs): string {
  const safeStarter = escapeForTemplate(starter);
  const safeHarness = escapeForTemplate(REACT_HARNESS_SOURCE);

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
  #previewHost { display: none; height: 100%; width: 100%; background: #F6F7FB; }
  #previewHost iframe { border: 0; width: 100%; height: 100%; background: #fff; }
  body.preview #editor { display: none; }
  body.preview #previewHost { display: block; }
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
<div id="previewHost"></div>
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

// --- Network lockdown (host page) -------------------------------------------
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
        resolve(new Response(xhr.response, { status: 200 }));
      };
      xhr.onerror = () => reject(new Error('XHR network error for ' + resolved));
      xhr.send();
    });
  };
})();

// --- Editor ------------------------------------------------------------------
const STARTER = \`${safeStarter}\`;
const HARNESS = \`${safeHarness}\`;
let editorView;

async function loadScriptAsText(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  (0, eval)(text);
}
async function loadText(url) {
  const resp = await fetch(url);
  return resp.text();
}

async function initEditor() {
  await loadScriptAsText('./codemirror-bundle.js');
  const cm = window.__cm__;
  if (!cm || !cm.state) throw new Error('CodeMirror bundle did not populate window.__cm__');
  const { EditorState } = cm.state;
  const { EditorView, lineNumbers, drawSelection, highlightActiveLine, keymap } = cm.view;
  const { defaultKeymap, indentWithTab, history, historyKeymap } = cm.commands;
  const { oneDark } = cm.themeOneDark;
  const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput, indentUnit } = cm.language;
  const { closeBrackets, closeBracketsKeymap } = cm.autocomplete;
  const langExt = cm.langJavascript && cm.langJavascript.javascript
    ? cm.langJavascript.javascript({ jsx: true })
    : cm.langPython.python();
  const startState = EditorState.create({
    doc: STARTER,
    extensions: [
      lineNumbers(), history(), drawSelection(), highlightActiveLine(),
      bracketMatching(), closeBrackets(), indentOnInput(), indentUnit.of('  '),
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
      langExt,
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      oneDark,
      EditorView.theme({ '&': { backgroundColor: '#1e1e2e' } }),
      EditorView.lineWrapping,
    ],
  });
  editorView = new EditorView({ state: startState, parent: document.getElementById('editor') });
}

// --- Sandbox frame -----------------------------------------------------------
let SRCDOC = null;
let frame = null;
let frameReady = null; // Promise resolved when the current frame reports ready
const pending = new Map(); // token -> { resolve, reject, timer }
let tokenSeq = 0;

// Inline scripts must not be able to close their own <script> tag early.
const inlineSafe = (js) => js.replace(/<\\/script/gi, '<\\\\/script');

const FRAME_CSS = \`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; background: #ffffff; color: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.45; }
  body { padding: 16px; }
  #preview { min-height: 40px; }
  button { font: inherit; padding: 8px 14px; border-radius: 10px; border: 1px solid #d1d5db; background: #f9fafb; color: #111827; cursor: pointer; }
  button:active { background: #e5e7eb; }
  button:disabled { opacity: 0.5; cursor: default; }
  input, textarea, select { font: inherit; padding: 8px 10px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; color: #111827; max-width: 100%; }
  input:focus, textarea:focus, select:focus { outline: 2px solid #93c5fd; outline-offset: 1px; }
  ul, ol { padding-left: 20px; }
  h1, h2, h3 { margin: 0 0 8px; line-height: 1.2; }
  .harness-error { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 10px; white-space: pre-wrap; font: 12px/1.5 ui-monospace, Menlo, monospace; }
\`;

async function buildSrcdoc() {
  const [react, reactDom, babel] = await Promise.all([
    loadText('./react.development.js'),
    loadText('./react-dom.development.js'),
    loadText('./babel.min.js'),
  ]);
  const csp = [
    "default-src 'none'",
    "script-src 'unsafe-inline' 'unsafe-eval'",
    "style-src 'unsafe-inline'",
    "img-src data:",
    "font-src data:",
    "connect-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join('; ');
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta http-equiv="Content-Security-Policy" content="' + csp + '">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>' + FRAME_CSS + '</style></head><body><div id="preview"></div>' +
    // Boot beacon + early error hook so a failure in any library is visible
    // to the host (and therefore in the Metro log) instead of a silent timeout.
    '<script>window.__stage=function(s){try{parent.postMessage({__algogo:true,type:"frameStage",stage:s},"*")}catch(e){}};' +
    'window.onerror=function(m,src,l,c){try{parent.postMessage({__algogo:true,type:"frameError",message:String(m)+" @"+l+":"+c},"*")}catch(e){}};' +
    '__stage("boot")</' + 'script>' +
    '<script>' + inlineSafe(react) + '</' + 'script>' +
    '<script>__stage("react:"+typeof React)</' + 'script>' +
    '<script>' + inlineSafe(reactDom) + '</' + 'script>' +
    '<script>__stage("react-dom:"+typeof ReactDOM)</' + 'script>' +
    '<script>' + inlineSafe(babel) + '</' + 'script>' +
    '<script>__stage("babel:"+typeof Babel)</' + 'script>' +
    '<script>' + inlineSafe(HARNESS) + '</' + 'script>' +
    '</body></html>';
}

function destroyFrame() {
  if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
  frame = null;
  frameReady = null;
  for (const [, p] of pending) { clearTimeout(p.timer); p.reject(new Error('Sandbox was reset')); }
  pending.clear();
}

function createFrame() {
  destroyFrame();
  const el = document.createElement('iframe');
  el.setAttribute('sandbox', 'allow-scripts');
  el.setAttribute('referrerpolicy', 'no-referrer');
  el.setAttribute('title', 'Component preview');
  el.srcdoc = SRCDOC;
  frame = el;
  frameReady = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Sandbox did not start (timeout)')), 20000);
    pending.set('ready', { resolve: () => { clearTimeout(timer); resolve(); }, reject, timer });
  });
  document.getElementById('previewHost').appendChild(el);
  send({ type: 'log', level: 'info', message: 'sandbox frame appended, srcdoc ' + (SRCDOC ? SRCDOC.length : 0) + ' chars' });
  return frameReady;
}

window.addEventListener('message', (e) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object' || msg.__algogo !== true) return;
  if (!frame || e.source !== frame.contentWindow) {
    send({ type: 'log', level: 'error', message: 'sandbox message from unexpected source: ' + msg.type + ' ' + (msg.stage || msg.message || '') });
    return;
  }
  if (msg.type === 'frameStage') {
    send({ type: 'log', level: 'info', message: 'sandbox stage ' + msg.stage });
    return;
  }
  if (msg.type === 'frameReady') {
    const p = pending.get('ready');
    if (p) { pending.delete('ready'); p.resolve(); }
    return;
  }
  if (msg.type === 'frameError') {
    send({ type: 'log', level: 'error', message: 'sandbox: ' + msg.message });
    return;
  }
  const p = pending.get(msg.token);
  if (!p) return;
  pending.delete(msg.token);
  clearTimeout(p.timer);
  p.resolve(msg);
});

function ask(payload, timeoutMs) {
  const token = 't' + (++tokenSeq);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(token);
      reject(new Error('Sandbox timed out — an infinite loop or a never-settling effect, most likely'));
    }, timeoutMs);
    pending.set(token, { resolve, reject, timer });
    frame.contentWindow.postMessage(Object.assign({ token }, payload), '*');
  });
}

async function ensureFrame() {
  if (frame && frameReady) { await frameReady; return; }
  await createFrame();
}

async function runTests(name, tests, props, setup) {
  if (!editorView) { send({ type: 'error', error: 'Editor not ready' }); return; }
  const code = editorView.state.doc.toString();
  const t0 = performance.now();
  try {
    await createFrame(); // fresh sandbox for every run
    const budget = 5000 + (Array.isArray(tests) ? tests.length : 0) * 4500;
    const res = await ask({ type: 'run', code, name, tests, props, setup }, budget);
    const results = Array.isArray(res.results) ? res.results : [];
    const cases = results.map((r) => ({
      hidden: false,
      pass: !!r.pass,
      runtimeMs: Number(r.runtimeMs) || 0,
      label: String(r.name || ''),
      error: r.pass ? undefined : String(r.error || 'Failed'),
    }));
    const passed = cases.filter((c) => c.pass).length;
    send({
      type: 'result',
      payload: { passed, total: cases.length, cases, totalRuntimeMs: +(performance.now() - t0).toFixed(2) },
    });
  } catch (e) {
    send({
      type: 'result',
      payload: {
        passed: 0, total: 0,
        cases: [{ hidden: false, pass: false, runtimeMs: 0, error: (e && e.message) || String(e) }],
        totalRuntimeMs: 0,
      },
    });
    destroyFrame();
  }
}

async function preview(name, props, setup) {
  if (!editorView) return;
  const code = editorView.state.doc.toString();
  try {
    await ensureFrame();
    const res = await ask({ type: 'preview', code, name, props, setup }, 8000);
    send({ type: 'previewResult', ok: !!res.ok, error: res.error || null });
  } catch (e) {
    send({ type: 'previewResult', ok: false, error: (e && e.message) || String(e) });
    destroyFrame();
  }
}

function setMode(mode) {
  document.body.classList.toggle('preview', mode === 'preview');
  if (mode === 'preview' && document.activeElement) document.activeElement.blur();
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
  if (msg.type === 'run') runTests(msg.name, msg.tests, msg.props, msg.setup);
  else if (msg.type === 'preview') preview(msg.name, msg.props, msg.setup);
  else if (msg.type === 'mode') setMode(msg.mode);
  else if (msg.type === 'reset') resetEditor(msg.code);
  else if (msg.type === 'insert') insertAtCursor(msg.text, msg.cursorOffset);
}
window.addEventListener('message', (e) => { if (typeof e.data === 'string') handleHostMessage(e.data); });
document.addEventListener('message', (e) => { if (typeof e.data === 'string') handleHostMessage(e.data); });

(async function boot() {
  try {
    await initEditor();
    SRCDOC = await buildSrcdoc();
    await createFrame(); // warm the sandbox so the first preview is instant
    send({ type: 'ready' });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const fallback = document.createElement('div');
    fallback.id = 'fallback';
    fallback.textContent = 'React runtime failed to load: ' + msg;
    const ed = document.getElementById('editor');
    if (ed) ed.replaceWith(fallback);
    send({ type: 'error', error: 'React runtime failed to load: ' + msg });
  }
})();
</script>
</body>
</html>`;
}
