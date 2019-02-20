'use strict';

const path = require('path');
const OpenUI5Plugin = require('../../../src/OpenUI5Plugin');

const appPath = path.resolve(__dirname, 'src');

module.exports = {
  context: appPath,
  entry: {
    build: './index.js',
  },
  resolve: {
    "modules": [
      "library1",
      "library2"
    ]
  },
  plugins: [
    new OpenUI5Plugin({
      modulePath: 'sap/ui/test',
      libs: ['sap.ui.core', 'sap.m'],
      translations: ['en']
    }),
  ],
  optimization: {
    minimize: false,
    runtimeChunk: 'single',
  },
  mode: 'production'
};
