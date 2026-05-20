#!/usr/bin/env node
/**
 * Build assets/practice/ — Pyodide runtime + CodeMirror bundle.
 *
 * Run: node scripts/build-practice-assets.js
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

function bundleCodeMirror() {
  console.log('Bundling CodeMirror via esbuild');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-bundle-'));
  const entry = path.join(tmp, 'entry.js');
  // IIFE that hangs everything off window.__cm__. We avoid ES module output
  // because real iOS devices serve file:// .js with a non-JS MIME type and
  // refuse to import() them. The IIFE is loaded via XHR + eval at runtime.
  fs.writeFileSync(
    entry,
    `export * as state from '@codemirror/state';
export * as view from '@codemirror/view';
export * as commands from '@codemirror/commands';
export * as langPython from '@codemirror/lang-python';
export * as themeOneDark from '@codemirror/theme-one-dark';
export * as language from '@codemirror/language';
export * as autocomplete from '@codemirror/autocomplete';
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
    `"${esbuild}" "${entry}" --bundle --format=iife --global-name=__cm__ --target=es2020 --minify --outfile="${out}"`,
    { cwd: tmp, stdio: 'inherit' },
  );
  const size = fs.statSync(out).size;
  console.log(`  codemirror-bundle.bin ${(size / 1024).toFixed(0)} KB`);
}

(async () => {
  try {
    await fetchPyodide();
    bundleCodeMirror();
    console.log('Done.');
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  }
})();
