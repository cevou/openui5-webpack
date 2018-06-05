'use strict';

const OpenUI5Plugin = require('../../../src/OpenUI5Plugin');

module.exports = {
  entry: {
    build: './index.js',
  },
  module: {
    rules: [
      {
        test: /\.xml$/,
        use: 'xml-loader',
      },
    ],
  },
  plugins: [
    new OpenUI5Plugin({
      modulePath: "sap/ui/test",
    }),
  ],
  optimization: {
    minimize: false,
    runtimeChunk: 'single',
  },
  mode: 'production'
};
