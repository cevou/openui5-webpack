'use strict';

const OpenUI5Plugin = require('../../../src/OpenUI5Plugin');

module.exports = {
  entry: {
    build: './index.js',
  },
  plugins: [
    new OpenUI5Plugin({
      requireSync: ["./a"],
    }),
  ],
  resolve: {
    modules: [
      __dirname
    ],
  },
  optimization: {
    minimize: false,
    runtimeChunk: 'single',
  },
  mode: 'production'
};
