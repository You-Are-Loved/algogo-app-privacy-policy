const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Help Metro resolve react-native-worklets subpaths
config.resolver.extraNodeModules = {
  'react-native-worklets/plugin': path.resolve(__dirname, 'node_modules/react-native-worklets/plugin'),
};

module.exports = config;
