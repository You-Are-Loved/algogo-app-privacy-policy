#!/usr/bin/env node
/**
 * Build assets/practice/ — Pyodide runtime + sql.js (SQLite) + CodeMirror bundle.
 *
 * Run: node scripts/build-practice-assets.js            (everything)
 *      node scripts/build-practice-assets.js --only=sqljs (just the SQLite engine)
 *
 * Downloads the minimal Pyodide v0.27.5 file set and bundles CodeMirror via
 * esbuild so the practice WebView can load everything from local files
 * (no CDN at runtime).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');

const PYODIDE_VERSION = '0.27.5';
const SQLJS_VERSION = '1.13.0';
const OUT_DIR = path.resolve(__dirname, '..', 'assets', 'practice');

// Pyodide files we need to ship. This is the minimal set for runPython with
// no extra packages — about 13MB total.
//
// JSON/JS extensions collide with Metro's source resolution, so we save those
// as .bin and restore the original name at runtime in ProblemScreen.
const PYODIDE_FILES = [
  { remote: 'pyodide.js', bundled: 'pyodide.js.bin', staged: 'pyodide.js' },
  { remote: 'pyodide.asm.js', bundled: 'pyodide.asm.js.bin', staged: 'pyodide.asm.js' },
  { remote: 'pyodide.asm.wasm', bundled: 'pyodide.asm.wasm', staged: 'pyodide.asm.wasm' },
  { remote: 'pyodide-lock.json', bundled: 'pyodide-lock.bin', staged: 'pyodide-lock.json' },
  { remote: 'python_stdlib.zip', bundled: 'python_stdlib.zip', staged: 'python_stdlib.zip' },
];

// sql.js = SQLite compiled to wasm. The JS loader is saved as .bin for the
// same Metro-collision reason as Pyodide and restored to .js when staged.
const SQLJS_FILES = [
  { remote: 'sql-wasm.js', bundled: 'sql-wasm.js.bin', staged: 'sql-wasm.js' },
  { remote: 'sql-wasm.wasm', bundled: 'sql-wasm.wasm', staged: 'sql-wasm.wasm' },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`${url} → HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function fetchPyodide() {
  console.log(`Fetching Pyodide v${PYODIDE_VERSION} into ${OUT_DIR}`);
  ensureDir(OUT_DIR);
  for (const file of PYODIDE_FILES) {
    const url = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/${file.remote}`;
    const dest = path.join(OUT_DIR, file.bundled);
    process.stdout.write(`  ${file.bundled} ... `);
    await download(url, dest);
    const size = fs.statSync(dest).size;
    console.log(`${(size / 1024 / 1024).toFixed(2)} MB`);
  }
}

async function fetchSqlJs() {
  console.log(`Fetching sql.js v${SQLJS_VERSION} into ${OUT_DIR}`);
  ensureDir(OUT_DIR);
  for (const file of SQLJS_FILES) {
    const url = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/${file.remote}`;
    const dest = path.join(OUT_DIR, file.bundled);
    process.stdout.write(`  ${file.bundled} ... `);
    await download(url, dest);
    const size = fs.statSync(dest).size;
    console.log(`${(size / 1024 / 1024).toFixed(2)} MB`);
  }
}

function bundleCodeMirror() {
  console.log('Bundling CodeMirror via esbuild');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-bundle-'));
  const entry = path.join(tmp, 'entry.js');
  // IIFE that attaches everything to globalThis.__cm__. We assign manually
  // (rather than relying on esbuild's --global-name return-value mechanism)
  // because some build environments emit a residual `export {}` at the IIFE
  // boundary that breaks eval() inside the WebView.
  fs.writeFileSync(
    entry,
    `import * as state from '@codemirror/state';
import * as view from '@codemirror/view';
import * as commands from '@codemirror/commands';
import * as langPython from '@codemirror/lang-python';
import * as langJavascript from '@codemirror/lang-javascript';
import * as langJava from '@codemirror/lang-java';
import * as langSql from '@codemirror/lang-sql';
import * as themeOneDark from '@codemirror/theme-one-dark';
import * as language from '@codemirror/language';
import * as autocomplete from '@codemirror/autocomplete';
globalThis.__cm__ = { state, view, commands, langPython, langJavascript, langJava, langSql, themeOneDark, language, autocomplete };
`,
  );
  // Pin the same versions the HTML used to import from esm.sh.
  const pkg = {
    name: 'cm-bundle-tmp',
    private: true,
    dependencies: {
      '@codemirror/state': '6.5.2',
      '@codemirror/view': '6.36.2',
      '@codemirror/commands': '6.7.1',
      '@codemirror/lang-python': '6.1.7',
      '@codemirror/lang-javascript': '6.2.2',
      '@codemirror/lang-java': '6.0.1',
      '@codemirror/lang-sql': '6.8.0',
      '@codemirror/theme-one-dark': '6.1.2',
      '@codemirror/language': '6.10.8',
      '@codemirror/autocomplete': '6.18.4',
      esbuild: '^0.24.0',
    },
  };
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify(pkg, null, 2));
  console.log('  npm install ...');
  execSync('npm install --silent --no-audit --no-fund', { cwd: tmp, stdio: 'inherit' });

  const out = path.join(OUT_DIR, 'codemirror-bundle.bin');
  const esbuild = path.join(tmp, 'node_modules', '.bin', 'esbuild');
  console.log('  esbuild ...');
  execSync(
    `"${esbuild}" "${entry}" --bundle --format=iife --target=es2020 --minify --outfile="${out}"`,
    { cwd: tmp, stdio: 'inherit' },
  );
  const size = fs.statSync(out).size;
  console.log(`  codemirror-bundle.bin ${(size / 1024).toFixed(0)} KB`);

  // Integrity check: the bundle is XHR-fetched and eval()'d as a classic
  // script in the WebView. Parse it the same way (new Function = classic
  // script) so we catch any residual ES-module syntax that would throw
  // "unexpected keyword export/import" on a real device.
  const source = fs.readFileSync(out, 'utf8');
  try {
    // eslint-disable-next-line no-new-func
    new Function(source);
    console.log('  ✔ bundle parses as a classic script');
  } catch (e) {
    throw new Error(
      `codemirror-bundle.bin does not parse as a classic script — refusing ` +
      `to ship. Inspect ${out}. Underlying error: ${e.message}`,
    );
  }
}

(async () => {
  try {
    const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
    if (!only || only === 'pyodide') await fetchPyodide();
    if (!only || only === 'sqljs') await fetchSqlJs();
    if (!only || only === 'codemirror') bundleCodeMirror();
    console.log('Done.');
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  }
})();
