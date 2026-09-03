/**
 * Builds the HTML that hosts the CodeMirror 6 editor + sql.js (SQLite in
 * wasm) for SQL practice problems. Everything loads from the staged local
 * runtime directory (see stageAssets.ts) — no network.
 *
 * Bridge (RN -> WV):
 *   { type: 'run', schema, datasets, solution, ordered }
 *     Builds a fresh in-memory DB per dataset, runs the reference solution
 *     for the expected rows and the editor's query for the actual rows, and
 *     posts { type: 'result', payload } shaped like ExecResult with
 *     expected/actual as { columns, rows } tables.
 *   { type: 'preview', schema, seed, solution }
 *     Posts { type: 'preview', tables, expected } for the visible dataset so
 *     the problem sheet can show sample data + the expected output.
 *   { type: 'reset', code } / { type: 'insert', text, cursorOffset }
 */

const escapeForTemplate = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

interface BuildArgs {
  starter: string;
}

export function buildSqlHtml({ starter }: BuildArgs): string {
  const safeStarter = escapeForTemplate(starter);

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

// --- Network lockdown (same posture as the other practice pages) ------------
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
        if (resolved.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
        resolve(new Response(xhr.response, { status: 200, headers }));
      };
      xhr.onerror = () => reject(new Error('XHR network error for ' + resolved));
      xhr.send();
    });
  };
})();

// --- Editor + engine boot ----------------------------------------------------
const STARTER = \`${safeStarter}\`;
let editorView;
let SQL = null;

async function loadScriptAsText(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  (0, eval)(text);
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
  // Prefer the SQL grammar when the bundle has it; fall back to Python
  // highlighting on older bundles so the editor still works.
  const langExt = cm.langSql && cm.langSql.sql ? cm.langSql.sql({ upperCaseKeywords: true }) : cm.langPython.python();

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

async function initEngine() {
  await loadScriptAsText('./sql-wasm.js');
  if (typeof initSqlJs !== 'function') throw new Error('sql-wasm.js did not define initSqlJs');
  SQL = await initSqlJs({ locateFile: (f) => './' + f });
}

async function boot() {
  try {
    await initEditor();
    await initEngine();
    send({ type: 'ready' });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const fallback = document.createElement('div');
    fallback.id = 'fallback';
    fallback.textContent = 'SQL runtime failed to load: ' + msg;
    const ed = document.getElementById('editor');
    if (ed) ed.replaceWith(fallback);
    send({ type: 'error', error: 'SQL runtime failed to load: ' + msg });
  }
}

// --- Grading ---------------------------------------------------------------
function normCell(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v;
    return Math.round(v * 1e6) / 1e6;
  }
  if (v instanceof Uint8Array) {
    try { return new TextDecoder().decode(v); } catch (e) { return String(v); }
  }
  return v;
}

/** Runs SQL and returns the LAST result set as { columns, rows }. */
function query(db, sql) {
  const results = db.exec(sql);
  if (!results || results.length === 0) return { columns: [], rows: [] };
  const last = results[results.length - 1];
  return {
    columns: last.columns.slice(),
    rows: last.values.map((r) => r.map(normCell)),
  };
}

function canon(table, ordered) {
  const strs = table.rows.map((r) => JSON.stringify(r));
  if (!ordered) strs.sort();
  return strs.join('\\n');
}

function firstError(msg) {
  // sql.js errors read like "no such column: foo" — keep them short.
  return String(msg || 'SQL error').replace(/^Error:\\s*/, '');
}

function runSql(schema, datasets, solution, ordered) {
  if (!editorView || !SQL) { send({ type: 'error', error: 'SQL runtime not ready' }); return; }
  const userSql = editorView.state.doc.toString();
  if (!userSql.replace(/--.*$/gm, '').trim()) {
    send({
      type: 'result',
      payload: {
        passed: 0, total: 0,
        cases: [{ hidden: false, pass: false, runtimeMs: 0, error: 'Write a query first.' }],
        totalRuntimeMs: 0,
      },
    });
    return;
  }
  const cases = [];
  let passed = 0;
  let totalRuntimeMs = 0;
  datasets.forEach((seed, i) => {
    const hidden = i > 0;
    const db = new SQL.Database();
    let expected = null;
    try {
      db.run(schema);
      db.run(seed);
      expected = query(db, solution);
    } catch (e) {
      cases.push({ hidden, pass: false, runtimeMs: 0, error: 'Problem data failed to load: ' + firstError(e && e.message) });
      db.close();
      return;
    }
    const t0 = performance.now();
    try {
      const actual = query(db, userSql);
      const ms = +(performance.now() - t0).toFixed(2);
      totalRuntimeMs += ms;
      let ok = actual.rows.length === expected.rows.length &&
        (actual.rows.length === 0 || actual.rows[0].length === expected.rows[0].length) &&
        canon(actual, ordered) === canon(expected, ordered);
      // An empty actual with columns vs empty expected: still fine if both empty.
      if (ok) passed++;
      cases.push({ hidden, pass: ok, runtimeMs: ms, expected, actual });
    } catch (e) {
      const ms = +(performance.now() - t0).toFixed(2);
      totalRuntimeMs += ms;
      cases.push({ hidden, pass: false, runtimeMs: ms, expected, error: firstError(e && e.message) });
    } finally {
      db.close();
    }
  });
  send({
    type: 'result',
    payload: { passed, total: datasets.length, cases, totalRuntimeMs: +totalRuntimeMs.toFixed(2) },
  });
}

function preview(schema, seed, solution) {
  if (!SQL) return;
  const db = new SQL.Database();
  try {
    db.run(schema);
    db.run(seed);
    const names = query(db, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid").rows.map((r) => r[0]);
    const tables = names.map((name) => {
      const t = query(db, 'SELECT * FROM "' + String(name).replace(/"/g, '""') + '" LIMIT 12');
      return { name, columns: t.columns, rows: t.rows };
    });
    let expected = null;
    try { expected = query(db, solution); } catch (e) { expected = { columns: [], rows: [], error: firstError(e && e.message) }; }
    send({ type: 'preview', tables, expected });
  } catch (e) {
    send({ type: 'log', level: 'error', message: 'preview failed: ' + (e && e.message) });
  } finally {
    db.close();
  }
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
    runSql(msg.schema, msg.datasets, msg.solution, !!msg.ordered);
  } else if (msg.type === 'preview') {
    preview(msg.schema, msg.seed, msg.solution);
  } else if (msg.type === 'reset') {
    resetEditor(msg.code);
  } else if (msg.type === 'insert') {
    insertAtCursor(msg.text, msg.cursorOffset);
  }
}
window.addEventListener('message', (e) => handleHostMessage(e.data));
document.addEventListener('message', (e) => handleHostMessage(e.data));

boot();
</script>
</body>
</html>`;
}
