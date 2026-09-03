import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

const STAGE_DIRNAME = 'practice-runtime';

// Bundled assets shipped under assets/practice/ (Pyodide, sql.js, CodeMirror).
// The bundled file extensions (.bin) avoid colliding with Metro source
// resolution; we copy them out with their canonical names so Pyodide and the
// CodeMirror dynamic import can find them by URL.
const ASSETS: { module: number; staged: string }[] = [
  { module: require('../../assets/practice/pyodide.js.bin'), staged: 'pyodide.js' },
  { module: require('../../assets/practice/pyodide.asm.js.bin'), staged: 'pyodide.asm.js' },
  { module: require('../../assets/practice/pyodide.asm.wasm'), staged: 'pyodide.asm.wasm' },
  { module: require('../../assets/practice/pyodide-lock.bin'), staged: 'pyodide-lock.json' },
  { module: require('../../assets/practice/python_stdlib.zip'), staged: 'python_stdlib.zip' },
  { module: require('../../assets/practice/codemirror-bundle.bin'), staged: 'codemirror-bundle.js' },
  // sql.js — SQLite compiled to wasm, for the SQL practice category.
  { module: require('../../assets/practice/sql-wasm.js.bin'), staged: 'sql-wasm.js' },
  { module: require('../../assets/practice/sql-wasm.wasm'), staged: 'sql-wasm.wasm' },
];

let stagedDirPromise: Promise<string> | null = null;

/**
 * Copies the bundled Pyodide runtime + CodeMirror bundle into a writable
 * directory the WebView can address with `file://` URLs. Idempotent: skips
 * files that already exist. Returns the directory path (with trailing slash).
 */
export function ensurePracticeRuntime(): Promise<string> {
  if (stagedDirPromise) return stagedDirPromise;
  stagedDirPromise = stage().catch((err) => {
    stagedDirPromise = null;
    throw err;
  });
  return stagedDirPromise;
}

async function stage(): Promise<string> {
  const dir = (FileSystem.documentDirectory || '') + STAGE_DIRNAME + '/';
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  for (const { module, staged } of ASSETS) {
    const dest = dir + staged;
    const destInfo = await FileSystem.getInfoAsync(dest);
    if (destInfo.exists) continue;

    const asset = Asset.fromModule(module);
    await asset.downloadAsync(); // resolves to a local URI in the app bundle
    if (!asset.localUri) {
      throw new Error(`Asset ${staged} has no localUri after downloadAsync`);
    }
    await FileSystem.copyAsync({ from: asset.localUri, to: dest });
  }

  return dir;
}
