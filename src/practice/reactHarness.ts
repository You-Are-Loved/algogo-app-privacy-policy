/**
 * Source of the React test harness that runs INSIDE the sandboxed iframe (and
 * inside jsdom for scripts/verify-react.ts, so authored content is verified by
 * exactly the code that grades it in the app).
 *
 * Expects window.React, window.ReactDOM and window.Babel to be loaded first.
 * Exposes window.__harness = { runTests, preview, cleanup } and, when running
 * in a frame, listens for parent messages { type: 'run' | 'preview' } and
 * replies with { __algogo: true, type: 'result' | 'previewResult' }.
 */
export const REACT_HARNESS_SOURCE = String.raw`
(function () {
  'use strict';
  var React = window.React, ReactDOM = window.ReactDOM, Babel = window.Babel;
  if (!React || !ReactDOM || !Babel) throw new Error('React sandbox libraries missing');
  window.IS_REACT_ACT_ENVIRONMENT = true;
  var act = React.act || React.unstable_act || function (fn) { return fn(); };

  var HOOK_NAMES = ['useState', 'useEffect', 'useLayoutEffect', 'useMemo', 'useCallback', 'useRef',
    'useReducer', 'useContext', 'createContext', 'Fragment', 'useId', 'memo', 'forwardRef',
    'useTransition', 'useDeferredValue', 'useImperativeHandle', 'Children', 'cloneElement', 'createElement', 'isValidElement'];
  var scope = { React: React };
  HOOK_NAMES.forEach(function (n) { if (React[n] !== undefined) scope[n] = React[n]; });
  // Hooks as globals too, so \`useState\` works without destructuring.
  Object.keys(scope).forEach(function (k) { if (window[k] === undefined) window[k] = scope[k]; });

  var TEST_TIMEOUT_MS = 4000;
  var roots = [];

  function stripModuleSyntax(code) {
    return String(code)
      .replace(/^\s*import\s+[^;]*?\s+from\s+['"]react(?:-dom)?(?:\/client)?['"];?\s*$/gm, '')
      .replace(/^\s*import\s+['"]react['"];?\s*$/gm, '')
      .replace(/^\s*export\s+default\s+function\b/gm, 'function')
      .replace(/^\s*export\s+default\s+class\b/gm, 'class')
      .replace(/^\s*export\s+default\s+[A-Za-z_$][\w$]*\s*;?\s*$/gm, '')
      .replace(/^\s*export\s+(const|let|var|function|class)\b/gm, '$1');
  }

  function compile(code) {
    var src = stripModuleSyntax(code);
    return Babel.transform(src, { presets: ['react'], filename: 'component.jsx', sourceType: 'script', compact: false }).code;
  }

  function loadComponent(code, name) {
    var compiled = compile(code);
    var keys = Object.keys(scope);
    var vals = keys.map(function (k) { return scope[k]; });
    var factory = new Function(keys.join(','), compiled + '\n;return (typeof ' + name + ' !== "undefined") ? ' + name + ' : undefined;');
    var Comp = factory.apply(null, vals);
    var ok = typeof Comp === 'function' || (Comp && typeof Comp === 'object' && (Comp.$$typeof || Comp.render));
    if (!ok) throw new Error('Component "' + name + '" was not defined. Define it with: function ' + name + '(props) { ... }');
    return Comp;
  }

  // ---- DOM queries -----------------------------------------------------------
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function matches(text, matcher) {
    if (matcher instanceof RegExp) return matcher.test(text);
    return norm(text) === norm(matcher);
  }
  function describe(matcher) { return matcher instanceof RegExp ? String(matcher) : JSON.stringify(matcher); }
  function elementsIn(root) {
    var out = [];
    var walker = (root.ownerDocument || document).createTreeWalker(root, 1);
    var n = walker.currentNode;
    if (n.nodeType === 1 && n !== root) out.push(n);
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }
  function textMatches(root, matcher) {
    var all = elementsIn(root).filter(function (el) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
      return matches(el.textContent, matcher);
    });
    // Keep the deepest matches only (drop ancestors of other matches).
    return all.filter(function (el) { return !all.some(function (o) { return o !== el && el.contains(o); }); });
  }
  function one(list, what, root) {
    if (list.length === 0) throw new Error('Unable to find an element ' + what + '.\nRendered HTML:\n' + snapshot(root));
    if (list.length > 1) throw new Error('Found ' + list.length + ' elements ' + what + ' — use getAll... or narrow the query.');
    return list[0];
  }
  function snapshot(root) {
    var html = (root === document.body ? root : root).innerHTML || '';
    return html.length > 600 ? html.slice(0, 600) + '…' : html;
  }
  function roleOf(el) {
    var r = el.getAttribute('role');
    if (r) return r;
    var t = el.tagName;
    if (t === 'BUTTON') return 'button';
    if (t === 'A' && el.hasAttribute('href')) return 'link';
    if (t === 'INPUT') {
      var ty = (el.getAttribute('type') || 'text').toLowerCase();
      if (ty === 'checkbox') return 'checkbox';
      if (ty === 'radio') return 'radio';
      if (ty === 'button' || ty === 'submit' || ty === 'reset') return 'button';
      if (ty === 'range') return 'slider';
      if (ty === 'number') return 'spinbutton';
      return 'textbox';
    }
    if (t === 'TEXTAREA') return 'textbox';
    if (t === 'SELECT') return 'combobox';
    if (t === 'UL' || t === 'OL') return 'list';
    if (t === 'LI') return 'listitem';
    if (/^H[1-6]$/.test(t)) return 'heading';
    if (t === 'IMG') return 'img';
    if (t === 'FORM') return 'form';
    if (t === 'TABLE') return 'table';
    if (t === 'NAV') return 'navigation';
    if (t === 'OPTION') return 'option';
    return null;
  }
  function accessibleName(el) {
    var aria = el.getAttribute('aria-label');
    if (aria) return norm(aria);
    var labelled = el.getAttribute('aria-labelledby');
    if (labelled) {
      var lab = document.getElementById(labelled);
      if (lab) return norm(lab.textContent);
    }
    if (el.id) {
      var l = document.querySelector('label[for="' + el.id + '"]');
      if (l) return norm(l.textContent);
    }
    if (el.tagName === 'IMG') return norm(el.getAttribute('alt'));
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type)) return norm(el.value);
    var parentLabel = el.closest && el.closest('label');
    if (parentLabel && el.tagName !== 'LABEL') return norm(parentLabel.textContent);
    return norm(el.textContent);
  }
  function makeQueries(root) {
    var q = {
      container: root,
      getByText: function (m) { return one(textMatches(root, m), 'with the text ' + describe(m), root); },
      queryByText: function (m) { var l = textMatches(root, m); return l.length ? l[0] : null; },
      getAllByText: function (m) { var l = textMatches(root, m); if (!l.length) throw new Error('Unable to find elements with the text ' + describe(m) + '.'); return l; },
      queryAllByText: function (m) { return textMatches(root, m); },
      getByTestId: function (id) { return one(Array.prototype.slice.call(root.querySelectorAll('[data-testid="' + id + '"]')), 'with data-testid="' + id + '"', root); },
      queryByTestId: function (id) { return root.querySelector('[data-testid="' + id + '"]'); },
      getAllByTestId: function (id) { var l = Array.prototype.slice.call(root.querySelectorAll('[data-testid="' + id + '"]')); if (!l.length) throw new Error('Unable to find elements with data-testid="' + id + '".'); return l; },
      getByPlaceholderText: function (m) { return one(elementsIn(root).filter(function (el) { return el.getAttribute && el.getAttribute('placeholder') != null && matches(el.getAttribute('placeholder'), m); }), 'with the placeholder ' + describe(m), root); },
      getByLabelText: function (m) {
        var found = [];
        elementsIn(root).forEach(function (el) {
          if (el.tagName !== 'LABEL') return;
          var own = norm(el.childNodes.length ? Array.prototype.map.call(el.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : (n.tagName === 'INPUT' || n.tagName === 'SELECT' || n.tagName === 'TEXTAREA') ? '' : n.textContent; }).join(' ') : el.textContent);
          if (!matches(own, m) && !matches(el.textContent, m)) return;
          var target = el.getAttribute('for') ? document.getElementById(el.getAttribute('for')) : el.querySelector('input, select, textarea');
          if (target) found.push(target);
        });
        elementsIn(root).forEach(function (el) {
          if (el.getAttribute && el.getAttribute('aria-label') != null && matches(el.getAttribute('aria-label'), m)) found.push(el);
        });
        return one(found, 'labelled ' + describe(m), root);
      },
      getAllByRole: function (role, opts) {
        var l = elementsIn(root).filter(function (el) { return roleOf(el) === role && (!opts || opts.name === undefined || matches(accessibleName(el), opts.name)); });
        if (!l.length) throw new Error('Unable to find elements with role "' + role + '"' + (opts && opts.name !== undefined ? ' and name ' + describe(opts.name) : '') + '.\nRendered HTML:\n' + snapshot(root));
        return l;
      },
      getByRole: function (role, opts) {
        var l = elementsIn(root).filter(function (el) { return roleOf(el) === role && (!opts || opts.name === undefined || matches(accessibleName(el), opts.name)); });
        return one(l, 'with role "' + role + '"' + (opts && opts.name !== undefined ? ' and name ' + describe(opts.name) : ''), root);
      },
      queryByRole: function (role, opts) {
        var l = elementsIn(root).filter(function (el) { return roleOf(el) === role && (!opts || opts.name === undefined || matches(accessibleName(el), opts.name)); });
        return l.length ? l[0] : null;
      },
    };
    return q;
  }
  function within(el) { return makeQueries(el); }

  // ---- events ---------------------------------------------------------------
  function setNativeValue(el, value) {
    var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype
      : el.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value); else el.value = value;
  }
  function dispatch(el, ev) { var r; act(function () { r = el.dispatchEvent(ev); }); return r; }
  var fireEvent = {
    click: function (el) { return dispatch(el, new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); },
    doubleClick: function (el) { return dispatch(el, new window.MouseEvent('dblclick', { bubbles: true, cancelable: true })); },
    change: function (el, value) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        var wanted = typeof value === 'boolean' ? value : !el.checked;
        if (el.checked !== wanted) return fireEvent.click(el);
        return true;
      }
      setNativeValue(el, value);
      dispatch(el, new window.Event('input', { bubbles: true }));
      return dispatch(el, new window.Event('change', { bubbles: true }));
    },
    input: function (el, value) { setNativeValue(el, value); return dispatch(el, new window.Event('input', { bubbles: true })); },
    keyDown: function (el, key) {
      var init = typeof key === 'string' ? { key: key } : (key || {});
      init.bubbles = true; init.cancelable = true;
      return dispatch(el, new window.KeyboardEvent('keydown', init));
    },
    keyUp: function (el, key) {
      var init = typeof key === 'string' ? { key: key } : (key || {});
      init.bubbles = true; init.cancelable = true;
      return dispatch(el, new window.KeyboardEvent('keyup', init));
    },
    submit: function (el) { var form = el.tagName === 'FORM' ? el : el.closest('form'); if (!form) throw new Error('fireEvent.submit: no form found'); return dispatch(form, new window.Event('submit', { bubbles: true, cancelable: true })); },
    focus: function (el) { act(function () { el.focus && el.focus(); }); return dispatch(el, new window.FocusEvent('focusin', { bubbles: true })); },
    blur: function (el) { act(function () { el.blur && el.blur(); }); return dispatch(el, new window.FocusEvent('focusout', { bubbles: true })); },
    mouseEnter: function (el) { return dispatch(el, new window.MouseEvent('mouseover', { bubbles: true })); },
    mouseLeave: function (el) { return dispatch(el, new window.MouseEvent('mouseout', { bubbles: true })); },
  };

  // ---- expect ---------------------------------------------------------------
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (Array.isArray(a)) { if (!Array.isArray(b) || a.length !== b.length) return false; return a.every(function (x, i) { return deepEqual(x, b[i]); }); }
    if (typeof a === 'object') {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      return ka.every(function (k) { return deepEqual(a[k], b[k]); });
    }
    return false;
  }
  function show(v) {
    if (v && v.nodeType === 1) return '<' + v.tagName.toLowerCase() + '>' + norm(v.textContent).slice(0, 40) + '</' + v.tagName.toLowerCase() + '>';
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }
  function expect(actual) {
    function build(negate) {
      function check(pass, msg) {
        if (negate ? pass : !pass) throw new Error((negate ? 'Expected NOT: ' : 'Expected: ') + msg);
      }
      var m = {
        toBe: function (e) { check(Object.is(actual, e), show(actual) + ' to be ' + show(e)); },
        toEqual: function (e) { check(deepEqual(actual, e), show(actual) + ' to equal ' + show(e)); },
        toContain: function (e) {
          var ok = typeof actual === 'string' ? actual.indexOf(e) !== -1 : Array.isArray(actual) ? actual.some(function (x) { return deepEqual(x, e); }) : (actual && actual.contains && e && e.nodeType === 1 ? actual.contains(e) : false);
          check(ok, show(actual) + ' to contain ' + show(e));
        },
        toBeTruthy: function () { check(!!actual, show(actual) + ' to be truthy'); },
        toBeFalsy: function () { check(!actual, show(actual) + ' to be falsy'); },
        toBeNull: function () { check(actual === null, show(actual) + ' to be null'); },
        toBeDefined: function () { check(actual !== undefined, 'value to be defined'); },
        toBeUndefined: function () { check(actual === undefined, show(actual) + ' to be undefined'); },
        toHaveLength: function (n) { check(actual != null && actual.length === n, 'length ' + (actual == null ? 'undefined' : actual.length) + ' to be ' + n); },
        toMatch: function (re) { var s = String(actual); check(re instanceof RegExp ? re.test(s) : s.indexOf(re) !== -1, show(s) + ' to match ' + describe(re)); },
        toBeGreaterThan: function (n) { check(actual > n, actual + ' > ' + n); },
        toBeGreaterThanOrEqual: function (n) { check(actual >= n, actual + ' >= ' + n); },
        toBeLessThan: function (n) { check(actual < n, actual + ' < ' + n); },
        toBeLessThanOrEqual: function (n) { check(actual <= n, actual + ' <= ' + n); },
        toHaveTextContent: function (t) { var txt = norm(actual && actual.textContent); check(t instanceof RegExp ? t.test(txt) : txt.indexOf(norm(t)) !== -1, 'element text ' + show(txt) + ' to contain ' + describe(t)); },
        toHaveAttribute: function (name, value) {
          var has = actual && actual.hasAttribute && actual.hasAttribute(name);
          if (value === undefined) check(!!has, 'element to have attribute "' + name + '"');
          else check(!!has && actual.getAttribute(name) === String(value), 'attribute "' + name + '" to be ' + show(value) + ' (got ' + show(has ? actual.getAttribute(name) : null) + ')');
        },
        toHaveClass: function (c) { check(!!(actual && actual.classList && actual.classList.contains(c)), 'element to have class "' + c + '"'); },
        toBeDisabled: function () { check(!!(actual && (actual.disabled || actual.getAttribute('aria-disabled') === 'true')), 'element to be disabled'); },
        toBeChecked: function () { check(!!(actual && (actual.checked || actual.getAttribute('aria-checked') === 'true')), 'element to be checked'); },
        toHaveValue: function (v) { check(actual && String(actual.value) === String(v), 'value ' + show(actual && actual.value) + ' to be ' + show(v)); },
        toBeInTheDocument: function () { check(!!(actual && document.body.contains(actual)), 'element to be in the document'); },
        toBeEmptyDOMElement: function () { check(!!(actual && norm(actual.innerHTML) === ''), 'element to be empty'); },
      };
      return m;
    }
    var api = build(false);
    api.not = build(true);
    return api;
  }

  // ---- lifecycle ------------------------------------------------------------
  function cleanup() {
    roots.forEach(function (r) { try { act(function () { r.root.unmount(); }); } catch (e) {} if (r.container.parentNode) r.container.parentNode.removeChild(r.container); });
    roots = [];
  }
  function mount(Comp, props, host) {
    var container = document.createElement('div');
    container.setAttribute('data-harness-root', '');
    (host || document.body).appendChild(container);
    var root = ReactDOM.createRoot(container);
    act(function () { root.render(React.createElement(Comp, props || {})); });
    roots.push({ root: root, container: container });
    var q = makeQueries(container);
    q.rerender = function (next) { act(function () { root.render(React.createElement(Comp, next || {})); }); };
    q.unmount = function () { act(function () { root.unmount(); }); };
    q.debug = function () { return container.innerHTML; };
    return q;
  }
  function tick() { return new Promise(function (r) { setTimeout(r, 0); }); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, Math.min(ms || 0, 1000)); }); }
  function waitFor(fn, opts) {
    var timeout = (opts && opts.timeout) || 1500;
    var start = Date.now();
    return new Promise(function (resolve, reject) {
      (function attempt() {
        try { resolve(fn()); }
        catch (e) { if (Date.now() - start > timeout) reject(e); else setTimeout(attempt, 30); }
      })();
    });
  }
  function errMessage(e) {
    if (!e) return 'Unknown error';
    var m = e.message || String(e);
    return String(m).replace(/^Error:\s*/, '').split('\n').slice(0, 8).join('\n');
  }
  var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  function resolveProps(props, setup) {
    var base = Object.assign({}, props || {});
    if (setup && String(setup).trim()) {
      var extra = new Function(String(setup))();
      if (extra && typeof extra === 'object') Object.assign(base, extra);
    }
    return base;
  }

  async function runTests(code, name, tests, props, setup) {
    cleanup();
    var defaultProps;
    try { defaultProps = resolveProps(props, setup); }
    catch (e) { var m0 = 'previewSetup failed: ' + errMessage(e); return tests.map(function (t) { return { name: t.name, pass: false, error: m0, runtimeMs: 0 }; }); }
    var Comp;
    try { Comp = loadComponent(code, name); }
    catch (e) {
      var msg = errMessage(e);
      return tests.map(function (t) { return { name: t.name, pass: false, error: msg, runtimeMs: 0 }; });
    }
    var results = [];
    for (var i = 0; i < tests.length; i++) {
      var t = tests[i];
      cleanup();
      var render = function (props) { return mount(Comp, props === undefined ? (defaultProps || {}) : props); };
      var screen = makeQueries(document.body);
      var t0 = Date.now();
      try {
        var fn = new AsyncFunction('render', 'screen', 'fireEvent', 'expect', 'tick', 'sleep', 'waitFor', 'within', 'act', 'React', 'Component', 'props', t.code);
        await Promise.race([
          fn(render, screen, fireEvent, expect, tick, sleep, waitFor, within, act, React, Comp, defaultProps || {}),
          new Promise(function (_, rej) { setTimeout(function () { rej(new Error('Test timed out after ' + TEST_TIMEOUT_MS + ' ms')); }, TEST_TIMEOUT_MS); }),
        ]);
        results.push({ name: t.name, pass: true, runtimeMs: Date.now() - t0 });
      } catch (e) {
        results.push({ name: t.name, pass: false, error: errMessage(e), runtimeMs: Date.now() - t0 });
      }
    }
    cleanup();
    return results;
  }

  function preview(code, name, props, setup) {
    cleanup();
    var host = document.getElementById('preview') || document.body;
    host.innerHTML = '';
    try {
      var resolved = resolveProps(props, setup);
      var Comp = loadComponent(code, name);
      mount(Comp, resolved, host);
      return { ok: true };
    } catch (e) {
      var box = document.createElement('pre');
      box.className = 'harness-error';
      box.textContent = errMessage(e);
      host.appendChild(box);
      return { ok: false, error: errMessage(e) };
    }
  }

  window.__harness = { runTests: runTests, preview: preview, cleanup: cleanup };

  // Frame mode: talk to the host page. Only the parent window is trusted.
  if (window.parent && window.parent !== window) {
    window.addEventListener('message', function (e) {
      if (e.source !== window.parent) return;
      var msg = e.data || {};
      if (msg.type === 'run') {
        runTests(String(msg.code || ''), String(msg.name || ''), Array.isArray(msg.tests) ? msg.tests : [], msg.props || {}, msg.setup || '').then(function (results) {
          window.parent.postMessage({ __algogo: true, type: 'result', token: msg.token, results: results }, '*');
        }, function (err) {
          window.parent.postMessage({ __algogo: true, type: 'result', token: msg.token, results: [{ name: 'harness', pass: false, error: errMessage(err), runtimeMs: 0 }] }, '*');
        });
      } else if (msg.type === 'preview') {
        var r = preview(String(msg.code || ''), String(msg.name || ''), msg.props || {}, msg.setup || '');
        window.parent.postMessage({ __algogo: true, type: 'previewResult', token: msg.token, ok: r.ok, error: r.error || null }, '*');
      }
    });
    window.addEventListener('error', function (e) {
      window.parent.postMessage({ __algogo: true, type: 'frameError', message: String(e.message || e) }, '*');
    });
    window.parent.postMessage({ __algogo: true, type: 'frameReady' }, '*');
  }
})();
`;
