const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Help Metro resolve react-native-worklets subpaths
config.resolver.extraNodeModules = {
  'react-native-worklets/plugin': path.resolve(__dirname, 'node_modules/react-native-worklets/plugin'),
};

// Bundle Pyodide + CodeMirror assets shipped under assets/practice/.
// '.bin' is used for files that would otherwise collide with Metro source
// extensions (.js/.json); see scripts/build-practice-assets.js.
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'wasm',
  'zip',
  'bin',
];

module.exports = config;
